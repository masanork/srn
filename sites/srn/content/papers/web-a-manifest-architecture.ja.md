---
title: "Web/A Manifest Architecture: The Pack & Prune Strategy (JA)"
description: "Web/Aの自己完結性（Single File）と長期検証性（LTV）を両立する「マニフェスト・アーキテクチャ」の技術仕様。"
layout: article
date: 2026-01-02
author: "Masanori Kusunoki"
lang: ja
---

# Web/A Manifest Architecture: The Pack & Prune Strategy

## 1. Context & Problem Statement

Web/Aの4レイヤーモデルにおいて、**Layer 1 (Template)** はアプリケーションの「定義」であり、**Layer 2 (User Data)** はその「インスタンス」である。
しかし、高機能なフォームアプリケーションを単一のHTMLファイル（Single File Application）として配布しようとすると、以下の問題が発生する。

*   **Bloat (肥大化):** 郵便番号辞書、フォントファイル、レンダリングエンジン（Mermaid等）、大規模なマスターデータを含めると、ファイルサイズが数MB〜数十MBに膨れ上がる。
*   **Update Paradox (更新のパラドックス):** 郵便番号辞書が更新されるたびに、テンプレート全体の再署名と再配布が必要になる。
*   **Verification Rigidity (検証の硬直性):** 外部リソース（CDN等）に依存すると「数十年後の検証（LTV）」が保証できないが、全てを埋め込むと「捨てられない（Prunableでない）」データになる。

## 2. Solution: L1-Core & L1-Manifest

この問題を解決するために、L1を **「不変の核 (Core)」** と **「可変・参照可能なリソース (Manifest)」** に分離し、**ManifestManager** によって統一的に管理する。

### 2.1 Architecture Overview

*   **L1-Core (Minimal Template):**
    *   スキーマ定義、バリデーションロジック、UI構造のみを含む軽量なHTML/JSON。
*   **L1-Manifest:**
    *   アプリケーションが必要とする全ての「重い」リソース（Blobs）のリスト。
    *   各Blobは **Content-Addressed (Digest)** で管理される。
*   **Blobs (Heavy Resources):**
    *   郵便番号辞書 (`.json.gz`)
    *   サブセット化されたフォント (`.woff2`)
    *   JavaScriptランタイム (`mermaid.min.js` 等)
    *   大規模マスターデータ

### 2.2 The "Pack First, Prune Later" Strategy

Web/Aは「オフラインで動き、かつ長期間検証可能である」必要がある。これを実現するのが **Pack & Prune** 戦略である。

1.  **Pack (Distribution Phase):**
    *   ビルド時、全てのBlobは **Base64エンコードされ、HTML内の `<script>` タグとして埋め込まれる**。
    *   マニフェストは `urls: ["#dom-id", "https://external/url"]` のように、**DOM内参照を優先** するよう記述される。
    *   これにより、ユーザーは単一のHTMLファイルを受け取るだけで、ネット接続なしに完全な機能を利用できる。

2.  **Prune (Archival Phase):**
    *   署名・完了後、ファイルサイズを削減するために **埋め込まれたBlob（`<script>`タグ）を削除（Prune）してもよい**。
    *   削除後もマニフェスト内の `Digest` は残るため、検証性は損なわれない。
    *   再検証や表示の際は、マニフェストの `Secondary URL`（外部アーカイブやIPFS等）からBlobを再取得することで、完全に元の状態を復元できる。

## 3. Data Structures

### 3.1 Master Data Reference (Blob Entry)

```typescript
export interface MasterDataRef {
  /** Resource ID (e.g., "font-noto-sans", "jp-postal") */
  id: string;
  /** SHA-256 Digest of the raw content */
  digest: string;
  /** MIME type (e.g., "font/woff2", "application/json") */
  mediaType: string;
  /** Original size in bytes */
  size: number;
  /** Retrieval locations (Priority order) */
  urls: string[]; 
  // e.g. ["#weba-blob-abc...", "./data/blobs/abc..."]
}
```

### 3.2 Web/A Layer 2 Context (The Binding)

L2データ（ユーザー入力）は、単なる値の集合ではない。**「どのテンプレートと、どのリソースセット（マニフェスト）を使って作成されたか」** を暗号的に束縛する。

```typescript
export interface WebALayer2Context {
  /** Reference to the L1-Core used */
  templateRef: {
    id: string;
    digest: string;
  };
  /** Reference to the Manifest used */
  manifestDigest: string;
  /** 
   * List of active blob digests actually relied upon.
   * (e.g. The specific version of the Postal Dictionary used)
   */
  activeBlobDigests: string[];
}
```

この `Context` が L2 Payload に含まれ、ユーザーの秘密鍵で署名されることで、**「表示・入力環境の完全性」** が保証される。

## 4. ManifestManager Implementation

SRN (Sorane) SSG に実装された `ManifestManager` は、ビルドプロセスにおいて以下の役割を担う。

1.  **Blob Detection:** 
    *   Markdown内のフォント指定、Mermaid記法、郵便番号フィールド等を自動検出する。
2.  **Deduplication & Hashing:**
    *   リソースのSHA-256ハッシュを計算し、重複を排除して登録する。
3.  **Injection:**
    *   HTMLの末尾に `window.__WEBA_MANIFEST` と、Base64化されたBlobデータを注入する。
4.  **Runtime Bootstrapping:**
    *   クライアントサイド（ブラウザ）で動作する軽量なランタイムを注入する。
    *   このランタイムは、マニフェストを読み込み、フォントの適用（`@font-face`）、JSの実行、辞書データのロードを動的に行う。

## 5. Verification Flow

### Level 1: Lightweight Verification (Structure & Signature)
*   L2署名の検証。
*   `Context` 内の `templateDigest` と `manifestDigest` の形式チェック。
*   **Blob本体がなくても検証可能。**（「何を使ったか」の記録は改ざんされていないことが保証される）

### Level 2: Full Verification (Reproduction)
*   マニフェストに記載された `digest` を持つBlobを、埋め込みまたは外部から取得。
*   Blobのハッシュ値が `digest` と一致することを確認。
*   そのBlob（正しいフォント、正しい辞書、正しいレンダラー）を用いて、画面表示や計算ロジックを完全に再現する。

## 6. Conclusion

Manifest Architecture により、Web/Aは **"Single File Distribution" (使いやすさ)** と **"Cryptographic Binding" (信頼性)**、そして **"Prunability" (持続可能性)** を同時に達成した。これは「文書」としてのWebアプリケーションにおける、新しい標準モデルとなる。



---



## 7. 付録：開発ツール（Form Maker）における適用



### 7.1. 仮想マニフェストによる動的プレビュー

Web/A の作成ツール (Form Maker) におけるプレビュー機能では、都度 Base64 エンコード（Pack）を行うコストを避けるため、**「仮想マニフェストによる動的ロード」** を採用する。



*   **「Pruned（剥離）」状態のシミュレーション**:

    *   プレビュー環境は、意図的に「Blob実体が削除された状態」として構築される。

    *   生成される HTML には巨大な `<script>` タグは埋め込まず、代わりに `window.__WEBA_MANIFEST` に開発サーバー上の Asset URL（例: `/assets/mermaid.min.js`）を直接記述する。

*   **ランタイムの再利用**:

    *   Web/A の標準ランタイムは `urls` のフォールバック機構（DOM参照がなければHTTP取得）を持っているため、Maker 専用のローダーを実装することなく、本番と同じロジックでアセットを動的にロード・実行できる。



これにより、開発者は軽量かつ高速に、本番同等の機能（郵便番号辞書やレンダリングエンジン）を確認しながら編集作業を行うことが可能となる。
