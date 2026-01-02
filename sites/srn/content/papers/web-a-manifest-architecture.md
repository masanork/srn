---
title: "Web/A Manifest Architecture: The Pack & Prune Strategy"
description: "Technical specification for the Web/A Manifest Architecture, enabling both Single File self-containment and Long-Term Verifiability (LTV)."
layout: article
date: 2026-01-02
author: "Masanori Kusunoki"
lang: en
---

# Web/A Manifest Architecture: The Pack & Prune Strategy

## 1. Context & Problem Statement

In the Web/A 4-layer model, **Layer 1 (Template)** defines the application, and **Layer 2 (User Data)** is its instance.
However, attempting to distribute high-functionality form applications as a single HTML file (Single File Application) presents several challenges:

*   **Bloat:** Including postal dictionaries, font files, rendering engines (e.g., Mermaid), and large master data increases file size to several MBs or more.
*   **Update Paradox:** Any update to a postal dictionary requires re-signing and re-distributing the entire template.
*   **Verification Rigidity:** Relying on external resources (CDNs) compromises Long-Term Verifiability (LTV), while embedding everything creates data that cannot be pruned.

## 2. Solution: L1-Core & L1-Manifest

To resolve these issues, we separate Layer 1 into an **"Immutable Core"** and a **"Mutable/Referable Manifest"**, managed by the **ManifestManager**.

### 2.1 Architecture Overview

*   **L1-Core (Minimal Template):**
    *   A lightweight HTML/JSON containing only schema definitions, validation logic, and UI structure.
*   **L1-Manifest:**
    *   A list of all "heavy" resources (Blobs) required by the application.
    *   Each Blob is managed via **Content-Addressing (Digest)**.
*   **Blobs (Heavy Resources):**
    *   Postal Dictionaries (`.json.gz`)
    *   Subsetted Fonts (`.woff2`)
    *   JavaScript Runtimes (`mermaid.min.js`, etc.)
    *   Large Master Data

### 2.2 The "Pack First, Prune Later" Strategy

Web/A must be operable offline and verifiable over the long term. The **Pack & Prune** strategy achieves this.

1.  **Pack (Distribution Phase):**
    *   During the build, all Blobs are **Base64 encoded and embedded as `<script>` tags** within the HTML.
    *   The manifest prioritizes **in-DOM references** (e.g., `urls: ["#dom-id", "https://external/url"]`).
    *   This ensures users receive a single HTML file that functions fully without an internet connection.

2.  **Prune (Archival Phase):**
    *   After signing/completion, the embedded Blobs (`<script>` tags) **can be deleted (Pruned)** to reduce file size.
    *   The `Digest` in the manifest remains, preserving verifiability.
    *   For re-verification or rendering, Blobs can be retrieved from the `Secondary URL` (external archives, IPFS, etc.) defined in the manifest, fully restoring the original state.

## 3. Data Structures

### 3.1 Master Data Reference (Blob Entry)

```typescript
export interface MasterDataRef {
  /** Resource ID (e.g., "font-noto-sans", "jp-postal") */
  id: string;
  /** SHA-256 Digest of the raw content */
  digest: string;
  /** MIME type (e.g., "font/woff2", "application/json") */
  mediaType: string;
  /** Original size in bytes */
  size: number;
  /** Retrieval locations (Priority order) */
  urls: string[]; 
  // e.g. ["#weba-blob-abc...", "./data/blobs/abc..."]
}
```

### 3.2 Web/A Layer 2 Context (The Binding)

Layer 2 data (User Input) is not just a set of values. It cryptographically binds **"Which Template and Which Resource Set (Manifest) were used"**.

```typescript
export interface WebALayer2Context {
  /** Reference to the L1-Core used */
  templateRef: {
    id: string;
    digest: string;
  };
  /** Reference to the Manifest used */
  manifestDigest: string;
  /** 
   * List of active blob digests actually relied upon.
   * (e.g. The specific version of the Postal Dictionary used)
   */
  activeBlobDigests: string[];
}
```

This `Context` is included in the Layer 2 Payload and signed by the user's private key, guaranteeing the **integrity of the rendering and input environment**.

## 4. ManifestManager Implementation

The `ManifestManager` implemented in the SRN (Sorane) SSG performs the following roles during the build process:

1.  **Blob Detection:** 
    *   Automatically detects font specifications, Mermaid diagrams, postal code fields, etc., within Markdown.
2.  **Deduplication & Hashing:**
    *   Calculates SHA-256 hashes of resources to eliminate duplicates and register them.
3.  **Injection:**
    *   Injects `window.__WEBA_MANIFEST` and Base64 encoded Blob data at the end of the HTML.
4.  **Runtime Bootstrapping:**
    *   Injects a lightweight client-side runtime.
    *   This runtime reads the manifest and dynamically applies fonts (`@font-face`), executes JS, and loads dictionary data.

## 5. Verification Flow

### Level 1: Lightweight Verification (Structure & Signature)
*   Verifies the Layer 2 signature.
*   Checks the format of `templateDigest` and `manifestDigest` within the `Context`.
*   **Verifiable without the Blob itself.** (Guarantees that the record of "what was used" has not been tampered with).

### Level 2: Full Verification (Reproduction)
*   Retrieves the Blob with the `digest` listed in the manifest (either embedded or external).
*   Verifies that the Blob's hash matches the `digest`.
*   Uses that Blob (correct font, correct dictionary, correct renderer) to fully reproduce the screen display and calculation logic.

## 6. Conclusion

With the Manifest Architecture, Web/A simultaneously achieves **"Single File Distribution" (Usability)**, **"Cryptographic Binding" (Trust)**, and **"Prunability" (Sustainability)**. This sets a new standard model for "Document-based" Web Applications.
