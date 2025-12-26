
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
        19, 19, 19, 19, 19, 29,
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

            <div class="cert-viewer-header">
                <div class="anti-copy-print-notice">
                    これは電子交付された住民票の写しの内容確認画面です。検証済みの電子的提示（VP）のみが有効な証明書として機能します。
                </div>
            </div>

            <div class="void-watermark-print-only">
                複写無効 / 印刷物効力なし<br>
                VOID / INVALID PRINT
            </div>

            <div class="pc-view-only">
                <div class="table-container">
                    <table class="jumin-table">
                        <colgroup>
                            ${columnWidths.map(width => `<col style="width: ${width}px;">`).join('')}
                        </colgroup>
                        ${tableHeaderRows}
                        ${itemsHtml}
                    </table>
                </div>

                <div class="table-footer-meta">
                    2026.1.15 電子交付 発行: https://cert.go.jp 登録先: https://wallet.jp バインド先: MacBook Pro (M3 Chip / Secure Enclave ID: 8A2F...)
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
                        <div class="seal-selection pc-view-only">
                            <button class="mock-verify-btn" onclick="simulateVerification()">
                                <span class="btn-icon">🛡️</span> この文書を提示・検証
                            </button>
                        </div>
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

            <div id="verifier-overlay" class="verifier-overlay" style="display: none;">
                <div class="verifier-modal">
                    <div class="modal-header">
                        <span class="modal-icon">🔍</span>
                        <h3>窓口検証システム (Verifier Result)</h3>
                        <button class="close-modal" onclick="closeVerifier()">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="verification-status" class="status-pending">
                            <div class="spinner"></div>
                            <p>Passkey による署名生成と原本検証中...</p>
                        </div>
                        <div id="verification-result" style="display: none;">
                            <div class="result-header">
                                <span class="result-icon">✅</span>
                                <div class="result-title">
                                    <h4>真正性確認 成功</h4>
                                    <p>Authenticity Confirmed</p>
                                </div>
                            </div>
                            <div class="result-details">
                                <div class="detail-row">
                                    <span class="detail-label">発行自治体</span>
                                    <span class="detail-value">東京都港区 (LGPKI 署名検証済)</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">提示者本人確認</span>
                                    <span class="detail-value">成功 (Passkey / Secure Enclave)</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">結合デバイス</span>
                                    <span class="detail-value">MacBook Pro (M3) - ID: 8A2F...</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">改ざん検知</span>
                                    <span class="detail-value">なし (マニフェスト整合性確認)</span>
                                </div>
                            </div>
                            <div class="ai-agent-summary">
                                <strong>AI Agent 処理用データ:</strong>
                                <code>Status: VALID, Holder: "サイトウ タロウ", DOB: "1989-01-01"</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mobile-verify-bar mobile-view-only">
                <button class="mobile-verify-btn" onclick="simulateVerification()">
                    🛡️ この文書を窓口で提示 (Passkey)
                </button>
            </div>

            ${vc ? `
            <div class="vc-debug-area">
                <details>
                    <summary>機械可読データ構造 (VC/JSON-LD)</summary>
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
                position: relative;
                box-sizing: border-box;
                overflow: visible;
                background-color: #fff !important;
                color: #000 !important;
                color-scheme: light !important;
                margin: 0;
                padding: 10mm;
                min-height: 297mm;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 100px;
                color: rgba(0, 0, 0, 0.03);
                z-index: 0;
                pointer-events: none;
                font-weight: bold;
                border: 10px solid rgba(0, 0, 0, 0.03);
                padding: 20px 80px;
                white-space: nowrap;
            }
            .table-container {
                overflow-x: auto; 
                margin: 2rem 0;
                padding: 10px; /* Buffer space for borders and shadows */
                overflow: visible !important; /* Ensure no clipping by container */
            }
            .jumin-table {
                width: 732px;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                margin: 0 auto !important;
                font-size: 9pt;
                background-color: #fff;
                border: 1px solid #000 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                overflow: visible !important; /* Override global style.css overflow: hidden */
            }
            .jumin-table tr {
                border: none !important; /* Prevent row-level borders from interfering */
            }
            .jumin-table .cell {
                border: 1px solid #000 !important;
                padding: 1px 2px;
                vertical-align: middle;
                word-break: break-word;
                box-sizing: border-box;
                background-clip: padding-box;
            }
            .jumin-table .no-border {
                border: none !important;
                background-color: transparent !important;
            }
            .title-cell {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                letter-spacing: 0.4em;
                background-color: transparent !important;
                border: none !important;
            }
            .digital-badge {
                position: absolute;
                top: -8mm;
                right: 0;
                white-space: nowrap;
                background: rgba(230, 255, 250, 0.9);
                backdrop-filter: blur(2px);
                color: #2c7a7b;
                border: 1px solid #81e6d9;
                padding: 1mm 2mm;
                font-size: 6.5pt;
                border-radius: 4px;
                font-family: sans-serif;
                display: flex;
                align-items: center;
                gap: 5px;
                z-index: 10;
            }
            .anti-copy-print-notice {
                text-align: center;
                font-size: 8.5pt;
                color: #d73a49;
                background: #fff8f8;
                border: 1px solid #ffcccc;
                padding: 1rem;
                border-radius: 8px;
                line-height: 1.4;
            }
            .void-watermark-print-only {
                display: none;
            }
            .jumin-footer {
                width: 732px;
                margin: 2rem auto 0;
                font-size: 10.5pt;
                line-height: 1.6;
            }
            .issue-date-line {
                text-align: center;
                margin-top: 1rem;
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
                position: relative;
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
                background: #fff;
            }
            .seal-notice {
                font-size: 7.5pt;
                color: #000;
            }
            .table-footer-meta {
                width: 732px;
                margin: 0.5rem auto;
                font-size: 8pt;
                text-align: right;
                font-family: monospace;
                color: var(--text-muted);
            }
            .vc-debug-area {
                margin-top: 3rem;
                border-top: 1px dashed var(--border-color);
                padding-top: 1.5rem;
                text-align: left;
            }
            .vc-debug-area summary {
                cursor: pointer;
                color: var(--primary-color);
                font-weight: bold;
                padding: 5px;
            }
            .vc-code {
                background: #0f172a;
                color: #e2e8f0;
                padding: 1.25rem;
                border-radius: 0.75rem;
                max-height: 400px;
                overflow-y: auto;
                margin-top: 0.5rem;
                border: 1px solid #1e293b;
                font-size: 0.85rem;
            }
            .name-cell, .person-name {
                font-size: 18pt !important;
                font-weight: bold;
                letter-spacing: 0.1em;
            }

            @media screen and (max-width: 800px) {
                .pc-view-only {
                    display: none;
                }
                .mobile-view-only {
                    display: block;
                }
                .jumin-footer {
                    width: 100%;
                }
                .issuer-line {
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
            }

            @media screen and (min-width: 801px) {
                .mobile-view-only {
                    display: none;
                }
            }

            @media print {
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    background: white !important;
                    padding: 0 !important;
                }
                main {
                    padding: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .anti-copy-print-notice {
                    border: 1px solid #000 !important;
                    color: #000 !important;
                    background: none !important;
                }
                .jumin-table {
                    box-shadow: none !important;
                }
                .jumin-table .no-border, .title-cell {
                    background-color: white !important;
                }
                .vc-debug-area {
                    display: none !important;
                }
                .void-watermark-print-only {
                    display: block !important;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 60pt;
                    color: rgba(0, 0, 0, 0.05) !important;
                    border: 10px solid rgba(0, 0, 0, 0.05);
                    padding: 20px 40px;
                    white-space: nowrap;
                    z-index: 9999;
                    pointer-events: none;
                    text-align: center;
                }
            }

            /* Verifier Mock Styles */
            .mock-verify-btn {
                background: #2563eb;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 0.5rem;
                box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                transition: background 0.2s;
            }
            .mock-verify-btn:hover { background: #1d4ed8; }
            
            .verifier-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            .verifier-modal {
                background: white;
                width: 90%;
                max-width: 500px;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .modal-header {
                padding: 1rem;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-header h3 { margin: 0; font-size: 1rem; }
            .modal-body { padding: 1.5rem; }
            
            .status-pending { text-align: center; padding: 2rem 0; }
            .spinner {
                width: 40px; height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #2563eb;
                border-radius: 50%;
                margin: 0 auto 1rem;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            .result-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
            .result-icon { font-size: 2.5rem; }
            .result-title h4 { margin: 0; color: #059669; }
            .result-title p { margin: 0; font-size: 0.8rem; color: #6b7280; }
            
            .detail-row {
                display: flex; gap: 1rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid #f1f5f9;
                font-size: 0.9rem;
            }
            .detail-label { color: #64748b; width: 120px; }
            .detail-value { color: #1e293b; font-weight: 500; }
            
            .ai-agent-summary {
                margin-top: 1.5rem;
                padding: 0.75rem;
                background: #f1f5f9;
                border-radius: 6px;
                font-size: 0.8rem;
            }
            .ai-agent-summary code { display: block; margin-top: 0.5rem; font-family: monospace; }
            
            .mobile-verify-bar {
                position: fixed;
                bottom: 0; left: 0; right: 0;
                padding: 1rem;
                background: rgba(255,255,255,0.9);
                backdrop-filter: blur(10px);
                border-top: 1px solid #e2e8f0;
                z-index: 1000;
            }
            .mobile-verify-btn {
                width: 100%;
                background: #2563eb;
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 8px;
                font-weight: bold;
                font-size: 1rem;
            }
            .close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
        </style>

        <script>
            function simulateVerification() {
                const overlay = document.getElementById('verifier-overlay');
                overlay.style.display = 'flex';
                
                // Reset states
                document.getElementById('verification-status').style.display = 'block';
                document.getElementById('verification-result').style.display = 'none';
                
                // 1. Simulate Passkey request (Resident side)
                setTimeout(() => {
                    // 2. Simulate Success
                    document.getElementById('verification-status').style.display = 'none';
                    document.getElementById('verification-result').style.display = 'block';
                }, 1500);
            }
            
            function closeVerifier() {
                document.getElementById('verifier-overlay').style.display = 'none';
            }
        </script>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies
    });
}
