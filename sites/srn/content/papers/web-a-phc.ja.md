---
title: "Web/A Prunable Hash Chain (PHC) 仕様書"
date: 2026-01-01T12:00:00+09:00
lang: ja
license: "CC-BY-4.0"
schema: "https://masanork.github.io/srn/schemas/weba-v1.json"
tags: ["spec"]
---

# Web/A Prunable Hash Chain (PHC) 技術仕様書

Ver 0.1.0 (Draft)

## 1. 概要 (Abstract)

Web/A の **Layer 3 (Context)** は、単なるメタデータ置き場ではなく、文書のライフサイクル全体を記録する **分散型監査台帳 (Micro-Ledger)** として機能する。
**Prunable Hash Chain (PHC)** は、この台帳を実現するためのデータ構造であり、以下の特性を持つ：

1.  **改ざん不可能性 (Immutability)**: 各イベントは前のイベントのハッシュを含み、暗号的な鎖を形成する。
2.  **検証可能性 (Verifiability)**: 最初の発行 (Genesis) から現在の状態までの正当性を、第三者がオフラインで検証できる。
3.  **剪定可能性 (Prunability)**: 配送経路のプライバシー保護やデータ軽量化のため、検証に不要な「枝葉」の履歴データを削除（Prune）しても、メインチェーンの整合性が維持される。

## 2. データ構造 (Data Structure)

PHC は、JSON-LD オブジェクトの配列（Chain）として表現される。

### 2.1. Block Structure

各ブロック（イベント）は以下の共通構造を持つ。

```json
{
  "id": "urn:uuid:...",
  "type": ["VerifiableEvent", "RebuildEvent"],
  "prev": "sha256:...", // 親ブロックのハッシュ
  "created": "2026-01-01T12:00:00Z",
  "actor": "did:web:issuer.example.com",
  "data": { ... }, // イベント固有データ
  "proof": { ... } // イベント署名
}
```

### 2.2. Pruning Mechanism (Merkle-ized L3)

単純なリンクリストではなく、イベントをマークル木（Merkle Tree）として構成することで、剪定を可能にする。

*   **Full History**: 発行者や監査機関はすべての履歴を持つ。
*   **Pruned History**: エンドユーザーには、「発行事実」と「最新の状態」をつなぐ最小限のパス（Merkle Proof）のみを提供する。配送業者の内部ログなどはハッシュのみを残して本体を削除できる。

## 3. 主要イベントタイプ

### 3.1. Genesis (Issue)
文書が最初に生成されたイベント。
*   **Payload**: L1 (Schema) ハッシュ, L2 (Data) ハッシュ。
*   **Signer**: Issuer。

### 3.2. Rebuild (Presentation Update)
"Rebuild Paradox" を解決するための核心イベント。L4 (Presentation) が更新されたことを記録する。
*   **Payload**: 
    *   旧 L4 ハッシュ（オプション）
    *   新 L4 構造のメタデータ（使用したテンプレートIDなど）
    *   **Reason**: "Security Update", "Design Refresh" etc.
*   **検証**: これにより、L2 の署名時刻が古くても、「正当な権限者によって最新のデザインに包み直された」ことが証明される。L2本体の再署名は不要である。

### 3.3. Transfer (Custody Change)
文書の保管者が変わったことを記録する（Folio間の移動など）。
*   **Payload**: 配送プロトコル情報、受信者の公開鍵ハッシュ（オプション）。

### 3.4. Metadata Update (Context Update)
L1/L2の核となる事実に影響を与えない、周辺メタデータの変更を記録する。
-   **Payload**: 変更されたフィールド（例：`tags`, `license`, `status`）とその新しい値。
-   **特性**: これにより、L2の再署名を行うことなく、検索性の向上やポリシーの変更（ライセンス変更等）を「正当な更新」として行える。

### 3.5. Verification (Audit Log)
「誰かが検証に成功した」事実を記録する。
*   **Payload**: 検証時点のタイムスタンプ、検証結果 (Valid/Invalid)。
*   **用途**: 改ざん検知のチェックポイントとして機能する。

## 4. 署名と検証フロー

### 4.1. チェーンの検証
検証者（Verifier）は以下の手順で L3 を検証する。

1.  **Genesis検証**: 最初のブロックが、信頼できる発行者 (Issuer) によって署名されているか。
2.  **リンク検証**: 各ブロックの `prev` ハッシュが、直前のブロックのハッシュと一致するか。
3.  **署名検証**: 各ブロックの署名またはハッシュが正当か。

### 4.2. L4 との結合
最新の L4 (HTMLファイル) は、その時点での **PHC Head Hash (最新ブロックのハッシュ)** を `meta` タグまたは不可視署名領域に含んで署名される。
これにより、「このHTMLコンテナは、この履歴の最新状態を包んでいる」ことが暗号的に拘束される。

## 5. 今後の課題

*   **JSON-LD Signatures との整合**: W3C VC Data Integrity 証明とどう共存させるか。
*   **Compactness**: チェーンが長くなった場合の圧縮アルゴリズム（スナップショット化）。
