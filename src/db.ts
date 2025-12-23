import { Database } from "bun:sqlite";
import path from 'path';
import fs from 'fs-extra';
import { loadConfig, getAbsolutePaths } from './config.ts';

const config = await loadConfig();
const { DATA_DIR } = getAbsolutePaths(config);
const FONTS_DB_PATH = path.join(DATA_DIR, 'fonts.db');

let fontsDb: Database | null = null;

function getFontsDb() {
    if (!fontsDb) {
        if (fs.existsSync(FONTS_DB_PATH)) {
            fontsDb = new Database(FONTS_DB_PATH, { readonly: true });
        }
    }
    return fontsDb;
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
