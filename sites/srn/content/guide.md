---
title: "Technical Overview & Developer Guide"
layout: article
description: "Core philosophy, architecture, and guide for developers."
---

## System Concept

Sorane (空音) is an Open Source **Reference Implementation** for a data delivery infrastructure that combines **"Precision Typography"** with **"Post-Quantum Cryptography (PQC)"**. It is not intended as a finished product but as a "Technical Blueprint" to solve implementation challenges when public institutions issue Verifiable Credentials (VCs).

The two core pillars:

1. **Typography-First (Zero Layout Shift)**:
    * Analyzes the characters used on each page, then subsets and embeds fonts on-the-fly to ensure "pixel-perfect" rendering on any device.
    * Native support for IVS variation sequences and administrative external characters.
2. **Cryptographic Authenticity & Privacy**:
    * All official documents are signed with hybrid signatures including **Post-Quantum Cryptography (ML-DSA-44)**.
    * Supports **Selective Disclosure (SD-CWT)** to realize minimal data presentation with privacy in mind.
    * Adopts an authentication model similar to "Organizational Evidence" (e-Seals).

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

* **Bun**: Runtime environment (v1.0+).
* **Node.js**: For compatibility (if needed).

### Installation

```bash
git clone https://github.com/masanork/srn.git
cd srn
bun install
```

### Initial Setup

Before the first build, a Glyph Database must be generated for font analysis.

```bash
# Initialize SQLite database from source font definitions (IVS/SVS)
bun run db:build
```

### Building the Site

```bash
# Standard Build (Incremental)
bun run build

# Clean Build (Rebuild all)
bun run build -- --clean
```

### Local Development

To preview the site (and generate local font catalog):

```bash
# Generate Glyph Catalog (site/fonts/catalog.html)
bun run catalog

# Serve dist directory
bun x http-server dist
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

* **Result**: A `.vc.json` file is generated alongside the HTML.
* **Verification**: Users can verify this JSON in the [Verify Console](./verify.html).

### 3. Font System (Typography)

SRN allows precise control over font stacking and glyph substitution.

* **Inline Glyph**: `[font_name:glyph_id]` (e.g., `[ipamjm:MJ000001]`) embeds a specific glyph as SVG.
* **Auto Lookup**: `[MJ000001]` automatically finds the correct font from the database.

### 4. Trust Management (Advanced)

* **Root Key**: Generated automatically on first build in `site/data/root-key.json`. Back up this file to maintain issuer identity!
* **Revocation**: Status lists are generated in `dist/status-list.json`.

## Troubleshooting

* **Missing Glyphs**: Run `bun run catalog` to see available glyphs.
* **Build Errors**: Ensure `bun run db:build` was successful.
* **Signature Invalid**: If `site/data/root-key.json` was deleted, all previous signatures become invalid (Trust on First Use reset).

---
*Built with [Bun](https://bun.sh) and [OpenType.js](https://opentype.js.org).*
