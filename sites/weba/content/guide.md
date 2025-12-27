
---
title: "Web/A Form 開発者ガイド"
layout: article
description: "Web/A Form のアーキテクチャ、独自構文、開発フローの詳細ガイド。"
date: 2025-12-27
author: "Sorane Project"
---

# Web/A Form 開発者ガイド

Web/A Form は、Markdown で定義可能な、サーバーレス・ファイルベースの業務アプリケーション基盤です。
本ドキュメントでは、Web/A Form のアーキテクチャ、ソースコード構成、および開発ツール（Maker/CLI）の使用方法について解説します。

## 1. アーキテクチャ概要

Web/A Form は「定義（Markdown）」、「生成（Generator）」、「実行（Runtime）」の3つのフェーズで構成されています。

1.  **定義 (Definition)**: 独自の拡張 Markdown 構文を用いて、フォームの構造、入力項目、計算式を記述します。
2.  **生成 (Generation)**: 定義ファイルを解析し、HTML/CSS/JS が一体となった単一の HTML ファイル（`.html`）を生成します。
3.  **実行 (Runtime)**: 生成された HTML ファイルをブラウザで開くことで、入力フォームとして機能します。入力データは JSON-LD として埋め込まれ、ローカル保存や再編集が可能です。

## 2. ディレクトリ構成

ソースコードは `src/form/` ディレクトリに集約されています。機能ごとにモジュール分割されており、高い保守性を維持しています。

| ファイル | 役割 |
|---|---|
| `src/form/parser.ts` | Markdown パーサー。テキストを解析し、HTML フラグメントとメタデータ構造を返します。 |
| `src/form/renderer.ts` | HTML レンダラー。各フォーム部品（Input, Select, Table等）の HTML 文字列生成を担当します。 |
| `src/form/generator.ts` | 完全な HTML ファイルを生成するための統合モジュール。CSS や Runtime Script を埋め込みます。 |
| `src/form/cli.ts` | CLI ツール。コマンドラインから Markdown ファイルを Web/A Form (HTML) に変換します。 |
| `src/form/browser_maker.ts` | Web/A Maker (ブラウザ版エディタ) 用のエントリーポイント。 |
| `src/form/weba.test.ts` | 上記モジュールの回帰テスト (Regression Test) コード。 |

## 3. 開発フロー

プロジェクトは [Bun](https://bun.sh) ランタイムを使用しています。

### 3.1 依存関係のインストール

```bash
bun install
```

### 3.2 テストの実行

開発時は必ずリグレッションテストを実行し、既存機能への影響がないことを確認してください。

```bash
bun test src/form/weba.test.ts
```

### 3.3 ブラウザ版 Maker のビルド

`src/form/browser_maker.ts` をバンドルし、Web/A Maker (`sites/weba/static/maker.html`) で読み込まれる `mkform.js` を生成します。

```bash
bun build src/form/browser_maker.ts --outfile sites/weba/static/mkform.js
```

### 3.4 CLI ツールの使用

開発中の動作確認や、バッチ処理によるフォーム生成には CLI ツールが便利です。

```bash
# 基本的な使い方
bun src/form/cli.ts input.md > output.html
```

## 3.5 L2 Encryption Frontmatter

L2 暗号化を有効にする場合は、Markdown の Frontmatter に以下を追加します。

```yaml
---
layout: form
l2_encrypt: true
l2_recipient_kid: "issuer#kem-2025"
l2_recipient_x25519: "<base64url>"
# l2_recipient_pqc: "<base64url>" # Optional. ML-KEM-768 公開鍵（ハイブリッド用）
# l2_campaign_id: "campaign-2025"
# l2_key_policy: "campaign+layer1" # Optional. campaign | campaign+layer1
# l2_layer1_ref: "sha256:..."
l2_encrypt_default: true
l2_user_kid: "user#sig-1"
---
```

PQC を使う場合は `l2_recipient_pqc` を指定します。未指定の場合は X25519 のみです。
組織ルート鍵から派生する場合は `l2_campaign_id` と `l2_key_policy` を設定し、受領者公開鍵は CLI で導出します。

### 3.5.1 SRN インスタンス鍵との関係

組織ルート鍵は SRN インスタンス鍵から決定的に導出できます。

```
org_root_key = HKDF(srn_instance_key, info = "weba-l2/org-root" || org_id)
```

CLI 例:

```bash
bun src/bin/weba-l2-crypto.ts gen-instance-key --out ./keys/srn-instance.json
bun src/bin/weba-l2-crypto.ts derive-org-root --instance-key ./keys/srn-instance.json --org-id org-1 --out ./keys/org-root.json
```

## 3.6 ブラウザでの PQC 復号

ブラウザ側で PQC 復号を行う場合は、ML-KEM-768 のプロバイダを登録します。

```ts
import { createMlKem768Provider, installBrowserPqcProvider } from "./pqc";

installBrowserPqcProvider(createMlKem768Provider());
```

`webaPqcKem` として登録されるため、L2 Viewer / Aggregator の復号に利用されます。

## 4. Excel 帳票からの変換ワークフロー

Excel からの機械的な完全変換は難しいため、**MarkItDown + LLM** を前提とした半自動ワークフローを標準手順とします。
この手順を文書化しておくことで、品質と再現性を確保します。

### 4.1 基本フロー

1. **Excel を Markdown に変換**
   - Microsoft `markitdown` 等を使って Excel を Markdown 化します。
   - 例: `markitdown input.xlsx > input.md`
2. **Markdown の整形**
   - 余計な空行、注釈、重複ヘッダーを整理。
   - 罫線・結合セルが崩れていないかを確認。
3. **LLM に Web/A 構文へ変換させる**
   - `sites/weba/content/prompt.md` または `sites/weba/content/papers/web-a-form.ja.md` の変換プロンプトを利用。
4. **CLI で HTML を生成**
   - `bun src/form/cli.ts converted.md > output.html`
5. **QA（人手確認）**
   - 画面レイアウト、計算式、入力バリデーション、テーブルの行追加、JSON-LD の整合性を確認。

### 4.2 成果物の保存ルール

- `input.xlsx`（原本）
- `input.md`（MarkItDown 出力）
- `converted.md`（LLM 変換結果）
- `output.html`（Web/A Form）
- 変換に使ったプロンプト（テキストとして保存）

### 4.3 変換チェックリスト（最小）

- **見た目**: 罫線・ラベル・注記が崩れていないか
- **ロジック**: SUM 等の式が正しいか
- **データ構造**: JSON-LD のキーと値が期待どおりか
- **入力制約**: 必須/任意、型、選択肢が妥当か
