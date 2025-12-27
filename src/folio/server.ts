
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs/promises';
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
