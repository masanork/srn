import { describe, expect, test } from "bun:test";
import { RUNTIME_SCRIPT, generateAggregatorHtml, generateHtml } from "./generator";

describe("Web/A Generator (Slim)", () => {
    test("provides RUNTIME_SCRIPT", () => {
        expect(typeof RUNTIME_SCRIPT).toBe("string");
        expect(RUNTIME_SCRIPT.length).toBeGreaterThan(0);
    });

    test("generateHtml embeds structure and runtime", () => {
        const markdown = "# Sample Form\n- [text:foo] Name";
        const html = generateHtml(markdown);
        expect(html).toContain("<script id=\"weba-structure\"");
        expect(html).toContain(RUNTIME_SCRIPT);

        const match = html.match(new RegExp('<script id="weba-structure" type="application/json">([\\s\\S]*?)</script>'));
        expect(match).toBeTruthy();
        const json = JSON.parse(match?.[1] ?? "{}");
        expect(json.name).toBe("Sample Form");
        expect(Array.isArray(json.fields)).toBe(true);
        expect(json.fields[0].key).toBe("foo");
    });

    test("generateAggregatorHtml embeds aggregator placeholders", () => {
        const markdown = "# Sample Form\n- [text:foo] Name";
        const html = generateAggregatorHtml(markdown);
        expect(html).toContain("Aggregator");
        expect(html).toContain("id=\"aggregator-root\"");
        expect(html).toContain("id=\"weba-structure\"");
        expect(html).toContain("id=\"weba-l2-keys\"");
        expect(html).toContain(RUNTIME_SCRIPT);
    });
});
