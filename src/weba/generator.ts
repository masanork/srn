
import { parseMarkdown } from './parser';

const BASE_CSS = `
body { font-family: sans-serif; background: #eee; margin: 0; padding: 20px; }
.page { margin: 0 auto; background: white; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20mm; max-width: 100%; box-sizing: border-box; }
.form-row { display: flex; margin-bottom: 20px; align-items: center; }
.form-row.vertical { display: block; }
.form-label { display: block; font-weight: bold; margin-right: 12px; min-width: 120px; }
.form-row.vertical .form-label { margin-bottom: 8px; width: 100%; }
.form-input { 
    flex: 1; 
    width: 100%; 
    padding: 6px; 
    border: 1px solid #ccc; 
    border-radius: 4px; 
    box-sizing: border-box; 
    font-size: 14px; 
    max-width: 640px;
}
textarea.form-input { max-width: none; }
.table-wrapper { overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
.data-table th, .data-table td { border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 4px 8px; text-align: left; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table th:last-child, .data-table td:last-child { border-right: none; }
.data-table th { background: #f5f7fa; font-weight: 600; color: #333; position: sticky; top: 0; }
.data-table .form-input { border: none; background: transparent; padding: 4px; margin: 0; border-radius: 0; font-size: 14px; width: 100%; outline: none; box-shadow: none; max-width: none !important; }
.data-table .form-input:focus { background: #eef4ff; box-shadow: inset 0 0 0 2px #4a90e2; }
.form-hint { font-size: 0.85em; color: #666; margin-top: 6px; line-height: 1.5; white-space: pre-wrap; }
h1 { border-bottom: 2px solid #333; padding-bottom: 10px; text-align: center; }
button.primary { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px; margin: 20px auto; display: block; }
button.primary:hover { background: #0056b3; }
.add-row-btn { background: #eee; border: 1px solid #ccc; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
.add-row-btn:hover { background: #ddd; }

/* Tab Styles */
.tabs-nav { display: flex; border-bottom: 2px solid #ddd; margin-bottom: 20px; overflow-x: auto; overflow-y: hidden; align-items: center; }
.tab-btn { 
    padding: 10px 20px; 
    cursor: pointer; 
    border: none; 
    background: none; 
    font-size: 16px; 
    font-weight: bold; 
    color: #666; 
    border-bottom: 2px solid transparent; 
    margin-bottom: -2px; 
    white-space: nowrap;
}
.tab-btn:hover { background: #f9f9f9; }
.tab-btn.active { color: #007bff; border-bottom: 2px solid #007bff; }
.tabs-nav .primary { margin: 5px; padding: 8px 14px; font-size: 14px; display: inline-flex; align-items: center; }
.tab-content { display: none; animation: fadeIn 0.3s; }
.tab-content.active { display: block; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Row Action (Delete) Button Styles */
.row-action-cell { 
    border: none !important; 
    background: transparent !important; 
    width: 30px; 
    text-align: center; 
    padding: 0 !important; 
    vertical-align: middle;
}
.remove-row-btn { 
    background: transparent; 
    border: none; 
    font-size: 20px; 
    color: #ccc; 
    cursor: pointer; 
    opacity: 0.2; 
    transition: opacity 0.2s, color 0.2s; 
    padding: 0 5px; 
    line-height: 1;
}
.data-table tr:hover .remove-row-btn { opacity: 1; }
.remove-row-btn:hover { color: #d9534f; }

@media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; padding: 0mm; width: 100%; }
    .no-print, .row-action-cell { display: none !important; }
    button { display: none !important; }
    
    /* Print: Linearize Tabs */
    .tabs-nav { display: none; }
    .tab-content { display: block !important; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
    .tab-content::before { content: attr(data-tab-title); display: block; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-left: 5px solid #333; padding-left: 10px; }
}
`;

// Runtime logic defined as a function to be stringified
// This ensures it passes TS compilation and avoids syntax errors in the string
function runtime() {
    const w = window as any;
    const FORM_ID = 'WebA_' + window.location.pathname;

    function updateJsonLd() {
        const data = w.generatedJsonStructure || {};

        // 1. Static Inputs
        document.querySelectorAll('[data-json-path]').forEach((input: any) => {
            const key = input.dataset.jsonPath;
            if (key) {
                data[key] = input.value;
            }
        });

        // 2. Radio Groups
        document.querySelectorAll('[type="radio"]:checked').forEach((radio: any) => {
            data[radio.name] = radio.value;
        });

        // 3. Dynamic Tables
        document.querySelectorAll('table.data-table.dynamic').forEach((table: any) => {
            const tableKey = table.dataset.tableKey;
            if (tableKey) {
                const rows: any[] = [];
                table.querySelectorAll('tbody tr').forEach((tr: any) => {
                    // Collect row data
                    const rowData: any = {};
                    let hasVal = false;
                    tr.querySelectorAll('[data-base-key]').forEach((input: any) => {
                        if (input.type === 'checkbox') {
                            rowData[input.dataset.baseKey] = input.checked;
                            if (input.checked) hasVal = true;
                        } else {
                            rowData[input.dataset.baseKey] = input.value;
                            if (input.value) hasVal = true;
                        }
                    });
                    if (hasVal) rows.push(rowData);
                });
                data[tableKey] = rows;
            }
        });

        const scriptBlock = document.getElementById('json-ld');
        if (scriptBlock) {
            scriptBlock.textContent = JSON.stringify(data, null, 2);
        }
        const debugBlock = document.getElementById('json-debug');
        if (debugBlock) {
            debugBlock.textContent = JSON.stringify(data, null, 2);
        }
        return data;
    }

    function saveToLS() {
        const data = updateJsonLd();
        localStorage.setItem(FORM_ID, JSON.stringify(data));
    }

    function restoreFromLS() {
        const c = localStorage.getItem(FORM_ID);
        if (!c) return;
        try {
            const d = JSON.parse(c);
            // Static
            document.querySelectorAll('[data-json-path]').forEach((input: any) => {
                const key = input.dataset.jsonPath;
                if (d[key] !== undefined) input.value = d[key];
            });
            // Dynamic Tables
            document.querySelectorAll('table.data-table.dynamic').forEach((table: any) => {
                const tableKey = table.dataset.tableKey;
                const rowsData = d[tableKey];
                if (Array.isArray(rowsData)) {
                    const tbody = table.querySelector('tbody');
                    if (!tbody) return;
                    // Remove existing except first template
                    const currentRows = tbody.querySelectorAll('.template-row');
                    for (let i = 1; i < currentRows.length; i++) currentRows[i].remove();

                    rowsData.forEach((rowData, idx) => {
                        let row: any;
                        if (idx === 0) {
                            row = tbody.querySelector('.template-row');
                        } else {
                            const tmpl = tbody.querySelector('.template-row');
                            if (tmpl) {
                                row = tmpl.cloneNode(true);
                                tbody.appendChild(row);
                            }
                        }
                        if (row) {
                            row.querySelectorAll('input, select').forEach((input: any) => {
                                const k = input.dataset.baseKey;
                                if (k && rowData[k] !== undefined) {
                                    if (input.type === 'checkbox') input.checked = !!rowData[k];
                                    else input.value = rowData[k];
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) { console.error(e); }
    }

    function recalculate() {
        document.querySelectorAll('[data-formula]').forEach((calcField: any) => {
            const formula = calcField.dataset.formula;
            if (!formula) return;
            const row = calcField.closest('tr');
            const table = calcField.closest('table');
            // console.log(`Calc processing: [${formula}] in row:`, row ? 'Yes' : 'No');

            const getValue = (varName: string) => {
                let val = 0;
                let foundSource = 'none';
                let rawVal = '';

                if (row) {
                    const selector = `[data-base-key="${varName}"], [data-json-path="${varName}"]`;
                    const input = row.querySelector(selector) as HTMLInputElement;
                    if (input) {
                        foundSource = 'row-input';
                        rawVal = input.value;
                        if (input.value !== '') val = parseFloat(input.value);
                    }
                }

                if (foundSource === 'none') {
                    const staticInput = document.querySelector(`[data-json-path="${varName}"]`) as HTMLInputElement;
                    if (staticInput) {
                        foundSource = 'static-input';
                        rawVal = staticInput.value;
                        if (staticInput.value !== '') val = parseFloat(staticInput.value);
                    }
                }

                return val;
            };

            let evalStr = formula.replace(/SUM\(([a-zA-Z0-9_\-\u0080-\uFFFF]+)\)/g, (_: any, key: string) => {
                let sum = 0;
                const scope = table || document;
                let inputs = scope.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`);
                if (inputs.length === 0 && scope !== document) {
                    inputs = document.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`);
                }
                inputs.forEach((inp: any) => {
                    const val = parseFloat(inp.value);
                    if (!isNaN(val)) sum += val;
                });
                return sum;
            });

            // Match vars (non-digits/operators/paren) to replace with getValue(var)
            evalStr = evalStr.replace(/([a-zA-Z_\u0080-\uFFFF][a-zA-Z0-9_\-\u0080-\uFFFF]*)/g, (match: string) => {
                if (['Math', 'round', 'floor', 'ceil', 'abs', 'min', 'max'].includes(match)) return match;
                return String(getValue(match));
            });

            try {
                const result = new Function('return ' + evalStr)();
                if (typeof result === 'number' && !isNaN(result)) {
                    calcField.value = Number.isInteger(result) ? result : result.toFixed(0);
                } else {
                    calcField.value = '';
                }
            } catch (e) {
                console.error("Calc Error:", e);
                calcField.value = 'Err';
            }
        });
    }

    function applyI18n() {
        const RESOURCES: any = {
            "en": {
                "add_row": "+ Add Row",
                "work_save_btn": "Save Draft",
                "submit_btn": "Submit",
                "clear_btn": "Clear Data",
            },
            "ja": {
                "add_row": "+ 行を追加",
                "work_save_btn": "作業保存",
                "submit_btn": "提出",
                "clear_btn": "クリア",
            }
        };
        const lang = (navigator.language || 'en').startsWith('ja') ? 'ja' : 'en';
        const dict = RESOURCES[lang] || RESOURCES['en'];

        document.querySelectorAll('[data-i18n]').forEach((el: any) => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
    }

    function bakeValues() {
        updateJsonLd();
        document.querySelectorAll('input, textarea, select').forEach((el: any) => {
            if (el.closest('.template-row')) return; // Skip template row
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) el.setAttribute('checked', 'checked');
                else el.removeAttribute('checked');
            } else {
                el.setAttribute('value', el.value);
                if (el.tagName === 'TEXTAREA') el.textContent = el.value;
            }
        });
    }

    function downloadHtml(filenameSuffix: string, isFinal: boolean) {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const title = (w.generatedJsonStructure && w.generatedJsonStructure.name) || 'web-a-form';
        const now = new Date();
        const dateStr = now.getFullYear() +
            ('0' + (now.getMonth() + 1)).slice(-2) +
            ('0' + now.getDate()).slice(-2) + '-' +
            ('0' + now.getHours()).slice(-2) +
            ('0' + now.getMinutes()).slice(-2);
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${title}_${dateStr}_${filenameSuffix}_${randomId}.html`;

        a.download = filename;
        a.click();

        if (isFinal) {
            setTimeout(() => location.reload(), 1000);
        }
    }

    w.saveDraft = function () {
        bakeValues();
        // Do not remove buttons or set readonly
        downloadHtml('draft', false);
    };

    w.submitDocument = function () {
        bakeValues();
        document.querySelectorAll('.search-suggestions').forEach(el => el.remove()); // Clean up UI artifacts
        // Do not remove buttons or set readonly to allow further editing/printing
        downloadHtml('submit', true);
    };

    w.clearData = function () {
        if (confirm('Clear all saved data? / 保存されたデータを削除しますか？')) {
            localStorage.removeItem(FORM_ID);
            location.reload();
        }
    };

    w.removeTableRow = function (btn: any) {
        const tr = btn.closest('tr');
        if (tr.classList.contains('template-row')) {
            // Cannot delete template row, just clear inputs
            // Cannot delete template row, just clear inputs
            tr.querySelectorAll('input').forEach((inp: HTMLInputElement) => {
                if (inp.type === 'checkbox') inp.checked = false;
                else inp.value = '';
            });
        } else {
            tr.remove();
            recalculate();
            updateJsonLd();
        }
    };

    w.addTableRow = function (btn: any, tableKey: string) {
        const table = document.getElementById('tbl_' + tableKey);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const templateRow = tbody.querySelector('.template-row');
        if (!templateRow) return;
        const newRow = templateRow.cloneNode(true) as HTMLElement;
        newRow.classList.remove('template-row');
        // Reset inputs to default value (from attribute) or empty
        newRow.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = input.hasAttribute('checked');
            } else {
                input.value = input.getAttribute('value') || '';
            }
        });
        // Unhide delete button for non-template rows
        const rmBtn = newRow.querySelector('.remove-row-btn') as HTMLElement;
        if (rmBtn) rmBtn.style.visibility = 'visible';

        tbody.appendChild(newRow);
    };

    w.switchTab = function (btn: any, tabId: string) {
        document.querySelectorAll('.tab-btn').forEach((b: any) => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((c: any) => c.classList.remove('active'));

        btn.classList.add('active');
        const content = document.getElementById(tabId);
        if (content) content.classList.add('active');
    };

    let tm: any;
    document.addEventListener('input', (e) => {
        recalculate();
        updateJsonLd();
        clearTimeout(tm); tm = setTimeout(saveToLS, 1000);
    });

    // Expose explicitly for onclick handlers in HTML
    w.recalculate = recalculate; // For Maker preview to trigger initial calc
    w.initSearch = initSearch; // For Maker preview to init search logic

    console.log("Web/A Runtime Initialized");

    function initSearch() {
        console.log("Initializing Search...");
        // @ts-ignore
        if (w.generatedJsonStructure && w.generatedJsonStructure.masterData) {
            // @ts-ignore
            const keys = Object.keys(w.generatedJsonStructure.masterData);
            console.log("Master Data Keys available:", keys.join(', '));
        }

        const normalize = (val: string) => {
            if (!val) return '';
            // For simple ASCII search, lowercase is enough usually, but we keep full-width conversion for JA support
            let n = val.toString().toLowerCase();
            n = n.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
            n = n.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
            // n = n.replace(/\s+/g, ' ').trim(); // Removing space normalization for strict check might help debug?
            return n.trim();
        };

        const clean = (s: string) => {
            if (!s) return '';
            let n = normalize(s);
            n = n.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g, '');
            n = n.replace(/(\(株\)|\(有\)|\(同\))/g, '');
            return n.trim();
        };
        const toIndex = (raw?: string) => {
            const parsed = parseInt(raw || '', 10);
            return Number.isFinite(parsed) ? parsed - 1 : -1;
        };

        const getScore = (query: string, targetParsed: string, targetOriginal: string) => {
            const q = clean(query);
            const t = clean(targetParsed);
            if (t.includes(q)) return 2;
            if (normalize(targetOriginal).includes(normalize(query))) return 1;
            return 0;
        };

        let suggestionsVisible = false;
        let activeSearchInput: HTMLInputElement | null = null;
        let globalBox: HTMLElement | null = null;

        const getGlobalBox = () => {
            if (!globalBox) {
                globalBox = document.getElementById('web-a-search-suggestions');
                if (!globalBox) {
                    globalBox = document.createElement('div');
                    globalBox.id = 'web-a-search-suggestions';
                    globalBox.className = 'search-suggestions';
                    Object.assign(globalBox.style, {
                        display: 'none',
                        position: 'absolute',
                        background: 'white',
                        border: '1px solid #ccc',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        zIndex: '9999',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        borderRadius: '4px'
                    });
                    document.body.appendChild(globalBox);
                }
            }
            return globalBox;
        };

        const hideSuggestions = () => {
            const box = getGlobalBox();
            if (box) box.style.display = 'none';
            suggestionsVisible = false;
            activeSearchInput = null;
        };

        // Close on click outside
        document.addEventListener('click', (e: any) => {
            if (suggestionsVisible && !e.target.closest('#web-a-search-suggestions') && e.target !== activeSearchInput) {
                hideSuggestions();
            }
        });

        // Close on scroll (anywhere) to prevent detached popup
        document.addEventListener('scroll', () => {
            if (suggestionsVisible) hideSuggestions();
        }, true);

        // Delegate input for search
        document.body.addEventListener('input', (e: any) => {
            if (e.target.classList.contains('search-input')) {
                const input = e.target as HTMLInputElement;
                activeSearchInput = input;

                const srcKey = input.dataset.masterSrc;
                const suggestSource = input.dataset.suggestSource;
                if (!srcKey && !suggestSource) return;

                const labelIdx = toIndex(input.dataset.masterLabelIndex);
                const valueIdx = toIndex(input.dataset.masterValueIndex);

                const query = input.value;
                if (!query) {
                    hideSuggestions();
                    return;
                }

                const hits: any[] = [];
                const normQuery = normalize(query);

                if (suggestSource === 'column') {
                    const baseKey = input.dataset.baseKey;
                    const table = input.closest('table');
                    if (table && baseKey) {
                        const seen = new Set<string>();
                        table.querySelectorAll(`[data-base-key="${baseKey}"]`).forEach((inp: any) => {
                            const v = inp.value;
                            // Suggest values that match query, exclude exact current value to avoid redundancy? 
                            // Actually showing exact match is fine if it acts as a "this is valid" confirmation, 
                            // but usually we want OTHERS. 
                            // Let's suggest if it contains the query.
                            if (v && normalize(v).includes(normQuery)) {
                                if (!seen.has(v)) {
                                    seen.add(v);
                                    hits.push({ val: v, row: [v], label: v, score: 10 });
                                }
                            }
                        });
                    }
                } else if (srcKey) {
                    console.log(`Search: Input '${query}', srcKey: '${srcKey}'`);

                    // @ts-ignore
                    const master = w.generatedJsonStructure.masterData;
                    if (!master || !master[srcKey]) {
                        console.warn(`Search: masterData key '${srcKey}' not found. Available:`, Object.keys(master || {}));
                        return;
                    }

                    const allRows = master[srcKey];
                    // Assume Row 0 is Headers
                    allRows.forEach((row: string[], idx: number) => {
                        if (idx === 0) return; // Skip header

                        // Search all columns
                        const match = row.some(col => {
                            return normalize(col || '').includes(normQuery);
                        });

                        if (match) {
                            const labelVal = labelIdx >= 0 ? row[labelIdx] || '' : '';
                            const valueVal = valueIdx >= 0 ? row[valueIdx] || '' : '';
                            const val = valueIdx >= 0 ? valueVal : (labelIdx >= 0 ? labelVal : (row[1] || row[0] || ''));
                            hits.push({ val, row, label: labelVal, score: 10, idx });
                        }
                    });
                }
                console.log(`Search: Found ${hits.length} matches for '${query}' (norm: '${normQuery}') in '${srcKey}'`);

                hits.sort((a, b) => b.score - a.score);
                const topHits = hits.slice(0, 10);

                if (topHits.length > 0) {
                    let html = '';
                    topHits.forEach(h => {
                        // Store row data in data-row attribute (JSON encoded)
                        const rowJson = w.escapeHtml(JSON.stringify(h.row));
                        // Display joined row for context (e.g. "1 : Acrocity...")
                        const displayLabel = labelIdx >= 0 ? (h.label || h.row.join(' : ')) : h.row.join(' : ');
                        html += `<div class="suggestion-item" data-val="${w.escapeHtml(h.val)}" data-row="${rowJson}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${w.escapeHtml(displayLabel)}</div>`;
                    });

                    const box = getGlobalBox();
                    box.innerHTML = html;

                    // Smart Positioning
                    const rect = input.getBoundingClientRect();
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
                    const viewportHeight = window.innerHeight;

                    const spaceBelow = viewportHeight - rect.bottom;
                    const height = Math.min(topHits.length * 40, 200); // approx height

                    // Reset common styles
                    box.style.width = Math.max(rect.width, 200) + 'px';
                    box.style.left = (rect.left + scrollLeft) + 'px';

                    if (spaceBelow < height && rect.top > height) {
                        // Flip Up
                        box.style.top = (rect.top + scrollTop - height - 2) + 'px';
                        box.style.maxHeight = height + 'px'; // Ensure it fits
                    } else {
                        // Standard Down
                        box.style.top = (rect.bottom + scrollTop) + 'px';
                        box.style.maxHeight = '200px';
                    }

                    box.style.display = 'block';
                    suggestionsVisible = true;

                    // Add hover effect via JS since inline styles are hard for hover
                    box.querySelectorAll('.suggestion-item').forEach((el: any) => {
                        el.onmouseenter = () => el.style.background = '#f0f8ff';
                        el.onmouseleave = () => el.style.background = 'white';
                    });

                } else {
                    hideSuggestions();
                }
            }
        });

        // Delegate click for suggestion selection
        document.body.addEventListener('click', (e: any) => {
            if (e.target.classList.contains('suggestion-item')) {
                const item = e.target;
                if (activeSearchInput) {
                    let searchInputFilled = false;
                    // 1. Default Update Search Input (will be overridden if matched in loop)
                    const originalVal = item.dataset.val;

                    // 2. Auto-Fill other fields
                    try {
                        const rowData = JSON.parse(item.dataset.row || '[]');
                        console.log("Auto-Fill: Selected Row:", rowData);

                        const srcKey = activeSearchInput.dataset.masterSrc;
                        // @ts-ignore
                        const masterHeaders = srcKey ? w.generatedJsonStructure.masterData[srcKey][0] : [];
                        console.log("Auto-Fill: Master Headers:", masterHeaders);

                        if (masterHeaders.length > 0 && rowData.length > 0) {
                            const tr = activeSearchInput.closest('tr');
                            if (tr) {
                                const inputs = Array.from(tr.querySelectorAll('input, select, textarea'));
                                console.log("Auto-Fill: Inputs in Form Row:", inputs.map((i: any) => i.dataset.baseKey || i.dataset.jsonPath));

                                masterHeaders.forEach((header: string, idx: number) => {
                                    // if (idx === 0) return; // Allow search key itself to be matched/filled if header matches label
                                    if (!header) return;

                                    const targetVal = rowData[idx];
                                    const keyMatch = normalize(header);

                                    console.log(`Auto-Fill: Checking '${header}' (norm: '${keyMatch}') against inputs...`);

                                    const targetInput = inputs.find((inp: any) => {
                                        const k = inp.dataset.baseKey || inp.dataset.jsonPath;

                                        // 3. Check Visible Label (Robust fallback for Forms and Tables)
                                        let labelText = '';
                                        const td = inp.closest('td');
                                        if (td) {
                                            // Table Mode: Get header from th
                                            const tr = td.parentElement;
                                            const index = Array.from(tr.children).indexOf(td);
                                            const table = tr.closest('table');
                                            if (table) {
                                                // Assuming simple table with one header row
                                                const th = table.querySelectorAll('thead th')[index] || table.querySelectorAll('tr:first-child th')[index];
                                                if (th) labelText = normalize(th.textContent || '');
                                            }
                                        } else {
                                            // Form Mode: Get label from form-row
                                            const rowDiv = inp.closest('.form-row');
                                            if (rowDiv) {
                                                const labelEl = rowDiv.querySelector('.form-label');
                                                if (labelEl) labelText = normalize(labelEl.textContent || '');
                                            }
                                        }

                                        const ph = normalize(inp.getAttribute('placeholder') || '');

                                        const matchKey = (k && normalize(k) === keyMatch);
                                        const matchPh = (ph === keyMatch);
                                        const matchLabel = (labelText === keyMatch);

                                        if (header === 'ベンダー名' || header === '区') {
                                            // console.log(`Debug Match: Header='${keyMatch}' InputKey='${k}' Ph='${ph}' Label='${labelText}' -> ${matchKey||matchPh||matchLabel}`);
                                        }

                                        if (matchKey || matchPh || matchLabel) return true;
                                        return false;
                                    }) as HTMLInputElement;

                                    if (targetInput) {
                                        console.log(`Auto-Fill: Match found for '${header}' -> Filling '${targetVal}'`);
                                        targetInput.value = targetVal || '';
                                        // Trigger input event for this field so calculations dependent on it update
                                        targetInput.dispatchEvent(new Event('input', { bubbles: true }));

                                        if (targetInput === activeSearchInput) {
                                            searchInputFilled = true;
                                            console.log("Auto-Fill: Search input itself was filled via mapping.");
                                        }
                                    } else {
                                        console.log(`Auto-Fill: No match for '${header}'`);
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Auto-fill error", err);
                    }

                    if (!searchInputFilled) {
                        // Fallback to default ID if no specific mapping found for search input
                        activeSearchInput.value = originalVal || '';
                        activeSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    hideSuggestions();
                }
            }
        });
    }

    w.escapeHtml = function (str: string) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    // Init
    restoreFromLS();
    applyI18n();
    initSearch();
    recalculate();
}

export const RUNTIME_SCRIPT = `(${runtime.toString()})();`;

export function initRuntime(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).recalculate) {
        console.log("Runtime already loaded, skipping init");
        return;
    }
    runtime();
}

export function generateHtml(markdown: string): string {
    const { html, jsonStructure } = parseMarkdown(markdown);

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${jsonStructure.name || 'Web/A Form'}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📄</text></svg>">
    <style>${BASE_CSS}</style>
</head>
<body>
    <div class="page">
        ${html}
        <div class="no-print" style="margin-top: 20px; display: flex; gap: 10px; align-items: center; justify-content: center;">
            <button class="primary" onclick="window.clearData()" style="margin: 0; background-color: #999;" data-i18n="clear_btn">Clear</button>
            <button class="primary" onclick="window.saveDraft()" style="margin: 0;" data-i18n="work_save_btn">Save Draft</button>
            <button class="primary" onclick="window.submitDocument()" style="margin: 0; background-color: #d9534f;" data-i18n="submit_btn">Submit</button>
        </div>
    </div>
    <script type="application/ld+json" id="json-ld">
        ${JSON.stringify(jsonStructure, null, 2)}
    </script>
    <script>
        window.generatedJsonStructure = ${JSON.stringify(jsonStructure)};
        ${RUNTIME_SCRIPT}
    </script>
</body>
</html>`;
}

function aggregatorRuntime() {
    const w = window as any;
    const jsonStructure = w.generatedJsonStructure;
    const fields = jsonStructure.fields || [];

    let allData: any[] = []; // { filename, data: json }

    function renderTable() {
        const container = document.getElementById('table-container');
        if (!container) return;

        // Headers
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Filename</th>';
        fields.forEach((f: any) => html += `<th>${f.label}</th>`);
        html += '</tr></thead><tbody>';

        // Rows
        allData.forEach((row) => {
            html += '<tr>';
            html += `<td>${row.filename || '-'}</td>`;
            const d = row.data || {};
            fields.forEach((f: any) => {
                let val = d[f.key];
                if (typeof val === 'object') val = JSON.stringify(val);
                html += `<td>${val || ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        const countEl = document.getElementById('count');
        if (countEl) countEl.textContent = allData.length + ' files loaded';
    }

    async function handleFiles(files: FileList) {
        let loadedCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;
            if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                const text = await file.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                const script = doc.getElementById('json-ld');
                if (script && script.textContent) {
                    try {
                        const json = JSON.parse(script.textContent);
                        allData.push({ filename: file.name, data: json });
                        loadedCount++;
                    } catch (e) { console.error('Error parsing JSON from ' + file.name, e); }
                }
            } else if (file.name.endsWith('.json')) {
                // Maybe it's an archive or raw json?
                try {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    if (Array.isArray(json) && json.length > 0 && (json[0].filename || json[0].data)) {
                        // It's likely an archive
                        // Check for duplicates based on filename?
                        // For now just append
                        allData = allData.concat(json);
                        loadedCount += json.length;
                    } else if (typeof json === 'object') {
                        allData.push({ filename: file.name, data: json });
                        loadedCount++;
                    }
                } catch (e) { }
            }
        }
        renderTable();
        alert(`${loadedCount} files loaded/imported.`);
    }

    function setup() {
        const input = document.getElementById('file-input');
        input?.addEventListener('change', (e: any) => {
            if (e.target.files) handleFiles(e.target.files);
        });

        // Drag and Drop
        const dropZone = document.getElementById('drop-zone');
        dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = '#eef'; });
        dropZone?.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.background = ''; });
        dropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.background = '';
            if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
        });

        document.getElementById('btn-download')?.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = (jsonStructure.name || 'data') + '_aggregated.json';
            a.click();
        });
    }

    setup();
}

export const AGGREGATOR_RUNTIME_SCRIPT = `(${aggregatorRuntime.toString()})();`;

export function generateAggregatorHtml(markdown: string): string {
    const { jsonStructure } = parseMarkdown(markdown);
    // Reuse BASE_CSS but add some specific styles for aggregator if needed
    // We reuse BASE_CSS for consistent look

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${jsonStructure.name || 'Web/A Aggregator'}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>">
    <style>
        ${BASE_CSS}
        #drop-zone { border: 2px dashed #ccc; padding: 40px; text-align: center; margin-bottom: 20px; border-radius: 8px; color: #666; }
        .controls { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
        .stats { margin-left: auto; font-weight: bold; color: #333; }
    </style>
</head>
<body>
    <div class="page" style="max-width: 1200px;">
        <h1>${jsonStructure.name} - Aggregator</h1>
        
        <div id="drop-zone">
            <p>Drop Web/A HTML files or JSON Archive here</p>
            <p>or</p>
            <input type="file" id="file-input" multiple webkitdirectory />
        </div>

        <div class="controls">
            <button class="primary" id="btn-download">Download Aggregated JSON</button>
            <div class="stats" id="count">0 files loaded</div>
        </div>

        <div id="table-container" class="table-wrapper">
            <p style="padding: 20px; text-align: center; color: #999;">No data loaded</p>
        </div>
    </div>
    <script>
        window.generatedJsonStructure = ${JSON.stringify(jsonStructure)};
        ${AGGREGATOR_RUNTIME_SCRIPT}
    </script>
</body>
</html>`;
}
