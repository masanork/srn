import init, { constant_time_equal as wasm_ct_equal, get_version, aes_gcm_encrypt as wasm_encrypt, aes_gcm_decrypt as wasm_decrypt } from "./wasm_bindings/weba_crypto_wasm.js";
import * as fs from "node:fs";
import * as path from "node:path";

let initialized = false;

/**
 * Initialize the WASM crypto module.
 * In a Node.js/Bun environment, we read the .wasm file from the filesystem.
 */
export async function initWasm() {
    if (initialized) return;

    // For Node.js/Bun compatibility
    const wasmPath = path.join(import.meta.dirname, "wasm_bindings/weba_crypto_wasm_bg.wasm");
    const wasmBuffer = fs.readFileSync(wasmPath);
    await init(wasmBuffer);

    initialized = true;
    console.log(`WASM Crypto Initialized: ${get_version()}`);
}

/**
 * Constant-time byte array comparison using WASM.
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (!initialized) {
        throw new Error("WASM module not initialized. Call initWasm() first.");
    }
    return wasm_ct_equal(a, b);
}

/**
 * AES-256-GCM Encryption using WASM.
 */
export function aesGcmEncrypt(key: Uint8Array, iv: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_encrypt(key, iv, plaintext, aad);
}

/**
 * AES-256-GCM Decryption using WASM.
 */
export function aesGcmDecrypt(key: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array, aad: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_decrypt(key, iv, ciphertext, aad);
}
