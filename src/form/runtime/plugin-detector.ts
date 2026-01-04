/**
 * Plugin Detection System
 *
 * Analyzes form structure and markdown to determine which plugins are needed.
 * This runs at build time to enable tree-shaking and optimal bundle sizes.
 */

import type { DetectionContext, FormStructure } from './types.js';

/**
 * Plugin detection result
 */
export interface PluginDetectionResult {
    /** List of required plugin names */
    plugins: string[];

    /** Required data blobs */
    dataBlobs: string[];

    /** Detection metadata (for debugging) */
    metadata: {
        hasPostal: boolean;
        hasLg: boolean;
        hasEmailValidation: boolean;
        hasTelValidation: boolean;
        [key: string]: any;
    };
}

/**
 * Detect required plugins from form context
 */
export function detectRequiredPlugins(context: DetectionContext): PluginDetectionResult {
    const plugins = new Set<string>();
    const dataBlobs = new Set<string>();
    const metadata: any = {};

    const { structure, rawMarkdown, frontmatter } = context;

    // Postal plugin detection
    const hasPostal =
        structure.needsPostal ||
        rawMarkdown.includes('autofill:postal') ||
        rawMarkdown.match(/data-autofill="postal:/);

    if (hasPostal) {
        plugins.add('postal');
        dataBlobs.add('jp-postal');
        metadata.hasPostal = true;
    }

    // LG plugin detection
    const hasLg =
        structure.needsLg ||
        rawMarkdown.includes('autofill:lg');

    if (hasLg) {
        plugins.add('lg');
        dataBlobs.add('jp-lg');
        metadata.hasLg = true;
    }

    // Email validation detection (auto-detect from field types)
    const hasEmailFields = structure.fields?.some(f =>
        f.type === 'email' ||
        f.key?.toLowerCase().includes('email') ||
        f.key?.toLowerCase().includes('mail')
    );
    const hasEmailValidation = hasEmailFields || rawMarkdown.includes('validation:email');
    if (hasEmailValidation) {
        plugins.add('validation-email');
        metadata.hasEmailValidation = true;
    }

    // Tel validation detection (auto-detect from field types)
    const hasTelFields = structure.fields?.some(f =>
        f.type === 'tel' ||
        f.key?.toLowerCase().includes('phone') ||
        f.key?.toLowerCase().includes('tel')
    );
    const hasTelValidation = hasTelFields ||
        rawMarkdown.includes('validation:tel') ||
        rawMarkdown.includes('autofill:tel');

    if (hasTelValidation) {
        plugins.add('validation-tel');
        metadata.hasTelValidation = true;
    }

    // Required validation detection
    const hasRequiredValidation = rawMarkdown.includes('required');
    if (hasRequiredValidation) {
        plugins.add('validation-required');
        metadata.hasRequiredValidation = true;
    }

    return {
        plugins: Array.from(plugins).sort(),
        dataBlobs: Array.from(dataBlobs).sort(),
        metadata
    };
}

/**
 * Generate plugin manifest for embedding in HTML
 */
export function generatePluginManifest(detection: PluginDetectionResult): string {
    return JSON.stringify({
        plugins: detection.plugins,
        dataBlobs: detection.dataBlobs,
        metadata: detection.metadata,
        generatedAt: new Date().toISOString()
    }, null, 2);
}

/**
 * Parse plugin manifest from HTML
 */
export function parsePluginManifest(manifestJson: string): PluginDetectionResult {
    try {
        const parsed = JSON.parse(manifestJson);
        return {
            plugins: parsed.plugins || [],
            dataBlobs: parsed.dataBlobs || [],
            metadata: parsed.metadata || {}
        };
    } catch (error) {
        console.error('[PluginDetector] Failed to parse manifest:', error);
        return {
            plugins: [],
            dataBlobs: [],
            metadata: {}
        };
    }
}
