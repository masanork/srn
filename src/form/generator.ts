
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

// runtime logic removed (moved to client/ bundle)
import { CLIENT_BUNDLE } from './client/embed';
export const RUNTIME_SCRIPT = CLIENT_BUNDLE;

export function initRuntime(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).recalculate) {
        console.log("Runtime already loaded, skipping init");
        return;
    }
    // Execute the bundled runtime script
    // Note: RUNTIME_SCRIPT contains the full bundled code
    try {
        // eslint-disable-next-line no-eval
        eval(RUNTIME_SCRIPT);
    } catch (e) {
        console.error("Failed to init runtime from bundle:", e);
    }
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
