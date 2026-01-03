---
title: "OSS Developer Experience Improvement Plan (Draft)"
layout: article
author: "SRN Strategy Team"
date: 2026-01-03
description: "AI開発者向けに『Time-to-Hack』を最適化するための、リポジトリ構造改革とSDK切り出し計画"
draft: true
---

# OSS Developer Experience Improvement Plan 2026

## 1. Context & Motivation

### The Problem
現在の `srn` リポジトリは、歴史的経緯により「個人のブログ生成ツール (SSG)」と「次世代プロトコル (Web/A) のコアロジック」が密結合したモノリス構造となっている。
Phase 1のマーケティング戦略において、**"MCP Builders & AI Hackers"** をターゲットとする場合、以下の点が致命的な障壁（Friction）となる。

1.  **Too Heavy**: `git clone` すると、無関係なブログ記事やSSGのビルドロジックまでついてくる。
2.  **Too Complex**: 「Web/Aファイルをパースしたいだけ」のエンジニアが、どこを見ればいいか分からない。
3.  **No Clear Boundary**: コアロジック（Crypto/Parser）とアプリケーションロジック（SSG）の境界が曖昧。

### The Goal
**"Clone & Hack in 5 Minutes"**
AI開発者が、`npm install`（または `cargo add`）ひとつでWeb/Aの能力（Verification / Parsing）を手に入れ、自分のMCPサーバーやRAGパイプラインに組み込める状態にする。

---

## 2. Decoupling Strategy (分離戦略)

リポジトリ機能の以下の3層への分離・独立を検討する。

### Tier 1: The Core Engine (SDK)
Web/Aのエコシステムを支える最小単位。
**「ブログ云々は関係ない。私はWeb/Aファイルを扱いたいだけだ」** という開発者のためのライブラリ。

*   **Package Name**: `@srn/core` (NPM), `srn-core` (Crate)
*   **Contents**:
    *   **Crypto**: WASMベースの署名・検証ロジック (Ed25519, P-256, ML-DSA)。
    *   **VC/DID**: Verifiable Credential の生成・検証、DID解決。
    *   **Parser**: HTMLからJSON-LD (Web/A Data) を抽出する軽量パーサー。
*   **Action**: `src/core` と `src/form/parser.ts` を独立したパッケージとして切り出す。

### Tier 2: The Reference Tool (Folio CLI)
Core Engine を使った、「公式の」リファレンス実装ツール。
**「コードは書きたくないが、Web/Aを使ってみたい」** ユーザーや、CI/CDパイプライン向け。

*   **Package Name**: `@srn/folio`
*   **Contents**:
    *   Web/Aファイルの新規作成 (`folio create`)
    *   検証 (`folio verify`)
    *   データ抽出 (`folio inspect`)
    *   SQLiteへのインデックス (`folio ingest`)
*   **Action**: 現在開発中の `folio` コマンドを、`@srn/core` のクライアントアプリとして再定義する。

### Tier 3: The Consumer App (SSG/Blog)
Core SDK と CLI を利用する、「一利用者」としてのアプリケーション。
現在の `srn` リポジトリの主役から、**「Web/A SDKを使った作例のひとつ」** へと立場を変える。

*   **Contents**:
    *   個人のブログコンテンツ (`content/blog`, `content/join` etc.)
    *   サイトビルドロジック (`src/ssg/*`)
*   **Action**: `src/ssg` は `@srn/core` を依存ライブラリとしてインポートする形にリファクタリングする。

---

## 3. Roadmap for DX

### Phase A: Internal Decoupling (～Q1 2026)
リポジトリはモノリスのまま、内部的にフォルダ構成と依存関係を整理する（Monorepo構成）。
*   `packages/core`: SDK機能を集約。
*   `packages/folio`: CLI機能を集約。
*   `apps/ssg`: サイト生成ロジック。

### Phase B: Publishing (Q2 2026～)
整理されたパッケージを NPM / Crates.io に公開する。
*   ドキュメントサイトに `Developers` セクションを設け、`npm install @srn/core` から始まるチュートリアルを公開する。

---

## 4. Expected Impact

*   **For AI Developers**: MCPサーバー開発において、「PDFパーサー」の代わりに「Web/A SDK」を選択肢に入れやすくなる。
*   **For Maintainers**: コアロジックとサイトロジックが分離されるため、テスト容易性が向上し、意図せぬデグレを防げる。
*   **For Ecosystem**: 第三者が「Python版Web/A SDK」や「Java版検証ツール」を作りやすくなる（仕様の明確化）。
