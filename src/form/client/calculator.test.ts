import { describe, test, expect, beforeEach } from "bun:test";
import { Window } from 'happy-dom';
import { Calculator } from './calculator';

// Setup global environment
const window = new Window();
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLInputElement = window.HTMLInputElement;
(global as any).Event = window.Event;

describe("Web/A Client Runtime > Calculator", () => {
    const calculator = new Calculator();

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test("recalculate: performs simple arithmetic", () => {
        document.body.innerHTML = `
            <table>
                <tr>
                    <td><input data-base-key="a" value="10"></td>
                    <td><input data-base-key="b" value="20"></td>
                    <td><input data-formula="a + b"></td>
                </tr>
            </table>
        `;
        calculator.recalculate();
        const result = document.querySelector('[data-formula]') as HTMLInputElement;
        expect(result.value).toBe('30');
    });

    test("recalculate: supports Math functions and grouping", () => {
        // (10 - 5) * max(2, 8) = 5 * 8 = 40
        document.body.innerHTML = `
            <table>
                <tr>
                    <td><input data-base-key="x" value="10"></td>
                    <td><input data-base-key="y" value="5"></td>
                    <td><input data-formula="(x - y) * Math.max(2, 8)"></td>
                </tr>
            </table>
        `;
        calculator.recalculate();
        const result = document.querySelector('[data-formula]') as HTMLInputElement;
        expect(result.value).toBe('40');
    });

    test("recalculate: SUM formula", () => {
        document.body.innerHTML = `
            <table>
                <tr><td><input data-base-key="x" value="10"></td></tr>
                <tr><td><input data-base-key="x" value="20"></td></tr>
                <tr><td><input data-base-key="x" value="5"></td></tr>
                <tr><td><input data-formula="SUM(x)"></td></tr>
            </table>
        `;
        calculator.recalculate();
        const result = document.querySelector('[data-formula]') as HTMLInputElement;
        expect(result.value).toBe('35');
    });

    test("chain reaction: calc updates should propagate via AutoCopy or subsequent recalcs", () => {
        document.body.innerHTML = `
            <table>
                <tr>
                    <td><input data-base-key="a" value="10"></td>
                    <td><input data-base-key="b" data-formula="a * 2"></td>
                    <td><input data-formula="b + 5" id="c"></td>
                </tr>
            </table>
        `;

        calculator.recalculate();
        const c = document.getElementById('c') as HTMLInputElement;
        expect(c.value).toBe('25');
    });

    test("runAutoCopy: copies data-copy-from", () => {
        document.body.innerHTML = `
            <input id="src" data-base-key="src_key" value="helloworld">
            <input id="dest" data-copy-from="src_key" value="">
        `;
        calculator.runAutoCopy();
        const dest = document.getElementById('dest') as HTMLInputElement;
        expect(dest.value).toBe('helloworld');
    });

    test("runAutoCopy: does NOT copy if dirty", () => {
        document.body.innerHTML = `
            <input id="src" data-base-key="src_key" value="newval">
            <input id="dest" data-copy-from="src_key" value="oldval" data-dirty="true">
        `;
        calculator.runAutoCopy();
        const dest = document.getElementById('dest') as HTMLInputElement;
        expect(dest.value).toBe('oldval');
    });
});
