
import { Database } from "bun:sqlite";
import opentype from 'opentype.js';
import fs from 'fs-extra';
import path from 'path';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'site', 'data');
await fs.ensureDir(DATA_DIR);

const DB_PATH = path.join(DATA_DIR, 'fonts.db');
// Delete existing to rebuild fresh or use WAL mode? 
// For a build script, rebuilding might be safer/cleaner to avoid stale data, 
// but incremental is better. Let's do Insert OR IGNORE/REPLACE.

console.log(`Using database: ${DB_PATH}`);
const db = new Database(DB_PATH);

// Initialize Tables
db.run(`
    CREATE TABLE IF NOT EXISTS fonts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        family_name TEXT,
        num_glyphs INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

db.run(`
    CREATE TABLE IF NOT EXISTS glyphs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        font_id INTEGER NOT NULL,
        glyph_index INTEGER NOT NULL,
        unicode INTEGER,        -- Primary Unicode Codepoint
        unicode_hex TEXT,       -- U+XXXX format
        name TEXT,              -- Glyph Name (e.g. gjh12345 or uni1234)
        advance_width INTEGER,
        FOREIGN KEY (font_id) REFERENCES fonts(id) ON DELETE CASCADE,
        UNIQUE(font_id, glyph_index)
    );
`);

// Optimize performance
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");

const insertFontStmt = db.prepare(`
    INSERT INTO fonts (filename, family_name, num_glyphs, updated_at) 
    VALUES ($filename, $family_name, $num_glyphs, CURRENT_TIMESTAMP)
    ON CONFLICT(filename) DO UPDATE SET 
        num_glyphs=excluded.num_glyphs, 
        updated_at=CURRENT_TIMESTAMP
    RETURNING id;
`);

const insertGlyphStmt = db.prepare(`
    INSERT INTO glyphs (font_id, glyph_index, unicode, unicode_hex, name, advance_width)
    VALUES ($font_id, $glyph_index, $unicode, $unicode_hex, $name, $advance_width)
    ON CONFLICT(font_id, glyph_index) DO UPDATE SET
        unicode=excluded.unicode,
        unicode_hex=excluded.unicode_hex,
        name=excluded.name,
        advance_width=excluded.advance_width;
`);

const deleteGlyphsStmt = db.prepare(`DELETE FROM glyphs WHERE font_id = $font_id;`);


async function processFont(filePath: string) {
    const filename = path.basename(filePath);
    console.log(`Processing ${filename}...`);

    const buffer = await fs.readFile(filePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    let font: opentype.Font;
    try {
        font = opentype.parse(arrayBuffer);
    } catch (e) {
        console.error(`Failed to parse ${filename}:`, e);
        return;
    }

    const familyName = font.names.fontFamily?.en || font.names.fontFamily?.ja || 'Unknown';
    const numGlyphs = font.glyphs.length;

    // Insert/Update Font
    const fontRow = insertFontStmt.get({
        $filename: filename,
        $family_name: familyName,
        $num_glyphs: numGlyphs
    }) as { id: number };

    const fontId = fontRow.id;

    // Begin Transaction for Glyphs
    const transaction = db.transaction(() => {
        // Clear old glyphs to ensure exact match with current file (simple approach)
        deleteGlyphsStmt.run({ $font_id: fontId });

        for (let i = 0; i < numGlyphs; i++) {
            const glyph = font.glyphs.get(i);
            const unicode = glyph.unicode;
            const unicodeHeader = unicode ? `U+${unicode.toString(16).toUpperCase().padStart(4, '0')}` : null;

            insertGlyphStmt.run({
                $font_id: fontId,
                $glyph_index: i,
                $unicode: unicode || null,
                $unicode_hex: unicodeHeader,
                $name: glyph.name || null,
                $advance_width: glyph.advanceWidth
            } as any);
        }
    });

    transaction();
    console.log(`  Saved ${numGlyphs} glyphs to DB.`);
}

async function main() {
    const fontDir = path.resolve(process.cwd(), 'site', 'fonts');
    if (!await fs.pathExists(fontDir)) {
        console.error("Fonts directory not found.");
        return;
    }

    const files = await fs.readdir(fontDir);
    for (const file of files) {
        if (file.match(/\.(ttf|otf|woff2?)$/i)) {
            await processFont(path.join(fontDir, file));
        }
    }

    // Export JSON for Frontend Search
    console.log("Exporting search index...");
    const query = db.query(`
        SELECT 
    g.name, 
    g.unicode_hex, 
    g.glyph_index, 
    g.advance_width,
    f.filename as font_filename,
    f.family_name as font_family
FROM glyphs g
JOIN fonts f ON g.font_id = f.id
WHERE g.name IS NOT NULL OR g.unicode_hex IS NOT NULL
            `);
    const allGlyphs = query.all();
    const distDir = path.resolve(process.cwd(), 'dist');
    await fs.ensureDir(distDir);
    await fs.writeJson(path.join(distDir, 'glyph-index.json'), allGlyphs);
    console.log(`Exported ${allGlyphs.length} glyphs to dist/glyph-index.json`);
}

main();
