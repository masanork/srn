import opentype from 'opentype.js';
import fs from 'fs-extra';

export async function subsetFont(fontPath: string, text: string): Promise<Buffer> {
    const fontBuffer = await fs.readFile(fontPath);
    // opentype.parse expects an ArrayBuffer, not a Node Buffer
    const arrayBuffer = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
    const font = opentype.parse(arrayBuffer);

    const glyphs = [];
    // Always include .notdef (glyph index 0)
    glyphs.push(font.glyphs.get(0));

    const uniqueChars = Array.from(new Set(text.split('')));
    for (const char of uniqueChars) {
        const glyph = font.charToGlyph(char);
        // Ensure we don't duplicate .notdef or other glyphs if text maps to them unexpectedly
        if (glyph && glyph.index !== 0) {
            glyphs.push(glyph);
        }
    }

    // Create a new font with the subset of glyphs
    const subset = new opentype.Font({
        familyName: 'SubsetFont',
        styleName: 'Regular',
        unitsPerEm: font.unitsPerEm,
        ascender: font.ascender,
        descender: font.descender,
        glyphs: glyphs
    });

    const subsetBuffer = subset.toArrayBuffer();
    return Buffer.from(subsetBuffer);
}

export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'font/sfnt'): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
