
/**
 * generator.ts - Utility for standalone HTML generation.
 * Used by Form Maker.
 */
import { parseMarkdown } from './parser';
import { CLIENT_BUNDLE } from './client/embed';
import { PARQUET_BUNDLE } from './client/parquet_embed';

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
    const aggSpec = jsonStructure.aggSpec ? JSON.stringify(jsonStructure.aggSpec) : '';
    const parquetEnabled = jsonStructure.aggSpec?.export?.parquet;
    const parquetScript = parquetEnabled ? `<script type="module">${PARQUET_BUNDLE}</script>` : '';
    return `<!DOCTYPE html><html><head><title>Aggregator</title><style>
    body{font-family:sans-serif;max-width:1100px;margin:0 auto;padding:2rem;}
    h1{margin-bottom:1.5rem;}
    .agg-panel{border:1px solid #ddd;border-radius:10px;padding:1.5rem;margin-bottom:1.5rem;background:#fafafa;}
    .agg-row{display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem;flex-wrap:wrap;}
    .agg-label{min-width:140px;font-weight:600;}
    .agg-btn{padding:0.6rem 1rem;border-radius:6px;border:1px solid #ccc;background:#111;color:#fff;cursor:pointer;}
    .agg-btn.secondary{background:#fff;color:#333;}
    .agg-btn:disabled{opacity:0.6;cursor:not-allowed;}
    .agg-status{font-size:0.9rem;color:#555;}
    .agg-chip{padding:0.25rem 0.6rem;border-radius:999px;background:#eee;font-size:0.85rem;}
    .agg-chip.ready{background:#d1fae5;color:#065f46;}
    .agg-note{font-size:0.85rem;color:#666;}
    .agg-output{overflow:auto;border:1px solid #eee;border-radius:8px;}
    .agg-table{border-collapse:collapse;width:100%;font-size:0.9rem;}
    .agg-table th,.agg-table td{border:1px solid #eee;padding:0.5rem;vertical-align:top;text-align:left;}
    .agg-table th{background:#f3f4f6;position:sticky;top:0;}
    .agg-empty{padding:1rem;color:#666;}
    .agg-dashboard{margin-bottom:1.5rem;}
    .agg-dashboard-title{font-size:1rem;font-weight:600;margin:1rem 0 0.75rem;}
    .agg-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:1rem;}
    .agg-card{border:1px solid #eee;border-radius:10px;padding:0.75rem;background:#fff;}
    .agg-card-label{font-size:0.8rem;color:#666;margin-bottom:0.25rem;}
    .agg-card-value{font-size:1.25rem;font-weight:700;}
    .agg-chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:1.5rem;}
    .agg-chart{border:1px solid #eee;border-radius:10px;padding:0.75rem;background:#fff;}
    .agg-chart-title{font-weight:600;margin-bottom:0.5rem;}
    .agg-bar-list{display:flex;flex-direction:column;gap:0.5rem;}
    .agg-bar{display:grid;grid-template-columns:minmax(120px,1fr) 3fr auto;gap:0.6rem;align-items:center;font-size:0.85rem;}
    .agg-bar-label{color:#374151;}
    .agg-bar-track{background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;}
    .agg-bar-fill{background:#111;height:100%;border-radius:999px;}
    .agg-bar-value{font-weight:600;white-space:nowrap;}
    .agg-dashboard-table{margin-bottom:1rem;}
    .agg-table-title{font-weight:600;margin-bottom:0.35rem;}
    </style></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-agg-spec" type="application/json">${aggSpec}</script><script id="weba-l2-keys" type="application/json"></script>${parquetScript}<script>${RUNTIME_SCRIPT}</script></body></html>`;
}
