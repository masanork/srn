import { describe, expect, test, beforeAll } from "bun:test";
import { IdentityManager } from "../src/ssg/IdentityManager.ts";
import { initWasm } from "@srn/core";
import fs from "fs-extra";
import path from "path";
import { PrunableHashChain } from "@srn/core";

describe("PHC Automatic Pruning", () => {
    const testDir = path.resolve("tests/fixtures/phc-pruning");
    const distDir = path.join(testDir, "dist");
    const dataDir = path.join(testDir, "data");

    beforeAll(async () => {
        await initWasm();
        await fs.emptyDir(testDir);
        await fs.ensureDir(distDir);
        await fs.ensureDir(dataDir);
    });

    test("should prune intermediate events when chain grows too long", async () => {
        const idManager = new IdentityManager("localhost", "/", dataDir, distDir);
        await idManager.init();

        const payload = { title: "Test Doc", content: "Stable content" };

        // 1. Initial Signing (Genesis)
        // Length: 1
        await idManager.signDocument(payload);

        // 2. Simulate 15 rebuilds (Total 16 events: Genesis + 15 L4Rebuild)
        // We assume the implementation will prune when length > 10, keeping Genesis + Latest 5.
        for (let i = 0; i < 15; i++) {
            await idManager.signDocument(payload);
        }

        // 3. One more to get the latest VC and verify
        // Total 17 events (Indices 0..16)
        const vc = await idManager.signDocument(payload);

        const chainJson = idManager.getContextChain(vc);
        expect(chainJson).not.toBeNull();

        const phc = PrunableHashChain.fromJSON(chainJson);
        const links = phc.getLinks();

        expect(links.length).toBe(17);

        // Check Genesis (Index 0) - Should be kept
        expect(links[0].event.type).toBe("Genesis");
        expect((links[0].event as any).pruned).toBeUndefined();
        expect(links[0].event.payload).toBeDefined();

        // Check Latest (Index 16) - Should be kept
        expect(links[16].event.type).toBe("L4Rebuild");
        expect((links[16].event as any).pruned).toBeUndefined();

        // Check Intermediate (e.g., Index 2) - Should be PRUNED
        // If we keep Latest 5 (indices 12, 13, 14, 15, 16) + Genesis (0)
        // Then indices 1..11 should be pruned.
        const intermediateLink = links[2];
        expect((intermediateLink.event as any).pruned).toBe(true);
        expect(intermediateLink.event.payload).toBeUndefined();

        // Boundary Check
        expect((links[11].event as any).pruned).toBe(true);
        expect((links[12].event as any).pruned).toBeUndefined();
    });
});
