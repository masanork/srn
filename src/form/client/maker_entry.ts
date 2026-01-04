// Import only the browser-safe WASM crypto functions needed by Maker UI
import {
    initWasmFromB64,
    hkdfSha256,
    x25519GetPublicKey,
    mlKem768GenerateKeyPair,
    mlKem768Encapsulate,
    mlKem768Decapsulate,
} from "@srn/core/wasm_core";

// Expose WASM Crypto for Maker UI (only the functions actually used)
(window as any).WebACrypto = {
    initWasmFromB64,
    hkdfSha256,
    x25519GetPublicKey,
    mlKem768GenerateKeyPair,
    mlKem768Encapsulate,
    mlKem768Decapsulate,
};

// Import and boot the core runtime
import './index';
