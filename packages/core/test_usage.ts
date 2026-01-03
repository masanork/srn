import { verifyWebA } from './src/verify-core';

const html = `
<!DOCTYPE html>
<html>
<head>
    <script type="application/ld+json">
    {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "WebADocument"],
        "issuer": "did:web:example.com",
        "issuanceDate": "2026-01-01T00:00:00Z",
        "credentialSubject": {
            "id": "did:web:example.com",
            "name": "Test Document"
        },
        "proof": {
            "type": "Ed25519Signature2018",
            "created": "2026-01-01T00:00:00Z",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:web:example.com#key-1",
            "jws": "eyJ..."
        }
    }
    </script>
</head>
<body>
    <h1>Test Document</h1>
</body>
</html>
`;

async function run() {
    console.log("Verifying Web/A document...");
    try {
        const result = await verifyWebA(html);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.error && result.error.includes("No valid Web/A Verifiable Credential")) {
            console.error("FAIL: VC extraction failed");
            process.exit(1);
        }
        console.log("SUCCESS: VC extracted (Signature verification result is secondary)");
    } catch (e) {
        console.error("CRITICAL ERROR:", e);
        process.exit(1);
    }
}

run();
