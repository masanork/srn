import { describe, expect, test } from "bun:test";
import { normalizeDate, stripLeadingTitleHeading } from "../src/ssg/utils";

describe("SSG Helpers", () => {
    test("normalizeDate should handle various formats", () => {
        // Date object
        const d = new Date(2025, 0, 1); // Jan 1st
        expect(normalizeDate(d)).toBe("2025-01-01");

        // String ISO
        expect(normalizeDate("2025-12-31")).toBe("2025-12-31");

        // String Other
        expect(normalizeDate("2025/12/31")).toBe("2025-12-31");

        // Invalid
        expect(normalizeDate(null)).toBe("");
        expect(normalizeDate(undefined)).toBe("");
        expect(normalizeDate(123)).toBe("123");
    });

    test("stripLeadingTitleHeading should remove h1 that matches title", () => {
        const content = "# My Title\n\nSome content";
        expect(stripLeadingTitleHeading(content, "My Title").trim()).toBe("Some content");

        const noMatch = "# Other\n\nContent";
        // Even if title doesn't match string exactly, it currently strips any leading # 
        // if title exists. (Based on code: if (i < lines.length && lines[i].startsWith('# ')) )
        expect(stripLeadingTitleHeading(noMatch, "My Title").trim()).toBe("Content");

        const noTitle = "# Other\n\nContent";
        expect(stripLeadingTitleHeading(noTitle, null)).toBe(noTitle);
    });
});
