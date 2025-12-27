import { baseLayout } from './base.js';
import { parseMarkdown } from '../../form/parser.js';

export interface FormData {
    title: string;
    description?: string;
    [key: string]: any;
}

export function formLayout(data: FormData, rawMarkdown: string, fontCss: string, fontFamilies: string[], vc?: object) {
    const { html, jsonStructure } = parseMarkdown(rawMarkdown);

    // Embed structure for client-side logic
    const structureScript = `<script id="weba-structure" type="application/json">${JSON.stringify(jsonStructure)}</script>`;

    const verificationDetails = vc ? `
        <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                <span>✓</span> 発行元による真正性の証明
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: normal;">Template Signed</span>
            </summary>
            <div style="padding: 1rem 0;">
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
            </div>
        </details>
    ` : '';

    const content = `
        <div class="weba-form-container">
            ${html}

            <footer class="no-print" style="margin-top: 5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <details>
                        <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                            <span style="color: #3b82f6;">ℹ️</span> 記入内容（データ）の確認
                        </summary>
                        <div style="padding: 1rem 0;">
                            <pre id="json-debug" style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;"></pre>
                        </div>
                    </details>
                    ${verificationDetails}
                </div>
            </footer>
        </div>
        ${structureScript}
        <script src="./assets/form-bundle.js"></script>
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
        <script src="./assets/form-bundle.js"></script>
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
