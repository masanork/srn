/* tslint:disable */
/* eslint-disable */

export class WasmJpkiController {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Read My Number (Individual Number)
   * Requires the 4-digit Input Support PIN.
   */
  read_mynumber(pin: string): Promise<string>;
  /**
   * Read Basic 4 Information (Name, Address, DOB, Gender)
   * Requires the 4-digit Input Support PIN.
   */
  read_attributes(pin: string): Promise<any>;
  constructor(reader: WebUsbReader);
}

export class WebUsbReader {
  free(): void;
  [Symbol.dispose](): void;
  constructor(js_transport: any);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmjpkicontroller_free: (a: number, b: number) => void;
  readonly __wbg_webusbreader_free: (a: number, b: number) => void;
  readonly wasmjpkicontroller_new: (a: number) => number;
  readonly wasmjpkicontroller_read_attributes: (a: number, b: number, c: number) => any;
  readonly wasmjpkicontroller_read_mynumber: (a: number, b: number, c: number) => any;
  readonly webusbreader_new: (a: any) => number;
  readonly wasm_bindgen__convert__closures_____invoke__hee16286d4cdf95dc: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen__closure__destroy__hff24f3059018363d: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h7246c38ecb4b9c6c: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
