---
title: "Sorane (空音) Release Notes"
layout: article
description: "Release history and major updates for the Sorane project."
---

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

## v1.2.0 - Selective Disclosure & MIC Compliance

**Date:** 2025-12-22

Enhancing privacy and administrative compliance for digital resident records.

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

## v1.1.0 - Data-Driven Juminhyo & Core Refinement

**Date:** 2025-12-21

Refinements to the resident record generation system and core font processing.

* **Juminhyo System**: Refactored `juminhyo.md` to a fully data-driven Frontmatter architecture.
  * **Advanced Layout**: Implemented official MIC (Page 7) specifications with dynamic layout handling.
  * **Detailed Fields**: Added support for individual MyNumber, Resident Code, and precise movement dates.
  * **Layout Engine**: Fixed complex table structures (dynamic rowspans for history and domiciles).
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
