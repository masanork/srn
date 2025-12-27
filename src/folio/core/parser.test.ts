
import { describe, it, expect } from "bun:test";
import { WebAParser } from "./parser.js";

describe("WebAParser", () => {
    describe("parse", () => {
        it("should parse simple text fields", () => {
            const md = `- [text:name] Name`;
            const schema = WebAParser.parse(md);
            expect(schema.fields).toHaveLength(1);
            expect(schema.fields[0]).toEqual({
                id: "name",
                type: "text",
                label: "Name",
                placeholder: undefined,
                attributes: {}
            });
        });

        it("should parse attributes", () => {
            const md = `- [text:email (placeholder="foo@example.com" required)] Email Address`;
            const schema = WebAParser.parse(md);
            expect(schema.fields[0].attributes).toEqual({
                placeholder: "foo@example.com",
                required: "true"
            });
            expect(schema.fields[0].placeholder).toBe("foo@example.com");
        });

        it("should infer label from context", () => {
            const md = `
Some text
- [date:dob] Date of Birth
Next line
            `;
            const schema = WebAParser.parse(md);
            expect(schema.fields[0].label).toBe("Date of Birth");
        });

        it("should parse title from frontmatter", () => {
            const md = `---
title: "My Form"
---
[text:usage] usage`;
            const schema = WebAParser.parse(md);
            expect(schema.title).toBe("My Form");
        });
    });

    describe("fill", () => {
        it("should fill value into tag", () => {
            const md = `- [text:name] Name`;
            const data = { name: "Alice" };
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`- [text:name value="Alice"] Name`);
        });

        it("should preserve existing attributes", () => {
            const md = `- [text:email (required)] Email`;
            const data = { email: "alice@example.com" };
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`- [text:email required value="alice@example.com"] Email`);
        });

        it("should replace existing value attribute", () => {
            const md = `- [text:name (value="Old")] Name`;
            const data = { name: "New" };
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`- [text:name value="New"] Name`);
        });

        it("should escape quotes in value", () => {
            const md = `- [text:note] Note`;
            const data = { note: 'He said "Hello"' };
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`- [text:note value="He said &quot;Hello&quot;"] Note`);
        });

        it("should ignore missing data", () => {
            const md = `- [text:name] Name`;
            const data = {};
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`- [text:name] Name`);
        });

        it("should handle boolean values", () => {
            const md = `[checkbox:agreed]`;
            const data = { agreed: true };
            const result = WebAParser.fill(md, data);
            expect(result).toBe(`[checkbox:agreed value="true"]`);
        });
    });

    describe("validate", () => {
        it("should return error for missing required field", () => {
            const md = `[text:name (required)]`;
            const errors = WebAParser.validate(md);
            expect(errors).toHaveLength(1);
            expect(errors[0].id).toBe("name");
        });

        it("should return error for empty value in required field", () => {
            const md = `[text:name (required value="")]`;
            const errors = WebAParser.validate(md);
            expect(errors).toHaveLength(1);
        });

        it("should pass when required field has value", () => {
            const md = `[text:name (required value="Alice")]`;
            const errors = WebAParser.validate(md);
            expect(errors).toHaveLength(0);
        });

        it("should pass checks for non-required fields", () => {
            const md = `[text:opt]`;
            const errors = WebAParser.validate(md);
            expect(errors).toHaveLength(0);
        });
    });
});
