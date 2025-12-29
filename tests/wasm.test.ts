import { expect, test, describe, beforeAll } from "bun:test";
import {
    initWasm,
    constantTimeEqual,
    aesGcmEncrypt,
    aesGcmDecrypt,
    x25519GenerateKeyPair,
    x25519GetSharedSecret,
    ed25519GenerateKeyPair,
    ed25519Sign,
    ed25519Verify,
    mlKem768GenerateKeyPair,
    mlKem768Encapsulate,
    mlKem768Decapsulate,
} from "../src/core/wasm_core.ts";

describe("WASM Crypto Core", () => {
    beforeAll(async () => {
        await initWasm();
    });

    test("constantTimeEqual should correctly compare buffers", () => {
        const a = new Uint8Array([1, 2, 3, 4]);
        const b = new Uint8Array([1, 2, 3, 4]);
        const c = new Uint8Array([1, 2, 3, 5]);
        const d = new Uint8Array([1, 2, 3]);

        expect(constantTimeEqual(a, b)).toBe(true);
        expect(constantTimeEqual(a, c)).toBe(false);
        expect(constantTimeEqual(a, d)).toBe(false);
    });

    test("aesGcmEncrypt/Decrypt should roundtrip correctly", () => {
        const key = new Uint8Array(32).fill(0x42);
        const iv = new Uint8Array(12).fill(0x99);
        const aad = new Uint8Array([1, 2, 3]);
        const plaintext = new TextEncoder().encode("Hello WASM World!");

        const ciphertext = aesGcmEncrypt(key, iv, plaintext, aad);
        expect(ciphertext).not.toEqual(plaintext);

        const decrypted = aesGcmDecrypt(key, iv, ciphertext, aad);
        expect(decrypted).toEqual(plaintext);
        expect(new TextDecoder().decode(decrypted)).toBe("Hello WASM World!");
    });

    test("aesGcmDecrypt should fail with wrong AAD", () => {
        const key = new Uint8Array(32).fill(0x42);
        const iv = new Uint8Array(12).fill(0x99);
        const aad = new Uint8Array([1, 2, 3]);
        const plaintext = new TextEncoder().encode("Hello");

        const ciphertext = aesGcmEncrypt(key, iv, plaintext, aad);


        expect(() => aesGcmDecrypt(key, iv, ciphertext, new Uint8Array([1, 2, 4]))).toThrow("Decryption failed");
    });

    test("x25519 should roundtrip correctly", () => {
        const alice = x25519GenerateKeyPair();
        const bob = x25519GenerateKeyPair();

        const ss1 = x25519GetSharedSecret(alice.privateKey, bob.publicKey);
        const ss2 = x25519GetSharedSecret(bob.privateKey, alice.publicKey);

        expect(ss1).toEqual(ss2);
        expect(ss1.length).toBe(32);
    });

    test("ed25519 should sign and verify correctly", () => {
        const keypair = ed25519GenerateKeyPair();
        const msg = new TextEncoder().encode("Attack at dawn");

        const sig = ed25519Sign(keypair.privateKey, msg);
        expect(sig.length).toBe(64);

        const valid = ed25519Verify(keypair.publicKey, msg, sig);
        expect(valid).toBe(true);

        const invalid = ed25519Verify(keypair.publicKey, new TextEncoder().encode("Attack at noon"), sig);
        expect(invalid).toBe(false);
    });

    test("ml-kem-768 should roundtrip correctly", () => {
        const alice = mlKem768GenerateKeyPair();
        expect(alice.privateKey.length).toBe(2400);
        expect(alice.publicKey.length).toBe(1184);

        const bob = mlKem768Encapsulate(alice.publicKey);
        expect(bob.ciphertext.length).toBe(1088);
        expect(bob.sharedSecret.length).toBe(32);

        const ssRecv = mlKem768Decapsulate(alice.privateKey, bob.ciphertext);
        expect(ssRecv).toEqual(bob.sharedSecret);
    });
});
