---
title: "Web/A Folio: Architecture of Key Management and Trust Anchors"
layout: article
author: "Sorane Project"
date: 2024-12-31
description: "Proposing a robust key management model utilizing Hardware Secure Elements and WebAuthn, moving beyond browser-level storage constraints."
ai_generated: true
---

## 1. The Challenge: Non-Persistent and Vulnerable Storage

In many current web applications and early reference implementations of Web/A, private keys and sensitive data are managed via browser `localStorage` or as plain files. However, for large-scale commercial or official deployment, these methods present terminal weaknesses:

*   **Vulnerability of LocalStorage**: It is defenseless against XSS (Cross-Site Scripting) attacks, where malicious scripts can directly read private keys.
*   **Management Risks of Flat Files**: High risk of users accidentally deleting or losing key files. Security at the OS layer may also be insufficient.
*   **Lack of Persistence**: Important identity data can be lost due to browser cache clearing or storage quotas.

## 2. Reference Model: Comparison with EUDIW ARF

The European Digital Identity Wallet (EUDIW) Architecture and Reference Framework (ARF) defines a highly rigorous model for key management.

| Component | EUDIW ARF Definition | Web/A Folio Approach |
| :--- | :--- | :--- |
| **WSCD (Secure Device)** | Hardware-backed security: Secure Element (SE) or TEE. | **WebAuthn / Passkeys**: Uses the device's secure enclave or external security keys. |
| **WSCA (Secure App)** | A secure application inside the WSCD that handles keys directly. | **No Native App Dependency**: Invokes hardware keys via the standard browser API. |
| **LoA (Assurance)** | High (High Level of Assurance). Reliance on SE is mandatory. | **Holder Binding**: Links Passkeys to National ID or other VCs for high assurance. |

Because Web/A adheres to the philosophy of "avoiding dependency on specific native apps," we do not directly adopt the EUDIW WSCA model (where the application logic resides on the Secure Element). Instead, we use the **standard WebAuthn API as the primary Trust Anchor**.

---

## 3. Tiered Security Model for Web/A Folio

Depending on the sensitivity of the data and the use case, Web/A Folio employs three security tiers:

### Tier 1: Ephemeral Storage (Development / Low Assurance)
*   **Storage**: `localStorage` or plain files.
*   **Use Case**: Demos, testing, signing low-importance information.
*   **Risk**: Vulnerable to theft or accidental loss.

### Tier 2: Biometric/Hardware Security (Standard)
*   **Storage**: Device Secure Enclave (Passkeys).
*   **Use Case**: Everyday applications, logins, document signing.
*   **Key Management**: Via WebAuthn; the private key never leaves the secure hardware.
*   **Mechanism**: Signed Web/A documents use keys (P-256 / Ed25519) backed by the hardware.

### Tier 3: Hardware-Bound Security (High Assurance)
*   **Storage**: Physical National ID Card + Passkey.
*   **Use Case**: Legally binding procedures, high-value transactions.
*   **Key Management**: The high-assurance signing certificate of a National ID is used to sign the Tier 2 Passkey (establishing a **Holder Binding** proof: "This hardware key belongs to me").
*   **Benefit**: Provides legal/physical certainty while avoiding the friction of reading the physical card for every operation.

---

## 4. The "Folio Vault" Concept: Cryptographic Wrapping

In future implementations, a Folio will be treated not just as a folder, but as an **"Encrypted Container (Vault)"**.

1.  **Data Encryption at Rest**: Individual files or entire directories within the Folio are encrypted using AES-GCM with a shared key derived from the user's Passkey (via the Web Crypto API).
2.  **Abstracted Access**:
    - In local environments, the Folio CLI handles decryption.
    - In browser environments, a Service Worker or a specialized "Folio Agent" acts as a virtual file system, decrypting only the necessary data in memory.
3.  **Portability**: As long as the data is encrypted, it can be safely backed up and synced across cloud storage providers (iCloud, Google Drive, Box, etc.). The provider remains unable to view the content.

## 5. Conclusion: Turning the Browser into a Secure Interface

Web/A does not trust the browser itself. Instead, it uses hardware-protected APIs like **WebAuthn** as a gateway to established security primitives.

This allows users to achieve state-of-the-art key management—meeting national security standards—without being locked into "walled garden" wallet apps. By combining standard browsers with resident hardware enclaves or security keys (like Yubikey), Web/A maintains the convenience of file-based workflows while offering industrial-grade security.
