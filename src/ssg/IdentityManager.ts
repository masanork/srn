
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import canonicalize from 'canonicalize';
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
    private signatureStore: Record<string, any> = {};
    private contextStore: Record<string, any[]> = {};

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

        await this.updateKeyHistory();
        await this.generateDidDoc();
    }

    private async saveStore() {
        const storePath = path.join(this.dataDir, 'signature-store.json');
        await fs.writeJson(storePath, this.signatureStore, { spaces: 2 });

        const contextStorePath = path.join(this.dataDir, 'context-store.json');
        await fs.writeJson(contextStorePath, this.contextStore, { spaces: 2 });
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

    async signDocument(payload: any): Promise<any> {
        // LTV Phase 2: Stable Signatures
        // Check if we already have a signature for this EXACT payload (content-hash).
        // Note: payload here does not have issuanceDate yet.
        const canon = canonicalize(payload);
        const hash = crypto.createHash('sha256').update(canon || '').digest('hex');

        if (this.signatureStore[hash]) {
            // Reuse existing VC (preserving original issuanceDate and signature)
            // Warning: If keys were rotated, this signature might be valid but verified with an old key.
            // LTV/TrustStore handles this by keeping key history.
            return this.signatureStore[hash];
        }

        const vc = await createHybridVC(payload, this.currentKeys, this.siteDid, this.buildId);

        // LTV Phase 3: Create Genesis Context Link
        // For now, we sign it with the same key as the VC, but logically this is the "First Custodian".
        // In real LTV, this would reference the L2 VC's signature hash, but for simplicity we link to Payload Hash.
        const genesisLink = {
            type: "WebAContextLink",
            prevHash: "genesis",
            targetHash: hash,
            signer: this.siteDid,
            timestamp: new Date().toISOString(),
            proof: {
                type: "DataIntegrityProof",
                cryptosuite: "eddsa-jcs-2022",
                verificationMethod: `${this.siteDid}#${this.buildId}-ed25519`,
                // Note: We are not actually computing a cryptographic signature on this link yet in this PoC.
                // In production, we would call ed25519Sign(canonicalize(link_without_proof)).
                proofValue: "mock_signature_for_poc"
            }
        };

        // Save to store
        this.signatureStore[hash] = vc;
        this.contextStore[hash] = [genesisLink];
        await this.saveStore();

        return vc;
    }
}
