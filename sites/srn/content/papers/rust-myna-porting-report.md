---
title: "JPKI/Myna GoライブラリのRust移植性評価レポート"
layout: article
author: "Sorane Tech Lead"
date: 2025-12-31
description: "GitHub上のGo製マイナンバーカードライブラリ(jpki/myna)をRust/WASMへ移植するための技術的実現性とアーキテクチャ設計案。"
ai_generated: true
status: DRAFT
---

# JPKI/Myna GoライブラリのRust移植性評価レポート

## 1. 概要
Go言語で実装されたマイナンバーカード操作ライブラリ [jpki/myna](https://github.com/jpki/myna) を分析し、Rustへの移植、特にWebAssembly (WASM) 環境での動作に向けた評価を行いました。

**結論**: **Rustへの移植は技術的に十分に可能であり、かつ推奨されます。**
Go実装のロジックは明確であり、Rustの型システムと強力な暗号エコシステムを活用することで、より安全かつポータブルな（ブラウザ動作可能な）ライブラリとして再構築できます。

## 2. モジュール別移植性評価

| 機能領域 | Go実装 (jpki/myna) | Rust代替手段 / 移植戦略 | 難易度 |
| :--- | :--- | :--- | :--- |
| **ICカード通信 (I/O)** | `github.com/ebfe/scard` (PC/SC wrapper) | **Native**: `pcsc` crate <br> **WASM**: `web-sys` (WebUSB) による抽象化 | 中 |
| **APDUコマンド** | バイト列の組み立てロジック | `Vec<u8>` または `heapless::Vec`。RustのEnumを活用して型安全に構築可能。 | 低 |
| **暗号処理 (RSA)** | `crypto/rsa`, `crypto/x509` | `rsa`, `pkcs1`, `x509-parser` crates. | 低 |
| **文字コード** | Shift_JIS (基本4情報) | `encoding_rs` crate. WASMでも問題なく動作。 | 低 |
| **ASN.1解析** | `encoding/asn1` | `der`, `asn1-rs`, `yasna`. ゼロコピー解析も可能。 | 中 |

## 3. WASM化への最大の壁と解決策：I/Oの抽象化

`jpki/myna` のGoコードは、PC/SC (スマートカードリーダー) と密結合している可能性が高いです。
これをそのままWASM（ブラウザ）に持っていくことはできません（ブラウザはPC/SCを直接叩けないため）。

**解決策: I/Oトレイトによる分離**
Rustへの移植にあたっては、以下のようなトレイトを定義し、通信部分を切り離す設計にします。

```rust
// コアロジックはこのトレイトにのみ依存する
pub trait CardReader {
    fn transmit(&mut self, apdu: &[u8]) -> Result<Vec<u8>, Error>;
}
```

*   **Native実装**: `pcsc` クレートを使ってこのトレイトを実装（CLIツール用）。
*   **WASM実装**: JavaScriptの `navigator.usb` (WebUSB) や、パソリ用の `WebHID` を呼び出す実装を注入。

この設計により、**「マイナンバーカードのAPDUロジックそのもの」**を純粋なRustライブラリ (`myna-core`) として独立させ、ブラウザ上で走らせることが可能になります。

## 4. 推奨アーキテクチャ構成

```text
packages/folio-core/
├── src/
│   ├── lib.rs          # コアロジック (no_std 推奨)
│   ├── apdu.rs         # APDUコマンド生成 (SELECT FILE, READ BINARY等)
│   ├── jpki.rs         # 公的個人認証APの仕様実装
│   ├── crypto.rs       # 署名検証、PIN処理
│   └── iso7816.rs      # ステータスワード (SW1, SW2) 解析
└── Cargo.toml          # dependencies: signature, rsa, x509-parser
```

## 5. Goコードからの移行ガイド

1.  **APDU生成**: Goの `[]byte` 追加処理は、Rustのビルダーパターンに置き換えることで可読性が向上します。
2.  **エラーハンドリング**: Goの `error` は Rustの `Result<T, AppError>` にマッピングし、カード固有のエラー（PINロック等）を型として定義します。
3.  **証明書パース**: Goの `x509.ParseCertificate` は強力ですが、Rustの `x509-parser` も同等の能力を持ちます。JPKI固有のフィールド（基本4情報など）はASN.1構文に合わせて構造体を定義する必要があります。

## 6. 次のステップ

まずは `packages/folio-core` において、PC/SCに依存しない **「APDU生成・解析ロジック」** のみの移植を開始することを推奨します。

1.  APDUコマンド定義（SELECT, VERIFY, COMPUTE DIGITAL SIGNATUREなど）。
2.  トレイト `CardReader` の定義。
3.  単体テスト（Mockリーダーを使用）。
