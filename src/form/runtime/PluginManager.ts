/**
 * Plugin Manager - Manages plugin lifecycle
 *
 * Handles plugin registration, dependency resolution, and initialization.
 */

import type {
    FormPlugin,
    DetectionContext,
    PluginRegistry,
    PluginInitResult
} from './types.js';
import type { FormRuntime } from './Runtime.js';

/**
 * Plugin Manager
 */
export class PluginManager {
    private registry: PluginRegistry = {};
    private enabledPlugins: Set<string> = new Set();

    /**
     * Register a plugin
     */
    register(plugin: FormPlugin): void {
        if (this.registry[plugin.name]) {
            console.warn(`[PluginManager] Plugin "${plugin.name}" is already registered`);
            return;
        }

        this.registry[plugin.name] = plugin;
        console.log(`[PluginManager] Registered plugin: ${plugin.name}`);
    }

    /**
     * Register multiple plugins
     */
    registerAll(plugins: FormPlugin[]): void {
        plugins.forEach(plugin => this.register(plugin));
    }

    /**
     * Detect which plugins should be enabled
     */
    detect(context: DetectionContext): FormPlugin[] {
        const enabled: FormPlugin[] = [];

        for (const plugin of Object.values(this.registry)) {
            try {
                if (plugin.detect(context)) {
                    enabled.push(plugin);
                    this.enabledPlugins.add(plugin.name);
                    console.log(`[PluginManager] Detected plugin: ${plugin.name}`);
                }
            } catch (error) {
                console.error(`[PluginManager] Detection error in plugin "${plugin.name}":`, error);
            }
        }

        return enabled;
    }

    /**
     * Resolve plugin dependencies (topological sort)
     */
    private resolveDependencies(plugins: FormPlugin[]): FormPlugin[] {
        const resolved: FormPlugin[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (plugin: FormPlugin) => {
            if (visited.has(plugin.name)) return;

            if (visiting.has(plugin.name)) {
                throw new Error(`[PluginManager] Circular dependency detected: ${plugin.name}`);
            }

            visiting.add(plugin.name);

            // Visit dependencies first
            if (plugin.dependencies) {
                for (const depName of plugin.dependencies) {
                    const dep = this.registry[depName];
                    if (!dep) {
                        console.warn(`[PluginManager] Dependency "${depName}" not found for plugin "${plugin.name}"`);
                        continue;
                    }
                    visit(dep);
                }
            }

            visiting.delete(plugin.name);
            visited.add(plugin.name);
            resolved.push(plugin);
        };

        plugins.forEach(plugin => visit(plugin));

        return resolved;
    }

    /**
     * Initialize enabled plugins
     */
    async initPlugins(plugins: FormPlugin[], runtime: FormRuntime): Promise<PluginInitResult[]> {
        // Resolve dependencies
        const sortedPlugins = this.resolveDependencies(plugins);

        console.log(`[PluginManager] Initializing ${sortedPlugins.length} plugins...`);

        const results: PluginInitResult[] = [];

        // Initialize plugins in dependency order
        for (const plugin of sortedPlugins) {
            const result = await this.initPlugin(plugin, runtime);
            results.push(result);

            if (!result.success) {
                console.error(`[PluginManager] Failed to initialize plugin "${plugin.name}":`, result.error);
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`[PluginManager] Initialized ${successCount}/${sortedPlugins.length} plugins successfully`);

        return results;
    }

    /**
     * Initialize single plugin with error isolation
     */
    private async initPlugin(plugin: FormPlugin, runtime: FormRuntime): Promise<PluginInitResult> {
        try {
            await plugin.init(runtime);

            return {
                success: true,
                pluginName: plugin.name
            };
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            // Call plugin's error handler if defined
            if (plugin.onError) {
                try {
                    plugin.onError(err);
                } catch (handlerError) {
                    console.error(`[PluginManager] Error in plugin "${plugin.name}" error handler:`, handlerError);
                }
            }

            // Report to runtime
            runtime.reportPluginError(plugin.name, err);

            return {
                success: false,
                pluginName: plugin.name,
                error: err
            };
        }
    }

    /**
     * Get list of enabled plugins
     */
    getEnabledPlugins(): string[] {
        return Array.from(this.enabledPlugins);
    }

    /**
     * Get required data blobs for enabled plugins
     */
    getRequiredDataBlobs(plugins: FormPlugin[]): string[] {
        const blobs = new Set<string>();

        for (const plugin of plugins) {
            if (plugin.dataBlobs) {
                plugin.dataBlobs.forEach(blob => blobs.add(blob));
            }
        }

        return Array.from(blobs);
    }

    /**
     * Get plugin by name
     */
    getPlugin(name: string): FormPlugin | undefined {
        return this.registry[name];
    }

    /**
     * Check if plugin is enabled
     */
    isEnabled(name: string): boolean {
        return this.enabledPlugins.has(name);
    }
}
