// src/weba/client/calculator.ts
class Calculator {
  runAutoCopy() {
    document.querySelectorAll("[data-copy-from]").forEach((dest) => {
      if (!dest.dataset.dirty) {
        const srcKey = dest.dataset.copyFrom;
        if (srcKey) {
          const row = dest.closest("tr");
          const scope = row || document;
          const src = scope.querySelector(`[data-base-key="${srcKey}"], [data-json-path="${srcKey}"]`);
          if (src && src.value !== dest.value) {
            dest.value = src.value;
            dest.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }
    });
  }
  recalculate() {
    document.querySelectorAll("[data-formula]").forEach((calcField) => {
      const formula = calcField.dataset.formula;
      if (!formula)
        return;
      const row = calcField.closest("tr");
      const table = calcField.closest("table");
      const getValue = (varName) => {
        let val = 0;
        let foundSource = "none";
        if (row) {
          const selector = `[data-base-key="${varName}"], [data-json-path="${varName}"]`;
          const input = row.querySelector(selector);
          if (input) {
            foundSource = "row-input";
            if (input.value !== "")
              val = parseFloat(input.value);
          }
        }
        if (foundSource === "none") {
          const staticInput = document.querySelector(`[data-json-path="${varName}"]`);
          if (staticInput) {
            foundSource = "static-input";
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
    this.runAutoCopy();
  }
}

// src/weba/client/data.ts
class DataManager {
  formId;
  constructor() {
    this.formId = "WebA_" + window.location.pathname;
  }
  updateJsonLd() {
    const w = window;
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
  saveToLS() {
    const data = this.updateJsonLd();
    localStorage.setItem(this.formId, JSON.stringify(data));
  }
  restoreFromLS() {
    const c = localStorage.getItem(this.formId);
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
          rowsData.forEach((rowData, idx) => {
            let row;
            if (idx === 0) {
              row = tbody.querySelector(".template-row");
            } else {
              const tmpl = tbody.querySelector(".template-row");
              if (tmpl) {
                row = tmpl.cloneNode(true);
                row.classList.remove("template-row");
                const rmBtn = row.querySelector(".remove-row-btn");
                if (rmBtn)
                  rmBtn.style.visibility = "visible";
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
  clearData() {
    if (confirm("Clear all saved data? / 保存されたデータを削除しますか？")) {
      localStorage.removeItem(this.formId);
      location.reload();
    }
  }
  bakeValues() {
    this.updateJsonLd();
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
  downloadHtml(filenameSuffix, isFinal) {
    const w = window;
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
  saveDraft() {
    this.bakeValues();
    this.downloadHtml("draft", false);
  }
  submitDocument() {
    this.bakeValues();
    document.querySelectorAll(".search-suggestions").forEach((el) => el.remove());
    this.downloadHtml("submit", true);
  }
}

// src/weba/client/ui.ts
class UIManager {
  calc;
  data;
  constructor(calc, data) {
    this.calc = calc;
    this.data = data;
  }
  applyI18n() {
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
  initTables() {
    document.querySelectorAll(".data-table.dynamic tbody").forEach((tbody) => {
      this.renumberRows(tbody);
    });
  }
  renumberRows(tbody) {
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row, index) => {
      const num = index + 1;
      row.querySelectorAll(".auto-num").forEach((input) => {
        if (input.value != num) {
          input.value = num.toString();
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });
  }
  removeTableRow(btn) {
    const tr = btn.closest("tr");
    const tbody = tr.parentElement;
    if (tr.classList.contains("template-row")) {
      tr.querySelectorAll("input").forEach((inp) => {
        if (inp.type === "checkbox")
          inp.checked = false;
        else
          inp.value = "";
      });
    } else {
      tr.remove();
      if (tbody)
        this.renumberRows(tbody);
      this.calc.recalculate();
      this.data.updateJsonLd();
    }
  }
  addTableRow(btn, tableKey) {
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
    newRow.querySelectorAll("[data-copy-from]").forEach((target) => {
      const srcKey = target.dataset.copyFrom;
      if (srcKey) {
        const src = newRow.querySelector(`[data-base-key="${srcKey}"]`);
        if (src && src.value) {
          target.value = src.value;
        }
      }
    });
    tbody.appendChild(newRow);
    this.renumberRows(tbody);
    this.calc.recalculate();
  }
  switchTab(btn, tabId) {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const content = document.getElementById(tabId);
    if (content)
      content.classList.add("active");
  }
}

// src/weba/client/runtime.ts
function initRuntime() {
  console.log("Web/A Runtime Booting...");
  const calc = new Calculator;
  const data = new DataManager;
  const ui = new UIManager(calc, data);
  const w = window;
  w.saveDraft = () => data.saveDraft();
  w.submitDocument = () => data.submitDocument();
  w.clearData = () => data.clearData();
  w.removeTableRow = (btn) => ui.removeTableRow(btn);
  w.addTableRow = (btn, tableKey) => ui.addTableRow(btn, tableKey);
  w.switchTab = (btn, tabId) => ui.switchTab(btn, tabId);
  w.recalculate = () => calc.recalculate();
  w.escapeHtml = (str) => {
    if (!str)
      return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return str.toString().replace(/[&<>"']/g, (m) => map[m] || m);
  };
  data.restoreFromLS();
  ui.applyI18n();
  ui.initTables();
  calc.recalculate();
  let tm;
  document.addEventListener("input", (e) => {
    const input = e.target;
    if (e.isTrusted) {
      input.dataset.dirty = "true";
    }
    const key = input.dataset.baseKey || input.dataset.jsonPath;
    if (key) {
      const row = input.closest("tr");
      const scope = row || document;
      scope.querySelectorAll(`[data-copy-from="${key}"]`).forEach((dest) => {
        if (!dest.dataset.dirty) {
          if (dest.value !== input.value) {
            dest.value = input.value;
            dest.dispatchEvent(new Event("input"));
          }
        }
      });
    }
    calc.recalculate();
    data.updateJsonLd();
    clearTimeout(tm);
    tm = setTimeout(() => data.saveToLS(), 1000);
  });
  console.log("Web/A Runtime Ready.");
}

// src/weba/client/search.ts
class SearchEngine {
  suggestionsVisible = false;
  activeSearchInput = null;
  globalBox = null;
  constructor() {}
  init() {
    console.log("Initializing Search Engine (Bundle)...");
    const w = window;
    if (w.generatedJsonStructure && w.generatedJsonStructure.masterData) {
      const keys = Object.keys(w.generatedJsonStructure.masterData);
      console.log("Master Data Keys available:", keys.join(", "));
    }
    this.setupEventDelegation();
  }
  normalize(val) {
    if (!val)
      return "";
    let n = val.toString().toLowerCase();
    n = n.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    n = n.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
    return n.trim();
  }
  clean(s) {
    if (!s)
      return "";
    let n = this.normalize(s);
    n = n.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g, "");
    n = n.replace(/(\(株\)|\(有\)|\(同\))/g, "");
    return n.trim();
  }
  toIndex(raw) {
    const parsed = parseInt(raw || "", 10);
    return Number.isFinite(parsed) ? parsed - 1 : -1;
  }
  getGlobalBox() {
    if (!this.globalBox) {
      this.globalBox = document.getElementById("web-a-search-suggestions");
      if (!this.globalBox) {
        this.globalBox = document.createElement("div");
        this.globalBox.id = "web-a-search-suggestions";
        this.globalBox.className = "search-suggestions";
        Object.assign(this.globalBox.style, {
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
        document.body.appendChild(this.globalBox);
      }
    }
    return this.globalBox;
  }
  hideSuggestions() {
    const box = this.getGlobalBox();
    if (box)
      box.style.display = "none";
    this.suggestionsVisible = false;
    this.activeSearchInput = null;
  }
  setupEventDelegation() {
    document.addEventListener("click", (e) => {
      if (this.suggestionsVisible && !e.target.closest("#web-a-search-suggestions") && e.target !== this.activeSearchInput) {
        this.hideSuggestions();
      }
    });
    document.addEventListener("scroll", () => {
      if (this.suggestionsVisible)
        this.hideSuggestions();
    }, true);
    document.body.addEventListener("input", (e) => {
      if (e.target.classList.contains("search-input")) {
        this.handleSearchInput(e.target);
      }
    });
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        this.handleSelection(e.target);
      }
    });
  }
  handleSearchInput(input) {
    this.activeSearchInput = input;
    const w = window;
    const srcKey = input.dataset.masterSrc;
    const suggestSource = input.dataset.suggestSource;
    if (!srcKey && !suggestSource)
      return;
    const labelIdx = this.toIndex(input.dataset.masterLabelIndex);
    const valueIdx = this.toIndex(input.dataset.masterValueIndex);
    const query = input.value;
    if (!query) {
      this.hideSuggestions();
      return;
    }
    const hits = [];
    const normQuery = this.normalize(query);
    if (suggestSource === "column") {
      const baseKey = input.dataset.baseKey;
      const table = input.closest("table");
      if (table && baseKey) {
        const seen = new Set;
        table.querySelectorAll(`[data-base-key="${baseKey}"]`).forEach((inp) => {
          if (inp === input)
            return;
          const v = inp.value;
          if (v && this.normalize(v).includes(normQuery)) {
            if (!seen.has(v)) {
              seen.add(v);
              hits.push({ val: v, row: [v], label: v, score: 10 });
            }
          }
        });
      }
    } else if (srcKey) {
      const master = w.generatedJsonStructure.masterData;
      if (!master || !master[srcKey])
        return;
      const allRows = master[srcKey];
      allRows.forEach((row, idx) => {
        if (idx === 0)
          return;
        const match = row.some((col) => this.normalize(col || "").includes(normQuery));
        if (match) {
          const labelVal = labelIdx >= 0 ? row[labelIdx] || "" : "";
          const valueVal = valueIdx >= 0 ? row[valueIdx] || "" : "";
          const val = valueIdx >= 0 ? valueVal : labelIdx >= 0 ? labelVal : row[1] || row[0] || "";
          hits.push({ val, row, label: labelVal, score: 10, idx });
        }
      });
    }
    this.renderSuggestions(input, hits, labelIdx);
  }
  renderSuggestions(input, hits, labelIdx) {
    if (hits.length === 0) {
      this.hideSuggestions();
      return;
    }
    const w = window;
    const topHits = hits.slice(0, 10);
    let html = "";
    topHits.forEach((h) => {
      const rowJson = w.escapeHtml(JSON.stringify(h.row));
      const displayLabel = labelIdx >= 0 ? h.label || h.row.join(" : ") : h.row.join(" : ");
      html += `<div class="suggestion-item" data-val="${w.escapeHtml(h.val)}" data-row="${rowJson}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${w.escapeHtml(displayLabel)}</div>`;
    });
    const box = this.getGlobalBox();
    box.innerHTML = html;
    const rect = input.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    box.style.width = Math.max(rect.width, 200) + "px";
    box.style.left = rect.left + scrollLeft + "px";
    box.style.top = rect.bottom + scrollTop + "px";
    box.querySelectorAll(".suggestion-item").forEach((el) => {
      el.onmouseenter = () => el.style.background = "#f0f8ff";
      el.onmouseleave = () => el.style.background = "white";
    });
    box.style.display = "block";
    this.suggestionsVisible = true;
  }
  handleSelection(item) {
    if (!this.activeSearchInput)
      return;
    const w = window;
    const input = this.activeSearchInput;
    const val = item.dataset.val || "";
    const rowJson = item.dataset.row || "[]";
    try {
      const rowData = JSON.parse(rowJson);
      const srcKey = input.dataset.masterSrc;
      const masterHeaders = srcKey ? w.generatedJsonStructure.masterData[srcKey][0] : [];
      let searchInputFilled = false;
      if (masterHeaders.length > 0 && rowData.length > 0) {
        const tr = input.closest("tr");
        if (tr) {
          const inputs = Array.from(tr.querySelectorAll("input, select, textarea"));
          masterHeaders.forEach((header, idx) => {
            if (!header)
              return;
            const targetVal = rowData[idx];
            this.fillField(inputs, header, targetVal, input, () => {
              searchInputFilled = true;
            });
          });
        }
      }
      if (!searchInputFilled) {
        input.value = val;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      console.error(e);
    }
    this.hideSuggestions();
  }
  fillField(inputs, header, value, sourceInput, onSelfFilled) {
    const normHeader = this.normalize(header);
    const target = inputs.find((inp) => {
      const k = inp.dataset.baseKey || inp.dataset.jsonPath;
      const ph = this.normalize(inp.getAttribute("placeholder") || "");
      return k && this.normalize(k) === normHeader || ph === normHeader;
    });
    if (target) {
      target.value = value || "";
      target.dispatchEvent(new Event("input", { bubbles: true }));
      if (target === sourceInput)
        onSelfFilled();
    }
  }
}

// src/weba/client/index.ts
var search = new SearchEngine;
window.GlobalSearch = search;
initRuntime();
search.init();
