---
title: "Design: Web/A Layer 2 Hybrid HPKE Context (X25519 + ML-KEM-768)"
layout: article
author: "Web/A Project"
date: 2025-01-05
status: reference
---

This design document specifies the hybrid KEM context and HPKE key schedule
updates for Web/A Layer 2 encryption. It aligns the KEM combiner and key
derivation with RFC 9180 labeled extract/expand and the CFRG hybrid KEM draft
for X25519 + ML-KEM-768.

## Goals
- Align the KEM combiner with the CFRG hybrid KEM draft for X25519 + ML-KEM-768.
- Use HPKE RFC 9180 labeled extract/expand with a proper suite ID.
- Remove the use of AAD as HKDF salt.
- Bind `weba_version`, suite parameters, and context into the HPKE `info` field.

## Hybrid KEM Overview
The hybrid KEM uses a classic X25519 DH share combined with an ML-KEM-768
encapsulation. Shared secrets are concatenated in order and passed as the KEM
input keying material (`ikm`) to the HPKE key schedule:

- `ss1 = X25519(ephemeral_sk, recipient_pk)`
- `ss2 = ML-KEM-768.Encapsulate(recipient_pqc_pk).shared_secret` (optional)
- `ikm = ss1 || ss2` (hybrid mode) or `ikm = ss1` (classical mode)

The hybrid encapsulation payload is:
- `enc = ephemeral_x25519_pk`
- `pqc = ml_kem_768_ciphertext` (optional)

## HPKE Suite ID
We follow RFC 9180 suite ID formatting:

```
suite_id = "HPKE" ||
           I2OSP(kem_id, 2) ||
           I2OSP(kdf_id, 2) ||
           I2OSP(aead_id, 2)
```

Suite mapping for Web/A Layer 2:
- KEM `X25519` -> `kem_id = 0x0020`
- KEM `X25519+ML-KEM-768` -> `kem_id = 0x0030` (CFRG hybrid draft)
- KDF `HKDF-SHA256` -> `kdf_id = 0x0001`
- AEAD `AES-256-GCM` -> `aead_id = 0x0002`

## HPKE Labeled Extract/Expand
We use RFC 9180 labeled extract/expand for key derivation:

```
LabeledExtract(salt, label, ikm) =
  HKDF-Extract(salt, "HPKE-v1" || suite_id || label || ikm)

LabeledExpand(prk, label, info, L) =
  HKDF-Expand(prk,
    I2OSP(L, 2) || "HPKE-v1" || suite_id || label || info,
    L
  )
```

Key schedule:
- `prk = LabeledExtract("", "eae_prk", ikm)`
- `key = LabeledExpand(prk, "key", info, 32)`
- `iv  = LabeledExpand(prk, "iv", info, 12)`

## HPKE Info Encoding
The HPKE `info` embeds version, suite, and context fields. It is encoded as a
length-prefixed UTF-8 sequence to avoid JSON ordering issues:

```
info = encode("weba-l2") ||
       encode(weba_version) ||
       encode(enc) ||
       encode(suite.kem) ||
       encode(suite.kdf) ||
       encode(suite.aead) ||
       encode(layer1_ref) ||
       encode(recipient_kid)

encode(x) = I2OSP(len(x), 2) || x
```

This ties the HPKE context to:
- `weba_version`
- `enc` (e.g., "HPKE-v1")
- suite parameters (`kem`, `kdf`, `aead`)
- `layer1_ref` and `recipient`

## AAD Usage
AAD remains in use for AES-GCM authentication, but it is no longer a KDF salt.
AAD is still the canonical JSON structure:

```
{
  "layer1_ref": "...",
  "recipient": "...",
  "weba_version": "0.1"
}
```

## Envelope Fields
No structural changes are required beyond the HPKE context. The envelope keeps:
- `weba_version`
- `layer2.enc` (`HPKE-v1`)
- `layer2.suite` (`kem`, `kdf`, `aead`)
- `layer2.encapsulated` (`classical`, optional `pqc`)
- `layer2.aad`

## Notes
- When ML-KEM is disabled, the suite ID and KEM input revert to X25519 alone.
- Suite ID mapping should be revisited if the CFRG hybrid draft assigns a new
  KEM ID for X25519 + ML-KEM-768.
