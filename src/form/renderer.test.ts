import { describe, test, expect } from "bun:test";
import { Renderers } from "./renderer";

describe("Web/A Renderer (Advanced Coverage)", () => {

    describe("Utility Functions", () => {
        test("escapeHtml escapes special characters", () => {
            expect(Renderers.escapeHtml('<script>')).toBe('&lt;script&gt;');
            expect(Renderers.escapeHtml(' "quote" ')).toBe(' &quot;quote&quot; ');
            expect(Renderers.escapeHtml("'single'")).toBe('&#039;single&#039;');
        });

        test("formatHint escapes and preserves newlines", () => {
            expect(Renderers.formatHint("Line 1\nLine 2")).toBe("Line 1<br>Line 2");
            expect(Renderers.formatHint("Line 1<br>Line 2")).toBe("Line 1<br>Line 2");
        });

        test("getStyle maps attributes to CSS", () => {
            expect(Renderers.getStyle("size:L")).toContain("font-size: 1.25em");
            expect(Renderers.getStyle("size:S")).toContain("font-size: 0.8em");
            expect(Renderers.getStyle("size:XL bold")).toContain("font-size: 1.5em");
            expect(Renderers.getStyle("size:XL bold")).toContain("font-weight: bold");
            expect(Renderers.getStyle("align:R")).toContain("text-align: right");
            expect(Renderers.getStyle("align:C")).toContain("text-align: center");
        });

        test("getExtraAttrs extracts value and maxlength", () => {
            expect(Renderers.getExtraAttrs('val="Hello"')).toContain('value="Hello"');
            expect(Renderers.getExtraAttrs("len:10")).toContain('maxlength="10"');
            expect(Renderers.getExtraAttrs("max:5")).toContain('maxlength="5"');
            expect(Renderers.getExtraAttrs('val=Simple')).toContain('value="Simple"');
        });
    });

    describe("Field Renderers (Full Attribute Coverage)", () => {
        test("text field with hint and attributes", () => {
            const html = Renderers.text("key1", "Label", 'val="Init" hint="Help text" size:L');
            expect(html).toContain('value="Init"');
            expect(html).toContain('font-size: 1.25em');
            expect(html).toContain('class="form-hint"');
            expect(html).toContain('Help text');
        });

        test("number field with hint", () => {
            const html = Renderers.number("num1", "Num", 'hint="Enter number"');
            expect(html).toContain('type="number"');
            expect(html).toContain('Enter number');
        });

        test("textarea with attributes", () => {
            const html = Renderers.textarea("note", "Notes", 'placeholder="Type here"');
            expect(html).toContain('<textarea');
            expect(html).toContain('rows="5"');
            expect(html).toContain('placeholder="Type here"');
        });

        test("date input", () => {
            const html = Renderers.date("d1", "Date", "");
            expect(html).toContain('type="date"');
        });

        test("radio group start", () => {
            const html = Renderers.radioStart("r1", "Choose", "");
            expect(html).toContain('class="radio-group"');
        });

        test("radio option", () => {
            const html = Renderers.radioOption("r1", "opt1", "Option 1", true);
            expect(html).toContain('type="radio"');
            expect(html).toContain('value="opt1"');
            expect(html).toContain('checked');
        });

        test("search field with complex attributes", () => {
            // src, label index, value index
            const html = Renderers.search("s1", "Search", 'src:users label:2 value:1 placeholder="Find user"');
            expect(html).toContain('data-master-src="users"');
            expect(html).toContain('data-master-label-index="2"');
            expect(html).toContain('data-master-value-index="1"');
            expect(html).toContain('class="search-suggestions"');
        });
    });

    describe("renderInput (Generic Dispatch)", () => {
        test("renders datalist with master data options", () => {
            Renderers.setMasterData({
                "colors": [["ID", "Name"], ["1", "Red"], ["2", "Blue"]]
            });
            const html = Renderers.renderInput("datalist", "c1", "src:colors label:2");
            expect(html).toContain('<datalist');
            expect(html).toContain('<option value="Red">');
            expect(html).toContain('<option value="Blue">');
        });

        test("renders autonum field", () => {
            const html = Renderers.renderInput("autonum", "row_num", "");
            expect(html).toContain('class="form-input auto-num"');
            expect(html).toContain('readonly');
        });

        test("renders checkbox", () => {
            const html = Renderers.renderInput("checkbox", "chk", "");
            expect(html).toContain('type="checkbox"');
        });

        test("renders number with auto-copy", () => {
            const html = Renderers.renderInput("number", "n2", "copy:n1");
            expect(html).toContain('data-copy-from="n1"');
            expect(html).toContain('background-color: #ffffea');
        });

        test("renders generic text with auto-copy and suggest", () => {
            const html = Renderers.renderInput("text", "t2", "copy:t1 suggest:column");
            expect(html).toContain('data-copy-from="t1"');
            expect(html).toContain('data-suggest-source="column"');
        });
    });
});
