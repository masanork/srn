
import { describe, expect, test } from "bun:test";
import { selectValues, computeMetric, flattenForCsv } from "../src/form/aggregator_engine";

describe("Aggregator Engine (Shared)", () => {
    describe("selectValues", () => {
        test("extracts nested objects", () => {
            const data = { a: { b: { c: 42 } } };
            expect(selectValues(data, "a.b.c")).toEqual([42]);
        });

        test("handles $. root prefix", () => {
            const data = { a: 1 };
            expect(selectValues(data, "$.a")).toEqual([1]);
        });

        test("handles array indexing", () => {
            const data = { items: [10, 20, 30] };
            expect(selectValues(data, "items[1]")).toEqual([20]);
        });

        test("handles array wildcard", () => {
            const data = { items: [{ v: 1 }, { v: 2 }] };
            expect(selectValues(data, "items[].v")).toEqual([1, 2]);
        });

        test("handles non-array wildcard fallback", () => {
            const data = { item: { v: 1 } };
            expect(selectValues(data, "item[].v")).toEqual([1]);
        });

        test("returns empty for missing paths", () => {
            expect(selectValues({ a: 1 }, "b")).toEqual([]);
            expect(selectValues(null, "a")).toEqual([]);
        });
    });

    describe("computeMetric", () => {
        const payloads = [
            { plain: { val: 10, ok: true } },
            { plain: { val: 20, ok: false } },
            { plain: { val: "30", ok: true } }
        ];

        test("calculates sum", () => {
            expect(computeMetric({ id: "s", name: "S", type: "sum", path: "val" }, payloads)).toBe(60);
        });

        test("calculates average", () => {
            expect(computeMetric({ id: "a", name: "A", type: "avg", path: "val" }, payloads)).toBe(20);
        });

        test("calculates count", () => {
            expect(computeMetric({ id: "c", name: "C", type: "count", path: "val" }, payloads)).toBe(3);
        });

        test("calculates boolean_count", () => {
            expect(computeMetric({ id: "b", name: "B", type: "boolean_count", path: "ok" }, payloads)).toBe(2);
        });

        test("calculates percent", () => {
            expect(computeMetric({ id: "p", name: "P", type: "percent", path: "ok" }, payloads)).toBe("66.7%");
        });
    });

    describe("flattenForCsv", () => {
        test("flattens deep nesting", () => {
            const data = { a: { b: { c: 1 } } };
            const res = flattenForCsv(data);
            expect(res["a.b.c"]).toBe(1);
        });

        test("flattens arrays with indices", () => {
            const data = { items: ["a", "b"] };
            const res = flattenForCsv(data);
            expect(res["items[0]"]).toBe("a");
            expect(res["items[1]"]).toBe("b");
        });

        test("handles empty objects and arrays", () => {
            expect(flattenForCsv({ a: [] })["a"]).toBe("[]");
            expect(flattenForCsv({ a: {} })["a"]).toBe("{}");
        });

        test("preserves primitives", () => {
            const data = { n: 1, s: "str", b: true, null: null };
            const res = flattenForCsv(data);
            expect(res.n).toBe(1);
            expect(res.s).toBe("str");
            expect(res.b).toBe(true);
            expect(res.null).toBeNull();
        });
    });
});
