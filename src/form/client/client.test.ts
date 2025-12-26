import { describe, test, expect, beforeEach, beforeAll } from "bun:test";
import { Window } from 'happy-dom';
import { Calculator } from './calculator';
import { DataManager } from './data';
import { SearchEngine } from './search';
import { UIManager } from './ui';

// Setup global environment
const window = new Window({
    url: 'http://localhost:3000/test.html',
    width: 1024,
    height: 768,
});
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).navigator = window.navigator;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLInputElement = window.HTMLInputElement;
(global as any).Event = window.Event;

describe("Web/A Client Runtime", () => {

    beforeEach(() => {
        document.body.innerHTML = '';
        // Mock generated JSON structure
        (window as any).generatedJsonStructure = {
            name: 'Test Form',
            fields: [],
            tables: {},
            masterData: {
                'vendors': [
                    ['Code', 'Name', 'Tel'],
                    ['v1', 'Vendor One', '03-1111-2222'],
                    ['v2', 'Vendor Two', '03-3333-4444']
                ]
            }
        };

        // Mock generic utilities expected by runtime
        (window as any).escapeHtml = (str: string) => {
            if (!str) return '';
            return str.toString().replace(/[&<>"']/g, (m) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m] || m);
        };
    });

    describe("Calculator", () => {
        const calculator = new Calculator();

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
            // Note: Variables must be in the same row because our implementation scopes search to the row unless using json-path.

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
            // First pass: b becomes 20. c sees 20? 
            // querySelectorAll follows DOM order. b comes before c. 
            // b calc runs -> val=20. then c calc runs -> sees 20 -> val=25.
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

    describe("Data Manager", () => {
        const dataMgr = new DataManager();

        test("updateJsonLd: captures static fields", () => {
            document.body.innerHTML = `<input data-json-path="customer.name" value="John Doe">`;
            const data = dataMgr.updateJsonLd();
            expect(data['customer.name']).toBe('John Doe');
        });

        test("updateJsonLd: captures table data", () => {
            document.body.innerHTML = `
                <table class="data-table dynamic" data-table-key="items">
                    <tbody>
                        <tr><td><input data-base-key="item" value="Apple"></td></tr>
                        <tr><td><input data-base-key="item" value="Banana"></td></tr>
                    </tbody>
                </table>
            `;
            const data = dataMgr.updateJsonLd();
            expect(data['items']).toHaveLength(2);
            expect(data['items'][0].item).toBe('Apple');
            expect(data['items'][1].item).toBe('Banana');
        });

        // test("restoreFromLS") could be added if we mock localStorage
    });

    describe("Search Engine", () => {
        let search: SearchEngine;

        beforeEach(() => {
            search = new SearchEngine();
            // Manually remove any existing suggestion box
            const existing = document.getElementById('web-a-search-suggestions');
            if (existing) existing.remove();
        });

        test("init creates search suggestions box lazily or on init?", () => {
            // Actually getGlobalBox is lazy.
            search.init();
            // Should add event listeners.
            expect(true).toBe(true);
        });

        test("shows suggestions matching master data", async () => {
            search.init();

            // Create input
            const input = document.createElement('input');
            input.className = 'search-input';
            input.dataset.masterSrc = 'vendors';
            input.value = 'Vendor'; // Should match 'Vendor One' and 'Vendor Two'
            document.body.appendChild(input);

            // Trigger input event
            input.dispatchEvent(new Event('input', { bubbles: true }));

            // Wait for DOM update
            await new Promise(resolve => setTimeout(resolve, 50));

            const box = document.getElementById('web-a-search-suggestions');
            expect(box).toBeTruthy();
            expect(box?.style.display).toBe('block');

            const items = box?.querySelectorAll('.suggestion-item');
            expect(items?.length).toBe(2);
            expect(items?.[0].textContent).toContain('Vendor One');
        });

        test("shows suggestions from column values (suggest:column)", async () => {
            search.init();
            document.body.innerHTML = `
                <table>
                    <tr><td><input data-base-key="product" value="Alpha"></td></tr>
                    <tr><td><input data-base-key="product" value="Beta"></td></tr>
                    <tr><td><input class="search-input" data-suggest-source="column" data-base-key="product" value=""></td></tr>
                </table>
            `;
            const input = document.querySelector('.search-input') as HTMLInputElement;
            input.value = 'Al'; // Should match Alpha
            input.dispatchEvent(new Event('input', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 50));

            const box = document.getElementById('web-a-search-suggestions');
            const items = box?.querySelectorAll('.suggestion-item');
            expect(items?.length).toBe(1);
            expect(items?.[0].textContent).toContain('Alpha');
        });
    });

    describe("UI Manager", () => {
        let ui: UIManager;
        let calc: Calculator;
        let data: DataManager;

        beforeEach(() => {
            calc = new Calculator();
            data = new DataManager();
            ui = new UIManager(calc, data);
        });

        test("addTableRow: clones template row and appends to tbody", () => {
            document.body.innerHTML = `
                <table id="tbl_items">
                    <tbody>
                        <tr class="template-row">
                            <td><input data-base-key="name" value="Default"></td>
                            <td><button class="remove-row-btn" style="visibility:hidden">x</button></td>
                        </tr>
                    </tbody>
                </table>
            `;
            const btn = document.createElement('button');
            ui.addTableRow(btn, 'items');

            const rows = document.querySelectorAll('#tbl_items tbody tr');
            expect(rows.length).toBe(2); // Template + New

            const newRow = rows[1] as HTMLElement;
            expect(newRow.classList.contains('template-row')).toBe(false);

            // Default value check
            const input = newRow.querySelector('input');
            expect(input?.value).toBe('Default'); // Copied from value attribute

            // Remove button visibility
            const rmBtn = newRow.querySelector('.remove-row-btn') as HTMLElement;
            expect(rmBtn.style.visibility).toBe('visible');
        });

        test("removeTableRow: removes row and triggers recalculate", () => {
            document.body.innerHTML = `
                <table id="tbl_items">
                    <tbody>
                        <tr class="template-row"><td><input value=""></td></tr>
                        <tr id="row-to-delete">
                            <td><input class="row-input" value="100"></td>
                            <td><button class="remove-btn">x</button></td>
                        </tr>
                    </tbody>
                </table>
                <input data-formula="SUM(row-input)" id="sum">
            `;
            const btn = document.querySelector('.remove-btn');
            ui.removeTableRow(btn);

            // Row should be gone
            expect(document.getElementById('row-to-delete')).toBeNull();

            // Recalculate should have run (sum passed to calcStub normally, but here we use real calc)
            // But verify calls calc.recalculate(). 
            // Since we passed real calc instance, let's check input "sum".
            // Remaining rows: template row (empty value). Sum should be 0.
            // (Note: Parser would normally ensure template row sums to 0 or ignored if value empty)
            const sum = document.getElementById('sum') as HTMLInputElement;
            // The template row input has value="" -> parseFloat("") is NaN -> sum skips it -> 0
            expect(sum.value).toBe('0');
        });

        test("autonum: renumbers rows on init, add, and remove", () => {
            document.body.innerHTML = `
                <table id="tbl_auto" class="data-table dynamic" data-table-key="auto">
                    <tbody>
                        <tr class="template-row">
                            <td><input class="form-input auto-num" value=""></td>
                            <td><button class="remove-row-btn">x</button></td>
                        </tr>
                    </tbody>
                </table>
            `;

            // 1. Init
            ui.initTables();
            const rows1 = document.querySelectorAll('#tbl_auto tbody tr');
            expect((rows1[0].querySelector('.auto-num') as HTMLInputElement).value).toBe('1');

            // 2. Add Row
            const btn = document.createElement('button');
            ui.addTableRow(btn, 'auto');

            const rows2 = document.querySelectorAll('#tbl_auto tbody tr');
            expect(rows2.length).toBe(2);
            expect((rows2[0].querySelector('.auto-num') as HTMLInputElement).value).toBe('1');
            expect((rows2[1].querySelector('.auto-num') as HTMLInputElement).value).toBe('2');

            // 3. Add 3rd Row and Remove 2nd
            ui.addTableRow(btn, 'auto');
            const rows3 = document.querySelectorAll('#tbl_auto tbody tr');
            expect((rows3[2].querySelector('.auto-num') as HTMLInputElement).value).toBe('3');

            const rmBtn = rows3[1].querySelector('.remove-row-btn');
            ui.removeTableRow(rmBtn);

            const rows4 = document.querySelectorAll('#tbl_auto tbody tr');
            expect(rows4.length).toBe(2);
            // Template is 1. The old 3rd row is now 2nd row -> should be 2.
            expect((rows4[1].querySelector('.auto-num') as HTMLInputElement).value).toBe('2');
        });
    });
});
