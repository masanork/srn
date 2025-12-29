
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import { createHybridVC, generateHybridKeys, createStatusListVC } from '../core/vc.ts';
import {
    MULTICODEC_ED25519_PUB,
    MULTICODEC_ML_DSA_44_PUB,
    didKeyFromPublicKey,
    encodeMultibaseKey
} from '../core/did.ts';
import type { HybridKeys } from '../core/vc.ts';

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
            try { history = await fs.readJson(historyPath); } catch(e) {}
        }

        history.push({
            timestamp: new Date().toISOString(),
            buildId: this.buildId,
            revoked: false,
            ed25519Params: didKeyFromPublicKey(
                MULTICODEC_ED25519_PUB,
                Uint8Array.from(Buffer.from(this.currentKeys.ed25519.publicKey, 'hex'))
            ),
            pqcParams: didKeyFromPublicKey(
                MULTICODEC_ML_DSA_44_PUB,
                Uint8Array.from(Buffer.from(this.currentKeys.pqc.publicKey, 'hex'))
            )
        });

        await fs.writeJson(historyPath, history, { spaces: 2 });
        await fs.writeJson(path.join(this.distDir, 'key-history.json'), history, { spaces: 2 });

        // Generate Status List
        const revoked = history.filter(k => k.revoked).map(k => k.buildId);
        const statusListVc = await createStatusListVC(revoked, this.rootKeys, `${this.siteDid}/status-list.json`, this.siteDid);
        await fs.writeJson(path.join(this.distDir, 'status-list.json'), statusListVc, { spaces: 2 });
    }

    private async generateDidDoc() {
        const rootEdKey = Uint8Array.from(Buffer.from(this.rootKeys.ed25519.publicKey, 'hex'));
        const buildEdKey = Uint8Array.from(Buffer.from(this.currentKeys.ed25519.publicKey, 'hex'));
        const buildPqcKey = Uint8Array.from(Buffer.from(this.currentKeys.pqc.publicKey, 'hex'));
        const rootEdMultibase = encodeMultibaseKey(MULTICODEC_ED25519_PUB, rootEdKey);
        const buildEdMultibase = encodeMultibaseKey(MULTICODEC_ED25519_PUB, buildEdKey);
        const buildPqcMultibase = encodeMultibaseKey(MULTICODEC_ML_DSA_44_PUB, buildPqcKey);
        const didDoc = {
            "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
            "id": this.siteDid,
            "verificationMethod": [
                {
                    id: `${this.siteDid}#root-ed25519`,
                    type: "Ed25519VerificationKey2020",
                    controller: this.siteDid,
                    publicKeyMultibase: rootEdMultibase
                },
                {
                    id: `${this.siteDid}#${this.buildId}-ed25519`,
                    type: "Ed25519VerificationKey2020",
                    controller: this.siteDid,
                    publicKeyMultibase: buildEdMultibase
                },
                {
                    id: `${this.siteDid}#${this.buildId}-pqc`,
                    type: "PqcMlDsa44VerificationKey2025",
                    controller: this.siteDid,
                    publicKeyMultibase: buildPqcMultibase
                }
            ],
            "assertionMethod": [`${this.siteDid}#root-ed25519`, `${this.siteDid}#${this.buildId}-ed25519`, `${this.siteDid}#${this.buildId}-pqc`]
        };
        await fs.ensureDir(path.join(this.distDir, '.well-known'));
        await fs.writeJson(path.join(this.distDir, '.well-known', 'did.json'), didDoc, { spaces: 2 });
        await fs.writeJson(path.join(this.distDir, 'did.json'), didDoc, { spaces: 2 });
    }

    async signDocument(payload: any): Promise<any> {
        return createHybridVC(payload, this.currentKeys, this.siteDid, this.buildId);
    }
}
