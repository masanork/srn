---
title: "Discussion Paper: PassKey Integration & Authority Delegation"
layout: width
date: 2024-12-24
author: "Sorane Project Team"
---

# PassKey Integration & Authority Delegation

This paper explores the integration of WebAuthn (PassKey) into the Sorane issuer key management system to provide hardware-backed root of trust while maintaining automated build capabilities.

---

## 1. Problem Statement
Traditional SSGs often keep private keys on disk for automatic signing. This is a significant security risk. If the build server is compromised, the site's identity is lost forever.

## 2. Architecture: Tiered Delegation
We propose a **Root -> Delegate -> Document** chain of trust.

1.  **Root Key (PassKey)**: Stored in secure hardware. Never leaves the device.
2.  **Delegate Certificate**: Root signs a short-lived (e.g. 7-day) certificate for an ephemeral Build Key.
3.  **Build Key**: Used by the SSG server to sign daily content updates.

## 3. WebAuthn Integration
The `passkey-authorize.ts` tool facilitates a local WebAuthn ceremony. 
- The user authenticates via TouchID/FaceID or a Security Key.
- The device signs the registration/authorization payload.
- This creates the `delegate-key.json` required for the build.

## 4. Verification Flow
Verifiers (browsers) can resolve the chain:
- Is the document signed by the Build Key? **Yes.**
- Is the Build Key authorized by the Root DID? **Yes (via Delegate Certificate).**
- Is the Root DID trusted? **Yes.**

## 5. Implementation Status
- [x] P-256 Verification in `verifyHybridVC`.
- [x] Delegation chain logic in `src/vc.ts`.
- [x] Local WebAuthn ceremony tool.
- [x] Automated build integration using delegated keys.
