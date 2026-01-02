/**
 * Custom Plugin Bundler
 *
 * Generates optimized bundles containing only the plugins required for each form.
 * Uses Bun's build API to create per-form bundles at build time.
 */

import { build } from 'bun';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

export interface BundleOptions {
    plugins: string[];
    minify?: boolean;
    cache?: boolean;
}

export interface BundleResult {
    code: string;
    size: number;
    hash: string;
}

const CACHE_DIR = path.resolve('.cache/plugin-bundles');
const SRC_DIR = path.resolve('src/form');

// Use absolute paths for imports
const PLUGIN_IMPORTS: Record<string, string> = {
    'postal': `import { postalPlugin } from '${path.join(SRC_DIR, 'plugins/postal.js')}';`,
    'lg': `import { lgPlugin } from '${path.join(SRC_DIR, 'plugins/lg.js')}';`,
    'validation-email': `// TODO: import { emailValidationPlugin } from '${path.join(SRC_DIR, 'plugins/validation-email.js')}';`,
    'validation-tel': `// TODO: import { telValidationPlugin } from '${path.join(SRC_DIR, 'plugins/validation-tel.js')}';`,
    'validation-required': `// TODO: import { requiredValidationPlugin } from '${path.join(SRC_DIR, 'plugins/validation-required.js')}';`,
};

const PLUGIN_EXPORTS: Record<string, string> = {
    'postal': 'postalPlugin',
    'lg': 'lgPlugin',
    'validation-email': '// emailValidationPlugin',
    'validation-tel': '// telValidationPlugin',
    'validation-required': '// requiredValidationPlugin',
};

/**
 * Generate a hash for the plugin combination
 */
function generatePluginHash(plugins: string[]): string {
    const sorted = [...plugins].sort();
    return crypto.createHash('sha256').update(sorted.join(',')).digest('hex').slice(0, 16);
}

/**
 * Generate entry point code for the given plugins
 */
function generateEntryPoint(plugins: string[]): string {
    const imports = [
        `import { FormRuntime } from '${path.join(SRC_DIR, 'runtime/Runtime.js')}';`,
        `import { PluginManager } from '${path.join(SRC_DIR, 'runtime/PluginManager.js')}';`,
        `import { parsePluginManifest } from '${path.join(SRC_DIR, 'runtime/plugin-detector.js')}';`,
        "",
        "// Plugin imports",
        ...plugins.map(p => PLUGIN_IMPORTS[p] || `// Unknown plugin: ${p}`),
        "",
    ].join('\n');

    const pluginArray = plugins.map(p => PLUGIN_EXPORTS[p] || '').filter(Boolean);

    const initCode = `
/**
 * Initialize plugin-based runtime
 */
export async function initPluginRuntime() {
    console.log('[CustomRuntime] Booting with plugins: ${plugins.join(', ')}...');

    const w = window as any;
    const runtime = new FormRuntime();
    const pluginManager = new PluginManager();

    // Register available plugins
    const allPlugins = [
        ${pluginArray.join(',\n        ')}
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
                    console.log('[CustomRuntime] Loaded plugin manifest:', detection);
                    break;
                } catch (error) {
                    console.warn('[CustomRuntime] Failed to load manifest from:', url, error);
                }
            }
        }
    }

    // Filter plugins based on manifest (should match build-time detection)
    const enabledPlugins = allPlugins.filter(p =>
        requiredPluginNames.length === 0 || requiredPluginNames.includes(p.name)
    );

    console.log(\`[CustomRuntime] Enabled plugins: \${enabledPlugins.map(p => p.name).join(', ')}\`);

    // Initialize enabled plugins
    const results = await pluginManager.initPlugins(enabledPlugins, runtime);

    // Check for errors
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.warn(\`[CustomRuntime] \${failed.length} plugin(s) failed to initialize:\`,
            failed.map(r => r.pluginName));
    }

    // Start the runtime (legacy compatibility)
    runtime.start();

    // Expose to window for debugging
    w.__pluginRuntime = runtime;
    w.__pluginManager = pluginManager;

    console.log('[CustomRuntime] Ready');
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initPluginRuntime());
    } else {
        initPluginRuntime();
    }
}
`;

    return imports + initCode;
}

/**
 * Bundle plugins into a single optimized file
 */
export async function bundlePlugins(options: BundleOptions): Promise<BundleResult> {
    const { plugins, minify = true, cache = true } = options;

    if (plugins.length === 0) {
        throw new Error('Cannot bundle with zero plugins');
    }

    const pluginHash = generatePluginHash(plugins);
    const cacheFile = path.join(CACHE_DIR, `bundle-${pluginHash}.js`);
    const cacheMetaFile = path.join(CACHE_DIR, `bundle-${pluginHash}.meta.json`);

    // Check cache
    if (cache && fs.existsSync(cacheFile) && fs.existsSync(cacheMetaFile)) {
        const code = fs.readFileSync(cacheFile, 'utf-8');
        const meta = fs.readJsonSync(cacheMetaFile);
        console.log(`[Bundler] Using cached bundle for plugins: ${plugins.join(', ')} (${meta.size} bytes)`);
        return {
            code,
            size: meta.size,
            hash: pluginHash
        };
    }

    // Generate entry point
    const entryCode = generateEntryPoint(plugins);
    const tempDir = path.join(CACHE_DIR, 'temp');
    const entryFile = path.join(tempDir, `entry-${pluginHash}.ts`);

    fs.ensureDirSync(tempDir);
    fs.writeFileSync(entryFile, entryCode);

    console.log(`[Bundler] Building custom bundle for plugins: ${plugins.join(', ')}...`);

    try {
        // Build with Bun
        const result = await build({
            entrypoints: [entryFile],
            outdir: tempDir,
            minify,
            target: 'browser',
            format: 'esm',
        });

        if (!result.success) {
            throw new Error('Bundle build failed');
        }

        // Read the output
        const outputFile = path.join(tempDir, `entry-${pluginHash}.js`);
        const code = fs.readFileSync(outputFile, 'utf-8');
        const size = Buffer.byteLength(code, 'utf-8');

        // Cache the result
        if (cache) {
            fs.ensureDirSync(CACHE_DIR);
            fs.writeFileSync(cacheFile, code);
            fs.writeJsonSync(cacheMetaFile, {
                plugins,
                size,
                hash: pluginHash,
                timestamp: new Date().toISOString()
            });
        }

        // Clean up temp files
        fs.removeSync(tempDir);

        console.log(`[Bundler] Bundle complete: ${size} bytes (hash: ${pluginHash})`);

        return {
            code,
            size,
            hash: pluginHash
        };
    } catch (error) {
        // Clean up on error
        fs.removeSync(tempDir);
        throw error;
    }
}

/**
 * Clear the bundle cache
 */
export function clearBundleCache(): void {
    if (fs.existsSync(CACHE_DIR)) {
        fs.removeSync(CACHE_DIR);
        console.log('[Bundler] Cache cleared');
    }
}

/**
 * Get cache statistics
 */
export function getBundleCacheStats(): { count: number; totalSize: number } {
    if (!fs.existsSync(CACHE_DIR)) {
        return { count: 0, totalSize: 0 };
    }

    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.js'));
    const totalSize = files.reduce((sum, f) => {
        const stat = fs.statSync(path.join(CACHE_DIR, f));
        return sum + stat.size;
    }, 0);

    return {
        count: files.length,
        totalSize
    };
}
