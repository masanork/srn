window.__WEBA_BUILD_TIME__='2025-12-29T21:41:10Z';
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
var WASM_BINARY_B64 = "AGFzbQEAAAABiAMyYAJ/fwF/YAJ/fwBgA39/fwF/YAN/f38AYAF/AGAABH9/f39gAX8Bf2AEf39/fwBgBX9/f39/AGAAAX9gBH9/f38Bf2ABbwFvYAFvAX9gBX9/f35/AGAGf39/f39/AGAFf39/f38Bf2AEf39/fwR/f39/YAADf39/YAJ/fwFvYAd/f39/f39/AGAAAn9/YAJvbwBgAABgBn9/f39/fwF/YAl/f39/f39/f38AYAh/f39/f39/fwR/f39/YAd/f39/f39/BH9/f39gBn9/f39/fwN/f39gAn9/BH9/f39gAAFvYAN/f28AYAF/AW9gA29/fwFvYAJvbwFvYANvb28Bb2ACfH8Bf2AEf39/fgBgAn5/AX9gCX9/f39/f35+fgBgC39/f39/f39/f39/AX9gBH9+fn4AYAp/f39/f39/f39/BH9/f39gBn9/f39/fwR/f39/YAJ/fwJ/f2AFf39+f38AYAR/fn9/AGAFf398f38AYAR/fH9/AGAFf399f38AYAR/fX9/AAKKCRsDd2JnHV9fd2JnX2NyeXB0b181NzRlNzhhZDhiMTNiNjVmAAsDd2JnHl9fd2JnX3Byb2Nlc3NfZGMwZmJhY2M3YzFjMDZmNwALA3diZx9fX3diZ192ZXJzaW9uc19jMDFkZmQ0NzIyYTg4MTY1AAsDd2JnG19fd2JnX25vZGVfOTA1ZDNlMjUxZWRmZjhhMgALA3diZx5fX3diZ19yZXF1aXJlXzYwY2M3NDdhNmJjNTIxNWEAHQN3YmcfX193YmdfbXNDcnlwdG9fYTYxYWViMzVhMjRjMTMyOQALA3diZyVfX3diZ19yYW5kb21GaWxsU3luY19hYzA5ODhhYmEzMjU0MjkwABUDd2JnJl9fd2JnX2dldFJhbmRvbVZhbHVlc19iOGY1ZGJkNWYzOTk1YTllABUDd2JnIl9fd2JnX25ld19ub19hcmdzX2NiMTM4Zjc3Y2Y2MTUxZWUAEgN3YmcdX193YmdfbGVuZ3RoXzIyYWMyM2VhZWM5ZDgwNTMADAN3YmcnX193YmdfcHJvdG90eXBlc2V0Y2FsbF9kZmU5Yjc2NmNkYzFmMWZkAB4Dd2JnJl9fd2JnX25ld193aXRoX2xlbmd0aF9hYTVlYWY0MWQzNTIzNWU1AB8Dd2JnH19fd2JnX3N1YmFycmF5Xzg0NWYyZjViY2U3ZDA2MWEAIAN3YmcyX193Ymdfc3RhdGljX2FjY2Vzc29yX0dMT0JBTF9USElTXzYwY2YwMmRiNGRlOGUxYzEACQN3YmcbX193YmdfY2FsbF9hYmI0ZmY0NmNlMzhiZTQwACEDd2JnK19fd2JnX3N0YXRpY19hY2Nlc3Nvcl9TRUxGXzA4ZjVhNzRjNjk3MzkyNzQACQN3YmctX193Ymdfc3RhdGljX2FjY2Vzc29yX0dMT0JBTF83NjllNmI2NWQ2NTU3MzM1AAkDd2JnLV9fd2JnX3N0YXRpY19hY2Nlc3Nvcl9XSU5ET1dfYTg5MjRiMjZhYTkyZDAyNAAJA3diZxtfX3diZ19jYWxsXzMwMjAxMzZmN2EyZDZlNDQAIgN3YmcnX193YmdfX193YmluZGdlbl90aHJvd19kZDI0NDE3ZWQzNmZjNDZlAAEDd2JnK19fd2JnX19fd2JpbmRnZW5faXNfb2JqZWN0X2NlNzc0ZjM0OTA2OTIzODYADAN3YmcrX193YmdfX193YmluZGdlbl9pc19zdHJpbmdfNzA0ZWY5YzhmYzEzMTAzMAAMA3diZy1fX3diZ19fX3diaW5kZ2VuX2lzX2Z1bmN0aW9uXzhkNDAwYjhiMWFmOTc4Y2QADAN3YmcuX193YmdfX193YmluZGdlbl9pc191bmRlZmluZWRfZjZiOTVlYWI1ODllMDI2OQAMA3diZx9fX3diaW5kZ2VuX2luaXRfZXh0ZXJucmVmX3RhYmxlABYDd2JnIF9fd2JpbmRnZW5fY2FzdF8yMjQxYjZhZjRjNGIyOTQxABIDd2JnIF9fd2JpbmRnZW5fY2FzdF9jYjkwODgxMDJiY2U2YjMwABID/gL8AgMDAQYBAQEDBwEGASMBARMDAAEBAwEBAwEBBAIBAwMDAQEDAQMDAwMDAAMDAgcBCAEDAwMkAwcHAwcDFwEBAwQNAwEDBwQIAggCAQQIAQEAAQcCAgMDAwEAAQACEwcDAQYDJQEBBwEHAgMBAQENAQEDAwEDASYBAQMAAQMBAQEGAQ4KDgEBAQMDAwgAAAkBAQADAwQBAAAPDQAAAQMACgEJAAATBAAGGBgAAAEBAwYCAQQAAgAEAAEDBAEEBAQIBgEOCCcDAQMOAQYEAwMBAAAKAgADAAQBAQQABwAoBAgEAAANAQAABAIBAQQDBgAAAwYDAQAAAwECAgQGAQYCBAAAAwMDAAIAAQEHAykEABkZAAAaGgEPKgAGBwAABBAbEBAQGwkcHAQAAQEFBQUFKwoXFAgsDy4wBAcAAAIEAAEBAQEBAAQEBAQABgMCAAgAAAoAAAABAQQAAQAABgMGBAAAAAAAAAAABgAAAAEWAAEAAAECAAAAAAEBBAYDBAsCcAGBAYEBbwCAAQUDAQASBgkBfwFBgIDAAAsHzQUgBm1lbW9yeQIAD2Flc19nY21fZGVjcnlwdACpAg9hZXNfZ2NtX2VuY3J5cHQAqgIWYnVpbGRfbDJfZW52ZWxvcGVfd2FzbQCmAhNjb25zdGFudF90aW1lX2VxdWFsAOsBGGRlY3J5cHRfbDJfZW52ZWxvcGVfd2FzbQCxAhhlZDI1NTE5X2dlbmVyYXRlX2tleXBhaXIAyAIMZWQyNTUxOV9zaWduALoCDmVkMjU1MTlfdmVyaWZ5ALkCF2dldF9wYWRkaW5nX3RhcmdldF9zaXplAIcCC2dldF92ZXJzaW9uAMwCEmhrZGZfc2hhMjU2X2Rlcml2ZQCtAhBoa2RmX3NoYTI1Nl93YXNtAK4CGm1sX2RzYV80NF9nZW5lcmF0ZV9rZXlwYWlyAMYCDm1sX2RzYV80NF9zaWduALsCEG1sX2RzYV80NF92ZXJpZnkAvQIWbWxfa2VtXzc2OF9kZWNhcHN1bGF0ZQC4AhZtbF9rZW1fNzY4X2VuY2Fwc3VsYXRlAL8CG21sX2tlbV83NjhfZ2VuZXJhdGVfa2V5cGFpcgDFAgtzaGEyNTZfaGFzaADJAgtzaGEyNTZfd2FzbQDJAhd4MjU1MTlfZ2VuZXJhdGVfa2V5cGFpcgDHAhV4MjU1MTlfZ2V0X3B1YmxpY19rZXkAwAIYeDI1NTE5X2dldF9zaGFyZWRfc2VjcmV0ALwCFF9fd2JpbmRnZW5fZXhuX3N0b3JlAPECF19fZXh0ZXJucmVmX3RhYmxlX2FsbG9jAKgBFV9fd2JpbmRnZW5fZXh0ZXJucmVmcwEBEV9fd2JpbmRnZW5fbWFsbG9jAMICGV9fZXh0ZXJucmVmX3RhYmxlX2RlYWxsb2MAgQIPX193YmluZGdlbl9mcmVlAOUCEl9fd2JpbmRnZW5fcmVhbGxvYwDKAhBfX3diaW5kZ2VuX3N0YXJ0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+wBGDQEgASACQa8CakGgt8AAEDYhBgwZCyABIAEtABhBAWsiBjoAGCAGQf8BcQRAIAEgBUEBajYCFCACQQE6AJgCIAIgATYClAIgAkGQAWogAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUASEGQYCAgIB4IQQMFgsgAi0AkQFBAUcNByACQZABaiILIAIoApQCEJsBQYCAgIB4IQQgAigClAEhBiACKAKQASIFQYCAgIB4Rg0VIAIoApgBIQogCyACQZQCahCKASACLQCQAUEBRgRAIAIoApQBDBULIAItAJEBQQFHDQYgAkGQAWoiBCACKAKUAhAmIAIoApQBIgMgAigCkAEiB0GAgICAeEYNFBogAigCsAEhFyACKAKsASEOIAIoAqgBIQ8gAigCpAEhGCACKAKgASETIAIoApwBIQwgAigCmAEhHSAEIAJBlAJqEIoBIAItAJABQQFGBEAgAigClAEMFAsgAi0AkQFBAUcNBSACQZABaiIEIAIoApQCEJsBIAIoApQBIgkgAigCkAEiFEGAgICAeEYNExogAigCmAEhHiAEIAJBlAJqEIoBIAItAJABQQFGBEAgAigClAEMEwsgAi0AkQFBAUcNBCACQZABaiIEIAIoApQCEDAgAigClAEiESACKAKQASIVQYCAgIB4Rg0SGiACKAKkASEfIAIoAqABIRkgAigCnAEhFiACKAKYASENIAQgAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUAQwSCyACLQCRAUEBRw0DIAJBkAFqIgQgAigClAIQmwEgAigClAEiEiACKAKQASIaQYCAgIB4Rg0RGiACKAKYASEhIAQgAkGUAmoQigEgAi0AkAFBAUYEQCACKAKUASEQDBELIAItAJEBQQFHDQIgAkGQAWoiBCACKAKUAhCbASACKAKUASEQIAIoApABIhtBgICAgHhGDRAgAigCmAEhJCMAQRBrIggkACAIQQRqIAJBlAJqIgsQigECQCAILQAEQQFGBEAgBCAIKAIINgIEIARBgYCAgHg2AgAMAQsgCC0ABUUEQCAEQYCAgIB4NgIADAELIAhBBGogCygCABCbASAIKAIEQYCAgIB4RgRAIAQgCCgCCDYCBCAEQYGAgIB4NgIADAELIAQgCCkCBDcCACAEQQhqIAhBDGooAgA2AgALIAhBEGokACACKAKUASEIIAIoApABIiJBgYCAgHhHBEAgIkGAgICAeEcEQCACKAKYASElIAUhBAwXC0EGQey1wAAQ9gEhCAsgGwRAIBAgG0EBEPcCCyAIIRAMEAsgAkEYNgKQASACQQhqIAcQkQIgAkGQAWogAigCCCACKAIMEKACDA4LIAEgAS0AGEEBayIDOgAYIANB/wFxRQ0MQQEhJiABIAVBAWo2AhQgAkEBOgCQAiACIAE2AowCIAJBkAFqIAJBjAJqEHQgAi0AkAEEQEGAgICAeCEMQYCAgIB4IQpBgICAgHghBEGAgICAeCEHQYCAgIB4IQlBgICAgHghDkGAgICAeCEPDAcLQYCAgIB4IQ9BgICAgHghDkGAgICAeCEJQYCAgIB4IQdBgICAgHghBEGAgICAeCEKQYCAgIB4IQwDQAJAAkACQAJAIAItAJEBQQFGBEAgAigCjAIiBUEANgIIIAUgBSgCFEEBajYCFCACQZABaiAFQQxqIAUQfCACKAKUASEDIAIoApABQQJGDQ0gAkGUAmohCwJ/AkACQAJAAkACQAJAAkACQCACKAKYAUEDaw4KAAcBBwcFAgQHAwcLIANBhqzAAEEDEJMCDQVBAAwHCyADQYmswABBBRCTAg0FQQEMBgsgA0GOrMAAQQkQkwINBEECDAULIANBl6zAAEEMEJMCDQNBAwwECyADQaOswABBChCTAg0CQQQMAwsgAykAAELh6tHD9ovdsOcAUg0BQQUMAgsgA0G1rMAAQQMQkwINAEEGDAELQQcLIQMgC0EAOgAAIAsgAzoAASACLQCUAkEBRgRAIAIoApgCIQMMDgsCQAJAAkACQAJAAkACQAJAIAItAJUCQQFrDgcCAwQFBgcAAQsgBRAlIgMNFAwLCyAEQYCAgIB4RwRAQZS1wABBAxCJAiEDDBQLAkAgBRDaASIDRQRAIAJBkAFqIAUQmwEgAigClAEhAyACKAKQASIEQYCAgIB4Rw0BC0GAgICAeCEEDBQLIAIoApgBISUgAyEGDAoLIApBgICAgHhHBEBBl7XAAEEFEIkCIQMMEwsCQCAFENoBIgNFBEAgAkGQAWogBRAmIAIoApQBIQMgAigCkAEiCkGAgICAeEcNAQtBgICAgHghCgwTCyACKAKwASEQIAIoAqwBIR4gAigCqAEhEyACKAKkASEaIAIoAqABIRUgAigCnAEhFyACKAKYASENIAMhEgwJCyAMQYCAgIB4RwRAQZy1wABBCRCJAiEDDBILIAUQ2gEiAw0HIAJBkAFqIAUQmwEgAigClAEhAyACKAKQASIMQYCAgIB4Rg0HIAIoApgBIScgAyEdDAgLIAdBgICAgHhHBEBBpbXAAEEMEIkCIQMMEQsCQCAFENoBIgNFBEAgAkGQAWogBRAwIAIoApQBIQMgAigCkAEiB0GAgICAeEcNAQtBgICAgHghBwwRCyACKAKkASEhIAIoAqABIR8gAigCnAEhGCACKAKYASEbIAMhFgwHCyAJQYCAgIB4RwRAQbG1wABBChCJAiEDDBALIAUQ2gEiAw0EIAJBkAFqIAUQmwEgAigClAEhAyACKAKQASIJQYCAgIB4Rg0EIAIoApgBISQgAyEUDAYLIA5BgICAgHhHBEBBu7XAAEEIEIkCIQMMDwsgBRDaASIDDQIgAkGQAWogBRCbASACKAKUASEDIAIoApABIg5BgICAgHhGDQIgAigCmAEhIiADIREMBQsgD0GAgICAeEcEQEEBIQ1Bw7XAAEEDEIkCIQNBASEgQQEhHEEBIQtBASEFDBALIAUQ2gEiAwRAQQEhDUEBISBBASEcQQEhC0EBIQUMEQsgAkGQAWogBRCbASACKAKUASEZIAIoApABIg9BgICAgHhHBEAgAigCmAEhCAwFC0EBIQ1BASEgQQEhHEEBIQtBASEFIBkhAwwQCwJAAkACQAJAIARBgICAgHhHBEACQAJAAkACQAJAIApBgICAgHhGIiBFBEAgAiAQNgKwASACIB42AqwBIAIgEzYCqAEgAiAaNgKkASACIBU2AqABIAIgFzYCnAEgAiANNgKYASACIBI2ApQBIAIgCjYCkAEgDEGAgICAeEYiHA0BIAdBgICAgHhGIgsNAiACICE2AqgCIAIgHzYCpAIgAiAYNgKgAiACIBs2ApwCIAIgFjYCmAIgAiAHNgKUAiAJQYCAgIB4RiIFDQMgDkGAgICAeEYiJg0EIA9BgICAgHhHDRtBw7XAAEEDEIgCIQMgDkUNBSARIA5BARD3AgwFC0GXtcAAQQUQiAIhA0EBIQVBASELQQEhHAwJC0GctcAAQQkQiAIhA0EBIQVBASELDAcLQaW1wABBDBCIAiEDQQEhBQwFC0GxtcAAQQoQiAIhAwwDC0G7tcAAQQgQiAIhAwsgCUUNASAUIAlBARD3AgwBC0GUtcAAQQMQiAIhA0GAgICAeCEEDBALIAJBlAJqIg0oAgAiIwRAIA0oAgQgI0EBEPcCCyANKAIMIiNBgICAgHhGICNFckUEQCANKAIQICNBARD3AgsLIAxFDQAgHSAMQQEQ9wILIAJBkAFqEJkCC0EAIQ0gBEUEQEEAIQQMDgsgBiAEQQEQ9wIMDQtBgICAgHghDgwLC0GAgICAeCEJDAoLQYCAgIB4IQwMCQsgAkGQAWogAkGMAmoQdCACLQCQAUUNAAsMBgtBBUHstcAAEPYBIRAMDQtBBEHstcAAEPYBDA0LQQNB7LXAABD2AQwNC0ECQey1wAAQ9gEMDQtBAUHstcAAEPYBDA0LQYCAgIB4IQRBAEHstcAAEPYBIQYMDQsgAigClAEhAwtBASEFQQEhC0EBIRxBASEgQQEhDQsgD0GAgICAeEYNAQsgD0UNACAZIA9BARD3AgsgDkH/////B3FFICZFckUEQCARIA5BARD3AgsgBSAJQf////8HcUEAR3EEQCAUIAlBARD3AgsCQCAHQYCAgIB4RyALcUUNACAHBEAgFiAHQQEQ9wILIBhBgICAgHhyQYCAgIB4Rg0AIB8gGEEBEPcCCyAcIAxB/////wdxQQBHcQRAIB0gDEEBEPcCCwJAIApBgICAgHhHICBxRQ0AIAoEQCASIApBARD3AgsgFwRAIBUgF0EBEPcCCyATRQ0AIB4gE0EBEPcCCyANIARB/////wdxQQBHcQRAIAYgBEEBEPcCCyADIQZBgICAgHghBAsgASABLQAYQQFqOgAYIAIgARDJASIDNgKIAiACIAg2AoQCIAIgGTYCgAIgAiAPNgL8ASACICI2AvgBIAIgETYC9AEgAiAONgLwASACICQ2AuwBIAIgFDYC6AEgAiAJNgLkASACICE2AuABIAIgHzYC3AEgAiAYNgLYASACIBs2AtQBIAIgFjYC0AEgAiAHNgLMASACICc2AsgBIAIgHTYCxAEgAiAMNgLAASACIBA2ArwBIAIgHjYCuAEgAiATNgK0ASACIBo2ArABIAIgFTYCrAEgAiAXNgKoASACIA02AqQBIAIgEjYCoAEgAiAKNgKcASACICU2ApgBIAIgBjYClAEgAiAENgKQAQJAIARBgICAgHhHBEAgAw0BIAJBIGogAkGYAWpB8AD8CgAADAwLIANFDQkgAxD4AUGAgICAeCEEDAsLIAJBkAFqEMwBQYCAgIB4IQQgAyEGDAoLIAJBGDYCkAEgAkEQaiAHEJECIAJBkAFqIAIoAhAgAigCFBCgAgshASAAQYCAgIB4NgIAIAAgATYCBAwKCyAaBEAgEiAaQQEQ9wILIBALIRIgFQRAIBEgFUEBEPcCCyAWQYCAgIB4ckGAgICAeEcEQCAZIBZBARD3AgsgEgshESAUBEAgCSAUQQEQ9wILIBELIQkgBwRAIAMgB0EBEPcCCyAMBEAgEyAMQQEQ9wILIA8EQCAOIA9BARD3AgsgCQshA0GAgICAeCEEIAUEQCAGIAVBARD3AgsgAyEGCyABIAEtABhBAWo6ABggAiABEJoBIgU2AogCIAIgJTYChAIgAiAINgKAAiACICI2AvwBIAIgJDYC+AEgAiAQNgL0ASACIBs2AvABIAIgITYC7AEgAiASNgLoASACIBo2AuQBIAIgHzYC4AEgAiAZNgLcASACIBY2AtgBIAIgDTYC1AEgAiARNgLQASACIBU2AswBIAIgHjYCyAEgAiAJNgLEASACIBQ2AsABIAIgFzYCvAEgAiAONgK4ASACIA82ArQBIAIgGDYCsAEgAiATNgKsASACIAw2AqgBIAIgHTYCpAEgAiADNgKgASACIAc2ApwBIAIgCjYCmAEgAiAGNgKUASACIAQ2ApABIARBgICAgHhHDQEgBUUNACAFEPgBC0GAgICAeCEEDAELIAVFBEAgAkEgaiACQZgBakHwAPwKAAAMAQsgAkGQAWoQzAFBgICAgHghBCAFIQYLIARBgICAgHhGDQAgAEEIaiACQSBqQfAA/AoAACAAIAY2AgQgACAENgIADAELIAYgARD/ASEBIABBgICAgHg2AgAgACABNgIECyACQbACaiQAC/QZAhl/BH4jAEGwB2siAiQAIwBBIGsiBCQAIAIgAS0AACIDQQR2OgABIAIgA0EPcSIGOgAAIAIgAS0AASIDQQR2OgADIAIgA0EPcToAAiACIAEtAAIiA0EEdjoABSACIANBD3E6AAQgAiABLQADIgNBBHY6AAcgAiADQQ9xOgAGIAIgAS0ABCIDQQR2OgAJIAIgA0EPcToACCACIAEtAAUiA0EEdjoACyACIANBD3E6AAogAiABLQAGIgNBBHY6AA0gAiADQQ9xOgAMIAIgAS0AByIDQQR2OgAPIAIgA0EPcToADiACIAEtAAgiA0EEdjoAESACIANBD3E6ABAgAiABLQAJIgNBBHY6ABMgAiADQQ9xOgASIAIgAS0ACiIDQQR2OgAVIAIgA0EPcToAFCACIAEtAAsiA0EEdjoAFyACIANBD3E6ABYgAiABLQAMIgNBBHY6ABkgAiADQQ9xOgAYIAIgAS0ADSIDQQR2OgAbIAIgA0EPcToAGiACIAEtAA4iA0EEdjoAHSACIANBD3E6ABwgAiABLQAPIgNBBHY6AB8gAiADQQ9xOgAeIAIgAS0AECIDQQR2OgAhIAIgA0EPcToAICACIAEtABEiA0EPcToAIiACIANBBHY6ACMgAiABLQASIgNBBHY6ACUgAiADQQ9xOgAkIAIgAS0AEyIDQQR2OgAnIAIgA0EPcToAJiACIAEtABQiA0EEdjoAKSACIANBD3E6ACggAiABLQAVIgNBBHY6ACsgAiADQQ9xOgAqIAIgAS0AFiIDQQR2OgAtIAIgA0EPcToALCACIAEtABciA0EEdjoALyACIANBD3E6AC4gAiABLQAYIgNBBHY6ADEgAiADQQ9xOgAwIAIgAS0AGSIDQQR2OgAzIAIgA0EPcToAMiACIAEtABoiA0EEdjoANSACIANBD3E6ADQgAiABLQAbIgNBBHY6ADcgAiADQQ9xOgA2IAIgAS0AHCIDQQR2OgA5IAIgA0EPcToAOCACIAEtAB0iA0EEdjoAOyACIANBD3E6ADogAiABLQAeIgNBBHY6AD0gAiADQQ9xOgA8IAIgAS0AHyIBQQR2OgA/IAIgAUEPcToAPgNAIAIgBWoiCCAGIAZBCGoiAUHwAXFrOgAAIAhBAWoiAyADLQAAIAHAQQR1aiIBOgAAIAVBPkcEQCADIAEgAUEIaiIDQfABcWs6AAAgCEECaiIBIAEtAAAgA8BBBHVqIgY6AAAgBUECaiEFDAELCyAEQSBqJAAgAkHgAGpCADcDACACQdgAakIANwMAIAJB0ABqQgA3AwAgAkHIAGpCADcDAEEAIQEgAkHwAGpB2NrBACkCACIcNwMAIAJB+ABqQeDawQApAgAiHTcDACACQYABakHo2sEAKQIAIh43AwAgAkGIAWpB8NrBACkCACIbNwMAIAJBmAFqIBw3AwAgAkGgAWogHTcDACACQagBaiAeNwMAIAJBsAFqIBs3AwAgAkIANwNAIAJB0NrBACkCACIbNwNoIAIgGzcDkAEgAkHYAWpCADcDACACQdABakIANwMAIAJByAFqQgA3AwAgAkHAAWpCADcDACACQgA3A7gBIAJB+ANqIQwgAkHQA2ohDSACQagDaiEOIAJB6AVqIQsgAkHABWohBSACQZAGaiEGIAJBkAFqIQ8gAkHoAGohEANAAkACQCABQcAARwRAIAFBAXENAQwCCyACQegEaiAQQSBqKQIANwMAIAJB4ARqIBBBGGopAgA3AwAgAkHYBGogEEEQaikCADcDACACQdAEaiAQQQhqKQIANwMAIAJB+ARqIA9BCGopAgA3AwAgAkGABWogD0EQaikCADcDACACQYgFaiAPQRhqKQIANwMAIAJBkAVqIA9BIGopAgA3AwAgAiAQKQIANwPIBCACIA8pAgA3A/AEIAJBwARqIAJB4ABqKQMANwMAIAJBuARqIAJB2ABqKQMANwMAIAJBsARqIAJB0ABqKQMANwMAIAJBqARqIAJByABqKQMANwMAIAIgAikDQDcDoAQgAkGYBWoiAyACQaAEahAkQQAiAUUEQCACQYADaiADQaAB/AoAAAsgAkGYBWoiByACQYADaiITIAJB+ANqIgkQMiACQYgHaiIVIAJBqANqIhEgAkHQA2oiChAyIAJB4AFqIhQgCiAJEDIgAkHgBWoiGiACQagHaiIWKQIANwIAIAJB2AVqIgwgAkGgB2oiFykCADcCACACQdAFaiINIAJBmAdqIhgpAgA3AgAgAkHIBWoiDiACQZAHaiIZKQIANwIAIAJB8AVqIg8gAkHoAWoiECkCADcCACACQfgFaiILIAJB8AFqIgUpAgA3AgAgAkGABmoiBiACQfgBaiIIKQIANwIAIAJBiAZqIgQgAkGAAmoiAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSACQaAEaiISIAdB+AD8CgAAIAcgEhAkIBMgB0GgAfwKAAAgByATIAkQMiAVIBEgChAyIBQgCiAJEDIgGiAWKQIANwIAIAwgFykCADcCACANIBgpAgA3AgAgDiAZKQIANwIAIA8gECkCADcCACALIAUpAgA3AgAgBiAIKQIANwIAIAQgAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSASIAdB+AD8CgAAIAcgEhAkIBMgB0GgAfwKAAAgByATIAkQMiAVIBEgChAyIBQgCiAJEDIgGiAWKQIANwIAIAwgFykCADcCACANIBgpAgA3AgAgDiAZKQIANwIAIA8gECkCADcCACALIAUpAgA3AgAgBiAIKQIANwIAIAQgAykCADcCACACIAIpAogHNwLABSACIAIpAuABNwLoBSASIAdB+AD8CgAAIAcgEhAkIBQgByACQZAGaiILEDIgAkG4BmogAkHABWoiBSACQegFaiIGEDIgAkHgBmogBiALEDIgFSAHIAUQMiACQagCaiACQdgGaikCADcCACACQaACaiACQdAGaikCADcCACACQZgCaiACQcgGaikCADcCACACQZACaiACQcAGaikCADcCACACQbgCaiACQegGaikCADcCACACQcACaiACQfAGaikCADcCACACQcgCaiACQfgGaikCADcCACACQdACaiACQYAHaikCADcCACACIAIpArgGNwKIAiACIAIpAuAGNwKwAiACQfgCaiAWKQIANwIAIAJB8AJqIBcpAgA3AgAgAkHoAmogGCkCADcCACACQeACaiAZKQIANwIAIAIgAikCiAc3AtgCIAJBQGsgFEGgAfwKAAADQAJAAkAgAUHAAEcEQCABQQFxRQ0BDAILIAAgAkFAa0GgAfwKAAAgAkGwB2okAA8LIAFBAXYhBCABQcAASQRAIAJB4AFqIgMgBEHAB2xB8JjCAGogASACai0AABBvIAJBmAVqIgggAkFAayIEIAMQQiACQYADaiIDIAggCxAyIAJB4AZqIAUgBhAyIAJBiAdqIAYgCxAyIAJBoARqIAggBRAyIBFBIGogAkGAB2opAgA3AgAgEUEYaiACQfgGaikCADcCACARQRBqIAJB8AZqKQIANwIAIBFBCGogAkHoBmopAgA3AgAgESACKQLgBjcCACAKIAIpAogHNwIAIApBCGogAkGQB2opAgA3AgAgCkEQaiACQZgHaikCADcCACAKQRhqIAJBoAdqKQIANwIAIApBIGogAkGoB2opAgA3AgAgCUEgaiACQcAEaikCADcCACAJQRhqIAJBuARqKQIANwIAIAlBEGogAkGwBGopAgA3AgAgCUEIaiACQagEaikCADcCACAJIAIpAqAENwIAIAQgA0GgAfwKAAAgAUEBaiEBDAILIARBIEH42sEAEIYCAAsgAUEBaiEBDAALAAsgAUEBdiEEIAFBwABJBEAgAkHgAWoiAyAEQcAHbEHwmMIAaiABIAJqLQAAEG8gAkGYBWoiCCACQUBrIgQgAxBCIAJBgANqIgMgCCAGEDIgAkHgBmogBSALEDIgAkGIB2ogCyAGEDIgAkGgBGogCCAFEDIgDkEgaiACQYAHaikCADcCACAOQRhqIAJB+AZqKQIANwIAIA5BEGogAkHwBmopAgA3AgAgDkEIaiACQegGaikCADcCACAOIAIpAuAGNwIAIA0gAikCiAc3AgAgDUEIaiACQZAHaikCADcCACANQRBqIAJBmAdqKQIANwIAIA1BGGogAkGgB2opAgA3AgAgDUEgaiACQagHaikCADcCACAMQSBqIAJBwARqKQIANwIAIAxBGGogAkG4BGopAgA3AgAgDEEQaiACQbAEaikCADcCACAMQQhqIAJBqARqKQIANwIAIAwgAikCoAQ3AgAgBCADQaAB/AoAACABQQFqIQEMAgsgBEEgQfjawQAQhgIACyABQQFqIQEMAAsAC+ckAhB/An4jAEGwAWsiAyQAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJ/AkACQAJ/AkACQAJ/AkACQAJAAkAgASgCFCIEIAEoAhAiB0kEQEEAIAdrIQggBEEFaiEEIAFBDGohAiABKAIMIQkDQAJAAkAgBCAJaiIGQQVrLQAAIg1BCWsOJQEBFBQBFBQUFBQUFBQUFBQUFBQUFBQUARQRFBQUFBQUFBQUFBAACyANQdsAaw4hERMTExMTExMTExMFExMTExMTEwMTExMTEwQTExMTExMSEwsgASAEQQRrNgIUIAggBEEBaiIEakEFRw0ACwsgA0EFNgJwIANBEGogAUEMahCRAiADQfAAaiADKAIQIAMoAhQQoAIhASAAQQY6AAAgACABNgIEDBsLIAEgBEEEayIINgIUIAcgCE0NAiABIARBA2siCTYCFAJAIAZBBGstAABB9QBHDQAgCSAIIAcgByAISRsiB0YNAyABIARBAmsiCDYCFCAGQQNrLQAAQewARw0AIAcgCEYNAyABIARBAWs2AhQgBkECay0AAEHsAEYNBQsgA0EJNgJwIANBIGogAhCiAiADQfAAaiADKAIgIAMoAiQQoAIMAwsgASAEQQRrIgg2AhQgByAITQ0EIAEgBEEDayIJNgIUAkAgBkEEay0AAEHyAEcNACAJIAggByAHIAhJGyIHRg0FIAEgBEECayIINgIUIAZBA2stAABB9QBHDQAgByAIRg0FIAEgBEEBazYCFCAGQQJrLQAAQeUARg0HCyADQQk2AnAgA0EwaiACEKICIANB8ABqIAMoAjAgAygCNBCgAgwFCyABIARBBGsiCDYCFCAHIAhNDQYgASAEQQNrIgk2AhQCQCAGQQRrLQAAQeEARw0AIAkgCCAHIAcgCEkbIgdGDQcgASAEQQJrIgg2AhQgBkEDay0AAEHsAEcNACAHIAhGDQcgASAEQQFrIgg2AhQgBkECay0AAEHzAEcNACAHIAhGDQcgASAENgIUIAZBAWstAABB5QBGDQkLIANBCTYCcCADQUBrIAIQogIgA0HwAGogAygCQCADKAJEEKACDAcLIANBBTYCcCADQRhqIAIQogIgA0HwAGogAygCGCADKAIcEKACCyEBIABBBjoAACAAIAE2AgQMFgsgAEEAOgAADBULIANBBTYCcCADQShqIAIQogIgA0HwAGogAygCKCADKAIsEKACCyEBIABBBjoAACAAIAE2AgQMEwsgAEGBAjsBAAwSCyADQQU2AnAgA0E4aiACEKICIANB8ABqIAMoAjggAygCPBCgAgshASAAQQY6AAAgACABNgIEDBALIABBATsBAAwPCyABIARBBGs2AhRBACEEIANB8ABqIAFBABCEASADKQNwIhNCA1ENDUECIQEgAykDeCESAkACQAJAIBOnQQFrDgICAQALQQIhBEECQQAgEkL///////////8Ag0KAgICAgICA+P8AVBshAQwBCyASQj+IpyEECyAAIBI3AxAgAEEANgIMIAAgBDYCCCAAIAE6AAAMDgsgAUEANgIIIAEgBEEEazYCFCADQfAAaiACIAEQfCADKAJ0IQQgAygCcCIHQQJGDQsgAygCeCEBIAdBAXEEQEEAIQIgAUEATgRAIAFFBEBBASEJDA0LQQEhAiABQQEQgQMiCQ0MCyACIAEQ3QIAC0EAIQIgAUEATgRAIAFFBEBBASEJDAsLQQEhAiABQQEQgQMiCQ0KCyACIAEQ3QIACyABIAEtABhBAWsiBzoAGCAHQf8BcUUNByABIARBBGs2AhQgAyABNgKQASADQQE6AJQBIANB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Igs2AiQgAiAtp0H///8PcSIMNgIsIAIgKqdB////H3EiDTYCECACICunQf///x9xIgY2AiAgAiAwp0H///8fcSIHNgIoIAMgAUEoahBdIAIgAikD6AIgAikD4AIgAikD2AIgAikD0AIgAikDyAIgAikDwAIiKkIaiHwiLEIZiHwiK0IaiHwiL0IZiHwiMEIaiHwiLUIZiEITfiACKQOgAiIuQv///x+DfCIxp0H///8fcSIONgIwIAIgAikDqAIgLkIaiHwiLkL///8PgyAxQhqIfKciDzYCNCACICxC////D4MgKkL///8fgyACKQO4AiACKQOwAiAuQhmIfCIqQhqIfCIsQhmIfCIuQhqIfKciEDYCRCACIC6nQf///x9xIhE2AkAgAiAsp0H///8PcSISNgI8IAIgL6dB////D3EiEzYCTCACIC2nQf///w9xIhQ2AlQgAiAqp0H///8fcSIVNgI4IAIgK6dB////H3EiFjYCSCACIDCnQf///x9xIhc2AlAgAyABQdAAahBdIAIgAikD0AJCAYYgAikDyAJCAYYgAikDwAJCAYYiKkIaiHwiLEIZiHwiK6dB////H3E2AnAgAiACKQOwAkIBhiACKQOoAkIBhiACKQOgAkIBhiIvQhqIfCIwQhmIfCItp0H///8fcTYCYCACIAIpA9gCQgGGICtCGoh8IiunQf///w9xNgJ0IAIgAikDuAJCAYYgLUIaiHwiLadB////D3E2AmQgAiACKQPgAkIBhiArQhmIfCIrp0H///8fcTYCeCACICxC////D4MgKkL+//8fgyAtQhmIfCIqQhqIfD4CbCACICqnQf///x9xNgJoIAIgAikD6AJCAYYgK0IaiHwiKqdB////D3E2AnwgAiAwQv///w+DICpCGYhCE34gL0L+//8fg3wiKkIaiHw+AlwgAiAqp0H///8fcTYCWCABKAIoIRggASgCACEZIAEoAiwhGiABKAIEIRsgASgCMCEcIAEoAgghHSABKAI0IR4gASgCDCEfIAEoAjghICABKAIQISEgASgCPCEiIAEoAhQhIyABKAJAISQgASgCGCElIAEoAkQhJiABKAIcIScgASgCSCEoIAEoAiAhKSACIAEoAkwgASgCJGo2AqQBIAIgKCApajYCoAEgAiAmICdqNgKcASACICQgJWo2ApgBIAIgIiAjajYClAEgAiAgICFqNgKQASACIB4gH2o2AowBIAIgHCAdajYCiAEgAiAaIBtqNgKEASACIBggGWo2AoABIAMgAkGAAWoQXSACIAIpA9ACIAIpA8gCIAIpA8ACIipCGoh8IixCGYh8IiunQf///x9xNgLAASACIAIpA7ACIAIpA6gCIAIpA6ACIi9CGoh8IjBCGYh8Ii2nQf///x9xNgKwASACIAIpA9gCICtCGoh8IiunQf///w9xNgLEASACIAIpA7gCIC1CGoh8Ii2nQf///w9xNgK0ASACIAIpA+ACICtCGYh8IiunQf///x9xNgLIASACICxC////D4MgKkL///8fgyAtQhmIfCIqQhqIfD4CvAEgAiAqp0H///8fcTYCuAEgAiACKQPoAiArQhqIfCIqp0H///8PcTYCzAEgAiAwQv///w+DICpCGYhCE34gL0L///8fg3wiKkIaiHw+AqwBIAIgKqdB////H3E2AqgBIAJB8AFqIgEgByAXajYCACACQegBaiIHIAYgFmo2AgAgAkHgAWoiBiAFIBFqNgIAIAJB2AFqIgUgDSAVajYCACACIAwgFGo2AvQBIAIgCyATajYC7AEgAiAJIBBqNgLkASACIAogEmo2AtwBIAIgCCAPajYC1AEgAiAEIA5qNgLQASACQfgBaiIEIAJBMGogAkEIahCLASAAIAJBqAFqIAJB0AFqEIsBIAMgAkHYAGogBBCLASAAQcgAaiABKQIANwIAIABBQGsgBykCADcCACAAQThqIAYpAgA3AgAgAEEwaiAFKQIANwIAIAAgAikC0AE3AiggACACKQL4ATcCUCAAQdgAaiACQYACaikCADcCACAAQeAAaiACQYgCaikCADcCACAAQegAaiACQZACaikCADcCACAAQfAAaiACQZgCaikCADcCACAAQZgBaiACQcACaikCADcCACAAQZABaiACQbgCaikCADcCACAAQYgBaiACQbACaikCADcCACAAQYABaiACQagCaikCADcCACAAIAIpAqACNwJ4IAJB8AJqJAALsxUBC38jAEGAAWsiAiQAAkAgABDaASIBDQAgAEEANgIIAkAgACgCFCIBIAAoAhAiBE8NACAAQQxqIQcgACgCDCEGA0BBACAEayEIIAFBBWohAQJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAA0AC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BCAAIAQ2AgALIAJBMGokAAvYDQJHfwF+IwBBQGoiAiQAIAEoAgwiBUEBcSABKAIIISEgASgCBCEJIAEoAgAhAyAAKAIAIQogBUECTwRAIAVBAXYhCwNAIAMgAygCECIGQQJqNgIQIAMoAgAhACADKAIEIQEgAiADKAIIIgc2AgggAiABNgIEIAIgADYCACADKAIMIQggAiAHNgIYIAIgATYCFCACIAA2AhAgAiAGIAhqIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgIMIAIgAEEBaiIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYCHCACQSBqIAogAhAiIAItACAhBiACLQAhIQcgAi0AIiEIIAItACMhDSACLQAkIQ4gAi0AJSEPIAItACYhECACLQAnIREgAi0AKCESIAItACkhEyACLQAqIRQgAi0AKyEVIAItACwhFiACLQAtIRcgAi0ALiEYIAItAC8hGSACLQAwIRogAi0AMSEbIAItADIhHCACLQAzIR0gAi0ANCEeIAItADUhHyACLQA2ISAgAi0ANyEiIAItADghIyACLQA5ISQgAi0AOiElIAItADshJiACLQA8IScgAi0APSEoIAItAD4hKSAEIAlqIgAtAAAhKiAAQQFqLQAAISsgAEECai0AACEsIABBA2otAAAhLSAAQQRqLQAAIS4gAEEFai0AACEvIABBBmotAAAhMCAAQQdqLQAAITEgAEEIai0AACEyIABBCWotAAAhMyAAQQpqLQAAITQgAEELai0AACE1IABBDGotAAAhNiAAQQ1qLQAAITcgAEEOai0AACE4IABBD2otAAAhOSAAQRBqLQAAITogAEERai0AACE7IABBEmotAAAhPCAAQRNqLQAAIT0gAEEUai0AACE+IABBFWotAAAhPyAAQRZqLQAAIUAgAEEXai0AACFBIABBGGotAAAhQiAAQRlqLQAAIUMgAEEaai0AACFEIABBG2otAAAhRSAAQRxqLQAAIUYgAEEdai0AACFHIABBHmotAAAhSCAEICFqIgFBH2ogAEEfai0AACACLQA/czoAACABQR5qICkgSHM6AAAgAUEdaiAoIEdzOgAAIAFBHGogJyBGczoAACABQRtqICYgRXM6AAAgAUEaaiAlIERzOgAAIAFBGWogJCBDczoAACABQRhqICMgQnM6AAAgAUEXaiAiIEFzOgAAIAFBFmogICBAczoAACABQRVqIB8gP3M6AAAgAUEUaiAeID5zOgAAIAFBE2ogHSA9czoAACABQRJqIBwgPHM6AAAgAUERaiAbIDtzOgAAIAFBEGogGiA6czoAACABQQ9qIBkgOXM6AAAgAUEOaiAYIDhzOgAAIAFBDWogFyA3czoAACABQQxqIBYgNnM6AAAgAUELaiAVIDVzOgAAIAFBCmogFCA0czoAACABQQlqIBMgM3M6AAAgAUEIaiASIDJzOgAAIAFBB2ogESAxczoAACABQQZqIBAgMHM6AAAgAUEFaiAPIC9zOgAAIAFBBGogDiAuczoAACABQQNqIA0gLXM6AAAgAUECaiAIICxzOgAAIAFBAWogByArczoAACABIAYgKnM6AAAgBEEgaiEEIAtBAWsiCw0ACwsEQCADIAMoAhAiAEEBajYCECADKAIMIQEgAykCACFJIAMoAgghAyACQRhqQgA3AgAgAkIANwIQIAIgAzYCCCACIEk3AgAgAiAAIAFqIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgIMIAJBIGogCiACECIgAi0AICEDIAItACEhBCACLQAiIQogAi0AIyELIAItACQhDCACLQAlIQYgAi0AJiEHIAItACchCCACLQAoIQ0gAi0AKSEOIAItACohDyACLQArIRAgAi0ALCERIAItAC0hEiACLQAuIRMgCSAFQf7///8AcUEEdCIBaiIALQAAIQUgAC0AASEJIAAtAAIhFCAALQADIRUgAC0ABCEWIAAtAAUhFyAALQAGIRggAC0AByEZIAAtAAghGiAALQAJIRsgAC0ACiEcIAAtAAshHSAALQAMIR4gAC0ADSEfIAAtAA4hICABICFqIgEgAC0ADyACLQAvczoADyABIBMgIHM6AA4gASASIB9zOgANIAEgESAeczoADCABIBAgHXM6AAsgASAPIBxzOgAKIAEgDiAbczoACSABIA0gGnM6AAggASAIIBlzOgAHIAEgByAYczoABiABIAYgF3M6AAUgASAMIBZzOgAEIAEgCyAVczoAAyABIAogFHM6AAIgASAEIAlzOgABIAEgAyAFczoAAAsgAkFAayQAC8oNAgt/An4jAEHgAGsiByQAIAdBGGogAUH4A2opAgA3AwAgB0EQaiABQfADaikCADcDACAHQQhqIAFB6ANqKQIANwMAIAcgASkC4AM3AwAgBEFwcSELIARBEE8EQCALIQogAyEBA0AgB0HYAGoiCCABQQhqKQAANwMAIAcgASkAACISNwNQIAcgBy0AXzoAUCAHIBI8AF8gBy0AUSEJIAcgBy0AXjoAUSAHIAk6AF4gBy0AUiEJIAcgBy0AXToAUiAHIAk6AF0gBy0AXCEJIAcgBy0AUzoAXCAHIAk6AFMgBy0AWyEJIAcgBy0AVDoAWyAHIAk6AFQgBy0AWiEJIAcgBy0AVToAWiAHIAk6AFUgBy0AWSEJIAcgBy0AVjoAWSAHIAk6AFYgCC0AACEJIAggBy0AVzoAACAHIAk6AFcgAUEQaiEBIAcgB0HQAGoQ8gEgCkEQayIKDQALCyAEQQ9xIgEEQEEQIAFrIgoEQCAHQUBrIAFqQQAgCvwLAAsgAQRAIAdBQGsgAyALaiAB/AoAAAsgB0HYAGoiASAHQcgAaikAADcDACAHIAcpAEAiEjcDUCAHIActAF86AFAgByASPABfIActAFEhAyAHIActAF46AFEgByADOgBeIActAFIhAyAHIActAF06AFIgByADOgBdIActAFwhAyAHIActAFM6AFwgByADOgBTIActAFshAyAHIActAFQ6AFsgByADOgBUIActAFohAyAHIActAFU6AFogByADOgBVIActAFkhAyAHIActAFY6AFkgByADOgBWIAEtAAAhAyABIActAFc6AAAgByADOgBXIAcgB0HQAGoQ8gELIAZBcHEhAyAGQRBPBEAgAyEKIAUhAQNAIAdB2ABqIgsgAUEIaikAADcDACAHIAEpAAAiEjcDUCAHIActAF86AFAgByASPABfIActAFEhCCAHIActAF46AFEgByAIOgBeIActAFIhCCAHIActAF06AFIgByAIOgBdIActAFwhCCAHIActAFM6AFwgByAIOgBTIActAFshCCAHIActAFQ6AFsgByAIOgBUIActAFohCCAHIActAFU6AFogByAIOgBVIActAFkhCCAHIActAFY6AFkgByAIOgBWIAstAAAhCCALIActAFc6AAAgByAIOgBXIAFBEGohASAHIAdB0ABqEPIBIApBEGsiCg0ACwsgBkEPcSIBBEBBECABayIKBEAgB0FAayABakEA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IBR+fCARIBZ+fCAbIB5+IBogHH58IBkgIH58IB0gH358Ig99IApCzQJ+fCAEQsX6zu8BfnwgBkKW65zvAX58IAdC0rHMBH58IAdC7afX5wF+IAh8Qh2IfCIIQpv80ZIBfkL/////AYMiCULSscwEfnwgCULtp9fnAX4gCHxCHYh8IginQf////8BcTYCDCAnIAwgF34gJH0gAyAVfnwgC0IUhnwgEiAUfnwgEyAWfnwgHCAdfiAZIBt+fCILfSAGQs0CfnwgB0LF+s7vAX58IAlCluuc7wF+fCAIQh2IfCIIp0H/////AXE2AhAgJyAMIBN+IAMgEn58IA4gGSAdfiIQfH0gFCAWfnwgBUIUhnwgB0LNAn58IAlCxfrO7wF+fCAIQh2IfCIFp0H/////AXE2AhQgJyADIBZ+IAwgFH58IA19IApCFIZ8IAlCzQJ+fCAFQh2IfCIDp0H/////AXE2AhggJyAEQhSGIA98IANCHYh8IgOnQf////8BcTYCHCAnIAZCFIYgI3wgA0IdiHwiA6dB/////wFxNgIgICcgB0IUhiALfCADQh2IfCIDp0H/////AXE2AiQgJyAJQhSGIBB8IANCHYh8IgNCHYg+AiwgJyADp0H/////AXE2AiggACAnQQxqQZjZwQAQeSAnQTBqJAAL4REDCn8CfgF8IwBBEGsiCCQAAkACQAJAAkACQAJAAkACQCAALQAAQQFrDgUBAgMEBQALIAEoAgAiACgCACAAKAIIIgJrQQNNBEAgACACQQQQ3wEgACgCCCECCyAAIAJBBGo2AgggACgCBCACakHu6rHjBjYAAAwFCyABKAIAIQEgAC0AAUUEQCABKAIAIAEoAggiAGtBBE0EQCABIABBBRDfASABKAIIIQALIAEgAEEFajYCCCABKAIEIABqIgBBtLvAACgAADYAACAAQQRqQbi7wAAtAAA6AAAMBgsgASgCACABKAIIIgBrQQNNBEAgASAAQQQQ3wEgASgCCCEACyABIABBBGo2AgggASgCBCAAakH05NWrBjYAAAwECyMAQTBrIgIkACABKAIAIQECQAJAAkACQAJAAkAgAEEIaiIAKAIAQQFrDgIBAgALQRQgACkDCCACQQhqEH0iBWsiAyABKAIAIAEoAggiAGtLBEAgASAAIAMQ3wEgASgCCCEACyADBEAgASgCBCAAaiACQQhqIAVqIAP8CgAACyABIAAgA2o2AggMAgsgACkDCCIMIAxCP4ciDYUgDX0gAkEIaiIDEH0hACAMQgBTBEAgAEEBayIAQRNLDQMgACADakEtOgAAC0EUIABrIgMgASgCACABKAIIIgVrSwRAIAEgBSADEN8BIAEoAgghBQsgAwRAIAEoAgQgBWogAkEIaiAAaiAD/AoAAAsgASADIAVqNgIIDAELIAArAwgiDr1C////////////AINCgICAgICAgPj/AFoEQCABKAIAIAEoAggiAGtBA00EQCABIABBBBDfASABKAIIIQALIAEgAEEEajYCCCABKAIEIABqQe7qseMGNgAADAELIA4gAkEIaiIAECcgAGsiAyABKAIAIAEoAggiAGtLBEAgASAAIAMQ3wEgASgCCCEACyADBEAgASgCBCAAaiACQQhqIAP8CgAACyABIAAgA2o2AggLIAJBMGokAAwBCyAAQRRBvLvAABCGAgALDAMLIAggASAAKAIIIAAoAgwQeCAILQAAQQRGDQMgCCAIKQMANwMIIAhBCGoQswIhAgwDCyAAQQRqIgAoAgghBCAAKAIEIQcgASgCACIAKAIAIAAoAggiBUYEQCAAIAVBARDfASAAKAIIIQULIAAgBUEBaiICNgIIIAAoAgQgBWpB2wA6AAACQCAEBEAgByABECwiAw0BIARBGGxBGGshBSAHQRhqIQIDQCAFBEAgACgCCCIDIAAoAgBGBEAgACADQQEQ3wEgACgCCCEDCyAAIANBAWo2AgggACgCBCADakEsOgAAIAVBGGshBSACIAEQLCEDIAJBGGohAiADRQ0BDAMLCyAAKAIIIQILIAIgACgCAEYEQCAAIAJBARDfASAAKAIIIQILIAAgAkEBajYCCCAAKAIEIAJqQd0AOgAAQQAhAwsgAyECDAILIAAoAgwhCiABKAIAIgYoAgAgBigCCCICRgRAIAYgAkEBEN8BIAYoAgghAgsgBiACQQFqIgQ2AgggBigCBCACakH7ADoAACAKRQRAIAQgBigCAEYEQCAGIARBARDfASAGKAIIIQQLIAYgBEEBajYCCCAGKAIEIARqQf0AOgAADAELAkACQCAAKAIEIgIEQAJAIAAoAggiA0UNAAJAIANBB3EiBEUEQCADIQAMAQsgAyEAA0AgAEEBayEAIAIoApgDIQIgBEEBayIEDQALCyADQQhJDQADQCACKAKYAygCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMhAiAAQQhrIgANAAsLAkAgAi8BkgMEQEEBIQkgAiEADAELQQAhBEEBIQUDQCAFIQMgAigCiAIiAEUNAyADQQFqIQUgBEEBaiEEIAIvAZADIQcgACECIAcgAC8BkgNPDQALIAdBAWohCSAERQ0AIARBAWsgACAJQQJ0akGYA2ohAiAEQQdxBEAgA0EHcSEJQQAhBQNAIAIoAgAiA0GYA2ohAiAJIAVBAWoiBUcNAAsgBCAFayEEC0EAIQlBB0kEQCAAIQIgAyEADAELA0AgAigCACgCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMiA0GYA2ohAiAEQQhrIgQNAAsgACECIAMhAAsgCCABIAIgB0EMbGoiA0GQAmooAgAgA0GUAmooAgAQeCAILQAAQQRHDQIgAiAHQRhsaiAGKAIIIgIgBigCAEYEQCAGIAJBARDfASAGKAIIIQILIAYgAkEBajYCCCAGKAIEIAJqQTo6AAAgARAsIgINBCAKQQFrIgoEQANAAkAgAC8BkgMgCU0EQEEAIQdBASEFA0AgBSEDIAAoAogCIgJFDQYgA0EBaiEFIAdBAWohByAALwGQAyEEIAQgAiIALwGSA08NAAsgBEEBaiEJIAdFDQEgACAJQQJ0akGYA2ohBSAHQQdxBH8gA0EHcSEJQQAhAwNAIAUoAgAiAEGYA2ohBSAJIANBAWoiA0cNAAsgByADawUgBwshA0EAIQkgB0EBa0EHSQ0BA0AgBSgCACgCmAMoApgDKAKYAygCmAMoApgDKAKYAygCmAMiAEGYA2ohBSADQQhrIgMNAAsMAQsgACECIAkiBEEBaiEJCyACIARBDGxqIgNBlAJqKAIAIQUgA0GQAmooAgAhAyAGKAIIIgcgBigCAEYEQCAGIAdBARDfASAGKAIIIQcLIAYgB0EBajYCCCAGKAIEIAdqQSw6AAAgCCABIAMgBRB4IAgtAABBBEcNBCACIARBGGxqIAYoAggiAiAGKAIARgRAIAYgAkEBEN8BIAYoAgghAgsgBiACQQFqNgIIIAYoAgQgAmpBOjoAACABECwiAg0GIApBAWsiCg0ACwsgBigCCCEECyAEIAYoAgBGBEAgBiAEQQEQ3wEgBigCCCEECyAGIARBAWo2AgggBigCBCAEakH9ADoAAAwCC0HMu8AAEPkCAAsgCCAIKQMANwMIIAhBCGoQswIhAgwBC0EAIQILIAhBEGokACACC4cMAgZ/Bn4jAEGgBmsiAiQAIAJB0AVqIgUgARBdIAIgAikDgAYgAikD+AUgAikD8AUiCEIaiHwiC0IZiHwiCadB////H3E2AhggAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCCCACIAIpA4gGIAlCGoh8IgmnQf///w9xNgIcIAIgAikD6AUgCkIaiHwiCqdB////D3E2AgwgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCICACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CFCACIAinQf///x9xNgIQIAIgAikDmAYgCUIaiHwiCKdB////D3E2AiQgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AgQgAiAIp0H///8fcTYCACAFIAIQXSACIAIpA4AGIAIpA/gFIAIpA/AFIghCGoh8IgtCGYh8IgmnQf///x9xNgLABSACIAIpA+AFIAIpA9gFIAIpA9AFIgxCGoh8Ig1CGYh8IgqnQf///x9xNgKwBSACIAIpA4gGIAlCGoh8IgmnQf///w9xNgLEBSACIAIpA+gFIApCGoh8IgqnQf///w9xNgK0BSACIAIpA5AGIAlCGYh8IgmnQf///x9xNgLIBSACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CvAUgAiAIp0H///8fcTYCuAUgAiACKQOYBiAJQhqIfCIIp0H///8PcTYCzAUgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AqwFIAIgCKdB////H3E2AqgFIAUgAkGoBWoiBhBdIAIgAikDgAYgAikD+AUgAikD8AUiCEIaiHwiC0IZiHwiCadB////H3E2AkAgAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCMCACIAIpA4gGIAlCGoh8IgmnQf///w9xNgJEIAIgAikD6AUgCkIaiHwiCqdB////D3E2AjQgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCSCACIAtC////D4MgCEL///8fgyAKQhmIfCIIQhqIfD4CPCACIAinQf///x9xNgI4IAIgAikDmAYgCUIaiHwiCKdB////D3E2AkwgAiANQv///w+DIAhCGYhCE34gDEL///8fg3wiCEIaiHw+AiwgAiAIp0H///8fcTYCKCACQdAAaiIEIAEgAkEoahAyIAJB+ABqIgEgAiAEEDIgBSABEF0gAiACKQOABiACKQP4BSACKQPwBSIIQhqIfCILQhmIfCIJp0H///8fcTYCuAEgAiACKQPgBSACKQPYBSACKQPQBSIMQhqIfCINQhmIfCIKp0H///8fcTYCqAEgAiACKQOIBiAJQhqIfCIJp0H///8PcTYCvAEgAiACKQPoBSAKQhqIfCIKp0H///8PcTYCrAEgAiACKQOQBiAJQhmIfCIJp0H///8fcTYCwAEgAiALQv///w+DIAhC////H4MgCkIZiHwiCEIaiHw+ArQBIAIgCKdB////H3E2ArABIAIgAikDmAYgCUIaiHwiCKdB////D3E2AsQBIAIgDUL///8PgyAIQhmIQhN+IAxC////H4N8IghCGoh8PgKkASACIAinQf///x9xNgKgASACQcgBaiIDIAQgAkGgAWoQMiACQfABaiIEIANBBRBZIAJBmAJqIgEgBCADEDIgAkHAAmoiAyABQQoQWSACQegCaiIEIAMgARAyIAJBkANqIgMgBEEUEFkgAkG4A2oiByADIAQQMiACQeADaiIDIAdBChBZIAJBiARqIgQgAyABEDIgAkGwBGoiAyAEQTIQWSACQdgEaiIBIAMgBBAyIAJBgAVqIgMgAUHkABBZIAYgAyABEDIgBSAGQTIQWSAAIAUgBBAyIABByABqIAJBmAFqKQIANwIAIABBQGsgAkGQAWopAgA3AgAgAEE4aiACQYgBaikCADcCACAAQTBqIAJBgAFqKQIANwIAIAAgAikCeDcCKCACQaAGaiQAC9YMAgV/G34jAEHwAGsiAiQAIAJBBGogARCGASACIAI1AhQiB0Ls87eKA34gAigCCCIBrSIIQufi5LMBfiACKAIEIgOtIglC7sr1/wF+fCACKAIMIgStIg1CjJPw+wB+fCACKAIQIgWtIg5Cg+aF0wF+fCAHQu3zt4oBfnwiCn0gAyACKAIYIgNqrSIQQu7K9f8BfnwgASACKAIcIgFqrSIRQubipLQBfnwgBCACKAIg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AhBJIAYgAUGgDPwKAAAgA0GIFmoiB0IANwMAIANBgBZqIglCADcDACADQfgVaiIKQgA3AwAgA0IANwPwFSADQQxqIAFBIBDTASADQagiaiAHKQMANwMAIANBoCJqIAkpAwA3AwAgA0GYImogCikDADcDACADIAMpA/AVNwOQIiACQQBByAH8CwAgA0HgLGoiBEEAQckA/AsAIANBGDYC2CwgAyACNgLwFSAEIANBkCJqIg9BICABEIABIAMgAjYC8BUgBCAFQSAgARCAASABIAJBoAL8CgAAIANB6DVqIgJCADcDACADQeA1aiIEQgA3AwAgA0HYNWoiBUIANwMAIANB0DVqIgtCADcDACADQcg1aiIIQgA3AwAgA0HANWoiDEIANwMAIANBuDVqIg1CADcDACADQgA3A7A1IAEgA0HAF2ogA0GwNWoQogEgA0GoNWoiDiACKQMANwMAIANBoDVqIgIgBCkDADcDACADQZg1aiIEIAUpAwA3AwAgA0GQNWoiBSALKQMANwMAIANBiDVqIAgpAwAiEDcDACADQYA1aiAMKQMAIhE3AwAgA0H4NGogDSkDACISNwMAIANBuDRqIgsgEjcDACADQcA0aiIIIBE3AwAgA0HINGoiDCAQNwMAIAMgAykDsDUiEDcD8DQgAyAQNwOwNCADQeg0aiINIA4pAwA3AwAgA0HgNGoiDiACKQMANwMAIANB2DRqIgIgBCkDADcDACADIAUpAwA3A9A0IANBqCtqIgQgDCkDADcDACADQaAraiIFIAgpAwA3AwAgA0GYK2oiCCALKQMANwMAIAMgAykDsDQ3A5ArIAcgDSkDADcDACAJIA4pAwA3AwAgCiACKQMANwMAIAMgAykD0DQ3A/AVIANBsCJqIgcgBiAPIAEQIyADQYgraiAEKQMANwAAIANBgCtqIAUpAwA3AAAgA0H4KmogCCkDADcAACADIAMpA5ArNwDwKkHgCEEBEIEDIgFFDQMgASADQfAqaiICKQAANwAAIAFBGGogAkEYaikAADcAACABQRBqIAJBEGopAAA3AAAgAUEIaiACQQhqKQAANwAAIAMoAgwhAiABQSBqIAdBwAj8CgAAIABB4Ag2AgggACABNgIEIABB4Ag2AgAgAiACKAIAQQFrIgA2AgAgAEUNAQwCC0HtqsAAQRkQ4wIhASAAQYCAgIB4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aiIEKAIAIgdBBU8NAiAEQYPA/wNBAiAHQQJLGyAHazYCACAEQQRqIgcoAgAiBEEESw0CIAdBg8D/A0ECIARBAksbIARrNgIAIAFBCGoiAUGACEcNAAtBACIBRQRAIAggA0GACPwKAAALIAFFBEAgAkGMKGogCEGACPwKAAALIAFFBEAgAkGMIGogAkGMKGpBgAj8CgAACyABRQRAIAJBjDBqIAJBjCBqQYAI/AoAAAsgAUUEQCACQYwYaiACQYwwakGACPwKAAALIAAgAkEMakGAIPwKAAAgAkGQyABqJAAPC0HIpMAAQS9B+KTAABCMAgALQazBwABBIkHQwcAAEKUCAAusCAIDfwN+IwBB4AJrIgMkACADQThqQgA3AwAgA0EwakIANwMAIANBKGpCADcDACADQSBqQgA3AwAgA0EYakIANwMAIANBEGpCADcDACADQQhqQgA3AwAgA0IANwMAAkAgAkHBAE8EQCADQegAaiIFQQBBwQD8CwAgA0HYAGpB6MDAACkDADcDACADQdAAakHgwMAAKQMANwMAIANByABqQdjAwAApAwA3AwAgAyACQQZ2IgStNwNgIANB0MDAACkDADcDQCADQUBrIAEgBBAcIAJBP3EiBARAIAUgASACQUBxaiAE/AoAAAsgAyAEOgCoASADQbABaiADQUBrQfAA/AoAACADQdgBaiICIAMtAJgCIgFqIgVBgAE6AAAgAa0iB0I7hiADKQPQASIGQgmGIgggB0IDhoQiB0KA/gODQiiGhCAHQoCA/AeDQhiGIAdCgICA+A+DQgiGhIQgBkIBhkKAgID4D4MgBkIPiEKAgPwHg4QgBkIfiEKA/gODIAhCOIiEhIQhBgJAAkAgAUE/RwRAIAFBP3MiBARAIAVBAWpBACAE/AsACyABQThzQQdLDQELIANBsAFqIgEgAkEBEBwgA0HQAmpCADcDACADQcgCakIANwMAIANBwAJqQgA3AwAgA0G4AmpCADcDACADQbACakIANwMAIANBqAJqQgA3AwAgA0IANwOgAiADIAY3A9gCIAEgA0GgAmpBARAcDAELIAMgBjcDkAIgA0GwAWogAkEBEBwLIAMgAygCzAEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AhwgAyADKALIASIBQRh0IAFBgP4DcUEIdHIgAUEI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kAIgAyADKALsAUEBdCINNgKUAiAAIAUgBhCLASADKALEASEFIAMoAnghBiADKAJQIQ4gAygCfCEPIAMoAlQhECADKAKAASERIAMoAlghEiADKAKEASETIAMoAlwhFCADKAKIASEVIAMoAmAhFyADKAKMASEYIAMoAmQhGSADKAKQASEaIAMoAmghGyADKAKUASEcIAMoAmwhHSADKAKYASEeIAMoAnAhHyADKAKcASEgIAMoAnQhISADKAKgASEiIAMoAqQBISMgAygCqAEhJCADKAKsASElIAMoArABISYgAygCtAEhJyADKAK4ASEoIAMoArwBISkgAygCwAEhKiADQZgCaiADQfABaiAWEIsBIAAgBSANajYCdCAAIAwgKmo2AnAgACALIClqNgJsIAAgCiAoajYCaCAAIAkgJ2o2AmQgACAIICZqNgJgIAAgByAlajYCXCAAIAQgJGo2AlggACACICNqNgJUIAAgASAiajYCUCAAICAgIWo2AkwgACAeIB9qNgJIIAAgHCAdajYCRCAAIBogG2o2AkAgACAYIBlqNgI8IAAgFSAXajYCOCAAIBMgFGo2AjQgACARIBJqNgIwIAAgDyAQajYCLCAAIAYgDmo2AiggAEGYAWogA0G4AmopAgA3AgAgAEGQAWogA0GwAmopAgA3AgAgAEGIAWogA0GoAmopAgA3AgAgAEGAAWogA0GgAmopAgA3AgAgACADKQKYAjcCeCADQcACaiQAC6AHAQN/AkACQCABQRBrIgRB+ABPDQACQCABQfgATw0AIAAgAUECdGoiAyAAIARBAnRqKAIAIAMoAgAgAnhBg4aMGHFzIgNBAnRB/PnzZ3EgA0EEdEHw4cOHf3FzIANBBnRBwIGDhnxxcyADczYCACABQQFqIgNBEGsiBEH4AE8NAUH4ACABayIFQQAgBUH4AE0bIgVBAUYEQCADIQEMAQsgACADQQJ0aiIDIAAgBEECdGooAgAgAygCACACeEGDhowYcXMiA0ECdEH8+fNncSADQQR0QfDhw4d/cXMgA0EGdEHAgYOGfHFzIANzNgIAIAFBAmoiA0EQayIEQfgATw0BIAVBAkYEQCADIQEMAQsgACADQQJ0aiIDIAAgBEECdGooAgAgAygCACACeEGDhowYcXMiA0ECdEH8+fNncSADQQR0QfDhw4d/cXMgA0EG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C0HQwcEAQShB+MHBABClAgALIAIgAyADQagBcCIEa2ohBSADQagBTwRAA0AgASABKQMIIAIpAACFNwMIIAEgASkDECACQQhqKQAAhTcDECABIAEpAxggAkEQaikAAIU3AxggASABKQMgIAJBGGopAACFNwMgIAEgASkDKCACQSBqKQAAhTcDKCABIAEpAzAgAkEoaikAAIU3AzAgASABKQM4IAJBMGopAACFNwM4IAEgASkDQCACQThqKQAAhTcDQCABIAEpA0ggAkFAaykAAIU3A0ggASABKQNQIAJByABqKQAAhTcDUCABIAEpA1ggAkHQAGopAACFNwNYIAEgASkDYCACQdgAaikAAIU3A2AgASABKQNoIAJB4ABqKQAAhTcDaCABIAEpA3AgAkHoAGopAACFNwNwIAEgASkDeCACQfAAaikAAIU3A3ggASABKQOAASACQfgAaikAAIU3A4ABIAEgASkDiAEgAkGAAWopAACFNwOIASABIAEpA5ABIAJBiAFqKQAAhTcDkAEgASABKQOYASACQZABaikAAIU3A5gBIAEgASkDoAEgAkGYAWopAACFNwOgASABIAEpA6gBIAJBoAFqKQAAhTcDqAEgByABKALQARCSAyACQagBaiICIAVHDQALCyAERQ0AIAYgBSAE/AoAAAsgASAEOgCAAyAAIAFBiAP8CgAAC6sHAQR/IwBBwAVrIgIkACACQQBByAH8CwAgAkHQAWoiBUEAQYkB/AsAIAJBGDYCyAFBwHchBANAIAIgAikDACABIARqIgNBwAhqKQAAhTcDACACIAIpAwggA0HICGopAACFNwMIIAIgAikDECADQdAIaikAAIU3AxAgAiACKQMYIANB2AhqKQAAhTcDGCACIAIpAyAgA0HgCGopAACFNwMgIAIgAikDKCADQegIaikAAIU3AyggAiACKQMwIANB8AhqKQAAhTcDMCACIAIpAzggA0H4CGopAACFNwM4IAIgAikDQCADQYAJaikAAIU3A0AgAiACKQNIIANBiAlqKQAAhTcDSCACIAIpA1AgA0GQCWopAACFNwNQIAIgAikDWCADQZgJaikAAIU3A1ggAiACKQNgIANBoAlqKQAAhTcDYCACIAIpA2ggA0GoCWopAACFNwNoIAIgAikDcCADQbAJaikAAIU3A3AgAiACKQN4IANBuAlq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EKIBIAFByA5qIhIgDCkDADcDACABQcAOaiIMIAkpAwA3AwAgAUG4DmoiCSALKQMANwMAIAFBsA5qIgsgDSkDADcDACABQagOaiINIAgpAwAiGTcDACABQaAOaiITIAopAwAiGjcDACABQZgOaiIUIA8pAwAiGzcDACABQegAaiIVIBs3AwAgAUHwAGoiFiAaNwMAIAFB+ABqIhcgGTcDACABIAEpA8AMIhk3A5AOIAEgGTcDYCABQZgBaiIYIBIpAwA3AwAgAUGQAWoiEiAMKQMANwMAIAFBiAFqIgwgCSkDADcDACABIAspAwA3A4ABIAFBOGogFykDADcDACABQTBqIBYpAwA3AwAgAUEoaiAVKQMANwMAIAEgASkDYDcDICABQdgAaiAYKQMANwMAIAFB0ABqIBIpAwA3AwAgAUHIAGogDCkDADcDACABIAEpA4ABNwNAIARBAEHIAfwLACAFQQBBiQH8CwAgAUEYNgKoCyABIAQ2AqABIAUgAkHAGGpBICADEFQgASAENgKgASAFIA5BwAggAxBUIAYgBEHQAfwKAAAgAUGQDmoiBCAFQYkB/AoAACADIAYgBBCkASARQQBBiQH8CwAgASADNgJgIAZBAEGIAfwLACABQeAAaiAGEP4BIA0gCCkAADcDACATIAopAAA3AwAgFCAPKQAANwMAIAEgASkAwAw3A5AOIAMgAkGADGogASABQUBrECNB/wEhBEHAdyECA0AgBEEAIAFBoAFqIAJqIgNBwAhqLQAAIAIgDmoiBEHACGotAABGG0EAIANBwQhqLQAAIARBwQhqLQAARhtBACADQcIIai0AACAEQcIIai0AAEYbQQAgA0HDCGotAAAgBEHDCGotAABGGyEEIAJBBGoiAg0ACyAEQX9zIQNBYCECA0AgAUHgCWogAmoiDkEgaiABQZAOaiACaiIFQSBqLQAAIANxIAFBIGogAmoiBkEgai0AACAEcXI6AAAgDkEhaiAFQSFqLQAAIANxIAZBIWotAAAgBHFyOgAAIAJBAmoiAg0ACyAQIAEpAOAJNwABIBBBGWogAUH4CWopAAA3AAAgEEERaiABQfAJaikAADcAACAQQQlqIAFB6AlqKQAANwAAIBBBADoAACABQaAPaiQAIActAJwsBEBB4K/AAEEUEOMCIQEgAEGAgICAeDYCACAAIAE2AgQMBAsgB0HeK2oiAiAHQZ8sai0AADoAACAHQegraiAHQawsaikAACIZNwMAIAdB8CtqIAdBtCxqKQAAIho3AwAgB0HYK2oiAyAHQbwsai0AADoAACAHQdAraiIEIBo3AwAgB0HIK2oiDiAZNwMAIAcgBy8AnSw7AdwrIAcgBykApCwiGTcD4CsgByAZNwPAKyAHKACgLCEFQSBBARCBAyIBRQ0CIAEgBy8B3Cs7AAAgASAFNgADIAEgBykDwCs3AAcgAEEgNgIIIAAgATYCBCAAQSA2AgAgAUECaiACLQAAOgAAIAFBD2ogDikDADcAACABQRdqIAQpAwA3AAAgAUEfaiADLQAAOgAADAMLQcipwABBGhDjAiEBIABBgICAgHg2AgAgACABNgIEDAILQfSvwABBGRDjAiEBIABBgICAgHg2AgAgACABNgIEDAELQQFBIBDdAgALIAdBgDlqJAALhAYCCH4JfyAAIAE1AiQgATUCICABNQIcIAE1AhggATUCFCABNQIQIgNCGoh8IgRCGYh8IgVCGoh8IgZCGYh8IgdCGoh8IghCGYhCE34gATUCACICQv///x+DfCIJp0H///8fcSIKQRNqQRp2IAE1AgQgAkIaiHwiAkL///8PgyAJQhqIfKciC2pBGXYgATUCCCACQhmIfCICp0H///8fcSIMakEadiABNQIMIAJCGoh8IgKnQf///w9xIg1qQRl2IANC////H4MgAkIZiHwiAqdB////H3EiDmpBGnYgBEL///8PgyACQhqIfKciD2pBGXYgBadB////H3EiEGpBGnYgBqdB////D3EiEWpBGXYgB6dB////H3EiEmpBGnYgCKdB////D3EiAWpBGXZBE2wgCmoiCjoAACAAIApBEHY6AAIgACAKQQh2OgABIAAgCkEadiALaiILQQ52OgAFIAAgC0EGdjoABCAAIApBGHZBA3EgC0ECdHI6AAMgACALQRl2IAxqIgxBDXY6AAggACAMQQV2OgAHIAAgDEEDdCALQYCAgA5xQRZ2cjoABiAAIAxBGnYgDWoiDUELdjoACyAAIA1BA3Y6AAogACAMQRV2QR9xIA1BBXRyOgAJIAAgDUEZdiAOaiIOQRJ2OgAPIAAgDkEKdjoADiAAIA5BAnY6AA0gACAOQRp2IA9qIg86ABAgACANQRN2QT9xIA5BBnRyOgAM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ASEXIAAgACgCyAEQkgMgAUGAAWogFzcAACABQfgAaiAWNwAAIAFB8ABqIBU3AAAgAUHoAGogFDcAACABQeAAaiATNwAAIAFB2ABqIBI3AAAgAUHQAGogETcAACABQcgAaiAQNwAAIAFBQGsgDzcAACABQThqIA43AAAgAUEwaiANNwAAIAFBKGogDDcAACABQSBqIAs3AAAgAUEYaiAKNwAAIAFBEGogCTcAACABQQhqIAg3AAAgASAHNwAAIAFBiAFqIgEgBUcNAAsLIAIgBGshASACIARGDQAgACkDACEHIAApAwghCCAAKQMQIQkgACkDGCEKIAApAyAhCyAAKQMoIQwgACkDMCENIAApAzghDiAAKQNAIQ8gACkDSCEQIAApA1AhESAAKQNYIRIgACkDYCETIAApA2ghFCAAKQNwIRUgACkDeCEWIAApA4ABIRcgACAAKALIARCSAyADIBc3A4gBIAMgFjcDgAEgAyAVNwN4IAMgFDcDcCADIBM3A2ggAyASNwNgIAMgETcDWCADIBA3A1AgAyAPNwNIIAMgDjcDQCADIA03AzggAyAMNwMwIAMgCzcDKCADIAo3AyAgAyAJNwMYIAMgCDcDECADIAc3AwggAUGJAU8NAiABBEAgBSADQQhqIAH8CgAACyAGIANBCGpBiAH8CgAACyAAIAE6ANgCIANBkAFqJAAPCyADQQA2AhggA0EBNgIMIANB4L7AADYCCCADQgQ3AhAgA0EIakHovsAAEMQCAAtBACABQYgBQfi+wAAQpAIAC9wGAQR/AkACQCABKAIAQQFHBEAgAUHYAWohBkGIASABLQDgAiIEayIFIANNBEAgAUEIaiEHIARFDQIgBQRAIAQgBmogAiAF/AoAAAsgASABKQMIIAEpA9gBhTcDCCABIAEpAxAgASkD4AGFNwMQIAEgASkDGCABKQPoAYU3AxggASABKQMgIAEpA/ABhTcDICABIAEpAyggASkD+AGFNwMoIAEgASkDMCABKQOAAoU3AzAgASABKQM4IAEpA4gChTcDOCABIAEpA0AgASkDkAKFNwNAIAEgASkDSCABKQOYAoU3A0ggASABKQNQIAEpA6AChTcDUCABIAEpA1ggASkDqAKFNwNYIAEgASkDYCABKQOwAoU3A2AgASABKQNoIAEpA7gChTcDaCABIAEpA3AgASkDwAKFNwNwIAEgASkDeCABKQPIAoU3A3ggASABKQOAASABKQPQAoU3A4ABIAEgASkDiAEgASkD2AKFNwOIASAHIAEoAtABEJIDIAMgBWshAyACIAVqIQIMAgsgAwRAIAQgBmogAiAD/AoAAAsgAyAEaiEEDAILQZi/wABBKEHAv8AAEKUCAAsgAiADIANBiAFwIgRraiEFIANBiAFPBEADQCABIAEpAwggAikAAIU3AwggASABKQMQIAJBCGopAACFNwMQIAEgASkDGCACQRBqKQAAhTcDGCABIAEpAyAgAkEYaikAAIU3AyAgASABKQMoIAJBIGopAACFNwMoIAEgASkDMCACQShqKQAAhTcDMCABIAEpAzggAkEwaikAAIU3AzggASABKQNAIAJBOGopAACFNwNAIAEgASkDSCACQUBrKQAAhTcDSCABIAEpA1AgAkHIAGopAACFNwNQIAEgASkDWCACQdAAaikAAIU3A1ggASABKQNgIAJB2ABqKQAAhTcDYCABIAEpA2ggAkHgAGopAACFNwNoIAEgASkDcCACQegAaikAAIU3A3AgASABKQN4IAJB8ABqKQAAhTcDeCABIAEpA4ABIAJB+ABqKQAAhTcDgAEgASABKQOIASACQYABaikAAIU3A4gBIAcgASgC0AEQkgMgAkGIAWoiAiAFRw0ACwsgBEUNACAGIAUgBPwKAAALIAEgBDoA4AIgACABQegC/AoAAAvcBgEEfwJAAkAgASgCAEEBRwRAIAFB2AFqIQZBiAEgAS0A4AIiBGsiBSADTQRAIAFBCGohByAERQ0CIAUEQCAEIAZqIAIgBfwKAAALIAEgASkDCCABKQPYAYU3AwggASABKQMQIAEpA+ABhTcDECABIAEpAxggASkD6AGFNwMYIAEgASkDICABKQPwAYU3AyAgASABKQMoIAEpA/gBhTcDKCABIAEpAzAgASkDgAKFNwMwIAEgASkDOCABKQOIAoU3AzggASABKQNAIAEpA5AChTcDQCABIAEpA0ggASkDmAKFNwNIIAEgASkDUCABKQOgAoU3A1AgASABKQNYIAEpA6gChTcDWCABIAEpA2AgASkDsAKFNwNgIAEgASkDaCABKQO4AoU3A2ggASABKQNwIAEpA8AChTcDcCABIAEpA3ggASkDyAKFNwN4IAEgASkDgAEgASkD0AKFNwOAASABIAEpA4gBIAEpA9gChTcDiAEgByABKALQARCSAyADIAVrIQMgAiAFaiECDAILIAMEQCAEIAZqIAIgA/wKAAALIAMgBGohBAwCC0HQwcEAQShB+MHBABClAgALIAIgAyADQYgBcCIEa2ohBSADQYgBTwRAA0AgASABKQMIIAIpAACFNwMIIAEgASkDECACQQhqKQAAhTcDECABIAEpAxggAkEQaikAAIU3AxggASABKQMgIAJBGGopAACFNwMgIAEgASkDKCACQSBqKQAAhTcDKCABIAEpAzAgAkEoaikAAIU3AzAgASABKQM4IAJBMGopAACFNwM4IAEgASkDQCACQThqKQAAhTcDQCABIAEpA0ggAkFAaykAAIU3A0ggASABKQNQIAJByABqKQAAhTcDUCABIAEpA1ggAkHQAGopAACFNwNYIAEgASkDYCACQdgAaikAAIU3A2AgASABKQNoIAJB4ABqKQAAhTcDaCABIAEpA3AgAkHoAGopAACFNwNwIAEgASkDeCACQfAAaikAAIU3A3ggASABKQOAASACQfgAaikAAIU3A4ABIAEgASkDiAEgAkGAAWopAACFNwOIASAHIAEoAtABEJIDIAJBiAFqIgIgBUcNAAsLIARFDQAgBiAFIAT8CgAACyABIAQ6AOACIAAgAUHoAvwKAAALjgYBB38jAEGAIGsiBCQAIARBgBBqIgcgASACEOEBIARBgAhqQQBBgAj8CwBBgHghAwNAIARBgBhqIgggA2oiCUGACGogBEGACGogA2oiBUGAEGooAgAgBUGACGooAgBqIgYgBkGBwP8DayAGQYHA/wNJGzYCACAJQYQIaiAFQYQQaigCACAFQYQIaigCAGoiBSAFQYHA/wNrIAVBgcD/A0kbNgIAIANBCGoiAw0AC0EAIgNFBEAgBCAIQYAI/AoAAAsgByABQYAIaiACQYAIahDhASADRQRAIARBgAhqIARBgAj8CgAAC0GAeCEDA0AgBEGAGGoiCCADaiIJQYAIaiAEQYAIaiADaiIFQYAQaigCACAFQYAIaigCAGoiBiAGQYHA/wNrIAZBgcD/A0kbNgIAIAlBhAhqIAVBhBBqKAIAIAVBhAhqKAIAaiIFIAVBgcD/A2sgBUGBwP8DSRs2AgAgA0EIaiIDDQALQQAiA0UEQCAEIAhBgAj8CgAACyAH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/wMgBkECdCgCtMJBIgFrIgNBACABayADQYHA/wNJG60hEiAEIQEDQCAFIAhqIgNB/wFLDQIgCCARaiIDQYACSQRAIAEgASgCACIMIAEgEGoiAygCAGoiCSAJQYHA/wNrIAlBgcD/A0kbNgIAIAJBMGogDCADKAIAayIJQYHA/wNqIgwgCSAMQYHA/wNJG60gEn4iE0IAQofAgAQQ9wEgAkEgaiACKQM4IhRCEoYgAikDMEIuiIQgFEIuiEL/v4D8DxD3ASADIAIpAyAgE3ynIgMgA0GBwP8DayADQYHA/wNJGzYCACABQQRqIQEgByAIQQFqIghGDQQMAQsLIANBgAJBhMvBABCGAgALIAZBgAJB5MrBABCGAgALIANBgAJB9MrBABCGAgALIAUgC2ohBSAEIA9qIQQgDUEBayINDQALCyAKQQFqIgpBCEcNAAsgAkHACGogAkFAa0GACPwKAABBACEBA0AgAkEQaiACQcAIaiABajUCAEKhwP0DfiISQgBCh8CABBD3ASACIAIpAxgiE0IShiACKQMQQi6IhCATQi6IQv+/gPwPEPcBIAJBwBBqIgMgAWogAikDACASfKciBCAEQYHA/wNrIARBgcD/A0kbNgIAIAFBBGoiAUGACEcNAAsgACADQYAI/AoAACACQcAYaiQAC8AFAgF/Bn4jAEGAAWsiAyQAIANBMGogARBdIAMgAykDYCADKQNYIAMpA1AiBEIaiHwiB0IZiHwiBadB////H3E2AiAgAyADKQNAIAMpAzggAykDMCIIQhqIfCIJQhmIfCIGp0H///8fcTYCECADIAMpA2ggBUIaiHwiBadB////D3E2AiQgAyADKQNIIAZCGoh8IganQf///w9xNgIUIAMgAykDcCAFQhmIfCIFp0H///8fcTYCKCADIAdC////D4MgBEL///8fgyAGQhmIfCIEQhqIfD4CHCADIASnQf///x9xNgIYIAMgAykDeCAFQhqIfCIEp0H///8PcTYCLCADIAlC////D4MgBEIZiEITfiAIQv///x+DfCIEQhqIfD4CDCADIASnQf///x9xNgIIIAJBAk8EQCACQQFrIQIDQCADQTBqIANBCGoQXSADIAMpA2AgAykDWCADKQNQIgRCGoh8IgdCGYh8IgWnQf///x9xNgIgIAMgAykDQCADKQM4IAMpAzAiCEIaiHwiCUIZiHwiBqdB////H3E2AhAgAyADKQNoIAVCGoh8IgWnQf///w9xNgIkIAMgAykDSCAGQhqIfCIGp0H///8PcTYCFCADIAMpA3AgBUIZiHwiBadB////H3E2AiggAyAHQv///w+DIARC////H4MgBkIZiHwiBEIaiHw+AhwgAyAEp0H///8fcTYCGCADIAMpA3ggBUIaiHwiBKdB////D3E2AiwgAyAJQv///w+DIARCGYhCE34gCEL///8fg3wiBEIaiHw+AgwgAyAEp0H///8fcTYCCCACQQFrIgINAAsLIAAgAykCCDcCACAAQSBqIANBKGopAgA3AgAgAEEYaiADQSBqKQIANwIAIABBEGogA0EYaikCADcCACAAQQhqIANBEGopAgA3AgAgA0GAAWokAAuXBgEFfyAAQQhrIgEgAEEEaygCACIDQXhxIgBqIQICQAJAIANBAXENACADQQJxRQ0BIAEoAgAiAyAAaiEAIAEgA2siAUGo28QAKAIARgRAIAIoAgRBA3FBA0cNAUGg28QAIAA2AgAgAiACKAIEQX5xNgIEIAEgAEEBcjYCBCACIAA2AgAPCyABIAMQmQELAkACQAJAAkACQCACKAIEIgNBAnFFBEAgAkGs28QAKAIARg0CIAJBqNvEACgCAEYNAyACIANBeHEiAhCZASABIAAgAmoiAEEBcjYCBCAAIAFqIAA2AgAgAUGo28QAKAIARw0BQaDbxAAgADYCAA8LIAIgA0F+cTYCBCABIABBAXI2AgQgACABaiAANgIACyAAQYACSQ0CIAEgABCpAUEAIQFBwNvEAEHA28QAKAIAQQFrIgA2AgAgAA0EQYjZxAAoAgAiAARAA0AgAUEBaiEBIAAoAggiAA0ACwtBwNvEAEH/HyABIAFB/x9NGzYCAA8LQazbxAAgATYCAEGk28QAQaTbxAAoAgAgAGoiADYCACABIABBAXI2AgRBqNvEACgCACABRgRAQaDbxABBADYCAEGo28QAQQA2AgALIABBuNvEACgCACIDTQ0DQazbxAAoAgAiAkUNA0EAIQBBpNvEACgCACIEQSlJDQJBgNnEACEBA0AgAiABKAIAIgVPBEAgAiAFIAEoAgRqSQ0ECyABKAIIIQEMAAsAC0Go28QAIAE2AgBBoNvEAEGg28QAKAIAIABqIgA2AgAgASAAQQFy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Ii19IB9CzQJ+fCAgQsX6zu8BfnwgIUKW65zvAX58ICJC0rHMBH58ICJC7afX5wF+IBx8Qh2IfCIcQpv80ZIBfkL/////AYMiHULSscwEfnwgHULtp9fnAX4gHHxCHYh8IhynQf////8BcTYCLCAIICRC1MSL2AN+ID99IDJCga/LywF+fCAzQsT3kKIBfnwgNELbmJedA358IDhCnprh8AF+IDZC7YgUfnwiLn0gK0IUhnwgIULNAn58ICJCxfrO7wF+fCAdQpbrnO8BfnwgHEIdiHwiHKdB/////wFxNgIwIAggJELbmJedA34gM0KBr8vLAX58ICMgOELtiBR+Ih58fSA0QsT3kKIBfnwgLEIUhnwgIkLNAn58IB1CxfrO7wF+fCAcQh2IfCIcp0H/////AXE2AjQgCCAkQsT3kKIBfiA1fSA0QoGvy8sBfnwgH0IUhnwgHULNAn58IBxCHYh8IhynQf////8BcTYCOCAIICBCFIYgLXwgHEIdiHwiHKdB/////wFxNgI8IAggIUIUhiA+fCAcQh2IfCIcp0H/////AXE2AkAgCCAiQhSGIC58IBxCHYh8IhynQf////8BcTYCRCAIIB1CFIYgHnwgHEIdiHwiHEIdiD4CTCAIIBynQf////8BcTYCSCAVQQRqIgEgEEGY2cEAEHkgCEHQAGokACAUIAEQkgEgFUHwAGokACAaIAVBuAJqKQAANwMAIBsgBUGwAmopAAA3AwAgESAFQagCaikAADcDACAFIAUpAKACNwOgBSMAQZABayIDJAAgA0EkaiAUEIYBIANByABqIBYQhgEgAyADKAJIIAMoAiRqIgFB/////wFxNgJsIAMgAygCTCADKAIoIAFBHXZqaiIBQf////8BcTYCcCADIAMoAlAgAygCLCABQR12amoiAUH/////AXE2AnQgAyADKAJUIAMoAjAgAUEddmpqIgFB/////wFxNgJ4IAMgAygCWCADKAI0IAFBHXZqaiIBQf////8BcTYCfCADIAMoAlwgAygCOCABQR12amoiAUH/////AXE2AoABIAMgAygCYCADKAI8IAFBHXZqaiIBQf////8BcTYChAEgAyADKAJkIAMoAkAgAUEddmpqIgFB/////wFxNgKIASADIAMoAmggAygCRCABQR12ampB/////wFxNgKMASADIANB7ABq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jBhqIAJBjDBqQYAI/AoAAAsgACACQQxqQYAg/AoAACAFQYAgaiIAIAZHDQEgAkGQwABqJAAPC0HIpMAAQS9B+KTAABCMAgALIAJBEGogASgCACAAEOEBIAJBADYCHCACQQE2AhAgAkGsgMAANgIMIAJCBDcCFCACQQxqQbikwAAQxAIAC+YEAgd/AX4jAEEQayIDJAACQCAALwEMIgJFBEAgACgCACAAKAIEIAEQZCEBDAELIANBCGogAUEIaikCADcDACADIAEpAgA3AwACQAJ/IAApAggiCaciBkGAgIAIcUUEQCADKAIEDAELIAAoAgAgAygCACADKAIEIgEgACgCBCgCDBECAA0BIAAgBkGAgID/eXFBsICAgAJyIgY2AgggA0IBNwMAIAIgAUH//wNxayIBQQAgASACTRshAkEACyEHAkAgAygCDCIIRQRADAELIAMoAgghAQNAAn8CQAJAAkACQCABLwEAQQFrDgIBAgALIAFBBGooAgAMAwsgAUECai8BACIFDQFBAQwCCyABQQhqKAIADAELIAVB9v8XaiAFQZz/H2pxIAVBmPg3aiAFQfCxH2pxc0ERdkEBagshBSABQQxqIQEgBCAFaiEEIAhBAWsiCA0ACwsCQCAEIAdqIgEgAkH//wNxSQRAIAIgAWshBEEAIQFBACECAkACQAJAIAZBHXZBA3FBAWsOAwABAAILIAQhAgwBCyAEQf7/A3FBAXYhAgsgBkH///8AcSEIIAAoAgQhBSAAKAIAIQcDQCABQf//A3EgAkH//wNxTw0CIAFBAWohASAHIAggBSgCEBEAAEUNAAsMAgsgACgCACAAKAIEIAMQZCEBIAAgCTcCCAwCCyAHIAUgAxBkDQBBACEGIAQgAmtB//8DcSECA0ACQCAGQf//A3EiBCACSSEBIAIgBE0NACAGQQFqIQYgByAIIAUoAhARAABFDQELCyAAIAk3AggMAQtBASEBCyADQRBqJAAgAQvsBAEFfyMAQZDAAGsiAiQAAkACQCABKAIAIgUgASgCBCIGRg0AIAJBkDhqIgQgBSABKAIIIgEQU0EARQRAIAJBjChqIARBgAj8CgAACyADRQRAIAJBjCBqIAJBjChqQYAI/AoAAAsgA0UEQCACQYwwaiACQYwgakGACPwKAAALIANFBEAgAkEMaiACQYwwakGACPwKAAAL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APwKAAAgA0HwAWokAAvRBAEDfyMAQZDAAGsiAyQAAkACQCABIAJGDQAgA0GQOGoiBSABEFhBAEUEQCADQYwoaiAFQYAI/AoAAAsgBEUEQCADQYwgaiADQYwoakGACPwKAAALIARFBEAgA0GMMGogA0GMIGpBgAj8CgAACyAERQRAIANBDGogA0GMMGpBgAj8CgAACyABQYAIaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMCGogA0GMMGpBgAj8CgAACyABQYAQaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMEGogA0GMMGpBgAj8CgAACyABQYAYaiIEIAJGDQAgBSAEEFhBACIERQRAIANBjChqIAVBgAj8CgAACyAERQRAIANBjCBqIANBjChqQYAI/AoAAAsgBEUEQCADQYwwaiADQYwgakGACPwKAAALIARFBEAgA0GMGGogA0GMMGpBgAj8CgAACyAAIANBDGpBgCD8CgAAIAFBgCBqIgAgAkcNASADQZDAAGokAA8LQcikwABBL0H4pMAAEIwCAAsgA0EQaiAAEFggA0EANgIcIANBATYCECADQayAwAA2AgwgA0IENwIUIANBDGpBuKTAABDEAgAL0QQBA38jAEGQwABrIgMkAAJAAkAgASACRg0AIANBkDhqIgUgARB6QQBFBEAgA0GMKGogBUGACPwKAAALIARFBEAgA0GMIGogA0GMKGpBgAj8CgAACyAERQRAIANBjDBqIANBjCBqQYAI/AoAAAsgBEUEQCADQQxqIANBjDBqQYAI/AoAAAsgAUGACGoiBCACRg0AIAUgBBB6QQAiBEUEQCADQYwoaiAFQYAI/AoAAAsgBEUEQCADQYwgaiADQYwoakGACPwKAAALIARFBEAgA0GMMGogA0GMIGpBgAj8CgAACyAERQRAIANBjAhqIANBjDBqQYAI/AoAAAsgAUGAEGoiBCACRg0AIAUgBBB6QQAiBEUEQCADQYwoaiAFQYAI/AoA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BDYCCAsgAyABayEDIAEgAmohAiAIQfUARgRAIAdBD3EtAMruQCEGIAdBBHYtAMruQCEHIAUoAgAgBGtBBU0EQCAFIARBBhDfASAFKAIIIQQLIAUoAgQgBGoiASAGOgAFIAEgBzoABCABQdzqwYEDNgAAIAUgBEEGaiIENgIIBSAFKAIAIARrQQFNBEAgBSAEQQIQ3wEgBSgCCCEECyAFKAIEIARqIgEgCDoAASABQdwAOgAAIAUgBEECaiIENgIICwwACwALyQQBDn8jAEEQayIDIAEoAiAgAigCIGsgASgCHCACKAIcayABKAIYIAIoAhhrIAEoAhQgAigCFGsgASgCECACKAIQayABKAIMIAIoAgxrIAEoAgggAigCCGsgASgCBCABKAIAIAIoAgBrIgRBH3VqIAIoAgRrIgJBH3VqIgVBH3VqIgZBH3VqIgdBH3VqIghBH3VqIglBH3VqIgpBH3VqIgtBH3UiATYCDCADKAIMIQwgAyABNgIMIAMoAgwhDSADIAE2AgwgAygCDCEOIAMgATYCDCADKAIMIQ8gAyABNgIMIAMoAgwhECADIAE2AgwgAygCDBogAyABNgIMIAMoAgwaIAMgATYCDCADKAIMGiADIAE2AgwgAygCDCEBIAAgCkH/////AXEgCUH/////AXEgCEH/////AXEgB0H/////AXEgBkH/////AXEgBUH/////AXEgAkH/////AXEgDEHtp9fnAXEgBEH/////AXFqIgJBHXZqIA1B0rHMBHFqIgNBHXZqIA5Bluuc7wFxaiIEQR12aiAPQcX6zu8BcWoiBUEddmogEEHNAnFqIgZBHXZqIgdBHXZqIghBHXZqIglB/////wFxNgIcIAAgCEH/////AXE2AhggACAHQf////8BcTYCFCAAIAZB/////wFxNgIQIAAgBUH/////AXE2AgwgACAEQf////8BcTYCCCAAIANB/////wFxNgIEIAAgAkH/////AXE2AgAgACAJQR12IAtqIAFBgIDAAHFqQf////8BcTYCIAueBAIQfwN+IwBB0AhrIgIkACACQShqIAFBgAj8CgAAIAJCgoCAgBA3AsgIIAJCiICAgMAANwLACCACQqCAgICAAjcCuAggAkKAgYCAgAg3ArAIIAJBsAhqIQwDQCAMIAhBAnRqKAIAIgZBAXQiCUUEQEGI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iHwiBKdB////D3E2AhwgACAOIA1rQfD///8Baq0gBUIaiHwiBadB////D3E2AgwgACAMIAtrQfD///8Daq0gBEIZiHwiBKdB////H3E2AiAgACAGQv///w+DIANC////H4MgBUIZiHwiA0IaiHw+AhQgACADp0H///8fcTYCECAAIAogCWtB8P///wFqrSAEQhqIfCIDp0H///8PcTYCJCAAIAhC////D4MgA0IZiEITfiAHQv///x+DfCIDQhqIfD4CBCAAIAOnQf///x9xNgIAC9oDAQN/IwBBkBxrIgMkAAJAAkAgASACRg0AIANBkBhqIgUgARB+QQBFBEAgA0GOEGogBUGABPwKAAALIARFBEAgA0GODGogA0GOEGpBgAT8CgAACyAERQRAIANBjhRqIANBjgxqQYAE/AoAAAsgBEUEQCADQQxqIANBjhRqQYAE/AoAAAsgAUGABGoiBCACRg0AIAUgBBB+QQAiBEUEQCADQY4QaiAFQYAE/AoAAAsgBEUEQCADQY4MaiADQY4QakGABPwKAAALIARFBEAgA0GOFGogA0GODGpBgAT8CgAACyAERQRAIANBjARqIANBjhRqQYAE/AoAAAsgAUGACGoiBCACRg0AIAUgBBB+QQAiBEUEQCADQY4QaiAFQYAE/AoAAAsgBEUEQCADQY4MaiADQY4QakGABPwKAAALIARFBEAgA0GOFGogA0GODGpBgAT8CgAACyAERQRAIANBjAhqIANBjhRqQYAE/AoAAAsgACADQQxqQYAM/AoAACABQYAMaiIAIAJHDQEgA0GQHGokAA8LQcikwABBL0GIpcAAEIwCAAsgA0EOaiAAEH4gA0EANgIcIANBATYCECADQayAwAA2AgwgA0IENwIUIANBDGpBqKTAABDEAgALwgMBCX8jAEEgayICJAACQAJ/AkACQAJAIAEoAhQiAyABKAIQIgVPDQBBACAFayEEIANBAmohAyABQQxqIQcgASgCDCEIA0AgAyAIaiIGQQJrLQAAIglBCWsiCkEXS0EBIAp0QZOAgARxRXJFBEAgASADQQFrNgIUIAQgA0EBaiIDakECRw0BDAILCyAJQe4ARw0AIAEgA0EBayIENgIUIAQgBU8NAiABIAM2AhQCQCAGQQFrLQAAQfUARw0AIAMgBCAFIAQgBUsbIgVGDQMgASADQQFqIgQ2AhQgBi0AAEHsAEcNACAEIAVGDQMgASADQQJqNgIUIAZBAWotAABB7ABGDQILIAJBCTYCFCACQQhqIAcQogIgAkEUaiACKAIIIAIoAgwQoAIMAwsgAkEUaiABEJsBIAIoAhRBgICAgHhGBEAgACACKAIYNgIEIABBgYCAgHg2AgAMBAsgACACKQIUNwIAIABBCGogAkEcaigCADYCAAwDCyAAQYCAgIB4NgIADAILIAJBBTYCFCACIAcQogIgAkEUaiACKAIAIAIoAgQQoAILIQMgAEGBgICAeDYCACAAIAM2AgQLIAJBIGokAAv9AgEIfyMAQcAIayIDJAAgA0HgBWpBAEHIAfwLACADQbAHakEAQYkB/AsAIANCADcD2AUgA0EYNgKoByADQQhqIANB2AVqIAFBwAAQUiACQSBqIQEDQCADQdgFaiADQQhqQegC/AoAACADQfACaiIEIANB2AVqIgUgAigCACACQQRqKAIAEFIgA0EIaiIGIARB6AL8CgAAIAJBCGoiAiABRw0ACyADQZAGaiIBQgA3AwAgA0GIBmoiAkIANwMAIANBgAZqIgRCADcDACADQfgFaiIHQgA3AwAgA0HwBWoiCEIANwMAIANB6AVqIglCADcDACADQeAFaiIKQgA3AwAgA0IANwPYBSAGIAVBwAAQQyAAQThqIAEpAwA3AAAgAEEwaiACKQMANwAAIABBKGogBCkDADcAACAAQSBqIAcpAwA3AAAgAEEYaiAIKQMANwAAIABBEGogCSkDADcAACAAQQhqIAopAwA3AAAgACADKQPYBTcAACADQcAIaiQAC+cCAQV/IwBB8AFrIgIkACACQaABaiIDIAFB0ABqEC0gAkHwAGogAkHAAWopAgA3AwAgAkHoAGogAkG4AWopAgA3AwAgAkHgAGogAkGwAWopAgA3AwAgAkHYAGogAkGoAWopAgA3AwAgAiACKQKgATcDUCACQZgBaiACQegBaikCADcDACACQZABaiACQeABaikCADcDACACQYgBaiACQdgBaikCADcDACACQYABaiACQdABaikCADcDACACIAIpAsgBNwN4IAMgAkHQAGoiBkEFEFkgAkEIaiIEIAMgAkH4AGoiBRAyIAUgASAEEDIgAyABQShqIAQQMiACQTBqIAMQSyAGIAUQSyACLQBQQQFxEOQCIQEg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czYCNCACIAIoAqgDIgFBBHYgAXNBgJi8GHFBEWwgAXMiAUECdiABc0GA5oCYA3FBBWwgAXM2AqgDIAIgAigCrAMiAUEEdiABc0GAmLwYcUERbCABcyIBQQJ2IAFzQYDmgJgDcUEFbCABczYCrAMgAiACKAKwAyIBQQR2IAFzQYCYvBhxQRFsIAFzIgFBAnYgAXNBgOaAmANxQQVsIAFzNgKwAyACIAIoArwDIgFBBHYgAXNBgJi8GHFBEWwgAXMiAUECdiABc0GA5oCYA3FBBWwgAXM2ArwDIAIoAqADIQEgAigCpAMhByACKAK0AyEDIAIoArgDIQQgAiACKAI4QX9zNgI4IAIgAigCQEF/czYCQCACIAIoAkRBf3M2AkQgAiACKAJUQX9zNgJUIAIgAigCWEF/czYCWCACIAIoAmBBf3M2AmAgAiACKAJkQX9zNgJkIAIgAigCdEF/czYCdCACIAIoAnhBf3M2AnggAiACKAKAAUF/czYCgAEgAiACKAKEAUF/czYChAEgAiACKAKUAUF/czYClAEgAiACKAKYAUF/czYCmAEgAiACKAKgAUF/czYCoAEgAiACKAKkAUF/czYCpAEgAiACKAK0AUF/czYCtAEgAiACKAK4AUF/czYCuAEgAiACKALAAUF/czYCwAEgAiACKALEAUF/czYCxAEgAiACKALUAUF/czYC1AEgAiACKALYAUF/czYC2AEgAiACKALgAUF/czYC4AEgAiACKALkAUF/czYC5AEgAiACKAL0AUF/czYC9AEgAiACKAL4AUF/czYC+AEgAiACKAKAAkF/czYCgAIgAiACKAKEAkF/czYChAIgAiACKAKUAkF/czYClAIgAiACKAKYAkF/czYCmAIgAiACKAKgAkF/czYCoAIgAiACKAKkAkF/czYCpAIgAiACKAK0AkF/czYCtAIgAiACKAK4AkF/czYCuAIgAiACKALAAkF/czYCwAIgAiACKALEAkF/czYCxAIgAiACKALUAkF/czYC1AIgAiACKALYAkF/czYC2AIgAiACKALgAkF/czYC4AIgAiACKALkAkF/czYC5AIgAiACKAL0AkF/czYC9AIgAiACKAL4AkF/czYC+AIgAiACKAKAA0F/czYCgAMgAiACKAKEA0F/czYChAMgAiACKAKUA0F/czYClAMgAigCmAMhBiAC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ACADQagBaiEDIApBqAFrIgoNAAsLIAdFDQAgBkEIaiABQagB/AoAACABIAEoAsgBEJIDIAcEQCAEIAlqIAZBCGogB/wKAAALIAggBkEIakGoAfwKAAALIAEgBzoA+AIgACACNgIEIAAgBTYCACAGQbABaiQAC9ECAQR/IwBB4A1rIgIkACACQQhqQQBBgAj8CwAgAkH4CmpBAEHIAfwLACACQcgMakEAQYkB/AsAIAJCADcD8AogAkEYNgLADCACQYgIaiIDIAJB8ApqIgQgAUEgEFIgAkIANwPwCiADIARBCBBDIAJBADoA3w0CQEHZASIDQf8BTQRAA0AgAkGICGogAkHfDWpBARBDIAItAN8NIgEgA0sEQANAIAJBiAhqIAJB3w1qQQEQQyADIAItAN8NIgFJDQALCyACQQhqIgQgA0ECdGogAUECdCAEaiIEKAIANgIAIANB2QFrIgVBA3YhASAFQcAATw0CIARBgMD/A0EBIAJB8ApqIAFqLQAAIANBJ2pBB3F2QQFxGzYCACADQQFqIgEhAyABQYACRw0ACwsgACACQQhqQYAI/AoAACACQeANaiQADwsgAUEIQcDBwQAQhgIAC5ADAQV/IwBB0ABrIgIkACACQSBqIAFBCGooAgA2AgAgAkGAAToAJCACQQA2AhQgAkKAgICAEDcCDCACIAEpAgA3AhggACACQQxqECECQCAALQAAQQZGDQAgAkE4aiAAQRBqKQMANwMAIAJBMGogAEEIaikDADcDACACIAApAwA3AyggAigCICIBIAIoAhwiA08NACACQRhqIQQgAigCGCEFAkADQCABIAVqLQAAQQlrIgZBF0tBASAGdEGTgIAEcUVyDQEgAyABQQFqIgFHDQALIAIgAzYCIAwBCyACIAE2AiAgAkEWNgJEIAIgBBCRAiACQcQAaiACKAIAIAIoAgQQoAIhASAAQQY6AAAgACABNgIEAkACQAJAIAItACgOBQMDAwECAAsgAkEoakEEchD6AQwCCyACKAIsIgBFDQEgAigCMCAAQQEQ9wIMAQsgAkEoakEEchDQASACKAIsIgBFDQAgAigCMCAAQRhsQQgQ9wILIAIoAgwiAARAIAIoAhAgAEEBEPcCCyACQdAAaiQAC4IDAQR/IAAoAgwhAgJAAkACQCABQYACTwRAIAAoAhghAwJAAkAgACAC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BGo2AgggASgCBCAAakHu6rHjBjYAAEEADAELIAQgBCkDADcDCCAEQQhqELMCCyAEQRBqJAALswIBAX8jAEHwAGsiBiQAIAYgATYCDCAGIAA2AgggBiADNgIUIAYgAjYCECAGQYDXxAAoAgA2AhwgBkH01sQAKAIANgIYAkAgBCgCAARAIAZBMGogBEEQaikCADcDACAGQShqIARBCGopAgA3AwAgBiAEKQIANwMgIAZBBDYCXCAGQbTWxAA2AlggBkIENwJkIAYgBkEQaq1CgICAgKAPhDcDUCAGIAZBCGqtQoCAgICgD4Q3A0ggBiAGQSBqrUKAgICAsA+ENwNADAELIAZBAzYCXCAGQYDWxAA2AlggBkIDNwJkIAYgBkEQaq1CgICAgKAPhDcDSCAGIAZBCGqtQoCAgICgD4Q3A0ALIAYgBkEYaq1CgICAgOAOhDcDOCAGIAZBOGo2AmAgBkHYAGogBRDEAgALzQIBA38CQAJAAkACQCABQQdqIgJB+ABPDQAgAUEPaiIEQfgATw0CIAAgBEECdGogACACQQJ0aigCADYCACABQQZqIgJB+ABPDQAgACABQQJ0aiIDQThqIAAgAkECdGooAgA2AgAgAUEFaiICQfgATw0AIANBNGogACACQQJ0aigCADYCACABQQRqIgJB+ABPDQAgA0EwaiAAIAJBAnRqKAIANgIAIAFBA2oiAkH4AE8NACADQSxqIAAgAkECdGooAgA2AgAgAUECaiICQfgATw0AIANBKGogACACQQJ0aigCADYCACABQQFqIgJB+ABPDQAgA0EkaiAAIAJBAnRqKAIANgIAIAFB+ABJDQEgASECCyACQfgAQdCJxAAQhgIACyABQQhqIgRB+ABJDQELIARB+ABB4InEABCGAgALIAAgBEECdGogAygCADYCAAuYBAEHfyMAQeAFayICJABB4AAhAyACQfwAaiIEQQBB4AD8CwAgAkEANgLcASACQcjEwAA2AnggAiABNgJ0IAJBADsBcCABQdABaiEGAkACQAJAIAEtAPgCIgUEQCAFQcgASQ0CQagBIAVrIgcEQCAEIAUgBmogB/wKAAALIAVByABrIgNFDQEgBCAHaiEECyACQeABaiABQagB/AoAACABIAEoAsgBEJIDIAMEQCAEIAJB4AFqIAP8CgAACyAGIAJB4AFqQagB/AoAAAwCC0EAIQMMAQsgBCAFIAZqQeAA/AoAACAFQeAAaiEDCyABIAM6APgCIAIgAkHwAGpB8AD8CgAAQQAhAQNAIAJB4AFqIgcgAWoCfwJAIAIvAQBFBEAgAkEMaiEGIAIoAmwhAwJAA0ACQCADQeAARgRAIAIoAgQgBkHgACACKAIIKAIMEQMAQQAhA0EDIQUMAQsgA0EDaiEFIANB3gBPDQILIAIgBTYCbCADIAZqIgMtAAJBBHQgAy0AASIIQQR2ciEEIAMtAAAgCEEIdEGAHnFyIgNBgRpPBEAgBSEDIARBgRpPDQEMBAsLIAMgBEGAGksNAxogAiAEOwECIAJBATsBACADDAMLIAMgBUHgAEHQ0cEAEKQCAAsgAkEAOwEAIAIvAQIhBAsgBAs7AQAgAUECaiIBQYAERw0ACyAAIAdBgAT8CgAAIAJB4AVqJAAL6wIBBn4gAEHw////AyABKAIYa61B8P///wEgASgCFGutQfD///8DIAEoAhBrrSICQhqIfCIFQhmIfCIDp0H///8fcTYCGCAAQfD///8DIAEoAghrrUHw////ASABKAIEa61B0P3//wMgASgCAGutIgZCGoh8IgdCGYh8IgSnQf///x9xNgIIIABB8P///wEgASgCHGutIANCGoh8IgOnQf///w9xNgIcIABB8P///wEgASgCDGutIARCGoh8IgSnQf///w9xNgIMIABB8P///wMgASgCIGutIANCGYh8IgOnQf///x9xNgIgIAAgBUL///8PgyACQv///x+DIARCGYh8IgJCGoh8PgIUIAAgAqdB////H3E2AhAgAEHw////ASABKAIka60gA0IaiHwiAqdB////D3E2AiQgACAHQv///w+DIAJCGYhCE34gBkL///8fg3wiAkIaiHw+AgQgACACp0H///8fcTYCAAvjAgEHfyABIAEtAEgiA2ohBEHIACADayIDBEAgBEEAIAP8CwALIAFBADoASCAEQQY6AAAgASABLQBHQYABcjoARyAAIAApAwAgASkAAIU3AwAgAEEIaiIEIAQpAwAgASkACIU3AwAgAEEQaiIDIAMpAwAgASkAEIU3AwAgAEEYaiIFIAUpAwAgASkAGIU3AwAgAEEgaiIGIAYpAwAgASkAIIU3AwAgAEEoaiIHIAcpAwAgASkAKIU3AwAgAEEwaiIIIAgpAwAg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QQAgAmsQVgsgA0EQaiQAC/oBAQN/IwBBEGsiAiQAIAAoAgAhAAJ/IAEtAAtBGHFFBEAgASgCACAAIAEoAgQoAhARAAAMAQsgAkEANgIMIAEgAkEMagJ/IABBgAFPBEAgAEE/cUGAf3IhAyAAQQZ2IQEgAEGAEEkEQCACIAM6AA0gAiABQcABcjoADEECDAILIABBDHYhBCABQT9xQYB/ciEBIABB//8DTQRAIAIgAzoADiACIAE6AA0gAiAEQeABcjoADEEDDAILIAIgAzoADyACIAE6AA4gAiAEQT9xQYB/cjoADSACIABBEnZBcHI6AAxBBAwBCyACIAA6AAxBAQsQYgsgAkEQaiQAC7cqAhV/A34jAEHAAWsiDCQAIAxB0ABqIQkgAygCBCIVQQAgAygCACISQYCAgIB4RxshByADKAIIIQgjAEHwA2siAyQAIANBuANqQgA3AwAgA0GwA2pCADcDACADQagDakIANwMAIANCADcDoAMgA0GIAmogByADQaADaiAHGyAIQSAgBxsQPUEAIQcDQCADQYgCaiIKIAdqIgggCC0AAEE2czoAACAIQQFqIgsgCy0AAEE2czoAACAIQQJqIgsgCy0AAEE2czoAACAIQQNqIgggCC0AAEE2czoAACAHQQRqIgdBwABHDQALQQAhByADQeADakGQvcAAKQMANwMAIANB2ANqQYi9wAApAwA3AwAgA0HQA2pBgL3AACkDADcDACADQgE3A+gDIANB+LzAACkDADcDyAMgA0HIA2ogCkEBEBwDQCADQYgCaiIKIAdqIgggCC0AAEHqAHM6AAAgCEEBaiILIAstAABB6gBzOgAAIAhBAmoiCyALLQAAQeoAczoAACAIQQNqIgggCC0AAEHqAHM6AAAgB0EEaiIHQcAARw0ACyADQRhqIgdBkL3AACkDADcDACADQRBqIghBiL3AACkDADcDACADQQhqIgtBgL3AACkDADcDACADQSBqIg5CATcDACADQfi8wAApAwA3AwAgAyAKQQEQHCADQeABaiAOKQMANwMAIANB2AFqIAcpAwA3AwAgA0HQAWogCCkDADcDACADQcgBaiALKQMANwMAIANBoAFqIANB0ANqKQMANwMAIANBqAFqIANB2ANqKQMANwMAIANBsAFqIANB4ANqKQMANwMAIANBuAFqIANB6ANqKQMA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IAFBgeD/AUkbIgEgASACSRshASADQQxqIgNB/AdHDQALIAELrAEBAX8gACgCACIBBEAgACgCBCABQQEQ9wILIAAoAgwiAQRAIAAoAhAgAUEBEPcCCyAAKAIkIgFBgICAgHhGIAFFckUEQCAAKAIoIAFBARD3AgsgACgCGCIBBEAgACgCHCABQQEQ9wILIAAoAjAiAUGAgICAeEYgAUVyRQRAIAAoAjQgAUEBEPcCCyAAKAI8IgFBgICAgHhGIAFFckUEQCAAKAJAIAFBARD3AgsLyisCNH8QfiMAQUBqIhQkACAUQRhqIAJBGGopAAA3AwAgFEEQaiACQRBqKQAANwMAIBRBCGogAkEIaikAADcDACAUIAIpAAA3AwAgFEE4aiABQRhqKQAANwMAIBRBMGogAUEQaikAADcDACAUQShqIAFBCGopAAA3AwAgFCABKQAANwMgIwBBIGsiLSQAIBRBIGoiASABLQAfQT9xQcAAcjoAHyABIAEtAABB+AFxOgAAIC1BCGogAUEIaikAADcDACAtQRBqIAFBEGopAAA3AwAgLUEYaiABQRhqKQAANwMAIC0gASkAADcDACAAIQJBACEBIwBBoANrIgMkACADQQhqIBQQfyADQdAAakGQicQAKQIAIjc3AwAgA0HIAGpBiInEACkCACI5NwMAIANBQGtBgInEACkCACI4NwMAIANBOGpB+IjEACkCACI6NwMAIANB4ABqQgA3AwAgA0HoAGpCADcDACADQfAAakIANwMAIANB+ABqQgA3AwAgA0HwiMQAKQIAIjs3AzAgA0IANwNYIANBoAFqIANBKGopAgA3AwAgA0GYAWogA0EgaikCADcDACADQZABaiADQRhqKQIANwMAIANBiAFqIANBEGopAgA3AwAgA0GwAWogOjcDACADQbgBaiA4NwMAIANBwAFqIDk3AwAgA0HIAWogNzcDACADIAMpAgg3A4ABIAMgOzcDqAEgA0EAOgDXASADQQE2AtwCIANCgICAgIAgNwLUAiADIC02AtACIANB2ABqIS9BASEGAkACQANAAkACQCAGRQRAIAMoAtgCIgAgAygC1AJNDQIgAyAAQQFrIgQ2AtgCIARBA3YhBSAAQYECTw0EIAMoAtACIAVqLQAAIARBB3F2QQFxIQAMAQsgA0EANgLcAgJ/QQAhACADQdACaiIE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ASkDmAUgPEIaiHwiPKdB////D3E2AqwBIAEgASkDwAUgOEIZiHwiOKdB////H3E2AsABIAEgOUL///8PgyA3Qv///x+DIDxCGYh8IjdCGoh8PgK0ASABIDenQf///x9xNgKwASABIAEpA8gFIDhCGoh8IjenQf///w9xNgLEASABIDtC////D4MgN0IZiEITfiA6Qv///x+DfCI3QhqIfD4CpAEgASA3p0H///8fcTYCoAEgBiAHEF0gASABKQPIBSABKQPABSABKQO4BSABKQOwBSABKQOoBSABKQOgBSI3QhqIfCI5QhmIfCI4QhqIfCI6QhmIfCI7QhqIfCI8QhmIQhN+IAEpA4AFIj1C////H4N8Ij6nQf///x9xIgo2AsgBIAEgASkDiAUgPUIaiHwiPUL///8PgyA+QhqIfKciCzYCzAEgASA3Qv///x+DIAEpA5gFIAEpA5AFID1CGYh8IjdCGoh8Ij1CGYh8Ij6nQf///x9xIgw2AtgBIAEgOUL///8PgyA+QhqIfKciDTYC3AEgASA3p0H///8fcSIONgLQASABID2nQf///w9xIg82AtQBIAEgOKdB////H3EiEDYC4AEgASA6p0H///8PcSIRNgLkASABIDunQf///x9xIhI2AugBIAEgPKdB////D3EiGjYC7AEgAUHwAWoiCCABQaABaiIbIAFByAFqIhwQiwEgAUGYAmoiHSABIAkQMiABQcACaiIJIAcgAUHQAGoQMiABKAKYAiEHIAEoAsACIR4gASgCnAIhHyABKALEAiEmIAEoAqACIScgASgCyAIhKCABKAKkAiEpIAEoAswCISogASgCqAIhKyABKALQAiEsIAEoAqwCIS4gASgC1AIhMCABKAKwAiExIAEoAtgCITIgASgCtAIhMyABKALcAiE0IAEoArgCITUgASgC4AIhNiABIAEoAuQCIAEoArwCajYCjAMgASA1IDZqNgKIAyABIDMgNGo2AoQDIAEgMSAyajYCgAMgASAuIDBqNgL8AiABICsgLGo2AvgCIAEgKSAqajYC9AIgASAnIChqNgLwAiABIB8gJmo2AuwCIAEgByAeajYC6AIgAUGQA2oiByAdIAkQiwEgBiABQegCahBdIAEpA5gFITggASkDkAUhOiABKQOIBSE7IAEpA4AFITcgASkDyAUhPCABKQPABSE9IAEpA7gFIT4gASkDsAUhQSABKQOoBSFCIAEpA6AFITkgBiAHEF0gASABKQOwBSABKQOoBSABKQOgBSI/QhqIfCJEQhmIfCJAp0H///8fcTYC0AMgASABKQOQBSABKQOIBSABKQOABSJFQhqIfCJGQhmIfCJDp0H///8fcTYCwAMgASABKQO4BSBAQhqIfCJAp0H///8PcTYC1AMgASABKQOYBSBDQhqIfCJDp0H///8PcTYCxAMgASABKQPABSBAQhmIfCJAp0H///8fcTYC2AMgASBEQv///w+DID9C////H4MgQ0IZiHwiP0IaiHw+AswDIAEgP6dB////H3E2AsgDIAEgASkDyAUgQEIaiHwiP6dB////D3E2AtwDIAEgRkL///8PgyA/QhmIQhN+IEVC////H4N8Ij9CGoh8PgK8AyABID+nQf///x9xNgK4AyABQeADakGYicQAIAgQMiABQYgEaiAbIBwQMiABIAEoAoQEIBpqNgKkBSABIAEoAoAEIBJqNgKgBSABIAEoAvwDIBFqNgKcBSABIAEoAvgDIBBqNgKYBSABIAEoAvQDIA1qNgKUBSABIAEoAvADIAxqNgKQBSABIAEoAuwDIA9qNgKMBSABIAEoAugDIA5qNgKIBSABIAEoAuQDIAtqNgKEBSABIAEoAuADIApqNgKABSABQbAEaiAIIAYQMiABQdgEaiADQQhqIAFBuANqEDIgJSABQagEaikCADcCACAjIAFBoARqKQIANwIAICEgAUGYBGopAgA3AgAgFSABQZAEaikCADcCACAFIAEpAogENwIAIAUgASkCsAQ3AiggEyABQbgEaikCADcCACAgIAFBwARqKQIANwIAICIgAUHIBGopAgA3AgAgJCABQdAEaikCADcCACAEIDwgPSA+IEEgQiA5QhqIfCJCQhmIfCJBQhqIfCI+QhmIfCI9QhqIfCI8p0H///8PcTYCJCAEID2nQf///x9xNgIgIAQgPqdB////D3E2AhwgBCBBp0H///8fcTYCGCAEIEJC////D4MgOUL///8fgyA4IDogOyA3QhqIfCI5QhmIfCI6QhqIfCI4QhmIfCI7QhqIfD4CFCAEIDunQf///x9xNgIQIAQgOKdB////D3E2AgwgBCA6p0H///8fcTYCCCAEIDlC////D4MgPEIZiEITfiA3Qv///x+DfCI3QhqIfD4CBCAEIDenQf///x9xNgIAIAQgASkC2AQ3AiggFiABQeAEaikCADcCACAXIAFB6ARqKQIANwIAIBggAUHwBGopAgA3AgAgGSABQfgEaikCADcCACABQdAFaiQAIAMgADoA1wEgAygC3AIhBiAAIQEMAQsLIAEQ5AIhACADKAKAASEBIAMoAjAhBCADKAKEASEFIAMoAjQhBiADKAKIASEHIAMoAjghCCADKAKMASETIAMoAjwhFSADKAKQASEgIAMoAkAhISADKAKUASEiIAMoAkQhFiADKAKYASEjIAMoAkghFyADKAKcASEkIAMoAkwhGCADKAKgASElIAMoAlAhCSADKAKkASEZIAMoAlQhCiADKAKoASELIAMoAlghDCADKAKsASENIAMoAlwhDiADKAKwASEPIAMoAmAhECADKAK0ASERIAMoAmQhEiADKAK4ASEaIAMoAmghGyADKAK8ASEcIAMoAmwhHSADKALAASEeIAMoAnAhHyADKALEASEmIAMoAnQhJyADKALIASEoIAMoAnghKSADQQAgAEH/AXFrIgAgAygCzAEiKiADKAJ8IitzcSIsICtzNgJ8IAMgKSAoIClzIABxIitzNgJ4IAMgJyAmICdzIABxIilzNgJ0IAMgHyAeIB9zIABxIidzNgJwIAMgHSAcIB1zIABxIh9zNgJsIAMgGyAaIBtzIABxIh1zNgJoIAMgEiARIBJzIABxIhtzNgJkIAMgECAPIBBzIABxIhJzNgJgIAMgDiANIA5zIABxIhBzNgJcIAMgDCALIAxzIABxIg5zNgJYIAMgCiAKIBlzIABxIgxzNgJUIAMgCSAJICVzIABxIgpzNgJQIAMgGCAYICRzIABxIglzNgJMIAMgFyAXICNzIABxIhhzNgJIIAMgFiAWICJzIABxIhdzNgJEIAMgISAgICFzIABxIhZzNgJAIAMgFSATIBVzIABxIiFzNgI8IAMgCCAHIAhzIABxIhVzNgI4IAMgBiAFIAZzIABxIghzNgI0IAMgBCABIARzIABxIgBzNgIwIAMgKiAsczYCzAEgAyAoICtzNgLIASADICYgKXM2AsQBIAMgHiAnczYCwAEgAyAcIB9zNgK8ASADIBogHXM2ArgBIAMgESAbczYCtAEgAyAPIBJzNgKwASADIA0gEHM2AqwBIAMgCyAOczYCqAEgAyAMIBlzNgKkASADIAogJXM2AqABIAMgCSAkczYCnAEgAyAYICNzNgKYASADIBcgInM2ApQBIAMgFiAgczYCkAEgAyATICFzNgKMASADIAcgFXM2AogBIAMgBSAIczYChAEgAyAAIAFzNgKAASADQQA6ANcBIANB0AJqIgAgLxAtIANBoAJqIANB8AJqKQIANwMAIANBmAJqIANB6AJqKQIANwMAIANBkAJqIANB4AJqKQIANwMAIANBiAJqIANB2AJqKQIANwMAIAMgAykC0AI3A4ACIANByAJqIANBmANqKQIANwMAIANBwAJqIANBkANqKQIANwMAIANBuAJqIANBiANqKQIANwMAIANBsAJqIANBgANqKQIANwMAIAMgAykC+AI3A6gCIAAgA0GAAmpBBRBZIANB2AFqIgEgACADQagCahAyIAAgA0EwaiABEDIgAiAAEEsgA0GgA2okAAwBCyAFQSBBwInEABCGAgALIC1BIGokACAUQUBrJAALkQEBBn8jAEGABGsiBSQAA0AgAyAFaiIGIAIgA2oiBy8BACABIANqIggvAQBqIgQgBEGBGmsgBEH//wNxQYEaSRs7AQAgBkECaiAHQQJqLwEAIAhBAmovAQBqIgQgBEGBGmsgBEH//wNxQYEaSRs7AQAgA0EEaiIDQYAERw0ACyAAIAVBgAT8CgAAIAVBgARqJAALhQEBBH8jAEGABGsiAiQAIAJBAEGABPwLAANAIAIgA2oiBEECaiABLQAAIgVBBHY7AQAgBCAFQQ9xOwEAIARBBmogAUEBai0AACIFQQR2OwEAIARBBGogBUEPcTsBACABQQJqIQEgA0EIaiIDQYAERw0ACyAAIAJBgAT8CgAAIAJBgARqJAALpAEBAn8jAEEwayICJABBASEDAkAgAUGW2MEAQRsQ5gINAAJAIAAoAgAEQCACIAA2AgwgAkECNgIUIAJBuNjBADYCECACQgE3AhwgAiACQQxqrUKAgICAgAiENwMoIAIgAkEoajYCGCABKAIAIAEoAgQgAkEQahBuRQ0BDAILIAFByNjBAEEEEOYCDQELIAFBzNjBAEECEOYCIQMLIAJBMGokACADC5MBAgF/AX4jAEEwayICJAACfyAAKAIAIgAoAgxFBEAgACABEKsBDAELIAJBAzYCBCACQbzrwAA2AgAgAkID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DBCgAiEBIABBFEEEEPcCCyACQSBqJAAgAQu9AwEHfyMAQRBrIgMkACAAKAIIIQUgACgCBCEAIAEoAgBBr6rEAEEBIAEoAgQoAgwRAgAhBCADQQRqIgJBADoABSACIAQ6AAQgAiABNgIAIAUEQANAIAMgADYCDCADQQxqIQcjAEEgayIBJABBASEGAkAgA0EEaiIELQAEDQAgBC0ABSEIAkAgBCgCACICLQAKQYABcUUEQCAIQQFxRQ0BIAIoAgBBgarEAEECIAIoAgQoAgwRAgBFDQEMAgsgCEEBcUUEQCACKAIAQYOqxABBASACKAIEKAIMEQIADQILIAFBAToADyABQYyqxAA2AhQgASACKQIANwIAIAEgAikCCDcCGCABIAFBD2o2AgggASABNgIQIAcgAUEQakGUvsAAKAIAEQAADQEgASgCEEGEqsQAQQIgASgCFCgCDBECACEGDAELIAcgAkGUvsAAKAIAEQAAIQYLIARBAToABSAEIAY6AAQgAUEgaiQAIABBAWohACAFQQFrIgUNAAsLQQEhACADQQRqIgEtAARFBEAgASgCACIAKAIAQbCqxABBASAAKAIEKAIMEQIAIQALIAEgADoABCADQRBqJAAgAAuOAQEBfwJAAkAgAEGEAU8EQCAA0G8mAUHA18QAKAIADQFBwNfEAEF/NgIAIABB1NfEACgCACIBSQ0CIAAgAWsiAEHM18QAKAIATw0CQcjXxAAoAgAgAEECdGpB0NfEACgCADYCAEHQ18QAIAA2AgBBwNfEAEHA18QAKAIAQQFqNgIACw8LQbyUxAAQlAMLAAt9AwF/AX4BfCMAQRBrIgMkAAJAAkACQAJAIAAoAgBBAWsOAgECAAsgACsDCCEFIANBAzoAACADIAU5AwgMAgsgACkDCCEEIANBAToAACADIAQ3AwgMAQsgACkDCCEEIANBAjoAACADIAQ3AwgLIAMgASACEOwBIANBEGokAAu7BQETfyMAQcABayIDJAAgA0G4AWogAUEYaikAADcDACADQbABaiABQRBqKQAANwMAIANBqAFqIAFBCGopAAA3AwAgAyABKQAANwOgASMAQSBrIgEkACADQaABaiIEIAQtAB9BP3FBwAByOgAfIAQgBC0AAEH4AXE6AAAgAUEIaiAEQQhqKQAANwMAIAFBEGogBEEQaikAADcDACABQRhqIARBGGopAAA3AwAgASAEKQAANwMAIAMgARAgIAFBIGokACMAQaACayICJAAgAygCKCEFIAMoAlAhBiADKAIsIQcgAygCVCEIIAMoAjAhCSADKAJYIQogAygCNCELIAMoAlwhDCADKAI4IQ0gAygCYCEOIAMoAjwhDyADKAJkIRAgAygCQCERIAMoAmghEiADKAJEIRMgAygCbCEUIAMoAkghBCADKAJwIQEgAiADKAJMIAMoAnRqNgIsIAIgASAEajYCKCACIBMgFGo2AiQgAiARIBJqNgIgIAIgDyAQajYCHCACIA0gDmo2AhggAiALIAxqNgIUIAIgCSAKajYCECACIAcgCGo2AgwgAiAFIAZqNgIIIAJBMGoiASADQdAAaiADQShqEIsBIAJB0AFqIgQgARAtIAJBoAFqIAJB8AFqKQIANwMAIAJBmAFqIAJB6AFqKQIANwMAIAJBkAFqIAJB4AFqKQIANwMAIAJBiAFqIAJB2AFqKQIANwMAIAIgAikC0AE3A4ABIAJByAFqIAJBmAJqKQIANwMAIAJBwAFqIAJBkAJqKQIANwMAIAJBuAFqIAJBiAJqKQIANwMAIAJBsAFqIAJBgAJqKQIANwMAIAIgAikC+AE3A6gBIAQgAkGAAWpBBRBZIAJB2ABqIgEgBCACQagBahAyIAQgAkEIaiABEDIgACAEEEsgAkGgAmokACADQcABaiQACxIAIwBBMGsiACQAIABBMGokAAtnAQN/IwBBEGsiASQAIAFBBGogACgCACICIAAoAgRBCCACQQF0IgIgAkEITRsiAhD1ASABKAIEQQFGBEAgASgCCCABKAIMEN0CAAsgASgCCCEDIAAgAjYCACAAIAM2AgQgAUEQaiQAC2oCAX8BfiMAQTBrIgMkACADIAE2AgQgAyAANgIAIANBAjYCDCADQbTVxAA2AgggA0ICNwIUIANCgICAgKACIgQgA62ENwMoIAMgBCADQQRqrYQ3AyAgAyADQSBqNgIQIANBCGogAhDEAgALZgAgAEGBCEkEQEGACA8LIABBgSBJBEBBgCAPCyAAQYGAAUkEQEGAgAEPCyAAQYGABEkEQEGAgAQPCyAAQYGAEEkEQEGAgBAPCyAAQYGAwABJBEBBgIDAAA8LIABB//8/akGAgEBxC18BAX8jAEEwayICJAAgAiABNgIMIAIgADYCCCACQQI2AhQgAkGovcAANgIQIAJCATcCHCACIAJBCGqtQoCAgICAAoQ3AyggAiACQShqNgIYIAJBEGoQwQEgAkEwaiQAC18BAX8jAEEwayICJAAgAiABNgIMIAIgADYCCCACQQI2AhQgAkH4vcAANgIQIAJCATcCHCACIAJBCGqtQoCAgICAAoQ3AyggAiACQShqNgIYIAJBEGoQwQEgAkEwaiQAC1oBAn8CQCACQQBIDQACQCACRQRAQQEhAwwBC0EBIQQgAkEBEIEDIgNFDQELIAAgAzYCBCAAIAI2AgAgAgRAIAMgASAC/AoAAAsgACACNgIIDwsgBCACEN0CAAtrAQJ/IAAoAgAhASAAQYCAxAA2AgACQCABQYCAxABHDQBBgIDEACEBIAAoAgQiAiAAKAIIRg0AIAAgAkEBajYCBCAAIAAoAgwiACACLQAAIgFBD3FqLQAANgIAIAAgAUEEdmotAAAhAQsgAQtbAQF/IwBBMGsiAyQAIAMgATYCDCADIAA2AgggA0EBNgIUIANB4KfEADYCECADQgE3AhwgAyADQQhqrUKAgICA4A6ENwMoIAMgA0EoajYCGCADQRBqIAIQxAIAC1QBAX8jAEEgayICJAAgAkEYaiABQRhqKQAANwMAIAJBEGogAUEQaikAADcDACACQQhqIAFBCGopAAA3AwAgAiABKQAANwMAIAAgAhAuIAJBIGokAAtUAQF/IwBBIGsiAiQAIAJBATYCBCACQYSLxAA2AgAgAkIBNwIMIAIgAK1CgICAgJAIhDcDGCACIAJBGGo2AgggASgCACABKAIEIAIQbiACQSBqJAALwgIBBn8jAEEQayICJAACfyAAKAIAIgAtAABBAUYEQCACIABBAWo2AgwgAkEMaiEEIwBBIGsiACQAQQEhBQJAIAEoAgAiA0Hkv8AAQQQgASgCBCIHKAIMIgYRAgANAAJAIAEtAApBgAFxRQRAIANBhqrEAEEBIAYRAgANAiAEIAFB4L/AACgCABEAAEUNAQwCCyADQYeqxABBAiAGEQIADQEgAEEBOgAPIAAgBzYCBCAAIAM2AgAgAEGMqsQANgIUIAAgASkCCDcCGCAAIABBD2o2AgggACAANgIQIAQgAEEQakHgv8AAKAIAEQAADQEgACgCEEGEqsQAQQIgACgCFCgCDBECAA0BCyABKAIAQYmqxABBASABKAIEKAIMEQIAIQULIABBIGokACAFDAELIAFB0L/AAEEEEOYCCyACQRBqJAALSwEBfyACIAFrIgIgACgCACAAKAIIIgNrSwRAIAAgAyACEN8BIAAoAgghAwsgAgRAIAAoAgQgA2ogASAC/AoAAAsgACACIANqNgIIC1EBAn8jAEEQayICJAAgAkEIaiABKAIAIAEoAgQiAyABKAIIQQFqIgEgAyABIANJGxBsIAIoAgwhASAAIAIoAgg2AgAgACABNgIEIAJBEGokAAtIAQF/IAAoAgAgACgCCCIDayACSQRAIAAgAyACEN8BIAAoAgghAwsgAgRAIAAoAgQgA2ogASAC/AoAAAsgACACIANqNgIIQQALQwEDfwJAIAJFDQADQCAALQAAIgQgAS0AACIFRgRAIABBAWohACABQQFqIQEgAkEBayICDQEMAgsLIAQgBWshAwsgAwtBAQF/IAAoAggiASAAKAIARgRAIAAgAUEBEN8BIAAoAgghAQsgACgCBCABakGIpsAALQAAOgAAIAAgAUEBajYCCAsgAQF/IwBBIGsiASQAIAFBBDYCBCAAKAAAIAFBIGokAAudDQMLfwF+AW8gASEIQSAhBiMAQRBrIgokAEHs18QALQAAQQFHBEACQCMAQTBrIgMkACADAn8jAEEgayIBJAACQAJAAkBB8NfEAC0AAARAQfTXxAAoAgAhAgwBC0G818QAKAIAIQJBvNfEAEEANgIAIAJFDQEgAhEJACECQfDXxAAtAAANAkH018QAIAI2AgBB8NfEAEEBOgAACyACEPYCIAFBIGokAAwCCyABQQA2AhggAUEBNgIMIAFB7JPEADYCCCABQgQ3AhAgAUEIakH0k8QAEMQCAAsgAkGDAUsEQCACEIECCyABQQA2AhggAUEBNgIMIAFBlJTEADYCCCABQgQ3AhAgAUEIakGclMQAEMQCAAsiBzYCICAHJQEQACEOEKgBIgQgDiYBIAMgBDYCJAJAAkAgA0EkahD4AgRAIAQhAQwBCyAHJQEQASEOEKgBIgEgDiYBIAMgATYCKAJAAkACQAJAIANBKGoQ+AJFDQAgASUBEAIhDhCoASICIA4mASADIAI2AiwgA0EsahD4AkUEQCACQYQBSQ0BIAIQgQIMAQsgAiUBEAMhDhCoASIFIA4mASADIAU2AgggA0EIaigCACUBEBVBAEcgBUGEAU8EQCAFEIECCyACQYQBTwRAIAIQgQILIAFBhAFPBEAgARCBAgtFDQEQBCEOEKgBIgUgDiYBQfzXxAAoAgAhAkH418QAKAIAIQFB+NfEAEIANwIAAkAgAUEBRg0AIAMgBTYCCCADQQhqKAIAJQEQFkUEQCAFIQIMAQsgAyAFNgIsIANB5JHEAEEGEOMCIgk2AgggA0EsaigCACUBIANBIGooAgAlASADQQhqKAIAJQEQEiEOEKgBIgEgDiYBQfzXxAAoAgAhAkH418QAKAIAIQxB+NfEAEIANwIAIAMgAiABIAxBAUYiARs2AgQgAyABNgIAIAMoAgQhAgJAIAMoAgBBAXFFBEAgAq0hDUEAIQEMAQtBAiEBQoyAgIAIIQ0gAkGEAUkNACACEIECCyAJQYQBTwRAIAkQgQILIAVBhAFJDQMgBRCBAgwDC0ECIQFCjoCAgAghDSACQYQBSQ0CIAIQgQIMAgsgAUGEAUkNACABEIECCyAHJQEQBSEOEKgBIgEgDiYBIAMgATYCCCADQQhqEPgCDQEgAUGEAU8EQCABEIECC0ECIQFCh4CAgAghDQsgBEGEAU8EQCAEEIECCwwCCyAEQYQBSQ0AIAQQgQILQYACEAshDhCoASICIA4mASABrSACrUIghoQhDUEBIQELIAdBgwFLBEAgBxCBAgsCQAJAAkBB7NfEAC0AAEEBaw4CAAIBC0Hs18QAQQI6AABB4NfEACgCACIEQQJGDQBB5NfEACgCACECAkAgBEUEQCACQYMBSw0BDAILIAJBhAFPBEAgAhCBAgtB6NfEACgCACICQYQBSQ0BCyACEIECC0Hs18QAQQE6AABB5NfEACANNwIAQeDXxAAgATYCACADQTBqJAAMAQsgA0EANgIYIANBATYCDCADQeyLxAA2AgggA0IENwIQIANBCGpB9IvEABDEAgALCwJAQeDXxAAoAgAiAUECRgRAQeTXxAAoAgAhAQwBCyABQQFxRQRAQQAhAUHk18QAKAIAIQUDQCAGRQ0CIAhB/////wcgBiAGQf////8HTxsiAhAaIQ4QqAEiBCAOJgEgBSUBIAQlASAEEIECEAZB/NfEACgCACEEQfjXxAAoAgBB+NfEAEIANwIAIAYgAmshBiACIAhqIQhBAUcNAAtBjYCAgHghASAEQYQBSQ0BIAQQgQIMAQtB5NfEACgCACEJAkADQEHo18QAKAIAJQFBAEGAAiAGIAZBgAJPGyIFEAwhDhCoASICIA4mASAKIAI2AgwgCSUBIAIlARAHQfzXxAAoAgAhAUH418QAKAIAQfjXxABCADcCAEEBRg0BIAYgBWshBiMAQSBrIgEkACAKQQxqKAIAIgMQlQMhBCADEJUDIQcgASAENgIEIAEgBzYCACAEIAdHBEAgAUEANgIIIAEgAUEEaiABQQhqQfSSxAAQtAIACyAIIAQgAyUBEAogAUEgaiQAIAJBhAFPBEAgAhCBAgsgBSAIaiEIIAYNAAtBACEBDAELIAFBhAFPBEAgARCBAgsgAkGEAU8EQCACEIECC0GIgICAeCEBCyAKQRBqJAACQCABBEBBBEEEEIEDIgtFDQEgCyABNgIACyAAQdiKxAA2AgQgACALNgIADwtBBEEEEIwDAAstAQF/AkAgABAeIgFFDQAgAUEEay0AAEEDcUUgAEVyDQAgAUEAIAD8CwALIAELSAEBfyAAKAIAIAAoAggiA2sgAkkEQCAAIAMgAhDuASAAKAIIIQMLIAIEQCAAKAIEIANqIAEgAvwKAAALIAAgAiADajYCCEEAC0YBAX8gACgCACIBBEAgACgCBCABQQEQ9wILIAAoAgwiAQRAIAAoAhAgAUEBEPcCCyAAKAIYIgEEQCAAKAIcIAFBARD3AgsLTwECfyAAKAIEIQIgACgCACEDAkAgACgCCCIALQAARQ0AIANB7tbEAEEEIAIoAgwRAgBFDQBBAQ8LIAAgAUEKRjoAACADIAEgAigCEBEAAAtOAQF/IwBBEGsiAiQAIAIgACgCACIAQQRqNgIMIAFBuL7AAEEJQcG+wABBCyAAQZi+wABBzL7AAEEJIAJBDGpBqL7AABDeASACQRBqJAALSQEBfyMAQRBrIgMkACADQQhqIAEoAgAgASgCBCABKAIIEGwgAiADKAIIIAMoAgwQoAIhASAAQQE6AAAgACABNgIEIANBEGokAAtJAQF/IwBBEGsiAyQAIANBCGogASgCACABKAIEIAEoAggQbCACIAMoAgggAygCDBCgAiEBIABBATsBACAAIAE2AgQgA0EQaiQAC0kBAX8jAEEQayIDJAAgA0EIaiABKAIAIAEoAgQgASgCCBBsIAIgAygCCCADKAIMEKACIQEgAEECNgIAIAAgATYCBCADQRBqJAALSQEBfyMAQRBrIgIkACACIABBDGo2AgwgAUGQwsAAQQ1BncLAAEEFIABB8MHAAEGiwsAAQQUgAkEMakGAwsAAEN4BIAJBEGokAAtDAQF/QRRBBBCBAyIDRQRAQQRBFBCMAwALIAMgAjYCECADIAE2AgwgAyAAKQIANwIAIANBCGogAEEIaigCADYCACADC95uAyZ/FH4BfCABKAIIIgRBgICAAXEhAiAAKwMAITwCQAJAIARBgICAgAFxRQRAIAEgAkEARyERQQAhAEEAIQEjAEGAAWsiBiQAIDy9ITECf0EDIDyZRAAAAAAAAPB/YQ0AGkECIDFCgICAgICAgPj/AIMiKEKAgICAgICA+P8AUQ0AGiAxQv////////8HgyIrQoCAgICAgIAIhCAxQgGGQv7///////8PgyAxQjSIp0H/D3EiABsiKkIBgyEpIChQBEBBBCArUA0BGiAAQbMIayEAQgEhKCApUAwBC0KAgICAgICAICAqQgGGICpCgICAgICAgAhRIgIbISpCAkIBIAIbIShBy3dBzHcgAhsgAGohACApUAshBCAGIAA7AXggBiAoNwNwIAZCATcDaCAGICo3A2AgBiAEOgB6An8CQAJAAkACQCAEQf8BcSIAQQFNBEAgBkEgaiEJIAZBD2ohDCMAQeAAayIAJAACQAJAAn8CQAJAAkACQAJAAkACQCAGQeAAaiICKQMAIihQRQRAIAIpAwgiKVANASACKQMQIipQDQIgKiAoQn+FVg0DICggKVQNBCAoICp8IipCgICAgICAgIAgWg0FIAAgAi8BGCICOwE4IAAgKCApfSIrNwMwIAAgKyAqeSIphiItICmIIiw3A0AgKyAsUg0JIAAgAjsBOCAAICg3AzAgACAoIClCP4MiK4YiLCAriCIrNwNAICggK1INCUGgfyACICmnayIEa8FB0ABsQbCnBWpBzhBtIgJB0QBPDQYgAEEgaiACQQR0IgIpA4CuRCIoQgAgKiAphhD3ASAAQRBqIChCACAtEPcBIAAgKEIAICwQ9wFCAUEAIAQgAi8BiK5EamtBP3GtIi+GIixCAX0hMCAAKQMQQj+HITUgACkDAEI/iCE2IAApAwghNyACLwGKrkQhAyAAKQMYITggACkDKCI6IAApAyBCP4giO3wiM0IBfCIuIC+I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ADcDCCASQQhqELMCDAELIAkoAgAiASgCACABKAIIIgJGBEAgASACQQEQ3wEgASgCCCECCyABIAJBAWo2AgggASgCBCACakE6OgAAIAQgCRAsCyEGIBJBEGokACAGRQ0BIAooAvgCIgBFDQYgCigC/AIgAEEBEPcCDAYLQcCywAAQ+QIAC0EAIQEgDEEBayIMDQALIAotALQERQ0BCyAKKAKwBCgCACIAKAIAIAAoAggiAUYEQCAAIAFBARDfASAAKAIIIQELIAAgAUEBajYCCCAAKAIEIAFqQf0AOgAACyAKKAKAAwshDiAKKAL8AiEGIAooAvgCIhpBgICAgHhGDQAgCkHgAWogCigCMCAKKAI0EE0gChC+AjYC7AEgCkGQA2oiAkIANwMAIApBiANqIgFCADcDACAKQYADaiIAQgA3AwAgCkIANwP4AiAKQewBaiAKQfgCakEgENMBIApBiAJqIAIpAwA3AwAgCkGAAmogASkDADcDACAKQfgBaiAAKQMANwMAIAogCikD+AI3A/ABIApBlAJqIApB8AFqEIMCIAooAugBQSBHDQEgCkGqBWoiBCAKKALkASIFQQJqLQAAOgAAIApBuARqIAVBF2opAAA3AwAgCkHABGogBUEfai0AADoAACAKIAUvAAA7AagFIAogBSkADzcDsAQgBSgACyEDIAUoAAchAiAFKAADIQEgCigC4AEiAARAIAUgAEEBEPcCCyAKQfoCaiAELQAAOgAAIApByAVqIApBuARqKQMAIi43AwAgCkHQBWogCkHABGotAAAiADoAACAKQY8DaiAuNwAAIApBlwNqIAA6AAAgCiAKLwGoBTsB+AIgCiAKKQOwBCIuNwPABSAKIAM2AIMDIAogAjYA/wIgCiAuNwCHAyAKIAE2APsCIApBtAJqIApB8AFqIApB+AJqEOYBQSBBARCBAyIARQ0DIAAgCikAtAI3AAAgAEEIaiAKQbwCaikAADcAACAAQRBqIApBxAJqKQAANwAAIABBGGogCkHMAmopAAA3AAAgCiAANgLYAiAKQSA2AtQCIApBIDYC3AJBBiETQQZBARCBAyIDRQ0EQQAhFiADQQRqQZitwAAvAAA7AAAgA0GUrcAAKAAANgAAQYCAgIB4IQUgCigCRCIeQYCAgIB4RiIARQ0CQQYhDAwOCyAKIAY2AvgCQZyuwABBKyAKQfgCakGMrsAAQciuwAAQ+QEACyAKKALkASEAIAooAuABIQFB/6zAAEEVEOMCIQIgAQRAIAAgAUEBEPcCC0EBIQAMDwsgCkGwBGogCigCSCISIAooAkwQTSAKQfgCaiIMIAooArQEIhAgCigCuAQQLyAKKAL8AiECIAooAvgCIglBgICAgHhGDQogCigCgAMiBEEfTQ0CIApB1AJqIAIgAkEgaiIBEJACIAwgASAEQSBrEEEgCigCgAMhGyAKKAL8AiEiIAooAvgCIQUgDEGsrcAAQREQigIgA0EGQQEQ9wIgCigCgAMhEyAKKAL8AiEDIAooAvgCIQwgCQRAIAIgCUEBEPcCCyAKKAKwBCIBBEAgECABQQEQ9wILIB5FDQsgEiAeQQEQ9wIMCwtBAUEgEN0CAAtBAUEGEN0CAAtBAEEgIARBnK3AABCkAgALQQFBgAEQ3QIACyABIAMQ3QIAC0EBQQwQ3QIACyABIAIQ3QIAC0EBQQkQ3QIACyABIAIQ3QIAC0EBQQoQ3QIACyAKKAKwBCIBBEAgECABQQEQ9wILQQYhDCAeBEAgEiAeQQEQ9wILDAELAkACQAJAIA5BAEgNACAKKALYAiEEIAooAtwCIQECQCAORQRAQQEhAgwBC0EBIRYgDkEBEIEDIgJFDQELIA4EQCACIAYgDvwKAAALIAogDjYCgAMgCiACNgL8AiAKIA42AvgCIApBsARqIAQgASAKQfgCakG9rcAAQQtBIBC+ASAKKAK0BCEQIAooArAEIh9BgICAgHhGBEAgECECDAMLIAooArgEIQIgCkGAgICAeDYC4AIgCkH4AmogECACIApB4AJqQcitwABBC0EgEL4BIAooAvwCIQkCQAJAIAooAvgCIiBBgICAgHhGBEAgCSECDAELIAooAoADIQEgCkH4AmogECACIApB4AJqQdOtwABBCkEMEL4BIAooAvwCIQQCQCAKKAL4AiIeQYCAgIB4RgRAIAQhAgwBCyAKQfgCaiAJIAEgBCAKKAKAAyAnIA0gBiAOEMMBIAooAvwCIQIgCigC+AIiEkGAgICAeEcNAiAeRQ0AIAQgHkEBEPcCCyAgRQ0AIAkgIEEBEPcCCyAfRQ0DIBAgH0EBEPcCDAMLIAooAoADIgBBEGshASAAQQ9NDQEgCkGAA2pCADcDACAKQgA3A/gCIApB7AFqIApB+AJqIhdBEBDTASAKQewCaiAXQRAQQSAKQYwDaiAKQThqIgBBCGooAgA2AgAgCiAdNgKAAyAKIBE2AvwCIAogFTYC+AIgCiAAKQIANwKEAyAKQbAEaiImQd2twABBBxCKAiAKQcgFaiINIBM2AgAgCiADNgLEBSAKIAw2AsAFIApBzAVqQeStwABBCxCKAiAKQdgFaiIAQe+twABBCxCKAiAKQegEaiAKQShqKAIANgIAIAogCikCIDcC4AQgCkGoBWogCkGUAmpBIBBBIApBuAVqIgMgIjYCACAKIBs2ArwFIAogBTYCtAUgCkGEBWogAiABEEEgCkGQBWogASACakEQEEEgCkGcBWogBiAOEEEgCkHcBGogCkHgBWoiBSgCADYCACAKQdQEaiAAKQIANwIAIApBzARqIApB0AVqIgEpAgA3AgAgCkHEBGogDSkCADcCACAKQfQEaiAKQbAFaikCADcCACAKQfwEaiADKQIANwIAIAogCikCwAU3ArwEIAogCikCqAU3AuwEIApBwAVqICogIRCKAiAFIApB5ABqKAIANgIAIAAgCikCXDcCACAKQdQFaiAKQfQCaigCADYCACAKIAopAuwCNwLMBSAKQZADaiAmQfgA/AoAACAKQagEaiAFKAIANgIAIApBoARqIAApAgA3AgAgCkGYBGogASkCADcCACAKQZAEaiANKQIANwIAIAogCikCwAU3AogEIwBBIGsiCyQAAkBBgAFBARCBAyIBBEAgCyABNgIMIAtBgAE2AgggCyALQQhqNgIUIAFB+wA6AAAgC0EBNgIQIAtBAToAHCALIAtBFGo2AhgCQAJAIAtBGGoiE0H6q8AAQQwgFxC5ASIFDQAgE0Hwq8AAQQogF0EMahC5ASIFDQAjAEEQayIOJAAgEygCACEDIBMtAARBAUcEQCADKAIAIgEoAgAgASgCCCIFRgRAIAEgBUEBEN8BIAEoAgghBQsgASAFQQFqNgIIIAEoAgQgBWpBLDoAAAsgF0EYaiEVIBNBAjoABCAOIANB4qzAAEEGEHgCfyAOLQAAQQRHBEAgDiAOKQMANwMIIA5BCGoQswIMAQsgAygCACIBKAIAIAEoAggiBUYEQCABIAVBARDfASABKAIIIQULIAEgBUEBajYCCCABKAIEIAVqQTo6AAAjAEEQayIdJAAgAygCACIBKAIAIAEoAggiBUYEQCABIAVBARDfASABKAIIIQULIAEoAgQgBWpB+wA6AAAgHUEBOgAMIAEgBUEBajYCCCAdIAM2AggCQCAdQQhqIg9BhqzAAEEDIBUQuQEiBQ0AIwBBEGsiDSQAIA8oAgAhDCAPLQAEQQFHBEAgDCgCACIBKAIAIAEoAggiBUYEQCABIAVBARDfASABKAIIIQULIAEgBUEBajYCCCABKAIEIAVqQSw6AAALIBVBDGohAyAPQQI6AAQgDSAMQYmswABBBRB4An8gDS0AAEEERwRAIA0gDSkDADcDCCANQQhqELMCDAELIAwoAgAiASgCACABKAIIIgVGBEAgASAFQQEQ3wEgASgCCCEFCyABIAVBAWo2AgggASgCBCAFakE6OgAAIwBBEGsiBSQAIAwoAgAiASgCACABKAIIIhFGBEAgASARQQEQ3wEgASgCCCERCyABKAIEIBFqQfsAOgAAIAVBAToADCABIBFBAWo2AgggBSAMNgIIAkAgBUEIaiIBQbWrwABBAyADELkBIhYNACABQbirwABBAyADQQxqELkBIhYNACABQburwABBBCADQRhqELkBIhYNAEEAIRYgBS0ADEUNACAFKAIIKAIAIgEoAgAgASgCCCIRRgRAIAEgEUEBEN8BIAEoAgghEQsgASARQQFqNgIIIAEoAgQgEWpB/QA6AAALIAVBEGokACAWCyEFIA1BEGokACAFDQAgD0GOrMAAQQkgFUEwahC5ASIFDQAjAEEQayIiJAAgDygCACENIA8tAARBAUcEQCANKAIAIgEoAgAgASgCCCIFRgRAIAEgBUEBEN8BIAEoAgghBQsgASAFQQFqNgIIIAEoAgQgBWpBLDoAAAsgFUE8aiEMIA9BAjoABCAiIA1Bl6zAAEEMEHgCfyAiLQAAQQRHBEAgIiAiKQMANwMIICJBCGoQswIMAQsgDSgCACIBKAIAIAEoAggiBUYEQCABIAVBARDfASABKAIIIQULIAEgBUEBajYCCCABKAIEIAVqQTo6AAAjAEEQayIbJAAgDCgCDCEDIA0oAgAiASgCACABKAIIIgVGBEAgASAFQQEQ3wEgASgCCCEFCyABKAIEIAVqQfsAOgAAIBtBAToADCABIAVBAWo2AgggGyANNgIIAkAgG0EIaiIBQdaswABBCSAMELkBIhENACADQYCA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////H3E2AoACIAAgACkD2AIgWkIaiHwiWqdB////D3E2ApQCIAAgACkDuAIgW0IaiHwiW6dB////D3E2AoQCIAAgACkD4AIgWkIZiHwiWqdB////H3E2ApgCIAAgXEL///8PgyBZQv///x+DIFtCGYh8IllCGoh8PgKMAiAAIFmnQf///x9xNgKIAiAAIAApA+gCIFpCGoh8IlmnQf///w9xNgKcAiAAIF5C////D4MgWUIZiEITfiBdQv///x+DfCJZQhqIfD4C/AEgACBZp0H///8fcTYC+AEgAEEIaiIMIABB+AFqIgggCRAyIAYgDBBdIAAgACkD0AIgACkDyAIgACkDwAIiWUIaiHwiXEIZiHwiWqdB////H3E2ApACIAAgACkDsAIgACkDqAIgACkDoAIiXUIaiHwiXkIZiHwiW6dB////H3E2AoACIAAgACkD2AIgWkIaiHwiWqdB////D3E2ApQCIAAgACkDuAIgW0IaiHwiW6dB////D3E2AoQCIAAgACkD4AIgWkIZiHwiWqdB////H3E2ApgCIAAgXEL///8PgyBZQv///x+DIFtCGYh8IllCGoh8PgKMAiAAIFmnQf///x9xNgKIAiAAIAApA+gCIFpCGoh8IlmnQf///w9xNgKcAiAAIF5C////D4MgWUIZiEITfiBdQv///x+DfCJZQhqIfD4C/AEgACBZp0H///8fcTYC+AEgAEEwaiILIAggCRAyIABBgAFqIg0gByAMEDIgAEHQAWoiDCAHIAsQMiAGIAwQLSAAQZgCaiAAQcACaikCADcDACAAQZACaiAAQbgCaikCADcDACAAQYgCaiAAQbACaikCADcDACAAQYACaiAAQagCaikCADcDACAAIAApAqACNwP4ASAGIAhBAhBZIABBqAFqIgsgDCAGEDIgAEHYAGoiDiANIAsQMiAGIA4QXSAAIAApA9ACIAApA8gCIAApA8ACIllCGoh8IlxCGYh8IlqnQf///x9xNgKQAiAAIAApA7ACIAApA6gCIAApA6ACIl1CGoh8Il5CGYh8IlunQf///x9xNgKAAiAAIAApA9gCIFpCGoh8IlqnQf///w9xNgKUAiAAIAApA7gCIFtCGoh8IlunQf///w9xNgKEAiAAIAApA+ACIFpCGYh8IlqnQf///x9xNgKYAiAAIFxC////D4MgWUL///8fgyBbQhmIfCJZQhqIfD4CjAIgACBZp0H///8fcTYCiAIgACAAKQPoAiBaQhqIfCJZp0H///8PcTYCnAIgACBeQv///w+DIFlCGYhCE34gXUL///8fg3wiWUIaiHw+AvwBIAAgWadB////H3E2AvgBIAwgCSAIEDIgCCAMEEsgBiAHEEtBACEGQQEhCANAIABB+AFqIgwgBmotAAAgAEGgAmoiCSAGai0AAEYQ5AIgCHEhCCAGQQFqIgZBIEcNAAsgCBDkAiEbIABB8P///wMgBygCGGutQfD///8BIAcoAhRrrUHw////AyAHKAIQa60iWUIaiHwiXEIZiHwiWqdB////H3EiCzYCuAIgAEHw////AyAHKAIIa61B8P///wEgBygCBGutQdD9//8DIAcoAgBrrSJdQhqIfCJeQhmIfCJbp0H///8fcSINNgKoAiAAQfD///8BIAcoAhxrrSBaQhqIfCJap0H///8PcSIONgK8AiAAQfD///8BIAcoAgxrrSBbQhqIfCJbp0H///8PcSIRNgKsAiAAQfD///8DIAcoAiBrrSBaQhmIfCJap0H///8fcSISNgLAAiAAIFlC////H4MgW0IZiHwiWadB////H3EiEzYCsAIgACBcQv///w+DIFlCGoh8pyIUNgK0AiAAQfD///8BIAcoAiRrrSBaQhqIfCJZp0H///8PcSIYNgLEAiAAIFlCGYhCE34gXUL///8fg3wiWadB////H3EiEDYCoAIgACBeQv///w+DIFlCGoh8pyIZNgKkAiAAQagBaiAAQdABahBLIAwgCRBLQQAhBkEBIQgDQCAAQagBaiIMIAZqLQAAIABB+AFqIgcgBmotAABGEOQCIAhxIQggBkEBaiIGQSBHDQALIAgQ5AIhFiAAIBg2AsQCIAAgEjYCwAIgACAONgK8AiAAIAs2ArgCIAAgFDYCtAIgACATNgKwAiAAIBE2AqwCIAAgDTYCqAIgACAZNgKkAiAAIBA2AqACIAcgAEGgAmpBsNvBABAyIABBgAFqIABB0AFqEEsgDCAHEEtBACEGQQEhCANAIABBgAFqIAZqLQAAIABBqAFqIAZqLQAARhDkAiAIcSEIIAZBAWoiBkEgRw0ACyAIEOQCIQYgAEGgAmpBsNvBACAAQdgAaiI8EDIgAEHgAGoiCEEAIAYgFnIQ5AJB/wFxayIGIAgoAgAiByAAKAKoAnNxIAdzIgc2AgAgAEHoAGoiDCAMKAIAIgkgACgCsAJzIAZxIAlzIgk2AgAgAEHwAGoiCyALKAIAIg0gACgCuAJzIAZxIA1zIg02AgAgACAAKAJkIg4gACgCrAJzIAZxIA5zIg42AmQgACAAKAJcIhEgACgCpAJzIAZxIBFzIhE2AlwgACAAKAJYIhIgACgCoAJzIAZxIBJzIhI2AlggACAAKAJsIhMgACgCtAJzIAZxIBNzIhM2AmwgACAAKAJ0IhQgACgCvAJzIAZxIBRzIhQ2AnQgAEH4AGoiGCAYKAIAIhAgACgCwAJzIAZxIBBzIhA2AgAgACAGIAAoAnwiGSAAKALEAnNxIBlzIhk2AnwgAEH4AWogPBBLIBhBACAALQD4AUEBcRDkAkH/AXFrIgZB8P///wMgEGutQfD///8BIBRrrUHw////AyANa61B8P///wEgE2utQfD///8DIAlrrSJZQhqIfCJcQhmIfCJaQhqIfCJdQhmIfCJep0H///8fcSAQc3EgEHM2AgAgCyBap0H///8fcSANcyAGcSANczYCACAMIFlC////H4NB8P///wEgDmutQfD///8DIAdrrUHw////ASARa61B0P3//wMgEmutIllCGoh8IlpCGYh8IltCGoh8Il9CGYh8ImCnQf///x9xIAlzIAZxIAlzNgIAIAggW6dB////H3EgB3MgBnEgB3M2AgAgAEHw////ASAZa60gXkIaiHwiXqdB////D3EgGXMgBnEgGXM2AnwgACBdp0H///8PcSAUcyAGcSAUczYCdCAAIBMgXEL///8PgyBgQhqIfKdzIAZxIBNzNgJsIAAgX6dB////D3EgDnMgBnEgDnM2AmQgACBeQhmIQhN+IFlC////H4N8IlmnQf///x9xIBJzIAZxIBJzNgJYIAAgESBaQv///w+DIFlCGoh8p3MgBnEgEXM2AlwgCiAWIBtyEOQCOgAAIAogACkCWDcCBCAKQQxqIAgpAgA3AgAgCkEUaiAMKQIANwIAIApBHGogCykCADcCACAKQSRqIBgpAgA3AgAgAEHwAmokACABQeAAaiIAIAFBgANqKQIANwMAIAFB6ABqIgYgAUGIA2opAgA3AwAgAUHwAGoiCCABQZADaikCADcDACABQfgAaiIHIAFBmANqKQIANwMAIAFBiAFqIgogAUGwAWopAgA3AwAgAUGQAWoiDCABQbgBaikCADcDACABQZgBaiIJIAFBwAFqKQIANwMAIAFBoAFqIgsgAUHIAWopAgA3AwAgASABKQL4AjcDWCABIAEpAqgBNwOAASABLQD0AiENIAFBKGogBykDADcDACABQSBqIAgpAwA3AwAgAUEYaiAGKQMANwMAIAFBEGogACkDADcDACABIAEpA1g3AwggAUHQAGogCykDADcDACABQcgAaiAJKQMANwMAIAFBQGsgDCkDADcDACABQThqIAopAwA3AwAgASABKQOAATcDMCAPQZwCaiILIA0EfyMAQTBrIggkACAaLQAfQQd2EOQCIQYgCEEIaiABQQhqIgAQoQEgAEEAIAZB/wFxayIGIAAoAgAiByAIKAIIc3EgB3M2AgAgACAAKAIEIgcgCCgCDHMgBnEgB3M2AgQgAEEIaiIHIAcoAgAiCiAIKAIQcyAGcSAKczYCACAAIAAoAgwiCiAIKAIUcyAGcSAKczYCDCAAQRBqIgogCigCACIMIAgoAhhzIAZxIAxzNgIAIAAgACgCFCIMIAgoAhxzIAZxIAxzNgIUIABBGGoiDCAMKAIAIgkgCCgCIHMgBnEgCXM2AgAgACAAKAIcIgkgCCgCJHMgBnEgCXM2AhwgAEEgaiIJIAkoAgAiDSAIKAIocyAGcSANczYCACAAIAYgACgCJCINIAgoAixzcSANczYCJCALQQRqIgZBIGogCSkCADcCACAGQRhqIAwpAgA3AgAgBkEQaiAKKQIANwIAIAZBCGogBykCADcCACAGIAApAgA3AgAgBkH4AGogACABQTBqIgAQMiAGQcgAaiAAQSBqKQIANwIAIAZBQGsgAEEYaikCADcCACAGQThqIABBEGopAgA3AgAgBkEwaiAAQQhqKQIANwIAIAYgACkCADcCKCAGQajcwQApAgA3AlAgBkHYAGpBsNzBACkCADcCACAGQeAAakG43MEAKQIANwIAIAZB6ABqQcDcwQApAgA3AgAgBkHwAGpByNzBACkCADcCACAIQTBqJABBAQVBAAs2AgAgAUGgA2okAAJAIA8oApwCIlVFBEBBACEGIA9BADYCEEEQQQQQgQMiAEUNBSAAIA9BEGoiASkCADcCACAAQQhqIAFBCGopAgA3AgAgD0EIaiIBQYTUwQA2AgQgASAANgIAIA8oAgwhACAPKAIIIQFB4qnAAEESEOMCITwgAUUNASAAKAIAIggEQCABIAgRBAALIAAoAgQiCEUNASABIAggACgCCBD3AgwBCyAPQTxqIA9BrAJqKAIANgIAIA8gDykCpAI3AjQgDygCoAIhACAPQUBrIA9BsAJqQZAB/AoAACAPQSBqIEpBCGoiPEEIaikAADcCACAPQShqIDxBEGopAAA3AgAgDyA8KQAANwIYIA8gFTYCFCAPIBw2AhAgDyAANgIwIA9BiAJqIARBOGopAAA3AwAgD0GAAmogBEEwaikAADcDACAPQfgBaiAEQShqKQAANwMAIA9B8AFqIARBIGopAAA3AwAgD0HoAWogBEEYaikAADcDACAXIARBEGopAAA3AwAgD0HYAWogBEEIaikAADcDACAPIAQpAAA3A9ABIA9BnAJqIgYiACAPQdABaiIBKQAANwAAIAAgASkAIDcAICAAQRhqIAFBGGopAAA3AAAgAEEQaiABQRBqKQAANwAAIABBCGogAUEIaikAADcAACAAQShqIAFBKGopAAA3AAAgAEEwaiABQTBqKQAANwAAIABBOGogAUE4aikAADcAACAPQZACaiFNIA9BEGohByMAQcABayIMJAAgDEE8aiEBQQAhCSMAQeABayIAJAAgACAGEPEBIABBsAFqIABBOGopAAA3AwAgAEGoAWogAEEwaikAADcDAEEoIQ0gAEGgAWogAEEoaikAADcDACAAIAApACA3A5gBIABBvwFqIQojAEFAaiIGJAAgAEGYAWoiCCwAH0EAThDkAiEOIAZBGGogCEEYaikAADcDACAGQRBqIAhBEGopAAA3AwAgBkEIaiAIQQhqKQAANwMAIAYgCCkAADcDACAGQSBqIAYQLkEBIQsDQCAGIAlqLQAAIAZBIGogCWotAABGEOQCIAtxIQsgCUEBaiIJQSBHDQALIAogCxDkAiAOcRDkAjoAICAKQRhqIAhBGGopAAA3AAAgCkEQaiAIQRBqKQAANwAAIApBCGogCEEIaikAADcAACAKIAgpAAA3AAAgBkFAayQAAn8gAC0A3wFBAUYEQCAAQY0BaiIGIABB1wFqKQAANwAAIABBiAFqIgggAEHSAWopAAA3AwAgAEHiAGogAEHBAWotAAA6AAAgAEHwAGoiCiAIKQMANwMAIABB9QBqIgkgBikAADcAACAAIAAvAL8BOwFgIAAgACkAygE3A2ggACgAwgEhBiAAKADGASEIIAFBOWogCSkAADcAACABQTRqIAopAwA3AgAgASAAKQNoNwIsIABB2ABqIgogAEEYaikAADcDACAAQdAAaiIJIABBEGopAAA3AwAgAEHIAGoiCyAAQQhqKQAANwMAIAAgACkAADcDQCABIAApA0A3AAEgAUEJaiALKQMANwAAIAFBEWogCSkDADcAACABQRlqIAopAwA3AAAgAUEgaiAAQd8AaigAADYAAEEkIQpBAAwBC0EEIQpBEEEEEIEDIgZFDQUgBkEBNgIAQYTUwQAhCEEIIQ1BAQshCSABIApqIAY2AgAgASANaiAINgIAIAEgCToAACAAQeABaiQAAkAgDC0APEEBRgRAIAwpAkAhWSBNQQE2AgAgTSBZNwIEDAELIAxBggFqIAwtAD86AAAgDEEIaiIAIAxB0ABqKQIANwMAIAxBEGoiASAMQdgAaikCADcDACAMQRhqIgYgDEHgAGopAgA3AwAgDEEgaiIIIAxB6ABqKQIANwMAIAxBKGoiCiAMQfAAaikCADcDACAMQS1qIgkgDEH1AGopAAA3AAAgDCAMLwA9OwGAASAMIAwpAkg3AwAgDCkCQCFZIAxBkwFqIAApAwA3AAAgDEGbAWogASkDADcAACAMQaMBaiAGKQMANwAAIAxBqwFqIAgpAwA3AAAgDEGzAWogCikDADcAACAMQbgBaiAJKQAANwAAIAwgWTcAgwEgDCAMKQMANwCLASAMQTxqIVIgAiEBIwBBoAtrIggkACAIQZgEaiIGQgA3AwAgCEGQBGoiCkIANwMAIAhBiARqIglCADcDACAIQYAEaiILQgA3AwAgCEH4A2oiDUIANwMAIAhB8ANqIg5CADcDACAIQfAHaiIRIAxBgAFqIlYiAEEQaiISKQAANwMAIAhB+AdqIhMgAEEYaiIUKQAANwMAIAhB0AlqIhggB0EQaikCADcDACAIQdgJaiIQIAdBGGopAgA3AwAgCEIANwPoAyAIQgA3A+ADIAggACkAADcD4AcgCCAAQQhqIhkpAAA3A+gHIAggBykCADcDwAkgCCAHQQhqKQIANwPICSAIQbgCakHo1MEAKQMANwMAIAhBsAJqQeDUwQApAwA3AwAgCEGoAmpB2NTBACkDADcDACAIQaACakHQ1MEAKQMANwMAIAhBmAJqQcjUwQApAwA3AwAgCEGQAmpBwNTBACkDADcDACAIQYgCakG41MEAKQMANwMAIAhCADcDwAIgCEIANwPIAiAIQbDUwQApAwA3A4ACIAhB6AJqIBMpAwA3AwAgCEHgAmogESkDADcDACAIQdgCaiAIKQPoBzcDACAIQfgCaiAIKQPICTcDACAIQYADaiAYKQMANwMAIAhBiANqIBApAwA3AwAgCEGYA2ogCCkD6AM3AwAgCEGgA2ogDikDADcDACAIQagDaiANKQMANwMAIAhBsANqIAspAwA3AwAgCEG4A2ogCSkDADcDACAIQcADaiAKKQMANwMAIAhByANqIAYpAwA3AwAgCCAIKQPgBzcD0AIgCCAIKQPACTcD8AIgCCAIKQPgAzcDkAMgCEHAADoA0AMgCCAHQcAB/AoAACAIQfgBaiAAQThqKQAANwMAIAhB8AFqIABBMGopAAA3AwAgCEHoAWogAEEoaikAADcDACAIQeABaiAAQSBqKQAANwMAIAhB2AFqIBQpAAA3AwAgCEHQAWogEikAADcDACAIQcgBaiAZKQAANwMAIAggACkAADcDwAEgCEHQAmohBiAIQYACaiEJAkACQCADIgBBgAEgCC0A0AMiB2siCk8EQCAHRQ0BIAoEQCAGIAdqIAEgCvwKAAALIAggCCkDwAJCAXwiWTcDwAIgCCAIKQPIAiBZUK18NwPIAiAJIAZBARAbIAEgCmohASAAIAprIQAMAQsgAARAIAYgB2ogASAA/AoAAAsgACAHaiEHDAELIABB/wBxIQcgAEGAAU8EQCAIIAgpA8ACIlkgAEEHdiIKrXwiXDcDwAIgCCAIKQPIAiBZIFxWrXw3A8gCIAkgASAKEBsLIAdFDQAgBiABIABBgH9xaiAH/AoAAAsgCCAHOgDQAyAIQeADaiAIQeAD/AoAACAIQeAHaiIKIAlB4AH8CgAAIAhB+AlqIgBCADcDACAIQfAJaiIBQgA3AwAgCEHoCWoiBkIANwMAIAhB4AlqIglCADcDACAIQdgJaiILQgA3AwAgCEHQCWoiDUIANwMAIAhByAlqIg5CADcDACAIQgA3A8AJIAogCEGwCGogCEHACWoiBxA4IAhBmAtqIAApAwA3AwAgCEGQC2ogASkDADcDACAIQYgLaiAGKQMANwMAIAhBgAtqIAkpAwA3AwAgCEH4CmogCykDADcDACAIQfAKaiANKQMANwMAIAhB6ApqIA4pAwA3AwAgCCAIKQPACTcD4AogCEHAB2oiASAIQeAKahDDAiAKIAhBgARqQaAB/AoAACMAQTBrIgAkACAHIAoQoQEgB0HIAGogCkHIAGopAgA3AgAgB0FAayAKQUBrKQIANwIAIAdBOGogCkE4aikCADcCACAHQTBqIApBMGopAgA3AgAgByAKKQIoNwIoIAcgCikCUDcCUCAHQdgAaiAKQdgAaikCADcCACAHQeAAaiAKQeAAaikCADcCACAHQegAaiAKQegAaikCADcCACAHQfAAaiAKQfAAaikCADcCACAAQQhqIApB+ABqEKEBIAdBmAFqIABBKGopAgA3AgAgB0GQAWogAEEgaikCADcCACAHQYgBaiAAQRhqKQIANwIAIAdBgAFqIABBEGopAgA3AgAgByAAKQIINwJ4IABBMGokACMAQaAUayIGJAAgBiABQQUQowEgBkGAAmogCEHABWpBCBCjAUH/ASEAA0AgBiAAIgFqLQAAIABFckUEQCAAQQFrIQAgBkGAAmogAWotAABFDQELCyMAQYAQayIAJAAgB0EIaiINKAIAIQkgB0EwaiIUKAIAIQsgB0EQaiIcKAIAIQ4gB0E4aiITKAIAIREgB0EYaiIVKAIAIRIgB0FAayIYKAIAIRAgB0EgaiIWKAIAIRkgB0HIAGoiFygCACEaIAcoAgAhGyAHKAIoISEgBygCBCEiIAcoAiwhKSAHKAIMISMgBygCNCEkIAcoAhQhJSAHKAI8ISYgBygCHCEdIAcoAkQhHiAAIAcoAiQgBygCTGo2AowOIAAgGSAaajYCiA4gACAdIB5qNgKEDiAAIBAgEmo2AoAOIAAgJSAmajYC/A0gACAOIBFqNgL4DSAAICMgJGo2AvQNIAAgCSALajYC8A0gACAiIClqNgLsDSAAIBsgIWo2AugNIABBkA5qIgsgB0EoaiAHEIsBIABB2A5qIAdB8ABqIhopAgA3AgAgAEHQDmogB0HoAGoiGSkCADcCACAAQcgOaiAHQeAAaiIQKQIANwIAIABBwA5qIAdB2ABqIhspAgA3AgAgACAHKQJQNwK4DiAAQQhqIlMiCSAHQfgAakGI28EAEDIgAEGAD2ogAEEoaikCADcCACAAQfgOaiAAQSBqKQIANwIAIABB8A5qIABBGGopAgA3AgAgAEHoDmogAEEQaikCADcCACAAIAApAgg3AuAOIAkgAEHoDWoiCUGgAfwKAAAgAEGoAWoiKyAJQaAB/AoAACAAQcgCaiI9IAlBoAH8CgAAIABB6ANqIkYgCUGgAfwKAAAgAEGIBWoiTCAJQaAB/AoAACAAQagGaiJPIAlBoAH8CgAAIABByAdqIlQgCUGgAfwKAAAgAEHoCGoiVyAJQaAB/AoAACAAQZANaiIOIBcpAgA3AwAgAEGIDWoiESAYKQIANwMAIABBgA1qIhIgEykCADcDACAAQfgMaiITIBQpAgA3AwAgAEGgDWoiFCAbKQIANwMAIABBqA1qIhggECkCADcDACAAQbANaiIQIBkpAgA3AwAgAEG4DWoiGSAaKQIANwMAIAAgBykCKDcD8AwgACAHKQJQNwOYDSAAQegMaiAWKQIANwMAIABB4AxqIBUpAgA3AwAgAEHYDGogHCkCADcDACAAQdAMaiANKQIANwMAIAAgBykCADcDyAwgCSAAQcgMaiIcECQgAEGICmoiISAJIABB4A5qIgcQMiAAQbAPaiIiIAsgAEG4DmoiDRAyIABB2A9qIhUgDSAHEDIgAEGoC2oiKSAJIAsQMiAAQdAKaiAAQdAPaiIjKQIANwIAIABByApqIABByA9qIiQpAgA3AgAgAEHACmogAEHAD2oiJSkCADcCACAAQbgKaiAAQbgPaiImKQIANwIAIABB4ApqIABB4A9qIhYpAgA3AgAgAEHoCmogAEHoD2oiFykCADcCACAAQfAKaiAAQfAPaiIaKQIANwIAIABB+ApqIABB+A9qIhspAgA3AgAgACAAKQKwDzcCsAogACAAKQLYDzcC2AogAEGgC2ogAEHIC2opAgA3AgAgAEGYC2ogAEHAC2opAgA3AgAgAEGQC2ogAEG4C2opAgA3AgAgAEGIC2ogAEGwC2opAgA3AgAgACAAKQKoCzcCgAsgCSAhIFMQPyAcIAkgBxAyIABBiA9qIh0gCyANEDIgIiANIAcQMiAVIAkgCxAyIA4gAEGoD2oiHikCADcCACARIABBoA9qIh8pAgA3AgAgEiAAQZgPaiIgKQIANwIAIBMgAEGQD2oiJykCADcCACAUICYpAgA3AgAgGCAlKQIANwIAIBAgJCkCADcCACAZICMpAgA3AgAgACAAKQKIDzcC8AwgACAAKQKwDzcCmA0gAEHgDWoiKCAbKQIANwIAIABB2A1qIiogGikCADcCACAAQdANaiI+IBcpAgA3AgAgAEHIDWoiPyAWKQIANwIAIAAgACkC2A83AsANIBMoAgAhLCASKAIAIS0gESgCACEuIA4oAgAhLyAAKALIDCEwIAAoAvAMITEgACgCzAwhMiAAKAL0DCEzIAAoAtAMITQgACgC1AwhRyAAKAL8DCFIIAAoAtgMITUgACgC3AwhNiAAKAKEDSE3IAAoAuAMITggACgC5AwhOSAAKAKMDSE6IAAoAugMITsgACAAKALsDCAAKAKUDWo2AswLIAAgLyA7ajYCyAsgACA5IDpqNgLECyAAIC4gOGo2AsALIAAgNiA3ajYCvAsgACAtIDVqNgK4CyAAIEcgSGo2ArQLIAAgLCA0ajYCsAsgACAyIDNqNgKsCyAAIDAgMWo2AqgLIABB0AtqIiwgAEHwDGoiLSAcEIsBIABBmAxqIi4gGSkCADcCACAAQZAMaiIvIBApAgA3AgAgAEGIDGoiMCAYKQIANwIAIABBgAxqIjEgFCkCADcCACAAIAApApgNNwL4CyAVIABBwA1qIjJBiNvBABAyIABBwAxqIjMgGykCADcCACAAQbgMaiI0IBopAgA3AgAgAEGwDGoiRyAXKQIANwIAIABBqAxqIkggFikCADcCACAAIAApAtgPNwKgDCArIClBoAH8CgAAIAkgISArED8gHCAJIAcQMiAdIAsgDRAyICIgDSAHEDIgFSAJIAsQMiAOIB4pAgA3AgAgESAfKQIANwIAIBIgICkCADcCACATICcpAgA3AgAgFCAmKQIANwIAIBggJSkCADcCACAQICQpAgA3AgAgGSAjKQIANwIAIAAgACkCiA83AvAMIAAgACkCsA83ApgNICggGykCADcCACAqIBopAgA3AgAgPiAXKQIANwIAID8gFikCADcCACAAIAApAtgPNwLADSATKAIAISsgEigCACE1IBEoAgAhNiAOKAIAITcgACgCyAwhOCAAKALwDCE5IAAoAswMITogACgC9AwhOyAAKALQDCFAIAAoAtQMIUEgACgC/AwhQiAAKALYDCFDIAAoAtwMIUQgACgChA0hRSAAKALgDCFLIAAoAuQMIU4gACgCjA0hUCAAKALoDCFYIAAgACgC7AwgACgClA1qNgLMCyAAIDcgWGo2AsgLIAAgTiBQajYCxAsgACA2IEtqNgLACyAAIEQgRWo2ArwLIAAgNSBDajYCuAsgACBBIEJqNgK0CyAAICsgQGo2ArALIAAgOiA7ajYCrAsgACA4IDlqNgKoCyAsIC0gHBCLASAuIBkpAgA3AgAgLyAQKQIANwIAIDAgGCkCADcCACAxIBQpAgA3AgAgACAAKQKYDTcC+AsgFSAyQYjbwQAQMiAzIBspAgA3AgAgNCAaKQIANwIAIEcgFykCADcCACBIIBYpAgA3AgAgACAAKQLYDzcCoAwgPSApQaAB/AoAACAJICEgPRA/IBwgCSAHEDIgHSALIA0QMiAiIA0gBxAyIBUgCSALEDIgDiAeKQIANwIAIBEgHykCADcCACASICApAgA3AgAgEyAnKQIANwIAIBQgJikCADcCACAYICUpAgA3AgAgECAkKQIANwIAIBkgIykCADcCACAAIAApAogPNwLwDCAAIAApArAPNwKYDSAoIBspAgA3AgAgKiAaKQIANwIAID4gFykCADcCACA/IBYpAgA3AgAgACAAKQLYDzcCwA0gEygCACErIBIoAgAhPSARKAIAITUgDigCACE2IAAoAsgMITcgACgC8AwhOCAAKALMDCE5IAAoAvQMITogACgC0AwhOyAAKALUDCFAIAAoAvwMIUEgACgC2AwhQiAAKALcDCFDIAAoAoQNIUQgACgC4AwhRSAAKALkDCFLIAAoAowNIU4gACgC6AwhUCAAIAAoAuwMIAAoApQNajYCzAsgACA2IFBqNgLICyAAIEsgTmo2AsQLIAAgNSBFajYCwAsgACBDIERqNgK8CyAAID0gQmo2ArgLIAAgQCBBajYCtAsgACArIDtqNgKwCyAAIDkgOmo2AqwLIAAgNyA4ajYCqAsgLCAtIBwQiwEgLiAZKQIANwIAIC8gECkCADcCACAwIBgpAgA3AgAgMSAUKQIANwIAIAAgACkCmA03AvgLIBUgMkGI28EAEDIgMyAbKQIANwIAIDQgGikCADcCACBHIBcpAgA3AgAgSCAWKQIANwIAIAAgACkC2A83AqAMIEYgKUGgAfwKAAAgCSAhIEYQPyAcIAkgBxAyIB0gCyANEDIgIiANIAcQMiAVIAkgCxAyIA4gHikCADcCACARIB8pAgA3AgAgEiAgKQIANwIAIBMgJykCADcCACAUICYpAgA3AgAgGCAlKQIANwIAIBAgJCkCADcCACAZICMpAgA3AgAgACAAKQKIDzcC8AwgACAAKQKwDzcCmA0gKCAbKQIANwIAICogGikCADcCACA+IBcpAgA3AgAgPyAWKQIANwIAIAAgACkC2A83AsANIBMoAgAhKyASKAIAIT0gESgCACFGIA4oAgAhNSAAKALIDCE2IAAoAvAMITcgACgCzAwhOCAAKAL0DCE5IAAoAtAMITogACgC1AwhOyAAKAL8DCFAIAAoAtgMIUEgACgC3AwhQiAAKAKEDSFDIAAoAuAMIUQgACgC5AwhRSAAKAKMDSFLIAAoAugMIU4gACAAKALsDCAAKAKUDWo2AswLIAAgNSBOajYCyAsgACBFIEtqNgLECyAAIEQgRmo2AsALIAAgQiBDajYCvAsgACA9IEFqNgK4CyAAIDsgQGo2ArQLIAAgKyA6ajYCsAsgACA4IDlqNgKsCyAAIDYgN2o2AqgLICwgLSAcEIsBIC4gGSkCADcCACAvIBApAgA3AgAgMCAYKQIANwIAIDEgFCkCADcCACAAIAApApgNNwL4CyAVIDJBiNvBABAyIDMgGykCADcCACA0IBopAgA3AgAgRyAXKQIANwIAIEggFikCADcCACAAIAApAtgPNwKgDCBMIClBoAH8CgAAIAkgISBMED8gHCAJIAcQMiAdIAsgDRAyICIgDSAHEDIgFSAJIAsQMiAOIB4pAgA3AgAgESAfKQIANwIAIBIgICkCADcCACATICcpAgA3AgAgFCAmKQIANwIAIBggJSkCADcCACAQICQpAgA3AgAgGSAjKQIANwIAIAAgACkCiA83AvAMIAAgACkCsA83ApgNICggGykCADcCACAqIBopAgA3AgAgPiAXKQIANwIAID8gFikCADcCACAAIAApAtgPNwLADSATKAIAISsgEigCACE9IBEoAgAhRiAOKAIAIUwgACgCyAwhNSAAKALwDCE2IAAoAswMITcgACgC9AwhOCAAKALQDCE5IAAoAtQMITogACgC/AwhOyAAKALYDCFAIAAoAtwMIUEgACgChA0hQiAAKALgDCFDIAAoAuQMIUQgACgCjA0hRSAAKALoDCFLIAAgACgC7AwgACgClA1qNgLMCyAA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AkwgAiANQQ90IAtBEXZyQf////8BcTYCVCACIAhBFXQgBEELdnJB/////wFxNgJcIAJBiAFqIgogAigCPCIEQQ12NgIAIAJB8ABqIg0gAigCKCIIQQF0IAIoAiQiBkEfdnJB/////wFxNgIAIAJB+ABqIgsgAigCMCIJQQd0IAIoAiwiEUEZdnJB/////wFxNgIAIAJBgAFqIgwgAigCOCISQQ10IAIoAjQiE0ETdnJB/////wFxNgIAIAIgBkECdkH/////AXE2AmwgAiAGQRt0IA5BBXZyQf////8BcTYCaCACIBFBBHQgCEEcdnJB/////wFxNgJ0IAIgE0EKdCAJQRZ2ckH/////AXE2AnwgAiAEQRB0IBJBEHZyQf////8BcTYChAEgAkGMAWoiBiACQUBrQfTYwQAQKyADIAJBrAFqIgQoAgA2AgAgByACQaQBaiIOKQIANwMAIAUgAkGcAWoiCCkCADcDACABIAJBlAFqIgkpAgA3AwAgAiACKQKMATcDQCAGIAJB6ABqQdDYwQAQKyAKIAQoAgA2AgAgDCAOKQIANwMAIAsgCCkCADcDACANIAkpAgAiFDcDACACIAIpAowBIhU3A2ggAiACKAJAIBWnaiIEQf////8BcTYCjAEgAiACKAJEIAIoAmwgBEEddmpqIgRB/////wFxNgKQASACIAEoAgAgFKcgBEEddmpqIgFB/////wFxNgKUASACIAIoAkwgAigCdCABQR12amoiAUH/////AXE2ApgBIAIgBSgCACALKAIAIAFBHXZqaiIBQf////8BcTYCnAEgAiACKAJUIAIoAnwgAUEddmpqIgFB/////wFxNgKgASACIAcoAgAgDCgCACABQR12amoiAUH/////AXE2AqQBIAIgAigCXCACKAKEASABQR12amoiAUH/////AXE2AqgBIAIgAygCACAKKAIAIAFBHXZqakH/////AXE2AqwBIBAgBkGY2cEAEHkgAkGwAWokACAAIBAQkgEgD0EwaiQAC/wBAgJ/AX4jAEEQayICJAAgAkEBOwEMIAIgATYCCCACIAA2AgQjAEEQayIBJAAgAkEEaiIAKQIAIQQgASAANgIMIAEgBDcCBCMAQRBrIgAkACABQQRqIgEoAgAiAigCDCEDAkACQAJAAkAgAigCBA4CAAECCyADDQFBASECQQAhAwwCCyADDQAgAigCACICKAIEIQMgAigCACECDAELIABBgICAgHg2AgAgACABNgIMIABB7JvEACABKAIEIAEoAggiAC0ACCAALQAJENkBAAsgACADNgIEIAAgAjYCACAAQdCbxAAgASgCBCABKAIIIgAtAAggAC0ACRDZAQAL0h4CF38DfiMAQRBrIhQkACMAQfDTAGsiDCQAIAwQvgI2AgwjAEGg0wBrIgEkACABQRhqIhFCADcDACABQRBqIgNCADcDACABQQhqIgJCADcDACABQgA3AwAgDEEMaiIWIgggAUEgENMBIAFBuCVqIBEpAwA3AwAgAUGwJWogAykDADcDACABQaglaiACKQMANwMAIAEgASkDADcDoCUgAUH4MWoiEUIANwMAIAFB8DFqIgNCADcDACABQegxaiICQgA3AwAgAUIANwPgMSAIIAFB4DFqIglBIBDTASABQdgYaiARKQMANwEAIAFB0BhqIAMpAwA3AQAgAUHIGGogAikDADcBACABIAEpA+AxNwHAGCMAQYCFAWsiACQAIABBAzoAyCQgAEHIAGoiCkEAQcgB/AsAIABBmAJqIgJBAEHJAPwLACAAQRg2ApACIAAgCjYC6EggAiABQaAlakEgIABB6MgAaiIIEIABIAAgCjYC6EggAiAAQcgkaiIRQQEgCBCAASAIIApBoAL8CgAAIABBoPkAaiICQgA3AwAgAEGY+QBqIgdCADcDACAAQZD5AGoiFUIANwMAIABBiPkAaiIPQgA3AwAgAEGA+QBqIgZCADcDACAAQfj4AGoiE0IANwMAIABB8PgAaiISQgA3AwAgAEIANwPoeCAIIABBuMoAaiAAQej4AGoiAxCiASAAQaDtAGoiDiACKQMANwMAIABBmO0AaiICIAcpAwA3AwAgAEGQ7QBqIgcgFSkDADcDACAAQYjtAGoiFSAPKQMANwMAIABBgO0AaiAGKQMAIhg3AwAgAEH47ABqIBMpAwAiGTcDACAAQfDsAGogEikDACIXNwMAIABB0DBqIg8gFzcDACAAQdgwaiIGIBk3AwAgAEHgMGoiEyAYNwMAIAAgACkD6HgiFzcD6GwgACAXNwPIMCAAQYAxaiISIA4pAwA3AwAgAEH4MGoiDiACKQMANwMAIABB8DBqIgIgBykDADcDACAAIBUpAwA3A+gwIABBIGoiByATKQMANwMAIABBGGoiFSAGKQMANwMAIABBEGoiEyAPKQMANwMAIAAgACkDyDA3AwggAEFAayASKQMANwMAIABBOGogDikDADcDACAAQTBqIAIpAwA3AwAgACAAKQPoMDcDKCAAQQA6AMgwIABBADYCSCAAIABBCGoiDjYC8EggACAKNgLsSCAAIABByDBqIg82AuhIIAMgCBCVASAAQejsAGoiAiADQYAM/AoAACAKIAJBgAz8CgAAIAggCkGADPwKAAAgAEEAOgDohAEgAEEBNgLIJCAAIA42AtAwIAAgETYCzDAgACAAQeiEAWoiBjYCyDAgAyAPEJUBIAIgA0GADPwKAAAgCiACQYAM/AoAACAAQejUAGoiEiAKQYAM/AoAACAAQQA6AOiEASAAQQI2AsgkIAAgDjYC0DAgACARNgLMMCAAIAY2AsgwIAMgDxCVASACIANBgAz8CgAAIAogAkGADPwKAAAgAEHo4ABqIApBgAz8CgAAIAogCEGAJPwKAAAgAEEAOgDoeCAAIABBKGoiDjYC7EggACADNgLoSCARIAgQNyAAQQM6AOh4IAAgDjYC7EggACADNgLoSCAPIAgQNyACIBEgDxCMASADIA8gAEHIPGoiDhCMASAAIBE2AuyEASAAIAI2AvCEASAAIAo2AuiEASAIIAYQPiAAQoCAgIAwNwL4hAEgACAGNgL0hAEgACASNgLshAEgACADNgLwhAEgACAINgLohAEgDiAGEHIgCSACQYAM/AoAACAAQeDIAGogBykDADcBACAAQdjIAGogFSkDADcBACAAQdDIAGogEykDADcBACAAIAApAwg3AchIIAlBgAxqIA5BoAz8CgAAIABBgIUBaiQAIAEgCUGADPwKAAAgAUHAJWoiAyABQeA9akGgDPwKAAAgAUHsMWogAyABQcAxahBFIAFBkDtqIAFB2DFqKQEANwIAIAFBiDtqIAFB0DFqKQEANwIAIAFBgDtqIAFByDFqKQEANwIAIAFBIDYC9DogAUIBNwLsOiABQYAJNgLoMSABQgE3AuAxIAEgASkBwDE3Avg6IAFBgMoAaiICIAkQgQEgAUGAPmogAhBJIAkgA0GgDPwKAAAgAUGADGoiAiAJQcAM/AoAACADIAJBgAT8CgAAIAFBwClqIAFBgBBqQYAE/AoAACABQcAtaiABQYAUakGABPwKAAAgCSADQYAM/AoAACABQeg9aiABQYgYaikBADcBACABQfA9aiABQZAYaikBADcBACABQfg9aiABQZgYaikBADcBACABQYglaiABQagYaikBADcBACABQZAlaiABQbAYaikBADcBACABQZglaiABQbgYaikBADcBACABIAEpAYAYNwHgPSABIAEpAaAYNwGAJSABQeAYaiIDIAlBoAz8CgAAIAxBsCVqIhEiAiABQeAY/AoAACACQeAYaiADQcAM/AoAACABQaDTAGokACAMQRBqIhAgEUHgGPwKAAAgDEHwGGoiAiAMQZA+akHADPwKAAAgDEG8JWogAiAMQfAkahBFIAxB4C5qIAxBiCVqKQEANwIAIAxB2C5qIAxBgCVqKQEANwIAIAxB0C5qIAxB+CRqKQEANwIAIAxBIDYCxC4gDEIBNwK8LiAMQYAJNgK4JSAMQgE3ArAlIAwgDCkB8CQ3AsguIAxB0MoAaiIVIBEQgQEjAEHwLmsiBCQAIARBhBxqIhMgECAQQYAMaiICEEUgBEGsCWoiEiACIBBBgBhqEEUgBEHQEmogEEGYGGopAQA3AgAgBEHIEmogEEGQGGopAQA3AgAgBEHAEmogEEGIGGopAQA3AgAgBEEgNgK0EiAEQgE3AqwSIARBgAk2AqgJIARCATcCoAkgBCAQKQGAGDcCuBIgBCAEQaAJaiIAEIEBIARBkCVqIARBoAn8CgAAIARBoAk2AowlIARCATcChCUgBEGACTYCgBwgBEIBNwL4GyMAQaASayINJAAgBEH4G2oiASIDQQxqIQkgAygClAkhByADKAIIIQYgAygCkAkhDyADKAIEIQsgAygCACECAkACQAJAAkACQCADKAKMCSIOQQFxBEAgA0GYCWohCCACIQMDQAJ/AkAgA0EBcUUEQCACIQMMAQtBACEDIAYgC0YNACAJIAtqIQogC0EBaiELQQEMAQsgByAPRg0EIAggD2ohCiAPQQFqIQ8gAyECQQALIQMgBSANaiAKLQAAOgAAIAVBAWoiBUGgEkcNAAsMAQsgAkEBcUUgBiALRnINASANIAkgC2otAAA6AAAgAyALaiEJIAsgBmsiAkEBaiEKIAJBAmohCANAIAUgCmpFDQIgBSANaiIDQQFqIAUgCWoiAkENai0AADoAACAFQZ4SRwRAIAUgCGpFDQMgA0ECaiACQQ5qLQAAOgAAIAVBAmohBQwBCwsgBSALakECaiELQQEhAgsgEiANQaAS/AoAACACQQFxIAYgC0dxRSAOQQFxRSAHIA9GcnFFDQIgDUGgEmokACAEQeAbaiAQQagYaikBADcCACAEQegbaiAQQbAYaikBADcCACAEQfAbaiAQQbgYaikBADcCACAEQSA2AtQbIARCATcCzBsgBEGgEjYCqAkgBEIBNwKgCSAEIBApAaAYNwLYGyMAQcASayINJAAgAEEMaiEOIAAoArQSIRIgACgCCCEGIAAoArASIQcgACgCBCELIAAoAgAhAgJAIAAoAqwSIgpBAXEEQCAAQbgSaiEIQQAhBSACIQMDQAJ/AkAgA0EBcUUEQCACIQMMAQtBACEDIAYgC0YNACALIA5qIQkgC0EBaiELQQEMAQsgByASRg0EIAcgCGohCSAHQQFqIQcgAyECQQALIQMgBSANaiAJLQAAOgAAIAVBAWoiBUHAEkcNAAsMAQsgAkEBcUUgBiALRnINASANIAsgDmotAAA6AAAgACALaiEIIAtBAWohAyALIAZrQQFqIQJBACEFA0AgAiAFakUNAiAFIA1qIg5BAWogBSAIaiIJQQ1qLQAAOgAAIAYgA0EBakYNAiAOQQJqIAlBDmotAAA6AAAgBiADQQJqRg0CIA5BA2ogCUEPai0AADoAACADQQNqIQMgBUEDaiIFQb8SRw0AC0EBIQIgBSALakEBaiELCyATIA1BwBL8CgAAIAJBAXEgBiALR3EgCkEBcSAHIBJHcXINAiANQcASaiQAIARB2C5qIBBByBhqKQEANwIAIARB4C5qIBBB0BhqKQEANwIAIARB6C5qIBBB2BhqKQEANwIAIARBIDYCzC4gBEIBNwLELiAEQcASNgKAHCAEQgE3AvgbIAQgECkBwBg3AtAuIwBB4BJrIgckACABQQxqIQkgASgC1BIhEiABKAIIIRMgASgC0BIhDSABKAIEIQYgASgCACEDAkAgASgCzBIiDkEBcQRAIAFB2BJqIQhBACEFIAMhAgNAAn8CQCACQQFxRQRAIAMhAgwBC0EAIQIgBiATRg0AIAYgCWohCiAGQQFqIQZBAQwBCyANIBJGDQQgCCANaiEKIA1BAWohDSACIQNBAAshAiAFIAdqIAotAAA6AAAgBUEBaiIFQeASRw0ACwwBCyADQQFxRSAGIBNGcg0BIAcgBiAJai0AADoAACABIAZqIQkgBiATayICQQFqIQogAkECaiEIQQAhBQNAIAUgCmpFDQIgBSAHaiIDQQFqIAUgCWoiAkENai0AADoAACAFQd4SRwRAIAUgCGpFDQMgA0ECaiACQQ5qLQAAOgAAIAVBAmohBQwBCwsgBSAGakECaiEGQQEhAwsgESAHQeAS/AoAACADQQFxIAYgE0dxRSAOQQFxRSANIBJGcnFFBEAgB0EANgIQIAdBATYCBCAHQayAwAA2AgAgB0IENwIIIAdBqKTAABDEAgALIAdB4BJqJAAgBEHwLmokAAwBC0HIpMAAQS9BiKXAABCMAgALQYAcQQEQgQMiAwRAIAMgEUHgEvwKAAAgDCgCDCECIANB4BJqIBVBoAn8CgAAIAIgAigCAEEBayICNgIAIAJFBEAgFhDBAgsgFEEANgIMIBRCgBw3AgQgFCADNgIAIAxB8NMAaiQADAILQQFBgBwQ3QIACyANQQA2AhAgDUEBNgIEIA1BrIDAADYCACANQgQ3AgggDUGopMAAEMQCAAsgFCgCACAUKAIEIBQoAgggFCgCDCAUQRBqJAAL6x4CGn8IfiMAQRBrIgkkACMAQbCgBGsiCyQAIAsQvgI2AgwjAEHwxQhrIgAkACAAQSBqIhJCADcDACAAQRhqIhNCADcDACAAQRBqIhRCADcDACAAQgA3AwggC0EMaiIVIABBCGoiA0EgENMBIABB+IQEaiICQQBByAH8CwAgAEHIhgRqQQBBiQH8CwAgAEIANwPwhAQgAEEYNgLAhgQgAEGQxAJqIgciBCAAQfCEBGoiASADQSAQUSABIARB8LfAAEEBEFEgAEEoaiIGIAFB8LfAAEEBEFEgAEGIhQRqIgNCADcDACAAQYCFBGoiBUIANwMAIAJCADcDACAAQgA3A/CEBCAGIAFBIBCDASAAQagDaiIMIAMpAwA3AwAgAEGgA2oiDyAFKQMANwMAIABBmANqIhAgAikDADcDACAAIAApA/CEBDcDkAMgAEGohQRqIghCADcDACAAQaCFBGoiCkIANwMAIABBmIUEaiINQgA3AwAgAEGQhQRqIg5CADcDACADQgA3AwAgBUIANwMAIAJCADcDACAAQgA3A/CEBCABQcAAEIMBIABB6ANqIAgpAwA3AwAgAEHgA2ogCikDADcDACAAQdgDaiANKQMANwMAIABB0ANqIA4pAwA3AwAgAEHIA2ogAykDADcDACAAQcADaiAFKQMANwMAIABBuANqIAIpAwA3AwAgACAAKQPwhAQ3A7ADIANCADcDACAFQgA3AwAgAkIANwMAIABCADcD8IQEIAFBIBCDARogAEGIBGoiFiADKQMANwMAIABBgARqIhcgBSkDADcDACAAQfgDaiIYIAIpAwA3AwAgACAAKQPwhAQ3A/ADIABBIDYC9IQEIAAgAEGQA2o2AvCEBCAAQZAEaiIKIgYgARCFASAAQQA2ApDEAiAAQQA6APCFByAAQcAANgL4hAQgACAAQfCFB2oiAjYC/IQEIAAgAEGwA2oiBTYC9IQEIAAgBDYC8IQEIABBkIQBaiINIgMgARCRASAAQQA6APCFByAAQQQ2ApDEAiAAQcAANgL4hAQgACACNgL8hAQgACAFNgL0hAQgACAENgLwhAQgAEGQpAFqIg4iBSABEJEBIAEgAyAFEHEgACADNgKUxAIgACABNgKYxAIgACAGNgKQxAIgAEGQxAFqIgMgBBBrIAEgAyAAQZDkAWoiBhBwIABCgICAgMAANwKgxAIgACADNgKcxAIgACAAQfCkBGoiCDYClMQCIAAgBTYCmMQCIAAgATYCkMQCIAYgBBA0IAEgBhDVASAAQfCFCGoiAyABQYAI/AoAACAAQfClCGoiBCAAQfCMBGoiBUGACPwKAAAgAiADQYAI/AoAACAHIARBgAj8CgAAIAEgAEGQ7AFqENUBIAMgAUGACPwKAAAgBCAFQYAI/AoAACAAQfCNB2ogA0GACPwKAAAgAEGQzAJqIARBgAj8CgAAIAEgAEGQ9AFqENUBIAMgAUGACPwKAAAgBCAFQYAI/AoAACAAQfCVB2ogA0GACPwKAAAgAEGQ1AJqIARBgAj8CgAAIAEgAEGQ/AFqENUBIAMgAUGACPwKAAAgBCAFQYAI/AoAACAAQfCdB2ogA0GACPwKAAAgAEGQ3AJqIARBgAj8CgAAIAEgAkGAIPwKAAAgCCAHQYAg/AoAACAAQZCEAmoiGSABQYAg/AoAACAAQZCkAmoiESAIQYAg/AoAACABIApBgAj8CgAAIAUgAEGQDGpBgAj8CgAAIABB8JQEaiIGIABBkBRqQYAI/AoAACAAQfCcBGoiCCAAQZAcakGACPwKAAAgBCABQYAg/AoAACADIARBgCD8CgAAIAIgA0GAIPwKAAAgByACQYAg/AoAACABIABBkCRqQYAI/AoAACAFIABBkCxqQYAI/AoAACAGIABBkDRqQYAI/AoAACAIIABBkDxqQYAI/AoAACAEIAFBgCD8CgAAIAMgBEGAIPwKAAAgAiADQYAg/AoAACAAQZDkAmogAkGAIPwKAAAgASAAQZDEAGpBgAj8CgAAIAUgAEGQzABqQYAI/AoAACAGIABBkNQAakGACPwKAAAgCCAAQZDcAGpBgAj8CgAAIAQgAUGAIPwKAAAgAyAEQYAg/AoAACACIANBgCD8CgAAIABBkIQDaiACQYAg/AoAACABIABBkOQAakGACPwKAAAgBSAAQZDsAGpBgAj8CgAAIAYgAEGQ9ABqQYAI/AoAACAIIABBkPwAakGACPwKAAAgBCABQYAg/AoAACADIARBgCD8CgAAIAIgA0GAIPwKAAAgAEGQpANqIAJBgCD8CgAAIABB9IQEaiAHQYCAAfwKAAAgAEEBNgLwhAQgAEEAOgDwhQcgAEGIpghqIAwpAwA3AwAgAEGApghqIA8pAwA3AwAgAEH4pQhqIBApAwA3AwAgACAAKQOQAzcD8KUIIAcgBCAZIAEgAhBnIABB8MUGaiIGIA1BgCD8CgAAIABB8OUGaiIFIA5BgCD8CgAAIAIgCkGAgAH8CgAAIABB8OQFaiAGIAUQcSADIAUgAhBxIAQgESAHEHEgAEHIxQZqIAwpAwA3AgAgAEHAxQZqIA8pAwA3AgAgAEG4xQZqIBApAwA3AgAgAEHYxQZqIBgpAwA3AgAgAEHgxQZqIBcpAwA3AgAgAEHoxQZqIBYpAwA3AgAgAEH4xAZqIABBmIQEaikCADcCACAAQYDFBmogAEGghARqKQIANwIAIABBiMUGaiAAQaiEBGopAgA3AgAgAEGQxQZqIABBsIQEaikCADcCACAAQZjFBmogAEG4hARqKQIANwIAIABBoMUGaiAAQcCEBGopAgA3AgAgAEGoxQZqIABByIQEaikCADcCACAAIAApA5ADNwKwxQYgACAAKQPwAzcC0MUGIAAgACkCkIQENwLwxAYgAEHwhAVqIA1BgCD8CgAAIABB8KQFaiAOQYAg/AoAACAAQfDEBWogEUGAIPwKAAAgAEHwhAZqIANBgCD8CgAAIABB8KQGaiAEQYAg/AoAACABIAJBgIAB/AoAACALQRBqIgJBgMECaiAHQeDAAfwKAAAgAkH4gQRqIBIpAwA3AAAgAkHwgQRqIBMpAwA3AAAgAkHogQRqIBQpAwA3AAAgAiAAKQMINwDggQQgAiABQYDBAvwKAAAgAEHwxQhqJAAjAEGAE2siACQAIAAgAkGAgAFqIAJBgKABaiIBEE4gAEGAA2ogASACQYDAAWoiBRBOIABBgAZqIRAjAEGgImsiASQAAkACQAJAIAJBgOABaiIMIAVGDQAgAUH/HzYCkCIgAUGAIDYCxBMgASAFNgKQGiABIAVBgAhqIgo2ApQaIAEgAUGQImoiDzYCnBogASABQcQTaiIENgKYGiABQQRqIg0iByABQZAaaiIGEK8BIAFB6BZqIgMgBxDLASABQaQQaiIHIANBoAP8CgAAIAFBhA1qIgggB0GgA/wKAAAgBCAIQaAD/AoAACANIARBoAP8CgAAIAogDEYNACABQf8fNgKIGiABQYAgNgKMGiABIAVBgBBqIg42ApQiIAEgCjYCkCIgASABQYgaaiIKNgKcIiABIAFBjBpqIhE2ApgiIAYgDxCvASADIAYQywEgByADQaAD/AoAACAIIAdBoAP8CgAAIAQgCEGgA/wKAAAgAUGkA2ogBEGgA/wKAAAgDCAORg0AIAFB/x82AogaIAFBgCA2AowaIAEgBUGAGGoiEjYClCIgASAONgKQIiABIAo2ApwiIAEgETYCmCIgBiAPEK8BIAMgBhDLASAHIANBoAP8CgAAIAggB0GgA/wKAAAgBCAIQaAD/AoAACABQcQGaiAEQaAD/AoAACAMIBJGDQAgAUH/HzYCiBogAUGAIDYCjBogASAFQYAgaiIFNgKUIiABIBI2ApAiIAEgCjYCnCIgASARNgKYIiAGIA8QrwEgAyAGEMsBIAcgA0GgA/wKAAAgCCAHQaAD/AoAACAEIAhBoAP8CgAAIAFB5AlqIARBoAP8CgAAIBAgDUGADfwKAAAgBSAMRw0BIAFBoCJqJAAMAgtByKTAAEEvQfikwAAQjAIACyABQQVqIwBBsAtrIgIkACACQf8fNgIIIAJBgCA2AgwgAiAFNgKQCCACIAVBgAhqNgKUCCACIAJBCGo2ApwIIAIgAkEMajYCmAggAkEQaiACQZAIaiIDEK8BIANBAEGgA/wLAEGAeCEJA0AgAyACQRBqIAlqIgRBjAhqNQIAIhpCGYggBEGQCGo1AgAiG0IMiIQgBEGUCGo1AgBCAYaEIARBmAhqNQIAQg6GhCAEQZwIajUCAEIbhoQiHD4ACCADIARBgAhqNQIAIARBhAhqNQIAQg2GhCAEQYgIajUCAEIahoQgGkInhoQgG0I0hoQ3AAAgA0EMaiAcQiCIPAAAIANBDWohAyAJQSBqIgkNAAsgAkGQCGpBoAP8CgAAIAJBsAtqJAAgAUEANgIUIAFBATYCCCABQayAwAA2AgQgAUIENwIMIAFBBGpBuKTAABDEAgALIAIpAsDAAiEaIAIpAsjAAiEbIAIpAtDAAiEcIAIpAtjAAiEdIAIpAuDAAiEeIAIpAujAAiEfIAIpAvDAAiEgIAIpAvjAAiEhIAtBkIIEaiIEIgFBgAdqIBBBgA38CgAAIAEgITcAOCABICA3ADAgASAfNwAoIAEgHjcAICABIB03ABggASAcNwAQIAEgGzcACCABIBo3AAAgASACKQCAwAI3AEAgAUHIAGogAkGIwAJqKQAANwAAIAFB0ABqIAJBkMACaikAADcAACABQdgAaiACQZjAAmopAAA3AAAgAUHgAGogAkGgwAJqKQAANwAAIAFB6ABqIAJBqMACaikAADcAACABQfAAaiACQbDAAmopAAA3AAAgAUH4AGogAkG4wAJqKQAANwAAIAFBgAFqIABBgAP8CgAAIAFBgARqIABBgANqQYAD/AoAACAAQYATaiQAIAtBkJYEaiIDIgFBIGogC0GQwQNqIgIgAkGAIGoQOSABIAtB0IEEaiICKQAANwAAIAEgAikACDcACCABIAIpABA3ABAgASACKQAYNwAYAkBBoB5BARCBAyIBBEAgASAEQYAU/AoAACALKAIMIQIgAUGAFGogA0GgCvwKAAAgAiACKAIAQQFrIgI2AgAgAkUEQCAVEMECCyAJQQA2AgwgCUKgHjcCBCAJIAE2AgAgC0GwoARqJAAMAQtBAUGgHhDdAgALIAkoAgAgCSgCBCAJKAIIIAkoAgwgCUEQaiQAC/sCAQt/IwBBEGsiAiQAIwBB0ABrIgAkACAAEL4CNgIMIABByABqIgNCADcDACAAQUBrIgRCADcDACAAQThqIgVCADcDACAAQgA3AzAgAEEMaiIGIABBMGoiAUEgENMBIABBKGoiByADKQMANwMAIABBIGoiCCAEKQMANwMAIABBGGoiCSAFKQMANwMAIAAgACkDMDcDECABIABBEGoiChCDAgJAQcAAQQEQgQMiAQRAIAEgACkDEDcAACABIAApADA3ACAgAUEYaiAHKQMANwAAIAFBEGogCCkDADcAACABQQhqIAkpAwA3AAAgAUEoaiAFKQAANwAAIAFBMGogBCkAADcAACABQThqIAMpAAA3AAAgChDXASAAKAIMIgMgAygCAEEBayIDNgIAIANFBEAgBhDBAgsgAkEANgIMIAJCwAA3AgQgAiABNgIAIABB0ABqJAAMAQtBAUHAABDdAgALIAIoAgAgAigCBCACKAIIIAIoAgwgAkEQaiQAC6cDAQh/IwBBEGsiAyQAIwBB0AJrIgAkACAAEL4CNgIMIABBiAJqIgJCADcDACAAQYACaiIFQgA3AwAgAEH4AWoiBkIANwMAIABCADcD8AEgAEEMaiIHIABB8AFqIgRBIBDTASAAQZACaiIBIAQQOyAAQRBqIgQgARCvAiABENQBIABB2AFqIAYpAwA3AgAgAEHgAWogBSkDADcCACAAQegBaiACKQMANwIAIAAgACkD8AE3AtABAkBBwABBARCBAyIBBEAgASAAKQIQNwAgIAEgAEHQAWoiAikAADcAACABQRhqIAJBGGopAAA3AAAgAUEQaiACQRBqKQAANwAAIAFBCGogAkEIaikAADcAACABQShqIABBGGopAgA3AAAgAUEwaiAAQSBqKQIANwAAIAFBOGogAEEoaikCADcAACAEENYBIAAoAgwiAiACKAIAQQFrIgI2AgAgAkUEQCAHEMECCyADQQA2AgwgA0LAADcCBCADIAE2AgAgAEHQAmokAAwBC0EBQcAAEN0CAAsgAygCACADKAIEIAMoAgggAygCDCADQRBqJAALwggCDX8DfiMAQRBrIggkACMAQRBrIgYkACAGQQRqIQ4jAEGgAmsiAiQAIAJBKGoiBUEAQcEA/AsAIAJBGGpBwKnAACkDADcDACACQRBqQbipwAApAwA3AwAgAkEIakGwqcAAKQMANwMAIAJCADcDICACQaipwAApAwA3AwACQCABIgNBwABPBEAgAiADQQZ2IgStNwMgIAIgACAEEBwgA0E/cSIERQRAIAQhAwwCCyAFIAAgA0FAcWogBPwKAAAgBCEDDAELIANFDQAgBSAAIAP8CgAACyACIAM6AGggAkHwAGogAkHwAPwKAAAgAkGYAWoiBCACLQDYASIDaiIFQYABOgAAIAOtIhBCO4YgAikDkAEiD0IJhiIRIBBCA4aEIhBCgP4Dg0IohoQgEEKAgPwHg0IYhiAQQoCAgPgPg0IIhoSEIA9CAYZCgICA+A+DIA9CD4hCgID8B4OEIA9CH4hCgP4DgyARQjiIhISEIQ8CQAJAIANBP0cEQCADQT9zIgcEQCAFQQFqQQAgB/wLAAsgA0E4c0EHSw0BCyACQfAAaiIDIARBARAcIAJBkAJqQgA3AwAgAkGIAmpCADcDACACQYACakIANwMAIAJB+AFqQgA3AwAgAkHwAWpCADcDACACQegBakIANwMAIAJCADcD4AEgAiAPNwOYAiADIAJB4AFqQQEQHAwBCyACIA83A9ABIAJB8ABqIARBARAcCyACKAKMASEEIAIoAogBIQUgAigChAEhByACKAKAASEJIAIoAnwhCiACKAJ4IQsgAigCdCEMIAIoAnAhDUEgQQEQgQMiA0UEQEEBQSAQ3QIACyAOIAM2AgQgDkEgNgIAIA5BIDYCCCADIARBGHQgBEGA/gNxQQh0ciAEQQh2QYD+A3EgBEEYdnJyNgAcIAMgBUEYdCAFQYD+A3FBCHRyIAVBCHZBgP4DcSAFQRh2cnI2ABggAyAHQRh0IAdBgP4DcUEIdHIgB0EIdkGA/gNxIAdBGHZycjYAFCADIAlBGHQgCUGA/gNxQQh0ciAJQQh2QYD+A3EgCUEYdnJyNgAQIAMgCkEYdCAKQYD+A3FBCHRyIApBCHZBgP4DcSAKQRh2cnI2AAwgAyALQRh0IAtBgP4DcUEIdHIgC0EIdkGA/gNxIAtBGHZycjYACCADIAxBGHQgDEGA/gNxQQh0ciAMQQh2QYD+A3EgDEEYdnJyNgAEIAMgDUEYdCANQYD+A3FBCHRyIA1BCHZBgP4DcSANQRh2cnI2AAAgAkGgAmokACABBEAgACABQQEQ9wILAkAgBigCBCIDIAYoAgwiAE0EQCAGKAIIIQEMAQsgBigCCCEEIABFBEBBASEBIAQgA0EBEPcCDAELIAQgA0EBIAAQ6wIiAQ0AQQEgABDdAgALIAggADYCBCAIIAE2AgAgBkEQaiQAIAgoAgAgCCgCBCAIQRBqJAALIQACQCABIAMQ3gIEQCAAIAEgAyACEOsCIgANAQsACyAACx4AIABFBEAQhwMACyAAIAIgAyAEIAUgASgCEBEPAAtWAQJ/IwBBEGsiACQAAkBB3ABBARCBAyIBBEAgAUHMqMAAQdwA/AoAACAAQdwANgIEIAAgATYCAAwBC0EBQdwAEN0CAAsgACgCACAAKAIEIABBEGokAAscACAARQRAEIcDAAsgACACIAMgBCABKAIQEQcACxwAIABFBEAQhwMACyAAIAIgAyAEIAEoAhARLQALHAAgAEUEQBCHAwALIAAgAiADIAQgASgCEBEKAAscACAARQRAEIcDAAsgACACIAMgBCABKAIQES8ACxwAIABFBEAQhwMACyAAIAIgAyAEIAEoAhARMQALKAEBfyAAKAIAIgFBgICAgHhyQYCAgIB4RwRAIAAoAgQgAUEBEPcCCwsaACAARQRAEIcDAAsgACACIAMgASgCEBEDAAsiACAALQAARQRAIAFBjKjEAEEFEGIPCyABQZGoxABBBBBiCxwAIAAgAC0ABCABQS5GcjoABCAAKAIAIAEQ5wILGAAgAEUEQBCHAwALIAAgAiABKAIQEQAACxoBAX8gACgCACIBBEAgACgCBCABQQEQ9wILCxwAIAAoAgAiACgCACABIABBBGooAgAoAhARAAALHwAgAEEIakGg1cEAKQIANwIAIABBmNXBACkCADcCAAsfACAAQQhqQcCKxAApAgA3AgAgAEG4isQAKQIANwIACx8AIABBCGpB1JTEACkCADcCACAAQcyUxAApAgA3AgALHwAgAEEIakHklMQAKQIANwIAIABB3JTEACkCADcCAAtFACAABEAgACABEIwDAAsjAEEgayIAJAAgAEEANgIYIABBATYCDCAAQbChxAA2AgggAEIENwIQIABBCGpBuKHEABDEAgALFQAgAWlBAUYgAEGAgICAeCABa01xCxcBAX8gABANIgE2AgQgACABQQBHNgIACxcBAX8gABAPIgE2AgQgACABQQBHNgIACxcBAX8gABAQIgE2AgQgACABQQBHNgIACxcBAX8gABARIgE2AgQgACABQQBHNgIACxcBAW8gACABEBkhAhCoASIAIAImASAACxUBAX8jAEEQayIBIAA6AA8gAS0ADwsQACABBEAgACABIAIQ9wILCxYAIAAoAgAgASACIAAo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DQAgAAwDCyADEB4iAUUNASADQXxBeCAHKAIAIgJBA3EbIAJBeHFqIgIgAiADSxsiAgRAIAEgACAC/AoAAAsgASECCyAAEFoLIAILCxAAIAAoAgQgACgCCCABEEcLEAAgACgCACAAKAIEIAEQRwsRACABIAAoAgAgACgCBBDmAgsTACAAQSg2AgQgAEHw1MEANgIACxMAIABBKDYCBCAAQZCKxAA2AgALFgBB/NfEACAANgIAQfjXxABBATYCAAsRACAAKAIEIAAoAgggARCNAwsTACAAQaycxAA2AgQgACABNgIACxAAIAEgACgCACAAKAIEEGILEAAgASgCACABKAIEIAAQbgsRAQF/EKgBIgEgACUBJgEgAQthAQF/AkACQCAAQQRrKAIAIgJBeHEiA0EEQQggAkEDcSICGyABak8EQCACQQAgAyABQSdqSxsNASAAEFoMAgtBvJzEAEEuQeycxAAQpQIAC0H8nMQAQS5BrJ3EABClAgALCw4AIAAoAgAlARAUQQBHCw8AQajHxABBKyAAEKUCAAsOACABQaSywABBGhDmAgsOACABQcCxwABBERDmAgsOACABQdGxwABBEhDmAgsOACABQeOxwABBExDmAgsOACABQfaxwABBFRDmAgsOACABQYuywABBGRDmAgsOACABQdy7wABBERDmAgsaAAJ/IAFBCU8EQCABIAAQlAEMAQsgABAeCwsHACAAEJcCCw4AIAFB7OXAAEEFEOYCCw0AIABBjOzAACABEG4LDQAgAEGUwcEAIAEQbgsIACAAIAEQIAsMAEGPk8QAQTIQEwALDQAgAEG4m8QAIAEQbgsMACAAIAEpAgA3AwALDQAgAEHIocQAIAEQbgsOACABQZygxABBBRDmAgsaACAAIAFBxNvEACgCACIAQd8AIAAbEQEAAAsKACACIAAgARBiCw0AIABBjKrEACABEG4LDQAgAUHW1sQAQRgQYgsOACABQbXBwQBBCBDmAgsOACABQazBwQBBCRDmAgu9CAEtfgJAIAFBGUkEQCABBEBBACABQQN0ayEBIAApA8ABIRAgACkDmAEhHCAAKQNwIREgACkDSCESIAApAyAhHSAAKQO4ASEeIAApA5ABIR8gACkDaCECIAApA0AhDiAAKQMYIQkgACkDsAEhAyAAKQOIASETIAApA2AhCiAAKQM4IRQgACkDECEFIAApA6gBIRUgACkDgAEhBCAAKQNYIRYgACkDMCEXIAApAwghCyAAKQOgASEMIAApA3ghGCAAKQNQIQ0gACkDKCEZIAApAwAhGgNAIAwgGIUgDYUgGYUgGoUiBiADIBOFIAqFIBSFIAWFIgdCAYmFIg8gF4UgHiAfhSAChSAOhSAJhSIIIAZCAYmFIgYgEIUhLiAPIBWFQgKJIiAgDiAHIBAgHIUgEYUgEoUgHYUiG0IBiYUiB4VCN4kiISAFIAQgFYUgFoUgF4UgC4UiDiAIQgGJhSIIhUI+iSIiQn+Fg4UhECAOQgGJIBuFIgUgGIVCKYkiGyAGIBGFQieJIiNCf4WDICGFIRUgDyAWhUIKiSIkIAcgHoVCOIkiJSAIIBOFQg+JIiZCf4WDhSETIAYgHYVCG4kiJyAkIAUgGYVCJIkiKEJ/hYOFIRggBSAMhUISiSIMIAggFIVCBokiKSALIA+FQgGJIipCf4WDhSERIAYgHIVCCIkiKyACIAeFQhmJIixCf4WDICmFIRYgAyAIhUI9iSICIAYgEoVCFIkiAyAHIAmFQhyJIglCf4WDhSESIAQgD4VCLYkiBCAJIAJCf4WDhSEOIAUgDYVCA4kiCyACIARCf4WDhSEUIAQgC0J/hYMgA4UhFyALIANCf4WDIAmFIRkgByAfhUIViSICIAUgGoUiAyAuQg6JIgRCf4WDhSEJIAggCoVCK4kiCiAEIAJCf4WDhSEFQiyJIg0gAiAKQn+Fg4UhCyABQaDTwQBqKQMAIAogDUJ/hYOFIAOFIRogKCAnQn+FgyAlhSIPIRwgDSADQn+FgyAEhSIGIR0gIiAgQn+FgyAbhSIHIR4gJyAlQn+FgyAmhSIIIR8gKiAMQn+FgyArhSECICAgG0J/hYMgI4UhAyAMICtCf4WDICyFIQogJiAkQn+FgyAohSEEICMgIUJ/hYMgIoUhDCAqICwgKUJ/hYOFIQ0gAUEIaiIBDQALIAAgDDcDoAEgACAYNwN4IAAgDTcDUCAAIBk3AyggACAVNwOoASAAIAQ3A4ABIAAgFjcDWCAAIBc3AzAgACALNwMIIAAgAzcDsAEgACATNwOIASAAIAo3A2AgACAUNwM4IAAgBTcDECAAIAc3A7gBIAAgCDcDkAEgACACNwNoIAAgDjcDQCAAIAk3AxggACAQNwPAASAAIA83A5gBIAAgETcDcCAAIBI3A0ggACAGNwMgIAAgGjcDAAsMAQtBoNPBAEHBAEHk08EAEKUCAAsLCQAgAEEANgIAC00BAX8jAEEwayIBJAAgAUEBNgIMIAFB4KfEADYCCCABQgE3AhQgASABQS9qrUKAgICAkA+ENwMgIAEgAUEgajYCECABQQhqIAAQxAIACwgAIAAlARAJCwIACwuL0wQ5AEGAgMAAC+02dG9vIG1hbnkgaXRlbXMgaW4gaXRlcmF0b3IgdG8gZml0IGluIGFycmF5AAAAABAAKgAAAC9Vc2Vycy9tYXNhbm9yay8ucnVzdHVwL3Rvb2xjaGFpbnMvc3RhYmxlLWFhcmNoNjQtYXBwbGUtZGFyd2luL2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvYWxsb2Mvc3JjL2NvbGxlY3Rpb25zL2J0cmVlL21hcC9lbnRyeS5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2NvcmUvc3JjL2l0ZXIvYWRhcHRlcnMvc3RlcF9ieS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvZ2VuZXJhbF9wdXJwb3NlL2RlY29kZV9zdWZmaXgucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvY3VydmUyNTUxOS1kYWxlay00LjEuMy9zcmMvd2luZG93LnJzAGxpYnJhcnkvY29yZS9zcmMvbnVtL2ZsdDJkZWMvc3RyYXRlZ3kvZ3Jpc3UucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwtZHNhLTAuMC40L3NyYy9udHQucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwtZHNhLTAuMC40L3NyYy9oaW50LnJzAGxpYnJhcnkvYWxsb2Mvc3JjL2ZtdC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9kaXlfZmxvYXQucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvcmFuZF9jaGFjaGEtMC4zLjEvc3JjL2d1dHMucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvcmFuZF9jb3JlLTAuNi40L3NyYy9pbXBscy5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9jdXJ2ZTI1NTE5LWRhbGVrLTQuMS4zL3NyYy9lZHdhcmRzLnJzAC9Vc2Vycy9tYXNhbm9yay8ucnVzdHVwL3Rvb2xjaGFpbnMvc3RhYmxlLWFhcmNoNjQtYXBwbGUtZGFyd2luL2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvc3RkL3NyYy9zeXMvdGhyZWFkX2xvY2FsL25vX3RocmVhZHMucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2Yvc2VyZGVfanNvbi0xLjAuMTQ4L3NyYy9lcnJvci5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9oeWJyaWQtYXJyYXktMC4yLjMvc3JjL2l0ZXIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvaHlicmlkLWFycmF5LTAuMy4xL3NyYy9pdGVyLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3NpZ25hdHVyZS0yLjIuMC9zcmMvc2lnbmVyLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2N1cnZlMjU1MTktZGFsZWstNC4xLjMvc3JjL3NjYWxhci5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9tbC1kc2EtMC4wLjQvc3JjL2NyeXB0by5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2NvcmUvc3JjL3N0ci9wYXR0ZXJuLnJzAGxpYnJhcnkvY29yZS9zcmMvbnVtL2ZsdDJkZWMvc3RyYXRlZ3kvZHJhZ29uLnJzAGxpYnJhcnkvY29yZS9zcmMvbnVtL2JpZ251bS5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwtZHNhLTAuMC40L3NyYy9zYW1wbGluZy5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi93YXNtLWJpbmRnZW4tMC4yLjEwNi9zcmMvZXh0ZXJucmVmLnJzAC9Vc2Vycy9tYXNhbm9yay8ucnVzdHVwL3Rvb2xjaGFpbnMvc3RhYmxlLWFhcmNoNjQtYXBwbGUtZGFyd2luL2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvYWxsb2Mvc3JjL2NvbGxlY3Rpb25zL2J0cmVlL25hdmlnYXRlLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2NpcGhlci0wLjQuNC9zcmMvc3RyZWFtX2NvcmUucnMAbGlicmFyeS9jb3JlL3NyYy91bmljb2RlL3ByaW50YWJsZS5ycwAvVXNlcnMvbWFzYW5vcmsvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS1hYXJjaDY0LWFwcGxlLWRhcndpbi9saWIvcnVzdGxpYi9zcmMvcnVzdC9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9ub2RlLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL21sLWRzYS0wLjAuNC9zcmMvZW5jb2RlLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2Jhc2U2NC0wLjIyLjEvc3JjL2VuY29kZS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvZ2VuZXJhbF9wdXJwb3NlL2RlY29kZS5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9zZXJkZV9qc29uLTEuMC4xNDgvc3JjL2RlLnJzAGxpYnJhcnkvY29yZS9zcmMvZm10L21vZC5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvZ2VuZXJhbF9wdXJwb3NlL21vZC5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvbW9kLnJzAGxpYnJhcnkvYWxsb2Mvc3JjL3Jhd192ZWMvbW9kLnJzAGxpYnJhcnkvY29yZS9zcmMvbnVtL2ZsdDJkZWMvbW9kLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3JhbmQtMC44LjUvc3JjL3JuZ3MvdGhyZWFkLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3NlcmRlX2pzb24tMS4wLjE0OC9zcmMvcmVhZC5ycwAvcnVzdC9kZXBzL2RsbWFsbG9jLTAuMi4xMC9zcmMvZGxtYWxsb2MucnMAbGlicmFyeS9zdGQvc3JjL2FsbG9jLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL2l0b2EtMS4wLjE3L3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvZ2VuZXJpYy1hcnJheS0wLjE0Ljcvc3JjL2xpYi5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9rZWNjYWstMC4xLjUvc3JjL2xpYi5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9ibG9jay1idWZmZXItMC4xMC40L3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvbWwtZHNhLTAuMC40L3NyYy9saWIucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvanMtc3lzLTAuMy44My9zcmMvbGliLnJzAC9Vc2Vycy9tYXNhbm9yay8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL29uY2VfY2VsbC0xLjIxLjMvc3JjL2xpYi5ycwAvVXNlcnMvbWFzYW5vcmsvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9tbC1rZW0tMC4yLjEvc3JjL2FsZ2VicmEucnMAL1VzZXJzL21hc2Fub3JrLy5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYWVzLTAuOC40L3NyYy9zb2Z0L2ZpeHNsaWNlMzIucnMAAF0FEABjAAAAOQAAAAkAAADBBRAAYwAAADkAAAAJAAAAaXRlcmF0b3Igc2hvdWxkIGhhdmUgZW5vdWdoIGl0ZW1zIHRvIGZpbGwgYXJyYXkAwQUQAGMAAAA2AAAAEgAAAF0FEABjAAAANgAAABIAAABhc3NlcnRpb24gZmFpbGVkOiB3LjAgPD0gYi4wIHx8IHcuMCA+PSAoLWEpLjAAAADhChAAXwAAAD0AAAAVAAAAAAABAAEAAgAADQAAAAABAAANAAAAAAEA/wwADQANAABgERAAYAAAAJQAAAAvAAAAfQEAAUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky//////////////////////////////////////////////////////////Pv///z80NTY3ODk6Ozw9/////////wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZ////////GhscHR4fICEiIyQlJicoKSorLC0uLzAxMjP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////V2ViL0EgQ3J5cHRvIFdBU00gdjAuMS41IChBRVMtR0NNICsgWDI1NTE5ICsgRWQyNTUxOSArIE1MLUtFTS03NjggKyBNTC1EU0EtNDQgKyBTSEEyNTYvSEtERiln5glqha5nu3Lzbjw69U+lf1IOUYxoBZur2YMfGc3gW0ludmFsaWQgcHJpdmF0ZSBrZXkgbGVuZ3RoSW52YWxpZCBwdWJsaWMga2V5RGVjcnlwdGlvbiBmYWlsZWQAAAAMAAAAHg8QAGQAAAA8AgAACQAAAEludmFsaWQga2V5IGxlbmd0aEVuY3J5cHRpb24gZmFpbGVkSW52YWxpZCBzaWduYXR1cmUgZGF0YUludmFsaWQgc2lnbmF0dXJlIGxlbmd0aEludmFsaWQgcHVibGljIGtleSBsZW5ndGhIS0RGIGV4cGFuc2lvbiBmYWlsZWRjcmVhdGVkX2F0bm9uY2VjYW1wYWlnbl9pZGtlbWtkZmFlYWRlbmFibGVkcmVjaXBpZW50X2tpZHJlY2lwaWVudF94MjU1MTlyZWNpcGllbnRfcHFjbGF5ZXIxX3JlZndlYmFfdmVyc2lvbmVuY3N1aXRlcmVjaXBpZW50ZW5jYXBzdWxhdGVkY2lwaGVydGV4dGF1dGhfdGFnYWFkbGF5ZXIyX3BsYWlubGF5ZXIyX3NpZ19wYWRkaW5nY2xhc3NpY2FscHFjbGF5ZXIybWV0YWFsZ2tpZHNpZzAuMUVkMjU1MTlJbnZhbGlkIFgyNTUxOSBwdWJrZXlYMjU1MTkAAFUREAAKAAAAoQEAABcAAABYMjU1MTkrTUwtS0VNLTc2OHdlYmEtbDIvcHJrd2ViYS1sMi9rZXl3ZWJhLWwyL2l2SFBLRS12MUhLREYtU0hBMjU2QUVTLTI1Ni1HQ00AAFUREAAKAAAArwEAACAAAAACAAAABAAAAAQAAAADAAAAY2FsbGVkIGBSZXN1bHQ6OnVud3JhcCgpYCBvbiBhbiBgRXJyYCB2YWx1ZQBVERAACgAAAI0BAAAzAAAAVREQAAoAAACFAQAAPAAAAFUREAAKAAAAeQEAADYAAABJbnZhbGlkIGNvbmZpZyBKU09OOiAAAAB4FxAAFQAAAEZhaWxlZCB0byBzZXJpYWxpemUgZW52ZWxvcGU6IAAAmBcQAB4AAABJbnZhbGlkIHBheWxvYWQgSlNPTjogAADAFxAAFgAAAERlY2Fwc3VsYXRpb24gZmFpbGVkSW52YWxpZCBjaXBoZXJ0ZXh0IGxlbmd0aEludmFsaWQgQUFEIGVuY29kaW5nAAAAVREQAAoAAADpAQAADgAAAEludmFsaWQgZXBoZW1lcmFsIHB1YmtleU1pc3NpbmcgUFFDIEtFTSBmb3IgZW52ZWxvcGVJbnZhbGlkIFVURi04IGluIHBsYWludGV4dEFBRCBtaXNtYXRjaAAAVREQAAoAAADgAQAARQAAAEludmFsaWQgZW52ZWxvcGUgSlNPTjogAKAYEAAXAAAAc3RydWN0IEwyTWV0YVdhc21zdHJ1Y3QgTDJTdWl0ZVdhc21zdHJ1Y3QgTDJDb25maWdXYXNtc3RydWN0IEwyRW52ZWxvcGVXYXNtc3RydWN0IEwyRW5jYXBzdWxhdGVkV2FzbXN0cnVjdCBMYXllcjJFbmNyeXB0ZWRXYXNtAABSCRAAgwAAABYCAAAvAAAAaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZRoMEABhAAAAoAQAACIAAAAaDBAAYQAAAJYEAAAmAAAAY3JlYXRlZF9hdG5vbmNlY2FtcGFpZ25faWRzdHJ1Y3QgTDJNZXRhV2FzbSB3aXRoIDMgZWxlbWVudHMAshkQACEAAAAAAAAACAAAAAQAAAAEAAAAa2Vta2RmYWVhZHN0cnVjdCBMMlN1aXRlV2FzbSB3aXRoIDMgZWxlbWVudHP2GRAAIgAAAGVuYWJsZWRyZWNpcGllbnRfa2lkcmVjaXBpZW50X3gyNTUxOXJlY2lwaWVudF9wcWNsYXllcjFfcmVmd2ViYV92ZXJzaW9uc3RydWN0IEwyQ29uZmlnV2FzbSB3aXRoIDcgZWxlbWVudHMAAGcaEAAjAAAAZW5jc3VpdGVyZWNpcGllbnRlbmNhcHN1bGF0ZWRjaXBoZXJ0ZXh0YXV0aF90YWdhYWRzdHJ1Y3QgTDJFbnZlbG9wZVdhc20gd2l0aCA3IGVsZW1lbnRzAMYaEAAlAAAAY2xhc3NpY2FscHFjc3RydWN0IEwyRW5jYXBzdWxhdGVkV2FzbSB3aXRoIDIgZWxlbWVudHMAAAAAGxAAKQAAAGxheWVyMm1ldGFzdHJ1Y3QgTGF5ZXIyRW5jcnlwdGVkV2FzbSB3aXRoIDQgZWxlbWVudHM+GxAAKgBB+LbAAAsFAQAA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dKw8H3usf6DI64XzzOF/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAABAAIAAwAEAAUABgAHAAgACQD//////////////////woACwAMAA0ADgAPAP////////////////////////////////////////////////////////////////////8KAAsADAANAA4ADwD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AABAAIAAwAEAAUABgAHAAgACQAP//////////////////oACwAMAA0ADgAPAA/////////////////////////////////////////////////////////////////////6AAsADAANAA4ADwAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////xoOEABjAAAAswEAABoAAAAaDhAAYwAAAAACAAATAAAAGg4QAGMAAAAFAgAAMwAAABoOEABjAAAACQIAAD4AAAAaDhAAYwAAAA8CAAA6AAAAGg4QAGMAAACrAQAAPQAAABoOEABjAAAApgEAAEUAAAAaDhAAYwAAAFwCAAATAAAAGg4QAGMAAABuAgAAGQAAACBhdCBsaW5lIAAAAPgEEABkAAAA9wEAACEAAAD4BBAAZAAAAPsBAAAMAAAAIGNvbHVtbiD4BBAAZAAAAAICAAAhAAAA+AQQAGQAAAALAgAAKgAAAPgEEABkAAAADwIAACwAAAD4BBAAZAAAABQCAAAJAAAAIwAAAAwAAAAEAAAAJAAAACUAAAAmAEHc5MAAC8UHAQAAACcAAABhIERpc3BsYXkgaW1wbGVtZW50YXRpb24gcmV0dXJuZWQgYW4gZXJyb3IgdW5leHBlY3RlZGx5ABUIEABvAAAASwsAAA4AAABSBxAAcwAAADwGAAAUAAAAUgcQAHMAAAA8BgAAIQAAAFIHEABzAAAAMAYAABQAAABSBxAAcwAAADAGAAAhAAAARXJyb3Jhc3NlcnRpb24gZmFpbGVkOiBzZWxmLmlzX2NoYXJfYm91bmRhcnkobmV3X2xlbilFcnJvcigsIGxpbmU6ICwgY29sdW1uOiApAAAhMxAABgAAACczEAAIAAAALzMQAAoAAAA5MxAAAQAAAGludmFsaWQgdHlwZTogLCBleHBlY3RlZCAAAABcMxAADgAAAGozEAALAAAARU9GIHdoaWxlIHBhcnNpbmcgYSBsaXN0RU9GIHdoaWxlIHBhcnNpbmcgYW4gb2JqZWN0RU9GIHdoaWxlIHBhcnNpbmcgYSBzdHJpbmdFT0Ygd2hpbGUgcGFyc2luZyBhIHZhbHVlZXhwZWN0ZWQgYDpgZXhwZWN0ZWQgYCxgIG9yIGBdYGV4cGVjdGVkIGAsYCBvciBgfWBleHBlY3RlZCBpZGVudGV4cGVj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AAAAAACoAxAAYQAAAFwAAABPAAAAqAMQAGEAAABcAAAAQAAAAEF0dGVtcHRlZCB0byBpbml0aWFsaXplIHRocmVhZC1sb2NhbCB3aGlsZSBpdCBpcyBiZWluZyBkcm9wcGVkAACsBREAPgAAAHUEEACCAAAAawAAAA0AAABFcnJvcmdldHJhbmRvbTogdGhpcyB0YXJnZXQgaXMgbm90IHN1cHBvcnRlZGVycm5vOiBkaWQgbm90IHJldHVybiBhIHBvc2l0aXZlIHZhbHVldW5leHBlY3RlZCBzaXR1YXRpb25TZWNSYW5kb21Db3B5Qnl0ZXM6IGlPUyBTZWN1cml0eSBmcmFtZXdvcmsgZmFpbHVyZVJ0bEdlblJhbmRvbTogV2luZG93cyBzeXN0ZW0gZnVuY3Rpb24gZmFpbHVyZVJEUkFORDogZmFpbGVkIG11bHRpcGxlIHRpbWVzOiBDUFUgaXNzdWUgbGlrZWx5UkRSQU5EOiBpbnN0cnVjdGlvbiBub3Qgc3VwcG9ydGVkV2ViIENyeXB0byBBUEkgaXMgdW5hdmFpbGFibGVDYWxsaW5nIFdlYiBBUEkgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyBmYWlsZWRyYW5kU2VjdXJlOiBWeFdvcmtzIFJORyBtb2R1bGUgaXMgbm90IGluaXRpYWxpemVkTm9kZS5qcyBjcnlwdG8gQ29tbW9uSlMgbW9kdWxlIGlzIHVuYXZhaWxhYmxlQ2FsbGluZyBOb2RlLmpzIEFQSSBjcnlwdG8ucmFuZG9tRmlsbFN5bmMgZmFpbGVkTm9kZS5qcyBFUyBtb2R1bGVzIGFyZSBub3QgZGlyZWN0bHkgc3VwcG9ydGVkLCBzZWUgaHR0cHM6Ly9kb2NzLnJzL2dldHJhbmRvbSNub2RlanMtZXMtbW9kdWxlLXN1cHBvcnQAAAAAAAAEAAAABAAAAEkAAABpbnRlcm5hbF9jb2RlAAAAAAAAAAgAAAAEAAAASgAAAGRlc2NyaXB0aW9udW5rbm93bl9jb2RlAAAAAAAEAAAABAAAAEsAAABvc19lcnJvclVua25vd24gRXJyb3I6IAC4CBEADwAAAE9TIEVycm9yOiAAANAIEQAKAAAAY3J5cHRvAAAJBhEAMAYRAFYGEQBqBhEAnAYRAMkGEQD4BhEAGQcRADYHEQBBmJLEAAsxYwcRAJQHEQDBBxEA8QcRACcAAAAmAAAAFAAAADIAAAAtAAAALwAAACEAAAAdAAAALQBB1JLEAAvNDTEAAAAtAAAAMAAAAGUAAACMKxEAmCsRAKQrEQCwKxEAoRAQAF0AAAAUGgAAAQAAAHJldHVybiB0aGlzY2xvc3VyZSBpbnZva2VkIHJlY3Vyc2l2ZWx5IG9yIGFmdGVyIGJlaW5nIGRyb3BwZWRMYXp5IGluc3RhbmNlIGhhcyBwcmV2aW91c2x5IGJlZW4gcG9pc29uZWQAwQkRACoAAAD/EBAAYAAAAAgDAAAZAAAAcmVlbnRyYW50IGluaXQAAAQKEQAOAAAA/xAQAGAAAAB6AgAADQAAAOcIEABqAAAAfwAAABEAAADnCBAAagAAAIwAAAARAAAAfP2LMlfmV/kC30S/40jnr21dy9YsUOtjeEGmV3Ebi7kBAAAAAAAAAGVudGl0eSBub3QgZm91bmRwZXJtaXNzaW9uIGRlbmllZGNvbm5lY3Rpb24gcmVmdXNlZGNvbm5lY3Rpb24gcmVzZXRob3N0IHVucmVhY2hhYmxlbmV0d29yayB1bnJlYWNoYWJsZWNvbm5lY3Rpb24gYWJvcnRlZG5vdCBjb25uZWN0ZWRhZGRyZXNzIGluIHVzZWFkZHJlc3Mgbm90IGF2YWlsYWJsZW5ldHdvcmsgZG93bmJyb2tlbiBwaXBlZW50aXR5IGFscmVhZHkgZXhpc3Rzb3BlcmF0aW9uIHdvdWxkIGJsb2Nrbm90IGEgZGlyZWN0b3J5aXMgYSBkaXJlY3RvcnlkaXJlY3Rvcnkgbm90IGVtcHR5cmVhZC1vbmx5IGZpbGVzeXN0ZW0gb3Igc3RvcmFnZSBtZWRpdW1maWxlc3lzdGVtIGxvb3Agb3IgaW5kaXJlY3Rpb24gbGltaXQgKGUuZy4gc3ltbGluayBsb29wKXN0YWxlIG5ldHdvcmsgZmlsZSBoYW5kbGVpbnZhbGlkIGlucHV0IHBhcmFtZXRlcmludmFsaWQgZGF0YXRpbWVkIG91dHdyaXRlIHplcm9ubyBzdG9yYWdlIHNwYWNlc2VlayBvbiB1bnNlZWthYmxlIGZpbGVxdW90YSBleGNlZWRlZGZpbGUgdG9vIGxhcmdlcmVzb3VyY2UgYnVzeWV4ZWN1dGFi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";

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
