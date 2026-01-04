
import fs from 'fs-extra';
import path from 'path';
import { createMDocFromJuminhyo } from './juminhyo_mdoc';
import { IdentityManager } from '../../src/ssg/IdentityManager';
import { getAbsolutePaths, loadConfig, initWasm, encodeDidKey, hexToBytes } from './src/index';
import { FontProcessor } from '../../src/ssg/FontProcessor';
import { ManifestManager } from '../../src/ssg/ManifestManager';

const DEMOYEAR = 2026;

async function bundleClientRenderer() {
    const res = await Bun.build({
        entrypoints: ['packages/core/src/client/cbor_renderer.ts'],
        minify: true,
        plugins: [],
        define: {
            global: 'window',
            process: 'window.process',
        },
    });
    if (!res.success) {
        throw new Error("Bundle failed: " + res.logs.map(l => l.message).join('\n'));
    }
    return await res.outputs[0].text();
}

export async function createCborDoc(outputPath: string) {
    console.log("Generating CBOR Rendering PoC...");
    await initWasm();

    const config = await loadConfig();
    const { DIST_DIR, DATA_DIR } = getAbsolutePaths(config); // Use config paths

    // Setup Identity (Reuse or Dummy)
    const idManager = new IdentityManager(
        config.identity.domain,
        config.identity.path,
        DATA_DIR,
        DIST_DIR
    );
    await idManager.init();

    // 1. Generate mDoc (Same as before)
    const docData: any = {
        certificateTitle: "住民票の写し",
        address: "東京都千代田区霞が関１丁目２番３号",
        householder: "日本　太郎",
        members: [
            {
                name: "日本　太郎",
                kana: "ニッポン　タロウ",
                birthDate: "1960-01-01",
                gender: "男",
                domiciles: ["東京都千代田区霞が関１丁目", "日本　太郎"],
                relationship: "世帯主",
                code: "12345678901",
                becameResidentDate: "2000-01-01",
                addressSetDate: "2000-01-01",
                notificationDate: "2000-01-01",
                prevAddress: "千葉県千葉市中央区",
                maidenName: "鈴木",
                maidenKana: "スズキ",
                individualNumber: "123456789012",
                remarks: ["住民票コード：12345678901", "", "", ""]
            }
            // Add more members if needed for demo
        ]
    };

    const issuerDid = idManager.siteDid || encodeDidKey(hexToBytes(idManager.currentKeys.ed25519.publicKey), 'ed25519');

    // To properly simulate mDoc, we need the raw bytes.
    // juminhyo_mdoc.ts returns a CBOR-encoded object (Map). 
    // We need to encode the whole MdocStructure to bytes.
    const { mDoc } = await createMDocFromJuminhyo(docData, idManager.currentKeys, issuerDid);

    // We need to import 'encode' from cbor-x here in Node context
    const { encode } = await import('cbor-x');
    const mDocBytes = encode(mDoc); // Documents array
    const mDocBase64 = Buffer.from(mDocBytes).toString('base64');

    // 2. Prepare Font (Subset)
    // For this PoC, we still need the font to render the content properly.
    // We can reuse FontProcessor logic.
    // Limitation: Since we are rendering Client-side, we ideally need a font that covers ALL POTENTIAL CHARACTERS.
    // But for a fixed "PoC" file, we can cheat and subset based on the known content in `docData`.
    // Let's create a dummy HTML just for font subsetting.
    const knownText = JSON.stringify(docData) + "住民票の写し等の電子交付";
    const fontProcessor = new FontProcessor(config, process.cwd());
    await fontProcessor.init();

    const manifestManager = new ManifestManager(path.dirname(outputPath));

    // Generate subset font CSS (and woff2 files)
    const { fontCss, safeFontFamilies } = await fontProcessor.processPageFonts(
        `<div id="cbor-content">${knownText}</div>`, // Dummy HTML for scanner
        { title: 'Juminhyo PoC' },
        config,
        idManager.currentKeys,
        issuerDid,
        idManager.buildId,
        [],
        manifestManager
    );

    // 3. Bundle Client Script
    const clientScript = await bundleClientRenderer();

    // 4. Construct HTML
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>住民票の写し (CBOR Render PoC)</title>
    <meta name="description" content="Client-side rendering of ISO 18013-5 mDoc (CBOR)">
    <style>
        /* Base styles from juminhyo.css (simplified) */
        :root {
            --paper-width: 210mm;
            --paper-height: 297mm;
        }
        body {
            background: #f0f0f0;
            margin: 0;
            padding: 20px;
            font-family: ${safeFontFamilies.join(', ')}, serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .sheet {
            width: var(--paper-width);
            min-height: var(--paper-height);
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 50px; /* Approximate margin */
            box-sizing: border-box;
            position: relative;
        }
        .juminhyo-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px; /* 10.5pt approx */
        }
        .cell {
            border: 1px solid #000;
            vertical-align: middle;
            padding: 0 4px; /* padding-inline-start/end: 1mm approx */
        }
        .no-border { border: none; }
        .label-cell { text-align: left; }
        .value-cell { text-align: left; }
        .number-cell { text-align: center; vertical-align: top; padding-top: 10px; }
        .title-cell { 
            font-size: 24px; 
            font-weight: bold; 
            text-align: center; 
            border-bottom: 2px solid #000 !important; 
            padding-bottom: 5px;
        }
        .label-text { display: flex; justify-content: space-between; }
        
        /* Debug / Status */
        #status {
            margin-bottom: 10px;
            padding: 10px;
            background: #e0f7fa;
            border-radius: 4px;
            font-family: sans-serif;
            font-size: 14px;
        }
    </style>
    ${fontCss}
    <script>
        // Inject mDoc Data
        window.MDOC_BASE64 = "${mDocBase64}";
    </script>
</head>
<body>
    <div id="status">
        Loading... (Client-side Rendering from CBOR)
    </div>

    <div class="sheet">
        <div id="sheet-content"></div>
    </div>

    <script>
        ${clientScript}

        // Trigger Render
        window.addEventListener('DOMContentLoaded', () => {
            const status = document.getElementById('status');
            try {
                window.renderMdoc(window.MDOC_BASE64);
                status.textContent = "✅ Rendered successfully from CBOR payload (" + window.MDOC_BASE64.length + " bytes encoded)";
                status.style.background = "#e8f5e9";
            } catch (e) {
                status.textContent = "❌ Rendering Error: " + e.message;
                status.style.background = "#ffebee";
            }
        });
    </script>
</body>
</html>`;

    await fs.writeFile(outputPath, html);
    console.log(`Generated: ${outputPath} (${(html.length / 1024).toFixed(2)} KB)`);
}

// CLI Execution
if (import.meta.main) {
    const outFile = process.argv[2] || 'work/juminhyo-cbor.html';
    createCborDoc(outFile).catch(console.error);
}
