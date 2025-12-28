---
title: "Web/A in One Deck: HTML完結プレゼンテーション"
description: "記事として読めて、そのまま全画面スライドにもなるWeb/A紹介資料。"
layout: article
lang: ja
presentation: true
date: 2025-02-01
---

# Web/A in One Deck

Web/Aは「読む・配る・検証する」を**1つのHTML**で完結させる、アーカイブ指向のドキュメント形式です。

---

## なぜ今、Web/Aなのか

- PDFは強いが、**更新・検証・構造化**に弱い
- Webは柔軟だが、**長期保存**や真正性に弱い
- 現場は「**配りやすさ**」と「**信頼性**」の両立に困っている

---

## Web/A = HTML完結のアーカイブ

- 依存ゼロの**単一HTML**
- フォントも画像も**埋め込み済み**
- オフラインで**100年読める**ことを前提に設計

---

## Web/Aの3層モデル

- **Layer 1: Signed Content**（署名付きの不変データ）
- **Layer 2: Confidential Payload**（受領者限定の暗号化）
- **Layer 3: Presentation**（可変レイアウト/UI）

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
  <text x="75" y="110" font-family="system-ui" font-size="10" fill="#64748B">CSS・フォント等（将来のブラウザ対応のため更新可能）</text>

  <!-- Layer 2: User Signed -->
  <rect x="60" y="130" width="480" height="80" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="75" y="155" font-family="system-ui" font-size="13" font-weight="700" fill="#047857">Layer 2: User-Signed Context (利用者による事実の入力)</text>
  <text x="75" y="175" font-family="system-ui" font-size="11" fill="#065F46">利用者の回答・同意データ</text>
  <text x="75" y="190" font-family="system-ui" font-size="11" fill="#065F46">Passkey 等による利用者署名 (VP)</text>
  <!-- Link to Layer 1 -->
  <path d="M300 210V220" stroke="#10B981" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Layer 1: Issuer Signed -->
  <rect x="60" y="220" width="480" height="150" rx="6" fill="#EEF2FF" stroke="#6366F1" stroke-width="2"/>
  <text x="75" y="245" font-family="system-ui" font-size="13" font-weight="700" fill="#4338CA">Layer 1: Issuer-Signed Core (発行者による原本・テンプレート)</text>

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
  <text x="300" y="347" font-family="system-ui" font-size="11" font-weight="700" fill="#4338CA" text-anchor="middle">発行者署名: Ed25519 + ML-DSA-44 (耐量子)</text>
</svg>
</div>

---

## 強み 1: 配布が圧倒的にラク

- 送るのは**1ファイルだけ**
- 受け取った側は**ブラウザで開くだけ**
- 「環境依存」や「再現性のズレ」を消せる

---

## 強み 2: 正当性を内蔵できる

- 埋め込み署名で**改ざん検出**
- Passkeyで**本人性**を担保
- 表示側で**検証ログ**まで残せる

---

## Web/A Form

- 低頻度・高価値な業務に特化したフォーム
- 入力 → 署名 → 保存まで**ブラウザだけ**
- さらに**集計HTML**でローカル集計も可能

---

## Web/A L2 Encryption

- 送信時に**受領者限定で暗号化**
- L1参照に結び付いたAADで**改ざん耐性**
- WebAuthn/Passkeyと**シームレスに連携**

---

## Web/A Folio

- 個人や組織の**データコンテナ**という発想
- 履歴・証明・申請を**ひとつの束**で持つ
- AIとの協業を想定した**データ構造**

---

## AI-First Workflow

- 文章だけでなく、**構造と署名**をAIが扱える
- 入力支援、要約、検証ログの自動生成
- **Human-Machine Parity**を前提に設計

---

## Presentationモード

- このページ自体が**営業スライド**になる
- 全画面で**紙芝居**のように見せられる
- そのまま**配布・共有・保存**ができる

---

## まとめ

- Web/Aは**HTML完結**のドキュメント基盤
- 保存性・配布性・検証性を同時に満たす
- 「読むだけ」から「**使える**」ドキュメントへ

---

## Next Step

- Web/A Form Maker を試す
- 既存ドキュメントをWeb/Aへ変換
- 組織内の配布・保存フローへ組み込む
