---
title: "Discussion Paper: C2PA-style Asset Provenance in Typography"
layout: width
date: 2024-12-24
author: "Sorane Project Team"
---

# C2PA-style Asset Provenance in Typography

In a world of generative AI and deepfakes, the provenance of even the smallest UI elements—like fonts—matters. Sorane implements a C2PA-inspired mechanism to ensure the integrity of dynamically generated subsetted fonts.

---

## 1. The Threat Model
SubsetFonts are generated on-the-fly. An attacker could modify the font file to:
- Change glyph shapes (e.g., swapping "0" and "8").
- Inject malicious vectors into a rendering engine.
- Tamper with sensitive documents like digital certificates.

## 2. Solution: In-Font Provenance (SRNC Table)
Sorane injects a custom `SRNC` (Sorane Claim) table into the OpenType/SFNT font file.

### Process:
1.  **Subsetting**: Extract required glyphs.
2.  **Hashing**: Calculate the SHA-256 of the font binary.
3.  **Signing**: Create a COSE VC (Binary Signature) containing the hash, build metadata, and issuer DID.
4.  **Injection**: Rebuild the font with the `SRNC` table containing the signature.

## 3. Structural Compatibility
By using custom tables in the standard SFNT format, the font remains valid and usable by all browser engines, while "Provenance-Aware" verifiers can extract and validate the claim.

## 4. Future Outlook
- Extending this to rendered HTML structure hashes.
- Integration with standard C2PA manifests for images.
- Browser-native verification of font provenance.
