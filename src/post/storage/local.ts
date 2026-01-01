import * as path from "node:path";
import * as fs from "fs/promises";
import type { IPostalStorage } from "./types.js";
import type { PostalEnvelope, PostalRule } from "../types.js";

/**
 * Local FileSystem Implementation of IPostalStorage.
 * Saves envelopes as JSON files in a local directory structure.
 * 
 * Structure:
 * ./shared/data/post/
 *   ├── inbox/
 *   │   └── <doc_id>.json
 *   ├── sent/
 *   └── rules.json
 */
export class LocalFileStorage implements IPostalStorage {
    private baseDir: string;

    constructor(baseDir: string = "./shared/data/post") {
        this.baseDir = path.resolve(process.cwd(), baseDir);
    }

    private async ensureDir(dir: string) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (e) {
            // ignore exists error
        }
    }

    async saveEnvelope(folder: string, envelope: PostalEnvelope): Promise<void> {
        const dir = path.join(this.baseDir, folder);
        await this.ensureDir(dir);

        const filename = `${envelope.id}.json`;
        const filePath = path.join(dir, filename);

        await fs.writeFile(filePath, JSON.stringify(envelope, null, 2), "utf-8");
        console.log(`[LocalStorage] Saved envelope ${envelope.id} to ${folder}`);
    }

    async getEnvelopes(folder: string, limit: number = 20, offset: number = 0): Promise<PostalEnvelope[]> {
        const dir = path.join(this.baseDir, folder);
        await this.ensureDir(dir);

        const files = await fs.readdir(dir);
        const jsonFiles = files.filter(f => f.endsWith(".json"));

        // Simple file based pagination is slow, but fine for local prototype
        const targetFiles = jsonFiles.slice(offset, offset + limit);

        const envelopes: PostalEnvelope[] = [];
        for (const file of targetFiles) {
            try {
                const content = await fs.readFile(path.join(dir, file), "utf-8");
                envelopes.push(JSON.parse(content));
            } catch (e) {
                console.warn(`Failed to read envelope ${file}`, e);
            }
        }
        return envelopes;
    }

    async getRules(did: string): Promise<PostalRule[]> {
        // Mock Rules for Local Prototype
        // In real app, load from `rules.json` or similar
        return [];
    }
}
