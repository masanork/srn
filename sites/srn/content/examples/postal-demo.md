---
title: 宅配便送り状（郵便番号自動入力デモ）
layout: form
---

# 宅配便送り状フォーム

このフォームは、郵便番号を入力すると住所を自動補完するデモです。
単独HTML内にGzip圧縮された郵便番号データ（約12万件）を内蔵しており、オフラインでも高速に動作します。

## お届け先

| 項目 | 入力フィールド |
| --- | --- |
| お名前 | [text:delivery.name (placeholder="山田 太郎")] |
| 郵便番号 | [search:delivery.zip (autofill:postal:zip placeholder="例: 105-0011")] |
| 都道府県 | [text:delivery.pref (autofill:postal:pref placeholder="自動入力")] |
| 市区町村 | [text:delivery.city (autofill:postal:city placeholder="自動入力")] |
| 町名・番地 | [text:delivery.address (autofill:postal:town placeholder="自動入力 + 番地を追記")] |
| 建物名・部屋番号 | [text:delivery.building (placeholder="○○マンション 101号室")] |
| 電話番号 | [text:delivery.phone (placeholder="03-1234-5678")] |

## ご依頼主

| 項目 | 入力フィールド |
| --- | --- |
| お名前 | [text:sender.name (placeholder="佐藤 花子")] |
| 郵便番号 | [search:sender.zip (autofill:postal:zip placeholder="例: 100-0001")] |
| 都道府県 | [text:sender.pref (autofill:postal:pref placeholder="自動入力")] |
| 市区町村 | [text:sender.city (autofill:postal:city placeholder="自動入力")] |
| 町名・番地 | [text:sender.address (autofill:postal:town placeholder="自動入力 + 番地を追記")] |
| 建物名・部屋番号 | [text:sender.building (placeholder="○○ビル 5F")] |
| 電話番号 | [text:sender.phone (placeholder="03-9876-5432")] |

## 荷物情報

| 項目 | 入力フィールド |
| --- | --- |
| 品名 | [text:package.item (placeholder="衣類、書籍など")] |
| サイズ | [select:package.size (options="60cm;80cm;100cm;120cm;140cm;160cm")] |
| 配送希望日 | [date:package.delivery_date] |
| 配送時間帯 | [select:package.time_slot (options="指定なし;午前中;12-14時;14-16時;16-18時;18-20時;19-21時")] |

---

## このデモの特徴

### 1. 複数の住所を独立して管理

このフォームでは、**お届け先**（`delivery.*`）と**ご依頼主**（`sender.*`）の2つの住所グループを使用しています。
それぞれの郵便番号を入力すると、**同じグループ内の住所フィールドのみが自動補完**されます。

- `delivery.zip` を入力 → `delivery.pref`、`delivery.city`、`delivery.address` が自動入力
- `sender.zip` を入力 → `sender.pref`、`sender.city`、`sender.address` が自動入力
- お互いに影響しません

### 2. 住所以外のフィールドも同じグループに含められる

`delivery.name`、`delivery.phone`、`delivery.building` などの住所以外のフィールドも同じグループに含めることができます。
これにより、データの整理と管理が容易になります。

### 3. スマートな住所補完

**個別フィールド（都道府県・市区町村）がある場合**:
- `delivery.pref` には「東京都」
- `delivery.city` には「港区」
- `delivery.address` には「芝公園」（町名のみ）

**住所一体型フィールドのみの場合**:
- `address` フィールドに「東京都港区芝公園」（完全な住所）

このように、既に入力されている部分を除いた残りの部分が自動的に補完されます。

### 4. オフラインで動作

約12万件の郵便番号データをGzip圧縮してHTML内に埋め込んでいるため、
インターネット接続なしでも高速に住所検索が可能です。

---

## 技術的な書き方のポイント

### グループプレフィックスの使用（必須）

フィールド名に`グループ名.フィールドタイプ`の形式を使用します：

```markdown
| 郵便番号 | [search:delivery.zip] |
| 都道府県 | [text:delivery.pref] |
| 市区町村 | [text:delivery.city] |
```

セパレータ: ドット（`.`）、アンダースコア（`_`）、ハイフン（`-`）のいずれかが使用できます。

### 郵便番号フィールド

`search` タイプを指定し、フィールドタイプに `zip`、`postal`、`郵便` のいずれかを含めます：

```markdown
[search:delivery.zip (placeholder="例: 105-0011")]
```

3桁以上の入力で候補がドロップダウン表示されます。

### 自動入力先のフィールド

以下のフィールドタイプが認識されます：

- **都道府県**: `pref` または `都道府県`
- **市区町村**: `city` または `市区町村`
- **町名・住所**: `town`、`address`、`町`、`住所`

同じグループ内のこれらのフィールドが自動的に補完されます。
