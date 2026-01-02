/**
 * Web/A Form Runtime - Plugin System Entry Point
 *
 * This is the new plugin-based entry point that will eventually replace
 * the monolithic runtime.ts. For now, it runs in parallel for testing.
 */

import { FormRuntime } from '../runtime/Runtime.js';
import { PluginManager } from '../runtime/PluginManager.js';
import type { DetectionContext } from '../runtime/types.js';
import { parsePluginManifest } from '../runtime/plugin-detector.js';
import { postalPlugin } from '../plugins/postal.js';
import { lgPlugin } from '../plugins/lg.js';

/**
 * Initialize plugin-based runtime
 */
export async function initPluginRuntime() {
    console.log('[PluginRuntime] Booting...');

    const w = window as any;
    const runtime = new FormRuntime();
    const pluginManager = new PluginManager();

    // Register all available plugins
    const allPlugins = [
        postalPlugin,
        lgPlugin
    ];

    pluginManager.registerAll(allPlugins);

    // Load plugin manifest from embedded data
    let requiredPluginNames: string[] = [];

    const manifest = w.__WEBA_MANIFEST;
    if (manifest && manifest.blobs) {
        const manifestBlob = manifest.blobs.find((b: any) => b.id === 'weba-plugin-manifest');
        if (manifestBlob && manifestBlob.urls) {
            for (const url of manifestBlob.urls) {
                try {
                    let manifestJson: string;
                    if (url.startsWith('#')) {
                        const el = document.querySelector(url);
                        if (el && el.textContent) {
                            manifestJson = el.textContent.trim();
                        } else {
                            continue;
                        }
                    } else {
                        const resp = await fetch(url);
                        if (!resp.ok) continue;
                        manifestJson = await resp.text();
                    }

                    const detection = parsePluginManifest(manifestJson);
                    requiredPluginNames = detection.plugins;
                    console.log('[PluginRuntime] Loaded plugin manifest:', detection);
                    break;
                } catch (error) {
                    console.warn('[PluginRuntime] Failed to load manifest from:', url, error);
                }
            }
        }
    }

    // Filter plugins based on manifest
    const enabledPlugins = allPlugins.filter(p =>
        requiredPluginNames.length === 0 || requiredPluginNames.includes(p.name)
    );

    console.log(`[PluginRuntime] Enabled plugins: ${enabledPlugins.map(p => p.name).join(', ')}`);

    // Initialize enabled plugins
    const results = await pluginManager.initPlugins(enabledPlugins, runtime);

    // Check for errors
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.warn(`[PluginRuntime] ${failed.length} plugin(s) failed to initialize:`,
            failed.map(r => r.pluginName));
    }

    // Start the runtime (legacy compatibility)
    runtime.start();

    // Expose to window for debugging
    w.__pluginRuntime = runtime;
    w.__pluginManager = pluginManager;

    console.log('[PluginRuntime] Ready');
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initPluginRuntime());
    } else {
        initPluginRuntime();
    }
}
