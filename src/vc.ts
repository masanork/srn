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
 * Creates a Verifiable Credential signed with both Ed25519 and ML-DSA-44 (Dilithium).
 * Generates new ephemeral keys for demonstration purposes.
 */
export async function createHybridVC(document: object): Promise<HybridVCResult> {
    // 1. Key Generation
    const pqcKeys = ml_dsa44.keygen();
    const edPriv = ed25519.utils.randomSecretKey();
    const edPub = ed25519.getPublicKey(edPriv);

    const keys = {
        ed25519: {
            publicKey: bytesToHex(edPub),
            privateKey: bytesToHex(edPriv) // Note: Be careful handling private keys in real apps
        },
        pqc: {
            publicKey: bytesToHex(pqcKeys.publicKey),
            privateKey: bytesToHex(pqcKeys.secretKey)
        }
    };

    // 2. Prepare Payload
    // Ensure standard VC properties exist or merge them
    const vcPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential"],
        "issuer": "did:key:zUnknown...",
        "issuanceDate": new Date().toISOString(),
        ...document
    };

    // Canonicalize document (Simplified: just stringify)
    // In production, use standard JSON-LD canonicalization (URDNA2015 etc.)
    const payloadBytes = new TextEncoder().encode(JSON.stringify(vcPayload));

    // 3. Signing
    // Sign with PQC (Message-first)
    const pqcSig = ml_dsa44.sign(payloadBytes, pqcKeys.secretKey);
    // Sign with Ed25519
    const edSig = ed25519.sign(payloadBytes, edPriv);

    // 4. Output Hybrid VC
    const vc = {
        ...vcPayload,
        "proof": [
            {
                "type": "Ed25519Signature2020",
                "verificationMethod": `did:key:${keys.ed25519.publicKey}`,
                "proofPurpose": "assertionMethod",
                "proofValue": bytesToHex(edSig)
            },
            {
                "type": "DataIntegrityProof",
                "cryptosuite": "ml-dsa-44-2025",
                "verificationMethod": `did:key:zPQC${keys.pqc.publicKey.substring(0, 16)}...`, // Placeholder DID
                "proofPurpose": "assertionMethod",
                "proofValue": bytesToHex(pqcSig)
            }
        ]
    };

    return { vc, keys };
}
