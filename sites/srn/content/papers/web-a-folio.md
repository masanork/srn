---
title: "Concept Paper: Web/A Folio - The Digital Portfolio"
layout: article
author: "Sorane Project"
date: 2025-12-27
description: "A concept for separating data from intelligence, acting as a user-centric data container."
---

# Web/A Folio: Separating Data from Intelligence

> **Not a Wallet, but a Folio.**

**Web/A Folio** is a concept for a "storage area for user data" within the Web/A Form ecosystem.
Going beyond the financial and asset management connotations of a traditional "Digital Wallet," it acts as a user-sovereign data container that integrally manages personal activity history, created documents, and identity-proving keys.

## 1. Concept: Decoupling Data and Intelligence

The core of Web/A Folio lies in the **complete separation of "Data (Folio)" and "Intelligence (Agent)"**.

*   **The Folio (Data)**: Static and persistent assets. It exists simply as a "folder" on the user's PC or cloud storage. It is never locked into a specific vendor or application.
*   **The Agent (Intelligence)**: Dynamic and interchangeable intelligence. Users can "hire" the most suitable AI (e.g., Gemini, Claude, ChatGPT, or local LLMs) for the task at hand, granting it access to their Folio to perform work.

Users carry their Folio with them and can switch Agents as needed.

### Exception and Optimization: Indexing for AI

In principle, data within the Folio should be Human-Readable. However, to improve search speed as the number of files increases and to accelerate the Agent's context understanding, maintaining **machine-optimized indexes or databases** is permitted as an exception.

*   **Cache as Artifact**: These are strictly positioned as "caches" or "derivatives" generated from the original data (HTML, etc.). Even if deleted, they must be reconstructible by the Agent re-scanning the HTML.
*   **Hidden by Default**: To avoid interfering with the user's daily browsing, it is desirable to place them in hidden directories like `.index/` or `.cache/`.

## 2. Principle: Balancing Readability and Machine-Readability

In accordance with the philosophy of Web/A Form, every file stored in the Folio should possess both **"Human-Readability"** and **"Machine-Readability" (Agent-Processable)**.

*   **No Black Boxes**: Specialized binary formats or developer-only JSON/XML configuration files should be avoided as much as possible.
*   **HTML as a Container**: Profile information and certificates should primarily be HTML files that can be viewed as "cards" or "certificates" when opened in a browser. By including structured data such as JSON-LD internally, readability for Agents is ensured.

## 3. Philosophy: From API Integration to Person-Centric Integration

The idea that "connecting systems via APIs will solve everything" often hits a wall in reality. If $N$ services try to interconnect, the number of connections explodes to $N \times (N-1) / 2$, and the costs of contracts, specification adjustments, and maintenance increase exponentially (the impossibility of full-mesh connection).

Web/A Folio proposes an **architecture where the "Person (User)" acts as the hub of data integration**.

1.  **$O(N)$ Connection Cost**: All services only need to output data to the "Person (Folio)" and receive data from the Person. Direct service-to-service integration becomes unnecessary.
2.  **restoration of Responsibility and Consent**: In API integration, data flows automatically in the background, making user involvement tenuous. In the Folio model, data always passes through the "Person's" hands, and is passed to the other party only after the person has checked the contents and signed (consented).
3.  **AI Readiness**: The cost for AI to learn proprietary APIs of each company is high. However, the skill of "reading HTML documents in a Folio" is universal. By using human-facing interfaces (readable documents) directly as AI input, the barrier to introducing AI agents can be drastically lowered.

## 4. Directory Structure (Mental Map)

Web/A Folio assumes a structure like the following on the file system. This also functions as a standard schema (Context Schema) for Agents to understand the user's context.

```text
MyFolio/
├── .index/            # [Exception] Search indexes and vector DBs for AI (Cache)
│   ├── vectors.db
│   └── knowledge_graph.json
├── profile.html       # Basic 4 info. Looks like a "Business Card" or "ID Card" in a browser.
├── keys/              # Keys for authentication/signing (Public Key Certs). Private keys are often in hardware.
├── history/           # Past Web/A Forms created/submitted. All viewable as HTML.
│   ├── 2024-01_workcert.html
│   └── 2023-03_tax_return.html
├── certificates/      # Certificates issued by third parties (VC). Viewable as "Awards" or "Diplomas".
│   ├── degree.html
│   └── residence.html
└── inbox/             # Empty forms to be filled/processed
    └── new_application_form.html
```

## 5. Workflow: Agent-Assisted Filling

1.  **Throw in**: The user throws a Web/A Form that needs filling into `inbox/`.
2.  **Attach Agent**: The user grants access to their Folio to their preferred AI Agent (e.g., Gemini).
3.  **Context Retrieval**: The Agent reads `history/` (past history) and `certificates/` (qualifications) to understand the user's context.
4.  **Auto-Fill**: Based on the context, the Agent fills out the form in `inbox/`.
    *   If there is a similar form in the past, it mimics the writing style.
    *   If a certificate is required for a field, it generates and attaches an appropriate VP from `certificates/`.
5.  **Sign & Verify**: Finally, the user reviews the content, signs it using keys in `keys/` (e.g., PassKey authentication), and completes the process.

## 6. Implementation and Security

The reference implementation of Web/A Folio is a set of command-line tools (CLI) that run on the user's local environment.
However, this does not prevent third parties from providing Folio hosting services on the server side. In fact, from the perspective of advanced security measures and backups, a cloud environment provided by a trusted administrator might be the "mainstream" solution.

However, since the Folio gathers information that can be called a person's entire life history, data concentration in a specific company should be avoided. An ecosystem where users can freely choose and change where to place their Folio (local or which cloud) is essential.

## 7. Establishing Identity: PassKey × National ID Signatures

In a general web environment, **PassKey (WebAuthn)** is the de facto standard for secure hardware-level key management. However, a PassKey alone cannot prove "whose key it is" to a third party.
Many countries issue **national ID cards or eID schemes with qualified signing certificates**, so Web/A Folio adopts a model that binds a PassKey to a government-backed signing credential.

1.  **PassKey Generation**: Generate a PassKey pair on the user's device (smartphone or PC).
2.  **Identity Binding**: Sign the public key of the generated PassKey using the national ID signing certificate (for example, a digital signature certificate on a national ID card).
3.  **Ownership VC**: Create a self-signed Verifiable Credential (VC) stating "This PassKey public key is managed by me, the holder of the national ID credential," and store it in the Folio.
4.  **Presentation**: When submitting a form, include this VC as a Verifiable Presentation (VP), sign it with the PassKey, and send it.

This allows daily operations to be completed with just biometric authentication (Touch ID/Face ID) while indirectly proving identity equivalent to the national ID through the signature chain.

## 8. Why Not "Wallet"?

*   **Agency**: A Wallet is a "place to put things," but a Folio becomes a "place to work" when combined with an Agent.
*   **Versatility**: It handles not only financial assets but also all "documents" of life, such as applications, contracts, works, and health check results.
*   **Affinity**: For Web/A Form, which is a file-based architecture, the folder analogy (portfolio) is the most natural.
