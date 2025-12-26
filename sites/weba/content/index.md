---
title: "Web/A Form: ローカルファーストな業務フォーム基盤"
date: 2025-12-26
description: "SaaS不要。HTMLファイル1つで完結する、最もシンプルなDX。"
layout: article
---

<div class="hero-section" style="background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 60px 20px; text-align: center; border-radius: 8px; margin-bottom: 40px;">
  <h1 style="margin-bottom: 20px; font-size: 2.5em;">Web/A Form</h1>
  <p style="font-size: 1.2em; color: #555; margin-bottom: 30px;">
    <strong>SaaS不要。HTMLファイル1つで完結する、最もシンプルなDX。</strong><br>
    Markdownで定義し、配布・入力・集計までをローカルファーストで実現します。
  </p>
  <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
    <a href="./maker.html" class="button primary" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Maker を試す</a>
    <a href="./papers/web-a-form.ja.html" class="button" style="background: white; color: #333; border: 1px solid #ccc; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Whitepaper を読む</a>
  </div>
</div>

## コンセプト

Web/A Form は、**「ファイル」**としてのアプリケーションです。
専用のサーバーやアカウントは必要ありません。HTMLファイルをメールやチャットで送るだけで、誰でもフォーム入力業務を開始できます。

*   **Markdown Driven**: フォームの定義はシンプルなテキストファイル。Gitでバージョン管理が可能です。
*   **Serverless & Portable**: 動作に必要なのは Webブラウザだけ。ネット環境がないオフライン環境でも動作します。
*   **AI Ready**: 構造化データ (JSON-LD) を内包しており、AIエージェントによる自動入力やデータ集計が容易です。

---

## コンテンツ

<div class="grid-layout" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">

  <div class="card" style="border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <h3>📄 Whitepaper</h3>
    <p>Web/A Form の詳細な仕様、利用シーン、既存の非効率なSaaS依存からの脱却シナリオについて解説します。</p>
    <a href="./papers/web-a-form.ja.html">詳細を見る →</a>
  </div>

  <div class="card" style="border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <h3>🛠️ Web/A Maker</h3>
    <p>ブラウザ上で Markdown を記述し、リアルタイムにフォームをプレビュー・生成できるツールです。</p>
    <a href="./maker.html">Maker を起動 →</a>
  </div>

  <div class="card" style="border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <h3>👩‍💻 Developer Guide</h3>
    <p>アーキテクチャ詳細、CLIツールの使い方、ソースコードの構成など、開発者向けの情報です。</p>
    <a href="./guide.html">ガイドを読む →</a>
  </div>

  <div class="card" style="border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <h3>🤖 AI & Prompts</h3>
    <p>AI を使って既存の Excel 帳票を Web/A Form に変換したり、集まったデータを集計するためのプロンプト集です。</p>
    <a href="./prompt.html">プロンプト集を見る →</a>
  </div>

</div>

---

## 利用シーン

*   **組織横断的な申請業務**: アカウント発行が面倒な社外パートナーとのやり取りに。
*   **低頻度・長寿命なフォーム**: 年に数回しか使わないが、数年間維持する必要がある帳票に。
*   **セキュアなローカル環境**: 機密性が高く、外部クラウドにデータを置きたくない業務に。

---

## 開発と貢献

Web/A Form はオープンソースプロジェクトとして開発されています。
ソースコードは [SRN Repository](https://github.com/masanork/srn) で管理されています。
技術的な貢献やフィードバックは、Issue または Pull Request お待ちしています。
