import canonicalize from 'canonicalize';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa.js';
import { ed25519 } from '@noble/curves/ed25519.js';

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
export async function createHybridVC(document: object, keys: HybridKeys): Promise<object> {
    // 2. Prepare Payload
    // Ensure standard VC properties exist or merge them
    const vcPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential"],
        "issuer": "did:key:zUnknown...",
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
    const issuerDid = `did:key:z${keys.ed25519.publicKey}`; // Simplified DID (not real multibase)

    const vc = {
        ...vcPayload,
        "issuer": issuerDid,
        "proof": [
            {
                "type": "Ed25519Signature2020",
                "verificationMethod": `${issuerDid}#${keys.ed25519.publicKey}`,
                "proofPurpose": "assertionMethod",
                "proofValue": bytesToHex(edSig)
            },
            {
                "type": "DataIntegrityProof",
                "cryptosuite": "ml-dsa-44-2025",
                "verificationMethod": `did:key:zPQC${keys.pqc.publicKey}#${keys.pqc.publicKey}`,
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
    };
    error?: string;
    decoded?: any;
}

/**
 * Verifies a Hybrid VC.
 * Notes:
 * - Allows simplified canonicalization (JSON.stringify) matching the styling process.
 * - Extracts keys directly from verificationMethod (simplified DID resolution).
 */
export async function verifyHybridVC(vc: any): Promise<VerificationResult> {
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
        const pqcProof = proofs.find(p => p.cryptosuite === 'ml-dsa-44-2025');

        const checks = { ed25519: false, pqc: false };

        // 3. Verify Ed25519
        if (edProof) {
            // Extract key from "did:key:z<PUBKEY>#<PUBKEY>" or just "#<PUBKEY>"
            // Simplified: Expecting hex string in verificationMethod fragment
            const vm = edProof.verificationMethod || "";
            const pubKeyHex = vm.split('#')[1];
            const sigHex = edProof.proofValue;

            if (pubKeyHex && sigHex) {
                checks.ed25519 = ed25519.verify(sigHex, payloadBytes, pubKeyHex);
            }
        }

        // 4. Verify PQC (ML-DSA)
        if (pqcProof) {
            const vm = pqcProof.verificationMethod || "";
            const pubKeyHex = vm.split('#')[1];
            const sigHex = pqcProof.proofValue;

            if (pubKeyHex && sigHex) {
                // ml_dsa44.verify(signature, message, publicKey)
                const sigBytes = Uint8Array.from(Buffer.from(sigHex, 'hex'));
                const pubBytes = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));
                checks.pqc = ml_dsa44.verify(sigBytes, payloadBytes, pubBytes);
            }
        }

        return {
            isValid: checks.ed25519 && checks.pqc, // Strict: Both must be valid
            checks,
            decoded: payload
        };

    } catch (e: any) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false },
            error: e.message
        };
    }
}
