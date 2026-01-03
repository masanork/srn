import { describe, expect, test } from "bun:test";
import {
    generatePluginHash,
    generateEntryPoint,
    PLUGIN_IMPORTS,
    PLUGIN_EXPORTS,
    CACHE_DIR,
    SRC_DIR
} from "./bundler";
import path from 'path';

/**
 * Tests for Custom Plugin Bundler
 *
 * These tests are designed to catch regressions like:
 * 1. Missing global function bindings (addTableRow, etc.)
 * 2. Missing Base64+GZIP decompression code
 * 3. Incorrect plugin hash generation
 */

describe("Custom Plugin Bundler", () => {
    describe("Code Generation", () => {
        test("generateEntryPoint produces valid TypeScript/JavaScript code structure", () => {
            const code = generateEntryPoint(['postal']);

            // Basic structure checks
            expect(code).toContain('export async function initPluginRuntime()');
            expect(code).toContain('import {');
            expect(code).toContain('new FormRuntime()');
            expect(code).toContain('new PluginManager()');

            // Manager instantiation
            expect(code).toContain('new Calculator()');
            expect(code).toContain('new DataManager()');
            expect(code).toContain('new UIManager(calc, dm)');
        });

        test("generateEntryPoint exposes all required UI global functions", () => {
            const code = generateEntryPoint(['postal']);

            // Critical: These global functions must be exposed
            // This test would have caught the "addTableRow is not defined" bug
            const expectedFunctions = [
                'w.addTableRow =',
                'w.removeTableRow =',
                'w.switchTab =',
                'w.saveDraft =',
                'w.submitDocument =',
                'w.signAndDownload =',
                'w.clearData =',
                'w.recalculate ='
            ];

            expectedFunctions.forEach(fn => {
                expect(code).toContain(fn);
            });
        });

        test("generateEntryPoint includes Base64+GZIP decompression code", () => {
            const code = generateEntryPoint(['postal']);

            // Critical: Must decode Base64 and decompress GZIP
            // This test would have caught the "Failed to parse manifest" bug
            expect(code).toContain('atob(');
            expect(code).toContain('Uint8Array');
            expect(code).toContain("new DecompressionStream('gzip')");
            expect(code).toContain('new Response(stream).text()');
        });

        test("generateEntryPoint includes initialization sequence", () => {
            const code = generateEntryPoint(['postal']);

            // Must call initialization methods
            expect(code).toContain('dm.restoreFromLS()');
            expect(code).toContain('uim.applyI18n()');
            expect(code).toContain('uim.initTables()');
            expect(code).toContain('calc.recalculate()');
        });

        test("generateEntryPoint handles multiple plugins", () => {
            const code = generateEntryPoint(['postal', 'lg']);

            expect(code).toContain('postalPlugin');
            expect(code).toContain('lgPlugin');
        });

        test("generateEntryPoint includes auto-initialization", () => {
            const code = generateEntryPoint(['postal']);

            expect(code).toContain("if (typeof window !== 'undefined')");
            expect(code).toContain("document.readyState === 'loading'");
            expect(code).toContain("document.addEventListener('DOMContentLoaded'");
            expect(code).toContain('initPluginRuntime()');
        });
    });

    describe("Hash Generation", () => {
        test("generatePluginHash is deterministic", () => {
            const hash1 = generatePluginHash(['postal', 'lg']);
            const hash2 = generatePluginHash(['postal', 'lg']);
            expect(hash1).toBe(hash2);
        });

        test("generatePluginHash is order-independent", () => {
            const hash1 = generatePluginHash(['postal', 'lg']);
            const hash2 = generatePluginHash(['lg', 'postal']);
            expect(hash1).toBe(hash2);
        });

        test("generatePluginHash produces different hashes for different plugins", () => {
            const hash1 = generatePluginHash(['postal']);
            const hash2 = generatePluginHash(['lg']);
            const hash3 = generatePluginHash(['postal', 'lg']);

            expect(hash1).not.toBe(hash2);
            expect(hash1).not.toBe(hash3);
            expect(hash2).not.toBe(hash3);
        });

        test("generatePluginHash produces 16-character hex string", () => {
            const hash = generatePluginHash(['postal']);
            expect(hash).toMatch(/^[a-f0-9]{16}$/);
        });
    });

    describe("Plugin Imports", () => {
        test("PLUGIN_IMPORTS contains absolute paths", () => {
            const postalImport = PLUGIN_IMPORTS['postal'];

            expect(postalImport).toContain('import');
            expect(postalImport).toContain('postalPlugin');
            expect(postalImport).toContain('plugins/postal.js');
        });

        test("PLUGIN_EXPORTS maps to correct plugin names", () => {
            expect(PLUGIN_EXPORTS['postal']).toBe('postalPlugin');
            expect(PLUGIN_EXPORTS['lg']).toBe('lgPlugin');
        });
    });

    describe("Cache Management", () => {
        test("CACHE_DIR is defined", () => {
            expect(CACHE_DIR).toContain('.cache/plugin-bundles');
        });

        test("SRC_DIR points to form directory", () => {
            expect(SRC_DIR).toContain('src/form');
        });
    });
});
