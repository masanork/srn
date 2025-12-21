import opentype from 'opentype.js';
import fs from 'fs-extra';
import path from 'path';
// @ts-ignore
import wawoff2 from 'wawoff2';

// ... (existing code) ...



function getUShort(view: DataView, offset: number) { return view.getUint16(offset, false); }
function getULong(view: DataView, offset: number) { return view.getUint32(offset, false); }
function getUInt24(view: DataView, offset: number) {
    return (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);
}

interface IVSMap {
    [vs: number]: { [base: number]: number }; // VS -> Base -> GID
}

// Minimal CMAP Format 14 Parser
function parseCmapFormat14(buffer: ArrayBuffer, font: opentype.Font): IVSMap | null {
    const view = new DataView(buffer);

    // 1. Find 'cmap' table offset
    const numTables = getUShort(view, 4);
    let cmapOffset = 0;

    for (let i = 0; i < numTables; i++) {
        const p = 12 + i * 16;
        const tag = String.fromCharCode(
            view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3)
        );
        if (tag === 'cmap') {
            cmapOffset = getULong(view, p + 8);
            break;
        }
    }

    if (!cmapOffset) return null;

    // 2. Find encoding record for Unicode Variation Sequences (Platform 0, Encoding 5)
    //    Format 14 is typically in Platform 0, Encoding 5.
    const numSubtables = getUShort(view, cmapOffset + 2);
    let subtableOffset = 0;

    for (let i = 0; i < numSubtables; i++) {
        const p = cmapOffset + 4 + i * 8;
        const platformID = getUShort(view, p);
        const encodingID = getUShort(view, p + 2);

        // Unicode Variation Sequences
        if (platformID === 0 && encodingID === 5) {
            subtableOffset = cmapOffset + getULong(view, p + 4);
            break;
        }
    }

    if (!subtableOffset) return null;

    // 3. Parse Format 14
    const format = getUShort(view, subtableOffset);
    if (format !== 14) return null;

    const length = getULong(view, subtableOffset + 2);
    const numVarSelectorRecords = getULong(view, subtableOffset + 6);

    const map: IVSMap = {};

    for (let i = 0; i < numVarSelectorRecords; i++) {
        const p = subtableOffset + 10 + i * 11;
        const varSelector = getUInt24(view, p); // 24-bit UINT
        const defaultUVSOffset = getULong(view, p + 3);
        const nonDefaultUVSOffset = getULong(view, p + 7);

        if (!map[varSelector]) map[varSelector] = {};

        // We mainly care about Non-Default UVS (explicit glyph mapping)
        if (nonDefaultUVSOffset !== 0) {
            const ndOffset = subtableOffset + nonDefaultUVSOffset;
            const numUVSMappings = getULong(view, ndOffset);
            for (let j = 0; j < numUVSMappings; j++) {
                const mp = ndOffset + 4 + j * 5;
                const unicodeValue = getUInt24(view, mp);
                const glyphID = getUShort(view, mp + 3);
                map[varSelector][unicodeValue] = glyphID;
            }
        }
    }

    return map;
}

function isVariationSelector(codepoint: number): boolean {
    return (codepoint >= 0xFE00 && codepoint <= 0xFE0F) || // VS1-VS16
        (codepoint >= 0xE0100 && codepoint <= 0xE01EF); // VS17-VS256
}

export async function subsetFont(fontPath: string, text: string): Promise<{ buffer: Buffer, mimeType: string }> {
    const fontBuffer = await fs.readFile(fontPath);
    // opentype.parse expects an ArrayBuffer, not a Node Buffer
    const arrayBuffer = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
    const font = opentype.parse(arrayBuffer);

    // Try to parse IVS map
    let ivsMap: IVSMap | null = null;
    try {
        ivsMap = parseCmapFormat14(arrayBuffer, font);
        if (ivsMap) console.log('  IVS Map loaded successfully.');
    } catch (e) {
        console.warn('  Failed to parse CMAP Format 14:', e);
    }

    const glyphs: opentype.Glyph[] = [];
    const glyphIndexSet = new Set<number>();

    const notdefGlyph = font.glyphs.get(0);
    glyphs.push(notdefGlyph);
    glyphIndexSet.add(0);

    // Custom text iterator to handle Surrogate Pairs and IVS
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (char === undefined) continue;
        const code = char.codePointAt(0);

        if (code === undefined) continue;

        // Check next char for Variation Selector
        let vsCode = 0;
        if (i + 1 < chars.length) {
            const nextChar = chars[i + 1];
            // Ensure nextChar is defined and get its code
            if (nextChar) {
                const nextCode = nextChar.codePointAt(0);
                if (nextCode !== undefined && isVariationSelector(nextCode)) {
                    vsCode = nextCode;
                    i++; // Skip VS in next iteration
                }
            }
        }

        let glyph: opentype.Glyph | null = null;

        // 1. Try IVS lookup
        // Check if map exists and has the specific mapping
        if (vsCode && ivsMap && ivsMap[vsCode]) {
            const gid = ivsMap[vsCode][code];
            if (gid !== undefined) {
                glyph = font.glyphs.get(gid);
            }
            // console.log(`  IVS found: ${char} (U+${code.toString(16)}) + VS (U+${vsCode.toString(16)}) -> GID ${gid}`);
        }

        // 2. Fallback to standard lookup
        if (!glyph) {
            glyph = font.charToGlyph(char);
        }

        if (glyph && !glyphIndexSet.has(glyph.index)) {
            glyphs.push(glyph);
            glyphIndexSet.add(glyph.index);
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

    // Compress to WOFF2
    const woff2Buffer = await wawoff2.compress(new Uint8Array(subsetBuffer));

    return {
        buffer: Buffer.from(woff2Buffer),
        mimeType: 'font/woff2'
    };
}


export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'font/sfnt'): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

const fontCache: Record<string, opentype.Font> = {};

export async function getGlyphAsSvg(fontPath: string, identifier: string): Promise<string> {
    let font = fontCache[fontPath];
    if (!font) {
        if (!await fs.pathExists(fontPath)) {
            return `<span class="error">Font not found: ${path.basename(fontPath)}</span>`;
        }
        const fontBuffer = await fs.readFile(fontPath);
        const arrayBuffer = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
        font = opentype.parse(arrayBuffer);
        fontCache[fontPath] = font;
    }

    let glyph: opentype.Glyph | null = null;

    // Try to find by Glyph Name (MJxxxx etc)
    const numGlyphs = font.glyphs.length;
    for (let i = 0; i < numGlyphs; i++) {
        const g = font.glyphs.get(i);
        if (g.name === identifier) {
            glyph = g;
            break;
        }
    }

    // Try by GID if identifier looks like a number or 'gid:xxx'
    if (!glyph) {
        if (identifier.startsWith('gid:')) {
            const gid = parseInt(identifier.split(':')[1]);
            if (!isNaN(gid)) glyph = font.glyphs.get(gid);
        }
    }

    // As a fallback, check if the identifier is a Unicode string (or IVS sequence)
    // We assume if it contains non-ASCII characters, it's a direct character string.
    if (!glyph && /[^\x00-\x7F]/.test(identifier)) {
        // Handle IVS? opentype.js charToGlyph might not handle IVS sequence directly.
        // We extracted logic in subsetFont but charToGlyph takes a single char usually.
        // But let's check input length.

        // Simple case: Just the first codepoint (Base char)
        // Ideally we should use the IVS map we parsed in subsetFont, but we don't have it cached here easily.
        // For PoC, we rely on the font's default charToGlyph behavior for the base char.
        // OR we map specific IVS if we had the map.

        // Note: For now, we just pass the string. If it's multiple chars (IVS), charToGlyph takes the first?
        // opentype.js 1.3.4 signature: charToGlyph(c). matches standard unicode binding.

        glyph = font.charToGlyph(identifier);
    }

    if (!glyph) {
        return `<span class="error">Glyph not found: ${identifier}</span>`;
    }

    // Generate SVG path
    // Scale to standard size (e.g. 1000 units)
    // opentype.js getPath(x, y, fontSize)
    // We want to fit it into an SVG viewBox.
    // Let's use UnitsPerEm as the coordinate system.

    // To display correctly in SVG with default top-down coordinates:
    // We can use a transformation or calculate path with inverted Y.
    // opentype.js getPath returns commands for a 2D context where Y grows downwards if we just look at raw coordinates?
    // Actually getPath(0, 0, 72) renders to canvas.
    // getPath().toPathData(decimals) returns the 'd' attribute.

    // Let's generate path data for 1em size.
    // We place the origin at (0, em_ascender) so that the glyph sits on the baseline 
    // and extends up to the ascender line at y=0.

    const head = font.tables.head;
    const unitsPerEm = font.unitsPerEm;
    const ascender = font.ascender;
    const descender = font.descender;

    // Glyph Path
    // Note: getPath(x, y, fontSize)
    // We use unitsPerEm as fontSize to keep 1:1 coordinate mapping with font design space
    const glyphPath = glyph.getPath(0, ascender, unitsPerEm);
    const pathData = glyphPath.toPathData(2);

    const width = glyph.advanceWidth || unitsPerEm;
    // const height = ascender - descender; // Total height
    const height = unitsPerEm; // Keep it simple square-ish relative to em

    // ViewBox: 0 0 width height
    // However, some glyphs might draw outside advanceWidth. 
    // But for inline icon usage, using advanceWidth is standard.

    return `<svg viewBox="0 0 ${width} ${height}" class="inline-glyph" style="height: 1em; vertical-align: middle; fill: currentColor;" xmlns="http://www.w3.org/2000/svg">
        <path d="${pathData}" />
    </svg>`;
}
