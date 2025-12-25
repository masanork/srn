---
title: "Discussion Paper: Web/A - Archival-Grade Web Documents"
layout: weba
author: "Masanori Kusunoki"
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

### 2.2. The "Machine-Only" Trap: XTX and Custom XML
Even highly structured data formats like e-Tax's XTX (used in Japan) face significant challenges when they lack a native human-readable layer:
- **Viewer Dependency**: These formats require specialized software or proprietary viewers to render data for humans. There is no guarantee these viewers will function decades later.
- **The Visual/Cryptographic Disconnect**: Decisions are made based on a "secondary rendering," while the signature applies only to the underlying "unreadable" data. This creates a security gap where the visual presentation could be manipulated without invalidating the cryptographic signature of the data.

### 2.3. The XML+XSLT Failure: The Connectivity Trap
Early e-government initiatives attempted to use XML for data and XSLT for presentation. This approach faced several "Bit Rot" challenges:
- **Dependency Hell**: The XML file is useless without the external XSLT, which is often lost or served from a dead URL.
- **Engine Evolution**: Modern browsers have deprecated or restricted XSLT (e.g., Chrome's restrictions on local XSLT), rendering archived documents unreadable.

### 2.4. The Signature Verification Barrier: AATL Transparency and Viewer Locked-in
The verification of PDF authenticity faces significant challenges regarding the Root of Trust and user experience:
- **Dependency on AATL (Adobe Approved Trust List)**: Most PDF signatures rely on AATL, a trust store managed centrally by a single private corporation (Adobe). This proprietary model lacks the decentralized governance and transparency found in open Web standards or national Public Key Infrastructures (PKI).
- **Limited Viewer Ecosystem**: Proper validation of advanced digital signatures (e.g., PAdES, LTV) is often locked into specific desktop applications like Adobe Acrobat. Mobile browsers and generic built-in PDF viewers frequently display "Signature Unknown," making it nearly impossible for everyday users to verify authenticity on the spot.

Web/A aims to bridge this gap by providing a format that is **Self-Documenting**, **Self-Contained**, and **Semantic**.

---

## 3. Core Principles of Web/A

### 3.1. Structure Optimized for Humans, Machines, and AI
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

## 4. Scope and Use Cases
Web/A is not intended to replace all web content. Its focus is on standardizing "digital assets that require long-term trust and reusability."

### 4.1. Primary Targets (Replacement and Augmentation)
- **Static Archival PDF/A**: PDFs succeed at "Visual Locking" but fail at machine-readability. Web/A augments or replaces these with a format that allows deterministic data extraction.
- **Distribution-Only XML/XTX + Proprietary Viewers**: "Opaque" data files that are unreadable without specialized software are transformed into "Self-Contained Documents" that can be viewed and verified in any standard browser.
- **Platform-Dependent Notifications and History**: Records like bank statements or government notices that only exist behind a portal (and vanish when the service ends) are turned into independent assets that users can own and archive indefinitely.

### 4.2. Out of Focus (Non-Goals)
- **Rich Dynamic Applications**: Web apps that require constant user interaction and frequent external API calls are out of scope. Web/A is a static record of a "fact" captured at the moment of issuance.
- **Real-time Secret Communication**: Protecting dynamic communication channels like chat or authentication sessions is the domain of TLS and specialized messaging protocols, not Web/A.
- **Large-Scale Media Archiving**: Using Web/A as a container for high-resolution video or massive datasets is not intended. Web/A is optimized for "Semantic Document Structures," not as a general-purpose thick container.

---

## 5. Web/A Conformance Levels
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

## 6. Technical Architecture

### 6.1. Multi-Layer Maintenance Model
To prevent the "XSLT Problem", Web/A defines two distinct layers within a single file:

1.  **Signed Content Layer (The "Payload")**:
    *   Contains the semantic HTML and JSON-LD. 
    *   This layer is cryptographically signed by the original issuer.
    *   It represents the "fact" of the document.

2.  **Portable Presentation Layer (The "Wrapper")**:
    *   Contains the CSS, fonts, and any minimal logic needed to render the payload.
    *   **Evolutionary and Decentralized Maintenance**: Long-term preservation requires updates to the wrapper layer for future browser compatibility or security hardening. Web/A anticipates a future where the original issuer may no longer exist, and thus proposes a mechanism where **anyone (archives, libraries, or individual custodians)** can safely modernize the viewer. Documents should embed a non-local URI (e.g., pointing to a decentralized Registry or Standards Body) for distributing the latest trusted viewer. This allows any custodian to adopt a signed, up-to-date viewer without compromising the original integrity of the payload.

### 6.2. Human-Machine Parity (HMP) Guarantee
The generator tool (e.g., Sorane) is responsible for ensuring that the JSON-LD and HTML do not diverge. This is guaranteed via:
- **Static Synchronization**: The HTML is "baked" from the same data source as the JSON-LD.
- **Generator Claims**: Embedding a **C2PA-style manifest** into the document. This manifest contains a hash of the transformation logic and a synchronized assertion.

### 6.3. Web/A Document Structure and Trust Chain
The robustness of Web/A lies in the clean separation between the presentation layer (Wrapper) and the signed data layer (Payload), with a strict parity (HMP) maintained between them.

<div align="center">
<svg width="600" height="380" viewBox="0 0 600 380" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
  <rect width="600" height="380" fill="#F8FAFC"/>
  <rect x="40" y="30" width="520" height="320" rx="12" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  <text x="60" y="55" font-family="system-ui" font-size="14" font-weight="700" fill="#64748B">Web/A Document (.html)</text>

  <!-- Viewer Layer -->
  <rect x="60" y="70" width="480" height="60" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="75" y="95" font-family="system-ui" font-size="13" font-weight="700" fill="#475569">Presentation Layer (Wrapper)</text>
  <text x="75" y="115" font-family="system-ui" font-size="11" fill="#64748B">CSS, Fonts, etc. (Evolutionary Maintenance: replaceable for future browsers)</text>

  <!-- Payload Layer -->
  <rect x="60" y="150" width="480" height="180" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="175" font-family="system-ui" font-size="13" font-weight="700" fill="#4338CA">Signed Payload (Immutable Fact)</text>

  <rect x="80" y="190" width="200" height="80" rx="4" fill="white" stroke="#6366F1"/>
  <text x="90" y="210" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">Human Readable (HTML)</text>
  <text x="90" y="230" font-family="system-ui" font-size="11" fill="#64748B">Semantic HTML</text>
  <text x="90" y="245" font-family="system-ui" font-size="11" fill="#64748B">Accessibility Standards</text>

  <rect x="320" y="190" width="200" height="80" rx="4" fill="white" stroke="#6366F1"/>
  <text x="330" y="210" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">Machine Readable (JSON-LD)</text>
  <text x="330" y="230" font-family="system-ui" font-size="11" fill="#64748B">Structured Data / Properties</text>
  <text x="330" y="245" font-family="system-ui" font-size="11" fill="#64748B">VC / C2PA Manifest</text>

  <!-- HMP Connection -->
  <path d="M280 230H320" stroke="#6366F1" stroke-width="2" stroke-dasharray="2 2"/>
  <text x="300" y="285" font-family="system-ui" font-size="11" font-weight="700" fill="#6366F1" text-anchor="middle">HMP (Human-Machine Parity)</text>

  <!-- Hybrid Signature -->
  <rect x="80" y="295" width="440" height="25" rx="4" fill="#6366F1" fill-opacity="0.1"/>
  <text x="300" y="312" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA" text-anchor="middle">Hybrid Signature: Ed25519 + ML-DSA-44 (Post-Quantum)</text>
</svg>
</div>

#### 6.3.1. Micro-Mapping for Auditability
To enhance third-party verifiability, Web/A encourages the use of semantic attributes (e.g., `data-weba-field`) within the HTML to explicitly map display elements to JSON-LD properties.
- **Example**: `<span data-weba-field="datePublished">2025-12-24</span>`
This transparent mapping allows auditors and scripts to confirm that visualized data matches the machine-readable layer within the signed payload.



### 6.3. Trust Anchor (DID Resolution)
Verifiers resolve the issuer's identity via the Decentralized Identifier (**DID**) included in the JSON-LD. This leverages the existing "Web Chain of Trust" rooted in DNS and WebTrust-certified TLS certificates, providing a more agile and resilient trust model that is not tied to the rigid policies of specific certificate authorities (CAs).

### 6.4. Proof of Existence: Time Stamping Authority (TSA)
A signature from the issuer proves *who* issued the document, but it doesn't objectively prove *when* it was issued relative to the rest of the world.
- **RFC 3161 Compliance**: Web/A encourages including a time-stamp token from a trusted Time Stamping Authority (TSA) within the provenance manifest.
- **Long-Term Validation (LTV)**: By tying the document to a public TSA, verifiers can confirm that the signature was valid at the time of issuance, even if the issuer's signing key is later revoked or the algorithm becomes weak.

## 7. Implementation Flexibility: The "Lightweight Trust" Model
A major barrier to archival signing is the complexity of key management. Web/A does not negate the use of high-assurance methods like HSMs; rather, it complements them with a "Lightweight Trust" model designed to lower the entry barrier and encourage widespread adoption.

The true value of this model lies in its ability to **issue safely signed documents on existing Web Application foundations** without requiring dedicated key management infrastructure. This is essential for the diversity of issuers and the "small start" necessary for Global VC adoption.

This model is particularly effective for the transition to **Post-Quantum Cryptography (PQC)**. Instead of waiting for existing PKI or HSM infrastructures to become PQC-ready, the Lightweight Trust model allows for the **"Early and Safe Adoption" of PQC signatures**. By rooting trust in current hardware-backed Passkeys and dynamically generating PQC signatures during the build process, issuers can begin protecting archival records against future quantum threats today.

### 7.1. Tiered Authority: Passkey-to-Build Delegation
Rather than requiring permanent HSMs for every build, Web/A leverages **Delegated Identity**:
1.  **Root of Trust (Offline/Hardware)**: The publisher uses a **Passkey (WebAuthn)** on a developer's device (e.g., iPhone, Android, or Yubikey). This key remains in the device's Secure Enclave.
2.  **Delegate Certificate**: For a specific publishing window (e.g., 7 days), the Root Key signs an **Ephemeral Build Key** used by the CI/CD pipeline (GitHub Actions, etc.).
3.  **Implicit Authorization**: The document signature is tied to the build key, which in turn is authorized by the publisher's Passkey.

### 7.2. Ephemeral Issuance
To minimize the impact of key compromise:
- Every build generates a **fresh pair of signing keys**.
- These keys only exist in the memory of the build runner.
- The **Build ID** and public fingerprints are recorded in a **Public Transparency Log** (or a simple JSON history file on the site).

### 7.3. Identity via Transparency (DID-lite)
Instead of expensive PKI certificates, Web/A uses **Transparency over Authority**:
- **Fingerprint Publication**: By publishing the fingerprints of all valid build keys, the publisher provides verifiers with a "Known Good" list, reducing the trust requirement for any single ephemeral key.

### 7.4. Cryptographic Agility: Adapting to Algorithm Evolution
Web/A is built on the principle of **Cryptographic Agility**, ensuring that the document format is not tied to any single cryptographic primitive. This provides a clear path forward against future threats, such as the emergence of quantum computing.

1. **Dynamic Root of Trust and Continuity**: 
Most currently used Passkey (FIDO2) devices rely on classical cryptography like ECDSA (P-256). Web/A’s delegated identity model allows these existing devices to act as the initial Root of Trust while dynamically attaching PQC signatures during the build process. These are cryptographically linked within the publisher's DID document. 
When PQC-native Passkey devices become available, issuers can add their new PQC root keys to the DID document without losing their established identity. This maintains continuity between legacy and future documents while seamlessly upgrading the system's security level.

2. **Safety-First Migration via Hybrid Signatures**:
Web/A mandates hybrid signatures using both classical (Ed25519) and Post-Quantum (ML-DSA-44) algorithms. This ensures backward compatibility with legacy verifiers while "enforcing security-ahead-of-time" for the quantum era. Compared to legacy certificate models that rely on a single algorithm, this approach provides a redundant safety net and enables faster algorithm rotation when vulnerabilities are discovered.

3. **Freedom from Rigid Certificate Architectures**:
Traditional systems that embed X.509 certificates in PDFs are often bottlenecked by rigid ASN.1 structures and Certificate Authority (CA) policies. Because Web/A is built on JSON-LD and DID, new signature schemes (e.g., hash-based signatures) or cutting-edge verification logic can be introduced additively without breaking the underlying data structure or requiring a full forklift upgrade of the trust infrastructure.

---

## 8. Advanced Typography and Form Representation
Web/A must bridge the gap between "faithful reproduction of structured forms" (where PDF/A excels) and "data fluidity" (where the Web excels).

### 8.1. Character Coverage: Handling Administrative Standards and Rare Glyphs
For governmental use cases in regions like Japan, supporting extensive character sets (e.g., Administrative Standard Characters) and "Gaiji" (user-defined characters) is critical. Web/A achieves this via:
- **WebFont Subsetting**: Embedding only the required glyphs, including IVS (Ideographic Variation Sequences), directly into the file.
- **SVG Inlining**: For one-off rare characters or unique symbols that are difficult to fontify, path data is inlined directly as SVG within the HTML.
This ensures 100% visual consistency regardless of the client-side environment.

### 8.2. Challenges in Faithful Form Reproduction
Traditional official documents are often based on "Fixed-size, Ruled-paper" layouts (e.g., A4). While CSS is powerful, recreating pixel-perfect forms for the web presents several challenges:
- **Rendering Engine Variance**: Nuances in how different browsers handle layout logic can make millimeter-precise positioning difficult.
- **Accessibility vs. Layout**: Balancing fixed-frame layouts with accessibility features like text resizing and screen readers requires sophisticated CSS design.

### 8.3. Bimodal Presentation for the Mobile Era
With the dominance of smartphones, documents require **Bimodal Presentation**:
1.  **Archive View (Fixed)**: A traditional form-based layout used for printing and official verification—the "Formal Face" of the document.
2.  **Wallet View (Adaptive)**: A responsive, mobile-optimized card view for quick reference on small screens—the "Practical Face" of the document.
Web/A's Presentation layer allows switching between these two views using CSS from a single signed payload, maximizing the mobile experience while maintaining archival integrity.

---

## 9. Implementation in Sorane (srn)
The Sorane project implements Web/A-1p by default:
1.  **Provencance Manifest**: Automatically injected in the JSON-LD.
2.  **In-Font Signatures**: Injecting `SRNC` tables into subsetted fonts.
3.  **Hybrid Signing**: Dual Ed25519 + ML-DSA-44 signatures.

---

## 10. Comparison Table

| Feature | PDF/A | XML + XSLT | **Web/A** |
| :--- | :--- | :--- | :--- |
| **Human Readable** | Excellent | Conditional (Bit Rot) | Excellent |
| **Machine Readable** | Poor (Visual Silo) | Excellent | Excellent |
| **Self-Contained** | Yes | No | Yes |
| **Accessibility** | Limited | High (if processed) | Native |
| **Maintenance** | Re-imaging | Re-coding | **Re-wrapping (LTV)** |

---

## 11. Phased Adoption Strategy: A Layered Approach
Demanding full Verifiable Credential (VC) specifications, such as Holder Binding, for every document from the start can increase implementation complexity and hinder adoption. Web/A encourages a phased approach based on technical maturity and specific use cases.

### Layer 1: Publicly Available Documents (Current Sorane Scope)
Targeting documents for the general public, such as official gazettes, statistical data, and whitepapers.
*   **Technical Requirements**: Authenticity (Signature) and Long-term Readability.
*   **Characteristics**: Low risk of replay attacks; the value lies in the transparent availability of the information.

### Layer 2: Documents with Personal Privacy Information
Targeting notifications, receipts, and private reports issued to specific individuals or organizations.
*   **Technical Requirements**: Layer 1 requirements + appropriate access control and confidentiality.
*   **Characteristics**: Privacy protection is paramount, but strict identity verification at the point of presentation may not always be required.

### Layer 3: Identity & Authorization Documents
Targeting documents that prove identity or authority during secondary circulation, such as resident records (Juminhyo), powers of attorney, employee IDs, and professional certifications.

*   **Technical Requirements**: **Holder Binding**. A cryptographic link between the document and the presenter's identity (e.g., a private key in a secure enclave).
*   **Response to MIC (Japan) Policy Requirements**: 
    The [Intermediate Report (June 2025) of the Working Group on the Ideal State of Resident Basic Ledger Administration through the Utilization of Digital Technology](https://www.soumu.go.jp/main_content/001018670.pdf) by the Japanese Ministry of Internal Affairs and Communications (MIC) mandates several high-level requirements for VCs as identity documents. Web/A addresses these through native Web standards:
    1.  **Originality & Integrity**: Cryptographic protection against falsification of both visual (HTML) and data (JSON-LD) layers.
    2.  **Prevention of Personation (Holder Binding)**: Web/A implements **Verifiable Presentation (VP)** logic within its Presentation layer. By invoking the user's hardware-backed keys (e.g., Passkeys) at the moment of presentation, it generates a "presentation-time signature" to prove rightful possession without requiring a dedicated wallet app.
    3.  **Anti-Copying/Anti-Replay**: Unlike a static image or PDF, a Web/A document is a "live" verifiable asset. Verifiers can trigger the on-document verification UI to confirm authenticity and freshness in real-time.
    4.  **Selective Disclosure**: To address the privacy concerns mentioned in the MIC report, Web/A supports SD-JWT/SD-COSE, allowing a user to disclose only specific fields (e.g., "Address and Name") while keeping the rest of the resident record data confidential.
*   **Characteristics**: Establishes a "Browser-based Chain of Trust" for cross-sector (public/private) document reuse without specialized verification infrastructure.

---

## 12. Technical Challenges and the Path to Standardization
Realizing the full potential of Web/A requires addressing several technical hurdles and establishing cross-industry standards.

### 12.1. Cross-Device and In-Person Transfer Protocols
Moving a Web/A document from a browser to a mobile wallet or another person's device in an offline or face-to-face setting remains a challenge.
- **Challenge**: Seamless interaction with NFC, BLE, or QR-based transfer protocols directly from within the browser sandbox.
- **Outlook**: Native browser integration with standards such as ISO/IEC 18013-5 (mDL) and OpenID for Verifiable Presentations (OID4VP).

### 12.2. Practical Holder Binding: Sandbox Limitations and Reality
For Layer 3 documents, "Prevention of Personation" requires a cryptographic link between the document and the presenter's identity.

- **Sandbox Constraints**: Web browsers operate in a restricted sandbox, preventing direct access to OS-level secure keys. While WebAuthn (Passkeys) can prove "possession of a specific device", linking that device to a "specific legal person" requires an initial registration step using existing high-assurance IDs (e.g., National ID cards).
- **A Pragmatic "Chain of Possession"**: 
    1.  **Identity Onboarding**: Linking the document to a user's device-bound Passkey by authenticating with a high-assurance ID (e.g., JPKI/My Number card) at the time of issuance.
    2.  **VP Generation**: At the time of presentation, the browser invokes the local Passkey to generate a **Verifiable Presentation (VP)**.
    This combination of a signed Web/A document and a "fresh" presentation-time signature satisfies the requirement for an identity document.
- **Outlook**: Future standardization of browser-native APIs for smartphone-stored digital IDs will allow for "National ID-level Holder Binding" directly within the browser, eliminating the need for bridge apps or external wallets for verification.

### 12.3. Native Browser Support for Verification
For Web/A to be truly trusted, browsers must recognize it as more than just "another web page."
- **Outlook**: Standardization of browser UI elements that display the document's signature status, issuer identity, and Human-Machine Parity (HMP) verification directly in the chrome/address bar.

### 12.4. Standardizing Trust Transition (LTV)
Ensuring that "Signature Refreshes" and algorithm updates over 50+ years are recorded in a way that remains globally verifiable.
- **Outlook**: Creating interoperable protocols for "Audit Logs" of trust transitions that can be understood by different archival institutions and verifiers worldwide.

### 12.5. Legal Positioning: From "Will" to "Evidence"
Web/A does not necessarily aim to fall under the rigid category of "Electronic Signatures" defined by specific national acts that primarily focus on the **manifestation of will** (e.g., contracts, formal seals).
- **Enhancing Probative Value**: Instead of seeking absolute legal presumption, Web/A focuses on providing objective, cryptographic, and technical evidence of a document's **authentic establishment** (integrity and origin).
- **Pragmatic Distance from PKI**: By focusing on the "evidence of fact" rather than high-stakes "intent", Web/A provides significant social and business value—even without relying on high-cost, state-regulated PKI infrastructure—simply by making documents verifiable.

### 12.6. Ecosystem Strategy: AI Agent-First
To jumpstart the developer ecosystem, Web/A prioritizes tools that AI agents and developers can use immediately, rather than waiting for full-featured mobile wallets.
- **Headless Wallets (CLI / MCP)**: Developing command-line tools and MCP (Model Context Protocol) servers that allow AI agents like Gemini-CLI or Claude Code to autonomously read, request, issue, and verify Web/A documents.
- **Programmable Trust**: When an AI agent processes a Web/A document, it should be able to instantly verify its provenance via API and calculate a trust score. This creates an automated chain of trust between AI agents long before human-facing UIs reach critical mass.

### 12.7. Defining Conservation Profiles (Safe Subset of Web Tech)
Since web standards evolve rapidly, some features (like XSLT) may face deprecation.
- **Challenge**: Reaching a consensus on which subset of HTML/CSS is "Safe for Archival" (i.e., guaranteed to work in browser engines 50+ years from now).
- **Outlook**: Establishing a "Web/A Basic Profile" restricted to evergreen features (HTML5 Core and stable CSS). Implementation of validation tools that scan Web/A documents for long-term compatibility and provide an "Archivability Score."

---

## 13. Alignment with International Standardization
Web/A is intended not as a novel technology isolated from the rest of the world, but as a profile that integrates and optimizes existing international standards for the purpose of archival and verifiability. This work aligns with and contributes to several key standard communities.

### 13.1. W3C Verifiable Credentials (VC)
Web/A acts as a **Document-centric Profile** for the W3C VC 2.0 specification. By defining an implementation model that inseparably binds metadata (JSON-LD) with presentation (HTML) in a way accessible via any standard browser, Web/A provides a practical path for the widespread adoption of digital credentials in document formats.

### 13.2. IETF SPICE and COSE
The application of binary-formatted credentials and selective disclosure (SD-COSE) to HTML documents serves as a pragmatic implementation case for discussions within the IETF SPICE WG. Furthermore, the "Lightweight Trust" model for deploying PQC (Post-Quantum Cryptography) signatures on existing infrastructure offers valuable insights for secure, future-proof infrastructure transition.

### 13.3. C2PA (Provenance)
Extending the C2PA provenance specification beyond images and video to HTML-based text documents ensures the authenticity of the entire generation process, including assets like subsetted fonts. Web/A proposes a profile that deepens the applicability of C2PA in the domain of structured text.

---

## 14. Final Thoughts
Web/A is a proposal to bridge the gaps between existing Web technologies and the Verifiable Credentials ecosystem, specifically regarding long-term archival and human-machine consistency. 

Rather than being a definitive solution, this memorandum aims to organize the necessary values and identify the missing technical pieces required for the next generation of e-government and digital heritage management. We position this work as a foundational discussion piece for building a truly sustainable and verifiable knowledge management infrastructure.
