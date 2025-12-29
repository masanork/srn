import { baseLayout } from './base.js';
import fs from 'fs-extra';
import path from 'path';

export interface ArticleData {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    font?: string | string[];
    [key: string]: any;
}

export function articleLayout(
    data: ArticleData,
    bodyContent: string,
    fontCss: string,
    fontFamilies: string[],
    vc?: any,
    relPath = ''
) {
    const siteDid = vc?.issuer || "did:web:masanork.github.io:srn";
    const lang = (data.lang || 'ja').toString();
    const presentationEnabled = data.presentation === true;
    const presentationTemplate = normalizeTemplateName((data.presentation_template || 'sorane').toString()) || 'sorane';
    const presentationCss = presentationEnabled ? loadPresentationCss(presentationTemplate) : '';

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
                    },
                    ...(data.ai_generated ? [{
                        "label": "c2pa.actions",
                        "data": {
                            "action": "c2pa.created",
                            "softwareAgent": "Antigravity",
                            "digitalSourceType": "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
                        }
                    }] : [])
                ]
            }
        } : {})
    };

    // Inject heading into body content unless specifically hidden or using wide layout (usually index)
    const showHeader = (data.layout !== 'width' || data.showTitle === true) && data.hideTitle !== true;

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
        <style>${presentationCss}</style>
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
                    overlay.className = 'presentation-overlay presentation-template-${presentationTemplate}';
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

                // Touch Swipe Navigation
                let touchStartX = 0;
                let touchStartY = 0;

                document.addEventListener('touchstart', (e) => {
                    if (!active) return;
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                }, { passive: true });

                document.addEventListener('touchend', (e) => {
                    if (!active) return;
                    const touchEndX = e.changedTouches[0].screenX;
                    const touchEndY = e.changedTouches[0].screenY;
                    const diffX = touchEndX - touchStartX;
                    const diffY = touchEndY - touchStartY;

                    // Ignore vertical scrolls
                    if (Math.abs(diffY) > Math.abs(diffX)) return;

                    // Threshold 50px
                    if (Math.abs(diffX) > 50) {
                        if (diffX < 0) {
                            showSlide(slideIndex + 1); // Swipe Left -> Next
                        } else {
                            showSlide(slideIndex - 1); // Swipe Right -> Prev
                        }
                    }
                }, { passive: true });

                // Tap Zone Navigation
                document.addEventListener('click', (e) => {
                    if (!active) return;
                    // Ignore clicks on controls
                    if (e.target.closest('.presentation-toolbar') || e.target.closest('button') || e.target.closest('a')) return;

                    const width = window.innerWidth;
                    const x = e.clientX;

                    // Tap Right 30% -> Next
                    if (x > width * 0.7) {
                        showSlide(slideIndex + 1);
                    }
                    // Tap Left 30% -> Prev
                    else if (x < width * 0.3) {
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
                    ${data.ai_generated ? `<span class="ai-badge" title="Content generated by AI (Antigravity)">🤖 AI Generated</span>` : ''}
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
        className: `layout-${data.layout || 'article'}${presentationEnabled ? ` presentation-template-${presentationTemplate}` : ''}`,
        relPath
    });
}

const cachedPresentationCss = new Map<string, string>();

function loadPresentationCss(template: string): string {
    const safeTemplate = normalizeTemplateName(template) || 'sorane';
    const cached = cachedPresentationCss.get(safeTemplate);
    if (cached) return cached;
    const basePath = path.join(process.cwd(), 'src', 'ssg', 'assets', 'presentation', 'base.css');
    const templatePath = path.join(process.cwd(), 'src', 'ssg', 'assets', 'presentation', 'templates', `${safeTemplate}.css`);
    let css = '';
    try {
        css += fs.readFileSync(basePath, 'utf-8');
    } catch (err) {
        console.warn('Failed to load presentation base CSS', err);
    }
    if (fs.existsSync(templatePath)) {
        try {
            css += `\n${fs.readFileSync(templatePath, 'utf-8')}`;
        } catch (err) {
            console.warn(`Failed to load presentation template CSS (${safeTemplate})`, err);
        }
    }
    cachedPresentationCss.set(safeTemplate, css);
    return css;
}

function normalizeTemplateName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}
