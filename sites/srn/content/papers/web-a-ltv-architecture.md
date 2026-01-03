---
title: "Web/A Long-Term Validation (LTV) Architecture"
layout: article
description: "Designing a mechanism for long-term verifiable signatures and offline validation for Web/A, inspired by PAdES."
ai_generated: true
---

# Web/A Long-Term Validation (LTV) Architecture

**Status**: Draft Proposal
**Date**: 2026-01-03
**Author**: Antigravity (AI Assistant)

## 1. Introduction: The Need for "Digital Scrolls"

In the "Document Economy," digital assets must survive beyond the lifespan of the systems that created them. Just as a physical scroll can be read and verified centuries later without contacting the original scribe, Web/A documents must achieve **Self-Contained Verification**.

Current JSON-LD verification models (JWS/COSE) often rely on live endpoints (DID resolution, Context fetching, CRL checking). If these services go offline, the document becomes unverifiable ("Digital Rot"). Furthermore, the current SSG build process regenerates signatures on every build, destroying the proof of the document's original creation time.

This document proposes **Web/A LTV**, an architecture to bring PAdES-level long-term preservation capabilities to the HTML-based Web/A format.

## 2. The Current Problem: "The Rebuild Paradox"

SRN currently treats signatures as a "deploy-time artifact" rather than a "content-time artifact."

*   **Scenario**: You fix a typo in the site footer template.
*   **Result**: Every blog post is rebuilt. The hash changes. The signature is regenerated with the *current* timestamp.
*   **Loss**: The proof that "Blog Post A existed 3 years ago" is lost. It now looks like it was created today. This is acceptable for a website, but fatal for a **Signed Resource**.

### Requirements for LTV
1.  **Immutability of Signed Content**: The payload (Body + Data) must not change even if the container (HTML Wrapper) is updated, unless the content itself is edited.
2.  **Offline Verification**: All data required to verify the signature (Certs, Revocation Lists, Contexts) must be embedded in the file.
3.  **Timestamping**: Proof of existence at a specific time, separate from the signing key's validity period.

## 3. Architecture Proposal

### 3.1. Anatomy of a Web/A Container

The Web/A Container is an HTML5 document that functions as a secure envelope for data. It embeds multiple layers of signatures and validation data to ensure long-term trust.

![Web/A Container Architecture](/images/web-a-container-architecture.svg)

*   **Layer 4 (Presentation)**: The outer HTML/CSS shell. It includes a **Container Signature** that secures the visual representation against tampering.
*   **Layer 3 (Context)**: The **Prunable Hash Chain (PHC)** manages the document's history (e.g., transfers, updates) without invalidating the original data.
*   **Layer 2 (Payload)**: The core **Verifiable Credential (VC)**. This is the immutable fact, signed once at creation.
*   **Trust Store**: An embedded JSON block (`didDocuments`, `revocationList`) enabling offline verification.
*   **ManifestManager**: Manages heavy assets (Fonts, WASM) as Gzipped/Base64 blobs, referenced by hash.

### 3.2. The "Onion" Model for Web/A

We adopt the PAdES evolution model (B-T-LT-LTA) for Web/A.

#### Level 1: Web/A-B (Basic) - Current State
*   **Structure**: `Signature( Hash(Content) )`
*   **Validation**: Requires online access to DID resolver and Contexts.
*   **Issue**: Vulnerable to "Context Rot" and key expiration.

#### Level 2: Web/A-T (Timestamp)
*   **Structure**: `Timestamp_Token( Signature )`
*   **Mechanism**: A trusted TSA (Time Stamping Authority) signs the signature.
*   **Benefit**: Proves the document existed at time $T$. Signature validation is anchored to time $T$, protecting against subsequent key compromise.

#### Level 3: Web/A-LT (Long Term - Validation Data)
*   **Structure**: `Container { Content, Signature, Timestamp, [CRLs, OCSP, Certificates, Context Definitions] }`
*   **Mechanism**: embed a **"Trust Store"** within the Web/A HTML (e.g., as a CBOR object in a `<script type="application/vnd.weba+trust-store">` tag).
*   **Benefit**: **Offline Verification**. Even if the Issuer's server vanishes, the embedded CRL proves the key was valid *at the time of signing*.

#### Level 4: Web/A-LTA (Archive)
*   **Structure**: `Timestamp_Token_V2( Content + Signature + Trust_Store + Timestamp_V1 )`
*   **Mechanism**: Periodically (e.g., every 10 years before algorithm compromise), wrap the entire package in a new, stronger timestamp.
*   **Benefit**: Indefinite longevity.

### 3.3. Solving the Rebuild Paradox: "Layered Signatures"

Web/A separates the trust model for "Data" vs. "Presentation" to allow independent lifecycles.

#### A. Payload Signature (Content-Time / L1+L2)
*   **Target**: The semantic core (JSON-LD Data + Template Definition).
*   **Lifecycle**: Created once when the fact is established. Immutable.
*   **Trust**: Endures even if the HTML container is completely rewritten. Validates "What happened and When."
*   **LTV**: This layer carries the long-term Validation Data (CRLs, etc.).

#### B. Context Signature (Chain of Custody / L3)
*   **Target**: The Payload Signature + Context Metadata (LTV data, Transport Tags, Policy).
*   **Lifecycle**: Cumulative. Added whenever the document's state changes (e.g., Timestamping, Archiving, Transferring).
*   **Structure**: **Onion Model**. The new custodian signs the previous state `Sig_new( Sig_old + New_Context )`. This preserves the history of who managed the document and when, without altering the original fact.
*   **Trust**: Validates the "Current Status" and "Chain of Custody."

#### C. Container Signature (Deploy-Time / L4)
*   **Target**: The visual presentation (HTML structure, CSS, Fonts, Scripts) + The Latest Context Signature.
*   **Lifecycle**: Ephemeral. Regenerated upon every rebuild/deployment.
*   **Trust**: Validates "The current view is authorized by the issuer." It protects against UI tampering (e.g., swapping a "Valid" icon for an "Invalid" one) without altering the underlying data.

### 3.4. Comparison with Existing Standards (Pros/Cons)

| Feature | PAdES (PDF) / XAdES (XML) | Web/A LTV (HTML) |
| :--- | :--- | :--- |
| **Container Format** | PDF (Binary) or XML | HTML5 (Text/DOM) |
| **Human Readability** | Low (requires PDF Reader) | **High** (Viewable in any browser) |
| **Visual Validation** | WYSIWYG (Fixed Layout) | **Responsive** (Reflows for Mobile/Desktop) |
| **Data Extraction** | Difficult (Unstructured) | **Native** (JSON-LD / Semantic HTML) |
| **LTV Support** | Mature (DSS, TSA standard) | **Emerging** (Uses DID/VC + Custom Trust Store) |
| **File Size** | Large (Embeds Fonts/Images inefficiently) | **Optimized** (Pack & Prune, Shared Blobs) |
| **Complexity** | High (ASN.1, CMS) | Moderate (JSON, JWS, simple Hash Chain) |

## 4. Implementation Specifications (v1.0 Status)

### 4.1. Pruning Strategy (Implemented)
To prevent the PHC (Layer 3) from growing indefinitely, the system implements an **Automatic Pruning** policy:
*   **Rule**: Keep **Genesis** (Index 0) + **Latest 5 Events**.
*   **Mechanism**: Intermediate events (e.g., repeated "L4Rebuild" events) have their payloads stripped, leaving only the hash to maintain chain integrity. This ensures the file size remains stable over decades of maintenance.

### 4.2. Trust Store Schema (Implemented)
The `weba-trust-store` script block has been extended to support the full LTV requirement:
```json
{
  "didDocuments": [ ... ],
  "revocationList": [ ... ], // For CRLs/OCSP responses
  "trustedTimestamps": [ ... ] // For TSA tokens
}
```

### 4.3. Next Steps
*   **Phase 3**: Integration with a TSA (Time Stamping Authority) to populate `trustedTimestamps`.
*   **Verifier Update**: Enhance the client-side verifier to visualize the Pruning Chain and validate the Trust Store.

## 5. Conclusion

By implementing Web/A-LTA, SRN transitions from a "Website Generator" to a "Digital Archivist." It ensures that the **Signed Resources** it produces are not just web pages, but durable, legally defensible, and historically preserved digital artifacts.