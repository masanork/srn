# SRN v3.0 Project TODO List

Prioritized tasks for Folio CLI and Web/A Ecosystem. Focus: Local-First, SQLite-backed metadata management, and Assisted Filling.

## 1. Folio CLI: Data Management (Local First)
- [ ] **SQLite Integration**: Implement `folio db init` to create a local SQLite database for indexing Web/A files.
- [ ] **Ingest Command**: Implement `folio ingest <dir>` to scan HTML files, extract JSON-LD/Frontmatter, and index metadata (Sender, Schema, Date, Fields) into SQLite.
- [ ] **Query Command**: Implement `folio ls` or `folio query` to search indexed documents by metadata.

## 2. Assisted Filling (Input Intelligence)
- [ ] **Field Analysis**: Analyze indexed documents to identify common fields (Name, Address, etc.) and their values.
- [ ] **Profile Generation**: Create a `profile.json` or similar from aggregated specific past submissions.
- [ ] **Auto-Fill Injection**: Implement logic to inject profile data into new Web/A forms (via CLI or Browser extension/bookmarklet).

## 3. Web/A Form (Core)
- [x] **Infinite Canvas UX**: Flat design, sticky toolbar.
- [x] **Client Validation**: `required` check, submit button control.
- [ ] **Mobile Optimization**: Touch-friendly layouts, software keyboard adjustments.

## 4. Identity & Trust
- [x] **Hybrid Signatures**: Ed25519 + ML-DSA-44.
- [ ] **Trust Store Embedding**: Inject issuer DIDs for offline verification.
- [ ] **L3 Prunable Hash Chain**: Audit trail implementation.

## 5. Deprioritized / Future
- [ ] **Remote Server (Post)**: Async architecture, Object Storage.
- [ ] **Selective Disclosure**: SD-JWT.

