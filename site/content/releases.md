---
title: "Release History"
layout: article
description: "Changelog and release history of SRN."
---

## v1.2.0 - Selective Disclosure & MIC Compliance
**Date:** 2025-12-22

Enhancing privacy and administrative compliance for digital resident records.

*   **Selective Disclosure (SD-CWT)**:
    *   Implemented binary SD-CWT (CBOR/COSE) using salted disclosure hashes.
    *   Added **SD Debug Console** to the document footer to visualize hidden claims and disclosures.
    *   Enables granular control over sensitive fields (e.g., MyNumber) within a single signed credential.
*   **Administrative Compliance (MIC 001018493.pdf)**:
    *   Implemented **Anti-Print Measures**: CSS-based "VOID / INVALID PRINT" watermark and warning notices.
    *   Clarified the "Digital Original" status: Personal prints are invalid; only digital presentations (VP) are authoritative.
*   **Credential Schema Integration**:
    *   Added W3C VC 2.0 compliant `credentialSchema` linking to JSON Schemas hosted on `did:web`.
    *   Enabled structural validation of machine-readable data by third-party verifiers.
*   **UX & Typography**:
    *   Relocated the digital signature badge to the official seal area for logical consistency.
    *   Upgraded top page typography to Noto Sans JP for a professional, professional aesthetic.
    *   Fixed `ReferenceError` in error handling during font subsetting.

## v1.1.0 - Data-Driven Juminhyo & Core Refinement
**Date:** 2025-12-21

Refinements to the resident record generation system and core font processing.

*   **Juminhyo System**: Refactored `juminhyo.md` to a fully data-driven Frontmatter architecture.
    *   **Advanced Layout**: Implemented official MIC (Page 7) specifications with dynamic layout handling.
    *   **Detailed Fields**: Added support for individual MyNumber, Resident Code, and precise movement dates.
    *   **Layout Engine**: Fixed complex table structures (dynamic rowspans for history and domiciles).
*   **Typography Core**:
    *   **Data Subsetting**: Font subsetting now fully indexes YAML Frontmatter content, ensuring proper rendering of data-only views.
    *   **Simplified DB**: Removed MJDB dependency in favor of a unified, file-based Glyph DB system.

## v1.0.0 - Trust Architecture & Verification Console
**Date:** 2025-12-21

Complete implementation of the Trust Architecture and Verification system.

*   **Trust Anchors**: Implemented Root Key persistence (`site/data/root-key.json`) to establish a stable issuer identity.
*   **Status List VC**: Added `dist/status-list.json` (signed by Root Key) for key revocation support.
*   **Verification Console**: Added `verify.html` for drag-and-drop verification of `.vc.json` files.
    *   Supports Hybrid VC verification (Ed25519 + ML-DSA-44).
    *   Checks against the Status List for key revocation.
*   **Documentation**:
    *   Added [Developer Guide](./guide.html).
    *   Added [PQC Verification Usage](./tech-verification.html).
*   **Samples**: Added [Koseki Certificate Sample](./koseki.html).

## v0.9.0 - Hybrid Post-Quantum VC
**Date:** 2025-12-20

Introduction of cryptographic signing features for official documents.

*   **Official Layout**: New `layout: official` triggers automatic signing.
*   **Hybrid Cryptography**: Dual signing with Ed25519 (Elliptic Curve) and ML-DSA-44 (Post-Quantum).
*   **VC Generation**: Outputs compliant Verifiable Credentials (JSON-LD) alongside HTML.
*   **JCS Canonicalization**: Implemented RFC 8785 for deterministic JSON serialization.

## v0.8.0 - Glyph Database & Search
**Date:** 2025-12-19

Enhanced typography management with a dedicated SQLite database.

*   **Glyph DB**: `npm run db:build` now parses `site/fonts/` and builds a detailed index.
*   **IVS/SVS Support**: Full support for Ideographic Variation Sequences.
*   **Inline Syntax**: Added `[font:glyph_id]` syntax for direct glyph embedding in Markdown.
*   **Search**: Implemented `search.html` (internal tool) for finding glyphs by metadata.

## v0.5.0 - Initial SSG Core
**Date:** 2025-12-19

First functional version of the Typography-First Static Site Generator.

*   **Zero Layout Shift**: Core subsets font embedding logic.
*   **Bun Runtime**: Fast build process using Bun.
*   **Variants Layout**: `layout: variants` for comparing font renderings.
