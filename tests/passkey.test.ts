import { expect, test, describe } from "bun:test";
import { p256 } from "@noble/curves/nist.js";
import { ml_dsa44 } from "@noble/post-quantum/ml-dsa.js";
import canonicalize from 'canonicalize';
import { verifyHybridVC, generateHybridKeys } from "../src/core/vc.ts";

describe("PassKey (P-256) Integration", () => {

    test("Verification should support P-256 signatures (simulating PassKey)", async () => {
        // 1. Setup Keys
        const hybridKeys = generateHybridKeys();

        const p256Priv = p256.utils.randomSecretKey();
        const p256Pub = p256.getPublicKey(p256Priv);
        const p256PubHex = Buffer.from(p256Pub).toString('hex');

        // 2. Create a VC with P-256 + PQC proofs
        const doc = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuer": `did:key:z${p256PubHex}`, // Simplified DID
            "issuanceDate": new Date().toISOString(),
            "credentialSubject": { id: "did:example:123" }
        };

        const jsonString = canonicalize(doc);
        const payloadBytes = new TextEncoder().encode(jsonString!);

        // Classic Signature (PassKey)
        const p256Sig = p256.sign(payloadBytes, p256Priv);
        const p256SigHex = Buffer.from(p256Sig).toString('hex');

        // Quantum Signature
        const pqcPrivBytes = Uint8Array.from(Buffer.from(hybridKeys.pqc.privateKey, 'hex'));
        const pqcSig = ml_dsa44.sign(payloadBytes, pqcPrivBytes);
        const pqcSigHex = Buffer.from(pqcSig).toString('hex');

        const vc = {
            ...doc,
            "proof": [
                {
                    "type": "EcdsaSecp256k1Signature2019",
                    "verificationMethod": `did:key:z${p256PubHex}#root-p256`,
                    "proofPurpose": "assertionMethod",
                    "proofValue": p256SigHex
                },
                {
                    "type": "DataIntegrityProof",
                    "cryptosuite": "ml-dsa-44-2025",
                    "verificationMethod": `did:key:zPQC#${hybridKeys.pqc.publicKey}-pqc`,
                    "proofPurpose": "assertionMethod",
                    "proofValue": pqcSigHex
                }
            ]
        };

        const result = await verifyHybridVC(vc);
        expect(result.isValid).toBe(true);
        expect(result.checks.p256).toBe(true);
        expect(result.checks.pqc).toBe(true);
    });
});
