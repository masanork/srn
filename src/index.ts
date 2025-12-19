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

    // Find all markdown files
    const files = await glob('**/*.md', { cwd: CONTENT_DIR });

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(source);

        console.log(`Processing: ${file}`);

        // Custom renderer for Mermaid
        const renderer = new marked.Renderer();
        const originalCodeRenderer = renderer.code.bind(renderer);
        renderer.code = (code, language, escaped) => {
            if (language === 'mermaid') {
                return `<div class="mermaid">${code}</div>`;
            }
            // @ts-ignore - marked types mismatch for bind, but this is safe
            return originalCodeRenderer(code, language, escaped);
        };
        // @ts-ignore
        marked.setOptions({ renderer });

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
        fontFamilies.push('serif');
        const fontFamilyCss = fontFamilies.join(', ');

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
        const finalHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    ${fontCss}
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({
            startOnLoad: true,
            fontFamily: "${fontFamilyCss.replace(/"/g, '\\"')}"
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
