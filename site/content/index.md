---
title: "SRN: Typography-First SSG"
layout: width
font: 
  - hero:ReggaeOne-Regular.ttf
  - default:NotoSansJP-VariableFont_wght.ttf,ipamjm.ttf
  - bold:NotoSansJP-VariableFont_wght.ttf,ipamjm.ttf
---



<div class="hero-section">
    <div class="logo-area font-hero">空音</div>
    <p class="lead">SORANE: The Static Site Generator for <br><strong>Precision Typography</strong> & <strong>Long-term Authenticiy</strong>.</p>
</div>

<div class="dashboard-grid">
    <div class="panel">
        <div class="panel-header">CORE PHILOSOPHY</div>
        <div class="panel-body">
            <ul class="spec-list">
                <li>
                    <strong>Zero Layout Shift (CLS 0)</strong>
                    <span>Subsetting fonts per page ensures content renders immediately with correct glyphs. No FOUT/FOIT.</span>
                </li>
                <li>
                    <strong>Zero Request Overhead</strong>
                    <span>Fonts are embedded as Base64 Data URIs. No external font requests. Offline ready.</span>
                </li>
                <li>
                    <strong>Future-Proof Auth</strong>
                    <span>Built-in Post-Quantum Cryptography (ML-DSA-44) support for document signing.</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="panel">
        <div class="panel-header">MODULES & NAVIGATION</div>
        <div class="panel-body nav-links">
            <a href="./guide.html" class="nav-item">
                <span class="icon">📖</span>
                <span class="desc">System architecture & Usage manual.</span>
            </a>
            <a href="./releases.html" class="nav-item">
                <span class="icon">🔖</span>
                <span class="label">Release History</span>
                <span class="desc">Changelog & versions.</span>
            </a>
            <a href="./issues.html" class="nav-item">
                <span class="icon">🚧</span>
                <span class="label">Issues & Roadmap</span>
                <span class="desc">Limitations & Future Considerations.</span>
            </a>
            <a href="./juminhyo.html" class="nav-item">
                <span class="icon">📜</span>
                <span class="label">Sample Certificate</span>
                <span class="desc">Juminhyo (Residence) Demo.</span>
            </a>
            <a href="./variants.html" class="nav-item">
                <span class="icon">字</span>
                <span class="label">Variant Tester</span>
                <span class="desc">IVS/SVS Rendering test page.</span>
            </a>
            <a href="./tech-verification.html" class="nav-item">
                <span class="icon">🛡️</span>
                <span class="label">PQC Verification Specs</span>
                <span class="desc">Hybrid VC (Verifiable Credentials) tech specs.</span>
            </a>
            <a href="./verify.html" class="nav-item primary">
                <span class="icon">✅</span>
                <span class="label">Verify VC Console</span>
                <span class="desc">Client-side verification of ML-DSA signatures.</span>
            </a>
            <a href="./gj.html" class="nav-item">
                <span class="icon">📊</span>
                <span class="label">行政事務標準文字 追加文字一覧</span>
                <span class="desc">Massive glyph grid rendering test.</span>
            </a>
            <a href="./sai.html" class="nav-item">
                <span class="icon">字</span>
                <span class="label">斎 Variants</span>
                <span class="desc">Comprehensive list of 'Sai' variants (MJ).</span>
            </a>
        </div>
    </div>
</div>

<div class="footer-status">
    Runtime: Bun v1.x | Engine: opentype.js | Database: SQLite (WAL)
</div>

<style>
    :root {
        --bg-color: #f8fafc;
        --card-bg: #ffffff;
        --text-main: #1e293b;
        --text-sub: #475569;
        --accent: #0f172a;
        --highlight: #3b82f6;
        --success: #10b981;
    }

    body {
        background-color: var(--bg-color);
        color: var(--text-main);
    }

    /* Header */
    .server-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #ddd;
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--text-sub);
        margin-bottom: 3rem;
    }
    .status-indicator {
        width: 8px;
        height: 8px;
        background-color: var(--success);
        border-radius: 50%;
    }


    /* Hero */
    .hero-section {
        text-align: center;
        margin-bottom: 4rem;
        padding-top: 4rem;
    }
    .logo-area {
        font-size: 6rem;
        margin-bottom: 0.5rem;
        color: var(--accent);
        letter-spacing: -0.05em;
        font-weight: 700;
    }
    .lead {
        font-size: 1.25rem;
        font-weight: 400;
        line-height: 1.6;
        color: var(--text-sub);
        max-width: 850px;
        margin: 0 auto;
        letter-spacing: -0.01em;
    }
    .lead strong {
        font-weight: 700;
        color: var(--accent);
    }

    /* Dashboard */
    .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 5rem;
        margin-bottom: 6rem;
    }

    .panel {
        /* Remove card container effectively */
    }

    .panel-header {
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        color: #94a3b8;
        text-transform: uppercase;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 0.25rem;
        display: inline-block;
        font-family: var(--font-default);
    }

    .panel-body {
        padding: 0;
    }

    /* Spec List */
    .spec-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .spec-list li {
        margin-bottom: 0;
    }
    .spec-list strong {
        display: block;
        color: var(--accent);
        margin-bottom: 0.5rem;
        font-family: var(--font-bold);
        font-size: 1.1rem;
        letter-spacing: -0.01em;
    }
    .spec-list span {
        display: block;
        font-size: 0.95rem;
        color: var(--text-sub);
        line-height: 1.6;
    }

    /* Nav Links */
    .nav-links {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    .nav-item {
        display: grid;
        grid-template-columns: 48px 1fr;
        grid-template-rows: auto auto;
        align-items: center;
        text-decoration: none;
        color: inherit;
        padding: 1.25rem;
        border-radius: 12px;
        transition: all 0.2s ease-out;
        background: transparent;
        border: 1px solid transparent;
    }
    .nav-item:hover {
        background: #fff;
        border-color: #f1f5f9;
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
    }
    .nav-item.primary {
        background: #f0f9ff;
    }
    .nav-item.primary:hover {
        background: #fff;
    }
    .nav-item .icon {
        grid-row: 1 / -1;
        font-size: 2rem;
        opacity: 0.8;
    }
    .nav-item .label {
        font-weight: 600;
        font-size: 1.05rem;
        color: var(--accent);
        margin-bottom: 0.2rem;
    }
    .nav-item .desc {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    /* Footer */
    .footer-status {
        text-align: center;
        padding: 2rem 0;
        border-top: 1px solid #ddd;
        font-family: monospace;
        font-size: 0.8rem;
        color: #999;
    }

    @media (max-width: 600px) {
        .logo-area { font-size: 4rem; }
        .dashboard-grid { grid-template-columns: 1fr; }
    }
</style>
