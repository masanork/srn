
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

    const itemsHtml = data.items.map((item, index) => {
        const hasPrev = !!item.prevAddress;
        const hasDomicile = !!item.domiciles;
        // Check for sensitive/optional fields
        const hasMyNumber = !!item.myNumber || !!item.residentCode;

        // Base rows (Name, DOB, Relation, Remarks) = 4
        // Optional rows: Prev = 1, Domicile = 1, MyNumber/Code = 1
        const rowspan = 4
            + (hasPrev ? 1 : 0)
            + (hasDomicile ? 1 : 0)
            + (hasMyNumber ? 1 : 0);

        return `
    <div class="person-block">
        <table class="person-table">
            <colgroup>
                <col style="width: 30px;">
                <col style="width: 80px;">
                <col style="width: 32%;">
                <col style="width: 80px;">
                <col>
            </colgroup>
            <tr>
                <td rowspan="${rowspan}" class="col-num">${index + 1}</td>
                <th>氏名</th>
                <td colspan="3">
                    ${item.kana ? `<span class="kana">${item.kana}</span>` : ''}
                    <span class="name-large">${item.name}</span>
                </td>
            </tr>
            <tr>
                <th>生年月日</th>
                <td>${item.dob}</td>
                <th>性別</th>
                <td>${item.gender}</td>
            </tr>
            <tr>
                <th>続柄</th>
                <td>${item.relationship}</td>
                <th>住民となった日<br>等</th>
                <td>
                    ${item.becameResident ? `<div><span class="label">住民となった日：</span>${item.becameResident}</div>` : ''}
                    ${item.becameResidentReason ? `<div><span class="label">届出の理由：</span>${item.becameResidentReason}</div>` : ''}
                    ${item.addressDate ? `<div><span class="label">住所を定めた日：</span>${item.addressDate}</div>` : ''}
                    ${item.notificationDate ? `<div><span class="label">届出年月日：</span>${item.notificationDate}</div>` : ''}
                </td>
            </tr>
            ${item.prevAddress ? `
            <tr>
                <th>前住所</th>
                <td colspan="3">${item.prevAddress}</td>
            </tr>
            ` : ''}
            ${item.domiciles ? `
            <tr>
                <th>本籍</th>
                <td colspan="3">
                    ${item.domiciles.join('<br>')}
                </td>
            </tr>
            ` : ''}
            ${hasMyNumber ? `
            <tr>
                <th>個人番号等</th>
                <td colspan="3">
                    ${item.myNumber ? `<div><span class="label">個人番号：</span>${item.myNumber}</div>` : ''}
                    ${item.residentCode ? `<div><span class="label">住民票コード：</span>${item.residentCode}</div>` : ''}
                </td>
            </tr>
            ` : ''}
            <tr>
                <th>備考</th>
                <td colspan="3">
                    ${item.remarks ? item.remarks.join('<br>') : ''}
                </td>
            </tr>
        </table>
    </div>
        `;
    }).join('');

    const fullContent = `
        <script type="application/ld+json">
            ${JSON.stringify(jsonLd)}
        </script>

        <div class="jumin-sheet">
            ${data.watermark ? `<div class="watermark">${data.watermark}</div>` : ''}
  
            <div class="header-area">
                <div class="title">${data.certificateTitle}</div>
                <div class="issue-date">発行日：${data.issueDate}</div>
            </div>

            <div class="grid-container">
                <table class="main-info">
                    <colgroup>
                        <col style="width: 110px;"> <!-- 30px index + 80px label alignment -->
                        <col>
                    </colgroup>
                    <tr>
                        <th>住所</th>
                        <td>${data.address}</td>
                    </tr>
                    <tr>
                        <th>世帯主氏名</th>
                        <td>${data.householder}</td>
                    </tr>
                </table>

                ${itemsHtml}
            </div>

            <div class="footer-area">
                <div class="cert-text">
                    この写しは、住民基本台帳の原本と相違ないことを証明する。
                </div>
                
                <div class="official-seal-row">
                    <div class="mayor-name">
                        ${data.issuer.title}　${data.issuer.name}
                    </div>
                    <div class="stamp-wrapper">
                        <div class="stamp-box">
                            公印<br>省略
                        </div>
                        ${vc ? `
                        <div class="digital-badge" title="デジタル署名付き">
                            DIGITAL
                        </div>
                        ` : ''}
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
        </div>

        <style>
            .jumin-sheet {
                font-family: ${fontFamilies.map(f => `'${f}'`).join(', ')}, "Hiragino Mincho ProN", "Yu Mincho", serif;
                max-width: 210mm; /* A4 width */
                min-height: 297mm;
                margin: 0 auto;
                border: 1px solid #ccc;
                padding: 15mm;
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
            .header-area {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 5mm;
                border-bottom: 2px solid #333;
                padding-bottom: 2mm;
            }
            .title {
                font-size: 22pt;
                font-weight: bold;
                letter-spacing: 0.2em;
            }
            .issue-date {
                font-size: 11pt;
            }
            .grid-container {
                border-bottom: 2px solid #333; /* Close the bottom of the grid */
            }
            .main-info {
                width: 100%;
                border-collapse: collapse;
                margin: 0; /* Remove margin to connect */
                font-size: 11pt;
            }
            .main-info th, .main-info td {
                border: 1px solid #333;
                padding: 1mm 2mm;
                vertical-align: middle;
            }
            .main-info th {
                background-color: #f2f2f2;
                text-align: left;
                font-weight: normal;
                border-bottom: none; /* Connect to next table visually if needed, but 1px solid is better for grid */
            }
            .person-block {
                margin: 0;
                padding: 0;
                /* Remove individual border wrapper, rely on table borders */
                border: none;
                margin-top: -1px; /* Overlap previous table bottom border */
            }
            .person-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10.5pt;
                table-layout: fixed;
                border-top: none; /* Rely on previous element's border */
            }
            .person-table th, .person-table td {
                border: 1px solid #333;
                padding: 1mm 2mm;
                vertical-align: top;
                word-wrap: break-word;
            }
            /* Remove top border of first row cells to merge with previous block */
            /* Actually, maintaining 1px solid is safer effectively creates the grid */
            
            .person-table th {
                background-color: #f2f2f2;
                font-weight: normal;
                text-align: left;
                vertical-align: middle;
            }
            .col-num {
                text-align: center;
                background-color: #e6e6e6;
                font-weight: bold;
                vertical-align: middle !important;
                font-size: 12pt;
            }
            .kana {
                font-size: 8pt;
                color: #444;
                display: block;
                margin-bottom: 1px;
            }
            .name-large {
                font-size: 14pt;
                font-weight: bold;
            }
            .label {
                font-size: 9pt;
                color: #555;
                margin-right: 0.5em;
            }
            .footer-area {
                margin-top: 15mm;
                text-align: center;
                page-break-inside: avoid;
            }
            .cert-text {
                text-align: left;
                margin-bottom: 10mm;
                font-size: 11pt;
                line-height: 1.6;
            }
            .official-seal-row {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 10mm;
                margin-right: 10mm;
            }
            .mayor-name {
                font-size: 14pt;
                margin-right: 5mm;
                font-weight: bold;
            }
            .stamp-wrapper {
                position: relative;
                display: inline-block;
            }
            .stamp-box {
                width: 20mm;
                height: 20mm;
                border: 3px solid #d00;
                color: #d00;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11pt;
                font-weight: bold;
                line-height: 1.2;
                box-shadow: 0 0 0 1px #fff inset;
            }
            .digital-badge {
                position: absolute;
                bottom: -8px;
                right: -8px;
                background: #007bff;
                color: white;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 4px;
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
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
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
                font-family: monospace;
                max-height: 400px;
                overflow-y: auto;
                margin-top: 5px;
                border: 1px solid #eee;
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
                .vc-debug-area, .digital-badge {
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
