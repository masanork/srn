import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import type { PqcKemProvider } from "./l2crypto";

export function createMlKem768Provider(): PqcKemProvider {
  return {
    kemId: "ML-KEM-768",
    encapsulate: (recipientPublicKey: Uint8Array) => {
      const { cipherText, sharedSecret } = ml_kem768.encapsulate(recipientPublicKey);
      return { sharedSecret, encapsulation: cipherText };
    },
    decapsulate: (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => {
      return ml_kem768.decapsulate(encapsulation, recipientPrivateKey);
    },
  };
}

export function installBrowserPqcProvider(provider: PqcKemProvider) {
  (globalThis as any).webaPqcKem = provider;
}
