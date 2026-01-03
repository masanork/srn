---
title: "必須入力デモ (Validation)"
layout: form
---

# ユーザー登録フォーム

必須項目を含むバリデーション機能のデモです。
必須項目（`(required)`と指定）が全て入力されるまで、画面下部の「Submit」ボタンは有効になりません。

## 基本情報

| 項目 | 入力 |
|---|---|
| 氏名 | [text:user.name (required placeholder="山田 太郎")] |
| 年齢 | [number:user.age (required placeholder="20")] |
| メール | [text:user.email (placeholder="省略可")] |

## アンケート

| 質問 | 回答 |
|---|---|
| 性別 | [radio:user.gender] <br> - 男性 <br> - 女性 <br> - その他 |
| 利用規約 | [checkbox:terms.agreed (required)] 利用規約に同意します |

---

全ての必須項目を入力すると、提出ボタンが押せるようになります。
