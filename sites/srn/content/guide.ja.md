---
title: "技術概要 & 開発者ガイド"
layout: article
description: "Sorane (SRN) の設計思想、アーキテクチャ、および開発者向けガイド。"
ai_generated: true
---

# 技術概要 & 開発者ガイド

## システムコンセプト

Sorane (空音) は、**「精密なタイポグラフィ」**と**「耐量子暗号 (PQC)」**を組み合わせたデータ配送基盤のオープンソース・参照実装です。完成された製品ではなく、公的機関が検証可能な資格情報 (VC) を発行する際の技術的課題を解決するための「技術青写真」として設計されています。

主な2つの柱：

1.  **タイポグラフィ・ファースト (Zero Layout Shift)**:
    *   ページごとに使用キャラクターを解析し、フォントをオンザフライでサブセット化して埋め込むことで、あらゆるデバイスでの「ピクセルパーフェクト」な表示を保証。
    *   IVS（異体字セレクタ）や行政外字にネイティブ対応。
2.  **暗号による真正性とプライバシー**:
    *   全ての公式ドキュメントは、**耐量子暗号 (ML-DSA-44)** を含むハイブリッド署名で署名。
    *   **選択的開示 (SD-CWT)** をサポートし、プライバシーに配慮した最小限のデータ提示を実現。
    *   「組織の証拠（e-Seals）」に近い構成を採用。

## ディレクトリ構成

```text
srn/
├── shared/           # 共有アセット（フォント、スキーマ、共通CSS）
├── sites/srn/        # サイト固有のソースコンテンツ
│   ├── content/      # Markdownファイル (*.md)
│   ├── static/       # 静的アセット (images, css)
│   └── data/         # システムデータ (鍵, DB) - *鍵はコミット禁止!*
├── dist/srn/         # 生成された出力（git-ignore）
├── src/              # ビルドスクリプト (TypeScript)
│   ├── core/         # 暗号、VC、共有ユーティリティ
│   ├── ssg/          # ビルドパイプライン、レイアウト
│   ├── form/         # Web/A Form 実行時ロジック
│   └── bin/          # CLI エントリーポイント
└── mjq/              # 外字・異体字データベース (SQLite)
```

## 開発の始め方

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 初期セットアップ（文字DB構築）

```bash
bun run db:build
```

### 3. ビルドと実行

```bash
bun run build:srn
bun x http-server dist/srn
```

## 主要機能と使い方

### 1. Web/A Documents (アーカイブ品質のWeb)

`layout: article` または `layout: weba` を使用します。標準的な記事ページも、デフォルトで Web/A ドキュメントとして署名されます。

*   **HMP (Human-Machine Parity)**: 人間が見るHTML表示と、機械が読むJSON-LDデータを暗号的に結合。
*   **検証バッジ**: ページ内に「Web/A Signed」バッジが表示され、証拠データ(VC)をダウンロード可能です。

### 2. Web/A Forms (対話型ドキュメント)

`layout: form` を使用することで、検証可能なフォームを作成できます。

```markdown
---
title: "申請フォーム"
layout: form
---
- [text:name (label="氏名")] 氏名
```

*   **Single-File Runtime**: ロジック、CSS、署名をすべて含んだ単一のHTMLファイルを生成。
*   **L2 Encryption (L2E)**: 回答内容を指定した受領者（発行者や集計者）向けに暗号化可能。
*   **CLI 生成**: `bun src/form/cli.ts input.md > output.html`

### 3. AI 連携と移行

*   **Excel からの移行**: `markitdown` 等で Excel を Markdown 化し、[移行プロンプト](./guide/prompts.ja.html) を使って Web/A 構文へ変換。
*   **MCP サーバー**: AI エージェント（Claude/Cursor等）からフォームの解析や自動入力を行うための [MCP設定](./guide/mcp-setup.ja.html) を提供。

## セキュリティと監査性

*   **依存関係のベンンダリング**: サプライチェーンリスク排除のため、コア暗号ライブラリを `src/vendor/` に内蔵。
*   **SBOM/CBOM**: `sbom.json` により、構成コンポーネントと暗号資産を明示。
*   **耐量子ハイブリッド**: 現行の Ed25519 と次世代の ML-DSA を組み合わせた二重署名。

---
*Built with [Bun](https://bun.sh) and [OpenType.js](https://opentype.js.org).*
