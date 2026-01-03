import { describe, expect, test } from "bun:test";
import {
    detectRequiredPlugins,
    generatePluginManifest,
    parsePluginManifest,
    type PluginDetectionResult
} from "./plugin-detector";
import type { DetectionContext } from "./types";

/**
 * Tests for Plugin Detection System
 *
 * These tests ensure that:
 * 1. Plugins are correctly detected from form structure and markdown
 * 2. Plugin manifests are correctly generated and parsed
 * 3. Base64+GZIP encoding/decoding works correctly (integration with ManifestManager)
 */

describe("Plugin Detection", () => {
    describe("detectRequiredPlugins", () => {
        test("detects postal plugin from structure.needsPostal", () => {
            const context: DetectionContext = {
                structure: { needsPostal: true } as any,
                rawMarkdown: "",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('postal');
            expect(result.dataBlobs).toContain('jp-postal');
            expect(result.metadata.hasPostal).toBe(true);
        });

        test("detects postal plugin from markdown 'autofill:postal'", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Please enter your address. Use autofill:postal for convenience.",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('postal');
            expect(result.dataBlobs).toContain('jp-postal');
            expect(result.metadata.hasPostal).toBe(true);
        });

        test("detects postal plugin from data-autofill attribute", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: '<input data-autofill="postal:address">',
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('postal');
        });

        test("detects LG plugin from structure.needsLg", () => {
            const context: DetectionContext = {
                structure: { needsLg: true } as any,
                rawMarkdown: "",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('lg');
            expect(result.dataBlobs).toContain('jp-lg');
            expect(result.metadata.hasLg).toBe(true);
        });

        test("detects LG plugin from markdown 'autofill:lg'", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Select your municipality using autofill:lg",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('lg');
            expect(result.dataBlobs).toContain('jp-lg');
        });

        test("detects email validation plugin", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Email: <input type=\"email\" validation:email>",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('validation-email');
            expect(result.metadata.hasEmailValidation).toBe(true);
        });

        test("detects tel validation plugin from validation:tel", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Phone: <input type=\"tel\" validation:tel>",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('validation-tel');
            expect(result.metadata.hasTelValidation).toBe(true);
        });

        test("detects tel validation plugin from autofill:tel", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Phone: <input autofill:tel>",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('validation-tel');
        });

        test("detects required validation plugin", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Name: <input required>",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toContain('validation-required');
            expect(result.metadata.hasRequiredValidation).toBe(true);
        });

        test("detects multiple plugins simultaneously", () => {
            const context: DetectionContext = {
                structure: { needsPostal: true, needsLg: true } as any,
                rawMarkdown: `
                    Address: <input autofill:postal required>
                    Municipality: <input autofill:lg>
                    Email: <input validation:email>
                    Phone: <input validation:tel>
                `,
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toEqual(
                expect.arrayContaining([
                    'postal',
                    'lg',
                    'validation-email',
                    'validation-tel',
                    'validation-required'
                ])
            );
            expect(result.dataBlobs).toEqual(
                expect.arrayContaining(['jp-postal', 'jp-lg'])
            );
        });

        test("returns sorted plugin and dataBlob arrays", () => {
            const context: DetectionContext = {
                structure: { needsLg: true, needsPostal: true } as any,
                rawMarkdown: "",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            // Arrays should be sorted for consistency
            expect(result.plugins).toEqual([...result.plugins].sort());
            expect(result.dataBlobs).toEqual([...result.dataBlobs].sort());
        });

        test("returns empty arrays when no plugins detected", () => {
            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: "Simple form with no special features",
                frontmatter: {}
            };

            const result = detectRequiredPlugins(context);

            expect(result.plugins).toEqual([]);
            expect(result.dataBlobs).toEqual([]);
        });
    });

    describe("generatePluginManifest", () => {
        test("generates valid JSON manifest", () => {
            const detection: PluginDetectionResult = {
                plugins: ['postal', 'lg'],
                dataBlobs: ['jp-postal', 'jp-lg'],
                metadata: {
                    hasPostal: true,
                    hasLg: true,
                    hasEmailValidation: false,
                    hasTelValidation: false
                }
            };

            const manifest = generatePluginManifest(detection);
            const parsed = JSON.parse(manifest);

            expect(parsed.plugins).toEqual(['postal', 'lg']);
            expect(parsed.dataBlobs).toEqual(['jp-postal', 'jp-lg']);
            expect(parsed.metadata.hasPostal).toBe(true);
            expect(parsed.metadata.hasLg).toBe(true);
            expect(parsed.generatedAt).toBeDefined();
        });

        test("includes timestamp in generated manifest", () => {
            const detection: PluginDetectionResult = {
                plugins: ['postal'],
                dataBlobs: ['jp-postal'],
                metadata: { hasPostal: true, hasLg: false, hasEmailValidation: false, hasTelValidation: false }
            };

            const manifest = generatePluginManifest(detection);
            const parsed = JSON.parse(manifest);

            expect(parsed.generatedAt).toBeDefined();
            expect(new Date(parsed.generatedAt).toString()).not.toBe('Invalid Date');
        });

        test("produces pretty-printed JSON", () => {
            const detection: PluginDetectionResult = {
                plugins: ['postal'],
                dataBlobs: ['jp-postal'],
                metadata: { hasPostal: true, hasLg: false, hasEmailValidation: false, hasTelValidation: false }
            };

            const manifest = generatePluginManifest(detection);

            // Pretty-printed JSON should have newlines and indentation
            expect(manifest).toContain('\n');
            expect(manifest).toContain('  ');
        });
    });

    describe("parsePluginManifest", () => {
        test("parses valid manifest JSON", () => {
            const manifestJson = JSON.stringify({
                plugins: ['postal', 'lg'],
                dataBlobs: ['jp-postal', 'jp-lg'],
                metadata: { hasPostal: true, hasLg: true }
            });

            const result = parsePluginManifest(manifestJson);

            expect(result.plugins).toEqual(['postal', 'lg']);
            expect(result.dataBlobs).toEqual(['jp-postal', 'jp-lg']);
            expect(result.metadata.hasPostal).toBe(true);
        });

        test("handles missing fields gracefully", () => {
            const manifestJson = JSON.stringify({
                plugins: ['postal']
                // Missing dataBlobs and metadata
            });

            const result = parsePluginManifest(manifestJson);

            expect(result.plugins).toEqual(['postal']);
            expect(result.dataBlobs).toEqual([]);
            expect(result.metadata).toEqual({});
        });

        test("handles invalid JSON gracefully", () => {
            const invalidJson = "{ invalid json syntax ";

            const result = parsePluginManifest(invalidJson);

            expect(result.plugins).toEqual([]);
            expect(result.dataBlobs).toEqual([]);
            expect(result.metadata).toEqual({});
        });

        test("handles empty string gracefully", () => {
            const result = parsePluginManifest("");

            expect(result.plugins).toEqual([]);
            expect(result.dataBlobs).toEqual([]);
            expect(result.metadata).toEqual({});
        });

        test("handles Base64-like string gracefully (catches regression)", () => {
            // This test catches the bug where Base64 data was passed directly
            // to parsePluginManifest without decoding first
            const base64String = "ewogICJwbHVnaW5zIjogWyJwb3N0YWwiXQp9";

            const result = parsePluginManifest(base64String);

            // Should fail gracefully, not throw
            expect(result.plugins).toEqual([]);
            expect(result.dataBlobs).toEqual([]);
            expect(result.metadata).toEqual({});
        });

        test("round-trip: generate and parse", () => {
            const original: PluginDetectionResult = {
                plugins: ['postal', 'lg', 'validation-email'],
                dataBlobs: ['jp-postal', 'jp-lg'],
                metadata: {
                    hasPostal: true,
                    hasLg: true,
                    hasEmailValidation: true,
                    hasTelValidation: false
                }
            };

            const manifest = generatePluginManifest(original);
            const parsed = parsePluginManifest(manifest);

            expect(parsed.plugins).toEqual(original.plugins);
            expect(parsed.dataBlobs).toEqual(original.dataBlobs);
            expect(parsed.metadata.hasPostal).toBe(original.metadata.hasPostal);
            expect(parsed.metadata.hasLg).toBe(original.metadata.hasLg);
        });
    });
});
