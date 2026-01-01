import { describe, test, expect, beforeAll } from "bun:test";
import { postalLookup } from "../src/form/client/postal";
import { readFileSync } from "fs";
import { join } from "path";

describe("Postal Lookup with Real Data", () => {
    beforeAll(async () => {
        const base64 = readFileSync(join(process.cwd(), 'shared', 'data', 'postal', 'postal-embedded.txt'), 'utf-8');
        await postalLookup.loadFromBase64(base64);
    });

    test("should find Tokyo Tower (105-0011)", () => {
        const result = postalLookup.lookup('1050011');
        expect(result).not.toBeNull();
        expect(result?.pref).toBe('東京都');
        expect(result?.city).toBe('港区');
        expect(result?.town).toBe('芝公園');
    });

    test("should suggest for 100-00", () => {
        const suggestions = postalLookup.suggest('10000');
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0].zip.startsWith('10000')).toBe(true);
        expect(suggestions[0].pref).toBe('東京都');
        expect(suggestions[0].city).toBe('千代田区');
    });

    test("should handle missing data", () => {
        const result = postalLookup.lookup('9999999');
        expect(result).toBeNull();
    });

    test("should handle prefix with multiple cities (490-11xx)", () => {
        // 490-1111: あま市, 490-1131: 海部郡大治町
        const r1 = postalLookup.lookup('4901111');
        const r2 = postalLookup.lookup('4901131');
        
        expect(r1?.city).toBe('あま市');
        expect(r2?.city).toBe('海部郡大治町');
    });
});
