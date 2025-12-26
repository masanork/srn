
import { Renderers } from './renderer';

export function parseMarkdown(text: string): { html: string, jsonStructure: any } {
    const lines = text.split('\n');

    let html = '';
    let jsonStructure: any = { "@context": "https://schema.org", "@type": "CreativeWork" };

    // Phase 0: Pre-scan for Master Data
    const masterData: Record<string, string[][]> = {};
    let scanInMaster = false;
    let scanMasterKey: string | null = null;

    lines.forEach(line => {
        const t = line.trim();
        const masterMatch = t.match(/^\[master:([a-zA-Z0-9_]+)\]$/);
        if (masterMatch) {
            scanMasterKey = masterMatch[1];
            masterData[scanMasterKey] = [];
            scanInMaster = true;
            return;
        }
        if (scanInMaster && scanMasterKey) {
            if (t.startsWith('|')) {
                const cells = t.split('|').slice(1, -1).map(c => c.trim());
                const isSep = cells.every(c => c.match(/^-+$/));
                if (!isSep) {
                    masterData[scanMasterKey].push(cells);
                }
            } else {
                if (t.length > 0) scanInMaster = false;
            }
        }
    });
    // @ts-ignore
    Renderers.setMasterData(masterData);

    let currentRadioGroup: { key: string, label: string, attrs: string } | null = null;
    let currentDynamicTableKey: string | null = null;
    let inTable = false;
    let inMasterTable = false;
    let currentMasterKey: string | null = null;

    lines.forEach((line) => {
        const trimmed = line.trim();

        // 0a. Master Table Marker
        const masterMatch = trimmed.match(/^\[master:([a-zA-Z0-9_]+)\]$/);
        if (masterMatch) {
            currentMasterKey = masterMatch[1];
            return;
        }

        const dynTableMatch = trimmed.match(/^\[dynamic-table:([a-zA-Z0-9_]+)\]$/);
        if (dynTableMatch) {
            currentDynamicTableKey = dynTableMatch[1];
            return;
        }

        // 0b. Table Logic
        if (trimmed.startsWith('|')) {
            if (!inTable && !inMasterTable) {
                if (currentMasterKey) {
                    inMasterTable = true;
                } else {
                    html += `<div class="form-row vertical"><div class="table-wrapper">`;
                    if (currentDynamicTableKey) {
                        html += `<table class="data-table dynamic" id="tbl_${currentDynamicTableKey}" data-table-key="${currentDynamicTableKey}">`;
                    } else {
                        html += `<table class="data-table">`;
                    }
                    html += `<tbody>`;
                    inTable = true;
                }
            }

            const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
            const isSeparator = cells.every(c => c.match(/^-+$/));

            if (inMasterTable) {
                return;
            }

            if (isSeparator) {
                // ignore
            } else {
                if (currentDynamicTableKey) {
                    const hasInput = cells.some(c => c.includes('['));
                    if (!hasInput) {
                        html += `<tr>${cells.map(c => `<th>${Renderers.escapeHtml(c)}</th>`).join('')}</tr>`;
                    } else {
                        // @ts-ignore
                        html += Renderers.tableRow(cells, true);
                    }
                } else {
                    // @ts-ignore
                    html += Renderers.tableRow(cells);
                }
            }
            return;
        } else {
            if (inMasterTable) {
                inMasterTable = false;
                currentMasterKey = null;
                return;
            }

            if (inTable) {
                html += '</tbody></table></div>';
                if (currentDynamicTableKey) {
                    html += `<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')">+ Add Row</button>`;
                    currentDynamicTableKey = null;
                }
                html += '</div>';
                inTable = false;
            }
        }

        // 1. Headers
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const content = headerMatch[2];
            html += `<h${level}>${Renderers.escapeHtml(content)}</h${level}>`;
            if (level === 1) jsonStructure.name = content;
            currentRadioGroup = null;
        }
        // 2. Radio Options (Indented) - Check BEFORE generic input syntax to avoid false positives
        else if ((line.startsWith('  - ') || line.startsWith('\t- '))) {
            if (currentRadioGroup) {
                let label = trimmed.replace(/^-\s*/, '');
                let checked = false;
                if (label.startsWith('[x] ')) {
                    checked = true;
                    label = label.substring(4);
                }
                // @ts-ignore
                html += Renderers.radioOption(currentRadioGroup.key, label, label, checked);
            }
        }
        // 3. Syntax: - [type:key (attrs)] Label
        else if (trimmed.startsWith('- [')) {
            const match = trimmed.match(/^-\s*\[([a-z]+):([a-zA-Z0-9_]+)(?:\s*\(([^)]+)\))?\]\s*(.*)$/);

            if (match) {
                const [_, type, key, attrs, label] = match;
                currentRadioGroup = null;
                const cleanLabel = (label || '').trim();

                if (type === 'radio') {
                    currentRadioGroup = { key, label: cleanLabel, attrs };
                    // @ts-ignore
                    html += Renderers.radioStart(key, cleanLabel, attrs);
                } else if (Renderers[type]) {
                    // @ts-ignore
                    html += Renderers[type](key, cleanLabel, attrs);
                } else {
                    html += `<p style="color:red">Unknown type: ${type}</p>`;
                }
            }
        }
        else if (trimmed.startsWith('---')) {
            html += '<hr>';
            currentRadioGroup = null;
        }
        else if (trimmed.length > 0) {
            if (currentRadioGroup) { html += '</div></div>'; currentRadioGroup = null; }
            html += `<p>${Renderers.escapeHtml(trimmed)}</p>`;
        } else {
            if (currentRadioGroup) { html += '</div></div>'; currentRadioGroup = null; }
        }
    });

    if (inTable) html += '</tbody></table></div></div>';
    if (currentRadioGroup) html += '</div></div>';

    return { html, jsonStructure };
}
