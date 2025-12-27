import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Window } from "happy-dom";

const buildLayer2Envelope = mock(async () => ({
  weba_version: "0.1",
  layer1_ref: "sha256:abcd",
  layer2: {
    enc: "HPKE-v1",
    suite: { kem: "X25519", kdf: "HKDF-SHA256", aead: "AES-256-GCM" },
    recipient: "issuer#kem-2025",
    encapsulated: { classical: "x" },
    ciphertext: "y",
    aad: "z",
  },
  meta: { created_at: "2025-12-27T00:00:00Z", nonce: "n" },
}));

mock.module("./l2crypto", () => ({
  buildLayer2Envelope,
}));

const signMock = mock(async (payload: any) => ({
  ...payload,
  proof: { type: "Ed25519Signature2020" },
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
  buildLayer2Envelope.mockClear();
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

    expect(buildLayer2Envelope).toHaveBeenCalled();
    const args = buildLayer2Envelope.mock.calls[0][0];
    expect(args.config.recipient_kid).toBe("issuer#kem-2025");
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

    expect(buildLayer2Envelope).not.toHaveBeenCalled();
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
    expect(buildLayer2Envelope).not.toHaveBeenCalled();
    expect(downloadMock).not.toHaveBeenCalled();
  });
});
