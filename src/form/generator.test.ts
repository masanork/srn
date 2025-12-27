import { describe, expect, test } from "bun:test";
import { RUNTIME_SCRIPT } from "./generator";

describe("Web/A Generator (Slim)", () => {
    test("provides RUNTIME_SCRIPT", () => {
        expect(typeof RUNTIME_SCRIPT).toBe("string");
        expect(RUNTIME_SCRIPT.length).toBeGreaterThan(0);
    });
});