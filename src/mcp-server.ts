
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { verifyWebA } from "./verify-core.ts";
import fs from "fs-extra";
import path from "path";

/**
 * Web/A Model Context Protocol (MCP) Server
 * Enables AI models to verify Web/A documents directly.
 */

const server = new Server(
    {
        name: "weba-validator",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Define available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "verify_weba",
                description: "Verifies a Web/A high-integrity document (HTML). Checks cryptographic signatures and optionally Human-Machine Parity (HMP).",
                inputSchema: {
                    type: "object",
                    properties: {
                        target: {
                            type: "string",
                            description: "URL or local file path to the Web/A document",
                        },
                        checkHmp: {
                            type: "boolean",
                            description: "Whether to verify consistency between HTML content and signed data (default: true)",
                            default: true,
                        },
                        didPath: {
                            type: "string",
                            description: "Optional local path to a did.json for key resolution (useful for pre-deployment checks)",
                        },
                    },
                    required: ["target"],
                },
            },
        ],
    };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "verify_weba") {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const target = String(request.params.arguments?.target);
    const checkHmp = request.params.arguments?.checkHmp !== false;
    const didPath = request.params.arguments?.didPath ? String(request.params.arguments.didPath) : null;

    try {
        let htmlContent = "";

        // Load content
        if (target.startsWith("http://") || target.startsWith("https://")) {
            const resp = await fetch(target);
            if (!resp.ok) throw new Error(`Failed to fetch URL: ${resp.statusText}`);
            htmlContent = await resp.text();
        } else {
            const filePath = path.resolve(process.cwd(), target);
            if (!(await fs.pathExists(filePath))) throw new Error(`File not found: ${target}`);
            htmlContent = await fs.readFile(filePath, "utf-8");
        }

        // Load local DID if provided
        const trustedKeys: Record<string, string> = {};
        if (didPath) {
            const didDoc = await fs.readJson(path.resolve(process.cwd(), didPath));
            if (Array.isArray(didDoc.verificationMethod)) {
                didDoc.verificationMethod.forEach((vm: any) => {
                    if (vm.id && vm.publicKeyHex) {
                        trustedKeys[vm.id] = vm.publicKeyHex;
                    }
                });
            }
        }

        // Verify
        const result = await verifyWebA(htmlContent, { checkHmp, trustedKeys });

        // Format response for the AI
        let text = result.isValid
            ? "✅ Web/A Document is VALID.\n"
            : "❌ Web/A Document is INVALID.\n";

        if (result.error) text += `Error: ${result.error}\n`;

        if (result.metadata) {
            text += `\nMetadata:\n- Title: ${result.metadata.title}\n- Author: ${result.metadata.author}\n- Date: ${result.metadata.date}\n`;
        }

        text += `\nChecks:\n- Classic Signature: ${result.checks.ed25519 ? "Pass" : "Fail"}\n- Post-Quantum Signature: ${result.checks.pqc ? "Pass" : "Fail"}\n`;

        if (checkHmp && result.hmpResult) {
            text += `\nHuman-Machine Parity (HMP): ${result.hmpResult.isValid ? "Valid" : "Divergence Detected"}\n`;
            result.hmpResult.details.forEach(d => {
                text += `  [${d.match ? "OK" : "FAIL"}] ${d.field}: ${d.htmlValue} vs ${d.jsonValue}\n`;
            });
        }

        return {
            content: [{ type: "text", text }],
            isError: !result.isValid,
        };
    } catch (err: any) {
        return {
            content: [{ type: "text", text: `Verification failed: ${err.message}` }],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Web/A MCP Server running on stdio");
}

runServer().catch(console.error);
