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


// --- Binary Utilities ---
function calculateChecksum(buffer: Uint8Array): number {
    let sum = 0;
    const nLongs = Math.floor(buffer.length / 4);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    for (let i = 0; i < nLongs; i++) {
        sum = (sum + view.getUint32(i * 4, false)) >>> 0;
    }
    const left = buffer.length % 4;
    if (left > 0) {
        let val = 0;
        for (let i = 0; i < left; i++) {
            val = (val << 8) + (buffer[nLongs * 4 + i] ?? 0);
        }
        val = val << (8 * (4 - left));
        sum = (sum + val) >>> 0;
    }
    return sum;
}

// --- Cmap Generators ---
function generateCmapFormat12(mappings: { code: number, gid: number }[]): Uint8Array {
    const sorted = [...mappings].sort((a, b) => a.code - b.code);
    const groups: { start: number, end: number, gid: number }[] = [];

    if (sorted.length > 0) {
        let current = { start: sorted[0]!.code, end: sorted[0]!.code, gid: sorted[0]!.gid };
        for (let i = 1; i < sorted.length; i++) {
            const m = sorted[i]!;
            if (m.code === current.end + 1 && m.gid === current.gid + (m.code - current.start)) {
                current.end = m.code;
            } else {
                groups.push(current);
                current = { start: m.code, end: m.code, gid: m.gid };
            }
        }
        groups.push(current);
    }

    const size = 16 + 12 * groups.length;
    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);

    view.setUint16(0, 12, false); // format
    view.setUint32(4, size, false); // length
    view.setUint32(8, 0, false); // language
    view.setUint32(12, groups.length, false); // numGroups

    let offset = 16;
    for (const g of groups) {
        view.setUint32(offset, g.start, false);
        view.setUint32(offset + 4, g.end, false);
        view.setUint32(offset + 8, g.gid, false);
        offset += 12;
    }
    return buffer;
}

function generateCmapFormat14(ivsRecords: { vs: number, code: number, gid: number }[]): Uint8Array {
    const vsMap = new Map<number, { code: number, gid: number }[]>();
    const seen = new Set<string>();

    for (const rec of ivsRecords) {
        const key = `${rec.vs}-${rec.code}`;
        if (seen.has(key)) continue;
        seen.add(key);

        if (!vsMap.has(rec.vs)) vsMap.set(rec.vs, []);
        vsMap.get(rec.vs)!.push(rec);
    }
    const sortedVS = Array.from(vsMap.keys()).sort((a, b) => a - b);

    let size = 10 + 11 * sortedVS.length;
    const uvsTableSizes: number[] = [];

    for (const vs of sortedVS) {
        const mappings = vsMap.get(vs)!;
        const tableSize = 4 + 5 * mappings.length;
        uvsTableSizes.push(tableSize);
        size += tableSize;
    }

    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);
    let offset = 10;

    view.setUint16(0, 14, false); // format
    view.setUint32(2, size, false); // length
    view.setUint32(6, sortedVS.length, false); // numRecords

    let subTableOffset = 10 + 11 * sortedVS.length;

    for (let i = 0; i < sortedVS.length; i++) {
        const vs = sortedVS[i]!;
        const uvsSize = uvsTableSizes[i]!;

        view.setUint8(offset, (vs >> 16) & 0xFF);
        view.setUint8(offset + 1, (vs >> 8) & 0xFF);
        view.setUint8(offset + 2, vs & 0xFF);

        view.setUint32(offset + 3, 0, false); // Default UVS = 0
        view.setUint32(offset + 7, subTableOffset, false); // Non-Default UVS offset

        offset += 11;
        subTableOffset += uvsSize;
    }

    for (let i = 0; i < sortedVS.length; i++) {
        const vs = sortedVS[i]!;
        const mappings = vsMap.get(vs)!.sort((a, b) => a.code - b.code);

        view.setUint32(offset, mappings.length, false);
        offset += 4;

        for (const m of mappings) {
            view.setUint8(offset, (m.code >> 16) & 0xFF);
            view.setUint8(offset + 1, (m.code >> 8) & 0xFF);
            view.setUint8(offset + 2, m.code & 0xFF);
            view.setUint16(offset + 3, m.gid, false);
            offset += 5;
        }
    }
    return buffer;
}

// --- Injection Logic ---
function injectNativeCmap(subsetBuffer: ArrayBuffer, unicodeMap: { code: number, gid: number }[], ivsRecords: { vs: number, code: number, gid: number }[]): ArrayBuffer {
    const view = new DataView(subsetBuffer);
    const numTables = view.getUint16(4, false);

    let cmapOffset = 0;
    let cmapLength = 0;
    let cmapDirOffset = 0;

    for (let i = 0; i < numTables; i++) {
        const p = 12 + i * 16;
        const tag = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3));
        if (tag === 'cmap') {
            cmapDirOffset = p;
            cmapOffset = view.getUint32(p + 8, false);
            cmapLength = view.getUint32(p + 12, false);
            break;
        }
    }

    if (!cmapOffset) return subsetBuffer;

    // Build New Cmap Table
    const oldCmapView = new DataView(subsetBuffer, cmapOffset, cmapLength);
    const numSubtables = oldCmapView.getUint16(2, false);

    interface SubTableRecord { platform: number; encoding: number; data: Uint8Array; }
    const subtables: SubTableRecord[] = [];

    // 1. Extract Format 4 (BMP) data from opentype.js
    let f4Data: Uint8Array | null = null;
    for (let i = 0; i < numSubtables; i++) {
        const p = 4 + i * 8;
        const off = oldCmapView.getUint32(p + 4, false);
        const fmt = oldCmapView.getUint16(off, false);
        if (fmt === 4) {
            const len = oldCmapView.getUint16(off + 2, false);
            f4Data = new Uint8Array(subsetBuffer, cmapOffset + off, len);
            break;
        }
    }

    if (f4Data) {
        subtables.push({ platform: 0, encoding: 3, data: f4Data }); // Unicode BMP
        subtables.push({ platform: 3, encoding: 1, data: f4Data }); // Windows BMP
    }

    // 2. Add Format 12 (Unicode Full Plane)
    const f12Data = generateCmapFormat12(unicodeMap);
    subtables.push({ platform: 0, encoding: 4, data: f12Data }); // Unicode Full
    subtables.push({ platform: 3, encoding: 10, data: f12Data }); // Windows Unicode Full

    // 3. Add Format 14 (IVS)
    if (ivsRecords.length > 0) {
        const f14Data = generateCmapFormat14(ivsRecords);
        subtables.push({ platform: 0, encoding: 5, data: f14Data }); // Unicode Variation Sequences
    }

    // 4. Sort subtables by Platform ID then Encoding ID (Strictly required)
    subtables.sort((a, b) => {
        if (a.platform !== b.platform) return a.platform - b.platform;
        return a.encoding - b.encoding;
    });

    // Construct the new cmap table binary
    const headerSize = 4 + subtables.length * 8;
    let totalCmapLen = headerSize;
    for (const t of subtables) totalCmapLen += t.data.length;

    const newCmap = new Uint8Array(totalCmapLen);
    const ncw = new DataView(newCmap.buffer);
    ncw.setUint16(0, 0, false);
    ncw.setUint16(2, subtables.length, false);

    let dataOffset = headerSize;
    for (let i = 0; i < subtables.length; i++) {
        const t = subtables[i]!;
        const p = 4 + i * 8;
        ncw.setUint16(p, t.platform, false);
        ncw.setUint16(p + 2, t.encoding, false);
        ncw.setUint32(p + 4, dataOffset, false);
        newCmap.set(t.data, dataOffset);
        dataOffset += t.data.length;
    }

    // Reconstruct the font binary with the new cmap table
    const delta = totalCmapLen - cmapLength;
    const newFontSize = subsetBuffer.byteLength + delta + 1024; // Extra padding
    const newFont = new Uint8Array(newFontSize);
    const nfv = new DataView(newFont.buffer);

    // Copy everything up to the first table data
    const tableDirSize = 12 + 16 * numTables;
    newFont.set(new Uint8Array(subsetBuffer, 0, tableDirSize), 0);

    const tables: { tag: string, offset: number, length: number, dirOffset: number }[] = [];
    for (let i = 0; i < numTables; i++) {
        const p = 12 + i * 16;
        tables.push({
            tag: String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3)),
            offset: view.getUint32(p + 8, false),
            length: view.getUint32(p + 12, false),
            dirOffset: p
        });
    }
    tables.sort((a, b) => a.offset - b.offset);

    let writePtr = tableDirSize;
    let headOffset = 0;

    for (const t of tables) {
        let data: Uint8Array;
        let len = t.length;

        if (t.tag === 'cmap') {
            data = newCmap;
            len = totalCmapLen;
        } else {
            data = new Uint8Array(subsetBuffer, t.offset, t.length);
        }

        // Align to 4 bytes
        while (writePtr % 4 !== 0) writePtr++;

        newFont.set(data, writePtr);

        // Update Table Directory
        nfv.setUint32(t.dirOffset + 8, writePtr, false);
        nfv.setUint32(t.dirOffset + 12, len, false);

        // Calculate and set table checksum
        const checksum = calculateChecksum(newFont.subarray(writePtr, writePtr + len));
        nfv.setUint32(t.dirOffset + 4, checksum, false);

        if (t.tag === 'head') headOffset = writePtr;
        writePtr += len;
    }

    // Update 'head' table checksumAdjustment
    if (headOffset) {
        nfv.setUint32(headOffset + 8, 0, false);
        const fullChecksum = calculateChecksum(newFont.subarray(0, writePtr));
        const adjustment = (0xB1B0AFBA - fullChecksum) >>> 0;
        nfv.setUint32(headOffset + 8, adjustment, false);
    }

    return newFont.slice(0, writePtr).buffer;
}

export async function subsetFont(
    fontPath: string,
    text: string
): Promise<{ buffer: Buffer, mimeType: string, ivsRecordsCount: number }> {
    const fontBuffer = await fs.readFile(fontPath);
    const arrayBuffer = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
    const font = opentype.parse(arrayBuffer);

    let ivsMap: IVSMap | null = null;
    try {
        ivsMap = parseCmapFormat14(arrayBuffer, font);
    } catch (e) { }

    const glyphs: opentype.Glyph[] = [];
    const addedGlyphs = new Map<opentype.Glyph, number>();
    const unicodeMap: { code: number, gid: number }[] = [];
    const ivsRecords: { vs: number, code: number, gid: number }[] = [];

    const addGlyphToSubset = (g: opentype.Glyph): number => {
        if (!addedGlyphs.has(g)) {
            const id = glyphs.length;
            glyphs.push(g);
            addedGlyphs.set(g, id);
            return id;
        }
        return addedGlyphs.get(g)!;
    };

    addGlyphToSubset(font.glyphs.get(0)); // .notdef

    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i]!;
        const code = char.codePointAt(0)!;

        let vsCode = 0;
        if (i + 1 < chars.length) {
            const nextCode = chars[i + 1]!.codePointAt(0)!;
            if (isVariationSelector(nextCode)) {
                vsCode = nextCode;
                i++;
            }
        }

        const vsSubMap = vsCode && ivsMap ? ivsMap[vsCode] : undefined;
        if (vsSubMap && vsSubMap[code] !== undefined) {
            const originalGid = vsSubMap[code]!;
            const variantGlyph = font.glyphs.get(originalGid);
            if (variantGlyph) {
                // Clone without unicode assignment (UVS variant)
                const g = new opentype.Glyph({
                    name: variantGlyph.name || `u${code.toString(16)}_v${vsCode.toString(16)}`,
                    advanceWidth: variantGlyph.advanceWidth,
                    path: variantGlyph.path
                });
                const subsetGid = addGlyphToSubset(g);
                ivsRecords.push({ vs: vsCode, code, gid: subsetGid });
            }
        }

        const baseGlyph = font.charToGlyph(char);
        const subsetGid = addGlyphToSubset(baseGlyph);
        if (baseGlyph.unicode !== undefined) {
            unicodeMap.push({ code: baseGlyph.unicode, gid: subsetGid });
        }
    }

    const subset = new opentype.Font({
        familyName: 'SubsetFont',
        styleName: 'Regular',
        unitsPerEm: font.unitsPerEm,
        ascender: font.ascender,
        descender: font.descender,
        glyphs: glyphs
    });

    const subsetBuffer = subset.toArrayBuffer();

    // Inject custom cmap tables (Format 12 and 14)
    const finalBuffer = injectNativeCmap(subsetBuffer, unicodeMap, ivsRecords);
    const woff2Buffer = await wawoff2.compress(new Uint8Array(finalBuffer));

    return {
        buffer: Buffer.from(woff2Buffer),
        mimeType: 'font/woff2',
        ivsRecordsCount: ivsRecords.length
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
