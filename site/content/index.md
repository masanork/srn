---
title: "SRN: Typography-First SSG"
layout: width
font: 
  - hero:ReggaeOne-Regular.ttf
  - default:ipamjm.ttf,acgjm.ttf
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
                <span class="label">Developer Guide</span>
                <span class="desc">System architecture & Usage manual.</span>
            </a>
            <a href="./koseki.html" class="nav-item">
                <span class="icon">📜</span>
                <span class="label">Sample Certificate</span>
                <span class="desc">Koseki (Family Register) VC Demo.</span>
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
                <span class="label">Grid View (MJ)</span>
                <span class="desc">Massive glyph grid rendering test.</span>
            </a>
            <a href="./sai.html" class="nav-item">
                <span class="icon">字</span>
                <span class="label">Sai Variants</span>
                <span class="desc">Comprehensive list of 'Sai' variants (MJ).</span>
            </a>
            <a href="./all.html" class="nav-item">
                <span class="icon">📚</span>
                <span class="label">All Glyphs (Heavy)</span>
                <span class="desc">Full list of ~70k characters.</span>
            </a>
        </div>
    </div>
</div>

<div class="footer-status">
    Runtime: Bun v1.x | Engine: opentype.js | Database: SQLite (WAL)
</div>

<style>
    :root {
        --bg-color: #f4f6f8;
        --card-bg: #ffffff;
        --text-main: #333;
        --text-sub: #666;
        --accent: #2c3e50;
        --accent-light: #34495e;
        --highlight: #3498db;
        --success: #27ae60;
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
        margin-bottom: 1rem;
        color: var(--accent);
        text-shadow: 2px 2px 0px #ddd;
    }
    .lead {
        font-size: 1.2rem;
        line-height: 1.6;
        color: var(--text-sub);
    }

    /* Dashboard */
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
    }

    .panel {
        background: var(--card-bg);
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        overflow: hidden;
    }

    .panel-header {
        background: #f8f9fa;
        padding: 0.8rem 1.5rem;
        border-bottom: 1px solid #eee;
        font-size: 0.85rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        color: var(--text-sub);
        text-transform: uppercase;
    }

    .panel-body {
        padding: 1.5rem;
    }

    /* Spec List */
    .spec-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .spec-list li {
        margin-bottom: 1.5rem;
    }
    .spec-list li:last-child {
        margin-bottom: 0;
    }
    .spec-list strong {
        display: block;
        color: var(--accent);
        margin-bottom: 0.2rem;
    }
    .spec-list span {
        display: block;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    /* Nav Links */
    .nav-links {
        display: grid;
        gap: 1rem;
    }
    .nav-item {
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        align-items: center;
        text-decoration: none;
        color: inherit;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 6px;
        transition: all 0.2s;
    }
    .nav-item:hover {
        background: #f8f9fa;
        border-color: var(--highlight);
        transform: translateX(4px);
    }
    .nav-item.primary {
        border-left: 4px solid var(--highlight);
    }
    .nav-item .icon {
        grid-row: 1 / -1;
        font-size: 1.5rem;
        text-align: center;
    }
    .nav-item .label {
        font-weight: bold;
        color: var(--accent);
    }
    .nav-item .desc {
        font-size: 0.8rem;
        color: var(--text-sub);
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
