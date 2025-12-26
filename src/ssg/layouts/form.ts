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

    const vcString = vc ? JSON.stringify(vc, null, 2) : '';
    const vcDataUri = vc ? `data:application/json;charset=utf-8,${encodeURIComponent(vcString)}` : '#';

    const verificationFooter = vc ? `
            <footer class="doc-verification no-print" style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="background: #e6f7e6; color: #2e7d32; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">✓ PQC Signed</span>
                    <span style="font-size: 0.8rem; color: #666;">Form Template Integrity Verified</span>
                    <a href="${vcDataUri}" download="form-template.vc.json" style="font-size: 0.8rem; margin-left: auto;">Download VC</a>
                </div>
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
