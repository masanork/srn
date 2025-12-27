import { beforeEach, describe, expect, test } from "bun:test";
import { ed25519 } from "@noble/curves/ed25519.js";
// @ts-ignore
import canonicalize from "canonicalize";
import { Signer } from "./signer";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const toBase64Url = (bytes: Uint8Array): string => {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

describe("Web/A Signer", () => {
  beforeEach(() => {
    (globalThis as any).localStorage = localStorageMock;
    localStorageMock.clear();
    if (!(globalThis as any).crypto?.subtle) {
      (globalThis as any).crypto = require("node:crypto").webcrypto;
    }
    if (!(globalThis as any).btoa) {
      (globalThis as any).btoa = (str: string) =>
        Buffer.from(str, "binary").toString("base64");
    }
    if (!(globalThis as any).atob) {
      (globalThis as any).atob = (b64: string) =>
        Buffer.from(b64, "base64").toString("binary");
    }
    (globalThis as any).navigator = {
      credentials: {
        create: async () => {
          throw new Error("Passkey unavailable");
        },
        get: async () => ({
          id: "cred-1",
          response: {
            signature: new Uint8Array([1, 2, 3]).buffer,
            authenticatorData: new Uint8Array([4, 5, 6]).buffer,
            clientDataJSON: new Uint8Array([7, 8, 9]).buffer,
          },
        }),
      },
    };
  });

  test("signs with passkey when passkey metadata exists", async () => {
    const pubKey = new Uint8Array(65).fill(7);
    const pubHex = Array.from(pubKey).map((b) => b.toString(16).padStart(2, "0")).join("");
    const credentialId = toBase64Url(new Uint8Array([1, 2, 3]));
    localStorageMock.setItem("weba_passkey_id", credentialId);
    localStorageMock.setItem("weba_passkey_pub", pubHex);

    const signer = new Signer();
    const signed = await signer.sign({ foo: "bar" });

    expect(signed.proof.type).toBe("PasskeySignature2025");
    expect(signed.proof.proofValue).toBeTruthy();
    expect(signed.proof["srn:authenticatorData"]).toBeTruthy();
    expect(signed.proof["srn:clientDataJSON"]).toBeTruthy();
    expect(signed.proof["srn:credentialId"]).toBe("cred-1");
    expect(signer.getIssuerDid()).toContain(pubHex);
  });

  test("falls back to Ed25519 and verifies signature", async () => {
    const signer = new Signer();
    const payload = { foo: "bar", count: 1 };
    const signed = await signer.sign(payload, "authentication");

    expect(signed.proof.type).toBe("Ed25519Signature2020");
    expect(typeof signed.proof.proofValue).toBe("string");

    const message = new TextEncoder().encode(canonicalize(payload));
    const signature = hexToBytes(signed.proof.proofValue);
    const pubKey = hexToBytes(signer.getPublicKey());
    expect(ed25519.verify(signature, message, pubKey)).toBe(true);

    const tampered = new TextEncoder().encode(canonicalize({ ...payload, count: 2 }));
    expect(ed25519.verify(signature, tampered, pubKey)).toBe(false);
  });
});
