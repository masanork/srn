---
title: PQC (耐量子暗号) 導入に関する現状評価と今後のガバナンス方針
description: Web/A プロジェクトにおけるPQC導入の現状（Mandatory implementation）を評価し、CBOMの観点からみた過剰な依存を是正するためのExperimental Opt-inへの移行計画を提言する。
date: 2026-01-03
author: Web/A Architecture Board
status: Draft
priority: High
---

# PQC (耐量子暗号) 導入に関する現状評価と今後のガバナンス方針

## 1. 概要と背景

Web/A (Signed Resource Network) プロジェクトでは、長期的な真正性 (Long Term Validation: LTV) を保証するために、昨今の標準化動向を先取りする形で PQC (Post-Quantum Cryptography) の導入を進めてきました。

具体的には、電子署名に **ML-DSA (Dilithium)**、鍵カプセル化メカニズム(KEM)に **ML-KEM (Kyber)** を採用し、RustベースのWASMモジュールとして実装・統合しました。

しかし、現時点での実装状況を検証したところ、これらは「強制 (Mandatory)」あるいは「既定 (Default)」として組み込まれており、以下の懸念が浮上しています。

1.  **時期尚早な強制適用**: クライアントサイド (Passkey等) のPQC対応が未成熟な中で、アプリケーション層だけで先行してPQCを必須化している。
2.  **バンドルサイズの肥大化**: 利用の有無に関わらず、巨大な格子暗号ライブラリがWASMに含まれ、ロードされている。
3.  **柔軟性の欠如**: 将来的なアルゴリズム変更や、軽量な利用シナリオ（IoTや低帯域環境）への対応が困難。

本報告書は、現状の暗号資産 (Cryptography Bill of Materials: CBOM) を精査し、PQCを「Experimental (実験的) な Opt-in 機能」へと再定義するための移行計画を策定するものです。

## 2. 現状のCBOM (Cryptography Bill of Materials) 分析

現在の `packages/core` および `src/crypto-wasm` の依存関係を分析した結果は以下の通りです。

### 2.1 Rust/WASM (`weba-crypto-wasm`)
現状のWASMバイナリには、以下のライブラリが静的リンクされています。

*   **PQC (Heavy)**
    *   `ml-kem = "0.2"` (Kyber): L2暗号化で利用。鍵サイズ・暗号文ともに大きく、計算コストも比較的高い。
    *   `ml-dsa = "0.0.4"` (Dilithium): VC署名で利用。署名サイズが極めて大きい (数KBオーダー)。
*   **Classic (Light/Standard)**
    *   `ed25519-dalek`, `x25519-dalek`: 高速・軽量。現在の主役。
    *   `p256`: Passkey (WebAuthn) 互換用。
    *   `aes-gcm`, `sha2`, `hkdf`: 共通鍵・ハッシュ等のプリミティブ。

**課題**: `initWasm()` を呼び出した時点で、これら全てが含まれるWASMバイナリがロードされます。PQCを使わないユーザーにとっても、ML-DSA/ML-KEMのコードサイズは「Dead Code」に近い状態でありながら帯域とメモリを消費しています。

### 2.2 TypeScript (`@srn/core`)
*   `generateHybridKeys()`: 引数なしで呼び出すと、**必ず** `mlDsa44GenerateKeyPair()` を実行し、Ed25519とセットで鍵を生成します。
*   `createHybridVC()`: 鍵ペアにPQC鍵が含まれていれば、**必ず** PQC署名を追加します。これによりVCのJSONサイズが数KB増加します。

## 3. ガバナンス上のリスク評価

| リスク項目 | 評価 | 詳細 |
| :--- | :--- | :--- |
| **相互運用性** | High | FIPS 204/203 は確定したが、ブラウザ実装やOSの実装（Keychain等）との整合性はこれから。独自実装の先行は孤立を招く恐れがある。 |
| **パフォーマンス** | Medium | 通信帯域の細いモバイル環境において、ML-DSAの署名サイズは無視できないオーバーヘッドとなる。 |
| **セキュリティ** | Low | 実装自体は `Rust Crypto` 系の定評あるクレートを利用しており、メモリ安全性等は確保されているが、攻撃対象領域 (Attack Surface) は拡大している。 |
| **移行コスト** | High | 現在の「Default PQC」で発行されたVCや鍵は、将来仕様変更があった場合に「負の遺産」となるリスクが高い。 |

## 4. 移行戦略: "PQC Agility" Plan

PQCを否定するのではなく、「必要な時に、必要な強度で」利用できるアーキテクチャ (Crypto Agility) へ移行します。

### Phase 1: Experimental Opt-in (即時対応)
**目的**: デフォルトの軽量化と、PQCの明示的な選択制導入。

1.  **鍵生成のOpt-in化**:
    *   `generateHybridKeys(enablePqc: boolean = false)` のようにフラグを導入し、デフォルトでは **Ed25519のみ** を生成する。
    *   既存のコードへの影響を最小限に抑えるため、型定義では `pqc` プロパティを `Optional` に変更する。
2.  **署名の適応的処理**:
    *   `createHybridVC` は、渡された鍵束にPQC鍵が含まれている場合のみ、ML-DSA署名を付与する挙動とする（現状の実装ロジックで対応可能だが、明示的にテストする）。
3.  **L2暗号化の分離**:
    *   L2E (Layer 2 Encryption) においても、受信者がPQC鍵 (Kyber) を公開している場合のみ Hybrid Encryption を行い、なければ X25519 のみで暗号化するフォールバックを正式仕様とする。

### Phase 2: Modular WASM (中期的対応)
**目的**: バンドルサイズの削減。

1.  **WASMの分割**:
    *   `weba-crypto-core.wasm`: Ed25519, X25519, SHA2, AES-GCM (必須機能)
    *   `weba-crypto-pqc.wasm`: ML-KEM, ML-DSA (拡張機能)
2.  **Dynamic Import**:
    *   PQC機能が必要になった時点（PQC鍵の生成要求、あるいはPQC署名の検証要求）で、初めて `pqc.wasm` をフェッチ・ロードする仕組みを導入する。

### Phase 3: Native Passkey Integration (長期的対応)
**目的**: プラットフォーム機能への委譲。

1.  ブラウザ/OSがPQC対応Passkey (PRF extension等でKyber鍵共有など) をサポートした段階で、WASMによる独自実装を廃止し、WebAuthn API経由のネイティブ実装へ切り替える。

## 5. 推奨される当面のロードマップ

ガバナンス委員会に対し、以下のロードマップの承認を求めます。

1.  **[Week 1] API仕様変更**: `generateHybridKeys` のデフォルト挙動を「Classic Only」に変更し、PQCをOpt-inとする。
2.  **[Week 2] ドキュメント改訂**: 技術文書における「必須要件」としての記述を「推奨拡張 (High Assurance Profile)」へと書き換える。
3.  **[Month 1] 影響調査**: 既存のPoC（住民票VC等）において、PQC鍵を利用している箇所の特定と、再発行を含めた移行措置の実施。

以上
