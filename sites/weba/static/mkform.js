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
var CLIENT_BUNDLE = 'var xQ=Object.create;var{getPrototypeOf:SQ,defineProperty:Eq,getOwnPropertyNames:_Q}=Object;var kQ=Object.prototype.hasOwnProperty;var Dq=($,q,J)=>{J=$!=null?xQ(SQ($)):{};let Q=q||!$||!$.__esModule?Eq(J,"default",{value:$,enumerable:!0}):J;for(let G of _Q($))if(!kQ.call(Q,G))Eq(Q,G,{get:()=>$[G],enumerable:!0});return Q};var yQ=($,q)=>()=>(q||$((q={exports:{}}).exports,q),q.exports);var j$=yQ((JG,OJ)=>{OJ.exports=function $(q){if(typeof q==="number"&&isNaN(q))throw new Error("NaN is not allowed");if(typeof q==="number"&&!isFinite(q))throw new Error("Infinity is not allowed");if(q===null||typeof q!=="object")return JSON.stringify(q);if(q.toJSON instanceof Function)return $(q.toJSON());if(Array.isArray(q))return`[${q.reduce((G,X,U)=>{return`${G}${U===0?"":","}${$(X===void 0||typeof X==="symbol"?null:X)}`},"")}]`;return`{${Object.keys(q).sort().reduce((Q,G)=>{if(q[G]===void 0||typeof q[G]==="symbol")return Q;let X=Q.length===0?"":",";return`${Q}${X}${$(G)}:${$(q[G])}`},"")}}`}});class O${runAutoCopy(){document.querySelectorAll("[data-copy-from]").forEach(($)=>{if(!$.dataset.dirty){let q=$.dataset.copyFrom;if(q){let G=($.closest("tr")||document).querySelector(`[data-base-key="${q}"], [data-json-path="${q}"]`);if(G&&G.value!==$.value)$.value=G.value,$.dispatchEvent(new Event("input",{bubbles:!0}))}}})}recalculate(){document.querySelectorAll("[data-formula]").forEach(($)=>{let q=$.dataset.formula;if(!q)return;let J=$.closest("tr"),Q=$.closest("table"),G=(U)=>{let Z=0,Y="none";if(J){let K=`[data-base-key="${U}"], [data-json-path="${U}"]`,W=J.querySelector(K);if(W){if(Y="row-input",W.value!=="")Z=parseFloat(W.value)}}if(Y==="none"){let K=document.querySelector(`[data-json-path="${U}"]`);if(K){if(Y="static-input",K.value!=="")Z=parseFloat(K.value)}}return Z},X=q.replace(/SUM\\(([a-zA-Z0-9_\\-\\u0080-\\uFFFF]+)\\)/g,(U,Z)=>{let Y=0,K=Q||document,W=K.querySelectorAll(`[data-base-key="${Z}"], [data-json-path="${Z}"]`);if(W.length===0&&K!==document)W=document.querySelectorAll(`[data-base-key="${Z}"], [data-json-path="${Z}"]`);return W.forEach((O)=>{let E=parseFloat(O.value);if(!isNaN(E))Y+=E}),Y});X=X.replace(/([a-zA-Z_\\u0080-\\uFFFF][a-zA-Z0-9_\\-\\u0080-\\uFFFF]*)/g,(U)=>{if(["Math","round","floor","ceil","abs","min","max"].includes(U))return U;return String(G(U))});try{let U=new Function("return "+X)();if(typeof U==="number"&&!isNaN(U))$.value=Number.isInteger(U)?U:U.toFixed(0);else $.value=""}catch(U){console.error("Calc Error:",U),$.value="Err"}}),this.runAutoCopy()}}/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */function Z0($){return $ instanceof Uint8Array||ArrayBuffer.isView($)&&$.constructor.name==="Uint8Array"}function z8($,q=""){if(!Number.isSafeInteger($)||$<0){let J=q&&`"${q}" `;throw new Error(`${J}expected integer >= 0, got ${$}`)}}function c($,q,J=""){let Q=Z0($),G=$?.length,X=q!==void 0;if(!Q||X&&G!==q){let U=J&&`"${J}" `,Z=X?` of length ${q}`:"",Y=Q?`length=${G}`:`type=${typeof $}`;throw new Error(U+"expected Uint8Array"+Z+", got "+Y)}return $}function W0($){if(typeof $!=="function"||typeof $.create!=="function")throw new Error("Hash must wrapped by utils.createHasher");z8($.outputLen),z8($.blockLen)}function f8($,q=!0){if($.destroyed)throw new Error("Hash instance has been destroyed");if(q&&$.finished)throw new Error("Hash#digest() has already been called")}function j0($,q){c($,void 0,"digestInto() output");let J=q.outputLen;if($.length<J)throw new Error(\'"digestInto() output" expected to be of length >=\'+J)}function P0($){return new Uint32Array($.buffer,$.byteOffset,Math.floor($.byteLength/4))}function M8(...$){for(let q=0;q<$.length;q++)$[q].fill(0)}function f0($){return new DataView($.buffer,$.byteOffset,$.byteLength)}function L8($,q){return $<<32-q|$>>>q}var vQ=(()=>new Uint8Array(new Uint32Array([287454020]).buffer)[0]===68)();function mQ($){return $<<24&4278190080|$<<8&16711680|$>>>8&65280|$>>>24&255}function gQ($){for(let q=0;q<$.length;q++)$[q]=mQ($[q]);return $}var z$=vQ?($)=>$:gQ,Rq=(()=>typeof Uint8Array.from([]).toHex==="function"&&typeof Uint8Array.fromHex==="function")(),bQ=Array.from({length:256},($,q)=>q.toString(16).padStart(2,"0"));function e8($){if(c($),Rq)return $.toHex();let q="";for(let J=0;J<$.length;J++)q+=bQ[$[J]];return q}var P8={_0:48,_9:57,A:65,F:70,a:97,f:102};function Cq($){if($>=P8._0&&$<=P8._9)return $-P8._0;if($>=P8.A&&$<=P8.F)return $-(P8.A-10);if($>=P8.a&&$<=P8.f)return $-(P8.a-10);return}function M0($){if(typeof $!=="string")throw new Error("hex string expected, got "+typeof $);if(Rq)return Uint8Array.fromHex($);let q=$.length,J=q/2;if(q%2)throw new Error("hex string expected, got unpadded hex of length "+q);let Q=new Uint8Array(J);for(let G=0,X=0;G<J;G++,X+=2){let U=Cq($.charCodeAt(X)),Z=Cq($.charCodeAt(X+1));if(U===void 0||Z===void 0){let Y=$[X]+$[X+1];throw new Error(\'hex string expected, got non-hex character "\'+Y+\'" at index \'+X)}Q[G]=U*16+Z}return Q}function $0(...$){let q=0;for(let Q=0;Q<$.length;Q++){let G=$[Q];c(G),q+=G.length}let J=new Uint8Array(q);for(let Q=0,G=0;Q<$.length;Q++){let X=$[Q];J.set(X,G),G+=X.length}return J}function q0($,q={}){let J=(G,X)=>$(X).update(G).digest(),Q=$(void 0);return J.outputLen=Q.outputLen,J.blockLen=Q.blockLen,J.create=(G)=>$(G),Object.assign(J,q),Object.freeze(J)}function u8($=32){let q=typeof globalThis==="object"?globalThis.crypto:null;if(typeof q?.getRandomValues!=="function")throw new Error("crypto.getRandomValues must be defined");return q.getRandomValues(new Uint8Array($))}var y8=($)=>({oid:Uint8Array.from([6,9,96,134,72,1,101,3,4,2,$])});function Hq($,q,J){return $&q^~$&J}function Lq($,q,J){return $&q^$&J^q&J}class F0{blockLen;outputLen;padOffset;isLE;buffer;view;finished=!1;length=0;pos=0;destroyed=!1;constructor($,q,J,Q){this.blockLen=$,this.outputLen=q,this.padOffset=J,this.isLE=Q,this.buffer=new Uint8Array($),this.view=f0(this.buffer)}update($){f8(this),c($);let{view:q,buffer:J,blockLen:Q}=this,G=$.length;for(let X=0;X<G;){let U=Math.min(Q-this.pos,G-X);if(U===Q){let Z=f0($);for(;Q<=G-X;X+=Q)this.process(Z,X);continue}if(J.set($.subarray(X,X+U),this.pos),this.pos+=U,X+=U,this.pos===Q)this.process(q,0),this.pos=0}return this.length+=$.length,this.roundClean(),this}digestInto($){f8(this),j0($,this),this.finished=!0;let{buffer:q,view:J,blockLen:Q,isLE:G}=this,{pos:X}=this;if(q[X++]=128,M8(this.buffer.subarray(X)),this.padOffset>Q-X)this.process(J,0),X=0;for(let W=X;W<Q;W++)q[W]=0;J.setBigUint64(Q-8,BigInt(this.length*8),G),this.process(J,0);let U=f0($),Z=this.outputLen;if(Z%4)throw new Error("_sha2: outputLen must be aligned to 32bit");let Y=Z/4,K=this.get();if(Y>K.length)throw new Error("_sha2: outputLen bigger than state");for(let W=0;W<Y;W++)U.setUint32(4*W,K[W],G)}digest(){let{buffer:$,outputLen:q}=this;this.digestInto($);let J=$.slice(0,q);return this.destroy(),J}_cloneInto($){$||=new this.constructor,$.set(...this.get());let{blockLen:q,buffer:J,length:Q,finished:G,destroyed:X,pos:U}=this;if($.destroyed=X,$.finished=G,$.length=Q,$.pos=U,Q%q)$.buffer.set(J);return $}clone(){return this._cloneInto()}}var F8=Uint32Array.from([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]),x8=Uint32Array.from([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]),$8=Uint32Array.from([3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428]),q8=Uint32Array.from([1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209]);var x0=BigInt(4294967295),Iq=BigInt(32);function hQ($,q=!1){if(q)return{h:Number($&x0),l:Number($>>Iq&x0)};return{h:Number($>>Iq&x0)|0,l:Number($&x0)|0}}function S0($,q=!1){let J=$.length,Q=new Uint32Array(J),G=new Uint32Array(J);for(let X=0;X<J;X++){let{h:U,l:Z}=hQ($[X],q);[Q[X],G[X]]=[U,Z]}return[Q,G]}var E$=($,q,J)=>$>>>J,D$=($,q,J)=>$<<32-J|q>>>J,d8=($,q,J)=>$>>>J|q<<32-J,l8=($,q,J)=>$<<32-J|q>>>J,N0=($,q,J)=>$<<64-J|q>>>J-32,K0=($,q,J)=>$>>>J-32|q<<64-J;var wq=($,q,J)=>$<<J|q>>>32-J,Tq=($,q,J)=>q<<J|$>>>32-J,Vq=($,q,J)=>q<<J-32|$>>>64-J,Aq=($,q,J)=>$<<J-32|q>>>64-J;function w8($,q,J,Q){let G=(q>>>0)+(Q>>>0);return{h:$+J+(G/4294967296|0)|0,l:G|0}}var Bq=($,q,J)=>($>>>0)+(q>>>0)+(J>>>0),jq=($,q,J,Q)=>q+J+Q+($/4294967296|0)|0,Pq=($,q,J,Q)=>($>>>0)+(q>>>0)+(J>>>0)+(Q>>>0),fq=($,q,J,Q,G)=>q+J+Q+G+($/4294967296|0)|0,Fq=($,q,J,Q,G)=>($>>>0)+(q>>>0)+(J>>>0)+(Q>>>0)+(G>>>0),xq=($,q,J,Q,G,X)=>q+J+Q+G+X+($/4294967296|0)|0;var cQ=Uint32Array.from([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),v8=new Uint32Array(64);class C$ extends F0{constructor($){super(64,$,8,!1)}get(){let{A:$,B:q,C:J,D:Q,E:G,F:X,G:U,H:Z}=this;return[$,q,J,Q,G,X,U,Z]}set($,q,J,Q,G,X,U,Z){this.A=$|0,this.B=q|0,this.C=J|0,this.D=Q|0,this.E=G|0,this.F=X|0,this.G=U|0,this.H=Z|0}process($,q){for(let W=0;W<16;W++,q+=4)v8[W]=$.getUint32(q,!1);for(let W=16;W<64;W++){let O=v8[W-15],E=v8[W-2],H=L8(O,7)^L8(O,18)^O>>>3,A=L8(E,17)^L8(E,19)^E>>>10;v8[W]=A+v8[W-7]+H+v8[W-16]|0}let{A:J,B:Q,C:G,D:X,E:U,F:Z,G:Y,H:K}=this;for(let W=0;W<64;W++){let O=L8(U,6)^L8(U,11)^L8(U,25),E=K+O+Hq(U,Z,Y)+cQ[W]+v8[W]|0,A=(L8(J,2)^L8(J,13)^L8(J,22))+Lq(J,Q,G)|0;K=Y,Y=Z,Z=U,U=X+E|0,X=G,G=Q,Q=J,J=E+A|0}J=J+this.A|0,Q=Q+this.B|0,G=G+this.C|0,X=X+this.D|0,U=U+this.E|0,Z=Z+this.F|0,Y=Y+this.G|0,K=K+this.H|0,this.set(J,Q,G,X,U,Z,Y,K)}roundClean(){M8(v8)}destroy(){this.set(0,0,0,0,0,0,0,0),M8(this.buffer)}}class Sq extends C${A=F8[0]|0;B=F8[1]|0;C=F8[2]|0;D=F8[3]|0;E=F8[4]|0;F=F8[5]|0;G=F8[6]|0;H=F8[7]|0;constructor(){super(32)}}class uQ extends C${A=x8[0]|0;B=x8[1]|0;C=x8[2]|0;D=x8[3]|0;E=x8[4]|0;F=x8[5]|0;G=x8[6]|0;H=x8[7]|0;constructor(){super(28)}}var _q=(()=>S0(["0x428a2f98d728ae22","0x7137449123ef65cd","0xb5c0fbcfec4d3b2f","0xe9b5dba58189dbbc","0x3956c25bf348b538","0x59f111f1b605d019","0x923f82a4af194f9b","0xab1c5ed5da6d8118","0xd807aa98a3030242","0x12835b0145706fbe","0x243185be4ee4b28c","0x550c7dc3d5ffb4e2","0x72be5d74f27b896f","0x80deb1fe3b1696b1","0x9bdc06a725c71235","0xc19bf174cf692694","0xe49b69c19ef14ad2","0xefbe4786384f25e3","0x0fc19dc68b8cd5b5","0x240ca1cc77ac9c65","0x2de92c6f592b0275","0x4a7484aa6ea6e483","0x5cb0a9dcbd41fbd4","0x76f988da831153b5","0x983e5152ee66dfab","0xa831c66d2db43210","0xb00327c898fb213f","0xbf597fc7beef0ee4","0xc6e00bf33da88fc2","0xd5a79147930aa725","0x06ca6351e003826f","0x142929670a0e6e70","0x27b70a8546d22ffc","0x2e1b21385c26c926","0x4d2c6dfc5ac42aed","0x53380d139d95b3df","0x650a73548baf63de","0x766a0abb3c77b2a8","0x81c2c92e47edaee6","0x92722c851482353b","0xa2bfe8a14cf10364","0xa81a664bbc423001","0xc24b8b70d0f89791","0xc76c51a30654be30","0xd192e819d6ef5218","0xd69906245565a910","0xf40e35855771202a","0x106aa07032bbd1b8","0x19a4c116b8d2d0c8","0x1e376c085141ab53","0x2748774cdf8eeb99","0x34b0bcb5e19b48a8","0x391c0cb3c5c95a63","0x4ed8aa4ae3418acb","0x5b9cca4f7763e373","0x682e6ff3d6b2b8a3","0x748f82ee5defb2fc","0x78a5636f43172f60","0x84c87814a1f0ab72","0x8cc702081a6439ec","0x90befffa23631e28","0xa4506cebde82bde9","0xbef9a3f7b2c67915","0xc67178f2e372532b","0xca273eceea26619c","0xd186b8c721c0c207","0xeada7dd6cde0eb1e","0xf57d4f7fee6ed178","0x06f067aa72176fba","0x0a637dc5a2c898a6","0x113f9804bef90dae","0x1b710b35131c471b","0x28db77f523047d84","0x32caab7b40c72493","0x3c9ebe0a15c9bebc","0x431d67c49c100d4c","0x4cc5d4becb3e42b6","0x597f299cfc657e2a","0x5fcb6fab3ad6faec","0x6c44198c4a475817"].map(($)=>BigInt($))))(),dQ=(()=>_q[0])(),lQ=(()=>_q[1])(),m8=new Uint32Array(80),g8=new Uint32Array(80);class O0 extends F0{constructor($){super(128,$,16,!1)}get(){let{Ah:$,Al:q,Bh:J,Bl:Q,Ch:G,Cl:X,Dh:U,Dl:Z,Eh:Y,El:K,Fh:W,Fl:O,Gh:E,Gl:H,Hh:A,Hl:x}=this;return[$,q,J,Q,G,X,U,Z,Y,K,W,O,E,H,A,x]}set($,q,J,Q,G,X,U,Z,Y,K,W,O,E,H,A,x){this.Ah=$|0,this.Al=q|0,this.Bh=J|0,this.Bl=Q|0,this.Ch=G|0,this.Cl=X|0,this.Dh=U|0,this.Dl=Z|0,this.Eh=Y|0,this.El=K|0,this.Fh=W|0,this.Fl=O|0,this.Gh=E|0,this.Gl=H|0,this.Hh=A|0,this.Hl=x|0}process($,q){for(let R=0;R<16;R++,q+=4)m8[R]=$.getUint32(q),g8[R]=$.getUint32(q+=4);for(let R=16;R<80;R++){let D=m8[R-15]|0,k=g8[R-15]|0,y=d8(D,k,1)^d8(D,k,8)^E$(D,k,7),v=l8(D,k,1)^l8(D,k,8)^D$(D,k,7),S=m8[R-2]|0,w=g8[R-2]|0,j=d8(S,w,19)^N0(S,w,61)^E$(S,w,6),_=l8(S,w,19)^K0(S,w,61)^D$(S,w,6),h=Pq(v,_,g8[R-7],g8[R-16]),u=fq(h,y,j,m8[R-7],m8[R-16]);m8[R]=u|0,g8[R]=h|0}let{Ah:J,Al:Q,Bh:G,Bl:X,Ch:U,Cl:Z,Dh:Y,Dl:K,Eh:W,El:O,Fh:E,Fl:H,Gh:A,Gl:x,Hh:I,Hl:P}=this;for(let R=0;R<80;R++){let D=d8(W,O,14)^d8(W,O,18)^N0(W,O,41),k=l8(W,O,14)^l8(W,O,18)^K0(W,O,41),y=W&E^~W&A,v=O&H^~O&x,S=Fq(P,k,v,lQ[R],g8[R]),w=xq(S,I,D,y,dQ[R],m8[R]),j=S|0,_=d8(J,Q,28)^N0(J,Q,34)^N0(J,Q,39),h=l8(J,Q,28)^K0(J,Q,34)^K0(J,Q,39),u=J&G^J&U^G&U,N=Q&X^Q&Z^X&Z;I=A|0,P=x|0,A=E|0,x=H|0,E=W|0,H=O|0,{h:W,l:O}=w8(Y|0,K|0,w|0,j|0),Y=U|0,K=Z|0,U=G|0,Z=X|0,G=J|0,X=Q|0;let T=Bq(j,h,N);J=jq(T,w,_,u),Q=T|0}({h:J,l:Q}=w8(this.Ah|0,this.Al|0,J|0,Q|0)),{h:G,l:X}=w8(this.Bh|0,this.Bl|0,G|0,X|0),{h:U,l:Z}=w8(this.Ch|0,this.Cl|0,U|0,Z|0),{h:Y,l:K}=w8(this.Dh|0,this.Dl|0,Y|0,K|0),{h:W,l:O}=w8(this.Eh|0,this.El|0,W|0,O|0),{h:E,l:H}=w8(this.Fh|0,this.Fl|0,E|0,H|0),{h:A,l:x}=w8(this.Gh|0,this.Gl|0,A|0,x|0),{h:I,l:P}=w8(this.Hh|0,this.Hl|0,I|0,P|0),this.set(J,Q,G,X,U,Z,Y,K,W,O,E,H,A,x,I,P)}roundClean(){M8(m8,g8)}destroy(){M8(this.buffer),this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)}}class kq extends O0{Ah=q8[0]|0;Al=q8[1]|0;Bh=q8[2]|0;Bl=q8[3]|0;Ch=q8[4]|0;Cl=q8[5]|0;Dh=q8[6]|0;Dl=q8[7]|0;Eh=q8[8]|0;El=q8[9]|0;Fh=q8[10]|0;Fl=q8[11]|0;Gh=q8[12]|0;Gl=q8[13]|0;Hh=q8[14]|0;Hl=q8[15]|0;constructor(){super(64)}}class nQ extends O0{Ah=$8[0]|0;Al=$8[1]|0;Bh=$8[2]|0;Bl=$8[3]|0;Ch=$8[4]|0;Cl=$8[5]|0;Dh=$8[6]|0;Dl=$8[7]|0;Eh=$8[8]|0;El=$8[9]|0;Fh=$8[10]|0;Fl=$8[11]|0;Gh=$8[12]|0;Gl=$8[13]|0;Hh=$8[14]|0;Hl=$8[15]|0;constructor(){super(48)}}var Q8=Uint32Array.from([2352822216,424955298,1944164710,2312950998,502970286,855612546,1738396948,1479516111,258812777,2077511080,2011393907,79989058,1067287976,1780299464,286451373,2446758561]),G8=Uint32Array.from([573645204,4230739756,2673172387,3360449730,596883563,1867755857,2520282905,1497426621,2519219938,2827943907,3193839141,1401305490,721525244,746961066,246885852,2177182882]);class iQ extends O0{Ah=Q8[0]|0;Al=Q8[1]|0;Bh=Q8[2]|0;Bl=Q8[3]|0;Ch=Q8[4]|0;Cl=Q8[5]|0;Dh=Q8[6]|0;Dl=Q8[7]|0;Eh=Q8[8]|0;El=Q8[9]|0;Fh=Q8[10]|0;Fl=Q8[11]|0;Gh=Q8[12]|0;Gl=Q8[13]|0;Hh=Q8[14]|0;Hl=Q8[15]|0;constructor(){super(28)}}class rQ extends O0{Ah=G8[0]|0;Al=G8[1]|0;Bh=G8[2]|0;Bl=G8[3]|0;Ch=G8[4]|0;Cl=G8[5]|0;Dh=G8[6]|0;Dl=G8[7]|0;Eh=G8[8]|0;El=G8[9]|0;Fh=G8[10]|0;Fl=G8[11]|0;Gh=G8[12]|0;Gl=G8[13]|0;Hh=G8[14]|0;Hl=G8[15]|0;constructor(){super(32)}}var N8=q0(()=>new Sq,y8(1));var yq=q0(()=>new kq,y8(3));/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var mq=BigInt(0),vq=BigInt(1);function k0($,q=""){if(typeof $!=="boolean"){let J=q&&`"${q}" `;throw new Error(J+"expected boolean, got type="+typeof $)}return $}function oQ($){if(typeof $==="bigint"){if(!_0($))throw new Error("positive bigint expected, got "+$)}else z8($);return $}function gq($){if(typeof $!=="string")throw new Error("hex string expected, got "+typeof $);return $===""?mq:BigInt("0x"+$)}function bq($){return gq(e8($))}function S8($){return gq(e8(n8(c($)).reverse()))}function R$($,q){z8(q),$=oQ($);let J=M0($.toString(16).padStart(q*2,"0"));if(J.length!==q)throw new Error("number too large");return J}function y0($,q){return R$($,q).reverse()}function n8($){return Uint8Array.from($)}var _0=($)=>typeof $==="bigint"&&mq<=$;function aQ($,q,J){return _0($)&&_0(q)&&_0(J)&&q<=$&&$<J}function J0($,q,J,Q){if(!aQ(q,J,Q))throw new Error("expected valid "+$+": "+J+" <= n < "+Q+", got "+q)}var hq=($)=>(vq<<BigInt($))-vq;function i8($,q={},J={}){if(!$||typeof $!=="object")throw new Error("expected valid options object");function Q(X,U,Z){let Y=$[X];if(Z&&Y===void 0)return;let K=typeof Y;if(K!==U||Y===null)throw new Error(`param "${X}" is invalid: expected ${U}, got ${K}`)}let G=(X,U)=>Object.entries(X).forEach(([Z,Y])=>Q(Z,Y,U));G(q,!1),G(J,!0)}function H$($){let q=new WeakMap;return(J,...Q)=>{let G=q.get(J);if(G!==void 0)return G;let X=$(J,...Q);return q.set(J,X),X}}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var Y8=BigInt(0),X8=BigInt(1),r8=BigInt(2),uq=BigInt(3),dq=BigInt(4),lq=BigInt(5),sQ=BigInt(7),nq=BigInt(8),tQ=BigInt(9),iq=BigInt(16);function i($,q){let J=$%q;return J>=Y8?J:q+J}function D8($,q,J){let Q=$;while(q-- >Y8)Q*=Q,Q%=J;return Q}function pq($,q){if($===Y8)throw new Error("invert: expected non-zero number");if(q<=Y8)throw new Error("invert: expected positive modulus, got "+q);let J=i($,q),Q=q,G=Y8,X=X8,U=X8,Z=Y8;while(J!==Y8){let K=Q/J,W=Q%J,O=G-U*K,E=X-Z*K;Q=J,J=W,G=U,X=Z,U=O,Z=E}if(Q!==X8)throw new Error("invert: does not exist");return i(G,q)}function L$($,q,J){if(!$.eql($.sqr(q),J))throw new Error("Cannot find square root")}function rq($,q){let J=($.ORDER+X8)/dq,Q=$.pow(q,J);return L$($,Q,q),Q}function eQ($,q){let J=($.ORDER-lq)/nq,Q=$.mul(q,r8),G=$.pow(Q,J),X=$.mul(q,G),U=$.mul($.mul(X,r8),G),Z=$.mul(X,$.sub(U,$.ONE));return L$($,Z,q),Z}function $1($){let q=m0($),J=oq($),Q=J(q,q.neg(q.ONE)),G=J(q,Q),X=J(q,q.neg(Q)),U=($+sQ)/iq;return(Z,Y)=>{let K=Z.pow(Y,U),W=Z.mul(K,Q),O=Z.mul(K,G),E=Z.mul(K,X),H=Z.eql(Z.sqr(W),Y),A=Z.eql(Z.sqr(O),Y);K=Z.cmov(K,W,H),W=Z.cmov(E,O,A);let x=Z.eql(Z.sqr(W),Y),I=Z.cmov(K,W,x);return L$(Z,I,Y),I}}function oq($){if($<uq)throw new Error("sqrt is not defined for small field");let q=$-X8,J=0;while(q%r8===Y8)q/=r8,J++;let Q=r8,G=m0($);while(cq(G,Q)===1)if(Q++>1000)throw new Error("Cannot find square root: probably non-prime P");if(J===1)return rq;let X=G.pow(Q,q),U=(q+X8)/r8;return function Z(Y,K){if(Y.is0(K))return K;if(cq(Y,K)!==1)throw new Error("Cannot find square root");let W=J,O=Y.mul(Y.ONE,X),E=Y.pow(K,q),H=Y.pow(K,U);while(!Y.eql(E,Y.ONE)){if(Y.is0(E))return Y.ZERO;let A=1,x=Y.sqr(E);while(!Y.eql(x,Y.ONE))if(A++,x=Y.sqr(x),A===W)throw new Error("Cannot find square root");let I=X8<<BigInt(W-A-1),P=Y.pow(O,I);W=A,O=Y.sqr(P),E=Y.mul(E,O),H=Y.mul(H,P)}return H}}function q1($){if($%dq===uq)return rq;if($%nq===lq)return eQ;if($%iq===tQ)return $1($);return oq($)}var aq=($,q)=>(i($,q)&X8)===X8,J1=["create","isValid","is0","neg","inv","sqrt","sqr","eql","add","sub","mul","pow","div","addN","subN","mulN","sqrN"];function sq($){let q={ORDER:"bigint",BYTES:"number",BITS:"number"},J=J1.reduce((Q,G)=>{return Q[G]="function",Q},q);return i8($,J),$}function Q1($,q,J){if(J<Y8)throw new Error("invalid exponent, negatives unsupported");if(J===Y8)return $.ONE;if(J===X8)return q;let Q=$.ONE,G=q;while(J>Y8){if(J&X8)Q=$.mul(Q,G);G=$.sqr(G),J>>=X8}return Q}function v0($,q,J=!1){let Q=new Array(q.length).fill(J?$.ZERO:void 0),G=q.reduce((U,Z,Y)=>{if($.is0(Z))return U;return Q[Y]=U,$.mul(U,Z)},$.ONE),X=$.inv(G);return q.reduceRight((U,Z,Y)=>{if($.is0(Z))return U;return Q[Y]=$.mul(U,Q[Y]),$.mul(U,Z)},X),Q}function cq($,q){let J=($.ORDER-X8)/r8,Q=$.pow(q,J),G=$.eql(Q,$.ONE),X=$.eql(Q,$.ZERO),U=$.eql(Q,$.neg($.ONE));if(!G&&!X&&!U)throw new Error("invalid Legendre symbol result");return G?1:X?0:-1}function G1($,q){if(q!==void 0)z8(q);let J=q!==void 0?q:$.toString(2).length,Q=Math.ceil(J/8);return{nBitLength:J,nByteLength:Q}}class tq{ORDER;BITS;BYTES;isLE;ZERO=Y8;ONE=X8;_lengths;_sqrt;_mod;constructor($,q={}){if($<=Y8)throw new Error("invalid field: expected ORDER > 0, got "+$);let J=void 0;if(this.isLE=!1,q!=null&&typeof q==="object"){if(typeof q.BITS==="number")J=q.BITS;if(typeof q.sqrt==="function")this.sqrt=q.sqrt;if(typeof q.isLE==="boolean")this.isLE=q.isLE;if(q.allowedLengths)this._lengths=q.allowedLengths?.slice();if(typeof q.modFromBytes==="boolean")this._mod=q.modFromBytes}let{nBitLength:Q,nByteLength:G}=G1($,J);if(G>2048)throw new Error("invalid field: expected ORDER of <= 2048 bytes");this.ORDER=$,this.BITS=Q,this.BYTES=G,this._sqrt=void 0,Object.preventExtensions(this)}create($){return i($,this.ORDER)}isValid($){if(typeof $!=="bigint")throw new Error("invalid field element: expected bigint, got "+typeof $);return Y8<=$&&$<this.ORDER}is0($){return $===Y8}isValidNot0($){return!this.is0($)&&this.isValid($)}isOdd($){return($&X8)===X8}neg($){return i(-$,this.ORDER)}eql($,q){return $===q}sqr($){return i($*$,this.ORDER)}add($,q){return i($+q,this.ORDER)}sub($,q){return i($-q,this.ORDER)}mul($,q){return i($*q,this.ORDER)}pow($,q){return Q1(this,$,q)}div($,q){return i($*pq(q,this.ORDER),this.ORDER)}sqrN($){return $*$}addN($,q){return $+q}subN($,q){return $-q}mulN($,q){return $*q}inv($){return pq($,this.ORDER)}sqrt($){if(!this._sqrt)this._sqrt=q1(this.ORDER);return this._sqrt(this,$)}toBytes($){return this.isLE?y0($,this.BYTES):R$($,this.BYTES)}fromBytes($,q=!1){c($);let{_lengths:J,BYTES:Q,isLE:G,ORDER:X,_mod:U}=this;if(J){if(!J.includes($.length)||$.length>Q)throw new Error("Field.fromBytes: expected "+J+" bytes, got "+$.length);let Y=new Uint8Array(Q);Y.set($,G?0:Y.length-$.length),$=Y}if($.length!==Q)throw new Error("Field.fromBytes: expected "+Q+" bytes, got "+$.length);let Z=G?S8($):bq($);if(U)Z=i(Z,X);if(!q){if(!this.isValid(Z))throw new Error("invalid field element: outside of range 0..ORDER")}return Z}invertBatch($){return v0(this,$)}cmov($,q,J){return J?q:$}}function m0($,q={}){return new tq($,q)}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var g0=BigInt(0),V$=BigInt(1);function eq($,q){let J=q.negate();return $?J:q}function b0($,q){let J=v0($.Fp,q.map((Q)=>Q.Z));return q.map((Q,G)=>$.fromAffine(Q.toAffine(J[G])))}function QJ($,q){if(!Number.isSafeInteger($)||$<=0||$>q)throw new Error("invalid window size, expected [1.."+q+"], got W="+$)}function I$($,q){QJ($,q);let J=Math.ceil(q/$)+1,Q=2**($-1),G=2**$,X=hq($),U=BigInt($);return{windows:J,windowSize:Q,mask:X,maxNumber:G,shiftBy:U}}function $J($,q,J){let{windowSize:Q,mask:G,maxNumber:X,shiftBy:U}=J,Z=Number($&G),Y=$>>U;if(Z>Q)Z-=X,Y+=V$;let K=q*Q,W=K+Math.abs(Z)-1,O=Z===0,E=Z<0,H=q%2!==0;return{nextN:Y,offset:W,isZero:O,isNeg:E,isNegF:H,offsetF:K}}var w$=new WeakMap,GJ=new WeakMap;function T$($){return GJ.get($)||1}function qJ($){if($!==g0)throw new Error("invalid wNAF")}class A${BASE;ZERO;Fn;bits;constructor($,q){this.BASE=$.BASE,this.ZERO=$.ZERO,this.Fn=$.Fn,this.bits=q}_unsafeLadder($,q,J=this.ZERO){let Q=$;while(q>g0){if(q&V$)J=J.add(Q);Q=Q.double(),q>>=V$}return J}precomputeWindow($,q){let{windows:J,windowSize:Q}=I$(q,this.bits),G=[],X=$,U=X;for(let Z=0;Z<J;Z++){U=X,G.push(U);for(let Y=1;Y<Q;Y++)U=U.add(X),G.push(U);X=U.double()}return G}wNAF($,q,J){if(!this.Fn.isValid(J))throw new Error("invalid scalar");let Q=this.ZERO,G=this.BASE,X=I$($,this.bits);for(let U=0;U<X.windows;U++){let{nextN:Z,offset:Y,isZero:K,isNeg:W,isNegF:O,offsetF:E}=$J(J,U,X);if(J=Z,K)G=G.add(eq(O,q[E]));else Q=Q.add(eq(W,q[Y]))}return qJ(J),{p:Q,f:G}}wNAFUnsafe($,q,J,Q=this.ZERO){let G=I$($,this.bits);for(let X=0;X<G.windows;X++){if(J===g0)break;let{nextN:U,offset:Z,isZero:Y,isNeg:K}=$J(J,X,G);if(J=U,Y)continue;else{let W=q[Z];Q=Q.add(K?W.negate():W)}}return qJ(J),Q}getPrecomputes($,q,J){let Q=w$.get(q);if(!Q){if(Q=this.precomputeWindow(q,$),$!==1){if(typeof J==="function")Q=J(Q);w$.set(q,Q)}}return Q}cached($,q,J){let Q=T$($);return this.wNAF(Q,this.getPrecomputes(Q,$,J),q)}unsafe($,q,J,Q){let G=T$($);if(G===1)return this._unsafeLadder($,q,Q);return this.wNAFUnsafe(G,this.getPrecomputes(G,$,J),q,Q)}createCache($,q){QJ(q,this.bits),GJ.set($,q),w$.delete($)}hasCache($){return T$($)!==1}}function JJ($,q,J){if(q){if(q.ORDER!==$)throw new Error("Field.ORDER must match order: Fp == p, Fn == n");return sq(q),q}else return m0($,{isLE:J})}function XJ($,q,J={},Q){if(Q===void 0)Q=$==="edwards";if(!q||typeof q!=="object")throw new Error(`expected valid ${$} CURVE object`);for(let Y of["p","n","h"]){let K=q[Y];if(!(typeof K==="bigint"&&K>g0))throw new Error(`CURVE.${Y} must be positive bigint`)}let G=JJ(q.p,J.Fp,Q),X=JJ(q.n,J.Fn,Q),Z=["Gx","Gy","a",$==="weierstrass"?"b":"d"];for(let Y of Z)if(!G.isValid(q[Y]))throw new Error(`CURVE.${Y} must be valid field element of CURVE.Fp`);return q=Object.freeze(Object.assign({},q)),{CURVE:q,Fp:G,Fn:X}}function h0($,q){return function J(Q){let G=$(Q);return{secretKey:G,publicKey:q(G)}}}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var b8=BigInt(0),t=BigInt(1),B$=BigInt(2),X1=BigInt(8);function U1($,q,J,Q){let G=$.sqr(J),X=$.sqr(Q),U=$.add($.mul(q.a,G),X),Z=$.add($.ONE,$.mul(q.d,$.mul(G,X)));return $.eql(U,Z)}function UJ($,q={}){let J=XJ("edwards",$,q,q.FpFnLE),{Fp:Q,Fn:G}=J,X=J.CURVE,{h:U}=X;i8(q,{},{uvRatio:"function"});let Z=B$<<BigInt(G.BYTES*8)-t,Y=(I)=>Q.create(I),K=q.uvRatio||((I,P)=>{try{return{isValid:!0,value:Q.sqrt(Q.div(I,P))}}catch(R){return{isValid:!1,value:b8}}});if(!U1(Q,X,X.Gx,X.Gy))throw new Error("bad curve params: generator point");function W(I,P,R=!1){let D=R?t:b8;return J0("coordinate "+I,P,D,Z),P}function O(I){if(!(I instanceof A))throw new Error("EdwardsPoint expected")}let E=H$((I,P)=>{let{X:R,Y:D,Z:k}=I,y=I.is0();if(P==null)P=y?X1:Q.inv(k);let v=Y(R*P),S=Y(D*P),w=Q.mul(k,P);if(y)return{x:b8,y:t};if(w!==t)throw new Error("invZ was invalid");return{x:v,y:S}}),H=H$((I)=>{let{a:P,d:R}=X;if(I.is0())throw new Error("bad point: ZERO");let{X:D,Y:k,Z:y,T:v}=I,S=Y(D*D),w=Y(k*k),j=Y(y*y),_=Y(j*j),h=Y(S*P),u=Y(j*Y(h+w)),N=Y(_+Y(R*Y(S*w)));if(u!==N)throw new Error("bad point: equation left != right (1)");let T=Y(D*k),C=Y(y*v);if(T!==C)throw new Error("bad point: equation left != right (2)");return!0});class A{static BASE=new A(X.Gx,X.Gy,t,Y(X.Gx*X.Gy));static ZERO=new A(b8,t,t,b8);static Fp=Q;static Fn=G;X;Y;Z;T;constructor(I,P,R,D){this.X=W("x",I),this.Y=W("y",P),this.Z=W("z",R,!0),this.T=W("t",D),Object.freeze(this)}static CURVE(){return X}static fromAffine(I){if(I instanceof A)throw new Error("extended point not allowed");let{x:P,y:R}=I||{};return W("x",P),W("y",R),new A(P,R,t,Y(P*R))}static fromBytes(I,P=!1){let R=Q.BYTES,{a:D,d:k}=X;I=n8(c(I,R,"point")),k0(P,"zip215");let y=n8(I),v=I[R-1];y[R-1]=v&-129;let S=S8(y),w=P?Z:Q.ORDER;J0("point.y",S,b8,w);let j=Y(S*S),_=Y(j-t),h=Y(k*j-D),{isValid:u,value:N}=K(_,h);if(!u)throw new Error("bad point: invalid y coordinate");let T=(N&t)===t,C=(v&128)!==0;if(!P&&N===b8&&C)throw new Error("bad point: x=0 and x_0=1");if(C!==T)N=Y(-N);return A.fromAffine({x:N,y:S})}static fromHex(I,P=!1){return A.fromBytes(M0(I),P)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}precompute(I=8,P=!0){if(x.createCache(this,I),!P)this.multiply(B$);return this}assertValidity(){H(this)}equals(I){O(I);let{X:P,Y:R,Z:D}=this,{X:k,Y:y,Z:v}=I,S=Y(P*v),w=Y(k*D),j=Y(R*v),_=Y(y*D);return S===w&&j===_}is0(){return this.equals(A.ZERO)}negate(){return new A(Y(-this.X),this.Y,this.Z,Y(-this.T))}double(){let{a:I}=X,{X:P,Y:R,Z:D}=this,k=Y(P*P),y=Y(R*R),v=Y(B$*Y(D*D)),S=Y(I*k),w=P+R,j=Y(Y(w*w)-k-y),_=S+y,h=_-v,u=S-y,N=Y(j*h),T=Y(_*u),C=Y(j*u),V=Y(h*_);return new A(N,T,V,C)}add(I){O(I);let{a:P,d:R}=X,{X:D,Y:k,Z:y,T:v}=this,{X:S,Y:w,Z:j,T:_}=I,h=Y(D*S),u=Y(k*w),N=Y(v*R*_),T=Y(y*j),C=Y((D+k)*(S+w)-h-u),V=T-N,B=T+N,F=Y(u-P*h),f=Y(C*V),g=Y(B*F),b=Y(C*F),p=Y(V*B);return new A(f,g,p,b)}subtract(I){return this.add(I.negate())}multiply(I){if(!G.isValidNot0(I))throw new Error("invalid scalar: expected 1 <= sc < curve.n");let{p:P,f:R}=x.cached(this,I,(D)=>b0(A,D));return b0(A,[P,R])[0]}multiplyUnsafe(I,P=A.ZERO){if(!G.isValid(I))throw new Error("invalid scalar: expected 0 <= sc < curve.n");if(I===b8)return A.ZERO;if(this.is0()||I===t)return this;return x.unsafe(this,I,(R)=>b0(A,R),P)}isSmallOrder(){return this.multiplyUnsafe(U).is0()}isTorsionFree(){return x.unsafe(this,X.n).is0()}toAffine(I){return E(this,I)}clearCofactor(){if(U===t)return this;return this.multiplyUnsafe(U)}toBytes(){let{x:I,y:P}=this.toAffine(),R=Q.toBytes(P);return R[R.length-1]|=I&t?128:0,R}toHex(){return e8(this.toBytes())}toString(){return`<Point ${this.is0()?"ZERO":this.toHex()}>`}}let x=new A$(A,G.BITS);return A.BASE.precompute(8),A}function YJ($,q,J={}){if(typeof q!=="function")throw new Error(\'"hash" function param is required\');i8(J,{},{adjustScalarBytes:"function",randomBytes:"function",domain:"function",prehash:"function",mapToCurve:"function"});let{prehash:Q}=J,{BASE:G,Fp:X,Fn:U}=$,Z=J.randomBytes||u8,Y=J.adjustScalarBytes||((w)=>w),K=J.domain||((w,j,_)=>{if(k0(_,"phflag"),j.length||_)throw new Error("Contexts/pre-hash are not supported");return w});function W(w){return U.create(S8(w))}function O(w){let j=D.secretKey;c(w,D.secretKey,"secretKey");let _=c(q(w),2*j,"hashedSecretKey"),h=Y(_.slice(0,j)),u=_.slice(j,2*j),N=W(h);return{head:h,prefix:u,scalar:N}}function E(w){let{head:j,prefix:_,scalar:h}=O(w),u=G.multiply(h),N=u.toBytes();return{head:j,prefix:_,scalar:h,point:u,pointBytes:N}}function H(w){return E(w).pointBytes}function A(w=Uint8Array.of(),...j){let _=$0(...j);return W(q(K(_,c(w,void 0,"context"),!!Q)))}function x(w,j,_={}){if(w=c(w,void 0,"message"),Q)w=Q(w);let{prefix:h,scalar:u,pointBytes:N}=E(j),T=A(_.context,h,w),C=G.multiply(T).toBytes(),V=A(_.context,C,N,w),B=U.create(T+V*u);if(!U.isValid(B))throw new Error("sign failed: invalid s");let F=$0(C,U.toBytes(B));return c(F,D.signature,"result")}let I={zip215:!0};function P(w,j,_,h=I){let{context:u,zip215:N}=h,T=D.signature;if(w=c(w,T,"signature"),j=c(j,void 0,"message"),_=c(_,D.publicKey,"publicKey"),N!==void 0)k0(N,"zip215");if(Q)j=Q(j);let C=T/2,V=w.subarray(0,C),B=S8(w.subarray(C,T)),F,f,g;try{F=$.fromBytes(_,N),f=$.fromBytes(V,N),g=G.multiplyUnsafe(B)}catch(j8){return!1}if(!N&&F.isSmallOrder())return!1;let b=A(u,f.toBytes(),F.toBytes(),j);return f.add(F.multiplyUnsafe(b)).subtract(g).clearCofactor().is0()}let R=X.BYTES,D={secretKey:R,publicKey:R,signature:2*R,seed:R};function k(w=Z(D.seed)){return c(w,D.seed,"seed")}function y(w){return Z0(w)&&w.length===U.BYTES}function v(w,j){try{return!!$.fromBytes(w,j)}catch(_){return!1}}let S={getExtendedPublicKey:E,randomSecretKey:k,isValidSecretKey:y,isValidPublicKey:v,toMontgomery(w){let{y:j}=$.fromBytes(w),_=D.publicKey,h=_===32;if(!h&&_!==57)throw new Error("only defined for 25519 and 448");let u=h?X.div(t+j,t-j):X.div(j-t,j+t);return X.toBytes(u)},toMontgomerySecret(w){let j=D.secretKey;c(w,j);let _=q(w.subarray(0,j));return Y(_).subarray(0,j)}};return Object.freeze({keygen:h0(k,H),getPublicKey:H,sign:x,verify:P,utils:S,Point:$,lengths:D})}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var z0=BigInt(0),Q0=BigInt(1),p0=BigInt(2);function Y1($){return i8($,{adjustScalarBytes:"function",powPminus2:"function"}),Object.freeze({...$})}function ZJ($){let q=Y1($),{P:J,type:Q,adjustScalarBytes:G,powPminus2:X,randomBytes:U}=q,Z=Q==="x25519";if(!Z&&Q!=="x448")throw new Error("invalid type");let Y=U||u8,K=Z?255:448,W=Z?32:56,O=Z?BigInt(9):BigInt(5),E=Z?BigInt(121665):BigInt(39081),H=Z?p0**BigInt(254):p0**BigInt(447),A=Z?BigInt(8)*p0**BigInt(251)-Q0:BigInt(4)*p0**BigInt(445)-Q0,x=H+A+Q0,I=(T)=>i(T,J),P=R(O);function R(T){return y0(I(T),W)}function D(T){let C=n8(c(T,W,"uCoordinate"));if(Z)C[31]&=127;return I(S8(C))}function k(T){return S8(G(n8(c(T,W,"scalar"))))}function y(T,C){let V=_(D(C),k(T));if(V===z0)throw new Error("invalid private or public key received");return R(V)}function v(T){return y(T,P)}let S=v,w=y;function j(T,C,V){let B=I(T*(C-V));return C=I(C-B),V=I(V+B),{x_2:C,x_3:V}}function _(T,C){J0("u",T,z0,J),J0("scalar",C,H,x);let V=C,B=T,F=Q0,f=z0,g=T,b=Q0,p=z0;for(let W$=BigInt(K-1);W$>=z0;W$--){let Zq=V>>W$&Q0;p^=Zq,{x_2:F,x_3:g}=j(p,F,g),{x_2:f,x_3:b}=j(p,f,b),p=Zq;let M$=F+f,N$=I(M$*M$),K$=F-f,Wq=I(K$*K$),Mq=N$-Wq,fQ=g+b,FQ=g-b,Nq=I(FQ*M$),Kq=I(fQ*K$),Oq=Nq+Kq,zq=Nq-Kq;g=I(Oq*Oq),b=I(B*I(zq*zq)),F=I(N$*Wq),f=I(Mq*(N$+I(E*Mq)))}({x_2:F,x_3:g}=j(p,F,g)),{x_2:f,x_3:b}=j(p,f,b);let j8=X(f);return I(F*j8)}let h={secretKey:W,publicKey:W,seed:W},u=(T=Y(W))=>{return c(T,h.seed,"seed"),T},N={randomSecretKey:u};return Object.freeze({keygen:h0(u,S),getSharedSecret:w,getPublicKey:S,scalarMult:y,scalarMultBase:v,utils:N,GuBytes:P.slice(),lengths:h})}/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */var Z1=BigInt(1),WJ=BigInt(2),W1=BigInt(3),M1=BigInt(5),N1=BigInt(8),c0=BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"),K1=(()=>({p:c0,n:BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),h:N1,a:BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),d:BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),Gx:BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),Gy:BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")}))();function NJ($){let q=BigInt(10),J=BigInt(20),Q=BigInt(40),G=BigInt(80),X=c0,Z=$*$%X*$%X,Y=D8(Z,WJ,X)*Z%X,K=D8(Y,Z1,X)*$%X,W=D8(K,M1,X)*K%X,O=D8(W,q,X)*W%X,E=D8(O,J,X)*O%X,H=D8(E,Q,X)*E%X,A=D8(H,G,X)*H%X,x=D8(A,G,X)*H%X,I=D8(x,q,X)*W%X;return{pow_p_5_8:D8(I,WJ,X)*$%X,b2:Z}}function KJ($){return $[0]&=248,$[31]&=127,$[31]|=64,$}var MJ=BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");function O1($,q){let J=c0,Q=i(q*q*q,J),G=i(Q*Q*q,J),X=NJ($*G).pow_p_5_8,U=i($*Q*X,J),Z=i(q*U*U,J),Y=U,K=i(U*MJ,J),W=Z===$,O=Z===i(-$,J),E=Z===i(-$*MJ,J);if(W)U=Y;if(O||E)U=K;if(aq(U,J))U=i(-U,J);return{isValid:W||O,value:U}}var z1=UJ(K1,{uvRatio:O1});function E1($){return YJ(z1,yq,Object.assign({adjustScalarBytes:KJ},$))}var h8=E1({});var E0=(()=>{let $=c0;return ZJ({P:$,type:"x25519",powPminus2:(q)=>{let{pow_p_5_8:J,b2:Q}=NJ(q);return i(D8(J,W1,$)*Q,$)},adjustScalarBytes:KJ})})();var yJ=Dq(j$(),1);var P$;try{P$=new TextDecoder}catch($){}var m,a8,L=0;var RJ=[],D1=105,C1=57342,R1=57343,zJ=57337;var EJ=6,G0={},D0=112810000,_8=16810000;var f$=RJ,F$=0,d={},r,l0,n0=0,R0=0,a,C8,o=[],x$=[],K8,Z8,C0,DJ={useRecords:!1,mapsAsObjects:!0},H0=!1,HJ=2;try{new Function("")}catch($){HJ=1/0}class p8{constructor($){if($){if(($.keyMap||$._keyMap)&&!$.useRecords)$.useRecords=!1,$.mapsAsObjects=!0;if($.useRecords===!1&&$.mapsAsObjects===void 0)$.mapsAsObjects=!0;if($.getStructures)$.getShared=$.getStructures;if($.getShared&&!$.structures)($.structures=[]).uninitialized=!0;if($.keyMap){this.mapKey=new Map;for(let[q,J]of Object.entries($.keyMap))this.mapKey.set(J,q)}}Object.assign(this,$)}decodeKey($){return this.keyMap?this.mapKey.get($)||$:$}encodeKey($){return this.keyMap&&this.keyMap.hasOwnProperty($)?this.keyMap[$]:$}encodeKeys($){if(!this._keyMap)return $;let q=new Map;for(let[J,Q]of Object.entries($))q.set(this._keyMap.hasOwnProperty(J)?this._keyMap[J]:J,Q);return q}decodeKeys($){if(!this._keyMap||$.constructor.name!="Map")return $;if(!this._mapKey){this._mapKey=new Map;for(let[J,Q]of Object.entries(this._keyMap))this._mapKey.set(Q,J)}let q={};return $.forEach((J,Q)=>q[R8(this._mapKey.has(Q)?this._mapKey.get(Q):Q)]=J),q}mapDecode($,q){let J=this.decode($);if(this._keyMap)switch(J.constructor.name){case"Array":return J.map((Q)=>this.decodeKeys(Q))}return J}decode($,q){if(m)return TJ(()=>{return i0(),this?this.decode($,q):p8.prototype.decode.call(DJ,$,q)});a8=q>-1?q:$.length,L=0,F$=0,R0=0,l0=null,f$=RJ,a=null,m=$;try{Z8=$.dataView||($.dataView=new DataView($.buffer,$.byteOffset,$.byteLength))}catch(J){if(m=null,$ instanceof Uint8Array)throw J;throw new Error("Source must be a Uint8Array or Buffer but was a "+($&&typeof $=="object"?$.constructor.name:typeof $))}if(this instanceof p8){if(d=this,K8=this.sharedValues&&(this.pack?new Array(this.maxPrivatePackedValues||16).concat(this.sharedValues):this.sharedValues),this.structures)return r=this.structures,u0();else if(!r||r.length>0)r=[]}else{if(d=DJ,!r||r.length>0)r=[];K8=null}return u0()}decodeMultiple($,q){let J,Q=0;try{let G=$.length;H0=!0;let X=this?this.decode($,G):m$.decode($,G);if(q){if(q(X)===!1)return;while(L<G)if(Q=L,q(u0())===!1)return}else{J=[X];while(L<G)Q=L,J.push(u0());return J}}catch(G){throw G.lastPosition=Q,G.values=J,G}finally{H0=!1,i0()}}}function u0(){try{let $=l();if(a){if(L>=a.postBundlePosition){let q=new Error("Unexpected bundle position");throw q.incomplete=!0,q}L=a.postBundlePosition,a=null}if(L==a8){if(r=null,m=null,C8)C8=null}else if(L>a8){let q=new Error("Unexpected end of CBOR data");throw q.incomplete=!0,q}else if(!H0)throw new Error("Data read, but end of buffer not reached");return $}catch($){if(i0(),$ instanceof RangeError||$.message.startsWith("Unexpected end of buffer"))$.incomplete=!0;throw $}}function l(){let $=m[L++],q=$>>5;if($=$&31,$>23)switch($){case 24:$=m[L++];break;case 25:if(q==7)return w1();$=Z8.getUint16(L),L+=2;break;case 26:if(q==7){let J=Z8.getFloat32(L);if(d.useFloat32>2){let Q=r0[(m[L]&127)<<1|m[L+1]>>7];return L+=4,(Q*J+(J>0?0.5:-0.5)>>0)/Q}return L+=4,J}$=Z8.getUint32(L),L+=4;break;case 27:if(q==7){let J=Z8.getFloat64(L);return L+=8,J}if(q>1){if(Z8.getUint32(L)>0)throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");$=Z8.getUint32(L+4)}else if(d.int64AsNumber)$=Z8.getUint32(L)*4294967296,$+=Z8.getUint32(L+4);else $=Z8.getBigUint64(L);L+=8;break;case 31:switch(q){case 2:case 3:throw new Error("Indefinite length not supported for byte or text strings");case 4:let J=[],Q,G=0;while((Q=l())!=G0){if(G>=D0)throw new Error(`Array length exceeds ${D0}`);J[G++]=Q}return q==4?J:q==3?J.join(""):Buffer.concat(J);case 5:let X;if(d.mapsAsObjects){let U={},Z=0;if(d.keyMap)while((X=l())!=G0){if(Z++>=_8)throw new Error(`Property count exceeds ${_8}`);U[R8(d.decodeKey(X))]=l()}else while((X=l())!=G0){if(Z++>=_8)throw new Error(`Property count exceeds ${_8}`);U[R8(X)]=l()}return U}else{if(C0)d.mapsAsObjects=!0,C0=!1;let U=new Map;if(d.keyMap){let Z=0;while((X=l())!=G0){if(Z++>=_8)throw new Error(`Map size exceeds ${_8}`);U.set(d.decodeKey(X),l())}}else{let Z=0;while((X=l())!=G0){if(Z++>=_8)throw new Error(`Map size exceeds ${_8}`);U.set(X,l())}}return U}case 7:return G0;default:throw new Error("Invalid major type for indefinite length "+q)}default:throw new Error("Unknown token "+$)}switch(q){case 0:return $;case 1:return~$;case 2:return I1($);case 3:if(R0>=L)return l0.slice(L-n0,(L+=$)-n0);if(R0==0&&a8<140&&$<32){let G=$<16?LJ($):L1($);if(G!=null)return G}return H1($);case 4:if($>=D0)throw new Error(`Array length exceeds ${D0}`);let J=new Array($);for(let G=0;G<$;G++)J[G]=l();return J;case 5:if($>=_8)throw new Error(`Map size exceeds ${D0}`);if(d.mapsAsObjects){let G={};if(d.keyMap)for(let X=0;X<$;X++)G[R8(d.decodeKey(l()))]=l();else for(let X=0;X<$;X++)G[R8(l())]=l();return G}else{if(C0)d.mapsAsObjects=!0,C0=!1;let G=new Map;if(d.keyMap)for(let X=0;X<$;X++)G.set(d.decodeKey(l()),l());else for(let X=0;X<$;X++)G.set(l(),l());return G}case 6:if($>=zJ){let G=r[$&8191];if(G){if(!G.read)G.read=S$(G);return G.read()}if($<65536){if($==R1){let X=U0(),U=l(),Z=l();k$(U,Z);let Y={};if(d.keyMap)for(let K=2;K<X;K++){let W=d.decodeKey(Z[K-2]);Y[R8(W)]=l()}else for(let K=2;K<X;K++){let W=Z[K-2];Y[R8(W)]=l()}return Y}else if($==C1){let X=U0(),U=l();for(let Z=2;Z<X;Z++)k$(U++,l());return l()}else if($==zJ)return P1();if(d.getShared){if(v$(),G=r[$&8191],G){if(!G.read)G.read=S$(G);return G.read()}}}}let Q=o[$];if(Q)if(Q.handlesRead)return Q(l);else return Q(l());else{let G=l();for(let X=0;X<x$.length;X++){let U=x$[X]($,G);if(U!==void 0)return U}return new T8(G,$)}case 7:switch($){case 20:return!1;case 21:return!0;case 22:return null;case 23:return;case 31:default:let G=(K8||o8())[$];if(G!==void 0)return G;throw new Error("Unknown token "+$)}default:if(isNaN($)){let G=new Error("Unexpected end of CBOR data");throw G.incomplete=!0,G}throw new Error("Unknown CBOR token "+$)}}var CJ=/^[a-zA-Z_$][a-zA-Z\\d_$]*$/;function S$($){if(!$)throw new Error("Structure is required in record definition");function q(){let J=m[L++];if(J=J&31,J>23)switch(J){case 24:J=m[L++];break;case 25:J=Z8.getUint16(L),L+=2;break;case 26:J=Z8.getUint32(L),L+=4;break;default:throw new Error("Expected array header, but got "+m[L-1])}let Q=this.compiledReader;while(Q){if(Q.propertyCount===J)return Q(l);Q=Q.next}if(this.slowReads++>=HJ){let X=this.length==J?this:this.slice(0,J);if(Q=d.keyMap?new Function("r","return {"+X.map((U)=>d.decodeKey(U)).map((U)=>CJ.test(U)?R8(U)+":r()":"["+JSON.stringify(U)+"]:r()").join(",")+"}"):new Function("r","return {"+X.map((U)=>CJ.test(U)?R8(U)+":r()":"["+JSON.stringify(U)+"]:r()").join(",")+"}"),this.compiledReader)Q.next=this.compiledReader;return Q.propertyCount=J,this.compiledReader=Q,Q(l)}let G={};if(d.keyMap)for(let X=0;X<J;X++)G[R8(d.decodeKey(this[X]))]=l();else for(let X=0;X<J;X++)G[R8(this[X])]=l();return G}return $.slowReads=0,q}function R8($){if(typeof $==="string")return $==="__proto__"?"__proto_":$;if(typeof $==="number"||typeof $==="boolean"||typeof $==="bigint")return $.toString();if($==null)return $+"";throw new Error("Invalid property name type "+typeof $)}var H1=_$;function _$($){let q;if($<16){if(q=LJ($))return q}if($>64&&P$)return P$.decode(m.subarray(L,L+=$));let J=L+$,Q=[];q="";while(L<J){let G=m[L++];if((G&128)===0)Q.push(G);else if((G&224)===192){let X=m[L++]&63;Q.push((G&31)<<6|X)}else if((G&240)===224){let X=m[L++]&63,U=m[L++]&63;Q.push((G&31)<<12|X<<6|U)}else if((G&248)===240){let X=m[L++]&63,U=m[L++]&63,Z=m[L++]&63,Y=(G&7)<<18|X<<12|U<<6|Z;if(Y>65535)Y-=65536,Q.push(Y>>>10&1023|55296),Y=56320|Y&1023;Q.push(Y)}else Q.push(G);if(Q.length>=4096)q+=e.apply(String,Q),Q.length=0}if(Q.length>0)q+=e.apply(String,Q);return q}var e=String.fromCharCode;function L1($){let q=L,J=new Array($);for(let Q=0;Q<$;Q++){let G=m[L++];if((G&128)>0){L=q;return}J[Q]=G}return e.apply(String,J)}function LJ($){if($<4)if($<2)if($===0)return"";else{let q=m[L++];if((q&128)>1){L-=1;return}return e(q)}else{let q=m[L++],J=m[L++];if((q&128)>0||(J&128)>0){L-=2;return}if($<3)return e(q,J);let Q=m[L++];if((Q&128)>0){L-=3;return}return e(q,J,Q)}else{let q=m[L++],J=m[L++],Q=m[L++],G=m[L++];if((q&128)>0||(J&128)>0||(Q&128)>0||(G&128)>0){L-=4;return}if($<6)if($===4)return e(q,J,Q,G);else{let X=m[L++];if((X&128)>0){L-=5;return}return e(q,J,Q,G,X)}else if($<8){let X=m[L++],U=m[L++];if((X&128)>0||(U&128)>0){L-=6;return}if($<7)return e(q,J,Q,G,X,U);let Z=m[L++];if((Z&128)>0){L-=7;return}return e(q,J,Q,G,X,U,Z)}else{let X=m[L++],U=m[L++],Z=m[L++],Y=m[L++];if((X&128)>0||(U&128)>0||(Z&128)>0||(Y&128)>0){L-=8;return}if($<10)if($===8)return e(q,J,Q,G,X,U,Z,Y);else{let K=m[L++];if((K&128)>0){L-=9;return}return e(q,J,Q,G,X,U,Z,Y,K)}else if($<12){let K=m[L++],W=m[L++];if((K&128)>0||(W&128)>0){L-=10;return}if($<11)return e(q,J,Q,G,X,U,Z,Y,K,W);let O=m[L++];if((O&128)>0){L-=11;return}return e(q,J,Q,G,X,U,Z,Y,K,W,O)}else{let K=m[L++],W=m[L++],O=m[L++],E=m[L++];if((K&128)>0||(W&128)>0||(O&128)>0||(E&128)>0){L-=12;return}if($<14)if($===12)return e(q,J,Q,G,X,U,Z,Y,K,W,O,E);else{let H=m[L++];if((H&128)>0){L-=13;return}return e(q,J,Q,G,X,U,Z,Y,K,W,O,E,H)}else{let H=m[L++],A=m[L++];if((H&128)>0||(A&128)>0){L-=14;return}if($<15)return e(q,J,Q,G,X,U,Z,Y,K,W,O,E,H,A);let x=m[L++];if((x&128)>0){L-=15;return}return e(q,J,Q,G,X,U,Z,Y,K,W,O,E,H,A,x)}}}}}function I1($){return d.copyBuffers?Uint8Array.prototype.slice.call(m,L,L+=$):m.subarray(L,L+=$)}var IJ=new Float32Array(1),d0=new Uint8Array(IJ.buffer,0,4);function w1(){let $=m[L++],q=m[L++],J=($&127)>>2;if(J===31){if(q||$&3)return NaN;return $&128?-1/0:1/0}if(J===0){let Q=(($&3)<<8|q)/16777216;return $&128?-Q:Q}return d0[3]=$&128|(J>>1)+56,d0[2]=($&7)<<5|q>>3,d0[1]=q<<5,d0[0]=0,IJ[0]}var QG=new Array(4096);class T8{constructor($,q){this.value=$,this.tag=q}}o[0]=($)=>{return new Date($)};o[1]=($)=>{return new Date(Math.round($*1000))};o[2]=($)=>{let q=BigInt(0);for(let J=0,Q=$.byteLength;J<Q;J++)q=BigInt($[J])+(q<<BigInt(8));return q};o[3]=($)=>{return BigInt(-1)-o[2]($)};o[4]=($)=>{return+($[1]+"e"+$[0])};o[5]=($)=>{return $[1]*Math.exp($[0]*Math.log(2))};var k$=($,q)=>{$=$-57344;let J=r[$];if(J&&J.isShared)(r.restoreStructures||(r.restoreStructures=[]))[$]=J;r[$]=q,q.read=S$(q)};o[D1]=($)=>{let q=$.length,J=$[1];k$($[0],J);let Q={};for(let G=2;G<q;G++){let X=J[G-2];Q[R8(X)]=$[G]}return Q};o[14]=($)=>{if(a)return a[0].slice(a.position0,a.position0+=$);return new T8($,14)};o[15]=($)=>{if(a)return a[1].slice(a.position1,a.position1+=$);return new T8($,15)};var T1={Error,RegExp};o[27]=($)=>{return(T1[$[0]]||Error)($[1],$[2])};var wJ=($)=>{if(m[L++]!=132){let J=new Error("Packed values structure must be followed by a 4 element array");if(m.length<L)J.incomplete=!0;throw J}let q=$();if(!q||!q.length){let J=new Error("Packed values structure must be followed by a 4 element array");throw J.incomplete=!0,J}return K8=K8?q.concat(K8.slice(q.length)):q,K8.prefixes=$(),K8.suffixes=$(),$()};wJ.handlesRead=!0;o[51]=wJ;o[EJ]=($)=>{if(!K8)if(d.getShared)v$();else return new T8($,EJ);if(typeof $=="number")return K8[16+($>=0?2*$:-2*$-1)];let q=new Error("No support for non-integer packed references yet");if($===void 0)q.incomplete=!0;throw q};o[28]=($)=>{if(!C8)C8=new Map,C8.id=0;let q=C8.id++,J=L,Q=m[L],G;if(Q>>5==4)G=[];else G={};let X={target:G};C8.set(q,X);let U=$();if(X.used){if(Object.getPrototypeOf(G)!==Object.getPrototypeOf(U))L=J,G=U,C8.set(q,{target:G}),U=$();return Object.assign(G,U)}return X.target=U,U};o[28].handlesRead=!0;o[29]=($)=>{let q=C8.get($);return q.used=!0,q.target};o[258]=($)=>new Set($);(o[259]=($)=>{if(d.mapsAsObjects)d.mapsAsObjects=!1,C0=!0;return $()}).handlesRead=!0;function X0($,q){if(typeof $==="string")return $+q;if($ instanceof Array)return $.concat(q);return Object.assign({},$,q)}function o8(){if(!K8)if(d.getShared)v$();else throw new Error("No packed values available");return K8}var V1=1399353956;x$.push(($,q)=>{if($>=225&&$<=255)return X0(o8().prefixes[$-224],q);if($>=28704&&$<=32767)return X0(o8().prefixes[$-28672],q);if($>=1879052288&&$<=2147483647)return X0(o8().prefixes[$-1879048192],q);if($>=216&&$<=223)return X0(q,o8().suffixes[$-216]);if($>=27647&&$<=28671)return X0(q,o8().suffixes[$-27639]);if($>=1811940352&&$<=1879048191)return X0(q,o8().suffixes[$-1811939328]);if($==V1)return{packedValues:K8,structures:r.slice(0),version:q};if($==55799)return q});var A1=new Uint8Array(new Uint16Array([1]).buffer)[0]==1,y$=[Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,typeof BigUint64Array=="undefined"?{name:"BigUint64Array"}:BigUint64Array,Int8Array,Int16Array,Int32Array,typeof BigInt64Array=="undefined"?{name:"BigInt64Array"}:BigInt64Array,Float32Array,Float64Array],B1=[64,68,69,70,71,72,77,78,79,85,86];for(let $=0;$<y$.length;$++)j1(y$[$],B1[$]);function j1($,q){let J="get"+$.name.slice(0,-5),Q;if(typeof $==="function")Q=$.BYTES_PER_ELEMENT;else $=null;for(let G=0;G<2;G++){if(!G&&Q==1)continue;let X=Q==2?1:Q==4?2:Q==8?3:0;o[G?q:q-4]=Q==1||G==A1?(U)=>{if(!$)throw new Error("Could not find typed array for code "+q);if(!d.copyBuffers){if(Q===1||Q===2&&!(U.byteOffset&1)||Q===4&&!(U.byteOffset&3)||Q===8&&!(U.byteOffset&7))return new $(U.buffer,U.byteOffset,U.byteLength>>X)}return new $(Uint8Array.prototype.slice.call(U,0).buffer)}:(U)=>{if(!$)throw new Error("Could not find typed array for code "+q);let Z=new DataView(U.buffer,U.byteOffset,U.byteLength),Y=U.length>>X,K=new $(Y),W=Z[J];for(let O=0;O<Y;O++)K[O]=W.call(Z,O<<X,G);return K}}}function P1(){let $=U0(),q=L+l();for(let Q=2;Q<$;Q++){let G=U0();L+=G}let J=L;return L=q,a=[_$(U0()),_$(U0())],a.position0=0,a.position1=0,a.postBundlePosition=L,L=J,l()}function U0(){let $=m[L++]&31;if($>23)switch($){case 24:$=m[L++];break;case 25:$=Z8.getUint16(L),L+=2;break;case 26:$=Z8.getUint32(L),L+=4;break}return $}function v$(){if(d.getShared){let $=TJ(()=>{return m=null,d.getShared()})||{},q=$.structures||[];if(d.sharedVersion=$.version,K8=d.sharedValues=$.packedValues,r===!0)d.structures=r=q;else r.splice.apply(r,[0,q.length].concat(q))}}function TJ($){let q=a8,J=L,Q=F$,G=n0,X=R0,U=l0,Z=f$,Y=C8,K=a,W=new Uint8Array(m.slice(0,a8)),O=r,E=d,H=H0,A=$();return a8=q,L=J,F$=Q,n0=G,R0=X,l0=U,f$=Z,C8=Y,a=K,m=W,H0=H,r=O,d=E,Z8=new DataView(m.buffer,m.byteOffset,m.byteLength),A}function i0(){m=null,C8=null,r=null}var r0=new Array(147);for(let $=0;$<256;$++)r0[$]=+("1e"+Math.floor(45.15-$*0.30103));var m$=new p8({useRecords:!1}),o0=m$.decode,f1=m$.decodeMultiple;var a0;try{a0=new TextEncoder}catch($){}var c$,FJ,t0=typeof globalThis==="object"&&globalThis.Buffer,L0=typeof t0!=="undefined",g$=L0?t0.allocUnsafeSlow:Uint8Array,VJ=L0?t0:Uint8Array,AJ=256,BJ=L0?4294967296:2144337920;var b$,z,n,M=0,c8,s=null,F1=61440,x1=/[\\u0080-\\uFFFF]/,E8=Symbol("record-id");class e0 extends p8{constructor($){super($);this.offset=0;let q,J,Q,G,X,U;$=$||{};let Z=VJ.prototype.utf8Write?function(N,T,C){return z.utf8Write(N,T,C)}:a0&&a0.encodeInto?function(N,T){return a0.encodeInto(N,z.subarray(T)).written}:!1,Y=this,K=$.structures||$.saveStructures,W=$.maxSharedStructures;if(W==null)W=K?128:0;if(W>8190)throw new Error("Maximum maxSharedStructure is 8190");let O=$.sequential;if(O)W=0;if(!this.structures)this.structures=[];if(this.saveStructures)this.saveShared=this.saveStructures;let E,H,A=$.sharedValues,x;if(A){x=Object.create(null);for(let N=0,T=A.length;N<T;N++)x[A[N]]=N}let I=[],P=0,R=0;this.mapEncode=function(N,T){if(this._keyMap&&!this._mapped)switch(N.constructor.name){case"Array":N=N.map((C)=>this.encodeKeys(C));break}return this.encode(N,T)},this.encode=function(N,T){if(!z)z=new g$(8192),n=new DataView(z.buffer,0,8192),M=0;if(c8=z.length-10,c8-M<2048)z=new g$(z.length),n=new DataView(z.buffer,0,z.length),c8=z.length-10,M=0;else if(T===d$)M=M+7&2147483640;if(J=M,Y.useSelfDescribedHeader)n.setUint32(M,3654940416),M+=3;if(U=Y.structuredClone?new Map:null,Y.bundleStrings&&typeof N!=="string")s=[],s.size=1/0;else s=null;if(Q=Y.structures,Q){if(Q.uninitialized){let V=Y.getShared()||{};Y.structures=Q=V.structures||[],Y.sharedVersion=V.version;let B=Y.sharedValues=V.packedValues;if(B){x={};for(let F=0,f=B.length;F<f;F++)x[B[F]]=F}}let C=Q.length;if(C>W&&!O)C=W;if(!Q.transitions){Q.transitions=Object.create(null);for(let V=0;V<C;V++){let B=Q[V];if(!B)continue;let F,f=Q.transitions;for(let g=0,b=B.length;g<b;g++){if(f[E8]===void 0)f[E8]=V;let p=B[g];if(F=f[p],!F)F=f[p]=Object.create(null);f=F}f[E8]=V|1048576}}if(!O)Q.nextId=C}if(G)G=!1;if(X=Q||[],H=x,$.pack){let C=new Map;if(C.values=[],C.encoder=Y,C.maxValues=$.maxPrivatePackedValues||(x?16:1/0),C.objectMap=x||!1,C.samplingPackedValues=E,s0(N,C),C.values.length>0){z[M++]=216,z[M++]=51,A8(4);let V=C.values;D(V),A8(0),A8(0),H=Object.create(x||null);for(let B=0,F=V.length;B<F;B++)H[V[B]]=B}}b$=T&p$;try{if(b$)return;if(D(N),s)PJ(J,D);if(Y.offset=M,U&&U.idsToInsert){if(M+=U.idsToInsert.length*2,M>c8)y(M);Y.offset=M;let C=k1(z.subarray(J,M),U.idsToInsert);return U=null,C}if(T&d$)return z.start=J,z.end=M,z;return z.subarray(J,M)}finally{if(Q){if(R<10)R++;if(Q.length>W)Q.length=W;if(P>1e4){if(Q.transitions=null,R=0,P=0,I.length>0)I=[]}else if(I.length>0&&!O){for(let C=0,V=I.length;C<V;C++)I[C][E8]=void 0;I=[]}}if(G&&Y.saveShared){if(Y.structures.length>W)Y.structures=Y.structures.slice(0,W);let C=z.subarray(J,M);if(Y.updateSharedData()===!1)return Y.encode(N);return C}if(T&g1)M=J}},this.findCommonStringsToPack=()=>{if(E=new Map,!x)x=Object.create(null);return(N)=>{let T=N&&N.threshold||4,C=this.pack?N.maxPrivatePackedValues||16:0;if(!A)A=this.sharedValues=[];for(let[V,B]of E)if(B.count>T)x[V]=C++,A.push(V),G=!0;while(this.saveShared&&this.updateSharedData()===!1);E=null}};let D=(N)=>{if(M>c8)z=y(M);var T=typeof N,C;if(T==="string"){if(H){let f=H[N];if(f>=0){if(f<16)z[M++]=f+224;else if(z[M++]=198,f&1)D(15-f>>1);else D(f-16>>1);return}else if(E&&!$.pack){let g=E.get(N);if(g)g.count++;else E.set(N,{count:1})}}let V=N.length;if(s&&V>=4&&V<1024){if((s.size+=V)>F1){let g,b=(s[0]?s[0].length*3+s[1].length:0)+10;if(M+b>c8)z=y(M+b);if(z[M++]=217,z[M++]=223,z[M++]=249,z[M++]=s.position?132:130,z[M++]=26,g=M-J,M+=4,s.position)PJ(J,D);s=["",""],s.size=0,s.position=g}let f=x1.test(N);s[f?0:1]+=N,z[M++]=f?206:207,D(V);return}let B;if(V<32)B=1;else if(V<256)B=2;else if(V<65536)B=3;else B=5;let F=V*3;if(M+F>c8)z=y(M+F);if(V<64||!Z){let f,g,b,p=M+B;for(f=0;f<V;f++)if(g=N.charCodeAt(f),g<128)z[p++]=g;else if(g<2048)z[p++]=g>>6|192,z[p++]=g&63|128;else if((g&64512)===55296&&((b=N.charCodeAt(f+1))&64512)===56320)g=65536+((g&1023)<<10)+(b&1023),f++,z[p++]=g>>18|240,z[p++]=g>>12&63|128,z[p++]=g>>6&63|128,z[p++]=g&63|128;else z[p++]=g>>12|224,z[p++]=g>>6&63|128,z[p++]=g&63|128;C=p-M-B}else C=Z(N,M+B,F);if(C<24)z[M++]=96|C;else if(C<256){if(B<2)z.copyWithin(M+2,M+1,M+1+C);z[M++]=120,z[M++]=C}else if(C<65536){if(B<3)z.copyWithin(M+3,M+2,M+2+C);z[M++]=121,z[M++]=C>>8,z[M++]=C&255}else{if(B<5)z.copyWithin(M+5,M+3,M+3+C);z[M++]=122,n.setUint32(M,C),M+=4}M+=C}else if(T==="number")if(!this.alwaysUseFloat&&N>>>0===N)if(N<24)z[M++]=N;else if(N<256)z[M++]=24,z[M++]=N;else if(N<65536)z[M++]=25,z[M++]=N>>8,z[M++]=N&255;else z[M++]=26,n.setUint32(M,N),M+=4;else if(!this.alwaysUseFloat&&N>>0===N)if(N>=-24)z[M++]=31-N;else if(N>=-256)z[M++]=56,z[M++]=~N;else if(N>=-65536)z[M++]=57,n.setUint16(M,~N),M+=2;else z[M++]=58,n.setUint32(M,~N),M+=4;else{let V;if((V=this.useFloat32)>0&&N<4294967296&&N>=-2147483648){z[M++]=250,n.setFloat32(M,N);let B;if(V<4||(B=N*r0[(z[M]&127)<<1|z[M+1]>>7])>>0===B){M+=4;return}else M--}z[M++]=251,n.setFloat64(M,N),M+=8}else if(T==="object")if(!N)z[M++]=246;else{if(U){let B=U.get(N);if(B){if(z[M++]=216,z[M++]=29,z[M++]=25,!B.references){let F=U.idsToInsert||(U.idsToInsert=[]);B.references=[],F.push(B)}B.references.push(M-J),M+=2;return}else U.set(N,{offset:M-J})}let V=N.constructor;if(V===Object)k(N);else if(V===Array){if(C=N.length,C<24)z[M++]=128|C;else A8(C);for(let B=0;B<C;B++)D(N[B])}else if(V===Map){if(this.mapsAsObjects?this.useTag259ForMaps!==!1:this.useTag259ForMaps)z[M++]=217,z[M++]=1,z[M++]=3;if(C=N.size,C<24)z[M++]=160|C;else if(C<256)z[M++]=184,z[M++]=C;else if(C<65536)z[M++]=185,z[M++]=C>>8,z[M++]=C&255;else z[M++]=186,n.setUint32(M,C),M+=4;if(Y.keyMap)for(let[B,F]of N)D(Y.encodeKey(B)),D(F);else for(let[B,F]of N)D(B),D(F)}else{for(let B=0,F=c$.length;B<F;B++){let f=FJ[B];if(N instanceof f){let g=c$[B],b=g.tag;if(b==null)b=g.getTag&&g.getTag.call(this,N);if(b<24)z[M++]=192|b;else if(b<256)z[M++]=216,z[M++]=b;else if(b<65536)z[M++]=217,z[M++]=b>>8,z[M++]=b&255;else if(b>-1)z[M++]=218,n.setUint32(M,b),M+=4;g.encode.call(this,N,D,y);return}}if(N[Symbol.iterator]){if(b$){let B=new Error("Iterable should be serialized as iterator");throw B.iteratorNotHandled=!0,B}z[M++]=159;for(let B of N)D(B);z[M++]=255;return}if(N[Symbol.asyncIterator]||h$(N)){let B=new Error("Iterable/blob should be serialized as iterator");throw B.iteratorNotHandled=!0,B}if(this.useToJSON&&N.toJSON){let B=N.toJSON();if(B!==N)return D(B)}k(N)}}else if(T==="boolean")z[M++]=N?245:244;else if(T==="bigint"){if(N<BigInt(1)<<BigInt(64)&&N>=0)z[M++]=27,n.setBigUint64(M,N);else if(N>-(BigInt(1)<<BigInt(64))&&N<0)z[M++]=59,n.setBigUint64(M,-N-BigInt(1));else if(this.largeBigIntToFloat)z[M++]=251,n.setFloat64(M,Number(N));else{if(N>=BigInt(0))z[M++]=194;else z[M++]=195,N=BigInt(-1)-N;let V=[];while(N)V.push(Number(N&BigInt(255))),N>>=BigInt(8);u$(new Uint8Array(V.reverse()),y);return}M+=8}else if(T==="undefined")z[M++]=247;else throw new Error("Unknown type: "+T)},k=this.useRecords===!1?this.variableMapSize?(N)=>{let T=Object.keys(N),C=Object.values(N),V=T.length;if(V<24)z[M++]=160|V;else if(V<256)z[M++]=184,z[M++]=V;else if(V<65536)z[M++]=185,z[M++]=V>>8,z[M++]=V&255;else z[M++]=186,n.setUint32(M,V),M+=4;let B;if(Y.keyMap)for(let F=0;F<V;F++)D(Y.encodeKey(T[F])),D(C[F]);else for(let F=0;F<V;F++)D(T[F]),D(C[F])}:(N)=>{z[M++]=185;let T=M-J;M+=2;let C=0;if(Y.keyMap){for(let V in N)if(typeof N.hasOwnProperty!=="function"||N.hasOwnProperty(V))D(Y.encodeKey(V)),D(N[V]),C++}else for(let V in N)if(typeof N.hasOwnProperty!=="function"||N.hasOwnProperty(V))D(V),D(N[V]),C++;z[T+++J]=C>>8,z[T+J]=C&255}:(N,T)=>{let C,V=X.transitions||(X.transitions=Object.create(null)),B=0,F=0,f,g;if(this.keyMap){g=Object.keys(N).map((p)=>this.encodeKey(p)),F=g.length;for(let p=0;p<F;p++){let j8=g[p];if(C=V[j8],!C)C=V[j8]=Object.create(null),B++;V=C}}else for(let p in N)if(typeof N.hasOwnProperty!=="function"||N.hasOwnProperty(p)){if(C=V[p],!C){if(V[E8]&1048576)f=V[E8]&65535;C=V[p]=Object.create(null),B++}V=C,F++}let b=V[E8];if(b!==void 0)b&=65535,z[M++]=217,z[M++]=b>>8|224,z[M++]=b&255;else{if(!g)g=V.__keys__||(V.__keys__=Object.keys(N));if(f===void 0){if(b=X.nextId++,!b)b=0,X.nextId=1;if(b>=AJ)X.nextId=(b=W)+1}else b=f;if(X[b]=g,b<W){z[M++]=217,z[M++]=b>>8|224,z[M++]=b&255,V=X.transitions;for(let p=0;p<F;p++){if(V[E8]===void 0||V[E8]&1048576)V[E8]=b;V=V[g[p]]}V[E8]=b|1048576,G=!0}else{if(V[E8]=b,n.setUint32(M,3655335680),M+=3,B)P+=R*B;if(I.length>=AJ-W)I.shift()[E8]=void 0;if(I.push(V),A8(F+2),D(57344+b),D(g),T)return;for(let p in N)if(typeof N.hasOwnProperty!=="function"||N.hasOwnProperty(p))D(N[p]);return}}if(F<24)z[M++]=128|F;else A8(F);if(T)return;for(let p in N)if(typeof N.hasOwnProperty!=="function"||N.hasOwnProperty(p))D(N[p])},y=(N)=>{let T;if(N>16777216){if(N-J>BJ)throw new Error("Encoded buffer would be larger than maximum buffer size");T=Math.min(BJ,Math.round(Math.max((N-J)*(N>67108864?1.25:2),4194304)/4096)*4096)}else T=(Math.max(N-J<<2,z.length-1)>>12)+1<<12;let C=new g$(T);if(n=new DataView(C.buffer,0,T),z.copy)z.copy(C,0,J,N);else C.set(z.slice(J,N));return M-=J,J=0,c8=C.length-10,z=C},v=100,S=1000;this.encodeAsIterable=function(N,T){return h(N,T,w)},this.encodeAsAsyncIterable=function(N,T){return h(N,T,u)};function*w(N,T,C){let V=N.constructor;if(V===Object){let B=Y.useRecords!==!1;if(B)k(N,!0);else jJ(Object.keys(N).length,160);for(let F in N){let f=N[F];if(!B)D(F);if(f&&typeof f==="object")if(T[F])yield*w(f,T[F]);else yield*j(f,T,F);else D(f)}}else if(V===Array){let B=N.length;A8(B);for(let F=0;F<B;F++){let f=N[F];if(f&&(typeof f==="object"||M-J>v))if(T.element)yield*w(f,T.element);else yield*j(f,T,"element");else D(f)}}else if(N[Symbol.iterator]&&!N.buffer){z[M++]=159;for(let B of N)if(B&&(typeof B==="object"||M-J>v))if(T.element)yield*w(B,T.element);else yield*j(B,T,"element");else D(B);z[M++]=255}else if(h$(N))jJ(N.size,64),yield z.subarray(J,M),yield N,_();else if(N[Symbol.asyncIterator])z[M++]=159,yield z.subarray(J,M),yield N,_(),z[M++]=255;else D(N);if(C&&M>J)yield z.subarray(J,M);else if(M-J>v)yield z.subarray(J,M),_()}function*j(N,T,C){let V=M-J;try{if(D(N),M-J>v)yield z.subarray(J,M),_()}catch(B){if(B.iteratorNotHandled)T[C]={},M=J+V,yield*w.call(this,N,T[C]);else throw B}}function _(){v=S,Y.encode(null,p$)}function h(N,T,C){if(T&&T.chunkThreshold)v=S=T.chunkThreshold;else v=100;if(N&&typeof N==="object")return Y.encode(null,p$),C(N,Y.iterateProperties||(Y.iterateProperties={}),!0);return[Y.encode(N)]}async function*u(N,T){for(let C of w(N,T,!0)){let V=C.constructor;if(V===VJ||V===Uint8Array)yield C;else if(h$(C)){let B=C.stream().getReader(),F;while(!(F=await B.read()).done)yield F.value}else if(C[Symbol.asyncIterator])for await(let B of C)if(_(),B)yield*u(B,T.async||(T.async={}));else yield Y.encode(B);else yield C}}}useBuffer($){z=$,n=new DataView(z.buffer,z.byteOffset,z.byteLength),M=0}clearSharedData(){if(this.structures)this.structures=[];if(this.sharedValues)this.sharedValues=void 0}updateSharedData(){let $=this.sharedVersion||0;this.sharedVersion=$+1;let q=this.structures.slice(0),J=new l$(q,this.sharedValues,this.sharedVersion),Q=this.saveShared(J,(G)=>(G&&G.version||0)==$);if(Q===!1)J=this.getShared()||{},this.structures=J.structures||[],this.sharedValues=J.packedValues,this.sharedVersion=J.version,this.structures.nextId=this.structures.length;else q.forEach((G,X)=>this.structures[X]=G);return Q}}function jJ($,q){if($<24)z[M++]=q|$;else if($<256)z[M++]=q|24,z[M++]=$;else if($<65536)z[M++]=q|25,z[M++]=$>>8,z[M++]=$&255;else z[M++]=q|26,n.setUint32(M,$),M+=4}class l${constructor($,q,J){this.structures=$,this.packedValues=q,this.version=J}}function A8($){if($<24)z[M++]=128|$;else if($<256)z[M++]=152,z[M++]=$;else if($<65536)z[M++]=153,z[M++]=$>>8,z[M++]=$&255;else z[M++]=154,n.setUint32(M,$),M+=4}var S1=typeof Blob==="undefined"?function(){}:Blob;function h$($){if($ instanceof S1)return!0;let q=$[Symbol.toStringTag];return q==="Blob"||q==="File"}function s0($,q){switch(typeof $){case"string":if($.length>3){if(q.objectMap[$]>-1||q.values.length>=q.maxValues)return;let Q=q.get($);if(Q){if(++Q.count==2)q.values.push($)}else if(q.set($,{count:1}),q.samplingPackedValues){let G=q.samplingPackedValues.get($);if(G)G.count++;else q.samplingPackedValues.set($,{count:1})}}break;case"object":if($)if($ instanceof Array)for(let Q=0,G=$.length;Q<G;Q++)s0($[Q],q);else{let Q=!q.encoder.useRecords;for(var J in $)if($.hasOwnProperty(J)){if(Q)s0(J,q);s0($[J],q)}}break;case"function":console.log($)}}var _1=new Uint8Array(new Uint16Array([1]).buffer)[0]==1;FJ=[Date,Set,Error,RegExp,T8,ArrayBuffer,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,typeof BigUint64Array=="undefined"?function(){}:BigUint64Array,Int8Array,Int16Array,Int32Array,typeof BigInt64Array=="undefined"?function(){}:BigInt64Array,Float32Array,Float64Array,l$];c$=[{tag:1,encode($,q){let J=$.getTime()/1000;if((this.useTimestamp32||$.getMilliseconds()===0)&&J>=0&&J<4294967296)z[M++]=26,n.setUint32(M,J),M+=4;else z[M++]=251,n.setFloat64(M,J),M+=8}},{tag:258,encode($,q){let J=Array.from($);q(J)}},{tag:27,encode($,q){q([$.name,$.message])}},{tag:27,encode($,q){q(["RegExp",$.source,$.flags])}},{getTag($){return $.tag},encode($,q){q($.value)}},{encode($,q,J){u$($,J)}},{getTag($){if($.constructor===Uint8Array){if(this.tagUint8Array||L0&&this.tagUint8Array!==!1)return 64}},encode($,q,J){u$($,J)}},V8(68,1),V8(69,2),V8(70,4),V8(71,8),V8(72,1),V8(77,2),V8(78,4),V8(79,8),V8(85,4),V8(86,8),{encode($,q){let J=$.packedValues||[],Q=$.structures||[];if(J.values.length>0){z[M++]=216,z[M++]=51,A8(4);let G=J.values;q(G),A8(0),A8(0),packedObjectMap=Object.create(sharedPackedObjectMap||null);for(let X=0,U=G.length;X<U;X++)packedObjectMap[G[X]]=X}if(Q){n.setUint32(M,3655335424),M+=3;let G=Q.slice(0);G.unshift(57344),G.push(new T8($.version,1399353956)),q(G)}else q(new T8($.version,1399353956))}}];function V8($,q){if(!_1&&q>1)$-=4;return{tag:$,encode:function J(Q,G){let X=Q.byteLength,U=Q.byteOffset||0,Z=Q.buffer||Q;G(L0?t0.from(Z,U,X):new Uint8Array(Z,U,X))}}}function u$($,q){let J=$.byteLength;if(J<24)z[M++]=64+J;else if(J<256)z[M++]=88,z[M++]=J;else if(J<65536)z[M++]=89,z[M++]=J>>8,z[M++]=J&255;else z[M++]=90,n.setUint32(M,J),M+=4;if(M+J>=z.length)q(M+J);z.set($.buffer?$:new Uint8Array($),M),M+=J}function k1($,q){let J,Q=q.length*2,G=$.length-Q;q.sort((X,U)=>X.offset>U.offset?1:-1);for(let X=0;X<q.length;X++){let U=q[X];U.id=X;for(let Z of U.references)$[Z++]=X>>8,$[Z]=X&255}while(J=q.pop()){let X=J.offset;$.copyWithin(X+Q,X,G),Q-=2;let U=X+Q;$[U++]=216,$[U++]=28,G=X}return $}function PJ($,q){n.setUint32(s.position+$,M-s.position-$+1);let J=s;s=null,q(J[0]),q(J[1])}var n$=new e0({useRecords:!1}),y1=n$.encode,v1=n$.encodeAsIterable,m1=n$.encodeAsAsyncIterable;var d$=512,g1=1024,p$=2048;var $$=($)=>{let q=new Uint8Array($);return btoa(String.fromCharCode(...q)).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=/g,"")},xJ=($)=>{let q=atob($.replace(/-/g,"+").replace(/_/g,"/")),J=new Uint8Array(q.length);for(let Q=0;Q<q.length;Q++)J[Q]=q.charCodeAt(Q);return J.buffer};async function SJ($){let q=crypto.getRandomValues(new Uint8Array(32)),Q=new TextEncoder().encode($),G=await crypto.subtle.digest("SHA-256",Q),X=new Uint8Array(G).slice(0,16),U=await navigator.credentials.create({publicKey:{challenge:q,rp:{name:"Sorane Web/A Form"},user:{id:X,name:$,displayName:$},pubKeyCredParams:[{alg:-7,type:"public-key"}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required",residentKey:"required"},timeout:60000,attestation:"none",extensions:{prf:{}}}});if(!U)throw new Error("Credential creation failed");return{id:U.id,rawId:$$(U.rawId),response:U.response}}async function _J($,q){let J=await navigator.credentials.get({publicKey:{challenge:q,allowCredentials:[{id:xJ($),type:"public-key"}],userVerification:"required"}});if(!J)throw new Error("Assertion failed");let Q=J.response;return{id:J.id,signature:$$(Q.signature),authenticatorData:$$(Q.authenticatorData),clientDataJSON:$$(Q.clientDataJSON)}}async function Y0($,q){let J=crypto.getRandomValues(new Uint8Array(32)),Q=await navigator.credentials.get({publicKey:{challenge:J,allowCredentials:[{id:xJ($),type:"public-key"}],userVerification:"required",extensions:{prf:{eval:{first:q}}}}});if(!Q)throw new Error("Assertion failed");let X=Q.getClientExtensionResults()?.prf?.results?.first;if(!X)throw new Error("PRF extension not available");return new Uint8Array(X)}function I0($){return Array.from($).map((q)=>q.toString(16).padStart(2,"0")).join("")}function kJ($){let q=new Uint8Array($.length/2);for(let J=0;J<q.length;J++)q[J]=parseInt($.substring(J*2,J*2+2),16);return q}class vJ{usePasskey=!0;credentialId=null;publicKey=null;publicKeyType="ed25519";edPrivateKey=null;constructor(){this.loadKey()}loadKey(){if(typeof localStorage==="undefined")return;let $=localStorage.getItem("weba_passkey_id"),q=localStorage.getItem("weba_passkey_pub");if($&&q){this.credentialId=$,this.publicKey=kJ(q),this.publicKeyType="p256",this.usePasskey=!0;return}let J=localStorage.getItem("weba_private_key");if(J)this.edPrivateKey=kJ(J),this.publicKey=h8.getPublicKey(this.edPrivateKey),this.publicKeyType="ed25519",this.usePasskey=!1}resetKey(){if(typeof localStorage!=="undefined")localStorage.removeItem("weba_passkey_id"),localStorage.removeItem("weba_passkey_pub"),localStorage.removeItem("weba_private_key");this.credentialId=null,this.publicKey=null,this.edPrivateKey=null}async register(){try{let $=prompt("Enter a name for this Passkey:","demo-user")||"User";console.log(`Registering Passkey for ${$}...`);let q=await SJ($),J=new Uint8Array(q.response.attestationObject),G=o0(J).authData,X=new DataView(G.buffer,G.byteOffset,G.byteLength),U=53,Z=X.getUint16(U);U+=2,U+=Z;let Y=G.slice(U),K=o0(Y),W=K.get(-2),O=K.get(-3);if(!W||!O)throw new Error("Invalid COSE Key: x or y missing");let E=new Uint8Array(65);if(E[0]=4,E.set(W,1),E.set(O,33),this.credentialId=q.rawId,this.publicKey=E,this.publicKeyType="p256",this.usePasskey=!0,typeof localStorage!=="undefined")localStorage.setItem("weba_passkey_id",this.credentialId),localStorage.setItem("weba_passkey_pub",I0(this.publicKey));return console.log("Passkey Registered:",this.credentialId),!0}catch($){return console.warn("Passkey registration failed, falling back to Ed25519",$),this.generateEdKey(),!1}}generateEdKey(){if(this.edPrivateKey=h8.utils.randomSecretKey(),this.publicKey=h8.getPublicKey(this.edPrivateKey),this.publicKeyType="ed25519",this.usePasskey=!1,typeof localStorage!=="undefined")localStorage.setItem("weba_private_key",I0(this.edPrivateKey))}getIssuerDid(){if(!this.publicKey)return"";return`did:key:z${I0(this.publicKey)}`}getPublicKey(){return this.publicKey?I0(this.publicKey):""}async sign($,q="authentication"){if(!this.publicKey)await this.register();let J=yJ.default($),Q=new TextEncoder().encode(J);if(this.usePasskey&&this.credentialId){let G=await crypto.subtle.digest("SHA-256",Q),X=await _J(this.credentialId,G);return{...$,proof:{type:"PasskeySignature2025",created:new Date().toISOString(),verificationMethod:this.getIssuerDid(),proofPurpose:q,proofValue:X.signature,"srn:authenticatorData":X.authenticatorData,"srn:clientDataJSON":X.clientDataJSON,"srn:credentialId":X.id}}}else{if(!this.edPrivateKey)this.generateEdKey();let G=h8.sign(Q,this.edPrivateKey);return{...$,proof:{type:"Ed25519Signature2020",created:new Date().toISOString(),verificationMethod:this.getIssuerDid(),proofPurpose:q,proofValue:I0(G)}}}}async derivePrf($){if(!this.credentialId)return null;try{return await Y0(this.credentialId,$)}catch(q){return console.error("PRF derivation failed",q),null}}}var I8=new vJ;class i${oHash;iHash;blockLen;outputLen;finished=!1;destroyed=!1;constructor($,q){if(W0($),c(q,void 0,"key"),this.iHash=$.create(),typeof this.iHash.update!=="function")throw new Error("Expected instance of class which extends utils.Hash");this.blockLen=this.iHash.blockLen,this.outputLen=this.iHash.outputLen;let J=this.blockLen,Q=new Uint8Array(J);Q.set(q.length>J?$.create().update(q).digest():q);for(let G=0;G<Q.length;G++)Q[G]^=54;this.iHash.update(Q),this.oHash=$.create();for(let G=0;G<Q.length;G++)Q[G]^=106;this.oHash.update(Q),M8(Q)}update($){return f8(this),this.iHash.update($),this}digestInto($){f8(this),c($,this.outputLen,"output"),this.finished=!0,this.iHash.digestInto($),this.oHash.update($),this.oHash.digestInto($),this.destroy()}digest(){let $=new Uint8Array(this.oHash.outputLen);return this.digestInto($),$}_cloneInto($){$||=Object.create(Object.getPrototypeOf(this),{});let{oHash:q,iHash:J,finished:Q,destroyed:G,blockLen:X,outputLen:U}=this;return $=$,$.finished=Q,$.destroyed=G,$.blockLen=X,$.outputLen=U,$.oHash=q._cloneInto($.oHash),$.iHash=J._cloneInto($.iHash),$}clone(){return this._cloneInto()}destroy(){this.destroyed=!0,this.oHash.destroy(),this.iHash.destroy()}}var q$=($,q,J)=>new i$($,q).update(J).digest();q$.create=($,q)=>new i$($,q);function b1($,q,J){if(W0($),J===void 0)J=new Uint8Array($.outputLen);return q$($,J,q)}var r$=Uint8Array.of(0),mJ=Uint8Array.of();function h1($,q,J,Q=32){W0($),z8(Q,"length");let G=$.outputLen;if(Q>255*G)throw new Error("Length must be <= 255*HashLen");let X=Math.ceil(Q/G);if(J===void 0)J=mJ;else c(J,void 0,"info");let U=new Uint8Array(X*G),Z=q$.create($,q),Y=Z._cloneInto(),K=new Uint8Array(Z.outputLen);for(let W=0;W<X;W++)r$[0]=W+1,Y.update(W===0?mJ:K).update(J).update(r$).digestInto(K),U.set(K,G*W),Z._cloneInto(Y);return Z.destroy(),Y.destroy(),M8(K,r$),U.slice(0,Q)}var O8=($,q,J,Q,G)=>h1($,b1($,q,J),Q,G);var hJ=Dq(j$(),1),gJ="weba_l2_ed25519_sk";function W8($){if(typeof Buffer!=="undefined")return Buffer.from($).toString("base64").replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"");let q="";return $.forEach((Q)=>{q+=String.fromCharCode(Q)}),btoa(q).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"")}function J8($){let q=$.length%4===0?"":"=".repeat(4-$.length%4),J=$.replace(/-/g,"+").replace(/_/g,"/")+q;if(typeof Buffer!=="undefined")return new Uint8Array(Buffer.from(J,"base64"));let Q=atob(J),G=new Uint8Array(Q.length);for(let X=0;X<Q.length;X+=1)G[X]=Q.charCodeAt(X);return G}function J$($){let q=hJ.default($);if(q===void 0)throw new Error("Failed to canonicalize JSON");return q}function bJ($){let q=new Uint8Array($);return crypto.getRandomValues(q),q}function p1(){let $=localStorage.getItem(gJ);if($)return J8($);let q=h8.utils.randomSecretKey();return localStorage.setItem(gJ,W8(q)),q}function c1($,q,J){let Q={layer1_ref:$,recipient:q,weba_version:J};return new TextEncoder().encode(J$(Q))}function pJ($,q){let J=new Uint8Array($.length+q.length);return J.set($,0),J.set(q,$.length),J}function cJ($){let q=new TextEncoder().encode("weba-l2/user-x25519"),J=O8(N8,$,void 0,q,32);return{publicKey:E0.getPublicKey(J),privateKey:J}}function uJ(){return globalThis.webaPqcKem||null}async function dJ($,q,J,Q){let G=await crypto.subtle.importKey("raw",q,"AES-GCM",!1,["encrypt"]),X=await crypto.subtle.encrypt({name:"AES-GCM",iv:J,additionalData:Q},G,$);return new Uint8Array(X)}async function lJ($){let q=O8(N8,$.prfKey,void 0,void 0,32),J=O8(N8,q,void 0,new TextEncoder().encode("weba-l2/kw"),32),Q=O8(N8,q,void 0,new TextEncoder().encode("weba-l2/kw-iv"),12),G=$.aad??new Uint8Array;return dJ($.recipientSk,J,Q,G)}async function nJ($,q,J,Q){let G=await crypto.subtle.importKey("raw",q,"AES-GCM",!1,["decrypt"]),X=await crypto.subtle.decrypt({name:"AES-GCM",iv:J,additionalData:Q},G,$);return new Uint8Array(X)}async function iJ($){let q=$.config.weba_version??"0.1",J=$.config.recipient_kid,Q=$.config.layer1_ref,G=$.user_kid??"user#sig-1",X=p1(),U=J$($.layer2_plain),Z=new TextEncoder().encode(U),Y=h8.sign(Z,X),K={alg:"Ed25519",kid:G,sig:W8(Y),created_at:new Date().toISOString()},W={layer2_plain:$.layer2_plain,layer2_sig:K},O=c1(Q,J,q),E=new TextEncoder().encode(J$(W)),H=J8($.config.recipient_x25519),A=bJ(32),x=E0.getPublicKey(A),I=E0.getSharedSecret(A,H),P=I,R,D="X25519";if($.config.recipient_pqc){let w=$.pqcProvider??uJ();if(!w)throw new Error("PQC requested but no provider is available");let j=J8($.config.recipient_pqc),_=w.encapsulate(j);R=_.encapsulation,P=pJ(I,_.sharedSecret),D=`X25519+${w.kemId}`}let k=O8(N8,P,O,void 0,32),y=O8(N8,k,void 0,new TextEncoder().encode("weba-l2/key"),32),v=O8(N8,k,void 0,new TextEncoder().encode("weba-l2/iv"),12),S=await dJ(E,y,v,O);return{weba_version:q,layer1_ref:Q,layer2:{enc:"HPKE-v1",suite:{kem:D,kdf:"HKDF-SHA256",aead:"AES-256-GCM"},recipient:J,encapsulated:{classical:W8(x),...R?{pqc:W8(R)}:{}},ciphertext:W8(S),aad:W8(O)},meta:{created_at:new Date().toISOString(),nonce:W8(bJ(16)),...$.config.campaign_id?{campaign_id:$.config.campaign_id}:{},...$.config.key_policy?{key_policy:$.config.key_policy}:{}}}}function rJ(){let $=document.getElementById("weba-l2-config");if(!$||!$.textContent)return null;try{return JSON.parse($.textContent)}catch{return null}}async function Q$($,q,J){let Q=J8($.layer2.aad),G={layer1_ref:$.layer1_ref,recipient:$.layer2.recipient,weba_version:$.weba_version},X=new TextEncoder().encode(J$(G));if(W8(X)!==$.layer2.aad)throw new Error("AAD mismatch");let U=J8($.layer2.encapsulated.classical),Z=E0.getSharedSecret(q,U),Y=Z;if($.layer2.encapsulated.pqc){let A=J?.pqcProvider??uJ(),x=J?.pqcRecipientSk;if(!A||!x)throw new Error("Missing PQC KEM for envelope");let I=J8($.layer2.encapsulated.pqc),P=A.decapsulate(x,I);Y=pJ(Z,P)}let K=O8(N8,Y,Q,void 0,32),W=O8(N8,K,void 0,new TextEncoder().encode("weba-l2/key"),32),O=O8(N8,K,void 0,new TextEncoder().encode("weba-l2/iv"),12),E=J8($.layer2.ciphertext),H=await nJ(E,W,O,Q);return JSON.parse(new TextDecoder().decode(H))}async function oJ($){let q=O8(N8,$.prfKey,void 0,void 0,32),J=O8(N8,q,void 0,new TextEncoder().encode("weba-l2/kw"),32),Q=O8(N8,q,void 0,new TextEncoder().encode("weba-l2/kw-iv"),12),G=$.keywrap.aad?J8($.keywrap.aad):new Uint8Array,X=J8($.keywrap.wrapped_key);return nJ(X,J,Q,G)}function u1($){$.querySelectorAll("input").forEach((J)=>{if(J.type==="checkbox"||J.type==="radio")J.checked=!1,J.removeAttribute("checked");else J.value="",J.removeAttribute("value")}),$.querySelectorAll("textarea").forEach((J)=>{J.value="",J.textContent=""}),$.querySelectorAll("select").forEach((J)=>{J.selectedIndex=-1,J.querySelectorAll("option").forEach((Q)=>Q.removeAttribute("selected"))}),$.getElementById("json-ld")?.remove(),$.getElementById("data-layer")?.remove();let q=$.getElementById("json-debug");if(q)q.textContent=""}function d1($,q){let J=JSON.stringify(q,null,2),Q=$.createElement("script");Q.type="application/ld+json",Q.id="weba-user-vc",Q.textContent=J,$.body.appendChild(Q);let G=$.createElement("div");G.className="weba-user-verification no-print",G.style.cssText="margin-top:2rem;padding:1rem;border:1px solid #10b981;border-radius:8px;background:#f0fdf4;font-size:0.85rem;",G.innerHTML=`\n    <details>\n      <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #047857; font-weight: 600;">\n        <span>✓</span> 利用者による署名の証明\n      </summary>\n      <div style="padding: 1rem 0;">\n        <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;"></pre>\n      </div>\n    </details>\n  `;let X=G.querySelector("pre");if(X)X.textContent=J;$.body.appendChild(G)}function l1($,q){let J=$.createElement("script");J.id="weba-l2-envelope",J.type="application/json",J.textContent=JSON.stringify(q,null,2),$.body.appendChild(J)}function n1($,q){let J=new Date,Q=J.getFullYear()+("0"+(J.getMonth()+1)).slice(-2)+("0"+J.getDate()).slice(-2)+"-"+("0"+J.getHours()).slice(-2)+("0"+J.getMinutes()).slice(-2),G=Math.random().toString(36).substring(2,8);return`${$}_${Q}_${q}_${G}.html`}function i1($,q){let Q=new DOMParser().parseFromString($,"text/html");if(q?.stripPlaintext)u1(Q);if(q?.embeddedVc)d1(Q,q.embeddedVc);if(q?.l2Envelope)l1(Q,q.l2Envelope);return Q.documentElement.outerHTML}function aJ($){let q=i1($.documentHtml,$.options),J=new Blob([q],{type:"text/html"}),Q=URL.createObjectURL(J),G=document.createElement("a");if(G.href=Q,G.download=n1($.title,$.filenameSuffix),G.click(),$.isFinal)setTimeout(()=>window.location.reload(),1000)}class o${formId;constructor(){this.formId="WebA_"+window.location.pathname}updateJsonLd(){let q=window.generatedJsonStructure||{};document.querySelectorAll("[data-json-path]").forEach((G)=>{let X=G.dataset.jsonPath;if(X)q[X]=G.value}),document.querySelectorAll(\'[type="radio"]:checked\').forEach((G)=>{q[G.name]=G.value}),document.querySelectorAll("table.data-table.dynamic").forEach((G)=>{let X=G.dataset.tableKey;if(X){let U=[];G.querySelectorAll("tbody tr").forEach((Z)=>{let Y={},K=!1;if(Z.querySelectorAll("[data-base-key]").forEach((W)=>{if(W.type==="checkbox"){if(Y[W.dataset.baseKey]=W.checked,W.checked)K=!0}else if(Y[W.dataset.baseKey]=W.value,W.value)K=!0}),K)U.push(Y)}),q[X]=U}});let J=document.getElementById("json-ld");if(J)J.textContent=JSON.stringify(q,null,2);let Q=document.getElementById("json-debug");if(Q)Q.textContent=JSON.stringify(q,null,2);return q}getL2Config(){return window.webaL2Config||null}async signAndDownload(){let $=this.updateJsonLd(),q=window,J=q.generatedJsonStructure&&q.generatedJsonStructure.name||"Response",Q=window.location.href.split("#")[0],G=this.getL2Config(),X=document.getElementById("weba-l2-encrypt");if(!!(G?.enabled&&(X?X.checked:G.default_enabled))){if(!G?.recipient_kid||!G?.recipient_x25519||!G?.layer1_ref){alert("L2 encryption config is missing required fields.");return}try{let Y=await iJ({layer2_plain:$,config:G,user_kid:G.user_kid});this.downloadHtml("submit",!0,{l2Envelope:Y,stripPlaintext:!0})}catch(Y){console.error(Y),alert("L2 encryption failed. Please check your recipient key settings.")}return}if(!I8.getPublicKey()){if(!await I8.register()){alert("Key registration failed.");return}}let Z={"@context":["https://www.w3.org/2018/credentials/v1"],type:["VerifiableCredential","WebAFormResponse"],issuer:I8.getIssuerDid(),issuanceDate:new Date().toISOString(),credentialSubject:{id:`urn:uuid:${crypto.randomUUID()}`,type:"WebAFormResponse",templateId:Q,answers:$}};try{let Y=await I8.sign(Z);this.downloadHtml("submitted",!0,{embeddedVc:Y})}catch(Y){console.error(Y),alert("Signing failed. Please ensure you are in a secure context (HTTPS/localhost).")}}saveToLS(){let $=this.updateJsonLd();localStorage.setItem(this.formId,JSON.stringify($))}restoreFromLS(){let $=localStorage.getItem(this.formId);if(!$)return;try{let q=JSON.parse($);document.querySelectorAll("[data-json-path]").forEach((J)=>{let Q=J.dataset.jsonPath;if(q[Q]!==void 0)J.value=q[Q]}),document.querySelectorAll("table.data-table.dynamic").forEach((J)=>{let Q=J.dataset.tableKey,G=q[Q];if(Array.isArray(G)){let X=J.querySelector("tbody");if(!X)return;let U=X.querySelectorAll(".template-row");G.forEach((Z,Y)=>{let K;if(Y===0)K=X.querySelector(".template-row");else{let W=X.querySelector(".template-row");if(W){K=W.cloneNode(!0),K.classList.remove("template-row");let O=K.querySelector(".remove-row-btn");if(O)O.style.visibility="visible";X.appendChild(K)}}if(K)K.querySelectorAll("input, select").forEach((W)=>{let O=W.dataset.baseKey;if(O&&Z[O]!==void 0)if(W.type==="checkbox")W.checked=!!Z[O];else W.value=Z[O]})})}})}catch(q){console.error(q)}}clearData(){if(confirm("Clear all saved data? / 保存されたデータを削除しますか？"))localStorage.removeItem(this.formId),window.location.reload()}bakeValues(){this.updateJsonLd(),document.querySelectorAll("input, textarea, select").forEach(($)=>{if($.closest(".template-row"))return;if($.type==="checkbox"||$.type==="radio")if($.checked)$.setAttribute("checked","checked");else $.removeAttribute("checked");else if($.setAttribute("value",$.value),$.tagName==="TEXTAREA")$.textContent=$.value})}downloadHtml($,q,J){let Q=window,G=Q.generatedJsonStructure&&Q.generatedJsonStructure.name||"web-a-form";aJ({documentHtml:document.documentElement.outerHTML,title:G,filenameSuffix:$,isFinal:q,options:J})}saveDraft(){this.bakeValues(),this.downloadHtml("draft",!1)}submitDocument(){this.bakeValues(),document.querySelectorAll(".search-suggestions").forEach(($)=>$.remove()),this.downloadHtml("submit",!0)}}class a${calc;data;constructor($,q){this.calc=$,this.data=q}applyI18n(){let $={en:{add_row:"+ Add Row",work_save_btn:"Save Progress",clear_btn:"Clear Data",sign_btn:"Submit"},ja:{add_row:"+ 行を追加",work_save_btn:"作業内容を保存",clear_btn:"クリア",sign_btn:"提出版を保存"}},q=(navigator.language||"en").startsWith("ja")?"ja":"en",J=$[q]||$.en;document.querySelectorAll("[data-i18n]").forEach((Q)=>{let G=Q.dataset.i18n;if(J[G])Q.textContent=J[G]})}initTables(){document.querySelectorAll(".data-table.dynamic tbody").forEach(($)=>{this.renumberRows($)})}renumberRows($){Array.from($.querySelectorAll("tr")).filter((J)=>{return J.querySelectorAll("td").length>0}).forEach((J,Q)=>{let G=Q+1;J.querySelectorAll(".auto-num").forEach((X)=>{if(X.value!=G)X.value=G.toString(),X.dispatchEvent(new Event("input",{bubbles:!0}))})})}removeTableRow($){let q=$.closest("tr"),J=q.parentElement;if(q.classList.contains("template-row"))q.querySelectorAll("input").forEach((Q)=>{if(Q.type==="checkbox")Q.checked=!1;else Q.value=""});else{if(q.remove(),J)this.renumberRows(J);this.calc.recalculate(),this.data.updateJsonLd()}}addTableRow($,q){let J=document.getElementById("tbl_"+q);if(!J)return;let Q=J.querySelector("tbody");if(!Q)return;let G=Q.querySelector(".template-row");if(!G)return;let X=G.cloneNode(!0);X.classList.remove("template-row"),X.querySelectorAll("input").forEach((Z)=>{if(Z.type==="checkbox")Z.checked=Z.hasAttribute("checked");else Z.value=Z.getAttribute("value")||""});let U=X.querySelector(".remove-row-btn");if(U)U.style.visibility="visible";X.querySelectorAll("[data-copy-from]").forEach((Z)=>{let Y=Z.dataset.copyFrom;if(Y){let K=X.querySelector(`[data-base-key="${Y}"]`);if(K&&K.value)Z.value=K.value}}),Q.appendChild(X),this.renumberRows(Q),this.calc.recalculate()}switchTab($,q){document.querySelectorAll(".tab-btn").forEach((Q)=>Q.classList.remove("active")),document.querySelectorAll(".tab-content").forEach((Q)=>Q.classList.remove("active")),$.classList.add("active");let J=document.getElementById(q);if(J)J.classList.add("active")}}function sJ($){let q=document.getElementById($);if(!q||!q.textContent)return null;try{return JSON.parse(q.textContent)}catch{return null}}function tJ(){let $=sJ("weba-l2-envelope");if(!$)return;let q=sJ("weba-l2-keywrap"),J=document.querySelector(".weba-form-container")||document.body,Q=document.createElement("div");Q.className="weba-l2-unlock",Q.style.cssText="margin-top:2rem;padding:1rem;border:1px solid #cbd5f5;border-radius:10px;background:#f8fafc;";let G=document.createElement("div");G.textContent="Encrypted Submission",G.style.cssText="font-weight:600;color:#334155;margin-bottom:0.5rem;",Q.appendChild(G);let X=document.createElement("div");X.textContent="Locked. Unlock with Passkey.",X.style.cssText="color:#64748b;margin-bottom:0.75rem;",Q.appendChild(X);let U=document.createElement("button");U.textContent="Unlock (Passkey)",U.style.cssText="padding:0.5rem 1rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;",Q.appendChild(U);let Z=document.createElement("pre");Z.style.cssText="margin-top:1rem;padding:1rem;background:#0f172a;color:#e2e8f0;border-radius:8px;overflow:auto;font-size:0.85rem;display:none;",Q.appendChild(Z);let Y=document.createElement("details");Y.style.cssText="margin-top:0.75rem; display:none;",Y.innerHTML=\'<summary style="cursor:pointer;color:#64748b;">Show signature</summary><pre style="margin-top:0.5rem;padding:0.75rem;background:#0b1220;color:#cbd5f5;border-radius:6px;overflow:auto;font-size:0.8rem;"></pre>\',Q.appendChild(Y);let K=document.createElement("button");K.textContent="Export JSON",K.style.cssText="margin-top:0.75rem;padding:0.45rem 0.9rem;border:1px solid #94a3b8;border-radius:6px;background:#fff;cursor:pointer;display:none;",K.disabled=!0,Q.appendChild(K),U.addEventListener("click",async()=>{if(!q){X.textContent="Key wrap package not found.";return}U.disabled=!0,X.textContent="Waiting for passkey...";try{let W=J8(q.prf_salt),O=await Y0(q.credential_id,W),E=await oJ({keywrap:q,prfKey:O}),H=await Q$($,E);r1(H.layer2_plain),document.body.classList.add("weba-l2-readonly"),Z.textContent=JSON.stringify(H.layer2_plain,null,2),Z.style.display="block";let A=Y.querySelector("pre");if(A)A.textContent=JSON.stringify(H.layer2_sig,null,2);Y.style.display="block",K.style.display="inline-block",K.disabled=!1,X.textContent="Unlocked.",K.onclick=()=>{let x=new Blob([JSON.stringify(H,null,2)],{type:"application/json"}),I=URL.createObjectURL(x),P=document.createElement("a");P.href=I,P.download="weba-l2-decrypted.json",P.click()}}catch(W){console.error(W),X.textContent="Unlock failed.",U.disabled=!1}}),J.appendChild(Q)}function r1($){if(!$||typeof $!=="object")return;let q=$;document.querySelectorAll("[data-json-path]").forEach((J)=>{let Q=J.dataset.jsonPath;if(!Q||!(Q in q))return;let G=q[Q];if(J.type==="checkbox")J.checked=Boolean(G);else if(J.type==="radio")J.checked=J.value===String(G);else J.value=G===null||G===void 0?"":String(G)}),document.querySelectorAll(\'input[type="radio"]\').forEach((J)=>{let Q=J.name;if(!Q||!(Q in q))return;let G=q[Q];J.checked=J.value===String(G)}),document.querySelectorAll("table.data-table.dynamic").forEach((J)=>{let Q=J.dataset.tableKey;if(!Q)return;let G=q[Q];if(!Array.isArray(G))return;let X=J.querySelector("tbody");if(!X)return;let U=X.querySelector("tr.template-row");if(!U)return;Array.from(X.querySelectorAll("tr")).forEach((Z)=>{if(!Z.classList.contains("template-row"))Z.remove()}),G.forEach((Z,Y)=>{let K=Y===0?U:U.cloneNode(!0);if(Y>0){K.classList.remove("template-row");let W=K.querySelector(".remove-row-btn");if(W)W.style.visibility="visible";X.appendChild(K)}if(Z&&typeof Z==="object")K.querySelectorAll("input, select, textarea").forEach((W)=>{let O=W.dataset.baseKey;if(!O)return;let E=Z[O];if(W.type==="checkbox")W.checked=Boolean(E);else W.value=E===null||E===void 0?"":String(E)})})}),document.querySelectorAll("input").forEach((J)=>{if(J.type==="checkbox"||J.type==="radio")J.disabled=!0;else J.readOnly=!0}),document.querySelectorAll("textarea").forEach((J)=>{J.readOnly=!0}),document.querySelectorAll("select").forEach((J)=>{J.disabled=!0}),document.querySelectorAll(".form-toolbar button, .add-row-btn, .remove-row-btn").forEach((J)=>{J.disabled=!0})}function B8($){return document.getElementById($)}function eJ(){if(!B8("weba-l2-keywrap-tool"))return;let q=B8("kwp-recipient-sk"),J=B8("kwp-credential-id"),Q=B8("kwp-prf-salt"),G=B8("kwp-aad"),X=B8("kwp-kid"),U=B8("kwp-status"),Z=B8("kwp-output"),Y=B8("kwp-generate-salt"),K=B8("kwp-wrap");if(!q||!J||!Q||!U||!Z||!K)return;Y?.addEventListener("click",()=>{let W=new Uint8Array(32);crypto.getRandomValues(W),Q.value=W8(W)}),K.addEventListener("click",async()=>{U.textContent="Waiting for passkey...",K.disabled=!0;try{if(!q.value||!J.value||!Q.value)throw new Error("Missing required fields.");let W=J8(q.value.trim()),O=J8(Q.value.trim()),E=await Y0(J.value.trim(),O),H=G?.value?J8(G.value.trim()):void 0,A=await lJ({recipientSk:W,prfKey:E,aad:H}),x={alg:"WebAuthn-PRF-AESGCM-v1",kid:X?.value||"issuer#passkey-1",credential_id:J.value.trim(),prf_salt:W8(O),wrapped_key:W8(A),...H?{aad:W8(H)}:{}};Z.textContent=JSON.stringify(x,null,2),U.textContent="Key wrap ready."}catch(W){console.error(W),U.textContent="Key wrap failed."}finally{K.disabled=!1}})}function $Q($){if(typeof DOMParser!=="undefined")return new DOMParser().parseFromString($,"text/html");if(typeof document!=="undefined"){let q=document.implementation.createHTMLDocument("");return q.documentElement.innerHTML=$,q}return null}function qQ($,q){let J=$Q($);if(J)return J.getElementById(q)?.textContent??null;let Q=new RegExp(`<script[^>]*id=["\']${q}["\'][^>]*>([\\\\s\\\\S]*?)<\\\\/script>`,"i"),G=$.match(Q);return G?G[1]:null}function o1($){return $.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")}function a1($,q){let J=$Q($);if(J)return J.querySelector(`script[type="${q}"]`)?.textContent??null;let Q=new RegExp(`<script[^>]*type=["\']${o1(q)}["\'][^>]*>([\\\\s\\\\S]*?)<\\\\/script>`,"i"),G=$.match(Q);return G?G[1]:null}function JQ($){let q=qQ($,"data-layer");if(q)try{return JSON.parse(q)}catch{return null}let J=a1($,"application/ld+json");if(J)try{return JSON.parse(J)}catch{return null}return null}function QQ($){let q=qQ($,"weba-l2-envelope");if(!q)return null;try{return JSON.parse(q)}catch{return null}}function s1($){let q={},J=(Q,G)=>{if(Q===null||Q===void 0){q[G]=null;return}if(Array.isArray(Q)){Q.forEach((X,U)=>{J(X,G?`${G}[${U}]`:`[${U}]`)});return}if(typeof Q==="object"){Object.entries(Q).forEach(([X,U])=>{let Z=G?`${G}.${X}`:X;J(U,Z)});return}q[G]=Q};if(J($,""),""in q)delete q[""];return q}function s$($){let q={_filename:$.filename},J=new Set(["_filename"]);if($.includeJson)J.add("_json"),q._json=JSON.stringify($.plain);let Q=s1($.plain||{});for(let G of Object.keys(Q)){if($.omitKey&&$.omitKey(G))continue;J.add(G),q[G]=Q[G]}if($.sig)J.add("_l2_sig"),q._l2_sig=JSON.stringify($.sig);return{row:q,keys:J}}function GQ($){if($===null||$===void 0)return"";let q=String($);if(/[",\\n]/.test(q))return`"${q.replace(/"/g,\'""\')}"`;return q}function XQ($,q){let J=[];return J.push(q.map(GQ).join(",")),$.forEach((Q)=>{let G=q.map((X)=>GQ(Q[X])).join(",");J.push(G)}),"\\uFEFF"+J.join(`\n`)}function t1($,q){let J=q.trim().replace(/^\\$\\./,"");if(!J)return[];let Q=J.split("."),G=[$];for(let X of Q){let U=X.match(/^(.*)\\[(\\d*)\\]$/),Z=U?U[1]:X,Y=U?U[2]:null,K=U&&Y==="",W=U&&Y!==""&&Y!==null?parseInt(Y,10):null,O=[];for(let E of G){if(E===null||E===void 0)continue;let H=Z?E[Z]:E;if(K){if(Array.isArray(H))O.push(...H);continue}if(W!==null){if(Array.isArray(H)&&H[W]!==void 0)O.push(H[W]);continue}if(H!==void 0)O.push(H)}G=O}return G}function e1($,q){let J=[];switch(q.forEach((Q)=>{let G=t1(Q.plain,$.path);J.push(...G)}),$.type){case"count":return J.length;case"sum":return J.reduce((Q,G)=>Q+(Number(G)||0),0);case"avg":return J.length?J.reduce((Q,G)=>Q+(Number(G)||0),0)/J.length:0;case"boolean_count":return J.filter((Q)=>!!Q).length;case"percent":{let Q=J.filter((G)=>!!G).length;return J.length?`${(Q/J.length*100).toFixed(1)}%`:"0%"}default:return 0}}function $9($,q,J){if(!q?.metrics||q.metrics.length===0){$.innerHTML="";return}let Q=q.metrics.map((G)=>{let X=e1(G,J);return`\n      <div class="metric-card">\n        <label>${G.name}</label>\n        <div class="value">${X}</div>\n      </div>\n    `}).join("");$.innerHTML=`<div class="dashboard-grid">${Q}</div>`}function q9($,q,J){if(q.length===0){$.innerHTML=`<div class="agg-empty-state">\n      <div class="icon">\\uD83D\\uDCC2</div>\n      <p>No records found. Please upload HTML files and click "Run Aggregation".</p>\n    </div>`;return}let Q=J.map((X)=>`<th>${X}</th>`).join(""),G=q.map((X,U)=>{let Z=J.map((Y)=>`<td>${X[Y]??""}</td>`).join("");return`<tr onclick="window.showRecordDetail(${U})">${Z}</tr>`}).join("");$.innerHTML=`\n    <div class="agg-section-header">\n      <h3>\\uD83D\\uDCCB Extracted Records</h3>\n      <span class="count-badge">${q.length} records</span>\n    </div>\n    <div class="agg-table-container">\n      <table class="agg-table">\n        <thead><tr>${Q}</tr></thead>\n        <tbody>${G}</tbody>\n      </table>\n    </div>\n  `,window._aggRows=q}function J9($){let q=window._aggRows;if(!q||!q[$])return;let J=q[$],Q=document.getElementById("weba-agg-detail");if(!Q)return;let G=J._raw||{},X="",U=(O)=>{if(O===null||O===void 0)return\'<span class="val-null">N/A</span>\';if(typeof O==="boolean")return`<span class="val-bool ${O}">${O?"Yes":"No"}</span>`;if(Array.isArray(O))return`<div class="val-array">${O.map((E)=>`<div class="array-item">${typeof E==="object"?JSON.stringify(E):E}</div>`).join("")}</div>`;if(typeof O==="object")return`<pre class="val-json">${JSON.stringify(O,null,2)}</pre>`;return`<span class="val-text">${O}</span>`},Z=(O,E="")=>{for(let H in O){if(H==="_raw"||H==="_sig"||H.startsWith("@"))continue;let A=O[H],x=E?`${E} › ${H}`:H;if(typeof A==="object"&&A!==null&&!Array.isArray(A))X+=`<div class="detail-group-header">${x}</div>`,Z(A,x);else X+=`\n          <div class="detail-row">\n            <div class="detail-key">${H}</div>\n            <div class="detail-val-box">${U(A)}</div>\n          </div>\n        `}};Z(G),Q.innerHTML=`\n    <div class="detail-overlay" id="weba-detail-overlay">\n      <div class="detail-modal">\n        <div class="detail-modal-header">\n          <div class="header-info">\n            <span class="file-icon">\\uD83D\\uDCC4</span>\n            <div class="text">\n              <h3>Record Details</h3>\n              <p>${J._filename||"Standalone Record"}</p>\n            </div>\n          </div>\n          <button class="close-btn" id="weba-detail-close">✕</button>\n        </div>\n        <div class="detail-modal-body">\n          <div class="form-view">\n            ${X}\n          </div>\n          <details class="raw-data-section">\n            <summary>View Raw Source Data (JSON)</summary>\n            <pre>${JSON.stringify(G,null,2)}</pre>\n            ${J._sig?`<h4>Signature</h4><pre>${JSON.stringify(J._sig,null,2)}</pre>`:""}\n          </details>\n        </div>\n      </div>\n    </div>\n  `,document.body.style.overflow="hidden";let Y=document.getElementById("weba-detail-overlay"),K=document.getElementById("weba-detail-close"),W=()=>{if(Q)Q.innerHTML="";document.body.style.overflow=""};Y?.addEventListener("click",(O)=>{if(O.stopPropagation(),O.target===Y)W()}),K?.addEventListener("click",(O)=>{O.stopPropagation(),W()})}window.showRecordDetail=J9;function Q9(){let $=document.getElementById("weba-l2-key");if(!$)return null;try{return JSON.parse($.textContent)}catch{return null}}function G9(){let $=document.getElementById("weba-agg-spec");if(!$)return null;try{return JSON.parse($.textContent)}catch{return null}}async function X9($,q){let J=QQ($);if(J){if(!q)return{source:"l2",plain:null};try{let G=null;if(q.recipient_x25519_private)G=J8(q.recipient_x25519_private);if(!G&&q.org_root_key);if(G){let X=await Q$(J,G);return{source:"l2",plain:X.layer2_plain,sig:X.layer2_sig}}}catch(G){console.warn("L2 decryption failed",G)}}let Q=JQ($);if(Q)return{source:"jsonld",plain:Q.credentialSubject?.answers||Q};return{source:"unknown",plain:null}}function UQ(){let $=document.getElementById("aggregator-root");if(!$)return;$.innerHTML=`\n    <div class="agg-layout">\n      <aside class="agg-sidebar">\n        <div class="agg-brand">\n          <div class="brand-logo">Agg</div>\n          <h1>Web/A Aggregator</h1>\n        </div>\n        \n        <div class="agg-config-card">\n          <div class="card-header">1. Data Source</div>\n          <div class="agg-form-field">\n            <label>Upload Submitted Forms</label>\n            <div class="btn-grid">\n              <button id="weba-agg-file-trigger" class="agg-btn-secondary">\\uD83D\\uDCC4 Select Files</button>\n              <button id="weba-agg-dir-trigger" class="agg-btn-secondary">\\uD83D\\uDCC1 Select Folder</button>\n            </div>\n            <input id="weba-agg-files" type="file" accept=".html" multiple style="display:none;" />\n            <input id="weba-agg-dirs" type="file" webkitdirectory directory style="display:none;" />\n            <p class="field-hint">Select files or an entire folder of HTML forms.</p>\n          </div>\n          \n          <div class="agg-form-field">\n            <label>Decryption Method</label>\n            <div id="weba-agg-key-status" class="agg-status-chip">No keys detected</div>\n            <div class="btn-group">\n               <button id="weba-agg-passkey" class="agg-btn-small outline">\\uD83D\\uDD11 Use Passkey</button>\n            </div>\n            <p class="field-hint">Encryption is used for Layer 2 security.</p>\n          </div>\n\n          <div class="agg-form-field-row">\n            <input id="weba-agg-include-json" type="checkbox" />\n            <label for="weba-agg-include-json">Include JSON column in table</label>\n          </div>\n        </div>\n\n        <div class="agg-actions-card">\n           <button id="weba-agg-run" class="agg-btn-primary">▶ Run Aggregation</button>\n           <div class="btn-grid">\n             <button id="weba-agg-download" class="agg-btn-secondary" disabled>\\uD83D\\uDCE5 CSV</button>\n             <button id="weba-agg-download-jsonl" class="agg-btn-secondary" disabled>\\uD83D\\uDCE5 JSONL</button>\n           </div>\n           <button id="weba-agg-clear" class="agg-btn-text">\\uD83D\\uDDD1 Clear Data</button>\n           <div id="weba-agg-status" class="agg-status-message">Ready.</div>\n        </div>\n      </aside>\n\n      <main class="agg-main">\n        <div id="weba-agg-dashboard" class="agg-dashboard"></div>\n        <div id="weba-agg-output" class="agg-output"></div>\n      </main>\n    </div>\n    \n    <div id="weba-agg-detail"></div>\n\n    <style>\n      :root {\n        --agg-primary: #2563eb;\n        --agg-bg: #f8fafc;\n        --agg-card-bg: #ffffff;\n        --agg-text: #1e293b;\n        --agg-text-dim: #64748b;\n        --agg-border: #e2e8f0;\n      }\n\n      .agg-layout { display: flex; min-height: 80vh; gap: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--agg-text); }\n      .agg-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }\n      .agg-main { flex: 1; display: flex; flex-direction: column; gap: 24px; }\n\n      .agg-brand { padding: 12px 0; display: flex; align-items: center; gap: 12px; }\n      .brand-logo { background: var(--agg-primary); color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }\n      .agg-brand h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }\n\n      .agg-config-card, .agg-actions-card { background: var(--agg-card-bg); border: 1px solid var(--agg-border); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }\n      .card-header { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--agg-text-dim); margin-bottom: 16px; border-bottom: 1px solid var(--agg-border); padding-bottom: 8px; }\n\n      .agg-form-field { margin-bottom: 16px; }\n      .agg-form-field label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; }\n      .agg-form-field input[type="file"] { width: 100%; font-size: 0.85rem; }\n      .field-hint { font-size: 0.75rem; color: var(--agg-text-dim); margin: 4px 0 0; }\n\n      .agg-form-field-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; }\n      .agg-form-field-row label { font-size: 0.85rem; cursor: pointer; }\n\n      .agg-status-chip { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; color: var(--agg-text-dim); display: inline-block; margin-bottom: 8px; }\n      .agg-status-chip.ready { background: #dcfce7; color: #166534; }\n\n      .btn-group { display: flex; gap: 8px; }\n      .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }\n      \n      .agg-btn-primary { background: var(--agg-primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px; transition: opacity 0.2s; }\n      .agg-btn-primary:active { opacity: 0.8; }\n      \n      .agg-btn-secondary { background: white; border: 1px solid var(--agg-border); color: var(--agg-text); padding: 8px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; }\n      .agg-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }\n      \n      .agg-btn-small { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }\n      .agg-btn-small.outline { background: white; border: 1px solid var(--agg-primary); color: var(--agg-primary); }\n\n      .agg-btn-text { background: none; border: none; color: #ef4444; font-size: 0.85rem; padding: 8px; cursor: pointer; width: 100%; margin-top: 12px; }\n\n      .agg-status-message { font-size: 0.85rem; color: var(--agg-text-dim); text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--agg-border); }\n\n      /* Dashboard */\n      .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }\n      .metric-card { background: white; border: 1px solid var(--agg-border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; border-left: 4px solid var(--agg-primary); }\n      .metric-card label { font-size: 0.75rem; color: var(--agg-text-dim); font-weight: 600; text-transform: uppercase; }\n      .metric-card .value { font-size: 1.5rem; font-weight: 700; color: var(--agg-text); }\n\n      /* Results Styling */\n      .agg-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }\n      .count-badge { background: var(--agg-primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }\n\n      .agg-table-container { background: white; border: 1px solid var(--agg-border); border-radius: 12px; overflow: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); max-height: 500px; }\n      .agg-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }\n      .agg-table th { background: #f8fafc; padding: 12px; border-bottom: 1px solid var(--agg-border); font-weight: 600; color: var(--agg-text-dim); position: sticky; top: 0; }\n      .agg-table td { padding: 12px; border-bottom: 1px solid var(--agg-border); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }\n      .agg-table tr:hover { background: #f1f5f9; cursor: pointer; }\n\n      .agg-empty-state { text-align: center; padding: 48px; color: var(--agg-text-dim); background: white; border: 2px dashed var(--agg-border); border-radius: 12px; }\n      .agg-empty-state .icon { font-size: 2rem; margin-bottom: 12px; }\n\n      /* Detail Modal Overhaul */\n      .detail-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 10000; }\n      @media (min-width: 768px) { .detail-overlay { align-items: center; } }\n\n      .detail-modal { background: white; width: 100%; max-width: 720px; border-radius: 20px 20px 0 0; display: flex; flex-direction: column; max-height: 94vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s ease-out; }\n      @media (min-width: 768px) { .detail-modal { border-radius: 16px; max-height: 85vh; } }\n      \n      @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }\n\n      .detail-modal-header { padding: 16px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }\n      .header-info { display: flex; gap: 12px; align-items: center; }\n      .file-icon { font-size: 1.5rem; }\n      .header-info h3 { margin: 0; font-size: 1.1rem; }\n      .header-info p { margin: 0; font-size: 0.8rem; color: var(--agg-text-dim); }\n      .close-btn { border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer; color: #64748b; }\n\n      .detail-modal-body { padding: 24px; overflow-y: auto; flex: 1; }\n      \n      .form-view { display: flex; flex-direction: column; gap: 16px; }\n      .detail-group-header { font-size: 0.8rem; font-weight: 700; color: var(--agg-primary); text-transform: uppercase; background: #eff6ff; padding: 4px 12px; border-radius: 4px; margin-top: 12px; }\n      \n      .detail-row { display: grid; grid-template-columns: 140px 1fr; gap: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; align-items: flex-start; }\n      .detail-key { font-size: 0.85rem; font-weight: 600; color: #64748b; padding-top: 2px; }\n      \n      .val-null { color: #cbd5e1; font-family: monospace; }\n      .val-bool.true { color: #16a34a; font-weight: bold; }\n      .val-bool.false { color: #dc2626; font-weight: bold; }\n      .val-text { line-height: 1.5; color: #0f172a; }\n      .val-json { font-size: 0.8rem; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 0; }\n      \n      .raw-data-section { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }\n      .raw-data-section summary { font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--agg-text-dim); }\n      .raw-data-section pre { margin-top: 12px; font-size: 0.75rem; background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }\n    </style>\n  `;let q=$.querySelector("#weba-agg-files"),J=$.querySelector("#weba-agg-dirs"),Q=$.querySelector("#weba-agg-file-trigger"),G=$.querySelector("#weba-agg-dir-trigger"),X=$.querySelector("#weba-agg-status"),U=$.querySelector("#weba-agg-output"),Z=$.querySelector("#weba-agg-dashboard"),Y=$.querySelector("#weba-agg-include-json"),K=$.querySelector("#weba-agg-run"),W=$.querySelector("#weba-agg-download"),O=$.querySelector("#weba-agg-download-jsonl"),E=$.querySelector("#weba-agg-key-status"),H=$.querySelector("#weba-agg-passkey"),A=$.querySelector("#weba-agg-clear"),x="",I="",P=[],R=null,D=Q9(),k=G9(),y=Array.isArray(k?.samples)?k.samples.map((S,w)=>({filename:`sample-${w+1}.json`,plain:S})):[];if(E)E.textContent=D?.recipient_kid?`Loaded (${D.recipient_kid})`:D?"Loaded":"No keys detected",E.classList.toggle("ready",!!D);if(k?.export?.jsonl===!1&&O)O.disabled=!0;H?.addEventListener("click",async()=>{try{if(!I8.getPublicKey()){if(!await I8.register())return}alert("Please authenticate with your Passkey to decrypt.");let S=new Uint8Array(32),w=await I8.derivePrf(S);if(!w)throw new Error("PRF not supported or enabled on this key, or authentication failed.");if(R={recipient_x25519_private:W8(cJ(w).privateKey)},H.textContent="✅ Passkey Active",H.disabled=!0,E)E.textContent="Passkey Enabled",E.classList.add("ready");if(q?.files&&q.files.length>0||J?.files&&J.files.length>0)v()}catch(S){console.error(S),alert("Passkey error: "+S.message)}}),Q?.addEventListener("click",()=>q?.click()),G?.addEventListener("click",()=>J?.click()),q?.addEventListener("change",()=>v()),J?.addEventListener("change",()=>v());let v=async()=>{let S=q?.files?Array.from(q.files):[],w=J?.files?Array.from(J.files):[],j=[...S,...w].filter((f)=>f.name.toLowerCase().endsWith(".html")&&!f.name.startsWith(".")),_=j.length>0;if(!_&&y.length===0){if(X)X.textContent="Select HTML files first.";return}if(X)X.textContent="Processing...";if(W)W.disabled=!0;if(O)O.disabled=!0;let h=$.querySelector(".agg-brand h1");P=[];let u=[],N=new Set(["_filename"]),T=0,C=0,V=R||D;if(_){if(h)h.innerHTML=\'Web/A Aggregator <span style="font-size:0.75rem; background:#10b981; color:white; padding:2px 8px; border-radius:4px; margin-left:8px; vertical-align:middle;">REAL DATA</span>\';console.log(`Running aggregation on ${j.length} files...`);for(let f of j)try{let g=await f.text(),b=await X9(g,V);if(b.source!=="unknown"&&b.plain){P.push({filename:f.name,plain:b.plain,sig:b.sig});let p=s$({plain:b.plain,filename:f.name,includeJson:!!Y?.checked,sig:b.sig,omitKey:(j8)=>j8.startsWith("@")});p.keys.forEach((j8)=>N.add(j8)),u.push({...p.row,_raw:b.plain,_sig:b.sig}),T+=1}else console.warn(`Could not extract from ${f.name}`),C+=1}catch(g){console.error(`Error processing ${f.name}`,g),C+=1}}else{if(h)h.innerHTML=\'Web/A Aggregator <span style="font-size:0.75rem; background:#64748b; color:white; padding:2px 8px; border-radius:4px; margin-left:8px; vertical-align:middle;">SAMPLES</span>\';console.log("Running aggregation on sample data..."),y.forEach((f)=>{P.push(f);let g=s$({plain:f.plain,filename:f.filename,includeJson:!!Y?.checked});g.keys.forEach((b)=>N.add(b)),u.push({...g.row,_raw:f.plain}),T+=1})}let B=Array.from(N).sort((f,g)=>{if(f==="_filename")return-1;if(g==="_filename")return 1;return f.localeCompare(g)});if(x=XQ(u,B),W)W.disabled=u.length===0;let F=k?.export?.jsonl!==!1;if(I=P.map((f)=>JSON.stringify({_filename:f.filename,_l2_sig:f.sig??null,...f.plain})).join(`\n`),O)O.disabled=P.length===0||!F;if(X)X.textContent=`Completed. Processed ${T} entries. Errors: ${C}.`;if(Z)$9(Z,k,P);if(U)q9(U,u,B)};if(y.length>0&&(!q?.files||q.files.length===0))v();A?.addEventListener("click",()=>{if(P=[],x="",I="",q)q.value="";if(J)J.value="";if(X)X.textContent="Data cleared.";if(W)W.disabled=!0;if(O)O.disabled=!0;if(Z)Z.innerHTML="";if(U)U.innerHTML="";window._aggRows=[]}),K?.addEventListener("click",()=>{v().catch((S)=>{if(X)X.textContent="Failed to aggregate.";console.error(S)})}),W?.addEventListener("click",()=>{if(!x)return;let S=new Blob([x],{type:"text/csv;charset=utf-8"}),w=URL.createObjectURL(S),j=document.createElement("a");j.href=w,j.download="weba-aggregated.csv",j.click(),URL.revokeObjectURL(w)}),O?.addEventListener("click",()=>{if(!I)return;let S=new Blob([I],{type:"application/x-jsonlines;charset=utf-8"}),w=URL.createObjectURL(S),j=document.createElement("a");j.href=w,j.download="weba-aggregated.jsonl",j.click(),URL.revokeObjectURL(w)})}function YQ(){console.log("Web/A Runtime Booting...");let $=new O$,q=new o$,J=new a$($,q),Q=window,G=document.getElementById("weba-structure");if(G?.textContent)try{Q.generatedJsonStructure=JSON.parse(G.textContent)}catch(Z){console.warn("Failed to parse weba structure JSON",Z)}let X=rJ();if(X)Q.webaL2Config=X;Q.saveDraft=()=>q.saveDraft(),Q.submitDocument=()=>q.submitDocument(),Q.signAndDownload=()=>q.signAndDownload(),Q.clearData=()=>q.clearData(),Q.removeTableRow=(Z)=>J.removeTableRow(Z),Q.addTableRow=(Z,Y)=>J.addTableRow(Z,Y),Q.switchTab=(Z,Y)=>J.switchTab(Z,Y),Q.recalculate=()=>$.recalculate(),Q.escapeHtml=(Z)=>{if(!Z)return"";let Y={"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"};return Z.toString().replace(/[&<>"\']/g,(K)=>Y[K]||K)},q.restoreFromLS(),J.applyI18n(),J.initTables(),$.recalculate(),tJ(),eJ(),UQ();let U;document.addEventListener("input",(Z)=>{let Y=Z.target;if(Z.isTrusted)Y.dataset.dirty="true";let K=Y.dataset.baseKey||Y.dataset.jsonPath;if(K)(Y.closest("tr")||document).querySelectorAll(`[data-copy-from="${K}"]`).forEach((E)=>{if(!E.dataset.dirty){if(E.value!==Y.value)E.value=Y.value,E.dispatchEvent(new Event("input"))}});$.recalculate(),q.updateJsonLd(),clearTimeout(U),U=setTimeout(()=>q.saveToLS(),1000)}),console.log("Web/A Runtime Ready.")}class t${suggestionsVisible=!1;activeSearchInput=null;globalBox=null;constructor(){}init(){console.log("Initializing Search Engine (Bundle)...");let $=window;if($.generatedJsonStructure&&$.generatedJsonStructure.masterData){let q=Object.keys($.generatedJsonStructure.masterData);console.log("Master Data Keys available:",q.join(", "))}this.setupEventDelegation()}normalize($){if(!$)return"";let q=$.toString().toLowerCase();return q=q.replace(/[Ａ-Ｚａ-ｚ０-９]/g,(J)=>{return String.fromCharCode(J.charCodeAt(0)-65248)}),q=q.replace(/[！-～]/g,(J)=>String.fromCharCode(J.charCodeAt(0)-65248)),q.trim()}clean($){if(!$)return"";let q=this.normalize($);return q=q.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g,""),q=q.replace(/(\\(株\\)|\\(有\\)|\\(同\\))/g,""),q.trim()}toIndex($){let q=parseInt($||"",10);return Number.isFinite(q)?q-1:-1}getGlobalBox(){if(!this.globalBox){if(this.globalBox=document.getElementById("web-a-search-suggestions"),!this.globalBox)this.globalBox=document.createElement("div"),this.globalBox.id="web-a-search-suggestions",this.globalBox.className="search-suggestions",Object.assign(this.globalBox.style,{display:"none",position:"absolute",background:"white",border:"1px solid #ccc",boxShadow:"0 4px 6px rgba(0,0,0,0.1)",zIndex:"9999",maxHeight:"200px",overflowY:"auto",borderRadius:"4px"}),document.body.appendChild(this.globalBox)}return this.globalBox}hideSuggestions(){let $=this.getGlobalBox();if($)$.style.display="none";this.suggestionsVisible=!1,this.activeSearchInput=null}setupEventDelegation(){document.addEventListener("click",($)=>{if(this.suggestionsVisible&&!$.target.closest("#web-a-search-suggestions")&&$.target!==this.activeSearchInput)this.hideSuggestions()}),document.addEventListener("scroll",()=>{if(this.suggestionsVisible)this.hideSuggestions()},!0),document.body.addEventListener("input",($)=>{if($.target.classList.contains("search-input"))this.handleSearchInput($.target)}),document.body.addEventListener("click",($)=>{if($.target.classList.contains("suggestion-item"))this.handleSelection($.target)})}handleSearchInput($){this.activeSearchInput=$;let q=window,J=$.dataset.masterSrc,Q=$.dataset.suggestSource;if(!J&&!Q)return;let G=this.toIndex($.dataset.masterLabelIndex),X=this.toIndex($.dataset.masterValueIndex),U=$.value;if(!U){this.hideSuggestions();return}let Z=[],Y=this.normalize(U);if(Q==="column"){let K=$.dataset.baseKey,W=$.closest("table");if(W&&K){let O=new Set;W.querySelectorAll(`[data-base-key="${K}"]`).forEach((E)=>{if(E===$)return;let H=E.value;if(H&&this.normalize(H).includes(Y)){if(!O.has(H))O.add(H),Z.push({val:H,row:[H],label:H,score:10})}})}}else if(J){let K=q.generatedJsonStructure.masterData;if(!K||!K[J])return;K[J].forEach((O,E)=>{if(E===0)return;if(O.some((A)=>this.normalize(A||"").includes(Y))){let A=G>=0?O[G]||"":"",x=X>=0?O[X]||"":"",I=X>=0?x:G>=0?A:O[1]||O[0]||"";Z.push({val:I,row:O,label:A,score:10,idx:E})}})}this.renderSuggestions($,Z,G)}renderSuggestions($,q,J){if(q.length===0){this.hideSuggestions();return}let Q=window,G=q.slice(0,10),X="";G.forEach((W)=>{let O=Q.escapeHtml(JSON.stringify(W.row)),E=J>=0?W.label||W.row.join(" : "):W.row.join(" : ");X+=`<div class="suggestion-item" data-val="${Q.escapeHtml(W.val)}" data-row="${O}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${Q.escapeHtml(E)}</div>`});let U=this.getGlobalBox();U.innerHTML=X;let Z=$.getBoundingClientRect(),Y=window.scrollY||document.documentElement.scrollTop,K=window.scrollX||document.documentElement.scrollLeft;U.style.width=Math.max(Z.width,200)+"px",U.style.left=Z.left+K+"px",U.style.top=Z.bottom+Y+"px",U.querySelectorAll(".suggestion-item").forEach((W)=>{W.onmouseenter=()=>W.style.background="#f0f8ff",W.onmouseleave=()=>W.style.background="white"}),U.style.display="block",this.suggestionsVisible=!0}handleSelection($){if(!this.activeSearchInput)return;let q=window,J=this.activeSearchInput,Q=$.dataset.val||"",G=$.dataset.row||"[]";try{let X=JSON.parse(G),U=J.dataset.masterSrc,Z=U?q.generatedJsonStructure.masterData[U][0]:[],Y=!1;if(Z.length>0&&X.length>0){let K=J.closest("tr");if(K){let W=Array.from(K.querySelectorAll("input, select, textarea"));Z.forEach((O,E)=>{if(!O)return;let H=X[E];this.fillField(W,O,H,J,()=>{Y=!0})})}}if(!Y)J.value=Q,J.dispatchEvent(new Event("input",{bubbles:!0}))}catch(X){console.error(X)}this.hideSuggestions()}fillField($,q,J,Q,G){let X=this.normalize(q),U=$.find((Z)=>{let Y=Z.dataset.baseKey||Z.dataset.jsonPath,K=this.normalize(Z.getAttribute("placeholder")||"");return Y&&this.normalize(Y)===X||K===X});if(U){if(U.value=J||"",U.dispatchEvent(new Event("input",{bubbles:!0})),U===Q)G()}}}var U9=BigInt(0),w0=BigInt(1),Y9=BigInt(2),Z9=BigInt(7),W9=BigInt(256),M9=BigInt(113),MQ=[],NQ=[],KQ=[];for(let $=0,q=w0,J=1,Q=0;$<24;$++){[J,Q]=[Q,(2*J+3*Q)%5],MQ.push(2*(5*Q+J)),NQ.push(($+1)*($+2)/2%64);let G=U9;for(let X=0;X<7;X++)if(q=(q<<w0^(q>>Z9)*M9)%W9,q&Y9)G^=w0<<(w0<<BigInt(X))-w0;KQ.push(G)}var OQ=S0(KQ,!0),N9=OQ[0],K9=OQ[1],ZQ=($,q,J)=>J>32?Vq($,q,J):wq($,q,J),WQ=($,q,J)=>J>32?Aq($,q,J):Tq($,q,J);function O9($,q=24){let J=new Uint32Array(10);for(let Q=24-q;Q<24;Q++){for(let U=0;U<10;U++)J[U]=$[U]^$[U+10]^$[U+20]^$[U+30]^$[U+40];for(let U=0;U<10;U+=2){let Z=(U+8)%10,Y=(U+2)%10,K=J[Y],W=J[Y+1],O=ZQ(K,W,1)^J[Z],E=WQ(K,W,1)^J[Z+1];for(let H=0;H<50;H+=10)$[U+H]^=O,$[U+H+1]^=E}let G=$[2],X=$[3];for(let U=0;U<24;U++){let Z=NQ[U],Y=ZQ(G,X,Z),K=WQ(G,X,Z),W=MQ[U];G=$[W],X=$[W+1],$[W]=Y,$[W+1]=K}for(let U=0;U<50;U+=10){for(let Z=0;Z<10;Z++)J[Z]=$[U+Z];for(let Z=0;Z<10;Z++)$[U+Z]^=~J[(Z+2)%10]&J[(Z+4)%10]}$[0]^=N9[Q],$[1]^=K9[Q]}M8(J)}class G${state;pos=0;posOut=0;finished=!1;state32;destroyed=!1;blockLen;suffix;outputLen;enableXOF=!1;rounds;constructor($,q,J,Q=!1,G=24){if(this.blockLen=$,this.suffix=q,this.outputLen=J,this.enableXOF=Q,this.rounds=G,z8(J,"outputLen"),!(0<$&&$<200))throw new Error("only keccak-f1600 function is supported");this.state=new Uint8Array(200),this.state32=P0(this.state)}clone(){return this._cloneInto()}keccak(){z$(this.state32),O9(this.state32,this.rounds),z$(this.state32),this.posOut=0,this.pos=0}update($){f8(this),c($);let{blockLen:q,state:J}=this,Q=$.length;for(let G=0;G<Q;){let X=Math.min(q-this.pos,Q-G);for(let U=0;U<X;U++)J[this.pos++]^=$[G++];if(this.pos===q)this.keccak()}return this}finish(){if(this.finished)return;this.finished=!0;let{state:$,suffix:q,pos:J,blockLen:Q}=this;if($[J]^=q,(q&128)!==0&&J===Q-1)this.keccak();$[Q-1]^=128,this.keccak()}writeInto($){f8(this,!1),c($),this.finish();let q=this.state,{blockLen:J}=this;for(let Q=0,G=$.length;Q<G;){if(this.posOut>=J)this.keccak();let X=Math.min(J-this.posOut,G-Q);$.set(q.subarray(this.posOut,this.posOut+X),Q),this.posOut+=X,Q+=X}return $}xofInto($){if(!this.enableXOF)throw new Error("XOF is not possible for this instance");return this.writeInto($)}xof($){return z8($),this.xofInto(new Uint8Array($))}digestInto($){if(j0($,this),this.finished)throw new Error("digest() was already called");return this.writeInto($),this.destroy(),$}digest(){return this.digestInto(new Uint8Array(this.outputLen))}destroy(){this.destroyed=!0,M8(this.state)}_cloneInto($){let{blockLen:q,suffix:J,outputLen:Q,rounds:G,enableXOF:X}=this;return $||=new G$(q,J,Q,X,G),$.state32.set(this.state32),$.pos=this.pos,$.posOut=this.posOut,$.finished=this.finished,$.rounds=G,$.suffix=J,$.outputLen=Q,$.enableXOF=X,$.destroyed=this.destroyed,$}}var zQ=($,q,J,Q={})=>q0(()=>new G$(q,$,J),Q);var EQ=zQ(6,136,32,y8(8));var DQ=zQ(6,72,64,y8(10));var CQ=($,q,J,Q={})=>q0((G={})=>new G$(q,$,G.dkLen===void 0?J:G.dkLen,!0),Q),RQ=CQ(31,168,16,y8(11)),X$=CQ(31,136,32,y8(12));function e$($){if(!Number.isSafeInteger($)||$<0||$>4294967295)throw new Error("wrong u32 integer:"+$);return $}function LQ($){return e$($),($&$-1)===0&&$!==0}function $q($,q){e$($);let J=0;for(let Q=0;Q<q;Q++,$>>>=1)J=J<<1|$&1;return J}function IQ($){return e$($),31-Math.clz32($)}function HQ($){let q=$.length;if(q<2||!LQ(q))throw new Error("n must be a power of 2 and greater than 1. Got "+q);let J=IQ(q);for(let Q=0;Q<q;Q++){let G=$q(Q,J);if(Q<G){let X=$[Q];$[Q]=$[G],$[G]=X}}return $}var qq=($,q)=>{let{N:J,roots:Q,dit:G,invertButterflies:X=!1,skipStages:U=0,brp:Z=!0}=q,Y=IQ(J);if(!LQ(J))throw new Error("FFT: Polynomial size should be power of two");let K=G!==X;return(W)=>{if(W.length!==J)throw new Error("FFT: wrong Polynomial length");if(G&&Z)HQ(W);for(let O=0,E=1;O<Y-U;O++){let H=G?O+1+U:Y-O,A=1<<H,x=A>>1,I=J>>H;for(let P=0;P<J;P+=A)for(let R=0,D=E++;R<x;R++){let k=X?G?J-D:D:R*I,y=P+R,v=P+R+x,S=Q[k],w=W[v],j=W[y];if(K){let _=$.mul(w,S);W[y]=$.add(j,_),W[v]=$.sub(j,_)}else if(X)W[y]=$.add(w,j),W[v]=$.mul($.sub(w,j),S);else W[y]=$.add(j,w),W[v]=$.mul($.sub(j,w),S)}}if(!G&&Z)HQ(W);return W}};/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var Jq=u8;function U$($,q){if($.length!==q.length)return!1;let J=0;for(let Q=0;Q<$.length;Q++)J|=$[Q]^q[Q];return J===0}function wQ($){return Uint8Array.from($)}function T0($,...q){let J=(G)=>typeof G==="number"?G:G.bytesLen,Q=q.reduce((G,X)=>G+J(X),0);return{bytesLen:Q,encode:(G)=>{let X=new Uint8Array(Q);for(let U=0,Z=0;U<q.length;U++){let Y=q[U],K=J(Y),W=typeof Y==="number"?G[U]:Y.encode(G[U]);if(c(W,K,$),X.set(W,Z),typeof Y!=="number")W.fill(0);Z+=K}return X},decode:(G)=>{c(G,Q,$);let X=[];for(let U of q){let Z=J(U),Y=G.subarray(0,Z);X.push(typeof U==="number"?Y:U.decode(Y)),G=G.subarray(Z)}return X}}}function Y$($,q){let J=q*$.bytesLen;return{bytesLen:J,encode:(Q)=>{if(Q.length!==q)throw new Error(`vecCoder.encode: wrong length=${Q.length}. Expected: ${q}`);let G=new Uint8Array(J);for(let X=0,U=0;X<Q.length;X++){let Z=$.encode(Q[X]);G.set(Z,U),Z.fill(0),U+=Z.length}return G},decode:(Q)=>{c(Q,J);let G=[];for(let X=0;X<Q.length;X+=$.bytesLen)G.push($.decode(Q.subarray(X,X+$.bytesLen)));return G}}}function H8(...$){for(let q of $)if(Array.isArray(q))for(let J of q)J.fill(0);else q.fill(0)}function Qq($){return(1<<$)-1}var LX=Uint8Array.of();/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var TQ=($)=>{let{newPoly:q,N:J,Q,F:G,ROOT_OF_UNITY:X,brvBits:U,isKyber:Z}=$,Y=(R,D=Q)=>{let k=R%D|0;return(k>=0?k|0:D+k|0)|0},K=(R,D=Q)=>{let k=Y(R,D)|0;return(k>D>>1?k-D|0:k)|0};function W(){let R=q(J);for(let D=0;D<J;D++){let k=$q(D,U),y=BigInt(X)**BigInt(k)%BigInt(Q);R[D]=Number(y)|0}return R}let O=W(),E={add:(R,D)=>Y((R|0)+(D|0))|0,sub:(R,D)=>Y((R|0)-(D|0))|0,mul:(R,D)=>Y((R|0)*(D|0))|0,inv:(R)=>{throw new Error("not implemented")}},H={N:J,roots:O,invertButterflies:!0,skipStages:Z?1:0,brp:!1},A=qq(E,{dit:!1,...H}),x=qq(E,{dit:!0,...H});return{mod:Y,smod:K,nttZetas:O,NTT:{encode:(R)=>{return A(R)},decode:(R)=>{x(R);for(let D=0;D<R.length;D++)R[D]=Y(G*R[D]);return R}},bitsCoder:(R,D)=>{let k=Qq(R),y=R*(J/8);return{bytesLen:y,encode:(v)=>{let S=new Uint8Array(y);for(let w=0,j=0,_=0,h=0;w<v.length;w++){j|=(D.encode(v[w])&k)<<_,_+=R;for(;_>=8;_-=8,j>>=8)S[h++]=j&Qq(_)}return S},decode:(v)=>{let S=q(J);for(let w=0,j=0,_=0,h=0;w<v.length;w++){j|=v[w]<<_,_+=8;for(;_>=R;_-=R,j>>=R)S[h++]=D.decode(j&k)}return S}}}}},z9=($)=>(q,J)=>{if(!J)J=$.blockLen;let Q=new Uint8Array(q.length+2);Q.set(q);let G=q.length,X=new Uint8Array(J),U=$.create({}),Z=0,Y=0;return{stats:()=>({calls:Z,xofs:Y}),get:(K,W)=>{return Q[G+0]=K,Q[G+1]=W,U.destroy(),U=$.create({}).update(Q),Z++,()=>{return Y++,U.xofInto(X)}},clean:()=>{U.destroy(),H8(X,Q)}}},VQ=z9(RQ);/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */var U8=256,k8=3329,E9=3303,D9=17,{mod:B0,nttZetas:C9,NTT:s8,bitsCoder:R9}=TQ({N:U8,Q:k8,F:E9,ROOT_OF_UNITY:D9,newPoly:($)=>new Uint16Array($),brvBits:7,isKyber:!0}),Gq={512:{N:U8,Q:k8,K:2,ETA1:3,ETA2:2,du:10,dv:4,RBGstrength:128},768:{N:U8,Q:k8,K:3,ETA1:2,ETA2:2,du:10,dv:4,RBGstrength:192},1024:{N:U8,Q:k8,K:4,ETA1:2,ETA2:2,du:11,dv:5,RBGstrength:256}},H9=($)=>{if($>=12)return{encode:(J)=>J,decode:(J)=>J};let q=2**($-1);return{encode:(J)=>((J<<$)+k8/2)/k8,decode:(J)=>J*k8+q>>>$}},V0=($)=>R9($,H9($));function t8($,q){for(let J=0;J<U8;J++)$[J]=B0($[J]+q[J])}function L9($,q){for(let J=0;J<U8;J++)$[J]=B0($[J]-q[J])}function I9($,q,J,Q,G){let X=B0(q*Q*G+$*J),U=B0($*Q+q*J);return{c0:X,c1:U}}function Z$($,q){for(let J=0;J<U8/2;J++){let Q=C9[64+(J>>1)];if(J&1)Q=-Q;let{c0:G,c1:X}=I9($[2*J+0],$[2*J+1],q[2*J+0],q[2*J+1],Q);$[2*J+0]=G,$[2*J+1]=X}return $}function AQ($){let q=new Uint16Array(U8);for(let J=0;J<U8;){let Q=$();if(Q.length%3)throw new Error("SampleNTT: unaligned block");for(let G=0;J<U8&&G+3<=Q.length;G+=3){let X=(Q[G+0]>>0|Q[G+1]<<8)&4095,U=(Q[G+1]>>4|Q[G+2]<<4)&4095;if(X<k8)q[J++]=X;if(J<U8&&U<k8)q[J++]=U}}return q}function A0($,q,J,Q){let G=$(Q*U8/4,q,J),X=new Uint16Array(U8),U=P0(G),Z=0;for(let Y=0,K=0,W=0,O=0;Y<U.length;Y++){let E=U[Y];for(let H=0;H<32;H++)if(W+=E&1,E>>=1,Z+=1,Z===Q)O=W,W=0;else if(Z===2*Q)X[K++]=B0(O-W),W=0,Z=0}if(Z)throw new Error(`sampleCBD: leftover bits: ${Z}`);return X}var w9=($)=>{let{K:q,PRF:J,XOF:Q,HASH512:G,ETA1:X,ETA2:U,du:Z,dv:Y}=$,K=V0(1),W=V0(Y),O=V0(Z),E=T0("publicKey",Y$(V0(12),q),32),H=Y$(V0(12),q),A=T0("ciphertext",Y$(O,q),W),x=T0("seed",32,32);return{secretCoder:H,lengths:{secretKey:H.bytesLen,publicKey:E.bytesLen,cipherText:A.bytesLen},keygen:(I)=>{c(I,32,"seed");let P=new Uint8Array(33);P.set(I),P[32]=q;let R=G(P),[D,k]=x.decode(R),y=[],v=[];for(let j=0;j<q;j++)y.push(s8.encode(A0(J,k,j,X)));let S=Q(D);for(let j=0;j<q;j++){let _=s8.encode(A0(J,k,q+j,X));for(let h=0;h<q;h++){let u=AQ(S.get(h,j));t8(_,Z$(u,y[h]))}v.push(_)}S.clean();let w={publicKey:E.encode([v,D]),secretKey:H.encode(y)};return H8(D,k,y,v,P,R),w},encrypt:(I,P,R)=>{let[D,k]=E.decode(I),y=[];for(let h=0;h<q;h++)y.push(s8.encode(A0(J,R,h,X)));let v=Q(k),S=new Uint16Array(U8),w=[];for(let h=0;h<q;h++){let u=A0(J,R,q+h,U),N=new Uint16Array(U8);for(let T=0;T<q;T++){let C=AQ(v.get(h,T));t8(N,Z$(C,y[T]))}t8(u,s8.decode(N)),w.push(u),t8(S,Z$(D[h],y[h])),H8(N)}v.clean();let j=A0(J,R,2*q,U);t8(j,s8.decode(S));let _=K.decode(P);return t8(_,j),H8(D,y,S,j),A.encode([w,_])},decrypt:(I,P)=>{let[R,D]=A.decode(I),k=H.decode(P),y=new Uint16Array(U8);for(let v=0;v<q;v++)t8(y,Z$(k[v],s8.encode(R[v])));return L9(D,s8.decode(y)),H8(y,k,R),K.encode(D)}}};function Xq($){let q=w9($),{HASH256:J,HASH512:Q,KDF:G}=$,{secretCoder:X,lengths:U}=q,Z=T0("secretKey",U.secretKey,U.publicKey,32,32),Y=32,K=64;return{info:{type:"ml-kem"},lengths:{...U,seed:64,msg:32,msgRand:32,secretKey:Z.bytesLen},keygen:(W=Jq(64))=>{c(W,64,"seed");let{publicKey:O,secretKey:E}=q.keygen(W.subarray(0,32)),H=J(O),A=Z.encode([E,O,H,W.subarray(32)]);return H8(E,H),{publicKey:O,secretKey:A}},getPublicKey:(W)=>{let[O,E,H,A]=Z.decode(W);return Uint8Array.from(E)},encapsulate:(W,O=Jq(32))=>{c(W,U.publicKey,"publicKey"),c(O,32,"message");let E=W.subarray(0,384*$.K),H=X.encode(X.decode(wQ(E)));if(!U$(H,E))throw H8(H),new Error("ML-KEM.encapsulate: wrong publicKey modulus");H8(H);let A=Q.create().update(O).update(J(W)).digest(),x=q.encrypt(W,O,A.subarray(32,64));return H8(A.subarray(32)),{cipherText:x,sharedSecret:A.subarray(0,32)}},decapsulate:(W,O)=>{c(O,Z.bytesLen,"secretKey"),c(W,U.cipherText,"cipherText");let E=Z.bytesLen-96,H=E+32,A=J(O.subarray(E/2,H));if(!U$(A,O.subarray(H,H+32)))throw new Error("invalid secretKey: hash check failed");let[x,I,P,R]=Z.decode(O),D=q.decrypt(W,x),k=Q.create().update(D).update(P).digest(),y=k.subarray(0,32),v=q.encrypt(I,D,k.subarray(32,64)),S=U$(W,v),w=G.create({dkLen:32}).update(R).update(W).digest();return H8(D,v,!S?y:w),S?y:w}}}function T9($,q,J){return X$.create({dkLen:$}).update(q).update(new Uint8Array([J])).digest()}var Uq={HASH256:EQ,HASH512:DQ,KDF:X$,XOF:VQ,PRF:T9},xX=Xq({...Uq,...Gq[512]}),Yq=Xq({...Uq,...Gq[768]}),SX=Xq({...Uq,...Gq[1024]});function BQ(){return{kemId:"ML-KEM-768",encapsulate:($)=>{let{cipherText:q,sharedSecret:J}=Yq.encapsulate($);return{sharedSecret:J,encapsulation:q}},decapsulate:($,q)=>{return Yq.decapsulate(q,$)}}}function jQ($){globalThis.webaPqcKem=$}jQ(BQ());var PQ=new t$;window.GlobalSearch=PQ;YQ();PQ.init();\n';

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
  const sourceMd = markdown.replace(/<\/script>/g, "<\\/script>");
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${jsonStructure.name || "Web/A Form"}</title><style>
    body{font-family:sans-serif;padding:2rem;max-width:900px;margin:0 auto;}
    .form-row{margin-bottom:1rem;}
    .form-label{font-weight:bold;display:block;margin-bottom:0.5rem;}
    .form-input{width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;}
    .tabs-nav{display:flex;gap:2px;margin-bottom:20px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;}
    .tab-btn{background:#f1f5f9;border:1px solid #e5e7eb;border-bottom:none;padding:10px 16px;cursor:pointer;border-radius:6px 6px 0 0;font-size:14px;font-weight:600;color:#64748b;}
    .tab-btn:hover{background:#e2e8f0;}
    .tab-btn.active{background:#fff;color:#111827;border-bottom:1px solid #fff;position:relative;top:1px;}
    .tab-content{display:none;animation:fadeIn 0.2s ease-in-out;}
    .tab-content.active{display:block;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
    </style></head><body><div class="page">${html}</div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-source-markdown" type="text/plain">${sourceMd}</script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}
function generateAggregatorHtml(markdown) {
  const { jsonStructure } = parseMarkdown(markdown);
  const aggSpec = jsonStructure.aggSpec ? JSON.stringify(jsonStructure.aggSpec) : "";
  const sourceMd = markdown.replace(/<\/script>/g, "<\\/script>");
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
    </style></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-agg-spec" type="application/json">${aggSpec}</script><script id="weba-source-markdown" type="text/plain">${sourceMd}</script><script id="weba-l2-keys" type="application/json"></script><script>${RUNTIME_SCRIPT}</script></body></html>`;
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
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
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
  const encoder = new TextEncoder;
  const userBytes = encoder.encode(username);
  const hashBuffer = await crypto.subtle.digest("SHA-256", userBytes);
  const userId = new Uint8Array(hashBuffer).slice(0, 16);
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
        residentKey: "required"
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
async function loadToolFile(input) {
  const file = input.files?.[0];
  if (!file)
    return;
  try {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, "text/html");
    const sourceEl = doc.getElementById("weba-source-markdown");
    if (sourceEl) {
      const editor = getEditor();
      if (editor) {
        editor.value = sourceEl.textContent || "";
      }
    }
    const specEl = doc.getElementById("weba-agg-spec");
    if (specEl) {
      try {
        const spec = JSON.parse(specEl.textContent || "");
        console.log("Recovered Aggregator Spec:", spec);
      } catch (e) {
        console.warn("Failed to parse Aggregation Spec");
      }
    }
    const keysEl = doc.getElementById("weba-l2-key") || doc.getElementById("weba-l2-keys");
    if (keysEl) {
      try {
        lastGeneratedKeys = JSON.parse(keysEl.textContent || "");
        console.log("Recovered Encryption Keys:", lastGeneratedKeys);
      } catch (e) {
        console.warn("Failed to parse Encryption Keys");
      }
    }
    window.setPreviewMode("aggregator");
    const preview = document.getElementById("preview");
    if (preview) {
      preview.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:0;"></iframe>`;
      const frame = document.getElementById("preview-frame");
      if (frame) {
        const blob = new Blob([text], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        frame.src = url;
        frame.onload = () => URL.revokeObjectURL(url);
      }
    }
    alert(`Tool Loaded Successfully!
You can now use use your Passkey to aggregate files within this preview.`);
  } catch (e) {
    console.error(e);
    alert("Failed to load tool.");
  } finally {
    input.value = "";
  }
}
window.loadToolFile = loadToolFile;
