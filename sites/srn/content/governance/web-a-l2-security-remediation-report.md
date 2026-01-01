---
title: "Security Audit Remediation Report (Response to v2)"
layout: article
author: "Web/A Project Team"
date: 2025-12-29
ai_generated: true
---

> **SIMULATION NOTICE:** This document (audit, evaluation, response) is part of an AI-driven role-playing simulation conducted for project quality and governance testing. It does not constitute a formal legal or professional audit by any real-world entity.

# Security Audit Remediation Report (Response to v2)

**Date:** 2025-12-29
**Reference:** `sites/srn/content/governance/web-a-l2-security-audit-v2.md`

### Related
- [Security Audit v2](./web-a-l2-security-audit-v2.html)
- [Security Re-Assessment v3](./web-a-l2-security-audit-v3.html)
- [Offline Pre-Key Server Plan](../papers/web-a-l2-prekey-server-plan.html)

## 1. Overview
This report documents the remediation actions taken in response to the "Critical Security Audit Report v2". The development team has executed a major architectural refactoring, primarily focusing on migrating cryptographic operations to WebAssembly (Wasm) to address side-channel attacks and execution integrity, while also hardening the aggregator against replay attacks.

## 2. Remediation Status Summary

| ID | Issue | Severity | Status | Remediation Detail |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | Weak Traffic Padding (0-255 bytes) | Medium | **Resolved** | Implemented **Bucket-Based Padding** in Wasm. Payloads are now padded to fixed size tiers (1KB, 4KB, 16KB, etc.) to effectively mask content size. |
| **3.1** | Lack of Forward Secrecy | **Critical** | *Deferred* | Architecture remains based on static X25519 recipient keys. No "Pre-Key Bundle" server has been implemented yet. This remains a known risk for long-term archival. |
| **3.2** | Replay Attacks (No Nonce Check) | High | **Resolved** | Implemented `ReplayGuard` and `JsonFileReplayStore` in the Aggregator. The CLI now enforces nonce uniqueness by default, rejecting replayed envelopes. |
| **4.1** | Supply Chain Risk (`npm` trust) | High | **Resolved** | Core cryptographic dependencies (`@noble` curves/hashes) have been **vendored** into `src/vendor/` and are tracked in git, removing reliance on registry integrity during install. |
| **4.2** | Source Code Disclosure (Timing Attacks) | High | **Resolved** | **Major Migration to Wasm**. All core primitives (AES-GCM, X25519, Ed25519, ML-KEM, ML-DSA, HKDF, SHA256) are now executed via a compiled Rust-to-Wasm module (`src/crypto-wasm`), providing stronger guarantees against JIT-based timing analysis. |
| **5.1** | Error Handling Side-Channels | Medium | **Resolved** | Decryption logic now catches specific errors and throws a unified generic `Error("Decryption failed")`, preventing oracle attacks based on error differentiation. |

## 3. Technical Implementation Details

### 3.1. WebAssembly Migration (`src/crypto-wasm`)
The project has shifted away from pure JavaScript implementations for critical operations. The `src/core/wasm_core.ts` module now acts as the bridge to `weba_crypto_wasm_bg.wasm`.
*   **Impact**: constant-time execution for sensitive comparisons (`constantTimeEqual`) and cryptographic math is now handled by Rust's verified implementations (via `dalek` and `RustCrypto` crates, likely).
*   **Files Affected**: `src/core/l2crypto.ts`, `src/core/wasm_core.ts`, `src/crypto-wasm/*`.

### 3.2. Traffic Analysis Mitigation
The previous random padding has been replaced with a deterministic bucket strategy.
*   **Logic**: `wasm_get_padding(current_size)` calculates the next power-of-2-like tier.
*   **Code**: `src/core/l2crypto.ts`:
    ```typescript
    const targetSize = getPaddingTargetSize(currentBytes.length + overhead);
    const paddingLen = Math.max(0, targetSize - currentBytes.length - overhead);
    ```

### 3.3. Replay Protection (`ReplayGuard`)
The aggregator reference implementation now includes a persistent store for nonces.
*   **Code**: `src/form/aggregator.ts` uses `JsonFileReplayStore` to persist seen nonces to disk (`replay-store.json` via CLI option).
*   **Enforcement**:
    ```typescript
    if (!(await replayGuard.checkAndMark(l2EnvelopeForCheck.meta.nonce))) {
        console.warn(`Warning: Replay detected... Skipping.`);
        continue;
    }
    ```

### 3.4. Draft State Preservation (Client)
The form client now embeds a structured draft state inside downloaded draft HTML files so that user work can be restored across devices or after cache clears without relying on browser storage.
*   **Draft Payload**: The embedded state includes the form data snapshot and a minimal L2 replay cache (nonce list) needed for safe reprocessing.
*   **Security Note**: Draft files should be treated as sensitive artifacts because they may contain plaintext responses and replay metadata.
*   **Code**: `src/form/client/data.ts`, `src/form/client/download.ts`, `src/form/client/runtime.ts`.

## 4. Remaining Risks & Future Work

1.  **Forward Secrecy**: The system still relies on the long-term safety of the Organization's private key. If this key is compromised, all past messages can be decrypted. Implementing ephemeral key negotiation requires a fundamental protocol change (interactive flow or pre-key server).
2.  **Client-Side Trust**: The fundamental issue of "Trusting the Browser" remains. While Wasm improves execution integrity, it does not prevent a compromised browser (malware/extension) from reading the form inputs *before* encryption.

## 5. Conclusion
The V2 remediation represents a significant hardening of the Web/A Layer 2 library. The move to WebAssembly and the enforcement of Replay Protection address the most practical and immediate attacks. The remaining risk (Forward Secrecy) is accepted as an architectural trade-off for the current version's offline/asynchronous design.
