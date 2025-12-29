---
title: "Concept Paper: Web/A Folio - The Digital Portfolio"
layout: article
author: "Sorane Project"
date: 2025-12-27
description: "A concept for separating data from intelligence, acting as a user-centric data container."
ai_generated: true
---

# Concept Paper: Web/A Folio - The Digital Portfolio

> **Not a Wallet, but a Folio.**

**Web/A Folio** is a concept for a "storage area for user data" within the Web/A Form ecosystem.
Going beyond the financial and asset management connotations of a traditional "Digital Wallet," it acts as a user-sovereign data container that integrally manages personal activity history, created documents, and identity-proving keys.

## Vision & Adoption Path

The vision is to turn painful, error-prone document workflows into a single,
verifiable handoff from a Folio. Two scenarios are especially compelling:

1. **Onboarding paperwork**: Large bundles of employment forms, often requiring
   family member IDs, multiple attachments, and repeated data entry.
2. **Tax filing**: A future where tax offices and financial institutions
   (banks, brokerage, insurance, credit cards) expose Web/A-based statements,
   and a Folio can assemble a complete filing in one pass.

These mission-critical domains require high assurance. The adoption path should
start with low-risk use cases (e.g., casual event scheduling or simple forms),
then scale toward professional workflows, and finally reach public and legal
submission flows once reliability is proven.

## Trust Levels & Canonical Formats (LoA)

Web/A Folio should make the **origin and trust level** of data explicit. A
useful rule is to map the canonical format to the Level of Assurance (LoA):

- **LoA 1 (self-asserted)**: Canonical format is human-readable text. JSON and
  indexes are derived artifacts for automation.
- **LoA 2+ (verified)**: Canonical format is machine-readable (JD-JSON or
  verifiable credentials). Human-readable text is a derived view.

When a user edits LoA 2+ data, the verified status is **invalidated**. The
system should guide the user to either:

- Re-issue the data as **LoA 1** (self-asserted replacement), or
- Re-acquire a new verified document and restore LoA 2+ status.

This separation preserves trust for verified data while keeping user-driven
maintenance practical for everyday records.

## Assistance Programs & Policy Matching

Folio is not only a store of personal data. It can also hold **policy and
program data** that a person might want to access (e.g., support programs,
eligibility rules, application requirements).

An AI agent can then match:

- The person's profile and stated concerns,
- The policy/program datasets in the Folio,

to provide guidance and recommend the most appropriate applications or support
options.

This makes Folio a **decision-support workspace**, not just a filing cabinet.

## Reference Implementation & Interoperability

Web/A Folio should be backed by a **reference implementation** and a baseline
test suite so independent implementations can remain interoperable.

## Related Documents

- [Folio CLI Design Doc](./web-a-folio-cli.html)

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

### 6.1. Web/A Folio CLI (Draft)

The initial CLI focuses on **local, file-based workflows**. The goal is to standardize the file layout and provide reliable audit and verification helpers.

#### Core Commands (Proposed)

```bash
# Initialize a new folio
weba-folio init ./MyFolio

# Index and refresh derived caches (.index/)
weba-folio index ./MyFolio

# Import a Web/A document into the folio
weba-folio import ./MyFolio ./incoming/form.html --into inbox

# Generate a verifiable presentation from the folio
weba-folio present ./MyFolio --from certificates/degree.html --out out/presentation.html

# Verify a document or presentation
weba-folio verify ./MyFolio ./out/presentation.html
```

#### Output and Artifacts
- **Folio Layout**: A deterministic folder structure (see Section 4).
- **Index Cache**: `.index/` contains derived data only (rebuildable).
- **Audit Log**: `logs/folio.log` records operations (imports, presents, verifications).

#### Security Notes (Draft)
- The CLI should never export private keys. It only references passkey-backed credentials.
- Verification must be offline-capable when all artifacts are local.
- All generated presentations should include a `layer1_ref` to bind to the source template.

#### Threat Model (Draft)
- **Local Compromise**: If the device is compromised, the folio is exposed.
- **Cloud Vendor Lock-In**: Prevented by keeping files portable and readable.
- **Metadata Leakage**: Mitigated by minimizing index metadata and allowing cache purge.

## 7. Identity Assurance: Holder Binding via National ID

In a general web environment, **PassKey (WebAuthn)** is the de facto standard for secure hardware-level key management. However, while a PassKey is secure, it does not inherently prove "who" the holder is.
To bridge this gap without the complexity of full-scale government ID "VC-ification," Web/A Folio implements **Holder Binding**. This mechanism cryptographically links a locally-generated PassKey to an existing high-assurance identity, such as a national ID.

1.  **PassKey Generation**: Generate a PassKey pair on the user's device (smartphone or PC).
2.  **Identity Linking**: Use the qualified signing certificate of a national ID card to sign the public key of the new PassKey.
3.  **Binding Proof**: Store this signature as a "Binding VC" in the Folio. This proof states: "The holder of this national ID credential has authorized this specific PassKey."
4.  **Presentation**: When presenting any other certificate (e.g., a degree or a residence permit), the user signs the presentation (VP) with the PassKey and includes the Binding Proof.

This architecture enables **indirect identity proof**: daily operations are completed with simple biometric authentication (PassKey), while the signature chain provides a cryptographic link back to the government-issued identity without needing to store the full government ID in the Folio.

## 8. Why Not "Wallet"?

*   **Agency**: A Wallet is a "place to put things," but a Folio becomes a "place to work" when combined with an Agent.
*   **Versatility**: It handles not only financial assets but also all "documents" of life, such as applications, contracts, works, and health check results.
*   **Affinity**: For Web/A Form, which is a file-based architecture, the folder analogy (portfolio) is the most natural.
