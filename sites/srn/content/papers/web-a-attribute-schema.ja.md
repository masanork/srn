---
title: "技術仕様: Web/A 属性スキーマと信頼レベル (LoA) 管理"
layout: article
author: "Sorane Project"
date: 2026-01-02
description: "Web/A Folio における階層的識別子と信頼レベルの定義。データ統合とAIによる自動入力を支える基盤仕様。"
---

# Web/A 属性スキーマと信頼レベル (LoA) 管理

## 1. はじめに

Web/A エコシステムにおいて、**Folio** はユーザー中心のデータコンテナとして機能します。AI エージェントが書類作成（プレフィル）を支援するためには、個人の属性（名前、住所、資格など）を一意識別し、その情報の「確かさ（信頼性）」を管理する堅牢な仕組みが必要です。

本ドキュメントでは、**Web/A 属性スキーマ (WAS: Web/A Attribute Schema)** を定義します。これは、フォームの入力項目と Folio 内のデータソースを階層的に紐付け、同時に **信頼レベル (LoA: Level of Assurance)** を厳格に管理するための仕様です。

## 2. 識別子の階層構造

Web/A では「DID をルートとする」アプローチを採用し、グローバルに一意で、低コスト、かつ所有者自身で検証可能な識別子を構成します。

### 2.1. フォーム識別子 (WFI: Form Identifier)
すべての Web/A フォームは、グローバルに一意な識別子を持ちます。
- **形式**: `did:web:<domain>[:path]#<form-slug>`
- **例**: `did:web:srn.site:examples#postal-demo`
- **役割**: ドキュメントの種類と、その公式な発行元（ドメイン）を特定します。

### 2.2. 属性識別子 (WAI: Attribute Identifier)
属性は、フォームまたはコンテキストを基準としたパスによって識別されます。
- **形式**: `<WFI>#<attribute-path>` または `<ContextID>#<attribute-path>`
- **パス構造**: スラッシュ区切りの階層文字列（例: `delivery/address/postalCode`）。
- **例**: `did:web:srn.site:examples#postal-demo#delivery/zip`

## 3. 信頼レベル (LoA) の定義

属性の信頼性は、その信頼レベル (LoA) によって分類されます。正本（真実のソース）となるフォーマットは、要求される LoA によって決定されます。

| レベル | 名称 | 正本フォーマット | データソース |
| :--- | :--- | :--- | :--- |
| **LoA 0** | AI メモリ | **Vector DB / JSON** | AI による推論、対話履歴、一時的なコンテキスト。 |
| **LoA 1** | 自己申告 (Self-asserted) | **Markdown / YAML** | 本人による入力、メモ、`profile.md` |
| **LoA 2** | 検証済み (Verified) | **JSON / VC** | 組織（企業、学校）による電子署名付き。 |
| **LoA 3** | 高信頼 (High-Assurance) | **署名付き VC** | 公的個人認証（マイナンバー、パスポート）等で確認。 |

### 3.1. LoA 0: AI メモリと推論
LoA 0 は、AI がやり取りの中で「学習」または「推測」した情報を指します。
- **性質**: 一時的であり、ハルシネーション（誤情報）を含む可能性があります。人間の明示的な確認を経ていません。
- **昇格**: ユーザーが LoA 0 の内容を確認し、テキストファイル等に保存した時点で **LoA 1** へ昇格します。
- **透明性**: エージェントは LoA 0 のデータを提案する際、それが推論に基づくものであることを明示しなければなりません。

### 3.2. 人間可読性と LoA の関係
- **LoA 1 データ**: 人間による「直接編集・修正」のしやすさを優先します。JSON は検索や自動化のための「派生物（Cache）」です。
- **LoA 2+ データ**: 暗号的な「完全性」を優先します。人間向けの表示（HTML/Markdown）は「派生物（View）」です。
- **失効ルール**: LoA 2+ のデータをユーザーがテキストエディタ等で改ざんした場合、そのデータの LoA は直ちに **LoA 1 にダウングレード** されます。

## 4. マッピングと自動化

AI エージェントによる「自律的なプレフィル」を実現するため、Web/A フォームはフラットなフィールド ID と、階層的な属性スキーマをマッピングします。

### 4.1. マッピングの定義案 (Frontmatter)
フォーム側の設定例：
```yaml
form: "did:web:srn.site:examples#postal-demo"
attributes:
  delivery/zip:
    field: "delivery.zip"   # Markdown上のID
    required_loa: 1         # 届け先は自己申告で良い
  sender/name:
    field: "sender.name"
    required_loa: 3         # 依頼主は本人確認済みを推奨
```

### 4.2. 出所（Provenance）の追跡
エージェントが値を埋める際、その値が「どこから、どの精度で」きたかを記録します：
```json
{
  "field": "sender.name",
  "value": "世田谷 太郎",
  "loa": 3,
  "source": "folio/certificates/id-binding.json",
  "method": "mcp:folio_read"
}
```

## 5. Folio 内でのディレクトリ・マッピング

Folio のディレクトリ構造は、LoA の分離を反映します。
- `profile.md`: LoA 1 属性（名前、メール等）のプライマリ・ホーム。
- `certificates/`: 公式な VC（LoA 2+）。
- `history/`: 過去の送信履歴。文脈的な参照先。

## 6. おわりに

人間中心の LoA 1（Markdown）と、システム中心の LoA 2+（Machine-readable）を厳格に切り分け、共通の階層 ID で結びつけることで、Web/A Folio は「AI が個人の事務を安全に代行できる」直感的かつセキュアなワークスペースを提供します。
