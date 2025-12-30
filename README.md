# Sorane (空音 / srn)

Sorane (空音) is an open-source, typography-first Static Site Generator (SSG) and reference implementation for **Web/A**: verifiable, portable HTML documents with long-term authenticity. It combines precision CJK typography, cryptographic signing, and Web/A Form tooling (including Layer 2 encryption).

---

> [!WARNING]
> **Experimental Sandbox / Hobby Project Disclaimer**
>
> This project is a personal hobby project developed in a very short timeframe. It has **NOT** undergone professional quality assurance, security audits, or stress testing.
>
> 1. **No Warranty**: All code and designs are provided "as is" without any warranty of any kind, either expressed or implied. 
> 2. **Security Risk**: Cryptographic implementations and new protocols (like Web/A and Layer 2 Encryption) should be considered experimental. Do not use for production-level financial transactions, sensitive personal data, or critical infrastructure.
> 3. **Non-Commercial**: This is a proof-of-concept and reference implementation, not a commercial-grade product. 
>
> By using this software, you acknowledge these risks and assume all responsibility for any consequences.

---

## Key Capabilities

### 1) Typography-First, Zero Layout Shift
- Per-page font subsetting and Data URI embedding (WOFF2)
- IVS/SVS support for rare and administrative glyphs
- Consistent layout rendering across devices

### 2) Verifiable Web/A Documents
- Human-Machine Parity (HMP): HTML + JSON-LD bound by signatures
- W3C Verifiable Credentials (VC) output for audits and verification
- Built-in verification UI and CLI tooling

### 3) Web/A Forms + Layer 2 Encryption
- Signed Layer 1 templates with interactive forms
- Layer 2 envelopes for confidentiality (HPKE-like)
- Replay protection and bucket padding for metadata resistance
- WASM-based crypto core for stronger execution integrity

### 4) Multi-Site (Multi-Tenant) SSG
- Multiple sites in one repo with shared assets
- Independent build outputs under `dist/`
- Site-specific config, content, and keys

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh)

### Setup
```bash
git clone https://github.com/masanork/srn.git
cd srn
bun install
```

### Prepare Fonts (Local Only)
Fonts are ignored by git. Place `.ttf`/`.otf` in `shared/fonts/`.
```bash
bun run db:build
```

### Build
```bash
# Build default targets
bun run build

# Build SRN site
bun run build:srn

# Clean build
bun run build -- --clean
```

### Local Preview
```bash
bun x http-server dist/srn
```

---

## Project Structure

```text
srn/
├── src/
│   ├── core/           # Crypto, VC, fonts, utils
│   ├── ssg/            # Build pipeline, layouts, identity
│   └── form/           # Web/A Form runtime
├── shared/             # Shared assets (fonts, schemas, CSS)
├── sites/              # Site directories
│   └── [site-name]/
│       ├── config.yaml
│       ├── content/
│       ├── data/       # Signing keys (private)
│       └── static/
└── dist/               # Build output (git-ignored)
```

---

## Documentation (Papers)

Key papers are in `sites/srn/content/papers/` and built into the SRN site.

- Web/A: `sites/srn/content/papers/web-a.md`
- Web/A Form: `sites/srn/content/papers/web-a-form.md`
- Web/A L2 Encryption: `sites/srn/content/papers/web-a-l2-encryption.md`
- Security Audit v2/v3 and remediation: `sites/srn/content/papers/web-a-l2-security-*.md`

---

## Testing

```bash
bun test
bun test --coverage
```

Coverage summary is printed to stdout. For security-sensitive changes, record the overall % funcs/lines in release notes or work logs.

---

## License

MIT License. Fonts and demo content retain their respective licenses.
