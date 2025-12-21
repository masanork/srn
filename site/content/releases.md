---
title: "Release History"
layout: article
description: "Changelog and release history of SRN."
font: ipamjm.ttf,acgjm.ttf
---

# Release History

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
**Date:** 2025-12-18

First functional version of the Typography-First Static Site Generator.

*   **Zero Layout Shift**: Core subsets font embedding logic.
*   **Bun Runtime**: Fast build process using Bun.
*   **Variants Layout**: `layout: variants` for comparing font renderings.
