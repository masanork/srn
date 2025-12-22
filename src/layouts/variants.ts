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
                margin-bottom: 4rem;
                padding: 2.5rem;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 1.5rem;
                box-shadow: var(--panel-shadow);
            }
            .source-char-container {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 2rem;
                border-bottom: 2px solid var(--bg-color);
                padding-bottom: 1.5rem;
            }
            .source-label {
                font-weight: 700;
                color: var(--text-muted);
                text-transform: uppercase;
                font-size: 0.8rem;
                letter-spacing: 0.1em;
            }
            .source-glyph {
                font-size: 3.5rem;
                color: var(--accent-color);
                line-height: 1;
                -webkit-font-smoothing: antialiased;
            }
            .source-code {
                font-family: ui-monospace, SFMono-Regular, monospace;
                color: var(--text-color);
                font-weight: 600;
                background: var(--bg-color);
                padding: 0.4rem 0.8rem;
                border-radius: 0.5rem;
            }
            
            .variants-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                border: 1px solid var(--border-color);
                border-radius: 0.75rem;
                overflow: hidden;
            }
            .variants-table th, .variants-table td {
                padding: 1.25rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }
            .variants-table th {
                background: var(--bg-color);
                font-weight: 600;
                color: var(--text-muted);
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .variants-table tr:last-child td {
                border-bottom: none;
            }
            .font-apply {
                font-family: ${fontFamilies.map(f => ['serif', 'sans-serif', 'monospace'].includes(f) ? f : `'${f}'`).join(', ')}, serif;
            }
            .target-glyph {
                font-size: 2.5rem;
                color: var(--accent-color);
                line-height: 1;
                -webkit-font-smoothing: antialiased;
            }
            .code-cell {
                font-family: ui-monospace, SFMono-Regular, monospace;
                font-size: 0.85rem;
                color: var(--text-muted);
            }
            .export-section {
                margin-top: 5rem;
            }
            .export-area {
                width: 100%;
                height: 300px;
                padding: 1.5rem;
                border: 1px solid var(--border-color);
                border-radius: 0.75rem;
                background: #0f172a;
                color: #e2e8f0;
                white-space: pre;
                overflow: auto;
                font-family: ui-monospace, SFMono-Regular, monospace;
                font-size: 0.85rem;
                line-height: 1.6;
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
