---
title: "Web/A Long-Term Validation (LTV) Architecture"
layout: article
description: "Designing a mechanism for long-term verifiable signatures and offline validation for Web/A, inspired by PAdES."
ai_generated: true
---

# Web/A Long-Term Validation (LTV) Architecture

**Status**: Draft Proposal
**Date**: 2026-01-01
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

### 3.1. The "Onion" Model for Web/A

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

### 3.2. Solving the Rebuild Paradox: "Layered Signatures"

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

**Workflow:**
*   **Content Change**: Trigger re-signing of Payload layer. Update Timestamp.
*   **Template Change**: Rebuild HTML. **Retain Payload Signature.** Re-sign Container Signature.

This separation ensures that a maintenance update to the website's CSS does not invalidate the 10-year-old signatures of archived documents.

## 4. Implementation Strategy

### Phase 1: Offline Verification Foundation (Completed 2026-01-01)
*   ✅ **Context Freezing**: Confirmed usage of **JCS (RFC 8785)** in `src/core/vc.ts`. This canonicalization scheme does not require fetching external `@context` definitions, effectively solving "Context Rot" by design.
*   ✅ **Trust Anchor Embedding**: Implemented in `src/ssg/LayoutManager.ts`. The Issuer's DID Document is now embedded in the generated HTML via a `<script type="application/vnd.weba+trust-store">` tag.
*   **Next Action**: Update the Verifier logic to read from this embedded Trust Store.

### Phase 2: Stable Signatures (Fixing Rebuilds)
*   **Action**: Modify the SSG build pipeline. Differentiate between "Content Update" and "System Update".
*   **Impl**: Check if `content_hash` has changed. If not, reuse the existing signature from previous build/metadata.
*   **Goal**: Preserve the original "Signed At" timestamp across system updates.

### Phase 3: The Trust Store (LTV)
*   **Action**: Define `Web/A-LT` spec.
*   **Impl**: When signing, fetch the current CRL/OCSP implementation (or Mock for local/self-signed). Embed this data into the Web/A file structure alongside the signature.
*   **Goal**: Fully self-contained verification (LTV).

## 5. Conclusion

By implementing Web/A-LTA, SRN transitions from a "Website Generator" to a "Digital Archivist." It ensures that the **Signed Resources** it produces are not just web pages, but durable, legally defensible, and historically preserved digital artifacts.
