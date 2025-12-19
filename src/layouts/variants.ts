import { baseLayout } from './base.js';

export interface VariantItem {
    char: string;
    ivs?: string; // e.g. "E0100"
    note?: string;
}

export interface VariantsData {
    title: string;
    description?: string;
    layout: 'variants';
    variants: VariantItem[];
    [key: string]: any;
}

function toHex(str: string): string {
    return Array.from(str).map(c => 'U+' + c.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

// Generate Unihan-style text representation
// Format: U+XXXX<tab>kSrnsNote<tab>Note content
// If IVS is present: U+XXXX U+Exxxx<tab>kSrnsNote<tab>Note content
function generateUnihanText(variants: VariantItem[]): string {
    return variants.map(v => {
        const charCode = toHex(v.char); // Currently assumes base char. If char has IVS in string, it will show both.
        // If the user inputs "葛" and specifies IVS "E0100" separately
        let codeStr = charCode;
        if (v.ivs) {
            codeStr += ` U+${v.ivs}`;
        }

        return `${codeStr}\tkSrnNote\t${v.note || ''}`;
    }).join('\n');
}

export function variantsLayout(data: VariantsData, bodyContent: string, fontCss: string, fontFamilies: string[]) {
    // Generate Rows
    const rows = data.variants.map(v => {
        // Construct the full display character
        let displayChar = v.char;
        if (v.ivs) {
            // Convert hex IVS to character
            const ivsChar = String.fromCodePoint(parseInt(v.ivs, 16));
            displayChar += ivsChar;
        }

        const charCode = toHex(displayChar);

        return `
        <tr>
            <td class="variant-char">${displayChar}</td>
            <td class="variant-code">${charCode}</td>
            <td class="variant-note">${v.note || ''}</td>
        </tr>
        `;
    }).join('');

    const unihanText = generateUnihanText(data.variants);

    const fullContent = `
        <h1>${data.title}</h1>
        ${bodyContent}

        <section class="variants-section">
            <h2>異体字リスト</h2>
            <table class="variants-table">
                <thead>
                    <tr>
                        <th>Glyph</th>
                        <th>Code Point</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </section>

        <section class="export-section">
            <h2>Unihan Format Export</h2>
            <p>以下のテキストなどをコピーして Unihan Database 形式として利用できます。</p>
            <textarea readonly style="width: 100%; height: 200px; font-family: monospace;">${unihanText}</textarea>
        </section>

        <style>
            .variants-table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
            }
            .variants-table th, .variants-table td {
                border: 1px solid var(--border-color);
                padding: 1rem;
                text-align: left;
            }
            .variant-char {
                font-size: 3rem;
                font-family: ${fontFamilies.map(f => `'${f}'`).join(', ')}, serif;
            }
            .variant-code {
                font-family: monospace;
                color: #666;
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
