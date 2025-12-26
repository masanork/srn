
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

    // Tab Logic
    let tabs: { id: string, title: string }[] = [];
    let currentTabId: string | null = null;
    let mainContentHtml = ''; 

    // Helper to append to the correct buffer
    const appendHtml = (str: string) => {
        mainContentHtml += str;
    };

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
                    appendHtml(`<div class="form-row vertical"><div class="table-wrapper">`);
                    if (currentDynamicTableKey) {
                        appendHtml(`<table class="data-table dynamic" id="tbl_${currentDynamicTableKey}" data-table-key="${currentDynamicTableKey}">`);
                    } else {
                        appendHtml(`<table class="data-table">`);
                    }
                    appendHtml(`<tbody>`);
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
                        appendHtml(`<tr>${cells.map(c => `<th>${Renderers.escapeHtml(c)}</th>`).join('')}</tr>`);
                    } else {
                        // @ts-ignore
                        appendHtml(Renderers.tableRow(cells, true));
                    }
                } else {
                    // @ts-ignore
                    appendHtml(Renderers.tableRow(cells));
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
                appendHtml('</tbody></table></div>');
                if (currentDynamicTableKey) {
                    appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
                    currentDynamicTableKey = null;
                }
                appendHtml('</div>');
                inTable = false;
            }
        }

        // 1. Headers
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const content = headerMatch[2];
            
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
            const match = trimmed.match(/^-\s*\[([a-z]+):([a-zA-Z0-9_]+)(?:\s*\((.*)\))?\]\s*(.*)$/);

            if (match) {
                const [_, type, key, attrs, label] = match;
                currentRadioGroup = null;
                const cleanLabel = (label || '').trim();

                if (type === 'radio') {
                    currentRadioGroup = { key, label: cleanLabel, attrs };
                    // @ts-ignore
                    appendHtml(Renderers.radioStart(key, cleanLabel, attrs));
                } else if (Renderers[type]) {
                    // @ts-ignore
                    appendHtml(Renderers[type](key, cleanLabel, attrs));
                } else {
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
            appendHtml(trimmed);
        }
        else if (trimmed.length > 0) {
            if (currentRadioGroup) { appendHtml('</div></div>'); currentRadioGroup = null; }
            appendHtml(`<p>${Renderers.escapeHtml(trimmed)}</p>`);
        } else {
            if (currentRadioGroup) { appendHtml('</div></div>'); currentRadioGroup = null; }
        }
    });

    if (inTable) appendHtml('</tbody></table></div></div>');
    if (currentRadioGroup) appendHtml('</div></div>');
    if (currentTabId) appendHtml('</div>'); // Close last tab

    // Final Assembly: Inject Tab Nav if tabs exist
    if (tabs.length > 0) {
        let navHtml = '<div class="tabs-nav">';
        tabs.forEach((tab, idx) => {
            const activeClass = idx === 0 ? ' active' : '';
            navHtml += `<button class="tab-btn${activeClass}" onclick="switchTab(this, '${tab.id}')">${Renderers.escapeHtml(tab.title)}</button>`;
        });
        // Add spacer and Save button
        navHtml += '<div style="flex:1"></div>';
        navHtml += `<button class="primary" onclick="saveDocument()" data-i18n="save_btn">Save</button>`;
        navHtml += '</div>';
        
        // Find position to insert Nav: After H1
        // Simplified: Just prepend to mainContentHtml, but after H1 if exists.
        // Actually, H1 is inside mainContentHtml.
        // Let's use Regex to inject after H1, or top if no H1.
        if (mainContentHtml.includes('</h1>')) {
            html = mainContentHtml.replace('</h1>', '</h1>' + navHtml);
        } else {
            html = navHtml + mainContentHtml;
        }
    } else {
        html = mainContentHtml;
    }

    return { html, jsonStructure };
}
