
import { Renderers } from './renderer';

export function parseMarkdown(text: string): { html: string, jsonStructure: any } {
    const lines = text.split('\n');

    let html = '';
    let jsonStructure: any = { "@context": "https://schema.org", "@type": "CreativeWork" };

    // Phase 0: Pre-scan for Master Data
    const masterData: Record<string, string[][]> = {};
    let scanInMaster = false;
    let scanMasterKey: string = '';

    lines.forEach(line => {
        const t = line.trim();
        const masterMatch = t.match(/^\[master:([^\]]+)\]$/);
        if (masterMatch) {
            scanMasterKey = masterMatch[1] || '';
            masterData[scanMasterKey] = [];
            scanInMaster = true;
            return;
        }
        if (scanInMaster && scanMasterKey) {
            if (t.startsWith('|')) {
                const cells = t.split('|').slice(1, -1).map(c => c.trim());
                const isSep = cells.every(c => c.match(/^-+$/));
                if (!isSep && scanMasterKey && masterData[scanMasterKey]) {
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
    let currentMasterKey: string = '';

    // Aggregator Schema
    jsonStructure.fields = [];
    jsonStructure.tables = {};
    jsonStructure.masterData = masterData;

    // Tab Logic
    let tabs: { id: string, title: string }[] = [];
    let currentTabId: string | null = null;
    let mainContentHtml = '';

    // Helper to append to the correct buffer
    const appendHtml = (str: string) => {
        mainContentHtml += str;
    };

    const processInlineTags = (text: string) => {
        return text.replace(/\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*?)\))?\]/g, (match, type, key, attrs) => {
            // Register field
            const label = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
            const cleanLabel = label ? label[1] : key;
            jsonStructure.fields.push({ key, label: cleanLabel, type: type || 'text' });

            // Render inline
            return Renderers.renderInput(type || 'text', key, attrs || '');
        });
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        // 0a. Master Table Marker (Allow unicode keys)
        const masterMatch = trimmed.match(/^\[master:([^\]]+)\]$/);
        if (masterMatch) {
            currentMasterKey = masterMatch[1] || '';
            return;
        }

        const dynTableMatch = trimmed.match(/^\[dynamic-table:([^\]]+)\]$/);
        if (dynTableMatch) {
            currentDynamicTableKey = dynTableMatch[1] || '';
            jsonStructure.tables[currentDynamicTableKey] = [];
            return;
        }

        // 0b. Table Logic
        // 0b. Table Logic
        if (trimmed.startsWith('|')) {
            if (!inTable) { // Start a new table if we aren't in one
                appendHtml(`<div class="form-row vertical"><div class="table-wrapper">`);

                let tableClass = 'data-table';
                let extraAttrs = '';

                if (currentDynamicTableKey) {
                    tableClass += ' dynamic';
                    extraAttrs = `id="tbl_${currentDynamicTableKey}" data-table-key="${currentDynamicTableKey}"`;
                } else if (currentMasterKey) {
                    tableClass += ' master';
                    extraAttrs = `data-master-key="${currentMasterKey}"`;
                }

                appendHtml(`<table class="${tableClass}" ${extraAttrs}>`);
                appendHtml(`<tbody>`);

                inTable = true;
                // We track if this specific table session is a master table, mostly for structure logic if needed
                inMasterTable = !!currentMasterKey;
            }

            const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
            const isSeparator = cells.every(c => c.match(/^-+$/));

            if (isSeparator) {
                // ignore separator lines in HTML usually, or could render them if strictly following MD-to-HTML but usually skipped in custom parsers
            } else {
                if (currentDynamicTableKey) {
                    const hasInput = cells.some(c => c.includes('['));
                    if (!hasInput) {
                        appendHtml(`<tr>${cells.map(c => `<th>${Renderers.escapeHtml(c)}</th>`).join('')}<th class="row-action-cell"></th></tr>`);
                    } else {
                        // Extract schema
                        const tableKey = currentDynamicTableKey!;
                        cells.forEach(cell => {
                            const match = cell.trim().match(/^\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
                            if (match) {
                                const [_, type, key, attrsParen, attrsColon] = match;
                                const attrs = attrsParen || attrsColon;
                                const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
                                const label = placeholderMatch ? placeholderMatch[1] : key;
                                jsonStructure.tables[tableKey].push({ key, label, type: type || 'text' });
                            }
                        });
                        // @ts-ignore
                        let trHtml = Renderers.tableRow(cells, true);
                        // Inject Delete Button cell for dynamic rows
                        trHtml = trHtml.replace('</tr>', '<td class="row-action-cell"><button type="button" class="remove-row-btn" onclick="removeTableRow(this)" tabindex="-1">×</button></td></tr>');
                        appendHtml(trHtml);
                    }
                } else if (inMasterTable) {
                    // Check if header row (heuristic: usually first row, but here we can check if it looks like a header or data)
                    // Simple heuristic: if we just started the table (masterData entry is empty or just initialized), treat first row as header?
                    // Actually, parser.ts "Phase 0" already consumed master data into JSON.
                    // Here we just want to render it visually.
                    // Let's treat the first row of any table (if not separator) as header if it doesn't contain inputs?
                    // Or simplified: Just render everything as rows. The CSS will style the first row if needed, 
                    // OR we can explicitly detect headers.
                    // Standard MD tables: Row 1 = Header, Row 2 = Sep, Row 3+ = Data.
                    // Since we are iterating line by line, detecting header vs body is stateful.
                    // For now, let's just use Renderers.tableRow. To make it look like a header, we might want <th>.
                    // But Renderers.tableRow uses <td>.
                    // Let's just render as normal rows for visibility.
                    // @ts-ignore
                    appendHtml(Renderers.tableRow(cells));
                } else {
                    // Static table (no master, no dynamic)
                    // @ts-ignore
                    appendHtml(Renderers.tableRow(cells));
                }
            }
            return;
        } else {
            if (inTable) {
                appendHtml('</tbody></table></div>');
                if (currentDynamicTableKey) {
                    appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
                    currentDynamicTableKey = null;
                }
                appendHtml('</div>');
                inTable = false;
                inMasterTable = false;
                currentMasterKey = ''; // Clear master key when table ends
            }
        }

        // 1. Headers
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1] ? headerMatch[1].length : 1;
            const content = headerMatch[2] || '';

            if (level === 1) {
                // H1 is Document Title
                appendHtml(`<h1>${Renderers.escapeHtml(content)}</h1>`);
                jsonStructure.name = content;
            } else if (level === 2) {
                // H2 is Tab
                if (currentTabId) {
                    appendHtml('</div>'); // Close previous tab
                }
                const tabId = 'tab-' + (tabs.length + 1);
                tabs.push({ id: tabId, title: content });
                currentTabId = tabId;
                // Start new tab div, hidden by default (class logic handles active)
                // data-tab-title for Print CSS
                const activeClass = tabs.length === 1 ? ' active' : '';
                appendHtml(`<div id="${tabId}" class="tab-content${activeClass}" data-tab-title="${Renderers.escapeHtml(content)}">`);
                // Note: We do NOT render H2 inside the tab content as a heading, 
                // the tab button acts as the heading.
            } else {
                // H3-H6
                appendHtml(`<h${level}>${Renderers.escapeHtml(content)}</h${level}>`);
            }
            currentRadioGroup = null;
        }
        // 2. Radio Options (Indented)
        else if ((line.startsWith('  - ') || line.startsWith('\t- '))) {
            if (currentRadioGroup) {
                let label = trimmed.replace(/^-\s*/, '');
                let checked = false;
                if (label.startsWith('[x] ')) {
                    checked = true;
                    label = label.substring(4);
                }
                // @ts-ignore
                appendHtml(Renderers.radioOption(currentRadioGroup.key, label, label, checked));
            }
        }
        // 3. Syntax: - [type:key (attrs)] Label
        else if (trimmed.startsWith('- [')) {
            const match = trimmed.match(/^-\s*\[([a-z]+):([^\]\s:\(\)]+)(?:\s*\((.*)\))?\]\s*(.*)$/);

            if (match) {
                const [_, type, key, attrs, label] = match;
                currentRadioGroup = null;
                const cleanLabel = (label || '').trim();

                jsonStructure.fields.push({ key, label: cleanLabel, type });

                // Explicit dispatch to avoid dynamic property access issues
                if (type === 'radio') {
                    currentRadioGroup = { key, label: cleanLabel, attrs: attrs || '' };
                    appendHtml(Renderers.radioStart(key, cleanLabel, attrs));
                }
                else if (type === 'text') appendHtml(Renderers.text(key, cleanLabel, attrs));
                else if (type === 'number') appendHtml(Renderers.number(key, cleanLabel, attrs));
                else if (type === 'date') appendHtml(Renderers.date(key, cleanLabel, attrs));
                else if (type === 'textarea') appendHtml(Renderers.textarea(key, cleanLabel, attrs));
                else if (type === 'search') appendHtml(Renderers.search(key, cleanLabel, attrs));
                else if (type === 'calc') appendHtml(Renderers.calc(key, cleanLabel, attrs));
                else if (type === 'datalist') appendHtml(Renderers.renderInput(type, key, attrs));
                else if (type && Renderers[type]) {
                    appendHtml(Renderers[type](key, cleanLabel, attrs));
                } else {
                    console.warn(`Unknown type: ${type}`, Object.keys(Renderers));
                    appendHtml(`<p style="color:red">Unknown type: ${type}</p>`);
                }
            }
        }
        else if (trimmed.startsWith('---')) {
            if (!currentTabId) { // Only render HR if not in tabs (tabs replace HR separation usually)
                appendHtml('<hr>');
            }
            currentRadioGroup = null;
        }
        // HTML Passthrough for layout
        else if (trimmed.startsWith('<')) {
            if (currentRadioGroup) { appendHtml('</div></div>'); currentRadioGroup = null; }
            appendHtml(processInlineTags(trimmed));
        }
        else if (trimmed.length > 0) {
            if (currentRadioGroup) { appendHtml('</div></div>'); currentRadioGroup = null; }
            appendHtml(`<p>${Renderers.escapeHtml(processInlineTags(trimmed))}</p>`);
        } else {
            if (currentRadioGroup) { appendHtml('</div></div>'); currentRadioGroup = null; }
        }
    });

    if (inTable) {
        appendHtml('</tbody></table></div>');
        if (currentDynamicTableKey) {
            appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
            currentDynamicTableKey = null;
        }
        appendHtml('</div>');
    }
    if (currentRadioGroup) appendHtml('</div></div>');
    if (currentTabId) appendHtml('</div>'); // Close last tab

    // Final Assembly: Inject Tab Nav if tabs exist
    const toolbarButtons = `
            <button class="secondary" onclick="window.clearData()" style="color: #666; border-color: transparent;" data-i18n="clear_btn">Clear</button>
            <div style="flex:1"></div>
            <button class="secondary" onclick="window.saveDraft()" data-i18n="work_save_btn">Save HTML</button>
            <button class="primary" onclick="window.signAndDownload()" data-i18n="sign_btn">Sign & Save</button>
    `;

    const toolbarHtml = `<div class="no-print form-toolbar" style="display: flex; gap: 10px; align-items: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee;">
            ${toolbarButtons}
        </div>`;

    if (tabs.length > 0) {
        let navHtml = '<div class="tabs-nav">';
        tabs.forEach((tab, idx) => {
            const activeClass = idx === 0 ? ' active' : '';
            navHtml += `<button class="tab-btn${activeClass}" onclick="switchTab(this, '${tab.id}')">${Renderers.escapeHtml(tab.title)}</button>`;
        });
        // Add spacer and Save button
        navHtml += `<div class="no-print" style="display: flex; gap: 10px; align-items: center; flex-grow: 1;">
            ${toolbarButtons}
        </div>`;
        navHtml += '</div>';

        // Find position to insert Nav: After H1
        if (mainContentHtml.includes('</h1>')) {
            html = mainContentHtml.replace('</h1>', '</h1>' + navHtml);
        } else {
            html = navHtml + mainContentHtml;
        }
    } else {
        html = mainContentHtml + toolbarHtml;
    }

    return { html, jsonStructure };
}
