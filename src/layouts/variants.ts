import { baseLayout } from './base.js';

export interface VariantRelationItem {
    property: string;   // Relation type (e.g. "kSemanticVariant", "kSrnsIVS")
    target: string;     // Target character
    note?: string;
}

export interface VariantGroup {
    source: string;     // Base character
    items: VariantRelationItem[];
}

export interface VariantsData {
    title: string;
    description?: string;
    layout: 'variants';
    variants: VariantGroup[];
    [key: string]: any;
}

function toHex(str: string): string {
    return Array.from(str).map(c => 'U+' + c.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

// Generate Unihan-style text representation (Flatten 1-to-many relationship to 1-to-1 lines)
function generateUnihanText(groups: VariantGroup[]): string {
    let lines: string[] = [];

    for (const group of groups) {
        const sourceCode = toHex(group.source);
        for (const item of group.items) {
            const targetCode = toHex(item.target);
            // Format: U+XXXX <TAB> Property <TAB> U+YYYY <TAB> # Note
            lines.push(`${sourceCode}\t${item.property}\t${targetCode}\t# ${item.note || ''}`);
        }
    }

    return lines.join('\n');
}

export function variantsLayout(data: VariantsData, bodyContent: string, fontCss: string, fontFamilies: string[]) {

    // Render tables for each group
    const sections = data.variants.map(group => {
        const rows = group.items.map(item => {
            return `
            <tr>
                <td class="prop-cell">${item.property}</td>
                <td class="target-glyph font-apply">${item.target}</td>
                <td class="code-cell">${toHex(item.target)}</td>
                <td class="note-cell">${item.note || ''}</td>
            </tr>
            `;
        }).join('');

        return `
        <div class="variant-group">
            <div class="source-char-container">
                <span class="source-label">Source:</span>
                <span class="source-glyph font-apply">${group.source}</span>
                <span class="source-code">${toHex(group.source)}</span>
            </div>
            <table class="variants-table">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Target Glyph</th>
                        <th>Code Point</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
        `;
    }).join('');


    const unihanText = generateUnihanText(data.variants);

    const fullContent = `
        <h1>${data.title}</h1>
        ${bodyContent}

        <section class="variants-section">
            ${sections}
        </section>

        <section class="export-section">
            <h2>Unihan Format Export</h2>
            <textarea readonly class="export-area">${unihanText}</textarea>
        </section>

        <style>
            .variant-group {
                margin-bottom: 3rem;
                padding: 1.5rem;
                background: #fff;
                border: 1px solid var(--border-color);
                border-radius: 8px;
            }
            .source-char-container {
                display: flex;
                align-items: baseline;
                gap: 1rem;
                margin-bottom: 1rem;
                border-bottom: 2px solid var(--link-color);
                padding-bottom: 0.5rem;
            }
            .source-label {
                font-weight: bold;
                color: #666;
            }
            .source-glyph {
                font-size: 2.5rem;
                color: #000;
                -webkit-font-smoothing: auto;
            }
            .source-code {
                font-family: monospace;
                color: #666;
            }
            
            .variants-table {
                width: 100%;
                border-collapse: collapse;
            }
            .variants-table th, .variants-table td {
                border: 1px solid #eee;
                padding: 0.8rem;
                text-align: left;
            }
            .variants-table th {
                background: var(--bg-color);
                font-weight: 600;
            }
            .font-apply {
                font-family: ${fontFamilies.map(f => `'${f}'`).join(', ')}, serif;
            }
            .target-glyph {
                font-size: 2rem;
                color: #000;
                -webkit-font-smoothing: auto;
            }
            .code-cell, .export-area {
                font-family: monospace;
            }
            .export-area {
                width: 100%;
                height: 200px;
                padding: 1rem;
                border: 1px solid var(--border-color);
                background: var(--code-bg);
                color: var(--text-color);
                white-space: pre;
                overflow: auto;
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
