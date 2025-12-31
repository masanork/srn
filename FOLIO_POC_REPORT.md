# Folio POC 作業報告書およびテスト手順書

**日付:** 2025-12-31
**担当:** Folio POC Implementation Agent

---

## 1. エグゼクティブサマリ

Folio POC (Proof of Concept) における「JPKIカードを用いたWeb/A署名生成」のコア機能実装が完了しました。
RustによるJPKI制御ロジック、WASMを介したブラウザ/CLI連携、および実機（マイナンバーカード＋ICカードリーダー）で動作するためのドライバ実装を含みます。

迅速なトラブル解決と実装への評価をいただき、感謝申し上げます。

## 2. 実装内容詳細

### 2.1 Core Logic (Rust/WASM)
*   **WASMコントローラー拡張**: `packages/folio-core/src/lib.rs` を更新し、`verify_pin`（PIN検証）および `compute_signature`（デジタル署名作成）メソッドを JavaScript 側へ公開しました。
*   **JPKIロジック**: `jpki.rs` に APDU コマンド（VERIFY: 0x20, COMPUTE DIGITAL SIGNATURE: 0x2A）の実装を追加しました。

### 2.2 CLI (Node.js/Bun)
*   **実機対応**: `packages/folio-cli/src/pcsc.ts` のモック処理を廃止し、`@pokusew/pcsclite` を用いた PC/SC 通信に置き換えました。
*   **コマンド実装**:
    *   `folio check`: JPKIカードへの接続テスト、Auth AP選択、証明書読み取り確認。
    *   `folio present`: PIN検証（デモ用固定PIN）、チャレンジへの署名、Verifiable Presentation (VP) の生成。

### 2.3 Browser (Web/A Demo)
*   **CCIDドライバ**: `sites/demo/ccid.js` を新規作成し、WebUSB API を用いてブラウザから直接スマートカードと通信する簡易CCIDドライバを実装しました。
*   **デモアプリ**: `sites/demo/bank-account-opening.html` を更新し、上記ドライバを使用して「カード接続 → PIN入力 → 署名」のフローを実機で行えるようにしました。

---

## 3. テスト手順書

本手順は、対応するハードウェア（PC/SC対応ICカードリーダーおよびマイナンバーカード）が接続されていることを前提とします。

### 3.1 CLI 検証手順 (CLI -> PC/SC -> Card)

**前提**: 
*   `bun install` がルートで実行済みであること。
*   PC/SC サービスが稼働していること（macOS/Linux/Windows標準）。

**手順 1: 接続チェック**
```bash
cd packages/folio-cli
bun bin/folio.ts check
```
*   **期待値**: 
    *   "PC/SC Listening..." と表示される。
    *   カードを挿入すると "Card inserted" -> "Protocol: ..." と表示される。
    *   "JPKI AP Selected Successfully!" および証明書の読み取り（バイト列表示）が成功する。

**手順 2: 署名とVP生成**
```bash
# 入力用VC（既存または folio issue で作成）を用意
echo '{"test":"vc"}' > test_vc.json

# 署名実行 (PINはコード内で "1234" に固定されているため、実際のカードで試す場合はコードを書き換えるか、ダミーカードを使用してください)
# 注意: 本番カードで誤ったPINを "1234" として送るとロックされる可能性があります。
# テスト時は packages/folio-cli/bin/folio.ts の PIN を正しいものに書き換えてください。
bun bin/folio.ts present -i test_vc.json -a example.com -o output.html
```
*   **期待値**:
    *   PIN検証成功 ("PIN Verified")。
    *   署名生成成功 ("Signature Generated: ...")。
    *   `output.html` が生成される。

### 3.2 ブラウザ検証手順 (Browser -> WebUSB -> Card)

**前提**:
*   WebUSB 対応ブラウザ (Chrome, Edge 等) を使用。
*   **重要**: macOS等の場合、OSのPC/SCサービスがカードリーダーを占有しているとWebUSB接続に失敗します。検証時は一時的にサービスを停止するか、WebUSB専用ドライバが必要な場合があります。
    *   macOS停止例: `sudo pkill -9 com.apple.ifdreader` (自己責任で実行)

**手順**:
1. ローカルサーバーを起動（例: `python3 -m http.server` を `sites/demo` で実行、または VS Code Live Server）。
2. ブラウザで `bank-account-opening.html` を開く。
3. カードリーダーを接続し、カードを挿入。
4. **"Connect Reader"** ボタンを押下。
    *   ブラウザのデバイス選択ポップアップでリーダーを選択。
    *   ログに "Card Powered On", "JPKI AP Selected" が表示されることを確認。
5. **認証ステップ**:
    *   PIN入力欄に正しいPINを入力（署名用または利用者証明用。デモコードは `EF_AUTH_PIN` をターゲットにしています）。
    *   **"Authenticate & Sign"** を押下。
    *   ログに "PIN Verified", "Signature Created!" が表示されれば成功。

---

## 4. テストカバレッジ報告

### 4.1 TypeScript (CLI/Web)
`bun test --coverage` の実行結果概要:
*   **全体カバレッジ**: 概ね 80% 以上を維持しており良好です。
*   **Folio関連**:
    *   `packages/folio-cli`: 統合テスト (`tests/folio_cli_integration.test.ts`) によりCLIコマンドの引数処理等はカバーされていますが、PC/SC通信部分（ハードウェア依存）はモックまたは実機テストに依存します。
    *   `sites/demo`: E2Eテスト自動化は未実装です。
*   **課題**: `tests/link_integrity.test.ts` でリンク切れエラー（26件）が検出されています。これはFolio実装とは直接関係ありませんが、ドキュメント生成等の別タスクで修正が必要です。

### 4.2 Rust (Core)
`cargo test` の実行結果:
*   **テスト数**: 0
*   **現状**: `packages/folio-core` 内には現在ユニットテストコードが含まれていません。ロジックは実装済みですが、`crypto.rs` (署名検証) や `apdu.rs` (コマンド生成) の単体テストを追加することを推奨します。

---

**以上**
