import { describe, expect, test } from "bun:test";
import { parseMarkdown } from "../src/form/parser";

describe("Web/A Parser Inline Formatting", () => {
    test("supports bold text with **", () => {
        const md = "Hello **Bold** World";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Hello <strong>Bold</strong> World');
    });

    test("supports bold text with __", () => {
        const md = "Hello __Bold__ World";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Hello <strong>Bold</strong> World');
    });

    test("supports italic text with *", () => {
        const md = "Hello *Italic* World";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Hello <em>Italic</em> World');
    });

    test("supports italic text with _", () => {
        const md = "Hello _Italic_ World";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Hello <em>Italic</em> World');
    });

    test("supports inline code with `", () => {
        const md = "Use `code` here";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Use <code>code</code> here');
    });

    test("supports mixed formatting and tags", () => {
        const md = "Enter **Name**: [text:name] and `date`";
        const result = parseMarkdown(md);
        expect(result.html).toContain('Enter <strong>Name</strong>:');
        expect(result.html).toContain('<input');
        expect(result.html).toContain('and <code>date</code>');
    });

    test("escapes HTML while allowing formatting", () => {
        const md = "**Safe** <script>alert(1)</script>";
        const result = parseMarkdown(md);
        expect(result.html).toContain('<strong>Safe</strong>');
        expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
});
