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
  text: function(key, label, attrs) {
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
  number: function(key, label, attrs) {
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-row"><div class="form-hint">${this.formatHint(hintMatch[1])}</div></div>` : "";
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="number" class="form-input" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
  },
  date: function(key, label, attrs) {
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="date" class="form-input" data-json-path="${key}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
  },
  textarea: function(key, label, attrs) {
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
  radioStart: function(key, label, attrs) {
    return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div class="radio-group" style="padding-left: 10px;">`;
  },
  radioOption: function(name, val, label, checked) {
    return `
            <label style="display:block; margin-bottom:5px;">
                <input type="radio" name="${name}" value="${this.escapeHtml(val)}" ${checked ? "checked" : ""}> ${this.escapeHtml(label)}
            </label>`;
  },
  calc: function(key, label, attrs) {
    const formulaMatch = (attrs || "").match(/formula="([^"]+)"/) || (attrs || "").match(/formula='([^']+)'/);
    const formula = formulaMatch ? formulaMatch[1] : "";
    return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" readonly class="form-input" data-json-path="${key}" data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
  },
  search: function(key, label, attrs) {
    const srcMatch = (attrs || "").match(/src:([^\s)]+)/);
    const labelIndexMatch = (attrs || "").match(/label:(\d+)/);
    const valueIndexMatch = (attrs || "").match(/value:(\d+)/);
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const hintMatch = (attrs || "").match(/hint="([^"]+)"/) || (attrs || "").match(/hint='([^']+)'/);
    const srcKey = srcMatch ? srcMatch[1] : "";
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : "";
    const labelIndexAttr = labelIndexMatch ? ` data-master-label-index="${labelIndexMatch[1]}"` : "";
    const valueIndexAttr = valueIndexMatch ? ` data-master-value-index="${valueIndexMatch[1]}"` : "";
    return `
        <div class="form-row autocomplete-container" style="position:relative; z-index:100;">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div style="flex:1; position:relative;">
                <input type="text" class="form-input search-input" autocomplete="off" 
                    data-json-path="${key}" 
                    data-master-src="${srcKey}"${labelIndexAttr}${valueIndexAttr}
                    placeholder="${this.escapeHtml(placeholder)}" 
                    style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
                <div class="search-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; background:white; border:1px solid #ccc; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:0 0 4px 4px; z-index:1001;"></div>
            </div>
            ${hint}
        </div>`;
  },
  renderInput(type, key, attrs, isTemplate = false) {
    const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
    const placeholder = placeholderMatch ? `placeholder="${this.escapeHtml(placeholderMatch[1])}"` : "";
    const commonClass = isTemplate ? "form-input template-input" : "form-input";
    const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
    if (type === "calc") {
      const formulaMatch = (attrs || "").match(/formula="([^"]+)"/) || (attrs || "").match(/formula='([^']+)'/);
      const formula = formulaMatch ? formulaMatch[1] : "";
      return `<input type="text" readonly class="${commonClass}" ${dataAttr} data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "datalist") {
      const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_\-\u0080-\uFFFF]+)/);
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
      return `<input type="text" list="${listId}" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}><datalist id="${listId}">${optionsHtml}</datalist>`;
    }
    if (type === "search") {
      const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_\-\u0080-\uFFFF]+)/);
      const labelIndexMatch = (attrs || "").match(/label:(\d+)/);
      const valueIndexMatch = (attrs || "").match(/value:(\d+)/);
      const srcKey = srcMatch ? srcMatch[1] : "";
      const labelIndexAttr = labelIndexMatch ? ` data-master-label-index="${labelIndexMatch[1]}"` : "";
      const valueIndexAttr = valueIndexMatch ? ` data-master-value-index="${valueIndexMatch[1]}"` : "";
      const searchClass = commonClass + " search-input";
      return `<div style="display:inline-block; position:relative; width: 100%; min-width: 100px;">
                        <input type="text" class="${searchClass}" ${dataAttr} autocomplete="off" data-master-src="${srcKey}"${labelIndexAttr}${valueIndexAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
                    </div>`;
    }
    if (type === "number") {
      return `<input type="number" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "date") {
      return `<input type="date" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "checkbox") {
      return `<input type="checkbox" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    let suggestAttr = "";
    let suggestClass = "";
    if ((attrs || "").includes("suggest:column")) {
      suggestClass = " search-input";
      suggestAttr = ' data-suggest-source="column"';
    }
    return `<input type="text" class="${commonClass}${suggestClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${suggestAttr}>`;
  },
  tableRow(cells, isTemplate = false) {
    const tds = cells.map((cell) => {
      const trimmed = cell.trim();
      const match = trimmed.match(/^\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
      if (match) {
        let [_, type, key, attrsParen, attrsColon] = match;
        const attrs = attrsParen || attrsColon;
        const inputHtml = this.renderInput(type || "text", key, attrs, isTemplate);
        return `<td>${inputHtml}</td>`;
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
    const masterMatch = t.match(/^\[master:([^\]]+)\]$/);
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
        if (!isSep && scanMasterKey && masterData[scanMasterKey]) {
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
  const processInlineTags = (text2) => {
    return text2.replace(/\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*?)\))?\]/g, (match, type, key, attrs) => {
      const label = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
      const cleanLabel = label ? label[1] : key;
      jsonStructure.fields.push({ key, label: cleanLabel, type: type || "text" });
      return Renderers.renderInput(type || "text", key, attrs || "");
    });
  };
  lines.forEach((line) => {
    const trimmed = line.trim();
    const masterMatch = trimmed.match(/^\[master:([^\]]+)\]$/);
    if (masterMatch) {
      currentMasterKey = masterMatch[1];
      return;
    }
    const dynTableMatch = trimmed.match(/^\[dynamic-table:([^\]]+)\]$/);
    if (dynTableMatch) {
      currentDynamicTableKey = dynTableMatch[1];
      jsonStructure.tables[currentDynamicTableKey] = [];
      return;
    }
    if (trimmed.startsWith("|")) {
      if (!inTable) {
        appendHtml(`<div class="form-row vertical"><div class="table-wrapper">`);
        let tableClass = "data-table";
        let extraAttrs = "";
        if (currentDynamicTableKey) {
          tableClass += " dynamic";
          extraAttrs = `id="tbl_${currentDynamicTableKey}" data-table-key="${currentDynamicTableKey}"`;
        } else if (currentMasterKey) {
          tableClass += " master";
          extraAttrs = `data-master-key="${currentMasterKey}"`;
        }
        appendHtml(`<table class="${tableClass}" ${extraAttrs}>`);
        appendHtml(`<tbody>`);
        inTable = true;
        inMasterTable = !!currentMasterKey;
      }
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      const isSeparator = cells.every((c) => c.match(/^-+$/));
      if (isSeparator) {} else {
        if (currentDynamicTableKey) {
          const hasInput = cells.some((c) => c.includes("["));
          if (!hasInput) {
            appendHtml(`<tr>${cells.map((c) => `<th>${Renderers.escapeHtml(c)}</th>`).join("")}<th class="row-action-cell"></th></tr>`);
          } else {
            const tableKey = currentDynamicTableKey;
            cells.forEach((cell) => {
              const match = cell.trim().match(/^\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
              if (match) {
                const [_, type, key, attrsParen, attrsColon] = match;
                const attrs = attrsParen || attrsColon;
                const placeholderMatch = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
                const label = placeholderMatch ? placeholderMatch[1] : key;
                jsonStructure.tables[tableKey].push({ key, label, type: type || "text" });
              }
            });
            let trHtml = Renderers.tableRow(cells, true);
            trHtml = trHtml.replace("</tr>", '<td class="row-action-cell"><button type="button" class="remove-row-btn" onclick="removeTableRow(this)" tabindex="-1">×</button></td></tr>');
            appendHtml(trHtml);
          }
        } else if (inMasterTable) {
          appendHtml(Renderers.tableRow(cells));
        } else {
          appendHtml(Renderers.tableRow(cells));
        }
      }
      return;
    } else {
      if (inTable) {
        appendHtml("</tbody></table></div>");
        if (currentDynamicTableKey) {
          appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
          currentDynamicTableKey = null;
        }
        appendHtml("</div>");
        inTable = false;
        inMasterTable = false;
        currentMasterKey = null;
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
      const match = trimmed.match(/^-\s*\[([a-z]+):([^\]\s:\(\)]+)(?:\s*\((.*)\))?\]\s*(.*)$/);
      if (match) {
        const [_, type, key, attrs, label] = match;
        currentRadioGroup = null;
        const cleanLabel = (label || "").trim();
        jsonStructure.fields.push({ key, label: cleanLabel, type });
        if (type === "radio") {
          currentRadioGroup = { key, label: cleanLabel, attrs };
          appendHtml(Renderers.radioStart(key, cleanLabel, attrs));
        } else if (type === "text")
          appendHtml(Renderers.text(key, cleanLabel, attrs));
        else if (type === "number")
          appendHtml(Renderers.number(key, cleanLabel, attrs));
        else if (type === "date")
          appendHtml(Renderers.date(key, cleanLabel, attrs));
        else if (type === "textarea")
          appendHtml(Renderers.textarea(key, cleanLabel, attrs));
        else if (type === "search")
          appendHtml(Renderers.search(key, cleanLabel, attrs));
        else if (type === "calc")
          appendHtml(Renderers.calc(key, cleanLabel, attrs));
        else if (type === "datalist")
          appendHtml(Renderers.renderInput(type, key, attrs));
        else if (Renderers[type]) {
          appendHtml(Renderers[type](key, cleanLabel, attrs));
        } else {
          console.warn(`Unknown type: ${type}`, Object.keys(Renderers));
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
      appendHtml(processInlineTags(trimmed));
    } else if (trimmed.length > 0) {
      if (currentRadioGroup) {
        appendHtml("</div></div>");
        currentRadioGroup = null;
      }
      appendHtml(`<p>${Renderers.escapeHtml(processInlineTags(trimmed))}</p>`);
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
    navHtml += `<div class="no-print" style="display: flex; gap: 10px; align-items: center;">
            <button class="primary" onclick="window.clearData()" style="margin: 0; background-color: #999;" data-i18n="clear_btn">Clear</button>
            <button class="primary" onclick="window.saveDraft()" style="margin: 0;" data-i18n="work_save_btn">Save Draft</button>
            <button class="primary" onclick="window.submitDocument()" style="margin: 0; background-color: #d9534f;" data-i18n="submit_btn">Submit</button>
        </div>`;
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
            if (input.type === "checkbox") {
              rowData[input.dataset.baseKey] = input.checked;
              if (input.checked)
                hasVal = true;
            } else {
              rowData[input.dataset.baseKey] = input.value;
              if (input.value)
                hasVal = true;
            }
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
                if (k && rowData[k] !== undefined) {
                  if (input.type === "checkbox")
                    input.checked = !!rowData[k];
                  else
                    input.value = rowData[k];
                }
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
    document.querySelectorAll("[data-formula]").forEach((calcField) => {
      const formula = calcField.dataset.formula;
      if (!formula)
        return;
      const row = calcField.closest("tr");
      const table = calcField.closest("table");
      const getValue = (varName) => {
        let val = 0;
        let foundSource = "none";
        let rawVal = "";
        if (row) {
          const selector = `[data-base-key="${varName}"], [data-json-path="${varName}"]`;
          const input = row.querySelector(selector);
          if (input) {
            foundSource = "row-input";
            rawVal = input.value;
            if (input.value !== "")
              val = parseFloat(input.value);
          }
        }
        if (foundSource === "none") {
          const staticInput = document.querySelector(`[data-json-path="${varName}"]`);
          if (staticInput) {
            foundSource = "static-input";
            rawVal = staticInput.value;
            if (staticInput.value !== "")
              val = parseFloat(staticInput.value);
          }
        }
        return val;
      };
      let evalStr = formula.replace(/SUM\(([a-zA-Z0-9_\-\u0080-\uFFFF]+)\)/g, (_, key) => {
        let sum = 0;
        const scope = table || document;
        let inputs = scope.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`);
        if (inputs.length === 0 && scope !== document) {
          inputs = document.querySelectorAll(`[data-base-key="${key}"], [data-json-path="${key}"]`);
        }
        inputs.forEach((inp) => {
          const val = parseFloat(inp.value);
          if (!isNaN(val))
            sum += val;
        });
        return sum;
      });
      evalStr = evalStr.replace(/([a-zA-Z_\u0080-\uFFFF][a-zA-Z0-9_\-\u0080-\uFFFF]*)/g, (match) => {
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
        work_save_btn: "Save Draft",
        submit_btn: "Submit",
        clear_btn: "Clear Data"
      },
      ja: {
        add_row: "+ 行を追加",
        work_save_btn: "作業保存",
        submit_btn: "提出",
        clear_btn: "クリア"
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
  function bakeValues() {
    updateJsonLd();
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.closest(".template-row"))
        return;
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
  }
  function downloadHtml(filenameSuffix, isFinal) {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const title = w.generatedJsonStructure && w.generatedJsonStructure.name || "web-a-form";
    const now = new Date;
    const dateStr = now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "-" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2);
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `${title}_${dateStr}_${filenameSuffix}_${randomId}.html`;
    a.download = filename;
    a.click();
    if (isFinal) {
      setTimeout(() => location.reload(), 1000);
    }
  }
  w.saveDraft = function() {
    bakeValues();
    downloadHtml("draft", false);
  };
  w.submitDocument = function() {
    bakeValues();
    document.querySelectorAll(".search-suggestions").forEach((el) => el.remove());
    downloadHtml("submit", true);
  };
  w.clearData = function() {
    if (confirm("Clear all saved data? / 保存されたデータを削除しますか？")) {
      localStorage.removeItem(FORM_ID);
      location.reload();
    }
  };
  w.removeTableRow = function(btn) {
    const tr = btn.closest("tr");
    if (tr.classList.contains("template-row")) {
      tr.querySelectorAll("input").forEach((inp) => {
        if (inp.type === "checkbox")
          inp.checked = false;
        else
          inp.value = "";
      });
    } else {
      tr.remove();
      recalculate();
      updateJsonLd();
    }
  };
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
    newRow.classList.remove("template-row");
    newRow.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") {
        input.checked = input.hasAttribute("checked");
      } else {
        input.value = input.getAttribute("value") || "";
      }
    });
    const rmBtn = newRow.querySelector(".remove-row-btn");
    if (rmBtn)
      rmBtn.style.visibility = "visible";
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
  document.addEventListener("input", (e) => {
    recalculate();
    updateJsonLd();
    clearTimeout(tm);
    tm = setTimeout(saveToLS, 1000);
  });
  w.recalculate = recalculate;
  w.initSearch = initSearch;
  console.log("Web/A Runtime Initialized");
  function initSearch() {
    console.log("Initializing Search...");
    if (w.generatedJsonStructure && w.generatedJsonStructure.masterData) {
      const keys = Object.keys(w.generatedJsonStructure.masterData);
      console.log("Master Data Keys available:", keys.join(", "));
    }
    const normalize = (val) => {
      if (!val)
        return "";
      let n = val.toString().toLowerCase();
      n = n.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      });
      n = n.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
      return n.trim();
    };
    const clean = (s) => {
      if (!s)
        return "";
      let n = normalize(s);
      n = n.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g, "");
      n = n.replace(/(\(株\)|\(有\)|\(同\))/g, "");
      return n.trim();
    };
    const toIndex = (raw) => {
      const parsed = parseInt(raw || "", 10);
      return Number.isFinite(parsed) ? parsed - 1 : -1;
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
    let suggestionsVisible = false;
    let activeSearchInput = null;
    let globalBox = null;
    const getGlobalBox = () => {
      if (!globalBox) {
        globalBox = document.getElementById("web-a-search-suggestions");
        if (!globalBox) {
          globalBox = document.createElement("div");
          globalBox.id = "web-a-search-suggestions";
          globalBox.className = "search-suggestions";
          Object.assign(globalBox.style, {
            display: "none",
            position: "absolute",
            background: "white",
            border: "1px solid #ccc",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: "9999",
            maxHeight: "200px",
            overflowY: "auto",
            borderRadius: "4px"
          });
          document.body.appendChild(globalBox);
        }
      }
      return globalBox;
    };
    const hideSuggestions = () => {
      const box = getGlobalBox();
      if (box)
        box.style.display = "none";
      suggestionsVisible = false;
      activeSearchInput = null;
    };
    document.addEventListener("click", (e) => {
      if (suggestionsVisible && !e.target.closest("#web-a-search-suggestions") && e.target !== activeSearchInput) {
        hideSuggestions();
      }
    });
    document.addEventListener("scroll", () => {
      if (suggestionsVisible)
        hideSuggestions();
    }, true);
    document.body.addEventListener("input", (e) => {
      if (e.target.classList.contains("search-input")) {
        const input = e.target;
        activeSearchInput = input;
        const srcKey = input.dataset.masterSrc;
        const suggestSource = input.dataset.suggestSource;
        if (!srcKey && !suggestSource)
          return;
        const labelIdx = toIndex(input.dataset.masterLabelIndex);
        const valueIdx = toIndex(input.dataset.masterValueIndex);
        const query = input.value;
        if (!query) {
          hideSuggestions();
          return;
        }
        const hits = [];
        const normQuery = normalize(query);
        if (suggestSource === "column") {
          const baseKey = input.dataset.baseKey;
          const table = input.closest("table");
          if (table && baseKey) {
            const seen = new Set;
            table.querySelectorAll(`[data-base-key="${baseKey}"]`).forEach((inp) => {
              const v = inp.value;
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
          const master = w.generatedJsonStructure.masterData;
          if (!master || !master[srcKey]) {
            console.warn(`Search: masterData key '${srcKey}' not found. Available:`, Object.keys(master || {}));
            return;
          }
          const allRows = master[srcKey];
          allRows.forEach((row, idx) => {
            if (idx === 0)
              return;
            const match = row.some((col) => {
              return normalize(col || "").includes(normQuery);
            });
            if (match) {
              const labelVal = labelIdx >= 0 ? row[labelIdx] || "" : "";
              const valueVal = valueIdx >= 0 ? row[valueIdx] || "" : "";
              const val = valueIdx >= 0 ? valueVal : labelIdx >= 0 ? labelVal : row[1] || row[0] || "";
              hits.push({ val, row, label: labelVal, score: 10, idx });
            }
          });
        }
        console.log(`Search: Found ${hits.length} matches for '${query}' (norm: '${normQuery}') in '${srcKey}'`);
        hits.sort((a, b) => b.score - a.score);
        const topHits = hits.slice(0, 10);
        if (topHits.length > 0) {
          let html = "";
          topHits.forEach((h) => {
            const rowJson = w.escapeHtml(JSON.stringify(h.row));
            const displayLabel = labelIdx >= 0 ? h.label || h.row.join(" : ") : h.row.join(" : ");
            html += `<div class="suggestion-item" data-val="${w.escapeHtml(h.val)}" data-row="${rowJson}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${w.escapeHtml(displayLabel)}</div>`;
          });
          const box = getGlobalBox();
          box.innerHTML = html;
          const rect = input.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.bottom;
          const height = Math.min(topHits.length * 40, 200);
          box.style.width = Math.max(rect.width, 200) + "px";
          box.style.left = rect.left + scrollLeft + "px";
          if (spaceBelow < height && rect.top > height) {
            box.style.top = rect.top + scrollTop - height - 2 + "px";
            box.style.maxHeight = height + "px";
          } else {
            box.style.top = rect.bottom + scrollTop + "px";
            box.style.maxHeight = "200px";
          }
          box.style.display = "block";
          suggestionsVisible = true;
          box.querySelectorAll(".suggestion-item").forEach((el) => {
            el.onmouseenter = () => el.style.background = "#f0f8ff";
            el.onmouseleave = () => el.style.background = "white";
          });
        } else {
          hideSuggestions();
        }
      }
    });
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        const item = e.target;
        if (activeSearchInput) {
          let searchInputFilled = false;
          const originalVal = item.dataset.val;
          try {
            const rowData = JSON.parse(item.dataset.row || "[]");
            console.log("Auto-Fill: Selected Row:", rowData);
            const srcKey = activeSearchInput.dataset.masterSrc;
            const masterHeaders = srcKey ? w.generatedJsonStructure.masterData[srcKey][0] : [];
            console.log("Auto-Fill: Master Headers:", masterHeaders);
            if (masterHeaders.length > 0 && rowData.length > 0) {
              const tr = activeSearchInput.closest("tr");
              if (tr) {
                const inputs = Array.from(tr.querySelectorAll("input, select, textarea"));
                console.log("Auto-Fill: Inputs in Form Row:", inputs.map((i) => i.dataset.baseKey || i.dataset.jsonPath));
                masterHeaders.forEach((header, idx) => {
                  if (!header)
                    return;
                  const targetVal = rowData[idx];
                  const keyMatch = normalize(header);
                  console.log(`Auto-Fill: Checking '${header}' (norm: '${keyMatch}') against inputs...`);
                  const targetInput = inputs.find((inp) => {
                    const k = inp.dataset.baseKey || inp.dataset.jsonPath;
                    let labelText = "";
                    const td = inp.closest("td");
                    if (td) {
                      const tr2 = td.parentElement;
                      const index = Array.from(tr2.children).indexOf(td);
                      const table = tr2.closest("table");
                      if (table) {
                        const th = table.querySelectorAll("thead th")[index] || table.querySelectorAll("tr:first-child th")[index];
                        if (th)
                          labelText = normalize(th.textContent || "");
                      }
                    } else {
                      const rowDiv = inp.closest(".form-row");
                      if (rowDiv) {
                        const labelEl = rowDiv.querySelector(".form-label");
                        if (labelEl)
                          labelText = normalize(labelEl.textContent || "");
                      }
                    }
                    const ph = normalize(inp.getAttribute("placeholder") || "");
                    const matchKey = k && normalize(k) === keyMatch;
                    const matchPh = ph === keyMatch;
                    const matchLabel = labelText === keyMatch;
                    if (header === "ベンダー名" || header === "区") {}
                    if (matchKey || matchPh || matchLabel)
                      return true;
                    return false;
                  });
                  if (targetInput) {
                    console.log(`Auto-Fill: Match found for '${header}' -> Filling '${targetVal}'`);
                    targetInput.value = targetVal || "";
                    targetInput.dispatchEvent(new Event("input", { bubbles: true }));
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
            activeSearchInput.value = originalVal || "";
            activeSearchInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
          hideSuggestions();
        }
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
      if (!file)
        continue;
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

// src/weba/sample.ts
var DEFAULT_MARKDOWN_EN = `# Simple Search & Calc Test
---

## 1. Input Form

We want to verify:
1. Search suggestion works for "Product"
2. Calculation works for "Total"

[dynamic-table:items]
| Product (Search) | Unit Price | Qty | Total |
|---|---|---|---|
| [search:item_name (src:products placeholder="Search fruit...")] | [number:price (placeholder="0")] | [number:qty (placeholder="1" val="1")] | [calc:amount (formula="price * qty")] |

<div style="text-align: right; margin-top: 10px;">
  <b>Grand Total:</b> [calc:grand_total (formula="SUM(amount)" size:L bold)]
</div>

---

## 2. Master Data Definition
(Reference Data)

[master:products]
| Item Name | Price |
|---|---|
| Apple | 100 |
| Banana | 200 |
| Cherry | 300 |
| Durian | 5000 |
| Elderberry | 400 |
`;
var DEFAULT_MARKDOWN_JA = `# 請求書（サンプル）
---

## 1. 入力フォーム

[dynamic-table:items]
| 商品名 (検索) | 単価 | 数量 | 小計 |
|---|---|---|---|
| [search:商品名 (src:商品 placeholder="商品を検索")] | [number:単価 (placeholder="0")] | [number:数量 (placeholder="1" val="1")] | [calc:小計 (formula="単価 * 数量")] |

<div style="text-align: right; margin-top: 10px;">
  <b>合計金額:</b> [calc:総合計 (formula="SUM(小計)" size:L bold)]
</div>

---

## 2. マスタ定義
(参照用データ)

[master:商品]
| 商品名 | 単価 |
|---|---|
| りんご | 100 |
| バナナ | 200 |
| みかん | 150 |
| 高級メロン | 5000 |
`;

// src/weba/browser_maker.ts
function updatePreview() {
  console.log("Web/A Maker v2.3");
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  if (!editor || !preview)
    return;
  const { html, jsonStructure } = parseMarkdown(editor.value);
  window.generatedJsonStructure = jsonStructure;
  preview.innerHTML = html;
  if (!window.isRuntimeLoaded) {
    initRuntime();
    window.isRuntimeLoaded = true;
  }
  setTimeout(() => {
    if (window.recalculate) {
      if (window.initSearch)
        window.initSearch();
      window.recalculate();
    }
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
    const navLang = navigator.language || "en";
    const lang = navLang.startsWith("ja") ? "ja" : "en";
    console.log(`Language detection: navigator.language='${navLang}' -> using '${lang}' sample.`);
    const currentVal = editor.value.trim();
    const isDefaultEn = currentVal === DEFAULT_MARKDOWN_EN.trim();
    const isDefaultJa = currentVal === DEFAULT_MARKDOWN_JA.trim();
    if (!currentVal || lang === "ja" && isDefaultEn || lang === "en" && isDefaultJa) {
      editor.value = lang === "ja" ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
    }
    updatePreview();
  }
});
