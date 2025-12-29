---
title: "Security Audit Report: Web/A Layer 2 Encryption"
layout: article
author: "Web/A Security Audit Team"
date: 2025-12-29
ai_generated: true
---

# Security Audit Report: Web/A Layer 2 Encryption

## 1. Executive Summary
This report provides a security analysis of the Web/A Layer 2 Encryption specification and implementation (as of Dec 2025). The architecture utilizes modern, standard cryptographic primitives (HPKE-like construction using X25519/AES-GCM/HKDF). The primary strengths lie in its simplicity and the cryptographic binding of answers to their form templates (Context Binding).

However, significant risks exist regarding **Forward Secrecy**, **Replay Attacks** (due to the stateless nature), and **Endpoint Security** (Browser XSS). This report highlights these risks from the perspectives of an external attacker and an internal auditor.

## 2. Threat Model Analysis

### 2.1. Trust Assumptions
1.  **L1 Integrity**: The user trusts the Form (Layer 1) they are filling out. If the L1 file itself is malicious (modified by an attacker to include the attacker's public key), encryption provides no protection.
2.  **Endpoint Integrity**: The user's browser environment is free of malware or malicious extensions that hook `window.crypto` or the DOM.
3.  **Key Distribution**: The recipient's public key embedded in the L1 form is authentic.

### 2.2. Attacker Capabilities
*   **Network Interceptor**: Can capture encrypted L2 payloads in transit (e.g., email, unencrypted HTTP).
*   **Malicious Origin**: Can host a modified version of the form (Phishing).
*   **Compromised Aggregator**: An attacker who gains access to the storage where L2 forms are collected.

## 3. Vulnerability Assessment

### 3.1. Replay Attacks (Statelessness)
**Severity: High**
*   **Issue**: The Layer 2 Encrypted Envelope contains a `nonce`, but because the reception infrastructure is often stateless (e.g., a file drop, email inbox), there is no centralized database to enforce "nonce uniqueness" by default.
*   **Attack**: An attacker captures a valid encrypted submission (e.g., "Approve Transfer") and resubmits it 100 times. The decryptor (Aggregator) will decrypt valid JSON 100 times.
*   **Mitigation**: Aggregators **MUST** implement a nonce-tracking mechanism or check unique constraints on the decrypted `layer2_sig` (signature) to discard duplicates. The protocol spec should mandate this for the aggregation layer.

### 3.2. Forward Secrecy (Static Keys)
**Severity: Medium-High**
*   **Issue**: The protocol relies on static X25519 public keys embedded in the form. If the recipient's private key is compromised (stolen from the aggregator or analyst's machine), **ALL** past historical messages sent to that form can be decrypted.
*   **Contrast**: Ephemeral DH (like TLS) rotates keys per session. Web/A L2 uses static-static (or ephemeral-static) DH.
*   **Mitigation**:
    1.  **Key Rotation**: Organizations must rotate keys frequently (e.g., per "Campaign").
    2.  **Campaign Isolation**: The "Hierarchical Key Derivation" feature is crucial. Do not use a single "Root Key" for all forms.

### 3.3. Browser Context & XSS
**Severity: Critical (Environment)**
*   **Issue**: Encryption happens in the browser JavaScript runtime. If the page (or the hosting domain) has an XSS vulnerability, an attacker can steal the `layer2_plain` data *before* `encryptLayer2` is called.
*   **Attack**: Inject a script that hooks the "Submit" button, copies the form data, sends it to an attacker's server, and then lets the normal encryption flow proceed.
*   **Mitigation**: This is an inherent web risk. Content Security Policy (CSP) must be strict. The `mkform.js` script should ideally be served from a subresource integrity (SRI) protected path.

### 3.4. PQC Polyfill Hijacking
**Severity: Medium**
*   **Issue**: The implementation looks for `globalThis.webaPqcKem`.
*   **Attack**: A malicious browser extension or a compromised script on the page could overwrite `webaPqcKem` with a "dummy" provider that uses a fixed seed or leaks the shared secret.
*   **Mitigation**: The PQC provider should be loaded via a hardened loader or bundled directly, rather than relying on a global variable that is easily mutable.

### 3.5. Metadata Leakage (AAD)
**Severity: Low**
*   **Issue**: The AAD (Associated Data) is unencrypted (though authenticated). It contains `layer1_ref` and `recipient` Key ID.
*   **Attack**: An observer can see *which* form a user is submitting (via `layer1_ref`) and *who* they are sending it to, even if they can't read the contents.
*   **Mitigation**: This is often a trade-off for routing and context binding. If metadata privacy is required, the `layer1_ref` could be hashed again or obscured, but this complicates routing.

### 3.6. AAD Mismatch / Canonicalization
**Severity: Low (Implementation)**
*   **Issue**: The system relies on `canonicalize` (RFC 8785). If the implementation of canonicalization differs slightly between the JS Encryptor and the (potentially Python/Go) Decryptor, valid messages will be rejected (Integrity check fail).
*   **Mitigation**: Ensure strict adherence to RFC 8785 in all language ports.

## 4. Auditor's Checklist (Compliance & Governance)

*   [ ] **Key Generation**: Are keys generated using a CSPRNG? (Checked: `crypto.getRandomValues` / `node:crypto` used).
*   [ ] **Key Storage**: Where is the Aggregator's private key stored? It must NOT be in the code repository.
*   [ ] **Context Binding**: Does the Aggregator verify that the `layer1_ref` in the AAD matches the actual Form definition being processed? (Critical check).
*   [ ] **Consent**: Is the user clearly informed that encryption is active? (UI check).
*   [ ] **Algorithm Agility**: If AES-GCM or X25519 is broken, can we upgrade? (The `suite` field exists in the envelope, allowing versioning).

## 5. Recommendations for Improvement

1.  **Mandate Nonce Tracking**: The Aggregation spec should explicitly require tracking `meta.nonce` or `layer2_sig` to prevent replay attacks.
2.  **Hardened PQC Loading**: Remove reliance on `window.webaPqcKem`. Import the WASM module directly within the `l2crypto` closure to prevent tampering.
3.  **Explicit Key Rotation Policy**: The "Org Root Key" derivation is a good feature. The documentation should recommend creating a new `campaign_id` for every significant distribution batch.
4.  **Traffic Analysis Padding**: Consider adding a "padding" field to the JSON before encryption to obscure the exact length of the answer, preventing length-based side-channel analysis (e.g., guessing "Yes" vs "No" based on ciphertext length).
