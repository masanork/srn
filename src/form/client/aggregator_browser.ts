import { extractJsonLdFromHtml, extractL2EnvelopeFromHtml } from "./aggregator_browser_parse";
import { buildCsv, buildRowFromPlain } from "./aggregator_browser_csv";
import { b64urlEncode, b64urlDecode, decryptLayer2Envelope, deriveKeyPairFromPrf } from "./l2crypto";
import type { L2KeyFile, Layer2Signature } from "./l2crypto";
import { globalSigner } from "./signer";

/**
 * Aggregator Configuration / Specification
 */
export interface MetricSpec {
  id: string;
  name: string;
  type: "count" | "sum" | "avg" | "percent" | "boolean_count";
  path: string;
  filter?: { key: string; value: any };
}

export interface AggSpec {
  title?: string;
  metrics?: MetricSpec[]; // Legacy
  dashboard?: {
    title?: string;
    cards?: Array<{ id: string; label: string; op: string; path?: string; format?: string }>;
    charts?: Array<{ id: string; type: string; title: string; source: string; x: string; value?: string; filter?: any }>;
  };
  samples?: any[];
  export?: { csv?: boolean; jsonl?: boolean };
}

export interface RawPayload {
  filename: string;
  plain: any;
  sig?: Layer2Signature | undefined;
}

/**
 * UTILS: Selector and Metrics
 */
function selectValues(source: any, path: string): any[] {
  const normalized = path.trim().replace(/^\$\./, "");
  if (!normalized) return [];
  const segments = normalized.split(".");
  let current: any[] = [source];
  for (const segment of segments) {
    const match = segment.match(/^(.*)\[(\d*)\]$/);
    const key = match ? match[1] : segment;
    const indexPart = match ? match[2] : null;
    const isArrayAll = match && indexPart === "";
    const index = (match && indexPart !== "" && indexPart !== null) ? parseInt(indexPart as string, 10) : null;
    const next: any[] = [];
    for (const item of current) {
      if (item === null || item === undefined) continue;
      const value = key ? (item as any)[key] : item;
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

function computeMetric(metric: MetricSpec, payloads: RawPayload[]): number | string {
  const values: any[] = [];
  payloads.forEach((p) => {
    const extracted = selectValues(p.plain, metric.path);
    values.push(...extracted);
  });

  switch (metric.type) {
    case "count":
      return values.length;
    case "sum":
      return values.reduce((a, b) => a + (Number(b) || 0), 0);
    case "avg":
      return values.length ? values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length : 0;
    case "boolean_count":
      return values.filter((v) => !!v).length;
    case "percent": {
      const positive = values.filter((v) => !!v).length;
      return values.length ? `${((positive / values.length) * 100).toFixed(1)}%` : "0%";
    }
    default:
      return 0;
  }
}

/**
 * UI Components
 */
function renderDashboard(root: HTMLElement, spec: AggSpec | null, payloads: RawPayload[]) {
  if (!spec) {
    root.innerHTML = "";
    return;
  }

  let html = "";

  // 1. Cards (Metrics)
  const cards: any[] = spec.dashboard?.cards || spec.metrics?.map(m => ({ id: m.id, label: m.name, op: m.type, path: m.path })) || [];
  if (cards.length > 0) {
    const cardHtml = cards.map(c => {
      let val: any = 0;
      const values: any[] = [];
      payloads.forEach(p => {
        if (c.path) values.push(...selectValues(p.plain, c.path));
      });

      if (c.op === 'count') val = payloads.length;
      else if (c.op === 'sum') val = values.reduce((a, b) => a + (Number(b) || 0), 0);
      else if (c.op === 'avg') val = values.length ? values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length : 0;
      else if (c.op === 'boolean_count') val = values.filter(v => !!v).length;

      if (typeof val === 'number' && c.format === 'currency') {
        val = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);
      } else if (typeof val === 'number') {
        val = val.toLocaleString();
      }

      return `
        <div class="metric-card">
          <label>${c.label}</label>
          <div class="value">${val}</div>
        </div>
      `;
    }).join("");
    html += `<div class="dashboard-grid">${cardHtml}</div>`;
  }

  // 2. Charts
  const charts = spec.dashboard?.charts || [];
  if (charts.length > 0) {
    const chartHtml = charts.map(chart => {
      if (chart.type === 'bar') {
        // Frequency of values in source path
        const counts: Record<string, number> = {};
        payloads.forEach(p => {
          const items = selectValues(p.plain, chart.source);
          items.forEach(item => {
            if (chart.filter) {
              if (item[chart.filter.path] !== chart.filter.value) return;
            }
            const val = item[chart.x];
            if (val) counts[val] = (counts[val] || 0) + 1;
          });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const max = Math.max(...Object.values(counts), 1);

        const bars = sorted.map(([label, count]) => `
          <div class="chart-bar-row">
            <div class="chart-bar-label">${label}</div>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width: ${(count / max) * 100}%"></div></div>
            <div class="chart-bar-value">${count}</div>
          </div>
        `).join("");

        return `
          <div class="chart-card">
            <h4>${chart.title}</h4>
            <div class="chart-bars">${bars}</div>
          </div>
        `;
      }
      return "";
    }).join("");
    html += `<div class="chart-grid">${chartHtml}</div>`;
  }

  root.innerHTML = html;
}

function renderTable(root: HTMLElement, rows: any[], keys: string[]) {
  if (rows.length === 0) {
    root.innerHTML = `<div class="agg-empty-state">
      <div class="icon">📂</div>
      <p>No records found. Please upload HTML files and click "Run Aggregation".</p>
    </div>`;
    return;
  }
  const header = keys.map((key) => `<th>${key}</th>`).join("");
  const body = rows
    .map((row, idx) => {
      const cells = keys.map((key) => `<td>${row[key] ?? ""}</td>`).join("");
      return `<tr onclick="window.showRecordDetail(${idx})">${cells}</tr>`;
    })
    .join("");

  root.innerHTML = `
    <div class="agg-section-header">
      <h3>📋 Extracted Records</h3>
      <span class="count-badge">${rows.length} records</span>
    </div>
    <div class="agg-table-container">
      <table class="agg-table">
        <thead><tr>${header}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
  (window as any)._aggRows = rows;
}

function showRecordDetail(idx: number) {
  const rows = (window as any)._aggRows;
  if (!rows || !rows[idx]) return;
  const row = rows[idx];
  const detailRoot = document.getElementById("weba-agg-detail");
  if (!detailRoot) return;

  const raw = row._raw || {};
  let fieldsHtml = "";

  // Try to use form structure if available for better UI
  const webaStructureEl = document.getElementById('weba-structure');
  let formFields: any[] = [];
  if (webaStructureEl) {
    try {
      const struct = JSON.parse(webaStructureEl.textContent!);
      formFields = struct.fields || [];
    } catch { }
  }

  const renderValue = (val: any): string => {
    if (val === null || val === undefined) return '<span class="val-null">N/A</span>';
    if (typeof val === "boolean") return `<span class="val-bool ${val}">${val ? "Yes" : "No"}</span>`;
    if (Array.isArray(val)) {
      return `<div class="val-array">${val.map((v: any) => `<div class="array-item">${typeof v === 'object' ? JSON.stringify(v) : v}</div>`).join('')}</div>`;
    }
    if (typeof val === "object") return `<pre class="val-json">${JSON.stringify(val, null, 2)}</pre>`;
    return `<span class="val-text">${val}</span>`;
  };

  if (formFields.length > 0) {
    formFields.forEach(f => {
      if (f.type === 'calc') return; // Skip calculated fields
      const val = raw[f.key];
      if (val !== undefined) {
        fieldsHtml += `
          <div class="detail-row">
            <div class="detail-key">${f.label || f.key}</div>
            <div class="detail-val-box">${renderValue(val)}</div>
          </div>
        `;
      }
    });

    // Check for any extra data not in fields
    const usedKeys = new Set(formFields.map(f => f.key));
    let extraHeaderAdded = false;
    for (const k in raw) {
      if (k.startsWith('@') || k.startsWith('_') || usedKeys.has(k)) continue;
      if (!extraHeaderAdded) {
        fieldsHtml += '<div class="detail-group-header">Extra Information</div>';
        extraHeaderAdded = true;
      }
      fieldsHtml += `
        <div class="detail-row">
          <div class="detail-key">${k}</div>
          <div class="detail-val-box">${renderValue(raw[k])}</div>
        </div>
      `;
    }
  } else {
    // Fallback: simple vertical list
    for (const k in raw) {
      if (k.startsWith('@') || k.startsWith('_')) continue;
      fieldsHtml += `
        <div class="detail-row">
          <div class="detail-key">${k}</div>
          <div class="detail-val-box">${renderValue(raw[k])}</div>
        </div>
      `;
    }
  }

  detailRoot.innerHTML = `
    <div class="detail-overlay" id="weba-detail-overlay">
      <div class="detail-modal">
        <div class="detail-modal-header">
          <div class="header-info">
            <span class="file-icon">📄</span>
            <div class="text">
              <h3>Record Details</h3>
              <p>${row._filename || "Standalone Record"}</p>
            </div>
          </div>
          <button class="close-btn" id="weba-detail-close">✕</button>
        </div>
        <div class="detail-modal-body">
          <div class="form-view">
            ${fieldsHtml}
          </div>
          <details class="raw-data-section">
            <summary>View Raw Source Data (JSON)</summary>
            <pre>${JSON.stringify(raw, null, 2)}</pre>
            ${row._sig ? `<h4>Signature</h4><pre>${JSON.stringify(row._sig, null, 2)}</pre>` : ''}
          </details>
        </div>
      </div>
    </div>
  `;

  document.body.style.overflow = 'hidden';
  const overlay = document.getElementById("weba-detail-overlay");
  const closeBtn = document.getElementById("weba-detail-close");
  const close = () => {
    if (detailRoot) detailRoot.innerHTML = '';
    document.body.style.overflow = '';
  };
  overlay?.addEventListener('click', (e) => { e.stopPropagation(); if (e.target === overlay) close(); });
  closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); close(); });
}
(window as any).showRecordDetail = showRecordDetail;

/**
 * SCRIPT PARSING
 */
function parseKeyScript(): L2KeyFile | null {
  const el = document.getElementById("weba-l2-key");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent!) as L2KeyFile;
  } catch {
    return null;
  }
}

function parseAggSpecScript(): AggSpec | null {
  const el = document.getElementById("weba-agg-spec");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent!) as AggSpec;
  } catch {
    return null;
  }
}

async function extractPlainFromHtml(html: string, l2Keys: L2KeyFile | null): Promise<{ source: string; plain: any; sig?: Layer2Signature }> {
  const l2 = extractL2EnvelopeFromHtml(html);
  if (l2) {
    if (!l2Keys) return { source: "l2", plain: null }; // Encrypted but no key
    try {
      // Find matching private key or use org root
      let recipientSk: Uint8Array | null = null;
      if (l2Keys.recipient_x25519_private) {
        recipientSk = b64urlDecode(l2Keys.recipient_x25519_private);
      }

      if (!recipientSk && l2Keys.org_root_key) {
        // Derive from campaign/policy if possible? 
        // For now, assume recipientSk is provided for aggregation if user used Passkey.
      }

      if (recipientSk) {
        const payload = await decryptLayer2Envelope(l2, recipientSk);
        return { source: "l2", plain: payload.layer2_plain, sig: payload.layer2_sig };
      }
    } catch (e) {
      console.warn("L2 decryption failed", e);
    }
  }

  // Fallback to JSON-LD (VC)
  const ld = extractJsonLdFromHtml(html);
  if (ld) {
    const plain = ld.credentialSubject?.answers || ld;
    return { source: "jsonld", plain };
  }

  return { source: "unknown", plain: null };
}

/**
 * MAIN ENTRY
 */
export function initAggregatorBrowser() {
  const root = document.getElementById("aggregator-root");
  if (!root) return;

  root.innerHTML = `
    <div class="agg-layout">
      <aside class="agg-sidebar">
        <div class="agg-brand">
          <div class="brand-logo">Agg</div>
          <h1>Web/A Aggregator</h1>
        </div>

        <div class="agg-config-card">
          <div class="card-header">1. Data Source</div>
          <div class="agg-form-field">
            <label>Upload Submitted Forms</label>
            <div class="btn-grid">
              <button id="weba-agg-file-trigger" class="agg-btn-secondary">📄 Select Files</button>
              <button id="weba-agg-dir-trigger" class="agg-btn-secondary">📁 Select Folder</button>
            </div>
            <input id="weba-agg-files" type="file" accept=".html" multiple style="display:none;" />
            <input id="weba-agg-dirs" type="file" webkitdirectory directory style="display:none;" />
            <p class="field-hint">Select files or an entire folder of HTML forms.</p>
          </div>

          <div class="agg-form-field">
            <label>Decryption Method</label>
            <div id="weba-agg-key-status" class="agg-status-chip">No keys detected</div>
            <div class="btn-group">
              <button id="weba-agg-passkey" class="agg-btn-small outline">🔑 Use Passkey</button>
            </div>
            <p class="field-hint">Encryption is used for Layer 2 security.</p>
          </div>

          <div class="agg-form-field-row">
            <input id="weba-agg-include-json" type="checkbox" />
            <label for="weba-agg-include-json">Include JSON column in table</label>
          </div>
        </div>

        <div class="agg-actions-card">
          <button id="weba-agg-run" class="agg-btn-primary">▶ Run Aggregation</button>
          <div class="btn-grid">
            <button id="weba-agg-download" class="agg-btn-secondary" disabled>📥 CSV</button>
            <button id="weba-agg-download-jsonl" class="agg-btn-secondary" disabled>📥 JSONL</button>
          </div>
          <button id="weba-agg-clear" class="agg-btn-text">🗑 Clear Data</button>
          <div id="weba-agg-status" class="agg-status-message">Ready.</div>
        </div>
      </aside>

      <main class="agg-main">
        <div id="weba-agg-dashboard" class="agg-dashboard"></div>
        <div id="weba-agg-output" class="agg-output"></div>
      </main>
    </div>

    <div id="weba-agg-detail"></div>

    <style>
      :root {
        --agg-primary: #2563eb;
        --agg-bg: #f8fafc;
        --agg-card-bg: #ffffff;
        --agg-text: #1e293b;
        --agg-text-dim: #64748b;
        --agg-border: #e2e8f0;
      }

      .agg-layout { display: flex; min-height: 80vh; gap: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--agg-text); }
      .agg-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }
      .agg-main { flex: 1; display: flex; flex-direction: column; gap: 24px; }

      .agg-brand { padding: 12px 0; display: flex; align-items: center; gap: 12px; }
      .brand-logo { background: var(--agg-primary); color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
      .agg-brand h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }

      .agg-config-card, .agg-actions-card { background: var(--agg-card-bg); border: 1px solid var(--agg-border); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .card-header { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--agg-text-dim); margin-bottom: 16px; border-bottom: 1px solid var(--agg-border); padding-bottom: 8px; }

      .agg-form-field { margin-bottom: 16px; }
      .agg-form-field label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; }
      .agg-form-field input[type="file"] { width: 100%; font-size: 0.85rem; }
      .field-hint { font-size: 0.75rem; color: var(--agg-text-dim); margin: 4px 0 0; }

      .agg-form-field-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
      .agg-form-field-row label { font-size: 0.85rem; cursor: pointer; }

      .agg-status-chip { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; color: var(--agg-text-dim); display: inline-block; margin-bottom: 8px; }
      .agg-status-chip.ready { background: #dcfce7; color: #166534; }

      .btn-group { display: flex; gap: 8px; }
      .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      
      .agg-btn-primary { background: var(--agg-primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px; transition: opacity 0.2s; }
      .agg-btn-primary:active { opacity: 0.8; }
      
      .agg-btn-secondary { background: white; border: 1px solid var(--agg-border); color: var(--agg-text); padding: 8px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; }
      .agg-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
      
      .agg-btn-small { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
      .agg-btn-small.outline { background: white; border: 1px solid var(--agg-primary); color: var(--agg-primary); }

      .agg-btn-text { background: none; border: none; color: #ef4444; font-size: 0.85rem; padding: 8px; cursor: pointer; width: 100%; margin-top: 12px; }

      .agg-status-message { font-size: 0.85rem; color: var(--agg-text-dim); text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--agg-border); }

      /* Dashboard */
      .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
      .metric-card { background: white; border: 1px solid var(--agg-border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; border-left: 4px solid var(--agg-primary); }
      .metric-card label { font-size: 0.75rem; color: var(--agg-text-dim); font-weight: 600; text-transform: uppercase; }
      .metric-card .value { font-size: 1.5rem; font-weight: 700; color: var(--agg-text); }

      /* Charts */
      .chart-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; margin-top: 24px; }
      .chart-card { background: white; border: 1px solid var(--agg-border); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .chart-card h4 { margin: 0 0 16px 0; font-size: 0.95rem; font-weight: 700; color: var(--agg-text); border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
      .chart-bars { display: flex; flex-direction: column; gap: 12px; }
      .chart-bar-row { display: flex; align-items: center; gap: 12px; font-size: 0.85rem; }
      .chart-bar-label { width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-weight: 500; }
      .chart-bar-track { flex: 1; height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
      .chart-bar-fill { height: 100%; background: var(--agg-primary); border-radius: 6px; }
      .chart-bar-value { width: 30px; text-align: right; font-weight: 700; color: var(--agg-text-dim); }

      /* Results Styling */
      .agg-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .count-badge { background: var(--agg-primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }

      .agg-table-container { background: white; border: 1px solid var(--agg-border); border-radius: 12px; overflow: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); max-height: 500px; }
      .agg-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
      .agg-table th { background: #f8fafc; padding: 12px; border-bottom: 1px solid var(--agg-border); font-weight: 600; color: var(--agg-text-dim); position: sticky; top: 0; }
      .agg-table td { padding: 12px; border-bottom: 1px solid var(--agg-border); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
      .agg-table tr:hover { background: #f1f5f9; cursor: pointer; }

      .agg-empty-state { text-align: center; padding: 48px; color: var(--agg-text-dim); background: white; border: 2px dashed var(--agg-border); border-radius: 12px; }
      .agg-empty-state .icon { font-size: 2rem; margin-bottom: 12px; }

      /* Detail Modal Overhaul */
      .detail-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 10000; }
      @media (min-width: 768px) { .detail-overlay { align-items: center; } }

      .detail-modal { background: white; width: 100%; max-width: 720px; border-radius: 20px 20px 0 0; display: flex; flex-direction: column; max-height: 94vh; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: slideUp 0.3s ease-out; }
      @media (min-width: 768px) { .detail-modal { border-radius: 16px; max-height: 85vh; } }

      @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      .detail-modal-header { padding: 16px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
      .header-info { display: flex; gap: 12px; align-items: center; }
      .file-icon { font-size: 1.5rem; }
      .header-info h3 { margin: 0; font-size: 1.1rem; }
      .header-info p { margin: 0; font-size: 0.8rem; color: var(--agg-text-dim); }
      .close-btn { border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer; color: #64748b; }

      .detail-modal-body { padding: 24px; overflow-y: auto; flex: 1; }
      
      .form-view { display: flex; flex-direction: column; gap: 16px; }
      .detail-group-header { font-size: 0.8rem; font-weight: 700; color: var(--agg-primary); text-transform: uppercase; background: #eff6ff; padding: 4px 12px; border-radius: 4px; margin-top: 12px; }
      
      .detail-row { display: grid; grid-template-columns: 140px 1fr; gap: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; align-items: flex-start; }
      .detail-key { font-size: 0.85rem; font-weight: 600; color: #64748b; padding-top: 2px; }
      
      .val-null { color: #cbd5e1; font-family: monospace; }
      .val-bool.true { color: #16a34a; font-weight: bold; }
      .val-bool.false { color: #dc2626; font-weight: bold; }
      .val-text { line-height: 1.5; color: #0f172a; }
      .val-json { font-size: 0.8rem; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 0; }
      
      .raw-data-section { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      .raw-data-section summary { font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--agg-text-dim); }
      .raw-data-section pre { margin-top: 12px; font-size: 0.75rem; background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
    </style>
  `;

  const fileInput = root.querySelector<HTMLInputElement>("#weba-agg-files");
  const dirInput = root.querySelector<HTMLInputElement>("#weba-agg-dirs");
  const fileTrigger = root.querySelector<HTMLButtonElement>("#weba-agg-file-trigger");
  const dirTrigger = root.querySelector<HTMLButtonElement>("#weba-agg-dir-trigger");
  const status = root.querySelector<HTMLDivElement>("#weba-agg-status");
  const output = root.querySelector<HTMLDivElement>("#weba-agg-output");
  const dashboard = root.querySelector<HTMLDivElement>("#weba-agg-dashboard");
  const includeJson = root.querySelector<HTMLInputElement>("#weba-agg-include-json");
  const runBtn = root.querySelector<HTMLButtonElement>("#weba-agg-run");
  const dlBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download");
  const dlJsonBtn = root.querySelector<HTMLButtonElement>("#weba-agg-download-jsonl");
  const keyStatus = root.querySelector<HTMLDivElement>("#weba-agg-key-status");
  const passkeyBtn = root.querySelector<HTMLButtonElement>("#weba-agg-passkey");
  const clearBtn = root.querySelector<HTMLButtonElement>("#weba-agg-clear");

  let cachedCsv = "";
  let cachedJsonl = "";
  let rawPayloads: RawPayload[] = [];
  let passkeyDerivedKeys: L2KeyFile | null = null;

  const embeddedKey = parseKeyScript();
  const aggSpec = parseAggSpecScript();
  const samplePayloads = Array.isArray(aggSpec?.samples)
    ? aggSpec!.samples.map((plain, idx) => ({
      filename: `sample-${idx + 1}.json`,
      plain,
    }))
    : [];

  if (keyStatus) {
    keyStatus.textContent = embeddedKey?.recipient_kid ? `Loaded (${embeddedKey.recipient_kid})` : embeddedKey ? "Loaded" : "No keys detected";
    keyStatus.classList.toggle("ready", !!embeddedKey);
  }
  if (aggSpec?.export?.jsonl === false && dlJsonBtn) {
    dlJsonBtn.disabled = true;
  }

  passkeyBtn?.addEventListener("click", async () => {
    try {
      if (!globalSigner.getPublicKey()) {
        const success = await globalSigner.register();
        if (!success) return;
      }

      alert("Please authenticate with your Passkey to decrypt.");
      const salt = new Uint8Array(32);
      const prfOutput = await globalSigner.derivePrf(salt);

      if (!prfOutput) {
        throw new Error("PRF not supported or enabled on this key, or authentication failed.");
      }

      passkeyDerivedKeys = {
        recipient_x25519_private: b64urlEncode(deriveKeyPairFromPrf(prfOutput).privateKey),
      };

      passkeyBtn.textContent = "✅ Passkey Active";
      passkeyBtn.disabled = true;
      if (keyStatus) {
        keyStatus.textContent = "Passkey Enabled";
        keyStatus.classList.add("ready");
      }

      if ((fileInput?.files && fileInput.files.length > 0) || (dirInput?.files && dirInput.files.length > 0)) {
        runAggregation();
      }

    } catch (e: any) {
      console.error(e);
      alert("Passkey error: " + e.message);
    }
  });

  // Triggers
  fileTrigger?.addEventListener("click", () => fileInput?.click());
  dirTrigger?.addEventListener("click", () => dirInput?.click());

  // Auto-run on file selection
  fileInput?.addEventListener("change", () => runAggregation());
  dirInput?.addEventListener("change", () => runAggregation());

  const runAggregation = async () => {
    const files1 = fileInput?.files ? Array.from(fileInput.files) : [];
    const files2 = dirInput?.files ? Array.from(dirInput.files) : [];
    const allFiles = [...files1, ...files2].filter(f => f.name.toLowerCase().endsWith(".html") && !f.name.startsWith("."));

    const hasFiles = allFiles.length > 0;
    if (!hasFiles && samplePayloads.length === 0) {
      if (status) status.textContent = "Select HTML files first.";
      return;
    }
    if (status) status.textContent = "Processing...";
    if (dlBtn) dlBtn.disabled = true;
    if (dlJsonBtn) dlJsonBtn.disabled = true;

    const aggHeader = root.querySelector<HTMLDivElement>(".agg-brand h1");
    rawPayloads = [];
    const rows: any[] = [];
    const keys = new Set<string>(["_filename"]);
    let processed = 0;
    let errors = 0;

    const l2Keys = passkeyDerivedKeys || embeddedKey;

    if (hasFiles) {
      if (aggHeader) aggHeader.innerHTML = 'Web/A Aggregator <span style="font-size:0.75rem; background:#10b981; color:white; padding:2px 8px; border-radius:4px; margin-left:8px; vertical-align:middle;">REAL DATA</span>';
      console.log(`Running aggregation on ${allFiles.length} files...`);
      for (const file of allFiles) {
        try {
          const html = await file.text();
          const extracted = await extractPlainFromHtml(html, l2Keys);
          if (extracted.source !== "unknown" && extracted.plain) {
            rawPayloads.push({ filename: file.name, plain: extracted.plain, sig: extracted.sig });
            const built = buildRowFromPlain({
              plain: extracted.plain,
              filename: file.name,
              includeJson: !!includeJson?.checked,
              sig: extracted.sig,
              omitKey: (key) => key.startsWith("@"),
            });
            built.keys.forEach((key) => keys.add(key));
            rows.push({ ...built.row, _raw: extracted.plain, _sig: extracted.sig });
            processed += 1;
          } else {
            console.warn(`Could not extract from ${file.name}`);
            errors += 1;
          }
        } catch (e) {
          console.error(`Error processing ${file.name}`, e);
          errors += 1;
        }
      }
    } else {
      if (aggHeader) aggHeader.innerHTML = 'Web/A Aggregator <span style="font-size:0.75rem; background:#64748b; color:white; padding:2px 8px; border-radius:4px; margin-left:8px; vertical-align:middle;">SAMPLES</span>';
      console.log("Running aggregation on sample data...");
      samplePayloads.forEach((payload) => {
        rawPayloads.push(payload);
        const built = buildRowFromPlain({
          plain: payload.plain,
          filename: payload.filename,
          includeJson: !!includeJson?.checked,
        });
        built.keys.forEach((key) => keys.add(key));
        rows.push({ ...built.row, _raw: payload.plain });
        processed += 1;
      });
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

    if (status) status.textContent = `Completed. Processed ${processed} entries. Errors: ${errors}.`;
    if (dashboard) renderDashboard(dashboard, aggSpec, rawPayloads);
    if (output) renderTable(output, rows, sortedKeys);
  };

  if (samplePayloads.length > 0 && (!fileInput?.files || fileInput.files.length === 0)) {
    runAggregation();
  }

  clearBtn?.addEventListener("click", () => {
    rawPayloads = [];
    cachedCsv = "";
    cachedJsonl = "";
    if (fileInput) fileInput.value = "";
    if (dirInput) dirInput.value = "";
    if (status) status.textContent = "Data cleared.";
    if (dlBtn) dlBtn.disabled = true;
    if (dlJsonBtn) dlJsonBtn.disabled = true;
    if (dashboard) dashboard.innerHTML = "";
    if (output) output.innerHTML = "";
    (window as any)._aggRows = [];
  });

  runBtn?.addEventListener("click", () => {
    runAggregation().catch((e) => {
      if (status) status.textContent = "Failed to aggregate.";
      console.error(e);
    });
  });

  dlBtn?.addEventListener("click", () => {
    if (!cachedCsv) return;
    const blob = new Blob([cachedCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weba-aggregated.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  dlJsonBtn?.addEventListener("click", () => {
    if (!cachedJsonl) return;
    const blob = new Blob([cachedJsonl], { type: "application/x-jsonlines;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weba-aggregated.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  });
}
