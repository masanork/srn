/**
 * Local Government Code Lookup Engine
 *
 * 自治体コードデータを展開し、高速な検索インターフェースを提供
 */

export interface LgRecord {
    code: string;
    pref: string;
    city: string;
}

interface LgData {
    [code: string]: {
        pref: string;
        city: string;
    };
}

export class LgLookup {
    private data: LgData = {};
    private initialized = false;
    private instanceId = Math.random().toString(36).substring(7);
    private _activeDigest?: string;

    constructor() {
        console.log('[LgLookup] New instance created:', this.instanceId);
    }

    /**
     * Load from embedded Base64 data
     */
    async loadFromBase64(base64Data: string): Promise<void> {
        try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            let jsonString: string;
            if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
                // Gzip decompression
                if (typeof DecompressionStream !== 'undefined') {
                    const ds = new DecompressionStream('gzip');
                    const stream = new Blob([bytes]).stream().pipeThrough(ds);
                    jsonString = await new Response(stream).text();
                } else {
                    throw new Error('DecompressionStream not supported');
                }
            } else {
                // Plain JSON
                jsonString = new TextDecoder().decode(bytes);
            }

            this.data = JSON.parse(jsonString);
            this.initialized = true;
            console.log('🏛️ LG lookup initialized:', Object.keys(this.data).length, 'codes', '[Instance:', this.instanceId + ']');
        } catch (error) {
            console.error('Failed to load LG data:', error);
        }
    }

    /**
     * Load from manifest (L1)
     * Try: DOM embedded (Pack) -> External fetch (Prune)
     */
    async loadFromManifest(): Promise<boolean> {
        const manifest = (window as any).__WEBA_MANIFEST;
        if (!manifest || !manifest.blobs) return false;

        const lgEntry = manifest.blobs.find((b: any) => b.id === 'jp-lg');
        if (!lgEntry || !lgEntry.urls || lgEntry.urls.length === 0) return false;

        for (const url of lgEntry.urls) {
            try {
                if (url.startsWith('#')) {
                    // Embedded Data (DOM ID)
                    const el = document.querySelector(url);
                    if (el && el.textContent) {
                        console.log('🏛️ Loading LG data from embedded source:', url);
                        await this.loadFromBase64(el.textContent.trim());
                        if (this.initialized) {
                            this._activeDigest = lgEntry.digest;
                            return true;
                        }
                    }
                } else {
                    // External fetch
                    console.log('🏛️ Loading LG data from network:', url);
                    const response = await fetch(url);
                    if (!response.ok) continue;

                    const blob = await response.blob();
                    let jsonString: string;

                    // Check if gzipped
                    const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
                    if (header[0] === 0x1f && header[1] === 0x8b) {
                        if (typeof DecompressionStream !== 'undefined') {
                            const ds = new DecompressionStream('gzip');
                            const stream = blob.stream().pipeThrough(ds);
                            jsonString = await new Response(stream).text();
                        } else {
                            throw new Error('DecompressionStream not supported');
                        }
                    } else {
                        jsonString = await blob.text();
                    }

                    this.data = JSON.parse(jsonString);
                    this.initialized = true;
                    this._activeDigest = lgEntry.digest;
                    console.log('🏛️ LG lookup initialized via Network:', Object.keys(this.data).length, 'codes');
                    return true;
                }
            } catch (error) {
                console.warn(`Failed to load LG from ${url}:`, error);
            }
        }

        return false;
    }

    /**
     * Auto-initialize from manifest or fallback element
     */
    async autoInit(): Promise<void> {
        if (this.initialized) {
            console.log('🏛️ LG lookup already initialized, skipping');
            return;
        }

        // Try manifest first
        if (await this.loadFromManifest()) return;

        // Fallback to direct element
        const lgScript = document.getElementById('weba-lg-data');
        if (lgScript && lgScript.textContent) {
            await this.loadFromBase64(lgScript.textContent.trim());
        } else {
            console.warn('No LG data found in document');
        }
    }

    getActiveDigest(): string | null {
        return this._activeDigest || null;
    }

    /**
     * Lookup by code (exact match)
     */
    lookup(code: string): LgRecord | null {
        if (!this.initialized) return null;

        const cleanCode = code.replace(/[^0-9]/g, '');
        if (cleanCode.length !== 6) return null;

        const entry = this.data[cleanCode];
        if (!entry) return null;

        return {
            code: cleanCode,
            pref: entry.pref,
            city: entry.city
        };
    }

    /**
     * Suggest by code prefix
     */
    suggest(query: string, limit: number = 50): LgRecord[] {
        if (!this.initialized) return [];

        const cleanQuery = query.replace(/[^0-9]/g, '');
        if (cleanQuery.length < 2) return [];

        const results: LgRecord[] = [];

        for (const [code, entry] of Object.entries(this.data)) {
            if (code.startsWith(cleanQuery)) {
                results.push({
                    code,
                    pref: entry.pref,
                    city: entry.city
                });

                if (results.length >= limit) break;
            }
        }

        return results;
    }

    /**
     * Suggest by name (prefecture or city)
     */
    suggestByName(query: string, limit: number = 30): LgRecord[] {
        if (!this.initialized || query.length < 1) return [];

        const results: LgRecord[] = [];

        for (const [code, entry] of Object.entries(this.data)) {
            const match =
                entry.pref.includes(query) ||
                entry.city.includes(query);

            if (match) {
                results.push({
                    code,
                    pref: entry.pref,
                    city: entry.city
                });

                if (results.length >= limit) break;
            }
        }

        return results;
    }

    /**
     * Get unique prefectures
     */
    getUniquePrefectures(): string[] {
        if (!this.initialized) return [];

        const prefs = new Set<string>();
        for (const entry of Object.values(this.data)) {
            prefs.add(entry.pref);
        }

        return Array.from(prefs).sort();
    }

    /**
     * Suggest cities by prefecture filter
     */
    suggestCitiesByPref(pref: string, query: string = '', limit: number = 30): LgRecord[] {
        if (!this.initialized) return [];

        const results: LgRecord[] = [];

        for (const [code, entry] of Object.entries(this.data)) {
            if (entry.pref !== pref) continue;

            // If query is provided, filter by city name
            if (query && !entry.city.includes(query)) continue;

            results.push({
                code,
                pref: entry.pref,
                city: entry.city
            });

            if (results.length >= limit) break;
        }

        return results;
    }

    /**
     * Suggest by city name (returns with prefecture for disambiguation)
     */
    suggestByCity(query: string, prefFilter?: string, limit: number = 30): LgRecord[] {
        if (!this.initialized || query.length < 1) return [];

        const results: LgRecord[] = [];

        for (const [code, entry] of Object.entries(this.data)) {
            // Filter by prefecture if provided
            if (prefFilter && entry.pref !== prefFilter) continue;

            // Match by city name
            if (entry.city.includes(query)) {
                results.push({
                    code,
                    pref: entry.pref,
                    city: entry.city
                });

                if (results.length >= limit) break;
            }
        }

        return results;
    }

    isReady(): boolean {
        return this.initialized;
    }
}

// Global singleton instance
export const lgLookup = new LgLookup();

// Register to window if available
if (typeof window !== 'undefined') {
    if (!(window as any).lgLookup) {
        console.log('[LgLookup] Registering instance to window:', lgLookup.instanceId);
        (window as any).lgLookup = lgLookup;
    } else {
        console.log('[LgLookup] window.lgLookup already exists, skipping registration. Existing instance:', (window as any).lgLookup.instanceId, 'New instance:', lgLookup.instanceId);
    }
}
