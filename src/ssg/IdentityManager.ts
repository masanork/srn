
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import { createHybridVC, generateHybridKeys, createStatusListVC } from '../core/vc.ts';
import type { HybridKeys } from '../core/vc.ts';
import { encodeDidKey, encodePqcPublicKeyJwk } from '../core/did.ts';
import { hexToBytes } from '../core/encoding.ts';

export class IdentityManager {
    public currentKeys!: HybridKeys;
    public rootKeys!: HybridKeys;
    public buildId: string;
    public siteDid: string;
    private dataDir: string;
    private distDir: string;

    constructor(siteDomain: string, sitePath: string, dataDir: string, distDir: string) {
        this.siteDid = `did:web:${siteDomain}${sitePath.replace(/\//g, ':')}`;
        this.dataDir = dataDir;
        this.distDir = distDir;
        this.buildId = `build-${Date.now()}`;
    }

    async init() {
        const rootKeyPath = path.join(this.dataDir, 'root-key.json');

        if (await fs.pathExists(rootKeyPath)) {
            this.rootKeys = await fs.readJson(rootKeyPath);
            this.currentKeys = await generateHybridKeys(); // Ephemeral for each build
        } else {
            this.rootKeys = await generateHybridKeys();
            this.currentKeys = await generateHybridKeys();
            await fs.writeJson(rootKeyPath, this.rootKeys, { spaces: 2 });
        }

        await this.updateKeyHistory();
        await this.generateDidDoc();
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

    public getDidDocument() {
        return this.lastGeneratedDidDoc;
    }

    async signDocument(payload: any): Promise<any> {
        return createHybridVC(payload, this.currentKeys, this.siteDid, this.buildId);
    }
}
