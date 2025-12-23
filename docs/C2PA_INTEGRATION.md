# C2PA Integration Study for Sorane (srn)

C2PA (Content Provenance and Authenticity) provides a way to verify the "origin" and "integrity" of assets. In Sorane, we aim to apply this to dynamic assets like **SubsetFonts** and **Rendered HTML**.

---

## 1. Challenges in SSG Context

### A. Non-Standard Hybrid PQC Signatures
C2PA standardly supports X.509 and classic algorithms (ES256, etc.). Sorane uses a **Hybrid (Classic + PQC)** model.
- **Problem**: Standard C2PA toolkits cannot verify ML-DSA signatures.
- **Solution**: Use a "Custom Assertion" within the C2PA manifest to store the PQC component, or wrap the entire C2PA structure inside a Sorane-specific COSE container.

### B. Font Integration (WOFF2/SFNT)
While C2PA defines metadata boxes for JPEG/PNG (e.g., `JUMBF`), there is no finalized standard for fonts.
- **Option 1 (C2PA-like)**: Use the SFNT `meta` table or a custom `SRNC` (Sorane Claim) table to store the provenance manifest.
- **Option 2 (Sidecar)**: Keep the signature in a `.vc.cbor` file next to the font (Current status).

### C. Performance & Build Time
Generating C2PA manifests for every image and font can slow down the build.
- **Solution**: Only generate C2PA for "High-Value Assets" (like SubsetFonts used in certificates or Juminhyo).

---

## 2. Proposed Architecture: "Sorane Provenance Box"

Instead of a full C2PA stack (which is complex and requires specialized tooling), we implement a **"Light Provenance Case"** compatible with the C2PA structural philosophy:

1.  **Hashed Data**: The asset (e.g., Font binary) is hashed.
2.  **Manifest**: A JSON/CBOR structure containing:
    - `generator`: "Sorane SSG v2.x"
    - `buildId`: Unique build ID.
    - `siteDid`: The issuer's DID.
    - `hash`: SHA-256 of the asset.
3.  **Hybrid Signature**: The Manifest is signed using the **Delegate Build Key** (Hybrid).
4.  **Injection**: The signed Manifest is injected as a custom table into the Font file.

---

## 3. Implementation Plan: Font Provencance

### Step 1: Manifest Generation
Create a structure that stores the provenance of a font.
```json
{
  "alg": "ML-DSA-44+Ed25519",
  "issuer": "did:web:masanork.github.io",
  "build": "build-123456",
  "asset_hash": "..."
}
```

### Step 2: Custom Table Injection
[x] Done. Modified `src/font.ts` to support `SRNC` table injection.

### Step 3: Global Build Integration
[x] Done. `src/index.ts` automatically signs and injects provenance into all subsetted fonts.

### Step 4: Verification Logic (Future)
The Browser App (`src/client/verify-app.ts`) will:
1.  Read the font file from the HTML/CSS.
2.  Extract the `SRNC` table.
3.  Verify the signature against the `did:web` of the site.
4.  Confirm the font itself hasn't been tampered with by hashing it (excluding `SRNC`).
