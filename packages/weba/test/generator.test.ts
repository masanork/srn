import { describe, test, expect } from "bun:test";
import { Generator } from "../src/generator";

describe("Web/A Lite Generator", () => {
    test("generates basic HTML structure", () => {
        const generator = new Generator({
            title: "Test Form",
            description: "A minimal Web/A form"
        });

        const html = generator.generate();

        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("<title>Test Form</title>");
        expect(html).toContain("Web/A Lite Runtime initialized");
        
        // Size check: Should be extremely small initially
        const sizeInKb = Buffer.byteLength(html, 'utf8') / 1024;
        console.log(`Generated Web/A Size: ${sizeInKb.toFixed(2)} KB`);
        expect(sizeInKb).toBeLessThan(5); // Should be well under 5KB
    });
});
