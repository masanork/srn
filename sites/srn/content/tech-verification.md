---
title: "PQC & Verification Specs"
layout: article
description: "Technical specifications for Post-Quantum Cryptography (PQC) hybrid signatures and Selective Disclosure."
font: hero:ReggaeOne-Regular.ttf
---

## Overview
Sorane adopts **Hybrid Signatures** that combine existing Elliptic Curve Cryptography (Ed25519) with **Post-Quantum Cryptography (ML-DSA-44)**, which is resistant to future quantum computer attacks. This ensures both current compatibility and long-term authenticity. Additionally, for privacy protection, we implement **Selective Disclosure (SD-CWT)**, allowing the presentation of only necessary data items.

## Cryptographic Primitives
Algorithms used for signing official documents and protecting privacy:

| Component | Algorithm | Purpose | Standards Ref |
|-----------|-----------|---------|---------------|
| **Primary Signature** | **Ed25519** | Compatibility with current standards | Ed25519Signature2020 |
| **Quantum Safe** | **ML-DSA-44** | Resistance to future quantum threats | FIPS 204 (Dilithium) |
| **Privacy (SD)** | **SD-CWT** | Privacy protection via Selective Disclosure | IETF SD-CWT (CBOR) |
| **Canonicalization** | **JCS** | Deterministic JSON signature generation | RFC 8785 |
| **Digests** | **SHA-256** | Ensuring content integrity | NIST FIPS 180-4 |

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
    "id": "https://masanork.github.io/srn/status-list.json#0",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListCredential": "https://masanork.github.io/srn/status-list.json"
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
    "id": "https://masanork.github.io/srn/status-list.json#list",
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

## Practical Proof-of-Concept (PoC)
As a practical implementation example of these technical specifications, we provide a demo of a Resident Record (Juminhyo). This serves to verify both the effectiveness of PQC in administrative documents and the maintenance of advanced typography.

*   [Resident Record (PoC Demo)](./juminhyo.html)

---
*Note: This specification prioritizes "Zero Overhead" and "Static Verifiability" suitable for SSG environments, essentially implementing a specialized Public Key Infrastructure (PKI) without centralized certificate authorities.*
