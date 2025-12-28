export interface BaseLayoutProps {
    title: string;
    content: string;
    fontCss: string;
    fontFamilies: string[]; // For Mermaid config
    jsonLd?: object;
    lang?: string;
    className?: string;
}

const MERMAID_ASSET_PATH = 'src/ssg/assets/vendor/mermaid.esm.min.mjs';
let cachedMermaidDataUri: string | null = null;

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
    const { title, content, fontCss, fontFamilies, jsonLd, lang = 'ja', className = '' } = props;

    // JSON-LD script block
    const jsonLdScript = jsonLd
        ? `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`
        : '';

    // Mermaid Config
    const fontListJson = JSON.stringify(fontFamilies);

    const mermaidDataUri = getMermaidDataUri();
    const mermaidScript = mermaidDataUri ? `
    <script type="module">
        import mermaid from '${mermaidDataUri}';
        
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
        
        await mermaid.run({
            querySelector: '.mermaid'
        });
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
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="style.css">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <link rel="help" type="text/plain" href="/llms.txt">
    ${fontCss}
    ${jsonLdScript}
    ${mermaidScript}
</head>
</head>
<body class="${className}">
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
