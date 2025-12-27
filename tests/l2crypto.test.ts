import { expect, test, describe } from "bun:test";
import {
  canonicalJson,
  generateRecipientKeyPair,
  generateUserKeyPair,
  signLayer2,
  encryptLayer2,
  decryptLayer2,
  verifyLayer2Signature,
  Layer2Payload,
} from "../src/core/l2crypto.ts";

describe("Web/A Layer 2 Crypto", () => {
  test("Canonical JSON should be deterministic", () => {
    const obj1 = { b: 2, a: 1, c: { e: 5, d: 4 } };
    const obj2 = { a: 1, c: { d: 4, e: 5 }, b: 2 };
    expect(canonicalJson(obj1)).toBe(canonicalJson(obj2));
    expect(canonicalJson(obj1)).toBe('{"a":1,"b":2,"c":{"d":4,"e":5}}');
  });

  test("Roundtrip encryption and signature", async () => {
    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();
    const layer1Ref = "sha256:test-form-hash";
    const plain = {
      question1: "Answer 1",
      question2: 42,
      nested: { foo: "bar" }
    };

    // 1. Sign
    const sig = await signLayer2(plain, user.privateKey, "user#1");
    const payload: Layer2Payload = {
      layer2_plain: plain,
      layer2_sig: sig,
    };

    // 2. Encrypt
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      layer1Ref,
      "issuer#1"
    );

    // 3. Decrypt
    const decryptedPayload = await decryptLayer2(envelope, recipient.privateKey);
    
    expect(decryptedPayload.layer2_plain).toEqual(plain);

    // 4. Verify Signature
    const isSigValid = verifyLayer2Signature(decryptedPayload, user.publicKey);
    expect(isSigValid).toBe(true);
  });

  test("Decryption fails if AAD is tampered", async () => {
    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();
    const plain = { hello: "world" };
    const sig = await signLayer2(plain, user.privateKey, "user#1");
    const payload = { layer2_plain: plain, layer2_sig: sig };
    
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "ref1",
      "issuer#1"
    );

    // Tamper with layer1_ref in envelope (not AAD byte array yet)
    envelope.layer1_ref = "ref2";
    
    // Decrypt should fail because of AAD mismatch check in decryptLayer2
    // or if we tampered the actual AAD bytes, the GCM auth would fail.
    await expect(decryptLayer2(envelope, recipient.privateKey)).rejects.toThrow("AAD mismatch");
  });

  test("Decryption fails if ciphertext is tampered", async () => {
    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();
    const plain = { hello: "world" };
    const sig = await signLayer2(plain, user.privateKey, "user#1");
    const payload = { layer2_plain: plain, layer2_sig: sig };
    
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "ref1",
      "issuer#1"
    );

    // Tamper with ciphertext
    const ct = Buffer.from(envelope.layer2.ciphertext, "base64url");
    ct[0] ^= 0xff;
    envelope.layer2.ciphertext = ct.toString("base64url");

    await expect(decryptLayer2(envelope, recipient.privateKey)).rejects.toThrow();
  });
});
