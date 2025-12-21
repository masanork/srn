# Implementation Plan - Next-Generation Standard Stack (SRN v2.0)

This plan outlines the transition from the current PoC (v1.0) architecture to a more standardized, production-ready stack as discussed in `issues.md`.

## 1. Identity & Resolution: did:web Migration
- **Current**: Random `did:key` per build.
- **Problem**: Issuer identity changes every build; requires custom status list for trust.
- **Policy**: Adopt `did:web`.
- **Steps**:
    - [ ] Create `site/.well-known/did.json` generator.
    - [ ] Add `base_url` to `site/content/index.md` or a global config.
    - [ ] Update `src/vc.ts` to use `did:web:<domain>` as the default issuer.
    - [ ] Implement DID Document generation including the public keys for Ed25519 and ML-DSA.

## 2. Format: W3C VC 2.0 & Enveloping (JOSE/COSE)
- **Current**: JSON-LD Proofs (JCS).
- **Goal**: Compliance with W3C VC 2.0 and preparation for EUDI Wallet / Binary transport.
- **Policy**: Implement Enveloping-style signatures.
- **Steps**:
    - [ ] Update VC payload to use `validFrom` and W3C v2 contexts.
    - [ ] Implement `JOSE` (JWT/JWP) wrapper for hybrid signatures.
    - [ ] Research `COSE` (CBOR Object Signing and Encryption) library compatibility with ML-DSA for high-efficiency binary VCs.

## 3. Presentation Integrity: C2PA Integration
- **Current**: VC signs data; WebFont ensures typography; but HTML structure isn't signed.
- **Goal**: "Verified Display" where the user knows the HTML layout hasn't been tampered with.
- **Policy**: Embed C2PA-style assertion linking the HTML to the signed JSON.
- **Steps**:
    - [ ] Implement a "Manifest Generator":
        - Calculate hash of the final HTML (with placeholders).
        - Create an assertion relating the HTML hash to the `credentialSubject`.
    - [ ] Embed the signature/manifest in an HTML meta tag or hidden header.

## 4. Key Management: Root of Trust
- **Policy**: Separate 'Deployment Keys' from 'Root ID Keys'.
- **Steps**:
    - [ ] Implement a 2-tier signature: Root signs a 'Build Delegate Certificate' (valid for X days), and Build Delegate signs the actual VCs.
    - [ ] This allows the actual Root Key to be kept offline.

## 5. Security & Privacy: Selective Disclosure
- **Goal**: Enable sharing only necessary fields (e.g., date of birth only).
- **Policy**: Future support for SD-JWT or BBS+ signatures.
- **Note**: This is complex and may wait until v2.1, but the architecture should remain modular enough to support multiple proof formats.
