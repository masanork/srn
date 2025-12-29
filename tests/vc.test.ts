import { expect, test, describe, beforeAll } from "bun:test";
import {
    generateHybridKeys,
    createHybridVC,
    verifyHybridVC,
    createStatusListVC,
    createCoseVC,
    createSdCoseVC
} from "../src/core/vc.ts";
import { decode, encode } from "cbor-x";
import { initWasm, ed25519Verify, mlDsa44Verify } from "../src/core/wasm_core.ts";

const COSE_HEADER_ALG = 1;
const COSE_HEADER_KID = 4;

const textDecoder = new TextDecoder();

const decodeHeader = (value: unknown) => {
    const decoded = decode(value as Uint8Array);
    if (decoded instanceof Map) return decoded;
    return new Map(Object.entries(decoded as Record<string, unknown>));
};

const getHeaderValue = (header: Map<unknown, unknown>, key: number | string) => {
    if (header.has(key)) return header.get(key);
    return header.get(String(key));
};

const buildSigStructure = (
    bodyProtected: Uint8Array,
    signatureProtected: Uint8Array,
    payload: Uint8Array
) => encode(["Signature", bodyProtected, signatureProtected, new Uint8Array(0), payload]);

describe("VC & Signing Tests", () => {
    let keys: any;

    beforeAll(async () => {
        await initWasm();
        keys = await generateHybridKeys();
    });

    test("generateHybridKeys should return valid hex strings for Ed25519 and PQC", () => {
        expect(keys.ed25519.publicKey).toMatch(/^[0-9a-f]{64}$/);
        expect(keys.ed25519.privateKey).toMatch(/^[0-9a-f]{64}$/);
        // ML-DSA-44 public key is 1312 bytes (2624 hex chars)
        // secret key is 2528 bytes (5056 hex chars)
        expect(keys.pqc.publicKey.length).toBeGreaterThan(1000);
        expect(keys.pqc.privateKey.length).toBeGreaterThan(2000);
    });

    test("Hybrid VC: Create and Verify", async () => {
        const doc = {
            credentialSubject: {
                id: "did:example:123",
                name: "Test User"
            }
        };

        const vc: any = await createHybridVC(doc, keys);

        expect(vc.issuer).toContain("did:key:");
        expect(vc.proof).toHaveLength(2);

        const result = await verifyHybridVC(vc);
        expect(result.isValid).toBe(true);
        expect(result.checks.ed25519).toBe(true);
        expect(result.checks.pqc).toBe(true);
        expect(result.decoded.credentialSubject.name).toBe("Test User");
    });

    test("Hybrid VC: Verification should fail if tampered", async () => {
        const doc = {
            credentialSubject: {
                id: "did:example:123",
                name: "Test User"
            }
        };

        const vc: any = await createHybridVC(doc, keys);

        // Tamper with data
        vc.credentialSubject.name = "Tampered User";

        const result = await verifyHybridVC(vc);
        expect(result.isValid).toBe(false);
    });

    test("Status List VC: Create", async () => {
        const revokedIds = ["build-a", "build-b"];
        const statusList: any = await createStatusListVC(revokedIds, keys, "https://example.com/status.json");

        expect(statusList.type).toContain("StatusList2021Credential");
        expect(statusList.credentialSubject["srn:revokedBuildIds"]).toEqual(revokedIds);

        const result = await verifyHybridVC(statusList);
        expect(result.isValid).toBe(true);
    });

    test("Binary COSE VC: Create and check structure", async () => {
        const doc = { test: "data" };
        const result = await createCoseVC(doc, keys, "did:web:example.com");

        expect(result.cbor).toBeInstanceOf(Uint8Array);
        expect(result.base64url).toMatch(/^[a-zA-Z0-9_-]+$/);

        // Basic CBOR structure check [protected, unprotected, payload, signatures]
        const decoded = decode(result.cbor) as any[];
        expect(Array.isArray(decoded)).toBe(true);
        expect(decoded).toHaveLength(4);

        const payload = decode(decoded[2] as Uint8Array);
        expect(payload.test).toBe("data");
        expect(payload.iss).toBe("did:web:example.com");

        const signatures = decoded[3] as any[];
        expect(signatures).toHaveLength(2);

        const bodyProtected = decoded[0] as Uint8Array;

        const edSignature = signatures[0];
        const edHeader = decodeHeader(edSignature[0]);
        const edKid = getHeaderValue(edHeader, COSE_HEADER_KID) as Uint8Array;
        const edSigStructure = buildSigStructure(bodyProtected, edSignature[0], decoded[2]);
        const edVerify = ed25519Verify(
            Uint8Array.from(Buffer.from(keys.ed25519.publicKey, 'hex')),
            edSigStructure,
            edSignature[2]
        );
        expect(getHeaderValue(edHeader, COSE_HEADER_ALG)).toBe(-8);
        expect(textDecoder.decode(edKid)).toContain("-ed25519");
        expect(edVerify).toBe(true);

        const pqcSignature = signatures[1];
        const pqcHeader = decodeHeader(pqcSignature[0]);
        const pqcKid = getHeaderValue(pqcHeader, COSE_HEADER_KID) as Uint8Array;
        const pqcSigStructure = buildSigStructure(bodyProtected, pqcSignature[0], decoded[2]);
        const pqcVerify = mlDsa44Verify(
            Uint8Array.from(Buffer.from(keys.pqc.publicKey, 'hex')),
            pqcSigStructure,
            pqcSignature[2]
        );
        expect(getHeaderValue(pqcHeader, COSE_HEADER_ALG)).toBe(-48);
        expect(textDecoder.decode(pqcKid)).toContain("-mldsa44");
        expect(pqcVerify).toBe(true);
    });

    test("SD-COSE VC: Create and check disclosures", async () => {
        const doc = {
            credentialSubject: {
                id: "did:example:user",
                member: [
                    { name: "Alice", individualNumber: "123-456" },
                    { name: "Bob" }
                ]
            }
        };

        const result = await createSdCoseVC(doc, keys, "did:web:example.com");

        expect(result.disclosures.length).toBeGreaterThan(0);

        const decoded = decode(result.cbor) as any[];
        const payload = decode(decoded[2] as Uint8Array);

        // Check that members are replaced by hashes
        expect(payload.credentialSubject).toBeUndefined(); // In our implementation we put everything at root or under keys
        expect(payload["srn:sd_members"]).toHaveLength(2);

        // Verify at least one disclosure is valid CBOR
        const firstDisclosure = decode(Buffer.from(result.disclosures[0]!, 'base64url'));
        expect(Array.isArray(firstDisclosure)).toBe(true);
    });
});
