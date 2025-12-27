---
title: "Web/A L2 Keywrap Tool"
layout: form
description: "Passkey PRF key wrap helper for L2 decryption"
date: 2025-12-27
author: "Web/A Project"
---

# Web/A L2 Keywrap Tool

<div id="weba-l2-keywrap-tool" class="no-print" style="margin-top: 1rem; padding: 1.25rem; border: 1px solid #cbd5f5; border-radius: 10px; background: #f8fafc;">
  <div style="font-weight: 600; margin-bottom: 0.5rem;">Passkey Key Wrap Package Generator</div>
  <div style="display: grid; gap: 0.75rem; max-width: 720px;">
    <label>
      Recipient X25519 Private Key (base64url)
      <input id="kwp-recipient-sk" type="text" class="form-input" placeholder="base64url(secret_key)">
    </label>
    <label>
      Credential ID (base64url)
      <input id="kwp-credential-id" type="text" class="form-input" placeholder="base64url(credential_id)">
    </label>
    <label>
      PRF Salt (base64url)
      <div style="display:flex; gap:0.5rem;">
        <input id="kwp-prf-salt" type="text" class="form-input" placeholder="base64url(salt)" style="flex:1;">
        <button id="kwp-generate-salt" type="button" class="secondary">Generate</button>
      </div>
    </label>
    <label>
      AAD (base64url, optional)
      <input id="kwp-aad" type="text" class="form-input" placeholder="base64url(layer1_ref)">
    </label>
    <label>
      Key ID (kid)
      <input id="kwp-kid" type="text" class="form-input" placeholder="issuer#passkey-1">
    </label>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button id="kwp-wrap" type="button" class="primary">Wrap Key</button>
      <div id="kwp-status" style="color:#64748b;">Ready.</div>
    </div>
    <pre id="kwp-output" style="background:#0f172a;color:#e2e8f0;padding:1rem;border-radius:8px;overflow:auto;font-size:0.85rem;min-height:140px;"></pre>
  </div>
</div>
