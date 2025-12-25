# Web/A Maker Markdown Syntax Guide

Web/A Maker で使用できる Markdown 記法のあつまりです。

## 1. 文書構造

- **タイトル (必須)**
  `# タイトル` で記述します。これがフォームのファイル名および JSON-LD の `name` になります。
  ```markdown
  # 経費精算書
  ```

- **見出し**
  `##` (H2) ～ `######` (H6) まで使用できます。
  ```markdown
  ## 1. 申請者情報
  ### 連絡先
  ```

- **区切り線**
  `---` で区切り線を描画します。

## 2. 入力フィールド

リスト形式 `- [type:key] ラベル` で定義します。
`key` は JSON データのキー（プロパティ名）として使用されます。

| タイプ | 説明 | 記述例 |
|---|---|---|
| `text` | 1行テキスト | `- [text:username] 氏名` |
| `number`| 数値入力 | `- [number:age] 年齢` |
| `date` | 日付選択 | `- [date:created_at] 作成日` |
| `textarea` | 複数行テキスト | `- [textarea:details] 詳細` |

## 3. 属性 (Attributes)

キーの後ろに `(属性)` を追加することで、見た目や挙動を制御できます。
複数の属性を指定する場合はスペースで区切らず続けて書くか、現状の実装では簡易的なパースなので注意が必要です（基本的には `key (attr1 attr2)` ではなく、特定キーワードの有無で判定しています）。

構文: `- [type:key (option)] ラベル`

| 属性 | 説明 | 例 |
|---|---|---|
| `size:S` | フォント小 (0.8em) | `(size:S)` |
| `size:L` | フォント大 (1.25em) | `(size:L)` |
| `size:XL`| 特大・太字 (1.5em, bold) | `(size:XL)` |
| `align:R`| 右寄せ (数値などに) | `(align:R)` |
| `align:C`| 中央寄せ | `(align:C)` |
| `len:N` | 最大文字数 (maxlength) | `(len:10)` |
| `val="値"`| 初期値 (デフォルト値) | `(val="東京都")` |
| `placeholder="値"` | 入力例（プレースホルダー） | `(placeholder="例: 03-1234-5678")` |
| `hint="値"` | 補足説明（HTMLタグ可） | `(hint="補足：&lt;br&gt;改行も可能です")` |

**組み合わせ例:**
```markdown
- [number:price (align:R val=0)] 金額
- [text:title (size:XL len:50 placeholder="件名を入力")] 件名
```

## 4. マスタデータ参照

テーブル形式で定義されたマスタデータを参照して選択肢を生成できます。
マスタデータは `[master:key]` で定義します。

### Select Dropdown (Master)
- `[select:key (src:master_key key:col_idx label:col_idx)]`
- マスタデータから `<select>` を生成します。

### Datalist (Autocomplete)
- `[datalist:key (src:master_key label:col_idx)]`
- マスタデータに基づくサジェスト機能付き入力欄を生成します。
- リストにない値も自由に入力可能です。

## 5. ラジオボタン

`- [radio:key] ラベル` の直後に、インデントしたリストを書くことで選択肢になります。
`[x]` を付けると初期選択状態になります。

```markdown
- [radio:category] カテゴリ
  - [x] 個人
  - 法人
  - その他
```

## 5. テーブル (表形式入力)

Markdown の表組みの中で、セルの中に `[key]` 記法を使うことで入力欄を作成できます。

- `[key]` : 標準のテキスト入力
- `[key:attrs]` : 属性付き入力

```markdown
| 品目 | 数量 | 単価 | 合計 |
|---|---|---|---|
| りんご | [apple_qty:align:R] | [apple_unit:align:R] | [apple_total:align:R] |
| みかん | [orange_qty:align:R] | [orange_unit:align:R] | [orange_total:align:R] |
```

※ テーブル内の入力も、指定した `key` で JSON にフラットに保存されます（配列構造にはなりません）。

## 6. その他

- コメントアウト機能はありませんが、HTMLとして認識されない行は単なるテキスト段落として表示されます。
- `(C) 2025 ...` のようなフッター表記もテキストとして記述可能です。
