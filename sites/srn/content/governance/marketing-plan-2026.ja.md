---
title: "SRN Rebranding & Marketing Plan 2026 (Draft)"
layout: article
author: "SRN Strategy Team"
date: 2026-01-03
description: "「SSG」から「分散型トラストインフラ」へのリブランディング計画および市場参入戦略"
draft: true
---

# SRN Rebranding & Marketing Plan 2026 (Draft)

**Status:** Draft / Proposal

## 1. Executive Summary
**目的:**
Sorane (SRN) の認知を、単なる「静的サイトジェネレーター (SSG)」から、次世代の「分散型トラストインフラ (Infrastructure for Verifiable Data)」へと転換する。
開発者には「手軽なツール」としての実用性を、意思決定者（自治体・企業）には「ガバナンスとセキュリティ」を訴求する。

## 2. Core Identity Shift

| Dimension | Old Identity (SSG Era) | New Identity (SRN Era) |
| :--- | :--- | :--- |
| **Category** | Static Site Generator | Verifiable Data Infrastructure |
| **Core Value** | "Fast & Simple Websites" | "Truth & Data Sovereignty" |
| **Output** | HTML Pages | Signed Resources (VCs/VPs) |
| **User Role** | Web Developer | Trust Architect / Issuer |
| **Metaphor** | "Blogging Engine" | "Digital Notary / Passport Office" |

## 3. Market Strategy: The "Dual Track" Approach

Web/Aの普及には、2つの異なる市場ニーズを同時に満たす「デュアルトラック戦略」を採用する。

### Track A: "Digital Evidence & Data Transparency" (データ透明化)
**Customer Pain (顧客の痛み):**
*   **XML/CSV**: 「システム連携には便利だが、**人間が中身を確認できない**」。送信ボタンを押すとき、『本当に正しい内容か？』という不安が残る。確認のために専用ビューワーや変換ツールを通す手間が発生している。
*   **PDF**: 「人間は読めるが、**データとして再利用できない**」。受け取った側（銀行・行政）で手入力やOCR処理が必要になり、コストとミスの温床になっている。

**Strategic Solution (解決策):**
システム連携の効率性(XML)と、人間の安心感(PDF)を両立させる。
*   **Target (Issuers)**: HR Tech, Fintech, 会計ソフトベンダー。
*   **Target (Verifiers/Users)**: 納税者、行政、金融機関。
*   **Value Proposition**:
    *   **"Human-Centric Data" (WYSIWYS)**:
        *   「見ている画面（HTML）」そのものが「構造化データ（JSON）」として機能する。
        *   ユーザーは内容を目視確認でき、システムはデータを直接取り込める。**「見る」と「使う」の分断を解消する。**
    *   **"Frictionless Verification"**:
        *   専用ソフト不要。ブラウザだけで「署名の有効性」を確認でき、PDFのような「改ざんされていないか？」という不安を取り除く。

*   **Key Message**: 「『システムのためのデータ』を、『人間のための証明書』へ。見る安心と、使う便利さをひとつに。」

### Track B: "Paper Excel Killer" (諸届の高度化)
**Strategic Solution (解決策):**
組織内の非効率な「紙と転記」のプロセスを、デジタルの力で滑らかにする。
*   **Target**: 金融機関、自治体、大企業の事務センター。
*   **Customer Pain**:
    *   顧客：「印刷して記入し、郵送する」手間。
    *   事務側：「届いた紙を開封し、システムに手入力する」コストと入力ミス。
*   **Solution**: **Verified Input Form**.
    *   配布されたHTMLファイルで入力・保存・提出が完結。
    *   既存のシステムを変えずに、入力インターフェース（Front-end）だけをモダナイズし、入力ミスを激減させる。

## 4. Web/A Maturity Model (Market Adoption Phases)

「卵が先か鶏が先か」を解決するため、発行者単独でもメリットがある段階から、社会インフラ化までを3段階で定義し、段階的に訴求を変化させる。

### Level 1: "My Data to My Agent" (AIとの対話不全の解消)
*   **Target**: **MCP Builders, AI Hackers, RAG Engineers**.
    *   自分でMCPサーバーを書いたり、LangChainでパイプラインを組んでいる層。
*   **Customer Question**: 「なぜ、PDFのパースにこんなに苦労するのか？ OCRの精度に一喜一憂するのは無駄ではないか？」
*   **The Answer (Quick Hack)**: **"The Zero-Parsing Document."**
    *   Web/Aなら、複雑なPDFパーサーなど不要。HTMLの中からJSONを1行で取り出すだけ。
    *   **「Web/Aは、MCP/RAGにとって最も『栄養価の高い』ファイル形式である」**。
*   **Action**: 
    *   **"Web/A MCP Server"**: フォルダ内のWeb/Aファイルを一瞬でインデックス化し、LLMに提供するリファレンス実装（OSS）を配布する。
    *   「PDFパーサーを書くのをやめて、Web/Aを使おう」というナラティブをDeveloper Communityで形成する。

### Level 2: "Orchestrated Ecosystem" (組織間連携の高度化) ★Current Focus
*   **戦略骨子**: 既存ベンダーを敵に回さず、システム間の隙間を埋める「潤滑油」として機能させる。
*   **Target A: 調達・購買部門 (Procurement)**
    *   **Vision**: **"AI-Assisted Procurement"**.
    *   **Solution**:
        *   Web/Aで見積を受け取れば、調達支援エージェントが内容を読み取り、比較表作成やリスク分析を即座に行う。
        *   既存の購買システムとも、エージェントを介して滑らかにデータ連携する。
*   **Target B: 人事・労務部門 (Internal Admin)**
    *   **Vision**: **"Frictionless HR"**.
    *   **Solution**:
        *   従業員への証明書発行や申請処理を、AIエージェントが自律的に処理する基盤としてWeb/Aを採用。
        *   既存のHRシステムをリプレースせず、その「ラストワンマイル（従業員との接点）」をWeb/Aで高度化する。
*   **Key Action**: 
    *   **Agent Demo**: 複数のWeb/A見積書をフォルダに入れるだけで、AIが比較レポートを出力するデモ。
    *   **Partnering**: 既存ベンダーに対し、「貴社システムをAI Agent Readyにするための出力形式」としてWeb/Aを提案する。

### Level 3: "Institutional Trust" (社会インフラ化フェーズ)
*   **主体**: 民間 → 行政・金融機関 (B2G, B2Financial)。
*   **Value**: **「法的証明力と自動審査」**。
*   **Pain**: 膨大な添付書類の審査・突合コスト。
*   **Solution**: Web/A提出により、審査プロセスを自動化（Automation）。
*   **Key Action**: Level 2で蓄積した実績を元に、行政の電子申請システムでの受入を働きかける。

## 5. Phased Rollout Strategy (Updated)

### Phase 1: "Evidence PoC" (Current - Q1 2026)
*   **Focus**: Level 2 (B2B Efficiency) の実証。
*   **Action**:
    *   **5大Evidence（就労証明、領収書、明細書、クレカ、控除証明）** の高品質なサンプルを公開。
    *   「データとして使える」ことを示すための、簡易ビューワー（JSON-LD可視化）の実装。
*   **Goal**: 「PDFより便利だ」という実感を開発者・企画者に持たせる。

### Phase 2: "Form Utilitarian" (Q2 2026)
*   **Focus**: Track B (Paper Excel Killer).
*   **Action**:
    *   **Folio CLI** を活用し、中小企業や個人が「手元のPC」で電子申請データを作成・管理できる環境を提供する。
    *   金融機関等の「諸届（住所変更届など）」をWeb/A化するテンプレートを配布。

### Phase 3: "Ecosystem" (2H 2026+)
*   **Goal**: 民間（発行）と行政（受領）をつなぐ標準インフラ化。
*   **Action**:
    *   行政手続きの添付書類としてWeb/Aファイルが正式に認められるようロビイング。

## 5. Action Items (Immediate)

1.  **Terminology Audit**:
    *   サイト内の "SSG", "Static Site" という言葉を精査し、文脈に応じて "Generator", "Compiler", "Protocol" 等へ置き換える。
    *   ただし、技術的な説明（「静的ファイルとしてホストできる」等）においてはSSGという表現を残し、メリットとして活用する。

2.  **Hero Message Refinement**:
    *   Topページのキャッチコピーを「Webサイトビルダー」から「信頼の基盤」へシフト（※実施中）。

3.  **Content Restructuring**:
    *   `sites/srn/content/` のディレクトリ構造を見直し、`blog` (個人の発信) と `docs` (インフラの仕様) を明確に分離する。現在の混在状態はブランディング上のノイズ。

4.  **Governance as Content**:
    *   「模擬演習」を単なる遊びではなく、SRNが提供する「透明性保障機能」のショーケースとして位置づける。

---
**Memo:**
ユーザー（Tech Lead）は現在コード修正（SSGコアロジック）に集中しているため、これ以上の実装タスクは積まないこと。
本プランの合意が取れ次第、次の「ドキュメント修正」フェーズへ移行する。
