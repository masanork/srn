# 🗺️ Web/A & Folio Project Roadmap

This document tracks the high-level development status, architectural decisions, and future milestones for the Sorane (SRN) ecosystem.

## 🚀 Current Status (2025-12-30)

| Component | Status | Highlights |
| :--- | :--- | :--- |
| **SRN (SSG)** | Stable (v2) | Hybrid PQC signatures, Native IVS, C2PA prototype. |
| **Web/A Form** | Production Ready | L2 Encryption, Passkey (Guest DID) Auth v13. |
| **Folio (Client)** | Early Prototype | CLI for sync/send, MCP Server integration. |
| **Infrastructure**| Beta | Firebase Functions/Hosting, simplewebauthn v13. |

---

## 🛠️ Ongoing & Upcoming Milestones

### 1. Identity & Credentials (High Priority)
- [x] **Guest DID (Passkeys)**: Native WebAuthn integration for identity-less users.
- [ ] **Passkey-based VC Binding**: Linking W3C Verifiable Credentials to hardware keys.
- [ ] **Revocation List v2**: High-performance bitstring revocation for municipality-scale DIDs.

### 2. Folio: The Personal Data Container
- [ ] **Guest DID Integration**: CLI support for managing and syncing Guest DID inboxes.
- [ ] **Key Rotation**: Automated rotation for Delegate Keys within the Folio.
- [ ] **Cross-Device Sync**: Secure migration protocol for Folio folders.

### 3. AI & Agent Intelligence (MCP)
- [x] **Basic Form Tools**: Parse and fill Web/A forms via LLM.
- [ ] **Inbox Intelligence**: Summarization and action-recommendation for new messages.
- [ ] **Security Verifier**: AI-driven pre-flight checks for encryption and signing status.

### 4. Post-Quantum & Standards
- [x] **Hybrid Signatures (ML-DSA-44)**: Ensuring long-term authenticity.
- [ ] **Binary COSE VCs**: Optimizing for size and mobile transport.
- [ ] **C2PA Maturity**: Formalizing the font provenance manifest (SRNC).

---

## 📜 Design Principles (Policy)
- **Typographic Integrity**: No layout shift, no font substitution.
- **Privacy by Design**: Mandatory L2 encryption for sensitive payload.
- **Longevity**: Standard JSON-LD/HTML binding ensures 10+ years of verify-ability.
- **User Agency**: The Folio (data container) belongs to the user, not the server.

---
*Last Updated: 2025-12-30*
