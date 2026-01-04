
import { decode } from 'cbor-x';

// Type definitions for flattened mDoc structure
interface MdocStructure {
    documents: {
        docType: string;
        issuerSigned: {
            nameSpaces: {
                [namespace: string]: any[]; // IssuerSignedItem bytes
            }
        }
    }[]
}

// Logic helper functions (re-implemented from Logic.ts)
const getRowHeights = () => ([
    6, 36, 32, 32, 4,
    30, 20, 20, 20, 20, 30, 30, 30, 15, 15, 9, 39,
    30, 20, 20, 20, 20, 30, 30, 30, 15, 15, 9, 39,
    30, 20, 20, 20, 20, 30, 30, 30, 15, 15, 9, 39,
    30, 20, 20, 20, 20, 30, 30, 30, 15, 15, 9, 39,
    30, 20, 20, 20, 20, 30, 30, 30, 15, 15, 9, 39
]);

const normalizeText = (text: string | undefined | null) => text || '';

const formatDateWareki = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
        // Simple logic for Demo (assuming recent dates for PoC)
        const date = new Date(dateStr);
        const year = date.getFullYear();
        if (year > 2019) return `令和${year - 2018}年${date.getMonth() + 1}月${date.getDate()}日`;
        if (year > 1989) return `平成${year - 1988}年${date.getMonth() + 1}月${date.getDate()}日`;
        return dateStr;
    } catch { return dateStr || ''; }
};

const normalizeDomicile = (domiciles: string[] | undefined) => {
    if (!domiciles || domiciles.length === 0) return { honseki: '', hittosha: '' };
    return { honseki: domiciles[0] || '', hittosha: domiciles[1] || '' };
};

const normalizeRemarks = (remarks: string[] | undefined) => {
    const r = remarks || [];
    return [r[0] || '', r[1] || '', r[2] || '', r[3] || ''];
};

const rowHeights = getRowHeights();
const rowHeight = (rowNumber: number) => rowHeights[rowNumber - 1] ?? 18;

const labelHtml = (main: string) => `
    <div class="label-text">
        <span class="label-main">${main}</span>
    </div>
`;


// --- Client Side Rendering Logic ---

function renderMdoc(mDocBase64: string) {
    try {
        console.time('mDoc Decode & Render');

        // 1. Decode Base64 to Uint8Array
        const binaryString = atob(mDocBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 2. Decode CBOR (Outer mDoc)
        const mdoc = decode(bytes) as MdocStructure;
        const doc = mdoc.documents[0]; // Assuming single doc
        const nameSpace = doc.issuerSigned.nameSpaces['jp.co.tobari.juminhyo'];

        // 3. Flattened Claims Reconstruction
        // Iterate over IssuerSignedItems to rebuild the object
        const claims: Record<string, any> = {};

        for (const itemBytes of nameSpace) {
            // Each item is tagged CBOR (tag 24), so we need to unwrap content
            // However, cbor-x decode might handle it if configured, or return Tagged value.
            // In standard mDoc (ISO 18013-5), IssuerSignedItem is bytes of Key-Value.
            const item = decode(itemBytes.value || itemBytes); // Handle Tag 24 structure
            claims[item.elementIdentifier] = item.elementValue;
        }

        console.log("Reconstructed Claims:", claims);

        // 4. Transform Flattened Claims to Hierarchical for Template
        // The mDoc was flattened as member_0_name etc.
        const data: any = {
            certificateTitle: claims.certificateTitle,
            address: claims.address,
            householder: claims.householder,
            members: []
        };

        // Regroup members
        // Basic heuristic: find keys starting with member_X_
        const memberData: Record<number, any> = {};
        Object.keys(claims).forEach(key => {
            const match = key.match(/^member_(\d+)_(.+)$/);
            if (match) {
                const idx = parseInt(match[1]);
                const field = match[2];
                if (!memberData[idx]) memberData[idx] = {};
                memberData[idx][field] = claims[key];
            }
        });

        // Convert to array
        Object.keys(memberData).sort().forEach(idx => {
            data.members.push(memberData[parseInt(idx)]);
        });

        // 5. Generate HTML
        const tableHtml = generateTableHtml(data);

        // 6. Inject
        const container = document.getElementById('sheet-content');
        if (container) container.innerHTML = tableHtml;

        console.timeEnd('mDoc Decode & Render');

    } catch (e) {
        console.error("Rendering failed", e);
        document.body.innerHTML = `<h1>Error Rendering mDoc</h1><pre>${e}</pre>`;
    }
}


function generateTableHtml(data: any) {
    let rowsHtml = '';

    // Header
    rowsHtml += `
        <tr style="height: ${rowHeights[0]}px;">
            <td class="cell no-border" colspan="14"></td>
            <td class="cell title-cell no-border" colspan="12" rowspan="2">${normalizeText(data.certificateTitle)}</td>
            <td class="cell no-border" colspan="14"></td>
        </tr>
        <tr style="height: ${rowHeights[1]}px;">
            <td class="cell no-border" colspan="14"></td>
            <td class="cell no-border" colspan="14"></td>
        </tr>
        <tr style="height: ${rowHeights[2]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住所')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(data.address)}</td>
        </tr>
        <tr style="height: ${rowHeights[3]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('世帯主')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(data.householder)}</td>
        </tr>
        <tr style="height: ${rowHeights[4]}px;">
            <td class="cell no-border" colspan="40"></td>
        </tr>
    `;

    // Members
    let startRow = 6;
    data.members.forEach((member: any, index: number) => {
        rowsHtml += renderPersonRows(member, index, startRow);
        startRow += 12; // 12 rows per person
    });

    return `
        <table class="juminhyo-table">
            <colgroup>
                ${'<col style="width: 2.5%">'.repeat(40)}
            </colgroup>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

// Reusing the template logic
function renderPersonRows(item: any, index: number, startRow: number) {
    const { honseki, hittosha } = normalizeDomicile(item.domiciles);
    const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);

    return `
        <tr style="height: ${rowHeight(startRow)}px;">
            <td class="cell number-cell" rowspan="12">${index + 1}</td>
            <td class="cell label-cell" colspan="5">${labelHtml('氏名の振り仮名')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.kana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('個人番号')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.individualNumber)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 1)}px;">
            <td class="cell label-cell" colspan="5" rowspan="2">${labelHtml('氏名')}</td>
            <td class="cell value-cell name-cell" colspan="18" rowspan="2">${normalizeText(item.name)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住民票コード')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.residentCode)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 2)}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住民となった年月日')}</td>
            <td class="cell value-cell" colspan="10">${formatDateWareki(item.becameResidentDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 3)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏の振り仮名')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.maidenKana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住所を定めた年月日')}</td>
            <td class="cell value-cell" colspan="10">${formatDateWareki(item.addressSetDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 4)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.maidenName)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('届出日')}</td>
            <td class="cell value-cell" colspan="10">${formatDateWareki(item.notificationDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 5)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('生年月日')}</td>
            <td class="cell value-cell" colspan="8">${formatDateWareki(item.birthDate)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('性別')}</td>
            <td class="cell value-cell" colspan="2">${normalizeText(item.gender)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('続柄')}</td>
            <td class="cell value-cell" colspan="4">${normalizeText(item.relationship)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('筆頭者')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(hittosha)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 6)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('本籍')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(honseki)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 7)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('転入前住所')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(item.prevAddress)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 8)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18">${normalizeText(remark1)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10">${normalizeText(remark2)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 9)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18">${normalizeText(remark3)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10">${normalizeText(remark4)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 10)}px;">
            <td class="cell value-cell" colspan="39"></td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 11)}px;">
            <td class="cell value-cell" colspan="39"></td>
        </tr>
    `;
}

// Expose to window
(window as any).renderMdoc = renderMdoc;
