---
title: "AI & Prompts: Automating Web/A Document Creation"
layout: article
description: "Prompts for migrating Excel to Web/A Form and aggregating data using AI."
date: 2025-12-30
author: "Sorane Project"
---

# AI & Prompts

Web/A Forms are designed to be "AI-First." Because the syntax is expressive and the data model (JSON-LD) is structured, LLMs can efficiently facilitate migration and data processing.

## 1. Migration from Excel (Excel to Web/A)

Use this prompt to convert a raw Markdown table (extracted via `markitdown`) into a functional Web/A Form.

> **Prompt: Form Conversion**
>
> Convert the Markdown content below into Web/A Form syntax using the rules listed.
>
> **Web/A Syntax Rules**:
>
> 1.  **Inputs**: Use `[type:key (attributes)]`.
>     -   Text: `[text:id (label="Label Name")]`
>     -   Number: `[number:price (placeholder="0")]`
>     -   Date: `[date:birthday]`
>     -   Textarea: `[textarea:comment]`
> 2.  **Calculations**: Use `calc`.
>     -   Basic: `[calc:subtotal (formula="price * quantity")]`
>     -   Sum: `[calc:total (formula="SUM(subtotal)")]` (for tables)
> 3.  **Tables**: Mark columns that should be input fields within the Markdown table.
>
> **Task**:
> Keep the original headers and instructions. Ensure all Japanese labels are preserved as `label="..."` attributes.
>
> **Source Markdown**:
> (Paste your Markdown here)

## 2. Autonomous Data Aggregation

Agents can read collected Web/A Forms and extract data without a proprietary database.

> **Prompt: Batch Data Extraction**
>
> You are a data analyst. I have a folder containing several HTML files (Web/A Forms).
> 
> **Task**:
> 1. Locate the `<script type="application/ld+json">` block in each file.
> 2. Parse the JSON-LD objects.
> 3. Extract the following fields: `submissionId`, `issuer`, and the keys inside `credentialSubject`.
> 4. Output a single CSV-formatted table summarizing all submissions.

## 3. Form Intelligence (Folio Integration)

When an Agent has access to a user's Folio, it can pre-fill new forms.

> **Prompt: Smart Pre-fill**
>
> I need to fill out `new_application.md`.
> 1. Read my past submission history in the `history/` folder.
> 2. Look for my latest personal info in `profile.html`.
> 3. Fill in the fields in `new_application.md` based on this context.
> 4. If any data is missing, flag it for my review.

---
*For more details on integration, see the [MCP Setup Guide](./guide/mcp-setup.html).*
