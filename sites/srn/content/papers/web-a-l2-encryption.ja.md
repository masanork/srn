---
title: "Discussion Paper: Web/A Layer 2 Encryption (日本語版)"
layout: article
author: "Web/A Project"
date: 2025-12-27
---

# Web/A Layer 2 Encryption: 送信内容の機密性を守る仕組み

## 1. 概要
本稿は Web/A 文書の **Layer 2 Encryption** を定義します。Layer 1 はテンプレート（質問）の完全性、Layer 2（Signature）はユーザー回答（回答者）の真正性を保証します。Layer 2 Encryption は **機密性** を提供し、配送経路やブラウザ保存が信頼できない場合でも、回答内容が **受領者（Issuer/Aggregator）だけ** に読めるようにします。

## 2. 脅威モデル
- **機密性**: メール・CDN・悪意ある拡張機能など中間者から回答を保護
- **テンプレート結合**: 暗号文が特定の Layer 1 テンプレートに強く結び付くこと（回答の貼り替え攻撃を防止）
- **将来互換性**: 高速な ECC と PQC のハイブリッド経路を両立

## 2.5. Web/A Form への統合（任意）
Layer 2 Encryption は Web/A Form で **オプション** です。ON の場合は L2 を暗号化した **Layer2Encrypted** を出力し、OFF の場合は従来通り平文 L2 を出力します。

前提:
- 発行者は受領者の公開鍵（X25519、任意で ML-KEM-768）をフォームに埋め込む
- UI は「L2 を暗号化」のトグルを明示し、復号可能者を説明する
- AAD に `layer1_ref` を含めてテンプレートへ強くバインドする

## 3. 暗号構成

### 3.1. HPKE 風ハイブリッド暗号
Web/A L2 は **HPKE (RFC 9180)** の考え方を取り入れた JSON 向け構成です。

- **KEM**: 
  - Classical: **X25519**
  - PQC（任意）: **ML-KEM-768 (Kyber)**
- **KDF**: **HKDF-SHA256**
- **AEAD**: **AES-256-GCM**

### 3.2. AAD によるバインド
AEAD の `aad` に `layer1_ref` を含め、テンプレート差し替えを防ぎます。`layer1_ref` が一致しない場合、復号は失敗します。

```json
{
  "layer1_ref": "sha256:...",
  "recipient": "issuer#kem-2025",
  "weba_version": "0.1"
}
```

### 3.3. カノニカル JSON
署名と AAD 生成のために **簡易 Canonical JSON** を採用します。
1. キーの辞書順ソート
2. 余分な空白なし
3. UTF-8
4. 浮動小数は非推奨（必要なら文字列化）

## 4. データ構造

### 4.1. Layer 2 Payload（暗号化前）
```json
{
  "layer2_plain": {
    "name": "John Doe",
    "medical_history": "..."
  },
  "layer2_sig": {
    "alg": "Ed25519",
    "kid": "user#sig-1",
    "sig": "base64...",
    "created_at": "2025-12-27T..."
  }
}
```

### 4.2. Layer 2 Encrypted Envelope
```json
{
  "weba_version": "0.1",
  "layer1_ref": "sha256:...",
  "layer2": {
    "enc": "HPKE-v1",
    "suite": {
      "kem": "X25519(+ML-KEM-768)",
      "kdf": "HKDF-SHA256",
      "aead": "AES-256-GCM"
    },
    "recipient": "issuer#kem-2025",
    "encapsulated": {
      "classical": "base64(ephemeral_pk)",
      "pqc": "base64(kem_ct)"
    },
    "ciphertext": "base64(aead_ct)",
    "aad": "base64(aad_json)"
  },
  "meta": {
    "created_at": "2025-12-27T...",
    "nonce": "base64..."
  }
}
```

## 5. 実装メモ（Bun/TypeScript）
- `@noble/curves/ed25519` と `x25519` を利用
- `node:crypto` の `hkdf` / `randomBytes` / `createCipheriv` を利用
- ブラウザ移植を意識して最小構成にする

## 6. 使い方（Web/A Form 統合）

### 6.1. Frontmatter で有効化
Web/A Form の Markdown に以下を追加すると、L2 暗号化が有効になります。

```yaml
---
layout: form
l2_encrypt: true
l2_recipient_kid: "issuer#kem-2025"
l2_recipient_x25519: "<base64url>"
# l2_recipient_pqc: "<base64url>" # Optional. ML-KEM-768 公開鍵（ハイブリッド用）
# l2_layer1_ref: "sha256:..."  # Optional. 未指定ならテンプレートのVCダイジェストから算出
l2_encrypt_default: true       # Optional. トグルの初期状態
l2_user_kid: "user#sig-1"       # Optional. ユーザー署名鍵ID
l2_keywrap:                    # Optional. Passkey での復号を有効化
  alg: "WebAuthn-PRF-AESGCM-v1"
  kid: "issuer#passkey-1"
  credential_id: "base64url(...)"
  prf_salt: "base64url(...)"
  wrapped_key: "base64url(...)"
  aad: "base64url(layer1_ref)"
---
```

### 6.2. ユーザーフロー
1. 発行者が受領者公開鍵込みのフォームを配布
2. ユーザーが通常通り入力
3. 「L2 を暗号化」を ON
4. 送信物が平文ではなく Layer2Encrypted を出力

### 6.3. 出力仕様
暗号化 ON の場合:
- `<script id="weba-l2-envelope" type="application/json">` に暗号化 envelope を埋め込む
- 平文 JSON-LD は出力しない
- `layer1_ref` による AAD バインドを必ず適用

### 6.4. 集計（CSV + JSON オプション）
集計では L2 の JSON をフラット化して CSV に出力できます。配列は `[]`、オブジェクトは `.` で表現します。

例:
- `org.name`
- `items[0].amount`

原文 JSON を保持したい場合は `--include-json` で `_json` 列を追加できます。

**フラット化ルール**:
- オブジェクトは `.` で連結
- 配列は `[index]` を付与
- `null` / `undefined` は CSV 処理に応じて空または null

**例**:
```json
{
  "org": { "name": "ACME" },
  "items": [{ "amount": 1200 }, { "amount": 900 }]
}
```
出力例:
- `org.name` = `ACME`
- `items[0].amount` = `1200`
- `items[1].amount` = `900`

### 6.5. ブラウザ集計（鍵埋め込み）
Aggregator は **ブラウザだけ** で動作させることもできます。受領者の秘密鍵を HTML に埋め込むことで、CLI を使わずに一括復号と CSV 出力が可能です。

Aggregator HTML に鍵ファイルを埋め込みます:
```html
<script id="weba-l2-keys" type="application/json">
{"recipient_kid":"issuer#kem-2025","recipient_x25519_private":"...base64url..."}
</script>
```

これは **Aggregator Escrow** モードに相当します。テンポラリー鍵を集計ツールに仕込み、複数オペレーターが安全に復号・集計できるようにします。

### 6.6. PQC 有効化（ハイブリッド）
PQC は **明示的に有効化した場合のみ** 利用します。`l2_recipient_pqc` に ML-KEM-768 公開鍵を設定すると **X25519 + ML-KEM-768** になります。未設定なら古典暗号のみです。

**CLI 例**:
- PQC 鍵を含めて生成: `bun src/bin/weba-l2-crypto.ts gen-keys --pqc`
- 生成される JSON に `pqc_kem`, `pqc_publicKey`, `pqc_privateKey` が入ります。

**ブラウザ側**:
PQC 復号には ML-KEM-768 のプロバイダを用意し、`webaPqcKem` に登録します。

## 7. ブラウザのみでの復号（Passkey 概念）
Web/A は「単一 HTML で完結する」ことを重視するため、**ブラウザだけで復号できる UI** を想定します。

### 7.1. Key Wrap の考え方
受領者の **CEK** を Passkey 由来の鍵でラップし、HTML 内に埋め込みます。

- フォームに **Key Wrap Package (KWP)** を添付
- Passkey でアンロックすると CEK を復元
- CEK で L2 envelope を復号

### 7.2. 想定データブロック
```json
{
  "weba-l2-envelope": { /* Layer2Encrypted */ },
  "weba-l2-keywrap": {
    "alg": "WebAuthn-PRF-AESGCM-v1",
    "kid": "issuer#passkey-1",
    "wrapped_key": "base64url(...)",
    "credential_id": "base64url(...)",
    "prf_salt": "base64url(...)",
    "aad": "base64url(layer1_ref)"
  }
}
```

### 7.3. アンロックフロー
1. 受領者が HTML を開く
2. 「Unlock (Passkey)」をクリック
3. WebAuthn `get()` を実行
4. ブラウザが CEK を復元し L2 を復号
