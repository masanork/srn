
---
title: "Web/A Form 開発者ガイド"
layout: article
description: "Web/A Form のアーキテクチャ、独自構文、開発フローの詳細ガイド。"
date: 2025-12-27
author: "Sorane Project"
---

# Web/A Form 開発者ガイド

Web/A Form は、Markdown で定義可能な、サーバーレス・ファイルベースの業務アプリケーション基盤です。
本ドキュメントでは、Web/A Form のアーキテクチャ、ソースコード構成、および開発ツール（Maker/CLI）の使用方法について解説します。

## 1. アーキテクチャ概要

Web/A Form は「定義（Markdown）」、「生成（Generator）」、「実行（Runtime）」の3つのフェーズで構成されています。

1.  **定義 (Definition)**: 独自の拡張 Markdown 構文を用いて、フォームの構造、入力項目、計算式を記述します。
2.  **生成 (Generation)**: 定義ファイルを解析し、HTML/CSS/JS が一体となった単一の HTML ファイル（`.html`）を生成します。
3.  **実行 (Runtime)**: 生成された HTML ファイルをブラウザで開くことで、入力フォームとして機能します。入力データは JSON-LD として埋め込まれ、ローカル保存や再編集が可能です。

## 2. ディレクトリ構成

ソースコードは `src/form/` ディレクトリに集約されています。機能ごとにモジュール分割されており、高い保守性を維持しています。

| ファイル | 役割 |
|---|---|
| `src/form/parser.ts` | Markdown パーサー。テキストを解析し、HTML フラグメントとメタデータ構造を返します。 |
| `src/form/renderer.ts` | HTML レンダラー。各フォーム部品（Input, Select, Table等）の HTML 文字列生成を担当します。 |
| `src/form/generator.ts` | 完全な HTML ファイルを生成するための統合モジュール。CSS や Runtime Script を埋め込みます。 |
| `src/form/cli.ts` | CLI ツール。コマンドラインから Markdown ファイルを Web/A Form (HTML) に変換します。 |
| `src/form/browser_maker.ts` | Web/A Maker (ブラウザ版エディタ) 用のエントリーポイント。 |
| `src/form/weba.test.ts` | 上記モジュールの回帰テスト (Regression Test) コード。 |

## 3. 開発フロー

プロジェクトは [Bun](https://bun.sh) ランタイムを使用しています。

### 3.1 依存関係のインストール

```bash
bun install
```

### 3.2 テストの実行

開発時は必ずリグレッションテストを実行し、既存機能への影響がないことを確認してください。

```bash
bun test src/form/weba.test.ts
```

### 3.3 ブラウザ版 Maker のビルド

`src/form/browser_maker.ts` をバンドルし、Web/A Maker (`sites/weba/static/maker.html`) で読み込まれる `mkform.js` を生成します。

```bash
bun build src/form/browser_maker.ts --outfile sites/weba/static/mkform.js
```

### 3.4 CLI ツールの使用

開発中の動作確認や、バッチ処理によるフォーム生成には CLI ツールが便利です。

```bash
# 基本的な使い方
bun src/form/cli.ts input.md > output.html
```
