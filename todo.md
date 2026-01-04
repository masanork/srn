# SRN v3.0 Project TODO List

Prioritized tasks for Folio CLI and Web/A Ecosystem. Focus: Local-First, SQLite-backed metadata management, and Assisted Filling.

## 1. Folio CLI: Data Management (Local First)
- [x] **SQLite Integration**: Implement `folio db init` to create a local SQLite database for indexing Web/A files. (Implemented as `folio init`)
- [x] **Ingest Command**: Implement `folio ingest <dir>` to scan HTML files, extract JSON-LD/Frontmatter, and index metadata (Sender, Schema, Date, Fields) into SQLite.
- [x] **Query Command**: Implement `folio ls` or `folio query` to search indexed documents by metadata.

## 2. Assisted Filling (Input Intelligence)
- [x] **Field Analysis**: Analyze indexed documents to identify common fields (Name, Address, etc.) and their values.
- [x] **Profile Generation**: Create a `profile.json` or similar from aggregated specific past submissions.
- [x] **Auto-Fill Injection**: Implement logic to inject profile data into new Web/A forms (via CLI or Browser extension/bookmarklet). (CLI implementation complete)

## 3. Web/A Form (Core)
- [x] **Infinite Canvas UX**: Flat design, sticky toolbar.
- [x] **Client Validation**: `required` check, submit button control.
- [ ] **Mobile Optimization**: Touch-friendly layouts, software keyboard adjustments.

## 4. Identity & Trust
- [x] **Hybrid Signatures**: Ed25519 + ML-DSA-44.
- [x] **Passkey (P-256) Support**: Implement P-256 key generation (`did create --type p256`) and VP signing (`presentation create`) to simulate Passkey-bound credentials.
- [x] **JPKI Binding**: Implement `did bind-jpki` to create a KeyBindingStatement signed by JPKI (Simulation/Real), linking Passkey to National ID.
- [ ] **Trust Store Embedding**: Inject issuer DIDs for offline verification.
- [ ] **L3 Prunable Hash Chain**: Audit trail implementation.

## 5. Deprioritized / Future
- [ ] **Remote Server (Post)**: Async architecture, Object Storage.
- [ ] **Selective Disclosure**: SD-JWT.

