
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import canonicalize from 'canonicalize';
import { createHybridVC, generateHybridKeys, createStatusListVC } from '../core/vc.ts';
import type { HybridKeys } from '../core/vc.ts';
import { encodeDidKey, encodePqcPublicKeyJwk } from '../core/did.ts';
import { hexToBytes } from '../core/encoding.ts';
import { PrunableHashChain } from '../core/phc.js';
import type { PHCEventType } from '../core/phc.js';
import { getTimestamp } from '../tools/tsa_client.ts';

export class IdentityManager {
    public currentKeys!: HybridKeys;
    public rootKeys!: HybridKeys;
    public buildId: string;
    public siteDid: string;
    private dataDir: string;
    private distDir: string;
    private signatureStore: Record<string, any> = {};
    private contextStore: Record<string, any[]> = {};
    private timestampStore: Record<string, string> = {}; // sigValue -> Base64 Token
    private tsaUrl?: string;

    constructor(siteDomain: string, sitePath: string, dataDir: string, distDir: string, tsaUrl?: string) {
        const normalizedPath = sitePath.replace(/^\//, '').replace(/\/$/, '');
        const didSubPath = normalizedPath ? ':' + normalizedPath.replace(/\//g, ':') : '';
        this.siteDid = `did:web:${siteDomain}${didSubPath}`;
        this.dataDir = dataDir;
        this.distDir = distDir;
        this.buildId = `build-${Date.now()}`;
        this.tsaUrl = tsaUrl;
    }

    async init() {
        const rootKeyPath = path.join(this.dataDir, 'root-key.json');

        if (await fs.pathExists(rootKeyPath)) {
            this.rootKeys = await fs.readJson(rootKeyPath);
        } else {
            this.rootKeys = await generateHybridKeys();
            await fs.writeJson(rootKeyPath, this.rootKeys, { spaces: 2 });
        }

        const buildKeyPath = path.join(this.dataDir, 'build-key.json');
        if (await fs.pathExists(buildKeyPath)) {
            this.currentKeys = await fs.readJson(buildKeyPath);
        } else {
            this.currentKeys = await generateHybridKeys();
            await fs.writeJson(buildKeyPath, this.currentKeys, { spaces: 2 });
        }

        const storePath = path.join(this.dataDir, 'signature-store.json');
        if (await fs.pathExists(storePath)) {
            try { this.signatureStore = await fs.readJson(storePath); } catch (e) { console.warn("Failed to load signature store", e); }
        }

        const contextStorePath = path.join(this.dataDir, 'context-store.json');
        if (await fs.pathExists(contextStorePath)) {
            try { this.contextStore = await fs.readJson(contextStorePath); } catch (e) { console.warn("Failed to load context store", e); }
        }

        const timestampStorePath = path.join(this.dataDir, 'timestamp-store.json');
        if (await fs.pathExists(timestampStorePath)) {
            try { this.timestampStore = await fs.readJson(timestampStorePath); } catch (e) { console.warn("Failed to load timestamp store", e); }
        }

        await this.updateKeyHistory();
        await this.generateDidDoc();
    }

    private async saveStore() {
        const storePath = path.join(this.dataDir, 'signature-store.json');
        await fs.writeJson(storePath, this.signatureStore, { spaces: 2 });

        const contextStorePath = path.join(this.dataDir, 'context-store.json');
        await fs.writeJson(contextStorePath, this.contextStore, { spaces: 2 });

        const timestampStorePath = path.join(this.dataDir, 'timestamp-store.json');
        await fs.writeJson(timestampStorePath, this.timestampStore, { spaces: 2 });
    }

    private async updateKeyHistory() {
        const historyPath = path.join(this.dataDir, 'key-history.json');
        let history: any[] = [];
        if (await fs.pathExists(historyPath)) {
            try { history = await fs.readJson(historyPath); } catch (e) { }
        }

        history.push({
            timestamp: new Date().toISOString(),
            buildId: this.buildId,
            revoked: false,
            ed25519Params: encodeDidKey(hexToBytes(this.currentKeys.ed25519.publicKey), 'ed25519'),
            pqcParams: encodePqcPublicKeyJwk(hexToBytes(this.currentKeys.pqc.publicKey))
        });

        await fs.writeJson(historyPath, history, { spaces: 2 });
        await fs.writeJson(path.join(this.distDir, 'key-history.json'), history, { spaces: 2 });

        // Generate Status List
        const revoked = history.filter(k => k.revoked).map(k => k.buildId);
        const statusListVc = await createStatusListVC(revoked, this.rootKeys, `${this.siteDid}/status-list.json`, this.siteDid);
        await fs.writeJson(path.join(this.distDir, 'status-list.json'), statusListVc, { spaces: 2 });
    }

    private lastGeneratedDidDoc: any;

    private async generateDidDoc() {
        const didDoc = {
            "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
            "id": this.siteDid,
            "verificationMethod": [
                { id: `${this.siteDid}#root-ed25519`, type: "Ed25519VerificationKey2020", controller: this.siteDid, publicKeyHex: this.rootKeys.ed25519.publicKey },
                { id: `${this.siteDid}#${this.buildId}-ed25519`, type: "Ed25519VerificationKey2020", controller: this.siteDid, publicKeyHex: this.currentKeys.ed25519.publicKey },
                {
                    id: `${this.siteDid}#${this.buildId}-pqc`,
                    type: "JsonWebKey2020",
                    controller: this.siteDid,
                    publicKeyJwk: encodePqcPublicKeyJwk(hexToBytes(this.currentKeys.pqc.publicKey))
                }
            ],
            "assertionMethod": [`${this.siteDid}#root-ed25519`, `${this.siteDid}#${this.buildId}-ed25519`, `${this.siteDid}#${this.buildId}-pqc`]
        };
        this.lastGeneratedDidDoc = didDoc;
        await fs.ensureDir(path.join(this.distDir, '.well-known'));
        await fs.writeJson(path.join(this.distDir, '.well-known', 'did.json'), didDoc, { spaces: 2 });
        await fs.writeJson(path.join(this.distDir, 'did.json'), didDoc, { spaces: 2 });
    }

    public getContextChain(vc: any): any[] | null {
        // Reverse lookup: Find chain by matching VC signature with stored VCs.
        if (!vc || !vc.proof || !vc.proof[0]) return null;
        const targetSig = vc.proof[0].proofValue;

        for (const hash in this.signatureStore) {
            const storedVc = this.signatureStore[hash];
            if (storedVc && storedVc.proof && storedVc.proof[0] && storedVc.proof[0].proofValue === targetSig) {
                return this.contextStore[hash] || null;
            }
        }
        return null;
    }

    public getDidDocument() {
        return this.lastGeneratedDidDoc;
    }

    public getPayloadHash(payload: any): string {
        const canon = canonicalize(payload);
        return crypto.createHash('sha256').update(canon || '').digest('hex');
    }

    public getTrustedTimestamps(vc?: any): string[] {
        if (!vc || !vc.proof || !vc.proof[0]) return [];
        const sigValue = vc.proof[0].proofValue;
        const token = this.timestampStore[sigValue];
        return token ? [token] : [];
    }

    async signDocument(payload: any, metadata?: any): Promise<any> {
        // LTV Phase 2: Stable Signatures
        const canon = canonicalize(payload);
        const hash = crypto.createHash('sha256').update(canon || '').digest('hex');
        let vc: any;

        if (this.signatureStore[hash]) {
            vc = this.signatureStore[hash];
            const phc = PrunableHashChain.fromJSON(this.contextStore[hash]);
            const links = phc.getLinks();

            // Check if metadata changed (compare with last known metadata in chain)
            // We look for the most recent MetadataUpdate or Genesis
            let lastMeta = null;
            for (let i = links.length - 1; i >= 0; i--) {
                const l = links[i];
                if (!l || !l.event) continue;
                const e = l.event;
                if ((e.type === 'MetadataUpdate' || e.type === 'Genesis') && e.payload) {
                    lastMeta = e.payload.metadata;
                    break;
                }
            }

            const metaChanged = metadata && JSON.stringify(lastMeta) !== JSON.stringify(metadata);

            if (metaChanged) {
                await phc.append('MetadataUpdate', {
                    metadata,
                    buildId: this.buildId,
                    reason: "Frontmatter updated in SSG"
                });
            } else {
                // Just a rebuild with same metadata
                await phc.append('L4Rebuild', { buildId: this.buildId });
            }

            // --- LTV: Pruning Strategy ---
            const MAX_CHAIN_LENGTH = 10;
            const KEEP_LATEST = 5;
            const currentLinks = phc.getLinks();

            if (currentLinks.length > MAX_CHAIN_LENGTH) {
                const keepIndices = [0]; // Always keep Genesis
                const total = currentLinks.length;
                // Keep Latest N
                for (let i = total - KEEP_LATEST; i < total; i++) {
                    if (i > 0) keepIndices.push(i);
                }
                phc.prune(keepIndices);
            }
            // -----------------------------

            this.contextStore[hash] = phc.toJSON();
        } else {
            vc = await createHybridVC(payload, this.currentKeys, this.siteDid, this.buildId);

            // PHC Initialization (Genesis)
            const phc = new PrunableHashChain();
            await phc.append('Genesis', {
                issuer: this.siteDid,
                payloadHash: hash,
                metadata: metadata || {}
            });

            // Save to store
            this.signatureStore[hash] = vc;
            this.contextStore[hash] = phc.toJSON();
        }

        // --- LTV Phase 3: Trusted Timestamping ---
        if (this.tsaUrl && vc.proof && vc.proof[0]) {
            const sigValue = vc.proof[0].proofValue;
            if (!this.timestampStore[sigValue]) {
                try {
                    // Timestamp the Signature Value (Base58 -> Bytes)
                    // Note: sigValue is Multibase Base58btc string. 
                    // getTimestamp expects Uint8Array. 
                    // We don't have a decoder imported here, but we can treat the string as bytes or decode it.
                    // Ideally, we timestamp the BYTES of the signature.
                    // But standard 'TextEncoder' is fine for proving existence of the string.
                    const sigBytes = new TextEncoder().encode(sigValue);
                    const tokenBuffer = await getTimestamp(sigBytes, this.tsaUrl);
                    this.timestampStore[sigValue] = Buffer.from(tokenBuffer).toString('base64');
                    console.log(`[LTV] Fetched new timestamp for VC signature`);
                } catch (e) {
                    console.warn(`[LTV] Failed to fetch timestamp:`, e);
                }
            }
        }
        // -----------------------------------------

        await this.saveStore();
        return vc;
    }
}

