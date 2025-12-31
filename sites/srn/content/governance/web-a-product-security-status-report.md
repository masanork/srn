---
title: "Product Security Status Report (For Red Team Sharing)"
layout: article
author: "Web/A Architecture Team"
date: 2024-12-31
description: "Summary of current considerations and technical challenges regarding L2 encryption, key management architecture, and EUDIW ARF alignment."
ai_generated: true
---

> **SIMULATION NOTICE:** This document (audit, evaluation, response) is part of an AI-driven role-playing simulation conducted for project quality and governance testing. It does not constitute a formal legal or professional audit by any real-world entity.

## 1. Objective

The purpose of this report is to share the current security consideration status for Web/A L2 encryption and the Folio ecosystem with the Red Team, and to organize the discussion points for future detailed audits (v6 and beyond).

## 2. Current Status and Implementation Highlights

In the most recent phase, the following architectural advancements and policy decisions have been made:

### 2.1. Introduction of Static-Epoch Forward Secrecy (SEFS)
To achieve forward secrecy under the constraint of operating solely within a browser (fixed static files), the **"Static-Epoch Forward Secrecy (SEFS)"** model has been adopted.
- **Status**: Prototype implemented.
- **Problem Solved**: Successfully limited the risk of retroactive decryption of past communications to a specific window (e.g., within 24 hours) through periodic private key shredding on the server side.

### 2.2. Tiered Key Management Architecture (Defense in Depth)
Defined a hardware-backed key management model that does not rely on vulnerable storage areas like `localStorage`.
- **Tier 1 (Dev)**: File-based (current reference implementation).
- **Tier 2 (Standard)**: Utilization of physical Enclaves via **WebAuthn / Passkeys**.
- **Tier 3 (High)**: A model that links device keys with national IDs or other high-assurance credentials using **Holder Binding** technology.

### 2.3. Hybrid Considerations for "Folio Vault" and Cloud HSM
Due to browser storage constraints and the need for reliable backups, the following hybrid configuration is being considered:
- **Design Policy**: Encrypt the entire Folio (AES-GCM) with a key derived from the end-user's Passkey and place it in the cloud as a "Vault."
- **Commercialization**: For large-scale, high-assurance services, configurations where the Folio is hosted on **Server-side HSMs / TEEs** operated by the service provider are permitted.

## 3. Known Technical Challenges and Requests for Red Team Input

We request focused evaluation of the following points in future audits:

1.  **Security of WebAuthn PRF Extension**: The robustness of the method for deriving encryption keys using the PRF extension in browser environments where private keys for signing cannot be directly extracted from hardware.
2.  **Trust Chain of Holder Binding**: The degree of strength maintained by a Passkey once bound from a physical ID card if the device itself is compromised.
3.  **Exploitation of Clock Skew in SEFS**: Mitigation measures against replay attacks at Epoch boundaries or the risk of forced key selection via client-side clock tampering.

## 4. Future Plans

- **2025 Q1**: Release of the Folio CLI reference implementation integrating WebAuthn/PRF.
- **2025 Q2**: Definition of high-assurance profiles compliant with EUDIW ARF and PoC for server-side HSM integration.
- **2025 Q3**: Integration of the Pre-key Vending Machine to achieve "Tier 3 (True PFS)" for forward secrecy.

Based on these considerations, we look forward to continuous threat analysis and proposals for bypass methods from the Red Team.
