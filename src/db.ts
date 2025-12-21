
import { Database } from "bun:sqlite";
import path from 'path';
import fs from 'fs-extra';

// Access the separate mjdb.sqlite3
const MJDB_PATH = path.resolve(process.cwd(), 'site/data/mjdb.sqlite3');
const FONTS_DB_PATH = path.resolve(process.cwd(), 'site/data/fonts.db');

let mjDb: Database | null = null;
let fontsDb: Database | null = null;

function getMjDb() {
    if (!mjDb) {
        if (fs.existsSync(MJDB_PATH)) {
            console.log(`Loading MJ Database: ${MJDB_PATH}`);
            mjDb = new Database(MJDB_PATH, { readonly: true });
        } else {
            console.warn("MJ Database not found. MJ lookup will fail.");
        }
    }
    return mjDb;
}

function getFontsDb() {
    if (!fontsDb) {
        if (fs.existsSync(FONTS_DB_PATH)) {
            fontsDb = new Database(FONTS_DB_PATH, { readonly: true });
        }
    }
    return fontsDb;
}

/**
 * Looks up an MJ Code in the mjdb.sqlite3 and returns the resolved Unicode String (including IVS).
 */
export function resolveMjCode(mjCode: string): string | null {
    const db = getMjDb();
    if (!db) return null;

    try {
        const query = db.prepare(`
            SELECT d.mjivs, d.ucs_implemented, d.unicode, p.pup_code 
            FROM dictionary d
            LEFT JOIN mj_pup p ON d.mj_code = p.mj_code
            WHERE d.mj_code = ?
        `);
        const result = query.get(mjCode) as { mjivs: string, ucs_implemented: string, unicode: string, pup_code: string } | null;

        if (!result) return null;

        // Priority 1: MJIVS (Specific Glyph Variant)
        if (result.mjivs) {
            return convertHexSequenceToChar(result.mjivs);
        }

        // Priority 2: PUP (Private Use Area - for characters without standard code points)
        if (result.pup_code) {
            return convertHexSequenceToChar(result.pup_code);
        }

        // Priority 3: UCS Implemented
        if (result.ucs_implemented) {
            return convertHexSequenceToChar(result.ucs_implemented);
        }

        // Priority 3: Unicode (e.g. 20BB7)
        if (result.unicode) {
            return convertHexSequenceToChar(result.unicode);
        }

        return null;
    } catch (e) {
        console.error(`MJ Lookup Error for ${mjCode}:`, e);
        return null;
    }
}

function convertHexSequenceToChar(hexSeq: string): string {
    const parts = hexSeq.split(/[_ ]/);
    let result = "";

    for (const part of parts) {
        const cleanHex = part.replace(/^U\+/, '');
        if (!cleanHex) continue;
        const codePoint = parseInt(cleanHex, 16);
        if (!isNaN(codePoint)) {
            result += String.fromCodePoint(codePoint);
        }
    }
    return result;
}


export interface GlyphLocation {
    filename: string;
    glyph_index: number;
    name: string;
}

export function findGlyphInDb(identifier: string): GlyphLocation | null {
    const database = getFontsDb();
    if (!database) return null;

    // Prefer exact match on name
    const query = database.query(`
        SELECT f.filename, g.glyph_index, g.name 
        FROM glyphs g 
        JOIN fonts f ON g.font_id = f.id 
        WHERE g.name = $identifier
        ORDER BY f.filename DESC
        LIMIT 1
    `);

    const result = query.get({ $identifier: identifier }) as any;

    if (result) {
        return {
            filename: result.filename,
            glyph_index: result.glyph_index,
            name: result.name
        };
    }

    return null;
}
