---
title: "Web/A Graduated Forward Secrecy: Balancing High Security and Offline Availability"
layout: article
author: "Web/A Architecture Team"
date: 2025-12-29
ai_generated: true
---

# Web/A Graduated Forward Secrecy: Balancing High Security and Offline Availability

**Status:** Technical Specification
**Objective:** To provide an adaptive security model that provides the highest possible level of Forward Secrecy (PFS) based on network conditions, while maintaining service availability in offline or hostile environments.

## 1. The Core Paradox
Modern security demands Perfect Forward Secrecy (PFS) via ephemeral keys. However, Web/A's unique value proposition is **Offline Availability**—the ability to function as a static HTML file without any server-side dependencies.

Traditional PFS requires a dynamic server. Pure static sites cannot provide it. 

## 2. Three-Tiered Adaptive Security Model (The Gradient)

Web/A implements a "Graduated Security" approach. The client automatically attempts to secure the highest possible tier, falling back gracefully as environment constraints increase.

| Tier | Name | Network | PFS Type | Mechanism | Best Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 3** | **Dynamic (High)** | Online | **True PFS** | One-time Pre-key from Cloudflare Worker (D1). | Whistleblowing, Financial, Medical |
| **Tier 2** | **Epoch (Standard)** | Online | **Practical FS** | Daily rotating keys from static CDN registry. | General business, Surveys, Inquiries |
| **Tier 1** | **Static (Basic)** | **Offline** | **None** | Fixed Master Key embedded in HTML frontmatter. | Disaster recovery, Air-gapped ops |

## 3. Algorithm: The Fallback Chain

Upon form submission (or initialization), the Web/A client (`mkform.js`) executes the following logic:

1.  **Attempt Tier 3**: `fetch()` a one-time key from the configured `prekey_url`.
    *   *If success*: Encrypt using the unique Pre-Key. Mark as "High Security".
2.  **Attempt Tier 2**: If Tier 3 fails or is unconfigured, `fetch()` the `epoch_registry_url`.
    *   *If success*: Select the key for the current UTC date. Mark as "Standard Security".
3.  **Attempt Tier 1**: If Tier 2 fails (e.g., offline), use the `recipient_x25519` master key.
    *   *Result*: Encrypt using the static key. Mark as "Offline/Basic Security".

## 4. UX: Security Signal Strength

To prevent user deception, the system MUST provide transparent feedback regarding the current security tier. This is visualized as a "Security Signal" indicator in the form UI.

*   🟢 **HIGH**: Encrypted with a one-time ephemeral key. Total Forward Secrecy.
*   🟡 **STANDARD**: Encrypted with a daily rotating key. Forward Secrecy is limited to 24h windows.
*   🟠 **OFFLINE**: Encrypted with a long-term master key. No Forward Secrecy. Previous data may be at risk if the organization key is compromised later.

## 5. Justification for Tier 1 Fallback

Security auditors often demand "Safe or Fail" (blocking submission if PFS is unavailable). Web/A explicitly chooses **"Safe but Inform"** (allowing submission with a lower tier after informing the user).

In scenarios such as **disaster relief** or **government censorship**, an encrypted message with Tier 1 security is infinitely more valuable than no message at all. The goal of Web/A is to be "The Form that Always Works," and Graduated PFS fulfills this mission without sacrificing transparency.

## 6. Security Analysis of the Tier 3 (Worker) Implementation

By hosting the Pre-Key store on **Cloudflare Workers + D1**, we solve the "Future Key" problem identified in the v4 audit:
1.  **Atomic Consumption**: Keys are deleted from the D1 database the moment they are served.
2.  **Zero Persistence**: The private key corresponding to a Tier 3 public key only exists in the administrator's local vault and is NEVER uploaded to the cloud.
3.  **Shredding**: The administrator shreds the private key immediately after successful batch decryption.

---
*End of Specification*
