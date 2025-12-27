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

export function juminhyoLayout(data: JuminhyoData, _bodyContent: string, fontCss: string, fontFamilies: string[], vc?: any, binaryVc?: string, sdDisclosures?: string[]) {
    const subject = prepareSubject(data, vc);
    
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

    const fillItems = Array.from({ length: 4 }, (_, idx) => subject.member[idx] || {});
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

    const fullContent = `
        <div class="juminhyo-container">
            <div class="jumin-sheet">
                <table class="jumin-table">
                    <tbody>
                        ${tableHeaderRows(data.certificateTitle, subject.address, subject.householder)}
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="footer-section">
                    <div class="cert-text">
                        この写しは、世帯全員の住民票の原本と相違ない ことを証明する。
                        <div class="issue-date-line">${normalizeText(data.issueDate)}</div>
                    </div>
                    <div class="issuer-line">
                        <div class="issuer-name-block">
                            ${normalizeText(data.issuer?.title)}（職務代理者）<br>
                            ${normalizeText(data.issuer?.name)}
                        </div>
                        <div class="seal-area">
                            <span class="official-seal">住民票<br>認証印</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="jumin-mobile-view">${mobileItemsHtml}</div>
        </div>
        <style>
            /* Juminhyo Specific Styles (Kept inline for simplicity in this technote) */
            .juminhyo-container { max-width: 1000px; margin: 0 auto; padding: 20px; background: #f0f0f0; }
            .jumin-sheet { background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: serif; }
            .jumin-table { width: 100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed; }
            .cell { border: 1px solid black; padding: 2px; font-size: 12px; overflow: hidden; }
            .no-border { border: none; }
            .label-cell { background: #f9f9f9; text-align: center; }
            .value-cell { padding-left: 5px; }
            .title-cell { font-size: 24px; font-weight: bold; text-align: center; text-decoration: underline; }
            .seal-area { width: 80px; height: 80px; border: 2px solid red; color: red; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 50%; font-weight: bold; }
            @media (max-width: 800px) { .jumin-sheet { display: none; } .jumin-mobile-view { display: block; } }
            @media (min-width: 801px) { .jumin-mobile-view { display: none; } }
        </style>
    `;

    return baseLayout({ title: data.title, content: fullContent, fontCss, fontFamilies });
}