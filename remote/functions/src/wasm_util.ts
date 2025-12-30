const crypto = require("crypto");

let initialized = false;

export async function initWasm() {
    // No WASM needed - using Node.js crypto
    initialized = true;
}

export function ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    if (!initialized) throw new Error("Crypto not initialized");

    try {
        // Convert Ed25519 public key to SPKI format for Node.js crypto
        const key = crypto.createPublicKey({
            key: Buffer.concat([
                // SPKI header for Ed25519
                Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
                Buffer.from(publicKey)
            ]),
            format: "der",
            type: "spki"
        });

        return crypto.verify(null, Buffer.from(message), key, Buffer.from(signature));
    } catch (e) {
        console.error("Ed25519 verification failed:", e);
        return false;
    }
}
