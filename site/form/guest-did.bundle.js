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
    for (let i of T(e))
      !E.call(s, i) && i !== r && h(s, i, { get: () => e[i], enumerable: !(t = D(e, i)) || t.enumerable });
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
      for (var r = "", t = 0, i = -1, a = 0, n, l = 0;l <= s.length; ++l) {
        if (l < s.length)
          n = s.charCodeAt(l);
        else {
          if (n === 47)
            break;
          n = 47;
        }
        if (n === 47) {
          if (!(i === l - 1 || a === 1))
            if (i !== l - 1 && a === 2) {
              if (r.length < 2 || t !== 2 || r.charCodeAt(r.length - 1) !== 46 || r.charCodeAt(r.length - 2) !== 46) {
                if (r.length > 2) {
                  var f = r.lastIndexOf("/");
                  if (f !== r.length - 1) {
                    f === -1 ? (r = "", t = 0) : (r = r.slice(0, f), t = r.length - 1 - r.lastIndexOf("/")), i = l, a = 0;
                    continue;
                  }
                } else if (r.length === 2 || r.length === 1) {
                  r = "", t = 0, i = l, a = 0;
                  continue;
                }
              }
              e && (r.length > 0 ? r += "/.." : r = "..", t = 2);
            } else
              r.length > 0 ? r += "/" + s.slice(i + 1, l) : r = s.slice(i + 1, l), t = l - i - 1;
          i = l, a = 0;
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
      for (var e = "", r = false, t, i = arguments.length - 1;i >= -1 && !r; i--) {
        var a;
        i >= 0 ? a = arguments[i] : (t === undefined && (t = process.cwd()), a = t), v(a), a.length !== 0 && (e = a + "/" + e, r = a.charCodeAt(0) === 47);
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
      for (var i = e.length, a = i - t, n = 1;n < r.length && r.charCodeAt(n) === 47; ++n)
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
      for (o = t + d + 1;o <= i; ++o)
        (o === i || e.charCodeAt(o) === 47) && (b.length === 0 ? b += ".." : b += "/..");
      return b.length > 0 ? b + r.slice(n + d) : (n += d, r.charCodeAt(n) === 47 && ++n, r.slice(n));
    }, _makeLong: function(e) {
      return e;
    }, dirname: function(e) {
      if (v(e), e.length === 0)
        return ".";
      for (var r = e.charCodeAt(0), t = r === 47, i = -1, a = true, n = e.length - 1;n >= 1; --n)
        if (r = e.charCodeAt(n), r === 47) {
          if (!a) {
            i = n;
            break;
          }
        } else
          a = false;
      return i === -1 ? t ? "/" : "." : t && i === 1 ? "//" : e.slice(0, i);
    }, basename: function(e, r) {
      if (r !== undefined && typeof r != "string")
        throw new TypeError('"ext" argument must be a string');
      v(e);
      var t = 0, i = -1, a = true, n;
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
            f === -1 && (a = false, f = n + 1), l >= 0 && (c === r.charCodeAt(l) ? --l === -1 && (i = n) : (l = -1, i = f));
        }
        return t === i ? i = f : i === -1 && (i = e.length), e.slice(t, i);
      } else {
        for (n = e.length - 1;n >= 0; --n)
          if (e.charCodeAt(n) === 47) {
            if (!a) {
              t = n + 1;
              break;
            }
          } else
            i === -1 && (a = false, i = n + 1);
        return i === -1 ? "" : e.slice(t, i);
      }
    }, extname: function(e) {
      v(e);
      for (var r = -1, t = 0, i = -1, a = true, n = 0, l = e.length - 1;l >= 0; --l) {
        var f = e.charCodeAt(l);
        if (f === 47) {
          if (!a) {
            t = l + 1;
            break;
          }
          continue;
        }
        i === -1 && (a = false, i = l + 1), f === 46 ? r === -1 ? r = l : n !== 1 && (n = 1) : r !== -1 && (n = -1);
      }
      return r === -1 || i === -1 || n === 0 || n === 1 && r === i - 1 && r === t + 1 ? "" : e.slice(r, i);
    }, format: function(e) {
      if (e === null || typeof e != "object")
        throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof e);
      return F("/", e);
    }, parse: function(e) {
      v(e);
      var r = { root: "", dir: "", base: "", ext: "", name: "" };
      if (e.length === 0)
        return r;
      var t = e.charCodeAt(0), i = t === 47, a;
      i ? (r.root = "/", a = 1) : a = 0;
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
      return n === -1 || f === -1 || o === 0 || o === 1 && n === f - 1 && n === l + 1 ? f !== -1 && (l === 0 && i ? r.base = r.name = e.slice(1, f) : r.base = r.name = e.slice(l, f)) : (l === 0 && i ? (r.name = e.slice(1, n), r.base = e.slice(1, f)) : (r.name = e.slice(l, n), r.base = e.slice(l, f)), r.ext = e.slice(n, f)), l > 0 ? r.dir = e.slice(0, l - 1) : i && (r.dir = "/"), r;
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

// src/core/l2crypto.ts
var import_canonicalize = __toESM(require_canonicalize(), 1);
var fs = (() => ({}));

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
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (;offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
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
function decrypt_l2_envelope_wasm(envelope_json, recipient_sk, pqc_sk) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passStringToWasm0(envelope_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(recipient_sk, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(pqc_sk) ? 0 : passArray8ToWasm0(pqc_sk, wasm.__wbindgen_malloc);
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.decrypt_l2_envelope_wasm(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}
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
function x25519_generate_keypair() {
  const ret = wasm.x25519_generate_keypair();
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
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
function x25519GenerateKeyPair() {
  if (!initialized)
    throw new Error("WASM not initialized");
  const bytes = x25519_generate_keypair();
  return {
    privateKey: bytes.slice(0, 32),
    publicKey: bytes.slice(32, 64)
  };
}
function decryptL2Envelope(envelopeJson, recipientSk, pqcSk) {
  if (!initialized)
    throw new Error("WASM not initialized");
  return decrypt_l2_envelope_wasm(envelopeJson, recipientSk, pqcSk);
}

// src/core/l2crypto.ts
async function generateRecipientKeyPair() {
  await initWasm();
  return x25519GenerateKeyPair();
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
async function decryptLayer2(envelope, recipientPrivateKey, options) {
  await initWasm();
  if (envelope.layer2.enc !== "HPKE-v1") {
    throw new Error(`Unsupported layer2.enc: ${envelope.layer2.enc}`);
  }
  if (!options?.skipReplayCheck) {
    let guard = options?.replayGuard;
    if (!guard) {
      console.warn("SECURITY WARNING: No ReplayGuard provided to decryptLayer2. Using in-memory ephemeral store. Replays will only be detected within this process lifetime.");
      guard = new ReplayGuard;
    }
    const isFresh = await guard.checkAndMark(envelope.meta.nonce);
    if (!isFresh) {
      throw new Error("Security Error: Replay detected (nonce used).");
    }
  }
  const envelopeJson = JSON.stringify(envelope);
  const pqcSk = options?.pqc?.recipientPrivateKey;
  try {
    const plainJson = decryptL2Envelope(envelopeJson, recipientPrivateKey, pqcSk);
    return JSON.parse(plainJson);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing PQC KEM") || msg.includes("AAD mismatch")) {
      throw new Error(msg);
    }
    throw new Error("Decryption failed");
  }
}

// src/form/client/guest_did.ts
var isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
var REMOTE_URL = isLocal ? "http://127.0.0.1:5002/api" : "/api";
var RP_NAME = "SRN Guest Service";
async function checkExistingGuestDid() {
  const count = localStorage.length;
  for (let i = 0;i < count; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("guest-did:"))
      continue;
    if (key.endsWith(":privateKey"))
      continue;
    const did = key.replace("guest-did:", "");
    return did;
  }
  return null;
}
async function getOrCreateGuestDid(forceNew = false) {
  if (!window.PublicKeyCredential) {
    throw new Error("Passkey not supported on this device");
  }
  if (!forceNew) {
    const existingDid = await checkExistingGuestDid();
    if (existingDid) {
      console.log("Reusing existing Guest DID");
      return { did: existingDid, isReused: true };
    }
  }
  const did = await createGuestDidWithPasskey();
  return { did, isReused: false };
}
async function createGuestDidWithPasskey() {
  try {
    let arrayBufferToBase64 = function(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const len = bytes.length;
      for (let i = 0;i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };
    await initWasm(fetch("weba_crypto_wasm_bg.wasm"));
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: RP_NAME,
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: "guest@srn.example",
          displayName: "SRN Guest User"
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required",
          requireResidentKey: true
        },
        timeout: 60000,
        attestation: "none"
      }
    });
    if (!credential) {
      throw new Error("Passkey creation cancelled");
    }
    const encKeyPair = await generateRecipientKeyPair();
    const encryptionPublicKeyJwk = {
      kty: "OKP",
      crv: "X25519",
      x: arrayBufferToBase64Url(encKeyPair.publicKey)
    };
    const mutation = `
      mutation CreateGuestDid($credentialId: String!, $attestationObject: String!, $clientDataJSON: String!, $encryptionPublicKeyJwk: String!) {
        createGuestDid(credentialId: $credentialId, attestationObject: $attestationObject, clientDataJSON: $clientDataJSON, encryptionPublicKeyJwk: $encryptionPublicKeyJwk) {
          did
          expiresAt
        }
      }
    `;
    const response = await fetch(REMOTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: {
          credentialId: credential.id,
          attestationObject: arrayBufferToBase64(credential.response.attestationObject),
          clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
          encryptionPublicKeyJwk: JSON.stringify(encryptionPublicKeyJwk)
        }
      })
    });
    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }
    const { did, expiresAt } = result.data.createGuestDid;
    localStorage.setItem(`guest-did:${did}`, credential.id);
    localStorage.setItem(`guest-did:${did}:privateKey`, arrayBufferToBase64Url(encKeyPair.privateKey));
    console.log(`Guest DID created: ${did} (expires: ${expiresAt})`);
    return did;
  } catch (error) {
    console.error("Failed to create Guest DID:", error);
    throw error;
  }
}
async function fetchGuestInbox(did) {
  await initWasm(fetch("weba_crypto_wasm_bg.wasm"));
  const credentialId = localStorage.getItem(`guest-did:${did}`);
  if (!credentialId)
    throw new Error("Credential ID not found for DID");
  const challengeResp = await fetch(REMOTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query GetChallenge($did: ID!) { getChallenge(did: $did) { nonce } }`,
      variables: { did }
    })
  });
  const challengeResult = await challengeResp.json();
  if (challengeResult.errors)
    throw new Error(challengeResult.errors[0].message);
  const nonce = challengeResult.data.getChallenge.nonce;
  const challengeBuffer = base64UrlToArrayBuffer(nonce);
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: challengeBuffer,
      allowCredentials: [{
        id: base64UrlToArrayBuffer(credentialId),
        type: "public-key"
      }],
      userVerification: "required"
    }
  });
  if (!assertion)
    throw new Error("Authentication failed");
  const response = assertion.response;
  const query = `
        query GuestInbox($did: ID!, $credentialId: String!, $signature: String!, $authenticatorData: String!, $clientDataJSON: String!) {
            guestInbox(did: $did, credentialId: $credentialId, signature: $signature, authenticatorData: $authenticatorData, clientDataJSON: $clientDataJSON) {
                id
                senderDid
                recipientDid
                envelope
                createdAt
            }
        }
    `;
  const apiResp = await fetch(REMOTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: {
        did,
        credentialId,
        signature: arrayBufferToBase64(response.signature),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON)
      }
    })
  });
  const apiResult = await apiResp.json();
  if (apiResult.errors)
    throw new Error(apiResult.errors[0].message);
  const messages = apiResult.data.guestInbox;
  const privateKeyB64 = localStorage.getItem(`guest-did:${did}:privateKey`);
  if (privateKeyB64) {
    const privateKey = new Uint8Array(base64UrlToArrayBuffer(privateKeyB64));
    for (const msg of messages) {
      if (msg.envelope) {
        try {
          const encrypted = JSON.parse(msg.envelope);
          const decryptedPayload = await decryptLayer2(encrypted, privateKey);
          if (decryptedPayload.layer2_plain) {
            msg.content = decryptedPayload.layer2_plain;
          } else {
            msg.content = decryptedPayload;
          }
          delete msg.envelope;
        } catch (e) {
          console.error("Failed to decrypt:", e);
          msg.content = { text: "[Decryption Failed: " + e.message + "]" };
        }
      }
    }
  }
  return messages;
}
function base64UrlToArrayBuffer(base64url) {
  const padding = "=".repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0;i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  for (let i = 0;i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
function arrayBufferToBase64Url(buffer) {
  let binary = "";
  const len = buffer.length;
  for (let i = 0;i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
if (typeof window !== "undefined") {
  window.getOrCreateGuestDid = getOrCreateGuestDid;
  window.fetchGuestInbox = fetchGuestInbox;
  window.submitFormWithGuestDid = async (formData, wantsReplies) => {
    const { did, isReused } = await getOrCreateGuestDid(false);
    return { senderDid: did };
  };
  window.clearAllGuestDids = () => {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("guest-did:")) {
        localStorage.removeItem(key);
      }
    }
  };
}
export {
  getOrCreateGuestDid,
  fetchGuestInbox
};
