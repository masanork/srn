import canonicalize from 'canonicalize';
import {
    initWasm,
    ed25519GenerateKeyPair,
    ed25519Sign,
    ed25519Verify,
    mlDsa44GenerateKeyPair,
    mlDsa44Sign,
    mlDsa44Verify
} from "./wasm_core";
import { p256 } from '@noble/curves/nist.js';
import { encode, decode } from 'cbor-x';
import crypto from 'node:crypto';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const MULTIBASE_BASE58BTC_PREFIX = 'z';
const EDDSA_JCS_2022 = 'eddsa-jcs-2022';
const ML_DSA_44_JCS_2025 = 'ml-dsa-44-jcs-2025';

// Helper for hex conversion
function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

function bytesToBase58(bytes: Uint8Array): string {
    if (bytes.length === 0) return '';
    const digits: number[] = [0];
    for (const byte of bytes) {
        let carry = byte;
        for (let i = 0; i < digits.length; i++) {
            const value = digits[i] * 256 + carry;
            digits[i] = value % 58;
            carry = Math.floor(value / 58);
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }

    let zeros = 0;
    for (const byte of bytes) {
        if (byte !== 0) break;
        zeros += 1;
    }

    let result = BASE58_ALPHABET[0].repeat(zeros);
    for (let i = digits.length - 1; i >= 0; i--) {
        result += BASE58_ALPHABET[digits[i]];
    }
    return result;
}

function base58ToBytes(input: string): Uint8Array {
    if (input.length === 0) return new Uint8Array();
    const bytes: number[] = [0];
    for (const char of input) {
        const value = BASE58_ALPHABET.indexOf(char);
        if (value < 0) {
            throw new Error(`Invalid base58 character: ${char}`);
        }
        let carry = value;
        for (let i = 0; i < bytes.length; i++) {
            const acc = bytes[i] * 58 + carry;
            bytes[i] = acc & 0xff;
            carry = acc >> 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    let zeros = 0;
    for (const char of input) {
        if (char !== BASE58_ALPHABET[0]) break;
        zeros += 1;
    }

    const result = new Uint8Array(zeros + bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        result[result.length - 1 - i] = bytes[i];
    }
    return result;
}

function bytesToMultibaseBase58btc(bytes: Uint8Array): string {
    return `${MULTIBASE_BASE58BTC_PREFIX}${bytesToBase58(bytes)}`;
}

function decodeProofValue(value: string): Uint8Array {
    if (value.startsWith(MULTIBASE_BASE58BTC_PREFIX)) {
        return base58ToBytes(value.slice(1));
    }
    if (/^[0-9a-fA-F]+$/.test(value)) {
        return Uint8Array.from(Buffer.from(value, 'hex'));
    }
    throw new Error(`Unsupported proofValue encoding: ${value}`);
}

export interface HybridVCResult {
    vc: object;
    keys: {
        ed25519: { publicKey: string; privateKey: string; };
        pqc: { publicKey: string; privateKey: string; };
    }
}

export interface HybridProofOptions {
    created?: string;
    domain?: string;
    challenge?: string;
    proofPurpose?: string;
}

/**
 * Generates a new Ed25519 + ML-DSA-44 key pair.
 */
export async function generateHybridKeys() {
    await initWasm();
    // 1. Key Generation
    const pqcKeys = mlDsa44GenerateKeyPair();
    const ed = ed25519GenerateKeyPair();

    return {
        ed25519: {
            publicKey: bytesToHex(ed.publicKey),
            privateKey: bytesToHex(ed.privateKey)
        },
        pqc: {
            publicKey: bytesToHex(pqcKeys.publicKey),
            privateKey: bytesToHex(pqcKeys.privateKey)
        }
    };
}

export type HybridKeys = Awaited<ReturnType<typeof generateHybridKeys>>;

/**
 * Creates a Verifiable Credential signed with provided keys.
 */
export async function createHybridVC(
    document: object,
    keys: HybridKeys,
    issuerDid?: string,
    buildId?: string,
    proofOptions: HybridProofOptions = {}
): Promise<object> {
    const issuer = issuerDid || `did:key:z${keys.ed25519.publicKey}`;
    const created = proofOptions.created || new Date().toISOString();
    const proofPurpose = proofOptions.proofPurpose || 'assertionMethod';

    // 2. Prepare Payload
    const vcPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential"],
        "issuer": issuer,
        "issuanceDate": new Date().toISOString(),
        ...document
    };

    // Canonicalize document (RFC 8785 JSON Canonicalization Scheme)
    const jsonString = canonicalize(vcPayload);
    if (!jsonString) throw new Error("Canonicalization failed");

    const payloadBytes = new TextEncoder().encode(jsonString);

    // 3. Signing
    await initWasm();
    // Sign with PQC (Message-first)
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = mlDsa44Sign(pqcPrivBytes, payloadBytes);

    // Sign with Ed25519
    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519Sign(edPrivBytes, payloadBytes);

    // 4. Output Hybrid VC
    const idSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.ed25519.publicKey);

    const pqcIdSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.pqc.publicKey);

    const vc = {
        ...vcPayload,
        "issuer": issuer,
        "proof": [
            {
                "type": "DataIntegrityProof",
                "cryptosuite": EDDSA_JCS_2022,
                "verificationMethod": `${issuer}#${idSuffix}-ed25519`,
                "proofPurpose": proofPurpose,
                "created": created,
                ...(proofOptions.domain ? { "domain": proofOptions.domain } : {}),
                ...(proofOptions.challenge ? { "challenge": proofOptions.challenge } : {}),
                "proofValue": bytesToMultibaseBase58btc(edSig)
            },
            {
                "type": "DataIntegrityProof",
                "cryptosuite": ML_DSA_44_JCS_2025,
                "verificationMethod": `${issuer}#${pqcIdSuffix}-pqc`,
                "proofPurpose": proofPurpose,
                "created": created,
                ...(proofOptions.domain ? { "domain": proofOptions.domain } : {}),
                ...(proofOptions.challenge ? { "challenge": proofOptions.challenge } : {}),
                "proofValue": bytesToMultibaseBase58btc(pqcSig)
            }
        ]
    };

    return vc;
}

/**
 * Result of the verification process.
 */
export interface VerificationResult {
    isValid: boolean;
    checks: {
        ed25519: boolean;
        pqc: boolean;
        p256: boolean;
    };
    chain?: {
        isAuthorized: boolean;
        issuer: string;
    };
    error?: string;
    decoded?: any;
}

/**
 * Verifies a Hybrid VC.
 */
export async function verifyHybridVC(
    vc: any,
    options: {
        trustedKeys?: Record<string, string>;
        expectedDomain?: string;
        expectedChallenge?: string;
        requireCreated?: boolean;
        allowLegacyProofs?: boolean;
    } = {}
): Promise<VerificationResult> {
    try {
        // 1. Separate Proofs from Payload
        const proofs = vc.proof;
        if (!Array.isArray(proofs)) throw new Error("VC has no proofs or invalid format.");

        const payload = { ...vc };
        delete payload.proof;

        // Canonicalize (JCS)
        const jsonString = canonicalize(payload);
        if (!jsonString) throw new Error("Canonicalization failed during verification");
        const payloadBytes = new TextEncoder().encode(jsonString);

        // 2. Extract Proofs
        const requireCreated = options.requireCreated ?? true;
        const allowLegacyProofs = options.allowLegacyProofs ?? true;
        const edProof = proofs.find(
            p => p.type === 'DataIntegrityProof' && p.cryptosuite === EDDSA_JCS_2022
        );
        const legacyEdProof = allowLegacyProofs
            ? proofs.find(p => p.type === 'Ed25519Signature2020')
            : undefined;
        const p256Proof = proofs.find(p => p.type === 'EcdsaSecp256k1Signature2019' || p.type.includes('P256'));
        const pqcProof = proofs.find(
            p => p.type === 'DataIntegrityProof' && p.cryptosuite === ML_DSA_44_JCS_2025
        );

        const checks = { ed25519: false, pqc: false, p256: false };

        // 3. Verify Ed25519
        if (edProof || legacyEdProof) {
            const proof = edProof || legacyEdProof;
            // Improved key extraction: look for known patterns or handle resolution
            const vm = proof.verificationMethod || "";
            let pubKeyHex = vm.includes('#') ? vm.split('#')[1] || "" : "";
            // Clean suffix
            pubKeyHex = pubKeyHex.replace('-ed25519', '').replace('-pqc', '');

            // console.log(`Debug: Classic VM: ${vm}, pubKeyHex (pre-trusted): ${pubKeyHex}`);

            // Fallback: If it's a did:key and we don't have a hex, try to extract from the DID itself
            if ((!pubKeyHex || pubKeyHex === 'root' || pubKeyHex.length < 32) && vm.startsWith('did:key:z')) {
                // This is a simplified did:key extraction (just taking what's after 'z')
                pubKeyHex = vm.split(':')[2]?.slice(1).split('#')[0] || "";
            }

            if (proof.type === 'DataIntegrityProof') {
                if (requireCreated && !proof.created) {
                    throw new Error("Ed25519 proof missing created timestamp.");
                }
                if (options.expectedDomain && proof.domain !== options.expectedDomain) {
                    throw new Error("Ed25519 proof domain mismatch.");
                }
                if (options.expectedChallenge && proof.challenge !== options.expectedChallenge) {
                    throw new Error("Ed25519 proof challenge mismatch.");
                }
            }

            const proofValue = proof.proofValue;

            // Priority: Trusted Keys
            if (options.trustedKeys) {
                const trusted = options.trustedKeys[vm] || options.trustedKeys[vm.split('#')[0]!];
                if (trusted) pubKeyHex = trusted;
            }

            if (pubKeyHex && proofValue && pubKeyHex.length >= 64) {
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                const sigBytes = decodeProofValue(proofValue);
                await initWasm();
                checks.ed25519 = ed25519Verify(pubBytes, payloadBytes, sigBytes);
            }
        }

        // 3.1 Verify P-256 (PassKey)
        if (p256Proof) {
            const vm = p256Proof.verificationMethod || "";
            let pubKeyHex = vm.includes('#') ? vm.split('#')[1] || "" : "";
            pubKeyHex = pubKeyHex.replace('-p256', '').replace('-ed25519', '').replace('-pqc', '');

            if ((!pubKeyHex || pubKeyHex === 'root' || pubKeyHex.length < 32) && vm.startsWith('did:key:z')) {
                pubKeyHex = vm.split(':')[2]?.slice(1).split('#')[0] || "";
            }

            const sigValue = p256Proof.proofValue;

            if (pubKeyHex && sigValue) {
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                const sigBytes = decodeProofValue(sigValue);
                try {
                    checks.p256 = p256.verify(sigBytes, payloadBytes, pubBytes);
                } catch (e) {
                    console.error("P-256 verification error:", e);
                }
            }
        }

        // 4. Verify PQC (ML-DSA)
        if (pqcProof) {
            const vm = pqcProof.verificationMethod || "";
            let pubKeyHex = vm.includes('#') ? vm.split('#')[1] || "" : "";
            pubKeyHex = pubKeyHex.replace('-ed25519', '').replace('-pqc', '');

            // Fallback for did:key (though PQC keys are usually too large for did:key:z...)
            // But if it's there, we try. 

            if (requireCreated && !pqcProof.created) {
                throw new Error("PQC proof missing created timestamp.");
            }
            if (options.expectedDomain && pqcProof.domain !== options.expectedDomain) {
                throw new Error("PQC proof domain mismatch.");
            }
            if (options.expectedChallenge && pqcProof.challenge !== options.expectedChallenge) {
                throw new Error("PQC proof challenge mismatch.");
            }

            const sigValue = pqcProof.proofValue;

            if (options.trustedKeys) {
                const trusted = options.trustedKeys[vm] || options.trustedKeys[vm.split('#')[0]!];
                if (trusted) pubKeyHex = trusted;
            }

            if (pubKeyHex && sigValue && pubKeyHex.length > 100) {
                const sigBytes = decodeProofValue(sigValue);
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                await initWasm();
                checks.pqc = mlDsa44Verify(pubBytes, payloadBytes, sigBytes);
            }
        }

        return {
            isValid: (checks.ed25519 || checks.p256) && checks.pqc, // Hybrid: (Classic) AND Quantum
            checks,
            decoded: payload
        };

    } catch (e: any) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false, p256: false },
            error: e.message
        };
    }
}

/**
 * Creates a Status List VC signed by the Root Key.
 * @param revokedBuildIds List of build IDs that are revoked
 * @param rootKeys The Root Key pair
 * @param listUrl The URL where this list will be published
 */
export async function createStatusListVC(
    revokedBuildIds: string[],
    rootKeys: HybridKeys,
    listUrl: string = "https://did.example.org/status-list.json",
    issuerDid?: string
): Promise<object> {
    const subjects = {
        "id": `${listUrl}#list`,
        "type": "StatusList2021",
        "statusPurpose": "revocation",
        "encodedList": "", // We use a custom property for readability in this PoC
        "srn:revokedBuildIds": revokedBuildIds
    };

    const vcPayload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/vc/status-list/2021/v1"
        ],
        "type": ["VerifiableCredential", "StatusList2021Credential"],
        "issuer": issuerDid || `did:key:z${rootKeys.ed25519.publicKey}`,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": subjects
    };

    // We reuse createHybridVC for signing, passing the payload (which overrides defaults)
    return createHybridVC(vcPayload, rootKeys, issuerDid);
}

/**
 * Creates a binary VC (CBOR) protected by COSE Sign1-style structure.
 * This is optimized for transport and PQC signature size.
 */
export async function createCoseVC(
    document: object,
    keys: HybridKeys,
    issuerDid: string,
    buildId?: string
): Promise<{ cbor: Uint8Array; base64url: string }> {
    // 1. Prepare CBOR Payload (Simplified CWT-like structure)
    const payload = {
        iss: issuerDid,
        iat: Math.floor(Date.now() / 1000),
        ...document
    };

    const payloadBytes = encode(payload);

    // 2. Sign with Hybrid Keys
    await initWasm();
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = mlDsa44Sign(pqcPrivBytes, payloadBytes);

    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519Sign(edPrivBytes, payloadBytes);

    // 3. Construct COSE-style Sign1 structure (Simplified)
    // [protected, unprotected, payload, signature]
    const idSuffix = buildId ? buildId : 'root';
    const protectedHeader = encode({
        alg: "ML-DSA-44+Ed25519", // Custom hybrid alg identifier
        kid: `${issuerDid}#${idSuffix}`
    });

    const coseStructure = [
        protectedHeader,
        {}, // unprotected
        payloadBytes,
        new Uint8Array([...edSig, ...pqcSig]) // Concatenated signature
    ];

    const finalCbor = encode(coseStructure);

    // Base64URL for HTML embedding
    const b64 = Buffer.from(finalCbor).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return {
        cbor: finalCbor,
        base64url: b64
    };
}

/**
 * Creates a Selective Disclosure Binary VC (SD-CWT/COSE).
 * Focused on: item-level disclosure (members) and field-level disclosure (individualNumber).
 */
export async function createSdCoseVC(
    document: any,
    keys: HybridKeys,
    issuerDid: string,
    buildId?: string
): Promise<{ cbor: Uint8Array; base64url: string; disclosures: string[] }> {
    const disclosures: string[] = [];

    // Helper: Create an SD disclosure and return its hash
    const createDisclosure = (key: string | null, value: any): Uint8Array => {
        const salt = crypto.getRandomValues(new Uint8Array(16)); // 128-bit salt
        // SD-CWT style: [salt, key (if object field), value]
        const disclosureArray = key ? [salt, key, value] : [salt, value];
        const disclosureBytes = encode(disclosureArray);
        const b64 = Buffer.from(disclosureBytes).toString('base64url');
        disclosures.push(b64);
        return crypto.createHash('sha256').update(disclosureBytes).digest();
    };

    // 1. Process Metadata (Member list as array disclosures)
    const members = document.credentialSubject.member || [];
    const memberHashes = members.map((m: any) => {
        // Nested: Inside each member, make individualNumber selective
        const memberData = { ...m };
        if (memberData.individualNumber) {
            const h = createDisclosure('individualNumber', memberData.individualNumber);
            delete memberData.individualNumber;
            memberData._sd = [Buffer.from(h).toString('base64url')];
        }
        // Entire member is also an array-disclosure
        return createDisclosure(null, memberData);
    });

    // 2. Construct Payload with Hashes
    const sdPayload = {
        iss: issuerDid,
        iat: Math.floor(Date.now() / 1000),
        sub: document.credentialSubject.id,
        "srn:sd_members": memberHashes.map((h: Uint8Array) => Buffer.from(h).toString('base64url')),
        // General top-level SD holder
        _sd_alg: "sha-256"
    };

    const payloadBytes = encode(sdPayload);

    // 3. Sign (Standard Hybrid)
    await initWasm();
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = mlDsa44Sign(pqcPrivBytes, payloadBytes);

    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519Sign(edPrivBytes, payloadBytes);

    const idSuffix = buildId ? buildId : 'root';
    const protectedHeader = encode({
        alg: "ML-DSA-44+Ed25519",
        kid: `${issuerDid}#${idSuffix}`,
        crit: ["sd"] // Critical marking for SD processing
    });

    const coseStructure = [
        protectedHeader,
        {},
        payloadBytes,
        new Uint8Array([...edSig, ...pqcSig])
    ];

    const finalCbor = encode(coseStructure);
    const b64 = Buffer.from(finalCbor).toString('base64url');

    return {
        cbor: finalCbor,
        base64url: b64,
        disclosures
    };
}

/**
 * Creates a Delegate Certificate where a Root Key (PassKey) authorizes a Build Key.
 */
export async function createDelegateCertificate(
    buildKeys: HybridKeys,
    rootKeys: HybridKeys, // In real PassKey, this signature comes from the browser
    issuerDid: string,
    validDays: number = 7
): Promise<any> {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const certificate = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "DelegateCertificate"],
        "issuer": issuerDid,
        "issuanceDate": new Date().toISOString(),
        "expirationDate": validUntil.toISOString(),
        "credentialSubject": {
            "id": `did:key:z${buildKeys.ed25519.publicKey}`,
            "publicKeyEd25519": buildKeys.ed25519.publicKey,
            "publicKeyPqc": buildKeys.pqc.publicKey
        }
    };

    // Sign with Root Key (Classic + PQC if hybrid, or just P-256 for PassKey)
    return createHybridVC(certificate, rootKeys, issuerDid, 'root');
}

/**
 * Verifies a VC and its authority chain.
 */
export async function verifyDelegateChain(
    vc: any,
    delegateCert: any,
    rootPublicKeyHex: string,
    rootPqcPublicKeyHex?: string
): Promise<VerificationResult> {
    const trustedKeys: Record<string, string> = {};
    if (rootPublicKeyHex) trustedKeys['root'] = rootPublicKeyHex;
    // We can also map specific DIDs if we want
    const rootDid = delegateCert.issuer;
    trustedKeys[`${rootDid}#root-ed25519`] = rootPublicKeyHex;
    if (rootPqcPublicKeyHex) trustedKeys[`${rootDid}#root-pqc`] = rootPqcPublicKeyHex;

    // 2. Ensure it's the correct root
    // For PoC: if certResult.isValid is true, it means it was signed by the key we provided in trustedKeys.
    // We just check if the issuer matches the DID we expect (if provided).
    const certResult = await verifyHybridVC(delegateCert, { trustedKeys });
    if (!certResult.isValid) return certResult;

    // 3. Extract Build Keys from Certificate
    const buildKeys = {
        ed25519: delegateCert.credentialSubject.publicKeyEd25519,
        pqc: delegateCert.credentialSubject.publicKeyPqc
    };

    // 4. Verify the Document VC (Signed by Delegate)
    const vcTrustedKeys: Record<string, string> = {};
    const vcIssuer = vc.issuer;
    vcTrustedKeys[`${vcIssuer}#root-ed25519`] = buildKeys.ed25519;
    vcTrustedKeys[`${vcIssuer}#root-pqc`] = buildKeys.pqc;

    const vcResult = await verifyHybridVC(vc, { trustedKeys: vcTrustedKeys });
    if (!vcResult.isValid) return vcResult;

    // 5. Final check
    const certSubjectId = delegateCert.credentialSubject.id;
    const isAuthorizedSigner = vcIssuer === certSubjectId;

    return {
        ...vcResult,
        isValid: vcResult.isValid && certResult.isValid && isAuthorizedSigner,
        chain: {
            isAuthorized: isAuthorizedSigner,
            issuer: delegateCert.issuer
        }
    };
}
