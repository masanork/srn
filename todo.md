# SRN v2.0 Project TODO List

This list tracks the implementation status of the next-generation architecture features outlined in `issues.md` and `docs/PROPOSED_ARCHITECTURE_POLICY.md`.

## 1. Identity & Authority
- [ ] **Multi-tier Key Management**: Implement offline Root Key -> online Delegate Key signing workflow.
- [ ] **Authority Model**: Define and implement the "Trust Registry" or "Centralized Signing Proxy" PoC for municipality integration.
- [x] **did:web Migration**: Transition from ephemeral `did:key` to stable domain-anchored identity.

## 2. VC Standards (W3C 2.0)
- [ ] **Data Model v2.0**: Update `@context` and core properties (e.g., `validFrom`) to match the latest W3C 2.0 draft/recommendation.
- [ ] **Enveloping Signatures**: Implement JOSE (JWT/JWP) wrapper for hybrid credentials.
- [ ] **Revocation**: Transition from build-level revocation to bitstring-based individual VC revocation.

## 3. Presentation & Integrity
- [x] **Native IVS Handling**: Native Cmap Format 14 injection for perfect typography without PUA.
- [x] **C2PA Integration**: Prototype "Verified Font" by injecting COSE provenance manifest (SRNC table) into subsetted fonts.
- [ ] **Rendered HTML Integrity**: Extend C2PA to sign the rendered HTML structure hash alongside the data. (Partial: Juminhyo instance VC includes HTML+JSON-LD digests; C2PA binding pending.)

## 4. Privacy & Security
- [ ] **Selective Disclosure**: Implement SD-JWT Support for privacy-preserving attribute sharing.
- [ ] **Holder Binding**: Integrate WebAuthn (Passkeys) for cryptographically linking the VC to the user's device.

## 5. Performance & Post-Quantum
- [x] **Hybrid Signatures**: Production-ready Ed25519 + ML-DSA-44 hybrid signing.
- [ ] **Binary Transport**: PoC for COSE/CBOR encoding to optimize large PQC signature transport.

## 6. Documentation & DX
- [ ] Formalize the `did:web` resolution server/helper for verifiers.
- [ ] Create a "Deployment Guide" for municipalities using the SRN SSG.
