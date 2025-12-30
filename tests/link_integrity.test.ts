import { describe, expect, test } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { globSync } from "glob";

describe("Link Integrity Check", () => {
    const DIST_DIR = path.resolve(process.cwd(), "dist/srn");

    test("should have no broken relative links in dist/", async () => {
        if (!(await fs.pathExists(DIST_DIR))) {
            console.warn("Skipping: dist/srn not found. Please run 'bun run build:srn' first.");
            return;
        }

        const htmlFiles = globSync("**/*.html", { cwd: DIST_DIR });
        const brokenLinks: string[] = [];
        const ignoredExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.css', '.js'];

        for (const file of htmlFiles) {
            const content = await fs.readFile(path.join(DIST_DIR, file), "utf-8");
            // Match href and src attributes
            const matches = content.matchAll(/(?:href|src)="([^"]+)"/g);

            for (const match of matches) {
                const link = match[1];

                // Skip external links, mailto, and fragment-only links
                if (link.startsWith("http") || link.startsWith("mailto:") || link.startsWith("#") || link.startsWith("data:")) continue;

                // Strip query parameters and hashes to resolve the physical path
                const targetRelativePath = link.split(/[?#]/)[0];
                if (!targetRelativePath) continue;

                const absoluteTarget = path.resolve(DIST_DIR, path.dirname(file), targetRelativePath);

                if (!(await fs.pathExists(absoluteTarget))) {
                    // Try to handle implicit index.html for directories
                    const indexTarget = path.join(absoluteTarget, "index.html");
                    if (!(await fs.pathExists(indexTarget))) {
                        brokenLinks.push(`[${file}] broken reference: "${link}"`);
                    }
                }
            }
        }

        if (brokenLinks.length > 0) {
            console.error("\n❌ Found broken links/references:");
            // Sort and de-duplicate for cleaner output
            const uniqueBroken = Array.from(new Set(brokenLinks)).sort();
            console.error(uniqueBroken.join("\n"));
        }

        expect(brokenLinks.length).toBe(0);
    });
});
