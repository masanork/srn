// src/weba/renderer.ts
var Renderers = {
  _context: { masterData: {} },
  setMasterData(data) {
    this._context.masterData = data;
  },
  escapeHtml(str) {
    if (!str)
      return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  },
  formatHint(text) {
    const escaped = this.escapeHtml(text);
    return escaped.replace(/&lt;br\s*\/?&gt;/gi, "<br>").replace(/\r?\n/g, "<br>");
  },
  getStyle(attrs) {
    if (!attrs)
      return "";
    let style = "";
    if (attrs.includes("size:L"))
      style += "font-size: 1.25em;";
    if (attrs.includes("size:S"))
      style += "font-size: 0.8em;";
    if (attrs.includes("size:XL"))
      style += "font-size: 1.5em; font-weight: bold;";
    if (attrs.includes("align:R"))
      style += "text-align: right;";
    if (attrs.includes("align:C"))
      style += "text-align: center;";
    if (attrs.includes("bold"))
      style += "font-weight: bold;";
    return style;
  },
  getExtraAttrs(attrs) {
    if (!attrs)
      return "";
    let extra = "";
    const lenMatch = attrs.match(/(?:len|max):(\d+)/);
    if (lenMatch)
      extra += ` maxlength="${lenMatch[1]}"`;
    const valMatch = attrs.match(/val="([^"]+)"/);
    if (valMatch) {
      extra += ` value="${this.escapeHtml(valMatch[1])}"`;
    } else {
      const valMatchSimple = attrs.match(/val=([^\s\)]+)/);
      if (valMatchSimple)
        extra += ` value="${this.escapeHtml(valMatchSimple[1])}"`;
    }
    return extra;
  },
  text(key, label, attrs) {
    const valMatch = (attrs || "").match(/val="([^"]+)"/) || (attrs || "").match(/val='([^']+)'/) || (attrs || "").match(/val=([^ ]+)/);
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const val = valMatch ? valMatch[1] : "";
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : "";
    return `
        <div class="form-row" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" class="form-input" data-json-path="${key}" value="${this.escapeHtml(val)}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
  },
  number(key, label, attrs) {
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : "";
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="number" class="form-input" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
  },
  date(key, label, attrs) {
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="date" class="form-input" data-json-path="${key}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
  },
  textarea(key, label, attrs) {
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : "";
    return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <textarea class="form-input" rows="5" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></textarea>
            ${hint}
        </div>`;
  },
  radioStart(key, label, attrs) {
    return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div class="radio-group" style="padding-left: 10px;">`;
  },
  radioOption(name, val, label, checked) {
    return `
            <label style="display:block; margin-bottom:5px;">
                <input type="radio" name="${name}" value="${this.escapeHtml(val)}" ${checked ? "checked" : ""}> ${this.escapeHtml(label)}
            </label>`;
  },
  calc(key, label, attrs) {
    const formulaMatch = (attrs || "").match(/formula="([^"]+)"/) || (attrs || "").match(/formula='([^']+)'/);
    const formula = formulaMatch ? formulaMatch[1] : "";
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" readonly class="form-input" data-json-path="${key}" data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
  },
  search(key, label, attrs) {
    const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_]+)/);
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const srcKey = srcMatch ? srcMatch[1] : "";
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : "";
    return `
        <div class="form-row autocomplete-container" style="position:relative; z-index:100;">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div style="flex:1; position:relative;">
                <input type="text" class="form-input search-input" autocomplete="off" 
                    data-json-path="${key}" 
                    data-master-src="${srcKey}"
                    placeholder="${this.escapeHtml(placeholder)}" 
                    style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
                <div class="search-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; background:white; border:1px solid #ccc; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:0 0 4px 4px; z-index:1001;"></div>
            </div>
            ${hint}
        </div>`;
  },
  tableRow(cells, isTemplate = false) {
    const tds = cells.map((cell) => {
      const trimmed = cell.trim();
      const match = trimmed.match(/^\[(?:([a-z]+):)?([a-zA-Z0-9_]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
      if (match) {
        let [_, type, key, attrsParen, attrsColon] = match;
        const attrs = attrsParen || attrsColon;
        const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
        const placeholder = placeholderMatch ? `placeholder="${this.escapeHtml(placeholderMatch[1])}"` : "";
        if (type === "calc") {
          const formulaMatch = (attrs || "").match(/formula="([^"]+)"/) || (attrs || "").match(/formula='([^']+)'/);
          const formula = formulaMatch ? formulaMatch[1] : "";
          const commonClass = isTemplate ? "form-input template-input" : "form-input";
          const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
          return `<td><input type="text" readonly class="${commonClass}" ${dataAttr} data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
        }
        if (type === "datalist") {
          const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_]+)/);
          const labelIndexMatch = (attrs || "").match(/label:(\d+)/);
          let optionsHtml = "";
          const srcKey = srcMatch ? srcMatch[1] : "";
          if (srcKey && this._context.masterData && this._context.masterData[srcKey]) {
            const data = this._context.masterData[srcKey];
            const lIdx = labelIndexMatch ? parseInt(labelIndexMatch[1]) - 1 : 1;
            data.forEach((row) => {
              if (row.length > lIdx) {
                optionsHtml += `<option value="${this.escapeHtml(row[lIdx] || "")}"></option>`;
              }
            });
          }
          const listId = "list_" + key + "_" + Math.floor(Math.random() * 1e4);
          const commonClass = isTemplate ? "form-input template-input" : "form-input";
          const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
          return `<td><input type="text" list="${listId}" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}><datalist id="${listId}">${optionsHtml}</datalist></td>`;
        }
        if (type === "search") {
          const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_]+)/);
          const srcKey = srcMatch ? srcMatch[1] : "";
          const commonClass = isTemplate ? "form-input template-input search-input" : "form-input search-input";
          const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
          return `<td>
                        <div style="position:relative;">
                            <input type="text" class="${commonClass}" ${dataAttr} autocomplete="off" data-master-src="${srcKey}" ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
                            <div class="search-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; background:white; border:1px solid #ccc; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px rgba(0,0,0,0.1); z-index:1001;"></div>
                        </div>
                    </td>`;
        }
        if (type === "number") {
          const commonClass = isTemplate ? "form-input template-input" : "form-input";
          const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
          return `<td><input type="number" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
        }
        if (isTemplate) {
          return `<td><input type="text" class="form-input template-input" data-base-key="${key}" ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
        } else {
          return `<td><input type="text" class="form-input" data-json-path="${key}" ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
        }
      } else {
        return `<td>${this.escapeHtml(trimmed)}</td>`;
      }
    }).join("");
    return `<tr ${isTemplate ? 'class="template-row"' : ""}>${tds}</tr>`;
  }
};

// src/weba/parser.ts
function parseMarkdown(text) {
  const lines = text.split(`
`);
  let html = "";
  let jsonStructure = { "@context": "https://schema.org", "@type": "CreativeWork" };
  const masterData = {};
  let scanInMaster = false;
  let scanMasterKey = null;
  lines.forEach((line) => {
    const t = line.trim();
    const masterMatch = t.match(/^\[master:([a-zA-Z0-9_]+)\]$/);
    if (masterMatch) {
      scanMasterKey = masterMatch[1];
      masterData[scanMasterKey] = [];
      scanInMaster = true;
      return;
    }
    if (scanInMaster && scanMasterKey) {
      if (t.startsWith("|")) {
        const cells = t.split("|").slice(1, -1).map((c) => c.trim());
        const isSep = cells.every((c) => c.match(/^-+$/));
        if (!isSep) {
          masterData[scanMasterKey].push(cells);
        }
      } else {
        if (t.length > 0)
          scanInMaster = false;
      }
    }
  });
  Renderers.setMasterData(masterData);
  let currentRadioGroup = null;
  let currentDynamicTableKey = null;
  let inTable = false;
  let inMasterTable = false;
  let currentMasterKey = null;
  jsonStructure.fields = [];
  jsonStructure.tables = {};
  jsonStructure.masterData = masterData;
  let tabs = [];
  let currentTabId = null;
  let mainContentHtml = "";
  const appendHtml = (str) => {
    mainContentHtml += str;
  };
  lines.forEach((line) => {
    const trimmed = line.trim();
    const masterMatch = trimmed.match(/^\[master:([a-zA-Z0-9_]+)\]$/);
    if (masterMatch) {
      currentMasterKey = masterMatch[1];
      return;
    }
    const dynTableMatch = trimmed.match(/^\[dynamic-table:([a-zA-Z0-9_]+)\]$/);
    if (dynTableMatch) {
      currentDynamicTableKey = dynTableMatch[1];
      jsonStructure.tables[currentDynamicTableKey] = [];
      return;
    }
    if (trimmed.startsWith("|")) {
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
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      const isSeparator = cells.every((c) => c.match(/^-+$/));
      if (inMasterTable) {
        return;
      }
      if (isSeparator) {} else {
        if (currentDynamicTableKey) {
          const hasInput = cells.some((c) => c.includes("["));
          if (!hasInput) {
            appendHtml(`<tr>${cells.map((c) => `<th>${Renderers.escapeHtml(c)}</th>`).join("")}</tr>`);
          } else {
            const tableKey = currentDynamicTableKey;
            cells.forEach((cell) => {
              const match = cell.trim().match(/^\[(?:([a-z]+):)?([a-zA-Z0-9_]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
              if (match) {
                const [_, type, key, attrsParen, attrsColon] = match;
                const attrs = attrsParen || attrsColon;
                const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
                const label = placeholderMatch ? placeholderMatch[1] : key;
                jsonStructure.tables[tableKey].push({ key, label, type: type || "text" });
              }
            });
            appendHtml(Renderers.tableRow(cells, true));
          }
        } else {
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
        appendHtml("</tbody></table></div>");
        if (currentDynamicTableKey) {
          appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
          currentDynamicTableKey = null;
        }
        appendHtml("</div>");
        inTable = false;
      }
    }
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      if (level === 1) {
        appendHtml(`<h1>${Renderers.escapeHtml(content)}</h1>`);
        jsonStructure.name = content;
      } else if (level === 2) {
        if (currentTabId) {
          appendHtml("</div>");
        }
        const tabId = "tab-" + (tabs.length + 1);
        tabs.push({ id: tabId, title: content });
        currentTabId = tabId;
        const activeClass = tabs.length === 1 ? " active" : "";
        appendHtml(`<div id="${tabId}" class="tab-content${activeClass}" data-tab-title="${Renderers.escapeHtml(content)}">`);
      } else {
        appendHtml(`<h${level}>${Renderers.escapeHtml(content)}</h${level}>`);
      }
      currentRadioGroup = null;
    } else if (line.startsWith("  - ") || line.startsWith("\t- ")) {
      if (currentRadioGroup) {
        let label = trimmed.replace(/^-\s*/, "");
        let checked = false;
        if (label.startsWith("[x] ")) {
          checked = true;
          label = label.substring(4);
        }
        appendHtml(Renderers.radioOption(currentRadioGroup.key, label, label, checked));
      }
    } else if (trimmed.startsWith("- [")) {
      const match = trimmed.match(/^-\s*\[([a-z]+):([a-zA-Z0-9_]+)(?:\s*\((.*)\))?\]\s*(.*)$/);
      if (match) {
        const [_, type, key, attrs, label] = match;
        currentRadioGroup = null;
        const cleanLabel = (label || "").trim();
        jsonStructure.fields.push({ key, label: cleanLabel, type });
        if (type === "radio") {
          currentRadioGroup = { key, label: cleanLabel, attrs };
          appendHtml(Renderers.radioStart(key, cleanLabel, attrs));
        } else if (Renderers[type]) {
          appendHtml(Renderers[type](key, cleanLabel, attrs));
        } else {
          appendHtml(`<p style="color:red">Unknown type: ${type}</p>`);
        }
      }
    } else if (trimmed.startsWith("---")) {
      if (!currentTabId) {
        appendHtml("<hr>");
      }
      currentRadioGroup = null;
    } else if (trimmed.startsWith("<")) {
      if (currentRadioGroup) {
        appendHtml("</div></div>");
        currentRadioGroup = null;
      }
      appendHtml(trimmed);
    } else if (trimmed.length > 0) {
      if (currentRadioGroup) {
        appendHtml("</div></div>");
        currentRadioGroup = null;
      }
      appendHtml(`<p>${Renderers.escapeHtml(trimmed)}</p>`);
    } else {
      if (currentRadioGroup) {
        appendHtml("</div></div>");
        currentRadioGroup = null;
      }
    }
  });
  if (inTable)
    appendHtml("</tbody></table></div></div>");
  if (currentRadioGroup)
    appendHtml("</div></div>");
  if (currentTabId)
    appendHtml("</div>");
  if (tabs.length > 0) {
    let navHtml = '<div class="tabs-nav">';
    tabs.forEach((tab, idx) => {
      const activeClass = idx === 0 ? " active" : "";
      navHtml += `<button class="tab-btn${activeClass}" onclick="switchTab(this, '${tab.id}')">${Renderers.escapeHtml(tab.title)}</button>`;
    });
    navHtml += '<div style="flex:1"></div>';
    navHtml += `<button class="primary" onclick="saveDocument()" data-i18n="save_btn">Save</button>`;
    navHtml += "</div>";
    if (mainContentHtml.includes("</h1>")) {
      html = mainContentHtml.replace("</h1>", "</h1>" + navHtml);
    } else {
      html = navHtml + mainContentHtml;
    }
  } else {
    html = mainContentHtml;
  }
  return { html, jsonStructure };
}

// src/weba/generator.ts
var BASE_CSS = `
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
function runtime() {
  const w = window;
  const FORM_ID = "WebA_" + window.location.pathname;
  function updateJsonLd() {
    const data = w.generatedJsonStructure || {};
    document.querySelectorAll("[data-json-path]").forEach((input) => {
      const key = input.dataset.jsonPath;
      if (key) {
        data[key] = input.value;
      }
    });
    document.querySelectorAll('[type="radio"]:checked').forEach((radio) => {
      data[radio.name] = radio.value;
    });
    document.querySelectorAll("table.data-table.dynamic").forEach((table) => {
      const tableKey = table.dataset.tableKey;
      if (tableKey) {
        const rows = [];
        table.querySelectorAll("tbody tr").forEach((tr) => {
          const rowData = {};
          let hasVal = false;
          tr.querySelectorAll("[data-base-key]").forEach((input) => {
            rowData[input.dataset.baseKey] = input.value;
            if (input.value)
              hasVal = true;
          });
          if (hasVal)
            rows.push(rowData);
        });
        data[tableKey] = rows;
      }
    });
    const scriptBlock = document.getElementById("json-ld");
    if (scriptBlock) {
      scriptBlock.textContent = JSON.stringify(data, null, 2);
    }
    const debugBlock = document.getElementById("json-debug");
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
    if (!c)
      return;
    try {
      const d = JSON.parse(c);
      document.querySelectorAll("[data-json-path]").forEach((input) => {
        const key = input.dataset.jsonPath;
        if (d[key] !== undefined)
          input.value = d[key];
      });
      document.querySelectorAll("table.data-table.dynamic").forEach((table) => {
        const tableKey = table.dataset.tableKey;
        const rowsData = d[tableKey];
        if (Array.isArray(rowsData)) {
          const tbody = table.querySelector("tbody");
          if (!tbody)
            return;
          const currentRows = tbody.querySelectorAll(".template-row");
          for (let i = 1;i < currentRows.length; i++)
            currentRows[i].remove();
          rowsData.forEach((rowData, idx) => {
            let row;
            if (idx === 0) {
              row = tbody.querySelector(".template-row");
            } else {
              const tmpl = tbody.querySelector(".template-row");
              if (tmpl) {
                row = tmpl.cloneNode(true);
                tbody.appendChild(row);
              }
            }
            if (row) {
              row.querySelectorAll("input, select").forEach((input) => {
                const k = input.dataset.baseKey;
                if (k && rowData[k] !== undefined)
                  input.value = rowData[k];
              });
            }
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  function recalculate() {
    console.log("Recalculating...");
    document.querySelectorAll("[data-formula]").forEach((calcField) => {
      const formula = calcField.dataset.formula;
      if (!formula)
        return;
      const row = calcField.closest("tr");
      const table = calcField.closest("table");
      const getValue = (varName) => {
        if (row) {
          const input = row.querySelector(`[data-base-key="${varName}"], [data-json-path="${varName}"]`);
          if (input && input.value !== "")
            return parseFloat(input.value);
        }
        const staticInput = document.querySelector(`[data-json-path="${varName}"]`);
        if (staticInput && staticInput.value !== "")
          return parseFloat(staticInput.value);
        return 0;
      };
      let evalStr = formula.replace(/SUM\(([a-zA-Z0-9_]+)\)/g, (_, key) => {
        let sum = 0;
        const scope = table || document;
        scope.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`).forEach((inp) => {
          const val = parseFloat(inp.value);
          if (!isNaN(val))
            sum += val;
        });
        return sum;
      });
      evalStr = evalStr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
        if (["Math", "round", "floor", "ceil", "abs", "min", "max"].includes(match))
          return match;
        return String(getValue(match));
      });
      try {
        const result = new Function("return " + evalStr)();
        if (typeof result === "number" && !isNaN(result)) {
          calcField.value = Number.isInteger(result) ? result : result.toFixed(0);
        } else {
          calcField.value = "";
        }
      } catch (e) {
        console.error("Calc Error:", e);
        calcField.value = "Err";
      }
    });
  }
  function applyI18n() {
    const RESOURCES = {
      en: {
        add_row: "+ Add Row",
        save_btn: "Save"
      },
      ja: {
        add_row: "+ 行を追加",
        save_btn: "保存"
      }
    };
    const lang = (navigator.language || "en").startsWith("ja") ? "ja" : "en";
    const dict = RESOURCES[lang] || RESOURCES["en"];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key])
        el.textContent = dict[key];
    });
  }
  function saveDocument() {
    updateJsonLd();
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") {
        if (el.checked)
          el.setAttribute("checked", "checked");
        else
          el.removeAttribute("checked");
      } else {
        el.setAttribute("value", el.value);
        if (el.tagName === "TEXTAREA")
          el.textContent = el.value;
      }
    });
    document.querySelectorAll("button.primary, .add-row-btn, .no-print").forEach((el) => el.remove());
    document.querySelectorAll("input, textarea, select").forEach((el) => el.setAttribute("readonly", "readonly"));
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const title = w.generatedJsonStructure && w.generatedJsonStructure.name || "web-a-form";
    const now = new Date;
    const dateStr = now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "-" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2);
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `${title}_${dateStr}_${randomId}.html`;
    a.download = filename;
    a.click();
    setTimeout(() => location.reload(), 1000);
  }
  w.addTableRow = function(btn, tableKey) {
    const table = document.getElementById("tbl_" + tableKey);
    if (!table)
      return;
    const tbody = table.querySelector("tbody");
    if (!tbody)
      return;
    const templateRow = tbody.querySelector(".template-row");
    if (!templateRow)
      return;
    const newRow = templateRow.cloneNode(true);
    newRow.querySelectorAll("input").forEach((input) => input.value = "");
    tbody.appendChild(newRow);
  };
  w.switchTab = function(btn, tabId) {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const content = document.getElementById(tabId);
    if (content)
      content.classList.add("active");
  };
  let tm;
  document.addEventListener("input", () => {
    recalculate();
    updateJsonLd();
    clearTimeout(tm);
    tm = setTimeout(saveToLS, 1000);
  });
  w.saveDocument = saveDocument;
  w.recalculate = recalculate;
  console.log("Web/A Runtime Initialized");
  function initSearch() {
    const normalize = (s) => {
      if (!s)
        return "";
      let n = s.trim();
      n = n.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
      n = n.replace(/\s+/g, " ").toLowerCase();
      return n;
    };
    const clean = (s) => {
      if (!s)
        return "";
      let n = normalize(s);
      n = n.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g, "");
      n = n.replace(/(\(株\)|\(有\)|\(同\))/g, "");
      return n.trim();
    };
    const getScore = (query, targetParsed, targetOriginal) => {
      const q = clean(query);
      const t = clean(targetParsed);
      if (t.includes(q))
        return 2;
      if (normalize(targetOriginal).includes(normalize(query)))
        return 1;
      return 0;
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".autocomplete-container") && !e.target.closest("td")) {
        document.querySelectorAll(".search-suggestions").forEach((el) => el.style.display = "none");
      }
    });
    document.body.addEventListener("input", (e) => {
      if (e.target.classList.contains("search-input")) {
        const input = e.target;
        const container = input.parentElement;
        const suggestionsBox = container.querySelector(".search-suggestions");
        const srcKey = input.dataset.masterSrc;
        if (!srcKey || !suggestionsBox)
          return;
        const query = input.value;
        if (!query) {
          suggestionsBox.style.display = "none";
          return;
        }
        const master = w.generatedJsonStructure.masterData;
        if (!master || !master[srcKey])
          return;
        const data = master[srcKey];
        const hits = [];
        data.forEach((row) => {
          const val = row[0] || "";
          const score = getScore(query, val, val);
          if (score > 0) {
            hits.push({ val, row, score });
          }
        });
        hits.sort((a, b) => b.score - a.score);
        const topHits = hits.slice(0, 10);
        if (topHits.length > 0) {
          let html = "";
          topHits.forEach((h) => {
            html += `<div class="suggestion-item" data-val="${w.escapeHtml(h.val)}" style="padding:6px; cursor:pointer; border-bottom:1px solid #eee;">${w.escapeHtml(h.val)}</div>`;
          });
          suggestionsBox.innerHTML = html;
          suggestionsBox.style.display = "block";
        } else {
          suggestionsBox.style.display = "none";
        }
      }
    });
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        const item = e.target;
        const box = item.closest(".search-suggestions");
        const container = box.parentElement;
        const input = container.querySelector("input");
        input.value = item.dataset.val;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        box.style.display = "none";
      }
    });
  }
  w.escapeHtml = function(str) {
    if (!str)
      return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  restoreFromLS();
  applyI18n();
  initSearch();
  recalculate();
}
var RUNTIME_SCRIPT = `(${runtime.toString()})();`;
function initRuntime() {
  if (typeof window === "undefined")
    return;
  if (window.recalculate) {
    console.log("Runtime already loaded, skipping init");
    return;
  }
  runtime();
}
function generateHtml(markdown) {
  const { html, jsonStructure } = parseMarkdown(markdown);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${jsonStructure.name || "Web/A Form"}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\uD83D\uDCC4</text></svg>">
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
function aggregatorRuntime() {
  const w = window;
  const jsonStructure = w.generatedJsonStructure;
  const fields = jsonStructure.fields || [];
  let allData = [];
  function renderTable() {
    const container = document.getElementById("table-container");
    if (!container)
      return;
    let html = '<table class="data-table"><thead><tr>';
    html += "<th>Filename</th>";
    fields.forEach((f) => html += `<th>${f.label}</th>`);
    html += "</tr></thead><tbody>";
    allData.forEach((row) => {
      html += "<tr>";
      html += `<td>${row.filename || "-"}</td>`;
      const d = row.data || {};
      fields.forEach((f) => {
        let val = d[f.key];
        if (typeof val === "object")
          val = JSON.stringify(val);
        html += `<td>${val || ""}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    container.innerHTML = html;
    const countEl = document.getElementById("count");
    if (countEl)
      countEl.textContent = allData.length + " files loaded";
  }
  async function handleFiles(files) {
    let loadedCount = 0;
    for (let i = 0;i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        const script = doc.getElementById("json-ld");
        if (script && script.textContent) {
          try {
            const json = JSON.parse(script.textContent);
            allData.push({ filename: file.name, data: json });
            loadedCount++;
          } catch (e) {
            console.error("Error parsing JSON from " + file.name, e);
          }
        }
      } else if (file.name.endsWith(".json")) {
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0 && (json[0].filename || json[0].data)) {
            allData = allData.concat(json);
            loadedCount += json.length;
          } else if (typeof json === "object") {
            allData.push({ filename: file.name, data: json });
            loadedCount++;
          }
        } catch (e) {}
      }
    }
    renderTable();
    alert(`${loadedCount} files loaded/imported.`);
  }
  function setup() {
    const input = document.getElementById("file-input");
    input?.addEventListener("change", (e) => {
      if (e.target.files)
        handleFiles(e.target.files);
    });
    const dropZone = document.getElementById("drop-zone");
    dropZone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.background = "#eef";
    });
    dropZone?.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropZone.style.background = "";
    });
    dropZone?.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.style.background = "";
      if (e.dataTransfer?.files)
        handleFiles(e.dataTransfer.files);
    });
    document.getElementById("btn-download")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (jsonStructure.name || "data") + "_aggregated.json";
      a.click();
    });
  }
  setup();
}
var AGGREGATOR_RUNTIME_SCRIPT = `(${aggregatorRuntime.toString()})();`;
function generateAggregatorHtml(markdown) {
  const { jsonStructure } = parseMarkdown(markdown);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${jsonStructure.name || "Web/A Aggregator"}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\uD83D\uDCCA</text></svg>">
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

// src/weba/browser_maker.ts
var DEFAULT_MARKDOWN = `# 請求書 (Sample Invoice)
---

## 1. 宛先・基本情報

- [text:recipient_name (placeholder="株式会社〇〇 御中" size:L)] 請求先名
- [text:invoice_no (placeholder="INV-2025-001")] 請求書番号
- [date:issue_date] 発行日

---

## 2. 明細 (Calculation Demo)

[dynamic-table:items]
| 品目・摘要 | 単価 (Unit Price) | 数量 (Qty) | 金額 (Amount) |
|---|---|---|---|
| [text:item_desc (placeholder="品目名")] | [number:price (placeholder="0" align:R)] | [number:qty (placeholder="1" align:R)] | [calc:amount (formula="price * qty" align:R)] |

<div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">

- [calc:subtotal (formula="SUM(amount)" align:R)] 小計 (Subtotal)
- [calc:tax (formula="Math.floor(SUM(amount) * 0.1)" align:R)] 消費税 (10%)
- [calc:total (formula="SUM(amount) + Math.floor(SUM(amount) * 0.1)" size:XL align:R bold)] ご請求金額 (Total)

</div>

---

## 3. 振込先情報 (Static Table)

| 銀行名 | 支店名 | 口座番号 |
|---|---|---|
| [text:bank_name (val="サンプルの銀行")] | [text:branch (val="本店営業部")] | [text:acc_no (val="1234567")] |

- [textarea:notes (placeholder="備考（支払期限など）" hint="振込手数料は貴社にてご負担願います。")] 備考
`;
function updatePreview() {
  console.log("Web/A Maker v2.3");
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  if (!editor || !preview)
    return;
  const { html, jsonStructure } = parseMarkdown(editor.value);
  preview.innerHTML = html;
  window.generatedJsonStructure = jsonStructure;
  if (!window.recalculate) {
    initRuntime();
    window.isRuntimeLoaded = true;
  }
  setTimeout(() => {
    if (window.recalculate)
      window.recalculate();
  }, 50);
}
function downloadWebA() {
  const editor = document.getElementById("editor");
  const htmlContent = generateHtml(editor.value);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const title = window.generatedJsonStructure && window.generatedJsonStructure.name || "web-a-form";
  a.download = title + ".html";
  a.click();
}
function downloadAggregator() {
  const editor = document.getElementById("editor");
  const htmlContent = generateAggregatorHtml(editor.value);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const title = window.generatedJsonStructure && window.generatedJsonStructure.name || "web-a-aggregator";
  a.download = title + "_aggregator.html";
  a.click();
}
window.parseAndRender = updatePreview;
window.downloadWebA = downloadWebA;
window.downloadAggregator = downloadAggregator;
function applyI18n() {
  const RESOURCES = {
    en: {
      md_def: "Markdown Definition",
      btn_aggregator: "Download Web/A Aggregator",
      btn_form: "Download Web/A Form",
      preview: "Preview"
    },
    ja: {
      md_def: "定義 (Markdown)",
      btn_aggregator: "集計ツール",
      btn_form: "入力画面",
      preview: "プレビュー"
    }
  };
  const lang = (navigator.language || "en").startsWith("ja") ? "ja" : "en";
  const dict = RESOURCES[lang] || RESOURCES["en"];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key])
      el.textContent = dict[key];
  });
}
window.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  const editor = document.getElementById("editor");
  if (editor) {
    editor.value = DEFAULT_MARKDOWN;
    updatePreview();
  }
});
