---
title: "Sorane (空音) Release Notes"
layout: article
description: "Release history and major updates for the Sorane project."
ai_generated: true
---

## v2.2.0 - Secure Folio & Guest DID Integration

**Date:** 2025-12-30

Major security and UX enhancements to Folio, introducing production-ready Strict Mode, Guest DID-based account requests, and regional deployment optimization.

* **Secure by Default**:
  * **Strict Mode Enforcement**: Enabled mandatory access control for `postMessage`. Only DIDs in `ADMIN_DIDS` or `allowed-users` collection can post messages.
  * **Admin Controls**: Verified `folio admin add-user` workflow for explicit user onboarding.
  * **Regional Deployment**: Migrated all Firebase Functions to `asia-northeast1` (Tokyo) for reduced latency and improved security posture.
  * **Function Consolidation**: Merged `getPreKey` from legacy tools into main remote deployment for unified management.

* **Guest DID Messaging**:
  * **`guestPostMessage` Mutation**: New GraphQL mutation accepting Passkey (WebAuthn) authentication instead of Ed25519 signatures.
  * **Browser Integration**: Implemented `sendGuestMessage()` in `src/form/client/guest_did.ts` for encrypted L2 messaging from browsers.
  * **Account Request Workflow**: Created `join.md` form enabling self-service account requests using Guest DIDs.
  * **Spam Resistance**: Passkey-based identity creation prevents automated bot submissions.

* **CLI Enhancements**:
  * **`did:key` Support**: Fixed `folio transport send` to handle `did:key` resolution (implicit mode with local DID document construction).
  * **Signature Format Fix**: Corrected authentication signature encoding (Hex vs Base64Url) to match remote expectations.
  * **`--key-file` Option**: Added to `folio sync` command for consistent key management across all commands.
  * **End-to-End Verification**: Tested complete workflow: `admin add-user` → `transport send` → `sync`.

* **Web/A Form Integration**:
  * **Interactive Forms**: Created example forms (`party.md`, `join.md`) demonstrating Guest DID submission.
  * **Onboarding Flow**: Users can now request access via web form → Admin approves via CLI → User gains full messaging rights.
  * **Dual Identity Support**: Forms support both Guest DID (Passkey) and permanent DID (CLI-generated) submissions.

* **Documentation**:
  * **Roadmap Updates**: Marked Phase 1 & 2 as completed in both `.agent/tasks/folio_roadmap.md` and `ROADMAP.md`.
  * **Session Summary**: Created comprehensive deployment log in `.agent/sessions/2025-12-30-folio-deployment.md`.
  * **Technical Debt**: Documented Phase 2.5 items (browser `did:key` resolution, L2 signature standardization).

## v2.1.0 - Folio Sync Protocol with DID Authentication


**Date:** 2025-12-30

Major implementation of the Folio Sync Protocol, enabling secure, portable synchronization of Web/A messages using GraphQL and DID-based authentication. Introduces the "shared server model" as an alternative to SMTP.

* **Folio Sync Protocol**:
  * Implemented GraphQL-based synchronization API (`inbox`, `outbox`, `threads` queries).
  * Added challenge-response DID authentication using Ed25519 signatures.
  * Created `postMessage` mutation with `hostDid` invariant validation.
  * Implemented message acknowledgment and deletion workflow.

* **Shared Server Model**:
  * Documented SMTP alternative where either sender or recipient can host.
  * Added invariant: `hostDid` must equal `senderDid` OR `recipientDid`.
  * Enabled three hosting patterns: recipient-hosted, sender-hosted, third-party broker.
  * Updated L2E specification with shared server model details.

* **Firebase Functions Backend**:
  * Deployed Apollo Server for GraphQL API.
  * Integrated Firestore for message persistence.
  * Implemented Node.js crypto fallback for Ed25519 verification.
  * Added Firebase emulator configuration for local development.

* **Folio CLI Extensions**:
  * Added `folio sync` command with DID authentication.
  * Implemented `folio transport resolve` for DID document resolution.
  * Created `folio transport show-thread` for message thread visualization.
  * Added `--mode` option for inbox/outbox/full synchronization.
  * Completed full-mode sync: fetch both inbox and outbox messages.
  * Added `sync_source` metadata field to distinguish message direction.

* **Guest DID with Passkey Authentication**:
  * Implemented `createGuestDid` mutation in Firebase Functions.
  * Created browser-side Passkey integration for seamless UX.
  * Guest DIDs expire after 30 days (configurable).
  * Single checkbox UX: "Receive replies" - no extra dialogs.
  * Automatic fallback to anonymous submission (form DID) if Passkey fails.
  * Store credential ID and public key JWK in Firestore.
  * Documented Guest DID specification in L2E whitepaper.

* **Infrastructure**:
  * Created `remote/` directory structure for Firebase deployment.
  * Added WASM bindings to Firebase Functions for crypto operations.
  * Implemented thread tree building and printing utilities.
  * Added Firestore rules and indexes configuration.

## v2.0.1 - Web/A Messaging Extension Notes

**Date:** 2025-12-29

Documentation updates covering transport concepts for Web/A submissions and
Folio inbox flows.

* **Documentation**:
  * Added Messaging/Transport extension principles to the Web/A whitepaper.
  * Clarified transport-agnostic messaging goals in the Folio concept paper.
  * Documented Firebase-first deployment guidance in the Folio CLI design doc.
  * Expanded transport principles to cover multi-hop routing and brokering.
  * Added a Firebase direct MCP test checklist to the Folio CLI design doc.

## v2.0.1 - Reply Metadata & Routing Rules

**Date:** 2025-12-30

Clarified reply handling for L2-encrypted submissions, including DID resolution,
broker forwarding rules, and Folio storage placement.

* **L2 Encryption Spec**:
  * Defined minimal `reply_to` fields (`did`, `endpoint`, optional `broker`).
  * Added deterministic DID resolution and service endpoint selection rules.
  * Standardized reply signing + L2E encryption order for responses.
  * Documented broker forwarding constraints and `forwarded_by` tracking.
  * Specified Folio `history/` metadata storage for reply threading.

## v2.0.1 - Reply Metadata & Folio Threading

**Date:** 2025-12-30

Specification update clarifying reply metadata, authentication, and Folio
thread storage for Web/A Form submissions.

* **Web/A Form**:
  * Defined `reply_to` metadata (DID, endpoint, broker ID) for responses.
  * Clarified fallback handling for unknown reply routes and one-way cases.
  * Documented reply authentication flow and L2E re-encryption requirements.
  * Added reply scope policy (channel, expiration, delegation).
  * Specified Folio storage fields (`message_id`, `thread_id`, `reply_status`).
  * Described UX requirements for reply failures.

## v2.0.0 - Graduated Forward Secrecy & Firebase Support

**Date:** 2025-12-29

A major security milestone introducing adaptive Forward Secrecy, mandatory replay protection, and production-ready cloud integration via Firebase.

* **Security (Graduated Forward Secrecy)**:
  * **3-Tier Adaptive Security**: Implemented a "Graduated PFS" model that automatically selects the best available encryption tier based on connectivity:
    * **Tier 3 (True PFS)**: One-time ephemeral keys via dynamic backends.
    * **Tier 2 (Epoch-based)**: Daily rotating keys via static JSON registries.
    * **Tier 1 (Static)**: Fallback to long-term master keys for offline availability.
  * **Adaptive UI**: Added a "Security Signal Strength" badge to the form UI (🟢 High, 🟡 Standard, 🟠 Basic) to inform users of the active protection level.
* **Audit & Compliance**:
  * **Mandatory Replay Checks**: Hardened the L2 API to enforce nonce uniqueness by default, addressing a critical audit finding.
  * **Architecture Whitepapers**: Published detailed analysis on SEFS (Static-Epoch Forward Secrecy) and Graduated PFS to justify security trade-offs to auditors.
  * **Audit Index**: Integrated a full history of security re-assessments (v1–v5) and remediation reports.
* **Cloud & Operations**:
  * **Firebase Integration**: Established a full Firebase Support deployment path, consolidating static hosting and PFS backends under a single security boundary.
  * **Multi-Cloud Backends**: Released a "Pre-key Vending Machine" implementation for both Cloudflare Workers (D1) and Firebase (Functions/Firestore).
  * **Ops Automation**: Added a GitHub Actions workflow to monitor key registry inventory and alert administrators 30 days before expiry.
  * **Deployment Guide**: Published a comprehensive [Deployment & Operations Guide](./papers/deployment-guide.html).
* **UX & UI**:
  * **Presentation Mode**: Added touch navigation support (swipe and tap zones) for better usability on tablets and mobile devices.
  * **Style Refinement**: Added consistent security badge styling and improved toolbar layout.

## v1.9.0 - WASM Crypto & Security Reports

**Date:** 2025-12-29

Updates focused on the Web/A Layer 2 encryption security posture, documentation, and build/runtime polish.

* **Cryptography (WASM Migration)**:
  * Migrated core signing and encryption primitives (Ed25519, X25519, ML-KEM-768) to Rust/WASM bindings.
  * Added WASM test coverage for cryptographic flows.
* **Security Documentation**:
  * Published the Security Audit v2 report and the post-remediation Re-Assessment v3.
  * Added the Security Audit Remediation Report and cross-linked related papers.
  * Released the L2 Encryption competitive analysis paper.
* **SSG & Rendering**:
  * Embedded Mermaid renderer via a local data URI to avoid CDN dependencies.
  * Improved incremental rebuild safety when templates change.
  * Added consistent build stamps and favicon data URIs across generated outputs.
* **Form Drafts**:
  * Draft downloads now embed a structured draft state, allowing safe restoration across devices or after cache clears.
* **Web/A Whitepaper**:
  * Added security report references and related paper links to improve audit traceability.

## v1.8.0 - Web/A L2 Encryption & PQC Default

**Date:** 2025-12-28

Major updates including the new Layer 2 Encryption specification, Post-Quantum Cryptography (PQC) integration, and enhancements to the Form Maker.

* **Web/A L2 Encryption**:
  * **PQC by Default**: PQC (ML-KEM-768) is now enabled by default for all encrypted forms. This "Hybrid (X25519 + ML-KEM-768)" approach ensures quantum resilience without requiring user configuration.
  * **Passkey Integration**: Seamless end-to-end encryption flow using Personal Mode (Passkey-derived keys).
  * **New Specification**: Published [Web/A L2 Encryption](./papers/web-a-l2-encryption.html) discussion paper.
  * **Escrow Mode**: Added Shared Key mode for immediate browser-based capability testing.
  * **Tooling**: Added `emit-frontmatter` command and CSV export utilities for encrypted datasets.
* **Web/A Form Maker**:
  * **Aggregator View**: Added preview mode for "Aggregator" dashboard visualization.
  * **Dual Mode Editor**: Enhanced editor with toggleable preview/edit modes.
  * **CSV Export**: Implemented CSV flattening and download for form responses.
* **Design & Core**:
  * **Top Page**: Refined dashboard layout and typography. Added "AI-First Workflows" to Core Philosophy.
  * **Blog**: Fixed font subsetting for blog list views (titles/excerpts).
  * **Search**: Improved suggestion UI.

## v1.7.0 - Form Tooling & Documentation

**Date:** 2025-12-27

Incremental improvements to local form tooling, layout binding, and documentation.

* **Core & Layout**:
  * **Template/Instance Split**: Added dedicated template and instance VCs with content digests for clear separation of "Form" and "Response".
  * **JSON-LD Binding**: Added explicit `data-weba-field` bindings for structured data extraction from HTML.
* **Form Tooling**:
  * **Local Aggregation Report**: Added in-browser aggregation UI with scatter plot support.
  * **Headless Wallet CLI**: Prototype tool to extract JSON-LD and auto-fill Web/A forms.
* **Site & Docs**:
  * **Footer i18n**: Footer labels now follow browser language (JA/EN).
  * **New Papers**: Added English Web/A Form discussion paper and PassKey national ID signing memo (JA).

## v1.6.0 - Web/A Form & Core Refactoring

**Date:** 2025-12-27

Introduction of **Web/A Form** for interactive, calculable documents and a major codebase reorganization.

* **Web/A Form (Interactive Documents)**:
  * **Client-Side Engine**: New `src/form/` module delivering rich interactivity within static Web/A documents.
  * **Spreadsheet Logic**: Implemented `Calculator` class for Excel-like formula evaluation (SUM, field references) and automatic recalculation.
  * **Dynamic UI**:
    * **Table Operations**: Support for adding/removing rows in dynamic tables.
    * **Smart Suggestions**: Column-based autocomplete for repetitive data entry.
    * **Workflow**: Built-in "Save Draft", "Clear", and "Submit" actions with LocalStorage persistence.
  * **Input Enhancements**: Right-aligned numeric inputs, date pickers, and auto-copy functionality.
* **System Architecture**:
  * **Modular Split**: Refactored `src/` into `core` (shared), `ssg` (build-time), and `form` (runtime) for better separation of concerns.
  * **Client Bundling**: Added dedicated build scripts for the Web/A client runtime.
* **Documentation**:
  * **Web/A Form Guide**: Added detailed specifications and usage guides for the new form capabilities (Japanese/English).

## v1.5.0 - Archival-Grade Web Documents (Web/A) & Trust Chain

**Date:** 2025-12-24

Introduction of a new archival web document format and major enhancements to long-term trust management.

* **Web/A (Archival-Grade Web Documents)**:
  * **New Layout**: `layout: weba` for creating self-contained, machine-readable documents.
  * **Human-Machine Duality**: Simultaneous embedding of semantic JSON-LD and human-readable HTML/CSS.
  * **Multi-Layer Maintenance Model**: Separation of the *Signed Content Layer* (permanent) and the *Portable Presentation Layer* (evolutionary) to ensure 50+ year readability.
  * **Trust Transition Ready**: Designed for "Signature Refreshment" over evidence hoarding, prioritizing continuous chain of custody.
  * **Provenance Manifest**: Integration of C2PA-style generator claims to guarantee Human-Machine Parity (HMP).
* **Advanced Key Management & Security**:
  * **PassKey Integration**: Support for hardware-backed Root of Trust using WebAuthn/PassKeys.
  * **Authority Delegation**: Implemented a 2-tier signing model (Root -> Delegate) for secure automated builds.
  * **In-Font Provenance**: Added `SRNC` table injection to subsetted fonts for asset-level integrity.
* **Documentation & Site Refinement**:
  * **New Discussion Papers**: Published comprehensive papers on *Web/A*, *Hybrid Signatures*, and *PassKey Delegation*.
  * **English Localization**: Updated the Developer Guide and core site metadata to English for global accessibility.
  * **Project Cleanup**: Migrated architectural docs to the publishing pipeline and removed the legacy `docs/` directory.

## v1.4.0 - Multi-Tenant Architecture & Build Optimization

**Date:** 2025-12-23

Major restructuring to support managing multiple independent sites (tenants) from a single engine.

* **Multi-Tenant (Multi-Site) Architecture**:
  * Moved site-specific content, configurations, and data (keys) into `sites/` directory.
  * Extracted shared assets (fonts, schemas, base CSS) into `shared/` directory.
  * Added `--site [profile]` CLI argument to target specific sites during build.
  * Independent `dist/` subdirectories per site for clear separation of build artifacts.
* **Build & Deployment Optimization**:
  * **Incremental Builds**: Re-enabled and optimized build logic to skip unchanged files, while ensuring dynamic pages (blog, grid) are always rebuilt.
  * **Site-Specific Deployment**: Updated `package.json` to allow deploying to different repositories (e.g., personal blog to `masanork.github.io` and Sorane demo to `srn`).
  * **Migration Tool**: Added `bun run migrate` to automatically add compliant frontmatter to legacy Markdown files.
* **Core Engine Refinement**:
  * Unified global assets: Engines now fall back to `shared/style.css` if site-specific styles are missing.
  * Improved blog layout: Added support for custom Markdown content in the blog header area.
  * Security: Strengthened `.gitignore` to prevent leaking private site data and secret keys while allowing official demo tracking.

## v1.3.0 - Branding & Discussion Paper Refinement

**Date:** 2025-12-22

Finalizing the technical memorandum for public institutions and aligning the project branding.

* **Project Branding**:
  * Unified project name to **"Sorane (空音)"**.
  * Revised project scope: Defined as an **OSS Reference Implementation** for high-fidelity typography and Post-Quantum Cryptography (PQC).
* **Documentation Refinement (`issues.md`)**:
  * Transformed into a technical memorandum/discussion paper ("論点整理の叩き台") for public institutions.
  * Revised tone to **Plain/Declarative (Da/Dearu)** style for professional neutrality.
  * Added deep-dives on:
    * **Non-standard Character Encoding**: PUA vs. JIS X 0213 normalization.
    * **Holder Binding**: PPID, ZKP, and JPKI serial number usage constraints.
    * **Frontend Interoperability**: Bridging PC workflows with smartphone wallets using Passkeys/CTAP.
    * **Legal Framing**: Defining signatures as **"Organizational Seals / e-Seals"** rather than natural person's electronic signatures.
    * **Ecosystem Governance**: Advocating for open specifications and conformance tests to avoid vendor lock-in.
* **Index Cleanup**:
  * Removed the massive "Additional Administrative Characters List" from the main navigation to focus on core documentation and demos.
  * Improved dashboard layout for better information hierarchy.

## v1.2.0 - Selective Disclosure & Administrative Compliance

**Date:** 2025-12-22

Enhancing privacy and administrative compliance for digital official records.

* **Selective Disclosure (SD-CWT)**:
  * Implemented binary SD-CWT (CBOR/COSE) using salted disclosure hashes.
  * Added **SD Debug Console** to the document footer to visualize hidden claims and disclosures.
  * Enables granular control over sensitive fields (e.g., MyNumber) within a single signed credential.
* **Administrative Compliance (MIC 001018493.pdf)**:
  * Implemented **Anti-Print Measures**: CSS-based "VOID / INVALID PRINT" watermark and warning notices.
  * Clarified the "Digital Original" status: Personal prints are invalid; only digital presentations (VP) are authoritative.
* **Credential Schema Integration**:
  * Added W3C VC 2.0 compliant `credentialSchema` linking to JSON Schemas hosted on `did:web`.
  * Enabled structural validation of machine-readable data by third-party verifiers.
* **UX & Typography**:
  * Relocated the digital signature badge to the official seal area for logical consistency.
  * Upgraded top page typography to Noto Sans JP for a professional, professional aesthetic.
  * Fixed `ReferenceError` in error handling during font subsetting.

## v1.1.0 - Data-Driven Layouts & Core Refinement

**Date:** 2025-12-21

Refinements to the document generation system and core font processing.

* **Layout Engine**: Refactored complex table layouts to a fully data-driven Frontmatter architecture.
  * **Advanced Layout**: Implemented complex official specifications with dynamic layout handling.
  * **Detailed Fields**: Added support for granular field definitions and precise dates.
  * **Layout Engine**: Fixed complex table structures (dynamic rowspans).
* **Typography Core**:
  * **Data Subsetting**: Font subsetting now fully indexes YAML Frontmatter content, ensuring proper rendering of data-only views.
  * **Simplified DB**: Removed MJDB dependency in favor of a unified, file-based Glyph DB system.

## v1.0.0 - Trust Architecture & Verification Console

**Date:** 2025-12-21

Complete implementation of the Trust Architecture and Verification system.

* **Trust Anchors**: Implemented Root Key persistence (`site/data/root-key.json`) to establish a stable issuer identity.
* **Status List VC**: Added `dist/status-list.json` (signed by Root Key) for key revocation support.
* **Verification Console**: Added `verify.html` for drag-and-drop verification of `.vc.json` files.
  * Supports Hybrid VC verification (Ed25519 + ML-DSA-44).
  * Checks against the Status List for key revocation.
* **Documentation**:
  * Added [Developer Guide](./guide.html).
  * Added [PQC Verification Usage](./tech-verification.html).
* **Samples**: Added [Koseki Certificate Sample](./koseki.html).

## v0.9.0 - Hybrid Post-Quantum VC

**Date:** 2025-12-20

Introduction of cryptographic signing features for official documents.

* **Official Layout**: New `layout: official` triggers automatic signing.
* **Hybrid Cryptography**: Dual signing with Ed25519 (Elliptic Curve) and ML-DSA-44 (Post-Quantum).
* **VC Generation**: Outputs compliant Verifiable Credentials (JSON-LD) alongside HTML.
* **JCS Canonicalization**: Implemented RFC 8785 for deterministic JSON serialization.

## v0.8.0 - Glyph Database & Search

**Date:** 2025-12-19

Enhanced typography management with a dedicated SQLite database.

* **Glyph DB**: `bun run db:build` now parses `site/fonts/` and builds a detailed index.
* **IVS/SVS Support**: Full support for Ideographic Variation Sequences.
* **Inline Syntax**: Added `[font:glyph_id]` syntax for direct glyph embedding in Markdown.
* **Search**: Implemented `search.html` (internal tool) for finding glyphs by metadata.

## v0.5.0 - Initial SSG Core

**Date:** 2025-12-19

First functional version of the Typography-First Static Site Generator.

* **Zero Layout Shift**: Core subsets font embedding logic.
* **Bun Runtime**: Fast build process using Bun.
* **Variants Layout**: `layout: variants` for comparing font renderings.
