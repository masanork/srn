---
title: "Discussion Paper: Web/A Form"
layout: width
date: 2025-01-04
author: "Web/A Project"
description: "A file-first, accountless form workflow for low-frequency, multi-organization processes that do not fit SaaS."
---

# Web/A Form: A Sustainable, File-First Data Collection Workflow

## 1. The SaaS Gap

SaaS is optimal for daily, fixed-member workflows, but it struggles in cases like annual submissions or surveys targeting many organizations. In those cases, the **cost of account provisioning and identity management** outweighs the value of digitization.

Typical pain points:

- **Unknown recipients**: The sender does not know the right person to issue accounts to.
- **Team collaboration**: One form requires multiple internal roles. Shared accounts are risky; issuing many accounts is costly.
- **Low frequency**: Paying subscriptions for once-a-year documents is hard to justify.

Web/A Form targets this **"SaaS air pocket"** by treating the form itself as the application.

---

## 2. What is Web/A Form?

Web/A Form is a **single-file HTML form** generated from Markdown. It runs offline in any browser and embeds JSON-LD for machine-readable data extraction.

### 2.1 Workflow

1. **Distribute**: Generate HTML from Markdown and send it by email or URL.
2. **Circulate & Input**: The file can be passed between colleagues without accounts.
3. **Freeze & Bake**: Input values are baked into the HTML to create a static record.
4. **Submit**: The final HTML is sent back as the official submission.

### 2.2 Optional Layer 2 Encryption (L2E)

Web/A Form can optionally encrypt the Layer 2 payload (user answers) before submission. This aligns with the **Discussion Paper: Web/A Layer 2 Encryption** and keeps plaintext answers local to the form while producing a sealed envelope for recipients who hold the decryption keys.

**Design intent**:
- Preserve the file-first workflow while enabling confidentiality for sensitive fields.
- Bind ciphertext to the specific Layer 1 template (preventing cut-and-paste between forms).
- Keep encryption optional so existing deployments remain valid.

**Operator flow**:
1. The issuer distributes a form with a recipient encryption public key (X25519, optional ML-KEM-768).
2. The user fills the form as usual.
3. If “Encrypt L2” is enabled, the form produces a **Layer2Encrypted envelope** instead of plaintext L2.
4. The issuer decrypts the envelope offline using the recipient private key.

**Envelope binding**:
Associated Data (AAD) includes `layer1_ref`, `recipient`, and `weba_version`, so tampering with these values breaks decryption.

```json
{
  "layer1_ref": "sha256:...",
  "recipient": "issuer#kem-2025",
  "weba_version": "0.1"
}
```

### 2.3 Maker

Markdown-based syntax lets anyone build forms with validation, calculations, and dynamic tables without dedicated software.

### 2.3 AI-Assisted Migration from Excel

Excel-based forms can be migrated with a **MarkItDown → LLM** workflow:

1. Convert Excel to Markdown.
2. Ask an LLM to map the Markdown into Web/A Form syntax.
3. Let the LLM propose formulas and required-field logic.

This minimizes manual re-design while preserving existing workflows.

> **Practical prompt: Form conversion**
>
> Convert the Markdown table below into Web/A Form syntax using the rules listed.
>
> **Web/A Syntax rules**:
>
> 1. Inputs use `[type:key (attrs)]`.
>    - Text: `[text:user_name (label="Name")]`
>    - Number: `[number:amount (placeholder="0")]`
>    - Date: `[date:entry_date]`
> 2. Calculations use `calc`.
>    - Example: `[calc:subtotal (formula="price * quantity")]`
>    - Sum: `[calc:total (formula="SUM(subtotal)")]`
> 3. Keep the original table structure and headers.
>
> **Markdown to convert**:
> (paste markitdown output here)

---

## 3. Core Values

### 3.1 Zero Admin

No accounts or passwords. The file itself is the access token.

### 3.2 Machine-Readable First

No “visual data silos.” JSON-LD sits inside the form, enabling deterministic extraction.

### 3.3 Logic Embedded

Excel-like usability is achieved with standard Web tech:

- Auto calculations
- Dynamic rows
- Master data lookups

---

## 4. Fit by Use Case

| Feature | Web/A Form | SaaS (Fixed Ops) | Survey Tools |
| --- | --- | --- | --- |
| Best fit | Low-frequency, multi-org | Daily internal ops | Consumer surveys |
| Account mgmt | None (file-based) | Required | None (no drafts) |
| Collaboration | File relay | Role-based | Single-user |
| Cost | One-time | Subscription | Per-response |
| Data model | JSON-LD | Proprietary DB | CSV |

---

## 5. Collection & Aggregation

### 5.1 Local Batch (Small scale)

Read HTML files and extract JSON-LD into CSV/Excel with a short script.

### 5.2 Drop Zone (Mid scale)

Users upload their HTML; the server extracts JSON-LD immediately. Since Web/A only outputs validated data, server-side checks are simplified.

### 5.3 AI Agents (Large scale)

Agents can parse HTML + JSON-LD to automate aggregation without custom API bindings.

> **Practical prompt: Autonomous aggregation**
> "Read all HTML files in this folder (Web/A Forms). Parse each `<script type="application/ld+json">` block and extract common fields (especially `submissionDate`, `orgName`, `totalAmount`). Output a single table."

---

## 6. Constraints

### 6.1 Drafts are Device-Local

Draft state is stored in browser local storage. To move work between devices, use “Save Draft” to export HTML.

### 6.2 File Size

Single-file design can grow large. For large attachments, use a drop zone instead of email.

---

## 7. Conclusion

Web/A Form is not a universal replacement for SaaS. It is a **file-first** alternative optimized for low-frequency, multi-organization workflows where account management is the dominant cost.

It preserves the simplicity of “just send a file” while guaranteeing machine-readable data and consistent validation.
