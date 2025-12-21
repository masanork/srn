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

    // 2. Find encoding record for Unicode Variation Sequences
    //    We scan for any subtable that has Format 14.
    //    Commonly Platform 0, Encoding 5.
    const numSubtables = getUShort(view, cmapOffset + 2);
    let subtableOffset = 0;

    for (let i = 0; i < numSubtables; i++) {
        const p = cmapOffset + 4 + i * 8;
        const offset = getULong(view, p + 4);

        // Check subtable format
        const subTableStart = cmapOffset + offset;

        // Ensure within bounds
        if (subTableStart + 2 > view.byteLength) continue;

        const format = getUShort(view, subTableStart);
        if (format === 14) {
            subtableOffset = subTableStart;
            break;
        }
    }

    if (!subtableOffset) return null;

    // 3. Parse Format 14
    // Format is already checked above, but good for clarity
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

export async function subsetFont(
    fontPath: string,
    text: string,
    options: { puaStart: number, globalReplacements: Map<string, string> } = { puaStart: 0xE000, globalReplacements: new Map() }
): Promise<{ buffer: Buffer, mimeType: string, nextPua: number }> {
    const fontBuffer = await fs.readFile(fontPath);
    // opentype.parse expects an ArrayBuffer, not a Node Buffer
    const arrayBuffer = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
    const font = opentype.parse(arrayBuffer);

    // Try to parse IVS map
    let ivsMap: IVSMap | null = null;
    try {
        ivsMap = parseCmapFormat14(arrayBuffer, font);
        if (ivsMap) console.log(`  [${path.basename(fontPath)}] IVS Map loaded.`);
    } catch (e) {
        console.warn('  Failed to parse CMAP Format 14:', e);
    }

    const glyphs: opentype.Glyph[] = [];
    const addedGlyphs = new Set<opentype.Glyph>(); // Use object reference for deduplication

    // Helper to add glyph
    const addGlyph = (g: opentype.Glyph) => {
        if (!addedGlyphs.has(g)) {
            glyphs.push(g);
            addedGlyphs.add(g);
        }
    };

    const notdefGlyph = font.glyphs.get(0);
    addGlyph(notdefGlyph);

    // Local cache for this font subsetting session
    const ivsCache = new Map<string, opentype.Glyph>();

    let puaCounter = options.puaStart;
    const { globalReplacements } = options;

    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (!char) continue;
        const code = char.codePointAt(0);
        if (code === undefined) continue;

        // Check next char for Variation Selector
        let vsCode = 0;
        let originalSeq = char; // Base

        if (i + 1 < chars.length) {
            const nextChar = chars[i + 1];
            if (nextChar) {
                const nextCode = nextChar.codePointAt(0);
                if (nextCode !== undefined && isVariationSelector(nextCode)) {
                    vsCode = nextCode;
                    originalSeq += nextChar; // Base + VS
                    i++; // Skip VS in next iteration
                }
            }
        }

        let glyph: opentype.Glyph | null = null;
        let isIvsGlyph = false;

        // 1. IVS Lookup
        if (vsCode && ivsMap && ivsMap[vsCode]) {
            // Check cache first
            if (ivsCache.has(originalSeq)) {
                glyph = ivsCache.get(originalSeq)!;
                isIvsGlyph = true;
            } else {
                const gid = ivsMap[vsCode][code];
                if (gid !== undefined) {
                    const originGlyph = font.glyphs.get(gid);

                    if (originGlyph) {
                        // Determine PUA Code (Reuse global or assign new)
                        let puaChar = globalReplacements.get(originalSeq);
                        let puaCode: number;

                        if (puaChar) {
                            puaCode = puaChar.codePointAt(0)!;
                        } else {
                            puaCode = puaCounter++;
                            puaChar = String.fromCodePoint(puaCode);
                            globalReplacements.set(originalSeq, puaChar);
                        }

                        // Create Variant Glyph
                        glyph = new opentype.Glyph({
                            name: originGlyph.name || `u${code.toString(16)}_vs${vsCode.toString(16)}`,
                            unicode: puaCode,
                            unicodes: [puaCode],
                            advanceWidth: originGlyph.advanceWidth,
                            path: originGlyph.path
                        });

                        ivsCache.set(originalSeq, glyph);
                        isIvsGlyph = true;
                    }
                }
            }
        }

        // 2. Fallback / Standard Lookup
        if (!glyph) {
            // For IVS sequence not supported by this font, we should fallback to BASE char?
            // If valid IVS but font missing support: fallback to base glyph.
            // If we fall back to base glyph, we do NOT want to consume the VS if we want to let browser try fallback font?
            // BUT here we are creating a subset font.
            // Replaced content in HTML will be PUA.
            // If FontA missing IVS, we don't map PUA.
            // HTML remains "Base+VS" (if we don't replace globally? Wait).
            // Logic: globalReplacements are applied to HTML.
            // If FontA misses support, it adds NOTHING to globalReplacements.
            // If FontB supports it, it adds S->PUA.
            // HTML replaced S->PUA.
            // Browser sees PUA. Checks FontA. FontA has NO glyph for PUA.
            // Checks FontB. FontB has glyph for PUA. Renders FontB. Success!

            // So if NOT found in map, we treat as standard char(s).
            // WARNING: If vsCode was detected but not supported, we must handle 'char' (Base).
            // What about VS char itself? Standard fonts usually map VS to nothing or invisible.
            // We should just ensure Base glyph is added.

            glyph = font.charToGlyph(char);

            // If we skipped 'nextChar' thinking it was a VS but now we fallback, 
            // should we add VS glyph? usually invisible.
            // Ideally we handled the pair.
        }

        if (glyph) {
            addGlyph(glyph);
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
    const woff2Buffer = await wawoff2.compress(new Uint8Array(subsetBuffer));

    return {
        buffer: Buffer.from(woff2Buffer),
        mimeType: 'font/woff2',
        nextPua: puaCounter
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
