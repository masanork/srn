
import { parseMarkdown } from './parser';

const BASE_CSS = `
body { font-family: sans-serif; background: #eee; margin: 0; padding: 20px; }
.page { margin: 0 auto; background: white; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20mm; max-width: 100%; box-sizing: border-box; }
.form-row { display: flex; margin-bottom: 20px; align-items: center; }
.form-row.vertical { display: block; }
.form-label { display: block; font-weight: bold; margin-right: 15px; min-width: 140px; }
.form-row.vertical .form-label { margin-bottom: 8px; width: 100%; }
.form-input { 
    flex: 1; 
    width: 100%; 
    padding: 8px; 
    border: 1px solid #ccc; 
    border-radius: 4px; 
    box-sizing: border-box; 
    font-size: 16px; 
    max-width: 800px;
}
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
@media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; padding: 0mm; width: 100%; }
    .no-print { display: none !important; }
    button { display: none !important; }
}
`;

export const RUNTIME_SCRIPT = `
const FORM_ID = 'WebA_' + window.location.pathname;

function updateJsonLd() {
    const data = window.generatedJsonStructure || {};
    
    // 1. Static Inputs
    document.querySelectorAll('[data-json-path]').forEach(input => {
        const key = input.dataset.jsonPath;
        if(key) {
            data[key] = input.value;
        }
    });

    // 2. Radio Groups
    document.querySelectorAll('[type="radio"]:checked').forEach(radio => {
        data[radio.name] = radio.value;
    });

    // 3. Dynamic Tables
    document.querySelectorAll('table.data-table.dynamic').forEach(table => {
        const tableKey = table.dataset.tableKey;
        if(tableKey) {
            const rows = [];
            table.querySelectorAll('tbody tr').forEach(tr => {
                // Collect row data
                const rowData = {};
                let hasVal = false;
                tr.querySelectorAll('[data-base-key]').forEach(input => {
                    rowData[input.dataset.baseKey] = input.value;
                    if(input.value) hasVal = true;
                });
                if(hasVal) rows.push(rowData);
            });
            data[tableKey] = rows;
        }
    });

    const scriptBlock = document.getElementById('json-ld');
    if(scriptBlock) {
        scriptBlock.textContent = JSON.stringify(data, null, 2);
    }
    const debugBlock = document.getElementById('json-debug');
    if(debugBlock) {
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
    if(!c) return;
    try {
        const d = JSON.parse(c);
        // Static
        document.querySelectorAll('[data-json-path]').forEach(input => {
            const key = input.dataset.jsonPath;
            if(d[key] !== undefined) input.value = d[key];
        });
        // Dynamic Tables
        document.querySelectorAll('table.data-table.dynamic').forEach(table => {
            const tableKey = table.dataset.tableKey;
            const rowsData = d[tableKey];
            if(Array.isArray(rowsData)) {
                const tbody = table.querySelector('tbody');
                // Remove existing except first template
                const currentRows = tbody.querySelectorAll('.template-row');
                for(let i=1; i<currentRows.length; i++) currentRows[i].remove();
                
                rowsData.forEach((rowData, idx) => {
                    let row;
                    if (idx === 0) {
                        row = tbody.querySelector('.template-row');
                    } else {
                        // @ts-ignore
                        row = tbody.querySelector('.template-row').cloneNode(true);
                        tbody.appendChild(row);
                    }
                    if(row) {
                        row.querySelectorAll('input, select').forEach((input: any) => {
                             const k = input.dataset.baseKey;
                             if(k && rowData[k] !== undefined) input.value = rowData[k];
                        });
                    }
                });
            }
        });
    } catch(e) { console.error(e); }
}

function recalculate() {
    document.querySelectorAll('[data-formula]').forEach((calcField: any) => {
        const formula = calcField.dataset.formula;
        if (!formula) return;
        const row = calcField.closest('tr');
        const table = calcField.closest('table');
        
        const getValue = (varName) => {
            if (row) {
                const input = row.querySelector(\`[data-base-key="\${varName}"]\`);
                // @ts-ignore
                if (input && input.value !== '') return parseFloat(input.value);
            }
            const staticInput = document.querySelector(\`[data-json-path="\${varName}"]\`);
            // @ts-ignore
            if (staticInput && staticInput.value !== '') return parseFloat(staticInput.value);
            return 0;
        };

        let evalStr = formula.replace(/SUM\\(([a-zA-Z0-9_]+)\\)/g, (_, key) => {
            let sum = 0;
            const scope = table || document;
            scope.querySelectorAll(\`[data-base-key="\${key}"]\`).forEach((inp: any) => {
                sum += parseFloat(inp.value) || 0;
            });
            return sum;
        });

        // Strict replacement for variables to avoid matching '100' as '0' if strict
        // But here we just use regex match. 
        // IMPORTANT: Sort variable names by length desc to avoid partial matches?
        // Or simpler regex.
        evalStr = evalStr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
             // Math functions
             if(['Math','round','floor','ceil','abs','min','max'].includes(match)) return match;
             return getValue(match);
        });

        try {
            const result = new Function('return ' + evalStr)();
            if (typeof result === 'number' && !isNaN(result)) {
                calcField.value = Number.isInteger(result) ? result : result.toFixed(0); // Integer preferred
            } else {
                calcField.value = '';
            }
        } catch (e) {
            console.error(e);
            calcField.value = 'Err';
        }
    });
}

function saveDocument() {
    updateJsonLd();
    // Bake values into attributes
    document.querySelectorAll('input, textarea, select').forEach((el: any) => {
        if(el.type === 'checkbox' || el.type === 'radio') {
            if(el.checked) el.setAttribute('checked', 'checked');
            else el.removeAttribute('checked');
        } else {
            el.setAttribute('value', el.value);
            if(el.tagName === 'TEXTAREA') el.textContent = el.value;
        }
    });
    
    // Remove buttons
    document.querySelectorAll('button, .no-print').forEach(el => el.remove());
    
    // Disable inputs
    document.querySelectorAll('input, textarea, select').forEach((el: any) => el.setAttribute('readonly', 'readonly'));

    // Create blobs
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form_filled.html';
    a.click();
    
    // Reload to restore state? 
    setTimeout(() => location.reload(), 1000);
}

window.addTableRow = function(btn, tableKey) {
    const table = document.getElementById('tbl_' + tableKey);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    // @ts-ignore
    const templateRow = tbody.querySelector('.template-row');
    if (!templateRow) return;
    // @ts-ignore
    const newRow = templateRow.cloneNode(true);
    // @ts-ignore
    newRow.querySelectorAll('input').forEach(input => input.value = '');
    // @ts-ignore
    tbody.appendChild(newRow);
};

let tm;
document.addEventListener('input', () => { 
    recalculate();
    updateJsonLd();
    // @ts-ignore
    clearTimeout(tm); tm = setTimeout(saveToLS, 1000); 
});
window.addEventListener('DOMContentLoaded', () => {
    restoreFromLS();
    recalculate();
});
`;

export function generateHtml(markdown: string): string {
    const { html, jsonStructure } = parseMarkdown(markdown);

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${jsonStructure.name || 'Web/A Form'}</title>
    <style>${BASE_CSS}</style>
</head>
<body>
    <div class="page">
        ${html}
        <button class="primary no-print" onclick="saveDocument()">Complete & Save (Bake)</button>
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
