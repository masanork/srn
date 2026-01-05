
import {
    createMDoc,
    p256GenerateKeyPair,
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
    let allText = "住民票の写し等交付請求書請求者氏名住所電話番号対象者世帯全員本人のみ使用目的提出先電子署名付与受理証発行等要求同意画面以下の情報の提供を求めています提供しない同意する拒否する提供項目必須任意"; // Base UI text

    // Original Juminhyo Text
    const certText = "氏名の振り仮名個人番号氏名住民票コード住民となった年月日旧氏の振り仮名住所を定めた年月日旧氏届出日生年月日性別続柄筆頭者本籍転入前住所世帯主住所この写しは、世帯全員の住民票の原本と相違ないことを証明する。印この印は黒色です令和平成昭和大正明治元年職務代理者";
    allText += certText;

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


// --- Rendering Helpers ---

// Dates are static for demo simplicity
function formatDate(dateStr: string) { return dateStr || ''; }

function renderJuminhyoTable(data: any, reqKeys: string[] | null, isFull: boolean) {
    // Helper to decide value content
    const v = (key: string) => {
        const val = data[key];
        if (isFull) return val || '';
        if (reqKeys && reqKeys.includes(key) && val) return val;
        return `<span class="value-redacted">XXXXXXXX</span>`;
    };

    // Header
    let rows = `
    <tr><td class="cell title-cell" colspan="40">${v('証明書名称')}</td></tr>
    <tr><td class="cell label-cell" colspan="6">住所</td><td class="cell cell" colspan="34">${v('世帯住所')}</td></tr>
    <tr><td class="cell label-cell" colspan="6">世帯主</td><td class="cell cell" colspan="34">${v('世帯主氏名')}</td></tr>
    <tr><td class="cell" colspan="40" style="height: 5px; border:none;"></td></tr>
    `;

    // Members (Assuming 4 members from source)
    for (let i = 0; i < 4; i++) {
        const p = `世帯員_${i}_`;

        // Skip rendering member if masked completely? No, show masked rows to prove selective disclosure.

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

function renderApplication(data: any) {
    return `
    <div class="paper-form">
        <div class="form-title">住民票の写し等交付申請書</div>
        <div class="form-row">
            <span class="label">請求日:</span> <span class="value">令和8年1月4日</span>
        </div>
        <div class="form-section">
            <div class="section-title">請求者（あなた）</div>
            <table class="form-table">
                <tr><td class="label">住所</td><td class="value">${data['世帯住所']}</td></tr>
                <tr><td class="label">氏名</td><td class="value">${data['世帯主氏名']}  (署名済み ✅)</td></tr>
                <tr><td class="label">電話番号</td><td class="value">090-1234-5678</td></tr>
            </table>
        </div>
        <div class="form-section">
            <div class="section-title">請求内容</div>
            <div class="checkbox-group">
                <span class="checked">☑ 世帯全員の写し</span>
                <span>□ 世帯一部の写し</span>
            </div>
            <div class="checkbox-group" style="margin-top:5px;">
                <span class="checked">☑ マイナンバー記載あり</span>
                <span>□ 続柄記載あり</span>
                <span class="checked">☑ 本籍記載あり</span>
            </div>
        </div>
        <div class="stamp-box">
             JPKI<br>利用者証明
        </div>
    </div>
    `;
}

function renderAcceptance(data: any) {
    return `
    <div class="cert-card">
        <div class="cert-header">申請受理証 (Binding Proof)</div>
        <div class="cert-body">
            <p>以下の交付申請を受理し、あなたの端末鍵との紐付けを行いました。</p>
            <div class="key-info">
                <strong>申請者:</strong> ${data['世帯主氏名']}<br>
                <strong>端末鍵(Thumbprint):</strong> <code>a1b2c3d4...</code><br>
                <strong>発行日:</strong> 令和8年1月5日
            </div>
            <div class="cert-status">VALID / BINDING ACTIVE</div>
        </div>
    </div>
    `;
}

function renderConsent(reqFields: string[]) {
    const list = reqFields.map(k => {
        let label = k;
        if (k.includes('_氏名')) label = "世帯員の氏名";
        if (k.includes('_生年月日')) label = "世帯員の生年月日";
        if (k.includes('_個人番号')) label = "マイナンバー";
        return label;
    });
    // Deduplicate
    const uniqueLabels = [...new Set(list)];

    return `
    <div class="consent-screen">
        <h3>以下の情報の提供を求めています</h3>
        <p class="rp-name">要求元: ○×株式会社 総務部<br>利用目的：入社手続、税・社会保険関係</p>
        <ul class="req-list">
            ${uniqueLabels.map(l => `<li><span class="check">☑</span> ${l} <span class="badge">必須</span></li>`).join('')}
            <li><span class="uncheck">□</span> 住所 <span class="badge gray">提供不要</span></li>
            <li><span class="uncheck">□</span> 本籍 <span class="badge gray">提供不要</span></li>
        </ul>
        <div class="button-group">
            <button class="btn cancel">拒否する</button>
            <button class="btn ok">同意して提供</button>
        </div>
    </div>
    `;
}


// --- Main Lifecycle Script ---

async function runLifecycle() {
    const { sourceData, flattened, allText } = await generateScenarioData();

    // keys - Minimal setup for technical consistency
    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair();

    // 1. Issuance (Generate Credential)
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
    const jwtMain = "GeneratedJWTHeader.Payload.Sig";

    // 2. Request (Definition)
    const requestFields = ['証明書名称', '交付年月日', '発行者役職', '発行者氏名'];
    for (let i = 0; i < 4; i++) {
        requestFields.push(`世帯員_${i}_氏名`);
        requestFields.push(`世帯員_${i}_生年月日`);
        requestFields.push(`世帯員_${i}_個人番号`);
    }

    // 3. Presentation (Filter)
    const filteredDisclosures: string[] = [];
    disclosures.forEach(d => {
        try {
            const arr = JSON.parse(new TextDecoder().decode(base64UrlToBytes(d)));
            if (requestFields.includes(arr[1])) filteredDisclosures.push(d);
        } catch (e) { }
    });
    const vpSdJwt = `${jwtMain}~${filteredDisclosures.join('~')}~KeyBindingSig`;
    const vpMdocB64 = "mDocPresentationBytesBase64..."; // Dummy for text display

    // Font processing
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

    // HTML Assembly
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Juminhyo: Full Lifecycle Demo</title>
    <style>
        ${fontCss}
        body { margin: 0; padding: 0; background: #eaeff2; font-family: "Helvetica Neue", Arial, sans-serif; color: #333; }
        .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
        
        .timeline-step { 
            background: white; 
            border-radius: 12px; 
            padding: 30px; 
            margin-bottom: 40px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
            position: relative;
            border-left: 6px solid #ccc;
            display: flex;
            gap: 20px;
        }
        .timeline-step::before {
            content: '';
            position: absolute;
            left: -33px;
            top: 30px;
            width: 20px;
            height: 20px;
            background: #fff;
            border: 6px solid #ccc;
            border-radius: 50%;
            z-index: 10;
        }
        .timeline-line {
            position: absolute;
            left: -26px;
            top: 50px;
            bottom: -70px; /* Connect to next */
            width: 6px;
            background: #ccc;
        }
        .last-step .timeline-line { display: none; }

        .timeline-step.active { border-left-color: #2196F3; }
        .timeline-step.active::before { border-color: #2196F3; background: #2196F3; }
        .timeline-step.active .timeline-line { background: #2196F3; }

        .step-content { flex: 1; }
        .step-visual { flex: 1; min-width: 300px; display: flex; justify-content: center; align-items: start; }

        h2 { margin-top: 0; color: #2c3e50; font-size: 1.5em; margin-bottom: 10px; }
        .actor { font-size: 0.8em; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: block;}
        .desc { color: #555; line-height: 1.6; margin-bottom: 15px; }

        .code-block { background: #2d3436; color: #dfe6e9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 0.8em; overflow-x: auto; max-width: 100%; border: 1px solid #000; }

        /* --- Preview Components Styles --- */
        .paper-form {
            background: #fff; border: 1px solid #ccc; padding: 20px; width: 100%; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); font-family: 'GJM', serif; position: relative;
        }
        .form-title { text-align: center; font-size: 1.2em; border-bottom: 2px solid #333; margin-bottom: 15px; padding-bottom: 5px; }
        .form-row { margin-bottom: 10px; }
        .form-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .form-table td { border: 1px solid #999; padding: 5px; font-size: 0.9em; }
        .form-table .label { background: #f0f0f0; width: 30%; text-align: center; }
        .section-title { font-weight: bold; border-left: 4px solid #333; padding-left: 5px; margin-top: 15px; margin-bottom: 5px; }
        .checkbox-group span { display: inline-block; margin-right: 15px; }
        .checked { font-weight: bold; }
        .stamp-box { position: absolute; top: 20px; right: 20px; border: 2px solid #ed1c24; color: #ed1c24; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7em; text-align: center; transform: rotate(-15deg); opacity: 0.8; }

        .cert-card {
            background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
            border: 1px solid #d1d1d1; border-radius: 8px; padding: 15px; width: 100%; font-family: sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .cert-header { background: #34495e; color: white; padding: 8px; border-radius: 4px 4px 0 0; font-weight: bold; text-align: center; font-size: 0.9em; }
        .cert-body { padding: 10px; border: 1px solid #eee; border-top: none; }
        .key-info { background: #eee; padding: 10px; margin: 10px 0; font-size: 0.8em; border-radius: 4px; }
        .cert-status { color: green; font-weight: bold; text-align: center; border: 1px solid green; padding: 5px; border-radius: 4px; margin-top: 10px; font-size: 0.8em; }

        .full-cert-preview {
            background: white; transform: scale(0.6); transform-origin: top center; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: -150px; /* Compensate scale */
        }

        .consent-screen {
            background: #fff; border-radius: 12px; padding: 20px; width: 100%; box-shadow: 0 10px 20px rgba(0,0,0,0.15); font-family: sans-serif; border: 1px solid #eee;
        }
        .consent-screen h3 { margin-top: 0; font-size: 1.1em; text-align: center; }
        .rp-name { text-align: center; color: #666; font-size: 0.9em; margin-bottom: 15px; }
        .req-list { list-style: none; padding: 0; margin: 0; }
        .req-list li { padding: 8px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; font-size: 0.9em; }
        .check { color: #2196F3; font-weight: bold; font-size: 1.2em; margin-right: 10px; }
        .uncheck { color: #ccc; font-size: 1.2em; margin-right: 10px; }
        .badge { font-size: 0.7em; padding: 2px 6px; border-radius: 4px; background: #e3f2fd; color: #2196F3; }
        .badge.gray { background: #eee; color: #999; }
        .button-group { display: flex; gap: 10px; margin-top: 20px; }
        .btn { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        .btn.cancel { background: #f5f5f5; color: #333; }
        .btn.ok { background: #2196F3; color: white; }

        /* Juminhyo Table (Common) */
        .jumin-table { width: 100%; border-collapse: collapse; border: 2px solid black; table-layout: fixed; }
        .cell { border: 1px solid black; padding: 4px; font-size: 12px; vertical-align: middle; line-height: 1.3;}
        .label-cell { background: #f9f9f9; text-align: center; font-size: 10px; }
        .name-cell { font-size: 1.4em; font-weight: bold; }
        .title-cell { font-size: 1.8em; font-weight: bold; text-align: center; border-bottom: 2px solid #000 !important; padding: 10px; }
        .value-redacted { background: #ccc; color: transparent; position: relative; display:inline-block; width: 100%; height: 1.2em;}
        .value-redacted::after { content: "MASKED"; color: #888; position: absolute; top: 0; left: 0; right:0; bottom:0; text-align: center; font-size: 0.8em; font-family: sans-serif; letter-spacing: 1px; line-height: 1.2em; }

        .verified-view {
            background: white; padding: 20px; border: 1px solid #4CAF50; box-shadow: 0 0 15px rgba(76, 175, 80, 0.2); position: relative;
        }
        .verified-ribbon {
            position: absolute; top: 0; right: 0; background: #4CAF50; color: white; padding: 5px 15px; font-size: 0.8em; font-weight: bold; border-bottom-left-radius: 8px;
        }

    </style>
</head>
<body>

<div class="container">
    <h1 style="text-align: center; margin-bottom: 50px;">住民票の写し電子交付 PoC 選択的開示手順</h1>

    <!-- 1. Application -->
    <div class="timeline-step">
        <div class="timeline-line"></div>
        <div class="step-content">
            <h2>交付申請 <span class="actor">住民 &rarr; 発行者</span></h2>
            <div class="desc">
                住民は自身のFIDO公開鍵にJPKIで署名した住民票発行申請を行います。
            </div>
            <div class="code-block">POST /issue { applicant: "123...", key: "ECC-P256", sig: "JPKI" }</div>
        </div>
        <div class="step-visual">
            <!-- Visual: Paper Form -->
            ${renderApplication(flattened)}
        </div>
    </div>

    <!-- 2. Issuance -->
    <div class="timeline-step">
        <div class="timeline-line"></div>
        <div class="step-content">
            <h2>交付・発行 <span class="actor">発行者 &rarr; 住民</span></h2>
            <div class="desc">
                自治体は原本データ（すべての項目）と、鍵の紐付け証明（受理証）を発行します。
                住民の手元には、完全な状態の住民票が保存されます。
            </div>
            <div class="code-block" style="max-height: 250px;">
// Credential Issuance (mDoc + SD-JWT)
{
  "docType": "io.github.masanork.srn.credential.juminhyo",
  ...
}
            </div>
            <div style="margin-top: 20px;">
               ${renderAcceptance(flattened)}
            </div>
        </div>
        <div class="step-visual" style="display: block; margin-top: 20px; flex: 1; min-width: 0;">
            <div class="jumin-font" style="width: 100%; overflow-x: auto; border: 1px solid #ddd; background: white;">
                 ${renderJuminhyoTable(flattened, null, true)}
            </div>
        </div>
    </div>

    <!-- 3. Presentation Request -->
    <div class="timeline-step active">
        <div class="timeline-line"></div>
        <div class="step-content">
            <h2>同意・選択 <span class="actor">住民 &rarr; 提出先</span></h2>
            <div class="desc">
                提出先からの提示要求に対し、Walletは同意画面を表示します。
                要求された「氏名・生年月日・マイナンバー」のみが提供範囲として表示されます。<br>
                住民は求められた項目について開示範囲を確認し、求められている項目に加えて交付申請時に使用したマイナンバーカードと紐付いたFIDO秘密鍵を用いて署名（Binding Proofの提示）を行います。
            </div>
            <div class="code-block" style="max-height: 400px;">
// OID4VP Presentation Definition
{
  "id": "employment_onboarding",
  "input_descriptors": [
    {
      "id": "juminhyo_family",
      "purpose": "Collect family member MyNumbers for tax purposes.",
      "constraints": {
        "fields": [
          { "path": ["$.credentialSubject.世帯員_0_氏名"] },
          { "path": ["$.credentialSubject.世帯員_0_生年月日"] },
          { "path": ["$.credentialSubject.世帯員_0_個人番号"] },
          { "path": ["$.credentialSubject.世帯員_1_氏名...] },
          // ... (All family members)
        ]
      }
    },
    {
      "id": "binding_proof",
      "purpose": "Verify holder binding (proof of possession).",
      "constraints": {
        "fields": [
          { "path": ["$.cnf.jwk"] }
        ]
      }
    }
  ]
}
            </div>
        </div>
        <div class="step-visual">
             ${renderConsent(requestFields)}
        </div>
    </div>

    <!-- 4. Verification -->
    <div class="timeline-step active last-step" style="border-left-color: #4CAF50;">
        <div class="step-content">
            <h2>検証・閲覧 <span class="actor">提出先 View</span></h2>
            <div class="desc">
                提出先は受け取ったVPを検証・レンダリングします。
                選択しなかった項目はマスクされ、必要な情報だけが真正性を伴って表示されます。
            </div>
            <div class="verified-view jumin-font">
                <div class="verified-ribbon">✅ SIGNATURE VERIFIED</div>
                <div style="background: #e3f2fd; color: #0d47a1; padding: 10px; margin-bottom: 15px; border-radius: 4px; font-family: sans-serif; font-size: 0.9em; border: 1px solid #90caf9;">
                    <strong>提出先:</strong> ○×株式会社 総務部 御中<br>
                    <strong>利用目的:</strong> 入社手続（税・社会保険関係）に伴う扶養親族の個人番号収集
                </div>
                ${renderJuminhyoTable(flattened, requestFields, false)}
            </div>
        </div>
    </div>

</div>

</body>
</html>`;

    const outPath = path.resolve('work/juminhyo-full-demo.html');
    await fs.writeFile(outPath, html);
    console.log(`Generated Rich Lifecycle Demo: ${outPath} (${html.length} bytes)`);
}

async function main() {
    await initWasm();
    await runLifecycle();
}

main().catch(console.error);

