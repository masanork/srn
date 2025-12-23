import fs from 'fs-extra';
import path from 'path';
// @ts-ignore
import wawoff2 from 'wawoff2';

async function checkFont(htmlPath: string) {
    const html = await fs.readFile(htmlPath, 'utf8');
    const match = html.match(/url\('data:font\/woff2;base64,([^']+)'\)/);

    if (!match) {
        console.log("❌ No WOFF2 font found in HTML.");
        return;
    }

    console.log("✅ WOFF2 font found.");
    const buffer = Buffer.from(match[1], 'base64');
    const sfnt = await wawoff2.decompress(buffer);
    console.log(`  Decompressed size: ${sfnt.length} bytes`);
    const hex = Buffer.from(sfnt.slice(0, 16)).toString('hex');
    console.log(`  First 16 bytes: ${hex}`);
    const view = new DataView(sfnt.buffer, sfnt.byteOffset, sfnt.byteLength);

    const numTables = view.getUint16(4, false);
    console.log(`  Number of tables: ${numTables}`);

    let foundSRNC = false;
    for (let i = 0; i < numTables; i++) {
        const p = 12 + i * 16;
        const tag = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3));
        const length = view.getUint32(p + 12, false);
        console.log(`  - Table: ${tag}, Length: ${length}`);
        if (tag === 'SRNC') foundSRNC = true;
    }

    if (foundSRNC) {
        console.log("🚀 Success! SRNC table (provenance) is embedded in the font.");
    } else {
        console.log("❌ Error: SRNC table not found.");
    }
}

checkFont('./dist/my-blog/index.html');
