import { Calculator } from './calculator';
import { DataManager } from './data';
import { UIManager } from './ui';
import type { PostalRecord } from './postal';
import { parseFieldName, isSameGroup, detectFieldType } from './postal-group';

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
    // Try to load from manifest first (Blob-based), then fallback to direct element
    const loadStructureData = async () => {
        const manifest = w.__WEBA_MANIFEST;
        if (manifest && manifest.blobs) {
            const structureBlob = manifest.blobs.find((b: any) => b.id === 'weba-structure');
            if (structureBlob && structureBlob.urls) {
                console.log('[Runtime] Found weba-structure in manifest');
                for (const url of structureBlob.urls) {
                    try {
                        let jsonString: string;
                        if (url.startsWith('#')) {
                            const el = document.querySelector(url);
                            if (!el || !el.textContent) continue;
                            const bin = atob(el.textContent.trim());
                            const ui8 = new Uint8Array(bin.length);
                            for (let i = 0; i < bin.length; i++) ui8[i] = bin.charCodeAt(i);
                            const stream = new Blob([ui8]).stream().pipeThrough(new DecompressionStream('gzip'));
                            jsonString = await new Response(stream).text();
                        } else {
                            const resp = await fetch(url);
                            if (!resp.ok) continue;
                            jsonString = await resp.text();
                        }
                        const data = JSON.parse(jsonString);
                        console.log('[Runtime] Structure data loaded from blob. Keys:', Object.keys(data));
                        return data;
                    } catch (e) {
                        console.warn('[Runtime] Failed to load structure from:', url, e);
                    }
                }
            }
        }

        // Fallback to direct element access
        const structureScript = document.getElementById('weba-structure') as HTMLScriptElement;
        if (structureScript) {
            console.log('[Runtime] Loading structure from direct element');
            return await tryLoadJson(structureScript);
        }

        console.warn('[Runtime] weba-structure not found in manifest or DOM');
        return null;
    };

    loadStructureData().then(s => {
        if (s) {
            w.generatedJsonStructure = s;
            console.log('[Runtime] generatedJsonStructure set');
            uim.applyI18n(); uim.initTelFormatter(); calc.recalculate(); uim.updateVisibility();

            // Initialize SearchEngine after structure data is loaded
            if (w.SearchEngine && typeof w.SearchEngine.init === 'function') {
                console.log('[Runtime] Calling SearchEngine.init()...');
                w.SearchEngine.init().catch((err: any) => console.error('SearchEngine init failed:', err));
            }
        } else {
            console.warn('[Runtime] Failed to load structure data');
        }
    }).catch(err => {
        console.error('[Runtime] Error loading structure:', err);
    });
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

        let key = (input.dataset.jsonPath || input.name || '').toLowerCase();
        const val = input.value.trim();
        const postal = w.postalLookup;

        // A. Postal & Address Suggestions (Datalist based)
        // Skip if this is a search-input field - SearchEngine will handle it
        const isSearchInput = input.classList.contains('search-input');
        if (postal && postal.isReady() && !isSearchInput) {
            key = (input.dataset.jsonPath || input.dataset.baseKey || input.name || input.id || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            const autofill = input.dataset.autofill || '';

            // Determine field type: prioritize autofill attribute, fallback to key/placeholder
            let fieldType = '';
            if (autofill.startsWith('postal:')) {
                fieldType = autofill.replace('postal:', '');
            } else {
                // Fallback: auto-detect from key/placeholder
                if ((key.match(/zip|postal|postcode|郵便/) && !key.match(/pref|city|town|address|都道府県|市区町村|住所/))
                    || placeholder.match(/郵便|zip|postal/)) {
                    fieldType = 'zip';
                } else if (key.match(/pref|都道府県/)) {
                    fieldType = 'pref';
                } else if (key.match(/city|市区町村/)) {
                    fieldType = 'city';
                } else if (key.match(/town|町名|町字/)) {
                    fieldType = 'town';
                } else if (key.match(/address|住所/)) {
                    fieldType = 'address';
                }
            }

            if (fieldType) {
                // Ensure datalist exists (Support dynamic rows)
                let listId = input.getAttribute('list');
                if (!listId) {
                    listId = `dl-${Math.random().toString(36).substr(2, 5)}`;
                    input.setAttribute('list', listId);
                    const dl = document.createElement('datalist'); dl.id = listId; document.body.appendChild(dl);
                }
                const datalist = document.getElementById(listId);

                if (fieldType === 'zip') {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    if (datalist && cleanVal.length >= 3) {
                        const candidates = postal.suggest(cleanVal, 50) as PostalRecord[];
                        datalist.innerHTML = candidates.map(c => `<option value="${c.zip.substring(0, 3)}-${c.zip.substring(3)}">${c.pref}${c.city}${c.town}</option><option value="${c.zip}">${c.pref}${c.city}${c.town}</option>`).join('');
                    }
                    if (cleanVal.length === 7) {
                        const addr = postal.lookup(cleanVal);
                        if (addr) fillAddress(input, addr, input.closest('tr') || input.closest('.dynamic-row') || input.closest('.address-group') || input.closest('table') || input.closest('form') || document.body);
                    }
                } else if (fieldType === 'pref') {
                    // 都道府県フィールド：都道府県名のみサジェスト
                    if (datalist && val.length >= 1) {
                        const candidates = postal.suggestByAddress(val, 50) as PostalRecord[];
                        const uniquePrefs = [...new Set(candidates.map(c => c.pref))].slice(0, 10);
                        datalist.innerHTML = uniquePrefs.map(pref => `<option value="${pref}">${pref}</option>`).join('');
                    }
                } else if (fieldType === 'city') {
                    // 市区町村フィールド：市区町村名のみサジェスト
                    if (datalist && val.length >= 1) {
                        const candidates = postal.suggestByAddress(val, 50) as PostalRecord[];
                        const uniqueCities = [...new Set(candidates.map(c => c.city))].slice(0, 20);
                        datalist.innerHTML = uniqueCities.map(city => `<option value="${city}">${city}</option>`).join('');
                    }
                } else if (fieldType === 'town' || fieldType === 'address') {
                    // 町名・住所フィールド：町名のみサジェスト
                    if (datalist && val.length >= 2) {
                        const candidates = postal.suggestByAddress(val, 30) as PostalRecord[];
                        datalist.innerHTML = candidates.map(c => `<option value="${c.town}">${c.pref}${c.city}${c.town}</option>`).join('');
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
 * 住所自動入力ヘルパー（グループ対応版）
 */
function fillAddress(triggerInput: HTMLInputElement, record: PostalRecord, scope: Element, includeZip = false) {
    // トリガーフィールドのグループ情報を解析
    const sourceField = parseFieldName(triggerInput);

    // グループがない場合は警告
    if (!sourceField.group) {
        console.warn('[fillAddress] グループプレフィックスが必要です。フィールド名:', sourceField.raw);
        return;
    }

    const inputs = Array.from(scope.querySelectorAll('input, select, textarea')) as HTMLInputElement[];

    // 同じグループのフィールドのみをフィルタリング
    const groupedInputs = inputs
        .map(inp => ({ element: inp, parsed: parseFieldName(inp) }))
        .filter(({ parsed }) => isSameGroup(sourceField, parsed));

    // 個別フィールドの存在をチェック
    const hasPref = groupedInputs.some(({ element: inp, parsed }) => {
        if (inp === triggerInput) return false;
        return detectFieldType(parsed.fieldType || '') === 'pref';
    });
    const hasCity = groupedInputs.some(({ element: inp, parsed }) => {
        if (inp === triggerInput) return false;
        return detectFieldType(parsed.fieldType || '') === 'city';
    });
    const hasTown = groupedInputs.some(({ element: inp, parsed }) => {
        if (inp === triggerInput) return false;
        return detectFieldType(parsed.fieldType || '') === 'town';
    });

    groupedInputs.forEach(({ element: input, parsed }) => {
        if (input === triggerInput) return;

        const fieldType = detectFieldType(parsed.fieldType || '');
        let valToSet = '';

        if (includeZip && fieldType === 'zip') {
            valToSet = record.zip.substring(0, 3) + '-' + record.zip.substring(3);
        } else if (fieldType === 'pref') {
            valToSet = record.pref;
        } else if (fieldType === 'city') {
            valToSet = record.city;
        } else if (fieldType === 'town') {
            valToSet = record.town;
        } else if (fieldType === 'address') {
            // 個別フィールドで入力されていない部分のみ
            if (!hasPref && !hasCity && !hasTown) {
                // 個別フィールドが全くない場合：完全な住所
                valToSet = `${record.pref}${record.city}${record.town}`;
            } else if (hasPref && !hasCity && !hasTown) {
                // prefのみがある場合：市区町村+町名
                valToSet = `${record.city}${record.town}`;
            } else if (!hasTown) {
                // pref/cityのいずれかがある場合：町名のみ
                valToSet = record.town;
            }
            // townがある場合は、addressには何も入れない
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
