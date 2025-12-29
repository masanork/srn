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
    ml_kem_768_generate_keypair as wasm_ml_kem_gen,
    ml_kem_768_encapsulate as wasm_ml_kem_enc,
    ml_kem_768_decapsulate as wasm_ml_kem_dec,
    ml_dsa_44_generate_keypair as wasm_ml_dsa_gen,
    ml_dsa_44_sign as wasm_ml_dsa_sign,
    ml_dsa_44_verify as wasm_ml_dsa_verify,
    sha256_wasm as wasm_sha256,
    hkdf_sha256_wasm as wasm_hkdf,
    get_padding_target_size as wasm_get_padding,
    build_l2_envelope_wasm as wasm_build_l2,
    decrypt_l2_envelope_wasm as wasm_decrypt_l2,
} from "./wasm_bindings/weba_crypto_wasm.js";
import { WASM_BINARY_B64 } from "./wasm_binary.ts";

// No top-level Node imports here to keep it browser-compatible

let initialized = false;

/**
 * Initialize the WASM crypto module.
 * @param source Optional WASM source (URL, Response, or Buffer). If omitted, tries to load from local filesystem (Node/Bun only).
 */
export async function initWasm(source?: any) {
    if (initialized) return;

    if (source) {
        await init(source);
    } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js / Bun environment
        const fs = await import("node:fs");
        const path = await import("node:path");
        // @ts-ignore
        const wasmPath = path.join(import.meta.dirname, "wasm_bindings/weba_crypto_wasm_bg.wasm");
        const wasmBuffer = fs.readFileSync(wasmPath);
        await init(wasmBuffer);
    } else {
        throw new Error("WASM source must be provided in browser environment");
    }

    initialized = true;
    console.log(`WASM Crypto Initialized: ${get_version()}`);
}

/**
 * Initialize WASM from the embedded base64 binary.
 * Useful for standalone browser environments.
 */
export async function initWasmFromB64() {
    if (initialized) return;
    const binary = atob(WASM_BINARY_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    await initWasm(bytes);
}

/**
 * Constant-time byte array comparison using WASM.
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (!initialized) throw new Error("WASM not initialized");
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

/**
 * ML-KEM-768 Key Pair generation using WASM.
 */
export function mlKem768GenerateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    if (!initialized) throw new Error("WASM not initialized");
    const bytes = wasm_ml_kem_gen();
    return {
        privateKey: bytes.slice(0, 2400),
        publicKey: bytes.slice(2400, 2400 + 1184),
    };
}

/**
 * ML-KEM-768 Encapsulation using WASM.
 */
export function mlKem768Encapsulate(publicKey: Uint8Array): { ciphertext: Uint8Array; sharedSecret: Uint8Array } {
    if (!initialized) throw new Error("WASM not initialized");
    const bytes = wasm_ml_kem_enc(publicKey);
    return {
        sharedSecret: bytes.slice(0, 32),
        ciphertext: bytes.slice(32, 32 + 1088),
    };
}

/**
 * ML-KEM-768 Decapsulation using WASM.
 */
export function mlKem768Decapsulate(privateKey: Uint8Array, ciphertext: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_ml_kem_dec(privateKey, ciphertext);
}

/**
 * ML-DSA-44 Key Pair generation using WASM.
 */
export function mlDsa44GenerateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    if (!initialized) throw new Error("WASM not initialized");
    const bytes = wasm_ml_dsa_gen();
    return {
        privateKey: bytes.slice(0, 2560),
        publicKey: bytes.slice(2560, 2560 + 1312),
    };
}

/**
 * ML-DSA-44 Signing using WASM.
 */
export function mlDsa44Sign(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_ml_dsa_sign(privateKey, message);
}

/**
 * ML-DSA-44 Verification using WASM.
 */
export function mlDsa44Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_ml_dsa_verify(publicKey, message, signature);
}

/**
 * SHA-256 Hash using WASM.
 */
export function sha256Hash(data: Uint8Array): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_sha256(data);
}

/**
 * HKDF-SHA256 derivation using WASM.
 */
export function hkdfSha256(ikm: Uint8Array, salt: Uint8Array | undefined, info: Uint8Array, length: number): Uint8Array {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_hkdf(ikm, salt || new Uint8Array(0), info, length);
}

/**
 * Bucket-based padding target size calculation in WASM.
 */
export function getPaddingTargetSize(currentSize: number): number {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_get_padding(currentSize);
}

/**
 * High-level L2 Envelope building in WASM.
 */
export function buildL2Envelope(
    payloadJson: string,
    userSk: Uint8Array,
    userKid: string,
    configJson: string,
    createdAt: string
): string {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_build_l2(payloadJson, userSk, userKid, configJson, createdAt);
}

/**
 * High-level L2 Envelope decryption in WASM.
 */
export function decryptL2Envelope(
    envelopeJson: string,
    recipientSk: Uint8Array,
    pqcSk?: Uint8Array
): string {
    if (!initialized) throw new Error("WASM not initialized");
    return wasm_decrypt_l2(envelopeJson, recipientSk, pqcSk);
}
