import {
  b64urlDecode,
  b64urlEncode,
  wrapRecipientPrivateKey,
} from "./l2crypto";
import { derivePasskeyPrf } from "./webauthn";

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function initKeywrapTool() {
  const host = byId<HTMLDivElement>("weba-l2-keywrap-tool");
  if (!host) return;

  const recipientInput = byId<HTMLInputElement>("kwp-recipient-sk");
  const credInput = byId<HTMLInputElement>("kwp-credential-id");
  const saltInput = byId<HTMLInputElement>("kwp-prf-salt");
  const aadInput = byId<HTMLInputElement>("kwp-aad");
  const kidInput = byId<HTMLInputElement>("kwp-kid");
  const status = byId<HTMLDivElement>("kwp-status");
  const output = byId<HTMLPreElement>("kwp-output");
  const genSaltBtn = byId<HTMLButtonElement>("kwp-generate-salt");
  const wrapBtn = byId<HTMLButtonElement>("kwp-wrap");

  if (!recipientInput || !credInput || !saltInput || !status || !output || !wrapBtn) {
    return;
  }

  genSaltBtn?.addEventListener("click", () => {
    const salt = new Uint8Array(32);
    crypto.getRandomValues(salt);
    saltInput.value = b64urlEncode(salt);
  });

  wrapBtn.addEventListener("click", async () => {
    status.textContent = "Waiting for passkey...";
    wrapBtn.disabled = true;
    try {
      if (!recipientInput.value || !credInput.value || !saltInput.value) {
        throw new Error("Missing required fields.");
      }
      const recipientSk = b64urlDecode(recipientInput.value.trim());
      const prfSalt = b64urlDecode(saltInput.value.trim());
      const prfKey = await derivePasskeyPrf(credInput.value.trim(), prfSalt);
      const aad = aadInput?.value ? b64urlDecode(aadInput.value.trim()) : undefined;

      const wrapped = await wrapRecipientPrivateKey({ recipientSk, prfKey, aad });
      const keywrap = {
        alg: "WebAuthn-PRF-AESGCM-v1",
        kid: kidInput?.value || "issuer#passkey-1",
        credential_id: credInput.value.trim(),
        prf_salt: b64urlEncode(prfSalt),
        wrapped_key: b64urlEncode(wrapped),
        ...(aad ? { aad: b64urlEncode(aad) } : {}),
      };

      output.textContent = JSON.stringify(keywrap, null, 2);
      status.textContent = "Key wrap ready.";
    } catch (e) {
      console.error(e);
      status.textContent = "Key wrap failed.";
    } finally {
      wrapBtn.disabled = false;
    }
  });
}
