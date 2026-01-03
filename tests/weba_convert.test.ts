import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { spawnSync } from "bun";

const TEST_DIR = path.resolve("tests/fixtures/convert-test");
const OUT_DIR = path.resolve("tests/fixtures/convert-out");

describe("Web/A Convert CLI", () => {
    beforeAll(async () => {
        await fs.ensureDir(TEST_DIR);
        await fs.ensureDir(OUT_DIR);

        // Create sample markdown files
        await fs.writeFile(path.join(TEST_DIR, "test1.md"), "---\ntitle: Test 1\n---\n# Hello\n[text:name] Name");
        await fs.writeFile(path.join(TEST_DIR, "test2.md"), "---\ntitle: Test 2\n---\n# World\n[number:age] Age");
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
        await fs.remove(OUT_DIR);
    });

    test("converts a single file successfully", () => {
        const result = spawnSync(["bun", "run", "src/bin/weba-convert.ts", path.join(TEST_DIR, "test1.md"), "-o", OUT_DIR]);

        if (result.exitCode !== 0) console.error("Convert Error:", result.stderr.toString());
        expect(result.exitCode).toBe(0);
        const targetHtml = path.join(OUT_DIR, "test1.html");
        expect(fs.existsSync(targetHtml)).toBe(true);

        const html = fs.readFileSync(targetHtml, "utf-8");
        expect(html).toContain("<title>Test 1</title>");
        expect(html).toContain("__WEBA_MANIFEST"); // Manifest check
        expect(html).toContain("weba-blob-");      // Blob check
    });

    test("converts a directory of files successfully", () => {
        const result = spawnSync(["bun", "run", "src/bin/weba-convert.ts", TEST_DIR, "-o", OUT_DIR]);

        expect(result.exitCode).toBe(0);
        expect(fs.existsSync(path.join(OUT_DIR, "test1.html"))).toBe(true);
        expect(fs.existsSync(path.join(OUT_DIR, "test2.html"))).toBe(true);
    });

    test("supports multiple input arguments", () => {
        // Clean output dir first
        fs.emptyDirSync(OUT_DIR);

        const result = spawnSync([
            "bun", "run", "src/bin/weba-convert.ts",
            path.join(TEST_DIR, "test1.md"),
            path.join(TEST_DIR, "test2.md"),
            "-o", OUT_DIR
        ]);

        expect(result.exitCode).toBe(0);
        expect(fs.existsSync(path.join(OUT_DIR, "test1.html"))).toBe(true);
        expect(fs.existsSync(path.join(OUT_DIR, "test2.html"))).toBe(true);
    });
});
