import {
  b64urlDecode,
  decryptLayer2Envelope,
  unwrapRecipientPrivateKey,
  type L2Keywrap,
  type Layer2Encrypted,
} from "./l2crypto";
import { derivePasskeyPrf } from "./webauthn";

function parseJsonScript<T>(id: string): T | null {
  const el = document.getElementById(id);
  if (!el || !el.textContent) return null;
  try {
    return JSON.parse(el.textContent) as T;
  } catch {
    return null;
  }
}

export function initL2Viewer() {
  const envelope = parseJsonScript<Layer2Encrypted>("weba-l2-envelope");
  if (!envelope) return;

  const keywrap = parseJsonScript<L2Keywrap>("weba-l2-keywrap");

  const host =
    document.querySelector(".weba-form-container") || document.body;
  const panel = document.createElement("div");
  panel.className = "weba-l2-unlock";
  panel.style.cssText =
    "margin-top:2rem;padding:1rem;border:1px solid #cbd5f5;border-radius:10px;background:#f8fafc;";

  const title = document.createElement("div");
  title.textContent = "Encrypted Submission";
  title.style.cssText = "font-weight:600;color:#334155;margin-bottom:0.5rem;";
  panel.appendChild(title);

  const status = document.createElement("div");
  status.textContent = "Locked. Unlock with Passkey.";
  status.style.cssText = "color:#64748b;margin-bottom:0.75rem;";
  panel.appendChild(status);

  const button = document.createElement("button");
  button.textContent = "Unlock (Passkey)";
  button.style.cssText =
    "padding:0.5rem 1rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;";
  panel.appendChild(button);

  const output = document.createElement("pre");
  output.style.cssText =
    "margin-top:1rem;padding:1rem;background:#0f172a;color:#e2e8f0;border-radius:8px;overflow:auto;font-size:0.85rem;display:none;";
  panel.appendChild(output);

  const sigDetails = document.createElement("details");
  sigDetails.style.cssText = "margin-top:0.75rem; display:none;";
  sigDetails.innerHTML = `<summary style="cursor:pointer;color:#64748b;">Show signature</summary><pre style="margin-top:0.5rem;padding:0.75rem;background:#0b1220;color:#cbd5f5;border-radius:6px;overflow:auto;font-size:0.8rem;"></pre>`;
  panel.appendChild(sigDetails);

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export JSON";
  exportBtn.style.cssText =
    "margin-top:0.75rem;padding:0.45rem 0.9rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;display:none;";
  exportBtn.disabled = true;
  panel.appendChild(exportBtn);

  button.addEventListener("click", async () => {
    if (!keywrap) {
      status.textContent = "Key wrap package not found.";
      return;
    }
    button.disabled = true;
    status.textContent = "Waiting for passkey...";
    try {
      const prfSalt = b64urlDecode(keywrap.prf_salt);
      const prfKey = await derivePasskeyPrf(keywrap.credential_id, prfSalt);
      const recipientSk = await unwrapRecipientPrivateKey({
        keywrap,
        prfKey,
      });
      const payload = await decryptLayer2Envelope(envelope, recipientSk);
      applyLayer2Payload(payload.layer2_plain);
      output.textContent = JSON.stringify(payload.layer2_plain, null, 2);
      output.style.display = "block";
      const sigPre = sigDetails.querySelector("pre");
      if (sigPre) {
        sigPre.textContent = JSON.stringify(payload.layer2_sig, null, 2);
      }
      sigDetails.style.display = "block";
      exportBtn.style.display = "inline-block";
      exportBtn.disabled = false;
      status.textContent = "Unlocked.";

      exportBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "weba-l2-decrypted.json";
        a.click();
      };
    } catch (e) {
      console.error(e);
      status.textContent = "Unlock failed.";
      button.disabled = false;
    }
  });

  host.appendChild(panel);
}

function applyLayer2Payload(plain: unknown) {
  if (!plain || typeof plain !== "object") return;
  const data = plain as Record<string, unknown>;

  document.querySelectorAll<HTMLInputElement>("[data-json-path]").forEach((input) => {
    const key = input.dataset.jsonPath;
    if (!key || !(key in data)) return;
    const value = data[key];
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
    } else if (input.type === "radio") {
      input.checked = input.value === String(value);
    } else {
      input.value = value === null || value === undefined ? "" : String(value);
    }
  });

  document.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
    const key = radio.name;
    if (!key || !(key in data)) return;
    const value = data[key];
    radio.checked = radio.value === String(value);
  });

  document.querySelectorAll<HTMLTableElement>("table.data-table.dynamic").forEach((table) => {
    const tableKey = table.dataset.tableKey;
    if (!tableKey) return;
    const rowsData = data[tableKey];
    if (!Array.isArray(rowsData)) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;
    const templateRow = tbody.querySelector("tr.template-row");
    if (!templateRow) return;

    Array.from(tbody.querySelectorAll("tr")).forEach((row) => {
      if (!row.classList.contains("template-row")) row.remove();
    });

    rowsData.forEach((rowData, idx) => {
      const row =
        idx === 0
          ? templateRow
          : (templateRow.cloneNode(true) as HTMLTableRowElement);
      if (idx > 0) {
        row.classList.remove("template-row");
        const rmBtn = row.querySelector(".remove-row-btn") as HTMLElement | null;
        if (rmBtn) rmBtn.style.visibility = "visible";
        tbody.appendChild(row);
      }

      if (rowData && typeof rowData === "object") {
        row.querySelectorAll<HTMLInputElement>("input, select, textarea").forEach((input) => {
          const key = input.dataset.baseKey;
          if (!key) return;
          const value = (rowData as Record<string, unknown>)[key];
          if (input.type === "checkbox") {
            input.checked = Boolean(value);
          } else {
            input.value = value === null || value === undefined ? "" : String(value);
          }
        });
      }
    });
  });

  document.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    if (input.type === "checkbox" || input.type === "radio") {
      input.disabled = true;
    } else {
      input.readOnly = true;
    }
  });
  document.querySelectorAll<HTMLTextAreaElement>("textarea").forEach((area) => {
    area.readOnly = true;
  });
  document.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.disabled = true;
  });
  document.querySelectorAll<HTMLButtonElement>(".form-toolbar button, .add-row-btn, .remove-row-btn").forEach((btn) => {
    btn.disabled = true;
  });
}
