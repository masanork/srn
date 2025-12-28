type ParquetWasmApi = {
  init?: () => Promise<void> | void;
  tableFromJSON?: (records: any[]) => any;
  writeParquet?: (table: any) => Uint8Array;
  fromJson?: (records: any[]) => Uint8Array;
};

type ParquetProvider = {
  export: (records: any[]) => Promise<Uint8Array>;
  isReady?: () => boolean;
};

const PARQUET_INIT_FLAG = "__webaParquetInit";

const isParquetReady = () => {
  return !!(globalThis as any).parquetWasm;
};

const ensureInit = async (wasm: ParquetWasmApi) => {
  if (typeof wasm.init !== "function") return;
  if ((wasm as any)[PARQUET_INIT_FLAG]) return;
  await wasm.init();
  (wasm as any)[PARQUET_INIT_FLAG] = true;
};

const exportParquet = async (records: any[]): Promise<Uint8Array> => {
  const wasm = (globalThis as any).parquetWasm as ParquetWasmApi | undefined;
  if (!wasm) {
    throw new Error("parquetWasm is not loaded");
  }
  await ensureInit(wasm);
  if (wasm.tableFromJSON && wasm.writeParquet) {
    const table = wasm.tableFromJSON(records);
    return wasm.writeParquet(table);
  }
  if (wasm.fromJson) {
    return wasm.fromJson(records);
  }
  throw new Error("Unsupported parquetWasm API");
};

export function registerParquetProvider() {
  if ((globalThis as any).webaParquet) return;
  const provider: ParquetProvider = {
    export: exportParquet,
    isReady: isParquetReady,
  };
  (globalThis as any).webaParquet = provider;
}

registerParquetProvider();
