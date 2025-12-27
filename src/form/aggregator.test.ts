import { describe, expect, test } from "bun:test";
import {
  extractJsonLdFromHtml,
  extractL2EnvelopeFromHtml,
  extractPlainFromHtml,
  buildRowFromPlain,
  flattenForCsv,
  type L2KeyFile,
} from "./aggregator";
import {
  encryptLayer2,
  generateRecipientKeyPair,
  generateUserKeyPair,
  signLayer2,
  type Layer2Payload,
} from "../core/l2crypto";

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

  test("extracts and decrypts L2 envelope", async () => {
    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();
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

  test("throws on recipient_kid mismatch", async () => {
    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();
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

  test("flattens nested JSON for CSV", () => {
    const input = {
      org: { name: "ACME", addr: { city: "Tokyo" } },
      list: [{ v: 1 }, { v: 2 }],
      flag: true,
    };
    const flat = flattenForCsv(input);
    expect(flat["org.name"]).toBe("ACME");
    expect(flat["org.addr.city"]).toBe("Tokyo");
    expect(flat["list[0].v"]).toBe(1);
    expect(flat["list[1].v"]).toBe(2);
    expect(flat["flag"]).toBe(true);
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
