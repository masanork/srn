import canonicalize from 'canonicalize';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { p256 } from '@noble/curves/nist.js';
import { encode, decode } from 'cbor-x';
import crypto from 'node:crypto';

// Helper for hex conversion
function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

export interface HybridVCResult {
    vc: object;
    keys: {
        ed25519: { publicKey: string; privateKey: string; };
        pqc: { publicKey: string; privateKey: string; };
    }
}

/**
 * Generates a new Ed25519 + ML-DSA-44 key pair.
 */
export function generateHybridKeys() {
    // 1. Key Generation
    const pqcKeys = ml_dsa44.keygen();
    const edPriv = ed25519.utils.randomSecretKey();
    const edPub = ed25519.getPublicKey(edPriv);

    return {
        ed25519: {
            publicKey: bytesToHex(edPub),
            privateKey: bytesToHex(edPriv)
        },
        pqc: {
            publicKey: bytesToHex(pqcKeys.publicKey),
            privateKey: bytesToHex(pqcKeys.secretKey)
        }
    };
}

export type HybridKeys = ReturnType<typeof generateHybridKeys>;

/**
 * Creates a Verifiable Credential signed with provided keys.
 */
export async function createHybridVC(
    document: object,
    keys: HybridKeys,
    issuerDid?: string,
    buildId?: string
): Promise<object> {
    const issuer = issuerDid || `did:key:z${keys.ed25519.publicKey}`;

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
    // Sign with PQC (Message-first)
    // 3. Signing
    // Sign with PQC (Message-first)
    // Convert hex private key back to Uint8Array for signing
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = ml_dsa44.sign(payloadBytes, pqcPrivBytes);

    // Sign with Ed25519
    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519.sign(payloadBytes, edPrivBytes);

    // 4. Output Hybrid VC
    const idSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.ed25519.publicKey);

    const pqcIdSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.pqc.publicKey);

    const vc = {
        ...vcPayload,
        "issuer": issuer,
        "proof": [
            {
                "type": "Ed25519Signature2020",
                "verificationMethod": `${issuer}#${idSuffix}-ed25519`,
                "proofPurpose": "assertionMethod",
                "proofValue": bytesToHex(edSig)
            },
            {
                "type": "DataIntegrityProof",
                "cryptosuite": "ml-dsa-44-2025",
                "verificationMethod": `${issuer}#${pqcIdSuffix}-pqc`,
                "proofPurpose": "assertionMethod",
                "proofValue": bytesToHex(pqcSig)
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
    options: { trustedKeys?: Record<string, string> } = {}
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
        const edProof = proofs.find(p => p.type === 'Ed25519Signature2020');
        const p256Proof = proofs.find(p => p.type === 'EcdsaSecp256k1Signature2019' || p.type.includes('P256'));
        const pqcProof = proofs.find(p => p.cryptosuite === 'ml-dsa-44-2025');

        const checks = { ed25519: false, pqc: false, p256: false };

        // 3. Verify Ed25519
        if (edProof) {
            // Improved key extraction: look for known patterns or handle resolution
            const vm = edProof.verificationMethod || "";
            let pubKeyHex = vm.includes('#') ? vm.split('#')[1] || "" : "";
            // Clean suffix
            pubKeyHex = pubKeyHex.replace('-ed25519', '').replace('-pqc', '');

            // console.log(`Debug: Classic VM: ${vm}, pubKeyHex (pre-trusted): ${pubKeyHex}`);

            // Fallback: If it's a did:key and we don't have a hex, try to extract from the DID itself
            if ((!pubKeyHex || pubKeyHex === 'root' || pubKeyHex.length < 32) && vm.startsWith('did:key:z')) {
                // This is a simplified did:key extraction (just taking what's after 'z')
                pubKeyHex = vm.split(':')[2]?.slice(1).split('#')[0] || "";
            }

            const sigHex = edProof.proofValue;

            // If not in DID/suffix, check trustedKeys
            if ((!pubKeyHex || pubKeyHex === 'root') && options.trustedKeys) {
                pubKeyHex = options.trustedKeys[vm] || options.trustedKeys[vm.split('#')[0]!] || pubKeyHex;
                // console.log(`Debug: Classic pubKeyHex (post-trusted): ${pubKeyHex}`);
            }

            if (pubKeyHex && sigHex && pubKeyHex.length >= 64) {
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                const sigBytes = Uint8Array.from(Buffer.from(sigHex, 'hex'));
                checks.ed25519 = ed25519.verify(sigBytes, payloadBytes, pubBytes);
                // console.log(`Debug: Classic verification result: ${checks.ed25519}`);
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

            const sigHex = p256Proof.proofValue;

            if (pubKeyHex && sigHex) {
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                const sigBytes = Uint8Array.from(Buffer.from(sigHex, 'hex'));
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

            const sigHex = pqcProof.proofValue;

            if ((!pubKeyHex || pubKeyHex === 'root') && options.trustedKeys) {
                pubKeyHex = options.trustedKeys[vm] || options.trustedKeys[vm.split('#')[0]!] || pubKeyHex;
                // console.log(`Debug: PQC pubKeyHex (post-trusted): ${pubKeyHex.slice(0, 20)}...`);
            }

            if (pubKeyHex && sigHex && pubKeyHex.length > 100) {
                // ml_dsa44.verify(signature, message, publicKey)
                const sigBytes = Uint8Array.from(Buffer.from(sigHex, 'hex'));
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                checks.pqc = ml_dsa44.verify(sigBytes, payloadBytes, pubBytes);
                // console.log(`Debug: PQC verification result: ${checks.pqc}`);
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
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = ml_dsa44.sign(payloadBytes, pqcPrivBytes);

    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519.sign(payloadBytes, edPrivBytes);

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
        const salt = ed25519.utils.randomSecretKey().slice(0, 16); // 128-bit salt
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
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const pqcSig = ml_dsa44.sign(payloadBytes, pqcPrivBytes);

    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519.sign(payloadBytes, edPrivBytes);

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
