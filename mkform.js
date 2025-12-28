var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/canonicalize/lib/canonicalize.js
var require_canonicalize = __commonJS((exports, module) => {
  module.exports = function serialize(object) {
    if (typeof object === "number" && isNaN(object)) {
      throw new Error("NaN is not allowed");
    }
    if (typeof object === "number" && !isFinite(object)) {
      throw new Error("Infinity is not allowed");
    }
    if (object === null || typeof object !== "object") {
      return JSON.stringify(object);
    }
    if (object.toJSON instanceof Function) {
      return serialize(object.toJSON());
    }
    if (Array.isArray(object)) {
      const values2 = object.reduce((t, cv, ci) => {
        const comma = ci === 0 ? "" : ",";
        const value = cv === undefined || typeof cv === "symbol" ? null : cv;
        return `${t}${comma}${serialize(value)}`;
      }, "");
      return `[${values2}]`;
    }
    const values = Object.keys(object).sort().reduce((t, cv) => {
      if (object[cv] === undefined || typeof object[cv] === "symbol") {
        return t;
      }
      const comma = t.length === 0 ? "" : ",";
      return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;
    }, "");
    return `{${values}}`;
  };
});

// src/form/renderer.ts
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
    const valMatch = attrs.match(/(?:val|value)="([^"]+)"/);
    if (valMatch) {
      extra += ` value="${this.escapeHtml(valMatch[1])}"`;
    } else {
      const valMatchSimple = attrs.match(/(?:val|value)=([^\s\)]+)/);
      if (valMatchSimple)
        extra += ` value="${this.escapeHtml(valMatchSimple[1])}"`;
    }
    return extra;
  },
  text: function(key, label, attrs) {
    const valMatch = (attrs || "").match(/(?:val|value)="([^"]+)"/) || (attrs || "").match(/(?:val|value)='([^']+)'/) || (attrs || "").match(/(?:val|value)=([^ ]+)/);
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
    const valMatch = (attrs || "").match(/(?:val|value)="([^"]+)"/) || (attrs || "").match(/(?:val|value)='([^']+)'/) || (attrs || "").match(/(?:val|value)=([^ ]+)/);
    const val = valMatch ? valMatch[1] : "";
    return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <textarea class="form-input" rows="5" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>${this.escapeHtml(val)}</textarea>
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
      return `<input type="text" readonly class="${commonClass}" ${dataAttr} data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; text-align:right; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "datalist") {
      const srcMatch = (attrs || "").match(/src:([a-zA-Z0-9_\-\u0080-\uFFFF]+)/);
      const labelIndexMatch = (attrs || "").match(/label:(\d+)/);
      let optionsHtml = "";
      const srcKey = srcMatch ? srcMatch[1] : "";
      if (srcKey && this._context.masterData && this._context.masterData[srcKey]) {
        const data = this._context.masterData[srcKey];
        const lIdx = labelIndexMatch ? parseInt(labelIndexMatch[1] || "1") - 1 : 1;
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
      let suggestAttr2 = "";
      if ((attrs || "").includes("suggest:column")) {
        suggestAttr2 = ' data-suggest-source="column"';
      }
      const copyMatch2 = (attrs || "").match(/copy:([^\s)]+)/);
      const copyAttr2 = copyMatch2 ? ` data-copy-from="${copyMatch2[1]}"` : "";
      const bgStyle2 = copyMatch2 ? "background-color: #ffffea;" : "";
      return `<div style="display:inline-block; position:relative; width: 100%; min-width: 100px;">
                        <input type="text" class="${searchClass}" ${dataAttr} autocomplete="off" data-master-src="${srcKey}"${labelIndexAttr}${valueIndexAttr} ${placeholder} style="${bgStyle2} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${suggestAttr2}${copyAttr2}>
                    </div>`;
    }
    if (type === "number") {
      const copyMatch2 = (attrs || "").match(/copy:([^\s)]+)/);
      const copyAttr2 = copyMatch2 ? ` data-copy-from="${copyMatch2[1]}"` : "";
      const bgStyle2 = copyMatch2 ? "background-color: #ffffea;" : "";
      return `<input type="number" class="${commonClass}" ${dataAttr} ${placeholder} style="text-align:right; ${bgStyle2} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${copyAttr2}>`;
    }
    if (type === "date") {
      return `<input type="date" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "checkbox") {
      return `<input type="checkbox" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    if (type === "autonum" || (attrs || "").includes("autonum")) {
      const classList = commonClass + " auto-num";
      return `<input type="number" readonly class="${classList}" ${dataAttr} data-autonum="true" style="background:transparent; border:none; text-align:center; width:100%; font-weight:bold; cursor:default; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
    }
    let suggestAttr = "";
    let suggestClass = "";
    if ((attrs || "").includes("suggest:column")) {
      suggestClass = " search-input";
      suggestAttr = ' data-suggest-source="column"';
    }
    const copyMatch = (attrs || "").match(/copy:([^\s)]+)/);
    const copyAttr = copyMatch ? ` data-copy-from="${copyMatch[1]}"` : "";
    const bgStyle = copyMatch ? "background-color: #ffffea;" : "";
    return `<input type="text" class="${commonClass}${suggestClass}" ${dataAttr} ${placeholder} style="${bgStyle} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${suggestAttr}${copyAttr}>`;
  },
  tableRow(cells, isTemplate = false) {
    const tds = cells.map((cell) => {
      const trimmed = cell.trim();
      const match = trimmed.match(/^\[(?:([a-z]+):)?([^\]:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
      if (match) {
        let [_, type, keyPart, attrsParen, attrsColon] = match;
        let key = (keyPart || "").trim();
        let extraAttrs = attrsParen || attrsColon || "";
        if (key.includes(" ")) {
          const parts = key.split(/\s+/);
          key = parts[0];
          extraAttrs = parts.slice(1).join(" ") + " " + extraAttrs;
        }
        const inputHtml = this.renderInput(type || "text", key, extraAttrs, isTemplate);
        return `<td>${inputHtml}</td>`;
      } else {
        return `<td>${this.escapeHtml(trimmed)}</td>`;
      }
    }).join("");
    return `<tr ${isTemplate ? 'class="template-row"' : ""}>${tds}</tr>`;
  }
};

// node_modules/js-yaml/dist/js-yaml.mjs
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length;index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0;cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception, compact) {
  var where = "", message = exception.reason || "(unknown reason)";
  if (!exception.mark)
    return message;
  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }
  where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
  if (!compact && exception.mark.snippet) {
    where += `

` + exception.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer)
    return null;
  if (!options.maxLength)
    options.maxLength = 79;
  if (typeof options.indent !== "number")
    options.indent = 1;
  if (typeof options.linesBefore !== "number")
    options.linesBefore = 3;
  if (typeof options.linesAfter !== "number")
    options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1;i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + `
` + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^" + `
`;
  for (i = 1;i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map) {
  var result = {};
  if (map !== null) {
    Object.keys(map).forEach(function(style) {
      map[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema, name) {
  var result = [];
  schema[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length;index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], " + "or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (;index < max; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + "|[-+]?\\.(?:inf|Inf|INF)" + "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9])" + "-([0-9][0-9])$");
var YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9]?)" + "-([0-9][0-9]?)" + "(?:[Tt]|[ \\t]+)" + "([0-9][0-9]?)" + ":([0-9][0-9])" + ":([0-9][0-9])" + "(?:\\.([0-9]*))?" + "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + "(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000;
    if (match[9] === "-")
      delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64)
      continue;
    if (code < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0;idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null)
        return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\x00" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "\t" : c === 9 ? "\t" : c === 110 ? `
` : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0;i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length;_position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length;index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length;index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length;index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat(`
`, count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (;hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += `
`;
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat(`
`, emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat(`
`, emptyLines);
      }
    } else {
      state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length;typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length;typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += `
`;
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\x00");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\x00";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length;index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = "\\\"";
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length;index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf(`
`, position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== `
`)
      result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return `
` + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length;index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i2;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === `
`;
  var keep = clip && (string[string.length - 2] === `
` || string === `
`);
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + `
`;
}
function dropEndingNewline(string) {
  return string[string.length - 1] === `
` ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf(`
`);
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === `
` || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? `
` : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += `
` + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += `
`;
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + `
` + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
    char = codePointAt(string, i2);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i2];
      if (char >= 65536)
        result += string[i2 + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length;index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length;index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length;index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length;index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + `
`;
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. " + "Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};

// src/form/parser.ts
function parseMarkdown(text) {
  const lines = text.split(`
`);
  let html = "";
  let jsonStructure = { "@context": "https://schema.org", "@type": "CreativeWork" };
  const aggSpecs = [];
  const parseAggSpec = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed)
      return null;
    try {
      return JSON.parse(trimmed);
    } catch {}
    try {
      return jsYaml.load(trimmed);
    } catch {}
    return null;
  };
  const masterData = {};
  let scanInMaster = false;
  let scanMasterKey = "";
  let scanInAggSpec = false;
  lines.forEach((line) => {
    const t = line.trim();
    if (t === "```agg") {
      scanInAggSpec = true;
      return;
    }
    if (scanInAggSpec) {
      if (t === "```")
        scanInAggSpec = false;
      return;
    }
    const masterMatch = t.match(/^\[master:([^\]]+)\]$/);
    if (masterMatch) {
      scanMasterKey = masterMatch[1] || "";
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
  let currentMasterKey = "";
  jsonStructure.fields = [];
  jsonStructure.tables = {};
  jsonStructure.masterData = masterData;
  let tabs = [];
  let currentTabId = null;
  let mainContentHtml = "";
  let inAggBlock = false;
  let aggLines = [];
  const appendHtml = (str2) => {
    mainContentHtml += str2;
  };
  const processInlineTags = (text2) => {
    return text2.replace(/\[(?:([a-z]+):)?([^\]\s:\(\)]+)(?:\s*\((.*?)\))?\]/g, (match, type2, key, attrs) => {
      const label = (attrs || "").match(/placeholder="([^"]+)"/) || (attrs || "").match(/placeholder='([^']+)'/);
      const cleanLabel = label ? label[1] : key;
      jsonStructure.fields.push({ key, label: cleanLabel, type: type2 || "text" });
      return Renderers.renderInput(type2 || "text", key, attrs || "");
    });
  };
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed === "```agg") {
      inAggBlock = true;
      aggLines = [];
      return;
    }
    if (inAggBlock) {
      if (trimmed === "```") {
        inAggBlock = false;
        const parsed = parseAggSpec(aggLines.join(`
`));
        if (parsed)
          aggSpecs.push(parsed);
        aggLines = [];
      } else {
        aggLines.push(line);
      }
      return;
    }
    const masterMatch = trimmed.match(/^\[master:([^\]]+)\]$/);
    if (masterMatch) {
      currentMasterKey = masterMatch[1] || "";
      return;
    }
    const dynTableMatch = trimmed.match(/^\[dynamic\s*-?\s*table:([^\]]+)\]$/);
    if (dynTableMatch) {
      currentDynamicTableKey = dynTableMatch[1] || "";
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
              const match = cell.trim().match(/^\[(?:([a-z]+):)?([^\]:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);
              if (match) {
                let [_, type2, keyPart, attrsParen, attrsColon] = match;
                let key = keyPart.trim();
                let extraAttrs = attrsParen || attrsColon || "";
                if (key.includes(" ")) {
                  const parts = key.split(/\s+/);
                  key = parts[0];
                  extraAttrs = parts.slice(1).join(" ") + " " + extraAttrs;
                }
                const placeholderMatch = extraAttrs.match(/placeholder="([^"]+)"/) || extraAttrs.match(/placeholder='([^']+)'/);
                const label = placeholderMatch ? placeholderMatch[1] : key;
                jsonStructure.tables[tableKey].push({ key, label, type: type2 || "text" });
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
        currentMasterKey = "";
      }
    }
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1] ? headerMatch[1].length : 1;
      const content = headerMatch[2] || "";
      if (level === 1) {
        appendHtml(`<h1>${Renderers.escapeHtml(content)}</h1>`);
        jsonStructure.name = content;
      } else if (level === 2) {
        if (currentTabId) {
          appendHtml("</div>");
        }
        const isSystem = content.includes("(Config)") || content.includes("(Hidden)") || content.includes("(System)");
        const tabId = "tab-" + (tabs.length + 1);
        tabs.push({ id: tabId, title: content, isSystem });
        currentTabId = tabId;
        const activeClass = !isSystem && tabs.filter((t) => !t.isSystem).length === 1 ? " active" : "";
        const styleAttr = isSystem ? ' style="display:none !important;"' : "";
        appendHtml(`<div id="${tabId}" class="tab-content${activeClass}" data-tab-title="${Renderers.escapeHtml(content)}"${styleAttr}>`);
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
        const [_, type2, key, attrs, label] = match;
        currentRadioGroup = null;
        const cleanLabel = (label || "").trim();
        jsonStructure.fields.push({ key, label: cleanLabel, type: type2 });
        if (type2 === "radio") {
          currentRadioGroup = { key, label: cleanLabel, attrs: attrs || "" };
          appendHtml(Renderers.radioStart(key, cleanLabel, attrs));
        } else if (type2 === "text")
          appendHtml(Renderers.text(key, cleanLabel, attrs));
        else if (type2 === "number")
          appendHtml(Renderers.number(key, cleanLabel, attrs));
        else if (type2 === "date")
          appendHtml(Renderers.date(key, cleanLabel, attrs));
        else if (type2 === "textarea")
          appendHtml(Renderers.textarea(key, cleanLabel, attrs));
        else if (type2 === "search")
          appendHtml(Renderers.search(key, cleanLabel, attrs));
        else if (type2 === "calc")
          appendHtml(Renderers.calc(key, cleanLabel, attrs));
        else if (type2 === "datalist")
          appendHtml(Renderers.renderInput(type2, key, attrs));
        else if (type2 && Renderers[type2]) {
          appendHtml(Renderers[type2](key, cleanLabel, attrs));
        } else {
          console.warn(`Unknown type: ${type2}`, Object.keys(Renderers));
          appendHtml(`<p style="color:red">Unknown type: ${type2}</p>`);
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
  if (inTable) {
    appendHtml("</tbody></table></div>");
    if (currentDynamicTableKey) {
      appendHtml(`<button type="button" class="add-row-btn" onclick="addTableRow(this, '${currentDynamicTableKey}')" data-i18n="add_row">+ 行を追加</button>`);
      currentDynamicTableKey = null;
    }
    appendHtml("</div>");
  }
  if (currentRadioGroup)
    appendHtml("</div></div>");
  if (currentTabId)
    appendHtml("</div>");
  const toolbarButtons = `
            <div style="flex:1"></div>
            <button class="btn-clear" onclick="window.clearData()" data-i18n="clear_btn">Clear</button>
            <button class="secondary" onclick="window.saveDraft()" data-i18n="work_save_btn">Save Progress</button>
            <button class="primary" onclick="window.signAndDownload()" data-i18n="sign_btn">Submit</button>
    `;
  const toolbarHtml = `<div class="no-print form-toolbar" style="display: flex; gap: 10px; align-items: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee;">
            ${toolbarButtons}
        </div>`;
  if (tabs.length > 0) {
    let navHtml = '<div class="tabs-nav">';
    let visibleTabCount = 0;
    tabs.forEach((tab, idx) => {
      if (tab.isSystem)
        return;
      const activeClass = visibleTabCount === 0 ? " active" : "";
      navHtml += `<button class="tab-btn${activeClass}" onclick="switchTab(this, '${tab.id}')">${Renderers.escapeHtml(tab.title)}</button>`;
      visibleTabCount++;
    });
    navHtml += `<div class="no-print" style="display: flex; gap: 10px; align-items: center; flex-grow: 1;">
            ${toolbarButtons}
        </div>`;
    navHtml += "</div>";
    if (mainContentHtml.includes("</h1>")) {
      html = mainContentHtml.replace("</h1>", "</h1>" + navHtml);
    } else {
      html = navHtml + mainContentHtml;
    }
  } else {
    html = mainContentHtml + toolbarHtml;
  }
  if (aggSpecs.length === 1) {
    jsonStructure.aggSpec = aggSpecs[0];
  } else if (aggSpecs.length > 1) {
    jsonStructure.aggSpec = aggSpecs;
  }
  return { html, jsonStructure };
}

// src/form/client/embed.ts
var CLIENT_BUNDLE = 'var pQ=Object.create;var{getPrototypeOf:uQ,defineProperty:Lq,getOwnPropertyNames:cQ}=Object;var dQ=Object.prototype.hasOwnProperty;var Iq=($,q,J)=>{J=$!=null?pQ(uQ($)):{};let Q=q||!$||!$.__esModule?Lq(J,"default",{value:$,enumerable:!0}):J;for(let G of cQ($))if(!dQ.call(Q,G))Lq(Q,G,{get:()=>$[G],enumerable:!0});return Q};var lQ=($,q)=>()=>(q||$((q={exports:{}}).exports,q),q.exports);var f$=lQ((KG,RJ)=>{RJ.exports=function $(q){if(typeof q==="number"&&isNaN(q))throw new Error("NaN is not allowed");if(typeof q==="number"&&!isFinite(q))throw new Error("Infinity is not allowed");if(q===null||typeof q!=="object")return JSON.stringify(q);if(q.toJSON instanceof Function)return $(q.toJSON());if(Array.isArray(q))return`[${q.reduce((G,U,X)=>{return`${G}${X===0?"":","}${$(U===void 0||typeof U==="symbol"?null:U)}`},"")}]`;return`{${Object.keys(q).sort().reduce((Q,G)=>{if(q[G]===void 0||typeof q[G]==="symbol")return Q;let U=Q.length===0?"":",";return`${Q}${U}${$(G)}:${$(q[G])}`},"")}}`}});class E${runAutoCopy(){document.querySelectorAll("[data-copy-from]").forEach(($)=>{if(!$.dataset.dirty){let q=$.dataset.copyFrom;if(q){let G=($.closest("tr")||document).querySelector(`[data-base-key="${q}"], [data-json-path="${q}"]`);if(G&&G.value!==$.value)$.value=G.value,$.dispatchEvent(new Event("input",{bubbles:!0}))}}})}recalculate(){document.querySelectorAll("[data-formula]").forEach(($)=>{let q=$.dataset.formula;if(!q)return;let J=$.closest("tr"),Q=$.closest("table"),G=(X)=>{let Z=0,Y="none";if(J){let N=`[data-base-key="${X}"], [data-json-path="${X}"]`,W=J.querySelector(N);if(W){if(Y="row-input",W.value!=="")Z=parseFloat(W.value)}}if(Y==="none"){let N=document.querySelector(`[data-json-path="${X}"]`);if(N){if(Y="static-input",N.value!=="")Z=parseFloat(N.value)}}return Z},U=q.replace(/SUM\\(([a-zA-Z0-9_\\-\\u0080-\\uFFFF]+)\\)/g,(X,Z)=>{let Y=0,N=Q||document,W=N.querySelectorAll(`[data-base-key="${Z}"], [data-json-path="${Z}"]`);if(W.length===0&&N!==document)W=document.querySelectorAll(`[data-base-key="${Z}"], [data-json-path="${Z}"]`);return W.forEach((K)=>{let E=parseFloat(K.value);if(!isNaN(E))Y+=E}),Y});U=U.replace(/([a-zA-Z_\\u0080-\\uFFFF][a-zA-Z0-9_\\-\\u0080-\\uFFFF]*)/g,(X)=>{if(["Math","round","floor","ceil","abs","min","max"].includes(X))return X;return String(G(X))});try{let X=new Function("return "+U)();if(typeof X==="number"&&!isNaN(X))$.value=Number.isInteger(X)?X:X.toFixed(0);else $.value=""}catch(X){console.error("Calc Error:",X),$.value="Err"}}),this.runAutoCopy()}}/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */function W0($){return $ instanceof Uint8Array||ArrayBuffer.isView($)&&$.constructor.name==="Uint8Array"}function z8($,q=""){if(!Number.isSafeInteger($)||$<0){let J=q&&`"${q}" `;throw new Error(`${J}expected integer >= 0, got ${$}`)}}function p($,q,J=""){let Q=W0($),G=$?.length,U=q!==void 0;if(!Q||U&&G!==q){let X=J&&`"${J}" `,Z=U?` of length ${q}`:"",Y=Q?`length=${G}`:`type=${typeof $}`;throw new Error(X+"expected Uint8Array"+Z+", got "+Y)}return $}function M0($){if(typeof $!=="function"||typeof $.create!=="function")throw new Error("Hash must wrapped by utils.createHasher");z8($.outputLen),z8($.blockLen)}function j8($,q=!0){if($.destroyed)throw new Error("Hash instance has been destroyed");if(q&&$.finished)throw new Error("Hash#digest() has already been called")}function F0($,q){p($,void 0,"digestInto() output");let J=q.outputLen;if($.length<J)throw new Error(\'"digestInto() output" expected to be of length >=\'+J)}function f0($){return new Uint32Array($.buffer,$.byteOffset,Math.floor($.byteLength/4))}function O8(...$){for(let q=0;q<$.length;q++)$[q].fill(0)}function x0($){return new DataView($.buffer,$.byteOffset,$.byteLength)}function L8($,q){return $<<32-q|$>>>q}var nQ=(()=>new Uint8Array(new Uint32Array([287454020]).buffer)[0]===68)();function iQ($){return $<<24&4278190080|$<<8&16711680|$>>>8&65280|$>>>24&255}function oQ($){for(let q=0;q<$.length;q++)$[q]=iQ($[q]);return $}var C$=nQ?($)=>$:oQ,Aq=(()=>typeof Uint8Array.from([]).toHex==="function"&&typeof Uint8Array.fromHex==="function")(),rQ=Array.from({length:256},($,q)=>q.toString(16).padStart(2,"0"));function t8($){if(p($),Aq)return $.toHex();let q="";for(let J=0;J<$.length;J++)q+=rQ[$[J]];return q}var V8={_0:48,_9:57,A:65,F:70,a:97,f:102};function Tq($){if($>=V8._0&&$<=V8._9)return $-V8._0;if($>=V8.A&&$<=V8.F)return $-(V8.A-10);if($>=V8.a&&$<=V8.f)return $-(V8.a-10);return}function N0($){if(typeof $!=="string")throw new Error("hex string expected, got "+typeof $);if(Aq)return Uint8Array.fromHex($);let q=$.length,J=q/2;if(q%2)throw new Error("hex string expected, got unpadded hex of length "+q);let Q=new Uint8Array(J);for(let G=0,U=0;G<J;G++,U+=2){let X=Tq($.charCodeAt(U)),Z=Tq($.charCodeAt(U+1));if(X===void 0||Z===void 0){let Y=$[U]+$[U+1];throw new Error(\'hex string expected, got non-hex character "\'+Y+\'" at index \'+U)}Q[G]=X*16+Z}return Q}function e8(...$){let q=0;for(let Q=0;Q<$.length;Q++){let G=$[Q];p(G),q+=G.length}let J=new Uint8Array(q);for(let Q=0,G=0;Q<$.length;Q++){let U=$[Q];J.set(U,G),G+=U.length}return J}function $0($,q={}){let J=(G,U)=>$(U).update(G).digest(),Q=$(void 0);return J.outputLen=Q.outputLen,J.blockLen=Q.blockLen,J.create=(G)=>$(G),Object.assign(J,q),Object.freeze(J)}function p8($=32){let q=typeof globalThis==="object"?globalThis.crypto:null;if(typeof q?.getRandomValues!=="function")throw new Error("crypto.getRandomValues must be defined");return q.getRandomValues(new Uint8Array($))}var _8=($)=>({oid:Uint8Array.from([6,9,96,134,72,1,101,3,4,2,$])});function Bq($,q,J){return $&q^~$&J}function wq($,q,J){return $&q^$&J^q&J}class S0{blockLen;outputLen;padOffset;isLE;buffer;view;finished=!1;length=0;pos=0;destroyed=!1;constructor($,q,J,Q){this.blockLen=$,this.outputLen=q,this.padOffset=J,this.isLE=Q,this.buffer=new Uint8Array($),this.view=x0(this.buffer)}update($){j8(this),p($);let{view:q,buffer:J,blockLen:Q}=this,G=$.length;for(let U=0;U<G;){let X=Math.min(Q-this.pos,G-U);if(X===Q){let Z=x0($);for(;Q<=G-U;U+=Q)this.process(Z,U);continue}if(J.set($.subarray(U,U+X),this.pos),this.pos+=X,U+=X,this.pos===Q)this.process(q,0),this.pos=0}return this.length+=$.length,this.roundClean(),this}digestInto($){j8(this),F0($,this),this.finished=!0;let{buffer:q,view:J,blockLen:Q,isLE:G}=this,{pos:U}=this;if(q[U++]=128,O8(this.buffer.subarray(U)),this.padOffset>Q-U)this.process(J,0),U=0;for(let W=U;W<Q;W++)q[W]=0;J.setBigUint64(Q-8,BigInt(this.length*8),G),this.process(J,0);let X=x0($),Z=this.outputLen;if(Z%4)throw new Error("_sha2: outputLen must be aligned to 32bit");let Y=Z/4,N=this.get();if(Y>N.length)throw new Error("_sha2: outputLen bigger than state");for(let W=0;W<Y;W++)X.setUint32(4*W,N[W],G)}digest(){let{buffer:$,outputLen:q}=this;this.digestInto($);let J=$.slice(0,q);return this.destroy(),J}_cloneInto($){$||=new this.constructor,$.set(...this.get());let{blockLen:q,buffer:J,length:Q,finished:G,destroyed:U,pos:X}=this;if($.destroyed=U,$.finished=G,$.length=Q,$.pos=X,Q%q)$.buffer.set(J);return $}clone(){return this._cloneInto()}}var P8=Uint32Array.from([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]),F8=Uint32Array.from([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]),q8=Uint32Array.from([3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428]),J8=Uint32Array.from([1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209]);var _0=BigInt(4294967295),Vq=BigInt(32);function aQ($,q=!1){if(q)return{h:Number($&_0),l:Number($>>Vq&_0)};return{h:Number($>>Vq&_0)|0,l:Number($&_0)|0}}function k0($,q=!1){let J=$.length,Q=new Uint32Array(J),G=new Uint32Array(J);for(let U=0;U<J;U++){let{h:X,l:Z}=aQ($[U],q);[Q[U],G[U]]=[X,Z]}return[Q,G]}var R$=($,q,J)=>$>>>J,H$=($,q,J)=>$<<32-J|q>>>J,u8=($,q,J)=>$>>>J|q<<32-J,c8=($,q,J)=>$<<32-J|q>>>J,O0=($,q,J)=>$<<64-J|q>>>J-32,K0=($,q,J)=>$>>>J-32|q<<64-J;var jq=($,q,J)=>$<<J|q>>>32-J,Pq=($,q,J)=>q<<J|$>>>32-J,Fq=($,q,J)=>q<<J-32|$>>>64-J,fq=($,q,J)=>$<<J-32|q>>>64-J;function I8($,q,J,Q){let G=(q>>>0)+(Q>>>0);return{h:$+J+(G/4294967296|0)|0,l:G|0}}var xq=($,q,J)=>($>>>0)+(q>>>0)+(J>>>0),Sq=($,q,J,Q)=>q+J+Q+($/4294967296|0)|0,_q=($,q,J,Q)=>($>>>0)+(q>>>0)+(J>>>0)+(Q>>>0),kq=($,q,J,Q,G)=>q+J+Q+G+($/4294967296|0)|0,vq=($,q,J,Q,G)=>($>>>0)+(q>>>0)+(J>>>0)+(Q>>>0)+(G>>>0),yq=($,q,J,Q,G,U)=>q+J+Q+G+U+($/4294967296|0)|0;var tQ=Uint32Array.from([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),k8=new Uint32Array(64);class L$ extends S0{constructor($){super(64,$,8,!1)}get(){let{A:$,B:q,C:J,D:Q,E:G,F:U,G:X,H:Z}=this;return[$,q,J,Q,G,U,X,Z]}set($,q,J,Q,G,U,X,Z){this.A=$|0,this.B=q|0,this.C=J|0,this.D=Q|0,this.E=G|0,this.F=U|0,this.G=X|0,this.H=Z|0}process($,q){for(let W=0;W<16;W++,q+=4)k8[W]=$.getUint32(q,!1);for(let W=16;W<64;W++){let K=k8[W-15],E=k8[W-2],R=L8(K,7)^L8(K,18)^K>>>3,A=L8(E,17)^L8(E,19)^E>>>10;k8[W]=A+k8[W-7]+R+k8[W-16]|0}let{A:J,B:Q,C:G,D:U,E:X,F:Z,G:Y,H:N}=this;for(let W=0;W<64;W++){let K=L8(X,6)^L8(X,11)^L8(X,25),E=N+K+Bq(X,Z,Y)+tQ[W]+k8[W]|0,A=(L8(J,2)^L8(J,13)^L8(J,22))+wq(J,Q,G)|0;N=Y,Y=Z,Z=X,X=U+E|0,U=G,G=Q,Q=J,J=E+A|0}J=J+this.A|0,Q=Q+this.B|0,G=G+this.C|0,U=U+this.D|0,X=X+this.E|0,Z=Z+this.F|0,Y=Y+this.G|0,N=N+this.H|0,this.set(J,Q,G,U,X,Z,Y,N)}roundClean(){O8(k8)}destroy(){this.set(0,0,0,0,0,0,0,0),O8(this.buffer)}}class gq extends L${A=P8[0]|0;B=P8[1]|0;C=P8[2]|0;D=P8[3]|0;E=P8[4]|0;F=P8[5]|0;G=P8[6]|0;H=P8[7]|0;constructor(){super(32)}}class eQ extends L${A=F8[0]|0;B=F8[1]|0;C=F8[2]|0;D=F8[3]|0;E=F8[4]|0;F=F8[5]|0;G=F8[6]|0;H=F8[7]|0;constructor(){super(28)}}var mq=(()=>k0(["0x428a2f98d728ae22","0x7137449123ef65cd","0xb5c0fbcfec4d3b2f","0xe9b5dba58189dbbc","0x3956c25bf348b538","0x59f111f1b605d019","0x923f82a4af194f9b","0xab1c5ed5da6d8118","0xd807aa98a3030242","0x12835b0145706fbe","0x243185be4ee4b28c","0x550c7dc3d5ffb4e2","0x72be5d74f27b896f","0x80deb1fe3b1696b1","0x9bdc06a725c71235","0xc19bf174cf692694","0xe49b69c19ef14ad2","0xefbe4786384f25e3","0x0fc19dc68b8cd5b5","0x240ca1cc77ac9c65","0x2de92c6f592b0275","0x4a7484aa6ea6e483","0x5cb0a9dcbd41fbd4","0x76f988da831153b5","0x983e5152ee66dfab","0xa831c66d2db43210","0xb00327c898fb213f","0xbf597fc7beef0ee4","0xc6e00bf33da88fc2","0xd5a79147930aa725","0x06ca6351e003826f","0x142929670a0e6e70","0x27b70a8546d22ffc","0x2e1b21385c26c926","0x4d2c6dfc5ac42aed","0x53380d139d95b3df","0x650a73548baf63de","0x766a0abb3c77b2a8","0x81c2c92e47edaee6","0x92722c851482353b","0xa2bfe8a14cf10364","0xa81a664bbc423001","0xc24b8b70d0f89791","0xc76c51a30654be30","0xd192e819d6ef5218","0xd69906245565a910","0xf40e35855771202a","0x106aa07032bbd1b8","0x19a4c116b8d2d0c8","0x1e376c085141ab53","0x2748774cdf8eeb99","0x34b0bcb5e19b48a8","0x391c0cb3c5c95a63","0x4ed8aa4ae3418acb","0x5b9cca4f7763e373","0x682e6ff3d6b2b8a3","0x748f82ee5defb2fc","0x78a5636f43172f60","0x84c87814a1f0ab72","0x8cc702081a6439ec","0x90befffa23631e28","0xa4506cebde82bde9","0xbef9a3f7b2c67915","0xc67178f2e372532b","0xca273eceea26619c","0xd186b8c721c0c207","0xeada7dd6cde0eb1e","0xf57d4f7fee6ed178","0x06f067aa72176fba","0x0a637dc5a2c898a6","0x113f9804bef90dae","0x1b710b35131c471b","0x28db77f523047d84","0x32caab7b40c72493","0x3c9ebe0a15c9bebc","0x431d67c49c100d4c","0x4cc5d4becb3e42b6","0x597f299cfc657e2a","0x5fcb6fab3ad6faec","0x6c44198c4a475817"].map(($)=>BigInt($))))(),$1=(()=>mq[0])(),q1=(()=>mq[1])(),v8=new Uint32Array(80),y8=new Uint32Array(80);class z0 extends S0{constructor($){super(128,$,16,!1)}get(){let{Ah:$,Al:q,Bh:J,Bl:Q,Ch:G,Cl:U,Dh:X,Dl:Z,Eh:Y,El:N,Fh:W,Fl:K,Gh:E,Gl:R,Hh:A,Hl:_}=this;return[$,q,J,Q,G,U,X,Z,Y,N,W,K,E,R,A,_]}set($,q,J,Q,G,U,X,Z,Y,N,W,K,E,R,A,_){this.Ah=$|0,this.Al=q|0,this.Bh=J|0,this.Bl=Q|0,this.Ch=G|0,this.Cl=U|0,this.Dh=X|0,this.Dl=Z|0,this.Eh=Y|0,this.El=N|0,this.Fh=W|0,this.Fl=K|0,this.Gh=E|0,this.Gl=R|0,this.Hh=A|0,this.Hl=_|0}process($,q){for(let C=0;C<16;C++,q+=4)v8[C]=$.getUint32(q),y8[C]=$.getUint32(q+=4);for(let C=16;C<80;C++){let D=v8[C-15]|0,F=y8[C-15]|0,f=u8(D,F,1)^u8(D,F,8)^R$(D,F,7),k=c8(D,F,1)^c8(D,F,8)^H$(D,F,7),y=v8[C-2]|0,w=y8[C-2]|0,P=u8(y,w,19)^O0(y,w,61)^R$(y,w,6),x=c8(y,w,19)^K0(y,w,61)^H$(y,w,6),g=_q(k,x,y8[C-7],y8[C-16]),u=kq(g,f,P,v8[C-7],v8[C-16]);v8[C]=u|0,y8[C]=g|0}let{Ah:J,Al:Q,Bh:G,Bl:U,Ch:X,Cl:Z,Dh:Y,Dl:N,Eh:W,El:K,Fh:E,Fl:R,Gh:A,Gl:_,Hh:L,Hl:j}=this;for(let C=0;C<80;C++){let D=u8(W,K,14)^u8(W,K,18)^O0(W,K,41),F=c8(W,K,14)^c8(W,K,18)^K0(W,K,41),f=W&E^~W&A,k=K&R^~K&_,y=vq(j,F,k,q1[C],y8[C]),w=yq(y,L,D,f,$1[C],v8[C]),P=y|0,x=u8(J,Q,28)^O0(J,Q,34)^O0(J,Q,39),g=c8(J,Q,28)^K0(J,Q,34)^K0(J,Q,39),u=J&G^J&X^G&X,O=Q&U^Q&Z^U&Z;L=A|0,j=_|0,A=E|0,_=R|0,E=W|0,R=K|0,{h:W,l:K}=I8(Y|0,N|0,w|0,P|0),Y=X|0,N=Z|0,X=G|0,Z=U|0,G=J|0,U=Q|0;let T=xq(P,g,O);J=Sq(T,w,x,u),Q=T|0}({h:J,l:Q}=I8(this.Ah|0,this.Al|0,J|0,Q|0)),{h:G,l:U}=I8(this.Bh|0,this.Bl|0,G|0,U|0),{h:X,l:Z}=I8(this.Ch|0,this.Cl|0,X|0,Z|0),{h:Y,l:N}=I8(this.Dh|0,this.Dl|0,Y|0,N|0),{h:W,l:K}=I8(this.Eh|0,this.El|0,W|0,K|0),{h:E,l:R}=I8(this.Fh|0,this.Fl|0,E|0,R|0),{h:A,l:_}=I8(this.Gh|0,this.Gl|0,A|0,_|0),{h:L,l:j}=I8(this.Hh|0,this.Hl|0,L|0,j|0),this.set(J,Q,G,U,X,Z,Y,N,W,K,E,R,A,_,L,j)}roundClean(){O8(v8,y8)}destroy(){O8(this.buffer),this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)}}class bq extends z0{Ah=J8[0]|0;Al=J8[1]|0;Bh=J8[2]|0;Bl=J8[3]|0;Ch=J8[4]|0;Cl=J8[5]|0;Dh=J8[6]|0;Dl=J8[7]|0;Eh=J8[8]|0;El=J8[9]|0;Fh=J8[10]|0;Fl=J8[11]|0;Gh=J8[12]|0;Gl=J8[13]|0;Hh=J8[14]|0;Hl=J8[15]|0;constructor(){super(64)}}class J1 extends z0{Ah=q8[0]|0;Al=q8[1]|0;Bh=q8[2]|0;Bl=q8[3]|0;Ch=q8[4]|0;Cl=q8[5]|0;Dh=q8[6]|0;Dl=q8[7]|0;Eh=q8[8]|0;El=q8[9]|0;Fh=q8[10]|0;Fl=q8[11]|0;Gh=q8[12]|0;Gl=q8[13]|0;Hh=q8[14]|0;Hl=q8[15]|0;constructor(){super(48)}}var Q8=Uint32Array.from([2352822216,424955298,1944164710,2312950998,502970286,855612546,1738396948,1479516111,258812777,2077511080,2011393907,79989058,1067287976,1780299464,286451373,2446758561]),G8=Uint32Array.from([573645204,4230739756,2673172387,3360449730,596883563,1867755857,2520282905,1497426621,2519219938,2827943907,3193839141,1401305490,721525244,746961066,246885852,2177182882]);class Q1 extends z0{Ah=Q8[0]|0;Al=Q8[1]|0;Bh=Q8[2]|0;Bl=Q8[3]|0;Ch=Q8[4]|0;Cl=Q8[5]|0;Dh=Q8[6]|0;Dl=Q8[7]|0;Eh=Q8[8]|0;El=Q8[9]|0;Fh=Q8[10]|0;Fl=Q8[11]|0;Gh=Q8[12]|0;Gl=Q8[13]|0;Hh=Q8[14]|0;Hl=Q8[15]|0;constructor(){super(28)}}class G1 extends z0{Ah=G8[0]|0;Al=G8[1]|0;Bh=G8[2]|0;Bl=G8[3]|0;Ch=G8[4]|0;Cl=G8[5]|0;Dh=G8[6]|0;Dl=G8[7]|0;Eh=G8[8]|0;El=G8[9]|0;Fh=G8[10]|0;Fl=G8[11]|0;Gh=G8[12]|0;Gl=G8[13]|0;Hh=G8[14]|0;Hl=G8[15]|0;constructor(){super(32)}}var Y8=$0(()=>new gq,_8(1));var hq=$0(()=>new bq,_8(3));/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var uq=BigInt(0),pq=BigInt(1);function y0($,q=""){if(typeof $!=="boolean"){let J=q&&`"${q}" `;throw new Error(J+"expected boolean, got type="+typeof $)}return $}function U1($){if(typeof $==="bigint"){if(!v0($))throw new Error("positive bigint expected, got "+$)}else z8($);return $}function cq($){if(typeof $!=="string")throw new Error("hex string expected, got "+typeof $);return $===""?uq:BigInt("0x"+$)}function dq($){return cq(t8($))}function f8($){return cq(t8(d8(p($)).reverse()))}function I$($,q){z8(q),$=U1($);let J=N0($.toString(16).padStart(q*2,"0"));if(J.length!==q)throw new Error("number too large");return J}function g0($,q){return I$($,q).reverse()}function d8($){return Uint8Array.from($)}var v0=($)=>typeof $==="bigint"&&uq<=$;function X1($,q,J){return v0($)&&v0(q)&&v0(J)&&q<=$&&$<J}function q0($,q,J,Q){if(!X1(q,J,Q))throw new Error("expected valid "+$+": "+J+" <= n < "+Q+", got "+q)}var lq=($)=>(pq<<BigInt($))-pq;function l8($,q={},J={}){if(!$||typeof $!=="object")throw new Error("expected valid options object");function Q(U,X,Z){let Y=$[U];if(Z&&Y===void 0)return;let N=typeof Y;if(N!==X||Y===null)throw new Error(`param "${U}" is invalid: expected ${X}, got ${N}`)}let G=(U,X)=>Object.entries(U).forEach(([Z,Y])=>Q(Z,Y,X));G(q,!1),G(J,!0)}function T$($){let q=new WeakMap;return(J,...Q)=>{let G=q.get(J);if(G!==void 0)return G;let U=$(J,...Q);return q.set(J,U),U}}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var Z8=BigInt(0),U8=BigInt(1),n8=BigInt(2),oq=BigInt(3),rq=BigInt(4),aq=BigInt(5),Y1=BigInt(7),sq=BigInt(8),Z1=BigInt(9),tq=BigInt(16);function i($,q){let J=$%q;return J>=Z8?J:q+J}function E8($,q,J){let Q=$;while(q-- >Z8)Q*=Q,Q%=J;return Q}function nq($,q){if($===Z8)throw new Error("invert: expected non-zero number");if(q<=Z8)throw new Error("invert: expected positive modulus, got "+q);let J=i($,q),Q=q,G=Z8,U=U8,X=U8,Z=Z8;while(J!==Z8){let N=Q/J,W=Q%J,K=G-X*N,E=U-Z*N;Q=J,J=W,G=X,U=Z,X=K,Z=E}if(Q!==U8)throw new Error("invert: does not exist");return i(G,q)}function A$($,q,J){if(!$.eql($.sqr(q),J))throw new Error("Cannot find square root")}function eq($,q){let J=($.ORDER+U8)/rq,Q=$.pow(q,J);return A$($,Q,q),Q}function W1($,q){let J=($.ORDER-aq)/sq,Q=$.mul(q,n8),G=$.pow(Q,J),U=$.mul(q,G),X=$.mul($.mul(U,n8),G),Z=$.mul(U,$.sub(X,$.ONE));return A$($,Z,q),Z}function M1($){let q=b0($),J=$J($),Q=J(q,q.neg(q.ONE)),G=J(q,Q),U=J(q,q.neg(Q)),X=($+Y1)/tq;return(Z,Y)=>{let N=Z.pow(Y,X),W=Z.mul(N,Q),K=Z.mul(N,G),E=Z.mul(N,U),R=Z.eql(Z.sqr(W),Y),A=Z.eql(Z.sqr(K),Y);N=Z.cmov(N,W,R),W=Z.cmov(E,K,A);let _=Z.eql(Z.sqr(W),Y),L=Z.cmov(N,W,_);return A$(Z,L,Y),L}}function $J($){if($<oq)throw new Error("sqrt is not defined for small field");let q=$-U8,J=0;while(q%n8===Z8)q/=n8,J++;let Q=n8,G=b0($);while(iq(G,Q)===1)if(Q++>1000)throw new Error("Cannot find square root: probably non-prime P");if(J===1)return eq;let U=G.pow(Q,q),X=(q+U8)/n8;return function Z(Y,N){if(Y.is0(N))return N;if(iq(Y,N)!==1)throw new Error("Cannot find square root");let W=J,K=Y.mul(Y.ONE,U),E=Y.pow(N,q),R=Y.pow(N,X);while(!Y.eql(E,Y.ONE)){if(Y.is0(E))return Y.ZERO;let A=1,_=Y.sqr(E);while(!Y.eql(_,Y.ONE))if(A++,_=Y.sqr(_),A===W)throw new Error("Cannot find square root");let L=U8<<BigInt(W-A-1),j=Y.pow(K,L);W=A,K=Y.sqr(j),E=Y.mul(E,K),R=Y.mul(R,j)}return R}}function N1($){if($%rq===oq)return eq;if($%sq===aq)return W1;if($%tq===Z1)return M1($);return $J($)}var qJ=($,q)=>(i($,q)&U8)===U8,O1=["create","isValid","is0","neg","inv","sqrt","sqr","eql","add","sub","mul","pow","div","addN","subN","mulN","sqrN"];function JJ($){let q={ORDER:"bigint",BYTES:"number",BITS:"number"},J=O1.reduce((Q,G)=>{return Q[G]="function",Q},q);return l8($,J),$}function K1($,q,J){if(J<Z8)throw new Error("invalid exponent, negatives unsupported");if(J===Z8)return $.ONE;if(J===U8)return q;let Q=$.ONE,G=q;while(J>Z8){if(J&U8)Q=$.mul(Q,G);G=$.sqr(G),J>>=U8}return Q}function m0($,q,J=!1){let Q=new Array(q.length).fill(J?$.ZERO:void 0),G=q.reduce((X,Z,Y)=>{if($.is0(Z))return X;return Q[Y]=X,$.mul(X,Z)},$.ONE),U=$.inv(G);return q.reduceRight((X,Z,Y)=>{if($.is0(Z))return X;return Q[Y]=$.mul(X,Q[Y]),$.mul(X,Z)},U),Q}function iq($,q){let J=($.ORDER-U8)/n8,Q=$.pow(q,J),G=$.eql(Q,$.ONE),U=$.eql(Q,$.ZERO),X=$.eql(Q,$.neg($.ONE));if(!G&&!U&&!X)throw new Error("invalid Legendre symbol result");return G?1:U?0:-1}function z1($,q){if(q!==void 0)z8(q);let J=q!==void 0?q:$.toString(2).length,Q=Math.ceil(J/8);return{nBitLength:J,nByteLength:Q}}class QJ{ORDER;BITS;BYTES;isLE;ZERO=Z8;ONE=U8;_lengths;_sqrt;_mod;constructor($,q={}){if($<=Z8)throw new Error("invalid field: expected ORDER > 0, got "+$);let J=void 0;if(this.isLE=!1,q!=null&&typeof q==="object"){if(typeof q.BITS==="number")J=q.BITS;if(typeof q.sqrt==="function")this.sqrt=q.sqrt;if(typeof q.isLE==="boolean")this.isLE=q.isLE;if(q.allowedLengths)this._lengths=q.allowedLengths?.slice();if(typeof q.modFromBytes==="boolean")this._mod=q.modFromBytes}let{nBitLength:Q,nByteLength:G}=z1($,J);if(G>2048)throw new Error("invalid field: expected ORDER of <= 2048 bytes");this.ORDER=$,this.BITS=Q,this.BYTES=G,this._sqrt=void 0,Object.preventExtensions(this)}create($){return i($,this.ORDER)}isValid($){if(typeof $!=="bigint")throw new Error("invalid field element: expected bigint, got "+typeof $);return Z8<=$&&$<this.ORDER}is0($){return $===Z8}isValidNot0($){return!this.is0($)&&this.isValid($)}isOdd($){return($&U8)===U8}neg($){return i(-$,this.ORDER)}eql($,q){return $===q}sqr($){return i($*$,this.ORDER)}add($,q){return i($+q,this.ORDER)}sub($,q){return i($-q,this.ORDER)}mul($,q){return i($*q,this.ORDER)}pow($,q){return K1(this,$,q)}div($,q){return i($*nq(q,this.ORDER),this.ORDER)}sqrN($){return $*$}addN($,q){return $+q}subN($,q){return $-q}mulN($,q){return $*q}inv($){return nq($,this.ORDER)}sqrt($){if(!this._sqrt)this._sqrt=N1(this.ORDER);return this._sqrt(this,$)}toBytes($){return this.isLE?g0($,this.BYTES):I$($,this.BYTES)}fromBytes($,q=!1){p($);let{_lengths:J,BYTES:Q,isLE:G,ORDER:U,_mod:X}=this;if(J){if(!J.includes($.length)||$.length>Q)throw new Error("Field.fromBytes: expected "+J+" bytes, got "+$.length);let Y=new Uint8Array(Q);Y.set($,G?0:Y.length-$.length),$=Y}if($.length!==Q)throw new Error("Field.fromBytes: expected "+Q+" bytes, got "+$.length);let Z=G?f8($):dq($);if(X)Z=i(Z,U);if(!q){if(!this.isValid(Z))throw new Error("invalid field element: outside of range 0..ORDER")}return Z}invertBatch($){return m0(this,$)}cmov($,q,J){return J?q:$}}function b0($,q={}){return new QJ($,q)}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var h0=BigInt(0),j$=BigInt(1);function GJ($,q){let J=q.negate();return $?J:q}function p0($,q){let J=m0($.Fp,q.map((Q)=>Q.Z));return q.map((Q,G)=>$.fromAffine(Q.toAffine(J[G])))}function ZJ($,q){if(!Number.isSafeInteger($)||$<=0||$>q)throw new Error("invalid window size, expected [1.."+q+"], got W="+$)}function B$($,q){ZJ($,q);let J=Math.ceil(q/$)+1,Q=2**($-1),G=2**$,U=lq($),X=BigInt($);return{windows:J,windowSize:Q,mask:U,maxNumber:G,shiftBy:X}}function UJ($,q,J){let{windowSize:Q,mask:G,maxNumber:U,shiftBy:X}=J,Z=Number($&G),Y=$>>X;if(Z>Q)Z-=U,Y+=j$;let N=q*Q,W=N+Math.abs(Z)-1,K=Z===0,E=Z<0,R=q%2!==0;return{nextN:Y,offset:W,isZero:K,isNeg:E,isNegF:R,offsetF:N}}var w$=new WeakMap,WJ=new WeakMap;function V$($){return WJ.get($)||1}function XJ($){if($!==h0)throw new Error("invalid wNAF")}class P${BASE;ZERO;Fn;bits;constructor($,q){this.BASE=$.BASE,this.ZERO=$.ZERO,this.Fn=$.Fn,this.bits=q}_unsafeLadder($,q,J=this.ZERO){let Q=$;while(q>h0){if(q&j$)J=J.add(Q);Q=Q.double(),q>>=j$}return J}precomputeWindow($,q){let{windows:J,windowSize:Q}=B$(q,this.bits),G=[],U=$,X=U;for(let Z=0;Z<J;Z++){X=U,G.push(X);for(let Y=1;Y<Q;Y++)X=X.add(U),G.push(X);U=X.double()}return G}wNAF($,q,J){if(!this.Fn.isValid(J))throw new Error("invalid scalar");let Q=this.ZERO,G=this.BASE,U=B$($,this.bits);for(let X=0;X<U.windows;X++){let{nextN:Z,offset:Y,isZero:N,isNeg:W,isNegF:K,offsetF:E}=UJ(J,X,U);if(J=Z,N)G=G.add(GJ(K,q[E]));else Q=Q.add(GJ(W,q[Y]))}return XJ(J),{p:Q,f:G}}wNAFUnsafe($,q,J,Q=this.ZERO){let G=B$($,this.bits);for(let U=0;U<G.windows;U++){if(J===h0)break;let{nextN:X,offset:Z,isZero:Y,isNeg:N}=UJ(J,U,G);if(J=X,Y)continue;else{let W=q[Z];Q=Q.add(N?W.negate():W)}}return XJ(J),Q}getPrecomputes($,q,J){let Q=w$.get(q);if(!Q){if(Q=this.precomputeWindow(q,$),$!==1){if(typeof J==="function")Q=J(Q);w$.set(q,Q)}}return Q}cached($,q,J){let Q=V$($);return this.wNAF(Q,this.getPrecomputes(Q,$,J),q)}unsafe($,q,J,Q){let G=V$($);if(G===1)return this._unsafeLadder($,q,Q);return this.wNAFUnsafe(G,this.getPrecomputes(G,$,J),q,Q)}createCache($,q){ZJ(q,this.bits),WJ.set($,q),w$.delete($)}hasCache($){return V$($)!==1}}function YJ($,q,J){if(q){if(q.ORDER!==$)throw new Error("Field.ORDER must match order: Fp == p, Fn == n");return JJ(q),q}else return b0($,{isLE:J})}function MJ($,q,J={},Q){if(Q===void 0)Q=$==="edwards";if(!q||typeof q!=="object")throw new Error(`expected valid ${$} CURVE object`);for(let Y of["p","n","h"]){let N=q[Y];if(!(typeof N==="bigint"&&N>h0))throw new Error(`CURVE.${Y} must be positive bigint`)}let G=YJ(q.p,J.Fp,Q),U=YJ(q.n,J.Fn,Q),Z=["Gx","Gy","a",$==="weierstrass"?"b":"d"];for(let Y of Z)if(!G.isValid(q[Y]))throw new Error(`CURVE.${Y} must be valid field element of CURVE.Fp`);return q=Object.freeze(Object.assign({},q)),{CURVE:q,Fp:G,Fn:U}}function u0($,q){return function J(Q){let G=$(Q);return{secretKey:G,publicKey:q(G)}}}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var g8=BigInt(0),e=BigInt(1),F$=BigInt(2),D1=BigInt(8);function E1($,q,J,Q){let G=$.sqr(J),U=$.sqr(Q),X=$.add($.mul(q.a,G),U),Z=$.add($.ONE,$.mul(q.d,$.mul(G,U)));return $.eql(X,Z)}function NJ($,q={}){let J=MJ("edwards",$,q,q.FpFnLE),{Fp:Q,Fn:G}=J,U=J.CURVE,{h:X}=U;l8(q,{},{uvRatio:"function"});let Z=F$<<BigInt(G.BYTES*8)-e,Y=(L)=>Q.create(L),N=q.uvRatio||((L,j)=>{try{return{isValid:!0,value:Q.sqrt(Q.div(L,j))}}catch(C){return{isValid:!1,value:g8}}});if(!E1(Q,U,U.Gx,U.Gy))throw new Error("bad curve params: generator point");function W(L,j,C=!1){let D=C?e:g8;return q0("coordinate "+L,j,D,Z),j}function K(L){if(!(L instanceof A))throw new Error("EdwardsPoint expected")}let E=T$((L,j)=>{let{X:C,Y:D,Z:F}=L,f=L.is0();if(j==null)j=f?D1:Q.inv(F);let k=Y(C*j),y=Y(D*j),w=Q.mul(F,j);if(f)return{x:g8,y:e};if(w!==e)throw new Error("invZ was invalid");return{x:k,y}}),R=T$((L)=>{let{a:j,d:C}=U;if(L.is0())throw new Error("bad point: ZERO");let{X:D,Y:F,Z:f,T:k}=L,y=Y(D*D),w=Y(F*F),P=Y(f*f),x=Y(P*P),g=Y(y*j),u=Y(P*Y(g+w)),O=Y(x+Y(C*Y(y*w)));if(u!==O)throw new Error("bad point: equation left != right (1)");let T=Y(D*F),H=Y(f*k);if(T!==H)throw new Error("bad point: equation left != right (2)");return!0});class A{static BASE=new A(U.Gx,U.Gy,e,Y(U.Gx*U.Gy));static ZERO=new A(g8,e,e,g8);static Fp=Q;static Fn=G;X;Y;Z;T;constructor(L,j,C,D){this.X=W("x",L),this.Y=W("y",j),this.Z=W("z",C,!0),this.T=W("t",D),Object.freeze(this)}static CURVE(){return U}static fromAffine(L){if(L instanceof A)throw new Error("extended point not allowed");let{x:j,y:C}=L||{};return W("x",j),W("y",C),new A(j,C,e,Y(j*C))}static fromBytes(L,j=!1){let C=Q.BYTES,{a:D,d:F}=U;L=d8(p(L,C,"point")),y0(j,"zip215");let f=d8(L),k=L[C-1];f[C-1]=k&-129;let y=f8(f),w=j?Z:Q.ORDER;q0("point.y",y,g8,w);let P=Y(y*y),x=Y(P-e),g=Y(F*P-D),{isValid:u,value:O}=N(x,g);if(!u)throw new Error("bad point: invalid y coordinate");let T=(O&e)===e,H=(k&128)!==0;if(!j&&O===g8&&H)throw new Error("bad point: x=0 and x_0=1");if(H!==T)O=Y(-O);return A.fromAffine({x:O,y})}static fromHex(L,j=!1){return A.fromBytes(N0(L),j)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}precompute(L=8,j=!0){if(_.createCache(this,L),!j)this.multiply(F$);return this}assertValidity(){R(this)}equals(L){K(L);let{X:j,Y:C,Z:D}=this,{X:F,Y:f,Z:k}=L,y=Y(j*k),w=Y(F*D),P=Y(C*k),x=Y(f*D);return y===w&&P===x}is0(){return this.equals(A.ZERO)}negate(){return new A(Y(-this.X),this.Y,this.Z,Y(-this.T))}double(){let{a:L}=U,{X:j,Y:C,Z:D}=this,F=Y(j*j),f=Y(C*C),k=Y(F$*Y(D*D)),y=Y(L*F),w=j+C,P=Y(Y(w*w)-F-f),x=y+f,g=x-k,u=y-f,O=Y(P*g),T=Y(x*u),H=Y(P*u),B=Y(g*x);return new A(O,T,B,H)}add(L){K(L);let{a:j,d:C}=U,{X:D,Y:F,Z:f,T:k}=this,{X:y,Y:w,Z:P,T:x}=L,g=Y(D*y),u=Y(F*w),O=Y(k*C*x),T=Y(f*P),H=Y((D+F)*(y+w)-g-u),B=T-O,V=T+O,S=Y(u-j*g),m=Y(H*B),b=Y(V*S),h=Y(H*S),c=Y(B*V);return new A(m,b,c,h)}subtract(L){return this.add(L.negate())}multiply(L){if(!G.isValidNot0(L))throw new Error("invalid scalar: expected 1 <= sc < curve.n");let{p:j,f:C}=_.cached(this,L,(D)=>p0(A,D));return p0(A,[j,C])[0]}multiplyUnsafe(L,j=A.ZERO){if(!G.isValid(L))throw new Error("invalid scalar: expected 0 <= sc < curve.n");if(L===g8)return A.ZERO;if(this.is0()||L===e)return this;return _.unsafe(this,L,(C)=>p0(A,C),j)}isSmallOrder(){return this.multiplyUnsafe(X).is0()}isTorsionFree(){return _.unsafe(this,U.n).is0()}toAffine(L){return E(this,L)}clearCofactor(){if(X===e)return this;return this.multiplyUnsafe(X)}toBytes(){let{x:L,y:j}=this.toAffine(),C=Q.toBytes(j);return C[C.length-1]|=L&e?128:0,C}toHex(){return t8(this.toBytes())}toString(){return`<Point ${this.is0()?"ZERO":this.toHex()}>`}}let _=new P$(A,G.BITS);return A.BASE.precompute(8),A}function OJ($,q,J={}){if(typeof q!=="function")throw new Error(\'"hash" function param is required\');l8(J,{},{adjustScalarBytes:"function",randomBytes:"function",domain:"function",prehash:"function",mapToCurve:"function"});let{prehash:Q}=J,{BASE:G,Fp:U,Fn:X}=$,Z=J.randomBytes||p8,Y=J.adjustScalarBytes||((w)=>w),N=J.domain||((w,P,x)=>{if(y0(x,"phflag"),P.length||x)throw new Error("Contexts/pre-hash are not supported");return w});function W(w){return X.create(f8(w))}function K(w){let P=D.secretKey;p(w,D.secretKey,"secretKey");let x=p(q(w),2*P,"hashedSecretKey"),g=Y(x.slice(0,P)),u=x.slice(P,2*P),O=W(g);return{head:g,prefix:u,scalar:O}}function E(w){let{head:P,prefix:x,scalar:g}=K(w),u=G.multiply(g),O=u.toBytes();return{head:P,prefix:x,scalar:g,point:u,pointBytes:O}}function R(w){return E(w).pointBytes}function A(w=Uint8Array.of(),...P){let x=e8(...P);return W(q(N(x,p(w,void 0,"context"),!!Q)))}function _(w,P,x={}){if(w=p(w,void 0,"message"),Q)w=Q(w);let{prefix:g,scalar:u,pointBytes:O}=E(P),T=A(x.context,g,w),H=G.multiply(T).toBytes(),B=A(x.context,H,O,w),V=X.create(T+B*u);if(!X.isValid(V))throw new Error("sign failed: invalid s");let S=e8(H,X.toBytes(V));return p(S,D.signature,"result")}let L={zip215:!0};function j(w,P,x,g=L){let{context:u,zip215:O}=g,T=D.signature;if(w=p(w,T,"signature"),P=p(P,void 0,"message"),x=p(x,D.publicKey,"publicKey"),O!==void 0)y0(O,"zip215");if(Q)P=Q(P);let H=T/2,B=w.subarray(0,H),V=f8(w.subarray(H,T)),S,m,b;try{S=$.fromBytes(x,O),m=$.fromBytes(B,O),b=G.multiplyUnsafe(V)}catch(Z0){return!1}if(!O&&S.isSmallOrder())return!1;let h=A(u,m.toBytes(),S.toBytes(),P);return m.add(S.multiplyUnsafe(h)).subtract(b).clearCofactor().is0()}let C=U.BYTES,D={secretKey:C,publicKey:C,signature:2*C,seed:C};function F(w=Z(D.seed)){return p(w,D.seed,"seed")}function f(w){return W0(w)&&w.length===X.BYTES}function k(w,P){try{return!!$.fromBytes(w,P)}catch(x){return!1}}let y={getExtendedPublicKey:E,randomSecretKey:F,isValidSecretKey:f,isValidPublicKey:k,toMontgomery(w){let{y:P}=$.fromBytes(w),x=D.publicKey,g=x===32;if(!g&&x!==57)throw new Error("only defined for 25519 and 448");let u=g?U.div(e+P,e-P):U.div(P-e,P+e);return U.toBytes(u)},toMontgomerySecret(w){let P=D.secretKey;p(w,P);let x=q(w.subarray(0,P));return Y(x).subarray(0,P)}};return Object.freeze({keygen:u0(F,R),getPublicKey:R,sign:_,verify:j,utils:y,Point:$,lengths:D})}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var D0=BigInt(0),J0=BigInt(1),c0=BigInt(2);function C1($){return l8($,{adjustScalarBytes:"function",powPminus2:"function"}),Object.freeze({...$})}function KJ($){let q=C1($),{P:J,type:Q,adjustScalarBytes:G,powPminus2:U,randomBytes:X}=q,Z=Q==="x25519";if(!Z&&Q!=="x448")throw new Error("invalid type");let Y=X||p8,N=Z?255:448,W=Z?32:56,K=Z?BigInt(9):BigInt(5),E=Z?BigInt(121665):BigInt(39081),R=Z?c0**BigInt(254):c0**BigInt(447),A=Z?BigInt(8)*c0**BigInt(251)-J0:BigInt(4)*c0**BigInt(445)-J0,_=R+A+J0,L=(T)=>i(T,J),j=C(K);function C(T){return g0(L(T),W)}function D(T){let H=d8(p(T,W,"uCoordinate"));if(Z)H[31]&=127;return L(f8(H))}function F(T){return f8(G(d8(p(T,W,"scalar"))))}function f(T,H){let B=x(D(H),F(T));if(B===D0)throw new Error("invalid private or public key received");return C(B)}function k(T){return f(T,j)}let y=k,w=f;function P(T,H,B){let V=L(T*(H-B));return H=L(H-V),B=L(B+V),{x_2:H,x_3:B}}function x(T,H){q0("u",T,D0,J),q0("scalar",H,R,_);let B=H,V=T,S=J0,m=D0,b=T,h=J0,c=D0;for(let O$=BigInt(N-1);O$>=D0;O$--){let Kq=B>>O$&J0;c^=Kq,{x_2:S,x_3:b}=P(c,S,b),{x_2:m,x_3:h}=P(c,m,h),c=Kq;let K$=S+m,z$=L(K$*K$),D$=S-m,zq=L(D$*D$),Dq=z$-zq,bQ=b+h,hQ=b-h,Eq=L(hQ*K$),Cq=L(bQ*D$),Rq=Eq+Cq,Hq=Eq-Cq;b=L(Rq*Rq),h=L(V*L(Hq*Hq)),S=L(z$*zq),m=L(Dq*(z$+L(E*Dq)))}({x_2:S,x_3:b}=P(c,S,b)),{x_2:m,x_3:h}=P(c,m,h);let Z0=U(m);return L(S*Z0)}let g={secretKey:W,publicKey:W,seed:W},u=(T=Y(W))=>{return p(T,g.seed,"seed"),T},O={randomSecretKey:u};return Object.freeze({keygen:u0(u,y),getSharedSecret:w,getPublicKey:y,scalarMult:f,scalarMultBase:k,utils:O,GuBytes:j.slice(),lengths:g})}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var R1=BigInt(1),zJ=BigInt(2),H1=BigInt(3),L1=BigInt(5),I1=BigInt(8),d0=BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"),T1=(()=>({p:d0,n:BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),h:I1,a:BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),d:BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),Gx:BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),Gy:BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")}))();function EJ($){let q=BigInt(10),J=BigInt(20),Q=BigInt(40),G=BigInt(80),U=d0,Z=$*$%U*$%U,Y=E8(Z,zJ,U)*Z%U,N=E8(Y,R1,U)*$%U,W=E8(N,L1,U)*N%U,K=E8(W,q,U)*W%U,E=E8(K,J,U)*K%U,R=E8(E,Q,U)*E%U,A=E8(R,G,U)*R%U,_=E8(A,G,U)*R%U,L=E8(_,q,U)*W%U;return{pow_p_5_8:E8(L,zJ,U)*$%U,b2:Z}}function CJ($){return $[0]&=248,$[31]&=127,$[31]|=64,$}var DJ=BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");function A1($,q){let J=d0,Q=i(q*q*q,J),G=i(Q*Q*q,J),U=EJ($*G).pow_p_5_8,X=i($*Q*U,J),Z=i(q*X*X,J),Y=X,N=i(X*DJ,J),W=Z===$,K=Z===i(-$,J),E=Z===i(-$*DJ,J);if(W)X=Y;if(K||E)X=N;if(qJ(X,J))X=i(-X,J);return{isValid:W||K,value:X}}var B1=NJ(T1,{uvRatio:A1});function w1($){return OJ(B1,hq,Object.assign({adjustScalarBytes:CJ},$))}var m8=w1({});var Q0=(()=>{let $=d0;return KJ({P:$,type:"x25519",powPminus2:(q)=>{let{pow_p_5_8:J,b2:Q}=EJ(q);return i(E8(J,H1,$)*Q,$)},adjustScalarBytes:CJ})})();var hJ=Iq(f$(),1);var x$;try{x$=new TextDecoder}catch($){}var v,o8,I=0;var AJ=[],V1=105,j1=57342,P1=57343,HJ=57337;var LJ=6,G0={},E0=112810000,x8=16810000;var S$=AJ,_$=0,d={},o,i0,o0=0,R0=0,a,C8,r=[],k$=[],K8,W8,C0,IJ={useRecords:!1,mapsAsObjects:!0},H0=!1,BJ=2;try{new Function("")}catch($){BJ=1/0}class b8{constructor($){if($){if(($.keyMap||$._keyMap)&&!$.useRecords)$.useRecords=!1,$.mapsAsObjects=!0;if($.useRecords===!1&&$.mapsAsObjects===void 0)$.mapsAsObjects=!0;if($.getStructures)$.getShared=$.getStructures;if($.getShared&&!$.structures)($.structures=[]).uninitialized=!0;if($.keyMap){this.mapKey=new Map;for(let[q,J]of Object.entries($.keyMap))this.mapKey.set(J,q)}}Object.assign(this,$)}decodeKey($){return this.keyMap?this.mapKey.get($)||$:$}encodeKey($){return this.keyMap&&this.keyMap.hasOwnProperty($)?this.keyMap[$]:$}encodeKeys($){if(!this._keyMap)return $;let q=new Map;for(let[J,Q]of Object.entries($))q.set(this._keyMap.hasOwnProperty(J)?this._keyMap[J]:J,Q);return q}decodeKeys($){if(!this._keyMap||$.constructor.name!="Map")return $;if(!this._mapKey){this._mapKey=new Map;for(let[J,Q]of Object.entries(this._keyMap))this._mapKey.set(Q,J)}let q={};return $.forEach((J,Q)=>q[R8(this._mapKey.has(Q)?this._mapKey.get(Q):Q)]=J),q}mapDecode($,q){let J=this.decode($);if(this._keyMap)switch(J.constructor.name){case"Array":return J.map((Q)=>this.decodeKeys(Q))}return J}decode($,q){if(v)return PJ(()=>{return r0(),this?this.decode($,q):b8.prototype.decode.call(IJ,$,q)});o8=q>-1?q:$.length,I=0,_$=0,R0=0,i0=null,S$=AJ,a=null,v=$;try{W8=$.dataView||($.dataView=new DataView($.buffer,$.byteOffset,$.byteLength))}catch(J){if(v=null,$ instanceof Uint8Array)throw J;throw new Error("Source must be a Uint8Array or Buffer but was a "+($&&typeof $=="object"?$.constructor.name:typeof $))}if(this instanceof b8){if(d=this,K8=this.sharedValues&&(this.pack?new Array(this.maxPrivatePackedValues||16).concat(this.sharedValues):this.sharedValues),this.structures)return o=this.structures,l0();else if(!o||o.length>0)o=[]}else{if(d=IJ,!o||o.length>0)o=[];K8=null}return l0()}decodeMultiple($,q){let J,Q=0;try{let G=$.length;H0=!0;let U=this?this.decode($,G):h$.decode($,G);if(q){if(q(U)===!1)return;while(I<G)if(Q=I,q(l0())===!1)return}else{J=[U];while(I<G)Q=I,J.push(l0());return J}}catch(G){throw G.lastPosition=Q,G.values=J,G}finally{H0=!1,r0()}}}function l0(){try{let $=l();if(a){if(I>=a.postBundlePosition){let q=new Error("Unexpected bundle position");throw q.incomplete=!0,q}I=a.postBundlePosition,a=null}if(I==o8){if(o=null,v=null,C8)C8=null}else if(I>o8){let q=new Error("Unexpected end of CBOR data");throw q.incomplete=!0,q}else if(!H0)throw new Error("Data read, but end of buffer not reached");return $}catch($){if(r0(),$ instanceof RangeError||$.message.startsWith("Unexpected end of buffer"))$.incomplete=!0;throw $}}function l(){let $=v[I++],q=$>>5;if($=$&31,$>23)switch($){case 24:$=v[I++];break;case 25:if(q==7)return S1();$=W8.getUint16(I),I+=2;break;case 26:if(q==7){let J=W8.getFloat32(I);if(d.useFloat32>2){let Q=a0[(v[I]&127)<<1|v[I+1]>>7];return I+=4,(Q*J+(J>0?0.5:-0.5)>>0)/Q}return I+=4,J}$=W8.getUint32(I),I+=4;break;case 27:if(q==7){let J=W8.getFloat64(I);return I+=8,J}if(q>1){if(W8.getUint32(I)>0)throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");$=W8.getUint32(I+4)}else if(d.int64AsNumber)$=W8.getUint32(I)*4294967296,$+=W8.getUint32(I+4);else $=W8.getBigUint64(I);I+=8;break;case 31:switch(q){case 2:case 3:throw new Error("Indefinite length not supported for byte or text strings");case 4:let J=[],Q,G=0;while((Q=l())!=G0){if(G>=E0)throw new Error(`Array length exceeds ${E0}`);J[G++]=Q}return q==4?J:q==3?J.join(""):Buffer.concat(J);case 5:let U;if(d.mapsAsObjects){let X={},Z=0;if(d.keyMap)while((U=l())!=G0){if(Z++>=x8)throw new Error(`Property count exceeds ${x8}`);X[R8(d.decodeKey(U))]=l()}else while((U=l())!=G0){if(Z++>=x8)throw new Error(`Property count exceeds ${x8}`);X[R8(U)]=l()}return X}else{if(C0)d.mapsAsObjects=!0,C0=!1;let X=new Map;if(d.keyMap){let Z=0;while((U=l())!=G0){if(Z++>=x8)throw new Error(`Map size exceeds ${x8}`);X.set(d.decodeKey(U),l())}}else{let Z=0;while((U=l())!=G0){if(Z++>=x8)throw new Error(`Map size exceeds ${x8}`);X.set(U,l())}}return X}case 7:return G0;default:throw new Error("Invalid major type for indefinite length "+q)}default:throw new Error("Unknown token "+$)}switch(q){case 0:return $;case 1:return~$;case 2:return x1($);case 3:if(R0>=I)return i0.slice(I-o0,(I+=$)-o0);if(R0==0&&o8<140&&$<32){let G=$<16?wJ($):f1($);if(G!=null)return G}return F1($);case 4:if($>=E0)throw new Error(`Array length exceeds ${E0}`);let J=new Array($);for(let G=0;G<$;G++)J[G]=l();return J;case 5:if($>=x8)throw new Error(`Map size exceeds ${E0}`);if(d.mapsAsObjects){let G={};if(d.keyMap)for(let U=0;U<$;U++)G[R8(d.decodeKey(l()))]=l();else for(let U=0;U<$;U++)G[R8(l())]=l();return G}else{if(C0)d.mapsAsObjects=!0,C0=!1;let G=new Map;if(d.keyMap)for(let U=0;U<$;U++)G.set(d.decodeKey(l()),l());else for(let U=0;U<$;U++)G.set(l(),l());return G}case 6:if($>=HJ){let G=o[$&8191];if(G){if(!G.read)G.read=v$(G);return G.read()}if($<65536){if($==P1){let U=X0(),X=l(),Z=l();g$(X,Z);let Y={};if(d.keyMap)for(let N=2;N<U;N++){let W=d.decodeKey(Z[N-2]);Y[R8(W)]=l()}else for(let N=2;N<U;N++){let W=Z[N-2];Y[R8(W)]=l()}return Y}else if($==j1){let U=X0(),X=l();for(let Z=2;Z<U;Z++)g$(X++,l());return l()}else if($==HJ)return m1();if(d.getShared){if(b$(),G=o[$&8191],G){if(!G.read)G.read=v$(G);return G.read()}}}}let Q=r[$];if(Q)if(Q.handlesRead)return Q(l);else return Q(l());else{let G=l();for(let U=0;U<k$.length;U++){let X=k$[U]($,G);if(X!==void 0)return X}return new T8(G,$)}case 7:switch($){case 20:return!1;case 21:return!0;case 22:return null;case 23:return;case 31:default:let G=(K8||i8())[$];if(G!==void 0)return G;throw new Error("Unknown token "+$)}default:if(isNaN($)){let G=new Error("Unexpected end of CBOR data");throw G.incomplete=!0,G}throw new Error("Unknown CBOR token "+$)}}var TJ=/^[a-zA-Z_$][a-zA-Z\\d_$]*$/;function v$($){if(!$)throw new Error("Structure is required in record definition");function q(){let J=v[I++];if(J=J&31,J>23)switch(J){case 24:J=v[I++];break;case 25:J=W8.getUint16(I),I+=2;break;case 26:J=W8.getUint32(I),I+=4;break;default:throw new Error("Expected array header, but got "+v[I-1])}let Q=this.compiledReader;while(Q){if(Q.propertyCount===J)return Q(l);Q=Q.next}if(this.slowReads++>=BJ){let U=this.length==J?this:this.slice(0,J);if(Q=d.keyMap?new Function("r","return {"+U.map((X)=>d.decodeKey(X)).map((X)=>TJ.test(X)?R8(X)+":r()":"["+JSON.stringify(X)+"]:r()").join(",")+"}"):new Function("r","return {"+U.map((X)=>TJ.test(X)?R8(X)+":r()":"["+JSON.stringify(X)+"]:r()").join(",")+"}"),this.compiledReader)Q.next=this.compiledReader;return Q.propertyCount=J,this.compiledReader=Q,Q(l)}let G={};if(d.keyMap)for(let U=0;U<J;U++)G[R8(d.decodeKey(this[U]))]=l();else for(let U=0;U<J;U++)G[R8(this[U])]=l();return G}return $.slowReads=0,q}function R8($){if(typeof $==="string")return $==="__proto__"?"__proto_":$;if(typeof $==="number"||typeof $==="boolean"||typeof $==="bigint")return $.toString();if($==null)return $+"";throw new Error("Invalid property name type "+typeof $)}var F1=y$;function y$($){let q;if($<16){if(q=wJ($))return q}if($>64&&x$)return x$.decode(v.subarray(I,I+=$));let J=I+$,Q=[];q="";while(I<J){let G=v[I++];if((G&128)===0)Q.push(G);else if((G&224)===192){let U=v[I++]&63;Q.push((G&31)<<6|U)}else if((G&240)===224){let U=v[I++]&63,X=v[I++]&63;Q.push((G&31)<<12|U<<6|X)}else if((G&248)===240){let U=v[I++]&63,X=v[I++]&63,Z=v[I++]&63,Y=(G&7)<<18|U<<12|X<<6|Z;if(Y>65535)Y-=65536,Q.push(Y>>>10&1023|55296),Y=56320|Y&1023;Q.push(Y)}else Q.push(G);if(Q.length>=4096)q+=$8.apply(String,Q),Q.length=0}if(Q.length>0)q+=$8.apply(String,Q);return q}var $8=String.fromCharCode;function f1($){let q=I,J=new Array($);for(let Q=0;Q<$;Q++){let G=v[I++];if((G&128)>0){I=q;return}J[Q]=G}return $8.apply(String,J)}function wJ($){if($<4)if($<2)if($===0)return"";else{let q=v[I++];if((q&128)>1){I-=1;return}return $8(q)}else{let q=v[I++],J=v[I++];if((q&128)>0||(J&128)>0){I-=2;return}if($<3)return $8(q,J);let Q=v[I++];if((Q&128)>0){I-=3;return}return $8(q,J,Q)}else{let q=v[I++],J=v[I++],Q=v[I++],G=v[I++];if((q&128)>0||(J&128)>0||(Q&128)>0||(G&128)>0){I-=4;return}if($<6)if($===4)return $8(q,J,Q,G);else{let U=v[I++];if((U&128)>0){I-=5;return}return $8(q,J,Q,G,U)}else if($<8){let U=v[I++],X=v[I++];if((U&128)>0||(X&128)>0){I-=6;return}if($<7)return $8(q,J,Q,G,U,X);let Z=v[I++];if((Z&128)>0){I-=7;return}return $8(q,J,Q,G,U,X,Z)}else{let U=v[I++],X=v[I++],Z=v[I++],Y=v[I++];if((U&128)>0||(X&128)>0||(Z&128)>0||(Y&128)>0){I-=8;return}if($<10)if($===8)return $8(q,J,Q,G,U,X,Z,Y);else{let N=v[I++];if((N&128)>0){I-=9;return}return $8(q,J,Q,G,U,X,Z,Y,N)}else if($<12){let N=v[I++],W=v[I++];if((N&128)>0||(W&128)>0){I-=10;return}if($<11)return $8(q,J,Q,G,U,X,Z,Y,N,W);let K=v[I++];if((K&128)>0){I-=11;return}return $8(q,J,Q,G,U,X,Z,Y,N,W,K)}else{let N=v[I++],W=v[I++],K=v[I++],E=v[I++];if((N&128)>0||(W&128)>0||(K&128)>0||(E&128)>0){I-=12;return}if($<14)if($===12)return $8(q,J,Q,G,U,X,Z,Y,N,W,K,E);else{let R=v[I++];if((R&128)>0){I-=13;return}return $8(q,J,Q,G,U,X,Z,Y,N,W,K,E,R)}else{let R=v[I++],A=v[I++];if((R&128)>0||(A&128)>0){I-=14;return}if($<15)return $8(q,J,Q,G,U,X,Z,Y,N,W,K,E,R,A);let _=v[I++];if((_&128)>0){I-=15;return}return $8(q,J,Q,G,U,X,Z,Y,N,W,K,E,R,A,_)}}}}}function x1($){return d.copyBuffers?Uint8Array.prototype.slice.call(v,I,I+=$):v.subarray(I,I+=$)}var VJ=new Float32Array(1),n0=new Uint8Array(VJ.buffer,0,4);function S1(){let $=v[I++],q=v[I++],J=($&127)>>2;if(J===31){if(q||$&3)return NaN;return $&128?-1/0:1/0}if(J===0){let Q=(($&3)<<8|q)/16777216;return $&128?-Q:Q}return n0[3]=$&128|(J>>1)+56,n0[2]=($&7)<<5|q>>3,n0[1]=q<<5,n0[0]=0,VJ[0]}var zG=new Array(4096);class T8{constructor($,q){this.value=$,this.tag=q}}r[0]=($)=>{return new Date($)};r[1]=($)=>{return new Date(Math.round($*1000))};r[2]=($)=>{let q=BigInt(0);for(let J=0,Q=$.byteLength;J<Q;J++)q=BigInt($[J])+(q<<BigInt(8));return q};r[3]=($)=>{return BigInt(-1)-r[2]($)};r[4]=($)=>{return+($[1]+"e"+$[0])};r[5]=($)=>{return $[1]*Math.exp($[0]*Math.log(2))};var g$=($,q)=>{$=$-57344;let J=o[$];if(J&&J.isShared)(o.restoreStructures||(o.restoreStructures=[]))[$]=J;o[$]=q,q.read=v$(q)};r[V1]=($)=>{let q=$.length,J=$[1];g$($[0],J);let Q={};for(let G=2;G<q;G++){let U=J[G-2];Q[R8(U)]=$[G]}return Q};r[14]=($)=>{if(a)return a[0].slice(a.position0,a.position0+=$);return new T8($,14)};r[15]=($)=>{if(a)return a[1].slice(a.position1,a.position1+=$);return new T8($,15)};var _1={Error,RegExp};r[27]=($)=>{return(_1[$[0]]||Error)($[1],$[2])};var jJ=($)=>{if(v[I++]!=132){let J=new Error("Packed values structure must be followed by a 4 element array");if(v.length<I)J.incomplete=!0;throw J}let q=$();if(!q||!q.length){let J=new Error("Packed values structure must be followed by a 4 element array");throw J.incomplete=!0,J}return K8=K8?q.concat(K8.slice(q.length)):q,K8.prefixes=$(),K8.suffixes=$(),$()};jJ.handlesRead=!0;r[51]=jJ;r[LJ]=($)=>{if(!K8)if(d.getShared)b$();else return new T8($,LJ);if(typeof $=="number")return K8[16+($>=0?2*$:-2*$-1)];let q=new Error("No support for non-integer packed references yet");if($===void 0)q.incomplete=!0;throw q};r[28]=($)=>{if(!C8)C8=new Map,C8.id=0;let q=C8.id++,J=I,Q=v[I],G;if(Q>>5==4)G=[];else G={};let U={target:G};C8.set(q,U);let X=$();if(U.used){if(Object.getPrototypeOf(G)!==Object.getPrototypeOf(X))I=J,G=X,C8.set(q,{target:G}),X=$();return Object.assign(G,X)}return U.target=X,X};r[28].handlesRead=!0;r[29]=($)=>{let q=C8.get($);return q.used=!0,q.target};r[258]=($)=>new Set($);(r[259]=($)=>{if(d.mapsAsObjects)d.mapsAsObjects=!1,C0=!0;return $()}).handlesRead=!0;function U0($,q){if(typeof $==="string")return $+q;if($ instanceof Array)return $.concat(q);return Object.assign({},$,q)}function i8(){if(!K8)if(d.getShared)b$();else throw new Error("No packed values available");return K8}var k1=1399353956;k$.push(($,q)=>{if($>=225&&$<=255)return U0(i8().prefixes[$-224],q);if($>=28704&&$<=32767)return U0(i8().prefixes[$-28672],q);if($>=1879052288&&$<=2147483647)return U0(i8().prefixes[$-1879048192],q);if($>=216&&$<=223)return U0(q,i8().suffixes[$-216]);if($>=27647&&$<=28671)return U0(q,i8().suffixes[$-27639]);if($>=1811940352&&$<=1879048191)return U0(q,i8().suffixes[$-1811939328]);if($==k1)return{packedValues:K8,structures:o.slice(0),version:q};if($==55799)return q});var v1=new Uint8Array(new Uint16Array([1]).buffer)[0]==1,m$=[Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,typeof BigUint64Array=="undefined"?{name:"BigUint64Array"}:BigUint64Array,Int8Array,Int16Array,Int32Array,typeof BigInt64Array=="undefined"?{name:"BigInt64Array"}:BigInt64Array,Float32Array,Float64Array],y1=[64,68,69,70,71,72,77,78,79,85,86];for(let $=0;$<m$.length;$++)g1(m$[$],y1[$]);function g1($,q){let J="get"+$.name.slice(0,-5),Q;if(typeof $==="function")Q=$.BYTES_PER_ELEMENT;else $=null;for(let G=0;G<2;G++){if(!G&&Q==1)continue;let U=Q==2?1:Q==4?2:Q==8?3:0;r[G?q:q-4]=Q==1||G==v1?(X)=>{if(!$)throw new Error("Could not find typed array for code "+q);if(!d.copyBuffers){if(Q===1||Q===2&&!(X.byteOffset&1)||Q===4&&!(X.byteOffset&3)||Q===8&&!(X.byteOffset&7))return new $(X.buffer,X.byteOffset,X.byteLength>>U)}return new $(Uint8Array.prototype.slice.call(X,0).buffer)}:(X)=>{if(!$)throw new Error("Could not find typed array for code "+q);let Z=new DataView(X.buffer,X.byteOffset,X.byteLength),Y=X.length>>U,N=new $(Y),W=Z[J];for(let K=0;K<Y;K++)N[K]=W.call(Z,K<<U,G);return N}}}function m1(){let $=X0(),q=I+l();for(let Q=2;Q<$;Q++){let G=X0();I+=G}let J=I;return I=q,a=[y$(X0()),y$(X0())],a.position0=0,a.position1=0,a.postBundlePosition=I,I=J,l()}function X0(){let $=v[I++]&31;if($>23)switch($){case 24:$=v[I++];break;case 25:$=W8.getUint16(I),I+=2;break;case 26:$=W8.getUint32(I),I+=4;break}return $}function b$(){if(d.getShared){let $=PJ(()=>{return v=null,d.getShared()})||{},q=$.structures||[];if(d.sharedVersion=$.version,K8=d.sharedValues=$.packedValues,o===!0)d.structures=o=q;else o.splice.apply(o,[0,q.length].concat(q))}}function PJ($){let q=o8,J=I,Q=_$,G=o0,U=R0,X=i0,Z=S$,Y=C8,N=a,W=new Uint8Array(v.slice(0,o8)),K=o,E=d,R=H0,A=$();return o8=q,I=J,_$=Q,o0=G,R0=U,i0=X,S$=Z,C8=Y,a=N,v=W,H0=R,o=K,d=E,W8=new DataView(v.buffer,v.byteOffset,v.byteLength),A}function r0(){v=null,C8=null,o=null}var a0=new Array(147);for(let $=0;$<256;$++)a0[$]=+("1e"+Math.floor(45.15-$*0.30103));var h$=new b8({useRecords:!1}),s0=h$.decode,b1=h$.decodeMultiple;var t0;try{t0=new TextEncoder}catch($){}var l$,vJ,$$=typeof globalThis==="object"&&globalThis.Buffer,L0=typeof $$!=="undefined",p$=L0?$$.allocUnsafeSlow:Uint8Array,FJ=L0?$$:Uint8Array,fJ=256,xJ=L0?4294967296:2144337920;var u$,z,n,M=0,h8,s=null,h1=61440,p1=/[\\u0080-\\uFFFF]/,D8=Symbol("record-id");class q$ extends b8{constructor($){super($);this.offset=0;let q,J,Q,G,U,X;$=$||{};let Z=FJ.prototype.utf8Write?function(O,T,H){return z.utf8Write(O,T,H)}:t0&&t0.encodeInto?function(O,T){return t0.encodeInto(O,z.subarray(T)).written}:!1,Y=this,N=$.structures||$.saveStructures,W=$.maxSharedStructures;if(W==null)W=N?128:0;if(W>8190)throw new Error("Maximum maxSharedStructure is 8190");let K=$.sequential;if(K)W=0;if(!this.structures)this.structures=[];if(this.saveStructures)this.saveShared=this.saveStructures;let E,R,A=$.sharedValues,_;if(A){_=Object.create(null);for(let O=0,T=A.length;O<T;O++)_[A[O]]=O}let L=[],j=0,C=0;this.mapEncode=function(O,T){if(this._keyMap&&!this._mapped)switch(O.constructor.name){case"Array":O=O.map((H)=>this.encodeKeys(H));break}return this.encode(O,T)},this.encode=function(O,T){if(!z)z=new p$(8192),n=new DataView(z.buffer,0,8192),M=0;if(h8=z.length-10,h8-M<2048)z=new p$(z.length),n=new DataView(z.buffer,0,z.length),h8=z.length-10,M=0;else if(T===i$)M=M+7&2147483640;if(J=M,Y.useSelfDescribedHeader)n.setUint32(M,3654940416),M+=3;if(X=Y.structuredClone?new Map:null,Y.bundleStrings&&typeof O!=="string")s=[],s.size=1/0;else s=null;if(Q=Y.structures,Q){if(Q.uninitialized){let B=Y.getShared()||{};Y.structures=Q=B.structures||[],Y.sharedVersion=B.version;let V=Y.sharedValues=B.packedValues;if(V){_={};for(let S=0,m=V.length;S<m;S++)_[V[S]]=S}}let H=Q.length;if(H>W&&!K)H=W;if(!Q.transitions){Q.transitions=Object.create(null);for(let B=0;B<H;B++){let V=Q[B];if(!V)continue;let S,m=Q.transitions;for(let b=0,h=V.length;b<h;b++){if(m[D8]===void 0)m[D8]=B;let c=V[b];if(S=m[c],!S)S=m[c]=Object.create(null);m=S}m[D8]=B|1048576}}if(!K)Q.nextId=H}if(G)G=!1;if(U=Q||[],R=_,$.pack){let H=new Map;if(H.values=[],H.encoder=Y,H.maxValues=$.maxPrivatePackedValues||(_?16:1/0),H.objectMap=_||!1,H.samplingPackedValues=E,e0(O,H),H.values.length>0){z[M++]=216,z[M++]=51,B8(4);let B=H.values;D(B),B8(0),B8(0),R=Object.create(_||null);for(let V=0,S=B.length;V<S;V++)R[B[V]]=V}}u$=T&d$;try{if(u$)return;if(D(O),s)_J(J,D);if(Y.offset=M,X&&X.idsToInsert){if(M+=X.idsToInsert.length*2,M>h8)f(M);Y.offset=M;let H=d1(z.subarray(J,M),X.idsToInsert);return X=null,H}if(T&i$)return z.start=J,z.end=M,z;return z.subarray(J,M)}finally{if(Q){if(C<10)C++;if(Q.length>W)Q.length=W;if(j>1e4){if(Q.transitions=null,C=0,j=0,L.length>0)L=[]}else if(L.length>0&&!K){for(let H=0,B=L.length;H<B;H++)L[H][D8]=void 0;L=[]}}if(G&&Y.saveShared){if(Y.structures.length>W)Y.structures=Y.structures.slice(0,W);let H=z.subarray(J,M);if(Y.updateSharedData()===!1)return Y.encode(O);return H}if(T&o1)M=J}},this.findCommonStringsToPack=()=>{if(E=new Map,!_)_=Object.create(null);return(O)=>{let T=O&&O.threshold||4,H=this.pack?O.maxPrivatePackedValues||16:0;if(!A)A=this.sharedValues=[];for(let[B,V]of E)if(V.count>T)_[B]=H++,A.push(B),G=!0;while(this.saveShared&&this.updateSharedData()===!1);E=null}};let D=(O)=>{if(M>h8)z=f(M);var T=typeof O,H;if(T==="string"){if(R){let m=R[O];if(m>=0){if(m<16)z[M++]=m+224;else if(z[M++]=198,m&1)D(15-m>>1);else D(m-16>>1);return}else if(E&&!$.pack){let b=E.get(O);if(b)b.count++;else E.set(O,{count:1})}}let B=O.length;if(s&&B>=4&&B<1024){if((s.size+=B)>h1){let b,h=(s[0]?s[0].length*3+s[1].length:0)+10;if(M+h>h8)z=f(M+h);if(z[M++]=217,z[M++]=223,z[M++]=249,z[M++]=s.position?132:130,z[M++]=26,b=M-J,M+=4,s.position)_J(J,D);s=["",""],s.size=0,s.position=b}let m=p1.test(O);s[m?0:1]+=O,z[M++]=m?206:207,D(B);return}let V;if(B<32)V=1;else if(B<256)V=2;else if(B<65536)V=3;else V=5;let S=B*3;if(M+S>h8)z=f(M+S);if(B<64||!Z){let m,b,h,c=M+V;for(m=0;m<B;m++)if(b=O.charCodeAt(m),b<128)z[c++]=b;else if(b<2048)z[c++]=b>>6|192,z[c++]=b&63|128;else if((b&64512)===55296&&((h=O.charCodeAt(m+1))&64512)===56320)b=65536+((b&1023)<<10)+(h&1023),m++,z[c++]=b>>18|240,z[c++]=b>>12&63|128,z[c++]=b>>6&63|128,z[c++]=b&63|128;else z[c++]=b>>12|224,z[c++]=b>>6&63|128,z[c++]=b&63|128;H=c-M-V}else H=Z(O,M+V,S);if(H<24)z[M++]=96|H;else if(H<256){if(V<2)z.copyWithin(M+2,M+1,M+1+H);z[M++]=120,z[M++]=H}else if(H<65536){if(V<3)z.copyWithin(M+3,M+2,M+2+H);z[M++]=121,z[M++]=H>>8,z[M++]=H&255}else{if(V<5)z.copyWithin(M+5,M+3,M+3+H);z[M++]=122,n.setUint32(M,H),M+=4}M+=H}else if(T==="number")if(!this.alwaysUseFloat&&O>>>0===O)if(O<24)z[M++]=O;else if(O<256)z[M++]=24,z[M++]=O;else if(O<65536)z[M++]=25,z[M++]=O>>8,z[M++]=O&255;else z[M++]=26,n.setUint32(M,O),M+=4;else if(!this.alwaysUseFloat&&O>>0===O)if(O>=-24)z[M++]=31-O;else if(O>=-256)z[M++]=56,z[M++]=~O;else if(O>=-65536)z[M++]=57,n.setUint16(M,~O),M+=2;else z[M++]=58,n.setUint32(M,~O),M+=4;else{let B;if((B=this.useFloat32)>0&&O<4294967296&&O>=-2147483648){z[M++]=250,n.setFloat32(M,O);let V;if(B<4||(V=O*a0[(z[M]&127)<<1|z[M+1]>>7])>>0===V){M+=4;return}else M--}z[M++]=251,n.setFloat64(M,O),M+=8}else if(T==="object")if(!O)z[M++]=246;else{if(X){let V=X.get(O);if(V){if(z[M++]=216,z[M++]=29,z[M++]=25,!V.references){let S=X.idsToInsert||(X.idsToInsert=[]);V.references=[],S.push(V)}V.references.push(M-J),M+=2;return}else X.set(O,{offset:M-J})}let B=O.constructor;if(B===Object)F(O);else if(B===Array){if(H=O.length,H<24)z[M++]=128|H;else B8(H);for(let V=0;V<H;V++)D(O[V])}else if(B===Map){if(this.mapsAsObjects?this.useTag259ForMaps!==!1:this.useTag259ForMaps)z[M++]=217,z[M++]=1,z[M++]=3;if(H=O.size,H<24)z[M++]=160|H;else if(H<256)z[M++]=184,z[M++]=H;else if(H<65536)z[M++]=185,z[M++]=H>>8,z[M++]=H&255;else z[M++]=186,n.setUint32(M,H),M+=4;if(Y.keyMap)for(let[V,S]of O)D(Y.encodeKey(V)),D(S);else for(let[V,S]of O)D(V),D(S)}else{for(let V=0,S=l$.length;V<S;V++){let m=vJ[V];if(O instanceof m){let b=l$[V],h=b.tag;if(h==null)h=b.getTag&&b.getTag.call(this,O);if(h<24)z[M++]=192|h;else if(h<256)z[M++]=216,z[M++]=h;else if(h<65536)z[M++]=217,z[M++]=h>>8,z[M++]=h&255;else if(h>-1)z[M++]=218,n.setUint32(M,h),M+=4;b.encode.call(this,O,D,f);return}}if(O[Symbol.iterator]){if(u$){let V=new Error("Iterable should be serialized as iterator");throw V.iteratorNotHandled=!0,V}z[M++]=159;for(let V of O)D(V);z[M++]=255;return}if(O[Symbol.asyncIterator]||c$(O)){let V=new Error("Iterable/blob should be serialized as iterator");throw V.iteratorNotHandled=!0,V}if(this.useToJSON&&O.toJSON){let V=O.toJSON();if(V!==O)return D(V)}F(O)}}else if(T==="boolean")z[M++]=O?245:244;else if(T==="bigint"){if(O<BigInt(1)<<BigInt(64)&&O>=0)z[M++]=27,n.setBigUint64(M,O);else if(O>-(BigInt(1)<<BigInt(64))&&O<0)z[M++]=59,n.setBigUint64(M,-O-BigInt(1));else if(this.largeBigIntToFloat)z[M++]=251,n.setFloat64(M,Number(O));else{if(O>=BigInt(0))z[M++]=194;else z[M++]=195,O=BigInt(-1)-O;let B=[];while(O)B.push(Number(O&BigInt(255))),O>>=BigInt(8);n$(new Uint8Array(B.reverse()),f);return}M+=8}else if(T==="undefined")z[M++]=247;else throw new Error("Unknown type: "+T)},F=this.useRecords===!1?this.variableMapSize?(O)=>{let T=Object.keys(O),H=Object.values(O),B=T.length;if(B<24)z[M++]=160|B;else if(B<256)z[M++]=184,z[M++]=B;else if(B<65536)z[M++]=185,z[M++]=B>>8,z[M++]=B&255;else z[M++]=186,n.setUint32(M,B),M+=4;let V;if(Y.keyMap)for(let S=0;S<B;S++)D(Y.encodeKey(T[S])),D(H[S]);else for(let S=0;S<B;S++)D(T[S]),D(H[S])}:(O)=>{z[M++]=185;let T=M-J;M+=2;let H=0;if(Y.keyMap){for(let B in O)if(typeof O.hasOwnProperty!=="function"||O.hasOwnProperty(B))D(Y.encodeKey(B)),D(O[B]),H++}else for(let B in O)if(typeof O.hasOwnProperty!=="function"||O.hasOwnProperty(B))D(B),D(O[B]),H++;z[T+++J]=H>>8,z[T+J]=H&255}:(O,T)=>{let H,B=U.transitions||(U.transitions=Object.create(null)),V=0,S=0,m,b;if(this.keyMap){b=Object.keys(O).map((c)=>this.encodeKey(c)),S=b.length;for(let c=0;c<S;c++){let Z0=b[c];if(H=B[Z0],!H)H=B[Z0]=Object.create(null),V++;B=H}}else for(let c in O)if(typeof O.hasOwnProperty!=="function"||O.hasOwnProperty(c)){if(H=B[c],!H){if(B[D8]&1048576)m=B[D8]&65535;H=B[c]=Object.create(null),V++}B=H,S++}let h=B[D8];if(h!==void 0)h&=65535,z[M++]=217,z[M++]=h>>8|224,z[M++]=h&255;else{if(!b)b=B.__keys__||(B.__keys__=Object.keys(O));if(m===void 0){if(h=U.nextId++,!h)h=0,U.nextId=1;if(h>=fJ)U.nextId=(h=W)+1}else h=m;if(U[h]=b,h<W){z[M++]=217,z[M++]=h>>8|224,z[M++]=h&255,B=U.transitions;for(let c=0;c<S;c++){if(B[D8]===void 0||B[D8]&1048576)B[D8]=h;B=B[b[c]]}B[D8]=h|1048576,G=!0}else{if(B[D8]=h,n.setUint32(M,3655335680),M+=3,V)j+=C*V;if(L.length>=fJ-W)L.shift()[D8]=void 0;if(L.push(B),B8(S+2),D(57344+h),D(b),T)return;for(let c in O)if(typeof O.hasOwnProperty!=="function"||O.hasOwnProperty(c))D(O[c]);return}}if(S<24)z[M++]=128|S;else B8(S);if(T)return;for(let c in O)if(typeof O.hasOwnProperty!=="function"||O.hasOwnProperty(c))D(O[c])},f=(O)=>{let T;if(O>16777216){if(O-J>xJ)throw new Error("Encoded buffer would be larger than maximum buffer size");T=Math.min(xJ,Math.round(Math.max((O-J)*(O>67108864?1.25:2),4194304)/4096)*4096)}else T=(Math.max(O-J<<2,z.length-1)>>12)+1<<12;let H=new p$(T);if(n=new DataView(H.buffer,0,T),z.copy)z.copy(H,0,J,O);else H.set(z.slice(J,O));return M-=J,J=0,h8=H.length-10,z=H},k=100,y=1000;this.encodeAsIterable=function(O,T){return g(O,T,w)},this.encodeAsAsyncIterable=function(O,T){return g(O,T,u)};function*w(O,T,H){let B=O.constructor;if(B===Object){let V=Y.useRecords!==!1;if(V)F(O,!0);else SJ(Object.keys(O).length,160);for(let S in O){let m=O[S];if(!V)D(S);if(m&&typeof m==="object")if(T[S])yield*w(m,T[S]);else yield*P(m,T,S);else D(m)}}else if(B===Array){let V=O.length;B8(V);for(let S=0;S<V;S++){let m=O[S];if(m&&(typeof m==="object"||M-J>k))if(T.element)yield*w(m,T.element);else yield*P(m,T,"element");else D(m)}}else if(O[Symbol.iterator]&&!O.buffer){z[M++]=159;for(let V of O)if(V&&(typeof V==="object"||M-J>k))if(T.element)yield*w(V,T.element);else yield*P(V,T,"element");else D(V);z[M++]=255}else if(c$(O))SJ(O.size,64),yield z.subarray(J,M),yield O,x();else if(O[Symbol.asyncIterator])z[M++]=159,yield z.subarray(J,M),yield O,x(),z[M++]=255;else D(O);if(H&&M>J)yield z.subarray(J,M);else if(M-J>k)yield z.subarray(J,M),x()}function*P(O,T,H){let B=M-J;try{if(D(O),M-J>k)yield z.subarray(J,M),x()}catch(V){if(V.iteratorNotHandled)T[H]={},M=J+B,yield*w.call(this,O,T[H]);else throw V}}function x(){k=y,Y.encode(null,d$)}function g(O,T,H){if(T&&T.chunkThreshold)k=y=T.chunkThreshold;else k=100;if(O&&typeof O==="object")return Y.encode(null,d$),H(O,Y.iterateProperties||(Y.iterateProperties={}),!0);return[Y.encode(O)]}async function*u(O,T){for(let H of w(O,T,!0)){let B=H.constructor;if(B===FJ||B===Uint8Array)yield H;else if(c$(H)){let V=H.stream().getReader(),S;while(!(S=await V.read()).done)yield S.value}else if(H[Symbol.asyncIterator])for await(let V of H)if(x(),V)yield*u(V,T.async||(T.async={}));else yield Y.encode(V);else yield H}}}useBuffer($){z=$,n=new DataView(z.buffer,z.byteOffset,z.byteLength),M=0}clearSharedData(){if(this.structures)this.structures=[];if(this.sharedValues)this.sharedValues=void 0}updateSharedData(){let $=this.sharedVersion||0;this.sharedVersion=$+1;let q=this.structures.slice(0),J=new o$(q,this.sharedValues,this.sharedVersion),Q=this.saveShared(J,(G)=>(G&&G.version||0)==$);if(Q===!1)J=this.getShared()||{},this.structures=J.structures||[],this.sharedValues=J.packedValues,this.sharedVersion=J.version,this.structures.nextId=this.structures.length;else q.forEach((G,U)=>this.structures[U]=G);return Q}}function SJ($,q){if($<24)z[M++]=q|$;else if($<256)z[M++]=q|24,z[M++]=$;else if($<65536)z[M++]=q|25,z[M++]=$>>8,z[M++]=$&255;else z[M++]=q|26,n.setUint32(M,$),M+=4}class o${constructor($,q,J){this.structures=$,this.packedValues=q,this.version=J}}function B8($){if($<24)z[M++]=128|$;else if($<256)z[M++]=152,z[M++]=$;else if($<65536)z[M++]=153,z[M++]=$>>8,z[M++]=$&255;else z[M++]=154,n.setUint32(M,$),M+=4}var u1=typeof Blob==="undefined"?function(){}:Blob;function c$($){if($ instanceof u1)return!0;let q=$[Symbol.toStringTag];return q==="Blob"||q==="File"}function e0($,q){switch(typeof $){case"string":if($.length>3){if(q.objectMap[$]>-1||q.values.length>=q.maxValues)return;let Q=q.get($);if(Q){if(++Q.count==2)q.values.push($)}else if(q.set($,{count:1}),q.samplingPackedValues){let G=q.samplingPackedValues.get($);if(G)G.count++;else q.samplingPackedValues.set($,{count:1})}}break;case"object":if($)if($ instanceof Array)for(let Q=0,G=$.length;Q<G;Q++)e0($[Q],q);else{let Q=!q.encoder.useRecords;for(var J in $)if($.hasOwnProperty(J)){if(Q)e0(J,q);e0($[J],q)}}break;case"function":console.log($)}}var c1=new Uint8Array(new Uint16Array([1]).buffer)[0]==1;vJ=[Date,Set,Error,RegExp,T8,ArrayBuffer,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,typeof BigUint64Array=="undefined"?function(){}:BigUint64Array,Int8Array,Int16Array,Int32Array,typeof BigInt64Array=="undefined"?function(){}:BigInt64Array,Float32Array,Float64Array,o$];l$=[{tag:1,encode($,q){let J=$.getTime()/1000;if((this.useTimestamp32||$.getMilliseconds()===0)&&J>=0&&J<4294967296)z[M++]=26,n.setUint32(M,J),M+=4;else z[M++]=251,n.setFloat64(M,J),M+=8}},{tag:258,encode($,q){let J=Array.from($);q(J)}},{tag:27,encode($,q){q([$.name,$.message])}},{tag:27,encode($,q){q(["RegExp",$.source,$.flags])}},{getTag($){return $.tag},encode($,q){q($.value)}},{encode($,q,J){n$($,J)}},{getTag($){if($.constructor===Uint8Array){if(this.tagUint8Array||L0&&this.tagUint8Array!==!1)return 64}},encode($,q,J){n$($,J)}},A8(68,1),A8(69,2),A8(70,4),A8(71,8),A8(72,1),A8(77,2),A8(78,4),A8(79,8),A8(85,4),A8(86,8),{encode($,q){let J=$.packedValues||[],Q=$.structures||[];if(J.values.length>0){z[M++]=216,z[M++]=51,B8(4);let G=J.values;q(G),B8(0),B8(0),packedObjectMap=Object.create(sharedPackedObjectMap||null);for(let U=0,X=G.length;U<X;U++)packedObjectMap[G[U]]=U}if(Q){n.setUint32(M,3655335424),M+=3;let G=Q.slice(0);G.unshift(57344),G.push(new T8($.version,1399353956)),q(G)}else q(new T8($.version,1399353956))}}];function A8($,q){if(!c1&&q>1)$-=4;return{tag:$,encode:function J(Q,G){let U=Q.byteLength,X=Q.byteOffset||0,Z=Q.buffer||Q;G(L0?$$.from(Z,X,U):new Uint8Array(Z,X,U))}}}function n$($,q){let J=$.byteLength;if(J<24)z[M++]=64+J;else if(J<256)z[M++]=88,z[M++]=J;else if(J<65536)z[M++]=89,z[M++]=J>>8,z[M++]=J&255;else z[M++]=90,n.setUint32(M,J),M+=4;if(M+J>=z.length)q(M+J);z.set($.buffer?$:new Uint8Array($),M),M+=J}function d1($,q){let J,Q=q.length*2,G=$.length-Q;q.sort((U,X)=>U.offset>X.offset?1:-1);for(let U=0;U<q.length;U++){let X=q[U];X.id=U;for(let Z of X.references)$[Z++]=U>>8,$[Z]=U&255}while(J=q.pop()){let U=J.offset;$.copyWithin(U+Q,U,G),Q-=2;let X=U+Q;$[X++]=216,$[X++]=28,G=U}return $}function _J($,q){n.setUint32(s.position+$,M-s.position-$+1);let J=s;s=null,q(J[0]),q(J[1])}var r$=new q$({useRecords:!1}),l1=r$.encode,n1=r$.encodeAsIterable,i1=r$.encodeAsAsyncIterable;var i$=512,o1=1024,d$=2048;var J$=($)=>{let q=new Uint8Array($),J="";for(let Q=0;Q<q.byteLength;Q++)J+=String.fromCharCode(q[Q]);return btoa(J).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=/g,"")},yJ=($)=>{let q=atob($.replace(/-/g,"+").replace(/_/g,"/")),J=new Uint8Array(q.length);for(let Q=0;Q<q.length;Q++)J[Q]=q.charCodeAt(Q);return J.buffer};async function gJ($){let q=crypto.getRandomValues(new Uint8Array(32)),J=crypto.getRandomValues(new Uint8Array(16)),Q=await navigator.credentials.create({publicKey:{challenge:q,rp:{name:"Sorane Web/A Form"},user:{id:J,name:$,displayName:$},pubKeyCredParams:[{alg:-7,type:"public-key"}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required",residentKey:"preferred"},timeout:60000,attestation:"none",extensions:{prf:{}}}});if(!Q)throw new Error("Credential creation failed");return{id:Q.id,rawId:J$(Q.rawId),response:Q.response}}async function mJ($,q){let J=await navigator.credentials.get({publicKey:{challenge:q,allowCredentials:[{id:yJ($),type:"public-key"}],userVerification:"required"}});if(!J)throw new Error("Assertion failed");let Q=J.response;return{id:J.id,signature:J$(Q.signature),authenticatorData:J$(Q.authenticatorData),clientDataJSON:J$(Q.clientDataJSON)}}async function Q$($,q){let J=crypto.getRandomValues(new Uint8Array(32)),Q=await navigator.credentials.get({publicKey:{challenge:J,allowCredentials:[{id:yJ($),type:"public-key"}],userVerification:"required",extensions:{prf:{eval:{first:q}}}}});if(!Q)throw new Error("Assertion failed");let U=Q.getClientExtensionResults()?.prf?.results?.first;if(!U)throw new Error("PRF extension not available");return new Uint8Array(U)}function I0($){return Array.from($).map((q)=>q.toString(16).padStart(2,"0")).join("")}function bJ($){let q=new Uint8Array($.length/2);for(let J=0;J<q.length;J++)q[J]=parseInt($.substring(J*2,J*2+2),16);return q}class pJ{usePasskey=!0;credentialId=null;publicKey=null;publicKeyType="ed25519";edPrivateKey=null;constructor(){this.loadKey()}loadKey(){if(typeof localStorage==="undefined")return;let $=localStorage.getItem("weba_passkey_id"),q=localStorage.getItem("weba_passkey_pub");if($&&q){this.credentialId=$,this.publicKey=bJ(q),this.publicKeyType="p256",this.usePasskey=!0;return}let J=localStorage.getItem("weba_private_key");if(J)this.edPrivateKey=bJ(J),this.publicKey=m8.getPublicKey(this.edPrivateKey),this.publicKeyType="ed25519",this.usePasskey=!1}resetKey(){if(typeof localStorage!=="undefined")localStorage.removeItem("weba_passkey_id"),localStorage.removeItem("weba_passkey_pub"),localStorage.removeItem("weba_private_key");this.credentialId=null,this.publicKey=null,this.edPrivateKey=null}async register(){try{console.log("Registering Passkey...");let $=await gJ("User"),q=new Uint8Array($.response.attestationObject),Q=s0(q).authData,G=new DataView(Q.buffer,Q.byteOffset,Q.byteLength),U=53,X=G.getUint16(U);U+=2,U+=X;let Z=Q.slice(U),Y=s0(Z),N=Y.get(-2),W=Y.get(-3);if(!N||!W)throw new Error("Invalid COSE Key: x or y missing");let K=new Uint8Array(65);if(K[0]=4,K.set(N,1),K.set(W,33),this.credentialId=$.rawId,this.publicKey=K,this.publicKeyType="p256",this.usePasskey=!0,typeof localStorage!=="undefined")localStorage.setItem("weba_passkey_id",this.credentialId),localStorage.setItem("weba_passkey_pub",I0(this.publicKey));return console.log("Passkey Registered:",this.credentialId),!0}catch($){return console.warn("Passkey registration failed, falling back to Ed25519",$),this.generateEdKey(),!1}}generateEdKey(){if(this.edPrivateKey=m8.utils.randomSecretKey(),this.publicKey=m8.getPublicKey(this.edPrivateKey),this.publicKeyType="ed25519",this.usePasskey=!1,typeof localStorage!=="undefined")localStorage.setItem("weba_private_key",I0(this.edPrivateKey))}getIssuerDid(){if(!this.publicKey)return"";return`did:key:z${I0(this.publicKey)}`}getPublicKey(){return this.publicKey?I0(this.publicKey):""}async sign($,q="authentication"){if(!this.publicKey)await this.register();let J=hJ.default($),Q=new TextEncoder().encode(J);if(this.usePasskey&&this.credentialId){let G=await crypto.subtle.digest("SHA-256",Q),U=await mJ(this.credentialId,G);return{...$,proof:{type:"PasskeySignature2025",created:new Date().toISOString(),verificationMethod:this.getIssuerDid(),proofPurpose:q,proofValue:U.signature,"srn:authenticatorData":U.authenticatorData,"srn:clientDataJSON":U.clientDataJSON,"srn:credentialId":U.id}}}else{if(!this.edPrivateKey)this.generateEdKey();let G=m8.sign(Q,this.edPrivateKey);return{...$,proof:{type:"Ed25519Signature2020",created:new Date().toISOString(),verificationMethod:this.getIssuerDid(),proofPurpose:q,proofValue:I0(G)}}}}}var Y0=new pJ;class a${oHash;iHash;blockLen;outputLen;finished=!1;destroyed=!1;constructor($,q){if(M0($),p(q,void 0,"key"),this.iHash=$.create(),typeof this.iHash.update!=="function")throw new Error("Expected instance of class which extends utils.Hash");this.blockLen=this.iHash.blockLen,this.outputLen=this.iHash.outputLen;let J=this.blockLen,Q=new Uint8Array(J);Q.set(q.length>J?$.create().update(q).digest():q);for(let G=0;G<Q.length;G++)Q[G]^=54;this.iHash.update(Q),this.oHash=$.create();for(let G=0;G<Q.length;G++)Q[G]^=106;this.oHash.update(Q),O8(Q)}update($){return j8(this),this.iHash.update($),this}digestInto($){j8(this),p($,this.outputLen,"output"),this.finished=!0,this.iHash.digestInto($),this.oHash.update($),this.oHash.digestInto($),this.destroy()}digest(){let $=new Uint8Array(this.oHash.outputLen);return this.digestInto($),$}_cloneInto($){$||=Object.create(Object.getPrototypeOf(this),{});let{oHash:q,iHash:J,finished:Q,destroyed:G,blockLen:U,outputLen:X}=this;return $=$,$.finished=Q,$.destroyed=G,$.blockLen=U,$.outputLen=X,$.oHash=q._cloneInto($.oHash),$.iHash=J._cloneInto($.iHash),$}clone(){return this._cloneInto()}destroy(){this.destroyed=!0,this.oHash.destroy(),this.iHash.destroy()}}var G$=($,q,J)=>new a$($,q).update(J).digest();G$.create=($,q)=>new a$($,q);function r1($,q,J){if(M0($),J===void 0)J=new Uint8Array($.outputLen);return G$($,J,q)}var s$=Uint8Array.of(0),uJ=Uint8Array.of();function a1($,q,J,Q=32){M0($),z8(Q,"length");let G=$.outputLen;if(Q>255*G)throw new Error("Length must be <= 255*HashLen");let U=Math.ceil(Q/G);if(J===void 0)J=uJ;else p(J,void 0,"info");let X=new Uint8Array(U*G),Z=G$.create($,q),Y=Z._cloneInto(),N=new Uint8Array(Z.outputLen);for(let W=0;W<U;W++)s$[0]=W+1,Y.update(W===0?uJ:N).update(J).update(s$).digestInto(N),X.set(N,G*W),Z._cloneInto(Y);return Z.destroy(),Y.destroy(),O8(N,s$),X.slice(0,Q)}var M8=($,q,J,Q,G)=>a1($,r1($,q,J),Q,G);var lJ=Iq(f$(),1),cJ="weba_l2_ed25519_sk";function N8($){if(typeof Buffer!=="undefined")return Buffer.from($).toString("base64").replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"");let q="";return $.forEach((Q)=>{q+=String.fromCharCode(Q)}),btoa(q).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"")}function t($){let q=$.length%4===0?"":"=".repeat(4-$.length%4),J=$.replace(/-/g,"+").replace(/_/g,"/")+q;if(typeof Buffer!=="undefined")return new Uint8Array(Buffer.from(J,"base64"));let Q=atob(J),G=new Uint8Array(Q.length);for(let U=0;U<Q.length;U+=1)G[U]=Q.charCodeAt(U);return G}function T0($){let q=lJ.default($);if(q===void 0)throw new Error("Failed to canonicalize JSON");return q}function dJ($){let q=new Uint8Array($);return crypto.getRandomValues(q),q}function s1(){let $=localStorage.getItem(cJ);if($)return t($);let q=m8.utils.randomSecretKey();return localStorage.setItem(cJ,N8(q)),q}function t1($,q,J){let Q={layer1_ref:$,recipient:q,weba_version:J};return new TextEncoder().encode(T0(Q))}function nJ($,q){let J=new Uint8Array($.length+q.length);return J.set($,0),J.set(q,$.length),J}function iJ($){let q=$.keyPolicy??"campaign+layer1";if(q==="campaign+layer1"&&!$.layer1Ref)throw new Error("layer1_ref is required for campaign+layer1 policy");let J=T0({domain:"weba-l2/org-x25519",campaign_id:$.campaignId,key_policy:q,layer1_ref:q==="campaign+layer1"?$.layer1Ref:void 0}),Q=new TextEncoder().encode(J),G=M8(Y8,$.orgRootKey,void 0,Q,32);return{publicKey:Q0.getPublicKey(G),privateKey:G,keyPolicy:q}}function oJ($){let q=new TextEncoder().encode("weba-l2/user-x25519"),J=M8(Y8,$,void 0,q,32);return{publicKey:Q0.getPublicKey(J),privateKey:J}}function rJ(){return globalThis.webaPqcKem||null}async function aJ($,q,J,Q){let G=await crypto.subtle.importKey("raw",q,"AES-GCM",!1,["encrypt"]),U=await crypto.subtle.encrypt({name:"AES-GCM",iv:J,additionalData:Q},G,$);return new Uint8Array(U)}async function sJ($){let q=M8(Y8,$.prfKey,void 0,void 0,32),J=M8(Y8,q,void 0,new TextEncoder().encode("weba-l2/kw"),32),Q=M8(Y8,q,void 0,new TextEncoder().encode("weba-l2/kw-iv"),12),G=$.aad??new Uint8Array;return aJ($.recipientSk,J,Q,G)}async function tJ($,q,J,Q){let G=await crypto.subtle.importKey("raw",q,"AES-GCM",!1,["decrypt"]),U=await crypto.subtle.decrypt({name:"AES-GCM",iv:J,additionalData:Q},G,$);return new Uint8Array(U)}async function eJ($){let q=$.config.weba_version??"0.1",J=$.config.recipient_kid,Q=$.config.layer1_ref,G=$.user_kid??"user#sig-1",U=s1(),X=T0($.layer2_plain),Z=new TextEncoder().encode(X),Y=m8.sign(Z,U),N={alg:"Ed25519",kid:G,sig:N8(Y),created_at:new Date().toISOString()},W={layer2_plain:$.layer2_plain,layer2_sig:N},K=t1(Q,J,q),E=new TextEncoder().encode(T0(W)),R=t($.config.recipient_x25519),A=dJ(32),_=Q0.getPublicKey(A),L=Q0.getSharedSecret(A,R),j=L,C,D="X25519";if($.config.recipient_pqc){let w=$.pqcProvider??rJ();if(!w)throw new Error("PQC requested but no provider is available");let P=t($.config.recipient_pqc),x=w.encapsulate(P);C=x.encapsulation,j=nJ(L,x.sharedSecret),D=`X25519+${w.kemId}`}let F=M8(Y8,j,K,void 0,32),f=M8(Y8,F,void 0,new TextEncoder().encode("weba-l2/key"),32),k=M8(Y8,F,void 0,new TextEncoder().encode("weba-l2/iv"),12),y=await aJ(E,f,k,K);return{weba_version:q,layer1_ref:Q,layer2:{enc:"HPKE-v1",suite:{kem:D,kdf:"HKDF-SHA256",aead:"AES-256-GCM"},recipient:J,encapsulated:{classical:N8(_),...C?{pqc:N8(C)}:{}},ciphertext:N8(y),aad:N8(K)},meta:{created_at:new Date().toISOString(),nonce:N8(dJ(16)),...$.config.campaign_id?{campaign_id:$.config.campaign_id}:{},...$.config.key_policy?{key_policy:$.config.key_policy}:{}}}}function $Q(){let $=document.getElementById("weba-l2-config");if(!$||!$.textContent)return null;try{return JSON.parse($.textContent)}catch{return null}}async function U$($,q,J){let Q=t($.layer2.aad),G={layer1_ref:$.layer1_ref,recipient:$.layer2.recipient,weba_version:$.weba_version},U=new TextEncoder().encode(T0(G));if(N8(U)!==$.layer2.aad)throw new Error("AAD mismatch");let X=t($.layer2.encapsulated.classical),Z=Q0.getSharedSecret(q,X),Y=Z;if($.layer2.encapsulated.pqc){let A=J?.pqcProvider??rJ(),_=J?.pqcRecipientSk;if(!A||!_)throw new Error("Missing PQC KEM for envelope");let L=t($.layer2.encapsulated.pqc),j=A.decapsulate(_,L);Y=nJ(Z,j)}let N=M8(Y8,Y,Q,void 0,32),W=M8(Y8,N,void 0,new TextEncoder().encode("weba-l2/key"),32),K=M8(Y8,N,void 0,new TextEncoder().encode("weba-l2/iv"),12),E=t($.layer2.ciphertext),R=await tJ(E,W,K,Q);return JSON.parse(new TextDecoder().decode(R))}async function qQ($){let q=M8(Y8,$.prfKey,void 0,void 0,32),J=M8(Y8,q,void 0,new TextEncoder().encode("weba-l2/kw"),32),Q=M8(Y8,q,void 0,new TextEncoder().encode("weba-l2/kw-iv"),12),G=$.keywrap.aad?t($.keywrap.aad):new Uint8Array,U=t($.keywrap.wrapped_key);return tJ(U,J,Q,G)}function e1($){$.querySelectorAll("input").forEach((J)=>{if(J.type==="checkbox"||J.type==="radio")J.checked=!1,J.removeAttribute("checked");else J.value="",J.removeAttribute("value")}),$.querySelectorAll("textarea").forEach((J)=>{J.value="",J.textContent=""}),$.querySelectorAll("select").forEach((J)=>{J.selectedIndex=-1,J.querySelectorAll("option").forEach((Q)=>Q.removeAttribute("selected"))}),$.getElementById("json-ld")?.remove(),$.getElementById("data-layer")?.remove();let q=$.getElementById("json-debug");if(q)q.textContent=""}function $9($,q){let J=JSON.stringify(q,null,2),Q=$.createElement("script");Q.type="application/ld+json",Q.id="weba-user-vc",Q.textContent=J,$.body.appendChild(Q);let G=$.createElement("div");G.className="weba-user-verification no-print",G.style.cssText="margin-top:2rem;padding:1rem;border:1px solid #10b981;border-radius:8px;background:#f0fdf4;font-size:0.85rem;",G.innerHTML=`\n    <details>\n      <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #047857; font-weight: 600;">\n        <span>✓</span> 利用者による署名の証明\n      </summary>\n      <div style="padding: 1rem 0;">\n        <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;"></pre>\n      </div>\n    </details>\n  `;let U=G.querySelector("pre");if(U)U.textContent=J;$.body.appendChild(G)}function q9($,q){let J=$.createElement("script");J.id="weba-l2-envelope",J.type="application/json",J.textContent=JSON.stringify(q,null,2),$.body.appendChild(J)}function J9($,q){let J=new Date,Q=J.getFullYear()+("0"+(J.getMonth()+1)).slice(-2)+("0"+J.getDate()).slice(-2)+"-"+("0"+J.getHours()).slice(-2)+("0"+J.getMinutes()).slice(-2),G=Math.random().toString(36).substring(2,8);return`${$}_${Q}_${q}_${G}.html`}function Q9($,q){let Q=new DOMParser().parseFromString($,"text/html");if(q?.stripPlaintext)e1(Q);if(q?.embeddedVc)$9(Q,q.embeddedVc);if(q?.l2Envelope)q9(Q,q.l2Envelope);return Q.documentElement.outerHTML}function JQ($){let q=Q9($.documentHtml,$.options),J=new Blob([q],{type:"text/html"}),Q=URL.createObjectURL(J),G=document.createElement("a");if(G.href=Q,G.download=J9($.title,$.filenameSuffix),G.click(),$.isFinal)setTimeout(()=>window.location.reload(),1000)}class t${formId;constructor(){this.formId="WebA_"+window.location.pathname}updateJsonLd(){let q=window.generatedJsonStructure||{};document.querySelectorAll("[data-json-path]").forEach((G)=>{let U=G.dataset.jsonPath;if(U)q[U]=G.value}),document.querySelectorAll(\'[type="radio"]:checked\').forEach((G)=>{q[G.name]=G.value}),document.querySelectorAll("table.data-table.dynamic").forEach((G)=>{let U=G.dataset.tableKey;if(U){let X=[];G.querySelectorAll("tbody tr").forEach((Z)=>{let Y={},N=!1;if(Z.querySelectorAll("[data-base-key]").forEach((W)=>{if(W.type==="checkbox"){if(Y[W.dataset.baseKey]=W.checked,W.checked)N=!0}else if(Y[W.dataset.baseKey]=W.value,W.value)N=!0}),N)X.push(Y)}),q[U]=X}});let J=document.getElementById("json-ld");if(J)J.textContent=JSON.stringify(q,null,2);let Q=document.getElementById("json-debug");if(Q)Q.textContent=JSON.stringify(q,null,2);return q}getL2Config(){return window.webaL2Config||null}async signAndDownload(){let $=this.updateJsonLd(),q=window,J=q.generatedJsonStructure&&q.generatedJsonStructure.name||"Response",Q=window.location.href.split("#")[0],G=this.getL2Config(),U=document.getElementById("weba-l2-encrypt");if(!!(G?.enabled&&(U?U.checked:G.default_enabled))){if(!G?.recipient_kid||!G?.recipient_x25519||!G?.layer1_ref){alert("L2 encryption config is missing required fields.");return}try{let Y=await eJ({layer2_plain:$,config:G,user_kid:G.user_kid});this.downloadHtml("submit",!0,{l2Envelope:Y,stripPlaintext:!0})}catch(Y){console.error(Y),alert("L2 encryption failed. Please check your recipient key settings.")}return}if(!Y0.getPublicKey()){if(!await Y0.register()){alert("Key registration failed.");return}}let Z={"@context":["https://www.w3.org/2018/credentials/v1"],type:["VerifiableCredential","WebAFormResponse"],issuer:Y0.getIssuerDid(),issuanceDate:new Date().toISOString(),credentialSubject:{id:`urn:uuid:${crypto.randomUUID()}`,type:"WebAFormResponse",templateId:Q,answers:$}};try{let Y=await Y0.sign(Z);this.downloadHtml("submitted",!0,{embeddedVc:Y})}catch(Y){console.error(Y),alert("Signing failed. Please ensure you are in a secure context (HTTPS/localhost).")}}saveToLS(){let $=this.updateJsonLd();localStorage.setItem(this.formId,JSON.stringify($))}restoreFromLS(){let $=localStorage.getItem(this.formId);if(!$)return;try{let q=JSON.parse($);document.querySelectorAll("[data-json-path]").forEach((J)=>{let Q=J.dataset.jsonPath;if(q[Q]!==void 0)J.value=q[Q]}),document.querySelectorAll("table.data-table.dynamic").forEach((J)=>{let Q=J.dataset.tableKey,G=q[Q];if(Array.isArray(G)){let U=J.querySelector("tbody");if(!U)return;let X=U.querySelectorAll(".template-row");G.forEach((Z,Y)=>{let N;if(Y===0)N=U.querySelector(".template-row");else{let W=U.querySelector(".template-row");if(W){N=W.cloneNode(!0),N.classList.remove("template-row");let K=N.querySelector(".remove-row-btn");if(K)K.style.visibility="visible";U.appendChild(N)}}if(N)N.querySelectorAll("input, select").forEach((W)=>{let K=W.dataset.baseKey;if(K&&Z[K]!==void 0)if(W.type==="checkbox")W.checked=!!Z[K];else W.value=Z[K]})})}})}catch(q){console.error(q)}}clearData(){if(confirm("Clear all saved data? / 保存されたデータを削除しますか？"))localStorage.removeItem(this.formId),window.location.reload()}bakeValues(){this.updateJsonLd(),document.querySelectorAll("input, textarea, select").forEach(($)=>{if($.closest(".template-row"))return;if($.type==="checkbox"||$.type==="radio")if($.checked)$.setAttribute("checked","checked");else $.removeAttribute("checked");else if($.setAttribute("value",$.value),$.tagName==="TEXTAREA")$.textContent=$.value})}downloadHtml($,q,J){let Q=window,G=Q.generatedJsonStructure&&Q.generatedJsonStructure.name||"web-a-form";JQ({documentHtml:document.documentElement.outerHTML,title:G,filenameSuffix:$,isFinal:q,options:J})}saveDraft(){this.bakeValues(),this.downloadHtml("draft",!1)}submitDocument(){this.bakeValues(),document.querySelectorAll(".search-suggestions").forEach(($)=>$.remove()),this.downloadHtml("submit",!0)}}class e${calc;data;constructor($,q){this.calc=$,this.data=q}applyI18n(){let $={en:{add_row:"+ Add Row",work_save_btn:"Save Progress",clear_btn:"Clear Data",sign_btn:"Submit"},ja:{add_row:"+ 行を追加",work_save_btn:"作業内容を保存",clear_btn:"クリア",sign_btn:"提出版を保存"}},q=(navigator.language||"en").startsWith("ja")?"ja":"en",J=$[q]||$.en;document.querySelectorAll("[data-i18n]").forEach((Q)=>{let G=Q.dataset.i18n;if(J[G])Q.textContent=J[G]})}initTables(){document.querySelectorAll(".data-table.dynamic tbody").forEach(($)=>{this.renumberRows($)})}renumberRows($){Array.from($.querySelectorAll("tr")).filter((J)=>{return J.querySelectorAll("td").length>0}).forEach((J,Q)=>{let G=Q+1;J.querySelectorAll(".auto-num").forEach((U)=>{if(U.value!=G)U.value=G.toString(),U.dispatchEvent(new Event("input",{bubbles:!0}))})})}removeTableRow($){let q=$.closest("tr"),J=q.parentElement;if(q.classList.contains("template-row"))q.querySelectorAll("input").forEach((Q)=>{if(Q.type==="checkbox")Q.checked=!1;else Q.value=""});else{if(q.remove(),J)this.renumberRows(J);this.calc.recalculate(),this.data.updateJsonLd()}}addTableRow($,q){let J=document.getElementById("tbl_"+q);if(!J)return;let Q=J.querySelector("tbody");if(!Q)return;let G=Q.querySelector(".template-row");if(!G)return;let U=G.cloneNode(!0);U.classList.remove("template-row"),U.querySelectorAll("input").forEach((Z)=>{if(Z.type==="checkbox")Z.checked=Z.hasAttribute("checked");else Z.value=Z.getAttribute("value")||""});let X=U.querySelector(".remove-row-btn");if(X)X.style.visibility="visible";U.querySelectorAll("[data-copy-from]").forEach((Z)=>{let Y=Z.dataset.copyFrom;if(Y){let N=U.querySelector(`[data-base-key="${Y}"]`);if(N&&N.value)Z.value=N.value}}),Q.appendChild(U),this.renumberRows(Q),this.calc.recalculate()}switchTab($,q){document.querySelectorAll(".tab-btn").forEach((Q)=>Q.classList.remove("active")),document.querySelectorAll(".tab-content").forEach((Q)=>Q.classList.remove("active")),$.classList.add("active");let J=document.getElementById(q);if(J)J.classList.add("active")}}function QQ($){let q=document.getElementById($);if(!q||!q.textContent)return null;try{return JSON.parse(q.textContent)}catch{return null}}function GQ(){let $=QQ("weba-l2-envelope");if(!$)return;let q=QQ("weba-l2-keywrap"),J=document.querySelector(".weba-form-container")||document.body,Q=document.createElement("div");Q.className="weba-l2-unlock",Q.style.cssText="margin-top:2rem;padding:1rem;border:1px solid #cbd5f5;border-radius:10px;background:#f8fafc;";let G=document.createElement("div");G.textContent="Encrypted Submission",G.style.cssText="font-weight:600;color:#334155;margin-bottom:0.5rem;",Q.appendChild(G);let U=document.createElement("div");U.textContent="Locked. Unlock with Passkey.",U.style.cssText="color:#64748b;margin-bottom:0.75rem;",Q.appendChild(U);let X=document.createElement("button");X.textContent="Unlock (Passkey)",X.style.cssText="padding:0.5rem 1rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;",Q.appendChild(X);let Z=document.createElement("pre");Z.style.cssText="margin-top:1rem;padding:1rem;background:#0f172a;color:#e2e8f0;border-radius:8px;overflow:auto;font-size:0.85rem;display:none;",Q.appendChild(Z);let Y=document.createElement("details");Y.style.cssText="margin-top:0.75rem; display:none;",Y.innerHTML=\'<summary style="cursor:pointer;color:#64748b;">Show signature</summary><pre style="margin-top:0.5rem;padding:0.75rem;background:#0b1220;color:#cbd5f5;border-radius:6px;overflow:auto;font-size:0.8rem;"></pre>\',Q.appendChild(Y);let N=document.createElement("button");N.textContent="Export JSON",N.style.cssText="margin-top:0.75rem;padding:0.45rem 0.9rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;display:none;",N.disabled=!0,Q.appendChild(N),X.addEventListener("click",async()=>{if(!q){U.textContent="Key wrap package not found.";return}X.disabled=!0,U.textContent="Waiting for passkey...";try{let W=t(q.prf_salt),K=await Q$(q.credential_id,W),E=await qQ({keywrap:q,prfKey:K}),R=await U$($,E);G9(R.layer2_plain),document.body.classList.add("weba-l2-readonly"),Z.textContent=JSON.stringify(R.layer2_plain,null,2),Z.style.display="block";let A=Y.querySelector("pre");if(A)A.textContent=JSON.stringify(R.layer2_sig,null,2);Y.style.display="block",N.style.display="inline-block",N.disabled=!1,U.textContent="Unlocked.",N.onclick=()=>{let _=new Blob([JSON.stringify(R,null,2)],{type:"application/json"}),L=URL.createObjectURL(_),j=document.createElement("a");j.href=L,j.download="weba-l2-decrypted.json",j.click()}}catch(W){console.error(W),U.textContent="Unlock failed.",X.disabled=!1}}),J.appendChild(Q)}function G9($){if(!$||typeof $!=="object")return;let q=$;document.querySelectorAll("[data-json-path]").forEach((J)=>{let Q=J.dataset.jsonPath;if(!Q||!(Q in q))return;let G=q[Q];if(J.type==="checkbox")J.checked=Boolean(G);else if(J.type==="radio")J.checked=J.value===String(G);else J.value=G===null||G===void 0?"":String(G)}),document.querySelectorAll(\'input[type="radio"]\').forEach((J)=>{let Q=J.name;if(!Q||!(Q in q))return;let G=q[Q];J.checked=J.value===String(G)}),document.querySelectorAll("table.data-table.dynamic").forEach((J)=>{let Q=J.dataset.tableKey;if(!Q)return;let G=q[Q];if(!Array.isArray(G))return;let U=J.querySelector("tbody");if(!U)return;let X=U.querySelector("tr.template-row");if(!X)return;Array.from(U.querySelectorAll("tr")).forEach((Z)=>{if(!Z.classList.contains("template-row"))Z.remove()}),G.forEach((Z,Y)=>{let N=Y===0?X:X.cloneNode(!0);if(Y>0){N.classList.remove("template-row");let W=N.querySelector(".remove-row-btn");if(W)W.style.visibility="visible";U.appendChild(N)}if(Z&&typeof Z==="object")N.querySelectorAll("input, select, textarea").forEach((W)=>{let K=W.dataset.baseKey;if(!K)return;let E=Z[K];if(W.type==="checkbox")W.checked=Boolean(E);else W.value=E===null||E===void 0?"":String(E)})})}),document.querySelectorAll("input").forEach((J)=>{if(J.type==="checkbox"||J.type==="radio")J.disabled=!0;else J.readOnly=!0}),document.querySelectorAll("textarea").forEach((J)=>{J.readOnly=!0}),document.querySelectorAll("select").forEach((J)=>{J.disabled=!0}),document.querySelectorAll(".form-toolbar button, .add-row-btn, .remove-row-btn").forEach((J)=>{J.disabled=!0})}function w8($){return document.getElementById($)}function UQ(){if(!w8("weba-l2-keywrap-tool"))return;let q=w8("kwp-recipient-sk"),J=w8("kwp-credential-id"),Q=w8("kwp-prf-salt"),G=w8("kwp-aad"),U=w8("kwp-kid"),X=w8("kwp-status"),Z=w8("kwp-output"),Y=w8("kwp-generate-salt"),N=w8("kwp-wrap");if(!q||!J||!Q||!X||!Z||!N)return;Y?.addEventListener("click",()=>{let W=new Uint8Array(32);crypto.getRandomValues(W),Q.value=N8(W)}),N.addEventListener("click",async()=>{X.textContent="Waiting for passkey...",N.disabled=!0;try{if(!q.value||!J.value||!Q.value)throw new Error("Missing required fields.");let W=t(q.value.trim()),K=t(Q.value.trim()),E=await Q$(J.value.trim(),K),R=G?.value?t(G.value.trim()):void 0,A=await sJ({recipientSk:W,prfKey:E,aad:R}),_={alg:"WebAuthn-PRF-AESGCM-v1",kid:U?.value||"issuer#passkey-1",credential_id:J.value.trim(),prf_salt:N8(K),wrapped_key:N8(A),...R?{aad:N8(R)}:{}};Z.textContent=JSON.stringify(_,null,2),X.textContent="Key wrap ready."}catch(W){console.error(W),X.textContent="Key wrap failed."}finally{N.disabled=!1}})}function YQ($){let q={},J=(Q,G)=>{if(Q===null||Q===void 0){q[G]=null;return}if(Array.isArray(Q)){Q.forEach((U,X)=>{J(U,G?`${G}[${X}]`:`[${X}]`)});return}if(typeof Q==="object"){Object.entries(Q).forEach(([U,X])=>{let Z=G?`${G}.${U}`:U;J(X,Z)});return}q[G]=Q};if(J($,""),""in q)delete q[""];return q}function $q($){let q={_filename:$.filename},J=new Set(["_filename"]);if($.includeJson)J.add("_json"),q._json=JSON.stringify($.plain);let Q=YQ($.plain||{});for(let G of Object.keys(Q)){if($.omitKey&&$.omitKey(G))continue;J.add(G),q[G]=Q[G]}if($.sig)J.add("_l2_sig"),q._l2_sig=JSON.stringify($.sig);return{row:q,keys:J}}function XQ($){if($===null||$===void 0)return"";let q=String($);if(/[",\\n]/.test(q))return`"${q.replace(/"/g,\'""\')}"`;return q}function ZQ($,q){let J=[];return J.push(q.map(XQ).join(",")),$.forEach((Q)=>{let G=q.map((U)=>XQ(Q[U])).join(",");J.push(G)}),"\\uFEFF"+J.join(`\n`)}function WQ($){if(typeof DOMParser!=="undefined")return new DOMParser().parseFromString($,"text/html");if(typeof document!=="undefined"){let q=document.implementation.createHTMLDocument("");return q.documentElement.innerHTML=$,q}return null}function MQ($,q){let J=WQ($);if(J)return J.getElementById(q)?.textContent??null;let Q=new RegExp(`<script[^>]*id=["\']${q}["\'][^>]*>([\\\\s\\\\S]*?)<\\\\/script>`,"i"),G=$.match(Q);return G?G[1]:null}function U9($){return $.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")}function X9($,q){let J=WQ($);if(J)return J.querySelector(`script[type="${q}"]`)?.textContent??null;let Q=new RegExp(`<script[^>]*type=["\']${U9(q)}["\'][^>]*>([\\\\s\\\\S]*?)<\\\\/script>`,"i"),G=$.match(Q);return G?G[1]:null}function NQ($){let q=MQ($,"data-layer");if(q)try{return JSON.parse(q)}catch{return null}let J=X9($,"application/ld+json");if(J)try{return JSON.parse(J)}catch{return null}return null}function OQ($){let q=MQ($,"weba-l2-envelope");if(!q)return null;try{return JSON.parse(q)}catch{return null}}function Y9($){if(!$.trim())return null;try{let q=JSON.parse($);if(!q.recipient_x25519_private&&!q.org_root_key)return null;return q}catch{return null}}function Z9(){let $=document.getElementById("weba-l2-keys");if(!$?.textContent)return null;return Y9($.textContent)}function W9(){let $=document.getElementById("weba-agg-spec");if(!$?.textContent)return null;try{let q=JSON.parse($.textContent);if(Array.isArray(q))return q[0]??null;return q}catch{return null}}function r8($,q){let J=q.trim().replace(/^\\$\\./,"");if(!J)return[];let Q=J.split("."),G=[$];for(let U of Q){let X=U.match(/^(.*)\\\\[(\\\\d*)\\\\]$/),Z=X?X[1]:U,Y=X?X[2]:null,N=X&&Y==="",W=X&&Y!==""?parseInt(Y,10):null,K=[];for(let E of G){if(E===null||E===void 0)continue;let R=Z?E[Z]:E;if(N){if(Array.isArray(R))K.push(...R);continue}if(W!==null){if(Array.isArray(R)&&R[W]!==void 0)K.push(R[W]);continue}if(R!==void 0)K.push(R)}G=K}return G}function X$($){if(typeof $==="number"&&Number.isFinite($))return $;if(typeof $==="string"&&$.trim()!==""){let q=Number($.replace(/,/g,""));return Number.isFinite(q)?q:null}return null}function M9($,q){let J=r8($,q.path);if(q.op==="exists")return J.length>0;let Q=J[0],G=q.value;if(q.op==="eq")return Q===G;if(q.op==="neq")return Q!==G;if(q.op==="in"&&Array.isArray(G))return G.includes(Q);let U=X$(Q),X=X$(G);if(U===null||X===null)return!1;if(q.op==="gt")return U>X;if(q.op==="gte")return U>=X;if(q.op==="lt")return U<X;if(q.op==="lte")return U<=X;return!1}function Jq($,q){if(!q)return $;let J=Array.isArray(q)?q:[q];return $.filter((Q)=>J.every((G)=>M9(Q,G)))}function KQ($,q){let J=Jq($,q.filter);if(q.op==="count"){if(q.path)return J.reduce((U,X)=>U+r8(X,q.path).length,0);return J.length}let G=(q.path?J.flatMap((U)=>r8(U,q.path)):J).map((U)=>X$(U)).filter((U)=>U!==null);if(G.length===0)return null;if(q.op==="sum")return G.reduce((U,X)=>U+X,0);if(q.op==="avg")return G.reduce((U,X)=>U+X,0)/G.length;if(q.op==="min")return Math.min(...G);if(q.op==="max")return Math.max(...G);return null}function qq($,q){if($===null)return"-";if(q==="currency")return new Intl.NumberFormat(void 0,{style:"currency",currency:"JPY"}).format($);if(q==="percent")return new Intl.NumberFormat(void 0,{style:"percent",maximumFractionDigits:1}).format($);return new Intl.NumberFormat().format($)}function A0($,q){return qq($,q)}function DQ($,q){if(!q)return $;let J=[];for(let Q of $){let G=r8(Q,q);for(let U of G)if(Array.isArray(U))J.push(...U);else if(U!==void 0&&U!==null)J.push(U)}return J}function N9($,q){let J=DQ($,q.source),Q=Jq(J,q.filter),G=new Map;for(let X of Q){let Z=r8(X,q.x);if(Z.length===0)continue;for(let Y of Z){let N=Y===void 0||Y===null||Y===""?"Unknown":String(Y);G.set(N,(G.get(N)||0)+1)}}let U=Array.from(G.entries()).map(([X,Z])=>({label:X,value:Z}));if(q.sort){let X=q.sort.order==="asc"?1:-1;U.sort((Z,Y)=>{if(q.sort?.by==="label")return Z.label.localeCompare(Y.label)*X;return(Z.value-Y.value)*X})}if(q.limit)U=U.slice(0,q.limit);return U}function O9($,q){let J=DQ($,q.source),Q=Jq(J,q.filter),G=[];for(let K of Q){let E=r8(K,q.value);for(let R of E){let A=X$(R);if(A!==null)G.push(A)}}if(G.length===0||q.bin<=0)return[];let U=q.min??0,X=q.max??Math.max(...G),Z=new Map,Y=0;for(let K of G){if(q.max!==void 0&&K>q.max){Y+=1;continue}let E=Math.max(0,Math.floor((K-U)/q.bin)),R=U+E*q.bin;Z.set(R,(Z.get(R)||0)+1)}let N=[],W=Math.max(1,Math.ceil((X-U+1)/q.bin));for(let K=0;K<W;K+=1){let E=U+K*q.bin,R=E+q.bin-1,A=`${A0(E,q.format)} - ${A0(R,q.format)}`;N.push({label:A,value:Z.get(E)||0})}if(Y>0&&q.max!==void 0)N.push({label:`${A0(q.max,q.format)}+`,value:Y});return N}function K9($,q){if(q.length===0)return"";let J=Math.max(...q.map((U)=>U.value)),Q=$.title?`<div class="agg-chart-title">${$.title}</div>`:"",G=q.map((U)=>{let X=J>0?U.value/J*100:0,Z=A0(U.value,$.format);return`<div class="agg-bar"><div class="agg-bar-label">${U.label}</div><div class="agg-bar-track"><div class="agg-bar-fill" style="width:${X}%"></div></div><div class="agg-bar-value">${Z}</div></div>`}).join("");return`<div class="agg-chart">${Q}<div class="agg-bar-list">${G}</div></div>`}function z9($,q){if(q.length===0)return"";let J=Math.max(...q.map((U)=>U.value)),Q=$.title?`<div class="agg-chart-title">${$.title}</div>`:"",G=q.map((U)=>{let X=J>0?U.value/J*100:0,Z=A0(U.value,$.format);return`<div class="agg-bar"><div class="agg-bar-label">${U.label}</div><div class="agg-bar-track"><div class="agg-bar-fill" style="width:${X}%"></div></div><div class="agg-bar-value">${Z}</div></div>`}).join("");return`<div class="agg-chart">${Q}<div class="agg-bar-list">${G}</div></div>`}function zQ($,q,J){if(!q?.dashboard||J.length===0){$.innerHTML="";return}let Q=J.map((W)=>W.plain),G=q.dashboard.title?`<div class="agg-dashboard-title">${q.dashboard.title}</div>`:"",U=(q.dashboard.cards||[]).map((W)=>{let K=KQ(Q,W),E=qq(K,W.format);return`<div class="agg-card"><div class="agg-card-label">${W.label}</div><div class="agg-card-value">${E}</div></div>`}).join(""),X=U?`<div class="agg-card-grid">${U}</div>`:"",Z=(q.dashboard.charts||[]).map((W)=>{if(W.type==="bar"){let K=N9(Q,W);return K9(W,K)}if(W.type==="hist"){let K=O9(Q,W);return z9(W,K)}return""}).filter(Boolean).join(""),Y=Z?`<div class="agg-chart-grid">${Z}</div>`:"",N=(q.dashboard.tables||[]).map((W)=>{let K=new Map;for(let C of Q){let D=r8(C,W.group_by)[0],F=D===void 0||D===null||D===""?"Unknown":String(D);if(!K.has(F))K.set(F,[]);K.get(F).push(C)}let E=Array.from(K.entries()).map(([C,D])=>{let F={};return W.metrics.forEach((f)=>{let k=KQ(D,f);F[f.id]=qq(k,f.format)}),{groupKey:C,metricValues:F}});if(W.sort){let C=W.sort.order==="asc"?1:-1;E.sort((D,F)=>{let f=D.metricValues[W.sort.by],k=F.metricValues[W.sort.by];if(f===k)return 0;return f>k?C:-C})}let R=W.limit?E.slice(0,W.limit):E,_=["Group",...W.metrics.map((C)=>C.label||C.id)].map((C)=>`<th>${C}</th>`).join(""),L=R.map((C)=>{return`<tr>${[`<td>${C.groupKey}</td>`,...W.metrics.map((F)=>`<td>${C.metricValues[F.id]}</td>`)].join("")}</tr>`}).join("");return`<div class="agg-dashboard-table">${W.label?`<div class="agg-table-title">${W.label}</div>`:""}<table class="agg-table"><thead><tr>${_}</tr></thead><tbody>${L}</tbody></table></div>`}).join("");$.innerHTML=`${G}${X}${Y}${N}`}async function D9($,q){let J=OQ($);if(J){let G=null;if(q){if(q.recipient_kid&&J.layer2?.recipient&&q.recipient_kid!==J.layer2.recipient)throw new Error(`recipient_kid mismatch (${J.layer2.recipient})`);if(q.org_root_key){let Z=q.org_campaign_id||J.meta?.campaign_id;if(!Z)throw new Error("org_campaign_id is required for org_root_key");G=iJ({orgRootKey:t(q.org_root_key),campaignId:Z,layer1Ref:J.layer1_ref,keyPolicy:q.org_key_policy||J.meta?.key_policy}).privateKey}else if(q.recipient_x25519_private)G=t(q.recipient_x25519_private)}if(!G){if(!q)throw new Error("No recipient key provided and not a demo campaign");throw new Error("No recipient key provided")}let U=q?.recipient_pqc_private&&q?.recipient_pqc_kem==="ML-KEM-768"?{pqcProvider:globalThis.webaPqcKem??null,pqcRecipientSk:t(q.recipient_pqc_private)}:void 0,X=await U$(J,G,U);return{plain:X.layer2_plain??X,sig:X.layer2_sig,source:"l2"}}let Q=NQ($);if(Q)return{plain:Q,source:"jsonld"};return{source:null}}function E9($,q,J){if(q.length===0){$.innerHTML=\'<div class="agg-empty">No rows to display.</div>\';return}let Q=J.map((U)=>`<th>${U}</th>`).join(""),G=q.slice(0,20).map((U)=>{return`<tr>${J.map((Z)=>`<td>${U[Z]??""}</td>`).join("")}</tr>`}).join("");$.innerHTML=`<table class="agg-table"><thead><tr>${Q}</tr></thead><tbody>${G}</tbody></table>`}function EQ(){let $=document.getElementById("aggregator-root");if(!$)return;$.innerHTML=`\n    <div class="agg-panel">\n      <div class="agg-row">\n        <label class="agg-label">Input HTML</label>\n        <input id="weba-agg-files" type="file" accept=".html" multiple />\n      </div>\n      <div class="agg-row">\n        <label class="agg-label">L2 Key (embedded)</label>\n        <div id="weba-agg-key-status" class="agg-chip">Not loaded</div>\n        <div class="agg-note">Use <code>&lt;script id="weba-l2-keys"&gt;</code> to embed.</div>\n      </div>\n      <div class="agg-row">\n        <button id="weba-agg-passkey" class="agg-btn secondary">\\uD83D\\uDD11 Decrypt with Passkey</button>\n      </div>\n      <div class="agg-row">\n        <label class="agg-label">Include JSON</label>\n        <input id="weba-agg-include-json" type="checkbox" />\n      </div>\n      <div class="agg-row">\n        <button id="weba-agg-run" class="agg-btn">Decrypt & Aggregate</button>\n        <button id="weba-agg-download" class="agg-btn secondary" disabled>Download CSV</button>\n        <button id="weba-agg-download-jsonl" class="agg-btn secondary" disabled>Download JSONL</button>\n      </div>\n      <div id="weba-agg-status" class="agg-status">Ready.</div>\n    </div>\n    <div id="weba-agg-dashboard" class="agg-dashboard"></div>\n    <div id="weba-agg-output" class="agg-output"></div>\n  `;let q=$.querySelector("#weba-agg-files"),J=$.querySelector("#weba-agg-status"),Q=$.querySelector("#weba-agg-output"),G=$.querySelector("#weba-agg-dashboard"),U=$.querySelector("#weba-agg-include-json"),X=$.querySelector("#weba-agg-run"),Z=$.querySelector("#weba-agg-download"),Y=$.querySelector("#weba-agg-download-jsonl"),N=$.querySelector("#weba-agg-key-status"),W=$.querySelector("#weba-agg-passkey"),K="",E="",R=[],A=null,_=Z9(),L=W9(),j=Array.isArray(L?.samples)?L.samples.map((D,F)=>({filename:`sample-${F+1}.json`,plain:D})):[];if(N)N.textContent=_?.recipient_kid?`Loaded (${_.recipient_kid})`:_?"Loaded":"Not loaded",N.classList.toggle("ready",!!_);if(L?.export?.jsonl===!1&&Y)Y.disabled=!0;W?.addEventListener("click",async()=>{try{if(!prompt("User Name for Passkey:","demo-user"))return;alert("Please authenticate with your Passkey to decrypt.");let F=new Uint8Array(32),f=new Uint8Array(32),k=await navigator.credentials.get({publicKey:{challenge:F,userVerification:"required",extensions:{prf:{eval:{first:f}}}}});if(!k)throw new Error("No credential found.");let w=k.getClientExtensionResults()?.prf?.results?.first;if(!w)throw new Error("PRF not supported or enabled on this key.");let P=new Uint8Array(w),x=oJ(P);A={recipient_x25519_private:N8(x.privateKey)},W.textContent="✅ Passkey Loaded",W.disabled=!0}catch(D){console.error(D),alert("Passkey error: "+D.message)}});let C=async()=>{if((!q?.files||q.files.length===0)&&j.length===0){if(J)J.textContent="Select HTML files first.";return}if(J)J.textContent="Processing...";if(Z)Z.disabled=!0;if(Y)Y.disabled=!0;let D=[],F=new Set(["_filename"]),f=0,k=0;R=[...j];let y=A||_;if(q?.files)for(let x of Array.from(q.files))try{let g=await x.text(),u=await D9(g,y);if(u.source==="l2"&&u.plain){R.push({filename:x.name,plain:u.plain,sig:u.sig});let O=$q({plain:u.plain,filename:x.name,includeJson:U?.checked,sig:u.sig});O.keys.forEach((T)=>F.add(T)),D.push(O.row),f+=1;continue}if(u.source==="jsonld"&&u.plain){R.push({filename:x.name,plain:u.plain});let O=$q({plain:u.plain,filename:x.name,includeJson:U?.checked,omitKey:(T)=>T.startsWith("@")});O.keys.forEach((T)=>F.add(T)),D.push(O.row),f+=1;continue}k+=1}catch(g){console.error(g),k+=1}let w=Array.from(F).sort((x,g)=>{if(x==="_filename")return-1;if(g==="_filename")return 1;return x.localeCompare(g)});if(K=ZQ(D,w),Z)Z.disabled=D.length===0;let P=L?.export?.jsonl!==!1;if(E=R.map((x)=>JSON.stringify({_filename:x.filename,_l2_sig:x.sig??null,...x.plain})).join(`\n`),Y)Y.disabled=R.length===0||!P;if(J)J.textContent=`Processed ${f} files. Errors: ${k}.`;if(G)zQ(G,L,R);if(Q)E9(Q,D,w)};if(j.length>0){if(R=[...j],E=R.map((D)=>JSON.stringify({_filename:D.filename,_l2_sig:D.sig??null,...D.plain})).join(`\n`),G)zQ(G,L,R);if(Y)Y.disabled=E.length===0||L?.export?.jsonl===!1;if(J)J.textContent=`Loaded ${j.length} sample records.`}X?.addEventListener("click",()=>{C().catch((D)=>{if(J)J.textContent="Failed to aggregate.";console.error(D)})}),Z?.addEventListener("click",()=>{if(!K)return;let D=new Blob([K],{type:"text/csv"}),F=URL.createObjectURL(D),f=document.createElement("a");f.href=F,f.download="weba-aggregated.csv",f.click(),URL.revokeObjectURL(F)}),Y?.addEventListener("click",()=>{if(!E)return;let D=new Blob([E],{type:"application/json"}),F=URL.createObjectURL(D),f=document.createElement("a");f.href=F,f.download="weba-aggregated.jsonl",f.click(),URL.revokeObjectURL(F)})}function CQ(){console.log("Web/A Runtime Booting...");let $=new E$,q=new t$,J=new e$($,q),Q=window,G=document.getElementById("weba-structure");if(G?.textContent)try{Q.generatedJsonStructure=JSON.parse(G.textContent)}catch(Z){console.warn("Failed to parse weba structure JSON",Z)}let U=$Q();if(U)Q.webaL2Config=U;Q.saveDraft=()=>q.saveDraft(),Q.submitDocument=()=>q.submitDocument(),Q.signAndDownload=()=>q.signAndDownload(),Q.clearData=()=>q.clearData(),Q.removeTableRow=(Z)=>J.removeTableRow(Z),Q.addTableRow=(Z,Y)=>J.addTableRow(Z,Y),Q.switchTab=(Z,Y)=>J.switchTab(Z,Y),Q.recalculate=()=>$.recalculate(),Q.escapeHtml=(Z)=>{if(!Z)return"";let Y={"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"};return Z.toString().replace(/[&<>"\']/g,(N)=>Y[N]||N)},q.restoreFromLS(),J.applyI18n(),J.initTables(),$.recalculate(),GQ(),UQ(),EQ();let X;document.addEventListener("input",(Z)=>{let Y=Z.target;if(Z.isTrusted)Y.dataset.dirty="true";let N=Y.dataset.baseKey||Y.dataset.jsonPath;if(N)(Y.closest("tr")||document).querySelectorAll(`[data-copy-from="${N}"]`).forEach((E)=>{if(!E.dataset.dirty){if(E.value!==Y.value)E.value=Y.value,E.dispatchEvent(new Event("input"))}});$.recalculate(),q.updateJsonLd(),clearTimeout(X),X=setTimeout(()=>q.saveToLS(),1000)}),console.log("Web/A Runtime Ready.")}class Qq{suggestionsVisible=!1;activeSearchInput=null;globalBox=null;constructor(){}init(){console.log("Initializing Search Engine (Bundle)...");let $=window;if($.generatedJsonStructure&&$.generatedJsonStructure.masterData){let q=Object.keys($.generatedJsonStructure.masterData);console.log("Master Data Keys available:",q.join(", "))}this.setupEventDelegation()}normalize($){if(!$)return"";let q=$.toString().toLowerCase();return q=q.replace(/[Ａ-Ｚａ-ｚ０-９]/g,(J)=>{return String.fromCharCode(J.charCodeAt(0)-65248)}),q=q.replace(/[！-～]/g,(J)=>String.fromCharCode(J.charCodeAt(0)-65248)),q.trim()}clean($){if(!$)return"";let q=this.normalize($);return q=q.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g,""),q=q.replace(/(\\(株\\)|\\(有\\)|\\(同\\))/g,""),q.trim()}toIndex($){let q=parseInt($||"",10);return Number.isFinite(q)?q-1:-1}getGlobalBox(){if(!this.globalBox){if(this.globalBox=document.getElementById("web-a-search-suggestions"),!this.globalBox)this.globalBox=document.createElement("div"),this.globalBox.id="web-a-search-suggestions",this.globalBox.className="search-suggestions",Object.assign(this.globalBox.style,{display:"none",position:"absolute",background:"white",border:"1px solid #ccc",boxShadow:"0 4px 6px rgba(0,0,0,0.1)",zIndex:"9999",maxHeight:"200px",overflowY:"auto",borderRadius:"4px"}),document.body.appendChild(this.globalBox)}return this.globalBox}hideSuggestions(){let $=this.getGlobalBox();if($)$.style.display="none";this.suggestionsVisible=!1,this.activeSearchInput=null}setupEventDelegation(){document.addEventListener("click",($)=>{if(this.suggestionsVisible&&!$.target.closest("#web-a-search-suggestions")&&$.target!==this.activeSearchInput)this.hideSuggestions()}),document.addEventListener("scroll",()=>{if(this.suggestionsVisible)this.hideSuggestions()},!0),document.body.addEventListener("input",($)=>{if($.target.classList.contains("search-input"))this.handleSearchInput($.target)}),document.body.addEventListener("click",($)=>{if($.target.classList.contains("suggestion-item"))this.handleSelection($.target)})}handleSearchInput($){this.activeSearchInput=$;let q=window,J=$.dataset.masterSrc,Q=$.dataset.suggestSource;if(!J&&!Q)return;let G=this.toIndex($.dataset.masterLabelIndex),U=this.toIndex($.dataset.masterValueIndex),X=$.value;if(!X){this.hideSuggestions();return}let Z=[],Y=this.normalize(X);if(Q==="column"){let N=$.dataset.baseKey,W=$.closest("table");if(W&&N){let K=new Set;W.querySelectorAll(`[data-base-key="${N}"]`).forEach((E)=>{if(E===$)return;let R=E.value;if(R&&this.normalize(R).includes(Y)){if(!K.has(R))K.add(R),Z.push({val:R,row:[R],label:R,score:10})}})}}else if(J){let N=q.generatedJsonStructure.masterData;if(!N||!N[J])return;N[J].forEach((K,E)=>{if(E===0)return;if(K.some((A)=>this.normalize(A||"").includes(Y))){let A=G>=0?K[G]||"":"",_=U>=0?K[U]||"":"",L=U>=0?_:G>=0?A:K[1]||K[0]||"";Z.push({val:L,row:K,label:A,score:10,idx:E})}})}this.renderSuggestions($,Z,G)}renderSuggestions($,q,J){if(q.length===0){this.hideSuggestions();return}let Q=window,G=q.slice(0,10),U="";G.forEach((W)=>{let K=Q.escapeHtml(JSON.stringify(W.row)),E=J>=0?W.label||W.row.join(" : "):W.row.join(" : ");U+=`<div class="suggestion-item" data-val="${Q.escapeHtml(W.val)}" data-row="${K}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${Q.escapeHtml(E)}</div>`});let X=this.getGlobalBox();X.innerHTML=U;let Z=$.getBoundingClientRect(),Y=window.scrollY||document.documentElement.scrollTop,N=window.scrollX||document.documentElement.scrollLeft;X.style.width=Math.max(Z.width,200)+"px",X.style.left=Z.left+N+"px",X.style.top=Z.bottom+Y+"px",X.querySelectorAll(".suggestion-item").forEach((W)=>{W.onmouseenter=()=>W.style.background="#f0f8ff",W.onmouseleave=()=>W.style.background="white"}),X.style.display="block",this.suggestionsVisible=!0}handleSelection($){if(!this.activeSearchInput)return;let q=window,J=this.activeSearchInput,Q=$.dataset.val||"",G=$.dataset.row||"[]";try{let U=JSON.parse(G),X=J.dataset.masterSrc,Z=X?q.generatedJsonStructure.masterData[X][0]:[],Y=!1;if(Z.length>0&&U.length>0){let N=J.closest("tr");if(N){let W=Array.from(N.querySelectorAll("input, select, textarea"));Z.forEach((K,E)=>{if(!K)return;let R=U[E];this.fillField(W,K,R,J,()=>{Y=!0})})}}if(!Y)J.value=Q,J.dispatchEvent(new Event("input",{bubbles:!0}))}catch(U){console.error(U)}this.hideSuggestions()}fillField($,q,J,Q,G){let U=this.normalize(q),X=$.find((Z)=>{let Y=Z.dataset.baseKey||Z.dataset.jsonPath,N=this.normalize(Z.getAttribute("placeholder")||"");return Y&&this.normalize(Y)===U||N===U});if(X){if(X.value=J||"",X.dispatchEvent(new Event("input",{bubbles:!0})),X===Q)G()}}}var C9=BigInt(0),B0=BigInt(1),R9=BigInt(2),H9=BigInt(7),L9=BigInt(256),I9=BigInt(113),LQ=[],IQ=[],TQ=[];for(let $=0,q=B0,J=1,Q=0;$<24;$++){[J,Q]=[Q,(2*J+3*Q)%5],LQ.push(2*(5*Q+J)),IQ.push(($+1)*($+2)/2%64);let G=C9;for(let U=0;U<7;U++)if(q=(q<<B0^(q>>H9)*I9)%L9,q&R9)G^=B0<<(B0<<BigInt(U))-B0;TQ.push(G)}var AQ=k0(TQ,!0),T9=AQ[0],A9=AQ[1],RQ=($,q,J)=>J>32?Fq($,q,J):jq($,q,J),HQ=($,q,J)=>J>32?fq($,q,J):Pq($,q,J);function B9($,q=24){let J=new Uint32Array(10);for(let Q=24-q;Q<24;Q++){for(let X=0;X<10;X++)J[X]=$[X]^$[X+10]^$[X+20]^$[X+30]^$[X+40];for(let X=0;X<10;X+=2){let Z=(X+8)%10,Y=(X+2)%10,N=J[Y],W=J[Y+1],K=RQ(N,W,1)^J[Z],E=HQ(N,W,1)^J[Z+1];for(let R=0;R<50;R+=10)$[X+R]^=K,$[X+R+1]^=E}let G=$[2],U=$[3];for(let X=0;X<24;X++){let Z=IQ[X],Y=RQ(G,U,Z),N=HQ(G,U,Z),W=LQ[X];G=$[W],U=$[W+1],$[W]=Y,$[W+1]=N}for(let X=0;X<50;X+=10){for(let Z=0;Z<10;Z++)J[Z]=$[X+Z];for(let Z=0;Z<10;Z++)$[X+Z]^=~J[(Z+2)%10]&J[(Z+4)%10]}$[0]^=T9[Q],$[1]^=A9[Q]}O8(J)}class Y${state;pos=0;posOut=0;finished=!1;state32;destroyed=!1;blockLen;suffix;outputLen;enableXOF=!1;rounds;constructor($,q,J,Q=!1,G=24){if(this.blockLen=$,this.suffix=q,this.outputLen=J,this.enableXOF=Q,this.rounds=G,z8(J,"outputLen"),!(0<$&&$<200))throw new Error("only keccak-f1600 function is supported");this.state=new Uint8Array(200),this.state32=f0(this.state)}clone(){return this._cloneInto()}keccak(){C$(this.state32),B9(this.state32,this.rounds),C$(this.state32),this.posOut=0,this.pos=0}update($){j8(this),p($);let{blockLen:q,state:J}=this,Q=$.length;for(let G=0;G<Q;){let U=Math.min(q-this.pos,Q-G);for(let X=0;X<U;X++)J[this.pos++]^=$[G++];if(this.pos===q)this.keccak()}return this}finish(){if(this.finished)return;this.finished=!0;let{state:$,suffix:q,pos:J,blockLen:Q}=this;if($[J]^=q,(q&128)!==0&&J===Q-1)this.keccak();$[Q-1]^=128,this.keccak()}writeInto($){j8(this,!1),p($),this.finish();let q=this.state,{blockLen:J}=this;for(let Q=0,G=$.length;Q<G;){if(this.posOut>=J)this.keccak();let U=Math.min(J-this.posOut,G-Q);$.set(q.subarray(this.posOut,this.posOut+U),Q),this.posOut+=U,Q+=U}return $}xofInto($){if(!this.enableXOF)throw new Error("XOF is not possible for this instance");return this.writeInto($)}xof($){return z8($),this.xofInto(new Uint8Array($))}digestInto($){if(F0($,this),this.finished)throw new Error("digest() was already called");return this.writeInto($),this.destroy(),$}digest(){return this.digestInto(new Uint8Array(this.outputLen))}destroy(){this.destroyed=!0,O8(this.state)}_cloneInto($){let{blockLen:q,suffix:J,outputLen:Q,rounds:G,enableXOF:U}=this;return $||=new Y$(q,J,Q,U,G),$.state32.set(this.state32),$.pos=this.pos,$.posOut=this.posOut,$.finished=this.finished,$.rounds=G,$.suffix=J,$.outputLen=Q,$.enableXOF=U,$.destroyed=this.destroyed,$}}var BQ=($,q,J,Q={})=>$0(()=>new Y$(q,$,J),Q);var wQ=BQ(6,136,32,_8(8));var VQ=BQ(6,72,64,_8(10));var jQ=($,q,J,Q={})=>$0((G={})=>new Y$(q,$,G.dkLen===void 0?J:G.dkLen,!0),Q),PQ=jQ(31,168,16,_8(11)),Z$=jQ(31,136,32,_8(12));function Gq($){if(!Number.isSafeInteger($)||$<0||$>4294967295)throw new Error("wrong u32 integer:"+$);return $}function fQ($){return Gq($),($&$-1)===0&&$!==0}function Uq($,q){Gq($);let J=0;for(let Q=0;Q<q;Q++,$>>>=1)J=J<<1|$&1;return J}function xQ($){return Gq($),31-Math.clz32($)}function FQ($){let q=$.length;if(q<2||!fQ(q))throw new Error("n must be a power of 2 and greater than 1. Got "+q);let J=xQ(q);for(let Q=0;Q<q;Q++){let G=Uq(Q,J);if(Q<G){let U=$[Q];$[Q]=$[G],$[G]=U}}return $}var Xq=($,q)=>{let{N:J,roots:Q,dit:G,invertButterflies:U=!1,skipStages:X=0,brp:Z=!0}=q,Y=xQ(J);if(!fQ(J))throw new Error("FFT: Polynomial size should be power of two");let N=G!==U;return(W)=>{if(W.length!==J)throw new Error("FFT: wrong Polynomial length");if(G&&Z)FQ(W);for(let K=0,E=1;K<Y-X;K++){let R=G?K+1+X:Y-K,A=1<<R,_=A>>1,L=J>>R;for(let j=0;j<J;j+=A)for(let C=0,D=E++;C<_;C++){let F=U?G?J-D:D:C*L,f=j+C,k=j+C+_,y=Q[F],w=W[k],P=W[f];if(N){let x=$.mul(w,y);W[f]=$.add(P,x),W[k]=$.sub(P,x)}else if(U)W[f]=$.add(w,P),W[k]=$.mul($.sub(w,P),y);else W[f]=$.add(P,w),W[k]=$.mul($.sub(P,w),y)}}if(!G&&Z)FQ(W);return W}};/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var Yq=p8;function W$($,q){if($.length!==q.length)return!1;let J=0;for(let Q=0;Q<$.length;Q++)J|=$[Q]^q[Q];return J===0}function SQ($){return Uint8Array.from($)}function w0($,...q){let J=(G)=>typeof G==="number"?G:G.bytesLen,Q=q.reduce((G,U)=>G+J(U),0);return{bytesLen:Q,encode:(G)=>{let U=new Uint8Array(Q);for(let X=0,Z=0;X<q.length;X++){let Y=q[X],N=J(Y),W=typeof Y==="number"?G[X]:Y.encode(G[X]);if(p(W,N,$),U.set(W,Z),typeof Y!=="number")W.fill(0);Z+=N}return U},decode:(G)=>{p(G,Q,$);let U=[];for(let X of q){let Z=J(X),Y=G.subarray(0,Z);U.push(typeof X==="number"?Y:X.decode(Y)),G=G.subarray(Z)}return U}}}function M$($,q){let J=q*$.bytesLen;return{bytesLen:J,encode:(Q)=>{if(Q.length!==q)throw new Error(`vecCoder.encode: wrong length=${Q.length}. Expected: ${q}`);let G=new Uint8Array(J);for(let U=0,X=0;U<Q.length;U++){let Z=$.encode(Q[U]);G.set(Z,X),Z.fill(0),X+=Z.length}return G},decode:(Q)=>{p(Q,J);let G=[];for(let U=0;U<Q.length;U+=$.bytesLen)G.push($.decode(Q.subarray(U,U+$.bytesLen)));return G}}}function H8(...$){for(let q of $)if(Array.isArray(q))for(let J of q)J.fill(0);else q.fill(0)}function Zq($){return(1<<$)-1}var fU=Uint8Array.of();/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var _Q=($)=>{let{newPoly:q,N:J,Q,F:G,ROOT_OF_UNITY:U,brvBits:X,isKyber:Z}=$,Y=(C,D=Q)=>{let F=C%D|0;return(F>=0?F|0:D+F|0)|0},N=(C,D=Q)=>{let F=Y(C,D)|0;return(F>D>>1?F-D|0:F)|0};function W(){let C=q(J);for(let D=0;D<J;D++){let F=Uq(D,X),f=BigInt(U)**BigInt(F)%BigInt(Q);C[D]=Number(f)|0}return C}let K=W(),E={add:(C,D)=>Y((C|0)+(D|0))|0,sub:(C,D)=>Y((C|0)-(D|0))|0,mul:(C,D)=>Y((C|0)*(D|0))|0,inv:(C)=>{throw new Error("not implemented")}},R={N:J,roots:K,invertButterflies:!0,skipStages:Z?1:0,brp:!1},A=Xq(E,{dit:!1,...R}),_=Xq(E,{dit:!0,...R});return{mod:Y,smod:N,nttZetas:K,NTT:{encode:(C)=>{return A(C)},decode:(C)=>{_(C);for(let D=0;D<C.length;D++)C[D]=Y(G*C[D]);return C}},bitsCoder:(C,D)=>{let F=Zq(C),f=C*(J/8);return{bytesLen:f,encode:(k)=>{let y=new Uint8Array(f);for(let w=0,P=0,x=0,g=0;w<k.length;w++){P|=(D.encode(k[w])&F)<<x,x+=C;for(;x>=8;x-=8,P>>=8)y[g++]=P&Zq(x)}return y},decode:(k)=>{let y=q(J);for(let w=0,P=0,x=0,g=0;w<k.length;w++){P|=k[w]<<x,x+=8;for(;x>=C;x-=C,P>>=C)y[g++]=D.decode(P&F)}return y}}}}},w9=($)=>(q,J)=>{if(!J)J=$.blockLen;let Q=new Uint8Array(q.length+2);Q.set(q);let G=q.length,U=new Uint8Array(J),X=$.create({}),Z=0,Y=0;return{stats:()=>({calls:Z,xofs:Y}),get:(N,W)=>{return Q[G+0]=N,Q[G+1]=W,X.destroy(),X=$.create({}).update(Q),Z++,()=>{return Y++,X.xofInto(U)}},clean:()=>{X.destroy(),H8(U,Q)}}},kQ=w9(PQ);/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var X8=256,S8=3329,V9=3303,j9=17,{mod:P0,nttZetas:P9,NTT:a8,bitsCoder:F9}=_Q({N:X8,Q:S8,F:V9,ROOT_OF_UNITY:j9,newPoly:($)=>new Uint16Array($),brvBits:7,isKyber:!0}),Wq={512:{N:X8,Q:S8,K:2,ETA1:3,ETA2:2,du:10,dv:4,RBGstrength:128},768:{N:X8,Q:S8,K:3,ETA1:2,ETA2:2,du:10,dv:4,RBGstrength:192},1024:{N:X8,Q:S8,K:4,ETA1:2,ETA2:2,du:11,dv:5,RBGstrength:256}},f9=($)=>{if($>=12)return{encode:(J)=>J,decode:(J)=>J};let q=2**($-1);return{encode:(J)=>((J<<$)+S8/2)/S8,decode:(J)=>J*S8+q>>>$}},V0=($)=>F9($,f9($));function s8($,q){for(let J=0;J<X8;J++)$[J]=P0($[J]+q[J])}function x9($,q){for(let J=0;J<X8;J++)$[J]=P0($[J]-q[J])}function S9($,q,J,Q,G){let U=P0(q*Q*G+$*J),X=P0($*Q+q*J);return{c0:U,c1:X}}function N$($,q){for(let J=0;J<X8/2;J++){let Q=P9[64+(J>>1)];if(J&1)Q=-Q;let{c0:G,c1:U}=S9($[2*J+0],$[2*J+1],q[2*J+0],q[2*J+1],Q);$[2*J+0]=G,$[2*J+1]=U}return $}function vQ($){let q=new Uint16Array(X8);for(let J=0;J<X8;){let Q=$();if(Q.length%3)throw new Error("SampleNTT: unaligned block");for(let G=0;J<X8&&G+3<=Q.length;G+=3){let U=(Q[G+0]>>0|Q[G+1]<<8)&4095,X=(Q[G+1]>>4|Q[G+2]<<4)&4095;if(U<S8)q[J++]=U;if(J<X8&&X<S8)q[J++]=X}}return q}function j0($,q,J,Q){let G=$(Q*X8/4,q,J),U=new Uint16Array(X8),X=f0(G),Z=0;for(let Y=0,N=0,W=0,K=0;Y<X.length;Y++){let E=X[Y];for(let R=0;R<32;R++)if(W+=E&1,E>>=1,Z+=1,Z===Q)K=W,W=0;else if(Z===2*Q)U[N++]=P0(K-W),W=0,Z=0}if(Z)throw new Error(`sampleCBD: leftover bits: ${Z}`);return U}var _9=($)=>{let{K:q,PRF:J,XOF:Q,HASH512:G,ETA1:U,ETA2:X,du:Z,dv:Y}=$,N=V0(1),W=V0(Y),K=V0(Z),E=w0("publicKey",M$(V0(12),q),32),R=M$(V0(12),q),A=w0("ciphertext",M$(K,q),W),_=w0("seed",32,32);return{secretCoder:R,lengths:{secretKey:R.bytesLen,publicKey:E.bytesLen,cipherText:A.bytesLen},keygen:(L)=>{p(L,32,"seed");let j=new Uint8Array(33);j.set(L),j[32]=q;let C=G(j),[D,F]=_.decode(C),f=[],k=[];for(let P=0;P<q;P++)f.push(a8.encode(j0(J,F,P,U)));let y=Q(D);for(let P=0;P<q;P++){let x=a8.encode(j0(J,F,q+P,U));for(let g=0;g<q;g++){let u=vQ(y.get(g,P));s8(x,N$(u,f[g]))}k.push(x)}y.clean();let w={publicKey:E.encode([k,D]),secretKey:R.encode(f)};return H8(D,F,f,k,j,C),w},encrypt:(L,j,C)=>{let[D,F]=E.decode(L),f=[];for(let g=0;g<q;g++)f.push(a8.encode(j0(J,C,g,U)));let k=Q(F),y=new Uint16Array(X8),w=[];for(let g=0;g<q;g++){let u=j0(J,C,q+g,X),O=new Uint16Array(X8);for(let T=0;T<q;T++){let H=vQ(k.get(g,T));s8(O,N$(H,f[T]))}s8(u,a8.decode(O)),w.push(u),s8(y,N$(D[g],f[g])),H8(O)}k.clean();let P=j0(J,C,2*q,X);s8(P,a8.decode(y));let x=N.decode(j);return s8(x,P),H8(D,f,y,P),A.encode([w,x])},decrypt:(L,j)=>{let[C,D]=A.decode(L),F=R.decode(j),f=new Uint16Array(X8);for(let k=0;k<q;k++)s8(f,N$(F[k],a8.encode(C[k])));return x9(D,a8.decode(f)),H8(f,F,C),N.encode(D)}}};function Mq($){let q=_9($),{HASH256:J,HASH512:Q,KDF:G}=$,{secretCoder:U,lengths:X}=q,Z=w0("secretKey",X.secretKey,X.publicKey,32,32),Y=32,N=64;return{info:{type:"ml-kem"},lengths:{...X,seed:64,msg:32,msgRand:32,secretKey:Z.bytesLen},keygen:(W=Yq(64))=>{p(W,64,"seed");let{publicKey:K,secretKey:E}=q.keygen(W.subarray(0,32)),R=J(K),A=Z.encode([E,K,R,W.subarray(32)]);return H8(E,R),{publicKey:K,secretKey:A}},getPublicKey:(W)=>{let[K,E,R,A]=Z.decode(W);return Uint8Array.from(E)},encapsulate:(W,K=Yq(32))=>{p(W,X.publicKey,"publicKey"),p(K,32,"message");let E=W.subarray(0,384*$.K),R=U.encode(U.decode(SQ(E)));if(!W$(R,E))throw H8(R),new Error("ML-KEM.encapsulate: wrong publicKey modulus");H8(R);let A=Q.create().update(K).update(J(W)).digest(),_=q.encrypt(W,K,A.subarray(32,64));return H8(A.subarray(32)),{cipherText:_,sharedSecret:A.subarray(0,32)}},decapsulate:(W,K)=>{p(K,Z.bytesLen,"secretKey"),p(W,X.cipherText,"cipherText");let E=Z.bytesLen-96,R=E+32,A=J(K.subarray(E/2,R));if(!W$(A,K.subarray(R,R+32)))throw new Error("invalid secretKey: hash check failed");let[_,L,j,C]=Z.decode(K),D=q.decrypt(W,_),F=Q.create().update(D).update(j).digest(),f=F.subarray(0,32),k=q.encrypt(L,D,F.subarray(32,64)),y=W$(W,k),w=G.create({dkLen:32}).update(C).update(W).digest();return H8(D,k,!y?f:w),y?f:w}}}function k9($,q,J){return Z$.create({dkLen:$}).update(q).update(new Uint8Array([J])).digest()}var Nq={HASH256:wQ,HASH512:VQ,KDF:Z$,XOF:kQ,PRF:k9},pU=Mq({...Nq,...Wq[512]}),Oq=Mq({...Nq,...Wq[768]}),uU=Mq({...Nq,...Wq[1024]});function yQ(){return{kemId:"ML-KEM-768",encapsulate:($)=>{let{cipherText:q,sharedSecret:J}=Oq.encapsulate($);return{sharedSecret:J,encapsulation:q}},decapsulate:($,q)=>{return Oq.decapsulate(q,$)}}}function gQ($){globalThis.webaPqcKem=$}gQ(yQ());var mQ=new Qq;window.GlobalSearch=mQ;CQ();mQ.init();\n';

// src/form/generator.ts
var RUNTIME_SCRIPT = CLIENT_BUNDLE;
function initRuntime() {
  if (typeof window === "undefined")
    return;
  if (window.recalculate)
    return;
  try {
    eval(RUNTIME_SCRIPT);
  } catch (e) {
    console.error("Failed to init runtime from bundle:", e);
  }
}
function generateHtml(markdown) {
  const { html, jsonStructure } = parseMarkdown(markdown);
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${jsonStructure.name || "Web/A Form"}</title><style>body{font-family:sans-serif;padding:2rem;max-width:900px;margin:0 auto;}.form-row{margin-bottom:1rem;}.form-label{font-weight:bold;display:block;margin-bottom:0.5rem;}.form-input{width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;}</style></head><body><div class="page">${html}</div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}
function generateAggregatorHtml(markdown) {
  const { jsonStructure } = parseMarkdown(markdown);
  const aggSpec = jsonStructure.aggSpec ? JSON.stringify(jsonStructure.aggSpec) : "";
  return `<!DOCTYPE html><html><head><title>Aggregator</title><style>
    body{font-family:sans-serif;max-width:1100px;margin:0 auto;padding:2rem;}
    h1{margin-bottom:1.5rem;}
    .agg-panel{border:1px solid #ddd;border-radius:10px;padding:1.5rem;margin-bottom:1.5rem;background:#fafafa;}
    .agg-row{display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem;flex-wrap:wrap;}
    .agg-label{min-width:140px;font-weight:600;}
    .agg-btn{padding:0.6rem 1rem;border-radius:6px;border:1px solid #ccc;background:#111;color:#fff;cursor:pointer;}
    .agg-btn.secondary{background:#fff;color:#333;}
    .agg-btn:disabled{opacity:0.6;cursor:not-allowed;}
    .agg-status{font-size:0.9rem;color:#555;}
    .agg-chip{padding:0.25rem 0.6rem;border-radius:999px;background:#eee;font-size:0.85rem;}
    .agg-chip.ready{background:#d1fae5;color:#065f46;}
    .agg-note{font-size:0.85rem;color:#666;}
    .agg-output{overflow:auto;border:1px solid #eee;border-radius:8px;}
    .agg-table{border-collapse:collapse;width:100%;font-size:0.9rem;}
    .agg-table th,.agg-table td{border:1px solid #eee;padding:0.5rem;vertical-align:top;text-align:left;}
    .agg-table th{background:#f3f4f6;position:sticky;top:0;}
    .agg-empty{padding:1rem;color:#666;}
    .agg-dashboard{margin-bottom:1.5rem;}
    .agg-dashboard-title{font-size:1rem;font-weight:600;margin:1rem 0 0.75rem;}
    .agg-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:1rem;}
    .agg-card{border:1px solid #eee;border-radius:10px;padding:0.75rem;background:#fff;}
    .agg-card-label{font-size:0.8rem;color:#666;margin-bottom:0.25rem;}
    .agg-card-value{font-size:1.25rem;font-weight:700;}
    .agg-chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:1.5rem;}
    .agg-chart{border:1px solid #eee;border-radius:10px;padding:0.75rem;background:#fff;}
    .agg-chart-title{font-weight:600;margin-bottom:0.5rem;}
    .agg-bar-list{display:flex;flex-direction:column;gap:0.5rem;}
    .agg-bar{display:grid;grid-template-columns:minmax(120px,1fr) 3fr auto;gap:0.6rem;align-items:center;font-size:0.85rem;}
    .agg-bar-label{color:#374151;}
    .agg-bar-track{background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;}
    .agg-bar-fill{background:#111;height:100%;border-radius:999px;}
    .agg-bar-value{font-weight:600;white-space:nowrap;}
    .agg-dashboard-table{margin-bottom:1rem;}
    .agg-table-title{font-weight:600;margin-bottom:0.35rem;}
    </style></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-agg-spec" type="application/json">${aggSpec}</script><script id="weba-l2-keys" type="application/json"></script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}

// src/form/sample.ts
var AGG_BLOCK_EN = [
  "```agg",
  "version: 0.1",
  "samples:",
  "  - responder_name: Akira",
  "    team_name: Platform",
  "    cuisine: Japanese",
  "    budget: 6000",
  "    availability:",
  '      - date: "2026-01-05"',
  "        available: true",
  '      - date: "2026-01-07"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: Mei",
  "    team_name: Design",
  "    cuisine: Italian",
  "    budget: 7000",
  "    availability:",
  '      - date: "2026-01-06"',
  "        available: true",
  '      - date: "2026-01-08"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: Ken",
  "    team_name: Sales",
  "    cuisine: BBQ",
  "    budget: 8000",
  "    availability:",
  '      - date: "2026-01-05"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  '      - date: "2026-01-16"',
  "        available: true",
  "  - responder_name: Yui",
  "    team_name: Ops",
  "    cuisine: Sushi",
  "    budget: 7500",
  "    availability:",
  '      - date: "2026-01-07"',
  "        available: true",
  '      - date: "2026-01-13"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: Sora",
  "    team_name: Data",
  "    cuisine: Korean",
  "    budget: 8000",
  "    availability:",
  '      - date: "2026-01-08"',
  "        available: true",
  '      - date: "2026-01-12"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: Rin",
  "    team_name: HR",
  "    cuisine: Chinese",
  "    budget: 6000",
  "    availability:",
  '      - date: "2026-01-06"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  '      - date: "2026-01-15"',
  "        available: true",
  "dashboard:",
  "  title: Dinner Poll Dashboard",
  "  cards:",
  "    - id: total_responses",
  "      label: Responses",
  "      op: count",
  "    - id: avg_budget",
  "      label: Avg Budget",
  "      op: avg",
  "      path: budget",
  "      format: currency",
  "  charts:",
  "    - id: availability_by_date",
  "      type: bar",
  "      title: Availability by Date",
  "      source: availability",
  "      x: date",
  "      filter:",
  "        path: available",
  "        op: eq",
  "        value: true",
  "    - id: budget_hist",
  "      type: hist",
  "      title: Budget Distribution (JPY)",
  "      value: budget",
  "      bin: 1000",
  "      max: 15000",
  "export:",
  "  jsonl: true",
  "```"
].join(`
`);
var AGG_BLOCK_JA = [
  "```agg",
  "version: 0.1",
  "samples:",
  "  - responder_name: 明",
  "    team_name: プラットフォーム",
  "    cuisine: 和食",
  "    budget: 6000",
  "    availability:",
  '      - date: "2026-01-05"',
  "        available: true",
  '      - date: "2026-01-07"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: 芽衣",
  "    team_name: デザイン",
  "    cuisine: イタリアン",
  "    budget: 7000",
  "    availability:",
  '      - date: "2026-01-06"',
  "        available: true",
  '      - date: "2026-01-08"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: 健",
  "    team_name: セールス",
  "    cuisine: 焼肉",
  "    budget: 8000",
  "    availability:",
  '      - date: "2026-01-05"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  '      - date: "2026-01-16"',
  "        available: true",
  "  - responder_name: 結衣",
  "    team_name: オペレーション",
  "    cuisine: 寿司",
  "    budget: 7500",
  "    availability:",
  '      - date: "2026-01-07"',
  "        available: true",
  '      - date: "2026-01-13"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: 空",
  "    team_name: データ",
  "    cuisine: 韓国料理",
  "    budget: 8000",
  "    availability:",
  '      - date: "2026-01-08"',
  "        available: true",
  '      - date: "2026-01-12"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  "  - responder_name: 凛",
  "    team_name: 人事",
  "    cuisine: 中華",
  "    budget: 6000",
  "    availability:",
  '      - date: "2026-01-06"',
  "        available: true",
  '      - date: "2026-01-14"',
  "        available: true",
  '      - date: "2026-01-15"',
  "        available: true",
  "dashboard:",
  "  title: 飲み会ダッシュボード",
  "  cards:",
  "    - id: total_responses",
  "      label: 回答数",
  "      op: count",
  "    - id: avg_budget",
  "      label: 平均予算",
  "      op: avg",
  "      path: budget",
  "      format: currency",
  "  charts:",
  "    - id: availability_by_date",
  "      type: bar",
  "      title: 日別の出席可能人数",
  "      source: availability",
  "      x: date",
  "      filter:",
  "        path: available",
  "        op: eq",
  "        value: true",
  "    - id: budget_hist",
  "      type: hist",
  "      title: 予算の分布 (JPY)",
  "      value: budget",
  "      bin: 1000",
  "      max: 15000",
  "export:",
  "  jsonl: true",
  "```"
].join(`
`);
var DEFAULT_MARKDOWN_EN = `# Team Dinner Poll (Sample)
---

## 1. Participant

- [text:responder_name (placeholder="Akira")] Name
- [text:team_name (placeholder="Platform Team")] Team
- [text:contact (placeholder="akira@example.com")] Contact

---

## 2. Availability (Jan 2026 weekdays)

*If none of these dates work, please **add rows using the '+' button** below.*

[dynamic-table:availability]
| Date | Available | Note |
|---|---|---|
| [date:date (val="2026-01-05")] | [checkbox:available] | [text:note (placeholder="After 19:00 ok")] |
| [date:date (val="2026-01-06")] | [checkbox:available] | [text:note (placeholder="Remote only")] |
| [date:date (val="2026-01-07")] | [checkbox:available] | [text:note (placeholder="Leaving early")] |

---

## 3. Preferences

- [search:cuisine (src:cuisines label:2 value:2 placeholder="Type or pick a cuisine")] Preferred cuisine
- [number:budget (placeholder="0")] Preferred budget (JPY)
- [textarea:comment (placeholder="Allergies or constraints")] Notes

---

## 4. Master Data (Cuisines)

[master:cuisines]
| code | label |
|---|---|
| Japanese | Japanese |
| Italian | Italian |
| Chinese | Chinese |
| Korean | Korean |
| BBQ | BBQ |
| Sushi | Sushi |
| Seafood | Seafood |
| Vegetarian | Vegetarian |
| Cafe | Cafe |
| Other | Other |

${AGG_BLOCK_EN}

---

## 5. Encryption Settings (Config)

This form includes demo settings for client-side encryption (E2EE).
Change \`enabled: false\` to \`true\` below to automatically encrypt saved data.

> [!TIP]
> **Try Personal Mode (Passkey Encryption)**
> Click the **"\uD83D\uDD11 Setup Encryption (Passkey)"** button in the top toolbar to automatically securely configure this form with your own Passkey. This will overwrite the settings below.

*To decrypt this data later, you MUST use the Personal Mode setup.*

<script id="weba-l2-config" type="application/json">
{
  "enabled": false,
  "recipient_kid": "user-key-01",
  "recipient_x25519": ""
}
</script>
`;
var DEFAULT_MARKDOWN_JA = `# 飲み会日程調整（サンプル）
---

## 1. 参加者

- [text:responder_name (placeholder="明")] 名前
- [text:team_name (placeholder="プラットフォーム")] チーム
- [text:contact (placeholder="akira@example.com")] 連絡先

---

## 2. 出席可否（2026年1月の平日）

※ 既存の日程で都合がつかない場合は、**表の下の「＋」ボタンで行を追加**して、候補日を提案してください。

[dynamic-table:availability]
| 日付 | 出席可 | メモ |
|---|---|---|
| [date:date (val="2026-01-05")] | [checkbox:available] | [text:note (placeholder="19時以降OK")] |
| [date:date (val="2026-01-06")] | [checkbox:available] | [text:note (placeholder="オンラインのみ")] |
| [date:date (val="2026-01-07")] | [checkbox:available] | [text:note (placeholder="早めに退出")] |

---

## 3. 希望

- [search:cuisine (src:cuisines label:2 value:2 placeholder="料理ジャンルを入力")] 料理の希望
- [number:budget (placeholder="0")] 希望予算 (JPY)
- [textarea:comment (placeholder="アレルギーや条件")] 備考

---

## 4. マスタ（料理ジャンル）

[master:cuisines]
| code | label |
|---|---|
| Japanese | 和食 |
| Italian | イタリアン |
| Chinese | 中華 |
| Korean | 韓国料理 |
| BBQ | 焼肉 |
| Sushi | 寿司 |
| Seafood | 海鮮 |
| Vegetarian | ベジタリアン |
| Cafe | カフェ |
| Other | その他 |

${AGG_BLOCK_JA}

---

## 5. 暗号化設定 (Config)

このフォームはクライアントサイド暗号化 (E2EE) のデモ設定を含んでいます。
以下の設定の \`enabled: false\` を \`true\` に書き換えると、保存データが自動的に暗号化されます。

> [!TIP]
> **パーソナルモード (Passkey暗号化) を試す**
> 上部ツールバーにある **「\uD83D\uDD11 暗号化設定 (Passkey)」** ボタンをクリックすると、あなたのPasskeyを使ってこのフォームを安全に再設定できます（以下の設定が上書きされます）。

※ これらのデータを後で復号するには、パーソナルモードでの設定が必須です（自動復号は行われません）。

<script id="weba-l2-config" type="application/json">
{
  "enabled": false,
  "recipient_kid": "user-key-01",
  "recipient_x25519": ""
}
</script>
`;

// src/form/client/webauthn.ts
var bufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary2 = "";
  for (let i2 = 0;i2 < bytes.byteLength; i2++) {
    binary2 += String.fromCharCode(bytes[i2]);
  }
  return btoa(binary2).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};
var base64UrlToBuffer = (base64) => {
  const binary2 = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary2.length);
  for (let i2 = 0;i2 < binary2.length; i2++) {
    bytes[i2] = binary2.charCodeAt(i2);
  }
  return bytes.buffer;
};
async function registerPasskey(username) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "Sorane Web/A Form"
      },
      user: {
        id: userId,
        name: username,
        displayName: username
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred"
      },
      timeout: 60000,
      attestation: "none",
      extensions: {
        prf: {}
      }
    }
  });
  if (!credential)
    throw new Error("Credential creation failed");
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    response: credential.response
  };
}
async function derivePasskeyPrf(credentialId, salt) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{
        id: base64UrlToBuffer(credentialId),
        type: "public-key"
      }],
      userVerification: "required",
      extensions: {
        prf: {
          eval: {
            first: salt
          }
        }
      }
    }
  });
  if (!assertion)
    throw new Error("Assertion failed");
  const results = assertion.getClientExtensionResults();
  const prfOutput = results?.prf?.results?.first;
  if (!prfOutput) {
    throw new Error("PRF extension not available");
  }
  return new Uint8Array(prfOutput);
}

// node_modules/@noble/hashes/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== undefined;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out, undefined, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i2 = 0;i2 < arrays.length; i2++) {
    arrays[i2].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i2 = 0;i2 < arr.length; i2++) {
    arr[i2] = byteSwap(arr[i2]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i2 = 0;i2 < bytes.length; i2++) {
    hex += hexes[bytes[i2]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(undefined);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}

class HashMD {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE2) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i2 = pos;i2 < blockLen; i2++)
      buffer[i2] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i2 = 0;i2 < outLen; i2++)
      oview.setUint32(4 * i2, state[i2], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor;
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
}
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA224_IV = /* @__PURE__ */ Uint32Array.from([
  3238371032,
  914150663,
  812702999,
  4144912697,
  4290775857,
  1750603025,
  1694076839,
  3204075428
]);
var SHA384_IV = /* @__PURE__ */ Uint32Array.from([
  3418070365,
  3238371032,
  1654270250,
  914150663,
  2438529370,
  812702999,
  355462360,
  4144912697,
  1731405415,
  4290775857,
  2394180231,
  1750603025,
  3675008525,
  1694076839,
  1203062813,
  3204075428
]);
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i2 = 0;i2 < len; i2++) {
    const { h, l } = fromBig(lst[i2], le);
    [Ah[i2], Al[i2]] = [h, l];
  }
  return [Ah, Al];
}
var shrSH = (h, _l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

class SHA2_32B extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i2 = 0;i2 < 16; i2++, offset += 4)
      SHA256_W[i2] = view.getUint32(offset, false);
    for (let i2 = 16;i2 < 64; i2++) {
      const W15 = SHA256_W[i2 - 15];
      const W2 = SHA256_W[i2 - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i2] = s1 + SHA256_W[i2 - 7] + s0 + SHA256_W[i2 - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i2 = 0;i2 < 64; i2++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i2] + SHA256_W[i2] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
}

class _SHA256 extends SHA2_32B {
  A = SHA256_IV[0] | 0;
  B = SHA256_IV[1] | 0;
  C = SHA256_IV[2] | 0;
  D = SHA256_IV[3] | 0;
  E = SHA256_IV[4] | 0;
  F = SHA256_IV[5] | 0;
  G = SHA256_IV[6] | 0;
  H = SHA256_IV[7] | 0;
  constructor() {
    super(32);
  }
}

class _SHA224 extends SHA2_32B {
  A = SHA224_IV[0] | 0;
  B = SHA224_IV[1] | 0;
  C = SHA224_IV[2] | 0;
  D = SHA224_IV[3] | 0;
  E = SHA224_IV[4] | 0;
  F = SHA224_IV[5] | 0;
  G = SHA224_IV[6] | 0;
  H = SHA224_IV[7] | 0;
  constructor() {
    super(28);
  }
}
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);

class SHA2_64B extends HashMD {
  constructor(outputLen) {
    super(128, outputLen, 16, false);
  }
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i2 = 0;i2 < 16; i2++, offset += 4) {
      SHA512_W_H[i2] = view.getUint32(offset);
      SHA512_W_L[i2] = view.getUint32(offset += 4);
    }
    for (let i2 = 16;i2 < 80; i2++) {
      const W15h = SHA512_W_H[i2 - 15] | 0;
      const W15l = SHA512_W_L[i2 - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i2 - 2] | 0;
      const W2l = SHA512_W_L[i2 - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i2 - 7], SHA512_W_L[i2 - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i2 - 7], SHA512_W_H[i2 - 16]);
      SHA512_W_H[i2] = SUMh | 0;
      SHA512_W_L[i2] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i2 = 0;i2 < 80; i2++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i2], SHA512_W_L[i2]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i2], SHA512_W_H[i2]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}

class _SHA512 extends SHA2_64B {
  Ah = SHA512_IV[0] | 0;
  Al = SHA512_IV[1] | 0;
  Bh = SHA512_IV[2] | 0;
  Bl = SHA512_IV[3] | 0;
  Ch = SHA512_IV[4] | 0;
  Cl = SHA512_IV[5] | 0;
  Dh = SHA512_IV[6] | 0;
  Dl = SHA512_IV[7] | 0;
  Eh = SHA512_IV[8] | 0;
  El = SHA512_IV[9] | 0;
  Fh = SHA512_IV[10] | 0;
  Fl = SHA512_IV[11] | 0;
  Gh = SHA512_IV[12] | 0;
  Gl = SHA512_IV[13] | 0;
  Hh = SHA512_IV[14] | 0;
  Hl = SHA512_IV[15] | 0;
  constructor() {
    super(64);
  }
}

class _SHA384 extends SHA2_64B {
  Ah = SHA384_IV[0] | 0;
  Al = SHA384_IV[1] | 0;
  Bh = SHA384_IV[2] | 0;
  Bl = SHA384_IV[3] | 0;
  Ch = SHA384_IV[4] | 0;
  Cl = SHA384_IV[5] | 0;
  Dh = SHA384_IV[6] | 0;
  Dl = SHA384_IV[7] | 0;
  Eh = SHA384_IV[8] | 0;
  El = SHA384_IV[9] | 0;
  Fh = SHA384_IV[10] | 0;
  Fl = SHA384_IV[11] | 0;
  Gh = SHA384_IV[12] | 0;
  Gl = SHA384_IV[13] | 0;
  Hh = SHA384_IV[14] | 0;
  Hl = SHA384_IV[15] | 0;
  constructor() {
    super(48);
  }
}
var T224_IV = /* @__PURE__ */ Uint32Array.from([
  2352822216,
  424955298,
  1944164710,
  2312950998,
  502970286,
  855612546,
  1738396948,
  1479516111,
  258812777,
  2077511080,
  2011393907,
  79989058,
  1067287976,
  1780299464,
  286451373,
  2446758561
]);
var T256_IV = /* @__PURE__ */ Uint32Array.from([
  573645204,
  4230739756,
  2673172387,
  3360449730,
  596883563,
  1867755857,
  2520282905,
  1497426621,
  2519219938,
  2827943907,
  3193839141,
  1401305490,
  721525244,
  746961066,
  246885852,
  2177182882
]);

class _SHA512_224 extends SHA2_64B {
  Ah = T224_IV[0] | 0;
  Al = T224_IV[1] | 0;
  Bh = T224_IV[2] | 0;
  Bl = T224_IV[3] | 0;
  Ch = T224_IV[4] | 0;
  Cl = T224_IV[5] | 0;
  Dh = T224_IV[6] | 0;
  Dl = T224_IV[7] | 0;
  Eh = T224_IV[8] | 0;
  El = T224_IV[9] | 0;
  Fh = T224_IV[10] | 0;
  Fl = T224_IV[11] | 0;
  Gh = T224_IV[12] | 0;
  Gl = T224_IV[13] | 0;
  Hh = T224_IV[14] | 0;
  Hl = T224_IV[15] | 0;
  constructor() {
    super(28);
  }
}

class _SHA512_256 extends SHA2_64B {
  Ah = T256_IV[0] | 0;
  Al = T256_IV[1] | 0;
  Bh = T256_IV[2] | 0;
  Bl = T256_IV[3] | 0;
  Ch = T256_IV[4] | 0;
  Cl = T256_IV[5] | 0;
  Dh = T256_IV[6] | 0;
  Dl = T256_IV[7] | 0;
  Eh = T256_IV[8] | 0;
  El = T256_IV[9] | 0;
  Fh = T256_IV[10] | 0;
  Fl = T256_IV[11] | 0;
  Gh = T256_IV[12] | 0;
  Gl = T256_IV[13] | 0;
  Hh = T256_IV[14] | 0;
  Hl = T256_IV[15] | 0;
  constructor() {
    super(32);
  }
}
var sha256 = /* @__PURE__ */ createHasher(() => new _SHA256, /* @__PURE__ */ oidNist(1));

// node_modules/@noble/curves/utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n = /* @__PURE__ */ BigInt(0);
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new Error("positive bigint expected, got " + n);
  } else
    anumber(n);
  return n;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  n = abignumber(n);
  const res = hexToBytes(n.toString(16).padStart(len * 2, "0"));
  if (res.length !== len)
    throw new Error("number too large");
  return res;
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function validateObject(object, fields = {}, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === undefined)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}

// node_modules/@noble/curves/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n2 = /* @__PURE__ */ BigInt(0);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}

// node_modules/@noble/curves/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var pointPrecomputes = new WeakMap;
var pointWindowSizes = new WeakMap;
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}

// node_modules/@noble/curves/abstract/montgomery.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n3 = BigInt(0);
var _1n = BigInt(1);
var _2n = BigInt(2);
function validateOpts(curve) {
  validateObject(curve, {
    adjustScalarBytes: "function",
    powPminus2: "function"
  });
  return Object.freeze({ ...curve });
}
function montgomery(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { P, type: type2, adjustScalarBytes, powPminus2, randomBytes: rand } = CURVE;
  const is25519 = type2 === "x25519";
  if (!is25519 && type2 !== "x448")
    throw new Error("invalid type");
  const randomBytes_ = rand || randomBytes;
  const montgomeryBits = is25519 ? 255 : 448;
  const fieldLen = is25519 ? 32 : 56;
  const Gu = is25519 ? BigInt(9) : BigInt(5);
  const a24 = is25519 ? BigInt(121665) : BigInt(39081);
  const minScalar = is25519 ? _2n ** BigInt(254) : _2n ** BigInt(447);
  const maxAdded = is25519 ? BigInt(8) * _2n ** BigInt(251) - _1n : BigInt(4) * _2n ** BigInt(445) - _1n;
  const maxScalar = minScalar + maxAdded + _1n;
  const modP = (n) => mod(n, P);
  const GuBytes = encodeU(Gu);
  function encodeU(u) {
    return numberToBytesLE(modP(u), fieldLen);
  }
  function decodeU(u) {
    const _u = copyBytes(abytes(u, fieldLen, "uCoordinate"));
    if (is25519)
      _u[31] &= 127;
    return modP(bytesToNumberLE(_u));
  }
  function decodeScalar(scalar) {
    return bytesToNumberLE(adjustScalarBytes(copyBytes(abytes(scalar, fieldLen, "scalar"))));
  }
  function scalarMult(scalar, u) {
    const pu = montgomeryLadder(decodeU(u), decodeScalar(scalar));
    if (pu === _0n3)
      throw new Error("invalid private or public key received");
    return encodeU(pu);
  }
  function scalarMultBase(scalar) {
    return scalarMult(scalar, GuBytes);
  }
  const getPublicKey = scalarMultBase;
  const getSharedSecret = scalarMult;
  function cswap(swap, x_2, x_3) {
    const dummy = modP(swap * (x_2 - x_3));
    x_2 = modP(x_2 - dummy);
    x_3 = modP(x_3 + dummy);
    return { x_2, x_3 };
  }
  function montgomeryLadder(u, scalar) {
    aInRange("u", u, _0n3, P);
    aInRange("scalar", scalar, minScalar, maxScalar);
    const k = scalar;
    const x_1 = u;
    let x_2 = _1n;
    let z_2 = _0n3;
    let x_3 = u;
    let z_3 = _1n;
    let swap = _0n3;
    for (let t = BigInt(montgomeryBits - 1);t >= _0n3; t--) {
      const k_t = k >> t & _1n;
      swap ^= k_t;
      ({ x_2, x_3 } = cswap(swap, x_2, x_3));
      ({ x_2: z_2, x_3: z_3 } = cswap(swap, z_2, z_3));
      swap = k_t;
      const A = x_2 + z_2;
      const AA = modP(A * A);
      const B = x_2 - z_2;
      const BB = modP(B * B);
      const E = AA - BB;
      const C = x_3 + z_3;
      const D = x_3 - z_3;
      const DA = modP(D * A);
      const CB = modP(C * B);
      const dacb = DA + CB;
      const da_cb = DA - CB;
      x_3 = modP(dacb * dacb);
      z_3 = modP(x_1 * modP(da_cb * da_cb));
      x_2 = modP(AA * BB);
      z_2 = modP(E * (AA + modP(a24 * E)));
    }
    ({ x_2, x_3 } = cswap(swap, x_2, x_3));
    ({ x_2: z_2, x_3: z_3 } = cswap(swap, z_2, z_3));
    const z2 = powPminus2(z_2);
    return modP(x_2 * z2);
  }
  const lengths = {
    secretKey: fieldLen,
    publicKey: fieldLen,
    seed: fieldLen
  };
  const randomSecretKey = (seed = randomBytes_(fieldLen)) => {
    abytes(seed, lengths.seed, "seed");
    return seed;
  };
  const utils = { randomSecretKey };
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, getPublicKey),
    getSharedSecret,
    getPublicKey,
    scalarMult,
    scalarMultBase,
    utils,
    GuBytes: GuBytes.slice(),
    lengths
  });
}

// node_modules/@noble/curves/ed25519.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _1n2 = BigInt(1);
var _2n2 = BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _5n = BigInt(5);
var _8n = BigInt(8);
var ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
function ed25519_pow_2_252_3(x) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P = ed25519_CURVE_p;
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, _2n2, P) * b2 % P;
  const b5 = pow2(b4, _1n2, P) * x % P;
  const b10 = pow2(b5, _5n, P) * b5 % P;
  const b20 = pow2(b10, _10n, P) * b10 % P;
  const b40 = pow2(b20, _20n, P) * b20 % P;
  const b80 = pow2(b40, _40n, P) * b40 % P;
  const b160 = pow2(b80, _80n, P) * b80 % P;
  const b240 = pow2(b160, _80n, P) * b80 % P;
  const b250 = pow2(b240, _10n, P) * b10 % P;
  const pow_p_5_8 = pow2(b250, _2n2, P) * x % P;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  return bytes;
}
var x25519 = /* @__PURE__ */ (() => {
  const P = ed25519_CURVE_p;
  return montgomery({
    P,
    type: "x25519",
    powPminus2: (x) => {
      const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
      return mod(pow2(pow_p_5_8, _3n, P) * b2, P);
    },
    adjustScalarBytes
  });
})();

// node_modules/@noble/hashes/hmac.js
class _HMAC {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash(hash);
    abytes(key, undefined, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i2 = 0;i2 < pad.length; i2++)
      pad[i2] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i2 = 0;i2 < pad.length; i2++)
      pad[i2] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
}
var hmac = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new _HMAC(hash, key);

// node_modules/@noble/hashes/hkdf.js
function extract(hash, ikm, salt) {
  ahash(hash);
  if (salt === undefined)
    salt = new Uint8Array(hash.outputLen);
  return hmac(hash, salt, ikm);
}
var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
function expand(hash, prk, info, length = 32) {
  ahash(hash);
  anumber(length, "length");
  const olen = hash.outputLen;
  if (length > 255 * olen)
    throw new Error("Length must be <= 255*HashLen");
  const blocks = Math.ceil(length / olen);
  if (info === undefined)
    info = EMPTY_BUFFER;
  else
    abytes(info, undefined, "info");
  const okm = new Uint8Array(blocks * olen);
  const HMAC = hmac.create(hash, prk);
  const HMACTmp = HMAC._cloneInto();
  const T = new Uint8Array(HMAC.outputLen);
  for (let counter = 0;counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
    okm.set(T, olen * counter);
    HMAC._cloneInto(HMACTmp);
  }
  HMAC.destroy();
  HMACTmp.destroy();
  clean(T, HKDF_COUNTER);
  return okm.slice(0, length);
}
var hkdf = (hash, ikm, salt, info, length) => expand(hash, extract(hash, ikm, salt), info, length);

// src/form/client/l2crypto.ts
var import_canonicalize = __toESM(require_canonicalize(), 1);
function b64urlEncode(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  let binary2 = "";
  bytes.forEach((b) => {
    binary2 += String.fromCharCode(b);
  });
  const base64 = btoa(binary2);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function deriveKeyPairFromPrf(prfKey) {
  const info = new TextEncoder().encode("weba-l2/user-x25519");
  const seed = hkdf(sha256, prfKey, undefined, info, 32);
  const publicKey = x25519.getPublicKey(seed);
  return { publicKey, privateKey: seed };
}

// node_modules/@noble/hashes/sha3.js
var _0n4 = BigInt(0);
var _1n3 = BigInt(1);
var _2n3 = BigInt(2);
var _7n = BigInt(7);
var _256n = BigInt(256);
var _0x71n = BigInt(113);
var SHA3_PI = [];
var SHA3_ROTL = [];
var _SHA3_IOTA = [];
for (let round = 0, R = _1n3, x = 1, y = 0;round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI.push(2 * (5 * y + x));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n4;
  for (let j = 0;j < 7; j++) {
    R = (R << _1n3 ^ (R >> _7n) * _0x71n) % _256n;
    if (R & _2n3)
      t ^= _1n3 << (_1n3 << BigInt(j)) - _1n3;
  }
  _SHA3_IOTA.push(t);
}
var IOTAS = split(_SHA3_IOTA, true);
var SHA3_IOTA_H = IOTAS[0];
var SHA3_IOTA_L = IOTAS[1];
var rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
var rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds;round < 24; round++) {
    for (let x = 0;x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0;x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0;y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0;t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0;y < 50; y += 10) {
      for (let x = 0;x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0;x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}

class Keccak {
  state;
  pos = 0;
  posOut = 0;
  finished = false;
  state32;
  destroyed = false;
  blockLen;
  suffix;
  outputLen;
  enableXOF = false;
  rounds;
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    anumber(outputLen, "outputLen");
    if (!(0 < blockLen && blockLen < 200))
      throw new Error("only keccak-f1600 function is supported");
    this.state = new Uint8Array(200);
    this.state32 = u32(this.state);
  }
  clone() {
    return this._cloneInto();
  }
  keccak() {
    swap32IfBE(this.state32);
    keccakP(this.state32, this.rounds);
    swap32IfBE(this.state32);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { blockLen, state } = this;
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i2 = 0;i2 < take; i2++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    aexists(this, false);
    abytes(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length;pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes) {
    anumber(bytes);
    return this.xofInto(new Uint8Array(bytes));
  }
  digestInto(out) {
    aoutput(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    clean(this.state);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to ||= new Keccak(blockLen, suffix, outputLen, enableXOF, rounds);
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
}
var genKeccak = (suffix, blockLen, outputLen, info = {}) => createHasher(() => new Keccak(blockLen, suffix, outputLen), info);
var sha3_256 = /* @__PURE__ */ genKeccak(6, 136, 32, /* @__PURE__ */ oidNist(8));
var sha3_512 = /* @__PURE__ */ genKeccak(6, 72, 64, /* @__PURE__ */ oidNist(10));
var genShake = (suffix, blockLen, outputLen, info = {}) => createHasher((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true), info);
var shake128 = /* @__PURE__ */ genShake(31, 168, 16, /* @__PURE__ */ oidNist(11));
var shake256 = /* @__PURE__ */ genShake(31, 136, 32, /* @__PURE__ */ oidNist(12));

// node_modules/@noble/curves/abstract/fft.js
function checkU32(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 4294967295)
    throw new Error("wrong u32 integer:" + n);
  return n;
}
function isPowerOfTwo(x) {
  checkU32(x);
  return (x & x - 1) === 0 && x !== 0;
}
function reverseBits(n, bits) {
  checkU32(n);
  let reversed = 0;
  for (let i2 = 0;i2 < bits; i2++, n >>>= 1)
    reversed = reversed << 1 | n & 1;
  return reversed;
}
function log2(n) {
  checkU32(n);
  return 31 - Math.clz32(n);
}
function bitReversalInplace(values) {
  const n = values.length;
  if (n < 2 || !isPowerOfTwo(n))
    throw new Error("n must be a power of 2 and greater than 1. Got " + n);
  const bits = log2(n);
  for (let i2 = 0;i2 < n; i2++) {
    const j = reverseBits(i2, bits);
    if (i2 < j) {
      const tmp = values[i2];
      values[i2] = values[j];
      values[j] = tmp;
    }
  }
  return values;
}
var FFTCore = (F, coreOpts) => {
  const { N, roots, dit, invertButterflies = false, skipStages = 0, brp = true } = coreOpts;
  const bits = log2(N);
  if (!isPowerOfTwo(N))
    throw new Error("FFT: Polynomial size should be power of two");
  const isDit = dit !== invertButterflies;
  return (values) => {
    if (values.length !== N)
      throw new Error("FFT: wrong Polynomial length");
    if (dit && brp)
      bitReversalInplace(values);
    for (let i2 = 0, g = 1;i2 < bits - skipStages; i2++) {
      const s = dit ? i2 + 1 + skipStages : bits - i2;
      const m = 1 << s;
      const m2 = m >> 1;
      const stride = N >> s;
      for (let k = 0;k < N; k += m) {
        for (let j = 0, grp = g++;j < m2; j++) {
          const rootPos = invertButterflies ? dit ? N - grp : grp : j * stride;
          const i0 = k + j;
          const i1 = k + j + m2;
          const omega = roots[rootPos];
          const b = values[i1];
          const a = values[i0];
          if (isDit) {
            const t = F.mul(b, omega);
            values[i0] = F.add(a, t);
            values[i1] = F.sub(a, t);
          } else if (invertButterflies) {
            values[i0] = F.add(b, a);
            values[i1] = F.mul(F.sub(b, a), omega);
          } else {
            values[i0] = F.add(a, b);
            values[i1] = F.mul(F.sub(a, b), omega);
          }
        }
      }
    }
    if (!dit && brp)
      bitReversalInplace(values);
    return values;
  };
};

// node_modules/@noble/post-quantum/utils.js
/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */
var randomBytes2 = randomBytes;
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i2 = 0;i2 < a.length; i2++)
    diff |= a[i2] ^ b[i2];
  return diff === 0;
}
function copyBytes2(bytes) {
  return Uint8Array.from(bytes);
}
function splitCoder(label, ...lengths) {
  const getLength = (c) => typeof c === "number" ? c : c.bytesLen;
  const bytesLen = lengths.reduce((sum, a) => sum + getLength(a), 0);
  return {
    bytesLen,
    encode: (bufs) => {
      const res = new Uint8Array(bytesLen);
      for (let i2 = 0, pos = 0;i2 < lengths.length; i2++) {
        const c = lengths[i2];
        const l = getLength(c);
        const b = typeof c === "number" ? bufs[i2] : c.encode(bufs[i2]);
        abytes(b, l, label);
        res.set(b, pos);
        if (typeof c !== "number")
          b.fill(0);
        pos += l;
      }
      return res;
    },
    decode: (buf) => {
      abytes(buf, bytesLen, label);
      const res = [];
      for (const c of lengths) {
        const l = getLength(c);
        const b = buf.subarray(0, l);
        res.push(typeof c === "number" ? b : c.decode(b));
        buf = buf.subarray(l);
      }
      return res;
    }
  };
}
function vecCoder(c, vecLen) {
  const bytesLen = vecLen * c.bytesLen;
  return {
    bytesLen,
    encode: (u) => {
      if (u.length !== vecLen)
        throw new Error(`vecCoder.encode: wrong length=${u.length}. Expected: ${vecLen}`);
      const res = new Uint8Array(bytesLen);
      for (let i2 = 0, pos = 0;i2 < u.length; i2++) {
        const b = c.encode(u[i2]);
        res.set(b, pos);
        b.fill(0);
        pos += b.length;
      }
      return res;
    },
    decode: (a) => {
      abytes(a, bytesLen);
      const r = [];
      for (let i2 = 0;i2 < a.length; i2 += c.bytesLen)
        r.push(c.decode(a.subarray(i2, i2 + c.bytesLen)));
      return r;
    }
  };
}
function cleanBytes(...list) {
  for (const t of list) {
    if (Array.isArray(t))
      for (const b of t)
        b.fill(0);
    else
      t.fill(0);
  }
}
function getMask(bits) {
  return (1 << bits) - 1;
}
var EMPTY = Uint8Array.of();

// node_modules/@noble/post-quantum/_crystals.js
/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */
var genCrystals = (opts) => {
  const { newPoly, N, Q, F, ROOT_OF_UNITY, brvBits, isKyber } = opts;
  const mod2 = (a, modulo = Q) => {
    const result = a % modulo | 0;
    return (result >= 0 ? result | 0 : modulo + result | 0) | 0;
  };
  const smod = (a, modulo = Q) => {
    const r = mod2(a, modulo) | 0;
    return (r > modulo >> 1 ? r - modulo | 0 : r) | 0;
  };
  function getZettas() {
    const out = newPoly(N);
    for (let i2 = 0;i2 < N; i2++) {
      const b = reverseBits(i2, brvBits);
      const p = BigInt(ROOT_OF_UNITY) ** BigInt(b) % BigInt(Q);
      out[i2] = Number(p) | 0;
    }
    return out;
  }
  const nttZetas = getZettas();
  const field = {
    add: (a, b) => mod2((a | 0) + (b | 0)) | 0,
    sub: (a, b) => mod2((a | 0) - (b | 0)) | 0,
    mul: (a, b) => mod2((a | 0) * (b | 0)) | 0,
    inv: (_a) => {
      throw new Error("not implemented");
    }
  };
  const nttOpts = {
    N,
    roots: nttZetas,
    invertButterflies: true,
    skipStages: isKyber ? 1 : 0,
    brp: false
  };
  const dif = FFTCore(field, { dit: false, ...nttOpts });
  const dit = FFTCore(field, { dit: true, ...nttOpts });
  const NTT = {
    encode: (r) => {
      return dif(r);
    },
    decode: (r) => {
      dit(r);
      for (let i2 = 0;i2 < r.length; i2++)
        r[i2] = mod2(F * r[i2]);
      return r;
    }
  };
  const bitsCoder = (d, c) => {
    const mask = getMask(d);
    const bytesLen = d * (N / 8);
    return {
      bytesLen,
      encode: (poly) => {
        const r = new Uint8Array(bytesLen);
        for (let i2 = 0, buf = 0, bufLen = 0, pos = 0;i2 < poly.length; i2++) {
          buf |= (c.encode(poly[i2]) & mask) << bufLen;
          bufLen += d;
          for (;bufLen >= 8; bufLen -= 8, buf >>= 8)
            r[pos++] = buf & getMask(bufLen);
        }
        return r;
      },
      decode: (bytes) => {
        const r = newPoly(N);
        for (let i2 = 0, buf = 0, bufLen = 0, pos = 0;i2 < bytes.length; i2++) {
          buf |= bytes[i2] << bufLen;
          bufLen += 8;
          for (;bufLen >= d; bufLen -= d, buf >>= d)
            r[pos++] = c.decode(buf & mask);
        }
        return r;
      }
    };
  };
  return { mod: mod2, smod, nttZetas, NTT, bitsCoder };
};
var createXofShake = (shake) => (seed, blockLen) => {
  if (!blockLen)
    blockLen = shake.blockLen;
  const _seed = new Uint8Array(seed.length + 2);
  _seed.set(seed);
  const seedLen = seed.length;
  const buf = new Uint8Array(blockLen);
  let h = shake.create({});
  let calls = 0;
  let xofs = 0;
  return {
    stats: () => ({ calls, xofs }),
    get: (x, y) => {
      _seed[seedLen + 0] = x;
      _seed[seedLen + 1] = y;
      h.destroy();
      h = shake.create({}).update(_seed);
      calls++;
      return () => {
        xofs++;
        return h.xofInto(buf);
      };
    },
    clean: () => {
      h.destroy();
      cleanBytes(buf, _seed);
    }
  };
};
var XOF128 = /* @__PURE__ */ createXofShake(shake128);

// node_modules/@noble/post-quantum/ml-kem.js
/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */
var N = 256;
var Q = 3329;
var F = 3303;
var ROOT_OF_UNITY = 17;
var { mod: mod2, nttZetas, NTT, bitsCoder } = genCrystals({
  N,
  Q,
  F,
  ROOT_OF_UNITY,
  newPoly: (n) => new Uint16Array(n),
  brvBits: 7,
  isKyber: true
});
var PARAMS = {
  512: { N, Q, K: 2, ETA1: 3, ETA2: 2, du: 10, dv: 4, RBGstrength: 128 },
  768: { N, Q, K: 3, ETA1: 2, ETA2: 2, du: 10, dv: 4, RBGstrength: 192 },
  1024: { N, Q, K: 4, ETA1: 2, ETA2: 2, du: 11, dv: 5, RBGstrength: 256 }
};
var compress = (d) => {
  if (d >= 12)
    return { encode: (i2) => i2, decode: (i2) => i2 };
  const a = 2 ** (d - 1);
  return {
    encode: (i2) => ((i2 << d) + Q / 2) / Q,
    decode: (i2) => i2 * Q + a >>> d
  };
};
var polyCoder = (d) => bitsCoder(d, compress(d));
function polyAdd(a, b) {
  for (let i2 = 0;i2 < N; i2++)
    a[i2] = mod2(a[i2] + b[i2]);
}
function polySub(a, b) {
  for (let i2 = 0;i2 < N; i2++)
    a[i2] = mod2(a[i2] - b[i2]);
}
function BaseCaseMultiply(a0, a1, b0, b1, zeta) {
  const c0 = mod2(a1 * b1 * zeta + a0 * b0);
  const c1 = mod2(a0 * b1 + a1 * b0);
  return { c0, c1 };
}
function MultiplyNTTs(f, g) {
  for (let i2 = 0;i2 < N / 2; i2++) {
    let z = nttZetas[64 + (i2 >> 1)];
    if (i2 & 1)
      z = -z;
    const { c0, c1 } = BaseCaseMultiply(f[2 * i2 + 0], f[2 * i2 + 1], g[2 * i2 + 0], g[2 * i2 + 1], z);
    f[2 * i2 + 0] = c0;
    f[2 * i2 + 1] = c1;
  }
  return f;
}
function SampleNTT(xof) {
  const r = new Uint16Array(N);
  for (let j = 0;j < N; ) {
    const b = xof();
    if (b.length % 3)
      throw new Error("SampleNTT: unaligned block");
    for (let i2 = 0;j < N && i2 + 3 <= b.length; i2 += 3) {
      const d1 = (b[i2 + 0] >> 0 | b[i2 + 1] << 8) & 4095;
      const d2 = (b[i2 + 1] >> 4 | b[i2 + 2] << 4) & 4095;
      if (d1 < Q)
        r[j++] = d1;
      if (j < N && d2 < Q)
        r[j++] = d2;
    }
  }
  return r;
}
function sampleCBD(PRF, seed, nonce, eta) {
  const buf = PRF(eta * N / 4, seed, nonce);
  const r = new Uint16Array(N);
  const b32 = u32(buf);
  let len = 0;
  for (let i2 = 0, p = 0, bb = 0, t0 = 0;i2 < b32.length; i2++) {
    let b = b32[i2];
    for (let j = 0;j < 32; j++) {
      bb += b & 1;
      b >>= 1;
      len += 1;
      if (len === eta) {
        t0 = bb;
        bb = 0;
      } else if (len === 2 * eta) {
        r[p++] = mod2(t0 - bb);
        bb = 0;
        len = 0;
      }
    }
  }
  if (len)
    throw new Error(`sampleCBD: leftover bits: ${len}`);
  return r;
}
var genKPKE = (opts) => {
  const { K, PRF, XOF, HASH512, ETA1, ETA2, du, dv } = opts;
  const poly1 = polyCoder(1);
  const polyV = polyCoder(dv);
  const polyU = polyCoder(du);
  const publicCoder = splitCoder("publicKey", vecCoder(polyCoder(12), K), 32);
  const secretCoder = vecCoder(polyCoder(12), K);
  const cipherCoder = splitCoder("ciphertext", vecCoder(polyU, K), polyV);
  const seedCoder = splitCoder("seed", 32, 32);
  return {
    secretCoder,
    lengths: {
      secretKey: secretCoder.bytesLen,
      publicKey: publicCoder.bytesLen,
      cipherText: cipherCoder.bytesLen
    },
    keygen: (seed) => {
      abytes(seed, 32, "seed");
      const seedDst = new Uint8Array(33);
      seedDst.set(seed);
      seedDst[32] = K;
      const seedHash = HASH512(seedDst);
      const [rho, sigma] = seedCoder.decode(seedHash);
      const sHat = [];
      const tHat = [];
      for (let i2 = 0;i2 < K; i2++)
        sHat.push(NTT.encode(sampleCBD(PRF, sigma, i2, ETA1)));
      const x = XOF(rho);
      for (let i2 = 0;i2 < K; i2++) {
        const e = NTT.encode(sampleCBD(PRF, sigma, K + i2, ETA1));
        for (let j = 0;j < K; j++) {
          const aji = SampleNTT(x.get(j, i2));
          polyAdd(e, MultiplyNTTs(aji, sHat[j]));
        }
        tHat.push(e);
      }
      x.clean();
      const res = {
        publicKey: publicCoder.encode([tHat, rho]),
        secretKey: secretCoder.encode(sHat)
      };
      cleanBytes(rho, sigma, sHat, tHat, seedDst, seedHash);
      return res;
    },
    encrypt: (publicKey, msg, seed) => {
      const [tHat, rho] = publicCoder.decode(publicKey);
      const rHat = [];
      for (let i2 = 0;i2 < K; i2++)
        rHat.push(NTT.encode(sampleCBD(PRF, seed, i2, ETA1)));
      const x = XOF(rho);
      const tmp2 = new Uint16Array(N);
      const u = [];
      for (let i2 = 0;i2 < K; i2++) {
        const e1 = sampleCBD(PRF, seed, K + i2, ETA2);
        const tmp = new Uint16Array(N);
        for (let j = 0;j < K; j++) {
          const aij = SampleNTT(x.get(i2, j));
          polyAdd(tmp, MultiplyNTTs(aij, rHat[j]));
        }
        polyAdd(e1, NTT.decode(tmp));
        u.push(e1);
        polyAdd(tmp2, MultiplyNTTs(tHat[i2], rHat[i2]));
        cleanBytes(tmp);
      }
      x.clean();
      const e2 = sampleCBD(PRF, seed, 2 * K, ETA2);
      polyAdd(e2, NTT.decode(tmp2));
      const v = poly1.decode(msg);
      polyAdd(v, e2);
      cleanBytes(tHat, rHat, tmp2, e2);
      return cipherCoder.encode([u, v]);
    },
    decrypt: (cipherText, privateKey) => {
      const [u, v] = cipherCoder.decode(cipherText);
      const sk = secretCoder.decode(privateKey);
      const tmp = new Uint16Array(N);
      for (let i2 = 0;i2 < K; i2++)
        polyAdd(tmp, MultiplyNTTs(sk[i2], NTT.encode(u[i2])));
      polySub(v, NTT.decode(tmp));
      cleanBytes(tmp, sk, u);
      return poly1.encode(v);
    }
  };
};
function createKyber(opts) {
  const KPKE = genKPKE(opts);
  const { HASH256, HASH512, KDF } = opts;
  const { secretCoder: KPKESecretCoder, lengths } = KPKE;
  const secretCoder = splitCoder("secretKey", lengths.secretKey, lengths.publicKey, 32, 32);
  const msgLen = 32;
  const seedLen = 64;
  return {
    info: { type: "ml-kem" },
    lengths: {
      ...lengths,
      seed: 64,
      msg: msgLen,
      msgRand: msgLen,
      secretKey: secretCoder.bytesLen
    },
    keygen: (seed = randomBytes2(seedLen)) => {
      abytes(seed, seedLen, "seed");
      const { publicKey, secretKey: sk } = KPKE.keygen(seed.subarray(0, 32));
      const publicKeyHash = HASH256(publicKey);
      const secretKey = secretCoder.encode([sk, publicKey, publicKeyHash, seed.subarray(32)]);
      cleanBytes(sk, publicKeyHash);
      return { publicKey, secretKey };
    },
    getPublicKey: (secretKey) => {
      const [_sk, publicKey, _publicKeyHash, _z] = secretCoder.decode(secretKey);
      return Uint8Array.from(publicKey);
    },
    encapsulate: (publicKey, msg = randomBytes2(msgLen)) => {
      abytes(publicKey, lengths.publicKey, "publicKey");
      abytes(msg, msgLen, "message");
      const eke = publicKey.subarray(0, 384 * opts.K);
      const ek = KPKESecretCoder.encode(KPKESecretCoder.decode(copyBytes2(eke)));
      if (!equalBytes(ek, eke)) {
        cleanBytes(ek);
        throw new Error("ML-KEM.encapsulate: wrong publicKey modulus");
      }
      cleanBytes(ek);
      const kr = HASH512.create().update(msg).update(HASH256(publicKey)).digest();
      const cipherText = KPKE.encrypt(publicKey, msg, kr.subarray(32, 64));
      cleanBytes(kr.subarray(32));
      return { cipherText, sharedSecret: kr.subarray(0, 32) };
    },
    decapsulate: (cipherText, secretKey) => {
      abytes(secretKey, secretCoder.bytesLen, "secretKey");
      abytes(cipherText, lengths.cipherText, "cipherText");
      const k768 = secretCoder.bytesLen - 96;
      const start = k768 + 32;
      const test = HASH256(secretKey.subarray(k768 / 2, start));
      if (!equalBytes(test, secretKey.subarray(start, start + 32)))
        throw new Error("invalid secretKey: hash check failed");
      const [sk, publicKey, publicKeyHash, z] = secretCoder.decode(secretKey);
      const msg = KPKE.decrypt(cipherText, sk);
      const kr = HASH512.create().update(msg).update(publicKeyHash).digest();
      const Khat = kr.subarray(0, 32);
      const cipherText2 = KPKE.encrypt(publicKey, msg, kr.subarray(32, 64));
      const isValid = equalBytes(cipherText, cipherText2);
      const Kbar = KDF.create({ dkLen: 32 }).update(z).update(cipherText).digest();
      cleanBytes(msg, cipherText2, !isValid ? Khat : Kbar);
      return isValid ? Khat : Kbar;
    }
  };
}
function shakePRF(dkLen, key, nonce) {
  return shake256.create({ dkLen }).update(key).update(new Uint8Array([nonce])).digest();
}
var opts = {
  HASH256: sha3_256,
  HASH512: sha3_512,
  KDF: shake256,
  XOF: XOF128,
  PRF: shakePRF
};
var ml_kem512 = /* @__PURE__ */ createKyber({
  ...opts,
  ...PARAMS[512]
});
var ml_kem768 = /* @__PURE__ */ createKyber({
  ...opts,
  ...PARAMS[768]
});
var ml_kem1024 = /* @__PURE__ */ createKyber({
  ...opts,
  ...PARAMS[1024]
});

// src/form/client/pqc.ts
function createMlKem768Provider() {
  return {
    kemId: "ML-KEM-768",
    encapsulate: (recipientPublicKey) => {
      const { cipherText, sharedSecret } = ml_kem768.encapsulate(recipientPublicKey);
      return { sharedSecret, encapsulation: cipherText };
    },
    decapsulate: (recipientPrivateKey, encapsulation) => {
      return ml_kem768.decapsulate(encapsulation, recipientPrivateKey);
    }
  };
}
function installBrowserPqcProvider(provider) {
  globalThis.webaPqcKem = provider;
}

// src/form/browser_maker.ts
function getEditor() {
  return document.getElementById("editor-form");
}
function getMarkdown() {
  const editor = getEditor();
  return editor ? editor.value : "";
}
function stripAggregatorOnly(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.querySelectorAll('[data-preview-only="aggregator"]').forEach((el) => el.remove());
  return wrapper.innerHTML;
}
function updatePreview() {
  console.log("Web/A Maker v3.0");
  const preview = document.getElementById("preview");
  if (!preview)
    return;
  const mode = window.previewMode || "form";
  const markdown = getMarkdown();
  const { html, jsonStructure } = parseMarkdown(markdown);
  window.generatedJsonStructure = jsonStructure;
  if (mode === "aggregator") {
    const aggHtml = generateAggregatorHtml(markdown);
    preview.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:0;"></iframe>`;
    const frame = document.getElementById("preview-frame");
    if (frame) {
      const blob = new Blob([aggHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      frame.src = url;
      frame.onload = () => URL.revokeObjectURL(url);
    }
    return;
  }
  preview.innerHTML = stripAggregatorOnly(html);
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
function downloadCurrent() {
  const mode = window.previewMode || "form";
  const markdown = getMarkdown();
  let htmlContent = mode === "aggregator" ? generateAggregatorHtml(markdown) : generateHtml(markdown);
  if (mode === "aggregator" && lastGeneratedKeys) {
    const keysJson = JSON.stringify(lastGeneratedKeys, null, 2);
    htmlContent = htmlContent.replace('<script id="weba-l2-keys" type="application/json"></script>', `<script id="weba-l2-keys" type="application/json">
${keysJson}
</script>`);
  }
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const title = window.generatedJsonStructure && window.generatedJsonStructure.name || "web-a-form";
  a.download = mode === "aggregator" ? `${title}_aggregator.html` : `${title}.html`;
  a.click();
}
window.parseAndRender = updatePreview;
window.downloadCurrent = downloadCurrent;
window.setPreviewMode = (mode) => {
  window.previewMode = mode;
  document.querySelectorAll(".preview-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.preview === mode);
  });
  updatePreview();
};
function applyI18n() {
  const RESOURCES = {
    en: {
      md_def: "Markdown Definition",
      btn_download: "Download",
      preview: "Preview",
      btn_preview_form: "Form",
      btn_preview_agg: "Aggregator"
    },
    ja: {
      md_def: "定義 (Markdown)",
      btn_download: "ダウンロード",
      preview: "プレビュー",
      btn_preview_form: "入力画面",
      btn_preview_agg: "集計画面"
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
  const editorForm = getEditor();
  if (!editorForm)
    return;
  const navLang = navigator.language || "en";
  const lang = navLang.startsWith("ja") ? "ja" : "en";
  console.log(`Language detection: navigator.language='${navLang}' -> using '${lang}' sample.`);
  const formVal = editorForm.value.trim();
  const isDefaultEn = formVal === DEFAULT_MARKDOWN_EN.trim();
  const isDefaultJa = formVal === DEFAULT_MARKDOWN_JA.trim();
  if (!formVal || lang === "ja" && isDefaultEn || lang === "en" && isDefaultJa) {
    editorForm.value = lang === "ja" ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
  }
  const encBtn = document.createElement("button");
  encBtn.className = "preview-btn";
  encBtn.textContent = lang === "ja" ? "\uD83D\uDD11 暗号化設定 (Passkey)" : "\uD83D\uDD11 Setup Encryption (Passkey)";
  encBtn.style.border = "1px solid #10b981";
  encBtn.style.color = "#059669";
  encBtn.onclick = () => setupEncryption();
  const headerLeft = document.querySelector(".pane-header .header-left");
  if (headerLeft) {
    headerLeft.appendChild(encBtn);
  }
  try {
    const provider = createMlKem768Provider();
    installBrowserPqcProvider(provider);
    console.log("PQC Provider installed in Maker UI");
  } catch (e) {
    console.error("Failed to install PQC provider:", e);
  }
  window.setupEncryption = setupEncryption;
  window.setPreviewMode("form");
  updatePreview();
});
var lastGeneratedKeys = null;
async function setupEncryption() {
  try {
    const username = prompt("User Name for Passkey:", "demo-user");
    if (!username)
      return;
    const usePqc = true;
    alert("Please register a new Passkey for this demo (or select existing if supported).");
    const cred = await registerPasskey(username);
    const salt = new Uint8Array(32);
    const prfKey = await derivePasskeyPrf(cred.id, salt);
    const keyPair = deriveKeyPairFromPrf(prfKey);
    const pubKey = b64urlEncode(keyPair.publicKey);
    lastGeneratedKeys = {
      recipient_kid: `${username}-key`,
      recipient_x25519_private: b64urlEncode(keyPair.privateKey)
    };
    const pqcKeys = ml_kem768.keygen();
    lastGeneratedKeys.recipient_pqc_private = b64urlEncode(pqcKeys.secretKey);
    lastGeneratedKeys.recipient_pqc_kem = "ML-KEM-768";
    lastGeneratedKeys._temp_pqc_public = b64urlEncode(pqcKeys.publicKey);
    console.log("Derived Public Key:", pubKey);
    console.log("Generated PQC Key:", lastGeneratedKeys._temp_pqc_public);
    const editor = getEditor();
    if (!editor)
      return;
    let val = editor.value;
    const configRegex = /<script id="weba-l2-config" type="application\/json">\s*\{[\s\S]*?\}\s*<\/script>/;
    const newConfig = {
      enabled: true,
      recipient_kid: `${username}-key`,
      recipient_x25519: pubKey,
      recipient_pqc: lastGeneratedKeys._temp_pqc_public,
      layer1_ref: "demo-personal"
    };
    const explanation = "Encryption Enabled: Hybrid (X25519 + ML-KEM-768).";
    const newBlock = `<script id="weba-l2-config" type="application/json">
// ${explanation}
${JSON.stringify(newConfig, null, 2)}
</script>`;
    if (val.match(configRegex)) {
      val = val.replace(configRegex, newBlock);
    } else {
      val += `

${newBlock}`;
    }
    val = val.replace(/\*For demo purposes, decryption is automatically handled.*\*/g, "");
    val = val.replace(/※ デモ用のため、以下のキャンペーンIDが設定されている場合.*\*/g, "");
    val = val.replace(/※ デモ用のため、復号に必要な秘密鍵を以下に公開します.*\*/g, "");
    val = val.replace(/Change `enabled: false` to `true` below.*/g, explanation);
    val = val.replace(/Encryption Enabled via Passkey\./g, explanation);
    editor.value = val;
    updatePreview();
    alert(`Encryption configured!
User: ${username}
${usePqc ? `Mode: Hybrid PQC (ML-KEM-768)
` : ""}Public Key: ${pubKey}

NOTE: The Private Key is now temporarily stored in memory.
Downloading the 'Aggregator' will cleanly embed this key.`);
  } catch (e) {
    console.error(e);
    alert("Setup failed: " + e.message);
  }
}
