# Agent Rules & Guidelines (Overview)

このプロジェクトでは、AIエージェントと開発者の一貫性を保つため、ルールを構造化して管理しています。
かつて `AGENTS.md` に記載されていた情報は、詳細度と役割に応じて以下のディレクトリに移行されました。

## Rules Index

詳細なルールについては、各ファイルを参照してください。

- **[.agent/rules/ROLES.md](.agent/rules/ROLES.md)**
    - サブエージェント（codebase_investigatorなど）の役割。
    - ガバナンス委員会、Red Teamなどのシミュレーション上の役割定義。
- **[.agent/rules/CONVENTIONS.md](.agent/rules/CONVENTIONS.md)**
    - コーディング規約（TypeScript, Bun）。
    - ドキュメントスタイル（Markdown Frontmatter, Mermaid）。
    - ビルドコマンドとディレクトリ構造。
- **[.agent/rules/WORKFLOW.md](.agent/rules/WORKFLOW.md)**
    - TDD（テスト駆動開発）のサイクル。
    - リリース管理とリリースノートの更新ルール。
    - ドキュメントの承認（Staging）プロセス。
- **[.agent/rules/INVARIANTS.md](.agent/rules/INVARIANTS.md)**
    - Web/A の設計思想（Self-Containment, Asset Inlining）。
    - セキュリティ上の不変条件（秘密鍵のコミット禁止など）。
- **[.agent/rules/GOVERNANCE.md](.agent/rules/GOVERNANCE.md)**
    - ガバナンス委員会の運用ルール。
    - 模擬ドキュメントにおける免責事項（Disclaimer）の記載義務。

---
AIエージェントは、これらのルールを読み込み、常に遵守することが求められます。
人間がルールを更新する場合は、上記の中から適切なファイルを選択して修正してください。
