/**
 * Local Government Code Autofill Plugin
 *
 * Provides Japanese local government code lookup and bidirectional autofill.
 * Supports three input patterns:
 * - LG code → prefecture + city
 * - Prefecture → filtered city suggestions
 * - City → LG code + prefecture
 */

import type { FormPlugin } from '../runtime/types.js';
import type { LgRecord } from '../client/lg.js';

export const lgPlugin: FormPlugin = {
    name: 'lg',

    detect({ structure, rawMarkdown }) {
        return structure.needsLg ||
               rawMarkdown.includes('autofill:lg');
    },

    dataBlobs: ['jp-lg'],

    init(runtime) {
        console.log('[LgPlugin] Initializing...');

        const lg = runtime.getLookup('lg');
        if (!lg) {
            console.warn('[LgPlugin] LG lookup not available');
            return;
        }

        // Wait for LG data to be ready
        const checkReady = () => {
            if (!lg.isReady()) {
                console.log('[LgPlugin] Waiting for LG data...');
                setTimeout(checkReady, 100);
                return;
            }
            console.log('[LgPlugin] LG data ready');
        };
        checkReady();

        // Helper: Get related fields in the same scope
        const getRelatedLgFields = (currentInput: HTMLInputElement) => {
            const scope = currentInput.closest('tr') || currentInput.closest('.dynamic-row') || currentInput.closest('.group') || currentInput.closest('form') || document.body;
            const inputs = Array.from(scope.querySelectorAll('input, select, textarea')) as HTMLInputElement[];

            let codeField: HTMLInputElement | null = null;
            let prefField: HTMLInputElement | null = null;
            let cityField: HTMLInputElement | null = null;

            inputs.forEach((inp) => {
                const af = inp.dataset.autofill || '';
                const k = (inp.dataset.jsonPath || inp.name || inp.id || '').toLowerCase();

                if (af === 'lg' || k.match(/lg_code|lgcode|自治体コード/)) {
                    codeField = inp;
                } else if (af === 'lg:pref' || k.match(/pref|都道府県/)) {
                    prefField = inp;
                } else if (af === 'lg:city' || k.match(/city|市区町村/)) {
                    cityField = inp;
                }
            });

            return { codeField, prefField, cityField };
        };

        // Helper: Auto-fill related fields
        const fillLgFields = (lgRecord: LgRecord, currentInput: HTMLInputElement) => {
            const { codeField, prefField, cityField } = getRelatedLgFields(currentInput);

            [
                { field: codeField, value: lgRecord.code },
                { field: prefField, value: lgRecord.pref },
                { field: cityField, value: lgRecord.city }
            ].forEach(({ field, value }) => {
                if (field && field !== currentInput && value && field.value !== value) {
                    field.value = value;
                    field.dataset.dirty = 'true';
                    field.style.backgroundColor = '#e0f2fe';
                    setTimeout(() => { field.style.backgroundColor = ''; }, 500);
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        };

        // Input event handler
        runtime.on('input', (e, input) => {
            if (!lg.isReady()) return;
            if (input.classList.contains('search-input')) return;

            const autofill = input.dataset.autofill || '';
            const val = input.value.trim();

            if (autofill === 'lg') {
                // === LG Code Field ===
                let listId = input.getAttribute('list');
                if (!listId) {
                    listId = `dl-lg-${Math.random().toString(36).substr(2, 5)}`;
                    input.setAttribute('list', listId);
                    const dl = document.createElement('datalist');
                    dl.id = listId;
                    document.body.appendChild(dl);
                }
                const datalist = document.getElementById(listId);

                const cleanVal = val.replace(/[^0-9]/g, '');

                // Suggest by code prefix
                if (datalist && cleanVal.length >= 2 && cleanVal.length < 6) {
                    const candidates = lg.suggest(cleanVal, 30);
                    datalist.innerHTML = candidates.map((c: LgRecord) =>
                        `<option value="${c.code}">${c.pref} ${c.city}</option>`
                    ).join('');
                }

                // Auto-fill on exact match (6 digits)
                if (cleanVal.length === 6) {
                    const lgRecord = lg.lookup(cleanVal);
                    if (lgRecord) fillLgFields(lgRecord, input);
                }
            } else if (autofill === 'lg:pref') {
                // === Prefecture Field ===
                let listId = input.getAttribute('list');
                if (!listId) {
                    listId = `dl-lg-pref-${Math.random().toString(36).substr(2, 5)}`;
                    input.setAttribute('list', listId);
                    const dl = document.createElement('datalist');
                    dl.id = listId;
                    document.body.appendChild(dl);
                }
                const datalist = document.getElementById(listId);

                if (datalist && val.length >= 1) {
                    const allPrefs = lg.getUniquePrefectures();
                    const filtered = allPrefs.filter((p: string) => p.includes(val)).slice(0, 20);
                    datalist.innerHTML = filtered.map((p: string) => `<option value="${p}">${p}</option>`).join('');
                }
            } else if (autofill === 'lg:city') {
                // === City Field ===
                let listId = input.getAttribute('list');
                if (!listId) {
                    listId = `dl-lg-city-${Math.random().toString(36).substr(2, 5)}`;
                    input.setAttribute('list', listId);
                    const dl = document.createElement('datalist');
                    dl.id = listId;
                    document.body.appendChild(dl);
                }
                const datalist = document.getElementById(listId);

                if (datalist && val.length >= 1) {
                    const { prefField } = getRelatedLgFields(input);
                    const prefValue = prefField ? prefField.value.trim() : '';

                    let candidates;
                    if (prefValue) {
                        // Filter by prefecture
                        candidates = lg.suggestCitiesByPref(prefValue, val, 30);
                        datalist.innerHTML = candidates.map((c: LgRecord) =>
                            `<option value="${c.city}">${c.city}</option>`
                        ).join('');
                    } else {
                        // Show all cities with prefecture
                        candidates = lg.suggestByCity(val, undefined, 30);
                        datalist.innerHTML = candidates.map((c: LgRecord) =>
                            `<option value="${c.city}">${c.pref} ${c.city}</option>`
                        ).join('');
                    }

                    // Auto-fill on exact match
                    const exactMatch = candidates.find((c: LgRecord) => c.city === val);
                    if (exactMatch) {
                        fillLgFields(exactMatch, input);
                    }
                }
            }
        });

        // Change event handler for datalist selection
        runtime.on('change', (e, input) => {
            if (!lg.isReady()) return;

            const autofill = input.dataset.autofill || '';

            // LG City field: Auto-fill on selection from datalist
            if (autofill === 'lg:city') {
                const val = input.value.trim();
                if (!val) return;

                const { prefField } = getRelatedLgFields(input);
                const prefValue = prefField ? prefField.value.trim() : '';

                // Search for matching city
                const candidates = prefValue
                    ? lg.suggestCitiesByPref(prefValue, val, 50)
                    : lg.suggestByCity(val, undefined, 50);

                const exactMatch = candidates.find((c: LgRecord) => c.city === val);
                if (exactMatch) {
                    fillLgFields(exactMatch, input);
                }
            }
        });

        console.log('[LgPlugin] Initialized');
    }
};
