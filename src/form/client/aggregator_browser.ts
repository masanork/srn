import { b64urlDecode, decryptLayer2Envelope, type Layer2Encrypted } from "./l2crypto";

type L2KeyFile = {
  recipient_kid?: string;
  recipient_x25519_private: string;
  recipient_pqc_private?: string;
  recipient_pqc_kem?: string;
};

type ExtractedPlain = {
  plain?: any;
  sig?: any;
  source: "l2" | "jsonld" | null;
};

function parseHtml(html: string): Document | null {
  if (typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  if (typeof document !== "undefined") {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
  return null;
}

function extractScriptById(html: string, id: string): string | null {
  const doc = parseHtml(html);
  if (doc) {
    const script = doc.getElementById(id);
    return script?.textContent ?? null;
  }
  const re = new RegExp(`<script[^>]*id=[\"']${id}[\"'][^>]*>([\\s\\S]*?)<\\/script>`, "i");
  const match = html.match(re);
  return match ? match[1] : null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractScriptByType(html: string, type: string): string | null {
  const doc = parseHtml(html);
  if (doc) {
    const script = doc.querySelector(`script[type="${type}"]`);
    return script?.textContent ?? null;
  }
  const re = new RegExp(
    `<script[^>]*type=[\"']${escapeRegex(type)}[\"'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i",
  );
  const match = html.match(re);
  return match ? match[1] : null;
}

export function extractJsonLdFromHtml(html: string): any | null {
  const dataLayer = extractScriptById(html, "data-layer");
  if (dataLayer) {
    try {
      return JSON.parse(dataLayer);
    } catch {
      return null;
    }
  }
  const ldScript = extractScriptByType(html, "application/ld+json");
  if (ldScript) {
    try {
      return JSON.parse(ldScript);
    } catch {
      return null;
    }
  }
  return null;
}

export function extractL2EnvelopeFromHtml(html: string): Layer2Encrypted | null {
  const script = extractScriptById(html, "weba-l2-envelope");
  if (!script) return null;
  try {
    return JSON.parse(script) as Layer2Encrypted;
  } catch {
    return null;
  }
}

function parseKeyJson(raw: string): L2KeyFile | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as L2KeyFile;
    if (!parsed.recipient_x25519_private) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseKeyScript(): L2KeyFile | null {
  const script = document.getElementById("weba-l2-keys");
  if (!script?.textContent) return null;
  return parseKeyJson(script.textContent);
}

export function flattenForCsv(obj: Record<string, any>): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  const walk = (value: any, prefix: string) => {
    if (value === null || value === undefined) {
      out[prefix] = null;
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, idx) => {
        walk(entry, prefix ? `${prefix}[${idx}]` : `[${idx}]`);
      });
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => {
        const next = prefix ? `${prefix}.${k}` : k;
        walk(v, next);
      });
      return;
    }
    out[prefix] = value;
  };
  walk(obj, "");
  if ("" in out) delete out[""];
  return out;
}

export function buildRowFromPlain(params: {
  plain: any;
  filename: string;
  includeJson?: boolean;
  sig?: any;
  omitKey?: (key: string) => boolean;
}): { row: any; keys: Set<string> } {
  const row: any = { _filename: params.filename };
  const keys = new Set<string>(["_filename"]);
  if (params.includeJson) {
    keys.add("_json");
    row._json = JSON.stringify(params.plain);
  }
  const flat = flattenForCsv(params.plain || {});
  for (const key of Object.keys(flat)) {
    if (params.omitKey && params.omitKey(key)) continue;
    keys.add(key);
    row[key] = flat[key];
  }
  if (params.sig) {
    keys.add("_l2_sig");
    row._l2_sig = JSON.stringify(params.sig);
  }
  return { row, keys };
}

async function extractPlainFromHtml(html: string, l2Keys?: L2KeyFile | null): Promise<ExtractedPlain> {
  const l2Envelope = extractL2EnvelopeFromHtml(html);
  if (l2Envelope && l2Keys) {
    if (l2Keys.recipient_kid && l2Envelope.layer2?.recipient && l2Keys.recipient_kid !== l2Envelope.layer2.recipient) {
      throw new Error(`recipient_kid mismatch (${l2Envelope.layer2.recipient})`);
    }
    const recipientSk = b64urlDecode(l2Keys.recipient_x25519_private);
    const pqc =
      l2Keys.recipient_pqc_private && l2Keys.recipient_pqc_kem === "ML-KEM-768"
        ? {
            pqcProvider: (globalThis as any).webaPqcKem ?? null,
            pqcRecipientSk: b64urlDecode(l2Keys.recipient_pqc_private),
          }
        : undefined;
    const payload = await decryptLayer2Envelope(l2Envelope, recipientSk, pqc);
    return {
      plain: (payload as any).layer2_plain ?? payload,
      sig: (payload as any).layer2_sig,
      source: "l2",
    };
  }
  const jsonLd = extractJsonLdFromHtml(html);
  if (jsonLd) return { plain: jsonLd, source: "jsonld" };
  return { source: null };
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: any[], keys: string[]): string {
  const lines: string[] = [];
  lines.push(keys.map(escapeCsv).join(","));
  rows.forEach((row) => {
    const line = keys.map((key) => escapeCsv(row[key])).join(",");
    lines.push(line);
  });
  return "\ufeff" + lines.join("\n");
}

function renderTable(root: HTMLElement, rows: any[], keys: string[]) {
  if (rows.length === 0) {
    root.innerHTML = "<div class=\"agg-empty\">No rows to display.</div>";
    return;
  }
  const header = keys.map((key) => `<th>${key}</th>`).join("");
  const body = rows
    .slice(0, 20)
    .map((row) => {
      const cells = keys.map((key) => `<td>${row[key] ?? ""}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  root.innerHTML = `<table class="agg-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

export function initAggregatorBrowser() {
  const root = document.getElementById("aggregator-root");
  if (!root) return;

  root.innerHTML = `
    <div class="agg-panel">
      <div class="agg-row">
        <label class="agg-label">Input HTML</label>
        <input id="weba-agg-files" type="file" accept=".html" multiple />
      </div>
      <div class="agg-row">
        <label class="agg-label">L2 Key (embedded)</label>
        <div id="weba-agg-key-status" class="agg-chip">Not loaded</div>
        <div class="agg-note">Use <code>&lt;script id="weba-l2-keys"&gt;</code> to embed.</div>
      </div>
      <div class="agg-row">
        <label class="agg-label">Include JSON</label>
        <input id="weba-agg-include-json" type="checkbox" />
      </div>
      <div class="agg-row">
        <button id="weba-agg-run" class="agg-btn">Decrypt & Aggregate</button>
        <button id="weba-agg-download" class="agg-btn secondary" disabled>Download CSV</button>
      </div>
      <div id="weba-agg-status" class="agg-status">Ready.</div>
    </div>
    <div id="weba-agg-output" class="agg-output"></div>
  `;

  const fileInput = root.querySelector<HTMLInputElement>("#weba-agg-files");
  const status = root.querySelector<HTMLDivElement>("#weba-agg-status");
  const output = root.querySelector<HTMLDivElement>("#weba-agg-output");
  const includeJson = root.querySelector<HTMLInputElement>("#weba-agg-include-json");
  const runBtn = root.querySelector<HTMLButtonElement>("#weba-agg-run");
  const dlBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download");
  const keyStatus = root.querySelector<HTMLDivElement>("#weba-agg-key-status");

  let cachedCsv = "";

  const embeddedKey = parseKeyScript();
  if (keyStatus) {
    keyStatus.textContent = embeddedKey?.recipient_kid ? `Loaded (${embeddedKey.recipient_kid})` : embeddedKey ? "Loaded" : "Not loaded";
    keyStatus.classList.toggle("ready", !!embeddedKey);
  }

  const runAggregation = async () => {
    if (!fileInput?.files || fileInput.files.length === 0) {
      if (status) status.textContent = "Select HTML files first.";
      return;
    }
    if (status) status.textContent = "Processing...";
    if (dlBtn) dlBtn.disabled = true;

    const rows: any[] = [];
    const keys = new Set<string>(["_filename"]);
    let processed = 0;
    let errors = 0;

    const l2Keys = embeddedKey;

    for (const file of Array.from(fileInput.files)) {
      try {
        const html = await file.text();
        const extracted = await extractPlainFromHtml(html, l2Keys);
        if (extracted.source === "l2" && extracted.plain) {
          const built = buildRowFromPlain({
            plain: extracted.plain,
            filename: file.name,
            includeJson: includeJson?.checked,
            sig: extracted.sig,
          });
          built.keys.forEach((key) => keys.add(key));
          rows.push(built.row);
          processed += 1;
          continue;
        }

        if (extracted.source === "jsonld" && extracted.plain) {
          const built = buildRowFromPlain({
            plain: extracted.plain,
            filename: file.name,
            includeJson: includeJson?.checked,
            omitKey: (key) => key.startsWith("@"),
          });
          built.keys.forEach((key) => keys.add(key));
          rows.push(built.row);
          processed += 1;
          continue;
        }
        errors += 1;
      } catch (e) {
        console.error(e);
        errors += 1;
      }
    }

    const sortedKeys = Array.from(keys).sort((a, b) => {
      if (a === "_filename") return -1;
      if (b === "_filename") return 1;
      return a.localeCompare(b);
    });

    cachedCsv = buildCsv(rows, sortedKeys);
    if (dlBtn) dlBtn.disabled = rows.length === 0;
    if (status) status.textContent = `Processed ${processed} files. Errors: ${errors}.`;
    if (output) renderTable(output, rows, sortedKeys);
  };

  runBtn?.addEventListener("click", () => {
    runAggregation().catch((e) => {
      if (status) status.textContent = "Failed to aggregate.";
      console.error(e);
    });
  });

  dlBtn?.addEventListener("click", () => {
    if (!cachedCsv) return;
    const blob = new Blob([cachedCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weba-aggregated.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}
