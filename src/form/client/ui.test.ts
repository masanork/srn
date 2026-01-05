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
(global as any).HTMLSelectElement = window.HTMLSelectElement;
(global as any).HTMLTextAreaElement = window.HTMLTextAreaElement;
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

    test("applyI18n: updates elements with data-i18n attribute", () => {
        document.body.innerHTML = `
            <button data-i18n="add_row"></button>
            <span data-i18n="sign_btn"></span>
        `;
        // Force Japanese locale for testing
        Object.defineProperty(global.navigator, 'language', { value: 'ja-JP', configurable: true });
        
        ui.applyI18n();
        expect(document.querySelector('[data-i18n="add_row"]')?.textContent).toBe('+ 行を追加');
        expect(document.querySelector('[data-i18n="sign_btn"]')?.textContent).toBe('確定');

        // Force English
        Object.defineProperty(global.navigator, 'language', { value: 'en-US', configurable: true });
        ui.applyI18n();
        expect(document.querySelector('[data-i18n="add_row"]')?.textContent).toBe('+ Add Row');
    });

    test("initTelFormatter: formats phone numbers and captures clean value", () => {
        document.body.innerHTML = `<input type="tel" value="09012345678">`;
        ui.initTelFormatter();
        const input = document.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('090-1234-5678');

        // Test manual input
        input.value = '0312345678';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(input.value).toBe('03-1234-5678');

        // Test blur cleans value
        input.dispatchEvent(new Event('blur'));
        expect(input.dataset.cleanValue).toBe('0312345678');
    });

    test("switchTab: switches active tab", () => {
        document.body.innerHTML = `
            <button class="tab-btn active" id="btn1"></button>
            <button class="tab-btn" id="btn2"></button>
            <div class="tab-content active" id="tab1"></div>
            <div class="tab-content" id="tab2"></div>
        `;
        const btn2 = document.getElementById('btn2');
        ui.switchTab(btn2, 'tab2');

        expect(document.getElementById('btn1')?.classList.contains('active')).toBe(false);
        expect(document.getElementById('btn2')?.classList.contains('active')).toBe(true);
        expect(document.getElementById('tab1')?.classList.contains('active')).toBe(false);
        expect(document.getElementById('tab2')?.classList.contains('active')).toBe(true);
    });

    test("addTableRow: performs auto-copy for data-copy-from fields", () => {
        document.body.innerHTML = `
            <table id="tbl_items">
                <tbody>
                    <tr class="template-row">
                        <td><input data-base-key="src" value="original"></td>
                        <td><input data-base-key="dest" data-copy-from="src" value=""></td>
                    </tr>
                </tbody>
            </table>
        `;
        // Set attribute value so it survives clone and reset logic in addTableRow
        const srcInput = document.querySelector('[data-base-key="src"]') as HTMLInputElement;
        srcInput.setAttribute('value', 'copied-value');

        ui.addTableRow(null, 'items');
        
        const rows = document.querySelectorAll('tbody tr');
        const destInput = rows[1].querySelector('[data-base-key="dest"]') as HTMLInputElement;
        expect(destInput.value).toBe('copied-value');
    });

    test("renumberRows: ignores empty rows without cells", () => {
        document.body.innerHTML = `
            <table id="tbl_auto" class="data-table dynamic" data-table-key="auto">
                <tbody>
                    <tr class="template-row">
                        <td><input class="form-input auto-num" value=""></td>
                    </tr>
                    <tr></tr> <!-- Empty row to be filtered out -->
                </tbody>
            </table>
        `;
        ui.initTables();
        const rows = document.querySelectorAll('tbody tr');
        expect(rows.length).toBe(2);
        // Only the first row should be renumbered
        expect((rows[0].querySelector('.auto-num') as HTMLInputElement).value).toBe('1');
    });

    test("updateSecurityBadge: updates UI on tier change", () => {
        document.body.innerHTML = `<div id="weba-security-signal"></div>`;
        // Force Japanese for consistent label check
        Object.defineProperty(global.navigator, 'language', { value: 'ja-JP', configurable: true });
        
        // Re-init UI to register listener in the new document context
        ui = new UIManager(calc, data);
        
        window.dispatchEvent(new CustomEvent('weba-security-tier-change', { detail: { tier: 'high' } }));
        
        const signal = document.getElementById('weba-security-signal');
        expect(signal?.textContent).toContain('セキュリティ: 最高');
        expect(signal?.className).toContain('tier-high');
        expect(signal?.querySelector('.status-dot')).not.toBeNull();
    });

    describe("updateVisibility", () => {
        test("simple equality: key == 'value'", () => {
            document.body.innerHTML = `
                <input data-json-path="trigger" value="yes">
                <div id="target" data-show-if="trigger == 'yes'">Content</div>
            `;
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).not.toBe('none');

            (document.querySelector('[data-json-path="trigger"]') as HTMLInputElement).value = 'no';
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).toBe('none');
        });

        test("truthy check: key", () => {
            document.body.innerHTML = `
                <input data-json-path="trigger" value="">
                <div id="target" data-show-if="trigger">Content</div>
            `;
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).toBe('none');

            (document.querySelector('[data-json-path="trigger"]') as HTMLInputElement).value = 'something';
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).not.toBe('none');
        });

        test("checkbox check", () => {
            document.body.innerHTML = `
                <input type="checkbox" data-json-path="trigger">
                <div id="target" data-show-if="trigger">Content</div>
            `;
            const checkbox = document.querySelector('[data-json-path="trigger"]') as HTMLInputElement;
            
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).toBe('none');

            checkbox.checked = true;
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).not.toBe('none');
        });

        test("radio group check", () => {
            document.body.innerHTML = `
                <input type="radio" name="opt" value="A" data-json-path="opt">
                <input type="radio" name="opt" value="B" data-json-path="opt" checked>
                <div id="target" data-show-if="opt == 'B'">Content</div>
            `;
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).not.toBe('none');

            const radioA = document.querySelector('input[value="A"]') as HTMLInputElement;
            const radioB = document.querySelector('input[value="B"]') as HTMLInputElement;
            radioB.checked = false;
            radioA.checked = true;
            
            ui.updateVisibility();
            expect(document.getElementById('target')?.style.display).toBe('none');
        });

        test("scoped lookup in table row", () => {
            document.body.innerHTML = `
                <table>
                    <tr>
                        <td><input data-json-path="col1" value="show"></td>
                        <td><div class="form-row"><div class="target" data-show-if="col1 == 'show'">In Row</div></div></td>
                    </tr>
                    <tr>
                        <td><input data-json-path="col1" value="hide"></td>
                        <td><div class="form-row"><div class="target" data-show-if="col1 == 'show'">Hidden</div></div></td>
                    </tr>
                </table>
            `;
            ui.updateVisibility();
            const rows = document.querySelectorAll('.form-row');
            expect((rows[0] as HTMLElement).style.display).not.toBe('none');
            expect((rows[1] as HTMLElement).style.display).toBe('none');
        });

        test("disables inputs when hidden", () => {
            document.body.innerHTML = `
                <input data-json-path="trigger" value="no">
                <div class="form-row">
                    <input id="target-input" data-show-if="trigger == 'yes'">
                </div>
            `;
            ui.updateVisibility();
            const input = document.getElementById('target-input') as HTMLInputElement;
            expect(input.disabled).toBe(true);

            (document.querySelector('[data-json-path="trigger"]') as HTMLInputElement).value = 'yes';
            ui.updateVisibility();
            expect(input.disabled).toBe(false);
        });
    });
});
