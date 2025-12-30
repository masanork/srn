import { program } from "commander";
import path from "node:path";
import * as fs from "fs-extra";

program
    .name("folio")
    .description("Web/A Folio CLI - User-centric data container toolkit")
    .version("0.1.0")
    .option("-f, --folio <dir>", "Path to the Folio directory", ".");

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
    .option("--mode <mode>", "Sync mode: inbox, outbox, or full", "inbox")
    .action(async (options) => {
        const folioDir = path.resolve(process.cwd(), program.opts().folio);
        const remoteUrl = options.remote;
        const did = options.did;
        const privateKey = options.key;
        const mode = options.mode;

        if (!remoteUrl || !did) {
            console.error("Error: --remote and --did are required for sync.");
            process.exit(1);
        }

        try {
            await syncFolio({ folioDir, remoteUrl, did, privateKey, mode });
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

if (import.meta.main) {
    program.parse();
}

export { program };
