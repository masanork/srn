---
title: "Web/A + VPによる行政証明書提示ツール仕様案"
layout: article
author: "Sorane Project"
date: 2025-12-31
description: "Targeted IssuanceとFIDO鍵バインドを採用した、プライバシー保護型行政証明書提示ツールの技術仕様。"
ai_generated: true
---

# Web/A + VP Administrative Certificate Presentation Tool Specification (Draft v2.1)

**Status:** APPROVED (PoC Phase)
**Date:** 2026-01-01

> [!WARNING]
> **Experimental Status**: The IC card reading functionality (CIV module) is currently in an experimental stage. Implementation is based on technical specifications and simulator-based validation. **Direct testing with physical smart cards and NFC hardware has not been conducted.** Use with caution in production-like environments.

## 1. Overview
A technical specification for a tool that reads public personal authentication (JPKI) and other IC card data (Driver's License, Residence Card, Passport) using a native bridge app, converts them into Verifiable Presentations (VP), and presents them online.

## 2. Supported Documents (Scope)
1.  **My Number Card (JPKI)**: Identity verification (4 attributes) & Electronic signature.
2.  **Driver's License (DL)**: Verify driving eligibility and identity.
3.  **Residence Card (RC)**: Verify residency status and period of stay.
4.  **Passport (EP)**: Global identity verification (ICAO compliant).

---

## 3. 設計原則（Privacy & Trust）

本仕様では、ZKPを用いずに名寄せ防止（Unlinkability）を実現するため、**「1回の提示につき、1つの固有なWeb/Aを発行する（Targeted Issuance）」** モデルを基本とする。

1.  **Identity Anchor**: 本人性は **JPKI（署名用電子証明書）** で確立する。
2.  **Device Binding**: 継続的な利用・提示意思は **FIDO鍵（Passkey）** で担保する。
3.  **Targeted Privacy**: 証明書VCは「提示先（Audience）」ごとに固有のIDで発行し、横断的な追跡を防ぐ。
4.  **HMP (Human-Machine Pairing)**: 人間用の券面（HTML）と機械用のデータ（VP）を単一ファイルに封入し、**Web/A 署名** で一体性を保証する。

---

## 3. 全体ワークフロー

### Phase 1: オンボーディング（Identity Binding）
*初回のみ実施。端末（FIDO鍵）と本人（JPKI）を紐付ける。*

1.  User: FIDO鍵ペア `(sk_fido, pk_fido)` を生成。
2.  User: **「鍵所有誓約書 (KeyBindingStatement)」** を作成し、JPKIカードで署名。
    *   *「私（マイナンバーハッシュA）は、このFIDO公開鍵Bを管理しています」*
3.  Issuer (自治体): JPKI署名を検証し、`pk_fido` を登録。

### Phase 2: 証明書発行（Targeted Issuance）
*証明書が必要になるたびに実施（コンビニ交付のデジタル版）。*

1.  User: 発行申請を行う。
    *   対象: 「住民票」
    *   **提示先 (Audience)**: "株式会社〇〇銀行"（またはドメイン `bank.example.com`）
2.  User: リクエストに対して `sk_fido` で署名（本人意思の確認）。
3.  Issuer: **提示先限定VC** を発行。
    *   VC内に `audience: "bank.example.com"` を明記。
    *   **ここでの識別子は「提示先ごとのペアワイズID」とする（名寄せ防止）。**
4.  Issuer: VCとHTMLテンプレートを結合し、Web/A ファイルを生成・署名してダウンロードさせる。

### Phase 3: 提示・検証 (Presentation)
1.  User: Web/A ファイルを提出（メール、アップロード等）。
2.  Verifier: ブラウザで Web/A を開く。
    *   **System Integrity**: 発行者署名の検証。
    *   **Audience Check**: 自分が指定された `audience` か確認。
    *   **Holder Binding**: （オプション）VP署名を検証。

---

## 4. データ構造定義

### 4.1 FIDO鍵紐付け証明 (KeyBindingStatement)

JPKIを用いて「このFIDO鍵は私のもの」と宣言するデータ。オンボーディング時に作成。

```json
{
  "type": "FidoKeyBindingStatement",
  "issuer": "jpki:subject-hash", 
  "issuedAt": "2025-01-01T00:00:00Z",
  "credentialSubject": {
    "fido_public_key": {
      "kty": "EC",
      "crv": "P-256",
      "x": "...",
      "y": "..."
    }
  },
  "proof": {
    "type": "JpkiSignature",
    "verificationMethod": "urn:jpki:cert:...",
    "jws": "..." 
  }
}
```

### 4.2 行政証明書VC (Targeted VC)

発行者が「特定の提示先」に向けて発行したVC。
**Holder Binding** を実現するため、対象者のFIDO公開鍵ハッシュ等を `cnf` (Confirmation) クレームに含める。これにより、IDがランダムであっても「同一の鍵を持つ人物」であることを証明できる。

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "JuminhyoCertificate"],
  "issuer": "did:web:city.example.jp",
  "issuanceDate": "2025-04-01T10:00:00Z",
  "expirationDate": "2025-07-01T10:00:00Z",
  "credentialSubject": {
  "credentialSubject": {
    // 提示先ごとに異なるランダムなID (Pairwise ID)
    "id": "did:folio:uuid:12345-random-for-bank-a",
    "audience": "bank.example.com", 
    "juminhyoData": { ... },
    
    // 【重要】同一人物性の担保（Holder Binding）
    // このVCは、以下の鍵を持つ者だけが正当に行使できる
    "cnf": {
      "jwk": { ...FIDO_Public_Key... }
    }
  },
  "proof": { ... } // 発行者(自治体)の署名
}
```

**法的制約 (Legal Requirement):**
発行者（自治体）は、`juminhyoData` の生成において、住民基本台帳法および施行令で認められた記載事項の組み合わせ（定型パターン）のみを使用しなければならない。恣意的な項目の削除や、法的に存在し得ない組み合わせの発行は禁止される。

**セキュリティ要件 (Red Team Requirement):**
FIDO鍵によるStrong Bindingを採用するため、端末紛失時にはこの証明書へのアクセス権も永久に失われる。「この証明書はこの端末でしか開けません」等の警告UIをユーザーに提示し、理解を得ることが必須となる。


### 4.3 Verifiable Presentation (VP)

UserがWeb/A内で提示するデータ。

```json
{
  "type": "VerifiablePresentation",
  "verifiableCredential": [
    { ... } // 上記の行政証明書VC
  ],
  "proof": {
    "type": "FidoSignature",
    "verificationMethod": "#fido-key",
    "challenge": "timestamp-or-nonce",
    "domain": "bank.example.com"
  }
}
```

---

## 5. Web/A ファイル構造（HTML）

生成される `.html` ファイルは以下の構造を持つ。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- 
    Layer 4: Presentation 
    行政標準文字、レイアウト定義、レンダラ用スクリプト(WASM)
  -->
  <meta charset="UTF-8">
  <script src="renderer.wasm.js"></script>
</head>
<body>
  <!-- 人間可読な券面（デフォルトで表示） -->
  <div id="visual-layer" class="a4-compliant">
    <h1>住民票の写し</h1>
    ...
  </div>

  <!-- 
    Layer 2 & 3: Data & Trust (不可視データブロック) 
    改ざん検知のため、body全体のハッシュ等とリンクする
  -->
  <script type="application/ld+json" id="vp-data">
    { /* 上記 VP データ (Signed) */ }
  </script>

  <script type="application/json" id="web-a-manifest">
    {
      "version": "1.0",
      "layout_integrity": "sha256-...",
      "issuer_signature": "..." 
    }
  </script>
</body>
</html>
```

---

## 6. プライバシーとセキュリティに関する考察

### 6.1 名寄せ防止 (Unlinkability) と 鍵バインドの選択
*   **課題**: 証明書の持ち主を証明するために「マイナンバーカードの署名用電子証明書（JPKI公開鍵）」を直接バインド(`cnf: {jwk: JPKI_Pub}`) すると、どうなるか？
    *   JPKIの公開鍵は5年間不変であり、強力な個人識別子となる。
    *   A銀行向けの証明書とB不動産向けの証明書に同じJPKI公開鍵が含まれていると、両社がデータを突き合わせた際に**名寄せが可能になってしまう**。これは「番号法」の精神に反するプライバシーリスク（プロファイリング）である。
*   **解決策**: **「代理鍵としてのFIDO鍵」へのバインド**。
    *   Web/A Folioでは、JPKI公開鍵を直接VCに焼くことはしない。
    *   代わりに、ユーザーは提示先やデバイスごとに異なる **FIDO鍵（または一時的な公開鍵）** を生成し、VCに紐付ける。
    *   これにより、A銀行とB不動産に提出するデータは、IDも署名鍵も異なり、数学的に全く関係のない別人に見える（Unlinkabilityの確保）。
    *   同時に、同一の受取手に対して複数の証明書を出す場合のみ、あえて同じFIDO鍵を使うことで「同一人性」を証明する。

### 6.2 提示意思の証明 (Replay Guard)
*   **課題**: Web/Aファイルが盗まれた場合、コピーして悪用される。
*   **解決策**: **Audience Binding** と **FIDO署名**。
    *   VC内に `audience: bank.example.com` が焼かれているため、他社（C不動産）へ使い回すことはできない。
    *   Web/Aファイル自体にFIDO署名検証ロジックを組み込み、閲覧時にも（必要であれば）FIDO認証を求めることが可能（Identity Binding）。

---

## 7. 複数証明書の一括提示（Multi-Certificate Presentation）

「住民票」と「課税証明書」など、複数の証明書をセットで提出し、それらが**同一人物のものである**ことを証明するケース。

### 7.1 検証ロジック
本仕様では、VC内のID（`credentialSubject.id`）はランダム化されるため、IDの一致による名寄せはできない。代わりに **Cryptographic Holder Binding** を用いる。

1.  **VCの確認**: 提出された全てのVC（住民票、課税証明書）の `credentialSubject.cnf.jwk` が、**同一のFIDO公開鍵** を指していることを確認する。
2.  **VPの署名検証**: そのFIDO秘密鍵によって VP 全体に署名がなされていることを検証する。

これにより、「IDは異なるが、両方とも同じ鍵の持ち主（＝本人）に対して発行された真正な証明書である」ことが数学的に保証される。

---

## 8. 実装者向けガイドライン

### 7.1 Input
ツールは以下の入力を受け取る。
1.  **Issuer Key**: 自治体署名鍵 (Ed25519)
2.  **Holder FIDO Key**: ユーザーの公開鍵 (P-256)
3.  **Certificate Data**: 住民データ (JSON)
4.  **Audience**: 提示先識別子 (String)

### 7.2 Process
1.  `credentialSubject.id` をランダム生成。
2.  `audience` をペイロードに注入。
3.  JSON-LD を正規化し、Issuer Key で署名 → **VC生成**。
4.  VC を HTML テンプレート内の `<script id="vp-data">` に埋め込む。
5.  HTML 全体の整合性を計算し、最終署名を行う。

### 7.3 Output
*   **Output**: 署名済み Web/A HTMLファイル (`juminhyo.html`)

---

## 8. 補足：Folioとの関係
本仕様で生成されるWeb/Aファイルは、**「Web/A Folio」** のコンテナ仕様に完全準拠する。ユーザーはこれを自分のクラウドストレージ等（Folio Vault）に保存し、必要な時にURLやファイルとして提示できる。
