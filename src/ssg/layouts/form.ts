import { baseLayout } from './base.ts';
import { parseMarkdown } from '../../form/parser.ts';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}

export function formLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[], vc?: object) {
    const { html, jsonStructure } = parseMarkdown(rawMarkdown);

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const verificationFooter = vc ? `
        <footer class="doc-verification no-print" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; font-size: 0.9rem; color: #666;">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                <div style="background: #e6f7e6; color: #2e7d32; padding: 0.4rem 1rem; border-radius: 20px; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                    <span>✓</span> Template Signed
                </div>
                <div>
                    <span style="font-size: 0.8rem;">Layer 1: Issuer Context (Immutable)</span>
                </div>
            </div>
            
            <details style="background: #f9f9f9; border-radius: 8px; border: 1px solid #eee;">
                <summary style="padding: 0.8rem 1rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="opacity: 0.6;">▶</span> View Template VC (JSON-LD)
                </summary>
                <div style="padding: 0 1rem 1rem 1rem;">
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
                </div>
            </details>
        </footer>
    ` : '';

    const content = `
        <div class="weba-form-container">
            ${html}
            ${verificationFooter}
        </div>
        ${structureScript}
        <script src="/assets/form-bundle.js"></script>
    `;

    return baseLayout({
        title: data.title,
        content: content,
        fontCss,
        fontFamilies
    });
}

export function formReportLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[]) {
    const { jsonStructure } = parseMarkdown(rawMarkdown);

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const content = `
        <div class="weba-report-container">
            <h1>${data.title} (集計)</h1>
            <div id="aggregator-root">Loading...</div>
        </div>
        ${structureScript}
        <script src="/assets/form-bundle.js"></script>
        <script>
            // Initialize Aggregator
            document.addEventListener('DOMContentLoaded', () => {
                if (window.WebA && window.WebA.initAggregator) {
                    window.WebA.initAggregator();
                } else {
                    console.warn("WebA Aggregator not found");
                }
            });
        </script>
    `;

    return baseLayout({
        title: `${data.title} (Report)`,
        content: content,
        fontCss,
        fontFamilies
    });
}
