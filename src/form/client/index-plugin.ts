/**
 * Web/A Form Runtime - Plugin System Entry Point
 *
 * This is the new plugin-based entry point that will eventually replace
 * the monolithic runtime.ts. For now, it runs in parallel for testing.
 */

import { FormRuntime } from '../runtime/Runtime.js';
import { PluginManager } from '../runtime/PluginManager.js';
import type { DetectionContext } from '../runtime/types.js';

/**
 * Initialize plugin-based runtime
 */
export async function initPluginRuntime() {
    console.log('[PluginRuntime] Booting...');

    const w = window as any;
    const runtime = new FormRuntime();
    const pluginManager = new PluginManager();

    // Register all available plugins
    // (Will be populated as we migrate plugins)
    const allPlugins: any[] = [];

    pluginManager.registerAll(allPlugins);

    // Detect which plugins are needed for this form
    const context: DetectionContext = {
        structure: w.generatedJsonStructure || {},
        rawMarkdown: '', // Not available at runtime, will need to be passed from build
        frontmatter: {}
    };

    const enabledPlugins = pluginManager.detect(context);

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
