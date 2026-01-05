import { describe, expect, test } from "bun:test";
import {
  extractJsonLdFromHtml,
  extractL2EnvelopeFromHtml,
  extractPlainFromHtml,
  buildRowFromPlain,
  type L2KeyFile,
} from "./aggregator";
import { flattenForCsv } from "./aggregator_engine";
import {
  encryptLayer2,
  generateRecipientKeyPair,
  generateUserKeyPair,
  deriveOrgX25519KeyPair,
  signLayer2,
  type Layer2Payload,
} from "@srn/core";

describe("Web/A Aggregator", () => {
  test("extracts JSON-LD when present", async () => {
    const html = `
      <html><body>
        <script type="application/ld+json">{"foo":"bar"}</script>
      </body></html>
    `;
    const json = extractJsonLdFromHtml(html);
    expect(json?.foo).toBe("bar");
    const extracted = await extractPlainFromHtml(html, null);
    expect(extracted.source).toBe("jsonld");
    expect(extracted.plain?.foo).toBe("bar");
  });

  test("extracts JSON-LD from data-layer script", () => {
    const html = `<html><body><script id="data-layer" type="application/json">{"baz":123}</script></body></html>`;
    const json = extractJsonLdFromHtml(html);
    expect(json?.baz).toBe(123);
  });

  test("returns null for invalid JSON in script", () => {
    const html = `<html><body><script type="application/ld+json">{invalid}</script></body></html>`;
    expect(extractJsonLdFromHtml(html)).toBeNull();
  });

  test("falls back to JSON-LD when L2 keys are missing", async () => {
    const html = `
      <html><body>
        <script id="weba-l2-envelope" type="application/json">{"layer1_ref":"sha256:abcd","layer2":{"recipient":"issuer#kem-2025"}}</script>
        <script type="application/ld+json">{"foo":"bar"}</script>
      </body></html>
    `;
    const extracted = await extractPlainFromHtml(html, null);
    expect(extracted.source).toBe("jsonld");
    expect(extracted.plain?.foo).toBe("bar");
  });

  test("extracts and decrypts L2 envelope", async () => {
    const recipient = await generateRecipientKeyPair();
    const user = await generateUserKeyPair();
    const layer2Plain = { answer: "yes", count: 2 };
    const sig = await signLayer2(layer2Plain, user.privateKey, "user#sig-1");
    const payload: Layer2Payload = { layer2_plain: layer2Plain, layer2_sig: sig };
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "sha256:abcd",
      "issuer#kem-2025",
    );
    const html = `
      <html><body>
        <script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script>
      </body></html>
    `;

    const parsedEnvelope = extractL2EnvelopeFromHtml(html);
    expect(parsedEnvelope?.layer1_ref).toBe("sha256:abcd");

    const keys: L2KeyFile = {
      recipient_kid: "issuer#kem-2025",
      recipient_x25519_private: Buffer.from(recipient.privateKey).toString("base64url"),
    };
    const extracted = await extractPlainFromHtml(html, keys);
    expect(extracted.source).toBe("l2");
    expect(extracted.plain?.answer).toBe("yes");
  });

  test("decrypts with org root key", async () => {
    const orgRoot = new Uint8Array(32).fill(9);
    const derived = await deriveOrgX25519KeyPair({
      orgRootKey: orgRoot,
      campaignId: "campaign-1",
      layer1Ref: "sha256:abcd",
      keyPolicy: "campaign+layer1",
    });
    const user = await generateUserKeyPair();
    const layer2Plain = { answer: "org" };
    const sig = await signLayer2(layer2Plain, user.privateKey, "user#sig-1");
    const payload: Layer2Payload = { layer2_plain: layer2Plain, layer2_sig: sig };
    const envelope = await encryptLayer2(
      payload,
      derived.publicKey,
      "sha256:abcd",
      "issuer#kem-2025",
      { meta: { campaign_id: "campaign-1", key_policy: "campaign+layer1" } }
    );
    const html = `
      <html><body>
        <script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script>
      </body></html>
    `;

    const keys: L2KeyFile = {
      org_root_key: Buffer.from(orgRoot).toString("base64url"),
      org_campaign_id: "campaign-1",
      org_key_policy: "campaign+layer1",
    };
    const extracted = await extractPlainFromHtml(html, keys);
    expect(extracted.source).toBe("l2");
    expect(extracted.plain?.answer).toBe("org");
  });

  test("throws on recipient_kid mismatch", async () => {
    const recipient = await generateRecipientKeyPair();
    const user = await generateUserKeyPair();
    const layer2Plain = { answer: "yes" };
    const sig = await signLayer2(layer2Plain, user.privateKey, "user#sig-1");
    const payload: Layer2Payload = { layer2_plain: layer2Plain, layer2_sig: sig };
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "sha256:abcd",
      "issuer#kem-2025",
    );
    const html = `
      <html><body>
        <script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script>
      </body></html>
    `;

    const keys: L2KeyFile = {
      recipient_kid: "issuer#kem-2026",
      recipient_x25519_private: Buffer.from(recipient.privateKey).toString("base64url"),
    };
    await expect(extractPlainFromHtml(html, keys)).rejects.toThrow(
      "recipient_kid mismatch",
    );
  });

  test("decrypts with pre-key from keystore", async () => {
    const recipient = await generateRecipientKeyPair();
    const user = await generateUserKeyPair();
    const layer2Plain = { answer: "pfs" };
    const sig = await signLayer2(layer2Plain, user.privateKey, "user#sig-1");
    const payload: Layer2Payload = { layer2_plain: layer2Plain, layer2_sig: sig };
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "sha256:abcd",
      "pre_abc",
    );
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script></body></html>`;

    const keys: L2KeyFile = {
      prekey_keystore: {
        updated_at: "2025-01-01T00:00:00Z",
        keys: {
          "pre_abc": {
            privateKey: Buffer.from(recipient.privateKey).toString("base64url")
          }
        }
      }
    };
    const extracted = await extractPlainFromHtml(html, keys);
    expect(extracted.plain?.answer).toBe("pfs");
  });

  test("decrypts with epoch key from keystore", async () => {
    const recipient = await generateRecipientKeyPair();
    const user = await generateUserKeyPair();
    const layer2Plain = { answer: "epoch" };
    const sig = await signLayer2(layer2Plain, user.privateKey, "user#sig-1");
    const payload: Layer2Payload = { layer2_plain: layer2Plain, layer2_sig: sig };
    const envelope = await encryptLayer2(
      payload,
      recipient.publicKey,
      "sha256:abcd",
      "epoch_2025_01",
    );
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script></body></html>`;

    const keys: L2KeyFile = {
      epoch_keystore: {
        updated_at: "2025-01-01T00:00:00Z",
        keys: [{
          kid: "epoch_2025_01",
          publicKey: "", // not used for decryption
          privateKey: Buffer.from(recipient.privateKey).toString("base64url"),
          validFrom: "2025-01-01T00:00:00Z",
          validUntil: "2025-02-01T00:00:00Z"
        }]
      }
    };
    const extracted = await extractPlainFromHtml(html, keys);
    expect(extracted.plain?.answer).toBe("epoch");
  });

  test("flattens nested JSON for CSV", () => {
    const input = {
      org: { name: "ACME", addr: { city: "Tokyo" } },
      list: [{ v: 1 }, { v: 2 }],
      flag: true,
      empty: null,
      val: 42
    };
    const flat = flattenForCsv(input);
    expect(flat["org.name"]).toBe("ACME");
    expect(flat["org.addr.city"]).toBe("Tokyo");
    expect(flat["list[0].v"]).toBe(1);
    expect(flat["list[1].v"]).toBe(2);
    expect(flat["flag"]).toBe(true);
    expect(flat["empty"]).toBe(null);
    expect(flat["val"]).toBe(42);
  });

  test("flattenForCsv handles edge cases", () => {
    expect(flattenForCsv({ "": "root" })[""]).toBeUndefined();
    expect(flattenForCsv({ a: undefined })["a"]).toBeNull();
  });

  test("extractPlainFromHtml throws when campaign ID is missing for org root", async () => {
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">{"meta":{}}</script></body></html>`;
    const keys: L2KeyFile = { org_root_key: "aaaa" };
    await expect(extractPlainFromHtml(html, keys)).rejects.toThrow("org_campaign_id is required");
  });

  test("extractPlainFromHtml throws when no key is provided", async () => {
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">{"layer2":{}}</script></body></html>`;
    const keys: L2KeyFile = {};
    await expect(extractPlainFromHtml(html, keys)).rejects.toThrow("No recipient key derived or found in keystore");
  });

  test("builds row with raw JSON when enabled", () => {
    const plain = { foo: "bar" };
    const built = buildRowFromPlain({
      plain,
      filename: "file.html",
      includeJson: true,
    });
    expect(built.row._json).toBe(JSON.stringify(plain));
    expect(built.keys.has("_json")).toBe(true);
    expect(built.row.foo).toBe("bar");
  });
});
