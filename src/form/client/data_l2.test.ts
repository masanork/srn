import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Window } from "happy-dom";

const wasmBuildL2 = mock((plain, sk, kid, config, created) => JSON.stringify({
  weba_version: "0.1",
  layer1_ref: "sha256:abcd",
  layer2: {
    enc: "HPKE-v1",
    suite: { kem: "X25519", kdf: "HKDF-SHA256", aead: "AES-256-GCM" },
    recipient: "issuer#kem-2025",
    encapsulated: { classical: "x" },
    ciphertext: "y",
    auth_tag: "tag",
    aad: "z",
  },
  meta: { created_at: created, nonce: "n" },
}));

mock.module("@srn/core/wasm_core", () => ({
  initWasmFromB64: async () => {},
  buildL2Envelope: wasmBuildL2,
  getPaddingTargetSize: async (s: number) => s,
  hkdfSha256: () => new Uint8Array(32),
  x25519GetPublicKey: () => new Uint8Array(32),
}));

const signMock = mock(async (payload: any) => ({
  ...payload,
  proof: {
    type: "DataIntegrityProof",
    cryptosuite: "eddsa-jcs-2022",
    created: "2025-01-01T00:00:00Z",
    proofValue: "z5J6",
  },
}));
const getPublicKeyMock = mock(() => "pub");
const registerMock = mock(async () => true);

mock.module("./signer", () => ({
  globalSigner: {
    getPublicKey: getPublicKeyMock,
    register: registerMock,
    sign: signMock,
    getIssuerDid: () => "did:key:zTest",
  },
}));

import { DataManager } from "./data";

let window: Window;
let document: Document;

beforeEach(() => {
  wasmBuildL2.mockClear();
  signMock.mockClear();
  getPublicKeyMock.mockClear();
  registerMock.mockClear();
  window = new Window({ url: "http://localhost:3000/form/1" });
  document = window.document;
  (globalThis as any).window = window;
  (globalThis as any).document = document;
  (globalThis as any).HTMLElement = window.HTMLElement;
  (globalThis as any).HTMLInputElement = window.HTMLInputElement;
  (globalThis as any).Event = window.Event;
  (globalThis as any).DOMParser = window.DOMParser;
  (globalThis as any).alert = mock(() => {});
  
  const store = new Map();
  (globalThis as any).localStorage = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
  };
});

describe("Web/A Client Runtime > Data Manager (L2)", () => {
  test("signAndDownload uses L2 envelope when enabled", async () => {
    document.body.innerHTML = `
      <input data-json-path="answer" value="yes">
      <input id="weba-l2-encrypt" type="checkbox" checked>
    `;
    (window as any).generatedJsonStructure = { name: "TestForm" };
    (window as any).webaL2Config = {
      enabled: true,
      recipient_kid: "issuer#kem-2025",
      recipient_x25519: "pk",
      layer1_ref: "sha256:abcd",
      default_enabled: true,
    };

    const dataMgr = new DataManager();
    const downloadMock = mock(() => {});
    (dataMgr as any).downloadHtml = downloadMock;

    await dataMgr.signAndDownload();

    expect(wasmBuildL2).toHaveBeenCalled();
    const args = wasmBuildL2.mock.calls[0];
    const config = JSON.parse(args[3]); // 4th arg is config JSON
    expect(config.recipient_kid).toBe("issuer#kem-2025");
    expect(downloadMock).toHaveBeenCalled();
    const call = downloadMock.mock.calls[0];
    expect(call[0]).toBe("submit");
    expect(call[1]).toBe(true);
    expect(call[2].l2Envelope).toBeTruthy();
    expect(call[2].stripPlaintext).toBe(true);
  });

  test("signAndDownload falls back to signature when L2 disabled", async () => {
    document.body.innerHTML = `<input data-json-path="answer" value="yes">`;
    (window as any).generatedJsonStructure = { name: "TestForm" };
    (window as any).webaL2Config = { enabled: false };

    const dataMgr = new DataManager();
    const downloadMock = mock(() => {});
    (dataMgr as any).downloadHtml = downloadMock;

    await dataMgr.signAndDownload();

    expect(wasmBuildL2).not.toHaveBeenCalled();
    expect(signMock).toHaveBeenCalled();
    const call = downloadMock.mock.calls[0];
    expect(call[0]).toBe("submitted");
    expect(call[1]).toBe(true);
    expect(call[2].embeddedVc).toBeTruthy();
  });

  test("signAndDownload alerts when L2 config is missing", async () => {
    document.body.innerHTML = `
      <input data-json-path="answer" value="yes">
      <input id="weba-l2-encrypt" type="checkbox" checked>
    `;
    (window as any).generatedJsonStructure = { name: "TestForm" };
    (window as any).webaL2Config = {
      enabled: true,
      recipient_kid: "",
      recipient_x25519: "",
      layer1_ref: "",
    };

    const dataMgr = new DataManager();
    const downloadMock = mock(() => {});
    (dataMgr as any).downloadHtml = downloadMock;

    const alertMock = (globalThis as any).alert as ReturnType<typeof mock>;
    await dataMgr.signAndDownload();

    expect(alertMock).toHaveBeenCalled();
    expect(wasmBuildL2).not.toHaveBeenCalled();
    expect(downloadMock).not.toHaveBeenCalled();
  });
});
