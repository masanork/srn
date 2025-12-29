window.__WEBA_BUILD_TIME__='2025-12-29T09:54:35Z';
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

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

// node:path
var exports_path = {};
__export(exports_path, {
  win32: () => y,
  toNamespacedPath: () => U,
  sep: () => I,
  resolve: () => B,
  relative: () => Q,
  posix: () => g,
  parse: () => $,
  normalize: () => G,
  join: () => K,
  isAbsolute: () => H,
  format: () => Z,
  extname: () => Y,
  dirname: () => V,
  delimiter: () => O,
  default: () => q,
  basename: () => X
});
var L, h, D, T, _, E, R = (s, e) => () => (e || s((e = { exports: {} }).exports, e), e.exports), N = (s, e, r, t) => {
  if (e && typeof e == "object" || typeof e == "function")
    for (let i2 of T(e))
      !E.call(s, i2) && i2 !== r && h(s, i2, { get: () => e[i2], enumerable: !(t = D(e, i2)) || t.enumerable });
  return s;
}, j = (s, e, r) => (r = s != null ? L(_(s)) : {}, N(e || !s || !s.__esModule ? h(r, "default", { value: s, enumerable: true }) : r, s)), k, x, u, J, P = function(s) {
  return s;
}, S = function() {
  throw new Error("Not implemented");
}, g, y, q, B, G, H, K, Q, U, V, X, Y, Z, $, I, O;
var init_path = __esm(() => {
  L = Object.create;
  h = Object.defineProperty;
  D = Object.getOwnPropertyDescriptor;
  T = Object.getOwnPropertyNames;
  _ = Object.getPrototypeOf;
  E = Object.prototype.hasOwnProperty;
  k = R((W, w) => {
    function v(s) {
      if (typeof s != "string")
        throw new TypeError("Path must be a string. Received " + JSON.stringify(s));
    }
    function C(s, e) {
      for (var r = "", t = 0, i2 = -1, a = 0, n, l = 0;l <= s.length; ++l) {
        if (l < s.length)
          n = s.charCodeAt(l);
        else {
          if (n === 47)
            break;
          n = 47;
        }
        if (n === 47) {
          if (!(i2 === l - 1 || a === 1))
            if (i2 !== l - 1 && a === 2) {
              if (r.length < 2 || t !== 2 || r.charCodeAt(r.length - 1) !== 46 || r.charCodeAt(r.length - 2) !== 46) {
                if (r.length > 2) {
                  var f = r.lastIndexOf("/");
                  if (f !== r.length - 1) {
                    f === -1 ? (r = "", t = 0) : (r = r.slice(0, f), t = r.length - 1 - r.lastIndexOf("/")), i2 = l, a = 0;
                    continue;
                  }
                } else if (r.length === 2 || r.length === 1) {
                  r = "", t = 0, i2 = l, a = 0;
                  continue;
                }
              }
              e && (r.length > 0 ? r += "/.." : r = "..", t = 2);
            } else
              r.length > 0 ? r += "/" + s.slice(i2 + 1, l) : r = s.slice(i2 + 1, l), t = l - i2 - 1;
          i2 = l, a = 0;
        } else
          n === 46 && a !== -1 ? ++a : a = -1;
      }
      return r;
    }
    function F(s, e) {
      var r = e.dir || e.root, t = e.base || (e.name || "") + (e.ext || "");
      return r ? r === e.root ? r + t : r + s + t : t;
    }
    var m = { resolve: function() {
      for (var e = "", r = false, t, i2 = arguments.length - 1;i2 >= -1 && !r; i2--) {
        var a;
        i2 >= 0 ? a = arguments[i2] : (t === undefined && (t = process.cwd()), a = t), v(a), a.length !== 0 && (e = a + "/" + e, r = a.charCodeAt(0) === 47);
      }
      return e = C(e, !r), r ? e.length > 0 ? "/" + e : "/" : e.length > 0 ? e : ".";
    }, normalize: function(e) {
      if (v(e), e.length === 0)
        return ".";
      var r = e.charCodeAt(0) === 47, t = e.charCodeAt(e.length - 1) === 47;
      return e = C(e, !r), e.length === 0 && !r && (e = "."), e.length > 0 && t && (e += "/"), r ? "/" + e : e;
    }, isAbsolute: function(e) {
      return v(e), e.length > 0 && e.charCodeAt(0) === 47;
    }, join: function() {
      if (arguments.length === 0)
        return ".";
      for (var e, r = 0;r < arguments.length; ++r) {
        var t = arguments[r];
        v(t), t.length > 0 && (e === undefined ? e = t : e += "/" + t);
      }
      return e === undefined ? "." : m.normalize(e);
    }, relative: function(e, r) {
      if (v(e), v(r), e === r || (e = m.resolve(e), r = m.resolve(r), e === r))
        return "";
      for (var t = 1;t < e.length && e.charCodeAt(t) === 47; ++t)
        ;
      for (var i2 = e.length, a = i2 - t, n = 1;n < r.length && r.charCodeAt(n) === 47; ++n)
        ;
      for (var l = r.length, f = l - n, c = a < f ? a : f, d = -1, o = 0;o <= c; ++o) {
        if (o === c) {
          if (f > c) {
            if (r.charCodeAt(n + o) === 47)
              return r.slice(n + o + 1);
            if (o === 0)
              return r.slice(n + o);
          } else
            a > c && (e.charCodeAt(t + o) === 47 ? d = o : o === 0 && (d = 0));
          break;
        }
        var A = e.charCodeAt(t + o), z = r.charCodeAt(n + o);
        if (A !== z)
          break;
        A === 47 && (d = o);
      }
      var b = "";
      for (o = t + d + 1;o <= i2; ++o)
        (o === i2 || e.charCodeAt(o) === 47) && (b.length === 0 ? b += ".." : b += "/..");
      return b.length > 0 ? b + r.slice(n + d) : (n += d, r.charCodeAt(n) === 47 && ++n, r.slice(n));
    }, _makeLong: function(e) {
      return e;
    }, dirname: function(e) {
      if (v(e), e.length === 0)
        return ".";
      for (var r = e.charCodeAt(0), t = r === 47, i2 = -1, a = true, n = e.length - 1;n >= 1; --n)
        if (r = e.charCodeAt(n), r === 47) {
          if (!a) {
            i2 = n;
            break;
          }
        } else
          a = false;
      return i2 === -1 ? t ? "/" : "." : t && i2 === 1 ? "//" : e.slice(0, i2);
    }, basename: function(e, r) {
      if (r !== undefined && typeof r != "string")
        throw new TypeError('"ext" argument must be a string');
      v(e);
      var t = 0, i2 = -1, a = true, n;
      if (r !== undefined && r.length > 0 && r.length <= e.length) {
        if (r.length === e.length && r === e)
          return "";
        var l = r.length - 1, f = -1;
        for (n = e.length - 1;n >= 0; --n) {
          var c = e.charCodeAt(n);
          if (c === 47) {
            if (!a) {
              t = n + 1;
              break;
            }
          } else
            f === -1 && (a = false, f = n + 1), l >= 0 && (c === r.charCodeAt(l) ? --l === -1 && (i2 = n) : (l = -1, i2 = f));
        }
        return t === i2 ? i2 = f : i2 === -1 && (i2 = e.length), e.slice(t, i2);
      } else {
        for (n = e.length - 1;n >= 0; --n)
          if (e.charCodeAt(n) === 47) {
            if (!a) {
              t = n + 1;
              break;
            }
          } else
            i2 === -1 && (a = false, i2 = n + 1);
        return i2 === -1 ? "" : e.slice(t, i2);
      }
    }, extname: function(e) {
      v(e);
      for (var r = -1, t = 0, i2 = -1, a = true, n = 0, l = e.length - 1;l >= 0; --l) {
        var f = e.charCodeAt(l);
        if (f === 47) {
          if (!a) {
            t = l + 1;
            break;
          }
          continue;
        }
        i2 === -1 && (a = false, i2 = l + 1), f === 46 ? r === -1 ? r = l : n !== 1 && (n = 1) : r !== -1 && (n = -1);
      }
      return r === -1 || i2 === -1 || n === 0 || n === 1 && r === i2 - 1 && r === t + 1 ? "" : e.slice(r, i2);
    }, format: function(e) {
      if (e === null || typeof e != "object")
        throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof e);
      return F("/", e);
    }, parse: function(e) {
      v(e);
      var r = { root: "", dir: "", base: "", ext: "", name: "" };
      if (e.length === 0)
        return r;
      var t = e.charCodeAt(0), i2 = t === 47, a;
      i2 ? (r.root = "/", a = 1) : a = 0;
      for (var n = -1, l = 0, f = -1, c = true, d = e.length - 1, o = 0;d >= a; --d) {
        if (t = e.charCodeAt(d), t === 47) {
          if (!c) {
            l = d + 1;
            break;
          }
          continue;
        }
        f === -1 && (c = false, f = d + 1), t === 46 ? n === -1 ? n = d : o !== 1 && (o = 1) : n !== -1 && (o = -1);
      }
      return n === -1 || f === -1 || o === 0 || o === 1 && n === f - 1 && n === l + 1 ? f !== -1 && (l === 0 && i2 ? r.base = r.name = e.slice(1, f) : r.base = r.name = e.slice(l, f)) : (l === 0 && i2 ? (r.name = e.slice(1, n), r.base = e.slice(1, f)) : (r.name = e.slice(l, n), r.base = e.slice(l, f)), r.ext = e.slice(n, f)), l > 0 ? r.dir = e.slice(0, l - 1) : i2 && (r.dir = "/"), r;
    }, sep: "/", delimiter: ":", win32: null, posix: null };
    m.posix = m;
    w.exports = m;
  });
  x = j(k());
  u = x;
  J = x;
  u.parse ??= S;
  J.parse ??= S;
  g = { resolve: u.resolve.bind(u), normalize: u.normalize.bind(u), isAbsolute: u.isAbsolute.bind(u), join: u.join.bind(u), relative: u.relative.bind(u), toNamespacedPath: P, dirname: u.dirname.bind(u), basename: u.basename.bind(u), extname: u.extname.bind(u), format: u.format.bind(u), parse: u.parse.bind(u), sep: "/", delimiter: ":", win32: undefined, posix: undefined, _makeLong: P };
  y = { sep: "\\", delimiter: ";", win32: undefined, ...g, posix: g };
  g.win32 = y.win32 = y;
  g.posix = g;
  q = g;
  ({ resolve: B, normalize: G, isAbsolute: H, join: K, relative: Q, toNamespacedPath: U, dirname: V, basename: X, extname: Y, format: Z, parse: $, sep: I, delimiter: O } = g);
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
var FAVICON_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxMTE4MjciLz48dGV4dCB4PSI1MCUiIHk9IjU2JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZjlmYWZiIiBmb250LXdlaWdodD0iNzAwIj5TUjwvdGV4dD48L3N2Zz4=";
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
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${jsonStructure.name || "Web/A Form"}</title><link rel="icon" href="${FAVICON_DATA_URI}"><style>
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
  const buildStamp = typeof window !== "undefined" && window.__WEBA_BUILD_TIME__ ? window.__WEBA_BUILD_TIME__ : "";
  return `<!DOCTYPE html><html><head><title>Aggregator</title><link rel="icon" href="${FAVICON_DATA_URI}"><style>
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
    </style></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script>window.__WEBA_BUILD_TIME__=${JSON.stringify(buildStamp)};</script><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-agg-spec" type="application/json">${aggSpec}</script><script id="weba-source-markdown" type="text/plain">${sourceMd}</script><script id="weba-l2-keys" type="application/json"></script><script>${RUNTIME_SCRIPT}</script></body></html>`;
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

// src/form/client/l2crypto.ts
var import_canonicalize = __toESM(require_canonicalize(), 1);

// src/core/wasm_bindings/weba_crypto_wasm.js
var wasm;
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === undefined || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder;
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
function get_version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.get_version();
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}
function hkdf_sha256_wasm(ikm, salt, info, okm_len) {
  const ptr0 = passArray8ToWasm0(ikm, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(salt, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(info, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.hkdf_sha256_wasm(ptr0, len0, ptr1, len1, ptr2, len2, okm_len);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
}
function x25519_get_public_key(private_key) {
  const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.x25519_get_public_key(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
var EXPECTED_RESPONSE_TYPES = new Set(["basic", "cors", "default"]);
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
    const ret = typeof arg0 === "function";
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
    const val = arg0;
    const ret = typeof val === "object" && val !== null;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
    const ret = typeof arg0 === "string";
    return ret;
  };
  imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
    const ret = arg0 === undefined;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbg_call_3020136f7a2d6e44 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = arg0.call(arg1, arg2);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_call_abb4ff46ce38be40 = function() {
    return handleError(function(arg0, arg1) {
      const ret = arg0.call(arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
    const ret = arg0.crypto;
    return ret;
  };
  imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() {
    return handleError(function(arg0, arg1) {
      arg0.getRandomValues(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
    const ret = arg0.msCrypto;
    return ret;
  };
  imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_new_with_length_aa5eaf41d35235e5 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
  };
  imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
    const ret = arg0.node;
    return ret;
  };
  imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
    const ret = arg0.process;
    return ret;
  };
  imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
  };
  imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() {
    return handleError(function(arg0, arg1) {
      arg0.randomFillSync(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_require_60cc747a6bc5215a = function() {
    return handleError(function() {
      const ret = module_weba_crypto_wasm.require;
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
    const ret = typeof global === "undefined" ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
    const ret = typeof globalThis === "undefined" ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
    const ret = typeof self === "undefined" ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
    const ret = typeof window === "undefined" ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_subarray_845f2f5bce7d061a = function(arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
  };
  imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
    const ret = arg0.versions;
    return ret;
  };
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
  };
  return imports;
}
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_init(module_or_path) {
  if (wasm !== undefined)
    return wasm;
  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (typeof module_or_path === "undefined") {
    module_or_path = new URL("weba_crypto_wasm_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
var weba_crypto_wasm_default = __wbg_init;

// src/core/wasm_binary.ts
var WASM_BINARY_B64 = "AGFzbQEAAAABiAMyYAJ/fwF/YAJ/fwBgA39/fwF/YAN/f38AYAF/AGAABH9/f39gAX8Bf2AEf39/fwBgBX9/f39/AGAAAX9gBH9/f38Bf2ABbwFvYAFvAX9gBX9/f35/AGAGf39/f39/AGAFf39/f38Bf2AEf39/fwR/f39/YAADf39/YAJ/fwFvYAd/f39/f39/AGAAAn9/YAJvbwBgAABgBn9/f39/fwF/YAl/f39/f39/f38AYAh/f39/f39/fwR/f39/YAd/f39/f39/BH9/f39gBn9/f39/fwN/f39gAn9/BH9/f39gAAFvYAN/f28AYAF/AW9gA29/fwFvYAJvbwFvYANvb28Bb2ACfH8Bf2AEf39/fgBgAn5/AX9gCX9/f39/f35+fgBgC39/f39/f39/f39/AX9gBH9+fn4AYAp/f39/f39/f39/BH9/f39gBn9/f39/fwR/f39/YAJ/fwJ/f2AFf39+f38AYAR/fn9/AGAFf398f38AYAR/fH9/AGAFf399f38AYAR/fX9/AAKKCRsDd2JnHV9fd2JnX2NyeXB0b181NzRlNzhhZDhiMTNiNjVmAAsDd2JnHl9fd2JnX3Byb2Nlc3NfZGMwZmJhY2M3YzFjMDZmNwALA3diZx9fX3diZ192ZXJzaW9uc19jMDFkZmQ0NzIyYTg4MTY1AAsDd2JnG19fd2JnX25vZGVfOTA1ZDNlMjUxZWRmZjhhMgALA3diZx5fX3diZ19yZXF1aXJlXzYwY2M3NDdhNmJjNTIxNWEAHQN3YmcfX193YmdfbXNDcnlwdG9fYTYxYWViMzVhMjRjMTMyOQALA3diZyVfX3diZ19yYW5kb21GaWxsU3luY19hYzA5ODhhYmEzMjU0MjkwABUDd2JnJl9fd2JnX2dldFJhbmRvbVZhbHVlc19iOGY1ZGJkNWYzOTk1YTllABUDd2JnIl9fd2JnX25ld19ub19hcmdzX2NiMTM4Zjc3Y2Y2MTUxZWUAEgN3YmcdX193YmdfbGVuZ3RoXzIyYWMyM2VhZWM5ZDgwNTMADAN3YmcnX193YmdfcHJvdG90eXBlc2V0Y2FsbF9kZmU5Yjc2NmNkYzFmMWZkAB4Dd2JnJl9fd2JnX25ld193aXRoX2xlbmd0aF9hYTVlYWY0MWQzNTIzNWU1AB8Dd2JnH19fd2JnX3N1YmFycmF5Xzg0NWYyZjViY2U3ZDA2MWEAIAN3YmcyX193Ymdfc3RhdGljX2FjY2Vzc29yX0dMT0JBTF9USElTXzYwY2YwMmRiNGRlOGUxYzEACQN3YmcbX193YmdfY2FsbF9hYmI0ZmY0NmNlMzhiZTQwACEDd2JnK19fd2JnX3N0YXRpY19hY2Nlc3Nvcl9TRUxGXzA4ZjVhNzRjNjk3MzkyNzQACQN3YmctX193Ymdfc3RhdGljX2FjY2Vzc29yX0dMT0JBTF83NjllNmI2NWQ2NTU3MzM1AAkDd2JnLV9fd2JnX3N0YXRpY19hY2Nlc3Nvcl9XSU5ET1dfYTg5MjRiMjZhYTkyZDAyNAAJA3diZxtfX3diZ19jYWxsXzMwMjAxMzZmN2EyZDZlNDQAIgN3YmcnX193YmdfX193YmluZGdlbl90aHJvd19kZDI0NDE3ZWQzNmZjNDZlAAEDd2JnK19fd2JnX19fd2JpbmRnZW5faXNfb2JqZWN0X2NlNzc0ZjM0OTA2OTIzODYADAN3YmcrX193YmdfX193YmluZGdlbl9pc19zdHJpbmdfNzA0ZWY5YzhmYzEzMTAzMAAMA3diZy1fX3diZ19fX3diaW5kZ2VuX2lzX2Z1bmN0aW9uXzhkNDAwYjhiMWFmOTc4Y2QADAN3YmcuX193YmdfX193YmluZGdlbl9pc191bmRlZmluZWRfZjZiOTVlYWI1ODllMDI2OQAMA3diZx9fX3diaW5kZ2VuX2luaXRfZXh0ZXJucmVmX3RhYmxlABYDd2JnIF9fd2JpbmRnZW5fY2FzdF8yMjQxYjZhZjRjNGIyOTQxABIDd2JnIF9fd2JpbmRnZW5fY2FzdF9jYjkwODgxMDJiY2U2YjMwABID/gL8AgMDAQYBAQEDBwEGASMBARMDAAEBAwEBAwEBBAIBAwMDAQEDAQMDAwMDAAMDAgcBCAEDAwMkAwcHAwcDFwEBAwQNAwEDBwQIAggCAQQIAQEAAQcCAgMDAwEAAQACEwcDAQYDJQEBBwEHAgMBAQENAQEDAwEDASYBAQMAAQMBAQEGAQ4KDgEBAQMDAwgAAAkBAQADAwQBAAAPDQAAAQMACgEJAAATBAAGGBgAAAEBAwYCAQQAAgAEAAEDBAEEBAQIBgEOCCcDAQMOAQYEAwMBAAAKAgADAAQBAQQABwAoBAgEAAANAQAABAIBAQQDAAADBgMBAAYAAwECAgQGAQYCBAAAAwMDAAIAAQEHAykEABkZAAAaGgEPKgAGBwAABBAbEBAQGwkcHAQAAQEFBQUFKwoXFAgsDy4wBAcAAAIEAAEBAQEBAAQEBAQABgMCAAgAAAoAAAABAQQAAQAABgMGBAAAAAAAAAAABgAAAAEWAAEAAAECAAAAAAEBBAYDBAsCcAGBAYEBbwCAAQUDAQASBgkBfwFBgIDAAAsHzQUgBm1lbW9yeQIAD2Flc19nY21fZGVjcnlwdACpAg9hZXNfZ2NtX2VuY3J5cHQAqgIWYnVpbGRfbDJfZW52ZWxvcGVfd2FzbQCmAhNjb25zdGFudF90aW1lX2VxdWFsAOsBGGRlY3J5cHRfbDJfZW52ZWxvcGVfd2FzbQCxAhhlZDI1NTE5X2dlbmVyYXRlX2tleXBhaXIAyAIMZWQyNTUxOV9zaWduALoCDmVkMjU1MTlfdmVyaWZ5ALkCF2dldF9wYWRkaW5nX3RhcmdldF9zaXplAI4CC2dldF92ZXJzaW9uAMwCEmhrZGZfc2hhMjU2X2Rlcml2ZQCtAhBoa2RmX3NoYTI1Nl93YXNtAK4CGm1sX2RzYV80NF9nZW5lcmF0ZV9rZXlwYWlyAMYCDm1sX2RzYV80NF9zaWduALsCEG1sX2RzYV80NF92ZXJpZnkAvQIWbWxfa2VtXzc2OF9kZWNhcHN1bGF0ZQC4AhZtbF9rZW1fNzY4X2VuY2Fwc3VsYXRlAL8CG21sX2tlbV83NjhfZ2VuZXJhdGVfa2V5cGFpcgDFAgtzaGEyNTZfaGFzaADJAgtzaGEyNTZfd2FzbQDJAhd4MjU1MTlfZ2VuZXJhdGVfa2V5cGFpcgDHAhV4MjU1MTlfZ2V0X3B1YmxpY19rZXkAwAIYeDI1NTE5X2dldF9zaGFyZWRfc2VjcmV0ALwCFF9fd2JpbmRnZW5fZXhuX3N0b3JlAPECF19fZXh0ZXJucmVmX3RhYmxlX2FsbG9jAKgBFV9fd2JpbmRnZW5fZXh0ZXJucmVmcwEBEV9fd2JpbmRnZW5fbWFsbG9jAMICGV9fZXh0ZXJucmVmX3RhYmxlX2RlYWxsb2MAgQIPX193YmluZGdlbl9mcmVlAOUCEl9fd2JpbmRnZW5fcmVhbGxvYwDKAhBfX3diaW5kZ2VuX3N0YXJ0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+wBGDQEgASACQa8CakGgt8AAEDYhBgwZCyABIAEtABhBAWsiBjoAGCAGQf8BcQRAIAEgBUEBajYCFCACQQE6AJgCIAIgATYClAIgAkGQAWogAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUASEGQYCAgIB4IQQMFgsgAi0AkQFBAUcNByACQZABaiILIAIoApQCEJsBQYCAgIB4IQQgAigClAEhBiACKAKQASIFQYCAgIB4Rg0VIAIoApgBIQogCyACQZQCahCKASACLQCQAUEBRgRAIAIoApQBDBULIAItAJEBQQFHDQYgAkGQAWoiBCACKAKUAhAmIAIoApQBIgMgAigCkAEiB0GAgICAeEYNFBogAigCsAEhFyACKAKsASEOIAIoAqgBIQ8gAigCpAEhGCACKAKgASETIAIoApwBIQwgAigCmAEhHSAEIAJBlAJqEIoBIAItAJABQQFGBEAgAigClAEMFAsgAi0AkQFBAUcNBSACQZABaiIEIAIoApQCEJsBIAIoApQBIgkgAigCkAEiFEGAgICAeEYNExogAigCmAEhHiAEIAJBlAJqEIoBIAItAJABQQFGBEAgAigClAEMEwsgAi0AkQFBAUcNBCACQZABaiIEIAIoApQCEDAgAigClAEiESACKAKQASIVQYCAgIB4Rg0SGiACKAKkASEfIAIoAqABIRkgAigCnAEhFiACKAKYASENIAQgAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUAQwSCyACLQCRAUEBRw0DIAJBkAFqIgQgAigClAIQmwEgAigClAEiEiACKAKQASIaQYCAgIB4Rg0RGiACKAKYASEhIAQgAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUASEQDBELIAItAJEBQQFHDQIgAkGQAWoiBCACKAKUAhCbASACKAKUASEQIAIoApABIhtBgICAgHhGDRAgAigCmAEhJCMAQRBrIggkACAIQQRqIAJBlAJqIgsQigECQCAILQAEQQFGBEAgBCAIKAIINgIEIARBgYCAgHg2AgAMAQsgCC0ABUUEQCAEQYCAgIB4NgIADAELIAhBBGogCygCABCbASAIKAIEQYCAgIB4RgRAIAQgCCgCCDYCBCAEQYGAgIB4NgIADAELIAQgCCkCBDcCACAEQQhqIAhBDGooAgA2AgALIAhBEGokACACKAKUASEI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NwMAIAJBsAFqIBs3AwAgAkIANwNAIAJB0NrBACkCACIbNwNoIAIgGzcDkAEgAkHYAWpCADcDACACQdABakIANwMAIAJByAFqQgA3AwAgAkHAAWpCADcDACACQgA3A7gBIAJB+ANqIQwgAkHQA2ohDSACQagDaiEOIAJB6AVqIQsgAkHABWohBSACQZAGaiEGIAJBkAFqIQ8gAkHoAGohEANAAkACQCABQcAARwRAIAFBAXENAQwCCyACQegEaiAQQSBqKQIANwMAIAJB4ARqIBBBGGopAgA3AwAgAkHYBGogEEEQaikCADcDACACQdAEaiAQQQhqKQIANwMAIAJB+ARqIA9BCGopAgA3AwAgAkGABWogD0EQaikCADcDACACQYgFaiAPQRhqKQIANwMAIAJBkAVqIA9BIGopAgA3AwAgAiAQKQIANwPIBCACIA8pAgA3A/AEIAJBwARqIAJB4ABqKQMANwMAIAJBuARqIAJB2ABqKQMANwMAIAJBsARqIAJB0ABqKQMANwMAIAJBqARqIAJByABqKQMANwMAIAIgAikDQDcDoAQgAkGYBWoiAyACQaAEahAkQQAiAUUEQCACQYADaiADQaAB/AoAAAsgAkGYBWoiByACQYADaiITIAJB+ANqIgkQMiACQYgHaiIVIAJBqANqIhEgAkHQA2oiChAyIAJB4AFqIhQgCiAJEDIgAkHgBWoiGiACQagHaiIWKQIANwIAIAJB2AVqIgwgAkGgB2oiFykCADcCACACQdAFaiINIAJBmAdqIhgpAgA3AgAgAkHIBWoiDiACQZAHaiIZKQIANwIAIAJB8AVqIg8gAkHoAWoiECkCADcCACACQfgFaiILIAJB8AFqIgUpAgA3AgAgAkGABmoiBiACQfgBaiIIKQIANwIAIAJBiAZqIgQgAkGAAmoiAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSACQaAEaiISIAdB+AD8CgAAIAcgEhAkIBMgB0GgAfwKAAAgByATIAkQMiAVIBEgChAyIBQgCiAJEDIgGiAWKQIANwIAIAwgFykCADcCACANIBgpAgA3AgAgDiAZKQIANwIAIA8gECkCADcCACALIAUpAgA3AgAgBiAIKQIANwIAIAQgAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSASIAdB+AD8CgAAIAcgEhAkIBMgB0GgAfwKAAAgByATIAkQMiAVIBEgChAyIBQgCiAJEDIgGiAWKQIANwIAIAwgFykCADcCACANIBgpAgA3AgAgDiAZKQIANwIAIA8gECkCADcCACALIAUpAgA3AgAgBiAIKQIANwIAIAQgAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSASIAdB+AD8CgAAIAcgEhAkIBQgByACQZAGaiILEDIgAkG4BmogAkHABWoiBSACQegFaiIGEDIgAkHgBmogBiALEDIgFSAHIAUQMiACQagCaiACQdgGaikCADcCACACQaACaiACQdAGaikCADcCACACQZgCaiACQcgGaikCADcCACACQZACaiACQcAGaikCADcCACACQbgCaiACQegGaikCADcCACACQcACaiACQfAGaikCADcCACACQcgCaiACQfgGaikCADcCACACQdACaiACQYAHaikCADcCACACIAIpArgGNwKIAiACIAIpAuAGNwKwAiACQfgCaiAWKQIANwIAIAJB8AJqIBcpAgA3AgAgAkHoAmogGCkCADcCACACQeACaiAZKQIANwIAIAIgAikCiAc3AtgCIAJBQGsgFEGgAfwKAAADQAJAAkAgAUHAAEcEQCABQQFxRQ0BDAILIAAgAkFAa0GgAfwKAAAgAkGwB2okAA8LIAFBAXYhBCABQcAASQRAIAJB4AFqIgMgBEHAB2xB8JjCAGogASACai0AABBvIAJBmAVqIgggAkFAayIEIAMQQiACQYADaiIDIAggCxAyIAJB4AZqIAUgBhAyIAJBiAdqIAYgCxAyIAJBoARqIAggBRAyIBFBIGogAkGAB2opAgA3AgAgEUEYaiACQfgGaikCADcCACARQRBqIAJB8AZqKQIANwIAIBFBCGogAkHoBmopAgA3AgAgESACKQLgBjcCACAKIAIpAogHNwIAIApBCGogAkGQB2opAgA3AgAgCkEQaiACQZgHaikCADcCACAKQRhqIAJBoAdqKQIANwIAIApBIGogAkGoB2opAgA3AgAgCUEgaiACQcAEaikCADcCACAJQRhqIAJBuARqKQIANwIAIAlBEGogAkGwBGopAgA3AgAgCUEIaiACQagEaikCADcCACAJIAIpAqAENwIAIAQgA0GgAfwKAAAgAUEBaiEBDAILIARBIEH42sEAEIYCAAsgAUEBaiEBDAALAAsgAUEBdiEEIAFBwABJBEAgAkHgAWoiAyAEQcAHbEHwmMIAaiABIAJqLQAAEG8gAkGYBWoiCCACQUBrIgQgAxBCIAJBgANqIgMgCCAGEDIgAkHgBmogBSALEDIgAkGIB2ogCyAGEDIgAkGgBGogCCAFEDIgDkEgaiACQYAHaikCADcCACAOQRhqIAJB+AZqKQIANwIAIA5BEGogAkHwBmopAgA3AgAgDkEIaiACQegGaikCADcCACAOIAIpAuAGNwIAIA0gAikCiAc3AgAgDUEIaiACQZAHaikCADcCACANQRBqIAJBmAdqKQIANwIAIA1BGGogAkGgB2opAgA3AgAgDUEgaiACQagHaikCADcCACAMQSBqIAJBwARqKQIANwIAIAxBGGogAkG4BGopAgA3AgAgDEEQaiACQbAEaikCADcCACAMQQhqIAJBqARqKQIANwIAIAwgAikCoAQ3AgAgBCADQaAB/AoAACABQQFqIQEMAgsgBEEgQfjawQAQhgIACyABQQFqIQEMAAsAC+ckAhB/An4jAEGwAWsiAyQAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJ/AkACQAJ/AkACQAJ/AkACQAJAAkAgASgCFCIEIAEoAhAiB0kEQEEAIAdrIQggBEEFaiEEIAFBDGohAiABKAIMIQkDQAJAAkAgBCAJaiIGQQVrLQAAIg1BCWsOJQEBFBQBFBQUFBQUFBQUFBQUFBQUFBQUARQRFBQUFBQUFBQUFBAACyANQdsAaw4hERMTExMTExMTExMFExMTExMTEwMTExMTEwQTExMTExMSEwsgASAEQQRrNgIUIAggBEEBaiIEakEFRw0ACwsgA0EFNgJwIANBEGogAUEMahCRAiADQfAAaiADKAIQIAMoAhQQoAIhASAAQQY6AAAgACABNgIEDBsLIAEgBEEEayIINgIUIAcgCE0NAiABIARBA2siCTYCFAJAIAZBBGstAABB9QBHDQAgCSAIIAcgByAISRsiB0YNAyABIARBAmsiCDYCFCAGQQNrLQAAQewARw0AIAcgCEYNAyABIARBAWs2AhQgBkECay0AAEHsAEYNBQsgA0EJNgJwIANBIGogAhCiAiADQfAAaiADKAIgIAMoAiQQoAIMAwsgASAEQQRrIgg2AhQgByAITQ0EIAEgBEEDayIJNgIUAkAgBkEEay0AAEHyAEcNACAJIAggByAHIAhJGyIHRg0FIAEgBEECayIINgIUIAZBA2stAABB9QBHDQAgByAIRg0FIAEgBEEBazYCFCAGQQJrLQAAQeUARg0HCyADQQk2AnAgA0EwaiACEKICIANB8ABqIAMoAjAgAygCNBCgAgwFCyABIARBBGsiCDYCFCAHIAhNDQYgASAEQQNrIgk2AhQCQCAGQQRrLQAAQeEARw0AIAkgCCAHIAcgCEkbIgdGDQcgASAEQQJrIgg2AhQgBkEDay0AAEHsAEcNACAHIAhGDQcgASAEQQFrIgg2AhQgBkECay0AAEHzAEcNACAHIAhGDQcgASAENgIUIAZBAWstAABB5QBGDQkLIANBCTYCcCADQUBrIAIQogIgA0HwAGogAygCQCADKAJEEKACDAcLIANBBTYCcCADQRhqIAIQogIgA0HwAGogAygCGCADKAIcEKACCyEBIABBBjoAACAAIAE2AgQMFgsgAEEAOgAADBULIANBBTYCcCADQShqIAIQogIgA0HwAGogAygCKCADKAIsEKACCyEBIABBBjoAACAAIAE2AgQMEwsgAEGBAjsBAAwSCyADQQU2AnAgA0E4aiACEKICIANB8ABqIAMoAjggAygCPBCgAgshASAAQQY6AAAgACABNgIEDBALIABBATsBAAwPCyABIARBBGs2AhRBACEEIANB8ABqIAFBABCEASADKQNwIhNCA1ENDUECIQEgAykDeCESAkACQAJAIBOnQQFrDgICAQALQQIhBEECQQAgEkL///////////8Ag0KAgICAgICA+P8AVBshAQwBCyASQj+IpyEECyAAIBI3AxAgAEEANgIMIAAgBDYCCCAAIAE6AAAMDgsgAUEANgIIIAEgBEEEazYCFCADQfAAaiACIAEQfCADKAJ0IQQgAygCcCIHQQJGDQsgAygCeCEBIAdBAXEEQEEAIQIgAUEATgRAIAFFBEBBASEJDA0LQQEhAiABQQEQgQMiCQ0MCyACIAEQ3QIAC0EAIQIgAUEATgRAIAFFBEBBASEJDAsLQQEhAiABQQEQgQMiCQ0KCyACIAEQ3QIACyABIAEtABhBAWsiBzoAGCAHQf8BcUUNByABIARBBGs2AhQgAyABNgKQASADQQE6AJQBIANBADYCYCADQoCAgICAATcCWCADQfAAaiIEIANBkAFqEIoBIAMtAHANAyADQfgAaiEIIARBAXIhDQNAAkAgAy0AcUEBRgRAIANB8ABqIAMoApABECEgAy0AcCIJQQZHDQEMBgtBBCECQQEhB0EAIQkgAykCXCESIAMoAlghBAwGCyADQa4BaiIGIA1BAmotAAA6AAAgA0GgAWoiBSAIQQhqKQMANwMAIAMgDS8AADsBrAEgAyAIKQMANwOYASADKAJ0IQogAygCYCICIAMoAlhGBEAjAEEQayIEJAAgBEEEaiADQdgAaiIHKAIAIgsgBygCBEEEIAtBAXQiCyALQQRNGyILQQhBGBDcASAEKAIEQQFGBEAgBCgCCCAEKAIMEN0CAAsgBCgCCCEMIAcgCzYCACAHIAw2AgQgBEEQaiQACyADKAJcIAJBGGxqIgQgAy8BrAE7AAEgBCAJOgAAIAQgCjYABCAEIAMpA5gBNwAIIARBA2ogBi0AADoAACAEQRBqIAUpAwA3AAAgAyACQQFqNgJgIANB8ABqIANBkAFqEIoBIAMtAHBFDQALDAMLIAEgAS0AGEEBayIGOgAYIAZB/wFxRQ0BIAEgBEEEazYCFCADQdgAaiEGIwBBwAFrIgIkACACQQE6AAggAiABNgIEIAJBnAFqIgQgAkEEahB0AkACfwJAAkACQAJAAkACQCACLQCcAUEBRwRAIAItAJ0BQQFHDQIgAigCBCIOIQUjAEEQayIKJAAgBUEANgIIIAUgBSgCFEEBajYCFCAKQQRqIAVBDGogBRB8IAooAgghDwJAAkACQCAKKAIEIgtBAkYEQCAEQYCAgIB4NgIAIAQgDzYCBAwBCyAKKAIMIQUCQCALQQFxBEBBACELIAVBAE4EQCAFRQRAQQEhDAwDC0EBIQsgBUEBEIEDIgwNAgsgCyAFEN0CAAtBACELIAVBAEgNAiAFRQRAQQEhDAwBC0EBIQsgBUEBEIEDIgxFDQILIAUEQCAMIA8gBfwKAAALIAQgBTYCCCAEIAw2AgQgBCAFNgIACyAKQRBqJAAMAQsgCyAFEN0CAAsgAigCnAEiBEGAgICAeEcNAQsgAigCoAEhBCAGQQY6AAAgBiAENgIEDAcLIAIoAqABIQUgAigCpAEhCiACQQA2AhQgAkEANgIMIAIgCjYCpAEgAiAFNgKgASACIAQ2ApwBIA4Q2gEiCkUNASAGQQY6AAAgBiAKNgIEDAILIAZBADYCDCAGQQA2AgQgBkEFOgAADAULIAYgDhAhIAYtAABBBkcNAQsgBEUNASAFIARBARD3AgwBCyACQShqIAZBEGopAwA3AwAgAkEgaiAGQQhqKQMANwMAIAIgBikDADcDGCACQYABaiACQQxqIAJBnAFqIAJBGGoQggECQAJAAkACQCACLQCAAQ4HAwMDAQIAAwALIAICfyACKAKEASIERQRAQQAhBEEADAELIAIgAigCiAEiBTYCuAEgAiAENgK0ASACQQA2ArABIAIgBTYCqAEgAiAENgKkASACQQA2AqABQQEhBCACKAKMAQs2ArwBIAIgBDYCrAEgAiAENgKcASACQZwBahA1DAILIAIoAoQBIgRFDQEgAigCiAEgBEEBEPcCDAELIAJBgAFqQQRyENABIAIoAoQBIgRFDQAgAigCiAEgBEEYbEEIEPcCCyACQTRqIQsgAkGAAWpBBHIhESACQaABaiEMAkACQANAAkAgAkH0AGohBUEAIQ8jAEEQayIEJAAgBEEEaiACQQRqIgoQdAJAIAQtAARBAUYEQCAFIAQoAgg2AgQgBUGBgICAeDYCAAwBCyAELQAFRQRAIAVBgICAgHg2AgAMAQsgCigCACIKQQA2AgggCiAKKAIUQQFqNgIUIARBBGogCkEMaiAKEHwgBCgCCCEQAkAgBCgCBEECRwRAIAQoAgwiCkEATgRAIApFBEBBASEODAMLQQEhDyAKQQEQgQMiDg0CCyAPIAoQ3QIACyAFQYGAgIB4NgIAIAUgEDYCBAwBCyAKBEAgDiAQIAr8CgAACyAFIAo2AgggBSAONgIEIAUgCjYCAAsgBEEQaiQAAkAgAigCdCIFQYCAgIB4aw4CAQMACyACKQJ4IRIgAigCeCEKAkAgAigCBCIOENoBIgRFBEAgAkGAAWogDhAhIAItAIABQQZHDQEgAigChAEhBAsgBUUNBCAKIAVBARD3AgwECyAMIAIpA4ABNwIAIAxBEGogAkGQAWopAwA3AgAgDEEIaiACQYgBaikDADcCACACQThqIAJBpAFqKQIANwMAIAJBQGsgAkGsAWopAgA3AwAgAkHIAGogAkG0AWooAgA2AgAgAiACKQKcATcDMCACIAU2AkwgAiASPgJQIAIgEkIgiD4CVCACQegAaiALQRBqKQIANwMAIAJB4ABqIAtBCGopAgA3AwAgAiALKQIANwNYIAJBgAFqIAJBDGogAkHMAGogAkHYAGoQggECQAJAAkAgAi0AgAEOBwQEBAECAAQACyACAn8gAigChAEiBEUEQEEAIQRBAAwBCyACIAIoAogBIgU2ArgBIAIgBDYCtAEgAkEANgKwASACIAU2AqgBIAIgBDYCpAEgAkEANgKgAUEBIQQgAigCjAELNgK8ASACIAQ2AqwBIAIgBDYCnAEgAkGcAWoQNQwDCyACKAKEASIERQ0CIAIoAogBIARBARD3AgwCCyARENABIAIoAoQBIgRFDQEgAigCiAEgBEEYbEEIEPcCDAELCyACQacBaiACQRRqKAIANgAAIAZBBToAACACIAIpAgw3AJ8BIAYgAikAnAE3AAEgBkEIaiACQaMBaikAADcAAAwECyACKAJ4IQQLIAZBBjoAACAGIAQ2AgQgAigCDCIERQ0AIAIgAigCECIGNgK4ASACIAQ2ArQBIAJBADYCsAEgAiAGNgKoASACIAQ2AqQBIAJBADYCoAEgAigCFCEEQQEMAQtBACEEQQALIQYgAiAENgK8ASACIAY2AqwBIAIgBjYCnAEgAkGcAWoQNQsgAkHAAWokACABIAEtABhBAWo6ABggARDJASEEIANBgAFqIANB6ABqKQMANwMAIANB+ABqIANB4ABqKQMANwMAIAMgBDYCiAEgAyADKQNYIhI3A3BBBiECAkACQCASp0H/AXEiBkEGRwRAIAQNASADKQNoIRIgAygCZCENIAMoAmAhCSADKAJcIQQgAy8BWiEIIAMtAFkhByADLQBYIQIMBwsgAygCdCEHIAQNASAHIQQMBgsCQAJAAkACQCAGDgUJCQkBAgALIANB8ABqQQRyEPoBDAgLIAMoAnQiCUUNASADKAJ4IAlBARD3AgwHCyADQfAAakEEchDQASADKAJ0IglFDQAgAygCeCAJQRhsQQgQ9wILDAULIAQQ+AEgByEEDAQLIA1BMGtB/wFxQQpPBEAgA0EKNgJwIANBCGogAhCRAiADQfAAaiADKAIIIAMoAgwQoAIhBAwFCyADQfAAaiABQQEQhAEgAykDcCITQgNRBEAgACADKAJ4NgIEIABBBjoAAAwLC0ECIQEgAykDeCESQQAhBAJAAkACQCATp0EBaw4CAgEAC0ECIQRBAkEAIBJC////////////AINCgICAgICAgPj/AFQbIQEMAQsgEkI/iKchBAsgACASNwMQIABBADYCDCAAIAQ2AgggACABOgAADAoLIANBGDYCcCADQdAAaiACEJECIANB8ABqIAMoAlAgAygCVBCgAiEBIABBBjoAACAAIAE2AgQMCQsgAygCdCEEIANB2ABqENABQQYhAkEAIQdBASEJIAMoAlgiDQRAIAMoAlwgDUEYbEEIEPcCCwsgASABLQAYQQFqOgAYIAMgARCaASIINgKIASADIAQ2AnQgAyACOgBwIAMgEjcDeAJAAkACQCAJRQRAIBKnIQkgCA0BIBJCIIinIQ0MAwtBBiECIAgNAQwCCyADQfAAakEEciECAkAgB0UEQCACEPoBQQYhAgwBCyACENABQQYhAiAERQ0AIAkgBEEYbEEIEPcCCyAIIQQMAQsgCBD4AQsLIAJBBkYNACAAIBI3AxAgACANNgIMIAAgCTYCCCAAIAQ2AgQgACAIOwECIAAgBzoAASAAIAI6AAAMBgsgBCABEP8BIQEgAEEGOgAAIAAgATYCBAwFCyADQRg2AnAgA0HIAGogAhCRAiADQfAAaiADKAJIIAMoAkwQoAIhASAAQQY6AAAgACABNgIEDAQLIAEEQCAJIAQgAfwKAAALIAAgATYCDCAAIAk2AgggACABNgIEIABBAzoAAAwDCyABBEAgCSAEIAH8CgAACyAAIAE2AgwgACAJNgIIIAAgATYCBCAAQQM6AAAMAgsgAEEGOgAAIAAgBDYCBAwBCyAAIAMoAng2AgQgAEEGOgAACyADQbABaiQAC8sbAQ9/IwBBIGsiAyQAIAMgASgCDCACKAAcIgUgAigADCIMQQF2c0HVqtWqBXEiBCAFcyIFIAIoABgiBiACKAAIIgdBAXZzQdWq1aoFcSIIIAZzIgZBAnZzQbPmzJkDcSIJIAVzIgUgAigAFCIKIAIoAAQiC0EBdnNB1arVqgVxIg0gCnMiCiACKAAQIg4gAigAACICQQF2c0HVqtWqBXEiDyAOcyIOQQJ2c0Gz5syZA3EiECAKcyIKQQR2c0GPnrz4AHEiEUEEdHMgCnM2AgwgAyAMIARBAXRzIgwgByAIQQF0cyIEQQJ2c0Gz5syZA3EiB0ECdCAEcyIEIAEoAhBzIAQgCyANQQF0cyIIIAIgD0EBdHMiAkECdnNBs+bMmQNxIgpBAnQgAnMiAkEEdnNBj568+ABxIgRzNgIQIAMgASgCBCAJQQJ0IAZzIgYgEEECdCAOcyIJQQR2c0GPnrz4AHEiC0EEdHMgCXM2AgQgAyABKAIIIAcgDHMiDCAIIApzIgdBBHZzQY+evPgAcSIIQQR0cyAHczYCCCADIAEoAgAgBEEEdHMgAnM2AgAgAyAGIAEoAhRzIAtzNgIUIAMgDCABKAIYcyAIczYCGCAFIAEoAhxzIBFzIQJBgH0hDANAIAMgAjYCHCADEGAgAyADKAIYIgJBFndBv/78+QNxIAJBHndBwIGDhnxxciIGIAJzIgUgAygCHCICQRZ3Qb/+/PkDcSACQR53QcCBg4Z8cXIiBCACcyICQQx3QY+evPgAcSACQRR3QfDhw4d/cXJzIARzNgIcIAMgBiADKAIUIgRBFndBv/78+QNxIARBHndBwIGDhnxxciIHIARzIgQgBUEMd0GPnrz4AHEgBUEUd0Hw4cOHf3Fyc3M2AhggAyADKAIQIgVBFndBv/78+QNxIAVBHndBwIGDhnxxciIJIAVzIgUgBEEMd0GPnrz4AHEgBEEUd0Hw4cOHf3FycyAHczYCFCADIAMoAgQiBEEWd0G//vz5A3EgBEEed0HAgYOGfHFyIgogBHMiBCADKAIIIgZBFndBv/78+QNxIAZBHndBwIGDhnxxciIHIAZzIgZBDHdBj568+ABxIAZBFHdB8OHDh39xcnMgB3M2AgggAyADKAIAIgdBFndBv/78+QNxIAdBHndBwIGDhnxxciIIIAdzIgdBDHdBj568+ABxIAdBFHdB8OHDh39xciAIcyACczYCACADIAkgAygCDCIIQRZ3Qb/+/PkDcSAIQR53QcCBg4Z8cXIiCyAIcyIIIAVBDHdBj568+ABxIAVBFHdB8OHDh39xcnNzIAJzNgIQIAMgBiAIQQx3QY+evPgAcSAIQRR3QfDhw4d/cXJzIAtzIAJzNgIMIAMgByAEQQx3QY+evPgAcSAEQRR3QfDhw4d/cXJzIApzIAJzNgIEIAMgAygCACABIAxqIgJBoANqKAIAcyIFNgIAIAMgAygCBCACQaQDaigCAHMiBDYCBCADIAMoAgggAkGoA2ooAgBzIgY2AgggAyADKAIMIAJBrANqKAIAcyIHNgIMIAMgAygCECACQbADaigCAHMiCDYCECADIAMoAhQgAkG0A2ooAgBzIgk2AhQgAyADKAIYIAJBuANqKAIAcyIKNgIYIAMgAygCHCACQbwDaigCAHMiCzYCHCAMBEAgAxBgIAMgAygCHCIFQRR3QY+evPgAcSAFQRx3QfDhw4d/cXIiBiAFcyIFIAJBwANqKAIAIAMoAgAiBEEUd0GPnrz4AHEgBEEcd0Hw4cOHf3FyIgcgBHMiCEEQd3MgB3NzNgIAIAMgAygCBCIEQRR3QY+evPgAcSAEQRx3QfDhw4d/cXIiByAEcyIJIAJByANqKAIAIAMoAggiBEEUd0GPnrz4AHEgBEEcd0Hw4cOHf3FyIgogBHMiC0EQd3NzIApzNgIIIAMgAygCECIEQRR3QY+evPgAcSAEQRx3QfDhw4d/cXIiCiAEcyINIAJB1ANqKAIAIAMoAhQiBEEUd0GPnrz4AHEgBEEcd0Hw4cOHf3FyIg4gBHMiD0EQd3NzIA5zNgIUIAMgAkHEA2ooAgAgCUEQd3MgCHMgB3MgBXM2AgQgAyACQcwDaigCACADKAIMIgRBFHdBj568+ABxIARBHHdB8OHDh39xciIHIARzIgRBEHdzIAtzIAdzIAVzNgIMIAMgAkHQA2ooAgAgDUEQd3MgBHMgCnMgBXM2AhAgAyACQdgDaigCACADKAIYIgRBFHdBj568+ABxIARBHHdB8OHDh39xciIHIARzIgRBEHdzIA9zIAdzNgIYIAMgAkHcA2ooAgAgBUEQd3MgBHMgBnM2AhwgAxBgIAMgAygCGCIFQRJ3QYOGjBhxIAVBGndB/PnzZ3FyIgcgBXMiBCADKAIcIgVBEndBg4aMGHEgBUEad0H8+fNncXIiBiAFcyIFQQx3QY+evPgAcSAFQRR3QfDhw4d/cXJzIAZzNgIcIAMgByADKAIUIgZBEndBg4aMGHEgBkEad0H8+fNncXIiCCAGcyIGIARBDHdBj568+ABxIARBFHdB8OHDh39xcnNzNgIYIAMgAygCECIEQRJ3QYOGjBhxIARBGndB/PnzZ3FyIgogBHMiBCAGQQx3QY+evPgAcSAGQRR3QfDhw4d/cXJzIAhzNgIUIAMgAygCBCIGQRJ3QYOGjBhxIAZBGndB/PnzZ3FyIgsgBnMiBiADKAIIIgdBEndBg4aMGHEgB0Ead0H8+fNncXIiCCAHcyIHQQx3QY+evPgAcSAHQRR3QfDhw4d/cXJzIAhzNgIIIAMgAygCACIIQRJ3QYOGjBhxIAhBGndB/PnzZ3FyIgkgCHMiCEEMd0GPnrz4AHEgCEEUd0Hw4cOHf3FyIAlzIAVzNgIAIAMgCiADKAIMIglBEndBg4aMGHEgCUEad0H8+fNncXIiDSAJcyIJIARBDHdBj568+ABxIARBFHdB8OHDh39xcnNzIAVzNgIQIAMgByAJQQx3QY+evPgAcSAJQRR3QfDhw4d/cXJzIA1zIAVzNgIMIAMgCCAGQQx3QY+evPgAcSAGQRR3QfDhw4d/cXJzIAtzIAVzNgIEIAMgAygCACACQeADaigCAHM2AgAgAyADKAIEIAJB5ANqKAIAczYCBCADIAMoAgggAkHoA2ooAgBzNgIIIAMgAygCDCACQewDaigCAHM2AgwgAyADKAIQIAJB8ANqKAIAczYCECADIAMoAhQgAkH0A2ooAgBzNgIUIAMgAygCGCACQfgDaigCAHM2AhggAyADKAIcIAJB/ANqKAIAczYCHCADEGAgAyADKAIcIgVBGHciBCAFcyIFIAJBgARqKAIAIAMoAgAiBkEYdyIHIAZzIgZBEHdzIAdzczYCACADIAMoAgQiB0EYdyIIIAdzIgcgAkGIBGooAgAgAygCCCIJQRh3IgogCXMiCUEQd3NzIApzNgIIIAMgAkGEBGooAgAgB0EQd3MgBnMgCHMgBXM2AgQgAyACQYwEaigCACADKAIMIgZBGHciByAGcyIGQRB3cyAJcyAHcyAFczYCDCADIAYgAkGQBGooAgAgAygCECIHQRh3IgggB3MiB0EQd3NzIAhzIAVzNgIQIAMgBCADKAIYIgZBGHciCCAGcyIGIAVBEHdzcyIFNgIcIAMgByACQZQEaigCACADKAIUIgRBGHciCSAEcyIEQRB3c3MgCXM2AhQgAyACQZgEaigCACAGQRB3cyAEcyAIczYCGCACQZwEaigCACAFcyECIAxBgAFqIQwMAQUgAyALQQR2IAtzQYCegPgAcUERbCALczYCHCADIApBBHYgCnNBgJ6A+ABxQRFsIApzNgIYIAMgCUEEdiAJc0GAnoD4AHFBEWwgCXM2AhQgAyAIQQR2IAhzQYCegPgAcUERbCAIczYCECADIAdBBHYgB3NBgJ6A+ABxQRFsIAdzNgIMIAMgBkEEdiAGc0GAnoD4AHFBEWwgBnM2AgggAyAEQQR2IARzQYCegPgAcUERbCAEczYCBCADIAVBBHYgBXNBgJ6A+ABxQRFsIAVzNgIAIAMQYCAAIAMoAhwgASgC3ANzIgIgAygCGCABKALYA3MiBUEBdnNB1arVqgVxIgwgAnMiAiADKAIUIAEoAtQDcyIEIAMoAhAgASgC0ANzIgZBAXZzQdWq1aoFcSIHIARzIgRBAnZzQbPmzJkDcSIIIAJzIgIgAygCDCABKALMA3MiCSADKAIIIAEoAsgDcyIKQQF2c0HVqtWqBXEiCyAJcyIJIAMoAgQgASgCxANzIg0gAygCACABKALAA3MiAUEBdnNB1arVqgVxIg4gDXMiDUECdnNBs+bMmQNxIg8gCXMiCUEEdnNBj568+ABxIhAgAnM2ABwgACAIQQJ0IARzIgIgD0ECdCANcyIEQQR2c0GPnrz4AHEiCCACczYAGCAAIBBBBHQgCXM2ABQgACAMQQF0IAVzIgIgB0EBdCAGcyIFQQJ2c0Gz5syZA3EiDCACcyICIAtBAXQgCnMiBiAOQQF0IAFzIgFBAnZzQbPmzJkDcSIHIAZzIgZBBHZzQY+evPgAcSIJIAJzNgAMIAAgCEEEdCAEczYAECAAIAxBAnQgBXMiAiAHQQJ0IAFzIgFBBHZzQY+evPgAcSIFIAJzNgAIIAAgCUEEdCAGczYABCAAIAVBBHQgAXM2AAAgA0EgaiQACwsLzxwCDX8BfiMAQcCdAWsiBCQAIARBADoAgB0gBCADNgLEXCAEIARBgB1qIgY2AsBcIAQgBEHA3ABqIgUQNyAEQQM6AIAdIAQgAzYCxFwgBCAGNgLAXCAEQYAMaiAFEDcgBkEAQcgB/AsAIARB0B5qIQlBAEUEQCAJQQBBiQH8CwALIARBGDYCyB4gBCAEQYAdaiIFNgLAXCAJIANBICAEQcDcAGoiBhBUIARBBjoAwIwBIAQgBTYCwFwgCSAEQcCMAWoiDEEBIAYQVCAMIAVB0AH8CgAAIARBwIABaiIDIAlBiQH8CgAAIAYgDCADEKQBIARBkN4AakEAQYkB/AsAIAQgBjYCwIABIAxBAEGIAfwLACADIAwQ/gEgBEGAGGoiAyAMQYAB/AoAACAGQQBBgAT8CwADQCAEQcDcAGoiBiAHaiIJQQJqIAMtAAAiBUEEdjsBACAJIAVBD3E7AQAgCUEGaiADQQFqLQAAIgVBBHY7AQAgCUEEaiAFQQ9xOwEAIANBAmohAyAHQQhqIgdBgARHDQALIARBgB1qIgUgBkGABPwKAAAgBEGAGWogBSIDIARBgCFqEMgBIARBAToAwJgBIARBADYCgB0gBCABQYAMaiIINgLIXCAEIAM2AsRcIAQgBEHAmAFqIg42AsBcIARBwIwBaiIPIgMgBhCVASAEQcCAAWoiCiADQYAM/AoAACAFIgsgCkGADPwKAAAgBiIDIAtBgAz8CgAAIARBAToAgE0gBEEBNgKAUSAEIAg2AsiYASAEIARBgNEAaiIMNgLEmAEgBCAEQYDNAGoiCTYCwJgBIA8iBiAOIgUQlQEgCiAGQYAM/AoAACALIApBgAz8CgAAIARBwOgAaiINIAtBgAz8CgAAIARBAToAgE0gBEECNgKAUSAEIAg2AsiYASAEIAw2AsSYASAEIAk2AsCYASAGIAUQlQEgCiAGQYAM/AoAACALIApBgAz8CgAAIARBwPQAaiALQYAM/AoAACALIANBgCT8CgAAIAYgBCAEQYAMaiIMEIwBIAQgBEGAwQBqIgg2AsSAASAEIAY2AsiAASAEIAs2AsCAASADIAoQPiMAQZAcayIHJAACQCADIA1GDQAgB0GQGGoiCyADEGggB0GOEGoiDyIJIAtBgAT8CgAAIAdBjgxqIgYgCUGABPwKAAAgB0GOFGoiDiIFIAZBgAT8CgAAIAdBDGoiECAFQYAE/AoAACADQYAEaiIFIA1GDQAgCyAFEGggCSALQYAE/AoAACAGIgkgDyIGQYAE/AoAACAOIgUgCUGABPwKAAAgB0GMBGogBUGABPwKAAAgA0GACGoiBSANRg0AIAsgBRBoIAYgC0GABPwKAAAgCSIGIA9BgAT8CgAAIA4iBSAGQYAE/AoAACAHQYwIaiAFQYAE/AoAACAIIBBBgAz8CgAAAkAgA0GADGoiBSANRgRAIAdBkBxqJAAMAQsgB0EOaiAFEGggB0EANgIcIAdBATYCECAHQayAwAA2AgwgB0IENwIUIAdBDGpBqKTAABDEAgALIARCgICAgDA3AtCAASAEIARBgBhqNgLMgAEgBCAEQYDNAGo2AsSAASAEIAw2AsiAASAEIAg2AsCAASADIAoQciAKQQBBgAT8CwBBgHwhBwNAIARBwIABaiIDIAdqIgZBjgRqIAItAAAiBUEHdjsBACAGQYAEaiAFQQFxOwEAIAZBjARqIAVBBnZBAXE7AQAgBkGKBGogBUEFdkEBcTsBACAGQYgEaiAFQQR2QQFxOwEAIAZBhgRqIAVBA3ZBAXE7AQAgBkGEBGogBUECdkEBcTsBACAGQYIEaiAFQQF2QQFxOwEAIAJBAWohAiAHQRBqIgcNAAsgBEGAzQBqIANBgAT8CgAAQQAhAwNAIARBgM0AaiADaiIFIAUvAQBBgRpsQQFqQQF2OwEAIAVBAmoiAiACLwEAQYEabEEBakEBdjsBACAFQQRqIgIgAi8BAEGBGmxBAWpBAXY7AQAgBUEGaiICIAIvAQBBgRpsQQFqQQF2OwEAIANBCGoiA0GABEcNAAtBACIDRQRAIARBwJgBakEAQYAE/AsACyAEQcCEAWoiAiABIARBwIwBahCsASAEQcCAAWoiBkEAQYAE/AsAIARBwJgBaiIFIAYgAhDnASACIAFBgARqIARBwJABahCsASAGIAVBgAT8CgAAIAUgBiACEOcBIAIgAUGACGogBEHAlAFqEKwBIAYgBUGABPwKAAAgBSAGIAIQ5wEgBiAFQYAE/AoAACAEQYDRAGoiASAGEGggBiABIARBgBlqEOcBIAUgBiAEQYDNAGoQ5wEDQCAEQcDcAGogA2oiASABMwEAQoDo7dcTfkLdtp2BIHxCIoinQf8HcTsBACABQQJqIgEgATMBAEKA6O3XE35C3badgSB8QiKIp0H/B3E7AQAgA0EEaiIDQYAERw0AC0EAIQMDQCAEQcDcAGogA2oiAkGABGoiASABMwEAQoDo7dcTfkLdtp2BIHxCIoinQf8HcTsBACACQYIEaiIBIAEzAQBCgOjt1xN+Qt22nYEgfEIiiKdB/wdxOwEAIANBBGoiA0GABEcNAAtBACEDA0AgBEHA3ABqIgEgA2oiBUGACGoiAiACMwEAQoDo7dcTfkLdtp2BIHxCIoinQf8HcTsBACAFQYIIaiICIAIzAQBCgOjt1xN+Qt22nYEgfEIiiKdB/wdxOwEAIANBBGoiA0GABEcNAAsgBEGA1QBqQQAhByMAQZAUayIIJAAgBEHA6ABqIgkgAUYNACAIQQxqQQBBwAL8CwAgCEGQD2ohDCABIQIDQCAIQQxqIgUgB2oiAyACMwEAIAJBAmozAQBCCoaEIAJBBGozAQBCFIaEIAJBBmozAQBCHoaEIhE+AAAgA0EEaiARQiCIPAAAIAJBCGohAiAHQQVqIgdBwAJHDQALIAwgBUHAAvwKAAAgCEGPCmoiAiAMQcAC/AoAACAIQc8HaiIDIAJBwAL8CgAAIAhBzwxqIgIgA0HAAvwKAAAgBSACQcAC/AoAACABQYAEaiAJRg0AQQAhByAIQdARakEAQcAC/AsAIAFBhgRqIQIDQCAIQdARaiIFIAdqIgMgAkEGazMBACACQQRrMwEAQgqGhCACQQJrMwEAQhSGhCACMwEAQh6GhCIRPgAAIANBBGogEUIgiDwAACACQQhqIQIgB0EFaiIHQcACRw0ACyAMIAVBwAL8CgAAIAhBjwpqIgIgDEHAAvwKAAAgCEHPB2oiAyACQcAC/AoAACAIQc8MaiICIANBwAL8CgAAIAhBzAJqIAJBwAL8CgAAIAFBgAhqIAlGDQBBACEHIAVBAEHAAvwLACABQYYIaiECA0AgCEHQEWoiBSAHaiIDIAJBBmszAQAgAkEEazMBAEIKhoQgAkECazMBAEIUhoQgAjMBAEIehoQiET4AACADQQRqIBFCIIg8AAAgAkEIaiECIAdBBWoiB0HAAkcNAAsgDCAFQcAC/AoAACAIQY8KaiICIAxBwAL8CgAAIAhBzwdqIgMgAkHAAvwKAAAgCEHPDGoiAiADQcAC/AoAACAIQYwFaiACQcAC/AoAACAIQQxqQcAH/AoAAAJAIAkgAUGADGoiAUYEQCAIQZAUaiQADAELIAhBDWpBACEDIwBBwAJrIgUkACAFQQBBwAL8CwADQCADIAVqIgAgATMBACABQQJqMwEAQgqGhCABQQRqMwEAQhSGhCABQQZqMwEAQh6GhCIRPgAAIABBBGogEUIgiDwAACABQQhqIQEgA0EFaiIDQcACRw0ACyAFQcAC/AoAACAFQcACaiQAIAhBADYCHCAIQQE2AhAgCEGsgMAANgIMIAhCBDcCFCAIQQxqQaikwAAQxAIAC0EAIQMDQCAEQcCYAWogA2oiASABMwEAQtDbryd+Qt22nYEgfEIiiKdBD3E7AQAgAUECaiIBIAEzAQBC0NuvJ35C3badgSB8QiKIp0EPcTsBACADQQRqIgNBgARHDQALQQAhAiAEQcCcAWoiA0EAQYAB/AsAA0AgAyAEQcCYAWogAmoiAUECai0AAEEEdCABLQAAcjoAACADQQFqIAFBBGotAAAgAUEGai0AAEEEdHI6AAAgA0ECaiEDIAJBCGoiAkGABEcNAAsgBEHMgAFqIARBgNUAakHAB/wKAAAgBEGYiAFqIARBwJwBakGAAfwKAAAgBEGAATYClIgBIARCATcCjIgBIARBwAc2AsiAASAEQgE3AsCAASAAIwBBwAhrIgokACAEQcCAAWoiAUEMaiEJIAEoAtQHIQggASgCCCENIAEoAtAHIQsgASgCBCEHIAEoAgAhAAJAIAEoAswHIgxBAXEEQCABQdgHaiEFQQAhAyAAIQEDQAJ/AkAgAUEBcUUEQCAAIQEMAQtBACEBIAcgDUYNACAHIAlqIQYgB0EBaiEHQQEMAQsgCCALRg0EIAUgC2ohBiALQQFqIQsgASEAQQALIQEgAyAKaiAGLQAAOgAAIANBAWoiA0HACEcNAAsMAQsgAEEBcUUgByANRnINASAKIAcgCWotAAA6AAAgASAHaiEJIAcgDWsiAEEBaiEGIABBAmohBUEAIQMDQCADIAZqRQ0CIAMgCmoiAUEBaiADIAlqIgBBDWotAAA6AAAgA0G+CEcEQCADIAVqRQ0DIAFBAmogAEEOai0AADoAACADQQJqIQMMAQsLIAMgB2pBAmohB0EBIQALIApBwAj8CgAAIABBAXEgByANR3FFIAxBAXFFIAggC0ZycUUEQCAKQQA2AhAgCkEBNgIEIApBrIDAADYCACAKQgQ3AgggCkGopMAAEMQCAAsgCkHACGokACAEQcCdAWokAA8LQcikwABBL0GIpcAAEIsCAAumDwIofwh+IwBB8AJrIgIkACACQaACaiIDIAEQXSACIAIpA+gCIAIpA+ACIAIpA9gCIAIpA9ACIAIpA8gCIAIpA8ACIipCGoh8IixCGYh8IitCGoh8Ii9CGYh8IjBCGoh8Ii1CGYhCE34gAikDoAIiLkL///8fg3wiMadB////H3EiBDYCCCACIAIpA6gCIC5CGoh8Ii5C////D4MgMUIaiHynIgg2AgwgAiAsQv///w+DICpC////H4MgAikDuAIgAikDsAIgLkIZiHwiKkIaiHwiLEIZiHwiLkIaiHynIgk2AhwgAiAup0H///8fcSIFNgIYIAIgLKdB////D3EiCjYCFCACIC+nQf///w9xIgs2AiQgAiAtp0H///8PcSIMNgIsIAIgKqdB////H3EiDTYCECACICunQf///x9xIgY2AiAgAiAwp0H///8fcSIHNgIoIAMgAUEoahBdIAIgAikD6AIgAikD4AIgAikD2AIgAikD0AIgAikDyAIgAikDwAIiKkIaiHwiLEIZiHwiK0IaiHwiL0IZiHwiMEIaiHwiLUIZiEITfiACKQOgAiIuQv///x+DfCIxp0H///8fcSIONgIwIAIgAikDqAIgLkIaiHwiLkL///8PgyAxQhqIfKciDzYCNCACICxC////D4MgKkL///8fgyACKQO4AiACKQOwAiAuQhmIfCIqQhqIfCIsQhmIfCIuQhqIfKciEDYCRCACIC6nQf///x9xIhE2AkAgAiAsp0H///8PcSISNgI8IAIgL6dB////D3EiEzYCTCACIC2nQf///w9xIhQ2AlQgAiAqp0H///8fcSIVNgI4IAIgK6dB////H3EiFjYCSCACIDCnQf///x9xIhc2AlAgAyABQdAAahBdIAIgAikD0AJCAYYgAikDyAJCAYYgAikDwAJCAYYiKkIaiHwiLEIZiHwiK6dB////H3E2AnAgAiACKQOwAkIBhiACKQOoAkIBhiACKQOgAkIBhiIvQhqIfCIwQhmIfCItp0H///8fcTYCYCACIAIpA9gCQgGGICtCGoh8IiunQf///w9xNgJ0IAIgAikDuAJCAYYgLUIaiHwiLadB////D3E2AmQgAiACKQPgAkIBhiArQhmIfCIrp0H///8fcTYCeCACICxC////D4MgKkL+//8fgyAtQhmIfCIqQhqIfD4CbCACICqnQf///x9xNgJoIAIgAikD6AJCAYYgK0IaiHwiKqdB////D3E2AnwgAiAwQv///w+DICpCGYhCE34gL0L+//8fg3wiKkIaiHw+AlwgAiAqp0H///8fcTYCWCABKAIoIRggASgCACEZIAEoAiwhGiABKAIEIRsgASgCMCEcIAEoAgghHSABKAI0IR4gASgCDCEfIAEoAjghICABKAIQISEgASgCPCEiIAEoAhQhIyABKAJAISQgASgCGCElIAEoAkQhJiABKAIcIScgASgCSCEoIAEoAiAhKSACIAEoAkwgASgCJGo2AqQBIAIgKCApajYCoAEgAiAmICdqNgKcASACICQgJWo2ApgBIAIgIiAjajYClAEgAiAgICFqNgKQASACIB4gH2o2AowBIAIgHCAdajYCiAEgAiAaIBtqNgKEASACIBggGWo2AoABIAMgAkGAAWoQXSACIAIpA9ACIAIpA8gCIAIpA8ACIipCGoh8IixCGYh8IiunQf///x9xNgLAASACIAIpA7ACIAIpA6gCIAIpA6ACIi9CGoh8IjBCGYh8Ii2nQf///x9xNgKwASACIAIpA9gCICtCGoh8IiunQf///w9xNgLEASACIAIpA7gCIC1CGoh8Ii2nQf///w9xNgK0ASACIAIpA+ACICtCGYh8IiunQf///x9xNgLIASACICxC////D4MgKkL///8fgyAtQhmIfCIqQhqIfD4CvAEgAiAqp0H///8fcTYCuAEgAiACKQPoAiArQhqIfCIqp0H///8PcTYCzAEgAiAwQv///w+DICpCGYhCE34gL0L///8fg3wiKkIaiHw+AqwBIAIgKqdB////H3E2AqgBIAJB8AFqIgEgByAXajYCACACQegBaiIHIAYgFmo2AgAgAkHgAWoiBiAFIBFqNgIAIAJB2AFqIgUgDSAVajYCACACIAwgFGo2AvQBIAIgCyATajYC7AEgAiAJIBBqNgLkASACIAogEmo2AtwBIAIgCCAPajYC1AEgAiAEIA5qNgLQASACQfgBaiIEIAJBMGogAkEIahCLASAAIAJBqAFqIAJB0AFqEIsBIAMgAkHYAGogBBCLASAAQcgAaiABKQIANwIAIABBQGsgBykCADcCACAAQThqIAYpAgA3AgAgAEEwaiAFKQIANwIAIAAgAikC0AE3AiggACACKQL4ATcCUCAAQdgAaiACQYACaikCADcCACAAQeAAaiACQYgCaikCADcCACAAQegAaiACQZACaikCADcCACAAQfAAaiACQZgCaikCADcCACAAQZgBaiACQcACaikCADcCACAAQZABaiACQbgCaikCADcCACAAQYgBaiACQbACaikCADcCACAAQYABaiACQagCaikCADcCACAAIAIpAqACNwJ4IAJB8AJqJAALsxUBC38jAEGAAWsiAiQAAkAgABDaASIBDQAgAEEANgIIAkAgACgCFCIBIAAoAhAiBE8NACAAQQxqIQcgACgCDCEGA0BBACAEayEIIAFBBWohAQJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAA0AC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BCAAIAQ2AgALIAJBMGokAAvYDQJHfwF+IwBBQGoiAiQAIAEoAgwiBUEBcSABKAIIISEgASgCBCEJIAEoAgAhAyAAKAIAIQogBUECTwRAIAVBAXYhCwNAIAMgAygCECIGQQJqNgIQIAMoAgAhACADKAIEIQEgAiADKAIIIgc2AgggAiABNgIEIAIgADYCACADKAIMIQggAiAHNgIYIAIgATYCFCACIAA2AhAgAiAGIAhqIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgIMIAIgAEEBaiIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYCHCACQSBqIAogAhAiIAItACAhBiACLQAhIQcgAi0AIiEIIAItACMhDSACLQAkIQ4gAi0AJSEPIAItACYhECACLQAnIREgAi0AKCESIAItACkhEyACLQAqIRQgAi0AKyEVIAItACwhFiACLQAtIRcgAi0ALiEYIAItAC8hGSACLQAwIRogAi0AMSEbIAItADIhHCACLQAzIR0gAi0ANCEeIAItADUhHyACLQA2ISAgAi0ANyEiIAItADghIyACLQA5ISQgAi0AOiElIAItADshJiACLQA8IScgAi0APSEoIAItAD4hKSAEIAlqIgAtAAAhKiAAQQFqLQAAISsgAEECai0AACEsIABBA2otAAAhLSAAQQRqLQAAIS4gAEEFai0AACEvIABBBmotAAAhMCAAQQdqLQAAITEgAEEIai0AACEyIABBCWotAAAhMyAAQQpqLQAAITQgAEELai0AACE1IABBDGotAAAhNiAAQQ1qLQAAITcgAEEOai0AACE4IABBD2otAAAhOSAAQRBqLQAAITogAEERai0AACE7IABBEmotAAAhPCAAQRNqLQAAIT0gAEEUai0AACE+IABBFWotAAAhPyAAQRZqLQAAIUAgAEEXai0AACFBIABBGGotAAAhQiAAQRlqLQAAIUMgAEEaai0AACFEIABBG2otAAAhRSAAQRxqLQAAIUYgAEEdai0AACFHIABBHmotAAAhSCAEICFqIgFBH2ogAEEfai0AACACLQA/czoAACABQR5qICkgSHM6AAAgAUEdaiAoIEdzOgAAIAFBHGogJyBGczoAACABQRtqICYgRXM6AAAgAUEaaiAlIERzOgAAIAFBGWogJCBDczoAACABQRhqICMgQnM6AAAgAUEXaiAiIEFzOgAAIAFBFmogICBAczoAACABQRVqIB8gP3M6AAAgAUEUaiAeID5zOgAAIAFBE2ogHSA9czoAACABQRJqIBwgPHM6AAAgAUERaiAbIDtzOgAAIAFBEGogGiA6czoAACABQQ9qIBkgOXM6AAAgAUEOaiAYIDhzOgAAIAFBDWogFyA3czoAACABQQxqIBYgNnM6AAAgAUELaiAVIDVzOgAAIAFBCmogFCA0czoAACABQQlqIBMgM3M6AAAgAUEIaiASIDJzOgAAIAFBB2ogESAxczoAACABQQZqIBAgMHM6AAAgAUEFaiAPIC9zOgAAIAFBBGogDiAuczoAACABQQNqIA0gLXM6AAAgAUECaiAIICxzOgAAIAFBAWogByArczoAACABIAYgKnM6AAAgBEEgaiEEIAtBAWsiCw0ACwsEQCADIAMoAhAiAEEBajYCECADKAIMIQEgAykCACFJIAMoAgghAyACQRhqQgA3AgAgAkIANwIQIAIgAzYCCCACIEk3AgAgAiAAIAFqIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgIMIAJBIGogCiACECIgAi0AICEDIAItACEhBCACLQAiIQogAi0AIyELIAItACQhDCACLQAlIQYgAi0AJiEHIAItACchCCACLQAoIQ0gAi0AKSEOIAItACohDyACLQArIRAgAi0ALCERIAItAC0hEiACLQAuIRMgCSAFQf7///8AcUEEdCIBaiIALQAAIQUgAC0AASEJIAAtAAIhFCAALQADIRUgAC0ABCEWIAAtAAUhFyAALQAGIRggAC0AByEZIAAtAAghGiAALQAJIRsgAC0ACiEcIAAtAAshHSAALQAMIR4gAC0ADSEfIAAtAA4hICABICFqIgEgAC0ADyACLQAvczoADyABIBMgIHM6AA4gASASIB9zOgANIAEgESAeczoADCABIBAgHXM6AAsgASAPIBxzOgAKIAEgDiAbczoACSABIA0gGnM6AAggASAIIBlzOgAHIAEgByAYczoABiABIAYgF3M6AAUgASAMIBZzOgAEIAEgCyAVczoAAyABIAogFHM6AAIgASAEIAlzOgABIAEgAyAFczoAAAsgAkFAayQAC8oNAgt/An4jAEHgAGsiByQAIAdBGGogAUH4A2opAgA3AwAgB0EQaiABQfADaikCADcDACAHQQhqIAFB6ANqKQIANwMAIAcgASkC4AM3AwAgBEFwcSELIARBEE8EQCALIQogAyEBA0AgB0HYAGoiCCABQQhqKQAANwMAIAcgASkAACISNwNQIAcgBy0AXzoAUCAHIBI8AF8gBy0AUSEJIAcgBy0AXjoAUSAHIAk6AF4gBy0AUiEJIAcgBy0AXToAUiAHIAk6AF0gBy0AXCEJIAcgBy0AUzoAXCAHIAk6AFMgBy0AWyEJIAcgBy0AVDoAWyAHIAk6AFQgBy0AWiEJIAcgBy0AVToAWiAHIAk6AFUgBy0AWSEJIAcgBy0AVjoAWSAHIAk6AFYgCC0AACEJIAggBy0AVzoAACAHIAk6AFcgAUEQaiEBIAcgB0HQAGoQ8gEgCkEQayIKDQALCyAEQQ9xIgEEQEEQIAFrIgoEQCAHQUBrIAFqQQAgCvwLAAsgAQRAIAdBQGsgAyALaiAB/AoAAAsgB0HYAGoiASAHQcgAaikAADcDACAHIAcpAEAiEjcDUCAHIActAF86AFAgByASPABfIActAFEhAyAHIActAF46AFEgByADOgBeIActAFIhAyAHIActAF06AFIgByADOgBdIActAFwhAyAHIActAFM6AFwgByADOgBTIActAFshAyAHIActAFQ6AFsgByADOgBUIActAFohAyAHIActAFU6AFogByADOgBVIActAFkhAyAHIActAFY6AFkgByADOgBWIAEtAAAhAyABIActAFc6AAAgByADOgBXIAcgB0HQAGoQ8gELIAZBcHEhAyAGQRBPBEAgAyEKIAUhAQNAIAdB2ABqIgsgAUEIaikAADcDACAHIAEpAAAiEjcDUCAHIActAF86AFAgByASPABfIActAFEhCCAHIActAF46AFEgByAIOgBeIActAFIhCCAHIActAF06AFIgByAIOgBdIActAFwhCCAHIActAFM6AFwgByAIOgBTIActAFshCCAHIActAFQ6AFsgByAIOgBUIActAFohCCAHIActAFU6AFogByAIOgBVIActAFkhCCAHIActAFY6AFkgByAIOgBWIAstAAAhCCALIActAFc6AAAgByAIOgBXIAFBEGohASAHIAdB0ABqEPIBIApBEGsiCg0ACwsgBkEPcSIBBEBBECABayIKBEAgB0FAayABakEA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IBR+fCARIBZ+fCAbIB5+IBogHH58IBkgIH58IB0gH358Ig99IApCzQJ+fCAEQsX6zu8BfnwgBkKW65zvAX58IAdC0rHMBH58IAdC7afX5wF+IAh8Qh2IfCIIQpv80ZIBfkL/////AYMiCULSscwEfnwgCULtp9fnAX4gCHxCHYh8IginQf////8BcTYCDCAnIAwgF34gJH0gAyAVfnwgC0IUhnwgEiAUfnwgEyAWfnwgHCAdfiAZIBt+fCILfSAGQs0CfnwgB0LF+s7vAX58IAlCluuc7wF+fCAIQh2IfCIIp0H/////AXE2AhAgJyAMIBN+IAMgEn58IA4gGSAdfiIQfH0gFCAWfnwgBUIUhnwgB0LNAn58IAlCxfrO7wF+fCAIQh2IfCIFp0H/////AXE2AhQgJyADIBZ+IAwgFH58IA19IApCFIZ8IAlCzQJ+fCAFQh2IfCIDp0H/////AXE2AhggJyAEQhSGIA98IANCHYh8IgOnQf////8BcTYCHCAnIAZCFIYgI3wgA0IdiHwiA6dB/////wFxNgIgICcgB0IUhiALfCADQh2IfCIDp0H/////AXE2AiQgJyAJQhSGIBB8IANCHYh8IgNCHYg+AiwgJyADp0H/////AXE2AiggACAnQQxqQZjZwQAQeSAnQTBqJAAL4REDCn8CfgF8IwBBEGsiCCQAAkACQAJAAkACQAJAAkACQCAALQAAQQFrDgUBAgMEBQALIAEoAgAiACgCACAAKAIIIgJrQQNNBEAgACACQQQQ3wEgACgCCCECCyAAIAJBBGo2AgggACgCBCACakHu6rHjBjYAAAwFCyABKAIAIQEgAC0AAUUEQCABKAIAIAEoAggiAGtBBE0EQCABIABBBRDfASABKAIIIQALIAEgAEEFajYCCCABKAIEIABqIgBBtLvAACgAADYAACAAQQRqQbi7wAAtAAA6AAAMBgsgASgCACABKAIIIgBrQQNNBEAgASAAQQQQ3wEgASgCCCEACyABIABBBGo2AgggASgCBCAAakH05NWrBjYAAAwECyMAQTBrIgIkACABKAIAIQECQAJAAkACQAJAAkAgAEEIaiIAKAIAQQFrDgIBAgALQRQgACkDCCACQQhqEH0iBWsiAyABKAIAIAEoAggiAGtLBEAgASAAIAMQ3wEgASgCCCEACyADBEAgASgCBCAAaiACQQhqIAVqIAP8CgAACyABIAAgA2o2AggMAgsgACkDCCIMIAxCP4ciDYUgDX0gAkEIaiIDEH0hACAMQgBTBEAgAEEBayIAQRNLDQMgACADakEtOgAAC0EUIABrIgMgASgCACABKAIIIgVrSwRAIAEgBSADEN8BIAEoAgghBQsgAwRAIAEoAgQgBWogAkEIaiAAaiAD/AoAAAsgASADIAVqNgIIDAELIAArAwgiDr1C////////////AINCgICAgICAgPj/AFoEQCABKAIAIAEoAggiAGtBA00EQCABIABBBBDfASABKAIIIQALIAEgAEEEajYCCCABKAIEIABqQe7qseMGNgAADAELIA4gAkEIaiIAECcgAGsiAyABKAIAIAEoAggiAGtLBEAgASAAIAMQ3wEgASgCCCEACyADBEAgASgCBCAAaiACQQhqIAP8CgAACyABIAAgA2o2AggLIAJBMGokAAwBCyAAQRRBvLvAABCGAgALDAMLIAggASAAKAIIIAAoAgwQeCAILQAAQQRGDQMgCCAIKQMANwMIIAhBCGoQswIhAgwDCyAAQQRqIgAoAgghBCAAKAIEIQcgASgCACIAKAIAIAAoAggiBUYEQCAAIAVBARDfASAAKAIIIQULIAAgBUEBaiICNgIIIAAoAgQgBWpB2wA6AAACQCAEBEAgByABECwiAw0BIARBGGxBGGshBSAHQRhqIQIDQCAFBEAgACgCCCIDIAAoAgBGBEAgACADQQEQ3wEgACgCCCEDCyAAIANBAWo2AgggACgCBCADakEsOgAAIAVBGGshBSACIAEQLCEDIAJBGGohAiADRQ0BDAMLCyAAKAIIIQILIAIgACgCAEYEQCAAIAJBARDfASAAKAIIIQILIAAgAkEBajYCCCAAKAIEIAJqQd0AOgAAQQAhAwsgAyECDAILIAAoAgwhCiABKAIAIgYoAgAgBigCCCICRgRAIAYgAkEBEN8BIAYoAgghAgsgBiACQQFqIgQ2AgggBigCBCACakH7ADoAACAKRQRAIAQgBigCAEYEQCAGIARBARDfASAGKAIIIQQLIAYgBEEBajYCCCAGKAIEIARqQf0AOgAADAELAkACQCAAKAIEIgIEQAJAIAAoAggiA0UNAAJAIANBB3EiBEUEQCADIQAMAQsgAyEAA0AgAEEBayEAIAIoApgDIQIgBEEBayIEDQALCyADQQhJDQADQCACKAKYAygCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMhAiAAQQhrIgANAAsLAkAgAi8BkgMEQEEBIQkgAiEADAELQQAhBEEBIQUDQCAFIQMgAigCiAIiAEUNAyADQQFqIQUgBEEBaiEEIAIvAZADIQcgACECIAcgAC8BkgNPDQALIAdBAWohCSAERQ0AIARBAWsgACAJQQJ0akGYA2ohAiAEQQdxBEAgA0EHcSEJQQAhBQNAIAIoAgAiA0GYA2ohAiAJIAVBAWoiBUcNAAsgBCAFayEEC0EAIQlBB0kEQCAAIQIgAyEADAELA0AgAigCACgCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMiA0GYA2ohAiAEQQhrIgQNAAsgACECIAMhAAsgCCABIAIgB0EMbGoiA0GQAmooAgAgA0GUAmooAgAQeCAILQAAQQRHDQIgAiAHQRhsaiAGKAIIIgIgBigCAEYEQCAGIAJBARDfASAGKAIIIQILIAYgAkEBajYCCCAGKAIEIAJqQTo6AAAgARAsIgINBCAKQQFrIgoEQANAAkAgAC8BkgMgCU0EQEEAIQdBASEFA0AgBSEDIAAoAogCIgJFDQYgA0EBaiEFIAdBAWohByAALwGQAyEEIAQgAiIALwGSA08NAAsgBEEBaiEJIAdFDQEgACAJQQJ0akGYA2ohBSAHQQdxBH8gA0EHcSEJQQAhAwNAIAUoAgAiAEGYA2ohBSAJIANBAWoiA0cNAAsgByADawUgBwshA0EAIQkgB0EBa0EHSQ0BA0AgBSgCACgCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMiAEGYA2ohBSADQQhrIgMNAAsMAQsgACECIAkiBEEBaiEJCyACIARBDGxqIgNBlAJqKAIAIQUgA0GQAmooAgAhAyAGKAIIIgcgBigCAEYEQCAGIAdBARDfASAGKAIIIQcLIAYgB0EBajYCCCAGKAIEIAdqQSw6AAAgCCABIAMgBRB4IAgtAABBBEcNBCACIARBGGxqIAYoAggiAiAGKAIARgRAIAYgAkEBEN8BIAYoAgghAgsgBiACQQFqNgIIIAYoAgQgAmpBOjoAACABECwiAg0GIApBAWsiCg0ACwsgBigCCCEECyAEIAYoAgBGBEAgBiAEQQEQ3wEgBigCCCEECyAGIARBAWo2AgggBigCBCAEakH9ADoAAAwCC0HMu8AAEPkCAAsgCCAIKQMANwMIIAhBCGoQswIhAgwBC0EAIQILIAhBEGokACACC4cMAgZ/Bn4jAEGgBmsiAiQAIAJB0AVqIgUgARBdIAIgAikDgAYgAikD+AUgAikD8AUiCEIaiHwiC0IZiHwiCadB////H3E2AhggAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCCCACIAIpA4gGIAlCGoh8IgmnQf///w9xNgIcIAIgAikD6AUgCkIaiHwiCqdB////D3E2AgwgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCICACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CFCACIAinQf///x9xNgIQIAIgAikDmAYgCUIaiHwiCKdB////D3E2AiQgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AgQgAiAIp0H///8fcTYCACAFIAIQXSACIAIpA4AGIAIpA/gFIAIpA/AFIghCGoh8IgtCGYh8IgmnQf///x9xNgLABSACIAIpA+AFIAIpA9gFIAIpA9AFIgxCGoh8Ig1CGYh8IgqnQf///x9xNgKwBSACIAIpA4gGIAlCGoh8IgmnQf///w9xNgLEBSACIAIpA+gFIApCGoh8IgqnQf///w9xNgK0BSACIAIpA5AGIAlCGYh8IgmnQf///x9xNgLIBSACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CvAUgAiAIp0H///8fcTYCuAUgAiACKQOYBiAJQhqIfCIIp0H///8PcTYCzAUgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AqwFIAIgCKdB////H3E2AqgFIAUgAkGoBWoiBhBdIAIgAikDgAYgAikD+AUgAikD8AUiCEIaiHwiC0IZiHwiCadB////H3E2AkAgAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCMCACIAIpA4gGIAlCGoh8IgmnQf///w9xNgJEIAIgAikD6AUgCkIaiHwiCqdB////D3E2AjQgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCSCACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CPCACIAinQf///x9xNgI4IAIgAikDmAYgCUIaiHwiCKdB////D3E2AkwgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AiwgAiAIp0H///8fcTYCKCACQdAAaiIEIAEgAkEoahAyIAJB+ABqIgEgAiAEEDIgBSABEF0gAiACKQOABiACKQP4BSACKQPwBSIIQhqIfCILQhmIfCIJp0H///8fcTYCuAEgAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCqAEgAiACKQOIBiAJQhqIfCIJp0H///8PcTYCvAEgAiACKQPoBSAKQhqIfCIKp0H///8PcTYCrAEgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCwAEgAiALQv///w+DIAhC////H4MgCkIZiHwiCEIaiHw+ArQBIAIgCKdB////H3E2ArABIAIgAikDmAYgCUIaiHwiCKdB////D3E2AsQBIAIgDUL///8PgyAIQhmIQhN+IAxC////H4N8IghCGoh8PgKkASACIAinQf///x9xNgKgASACQcgBaiIDIAQgAkGgAWoQMiACQfABaiIEIANBBRBZIAJBmAJqIgEgBCADEDIgAkHAAmoiAyABQQoQWSACQegCaiIEIAMgARAyIAJBkANqIgMgBEEUEFkgAkG4A2oiByADIAQQMiACQeADaiIDIAdBChBZIAJBiARqIgQgAyABEDIgAkGwBGoiAyAEQTIQWSACQdgEaiIBIAMgBBAyIAJBgAVqIgMgAUHkABBZIAYgAyABEDIgBSAGQTIQWSAAIAUgBBAyIABByABqIAJBmAFqKQIANwIAIABBQGsgAkGQAWopAgA3AgAgAEE4aiACQYgBaikCADcCACAAQTBqIAJBgAFqKQIANwIAIAAgAikCeDcCKCACQaAGaiQAC9YMAgV/G34jAEHwAGsiAiQAIAJBBGogARCGASACIAI1AhQiB0Ls87eKA34gAigCCCIBrSIIQufi5LMBfiACKAIEIgOtIglC7sr1/wF+fCACKAIMIgStIg1CjJPw+wB+fCACKAIQIgWtIg5Cg+aF0wF+fCAHQu3zt4oBfnwiCn0gAyACKAIYIgNqrSIQQu7K9f8BfnwgASACKAIcIgFqrSIRQubipLQBfnwgBCACKAIg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AhBJIAYgAUGgDPwKAAAgA0GIFmoiB0IANwMAIANBgBZqIglCADcDACADQfgVaiIKQgA3AwAgA0IANwPwFSADQQxqIAFBIBDTASADQagiaiAHKQMANwMAIANBoCJqIAkpAwA3AwAgA0GYImogCikDADcDACADIAMpA/AVNwOQIiACQQBByAH8CwAgA0HgLGoiBEEAQckA/AsAIANBGDYC2CwgAyACNgLwFSAEIANBkCJqIg9BICABEIABIAMgAjYC8BUgBCAFQSAgARCAASABIAJBoAL8CgAAIANB6DVqIgJCADcDACADQeA1aiIEQgA3AwAgA0HYNWoiBUIANwMAIANB0DVqIgtCADcDACADQcg1aiIIQgA3AwAgA0HANWoiDEIANwMAIANBuDVqIg1CADcDACADQgA3A7A1IAEgA0HAF2ogA0GwNWoQogEgA0GoNWoiDiACKQMANwMAIANBoDVqIgIgBCkDADcDACADQZg1aiIEIAUpAwA3AwAgA0GQNWoiBSALKQMANwMAIANBiDVqIAgpAwAiEDcDACADQYA1aiAMKQMAIhE3AwAgA0H4NGogDSkDACISNwMAIANBuDRqIgsgEjcDACADQcA0aiIIIBE3AwAgA0HINGoiDCAQNwMAIAMgAykDsDUiEDcD8DQgAyAQNwOwNCADQeg0aiINIA4pAwA3AwAgA0HgNGoiDiACKQMANwMAIANB2DRqIgIgBCkDADcDACADIAUpAwA3A9A0IANBqCtqIgQgDCkDADcDACADQaAraiIFIAgpAwA3AwAgA0GYK2oiCCALKQMANwMAIAMgAykDsDQ3A5ArIAcgDSkDADcDACAJIA4pAwA3AwAgCiACKQMANwMAIAMgAykD0DQ3A/AVIANBsCJqIgcgBiAPIAEQIyADQYgraiAEKQMANwAAIANBgCtqIAUpAwA3AAAgA0H4KmogCCkDADcAACADIAMpA5ArNwDwKkHgCEEBEIEDIgFFDQMgASADQfAqaiICKQAANwAAIAFBGGogAkEYaikAADcAACABQRBqIAJBEGopAAA3AAAgAUEIaiACQQhqKQAANwAAIAMoAgwhAiABQSBqIAdBwAj8CgAAIABB4Ag2AgggACABNgIEIABB4Ag2AgAgAiACKAIAQQFrIgA2AgAgAEUNAQwCC0HtqsAAQRkQ4wIhASAAQYCAgIB4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aiIEKAIAIgdBBU8NAiAEQYPA/wNBAiAHQQJLGyAHazYCACAEQQRqIgcoAgAiBEEESw0CIAdBg8D/A0ECIARBAksbIARrNgIAIAFBCGoiAUGACEcNAAtBACIBRQRAIAggA0GACPwKAAALIAFFBEAgAkGMKGogCEGACPwKAAALIAFFBEAgAkGMIGogAkGMKGpBgAj8CgAACyABRQRAIAJBjDBqIAJBjCBqQYAI/AoAAAsgAUUEQCACQYwYaiACQYwwakGACPwKAAALIAAgAkEMakGAIPwKAAAgAkGQyABqJAAPC0HIpMAAQS9B+KTAABCLAgALQazBwABBIkHQwcAAEKUCAAusCAIDfwN+IwBB4AJrIgMkACADQThqQgA3AwAgA0EwakIANwMAIANBKGpCADcDACADQSBqQgA3AwAgA0EYakIANwMAIANBEGpCADcDACADQQhqQgA3AwAgA0IANwMAAkAgAkHBAE8EQCADQegAaiIFQQBBwQD8CwAgA0HYAGpB6MDAACkDADcDACADQdAAakHgwMAAKQMANwMAIANByABqQdjAwAApAwA3AwAgAyACQQZ2IgStNwNgIANB0MDAACkDADcDQCADQUBrIAEgBBAcIAJBP3EiBARAIAUgASACQUBxaiAE/AoAAAsgAyAEOgCoASADQbABaiADQUBrQfAA/AoAACADQdgBaiICIAMtAJgCIgFqIgVBgAE6AAAgAa0iB0I7hiADKQPQASIGQgmGIgggB0IDhoQiB0KA/gODQiiGhCAHQoCA/AeDQhiGIAdCgICA+A+DQgiGhIQgBkIBhkKAgID4D4MgBkIPiEKAgPwHg4QgBkIfiEKA/gODIAhCOIiEhIQhBgJAAkAgAUE/RwRAIAFBP3MiBARAIAVBAWpBACAE/AsACyABQThzQQdLDQELIANBsAFqIgEgAkEBEBwgA0HQAmpCADcDACADQcgCakIANwMAIANBwAJqQgA3AwAgA0G4AmpCADcDACADQbACakIANwMAIANBqAJqQgA3AwAgA0IANwOgAiADIAY3A9gCIAEgA0GgAmpBARAcDAELIAMgBjcDkAIgA0GwAWogAkEBEBwLIAMgAygCzAEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AhwgAyADKALIASIBQRh0IAFBgP4DcUEIdHIgAUEI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kAIgAyADKALsAUEBdCINNgKUAiAAIAUgBhCLASADKALEASEFIAMoAnghBiADKAJQIQ4gAygCfCEPIAMoAlQhECADKAKAASERIAMoAlghEiADKAKEASETIAMoAlwhFCADKAKIASEVIAMoAmAhFyADKAKMASEYIAMoAmQhGSADKAKQASEaIAMoAmghGyADKAKUASEcIAMoAmwhHSADKAKYASEeIAMoAnAhHyADKAKcASEgIAMoAnQhISADKAKgASEiIAMoAqQBISMgAygCqAEhJCADKAKsASElIAMoArABISYgAygCtAEhJyADKAK4ASEoIAMoArwBISkgAygCwAEhKiADQZgCaiADQfABaiAWEIsBIAAgBSANajYCdCAAIAwgKmo2AnAgACALIClqNgJsIAAgCiAoajYCaCAAIAkgJ2o2AmQgACAIICZqNgJgIAAgByAlajYCXCAAIAQgJGo2AlggACACICNqNgJUIAAgASAiajYCUCAAICAgIWo2AkwgACAeIB9qNgJIIAAgHCAdajYCRCAAIBogG2o2AkAgACAYIBlqNgI8IAAgFSAXajYCOCAAIBMgFGo2AjQgACARIBJqNgIwIAAgDyAQajYCLCAAIAYgDmo2AiggAEGYAWogA0G4AmopAgA3AgAgAEGQAWogA0GwAmopAgA3AgAgAEGIAWogA0GoAmopAgA3AgAgAEGAAWogA0GgAmopAgA3AgAgACADKQKYAjcCeCADQcACaiQAC6AHAQN/AkACQCABQRBrIgRB+ABPDQACQCABQfgATw0AIAAgAUECdGoiAyAAIARBAnRqKAIAIAMoAgAgAnhBg4aMGHFzIgNBAnRB/PnzZ3EgA0EEdEHw4cOHf3FzIANBBnRBwIGDhnxxcyADczYCACABQQFqIgNBEGsiBEH4AE8NAUH4ACABayIFQQAgBUH4AE0bIgVBAUYEQCADIQEMAQsgACADQQJ0aiIDIAAgBEECdGooAgAgAygCACACeEGDhowYcXMiA0ECdEH8+fNncSADQQR0QfDhw4d/cXMgA0EGdEHAgYOGfHFzIANzNgIAIAFBAmoiA0EQayIEQfgATw0BIAVBAkYEQCADIQEMAQsgACADQQJ0aiIDIAAgBEECdGooAgAgAygCACACeEGDhowYcXMiA0ECdEH8+fNncSADQQR0QfDhw4d/cXMgA0EG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C0HQwcEAQShB+MHBABClAgALIAIgAyADQagBcCIEa2ohBSADQagBTwRAA0AgASABKQMIIAIpAACFNwMIIAEgASkDECACQQhqKQAAhTcDECABIAEpAxggAkEQaikAAIU3AxggASABKQMgIAJBGGopAACFNwMgIAEgASkDKCACQSBqKQAAhTcDKCABIAEpAzAgAkEoaikAAIU3AzAgASABKQM4IAJBMGopAACFNwM4IAEgASkDQCACQThqKQAAhTcDQCABIAEpA0ggAkFAaykAAIU3A0ggASABKQNQIAJByABqKQAAhTcDUCABIAEpA1ggAkHQAGopAACFNwNYIAEgASkDYCACQdgAaikAAIU3A2AgASABKQNoIAJB4ABqKQAAhTcDaCABIAEpA3AgAkHoAGopAACFNwNwIAEgASkDeCACQfAAaikAAIU3A3ggASABKQOAASACQfgAaikAAIU3A4ABIAEgASkDiAEgAkGAAWopAACFNwOIASABIAEpA5ABIAJBiAFqKQAAhTcDkAEgASABKQOYASACQZABaikAAIU3A5gBIAEgASkDoAEgAkGYAWopAACFNwOgASABIAEpA6gBIAJBoAFqKQAAhTcDqAEgByABKALQARCSAyACQagBaiICIAVHDQALCyAERQ0AIAYgBSAE/AoAAAsgASAEOgCAAyAAIAFBiAP8CgAAC6sHAQR/IwBBwAVrIgIkACACQQBByAH8CwAgAkHQAWoiBUEAQYkB/AsAIAJBGDYCyAFBwHchBANAIAIgAikDACABIARqIgNBwAhqKQAAhTcDACACIAIpAwggA0HICGopAACFNwMIIAIgAikDECADQdAIaikAAIU3AxAgAiACKQMYIANB2AhqKQAAhTcDGCACIAIpAyAgA0HgCGopAACFNwMgIAIgAikDKCADQegIaikAAIU3AyggAiACKQMwIANB8AhqKQAAhTcDMCACIAIpAzggA0H4CGopAACFNwM4IAIgAikDQCADQYAJaikAAIU3A0AgAiACKQNIIANBiAlqKQAAhTcDSCACIAIpA1AgA0GQCWopAACFNwNQIAIgAikDWCADQZgJaikAAIU3A1ggAiACKQNgIANBoAlqKQAAhTcDYCACIAIpA2ggA0GoCWopAACFNwNoIAIgAikDcCADQbAJaikAAIU3A3AgAiACKQN4IANBuAlq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EKIBIAFByA5qIhIgDCkDADcDACABQcAOaiIMIAkpAwA3AwAgAUG4DmoiCSALKQMANwMAIAFBsA5qIgsgDSkDADcDACABQagOaiINIAgpAwAiGTcDACABQaAOaiITIAopAwAiGjcDACABQZgOaiIUIA8pAwAiGzcDACABQegAaiIVIBs3AwAgAUHwAGoiFiAaNwMAIAFB+ABqIhcgGTcDACABIAEpA8AMIhk3A5AOIAEgGTcDYCABQZgBaiIYIBIpAwA3AwAgAUGQAWoiEiAMKQMANwMAIAFBiAFqIgwgCSkDADcDACABIAspAwA3A4ABIAFBOGogFykDADcDACABQTBqIBYpAwA3AwAgAUEoaiAVKQMANwMAIAEgASkDYDcDICABQdgAaiAYKQMANwMAIAFB0ABqIBIpAwA3AwAgAUHIAGogDCkDADcDACABIAEpA4ABNwNAIARBAEHIAfwLACAFQQBBiQH8CwAgAUEYNgKoCyABIAQ2AqABIAUgAkHAGGpBICADEFQgASAENgKgASAFIA5BwAggAxBUIAYgBEHQAfwKAAAgAUGQDmoiBCAFQYkB/AoAACADIAYgBBCkASARQQBBiQH8CwAgASADNgJgIAZBAEGIAfwLACABQeAAaiAGEP4BIA0gCCkAADcDACATIAopAAA3AwAgFCAPKQAANwMAIAEgASkAwAw3A5AOIAMgAkGADGogASABQUBrECNB/wEhBEHAdyECA0AgBEEAIAFBoAFqIAJqIgNBwAhqLQAAIAIgDmoiBEHACGotAABGG0EAIANBwQhqLQAAIARBwQhqLQAARhtBACADQcIIai0AACAEQcIIai0AAEYbQQAgA0HDCGotAAAgBEHDCGotAABGGyEEIAJBBGoiAg0ACyAEQX9zIQNBYCECA0AgAUHgCWogAmoiDkEgaiABQZAOaiACaiIFQSBqLQAAIANxIAFBIGogAmoiBkEgai0AACAEcXI6AAAgDkEhaiAFQSFqLQAAIANxIAZBIWotAAAgBHFyOgAAIAJBAmoiAg0ACyAQIAEpAOAJNwABIBBBGWogAUH4CWopAAA3AAAgEEERaiABQfAJaikAADcAACAQQQlqIAFB6AlqKQAANwAAIBBBADoAACABQaAPaiQAIActAJwsBEBB4K/AAEEUEOMCIQEgAEGAgICAeDYCACAAIAE2AgQMBAsgB0HeK2oiAiAHQZ8sai0AADoAACAHQegraiAHQawsaikAACIZNwMAIAdB8CtqIAdBtCxqKQAAIho3AwAgB0HYK2oiAyAHQbwsai0AADoAACAHQdAraiIEIBo3AwAgB0HIK2oiDiAZNwMAIAcgBy8AnSw7AdwrIAcgBykApCwiGTcD4CsgByAZNwPAKyAHKACgLCEFQSBBARCBAyIBRQ0CIAEgBy8B3Cs7AAAgASAFNgADIAEgBykDwCs3AAcgAEEgNgIIIAAgATYCBCAAQSA2AgAgAUECaiACLQAAOgAAIAFBD2ogDikDADcAACABQRdqIAQpAwA3AAAgAUEfaiADLQAAOgAADAMLQcipwABBGhDjAiEBIABBgICAgHg2AgAgACABNgIEDAILQfSvwABBGRDjAiEBIABBgICAgHg2AgAgACABNgIEDAELQQFBIBDdAgALIAdBgDlqJAALhAYCCH4JfyAAIAE1AiQgATUCICABNQIcIAE1AhggATUCFCABNQIQIgNCGoh8IgRCGYh8IgVCGoh8IgZCGYh8IgdCGoh8IghCGYhCE34gATUCACICQv///x+DfCIJp0H///8fcSIKQRNqQRp2IAE1AgQgAkIaiHwiAkL///8PgyAJQhqIfKciC2pBGXYgATUCCCACQhmIfCICp0H///8fcSIMakEadiABNQIMIAJCGoh8IgKnQf///w9xIg1qQRl2IANC////H4MgAkIZiHwiAqdB////H3EiDmpBGnYgBEL///8PgyACQhqIfKciD2pBGXYgBadB////H3EiEGpBGnYgBqdB////D3EiEWpBGXYgB6dB////H3EiEmpBGnYgCKdB////D3EiAWpBGXZBE2wgCmoiCjoAACAAIApBEHY6AAIgACAKQQh2OgABIAAgCkEadiALaiILQQ52OgAFIAAgC0EGdjoABCAAIApBGHZBA3EgC0ECdHI6AAMgACALQRl2IAxqIgxBDXY6AAggACAMQQV2OgAHIAAgDEEDdCALQYCAgA5xQRZ2cjoABiAAIAxBGnYgDWoiDUELdjoACyAAIA1BA3Y6AAogACAMQRV2QR9xIA1BBXRyOgAJIAAgDUEZdiAOaiIOQRJ2OgAPIAAgDkEKdjoADiAAIA5BAnY6AA0gACAOQRp2IA9qIg86ABAgACANQRN2QT9xIA5BBnRyOgAM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ASEXIAAgACgCyAEQkgMgAUGAAWogFzcAACABQfgAaiAWNwAAIAFB8ABqIBU3AAAgAUHoAGogFDcAACABQeAAaiATNwAAIAFB2ABqIBI3AAAgAUHQAGogETcAACABQcgAaiAQNwAAIAFBQGsgDzcAACABQThqIA43AAAgAUEwaiANNwAAIAFBKGogDDcAACABQSBqIAs3AAAgAUEYaiAKNwAAIAFBEGogCTcAACABQQhqIAg3AAAgASAHNwAAIAFBiAFqIgEgBUcNAAsLIAIgBGshASACIARGDQAgACkDACEHIAApAwghCCAAKQMQIQkgACkDGCEKIAApAyAhCyAAKQMoIQwgACkDMCENIAApAzghDiAAKQNAIQ8gACkDSCEQIAApA1AhESAAKQNYIRIgACkDYCETIAApA2ghFCAAKQNwIRUgACkDeCEWIAApA4ABIRcgACAAKALIARCSAyADIBc3A4gBIAMgFjcDgAEgAyAVNwN4IAMgFDcDcCADIBM3A2ggAyASNwNgIAMgETcDWCADIBA3A1AgAyAPNwNIIAMgDjcDQCADIA03AzggAyAMNwMwIAMgCzcDKCADIAo3AyAgAyAJNwMYIAMgCDcDECADIAc3AwggAUGJAU8NAiABBEAgBSADQQhqIAH8CgAACyAGIANBCGpBiAH8CgAACyAAIAE6ANgCIANBkAFqJAAPCyADQQA2AhggA0EBNgIMIANB4L7AADYCCCADQgQ3AhAgA0EIakHovsAAEMQCAAtBACABQYgBQfi+wAAQpAIAC9wGAQR/AkACQCABKAIAQQFHBEAgAUHYAWohBkGIASABLQDgAiIEayIFIANNBEAgAUEIaiEHIARFDQIgBQRAIAQgBmogAiAF/AoAAAsgASABKQMIIAEpA9gBhTcDCCABIAEpAxAgASkD4AGFNwMQIAEgASkDGCABKQPoAYU3AxggASABKQMgIAEpA/ABhTcDICABIAEpAyggASkD+AGFNwMoIAEgASkDMCABKQOAAoU3AzAgASABKQM4IAEpA4gChTcDOCABIAEpA0AgASkDkAKFNwNAIAEgASkDSCABKQOYAoU3A0ggASABKQNQIAEpA6AChTcDUCABIAEpA1ggASkDqAKFNwNYIAEgASkDYCABKQOwAoU3A2AgASABKQNoIAEpA7gChTcDaCABIAEpA3AgASkDwAKFNwNwIAEgASkDeCABKQPIAoU3A3ggASABKQOAASABKQPQAoU3A4ABIAEgASkDiAEgASkD2AKFNwOIASAHIAEoAtABEJIDIAMgBWshAyACIAVqIQIMAgsgAwRAIAQgBmogAiAD/AoAAAsgAyAEaiEEDAILQZi/wABBKEHAv8AAEKUCAAsgAiADIANBiAFwIgRraiEFIANBiAFPBEADQCABIAEpAwggAikAAIU3AwggASABKQMQIAJBCGopAACFNwMQIAEgASkDGCACQRBqKQAAhTcDGCABIAEpAyAgAkEYaikAAIU3AyAgASABKQMoIAJBIGopAACFNwMoIAEgASkDMCACQShqKQAAhTcDMCABIAEpAzggAkEwaikAAIU3AzggASABKQNAIAJBOGopAACFNwNAIAEgASkDSCACQUBrKQAAhTcDSCABIAEpA1AgAkHIAGopAACFNwNQIAEgASkDWCACQdAAaikAAIU3A1ggASABKQNgIAJB2ABqKQAAhTcDYCABIAEpA2ggAkHgAGopAACFNwNoIAEgASkDcCACQegAaikAAIU3A3AgASABKQN4IAJB8ABqKQAAhTcDeCABIAEpA4ABIAJB+ABqKQAAhTcDgAEgASABKQOIASACQYABaikAAIU3A4gBIAcgASgC0AEQkgMgAkGIAWoiAiAFRw0ACwsgBEUNACAGIAUgBPwKAAALIAEgBDoA4AIgACABQegC/AoAAAvcBgEEfwJAAkAgASgCAEEBRwRAIAFB2AFqIQZBiAEgAS0A4AIiBGsiBSADTQRAIAFBCGohByAERQ0CIAUEQCAEIAZqIAIgBfwKAAALIAEgASkDCCABKQPYAYU3AwggASABKQMQIAEpA+ABhTcDECABIAEpAxggASkD6AGFNwMYIAEgASkDICABKQPwAYU3AyAgASABKQMoIAEpA/gBhTcDKCABIAEpAzAgASkDgAKFNwMwIAEgASkDOCABKQOIAoU3AzggASABKQNAIAEpA5AChTcDQCABIAEpA0ggASkDmAKFNwNIIAEgASkDUCABKQOgAoU3A1AgASABKQNYIAEpA6gChTcDWCABIAEpA2AgASkDsAKFNwNgIAEgASkDaCABKQO4AoU3A2ggASABKQNwIAEpA8AChTcDcCABIAEpA3ggASkDyAKFNwN4IAEgASkDgAEgASkD0AKFNwOAASABIAEpA4gBIAEpA9gChTcDiAEgByABKALQARCSAyADIAVrIQMgAiAFaiECDAILIAMEQCAEIAZqIAIgA/wKAAALIAMgBGohBAwCC0HQwcEAQShB+MHBABClAgALIAIgAyADQYgBcCIEa2ohBSADQYgBTwRAA0AgASABKQMIIAIpAACFNwMIIAEgASkDECACQQhqKQAAhTcDECABIAEpAxggAkEQaikAAIU3AxggASABKQMgIAJBGGopAACFNwMgIAEgASkDKCACQSBqKQAAhTcDKCABIAEpAzAgAkEoaikAAIU3AzAgASABKQM4IAJBMGopAACFNwM4IAEgASkDQCACQThqKQAAhTcDQCABIAEpA0ggAkFAaykAAIU3A0ggASABKQNQIAJByABqKQAAhTcDUCABIAEpA1ggAkHQAGopAACFNwNYIAEgASkDYCACQdgAaikAAIU3A2AgASABKQNoIAJB4ABqKQAAhTcDaCABIAEpA3AgAkHoAGopAACFNwNwIAEgASkDeCACQfAAaikAAIU3A3ggASABKQOAASACQfgAaikAAIU3A4ABIAEgASkDiAEgAkGAAWopAACFNwOIASAHIAEoAtABEJIDIAJBiAFqIgIgBUcNAAsLIARFDQAgBiAFIAT8CgAACyABIAQ6AOACIAAgAUHoAvwKAAALjgYBB38jAEGAIGsiBCQAIARBgBBqIgcgASACEOEBIARBgAhqQQBBgAj8CwBBgHghAwNAIARBgBhqIgggA2oiCUGACGogBEGACGogA2oiBUGAEGooAgAgBUGACGooAgBqIgYgBkGBwP8DayAGQYHA/wNJGzYCACAJQYQIaiAFQYQQaigCACAFQYQIaigCAGoiBSAFQYHA/wNrIAVBgcD/A0kbNgIAIANBCGoiAw0AC0EAIgNFBEAgBCAIQYAI/AoAAAsgByABQYAIaiACQYAIahDhASADRQRAIARBgAhqIARBgAj8CgAAC0GAeCEDA0AgBEGAGGoiCCADaiIJQYAIaiAEQYAIaiADaiIFQYAQaigCACAFQYAIaigCAGoiBiAGQYHA/wNrIAZBgcD/A0kbNgIAIAlBhAhqIAVBhBBqKAIAIAVBhAhqKAIAaiIFIAVBgcD/A2sgBUGBwP8DSRs2AgAgA0EIaiIDDQALQQAiA0UEQCAEIAhBgAj8CgAACyAH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/wMgBkECdCgCtMJBIgFrIgNBACABayADQYHA/wNJG60hEiAEIQEDQCAFIAhqIgNB/wFLDQIgCCARaiIDQYACSQRAIAEgASgCACIMIAEgEGoiAygCAGoiCSAJQYHA/wNrIAlBgcD/A0kbNgIAIAJBMGogDCADKAIAayIJQYHA/wNqIgwgCSAMQYHA/wNJG60gEn4iE0IAQofAgAQQ9wEgAkEgaiACKQM4IhRCEoYgAikDMEIuiIQgFEIuiEL/v4D8DxD3ASADIAIpAyAgE3ynIgMgA0GBwP8DayADQYHA/wNJGzYCACABQQRqIQEgByAIQQFqIghGDQQMAQsLIANBgAJBhMvBABCGAgALIAZBgAJB5MrBABCGAgALIANBgAJB9MrBABCGAgALIAUgC2ohBSAEIA9qIQQgDUEBayINDQALCyAKQQFqIgpBCEcNAAsgAkHACGogAkFAa0GACPwKAABBACEBA0AgAkEQaiACQcAIaiABajUCAEKhwP0DfiISQgBCh8CABBD3ASACIAIpAxgiE0IShiACKQMQQi6IhCATQi6IQv+/gPwPEPcBIAJBwBBqIgMgAWogAikDACASfKciBCAEQYHA/wNrIARBgcD/A0kbNgIAIAFBBGoiAUGACEcNAAsgACADQYAI/AoAACACQcAYaiQAC8AFAgF/Bn4jAEGAAWsiAyQAIANBMGogARBdIAMgAykDYCADKQNYIAMpA1AiBEIaiHwiB0IZiHwiBadB////H3E2AiAgAyADKQNAIAMpAzggAykDMCIIQhqIfCIJQhmIfCIGp0H///8fcTYCECADIAMpA2ggBUIaiHwiBadB////D3E2AiQgAyADKQNIIAZCGoh8IganQf///w9xNgIUIAMgAykDcCAFQhmIfCIFp0H///8fcTYCKCADIAdC////D4MgBEL///8fgyAGQhmIfCIEQhqIfD4CHCADIASnQf///x9xNgIYIAMgAykDeCAFQhqIfCIEp0H///8PcTYCLCADIAlC////D4MgBEIZiEITfiAIQv///x+DfCIEQhqIfD4CDCADIASnQf///x9xNgIIIAJBAk8EQCACQQFrIQIDQCADQTBqIANBCGoQXSADIAMpA2AgAykDWCADKQNQIgRCGoh8IgdCGYh8IgWnQf///x9xNgIgIAMgAykDQCADKQM4IAMpAzAiCEIaiHwiCUIZiHwiBqdB////H3E2AhAgAyADKQNoIAVCGoh8IgWnQf///w9xNgIkIAMgAykDSCAGQhqIfCIGp0H///8PcTYCFCADIAMpA3AgBUIZiHwiBadB////H3E2AiggAyAHQv///w+DIARC////H4MgBkIZiHwiBEIaiHw+AhwgAyAEp0H///8fcTYCGCADIAMpA3ggBUIaiHwiBKdB////D3E2AiwgAyAJQv///w+DIARCGYhCE34gCEL///8fg3wiBEIaiHw+AgwgAyAEp0H///8fcTYCCCACQQFrIgINAAsLIAAgAykCCDcCACAAQSBqIANBKGopAgA3AgAgAEEYaiADQSBqKQIANwIAIABBEGogA0EYaikCADcCACAAQQhqIANBEGopAgA3AgAgA0GAAWokAAuXBgEFfyAAQQhrIgEgAEEEaygCACIDQXhxIgBqIQICQAJAIANBAXENACADQQJxRQ0BIAEoAgAiAyAAaiEAIAEgA2siAUGo28QAKAIARgRAIAIoAgRBA3FBA0cNAUGg28QAIAA2AgAgAiACKAIEQX5xNgIEIAEgAEEBcjYCBCACIAA2AgAPCyABIAMQmQELAkACQAJAAkACQCACKAIEIgNBAnFFBEAgAkGs28QAKAIARg0CIAJBqNvEACgCAEYNAyACIANBeHEiAhCZASABIAAgAmoiAEEBcjYCBCAAIAFqIAA2AgAgAUGo28QAKAIARw0BQaDbxAAgADYCAA8LIAIgA0F+cTYCBCABIABBAXI2AgQgACABaiAANgIACyAAQYACSQ0CIAEgABCpAUEAIQFBwNvEAEHA28QAKAIAQQFrIgA2AgAgAA0EQYjZxAAoAgAiAARAA0AgAUEBaiEBIAAoAggiAA0ACwtBwNvEAEH/HyABIAFB/x9NGzYCAA8LQazbxAAgATYCAEGk28QAQaTbxAAoAgAgAGoiADYCACABIABBAXI2AgRBqNvEACgCACABRgRAQaDbxABBADYCAEGo28QAQQA2AgALIABBuNvEACgCACIDTQ0DQazbxAAoAgAiAkUNA0EAIQBBpNvEACgCACIEQSlJDQJBgNnEACEBA0AgAiABKAIAIgVPBEAgAiAFIAEoAgRqSQ0ECyABKAIIIQEMAAsAC0Go28QAIAE2AgBBoNvEAEGg28QAKAIAIABqIgA2AgAgASAAQQFyNgIEIAAgAWogADYCAA8LAkBBmNvEACgCACICQQEgAEEDdnQiA3FFBEBBmNvEACACIANyNgIAIABB+AFxQZDZxABqIgAhAgwBCyAAQfgBcSIAQZDZxABqIQIgAEGY2cQAaigCACEACyACIAE2AgggACABNgIMIAEgAjYCDCABIAA2AggPC0GI2cQAKAIAIgEEQANAIABBAWohACABKAIIIgENAAsLQcDbxABB/x8gACAAQf8fTRs2AgAgAyAETw0AQbjbxABBfzYCAAsLwgUCCH8CfCMAQTBrIgUkAEEBIQkgASABKAIUIgdBAWoiBjYCFCABQQxqIQgCQCAGIAEoAhAiCk8NAAJAAkAgCCgCACAGai0AAEEraw4DAQIAAgtBACEJCyABIAdBAmoiBjYCFAsCQAJAIAYgCkkEQCABIAZBAWoiBzYCFCABKAIMIgwgBmotAABBMGtB/wFxIgZBCk8EQCAFQQ02AiQgBUEQaiAIEKICIAVBJGogBSgCECAFKAIUEKACIQEgAEEBNgIAIAAgATYCBAwDCyAHIApPDQEDQCAHIAxqLQAAQTBrQf8BcSILQQpPDQIgASAHQQFqIgc2AhQgBkHMmbPmAEcgC0EHS3IgBkHLmbPmAEpxRQRAIAZBCmwgC2ohBiAHIApHDQEMAwsLIAAgASACIANQIAkQ3QEMAgsgBUEFNgIkIAVBGGogCBCiAiAFQSRqIAUoAhggBSgCHBCgAiEBIABBATYCACAAIAE2AgQMAQsgA7ohDSAAAn8CQAJAAkACQAJ/IAlFBEAgBCAGayIBQR91QYCAgIB4cyABIAEgBEggBkEASnMbDAELIAQgBmoiAUEfdUGAgICAeHMgASAGQQBIIAEgBEhzGwsiB0EfdSIBIAdzIAFrIgZBtQJPBEADQCANRAAAAAAAAAAAYQ0FIAdBAE4NAiANRKDI64XzzOF/oyENIAdBtAJqIgcgB0EfdSIBcyABayIGQbUCTw0ACwsgBkEDdCsDkMdAIQ4gB0EATg0BIA0gDqMhDQwDCyAFQQ42AiQgBUEIaiAIEKICIAAgBUEkaiAFKAIIIAUoAgwQoAI2AgQMAQsgDSAOoiINmUQAAAAAAADwf2INASAFQQ42AiQgBSAIEKICIAAgBUEkaiAFKAIAIAUoAgQQoAI2AgQLQQEMAQsgACANIA2aIAIbOQMIQQALNgIACyAFQTBqJAALzAUCBn8CfgJAIAJFDQAgAkEHayIDQQAgAiADTxshByABQQNqQXxxIAFrIQhBACEDA0ACQAJAAkAgASADai0AACIFwCIGQQBOBEAgCCADa0EDcQ0BIAMgB08NAgNAIAEgA2oiBEEEaigCACAEKAIAckGAgYKEeHENAyADQQhqIgMgB0kNAAsMAgtCgICAgIAgIQpCgICAgBAhCQJAAkACfgJAAkACQAJAAkACQAJAAkACQCAFLQDwwERBAmsOAwABAgoLIANBAWoiBCACSQ0CQgAhCkIAIQkMCQtCACEKIANBAWoiBCACSQ0CQgAhCQwIC0IAIQogA0EBaiIEIAJJDQJCACEJDAcLIAEgBGosAABBv39KDQYMBwsgASAEaiwAACEEAkACQCAFQeABayIFBEAgBUENRgRADAIFDAMLAAsgBEFgcUGgf0YNBAwDCyAEQZ9/Sg0CDAMLIAZBH2pB/wFxQQxPBEAgBkF+cUFuRw0CIARBQEgNAwwCCyAEQUBIDQIMAQsgASAEaiwAACEEAkACQAJAAkAgBUHwAWsOBQEAAAACAAsgBkEPakH/AXFBAksgBEFATnINAwwCCyAEQfAAakH/AXFBME8NAgwBCyAEQY9/Sg0BCyACIANBAmoiBE0EQEIAIQkMBQsgASAEaiwAAEG/f0oNAkIAIQkgA0EDaiIEIAJPDQQgASAEaiwAAEFASA0FQoCAgICA4AAMAwtCgICAgIAgDAILQgAhCSADQQJqIgQgAk8NAiABIARqLAAAQb9/TA0DC0KAgICAgMAACyEKQoCAgIAQIQkLIAAgCiADrYQgCYQ3AgQgAEEBNgIADwsgBEEBaiEDDAILIANBAWohAwwBCyACIANNDQADQCABIANqLAAAQQBIDQEgAiADQQFqIgNHDQALDAILIAIgA0sNAAsLIAAgAjYCCCAAIAE2AgQgAEEANgIAC60EAhR+CX8gACABKAIMIhitIg8gASgCACIZQQF0rSICfiABKAIEIhpBAXStIgMgASgCCCIbrSIHfnwgASgCICIcQRNsrSIIIAEoAhQiFkEBdK0iCn58IAEoAiQiHUETbK0iBCABKAIQIh6tIgV+IAEoAhwiF0ETbK0iDCABKAIYIgGtIgl+fEIBhnw3AxggACABQRNsrSIQIAp+IAIgGq0iFH58IAggGEEBdK0iBn58IAQgB34gBSAMfnxCAYZ8NwMIIAAgBiAJfiAeQQF0rSIRIBatIg1+fCAXrSISIBtBAXStIgt+fCAcrSIOIAN+fCAdrSIVIAJ+fDcDSCAAIAsgDX4gBSAGfnwgAyAJfnwgAiASfnwgBCAOfkIBhnw3AzggACADIAV+IAsgD358IAIgDX58IAggF0EBdK0iE358IAQgCX5CAYZ8NwMoIAAgAyAGfiAHIAd+fCACIAV+fCAIIAFBAXStfnwgBCAKfiAMIBJ+fEIBhnw3AyAgACACIAd+IAMgFH58IAkgEH58IAggEX58IAQgBn4gCiAMfnxCAYZ8NwMQIAAgECARfiAZrSIHIAd+fCAIIAt+fCAGIAx+IBZBE2ytIA1+fCADIAR+fEIBhnw3AwAgACAJIAt+IAUgBX58IAYgCn58IAMgE358IAIgDn58IAQgFX5CAYZ8NwNAIAAgBiAPfiAFIAt+fCADIAp+fCACIAl+fCAIIA5+fCAEIBN+QgGGfDcDMAu6DgEIfyMAQSBrIgYkACAAAn8CQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIAEOKAIBAQEBAQEBAQMFAQEEAQEBAQEBAQEBAQEBAQEBAQEBAQEIAQEBAQcACyABQdwARg0FCyACQQFxRSABQf8FTXINB0EQQQAgAUGrnQRPGyICIAJBCHIiAyABQQt0IgIgA0ECdCgC5MdEQQt0SRsiAyADQQRyIgMgA0ECdCgC5MdEQQt0IAJLGyIDIANBAnIiAyADQQJ0KALkx0RBC3QgAksbIgMgA0EBaiIDIANBAnQoAuTHREELdCACSxsiAyADQQFqIgMgA0ECdCgC5MdEQQt0IAJLGyIDQQJ0KALkx0RBC3QiByACRiACIAdLaiADaiIHQQJ0IgJB5MfEAGohBSACKALkx0RBFXYhAkH/BSEDAkAgB0EfTQRAIAUoAgRBFXYhAyAHRQ0BCyAFQQRrKAIAQf///wBxIQQLAkAgAyACQX9zakUNACABIARrIQQgA0EBayEHQQAhAwNAIAMgAkHgocQAai0AAGoiAyAESw0BIAcgAkEBaiICRw0ACwsgAkEBcUUNByAGQQ5qQQA6AAAgBkEAOwEMIAYgAUEUdi0A4alEOgAPIAYgAUEEdkEPcS0A4alEOgATIAYgAUEIdkEPcS0A4alEOgASIAYgAUEMdkEPcS0A4alEOgARIAYgAUEQdkEPcS0A4alEOgAQIAFBAXJnQQJ2IgIgBkEMaiIDaiIEQfsAOgAAIARBAWtB9QA6AAAgAyACQQJrIgJqQdwAOgAAIAZBFGoiAyABQQ9xLQDhqUQ6AAAgACAGKQEMNwAAIAZB/QA6ABUMCAsgAEIANwECIABB3OAAOwEADAoLIABCADcBAiAAQdzoATsBAAwJCyAAQgA3AQIgAEHc5AE7AQAMCAsgAEIANwECIABB3NwBOwEADAcLIABCADcBAiAAQdy4ATsBAAwGCyACQYACcUUNASAAQgA3AQIgAEHczgA7AQAMBQsgAkH///8HcUGAgARPDQMLQQAhBAJAAkACQCABIgVBIEkNACABQf8ASQRAQQEhAwwDCwJAIAVBgIAETwRAIAVBgIAISQ0BIAVB/v//AHEiAkGunQtHIAVB4P//AHFB4M0KRyACQZ7wCkdxcSAFQfDXC2tBcUlxIAVBgPALa0HebElxIAVBgIAMa0GedElxIAVB0KYMa0F7SXEgBUGAgjhrQfrmVElxIAVB8IM4SXEhAwwEC0GQz8QAIQJBks/EACEDIAVBCHZB/wFxIQkDQAJAIAMhByAEIAItAAEiA2ohCAJAIAkgAi0AACICRwRAIAIgCUsNAgwBCyAEIAhLIAhBnAJLckUEQCAEQdzPxABqIQIDQCADRQ0CIANBAWshAyACLQAAIAJBAWohAiAFQf8BcUcNAAsMBQsgBCAIQZwCQazUxAAQpAIACyAHQQJBACAHQdzPxABHG2ohAyAIIQQgByICQdzPxABHDQELC0EBIQNBACECA0AgAkEBaiEHAkAgAiwA+NFEIgRBAE4EQCAHIQIMAQsgB0GkAkcEQCACQfnRxABqLQAAIARB/wBxQQh0ciEEIAJBAmohAgwBC0Gc1MQAEPkCAAsgBSAEayIFQQBIDQQgA0EBcyEDIAJBpAJHDQALDAMLQejIxAAhAkHqyMQAIQMgBUEIdkH/AXEhCQNAIAMhByAEIAItAAEiA2ohCAJAIAkgAi0AACICRwRAIAIgCU0NAQwECyAEIAhLIAhB1AFLckUEQCAEQcTJxABqIQIDQCADRQ0CIANBAWshAyACLQAAIAJBAWohAiAFQf8BcUcNAAsMAwsgBCAIQdQBQazUxAAQpAIACyAHQQBBAiAHQcTJxABGIgobaiEDIAghBCAHIQIgCkUNAAsMAQtBACEDDAELIAVB//8DcSEEQQEhA0EAIQIDQCACQQFqIQcCQCACLACYy0QiBUEATgRAIAchAgwBCyAHQfgDRwRAIAJBmcvEAGotAAAgBUH/AHFBCHRyIQUgAkECaiECDAELQZzUxAAQ+QIACyAEIAVrIgRBAEgNASADQQFzIQMgAkH4A0cNAAsLIANBAXENASAGQRhqQQA6AAAgBkEAOwEWIAYgAUEUdi0A4alEOgAZIAYgAUEEdkEPcS0A4alEOgAdIAYgAUEIdkEPcS0A4alEOgAcIAYgAUEMdkEPcS0A4alEOgAbIAYgAUEQdkEPcS0A4alEOgAaIAFBAXJnQQJ2IgIgBkEWaiIDaiIEQfsAOgAAIARBAWtB9QA6AAAgAyACQQJrIgJqQdwAOgAAIAZBHmoiAyABQQ9xLQDhqUQ6AAAgACAGKQEWNwAAIAZB/QA6AB8LIABBCGogAy8BADsAAEEKDAMLIAAgATYCAEGAASECQYEBDAILIABCADcBAiAAQdzEADsBAAtBACECQQILOgANIAAgAjoADCAGQSBqJAAL/gUBBn8jAEGABmsiBCQAQQBFBEAgBEG4AWpBAEHIAfwLAAtBAEUEQCAEQQ5qQQBBhgH8CwALIARBsAFqIgYgAUEYaikAADcCACAEQagBaiIHIAFBEGopAAA3AgAgBEGgAWoiCSABQQhqKQAANwIAIAQgASkAADcCmAEgBUUEQCAEQYADaiAEQbgBakHIAfwKAAALIARBGDYCyAQgBCAEKAKUATYCzAQgBEHoBGoiBSAGKQIANwMAIARB4ARqIgYgBykCADcDACAEQdgEaiIHIAkpAgA3AwAgBCAEKQKYATcD0AQgBCACQf8BcSADQQh0cjsB8AQgBEHyBGohASAIRQRAIAEgBEEOakGGAfwKAAALIARBIjoA+AUgCEUEQCABQQBBhgH8CwALIARBHzoA8gQgBCAELQD3BUGAAXI6APcFIAQgBCkDgAMgBCkD0ASFNwOAAyAEIAQpA4gDIAcpAwCFNwOIAyAEIAQpA5ADIAYpAwCFNwOQAyAEIAQpA5gDIAUpAwCFNwOYAyAEIAQpA6gDIAQpA/gEhTcDqAMgBCAEKQOgAyAEKQPwBIU3A6ADIAQgBCkDsAMgBCkDgAWFNwOwAyAEIAQpA7gDIAQpA4gFhTcDuAMgBCAEKQPAAyAEKQOQBYU3A8ADIAQgBCkDyAMgBCkDmAWFNwPIAyAEIAQpA9ADIAQpA6AFhTcD0AMgBCAEKQPYAyAEKQOoBYU3A9gDIAQgBCkD4AMgBCkDsAWFNwPgAyAEIAQpA+gDIAQpA7gFhTcD6AMgBCAEKQPwAyAEKQPABYU3A/ADIAQgBCkD+AMgBCkDyAWFNwP4AyAEIAQpA4AEIAQpA9AFhTcDgAQgBCAEKQOIBCAEKQPYBYU3A4gEIAQgBCkDkAQgBCkD4AWFNwOQBCAEIAQpA5gEIAQpA+gFhTcDmAQgBCAEKQOgBCAEKQPwBYU3A6AEIARBgANqIgEgBCgCyAQQkgMgACABQdAB/AoAACAAQdABakEAQakB/AsAIARBgAZqJAALpgQBG38gACAAKAIcIgEgACgCBCIEcyIHIAAoAhAiBSAAKAIIIgpzIgxzIhEgACgCDHMiCCAAKAIYIgZzIgsgASAFcyIScyIJIAYgACgCFHMiAnMiAyAEIAIgACgCACIEcyIGcyITIAZxcyADIAdxIg1zIAdzIAkgEnEiDiACIAggCnMiAnMiCCAJcyIXIAxxcyIPcyIQIA8gAiARcSIPIAsgAiAEcyIYIBMgASAKcyIKcyIZcXNzcyIUcSILIAggCnEgDnMiDiAPIAUgBnMiDyAEcSAKcyAIc3NzIgVzIA4gDSADIAQgCXMiDSABIAZzIg5xc3MgAXNzIgEgEHNxIhUgC3MgAXEiFiAQcyIQIAJxIhogBCABIBVzIgRxcyIVIAUgASALcyICIAUgFHMiBXFzIgEgDXFzIAMgAiAWcyABcSAFcyIDIAFzIgtxIg1zIhQgAyATcXMgDCADIAQgEHMiAnMiBSABIARzIgxzIhNxIAwgEnEiEnMiFnMiGyANIAMgBnFzIgYgEyAXcXMiAyAHIAtxIgcgBSAIcSAVc3NzIghzNgIEIAAgByAbczYCACAAIBYgAiAZcXMiByAQIBFxcyIRIAMgCSAMcXMiCXM2AhwgACAIIAEgDnFzIgMgBSAKcSAScyAJc3M2AhQgACACIBhxIBpzIAZzIBFzIgE2AhAgACAHIAQgD3FzIANzNgIIIAAgASAJczYCGCAAIAEgFHM2AgwL0wQBBH8jAEHQDWsiBSQAIAVB2AVqQQBByAH8CwAgBUGoB2pBAEGJAfwLACAFQgA3A9AFIAVBGDYCoAcgBUHoAmoiCCAFQdAFaiIHIAEgAhBSIAUgBDsB0AUgBSAIIAdBAhBSIAdBAEGACPwLACAFQQA6AOgCAkAgA0UEQEEAIQIDQCAFIAVB6AJqQQEQQwJAIAUtAOgCIgRBD3EiAUEPRiIHDQACQCABQQVJDQAgAUEKTwRAIAFBCmshAQwBCyABQQVrIQELIAFBA08EQEGDwP8DIAFrIQMMAQtBAiABayEDCwJAIARBBHYiAUEPRg0AAn8gASAEQdAASQ0AGiABQQprIARBoAFPDQAaIAFBBWsLIgZBA08EQEGDwP8DIAZrIQYMAQtBAiAGayEGCyAHRQRAIAVB0AVqIAJBAnRqIAM2AgAgAkEBaiICQYACRg0DCyABQQ9HBEAgBUHQBWogAkECdGogBjYCACACQQFqIQILIAJBgAJJDQALDAELQQAhAgNAIAUgBUHoAmpBARBDAkAgBS0A6AIiAUEPcSIDQQhLIgYNACADQQVPBEBBhcD/AyADayEEDAELQQQgA2shBAsCQCABQY8BSyIHDQAgAUEEdiEDIAFB0ABPBEBBhcD/AyADayEDDAELQQQgA2shAwsgBkUEQCAFQdAFaiACQQJ0aiAENgIAIAJBAWoiAkGAAkYNAgsgB0UEQCAFQdAFaiACQQJ0aiADNgIAIAJBAWohAgsgAkGAAkkNAAsLIAAgBUHQBWpBgAj8CgAAIAVB0A1qJAAL3wQBBn8CQAJAIAAoAggiB0GAgIDAAXFFDQACQAJAAkACQCAHQYCAgIABcQRAIAAvAQ4iAw0BQQAhAgwCCyACQRBPBEAgASACEEQhAwwECyACRQRAQQAhAgwECyACQQNxIQYCQCACQQRJBEAMAQsgAkEMcSEIA0AgAyABIAVqIgQsAABBv39KaiAEQQFqLAAAQb9/SmogBEECaiwAAEG/f0pqIARBA2osAABBv39KaiEDIAggBUEEaiIFRw0ACwsgBkUNAyABIAVqIQQDQCADIAQsAABBv39KaiEDIARBAWohBCAGQQFrIgYNAAsMAwsgASACaiEIQQAhAiABIQQgAyEFA0AgBCIGIAhGDQICfyAGQQFqIAYsAAAiBEEATg0AGiAGQQJqIARBYEkNABogBkEDaiAEQXBJDQAaIAZBBGoLIgQgBmsgAmohAiAFQQFrIgUNAAsLQQAhBQsgAyAFayEDCyADIAAvAQwiBE8NACAEIANrIQZBACEDQQAhBQJAAkACQCAHQR12QQNxQQFrDgIAAQILIAYhBQwBCyAGQf7/A3FBAXYhBQsgB0H///8AcSEIIAAoAgQhByAAKAIAIQADQCADQf//A3EgBUH//wNxSQRAQQEhBCADQQFqIQMgACAIIAcoAhARAABFDQEMAwsLQQEhBCAAIAEgAiAHKAIMEQIADQFBACEDIAYgBWtB//8DcSEBA0AgA0H//wNxIgIgAUkhBCABIAJNDQIgA0EBaiEDIAAgCCAHKAIQEQAARQ0ACwwBCyAAKAIAIAEgAiAAKAIEKAIMEQIAIQQLIAQL6zUCF38kfiMAQZADayIGJAACQAJAAkAgAkEgRgRAIAZBIGogAUEYaiIHKQAANwMAIAZBGGogAUEQaiIJKQAANwMAIAZBEGogAUEIaiIKKQAANwMAIAYgASkAADcDCCAGQcwCaiIMIAZBCGoQOyAGQShqIgIgDBCvAiAMENQBIAZB8AFqIAopAAA3AgAgBkH4AWogCSkAADcCACAGQYACaiAHKQAANwIAIAYgASkAADcC6AEjAEHgBWsiBSQAIAVB4ABqIhRBAEHgAPwLACAFQdgAaiIWIAJB2AFqKQIANwMAIAVB0ABqIhcgAkHQAWopAgA3AwAgBUGQA2oiGEGw1sEAKQMANwMAIAVBmANqIhlBuNbBACkDADcDACAFQaADakHA1sEAKQMANwMAIAVBqANqQcjWwQApAwA3AwAgBUGwA2pB0NbBACkDADcDACAFQbgDakHY1sEAKQMANwMAIAUgAkHIAWopAgA3A0ggBSACKQLAATcDQCAFQaDWwQApAwA3A4ADIAVBqNbBACkDADcDiAMgBUIANwPIAyAFQgA3A8ADIAVB0ANqIgsgBUFAayIRQYAB/AoAACAFQagFaiIPQgA3AwAgBUGwBWoiB0IANwMAIAVBuAVqIglCADcDACAFQcAFaiISQgA3AwAgBUHIBWoiE0IANwMAIAVB0AVqIhBCADcDACAFQdgFaiIKQgA3AwAgBUEgOgDQBCAFQgA3A6AFIAVBgANqIgEgCyAFQaAFahA4IBkgCSkDADcDACAYIAcpAwA3AwAgBUGIA2ogDykDADcDACAFIAUpA6AFIhw3A4ADIAUgHKdB+AFxOgCAAyAFIAUtAJ8DQT9xQcAAcjoAnwMgBSABEIwCIAVBOGoiByAKKQMANwAAIAVBMGoiCSAQKQMANwAAIAVBKGoiCiATKQMANwAAIAUgEikDADcAICAFQfgAakHo1MEAKQMANwMAIAVB8ABqQeDUwQApAwA3AwAgBUHoAGpB2NTBACkDADcDACAUQdDUwQApAwA3AwAgFkHI1MEAKQMANwMAIBdBwNTBACkDADcDACAFQgA3A4gBIAVCADcDgAEgBUG41MEAKQMANwNIIAVBsNTBACkDADcDQCAFQbABaiIBQQBB4AD8CwAgBUGoAWogBykAADcDACAFQaABaiAJKQAANwMAIAVBmAFqIAopAAA3AwAgBUEgOgCQAiAFIAUpACA3A5ABIAVBkAFqIQsCQCAEQeAATwRAIAEgA0HgAPwKAAAgBUIANwOIASAFQgE3A4ABIBEgC0EBEBsgA0HgAGohCiAEQeAAayIJQf8AcSEHIAlBgAFPBEAgBSAFKQOAASIeIAlBB3YiAa18Ihw3A4ABIAUgBSkDiAEgHCAeVK18NwOIASARIAogARAbCyAHRQ0BIAsgCiAJQYB/cWogB/wKAAAMAQsgBARAIAVBsAFqIAMgBPwKAAALIARBIGohBwsgBSAHOgCQAiAFQYADaiIPIAVBQGtB4AH8CgAAIAVB2AVqIhJCADcDACAFQdAFaiITQgA3AwAgBUHIBWoiEEIANwMAIAVBwAVqIgdCADcDACAFQbgFaiIJQgA3AwAgBUGwBWoiCkIANwMAIAVBqAVqIgFCADcDACAFQgA3A6AFIA8gBUHQA2ogBUGgBWoQOCAFQZgFaiASKQMANwMAIAVBkAVqIBMpAwA3AwAgBUGIBWogECkDADcDACAFQYAFaiAHKQMANwMAIAVB+ARqIAkpAwA3AwAgBUHwBGogCikDADcDACAFQegEaiABKQMANwMAIAUgBSkDoAU3A+AEIAVBoAJqIgEgBUHgBGoQwwIgDyABEIYDIAVBwAJqIgEgDxCPASALQQBBgQH8CwAgBUH4AGpB6NTBACkDADcDACAFQfAAakHg1MEAKQMANwMAIAVB6ABqQdjUwQApAwA3AwAgBUHgAGpB0NTBACkDADcDACAFQdgAakHI1MEAKQMANwMAIAVB0ABqQcDUwQApAwA3AwAgBUIANwOIASAFQgA3A4ABIAVBuNTBACkDADcDSCAFQbDUwQApAwA3A0ACQCAFLQCQAiIJQeAATwRAQYABIAlrIgoEQCAJIAtqIAEgCvwKAAALIAVCADcDiAEgBUIBNwOAASAFQUBrIAtBARAbIAlB4ABrIgdFDQEgCyAFQcACaiAKaiAHQYB/cWogB/wKAAAMAQsgCSALaiIBIAUpAMACNwAAIAFBGGogBUHYAmopAAA3AAAgAUEQaiAFQdACaikAADcAACABQQhqIAVByAJqKQAANwAAIAlBIGohBwsgBSAHOgCQAgJAIAdB4ABPBEBBgAEgB2siAQRAIAcgC2ogAiAB/AoAAAsgBSAFKQOAAUIBfCIcNwOAASAFIAUpA4gBIBxQrXw3A4gBIAVBQGsgC0EBEBsgB0HgAGsiB0UNASALIAEgAmogB0GAf3FqIAf8CgAADAELIAcgC2oiASACKQAANwAAIAFBGGogAkEYaikAADcAACABQRBqIAJBEGopAAA3AAAgAUEIaiACQQhqKQAANwAAIAdBIGohBwsgBSAHOgCQAgJAAkBBgAEgB2siASAETQRAIAdFDQEgAQRAIAcgC2ogAyAB/AoAAAsgBSAFKQOAAUIBfCIcNwOAASAFIAUpA4gBIBxQrXw3A4gBIAVBQGsgC0EBEBsgASADaiEDIAQgAWshBAwBCyAEBEAgByALaiADIAT8CgAACyAEIAdqIQoMAQsgBEH/AHEhCiAEQYABTwRAIAUgBSkDgAEiHiAEQQd2IgGtfCIcNwOAASAFIAUpA4gBIBwgHlStfDcDiAEgBUFAayADIAEQGwsgCkUNACALIAMgBEGAf3FqIAr8CgAACyAFIAo6AJACIAVBgANqIgkgBUFAa0HgAfwKAAAgBUHYBWoiCkIANwMAIAVB0AVqIgRCADcDACAFQcgFaiIDQgA3AwAgBUHABWoiAUIANwMAIAVBuAVqIhpCADcDACAFQbAFaiIbQgA3AwAgBUGoBWoiEUIANwMAIAVCADcDoAUgCSAFQdADaiAFQaAFaiIWEDggBUGYBWogCikDADcDACAFQZAFaiAEKQMANwMAIAVBiAVqIAMpAwA3AwAgBUGABWogASkDADcDACAFQfgEaiAaKQMANwMAIAVB8ARqIBspAwA3AwAgBUHoBGogESkDADcDACAFIAUpA6AFNwPgBCAFQeACaiIBIAVB4ARqIhQQwwIgBUGYA2oiFyAFQRhqKQAANwMAIAVBkANqIhggBUEQaikAADcDACAFQYgDaiIZIAVBCGopAAA3AwAgBSAFKQAANwOAAyMAQfAAayIVJAAgFUEoaiINIAEQhgEgFUHMAGoiDiAJEIYBIwBB0ABrIggkACAIIA4oAgAiCa0iPCANKAIAIgqtIiV+Ih5Cm/zRkgF+Qv////8BgyI5QtKxzAR+IA0oAgQiC60iJiA8fiAOKAIEIg+tIicgJX58IjV8IDlC7afX5wF+IB58Qh2IfCIcQpv80ZIBfkL/////AYMiOkIUhiAOKAIMIhKtIj0gJn4gDSgCCCIErSIoIA4oAggiA60iI358IA0oAgwiAa0iKSAnfnwgDjUCECIvICV+fCANNQIQIjAgPH58Ii19IAogDSgCFCITaq0iJCAvfnwgCSAOKAIUIhBqrSIqIDB+fCAEIA0oAhwiB2qtIisgAyAOKAIcIglqrSIsfnwgEiAOKAIgIgpqrSIfIAsgDSgCGCIEaq0iIH58IA0oAiAiAyABaq0iISAOKAIYIgEgD2qtIiJ+fCAKrSIxIAStIjJ+IAetIjMgCa0iNH58IAOtIjYgAa0iN358Ij59ICMgKX4gKCA9fnwgJiAvfnwgJyAwfnwgEK0iOCATrSIdfn0iPyA6Qs0CfiAefXwgJCAqfnwgIyAlfiAmICd+fCAoIDx+fCIuIDlCluuc7wF+fCA6QtKxzAR+fCA6Qu2n1+cBfiAcfEIdiHwiHEKb/NGSAX5C/////wGDIjtCxfrO7wF+fCAnICh+ICMgJn58ICUgPX58ICkgPH58Ih4gOULF+s7vAX58IDpCluuc7wF+fCA7QtKxzAR+fCA7Qu2n1+cBfiAcfEIdiHwiHEKb/NGSAX5C/////wGDIiVCluuc7wF+fCA6QsX6zu8BfiA5Qs0CfnwgLXwgO0KW65zvAX58ICVC0rHMBH58ICVC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiJkLSscwEfnwgJkLtp9fnAX4gHHxCHYh8IhxCm/zRkgF+Qv////8BgyInQs0CfnwgKCAvfiApID1+fCAjIDB+fCAyIDh+IB0gN358fSIjICIgJH4gNX0gICAqfnx8IDtCzQJ+fCAlQsX6zu8BfnwgJkKW65zvAX58ICdC0rHMBH58ICdC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiKELF+s7vAX58IDAgPX4gKSAvfnwgHSA0fiAyIDd+fCAzIDh+fH0iNSAgICJ+IC59ICQgLH58ICogK358fCAlQs0CfnwgJkLF+s7vAX58ICdCluuc7wF+fCAoQtKxzAR+fCAoQu2n1+cBfiAcfEIdiHwiHEKb/NGSAX5C/////wGDIilCluuc7wF+fCA5QhSGIB59IC8gMH58ICAgLH58ICIgK358IB8gJH58ICEgKn58IDMgN34gMiA0fnwgHSAxfnwgNiA4fnwiLX0gJkLNAn58ICdCxfrO7wF+fCAoQpbrnO8BfnwgKULSscwEfnwgKULtp9fnAX4gHHxCHYh8IhxCm/zRkgF+Qv////8BgyIdQtKxzAR+fCAdQu2n1+cBfiAcfEIdiHwiHKdB/////wFxNgIsIAggIiAwfiA/fSAgIC9+fCA7QhSGfCAfICt+fCAhICx+fCA0IDZ+IDEgM358Ii59IChCzQJ+fCApQsX6zu8BfnwgHUKW65zvAX58IBxCHYh8IhynQf////8BcTYCMCAIICwgMH4gKyAvfnwgIyAxIDZ+Ih58fSAfICF+fCAlQhSGfCApQs0CfnwgHULF+s7vAX58IBxCHYh8IhynQf////8BcTYCNCAIICEgL34gHyAwfnwgNX0gJkIUhnwgHULNAn58IBxCHYh8IhynQf////8BcTYCOCAIICdCFIYgLXwgHEIdiHwiHKdB/////wFxNgI8IAggKEIUhiA+fCAcQh2IfCIcp0H/////AXE2AkAgCCApQhSGIC58IBxCHYh8IhynQf////8BcTYCRCAIIB1CFIYgHnwgHEIdiHwiHEIdiD4CTCAIIBynQf////8BcTYCSCAIQQhqIAhBLGoiEEGY2cEAEHkgCCAINQIYIiRCjpG+/AB+IAgoAgwiB60iIULX7vyhAX4gCCgCCCIDrSIfQoGvy8sBfnwgCCgCECIBrSIjQr3+tawBfnwgCCgCFCIJrSIiQpe20PABfnwgJEKSuv7aAH58IjV9IAMgCCgCHCIKaq0iMUKBr8vLAX58IAcgCCgCICIEaq0iMkLE95CiAX58IAEgCCgCJCIDaq0iM0LbmJedA358ICFCkrr+2gB+IB9Cl7bQ8AF+fCItIB9C5tmxggF+Qv7///8BgyIqQtKxzAR+fCAfQpK6/toAfiIeICpC7afX5wF+fEIdiHwiHEKb/NGSAX5C/////wGDIiBCFIZ8IAkgCCgCKCIBaq0iNELUxIvYA358IAOtIjZCnprh8AF+IAStIjdC7YgUfnwgAa0iOEK9jrvnAX58Ij59ICNC1+78oQF+ICFCga/LywF+fCAiQr3+tawBfnwgJEKXttDwAX58IAqtIh1ChKnAXn58Ij8gHn0gMUKOkb78AH58ICBCzQJ+fCAhQpe20PABfiAfQr3+tawBfnwgI0KSuv7aAH58Ii4gKkKW65zvAX58ICBC0rHMBH58ICBC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiK0LF+s7vAX58ICFCvf61rAF+IB9C1+78oQF+fCAjQpe20PABfnwgIkKSuv7aAH58Ih4gKkLF+s7vAX58ICBCluuc7wF+fCArQtKxzAR+fCArQu2n1+cBfiAcfEIdiHwiHEKb/NGSAX5C/////wGDIixCluuc7wF+fCA1ICpCzQJ+fCAgQsX6zu8BfnwgK0KW65zvAX58ICxC0rHMBH58ICxC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiH0LSscwEfnwgH0Ltp9fnAX4gHHxCHYh8IhxCm/zRkgF+Qv////8BgyIgQs0CfnwgIkLX7vyhAX4gI0KBr8vLAX58ICRCvf61rAF+fCAdQsPxxJh+fnwgN0KEqcBefnwiIyAxQtTEi9gDfiAtfSAyQo6RvvwAfnx8ICtCzQJ+fCAsQsX6zu8BfnwgH0KW65zvAX58ICBC0rHMBH58ICBC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiIULF+s7vAX58ICRC1+78oQF+ICJCga/LywF+fCAdQuLlno9+fnwgN0LD8cSYfn58IDZChKnAXn58IjUgMULbmJedA34gLn0gMkLUxIvYA358IDNCjpG+/AB+fHwgLELNAn58IB9CxfrO7wF+fCAgQpbrnO8BfnwgIULSscwEfnwgIULtp9fnAX4gHHxCHYh8IhxCm/zRkgF+Qv////8BgyIiQpbrnO8BfnwgKkIUhiAefSAkQoGvy8sBfnwgMULE95CiAX58IDJC25iXnQN+fCAzQtTEi9gDfnwgNEKOkb78AH58IDdCnprh8AF+IB1C7YgUfnwgNkK9jrvnAX58IDhC/Na/IX58Ii19IB9CzQJ+fCAgQsX6zu8BfnwgIUKW65zvAX58ICJC0rHMBH58ICJC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiHULSscwEfnwgHULtp9fnAX4gHHxCHYh8IhynQf////8BcTYCLCAIICRC1MSL2AN+ID99IDJCga/LywF+fCAzQsT3kKIBfnwgNELbmJedA358IDhCnprh8AF+IDZC7YgUfnwiLn0gK0IUhnwgIULNAn58ICJCxfrO7wF+fCAdQpbrnO8BfnwgHEIdiHwiHKdB/////wFxNgIwIAggJELbmJedA34gM0KBr8vLAX58ICMgOELtiBR+Ih58fSA0QsT3kKIBfnwgLEIUhnwgIkLNAn58IB1CxfrO7wF+fCAcQh2IfCIcp0H/////AXE2AjQgCCAkQsT3kKIBfiA1fSA0QoGvy8sBfnwgH0IUhnwgHULNAn58IBxCHYh8IhynQf////8BcTYCOCAIICBCFIYgLXwgHEIdiHwiHKdB/////wFxNgI8IAggIUIUhiA+fCAcQh2IfCIcp0H/////AXE2AkAgCCAiQhSGIC58IBxCHYh8IhynQf////8BcTYCRCAIIB1CFIYgHnwgHEIdiHwiHEIdiD4CTCAIIBynQf////8BcTYCSCAVQQRqIgEgEEGY2cEAEHkgCEHQAGokACAUIAEQkgEgFUHwAGokACAaIAVBuAJqKQAANwMAIBsgBUGwAmopAAA3AwAgESAFQagCaikAADcDACAFIAUpAKACNwOgBSMAQZABayIDJAAgA0EkaiAUEIYBIANByABqIBYQhgEgAyADKAJIIAMoAiRqIgFB/////wFxNgJsIAMgAygCTCADKAIoIAFBHXZqaiIBQf////8BcTYCcCADIAMoAlAgAygCLCABQR12amoiAUH/////AXE2AnQgAyADKAJUIAMoAjAgAUEddmpqIgFB/////wFxNgJ4IAMgAygCWCADKAI0IAFBHXZqaiIBQf////8BcTYCfCADIAMoAlwgAygCOCABQR12amoiAUH/////AXE2AoABIAMgAygCYCADKAI8IAFBHXZqaiIBQf////8BcTYChAEgAyADKAJkIAMoAkAgAUEddmpqIgFB/////wFxNgKIASADIAMoAmggAygCRCABQR12ampB/////wFxNgKMASADIANB7ABq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jBhqIAJBjDBqQYAI/AoAAAsgACACQQxqQYAg/AoAACAFQYAgaiIAIAZHDQEgAkGQwABqJAAPC0HIpMAAQS9B+KTAABCLAgALIAJBEGogASgCACAAEOEBIAJBADYCHCACQQE2AhAgAkGsgMAANgIMIAJCBDcCFCACQQxqQbikwAAQxAIAC+YEAgd/AX4jAEEQayIDJAACQCAALwEMIgJFBEAgACgCACAAKAIEIAEQZCEBDAELIANBCGogAUEIaikCADcDACADIAEpAgA3AwACQAJ/IAApAggiCaciBkGAgIAIcUUEQCADKAIEDAELIAAoAgAgAygCACADKAIEIgEgACgCBCgCDBECAA0BIAAgBkGAgID/eXFBsICAgAJyIgY2AgggA0IBNwMAIAIgAUH//wNxayIBQQAgASACTRshAkEACyEHAkAgAygCDCIIRQRADAELIAMoAgghAQNAAn8CQAJAAkACQCABLwEAQQFrDgIBAgALIAFBBGooAgAMAwsgAUECai8BACIFDQFBAQwCCyABQQhqKAIADAELIAVB9v8XaiAFQZz/H2pxIAVBmPg3aiAFQfCxH2pxc0ERdkEBagshBSABQQxqIQEgBCAFaiEEIAhBAWsiCA0ACwsCQCAEIAdqIgEgAkH//wNxSQRAIAIgAWshBEEAIQFBACECAkACQAJAIAZBHXZBA3FBAWsOAwABAAILIAQhAgwBCyAEQf7/A3FBAXYhAgsgBkH///8AcSEIIAAoAgQhBSAAKAIAIQcDQCABQf//A3EgAkH//wNxTw0CIAFBAWohASAHIAggBSgCEBEAAEUNAAsMAgsgACgCACAAKAIEIAMQZCEBIAAgCTcCCAwCCyAHIAUgAxBkDQBBACEGIAQgAmtB//8DcSECA0ACQCAGQf//A3EiBCACSSEBIAIgBE0NACAGQQFqIQYgByAIIAUoAhARAABFDQELCyAAIAk3AggMAQtBASEBCyADQRBqJAAgAQvsBAEFfyMAQZDAAGsiAiQAAkACQCABKAIAIgUgASgCBCIGRg0AIAJBkDhqIgQgBSABKAIIIgEQU0EARQRAIAJBjChqIARBgAj8CgAACyADRQRAIAJBjCBqIAJBjChqQYAI/AoAAAsgA0UEQCACQYwwaiACQYwgakGACPwKAAALIANFBEAgAkEMaiACQYwwakGACPwKAAAL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APwKAAAgA0HwAWokAAvRBAEDfyMAQZDAAGsiAyQAAkACQCABIAJGDQAgA0GQOGoiBSABEFhBAEUEQCADQYwoaiAFQYAI/AoAAAsgBEUEQCADQYwgaiADQYwoakGACPwKAAALIARFBEAgA0GMMGogA0GMIGpBgAj8CgAACyAERQRAIANBDGogA0GMMGpBgAj8CgAACyABQYAIaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMCGogA0GMMGpBgAj8CgAACyABQYAQaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMEGogA0GMMGpBgAj8CgAACyABQYAYaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMGGogA0GMMGpBgAj8CgAACyAAIANBDGpBgCD8CgAAIAFBgCBqIgAgAkcNASADQZDAAGokAA8LQcikwABBL0H4pMAAEIsCAAsgA0EQaiAAEFggA0EANgIcIANBATYCECADQayAwAA2AgwgA0IENwIUIANBDGpBuKTAABDEAgAL0QQBA38jAEGQwABrIgMkAAJAAkAgASACRg0AIANBkDhqIgUgARB6QQBFBEAgA0GMKGogBUGACPwKAAALIARFBEAgA0GMIGogA0GMKGpBgAj8CgAACyAERQRAIANBjDBqIANBjCBqQYAI/AoAAAsgBEUEQCADQQxqIANBjDBqQYAI/AoAAAsgAUGACGoiBCACRg0AIAUgBBB6QQAiBEUEQCADQYwoaiAFQYAI/AoAAAsgBEUEQCADQYwgaiADQYwoakGACPwKAAALIARFBEAgA0GMMGogA0GMIGpBgAj8CgAACyAERQRAIANBjAhqIANBjDBqQYAI/AoAAAsgAUGAEGoiBCACRg0AIAUgBBB6QQAiBEUEQCADQYwoaiAFQYAI/AoA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BDYCCAsgAyABayEDIAEgAmohAiAIQfUARgRAIAdBD3EtAMruQCEGIAdBBHYtAMruQCEHIAUoAgAgBGtBBU0EQCAFIARBBhDfASAFKAIIIQQLIAUoAgQgBGoiASAGOgAFIAEgBzoABCABQdzqwYEDNgAAIAUgBEEGaiIENgIIBSAFKAIAIARrQQFNBEAgBSAEQQIQ3wEgBSgCCCEECyAFKAIEIARqIgEgCDoAASABQdwAOgAAIAUgBEECaiIENgIICwwACwALyQQBDn8jAEEQayIDIAEoAiAgAigCIGsgASgCHCACKAIcayABKAIYIAIoAhhrIAEoAhQgAigCFGsgASgCECACKAIQayABKAIMIAIoAgxrIAEoAgggAigCCGsgASgCBCABKAIAIAIoAgBrIgRBH3VqIAIoAgRrIgJBH3VqIgVBH3VqIgZBH3VqIgdBH3VqIghBH3VqIglBH3VqIgpBH3VqIgtBH3UiATYCDCADKAIMIQwgAyABNgIMIAMoAgwhDSADIAE2AgwgAygCDCEOIAMgATYCDCADKAIMIQ8gAyABNgIMIAMoAgwhECADIAE2AgwgAygCDBogAyABNgIMIAMoAgwaIAMgATYCDCADKAIMGiADIAE2AgwgAygCDCEBIAAgCkH/////AXEgCUH/////AXEgCEH/////AXEgB0H/////AXEgBkH/////AXEgBUH/////AXEgAkH/////AXEgDEHtp9fnAXEgBEH/////AXFqIgJBHXZqIA1B0rHMBHFqIgNBHXZqIA5Bluuc7wFxaiIEQR12aiAPQcX6zu8BcWoiBUEddmogEEHNAnFqIgZBHXZqIgdBHXZqIghBHXZqIglB/////wFxNgIcIAAgCEH/////AXE2AhggACAHQf////8BcTYCFCAAIAZB/////wFxNgIQIAAgBUH/////AXE2AgwgACAEQf////8BcTYCCCAAIANB/////wFxNgIEIAAgAkH/////AXE2AgAgACAJQR12IAtqIAFBgIDAAHFqQf////8BcTYCIAueBAIQfwN+IwBB0AhrIgIkACACQShqIAFBgAj8CgAAIAJCgoCAgBA3AsgIIAJCiICAgMAANwLACCACQqCAgICAAjcCuAggAkKAgYCAgAg3ArAIIAJBsAhqIQwDQCAMIAhBAnRqKAIAIgZBAXQiCUUEQEGI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iHwiBKdB////D3E2AhwgACAOIA1rQfD///8Baq0gBUIaiHwiBadB////D3E2AgwgACAMIAtrQfD///8Daq0gBEIZiHwiBKdB////H3E2AiAgACAGQv///w+DIANC////H4MgBUIZiHwiA0IaiHw+AhQgACADp0H///8fcTYCECAAIAogCWtB8P///wFqrSAEQhqIfCIDp0H///8PcTYCJCAAIAhC////D4MgA0IZiEITfiAHQv///x+DfCIDQhqIfD4CBCAAIAOnQf///x9xNgIAC9oDAQN/IwBBkBxrIgMkAAJAAkAgASACRg0AIANBkBhqIgUgARB+QQBFBEAgA0GOEGogBUGABPwKAAALIARFBEAgA0GODGogA0GOEGpBgAT8CgAACyAERQRAIANBjhRqIANBjgxqQYAE/AoAAAsgBEUEQCADQQxqIANBjhRqQYAE/AoAAAsgAUGABGoiBCACRg0AIAUgBBB+QQAiBEUEQCADQY4QaiAFQYAE/AoAAAsgBEUEQCADQY4MaiADQY4QakGABPwKAAALIARFBEAgA0GOFGogA0GODGpBgAT8CgAACyAERQRAIANBjARqIANBjhRqQYAE/AoAAAsgAUGACGoiBCACRg0AIAUgBBB+QQAiBEUEQCADQY4QaiAFQYAE/AoAAAsgBEUEQCADQY4MaiADQY4QakGABPwKAAALIARFBEAgA0GOFGogA0GODGpBgAT8CgAACyAERQRAIANBjAhqIANBjhRqQYAE/AoAAAsgACADQQxqQYAM/AoAACABQYAMaiIAIAJHDQEgA0GQHGokAA8LQcikwABBL0GIpcAAEIsCAAsgA0EOaiAAEH4gA0EANgIcIANBATYCECADQayAwAA2AgwgA0IENwIUIANBDGpBqKTAABDEAgALwgMBCX8jAEEgayICJAACQAJ/AkACQAJAIAEoAhQiAyABKAIQIgVPDQBBACAFayEEIANBAmohAyABQQxqIQcgASgCDCEIA0AgAyAIaiIGQQJrLQAAIglBCWsiCkEXS0EBIAp0QZOAgARxRXJFBEAgASADQQFrNgIUIAQgA0EBaiIDakECRw0BDAILCyAJQe4ARw0AIAEgA0EBayIENgIUIAQgBU8NAiABIAM2AhQCQCAGQQFrLQAAQfUARw0AIAMgBCAFIAQgBUsbIgVGDQMgASADQQFqIgQ2AhQgBi0AAEHsAEcNACAEIAVGDQMgASADQQJqNgIUIAZBAWotAABB7ABGDQILIAJBCTYCFCACQQhqIAcQogIgAkEUaiACKAIIIAIoAgwQoAIMAwsgAkEUaiABEJsBIAIoAhRBgICAgHhGBEAgACACKAIYNgIEIABBgYCAgHg2AgAMBAsgACACKQIUNwIAIABBCGogAkEcaigCADYCAAwDCyAAQYCAgIB4NgIADAILIAJBBTYCFCACIAcQogIgAkEUaiACKAIAIAIoAgQQoAILIQMgAEGBgICAeDYCACAAIAM2AgQLIAJBIGokAAv9AgEIfyMAQcAIayIDJAAgA0HgBWpBAEHIAfwLACADQbAHakEAQYkB/AsAIANCADcD2AUgA0EYNgKoByADQQhqIANB2AVqIAFBwAAQUiACQSBqIQEDQCADQdgFaiADQQhqQegC/AoAACADQfACaiIEIANB2AVqIgUgAigCACACQQRqKAIAEFIgA0EIaiIGIARB6AL8CgAAIAJBCGoiAiABRw0ACyADQZAGaiIBQgA3AwAgA0GIBmoiAkIANwMAIANBgAZqIgRCADcDACADQfgFaiIHQgA3AwAgA0HwBWoiCEIANwMAIANB6AVqIglCADcDACADQeAFaiIKQgA3AwAgA0IANwPYBSAGIAVBwAAQQyAAQThqIAEpAwA3AAAgAEEwaiACKQMANwAAIABBKGogBCkDADcAACAAQSBqIAcpAwA3AAAgAEEYaiAIKQMANwAAIABBEGogCSkDADcAACAAQQhqIAopAwA3AAAgACADKQPYBTcAACADQcAIaiQAC+cCAQV/IwBB8AFrIgIkACACQaABaiIDIAFB0ABqEC0gAkHwAGogAkHAAWopAgA3AwAgAkHoAGogAkG4AWopAgA3AwAgAkHgAGogAkGwAWopAgA3AwAgAkHYAGogAkGoAWopAgA3AwAgAiACKQKgATcDUCACQZgBaiACQegBaikCADcDACACQZABaiACQeABaikCADcDACACQYgBaiACQdgBaikCADcDACACQYABaiACQdABaikCADcDACACIAIpAsgBNwN4IAMgAkHQAGoiBkEFEFkgAkEIaiIEIAMgAkH4AGoiBRAyIAUgASAEEDIgAyABQShqIAQQMiACQTBqIAMQSyAGIAUQSyACLQBQQQFxEOQCIQEg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czYCNCACIAIoAqgDIgFBBHYgAXNBgJi8GHFBEWwgAXMiAUECdiABc0GA5oCYA3FBBWwgAXM2AqgDIAIgAigCrAMiAUEEdiABc0GAmLwYcUERbCABcyIBQQJ2IAFzQYDmgJgDcUEFbCABczYCrAMgAiACKAKwAyIBQQR2IAFzQYCYvBhxQRFsIAFzIgFBAnYgAXNBgOaAmANxQQVsIAFzNgKwAyACIAIoArwDIgFBBHYgAXNBgJi8GHFBEWwgAXMiAUECdiABc0GA5oCYA3FBBWwgAXM2ArwDIAIoAqADIQEgAigCpAMhByACKAK0AyEDIAIoArgDIQQgAiACKAI4QX9zNgI4IAIgAigCQEF/czYCQCACIAIoAkRBf3M2AkQgAiACKAJUQX9zNgJUIAIgAigCWEF/czYCWCACIAIoAmBBf3M2AmAgAiACKAJkQX9zNgJkIAIgAigCdEF/czYCdCACIAIoAnhBf3M2AnggAiACKAKAAUF/czYCgAEgAiACKAKEAUF/czYChAEgAiACKAKUAUF/czYClAEgAiACKAKYAUF/czYCmAEgAiACKAKgAUF/czYCoAEgAiACKAKkAUF/czYCpAEgAiACKAK0AUF/czYCtAEgAiACKAK4AUF/czYCuAEgAiACKALAAUF/czYCwAEgAiACKALEAUF/czYCxAEgAiACKALUAUF/czYC1AEgAiACKALYAUF/czYC2AEgAiACKALgAUF/czYC4AEgAiACKALkAUF/czYC5AEgAiACKAL0AUF/czYC9AEgAiACKAL4AUF/czYC+AEgAiACKAKAAkF/czYCgAIgAiACKAKEAkF/czYChAIgAiACKAKUAkF/czYClAIgAiACKAKYAkF/czYCmAIgAiACKAKgAkF/czYCoAIgAiACKAKkAkF/czYCpAIgAiACKAK0AkF/czYCtAIgAiACKAK4AkF/czYCuAIgAiACKALAAkF/czYCwAIgAiACKALEAkF/czYCxAIgAiACKALUAkF/czYC1AIgAiACKALYAkF/czYC2AIgAiACKALgAkF/czYC4AIgAiACKALkAkF/czYC5AIgAiACKAL0AkF/czYC9AIgAiACKAL4AkF/czYC+AIgAiACKAKAA0F/czYCgAMgAiACKAKEA0F/czYChAMgAiACKAKUA0F/czYClAMgAigCmAMhBiAC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ACADQagBaiEDIApBqAFrIgoNAAsLIAdFDQAgBkEIaiABQagB/AoAACABIAEoAsgBEJIDIAcEQCAEIAlqIAZBCGogB/wKAAALIAggBkEIakGoAfwKAAALIAEgBzoA+AIgACACNgIEIAAgBTYCACAGQbABaiQAC9ECAQR/IwBB4A1rIgIkACACQQhqQQBBgAj8CwAgAkH4CmpBAEHIAfwLACACQcgMakEAQYkB/AsAIAJCADcD8AogAkEYNgLADCACQYgIaiIDIAJB8ApqIgQgAUEgEFIgAkIANwPwCiADIARBCBBDIAJBADoA3w0CQEHZASIDQf8BTQRAA0AgAkGICGogAkHfDWpBARBDIAItAN8NIgEgA0sEQANAIAJBiAhqIAJB3w1qQQEQQyADIAItAN8NIgFJDQALCyACQQhqIgQgA0ECdGogAUECdCAEaiIEKAIANgIAIANB2QFrIgVBA3YhASAFQcAATw0CIARBgMD/A0EBIAJB8ApqIAFqLQAAIANBJ2pBB3F2QQFxGzYCACADQQFqIgEhAyABQYACRw0ACwsgACACQQhqQYAI/AoAACACQeANaiQADwsgAUEIQcDBwQAQhgIAC5ADAQV/IwBB0ABrIgIkACACQSBqIAFBCGooAgA2AgAgAkGAAToAJCACQQA2AhQgAkKAgICAEDcCDCACIAEpAgA3AhggACACQQxqECECQCAALQAAQQZGDQAgAkE4aiAAQRBqKQMANwMAIAJBMGogAEEIaikDADcDACACIAApAwA3AyggAigCICIBIAIoAhwiA08NACACQRhqIQQgAigCGCEFAkADQCABIAVqLQAAQQlrIgZBF0tBASAGdEGTgIAEcUVyDQEgAyABQQFqIgFHDQALIAIgAzYCIAwBCyACIAE2AiAgAkEWNgJEIAIgBBCRAiACQcQAaiACKAIAIAIoAgQQoAIhASAAQQY6AAAgACABNgIEAkACQAJAIAItACgOBQMDAwECAAsgAkEoakEEchD6AQwCCyACKAIsIgBFDQEgAigCMCAAQQEQ9wIMAQsgAkEoakEEchDQASACKAIsIgBFDQAgAigCMCAAQRhsQQgQ9wILIAIoAgwiAARAIAIoAhAgAEEBEPcCCyACQdAAaiQAC4IDAQR/IAAoAgwhAgJAAkACQCABQYACTwRAIAAoAhghAwJAAkAgACAC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BGo2AgggASgCBCAAakHu6rHjBjYAAEEADAELIAQgBCkDADcDCCAEQQhqELMCCyAEQRBqJAALswIBAX8jAEHwAGsiBiQAIAYgATYCDCAGIAA2AgggBiADNgIUIAYgAjYCECAGQYDXxAAoAgA2AhwgBkH01sQAKAIANgIYAkAgBCgCAARAIAZBMGogBEEQaikCADcDACAGQShqIARBCGopAgA3AwAgBiAEKQIANwMgIAZBBDYCXCAGQbTWxAA2AlggBkIENwJkIAYgBkEQaq1CgICAgKAPhDcDUCAGIAZBCGqtQoCAgICgD4Q3A0ggBiAGQSBqrUKAgICAsA+ENwNADAELIAZBAzYCXCAGQYDWxAA2AlggBkIDNwJkIAYgBkEQaq1CgICAgKAPhDcDSCAGIAZBCGqtQoCAgICgD4Q3A0ALIAYgBkEYaq1CgICAgOAOhDcDOCAGIAZBOGo2AmAgBkHYAGogBRDEAgALzQIBA38CQAJAAkACQCABQQdqIgJB+ABPDQAgAUEPaiIEQfgATw0CIAAgBEECdGogACACQQJ0aigCADYCACABQQZqIgJB+ABPDQAgACABQQJ0aiIDQThqIAAgAkECdGooAgA2AgAgAUEFaiICQfgATw0AIANBNGogACACQQJ0aigCADYCACABQQRqIgJB+ABPDQAgA0EwaiAAIAJBAnRqKAIANgIAIAFBA2oiAkH4AE8NACADQSxqIAAgAkECdGooAgA2AgAgAUECaiICQfgATw0AIANBKGogACACQQJ0aigCADYCACABQQFqIgJB+ABPDQAgA0EkaiAAIAJBAnRqKAIANgIAIAFB+ABJDQEgASECCyACQfgAQdCJxAAQhgIACyABQQhqIgRB+ABJDQELIARB+ABB4InEABCGAgALIAAgBEECdGogAygCADYCAAuYBAEHfyMAQeAFayICJABB4AAhAyACQfwAaiIEQQBB4AD8CwAgAkEANgLcASACQcjEwAA2AnggAiABNgJ0IAJBADsBcCABQdABaiEGAkACQAJAIAEtAPgCIgUEQCAFQcgASQ0CQagBIAVrIgcEQCAEIAUgBmogB/wKAAALIAVByABrIgNFDQEgBCAHaiEECyACQeABaiABQagB/AoAACABIAEoAsgBEJIDIAMEQCAEIAJB4AFqIAP8CgAACyAGIAJB4AFqQagB/AoAAAwCC0EAIQMMAQsgBCAFIAZqQeAA/AoAACAFQeAAaiEDCyABIAM6APgCIAIgAkHwAGpB8AD8CgAAQQAhAQNAIAJB4AFqIgcgAWoCfwJAIAIvAQBFBEAgAkEMaiEGIAIoAmwhAwJAA0ACQCADQeAARgRAIAIoAgQgBkHgACACKAIIKAIMEQMAQQAhA0EDIQUMAQsgA0EDaiEFIANB3gBPDQILIAIgBTYCbCADIAZqIgMtAAJBBHQgAy0AASIIQQR2ciEEIAMtAAAgCEEIdEGAHnFyIgNBgRpPBEAgBSEDIARBgRpPDQEMBAsLIAMgBEGAGksNAxogAiAEOwECIAJBATsBACADDAMLIAMgBUHgAEHQ0cEAEKQCAAsgAkEAOwEAIAIvAQIhBAsgBAs7AQAgAUECaiIBQYAERw0ACyAAIAdBgAT8CgAAIAJB4AVqJAAL6wIBBn4gAEHw////AyABKAIYa61B8P///wEgASgCFGutQfD///8DIAEoAhBrrSICQhqIfCIFQhmIfCIDp0H///8fcTYCGCAAQfD///8DIAEoAghrrUHw////ASABKAIEa61B0P3//wMgASgCAGutIgZCGoh8IgdCGYh8IgSnQf///x9xNgIIIABB8P///wEgASgCHGutIANCGoh8IgOnQf///w9xNgIcIABB8P///wEgASgCDGutIARCGoh8IgSnQf///w9xNgIMIABB8P///wMgASgCIGutIANCGYh8IgOnQf///x9xNgIgIAAgBUL///8PgyACQv///x+DIARCGYh8IgJCGoh8PgIUIAAgAqdB////H3E2AhAgAEHw////ASABKAIka60gA0IaiHwiAqdB////D3E2AiQgACAHQv///w+DIAJCGYhCE34gBkL///8fg3wiAkIaiHw+AgQgACACp0H///8fcTYCAAvjAgEHfyABIAEtAEgiA2ohBEHIACADayIDBEAgBEEAIAP8CwALIAFBADoASCAEQQY6AAAgASABLQBHQYABcjoARyAAIAApAwAgASkAAIU3AwAgAEEIaiIEIAQpAwAgASkACIU3AwAgAEEQaiIDIAMpAwAgASkAEIU3AwAgAEEYaiIFIAUpAwAgASkAGIU3AwAgAEEgaiIGIAYpAwAgASkAIIU3AwAgAEEoaiIHIAcpAwAgASkAKIU3AwAgAEEwaiIIIAgpAwAg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QQAgAmsQVgsgA0EQaiQAC/oBAQN/IwBBEGsiAiQAIAAoAgAhAAJ/IAEtAAtBGHFFBEAgASgCACAAIAEoAgQoAhARAAAMAQsgAkEANgIMIAEgAkEMagJ/IABBgAFPBEAgAEE/cUGAf3IhAyAAQQZ2IQEgAEGAEEkEQCACIAM6AA0gAiABQcABcjoADEECDAILIABBDHYhBCABQT9xQYB/ciEBIABB//8DTQRAIAIgAzoADiACIAE6AA0gAiAEQeABcjoADEEDDAILIAIgAzoADyACIAE6AA4gAiAEQT9xQYB/cjoADSACIABBEnZBcHI6AAxBBAwBCyACIAA6AAxBAQsQYgsgAkEQaiQAC7cqAhV/A34jAEHAAWsiDCQAIAxB0ABqIQkgAygCBCIVQQAgAygCACISQYCAgIB4RxshByADKAIIIQgjAEHwA2siAyQAIANBuANqQgA3AwAgA0GwA2pCADcDACADQagDakIANwMAIANCADcDoAMgA0GIAmogByADQaADaiAHGyAIQSAgBxsQPUEAIQcDQCADQYgCaiIKIAdqIgggCC0AAEE2czoAACAIQQFqIgsgCy0AAEE2czoAACAIQQJqIgsgCy0AAEE2czoAACAIQQNqIgggCC0AAEE2czoAACAHQQRqIgdBwABHDQALQQAhByADQeADakGQvcAAKQMANwMAIANB2ANqQYi9wAApAwA3AwAgA0HQA2pBgL3AACkDADcDACADQgE3A+gDIANB+LzAACkDADcDyAMgA0HIA2ogCkEBEBwDQCADQYgCaiIKIAdqIgggCC0AAEHqAHM6AAAgCEEBaiILIAstAABB6gBzOgAAIAhBAmoiCyALLQAAQeoAczoAACAIQQNqIgggCC0AAEHqAHM6AAAgB0EEaiIHQcAARw0ACyADQRhqIgdBkL3AACkDADcDACADQRBqIghBiL3AACkDADcDACADQQhqIgtBgL3AACkDADcDACADQSBqIg5CATcDACADQfi8wAApAwA3AwAgAyAKQQEQHCADQeABaiAOKQMANwMAIANB2AFqIAcpAwA3AwAgA0HQAWogCCkDADcDACADQcgBaiALKQMANwMAIANBoAFqIANB0ANqKQMANwMAIANBqAFqIANB2ANqKQMANwMAIANBsAFqIANB4ANqKQMANwMAIANBuAFqIANB6ANqKQMA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IAFBgeD/AUkbIgEgASACSRshASADQQxqIgNB/AdHDQALIAELrAEBAX8gACgCACIBBEAgACgCBCABQQEQ9wILIAAoAgwiAQRAIAAoAhAgAUEBEPcCCyAAKAIkIgFBgICAgHhGIAFFckUEQCAAKAIoIAFBARD3AgsgACgCGCIBBEAgACgCHCABQQEQ9wILIAAoAjAiAUGAgICAeEYgAUVyRQRAIAAoAjQgAUEBEPcCCyAAKAI8IgFBgICAgHhGIAFFckUEQCAAKAJAIAFBARD3AgsLyisCNH8QfiMAQUBqIhQkACAUQRhqIAJBGGopAAA3AwAgFEEQaiACQRBqKQAANwMAIBRBCGogAkEIaikAADcDACAUIAIpAAA3AwAgFEE4aiABQRhqKQAANwMAIBRBMGogAUEQaikAADcDACAUQShqIAFBCGopAAA3AwAgFCABKQAANwMgIwBBIGsiLSQAIBRBIGoiASABLQAfQT9xQcAAcjoAHyABIAEtAABB+AFxOgAAIC1BCGogAUEIaikAADcDACAtQRBqIAFBEGopAAA3AwAgLUEYaiABQRhqKQAANwMAIC0gASkAADcDACAAIQJBACEBIwBBoANrIgMkACADQQhqIBQQfyADQdAAakGQicQAKQIAIjc3AwAgA0HIAGpBiInEACkCACI5NwMAIANBQGtBgInEACkCACI4NwMAIANBOGpB+IjEACkCACI6NwMAIANB4ABqQgA3AwAgA0HoAGpCADcDACADQfAAakIANwMAIANB+ABqQgA3AwAgA0HwiMQAKQIAIjs3AzAgA0IANwNYIANBoAFqIANBKGopAgA3AwAgA0GYAWogA0EgaikCADcDACADQZABaiADQRhqKQIANwMAIANBiAFqIANBEGopAgA3AwAgA0GwAWogOjcDACADQbgBaiA4NwMAIANBwAFqIDk3AwAgA0HIAWogNzcDACADIAMpAgg3A4ABIAMgOzcDqAEgA0EAOgDXASADQQE2AtwCIANCgICAgIAgNwLUAiADIC02AtACIANB2ABqIS9BASEGAkACQANAAkACQCAGRQRAIAMoAtgCIgAgAygC1AJNDQIgAyAAQQFrIgQ2AtgCIARBA3YhBSAAQYECTw0EIAMoAtACIAVqLQAAIARBB3F2QQFxIQAMAQsgA0EANgLcAgJ/QQAhACADQdACaiIE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ASkDmAUgPEIaiHwiPKdB////D3E2AqwBIAEgASkDwAUgOEIZiHwiOKdB////H3E2AsABIAEgOUL///8PgyA3Qv///x+DIDxCGYh8IjdCGoh8PgK0ASABIDenQf///x9xNgKwASABIAEpA8gFIDhCGoh8IjenQf///w9xNgLEASABIDtC////D4MgN0IZiEITfiA6Qv///x+DfCI3QhqIfD4CpAEgASA3p0H///8fcTYCoAEgBiAHEF0gASABKQPIBSABKQPABSABKQO4BSABKQOwBSABKQOoBSABKQOgBSI3QhqIfCI5QhmIfCI4QhqIfCI6QhmIfCI7QhqIfCI8QhmIQhN+IAEpA4AFIj1C////H4N8Ij6nQf///x9xIgo2AsgBIAEgASkDiAUgPUIaiHwiPUL///8PgyA+QhqIfKciCzYCzAEgASA3Qv///x+DIAEpA5gFIAEpA5AFID1CGYh8IjdCGoh8Ij1CGYh8Ij6nQf///x9xIgw2AtgBIAEgOUL///8PgyA+QhqIfKciDTYC3AEgASA3p0H///8fcSIONgLQASABID2nQf///w9xIg82AtQBIAEgOKdB////H3EiEDYC4AEgASA6p0H///8PcSIRNgLkASABIDunQf///x9xIhI2AugBIAEgPKdB////D3EiGjYC7AEgAUHwAWoiCCABQaABaiIbIAFByAFqIhwQiwEgAUGYAmoiHSABIAkQMiABQcACaiIJIAcgAUHQAGoQMiABKAKYAiEHIAEoAsACIR4gASgCnAIhHyABKALEAiEmIAEoAqACIScgASgCyAIhKCABKAKkAiEpIAEoAswCISogASgCqAIhKyABKALQAiEsIAEoAqwCIS4gASgC1AIhMCABKAKwAiExIAEoAtgCITIgASgCtAIhMyABKALcAiE0IAEoArgCITUgASgC4AIhNiABIAEoAuQCIAEoArwCajYCjAMgASA1IDZqNgKIAyABIDMgNGo2AoQDIAEgMSAyajYCgAMgASAuIDBqNgL8AiABICsgLGo2AvgCIAEgKSAqajYC9AIgASAnIChqNgLwAiABIB8gJmo2AuwCIAEgByAeajYC6AIgAUGQA2oiByAdIAkQiwEgBiABQegCahBdIAEpA5gFITggASkDkAUhOiABKQOIBSE7IAEpA4AFITcgASkDyAUhPCABKQPABSE9IAEpA7gFIT4gASkDsAUhQSABKQOoBSFCIAEpA6AFITkgBiAHEF0gASABKQOwBSABKQOoBSABKQOgBSI/QhqIfCJEQhmIfCJAp0H///8fcTYC0AMgASABKQOQBSABKQOIBSABKQOABSJFQhqIfCJGQhmIfCJDp0H///8fcTYCwAMgASABKQO4BSBAQhqIfCJAp0H///8PcTYC1AMgASABKQOYBSBDQhqIfCJDp0H///8PcTYCxAMgASABKQPABSBAQhmIfCJAp0H///8fcTYC2AMgASBEQv///w+DID9C////H4MgQ0IZiHwiP0IaiHw+AswDIAEgP6dB////H3E2AsgDIAEgASkDyAUgQEIaiHwiP6dB////D3E2AtwDIAEgRkL///8PgyA/QhmIQhN+IEVC////H4N8Ij9CGoh8PgK8AyABID+nQf///x9xNgK4AyABQeADakGYicQAIAgQMiABQYgEaiAbIBwQMiABIAEoAoQEIBpqNgKkBSABIAEoAoAEIBJqNgKgBSABIAEoAvwDIBFqNgKcBSABIAEoAvgDIBBqNgKYBSABIAEoAvQDIA1qNgKUBSABIAEoAvADIAxqNgKQBSABIAEoAuwDIA9qNgKMBSABIAEoAugDIA5qNgKIBSABIAEoAuQDIAtqNgKEBSABIAEoAuADIApqNgKABSABQbAEaiAIIAYQMiABQdgEaiADQQhqIAFBuANqEDIgJSABQagEaikCADcCACAjIAFBoARqKQIANwIAICEgAUGYBGopAgA3AgAgFSABQZAEaikCADcCACAFIAEpAogENwIAIAUgASkCsAQ3AiggEyABQbgEaikCADcCACAgIAFBwARqKQIANwIAICIgAUHIBGopAgA3AgAgJCABQdAEaikCADcCACAEIDwgPSA+IEEgQiA5QhqIfCJCQhmIfCJBQhqIfCI+QhmIfCI9QhqIfCI8p0H///8PcTYCJCAEID2nQf///x9xNgIgIAQgPqdB////D3E2AhwgBCBBp0H///8fcTYCGCAEIEJC////D4MgOUL///8fgyA4IDogOyA3QhqIfCI5QhmIfCI6QhqIfCI4QhmIfCI7QhqIfD4CFCAEIDunQf///x9xNgIQIAQgOKdB////D3E2AgwgBCA6p0H///8fcTYCCCAEIDlC////D4MgPEIZiEITfiA3Qv///x+DfCI3QhqIfD4CBCAEIDenQf///x9xNgIAIAQgASkC2AQ3AiggFiABQeAEaikCADcCACAXIAFB6ARqKQIANwIAIBggAUHwBGopAgA3AgAgGSABQfgEaikCADcCACABQdAFaiQAIAMgADoA1wEgAygC3AIhBiAAIQEMAQsLIAEQ5AIhACADKAKAASEBIAMoAjAhBCADKAKEASEFIAMoAjQhBiADKAKIASEHIAMoAjghCCADKAKMASETIAMoAjwhFSADKAKQASEgIAMoAkAhISADKAKUASEiIAMoAkQhFiADKAKYASEjIAMoAkghFyADKAKcASEkIAMoAkwhGCADKAKgASElIAMoAlAhCSADKAKkASEZIAMoAlQhCiADKAKoASELIAMoAlghDCADKAKsASENIAMoAlwhDiADKAKwASEPIAMoAmAhECADKAK0ASERIAMoAmQhEiADKAK4ASEaIAMoAmghGyADKAK8ASEcIAMoAmwhHSADKALAASEeIAMoAnAhHyADKALEASEmIAMoAnQhJyADKALIASEoIAMoAnghKSADQQAgAEH/AXFrIgAgAygCzAEiKiADKAJ8IitzcSIsICtzNgJ8IAMgKSAoIClzIABxIitzNgJ4IAMgJyAmICdzIABxIilzNgJ0IAMgHyAeIB9zIABxIidzNgJwIAMgHSAcIB1zIABxIh9zNgJsIAMgGyAaIBtzIABxIh1zNgJoIAMgEiARIBJzIABxIhtzNgJkIAMgECAPIBBzIABxIhJzNgJgIAMgDiANIA5zIABxIhBzNgJcIAMgDCALIAxzIABxIg5zNgJYIAMgCiAKIBlzIABxIgxzNgJUIAMgCSAJICVzIABxIgpzNgJQIAMgGCAYICRzIABxIglzNgJMIAMgFyAXICNzIABxIhhzNgJIIAMgFiAWICJzIABxIhdzNgJEIAMgISAgICFzIABxIhZzNgJAIAMgFSATIBVzIABxIiFzNgI8IAMgCCAHIAhzIABxIhVzNgI4IAMgBiAFIAZzIABxIghzNgI0IAMgBCABIARzIABxIgBzNgIwIAMgKiAsczYCzAEgAyAoICtzNgLIASADICYgKXM2AsQBIAMgHiAnczYCwAEgAyAcIB9zNgK8ASADIBogHXM2ArgBIAMgESAbczYCtAEgAyAPIBJzNgKwASADIA0gEHM2AqwBIAMgCyAOczYCqAEgAyAMIBlzNgKkASADIAogJXM2AqABIAMgCSAkczYCnAEgAyAYICNzNgKYASADIBcgInM2ApQBIAMgFiAgczYCkAEgAyATICFzNgKMASADIAcgFXM2AogBIAMgBSAIczYChAEgAyAAIAFzNgKAASADQQA6ANcBIANB0AJqIgAgLxAtIANBoAJqIANB8AJqKQIANwMAIANBmAJqIANB6AJqKQIANwMAIANBkAJqIANB4AJqKQIANwMAIANBiAJqIANB2AJqKQIANwMAIAMgAykC0AI3A4ACIANByAJqIANBmANqKQIANwMAIANBwAJqIANBkANqKQIANwMAIANBuAJqIANBiANqKQIANwMAIANBsAJqIANBgANqKQIANwMAIAMgAykC+AI3A6gCIAAgA0GAAmpBBRBZIANB2AFqIgEgACADQagCahAyIAAgA0EwaiABEDIgAiAAEEsgA0GgA2okAAwBCyAFQSBBwInEABCGAgALIC1BIGokACAUQUBrJAALkQEBBn8jAEGABGsiBSQAA0AgAyAFaiIGIAIgA2oiBy8BACABIANqIggvAQBqIgQgBEGBGmsgBEH//wNxQYEaSRs7AQAgBkECaiAHQQJqLwEAIAhBAmovAQBqIgQgBEGBGmsgBEH//wNxQYEaSRs7AQAgA0EEaiIDQYAERw0ACyAAIAVBgAT8CgAAIAVBgARqJAALhQEBBH8jAEGABGsiAiQAIAJBAEGABPwLAANAIAIgA2oiBEECaiABLQAAIgVBBHY7AQAgBCAFQQ9xOwEAIARBBmogAUEBai0AACIFQQR2OwEAIARBBGogBUEPcTsBACABQQJqIQEgA0EIaiIDQYAERw0ACyAAIAJBgAT8CgAAIAJBgARqJAALpAEBAn8jAEEwayICJABBASEDAkAgAUGW2MEAQRsQ5gINAAJAIAAoAgAEQCACIAA2AgwgAkECNgIUIAJBuNjBADYCECACQgE3AhwgAiACQQxqrUKAgICAgAiENwMoIAIgAkEoajYCGCABKAIAIAEoAgQgAkEQahBuRQ0BDAILIAFByNjBAEEEEOYCDQELIAFBzNjBAEECEOYCIQMLIAJBMGokACADC5MBAgF/AX4jAEEwayICJAACfyAAKAIAIgAoAgxFBEAgACABEKsBDAELIAJBAzYCBCACQbzrwAA2AgAgAkID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DBCgAiEBIABBFEEEEPcCCyACQSBqJAAgAQu9AwEHfyMAQRBrIgMkACAAKAIIIQUgACgCBCEAIAEoAgBBr6rEAEEBIAEoAgQoAgwRAgAhBCADQQRqIgJBADoABSACIAQ6AAQgAiABNgIAIAUEQANAIAMgADYCDCADQQxqIQcjAEEgayIBJABBASEGAkAgA0EEaiIELQAEDQAgBC0ABSEIAkAgBCgCACICLQAKQYABcUUEQCAIQQFxRQ0BIAIoAgBBgarEAEECIAIoAgQoAgwRAgBFDQEMAgsgCEEBcUUEQCACKAIAQYOqxABBASACKAIEKAIMEQIADQILIAFBAToADyABQYyqxAA2AhQgASACKQIANwIAIAEgAikCCDcCGCABIAFBD2o2AgggASABNgIQIAcgAUEQakGUvsAAKAIAEQAADQEgASgCEEGEqsQAQQIgASgCFCgCDBECACEGDAELIAcgAkGUvsAAKAIAEQAAIQYLIARBAToABSAEIAY6AAQgAUEgaiQAIABBAWohACAFQQFrIgUNAAsLQQEhACADQQRqIgEtAARFBEAgASgCACIAKAIAQbCqxABBASAAKAIEKAIMEQIAIQALIAEgADoABCADQRBqJAAgAAuOAQEBfwJAAkAgAEGEAU8EQCAA0G8mAUHA18QAKAIADQFBwNfEAEF/NgIAIABB1NfEACgCACIBSQ0CIAAgAWsiAEHM18QAKAIATw0CQcjXxAAoAgAgAEECdGpB0NfEACgCADYCAEHQ18QAIAA2AgBBwNfEAEHA18QAKAIAQQFqNgIACw8LQbyUxAAQlAMLAAt9AwF/AX4BfCMAQRBrIgMkAAJAAkACQAJAIAAoAgBBAWsOAgECAAsgACsDCCEFIANBAzoAACADIAU5AwgMAgsgACkDCCEEIANBAToAACADIAQ3AwgMAQsgACkDCCEEIANBAjoAACADIAQ3AwgLIAMgASACEOwBIANBEGokAAu7BQETfyMAQcABayIDJAAgA0G4AWogAUEYaikAADcDACADQbABaiABQRBqKQAANwMAIANBqAFqIAFBCGopAAA3AwAgAyABKQAANwOgASMAQSBrIgEkACADQaABaiIEIAQtAB9BP3FBwAByOgAfIAQgBC0AAEH4AXE6AAAgAUEIaiAEQQhqKQAANwMAIAFBEGogBEEQaikAADcDACAB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DAMLQRFBEUG8u8QAEIYCAAsgAUERQcy7xAAQhgIACyAoISkLAkAgKSAtWiAEcg0AIC0gKSArfCIoWCAtICl9ICggLX1UcQ0AIAlBADYCAAwECyApIDRCBH1YIClCAlpxRQRAIAlBADYCAAwECyAJIAM7AQggCSABQQFqNgIEDAILICohKAsCQCAoIC9aIAJyDQAgLyAoICx8IipYIC8gKH0gKiAvfVRxDQAgCUEANgIADAILICggKSArQlh+fFggKCArQhR+WnFFBEAgCUEANgIADAILIAkgAzsBCCAJIAE2AgQLIAkgDDYCAAsgAEHgAGokAAwBCyAAQQA2AkgjAEEQayIBJAAgASAAQTBqNgIMIAEgAEFAazYCCCABQQhqQfDUxAAgAUEMakHw1MQAIABByABqQeDAxAAQngEAC0HdqcQAQQEgMUIAUyIAGyEeQd2pxABB4KnEACAAGyEfIDFCP4inISAgBigCIEUNASAGQdgAaiAGQShqKAIANgIAIAYgBikCIDcDUAwCCyAAQQJGDQJBASEAQd2pxABB4KnEACAxQgBTIgEbQd2pxABBASABGyARGyECIDFCP4inIBFyIQEgBEH/AXFBBEcNAyAGQQI7ASAgBkEBNgIoIAZB3qnEADYCJCAGQSBqDAQLIAZB0ABqIQ8gBkEPaiELIwBBoAprIgEkAAJAAkACQAJAIAZB4ABqIgApAwAiKVBFBEAgACkDCCIqUEUEQCAAKQMQIihQRQRAIClCf4UgKFoEQCApICpaBEAgACwAGiESIAAuARghACABICk+AgAgAUEBQQIgKUKAgICAEFQiAhs2AqABIAFBACApQiCIpyACGzYCBCABQQhqQQBBmAH8CwAgASAqPgKkASABQQFBAiAqQoCAgIAQVCICGzYCxAIgAUEAICpCIIinIAIbNgKoASABQawBakEAQZgB/AsAIAEgKD4CyAIgAUEBQQIgKEKAgICAEFQiAhs2AugDIAFBACAoQiCIpyACGzYCzAIgAUHQAmpBAEGYAfwLACABQfADakEAQZwB/AsAIAFBATYC7AMgAUEBNgKMBSAArCAoICl8QgF9eX1CwprB6AR+QoChzaC0AnxCIIinIgLBIQ0CQCAAQQBOBEAgASAAEHMaIAFBpAFqIAAQcxogAUHIAmogABBzGgwBCyABQewDakEAIABrwRBz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NgIMIAQgADYCCCAEIAM2AgQgBCABNgIAIAVBEGokAAwBC0EBIAMQ3QIACyAEKAIAIAQoAgQgBCgCCCAEKAIMIARBEGokAAuNjQECU38KfiMAQRBrIkkkACAAIUpBACEAIwBBwANrIg8kAAJAAkACQAJAIAEiUUEgRyAFQcAAR3JFBEAgSigAACEcIEooAAQhFSAPQeABaiIXIEpBEGopAAA3AgAgD0HoAWogSkEYaikAADcCACAPIBU2AtQBIA8gHDYC0AEgDyBKKQAINwLYASMAQaADayIBJAAgAUGoAWoiBiAPQdABaiIaEH8gAUHwAWpByNzBACkCADcDACABQegBakHA3MEAKQIANwMAIAFB4AFqQbjcwQApAgA3AwAgAUHYAWpBsNzBACkCADcDACABQajcwQApAgA3A9ABIwBB0ABrIgAkACAAIAYQXSABQfwBaiIGIAApAzAgACkDKCAAKQMgIllCGoh8IlxCGYh8IlqnQf///x9xNgIYIAYgACkDECAAKQMIIAApAwAiXUIaiHwiXkIZiHwiW6dB////H3E2AgggBiAAKQM4IFpCGoh8IlqnQf///w9xNgIcIAYgACkDGCBbQhqIfCJbp0H///8PcTYCDCAGIAApA0AgWkIZiHwiWqdB////H3E2AiAgBiBcQv///w+DIFlC////H4MgW0IZiHwiWUIaiHw+AhQgBiBZp0H///8fcTYCECAGIAApA0ggWkIaiHwiWadB////D3E2AiQgBiBeQv///w+DIFlCGYhCE34gXUL///8fg3wiWUIaiHw+AgQgBiBZp0H///8fcTYCACAAQdAAaiQAIAFBpAJqIgcgBiABQdABahCLASABQdgAaiAGQYDcwQAQMiABIAEoAnw2AvACIAEgASkCdDcC6AIgASABKQJsNwLgAiABIAEpAmQ3AtgCIAEgASkCXDcC0AIgASABKAJYQQFqNgLMAiABQfQCaiEKIwBB8AJrIgAkACAAQaACaiIGIAFBzAJqIgkQXSAAIAApA9ACIAApA8gCIAApA8ACIllCGoh8IlxCGYh8IlqnQf///x9xNgKQAiAAIAApA7ACIAApA6gCIAApA6ACIl1CGoh8Il5CGYh8IlunQf///x9xNgKAAiAAIAApA9gCIFpCGoh8IlqnQf///w9xNgKUAiAAIAApA7gCIFtCGoh8IlunQf///w9xNgKEAiAAIAApA+ACIFpCGYh8IlqnQf///x9xNgKYAiAAIFxC////D4MgWUL///8fgyBbQhmIfCJZQhqIfD4CjAIgACBZp0H///8fcTYCiAIgACAAKQPoAiBaQhqIfCJZp0H///8PcTYCnAIgACBeQv///w+DIFlCGYhCE34gXUL///8fg3wiWUIaiHw+AvwBIAAgWadB////H3E2AvgBIABBCGoiDCAAQfgBaiIIIAkQMiAGIAwQXSAAIAApA9ACIAApA8gCIAApA8ACIllCGoh8IlxCGYh8IlqnQf///x9xNgKQAiAAIAApA7ACIAApA6gCIAApA6ACIl1CGoh8Il5CGYh8IlunQf///x9xNgKAAiAAIAApA9gCIFpCGoh8IlqnQf///w9xNgKUAiAAIAApA7gCIFtCGoh8IlunQf///w9xNgKEAiAAIAApA+ACIFpCGYh8IlqnQf///x9xNgKYAiAAIFxC////D4MgWUL///8fgyBbQhmIfCJZQhqIfD4CjAIgACBZp0H///8fcTYCiAIgACAAKQPoAiBaQhqIfCJZp0H///8PcTYCnAIgACBeQv///w+DIFlCGYhCE34gXUL///8fg3wiWUIaiHw+AvwBIAAgWadB////H3E2AvgBIABBMGoiCyAIIAkQMiAAQYABaiINIAcgDBAyIABB0AFqIgwgByALEDIgBiAMEC0gAEGYAmogAEHAAmopAgA3AwAgAEGQAmogAEG4AmopAgA3AwAgAEGIAmogAEGwAmopAgA3AwAgAEGAAmogAEGoAmopAgA3AwAgACAAKQKgAjcD+AEgBiAIQQIQWSAAQagBaiILIAwgBhAyIABB2ABqIg4gDSALEDIgBiAOEF0gACAAKQPQAiAAKQPIAiAAKQPAAiJZQhqIfCJcQhmIfCJap0H///8fcTYCkAIgACAAKQOwAiAAKQOoAiAAKQOgAiJdQhqIfCJeQhmIfCJbp0H///8fcTYCgAIgACAAKQPYAiBaQhqIfCJap0H///8PcTYClAIgACAAKQO4AiBbQhqIfCJbp0H///8PcTYChAIgACAAKQPgAiBaQhmIfCJap0H///8fcTYCmAIgACBcQv///w+DIFlC////H4MgW0IZiHwiWUIaiHw+AowCIAAgWadB////H3E2AogCIAAgACkD6AIgWkIaiHwiWadB////D3E2ApwCIAAgXkL///8PgyBZQhmIQhN+IF1C////H4N8IllCGoh8PgL8ASAAIFmnQf///x9xNgL4ASAMIAkgCBAyIAggDBBLIAYgBxBLQQAhBkEBIQgDQCAAQfgBaiIMIAZqLQAAIABBoAJqIgkgBmotAABGEOQCIAhxIQggBkEBaiIGQSBHDQALIAgQ5AIhGyAAQfD///8DIAcoAhhrrUHw////ASAHKAIUa61B8P///wMgBygCEGutIllCGoh8IlxCGYh8IlqnQf///x9xIgs2ArgCIABB8P///wMgBygCCGutQfD///8BIAcoAgRrrUHQ/f//AyAHKAIAa60iXUIaiHwiXkIZiHwiW6dB////H3EiDTYCqAIgAEHw////ASAHKAIca60gWkIaiHwiWqdB////D3EiDjYCvAIgAEHw////ASAHKAIMa60gW0IaiHwiW6dB////D3EiETYCrAIgAEHw////AyAHKAIga60gWkIZiHwiWqdB////H3EiEjYCwAIgACBZQv///x+DIFtCGYh8IlmnQf///x9xIhM2ArACIAAgXEL///8PgyBZQhqIfKciFDYCtAIgAEHw////ASAHKAIka60gWkIaiHwiWadB////D3EiGDYCxAIgACBZQhmIQhN+IF1C////H4N8IlmnQf///x9xIhA2AqACIAAgXkL///8PgyBZQhqIfKciGTYCpAIgAEGoAWogAEHQAWoQSyAMIAkQS0EAIQZBASEIA0AgAEGoAWoiDCAGai0AACAAQfgBaiIHIAZqLQAARhDkAiAIcSEIIAZBAWoiBkEgRw0ACyAIEOQCIRYgACAYNgLEAiAAIBI2AsACIAAgDjYCvAIgACALNgK4AiAAIBQ2ArQCIAAgEzYCsAIgACARNgKsAiAAIA02AqgCIAAgGTYCpAIgACAQNgKgAiAHIABBoAJqQbDbwQAQMiAAQYABaiAAQdABahBLIAwgBxBLQQAhBkEBIQgDQCAAQYABaiAGai0AACAAQagBaiAGai0AAEYQ5AIgCHEhCCAGQQFqIgZBIEcNAAsgCBDkAiEGIABBoAJqQbDbwQAgAEHYAGoiPBAyIABB4ABqIghBACAGIBZyEOQCQf8BcWsiBiAIKAIAIgcgACgCqAJzcSAHcyIHNgIAIABB6ABqIgwgDCgCACIJIAAoArACcyAGcSAJcyIJNgIAIABB8ABqIgsgCygCACINIAAoArgCcyAGcSANcyINNgIAIAAgACgCZCIOIAAoAqwCcyAGcSAOcyIONgJkIAAgACgCXCIRIAAoAqQCcyAGcSARcyIRNgJcIAAgACgCWCISIAAoAqACcyAGcSAScyISNgJYIAAgACgCbCITIAAoArQCcyAGcSATcyITNgJsIAAgACgCdCIUIAAoArwCcyAGcSAUcyIUNgJ0IABB+ABqIhggGCgCACIQIAAoAsACcyAGcSAQcyIQNgIAIAAgBiAAKAJ8IhkgACgCxAJzcSAZcyIZNgJ8IABB+AFqIDwQSyAYQQAgAC0A+AFBAXEQ5AJB/wFxayIGQfD///8DIBBrrUHw////ASAUa61B8P///wMgDWutQfD///8BIBNrrUHw////AyAJa60iWUIaiHwiXEIZiHwiWkIaiHwiXUIZiHwiXqdB////H3EgEHNxIBBzNgIAIAsgWqdB////H3EgDXMgBnEgDXM2AgAgDCBZQv///x+DQfD///8BIA5rrUHw////AyAHa61B8P///wEgEWutQdD9//8DIBJrrSJZQhqIfCJaQhmIfCJbQhqIfCJfQhmIfCJgp0H///8fcSAJcyAGcSAJczYCACAIIFunQf///x9xIAdzIAZxIAdzNgIAIABB8P///wEgGWutIF5CGoh8Il6nQf///w9xIBlzIAZxIBlzNgJ8IAAgXadB////D3EgFHMgBnEgFHM2AnQgACATIFxC////D4MgYEIaiHyncyAGcSATczYCbCAAIF+nQf///w9xIA5zIAZxIA5zNgJkIAAgXkIZiEITfiBZQv///x+DfCJZp0H///8fcSAScyAGcSASczYCWCAAIBEgWkL///8PgyBZQhqIfKdzIAZxIBFzNgJcIAogFiAbchDkAjoAACAKIAApAlg3AgQgCkEMaiAIKQIANwIAIApBFGogDCkCADcCACAKQRxqIAspAgA3AgAgCkEkaiAYKQIANwIAIABB8AJqJAAgAUHgAGoiACABQYADaikCADcDACABQegAaiIGIAFBiANqKQIANwMAIAFB8ABqIgggAUGQA2opAgA3AwAgAUH4AGoiByABQZgDaikCADcDACABQYgBaiIKIAFBsAFqKQIANwMAIAFBkAFqIgwgAUG4AWopAgA3AwAgAUGYAWoiCSABQcAB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AgAgACAAKQIINwLgDiAJIABB6A1qIglBoAH8CgAAIABBqAFqIisgCUGgAfwKAAAgAEHIAmoiPSAJQaAB/AoAACAAQegDaiJGIAlBoAH8CgAAIABBiAVqIkwgCUGgAfwKAAAgAEGoBmoiTyAJQaAB/AoAACAAQcgHaiJUIAlBoAH8CgAAIABB6AhqIlcgCUGgAfwKAAAgAEGQDWoiDiAXKQIANwMAIABBiA1qIhEgGCkCADcDACAAQYANaiISIBMpAgA3AwAgAEH4DGoiEyAUKQIANwMAIABBoA1qIhQgGykCADcDACAAQagNaiIYIBApAgA3AwAgAEGwDWoiECAZKQIANwMAIABBuA1qIhkgGikCADcDACAAIAcpAig3A/AMIAAgBykCUDcDmA0gAEHoDGogFikCADcDACAAQeAMaiAVKQIANwMAIABB2AxqIBwpAgA3AwAgAEHQDGogDSkCADcDACAAIAcpAgA3A8gMIAkgAEHIDGoiHBAkIABBiApqIiEgCSAAQeAOaiIHEDIgAEGwD2oiIiALIABBuA5qIg0QMiAAQdgPaiIVIA0gBxAyIABBqAtqIikgCSALEDIgAEHQCmogAEHQD2oiIykCADcCACAAQcgKaiAAQcgPaiIkKQIANwIAIABBwApqIABBwA9qIiUpAgA3AgAgAEG4CmogAEG4D2oiJikCADcCACAAQeAKaiAAQeAPaiIWKQIANwIAIABB6ApqIABB6A9qIhcpAgA3AgAgAEHwCmogAEHwD2oiGikCADcCACAAQfgKaiAAQfgPaiIbKQIANwIAIAAgACkCsA83ArAKIAAgACkC2A83AtgKIABBoAtqIABByAtqKQIANwIAIABBmAtqIABBwAtqKQIANwIAIABBkAtqIABBuAtqKQIANwIAIABBiAtqIABBsAtqKQIANwIAIAAgACkCqAs3AoALIAkgISBTED8gHCAJIAcQMiAAQYgPaiIdIAsgDRAyICIgDSAHEDIgFSAJIAsQMiAOIABBqA9qIh4pAgA3AgAgESAAQaAPaiIfKQIANwIAIBIgAEGYD2oiICkCADcCACATIABBkA9qIicpAgA3AgAgFCAmKQIANwIAIBggJSkCADcCACAQICQpAgA3AgAgGSAjKQIANwIAIAAgACkCiA83AvAMIAAgACkCsA83ApgNIABB4A1qIiggGykCADcCACAAQdgNaiIqIBopAgA3AgAgAEHQDWoiPiAXKQIANwIAIABByA1qIj8gFikCADcCACAAIAApAtgPNwLADSATKAIAISwgEigCACEtIBEoAgAhLiAOKAIAIS8gACgCyAwhMCAAKALwDCExIAAoAswMITIgACgC9AwhMyAAKALQDCE0IAAoAtQMIUcgACgC/AwhSCAAKALYDCE1IAAoAtwMITYgACgChA0hNyAAKALgDCE4IAAoAuQMITkgACgCjA0hOiAAKALoDCE7IAAgACgC7AwgACgClA1qNgLMCyAAIC8gO2o2AsgLIAAgOSA6ajYCxAsgACAuIDhqNgLACyAAIDYgN2o2ArwLIAAgLSA1ajYCuAsgACBHIEhqNgK0CyAAICwgNGo2ArALIAAgMiAzajYCrAsgACAwIDFqNgKoCyAAQdALaiIsIABB8AxqIi0gHBCLASAAQZgMaiIuIBkpAgA3AgAgAEGQDGoiLyAQKQIANwIAIABBiAxqIjAgGCkCADcCACAAQYAMaiIxIBQpAgA3AgAgACAAKQKYDTcC+AsgFSAAQcANaiIyQYjbwQAQMiAAQcAMaiIzIBspAgA3AgAgAEG4DGoiNCAaKQIANwIAIABBsAxqIkcgFykCADcCACAAQagMaiJIIBYpAgA3AgAgACAAKQLYDzcCoAwgKyApQaAB/AoAACAJICEgKxA/IBwgCSAHEDIgHSALIA0QMiAiIA0gBxAyIBUgCSALEDIgDiAeKQIANwIAIBEgHykCADcCACASICApAgA3AgAgEyAnKQIANwIAIBQgJikCADcCACAYICUpAgA3AgAgECAkKQIANwIAIBkgIykCADcCACAAIAApAogPNwLwDCAAIAApArAPNwKYDSAoIBspAgA3AgAgKiAaKQIANwIAID4gFykCADcCACA/IBYpAgA3AgAgACAAKQLYDzcCwA0gEygCACErIBIoAgAhNSARKAIAITYgDigCACE3IAAoAsgMITggACgC8AwhOSAAKALMDCE6IAAoAvQMITsgACgC0AwhQCAAKALUDCFBIAAoAvwMIUIgACgC2AwhQyAAKALcDCFEIAAoAoQNIUUgACgC4AwhSyAAKALkDCFOIAAoAowNIVAgACgC6AwhWCAAIAAoAuwMIAAoApQNajYCzAsgACA3IFhqNgLICyAAIE4gUGo2AsQLIAAgNiBLajYCwAsgACBEIEVqNgK8CyAAIDUgQ2o2ArgLIAAgQSBCajYCtAsgACArIEBqNgKwCyAAIDogO2o2AqwLIAAgOCA5ajYCqAsgLCAtIBwQiwEgLiAZKQIANwIAIC8gECkCADcCACAwIBgpAgA3AgAgMSAUKQIANwIAIAAgACkCmA03AvgLIBUgMkGI28EAEDIgMyAbKQIANwIAIDQgGikCADcCACBHIBcpAgA3AgAgSCAWKQIANwIAIAAgACkC2A83AqAMID0gKUGgAfwKAAAgCSAhID0QPyAcIAkgBxAyIB0gCyANEDIgIiANIAcQMiAVIAkgCxAyIA4gHikCADcCACARIB8pAgA3AgAgEiAgKQIANwIAIBMgJykCADcCACAUICYpAgA3AgAgGCAlKQIANwIAIBAgJCkCADcCACAZICMpAgA3AgAgACAAKQKIDzcC8AwgACAAKQKwDzcCmA0gKCAbKQIANwIAICogGikCADcCACA+IBcpAgA3AgAgPyAWKQIANwIAIAAgACkC2A83AsANIBMoAgAhKyASKAIAIT0gESgCACE1IA4oAgAhNiAAKALIDCE3IAAoAvAMITggACgCzAwhOSAAKAL0DCE6IAAoAtAMITsgACgC1AwhQCAAKAL8DCFBIAAoAtgMIUIgACgC3AwhQyAAKAKEDSFEIAAoAuAMIUUgACgC5AwhSyAAKAKMDSFOIAAoAugMIVAgACAAKALsDCAAKAKUDWo2AswLIAAgNiBQajYCyAsgACBLIE5qNgLECyAAIDUgRWo2AsALIAAgQyBEajYCvAsgACA9IEJqNgK4CyAAIEAgQWo2ArQLIAAgKyA7ajYCsAsgACA5IDpqNgKsCyAAIDcgOGo2AqgLICwgLSAcEIsBIC4gGSkCADcCACAvIBApAgA3AgAgMCAYKQIANwIAIDEgFCkCADcCACAAIAApApgNNwL4CyAVIDJBiNvBABAyIDMgGykCADcCACA0IBopAgA3AgAgRyAXKQIANwIAIEggFikCADcCACAAIAApAtgPNwKgDCBGIClBoAH8CgAAIAkgISBGED8gHCAJIAcQMiAdIAsgDRAyICIgDSAHEDIgFSAJIAsQMiAOIB4pAgA3AgAgESAfKQIANwIAIBIgICkCADcCACATICcpAgA3AgAgFCAmKQIANwIAIBggJSkCADcCACAQICQpAgA3AgAgGSAjKQIANwIAIAAgACkCiA83AvAMIAAgACkCsA83ApgNICggGykCADcCACAqIBopAgA3AgAgPiAXKQIANwIAID8gFikCADcCACAAIAApAtgPNwLADSATKAIAISsgEigCACE9IBEoAgAhRiAOKAIAITUgACgCyAwhNiAAKALwDCE3IAAoAswMITggACgC9AwhOSAAKALQDCE6IAAoAtQMITsgACgC/AwhQCAAKALYDCFBIAAoAtwMIUIgACgChA0hQyAAKALgDCFEIAAoAuQMIUUgACgCjA0hSyAAKALoDCFOIAAgACgC7AwgACgClA1qNgLMCyAAIDUgTmo2AsgLIAAgRSBLajYCxAsgACBEIEZqNgLACyAAIEIgQ2o2ArwLIAAgPSBBajYCuAsgACA7IEBqNgK0CyAAICsgOmo2ArALIAAgOCA5ajYCrAsgACA2IDdqNgKoCyAsIC0gHBCLASAuIBkpAgA3AgAgLyAQKQIANwIAIDAgGCkCADcCACAxIBQpAgA3AgAgACAAKQKYDTcC+AsgFSAyQYjbwQAQMiAzIBspAgA3AgAgNCAaKQIANwIAIEcgFykCADcCACBIIBYpAgA3AgAgACAAKQLYDzcCoAwgTCApQaAB/AoAACAJICEgTBA/IBwgCSAHEDIgHSALIA0QMiAiIA0gBxAyIBUgCSALEDIgDiAeKQIANwIAIBEgHykCADcCACASICApAgA3AgAgEyAnKQIANwIAIBQgJikCADcCACAYICUpAgA3AgAgECAkKQIANwIAIBkgIykCADcCACAAIAApAogPNwLwDCAAIAApArAPNwKYDSAoIBspAgA3AgAgKiAaKQIANwIAID4gFykCADcCACA/IBYpAgA3AgAgACAAKQLYDzcCwA0gEygCACErIBIoAgAhPSARKAIAIUYgDigCACFMIAAoAsgMITUgACgC8AwhNiAAKALMDCE3IAAoAvQMITggACgC0AwhOSAAKALUDCE6IAAoAvwMITsgACgC2AwhQCAAKALcDCFBIAAoAoQNIUIgACgC4AwhQyAAKALkDCFEIAAoAowNIUUgACgC6AwhSyAAIAAoAuwMIAAoApQNajYCzAsgACBLIExqNgLICyAAIEQgRWo2AsQLIAAgQyBGajYCwAsgACBBIEJqNgK8CyAAID0gQGo2ArgL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JAAMAQtBASAEEN0CAAsgAigCACACKAIEIAIoAgggAigCDCACQRBqJAALqgIBBX8jAEEQayIDJAAjAEFAaiICJAACfwJAIAFBIEYEQCACQRhqIABBGGopAAA3AwAgAkEQaiAAQRBqKQAANwMAIAJBCGogAEEIaikAADcDACACIAApAAA3AwAgAkEgaiACEIMCQSBBARCBAyIEDQFBAUEgEN0CAAtByKnAAEEaEOMCIQVBASEGQQAgAUUNARogACABQQEQ9wJBAAwBCyAEIAIpACA3AAAgBEEYaiACQThqKQAANwAAIARBEGogAkEwaikAADcAACAEQQhqIAJBKGopAAA3AAAgAhDXASAAQSBBARD3AkEgCyEAIAMgBjYCDCADIAU2AgggAyAANgIEIAMgBDYCACACQUBrJAAgAygCACADKAIEIAMoAgggAygCDCADQRBqJAALMAEBfwJAIAAoAgAiAEF/Rg0AIAAgACgCBEEBayIBNgIEIAENACAAQdgCQQgQ9wILCyQAAkAgACABEN4CRQ0AIAAEQCAAIAEQgQMiAUUNAQsgAQ8LAAulCQISfwJ+IwBBMGsiDyQAIA9BDGohECMAQbABayICJAAgAkE4akIANwMAIAJBMGpCADcDACACQShqQgA3AwAgAkEgakIANwMAIAJBGGpCADcDACACQRBqQgA3AwAgAkEIakIANwMAIAJCADcDAEEBIQcDQCACIAVqIgMgAygCACABIAVqIgMtAAByIANBAWotAABBCHRyIANBAmotAABBEHRyIANBA2otAABBGHRyNgIAIAVBBGohBSAHQRBJIAdBAWohBw0ACyACQcgAaiIBIAIoAggiCkEGdCACKAIEIgZBGnZyQf////8BcTYCACACQdAAaiIFIAIoAhAiC0EMdCACKAIMIgxBFHZyQf////8BcTYCACACQdgAaiIHIAIoAhgiBEESdCACKAIUIg1BDnZyQf////8BcTYCACACQeAAaiIDIAIoAiAiDkEYdCACKAIcIghBCHZyQf////8BcTYCACACIAIoAgAiCUH/////AXE2AkAgAiAGQQN0IAlBHXZyQf////8BcTYCRCACIAxBCXQgCkEXdnJB/////wFxNgJMIAIgDUEPdCALQRF2ckH/////AXE2AlQgAiAIQRV0IARBC3ZyQf////8BcTYCXCACQYgBaiIKIAIoAjwiBEENdjYCACACQfAAaiINIAIoAigiCEEBdCACKAIkIgZBH3ZyQf////8BcTYCACACQfgAaiILIAIoAjAiCUEHdCACKAIsIhFBGXZyQf////8BcTYCACACQYABaiIMIAIoAjgiEkENdCACKAI0IhNBE3ZyQf////8BcTYCACACIAZBAnZB/////wFxNgJsIAIgBkEbdCAOQQV2ckH/////AXE2AmggAiARQQR0IAhBHHZyQf////8BcTYCdCACIBNBCnQgCUEWdnJB/////wFxNgJ8IAIgBEEQdCASQRB2ckH/////AXE2AoQBIAJBjAFqIgYgAkFAa0H02MEAECsgAyACQawBaiIEKAIANgIAIAcgAkGkAWoiDikCADcDACAFIAJBnAFqIggpAgA3AwAgASACQZQBaiIJKQIANwMAIAIgAikCjAE3A0AgBiACQegAakHQ2MEAECsgCiAEKAIANgIAIAwgDikCADcDACALIAgpAgA3AwAgDSAJKQIAIhQ3AwAgAiACKQKMASIVNwNoIAIgAigCQCAVp2oiBEH/////AXE2AowBIAIgAigCRCACKAJsIARBHXZqaiIEQf////8BcTYCkAEgAiABKAIAIBSnIARBHXZqaiIBQf////8BcTYClAEgAiACKAJMIAIoAnQgAUEddmpqIgFB/////wFxNgKYASACIAUoAgAgCygCACABQR12amoiAUH/////AXE2ApwBIAIgAigCVCACKAJ8IAFBHXZqaiIBQf////8BcTYCoAEgAiAHKAIAIAwoAgAgAUEddmpqIgFB/////wFxNgKkASACIAIoAlwgAigChAEgAUEddmpqIgFB/////wFxNgKoASACIAMoAgAgCigCACABQR12ampB/////wFxNgKsASAQIAZBmNnBABB5IAJBsAFqJAAgACAQEJIBIA9BMGokAAv8AQICfwF+IwBBEGsiAiQAIAJBATsBDCACIAE2AgggAiAANgIEIwBBEGsiASQAIAJBBGoiACkCACEEIAEgADYCDCABIAQ3AgQjAEEQayIAJAAgAUEEaiIBKAIAIgIoAgwhAwJAAkACQAJAIAIoAgQOAgABAgsgAw0BQQEhAkEAIQMMAgsgAw0AIAIoAgAiAigCBCEDIAIoAgAhAgwBCyAAQYCAgIB4NgIAIAAgATYCDCAAQeybxAAgASgCBCABKAIIIgAtAAggAC0ACRDZAQALIAAgAzYCBCAAIAI2AgAgAEHQm8QAIAEoAgQgASgCCCIALQAIIAAtAAkQ2QEAC9IeAhd/A34jAEEQayIUJAAjAEHw0wBrIgwkACAMEL4CNgIMIwBBoNMAayIBJAAgAUEYaiIRQgA3AwAgAUEQaiIDQgA3AwAgAUEIaiICQgA3AwAgAUIANwMAIAxBDGoiFiIIIAFBIBDTASABQbglaiARKQMANwMAIAFBsCVqIAMpAwA3AwAgAUGoJWogAikDADcDACABIAEpAwA3A6AlIAFB+DFqIhFCADcDACABQfAxaiIDQgA3AwAgAUHoMWoiAkIANwMAIAFCADcD4DEgCCABQeAxaiIJQSAQ0wEgAUHYGGogESkDADcBACABQdAYaiADKQMANwEAIAFByBhqIAIpAwA3AQAgASABKQPgMTcBwBgjAEGAhQFrIgAkACAAQQM6AMgkIABByABqIgpBAEHIAfwLACAAQZgCaiICQQBByQD8CwAgAEEYNgKQAiAAIAo2AuhIIAIgAUGgJWpBICAAQejIAGoiCBCAASAAIAo2AuhIIAIgAEHIJGoiEUEBIAgQgAEgCCAKQaAC/AoAACAAQaD5AGoiAkIANwMAIABBmPkAaiIHQgA3AwAgAEGQ+QBqIhVCADcDACAAQYj5AGoiD0IANwMAIABBgPkAaiIGQgA3AwAgAEH4+ABqIhNCADcDACAAQfD4AGoiEkIANwMAIABCADcD6HggCCAAQbjKAGogAEHo+ABqIgMQogEgAEGg7QBqIg4gAikDADcDACAAQZjtAGoiAiAHKQMANwMAIABBkO0AaiIHIBUpAwA3AwAgAEGI7QBqIhUgDykDADcDACAAQYDtAGogBikDACIYNwMAIABB+OwAaiATKQMAIhk3AwAgAEHw7ABqIBIpAwAiFzcDACAAQdAwaiIPIBc3AwAgAEHYMGoiBiAZNwMAIABB4DBqIhMgGDcDACAAIAApA+h4Ihc3A+hsIAAgFzcDyDAgAEGAMWoiEiAOKQMANwMAIABB+DBqIg4gAikDADcDACAAQfAwaiICIAcpAwA3AwAgACAVKQMANwPoMCAAQSBqIgcgEykDADcDACAAQRhqIhUgBikDADcDACAAQRBqIhMgDykDADcDACAAIAApA8gwNwMIIABBQGsgEikDADcDACAAQThqIA4pAwA3AwAgAEEwaiACKQMANwMAIAAgACkD6DA3AyggAEEAOgDIMCAAQQA2AkggACAAQQhqIg42AvBIIAAgCjYC7EggACAAQcgwaiIPNgLoSCADIAgQlQEgAEHo7ABqIgIgA0GADPwKAAAgCiACQYAM/AoAACAIIApBgAz8CgAAIABBADoA6IQBIABBATYCyCQgACAONgLQMCAAIBE2AswwIAAgAEHohAFqIgY2AsgwIAMgDxCVASACIANBgAz8CgAAIAogAkGADPwKAAAgAEHo1ABqIhIgCkGADPwKAAAgAEEAOgDohAEgAEECNgLIJCAAIA42AtAwIAAgETYCzDAgACAGNgLIMCADIA8QlQEgAiADQYAM/AoAACAKIAJBgAz8CgAAIABB6OAAaiAKQYAM/AoAACAKIAhBgCT8CgAAIABBADoA6HggACAAQShqIg42AuxIIAAgAzYC6EggESAIEDcgAEEDOgDoeCAAIA42AuxIIAAgAzYC6EggDyAIEDcgAiARIA8QjAEgAyAPIABByDxqIg4QjAEgACARNgLshAEgACACNgLwhAEgACAKNgLohAEgCCAGED4gAEKAgICAMDcC+IQBIAAgBjYC9IQBIAAgEjYC7IQBIAAgAzYC8IQBIAAgCDYC6IQBIA4gBhByIAkgAkGADPwKAAAgAEHgyABqIAcpAwA3AQAgAEHYyABqIBUpAwA3AQAgAEHQyABqIBMpAwA3AQAgACAAKQMINwHISCAJQYAMaiAOQaAM/AoAACAAQYCFAWokACABIAlBgAz8CgAAIAFBwCVqIgMgAUHgPWpBoAz8CgAAIAFB7DFqIAMgAUHAMWoQRSABQZA7aiABQdgxaikBADcCACABQYg7aiABQdAxaikBADcCACABQYA7aiABQcgxaikBADcCACABQSA2AvQ6IAFCATcC7DogAUGACTYC6DEgAUIBNwLgMSABIAEpAcAxNwL4OiABQYDKAGoiAiAJEIEBIAFBgD5qIAIQSSAJIANBoAz8CgAAIAFBgAxqIgIgCUHADPwKAAAgAyACQYAE/AoAACABQcApaiABQYAQakGABPwKAAAgAUHALWogAUGAFGpBgAT8CgAAIAkgA0GADPwKAAAgAUHoPWogAUGIGGopAQA3AQAgAUHwPWogAUGQGGopAQA3AQAgAUH4PWogAUGYGGopAQA3AQAgAUGIJWogAUGoGGopAQA3AQAgAUGQJWogAUGwGGopAQA3AQAgAUGYJWogAUG4GGopAQA3AQAgASABKQGAGDcB4D0gASABKQGgGDcBgCUgAUHgGGoiAyAJQaAM/AoAACAMQbAlaiIRIgIgAUHgGPwKAAAgAkHgGGogA0HADPwKAAAgAUGg0wBqJAAgDEEQaiIQIBFB4Bj8CgAAIAxB8BhqIgIgDEGQPmpBwAz8CgAAIAxBvCVqIAIgDEHwJGoQRSAMQeAuaiAMQYglaikBADcCACAMQdguaiAMQYAlaikBADcCACAMQdAuaiAMQfgkaikBADcCACAMQSA2AsQuIAxCATcCvC4gDEGACTYCuCUgDEIBNwKwJSAMIAwpAfAkNwLILiAMQdDKAGoiFSAREIEBIwBB8C5rIgQkACAEQYQcaiITIBAgEEGADGoiAhBFIARBrAlqIhIgAiAQQYAYahBFIARB0BJqIBBBmBhqKQEANwIAIARByBJqIBBBkBhqKQEANwIAIARBwBJqIBBBiBhqKQEANwIAIARBIDYCtBIgBEIBNwKsEiAEQYAJNgKoCSAEQgE3AqAJIAQgECkBgBg3ArgSIAQgBEGgCWoiABCBASAEQZAlaiAEQaAJ/AoAACAEQaAJNgKMJSAEQgE3AoQlIARBgAk2AoAcIARCATcC+BsjAEGgEmsiDSQAIARB+BtqIgEiA0EMaiEJIAMoApQJIQcgAygCCCEGIAMoApAJIQ8gAygCBCELIAMoAgAhAgJAAkACQAJAAkAgAygCjAkiDkEBcQRAIANBmAlqIQggAiEDA0ACfwJAIANBAXFFBEAgAiEDDAELQQAhAyAGIAtGDQAgCSALaiEKIAtBAWohC0EBDAELIAcgD0YNBCAIIA9qIQogD0EBaiEPIAMhAkEACyEDIAUgDWogCi0AADoAACAFQQFqIgVBoBJHDQALDAELIAJBAXFFIAYgC0ZyDQEgDSAJIAtqLQAAOgAAIAMgC2ohCSALIAZrIgJBAWohCiACQQJqIQgDQCAFIApqRQ0CIAUgDWoiA0EBaiAFIAlqIgJBDWotAAA6AAAgBUGeEkcEQCAFIAhqRQ0DIANBAmogAkEOai0AADoAACAFQQJqIQUMAQsLIAUgC2pBAmohC0EBIQILIBIgDUGgEvwKAAAgAkEBcSAGIAtHcUUgDkEBcUUgByAPRnJxRQ0CIA1BoBJqJAAgBEHgG2ogEEGoGGopAQA3AgAgBEHoG2ogEEGwGGopAQA3AgAgBEHwG2ogEEG4GGopAQA3AgAgBEEgNgLUGyAEQgE3AswbIARBoBI2AqgJIARCATcCoAkgBCAQKQGgGDcC2BsjAEHAEmsiDSQAIABBDGohDiAAKAK0EiESIAAoAgghBiAAKAKwEiEHIAAoAgQhCyAAKAIAIQICQCAAKAKsEiIKQQFxBEAgAEG4EmohCEEAIQUgAiEDA0ACfwJAIANBAXFFBEAgAiEDDAELQQAhAyAGIAtGDQAgCyAOaiEJIAtBAWohC0EBDAELIAcgEkYNBCAHIAhqIQkgB0EBaiEHIAMhAkEACyEDIAUgDWogCS0AADoAACAFQQFqIgVBwBJHDQALDAELIAJBAXFFIAYgC0ZyDQEgDSALIA5qLQAAOgAAIAAgC2ohCCALQQFqIQMgCyAGa0EBaiECQQAhBQNAIAIgBWpFDQIgBSANaiIOQQFqIAUgCGoiCUENai0AADoAACAGIANBAWpGDQIgDkECaiAJQQ5qLQAAOgAAIAYgA0ECakYNAiAOQQNqIAlBD2otAAA6AAAgA0EDaiEDIAVBA2oiBUG/EkcNAAtBASECIAUgC2pBAWohCwsgEyANQcAS/AoAACACQQFxIAYgC0dxIApBAXEgByASR3FyDQIgDUHAEmokACAEQdguaiAQQcgYaikBADcCACAEQeAuaiAQQdAYaikBADcCACAEQeguaiAQQdgYaikBADcCACAEQSA2AswuIARCATcCxC4gBEHAEjYCgBwgBEIBNwL4GyAEIBApAcAYNwLQLiMAQeASayIHJAAgAUEMaiEJIAEoAtQSIRIgASgCCCETIAEoAtASIQ0gASgCBCEGIAEoAgAhAwJAIAEoAswSIg5BAXEEQCABQdgSaiEIQQAhBSADIQIDQAJ/AkAgAkEBcUUEQCADIQIMAQtBACECIAYgE0YNACAGIAlqIQogBkEBaiEGQQEMAQsgDSASRg0EIAggDWohCiANQQFqIQ0gAiEDQQALIQIgBSAHaiAKLQAAOgAAIAVBAWoiBUHgEkcNAAsMAQsgA0EBcUUgBiATRnINASAHIAYgCWotAAA6AAAgASAGaiEJIAYgE2siAkEBaiEKIAJBAmohCEEAIQUDQCAFIApqRQ0CIAUgB2oiA0EBaiAFIAlqIgJBDWotAAA6AAAgBUHeEkcEQCAFIAhqRQ0DIANBAmogAkEOai0AADoAACAFQQJqIQUMAQsLIAUgBmpBAmohBkEBIQMLIBEgB0HgEvwKAAAgA0EBcSAGIBNHcUUgDkEBcUUgDSASRnJxRQRAIAdBADYCECAHQQE2AgQgB0GsgMAANgIAIAdCBDcCCCAHQaikwAAQxAIACyAHQeASaiQAIARB8C5qJAAMAQtByKTAAEEvQYilwAAQiwIAC0GAHEEBEIEDIgMEQCADIBFB4BL8CgAAIAwoAgwhAiADQeASaiAVQaAJ/AoAACACIAIoAgBBAWsiAjYCACACRQRAIBYQwQILIBRBADYCDCAUQoAcNwIEIBQgAzYCACAMQfDTAGokAAwCC0EBQYAcEN0CAAsgDUEANgIQIA1BATYCBCANQayAwAA2AgAgDUIENwIIIA1BqKTAABDEAgALIBQoAgAgFCgCBCAUKAIIIBQoAgwgFEEQaiQAC+seAhp/CH4jAEEQayIJJAAjAEGwoARrIgskACALEL4CNgIMIwBB8MUIayIAJAAgAEEgaiISQgA3AwAgAEEYaiITQgA3AwAgAEEQaiIUQgA3AwAgAEIANwMIIAtBDGoiFSAAQQhqIgNBIBDTASAAQfiEBGoiAkEAQcgB/AsAIABByIYEakEAQYkB/AsAIABCADcD8IQEIABBGDYCwIYEIABBkMQCaiIHIgQgAEHwhARqIgEgA0EgEFEgASAEQfC3wABBARBRIABBKGoiBiABQfC3wABBARBRIABBiIUEaiIDQgA3AwAgAEGAhQRqIgVCADcDACACQgA3AwAgAEIANwPwhAQgBiABQSAQgwEgAEGoA2oiDCADKQMANwMAIABBoANqIg8gBSkDADcDACAAQZgDaiIQIAIpAwA3AwAgACAAKQPwhAQ3A5ADIABBqIUEaiIIQgA3AwAgAEGghQRqIgpCADcDACAAQZiFBGoiDUIANwMAIABBkIUEaiIOQgA3AwAgA0IANwMAIAVCADcDACACQgA3AwAgAEIANwPwhAQgAUHAABCDASAAQegDaiAIKQMANwMAIABB4ANqIAopAwA3AwAgAEHYA2ogDSkDADcDACAAQdADaiAOKQMANwMAIABByANqIAMpAwA3AwAgAEHAA2ogBSkDADcDACAAQbgDaiACKQMANwMAIAAgACkD8IQENwOwAyADQgA3AwAgBUIANwMAIAJCADcDACAAQgA3A/CEBCABQSAQgwEaIABBiARqIhYgAykDADcDACAAQYAEaiIXIAUpAwA3AwAgAEH4A2oiGCACKQMANwMAIAAgACkD8IQENwPwAyAAQSA2AvSEBCAAIABBkANqNgLwhAQgAEGQBGoiCiIGIAEQhQEgAEEANgKQxAIgAEEAOgDwhQcgAEHAADYC+IQEIAAgAEHwhQdqIgI2AvyEBCAAIABBsANqIgU2AvSEBCAAIAQ2AvCEBCAAQZCEAWoiDSIDIAEQkQEgAEEAOgDwhQcgAEEENgKQxAIgAEHAADYC+IQEIAAgAjYC/IQEIAAgBTYC9IQEIAAgBDYC8IQEIABBkKQBaiIOIgUgARCRASABIAMgBRBxIAAgAzYClMQCIAAgATYCmMQCIAAgBjYCkMQCIABBkMQBaiIDIAQQayABIAMgAEGQ5AFqIgYQcCAAQoCAgIDAADcCoMQCIAAgAzYCnMQCIAAgAEHwpARqIgg2ApTEAiAAIAU2ApjEAiAAIAE2ApDEAiAGIAQQNCABIAYQ1QEgAEHwhQhqIgMgAUGACPwKAAAgAEHwpQhqIgQgAEHwjARqIgVBgAj8CgAAIAIgA0GACPwKAAAgByAEQYAI/AoAACABIABBkOwBahDVASADIAFBgAj8CgAAIAQgBUGACPwKAAAgAEHwjQdqIANBgAj8CgAAIABBkMwCaiAEQYAI/AoAACABIABBkPQBahDVASADIAFBgAj8CgAAIAQgBUGACPwKAAAgAEHwlQdqIANBgAj8CgAAIABBkNQCaiAEQYAI/AoAACABIABBkPwBahDVASADIAFBgAj8CgAAIAQgBUGACPwKAAAgAEHwnQdqIANBgAj8CgAAIABBkNwCaiAEQYAI/AoAACABIAJBgCD8CgAAIAggB0GAIPwKAAAgAEGQhAJqIhkgAUGAIPwKAAAgAEGQpAJqIhEgCEGAIPwKAAAgASAKQYAI/AoAACAFIABBkAxqQYAI/AoAACAAQfCUBGoiBiAAQZAUakGACPwKAAAgAEHwnARqIgggAEGQHGpBgAj8CgAAIAQgAUGAIPwKAAAgAyAEQYAg/AoAACACIANBgCD8CgAAIAcgAkGAIPwKAAAgASAAQZAkakGACPwKAAAgBSAAQZAsakGACPwKAAAgBiAAQZA0akGACPwKAAAgCCAAQZA8akGACPwKAAAgBCABQYAg/AoAACADIARBgCD8CgAAIAIgA0GAIPwKAAAgAEGQ5AJqIAJBgCD8CgAAIAEgAEGQxABqQYAI/AoAACAFIABBkMwAakGACPwKAAAgBiAAQZDUAGpBgAj8CgAAIAggAEGQ3ABqQYAI/AoAACAEIAFBgCD8CgAAIAMgBEGAIPwKAAAgAiADQYAg/AoAACAAQZCEA2ogAkGAIPwKAAAgASAAQZDkAGpBgAj8CgAAIAUgAEGQ7ABqQYAI/AoAACAGIABBkPQAakGACPwKAAAgCCAAQZD8AGpBgAj8CgAAIAQgAUGAIPwKAAAgAyAEQYAg/AoAACACIANBgCD8CgAAIABBkKQDaiACQYAg/AoAACAAQfSEBGogB0GAgAH8CgAAIABBATYC8IQEIABBADoA8IUHIABBiKYIaiAMKQMANwMAIABBgKYIaiAPKQMANwMAIABB+KUIaiAQKQMANwMAIAAgACkDkAM3A/ClCCAHIAQgGSABIAIQZyAAQfDFBmoiBiANQYAg/AoAACAAQfDlBmoiBSAOQYAg/AoAACACIApBgIAB/AoAACAAQfDkBWogBiAFEHEgAyAFIAIQcSAEIBEgBxBxIABByMUGaiAMKQMANwIAIABBwMUGaiAPKQMANwIAIABBuMUGaiAQKQMANwIAIABB2MUGaiAYKQMANwIAIABB4MUGaiAXKQMANwIAIABB6MUGaiAWKQMANwIAIABB+MQGaiAAQZiEBGopAgA3AgAgAEGAxQZqIABBoIQEaikCADcCACAAQYjFBmogAEGohARqKQIANwIAIABBkMUGaiAAQbCEBGopAgA3AgAgAEGYxQZqIABBuIQEaikCADcCACAAQaDFBmogAEHAhARqKQIANwIAIABBqMUGaiAAQciEBGopAgA3AgAgACAAKQOQAzcCsMUGIAAgACkD8AM3AtDFBiAAIAApApCEBDcC8MQGIABB8IQFaiANQYAg/AoAACAAQfCkBWogDkGAIPwKAAAgAEHwxAVqIBFBgCD8CgAAIABB8IQGaiADQYAg/AoAACAAQfCkBmogBEGAIPwKAAAgASACQYCAAfwKAAAgC0EQaiICQYDBAmogB0HgwAH8CgAAIAJB+IEEaiASKQMANwAAIAJB8IEEaiATKQMANwAAIAJB6IEEaiAUKQMANwAAIAIgACkDCDcA4IEEIAIgAUGAwQL8CgAAIABB8MUIaiQAIwBBgBNrIgAkACAAIAJBgIABaiACQYCgAWoiARBOIABBgANqIAEgAkGAwAFqIgUQTiAAQYAGaiEQIwBBoCJrIgEkAAJAAkACQCACQYDgAWoiDCAFRg0AIAFB/x82ApAiIAFBgCA2AsQTIAEgBTYCkBogASAFQYAIaiIKNgKUGiABIAFBkCJqIg82ApwaIAEgAUHEE2oiBDYCmBogAUEEaiINIgcgAUGQGmoiBhCvASABQegWaiIDIAcQywEgAUGkEGoiByADQaAD/AoAACABQYQNaiIIIAdBoAP8CgAAIAQgCEGgA/wKAAAgDSAEQaAD/AoAACAKIAxGDQAgAUH/HzYCiBogAUGAIDYCjBogASAFQYAQaiIONgKUIiABIAo2ApAiIAEgAUGIGmoiCjYCnCIgASABQYwaaiIRNgKYIiAGIA8QrwEgAyAGEMsBIAcgA0GgA/wKAAAgCCAHQaAD/AoAACAEIAhBoAP8CgAAIAFBpANqIARBoAP8CgAAIAwgDkYNACABQf8fNgKIGiABQYAgNgKMGiABIAVBgBhqIhI2ApQiIAEgDjYCkCIgASAKNgKcIiABIBE2ApgiIAYgDxCvASADIAYQywEgByADQaAD/AoAACAIIAdBoAP8CgAAIAQgCEGgA/wKAAAgAUHEBmogBEGgA/wKAAAgDCASRg0AIAFB/x82AogaIAFBgCA2AowaIAEgBUGAIGoiBTYClCIgASASNgKQIiABIAo2ApwiIAEgETYCmCIgBiAPEK8BIAMgBhDLASAHIANBoAP8CgAAIAggB0GgA/wKAAAgBCAIQaAD/AoAACABQeQJaiAEQaAD/AoAACAQIA1BgA38CgAAIAUgDEcNASABQaAiaiQADAILQcikwABBL0H4pMAAEIsCAAsgAUEFaiMAQbALayICJAAgAkH/HzYCCCACQYAgNgIMIAIgBTYCkAggAiAFQYAIajYClAggAiACQQhqNgKcCCACIAJBDGo2ApgIIAJBEGogAkGQCGoiAxCvASADQQBBoAP8CwBBgHghCQNAIAMgAkEQaiAJaiIEQYwIajUCACIaQhmIIARBkAhqNQIAIhtCDIiEIARBlAhqNQIAQgGGhCAEQZgIajUCAEIOhoQgBEGcCGo1AgBCG4aEIhw+AAggAyAEQYAIajUCACAEQYQIajUCAEINhoQgBEGICGo1AgBCGoaEIBpCJ4aEIBtCNIaENwAAIANBDGogHEIgiDwAACADQQ1qIQMgCUEgaiIJDQALIAJBkAhqQaAD/AoAACACQbALaiQAIAFBADYCFCABQQE2AgggAUGsgMAANgIEIAFCBDcCDCABQQRqQbikwAAQxAIACyACKQLAwAIhGiACKQLIwAIhGyACKQLQwAIhHCACKQLYwAIhHSACKQLgwAIhHiACKQLowAIhHyACKQLwwAIhICACKQL4wAIhISALQZCCBGoiBCIBQYAHaiAQQYAN/AoAACABICE3ADggASAgNwAwIAEgHzcAKCABIB43ACAgASAdNwAYIAEgHDcAECABIBs3AAggASAaNwAAIAEgAikAgMACNwBAIAFByABqIAJBiMACaikAADcAACABQdAAaiACQZDAAmopAAA3AAAgAUHYAGogAkGYwAJqKQAANwAAIAFB4ABqIAJBoMACaikAADcAACABQegAaiACQajAAmopAAA3AAAgAUHwAGogAkGwwAJqKQAANwAAIAFB+ABqIAJBuMACaikAADcAACABQYABaiAAQYAD/AoAACABQYAEaiAAQYADakGAA/wKAAAgAEGAE2okACALQZCWBGoiAyIBQSBqIAtBkMEDaiICIAJBgCBqEDkgASALQdCBBGoiAikAADcAACABIAIpAAg3AAggASACKQAQNwAQIAEgAikAGDcAGAJAQaAeQQEQgQMiAQRAIAEgBEGAFPwKAAAgCygCDCECIAFBgBRqIANBoAr8CgAAIAIgAigCAEEBayICNgIAIAJFBEAgFRDBAgsgCUEANgIMIAlCoB43AgQgCSABNgIAIAtBsKAEaiQADAELQQFBoB4Q3QIACyAJKAIAIAkoAgQgCSgCCCAJKAIMIAlBEGokAAv7AgELfyMAQRBrIgIkACMAQdAAayIAJAAgABC+AjYCDCAAQcgAaiIDQgA3AwAgAEFAayIEQgA3AwAgAEE4aiIFQgA3AwAgAEIANwMwIABBDGoiBiAAQTBqIgFBIBDTASAAQShqIgcgAykDADcDACAAQSBqIgggBCkDADcDACAAQRhqIgkgBSkDADcDACAAIAApAzA3AxAgASAAQRBqIgoQgwICQEHAAEEBEIEDIgEEQCABIAApAxA3AAAgASAAKQAwNwAgIAFBGGogBykDADcAACABQRBqIAgpAwA3AAAgAUEIaiAJKQMANwAAIAFBKGogBSkAADcAACABQTBqIAQpAAA3AAAgAUE4aiADKQAANwAAIAoQ1wEgACgCDCIDIAMoAgBBAWsiAzYCACADRQRAIAYQwQILIAJBADYCDCACQsAANwIEIAIgATYCACAAQdAAaiQADAELQQFBwAAQ3QIACyACKAIAIAIoAgQgAigCCCACKAIMIAJBEGokAAunAwEIfyMAQRBrIgMkACMAQdACayIAJAAgABC+AjYCDCAAQYgCaiICQgA3AwAgAEGAAmoiBUIANwMAIABB+AFqIgZCADcDACAAQgA3A/ABIABBDGoiByAAQfABaiIEQSAQ0wEgAEGQAmoiASAEEDsgAEEQaiIEIAEQrwIgARDUASAAQdgBaiAGKQMANwIAIABB4AFqIAUpAwA3AgAgAEHoAWogAikDADcCACAAIAApA/ABNwLQAQJAQcAAQQEQgQMiAQRAIAEgACkCEDcAICABIABB0AFqIgIpAAA3AAAgAUEYaiACQRhqKQAANwAAIAFBEGogAkEQaikAADcAACABQQhqIAJBCGopAAA3AAAgAUEoaiAAQRhqKQIANwAAIAFBMGogAEEgaikCADcAACABQThqIABBKGopAgA3AAAgBBDWASAAKAIMIgIgAigCAEEBayICNgIAIAJFBEAgBxDBAgsgA0EANgIMIANCwAA3AgQgAyABNgIAIABB0AJqJAAMAQtBAUHAABDdAgALIAMoAgAgAygCBCADKAIIIAMoAgwgA0EQaiQAC8IIAg1/A34jAEEQayIIJAAjAEEQayIGJAAgBkEEaiEOIwBBoAJrIgIkACACQShqIgVBAEHBAPwLACACQRhqQcCpwAApAwA3AwAgAkEQakG4qcAAKQMANwMAIAJBCGpBsKnAACkDADcDACACQgA3AyAgAkGoqcAAKQMANwMAAkAgASIDQcAATwRAIAIgA0EGdiIErTcDICACIAAgBBAcIANBP3EiBEUEQCAEIQMMAgsgBSAAIANBQHFqIAT8CgAAIAQhAwwBCyADRQ0AIAUgACAD/AoAAAsgAiADOgBoIAJB8ABqIAJB8AD8CgAAIAJBmAFqIgQgAi0A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IAAgAvwKAAALIAEhAgsgABBaCyACCwsQACAAKAIEIAAoAgggARBHCxAAIAAoAgAgACgCBCABEEcLEQAgASAAKAIAIAAoAgQQ5gILEwAgAEEoNgIEIABB8NTBADYCAAsTACAAQSg2AgQgAEGQisQANgIACxYAQfzXxAAgADYCAEH418QAQQE2AgALEQAgACgCBCAAKAIIIAEQjQMLEwAgAEGsnMQANgIEIAAgATYCAAsQACABIAAoAgAgACgCBBBiCxAAIAEoAgAgASgCBCAAEG4LEQEBfxCoASIBIAAlASYBIAELYQEBfwJAAkAgAEEEaygCACICQXhxIgNBBEEIIAJBA3EiAhsgAWpPBEAgAkEAIAMgAUEnaksbDQEgABBaDAILQbycxABBLkHsnMQAEKUCAAtB/JzEAEEuQaydxAAQpQIACwsOACAAKAIAJQEQFEEARwsPAEGox8QAQSsgABClAgALDgAgAUGkssAAQRoQ5gILDgAgAUHAscAAQREQ5gILDgAgAUHRscAAQRIQ5gILDgAgAUHjscAAQRMQ5gILDgAgAUH2scAAQRUQ5gILDgAgAUGLssAAQRkQ5gILDgAgAUHcu8AAQREQ5gILGgACfyABQQlPBEAgASAAEJQBDAELIAAQHgsLBwAgABCXAgsOACABQezlwABBBRDmAgsNACAAQYzswAAgARBuCw0AIABBlMHBACABEG4LCAAgACABECALDABBj5PEAEEyEBMACw0AIABBuJvEACABEG4LDAAgACABKQIANwMACw0AIABByKHEACABEG4LDgAgAUGcoMQAQQUQ5gILGgAgACABQcTbxAAoAgAiAEHfACAAGxEBAAALCgAgAiAAIAEQYgsNACAAQYyqxAAgARBuCw0AIAFB1tbEAEEYEGILDgAgAUG1wcEAQQgQ5gILDgAgAUGswcEAQQkQ5gILvQgBLX4CQCABQRlJBEAgAQRAQQAgAUEDdGshASAAKQPAASEQIAApA5gBIRwgACkDcCERIAApA0ghEiAAKQMgIR0gACkDuAEhHiAAKQOQASEfIAApA2ghAiAAKQNAIQ4gACkDGCEJIAApA7ABIQMgACkDiAEhEyAAKQNgIQogACkDOCEUIAApAxAhBSAAKQOoASEVIAApA4ABIQQgACkDWCEWIAApAzAhFyAAKQMIIQsgACkDoAEhDCAAKQN4IRggACkDUCENIAApAyghGSAAKQMAIRoDQCAMIBiFIA2FIBmFIBqFIgYgAyAThSAKhSAUhSAFhSIHQgGJhSIPIBeFIB4gH4UgAoUgDoUgCYUiCCAGQgGJhSIGIBCFIS4gDyAVhUICiSIgIA4gByAQIByFIBGFIBKFIB2FIhtCAYmFIgeFQjeJIiEgBSAEIBWFIBaFIBeFIAuFIg4gCEIBiYUiCIVCPokiIkJ/hYOFIRAgDkIBiSAbhSIFIBiFQimJIhsgBiARhUIniSIjQn+FgyAhhSEVIA8gFoVCCokiJCAHIB6FQjiJIiUgCCAThUIPiSImQn+Fg4UhEyAGIB2FQhuJIicgJCAFIBmFQiSJIihCf4WDhSEYIAUgDIVCEokiDCAIIBSFQgaJIikgCyAPhUIBiSIqQn+Fg4UhESAGIByFQgiJIisgAiAHhUIZiSIsQn+FgyAphSEWIAMgCIVCPYkiAiAGIBKFQhSJIgMgByAJhUIciSIJQn+Fg4UhEiAEIA+FQi2JIgQgCSACQn+Fg4UhDiAFIA2FQgOJIgsgAiAEQn+Fg4UhFCAEIAtCf4WDIAOFIRcgCyADQn+FgyAJhSEZIAcgH4VCFYkiAiAFIBqFIgMgLkIOiSIEQn+Fg4UhCSAIIAqFQiuJIgogBCACQn+Fg4UhBUIsiSINIAIgCkJ/hYOFIQsgAUGg08EAaikDACAKIA1Cf4WDhSADhSEaICggJ0J/hYMgJYUiDyEcIA0gA0J/hYMgBIUiBiEdICIgIEJ/hYMgG4UiByEeICcgJUJ/hYMgJoUiCCEfICogDEJ/hYMgK4UhAiAgIBtCf4WDICOFIQMgDCArQn+FgyAshSEKICYgJEJ/hYMgKIUhBCAjICFCf4WDICKFIQwgKiAsIClCf4WDhSENIAFBCGoiAQ0ACyAAIAw3A6ABIAAgGDcDeCAAIA03A1AgACAZNwMoIAAgFTcDqAEgACAENwOAASAAIBY3A1ggACAXNwMwIAAgCzcDCCAAIAM3A7ABIAAgEzcDiAEgACAKNwNgIAAgFDcDOCAAIAU3AxAgACAHNwO4ASAAIAg3A5ABIAAgAjcDaCAAIA43A0AgACAJNwMYIAAgEDcDwAEgACAPNwOYASAAIBE3A3AgACASNwNIIAAgBjcDICAAIBo3AwALDAELQaDTwQBBwQBB5NPBABClAgALCwkAIABBADYCAAtNAQF/IwBBMGsiASQAIAFBATYCDCABQeCnxAA2AgggAUIBNwIUIAEgAUEvaq1CgICAgJAPhDcDICABIAFBIGo2AhAgAUEIaiAAEMQCAAsIACAAJQEQCQsCAAsLi9MEOQBBgIDAAAvtNnRvbyBtYW55IGl0ZW1zIGluIGl0ZXJhdG9yIHRvIGZpdCBpbiBhcnJheQAAAAAQACoAAAAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9tYXAvZW50cnkucnMAL1VzZXJzL21hc2Fub3JrLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUtYWFyY2g2NC1hcHBsZS1kYXJ3aW4vbGliL3J1c3RsaWIvc3JjL3J1c3QvbGlicmFyeS9jb3JlL3NyYy9pdGVyL2FkYXB0ZXJzL3N0ZXBfYnkucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmFzZTY0LTAuMjIuMS9zcmMvZW5naW5lL2dlbmVyYWxfcHVycG9zZS9kZWNvZGVfc3VmZml4LnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2N1cnZlMjU1MTktZGFsZWstNC4xLjMvc3JjL3dpbmRvdy5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2dyaXN1LnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL21sLWRzYS0wLjAuNC9zcmMvbnR0LnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL21sLWRzYS0wLjAuNC9zcmMvaGludC5ycwBsaWJyYXJ5L2FsbG9jL3NyYy9mbXQucnMAbGlicmFyeS9jb3JlL3NyYy9udW0vZGl5X2Zsb2F0LnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3JhbmRfY2hhY2hhLTAuMy4xL3NyYy9ndXRzLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3JhbmRfY29yZS0wLjYuNC9zcmMvaW1wbHMucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvY3VydmUyNTUxOS1kYWxlay00LjEuMy9zcmMvZWR3YXJkcy5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L3N0ZC9zcmMvc3lzL3RocmVhZF9sb2NhbC9ub190aHJlYWRzLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3NlcmRlX2pzb24tMS4wLjE0OC9zcmMvZXJyb3IucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvaHlicmlkLWFycmF5LTAuMi4zL3NyYy9pdGVyLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2h5YnJpZC1hcnJheS0wLjMuMS9zcmMvaXRlci5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9zaWduYXR1cmUtMi4yLjAvc3JjL3NpZ25lci5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9jdXJ2ZTI1NTE5LWRhbGVrLTQuMS4zL3NyYy9zY2FsYXIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwtZHNhLTAuMC40L3NyYy9jcnlwdG8ucnMAL1VzZXJzL21hc2Fub3JrLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUtYWFyY2g2NC1hcHBsZS1kYXJ3aW4vbGliL3J1c3RsaWIvc3JjL3J1c3QvbGlicmFyeS9jb3JlL3NyYy9zdHIvcGF0dGVybi5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2RyYWdvbi5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9iaWdudW0ucnMAL1VzZXJzL21hc2Fub3JrLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUtYWFyY2g2NC1hcHBsZS1kYXJ3aW4vbGliL3J1c3RsaWIvc3JjL3J1c3QvbGlicmFyeS9hbGxvYy9zcmMvc3RyaW5nLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL21sLWRzYS0wLjAuNC9zcmMvc2FtcGxpbmcucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2Yvd2FzbS1iaW5kZ2VuLTAuMi4xMDYvc3JjL2V4dGVybnJlZi5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9uYXZpZ2F0ZS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9jaXBoZXItMC40LjQvc3JjL3N0cmVhbV9jb3JlLnJzAGxpYnJhcnkvY29yZS9zcmMvdW5pY29kZS9wcmludGFibGUucnMAL1VzZXJzL21hc2Fub3JrLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUtYWFyY2g2NC1hcHBsZS1kYXJ3aW4vbGliL3J1c3RsaWIvc3JjL3J1c3QvbGlicmFyeS9hbGxvYy9zcmMvY29sbGVjdGlvbnMvYnRyZWUvbm9kZS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9tbC1kc2EtMC4wLjQvc3JjL2VuY29kZS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmNvZGUucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmFzZTY0LTAuMjIuMS9zcmMvZW5naW5lL2dlbmVyYWxfcHVycG9zZS9kZWNvZGUucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2Yvc2VyZGVfanNvbi0xLjAuMTQ4L3NyYy9kZS5ycwBsaWJyYXJ5L2NvcmUvc3JjL2ZtdC9tb2QucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmFzZTY0LTAuMjIuMS9zcmMvZW5naW5lL2dlbmVyYWxfcHVycG9zZS9tb2QucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmFzZTY0LTAuMjIuMS9zcmMvZW5naW5lL21vZC5ycwBsaWJyYXJ5L2FsbG9jL3NyYy9yYXdfdmVjL21vZC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL21vZC5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9yYW5kLTAuOC41L3NyYy9ybmdzL3RocmVhZC5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9zZXJkZV9qc29uLTEuMC4xNDgvc3JjL3JlYWQucnMAL3J1c3QvZGVwcy9kbG1hbGxvYy0wLjIuMTAvc3JjL2RsbWFsbG9jLnJzAGxpYnJhcnkvc3RkL3NyYy9hbGxvYy5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9pdG9hLTEuMC4xNy9zcmMvbGliLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2dlbmVyaWMtYXJyYXktMC4xNC43L3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2Yva2VjY2FrLTAuMS41L3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmxvY2stYnVmZmVyLTAuMTAuNC9zcmMvbGliLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL21sLWRzYS0wLjAuNC9zcmMvbGliLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2pzLXN5cy0wLjMuODMvc3JjL2xpYi5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9vbmNlX2NlbGwtMS4yMS4zL3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwta2VtLTAuMi4xL3NyYy9hbGdlYnJhLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2Flcy0wLjguNC9zcmMvc29mdC9maXhzbGljZTMyLnJzAABdBRAAYwAAADkAAAAJAAAAwQUQAGMAAAA5AAAACQAAAGl0ZXJhdG9yIHNob3VsZCBoYXZlIGVub3VnaCBpdGVtcyB0byBmaWxsIGFycmF5AMEFEABjAAAANgAAABIAAABdBRAAYwAAADYAAAASAAAAYXNzZXJ0aW9uIGZhaWxlZDogdy4wIDw9IGIuMCB8fCB3LjAgPj0gKC1hKS4wAAAA4QoQAF8AAAA9AAAAFQAAAAAAAQABAAIAAA0AAAAAAQAADQAAAAABAP8MAA0ADQAAYBEQAGAAAACUAAAALwAAAH0BAAFBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsv/////////////////////////////////////////////////////////z7///8/NDU2Nzg5Ojs8Pf////////8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGf///////xobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIz/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1dlYi9BIENyeXB0byBXQVNNIHYwLjEuNSAoQUVTLUdDTSArIFgyNTUxOSArIEVkMjU1MTkgKyBNTC1LRU0tNzY4ICsgTUwtRFNBLTQ0ICsgU0hBMjU2L0hLREYpZ+YJaoWuZ7ty8248OvVPpX9SDlGMaAWbq9mDHxnN4FtJbnZhbGlkIHByaXZhdGUga2V5IGxlbmd0aEludmFsaWQgcHVibGljIGtleURlY3J5cHRpb24gZmFpbGVkAAAADAAAAB4PEABkAAAAPAIAAAkAAABJbnZhbGlkIGtleSBsZW5ndGhFbmNyeXB0aW9uIGZhaWxlZEludmFsaWQgc2lnbmF0dXJlIGRhdGFJbnZhbGlkIHNpZ25hdHVyZSBsZW5ndGhJbnZhbGlkIHB1YmxpYyBrZXkgbGVuZ3RoSEtERiBleHBhbnNpb24gZmFpbGVkY3JlYXRlZF9hdG5vbmNlY2FtcGFpZ25faWRrZW1rZGZhZWFkZW5hYmxlZHJlY2lwaWVudF9raWRyZWNpcGllbnRfeDI1NTE5cmVjaXBpZW50X3BxY2xheWVyMV9yZWZ3ZWJhX3ZlcnNpb25lbmNzdWl0ZXJlY2lwaWVudGVuY2Fwc3VsYXRlZGNpcGhlcnRleHRhdXRoX3RhZ2FhZGxheWVyMl9wbGFpbmxheWVyMl9zaWdfcGFkZGluZ2NsYXNzaWNhbHBxY2xheWVyMm1ldGFhbGdraWRzaWcwLjFFZDI1NTE5SW52YWxpZCBYMjU1MTkgcHVia2V5WDI1NTE5AABVERAACgAAAKABAAAXAAAAWDI1NTE5K01MLUtFTS03Njh3ZWJhLWwyL3Bya3dlYmEtbDIva2V5d2ViYS1sMi9pdkhQS0UtdjFIS0RGLVNIQTI1NkFFUy0yNTYtR0NNAABVERAACgAAAK4BAAAgAAAAAgAAAAQAAAAEAAAAAwAAAGNhbGxlZCBgUmVzdWx0Ojp1bndyYXAoKWAgb24gYW4gYEVycmAgdmFsdWUAVREQAAoAAACMAQAAMwAAAFUREAAKAAAAhAEAADwAAABVERAACgAAAHgBAAA2AAAASW52YWxpZCBjb25maWcgSlNPTjogAAAAeBcQABUAAABGYWlsZWQgdG8gc2VyaWFsaXplIGVudmVsb3BlOiAAAJgXEAAeAAAASW52YWxpZCBwYXlsb2FkIEpTT046IAAAwBcQABYAAABEZWNhcHN1bGF0aW9uIGZhaWxlZEludmFsaWQgY2lwaGVydGV4dCBsZW5ndGhJbnZhbGlkIEFBRCBlbmNvZGluZwAAAFUREAAKAAAA6AEAAA4AAABJbnZhbGlkIGVwaGVtZXJhbCBwdWJrZXlNaXNzaW5nIFBRQyBLRU0gZm9yIGVudmVsb3BlSW52YWxpZCBVVEYtOCBpbiBwbGFpbnRleHRBQUQgbWlzbWF0Y2gAAFUREAAKAAAA3wEAAEUAAABJbnZhbGlkIGVudmVsb3BlIEpTT046IACgGBAAFwAAAHN0cnVjdCBMMk1ldGFXYXNtc3RydWN0IEwyU3VpdGVXYXNtc3RydWN0IEwyQ29uZmlnV2FzbXN0cnVjdCBMMkVudmVsb3BlV2FzbXN0cnVjdCBMMkVuY2Fwc3VsYXRlZFdhc21zdHJ1Y3QgTGF5ZXIyRW5jcnlwdGVkV2FzbQAAUgkQAIMAAAAWAgAALwAAAGludGVybmFsIGVycm9yOiBlbnRlcmVkIHVucmVhY2hhYmxlIGNvZGUaDBAAYQAAAKAEAAAiAAAAGgwQAGEAAACWBAAAJgAAAGNyZWF0ZWRfYXRub25jZWNhbXBhaWduX2lkc3RydWN0IEwyTWV0YVdhc20gd2l0aCAzIGVsZW1lbnRzALIZEAAhAAAAAAAAAAgAAAAEAAAABAAAAGtlbWtkZmFlYWRzdHJ1Y3QgTDJTdWl0ZVdhc20gd2l0aCAzIGVsZW1lbnRz9hkQACIAAABlbmFibGVkcmVjaXBpZW50X2tpZHJlY2lwaWVudF94MjU1MTlyZWNpcGllbnRfcHFjbGF5ZXIxX3JlZndlYmFfdmVyc2lvbnN0cnVjdCBMMkNvbmZpZ1dhc20gd2l0aCA3IGVsZW1lbnRzAABnGhAAIwAAAGVuY3N1aXRlcmVjaXBpZW50ZW5jYXBzdWxhdGVkY2lwaGVydGV4dGF1dGhfdGFnYWFkc3RydWN0IEwyRW52ZWxvcGVXYXNtIHdpdGggNyBlbGVtZW50cwDGGhAAJQAAAGNsYXNzaWNhbHBxY3N0cnVjdCBMMkVuY2Fwc3VsYXRlZFdhc20gd2l0aCAyIGVsZW1lbnRzAAAAABsQACkAAABsYXllcjJtZXRhc3RydWN0IExheWVyMkVuY3J5cHRlZFdhc20gd2l0aCA0IGVsZW1lbnRzPhsQACoAQfi2wAALBQEAAAAFAEGIt8AACwUBAAAABgBBmLfAAAsFAQAAAAcAQai3wAALBQEAAAAIAEG4t8AACwUBAAAA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zQ3fIKpp1kSgaItU4GkMVshCrmkUao9retMZhElqcwZZSCDlf2oIpDctNO+zagqNhTgB6+hqTPCmhsElH2swVij0mHdTa7trMjF/VYhrqgZ//d5qvmsqZG9eywLzazU9CzZ+wydsggyOw120XWzRxziaupCSbMb5xkDpNMdsN7j4kCMC/Wwjc5s6ViEybetPQsmrqWZt5uOSuxZUnG1wzjs1jrTRbQzCisKxIQZuj3ItMx6qO26ZZ/zfUkpxbn+B+5fnnKVu32H6fSEE224sfbzulOIQb3acayo6G0VvlIMGtQhiem89EiRxRX2wb8wWbc2WnORvf1zIgLzDGXDPOX3QVRpQcEOInETrIIRwVKrDFSYpuXDplDSbb3PvcBHdAMElqCNxVhRBMS+SWHFrWZH9uraOcePXet40MsNx3I0ZFsL+93FT8Z+bcv4tctT2Q6EHv2JyifSUiclul3KrMfrre0rNcgtffHONTgJzzXZb0DDiNnOBVHIEvZpsc9B0xyK24KFzBFJ5q+NY1nOGpleWHO8LdBTI9t1xdUF0GHp0Vc7SdXSemNHqgUerdGP/wjKxDOF0PL9zf91PFXULr1Df1KNKdWdtkgtlpoB1wAh3Tv7PtHXxyhTi/QPqddb+TK1+QiB2jD6gWB5TVHYvTsju5WeJdrthemrfwb92FX2MoivZ83ZanC+Lds8od3CD+y1UA193JjK9nBRik3ewfuzDmTrId1ye5zRASf53+cIQIcjtMni481QpOqlneKUwqrOIk514Z15KcDV80ngB9lzMQhsHeYIzdH8T4jx5MaCoL0wNcnk9yJI7n5CmeU16dwrHNNx5cKyKZvygEXqMVy2AOwlGem+tOGCKi3t6ZWwjfDY3sXp/RywbBIXlel5Z9yFF5hp725c6NevPUHvSPYkC5gOFe0aNK4PfRLp7TDj7sQtr8HtfBnqezoUkfPaHGEZCp1l8+lTPa4kIkHw4KsPGqwrEfMf0c7hWDfl8+PGQZqxQL307lxrAa5JjfQo9IbAGd5h9TIwpXMiUzn2w95k5/RwDfpx1AIg85Dd+A5MAqkvdbX7iW0BKT6qiftpy0BzjVNd+kI8E5BsqDX+62YJuUTpCfymQI8rlyHZ/M3SsPB97rH+gyOuF88zhf////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAAAQACAAMABAAFAAYABwAIAAkA//////////////////8KAAsADAANAA4ADwD/////////////////////////////////////////////////////////////////////CgALAAwADQAOAA8A////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAQACAAMABAAFAAYABwAIAAkAD//////////////////6AAsADAANAA4ADwAP////////////////////////////////////////////////////////////////////+gALAAwADQAOAA8AD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8aDhAAYwAAALMBAAAaAAAAGg4QAGMAAAAAAgAAEwAAABoOEABjAAAABQIAADMAAAAaDhAAYwAAAAkCAAA+AAAAGg4QAGMAAAAPAgAAOgAAABoOEABjAAAAqwEAAD0AAAAaDhAAYwAAAKYBAABFAAAAGg4QAGMAAABcAgAAEwAAABoOEABjAAAAbgIAABkAAAAgYXQgbGluZSAAAAD4BBAAZAAAAPcBAAAhAAAA+AQQAGQAAAD7AQAADAAAACBjb2x1bW4g+AQQAGQAAAACAgAAIQAAAPgEEABkAAAACwIAACoAAAD4BBAAZAAAAA8CAAAsAAAA+AQQAGQAAAAUAgAACQAAACMAAAAMAAAABAAAACQAAAAlAAAAJgBB3OTAAAvFBwEAAAAnAAAAYSBEaXNwbGF5IGltcGxlbWVudGF0aW9uIHJldHVybmVkIGFuIGVycm9yIHVuZXhwZWN0ZWRseQAVCBAAbwAAAEsLAAAOAAAAUgcQAHMAAAA8BgAAFAAAAFIHEABzAAAAPAYAACEAAABSBxAAcwAAADAGAAAUAAAAUgcQAHMAAAAwBgAAIQAAAEVycm9yYXNzZXJ0aW9uIGZhaWxlZDogc2VsZi5pc19jaGFyX2JvdW5kYXJ5KG5ld19sZW4pRXJyb3IoLCBsaW5lOiAsIGNvbHVtbjogKQAAITMQAAYAAAAnMxAACAAAAC8zEAAKAAAAOTMQAAEAAABpbnZhbGlkIHR5cGU6ICwgZXhwZWN0ZWQgAAAAXDMQAA4AAABqMxAACwAAAEVPRiB3aGlsZSBwYXJzaW5nIGEgbGlzdEVPRiB3aGlsZSBwYXJzaW5nIGFuIG9iamVjdEVPRiB3aGlsZSBwYXJzaW5nIGEgc3RyaW5nRU9GIHdoaWxlIHBhcnNpbmcgYSB2YWx1ZWV4cGVjdGVkIGA6YGV4cGVjdGVkIGAsYCBvciBgXWBleHBlY3RlZCBgLGAgb3IgYH1gZXhwZWN0ZWQgaWRlbnRleHBlY3RlZCB2YWx1ZWV4cGVjdGVkIGAiYGludmFsaWQgZXNjYXBlaW52YWxpZCBudW1iZXJudW1i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dGlhbGl6ZSB0aHJlYWQtbG9jYWwgd2hpbGUgaXQgaXMgYmVpbmcgZHJvcHBlZAAArAURAD4AAAB1BBAAggAAAGsAAAANAAAARXJyb3JnZXRyYW5kb206IHRoaXMgdGFyZ2V0IGlzIG5vdCBzdXBwb3J0ZWRlcnJubzogZGlkIG5vdCByZXR1cm4gYSBwb3NpdGl2ZSB2YWx1ZXVuZXhwZWN0ZWQgc2l0dWF0aW9uU2VjUmFuZG9tQ29weUJ5dGVzOiBpT1MgU2VjdXJpdHkgZnJhbWV3b3JrIGZhaWx1cmVSdGxHZW5SYW5kb206IFdpbmRvd3Mgc3lzdGVtIGZ1bmN0aW9uIGZhaWx1cmVSRFJBTkQ6IGZhaWxlZCBtdWx0aXBsZSB0aW1lczogQ1BVIGlzc3VlIGxpa2VseVJEUkFORDogaW5zdHJ1Y3Rpb24gbm90IHN1cHBvcnRlZFdlYiBDcnlwdG8gQVBJIGlzIHVuYXZhaWxhYmxlQ2FsbGluZyBXZWIgQVBJIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgZmFpbGVkcmFuZFNlY3VyZTogVnhXb3JrcyBSTkcgbW9kdWxlIGlzIG5vdCBpbml0aWFsaXplZE5vZGUuanMgY3J5cHRvIENvbW1vbkpTIG1vZHVsZSBpcyB1bmF2YWlsYWJsZUNhbGxpbmcgTm9kZS5qcyBBUEkgY3J5cHRvLnJhbmRvbUZpbGxTeW5jIGZhaWxlZE5vZGUuanMgRVMgbW9kdWxlcyBhcmUgbm90IGRpcmVjdGx5IHN1cHBvcnRlZCwgc2VlIGh0dHBzOi8vZG9jcy5ycy9nZXRyYW5kb20jbm9kZWpzLWVzLW1vZHVsZS1zdXBwb3J0AAAAAAAABAAAAAQAAABJAAAAaW50ZXJuYWxfY29kZQAAAAAAAAAIAAAABAAAAEoAAABkZXNjcmlwdGlvbnVua25vd25fY29kZQAAAAAABAAAAAQAAABLAAAAb3NfZXJyb3JVbmtub3duIEVycm9yOiAAuAgRAA8AAABPUyBFcnJvcjogAADQCBEACgAAAGNyeXB0bwAACQYRADAGEQBWBhEAagYRAJwGEQDJBhEA+AYRABkHEQA2BxEAQZiSxAALMWMHEQCUBxEAwQcRAPEHEQAnAAAAJgAAABQAAAAyAAAALQAAAC8AAAAhAAAAHQAAAC0AQdSSxAALzQ0xAAAALQAAADAAAABlAAAAjCsRAJgrEQCkKxEAsCsRAKEQEABdAAAAFBoAAAEAAAByZXR1cm4gdGhpc2Nsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkTGF6eSBpbnN0YW5jZSBoYXMgcHJldmlvdXNseSBiZWVuIHBvaXNvbmVkAMEJEQAqAAAA/xAQAGAAAAAIAwAAGQAAAHJlZW50cmFudCBpbml0AAAEChEADgAAAP8QEABgAAAAegIAAA0AAADnCBAAagAAAH8AAAARAAAA5wgQAGoAAACMAAAAEQAAAHz9izJX5lf5At9Ev+NI569tXcvWLFDrY3hBpldxG4u5AQAAAAAAAABlbnRpdHkgbm90IGZvdW5kcGVybWlzc2lvbiBkZW5pZWRjb25uZWN0aW9uIHJlZnVzZWRjb25uZWN0aW9uIHJlc2V0aG9zdCB1bnJlYWNoYWJsZW5ldHdvcmsgdW5yZWFjaGFibGVjb25uZWN0aW9uIGFib3J0ZWRub3QgY29ubmVjdGVkYWRkcmVzcyBpbiB1c2VhZGRyZXNzIG5vdCBhdmFpbGFibGVuZXR3b3JrIGRvd25icm9rZW4gcGlwZWVudGl0eSBhbHJlYWR5IGV4aXN0c29wZXJhdGlvbiB3b3VsZCBibG9ja25vdCBhIGRpcmVjdG9yeWlzIGEgZGlyZWN0b3J5ZGlyZWN0b3J5IG5vdCBlbXB0eXJlYWQtb25seSBmaWxlc3lzdGVtIG9yIHN0b3JhZ2UgbWVkaXVtZmlsZXN5c3RlbSBsb29wIG9yIGluZGlyZWN0aW9uIGxpbWl0IChlLmcuIHN5bWxpbmsgbG9vcClzdGFsZSBuZXR3b3JrIGZpbGUgaGFuZGxlaW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJpbnZhbGlkIGRhdGF0aW1lZCBvdXR3cml0ZSB6ZXJvbm8gc3RvcmFnZSBzcGFjZXNlZWsgb24gdW5zZWVrYWJsZSBmaWxlcXVvdGEgZXhjZWVkZWRmaWxlIHRvbyBsYXJnZXJlc291cmNlIGJ1c3lleGVjdXRhYmxlIGZpbGUgYnVzeWRlYWRsb2NrY3Jvc3MtZGV2aWNlIGxpbmsgb3IgcmVuYW1ldG9vIG1hbnkgbGlua3NpbnZhbGlkIGZpbGVuYW1lYXJndW1lbnQgbGlzdCB0b28gbG9uZ29wZXJhdGlvbiBpbnRlcnJ1cHRlZHVuc3VwcG9ydGVkdW5leHBlY3RlZCBlbmQgb2YgZmlsZW91dCBvZiBtZW1vcnlpbiBwcm9ncmVzc290aGVyIGVycm9ydW5jYXRlZ29yaXplZCBlcnJvcm9wZXJhdGlvbiBzdWNjZXNzZnVsbWVtb3J5IGFsbG9jYXRpb24gb2YgIGJ5dGVzIGZhaWxlZAB1DREAFQAAAIoNEQANAAAAqQ4QABgAAABkAQAACQAAAGIAAAAMAAAABAAAAGMAAABkAAAAZQAAAAAAAAAIAAAABAAAAGYAAABnAAAAaAAAAGkAAABqAAAAEAAAAAQAAABrAAAAbAAAAG0AAABuAAAAIChvcyBlcnJvciApAQAAAAAAAAAIDhEACwAAABMOEQABAAAAAAAAAAgAAAAEAAAAbwAAAGFzc2VydGlvbiBmYWlsZWQ6IHBzaXplID49IHNpemUgKyBtaW5fb3ZlcmhlYWQAAH4OEAAqAAAAsQQAAAkAAABhc3NlcnRpb24gZmFpbGVkOiBwc2l6ZSA8PSBzaXplICsgbWF4X292ZXJoZWFkAAB+DhAAKgAAALcEAAANAAAAYgAAAAwAAAAEAAAAcAAAABAAAAARAAAAEgAAABAAAAAQAAAAEwAAABIAAAANAAAADgAAABUAAAAMAAAACwAAABUAAAAVAAAADwAAAA4AAAATAAAAJgAAADgAAAAZAAAAFwAAAAwAAAAJAAAACgAAABAAAAAXAAAADgAAAA4AAAANAAAAFAAAAAgAAAAbAAAADgAAABAAAAAWAAAAFQAAAAsAAAAWAAAADQAAAAsAAAALAAAAEwAAAHQKEQCEChEAlQoRAKcKEQC3ChEAxwoRANoKEQDsChEA+QoRAAcLEQAcCxEAKAsRADMLEQBICxEAXQsRAGwLEQB6CxEAjQsRALMLEQDrCxEABAwRABsMEQAnDBEAMAwRADoMEQBKDBEAYQwRAG8MEQB9DBEAigwRAJ4MEQCmDBEAwQwRAM8MEQDfDBEA9QwRAAoNEQAVDREAKw0RADgNEQBDDREATg0RAEVycm9yAEGsoMQAC8ASAQAAAHEAAABhIGZvcm1hdHRpbmcgdHJhaXQgaW1wbGVtZW50YXRpb24gcmV0dXJuZWQgYW4gZXJyb3Igd2hlbiB0aGUgdW5kZXJseWluZyBzdHJlYW0gZGlkIG5vdAAACgMQABgAAACKAgAADgAAAGNhcGFjaXR5IG92ZXJmbG93AAAAnBARABEAAAByDRAAIAAAABwAAAAFAAAAcgAAAAwAAAAEAAAAcwAAAHQAAAB1AAAAAHAABwAtAQEBAgECAQFICzAVEAFlBwIGAgIBBCMBHhtbCzoJCQEYBAEJAQMBBSsDOwkqGAEgNwEBAQQIBAEDBwoCHQE6AQEBAgQIAQkBCgIaAQICOQEEAgQCAgMDAR4CAwELAjkBBAUBAgQBFAIWBgEBOgEBAgEECAEHAwoCHgE7AQEBDAEJASgBAwE3AQEDBQMBBAcCCwIdAToBAgIBAQMDAQQHAgsCHAI5AgEBAgQIAQkBCgIdAUgBBAECAwEBCAFRAQIHDAhiAQIJCwdJAhsBAQEBATcOAQUBAgULASQJAWYEAQYBAgICGQIEAxAEDQECAgYBDwEAAwAEHAMdAh4CQAIBBwgBAgsJAS0DAQF1AiIBdgMEAgkBBgPbAgIBOgEBBwEBAQECCAYKAgEwLgIMFAQwCgQDJgkMAiAEAgY4AQECAwEBBTgIAgKYAwENAQcEAQYBAwLGQAABwyEAA40BYCAABmkCAAQBCiACUAIAAQMBBAEZAgUBlwIaEg0BJggZCwEBLAMwAQIEAgICASQBQwYCAgICDAEIAS8BMwEBAwICBQIBASoCCAHuAQIBBAEAAQAQEBAAAgAB4gGVBQADAQIFBCgDBAGlAgAEQQUAAk0GRgsxBHsBNg8pAQICCgMxBAICBwE9AyQFAQg+AQwCNAkBAQgEAgFfAwIEBgECAZ0BAwgVAjkCAQEBAQwBCQEOBwMFQwECBgEBAgEBAwQDAQEOAlUIAgMBARcBUQECBgEBAgEBAgEC6wECBAYCAQIbAlUIAgEBAmoBAQECCGUBAQECBAEFAAkBAvUBCgQEAZAEAgIEASAKKAYCBAgBCQYCAy4NAQLGAQEDAQHJBwEGAQFSFgIHAQIBAnoGAwEBAgEHAQFIAgMBAQEAAgsCNAUFAxcBAAEGDwAMAwMABTsHAAE/BFEBCwIAAgAuAhcABQMGCAgCBx4ElAMANwQyCAEOARYFAQ8ABwERAgcBAgEFZAGgBwABPQQABP4C8wEC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";

// src/core/wasm_core.ts
var initialized = false;
async function initWasm(source) {
  if (initialized)
    return;
  if (source) {
    await weba_crypto_wasm_default(source);
  } else if (typeof process !== "undefined" && process.versions && process.versions.node) {
    const fs = await import("node:fs");
    const path = await Promise.resolve().then(() => (init_path(), exports_path));
    const wasmPath = path.join(import.meta.dirname, "wasm_bindings/weba_crypto_wasm_bg.wasm");
    const wasmBuffer = fs.readFileSync(wasmPath);
    await weba_crypto_wasm_default(wasmBuffer);
  } else {
    throw new Error("WASM source must be provided in browser environment");
  }
  initialized = true;
  console.log(`WASM Crypto Initialized: ${get_version()}`);
}
async function initWasmFromB64() {
  if (initialized)
    return;
  const binary2 = atob(WASM_BINARY_B64);
  const bytes = new Uint8Array(binary2.length);
  for (let i2 = 0;i2 < binary2.length; i2++) {
    bytes[i2] = binary2.charCodeAt(i2);
  }
  await initWasm(bytes);
}
function x25519GetPublicKey(privateKey) {
  if (!initialized)
    throw new Error("WASM not initialized");
  return x25519_get_public_key(privateKey);
}
function hkdfSha256(ikm, salt, info, length) {
  if (!initialized)
    throw new Error("WASM not initialized");
  return hkdf_sha256_wasm(ikm, salt || new Uint8Array(0), info, length);
}

// src/form/client/l2crypto.ts
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
async function ensureWasm() {
  await initWasmFromB64();
}
async function deriveKeyPairFromPrf(prfKey) {
  await ensureWasm();
  const info = new TextEncoder().encode("weba-l2/user-x25519");
  const seed = hkdfSha256(prfKey, undefined, info, 32);
  const publicKey = x25519GetPublicKey(seed);
  return { publicKey, privateKey: seed };
}
class ReplayGuard {
  seenNonces = new Set;
  store;
  constructor(store) {
    this.store = store;
  }
  async checkAndMark(nonce) {
    if (this.store) {
      if (await this.store.has(nonce)) {
        return false;
      }
      await this.store.add(nonce);
      return true;
    }
    if (this.seenNonces.has(nonce)) {
      return false;
    }
    this.seenNonces.add(nonce);
    return true;
  }
  async reset() {
    if (this.store) {
      await this.store.reset();
    }
    this.seenNonces.clear();
  }
}

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
    const { h: h2, l } = fromBig(lst[i2], le);
    [Ah[i2], Al[i2]] = [h2, l];
  }
  return [Ah, Al];
}
var rotlSH = (h2, l, s) => h2 << s | l >>> 32 - s;
var rotlSL = (h2, l, s) => l << s | h2 >>> 32 - s;
var rotlBH = (h2, l, s) => l << s - 32 | h2 >>> 64 - s;
var rotlBL = (h2, l, s) => h2 << s - 32 | l >>> 64 - s;

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
var swap32IfBE = isLE ? (u2) => u2 : byteSwap32;
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

// node_modules/@noble/hashes/sha3.js
var _0n = BigInt(0);
var _1n = BigInt(1);
var _2n = BigInt(2);
var _7n = BigInt(7);
var _256n = BigInt(256);
var _0x71n = BigInt(113);
var SHA3_PI = [];
var SHA3_ROTL = [];
var _SHA3_IOTA = [];
for (let round = 0, R2 = _1n, x2 = 1, y2 = 0;round < 24; round++) {
  [x2, y2] = [y2, (2 * x2 + 3 * y2) % 5];
  SHA3_PI.push(2 * (5 * y2 + x2));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n;
  for (let j2 = 0;j2 < 7; j2++) {
    R2 = (R2 << _1n ^ (R2 >> _7n) * _0x71n) % _256n;
    if (R2 & _2n)
      t ^= _1n << (_1n << BigInt(j2)) - _1n;
  }
  _SHA3_IOTA.push(t);
}
var IOTAS = split(_SHA3_IOTA, true);
var SHA3_IOTA_H = IOTAS[0];
var SHA3_IOTA_L = IOTAS[1];
var rotlH = (h2, l, s) => s > 32 ? rotlBH(h2, l, s) : rotlSH(h2, l, s);
var rotlL = (h2, l, s) => s > 32 ? rotlBL(h2, l, s) : rotlSL(h2, l, s);
function keccakP(s, rounds = 24) {
  const B2 = new Uint32Array(5 * 2);
  for (let round = 24 - rounds;round < 24; round++) {
    for (let x2 = 0;x2 < 10; x2++)
      B2[x2] = s[x2] ^ s[x2 + 10] ^ s[x2 + 20] ^ s[x2 + 30] ^ s[x2 + 40];
    for (let x2 = 0;x2 < 10; x2 += 2) {
      const idx1 = (x2 + 8) % 10;
      const idx0 = (x2 + 2) % 10;
      const B0 = B2[idx0];
      const B1 = B2[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B2[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B2[idx1 + 1];
      for (let y2 = 0;y2 < 50; y2 += 10) {
        s[x2 + y2] ^= Th;
        s[x2 + y2 + 1] ^= Tl;
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
    for (let y2 = 0;y2 < 50; y2 += 10) {
      for (let x2 = 0;x2 < 10; x2++)
        B2[x2] = s[y2 + x2];
      for (let x2 = 0;x2 < 10; x2++)
        s[y2 + x2] ^= ~B2[(x2 + 2) % 10] & B2[(x2 + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B2);
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
function isPowerOfTwo(x2) {
  checkU32(x2);
  return (x2 & x2 - 1) === 0 && x2 !== 0;
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
    const j2 = reverseBits(i2, bits);
    if (i2 < j2) {
      const tmp = values[i2];
      values[i2] = values[j2];
      values[j2] = tmp;
    }
  }
  return values;
}
var FFTCore = (F, coreOpts) => {
  const { N: N2, roots, dit, invertButterflies = false, skipStages = 0, brp = true } = coreOpts;
  const bits = log2(N2);
  if (!isPowerOfTwo(N2))
    throw new Error("FFT: Polynomial size should be power of two");
  const isDit = dit !== invertButterflies;
  return (values) => {
    if (values.length !== N2)
      throw new Error("FFT: wrong Polynomial length");
    if (dit && brp)
      bitReversalInplace(values);
    for (let i2 = 0, g2 = 1;i2 < bits - skipStages; i2++) {
      const s = dit ? i2 + 1 + skipStages : bits - i2;
      const m = 1 << s;
      const m2 = m >> 1;
      const stride = N2 >> s;
      for (let k2 = 0;k2 < N2; k2 += m) {
        for (let j2 = 0, grp = g2++;j2 < m2; j2++) {
          const rootPos = invertButterflies ? dit ? N2 - grp : grp : j2 * stride;
          const i0 = k2 + j2;
          const i1 = k2 + j2 + m2;
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
function copyBytes(bytes) {
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
    encode: (u2) => {
      if (u2.length !== vecLen)
        throw new Error(`vecCoder.encode: wrong length=${u2.length}. Expected: ${vecLen}`);
      const res = new Uint8Array(bytesLen);
      for (let i2 = 0, pos = 0;i2 < u2.length; i2++) {
        const b = c.encode(u2[i2]);
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
  const { newPoly, N: N2, Q: Q2, F, ROOT_OF_UNITY, brvBits, isKyber } = opts;
  const mod = (a, modulo = Q2) => {
    const result = a % modulo | 0;
    return (result >= 0 ? result | 0 : modulo + result | 0) | 0;
  };
  const smod = (a, modulo = Q2) => {
    const r = mod(a, modulo) | 0;
    return (r > modulo >> 1 ? r - modulo | 0 : r) | 0;
  };
  function getZettas() {
    const out = newPoly(N2);
    for (let i2 = 0;i2 < N2; i2++) {
      const b = reverseBits(i2, brvBits);
      const p = BigInt(ROOT_OF_UNITY) ** BigInt(b) % BigInt(Q2);
      out[i2] = Number(p) | 0;
    }
    return out;
  }
  const nttZetas = getZettas();
  const field = {
    add: (a, b) => mod((a | 0) + (b | 0)) | 0,
    sub: (a, b) => mod((a | 0) - (b | 0)) | 0,
    mul: (a, b) => mod((a | 0) * (b | 0)) | 0,
    inv: (_a) => {
      throw new Error("not implemented");
    }
  };
  const nttOpts = {
    N: N2,
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
        r[i2] = mod(F * r[i2]);
      return r;
    }
  };
  const bitsCoder = (d, c) => {
    const mask = getMask(d);
    const bytesLen = d * (N2 / 8);
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
        const r = newPoly(N2);
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
  return { mod, smod, nttZetas, NTT, bitsCoder };
};
var createXofShake = (shake) => (seed, blockLen) => {
  if (!blockLen)
    blockLen = shake.blockLen;
  const _seed = new Uint8Array(seed.length + 2);
  _seed.set(seed);
  const seedLen = seed.length;
  const buf = new Uint8Array(blockLen);
  let h2 = shake.create({});
  let calls = 0;
  let xofs = 0;
  return {
    stats: () => ({ calls, xofs }),
    get: (x2, y2) => {
      _seed[seedLen + 0] = x2;
      _seed[seedLen + 1] = y2;
      h2.destroy();
      h2 = shake.create({}).update(_seed);
      calls++;
      return () => {
        xofs++;
        return h2.xofInto(buf);
      };
    },
    clean: () => {
      h2.destroy();
      cleanBytes(buf, _seed);
    }
  };
};
var XOF128 = /* @__PURE__ */ createXofShake(shake128);

// node_modules/@noble/post-quantum/ml-kem.js
/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */
var N2 = 256;
var Q2 = 3329;
var F = 3303;
var ROOT_OF_UNITY = 17;
var { mod, nttZetas, NTT, bitsCoder } = genCrystals({
  N: N2,
  Q: Q2,
  F,
  ROOT_OF_UNITY,
  newPoly: (n) => new Uint16Array(n),
  brvBits: 7,
  isKyber: true
});
var PARAMS = {
  512: { N: N2, Q: Q2, K: 2, ETA1: 3, ETA2: 2, du: 10, dv: 4, RBGstrength: 128 },
  768: { N: N2, Q: Q2, K: 3, ETA1: 2, ETA2: 2, du: 10, dv: 4, RBGstrength: 192 },
  1024: { N: N2, Q: Q2, K: 4, ETA1: 2, ETA2: 2, du: 11, dv: 5, RBGstrength: 256 }
};
var compress = (d) => {
  if (d >= 12)
    return { encode: (i2) => i2, decode: (i2) => i2 };
  const a = 2 ** (d - 1);
  return {
    encode: (i2) => ((i2 << d) + Q2 / 2) / Q2,
    decode: (i2) => i2 * Q2 + a >>> d
  };
};
var polyCoder = (d) => bitsCoder(d, compress(d));
function polyAdd(a, b) {
  for (let i2 = 0;i2 < N2; i2++)
    a[i2] = mod(a[i2] + b[i2]);
}
function polySub(a, b) {
  for (let i2 = 0;i2 < N2; i2++)
    a[i2] = mod(a[i2] - b[i2]);
}
function BaseCaseMultiply(a0, a1, b0, b1, zeta) {
  const c0 = mod(a1 * b1 * zeta + a0 * b0);
  const c1 = mod(a0 * b1 + a1 * b0);
  return { c0, c1 };
}
function MultiplyNTTs(f, g2) {
  for (let i2 = 0;i2 < N2 / 2; i2++) {
    let z = nttZetas[64 + (i2 >> 1)];
    if (i2 & 1)
      z = -z;
    const { c0, c1 } = BaseCaseMultiply(f[2 * i2 + 0], f[2 * i2 + 1], g2[2 * i2 + 0], g2[2 * i2 + 1], z);
    f[2 * i2 + 0] = c0;
    f[2 * i2 + 1] = c1;
  }
  return f;
}
function SampleNTT(xof) {
  const r = new Uint16Array(N2);
  for (let j2 = 0;j2 < N2; ) {
    const b = xof();
    if (b.length % 3)
      throw new Error("SampleNTT: unaligned block");
    for (let i2 = 0;j2 < N2 && i2 + 3 <= b.length; i2 += 3) {
      const d1 = (b[i2 + 0] >> 0 | b[i2 + 1] << 8) & 4095;
      const d2 = (b[i2 + 1] >> 4 | b[i2 + 2] << 4) & 4095;
      if (d1 < Q2)
        r[j2++] = d1;
      if (j2 < N2 && d2 < Q2)
        r[j2++] = d2;
    }
  }
  return r;
}
function sampleCBD(PRF, seed, nonce, eta) {
  const buf = PRF(eta * N2 / 4, seed, nonce);
  const r = new Uint16Array(N2);
  const b32 = u32(buf);
  let len = 0;
  for (let i2 = 0, p = 0, bb = 0, t0 = 0;i2 < b32.length; i2++) {
    let b = b32[i2];
    for (let j2 = 0;j2 < 32; j2++) {
      bb += b & 1;
      b >>= 1;
      len += 1;
      if (len === eta) {
        t0 = bb;
        bb = 0;
      } else if (len === 2 * eta) {
        r[p++] = mod(t0 - bb);
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
  const { K: K2, PRF, XOF, HASH512, ETA1, ETA2, du, dv } = opts;
  const poly1 = polyCoder(1);
  const polyV = polyCoder(dv);
  const polyU = polyCoder(du);
  const publicCoder = splitCoder("publicKey", vecCoder(polyCoder(12), K2), 32);
  const secretCoder = vecCoder(polyCoder(12), K2);
  const cipherCoder = splitCoder("ciphertext", vecCoder(polyU, K2), polyV);
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
      seedDst[32] = K2;
      const seedHash = HASH512(seedDst);
      const [rho, sigma] = seedCoder.decode(seedHash);
      const sHat = [];
      const tHat = [];
      for (let i2 = 0;i2 < K2; i2++)
        sHat.push(NTT.encode(sampleCBD(PRF, sigma, i2, ETA1)));
      const x2 = XOF(rho);
      for (let i2 = 0;i2 < K2; i2++) {
        const e = NTT.encode(sampleCBD(PRF, sigma, K2 + i2, ETA1));
        for (let j2 = 0;j2 < K2; j2++) {
          const aji = SampleNTT(x2.get(j2, i2));
          polyAdd(e, MultiplyNTTs(aji, sHat[j2]));
        }
        tHat.push(e);
      }
      x2.clean();
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
      for (let i2 = 0;i2 < K2; i2++)
        rHat.push(NTT.encode(sampleCBD(PRF, seed, i2, ETA1)));
      const x2 = XOF(rho);
      const tmp2 = new Uint16Array(N2);
      const u2 = [];
      for (let i2 = 0;i2 < K2; i2++) {
        const e1 = sampleCBD(PRF, seed, K2 + i2, ETA2);
        const tmp = new Uint16Array(N2);
        for (let j2 = 0;j2 < K2; j2++) {
          const aij = SampleNTT(x2.get(i2, j2));
          polyAdd(tmp, MultiplyNTTs(aij, rHat[j2]));
        }
        polyAdd(e1, NTT.decode(tmp));
        u2.push(e1);
        polyAdd(tmp2, MultiplyNTTs(tHat[i2], rHat[i2]));
        cleanBytes(tmp);
      }
      x2.clean();
      const e2 = sampleCBD(PRF, seed, 2 * K2, ETA2);
      polyAdd(e2, NTT.decode(tmp2));
      const v = poly1.decode(msg);
      polyAdd(v, e2);
      cleanBytes(tHat, rHat, tmp2, e2);
      return cipherCoder.encode([u2, v]);
    },
    decrypt: (cipherText, privateKey) => {
      const [u2, v] = cipherCoder.decode(cipherText);
      const sk = secretCoder.decode(privateKey);
      const tmp = new Uint16Array(N2);
      for (let i2 = 0;i2 < K2; i2++)
        polyAdd(tmp, MultiplyNTTs(sk[i2], NTT.encode(u2[i2])));
      polySub(v, NTT.decode(tmp));
      cleanBytes(tmp, sk, u2);
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
      const ek = KPKESecretCoder.encode(KPKESecretCoder.decode(copyBytes(eke)));
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
var BUILD_TIME = typeof window !== "undefined" && window.__WEBA_BUILD_TIME__ ? window.__WEBA_BUILD_TIME__ : "";
function formatBuildStamp(value) {
  if (!value)
    return "Build: dev";
  return `Build: ${value.replace("T", " ").replace(".000Z", "Z")}`;
}
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
      btn_load_file: "Load File",
      preview: "Preview",
      btn_preview_form: "Form",
      btn_preview_agg: "Aggregator"
    },
    ja: {
      md_def: "定義 (Markdown)",
      btn_download: "ダウンロード",
      btn_load_file: "ファイル読込",
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
  window.__WEBA_BUILD_TIME__ = BUILD_TIME;
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
  const buildEl = document.getElementById("build-stamp");
  if (buildEl) {
    buildEl.textContent = formatBuildStamp(BUILD_TIME);
    buildEl.title = BUILD_TIME ? `Built at ${BUILD_TIME}` : "Build time not available";
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
    const keyPair = await deriveKeyPairFromPrf(prfKey);
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
    const isMarkdown = file.name.toLowerCase().endsWith(".md");
    if (isMarkdown) {
      const editor = getEditor();
      if (editor) {
        editor.value = text;
        window.setPreviewMode("form");
        updatePreview();
        alert("Markdown loaded.");
      }
      input.value = "";
      return;
    }
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
