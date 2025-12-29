import { expect, test, describe } from "bun:test";
import { p256 } from "@noble/curves/nist.js";
import { ml_dsa44 } from "@noble/post-quantum/ml-dsa.js";
import canonicalize from 'canonicalize';
import { verifyHybridVC, generateHybridKeys } from "../src/core/vc.ts";
import { encodeDidKey } from "../src/core/did.ts";
import { hexToBytes } from "../src/core/encoding.ts";

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

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

function bytesToMultibaseBase58btc(bytes: Uint8Array): string {
    return `z${bytesToBase58(bytes)}`;
}

describe("PassKey (P-256) Integration", () => {

    test("Verification should support P-256 signatures (simulating PassKey)", async () => {
        // 1. Setup Keys
        const hybridKeys = await generateHybridKeys();

        const p256Priv = p256.utils.randomSecretKey();
        const p256Pub = p256.getPublicKey(p256Priv);
        const p256PubHex = Buffer.from(p256Pub).toString('hex');

        // 2. Create a VC with P-256 + PQC proofs
        const p256Did = encodeDidKey(p256Pub, 'p256');
        const doc = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuer": p256Did,
            "issuanceDate": new Date().toISOString(),
            "credentialSubject": { id: "did:example:123" }
        };

        const jsonString = canonicalize(doc);
        const payloadBytes = new TextEncoder().encode(jsonString!);

        const created = new Date().toISOString();

        // Classic Signature (PassKey)
        const p256Sig = p256.sign(payloadBytes, p256Priv);
        const p256SigHex = Buffer.from(p256Sig).toString('hex');

        // Quantum Signature
        const pqcPrivBytes = Uint8Array.from(Buffer.from(hybridKeys.pqc.privateKey, 'hex'));
        const pqcSig = ml_dsa44.sign(payloadBytes, pqcPrivBytes);
        const pqcSigMultibase = bytesToMultibaseBase58btc(pqcSig);

        const vc = {
            ...doc,
            "proof": [
                {
                    "type": "EcdsaSecp256k1Signature2019",
                    "verificationMethod": `${p256Did}#root-p256`,
                    "proofPurpose": "assertionMethod",
                    "proofValue": p256SigHex
                },
                {
                    "type": "DataIntegrityProof",
                    "cryptosuite": "ml-dsa-44-jcs-2025",
                    "verificationMethod": `did:key:zPQC#${hybridKeys.pqc.publicKey}-pqc`,
                    "proofPurpose": "assertionMethod",
                    "created": created,
                    "proofValue": pqcSigMultibase
                }
            ]
        };

        const result = await verifyHybridVC(vc);
        expect(result.isValid).toBe(true);
        expect(result.checks.p256).toBe(true);
        expect(result.checks.pqc).toBe(true);
    });
});
