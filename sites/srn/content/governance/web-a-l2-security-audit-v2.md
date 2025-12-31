---
title: "Critical Security Audit Report v2: Web/A Layer 2 Encryption"
layout: article
author: "Web/A Security Audit Team (Red Team)"
date: 2025-12-29
ai_generated: true
---

> **SIMULATION NOTICE:** This document (audit, evaluation, response) is part of an AI-driven role-playing simulation conducted for project quality and governance testing. It does not constitute a formal legal or professional audit by any real-world entity.

# Critical Security Audit Report v2: Web/A Layer 2 Encryption

**Assessment of Post-Remediation Implementation & Supply Chain Risks**

## 1. Executive Summary
This report follows the initial remediation attempts (Padding, PQC Injection refactoring). While minor tactical improvements have been made, the **fundamental security posture remains fragile**. The architecture relies heavily on client-side integrity in an uncontrolled browser environment and lacks Forward Secrecy by design. Furthermore, the "Open Source" nature of the project exposes it to precise white-box analysis by attackers, while the heavy reliance on external cryptographic libraries introduces significant Supply Chain risks.

**Verdict: HIGH RISK. Not recommended for classified or high-value financial data without strict operational controls.**

### Follow-up
- [Remediation Report (Response to v2)](./web-a-l2-security-remediation-report.html)
- [Security Re-Assessment v3](./web-a-l2-security-audit-v3.html)

## 2. Review of Remediation Attempts

### 2.1. Traffic Analysis Mitigation (Padding)
*   **Implementation**: Adds 0-255 bytes of random padding.
*   **Critique**: **Insufficient.** While this obscures boolean flags (Yes/No), it does virtually nothing to mask the size of larger inputs (e.g., medical history text). An attacker observing a 5KB payload vs a 5.2KB payload can still infer significant data characteristics.
*   **Rating**: Low Efficacy.

### 2.2. PQC Provider Injection
*   **Implementation**: Removed `globalThis` dependency; requires explicit injection.
*   **Critique**: **Shift of Liability.** The library no longer implicitly trusts the window object, but the *application* using this library still must load the PQC provider from somewhere. If the application's loader is compromised (XSS), the attacker simply injects a malicious provider during the function call. The vulnerability has merely been moved up the stack, not solved.

## 3. Structural & Architectural Vulnerabilities

### 3.1. Complete Lack of Forward Secrecy
**Severity: CRITICAL**
The protocol design uses **static X25519 recipient keys**.
*   **Scenario**: An attacker captures encrypted traffic today. Five years from now, the organization's private key is leaked (insider threat, stolen laptop). **Every single historical form submission becomes readable instantly.**
*   **Analysis**: Most modern protocols (TLS 1.3, Signal) prioritize Forward Secrecy. Web/A's file-based, asynchronous nature makes ephemeral key negotiation difficult, but accepting this risk for "simplicity" is a dangerous trade-off for sensitive data.

### 3.2. Replay Attacks & Aggregator Dependency
**Severity: HIGH**
The library generates a `nonce`, but **does not enforce checks**.
*   **Flaw**: The `l2crypto` library blindly decrypts any valid envelope. It is stateless.
*   **Risk**: An aggregator implementation that fails to track nonces (a likely oversight by developers) will accept the same "Transfer $1000" form 500 times. The security of the protocol depends entirely on the *correctness of the implementation of the receiving end*, which is outside the library's control.

### 3.3. Client-Side Trust Model Delusion
**Severity: HIGH**
The model assumes the browser is a "Trusted Agent".
*   **Reality**: Browsers are hostile environments infested with extensions, ad-tech scripts, and potential XSS vectors.
*   **Attack Vector**: Capturing the data via `MutationObserver` or hooking `HTMLFormElement.prototype.submit` *before* it reaches the encryption function is trivial for any malicious script running in the same origin. Client-side encryption provides **zero protection** against endpoint compromise.

## 4. Supply Chain & Codebase Risks

### 4.1. Dependency Risks (`@noble/*`)
The project relies on `@noble/curves` and `@noble/hashes`.
*   **Risk**: While `@noble` is reputable, it is a single-maintainer ecosystem. A compromise of the maintainer's account or a coercion attack could introduce a subtle backdoor (e.g., constant-time violation or weak RNG seeding) that would be nearly impossible to detect in review.
*   **Mitigation Failure**: There is no evidence of dependency pinning (hash verification) or vendor-ing of dependencies in the repository. `npm install` blindly trusts the registry.

### 4.2. Source Code Disclosure (White-Box Analysis)
Since the source is open:
*   **Timing Attacks**: Attackers can locally profile the `decryptLayer2` function to find timing discrepancies between "Integrity Check Fail" and "Decryption Fail", potentially leading to padding oracle attacks. JavaScript JIT optimization makes constant-time execution incredibly difficult to guarantee.
*   **RNG Analysis**: The implementation relies on `crypto.getRandomValues`. If the browser's PRNG is weak or compromised (rare but possible in specific embedded environments), the ephemeral keys are predictable.

### 4.3. Intellectual Property & License Compliance
*   **Risk**: The codebase implements complex cryptographic logic. If any snippet was copied from a copyleft source (GPL) or a proprietary source without attribution, the project invites legal litigation.
*   **Patent Risk**: The implementation of ML-KEM-768 (Kyber) involves algorithms that may have associated patent claims in certain jurisdictions, despite FIPS standardization efforts. Using this in a commercial product could invite patent troll lawsuits.

## 5. Implementation Specific Flaws

### 5.1. Error Handling Side-Channels
The code throws generic Javascript Errors.
```typescript
if (aadObj.layer1_ref !== envelope.layer1_ref) throw new Error("AAD mismatch");
```
*   **Vulnerability**: If this error is caught and reported differently (or takes different time) than a "MAC check failed" error from the underlying AEAD, it creates a side-channel. An oracle can distinguish between "Wrong Context" and "Wrong Key".

### 5.2. JSON Canonicalization Fragility
The reliance on `canonicalize` (RFC 8785) is brittle.
*   **Issue**: If the JS environment (Client) and the Go/Python environment (Server) have slight disagreements on how to handle corner cases (e.g., Unicode normalization forms, floating point precision), valid messages will be rejected, causing Denial of Service.

## 6. Recommendations

### Short-Term (Immediate Actions)
1.  **Vendor Dependencies**: Do not rely on `npm`. Check in the exact versions of `@noble/*` into the repository and audit them.
2.  **Aggregator Spec Enforcement**: The specification must **REQUIRE** (MUST) nonce tracking. The reference implementation should provide a "ReplayCache" interface.
3.  **Audit Logs**: Decryption events must be logged immutably to detect brute-force attempts.

### Long-Term (Architectural Changes)
1.  **Introduce Ephemeral Key Negotiation**: Move away from static public keys. Implement a "Pre-Key Bundle" server (similar to Signal) where the form fetches a one-time use public key before submission. This solves Forward Secrecy.
2.  **Move to WebAssembly (Rust/C)**: Stop doing crypto in high-level JavaScript. Use a Wasm blob compiled from a verified Rust crate to better control memory and execution time (mitigating timing attacks).
3.  **Strict CSP & SRI**: Mandate Content Security Policy headers and Subresource Integrity for all scripts.

## 7. Conclusion
The current implementation acts as a "Privacy Theater". It protects data on the wire (which TLS already does) and data at rest (partially), but fails to address the systematic risks of key management and endpoint security. It is suitable for **low-risk surveys**, but **unfit for banking, voting, or critical infrastructure**.
