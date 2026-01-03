---
title: "Web/A LTV 実装状況分析とアクションプラン"
layout: article
author: "Web/A Technical Lead"
date: 2026-01-03
description: "Web/A LTV ホワイトペーパーと現状の実装（IdentityManager, LayoutManager）とのFit & Gap分析、およびPruning戦略の実装計画。"
ai_generated: true
simulated_governance: true
---

## 1. 概要

Web/A プロジェクトが目指す「自律的な長期的検証性 (Long-Term Validation)」の世界観に対し、現在の `srn` リポジトリにおける実装状況 (`src/ssg/IdentityManager.ts`, `LayoutManager.ts`) を照らし合わせ、その適合度と乖離（Fit & Gap）を分析した。

結論として、**コアとなるアーキテクチャ（4層モデル、PHC）は実装済み**であるが、運用を長期継続するための**「枝刈り（Pruning）」ロジック**および**「失効情報（CRL）」の取り扱い**において機能不足が確認された。

## 2. 現状分析 (Fit & Gap)

### 2.1. 適合している点 (Fit)

*   ✅ **Rebuild Paradox の解決 (Stable Signatures)**
    *   **要件**: システムリビルド時に、コンテンツ（L2）の署名を作り直さず、オリジナルの署名時刻を維持する。
    *   **実装**: `IdentityManager.signDocument` 内でコンテンツハッシュに基づく `signatureStore` のルックアップが実装されており、変更がない場合は既存の VC を返却し、L3 チェーンにイベントのみを追加する挙動が確認された。
*   ✅ **L3 Prunable Hash Chain (PHC)**
    *   **要件**: 文脈情報の履歴を改竄不能なチェーンとして管理する。
    *   **実装**: `src/core/phc.ts` にて仕様通り実装されており、`Genesis`, `MetadataUpdate`, `L4Rebuild` 等のイベントタイプが定義されている。
*   ✅ **L4 Container Signature**
    *   **要件**: HTML 表現層の改竄検知。
    *   **実装**: `LayoutManager.ts` にて、最終的な HTML 生成物のハッシュ値を署名するロジックが実装されている。

### 2.2. 乖離している点 (Gap)

| 分野 | 世界観 (Ideal) | 現状 (Current) | 課題 |
| :--- | :--- | :--- | :--- |
| **Pruning (枝刈り)** | コンテナサイズ肥大化を防ぐため、古い履歴の詳細を削除しハッシュのみ残す。 | `PrunableHashChain.prune()` メソッドは存在するが、**SSG ビルドプロセス内でこれを呼び出すロジックが存在しない**。 | ビルドを重ねるごとに `weba-context-chain` が肥大化し続ける。 |
| **Trust Store** | オフライン検証のために DID Doc, **CRL, OCSP** を同梱する。 | `didDocuments` の埋め込みのみ実装されている。失効情報を格納するフィールドがスキーマに存在しない。 | カード紛失時などの失効検証がオフラインで機能しない。 |
| **Trusted Timestamp** | 第三者機関 (TSA) による時刻証明。 | ローカルシステム時刻 (`new Date()`) のみ。 | 署名鍵の有効期限切れ後の真正性証明が弱い（自己申告時刻であるため）。 |

## 3. アクションプラン

本分析に基づき、以下の改修計画を提案する。

### Phase 1: Pruning Strategy の実装 (優先度: 高)
無限の肥大化を防ぐため、`IdentityManager` に「自動枝刈り」ロジックを追加する。

*   **実装内容**:
    *   `signDocument` 処理後にチェーン長をチェック。
    *   **"Keep Genesis + Latest N"**: Genesis（作成時証明）と最新の N個（直近の変更）のイベント詳細（Payload）を保持し、それ以外の中間イベントは `prune()` して Payload を破棄する。
    *   デフォルト設定: `Latest 5` 程度を想定。

### Phase 2: Trust Store スキーマの拡張 (優先度: 中)
将来的な CRL/OCSP 対応を見据え、埋め込みデータの構造を拡張する。

*   **変更前**: `{ didDocuments: [...] }`
*   **変更後**:
    ```json
    {
      "didDocuments": [...],
      "revocationList": [], // 将来用
      "trustedTimestamps": [] // 将来用
    }
    ```

### Phase 3: Verifier への反映 (優先度: 中)
クライアントサイドの検証ロジック (`verifier.ts`) が、上記の埋め込みデータ（特に PHC と Trust Store）を正しく解釈し、検証結果画面に反映するように改修する。現在は署名の検証のみで、チェーンの検証までは UI に表示されていない可能性がある。

## 4. 結論

Web/A LTV の基盤は整っているが、実運用（数百回のリビルド）に耐えうる状態にするには **Phase 1 (Pruning)** の実装が急務である。これを次回の開発スプリントにて実施することを推奨する。
