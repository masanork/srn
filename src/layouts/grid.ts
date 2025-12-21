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

    const fullContent = `
        ${wideStyle}

        <p>行政事務標準文字追加文字（MJ+文字）のグリッド表示です。</p>
        <div class="char-grid">
            ${gridItems}
        </div>
        
        <style>
            .char-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 10px;
                padding: 20px 0;
            }
            .grid-item {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                text-align: center;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: box-shadow 0.2s;
                content-visibility: auto;  /* Improve rendering performance for large lists */
                contain-intrinsic-size: 140px; /* Estimate size */
            }
            .grid-item:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                z-index: 1; /* Bring to front on hover */
            }
            .char-display {
                font-size: 3.5rem;
                line-height: 1.2;
                margin-bottom: 0.5rem;
                font-family: ${fontFamilies.map(f => ['serif', 'sans-serif', 'monospace'].includes(f) ? f : `'${f}'`).join(', ')}, serif;
                color: #000;
                -webkit-font-smoothing: auto;
            }
            .char-id {
                font-family: monospace;
                font-size: 0.9rem;
                color: #222;
                font-weight: 600;
                background: #f0f0f0;
                padding: 2px 6px;
                border-radius: 4px;
                margin-bottom: 4px;
            }
            .char-num {
                font-size: 0.8rem;
                color: #555;
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
