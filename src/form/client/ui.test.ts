import { describe, test, expect, beforeEach } from "bun:test";
import { Window } from 'happy-dom';
import { UIManager } from './ui';
import { Calculator } from './calculator';
import { DataManager } from './data';

// Setup global environment
const window = new Window();
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLInputElement = window.HTMLInputElement;
(global as any).Event = window.Event;
(global as any).navigator = window.navigator;

describe("Web/A Client Runtime > UI Manager", () => {
    let ui: UIManager;
    let calc: Calculator;
    let data: DataManager;

    beforeEach(() => {
        document.body.innerHTML = '';
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
        expect(input?.value).toBe('Default');

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

        // Recalculate check
        const sum = document.getElementById('sum') as HTMLInputElement;
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
