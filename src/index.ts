import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { glob } from 'glob';

import * as cheerio from 'cheerio';
import { subsetFont, bufferToDataUrl } from './font.ts';

// Configuration
const SITE_DIR = path.resolve(process.cwd(), 'site');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const CONTENT_DIR = path.join(SITE_DIR, 'content');
const FONTS_DIR = path.join(SITE_DIR, 'fonts');

async function build() {
    console.log('Starting build...');

    // Clean dist
    await fs.emptyDir(DIST_DIR);

    // Copy static assets
    const STATIC_DIR = path.join(SITE_DIR, 'static');
    if (await fs.pathExists(STATIC_DIR)) {
        await fs.copy(STATIC_DIR, DIST_DIR);
        console.log(`Copied static assets to dist/`);
    }

    // Find all markdown files
    // Configure marked once
    marked.use({
        renderer: {
            // @ts-ignore
            code({ text, lang }) {
                if (lang === 'mermaid') {
                    return `<div class="mermaid">${text}</div>`;
                }
                const langClass = lang ? `class="language-${lang}"` : '';
                return `<pre><code ${langClass}>${text}</code></pre>\n`;
            }
        }
    });

    // Find all markdown files
    const files = await glob('**/*.md', { cwd: CONTENT_DIR });

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(source);

        console.log(`Processing: ${file}`);

        // Convert to HTML
        const htmlContent = await marked.parse(content);

        // Extract text for subsetting
        const $ = cheerio.load(htmlContent);
        const bodyText = $.text().replace(/\s+/g, '');
        const fullText = (data.title || '') + bodyText;

        let fontCss = '';
        const fontFamilies: string[] = [];

        if (data.font) {
            const fonts = Array.isArray(data.font) ? data.font : [data.font];

            for (let i = 0; i < fonts.length; i++) {
                const fontName = fonts[i];
                const fontPath = path.join(FONTS_DIR, fontName);

                if (await fs.pathExists(fontPath)) {
                    try {
                        console.log(`  Subsetting font: ${fontName}`);
                        const { buffer, mimeType } = await subsetFont(fontPath, fullText);

                        // If buffer is suspiciously small (header only), maybe warn?
                        // But subsetFont returns valid font anyway.

                        const format = 'woff2';
                        const dataUrl = bufferToDataUrl(buffer, mimeType);
                        const fontFamilyName = `SubsetFont-${i}`;

                        fontCss += `
<style>
@font-face {
  font-family: '${fontFamilyName}';
  src: url('${dataUrl}') format('${format}');
  font-display: swap;
}
</style>
                        `;
                        fontFamilies.push(`'${fontFamilyName}'`);
                    } catch (err) {
                        console.error(`  Error subsetting font ${fontName}: ${err}`);
                        console.error(err);
                    }
                } else {
                    console.warn(`  Font not found: ${fontName}`);
                }
            }
        }

        // Default fallbacks
        const safeFontFamilies = [...fontFamilies, 'serif'];
        const fontFamilyCss = safeFontFamilies.join(', ');

        const globalStyle = `
<style>
body {
  font-family: ${fontFamilyCss};
  margin: 0;
  padding: 2rem;
  line-height: 1.6;
}
</style>
        `;
        fontCss += globalStyle;

        // Simple HTML wrap with Mermaid support
        // Pass font families as a JSON array literal to avoid quoting issues
        const fontListJson = JSON.stringify(safeFontFamilies);

        const finalHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; worker-src 'self' blob:; connect-src 'self';">
    <title>${data.title}</title>
    <link rel="icon" href="data:,"> <!-- Prevent favicon 404 -->
    ${fontCss}
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        
        const fonts = ${fontListJson};
        const fontFamily = fonts.join(', ');
        
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            fontFamily: fontFamily
        });
        
        await mermaid.run({
            querySelector: '.mermaid'
        });
    </script>
</head>
<body>
    <h1>${data.title}</h1>
    ${htmlContent}
</body>
</html>
        `;

        // Write to dist
        const outPath = path.join(DIST_DIR, file.replace('.md', '.html'));
        await fs.ensureDir(path.dirname(outPath));
        await fs.writeFile(outPath, finalHtml);

        console.log(`  Generated: ${outPath} (${(finalHtml.length / 1024).toFixed(2)} KB)`);
    }

    console.log('Build complete.');
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
