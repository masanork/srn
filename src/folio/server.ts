
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs/promises';
import * as path from 'node:path';
import { glob } from 'glob';
import { WebAParser } from "./core/parser.js";

export class FolioServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "weba-folio-server",
                version: "0.1.0",
            },
            {
                capabilities: {
                    tools: {},
                    resources: {}, // To be implemented
                },
            }
        );

        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "weba_parse",
                    description: "Parse a Web/A Form (Markdown) and return its JSON schema.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Absolute path to the Web/A Form Markdown file.",
                            },
                        },
                        required: ["path"],
                    },
                },
                {
                    name: "weba_fill",
                    description: "Fill a Web/A Form with JSON data.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Absolute path to the Web/A Form Markdown file.",
                            },
                            data: {
                                type: "object",
                                description: "JSON object containing field values.",
                            },
                        },
                        required: ["path", "data"],
                    },
                },
                {
                    name: "folio_list",
                    description: "List all documents in the Folio (certificates, history) and shared forms templates.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            category: {
                                type: "string",
                                enum: ["forms", "certificates", "history", "all"],
                                description: "Filter by category.",
                                default: "all",
                            },
                        },
                    },
                },
                {
                    name: "folio_read",
                    description: "Read a document's raw content from the Folio or shared forms.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Path to the document (relative to project root).",
                            },
                        },
                        required: ["path"],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case "weba_parse": {
                    const path = String(request.params.arguments?.path);
                    if (!path) {
                        throw new McpError(ErrorCode.InvalidParams, "Path is required");
                    }
                    try {
                        const content = await fs.readFile(path, "utf-8");
                        const schema = WebAParser.parse(content);
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(schema, null, 2),
                                },
                            ],
                        };
                    } catch (error: any) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Error parsing file: ${error.message}`
                                }
                            ],
                            isError: true
                        };
                    }
                }

                case "weba_fill": {
                    const path = String(request.params.arguments?.path);
                    const data = request.params.arguments?.data as Record<string, any>;

                    if (!path || !data) {
                        throw new McpError(ErrorCode.InvalidParams, "Path and data are required");
                    }

                    try {
                        const content = await fs.readFile(path, "utf-8");
                        const filled = WebAParser.fill(content, data);
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: filled,
                                },
                            ],
                        };
                    } catch (error: any) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Error filling form: ${error.message}`
                                }
                            ],
                            isError: true
                        };
                    }
                }

                case "folio_list": {
                    const category = String(request.params.arguments?.category || "all");
                    const root = process.cwd();
                    const results: any[] = [];

                    const scan = async (dir: string, label: string) => {
                        const fullPath = path.join(root, dir);
                        try {
                            const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                            if (!exists) return;

                            const files = await glob("**/*.{md,html,json}", { cwd: fullPath });
                            for (const f of files) {
                                results.push({
                                    category: label,
                                    path: path.join(dir, f),
                                    name: f
                                });
                            }
                        } catch (e) {
                            console.error(`Error scanning ${dir}:`, e);
                        }
                    };

                    if (category === "forms" || category === "all") await scan("shared/forms", "Template Form");
                    if (category === "certificates" || category === "all") await scan("folio/certificates", "My Certificate");
                    if (category === "history" || category === "all") await scan("folio/history", "Past Record");

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2),
                            },
                        ],
                    };
                }

                case "folio_read": {
                    const relPath = String(request.params.arguments?.path);
                    if (!relPath) {
                        throw new McpError(ErrorCode.InvalidParams, "Path is required");
                    }

                    try {
                        const fullPath = path.resolve(process.cwd(), relPath);
                        // Security check: ensure it's within project root and not in sensitive dirs like keys/
                        if (!fullPath.startsWith(process.cwd()) || relPath.includes("keys/")) {
                            throw new Error("Access denied");
                        }

                        const content = await fs.readFile(fullPath, "utf-8");
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: content,
                                },
                            ],
                        };
                    } catch (error: any) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Error reading file: ${error.message}`
                                }
                            ],
                            isError: true
                        };
                    }
                }

                default:
                    throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Web/A Folio MCP Server running on stdio");
    }
}
