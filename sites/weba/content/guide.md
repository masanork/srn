
# Web/A Form 開発者ガイド

Web/A Form (Web/A) は、Markdown で定義可能な、サーバーレス・ファイルベースの業務アプリケーション基盤です。
本ドキュメントでは、Web/A Form のアーキテクチャ、ソースコード構成、および開発ツール（Maker/CLI）の使用方法について解説します。

## 1. アーキテクチャ概要

Web/A Form は「定義（Markdown）」、「生成（Generator）」、「実行（Runtime）」の3つのフェーズで構成されています。

1.  **定義 (Definition)**: 独自の拡張 Markdown 構文を用いて、フォームの構造、入力項目、計算式を記述します。
2.  **生成 (Generation)**: 定義ファイルを解析し、HTML/CSS/JS が一体となった単一の HTML ファイル（`.html`）を生成します。
3.  **実行 (Runtime)**: 生成された HTML ファイルをブラウザで開くことで、入力フォームとして機能します。入力データは JSON-LD として埋め込まれ、ローカル保存や再編集が可能です。

## 2. ディレクトリ構成

ソースコードは `src/weba/` ディレクトリに集約されています。機能ごとにモジュール分割されており、高い保守性を維持しています。

| ファイル | 役割 |
|---|---|
| `src/weba/parser.ts` | Markdown パーサー。テキストを解析し、HTML フラグメントとメタデータ構造を返します。 |
| `src/weba/renderer.ts` | HTML レンダラー。各フォーム部品（Input, Select, Table等）の HTML 文字列生成を担当します。 |
| `src/weba/generator.ts` | 完全な HTML ファイルを生成するための統合モジュール。CSS や Runtime Script を埋め込みます。 |
| `src/weba/cli.ts` | CLI ツール。コマンドラインから Markdown ファイルを Web/A Form (HTML) に変換します。 |
| `src/weba/browser_maker.ts` | Web/A Maker (ブラウザ版エディタ) 用のエントリーポイント。 |
| `src/weba/weba.test.ts` | 上記モジュールの回帰テスト (Regression Test) コード。 |

## 3. 開発フロー

プロジェクトは [Bun](https://bun.sh) ランタイムを使用しています。

### 3.1 依存関係のインストール

```bash
bun install
```

### 3.2 テストの実行

開発時は必ずリグレッションテストを実行し、既存機能への影響がないことを確認してください。

```bash
bun test src/weba/weba.test.ts
```

### 3.3 ブラウザ版 Maker のビルド

`src/weba/browser_maker.ts` をバンドルし、Web/A Maker (`sites/srn/static/demos/web-a-maker.html`) で読み込まれる `mkform.js` を生成します。

```bash
bun build src/weba/browser_maker.ts --outfile sites/srn/static/demos/mkform.js
```

### 3.4 CLI ツールの使用

開発中の動作確認や、バッチ処理によるフォーム生成には CLI ツールが便利です。

```bash
# 基本的な使い方
bun src/weba/cli.ts input.md > output.html

# エラー確認
bun src/weba/cli.ts definition.md
```

## 4. Markdown 構文リファレンス

Web/A Form 独自の Markdown 拡張構文です。

### 基本入力

```markdown
- [type:key (attributes)] Label
```

*   **type**: `text`, `number`, `date`, `textarea`, `calc`, `datalist`
*   **key**: 保存されるデータのキー名 (JSON のプロパティ名)
*   **attributes**: スペース区切りで記述。
    *   `placeholder="..."`: プレースホルダー
    *   `val="..."`: 初期値
    *   `size:L` / `size:S`: サイズ調整
    *   `align:R` / `align:C`: 文字配置
    *   `suggest:column`: (TEXTのみ) テーブル列の値を自動補完候補として表示

**例:**
```markdown
- [text:fullname (placeholder="山田 太郎")] 氏名
- [number:age (size:S align:R)] 年齢
```

### ラジオボタン

```markdown
- [radio:gender] 性別
  - [x] 男性 (初期選択)
  - 女性
  - その他
```

### 計算フィールド (`calc`)

Excel 表記に近い計算式を利用できます。変数名は他のフィールドの `key` を使用します。

```markdown
- [calc:total (formula="price * quantity")] 合計金額
```

### 動的テーブル (`dynamic-table`)

行追加・削除が可能なテーブルです。初期行（テンプレート）を定義します。

```markdown
[dynamic-table:items]
| 品目 | 単価 | 数量 | 小計 |
|---|---|---|---|
| [text:name] | [number:price] | [number:qty] | [calc:subtotal (formula="price * qty")] |
```

### 検索・自動補完 (`search` & `master`)

CSV形式のマスターデータを定義し、高度な検索と自動補完を利用できます。

```markdown
- [search:vendor_name (src:vendors placeholder="ベンダー名")] ベンダー検索

[master:vendors]
| ID | ベンダー名 | 担当者 | 電話番号 |
|---|---|---|---|
| 001 | Acrocity株式会社 | 山田 | 03-1234-5678 |
```

*   **src**: 参照するマスターデータのキー名
*   **placeholder**: 入力欄のヒント（**重要**: 自動補完のマッチングに使用されます）
*   **label**: 検索結果として表示するカラムのインデックス（1始まり）。省略時は全カラム結合。
*   **value**: データとして保存するカラムのインデックス（1始まり）。省略時は `label` カラム、それもなければ2列目(Name, もしあれば)、なければ1列目(ID)。
*   **suggest**: `suggest:column` (属性) を指定すると、マスタではなくテーブル内の同列の入力済みの値を候補として表示します。

**自動補完 (Auto-Fill) の仕組み:**
検索結果を選択すると、マスターデータの行データを使って、フォーム内の他のフィールド（`text` 等）を自動的に埋めます。
マッピングは以下の優先順序で決定されます：

1.  **Key一致**: フォーム項目のキー (`key`) がマスターデータのヘッダー名と一致する場合。
2.  **Header一致**: フォーム項目の**ラベル**（Web/Aが表示するラベル文字、テーブルの場合はヘッダー文字）がマスターデータのヘッダー名と一致する場合。
3.  **Placeholder一致**: フォーム項目のプレースホルダーがマスターデータのヘッダー名と一致する場合。

**注意**: マスターデータ定義 `[master:...]` は、ドキュメントの末尾（--- の後など）に配置することを推奨します。

## 5. ランタイムの仕組み

生成された HTML には、フォームの動作を制御する JavaScript (`RUNTIME_SCRIPT`) が埋め込まれています。

*   **自動計算**: 入力値が変更されるたびに `recalculate()` が走り、`formula` に基づいて値を更新します。
*   **高度な検索**: `search` 項目では、マスターデータの全カラムを対象に検索を行い、結果候補を表示します。
*   **列内推論(Suggest)**: `suggest:column` を指定すると、テーブル内の同じ列に入力された値をユニークな候補として提示します。
*   **データ構造化**: 入力値はリアルタイムに JSON オブジェクトとして収集され、`<script type="application/ld+json">` に反映されます。
*   **保存と復元**: ブラウザの LocalStorage に一時保存され、再訪問時に復元されます（`saveToLS` / `restoreFromLS`）。
*   **保存(Bake)**: 「完了して保存」ボタンを押すと、現在の入力値を HTML の `value` 属性や `checked` 属性として焼き付け、編集不可の静的 HTML としてダウンロードします。

---

このドキュメントは、プロジェクトの進化に合わせて随時更新してください。
