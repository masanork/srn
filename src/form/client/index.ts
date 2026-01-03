import { initRuntime } from './runtime';
import { SearchEngine } from './search';
import * as WasmCore from "@srn/core";

const search = new SearchEngine();
(window as any).GlobalSearch = search;
(window as any).SearchEngine = search;
(window as any).WebACrypto = WasmCore; // Expose WASM Crypto for Maker UI

// Boot the core runtime
// Note: SearchEngine will be initialized by runtime.ts after structure data is loaded
initRuntime();
