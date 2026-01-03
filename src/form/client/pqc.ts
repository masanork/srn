import type { PqcKemProvider } from "./l2crypto";

export function createMlKem768Provider(): PqcKemProvider {
  return {
    kemId: "ML-KEM-768",
    encapsulate: (recipientPublicKey: Uint8Array) => {
      const crypto = (window as any).WebACrypto;
      if (!crypto) throw new Error("WebACrypto not initialized");
      const { ciphertext, sharedSecret } = crypto.mlKem768Encapsulate(recipientPublicKey);
      return { sharedSecret, encapsulation: ciphertext };
    },
    decapsulate: (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => {
      const crypto = (window as any).WebACrypto;
      if (!crypto) throw new Error("WebACrypto not initialized");
      // WASM signature: (privateKey, ciphertext)
      return crypto.mlKem768Decapsulate(recipientPrivateKey, encapsulation);
    },
  };
}

export function installBrowserPqcProvider(provider: PqcKemProvider) {
  (globalThis as any).webaPqcKem = provider;
}
