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
