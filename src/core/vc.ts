import canonicalize from 'canonicalize';
import {
    initWasm,
    ed25519GenerateKeyPair,
    ed25519Sign,
    ed25519Verify,
    p256Verify,
    mlDsa44GenerateKeyPair,
    mlDsa44Sign,
    mlDsa44Verify
} from "./wasm_core";
import { encode, decode } from 'cbor-x';
import crypto from 'node:crypto';
import {
    base64UrlToBytes,
    bytesToHex,
    bytesToMultibaseBase58btc,
    decodeMultibaseBase58btc,
    hexToBytes
} from './encoding';
import {
    collectVerificationMethods,
    decodeDidKey,
    decodeMulticodec,
    encodeDidKey,
    encodePqcPublicKeyJwk,
    extractPublicKeyBytes
} from './did';
import type { DidDocument, DidResolver } from './did';
const EDDSA_JCS_2022 = 'eddsa-jcs-2022';
const ML_DSA_44_JCS_2025 = 'ml-dsa-44-jcs-2025';
const COSE_ALG_EDDSA = -8; // COSE Algorithms: EdDSA
const COSE_ALG_ML_DSA_44 = -48; // draft-ietf-cose-mldsa-00: ML-DSA-44

const COSE_HEADER_ALG = 1;
const COSE_HEADER_CRIT = 2;
const COSE_HEADER_KID = 4;

const textEncoder = new TextEncoder();

function createCoseSigStructure(
    bodyProtected: Uint8Array,
    signatureProtected: Uint8Array,
    payload: Uint8Array
): Uint8Array {
    return encode([
        "Signature",
        bodyProtected,
        signatureProtected,
        new Uint8Array(0),
        payload
    ]);
}

function createCoseKid(value: string): Uint8Array {
    return textEncoder.encode(value);
}

function decodeProofValue(value: string): Uint8Array {
    if (value.startsWith('z')) {
        return decodeMultibaseBase58btc(value);
    }
    if (/^[0-9a-fA-F]+$/.test(value)) {
        return hexToBytes(value);
    }
    throw new Error(`Unsupported proofValue encoding: ${value}`);
}

type VerificationKeyInput = string | Uint8Array | Record<string, unknown>;

async function resolveVerificationMethodKey(
    verificationMethod: string,
    options: {
        trustedKeys?: Record<string, VerificationKeyInput>;
        didResolver?: DidResolver;
        didDocument?: DidDocument;
        didDocuments?: Record<string, DidDocument>;
    }
): Promise<Uint8Array | null> {
    const vm = verificationMethod;
    const trustedValue = options.trustedKeys?.[vm] || options.trustedKeys?.[vm.split('#')[0]!];
    if (trustedValue) {
        if (trustedValue instanceof Uint8Array) return trustedValue;
        if (typeof trustedValue === 'object') {
            return extractPublicKeyBytes({ id: 'trusted', publicKeyJwk: trustedValue });
        }
        if (trustedValue.startsWith('z')) return decodeMultibaseBase58btc(trustedValue);
        if (/^[0-9a-fA-F]+$/.test(trustedValue)) return hexToBytes(trustedValue);
        return base64UrlToBytes(trustedValue);
    }

    // Move did:key check below since it might have fragments

    const baseDid = vm.includes('#') ? (vm.split('#')[0] || '') : vm;
    const doc = options.didDocument
        ?? (options.didDocuments && baseDid ? options.didDocuments[baseDid] : undefined)
        ?? (options.didResolver && baseDid ? await options.didResolver(baseDid) : null);
    if (doc) {
        const methods = collectVerificationMethods(doc);
        const method = methods.get(vm)
            ?? (vm.includes('#') ? methods.get(`${baseDid}#${vm.split('#')[1]}`) : undefined)
            ?? (methods.size === 1 ? Array.from(methods.values())[0] : undefined);
        if (method) {
            return extractPublicKeyBytes(method);
        }
    }

    if (vm.includes('#')) {
        const fragment = vm.split('#')[1] || '';
        const cleaned = fragment.replace(/-(ed25519|pqc|p256)$/i, '');
        if (cleaned.startsWith('z')) {
            const raw = decodeMultibaseBase58btc(cleaned);
            try {
                const { data } = decodeMulticodec(raw);
                return data;
            } catch {
                return raw;
            }
        }
        if (/^[0-9a-fA-F]+$/.test(cleaned) && (cleaned.length === 64 || cleaned.length > 2000)) {
            return hexToBytes(cleaned);
        }
    }

    if (vm.startsWith('did:key:')) {
        const decoded = decodeDidKey(vm);
        return decoded.publicKey;
    }

    return null;
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
    keys: { ed25519: { publicKey: string; privateKey: string; }; pqc?: { publicKey: string; privateKey: string; }; },
    issuerDid?: string,
    buildId?: string,
    proofOptions: HybridProofOptions = {}
): Promise<object> {
    const issuer = issuerDid || encodeDidKey(hexToBytes(keys.ed25519.publicKey), 'ed25519');
    const created = proofOptions.created || new Date().toISOString();
    const proofPurpose = proofOptions.proofPurpose || 'assertionMethod';

    // 2. Prepare Payload
    const issuanceDate = (document as any).issuanceDate || new Date().toISOString();
    const vcPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential"],
        "issuer": issuer,
        "issuanceDate": issuanceDate,
        ...document
    };

    // Canonicalize document (RFC 8785 JSON Canonicalization Scheme)
    const jsonString = canonicalize(vcPayload);
    if (!jsonString) throw new Error("Canonicalization failed");

    const payloadBytes = new TextEncoder().encode(jsonString);

    // 3. Signing
    await initWasm();
    const proofs: any[] = [];

    // Sign with Ed25519
    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const edSig = ed25519Sign(edPrivBytes, payloadBytes);

    const didKeyFragment = issuer.startsWith('did:key:') ? issuer.split(':')[2] : null;
    const idSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.ed25519.publicKey);

    proofs.push({
        "type": "DataIntegrityProof",
        "cryptosuite": EDDSA_JCS_2022,
        "verificationMethod": didKeyFragment
            ? `${issuer}#${didKeyFragment}`
            : `${issuer}#${idSuffix}-ed25519`,
        "proofPurpose": proofPurpose,
        "created": created,
        ...(proofOptions.domain ? { "domain": proofOptions.domain } : {}),
        ...(proofOptions.challenge ? { "challenge": proofOptions.challenge } : {}),
        "proofValue": bytesToMultibaseBase58btc(edSig)
    });

    // Sign with PQC (if available)
    if (keys.pqc) {
        const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
        const pqcSig = mlDsa44Sign(pqcPrivBytes, payloadBytes);
        const pqcIdSuffix = buildId ? buildId : (issuerDid ? 'root' : keys.pqc.publicKey);

        proofs.push({
            "type": "DataIntegrityProof",
            "cryptosuite": ML_DSA_44_JCS_2025,
            "verificationMethod": `${issuer}#${pqcIdSuffix}-pqc`,
            "proofPurpose": proofPurpose,
            "created": created,
            ...(proofOptions.domain ? { "domain": proofOptions.domain } : {}),
            ...(proofOptions.challenge ? { "challenge": proofOptions.challenge } : {}),
            "proofValue": bytesToMultibaseBase58btc(pqcSig)
        });
    }

    const vc = {
        ...vcPayload,
        "issuer": issuer,
        "proof": proofs
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
        trustedKeys?: Record<string, VerificationKeyInput>;
        didResolver?: DidResolver;
        didDocument?: DidDocument;
        didDocuments?: Record<string, DidDocument>;
        expectedDomain?: string;
        expectedChallenge?: string;
        requireCreated?: boolean;
        allowLegacyProofs?: boolean;
        replayGuard?: (nonce: string, threadId?: string) => Promise<boolean>;
    } = {}
): Promise<VerificationResult> {
    try {
        // Enforce Replay Guard if provided (Security Audit v3 Requirement)
        if (options.replayGuard) {
            const nonce = vc.credentialSubject?.nonce || vc.nonce;
            const threadId = vc.credentialSubject?.threadId || vc.threadId;
            if (nonce || threadId) {
                const isFresh = await options.replayGuard(nonce || "", threadId);
                if (!isFresh) {
                    throw new Error(`Replay detected: nonce="${nonce}", threadId="${threadId}" already processed.`);
                }
            }
        }

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
            const pubKeyBytes = await resolveVerificationMethodKey(vm, options);

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
            if (pubKeyBytes && proofValue) {
                const sigBytes = decodeProofValue(proofValue);
                await initWasm();
                checks.ed25519 = ed25519Verify(pubKeyBytes, payloadBytes, sigBytes);
            }
        }

        // 3.1 Verify P-256 (PassKey)
        if (p256Proof) {
            const vm = p256Proof.verificationMethod || "";
            const pubKeyBytes = await resolveVerificationMethodKey(vm, options);

            const sigValue = p256Proof.proofValue;

            if (pubKeyBytes && sigValue) {
                const sigBytes = decodeProofValue(sigValue);
                try {
                    checks.p256 = p256Verify(pubKeyBytes, payloadBytes, sigBytes);
                } catch (e) {
                    console.error("P-256 verification error:", e);
                }
            }
        }

        // 4. Verify PQC (ML-DSA)
        if (pqcProof) {
            const vm = pqcProof.verificationMethod || "";
            const pubKeyBytes = await resolveVerificationMethodKey(vm, options);

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

            if (pubKeyBytes && sigValue && pubKeyBytes.length > 100) {
                const sigBytes = decodeProofValue(sigValue);
                await initWasm();
                checks.pqc = mlDsa44Verify(pubKeyBytes, payloadBytes, sigBytes);
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
        "issuer": issuerDid || encodeDidKey(hexToBytes(rootKeys.ed25519.publicKey), 'ed25519'),
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": subjects
    };

    // We reuse createHybridVC for signing, passing the payload (which overrides defaults)
    return createHybridVC(vcPayload, rootKeys, issuerDid);
}

/**
 * Creates a binary VC (CBOR) protected by COSE_Sign.
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

    // 2. Sign with Hybrid Keys (COSE_Signature entries)
    await initWasm();
    const pqcPrivBytes = Uint8Array.from(Buffer.from(keys.pqc.privateKey, 'hex'));
    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));

    const idSuffix = buildId ? buildId : 'root';
    const bodyProtected = encode(new Map());
    const bodyUnprotected = new Map();

    const edKid = createCoseKid(`${issuerDid}#${idSuffix}-ed25519`);
    const pqcKid = createCoseKid(`${issuerDid}#${idSuffix}-mldsa44`);

    const edProtected = encode(new Map<number, any>([
        [COSE_HEADER_ALG, COSE_ALG_EDDSA],
        [COSE_HEADER_KID, edKid]
    ]));
    const pqcProtected = encode(new Map<number, any>([
        [COSE_HEADER_ALG, COSE_ALG_ML_DSA_44],
        [COSE_HEADER_KID, pqcKid]
    ]));

    const edSigStructure = createCoseSigStructure(bodyProtected, edProtected, payloadBytes);
    const pqcSigStructure = createCoseSigStructure(bodyProtected, pqcProtected, payloadBytes);

    const edSig = ed25519Sign(edPrivBytes, edSigStructure);
    const pqcSig = mlDsa44Sign(pqcPrivBytes, pqcSigStructure);

    // 3. Construct COSE_Sign structure
    // [protected, unprotected, payload, signatures]
    const coseStructure = [
        bodyProtected,
        bodyUnprotected,
        payloadBytes,
        [
            [edProtected, new Map(), edSig],
            [pqcProtected, new Map(), pqcSig]
        ]
    ];

    const finalCbor = encode(coseStructure);

    // Base64URL for HTML embedding
    const b64 = Buffer.from(finalCbor).toString('base64url');

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
    const edPrivBytes = Uint8Array.from(Buffer.from(keys.ed25519.privateKey, 'hex'));
    const idSuffix = buildId ? buildId : 'root';
    const bodyProtected = encode(new Map<any, any>([
        [COSE_HEADER_CRIT, ['sd']],
        ['sd', true]
    ]));
    const bodyUnprotected = new Map();

    const edKid = createCoseKid(`${issuerDid}#${idSuffix}-ed25519`);
    const pqcKid = createCoseKid(`${issuerDid}#${idSuffix}-mldsa44`);

    const edProtected = encode(new Map<number, any>([
        [COSE_HEADER_ALG, COSE_ALG_EDDSA],
        [COSE_HEADER_KID, edKid]
    ]));
    const pqcProtected = encode(new Map<number, any>([
        [COSE_HEADER_ALG, COSE_ALG_ML_DSA_44],
        [COSE_HEADER_KID, pqcKid]
    ]));

    const edSigStructure = createCoseSigStructure(bodyProtected, edProtected, payloadBytes);
    const pqcSigStructure = createCoseSigStructure(bodyProtected, pqcProtected, payloadBytes);

    const edSig = ed25519Sign(edPrivBytes, edSigStructure);
    const pqcSig = mlDsa44Sign(pqcPrivBytes, pqcSigStructure);

    const coseStructure = [
        bodyProtected,
        bodyUnprotected,
        payloadBytes,
        [
            [edProtected, new Map(), edSig],
            [pqcProtected, new Map(), pqcSig]
        ]
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
            "id": encodeDidKey(hexToBytes(buildKeys.ed25519.publicKey), 'ed25519'),
            "publicKeyEd25519": buildKeys.ed25519.publicKey,
            "publicKeyPqcJwk": encodePqcPublicKeyJwk(hexToBytes(buildKeys.pqc.publicKey))
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
    rootPqcPublicKey?: VerificationKeyInput
): Promise<VerificationResult> {
    const trustedKeys: Record<string, VerificationKeyInput> = {};
    if (rootPublicKeyHex) trustedKeys['root'] = rootPublicKeyHex;
    // We can also map specific DIDs if we want
    const rootDid = delegateCert.issuer;
    trustedKeys[`${rootDid}#root-ed25519`] = rootPublicKeyHex;
    if (rootPqcPublicKey) trustedKeys[`${rootDid}#root-pqc`] = rootPqcPublicKey;

    // 2. Ensure it's the correct root
    // For PoC: if certResult.isValid is true, it means it was signed by the key we provided in trustedKeys.
    // We just check if the issuer matches the DID we expect (if provided).
    const certResult = await verifyHybridVC(delegateCert, { trustedKeys });
    if (!certResult.isValid) return certResult;

    // 3. Extract Build Keys from Certificate
    const buildKeys = {
        ed25519: delegateCert.credentialSubject.publicKeyEd25519,
        pqc: delegateCert.credentialSubject.publicKeyPqcJwk
    };

    // 4. Verify the Document VC (Signed by Delegate)
    const vcTrustedKeys: Record<string, string> = {};
    const vcIssuer = vc.issuer;
    vcTrustedKeys[`${vcIssuer}#root-ed25519`] = buildKeys.ed25519;
    if (buildKeys.pqc) {
        vcTrustedKeys[`${vcIssuer}#root-pqc`] = buildKeys.pqc;
    }

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
