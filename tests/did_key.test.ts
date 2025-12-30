import { expect, test, describe, beforeAll } from "bun:test";
import { initWasm, ed25519PublicKeyToX25519PublicKey, ed25519GenerateKeyPair } from "../src/core/wasm_core.ts";
import { decodeDidKey, resolveDidDocument } from "../src/core/did.ts";

describe("DID Key Ed25519 to X25519 Conversion Tests", () => {
    beforeAll(async () => {
        await initWasm();
    });

    test("should convert Ed25519 public key to X25519 public key", () => {
        const { publicKey } = ed25519GenerateKeyPair();
        expect(publicKey.length).toBe(32);

        const x25519Pub = ed25519PublicKeyToX25519PublicKey(publicKey);
        expect(x25519Pub.length).toBe(32);

        // Basic check that it's actually different from Ed25519 pub
        expect(Buffer.from(x25519Pub).toString('hex')).not.toBe(Buffer.from(publicKey).toString('hex'));
    });

    test("should resolve did:key with Ed25519 (0xed)", async () => {
        // Generating a real did:key from Ed25519 pub key
        const { publicKey } = ed25519GenerateKeyPair();

        // Manual multibase encoding for z6Mk... (Ed25519)
        // Multicodec 0xed (Ed25519 pub key) is 0xed, 0x01
        const multi = new Uint8Array(2 + publicKey.length);
        multi[0] = 0xed;
        multi[1] = 0x01;
        multi.set(publicKey, 2);

        // Simple base58btc encoder (can't easily reference src/core/encoding if it's too complex, but let's try)
        const { bytesToMultibaseBase58btc } = await import("../src/core/encoding");
        const did = `did:key:${bytesToMultibaseBase58btc(multi)}`;

        const { code, publicKey: decodedPub } = decodeDidKey(did);
        expect(code).toBe(0xed);
        expect(decodedPub).toEqual(publicKey);

        // This is what our Guest DID client does effectively
        const x25519Pub = ed25519PublicKeyToX25519PublicKey(decodedPub);
        expect(x25519Pub.length).toBe(32);
    });

    test("should resolve did:key with X25519 (0xec)", async () => {
        // Multicodec 0xec (X25519 pub key) is 0xec, 0x01
        const dummyX25519 = new Uint8Array(32).fill(0xaa);
        const multi = new Uint8Array(2 + dummyX25519.length);
        multi[0] = 0xec;
        multi[1] = 0x01;
        multi.set(dummyX25519, 2);

        const { bytesToMultibaseBase58btc } = await import("../src/core/encoding");
        const did = `did:key:${bytesToMultibaseBase58btc(multi)}`;

        const { code, publicKey: decodedPub } = decodeDidKey(did);
        expect(code).toBe(0xec);
        expect(decodedPub).toEqual(dummyX25519);
    });

    test("encryptLayer2 should support alg: 'none' when userSk is empty", async () => {
        const { encryptLayer2 } = await import("../src/core/l2crypto");
        const recipientPub = new Uint8Array(32).fill(0xbb);

        const payload = {
            layer2_plain: { hello: "world" },
            layer2_sig: { alg: "Ed25519", kid: "dummy", sig: "", created_at: "" } // Original value, will be overwritten
        };

        const encrypted = await encryptLayer2(
            payload as any,
            recipientPub,
            "ref:123",
            "recip:123",
            { userSk: new Uint8Array(0) }
        );

        // We can't easily decrypt without the private key, but we can check the WASM output directly if it was exposed
        // Or we can use decryptLayer2 with the dummy key we know (though x25519 doesn't have a constant dummy)

        // Actually, let's just use a real recipient key so we can decrypt it
        const { generateRecipientKeyPair, decryptLayer2 } = await import("../src/core/l2crypto");
        const kp = await generateRecipientKeyPair();

        const encrypted2 = await encryptLayer2(
            payload as any,
            kp.publicKey,
            "ref:456",
            "recip:456",
            { userSk: new Uint8Array(0) }
        );

        const decrypted = await decryptLayer2(encrypted2, kp.privateKey, { skipReplayCheck: true });
        expect(decrypted.layer2_sig.alg).toBe("none");
        expect(decrypted.layer2_sig.sig).toBe("");
        expect(decrypted.layer2_plain.hello).toBe("world");
    });
});
