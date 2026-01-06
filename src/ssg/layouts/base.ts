export interface BaseLayoutProps {
    title: string;
    content: string;
    fontCss: string;
    fontFamilies: string[]; // For Mermaid config
    jsonLd?: object | object[];
    lang?: string;
    className?: string;
    relPath?: string;
    includeStyleLink?: boolean; // Default: true. Set false for Web/A Forms with inline CSS
}

const FAVICON_DATA_URI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxMTE4MjciLz48dGV4dCB4PSI1MCUiIHk9IjU2JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZjlmYWZiIiBmb250LXdlaWdodD0iNzAwIj5TUjwvdGV4dD48L3N2Zz4=';

import { getRelativePrefix } from '../utils.js';

export function baseLayout(props: BaseLayoutProps): string {
    const { title, content, fontCss, fontFamilies, jsonLd, lang = 'ja', className = '', relPath, includeStyleLink = true } = props;
    const relativePrefix = getRelativePrefix(relPath);
    const styleHref = `${relativePrefix}style.css`;
    const sitemapHref = `${relativePrefix}sitemap.xml`;
    const llmsHref = `${relativePrefix}llms.txt`;
    const styleLinkTag = includeStyleLink ? `<link rel="stylesheet" href="${styleHref}">` : '';

    // JSON-LD script block
    const jsonLdScript = jsonLd
        ? `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`
        : '';

    // Mermaid Config
    const fontListJson = JSON.stringify(fontFamilies);

    const hasMermaid = content.includes('language-mermaid');
    const mermaidScript = hasMermaid ? `
    <script>
        (() => {
            const runMermaid = () => {
                const mermaid = window.mermaid;
                if (!mermaid) {
                    // If not loaded yet, wait for it (ManifestManager will inject it)
                    setTimeout(runMermaid, 100);
                    return;
                }

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

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', runMermaid, { once: true });
            } else {
                runMermaid();
            }
        })();
    </script>
    ` : '';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data: blob:; img-src 'self' data: blob:; object-src 'self' blob:; media-src 'self' blob:; worker-src 'self' blob:; connect-src 'self' blob:;">
    <title>${title}</title>
    <link rel="icon" href="${FAVICON_DATA_URI}">
    ${styleLinkTag}
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
