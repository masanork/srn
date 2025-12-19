import { baseLayout } from './base.js';

export interface VariantRelation {
    source: string;     // Base character (e.g. "凶")
    property: string;   // Relation type (e.g. "kSemanticVariant", "kSrnsIVS" etc)
    target: string;     // Target character (e.g. "兇" or "葛󠄂")
    note?: string;
}

export interface VariantsData {
    title: string;
    description?: string;
    layout: 'variants';
    variants: VariantRelation[];
    [key: string]: any;
}

function toHex(str: string): string {
    return Array.from(str).map(c => 'U+' + c.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

// Group variants by source character
function groupBySource(variants: VariantRelation[]): Record<string, VariantRelation[]> {
    const groups: Record<string, VariantRelation[]> = {};
    for (const v of variants) {
        if (!groups[v.source]) {
            groups[v.source] = [];
        }
        groups[v.source].push(v);
    }
    return groups;
}

// Generate Unihan-style text representation
function generateUnihanText(variants: VariantRelation[]): string {
    return variants.map(v => {
        const sourceCode = toHex(v.source);
        const targetCode = toHex(v.target);
        return `${sourceCode}\t${v.property}\t${targetCode}\t# ${v.note || ''}`;
    }).join('\n');
}

export function variantsLayout(data: VariantsData, bodyContent: string, fontCss: string, fontFamilies: string[]) {

    // Grouping
    const groups = groupBySource(data.variants);
    const groupKeys = Object.keys(groups);

    // Render tables for each group
    const sections = groupKeys.map(sourceChar => {
        const relations = groups[sourceChar];

        const rows = relations.map(r => {
            return `
            <tr>
                <td class="prop-cell">${r.property}</td>
                <td class="target-glyph font-apply">${r.target}</td>
                <td class="code-cell">${toHex(r.target)}</td>
                <td class="note-cell">${r.note || ''}</td>
            </tr>
            `;
        }).join('');

        return `
        <div class="variant-group">
            <div class="source-char-container">
                <span class="source-label">Source:</span>
                <span class="source-glyph font-apply">${sourceChar}</span>
                <span class="source-code">${toHex(sourceChar)}</span>
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
