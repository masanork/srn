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

## 🔐 Web/A Layer2 Crypto PoC

Minimal HPKE-like hybrid KEM + AEAD envelope demo lives in:
- `src/weba_l2crypto.ts`
- `src/cli.ts`
- `tests/test_roundtrip.ts`

### Quickstart
```bash
bun src/cli.ts generate-keys --out keys/
bun src/cli.ts sign-and-encrypt --layer1-ref sha256:deadbeef --recipient issuer#kem-2025 --keys keys/issuer.json --in layer2.json --out envelope.json
bun src/cli.ts decrypt-and-verify --keys keys/issuer.json --in envelope.json
bun test tests/test_roundtrip.ts
```

### Test vectors
- Canonical JSON vector: input `{ "b": 1, "a": [true, {"z": 0, "y": "hi"}] }` -> output `{\"a\":[true,{\"y\":\"hi\",\"z\":0}],\"b\":1}`.
- Ed25519 reference vector (RFC 8032, empty message):
  - seed: `9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60`
  - public: `d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a`
  - sig: `e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b`

### Threat model notes
- AEAD binds `layer1_ref`, `recipient`, and `weba_version` via AAD; tampering breaks decryption.
- The PoC stores private keys on disk and omits key rotation and access controls.
- PQC (ML-KEM-768) is optional and uses `@noble/post-quantum` for encapsulation; if absent, only X25519 is used.
- Signature is an Ed25519 stand-in for WebAuthn; replace with passkey signatures and COSE/CBOR formats.

### TODOs
- Replace Ed25519 placeholders with WebAuthn/COSE/CBOR signature flow.
- Integrate a full hybrid HPKE implementation with standardized suite IDs.
- Add key rotation, recipient key registry, and audit logging.
## ⚖️ License
MIT License. Content and fonts used in demos are subject to their respective licenses.
