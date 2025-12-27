import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Window } from "happy-dom";
import {
  b64urlEncode,
  buildLayer2Envelope,
  wrapRecipientPrivateKey,
} from "./l2crypto";

let shouldFailUnlock = false;
const prfKey = new Uint8Array(32).fill(7);

import { initL2Viewer } from "./l2viewer";

let window: Window;
let document: Document;

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  window = new Window({ url: "http://localhost:3000/form/1" });
  document = window.document;
  (globalThis as any).window = window;
  (globalThis as any).document = document;
  (globalThis as any).HTMLElement = window.HTMLElement;
  (globalThis as any).HTMLButtonElement = window.HTMLButtonElement;
  (globalThis as any).Event = window.Event;
  (globalThis as any).btoa = window.btoa.bind(window);
  (globalThis as any).atob = window.atob.bind(window);
  if (!(globalThis as any).crypto?.subtle) {
    (globalThis as any).crypto = require("node:crypto").webcrypto;
  }
  (globalThis as any).navigator = {
    credentials: {
      get: async () => {
        if (shouldFailUnlock) throw new Error("PRF failure");
        return {
          getClientExtensionResults: () => ({
            prf: { results: { first: prfKey.buffer } },
          }),
        };
      },
    },
  };
  (globalThis as any).localStorage = localStorageMock;
  localStorageMock.clear();
});

describe("Web/A L2 viewer", () => {
  let consoleErrorMock: ReturnType<typeof mock>;
  beforeEach(() => {
    document.body.innerHTML = "";
    shouldFailUnlock = false;
    consoleErrorMock = mock(() => {});
    console.error = consoleErrorMock;
  });

  test("renders unlock panel and decrypts on click", async () => {
    const recipientSk = new Uint8Array(32).fill(5);
    const recipientPk = await import("@noble/curves/ed25519.js").then((m) =>
      m.x25519.getPublicKey(recipientSk),
    );
    const envelope = await buildLayer2Envelope({
      layer2_plain: { foo: "bar" },
      config: {
        enabled: true,
        recipient_kid: "issuer#kem-2025",
        recipient_x25519: b64urlEncode(recipientPk),
        layer1_ref: "sha256:abcd",
      },
    });
    const wrapped = await wrapRecipientPrivateKey({
      recipientSk,
      prfKey,
    });

    document.body.innerHTML = `
      <div class="weba-form-container">
        <input data-json-path="foo" />
      </div>
      <script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script>
      <script id="weba-l2-keywrap" type="application/json">${JSON.stringify({
        alg: "WebAuthn-PRF-AESGCM-v1",
        kid: "issuer#passkey-1",
        credential_id: b64urlEncode(new Uint8Array([1, 2, 3])),
        prf_salt: "salt",
        wrapped_key: b64urlEncode(wrapped),
      })}</script>
    `;

    initL2Viewer();
    const button = document.querySelector(".weba-l2-unlock button") as HTMLButtonElement;
    expect(button).toBeTruthy();
    const outputBefore = document.querySelector(".weba-l2-unlock pre") as HTMLElement;
    expect(outputBefore.style.display).toBe("none");

    button.click();
    await new Promise((r) => setTimeout(r, 10));

    const status = document.querySelector(".weba-l2-unlock div:nth-child(2)") as HTMLElement;
    const output = document.querySelector(".weba-l2-unlock pre") as HTMLElement;
    const exportBtn = document.querySelector(".weba-l2-unlock button:nth-of-type(2)") as HTMLButtonElement;
    expect(status.textContent).toBe("Unlocked.");
    expect(output.textContent).toContain("\"foo\": \"bar\"");
    expect(exportBtn.disabled).toBe(false);
    const input = document.querySelector('input[data-json-path="foo"]') as HTMLInputElement;
    expect(input.value).toBe("bar");
  });

  test("shows error when keywrap is missing", async () => {
    document.body.innerHTML = `
      <div class="weba-form-container"></div>
      <script id="weba-l2-envelope" type="application/json">{\"layer2\":{\"encapsulated\":{\"classical\":\"\"},\"aad\":\"\"},\"layer1_ref\":\"sha256:abcd\",\"weba_version\":\"0.1\"}</script>
    `;

    initL2Viewer();
    const button = document.querySelector(".weba-l2-unlock button") as HTMLButtonElement;
    button.click();
    await new Promise((r) => setTimeout(r, 0));

    const status = document.querySelector(".weba-l2-unlock div:nth-child(2)") as HTMLElement;
    expect(status.textContent).toBe("Key wrap package not found.");
  });

  test("shows error when unlock fails", async () => {
    shouldFailUnlock = true;

    const recipientSk = new Uint8Array(32).fill(5);
    const recipientPk = await import("@noble/curves/ed25519.js").then((m) =>
      m.x25519.getPublicKey(recipientSk),
    );
    const envelope = await buildLayer2Envelope({
      layer2_plain: { foo: "bar" },
      config: {
        enabled: true,
        recipient_kid: "issuer#kem-2025",
        recipient_x25519: b64urlEncode(recipientPk),
        layer1_ref: "sha256:abcd",
      },
    });
    const wrapped = await wrapRecipientPrivateKey({
      recipientSk,
      prfKey,
    });
    document.body.innerHTML = `
      <div class="weba-form-container"></div>
      <script id="weba-l2-envelope" type="application/json">${JSON.stringify(envelope)}</script>
      <script id="weba-l2-keywrap" type="application/json">${JSON.stringify({
        alg: "WebAuthn-PRF-AESGCM-v1",
        kid: "issuer#passkey-1",
        credential_id: "cred",
        prf_salt: "salt",
        wrapped_key: b64urlEncode(wrapped),
      })}</script>
    `;

    initL2Viewer();
    const button = document.querySelector(".weba-l2-unlock button") as HTMLButtonElement;
    button.click();
    await new Promise((r) => setTimeout(r, 0));

    const status = document.querySelector(".weba-l2-unlock div:nth-child(2)") as HTMLElement;
    expect(status.textContent).toBe("Unlock failed.");
    expect(button.disabled).toBe(false);
    shouldFailUnlock = false;
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
