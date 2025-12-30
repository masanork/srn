## � Status: Stable & Production Ready (Experimental Prototype)

> [!CAUTION]
> **免責事項 / Disclaimer**
>
> 本機能（Guest DID / WebAuthn）は、あくまで**個人的な趣味の範囲で短期間に作成されたプロトタイプ**です。
> 実用上の品質検証、パフォーマンス試験、および専門家によるセキュリティ監査は一切行われていません。
>
> 1. **無保証**: 内容の正確性や安全性について、いかなる保証も行いません。
> 2. **自己責任**: 本機能の利用により生じた損害やトラブルについて、開発者は一切の責任を負いません。
> 3. **非商用**: 重要データの管理や商用サービスでの利用は非推奨です。
>
> This function is an experimental prototype created for hobby purposes. Use at your own risk.

### 1. 修正された内容
*   **SimpleWebAuthn v13 API 同期**:
    *   ライブラリの破壊的修正（`authenticator` → `credential` への変更）により発生していた「読み取り不能プロパティ（counter）」エラーを完全に修正しました。
*   **堅牢な認証ロジック**:
    *   `verifyAuthenticationResponse` および `verifyRegistrationResponse` におけるプロパティ参照（`publicKey`, `counter`）を最新のネスト構造に合わせて最適化しました。
    *   非推奨の `functions.config()` を廃止し、最新の `firebase-functions/params` に移行しました。
*   **クロス環境対応**:
    *   クライアント（Browser）側で `localhost` か本番ドメインかを自動判別し、適切な API エンドポイントに接続するロジックを実装しました。

### 2. 現在の設定値（Resource Configuration）
本番デプロイ時に使用したパラメータは以下の通りです。
*   **RP_ID**: クライアントドメイン（例: `sorane-7ea46.web.app`）
*   **EXPECTED_ORIGINS**: 許可されたオリジンURLのリスト
*   **GUEST_DID_DOMAIN**: DIDの識別子ドメイン
*   **REQUIRE_USER_VERIFICATION**: `true` (推奨) または `false`

### 3. 未開発・今後の課題
*   **自動消去機能**: 現在 `cleanupGuestDids` (Scheduled Function) として実装済みですが、実稼働環境での挙動確認が必要です。
*   **DID Document 向上**: `did:web` 経由での公開キー配布の完全自動化。

---
*Created by Antigravity (Advanced Agentic Coding)*
