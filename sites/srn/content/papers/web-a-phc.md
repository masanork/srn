---
title: "Web/A Prunable Hash Chain (PHC) Specification"
date: 2026-01-01T12:00:00+09:00
lang: en
license: "CC-BY-4.0"
schema: "https://masanork.github.io/srn/schemas/weba-v1.json"
tags: ["spec"]
---

# Web/A Prunable Hash Chain (PHC) Technical Specification

Ver 0.1.0 (Draft)

## 1. Abstract

The **Layer 3 (Context)** of Web/A is not just a metadata store but functions as a **Decentralized Audit Ledger (Micro-Ledger)** that records the entire lifecycle of a document.
The **Prunable Hash Chain (PHC)** is the data structure used to implement this ledger, possessing the following characteristics:

1.  **Immutability**: Each event contains the hash of the previous event, forming a cryptographic chain.
2.  **Verifiability**: A third party can verify the validity of the chain from the initial issuance (Genesis) to the current state offline.
3.  **Prunability**: To protect privacy in the distribution route or to reduce data size, "branch" history data unnecessary for verification can be deleted (Pruned) while maintaining the integrity of the main chain.

## 2. Data Structure

PHC is represented as an array (Chain) of JSON-LD objects.

### 2.1. Block Structure

Each block (event) has the following common structure.

```json
{
  "id": "urn:uuid:...",
  "type": ["VerifiableEvent", "RebuildEvent"],
  "prev": "sha256:...", // Hash of the parent block
  "created": "2026-01-01T12:00:00Z",
  "actor": "did:web:issuer.example.com",
  "data": { ... }, // Event-specific data
  "proof": { ... } // Event signature
}
```

### 2.2. Pruning Mechanism (Merkle-ized L3)

Pruning is enabled by organizing events as a Merkle Tree rather than a simple linked list.

*   **Full History**: Issuers and audit agencies hold the complete history.
*   **Pruned History**: End-users are provided only with the minimum path (Merkle Proof) connecting the "Fact of Issuance" and the "Latest State". Internal logs of the distributor, etc., can be deleted, leaving only the hash.

## 3. Key Event Types

### 3.1. Genesis (Issue)
The event when the document was initially generated.
*   **Payload**: L1 (Schema) hash, L2 (Data) hash.
*   **Signer**: Issuer.

### 3.2. Rebuild (Presentation Update)
The core event for solving the "Rebuild Paradox". It records that Layer 4 (Presentation) has been updated.
*   **Payload**: 
    *   Old L4 hash (optional)
    *   Metadata of the new L4 structure (used template ID, etc.)
    *   **Reason**: "Security Update", "Design Refresh", etc.
*   **Verification**: This proves that "it has been re-wrapped into the latest design by a legitimate authority," even if the signature time of L2 is old. Re-signing the L2 body is not required.

### 3.3. Transfer (Custody Change)
Records a change in the document's custodian (such as moving between Folios).
*   **Payload**: Delivery protocol information, receiver's public key hash (optional).

### 3.4. Metadata Update (Context Update)
Records changes to peripheral metadata that do not affect the core facts of L1/L2.
-   **Payload**: Changed fields (e.g., `tags`, `license`, `status`) and their new values.
-   **Characteristics**: This allows improving searchability or changing policies (license change, etc.) as a "legitimate update" without re-signing L2.

### 3.5. Verification (Audit Log)
Records the fact that "someone succeeded in verification."
*   **Payload**: Timestamp at the time of verification, verification result (Valid/Invalid).
*   **Use Case**: Functions as a checkpoint for tampering detection.

## 4. Signing and Verification Flow

### 4.1. Chain Verification
A Verifier validates L3 using the following steps:

1.  **Genesis Verification**: Is the first block signed by a trusted issuer (Issuer)?
2.  **Link Verification**: Does the `prev` hash of each block match the hash of the immediately preceding block?
3.  **Signature Verification**: Is the signature or hash of each block legitimate?

### 4.2. Coupling with L4
The latest L4 (HTML file) is signed including the **PHC Head Hash (hash of the latest block)** at that point in a `meta` tag or invisible signature area.
This cryptographically binds that "this HTML container wraps the latest state of this history."

## 5. Future Challenges

*   **Alignment with JSON-LD Signatures**: How to coexist with W3C VC Data Integrity proofs.
*   **Compactness**: Compression algorithms (snapshotting) when the chain becomes long.
