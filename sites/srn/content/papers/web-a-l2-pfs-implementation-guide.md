---
title: "Implementation Guide: Client-Side Epoch-Based PFS"
layout: article
author: "Web/A Architecture Team"
date: 2025-12-29
ai_generated: true
---

# Implementation Guide: Client-Side Epoch-Based PFS

This document provides instructions for frontend developers to implement **Epoch-Based Forward Secrecy** in Web/A form clients.

## 1. Objective
The goal is to move away from a single static recipient key to a rotating set of daily keys fetched from a static JSON registry. This limits the impact of a potential private key compromise to a single 24-hour window.

## 2. Resource Discovery
The client should be configured with a URL to the public key registry (e.g., `epoch-public.json`).

```html
<script id="weba-l2-config" type="application/json">
{
  "enabled": true,
  "epoch_registry_url": "/keys/epoch-public.json",
  "fallback_recipient_x25519": "..."
}
</script>
```

## 3. Implementation Steps

### 3.1. Fetching the Registry
Use the `fetchEpochRegistry` function provided in the `l2crypto` client library.

### 3.2. Selecting the Active Key
Use `selectEpochKey(registry)` to find the key corresponding to the user's current UTC time.

```typescript
import { fetchEpochRegistry, selectEpochKey } from "./l2crypto";

const config = loadL2Config();
const registry = await fetchEpochRegistry(config.epoch_registry_url);
const epochKey = registry ? selectEpochKey(registry) : null;

const recipientPk = epochKey 
  ? b64urlDecode(epochKey.publicKey) 
  : b64urlDecode(config.fallback_recipient_x25519);

const recipientKid = epochKey ? epochKey.kid : config.recipient_kid;
```

### 3.3. Handling Edge Cases
1.  **Network Failure**: If the registry cannot be fetched, fall back to the `fallback_recipient_x25519` (the long-term Org Root key).
2.  **Clock Skew**: If the user's system clock is significantly off, `selectEpochKey` may fail to find a valid key. Fall back to the long-term key.
3.  **Inventory Depletion**: If the current date is beyond the range of the registry, fall back to the long-term key.

## 4. UI/UX Considerations
*   **Background Fetch**: Fetch the registry as soon as the form loads to ensure the key is ready when the user clicks "Submit".
*   **Encryption Indicator**: The "Encrypted" badge in the UI remains the same, as the encryption algorithm (X25519/AES-GCM) is unchanged.

## 5. Summary of API
The following functions are available in `src/form/client/l2crypto.ts`:
*   `fetchEpochRegistry(url: string)`: Returns the registry object.
*   `selectEpochKey(registry: EpochRegistry)`: Returns the `EpochPublicKey` object for the current UTC date.
