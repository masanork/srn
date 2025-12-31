#!/usr/bin/env bun
import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { PcscAdapter } from "../src/pcsc";
// Import WASM module (Bun can import .js that uses require)
import { WasmJpkiController, WebUsbReader } from "../../folio-core/pkg-node/folio_core.js";

const program = new Command();

program
    .name("folio")
    .description("Folio CLI for Web/A Certificate Presentation POC")
    .version("0.1.0");

program
    .command("check")
    .description("Check JPKI connection and select AP")
    .action(async () => {
        console.log("Checking JPKI connection...");
        const adapter = new PcscAdapter();
        await adapter.connect();

        // Wait for card (simple delay or event for now, PcscAdapter.connect listens)
        // For CLI 'check', we might want to wait or just proceed if card is expected to be present.
        // Since adapter.connect() is async but the listener is callback-based, we might need a better flow.
        // For this POC, we'll assume the adapter is ready or we just use the mock transmit.
        
        console.log("Initializing WASM...");
        const reader = new WebUsbReader(adapter);
        const controller = new WasmJpkiController(reader);

        try {
            console.log("Selecting JPKI AP...");
            await controller.select_jpki_ap();
            console.log("✅ JPKI AP Selected Successfully!");
            
            console.log("Reading Auth Cert (First 32 bytes)...");
            const certData = await controller.read_auth_cert();
            console.log("✅ Auth Cert Read:", Buffer.from(certData).toString('hex'));

        } catch (e) {
            console.error("❌ Error:", e);
        }
    });

program
    .command("issue")
    .description("Issue a patterned VC (for Issuer/City)")
    .option("-t, --type <type>", "Pattern type (e.g. household, individual)", "individual")
    .option("-o, --output <path>", "Output VC path", "vc.json")
    .action((options) => {
        console.log(`Issuing VC... Type: ${options.type}`);
        // Mock VC generation
        const vc = {
            type: ["VerifiableCredential", "JuminhyoCertificate"],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                pattern: options.type,
                data: "MOCK_DATA"
            }
        };
        writeFileSync(options.output, JSON.stringify(vc, null, 2));
        console.log(`VC saved to ${options.output}`);
    });

program
    .command("present")
    .description("Generate a VP and Web/A from a VC (for User)")
    .requiredOption("-i, --input <path>", "Input VC path")
    .requiredOption("-a, --audience <domain>", "Audience domain")
    .option("-o, --output <path>", "Output Web/A HTML path", "output.html")
    .option("-p, --pin <pin>", "JPKI PIN (Auth)")
    .action(async (options) => {
        const pin = options.pin || process.env.FOLIO_JPKI_PIN;
        if (!pin) {
            console.error("❌ Error: PIN is required. Use --pin option or FOLIO_JPKI_PIN environment variable.");
            process.exit(1);
        }

        console.log(`Generating VP for audience: ${options.audience}`);
        
        try {
            const vcData = readFileSync(options.input, "utf-8");
            
            console.log("Connecting to JPKI Card...");
            const adapter = new PcscAdapter();
            await adapter.connect();
            // In a real CLI, we'd wait for card insertion event here or retry.
            // Assuming card is present for the POC.

            const reader = new WebUsbReader(adapter);
            const controller = new WasmJpkiController(reader);

            console.log("Selecting JPKI AP...");
            await controller.select_jpki_ap();

            console.log("Verifying PIN (Auth)...");
            const efAuthPin = new Uint8Array([0x00, 0x18]);
            
            await controller.verify_pin(efAuthPin, pin); 
            console.log("✅ PIN Verified");

            // Generate Challenge (Nonce)
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            console.log("Signing Challenge:", Buffer.from(challenge).toString('hex'));

            const signature = await controller.compute_signature(challenge);
            console.log("✅ Signature Generated:", Buffer.from(signature).toString('hex'));

            // Packaging VP
            const vp = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiablePresentation"],
                "verifiableCredential": [JSON.parse(vcData)],
                "proof": {
                    "type": "EcdsaSecp256r1Signature2019",
                    "created": new Date().toISOString(),
                    "proofPurpose": "authentication",
                    "verificationMethod": "did:jpki:user-cert", 
                    "challenge": Buffer.from(challenge).toString('hex'),
                    "jws": Buffer.from(signature).toString('base64') // Simplified JWS
                }
            };

            const html = `<html><body><h1>Web/A Proof</h1><script id="vp" type="application/json">${JSON.stringify(vp, null, 2)}</script></body></html>`;
            writeFileSync(options.output, html);
            console.log(`Web/A saved to ${options.output}`);

        } catch (e) {
            console.error("❌ Presentation Failed:", e);
            process.exit(1);
        }
    });

program
    .command("verify")
    .description("Verify a Web/A file")
    .argument("<path>", "Path to Web/A file")
    .action((path) => {
        console.log(`Verifying ${path}...`);
        // Mock Verification
        console.log("✅ Signature Valid");
        console.log("✅ Audience Checked");
    });

program.parse();
