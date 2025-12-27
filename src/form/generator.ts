
/**
 * generator.ts - Utility for standalone HTML generation.
 * Used by Form Maker.
 */
import { parseMarkdown } from './parser';
import { CLIENT_BUNDLE } from './client/embed';

export const RUNTIME_SCRIPT = CLIENT_BUNDLE;

/**
 * Initializes the runtime in a browser environment.
 */
export function initRuntime(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).recalculate) return;
    try {
        // eslint-disable-next-line no-eval
        eval(RUNTIME_SCRIPT);
    } catch (e) {
        console.error("Failed to init runtime from bundle:", e);
    }
}

/**
 * Generates a standalone HTML for the form. (Legacy support for Maker)
 */
export function generateHtml(markdown: string): string {
    const { html, jsonStructure } = parseMarkdown(markdown);
    return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>${jsonStructure.name || 'Web/A Form'}</title><style>body{font-family:sans-serif;padding:2rem;max-width:900px;margin:0 auto;}.form-row{margin-bottom:1rem;}.form-label{font-weight:bold;display:block;margin-bottom:0.5rem;}.form-input{width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;}</style></head><body><div class="page">${html}</div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}

/**
 * Generates a standalone HTML for the aggregator. (Legacy support for Maker)
 */
export function generateAggregatorHtml(markdown: string): string {
    const { jsonStructure } = parseMarkdown(markdown);
    return `<!DOCTYPE html><html><head><title>Aggregator</title></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}
