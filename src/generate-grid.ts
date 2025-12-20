
import opentype from 'opentype.js';
import fs from 'fs-extra';
import path from 'path';


async function generateGrid(fontPath: string, outputDir: string) {
    const fontFileName = path.basename(fontPath);
    const fontName = path.basename(fontPath, path.extname(fontPath));
    // Check if filename contains digits (often version) to keep it clean, but uniqueness is key.
    // User requested "fontfilename.md" so we should use the full name or basename.
    // Let's use the basename of the file for the md file. i.e. ipamjm.ttf -> ipamjm.md

    const outputName = `${fontName}.md`;
    const outputPath = path.resolve(outputDir, outputName);

    // Incremental check
    if (await fs.pathExists(outputPath)) {
        const fontStat = await fs.stat(fontPath);
        const mdStat = await fs.stat(outputPath);
        if (fontStat.mtime <= mdStat.mtime) {
            console.log(`Skipping ${fontName}: Up to date.`);
            return;
        }
    }

    console.log(`Processing ${fontName} from ${fontPath}...`);
    try {
        const buffer = await fs.readFile(fontPath);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const font = opentype.parse(arrayBuffer);

        const numGlyphs = font.glyphs.length;
        console.log(`  Found ${numGlyphs} glyphs.`);

        let gridItems = '';
        let count = 0;

        for (let i = 0; i < numGlyphs; i++) {
            const glyph = font.glyphs.get(i);
            if (glyph.unicode) {
                const char = String.fromCodePoint(glyph.unicode);
                const hex = 'U+' + glyph.unicode.toString(16).toUpperCase().padStart(4, '0');
                const name = glyph.name || '';
                const index = glyph.index;

                gridItems += `
    <div class="g-item">
        <div class="g-char">${char}</div>
        <div class="g-meta">
            <div>${hex}</div>
            <div class="g-name" title="${name}">${name}</div>
            <div class="g-id">#${index}</div>
        </div>
    </div>`;
                count++;
            }
        }

        const mdContent = `---
title: Glyph Grid - ${fontName}
layout: grid
font: ${fontFileName}
---

# Glyph Grid: ${fontName}

**Font:** \`${fontFileName}\`
**Mapped Glyphs:** ${count} / ${numGlyphs}

<div class="font-grid-container">
    ${gridItems}
</div>

<style>
/* Optimization: Content Visibility */
.font-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    padding: 20px 0;
}

.g-item {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    content-visibility: auto;
    contain-intrinsic-size: 100px 120px;
}

.g-item:hover {
    border-color: #bbb;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10;
}

.g-char {
    font-size: 2.5rem;
    line-height: 1.2;
    margin-bottom: 8px;
    font-family: '${fontName}', serif; /* Uses the font defined in Frontmatter */
    color: #222;
    font-feature-settings: normal; 
}

.g-meta {
    font-size: 0.7rem;
    color: #666;
    text-align: center;
    width: 100%;
    font-family: monospace;
}

.g-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    margin: 2px 0;
}

.g-id {
    color: #999;
    font-size: 0.6rem;
}
</style>
`;

        await fs.writeFile(outputPath, mdContent);
        console.log(`  Generated: ${outputPath}`);
    } catch (e) {
        console.error(`  Error processing ${fontName}:`, e);
    }
}

async function main() {
    const args = process.argv.slice(2);
    let target = args[0];

    // Default output directory
    const outputDir = path.join(process.cwd(), 'site', 'content');

    // If no arg or 'all', scan site/fonts
    if (!target || target === 'all') {
        const fontsDir = path.join(process.cwd(), 'site', 'fonts');
        if (await fs.pathExists(fontsDir)) {
            const files = await fs.readdir(fontsDir);
            for (const file of files) {
                if (file.match(/\.(ttf|otf|woff2?)$/i)) {
                    await generateGrid(path.join(fontsDir, file), outputDir);
                }
            }
        } else {
            console.error("No site/fonts directory found.");
        }
    } else {
        // Single file mode
        let fontPath = target;
        if (!await fs.pathExists(fontPath)) {
            const siteFontPath = path.join(process.cwd(), 'site', 'fonts', fontPath);
            if (await fs.pathExists(siteFontPath)) fontPath = siteFontPath;
            else if (await fs.pathExists(siteFontPath + '.ttf')) fontPath = siteFontPath + '.ttf';
            else if (await fs.pathExists(siteFontPath + '.otf')) fontPath = siteFontPath + '.otf';
        }

        if (await fs.pathExists(fontPath)) {
            await generateGrid(fontPath, outputDir);
        } else {
            console.error(`Font not found: ${target}`);
        }
    }
}

main();
