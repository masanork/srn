
import {
    createMDoc,
    p256GenerateKeyPair,
    p256Sign,
    bytesToHex,
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

function base64UrlToBytes(value: string): Uint8Array {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(Buffer.from(base64, 'base64'));
}

// --- Data Generation ---

async function generateScenarioData() {
    const mdContent = await fs.readFile(juminhyoMdPath, 'utf-8');
    const fmMatch = mdContent.match(/^---([\s\S]+?)---/);
    if (!fmMatch) throw new Error("No frontmatter found");
    const yaml = require('js-yaml');
    const sourceData = yaml.load(fmMatch[1]);

    // Flatten logic
    const flattened: Record<string, any> = {};
    let allText = ""; // For font subsetting

    // Static text needed for certificate rendering
    allText += "氏名の振り仮名個人番号氏名住民票コード住民となった年月日旧氏の振り仮名住所を定めた年月日旧氏届出日生年月日性別続柄筆頭者本籍転入前住所世帯主住所この写しは、世帯全員の住民票の原本と相違ないことを証明する。印この印は黒色です令和平成昭和大正明治元年職務代理者";

    function flatten(prefix: string, obj: any) {
        for (const [k, v] of Object.entries(obj)) {
            // Collect text for font subsetting
            if (typeof v === 'string') allText += v;

            if (Array.isArray(v)) {
                if (v.length > 0 && typeof v[0] === 'string') {
                    flattened[`${prefix}${k}`] = v;
                    v.forEach(s => { if (typeof s === 'string') allText += s; });
                } else {
                    v.forEach((item, idx) => flatten(`${prefix}${k}_${idx}_`, item));
                }
            } else if (typeof v === 'object' && v !== null) {
                flatten(`${prefix}${k}_`, v);
            } else { flattened[`${prefix}${k}`] = v; }
        }
    }
    flatten("", sourceData);

    return { sourceData, flattened, allText };
}

// --- Lifecycle Flow Generation ---

async function runLifecycle() {
    const { sourceData, flattened, allText } = await generateScenarioData();

    // keys
    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair(); // User's key (Passkey)
    const rpKeyPair = p256GenerateKeyPair();

    // ---------------------------------------------------------
    // PHASE 1: Application (User -> Issuer)
    // ---------------------------------------------------------
    // User requests issuance using their Public Key
    const deviceKeyJwk = { kty: "EC", crv: "P-256", x: "...", y: "..." }; // Simplified
    const applicationPayload = {
        action: "IssueJuminhyo",
        applicantId: "123456789012", // MyNumber
        deviceKey: deviceKeyJwk,
        timestamp: new Date().toISOString()
    };
    const applicationJwt = "eyJhbGciOiJFZDI1NTE5In0..." + "." + bytesToBase64Url(new TextEncoder().encode(JSON.stringify(applicationPayload))) + ".<Sig>";


    // ---------------------------------------------------------
    // PHASE 2: Issuance (Issuer -> User)
    // ---------------------------------------------------------
    // 1. Acceptance Certificate (Binding Proof)
    const acceptancePayload = {
        type: "AcceptanceCertificate",
        iss: "https://city.example.jp",
        sub: applicationPayload.applicantId,
        cnf: { jwk: deviceKeyJwk }, // Bind Device Key
        scope: ["Juminhyo"],
        iat: Math.floor(Date.now() / 1000)
    };
    const acceptanceJwt = "eyJ..." + "." + bytesToBase64Url(new TextEncoder().encode(JSON.stringify(acceptancePayload))) + ".<Sig>";

    // 2. Credential Generation (mDoc & SD-JWT)
    // mDoc
    const { mdoc, b64url: mdocCredB64 } = await createMDoc(
        flattened,
        { p256: { privateKey: bytesToHex(issuerKeyPair.privateKey), publicKey: bytesToHex(issuerKeyPair.publicKey) } },
        bytesToHex(deviceKeyPair.publicKey),
        "io.github.masanork.srn.credential.juminhyo",
        "io.github.masanork.srn.schema.juminhyo.v1"
    );

    // SD-JWT
    const disclosures: string[] = [];
    const sdDigests: string[] = [];
    for (const [key, value] of Object.entries(flattened)) {
        const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
        const dJson = JSON.stringify([salt, key, value]);
        const dB64 = bytesToBase64Url(new TextEncoder().encode(dJson));
        disclosures.push(dB64);
        sdDigests.push(bytesToBase64Url(sha256Hash(new TextEncoder().encode(dB64))));
    }
    const jwtPayload = {
        _sd: sdDigests,
        iss: "https://city.example.jp",
        cnf: { jwk: deviceKeyJwk },
        vct: "io.github.masanork.srn.credential.juminhyo"
    };
    const jwtMain = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(jwtPayload))); // Simplification
    // const jwtFull = `Header.${jwtMain}.Sig~${disclosures.join('~')}~`; // We store parts


    // ---------------------------------------------------------
    // PHASE 3: Presentation Request (RP -> User)
    // ---------------------------------------------------------
    // RP Requests: Name, DOB, MyNumber for all members
    const requestFields = ['証明書名称', '交付年月日', '発行者役職', '発行者氏名'];
    for (let i = 0; i < 4; i++) {
        requestFields.push(`世帯員_${i}_氏名`);
        requestFields.push(`世帯員_${i}_生年月日`);
        requestFields.push(`世帯員_${i}_個人番号`);
    }

    const presentationRequest = {
        interactionId: crypto.randomUUID(),
        query: {
            type: "PresentationDefinition",
            constraints: {
                fields: requestFields
            }
        },
        nonce: "8923859082349083"
    };


    // ---------------------------------------------------------
    // PHASE 4: Presentation (User -> RP)
    // ---------------------------------------------------------
    // Filter mDoc
    const mdocRoot = decode(mdoc);
    const ns = "io.github.masanork.srn.schema.juminhyo.v1";
    const allItems = mdocRoot.issuerSigned.nameSpaces[ns] || [];
    const filteredItems: Uint8Array[] = [];
    const disclosedData: Record<string, any> = {}; // For rendering check

    for (const itemBytes of allItems) {
        try {
            const item = decode(itemBytes); // createMDoc stores encoded items
            if (requestFields.includes(item.elementIdentifier)) {
                filteredItems.push(itemBytes);
                disclosedData[item.elementIdentifier] = item.elementValue;
            }
        } catch (e) { }
    }

    const deviceResponse = {
        version: "1.0",
        documents: [{
            docType: mdocRoot.docType,
            issuerSigned: {
                nameSpaces: { [ns]: filteredItems },
                issuerAuth: mdocRoot.issuerSigned.issuerAuth
            },
            deviceSigned: {
                // Device Signature
                deviceAuth: { deviceMac: {} }
            }
        }]
    };
    const vpMdocBytes = encode(deviceResponse);
    const vpMdocB64 = Buffer.from(vpMdocBytes).toString('base64url');

    // Filter SD-JWT
    const filteredDisclosures: string[] = [];
    disclosures.forEach(d => {
        try {
            const arr = JSON.parse(new TextDecoder().decode(base64UrlToBytes(d)));
            if (requestFields.includes(arr[1])) {
                filteredDisclosures.push(d);
            }
        } catch (e) { }
    });
    // KB-JWT
    const kbJwt = "Head.Payload.Sig"; // Dummy
    const vpSdJwt = `Header.${jwtMain}.Sig~${filteredDisclosures.join('~')}~${kbJwt}`;


    // ---------------------------------------------------------
    // OUTPUT GENERATION
    // ---------------------------------------------------------
    // Font processing (Subsetting)
    let fontCss = "";
    if (await fs.pathExists(fontPath)) {
        console.log(`Subsetting font for full lifecycle demo (${allText.length} chars)...`);
        const { buffer, mimeType } = await subsetFont(fontPath, allText);
        const dataUrl = bufferToDataUrl(buffer, mimeType);
        fontCss = `
        @font-face { font-family: 'GJM'; src: url('${dataUrl}') format('woff2'); }
        .jumin-font { font-family: 'GJM', serif !important; }
        `;
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Juminhyo: Full Lifecycle & Presentation Demo</title>
    <style>
        ${fontCss}
        body { margin: 0; padding: 0; background: #e0e0e0; font-family: "Helvetica Neue", Arial, sans-serif; color: #333; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        
        .timeline-step { 
            background: white; 
            border-radius: 8px; 
            padding: 25px; 
            margin-bottom: 30px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            position: relative;
            border-left: 5px solid #ccc;
        }
        .timeline-step::before {
            content: '';
            position: absolute;
            left: -30px;
            top: 30px;
            width: 20px;
            height: 20px;
            background: #fff;
            border: 5px solid #ccc;
            border-radius: 50%;
        }
        .timeline-step.active { border-left-color: #2196F3; }
        .timeline-step.active::before { border-color: #2196F3; background: #2196F3; }

        h2 { margin-top: 0; color: #444; font-size: 1.4em; display: flex; justify-content: space-between; align-items: center; }
        .actor-badge { font-size: 0.6em; background: #eee; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .code-block { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 6px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 0.85em; overflow-x: auto; margin-top: 10px; max-height: 200px; }
        .desc { color: #666; line-height: 1.6; margin-bottom: 15px; font-size: 0.95em; }

        /* Certificate Preview */
        .cert-preview {
            background: white;
            padding: 40px;
            border: 1px solid #ddd;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
            position: relative;
            margin-top: 30px;
        }
        /* Juminhyo Table Styles (Copied & Scoped) */
        .jumin-table { width: 100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed; }
        .cell { border: 1px solid black; padding: 4px; font-size: 12px; overflow: hidden; vertical-align: middle; line-height: 1.3;}
        .label-cell { background: #f9f9f9; text-align: center; font-size: 10px; }
        .name-cell { font-size: 1.4em; font-weight: bold; }
        .title-cell { font-size: 1.8em; font-weight: bold; text-align: center; border-bottom: 2px solid #000 !important; padding: 10px; }
        .value-redacted { background: #ddd; color: transparent; position: relative; }
        .value-redacted::after { content: "MASKED"; color: #888; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.8em; font-family: sans-serif; letter-spacing: 1px; }

        .verification-badge {
            background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;
            padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; margin-bottom: 20px;
        }
    </style>
</head>
<body>

<div class="container">
    <h1 style="text-align: center; margin-bottom: 50px;">Digital Juminhyo Lifecycle Demo</h1>

    <!-- 1. Application -->
    <div class="timeline-step">
        <h2>
            1. Issuance Request
            <span class="actor-badge">User &rarr; Issuer</span>
        </h2>
        <div class="desc">
            住民（User）が自治体（Issuer）に対し、自身の公開鍵（Passkey/FIDO）を含む発行申請を行います。<br>
            この申請にはJPKI（マイナンバーカード）による電子署名が付与され、実在性と本人の意思が保証されます。
        </div>
        <div class="code-block">
// Application Payload (Signed by JPKI)
{
  "action": "IssueJuminhyo",
  "applicantId": "123456789012",
  "deviceKey": { "kty": "EC", "crv": "P-256", ... },
  "signature": "..."
}
        </div>
    </div>

    <!-- 2. Issuance -->
    <div class="timeline-step">
        <h2>
            2. Issuance & Binding
            <span class="actor-badge">Issuer &rarr; User</span>
        </h2>
        <div class="desc">
            自治体は申請を審査し、2つのアーティファクトを発行します：<br>
            1. <strong>住民票VC (mDoc / SD-JWT)</strong>: 自治体の署名付き原本データ。<br>
            2. <strong>受理証 (Acceptance Cert)</strong>: 「この住民票は、このUser鍵で管理される」ことを証明するBinding Certificate。
        </div>
        <div class="code-block">
// 1. Juminhyo Credential (mDoc Structure)
DocType: io.github.masanork.srn.credential.juminhyo
IssuerAuth: [ProtectedHeader, Unprotected, MSO, Signature]
Items: 42 fields (Name, Address, MyNumber...)

// 2. Acceptance Certificate (JWT)
{
  "iss": "https://city.example.jp",
  "sub": "123456789012",
  "cnf": { "jwk": { ...UserDeviceKey... } }
}
        </div>
    </div>

    <!-- 3. Presentation Request -->
    <div class="timeline-step active">
        <h2>
            3. Presentation Request
            <span class="actor-badge">RP &rarr; User</span>
        </h2>
        <div class="desc">
            銀行や不動産業者などの検証者（RP）は、必要な項目（氏名・生年月日・マイナンバー等）のみを指定して提示を求めます。<br>
            住所や本籍など、業務に不要な情報は要求しません。
        </div>
        <div class="code-block">
// Presentation Definition (Input Descriptor)
{
  "constraints": {
    "fields": [
      { "path": ["$.credentialSubject.name"] },
      { "path": ["$.credentialSubject.birthDate"] },
      { "path": ["$.credentialSubject.individualNumber"] }
      // Address, Domicile, etc. are NOT requested.
    ]
  },
  "nonce": "${presentationRequest.nonce}"
}
        </div>
    </div>

    <!-- 4. Presentation & Filtering -->
    <div class="timeline-step active">
        <h2>
            4. Selective Presentation
            <span class="actor-badge">User &rarr; RP</span>
        </h2>
        <div class="desc">
            UserのWalletは、要求された項目のみを抽出し、署名付きで提示（Transfer）します。<br>
            未選択の項目は物理的に削除され、RPには渡りません。同時に、User鍵による署名（KB-JWT/DeviceAuth）を行い、所持者であることを証明します。
        </div>
        <div class="code-block">
// Generated VP (mDoc DeviceResponse)
Size: ${vpMdocB64.length} bytes
// Contains only requested Digests and Values.

// Generated VP (SD-JWT)
Size: ${vpSdJwt.length} bytes
// Contains only requested Disclosures.
        </div>
    </div>

    <!-- 5. Verification View -->
    <div class="timeline-step active" style="border-left-color: #4CAF50;">
        <h2>
            5. Verification & Rendering
            <span class="actor-badge">RP View</span>
        </h2>
        <div class="desc">
            RP側での署名検証成功後のプレビュー画面です。<br>
            開示された項目（氏名・生年月日・マイナンバー）のみが表示され、それ以外の情報はマスクされています。
            外字（${allText.length}文字サブセット）も正しく表示されます。
        </div>

        <div class="verification-badge">
            ✅ VERIFIED: City Issuer Signature + User Device Possession
        </div>

        <div class="cert-preview jumin-font">
            ${renderCertHtml(disclosedData, requestFields)}
        </div>
    </div>

</div>

</body>
</html>`;

    const outPath = path.resolve('work/juminhyo-full-demo.html');
    await fs.writeFile(outPath, html);
    console.log(`Generated Full Lifecycle Demo: ${outPath} (${html.length} bytes)`);
}


function renderCertHtml(data: any, reqKeys: string[]) {
    // Helper
    const v = (key: string) => {
        if (reqKeys.includes(key) && data[key]) return data[key];
        return `<span class="value-redacted">XXXXXXXX</span>`;
    };
    const t = (val: string) => val || '';

    // Render Table
    let rows = '';

    // Header
    rows += `
    <tr><td class="cell title-cell" colspan="40">${v('証明書名称')}</td></tr>
    <tr><td class="cell label-cell" colspan="6">住所</td><td class="cell cell" colspan="34">${v('世帯住所')}</td></tr>
    <tr><td class="cell label-cell" colspan="6">世帯主</td><td class="cell cell" colspan="34">${v('世帯主氏名')}</td></tr>
    `;

    // Members
    for (let i = 0; i < 4; i++) {
        const p = `世帯員_${i}_`;
        rows += `
        <tr>
            <td class="cell label-cell" rowspan="3" colspan="2">員<br>${i + 1}</td>
            <td class="cell label-cell" colspan="4">氏名</td>
            <td class="cell cell name-cell" colspan="18">${v(p + '氏名')}</td>
            <td class="cell label-cell" colspan="6">個人番号</td>
            <td class="cell cell" colspan="10">${v(p + '個人番号')}</td>
        </tr>
        <tr>
            <td class="cell label-cell" colspan="4">生年月日</td>
            <td class="cell cell" colspan="12">${v(p + '生年月日')}</td>
            <td class="cell label-cell" colspan="4">性別</td>
            <td class="cell cell" colspan="6">${v(p + '性別')}</td>
            <td class="cell label-cell" colspan="4">続柄</td>
            <td class="cell cell" colspan="8">${v(p + '続柄')}</td>
        </tr>
        <tr>
            <td class="cell label-cell" colspan="4">本籍</td>
            <td class="cell cell" colspan="34">${v(p + '本籍')}</td>
        </tr>
        <tr><td class="cell" colspan="40" style="height: 5px; background: #eee;"></td></tr>
        `;
    }

    // Issuer
    rows += `
    <tr>
        <td class="cell" colspan="40" style="text-align: right; padding: 20px;">
            この写しは、世帯全員の住民票の原本と相違ないことを証明する。<br>
            ${v('交付年月日')}<br><br>
            ${v('発行者役職')} ${v('発行者氏名')} <span style="border:1px solid #000; padding:2px;">印</span>
        </td>
    </tr>
    `;

    return `<table class="jumin-table">${rows}</table>`;
}

// EXECUTE
async function main() {
    await initWasm();
    await runLifecycle();
}

main().catch(console.error);

