---
title: "Web/A Post デプロイメント戦略・アーキテクチャ比較"
layout: article
author: "Sorane Project Strategy Team"
date: 2025-12-31
description: "Web/A Postの実装におけるプラットフォーム選定。Cloudflare, Supabase, Firebase, 国内IaaSの比較と、AI親和性・コスト・データ主権に基づく推奨構成。"
ai_generated: true
---

# Web/A Post デプロイメント戦略・アーキテクチャ比較

Web/A Post（知的郵便拠点）は、個人のデータ主権を守るための「エージェント」であるため、特定の巨大プラットフォーマーに依存しきってしまう（ロックインされる）ことは避けなければなりません。
一方で、個人が安価に（できれば無料で）、かつ高度なAI機能を享受できる環境も必要です。

本ドキュメントでは、Web/A Post の永続化・デプロイ先としてのプラットフォームを比較検討し、アーキテクチャ設計の方針を定めます。

## 1. アーキテクチャ基本方針：Hexagonal Architecture

特定のクラウドに依存しないため、**「コアロジック（Hub）」**と**「外部アダプター（Storage/Network）」**を明確に分離します。

- **Core (Domain)**:
    - ルールエンジン、DID解決、権限管理。
    - **依存なし**（Pure TypeScript）。どこでも動く。
- **Ports (Interfaces)**:
    - `IStorage`: エンベロープの保存、ルールの読み込み。
    - `IIdentity`: DID解決、署名検証。
- **Adapters (Infrastructure)**:
    - **Cloudflare D1 / KV / R2** (Edge)
    - **Supabase (PostgreSQL / pgvector)** (Serverless)
    - **Firebase Firestore** (mBaaS)
    - **Local FileSystem** (Self-hosted / Docker)

---

## 2. プラットフォーム比較

### A. Cloudflare (Workers + D1 + R2)
**「エッジでさばく、最速・最安の郵便局」**

- **概要**: 全世界に分散されたエッジでJavaScriptを実行。
- **Web/A Post との相性**: **最高 (Best Match)**。
    - Postの役割は「ルーティング」と「一時保管」であり、エッジの特性に合致する。
    - Bun / Node 互換性が向上しており、移植が容易。
- **AI親和性**: **Workers AI** が利用可能。Llamaなどの推論をエッジで安価に実行できる。
- **コスト**:
    - **Free Tier**: 1日10万リクエストまで無料。個人利用ならほぼ無料。
    - **D1 (SQLite)**: 読み書きコストが極めて低い。
- **懸念点**: SQLiteベースのため、複雑なベクター検索などはVectorize等の追加構成が必要。

### B. Supabase (Edge Functions + PostgreSQL)
**「AI検索とリレーショナルデータの強力な母艦」**

- **概要**: Firebase代替のOSS筆頭。PostgreSQLをフル活用できる。
- **Web/A Post との相性**: **良 (Great)**。
    - 構造化データ（VCのメタデータなど）のクエリに強い。
    - **pgvector** が標準で使えるため、受け取ったメッセージをEmbeddingして「意味検索」するAI検索機能が実装しやすい。
- **AI親和性**: 非常に高い。DB層でベクトル検索が完結する。
- **コスト**:
    - **Free Tier**: 500MBデータベース無料。個人利用には十分。
    - インスタンスがスリープする制限があるが、Postのような常時待受には少し工夫が必要（Edge Functionsなら回避可）。
- **懸念点**: エッジ（Functions）の起動速度はCloudflareに劣る場合がある。

### C. Firebase (Cloud Functions + Firestore)
**「開発速度最優先の安定解」**

- **概要**: Googleが提供するmBaaS。
- **Web/A Post との相性**: **可 (Good)**。
    - FirestoreのNoSQLモデルは、JSONドキュメント（VC）の保存に親和性が高い。
    - 認証周り（Firebase Auth）が強力だが、Web/AはDID認証を使うためメリットは薄い。
- **AI親和性**: Vertex AI Extensions など連携は強力だが、設定が複雑になりがち。
- **コスト**:
    - **Free Tier**: Sparkプラン（無料）はあるが、Cloud Functions（外部通信必須）を使うにはBlaze（従量課金）が必須となるケースが多い。ここが最大のネック。
- **懸念点**: **ベンダーロックイン**が最も強い。Googleの仕様変更に強く依存する。

### D. さくらインターネット / 国内VPS (Docker)
**「データ主権と自律性の最後の砦」**

- **概要**: 仮想サーバー（VPS/IaaS）上にコンテナとしてデプロイ。
- **Web/A Post との相性**: **「主権」観点で必須**。
    - 米国法（Cloud Act）の影響を受けない国内データセンターを選択可能。
    - Bun + SQLite の構成を Dockerイメージ化すれば、そのまま動く。
- **AI親和性**: マシンパワー次第。GPUなしインスタンスではAI推論は重い（外部API依存になる）。
- **コスト**:
    - **有料**: 月額数百円〜。無料枠はないことが多い。
    - しかし「定額」であるため、攻撃を受けても請求が青天井にならない安心感がある。

---

## 3. 総合評価マトリクス

| 項目 | **Cloudflare** | **Supabase** | **Firebase** | **Sakura / VPS** |
| :--- | :--- | :--- | :--- | :--- |
| **アーキテクチャ適合** | ◎ (Edge Router) | ◯ (Database) | ◯ (Event Driven) | ◯ (Server) |
| **AI親和性 (Vector)** | ◯ (Vectorize) | **◎ (pgvector)** | △ (要拡張) | △ (Self-host) |
| **コスト (個人運用)** | **◎ (ほぼ無料)** | ◯ (枠内無料) | △ (従量課金リスク) | △ (月額固定) |
| **ロックイン回避** | ◯ (標準Web API) | ◎ (OSS/Postgres) | × (Proprietary) | **◎ (Docker)** |
| **データ主権** | △ (Global分散) | △ (AWSホスト) | △ (Google) | **◎ (国内指定可)** |

## 4. 推奨構成とロードマップ

Web/A Post のプロトタイプおよび初期運用においては、以下の2段構成を推奨します。

### Phase 1: Cloudflare Workers + D1 + R2
**「まずは無料で、爆速の郵便局を建てる」**
- **理由**: コストパフォーマンスとデプロイの容易さ。Web標準API（Fetch, Streams）準拠で実装しておけば、他への移植も容易。
- **構成**:
    - **Logic**: Workers (Hono or Native Bun-compatible)
    - **Meta**: D1 (SQLite) - ルール、DID紐付け
    - **Body**: R2 (Object Storage) - 暗号化されたVC/Blobデータ

### Phase 2: Supabase (Optional AI Layer)
**「AIが過去の文脈を検索可能にする」**
- **理由**: メッセージが蓄積してきた段階で、pgvector による「セマンティック検索」や「RAG (Retrieval-Augmented Generation)」を行いたい場合、Supabaseをバックエンドとして追加または移行する。

### Phase 3: Sakura / Self-Hosted (Sovereign Mode)
**「真の自律分散へ」**
- **理由**: 企業や自治体など、データ保管場所の法的要件が厳しいケース。
- **構成**: Docker コンテナ (`weba-post:latest`) をデプロイ。内部で SQLite または PostgreSQL を利用。

## 5. 実装へのアクションプラン

1.  `src/post/storage/` ディレクトリを作成し、抽象インターフェース `IStorage` を定義する。
2.  リファレンス実装として `FileSystemStorage` (Bun用) を作成し、ローカル開発を完了させる。
3.  次に `CloudflareD1Storage` アダプターを作成し、Wrangler でデプロイ可能な構成を作る。

---
**結論**:
まずは **Cloudflare** を第一ターゲットとして設計を進めつつ、AI機能の拡張ハブとして **Supabase** の併用も視野に入れる。そして、それら全てを捨てて「自前サーバー」に戻れるよう、**Dockerコンテナ化** を最終的なポータビリティの担保とする。
