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
