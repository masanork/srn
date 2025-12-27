import { beforeEach, describe, expect, test } from "bun:test";
import {
  base64UrlToBuffer,
  bufferToBase64Url,
  derivePasskeyPrf,
  registerPasskey,
  signWithPasskey,
} from "./webauthn";

const ensureBase64Globals = () => {
  if (!(globalThis as any).btoa) {
    (globalThis as any).btoa = (str: string) =>
      Buffer.from(str, "binary").toString("base64");
  }
  if (!(globalThis as any).atob) {
    (globalThis as any).atob = (b64: string) =>
      Buffer.from(b64, "base64").toString("binary");
  }
};

describe("WebAuthn helpers", () => {
  beforeEach(() => {
    ensureBase64Globals();
    (globalThis as any).navigator = {
      credentials: {
        create: async () => null,
        get: async () => null,
      },
    };
  });

  test("base64url conversion roundtrip", () => {
    const bytes = new Uint8Array([1, 2, 3, 255]);
    const encoded = bufferToBase64Url(bytes.buffer);
    const roundtrip = new Uint8Array(base64UrlToBuffer(encoded));
    expect(roundtrip).toEqual(bytes);
  });

  test("registerPasskey returns minimal credential info", async () => {
    let createOptions: any = null;
    (globalThis as any).navigator.credentials.create = async (options: any) => {
      createOptions = options;
      return {
        id: "cred-1",
        rawId: new Uint8Array([7, 8, 9]).buffer,
        response: { attestationObject: new Uint8Array([1, 2]).buffer },
      };
    };

    const result = await registerPasskey("User");
    expect(result.id).toBe("cred-1");
    expect(result.rawId).toBe(bufferToBase64Url(new Uint8Array([7, 8, 9]).buffer));
    expect(createOptions.publicKey.user.name).toBe("User");
    expect(createOptions.publicKey.challenge).toBeInstanceOf(Uint8Array);
    expect(createOptions.publicKey.challenge.length).toBe(32);
  });

  test("signWithPasskey formats assertion response", async () => {
    const signature = new Uint8Array([10, 11, 12]).buffer;
    const authData = new Uint8Array([1, 2, 3]).buffer;
    const clientData = new Uint8Array([4, 5, 6]).buffer;
    (globalThis as any).navigator.credentials.get = async () => ({
      id: "cred-2",
      response: {
        signature,
        authenticatorData: authData,
        clientDataJSON: clientData,
      },
    });

    const res = await signWithPasskey("cred-2", new Uint8Array([1]).buffer);
    expect(res.id).toBe("cred-2");
    expect(base64UrlToBuffer(res.signature)).toEqual(signature);
    expect(base64UrlToBuffer(res.authenticatorData)).toEqual(authData);
    expect(base64UrlToBuffer(res.clientDataJSON)).toEqual(clientData);
  });

  test("derivePasskeyPrf returns PRF output", async () => {
    const prfOutput = new Uint8Array([9, 8, 7]).buffer;
    (globalThis as any).navigator.credentials.get = async () => ({
      getClientExtensionResults: () => ({
        prf: { results: { first: prfOutput } },
      }),
    });

    const res = await derivePasskeyPrf("cred-3", new Uint8Array([1, 2, 3]));
    expect(res).toEqual(new Uint8Array([9, 8, 7]));
  });
});
