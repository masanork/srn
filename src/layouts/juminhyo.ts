
import { baseLayout } from './base.js';

export interface JuminhyoItem {
    name: string;
    kana?: string;
    dob: string;
    gender: string;
    relationship: string;

    // Resident Dates
    becameResident: string;
    becameResidentReason?: string;
    addressDate?: string;
    notificationDate?: string;

    prevAddress?: string;
    domiciles?: string[]; // 本籍

    // Sensitive / Optional
    myNumber?: string;
    residentCode?: string;
    election?: string;
    qualifications?: string[];

    remarks?: string[];
}

export interface JuminhyoData {
    layout: 'juminhyo';
    title: string;
    description?: string;
    certificateTitle: string;
    watermark?: string;
    issueDate: string;
    address: string;
    householder: string;
    items: JuminhyoItem[];
    issuer: {
        title: string;
        name: string;
    };
    [key: string]: any;
}

export function juminhyoLayout(data: JuminhyoData, _bodyContent: string, fontCss: string, fontFamilies: string[], vc?: any) {
    // Generate JSON-LD for Machine Readability
    // Using a schema.org compatible structure or a custom context for government documents
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "GovernmentPermit",
        "name": data.certificateTitle,
        "dateIssued": data.issueDate,
        "issuer": {
            "@type": "GovernmentOrganization",
            "name": data.issuer.title
        },
        "credentialSubject": {
            "@type": "Person",
            "name": data.householder,
            "address": data.address,
            "member": data.items.map(item => ({
                "@type": "Person",
                "name": item.name,
                "birthDate": item.dob,
                "gender": item.gender,
                "relationship": item.relationship
            }))
        }
    };

    const columnWidths = [
        19, 19, 19, 19, 19, 27,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19,
        19, 19, 19, 19, 19, 28,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19
    ];
    const rowHeights = Array.from({ length: 53 }, (_, idx) => (idx === 5 ? 17 : 18));

    const labelHtml = (main: string, _kana?: string) => `
        <div class="label-text">
            <span class="label-main">${main}</span>
        </div>
    `;

    const normalizeText = (value?: string) => value ?? '';
    const normalizeDomicile = (domiciles?: string[]) => {
        if (!domiciles || domiciles.length === 0) {
            return { honseki: '', hittosha: '' };
        }
        const honseki = domiciles[0] ?? '';
        const hittosha = domiciles[1] ? domiciles[1].replace(/^筆頭者：?/, '') : '';
        return { honseki, hittosha };
    };

    const normalizeRemarks = (remarks?: string[]) => {
        const slots = Array.from({ length: 4 }, (_, idx) => remarks?.[idx] ?? '');
        return slots;
    };

    const rowHeight = (rowNumber: number) => rowHeights[rowNumber - 1] ?? 18;

    const fillItems = Array.from({ length: 4 }, (_, idx) => data.items[idx] ?? {
        name: '',
        kana: '',
        dob: '',
        gender: '',
        relationship: '',
        becameResident: '',
        addressDate: '',
        notificationDate: ''
    });

    const renderPersonRows = (item: JuminhyoItem, index: number, startRow: number) => {
        const { honseki, hittosha } = normalizeDomicile(item.domiciles);
        const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);

        return `
            <tr style="height: ${rowHeight(startRow)}px;">
                <td class="cell number-cell" rowspan="12">${index + 1}</td>
                <td class="cell label-cell" colspan="5">${labelHtml('氏名の振り仮名')}</td>
                <td class="cell value-cell" colspan="18">${normalizeText(item.kana)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('個人番号', 'コジンバンゴウ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.myNumber)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 1)}px;">
                <td class="cell label-cell" colspan="5" rowspan="2">${labelHtml('氏名', 'ウジメイ')}</td>
                <td class="cell value-cell name-cell" colspan="18" rowspan="2">${normalizeText(item.name)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('住民票コード', 'ジュウミンヒョウ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.residentCode)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 2)}px;">
                <td class="cell label-cell" colspan="6">${labelHtml('住民となった年月日', 'ジュウミンネンガッピ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.becameResident)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 3)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('旧氏の振り仮名', 'キュウウジフガナ')}</td>
                <td class="cell value-cell" colspan="18"></td>
                <td class="cell label-cell" colspan="6">${labelHtml('住所を定めた年月日', 'ジュウショサダネンガッピ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.addressDate)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 4)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('旧氏', 'キュウウジ')}</td>
                <td class="cell value-cell" colspan="18"></td>
                <td class="cell label-cell" colspan="6">${labelHtml('届出日', 'トドケデビ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.notificationDate)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 5)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('生年月日', 'セイネンガッピ')}</td>
                <td class="cell value-cell" colspan="8">${normalizeText(item.dob)}</td>
                <td class="cell label-cell" colspan="2">${labelHtml('性別', 'セイベツ')}</td>
                <td class="cell value-cell" colspan="2">${normalizeText(item.gender)}</td>
                <td class="cell label-cell" colspan="2">${labelHtml('続柄', 'ゾクガラ')}</td>
                <td class="cell value-cell" colspan="4">${normalizeText(item.relationship)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('筆頭者', 'ヒットウシャ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(hittosha)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 6)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('本籍', 'ホンセキ')}</td>
                <td class="cell value-cell" colspan="34">${normalizeText(honseki)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 7)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('転入前住所', 'テンニュウマエジュウショ')}</td>
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
    };

    const tableHeaderRows = `
        <tr style="height: ${rowHeights[0]}px;">
            <td class="cell no-border" colspan="16"></td>
            <td class="cell title-cell no-border" colspan="7" rowspan="2">${normalizeText(data.certificateTitle)}</td>
            <td class="cell no-border" colspan="10"></td>
            <td class="cell date-cell no-border" colspan="7" rowspan="2">${normalizeText(data.issueDate)}</td>
        </tr>
        <tr style="height: ${rowHeights[1]}px;">
            <td class="cell no-border" colspan="16"></td>
            <td class="cell no-border" colspan="10"></td>
        </tr>
        <tr style="height: ${rowHeights[2]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住所', 'ジュウショ')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(data.address)}</td>
        </tr>
        <tr style="height: ${rowHeights[3]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('世帯主', 'セタイヌシ')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(data.householder)}</td>
        </tr>
        <tr style="height: ${rowHeights[4]}px;">
            <td class="cell no-border" colspan="40"></td>
        </tr>
    `;

    const itemsHtml = fillItems.map((item, index) => renderPersonRows(item, index, 6 + index * 12)).join('');

    const fullContent = `
        <script type="application/ld+json">
            ${JSON.stringify(jsonLd)}
        </script>

        <div class="jumin-sheet">
            ${data.watermark ? `<div class="watermark">${data.watermark}</div>` : ''}

            <table class="jumin-table">
                <colgroup>
                    ${columnWidths.map(width => `<col style="width: ${width}px;">`).join('')}
                </colgroup>
                ${tableHeaderRows}
                ${itemsHtml}
            </table>

            <div class="jumin-footer">
                <div class="cert-text">
                    この写しは、世帯全員の住民票の原本と相違ないことを証明する。
                </div>
                <div class="issuer-line">
                    ${normalizeText(data.issuer.title)}　${normalizeText(data.issuer.name)}　印
                </div>
            </div>

            ${vc ? `
            <div class="vc-debug-area">
                <details>
                    <summary>デジタル原本データ構造 (VC/JSON-LD)</summary>
                    <pre class="vc-code">${JSON.stringify(vc, null, 2)}</pre>
                </details>
            </div>
            ` : ''}
        </div>

        <style>
            .jumin-sheet {
                font-family: ${fontFamilies.map(f => ['serif', 'sans-serif', 'monospace'].includes(f) ? f : `'${f}'`).join(', ')}, "Hiragino Mincho ProN", "Yu Mincho", serif;
                max-width: 210mm; /* A4 width */
                min-height: 297mm;
                margin: 0 auto;
                border: 1px solid #ccc;
                padding: 2mm;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                position: relative;
                box-sizing: border-box;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 100px;
                color: rgba(0, 0, 0, 0.05);
                z-index: 0;
                pointer-events: none;
                font-weight: bold;
                border: 10px solid rgba(0, 0, 0, 0.05);
                padding: 20px 80px;
                white-space: nowrap;
            }
            .jumin-table {
                width: 777px;
                border-collapse: collapse;
                table-layout: fixed;
                margin: 0 auto;
                font-size: 9pt;
            }
            .jumin-table .cell {
                border: 1px solid #000;
                padding: 1px 2px;
                vertical-align: middle;
                word-break: break-word;
            }
            .jumin-table .no-border {
                border: none;
            }
            .title-cell {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                letter-spacing: 0.4em;
            }
            .date-cell {
                font-size: 9pt;
                text-align: right;
                vertical-align: top;
                padding-top: 2px;
                padding-right: 4px;
            }
            .number-cell {
                text-align: center;
                font-size: 11pt;
                font-weight: bold;
            }
            .label-cell {
                font-size: 8.5pt;
                line-height: 1.1;
            }
            .value-cell {
                font-size: 9.5pt;
                line-height: 1.2;
            }
            .name-cell {
                font-size: 12pt;
                font-weight: bold;
            }
            .label-text {
                display: inline-flex;
                align-items: baseline;
            }
            .label-main {
                font-size: 8.5pt;
            }
            .jumin-footer {
                width: 777px;
                margin: 6mm auto 0;
                font-size: 10.5pt;
                line-height: 1.6;
            }
            .cert-text {
                margin-bottom: 8mm;
            }
            .issuer-line {
                text-align: right;
                font-size: 11pt;
            }
            .vc-debug-area {
                margin-top: 20mm;
                border-top: 1px dashed #ccc;
                padding-top: 5mm;
                text-align: left;
                font-size: 9pt;
            }
            .vc-debug-area summary {
                cursor: pointer;
                color: #007bff;
                font-weight: bold;
                padding: 5px;
            }
            .vc-code {
                background: #f3f4f6;
                color: #111;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                max-height: 400px;
                overflow-y: auto;
                margin-top: 5px;
                border: 1px solid #d0d7de;
            }
            @media print {
                .jumin-sheet {
                    border: none;
                    box-shadow: none;
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    max-width: none;
                }
                .vc-debug-area {
                    display: none !important;
                }
                body {
                    background-color: #fff;
                }
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
