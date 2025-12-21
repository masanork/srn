---
title: "Technical Overview & Developer Guide"
layout: article
description: "A comprehensive guide to the SRN Static Site Generator architecture, features, and usage."
font:
  - hero:ReggaeOne-Regular.ttf
  - default:ipamjm.ttf,acgjm.ttf
---

# Technical Overview & Developer Guide

## System Concept

SRN (SoRaNe) is a specialized Static Site Generator designed for **Typography-First** and **Cryptographic Authenticity**. Unlike general-purpose SSGs, SRN focuses on two core pillars:

1.  **Zero Layout Shift (CLS 0)**:
    *   Fonts are subsetted per page during build time.
    *   Only exact glyphs used on the page are embedded as Base64.
    *   Ensures identical rendering across all devices with zero external requests.
2.  **Verifiable Authenticity**:
    *   Every official document is cryptographically signed.
    *   Implements **Post-Quantum Cryptography** (ML-DSA-44) alongside Ed25519.
    *   Provides a built-in "Verification Console" for checking document integrity.

## Directory Structure

```text
srn/
├── site/             # Source Content
│   ├── content/      # Markdown files (*.md)
│   ├── fonts/        # Raw font files (*.ttf, *.otf)
│   ├── static/       # Static assets (images, css)
│   └── data/         # System data (Keys, DB) - *Do not commit keys!*
├── dist/             # Generated Output (Git-ignored)
├── src/              # Build Scripts (TypeScript)
│   ├── layouts/      # HTML Templates (article, official, etc.)
│   ├── vc.ts         # Cryptography & VC Logic
│   └── index.ts      # Main Build Pipeline
└── mjq/              # Submodule: Glyph Database (SQLite)
```

## Getting Started

### Prerequisites
*   **Bun**: Runtime environment (v1.0+).
*   **Node.js**: For compatibility (if needed).

### Installation
```bash
git clone https://github.com/masanork/srn.git
cd srn
npm install
```

### Initial Setup
Before the first build, a Glyph Database must be generated for font analysis.
```bash
# Initialize SQLite database from source font definitions (IVS/SVS)
npm run db:build
```

### Building the Site
```bash
# Standard Build (Incremental)
npm run build

# Clean Build (Rebuild all)
npm run build -- --clean
```

### Local Development
To preview the site (and generate local font catalog):
```bash
# Generate Glyph Catalog (site/fonts/catalog.html)
npm run catalog

# Serve dist directory
npx http-server dist
```

## Key Features & How-to

### 1. Writing Content
Create Markdown files in `site/content/`.
```markdown
---
title: "My Article"
layout: article
font: ipamjm.ttf
---
Content goes here.
```

### 2. Verified Documents (Official VC)
To certify a document, change the layout to `official`.
```markdown
---
title: "Official Notice"
layout: official  <-- Triggers signing process
recipient: "Public"
---
This content will be signed by the Root Key.
```
*   **Result**: A `.vc.json` file is generated alongside the HTML.
*   **Verification**: Users can verify this JSON in the [Verify Console](./verify.html).

### 3. Font System (Typography)
SRN allows precise control over font stacking and glyph substitution.

*   **Inline Glyph**: `[font_name:glyph_id]` (e.g., `[ipamjm:MJ0001]`) embeds a specific glyph as SVG.
*   **Auto Lookup**: `[MJ0001]` automatically finds the correct font from the database.

### 4. Trust Management (Advanced)
*   **Root Key**: Generated automatically on first build in `site/data/root-key.json`. Back up this file to maintain issuer identity!
*   **Revocation**: Status lists are generated in `dist/status-list.json`.

## Troubleshooting

*   **Missing Glyphs**: Run `npm run catalog` to see available glyphs.
*   **Build Errors**: Ensure `npm run db:build` was successful.
*   **Signature Invalid**: If `site/data/root-key.json` was deleted, all previous signatures become invalid (Trust on First Use reset).

---
*Built with [Bun](https://bun.sh) and [OpenType.js](https://opentype.js.org).*
