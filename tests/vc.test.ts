import { expect, test, describe } from "bun:test";
import {
    generateHybridKeys,
    createHybridVC,
    verifyHybridVC,
    createStatusListVC,
    createCoseVC,
    createSdCoseVC
} from "../src/core/vc.ts";
import { decode } from "cbor-x";

describe("VC & Signing Tests", () => {
    const keys = generateHybridKeys();

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

        // Basic CBOR structure check [protected, unprotected, payload, signature]
        const decoded = decode(result.cbor);
        expect(Array.isArray(decoded)).toBe(true);
        expect(decoded).toHaveLength(4);

        const payload = decode(decoded[2]);
        expect(payload.test).toBe("data");
        expect(payload.iss).toBe("did:web:example.com");
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

        const decoded = decode(result.cbor);
        const payload = decode(decoded[2]);

        // Check that members are replaced by hashes
        expect(payload.credentialSubject).toBeUndefined(); // In our implementation we put everything at root or under keys
        expect(payload["srn:sd_members"]).toHaveLength(2);

        // Verify at least one disclosure is valid CBOR
        const firstDisclosure = decode(Buffer.from(result.disclosures[0]!, 'base64url'));
        expect(Array.isArray(firstDisclosure)).toBe(true);
    });
});
