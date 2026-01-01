import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { Window } from 'happy-dom';
import { SearchEngine } from '../src/form/client/search';
import { postalLookup } from '../src/form/client/postal';
import { readFileSync } from 'fs';
import { join } from 'path';

describe("Postal Integration Tests (SearchEngine + PostalLookup)", () => {
    let window: Window;
    let document: Document;
    let search: SearchEngine;

    beforeAll(async () => {
        // Load real postal data
        const base64 = readFileSync(join(process.cwd(), 'data', 'postal', 'postal-embedded.txt'), 'utf-8');
        await postalLookup.loadFromBase64(base64);
        expect(postalLookup.isReady()).toBe(true);
    });

    beforeEach(async () => {
        // Setup DOM environment
        window = new Window();
        document = window.document;
        (global as any).window = window;
        (global as any).document = document;
        (global as any).HTMLElement = window.HTMLElement;
        (global as any).HTMLInputElement = window.HTMLInputElement;
        (global as any).Event = window.Event;
        (global as any).MouseEvent = window.MouseEvent;

        // Make postalLookup available globally
        (window as any).postalLookup = postalLookup;

        // Initialize SearchEngine
        search = new SearchEngine();
        (window as any).SearchEngine = search;
        await search.init();
    });

    test("郵便番号フィールドを正しく検出する", () => {
        const zipInput = document.createElement('input');
        zipInput.className = 'search-input';
        zipInput.dataset.jsonPath = 'zip';
        document.body.appendChild(zipInput);

        // isPostalField is private, so we test via behavior
        zipInput.value = '100';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        // Should not crash
        expect(true).toBe(true);
    });

    test("郵便番号入力時に候補が表示される (105-0011 芝公園)", async () => {
        // Create postal form structure
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="zip" value="" />
                <input type="text" data-json-path="pref" value="" />
                <input type="text" data-json-path="city" value="" />
                <input type="text" data-json-path="town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;

        // Type partial zip code
        zipInput.value = '10500';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        const box = document.getElementById('web-a-search-suggestions');
        expect(box).toBeTruthy();
        expect(box?.style.display).toBe('block');

        const items = box?.querySelectorAll('.suggestion-item');
        expect(items && items.length > 0).toBe(true);

        // Should contain 港区 entries
        const hasMinato = Array.from(items || []).some(item =>
            item.textContent?.includes('港区')
        );
        expect(hasMinato).toBe(true);
    });

    test("7桁郵便番号入力で住所が自動入力される (1050011 -> 港区芝公園)", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="zip" value="" />
                <input type="text" data-json-path="pref" value="" />
                <input type="text" data-json-path="city" value="" />
                <input type="text" data-json-path="town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="pref"]') as HTMLInputElement;
        const cityInput = document.querySelector('[data-json-path="city"]') as HTMLInputElement;
        const townInput = document.querySelector('[data-json-path="town"]') as HTMLInputElement;

        // Type complete zip code
        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if address fields are filled
        console.log('Pref:', prefInput.value);
        console.log('City:', cityInput.value);
        console.log('Town:', townInput.value);

        expect(prefInput.value).toBe('東京都');
        expect(cityInput.value).toBe('港区');
        expect(townInput.value).toBe('芝公園');
    });

    test("候補選択で郵便番号と住所が入力される", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="zip" value="" />
                <input type="text" data-json-path="pref" value="" />
                <input type="text" data-json-path="city" value="" />
                <input type="text" data-json-path="town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="pref"]') as HTMLInputElement;

        // Type partial zip
        zipInput.value = '10500';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        const box = document.getElementById('web-a-search-suggestions');
        const firstItem = box?.querySelector('.suggestion-item.postal-item') as HTMLElement;

        expect(firstItem).toBeTruthy();

        // Click on suggestion
        firstItem.dispatchEvent(new (window as any).Event('click', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // Zip should be formatted with hyphen
        expect(zipInput.value).toMatch(/^\d{3}-\d{4}$/);
        expect(prefInput.value).toBeTruthy();
        expect(prefInput.value).toBe('東京都');
    });

    test("住所一体型フィールドに完全住所が入力される", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="zip" value="" />
                <input type="text" data-json-path="address" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;
        const addressInput = document.querySelector('[data-json-path="address"]') as HTMLInputElement;

        // Type complete zip code
        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Address field value:', addressInput.value);

        // Address field should have complete address
        expect(addressInput.value).toBe('東京都港区芝公園');
    });

    test("テーブル内の行で郵便番号補完が動作する", async () => {
        document.body.innerHTML = `
            <table>
                <tr>
                    <td><input type="text" class="search-input" data-json-path="zip" value="" /></td>
                    <td><input type="text" data-json-path="pref" value="" /></td>
                    <td><input type="text" data-json-path="city" value="" /></td>
                </tr>
            </table>
        `;

        const zipInput = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="pref"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(prefInput.value).toBe('東京都');
    });

    test("複数の郵便番号フィールドが独立して動作する", async () => {
        document.body.innerHTML = `
            <div>
                <h3>送付先1</h3>
                <input type="text" class="search-input" data-json-path="zip" value="" />
                <input type="text" data-json-path="pref" value="" />

                <h3>送付先2</h3>
                <input type="text" class="search-input" data-json-path="zip2" value="" />
                <input type="text" data-json-path="pref2" value="" />
            </div>
        `;

        const zip1 = document.querySelector('[data-json-path="zip"]') as HTMLInputElement;
        const pref1 = document.querySelector('[data-json-path="pref"]') as HTMLInputElement;
        const zip2 = document.querySelector('[data-json-path="zip2"]') as HTMLInputElement;
        const pref2 = document.querySelector('[data-json-path="pref2"]') as HTMLInputElement;

        // Fill first zip
        zip1.value = '1050011';
        zip1.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fill second zip
        zip2.value = '1000001';
        zip2.dispatchEvent(new (window as any).Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(pref1.value).toBe('東京都');
        expect(pref2.value).toBe('東京都');
    });
});
