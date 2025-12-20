---
title: "空音"
layout: width
font: 
  - hero:ReggaeOne-Regular.ttf
  - default:ipamjm.ttf,acgjm.ttf
---

<div class="hero-container">
    <div class="hero-title font-hero">空音</div>
    <div class="hero-subtitle">SORANE</div>
</div>

<div class="concept-text">
    <p>
        言葉は、画（え）だ。<br>
        文字は、音（おと）だ。
    </p>
    <p>
        6万を超える漢字の海を、風のように駆ける。<br>
        必要なものだけを、必要な瞬間に。
    </p>
</div>

<div class="features-grid">
    <a href="./sai.html" class="feature-card">
        <h3>斎 Variants</h3>
        <p>「斎」という文字の多様な異体字コレクション。<br>微妙な差異が織りなす文字の世界。</p>
    </a>
    <a href="./ben.html" class="feature-card">
        <h3>辺 Variants</h3>
        <p>「辺」という文字の多様な異体字コレクション。<br>しんにょうの点や払いの違いを網羅。</p>
    </a>
    <a href="./gj.html" class="feature-card">
        <h3>MJ+文字一覧</h3>
        <p>戸籍統一文字を含む、膨大な行政文字のグリッドビュー。<br>数千の文字も一瞬でレンダリング。</p>
    </a>
    <a href="./variants.html" class="feature-card">
        <h3>異体字の深淵</h3>
        <p>IVS (Ideographic Variation Sequences) 完全対応。<br>点一つの違いが、意味を変える。</p>
    </a>
    <a href="./tech-verification.html" class="feature-card">
        <h3>VC検証技術</h3>
        <p>耐量子暗号 (PQC) を用いたハイブリッド構成のVC検証プロセスについての技術解説。</p>
    </a>
</div>

<style>
    .hero-container {
        text-align: center;
        padding: 6rem 0 4rem;
        animation: fadeIn 2s ease-out;
    }
    
    .hero-title {
        font-size: 8rem;
        line-height: 1;
        letter-spacing: 0.2em;
        margin-bottom: 1rem;
        text-shadow: 0 4px 20px rgba(0,0,0,0.1);
        /* ユーザー指定の「太めで幻想的なフォント」があればここに効いてくる */
    }

    .hero-subtitle {
        font-size: 1.2rem;
        letter-spacing: 0.5em;
        opacity: 0.6;
        font-family: sans-serif;
    }

    .concept-text {
        text-align: center;
        margin: 4rem auto;
        font-size: 1.1rem;
        line-height: 2.4;
        max-width: 600px;
        color: #444;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin-top: 4rem;
    }

    .feature-card {
        display: block;
        padding: 2rem;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,0.8);
    }
    
    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border-color: #ccc;
    }

    .feature-card h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.4rem;
        border-bottom: none;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .hero-title {
            font-size: 4rem;
        }
    }
</style>
