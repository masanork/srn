
import {
    createMDoc,
    p256GenerateKeyPair,
    p256Sign,
    bytesToHex,
    hexToBytes,
    initWasm,
    bytesToBase64Url,
    sha256Hash
} from '../src/index';
import { subsetFont, bufferToDataUrl } from '../src/font';
import { decode, encode, addExtension, Tag } from 'cbor-x';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';

// Setup CBOR inspection
addExtension({
    Class: Tag,
    tag: 24,
    decode: (value: Uint8Array) => decode(value),
    encode: (value: any) => value
});

const juminhyoMdPath = path.resolve('sites/srn/content/juminhyo.md');
const fontPath = path.resolve('shared/fonts/ipamjm.ttf');

// --- Helper: Base64URL to Bytes ---
function base64UrlToBytes(value: string): Uint8Array {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(Buffer.from(base64, 'base64'));
}

// --- Logic 1: Generate Issuance Data (Same as Viewer Generator) ---

interface IssuanceResult {
    flattenedData: Record<string, any>;
    mDocBlob: Uint8Array;
    mDocB64: string;
    mDocDebug: any;
    sdJwt: string;
    issuerKeys: any;
    deviceKeys: any;
    disclosures: string[];
    jwtMain: string; // The Issuer-signed JWT part without disclosures
}

async function issueCredentials(): Promise<IssuanceResult> {
    const mdContent = await fs.readFile(juminhyoMdPath, 'utf-8');
    const fmMatch = mdContent.match(/^---([\s\S]+?)---/);
    if (!fmMatch) throw new Error("No frontmatter found");
    const yaml = require('js-yaml');
    const frontmatter = yaml.load(fmMatch[1]);

    // Flatten
    const flattenedData: Record<string, any> = {};
    function flatten(prefix: string, obj: any) {
        for (const [k, v] of Object.entries(obj)) {
            if (Array.isArray(v)) {
                if (v.length > 0 && typeof v[0] === 'string') {
                    flattenedData[`${prefix}${k}`] = v;
                } else {
                    v.forEach((item, idx) => flatten(`${prefix}${k}_${idx}_`, item));
                }
            } else if (typeof v === 'object' && v !== null) {
                flatten(`${prefix}${k}_`, v);
            } else { flattenedData[`${prefix}${k}`] = v; }
        }
    }
    flatten("", frontmatter);

    // Keys
    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair();

    // mDoc Generation
    const { mdoc, b64url } = await createMDoc(
        flattenedData,
        { p256: { privateKey: bytesToHex(issuerKeyPair.privateKey), publicKey: bytesToHex(issuerKeyPair.publicKey) } },
        bytesToHex(deviceKeyPair.publicKey),
        "io.github.masanork.srn.credential.juminhyo",
        "io.github.masanork.srn.schema.juminhyo.v1"
    );

    // SD-JWT Generation
    const disclosures: string[] = [];
    const sdDigests: string[] = [];

    for (const [key, value] of Object.entries(flattenedData)) {
        const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
        const disclosureArray = [salt, key, value];
        const disclosureB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(disclosureArray)));
        disclosures.push(disclosureB64);
        const hash = sha256Hash(new TextEncoder().encode(disclosureB64));
        sdDigests.push(bytesToBase64Url(hash));
    }

    const jwtHeader = { alg: 'ES256', typ: 'vc+sd-jwt' };
    const jwtPayload = {
        _sd: sdDigests,
        iss: 'https://example.com/issuer',
        cnf: { jwk: { kty: "EC", crv: "P-256", x: bytesToBase64Url(deviceKeyPair.publicKey.slice(1, 33)), y: bytesToBase64Url(deviceKeyPair.publicKey.slice(33, 65)) } }, // Bind to device key
        iat: Math.floor(Date.now() / 1000),
        vct: "io.github.masanork.srn.credential.juminhyo"
    };

    const headerB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(jwtHeader)));
    const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(jwtPayload)));
    const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = p256Sign(issuerKeyPair.privateKey, signingInput);
    const jwtMain = `${headerB64}.${payloadB64}.${bytesToBase64Url(signature)}`;
    const sdJwtFull = `${jwtMain}~${disclosures.join('~')}~`;

    return {
        flattenedData,
        mDocBlob: mdoc,
        mDocB64: b64url,
        mDocDebug: decode(mdoc),
        sdJwt: sdJwtFull,
        issuerKeys: issuerKeyPair,
        deviceKeys: deviceKeyPair,
        disclosures,
        jwtMain
    };
}

// --- Logic 2: Presentation & Selection ---

function getRequiredKeys(): string[] {
    // Scenario: Family Name, DOB, MyNumber ONLY (+ minimal metadata)
    const baseKeys = ['証明書名称', '交付年月日', '発行者役職', '発行者氏名'];
    const memberKeys = [];
    for (let i = 0; i < 4; i++) {
        memberKeys.push(`世帯員_${i}_氏名`);
        memberKeys.push(`世帯員_${i}_生年月日`);
        memberKeys.push(`世帯員_${i}_個人番号`);
    }
    return [...baseKeys, ...memberKeys];
}

async function createPresentations(issued: IssuanceResult, requestKeys: string[]) {
    const { mDocBlob, disclosures, jwtMain, deviceKeys } = issued;

    // --- mDoc Presentation ---
    const root = decode(mDocBlob); // Expecting { docType, issuerSigned }

    // Filter items
    const ns = "io.github.masanork.srn.schema.juminhyo.v1"; // from issuance
    const originalItems = root.issuerSigned.nameSpaces[ns] || [];
    const filteredItems: Uint8Array[] = [];

    // Helper: Decode item to check elementIdentifier
    for (const itemBytes of originalItems) {
        // itemBytes is Tag 24 wrapping the Item map OR just the bytes of the encoded map depending on how createMDoc did it.
        // In createMDoc we pushed `encode(item)`.
        try {
            const item = decode(itemBytes);
            // item is { digestID, random, elementIdentifier, elementValue }
            if (requestKeys.includes(item.elementIdentifier)) {
                filteredItems.push(itemBytes);
            }
        } catch (e) { console.warn("Fail desc", e); }
    }

    // Create DeviceResponse (Simulated)
    // Structure: version="1.0", documents=[ { docType, issuerSigned: { nameSpaces: { ns: [items] }, issuerAuth: ... } } ]
    // (In strict mDoc, we also have DeviceAuth)
    const deviceResponse = {
        version: "1.0",
        documents: [{
            docType: root.docType,
            issuerSigned: {
                nameSpaces: { [ns]: filteredItems },
                issuerAuth: root.issuerSigned.issuerAuth
            },
            deviceSigned: {
                nameSpaces: {},
                deviceAuth: { deviceMac: { alg: -7, mac: new Uint8Array(32) } } // Dummy MAC
            }
        }],
        status: 0 // OK
    };
    const mDocPresentationBytes = encode(deviceResponse);
    const mDocPresentationB64 = Buffer.from(mDocPresentationBytes).toString('base64url');


    // --- SD-JWT Presentation ---
    const filteredDisclosures: string[] = [];

    for (const d of disclosures) {
        try {
            const jsonStr = new TextDecoder().decode(base64UrlToBytes(d));
            const arr = JSON.parse(jsonStr); // [salt, key, value]
            if (requestKeys.includes(arr[1])) {
                filteredDisclosures.push(d);
            }
        } catch (e) { }
    }

    // Create KB-JWT (Key Binding)
    const nonce = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(12)));
    const aud = "https://rp.example.com";
    const kbHeader = { alg: 'ES256', typ: 'kb+jwt' };
    const kbPayload = {
        nonce,
        aud,
        iat: Math.floor(Date.now() / 1000)
    };
    const kbH = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(kbHeader)));
    const kbP = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(kbPayload)));
    const kbInput = new TextEncoder().encode(`${kbH}.${kbP}`);
    // Sign with Holder Key
    const kbSig = p256Sign(deviceKeys.privateKey, kbInput);
    const kbJwt = `${kbH}.${kbP}.${bytesToBase64Url(kbSig)}`;

    const sdJwtPresentation = `${jwtMain}~${filteredDisclosures.join('~')}~${kbJwt}`;

    return {
        mDocPresentationB64,
        sdJwtPresentation,
        deviceResponse, // for debug view
        requestKeys
    };
}


// --- Logic 3: Generate HTML ---

async function main() {
    await initWasm();

    console.log("Issuing credentials...");
    const issued = await issueCredentials();

    console.log("Processing flow...");
    const requestKeys = getRequiredKeys();
    const presentation = await createPresentations(issued, requestKeys);

    // Font setup
    let allText = "";
    Object.values(issued.flattenedData).forEach(v => {
        if (typeof v === 'string') allText += v;
        if (Array.isArray(v)) v.forEach(s => { if (typeof s === 'string') allText += s; });
    });
    // Add UI text
    allText += "プレゼンテーション要求署名検証成功開示項目のみ表示";

    let fontCss = "";
    if (await fs.pathExists(fontPath)) {
        const { buffer, mimeType } = await subsetFont(fontPath, allText);
        const dataUrl = bufferToDataUrl(buffer, mimeType);
        fontCss = `@font-face { font-family: 'GJM'; src: url('${dataUrl}') format('woff2'); } body { font-family: 'GJM', sans-serif; }`;
    }

    // HTML Content
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Juminhyo Presentation Flow Demo</title>
    <style>
        ${fontCss}
        body { margin: 0; padding: 20px; background: #f5f5f5; color: #333; max-width: 1200px; margin: 0 auto; }
        header { text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .flow-container { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; }
        .flow-step { flex: 1; min-width: 300px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .step-title { font-weight: bold; font-size: 1.2em; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
        .step-number { background: #333; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; font-size: 0.8em; margin-right: 10px; }
        .data-box { background: #2d2d2d; color: #e0e0e0; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.85em; overflow: auto; max-height: 300px; white-space: pre-wrap; word-break: break-all; }
        .arrow-down { text-align: center; font-size: 2em; color: #ccc; margin: 10px 0; }
        .field-list { list-style: none; padding: 0; margin: 0; }
        .field-item { padding: 4px 8px; margin-bottom: 4px; background: #eef; border-radius: 3px; font-size: 0.9em; display: flex; justify-content: space-between; }
        .field-item.hidden { background: #fdd; color: #999; text-decoration: line-through; }
        .viewer-frame { border: 1px solid #ccc; background: white; padding: 20px; margin-top: 10px; height: 400px; overflow-y: auto; }
        
        /* Simulating the Certificate View */
        .cert-table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; }
        .cert-cell { border: 1px solid #000; padding: 2px; }
        .cert-label { background: #f0f0f0; text-align: center; white-space: nowrap; }
        .cert-value { font-weight: bold; }
        .value-redacted { color: transparent; background: #ccc; user-select: none; }
        .value-redacted::after { content: "NON-DISCLOSED"; color: #888; font-size: 0.8em; display: block; text-align: center; }
    </style>
</head>
<body>
    <header>
        <h1>住民票：選択的開示フロー実証 (Selective Disclosure Flow)</h1>
        <p>RP（検証者）の要求に応じ、世帯全員の「氏名・生年月日・マイナンバー」のみを開示するシナリオ</p>
    </header>

    <div class="flow-container">
        <!-- STEP 1: Request -->
        <div class="flow-step">
            <div class="step-title">
                <span><span class="step-number">1</span> Request (RP)</span>
            </div>
            <p>検証者(RP)は、業務に必要な以下の項目のみをWalletに要求します。(Presentation Definition / DeviceRequest)</p>
            <div class="data-box" style="background: #e3f2fd; color: #0d47a1;">
                <strong>Requesting Fields:</strong><br>
                <ul>
                ${requestKeys.map(k => `<li>${k}</li>`).join('')}
                </ul>
                <hr style="border-color:#bbdefb;">
                <strong>Context:</strong><br>
                Verifier: bank.example.com<br>
                Nonce: 849302...<br>
                Purpose: "Identity Verification for Account Opening"
            </div>
        </div>

        <!-- STEP 2: Selection & Filtration -->
        <div class="flow-step">
            <div class="step-title">
                <span><span class="step-number">2</span> Selection (User/Wallet)</span>
            </div>
            <p>Walletは原本から要求された項目のみを抽出し、それ以外を切り捨てます。</p>
            <div style="font-size: 0.9em; margin-bottom: 10px;"><strong>Privacy Action:</strong></div>
            <ul class="field-list">
                ${Object.keys(issued.flattenedData).map(k => {
        const isReq = requestKeys.includes(k);
        if (isReq) return `<li class="field-item"><span>✅ ${k}</span> <span>RELEASE</span></li>`;
        // limit hidden items display
        return '';
    }).join('')}
                <li class="field-item hidden" style="justify-content:center;">... (Other 30+ fields HIDDEN) ...</li>
            </ul>
        </div>

        <!-- STEP 3: Response -->
        <div class="flow-step">
            <div class="step-title">
                <span><span class="step-number">3</span> Presentation (VP)</span>
            </div>
            <p>生成された「検証可能な提示(VP)」電文。不要なデータは物理的に含まれていません。</p>
            
            <div style="margin-bottom: 10px;">
                <strong>Format: ISO 18013-5 mDoc</strong>
                <div class="data-box">
                    DeviceResponse (Binary / Base64URL)<br>
                    Size: ${presentation.mDocPresentationB64.length} chars<br><br>
                    ${presentation.mDocPresentationB64.slice(0, 100)}...
                </div>
            </div>
            
            <div>
                <strong>Format: IETF SD-JWT</strong>
                <div class="data-box">
                    Presentation (Compact Serialization)<br>
                    Size: ${presentation.sdJwtPresentation.length} chars<br><br>
                    ${presentation.sdJwtPresentation.slice(0, 100)}...
                </div>
            </div>
        </div>
    </div>

    <!-- STEP 4: Verification Result -->
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-top: 20px;">
        <div class="step-title">
            <span><span class="step-number">4</span> Verification View (RP Side)</span>
            <span style="color: green; font-size: 0.8em; border: 1px solid green; padding: 2px 6px; border-radius: 4px;">✔ SIGNATURE VERIFIED</span>
        </div>
        <p>検証者が受け取ったデータをレンダリングした結果。開示された「氏名・生年月日・マイナンバー」のみが表示され、住所や本籍等は不可視（または取得不可）となっています。</p>
        
        <!-- Render the disclosed data -->
        <div class="viewer-frame">
            <div style="text-align:center; font-weight:bold; font-size:1.5em; margin-bottom:20px;">住民票の写し（一部開示）</div>
            <table class="cert-table">
                ${renderTableRows(issued.flattenedData, requestKeys)}
            </table>
        </div>
    </div>
</body>
</html>`;

    const outPath = path.resolve('work/juminhyo-flow-demo.html');
    await fs.writeFile(outPath, html);
    console.log(`Generated Flow Demo: ${outPath} (${html.length} bytes)`);
}

function renderTableRows(data: any, reqKeys: string[]) {
    // Helper to check disclosure
    const val = (k: string) => reqKeys.includes(k) ? data[k] : `<span class="value-redacted">MASKED</span>`;

    // Header
    let html = `
    <tr><td class="cert-cell cert-label">証明書名称</td><td class="cert-cell cert-value" colspan="3">${val('証明書名称')}</td></tr>
    <tr><td class="cert-cell cert-label">発行者</td><td class="cert-cell cert-value" colspan="3">${val('発行者役職')} ${val('発行者氏名')}</td></tr>
    <tr><td class="cert-cell cert-label">住所</td><td class="cert-cell cert-value" colspan="3">${val('世帯住所')}</td></tr> <!-- Should be masked -->
    <tr><td class="cert-cell" colspan="4" style="background:#eee; height:5px;"></td></tr>
    `;

    // Members
    for (let i = 0; i < 4; i++) {
        html += `
        <tr>
            <td class="cert-cell cert-label" rowspan="3">世帯員${i + 1}</td>
            <td class="cert-cell cert-label">氏名</td>
            <td class="cert-cell cert-value">${val(`世帯員_${i}_氏名`)}</td>
            <td class="cert-cell cert-label">個人番号</td>
        </tr>
        <tr>
            <td class="cert-cell cert-label">生年月日</td>
            <td class="cert-cell cert-value">${val(`世帯員_${i}_生年月日`)}</td>
            <td class="cert-cell cert-value" rowspan="2">${val(`世帯員_${i}_個人番号`)}</td>
        </tr>
        <tr>
            <td class="cert-cell cert-label">続柄/本籍</td>
            <td class="cert-cell cert-value">${val(`世帯員_${i}_続柄`)}<br>${val(`世帯員_${i}_本籍`)}</td>
        </tr>
        `;
    }
    return html;
}

main().catch(console.error);

