# Folio CLI (Local-First Edition) PoC デモ手順書

このドキュメントでは、Web/A Folio のローカル管理機能、入力支援、およびマイナンバーカード（JPKI）と Passkey を連携させた安全な証明書提示のデモ手順を説明します。

---

## 1. 概要
本 PoC は、以下の 3 つの主要機能を実証します。
1.  **Local-First インデックス**: ローカルにある Web/A 文書を SQLite で管理・検索する。
2.  **Assisted Filling**: 過去の履歴からプロフィールを学習し、新しいフォームに自動入力する。
3.  **Holder Binding (JPKI + Passkey)**: マイナンバーカードで身元を保証した Passkey を使い、住民票を安全に提示する。

---

## 2. 事前準備
- **Bun**: v1.0.0 以上がインストールされていること。
- **PC/SC リーダー**: （実機デモを行う場合のみ）マイナンバーカード対応のリーダー。

### セットアップ
```bash
# 作業用 Folio の初期化
mkdir -p work/demo-folio
bun run src/folio/cli.ts --folio work/demo-folio init
```

---

## 3. シナリオ 1: データの管理と自動入力
「過去に提出した書類から自分の情報を学習し、新しいフォームの入力を楽にする」流れを体験します。

### ステップ 1: 過去データのインジェスト
```bash
# 過去の履歴（入力済みデータ）を模したファイルを作成
echo '{"credentialSubject": {"name": "空音 太郎", "email": "taro@srn.example", "address": "東京都千代田区1-1"}}' > work/demo-folio/history/past-form.json

# インデックスに登録
bun run src/folio/cli.ts --folio work/demo-folio ingest work/demo-folio/history/past-form.json
```

### ステップ 2: プロフィールの自動生成
```bash
# 蓄積されたデータから頻出値を集計して profile.json を作成
bun run src/folio/cli.ts --folio work/demo-folio profile create

# 生成された内容の確認
bun run src/folio/cli.ts --folio work/demo-folio profile show
```

### ステップ 3: 新しいフォームへの自動入力
```bash
# 宅配便伝票（サンプル）に、生成したプロフィールを適用
bun run src/folio/cli.ts --folio work/demo-folio form fill shared/forms/postal-demo.md -o work/demo-folio/filled-form.md

# 結果の確認 (value="..." が注入されていることを確認)
grep "空音 太郎" work/demo-folio/filled-form.md
```

---

## 4. シナリオ 2: 安全な証明書提示 (JPKI + Passkey)
「マイナンバーカードで Passkey を保証し、その Passkey で住民票を提示する」高度なセキュリティフローを体験します。

### ステップ 1: Passkey (P-256) DID の作成
```bash
# デバイス固有の鍵（Passkey相当）を作成
bun run src/folio/cli.ts --folio work/demo-folio did create --type p256 --save my-passkey
```
※ 出力された `did:key:zDna...` を控えておきます。

### ステップ 2: JPKI による Passkey 紐付け (Holder Binding)
マイナンバーカードで、「この Passkey は私のものです」という証明書（Binding VC）を作成します。

```bash
# 控えた DID を指定して実行（ここではシミュレーションモードを使用）
bun run src/folio/cli.ts --folio work/demo-folio did bind-jpki [あなたのDID] --sim --output work/demo-folio/binding-vc.json
```

### ステップ 3: 住民票の提示 (VP 作成)
住民票 VC (`juminhyo.html`) と、先ほどの Binding VC をセットにして、Passkey で署名した提示ファイルを作成します。

```bash
bun run src/folio/cli.ts --folio work/demo-folio presentation create dist/srn/juminhyo.html \
  --audience did:web:verifier.example \
  --key-file work/demo-folio/keys/my-passkey.json \
  --binding work/demo-folio/binding-vc.json \
  --output work/demo-folio/presentation.html
```

### ステップ 4: 検証
```bash
bun run src/folio/cli.ts --folio work/demo-folio presentation verify work/demo-folio/presentation.html
```
- **確認ポイント**: 2 つの VC（住民票 + Binding）が含まれており、Passkey で正しく署名されていること。

---

## 5. 発展: 実機のマイナンバーカードを使う場合
PC/SC リーダーを接続し、マイナンバーカードをセットした状態で以下を実行します。

```bash
# --sim を外し、--pin に暗証番号（4桁）を指定
bun run src/folio/cli.ts --folio work/demo-folio did bind-jpki [あなたのDID] --pin [暗証番号] --output work/demo-folio/real-binding-vc.json
```
※ 本物のカードから証明書（利用者証明用）を読み出し、それに基づいた `Binding VC` が作成されます。

---

## 6. おわりに
このデモにより、Folio が単なるファイル保存場所ではなく、**「信頼の起点（JPKI）」と「日常の利便性（Passkey/自動入力）」を繋ぐユーザー中心のデータ基盤**として機能することが確認できました。
