import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { ManifestManager } from "../src/ssg/ManifestManager";
import { generatePluginManifest, detectRequiredPlugins } from "../src/form/runtime/plugin-detector";
import type { DetectionContext } from "../src/form/runtime/types";
import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';

/**
 * Integration Tests for Manifest Blob Processing
 *
 * These tests ensure that the complete flow works:
 * 1. ManifestManager compresses and Base64-encodes blobs
 * 2. Blobs are correctly embedded in HTML
 * 3. Client-side code can decode Base64 and decompress GZIP
 *
 * This would have caught the "Failed to parse manifest" bug.
 */

describe("Manifest Blob Processing Integration", () => {
    const testDir = path.resolve('.cache/test-manifest-processing');
    let manager: ManifestManager;

    beforeEach(async () => {
        await fs.ensureDir(testDir);
        manager = new ManifestManager(testDir);
    });

    afterEach(async () => {
        await fs.remove(testDir);
    });

    describe("GZIP Compression", () => {
        test("addBlob: compresses large JSON data automatically", async () => {
            const largeData = JSON.stringify({
                data: 'x'.repeat(1000)
            });

            const blob = await manager.addBlob({
                id: 'test-large-json',
                content: largeData,
                mediaType: 'application/json'
            });

            // Should be compressed
            expect(blob.mediaType).toBe('application/x-gzip');
            expect(blob.size).toBeLessThan(largeData.length);
        });

        test("addBlob: does not compress small data", async () => {
            const smallData = JSON.stringify({ small: 'data' });

            const blob = await manager.addBlob({
                id: 'test-small-json',
                content: smallData,
                mediaType: 'application/json'
            });

            // Should NOT be compressed (< 512 bytes)
            expect(blob.mediaType).toBe('application/json');
        });

        test("addBlob: compresses large JavaScript", async () => {
            const largeJs = 'function test() { return "' + 'x'.repeat(1000) + '"; }';

            const blob = await manager.addBlob({
                id: 'test-large-js',
                content: largeJs,
                mediaType: 'application/javascript'
            });

            expect(blob.mediaType).toBe('application/x-gzip');
        });

        test("addBlob: does not double-compress already compressed data", async () => {
            const originalData = 'x'.repeat(1000);
            const compressed = zlib.gzipSync(Buffer.from(originalData));

            const blob = await manager.addBlob({
                id: 'test-precompressed',
                content: compressed,
                mediaType: 'application/x-gzip'
            });

            // Should NOT double-compress
            expect(blob.mediaType).toBe('application/x-gzip');
            expect(blob.size).toBe(compressed.length);
        });
    });

    describe("Base64 Encoding", () => {
        test("addBlob: stores Base64 encoded content", async () => {
            const data = JSON.stringify({ test: 'data' });

            const blob = await manager.addBlob({
                id: 'test-base64',
                content: data,
                mediaType: 'application/json'
            });

            const base64Content = (blob as any)._content;
            expect(base64Content).toBeDefined();
            expect(base64Content).toMatch(/^[A-Za-z0-9+/=]+$/);
        });

        test("Base64 content can be decoded back to original buffer", async () => {
            const originalData = 'x'.repeat(1000);

            const blob = await manager.addBlob({
                id: 'test-roundtrip',
                content: originalData,
                mediaType: 'text/plain'
            });

            const base64Content = (blob as any)._content;
            const decoded = Buffer.from(base64Content, 'base64');

            // Decompress the decoded data
            const decompressed = zlib.gunzipSync(decoded);
            expect(decompressed.toString()).toBe(originalData);
        });
    });

    describe("HTML Injection", () => {
        test("generateInjectionHtml: embeds Base64 content in script tags", async () => {
            const data = JSON.stringify({ test: 'data' });

            await manager.addBlob({
                id: 'test-embed',
                content: data,
                mediaType: 'application/json'
            });

            const html = manager.generateInjectionHtml();

            expect(html).toContain('<script id="weba-blob-');
            expect(html).toContain('window.__WEBA_MANIFEST');
            expect(html).toMatch(/<script id="weba-blob-[^"]+" type="[^"]+">([A-Za-z0-9+/=]+)<\/script>/);
        });

        test("generateInjectionHtml: creates valid HTML structure", async () => {
            const data = JSON.stringify({ test: 'data' });

            await manager.addBlob({
                id: 'test-structure',
                content: data,
                mediaType: 'application/json'
            });

            const html = manager.generateInjectionHtml();

            // Check structure
            expect(html).toContain('<!-- Web/A L1 Manifest & Blobs -->');
            expect(html).toContain('<script>window.__WEBA_MANIFEST');

            // Validate that manifest is valid JSON
            const manifestMatch = html.match(/window\.__WEBA_MANIFEST = ({.*?});/s);
            expect(manifestMatch).toBeTruthy();
            const manifestObj = JSON.parse(manifestMatch![1]);
            expect(manifestObj.blobs).toBeDefined();
            expect(Array.isArray(manifestObj.blobs)).toBe(true);
        });

        test("embedded Base64 can be extracted from HTML", async () => {
            const originalData = 'x'.repeat(1000);

            await manager.addBlob({
                id: 'test-extraction',
                content: originalData,
                mediaType: 'text/plain'
            });

            const html = manager.generateInjectionHtml();

            // Extract Base64 from script tag
            const match = html.match(/<script id="weba-blob-[^"]+" type="[^"]+">([^<]+)<\/script>/);
            expect(match).toBeTruthy();

            const embeddedBase64 = match![1];
            expect(embeddedBase64).toMatch(/^[A-Za-z0-9+/=]+$/);

            // Decode and decompress
            const decoded = Buffer.from(embeddedBase64, 'base64');
            const decompressed = zlib.gunzipSync(decoded);
            expect(decompressed.toString()).toBe(originalData);
        });
    });

    describe("Plugin Manifest Processing", () => {
        test("plugin manifest can be added, embedded, and decoded", async () => {
            const context: DetectionContext = {
                structure: { needsPostal: true, needsLg: true } as any,
                rawMarkdown: "",
                frontmatter: {}
            };

            const detection = detectRequiredPlugins(context);
            const manifestJson = generatePluginManifest(detection);

            const blob = await manager.addBlob({
                id: 'weba-plugin-manifest',
                content: manifestJson,
                mediaType: 'application/json'
            });

            const base64Content = (blob as any)._content;
            expect(base64Content).toBeDefined();

            // Decode (may or may not be compressed, depending on size)
            const decoded = Buffer.from(base64Content, 'base64');
            let finalContent: string;

            if (blob.mediaType === 'application/x-gzip') {
                const decompressed = zlib.gunzipSync(decoded);
                finalContent = decompressed.toString();
            } else {
                finalContent = decoded.toString();
            }

            const parsed = JSON.parse(finalContent);

            expect(parsed.plugins).toContain('postal');
            expect(parsed.plugins).toContain('lg');
        });

        test("full flow: detect → manifest → embed → decode", async () => {
            const context: DetectionContext = {
                structure: { needsPostal: true } as any,
                rawMarkdown: "Email: <input validation:email>",
                frontmatter: {}
            };

            // Step 1: Detect plugins
            const detection = detectRequiredPlugins(context);
            expect(detection.plugins).toContain('postal');
            expect(detection.plugins).toContain('validation-email');

            // Step 2: Generate manifest
            const manifestJson = generatePluginManifest(detection);

            // Step 3: Add to ManifestManager
            await manager.addBlob({
                id: 'weba-plugin-manifest',
                content: manifestJson,
                mediaType: 'application/json'
            });

            // Step 4: Generate HTML
            const html = manager.generateInjectionHtml();
            expect(html).toContain('weba-plugin-manifest');

            // Step 5: Extract and decode (simulating client-side processing)
            const manifestMatch = html.match(/window\.__WEBA_MANIFEST = ({.*?});/s);
            const manifest = JSON.parse(manifestMatch![1]);
            const manifestBlob = manifest.blobs.find((b: any) => b.id === 'weba-plugin-manifest');
            expect(manifestBlob).toBeDefined();

            // Step 6: Get Base64 content from script tag
            const scriptMatch = html.match(
                new RegExp(`<script id="${manifestBlob.urls[0].substring(1)}" type="${manifestBlob.mediaType}">([^<]+)<\\/script>`)
            );
            expect(scriptMatch).toBeTruthy();

            const base64Content = scriptMatch![1];

            // Step 7: Decode and decompress (this is what the client does)
            const bin = atob(base64Content);
            const ui8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) {
                ui8[i] = bin.charCodeAt(i);
            }

            // Decompress using Node's zlib (in browser this would be DecompressionStream)
            let finalJson: any;
            if (manifestBlob.mediaType === 'application/x-gzip') {
                const decompressed = zlib.gunzipSync(Buffer.from(ui8));
                finalJson = JSON.parse(decompressed.toString());
            } else {
                finalJson = JSON.parse(Buffer.from(ui8).toString());
            }

            // Step 8: Verify final result
            expect(finalJson.plugins).toEqual(detection.plugins);
            expect(finalJson.dataBlobs).toEqual(detection.dataBlobs);
        });
    });

    describe("Regression Tests", () => {
        test("REGRESSION: parsePluginManifest should not receive Base64 directly", async () => {
            // This test documents the bug that was fixed:
            // bundler.ts and index-plugin.ts were passing Base64 data
            // directly to parsePluginManifest without decoding

            const manifestJson = generatePluginManifest({
                plugins: ['postal'],
                dataBlobs: ['jp-postal'],
                metadata: { hasPostal: true, hasLg: false, hasEmailValidation: false, hasTelValidation: false }
            });

            const blob = await manager.addBlob({
                id: 'test-regression',
                content: manifestJson,
                mediaType: 'application/json'
            });

            const base64Content = (blob as any)._content;

            // The bug: this Base64 string was passed to parsePluginManifest
            expect(base64Content).toMatch(/^[A-Za-z0-9+/=]+$/);
            expect(base64Content).not.toContain('{');
            expect(base64Content).not.toContain('plugins');

            // The fix: decode and conditionally decompress
            const decoded = Buffer.from(base64Content, 'base64');
            let jsonString: string;

            if (blob.mediaType === 'application/x-gzip' || blob.mediaType.includes('gzip')) {
                const decompressed = zlib.gunzipSync(decoded);
                jsonString = decompressed.toString();
            } else {
                jsonString = decoded.toString();
            }

            // Now it's valid JSON
            expect(jsonString).toContain('{');
            expect(jsonString).toContain('plugins');

            const parsed = JSON.parse(jsonString);
            expect(parsed.plugins).toContain('postal');
        });
    });
});
