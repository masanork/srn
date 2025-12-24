---
title: "Discussion Paper: Web/A - Archival-Grade Web Documents"
layout: weba
date: 2024-12-24
author: "Sorane Project Team"
---

# Web/A: A Portable, Machine-Readable, and Long-Term Archival Web Document Format

[日本語版 (Japanese version)](./web-a.ja.html)

## 1. Abstract
This paper proposes **Web/A**, a specification for archival-grade web documents. While PDF/A is widely used for long-term visual preservation, it often becomes a "data silo" where structure and semantic meaning are difficult to extract. Web/A leverages standard web technologies—HTML5, CSS, and JSON-LD—to create a format that is universally readable by humans and machines, portable as a single file, and digitally verifiable.

---

## 2. Historical Context & Problem Statement

### 2.1. The PDF/A Limitation: Visual Silos
PDF/A (ISO 19005) succeeded in preserving the *visual* representation of documents. However, it fails in the era of automated data processing:
- **Opacity**: Extracting specific data points (e.g., an address from a tax form) remains a heuristic/AI-driven task rather than a deterministic one.
- **Accessibility**: Re-flowable text and accessibility features are often broken or inconsistently implemented.

### 2.2. The XML+XSLT Failure: The Connectivity Trap
Early e-government initiatives attempted to use XML for data and XSLT for presentation. This approach faced several "Bit Rot" challenges:
- **Dependency Hell**: The XML file is useless without the external XSLT, which is often lost or served from a dead URL.
- **Engine Evolution**: Modern browsers have deprecated or restricted XSLT (e.g., Chrome's restrictions on local XSLT), rendering archived documents unreadable.
- **The "XTX" Problem**: Formats that separate content and style often result in a "Broken Link" between what the machine reads and what the human sees.

Web/A aims to bridge this gap by providing a format that is **Self-Documenting**, **Self-Contained**, and **Semantic**.

---

## 3. Core Principles of Web/A

### 3.1. The Triality: Human, Machine, and AI
Every Web/A document is optimized across three dimensions:
1.  **Human-Readable Layer**: Visual presentation via high-quality HTML/CSS.
2.  **Machine-Readable Layer**: Strict JSON-LD for system-level processing.
3.  **Semantic Accessibility (AI/Assistive)**: Structural integrity for assistive technologies and AI reasoning.

A core tenet of Web/A is the **convergence of Accessibility and AI Interpretability**. A semantically correct document is equally "legible" for a screen reader used by the visually impaired and for an AI model performing summarization or reasoning. Web/A solves the accessibility "tagging" complexity inherent in PDF/A by leveraging native, semantic HTML elements.

### 3.2. Extreme Portability
Web/A documents are designed to be "Self-Contained". Fonts, images, and styles should be inlined (e.g., via Data URLs) or bundled in a way that remains functional 50 years from now without hitting an external server.

### 3.3. Static Formatting
Unlike modern web apps that rely on complex JavaScript frameworks, Web/A uses **Static CSS**. Rendering does not require JavaScript, ensuring that the document remains "as issued" even if browser engine behaviors change.

### 3.4. Cryptographic Verifiability
Integrating with decentralized identifiers (**DIDs**) and Verifiable Credentials (**VCs**), a Web/A document can be digitally signed. The signature covers both the visual HTML and the semantic JSON-LD, ensuring the document has not been tampered with.

---

## 4. Web/A Compliance Levels
Similar to PDF/A-1a or 1b, Web/A defines levels of technical rigor:

- **Web/A-1s (Semantic)**:
  - Valid HTML5 + CSS.
  - Valid JSON-LD embedded.
  - Basic cryptographic signature.
  - *Target*: Simple documents where semantic meaning is the priority.
- **Web/A-1u (Universal)**:
  - All requirements of 1s.
  - **Zero External Requests**: All assets (fonts, images) must be embedded via Data URL.
  - **Subsetted Fonts**: Only required glyphs are included to ensure minimal size and CLS 0.
  - *Target*: Official certificates and administrative records.
- **Web/A-1p (Provenance)**:
  - All requirements of 1u.
  - **C2PA Provenance Manifest**: Includes a signed assertion from the generator tool about the consistency of the human and machine layers.
  - **Human-Machine Parity (HMP) Claim**: Cryptographic proof that the JSON-LD was mapped to the HTML at generation time.
  - *Target*: High-trust archival records and evidence.

---

## 5. Technical Architecture

### 5.1. Multi-Layer Maintenance Model
To prevent the "XSLT Problem", Web/A defines two distinct layers within a single file:

1.  **Signed Content Layer (The "Payload")**:
    *   Contains the semantic HTML and JSON-LD. 
    *   This layer is cryptographically signed by the original issuer.
    *   It represents the "fact" of the document.

2.  **Portable Viewer Layer (The "Wrapper")**:
    *   Contains the CSS, fonts, and any minimal logic needed to render the payload.
    *   **Evolutionary Maintenance**: During a "Signature Refresh" (e.g., re-signing every 10–20 years), the archive system is permitted to **replace the Viewer Layer** to ensure compatibility with future browser engines.

### 5.2. Human-Machine Parity (HMP) Guarantee
The generator tool (e.g., Sorane) is responsible for ensuring that the JSON-LD and HTML do not diverge. This is guaranteed via:
- **Static Synchronization**: The HTML is "baked" from the same data source as the JSON-LD.
- **Generator Claims**: Embedding a **C2PA-style manifest** into the document. This manifest contains a hash of the transformation logic and a synchronized assertion.

#### 5.2.1. Micro-Mapping for Auditability
To enhance third-party verifiability, Web/A encourages the use of semantic attributes (e.g., `data-weba-field`) within the HTML to explicitly map display elements to JSON-LD properties.
- **Example**: `<span data-weba-field="datePublished">2025-12-24</span>`
This transparent mapping allows auditors and scripts to confirm that visualized data matches the machine-readable layer within the signed payload.

### 5.3. Long-Term Validation (LTV) and the "Trust Transition"
For 50+ year horizons, Web/A prioritizes **Trust Transition** over evidence hoarding:
- **RFC 3161 Timestamping**: Proof of existence at a specific time.
- **Maintenance via Re-signing**: Periodic "wrapping" of the document in new signatures with updated algorithms, ensuring a continuous chain of custody.

---

## 6. Implementation Flexibility: The "Lightweight Trust" Model
A major barrier to archival signing is the complexity of key management. Web/A does not negate the use of high-assurance methods like HSMs; rather, it complements them with a "Lightweight Trust" model designed to lower the entry barrier and encourage widespread adoption.

The true value of this model lies in its ability to **issue safely signed documents on existing Web Application foundations** without requiring dedicated key management infrastructure. This is essential for the diversity of issuers and the "small start" necessary for Global VC adoption.

This model is particularly effective for the transition to **Post-Quantum Cryptography (PQC)**. Instead of waiting for existing PKI or HSM infrastructures to become PQC-ready, the Lightweight Trust model allows for the **"Early and Safe Adoption" of PQC signatures**. By rooting trust in current hardware-backed Passkeys and dynamically generating PQC signatures during the build process, issuers can begin protecting archival records against future quantum threats today.

### 6.1. Tiered Authority: Passkey-to-Build Delegation
Rather than requiring permanent HSMs for every build, Web/A leverages **Delegated Identity**:
1.  **Root of Trust (Offline/Hardware)**: The publisher uses a **Passkey (WebAuthn)** on a developer's device (e.g., iPhone, Android, or Yubikey). This key remains in the device's Secure Enclave.
2.  **Delegate Certificate**: For a specific publishing window (e.g., 7 days), the Root Key signs an **Ephemeral Build Key** used by the CI/CD pipeline (GitHub Actions, etc.).
3.  **Implicit Authorization**: The document signature is tied to the build key, which in turn is authorized by the publisher's Passkey.

### 6.2. Ephemeral Issuance
To minimize the impact of key compromise:
- Every build generates a **fresh pair of signing keys**.
- These keys only exist in the memory of the build runner.
- The **Build ID** and public fingerprints are recorded in a **Public Transparency Log** (or a simple JSON history file on the site).

### 6.3. Identity via Transparency (DID-lite)
Instead of expensive PKI certificates, Web/A uses **Transparency over Authority**:
- **DID:Web Disclosure**: The publisher's `did.json` and a `key-history.json` are served via the same domain as the documents.
- **Fingerprint Publication**: By publishing the fingerprints of all valid build keys, the publisher provides verifiers with a "Known Good" list, reducing the trust requirement for any single ephemeral key.

---

## 7. Advanced Typography and Form Representation
Web/A must bridge the gap between "faithful reproduction of structured forms" (where PDF/A excels) and "data fluidity" (where the Web excels).

### 7.1. Character Coverage: Handling Administrative Standards and Rare Glyphs
For governmental use cases in regions like Japan, supporting extensive character sets (e.g., Administrative Standard Characters) and "Gaiji" (user-defined characters) is critical. Web/A achieves this via:
- **WebFont Subsetting**: Embedding only the required glyphs, including IVS (Ideographic Variation Sequences), directly into the file.
- **SVG Inlining**: For one-off rare characters or unique symbols that are difficult to fontify, path data is inlined directly as SVG within the HTML.
This ensures 100% visual consistency regardless of the client-side environment.

### 7.2. Challenges in Faithful Form Reproduction
Traditional official documents are often based on "Fixed-size, Ruled-paper" layouts (e.g., A4). While CSS is powerful, recreating pixel-perfect forms for the web presents several challenges:
- **Rendering Engine Variance**: Nuances in how different browsers handle layout logic can make millimeter-precise positioning difficult.
- **Accessibility vs. Layout**: Balancing fixed-frame layouts with accessibility features like text resizing and screen readers requires sophisticated CSS design.

### 7.3. Bimodal Presentation for the Mobile Era
With the dominance of smartphones, documents require **Bimodal Presentation**:
1.  **Archive View (Fixed)**: A traditional form-based layout used for printing and official verification—the "Formal Face" of the document.
2.  **Wallet View (Adaptive)**: A responsive, mobile-optimized card view for quick reference on small screens—the "Practical Face" of the document.
Web/A's Viewer layer allows switching between these two views using CSS from a single signed payload, maximizing the mobile experience while maintaining archival integrity.

---

## 8. Implementation in Sorane (srn)
The Sorane project implements Web/A-1p by default:
1.  **Provencance Manifest**: Automatically injected in the JSON-LD.
2.  **In-Font Signatures**: Injecting `SRNC` tables into subsetted fonts.
3.  **Hybrid Signing**: Dual Ed25519 + ML-DSA-44 signatures.

---

## 9. Comparison Table

| Feature | PDF/A | XML + XSLT | **Web/A** |
| :--- | :--- | :--- | :--- |
| **Human Readable** | Excellent | Conditional (Bit Rot) | Excellent |
| **Machine Readable** | Poor (Visual Silo) | Excellent | Excellent |
| **Self-Contained** | Yes | No | Yes |
| **Accessibility** | Limited | High (if processed) | Native |
| **Maintenance** | Re-imaging | Re-coding | **Re-wrapping (LTV)** |

---

## 10. Phased Adoption Roadmap: A Layered Approach
Demanding full Verifiable Credential (VC) specifications, such as Holder Binding, for every document from the start can increase implementation complexity and hinder adoption. Web/A encourages a phased approach based on technical maturity and specific use cases.

### Layer 1: Publicly Available Documents (Current Sorane Scope)
Targeting documents for the general public, such as official gazettes, statistical data, and whitepapers.
*   **Technical Requirements**: Authenticity (Signature) and Long-term Readability.
*   **Characteristics**: Low risk of replay attacks; the value lies in the transparent availability of the information.

### Layer 2: Documents with Personal Privacy Information
Targeting notifications, receipts, and private reports issued to specific individuals or organizations.
*   **Technical Requirements**: Layer 1 requirements + appropriate access control and confidentiality.
*   **Characteristics**: Privacy protection is paramount, but strict identity verification at the point of presentation may not always be required.

### Layer 3: Identity & Authorization Documents (Holder Binding Required)
Targeting documents that prove identity or authority during secondary circulation, such as resident records (Juminhyo), powers of attorney, employee IDs, and professional certifications.
*   **Technical Requirements**: **Holder Binding**. A cryptographic link between the document and the presenter's identity (e.g., a private key in a secure enclave or JPKI).
*   **Characteristics**: Requires the highest level of trust to prevent personation and unauthorized use.

---

## 11. Technical Challenges and the Path to Standardization
Realizing the full potential of Web/A requires addressing several technical hurdles and establishing cross-industry standards.

### 11.1. Cross-Device and In-Person Transfer Protocols
Moving a Web/A document from a browser to a mobile wallet or another person's device in an offline or face-to-face setting remains a challenge.
- **Challenge**: Seamless interaction with NFC, BLE, or QR-based transfer protocols directly from within the browser sandbox.
- **Outlook**: Native browser integration with standards such as ISO/IEC 18013-5 (mDL) and OpenID for Verifiable Presentations (OID4VP).

### 11.2. Practical Holder Binding Implementation
Linking a document to a person's hardware-backed key (e.g., Secure Enclave) without compromising UX or privacy.
- **Challenge**: Calling hardware-backed signatures (like Passkeys) and dynamically binding them to web-based document presentations while maintaining the "Self-Contained" nature of Web/A.
- **Outlook**: Further development of SD-JWT and SD-COSE implementations that allow for selective disclosure and hardware-bound proof-of-possession.

### 11.3. Native Browser Support for Verification
For Web/A to be truly trusted, browsers must recognize it as more than just "another web page."
- **Outlook**: Standardization of browser UI elements that display the document's signature status, issuer identity, and Human-Machine Parity (HMP) verification directly in the chrome/address bar.

### 11.4. Standardizing Trust Transition (LTV)
Ensuring that "Signature Refreshes" and algorithm updates over 50+ years are recorded in a way that remains globally verifiable.
- **Outlook**: Creating interoperable protocols for "Audit Logs" of trust transitions that can be understood by different archival institutions and verifiers worldwide.

### 11.5. Legal Positioning: From "Will" to "Evidence"
Web/A does not necessarily aim to fall under the rigid category of "Electronic Signatures" defined by specific national acts that primarily focus on the **manifestation of will** (e.g., contracts, formal seals).
- **Enhancing Probative Value**: Instead of seeking absolute legal presumption, Web/A focuses on providing objective, cryptographic, and technical evidence of a document's **authentic establishment** (integrity and origin).
- **Pragmatic Distance from PKI**: By focusing on the "evidence of fact" rather than high-stakes "intent", Web/A provides significant social and business value—even without relying on high-cost, state-regulated PKI infrastructure—simply by making documents verifiable.

### 11.6. Ecosystem Strategy: AI Agent-First
To jumpstart the developer ecosystem, Web/A prioritizes tools that AI agents and developers can use immediately, rather than waiting for full-featured mobile wallets.
- **Headless Wallets (CLI / MCP)**: Developing command-line tools and MCP (Model Context Protocol) servers that allow AI agents like Gemini-CLI or Claude Code to autonomously read, request, issue, and verify Web/A documents.
- **Programmable Trust**: When an AI agent processes a Web/A document, it should be able to instantly verify its provenance via API and calculate a trust score. This creates an automated chain of trust between AI agents long before human-facing UIs reach critical mass.

---

## 12. Alignment with International Standardization
Web/A is intended not as a novel technology isolated from the rest of the world, but as a profile that integrates and optimizes existing international standards for the purpose of archival and verifiability. This work aligns with and contributes to several key standard communities.

### 12.1. W3C Verifiable Credentials (VC)
Web/A acts as a **Document-centric Profile** for the W3C VC 2.0 specification. By defining an implementation model that inseparably binds metadata (JSON-LD) with presentation (HTML) in a way accessible via any standard browser, Web/A provides a practical path for the widespread adoption of digital credentials in document formats.

### 12.2. IETF SPICE and COSE
The application of binary-formatted credentials and selective disclosure (SD-COSE) to HTML documents serves as a pragmatic implementation case for discussions within the IETF SPICE WG. Furthermore, the "Lightweight Trust" model for deploying PQC (Post-Quantum Cryptography) signatures on existing infrastructure offers valuable insights for secure, future-proof infrastructure transition.

### 12.3. C2PA (Provenance)
Extending the C2PA provenance specification beyond images and video to HTML-based text documents ensures the authenticity of the entire generation process, including assets like subsetted fonts. Web/A proposes a profile that deepens the applicability of C2PA in the domain of structured text.

---

## 13. Final Thoughts
Web/A is a proposal to bridge the gaps between existing Web technologies and the Verifiable Credentials ecosystem, specifically regarding long-term archival and human-machine consistency. 

Rather than being a definitive solution, this memorandum aims to organize the necessary values and identify the missing technical pieces required for the next generation of e-government and digital heritage management. We position this work as a foundational discussion piece for building a truly sustainable and verifiable knowledge management infrastructure.
