import {
    createMDoc,
    p256GenerateKeyPair,
    bytesToHex,
    initWasm,
    createHybridVC,
    generateHybridKeys
} from './src/index';

import { decode } from 'cbor-x';

async function main() {
    await initWasm();

    console.log("=== Generating Demo Credentials ===\n");

    // 1. Define the Data (Tobari Form Output)
    const formData = {
        "form_id": "tobari-demo-001",
        "title": "Project Alpha Application",
        "applicant_name": "Masanori K.",
        "department": "R&D",
        "status": "APPROVED",
        "submitted_at": new Date().toISOString()
    };

    console.log("Input Data:", formData);
    console.log("\n---------------------------------------------------\n");

    // ==========================================
    // 2. JSON Format (Verifiable Credential)
    // ==========================================

    // Setup Keys for JSON VC (Ed25519 is standard for W3C VCs usually, but we can usage what we have)
    const jsonKeys = await generateHybridKeys(); // Ed25519 (+ PQC option)

    // Create VC
    const vc = await createHybridVC(
        {
            credentialSubject: {
                id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
                ...formData
            }
        },
        jsonKeys,
        undefined // Auto-generate issuer DID from key
    );

    const jsonString = JSON.stringify(vc, null, 2);
    console.log(`[JSON Format: W3C Verifiable Credential]`);
    console.log(`Size: ${jsonString.length} bytes`);
    console.log("Content snippet (first 300 chars):");
    console.log(jsonString.substring(0, 300) + "...\n");

    // ==========================================
    // 3. mDoc Format (ISO/IEC 18013-5)
    // ==========================================

    // Setup Keys for mDoc (P-256 for Issuer and Device is typical)
    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair(); // Holder's Passkey

    const issuerKeys = {
        p256: {
            privateKey: bytesToHex(issuerKeyPair.privateKey),
            publicKey: bytesToHex(issuerKeyPair.publicKey)
        }
    };
    const deviceKeyHex = bytesToHex(deviceKeyPair.publicKey);

    // Create mDoc
    // DocType: io.github.masanork.tobari.credential.generic
    // Namespace: io.github.masanork.tobari.schema.v1
    const { mdoc, b64url } = await createMDoc(
        formData,
        issuerKeys,
        deviceKeyHex,
        "io.github.masanork.tobari.credential.generic",
        "io.github.masanork.tobari.schema.v1"
    );

    console.log(`[mDoc Format: ISO/IEC 18013-5 (CBOR)]`);
    console.log(`Size (Binary): ${mdoc.length} bytes`);
    console.log(`Size (Base64URL): ${b64url.length} bytes`);

    console.log("\nDecoded mDoc Structure (Debug View):");
    const decodedMDoc = decode(mdoc);

    // Helper to print nested maps/objects cleanly
    function inspect(obj: any, depth = 0) {
        const indent = "  ".repeat(depth);
        if (depth > 5) return indent + "...";
        if (typeof obj !== 'object' || obj === null) return String(obj);

        let lines: string[] = [];
        if (obj instanceof Map) {
            obj.forEach((v, k) => lines.push(`${indent}${k}: ${inspect(v, depth + 1)}`));
        } else if (Array.isArray(obj)) {
            lines.push(`${indent}[`);
            obj.forEach(v => lines.push(`${indent}  ${inspect(v, depth + 1)}`));
            lines.push(`${indent}]`);
        } else {
            // Check for binary mDoc artifacts and decode them if possible
            if (obj instanceof Uint8Array) {
                try {
                    // Try decoding embedded CBOR (e.g. IssuerSignedItem)
                    const inner = decode(obj);
                    return `${indent}(Embedded CBOR) \n${inspect(inner, depth + 1)}`;
                } catch {
                    return `[Bytes length=${obj.length}]`;
                }
            }

            Object.entries(obj).forEach(([k, v]) => {
                lines.push(`${indent}${k}: ${inspect(v, depth + 1)}`);
            });
        }
        return "\n" + lines.join("\n");
    }

    console.log(inspect(decodedMDoc));
    console.log("\n---------------------------------------------------");
    console.log("Comparison:");
    console.log(`JSON VC: ${jsonString.length} bytes`);
    console.log(`mDoc   : ${mdoc.length} bytes`);
    console.log(`Ratio  : ${(mdoc.length / jsonString.length * 100).toFixed(1)}% of JSON size`);

}

main().catch(console.error);
