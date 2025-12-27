---
title: "Discussion Paper: Web/A Layer 2 Encryption"
layout: article
author: "Web/A Project"
date: 2025-12-27
---

# Web/A Layer 2 Encryption: Privacy-Preserving Form Submissions

## 1. Abstract
This paper defines the **Layer 2 Encryption** layer for Web/A documents. While Layer 1 ensures the integrity of the document template (the "Question"), and Layer 2 (Signature) ensures the authenticity of the user's response (the "Answer"), Layer 2 Encryption provides **Confidentiality**. This ensures that sensitive user data is only readable by the intended recipient (the Issuer/Aggregator), even when the document is transported over untrusted channels or stored in browser-local storage.

## 2. Threat Model
- **Confidentiality**: Protect User Answers from intermediaries (email providers, CDNs, malicious browser extensions).
- **Integrity-Linked**: Ensure the ciphertext is cryptographically bound to the specific version of the Layer 1 Template (preventing "cut-and-paste" attacks where answers are moved to a different form).
- **Future-Proofing**: Provide a hybrid path for Post-Quantum Cryptography (PQC) while maintaining compatibility with current high-performance ECC.

## 3. Cryptographic Construction

### 3.1. HPKE-like Hybrid Encryption
Web/A L2 uses a construction inspired by **HPKE (RFC 9180)**, optimized for JSON-based document workflows.

- **KEM (Key Encapsulation Mechanism)**: 
  - Classical: **X25519**
  - Post-Quantum (Optional): **ML-KEM-768 (Kyber)**
- **KDF (Key Derivation Function)**: **HKDF-SHA256**
- **AEAD (Authenticated Encryption with Associated Data)**: **AES-256-GCM**

### 3.2. Associated Data (AAD) Binding
To prevent re-binding attacks, the AEAD `aad` includes the `layer1_ref` (hash of the template). If the `layer1_ref` in the envelope does not match the one used during encryption, decryption will fail.

```json
{
  "layer1_ref": "sha256:...",
  "recipient": "issuer#kem-2025",
  "weba_version": "0.1"
}
```

### 3.3. Deterministic Canonicalization
For both signing and AAD preparation, Web/A uses a simplified **Canonical JSON**:
1. Lexicographical sorting of keys.
2. No insignificant whitespace.
3. UTF-8 encoding.
4. Floating-point numbers are discouraged (or stringified) to ensure cross-platform stability.

## 4. Data Structures

### 4.1. Layer 2 Payload (Plaintext before encryption)
```json
{
  "layer2_plain": {
    "name": "John Doe",
    "medical_history": "..."
  },
  "layer2_sig": {
    "alg": "Ed25519",
    "kid": "user#sig-1",
    "sig": "base64...",
    "created_at": "2025-12-27T..."
  }
}
```

### 4.2. Layer 2 Encrypted Envelope
```json
{
  "weba_version": "0.1",
  "layer1_ref": "sha256:...",
  "layer2": {
    "enc": "HPKE-v1",
    "suite": {
      "kem": "X25519(+ML-KEM-768)",
      "kdf": "HKDF-SHA256",
      "aead": "AES-256-GCM"
    },
    "recipient": "issuer#kem-2025",
    "encapsulated": {
      "classical": "base64(ephemeral_pk)",
      "pqc": "base64(kem_ct)"
    },
    "ciphertext": "base64(aead_ct)",
    "aad": "base64(aad_json)"
  },
  "meta": {
    "created_at": "2025-12-27T...",
    "nonce": "base64..."
  }
}
```

## 5. Implementation Notes (Bun/TypeScript)
- Use `@noble/curves/ed25519` and `x25519` for elliptic curve operations.
- Use `node:crypto` for `hkdf`, `randomBytes`, and `createCipheriv` (AES-GCM).
- Implementation should be minimal and self-contained to allow easy porting to browser environments.
