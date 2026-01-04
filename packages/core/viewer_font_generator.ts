
import {
    createMDoc,
    p256GenerateKeyPair,
    p256Sign,
    bytesToHex,
    initWasm,
    encodeDidKey,
    bytesToBase64Url,
    sha256Hash
} from './src/index';
import { subsetFont, bufferToDataUrl } from './src/font';
import { decode, addExtension, Tag } from 'cbor-x'; // Import Tag for inspection
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';

// Setup CBOR inspection
addExtension({
    Class: Tag,
    tag: 24,
    decode: (value: Uint8Array) => {
        // Automatically decode nested CBOR in Tag 24 for inspection
        try {
            return decode(value);
        } catch (e) {
            return value; // Keep as bytes if decode fails
        }
    },
    encode: (value: any) => value // Not used here
});

const juminhyoMdPath = path.resolve('sites/srn/content/juminhyo.md');
const fontPath = path.resolve('shared/fonts/ipamjm.ttf');

// --- Helper Functions ---

function mapToCredentialSubject(data: any): any {
    const items = (data.世帯員 || data.items || []).map((p: any) => ({
        name: p.氏名 || p.name,
        kana: p.フリガナ || p.kana,
        birthDate: p.生年月日 || p.dob || p.birthDate,
        gender: p.性別 || p.gender,
        relationship: p.続柄 || p.relationship,
        becameResidentDate: p.住民となった日 || p.becameResident,
        becameResidentReason: p.住民となった事由 || p.becameResidentReason,
        addressSetDate: p.住所を定めた日 || p.addressDate || p.addressSetDate,
        notificationDate: p.届出日 || p.notificationDate,
        residentCode: p.住民票コード || p.residentCode,
        individualNumber: p.個人番号 || p.myNumber || p.individualNumber,
        prevAddress: p.前住所 || p.prevAddress,
        domiciles: p.本籍 || p.domiciles,
        remarks: p.備考 || p.remarks,
        maidenName: p.旧氏 || p.maidenName,
        maidenKana: p.旧氏カナ || p.maidenKana
    }));

    return {
        name: data.証明書名称 || data.certificateTitle || data.title,
        householder: data.世帯主氏名 || data.householder,
        address: data.世帯住所 || data.address,
        issueDate: data.交付年月日 || data.issueDate || data.date,
        issuer: {
            title: data.発行者役職 || data.issuer?.title,
            name: data.発行者氏名 || data.issuer?.name
        },
        member: items,
        watermark: data.watermark
    };
}

// Inspect mDoc Structure
function inspectMDocStructure(b64url: string): any {
    const bytes = base64UrlToBytes(b64url);
    const root = decode(bytes);

    // root might be { version, documents: [...] } or just the Document object itself
    // Current createMDoc returns the Document object directly.
    let doc = root;
    if (root.documents && Array.isArray(root.documents)) {
        doc = root.documents[0];
    }

    // We want to extract the structure of issuerSigned items to show granularity
    try {
        const nameSpaces = doc.issuerSigned.nameSpaces;
        const inspectedNS: Record<string, any[]> = {};

        for (const [ns, items] of Object.entries(nameSpaces)) {
            // items is Array of Tag(24, bytes) -> decoded to IssuerSignedItem
            // IssuerSignedItem = { digestID, random, elementIdentifier, elementValue }

            // Note: Our registered extension decodes Tag 24 automatically
            inspectedNS[ns] = (items as any[]).map((item: any) => {
                // item might be raw bytes (bstr) if not wrapped in Tag 24, or if auto-decode didn't trigger.
                // Explicitly decode if it looks like bytes.
                let decodedItem = item;
                if (item instanceof Uint8Array || (item && typeof item.readUInt8 === 'function') || (item && item.type === 'Buffer')) {
                    try {
                        decodedItem = decode(item);
                    } catch (e) { console.warn("Failed to decode info item", e); }
                }

                return {
                    id: decodedItem.elementIdentifier,
                    value: decodedItem.elementValue,
                    digestID: decodedItem.digestID,
                    random: typeof decodedItem.random === 'object' ? `(bytes ${decodedItem.random.length})` : decodedItem.random
                };
            });
        }

        return {
            docType: doc.docType,
            issuerSigned: inspectedNS,
            // MSO is also critical but let's focus on data items
            mso: doc.issuerSigned.issuerAuth
        };
    } catch (e) {
        return { error: "Failed to inspect mDoc structure", details: String(e) };
    }
}

// Generate SD-JWT
async function createSdJwt(payload: Record<string, any>, issuerKeyPair: { privateKey: Uint8Array, publicKey: Uint8Array }) {
    const disclosures: string[] = [];
    const sdDigests: string[] = [];
    const debugDisclosures: any[] = [];

    for (const [key, value] of Object.entries(payload)) {
        const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
        const disclosureArray = [salt, key, value];
        const disclosureString = JSON.stringify(disclosureArray);
        const disclosureB64 = bytesToBase64Url(new TextEncoder().encode(disclosureString));

        disclosures.push(disclosureB64);
        debugDisclosures.push(disclosureArray);

        const hash = sha256Hash(new TextEncoder().encode(disclosureB64));
        sdDigests.push(bytesToBase64Url(hash));
    }

    const jwtHeader = { alg: 'ES256', typ: 'vc+sd-jwt' };
    const jwtPayload = {
        _sd: sdDigests,
        iss: 'https://example.com/issuer',
        iat: Math.floor(Date.now() / 1000),
        vct: "io.github.masanork.srn.credential.juminhyo"
    };

    const headerB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(jwtHeader)));
    const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(jwtPayload)));
    const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = p256Sign(issuerKeyPair.privateKey, signingInput);
    const sigB64 = bytesToBase64Url(signature);
    const jwt = `${headerB64}.${payloadB64}.${sigB64}`;

    const sdJwt = `${jwt}~${disclosures.join('~')}~`;

    return {
        sdJwt,
        debug: {
            header: jwtHeader,
            payload: jwtPayload,
            disclosures: debugDisclosures
        }
    };
}

function base64UrlToBytes(value: string): Uint8Array {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(Buffer.from(base64, 'base64'));
}

// --- Renderer Logic ---
const rendererLogic = `
<script>
    function normalizeText(value) { return value ?? ''; }
    function formatDateWareki(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; 
        const y = date.getFullYear(); const m = date.getMonth() + 1; const d = date.getDate();
        const format = (era, year) => { const yStr = year === 1 ? '元' : year.toString(); return \`\${era}\${yStr}年\${m}月\${d}日\`; };
        if (y > 2019 || (y === 2019 && m >= 5)) return format('令和', y - 2018);
        if (y > 1989 || (y === 1989 && m >= 1 && d >= 8)) return format('平成', y - 1988);
        if (y > 1926 || (y === 1926 && m >= 12 && d >= 25)) return format('昭和', y - 1925);
        if (y > 1912 || (y === 1912 && m >= 7 && d >= 30)) return format('大正', y - 1911);
        if (y >= 1868) return format('明治', y - 1867);
        return \`\${y}年\${m}月\${d}日\`;
    }
    function normalizeDomicile(domiciles) {
        if (!domiciles || domiciles.length === 0) return { honseki: '', hittosha: '' };
        const honseki = domiciles[0] ?? '';
        const hittosha = domiciles[1] ? domiciles[1].replace(/^筆頭者：?/, '') : '';
        return { honseki, hittosha };
    }
    function normalizeRemarks(remarks) { return Array.from({ length: 4 }, (_, idx) => remarks?.[idx] ?? ''); }
    function getRowHeights() { return Array.from({ length: 53 }, (_, idx) => (idx === 5 ? 17 : 18)); }
    
    const rowHeights = getRowHeights();
    const rowHeight = (rowNumber) => rowHeights[rowNumber - 1] ?? 18;
    const labelHtml = (main) => \`<div class="label-text"><span class="label-main">\${main}</span></div>\`;
    const fieldAttr = (path) => \` data-weba-field="\${path}"\`;

    function renderPersonRows(item, index, startRow) {
        const { honseki, hittosha } = normalizeDomicile(item.domiciles);
        const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);
        return \`
            <tr style="height: \${rowHeight(startRow)}px;">
                <td class="cell number-cell" rowspan="12">\${index + 1}</td>
                <td class="cell label-cell" colspan="5">\${labelHtml('氏名の振り仮名')}</td>
                <td class="cell value-cell" colspan="18"\${fieldAttr(\`credentialSubject.member[\${index}].kana\`)}>\${normalizeText(item.kana)}</td>
                <td class="cell label-cell" colspan="6">\${labelHtml('個人番号')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].individualNumber\`)}>\${normalizeText(item.individualNumber)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 1)}px;">
                <td class="cell label-cell" colspan="5" rowspan="2">\${labelHtml('氏名')}</td>
                <td class="cell value-cell name-cell" colspan="18" rowspan="2"\${fieldAttr(\`credentialSubject.member[\${index}].name\`)}>\${normalizeText(item.name)}</td>
                <td class="cell label-cell" colspan="6">\${labelHtml('住民票コード')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].residentCode\`)}>\${normalizeText(item.residentCode)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 2)}px;">
                <td class="cell label-cell" colspan="6">\${labelHtml('住民となった年月日')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].becameResidentDate\`)}>\${formatDateWareki(item.becameResidentDate)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 3)}px;">
                <td class="cell label-cell" colspan="5">\${labelHtml('旧氏の振り仮名')}</td>
                <td class="cell value-cell" colspan="18"\${fieldAttr(\`credentialSubject.member[\${index}].maidenKana\`)}>\${normalizeText(item.maidenKana)}</td>
                <td class="cell label-cell" colspan="6">\${labelHtml('住所を定めた年月日')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].addressSetDate\`)}>\${formatDateWareki(item.addressSetDate)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 4)}px;">
                <td class="cell label-cell" colspan="5">\${labelHtml('旧氏')}</td>
                <td class="cell value-cell" colspan="18"\${fieldAttr(\`credentialSubject.member[\${index}].maidenName\`)}>\${normalizeText(item.maidenName)}</td>
                <td class="cell label-cell" colspan="6">\${labelHtml('届出日')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].notificationDate\`)}>\${formatDateWareki(item.notificationDate)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 5)}px;">
                <td class="cell label-cell" colspan="5">\${labelHtml('生年月日')}</td>
                <td class="cell value-cell" colspan="8"\${fieldAttr(\`credentialSubject.member[\${index}].birthDate\`)}>\${formatDateWareki(item.birthDate)}</td>
                <td class="cell label-cell" colspan="2">\${labelHtml('性別')}</td>
                <td class="cell value-cell" colspan="2"\${fieldAttr(\`credentialSubject.member[\${index}].gender\`)}>\${normalizeText(item.gender)}</td>
                <td class="cell label-cell" colspan="2">\${labelHtml('続柄')}</td>
                <td class="cell value-cell" colspan="4"\${fieldAttr(\`credentialSubject.member[\${index}].relationship\`)}>\${normalizeText(item.relationship)}</td>
                <td class="cell label-cell" colspan="6">\${labelHtml('筆頭者')}</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].domiciles[1]\`)}>\${normalizeText(hittosha)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 6)}px;">
                <td class="cell label-cell" colspan="5">\${labelHtml('本籍')}</td>
                <td class="cell value-cell" colspan="34"\${fieldAttr(\`credentialSubject.member[\${index}].domiciles[0]\`)}>\${normalizeText(honseki)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 7)}px;">
                <td class="cell label-cell" colspan="5">\${labelHtml('転入前住所')}</td>
                <td class="cell value-cell" colspan="34"\${fieldAttr(\`credentialSubject.member[\${index}].prevAddress\`)}>\${normalizeText(item.prevAddress)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 8)}px;">
                <td class="cell label-cell" colspan="5">＊＊＊</td>
                <td class="cell value-cell" colspan="18"\${fieldAttr(\`credentialSubject.member[\${index}].remarks[0]\`)}>\${normalizeText(remark1)}</td>
                <td class="cell label-cell" colspan="6">＊＊＊</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].remarks[1]\`)}>\${normalizeText(remark2)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 9)}px;">
                <td class="cell label-cell" colspan="5">＊＊＊</td>
                <td class="cell value-cell" colspan="18"\${fieldAttr(\`credentialSubject.member[\${index}].remarks[2]\`)}>\${normalizeText(remark3)}</td>
                <td class="cell label-cell" colspan="6">＊＊＊</td>
                <td class="cell value-cell" colspan="10"\${fieldAttr(\`credentialSubject.member[\${index}].remarks[3]\`)}>\${normalizeText(remark4)}</td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 10)}px;">
                <td class="cell value-cell" colspan="39"></td>
            </tr>
            <tr style="height: \${rowHeight(startRow + 11)}px;">
                <td class="cell value-cell" colspan="39"></td>
            </tr>
        \`;
    }

    function tableHeaderRows(certificateTitle, address, householder) {
        return \`
            <tr style="height: \${rowHeights[0]}px;">
                <td class="cell no-border" colspan="14"></td>
                <td class="cell title-cell no-border" colspan="12" rowspan="2"\${fieldAttr('credentialSubject.name')}>\${normalizeText(certificateTitle)}</td>
                <td class="cell no-border" colspan="14"></td>
            </tr>
            <tr style="height: \${rowHeights[1]}px;">
                <td class="cell no-border" colspan="14"></td>
                <td class="cell no-border" colspan="14"></td>
            </tr>
            <tr style="height: \${rowHeights[2]}px;">
                <td class="cell label-cell" colspan="6">\${labelHtml('住所')}</td>
                <td class="cell value-cell" colspan="34"\${fieldAttr('credentialSubject.address')}>\${normalizeText(address)}</td>
            </tr>
            <tr style="height: \${rowHeights[3]}px;">
                <td class="cell label-cell" colspan="6">\${labelHtml('世帯主')}</td>
                <td class="cell value-cell" colspan="34"\${fieldAttr('credentialSubject.householder')}>\${normalizeText(householder)}</td>
            </tr>
            <tr style="height: \${rowHeights[4]}px;">
                <td class="cell no-border" colspan="40"></td>
            </tr>
        \`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const rawData = window.__CREDENTIAL_DATA__;
        if (!rawData) return;
        
        const items = (rawData['世帯員'] || []).map(p => ({
            name: p['氏名'], kana: p['フリガナ'], birthDate: p['生年月日'], gender: p['性別'], relationship: p['続柄'],
            becameResidentDate: p['住民となった日'], becameResidentReason: p['住民となった事由'], addressSetDate: p['住所を定めた日'],
            notificationDate: p['届出日'], residentCode: p['住民票コード'], individualNumber: p['個人番号'], prevAddress: p['前住所'],
            domiciles: p['本籍'], remarks: p['備考'], maidenName: p['旧氏'], maidenKana: p['旧氏カナ']
        }));
        
        const subject = {
            name: rawData['証明書名称'], householder: rawData['世帯主氏名'], address: rawData['世帯住所'],
            issueDate: rawData['交付年月日'],
            issuer: { title: rawData['発行者役職'], name: rawData['発行者氏名'] },
            member: items
        };
        const watermark = rawData['watermark'];

        const fillItems = Array.from({ length: 4 }, (_, idx) => subject.member?.[idx] || {});
        let itemsHtml = '';
        fillItems.forEach((item, index) => { itemsHtml += renderPersonRows(item, index, 6 + index * 12); });
        
        const headerHtml = tableHeaderRows(subject.name, subject.address, subject.householder);
        const container = document.getElementById('render-target');
        container.innerHTML = \`
            <div class="jumin-sheet">
                \${watermark ? \`<div class="watermark">\${normalizeText(watermark)}</div>\` : ''}
                <div class="jumin-header-note">
                     Universal Credential Viewer (mDoc + SD-JWT)
                </div>
                <table class="jumin-table">
                    <tbody>\${headerHtml}\${itemsHtml}</tbody>
                </table>
                <div class="footer-section">
                    <div class="cert-text">
                        この写しは、世帯全員の住民票の原本と相違ないことを証明する。
                        <div class="issue-date-line" style="margin-top: 1rem;">\${formatDateWareki(subject.issueDate)}</div>
                    </div>
                    <div class="issuer-line">
                        <div class="issuer-name-block" style="text-align: right; font-size: 1rem; font-weight: bold;">
                            <span class="issuer-title">\${normalizeText(subject.issuer?.title)}（職務代理者）</span><br>
                            \${normalizeText(subject.issuer?.name)}
                        </div>
                        <div class="seal-block">
                            <div class="seal-area"><span class="official-seal">印</span></div>
                            <div class="seal-note">この印は黒色です</div>
                        </div>
                    </div>
                </div>
            </div>
        \`;
    });
</script>
`;

async function main() {
    await initWasm();

    // 1. Data Prep
    const mdContent = await fs.readFile(juminhyoMdPath, 'utf-8');
    const fmMatch = mdContent.match(/^---([\s\S]+?)---/);
    if (!fmMatch) throw new Error("No frontmatter found");
    const yaml = require('js-yaml');
    const frontmatter = yaml.load(fmMatch[1]);

    // Flatten Data (Shared)
    const flattenedData: Record<string, any> = {};
    let allText = "";
    function flatten(prefix: string, obj: any) {
        for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'string') allText += v;
            if (Array.isArray(v)) {
                if (v.length > 0 && typeof v[0] === 'string') {
                    flattenedData[`${prefix}${k}`] = v;
                    v.forEach(s => allText += String(s));
                } else {
                    v.forEach((item, idx) => flatten(`${prefix}${k}_${idx}_`, item));
                }
            } else if (typeof v === 'object' && v !== null) {
                flatten(`${prefix}${k}_`, v);
            } else { flattenedData[`${prefix}${k}`] = v; }
        }
    }
    flatten("", frontmatter);
    allText += "氏名の振り仮名個人番号氏名住民票コード住民となった年月日旧氏の振り仮名住所を定めた年月日旧氏届出日生年月日性別続柄筆頭者本籍転入前住所世帯主住所この写しは、世帯全員の住民票の原本と相違ないことを証明する。印この印は黒色です令和平成昭和大正明治元年職務代理者";

    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair();

    // 2. Font
    let fontCss = "";
    try {
        if (await fs.pathExists(fontPath)) {
            console.log(`Subsetting font for text length: ${allText.length}...`);
            const { buffer, mimeType } = await subsetFont(fontPath, allText);
            const dataUrl = bufferToDataUrl(buffer, mimeType);
            fontCss = `
            @font-face {
                font-family: 'GJM';
                src: url('${dataUrl}') format('woff2');
                font-weight: normal; font-style: normal;
            }
            body { font-family: 'GJM', sans-serif; }
            `;
        }
    } catch (e) { console.error("Font subsetting failed:", e); }

    await fs.ensureDir('work');

    // --- Generate Credentials & Debug Data ---

    // mDoc
    const { b64url: mdocB64 } = await createMDoc(
        flattenedData,
        { p256: { privateKey: bytesToHex(issuerKeyPair.privateKey), publicKey: bytesToHex(issuerKeyPair.publicKey) } },
        bytesToHex(deviceKeyPair.publicKey),
        "io.github.masanork.srn.credential.juminhyo",
        "io.github.masanork.srn.schema.juminhyo.v1"
    );
    const mdocDebug = inspectMDocStructure(mdocB64);

    // SD-JWT
    const { sdJwt, debug: sdJwtDebug } = await createSdJwt(flattenedData, issuerKeyPair);

    // --- Generate HTML ---
    const outputHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Juminhyo</title>
    <style>
        ${fontCss}
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .jumin-sheet { background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: inherit; position: relative; overflow: hidden; max-width: 1200px; margin: 0 auto; }
        .jumin-table { width: 100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed; }
        .cell { border: 1px solid black; padding: 2px; font-size: 12px; overflow: hidden; }
        .name-cell { font-size: 36px; }
        .no-border { border: none; }
        .label-cell { background: #f9f9f9; text-align: center; }
        .label-text { display: flex; align-items: center; justify-content: center; height: 100%; }
        .label-main { font-size: 10px; line-height: 1.2; word-break: keep-all; line-break: strict; }
        .value-cell { padding-left: 5px; }
        .title-cell { font-size: 24px; font-weight: bold; text-align: center; text-decoration: underline; white-space: nowrap; }
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
        
        details { margin-top: 1rem; cursor: pointer; border: 1px solid #ddd; padding: 10px; background: #fff; }
        summary { font-weight: bold; color: #333; }
        pre, textarea { background: #222; color: #eee; padding: 10px; border-radius: 5px; overflow-x: auto; font-family: monospace; width: 100%; box-sizing: border-box; }
        .debug-section { max-width: 1200px; margin: 40px auto; }
        .debug-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        h3 { border-bottom: 2px solid #999; padding-bottom: 5px; margin-top: 0; }
        .tag-badge { display: inline-block; padding: 2px 5px; border-radius: 3px; font-size: 0.8em; margin-left: 5px; color: white; }
        .tag-mdoc { background: #007bff; }
        .tag-sdjwt { background: #28a745; }
        .desc-text { font-size: 0.9em; color: #666; margin-bottom: 10px; }
    </style>
    <script>
        window.__CREDENTIAL_DATA__ = ${JSON.stringify(frontmatter)};
    </script>
    ${rendererLogic}
</head>
<body>
    <div id="render-target"></div>
    
    <!-- Embedded mDoc Blob -->
    <script id="provenance-mdoc" type="application/cbor-base64url">${mdocB64}</script>
    <!-- Embedded SD-JWT Blob -->
    <script id="provenance-sdjwt" type="application/vc+sd-jwt">${sdJwt}</script>

    <div class="debug-section no-print">
        <div class="debug-grid">
            <!-- mDoc Column -->
            <div>
                <h3>ISO 18013-5 mDoc <span class="tag-badge tag-mdoc">CBOR</span></h3>
                <div class="desc-text">
                    Binary-based format. Uses CBOR Tag 24 for creating "IssuerSignedItem" bytes, which are individually hashed (Digest).
                    Selective disclosure works by revealing the specific IssuerSignedItems matching the requested Digest IDs.
                    <br><br>
                    <strong>Size:</strong> ${mdocB64.length} bytes (Base64) / ~${Math.floor(mdocB64.length * 0.75).toLocaleString()} bytes (Binary)
                </div>
                
                <details>
                    <summary>Raw Data (Base64URL)</summary>
                    <textarea readonly style="height:80px;">${mdocB64}</textarea>
                </details>
                
                <details open>
                    <summary>Decoded Structure (Debug)</summary>
                    <p style="font-size:0.85em; margin:5px 0;">This view shows the hierarchical structure of CBOR Map. Note how every field is wrapped in a Tag 24 structure.</p>
                    <pre style="height:400px;">${JSON.stringify(mdocDebug, null, 2)}</pre>
                </details>
            </div>

            <!-- SD-JWT Column -->
            <div>
                <h3>IETF SD-JWT <span class="tag-badge tag-sdjwt">JSON</span></h3>
                 <div class="desc-text">
                    JSON-based format. Uses a "Disclosures" array where each item is <code>[salt, key, value]</code>.
                    The Payload contains an <code>_sd</code> array of hashes (digests) corresponding to these disclosures.
                    <br><br>
                    <strong>Size:</strong> ${sdJwt.length} bytes (Text)
                </div>
                
                <details>
                    <summary>Raw Data (Text)</summary>
                    <textarea readonly style="height:80px;">${sdJwt}</textarea>
                </details>
                
                <details open>
                    <summary>Decoded Structure (Debug)</summary>
                    <p style="font-size:0.85em; margin:5px 0;">This view shows the component parts. Payload has <code>_sd</code> hashes, and actual data is in the separate Disclosures list.</p>
                    <pre style="height:400px;">${JSON.stringify(sdJwtDebug, null, 2)}</pre>
                </details>
            </div>
        </div>
    </div>
</body>
</html>`;

    const outPath = path.resolve('work/juminhyo-universal.html');
    await fs.writeFile(outPath, outputHtml);
    console.log(`Generated Universal Viewer: ${outPath} (${outputHtml.length} bytes)`);
}

main().catch(console.error);
