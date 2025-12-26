import { describe, test, expect } from "bun:test";
import { generateAggregatorHtml } from "./generator";

describe("Web/A Generator", () => {
    test("generateAggregatorHtml: generates valid HTML structure", () => {
        const md = `[text:foo] Bar`;
        const html = generateAggregatorHtml(md);
        
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('Web/A Aggregator');
        // Check for injected runtime script
        expect(html).toContain('window.generatedJsonStructure');
        expect(html).toContain('aggregatorRuntime');
        // Check UI elements
        expect(html).toContain('Drop Web/A HTML files');
        expect(html).toContain('Download Aggregated JSON');
    });
});
