# 🗺️ Web/A & Folio Project Roadmap

This document tracks the high-level development status, architectural decisions, and future milestones for the Sorane (SRN) ecosystem.

## 🚀 Current Status (2025-12-30)

| Component | Status | Highlights |
| :--- | :--- | :--- |
| **SRN (SSG)** | Stable (v2) | Hybrid PQC signatures, Native IVS, Web/A consolidation. |
| **Web/A Form** | Production | Hosted within SRN site; Guest DID submission enabled. |
| **Folio (Client)** | Beta | CLI for sync/send/admin, VC-enabled transport, Hybrid DIDs. |
| **Folio (Remote)** | Production | Firebase Functions (WASM enabled), VC-based Authorization. |
| **Infrastructure**| Production | Firebase Functions/Hosting, Rust/WASM Cryptography. |

---

## 🛠️ Ongoing & Upcoming Milestones

### 1. Identity & Credentials (High Priority)
- [x] **Guest DID (Passkeys)**: Native WebAuthn integration for identity-less users.
- [x] **Guest DID Messaging**: `guestPostMessage` mutation for Passkey-authenticated submissions.
- [x] **VC-based Authorization**: JCS-based Access Passes for decentralized access control.
- [ ] **Passkey-based VC Binding**: Linking W3C Verifiable Credentials to hardware keys.
- [ ] **Revocation List v2**: High-performance bitstring revocation for municipality-scale DIDs.

### 2. Folio: The Personal Data Container
- [x] **Secure Remote Deployment**: Deployed to `asia-northeast1` with Strict Mode enabled.
- [x] **Admin Onboarding Flow**: `join.md` form for self-service account requests.
- [x] **End-to-End Verification**: Tested `admin add-user` → `transport send` → `sync` workflow.
- [ ] **Key Rotation**: Automated rotation for Delegate Keys within the Folio.
- [ ] **Cross-Device Sync**: Secure migration protocol for Folio folders.

### 3. AI & Agent Intelligence (MCP)
- [x] **Basic Form Tools**: Parse and fill Web/A forms via LLM.
- [ ] **Inbox Intelligence**: Summarization and action-recommendation for new messages.
- [ ] **Security Verifier**: AI-driven pre-flight checks for encryption and signing status.

### 4. Post-Quantum & Standards
- [x] **Hybrid Signatures (ML-DSA-44)**: Ensuring long-term authenticity.
- [x] **Hybrid DIDs**: Dual-key (Ed25519 + ML-DSA-44) implementation in Folio.
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
