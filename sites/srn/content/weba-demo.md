---
title: "Web/A (v1.5) Implementation Demo"
layout: weba
date: 2025-12-24
author: "Sorane SSG Engine"
description: "Demonstration of Bimodal presentation, C2PA-style provenance, and advanced typography."
semanticData:
  type: "TechnicalDemo"
  features:
    - "Bimodal Presentation (Archive/Wallet)"
    - "C2PA-style Manifest"
    - "IVS/Gaiji Typography"
    - "Zero-CLS Subsetted Fonts"
---

## 1. Bimodal Presentation
This document is a **Bimodal Asset**. It contains two primary visual states:
- **Archive View (Desktop)**: A fixed-scale A4 layout designed for high-fidelity archival and printing.
- **Wallet View (Mobile)**: A responsive, card-based layout optimized for mobile wallets and smartphone screens.

Trial: Resize your browser window or open this on a smartphone to see the transition.

---

## 2. Advanced Typography (Gaiji & IVS)
Web/A ensures that rare characters and administrative variants are rendered correctly by embedding subsetted fonts. Below are examples of specific glyph variants (IVS) and administrative glyphs that typically require specialized fonts:

- **Name Variants (渡邉/渡辺)**: 
  - Standard: 渡邉
  - Variation (subsetted): 渡󠄁邉
- **Administrative Symbols**: 
  - (特), (代), (資) - inlined as path-constant glyphs if necessary.
- **Glyph Integrity**: These characters are part of the signed payload. Any unauthorized font replacement that alters the visual meaning can be detected.

---

## 3. Provenance & C2PA-style Manifest
At the bottom of this document, you will find the **Provenance Manifest**. 
This is a machine-readable JSON-LD structure that includes a **Generator Claim**.

The Sorane Engine asserts that:
1. The human-readable HTML matches the machine-readable JSON-LD (**HMP**).
2. All font assets are subsetted and bound to the document content.
3. The document is "Trust-Transition Ready" for long-term archival.

---

## 4. Machine-Readable Context
The following raw data is embedded in the `application/ld+json` block of this file, allowing automated systems to process this demo as structured data:

```json
{
  "type": "TechnicalDemo",
  "status": "Verified",
  "compliance": "Web/A-1p"
}
```
