title: "Sorane (空音) PQC & Verification Specs"
layout: article
description: "Soraneプロジェクトにおけるポスト量子暗号（PQC）ハイブリッド署名および選択的開示（Selective Disclosure）の技術仕様。"
font: hero:ReggaeOne-Regular.ttf
---

## Overview
Soraneは、既存の楕円曲線暗号 (Ed25519) と将来の量子コンピュータ耐性を持つ **ポスト量子暗号 (ML-DSA-44)** を組み合わせた **ハイブリッド署名** を採用している。これにより、現在の互換性と長期的な真正性を両立させる。また、プライバシー保護のため、**選択的開示 (SD-CWT)** を実装し、必要な項目のみを提示可能としている。

## Cryptographic Primitives
公認ドキュメントの署名とプライバシー保護に使用されるアルゴリズム：

| Component | Algorithm | Purpose | Standards Ref |
|-----------|-----------|---------|---------------|
| **Primary Signature** | **Ed25519** | 現在の標準規格との互換性確保 | Ed25519Signature2020 |
| **Quantum Safe** | **ML-DSA-44** | 将来的な量子脅威への耐性確保 | FIPS 204 (Dilithium) |
| **Privacy (SD)** | **SD-CWT** | 選択的開示によるプライバシー保護 | IETF SD-CWT (CBOR) |
| **Canonicalization** | **JCS** | 決定論的なJSON署名の生成 | RFC 8785 |
| **Digests** | **SHA-256** | コンテンツの完全性担保 | NIST FIPS 180-4 |

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
