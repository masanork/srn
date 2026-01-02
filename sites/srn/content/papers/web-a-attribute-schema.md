---
title: "Technical Specification: Web/A Attribute Schema & LoA Management"
layout: article
author: "Sorane Project"
date: 2026-01-02
description: "Defining hierarchical identifiers and Levels of Assurance for seamless data integration in Web/A Folio."
---

# Web/A Attribute Schema & LoA Management

## 1. Introduction

In the Web/A ecosystem, the **Folio** acts as a user-centric data container. To enable an AI Agent to assist in document workflows (e.g., pre-filling forms), we need a robust way to identify personal attributes and manage their reliability.

This document defines the **Web/A Attribute Schema (WAS)**, a hierarchical identification system that links form fields to personal data sources while preserving the **Level of Assurance (LoA)**.

## 2. Identifier Hierarchy

Web/A adopts a "DID as a Root" approach, ensuring identifiers are globally unique, low-cost, and owner-verifiable.

### 2.1. Form Identifier (WFI)
Every Web/A Form should have a globally unique identifier.
- **Format**: `did:web:<domain>[:path]#<form-slug>`
- **Example**: `did:web:srn.site:examples#postal-demo`
- **Role**: Identifies the type of document and its official issuer.

### 2.2. Attribute Identifier (WAI)
Attributes are identified by a path relative to a Form or a Context.
- **Format**: `<WFI>#<attribute-path>` or `<ContextID>#<attribute-path>`
- **Path structure**: Hierarchical slash-separated strings (e.g., `delivery/address/postalCode`).
- **Example**: `did:web:srn.site:examples#postal-demo#delivery/zip`

## 3. Levels of Assurance (LoA)

The reliability of an attribute is categorized by its Level of Assurance. The storage format (Canonical Format) is determined by the required LoA.

| Level | Name | Canonical Format | Source of Truth |
| :--- | :--- | :--- | :--- |
| **LoA 0** | AI Memory | **Vector DB / JSON** | AI inference, conversation history, ephemeral context. |
| **LoA 1** | Self-asserted | **Markdown / YAML** | Human entry, personal notes, profile.md |
| **LoA 2** | Verified | **JSON / VC** | Digitally signed by an organization (Employer, School). |
| **LoA 3** | High-Assurance | **Signed VC** | Verified via National ID (My Number, Passport). |

### 3.1. LoA 0: AI Memory & Inference
LoA 0 represents information that the AI has "learned" or "inferred" from interactions. 
- **Nature**: Temporary, potentially contains hallucinations, and lacks explicit human verification.
- **Promotion**: When a user confirms LoA 0 data and saves it to a text-based file, it is promoted to **LoA 1**.
- **Transparency**: Agents must clearly label LoA 0 data to distinguish it from facts.

### 3.2. Human-Readability and LoA
- **LoA 1 Data**: Prioritizes human editability. JSON summaries are derived artifacts.
- **LoA 2+ Data**: Prioritizes cryptographic integrity. Human-readable views (HTML/Markdown) are derived artifacts.
- **Invalidation**: If a user manually edits LoA 2+ data in a text editor, its LoA status is downgraded to LoA 1.

## 4. Mapping & Automation

To enable "Agentic Prefill," Web/A Forms map their flat field IDs to the hierarchical Attribute Schema.

### 4.1. Mapping Definition
Inside a Form's frontmatter:
```yaml
form: "did:web:srn.site:examples#postal-demo"
attributes:
  delivery/zip:
    field: "delivery.zip"
    required_loa: 1
  sender/name:
    field: "sender.name"
    required_loa: 3
```

### 4.2. Provenance Tracking
When an Agent fills a form, it must record the **Provenance** of each value:
```json
{
  "field": "sender.name",
  "value": "Taro Setagaya",
  "loa": 3,
  "source": "folio/certificates/id-binding.json",
  "method": "mcp:folio_read"
}
```

## 5. Directory Mapping in Folio

The Folio structure reflects the LoA separation:
- `profile.md`: Primary home for LoA 1 global attributes (`name`, `email`).
- `certificates/`: Official VCs (LoA 2+).
- `history/`: Past form submissions, acting as a contextual reference.

## 6. Conclusion

By strictly separating LoA 1 (Human-centric) and LoA 2+ (Machine-centric) while sharing a common hierarchical ID system, Web/A Folio provides a secure and intuitive workspace where AI can act as a trusted assistant for personal administration.
