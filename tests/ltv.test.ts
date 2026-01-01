import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { IdentityManager } from '../src/ssg/IdentityManager';

describe('Web/A LTV (Long-Term Validation)', () => {
    const TEST_DIR = path.join(process.cwd(), 'tmp_test_ltv');
    const DATA_DIR = path.join(TEST_DIR, 'data');
    const DIST_DIR = path.join(TEST_DIR, 'dist');

    beforeAll(async () => {
        await fs.ensureDir(DATA_DIR);
        await fs.ensureDir(DIST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    it('Phase 2: Should match Stable Signatures requirements', async () => {
        // 1. First Build (Initialize)
        const idManager1 = new IdentityManager('example.com', '/', DATA_DIR, DIST_DIR);
        await idManager1.init();

        const buildKey1 = await fs.readJson(path.join(DATA_DIR, 'build-key.json'));
        expect(buildKey1).toBeDefined();
        // currentKeys should match the saved file
        expect(idManager1.currentKeys).toEqual(buildKey1);

        // 2. Sign a payload
        const payload = {
            type: ["VerifiableCredential", "TestDocument"],
            credentialSubject: {
                id: "did:web:example.com:test1",
                content: "Hello World"
            }
        };

        const vc1 = await idManager1.signDocument(payload);
        expect(vc1.proof).toBeDefined();
        const issuanceDate1 = vc1.issuanceDate;

        // Wait to ensure time passes (if it were regenerating)
        await new Promise(r => setTimeout(r, 100));

        // 3. Second Build (Re-Initialize)
        const idManager2 = new IdentityManager('example.com', '/', DATA_DIR, DIST_DIR);
        await idManager2.init();

        // Key Persistence Check
        expect(idManager2.currentKeys).toEqual(buildKey1); // Keys should be stable

        // 4. Sign SAME payload
        const vc2 = await idManager2.signDocument(payload);

        // Signature Persistence Check
        expect(vc2.issuanceDate).toBe(issuanceDate1); // Date should be REUSED
        expect(vc2.proof[0].proofValue).toBe(vc1.proof[0].proofValue); // Signature should be IDENTICAL

        // 5. Sign DIFFERENT payload
        const payload2 = { ...payload, credentialSubject: { ...payload.credentialSubject, content: "Modified" } };
        const vc3 = await idManager2.signDocument(payload2);

        // Note: Depending on timing, issuanceDate might be same if fast enough, 
        // but signature MUST be different. And typically date is slightly different or at least same execution flow.
        // Actually createHybridVC uses new Date().toISOString() internally if not provided.
        // So checking signature difference is enough.
        expect(vc3.proof[0].proofValue).not.toBe(vc1.proof[0].proofValue); // Should be new
    });
});
