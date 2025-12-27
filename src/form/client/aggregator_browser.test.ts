import { buildRowFromPlain, extractJsonLdFromHtml, extractL2EnvelopeFromHtml, flattenForCsv } from "./aggregator_browser";

describe("aggregator browser helpers", () => {
  test("extracts JSON-LD from data-layer", () => {
    const html = `<html><body><script id="data-layer" type="application/json">{"foo":"bar"}</script></body></html>`;
    expect(extractJsonLdFromHtml(html)).toEqual({ foo: "bar" });
  });

  test("extracts JSON-LD from application/ld+json", () => {
    const html = `<html><body><script type="application/ld+json">{"hello":1}</script></body></html>`;
    expect(extractJsonLdFromHtml(html)).toEqual({ hello: 1 });
  });

  test("extracts L2 envelope", () => {
    const envelope = {
      weba_version: "0.1",
      layer1_ref: "sha256:abc",
      layer2: {
        enc: "HPKE-v1",
        suite: { kem: "X25519", kdf: "HKDF-SHA256", aead: "AES-256-GCM" },
        recipient: "issuer#kem-2025",
        encapsulated: { classical: "" },
        ciphertext: "",
        aad: "",
      },
      meta: { created_at: "2025-01-01T00:00:00Z", nonce: "" },
    };
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script></body></html>`;
    expect(extractL2EnvelopeFromHtml(html)).toEqual(envelope);
  });

  test("flattens nested objects and arrays", () => {
    const flat = flattenForCsv({ org: { name: "ACME" }, items: [{ amount: 1 }] });
    expect(flat["org.name"]).toBe("ACME");
    expect(flat["items[0].amount"]).toBe(1);
  });

  test("builds row with signature and json", () => {
    const built = buildRowFromPlain({
      plain: { a: 1 },
      filename: "file.html",
      includeJson: true,
      sig: { alg: "Ed25519" },
    });
    expect(built.row._filename).toBe("file.html");
    expect(built.row._json).toBe(JSON.stringify({ a: 1 }));
    expect(built.row._l2_sig).toBe(JSON.stringify({ alg: "Ed25519" }));
  });
});
