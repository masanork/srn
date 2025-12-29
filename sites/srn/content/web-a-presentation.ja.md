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
<h2>Web/Aの3層モデル</h2>
<ul>
  <li><strong>Layer 1:</strong> Signed Content（不変の真正データ）</li>
  <li><strong>Layer 2:</strong> Confidential Payload（機密性の高い入力データ）</li>
  <li><strong>Layer 3:</strong> Presentation（可変のレイアウト・UI）</li>
</ul>
</div>
<div class="presentation-figure">
<svg width="600" height="460" viewBox="0 0 600 460" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="weba-structure-title weba-structure-desc" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
  <title id="weba-structure-title">Web/A 文書構造</title>
  <desc id="weba-structure-desc">Web/AのHTMLファイルには3層がある。Layer 3は将来のために更新できるプレゼンテーション（CSS/フォント）。Layer 2は利用者の回答・同意をPasskeyで署名した層で、Layer 1への参照を含む。Layer 1は発行者署名の原本で、人間可読HTMLと機械可読JSON-LDが対応付けられ、発行者署名で保護される。</desc>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
    </marker>
    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
    </marker>
  </defs>
  <rect width="600" height="460" fill="#F8FAFC"/>
  <rect x="40" y="30" width="520" height="400" rx="12" fill="white" stroke="#E2E8F0" stroke-width="2"/>
  <text x="60" y="55" font-family="system-ui" font-size="14" font-weight="700" fill="#64748B">Web/A Document (.html)</text>

  <!-- Layer 3: Presentation -->
  <rect x="60" y="70" width="480" height="50" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-dasharray="4 4"/>
  <text x="75" y="95" font-family="system-ui" font-size="13" font-weight="700" fill="#475569">Layer 3: Portable Presentation (View)</text>
  <text x="75" y="110" font-family="system-ui" font-size="10" fill="#64748B">CSS・フォント等（将来の互換性のために差し替え可能）</text>

  <!-- Layer 2: User Signed -->
  <rect x="60" y="130" width="480" height="80" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="75" y="155" font-family="system-ui" font-size="13" font-weight="700" fill="#047857">Layer 2: User-Signed Context (回答・事実の入力)</text>
  <text x="75" y="175" font-family="system-ui" font-size="11" fill="#065F46">利用者の回答・合意データ</text>
  <text x="75" y="190" font-family="system-ui" font-size="11" fill="#065F46">Passkey 等による利用者署名 (VP)</text>
  <!-- Link to Layer 1 -->
  <path d="M300 210V220" stroke="#10B981" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Layer 1: Issuer Signed -->
  <rect x="60" y="220" width="480" height="150" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="245" font-family="system-ui" font-size="13" font-weight="700" fill="#4338CA">Layer 1: Issuer-Signed Core (原本・テンプレート)</text>

  <rect x="80" y="260" width="200" height="60" rx="4" fill="white" stroke="#6366F1"/>
  <text x="90" y="280" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">人間可読レイヤー</text>
  <text x="90" y="300" font-family="system-ui" font-size="11" fill="#64748B">HTML / セマンティック構造</text>

  <!-- Semantic Mapping -->
  <path d="M280 290H320" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-blue)" marker-start="url(#arrow-blue)"/>
  <text x="300" y="285" font-family="system-ui" font-size="9" fill="#6366F1" text-anchor="middle" font-weight="bold">Mapping</text>

  <rect x="320" y="260" width="200" height="60" rx="4" fill="white" stroke="#6366F1"/>
  <text x="330" y="280" font-family="system-ui" font-size="12" font-weight="700" fill="#4338CA">機械可読レイヤー</text>
  <text x="330" y="300" font-family="system-ui" font-size="11" fill="#64748B">JSON-LD / ロジック</text>

  <rect x="80" y="330" width="440" height="25" rx="4" fill="#6366F1" fill-opacity="0.1"/>
  <text x="300" y="347" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA" text-anchor="middle">発行者署名: Ed25519 + PQC (耐量子)</text>
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

## Web/A Form

- 低頻度・高価値な業務（申請、契約、調査）に最適
- 作成、署名、提出までが**ブラウザ内で完結**
- 集約ツールを用いて、ローカルで**一括集計**が可能

---

## Web/A L2 Encryption

- 送信時に**受領者（Issuer）限定でデータを暗号化**
- Layer 1（原本）に関連付けられた認証付き暗号 (AAD)
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
