import init, {
    constant_time_equal as wasm_ct_equal,
    get_version,
    aes_gcm_encrypt as wasm_encrypt,
    aes_gcm_decrypt as wasm_decrypt,
    x25519_generate_keypair as wasm_x25519_gen,
    x25519_get_public_key as wasm_x25519_pk,
    x25519_get_shared_secret as wasm_x25519_ss,
    ed25519_generate_keypair as wasm_ed25519_gen,
    ed25519_sign as wasm_ed25519_sign,
    ed25519_verify as wasm_ed25519_verify,
} from "./wasm_bindings/weba_crypto_wasm.js";
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

/**
 * X25519 Key Pair generation using WASM.
 * Returns [sk(32), pk(32)]
 */
export function x25519GenerateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    if (!initialized) throw new Error("WASM not initialized");
    const bytes = wasm_x25519_gen();
    return {
        privateKey: bytes.slice(0, 32),
        publicKey: bytes.slice(32, 64),
    };
}

/**
 * X25519 Public Key from Private Key using WASM.
 */
export function x25519GetPublicKey(privateKey: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_x25519_pk(privateKey);
}

/**
 * X25519 Shared Secret calculation using WASM.
 */
export function x25519GetSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_x25519_ss(privateKey, publicKey);
}

/**
 * Ed25519 Key Pair generation using WASM.
 * Returns [sk(32), pk(32)]
 */
export function ed25519GenerateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    if (!initialized) throw new Error("WASM not initialized");
    const bytes = wasm_ed25519_gen();
    return {
        privateKey: bytes.slice(0, 32),
        publicKey: bytes.slice(32, 64),
    };
}

/**
 * Ed25519 Signing using WASM.
 */
export function ed25519Sign(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_ed25519_sign(privateKey, message);
}

/**
 * Ed25519 Verification using WASM.
 */
export function ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_ed25519_verify(publicKey, message, signature);
}
