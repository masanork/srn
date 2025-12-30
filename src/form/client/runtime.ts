
import { Calculator } from './calculator';
import { DataManager } from './data';
import { UIManager } from './ui';
import { SearchEngine } from './search'; // Ensure Search is available if needed, though index.ts instantiates it
import { loadL2Config } from './l2crypto';
import { initL2Viewer } from './l2viewer';
import { initKeywrapTool } from './keywrap_tool';
import { initAggregatorBrowser } from './aggregator_browser';

type DraftState = {
    version?: number;
    savedAt?: string;
    formId?: string;
    formData?: unknown;
    l2State?: {
        replayNonces?: string[];
    };
};

const L2_REPLAY_STORE_KEY = "weba_l2_nonces";

function loadDraftState(): DraftState | null {
    const script = document.getElementById('weba-draft-state');
    if (!script?.textContent) return null;
    try {
        return JSON.parse(script.textContent) as DraftState;
    } catch (e) {
        console.warn('Failed to parse draft state', e);
        return null;
    }
}

function seedDraftState(state: DraftState | null) {
    if (!state || !state.formData) return;
    const formKey = "WebA_" + window.location.pathname;
    try {
        localStorage.setItem(formKey, JSON.stringify(state.formData));
    } catch (e) {
        console.warn('Failed to restore draft form data', e);
    }
    if (state.l2State?.replayNonces?.length) {
        try {
            const existingRaw = localStorage.getItem(L2_REPLAY_STORE_KEY);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const merged = new Set<string>();
            if (Array.isArray(existing)) {
                existing.forEach((value) => {
                    if (typeof value === "string") merged.add(value);
                });
            }
            state.l2State.replayNonces.forEach((value) => {
                if (typeof value === "string") merged.add(value);
            });
            localStorage.setItem(L2_REPLAY_STORE_KEY, JSON.stringify(Array.from(merged)));
        } catch (e) {
            console.warn('Failed to restore draft L2 replay store', e);
        }
    }
}

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
    seedDraftState(loadDraftState());
    data.restoreFromLS();
    ui.applyI18n();
    ui.initTables();
    calc.recalculate(); // This also runs runAutoCopy
    initL2Viewer();
    initKeywrapTool();
    initAggregatorBrowser();

    // Inject Security Signal Element
    if (l2Config?.enabled) {
        const toolbar = document.querySelector('.form-toolbar');
        if (toolbar) {
            const signal = document.createElement('div');
            signal.id = 'weba-security-signal';
            signal.className = 'security-badge';
            signal.textContent = 'Initializing Security...';
            toolbar.appendChild(signal);

            // Initial proactive check
            (async () => {
                let initialTier: 'high' | 'standard' | 'offline' = 'offline';
                if (l2Config.prekey_url) {
                    try {
                        const res = await fetch(l2Config.prekey_url, { method: 'HEAD' });
                        if (res.ok) initialTier = 'high';
                    } catch { }
                }
                if (initialTier === 'offline' && l2Config.epoch_registry_url) {
                    try {
                        const res = await fetch(l2Config.epoch_registry_url, { method: 'HEAD' });
                        if (res.ok) initialTier = 'standard';
                    } catch { }
                }
                // Dispatch event to update UI
                window.dispatchEvent(new CustomEvent('weba-security-tier-change', { detail: { tier: initialTier } }));
            })();
        }
    }

    // Inject Guest DID Checkbox (if L2 enabled and Passkey supported)
    if (l2Config?.enabled && (window as any).PublicKeyCredential) {
        const submitBtn = document.querySelector('button[onclick*="signAndDownload"]');
        if (submitBtn && submitBtn.parentElement) {
            const container = submitBtn.parentElement;

            const guestOptContainer = document.createElement('div');
            guestOptContainer.className = 'weba-guest-opt no-print';
            guestOptContainer.style.display = 'flex';
            guestOptContainer.style.alignItems = 'center';
            guestOptContainer.style.gap = '6px';
            guestOptContainer.style.marginRight = '12px'; // Spacing from buttons

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'weba-guest-did-opt';
            checkbox.style.cursor = 'pointer';

            const label = document.createElement('label');
            label.htmlFor = 'weba-guest-did-opt';
            label.textContent = '返信を受け取る (Passkey)';
            label.style.fontSize = '13px';
            label.style.fontWeight = '500';
            label.style.color = '#555';
            label.style.cursor = 'pointer';
            label.style.userSelect = 'none';

            guestOptContainer.appendChild(checkbox);
            guestOptContainer.appendChild(label);

            // Insert before the first button (typically Clear button)
            const firstBtn = container.querySelector('button');
            if (firstBtn) {
                container.insertBefore(guestOptContainer, firstBtn);
            } else {
                container.appendChild(guestOptContainer);
            }
        }
    }

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
