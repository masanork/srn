export interface BaseLayoutProps {
    title: string;
    content: string;
    fontCss: string;
    fontFamilies: string[]; // For Mermaid config
    jsonLd?: object;
    lang?: string;
    className?: string;
    relPath?: string;
}

const MERMAID_ASSET_PATH = 'src/ssg/assets/vendor/mermaid.min.js';
const FAVICON_DATA_URI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxMTE4MjciLz48dGV4dCB4PSI1MCUiIHk9IjU2JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZjlmYWZiIiBmb250LXdlaWdodD0iNzAwIj5TUjwvdGV4dD48L3N2Zz4=';
let cachedMermaidDataUri: string | null = null;

function getRelativePrefix(relPath: string | undefined): string {
    if (!relPath) return '';
    const normalized = relPath.replace(/\\/g, '/');
    const depth = normalized.split('/').length - 1;
    return depth > 0 ? '../'.repeat(depth) : '';
}

function getMermaidDataUri(): string | null {
    if (cachedMermaidDataUri !== null) return cachedMermaidDataUri;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs') as typeof import('fs');
        const content = fs.readFileSync(MERMAID_ASSET_PATH, 'utf-8');
        const base64 = Buffer.from(content, 'utf-8').toString('base64');
        cachedMermaidDataUri = `data:text/javascript;base64,${base64}`;
        return cachedMermaidDataUri;
    } catch {
        cachedMermaidDataUri = null;
        return null;
    }
}

export function baseLayout(props: BaseLayoutProps): string {
    const { title, content, fontCss, fontFamilies, jsonLd, lang = 'ja', className = '', relPath } = props;
    const relativePrefix = getRelativePrefix(relPath);
    const styleHref = `${relativePrefix}style.css`;
    const sitemapHref = `${relativePrefix}sitemap.xml`;
    const llmsHref = `${relativePrefix}llms.txt`;

    // JSON-LD script block
    const jsonLdScript = jsonLd
        ? `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`
        : '';

    // Mermaid Config
    const fontListJson = JSON.stringify(fontFamilies);

    const hasMermaid = content.includes('language-mermaid');
    const mermaidDataUri = hasMermaid ? getMermaidDataUri() : null;
    const mermaidScript = mermaidDataUri ? `
    <script>
        (() => {
            const runMermaid = () => {
                const mermaid = window.mermaid;
                if (!mermaid) return;

                const fonts = ${fontListJson};
                const fontFamily = fonts.join(', ');

                document.querySelectorAll('pre > code.language-mermaid').forEach((code) => {
                    const pre = code.closest('pre');
                    if (!pre) return;
                    const container = document.createElement('div');
                    container.className = 'mermaid';
                    container.textContent = code.textContent || '';
                    pre.replaceWith(container);
                });

                mermaid.initialize({
                    startOnLoad: false,
                    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
                    fontFamily: fontFamily
                });

                mermaid.run({
                    querySelector: '.mermaid'
                });
            };

            const onReady = () => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', runMermaid, { once: true });
                } else {
                    runMermaid();
                }
            };

            const script = document.createElement('script');
            script.src = '${mermaidDataUri}';
            script.onload = onReady;
            document.head.appendChild(script);
        })();
    </script>
    ` : '';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; worker-src 'self' blob:; connect-src 'self';">
    <title>${title}</title>
    <link rel="icon" href="${FAVICON_DATA_URI}">
    <link rel="stylesheet" href="${styleHref}">
    <link rel="sitemap" type="application/xml" href="${sitemapHref}">
    <link rel="help" type="text/plain" href="${llmsHref}">
    ${fontCss}
    ${jsonLdScript}
    ${mermaidScript}
    <style>
        /* Hide by default, show based on body class */
        [data-lang-ja], [data-lang-en] { display: none !important; }
        
        .js-lang-ja [data-lang-ja] { display: contents !important; }
        .js-lang-ja span[data-lang-ja], .js-lang-ja a[data-lang-ja], .js-lang-ja i[data-lang-ja] { display: inline !important; }
        
        .js-lang-en [data-lang-en] { display: contents !important; }
        .js-lang-en span[data-lang-en], .js-lang-en a[data-lang-en], .js-lang-en i[data-lang-en] { display: inline !important; }
    </style>
    <script>
        (() => {
            const lang = (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
            if (lang === 'ja') {
                document.documentElement.lang = 'ja';
                document.documentElement.classList.add('js-lang-ja');
            } else {
                document.documentElement.lang = 'en';
                document.documentElement.classList.add('js-lang-en');
            }
            // Backward compatibility for simple data-i18n replacements
            window.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('[data-i18n-ja]').forEach((el) => {
                    const ja = el.getAttribute('data-i18n-ja') || '';
                    const en = el.getAttribute('data-i18n-en') || ja;
                    el.textContent = lang === 'ja' ? ja : en;
                });
            });
        })();
    </script>
</head>
<body class="${className}">
    <main>
        ${content}
    </main>
</body>
</html>`;
}
