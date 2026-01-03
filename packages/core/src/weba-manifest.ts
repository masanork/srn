import { canonicalJson } from "./l2crypto";
import { sha256Hash } from "./wasm_core";
import { bytesToHex } from "./encoding";

// --- Data Structures (from work/WEBA_L1_L2_SPEC.md) ---

export interface MasterDataRef {
  /** unique identifier for logic reference (e.g., "jp-city-codes-2025") */
  id: string;
  /** Content digest (e.g., "sha256:...") */
  digest: string;
  /** MIME type of the blob */
  mediaType: string;
  /** Size in bytes */
  size: number;
  /** Optional: hints for retrieval */
  urls?: string[];
  /** Optional: Human readable description or version info */
  description?: string;
}

export interface L1Manifest {
  /** Digest of the L1-Core (Template) this manifest belongs to */
  templateDigest: string;
  /** List of master data blobs required/available */
  blobs: MasterDataRef[];
  /** Version/Timestamp of this manifest configuration */
  createdAt: string;
}

export interface WebALayer2Context {
  /** Reference to the exact L1-Core used */
  templateRef: {
    id: string;
    digest: string;
  };
  /** Reference to the Manifest used */
  manifestDigest: string;
  /** 
   * List of specific master blob digests actually relied upon.
   */
  activeBlobDigests: string[];
}

export interface WebALayer2Payload<T = any> {
  /** The User Data (Application specific) */
  data: T;
  /** The Binding Context (Security & LTV) */
  context: WebALayer2Context;
}

// --- Logic ---

/**
 * Computes the SHA-256 digest of a blob or object (after canonicalization).
 * Returns format: "sha256:<hex>"
 */
export async function computeDigest(content: Uint8Array | object): Promise<string> {
  let bytes: Uint8Array;
  if (content instanceof Uint8Array) {
    bytes = content;
  } else {
    const json = canonicalJson(content);
    bytes = new TextEncoder().encode(json);
  }
  const hash = await sha256Hash(bytes);
  return `sha256:${bytesToHex(hash)}`;
}

/**
 * Creates a Web/A Layer 2 Payload with proper binding context.
 */
export async function createWebALayer2Payload<T>(
  data: T,
  l1Core: { id: string; content: object },
  manifest: L1Manifest,
  activeBlobIds?: string[] // If omitted, assumes all blobs in manifest are active
): Promise<WebALayer2Payload<T>> {
  
  // 1. Compute Template Digest
  const templateDigest = await computeDigest(l1Core.content);
  if (manifest.templateDigest && manifest.templateDigest !== templateDigest) {
    throw new Error(`Manifest templateDigest mismatch. Manifest expects ${manifest.templateDigest}, got ${templateDigest}`);
  }

  // 2. Compute Manifest Digest
  const manifestDigest = await computeDigest(manifest);

  // 3. Resolve Active Blobs
  let activeDigests: string[] = [];
  if (activeBlobIds) {
    const missing = activeBlobIds.filter(id => !manifest.blobs.find(b => b.id === id));
    if (missing.length > 0) {
      throw new Error(`Active blobs not found in manifest: ${missing.join(", ")}`);
    }
    activeDigests = manifest.blobs
      .filter(b => activeBlobIds.includes(b.id))
      .map(b => b.digest);
  } else {
    activeDigests = manifest.blobs.map(b => b.digest);
  }

  // 4. Construct Context
  const context: WebALayer2Context = {
    templateRef: {
      id: l1Core.id,
      digest: templateDigest,
    },
    manifestDigest: manifestDigest,
    activeBlobDigests: activeDigests,
  };

  return {
    data,
    context,
  };
}

/**
 * Lightweight Verification: Checks integrity of the Context structure.
 * Does NOT fetch external blobs.
 */
export async function verifyWebALayer2ContextIntegrity(
  payload: WebALayer2Payload
): Promise<boolean> {
  // Basic structural check
  if (!payload.context || !payload.context.templateRef || !payload.context.manifestDigest) {
    return false;
  }
  // Check digest formats
  const isSha256 = (s: string) => s.startsWith("sha256:") && s.length === 7 + 64;
  
  if (!isSha256(payload.context.templateRef.digest)) return false;
  if (!isSha256(payload.context.manifestDigest)) return false;
  if (!Array.isArray(payload.context.activeBlobDigests)) return false;
  if (!payload.context.activeBlobDigests.every(isSha256)) return false;

  return true;
}

/**
 * Full Verification Input
 */
export interface VerificationSource {
  fetchL1Core: (id: string) => Promise<object | null>;
  fetchManifest: (digest: string) => Promise<L1Manifest | null>;
  fetchBlob: (digest: string) => Promise<Uint8Array | null>;
}

/**
 * Full Verification: Fetches and verifies all referenced dependencies.
 */
export async function verifyWebALayer2Dependencies(
  payload: WebALayer2Payload,
  source: VerificationSource
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const ctx = payload.context;

  // 1. Fetch & Verify L1 Core
  const l1Core = await source.fetchL1Core(ctx.templateRef.id);
  if (!l1Core) {
    errors.push(`L1 Core not found: ${ctx.templateRef.id}`);
  } else {
    const digest = await computeDigest(l1Core);
    if (digest !== ctx.templateRef.digest) {
      errors.push(`L1 Core digest mismatch: expected ${ctx.templateRef.digest}, got ${digest}`);
    }
  }

  // 2. Fetch & Verify Manifest
  const manifest = await source.fetchManifest(ctx.manifestDigest);
  if (!manifest) {
    errors.push(`Manifest not found: ${ctx.manifestDigest}`);
  } else {
    const digest = await computeDigest(manifest);
    if (digest !== ctx.manifestDigest) {
      errors.push(`Manifest digest mismatch: expected ${ctx.manifestDigest}, got ${digest}`);
    } else {
       // 2.1 Verify Manifest vs Template
       if (manifest.templateDigest !== ctx.templateRef.digest) {
         errors.push(`Manifest links to different template: ${manifest.templateDigest}`);
       }
    }
  }

  // 3. Verify Blobs (Existence in Manifest)
  if (manifest) {
    for (const activeDigest of ctx.activeBlobDigests) {
      const entry = manifest.blobs.find(b => b.digest === activeDigest);
      if (!entry) {
        errors.push(`Active blob ${activeDigest} not listed in referenced Manifest`);
      }
      // Note: We could strictly fetch every blob here, but "Full Verification" usually means
      // "Can I reconstruct the logic?". If the user asks for logic reconstruction, 
      // they will request the blobs from the source using these digests.
      // Strictly checking *existence* of blob in source:
      const blob = await source.fetchBlob(activeDigest);
      if (!blob) {
         errors.push(`Blob content missing in source: ${activeDigest}`);
      } else {
         const d = await computeDigest(blob);
         if (d !== activeDigest) {
            errors.push(`Blob content corrupted: ${activeDigest}`);
         }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
