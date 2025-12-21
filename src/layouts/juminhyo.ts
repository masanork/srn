
import { baseLayout } from './base.js';
import { decode } from 'cbor-x';

export interface JuminhyoItem {
    name: string;
    kana?: string;
    dob: string;
    gender: string;
    relationship: string;
    maidenName?: string;
    maidenKana?: string;

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

export function juminhyoLayout(data: JuminhyoData, _bodyContent: string, fontCss: string, fontFamilies: string[], vc?: any, binaryVc?: string, sdDisclosures?: string[]) {
    // Unified data source: Use the VC's credentialSubject if available, otherwise fallback to Raw data.
    // This ensures that what is signed is exactly what is rendered.
    const subject = vc?.credentialSubject || {
        name: data.certificateTitle,
        householder: data.householder,
        address: data.address,
        member: data.items.map(item => ({
            name: item.name,
            kana: item.kana,
            birthDate: item.dob,
            gender: item.gender,
            relationship: item.relationship,
            becameResidentDate: item.becameResident,
            becameResidentReason: item.becameResidentReason,
            addressSetDate: item.addressDate,
            notificationDate: item.notificationDate,
            residentCode: item.residentCode,
            individualNumber: item.myNumber,
            prevAddress: item.prevAddress,
            domiciles: item.domiciles,
            remarks: item.remarks
        }))
    };

    const jsonLd = {
        "@context": [
            "https://schema.org",
            {
                "jumin": "https://example.gov.jp/ns/juminhyo#"
            }
        ],
        "@type": "GovernmentPermit",
        ...subject
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

    const fillItems = Array.from({ length: 4 }, (_, idx) => subject.member[idx] || {
        name: '',
        kana: '',
        birthDate: '',
        gender: '',
        relationship: '',
        becameResidentDate: '',
        addressSetDate: '',
        notificationDate: '',
        maidenName: '',
        maidenKana: ''
    });

    const renderPersonRows = (item: any, index: number, startRow: number) => {
        const { honseki, hittosha } = normalizeDomicile(item.domiciles);
        const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);

        return `
            <tr style="height: ${rowHeight(startRow)}px;">
                <td class="cell number-cell" rowspan="12">${index + 1}</td>
                <td class="cell label-cell" colspan="5">${labelHtml('氏名の振り仮名')}</td>
                <td class="cell value-cell" colspan="18">${normalizeText(item.kana)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('個人番号', 'コジンバンゴウ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.individualNumber)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 1)}px;">
                <td class="cell label-cell" colspan="5" rowspan="2">${labelHtml('氏名', 'ウジメイ')}</td>
                <td class="cell value-cell name-cell" colspan="18" rowspan="2">${normalizeText(item.name)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('住民票コード', 'ジュウミンヒョウ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.residentCode)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 2)}px;">
                <td class="cell label-cell" colspan="6">${labelHtml('住民となった年月日', 'ジュウミンネンガッピ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.becameResidentDate)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 3)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('旧氏の振り仮名', 'キュウウジフガナ')}</td>
                <td class="cell value-cell" colspan="18">${normalizeText(item.maidenKana)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('住所を定めた年月日', 'ジュウショサダネンガッピ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.addressSetDate)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 4)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('旧氏', 'キュウウジ')}</td>
                <td class="cell value-cell" colspan="18">${normalizeText(item.maidenName)}</td>
                <td class="cell label-cell" colspan="6">${labelHtml('届出日', 'トドケデビ')}</td>
                <td class="cell value-cell" colspan="10">${normalizeText(item.notificationDate)}</td>
            </tr>
            <tr style="height: ${rowHeight(startRow + 5)}px;">
                <td class="cell label-cell" colspan="5">${labelHtml('生年月日', 'セイネンガッピ')}</td>
                <td class="cell value-cell" colspan="8">${normalizeText(item.birthDate)}</td>
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
            <td class="cell no-border" colspan="17"></td>
        </tr>
        <tr style="height: ${rowHeights[1]}px;">
            <td class="cell no-border" colspan="16"></td>
            <td class="cell no-border" colspan="17"></td>
        </tr>
        <tr style="height: ${rowHeights[2]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住所', 'ジュウショ')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(subject.address)}</td>
        </tr>
        <tr style="height: ${rowHeights[3]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('世帯主', 'セタイヌシ')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(subject.householder)}</td>
        </tr>
        <tr style="height: ${rowHeights[4]}px;">
            <td class="cell no-border" colspan="40"></td>
        </tr>
    `;

    const itemsHtml = fillItems.map((item, index) => renderPersonRows(item, index, 6 + index * 12)).join('');

    const mobileItemsHtml = data.items.map((item, index) => `
        <div class="mobile-person-card">
            <div class="person-header">
                <span class="person-number">${index + 1}</span>
                <span class="person-name">${normalizeText(item.name)}</span>
                <span class="person-kana">${normalizeText(item.kana)}</span>
            </div>
            <div class="person-grid">
                <div class="grid-item">
                    <div class="grid-label">生年月日</div>
                    <div class="grid-value">${normalizeText(item.dob)}</div>
                </div>
                <div class="grid-item">
                    <div class="grid-label">性別</div>
                    <div class="grid-value">${normalizeText(item.gender)}</div>
                </div>
                <div class="grid-item">
                    <div class="grid-label">続柄</div>
                    <div class="grid-value">${normalizeText(item.relationship)}</div>
                </div>
                <div class="grid-item">
                    <div class="grid-label">筆頭者</div>
                    <div class="grid-value">${normalizeDomicile(item.domiciles).hittosha}</div>
                </div>
                <div class="grid-item full">
                    <div class="grid-label">本籍</div>
                    <div class="grid-value">${normalizeDomicile(item.domiciles).honseki}</div>
                </div>
                <div class="grid-item full">
                    <div class="grid-label">転入前住所</div>
                    <div class="grid-value">${normalizeText(item.prevAddress)}</div>
                </div>
                ${item.myNumber ? `
                <div class="grid-item">
                    <div class="grid-label">個人番号</div>
                    <div class="grid-value">${normalizeText(item.myNumber)}</div>
                </div>
                ` : ''}
                ${item.residentCode ? `
                <div class="grid-item">
                    <div class="grid-label">住民票コード</div>
                    <div class="grid-value">${normalizeText(item.residentCode)}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    const fullContent = `
        <script type="application/ld+json">
            ${JSON.stringify(jsonLd)}
        </script>

        <div class="jumin-sheet" 
             data-vc-format="cbor/cose" 
             data-vc-bin="${binaryVc || ''}">
            ${data.watermark ? `<div class="watermark">${data.watermark}</div>` : ''}


            <div class="anti-copy-print-notice">
                【デジタル原本】この画面はデジタル署名された原本です。これを印刷したものは住民票の写しとして利用できません。<br>
                検証済みの電子的提示（Verifiable Presentation）のみが有効な証明書として機能します。
            </div>

            <div class="void-watermark-print-only">
                複写無効 / 印刷物効力なし<br>
                VOID / INVALID PRINT
            </div>

            <div class="pc-view-only">
                <table class="jumin-table">
                    <colgroup>
                        ${columnWidths.map(width => `<col style="width: ${width}px;">`).join('')}
                    </colgroup>
                    ${tableHeaderRows}
                    ${itemsHtml}
                </table>

                <div class="table-footer-meta">
                    2026. 1. 15 電子交付 https://cert.go.jp https://wallet.jp Google Pixel 10 Pro
                </div>
            </div>

            <div class="mobile-view-only">
                <div class="mobile-header">
                    <h1 class="mobile-title">${normalizeText(subject.name || data.certificateTitle)}の写し</h1>
                    <div class="household-summary">
                        <div class="summary-item">
                            <span class="summary-label">住所</span>
                            <span class="summary-value">${normalizeText(subject.address)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">世帯主</span>
                            <span class="summary-value">${normalizeText(subject.householder)}</span>
                        </div>
                    </div>
                </div>
                <div class="mobile-items">
                    ${subject.member.map((item: any, index: number) => `
                        <div class="mobile-person-card">
                            <div class="person-header">
                                <span class="person-number">${index + 1}</span>
                                <span class="person-name">${normalizeText(item.name)}${item.maidenName ? ` (${normalizeText(item.maidenName)})` : ''}</span>
                                <span class="person-kana">${normalizeText(item.kana)}${item.maidenKana ? ` (${normalizeText(item.maidenKana)})` : ''}</span>
                            </div>
                            <div class="person-grid">
                                <div class="grid-item">
                                    <div class="grid-label">生年月日</div>
                                    <div class="grid-value">${normalizeText(item.birthDate)}</div>
                                </div>
                                <div class="grid-item">
                                    <div class="grid-label">性別</div>
                                    <div class="grid-value">${normalizeText(item.gender)}</div>
                                </div>
                                <div class="grid-item">
                                    <div class="grid-label">続柄</div>
                                    <div class="grid-value">${normalizeText(item.relationship)}</div>
                                </div>
                                <div class="grid-item">
                                    <div class="grid-label">筆頭者</div>
                                    <div class="grid-value">${normalizeDomicile(item.domiciles).hittosha}</div>
                                </div>
                                <div class="grid-item full">
                                    <div class="grid-label">本籍</div>
                                    <div class="grid-value">${normalizeDomicile(item.domiciles).honseki}</div>
                                </div>
                                <div class="grid-item full">
                                    <div class="grid-label">転入前住所</div>
                                    <div class="grid-value">${normalizeText(item.prevAddress)}</div>
                                </div>
                                ${item.individualNumber ? `
                                <div class="grid-item">
                                    <div class="grid-label">個人番号</div>
                                    <div class="grid-value">${normalizeText(item.individualNumber)}</div>
                                </div>
                                ` : ''}
                                ${item.residentCode ? `
                                <div class="grid-item">
                                    <div class="grid-label">住民票コード</div>
                                    <div class="grid-value">${normalizeText(item.residentCode)}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="jumin-footer">
                <div class="cert-text">
                    この写しは、世帯全員の住民票の原本と相違ないことを証明する。
                    <div class="issue-date-line">${normalizeText(data.issueDate)}</div>
                </div>
                <div class="issuer-line">
                    <div class="issuer-name-block">
                        ${normalizeText(data.issuer.title)}（職務代理者）<br>
                        ${normalizeText(data.issuer.name)}
                    </div>
                    <div class="seal-container">
                        <div class="digital-badge">
                            <span class="badge-icon">✓</span> Verifiable Binary Signature (CBOR/COSE) Embedded
                        </div>
                        <span class="official-seal">
                            <span class="seal-text">${normalizeText(data.issuer.title)}<br>印</span>
                        </span>
                        <div class="seal-notice">この印は黒色です。</div>
                    </div>
                </div>
            </div>

            ${vc ? `
            <div class="vc-debug-area">
                <details>
                    <summary>デジタル原本データ構造 (VC/JSON-LD)</summary>
                    <pre class="vc-code">${JSON.stringify(vc, null, 2)}</pre>
                </details>
                ${sdDisclosures && sdDisclosures.length > 0 ? `
                <details>
                    <summary>選択的開示データ (SD-CWT Disclosures)</summary>
                    <div class="vc-code">
                        <p style="font-size: 8pt; color: #666; margin-bottom: 5px;">
                            ※以下の項目は原本ではハッシュ化されています。Wallet等は必要に応じてこれらを開示します。
                        </p>
                        <ul style="list-style: none; padding: 0;">
                            ${sdDisclosures.map(d => {
        try {
            const decoded = decode(Buffer.from(d, 'base64url'));
            return `<li style="margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 2px;">
                                        <code style="font-size: 7.5pt; color: #d73a49;">[SD]</code> 
                                        <span style="font-size: 8pt;">${JSON.stringify(decoded)}</span>
                                    </li>`;
        } catch (e) {
            return `<li>Invalid disclosure</li>`;
        }
    }).join('')}
                        </ul>
                    </div>
                </details>
                ` : ''}
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
            .digital-badge {
                position: absolute;
                top: -6mm;
                right: 0;
                white-space: nowrap;
                background: rgba(230, 255, 250, 0.6); /* Semi-transparent */
                backdrop-filter: blur(2px);
                color: #2c7a7b;
                border: 1px solid rgba(129, 230, 217, 0.5);
                padding: 1mm 2mm;
                font-size: 6.5pt;
                border-radius: 4px;
                font-family: sans-serif;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: opacity 0.2s;
                opacity: 0.7;
                z-index: 10;
            }
            .digital-badge:hover {
                opacity: 1;
                background: rgba(230, 255, 250, 0.9);
            }
            .anti-copy-print-notice {
                text-align: center;
                font-size: 8pt;
                color: #d73a49;
                background: #fff8f8;
                border: 1px solid #ffcccc;
                padding: 1.5mm;
                margin-bottom: 3mm;
                border-radius: 4px;
                line-height: 1.4;
            }
            .void-watermark-print-only {
                display: none;
            }
            .badge-icon {
                font-weight: bold;
            }
            .jumin-footer {
                width: 777px;
                margin: 4mm auto 0;
                font-size: 10.5pt;
                line-height: 1.6;
            }
            .cert-text {
                margin-bottom: 6mm;
            }
            .issue-date-line {
                text-align: center;
                margin-top: 1mm;
                font-size: 11pt;
            }
            .issuer-line {
                display: flex;
                justify-content: flex-end;
                align-items: flex-start;
                gap: 5mm;
                text-align: left;
            }
            .issuer-name-block {
                font-size: 13pt;
                line-height: 1.8;
                margin-top: 2mm;
            }
            .seal-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                position: relative; /* Anchor for digital-badge */
            }
            .official-seal {
                display: inline-flex;
                width: 18mm;
                height: 18mm;
                border: 2px solid #000;
                color: #000;
                align-items: center;
                justify-content: center;
                font-size: 12pt;
                font-weight: bold;
                line-height: 1.2;
                text-align: center;
            }
            .seal-notice {
                font-size: 7.5pt;
                color: #000;
            }
            .table-footer-meta {
                width: 777px;
                margin: 1mm auto;
                font-size: 8pt;
                text-align: right;
                font-family: monospace;
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
            @media screen and (max-width: 800px) {
                .jumin-sheet {
                    width: 100%;
                    max-width: 100%;
                    padding: 4mm;
                    border: none;
                    box-shadow: none;
                }
                .pc-view-only {
                    display: none;
                }
                .mobile-view-only {
                    display: block;
                }
                .jumin-footer {
                    width: 100%;
                    text-align: left;
                }
                .issuer-line {
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .table-footer-meta {
                    width: 100%;
                }
            }

            @media screen and (min-width: 801px) {
                .mobile-view-only {
                    display: none;
                }
            }

            /* Mobile card styles */
            .mobile-header {
                margin-bottom: 6mm;
                border-bottom: 2px solid #000;
                padding-bottom: 3mm;
            }
            .mobile-title {
                font-size: 1.5rem;
                margin: 0 0 4mm 0;
                text-align: center;
            }
            .household-summary {
                background: #f9f9f9;
                padding: 3mm;
                border-radius: 4px;
            }
            .summary-item {
                display: flex;
                margin-bottom: 2mm;
            }
            .summary-label {
                width: 60px;
                font-size: 0.8rem;
                font-weight: bold;
                color: #666;
            }
            .summary-value {
                flex: 1;
                font-size: 0.95rem;
            }
            .mobile-person-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 6mm;
                overflow: hidden;
            }
            .person-header {
                background: #f1f1f1;
                padding: 3mm;
                display: flex;
                align-items: baseline;
                gap: 3mm;
            }
            .person-number {
                font-weight: bold;
                background: #000;
                color: #fff;
                width: 24px;
                height: 24px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 0.8rem;
            }
            .person-name {
                font-size: 1.1rem;
                font-weight: bold;
            }
            .person-kana {
                font-size: 0.75rem;
                color: #666;
            }
            .person-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
                border-top: 1px solid #ddd;
            }
            .grid-item {
                padding: 3mm;
                border-bottom: 1px solid #eee;
                border-right: 1px solid #eee;
            }
            .grid-item:nth-child(even) {
                border-right: none;
            }
            .grid-item.full {
                grid-column: span 2;
                border-right: none;
            }
            .grid-label {
                font-size: 0.7rem;
                color: #888;
                margin-bottom: 1mm;
            }
            .grid-value {
                font-size: 0.9rem;
            }

            @media print {
                .pc-view-only {
                    display: block !important;
                }
                .mobile-view-only {
                    display: none !important;
                }
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
                .anti-copy-print-notice {
                    border-color: #000;
                    color: #000;
                    font-weight: bold;
                }
                .void-watermark-print-only {
                    display: block !important;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 60pt;
                    color: rgba(0, 0, 0, 0.1) !important;
                    border: 10px solid rgba(0, 0, 0, 0.1);
                    padding: 20px 40px;
                    white-space: nowrap;
                    z-index: 9999;
                    pointer-events: none;
                    text-align: center;
                    line-height: 1.2;
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
