
import { Database } from "bun:sqlite";
import path from 'path';
import fs from 'fs-extra';

const DB_PATH = path.resolve(process.cwd(), 'site', 'data', 'fonts.db');

let db: Database | null = null;

function getDb() {
    if (!db) {
        if (fs.existsSync(DB_PATH)) {
            db = new Database(DB_PATH, { readonly: true });
        }
    }
    return db;
}

export interface GlyphLocation {
    filename: string;
    glyph_index: number;
    name: string;
}

export function findGlyphInDb(identifier: string): GlyphLocation | null {
    const database = getDb();
    if (!database) return null;

    // Prefer exact match on name
    const query = database.query(`
        SELECT f.filename, g.glyph_index, g.name 
        FROM glyphs g 
        JOIN fonts f ON g.font_id = f.id 
        WHERE g.name = $identifier
        ORDER BY f.filename DESC -- Simple priority for now, maybe prefer ipamjm?
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
