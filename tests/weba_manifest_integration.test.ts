import { describe, expect, test, beforeAll } from "bun:test";
import { ManifestManager } from "../src/ssg/ManifestManager.ts";
import { createWebALayer2Payload, computeDigest } from "@srn/core";
import { initWasm } from "@srn/core";
import crypto from "node:crypto";
import fs from "fs-extra";
import path from "path";

describe("Web/A Manifest Architecture Integration (Pack & Prune)", () => {
    const distDir = "tests/fixtures/manifest-test";

    beforeAll(async () => {
        await initWasm();
        await fs.ensureDir(distDir);
    });

    test("Scenario: Pack -> Prune -> Verify integrity", async () => {
        const manager = new ManifestManager(distDir);

        // 1. PACK Phase: Register some blobs
        const blob1 = await manager.addBlob({
            id: "test-blob",
            content: "Hello Manifest",
            mediaType: "text/plain"
        });

        const l1CoreContent = { title: "Test Form", version: 1 };
        const l1CoreDigest = await computeDigest(l1CoreContent);

        // Get the official manifest object
        const manifestObj = manager.getManifestObject(l1CoreDigest);
        const manifestDigest = await computeDigest(manifestObj);

        // Generate injection HTML using the same manifest data
        const injectionHtml = manager.generateInjectionHtml(l1CoreDigest);
        expect(injectionHtml).toContain('test-blob');
        expect(injectionHtml).toContain('SGVsbG8gTWFuaWZlc3Q='); // Base64

        // 2. SIGNING Phase (Layer 2 Context Binding)
        const l2Payload = await createWebALayer2Payload(
            { name: "John Doe" },
            { id: "template-1", content: l1CoreContent },
            manifestObj,
            ["test-blob"]
        );

        expect(l2Payload.context.manifestDigest).toBe(manifestDigest);

        // 3. PRUNE Phase: Use ManifestManager.pruneHtml
        const prunedHtml = ManifestManager.pruneHtml(injectionHtml);

        expect(prunedHtml).not.toContain('SGVsbG8gTWFuaWZlc3Q=');
        expect(prunedHtml).toContain('window.__WEBA_MANIFEST');

        // 4. VERIFY Phase (Even without blob content)
        const extractedManifestMatch = prunedHtml.match(/window\.__WEBA_MANIFEST = (\{.*?\});/);
        const extractedManifestObj = JSON.parse(extractedManifestMatch![1]);
        const extractedManifestDigest = await computeDigest(extractedManifestObj);

        // Verify that the PRUNED document's manifest matches the SIGNED context
        expect(extractedManifestDigest).toBe(l2Payload.context.manifestDigest);

        console.log("Verified: Pruned document integrity matches the L2 signature binding.");
    });
});
