import { describe, test, expect, beforeEach, mock } from "bun:test";
import { Window } from 'happy-dom';
import { DataManager } from './data';

// Setup global environment
const window = new Window({
    url: 'http://localhost:3000/form/1',
});
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLInputElement = window.HTMLInputElement;
(global as any).Event = window.Event;
(global as any).Blob = window.Blob;
(global as any).URL = window.URL;
(global as any).DOMParser = window.DOMParser;

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
(global as any).localStorage = localStorageMock;

// Mock URL.createObjectURL and HTMLAnchorElement.click
(global as any).URL.createObjectURL = mock(() => "blob:test-url");
const clickMock = mock(() => { });

if (window.HTMLAnchorElement) {
    window.HTMLAnchorElement.prototype.click = clickMock;
} else {
    // Fallback for environment where HTMLAnchorElement might not be fully exposed
    (global as any).HTMLAnchorElement = class {
        click() { clickMock(); }
    };
}

// Mock window.location.reload
const reloadMock = mock(() => { });
Object.defineProperty(window.location, 'reload', {
    configurable: true,
    value: reloadMock
});

// Mock window.confirm
const confirmMock = mock(() => true);
(global as any).confirm = confirmMock;


describe("Web/A Client Runtime > Data Manager", () => {
    let dataMgr: DataManager;

    beforeEach(() => {
        document.body.innerHTML = '';
        localStorageMock.clear();
        (window as any).generatedJsonStructure = { name: 'TestForm' };
        dataMgr = new DataManager();
        // Reset mocks
        clickMock.mockClear();
        reloadMock.mockClear();
        confirmMock.mockClear();
    });

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

    test("saveToLS: saves data to localStorage", () => {
        document.body.innerHTML = `<input data-json-path="foo" value="bar">`;
        dataMgr.saveToLS();
        const stored = localStorageMock.getItem('WebA_/form/1');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.foo).toBe('bar');
    });

    test("restoreFromLS: restores data from localStorage", () => {
        const savedData = {
            "customer.name": "Restored Name",
            "items": [{ "item": "Restored Item" }]
        };
        localStorageMock.setItem('WebA_/form/1', JSON.stringify(savedData));

        document.body.innerHTML = `
            <input data-json-path="customer.name" value="">
            <table class="data-table dynamic" data-table-key="items">
                <tbody>
                    <tr class="template-row"><td><input data-base-key="item" value=""></td></tr>
                </tbody>
            </table>
        `;

        dataMgr.restoreFromLS();

        const input = document.querySelector('[data-json-path="customer.name"]') as HTMLInputElement;
        expect(input.value).toBe("Restored Name");

        // Table restoration logic: Should add a row (since template is row 0)
        // Actually, restore logic handles cloning.
        // Let's check if the first row (template position, or restored position) is filled.
        // implementation detail: restoreFromLS iterates rowsData.
        // idx 0 -> fills template row.
        const tableInput = document.querySelector('[data-base-key="item"]') as HTMLInputElement;
        expect(tableInput.value).toBe("Restored Item");
    });

    test("clearData: removes from localStorage and reloads", () => {
        localStorageMock.setItem('WebA_/form/1', '{"foo":"bar"}');
        dataMgr.clearData();

        expect(confirmMock).toHaveBeenCalled();
        expect(localStorageMock.getItem('WebA_/form/1')).toBeNull();
        expect(reloadMock).toHaveBeenCalled();
    });

    test("bakeValues: updates value attribute in DOM", () => {
        document.body.innerHTML = `<input id="bakeme" value="test">`;
        const input = document.getElementById('bakeme') as HTMLInputElement;
        // set value property (DOM state)
        input.value = "new value";
        // attribute is still "test" or null
        expect(input.getAttribute('value')).toBe('test');

        dataMgr.bakeValues();

        expect(input.getAttribute('value')).toBe('new value');
    });

    test("saveDraft: triggers download", () => {
        document.body.innerHTML = `<input value="draft">`;
        dataMgr.saveDraft();
        expect(clickMock).toHaveBeenCalled();
    });

    test("submitDocument: triggers download and reload", async () => {
        document.body.innerHTML = `<input value="submit">`;
        dataMgr.submitDocument();
        expect(clickMock).toHaveBeenCalled();

        // Wait for timeout in submitDocument
        await new Promise(r => setTimeout(r, 1100));
        expect(reloadMock).toHaveBeenCalled();
    });
});
