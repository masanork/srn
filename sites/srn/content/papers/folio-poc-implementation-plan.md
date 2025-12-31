---
title: "Folio証明書対応PoC実装計画書"
layout: article
author: "Sorane Tech Lead"
date: 2025-12-31
description: "ガバナンスTFで承認された『Web/A + VP 行政証明書提示ツール仕様』に基づく、Phase 1 (CLI) および Phase 2 (Browser Demo) の実装ロードマップ。"
ai_generated: true
status: PLANNED
---

# Folio証明書対応PoC実装計画書

**Status:** PLANNED (Gov TF Approved)
**Base Spec:** [Web/A + VPによる行政証明書提示ツール仕様案 (Draft v2)](./web-a-vp-generator-spec.md)

## 1. プロジェクト概要

本プロジェクトは、総務省要件（真正性・見読性・不正防止・汎用性）とプライバシー保護（名寄せ防止）を両立する行政証明書提示システム **"Web/A Folio"** の概念実証 (PoC) を行うものである。

### 1.1 ゴール
1.  **プロトコル検証**: 「定型VC事前発行 + クライアント側VP生成」モデルが技術的に動作することの実証。
2.  **コアロジックの共通化**: CLIとブラウザで同一の検証ロジック (WebAssembly) が動作することの確認。
3.  **法的・セキュリティ要件の充足**: ガバナンスTFでの決議事項（不正なパターンの排除、端末紛失時の挙動）の実装。

## 2. アーキテクチャ設計

### 2.1 データフロー（Targeted Issuanceモデル）

1.  **Issuance (自治体)**: 法定パターン（例：世帯全員）に基づく **汎用VC** を発行。
2.  **Storage (Folio Vault)**: ユーザーはVCを暗号化してローカル（またはクラウド）に保存。
3.  **Presentation (Web/A)**:
    *   ユーザーは提示先 (Audience) を指定。
    *   WASMロジックが汎用VCから **Targeted VP** を生成。
    *   FIDO鍵で署名し、HTMLテンプレートに封入して **Web/Aファイル** を出力。

### 2.2 技術スタック

*   **Core Logic**: Rust (→ `srn-crypto.wasm`)
    *   Ed25519 / P-256 署名・検証
    *   VC / VP 生成・検証ロジック
    *   Web/A パッケージング処理
*   **CLI Tool**: TypeScript (Bun / Node.js)
    *   WASMモジュールのラッパー
    *   ローカル鍵管理 (FIDOシミュレーション)
*   **Browser Demo**: HTML5 + Vanilla JS
    *   WASMモジュールの読み込み
    *   WebAuthn API との連携

---

## 3. 実装フェーズ詳細

### Phase 1: Core Logic & CLI (期間: 2週間) - **COMPLETED**

まず、UIを持たないCLIツールとして、プロトコルの正当性を検証する。

#### Task 1.1: WASM暗号コアの拡張
*   [x] **Action**: `src/core/wasm_core.ts` および Rust側の拡張。
*   [x] **Requirement**:
    *   JPKI署名検証ロジック（シミュレーション用Mockで可）
    *   FIDO (P-256/ES256) 署名および検証ロジックの実装。
    *   「定型パターン」バリデータの組み込み（Legal要件）。

#### Task 1.2: Folio CLI (`folio`) の実装
*   [x] **Action**: 新規CLIツールの作成。
*   [x] **Commands**:
    *   `folio issue`: 自治体役として定型VCを発行。
    *   `folio present`: 汎用VC + 提示先情報 → Web/A (VP入り) を生成。
    *   `folio verify`: 生成されたWeb/Aの真正性とAudienceを確認。
*   [x] **Requirement**:
    *   **Legal Check**: `issue` コマンドにおいて、未定義の属性組み合わせ入力を拒否する。
    *   **Security Warning**: 鍵生成・保管時に「この鍵を紛失すると復旧できません」という警告を標準出力に表示する（Red Team要件）。

### Phase 2: Web/A Form Integration & Browser Demo (期間: 3週間)

Phase 1のWASMをブラウザで動かし、**「申請フォームからの証明書要求 (VPR)」**という自然なユースケースを実証する。

#### Task 2.1: Web/A Form with VPR (Verifiable Presentation Request)
*   [ ] **Action**: 銀行口座開設等のダミー申請フォーム (`bank-account-opening.html`) の作成。
*   [ ] **Scenario**:
    1.  ユーザーがフォームに氏名・住所を入力（あるいはVCから自動入力）。
    2.  フォーム内に「住民票の提出」ボタンがあり、これを押下。
    3.  **VPR (Presentation Request)** が発行され、ユーザーのFolio（ウォレット機能）が起動。
    4.  ユーザーが保有する汎用VCから最適なものを選択し、フォーム（Audience: Bank）向けに VP を生成・署名。
    5.  生成された VP がフォームに「添付」され、申請データ全体（フォーム入力＋VP）としてWeb/A化される。

#### Task 2.2: Viewer & Verification Logic
*   [ ] **Action**: 提出された申請用Web/Aファイルの検証・表示ロジック。
*   [ ] **Flow**:
    1.  銀行員（Verifier）が受け取ったHTMLを開く。
    2.  WASMが起動し、フォーム自体の署名と、添付された住民票VPの署名(FIDO)・VC署名(自治体)を検証。
    3.  **Cross-Validation**: フォームに入力された「住所」と、添付された住民票VPの「住所」が一致しているかを機械的に照合する。
    4.  成功時のみ、申請書と住民票を並べて表示。

---

## 4. 検証項目（Acceptance Criteria）

### 4.1 法的妥当性テスト
*   [ ] **Case A**: 定められたパターン（世帯全員／本人のみ）以外でのVC発行を試み、**エラーになること**。

### 4.2 プライバシー・結合テスト
*   [ ] **Case B**: 提示先A（Bank A）のフォームから要求されたVPRに対し、Bank B向けのVPを生成・添付しようとしてエラーになること。
*   [ ] **Case C**: フォーム入力者の署名鍵と、添付された住民票VPの署名鍵（FIDO）が不一致の場合、警告またはエラーとなること（本人性の確認）。

### 4.3 Red Team 要件テスト
*   [ ] **Case D**: 端末（ローカルキーストア）を削除した後、バックアップしておいたWeb/Aファイルを開こうとして验证不能となること。

## 5. 次のアクション

1.  SRNリポジトリ内に `packages/folio-cli` および `packages/folio-core` (WASM) のディレクトリを切る。
2.  `packages/web-a-form` (既存) に VPR (VP Request) スキーマの定義を追加する。
3.  Rustの構造体定義を開始する。
