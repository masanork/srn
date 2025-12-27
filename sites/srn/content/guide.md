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
├── shared/           # Shared assets (fonts, schemas, base CSS)
│   ├── fonts/        # Raw font files (*.ttf, *.otf)
│   └── schemas/      # JSON schemas
├── sites/srn/        # Source content (site specific)
│   ├── content/      # Markdown files (*.md)
│   ├── static/       # Static assets (images, css)
│   └── data/         # System data (keys, DB) - *Do not commit keys!*
├── dist/srn/         # Generated output (git-ignored)
├── src/              # Build scripts (TypeScript)
│   ├── core/         # Crypto, VC, shared utils
│   ├── ssg/          # Build pipeline, layouts, identity manager
│   ├── form/         # Web/A Form runtime
│   ├── tools/        # Local utilities
│   └── bin/          # CLI entrypoints
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

To preview the site locally:

```bash
# Build SRN site
bun run build:srn

# Serve dist directory
bun x http-server dist/srn
```

## Key Features & How-to

### 1. Writing Content

Create Markdown files in `sites/srn/content/`.

```markdown
---
title: "My Article"
layout: article
font: ipamjm.ttf
---
Content goes here.
```

### 2. Web/A Documents (Archive-Quality Web)

Use `layout: weba` for archival-grade Web/A documents. Standard `layout: article` pages are also signed as Web/A documents by default.

```markdown
---
title: "Whitepaper"
layout: article
author: "Author Name"
---
```
* **Architecture**: Implements **HMP (Human-Machine Parity)**. Signs a JSON-LD payload that is cryptographically bound to the HTML content view.
* **Verification**: Includes a "Web/A Signed" badge with download link for the credential.

### 3. Web/A Forms (Interactive Documents)

To create a verifiable interactive form, use `layout: form`.

```markdown
---
title: "Application Form"
layout: form
---
- [text:name (placeholder="Your Name")] Name
- [number:age] Age
```

* **Interactive**: Generates a functional HTML form with calculation logic.
* **Signed Template**: The form structure itself is signed by the issuer (Layer 1).
* **User Signature**: Users can sign their input using Passkeys (WebAuthn) and download a Verifiable Credential (Layer 2).
* **Form Maker**: Use the [Web/A Form Maker](./maker.html) to visually design forms and generate Markdown.

### 4. Font System (Typography)

SRN allows precise control over font stacking and glyph substitution.

* **Inline Glyph**: `[font_name:glyph_id]` (e.g., `[ipamjm:MJ000001]`) embeds a specific glyph as SVG.
* **Auto Lookup**: `[MJ000001]` automatically finds the correct font from the database.

### 5. Verification Tools (CLI & AI)

Sorane provides multiple ways to verify Web/A and VC documents without a browser.

#### CLI Validator
Verify documents directly from your terminal:
```bash
# Verify a local file with HMP check
bun run verify dist/srn/papers/web-a.ja.html --hmp --did dist/srn/did.json

# Verify a remote URL
bun run verify https://example.com/doc.html --hmp
```

#### MCP Server (AI Integration)
Integrate verification into AI models (like Claude or Gemini) via the Model Context Protocol:
```bash
# Start the MCP server
bun run mcp
```
*Configure your MCP client to use `bun run src/mcp-server.ts` to enable `verify_weba` tools for your AI assistant.*

### 6. Trust Management (Advanced)

* **Root Key**: Generated automatically on first build in `sites/srn/data/root-key.json`. Back up this file to maintain issuer identity!
* **Revocation**: Status lists are generated in `dist/status-list.json`.

## Troubleshooting

* **Missing Glyphs**: Run `bun run db:build` to refresh the glyph database, then rebuild the site.
* **Build Errors**: Ensure `bun run db:build` was successful.
* **Signature Invalid**: If `sites/srn/data/root-key.json` was deleted, all previous signatures become invalid (Trust on First Use reset).

---
*Built with [Bun](https://bun.sh) and [OpenType.js](https://opentype.js.org).*
