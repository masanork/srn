
import { Calculator } from './calculator';
import { DataManager } from './data';
import { UIManager } from './ui';
import { SearchEngine } from './search'; // Ensure Search is available if needed, though index.ts instantiates it
import { loadL2Config } from './l2crypto';

export function initRuntime() {
    console.log("Web/A Runtime Booting...");

    const calc = new Calculator();
    const data = new DataManager();
    const ui = new UIManager(calc, data);

    // Bind Globals for HTML onclick handlers
    const w = window as any;

    const structureScript = document.getElementById('weba-structure');
    if (structureScript?.textContent) {
        try {
            w.generatedJsonStructure = JSON.parse(structureScript.textContent);
        } catch (e) {
            console.warn('Failed to parse weba structure JSON', e);
        }
    }

    const l2Config = loadL2Config();
    if (l2Config) {
        w.webaL2Config = l2Config;
    }

    w.saveDraft = () => data.saveDraft();
    w.submitDocument = () => data.submitDocument();
    w.signAndDownload = () => data.signAndDownload();
    w.clearData = () => data.clearData();
    w.removeTableRow = (btn: any) => ui.removeTableRow(btn);
    w.addTableRow = (btn: any, tableKey: string) => ui.addTableRow(btn, tableKey);
    w.switchTab = (btn: any, tabId: string) => ui.switchTab(btn, tabId);
    w.recalculate = () => calc.recalculate(); // For Maker preview or debugging
    w.escapeHtml = (str: string) => {
        if (!str) return '';
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return str.toString().replace(/[&<>"']/g, (m) => map[m] || m);
    };

    // Initial Setup
    data.restoreFromLS();
    ui.applyI18n();
    ui.initTables();
    calc.recalculate(); // This also runs runAutoCopy

    // Global Input Listener
    let tm: any;
    document.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        if (e.isTrusted) {
            input.dataset.dirty = 'true';
        }

        // Auto-Copy Logic (Optimized for specific input)
        const key = input.dataset.baseKey || input.dataset.jsonPath;
        if (key) {
            const row = input.closest('tr');
            const scope = row || document;
            scope.querySelectorAll(`[data-copy-from="${key}"]`).forEach((dest: any) => {
                // Only copy if destination hasn't been manually edited (dirty)
                if (!dest.dataset.dirty) {
                    if (dest.value !== input.value) {
                        dest.value = input.value;
                        // Trigger input on destination to propagate further (chains) and recalc
                        dest.dispatchEvent(new Event('input'));
                    }
                }
            });
        }

        calc.recalculate();
        data.updateJsonLd();
        clearTimeout(tm); tm = setTimeout(() => data.saveToLS(), 1000);
    });

    console.log("Web/A Runtime Ready.");
}
