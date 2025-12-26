
import { describe, expect, test } from "bun:test";
import { parseMarkdown } from "./parser";
import { generateHtml } from "./generator";
import { Renderers } from "./renderer";

describe("Web/A Parser", () => {
    test("parses basic text input", () => {
        const md = `- [text:name (placeholder="Name")] Full Name`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('<label class="form-label">Full Name</label>');
        expect(result.html).toContain('placeholder="Name"');
        expect(result.html).toContain('data-json-path="name"');
    });

    test("parses radio group", () => {
        const md = `- [radio:gender] Gender
  - [x] Male
  - Female`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('type="radio"');
        expect(result.html).toContain('name="gender"');
        expect(result.html).toContain('value="Male" checked');
        expect(result.html).toContain('value="Female"');
    });

    test("parses dynamic table", () => {
        const md = `[dynamic-table:items]
| Item | Cost |
|---|---|
| [text:item] | [number:cost] |`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('<table class="data-table dynamic" id="tbl_items" data-table-key="items">');
        expect(result.html).toContain('<th>Item</th>');
        expect(result.html).toContain('data-base-key="item"'); // template row (first one)
        expect(result.html).toContain('class="template-row"'); // Note: implementation details might vary depending on how first row is handled
    });
});

describe("Web/A Renderer", () => {
    test("escapes HTML in values", () => {
        const escaped = Renderers.escapeHtml('<script>alert(1)</script>');
        expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    test("tableRow renders template inputs", () => {
        const row = Renderers.tableRow(['[text:foo]', 'Bar'], true);
        expect(row).toContain('data-base-key="foo"');
        expect(row).toContain('class="template-row"');
    });
});

describe("Web/A Generator", () => {
    test("generates complete HTML document", () => {
        const md = `# Test Form
- [text:foo] Bar`;
        const html = generateHtml(md);
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<title>Test Form</title>');
        expect(html).toContain('window.generatedJsonStructure');
    });
});
