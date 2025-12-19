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

        // Convert to HTML
        const htmlContent = await marked.parse(content);

        // Extract text for subsetting
        const $ = cheerio.load(htmlContent);
        const bodyText = $.text().replace(/\s+/g, '');
        const fullText = (data.title || '') + bodyText;

        let fontCss = '';
        if (data.font) {
            const fontPath = path.join(FONTS_DIR, data.font);
            if (await fs.pathExists(fontPath)) {
                try {
                    console.log(`  Subsetting font: ${data.font}`);
                    const { buffer, mimeType } = await subsetFont(fontPath, fullText);

                    // WOFF2 is now standard output
                    const format = 'woff2';

                    const dataUrl = bufferToDataUrl(buffer, mimeType);

                    fontCss = `
<style>
@font-face {
  font-family: 'SubsetFont';
  src: url('${dataUrl}') format('${format}');
  font-display: swap;
}
body {
  font-family: 'SubsetFont', sans-serif;
  margin: 0;
  padding: 2rem;
  line-height: 1.6;
}
</style>
                    `;
                } catch (err) {
                    console.error(`  Error subsetting font: ${err}`);
                    console.error(err);
                }
            } else {
                console.warn(`  Font not found: ${data.font}`);
            }
        }

        // Simple HTML wrap
        const finalHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    ${fontCss}
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
