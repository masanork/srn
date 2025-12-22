title: "Sorane（空音）Technical Overview & Guide"
layout: article
description: "Sorane（空音）プロジェクトの設計思想、アーキテクチャ、および開発者向けガイド。"
font: hero:ReggaeOne-Regular.ttf
---

## System Concept

Sorane（空音）は、**「高精度なタイポグラフィ」** と **「ポスト量子暗号（PQC）」** を組み合わせたデータ交付基盤のオープンソース参照実装（Reference Implementation）である。特定の完成された製品ではなく、公共機関がVCを発行する際の実装上の難所をクリアするための「技術的な叩き台」を提供することを目的としている。

コアとなる2つの柱：

1.  **Typography-First (Zero Layout Shift)**:
    *   ページごとに使用文字を解析し、フォントをサブセット化して埋め込むことで、どの端末でも「一文字の狂いもない」レンダリングを実現する。
    *   IVS異体字や行政共通外字をネイティブにサポート。
2.  **Cryptographic Authenticity & Privacy**:
    *   すべての公認ドキュメントに **ポスト量子暗号 (ML-DSA-44)** を含むハイブリッド署名を付与。
    *   **選択的開示 (Selective Disclosure / SD-CWT)** に対応し、プライバシーに配慮した最小限のデータ提示を実現。
    *   e-Seals等に近い「組織の証跡」としての認証モデルを採用。

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
