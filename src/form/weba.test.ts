
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

    test("parses calc formulas containing parentheses", () => {
        const md = `- [calc:tax (formula="Math.floor(SUM(amount) * 0.1)" align:R)] Tax
[dynamic-table:items]
| Item | Tax |
|---|---|
| [text:item] | [calc:row_tax (formula="Math.floor(SUM(amount) * 0.1)" align:R)] |`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('data-formula="Math.floor(SUM(amount) * 0.1)"');
        expect(result.html).toContain('data-base-key="row_tax"');
    });

    test("toolbar buttons are in correct order", () => {
        const md = `# Test Form\n- [text:foo] Bar`;
        const result = parseMarkdown(md);
        
        // Check order: btn-clear should appear before secondary (Save Progress)
        const clearIdx = result.html.indexOf('class="btn-clear"');
        const saveIdx = result.html.indexOf('class="secondary"');
        const primaryIdx = result.html.indexOf('class="primary"');
        
        expect(clearIdx).toBeGreaterThan(-1);
        expect(saveIdx).toBeGreaterThan(clearIdx);
        expect(primaryIdx).toBeGreaterThan(saveIdx);
    });

    test("parses autonum attribute in table columns", () => {
        const md = `[dynamic-table:items]
| No | Item |
|---|---|
| [text:idx autonum] | [text:name] |`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('data-autonum="true"');
    });

    test("parses tabs and injects nav", () => {
        const md = `# Title
## Main
Page 1 Content
## Details
Page 2 Content`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('class="tabs-nav"');
        expect(result.html).toContain('Main</button>');
        expect(result.html).toContain('id="tab-1" class="tab-content active"');
    });

    test("extracts agg spec block and skips rendering", () => {
        const md = [
            "# Title",
            "```agg",
            "version: 0.1",
            "dashboard:",
            "  title: Test",
            "  cards:",
            "    - id: total",
            "      label: Total",
            "      op: count",
            "```",
            "Hello",
        ].join("\n");
        const result = parseMarkdown(md);
        expect(result.jsonStructure.aggSpec).toBeTruthy();
        expect(result.jsonStructure.aggSpec.dashboard.title).toBe("Test");
        expect(result.html).not.toContain("```agg");
    });

    test("parses master data blocks", () => {
        const md = `[master:vendors]
| ID | Name |
|---|---|
| V01 | Vendor A |
| V02 | Vendor B |

# Form
- [search:v src:vendors] Vendor`;
        const result = parseMarkdown(md);
        expect(result.jsonStructure.masterData.vendors).toBeDefined();
        // Current parser includes header, separator, and data rows in masterData array
        expect(result.jsonStructure.masterData.vendors.length).toBe(3); 
        expect(result.jsonStructure.masterData.vendors[1][1]).toBe("Vendor A");
    });

    test("parses indented radio options", () => {
        const md = `- [radio:color] Select Color
  - [x] Red
  - Blue
  - Green`;
        const result = parseMarkdown(md);
        expect(result.html).toContain('value="Red" checked');
        expect(result.html).toContain('value="Blue"');
        expect(result.html).toContain('value="Green"');
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

    test("renders search input with suggest:column", () => {
        const html = Renderers.renderInput('search', 's1', 'src:m suggest:column');
        expect(html).toContain('data-master-src="m"');
        expect(html).toContain('data-suggest-source="column"');
    });

    test("renders input with auto-copy attribute", () => {
        const html = Renderers.renderInput('text', 't1', 'copy:src_key');
        expect(html).toContain('data-copy-from="src_key"');
        expect(html).toContain('background-color: #ffffea');
    });

    test("renders number input with default right alignment", () => {
        const html = Renderers.renderInput('number', 'n1', '');
        expect(html).toContain('text-align:right');
    });
});
