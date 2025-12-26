
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
.tabs-nav { display: flex; border-bottom: 2px solid #ddd; margin-bottom: 20px; overflow-x: auto; }
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

@media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; padding: 0mm; width: 100%; }
    .no-print { display: none !important; }
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
                        rowData[input.dataset.baseKey] = input.value;
                        if (input.value) hasVal = true;
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
                                if (k && rowData[k] !== undefined) input.value = rowData[k];
                            });
                        }
                    });
                }
            });
        } catch (e) { console.error(e); }
    }

    function recalculate() {
        console.log("Recalculating...");
        document.querySelectorAll('[data-formula]').forEach((calcField: any) => {
            const formula = calcField.dataset.formula;
            if (!formula) return;
            const row = calcField.closest('tr');
            const table = calcField.closest('table');

            const getValue = (varName: string) => {
                if (row) {
                    const input = row.querySelector(`[data-base-key="${varName}"], [data-json-path="${varName}"]`) as HTMLInputElement;
                    if (input && input.value !== '') return parseFloat(input.value);
                }
                const staticInput = document.querySelector(`[data-json-path="${varName}"]`) as HTMLInputElement;
                if (staticInput && staticInput.value !== '') return parseFloat(staticInput.value);
                return 0;
            };

            let evalStr = formula.replace(/SUM\(([a-zA-Z0-9_]+)\)/g, (_: any, key: string) => {
                let sum = 0;
                const scope = table || document;
                scope.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`).forEach((inp: any) => {
                    const val = parseFloat(inp.value);
                    if (!isNaN(val)) sum += val;
                });
                return sum;
            });

            evalStr = evalStr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match: string) => {
                if (['Math', 'round', 'floor', 'ceil', 'abs', 'min', 'max'].includes(match)) return match;
                return String(getValue(match));
            });

            try {
                // console.log("Eval:", formula, "->", evalStr);
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
                "save_btn": "Save",
            },
            "ja": {
                "add_row": "+ 行を追加",
                "save_btn": "保存",
            }
        };
        const lang = (navigator.language || 'en').startsWith('ja') ? 'ja' : 'en';
        const dict = RESOURCES[lang] || RESOURCES['en'];

        document.querySelectorAll('[data-i18n]').forEach((el: any) => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
    }

    function saveDocument() {
        updateJsonLd();
        // Bake values
        document.querySelectorAll('input, textarea, select').forEach((el: any) => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) el.setAttribute('checked', 'checked');
                else el.removeAttribute('checked');
            } else {
                el.setAttribute('value', el.value);
                if (el.tagName === 'TEXTAREA') el.textContent = el.value;
            }
        });

        document.querySelectorAll('button, .no-print').forEach(el => el.remove());
        document.querySelectorAll('input, textarea, select').forEach((el: any) => el.setAttribute('readonly', 'readonly'));

        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const title = (w.generatedJsonStructure && w.generatedJsonStructure.name) || 'web-a-form';
        const now = new Date();
        const dateStr = now.getFullYear() +
            ('0' + (now.getMonth()+1)).slice(-2) +
            ('0' + now.getDate()).slice(-2) + '-' +
            ('0' + now.getHours()).slice(-2) +
            ('0' + now.getMinutes()).slice(-2);
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${title}_${dateStr}_${randomId}.html`; // Template literal inside stringified function

        a.download = filename;
        a.click();

        setTimeout(() => location.reload(), 1000);
    }

    w.addTableRow = function (btn: any, tableKey: string) {
        const table = document.getElementById('tbl_' + tableKey);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const templateRow = tbody.querySelector('.template-row');
        if (!templateRow) return;
        const newRow = templateRow.cloneNode(true) as HTMLElement;
        newRow.querySelectorAll('input').forEach(input => input.value = '');
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
    document.addEventListener('input', () => {
        recalculate();
        updateJsonLd();
        clearTimeout(tm); tm = setTimeout(saveToLS, 1000);
    });

    // Expose explicitly for onclick handlers in HTML
    w.saveDocument = saveDocument;
    w.recalculate = recalculate; // For Maker preview to trigger initial calc

    console.log("Web/A Runtime Initialized");

    // Init
    restoreFromLS();
    applyI18n();
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
        <button class="primary no-print" onclick="saveDocument()" data-i18n="save_btn">Save</button>
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
