import { Calculator } from './calculator';
import { DataManager } from './data';
import { UIManager } from './ui';
import type { PostalRecord } from './postal';

/**
 * Web/A Runtime Core
 */
export function initRuntime() {
    console.log("Web/A Runtime Booting...");
    const calc = new Calculator();
    const dm = new DataManager();
    const uim = new UIManager(calc, dm);
    const w = window as any;

    // --- 1. Modular Feature Initializers ---
    const initPostal = () => {
        if (w.postalLookup && !w.__postalInitialized) {
            w.__postalInitialized = true;
            w.postalLookup.autoInit().then(() => console.log("📮 Postal lookup ready."));
        }
    };

    // --- 2. Load Data Islands (Async Gzip support) ---
    const structureScript = document.getElementById('weba-structure') as HTMLScriptElement;
    if (structureScript) {
        tryLoadJson(structureScript).then(s => {
            if (s) {
                w.generatedJsonStructure = s;
                uim.applyI18n(); calc.recalculate(); uim.updateVisibility();
            }
        });
    }
    const l2ConfigEl = document.getElementById("weba-l2-config") as HTMLScriptElement;
    if (l2ConfigEl) {
        tryLoadJson(l2ConfigEl).then(c => {
            if (c) {
                w.webaL2Config = c;
                initSecuritySignal(c); initGuestDidOpt(c);
            }
        });
    }

    // --- 3. Global Action Bindings ---
    w.saveDraft = () => dm.saveDraft();
    w.submitDocument = () => dm.submitDocument();
    w.signAndDownload = () => dm.signAndDownload();
    w.clearData = () => dm.clearData();
    w.removeTableRow = (btn: any) => uim.removeTableRow(btn);
    w.addTableRow = (btn: any, tableKey: string) => uim.addTableRow(btn, tableKey);
    w.switchTab = (btn: any, tabId: string) => uim.switchTab(btn, tabId);
    w.recalculate = () => calc.recalculate();

    // --- 4. Startup Sequences ---
    dm.restoreFromLS();
    uim.applyI18n();
    uim.initTables();
    calc.recalculate();

    if (w.initL2Viewer) w.initL2Viewer();
    if (w.initKeywrapTool) w.initKeywrapTool();
    if (w.initAggregatorBrowser) w.initAggregatorBrowser();
    initPostal();

    // --- 5. Global Event Handling ---
    let tm: any;
    document.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        if (!input || input.tagName !== 'INPUT') return;
        if (e.isTrusted) input.dataset.dirty = 'true';

        const key = (input.dataset.jsonPath || input.name || '').toLowerCase();
        const val = input.value.trim();
        const postal = w.postalLookup;

        // A. Postal & Address Suggestions (Datalist based)
        if (postal && postal.isReady()) {
            const isZipField = key.match(/zip|postal|postcode|郵便/) && !key.match(/pref|city|town|address|都道府県|市区町村|住所/);
            const isAddrField = key.match(/pref|city|town|address|都道府県|市区町村|住所/);

            if (isZipField || isAddrField) {
                // Ensure datalist exists (Support dynamic rows)
                let listId = input.getAttribute('list');
                if (!listId) {
                    listId = `dl-${Math.random().toString(36).substr(2, 5)}`;
                    input.setAttribute('list', listId);
                    const dl = document.createElement('datalist'); dl.id = listId; document.body.appendChild(dl);
                }
                const datalist = document.getElementById(listId);

                if (isZipField) {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    if (datalist && cleanVal.length >= 3) {
                        const candidates = postal.suggest(cleanVal, 50) as PostalRecord[];
                        datalist.innerHTML = candidates.map(c => `<option value="${c.zip.substring(0, 3)}-${c.zip.substring(3)}">${c.pref}${c.city}${c.town}</option><option value="${c.zip}">${c.pref}${c.city}${c.town}</option>`).join('');
                    }
                    if (cleanVal.length === 7) {
                        const addr = postal.lookup(cleanVal);
                        if (addr) fillAddress(input, addr, input.closest('tr') || input.closest('.dynamic-row') || input.closest('.address-group') || input.closest('table') || input.closest('form') || document.body);
                    }
                } else if (isAddrField) {
                    if (datalist && val.length >= 2) {
                        const candidates = postal.suggestByAddress(val, 30) as PostalRecord[];
                        datalist.innerHTML = candidates.map(c => `<option value="${c.pref}${c.city}${c.town}">${c.zip} ${c.pref}${c.city}${c.town}</option>`).join('');
                    }
                    if (val.length >= 5) {
                        const candidates = postal.suggestByAddress(val, 5);
                        const exactMatch = candidates.find((c: PostalRecord) => `${c.pref}${c.city}${c.town}` === val);
                        if (exactMatch) fillAddress(input, exactMatch, input.closest('tr') || input.closest('.dynamic-row') || input.closest('.address-group') || input.closest('table') || input.closest('form') || document.body, true);
                    }
                }
            }
        }

        // B. Master Data Search (Support for Medical Expense Demo etc.)
        if (input.classList.contains('search-input') && w.SearchEngine) {
            // If SearchEngine is globally available, the individual module for search (form-search.js) 
            // should have attached its own listeners or we trigger it here.
        }

        // C. Data-Copy & Recalculation
        if (key) {
            const scope = input.closest('tr') || input.closest('.dynamic-row') || input.closest('.group') || document;
            scope.querySelectorAll(`[data-copy-from="${key}"]`).forEach((dest: any) => {
                if (!dest.dataset.dirty && dest.value !== input.value) {
                    dest.value = input.value;
                    dest.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
        calc.recalculate(); uim.updateVisibility(); dm.updateJsonLd();
        clearTimeout(tm); tm = setTimeout(() => dm.saveToLS(), 1000);
    });

    console.log("Web/A Runtime Ready.");
}

/**
 * 住所自動入力ヘルパー
 */
function fillAddress(triggerInput: HTMLInputElement, record: PostalRecord, scope: Element, includeZip = false) {
    const inputs = Array.from(scope.querySelectorAll('input[data-json-path], select[data-json-path]')) as HTMLInputElement[];
    inputs.forEach((input: any) => {
        const key = (input.dataset.jsonPath || '').toLowerCase();
        if (input === triggerInput) return;

        let valToSet = '';
        if (includeZip && key.match(/zip|postal|郵便/)) {
            valToSet = record.zip.substring(0, 3) + '-' + record.zip.substring(3);
        } else if (key.match(/pref|都道府県/)) {
            valToSet = record.pref;
        } else if (key.match(/city|市区町村|市町村/)) {
            valToSet = record.city;
        } else if (key.match(/town|町名|町字/)) {
            valToSet = record.town;
        } else if (key.match(/address|住所/) && !key.match(/detail|sub|番地|building|room|mansion|house/)) {
            valToSet = `${record.pref}${record.city}${record.town}`;
        }

        if (valToSet && input.value !== valToSet) {
            input.value = valToSet;
            input.dataset.dirty = 'true';
            input.style.backgroundColor = '#e0f2fe';
            setTimeout(() => { input.style.backgroundColor = ''; }, 500);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

/**
 * Gzip透過ロード用ヘルパー
 */
async function tryLoadJson(el: HTMLScriptElement): Promise<any> {
    if (!el.textContent) return null;
    let text = el.textContent.trim();
    if (el.type === 'application/x-gzip') {
        try {
            const bin = atob(text);
            const ui8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);
            const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream('gzip'));
            text = await new Response(stream).text();
        } catch (e) { return null; }
    }
    try { return JSON.parse(text); } catch (e) { return null; }
}

function initSecuritySignal(l2Config: any) {
    const toolbar = document.querySelector('.form-toolbar');
    if (!toolbar) return;
    const signal = document.createElement('div');
    signal.id = 'weba-security-signal';
    signal.className = 'security-badge';
    toolbar.appendChild(signal);
    (async () => {
        let tier: 'high' | 'standard' | 'offline' = 'offline';
        if (l2Config.prekey_url) {
            try { if ((await fetch(l2Config.prekey_url, { method: 'HEAD' })).ok) tier = 'high'; } catch (e) { }
        }
        window.dispatchEvent(new CustomEvent('weba-security-tier-change', { detail: { tier } }));
    })();
}

function initGuestDidOpt(l2Config: any) {
    if (!l2Config?.enabled || !(window as any).PublicKeyCredential) return;
    const submitBtn = document.querySelector('button[onclick*="signAndDownload"]');
    if (submitBtn && submitBtn.parentElement) {
        const opt = document.createElement('div');
        opt.className = 'weba-guest-opt no-print';
        opt.style.cssText = 'display:flex;align-items:center;gap:6px;margin-right:12px;';
        opt.innerHTML = `<input type="checkbox" id="weba-guest-did-opt"><label for="weba-guest-did-opt" style="font-size:13px;color:#555;cursor:pointer;">返信を受け取る (Passkey)</label>`;
        submitBtn.parentElement.insertBefore(opt, submitBtn);
    }
}
