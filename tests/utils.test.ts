import { expect, test, describe } from "bun:test";
import { toWareki, toFullWidth, toLegalFormat } from "../src/core/utils.ts";

describe("Core Utils", () => {
    describe("toWareki", () => {
        test("converts modern dates to Reiwa", () => {
            expect(toWareki("2023-01-01")).toBe("令和5年1月1日");
            expect(toWareki("2019-05-01")).toBe("令和元年5月1日");
        });

        test("converts dates to Heisei", () => {
            expect(toWareki("2019-04-30")).toBe("平成31年4月30日");
            expect(toWareki("1989-01-08")).toBe("平成元年1月8日");
        });

        test("converts dates to Showa", () => {
            expect(toWareki("1989-01-07")).toBe("昭和64年1月7日");
            expect(toWareki("1926-12-25")).toBe("昭和元年12月25日");
        });

        test("converts dates to Taisho", () => {
            expect(toWareki("1926-12-24")).toBe("大正15年12月24日");
            expect(toWareki("1912-07-30")).toBe("大正元年7月30日");
        });

        test("converts dates to Meiji", () => {
            expect(toWareki("1912-07-29")).toBe("明治45年7月29日");
            expect(toWareki("1868-10-23")).toBe("明治元年10月23日");
        });

        test("returns original string for invalid or pre-Meiji dates", () => {
            expect(toWareki("invalid")).toBe("invalid");
            expect(toWareki("1800-01-01")).toBe("1800-01-01");
        });
    });

    describe("toFullWidth", () => {
        test("converts alphanumeric characters to full-width", () => {
            expect(toFullWidth("ABC")).toBe("ＡＢＣ");
            expect(toFullWidth("123")).toBe("１２３");
            expect(toFullWidth("a-z")).toBe("ａ－ｚ");
        });

        test("converts half-width space to full-width space", () => {
            expect(toFullWidth("Hello World")).toBe("Ｈｅｌｌｏ　Ｗｏｒｌｄ");
        });

        test("leaves other characters alone", () => {
            expect(toFullWidth("あいう")).toBe("あいう");
        });
    });

    describe("toLegalFormat", () => {
        test("converts YYYY-MM-DD to Wareki", () => {
            expect(toLegalFormat("2023-01-01")).toBe("令和5年1月1日");
        });

        test("converts alphanumeric string to FullWidth", () => {
            expect(toLegalFormat("No.123")).toBe("Ｎｏ．１２３");
        });

        test("passes through Japanese text", () => {
            expect(toLegalFormat("東京都")).toBe("東京都");
        });

        test("handles null/undefined gracefully", () => {
            expect(toLegalFormat(null)).toBe("");
            expect(toLegalFormat(undefined)).toBe("");
        });
    });
});
