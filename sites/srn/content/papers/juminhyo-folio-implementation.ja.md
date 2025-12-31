---
title: "Web/A Folioに基づく住民票電子交付の実装提案"
layout: article
author: "Sorane Project"
date: 2025-12-31
description: "総務省要件を満たす住民票電子交付のFolioアーキテクチャ実装案。CLIによるPoC構成を含む。"
ai_generated: true
---

# Web/A Folioに基づく住民票電子交付の実装提案

## 1. 概要

本提案は、[住民票の写し等の電子交付における要件](./juminhyo-digital.ja.md)で整理された総務省の要求仕様に対し、**Web/A (Web Archive)** 規格および **Folio** アーキテクチャを用いた具体的な実装方式を定義するものである。

特に、Folio CLI を用いた Proof of Concept (PoC) を早期に実施可能な構成とし、**「プライバシー保護」「セキュリティ」「法的要件への適合」**を包括的に解決する。

## 2. アーキテクチャ構成案

### 2.1 構成要素 (Folio Model)

Web/A Folio モデルにおける住民票は、以下の構造を持つ「自己完結型HTML」として実装される。

| レイヤー | コンポーネント | 実装内容 |
| :--- | :--- | :--- |
| **Layer 1 (Template)** | `juminhyo.html` | 自治体ごとのレイアウト定義、行政標準文字フォント、SVG外字を含む不変テンプレート。 |
| **Layer 2 (Data)** | `payload.json` | 住民基本台帳から抽出された構造化データ (JSON-LD)。HPKEにより暗号化され、本人または正当な受領者のみが復号可能。 |
| **Layer 3 (Context)** | `manifest` | 発行者（自治体首長）の電子署名 (Ed25519 + ML-DSA-44 Hybrid)、有効期限、発行ID。 |
| **Layer 4 (View)** | `renderer.js` | 閲覧環境（PC/スマホ/印刷）に応じて表示を動的に切り替えるCSS/JSロジック。 |

### 2.2 暗号化とプライバシー (Vault & Passkey)

従来の「マイナンバーカード読み取り」を毎回要求する方式と異なり、Folioでは **Vault (保管庫)** の概念を導入する。

1.  **発行時 (Issuance)**:
    *   住民はマイナンバーカードを用いたJPKI認証を行う。
    *   同時に、自身のデバイス（スマホ等）の **Passkey (WebAuthn)** 公開鍵を登録する。
    *   自治体はデータを **Passkeyで復号可能な形式 (HPKE)** で暗号化し、Web/A 文書に封入する。

2.  **保管時 (Storage - Folio Vault)**:
    *   住民の手元にある Web/A ファイルは暗号化されている。
    *   これを「Folio Vault」として、クラウドストレージ（iCloud/Google Drive）等に安全にバックアップ可能（プラットフォーマーによる検閲・閲覧は不可能）。

3.  **提示時 (Presentation)**:
    *   窓口で Web/A ファイルを開くと、ブラウザが Passkey 認証（指紋・顔）を要求。
    *   認証成功時のみ、ブラウザメモリ上で一時的に復号・レンダリングされる。
    *   **スクリーンショット対策**: 提示モードでは動的な透かし（現在時刻・窓口ID等）を表示し、静的なキャプチャによる使い回しを心理的・技術的に抑止する。

## 3. PoC 実装構成 (Folio CLI)

Folio CLI を用用いたデモシナリオおよびディレクトリ構成案を以下に示す。

### 3.1 ディレクトリ構成

```text
/juminhyo-poc/
├── .folio/                  # Folio設定
│   ├── keys/                # 署名鍵 (本来はHSM管理だがPoCではローカル)
│   │   ├── issuer.sk        # 市長署名用秘密鍵 (Ed25519)
│   │   └── holder.pk        # 住民Passkey公開鍵 (シミュレーション用)
│   └── profiles/
│       └── koufu-standard/  # 交付プロファイル設定
├── templates/
│   └── juminhyo-v1.html     # Layer 1: HTMLテンプレート (Handlebars等)
├── data/
│   └── input-sample.json    # Layer 2: 住民データ (JSON-LD)
└── output/                  # 生成物
    └── juminhyo-issued.html # 発行済み Web/A ファイル
```

### 3.2 データモデル (JSON-LD)

`data/input-sample.json` の構成例。MIC標準仕様に準拠したボキャブラリを想定。

```json
{
  "@context": ["https://w3id.org/srn/v1", "https://schema.org"],
  "type": ["VerifiableCredential", "JuminhyoCertificate"],
  "issuer": {
    "id": "did:web:city.example.jp",
    "name": "〇〇市長"
  },
  "credentialSubject": {
    "juminCode": "12345678901",
    "address": "〇〇市〇〇区... (行政標準文字コード)",
    "residents": [
      {
        "name": "Sorane Taro",
        "birthDate": "1990-01-01",
        "relationship": "世帯主",
        "gaiji": {
            "char_01": "data:image/svg+xml;base64,..."
        }
      }
    ]
  },
  "issuanceDate": "2025-12-31T10:00:00Z"
}
```

### 3.3 CLI 操作フロー (PoCシナリオ)

**1. 発行 (Issuance)**
自治体システム役としての操作。

```bash
# 入力データをテンプレートに流し込み、市長鍵で署名し、住民鍵で暗号化してHTML生成
folio issue \
  --template templates/juminhyo-v1.html \
  --data data/input-sample.json \
  --signer .folio/keys/issuer.sk \
  --encrypt-for .folio/keys/holder.pk \
  --output output/juminhyo-issued.html
```

**2. 検証 (Verification)**
民間窓口役としての操作。

```bash
# 署名の真正性と、データ構造の整合性を検証
folio verify output/juminhyo-issued.html
> ✅ Issuer Signature Valid (City of Example)
> ✅ Data Integrity Verified
> 🔒 Content Encrypted (Requires Holder Auth)
```

**3. 閲覧 (Presentation - Browser)**
`output/juminhyo-issued.html` をブラウザで開く。
- WebAssembly (WASM) ランタイムが起動。
- ユーザーに Passkey 認証を要求。
- 復号後、正規の住民票レイアウト描画。

## 4. 総務省要件への対応マトリクス

| 要件カテゴリ | 具体的要求 | Web/A Folio 実装における解決策 |
| :--- | :--- | :--- |
| **真正性** | 改ざん・偽造防止 | **発行者署名**: 市長の電子署名をHTML内部に埋め込み、単独ファイルで検証可能にする。 |
| **同一性** | 券面とデータの整合 | **Web/A HMP**: 表示(HTML)とデータ(JSON)を不可分な単一パッケージとして署名。 |
| **不正防止** | スクショ・使い回し | **Identity Binding**: 閲覧時にPasskey認証を必須化。単なるファイルコピーでは閲覧不可（復号できない）。 |
| **互換性** | 独自アプリ不要 | **標準ブラウザ機能**: 検証・復号ロジックはWASMとしてHTMLに内蔵。専用アプリ不要。 |
| **外字** | 正確な文字表現 | **SVG/Webフォント**: テンプレートにベクターデータを埋め込み、環境依存文字化けを排除。 |

## 5. 次のステップ

1.  **プロトタイプ実装**: 上記構成に基づく `juminhyo-v1.html` テンプレートの作成。
2.  **CLI機能拡張**: `folio issue` コマンドにおける暗号化オプションの実装確認。
3.  **デモシナリオ構築**: 総務省WG提示用の実演手順書の作成。
