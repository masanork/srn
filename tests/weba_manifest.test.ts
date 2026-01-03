import { describe, it, expect, beforeAll } from "bun:test";
import {
  computeDigest,
  createWebALayer2Payload,
  verifyWebALayer2ContextIntegrity,
  verifyWebALayer2Dependencies,
  type L1Manifest,
  type MasterDataRef,
  type VerificationSource
} from "@srn/core";
import { initWasm } from "@srn/core";

describe("Web/A Manifest & Binding", () => {
  beforeAll(async () => {
    await initWasm();
  });

  // Test Data
  const l1Core = {
    id: "template-v1",
    content: { schema: "v1", field: "name" }
  };

  const blob1Content = new TextEncoder().encode("Blob 1 Data");
  const blob2Content = new TextEncoder().encode("Blob 2 Data");

  let l1Digest: string;
  let blob1Digest: string;
  let blob2Digest: string;
  let manifest: L1Manifest;
  let manifestDigest: string;

  it("should compute digests correctly", async () => {
    l1Digest = await computeDigest(l1Core.content);
    blob1Digest = await computeDigest(blob1Content);
    blob2Digest = await computeDigest(blob2Content);

    expect(l1Digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(blob1Digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("should create a valid payload with context", async () => {
    manifest = {
      templateDigest: l1Digest,
      blobs: [
        { id: "blob1", digest: blob1Digest, mediaType: "text/plain", size: 10 },
        { id: "blob2", digest: blob2Digest, mediaType: "text/plain", size: 10 }
      ],
      createdAt: new Date().toISOString()
    };
    manifestDigest = await computeDigest(manifest);

    const userData = { name: "Alice" };
    const payload = await createWebALayer2Payload(userData, l1Core, manifest);

    expect(payload.data).toEqual(userData);
    expect(payload.context.templateRef.id).toBe("template-v1");
    expect(payload.context.templateRef.digest).toBe(l1Digest);
    expect(payload.context.manifestDigest).toBe(manifestDigest);
    // Should include all blobs by default
    expect(payload.context.activeBlobDigests).toContain(blob1Digest);
    expect(payload.context.activeBlobDigests).toContain(blob2Digest);
  });

  it("should fail if template digest mismatches manifest", async () => {
    const badManifest = { ...manifest, templateDigest: "sha256:bad" };
    expect(
      createWebALayer2Payload({ name: "Bob" }, l1Core, badManifest)
    ).rejects.toThrow("Manifest templateDigest mismatch");
  });

  it("should support partial blob activation", async () => {
    const payload = await createWebALayer2Payload(
      { name: "Charlie" },
      l1Core,
      manifest,
      ["blob1"] // Only use blob1
    );

    expect(payload.context.activeBlobDigests).toHaveLength(1);
    expect(payload.context.activeBlobDigests[0]).toBe(blob1Digest);
  });

  it("should verify context integrity (Lightweight)", async () => {
    const payload = await createWebALayer2Payload({ name: "Alice" }, l1Core, manifest);
    const valid = await verifyWebALayer2ContextIntegrity(payload);
    expect(valid).toBe(true);

    const corruptPayload = { ...payload, context: { ...payload.context, manifestDigest: "bad" } };
    const invalid = await verifyWebALayer2ContextIntegrity(corruptPayload as any);
    expect(invalid).toBe(false);
  });

  it("should verify dependencies (Full)", async () => {
    const payload = await createWebALayer2Payload({ name: "Alice" }, l1Core, manifest);

    // Mock Source
    const source: VerificationSource = {
      fetchL1Core: async (id) => (id === "template-v1" ? l1Core.content : null),
      fetchManifest: async (d) => (d === manifestDigest ? manifest : null),
      fetchBlob: async (d) => {
        if (d === blob1Digest) return blob1Content;
        if (d === blob2Digest) return blob2Content;
        return null;
      }
    };

    const result = await verifyWebALayer2Dependencies(payload, source);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should report errors in full verification", async () => {
    const payload = await createWebALayer2Payload({ name: "Alice" }, l1Core, manifest);

    // Mock Source with missing blob
    const source: VerificationSource = {
      fetchL1Core: async () => l1Core.content,
      fetchManifest: async () => manifest,
      fetchBlob: async (d) => (d === blob1Digest ? blob1Content : null) // Blob 2 missing
    };

    const result = await verifyWebALayer2Dependencies(payload, source);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Blob content missing");
  });
});
