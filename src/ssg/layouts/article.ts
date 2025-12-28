import { baseLayout } from './base.js';

export interface ArticleData {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    font?: string | string[];
    [key: string]: any;
}

export function articleLayout(data: ArticleData, bodyContent: string, fontCss: string, fontFamilies: string[], vc?: any) {
    const siteDid = vc?.issuer || "did:web:masanork.github.io:srn";
    const lang = (data.lang || 'ja').toString();
    const presentationEnabled = data.presentation === true;

    // Construct schema.org JSON-LD
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title,
        "description": data.description || "",
        "datePublished": data.date || new Date().toISOString().split('T')[0],
        "author": {
            "@type": "Person",
            "name": data.author || "Unknown"
        },
        // Web/A Provenance
        ...(vc ? {
            "provenance": {
                "metadata": {
                    "title": data.title,
                    "format": "application/x.web-a+html",
                    "schema": "https://masanork.github.io/srn/schemas/weba-v1.json"
                },
                "producer": {
                    "name": "Sorane (SRN) SSG",
                    "version": "1.0.0",
                    "identifier": siteDid
                },
                "assertions": [
                    {
                        "label": "srn.hmp_declaration",
                        "data": {
                            "assertion": "Human-Machine Parity (HMP) Guaranteed",
                            "generator_hash": vc?.credentialSubject?.["srn:buildId"] || "unknown"
                        }
                    }
                ]
            }
        } : {})
    };

    // Inject heading into body content unless specifically hidden or using wide layout (usually index)
    const showHeader = data.layout !== 'width' && data.hideTitle !== true;

    const verificationFooter = vc ? `
        <footer class="doc-verification no-print" style="margin-top: 5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem; color: #666;">
            <details>
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                    <span>✓</span>
                    <span data-i18n-ja="発行元による真正性の証明" data-i18n-en="Issuer Authenticity Proof">発行元による真正性の証明</span>
                </summary>
                <div style="padding: 1rem 0;">
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
                </div>
            </details>
        </footer>
    ` : '';

    const presentationActions = presentationEnabled
        ? `
        <div class="presentation-actions no-print">
            <button class="presentation-toggle" data-presentation-toggle data-i18n-ja="プレゼンテーション" data-i18n-en="Presentation">Presentation</button>
        </div>
        `
        : '';

    const presentationAssets = presentationEnabled
        ? `
        <style>
            .presentation-actions { position: sticky; top: 1rem; display: flex; justify-content: flex-end; margin-bottom: 1rem; z-index: 5; }
            .presentation-toggle { border: 1px solid #111; background: #111; color: #fff; padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.85rem; cursor: pointer; letter-spacing: 0.02em; }
            .presentation-toggle:hover { background: #333; }
            .presentation-enabled .article-body hr { border: none; border-top: 1px dashed #e5e7eb; margin: 2.5rem 0; }
            body.presentation-mode { overflow: hidden; }
            .presentation-overlay { position: fixed; inset: 0; background: #0b0b0d; color: #f9fafb; display: none; flex-direction: column; z-index: 2000; }
            .presentation-overlay.active { display: flex; }
            .presentation-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem 0; font-size: 0.85rem; color: #cbd5f5; }
            .presentation-toolbar button { border: 1px solid #94a3b8; background: transparent; color: #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 999px; cursor: pointer; }
            .presentation-slide-container { flex: 1; display: flex; align-items: center; justify-content: center; }
            .presentation-slide { display: none; width: 100%; height: 100%; padding: 5vh 6vw; box-sizing: border-box; }
            .presentation-slide.active { display: flex; flex-direction: column; justify-content: center; gap: 2.2rem; }
            .presentation-slide h1 { font-size: clamp(3.2rem, 7.5vw, 6.2rem); line-height: 1.05; margin: 0; color: #f9fafb; }
            .presentation-slide h2 { font-size: clamp(2.4rem, 5.5vw, 4.4rem); margin: 0; color: #f9fafb; }
            .presentation-slide h3 { font-size: clamp(1.6rem, 3.6vw, 2.8rem); margin: 0; color: #c7d2fe; }
            .presentation-slide p { font-size: clamp(1.3rem, 2.6vw, 2rem); line-height: 1.5; color: #e2e8f0; }
            .presentation-slide ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 1rem; }
            .presentation-slide li { font-size: clamp(1.3rem, 2.5vw, 1.9rem); color: #e2e8f0; position: relative; padding-left: 1.6rem; }
            .presentation-slide li::before { content: "◆"; position: absolute; left: 0; top: 0.2rem; color: #60a5fa; font-size: 1rem; }
            .presentation-slide .presentation-figure { display: flex; justify-content: center; align-items: center; }
            .presentation-slide .presentation-figure svg { max-width: 90vw; max-height: 60vh; width: 100%; height: auto; }
            body.presentation-mode .presentation-slide { padding: 4vh 5vw; gap: 2.6rem; }
            body.presentation-mode .presentation-slide h1 { font-size: clamp(3.8rem, 9vw, 7.2rem); color: #f9fafb; }
            body.presentation-mode .presentation-slide h2 { font-size: clamp(2.8rem, 6.5vw, 5.2rem); color: #f9fafb; }
            body.presentation-mode .presentation-slide h3 { font-size: clamp(1.9rem, 4.2vw, 3.4rem); color: #c7d2fe; }
            body.presentation-mode .presentation-slide p { font-size: clamp(1.6rem, 3vw, 2.4rem); }
            body.presentation-mode .presentation-slide li { font-size: clamp(1.6rem, 2.9vw, 2.3rem); }
            body.presentation-mode .presentation-slide .presentation-figure svg { max-height: 70vh; }
            .presentation-footer { padding: 0 2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #94a3b8; }
            .presentation-progress { display: flex; gap: 0.35rem; align-items: center; }
            .presentation-dot { width: 6px; height: 6px; border-radius: 999px; background: #1f2937; }
            .presentation-dot.active { background: #60a5fa; }
        </style>
        <script>
            (() => {
                const toggle = document.querySelector('[data-presentation-toggle]');
                if (!toggle) return;
                const articleBody = document.querySelector('.article-body');
                if (!articleBody) return;
                const isJa = (navigator.language || '').toLowerCase().startsWith('ja');

                let overlay = null;
                let slides = [];
                let slideIndex = 0;
                let active = false;

                const buildSlides = () => {
                    if (overlay) return;
                    overlay = document.createElement('div');
                    overlay.className = 'presentation-overlay';
                    overlay.innerHTML = \`
                        <div class="presentation-toolbar">
                            <div>${data.title}</div>
                            <button type="button" data-presentation-exit data-i18n-ja="終了" data-i18n-en="Exit">Exit</button>
                        </div>
                        <div class="presentation-slide-container"></div>
                        <div class="presentation-footer">
                            <div class="presentation-counter"></div>
                            <div class="presentation-progress"></div>
                        </div>
                    \`;
                    document.body.appendChild(overlay);
                    const exitBtn = overlay.querySelector('[data-presentation-exit]');
                    if (exitBtn) {
                        exitBtn.textContent = isJa ? '終了' : 'Exit';
                    }
                    const container = overlay.querySelector('.presentation-slide-container');
                    const nodes = Array.from(articleBody.childNodes);
                    let current = [];
                    const pushSlide = () => {
                        const hasContent = current.some((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim() !== '');
                        if (!hasContent) { current = []; return; }
                        const slide = document.createElement('section');
                        slide.className = 'presentation-slide';
                        current.forEach((node) => slide.appendChild(node.cloneNode(true)));
                        container.appendChild(slide);
                        current = [];
                    };
                    nodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'HR') {
                            pushSlide();
                        } else {
                            current.push(node);
                        }
                    });
                    pushSlide();
                    slides = Array.from(container.querySelectorAll('.presentation-slide'));
                };

                const updateProgress = () => {
                    const counter = overlay.querySelector('.presentation-counter');
                    const progress = overlay.querySelector('.presentation-progress');
                    if (!counter || !progress) return;
                    counter.textContent = \`\${slideIndex + 1} / \${slides.length}\`;
                    progress.innerHTML = slides.map((_, idx) => \`<span class="presentation-dot \${idx === slideIndex ? 'active' : ''}"></span>\`).join('');
                };

                const showSlide = (index) => {
                    if (slides.length === 0) return;
                    slideIndex = Math.min(Math.max(index, 0), slides.length - 1);
                    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === slideIndex));
                    updateProgress();
                };

                const enterPresentation = async () => {
                    if (active) return;
                    buildSlides();
                    if (slides.length === 0) return;
                    active = true;
                    document.body.classList.add('presentation-mode');
                    overlay.classList.add('active');
                    showSlide(0);
                    try { await overlay.requestFullscreen?.(); } catch { /* noop */ }
                };

                const exitPresentation = async () => {
                    if (!active) return;
                    active = false;
                    document.body.classList.remove('presentation-mode');
                    overlay.classList.remove('active');
                    if (document.fullscreenElement) {
                        try { await document.exitFullscreen?.(); } catch { /* noop */ }
                    }
                };

                toggle.addEventListener('click', enterPresentation);
                document.addEventListener('click', (event) => {
                    if (event.target && event.target.matches('[data-presentation-exit]')) {
                        exitPresentation();
                    }
                });

                document.addEventListener('keydown', (event) => {
                    if (!active) return;
                    if (event.key === 'Escape') {
                        exitPresentation();
                        return;
                    }
                    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
                        event.preventDefault();
                        showSlide(slideIndex + 1);
                    }
                    if (['ArrowLeft', 'PageUp'].includes(event.key)) {
                        event.preventDefault();
                        showSlide(slideIndex - 1);
                    }
                });

                document.addEventListener('fullscreenchange', () => {
                    if (active && !document.fullscreenElement) {
                        exitPresentation();
                    }
                });
            })();
        </script>
        `
        : '';

    const fullContent = `
        ${presentationActions}
        <article class="weba-article${presentationEnabled ? ' presentation-enabled' : ''}">
            ${showHeader ? `
            <header>
                <h1>${data.title}</h1>
                <div class="article-meta">
                    ${data.date ? `<span><time datetime="${data.date}">${data.date}</time></span>` : ''}
                    ${data.author ? `<span>By ${data.author}</span>` : ''}
                </div>
            </header>
            ` : ''}
            <div class="article-body">
                ${bodyContent}
            </div>
            ${verificationFooter}
        </article>
        ${presentationAssets}
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies,
        jsonLd: schema,
        lang: lang,
        className: `layout-${data.layout || 'article'}`
    });
}
