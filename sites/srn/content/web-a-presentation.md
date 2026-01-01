---
title: "Web/A in One Deck: HTML-Native Presentation"
description: "A single article that turns into full-screen slides to explain Web/A end to end."
layout: article
lang: en
presentation: true
presentation_template: sorane
date: 2025-02-01
ai_generated: true
---

# Web/A in One Deck: HTML-Native Presentation

<div class="slide-cover">
<div class="slide-logo">SORANE</div>
<h1>Web/A in One Deck</h1>
<div class="slide-divider"></div>
<p class="slide-subtitle">An archival document format that makes <strong>reading, sharing, and verifying</strong> possible with a single HTML file.</p>
</div>

---

<div class="slide-section">
<div class="slide-kicker">Context</div>
<h2>Why Web/A</h2>
<div class="slide-divider"></div>
<ul>
  <li>PDF is durable, but weak in <strong>structure, verification, and evolution</strong></li>
  <li>The Web is flexible, but weak in <strong>long-term preservation</strong></li>
  <li>Teams need both <strong>easy distribution</strong> and <strong>trustworthiness</strong></li>
</ul>
</div>

---

<div class="slide-card">
<h2>HTML-Complete by Design</h2>
<ul>
  <li><strong>Single-file</strong> HTML delivery</li>
  <li>Fonts and assets <strong>embedded</strong></li>
  <li>Designed to stay readable <strong>for decades</strong></li>
</ul>
</div>

---

<div class="slide-split">
<div>
<h2>The 4-Layer Model</h2>
<ul>
  <li><strong>Layer 1:</strong> The Template (Definitions)</li>
  <li><strong>Layer 2:</strong> The Data (Encrypted Facts)</li>
  <li><strong>Layer 3:</strong> The Context (Routing & Metadata)</li>
  <li><strong>Layer 4:</strong> The Presentation (UI & Layout)</li>
</ul>
</div>
<div class="presentation-figure">
<svg width="600" height="420" viewBox="0 0 600 420" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
    </marker>
    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
    </marker>
  </defs>
  <rect width="600" height="420" fill="#F8FAFC"/>
  <rect x="40" y="30" width="520" height="360" rx="12" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  <text x="60" y="55" font-family="system-ui" font-size="14" font-weight="700" fill="#64748B">Web/A Document (.html)</text>

  <!-- Layer 4: Presentation -->
  <rect x="60" y="70" width="480" height="40" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="75" y="90" font-family="system-ui" font-size="11" font-weight="700" fill="#475569">Layer 4: Presentation (UI / View)</text>
  <text x="75" y="103" font-family="system-ui" font-size="9" fill="#64748B">CSS, Fonts, display logic</text>

  <!-- Layer 3: Context -->
  <rect x="60" y="115" width="480" height="45" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="75" y="132" font-family="system-ui" font-size="11" font-weight="700" fill="#92400E">Layer 3: Context (Metadata / Routing)</text>
  <text x="75" y="145" font-family="system-ui" font-size="9" fill="#92400E">Transport Tag, Expiry, Nonce, Policy Ref</text>

  <!-- Layer 2: Data -->
  <rect x="60" y="165" width="480" height="65" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="75" y="185" font-family="system-ui" font-size="11" font-weight="700" fill="#047857">Layer 2: Data (Facts / Records)</text>
  <text x="75" y="202" font-family="system-ui" font-size="9" fill="#065F46">Encrypted payload, User Signature (VP)</text>

  <!-- Link to Layer 1 -->
  <path d="M300 230V240" stroke="#10B981" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Layer 1: Template -->
  <rect x="60" y="240" width="480" height="130" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="265" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA">Layer 1: Template (Definition / Core)</text>

  <rect x="80" y="280" width="200" height="45" rx="4" fill="white" stroke="#6366F1"/>
  <text x="90" y="295" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA">Human Readable</text>
  <text x="90" y="312" font-family="system-ui" font-size="9" fill="#64748B">HTML / Template</text>

  <!-- Semantic Mapping -->
  <path d="M280 302H320" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-blue)" marker-start="url(#arrow-blue)"/>
  <text x="300" y="297" font-family="system-ui" font-size="8" fill="#6366F1" text-anchor="middle" font-weight="bold">Bound</text>

  <rect x="320" y="280" width="200" height="45" rx="4" fill="white" stroke="#6366F1"/>
  <text x="330" y="295" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA">Machine Readable</text>
  <text x="330" y="312" font-family="system-ui" font-size="9" fill="#64748B">JSON-LD / Logic</text>

  <rect x="80" y="335" width="440" height="25" rx="4" fill="#6366F1" fill-opacity="0.1"/>
  <text x="300" y="352" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA" text-anchor="middle">Issuer Signature: Ed25519 + PQC</text>
</svg>
</div>
</div>

---

## Strength 1: Distribution Simplicity

- Send **one file**
- Open with **any browser**
- Eliminate environment drift

---

## Strength 2: Built-in Authenticity

- Embedded signatures for **tamper detection**
- Passkeys for **holder binding**
- Verification logs baked in

---


---

## Strength 3: LTV Guarantee

- **Rebuild-Safe**: Fix typos in 2030 without breaking 2025 signatures.
- **Offline**: Self-contained trust anchors (embedded DID).
- **50-Year Proof**: Verify independently even if the issuer vanishes.

---

## Web/A Form

- Low-frequency, high-value workflows
- Create, sign, and submit **inside the browser**
- Local aggregation with **HTML-based aggregator**

---

## Web/A L2 Encryption

- Encrypted for **recipient-only** access
- Bound to Layer 1 template via AAD
- Designed for **Passkey-first** UX

---

## Web/A Folio

- A personal/organizational **data container**
- Bundle history, proofs, and records
- Structured for **AI collaboration**

---

## AI-First Workflow

- Agents can read **structure + signatures**
- Assist input, summarize, verify
- Built on **Human-Machine Parity**

---

## Presentation Mode

- This page becomes a **sales deck**
- Full-screen **slideshow** from the same HTML
- Share, archive, and present with zero extra tools

---

## Summary

- Web/A is an **HTML-native document platform**
- Balances preservation, distribution, and verification
- Turns static documents into **usable artifacts**

---

## Next Step

- Try the Web/A Form Maker
- Convert an existing doc into Web/A
- Apply Web/A to your internal workflows
