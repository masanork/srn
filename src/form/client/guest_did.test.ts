
import { describe, expect, test, mock, beforeEach, beforeAll } from "bun:test";
import { getOrCreateGuestDid, fetchGuestInbox } from "./guest_did";

// Mock L2 Crypto (to avoid WASM loading issues)
mock.module("../../core/l2crypto", () => ({
    generateRecipientKeyPair: async () => ({
        publicKey: new Uint8Array(32),
        privateKey: new Uint8Array(32)
    }),
    toBase64Url: (arr: Uint8Array) => "base64url",
    fromBase64Url: (s: string) => new Uint8Array(32),
    x25519GenerateKeyPair: async () => ({
        publicKey: new Uint8Array(32),
        privateKey: new Uint8Array(32)
    })
}));

mock.module("../../core/wasm_core", () => ({
    initWasm: async () => { }
}));

// Mock globals
const localStorageMock = new Map<string, string>();
global.localStorage = {
    getItem: (key: string) => localStorageMock.get(key) || null,
    setItem: (key: string, value: string) => localStorageMock.set(key, value),
    removeItem: (key: string) => localStorageMock.delete(key),
    clear: () => localStorageMock.clear(),
    key: (index: number) => Array.from(localStorageMock.keys())[index],
    get length() { return localStorageMock.size; }
} as any;

// Mock Navigator
global.navigator = {
    credentials: {
        create: mock(async () => ({
            id: "mock-credential-id",
            response: {
                getPublicKey: () => new Uint8Array(96).buffer, // Dummy key
                clientDataJSON: new ArrayBuffer(0),
                attestationObject: new ArrayBuffer(0)
            }
        })),
        get: mock(async () => ({
            response: {
                signature: new ArrayBuffer(0),
                authenticatorData: new ArrayBuffer(0),
                clientDataJSON: new ArrayBuffer(0)
            }
        }))
    }
} as any;

// Mock Window properties
(global as any).window = global;
(global as any).PublicKeyCredential = class { };
(global as any).location = { hostname: "localhost" };
// (global as any).btoa mock removed to use environment implementation

// Mock fetch
const fetchMock = mock(async (url, options) => {
    // console.log("Fetch called", url);
    return {
        json: async () => ({
            data: {
                createGuestDid: {
                    did: "did:web:srn.example:guest:test",
                    expiresAt: "2025-01-01T00:00:00Z"
                },
                getChallenge: {
                    nonce: "mock-nonce"
                },
                guestInbox: []
            }
        })
    };
});
global.fetch = fetchMock as any;

describe("Guest DID Client", () => {
    beforeEach(() => {
        localStorageMock.clear();
        fetchMock.mockClear();
    });

    test("should create new guest DID", async () => {
        const result = await getOrCreateGuestDid(true);
        expect(result.did).toBe("did:web:srn.example:guest:test");
        expect(result.isReused).toBe(false);
        expect(fetchMock).toHaveBeenCalled();

        // Assert storage
        expect(localStorageMock.get("guest-did:did:web:srn.example:guest:test")).toBe("mock-credential-id");
        expect(localStorageMock.get("guest-did:did:web:srn.example:guest:test:privateKey")).toBe("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    });

    test("should reuse existing guest DID", async () => {
        // Setup existing
        localStorageMock.set("guest-did:old", "cred-id");

        const result = await getOrCreateGuestDid();
        expect(result.did).toBe("old");
        expect(result.isReused).toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test("should fetch inbox", async () => {
        localStorageMock.set("guest-did:test", "cred-id");
        const msgs = await fetchGuestInbox("test");
        expect(msgs).toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(3); // WASM fetch + Challenge + GuestInbox
    });
});
