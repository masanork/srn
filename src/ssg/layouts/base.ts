export interface BaseLayoutProps {
    title: string;
    content: string;
    fontCss: string;
    fontFamilies: string[]; // For Mermaid config
    jsonLd?: object;
    lang?: string;
}

export function baseLayout(props: BaseLayoutProps): string {
    const { title, content, fontCss, fontFamilies, jsonLd, lang = 'ja' } = props;

    // JSON-LD script block
    const jsonLdScript = jsonLd
        ? `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`
        : '';

    // Mermaid Config
    const fontListJson = JSON.stringify(fontFamilies);

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; worker-src 'self' blob:; connect-src 'self';">
    <title>${title}</title>
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="style.css">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <link rel="help" type="text/plain" href="/llms.txt">
    ${fontCss}
    ${jsonLdScript}
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        
        const fonts = ${fontListJson};
        const fontFamily = fonts.join(', ');
        
        mermaid.initialize({
            startOnLoad: false,
            theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
            fontFamily: fontFamily
        });
        
        await mermaid.run({
            querySelector: '.mermaid'
        });
    </script>
</head>
<body>
    <main>
        ${content}
    </main>
    <script>
        (() => {
            const lang = (navigator.language || '').toLowerCase();
            const isJa = lang.startsWith('ja');
            document.querySelectorAll('[data-i18n-ja]').forEach((el) => {
                const ja = el.getAttribute('data-i18n-ja') || '';
                const en = el.getAttribute('data-i18n-en') || ja;
                el.textContent = isJa ? ja : en;
            });
        })();
    </script>
</body>
</html>`;
}
