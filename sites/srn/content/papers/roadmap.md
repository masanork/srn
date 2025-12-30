---
title: "Web/A Roadmap — Towards Social Implementation of Loosely Coupled Trust"
layout: article
author: "Sorane Project"
date: 2024-12-31
description: "Phased evolution of the Web/A ecosystem, Folio development plans, and technical vision for social integration."
ai_generated: true
---

## 1. Overall Roadmap: Phased Evolution

The Web/A ecosystem is not a single product but a collection of protocols and reference implementations developing through the following phases.

### Phase 0: POC & Core Specification (Present)
*   **Web/A Format**: Defining the core protocol (HTML5 + JSON-LD + PQC signatures).
*   **Maker & SSG**: Implementing the Sorane static site generator to create Web/A documents from Markdown.
*   **Web/A Form & L2E**: Reference implementation for interactive forms and recipient-only encryption.

### Phase 1: Developer & AI Agent Empowerment
*   **Folio CLI / MCP**: Providing interfaces for AI agents (Gemini, Claude, etc.) to read, write, and verify documents within a Folio.
*   **Integration SDK**: Developing libraries to integrate Web/A signatures and verification badges into existing web apps with a few lines of code.
*   **Automation of Verification**: Providing tools for automated HMP (Human-Machine Parity) audits in CI/CD pipelines.

### Phase 2: Ecosystem Integration & BYOA (Bring Your Own AI Agent)
*   **Folio Service Integration**: Assisting service providers (Account Aggregators, etc.) with extensive customer bases in integrating Folio functionality into their infrastructure.
*   **Autonomous Response Protocols**: Advanced autonomous message processing by Web/A Post in the owner's absence.
*   **Heterogeneous Federation**: Establishing identity federation and secure evidence exchange between different Post implementations.

### Phase 3: Public Infrastructure & Large-scale Deployment
*   **G2G/B2G Standardization**: Defining common profiles for official evidence exchange across government, municipal, and private sectors.
*   **Legal Validity & Authenticity**: Establishing social consensus on digital authenticity through integration with timestamp authorities and e-Seals.
*   **Long-term Verification (LTV) Infra**: Ensuring multi-decade verification through re-signing mechanisms and continuous archival readability in standard browsers.

---

## 2. Web/A Folio: Roadmap

Folio is a "Digital Briefcase" for users to manage their own evidence and history.

### 2.1. Local Tooling Phase (Present)
*   **Form**: CLI, IDE extensions, etc.
*   **Target**: Developers, power users.
*   **Focus**: Automating document organization, pre-filling, and authenticity verification via AI agents (using MCP).

### 2.2. Library & Integration Phase (Mid-term)
*   **Form**: Mobile SDKs, Browser extensions.
*   **Target**: Existing service providers, businesses seeking to improve application UX.
*   **Focus**: Plugging Folio "Storage & Signing" capabilities into existing portal and wallet apps.

### 2.3. Interoperable Public Infrastructure Phase (Long-term)
*   **Form**: Interoperable, provider-agnostic document repositories.
*   **Target**: All individual and corporate digital identity holders.
*   **Focus**: Enabling seamless document mobility across different Folio providers and public-grade proof of identity via Passkey-to-National ID "Holder Binding."

---

## 3. Technical Vision: Automation via BYOA

Web/A does not mandate the use of any specific vendor's AI.
Our vision is a world where users bring their own "Personal AI Agent" that manages their Folio and interacts with the Posts (windows) of governments and enterprises to handle all procedures autonomously.

In this future, Web/A serves as the **Common Digital Fabric** that allows AI to read "data that does not lie" and leave "verifiable evidence" for its own actions.
