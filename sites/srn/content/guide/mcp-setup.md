---
title: "AI Agent Integration (MCP Setup)"
layout: article
description: "How to use Web/A Folio from AI tools like Claude Desktop, Cursor, and Windsurf."
date: 2025-12-30
author: "Sorane Project"
---

# AI Agent Integration (MCP Setup)

The Web/A Folio CLI (`folio`) has a built-in **Model Context Protocol (MCP)** server.
This allows main-stream AI tools like Claude Desktop, Cursor, and Windsurf to directly read Web/A Forms and manage your Folio.

We recommend using these general-purpose AI tools as the primary frontend for Web/A Folio.

## Server Launch Command

If you have the repository cloned, you can start the MCP server with:

```bash
# Execute at the root of the srn repository
bun src/folio/index.ts serve
```

## Configuration for Tools

### 1. Claude Desktop App

Open your Claude Desktop config (e.g., `~/Library/Application Support/Claude/claude_desktop_config.json`) and add the server to `mcpServers`.

*Note: Replace `/path/to/srn` with your absolute repository path.*

```json
{
  "mcpServers": {
    "weba-folio": {
      "command": "bun",
      "args": [
        "/path/to/srn/src/folio/index.ts",
        "serve"
      ]
    }
  }
}
```

Restart Claude Desktop, and you should see the tool icon (🔌).

### 2. Cursor / Windsurf

Add the following to `.cursor/mcp.json` in your project root, or use the MCP settings pane in the IDE:

```json
{
  "weba-folio": {
    "command": "bun",
    "args": [
      "${workspaceFolder}/src/folio/index.ts",
      "serve"
    ]
  }
}
```

## Example Scenarios

Once set up, you can ask the AI:

**Exp 1: Understanding Form Structure**
> "Show me the input fields for `sites/srn/content/weba/workcert.md`."
>
> → The AI will call `weba_parse` to get the JSON Schema and explain it.

**Exp 2: Creating a Draft**
> "Create a draft for the Employment Certificate using:
> Name: John Doe
> Address: 123 Main St..."
>
> → The AI calls `weba_fill`, generates a Markdown file with filled values, and presents it to you.

## Available Tools

*   `weba_parse`: Analyzes a Web/A Form (Markdown) and returns field definitions as JSON Schema.
*   `weba_fill`: Combines a Web/A Form with JSON data to produce a pre-filled Markdown file.

---
Web/A Folio acts as a **"Human-Readable Database with an API for AI."**
