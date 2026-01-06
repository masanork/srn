
import { describe, test, expect } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

const DIST_DIR = path.join(process.cwd(), "dist");

describe("Dist Directory Health Check", async () => {
    // skip if dist doesn't exist
    if (!await fs.pathExists(DIST_DIR)) {
        console.warn("dist directory not found, skipping health check.");
        return;
    }

    const htmlFiles = await glob("**/*.html", { cwd: DIST_DIR, absolute: true });
    
    // Sort by size to check the largest ones first (up to 20)
    const sortedHtmlFiles = htmlFiles
        .map(f => ({ path: f, size: fs.statSync(f).size }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 20);

    test("HTML files should not have duplicate blobs", async () => {
        for (const { path: filePath } of sortedHtmlFiles) {
            const content = await fs.readFile(filePath, "utf-8");
            
            // 1. Check for duplicate IDs
            const idMatches = content.match(/id="weba-blob-[^"]+"/g) || [];
            const ids = idMatches.map(m => m.split('"')[1]);
            const uniqueIds = new Set(ids);
            
            if (ids.length !== uniqueIds.size) {
                const dups = ids.filter((item, index) => ids.indexOf(item) !== index);
                throw new Error(`Duplicate blob IDs found in ${path.relative(DIST_DIR, filePath)}: ${dups.join(", ")}`);
            }

            // 2. Check for duplicate Base64 content (ignoring ID)
            const blobMatches = content.match(/<script id="weba-blob-[^>]+>([^<]+)<\/script>/g) || [];
            const blobContents = blobMatches.map(m => {
                const match = m.match(/>([^<]+)</);
                return match ? match[1].trim() : "";
            });
            
            const uniqueContents = new Set(blobContents);
            if (blobContents.length !== uniqueContents.size) {
                throw new Error(`Duplicate blob content found in ${path.relative(DIST_DIR, filePath)} (${blobContents.length - uniqueContents.size} duplicates)`);
            }

            // 3. Check for empty blobs
            if (idMatches.length > 0 && blobContents.some(c => c.length === 0)) {
                throw new Error(`Empty blob content found in ${path.relative(DIST_DIR, filePath)}`);
            }
        }
    });

    test("Critical assets should have healthy sizes and markers", async () => {
        const assets = await glob("**/assets/*.js", { cwd: DIST_DIR, absolute: true });
        
        const checks = [
            { 
                name: "form-core.js", 
                min: 50 * 1024, max: 1000 * 1024,
                markers: ["SearchEngine", "postalLookup", "DataManager"]
            },
            { 
                name: "verify-bundle.js", 
                min: 1000 * 1024, max: 20 * 1024 * 1024,
                markers: ["Reading VC file", "Verifying Signatures"]
            },
            { 
                name: "mermaid.min.js", 
                min: 500 * 1024, max: 10 * 1024 * 1024 
            },
            {
                name: "form-l2.js",
                min: 100 * 1024, max: 2000 * 1024,
                markers: ["buildLayer2Envelope", "decryptLayer2Envelope"]
            }
        ];

        for (const check of checks) {
            const matches = assets.filter(a => a.endsWith(check.name));
            if (matches.length === 0) continue;

            for (const assetPath of matches) {
                const content = await fs.readFile(assetPath, "utf-8");
                const size = content.length;
                
                // Size check
                expect(size).toBeGreaterThan(check.min);
                expect(size).toBeLessThan(check.max);

                // Marker check (if any)
                if (check.markers) {
                    for (const marker of check.markers) {
                        if (!content.includes(marker)) {
                            throw new Error(`Critical marker "${marker}" missing from ${path.relative(DIST_DIR, assetPath)}`);
                        }
                    }
                }
            }
        }
    });

    test("HTML files should not contain broken serialization or placeholders", async () => {
        for (const { path: filePath } of htmlFiles.map(f => ({ path: f }))) {
            const content = await fs.readFile(filePath, "utf-8");
            
            expect(content).not.toContain("__WEBA_MANIFEST = undefined");
            expect(content).not.toContain("__WEBA_MANIFEST = null");
            expect(content).not.toContain("[object Object]");
            
            // Redirects might not have </html> tag if they are minimal, but usually they do
            if (!content.includes("http-equiv=\"refresh\"")) {
                expect(content).toContain("<html");
                expect(content).toContain("</html>");
            }
        }
    });

    test("Large HTML files should have expected blob variety", async () => {
        // Large Web/A files (> 500KB) should usually have several blobs (fonts, core, etc.)
        for (const { path: filePath, size } of sortedHtmlFiles) {
            if (size > 500 * 1024) {
                const content = await fs.readFile(filePath, "utf-8");
                const blobCount = (content.match(/id="weba-blob-/g) || []).length;
                
                // If it's a redirect, skip
                if (content.includes("http-equiv=\"refresh\"")) continue;

                // Typical Web/A should have at least 2-3 blobs (Core JS + 1-2 Fonts)
                if (blobCount < 2) {
                    console.warn(`File ${path.relative(DIST_DIR, filePath)} is large (${(size/1024).toFixed(0)}KB) but has only ${blobCount} blob(s).`);
                }
            }
        }
    });
});
