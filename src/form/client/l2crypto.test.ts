import { describe, expect, test } from "bun:test";
import { x25519 } from "@noble/curves/ed25519.js";
import {
  b64urlEncode,
  buildLayer2Envelope,
  decryptLayer2Envelope,
  unwrapRecipientPrivateKey,
  wrapRecipientPrivateKey,
} from "./l2crypto";

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

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).btoa = (data: string) =>
  Buffer.from(data, "binary").toString("base64");
(globalThis as any).atob = (data: string) =>
  Buffer.from(data, "base64").toString("binary");

describe("Web/A L2 crypto", () => {
  test("encrypt/decrypt roundtrip", async () => {
    localStorageMock.clear();
    const recipientSk = x25519.utils.randomSecretKey();
    const recipientPk = x25519.getPublicKey(recipientSk);
    const envelope = await buildLayer2Envelope({
      layer2_plain: { answer: "yes", count: 2 },
      config: {
        enabled: true,
        recipient_kid: "issuer#kem-2025",
        recipient_x25519: b64urlEncode(recipientPk),
        layer1_ref: "sha256:abcd",
      },
    });

    const payload = await decryptLayer2Envelope(envelope, recipientSk);
    expect(payload.layer2_plain).toEqual({ answer: "yes", count: 2 });
    expect(payload.layer2_sig.alg).toBe("Ed25519");
  });

  test("decrypt fails when layer1_ref changes", async () => {
    localStorageMock.clear();
    const recipientSk = x25519.utils.randomSecretKey();
    const recipientPk = x25519.getPublicKey(recipientSk);
    const envelope = await buildLayer2Envelope({
      layer2_plain: { answer: "yes" },
      config: {
        enabled: true,
        recipient_kid: "issuer#kem-2025",
        recipient_x25519: b64urlEncode(recipientPk),
        layer1_ref: "sha256:abcd",
      },
    });

    const tampered = { ...envelope, layer1_ref: "sha256:ffff" };
    await expect(decryptLayer2Envelope(tampered, recipientSk)).rejects.toThrow();
  });

  test("wrap/unwrap recipient private key", async () => {
    const recipientSk = x25519.utils.randomSecretKey();
    const prfKey = new Uint8Array(32);
    crypto.getRandomValues(prfKey);
    const aad = new TextEncoder().encode("aad");

    const wrapped = await wrapRecipientPrivateKey({ recipientSk, prfKey, aad });
    const unwrapped = await unwrapRecipientPrivateKey({
      keywrap: {
        alg: "WebAuthn-PRF-AESGCM-v1",
        kid: "issuer#passkey-1",
        credential_id: "base64url(cred)",
        prf_salt: "base64url(salt)",
        wrapped_key: b64urlEncode(wrapped),
        aad: b64urlEncode(aad),
      },
      prfKey,
    });

    expect(b64urlEncode(unwrapped)).toBe(b64urlEncode(recipientSk));
  });
});
