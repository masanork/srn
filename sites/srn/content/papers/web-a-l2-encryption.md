---
title: "Discussion Paper: Web/A Layer 2 Encryption"
layout: article
author: "Web/A Project"
date: 2025-12-27
---

# Web/A Layer 2 Encryption: Privacy-Preserving Form Submissions

## 1. Abstract
This paper defines the **Layer 2 Encryption** layer for Web/A documents. While Layer 1 ensures the integrity of the document template (the "Question"), and Layer 2 (Signature) ensures the authenticity of the user's response (the "Answer"), Layer 2 Encryption provides **Confidentiality**. This ensures that sensitive user data is only readable by the intended recipient (the Issuer/Aggregator), even when the document is transported over untrusted channels or stored in browser-local storage.

## 2. Threat Model
- **Confidentiality**: Protect User Answers from intermediaries (email providers, CDNs, malicious browser extensions).
- **Integrity-Linked**: Ensure the ciphertext is cryptographically bound to the specific version of the Layer 1 Template (preventing "cut-and-paste" attacks where answers are moved to a different form).
- **Future-Proofing**: Provide a hybrid path for Post-Quantum Cryptography (PQC) while maintaining compatibility with current high-performance ECC.

## 2.5. Integration with Web/A Form (Opt-in)
Layer 2 Encryption is optional for Web/A Form. When enabled, the form emits a **Layer2Encrypted** envelope instead of plaintext L2. When disabled, the form behaves exactly as today.

Operational assumptions:
- The issuer distributes the form together with a recipient encryption public key (X25519, optional ML-KEM-768).
- The form UI exposes a clear “Encrypt L2” toggle and explains who can decrypt.
- The encrypted envelope binds to the form’s `layer1_ref` via AAD so answers cannot be transplanted to a different template.

## 3. Cryptographic Construction

### 3.1. HPKE-like Hybrid Encryption
Web/A L2 uses a construction inspired by **HPKE (RFC 9180)**, optimized for JSON-based document workflows.

- **KEM (Key Encapsulation Mechanism)**: 
  - Classical: **X25519**
  - Post-Quantum (Optional): **ML-KEM-768 (Kyber)**
- **KDF (Key Derivation Function)**: **HKDF-SHA256**
- **AEAD (Authenticated Encryption with Associated Data)**: **AES-256-GCM**

### 3.2. Associated Data (AAD) Binding
To prevent re-binding attacks, the AEAD `aad` includes the `layer1_ref` (hash of the template). If the `layer1_ref` in the envelope does not match the one used during encryption, decryption will fail.

```json
{
  "layer1_ref": "sha256:...",
  "recipient": "issuer#kem-2025",
  "weba_version": "0.1"
}
```

### 3.3. Deterministic Canonicalization
For both signing and AAD preparation, Web/A uses a simplified **Canonical JSON**:
1. Lexicographical sorting of keys.
2. No insignificant whitespace.
3. UTF-8 encoding.
4. Floating-point numbers are discouraged (or stringified) to ensure cross-platform stability.

## 4. Data Structures

### 4.1. Layer 2 Payload (Plaintext before encryption)
```json
{
  "layer2_plain": {
    "name": "John Doe",
    "medical_history": "..."
  },
  "layer2_sig": {
    "alg": "Ed25519",
    "kid": "user#sig-1",
    "sig": "base64...",
    "created_at": "2025-12-27T..."
  }
}
```

### 4.2. Layer 2 Encrypted Envelope
```json
{
  "weba_version": "0.1",
  "layer1_ref": "sha256:...",
  "layer2": {
    "enc": "HPKE-v1",
    "suite": {
      "kem": "X25519(+ML-KEM-768)",
      "kdf": "HKDF-SHA256",
      "aead": "AES-256-GCM"
    },
    "recipient": "issuer#kem-2025",
    "encapsulated": {
      "classical": "base64(ephemeral_pk)",
      "pqc": "base64(kem_ct)"
    },
    "ciphertext": "base64(aead_ct)",
    "aad": "base64(aad_json)"
  },
  "meta": {
    "created_at": "2025-12-27T...",
    "nonce": "base64..."
  }
}
```

## 5. Implementation Notes (Bun/TypeScript)
- Use `@noble/curves/ed25519` and `x25519` for elliptic curve operations.
- Use `node:crypto` for `hkdf`, `randomBytes`, and `createCipheriv` (AES-GCM).
- Implementation should be minimal and self-contained to allow easy porting to browser environments.

## 6. Usage (Web/A Form Integration)

### 6.1. Enable Encryption in Frontmatter
Add the following fields to a Web/A Form Markdown file to enable L2 encryption. This will inject the recipient key and show a toggle in the form UI.

```yaml
---
layout: form
l2_encrypt: true
l2_recipient_kid: "issuer#kem-2025"
l2_recipient_x25519: "<base64url>"
# l2_layer1_ref: "sha256:..."  # Optional. If omitted, it derives from the template VC digest.
l2_encrypt_default: true       # Optional. Default toggle state.
l2_user_kid: "user#sig-1"       # Optional. User signature key id.
l2_keywrap:                    # Optional. Enables passkey unlock for recipient.
  alg: "WebAuthn-PRF-AESGCM-v1"
  kid: "issuer#passkey-1"
  credential_id: "base64url(...)"
  prf_salt: "base64url(...)"
  wrapped_key: "base64url(...)"
  aad: "base64url(layer1_ref)"
---
```

### 6.2. User Flow
1. Issuer distributes the form with recipient public keys embedded.
2. User fills the form as usual.
3. User toggles “Encrypt L2” on (default can be pre-set).
4. Submission produces a Layer2Encrypted envelope instead of plaintext L2.

### 6.3. Output Artifacts
When encryption is enabled:
- The encrypted envelope is stored in `<script id="weba-l2-envelope" type="application/json">`.
- Plaintext JSON-LD is removed from the output HTML.
- The envelope is bound to `layer1_ref` via AAD (tampering breaks decryption).

## 7. Browser-Only Decryption with Passkey (Concept)
Web/A’s file-first model favors a **browser-only decryption flow** that works without external tooling. The intended UX is “one passkey action to open”.

### 7.1. Key Wrap Concept
To enable browser-only decryption, the recipient’s **CEK (content-encryption key)** is wrapped with a Passkey-protected key and embedded alongside the envelope:

- The form carries a **Key Wrap Package** (KWP) that can be unlocked via WebAuthn.
- The KWP contains an encrypted CEK and the metadata required to unlock it.
- The recipient authenticates via Passkey → browser unwraps CEK → decrypts L2 envelope.

This preserves the file-first property: a single HTML file still carries all data needed, yet only the intended recipient can decrypt.

### 7.2. Proposed Data Blocks
```json
// Embedded in HTML (example IDs)
{
  "weba-l2-envelope": { /* Layer2Encrypted */ },
  "weba-l2-keywrap": {
    "alg": "WebAuthn-PRF-AESGCM-v1",
    "kid": "issuer#passkey-1",
    "wrapped_key": "base64url(...)",
    "credential_id": "base64url(...)",
    "prf_salt": "base64url(...)",
    "aad": "base64url(layer1_ref)"
  }
}
```

### 7.3. Unlock Flow (Recipient)
1. Recipient opens the HTML file in a browser.
2. Click **Unlock (Passkey)**.
3. WebAuthn `get()` is invoked for the configured credential ID.
4. The browser derives/unwraps CEK and decrypts the L2 envelope.
5. Decrypted payload is rendered in a read-only view (no plaintext stored unless explicitly exported).

### 7.4. Notes
- This section defines the **conceptual flow**; exact KWP format is a spec extension.
- The goal is **single action unlock** without external tools.
- If KWP is absent, offline decryption via CLI remains the fallback.

### 7.5. Key Wrap Mechanics (Proposed)
The Key Wrap Package (KWP) wraps the **recipient X25519 private key** so it can only be unlocked with the recipient’s Passkey. The CEK is still derived at decryption time from the envelope and the unwrapped private key.

**Inputs**:
- `recipient_x25519_sk`: recipient private key (32 bytes).
- `credential_id`: passkey identifier for the recipient.
- `prf_salt`: per-form salt for PRF key derivation.
- `aad`: optional context binding (e.g., `layer1_ref`).

**Derivation (sketch)**:
1. Call WebAuthn `get()` with **PRF extension** and `prf_salt`.
2. Obtain `prf_output` from `getClientExtensionResults().prf.results.first`.
3. Derive wrap key/iv via HKDF-SHA256:
   - `wrap_key = HKDF(prf_output, info="weba-l2/kw", 32)`
   - `wrap_iv  = HKDF(prf_output, info="weba-l2/kw-iv", 12)`
4. Encrypt `recipient_x25519_sk` with AES-256-GCM using `wrap_key`, `wrap_iv`, and `aad`.
5. Store the ciphertext as `wrapped_key` in the KWP.

**Unwrap**:
1. Re-run WebAuthn `get()` with the same PRF salt.
2. Re-derive `wrap_key`/`wrap_iv`.
3. Decrypt `wrapped_key` to recover `recipient_x25519_sk`.

This preserves “single action unlock” while keeping all materials inside the HTML file. If PRF is unavailable, fallback to CLI decryption.

### 7.6. Browser UI/UX (Proposed)
**Unlock panel** (visible when `weba-l2-envelope` is present):
- Button: “Unlock (Passkey)”
- Status line: “Waiting for passkey…” / “Unlocked”
- Optional: “Export decrypted JSON” (explicit user action)

**Behavior**:
- Until unlock, no plaintext L2 data is displayed or stored.
- After unlock, render a read-only view of `layer2_plain`.
- Optionally allow exporting the decrypted payload as JSON/CSV.
