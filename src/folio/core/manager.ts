
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

        // Scan target directories inside Folio
        const dirs = ['history', 'certificates', 'inbox', 'folio/history', 'folio/certificates'];
        let count = 0;

        for (const target of dirs) {
            const fullPath = path.join(this.folioDir, target);
            if (await fs.pathExists(fullPath)) {
                count += await this.ingestDir(fullPath);
            }
        }

        console.log(`Indexed ${count} items.`);
    }

    /**
     * Ingest all files from a directory
     */
    public async ingestDir(dirPath: string): Promise<number> {
        let count = 0;
        if (await fs.pathExists(dirPath)) {
            const files = await glob('**/*.{html,json,md}', { cwd: dirPath });
            for (const file of files) {
                await this.indexFile(path.join(dirPath, file));
                count++;
            }
        }
        return count;
    }

    /**
     * Index a single file into the KVS
     */
    public async indexFile(fullPath: string) {
        if (!await fs.pathExists(fullPath)) return;
        
        const content = await fs.readFile(fullPath, 'utf-8');
        const ext = path.extname(fullPath).toLowerCase();
        const relPath = path.relative(this.folioDir, fullPath);

        let extracted: any = null;
        let docType = 'Unknown';
        let metadata: any = {};

        // --- Extraction Strategy ---
        if (ext === '.json') {
            try {
                extracted = JSON.parse(content);
            } catch (e) {
                console.warn(`Failed to parse JSON: ${fullPath}`);
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
        // Scheme: {folder}:{hash_or_filename}
        const safeName = path.basename(fullPath).replace(/\.[^.]+$/, '');
        const folder = path.dirname(relPath).startsWith('..') ? 'external' : (path.dirname(relPath) === '.' ? 'root' : path.dirname(relPath));
        const key = `${folder}:${safeName}`;

        // Create Text Summary for FTS
        const textSummary = this.createTextSummary(extracted);

        const record: FolioRecord = {
            key: key,
            file_path: fullPath, // Store absolute path for easy retrieval
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

    /**
     * Scan all documents and aggregate field values for profile generation
     */
    public async aggregateFields(): Promise<Record<string, any>> {
        const records = this.storage.getAll();
        const fieldMap: Record<string, Map<string, number>> = {};

        // Exclude internal metadata from templates
        const excludedFields = new Set(['title', 'form', 'version', 'id', 'type', 'label', 'placeholder', 'options', 'required', 'pattern']);

        for (const record of records) {
            // Prioritize filled data
            if (record.doc_type === 'WebAForm') continue; 

            const data = record.raw_content;
            
            // Look for fields in credentialSubject or weba-state data
            const subject = data.credentialSubject || data.data || data;
            
            const walk = (obj: any) => {
                if (typeof obj !== 'object' || obj === null) return;
                
                for (const [key, value] of Object.entries(obj)) {
                    if (key.startsWith('@')) continue; 
                    if (excludedFields.has(key)) continue;
                    
                    if (typeof value === 'string' || typeof value === 'number') {
                        if (!fieldMap[key]) fieldMap[key] = new Map();
                        const valStr = String(value);
                        fieldMap[key].set(valStr, (fieldMap[key].get(valStr) || 0) + 1);
                    } else if (typeof value === 'object') {
                        walk(value);
                    }
                }
            };
            walk(subject);
        }

        // Pick the most frequent value for each field
        const profile: Record<string, any> = {};
        for (const [key, values] of Object.entries(fieldMap)) {
            let maxCount = 0;
            let bestValue = null;
            for (const [val, count] of values.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    bestValue = val;
                }
            }
            if (bestValue !== null) {
                profile[key] = bestValue;
            }
        }

        return profile;
    }
}
