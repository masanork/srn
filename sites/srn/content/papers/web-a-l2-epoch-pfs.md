---
title: "Web/A Static-Epoch Forward Secrecy: Architecture & Risk Analysis"
layout: article
author: "Web/A Architecture Team"
date: 2025-12-29
ai_generated: true
---

# Web/A Static-Epoch Forward Secrecy: Architecture & Risk Analysis

**Status:** Proposal / Draft
**Target Audience:** Security Auditors, System Architects

## 1. Introduction

This document proposes a "Serverless Forward Secrecy" architecture for the Web/A ecosystem. While standard Perfect Forward Secrecy (PFS) relies on interactive key negotiation (e.g., Diffie-Hellman ephemeral keys) requiring dynamic servers, Web/A adheres to a strict static-file-only constraint.

To bridge this gap, we introduce the **Static-Epoch Forward Secrecy (SEFS)** model. This approach approximates PFS by rotating keys based on time windows ("Epochs"), relying solely on pre-published static JSON key registries.

## 2. Architecture: The "Key Calendar"

Instead of negotiating a key for every session, the system uses a deterministic schedule of keys.

### 2.1. Mechanism
1.  **Pre-Generation**: The Administrator generates a batch of Key Pairs for future time windows (e.g., one key per day for the next 90 days).
    *   *Public Keys* are published to a static JSON file (`keys_registry.json`).
    *   *Private Keys* are stored securely offline (encrypted) on the Aggregator.
2.  **Client Selection**: The User Agent (Browser) fetches the registry, checks the current UTC timestamp, and selects the active Public Key for the current Epoch.
3.  **Encryption**: Data is encrypted using this Epoch Key. No handshake is required.
4.  **Shredding (Crucial Step)**: When the Aggregator processes data, it decrypts messages using the corresponding Private Keys. Once an Epoch has passed (e.g., "yesterday"), the corresponding Private Key is **permanently deleted** from the Aggregator's storage.

## 3. Risk Analysis: Comparison with "True PFS"

The following table contrasts SEFS with "True PFS" (e.g., Signal Protocol, TLS 1.3 Ephemeral).

| Feature | True PFS (Signal/TLS) | Static-Epoch FS (Web/A) | Risk Delta |
| :--- | :--- | :--- | :--- |
| **Key Lifespan** | Per-Session / Milliseconds | Per-Epoch (e.g., 24 Hours) | **High**: Attackers have a larger window to compromise a key. |
| **Compromise Scope** | Only the current active message | All messages within the current Epoch | **Medium**: Compromise of "Today's Key" leaks "Today's Data". |
| **Past Data Safety** | Protected immediately after session | Protected after Epoch expiration & deletion | **Dependent on Ops**: Safety relies on the admin running the "Shred" process. |
| **Infrastructure** | Complex Dynamic Servers (Stateful) | Simple Static Files (Stateless) | **Advantage**: Zero attack surface on the server side (no key server to hack). |

### 3.1. The "Window of Vulnerability"

In True PFS, if an endpoint is compromised at time $T$, messages sent at $T-1$ second are likely safe.
In SEFS, if the Aggregator is compromised at time $T$, all messages sent from the *start of the current Epoch* up to $T$ are vulnerable.

**Mitigation:**
The risk is linear to the Epoch duration.
*   **Daily Epochs**: Worst case = 24 hours of data exposure.
*   **Hourly Epochs**: Worst case = 1 hour of data exposure.
*   **Random Buckets**: Combining Epochs with probabilistic selection (e.g., 10 keys active per day) forces an attacker to compromise *all* active keys to read *all* traffic.

## 4. Operational Requirements (Audit Compliance)

To consider SEFS "Secure" under audit standards, the following operational controls are mandatory:

1.  **Auto-Shredding**: The Aggregator software MUST enforce the deletion of expired private keys immediately upon successful decryption or daily maintenance cycles.
2.  **Forward Integrity**: Future private keys (stored on the Aggregator but not yet active) MUST be encrypted at rest with a strong master key. This prevents a theft of the "Key Calendar" from compromising future communications.
3.  **Clock Synchronization**: Clients rely on system time. A grace period (e.g., accepting `CurrentEpoch +/- 1`) is required to handle clock skew, slightly expanding the attack window.

## 5. Conclusion

Static-Epoch Forward Secrecy is not "Perfect" in the cryptographic sense (session-level isolation), but it provides **"Practical Forward Secrecy"** for asynchronous, file-based workflows.

It effectively mitigates the catastrophic risk of "Total Retroactive Decryption" (where one stolen master key decrypts years of history). By limiting exposure to a single Epoch (e.g., 24 hours), it balances security requirements with the architectural constraint of serverless deployment.
