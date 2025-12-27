---
title: "AI エージェントとの連携 (MCP Setup)"
layout: article
description: "Claude Desktop や Cursor などのAIツールから Web/A Folio を利用するための設定方法"
date: 2025-12-27
author: "Sorane Project"
---

# AI エージェントとの連携 (MCP Setup)

Web/A Folio CLI (`folio`) は、**Model Context Protocol (MCP)** サーバーとして動作する機能を内蔵しています。
これにより、Claude Desktop, Cursor, Windsurf といった主要なAIツールから、Web/A Form の読み書きや Folio の管理を直接行うことができます。

当面の間、専用のUIアプリケーションを用意する代わりに、これらの汎用AIツールを Web/A Folio のフロントエンドとして利用することを推奨します。

## サーバーの起動コマンド

リポジトリをクローンした環境では、以下のコマンドで MCP サーバーが起動します。

```bash
# Web/A Folio リポジトリのルートで実行
bun src/folio/index.ts serve
```

## 各ツールの設定方法

### 1. Claude Desktop App

Claude Desktop の設定ファイル (`~/Library/Application Support/Claude/claude_desktop_config.json` など) を開き、`mcpServers` に以下を追加してください。

※ パス (`/path/to/srn`) はご自身の環境に合わせて書き換えてください。

```json
{
  "mcpServers": {
    "weba-folio": {
      "command": "bun",
      "args": [
        "/path/to/srn/src/folio/index.ts",
        "serve"
      ]
    }
  }
}
```

設定を保存して Claude Desktop を再起動すると、チャット画面に 🔌 アイコン等の表示でツールが認識されます。

### 2. Cursor / Windsurf

プロジェクト直下の `.cursor/mcp.json` (または設定画面の MCP Server 追加) に以下のように設定します。

```json
{
  "weba-folio": {
    "command": "bun",
    "args": [
      "${workspaceFolder}/src/folio/index.ts",
      "serve"
    ]
  }
}
```

## 利用シナリオ

設定が完了すると、AIに対して以下のような指示が可能になります。

**例1: フォーム構造の理解**
> 「`sites/weba/content/workcert.md` の入力項目を教えて」
>
> → AIは `weba_parse` ツールを呼び出して JSON Schema を取得し、それを解説します。

**例2: ドラフトの作成**
> 「以下の情報を使って就労証明書のドラフトを作って。
> 氏名: 世田谷 太郎
> 住所: 東京都...」
>
> → AIは `weba_fill` ツールを呼び出し、値が入力された Markdown テキストを生成して回答します。
> ユーザーはその内容をコピーしてファイルに保存するか、「`draft.md` として保存して」とさらに指示することができます。

## 利用可能なツール (Tools)

*   `weba_parse`: 指定された Web/A Form (Markdown) を解析し、入力フィールドの定義を JSON Schema で返します。
*   `weba_fill`: Web/A Form と JSON データを結合し、値を埋め込んだ Markdown を生成します。

---

この仕組みにより、Web/A Folio は**「AIのためのAPIを持つ、人間可読なデータベース」**として機能します。
