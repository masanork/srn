import { program } from "commander";
import path from "node:path";
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
            } else {
                throw new Error("Key file does not contain 'privateKey' field.");
            }
        } else {
            throw new Error(`Key file not found: ${keyPath}`);
        }
    }

    if (!privateKeyHex) {
        throw new Error("Either --key or --key-file must be provided.");
    }
    return privateKeyHex;
}

// --- Form Operations ---
const form = program.command("form").description("Form operations (parse, fill, validate)");

form
    .command("parse <file>")
    .description("Parse a Web/A form and output its schema")
    .action(async (file) => {
        // TODO: Integrate existing WebAParser
        console.log(`Parsing form: ${file}`);
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
    .action(async (options) => {
        try {
            const privateKeyHex = await loadPrivateKey(options);

            await sendMessage({
                did: options.did,
                message: options.message,
                senderDid: options.sender,
                privateKeyHex: privateKeyHex,
                remote: options.remote
            });
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
import { addUser } from "./admin";

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

// --- Folio Management ---
program
    .command("init [directory]")
    .description("Initialize a new Folio directory structure")
    .action(async (directory) => {
        const targetDir = path.resolve(process.cwd(), directory || ".");
        console.log(`Initializing Folio at: ${targetDir}`);
        const dirs = [".index", "history", "certificates", "keys", "inbox", "logs"];
        for (const d of dirs) {
            await fs.ensureDir(path.join(targetDir, d));
        }
        console.log("✅ Folio structure created.");
    });



// --- DID Operations ---
import { resolveDidDocument, encodeDidKey } from "../core/did";
import { bytesToHex } from "../core/encoding";
import { initWasm, ed25519GenerateKeyPair } from "../core/wasm_core";

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
    .option("--save <alias>", "Save the private key with an alias")
    .action(async (options) => {
        if (options.method === "key") {
            await initWasm();
            const { privateKey, publicKey } = ed25519GenerateKeyPair();
            const did = encodeDidKey(publicKey, "ed25519");

            console.log(`DID: ${did}`);
            console.log(`Public Key (Hex): ${bytesToHex(publicKey)}`);
            console.log(`Private Key (Hex): ${bytesToHex(privateKey)}`);

            if (options.save) {
                const folioDir = path.resolve(process.cwd(), program.opts().folio);
                const keysDir = path.join(folioDir, "keys");
                await fs.ensureDir(keysDir, { mode: 0o700 });
                const keyFile = path.join(keysDir, `${options.save}.json`);

                // Do not overwrite existing keys without warning (for now just fail)
                if (await fs.pathExists(keyFile)) {
                    console.error(`Error: Key alias '${options.save}' already exists.`);
                    process.exit(1);
                }

                await fs.writeJson(keyFile, {
                    did,
                    method: "key",
                    algorithm: "Ed25519",
                    created: new Date().toISOString(),
                    publicKey: bytesToHex(publicKey),
                    privateKey: bytesToHex(privateKey)
                }, { spaces: 2, mode: 0o600 });
                console.log(`✅ Key saved to ${keyFile}`);
            }
        } else {
            console.error("Only 'key' method is currently supported for creation.");
            process.exit(1);
        }
    });

if (import.meta.main) {
    program.parse();
}

export { program };
