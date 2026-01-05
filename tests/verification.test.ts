import { describe, test, expect, beforeAll, mock } from "bun:test";
import { verifyWebA } from "../packages/core/src/verify-core";
import { verifyWebALtv } from "../packages/core/src/verify-ltv";
import { createHybridVC, initWasm, encodeDidKey, hexToBytes } from "@srn/core";
import crypto from "node:crypto";

// Mock TSA Verification
mock.module("../packages/core/src/tsa_client.js", () => ({
    verifyTimestamp: async (token: ArrayBuffer, data: Uint8Array) => {
        return new Date("2026-01-01T00:00:00Z");
    }
}));

describe("Web/A Verification Logic", () => {
    let testKeys: any;
    let siteDid: string;
    let mockDidDocument: any;

    beforeAll(async () => {
        await initWasm();
        const { generateHybridKeys } = await import("@srn/core");
        testKeys = await generateHybridKeys(false);
        siteDid = encodeDidKey(hexToBytes(testKeys.ed25519.publicKey), 'ed25519');
        
        mockDidDocument = {
            id: siteDid,
            verificationMethod: [
                {
                    id: `${siteDid}#${siteDid.split(':')[2]}`,
                    type: "Ed25519VerificationKey2020",
                    controller: siteDid,
                    publicKeyHex: testKeys.ed25519.publicKey
                }
            ],
            assertionMethod: [`${siteDid}#${siteDid.split(':')[2]}`]
        };
    });

    const mockDidResolver = async (did: string) => {
        if (did === siteDid) return mockDidDocument;
        return null;
    };

    describe("verifyWebA (Core)", () => {
        test("should pass for a valid signed HTML", async () => {
            const vc = await createHybridVC({
                credentialSubject: { foo: "bar" }
            }, testKeys, siteDid);

            const html = `<html><body><script type="application/ld+json">${JSON.stringify(vc)}</script><div data-weba-field="credentialSubject.foo">bar</div></body></html>`;

            const result = await verifyWebA(html, { 
                checkHmp: true,
                didResolver: mockDidResolver
            });
            expect(result.isValid).toBe(true);
        });
    });

    describe("verifyWebALtv (Long-Term Validation)", () => {
        test("should perform full LTV verification (L1-L4 + TSA)", async () => {
            const { PrunableHashChain } = await import("../packages/core/src/phc");
            const phc = new PrunableHashChain();
            await phc.append("Genesis", { data: "root" });
            const phcData = phc.toJSON();

            const trustStore = { 
                didDocuments: [mockDidDocument],
                trustedTimestamps: [Buffer.from("mock-token").toString('base64')]
            };
            const manifest = { blobs: [{ id: 'weba-structure', digest: 'sha256:123' }] };

            const l4Placeholder = `<script type="application/vnd.weba+container-signature" id="weba-container-signature">{"placeholder":true}</script>`;
            
            // 1. Create L2 VC first
            const l2Vc = await createHybridVC({
                credentialSubject: { 
                    contentDigest: crypto.createHash('sha256').update("Signed Content").digest('hex')
                }
            }, testKeys, siteDid);

            // 2. Prepare the FULL HTML excluding only the L4 signature (using placeholder)
            const innerHtml = `<div id="weba-payload"><div class="weba-content">Signed Content</div></div><script id="weba-trust-store">${JSON.stringify(trustStore)}</script><script id="weba-context-chain">${JSON.stringify(phcData)}</script><script>window.__WEBA_MANIFEST = ${JSON.stringify(manifest)};</script><script type="application/ld+json">${JSON.stringify(l2Vc)}</script>`;
            const baseHtml = `<html><body>${innerHtml}${l4Placeholder}</body></html>`;
            
            // 3. Hash this base
            const containerHash = crypto.createHash('sha256').update(baseHtml).digest('hex');
            const latestContextHash = crypto.createHash('sha256').update(JSON.stringify(phcData)).digest('hex');

            // 4. Create L4 VC
            const l4Vc = await createHybridVC({
                credentialSubject: { containerHash, latestContextHash }
            }, testKeys, siteDid);

            // 5. Inject L4 signature
            const fullHtml = baseHtml.replace(l4Placeholder, `<script type="application/vnd.weba+container-signature" id="weba-container-signature">${JSON.stringify(l4Vc)}</script>`);

            const result = await verifyWebALtv(fullHtml, { checkHmp: true });
            
            if (!result.isValid) {
                console.error("LTV Verification Detail:", JSON.stringify({
                    l4: result.l4,
                    l3: result.l3,
                    l2: { isValid: result.l2.isValid, error: result.l2.error },
                    l1: result.l1,
                    hmp: result.hmp
                }, null, 2));
            }

            expect(result.isValid).toBe(true);
            expect(result.l4.valid).toBe(true);
            expect(result.tsa.valid).toBe(true);
        });

        test("should detect PHC commitment mismatch in L4", async () => {
            const phcData = [{ prevHash: null, event: {}, eventHash: "e1", chainHash: "c1" }];
            const l4Vc = await createHybridVC({
                credentialSubject: { containerHash: "dummy", latestContextHash: "wrong" }
            }, testKeys, siteDid);

            const html = `<html><body><script id="weba-context-chain">${JSON.stringify(phcData)}</script><script type="application/vnd.weba+container-signature" id="weba-container-signature">${JSON.stringify(l4Vc)}</script></body></html>`;

            const result = await verifyWebALtv(html);
            expect(result.l3.valid).toBe(false);
        });
    });
});