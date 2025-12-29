import { expect, test, describe, beforeAll } from "bun:test";
import { initWasm, constantTimeEqual, aesGcmEncrypt, aesGcmDecrypt } from "../src/core/wasm_core.ts";

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
});
