---
title: "Sorane (空音) Release Notes"
layout: article
description: "Release history and major updates for the Sorane project."
ai_generated: true
---

## v3.4.0 - Quality Hardening & Shared Aggregator Engine

**Date:** 2026-01-06

A major release focused on production readiness, architectural consolidation, and rigorous testing of the trust layer.

*   **Trust Layer Verification Hardening**:
    *   **Comprehensive Test Suite**: Added exhaustive unit tests for `verifyWebA` and `verifyWebALtv` covering L1-L4 layers.
    *   **HMP Validation Fix**: Resolved a critical bug where the core verifier would report a document as valid even if the Human-Machine Parity (HMP) check failed.
    *   **Coverage Milestone**: Increased verification logic line coverage from 3% to **over 80%**, ensuring the "Root of Trust" is programmatically protected against regressions.

*   **Unified Aggregator Engine**:
    *   **Aggregator Engine (Shared)**: Extracted core aggregation logic into a platform-agnostic module (`aggregator_engine.ts`), now shared by both the CLI and Browser runtimes.
    *   **Robust Data Selection**: Rewrote `selectValues` to support advanced path resolution, including array wildcards (`items[].value`) and root prefixes.
    *   **Standardized CSV Export**: Unified the `flattenForCsv` logic to ensure consistent, indexed array representation (`items[0].key`) across all environments.
    *   **Browser UI Stability**: Increased Aggregator UI test coverage from 25% to **73%** and resolved memory-leak concerns through code modularization.

*   **Markdown Static Analysis (Linter)**:
    *   **Web/A Validator**: Introduced a new CLI tool (`src/tools/validator.ts`) to detect logical errors in Markdown definitions *before* they are distributed.
    *   **Integrity Checks**: Automatically validates master data references (`src`), autofill column indices, and `show_if` conditional dependencies.

*   **Parser & Renderer Refinement**:
    *   **Centralized Attribute Parsing**: Standardized attribute extraction logic in `utils.ts`, improving robustness for quoted values and special characters.
    *   **UI Bug Fixes**: Resolved issues where `autofill` indices were incorrectly rendered as initial values in search fields.
    *   **Scoped Visibility**: Refactored `updateVisibility` to correctly resolve field dependencies within dynamic table rows.

*   **Developer Experience (DX)**:
    *   **CI Stability**: Fixed race conditions in client tests by resolving floating promises in the data manager.
    *   **Build Reliability**: Disabled aggressive bundle caching in development to ensure core library changes are immediately reflected in form runtimes.

## v3.3.0 - Form Validation & mdoc Identity PoC

**Date:** 2026-01-04

Major enhancements to Web/A Form submission workflow and a standalone Proof of Concept for mdoc (mobile driver's license) identity verification.

*   **Form Validation & Submission UX**:
    *   **Visual Validation Feedback**: Submit button now dynamically changes appearance based on form completeness:
        *   `btn-submit-incomplete` (dimmed) when required fields are missing
        *   `btn-submit-ready` (highlighted) when all required fields are filled
    *   **Validation Dialog**: New confirmation dialog when submitting incomplete forms, displaying:
        *   List of missing required fields with user-friendly labels
        *   Options: "Go Back" to fix or "Submit Anyway" to proceed
        *   i18n support (Japanese/English)
    *   **Field Metadata Extraction Fix**: Fixed critical parser bug where fields defined in markdown tables weren't being extracted to `jsonStructure`, causing validation to fail completely
    *   **Conditional Field Support**: Respects `show_if` logic - hidden conditional fields (e.g., state field when country != USA) don't block submission

*   **Optional Signature Requirement**:
    *   **Frontmatter Configuration**: Added `require_signature` option (default: `false`) to control submission behavior:
        ```yaml
        ---
        require_signature: false  # No PassKey required (default)
        # require_signature: true # Requires PassKey signature
        ---
        ```
    *   **Flexible Authentication**: Forms no longer assume all users have FIDO devices
    *   **submitDocument Mode**: Plain HTML download without cryptographic signing for accessibility
    *   **Backward Compatibility**: Existing forms automatically default to no-signature mode

*   **mdoc Identity PoC (Standalone)**:
    *   **ISO/IEC 18013-5 Implementation**: Initial support for mobile driver's license (mDL) format.
    *   **Credential Viewer**: New demo interface for visualizing mdoc credentials (`demo_cbor_renderer`).
    *   **PCSC Integration**: Added PC/SC smart card reader support for reading mdoc data.
    *   **Separate Module**: Currently implemented as a standalone viewer and **not yet integrated** into the core SSG build pipeline or Web/A document format.

*   **Form Runtime Improvements**:
    *   **Event Delegation**: Implemented document-level event delegation for better performance and dynamic content support
    *   **Bundle Optimization**: Eliminated barrel imports and Node.js shims, reducing client bundle size
    *   **Browser Compatibility**: Fixed runtime errors in generated forms
    *   **CBOR-X Integration**: Added client-side CBOR encoding/decoding for mdoc support

*   **Developer Experience**:
    *   **Test Infrastructure**: Added validation test form (`submit-validation-test.md`) with comprehensive test cases
    *   **Known Issues Documentation**: Created `KNOWN_ISSUES.md` documenting Bun test concurrency limitations
    *   **Build System Fixes**: Restored l2crypto-stub.ts for proper bundling

## v3.2.0 - Internal Maintenance & Bug Fixes

**Date:** 2026-01-03

Internal updates focusing on test stability and bug fixes. The previously planned monorepo restructuring has been rolled back and is not included in this release.

*   **Developer Experience (DX) Improvements**:
    *   **"Clone & Test" Ready**: Simplified the developer onboarding workflow. New contributors can now run the entire test suite immediately after cloning with `bun test`.
    *   **Test Stabilization**: Addressed directory resolution issues and missing module imports in the test environment.

*   **Bug Fixes & Refinements**:
    *   **Generator Cleanup**: Fixed `generator.ts` to correctly handle parser edge cases, resolving failures in standalone HTML generation.

## v3.1.0 - Web/A LTV & Verifier Overhaul

**Date:** 2026-01-03

Completion of the **Long-Term Validation (LTV)** architecture and a complete rewrite of the verification tooling to ensure 50-year durability for Web/A documents.

*   **Long-Term Validation (LTV) Architecture**:
    *   **Phase 1: Prunable Hash Chain (PHC)**: Implemented the L3 Context layer with an automated "Pack & Prune" strategy (retaining Genesis + Latest 5 events). This manages document history (updates/transfers) without breaking the original L2 signature validity.
    *   **Phase 2: Extended Trust Store**: Upgraded the embedded Trust Store schema to support `revocationList` and `trustedTimestamps`, enabling robust offline verification.
    *   **Phase 3: Trusted Timestamping**: Integrated RFC 3161 TSA support (defaulting to DigiCert). Signatures are now automatically sealed with a trusted third-party timestamp during the build process.

*   **Verification Tooling Overhaul**:
    *   **CLI Verifier 2.0**: Completely rewrote `weba-verify` to support full **L1-L4 Container Verification**. It now verifies:
        *   **L4**: Container Integrity (HTML/UI anti-tampering).
        *   **L3**: Context History (PHC continuity).
        *   **L2**: Payload Signature (Ed25519/ML-DSA).
        *   **TSA**: Trusted Timestamp validity.
    *   **Fit & Gap Analysis**: Conducted a comprehensive audit of verification tools and resolved critical gaps where container integrity and timestamps were previously ignored.

*   **Documentation & Visualization**:
    *   **Architecture Diagram**: Added a detailed [Architecture Diagram](./papers/web-a-ltv-architecture.html) illustrating the relationship between the HTML Container, Signatures, and ManifestManager.
    *   **Whitepaper Update**: Expanded the LTV Whitepaper with implementation specifications and a comparison with legacy standards (PAdES/XAdES).

## v3.0.0 - Web/A Infinite Canvas & Validation

**Date:** 2026-01-03

Major UX overhaul transforming Web/A forms from "static paper" to an "infinite canvas" application feel, alongside robust client-side validation and extensive plugin optimizations.

*   **UX Overhaul: Infinite Canvas**:
    *   **Flat Design**: Dropped the "paper card" metaphor (`box-shadow`, fixed width) for a full-width, flat interface suitable for data-intensive applications.
    *   **Immersive Toolbar**: The toolbar is now sticky and integrates seamlessly with the header, providing a consistent app-like experience.
    *   **Dynamic Data Tables**: Improved rendering for large tables with `nowrap` headers and auto-numbering support.

*   **Client-Side Validation**:
    *   **`required` Attribute**: Introduced support for `[type:key (required)]` syntax in Markdown.
    *   **Real-time Feedback**: The "Submit" button is now dynamically enabled/disabled based on form completeness.
    *   **Console Debugging**: Validation errors (missing fields) are logged to the console for easier troubleshooting.

*   **Plugin Architecture Refinement**:
    *   **Custom Bundler**: Implemented a specialized bundler (`bundler.ts`) that intelligently packages client-side plugins (Postal, LG Code, L2 Crypto) based on usage.
    *   **Conditional Loading**: Heavy assets like the Postal Dictionary and L2 WASM modules are now loaded only when needed (Lazy Loading), significantly improving initial load performance.
    *   **Manifest Integration**: Plugins are fully integrated with the ManifestManager, loading resources from `blob:` URLs for offline compatibility (Pack & Prune).

*   **Performance Optimization**:
    *   **Conditional GZIP**: Implemented on-the-fly GZIP decompression for Blob resources, reducing memory footprint.
    *   **WASM Optimization**: Migrated critical L2 cryptographic operations to Rust/WASM, loaded conditionally to avoid blocking the main thread.

## v2.9.0 - Unified Manifest & Pack-and-Prune Strategy

**Date:** 2026-01-02

Significant architectural upgrade focusing on resource management and cryptographic binding, enabling the "Pack First, Prune Later" strategy for long-term archival.

*   **Unified Manifest Architecture (Pack & Prune)**:
    *   **ManifestManager**: Introduced a centralized manager for all document resources (Blobs), including subsetted fonts, postal dictionaries, and JavaScript bundles (e.g., Mermaid).
    *   **Pack & Prune Strategy**: Implemented a distribution model where all resources are initially embedded as Base64 in the HTML (Pack) for 100% offline functionality, but can be stripped later (Prune) while maintaining verifiability through manifest digests and secondary URLs.
    *   **Cryptographic Binding**: All resource digests are now included in the Layer 1 Manifest, which is bound to the Layer 2 Payload signature, ensuring the integrity of the rendering and input environment.

*   **Layer 1 Refinement**:
    *   Formally split Layer 1 into **L1-Core** (the immutable schema and logic) and **L1-Manifest** (the referrable set of heavy assets).
    *   Updated the [Web/A Whitepaper](./papers/web-a.html) to reflect this new structural separation.

*   **Form Parser & Renderer Improvements**:
    *   **Inline Markdown Support**: Enhanced the custom form parser to support standard Markdown inline formatting (Bold, Italic, Code, and Links) within field labels and descriptions.
    *   **Dynamic Asset Loading**: The client-side runtime now supports fetching missing Blobs from secondary URLs if they have been pruned from the HTML container.

*   **Documentation & Guides**:
    *   **New Whitepaper**: Published [Web/A Manifest Architecture](./papers/web-a-manifest-architecture.html) detailing the technical implementation of the Pack & Prune strategy.
    *   **Syntax Guide**: Created a comprehensive [Web/A Form Syntax Guide](./guide/weba-form-syntax.html) (Tag Reference) to serve as the Source of Truth for form developers and AI agents.

## v2.8.0 - New Year Update: CIV Identity & LTV Architecture

**Date:** 2026-01-01

Major update for the new year, integrating the multi-document **CIV (Citizen Identity Verification)** module and establishing the **LTV (Long-Term Validation)** architecture for archival-grade trust.

*   **CIV (Citizen Identity Verification) Integration**:
    *   **⚠️ Experimental Warning**: This module is in an experimental stage. Implementation is based on specifications and simulator-bound testing; **testing with actual hardware (NFC readers/smart cards) has not been performed.**
    *   **Renamed & Expanded**: `jpki` package is now `civ` to support multiple identity documents.
    *   **Browser Demo**: Added `demociv.html` to demonstrate client-side attribute extraction from IC cards (DL/EP/RC/MyNumber) via WebUSB/WebNFC using WASM.
    *   **Driver's License (DL)**: Added AP selection, PIN verification, and Shift-JIS parsing.
    *   **ePassport (EP)**: Added BAC (Basic Access Control) key derivation from MRZ and **Secure Messaging (BAC)** with ISO 7816-4 DO87/DO97 handling.
    *   **Residence Card (RC)**: Supported card number verification and extended read logic.
    *   **US PIV Cards**: Added support for CHUID and Authentication Cert reading.
    *   **Updated CLI**: `civ` command now supports subcommands: `jpki`, `dl`, `ep`, `rc`, `piv`.

*   **Web/A LTV Architecture & Metadata Refinement**:
    *   **Layered Signature Model**: Established the Full 4-Layer Trust Architecture:
        *   **L1 Schema**: Refined from "Template" to "Schema", establishing Markdown as the primary Source of Truth.
        *   **L2 Payload**: Immutable Data with Stable Signatures (solving the "Rebuild Paradox").
        *   **L3 Context**: **Prunable Hash Chain (PHC)** for audits. Published the [PHC Specification](./papers/web-a-phc.html).
        *   **L4 Presentation**: Clarified as the mutable layer for HTML templates.
    *   **AI Context & Semantic Metadata**:
        *   **AI-Ready Forms**: Added `context`, `property`, and `hint` attributes to form fields (e.g., `[text:name (context="Formal Name" property="schema:name")]`).
        *   **Machine-Readable DOM**: These attributes are rendered as `data-context` and `data-property` in the HTML, enabling AI agents to understand field semantics and intent.
        *   **Auto-Hinting**: Field `context` is automatically used as a user-facing hint if no explicit hint is provided.
    *   **Offline Verification**: Implemented **Trust Store Embedding**, injecting Issuer's DIDs directly into HTML.
    *   **Metadata Extensions**: Added Frontmatter support for `schemas`, `license`, `updated`, and `lang`.
    *   **SSG Logic**: Implemented tag-based draft filtering (`tags: ["draft"]`).
    *   **Documentation**: Major update to the [Web/A Whitepaper](./papers/web-a.html) (v2.0).

*   **Web/A Post (Event-Driven Transition)**:
    *   **Architecture Shift**: Pivoted towards a **Pub/Sub-first Ingress** model to ensure global portability and reduce frontend complexity.
    *   **Claim Check Pattern**: Adopted a model where raw containers are streamed to Object Storage (R2/GCS/S3) while only lightweight pointers are passed via Pub/Sub, overcoming CSP message size constraints (128KB - 10MB).
    *   **Storage Strategy**: Prioritized Object Storage for raw containers with asynchronous processing for rule evaluation and AI assistance.

## v2.7.0 - Folio POC v0.1.0: JPKI Integration

**Date:** 2025-12-31

Implementation of the **Folio POC** (Proof of Concept) core functionality, enabling cryptographic interaction with Japanese Public Key Infrastructure (JPKI) cards via both CLI and Browser interfaces.

*   **JPKI Core Architecture**:
    *   **Generic Library**: Extracted JPKI interaction logic into a standalone `packages/jpki` crate.
    *   **WASM Controller**: Exposed high-level JPKI operations via WebAssembly (`WasmJpkiController`).
    *   **Native & Web Support**: Designed the core to compile for both `wasm32-unknown-unknown` and native targets.

*   **Tools & Interfaces**:
    *   **Folio CLI**: Updated `folio present` to support real hardware interactions using PC/SC.
    *   **Native Diagnostics**: Added `jpki` CLI tool for lightweight card diagnostics.
    *   **Browser Driver**: Implemented `WebUsbCcidDriver` for WebUSB support.

*   **Security & Safety**:
    *   **Secure PIN Handling**: Removed all hardcoded PINs.
    *   **Hardware Abstraction**: Standardized the `CardReader` trait.

## v2.6.0 - Strategy Pivot: Signed Resource Network

**Date:** 2025-12-31

A strategic turning point for the project, redefining SRN as the **"Signed Resource Network"** and pivoting development focus towards pragmatism.

*   **Global Rebranding Strategy**:
    *   **Signed Resource Network**: Officially proposed redefining the SRN acronym.
    *   **Identity**: Positioned "Sorane" as the reference toolchain.

*   **Strategic Pivot ("Worse is Better")**:
    *   **AI Risk Synthesis**: Integrated critical analysis reports (Gemini 3 / ChatGPT o1).
    *   **Pragmatism First**: Prioritized "Minimum Viable Context" and "Onion Routing".

*   **Adoption-Driven UX Overhaul**:
    *   **Web/A Form UX Audit**: Completed a comprehensive [UX Audit](./governance/web-a-form-ux-audit.html) to transform the form experience from "digital paper" to "mobile-first application".
    *   **The "Trojan Horse"**: Prioritized "Input Intelligence" (autofill, rich widgets) and "Mobile Experience" to drive adoption through pure utility, masking the underlying cryptographic complexity.

*   **Governance & Documentation**:
    *   **AI Analysis Reports**: Published high-level analysis papers in `governance/` covering the potential and risks of the Web/A architecture.
    *   **Committee Response**: Documented the Governance Committee's "Conditional Approval" of the pivot, establishing guardrails for the new pragmatic direction.

## v2.5.0 - Web/A Post & Governance Restructuring

**Date:** 2025-12-31

Implementation of the **Web/A Post** prototype (Intelligent Postal Hub) and major restructuring of governance documentation.

*   **Web/A Post (Prototype)**:
    *   **Intelligent Postal Hub**: Implemented the core logic for a rule-based message router (`IPostalHub`) that acts as a user's digital agent ("PBX for Identity").
    *   **Server Architecture**: Created a **Hono**-based server implementation (`src/post/server-hono.ts`) compatible with both Bun (Local/VPS) and Cloudflare Workers (Edge).
    *   **Storage Abstraction**: Defined `IPostalStorage` interface and implemented `LocalFileStorage` for file-based persistence, ensuring portability across cloud providers (Cloudflare D1, Firebase Firestore, Supabase).
    *   **Deployment Strategy**: Published [Web/A Post Deployment Strategy](./papers/web-a-post-deployment-strategy.html) comparing Cloudflare, Supabase, and VPS options with a focus on data sovereignty and AI affinity.

*   **Governance & Documentation**:
    - **Governance**: Renamed "Governance & Audit Reports" to **"Transparency Reports"** to clarify the nature of self-governance documents.
    - **Web/A LTV Architecture**: Published the initial design for [Web/A Long-Term Validation](./papers/web-a-ltv-architecture.html).
        - Defined the **Layered Signature Model** (Payload/Context/Container) to solve the "Rebuild Paradox".
        - Implemented **Phase 1: Offline Verification**:
            - **Context Freezing**: Verified JCS canonicalization to prevent Context Rot.
            - **Trust Store Embedding**: Automatically inject Issuer's DID Document into the generated HTML.
            - **Offline Verifier**: Updated `verify-app` to prioritize the embedded Trust Store.
    *   **Governance Index**: Restructured the [Transparency Reports](./governance.html) page from a blog-style list to a curated, categorized index (Strategic Analysis, Security Audits, Product Response, Risk & Legal).
    *   **Transparency**: Standardized the display of "SIMULATION NOTICE" across all governance documents to clearly distinguish role-play artifacts from real-world legal documents.

## v2.4.0 - Red Team Guardrails & Compliance

**Date:** 2025-12-31

Implementation of critical guardrails and safety features requested by the Red Team to mitigate risks during the pilot phase.

* **UI Guardrails & Visual Safety**:
  * **Experimental Banners**: Injected persistent warning banners into the Form Maker UI (both editor and preview panes) to communicate the tool's prototype status.
  * **Automated Document Marking**: Implemented "EXPERIMENTAL" watermark and "PILOT PHASE" banner injection for all generated Web/A HTML documents, ensuring visibility across print and digital views.
  * **Risk Awareness**: Banners include direct links to the pilot phase risk assessment and implementation plan.

* **Data Integrity (Human-Machine Parity)**:
  * **HMP Check (Ghost Field Detection)**: Implemented a sign-time consistency check that compares the visible UI fields with the underlying JSON structure. The tool now warns users if "ghost fields" (data not visible to the human) are being included in the signature.

* **Security Logic Hardening**:
  * **Mandatory Replay Guard**: Hardened the Verifiable Credential (VC) verification logic in `src/core/vc.ts` to require a `replayGuard` implementation.
  * **Aggregator Protection**: The Aggregator Browser now utilizes a `LocalStorageReplayStore` to automatically reject duplicate submissions of the same L2 encrypted message.

* **Documentation & Compliance**:
  * **Product Team Response**: Published the formal [Product Team Response to Red Team (v7)](./governance/web-a-product-team-response-v7.html) outlining the remediation strategy.
  * **Roadmap Refinement**: Re-aligned the internal roadmap to prioritize safety boundaries over feature expansion for initial PoC deployments.


## v2.3.0 - Verifiable Credential Authorization

**Date:** 2025-12-30

Introduction of Advanced Authorization via Verifiable Credentials (VC), enabling decentralized permission management with Post-Quantum resilient hybrid signatures.

* **Verifiable Credential (VC) Framework**:
  * **Hybrid Access Passes**: Implemented "Access Pass" VCs using the `DataIntegrityProof` standard with dual signatures (**Ed25519** and **ML-DSA-44**).
  * **Admin Issuance**: Added `folio admin issue-pass` command to CLI, allowing administrators to grant permissions (e.g., `post`, `admin`) that users can carry.
  * **VC-based Authorization**: Integrated VC verification into the `postMessage` workflow. Users can now gain access by presenting a valid pass, moving beyond static database whitelists.
  * **Capability Delegation**: Implemented a two-step delegation chain (Admin -> Delegator -> Delegate). Users can now delegate rights to agents or other users via `folio transport delegate`, allowing them to post messages on their behalf while maintaining a verifiable chain of custody.

* **Server-side Security & WASM**:
  * **WASM-Powered Verification**: Migrated remote Firebase Functions to use the official Rust-compiled WebAssembly crypto module. This enables high-performance verification of ML-DSA-44 signatures on the server.
  * **Unified Crypto Platform**: Standardized cryptographic operations across CLI, Browser, and Server using a single, audited WASM core.

* **Folio CLI Improvements**:
  * **Hybrid DID Creation**: Added `--hybrid` flag to `did create` to generate both classic and post-quantum keys simultaneously.
  * **VC-Enabled Transport**: Updated `transport send` to support the `--vc` option for presenting credentials during submission.
  * **Import Standardization**: Standardized on namespace imports (`import * as path`) to improve compatibility with various TypeScript environments.

* **Documentation & Roadmap**:
  * **Phase 3 Progress**: Completed Phase 3.1 (VC Issuance) and 3.2 (VC Presentation) of the Folio roadmap.
  * **Status Update**: Reflected the advanced authorization status in `ROADMAP.md` and `.agent/tasks/folio_roadmap.md`.


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

## v1.2.0 - Selective Disclosure PoC

**Date:** 2025-12-22

Enhancing privacy and administrative readiness for digital official records.

* **Selective Disclosure (SD-CWT)**:
  * Implemented binary SD-CWT (CBOR/COSE) using salted disclosure hashes.
  * Added **SD Debug Console** to the document footer to visualize hidden claims and disclosures.
  * Enables granular control over sensitive fields (e.g., MyNumber) within a single signed credential.
* **Administrative Requirements**:
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
* **Samples**: Added [Residence Certificate Sample](./juminhyo.html).

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