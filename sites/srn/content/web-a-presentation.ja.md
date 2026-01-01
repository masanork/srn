---
title: "Web/A in One Deck: HTML完結プレゼンテーション"
description: "記事として読めて、そのまま全画面スライドにもなるWeb/A紹介資料。依存ゼロ、1ファイルで完結するドキュメントプラットフォーム。"
layout: article
lang: ja
presentation: true
presentation_template: sorane
date: 2025-12-29
ai_generated: true
---

<div class="slide-cover">
<div class="slide-logo">空音 (SORANE)</div>
<h1>Web/A in One Deck</h1>
<div class="slide-divider"></div>
<p class="slide-subtitle">Web/Aは「読む・配る・検証する」を<strong>1つのHTMLファイル</strong>で完結させる、アーカイブ指向のドキュメント形式です。</p>
</div>

---

<div class="slide-section">
<div class="slide-kicker">Context</div>
<h2>なぜ今、Web/Aなのか</h2>
<div class="slide-divider"></div>
<ul>
  <li>PDFは強いが、<strong>構造化・検証・ライフサイクル管理</strong>に弱い</li>
  <li>Webブラウザは柔軟だが、<strong>長期保存</strong>や真正性の保証に弱い</li>
  <li>現場は「<strong>配布のしやすさ</strong>」と「<strong>信頼性</strong>」の両立に課題を抱えている</li>
</ul>
</div>

---

<div class="slide-card">
<h2>設計思想：HTML完結（HTML-Complete）</h2>
<ul>
  <li>依存リソースゼロの<strong>単一HTML</strong>配信</li>
  <li>フォントも画像もすべて<strong>Base64で埋め込み済み</strong></li>
  <li>オフラインでも、将来のブラウザでも<strong>「読める」</strong>ことを最優先</li>
</ul>
</div>

---

<div class="slide-split">
<div>
<h2>Web/Aの4層モデル</h2>
<ul>
  <li><strong>Layer 1:</strong> Template（規約・意味論）</li>
  <li><strong>Layer 2:</strong> Data（事実・エビデンス）</li>
  <li><strong>Layer 3:</strong> Context（管理・配送属性）</li>
  <li><strong>Layer 4:</strong> Presentation（視覚的表示・UI）</li>
</ul>
</div>
<div class="presentation-figure">
<svg width="600" height="420" viewBox="0 0 600 420" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
    </marker>
    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
    </marker>
  </defs>
  <rect width="600" height="420" fill="#F8FAFC"/>
  <rect x="40" y="30" width="520" height="360" rx="12" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  <text x="60" y="55" font-family="system-ui" font-size="14" font-weight="700" fill="#64748B">Web/A ドキュメント (.html)</text>

  <!-- Layer 4: Presentation -->
  <rect x="60" y="70" width="480" height="40" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="75" y="90" font-family="system-ui" font-size="11" font-weight="700" fill="#475569">Layer 4: Presentation (UI / View)</text>
  <text x="75" y="103" font-family="system-ui" font-size="9" fill="#64748B">CSS、フォント、表示ロジック</text>

  <!-- Layer 3: Context -->
  <rect x="60" y="115" width="480" height="45" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="75" y="132" font-family="system-ui" font-size="11" font-weight="700" fill="#92400E">Layer 3: Context (Metadata / Routing)</text>
  <text x="75" y="145" font-family="system-ui" font-size="9" fill="#92400E">配送タグ、有効期限、Nonce、ポリシー参照</text>

  <!-- Layer 2: Data -->
  <rect x="60" y="165" width="480" height="65" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="75" y="185" font-family="system-ui" font-size="11" font-weight="700" fill="#047857">Layer 2: Data (Facts / Records)</text>
  <text x="75" y="202" font-family="system-ui" font-size="9" fill="#065F46">暗号化ペイロード、利用者署名 (VP)</text>

  <!-- Link to Layer 1 -->
  <path d="M300 230V240" stroke="#10B981" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Layer 1: Template -->
  <rect x="60" y="240" width="480" height="130" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="265" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA">Layer 1: Template (Definition / Core)</text>

  <rect x="80" y="280" width="200" height="45" rx="4" fill="white" stroke="#6366F1"/>
  <text x="90" y="295" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA">人間用（可読）</text>
  <text x="90" y="312" font-family="system-ui" font-size="9" fill="#64748B">HTML / テンプレート</text>

  <!-- Semantic Mapping -->
  <path d="M280 302H320" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-blue)" marker-start="url(#arrow-blue)"/>
  <text x="300" y="297" font-family="system-ui" font-size="8" fill="#6366F1" text-anchor="middle" font-weight="bold">等価</text>

  <rect x="320" y="280" width="200" height="45" rx="4" fill="white" stroke="#6366F1"/>
  <text x="330" y="295" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA">マシン用（定義）</text>
  <text x="330" y="312" font-family="system-ui" font-size="9" fill="#64748B">JSON-LD / ロジック</text>

  <rect x="80" y="335" width="440" height="25" rx="4" fill="#6366F1" fill-opacity="0.1"/>
  <text x="300" y="352" font-family="system-ui" font-size="10" font-weight="700" fill="#4338CA" text-anchor="middle">発行者署名: Ed25519 + PQC (耐量子)</text>
</svg>
</div>
</div>

---

## 強み 1: 配付が圧倒的に容易

- 送るのは**HTMLファイル1つ**だけ
- 受け取った側はOSを問わず**ブラウザで開くだけ**
- 閲覧環境によるフォント崩れや消失のリスクを排除

---

## 強み 2: 真正性を内蔵

- 埋め込み署名による**改ざん検知**
- Passkey (WebAuthn) による**本人確認**
- ブラウザ上で誰でも検証可能な**検証ログ**

---


---

## 強み 3: LTV保証（長期検証）

- **リビルド耐性**: 2030年に2025年の署名を無効化せずに、誤字の修正やデザイン刷新が可能。
- **オフライン検証**: トラストアンカー（DID）をファイル自身に埋め込み、自己完結。
- **長期証明**: 発行元の組織が消滅しても、文書単独で真正性を証明可能。

---

## Web/A Form

- 低頻度・高価値な業務（申請、契約、調査）に最適
- 作成、署名、提出までが**ブラウザ内で完結**
- 集約ツールを用いて、ローカルで**一括集計**が可能

---

## Web/A L2 Encryption

- 送信時に**受領者（Issuer）限定でデータを暗号化**
- Layer 1（テンプレート）への参照を含む認証付き暗号 (AAD)
- Passkeyファーストのシームレスな体験

---

## Web/A Folio

- 個人や組織が「証拠」を束ねる**データコンテナ**構想
- 履歴、証明書、申請書を自身の管理下に置く
- AIとの協業を前提とした**構造化データ基盤**

---

## AI-First Workflow

- エージェントが文書の**構造と署名**を直接処理
- 自動入力支援、内容の自動要約、真正性の自動検証
- **Human-Machine Parity**（人間と機械の対等な理解）

---

## Presentationモード

- 本ページ自体が、そのまま**プレゼンスライド**になります
- 「スライド」ボタンで全画面表示に切り替え
- 外部ツール不要で、配布・共有・アーカイブが可能

---

## まとめ

- Web/Aは**HTMLネイティブ**なドキュメント・プラットフォーム
- 保存性・配布性・検証性の三要素を同時に満たす
- 「静的な記録」から「**自律的に動くデータ**」へ

---

## 次のステップ

- **Web/A Form Maker** でフォームを作成してみる
- 既存のドキュメントを Web/A 形式に変換する
- 組織内のデータ収集・配布フローに Web/A を適用する
