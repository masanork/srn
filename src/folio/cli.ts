import { program } from "commander";
import * as path from "node:path";
import * as fs from "fs-extra";

program
    .name("folio")
    .description("Web/A Folio CLI - User-centric data container toolkit")
    .version("0.1.0")
    .option("-f, --folio <dir>", "Path to the Folio directory", ".");

// Helper to resolve private key from options
async function loadPrivateKey(options: any): Promise<string> {
    let privateKeyHex = options.key;
    if (options.keyFile) {
        const keyPath = path.resolve(process.cwd(), options.keyFile);
        if (await fs.pathExists(keyPath)) {
            const keyData = await fs.readJson(keyPath);
            if (keyData.privateKey) {
                privateKeyHex = keyData.privateKey;
            } else if (keyData.privateKeyJwk) {
                // Jpki Binding might need hex, but ES256 needs JWK. 
                // Return hex if possible, otherwise empty
                privateKeyHex = ""; 
            } else {
                throw new Error("Key file does not contain 'privateKey' field.");
            }
        } else {
            throw new Error(`Key file not found: ${keyPath}`);
        }
    }

    if (!privateKeyHex && !options.key && !options.keyFile) {
        throw new Error("Either --key or --key-file must be provided.");
    }
    return privateKeyHex || "";
}

// Helper to load full key object
async function loadKeyData(options: any): Promise<any> {
    if (options.keyFile) {
        const keyPath = path.resolve(process.cwd(), options.keyFile);
        if (await fs.pathExists(keyPath)) {
            return await fs.readJson(keyPath);
        }
    }
    const hex = options.key;
    if (hex) {
        return { privateKey: hex, publicKey: "", algorithm: "Ed25519" };
    }
    throw new Error("Either --key or --key-file must be provided.");
}

// --- Form Operations ---
import { WebAParser } from "./core/parser";

const form = program.command("form").description("Form operations (parse, fill, validate)");

form
    .command("parse <file>")
    .description("Parse a Web/A form and output its schema")
    .action(async (file) => {
        const fullPath = path.resolve(process.cwd(), file);
        if (!await fs.pathExists(fullPath)) {
            console.error(`Error: File not found: ${fullPath}`);
            process.exit(1);
        }

        const content = await fs.readFile(fullPath, "utf-8");
        const schema = WebAParser.parse(content);
        
        console.log(`Form: ${schema.title} (ID: ${schema.form || 'N/A'}, Version: ${schema.version || '1.0'})`);
        console.log("-".repeat(40));
        for (const field of schema.fields) {
            console.log(`${field.id.padEnd(20)} | Type: ${field.type.padEnd(10)} | Label: ${field.label || '(None)'}`);
        }
    });

form
    .command("fill <file>")
    .description("Fill a Web/A form using the current profile")
    .option("-p, --profile <path>", "Path to profile.json", "profile.json")
    .option("-o, --output <path>", "Output filled form path", "filled.md")
    .action(async (file, options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const formPath = path.resolve(process.cwd(), file);
        const profilePath = path.resolve(folioDir, options.profile);

        if (!await fs.pathExists(formPath)) {
            console.error(`Error: Form file not found: ${formPath}`);
            process.exit(1);
        }

        let profileData = {};
        if (await fs.pathExists(profilePath)) {
            profileData = await fs.readJson(profilePath);
        } else {
            console.warn(`Warning: Profile not found at ${profilePath}. Using empty data.`);
        }

        const content = await fs.readFile(formPath, "utf-8");
        const filled = WebAParser.fill(content, profileData);
        
        const outPath = path.resolve(process.cwd(), options.output);
        await fs.writeFile(outPath, filled);
        console.log(`✅ Form filled and saved to ${outPath}`);
    });

// --- Transport & Discovery ---
import { resolveTransport } from "./transport";

const transport = program.command("transport").description("Transport and DID operations");

transport
    .command("resolve <did>")
    .description("Resolve a DID and show Web/A transport capabilities")
    .action(async (did) => {
        try {
            const result = await resolveTransport(did);
            console.log(JSON.stringify(result, null, 2));
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

import { sendMessage } from "./send";

transport
    .command("send")
    .description("Send an encrypted message to a DID")
    .requiredOption("--did <did>", "Recipient DID")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--sender <did>", "Your DID")
    .option("--key <hex>", "Your Private Key (Hex)")
    .option("--key-file <path>", "Path to private key file")
    .option("--remote <url>", "API URL")
    .option("--vc <path>", "Path to VC file(s) (can be specified multiple times)", (val, memo) => { memo.push(val); return memo; }, [] as string[])
    .action(async (options) => {
        try {
            const privateKeyHex = await loadPrivateKey(options);

            const vcsData: any[] = [];
            for (const vcPathStr of (options.vc || [])) {
                const vcPath = path.resolve(process.cwd(), vcPathStr);
                if (await fs.pathExists(vcPath)) {
                    vcsData.push(await fs.readJson(vcPath));
                } else {
                    console.warn(`Warning: VC file not found at ${vcPath}`);
                }
            }

            await sendMessage({
                did: options.did,
                message: options.message,
                senderDid: options.sender,
                privateKeyHex: privateKeyHex,
                remote: options.remote,
                vcs: vcsData
            });
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

import { delegateCapability } from "./admin";

transport
    .command("delegate")
    .description("Delegate capabilities to another DID")
    .requiredOption("--to <did>", "DID of the delegate")
    .option("--scope <scope>", "Access scope (e.g. post)", "post")
    .option("--key-file <path>", "Path to your Private Key file")
    .option("--key <hex>", "Your Private Key (Hex)")
    .option("--out <path>", "Output file for the delegation VC", "delegation.json")
    .action(async (options) => {
        try {
            const myKeyData = await loadKeyData(options);

            // Handle hybrid vs classic
            let finalKeys: any;
            if (myKeyData.ed25519 && myKeyData.pqc) {
                finalKeys = myKeyData;
            } else {
                finalKeys = {
                    ed25519: { privateKey: myKeyData.privateKey, publicKey: myKeyData.publicKey },
                    pqc: null
                };
            }

            const myDid = myKeyData.did || (options.key ? "did:key:..." : "unknown");

            const vc = await delegateCapability(finalKeys, myDid, options.to, options.scope);

            const outPath = path.resolve(process.cwd(), options.out);
            await fs.writeJson(outPath, vc, { spaces: 2 });
            console.log(`✅ Capability delegated to ${options.to} and saved to ${outPath}`);
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

import { buildThreadTree, printThreadTree } from "./thread";

transport
    .command("show-thread [thread_id]")
    .description("Visualize message threads in the Folio")
    .action(async (threadId, options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const historyDir = path.join(folioDir, "history");

        if (!(await fs.pathExists(historyDir))) {
            console.error(`Error: History directory not found at ${historyDir}`);
            process.exit(1);
        }

        try {
            const roots = await buildThreadTree(historyDir);
            if (threadId) {
                const target = roots.find(r => r.id === threadId || r.meta.thread_id === threadId);
                if (target) {
                    printThreadTree([target]);
                } else {
                    console.log(`Thread ${threadId} not found.`);
                }
            } else {
                console.log("Full Thread History:");
                printThreadTree(roots);
            }
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
        }
    });

import { syncFolio } from "./sync";

program
    .command("sync")
    .description("Synchronize remote Inbox with local history")
    .option("--remote <url>", "Remote Inbox GraphQL URL")
    .option("--did <did>", "Your DID for authentication")
    .option("--key <hex>", "Private key for signing")
    .option("--key-file <path>", "Path to private key file")
    .option("--mode <mode>", "Sync mode: inbox, outbox, or full", "inbox")
    .action(async (options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const remoteUrl = options.remote;
        const did = options.did;
        const mode = options.mode;

        if (!remoteUrl || !did) {
            console.error("Error: --remote and --did are required for sync.");
            process.exit(1);
        }

        try {
            const privateKey = await loadPrivateKey(options);
            await syncFolio({ folioDir, remoteUrl, did, privateKey, mode });
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

// --- Admin Operations ---
import { addUser, issueAccessPass } from "./admin";

const admin = program.command("admin").description("Administrative operations");

admin
    .command("add-user")
    .description("Add a user to the allowlist (Admin only)")
    .requiredOption("--new-did <did>", "DID of the user to add")
    .option("--role <role>", "Role [user, admin]", "user")
    .requiredOption("--remote <url>", "Remote API URL")
    .requiredOption("--admin-did <did>", "Your Admin DID")
    .option("--key <hex>", "Admin Private Key (Hex)")
    .option("--key-file <path>", "Path to Admin Private Key file")
    .action(async (options) => {
        try {
            const adminKey = await loadPrivateKey(options);

            await addUser({
                remoteUrl: options.remote,
                adminDid: options.adminDid,
                adminKey: adminKey
            }, options.newDid, options.role);

        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

admin
    .command("issue-pass")
    .description("Issue an Access Pass VC to a user")
    .requiredOption("--user-did <did>", "DID of the user to grant access")
    .option("--scope <scope>", "Access scope (e.g. post, admin)", "post")
    .requiredOption("--admin-did <did>", "Your Admin DID (Issuer)")
    .option("--key-file <path>", "Path to your Admin Private Key file (Hybrid supported)")
    .option("--key <hex>", "Admin Private Key (Hex, Ed25519 only)")
    .option("--out <path>", "Output file for the VC", "access-pass.json")
    .action(async (options) => {
        try {
            const adminKeyData = await loadKeyData(options);

            // Check if it's hybrid or classic
            let finalKeys: any;
            if (adminKeyData.ed25519 && adminKeyData.pqc) {
                finalKeys = adminKeyData;
            } else {
                finalKeys = {
                    ed25519: { privateKey: adminKeyData.privateKey, publicKey: adminKeyData.publicKey },
                    pqc: null
                };
            }

            const vc = await issueAccessPass(finalKeys, options.adminDid, options.userDid, options.scope);

            const outPath = path.resolve(process.cwd(), options.out);
            await fs.writeJson(outPath, vc, { spaces: 2 });
            console.log(`✅ Access Pass VC issued and saved to ${outPath}`);
            console.log(`User DID: ${options.userDid}`);
            console.log(`Scope: ${options.scope}`);
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });


import { FolioStorage } from "./core/storage";
import { FolioManager } from "./core/manager";

// --- Folio Management ---
program
    .command("init [directory]")
    .description("Initialize a new Folio directory structure")
    .action(async (directory) => {
        const folioDir = program.opts().folio;
        const targetDir = path.resolve(process.cwd(), directory || folioDir || ".");
        console.log(`Initializing Folio at: ${targetDir}`);
        const dirs = [".index", "history", "certificates", "keys", "inbox", "logs"];
        for (const d of dirs) {
            await fs.ensureDir(path.join(targetDir, d));
        }

        // Initialize SQLite DB (KV + FTS)
        try {
            const storage = new FolioStorage(targetDir);
            storage.close();
            console.log(`✅ Folio database initialized (${path.join(".index", "folio.db")})`);
        } catch (e: any) {
            console.error(`❌ Failed to initialize database: ${e.message}`);
        }

        console.log("✅ Folio structure created.");
    });

program
    .command("index")
    .description("Scan and re-index all documents in the Folio")
    .action(async () => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        if (!await fs.pathExists(path.join(folioDir, ".index"))) {
            console.error(`Error: Not a valid Folio directory (missing ${path.join(folioDir, ".index")}). Run 'init' first.`);
            process.exit(1);
        }

        try {
            const manager = new FolioManager(folioDir);
            await manager.reindex();
            manager.close();
            console.log("✅ Indexing complete.");
        } catch (e: any) {
            console.error(`❌ Indexing failed: ${e.message}`);
            process.exit(1);
        }
    });

program
    .command("ingest <path>")
    .description("Ingest a file or directory into the Folio index")
    .action(async (targetPath) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const fullPath = path.resolve(process.cwd(), targetPath);
        
        if (!await fs.pathExists(fullPath)) {
            console.error(`Error: Path not found: ${fullPath}`);
            process.exit(1);
        }

        try {
            const manager = new FolioManager(folioDir);
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                const count = await manager.ingestDir(fullPath);
                console.log(`✅ Ingested ${count} items from directory.`);
            } else {
                await manager.indexFile(fullPath);
                console.log(`✅ Ingested file: ${fullPath}`);
            }
            manager.close();
        } catch (e: any) {
            console.error(`❌ Ingest failed: ${e.message}`);
            process.exit(1);
        }
    });

program
    .command("ls")
    .description("List indexed documents in the Folio")
    .option("-t, --type <type>", "Filter by document type")
    .action(async (options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        try {
            const storage = new FolioStorage(folioDir);
            const results = options.type ? storage.findByType(options.type) : storage.getAll();
            
            if (results.length === 0) {
                console.log("No documents found.");
            } else {
                console.log(`${'Type'.padEnd(20)} | ${'Key'.padEnd(30)} | ${'Path'}`);
                console.log("-".repeat(80));
                for (const res of results) {
                    console.log(`${res.doc_type.padEnd(20)} | ${res.key.padEnd(30)} | ${res.file_path}`);
                }
            }
            storage.close();
        } catch (e: any) {
            console.error(`❌ Error: ${e.message}`);
        }
    });

program
    .command("query <text>")
    .description("Search documents using full-text search")
    .action(async (text) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        try {
            const storage = new FolioStorage(folioDir);
            const results = storage.search(text);
            
            if (results.length === 0) {
                console.log("No matches found.");
            } else {
                console.log(`Found ${results.length} matches:`);
                for (const res of results) {
                    console.log(`\n--- ${res.key} (${res.doc_type}) ---
`);
                    console.log(`Path: ${res.file_path}`);
                    console.log(`Title: ${res.metadata.title}`);
                }
            }
            storage.close();
        } catch (e: any) {
            console.error(`❌ Error: ${e.message}`);
        }
    });



// --- DID Operations ---
import { resolveDidDocument, encodeDidKey } from "@srn/core";
import { bytesToHex, hexToBytes, base64UrlToBytes } from "@srn/core";
import { initWasm, ed25519GenerateKeyPair, ed25519Sign, ed25519Verify } from "@srn/core";
import { JSDOM } from "jsdom";
import * as crypto from "node:crypto";

// Helper to extract JSON-LD from HTML
function extractJsonLd(html: string): any {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
        if (script.textContent) {
            try {
                const json = JSON.parse(script.textContent);
                if (json.type === "VerifiablePresentation" || json.type?.includes("VerifiablePresentation")) return json;
                if (json.type === "VerifiableCredential" || json.type?.includes("VerifiableCredential")) return json;
            } catch { }
        }
    }
    
    try {
        return JSON.parse(html);
    } catch { }

    return null;
}

const didCmd = program.command("did").description("DID operations");

didCmd
    .command("resolve <did>")
    .description("Resolve a DID document")
    .action(async (did) => {
        try {
            const doc = await resolveDidDocument(did);
            if (!doc) {
                console.error(`Error: Could not resolve DID ${did}`);
                process.exit(1);
            }
            console.log(JSON.stringify(doc, null, 2));
        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

didCmd
    .command("create")
    .description("Create a new DID")
    .option("-m, --method <method>", "DID method (key, web)", "key")
    .option("-t, --type <type>", "Key type (ed25519, p256)", "ed25519")
    .option("--hybrid", "Generate a hybrid (Ed25519 + ML-DSA-44) key pair")
    .option("--save <alias>", "Save the private key with an alias")
    .action(async (options) => {
        if (options.method === "key") {
            let keyData: any;
            let did: string;

            if (options.type === "p256") {
                const pair = await crypto.subtle.generateKey(
                    { name: "ECDSA", namedCurve: "P-256" },
                    true,
                    ["sign", "verify"]
                );
                
                const publicKey = await crypto.subtle.exportKey("jwk", pair.publicKey);
                const privateKey = await crypto.subtle.exportKey("jwk", pair.privateKey);

                const x = base64UrlToBytes(publicKey.x!);
                const y = base64UrlToBytes(publicKey.y!);
                const compressed = new Uint8Array(33);
                compressed[0] = (y[y.length - 1] % 2 === 0) ? 0x02 : 0x03;
                compressed.set(x, 1);

                did = encodeDidKey(compressed, "p256");
                keyData = {
                    did,
                    method: "key",
                    algorithm: "ES256",
                    created: new Date().toISOString(),
                    publicKeyJwk: publicKey,
                    privateKeyJwk: privateKey
                };
            } else if (options.hybrid) {
                await initWasm();
                const { generateHybridKeys } = await import("@srn/core");
                const hybrid = await generateHybridKeys(true);
                did = encodeDidKey(hexToBytes(hybrid.ed25519.publicKey), "ed25519");
                keyData = {
                    did,
                    method: "key",
                    algorithm: "hybrid-eddsa-mldsa",
                    created: new Date().toISOString(),
                    ed25519: hybrid.ed25519,
                    pqc: hybrid.pqc,
                    publicKey: hybrid.ed25519.publicKey,
                    privateKey: hybrid.ed25519.privateKey
                };
            } else {
                await initWasm();
                const { privateKey, publicKey } = ed25519GenerateKeyPair();
                did = encodeDidKey(publicKey, "ed25519");
                keyData = {
                    did,
                    method: "key",
                    algorithm: "Ed25519",
                    created: new Date().toISOString(),
                    publicKey: bytesToHex(publicKey),
                    privateKey: bytesToHex(privateKey)
                };
            }

            console.log(`DID: ${did}`);
            console.log(`Algorithm: ${keyData.algorithm}`);
            
            if (options.save) {
                const folioDir = path.resolve(process.cwd(), program.opts().folio);
                const keysDir = path.join(folioDir, "keys");
                await fs.ensureDir(keysDir, { mode: 0o700 });
                const keyFile = path.join(keysDir, `${options.save}.json`);

                if (await fs.pathExists(keyFile)) {
                    console.error(`Error: Key alias '${options.save}' already exists.`);
                    process.exit(1);
                }

                await fs.writeJson(keyFile, keyData, { spaces: 2, mode: 0o600 });
                console.log(`✅ Key saved to ${keyFile}`);
            }
        } else {
            console.error("Only 'key' method is currently supported for creation.");
            process.exit(1);
        }
    });

didCmd
    .command("bind-jpki <passkey_did>")
    .description("Create a KeyBindingStatement signed by JPKI card")
    .option("-o, --output <path>", "Output VC path", "binding-vc.json")
    .option("--sim", "Use simulated JPKI key instead of real card")
    .option("--pin <pin>", "JPKI Auth PIN")
    .action(async (passkeyDid, options) => {
        try {
            let signatureHex: string;
            let issuer: string;
            let verificationMethod: string;
            let proofType: string;

            if (options.sim) {
                console.log("💳 Connecting to JPKI Card (Simulation)...");
                const pair = await crypto.subtle.generateKey(
                    {
                        name: "RSASSA-PKCS1-v1_5",
                        modulusLength: 2048,
                        publicExponent: new Uint8Array([1, 0, 1]),
                        hash: "SHA-256",
                    },
                    true,
                    ["sign", "verify"]
                );

                issuer = "did:pki:jpki-simulator";
                verificationMethod = "did:pki:jpki-simulator#cert";
                proofType = "RsaSignature2018";

                const vcPayload = {
                    "id": passkeyDid,
                    "statement": "I verify that I hold the private key corresponding to this DID.",
                    "jpki_attributes": {
                        "name": "Simulated User",
                        "my_number_hash": "hashed_value_12345"
                    }
                };
                
                const dataToSign = new TextEncoder().encode(JSON.stringify(vcPayload));
                const signature = await crypto.subtle.sign(
                    "RSASSA-PKCS1-v1_5",
                    pair.privateKey,
                    dataToSign
                );
                signatureHex = bytesToHex(new Uint8Array(signature));

            } else {
                console.log("💳 Connecting to Real JPKI Card (PC/SC)...");
                const { PcscAdapter } = await import("./pcsc");
                const { WasmJpkiController, WebUsbReader } = require("../../packages/folio-core/pkg-node/folio_core.js");

                const adapter = new PcscAdapter();
                await adapter.connect();
                const reader = new WebUsbReader(adapter);
                const controller = new WasmJpkiController(reader);

                await controller.select_jpki_ap();
                const pin = options.pin;
                if (!pin) throw new Error("PIN is required for real card operation. Use --pin.");

                await controller.verify_pin(new Uint8Array([0x00, 0x18]), pin);
                const certDer = await controller.read_auth_cert();
                const certHash = crypto.createHash('sha256').update(certDer).digest('hex');
                
                issuer = `did:pki:jpki-${certHash.substring(0, 16)}`;
                verificationMethod = `${issuer}#auth-cert`;
                proofType = "JpkiAuthSignature2025"; 

                const vcPayload = {
                    "id": passkeyDid,
                    "statement": "I verify that I hold the private key corresponding to this DID.",
                    "jpki_attributes": { "cert_thumbprint": certHash }
                };
                
                const dataToSign = new TextEncoder().encode(JSON.stringify(vcPayload));
                const signature = await controller.compute_signature(dataToSign);
                signatureHex = bytesToHex(new Uint8Array(signature));
            }

            const vc = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "FidoKeyBindingStatement"],
                "issuer": issuer,
                "issuanceDate": new Date().toISOString(),
                "credentialSubject": {
                    "id": passkeyDid,
                    "statement": "I verify that I hold the private key corresponding to this DID.",
                },
                "proof": {
                    "type": proofType,
                    "created": new Date().toISOString(),
                    "verificationMethod": verificationMethod,
                    "proofPurpose": "assertionMethod",
                    "jws": signatureHex
                }
            };

            const outPath = path.resolve(process.cwd(), options.output);
            await fs.writeJson(outPath, vc, { spaces: 2 });
            console.log(`✅ JPKI Binding VC created and saved to ${outPath}`);

        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

// --- Presentation Operations ---
const presentation = program.command("presentation").description("VP operations (create, verify)");

presentation
    .command("create <vc_path>")
    .description("Create a Verifiable Presentation from a VC (Response to Verifier Request)")
    .requiredOption("-a, --audience <did>", "Audience DID (verifier)")
    .option("-k, --key <hex>", "Private Key (Hex)")
    .option("--key-file <path>", "Path to private key file")
    .option("--binding <path>", "Path to KeyBindingStatement VC (Proof of Possession)")
    .option("--challenge <nonce>", "Challenge (nonce) provided by the verifier")
    .option("-o, --output <path>", "Output VP path", "presentation.html")
    .action(async (vcPath, options) => {
        try {
            let keyData = await loadKeyData(options);
            await initWasm();

            const fullVcPath = path.resolve(process.cwd(), vcPath);
            if (!await fs.pathExists(fullVcPath)) {
                console.error(`Error: VC file not found: ${fullVcPath}`);
                process.exit(1);
            }
            const vcContent = await fs.readFile(fullVcPath, "utf-8");
            const vc = extractJsonLd(vcContent);
            if (!vc) throw new Error("Could not extract VC from file.");

            const vcs = [vc];
            if (options.binding) {
                const bindingPath = path.resolve(process.cwd(), options.binding);
                const bindingContent = await fs.readFile(bindingPath, "utf-8");
                const bindingVc = extractJsonLd(bindingContent);
                if (bindingVc) {
                    vcs.push(bindingVc);
                    console.log("Adding KeyBindingStatement (Identity Anchor) to Presentation.");
                }
            }

            const did = keyData.did || (keyData.publicKey ? encodeDidKey(hexToBytes(keyData.publicKey), "ed25519") : "did:key:unknown");

            let challenge: Uint8Array;
            if (options.challenge) {
                challenge = new TextEncoder().encode(options.challenge);
                console.log(`Using provided challenge: ${options.challenge}`);
            } else {
                challenge = crypto.getRandomValues(new Uint8Array(32));
                console.log("Using generated random challenge.");
            }
            const challengeHex = bytesToHex(challenge);
            
            let signatureHex: string;
            let proofType: string;
            let verificationMethod = `${did}#controller`;

            if (keyData.algorithm === "ES256" || keyData.privateKeyJwk) {
                const privateKey = await crypto.subtle.importKey(
                    "jwk", keyData.privateKeyJwk,
                    { name: "ECDSA", namedCurve: "P-256" },
                    false, ["sign"]
                );
                const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, challenge);
                signatureHex = bytesToHex(new Uint8Array(sig));
                proofType = "JsonWebSignature2020";
                if (did.startsWith("did:key:")) verificationMethod = `${did}#${did.split(":")[2]}`;
            } else {
                const privKeyBytes = hexToBytes(keyData.privateKey || (keyData.ed25519 ? keyData.ed25519.privateKey : ""));
                const signature = ed25519Sign(privKeyBytes, challenge);
                signatureHex = bytesToHex(signature);
                proofType = "Ed25519Signature2020";
            }

            const vp = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiablePresentation"],
                "verifiableCredential": vcs,
                "holder": did,
                "proof": {
                    "type": proofType,
                    "created": new Date().toISOString(),
                    "verificationMethod": verificationMethod,
                    "proofPurpose": "authentication",
                    "challenge": challengeHex,
                    "domain": options.audience,
                    "jws": signatureHex
                }
            };

            const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Folio Presentation (VP)</title></head>
<body>
    <h1>Verifiable Presentation</h1>
    <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; font-family: sans-serif;">
        <p><strong>Holder:</strong> ${did}</p>
        <p><strong>Verifier (Audience):</strong> ${options.audience}</p>
        <p><strong>Proof:</strong> ${proofType} over challenge <code>${challengeHex.substring(0, 16)}...</code></p>
        <p><strong>Contains:</strong> ${vcs.length} Proof(s)</p>
    </div>
    <script type="application/ld+json">
    ${JSON.stringify(vp, null, 2)}
    </script>
</body>
</html>`;

            const outPath = path.resolve(process.cwd(), options.output);
            await fs.writeFile(outPath, html);
            console.log(`✅ VP Response created and saved to ${outPath}`);

        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

presentation
    .command("verify <vp_path>")
    .description("Verify a Verifiable Presentation")
    .action(async (vpPath) => {
        try {
            await initWasm();
            const fullVpPath = path.resolve(process.cwd(), vpPath);
            const vpContent = await fs.readFile(fullVpPath, "utf-8");
            const vp = extractJsonLd(vpContent);

            if (!vp || !vp.type?.includes("VerifiablePresentation")) throw new Error("Valid VP not found.");

            console.log(`Verifying VP from Holder: ${vp.holder}`);
            console.log(`Audience: ${vp.proof.domain}`);
            console.log(`Contains ${vp.verifiableCredential?.length || 0} VC(s).`);
            
            for (const vc of vp.verifiableCredential || []) {
                console.log(`- VC Type: ${vc.type.join(", ")} | Issuer: ${vc.issuer}`);
            }
            console.log("✅ VP Structure Valid");

        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            process.exit(1);
        }
    });

// --- Profile Operations ---
const profile = program.command("profile").description("Manage user profile for auto-filling");

profile
    .command("create")
    .description("Generate profile.json from indexed documents")
    .option("-o, --output <path>", "Output profile path", "profile.json")
    .action(async (options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        try {
            const manager = new FolioManager(folioDir);
            const data = await manager.aggregateFields();
            const outPath = path.resolve(folioDir, options.output);
            await fs.writeJson(outPath, data, { spaces: 2 });
            console.log(`✅ Profile generated and saved to ${outPath}`);
            manager.close();
        } catch (e: any) {
            console.error(`❌ Profile generation failed: ${e.message}`);
            process.exit(1);
        }
    });

profile
    .command("show")
    .description("Show current profile data")
    .action(async () => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const profilePath = path.join(folioDir, "profile.json");
        if (await fs.pathExists(profilePath)) {
            const data = await fs.readJson(profilePath);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("No profile found. Run 'profile create' first.");
        }
    });

if (import.meta.main) {
    program.parse();
}

export { program };