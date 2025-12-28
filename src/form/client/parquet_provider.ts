import { tableFromJSON, tableToIPC } from "apache-arrow";
import { initSync, Table, writeParquet } from "parquet-wasm/esm";
import { PARQUET_WASM_BASE64 } from "./parquet_wasm_embed";

type ParquetProvider = {
  export: (records: any[]) => Promise<Uint8Array>;
};

let isInitialized = false;

const decodeBase64 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const ensureInit = () => {
  if (isInitialized) return;
  const wasmBytes = decodeBase64(PARQUET_WASM_BASE64);
  initSync(wasmBytes);
  isInitialized = true;
};

const exportParquet = async (records: any[]): Promise<Uint8Array> => {
  ensureInit();
  const table = tableFromJSON(records);
  const ipc = tableToIPC(table, "stream");
  const wasmTable = Table.fromIPCStream(ipc);
  return writeParquet(wasmTable);
};

export function registerParquetProvider() {
  if ((globalThis as any).webaParquet) return;
  const provider: ParquetProvider = {
    export: exportParquet,
  };
  (globalThis as any).webaParquet = provider;
}

registerParquetProvider();
