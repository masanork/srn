import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Window } from "happy-dom";
import { b64urlEncode } from "./l2crypto";

mock.module("./webauthn", () => ({
  derivePasskeyPrf: async () => new Uint8Array(32).fill(9),
}));

import { initKeywrapTool } from "./keywrap_tool";

let window: Window;
let document: Document;

beforeEach(() => {
  window = new Window({ url: "http://localhost:3000/form/1" });
  document = window.document;
  (globalThis as any).window = window;
  (globalThis as any).document = document;
  (globalThis as any).HTMLElement = window.HTMLElement;
  (globalThis as any).HTMLInputElement = window.HTMLInputElement;
  (globalThis as any).HTMLButtonElement = window.HTMLButtonElement;
  (globalThis as any).Event = window.Event;
  (globalThis as any).btoa = window.btoa.bind(window);
  (globalThis as any).atob = window.atob.bind(window);
  if (!(globalThis as any).crypto?.subtle) {
    (globalThis as any).crypto = require("node:crypto").webcrypto;
  }
});

describe("Web/A L2 keywrap tool", () => {
  let consoleErrorMock: ReturnType<typeof mock>;
  beforeEach(() => {
    consoleErrorMock = mock(() => {});
    console.error = consoleErrorMock;
  });
  test("generates salt and builds keywrap JSON", async () => {
    document.body.innerHTML = `
      <div id="weba-l2-keywrap-tool">
        <input id="kwp-recipient-sk" />
        <input id="kwp-credential-id" />
        <input id="kwp-prf-salt" />
        <input id="kwp-aad" />
        <input id="kwp-kid" />
        <button id="kwp-generate-salt"></button>
        <button id="kwp-wrap"></button>
        <div id="kwp-status"></div>
        <pre id="kwp-output"></pre>
      </div>
    `;

    initKeywrapTool();
    const recipientSk = new Uint8Array(32);
    crypto.getRandomValues(recipientSk);

    (document.getElementById("kwp-recipient-sk") as HTMLInputElement).value =
      b64urlEncode(recipientSk);
    (document.getElementById("kwp-credential-id") as HTMLInputElement).value =
      "cred";
    (document.getElementById("kwp-kid") as HTMLInputElement).value =
      "issuer#passkey-1";

    const genSaltBtn = document.getElementById("kwp-generate-salt") as HTMLButtonElement;
    genSaltBtn.click();
    const saltVal = (document.getElementById("kwp-prf-salt") as HTMLInputElement).value;
    expect(saltVal.length).toBeGreaterThan(0);

    const wrapBtn = document.getElementById("kwp-wrap") as HTMLButtonElement;
    wrapBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    const output = document.getElementById("kwp-output") as HTMLPreElement;
    const parsed = JSON.parse(output.textContent || "{}");
    expect(parsed.alg).toBe("WebAuthn-PRF-AESGCM-v1");
    expect(parsed.credential_id).toBe("cred");
    expect(parsed.wrapped_key).toBeTruthy();
  });

  test("shows error when required fields are missing", async () => {
    document.body.innerHTML = `
      <div id="weba-l2-keywrap-tool">
        <input id="kwp-recipient-sk" />
        <input id="kwp-credential-id" />
        <input id="kwp-prf-salt" />
        <button id="kwp-wrap"></button>
        <div id="kwp-status"></div>
        <pre id="kwp-output"></pre>
      </div>
    `;

    initKeywrapTool();
    const wrapBtn = document.getElementById("kwp-wrap") as HTMLButtonElement;
    wrapBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    const status = document.getElementById("kwp-status") as HTMLElement;
    expect(status.textContent).toBe("Key wrap failed.");
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
