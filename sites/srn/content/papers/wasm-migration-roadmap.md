---
title: "Roadmap: Progressive WASM Migration for Crypto Core"
layout: article
author: "Web/A Security Team"
date: 2025-12-29
---

# Progressive WASM Migration Roadmap

To enhance security (side-channel resistance) without compromising development velocity or quality, we adopt a phased migration of the Layer 2 Encryption core from TypeScript to Rust/WebAssembly.

## Phase 1: Infrastructure & Primitive Bridge (Current)
- **Goal**: Establish the Rust build pipeline and a minimal bridge.
- **Tasks**:
  - [ ] Initialize `weba-crypto-wasm` Rust crate.
  - [ ] Configure `wasm-pack` or equivalent for Bun integration.
  - [ ] Implement constant-time comparison in Rust as the first WASM export.
- **Verification**: Ensure Bun tests can call WASM functions.

## Phase 2: AEAD & Padding (High Impact)
- **Goal**: Move the most sensitive encryption/decryption logic to Rust.
- **Tasks**:
  - [ ] Port `encryptLayer2` and `decryptLayer2` (AES-GCM loop) to Rust using `aes-gcm` crate.
  - [ ] Implement "Bucket Padding" logic in Rust to ensure memory-level size hiding.
- **Verification**: Run `tests/l2crypto.test.ts` with both TS and WASM engines to ensure 100% parity.

## Phase 3: KEM & PQC (Post-Quantum Alignment)
- **Goal**: Secure the key exchange process.
- **Tasks**:
  - [ ] Port `X25519` key derivation to Rust (`ed25519-dalek` or `curve25519-dalek`).
  - [ ] Port `ML-KEM` (Kyber) wrapper to Rust.
- **Verification**: Full round-trip tests for hybrid PQC.

## Phase 4: Signature Verification (Identity Proofing)
- **Goal**: Move Ed25519 verification to Rust.
- **Tasks**:
  - [ ] Port `signLayer2` and `verifyLayer2Signature` to Rust.
- **Verification**: Verify VCs and Web/A documents using the Rust core.

## Quality Assurance Policy
1. **Test Parity**: For every migrated function, the existing TypeScript test suite must pass without modification.
2. **Performance Benchmarking**: Monitor bundle size and execution time. WASM should be used where security (constant-time) is more important than raw speed for small payloads.
3. **Dual-Stack Support**: Keep a TypeScript fallback for environments where WASM is restricted, but clearly mark WASM as the "Security Preferred" mode.
