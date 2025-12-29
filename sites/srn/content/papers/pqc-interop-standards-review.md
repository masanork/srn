---
title: "PQC Interoperability & Standards Review Report"
layout: width
date: 2025-12-29
author: "Sorane Project Team"
ai_generated: true
---

## Executive Summary

This report reviews the Sorane codebase with a focus on interoperability and
alignment with emerging international standards, especially for PQC. The
implementation demonstrates a pragmatic hybrid approach, but several areas
would block smooth standardization or cross-vendor interop unless clarified or
restructured.

Key themes:

- Custom algorithm identifiers and proof encodings are used in ways that are
  not aligned with W3C Data Integrity, COSE, or JOSE conventions.
- The Layer 2 encryption flow is described as HPKE but currently diverges from
  RFC 9180 and ongoing hybrid-KEM proposals; this creates portability risks.
- Key encoding and DID resolution behavior are underspecified, limiting
  verifiable interoperability across ecosystems.

## Scope Reviewed

Primary code paths and specs reviewed:

- Hybrid VC signing/verification and COSE-like formats in
  `src/core/vc.ts`.
- Layer 2 encryption and PQC KEM plumbing in `src/core/l2crypto.ts`,
  `src/weba_l2crypto.ts`, and `src/core/pqc.ts`.
- L2 encryption spec references in `sites/srn/content/papers/web-a-l2-encryption.md`.

## Findings and Interoperability Gaps

### 1. Data Integrity cryptosuite identifiers and proof encoding are custom

- `src/core/vc.ts` uses `DataIntegrityProof` with `cryptosuite:
  "ml-dsa-44-2025"` and encodes `proofValue` as hex. This diverges from W3C
  Data Integrity conventions (multibase-encoded proof values and registered
  cryptosuite names).
- The classic proof uses `Ed25519Signature2020`, which is legacy in VC 2.0
  contexts. VC 2.0 and Data Integrity 1.0 recommend `DataIntegrityProof` with
  registered cryptosuites such as `eddsa-jcs-2022` for JCS-based signing.

**Impact:** External verifiers expecting registered cryptosuites or multibase
encodings will fail to verify or even parse the proofs.

### 2. VerificationMethod handling assumes non-standard DID key encodings

- `src/core/vc.ts` extracts public keys by parsing the fragment of
  `verificationMethod` and treating it as hex. It also attempts to read the
  `did:key:z...` value directly as hex by slicing the multibase string.

**Impact:** `did:key` uses multibase/multicodec, so hex parsing will yield
invalid keys. Without DID resolution, any interop with standard DID documents
is fragile.

### 3. COSE hybrid signature is not COSE-compliant

- `createCoseVC` in `src/core/vc.ts` builds a COSE-like array and places a
  concatenated Ed25519 + ML-DSA signature in the single `signature` field.
- The protected header `alg: "ML-DSA-44+Ed25519"` is a custom string, and the
  structure omits a standard COSE tag or `COSE_Sign` with multiple signatures.

**Impact:** Existing COSE tooling cannot validate or interpret the signature.
If standardization is a goal, this must be modeled as `COSE_Sign` with separate
`COSE_Signature` entries or a formally registered hybrid algorithm identifier.

### 4. Layer 2 encryption labeled as HPKE but deviates from RFC 9180

- `src/weba_l2crypto.ts` and `src/core/l2crypto.ts` label the scheme as HPKE
  but use a bespoke KEM combiner: X25519 Diffie-Hellman plus optional ML-KEM
  encapsulation, then concatenate secrets and run HKDF with AAD as the salt.
- RFC 9180 uses labeled extract/expand with suite IDs and context. Current
  code does not include HPKE context or standard `info` strings, and the AAD
  is used as salt in a non-standard way.

**Impact:** The encryption is not interoperable with HPKE implementations.
Standardizing this would require aligning with HPKE or a published hybrid KEM
combiner (e.g., CFRG proposals for X25519+ML-KEM-768), with labeled KDF
inputs and explicit suite IDs.

### 5. Envelope formats are inconsistent between implementations

- `src/weba_l2crypto.ts` emits ciphertext with the tag appended, while
  `src/core/l2crypto.ts` separates `ciphertext` and `auth_tag`.
- The envelope labels differ (`HPKE` vs `HPKE-v1`), and each uses slightly
  different field shapes.

**Impact:** Cross-runtime or cross-language implementations can easily diverge.
A single canonical envelope specification is required for compatibility.

### 6. Algorithm identifiers and key encodings lack IANA alignment

- KEM identifiers like `"X25519(+ML-KEM-768)"` and `"ML-DSA-44+Ed25519"` are
  application-specific strings, not IANA-registered COSE or JOSE values.
- PQC keys are represented as base64url-encoded raw bytes in some places and
  hex in others, without a common COSE_Key or JWK profile.

**Impact:** Standardization would require explicit algorithm registration and
consistent key representations aligned with COSE/JOSE or DID key formats.

## Standardization Opportunities and Recommendations

### A. Adopt W3C Data Integrity conventions for PQC proofs

- Register a cryptosuite name (e.g., `ml-dsa-44-jcs-2024` once a stable
  definition exists) and switch `proofValue` to multibase.
- Replace `Ed25519Signature2020` with a Data Integrity cryptosuite aligned
  with JCS (e.g., `eddsa-jcs-2022`).
- Include `created`, `domain`, and `challenge` fields where appropriate to
  improve replay resistance and alignment with VC 2.0 expectations.

### B. Align DID resolution and key encoding

- Resolve `verificationMethod` via DID documents rather than parsing fragments
  as hex. If using `did:key`, decode multibase/multicodec to recover raw
  public keys.
- Specify a single key encoding for PQC keys (e.g., COSE_Key parameters for
  ML-DSA/ML-KEM) so verifiers can interoperate without proprietary parsing.

### C. Rework COSE signing to COSE_Sign with multiple signatures

- Use `COSE_Sign` and include separate signatures for Ed25519 and ML-DSA.
- Register or reference draft COSE algorithms if using hybrid identifiers, or
  encapsulate hybrid semantics in a profile document.
- Avoid concatenated signatures; they are non-standard and prevent library
  interoperability.

### D. Recast Layer 2 encryption as HPKE-compatible hybrid KEM

- Adopt RFC 9180 HPKE interfaces and use a standardized hybrid KEM combiner
  for X25519 + ML-KEM-768.
- Use labeled HKDF inputs and a defined `info` context for suite and version
  binding. Avoid using AAD as the salt.
- Publish a stable envelope schema and enforce it across
  `src/core/l2crypto.ts` and `src/weba_l2crypto.ts`.

### E. Provide a formal algorithm registry for Web/A

- If standardization is a goal, define a registry for algorithm identifiers
  and envelope versions, with explicit field requirements, encoding rules, and
  test vectors.
- Add a conformance section to the specs and include canonical test vectors
  for hybrid KEM and hybrid signatures.

## Immediate Implementation Gaps (Actionable)

- Ensure `did:key` parsing uses multibase decoding rather than hex slicing.
- Unify `Layer2Encrypted` envelope schema and ciphertext/tag handling.
- Replace custom `alg` strings with well-scoped identifiers and publish a
  mapping to expected key types and encodings.

## Conclusion

Sorane already demonstrates the core ideas of hybrid PQC deployment, but its
current identifiers, key encodings, and envelope formats are not aligned with
existing international standards. With focused refactoring around Data
Integrity cryptosuites, COSE multi-signature structures, and HPKE-compatible
hybrid KEM construction, the project can become a credible candidate for
standardization discussions while improving immediate interoperability.
