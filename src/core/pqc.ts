import { initWasm, mlKem768GenerateKeyPair, mlKem768Encapsulate, mlKem768Decapsulate } from "./wasm_core";
import type { PqcKemProvider } from "./l2crypto";

export function createMlKem768Provider(): PqcKemProvider {
  return {
    kemId: "ML-KEM-768",
    encapsulate: async (recipientPublicKey: Uint8Array) => {
      await initWasm();
      const { ciphertext, sharedSecret } = mlKem768Encapsulate(recipientPublicKey);
      return { sharedSecret, encapsulation: ciphertext };
    },
    decapsulate: async (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => {
      await initWasm();
      return mlKem768Decapsulate(recipientPrivateKey, encapsulation);
    },
  };
}

export async function generateMlKem768KeyPair() {
  await initWasm();
  return mlKem768GenerateKeyPair();
}
