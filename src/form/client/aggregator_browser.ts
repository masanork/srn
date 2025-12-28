import { b64urlDecode, decryptLayer2Envelope, deriveOrgX25519KeyPair, type OrgKeyPolicy } from "./l2crypto";
import { buildCsv, buildRowFromPlain, flattenForCsv } from "./aggregator_browser_csv";
import { extractJsonLdFromHtml, extractL2EnvelopeFromHtml } from "./aggregator_browser_parse";

type L2KeyFile = {
  recipient_kid?: string;
  recipient_x25519_private?: string;
  recipient_pqc_private?: string;
  recipient_pqc_kem?: string;
  org_root_key?: string;
  org_campaign_id?: string;
  org_key_policy?: OrgKeyPolicy;
};

type ExtractedPlain = {
  plain?: any;
  sig?: any;
  source: "l2" | "jsonld" | null;
};

type AggFilter = {
  path: string;
  op: "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "exists";
  value?: any;
};

type AggMetric = {
  id: string;
  label?: string;
  op: "count" | "sum" | "avg" | "min" | "max";
  path?: string;
  format?: "number" | "currency" | "percent";
  filter?: AggFilter | AggFilter[];
};

type AggCard = AggMetric & {
  label: string;
};

type AggTable = {
  id: string;
  label?: string;
  group_by: string;
  metrics: AggMetric[];
  sort?: { by: string; order?: "asc" | "desc" };
  limit?: number;
};

type AggSpec = {
  version?: string;
  dashboard?: {
    title?: string;
    cards?: AggCard[];
    tables?: AggTable[];
  };
  export?: {
    jsonl?: boolean;
    parquet?: boolean;
  };
};

type RawPayload = {
  filename: string;
  plain: any;
  sig?: any;
};

function parseKeyJson(raw: string): L2KeyFile | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as L2KeyFile;
    if (!parsed.recipient_x25519_private && !parsed.org_root_key) return null;
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

function parseAggSpecScript(): AggSpec | null {
  const script = document.getElementById("weba-agg-spec");
  if (!script?.textContent) return null;
  try {
    const parsed = JSON.parse(script.textContent);
    if (Array.isArray(parsed)) return parsed[0] ?? null;
    return parsed;
  } catch {
    return null;
  }
}

function selectValues(source: any, path: string): any[] {
  const normalized = path.trim().replace(/^\$\./, "");
  if (!normalized) return [];
  const segments = normalized.split(".");
  let current: any[] = [source];
  for (const segment of segments) {
    const match = segment.match(/^(.*)\\[(\\d*)\\]$/);
    const key = match ? match[1] : segment;
    const indexPart = match ? match[2] : null;
    const isArrayAll = match && indexPart === "";
    const index = match && indexPart !== "" ? parseInt(indexPart, 10) : null;
    const next: any[] = [];
    for (const item of current) {
      if (item === null || item === undefined) continue;
      const value = key ? item[key] : item;
      if (isArrayAll) {
        if (Array.isArray(value)) next.push(...value);
        continue;
      }
      if (index !== null) {
        if (Array.isArray(value) && value[index] !== undefined) {
          next.push(value[index]);
        }
        continue;
      }
      if (value !== undefined) next.push(value);
    }
    current = next;
  }
  return current;
}

function coerceNumber(value: any): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function matchesFilter(record: any, filter: AggFilter): boolean {
  const values = selectValues(record, filter.path);
  if (filter.op === "exists") return values.length > 0;
  const candidate = values[0];
  const target = filter.value;
  if (filter.op === "eq") return candidate === target;
  if (filter.op === "neq") return candidate !== target;
  if (filter.op === "in" && Array.isArray(target)) return target.includes(candidate);
  const numCandidate = coerceNumber(candidate);
  const numTarget = coerceNumber(target);
  if (numCandidate === null || numTarget === null) return false;
  if (filter.op === "gt") return numCandidate > numTarget;
  if (filter.op === "gte") return numCandidate >= numTarget;
  if (filter.op === "lt") return numCandidate < numTarget;
  if (filter.op === "lte") return numCandidate <= numTarget;
  return false;
}

function applyFilters(records: any[], filter?: AggFilter | AggFilter[]): any[] {
  if (!filter) return records;
  const filters = Array.isArray(filter) ? filter : [filter];
  return records.filter((record) => filters.every((f) => matchesFilter(record, f)));
}

function computeMetric(records: any[], metric: AggMetric): number | null {
  const filtered = applyFilters(records, metric.filter);
  if (metric.op === "count") {
    if (metric.path) {
      return filtered.reduce((sum, record) => sum + selectValues(record, metric.path!).length, 0);
    }
    return filtered.length;
  }
  const values = metric.path
    ? filtered.flatMap((record) => selectValues(record, metric.path!))
    : filtered;
  const nums = values.map((v) => coerceNumber(v)).filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  if (metric.op === "sum") return nums.reduce((a, b) => a + b, 0);
  if (metric.op === "avg") return nums.reduce((a, b) => a + b, 0) / nums.length;
  if (metric.op === "min") return Math.min(...nums);
  if (metric.op === "max") return Math.max(...nums);
  return null;
}

function formatMetricValue(value: number | null, format?: AggMetric["format"]): string {
  if (value === null) return "-";
  if (format === "currency") {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "JPY" }).format(value);
  }
  if (format === "percent") {
    return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat().format(value);
}

function renderDashboard(root: HTMLElement, spec: AggSpec | null, payloads: RawPayload[]) {
  if (!spec?.dashboard || payloads.length === 0) {
    root.innerHTML = "";
    return;
  }
  const records = payloads.map((p) => p.plain);
  const title = spec.dashboard.title ? `<div class="agg-dashboard-title">${spec.dashboard.title}</div>` : "";
  const cards = (spec.dashboard.cards || []).map((card) => {
    const value = computeMetric(records, card);
    const formatted = formatMetricValue(value, card.format);
    return `<div class="agg-card"><div class="agg-card-label">${card.label}</div><div class="agg-card-value">${formatted}</div></div>`;
  }).join("");
  const cardGrid = cards ? `<div class="agg-card-grid">${cards}</div>` : "";
  const tables = (spec.dashboard.tables || []).map((table) => {
    const groups = new Map<string, any[]>();
    for (const record of records) {
      const keyValue = selectValues(record, table.group_by)[0];
      const groupKey = keyValue === undefined || keyValue === null || keyValue === "" ? "Unknown" : String(keyValue);
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(record);
    }
    const rows = Array.from(groups.entries()).map(([groupKey, groupRecords]) => {
      const metricValues: Record<string, string> = {};
      table.metrics.forEach((metric) => {
        const value = computeMetric(groupRecords, metric);
        metricValues[metric.id] = formatMetricValue(value, metric.format);
      });
      return { groupKey, metricValues };
    });
    if (table.sort) {
      const order = table.sort.order === "asc" ? 1 : -1;
      rows.sort((a, b) => {
        const av = a.metricValues[table.sort!.by];
        const bv = b.metricValues[table.sort!.by];
        if (av === bv) return 0;
        return av > bv ? order : -order;
      });
    }
    const limited = table.limit ? rows.slice(0, table.limit) : rows;
    const headers = ["Group", ...table.metrics.map((m) => m.label || m.id)];
    const headHtml = headers.map((h) => `<th>${h}</th>`).join("");
    const bodyHtml = limited.map((row) => {
      const cells = [
        `<td>${row.groupKey}</td>`,
        ...table.metrics.map((m) => `<td>${row.metricValues[m.id]}</td>`),
      ].join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    const tableLabel = table.label ? `<div class="agg-table-title">${table.label}</div>` : "";
    return `<div class="agg-dashboard-table">${tableLabel}<table class="agg-table"><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
  }).join("");

  root.innerHTML = `${title}${cardGrid}${tables}`;
}

async function extractPlainFromHtml(html: string, l2Keys?: L2KeyFile | null): Promise<ExtractedPlain> {
  const l2Envelope = extractL2EnvelopeFromHtml(html);
  if (l2Envelope && l2Keys) {
    if (l2Keys.recipient_kid && l2Envelope.layer2?.recipient && l2Keys.recipient_kid !== l2Envelope.layer2.recipient) {
      throw new Error(`recipient_kid mismatch (${l2Envelope.layer2.recipient})`);
    }
    let recipientSk: Uint8Array | null = null;
    if (l2Keys.org_root_key) {
      const campaignId = l2Keys.org_campaign_id || l2Envelope.meta?.campaign_id;
      if (!campaignId) {
        throw new Error("org_campaign_id is required for org_root_key");
      }
      const derived = deriveOrgX25519KeyPair({
        orgRootKey: b64urlDecode(l2Keys.org_root_key),
        campaignId,
        layer1Ref: l2Envelope.layer1_ref,
        keyPolicy: l2Keys.org_key_policy || l2Envelope.meta?.key_policy,
      });
      recipientSk = derived.privateKey;
    } else if (l2Keys.recipient_x25519_private) {
      recipientSk = b64urlDecode(l2Keys.recipient_x25519_private);
    } else {
      throw new Error("No recipient key provided");
    }
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

export { buildRowFromPlain, extractJsonLdFromHtml, extractL2EnvelopeFromHtml, flattenForCsv };

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
        <button id="weba-agg-download-jsonl" class="agg-btn secondary" disabled>Download JSONL</button>
        <button id="weba-agg-download-parquet" class="agg-btn secondary" disabled>Download Parquet</button>
      </div>
      <div id="weba-agg-status" class="agg-status">Ready.</div>
    </div>
    <div id="weba-agg-dashboard" class="agg-dashboard"></div>
    <div id="weba-agg-output" class="agg-output"></div>
  `;

  const fileInput = root.querySelector<HTMLInputElement>("#weba-agg-files");
  const status = root.querySelector<HTMLDivElement>("#weba-agg-status");
  const output = root.querySelector<HTMLDivElement>("#weba-agg-output");
  const dashboard = root.querySelector<HTMLDivElement>("#weba-agg-dashboard");
  const includeJson = root.querySelector<HTMLInputElement>("#weba-agg-include-json");
  const runBtn = root.querySelector<HTMLButtonElement>("#weba-agg-run");
  const dlBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download");
  const dlJsonBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download-jsonl");
  const dlParquetBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download-parquet");
  const keyStatus = root.querySelector<HTMLDivElement>("#weba-agg-key-status");

  let cachedCsv = "";
  let cachedJsonl = "";
  let rawPayloads: RawPayload[] = [];

  const embeddedKey = parseKeyScript();
  const aggSpec = parseAggSpecScript();
  if (keyStatus) {
    keyStatus.textContent = embeddedKey?.recipient_kid ? `Loaded (${embeddedKey.recipient_kid})` : embeddedKey ? "Loaded" : "Not loaded";
    keyStatus.classList.toggle("ready", !!embeddedKey);
  }
  if (aggSpec?.export?.jsonl === false && dlJsonBtn) {
    dlJsonBtn.disabled = true;
  }
  const parquetProvider = (globalThis as any).webaParquet;
  const parquetReady = aggSpec?.export?.parquet && parquetProvider?.export;
  if (dlParquetBtn) {
    dlParquetBtn.disabled = !parquetReady;
    dlParquetBtn.title = parquetReady ? "" : "Parquet export provider not available";
  }

  const runAggregation = async () => {
    if (!fileInput?.files || fileInput.files.length === 0) {
      if (status) status.textContent = "Select HTML files first.";
      return;
    }
    if (status) status.textContent = "Processing...";
    if (dlBtn) dlBtn.disabled = true;
    if (dlJsonBtn) dlJsonBtn.disabled = true;
    if (dlParquetBtn) dlParquetBtn.disabled = !parquetReady;

    const rows: any[] = [];
    const keys = new Set<string>(["_filename"]);
    let processed = 0;
    let errors = 0;
    rawPayloads = [];

    const l2Keys = embeddedKey;

    for (const file of Array.from(fileInput.files)) {
      try {
        const html = await file.text();
        const extracted = await extractPlainFromHtml(html, l2Keys);
        if (extracted.source === "l2" && extracted.plain) {
          rawPayloads.push({ filename: file.name, plain: extracted.plain, sig: extracted.sig });
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
          rawPayloads.push({ filename: file.name, plain: extracted.plain });
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
    const jsonlEnabled = aggSpec?.export?.jsonl !== false;
    cachedJsonl = rawPayloads
      .map((payload) =>
        JSON.stringify({
          _filename: payload.filename,
          _l2_sig: payload.sig ?? null,
          ...payload.plain,
        }),
      )
      .join("\n");
    if (dlJsonBtn) dlJsonBtn.disabled = rawPayloads.length === 0 || !jsonlEnabled;
    if (status) status.textContent = `Processed ${processed} files. Errors: ${errors}.`;
    if (dashboard) renderDashboard(dashboard, aggSpec, rawPayloads);
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

  dlJsonBtn?.addEventListener("click", () => {
    if (!cachedJsonl) return;
    const blob = new Blob([cachedJsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weba-aggregated.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  });

  dlParquetBtn?.addEventListener("click", async () => {
    if (!parquetReady || !rawPayloads.length) return;
    try {
      const bytes = await parquetProvider.export(rawPayloads.map((p) => ({
        _filename: p.filename,
        _l2_sig: p.sig ?? null,
        ...p.plain,
      })));
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weba-aggregated.parquet";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      if (status) status.textContent = "Parquet export failed.";
      console.error(e);
    }
  });
}
