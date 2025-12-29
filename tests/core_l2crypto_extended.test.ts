import { describe, expect, test, afterEach } from "bun:test";
import { ReplayGuard, JsonFileReplayStore } from "../src/core/l2crypto";
import * as fs from "node:fs";
import * as path from "node:path";

describe("ReplayGuard with JsonFileReplayStore", () => {
    const testFile = path.resolve("work/test-replay-store.json");

    afterEach(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    });

    test("should use persistent store", async () => {
        const store = new JsonFileReplayStore(testFile);
        const guard = new ReplayGuard(store);

        expect(await guard.checkAndMark("nonce-1")).toBe(true);
        expect(await guard.checkAndMark("nonce-1")).toBe(false);

        // Re-load to verify persistence
        const store2 = new JsonFileReplayStore(testFile);
        const guard2 = new ReplayGuard(store2);
        expect(await guard2.checkAndMark("nonce-1")).toBe(false);
        expect(await guard2.checkAndMark("nonce-2")).toBe(true);

        await guard2.reset();
        expect(await guard2.checkAndMark("nonce-1")).toBe(true);
    });

    test("handles corrupt store file", () => {
        fs.writeFileSync(testFile, "invalid-json");
        const store = new JsonFileReplayStore(testFile); // Should not throw
        expect(store).toBeDefined();
    });
});
