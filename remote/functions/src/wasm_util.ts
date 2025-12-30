import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import * as wasmModule from "../wasm/weba_crypto_wasm.js";

let initialized = false;

export async function initWasm() {
    if (initialized) return;
    try {
        const wasmPath = path.join(__dirname, "..", "wasm", "weba_crypto_wasm_bg.wasm");
        const wasmBuffer = fs.readFileSync(wasmPath);
        await wasmModule.default(wasmBuffer);
        initialized = true;
    } catch (e) {
        console.error("Failed to initialize WASM in remote:", e);
        throw e;
    }
}

export function ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    return wasmModule.ed25519_verify(publicKey, message, signature);
}

export function mlDsa44Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    return wasmModule.ml_dsa_44_verify(publicKey, message, signature);
}
