import { baseLayout } from './base.ts';
import { parseMarkdown } from '../../form/parser.ts';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}

export function formLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[]) {
    const { html, jsonStructure } = parseMarkdown(rawMarkdown);

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const content = `
        <div class="weba-form-container">
            ${html}
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
