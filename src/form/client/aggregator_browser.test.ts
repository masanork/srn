import { describe, expect, test, beforeEach } from "bun:test";
import { Window } from "happy-dom";
import { initAggregatorBrowser, selectValues, computeMetric, renderDashboard, renderTable } from "./aggregator_browser";
import { extractJsonLdFromHtml, extractL2EnvelopeFromHtml } from "./aggregator_browser_parse";
import { buildRowFromPlain, flattenForCsv } from "./aggregator_browser_csv";
import type { Layer2Encrypted } from "./l2crypto";

describe("aggregator browser utils", () => {
  test("selectValues extracts nested data", () => {
    const data = { user: { profile: { age: 25 } } };
    expect(selectValues(data, "user.profile.age")).toEqual([25]);
  });

  test("selectValues handles array indexing", () => {
    const data = { items: [{ name: "A" }, { name: "B" }] };
    expect(selectValues(data, "items[1].name")).toEqual(["B"]);
  });

  test("selectValues handles array wildcard", () => {
    const data = { items: [{ val: 10 }, { val: 20 }] };
    expect(selectValues(data, "items[].val")).toEqual([10, 20]);
  });

  test("computeMetric calculates sum", () => {
    const payloads = [
      { filename: "a", plain: { score: 10 } },
      { filename: "b", plain: { score: 20 } }
    ];
    const val = computeMetric({ id: "sum", name: "S", type: "sum", path: "score" }, payloads);
    expect(val).toBe(30);
  });

  test("computeMetric calculates average", () => {
    const payloads = [
      { filename: "a", plain: { score: 10 } },
      { filename: "b", plain: { score: 20 } }
    ];
    const val = computeMetric({ id: "avg", name: "A", type: "avg", path: "score" }, payloads);
    expect(val).toBe(15);
  });

  test("computeMetric calculates percentage", () => {
    const payloads = [
      { filename: "a", plain: { ok: true } },
      { filename: "b", plain: { ok: false } }
    ];
    const val = computeMetric({ id: "pct", name: "P", type: "percent", path: "ok" }, payloads);
    expect(val).toBe("50.0%");
  });
});

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
    const envelope: Layer2Encrypted = {
      weba_version: "0.1",
      layer1_ref: "sha256:abc",
      layer2: {
        enc: "HPKE-v1",
        suite: { kem: "X25519", kdf: "HKDF-SHA256", aead: "AES-256-GCM" },
        recipient: "issuer#kem-2025",
        encapsulated: { classical: "" },
        ciphertext: "",
        auth_tag: "",
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
      sig: { alg: "Ed25519", kid: "k", sig: "s", created_at: "now" },
    });
    expect(built.row._filename).toBe("file.html");
    expect(built.row._json).toBe(JSON.stringify({ a: 1 }));
    expect(built.row._l2_sig).toBe(JSON.stringify({ alg: "Ed25519", kid: "k", sig: "s", created_at: "now" }));
  });
});

describe("aggregator browser UI", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window({ url: "http://localhost:3000/agg" });
    document = window.document as any;
    (globalThis as any).window = window;
    (globalThis as any).document = document;
    (globalThis as any).HTMLElement = window.HTMLElement;
    (globalThis as any).HTMLInputElement = window.HTMLInputElement;
    (globalThis as any).HTMLButtonElement = window.HTMLButtonElement;
    (globalThis as any).Event = window.Event;
    (globalThis as any).DOMParser = window.DOMParser;
    (globalThis as any).Intl = Intl;
  });

  test("renders UI with empty key status", () => {
    document.body.innerHTML = `<div id="aggregator-root"></div>`;
    initAggregatorBrowser();

    const status = document.querySelector("#weba-agg-key-status") as HTMLElement;
    const fileInput = document.querySelector("#weba-agg-files") as HTMLInputElement;
    expect(status.textContent).toBe("No keys detected");
    expect(fileInput).toBeTruthy();
  });

  test("renders UI with embedded key status", () => {
    document.body.innerHTML = `
      <div id="aggregator-root"></div>
      <script id="weba-l2-keys" type="application/json">${JSON.stringify({
      recipient_kid: "issuer#kem-2025",
      recipient_x25519_private: "abc",
    })}</script>
    `;
    initAggregatorBrowser();

    const status = document.querySelector("#weba-agg-key-status") as HTMLElement;
    expect(status.textContent).toBe("Loaded (issuer#kem-2025)");
    expect(status.classList.contains("ready")).toBe(true);
  });

  test("renders dashboard cards", () => {
    const root = document.createElement("div");
    const spec = {
      dashboard: {
        cards: [
          { id: "c1", label: "Total Count", op: "count" },
          { id: "c2", label: "Value Sum", op: "sum", path: "val" }
        ]
      }
    };
    const payloads = [
      { filename: "f1", plain: { val: 10 } },
      { filename: "f2", plain: { val: 25 } }
    ];

    renderDashboard(root as any, spec as any, payloads as any);

    expect(root.innerHTML).toContain("Total Count");
    expect(root.innerHTML).toContain("Value Sum");
    expect(root.innerHTML).toContain("35"); // Sum of 10 and 25
  });

  test("renders records table", () => {
    const root = document.createElement("div");
    const rows = [
      { _filename: "f1.html", name: "Alice", val: 10 },
      { _filename: "f2.html", name: "Bob", val: 20 }
    ];
    const keys = ["_filename", "name", "val"];

    renderTable(root as any, rows, keys);

    expect(root.innerHTML).toContain("Alice");
    expect(root.innerHTML).toContain("Bob");
    expect(root.innerHTML).toContain("f1.html");
    expect(root.innerHTML).toContain("2 records");
  });
});
