---
title: "Sorane (空音): Typography-First SSG"
layout: width
font: 
  - Serif
  - logo:NotoSerifJP-VariableFont_wght.ttf
---



<div class="hero-section">
    <div class="logo-area font-logo">空音</div>
    <p class="lead">SORANE (空音): The Reference Implementation for <br><strong>Precision Typography</strong> & <strong>Long-term Authenticiy</strong>.</p>
</div>

<div class="dashboard-grid"><div class="panel"><div class="panel-header">CORE PHILOSOPHY</div><div class="panel-body"><ul class="spec-list"><li><strong>Zero Layout Shift (CLS 0)</strong><span>Subsetting fonts per page ensures content renders immediately with correct glyphs. No FOUT/FOIT.</span></li><li><strong>Zero Request Overhead</strong><span>Fonts are embedded as Base64 Data URIs. No external font requests. Offline ready.</span></li><li><strong>Future-Proof Auth</strong><span>Built-in Post-Quantum Cryptography (ML-DSA-44) support for document signing.</span></li></ul></div></div><div class="panel"><div class="panel-header">DISCUSSION PAPERS</div><div class="panel-body nav-links"><a href="./papers/signature-architecture.html" class="nav-item"><span class="icon">🏗️</span><span class="label">Hybrid Signature Architecture</span><span class="desc">Design of our multi-tier, PQC-ready signing system.</span></a><a href="./papers/passkey-delegation.html" class="nav-item"><span class="icon">🔑</span><span class="label">PassKey & Delegation</span><span class="desc">Hardware-backed root of trust for automated builds.</span></a><a href="./papers/c2pa-provenance.html" class="nav-item"><span class="icon">🖋️</span><span class="label">Asset Provenance</span><span class="desc">Injecting C2PA-style signatures into font binaries.</span></a><a href="./papers/web-a.html" class="nav-item"><span class="icon">📄</span><span class="label">Web/A: Archival Web</span><span class="desc">A portable, machine-readable alternative to PDF/A and XML.</span></a></div></div><div class="panel"><div class="panel-header">MODULES & NAVIGATION</div>
<div class="panel-body nav-links"><a href="./maker.html" class="nav-item primary"><span class="icon">📝</span><span class="label">Web/A Form Maker</span><span class="desc">Create verifiable forms visually. (Beta)</span></a><a href="./guide.html" class="nav-item"><span class="icon">📖</span><span class="label">Developer Guide</span><span class="desc">System architecture & Usage manual.</span></a><a href="./blog.html" class="nav-item"><span class="icon">📰</span><span class="label">Technical Articles</span><span class="desc">Blog-style technical deep dives.</span></a><a href="./releases.html" class="nav-item"><span class="icon">🔖</span><span class="label">Release History</span><span class="desc">Changelog & versions.</span></a><a href="./tech-verification.html" class="nav-item"><span class="icon">🛡️</span><span class="label">PQC Verification Specs</span><span class="desc">Hybrid VC (Verifiable Credentials) tech specs.</span></a><a href="https://github.com/masanork/srn" class="nav-item"><span class="icon">🐙</span><span class="label">Source Code</span><span class="desc">Sorane engine on GitHub.</span></a></div></div></div>
<div class="footer-status">
    Runtime: Bun v1.x | Engine: opentype.js | Database: SQLite (WAL)
</div>

<style>
    /* Hero Section Enhancements */
    .hero-section {
        text-align: center;
        margin-bottom: 5rem;
        padding-top: 4rem;
    }
    .logo-area {
        font-size: 7rem;
        margin-bottom: 0.5rem;
        color: var(--accent-color);
        letter-spacing: -0.05em;
        font-weight: 900;
        line-height: 1;
    }
    .lead {
        font-size: 1.25rem;
        font-weight: 400;
        line-height: 1.6;
        color: var(--text-muted);
        max-width: 850px;
        margin: 0 auto;
    }
    .lead strong {
        font-weight: 700;
        color: var(--accent-color);
    }

    /* Dashboard Layout */
    .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 6rem;
        margin-bottom: 6rem;
    }

    .panel-header {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
        display: inline-block;
    }

    /* Spec List (Features) */
    .spec-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 3rem;
        list-style: none;
        padding: 0;
    }
    .spec-list strong {
        display: block;
        color: var(--accent-color);
        margin-bottom: 0.75rem;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
    .spec-list span {
        display: block;
        font-size: 1rem;
        color: var(--text-color);
        line-height: 1.6;
        opacity: 0.8;
    }

    /* Nav Cards */
    .nav-links {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        justify-items: start;
    }
    .nav-item {
        width: 100%;
        max-width: 400px;
        display: grid;
        grid-template-columns: 56px 1fr;
        grid-row-gap: 0.25rem;
        align-items: center;
        padding: 1.5rem;
        border-radius: 1rem;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        box-shadow: var(--panel-shadow);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--premium-shadow);
        border-color: var(--highlight);
    }
    .nav-item.primary {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-color: #bae6fd;
    }
    .nav-item.primary:hover {
        background: #fff;
    }

    .nav-item .icon {
        grid-row: 1 / span 2;
        font-size: 2.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .nav-item .label {
        font-weight: 700;
        font-size: 1.15rem;
        color: var(--accent-color);
    }
    .nav-item .desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.4;
    }

    /* Footer Status */
    .footer-status {
        text-align: center;
        padding: 4rem 0;
        border-top: 1px solid var(--border-color);
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 0.8rem;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
        .logo-area { font-size: 4.5rem; }
        .dashboard-grid { gap: 4rem; }
        .nav-links { grid-template-columns: 1fr; }
    }
</style>
