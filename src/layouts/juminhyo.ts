
import { baseLayout } from './base.js';

export interface JuminhyoItem {
    name: string;
    kana?: string;
    dob: string;
    gender: string;
    relationship: string;
    becameResident: string;
    prevAddress?: string;
    domiciles?: string[]; // 本籍
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

export function juminhyoLayout(data: JuminhyoData, _bodyContent: string, fontCss: string, fontFamilies: string[]) {
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
        // Base rows (Name, DOB, Relation) = 3 + Remarks = 1 => 4
        // Optional rows: Prev = 1, Domicile = 1
        const rowspan = 4 + (hasPrev ? 1 : 0) + (hasDomicile ? 1 : 0);

        return `
    <div class="person-block">
        <table class="person-table">
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
                <td style="width: 30%;">${item.dob}</td>
                <th>性別</th>
                <td>${item.gender}</td>
            </tr>
            <tr>
                <th>続柄</th>
                <td>${item.relationship}</td>
                <th>住民となった日</th>
                <td>${item.becameResident}</td>
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
            <tr>
                <td style="border:none;"></td>
                <th>備考</th>
                <td colspan="3">
                    ${item.remarks ? item.remarks.join('<br>') : ''}
                </td>
            </tr>
        </table>
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

            <table class="main-info">
                <tr>
                    <th style="width: 100px;">住所</th>
                    <td colspan="3">${data.address}</td>
                </tr>
                <tr>
                    <th>世帯主氏名</th>
                    <td colspan="3">${data.householder}</td>
                </tr>
            </table>

            ${itemsHtml}

            <div class="footer-area">
                <div class="cert-text">
                    この写しは、住民基本台帳の原本と相違ないことを証明する。
                </div>
                
                <div class="official-seal-row">
                    <div class="mayor-name">
                        ${data.issuer.title}　${data.issuer.name}
                    </div>
                    <div class="stamp-box">
                        公印<br>省略
                    </div>
                </div>
            </div>
        </div>

        <style>
            .jumin-sheet {
                font-family: ${fontFamilies.map(f => `'${f}'`).join(', ')}, serif;
                max-width: 100%;
                margin: 0 auto;
                border: 1px solid #000;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                position: relative;
            }
            .watermark {
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                color: rgba(200, 200, 200, 0.5);
                z-index: 0;
                pointer-events: none;
                font-weight: bold;
                border: 5px solid rgba(200, 200, 200, 0.5);
                padding: 20px 50px;
            }
            .header-area {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 20px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 5px;
            }
            .issue-date {
                font-size: 14px;
            }
            .main-info {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
            }
            .main-info th, .main-info td {
                border: 1px solid #000;
                padding: 5px 8px;
                vertical-align: top;
            }
            .main-info th {
                background-color: #f0f0f0;
                width: 15%;
                text-align: left;
                font-weight: normal;
                font-size: 12px;
            }
            .person-block {
                border: 2px solid #000;
                margin-top: -1px; /* Overlap borders */
                margin-bottom: 20px;
                break-inside: avoid;
            }
            .person-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            .person-table th, .person-table td {
                border: 1px solid #000;
                padding: 5px 8px;
                vertical-align: middle;
            }
            .person-table th {
                background-color: #f9f9f9;
                font-weight: normal;
                font-size: 12px;
                width: 12%;
                text-align: left;
            }
            .kana {
                font-size: 10px;
                color: #555;
                display: block;
                margin-bottom: 2px;
            }
            .name-large {
                font-size: 18px;
                font-weight: bold;
            }
            .col-num {
                width: 30px;
                text-align: center;
                background-color: #e0e0e0;
                font-weight: bold;
                border-right: 2px solid #000;
            }
            .footer-area {
                margin-top: 40px;
                text-align: center;
                page-break-inside: avoid;
            }
            .cert-text {
                text-align: left;
                margin-bottom: 20px;
                line-height: 1.8;
            }
            .official-seal-row {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 30px;
            }
            .mayor-name {
                font-size: 16px;
                margin-right: 20px;
            }
            .stamp-box {
                width: 60px;
                height: 60px;
                border: 3px solid #d00;
                color: #d00;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                border-radius: 50%;
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
