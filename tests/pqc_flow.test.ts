import { describe, it, expect, beforeAll } from "bun:test";
import {
    buildLayer2Envelope,
    decryptLayer2Envelope,
    deriveKeyPairFromPrf,
    b64urlEncode,
    b64urlDecode
} from "../src/form/client/l2crypto";
import { createMlKem768Provider, installBrowserPqcProvider } from "../src/form/client/pqc";
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";

// Setup global PQC provider
installBrowserPqcProvider(createMlKem768Provider());

// Mock localStorage
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
    key: (index: number) => Object.keys(mockStorage)[index] || null,
    length: 0
} as any;

describe("End-to-End PQC Hybrid Encryption Flow", () => {
    const layer1Ref = "demo-L1";

    // 1. Setup (Maker)
    // User generates Passkey-derived X25519 keys
    const fakePrfKey = new Uint8Array(32).fill(1); // Mock PRF output
    const userKeyPair = deriveKeyPairFromPrf(fakePrfKey);
    const userPubKey = b64urlEncode(userKeyPair.publicKey);

    // Recipient (Form Owner) generates keys
    // For X25519
    const recipientX25519 = deriveKeyPairFromPrf(new Uint8Array(32).fill(2));
    const recipientX25519Pub = b64urlEncode(recipientX25519.publicKey);
    const recipientX25519Priv = b64urlEncode(recipientX25519.privateKey);

    // For PQC (ML-KEM-768)
    const pqcKeys = ml_kem768.keygen();
    const pqcPub = b64urlEncode(pqcKeys.publicKey);
    const pqcPriv = b64urlEncode(pqcKeys.secretKey);

    const config = {
        enabled: true,
        recipient_kid: "test-recipient",
        recipient_x25519: recipientX25519Pub, // Public key for X25519
        recipient_pqc: pqcPub,               // Public key for ML-KEM
        layer1_ref: layer1Ref,
    };

    const l2Keys = {
        recipient_kid: "test-recipient",
        recipient_x25519_private: recipientX25519Priv,
        recipient_pqc_private: pqcPriv,
        recipient_pqc_kem: "ML-KEM-768"
    };

    it("should encrypt and decrypt using Hybrid PQC", async () => {
        const payloadData = {
            answer1: "Hello PQC",
            timestamp: Date.now()
        };

        console.log("Encrypting with config:", JSON.stringify(config, null, 2));

        // 2. Encryption (Form Client)
        const envelope = await buildLayer2Envelope({
            layer2_plain: payloadData,
            config: config,
            user_kid: "test-user"
            // pqcProvider is auto-detected from globalThis
        });

        // Check structure
        expect(envelope.layer2.suite.kem).toBe("X25519+ML-KEM-768");
        expect(envelope.layer2.encapsulated.pqc).toBeDefined();

        console.log("Encrypted Envelope:", JSON.stringify(envelope, null, 2));

        // 3. Decryption (Aggregator)
        // Aggregator receives envelope and uses l2Keys
        const recipientSk = b64urlDecode(l2Keys.recipient_x25519_private);
        const pqcSk = b64urlDecode(l2Keys.recipient_pqc_private);

        const decrypted = await decryptLayer2Envelope(
            envelope,
            recipientSk,
            { pqcRecipientSk: pqcSk }
        );

        console.log("Decrypted Payload:", decrypted);

        // Verify content
        expect(decrypted.layer2_plain).toEqual(payloadData);
        expect(decrypted.layer2_sig.alg).toBe("Ed25519");
    });

    it("should fail if PQC key is missing in decryption", async () => {
        const payloadData = { msg: "fail" };
        const envelope = await buildLayer2Envelope({
            layer2_plain: payloadData,
            config: config // Uses PQC
        });

        // Test failure when pqcRecipientSk is missing
        const recipientSk = b64urlDecode(l2Keys.recipient_x25519_private);

        try {
            await decryptLayer2Envelope(
                envelope,
                recipientSk,
                {}
            );
            throw new Error("Should have failed");
        } catch (e: any) {
            // Expected error
            console.log("Caught expected error:", e.message);
            expect(e.message).toContain("Missing PQC KEM");
        }
    });

});
