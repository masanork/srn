import { baseLayout } from './base.js';
import { parseMarkdown } from '../../form/parser.js';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}

export function formLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[], vc?: object) {
    const { html, jsonStructure } = parseMarkdown(rawMarkdown);
    const lang = (data.lang || 'ja').toString();

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const verificationDetails = vc ? `
        <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                <span>✓</span>
                <span data-i18n-ja="発行元による真正性の証明" data-i18n-en="Issuer Authenticity Proof">発行元による真正性の証明</span>
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: normal;">Template Signed</span>
            </summary>
            <div style="padding: 1rem 0;">
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
            </div>
        </details>
    ` : '';

    const content = `
        <div class="weba-form-container">
            ${html}

            <footer class="no-print" style="margin-top: 5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <details>
                        <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                            <span style="color: #3b82f6;">ℹ️</span>
                            <span data-i18n-ja="記入内容（データ）の確認" data-i18n-en="Review Form Data">記入内容（データ）の確認</span>
                        </summary>
                        <div style="padding: 1rem 0;">
                            <pre id="json-debug" style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;"></pre>
                        </div>
                    </details>
                    ${verificationDetails}
                </div>
            </footer>
        </div>
        ${structureScript}
        <script src="./assets/form-bundle.js"></script>
    `;

    return baseLayout({
        title: data.title,
        content: content,
        fontCss,
        fontFamilies,
        lang: lang
    });
}

export function formReportLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[]) {
    const { jsonStructure } = parseMarkdown(rawMarkdown);
    const lang = (data.lang || 'ja').toString();
    const title = data.title ? `${data.title} (集計)` : 'Web/A Form (集計)';

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const content = `
        <div class="weba-report-container">
            <h1>${title}</h1>
            <div class="report-controls" style="margin: 1rem 0; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
                <input id="weba-report-files" type="file" multiple accept=".html" style="padding: 0.4rem;">
                <label style="display: flex; gap: 0.5rem; align-items: center;">
                    <span data-i18n-ja="X軸" data-i18n-en="X Axis">X軸</span>
                    <select id="weba-x-key"></select>
                </label>
                <label style="display: flex; gap: 0.5rem; align-items: center;">
                    <span data-i18n-ja="Y軸" data-i18n-en="Y Axis">Y軸</span>
                    <select id="weba-y-key"></select>
                </label>
                <span id="weba-report-status" style="color: #666;"></span>
            </div>
            <canvas id="weba-scatter" width="900" height="420" style="border: 1px solid #ddd; border-radius: 6px; background: #fff;"></canvas>
            <div id="weba-report-table" style="margin-top: 1rem; overflow-x: auto;"></div>
        </div>
        ${structureScript}
        <script>
            const statusEl = document.getElementById('weba-report-status');
            const fileInput = document.getElementById('weba-report-files');
            const xSelect = document.getElementById('weba-x-key');
            const ySelect = document.getElementById('weba-y-key');
            const tableHost = document.getElementById('weba-report-table');
            const canvas = document.getElementById('weba-scatter');
            const ctx = canvas.getContext('2d');

            const parseHtmlJsonLd = (htmlText) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                let script = doc.querySelector('#data-layer');
                if (!script) script = doc.querySelector('script[type="application/ld+json"]');
                if (!script) return null;
                try { return JSON.parse(script.textContent || ''); } catch { return null; }
            };

            const flatten = (obj, prefix, out) => {
                if (!obj || typeof obj !== 'object') return;
                for (const [key, value] of Object.entries(obj)) {
                    const path = prefix ? prefix + '.' + key : key;
                    if (Array.isArray(value)) {
                        value.forEach((entry, idx) => {
                            if (entry && typeof entry === 'object') {
                                flatten(entry, path + '[' + idx + ']', out);
                            } else {
                                out[path + '[' + idx + ']'] = entry;
                            }
                        });
                    } else if (value && typeof value === 'object') {
                        flatten(value, path, out);
                    } else {
                        out[path] = value;
                    }
                }
            };

            const isNumeric = (val) => {
                if (val === null || val === undefined) return false;
                const num = typeof val === 'number' ? val : parseFloat(String(val));
                return Number.isFinite(num);
            };

            const drawScatter = (rows, xKey, yKey) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const points = rows
                    .map(r => ({ x: r[xKey], y: r[yKey], raw: r }))
                    .filter(p => isNumeric(p.x) && isNumeric(p.y))
                    .map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));

                if (points.length === 0) {
                    ctx.fillStyle = '#666';
                    ctx.fillText('No numeric data for scatter plot.', 20, 30);
                    return;
                }

                const padding = 40;
                const xs = points.map(p => p.x);
                const ys = points.map(p => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                const scaleX = (val) => padding + ((val - minX) / (maxX - minX || 1)) * (canvas.width - padding * 2);
                const scaleY = (val) => canvas.height - padding - ((val - minY) / (maxY - minY || 1)) * (canvas.height - padding * 2);

                ctx.strokeStyle = '#ccc';
                ctx.beginPath();
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, canvas.height - padding);
                ctx.lineTo(canvas.width - padding, canvas.height - padding);
                ctx.stroke();

                ctx.fillStyle = '#1f77b4';
                points.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(scaleX(p.x), scaleY(p.y), 4, 0, Math.PI * 2);
                    ctx.fill();
                });
            };

            const renderTable = (rows, keys) => {
                if (rows.length === 0) {
                    tableHost.innerHTML = '';
                    return;
                }
                const header = keys.map(k => '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;">' + k + '</th>').join('');
                const body = rows.slice(0, 50).map(r => {
                    const cells = keys.map(k => '<td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;">' + (r[k] ?? '') + '</td>').join('');
                    return '<tr>' + cells + '</tr>';
                }).join('');
                tableHost.innerHTML = '<table style="border-collapse: collapse; min-width: 600px;">' +
                    '<thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table>';
            };

            const updateScatter = (rows) => {
                const xKey = xSelect.value;
                const yKey = ySelect.value;
                if (xKey && yKey) drawScatter(rows, xKey, yKey);
            };

            let aggregatedRows = [];
            fileInput.addEventListener('change', async () => {
                const files = Array.from(fileInput.files || []);
                aggregatedRows = [];
                statusEl.textContent = '';
                if (files.length === 0) return;

                for (const file of files) {
                    const text = await file.text();
                    const jsonLd = parseHtmlJsonLd(text);
                    if (!jsonLd) continue;
                    const flat = {};
                    flatten(jsonLd, '', flat);
                    flat['_filename'] = file.name;
                    aggregatedRows.push(flat);
                }

                if (aggregatedRows.length === 0) {
                    statusEl.textContent = 'No JSON-LD found.';
                    return;
                }

                const keys = Array.from(new Set(aggregatedRows.flatMap(r => Object.keys(r)))).sort();
                const numericKeys = keys.filter(k => aggregatedRows.some(r => isNumeric(r[k])));

                xSelect.innerHTML = numericKeys.map(k => '<option value="' + k + '">' + k + '</option>').join('');
                ySelect.innerHTML = numericKeys.map(k => '<option value="' + k + '">' + k + '</option>').join('');

                statusEl.textContent = 'Loaded ' + aggregatedRows.length + ' files.';
                renderTable(aggregatedRows, keys);
                updateScatter(aggregatedRows);
            });

            xSelect.addEventListener('change', () => updateScatter(aggregatedRows));
            ySelect.addEventListener('change', () => updateScatter(aggregatedRows));
        </script>
    `;

    return baseLayout({
        title: `${data.title} (Report)`,
        content: content,
        fontCss,
        fontFamilies,
        lang: lang
    });
}
