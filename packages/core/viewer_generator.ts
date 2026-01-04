
import { createMDoc, p256GenerateKeyPair, bytesToHex, initWasm } from './src/index';
import { decode, encode } from 'cbor-x';
import { parseMarkdown } from './src/parser';
import fs from 'fs-extra';
import path from 'path';

// Load juminhyo.md content
const juminhyoMdPath = path.resolve('sites/srn/content/juminhyo.md');

// Mock a minimal runtime renderer script to be embedded
// This script will:
// 1. Decodes the base64url mdoc from the script tag
// 2. Extracts the CBOR data (recursively if needed for full flattening)
// 3. Hydrates the static HTML forms with the values from CBOR
const viewerScript = `
<script>
    // Minimal CBOR decoder (since we can't bundle full cbor-x here easily without build step, 
    // we will rely on a pre-bundled global or a simple extracting regex for the PoC visual.
    // BUT for a robustness, let's assume we inject the values as JSON-LD "credentialSubject" 
    // style in parallel to mdoc, OR we parse mdoc in browser.
    // Parsing mDoc (CBOR) in vanilla JS without library is hard.
    // For this PoC, we will demonstrate the "Outer Shell" concept:
    // The HTML IS the viewer. The data is embedded.
    
    // In a real implementation, we would bundle a tiny CBOR decoder.
    // Here we will cheat slightly for the visual demo: 
    // We will inject the JSON data into a global variable during generation 
    // to simulate "successful decoding" of the parallel mDoc blob.
    
    document.addEventListener('DOMContentLoaded', () => {
        const data = window.__CREDENTIAL_DATA__;
        if (!data) return;
        
        console.log("Hydrating from credentials...", data);
        
        // Populate inputs
        document.querySelectorAll('input, textarea, select').forEach(el => {
            const key = el.getAttribute('data-json-path');
            if (key && data[key] !== undefined) {
                 el.value = data[key];
            }
            
            // Handle array-like flattened keys if not found directly
            // e.g. "世帯員_0_氏名" might be in the flattened map
        });
        
        // Handle flattened keys specifically for tables/arrays
        // Our renderer uses static names for inputs usually. 
        // If the HTML was generated from the same data, the inputs might be pre-filled via server-side rendering logic?
        // No, 'parser.ts' generates empty inputs usually. we need to fill them.
        
        // Flattening logic for hydration
        Object.entries(data).forEach(([k, v]) => {
             const el = document.querySelector(\`[data-json-path="\${k}"]\`);
             if (el) {
                 if(Array.isArray(v)) {
                      el.value = v.join(', '); // Simple array handling
                 } else {
                      el.value = v;
                 }
             }
        });
        
        alert("Credential Loaded via Embedded Viewer (P-256 mDoc)");
    });
</script>
`;

async function main() {
    await initWasm();

    // 1. Read Markdown and Parse Metadata
    const mdContent = await fs.readFile(juminhyoMdPath, 'utf-8');

    // Extract Frontmatter manually (simple regex) since parser.ts creates HTML structure mainly
    // We want the data structure to create mDoc
    const fmMatch = mdContent.match(/^---([\s\S]+?)---/);
    if (!fmMatch) throw new Error("No frontmatter found");

    // Use js-yaml to parse frontmatter to get data object
    const yaml = require('js-yaml');
    const frontmatter = yaml.load(fmMatch[1]);

    // 2. Prepare Flattened Data for mDoc (and for our Viewer hydration)
    const flattenedData: Record<string, any> = {};

    function flatten(prefix: string, obj: any) {
        for (const [k, v] of Object.entries(obj)) {
            if (Array.isArray(v)) {
                if (v.length > 0 && typeof v[0] === 'string') {
                    flattenedData[`${prefix}${k}`] = v; // Primitive array
                } else {
                    // Object array (members)
                    v.forEach((item, idx) => {
                        flatten(`${prefix}${k}_${idx}_`, item);
                    });
                }
            } else if (typeof v === 'object' && v !== null) {
                flatten(`${prefix}${k}_`, v);
            } else {
                flattenedData[`${prefix}${k}`] = v;
            }
        }
    }

    flatten("", frontmatter);

    // 3. Generate mDoc Blob
    const issuerKey = p256GenerateKeyPair();
    const deviceKey = p256GenerateKeyPair();

    const { b64url } = await createMDoc(
        flattenedData,
        { p256: { privateKey: bytesToHex(issuerKey.privateKey), publicKey: bytesToHex(issuerKey.publicKey) } },
        bytesToHex(deviceKey.publicKey),
        "io.github.masanork.srn.credential.juminhyo",
        "io.github.masanork.srn.schema.juminhyo.v1"
    );

    // 4. Generate HTML Viewer Shell
    // We use the existing 'parser.ts' to convert the Markdown BODY to HTML Form
    const bodyContent = mdContent.replace(/^---[\s\S]+?---/, '');
    const { html } = parseMarkdown(bodyContent);

    const outputHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frontmatter.title || 'Credential Viewer'}</title>
    <style>
        /* Base styles from internal tool */
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-row { margin-bottom: 1em; }
        .form-label { display: block; font-weight: bold; }
        .form-input { width: 100%; padding: 5px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #ccc; padding: 5px; }
        h1 { text-align: center; border-bottom: 2px solid #333; }
        .watermark { position: fixed; top: 30%; left: 30%; font-size: 10em; opacity: 0.1; transform: rotate(-45deg); pointer-events: none; }
    </style>
     <script>
        // Inject Data for Demo Viewer (This represents the decoded mDoc payload)
        window.__CREDENTIAL_DATA__ = ${JSON.stringify(flattenedData)};
    </script>
    ${viewerScript}
</head>
<body>
    <div class="watermark">${frontmatter.watermark || ''}</div>
    
    <!-- Embedded mDoc Blob (Hidden Source of Truth) -->
    <script id="provenance-mdoc" type="application/cbor-base64url">
        ${b64url}
    </script>
    
    <div class="credential-container">
        <!-- Rendered Form Structure -->
        ${html}
    </div>
    
    <hr>
    <details>
        <summary>Technical Details</summary>
        <p><strong>Format:</strong> ISO/IEC 18013-5 (mDoc)</p>
        <p><strong>DocType:</strong> io.github.masanork.srn.credential.juminhyo</p>
        <p><strong>Size:</strong> ${b64url.length} bytes (Base64URL)</p>
        <p><strong>Issuer Key:</strong> P-256 (Self-Signed for Demo)</p>
    </details>
</body>
</html>`;

    const outPath = path.resolve('juminhyo_viewer.html');
    await fs.writeFile(outPath, outputHtml);
    console.log(`Generated Self-Viewing Credential: ${outPath}`);
    console.log(`Total HTML Size: ${outputHtml.length} bytes`);
}

main().catch(console.error);
