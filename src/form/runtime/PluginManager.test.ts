import { describe, expect, test, beforeEach, mock } from "bun:test";
import { PluginManager } from "./PluginManager";
import type { FormPlugin, DetectionContext, PluginInitResult } from "./types";

/**
 * Tests for Plugin Manager
 *
 * These tests ensure that:
 * 1. Plugins are correctly registered and managed
 * 2. Plugin detection works with various contexts
 * 3. Dependencies are resolved in correct order
 * 4. Circular dependencies are detected
 * 5. Plugin initialization handles errors gracefully
 * 6. Enabled plugins and data blobs are tracked correctly
 */

describe("PluginManager", () => {
    let manager: PluginManager;
    let mockRuntime: any;

    beforeEach(() => {
        manager = new PluginManager();
        mockRuntime = {
            on: mock(() => {}),
            off: mock(() => {}),
            setError: mock(() => {}),
            getData: mock(() => ({})),
            recalculate: mock(() => {}),
            updateVisibility: mock(() => {}),
            getLookup: mock(() => null),
            reportPluginError: mock(() => {}),
            getPluginErrors: mock(() => new Map()),
            start: mock(() => {}),
            destroy: mock(() => {}),
            getManagers: mock(() => ({ calc: {}, dm: {}, uim: {} }))
        };
    });

    describe("Plugin Registration", () => {
        test("register: adds plugin to registry", () => {
            const plugin: FormPlugin = {
                name: 'test-plugin',
                detect: () => true,
                init: async () => {}
            };

            manager.register(plugin);
            expect(manager.getPlugin('test-plugin')).toBe(plugin);
        });

        test("register: warns on duplicate registration", () => {
            const plugin: FormPlugin = {
                name: 'test-plugin',
                detect: () => true,
                init: async () => {}
            };

            manager.register(plugin);
            manager.register(plugin); // Should warn but not throw
            expect(manager.getPlugin('test-plugin')).toBe(plugin);
        });

        test("registerAll: registers multiple plugins", () => {
            const plugins: FormPlugin[] = [
                { name: 'plugin1', detect: () => true, init: async () => {} },
                { name: 'plugin2', detect: () => true, init: async () => {} },
                { name: 'plugin3', detect: () => true, init: async () => {} }
            ];

            manager.registerAll(plugins);
            expect(manager.getPlugin('plugin1')).toBe(plugins[0]);
            expect(manager.getPlugin('plugin2')).toBe(plugins[1]);
            expect(manager.getPlugin('plugin3')).toBe(plugins[2]);
        });

        test("getPlugin: returns undefined for non-existent plugin", () => {
            expect(manager.getPlugin('non-existent')).toBeUndefined();
        });
    });

    describe("Plugin Detection", () => {
        test("detect: identifies plugins based on context", () => {
            const plugin1: FormPlugin = {
                name: 'postal',
                detect: ({ structure }) => structure.needsPostal === true,
                init: async () => {}
            };

            const plugin2: FormPlugin = {
                name: 'lg',
                detect: ({ rawMarkdown }) => rawMarkdown.includes('autofill:lg'),
                init: async () => {}
            };

            manager.registerAll([plugin1, plugin2]);

            const context: DetectionContext = {
                structure: { needsPostal: true } as any,
                rawMarkdown: 'Some text with autofill:lg',
                frontmatter: {}
            };

            const detected = manager.detect(context);
            expect(detected).toHaveLength(2);
            expect(detected.map(p => p.name)).toEqual(['postal', 'lg']);
            expect(manager.isEnabled('postal')).toBe(true);
            expect(manager.isEnabled('lg')).toBe(true);
        });

        test("detect: excludes plugins that don't match", () => {
            const plugin1: FormPlugin = {
                name: 'postal',
                detect: ({ structure }) => structure.needsPostal === true,
                init: async () => {}
            };

            const plugin2: FormPlugin = {
                name: 'lg',
                detect: ({ structure }) => structure.needsLg === true,
                init: async () => {}
            };

            manager.registerAll([plugin1, plugin2]);

            const context: DetectionContext = {
                structure: { needsPostal: true } as any,
                rawMarkdown: '',
                frontmatter: {}
            };

            const detected = manager.detect(context);
            expect(detected).toHaveLength(1);
            expect(detected[0].name).toBe('postal');
            expect(manager.isEnabled('postal')).toBe(true);
            expect(manager.isEnabled('lg')).toBe(false);
        });

        test("detect: handles detection errors gracefully", () => {
            const faultyPlugin: FormPlugin = {
                name: 'faulty',
                detect: () => { throw new Error('Detection failed'); },
                init: async () => {}
            };

            manager.register(faultyPlugin);

            const context: DetectionContext = {
                structure: {} as any,
                rawMarkdown: '',
                frontmatter: {}
            };

            const detected = manager.detect(context);
            expect(detected).toHaveLength(0);
        });

        test("getEnabledPlugins: returns list of enabled plugin names", () => {
            const plugins: FormPlugin[] = [
                { name: 'plugin1', detect: () => true, init: async () => {} },
                { name: 'plugin2', detect: () => false, init: async () => {} }
            ];

            manager.registerAll(plugins);
            manager.detect({ structure: {} as any, rawMarkdown: '', frontmatter: {} });

            const enabled = manager.getEnabledPlugins();
            expect(enabled).toEqual(['plugin1']);
        });
    });

    describe("Dependency Resolution", () => {
        test("resolveDependencies: orders plugins by dependencies", async () => {
            const pluginA: FormPlugin = {
                name: 'pluginA',
                detect: () => true,
                init: async () => {}
            };

            const pluginB: FormPlugin = {
                name: 'pluginB',
                dependencies: ['pluginA'],
                detect: () => true,
                init: async () => {}
            };

            const pluginC: FormPlugin = {
                name: 'pluginC',
                dependencies: ['pluginB'],
                detect: () => true,
                init: async () => {}
            };

            manager.registerAll([pluginC, pluginA, pluginB]); // Register in wrong order

            const results = await manager.initPlugins([pluginC, pluginA, pluginB], mockRuntime);

            // Should initialize in correct order: A -> B -> C
            expect(results).toHaveLength(3);
            expect(results[0].pluginName).toBe('pluginA');
            expect(results[1].pluginName).toBe('pluginB');
            expect(results[2].pluginName).toBe('pluginC');
        });

        test("resolveDependencies: handles missing dependencies", async () => {
            const pluginWithMissingDep: FormPlugin = {
                name: 'plugin',
                dependencies: ['non-existent'],
                detect: () => true,
                init: async () => {}
            };

            manager.register(pluginWithMissingDep);

            // Should not throw, just warn
            const results = await manager.initPlugins([pluginWithMissingDep], mockRuntime);
            expect(results).toHaveLength(1);
            expect(results[0].success).toBe(true);
        });

        test("resolveDependencies: detects circular dependencies", async () => {
            const pluginA: FormPlugin = {
                name: 'pluginA',
                dependencies: ['pluginB'],
                detect: () => true,
                init: async () => {}
            };

            const pluginB: FormPlugin = {
                name: 'pluginB',
                dependencies: ['pluginA'],
                detect: () => true,
                init: async () => {}
            };

            manager.registerAll([pluginA, pluginB]);

            // Should throw on circular dependency
            await expect(
                manager.initPlugins([pluginA, pluginB], mockRuntime)
            ).rejects.toThrow('Circular dependency detected');
        });
    });

    describe("Plugin Initialization", () => {
        test("initPlugins: successfully initializes all plugins", async () => {
            const initMock1 = mock(async () => {});
            const initMock2 = mock(async () => {});

            const plugins: FormPlugin[] = [
                { name: 'plugin1', detect: () => true, init: initMock1 },
                { name: 'plugin2', detect: () => true, init: initMock2 }
            ];

            manager.registerAll(plugins);
            const results = await manager.initPlugins(plugins, mockRuntime);

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(true);
            expect(initMock1).toHaveBeenCalledWith(mockRuntime);
            expect(initMock2).toHaveBeenCalledWith(mockRuntime);
        });

        test("initPlugins: isolates plugin initialization errors", async () => {
            const goodPlugin: FormPlugin = {
                name: 'good',
                detect: () => true,
                init: async () => {}
            };

            const badPlugin: FormPlugin = {
                name: 'bad',
                detect: () => true,
                init: async () => { throw new Error('Init failed'); }
            };

            manager.registerAll([goodPlugin, badPlugin]);
            const results = await manager.initPlugins([goodPlugin, badPlugin], mockRuntime);

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[0].pluginName).toBe('good');
            expect(results[1].success).toBe(false);
            expect(results[1].pluginName).toBe('bad');
            expect(results[1].error).toBeDefined();
            expect(results[1].error?.message).toBe('Init failed');
        });

        test("initPlugins: calls plugin onError handler on failure", async () => {
            const onErrorMock = mock(() => {});
            const faultyPlugin: FormPlugin = {
                name: 'faulty',
                detect: () => true,
                init: async () => { throw new Error('Test error'); },
                onError: onErrorMock
            };

            manager.register(faultyPlugin);
            await manager.initPlugins([faultyPlugin], mockRuntime);

            expect(onErrorMock).toHaveBeenCalled();
            const errorArg = onErrorMock.mock.calls[0][0];
            expect(errorArg).toBeInstanceOf(Error);
            expect(errorArg.message).toBe('Test error');
        });

        test("initPlugins: reports errors to runtime", async () => {
            const faultyPlugin: FormPlugin = {
                name: 'faulty',
                detect: () => true,
                init: async () => { throw new Error('Test error'); }
            };

            manager.register(faultyPlugin);
            await manager.initPlugins([faultyPlugin], mockRuntime);

            expect(mockRuntime.reportPluginError).toHaveBeenCalled();
            expect(mockRuntime.reportPluginError.mock.calls[0][0]).toBe('faulty');
            expect(mockRuntime.reportPluginError.mock.calls[0][1]).toBeInstanceOf(Error);
        });

        test("initPlugins: handles error in onError handler gracefully", async () => {
            const faultyPlugin: FormPlugin = {
                name: 'faulty',
                detect: () => true,
                init: async () => { throw new Error('Init error'); },
                onError: () => { throw new Error('Handler error'); }
            };

            manager.register(faultyPlugin);

            // Should not throw, errors should be logged
            const results = await manager.initPlugins([faultyPlugin], mockRuntime);
            expect(results[0].success).toBe(false);
        });
    });

    describe("Data Blob Management", () => {
        test("getRequiredDataBlobs: returns all unique data blobs", () => {
            const plugins: FormPlugin[] = [
                {
                    name: 'postal',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['jp-postal']
                },
                {
                    name: 'lg',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['jp-lg']
                },
                {
                    name: 'validation',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['validation-rules']
                }
            ];

            const blobs = manager.getRequiredDataBlobs(plugins);
            expect(blobs).toEqual(expect.arrayContaining(['jp-postal', 'jp-lg', 'validation-rules']));
            expect(blobs).toHaveLength(3);
        });

        test("getRequiredDataBlobs: handles plugins without dataBlobs", () => {
            const plugins: FormPlugin[] = [
                {
                    name: 'plugin1',
                    detect: () => true,
                    init: async () => {}
                },
                {
                    name: 'plugin2',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['data1']
                }
            ];

            const blobs = manager.getRequiredDataBlobs(plugins);
            expect(blobs).toEqual(['data1']);
        });

        test("getRequiredDataBlobs: deduplicates data blobs", () => {
            const plugins: FormPlugin[] = [
                {
                    name: 'plugin1',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['shared-data', 'data1']
                },
                {
                    name: 'plugin2',
                    detect: () => true,
                    init: async () => {},
                    dataBlobs: ['shared-data', 'data2']
                }
            ];

            const blobs = manager.getRequiredDataBlobs(plugins);
            expect(blobs).toHaveLength(3);
            expect(blobs).toEqual(expect.arrayContaining(['shared-data', 'data1', 'data2']));
        });
    });

    describe("Plugin Status Queries", () => {
        test("isEnabled: returns true for enabled plugins", () => {
            const plugin: FormPlugin = {
                name: 'test',
                detect: () => true,
                init: async () => {}
            };

            manager.register(plugin);
            manager.detect({ structure: {} as any, rawMarkdown: '', frontmatter: {} });

            expect(manager.isEnabled('test')).toBe(true);
        });

        test("isEnabled: returns false for disabled plugins", () => {
            const plugin: FormPlugin = {
                name: 'test',
                detect: () => false,
                init: async () => {}
            };

            manager.register(plugin);
            manager.detect({ structure: {} as any, rawMarkdown: '', frontmatter: {} });

            expect(manager.isEnabled('test')).toBe(false);
        });

        test("isEnabled: returns false for non-existent plugins", () => {
            expect(manager.isEnabled('non-existent')).toBe(false);
        });
    });
});
