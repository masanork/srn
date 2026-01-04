import { expect, test, beforeAll } from "bun:test";
import { createMDoc, initWasm, p256GenerateKeyPair, MDocKeys } from "../packages/core/src/index";
import { bytesToHex } from "../packages/core/src/encoding";
import { decode } from 'cbor-x';

beforeAll(async () => {
    await initWasm();
});

test("createMDoc generates valid ISO 18013-5 structure with P-256", async () => {
    // 1. Setup Keys
    const issuerKey = p256GenerateKeyPair();
    const deviceKey = p256GenerateKeyPair();

    const issuerKeys: MDocKeys = {
        p256: {
            privateKey: bytesToHex(issuerKey.privateKey),
            publicKey: bytesToHex(issuerKey.publicKey)
        }
    };

    const deviceKeyHex = bytesToHex(deviceKey.publicKey);

    // 2. Create mDoc
    // Claims are passed as a flat object, helper puts them in namespace
    const claims = {
        "given_name": "Taro",
        "family_name": "Yamada",
        "birth_date": "1980-01-01"
    };

    const result = await createMDoc(
        claims,
        issuerKeys,
        deviceKeyHex
    );

    expect(result.mdoc).toBeDefined();
    expect(result.b64url).toBeDefined();

    const decoded = decode(result.mdoc);

    expect(decoded.docType).toBe("org.iso.18013.5.1.mDL");
    expect(decoded.issuerSigned).toBeDefined();
    expect(decoded.issuerSigned.issuerAuth).toBeDefined();

    // COSE_Sign1: [protected, unprotected, payload, signature]
    const issuerAuth = decoded.issuerSigned.issuerAuth;
    expect(issuerAuth.length).toBe(4);

    // Access MSO from payload of issuerAuth (index 2)
    const msoBytes = issuerAuth[2];
    const mso = decode(msoBytes);

    expect(mso.docType).toBe("org.iso.18013.5.1.mDL");
    expect(mso.deviceKeyInfo).toBeDefined();
    expect(mso.digestAlgorithm).toBe("SHA-256");

    // Check digests exist for namespace
    const ns = "org.iso.18013.5.1";
    expect(mso.valueDigests[ns]).toBeDefined();

    // Check that items are in issuerSigned.nameSpaces
    const nsItems = decoded.issuerSigned.nameSpaces[ns];
    expect(nsItems).toBeDefined();
    expect(nsItems.length).toBe(3); // 3 claims

    // Verify one item
    const firstItemBytes = nsItems[0];
    const firstItem = decode(firstItemBytes);
    expect(firstItem.digestID).toBeDefined();
    expect(firstItem.elementIdentifier).toBeDefined();

    // Verify digest mapping match (simple check)
    const digestInMso = mso.valueDigests[ns][firstItem.digestID];
    expect(digestInMso).toBeDefined();
});
