import { expect, test, describe, beforeAll } from "bun:test";
import {
    generateHybridKeys,
    createHybridVC,
    verifyHybridVC,
    createStatusListVC,
    createCoseVC,
    createSdCoseVC
} from '@srn/core';
import { decode, encode } from "cbor-x";
import { initWasm, ed25519Verify, mlDsa44Verify } from '@srn/core';

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

    describe("Classic Keys (Default - No PQC)", () => {
        let keys: any;

        beforeAll(async () => {
            await initWasm();
            keys = await generateHybridKeys(); // Default: Opt-out
        });

        test("should return valid hex strings for Ed25519 only", () => {
            expect(keys.ed25519.publicKey).toMatch(/^[0-9a-f]{64}$/);
            expect(keys.ed25519.privateKey).toMatch(/^[0-9a-f]{64}$/);
            expect(keys.pqc).toBeUndefined();
        });

        test("Classic VC: Create and Verify (Single Proof)", async () => {
            const doc = { credentialSubject: { id: "did:example:classic", name: "Classic User" } };
            const vc: any = await createHybridVC(doc, keys);

            expect(vc.issuer).toContain("did:key:");
            expect(vc.proof).toHaveLength(1); // Only Ed25519

            const result = await verifyHybridVC(vc);
            expect(result.isValid).toBe(true); // Should be true (implicit checks for available keys)
            expect(result.checks.ed25519).toBe(true);
            expect(result.checks.pqc).toBe(false);
        });
    });

    describe("Hybrid Keys (Opt-in PQC)", () => {
        let keys: any;

        beforeAll(async () => {
            await initWasm();
            keys = await generateHybridKeys(true); // Explicit Opt-in
        });

        test("should return valid keys for Ed25519 and PQC", () => {
            expect(keys.ed25519.publicKey).toMatch(/^[0-9a-f]{64}$/);
            expect(keys.pqc).toBeDefined();
            // ML-DSA-44 public key is 1312 bytes (2624 hex chars)
            expect(keys.pqc.publicKey.length).toBeGreaterThan(1000);
            expect(keys.pqc.privateKey.length).toBeGreaterThan(2000);
        });

        test("Hybrid VC: Create and Verify (Dual Proof)", async () => {
            const doc = { credentialSubject: { id: "did:example:hybrid", name: "Hybrid User" } };
            const vc: any = await createHybridVC(doc, keys);

            expect(vc.proof).toHaveLength(2); // Ed25519 + ML-DSA

            const result = await verifyHybridVC(vc);
            expect(result.isValid).toBe(true);
            expect(result.checks.ed25519).toBe(true);
            expect(result.checks.pqc).toBe(true);
        });

        test("Status List VC: Create", async () => {
            const revokedIds = ["build-a", "build-b"];
            const statusList: any = await createStatusListVC(revokedIds, keys, "https://example.com/status.json");
            const result = await verifyHybridVC(statusList);
            expect(result.isValid).toBe(true);
        });

        test("Binary COSE VC: Create and check PQC signature", async () => {
            const doc = { test: "data" };
            const result = await createCoseVC(doc, keys, "did:web:example.com");

            const decoded = decode(result.cbor) as any[];
            expect(decoded).toHaveLength(4);
            const signatures = decoded[3] as any[];
            expect(signatures).toHaveLength(2); // Ed + PQC

            const bodyProtected = decoded[0] as Uint8Array;

            // Ed Check (index 0)
            const edSignature = signatures[0];
            const edHeader = decodeHeader(edSignature[0]);
            const edSigStructure = buildSigStructure(bodyProtected, edSignature[0], decoded[2]);
            const edVerify = ed25519Verify(
                Uint8Array.from(Buffer.from(keys.ed25519.publicKey, 'hex')),
                edSigStructure,
                edSignature[2]
            );
            expect(getHeaderValue(edHeader, COSE_HEADER_ALG)).toBe(-8);
            expect(edVerify).toBe(true);

            // PQC Check (index 1)
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

        test("SD-COSE VC: Create and check disclosures (Hybrid)", async () => {
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
        });
    });
});
