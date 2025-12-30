---
title: "AI プロンプト集：Web/A エコシステムの活用"
layout: article
description: "AI エージェントを活用して Web/A Form を作成したり、セキュアな暗号化ワークフローを構築したりするための実践的なプロンプト集。"
date: 2025-12-29
ai_generated: true
---

# AI プロンプト集：Web/A エコシステムの活用

Web/A は人間とマシンの対等な理解（Human-Machine Parity）を掲げており、AI エージェントとの相性が抜群です。ここでは、日々の業務、ドキュメント作成、およびセキュリティ運用を自動化するための具体的なプロンプト例を紹介します。

---

## 1. 既存の Excel / PDF から Web/A Form への変換

既存の帳票出力を Web/A 構文に変換させ、デジタル・アーカイブ可能な形式にします。

**前準備**: 
Microsoft の `markitdown` などを使って、Excel を一度 Markdown 形式のテキストにします。

**プロンプト**:
> 以下のルール（Web/A Syntax）に従って、提供するテキスト情報を Web/A Form 形式（Markdown）に変換してください。
>
> **Web/A Syntax ルール**:
> 1. 入力欄は `[type:key (attrs)]` の形式で埋め込む。
>    - テキスト: `[text:user_name (label="氏名")]`
>    - 数値: `[number:amount (placeholder="0")]`
>    - 選択: `[select:category (options="A,B,C")]`
> 2. 計算式は `calc` タイプを使用する。
>    - 例: `[calc:subtotal (formula="price * quantity")]`
> 3. 表構造（HTML Table風の構文）は維持する。
>
> **対象テキスト**:
> (ここに Markdown 変換したテキストを貼り付け)

---

## 2. Web/A 文書の要約と分析

特定の Web/A 文書（HTML）を AI に読み込ませて、中身を分析させる際のプロンプトです。

**プロンプト**:
> この Web/A 文書（HTMLファイル）を解析してください。
> 1. Issuer（発行元）の DID を特定し、真正性を確認してください。
> 2. `application/ld+json` ブロックから、入力されたデータ（Subject）を抽出して、重要な項目を箇条書きでまとめてください。
> 3. この書類が「就業証明書」である場合、勤務期間と職務内容が整合しているかチェックしてください。

---

## 3. 分散した Web/A ファイルの集計

フォルダ内の複数の Web/A ファイルからデータを抽出させます。

**プロンプト**:
> `submissions/` フォルダ内にある全ての Web/A ファイル（HTML）をスキャンしてください。
> 各ファイルの JSON-LD データから "totalAmount" と "orgName" を抽出し、組織別の集計表を作成してください。
> また、合計金額が 1,000,000 円を超えている提出物があれば、警告としてリストアップしてください。

---

## 4. Web/A Folio 内容に基づいた Prefill

ユーザーの過去の履歴を参考に、新しいフォームを埋めさせる高度なプロンプトです。

**プロンプト**:
> わたしの Folio 内の `history/` フォルダにある過去の「経費精算フォーム」を 3 件参照してください。
> その内容に基づいて、`inbox/` にある新しい精算フォームの入力項目を推測して埋めてください。
> 特にプロジェクトコードや勘定科目は、過去の傾向に合わせるようにしてください。

---

## 5. ポスト量子署名 (ML-DSA) の検証

最新の耐量子計算機暗号（PQC）を用いた署名の真正性を論理的に検証させます。

**プロンプト**:
> この Web/A ファイルに含まれている署名（ML-DSA-44）の真正性を検証してください。
> 1. 公開鍵（Verify Key）が 1312 バイトの ML-DSA 形式であることを確認してください。
> 2. 署名対象のペイロード（Canonical JSON）を再現し、改ざんがないことを論理的に確認してください。
> 3. 耐量子暗号の基準に照らして、このドキュメントが長期保存に適しているか評価してください。

---

## 6. Layer 2 暗号化 (L2E) による機密データの保護

特定の受信者だけが解読できるように機密データをラップさせるプロンプトです。

**プロンプト**:
> 以下の機密データ（JSON）を Web/A の Layer 2 エンベロープ（L2E）形式でラップするための指示を生成してください。
> - **受信者公開鍵 (X25519)**: (Base64Url)
> - **アルゴリズム**: HPKE-v1 (X25519-HKDF-SHA256, AES-256-GCM)
> 
> Web/A L2 構造に従って、`layer2.ciphertext`, `layer2.auth_tag`, および `layer2.encapsulated.classical` を含む JSON オブジェクトを作成する手順を示してください。

---

## 7. WASM 連携コードの生成（開発者向け）

高速な暗号・集計処理を行うための Worker スクリプトを生成させます。

**プロンプト**:
> Rust で実装された `weba-crypto-wasm` モジュールを使用して、ブラウザ上で 100 件の Web/A 署名を並列検証する Worker スクリプトを作成してください。
> - `initWasmFromB64()` を使用して初期化すること。
> - `mlDsa44Verify()` を呼び出して、メインスレッドをブロックせずに処理を行ってください。

---

## 補足：Web/A 参照情報

- **Input Types**: `text`, `number`, `date`, `email`, `tel`, `select`, `textarea`, `search` (autocomplete).
- **Calculation**: `formula` 属性に JS ライクな式を記述。
- **Security**: L2暗号化は HPKE (Hybrid Public Key Encryption) 準拠。
- **Signatures**: Ed25519 (Classical) および ML-DSA-44 (Quantum-Resistant).
