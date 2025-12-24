---
title: "Discussion Paper: Web/A - Archival-Grade Web Documents"
layout: article
date: 2024-12-24
author: "Sorane Project Team"
---

# Web/A: A Portable, Machine-Readable, and Long-Term Archival Web Document Format

## 1. Abstract
This paper proposes **Web/A**, a specification for archival-grade web documents. While PDF/A is widely used for long-term visual preservation, it often becomes a "data silo" where structure and semantic meaning are difficult to extract. Web/A leverages standard web technologies—HTML5, CSS, and JSON-LD—to create a format that is universally readable by humans and machines, portable as a single file, and digitally verifiable.

---

## 2. The Problem: The "Dark Data" of PDF/A and XML
Governmental and corporate archives often rely on formats that are either:
- **Visual-only (PDF/A)**: Excellent for printing, but difficult for automated data processing and accessibility.
- **Machine-only (XML/CSV)**: Requires external stylesheets (XSLT) or specific software to be human-readable, often leading to "bit rot" when those external assets are lost.

Web/A aims to bridge this gap by providing a format that is **Self-Documenting**, **Self-Contained**, and **Semantic**.

---

## 3. Core Principles of Web/A

### 3.1. Human-Machine Duality (HMD)
Every Web/A document must contain both:
1.  **Human-Readable Layer**: High-quality HTML/CSS that any modern browser can render without external dependencies.
2.  **Machine-Readable Layer**: Embedded **JSON-LD** (Linked Data) that provides a strict, schema-compliant representation of the information.

### 3.2. Extreme Portability
Web/A documents are designed to be "Self-Contained". Fonts, images, and styles should be inlined (e.g., via Data URLs) or bundled in a way that remains functional 50 years from now without hitting an external server.

### 3.3. Static Formatting
Unlike modern web apps that rely on complex JavaScript frameworks, Web/A uses **Static CSS**. Rendering does not require JavaScript, ensuring that the document remains "as issued" even if browser engine behaviors change.

### 3.4. Cryptographic Verifiability
Integrating with decentralized identifiers (**DIDs**) and Verifiable Credentials (**VCs**), a Web/A document can be digitally signed. The signature covers both the visual HTML and the semantic JSON-LD, ensuring the document has not been tampered with.

---

## 4. Technical Architecture

### 4.1. Structure
A Web/A file is a standard HTML5 document with specific requirements:
- **Encoding**: UTF-8.
- **Metadata**: Standardized header containing the JSON-LD context.
- **Assets**: Subsetted fonts and essential images embedded as base64-encoded strings.

### 4.2. Semantic Discovery
Machines can discover the semantic content via:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GovernmentPermit",
  "name": "Resident Record",
  ...
}
</script>
```

### 4.3. Multi-Layer Maintenance Model
To prevent the "XSLT Problem" (where browser engine changes render a format unreadable), Web/A defines two distinct layers within a single file:

1.  **Signed Content Layer (The "Payload")**:
    *   Contains the semantic HTML and JSON-LD. 
    *   This layer is cryptographically signed by the original issuer.
    *   It represents the "fact" of the document.

2.  **Portable Viewer Layer (The "Wrapper")**:
    *   Contains the CSS, fonts, and any minimal logic needed to render the payload on then-current browser engines.
    *   **Evolutionary Maintenance**: During a "Signature Refresh" (e.g., re-signing for long-term preservation every 10–20 years), the archive system is permitted to **replace the Viewer Layer**.
    *   This ensures that even if CSS syntax or font formats change over 100 years, the viewing experience remains functional while the original signature of the *Content Layer* remains valid as a nested proof.

### 4.4. Human-Machine Parity (HMP) Guarantee
A major challenge is ensuring that the JSON-LD data and the rendered HTML content do not diverge. Web/A adopts a **Generator-Centric** approach:

1.  **Static Synchronization**: The generator tool (e.g., Sorane) is responsible for ensuring that for every key-value pair in the JSON-LD, a corresponding element exists in the HTML.
2.  **Generator Claims (C2PA Style)**: The document metadata includes a **Generator Claim**. This signed statement records the tool name, version, and a cryptographic assertion of parity.
3.  **Avoidance of Runtime Rendering**: To minimize long-term risks, the HTML is "baked" at generation time.

### 4.5. Long-Term Validation (LTV) and the "Trust Transition"
Traditional LTV (e.g., in PAdES) focuses on embedding OCSP/CRL evidence to allow offline verification. However, for 50+ year horizons, Web/A prioritizes **Trust Transition** over evidence hoarding:

1.  **The Evidence Paradox**: Saving an OCSP response from a defunct CA is of limited value if the CA's root is no longer trusted or the crypto is broken.
2.  **Maintenance via Re-signing (The Sorane Model)**: instead of relying on stagnant evidence, Web/A encourages periodic **Signature Refreshing**. 
    *   Before a cryptographic algorithm becomes weak or a DID/domain becomes unreachable, the archive system verifies the current document.
    *   It then wraps the document in a new "Maintenance Signature" using modern algorithms and a current trust anchor.
3.  **Verification of Record**: The trusted timestamp (RFC 3161) remains the primary proof of existence. The transition records (who re-signed what and when) are kept in a verifiable ledger, ensuring a continuous chain of custody.

---

## 5. Prototype Implementation in Sorane (srn)
The Sorane project implements Web/A by:
1.  **Automatic Subsetting**: Reducing font sizes by embedding only required glyphs.
2.  **JSON-LD Injection**: Automatically generating linked data from Markdown frontmatter.
3.  **Hybrid Signing**: Applying dual-signature (Ed25519 + ML-DSA) to the entire HTML bundle.
4.  **Provenance Manifest**: Embedding a signed claim about the generator's integrity and the consistency of the data layers.

---

## 6. Comparison Table

| Feature | PDF/A | XML + XSLT | **Web/A** |
| :--- | :--- | :--- | :--- |
| **Human Readable** | Excellent | Conditional | Excellent |
| **Machine Readable** | Poor | Excellent | Excellent |
| **Self-Contained** | Yes | No | Yes |
| **Accessibility** | Limited | High (if processed) | Native |
| **Verifiability** | Digital Sig | XML Sig | **Linked Data VC** |

---

## 7. Conclusion
Web/A represents a shift from "Documents as Images" to "Documents as Data with a Built-in View". It is the ideal format for the next generation of e-government, digital inheritance, and long-term knowledge management.
