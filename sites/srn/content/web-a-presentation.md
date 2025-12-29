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
<h2>The 3-Layer Model</h2>
<ul>
  <li><strong>Layer 1:</strong> Signed Content (immutable truth)</li>
  <li><strong>Layer 2:</strong> Confidential Payload (recipient-only encryption)</li>
  <li><strong>Layer 3:</strong> Presentation (flexible layouts & UI)</li>
</ul>
</div>
<div class="presentation-figure">
<svg width="600" height="460" viewBox="0 0 600 460" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="weba-structure-title weba-structure-desc" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
  <title id="weba-structure-title">Web/A Document Structure</title>
  <desc id="weba-structure-desc">A single Web/A HTML file contains three layers. Layer 3 is the replaceable presentation view (CSS/fonts). Layer 2 is user-signed answers and consent (Passkey/VP) linked to Layer 1. Layer 1 is issuer-signed core content, split into human-readable HTML and machine-readable JSON-LD, bound by a semantic mapping and issuer signature.</desc>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
    </marker>
    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
    </marker>
  </defs>
  <rect width="600" height="460" fill="#F8FAFC"/>
  <rect x="40" y="30" width="520" height="400" rx="12" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  <text x="60" y="55" font-family="system-ui" font-size="14" font-weight="700" fill="#64748B">Web/A Document (.html)</text>

  <!-- Layer 3: Presentation -->
  <rect x="60" y="70" width="480" height="50" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="75" y="95" font-family="system-ui" font-size="13" font-weight="700" fill="#475569">Layer 3: Portable Presentation (View)</text>
  <text x="75" y="110" font-family="system-ui" font-size="10" fill="#64748B">CSS, Fonts (Replaceable for Future Compatibility)</text>

  <!-- Layer 2: User Signed -->
  <rect x="60" y="130" width="480" height="80" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="75" y="155" font-family="system-ui" font-size="13" font-weight="700" fill="#047857">Layer 2: User-Signed Context (Input/Fact)</text>
  <text x="75" y="175" font-family="system-ui" font-size="11" fill="#065F46">User Answers / Agreement</text>
  <text x="75" y="190" font-family="system-ui" font-size="11" fill="#065F46">Passkey Signature (VP)</text>
  <!-- Link to Layer 1 -->
  <path d="M300 210V220" stroke="#10B981" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Layer 1: Issuer Signed -->
  <rect x="60" y="220" width="480" height="150" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="245" font-family="system-ui" font-size="13" font-weight="700" fill="#4338CA">Layer 1: Issuer-Signed Core (Template/Law)</text>

  <rect x="80" y="260" width="200" height="60" rx="4" fill="white" stroke="#6366F1"/>
  <text x="90" y="280" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">Human Readable</text>
  <text x="90" y="300" font-family="system-ui" font-size="11" fill="#64748B">HTML / Questions</text>

  <!-- Semantic Mapping -->
  <path d="M280 290H320" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-blue)" marker-start="url(#arrow-blue)"/>
  <text x="300" y="285" font-family="system-ui" font-size="9" fill="#6366F1" text-anchor="middle" font-weight="bold">Mapping</text>

  <rect x="320" y="260" width="200" height="60" rx="4" fill="white" stroke="#6366F1"/>
  <text x="330" y="280" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">Machine Readable</text>
  <text x="330" y="300" font-family="system-ui" font-size="11" fill="#64748B">JSON-LD / Logic</text>

  <rect x="80" y="330" width="440" height="25" rx="4" fill="#6366F1" fill-opacity="0.1"/>
  <text x="300" y="347" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA" text-anchor="middle">Issuer Signature: Ed25519 + PQC</text>
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

## Web/A Form

- Low-frequency, high-value workflows
- Create, sign, and submit **inside the browser**
- Local aggregation with **HTML-based aggregator**

---

## Web/A L2 Encryption

- Encrypted for **recipient-only** access
- Bound to Layer1 reference via AAD
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
