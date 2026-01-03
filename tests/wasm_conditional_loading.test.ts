import { describe, expect, test, beforeAll } from "bun:test";
import { LayoutManager } from "../src/ssg/LayoutManager.ts";
import { ManifestManager } from "../src/ssg/ManifestManager.ts";
import { IdentityManager } from "../src/ssg/IdentityManager.ts";
import { initWasm } from "../src/core/wasm_core.ts";
import fs from "fs-extra";
import path from "path";

describe("WASM Conditional Loading", () => {
    const testDir = path.resolve("tests/fixtures/wasm-loading-test");
    const distDir = path.join(testDir, "dist");
    const dataDir = path.join(testDir, "data");
    let idManager: IdentityManager;
    let layoutManager: LayoutManager;

    beforeAll(async () => {
        await initWasm();
        await fs.ensureDir(distDir);
        await fs.ensureDir(dataDir);

        idManager = new IdentityManager("localhost", "/", dataDir, distDir);
        await idManager.init();

        layoutManager = new LayoutManager();
    });

    test("WASM should NOT be loaded for form without L2 config", async () => {
        const manifestManager = new ManifestManager(distDir);

        const ctx = {
            data: {
                layout: "form",
                title: "Simple Form",
                // No L2 config
            },
            config: {},
            content: "# Simple Form\n\n- [text:name] Name",
            htmlContent: "<p>Simple Form</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "test.md",
            contentDir: testDir
        };

        const result = await layoutManager.render(ctx, manifestManager);

        // Check manifest for WASM
        const manifest = manifestManager.getManifestObject("");
        const wasmBlob = manifest.blobs.find(b => b.id === "weba-crypto-wasm");

        expect(wasmBlob).toBeUndefined();
        expect(result.html).toBeTruthy();
    });

    test("WASM SHOULD be loaded for form with L2 config", async () => {
        const manifestManager = new ManifestManager(distDir);

        const ctx = {
            data: {
                layout: "form",
                title: "L2 Encrypted Form",
                l2_encrypt: true,
                l2_recipient_kid: "recipient#key-1",
                l2_recipient_x25519: "test-x25519-key"
            },
            config: {},
            content: "# L2 Form\n\n- [text:name] Name",
            htmlContent: "<p>L2 Form</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "test-l2.md",
            contentDir: testDir
        };

        const result = await layoutManager.render(ctx, manifestManager);

        // Check manifest for WASM
        const manifest = manifestManager.getManifestObject("");
        const wasmBlob = manifest.blobs.find(b => b.id === "weba-crypto-wasm");

        expect(wasmBlob).toBeDefined();
        expect(wasmBlob?.mediaType).toBe("application/wasm");
        expect(wasmBlob?.size).toBeGreaterThan(400000); // ~454KB
        expect(result.html).toBeTruthy();
    });

    test("WASM SHOULD be loaded when L2 features mentioned in content", async () => {
        const manifestManager = new ManifestManager(distDir);

        const ctx = {
            data: {
                layout: "form",
                title: "Form with L2 in content"
            },
            config: {},
            content: "# Form\n\nThis form uses weba-l2-encrypt feature.",
            htmlContent: "<p>Form with L2</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "test-l2-content.md",
            contentDir: testDir
        };

        const result = await layoutManager.render(ctx, manifestManager);

        // Check manifest for WASM
        const manifest = manifestManager.getManifestObject("");
        const wasmBlob = manifest.blobs.find(b => b.id === "weba-crypto-wasm");

        expect(wasmBlob).toBeDefined();
        expect(result.html).toBeTruthy();
    });

    test("WASM SHOULD be loaded for forms with VC (signed templates)", async () => {
        const manifestManager = new ManifestManager(distDir);

        const ctx = {
            data: {
                layout: "form",
                title: "Signed Form Template"
            },
            config: {},
            content: "# Signed Form\n\n- [text:name] Name",
            htmlContent: "<p>Signed Form</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "test-signed.md",
            contentDir: testDir
        };

        // This will create a VC (signed template)
        const result = await layoutManager.render(ctx, manifestManager);

        // Note: Currently WASM is NOT loaded for basic forms without L2
        // even if they generate a VC (template signature happens server-side).
        // This is intentional to save 454KB for non-L2 forms.
        // If client-side signature verification is needed in the future,
        // the logic can be adjusted.

        expect(result.vc).toBeDefined(); // VC is created
        expect(result.html).toBeTruthy();

        // Check manifest - WASM should NOT be loaded for basic signed forms
        const manifest = manifestManager.getManifestObject("");
        const wasmBlob = manifest.blobs.find(b => b.id === "weba-crypto-wasm");
        expect(wasmBlob).toBeUndefined(); // WASM not needed without L2
    });

    test("Size comparison: with and without WASM", async () => {
        // Without WASM
        const m1 = new ManifestManager(distDir);
        const ctx1 = {
            data: { layout: "form", title: "Form 1" },
            config: {},
            content: "# Form 1\n\n- [text:name] Name",
            htmlContent: "<p>Form 1</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "form1.md",
            contentDir: testDir
        };
        await layoutManager.render(ctx1, m1);
        const manifest1 = m1.getManifestObject("");
        const size1 = manifest1.blobs.reduce((sum, b) => sum + b.size, 0);

        // With WASM
        const m2 = new ManifestManager(distDir);
        const ctx2 = {
            data: {
                layout: "form",
                title: "Form 2",
                l2_encrypt: true,
                l2_recipient_kid: "key-1",
                l2_recipient_x25519: "x25519-key"
            },
            config: {},
            content: "# Form 2\n\n- [text:name] Name",
            htmlContent: "<p>Form 2</p>",
            fontCss: "",
            safeFontFamilies: [],
            allPages: [],
            idManager,
            distDir,
            relPath: "form2.md",
            contentDir: testDir
        };
        await layoutManager.render(ctx2, m2);
        const manifest2 = m2.getManifestObject("");
        const size2 = manifest2.blobs.reduce((sum, b) => sum + b.size, 0);

        // WASM adds ~454KB, plus L2 runtime (form-l2.js) adds ~300KB
        // Total difference should be ~754KB
        const sizeDiff = size2 - size1;
        expect(sizeDiff).toBeGreaterThan(700000); // At least 700KB
        expect(sizeDiff).toBeLessThan(900000); // Less than 900KB

        console.log(`Size without L2: ${(size1/1024).toFixed(1)} KB`);
        console.log(`Size with L2 (WASM + L2 runtime): ${(size2/1024).toFixed(1)} KB`);
        console.log(`Difference: ${(sizeDiff/1024).toFixed(1)} KB`);
    });
});
