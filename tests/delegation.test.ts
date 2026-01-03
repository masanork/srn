import { expect, test, describe } from "bun:test";
import {
    generateHybridKeys,
    createHybridVC,
    createDelegateCertificate,
    verifyDelegateChain
} from "@srn/core";
import { encodeDidKey } from "@srn/core";
import { hexToBytes } from "@srn/core";

describe("Delegation Chain Tests (PassKey Architecture)", () => {

    test("Full Chain: Root -> Delegate -> Document", async () => {
        // 1. Root Key (Simulating PassKey or Secure Root)
        const rootKeys = await generateHybridKeys(true);
        const rootDid = `did:web:example.com`;
        const rootPubHex = rootKeys.ed25519.publicKey;

        // 2. Build Key (Generated for a specific build session)
        const buildKeys = await generateHybridKeys(true);
        const buildDid = encodeDidKey(hexToBytes(buildKeys.ed25519.publicKey), 'ed25519');

        // 3. Create Delegate Certificate (Root signs Build Key)
        const delegateCert = await createDelegateCertificate(
            buildKeys,
            rootKeys,
            rootDid,
            1 // 1 day validity
        );

        // 4. Create Document VC (Build Key signs data)
        const doc = {
            credentialSubject: {
                id: "did:example:user",
                name: "Alice"
            }
        };
        const docVc = await createHybridVC(doc, buildKeys, buildDid);

        // 5. Verify Chain
        const result = await verifyDelegateChain(docVc, delegateCert, rootPubHex, rootKeys.pqc.publicKey);

        expect(result.isValid).toBe(true);
        expect(result.chain?.isAuthorized).toBe(true);
        expect(result.chain?.issuer).toBe(rootDid);
    });

    test("Chain should fail if delegate is not authorized by the correct root", async () => {
        const rootKeys = await generateHybridKeys(true);
        const buildKeys = await generateHybridKeys(true);
        const maliciousRootKeys = await generateHybridKeys(true);

        const delegateCert = await createDelegateCertificate(
            buildKeys,
            maliciousRootKeys, // Signed by wrong root
            "did:web:malicious.com",
            1
        );

        const buildDid = encodeDidKey(hexToBytes(buildKeys.ed25519.publicKey), 'ed25519');
        const docVc = await createHybridVC({ test: "data" }, buildKeys, buildDid);

        const result = await verifyDelegateChain(docVc, delegateCert, rootKeys.ed25519.publicKey);
        expect(result.isValid).toBe(false);
    });
});
