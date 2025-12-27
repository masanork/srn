import { baseLayout } from './base.js';
import { decode } from 'cbor-x';
import { prepareSubject, normalizeText, normalizeDomicile, getRowHeights } from './juminhyo/Logic.ts';
import { tableHeaderRows, renderPersonRows } from './juminhyo/Template.ts';

export interface JuminhyoItem {
    name: string;
    kana?: string;
    dob: string;
    gender: string;
    relationship: string;
    maidenName?: string;
    maidenKana?: string;
    becameResident: string;
    becameResidentReason?: string;
    addressDate?: string;
    notificationDate?: string;
    prevAddress?: string;
    domiciles?: string[];
    myNumber?: string;
    residentCode?: string;
    remarks?: string[];
}

export interface JuminhyoData {
    layout: 'juminhyo';
    title: string;
    certificateTitle: string;
    issueDate: string;
    address: string;
    householder: string;
    items: JuminhyoItem[];
    issuer: { title: string; name: string; };
    [key: string]: any;
}

export function buildJuminhyoJsonLd(data: any) {
    const subject = prepareSubject(data);
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://masanork.github.io/srn/schemas/juminhyo-v1.schema.json"
        ],
        type: ["VerifiableCredential", "JuminhyoCredential"],
        credentialSubject: {
            name: subject.name,
            householder: subject.householder,
            address: subject.address,
            member: (subject.member || []).map((m: any) => ({
                name: m.name,
                kana: m.kana,
                maidenName: m.maidenName,
                maidenKana: m.maidenKana,
                birthDate: m.birthDate,
                gender: m.gender,
                relationship: m.relationship,
                becameResidentDate: m.becameResidentDate,
                becameResidentReason: m.becameResidentReason,
                addressSetDate: m.addressSetDate,
                notificationDate: m.notificationDate,
                residentCode: m.residentCode,
                individualNumber: m.individualNumber,
                prevAddress: m.prevAddress,
                domiciles: m.domiciles,
                remarks: m.remarks
            }))
        }
    };
}

export function juminhyoLayout(
    data: JuminhyoData,
    _bodyContent: string,
    fontCss: string,
    fontFamilies: string[],
    jsonLd?: any,
    templateVc?: any,
    instanceVc?: any,
    binaryVc?: string,
    sdDisclosures?: string[]
) {
    const subject = prepareSubject(data);
    
    // --- SD-CWT Disclosure Logic (Simplified for refactoring) ---
    let disclosures: any = null;
    if (binaryVc && sdDisclosures) {
        try {
            disclosures = {};
            sdDisclosures.forEach(d => {
                const decoded = decode(Buffer.from(d, 'base64'));
                if (Array.isArray(decoded) && decoded.length >= 3) {
                    disclosures[decoded[1]] = decoded[2];
                }
            });
        } catch (e) { console.error("SD Decode failed", e); }
    }

    const fillItems = Array.from({ length: 4 }, (_, idx) => subject.member?.[idx] || {});
    const itemsHtml = fillItems.map((item, index) => renderPersonRows(item, index, 6 + index * 12)).join('');

    const mobileItemsHtml = (subject.member || []).map((item: any, index: number) => `
        <div class="mobile-person-card">
            <div class="person-header">
                <span class="person-number">${index + 1}</span>
                <span class="person-name">${normalizeText(item.name)}</span>
            </div>
            <div class="person-grid">
                <div class="grid-item"><div class="grid-label">生年月日</div><div class="grid-value">${normalizeText(item.birthDate)}</div></div>
                <div class="grid-item"><div class="grid-label">性別</div><div class="grid-value">${normalizeText(item.gender)}</div></div>
                <div class="grid-item"><div class="grid-label">続柄</div><div class="grid-value">${normalizeText(item.relationship)}</div></div>
                <div class="grid-item"><div class="grid-label">筆頭者</div><div class="grid-value">${normalizeDomicile(item.domiciles).hittosha}</div></div>
            </div>
        </div>
    `).join('');

    const instanceVerificationDetails = instanceVc ? `
        <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                <span>✓</span> 発行元による真正性の証明
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: normal;">Document Signed</span>
            </summary>
            <div style="padding: 1rem 0;">
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(instanceVc, null, 2)}</pre>
            </div>
        </details>
    ` : '';

    const templateVerificationDetails = templateVc ? `
        <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                <span>✓</span> テンプレートの真正性の証明
                <span style="font-size: 0.7rem; background: #e6f7e6; color: #2e7d32; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: normal;">Template Signed</span>
            </summary>
            <div style="padding: 1rem 0;">
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(templateVc, null, 2)}</pre>
            </div>
        </details>
    ` : '';

    const jsonLdPayload = jsonLd ?? buildJuminhyoJsonLd(data);

    const fullContent = `
        <div class="juminhyo-container">
            <div class="jumin-sheet">
                ${data.watermark ? `<div class="watermark">${normalizeText(data.watermark)}</div>` : ''}
                <div class="jumin-header-note">
                    これは電子交付された住民票の写しの内容確認画面です。検証済みの電子的提示（VP）のみが有効な証明書として機能します。
                </div>
                <table class="jumin-table">
                    <tbody>
                        ${tableHeaderRows(subject.name, subject.address, subject.householder)}
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="footer-section">
                    <div class="cert-text">
                        この写しは、世帯全員の住民票の原本と相違ないことを証明する。
                        <div class="issue-date-line" style="margin-top: 1rem;">${normalizeText(subject.issueDate)}</div>
                    </div>
                    <div class="issuer-line">
                        <div class="issuer-name-block" style="text-align: right; font-size: 1rem; font-weight: bold;">
                            <span class="issuer-title">${normalizeText(subject.issuer?.title)}（職務代理者）</span><br>
                            ${normalizeText(subject.issuer?.name)}
                        </div>
                        <div class="seal-block">
                            <div class="seal-area">
                                <span class="official-seal">印</span>
                            </div>
                            <div class="seal-note">この印は黒色です</div>
                        </div>
                    </div>
                </div>
            </div>
            <footer class="no-print" style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <details>
                        <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #666; font-weight: 600;">
                            <span style="color: #3b82f6;">ℹ️</span> 記載内容（データ）の確認
                        </summary>
                        <div style="padding: 1rem 0;">
                            <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(subject, null, 2)}</pre>
                        </div>
                    </details>
                    ${instanceVerificationDetails}
                    ${templateVerificationDetails}
                </div>
            </footer>
            <div class="jumin-mobile-view" style="margin-top: 2rem;">
                ${mobileItemsHtml}
            </div>
        </div>
        <style>
            /* Juminhyo Specific Styles (Kept inline for simplicity in this technote) */
            .juminhyo-container { max-width: 1200px; margin: 0 auto; padding: 20px; background: #f0f0f0; }
            .jumin-sheet { background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: inherit; position: relative; overflow: hidden; }
            .jumin-table { width: 100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed; }
            .cell { border: 1px solid black; padding: 2px; font-size: 12px; overflow: hidden; }
            .name-cell { font-size: 36px; }
            .no-border { border: none; }
            .label-cell { background: #f9f9f9; text-align: center; }
            .label-text { display: flex; align-items: center; justify-content: center; height: 100%; }
            .label-main { font-size: 10px; line-height: 1.2; word-break: keep-all; line-break: strict; }
            .value-cell { padding-left: 5px; }
            .title-cell { font-size: 24px; font-weight: bold; text-align: center; text-decoration: underline; }
            .issuer-title { white-space: nowrap; font-size: 0.9rem; }
            .seal-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
            .footer-section { margin-top: 2rem; display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
            .cert-text { font-size: 0.9rem; line-height: 1.6; white-space: nowrap; align-self: flex-start; }
            .issuer-line { display: flex; align-items: center; gap: 2rem; }
            .seal-area { width: 60px; height: 60px; border: 2px solid #000; color: #000; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; }
            .official-seal { font-size: 18px; line-height: 1; }
            .seal-note { font-size: 8px; font-weight: normal; }
            .jumin-header-note { color: #c40000; font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.75rem; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-24deg); font-size: 6rem; font-weight: bold; color: rgba(0,0,0,0.07); letter-spacing: 0.4rem; white-space: nowrap; pointer-events: none; }
            @media (max-width: 800px) { .jumin-sheet { display: none; } .jumin-mobile-view { display: block; } }
            @media (min-width: 801px) { .jumin-mobile-view { display: none; } }
        </style>
    `;

    return baseLayout({ title: data.title, content: fullContent, fontCss, fontFamilies, jsonLd: jsonLdPayload });
}
