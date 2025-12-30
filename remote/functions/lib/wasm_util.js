"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWasm = initWasm;
exports.ed25519Verify = ed25519Verify;
const crypto = require("crypto");
let initialized = false;
async function initWasm() {
    initialized = true;
}
function ed25519Verify(publicKey, message, signature) {
    if (!initialized)
        throw new Error("Crypto not initialized");
    try {
        const key = crypto.createPublicKey({
            key: Buffer.concat([
                Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
                Buffer.from(publicKey)
            ]),
            format: "der",
            type: "spki"
        });
        return crypto.verify(null, Buffer.from(message), key, Buffer.from(signature));
    }
    catch (e) {
        console.error("Ed25519 verification failed:", e);
        return false;
    }
}
//# sourceMappingURL=wasm_util.js.map