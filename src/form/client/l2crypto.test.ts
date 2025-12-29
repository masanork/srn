import { describe, expect, test } from "bun:test";
import { x25519 } from "@noble/curves/ed25519.js";
import {
  b64urlEncode,
  b64urlDecode,
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

    const payload = await decryptLayer2Envelope(envelope, recipientSk, { skipReplayCheck: true });
    expect(payload.layer2_plain).toEqual({ answer: "yes", count: 2 });
    expect(payload.layer2_sig.alg).toBe("Ed25519");
    expect(typeof payload._padding).toBe("string");
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
    await expect(decryptLayer2Envelope(tampered, recipientSk, { skipReplayCheck: true })).rejects.toThrow();
  });

  test("decrypt fails when ciphertext is tampered", async () => {
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

    const layer2 = envelope.layer2;
    if (!layer2) throw new Error("Missing layer2");
    const ct = b64urlDecode(layer2.ciphertext);
    if (ct && ct.length > 0) {
      ct[0] ^= 0xff;
    }
    const tampered = {
      ...envelope,
      layer2: { ...layer2, ciphertext: b64urlEncode(ct) },
    };

    await expect(decryptLayer2Envelope(tampered, recipientSk, { skipReplayCheck: true })).rejects.toThrow();
  });

  test("PQC config works via built-in WASM provider", async () => {
    localStorageMock.clear();
    const recipientSk = x25519.utils.randomSecretKey();
    const recipientPk = x25519.getPublicKey(recipientSk);
    const pqcPub = new Uint8Array(1184).fill(1); // ML-KEM-768 public key size
    const envelope = await buildLayer2Envelope({
      layer2_plain: { answer: "yes" },
      config: {
        enabled: true,
        recipient_kid: "issuer#kem-2025",
        recipient_x25519: b64urlEncode(recipientPk),
        recipient_pqc: b64urlEncode(pqcPub),
        layer1_ref: "sha256:abcd",
      },
    });
    expect(envelope.layer2.suite.kem).toBe("X25519+ML-KEM-768");
  });

  // Manual PQC providers are no longer used by buildLayer2Envelope, but we can keep the test
  // to document that we now internalize it, or just remove it.
  // Removal preferred if we've specialized WASM for ML-KEM-768.


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

  test("unwrap fails with wrong prf key", async () => {
    const recipientSk = x25519.utils.randomSecretKey();
    const prfKey = new Uint8Array(32);
    const wrongPrfKey = new Uint8Array(32);
    crypto.getRandomValues(prfKey);
    crypto.getRandomValues(wrongPrfKey);
    const wrapped = await wrapRecipientPrivateKey({ recipientSk, prfKey });
    await expect(
      unwrapRecipientPrivateKey({
        keywrap: {
          alg: "WebAuthn-PRF-AESGCM-v1",
          kid: "issuer#passkey-1",
          credential_id: "base64url(cred)",
          prf_salt: "base64url(salt)",
          wrapped_key: b64urlEncode(wrapped),
        },
        prfKey: wrongPrfKey,
      }),
    ).rejects.toThrow();
  });

  describe("LocalStorageReplayStore", () => {
    test("persistence and reset", async () => {
      localStorageMock.clear();
      const store = new (require("./l2crypto").LocalStorageReplayStore)("test_nonces");
      await store.add("n1");
      expect(await store.has("n1")).toBe(true);
      expect(localStorageMock.getItem("test_nonces")).toContain("n1");

      const store2 = new (require("./l2crypto").LocalStorageReplayStore)("test_nonces");
      expect(await store2.has("n1")).toBe(true);

      await store2.reset();
      expect(await store2.has("n1")).toBe(false);
      expect(localStorageMock.getItem("test_nonces")).toBe("[]");
    });

    test("handles corrupt data", () => {
      localStorageMock.setItem("corrupt", "invalid-json");
      const store = new (require("./l2crypto").LocalStorageReplayStore)("corrupt");
      expect(store).toBeDefined();
    });
  });

  describe("ReplayGuard", () => {
    test("memory-only guard", async () => {
      const guard = new (require("./l2crypto").ReplayGuard)();
      expect(await guard.checkAndMark("a")).toBe(true);
      expect(await guard.checkAndMark("a")).toBe(false);
      await guard.reset();
      expect(await guard.checkAndMark("a")).toBe(true);
    });
  });

  test("getPaddingTargetSize for large sizes", async () => {
    const { getPaddingTargetSize } = require("./l2crypto");
    expect(await getPaddingTargetSize(2000000)).toBe(1048576 * 2);
  });


  test("deriveOrgX25519KeyPair validation", () => {
    const { deriveOrgX25519KeyPair } = require("./l2crypto");
    expect(() => deriveOrgX25519KeyPair({
      orgRootKey: new Uint8Array(32),
      campaignId: "c1",
      keyPolicy: "campaign+layer1"
    })).toThrow("layer1_ref is required");
  });

  test("fetchPreKey", async () => {
    const { fetchPreKey } = require("./l2crypto");
    (globalThis as any).fetch = async () => ({
      ok: true,
      json: async () => ({ kid: "k1", recipient_x25519: "pub" })
    });
    const key = await fetchPreKey("http://example.com");
    expect(key?.kid).toBe("k1");

    (globalThis as any).fetch = async () => ({ ok: false, status: 500 });
    const fail = await fetchPreKey("http://example.com");
    expect(fail).toBeNull();
  });

  test("decryptLayer2Envelope AAD mismatch", async () => {
    const recipientSk = x25519.utils.randomSecretKey();
    const recipientPk = x25519.getPublicKey(recipientSk);
    const envelope = await buildLayer2Envelope({
      layer2_plain: { foo: "bar" },
      config: {
        enabled: true,
        recipient_kid: "issuer#1",
        recipient_x25519: b64urlEncode(recipientPk),
        layer1_ref: "ref1"
      }
    });
    const tampered = { ...envelope, layer1_ref: "ref2" };
    await expect(decryptLayer2Envelope(tampered, recipientSk, { skipReplayCheck: true })).rejects.toThrow("AAD mismatch");
  });

  test("loadL2Config paths", () => {
    if (typeof document === "undefined") return; // Skip in Node/Bun without DOM
    const { loadL2Config } = require("./l2crypto");
    document.body.innerHTML = '<script id="weba-l2-config" type="application/json">{"enabled":true}</script>';
    expect(loadL2Config()?.enabled).toBe(true);

    document.body.innerHTML = '<script id="weba-l2-config" type="application/json">invalid</script>';
    expect(loadL2Config()).toBeNull();

    document.body.innerHTML = '';
    expect(loadL2Config()).toBeNull();
  });

});
