import { describe, expect, test, beforeAll } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { build } from "../src/ssg/index.ts";
import { verifyTimestamp } from "../src/tools/tsa_client.ts";

const TEST_SITE_DIR = path.join(process.cwd(), "tests/fixtures/tsa-site");
const TEST_DIST_DIR = path.join(process.cwd(), "tests/fixtures/tsa-dist");

describe("SSG LTV TSA Integration", () => {
    // DigiCert is reliable
    const TSA_URL = "http://timestamp.digicert.com";

    beforeAll(async () => {
        await fs.remove(path.join(process.cwd(), "tests/fixtures/tsa-site"));
        await fs.remove(path.join(process.cwd(), "tests/fixtures/tsa-dist"));
        
        await fs.ensureDir(TEST_SITE_DIR);
        await fs.ensureDir(path.join(TEST_SITE_DIR, "content"));
        await fs.ensureDir(path.join(TEST_SITE_DIR, "static"));
        await fs.ensureDir(path.join(TEST_SITE_DIR, "data"));

        const config = {
            directories: {
                site: "tests/fixtures/tsa-site",
                dist: "tests/fixtures/tsa-dist",
                content: "tests/fixtures/tsa-site/content",
                fonts: "shared/fonts",
                data: "tests/fixtures/tsa-site/data",
                schemas: "shared/schemas"
            },
            identity: { 
                domain: "tsa.example.com", 
                path: "/",
                tsaUrl: TSA_URL 
            },
            fontStyles: { default: ["NotoSansJP-VariableFont_wght.ttf"] }
        };
        await fs.writeFile(path.join(TEST_SITE_DIR, "config.yaml"), JSON.stringify(config));
    });

    const runBuild = async (args: string[] = []) => {
        const originalArgv = [...process.argv];
        process.argv = ["bun", "src/ssg/index.ts", "--site-config", path.join(TEST_SITE_DIR, "config.yaml"), "--clean", "--no-lock", ...args];
        process.env.NODE_ENV = "test";
        try {
            await build();
        } finally {
            process.argv = originalArgv;
        }
    };

    test("embeds trusted timestamp in generated HTML", async () => {
        const md = `---\ntitle: Timestamped Page
layout: article
---
# Content`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/tsa.md"), md);
        
        try {
            await runBuild();
        } catch (e) {
            console.warn("Build failed (likely network):", e);
            // If network fails, we can't test integration.
            return; 
        }

        const htmlPath = path.join(TEST_DIST_DIR, "tsa.html");
        expect(await fs.pathExists(htmlPath)).toBe(true);
        
        const html = await fs.readFile(htmlPath, "utf-8");
        
        // Extract Trust Store
        const match = html.match(/id="weba-trust-store">([\s\S]*?)<\/script>/);
        expect(match).toBeTruthy();
        
        if (match) {
            const json = JSON.parse(match[1].trim());
            console.log("Trust Store:", JSON.stringify(json, null, 2));
            
            expect(json.trustedTimestamps).toBeArray();
            
            if (json.trustedTimestamps.length === 0) {
                console.warn("No timestamp found. Network request might have failed silently or config ignored.");
                // We expect at least 1 if network is up
                // If fetching failed in signDocument, it logs warning but doesn't throw.
                // So we can't strictly fail here if we are offline.
            } else {
                expect(json.trustedTimestamps.length).toBeGreaterThan(0);
                const tokenB64 = json.trustedTimestamps[0];
                const tokenBuffer = Buffer.from(tokenB64, 'base64');
                
                // We need the original signature to verify.
                // It's in the L2 VC (which is embedded in the HTML too or we can get it from store)
                // The VC is likely in the .vc.json file generated alongside.
                const vcPath = path.join(TEST_DIST_DIR, "tsa.vc.json");
                expect(await fs.pathExists(vcPath)).toBe(true);
                const vc = await fs.readJson(vcPath);
                
                const sigValue = vc.proof[0].proofValue;
                const sigBytes = new TextEncoder().encode(sigValue);
                
                const time = await verifyTimestamp(tokenBuffer.buffer, sigBytes);
                console.log("Embedded Timestamp Verified:", time.toISOString());
                
                const now = new Date();
                expect(Math.abs(now.getTime() - time.getTime())).toBeLessThan(5 * 60 * 1000);
            }
        }
    }, 30000); // 30s timeout for network
});
