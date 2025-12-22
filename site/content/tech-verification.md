---
title: "PQC Verification Specifications"
layout: article
description: "Technical specifications for Post-Quantum Cryptography Hybrid Verifiable Credentials and Trust Architecture."
font: hero:ReggaeOne-Regular.ttf
---

## Overview
SRN implements a **Hybrid Verifiable Credential (VC)** system secured by both traditional ECC (Ed25519) and Post-Quantum Cryptography (ML-DSA-44). This ensures both current compatibility and long-term security against quantum threats.

The trust model is designed for a Static Site Generator (SSG) environment, utilizing ephemeral build keys anchored by a persistent Root Identity.

## Cryptographic Primitives
We utilize the following algorithms for dual-signing every official document:

| Component | Algorithm | Purpose | Standards Ref |
|-----------|-----------|---------|---------------|
| **Primary Signature** | **Ed25519** | Current Standards Compatibility | Ed25519Signature2020 |
| **Quantum Safe** | **ML-DSA-44** | Future-Proofing (NIST Level 2) | FIPS 204 (Draft) / Dilithium |
| **Canonicalization** | **JCS** | Deterministic JSON Signing | RFC 8785 |
| **Digests** | **SHA-256** | Content Integrity | NIST FIPS 180-4 |

## Trust Hierarchy

### 1. Root Identity (Trust Anchor)
*   **Key Type**: Persistent Hybrid Keypair (Ed25519 + ML-DSA).
*   **Storage**: Offline / Secure Environment (`site/data/root-key.json`).
*   **Role**: Signs the **Status List VC**. It acts as the immutable identity of the SRN node. Verifiers trust this key (TOFU model).

### 2. Ephemeral Build Keys (Issuers)
*   **Key Type**: Ephemeral Hybrid Keypair.
*   **Lifecycle**: Generated fresh for **every build**.
*   **Role**: Signs individual **Document VCs** (Verification Method).
*   **Identity**: Each build has a unique DID (`did:key:...`).

### 3. Status List (Revocation)
To bridge the trust between the persistent Root and ephemeral Build keys, we implement a **Status List VC**.

*   **Format**: Compatible with **Verifiable Credentials Status List v2021**.
*   **Issuer**: Signed by the **Root Identity**.
*   **Content**: A list of `revokedBuildIds` (Building blocks for potential Bitstring implementation).
*   **Mechanism**:
    1.  Official documents include a `credentialStatus` pointing to `status-list.json`.
    2.  Verifiers fetch the Status List and verify it matches the Root Key.
    3.  Verifiers check if the Document VC's issuer (Build Key) is present in the revocation list.

## Data Model (JSON-LD)

### Document VC Structure
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  "type": ["VerifiableCredential"],
  "issuer": "did:key:zBuildKey...",
  "issuanceDate": "2025-12-21T00:00:00Z",
  "credentialStatus": {
    "id": "https://example.com/status-list.json#0",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListCredential": "https://example.com/status-list.json"
  },
  "credentialSubject": { ... },
  "proof": [
    { "type": "Ed25519Signature2020", ... },
    { "type": "DataIntegrityProof", "cryptosuite": "ml-dsa-44-2025", ... }
  ]
}
```

### Status List VC Structure
```json
{
  "@context": [...],
  "type": ["VerifiableCredential", "StatusList2021"],
  "issuer": "did:key:zRootKey...",
  "credentialSubject": {
    "id": "https://example.com/status-list.json#list",
    "type": "StatusList2021",
    "statusPurpose": "revocation",
    "srn:revokedBuildIds": ["build-170000000", ...]
  },
  "proof": [...]
}
```

## Verification Process
1.  **Integrity Check**: Validate the JCS-canonicalized JSON against the `proof` values (both Ed25519 and ML-DSA).
2.  **Status Check**: 
    *   Fetch the `credentialStatus.statusListCredential` URL.
    *   Verify the Status List's signature against the known **Root Key**.
    *   Ensure the Document VC's `issuer` (or Build ID) is **NOT** in the revocation list.

---
*Note: This specification prioritizes "Zero Overhead" and "Static Verifiability" suitable for SSG environments, essentially implementing a specialized Public Key Infrastructure (PKI) without centralized certificate authorities.*
