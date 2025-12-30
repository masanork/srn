---
title: "Specification: Tier 3 True PFS via Pre-key Vending Machine"
layout: article
author: "Web/A Architecture Team"
date: 2025-12-29
ai_generated: true
---

# Specification: Tier 3 True PFS via Pre-key Vending Machine

## 1. Overview
To achieve **Perfect Forward Secrecy (PFS)** at the highest level (Tier 3), the system must ensure that every single message uses a unique, one-time-use encryption key. This specification describes a stateless, serverless "Pre-key Vending Machine" using Cloudflare Workers and D1.

## 2. Security Goals
1.  **Session Isolation**: Compromise of one message key does not leak any other messages.
2.  **No Cloud Trust**: The dynamic server (Cloudflare) never sees private keys. It only manages the distribution of one-time public keys.
3.  **Future Secrecy**: An attacker compromising the cloud database cannot decrypt future messages because they lack the corresponding private keys stored locally by the administrator.

## 3. Data Structures

### 3.1. D1 Database Schema (`prekeys` table)
```sql
CREATE TABLE prekeys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid TEXT UNIQUE NOT NULL,      -- e.g., "pre_abc123"
  pub_key TEXT NOT NULL,         -- base64url(X25519 public key)
  pqc_pub_key TEXT,              -- base64url(ML-KEM-768 public key) [Optional]
  status TEXT DEFAULT 'available', -- 'available' | 'consumed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  consumed_at DATETIME
);
CREATE INDEX idx_prekeys_status ON prekeys(status);
```

### 3.2. Pre-key Local Store
The administrator maintains a local SQLite or JSON database mapping `kid` to `private_key`.

## 4. Operational Flow

### 4.1. Key Replenishment (Local Admin)
1. Generate N (e.g., 1000) X25519 key pairs.
2. Store `(kid, private_key)` in the local secure vault.
3. Generate an SQL `INSERT` script for the `(kid, pub_key)` pairs.
4. Execute `wrangler d1 execute` to upload public keys to Cloudflare.

### 4.2. Key Vending (Cloudflare Worker)
**Endpoint**: `GET /api/v1/prekey`
1. **Transaction**:
   - Find the first record where `status = 'available'`.
   - Update `status = 'consumed'`, `consumed_at = NOW()`.
   - Return `{ kid, pub_key, pqc_pub_key }`.
2. **Error Handling**: If no keys are available, return HTTP 503 (Service Unavailable) to trigger the client's Tier 2 (Epoch) fallback.

### 4.3. Decryption & Shredding (Aggregator)
1. Read the `kid` from the received L2 Envelope.
2. Retrieve the `private_key` from the local vault.
3. Decrypt the message.
4. **SHRED**: Physically delete the `private_key` from the local vault immediately.

## 5. Security Analysis
- **CDN/Cloud Compromise**: If an attacker gains full control of the Cloudflare account, they can only replace future public keys. They cannot decrypt past messages (PFS) or decrypt new ones (as they don't have the local private keys).
- **Aggregator Compromise**: If the aggregator's local vault is stolen, "Future Secrecy" is at risk if future keys were pre-generated and stored in plaintext. *Recommendation: Encrypt the local vault with a strong master passphrase.*
