
import { Database } from "bun:sqlite";
import * as fs from "fs-extra";
import * as path from "node:path";

export interface FolioRecord {
    key: string;
    file_path: string;
    doc_type: string;
    metadata: Record<string, any>;
    raw_content: Record<string, any>;
    updated_at?: string;
}

export class FolioStorage {
    private db: Database;
    private dbPath: string;

    constructor(folioDir: string) {
        const indexDir = path.join(folioDir, ".index");
        // Ensure directory exists - handled by caller usually but safe to have
        fs.ensureDirSync(indexDir);

        this.dbPath = path.join(indexDir, "folio.db");
        this.db = new Database(this.dbPath, { create: true });
        this.initSchema();
    }

    private initSchema() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS kv_index (
                key TEXT PRIMARY KEY,
                file_path TEXT,
                doc_type TEXT,
                metadata JSON,
                raw_content JSON,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // FTS5 Virtual Table for Full Text Search
        // We use 'content' for the raw text summary and 'key' as unindexed identifier
        this.db.run(`
            CREATE VIRTUAL TABLE IF NOT EXISTS fts_content USING fts5(
                key UNINDEXED, 
                content
            )
        `);
    }

    public put(record: FolioRecord, textSummary: string = "") {
        const stmt = this.db.prepare(`
            INSERT INTO kv_index (key, file_path, doc_type, metadata, raw_content, updated_at)
            VALUES ($key, $file_path, $doc_type, $metadata, $raw_content, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
                file_path=excluded.file_path,
                doc_type=excluded.doc_type,
                metadata=excluded.metadata,
                raw_content=excluded.raw_content,
                updated_at=CURRENT_TIMESTAMP
        `);

        const ftsDel = this.db.prepare(`DELETE FROM fts_content WHERE key = $key`);
        const ftsIns = this.db.prepare(`INSERT INTO fts_content (key, content) VALUES ($key, $content)`);

        this.db.transaction(() => {
            stmt.run({
                $key: record.key,
                $file_path: record.file_path,
                $doc_type: record.doc_type,
                $metadata: JSON.stringify(record.metadata),
                $raw_content: JSON.stringify(record.raw_content)
            });

            // Update FTS Index
            if (textSummary) {
                ftsDel.run({ $key: record.key });
                ftsIns.run({ $key: record.key, $content: textSummary });
            }
        })();
    }

    public get(key: string): FolioRecord | null {
        const stmt = this.db.prepare(`SELECT * FROM kv_index WHERE key = ?`);
        const res = stmt.get(key) as any;
        if (!res) return null;

        return {
            key: res.key,
            file_path: res.file_path,
            doc_type: res.doc_type,
            metadata: JSON.parse(res.metadata),
            raw_content: JSON.parse(res.raw_content),
            updated_at: res.updated_at
        };
    }

    public findByType(docType: string): FolioRecord[] {
        const stmt = this.db.prepare(`SELECT * FROM kv_index WHERE doc_type = ? ORDER BY updated_at DESC`);
        const results = stmt.all(docType) as any[];
        return results.map(res => ({
            key: res.key,
            file_path: res.file_path,
            doc_type: res.doc_type,
            metadata: JSON.parse(res.metadata),
            raw_content: JSON.parse(res.raw_content),
            updated_at: res.updated_at
        }));
    }

    public search(query: string): FolioRecord[] {
        // FTS search returning keys, then join with KV
        // Note: Simple implementation. Ideally use JOIN if FTS table design allows easy join
        // But FTS5 tables are virtual.
        const ftsStmt = this.db.prepare(`SELECT key FROM fts_content WHERE fts_content MATCH ? ORDER BY rank`);
        const keys = ftsStmt.all(query) as { key: string }[];

        if (keys.length === 0) return [];

        // Fetch details (N+1 query is fine for SQLite local)
        // Or specific WHERE IN query
        const placeholders = keys.map(() => '?').join(',');
        const stmt = this.db.prepare(`SELECT * FROM kv_index WHERE key IN (${placeholders})`);
        const results = stmt.all(...keys.map(k => k.key)) as any[];

        return results.map(res => ({
            key: res.key,
            file_path: res.file_path,
            doc_type: res.doc_type,
            metadata: JSON.parse(res.metadata),
            raw_content: JSON.parse(res.raw_content),
            updated_at: res.updated_at
        }));
    }

    public listKeys(prefix: string = ""): string[] {
        let stmt;
        if (prefix) {
            stmt = this.db.prepare(`SELECT key FROM kv_index WHERE key LIKE ? ORDER BY key`);
            return (stmt.all(`${prefix}%`) as { key: string }[]).map(r => r.key);
        } else {
            stmt = this.db.prepare(`SELECT key FROM kv_index ORDER BY key`);
            return (stmt.all() as { key: string }[]).map(r => r.key);
        }
    }

    public getAll(): FolioRecord[] {
        const stmt = this.db.prepare(`SELECT * FROM kv_index ORDER BY updated_at DESC`);
        const results = stmt.all() as any[];
        return results.map(res => ({
            key: res.key,
            file_path: res.file_path,
            doc_type: res.doc_type,
            metadata: JSON.parse(res.metadata),
            raw_content: JSON.parse(res.raw_content),
            updated_at: res.updated_at
        }));
    }

    public close() {
        this.db.close();
    }
}
