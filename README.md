# Sorane (空音 / srn)

Sorane (空音) is a Typography-First Static Site Generator (SSG) with baked-in **Post-Quantum Cryptography (PQC)** and **Multi-Tenant** capabilities. Optimized for high-fidelity CJK typesetting and long-term document authenticity.

---

## 💎 Key Concepts

### 1. Zero-Jitters Typography (Smart Subsetting)
Sorane analyzes every single character used in your Markdown content and generates a minimal **WOFF2 subset** on the fly. This subset is embedded directly into the HTML as a Data URI.
- **Zero network requests** for font files.
- **Zero Layout Shift (CLS)**: The font is available as soon as the HTML is parsed.
- **IVS/SVS Support**: Perfect rendering of Kanji variations and Ideographic Variation Sequences.

### 2. Post-Quantum Trust (PQC Signing)
Future-proof your official documents with hybrid digital signatures.
- **Hybrid Signatures**: Concurrent signing with **ML-DSA-44 (Dilithium)** (NIST PQC Standard) and Ed25519.
- **W3C Verifiable Credentials**: Automatically generates `.vc.json` (JSON-LD), `.vc.cbor` (CBOR/COSE), and SD-CWT for selective disclosure.
- **Verification Console**: Built-in drag-and-drop verifier for cryptographic integrity checks.

### 3. Multi-Tenant Architecture
Manage multiple independent websites (e.g., a personal blog and an official project site) from a single shared engine.
- Shared asset library (fonts, schemas) vs. Site-specific content and keys.
- Independent deployment to different GitHub repositories or subdirectories.

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (Required for the build engine)

### Setup
```bash
git clone https://github.com/masanork/srn.git
cd srn
bun install
```

### 1. Prepare Fonts (Local Only)
As font files are often proprietary, they are `.gitignore`ed. Place your `.ttf`/`.otf` files into `shared/fonts/`.
```bash
# Index font glyphs into local SQLite DB
bun run db:build
```

### 2. Configuration & Identity
Create a site profile in `sites/[your-site]/config.yaml`:
```yaml
identity:
  domain: "example.com"
  path: "/my-blog"
directories:
  content: "sites/my-blog/content"
  data: "sites/my-blog/data" # Your signing keys reside here (ignored by git)
```

### 3. Build & Deploy
```bash
# Build a specific site
bun run build --site my-blog

# Or build everything defined in package.json
bun run build

# Deploy to GitHub Pages (targets configured repo/branch)
bun run deploy:blog
```

---

## 🛠 Advanced Features

### Content Migration
Import legacy content from other platforms or standard Markdown files.
- **Standard Markdown**: `bun run migrate --site my-blog` (Auto-adds frontmatter/dates)
- **Movable Type (Hatena/MT)**: `bun run migrate --site my-blog --import your-export.txt`

### Glyph Embedding
Use the specialized syntax to embed specific glyphs by ID without worrying about the encoding:
`[ipamjm:MJ000001]` -> Renders the specific MJ variant as an optimized subset glyph.

---

## 📂 Project Structure

```text
srn/
├── src/
│   ├── core/           # Shared Infrastructure (VC, Fonts, Utils, Config)
│   ├── ssg/            # Static Site Generator Engine (Layouts, Build scripts)
│   └── form/           # Web/A Form Engine (Parser, Renderer, Runtime)
├── shared/             # Shared Assets (Master fonts, schemas, base CSS)
├── sites/              # Tenant Directories
│   └── [site-name]/
│       ├── config.yaml # Site-specific settings
│       ├── content/    # Markdown files
│       ├── data/       # Signing keys & history (Private)
│       └── static/     # Site-specific assets
└── dist/               # Build Output
    └── [site-name]/    # Each site gets its own clean directory
```

## ⚖️ License
MIT License. Content and fonts used in demos are subject to their respective licenses.
