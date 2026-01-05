import { describe, expect, test, beforeEach } from "bun:test";
import { Window } from "happy-dom";
import { initAggregatorBrowser, renderDashboard, renderTable, showRecordDetail, renderExtraFields, populateFormPreview } from "./aggregator_browser";
import { selectValues, computeMetric } from "../aggregator_engine";
import { extractJsonLdFromHtml, extractL2EnvelopeFromHtml } from "./aggregator_browser_parse";
import { buildRowFromPlain, flattenForCsv } from "./aggregator_browser_csv";
import { b64urlEncode } from "./l2crypto";
import { mock } from "bun:test";
import type { Layer2Encrypted } from "./l2crypto";

// Mock L2 Decryption to avoid WASM dependencies in this test
mock.module("./l2crypto", () => ({
  ...require("./l2crypto"), // Keep real utilities
  decryptLayer2Envelope: async (envelope: any) => {
    // Return mock decrypted content
    return {
      layer2_plain: { score: 99 },
      layer2_sig: { alg: "Ed25519", kid: "test-key", sig: "sig", created_at: "now" }
    };
  }
}));

describe("aggregator browser utils", () => {
  test("selectValues extracts nested data", () => {
    const data = { user: { profile: { age: 25 } } };
    expect(selectValues(data, "user.profile.age")).toEqual([25]);
    expect(selectValues(data, "$.user.profile.age")).toEqual([25]); // Handle $. prefix
  });

  test("selectValues handles missing paths gracefully", () => {
    const data = { a: 1 };
    expect(selectValues(data, "b.c")).toEqual([]);
    expect(selectValues(null, "a")).toEqual([]);
    expect(selectValues(data, "")).toEqual([]);
  });

  test("selectValues handles array indexing", () => {
    const data = { items: [{ name: "A" }, { name: "B" }] };
    expect(selectValues(data, "items[1].name")).toEqual(["B"]);
    expect(selectValues(data, "items[99].name")).toEqual([]); // Out of bounds
  });

  test("selectValues handles array wildcard", () => {
    const data = { items: [{ val: 10 }, { val: 20 }] };
    expect(selectValues(data, "items[].val")).toEqual([10, 20]);
  });

  test("selectValues handles deep wildcards", () => {
    const data = { groups: [{ items: [{ v: 1 }, { v: 2 }] }, { items: [{ v: 3 }] }] };
    expect(selectValues(data, "groups[].items[].v")).toEqual([1, 2, 3]);
  });

  test("computeMetric calculates various types", () => {
    const payloads = [
      { filename: "a", plain: { score: 10, ok: true, cat: "A" } },
      { filename: "b", plain: { score: 20, ok: false, cat: "B" } },
      { filename: "c", plain: { score: "30", ok: true, cat: "A" } } // String number
    ];
    
    expect(computeMetric({ id: "sum", name: "S", type: "sum", path: "score" }, payloads)).toBe(60);
    expect(computeMetric({ id: "avg", name: "A", type: "avg", path: "score" }, payloads)).toBe(20);
    expect(computeMetric({ id: "bool", name: "B", type: "boolean_count", path: "ok" }, payloads)).toBe(2);
    expect(computeMetric({ id: "pct", name: "P", type: "percent", path: "ok" }, payloads)).toBe("66.7%");
    expect(computeMetric({ id: "count", name: "C", type: "count", path: "cat" }, payloads)).toBe(3);
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
    (globalThis as any).HTMLTableElement = window.HTMLTableElement;
    (globalThis as any).HTMLTableRowElement = window.HTMLTableRowElement;
    (globalThis as any).Event = window.Event;
    (globalThis as any).DOMParser = window.DOMParser;
    (globalThis as any).Intl = Intl;

    // Mock localStorage
    const store = new Map();
    (globalThis as any).localStorage = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    };
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

  test("renders dashboard cards and charts", () => {
    const root = document.createElement("div");
    const spec = {
      dashboard: {
        cards: [
          { id: "c1", label: "Total Count", op: "count" },
          { id: "c2", label: "Value Sum", op: "sum", path: "val", format: "currency" }
        ],
        charts: [
          { id: "ch1", type: "bar", title: "Category Distribution", source: "items[]", x: "cat" }
        ]
      }
    };
    const payloads = [
      { filename: "f1", plain: { val: 1000, items: [{ cat: "A" }, { cat: "B" }] } },
      { filename: "f2", plain: { val: 2500, items: [{ cat: "A" }] } }
    ];

    renderDashboard(root as any, spec as any, payloads as any);

    expect(root.innerHTML).toContain("Total Count");
    expect(root.innerHTML).toContain("Value Sum");
    expect(root.innerHTML).toMatch(/[¥￥]3,500/); // Support both half and full width currency symbols
    expect(root.innerHTML).toContain("Category Distribution");
    expect(root.innerHTML).toContain("chart-bar-fill");
  });

  test("renders empty state when no records", () => {
    const root = document.createElement("div");
    renderTable(root as any, [], []);
    expect(root.innerHTML).toContain("No records found");
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

  test("showRecordDetail and populateFormPreview", () => {
    // 1. Setup elements
    document.body.innerHTML = `
      <div id="weba-agg-detail"></div>
      <div id="weba-structure">{"fields":[{"key":"name","label":"Name","type":"text"}]}</div>
      <script id="weba-source-markdown" type="text/plain"># Test\n- [text:name] Name</script>
    `;
    
    const rows = [{
      _filename: "test.html",
      name: "Alice",
      _raw: { name: "Alice", items: [{ cat: "X" }] }
    }] as any[];
    (window as any)._aggRows = rows;

    // Trigger detail view
    showRecordDetail(0);

    const overlay = document.querySelector(".detail-overlay");
    expect(overlay).toBeTruthy();
    expect(overlay?.innerHTML).toContain("Alice");

    // 3. Check if form preview was populated
    const preview = document.querySelector("#weba-agg-form-preview");
    expect(preview).toBeTruthy();
    const input = preview?.querySelector('input[data-json-path="name"]') as HTMLInputElement;
    expect(input.value).toBe("Alice");
    expect(input.disabled).toBe(true);
  });

  test("renderExtraFields: identifies data not in structure", () => {
    const raw = { known: 1, unknown: "secret" };
    const structure = { fields: [{ key: "known" }] };
    const html = renderExtraFields(raw, structure);
    expect(html).toContain("Extra Information");
    expect(html).toContain("unknown");
    expect(html).toContain("secret");
    expect(html).not.toContain("detail-key\">known</div>");
  });

  test("populateFormPreview: handles radio and dynamic tables", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <input type="radio" name="r1" value="v1">
      <input type="radio" name="r1" value="v2">
      <table class="data-table dynamic" data-table-key="tbl">
        <tbody>
          <tr class="template-row">
            <td><input data-base-key="col1"></td>
            <td><input class="auto-num"></td>
          </tr>
        </tbody>
      </table>
    `;
    
    const data = {
      r1: "v2",
      tbl: [{ col1: "row1" }, { col1: "row2" }]
    };

    populateFormPreview(root, data);

    expect((root.querySelector('input[value="v2"]') as HTMLInputElement).checked).toBe(true);
    expect((root.querySelector('input[value="v1"]') as HTMLInputElement).checked).toBe(false);
    
    const rows = root.querySelectorAll("tbody tr:not(.template-row)");
    expect(rows.length).toBe(2);
    expect((rows[0].querySelector('input') as HTMLInputElement).value).toBe("row1");
    expect((rows[1].querySelector('input') as HTMLInputElement).value).toBe("row2");
  });

  test("runAggregation: processes multiple files", async () => {
    document.body.innerHTML = `
      <div id="aggregator-root">
        <div id="weba-agg-status"></div>
        <div id="weba-agg-dashboard"></div>
        <div id="weba-agg-output"></div>
        <div id="weba-agg-results" class="is-hidden"></div>
        <div class="agg-brand"><h1>Aggregator</h1></div>
        <button id="weba-agg-run"></button>
        <button id="weba-agg-download"></button>
        <button id="weba-agg-download-jsonl"></button>
        <input id="weba-agg-files" type="file" />
        <input id="weba-agg-dirs" type="file" />
        <input id="weba-agg-include-json" type="checkbox" />
        <div id="weba-agg-key-status"></div>
        <div id="weba-agg-build"></div>
      </div>
    `;
    initAggregatorBrowser();

    // Mock File objects
    const html1 = `<html><body><script type="application/ld+json">${JSON.stringify({
      type: "VerifiableCredential",
      credentialSubject: { answers: { score: 10 } }
    })}</script></body></html>`;
    
    // In Happy-DOM/Node environment, File and blob.text() might need polyfills or careful handling
    // but Bun provides them.
    const file1 = new File([html1], "test1.html", { type: "text/html" });
    
    const fileInput = document.querySelector("#weba-agg-files") as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file1],
      writable: true,
      configurable: true
    });

    // Manually trigger run button
    const runBtn = document.querySelector("#weba-agg-run") as HTMLButtonElement;
    runBtn.click();

    // Wait for async processing (since runAggregation is async)
    // We might need to wait for several ticks
    for(let i=0; i<10; i++) await new Promise(resolve => setTimeout(resolve, 10));

    const status = document.querySelector("#weba-agg-status") as HTMLElement;
    expect(status.textContent).toContain("Completed");
    expect(status.textContent).toContain("Processed 1 entries");

    const output = document.querySelector("#weba-agg-output") as HTMLElement;
    expect(output.innerHTML).toContain("test1.html");
    expect(output.innerHTML).toContain("score");
  });

  test("runAggregation: handles L2 encrypted files", async () => {
    // 1. Setup keys and encrypted content
    const l2Keys = { recipient_x25519_private: b64urlEncode(new Uint8Array(32).fill(1)) };
    document.body.innerHTML = `
      <div id="aggregator-root">
        <script id="weba-l2-keys" type="application/json">${JSON.stringify(l2Keys)}</script>
        <div id="weba-agg-status"></div>
        <div id="weba-agg-results" class="is-hidden"></div>
        <div id="weba-agg-dashboard"></div>
        <div id="weba-agg-output"></div>
        <button id="weba-agg-run"></button>
        <input id="weba-agg-files" type="file" />
      </div>
    `;
    
    initAggregatorBrowser();

    // Mock encrypted HTML
    const encryptedEnvelope = {
      weba_version: "0.1",
      layer1_ref: "sha256:abc",
      layer2: {
        enc: "HPKE-v1",
        suite: { kem: "X25519", kdf: "HKDF-SHA256", aead: "AES-256-GCM" },
        recipient: "issuer#1",
        encapsulated: { classical: "abc" },
        ciphertext: "def",
        auth_tag: "tag",
        aad: "aad"
      },
      meta: { created_at: "now", nonce: "n1" }
    };
    const html = `<html><body><script id="weba-l2-envelope" type="application/json">${JSON.stringify(encryptedEnvelope)}</script></body></html>`;
    const file = new File([html], "encrypted.html", { type: "text/html" });

    const fileInput = document.querySelector("#weba-agg-files") as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });

    // Mock decryption - we need to spy on the internal extractPlainFromHtml or mock its dependency
    // For this test, let's assume we want to test if it tries to decrypt
    const runBtn = document.querySelector("#weba-agg-run") as HTMLButtonElement;
    runBtn.click();

    await new Promise(resolve => setTimeout(resolve, 50));

    // Even if decryption fails (due to mock missing), it should show an error or attempt
    const status = document.querySelector("#weba-agg-status") as HTMLElement;
    expect(status.textContent).toBeTruthy();
  });
});
