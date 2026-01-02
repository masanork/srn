/**
 * Postal Code Autofill Plugin
 *
 * Provides Japanese postal code lookup and address autofill functionality.
 * Detects autofill:postal annotations and provides suggestions.
 */

import type { FormPlugin } from '../runtime/types.js';
import type { PostalRecord } from '../client/postal.js';
import { parseFieldName, isSameGroup, detectFieldType } from '../client/postal-group.js';

export const postalPlugin: FormPlugin = {
    name: 'postal',

    detect({ structure, rawMarkdown }) {
        return structure.needsPostal ||
               rawMarkdown.includes('autofill:postal');
    },

    dataBlobs: ['jp-postal'],

    init(runtime) {
        console.log('[PostalPlugin] Initializing...');

        const postal = runtime.getLookup('postal');
        if (!postal) {
            console.warn('[PostalPlugin] Postal lookup not available');
            return;
        }

        // Wait for postal data to be ready
        const checkReady = () => {
            if (!postal.isReady()) {
                console.log('[PostalPlugin] Waiting for postal data...');
                setTimeout(checkReady, 100);
                return;
            }
            console.log('[PostalPlugin] Postal data ready');
        };
        checkReady();

        // Register input handler for postal autofill
        runtime.on('input', (e, input) => {
            // Skip if postal not ready or search-input
            if (!postal.isReady()) return;
            if (input.classList.contains('search-input')) return;

            const autofill = input.dataset.autofill || '';
            const key = (input.dataset.jsonPath || input.dataset.baseKey || input.name || input.id || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            const val = input.value.trim();

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

            if (!fieldType) return;

            // Ensure datalist exists (Support dynamic rows)
            let listId = input.getAttribute('list');
            if (!listId) {
                listId = `dl-${Math.random().toString(36).substr(2, 5)}`;
                input.setAttribute('list', listId);
                const dl = document.createElement('datalist');
                dl.id = listId;
                document.body.appendChild(dl);
            }
            const datalist = document.getElementById(listId);

            if (fieldType === 'zip') {
                const cleanVal = val.replace(/[^0-9]/g, '');
                if (datalist && cleanVal.length >= 3) {
                    const candidates = postal.suggest(cleanVal, 50) as PostalRecord[];
                    datalist.innerHTML = candidates.map(c =>
                        `<option value="${c.zip.substring(0, 3)}-${c.zip.substring(3)}">${c.pref}${c.city}${c.town}</option><option value="${c.zip}">${c.pref}${c.city}${c.town}</option>`
                    ).join('');
                }
                if (cleanVal.length === 7) {
                    const addr = postal.lookup(cleanVal);
                    if (addr) {
                        fillAddress(input, addr, input.closest('tr') || input.closest('.dynamic-row') || input.closest('.address-group') || input.closest('table') || input.closest('form') || document.body);
                    }
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
        });

        console.log('[PostalPlugin] Initialized');
    }
};

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
