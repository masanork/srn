import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { glob } from 'glob';

import * as cheerio from 'cheerio';
import { subsetFont, bufferToDataUrl } from './font.ts';
import { articleLayout } from './layouts/article.ts';
import type { ArticleData } from './layouts/article.ts';
import { variantsLayout } from './layouts/variants.ts';
import type { VariantsData } from './layouts/variants.ts';
import { officialLayout } from './layouts/official.ts';
import type { OfficialData } from './layouts/official.ts';
import { gridLayout } from './layouts/grid.ts';
import type { GridData } from './layouts/grid.ts';
import { createHybridVC } from './vc.ts';

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
        // Parse font configurations
        let fontConfigs: string[] = [];
        if (data.font) {
            fontConfigs = Array.isArray(data.font) ? data.font : [data.font];
        } else {
            // Default fonts if none specified
            fontConfigs = ['ipamjm.ttf', 'acgjm.ttf'];
        }

        const styleMap: Record<string, string[]> = {};
        const uniqueFontsToSubset = new Set<string>();

        const getBaseName = (fname: string) => path.basename(fname, path.extname(fname)).replace(/[^a-zA-Z0-9]/g, '');

        for (const config of fontConfigs) {
            let styleName = 'default';
            let fileListStr = config;

            if (config.includes(':')) {
                const parts = config.split(':');
                styleName = parts[0].trim();
                fileListStr = parts.slice(1).join(':').trim(); // Join back in case filename has :, though unlikely
            }

            const files = fileListStr.split(',').map(s => s.trim()).filter(s => s);

            if (!styleMap[styleName]) {
                styleMap[styleName] = [];
            }

            for (const file of files) {
                uniqueFontsToSubset.add(file);
                // Use a generated family name based on filename to uniquely identify it
                styleMap[styleName].push(`'${getBaseName(file)}'`);
            }
        }

        // Subset unique fonts
        for (const fontName of uniqueFontsToSubset) {
            const fontPath = path.join(FONTS_DIR, fontName);

            if (await fs.pathExists(fontPath)) {
                try {
                    console.log(`  Subsetting font: ${fontName}`);
                    const { buffer, mimeType } = await subsetFont(fontPath, fullText);

                    const format = 'woff2';
                    const dataUrl = bufferToDataUrl(buffer, mimeType);
                    const fontFamilyName = getBaseName(fontName);

                    fontCss += `
<style>
@font-face {
  font-family: '${fontFamilyName}';
  src: url('${dataUrl}') format('${format}');
  font-display: swap;
}
</style>
                    `;
                } catch (err) {
                    console.error(`  Error subsetting font ${fontName}: ${err}`);
                    console.error(err);
                }
            } else {
                console.warn(`  Font not found: ${fontName}`);
            }
        }

        // Generate utility classes for non-default styles
        let utilityCss = '<style>\n';
        for (const [styleName, stack] of Object.entries(styleMap)) {
            if (styleName === 'default') continue;
            const stackStr = [...stack, 'serif'].join(', ');
            utilityCss += `.font-${styleName} { font-family: ${stackStr} !important; }\n`;
        }
        utilityCss += '</style>';
        fontCss += utilityCss;

        // Default fallbacks
        const defaultStack = styleMap['default'] || [];
        const safeFontFamilies = [...defaultStack, 'serif'];
        const fontFamilyCss = safeFontFamilies.join(', ');



        // ... (configuration)

        // ...

        // Global styles (only font-family injection needed now)
        const globalStyle = `
<style>
body {
  font-family: ${fontFamilyCss};
}
</style>
        `;
        fontCss += globalStyle;

        // Render HTML using Layout System
        let finalHtml = '';
        if (data.layout === 'variants') {
            finalHtml = variantsLayout(
                data as VariantsData,
                htmlContent,
                fontCss,
                safeFontFamilies
            );
        } else if (data.layout === 'official') {
            // Generate VC for official documents
            console.log("  Generating PQC Hybrid VC...");
            // Extract plain text for signing (simplified)
            const plainText = cheerio.load(htmlContent).text();

            const vcPayload = {
                id: `urn:uuid:${crypto.randomUUID()}`,
                credentialSubject: {
                    id: `https://example.com/notices/${file.replace('.md', '')}`,
                    name: data.title,
                    recipient: data.recipient,
                    contentDigest: Buffer.from(new TextEncoder().encode(plainText)).toString('hex')
                }
            };

            const { vc } = await createHybridVC(vcPayload);

            // Save VC sidecar
            const vcOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.json'));
            await fs.writeJson(vcOutPath, vc, { spaces: 2 });
            console.log(`  Generated VC: ${vcOutPath}`);



            finalHtml = officialLayout(
                data as OfficialData,
                htmlContent,
                fontCss,
                safeFontFamilies,
                vc
            );
        } else if (data.layout === 'grid') {
            finalHtml = gridLayout(
                data as GridData,
                htmlContent,
                fontCss,
                safeFontFamilies
            );
        } else {
            // Default to article
            finalHtml = articleLayout(
                data as ArticleData,
                htmlContent,
                fontCss,
                safeFontFamilies
            );
        }

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
