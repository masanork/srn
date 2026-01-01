# 🗺️ Web/A & Folio Project Roadmap

This document tracks the high-level development status, architectural decisions, and future milestones for the Sorane (SRN) ecosystem.

## 🚀 Current Status (2025-12-31)

| Component | Status | Highlights |
| :--- | :--- | :--- |
| **SRN (SSG)** | Stable (v2) | Hybrid PQC signatures, Native IVS, **4-Layer Trust Model**. |
| **Web/A Form** | Production | **L2 Encryption** enabled; **Document Stating Process** introduced. |
| **Folio (Client)** | Beta | CLI for sync/send/admin, VC-enabled transport, Hybrid DIDs. |
| **Folio (Remote)** | Production | Firebase Functions (WASM enabled), VC-based Authorization. |
| **Web/A Post** | **Prototype** | **Intelligent Postal Hub** logic; **Hono**-based server; Storage abstraction. |
| **Infrastructure**| Production | Firebase Functions (Node), Cloudflare (Edge ready), Rust/WASM Crypto. |

---

## 🛠️ Ongoing & Upcoming Milestones

### 1. Web/A Post (Intelligent Agent) (Active)
- [x] **Core Logic**: `PostalHub` with role-based routing (Admin/Member/Guest/Visitor) and rule engine.
- [x] **Server Architecture**: **Hono** implementation supporting both Bun (Local) and Edge runtimes.
- [x] **Storage Abstraction**: `IPostalStorage` interface with `LocalFileStorage` implementation.
- [ ] **Cloud Storage Adapters**: Implement D1 (Cloudflare) and Firestore (Firebase) adapters.
- [ ] **Client Integration**: Update `folio` CLI to interact with the new Post server (Inbox/Outbox).
- [ ] **Federation**: Enable server-to-server communication (DID resolution & forwarding).

### 2. Identity & Credentials
- [x] **Guest DID (Passkeys)**: Native WebAuthn integration for identity-less users.
- [x] **Guest DID Messaging**: `guestPostMessage` mutation for Passkey-authenticated submissions.
- [x] **VC-based Authorization**: JCS-based Access Passes for decentralized access control.
- [x] **Capability Delegation**: Chain of authority (Admin -> User -> Agent) for acting on behalf of others.
- [x] **CIV Secure Messaging (BAC)**: 3DES ISO 7816-4 wrapper for ePassport
  APDU encryption and response MAC validation.
- [ ] **Passkey-based VC Binding**: Linking W3C Verifiable Credentials to hardware keys.
- [ ] **Revocation List v2**: High-performance bitstring revocation for municipality-scale DIDs.

### 3. AI & Agent Intelligence (MCP)
- [x] **Basic Form Tools**: Parse and fill Web/A forms via LLM.
- [ ] **Inbox Intelligence**: Summarization and action-recommendation for new messages.
- [ ] **Security Verifier**: AI-driven pre-flight checks for encryption and signing status.

### 4. Post-Quantum & Standards
- [x] **Hybrid Signatures (ML-DSA-44)**: Ensuring long-term authenticity.
- [x] **Hybrid DIDs**: Dual-key (Ed25519 + ML-DSA-44) implementation in Folio.
- [ ] **Binary COSE VCs**: Optimizing for size and mobile transport.
- [ ] **C2PA Maturity**: Formalizing the font provenance manifest (SRNC).
- [ ] **Quality Control**: Implementing the formal **Document Stating Process** with Red Team feedback loops.

---

## 📜 Design Principles (Policy)
- **Typographic Integrity**: No layout shift, no font substitution.
- **Privacy by Design**: Mandatory L2 encryption for sensitive payload.
- **Longevity**: Standard JSON-LD/HTML binding ensures 10+ years of verify-ability.
- **User Agency**: The Folio (data container) belongs to the user, not the server.

---
*Last Updated: 2025-12-31*
