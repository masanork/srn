
/**
 * generator.ts - Utility for standalone HTML generation.
 * Used by Form Maker.
 */
import { parseMarkdown } from './parser';
import { CLIENT_BUNDLE } from './client/embed';

export const RUNTIME_SCRIPT = CLIENT_BUNDLE;
const FAVICON_DATA_URI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxMTE4MjciLz48dGV4dCB4PSI1MCUiIHk9IjU2JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZjlmYWZiIiBmb250LXdlaWdodD0iNzAwIj5TUjwvdGV4dD48L3N2Zz4=';

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
    const sourceMd = markdown.replace(/<\/script>/g, '<\\/script>');
    return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${jsonStructure.name || 'Web/A Form'}</title><link rel="icon" href="${FAVICON_DATA_URI}"><style>
    :root { --primary: #111827; --primary-hover: #1f2937; --border: #e5e7eb; --bg-subtle: #f9fafb; --text-secondary: #6b7280; --pilot-blue: #3b82f6; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 1rem; max-width: 900px; margin: 0 auto; position: relative; min-height: 100vh; padding-bottom: 100px; }
    .form-row { margin-bottom: 1.25rem; }
    .form-label { font-weight: 600; display: block; margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--primary); }
    .form-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 16px; background: white; transition: border-color 0.2s; }
    .form-input:focus { outline: none; border-color: var(--pilot-blue); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-hint { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.4; }
    .tabs-nav { display: flex; gap: 4px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .tab-btn { background: var(--bg-subtle); border: 1px solid var(--border); border-bottom: none; padding: 0.75rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; font-size: 0.95rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; min-height: 44px; display: flex; align-items: center; transition: all 0.2s; }
    .tab-btn:hover { background: #e5e7eb; }
    .tab-btn.active { background: white; color: var(--primary); border-bottom: 2px solid white; position: relative; top: 2px; }
    .tab-content { display: none; animation: fadeIn 0.3s ease-in-out; }
    .tab-content.active { display: block; }
    .pilot-banner { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid var(--pilot-blue); border-left: 4px solid var(--pilot-blue); color: #1e40af; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.6; }
    .pilot-tag { background: var(--pilot-blue); color: white; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; margin-right: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(59, 130, 246, 0.04); pointer-events: none; z-index: 1; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
    .action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid var(--border); padding: 0.75rem 1rem; display: flex; gap: 0.5rem; justify-content: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 1000; }
    .action-btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; min-height: 44px; min-width: 44px; transition: all 0.2s; white-space: nowrap; }
    .action-btn-primary { background: var(--primary); color: white; }
    .action-btn-primary:hover { background: var(--primary-hover); }
    .action-btn-secondary { background: white; color: var(--primary); border: 1px solid var(--border); }
    .action-btn-secondary:hover { background: var(--bg-subtle); }
    @media (max-width: 768px) { 
        body { padding: 0.75rem; padding-bottom: 120px; } 
        .form-label { font-size: 0.9rem; }
        .tabs-nav { gap: 2px; }
        .tab-btn { padding: 0.6rem 0.85rem; font-size: 0.875rem; }
        .action-bar { flex-wrap: wrap; padding: 0.5rem; }
        .action-btn { flex: 1; min-width: calc(50% - 0.25rem); padding: 0.7rem 1rem; font-size: 0.9rem; }
    }
    @media print { .pilot-banner, .action-bar { display: none; } .watermark { color: rgba(59, 130, 246, 0.08); } body { padding-bottom: 0; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style></head><body>
    <div class="watermark">PILOT</div>
    <div class="pilot-banner">
        <span class="pilot-tag">Pilot Preview</span>
        <strong>Preview Notice:</strong> This form is part of an exclusive pilot program.
        Security features are in active development. Please review the <a href="./papers/pilot-safety-guide.ja.html" style="color:#1e40af; font-weight:600; text-decoration:underline;">Safety Guide</a> before use.
    </div>
    <div class="page">${html}</div>
    <div class="action-bar">
        <button class="action-btn action-btn-secondary" onclick="saveDraft()">💾 Save Draft</button>
        <button class="action-btn action-btn-primary" onclick="submitDocument()">📤 Submit</button>
        <button class="action-btn action-btn-secondary" onclick="clearData()">🗑️ Clear</button>
    </div>
    <script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-source-markdown" type="text/plain">${sourceMd}</script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}

/**
 * Generates a standalone HTML for the aggregator. (Legacy support for Maker)
 */
export function generateAggregatorHtml(markdown: string): string {
    const { jsonStructure } = parseMarkdown(markdown);
    const aggSpec = jsonStructure.aggSpec ? JSON.stringify(jsonStructure.aggSpec) : '';
    const sourceMd = markdown.replace(/<\/script>/g, '<\\/script>');
    const buildStamp = (typeof window !== 'undefined' && (window as any).__WEBA_BUILD_TIME__)
        ? (window as any).__WEBA_BUILD_TIME__
        : '';
    return `<!DOCTYPE html><html><head><title>Aggregator</title><link rel="icon" href="${FAVICON_DATA_URI}"><style>
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
    </style></head><body><h1>${jsonStructure.name} Aggregator</h1><div id="aggregator-root"></div><script>window.__WEBA_BUILD_TIME__=${JSON.stringify(buildStamp)};</script><script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script><script id="weba-agg-spec" type="application/json">${aggSpec}</script><script id="weba-source-markdown" type="text/plain">${sourceMd}</script><script id="weba-l2-keys" type="application/json"></script><script>${RUNTIME_SCRIPT}</script></body></html>`;
}
