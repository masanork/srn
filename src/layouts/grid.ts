import { baseLayout } from './base.js';
import * as cheerio from 'cheerio';

export interface GridData {
    title: string;
    layout: 'grid';
    [key: string]: any;
}

export function gridLayout(data: GridData, htmlContent: string, fontCss: string, fontFamilies: string[]) {
    // Widen the container for grid view
    const wideStyle = `
        <style>
            main {
                max-width: 95% !important;
                padding-left: 1rem !important;
                padding-right: 1rem !important;
            }
        </style>
    `;

    // Parse the HTML table
    const $ = cheerio.load(htmlContent);
    const rows = $('table tbody tr');

    let gridItems = '';

    // Check if table parsing worked
    if (rows.length === 0) {
        return baseLayout({
            title: data.title,
            content: wideStyle + htmlContent,
            fontCss,
            fontFamilies
        });
    }

    rows.each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
            const num = $(cells[0]).text();
            const id = $(cells[1]).text();
            // Character is in the 3rd column
            const char = $(cells[2]).text();

            gridItems += `
                <div class="grid-item">
                    <div class="char-display">${char}</div>
                    <div class="char-id">${id}</div>
                    <div class="char-num">#${num}</div>
                </div>
            `;
        }
    });

    // Remove the table from the DOM so we can use the rest of the content (explanations, etc.)
    $('table').remove();
    const preambleContent = $('body').html() || '';

    const fullContent = `
        ${wideStyle}
        <h1>${data.title}</h1>
        ${preambleContent}

        <div class="char-grid">
            ${gridItems}
        </div>
        
        <style>
            .char-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 1.5rem;
                padding: 2rem 0;
            }
            .grid-item {
                border: 1px solid var(--border-color);
                border-radius: 1rem;
                padding: 2rem 1rem;
                text-align: center;
                background: var(--card-bg);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: var(--panel-shadow);
                content-visibility: auto;
                contain-intrinsic-size: 160px 200px;
            }
            .grid-item:hover {
                transform: translateY(-4px);
                box-shadow: var(--premium-shadow);
                border-color: var(--highlight);
                z-index: 10;
            }
            .char-display {
                font-size: 4rem;
                line-height: 1;
                margin-bottom: 1.5rem;
                font-family: ${fontFamilies.map(f => ['serif', 'sans-serif', 'monospace'].includes(f) ? f : `'${f}'`).join(', ')}, serif;
                color: var(--accent-color);
                -webkit-font-smoothing: antialiased;
            }
            .char-id {
                font-family: ui-monospace, SFMono-Regular, monospace;
                font-size: 0.8rem;
                color: var(--text-color);
                font-weight: 600;
                background: var(--bg-color);
                padding: 0.25rem 0.75rem;
                border-radius: 2rem;
                margin-bottom: 0.5rem;
                border: 1px solid var(--border-color);
            }
            .char-num {
                font-size: 0.75rem;
                color: var(--text-muted);
                letter-spacing: 0.05em;
            }
        </style>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies
    });
}
