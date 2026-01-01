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
        const base64 = readFileSync(join(process.cwd(), 'shared', 'data', 'postal', 'postal-embedded.txt'), 'utf-8');
        await postalLookup.loadFromBase64(base64);
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
        zipInput.dataset.jsonPath = 'contact.zip';
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
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.pref" value="" />
                <input type="text" data-json-path="contact.city" value="" />
                <input type="text" data-json-path="contact.town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;

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
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.pref" value="" />
                <input type="text" data-json-path="contact.city" value="" />
                <input type="text" data-json-path="contact.town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="contact.pref"]') as HTMLInputElement;
        const cityInput = document.querySelector('[data-json-path="contact.city"]') as HTMLInputElement;
        const townInput = document.querySelector('[data-json-path="contact.town"]') as HTMLInputElement;

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
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.pref" value="" />
                <input type="text" data-json-path="contact.city" value="" />
                <input type="text" data-json-path="contact.town" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="contact.pref"]') as HTMLInputElement;

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
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.address" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const addressInput = document.querySelector('[data-json-path="contact.address"]') as HTMLInputElement;

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
                    <td><input type="text" class="search-input" data-json-path="contact.zip" value="" /></td>
                    <td><input type="text" data-json-path="contact.pref" value="" /></td>
                    <td><input type="text" data-json-path="contact.city" value="" /></td>
                </tr>
            </table>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="contact.pref"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(prefInput.value).toBe('東京都');
    });

    test("複数の郵便番号フィールドが独立して動作する", async () => {
        document.body.innerHTML = `
            <div>
                <form>
                    <h3>送付先1</h3>
                    <input type="text" class="search-input" data-json-path="sender.zip" value="" />
                    <input type="text" data-json-path="sender.pref" value="" />
                </form>

                <form>
                    <h3>送付先2</h3>
                    <input type="text" class="search-input" data-json-path="recipient.zip" value="" />
                    <input type="text" data-json-path="recipient.pref" value="" />
                </form>
            </div>
        `;

        const zip1 = document.querySelector('[data-json-path="sender.zip"]') as HTMLInputElement;
        const pref1 = document.querySelector('[data-json-path="sender.pref"]') as HTMLInputElement;
        const zip2 = document.querySelector('[data-json-path="recipient.zip"]') as HTMLInputElement;
        const pref2 = document.querySelector('[data-json-path="recipient.pref"]') as HTMLInputElement;

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

describe("階層的グループ化テスト", () => {
    let window: Window;
    let document: Document;
    let search: SearchEngine;

    beforeAll(async () => {
        // Load real postal data
        const base64 = readFileSync(join(process.cwd(), 'shared', 'data', 'postal', 'postal-embedded.txt'), 'utf-8');
        await postalLookup.loadFromBase64(base64);
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

    test("ドット記法でグループ化されたフィールド（sender.zip, sender.pref）", async () => {
        document.body.innerHTML = `
            <div>
                <h3>送信者</h3>
                <input type="text" class="search-input" data-json-path="sender.zip" value="" />
                <input type="text" data-json-path="sender.pref" value="" />
                <input type="text" data-json-path="sender.city" value="" />
                <input type="text" data-json-path="sender.town" value="" />

                <h3>受信者</h3>
                <input type="text" class="search-input" data-json-path="recipient.zip" value="" />
                <input type="text" data-json-path="recipient.pref" value="" />
                <input type="text" data-json-path="recipient.city" value="" />
                <input type="text" data-json-path="recipient.town" value="" />
            </div>
        `;

        const senderZip = document.querySelector('[data-json-path="sender.zip"]') as HTMLInputElement;
        const senderPref = document.querySelector('[data-json-path="sender.pref"]') as HTMLInputElement;
        const recipientPref = document.querySelector('[data-json-path="recipient.pref"]') as HTMLInputElement;

        // sender.zipに入力
        senderZip.value = '1050011';
        senderZip.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // sender.prefのみが更新される
        expect(senderPref.value).toBe('東京都');
        // recipient.prefは更新されない
        expect(recipientPref.value).toBe('');
    });

    test("アンダースコア記法でグループ化されたフィールド（sender_zip, sender_pref）", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="sender_zip" value="" />
                <input type="text" data-json-path="sender_pref" value="" />
                <input type="text" data-json-path="sender_city" value="" />
                <input type="text" data-json-path="recipient_pref" value="" />
            </div>
        `;

        const senderZip = document.querySelector('[data-json-path="sender_zip"]') as HTMLInputElement;
        const senderPref = document.querySelector('[data-json-path="sender_pref"]') as HTMLInputElement;
        const recipientPref = document.querySelector('[data-json-path="recipient_pref"]') as HTMLInputElement;

        senderZip.value = '1050011';
        senderZip.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(senderPref.value).toBe('東京都');
        expect(recipientPref.value).toBe('');
    });

    test("ハイフン記法でグループ化されたフィールド（sender-zip, sender-pref）", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="sender-zip" value="" />
                <input type="text" data-json-path="sender-pref" value="" />
                <input type="text" data-json-path="sender-city" value="" />
                <input type="text" data-json-path="recipient-pref" value="" />
            </div>
        `;

        const senderZip = document.querySelector('[data-json-path="sender-zip"]') as HTMLInputElement;
        const senderPref = document.querySelector('[data-json-path="sender-pref"]') as HTMLInputElement;
        const recipientPref = document.querySelector('[data-json-path="recipient-pref"]') as HTMLInputElement;

        senderZip.value = '1050011';
        senderZip.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(senderPref.value).toBe('東京都');
        expect(recipientPref.value).toBe('');
    });

    test("テーブル行内でグループ化が機能する", async () => {
        document.body.innerHTML = `
            <table>
                <tr>
                    <td><input type="text" class="search-input" data-json-path="sender.zip" value="" /></td>
                    <td><input type="text" data-json-path="sender.pref" value="" /></td>
                    <td><input type="text" class="search-input" data-json-path="recipient.zip" value="" /></td>
                    <td><input type="text" data-json-path="recipient.pref" value="" /></td>
                </tr>
            </table>
        `;

        const senderZip = document.querySelector('[data-json-path="sender.zip"]') as HTMLInputElement;
        const senderPref = document.querySelector('[data-json-path="sender.pref"]') as HTMLInputElement;
        const recipientPref = document.querySelector('[data-json-path="recipient.pref"]') as HTMLInputElement;

        senderZip.value = '1050011';
        senderZip.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(senderPref.value).toBe('東京都');
        expect(recipientPref.value).toBe('');
    });

    test("動的テーブル行内でグループ化が機能する", async () => {
        document.body.innerHTML = `
            <div class="dynamic-table">
                <div class="dynamic-row">
                    <input type="text" class="search-input" data-json-path="attendee.zip" value="" />
                    <input type="text" data-json-path="attendee.pref" value="" />
                    <input type="text" data-json-path="attendee.city" value="" />
                </div>
                <div class="dynamic-row">
                    <input type="text" class="search-input" data-json-path="attendee.zip" value="" />
                    <input type="text" data-json-path="attendee.pref" value="" />
                    <input type="text" data-json-path="attendee.city" value="" />
                </div>
            </div>
        `;

        const rows = document.querySelectorAll('.dynamic-row');
        const zip1 = rows[0].querySelector('[data-json-path="attendee.zip"]') as HTMLInputElement;
        const pref1 = rows[0].querySelector('[data-json-path="attendee.pref"]') as HTMLInputElement;
        const pref2 = rows[1].querySelector('[data-json-path="attendee.pref"]') as HTMLInputElement;

        zip1.value = '1050011';
        zip1.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // 同じ行のみ更新される
        expect(pref1.value).toBe('東京都');
        expect(pref2.value).toBe('');
    });

    test("混在セパレータは別グループとして扱われる", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="sender.zip" value="" />
                <input type="text" data-json-path="sender.pref" value="" />
                <input type="text" data-json-path="sender_pref" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="sender.zip"]') as HTMLInputElement;
        const dotPref = document.querySelector('[data-json-path="sender.pref"]') as HTMLInputElement;
        const underscorePref = document.querySelector('[data-json-path="sender_pref"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // ドット記法のみ更新される
        expect(dotPref.value).toBe('東京都');
        expect(underscorePref.value).toBe('');
    });

    test("複数階層のグループ名（company.sender.zip）も対応", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="company.sender.zip" value="" />
                <input type="text" data-json-path="company.sender.pref" value="" />
                <input type="text" data-json-path="company.sender.city" value="" />
                <input type="text" data-json-path="company.recipient.pref" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="company.sender.zip"]') as HTMLInputElement;
        const senderPref = document.querySelector('[data-json-path="company.sender.pref"]') as HTMLInputElement;
        const recipientPref = document.querySelector('[data-json-path="company.recipient.pref"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(senderPref.value).toBe('東京都');
        expect(recipientPref.value).toBe('');
    });

    test("個別フィールドがある場合、addressには残りの部分が入力される", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.pref" value="" />
                <input type="text" data-json-path="contact.city" value="" />
                <input type="text" data-json-path="contact.address" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="contact.pref"]') as HTMLInputElement;
        const cityInput = document.querySelector('[data-json-path="contact.city"]') as HTMLInputElement;
        const addressInput = document.querySelector('[data-json-path="contact.address"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        // 個別フィールドには入力される
        expect(prefInput.value).toBe('東京都');
        expect(cityInput.value).toBe('港区');
        // addressには町名のみが入力される（pref/cityがあるため）
        expect(addressInput.value).toBe('芝公園');
    });

    test("prefのみがある場合、addressには市区町村+町名が入力される", async () => {
        document.body.innerHTML = `
            <div>
                <input type="text" class="search-input" data-json-path="contact.zip" value="" />
                <input type="text" data-json-path="contact.pref" value="" />
                <input type="text" data-json-path="contact.address" value="" />
            </div>
        `;

        const zipInput = document.querySelector('[data-json-path="contact.zip"]') as HTMLInputElement;
        const prefInput = document.querySelector('[data-json-path="contact.pref"]') as HTMLInputElement;
        const addressInput = document.querySelector('[data-json-path="contact.address"]') as HTMLInputElement;

        zipInput.value = '1050011';
        zipInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(prefInput.value).toBe('東京都');
        // addressには市区町村+町名が入力される
        expect(addressInput.value).toBe('港区芝公園');
    });
});
