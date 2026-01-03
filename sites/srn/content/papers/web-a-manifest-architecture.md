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

### 2.3 Feature-Based Conditional Loading (Advanced Optimization)

For large runtime dependencies like the WASM crypto module, the Manifest Architecture enables **feature-based conditional loading**:

*   **Static Analysis**: During the build process, the presence of specific features (e.g., L2 Encryption config) is detected.
*   **Selective Blob Registration**: Heavy blobs are registered in the manifest **only if the feature is actively used** in that document.
*   **Zero Overhead for Unused Features**: Documents without L2E do not include the WASM module, saving ~454KB.

**Example:** The Web/A crypto WASM (`weba_crypto.wasm`, ~454KB) is only registered when:
*   The form includes L2 encryption configuration (`l2_encrypt: true`), or
*   The content references L2-related features (`weba-l2-encrypt`, etc.)

This strategy maintains the Single File principle while avoiding unnecessary bloat.

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

---

## 7. Appendix: Development Tools Integration (Form Maker)

### 7.1. Dynamic Preview Strategy
In development tools such as the **Form Maker**, the preview functionality adopts a **"Dynamic Load via Virtual Manifest"** approach to avoid the overhead of repeated Base64 encoding (Packing).

*   **Simulation of "Pruned" State**:
    *   The preview environment is intentionally constructed as a "Pruned" state where Blobs are detached.
    *   The generated HTML does not embed large `<script>` tags. Instead, the `window.__WEBA_MANIFEST` is dynamically populated with direct HTTP URLs pointing to assets on the development server (e.g., `/assets/mermaid.min.js`).
*   **Runtime Reuse**:
    *   Since the standard Web/A runtime includes a fallback mechanism within the `urls` array, assets can be dynamically loaded and executed using the same production logic without requiring a custom loader for the Maker.

This strategy allows developers to edit and verify production-equivalent functionality (such as postal dictionaries and rendering engines) in a lightweight and high-performance environment.

