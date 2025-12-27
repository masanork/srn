import { describe, expect, it } from "bun:test";
import {
  b64urlDecode,
  b64urlEncode,
  buildLayer2Payload,
  canonicalJson,
  decryptLayer2Envelope,
  encryptLayer2Payload,
  generateRecipientKeys,
  signLayer2Plain,
  verifyLayer2Signature,
} from "../src/weba_l2crypto";

describe("canonicalJson", () => {
  it("sorts keys and removes whitespace", () => {
    const input = { b: 1, a: [true, { z: 0, y: "hi" }] };
    expect(canonicalJson(input)).toBe('{"a":[true,{"y":"hi","z":0}],"b":1}');
  });

  it("rejects floats", () => {
    expect(() => canonicalJson(1.5)).toThrow();
  });
});

describe("layer2 encrypt/decrypt", () => {
  it("roundtrips payload", () => {
    const keys = generateRecipientKeys({ recipientKid: "issuer#kem-2025" });
    const layer2Plain = { answer: "yes", count: 2 };
    const sig = signLayer2Plain(layer2Plain, keys.user_sig);
    const payload = buildLayer2Payload(layer2Plain, sig);

    const envelope = encryptLayer2Payload({
      layer1_ref: "sha256:abcd",
      recipient_kid: keys.recipient_kid,
      payload,
      recipient_public_jwk: keys.x25519.public_jwk,
    });

    const { payload: decrypted } = decryptLayer2Envelope({
      envelope,
      recipient_keys: keys,
    });

    expect(decrypted).toEqual(payload);
  });

  it("fails when layer1_ref changes", () => {
    const keys = generateRecipientKeys({ recipientKid: "issuer#kem-2025" });
    const layer2Plain = { answer: "yes", count: 2 };
    const sig = signLayer2Plain(layer2Plain, keys.user_sig);
    const payload = buildLayer2Payload(layer2Plain, sig);

    const envelope = encryptLayer2Payload({
      layer1_ref: "sha256:abcd",
      recipient_kid: keys.recipient_kid,
      payload,
      recipient_public_jwk: keys.x25519.public_jwk,
    });

    const tampered = structuredClone(envelope);
    tampered.layer1_ref = "sha256:zzzz";

    expect(() =>
      decryptLayer2Envelope({
        envelope: tampered,
        recipient_keys: keys,
      }),
    ).toThrow();
  });

  it("fails when ciphertext changes", () => {
    const keys = generateRecipientKeys({ recipientKid: "issuer#kem-2025" });
    const layer2Plain = { answer: "yes", count: 2 };
    const sig = signLayer2Plain(layer2Plain, keys.user_sig);
    const payload = buildLayer2Payload(layer2Plain, sig);

    const envelope = encryptLayer2Payload({
      layer1_ref: "sha256:abcd",
      recipient_kid: keys.recipient_kid,
      payload,
      recipient_public_jwk: keys.x25519.public_jwk,
    });

    const tampered = structuredClone(envelope);
    const ct = b64urlDecode(tampered.layer2.ciphertext);
    ct[0] = ct[0] ^ 0xff;
    tampered.layer2.ciphertext = b64urlEncode(ct);

    expect(() =>
      decryptLayer2Envelope({
        envelope: tampered,
        recipient_keys: keys,
      }),
    ).toThrow();
  });
});

describe("signature", () => {
  it("fails if plaintext changes", () => {
    const keys = generateRecipientKeys({ recipientKid: "issuer#kem-2025" });
    const layer2Plain = { answer: "yes", count: 2 };
    const sig = signLayer2Plain(layer2Plain, keys.user_sig);

    const ok = verifyLayer2Signature({ answer: "no", count: 2 }, sig, keys.user_sig.public_jwk);
    expect(ok).toBe(false);
  });
});
