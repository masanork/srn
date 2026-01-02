# Web/A L1/L2 Binding & Manifest Specification

## 1. Context & Problem Statement

In the Web/A 4-layer model, Layer 1 (L1) defines the template, schema, and constraints.
If L1 directly includes large master data (dictionaries, code tables, address lists), it leads to:
*   **Bloat:** Increased cost for distribution, storage, and verification.
*   **Update Paradox:** Updating a master data entry requires re-signing the entire template.
*   **Retention Issues:** Hard to "prune" heavy data while maintaining long-term verifiability (LTV).

## 2. Solution Architecture

To solve this, we separate L1 into **"L1-Core"** and **"L1-Manifest"**, and move heavy data to **"Master Blobs"**.

*   **L1-Core:** Minimal definition (Schema, Logic, fixed vocabulary).
*   **Master Blobs:** External data chunks (CBOR/Parquet/JSON) addressed by content hash (digest).
*   **L1-Manifest:** A list of references to Master Blobs.
*   **L2 Binding:** The Layer 2 (User Data) **MUST** include the digests of the L1-Core and Manifest it used. This "Context" is included in the **Payload Signature**.

## 3. Data Structures (TypeScript Interfaces)

### 3.1. Master Data Reference
Metadata pointing to a prunable blob.

```typescript
export interface MasterDataRef {
  /** unique identifier for logic reference (e.g., "jp-city-codes-2025") */
  id: string;
  /** Content digest (e.g., "sha256:...") */
  digest: string;
  /** MIME type of the blob */
  mediaType: string;
  /** Size in bytes (useful for pre-flight checks) */
  size: number;
  /** Optional: hints for retrieval */
  urls?: string[];
  /** Optional: Human readable description or version info */
  description?: string;
}
```

### 3.2. L1 Manifest
The "Appendix" of the template, listing all required external data.

```typescript
export interface L1Manifest {
  /** Digest of the L1-Core (Template) this manifest belongs to */
  templateDigest: string;
  /** List of master data blobs required/available */
  blobs: MasterDataRef[];
  /** Version/Timestamp of this manifest configuration */
  createdAt: string;
}
```

### 3.3. Web/A Layer 2 Context (The Binding)
This object is embedded into the User Data (L2) before signing.

```typescript
export interface WebALayer2Context {
  /** Reference to the exact L1-Core used */
  templateRef: {
    id: string;
    digest: string;
  };
  /** Reference to the Manifest used (snapshot of master data versions) */
  manifestDigest: string;
  /** 
   * List of specific master blob digests actually relied upon.
   * (Subset of manifest, or all)
   */
  activeBlobDigests: string[];
}
```

### 3.4. Web/A Layer 2 Payload (Signed Object)
The actual object that gets canonicalized and signed.

```typescript
export interface WebALayer2Payload<T = any> {
  /** The User Data (Application specific) */
  data: T;
  /** The Binding Context (Security & LTV) */
  context: WebALayer2Context;
}
```

## 4. Operations

### 4.1. Creation & Binding
1.  **Select Template:** Application loads L1-Core and corresponding Master Blobs.
2.  **Generate/Load Manifest:** Ensure `L1Manifest` matches the current Blobs.
3.  **Create L2:** User inputs data.
4.  **Bind:** Construct `WebALayer2Context` containing:
    *   Hash of L1-Core.
    *   Hash of L1-Manifest.
    *   Hashes of active Blobs.
5.  **Construct Payload:** `payload = { data: userData, context: context }`.

### 4.2. Signing
*   **Input:** `WebALayer2Payload`
*   **Process:** 
    1.  `Canonicalize(payload)` (JCS / RFC 8785)
    2.  `Sign(canonicalBytes, privateKey)`
*   **Result:** The signature covers both the data **and** the exact version of all referenced masters.

### 4.3. Verification

#### Level 1: Lightweight Verification (Offline / No Blobs)
*   **Check:** `VerifySignature(payload, publicKey)`
*   **Check:** Integrity of `payload.context`.
*   **Guarantee:** "This data was created by User X, using Template Y and Master Set Z."
*   **Use Case:** Basic auth, rapid processing, existence proof.

#### Level 2: Full Verification (With Blobs)
*   **Check:** Level 1 checks.
*   **Fetch:** Retrieve L1-Core and Master Blobs using digests from `context`.
*   **Verify:** 
    *   `Hash(L1-Core) == context.templateRef.digest`
    *   `Hash(Blob_i) == context.activeBlobDigests[i]`
*   **Execute:** Re-run validation logic (e.g., "Is 'City code 123' valid in 'Blob A'?") using the retrieved (verified) blobs.
*   **Use Case:** Audits, disputes, rendering with strict consistency.

## 5. Security Properties

1.  **Anti-Spoofing:** An attacker cannot swap the master data (e.g., change the definition of a city code) because the digest is signed by the user.
2.  **Prunability:** The heavy Master Blobs can be deleted from the archive. The `context` remains in the signed payload, proving *what* was used, even if the data itself is gone (Level 1 verification remains valid).
3.  **Algorithm Agility:** `digest` fields support multihash or prefixed strings (e.g., `sha256:...`) allowing future upgrades.
