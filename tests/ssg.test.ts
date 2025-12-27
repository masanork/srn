
import { describe, expect, test, beforeAll } from "bun:test";
import fs from "fs-extra";
import path from "path";
import { build } from "../src/ssg/index.ts";

const TEST_SITE_DIR = path.join(process.cwd(), "tests/fixtures/test-site");
const TEST_DIST_DIR = path.join(process.cwd(), "tests/fixtures/dist");

describe("SSG Integration", () => {
    beforeAll(async () => {
        await fs.remove(path.join(process.cwd(), "tests/fixtures"));
        await fs.ensureDir(TEST_SITE_DIR);
        await fs.ensureDir(path.join(TEST_SITE_DIR, "content"));
        await fs.ensureDir(path.join(TEST_SITE_DIR, "static"));
        await fs.ensureDir(path.join(TEST_SITE_DIR, "data"));

        const config = {
            directories: {
                site: "tests/fixtures/test-site",
                dist: "tests/fixtures/dist",
                content: "tests/fixtures/test-site/content",
                fonts: "shared/fonts",
                data: "tests/fixtures/test-site/data",
                schemas: "shared/schemas"
            },
            identity: { domain: "test.example.com", path: "/test" },
            fontStyles: { default: ["NotoSansJP-VariableFont_wght.ttf"] }
        };
        await fs.writeFile(path.join(TEST_SITE_DIR, "config.yaml"), JSON.stringify(config));
        await fs.writeFile(path.join(TEST_SITE_DIR, "static/style.css"), "body { color: red; }");
    });

    const runBuild = async (args: string[] = []) => {
        const originalArgv = [...process.argv];
        // Always include --clean in tests to ensure full execution and coverage
        process.argv = ["bun", "src/ssg/index.ts", "--site-config", path.join(TEST_SITE_DIR, "config.yaml"), "--clean", ...args];
        process.env.NODE_ENV = "test";
        try {
            await build();
        } finally {
            process.argv = originalArgv;
        }
    };

    test("builds basic article and generates signed HTML", async () => {
        const md = `---\ntitle: Test Page\nlayout: article\nauthor: Tester\n---\n# Hello\nContent`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/article-1.md"), md);
        await runBuild();

        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "article-1.html"))).toBe(true);
        const html = await fs.readFile(path.join(TEST_DIST_DIR, "article-1.html"), "utf-8");
        expect(html).toContain("発行元による真正性の証明");
    });

    test("generates form and report", async () => {
        const md = `---\ntitle: My Form\nlayout: form\n---\n# Submit\n- [text:name] Name`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/form.md"), md);
        await runBuild();

        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "form.html"))).toBe(true);
        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "form.report.html"))).toBe(true);
        const html = await fs.readFile(path.join(TEST_DIST_DIR, "form.html"), "utf-8");
        expect(html).toContain("記入内容（データ）の確認");
    });

    test("generates blog index with filtered items", async () => {
        const md = `---\ntitle: My Blog\nlayout: blog\n---\nBlog Home`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/blog.md"), md);
        await runBuild();

        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "blog.html"))).toBe(true);
        const html = await fs.readFile(path.join(TEST_DIST_DIR, "blog.html"), "utf-8");
        expect(html).toContain("Test Page"); // listed article
    });

    test("generates verifier page", async () => {
        const md = `---\ntitle: Verify\nlayout: verifier\n---`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/verify.md"), md);
        await runBuild();
        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "verify.html"))).toBe(true);
    });

    test("generates juminhyo with dummy data", async () => {
        const md = `---\ntitle: Jumin\nlayout: juminhyo\nissueDate: 2025-12-27\nissuer:\n  title: Test City\n  name: Test Mayor\nitems:\n  - name: Taro\n    dob: 1980-01-01\n---`;
        await fs.writeFile(path.join(TEST_SITE_DIR, "content/jumin.md"), md);
        await runBuild();
        expect(await fs.pathExists(path.join(TEST_DIST_DIR, "jumin.html"))).toBe(true);
    });
});
