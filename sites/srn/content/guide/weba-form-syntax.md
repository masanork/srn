---
title: "Web/A Form Syntax Guide"
description: "Comprehensive reference for the Markdown-based form definition syntax used in Web/A."
layout: article
date: 2026-01-02
author: "Sorane Project"
lang: en
---

# Web/A Form Syntax Guide

Web/A Form uses a specialized Markdown "dialect" to define interactive forms that are both human-readable and machine-verifiable. This guide provides a complete reference for all supported tags and formatting.

## 1. Basic Formatting
Standard Markdown inline styles are supported for labels and descriptions.

| Style | Syntax | Result |
| :--- | :--- | :--- |
| **Bold** | `**text**` or `__text__` | **text** |
| *Italic* | `*text*` or `_text_` | *text* |
| `Code` | `` `code` `` | `code` |
| Link | `[Label](URL)` | [Label](URL) |

## 2. Form Tags
Tags define interactive input fields. The general syntax is `[type:id (attributes)] Label`.

### 2.1. Basic Input Types
| Type | Syntax Example | Description |
| :--- | :--- | :--- |
| `text` | `[text:name] Full Name` | Standard text input. |
| `number` | `[number:age] Age` | Numeric input (right-aligned). |
| `date` | `[date:birthday] Birth Date` | Browser-native date picker. |
| `textarea` | `[textarea:memo] Notes` | Multi-line text area. |

### 2.2. Advanced Types
| Type | Syntax Example | Description |
| :--- | :--- | :--- |
| `search` | `[search:v src:vendors] Vendor` | Autocomplete using master data. |
| `calc` | `[calc:total formula="SUM(amount)"]` | Automatic calculations (Excel-like). |
| `checkbox` | `[checkbox:agree] Approved` | Boolean toggle. |
| `radio` | `- [radio:rank] Rank` | See Section 3 for list syntax. |

## 3. Lists & Choices

### 3.1. Radio Buttons
Radio buttons are defined as an indented list under a `radio` tag.
```markdown
- [radio:satisfaction] How satisfied are you?
  - Very Satisfied
  - [x] Satisfied (Default)
  - Unsatisfied
```

## 4. Tables

### 4.1. Static Tables
Standard Markdown tables are rendered as visual grids.
```markdown
| Month | Target |
|---|---|
| Jan | 100 |
```

### 4.2. Dynamic Tables
Allows users to add/remove rows dynamically.
```markdown
[dynamic-table:items]
| No | Item Name | Price |
|---|---|---|
| [autonum:no] | [text:item] | [number:price] |
```

### 4.3. Master Data Tables
Defined at the bottom of the document to provide data for `search` fields.
```markdown
[master:vendors]
| ID | Name |
|---|---|
| V01 | Apple Inc |
| V02 | Google LLC |
```

## 5. Attributes (Modifiers)
Attributes are written inside parentheses `(...)` after the ID.

| Attribute | Example | Effect |
| :--- | :--- | :--- |
| `placeholder` | `(placeholder="YYYY/MM/DD")` | Shows ghost text in the field. |
| `align` | `(align:R)` | Text alignment (L, C, R). |
| `copy` | `(copy:source_id)` | Auto-copies value from another field. |
| `suggest` | `(suggest:column)` | Suggests values based on previous entries. |
| `formula` | `(formula="a + b")` | Define logic for `calc` fields. |

## 6. Page Structure
Use standard headers to organize your form into tabs or sections.

*   `# H1`: Form Title
*   `## H2`: Tab Name (Creates a tabbed navigation if multiple H2s exist)
*   `### H3` and below: Section headers within a page.
