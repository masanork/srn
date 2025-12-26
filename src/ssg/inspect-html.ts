
import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';
import opentype from 'opentype.js';
// @ts-ignore
import wawoff2 from 'wawoff2';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

async function main() {
    const args = process.argv.slice(2);
    const targetFile = args[0] || 'index.html';
    const filePath = path.join(DIST_DIR, targetFile);

    if (!await fs.pathExists(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const htmlContent = await fs.readFile(filePath, 'utf-8');
    const $ = cheerio.load(htmlContent);

    const fontFaces: { name: string, buffer: Buffer }[] = [];

    $('style').each((_: number, style: any) => {
        const css = $(style).text();
        const fontFaceRegex = /@font-face\s*{\s*font-family:\s*'([^']+)';\s*src:\s*url\('data:font\/woff2;base64,([^']+)'\)/g;
        let match;
        while ((match = fontFaceRegex.exec(css)) !== null) {
            const name = match[1];
            const base64 = match[2];
            if (name && base64) {
                fontFaces.push({ name, buffer: Buffer.from(base64, 'base64') });
            }
        }
    });

    if (fontFaces.length === 0) {
        console.log("No embedded WOFF2 fonts found in the target HTML.");
        return;
    }

    console.log(`Found ${fontFaces.length} embedded fonts. Inspecting...`);

    let inspectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Font Inspector - ${targetFile}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
        .font-section { background: white; margin-bottom: 40px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .font-header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
        .glyph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; }
        .glyph-item { border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; background: #fff; }
        .glyph-svg { width: 64px; height: 64px; margin: 0 auto 10px; display: block; }
        .glyph-meta { font-size: 11px; color: #666; word-break: break-all; }
        .glyph-code { font-weight: bold; font-family: monospace; font-size: 13px; margin-bottom: 4px; color: #333; }
        .pua-tag { color: #d00; font-size: 9px; vertical-align: super; }
    </style>
</head>
<body>
    <h1>Font Inspector: ${targetFile}</h1>
    <p>Extracted from embedded WOFF2 data URLs.</p>
`;

    for (const ff of fontFaces) {
        console.log(`  Processing font: ${ff.name}`);
        const decompressedRaw = await wawoff2.decompress(ff.buffer);
        const decompressed = decompressedRaw.buffer.slice(decompressedRaw.byteOffset, decompressedRaw.byteOffset + decompressedRaw.byteLength);
        const font = opentype.parse(decompressed);

        // Debug cmap subtable formats
        const view = new DataView(decompressed);
        const numTables = view.getUint16(4, false);
        let cmapOffset = 0;
        for (let i = 0; i < numTables; i++) {
            const p = 12 + i * 16;
            const tag = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3));
            if (tag === 'cmap') { cmapOffset = view.getUint32(p + 8, false); break; }
        }

        const cmapInfo: string[] = [];
        if (cmapOffset) {
            const numSubtables = view.getUint16(cmapOffset + 2, false);
            for (let i = 0; i < numSubtables; i++) {
                const p = cmapOffset + 4 + i * 8;
                const plat = view.getUint16(p, false);
                const enc = view.getUint16(p + 2, false);
                const off = view.getUint32(p + 4, false);
                const fmt = view.getUint16(cmapOffset + off, false);
                cmapInfo.push(`P${plat}E${enc}F${fmt}`);
            }
        }

        inspectHtml += `
    <div class="font-section">
        <div class="font-header">
            <h2>Font Family: ${ff.name}</h2>
            <p>Glyphs: ${font.glyphs.length} | Units per Em: ${font.unitsPerEm}</p>
            <p><strong>Cmap Subtables:</strong> ${cmapInfo.join(', ')}</p>
        </div>
        <div class="glyph-grid">
`;

        for (let i = 0; i < font.glyphs.length; i++) {
            const glyph = font.glyphs.get(i);
            const name = glyph.name || `glyph_${i}`;
            const unicode = glyph.unicode;
            const unicodes = glyph.unicodes || (unicode !== undefined ? [unicode] : []);

            // Generate SVG path for preview
            const unitsPerEm = font.unitsPerEm;
            const ascender = font.ascender;
            const glyphPath = glyph.getPath(0, ascender, unitsPerEm);
            const pathData = glyphPath.toPathData(2);
            const width = glyph.advanceWidth || unitsPerEm;

            const svg = `
                <svg viewBox="0 0 ${width} ${unitsPerEm}" class="glyph-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="${pathData}" fill="currentColor" />
                </svg>
            `;

            const codes = unicodes.map(u => {
                const hex = 'U+' + u.toString(16).toUpperCase();
                const isPua = (u >= 0xE000 && u <= 0xF8FF) || (u >= 0xF0000 && u <= 0xFFFFD) || (u >= 0x100000 && u <= 0x10FFFD);
                return `<div class="glyph-code">${hex}${isPua ? ' <span class="pua-tag">PUA</span>' : ''}</div>`;
            }).join('');

            inspectHtml += `
            <div class="glyph-item">
                ${svg}
                ${codes}
                <div class="glyph-meta">${name}</div>
                <div class="glyph-meta">Index: ${i}</div>
            </div>
`;
        }

        inspectHtml += `
        </div>
    </div>
`;
    }

    inspectHtml += `
</body>
</html>
`;

    const outPath = path.join(DIST_DIR, `inspect-${targetFile.replace('.html', '')}.html`);
    await fs.writeFile(outPath, inspectHtml);
    console.log(`Inspection report generated: ${outPath}`);
}

main().catch(console.error);
