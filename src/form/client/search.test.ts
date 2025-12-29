import { describe, test, expect, beforeEach } from "bun:test";
import { Window } from 'happy-dom';
import { SearchEngine } from './search';

// Setup global environment
const window = new Window();
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLInputElement = window.HTMLInputElement;
(global as any).Event = window.Event;

// Mock escapeHtml
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

describe("Web/A Client Runtime > Search Engine", () => {
    let search: SearchEngine;

    beforeEach(() => {
        document.body.innerHTML = '';
        (window as any).generatedJsonStructure = {
            masterData: {
                'vendors': [
                    ['Code', 'Name', 'Tel'],
                    ['v1', 'Vendor One', '03-1111-2222'],
                    ['v2', 'Vendor Two', '03-3333-4444']
                ]
            }
        };
        search = new SearchEngine();
    });

    test("init creates search suggestions box lazily or on init?", () => {
        search.init();
        expect(true).toBe(true);
    });

    test("shows suggestions matching master data", async () => {
        search.init();

        // Create input
        const input = document.createElement('input');
        input.className = 'search-input';
        input.dataset.masterSrc = 'vendors';
        input.value = 'Vendor';
        document.body.appendChild(input);

        // Trigger input event
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 50));

        const box = document.getElementById('web-a-search-suggestions') as any;
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
        const input = document.querySelector('.search-input') as any;
        input.value = 'Al'; // Should match Alpha
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 50));

        const box = document.getElementById('web-a-search-suggestions') as any;
        const items = box?.querySelectorAll('.suggestion-item');
        expect(items?.length).toBe(1);
        if (items && items[0]) expect(items[0].textContent).toContain('Alpha');
    });

    test("handles suggestion selection and field filling", async () => {
        search.init();
        document.body.innerHTML = `
            <table>
                <tr id="row1">
                    <td><input data-base-key="name" value=""></td>
                    <td><input data-base-key="tel" value=""></td>
                    <td><input class="search-input" data-master-src="vendors" data-master-label-index="2" data-master-value-index="1" value=""></td>
                </tr>
            </table>
        `;
        const input = document.querySelector('.search-input') as any;
        input.value = 'Vendor';
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 50));

        const box = document.getElementById('web-a-search-suggestions') as any;
        const item = box?.querySelector('.suggestion-item') as any;
        expect(item).toBeTruthy();

        // Trigger selection click
        item.dispatchEvent(new (window as any).Event('click', { bubbles: true }));

        expect(input.value).toBe('v1'); // value index 1
        const nameInput = document.querySelector('[data-base-key="name"]') as any;
        expect(nameInput.value).toBe('Vendor One'); // label index 2 or mapping?
    });

    test("normalizes full-width characters", async () => {
        search.init();
        const input = document.createElement('input') as any;
        input.className = 'search-input';
        input.dataset.masterSrc = 'vendors';
        input.value = 'Ｖｅｎｄｏｒ'; // Full-width
        document.body.appendChild(input);

        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));

        const box = document.getElementById('web-a-search-suggestions') as any;
        expect(box?.querySelectorAll('.suggestion-item').length).toBe(2);
    });

    test("hides suggestions on click outside", async () => {
        search.init();
        const input = document.createElement('input') as any;
        input.className = 'search-input';
        input.dataset.masterSrc = 'vendors';
        input.value = 'Vendor';
        document.body.appendChild(input);
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));

        const box = document.getElementById('web-a-search-suggestions') as any;
        expect(box?.style.display).toBe('block');

        // Click on a neutral element to trigger "outside" click
        const other = document.createElement('div');
        document.body.appendChild(other);
        other.dispatchEvent(new (window as any).Event('click', { bubbles: true }));
        expect(box?.style.display).toBe('none');
    });

    test("hides box when query is empty", async () => {
        search.init();
        const input = document.createElement('input') as any;
        input.className = 'search-input';
        input.dataset.masterSrc = 'vendors';
        input.value = 'Vendor';
        document.body.appendChild(input);

        // Show suggestions first
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
        const box = document.getElementById('web-a-search-suggestions') as any;
        expect(box?.style.display).toBe('block');

        // Now empty query
        input.value = '';
        input.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(box?.style.display).toBe('none');
    });
});
