
import * as path from "node:path";
import * as fs from "fs-extra";
import { glob } from "glob";
import { FolioStorage, type FolioRecord } from "./storage";
import { JSDOM } from "jsdom";
import { WebAParser } from "./parser";

/**
 * Core Folio Logic: Indexing and Maintenance
 */

export class FolioManager {
    private storage: FolioStorage;
    private folioDir: string;

    constructor(folioDir: string) {
        this.folioDir = path.resolve(folioDir);
        this.storage = new FolioStorage(this.folioDir);
    }

    public close() {
        this.storage.close();
    }

    /**
     * Rebuild the index by scanning all known directories
     */
    public async reindex() {
        console.log("Re-indexing Folio...");

        // Scan target directories
        const dirs = ['history', 'certificates', 'inbox', 'folio/history', 'folio/certificates', 'shared/forms'];
        let count = 0;

        for (const target of dirs) {
            const fullPath = path.join(this.folioDir, target);
            if (await fs.pathExists(fullPath)) {
                if ((await fs.stat(fullPath)).isDirectory()) {
                    // Directory scan
                    const files = await glob('**/*.{html,json,md}', { cwd: fullPath });
                    for (const file of files) {
                        await this.indexFile(path.join(target, file));
                        count++;
                    }
                } else {
                    // Single file (e.g. profile.html)
                    await this.indexFile(target);
                    count++;
                }
            }
        }

        console.log(`Indexed ${count} items.`);
    }

    /**
     * Index a single file into the KVS
     */
    public async indexFile(relPath: string) {
        const fullPath = path.join(this.folioDir, relPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const ext = path.extname(relPath).toLowerCase();

        let extracted: any = null;
        let docType = 'Unknown';
        let metadata: any = {};

        // --- Extraction Strategy ---
        if (ext === '.json') {
            try {
                extracted = JSON.parse(content);
            } catch (e) {
                console.warn(`Failed to parse JSON: ${relPath}`);
                return;
            }
        } else if (ext === '.html') {
            extracted = this.extractFromHtml(content);
        } else if (ext === '.md') {
            extracted = WebAParser.parse(content);
        }

        if (!extracted) return;

        // --- Metadata Normalization ---
        // Try to find JSON-LD @type
        if (extracted['@type']) {
            docType = Array.isArray(extracted['@type']) ? extracted['@type'][0] : extracted['@type'];
        }
        // Fallback for Web/A Form State
        else if (extracted.meta && extracted.data) {
            docType = 'WebAFormState';
        }
        // Automatic detection for Web/A Form (Markdown with fields)
        else if (extracted.fields && extracted.fields.length > 0) {
            docType = 'WebAForm';
        }

        // Generate a semantic KVS key
        // Scheme: {docType}:{timestamp}:{hash_or_filename}
        // Ideally we use a stable ID inside the doc, but filename is a good proxy for CLI
        const safeName = path.basename(relPath).replace(/\.[^.]+$/, '');
        const folder = path.dirname(relPath) === '.' ? 'root' : path.dirname(relPath);
        const key = `${folder}:${safeName}`;

        // Create Text Summary for FTS
        const textSummary = this.createTextSummary(extracted);

        const record: FolioRecord = {
            key: key,
            file_path: relPath,
            doc_type: docType,
            metadata: {
                created: extracted.created || extracted.date || new Date().toISOString(),
                title: extracted.title || safeName,
                form: extracted.form,
                version: extracted.version,
                credential_type: extracted.credential_type || extracted.type,
                // Add more extracted meta here (e.g. issuer)
            },
            raw_content: extracted,
        };

        this.storage.put(record, textSummary);
        console.log(`Indexed: ${key} (${docType})`);
    }

    private extractFromHtml(html: string): any {
        // 1. Try to find <script id="weba-state"> (Form State)
        // 2. Try to find <script type="application/ld+json"> (VC / Profile)
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const stateScript = doc.getElementById('weba-state');
        if (stateScript && stateScript.textContent) {
            try { return JSON.parse(stateScript.textContent); } catch { }
        }

        const ldJson = doc.querySelector('script[type="application/ld+json"]');
        if (ldJson && ldJson.textContent) {
            try { return JSON.parse(ldJson.textContent as string); } catch { }
        }

        return null;
    }

    private createTextSummary(data: any): string {
        // Simple recursive flattening of values for FTS
        const parts: string[] = [];
        const walk = (obj: any) => {
            if (typeof obj === 'string') parts.push(obj);
            else if (typeof obj === 'number') parts.push(String(obj));
            else if (Array.isArray(obj)) obj.forEach(walk);
            else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(walk);
            }
        };
        walk(data);
        return parts.join(' ').slice(0, 5000); // Limit summary size
    }
}
