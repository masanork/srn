import { verifyWebALtv, initWasm } from "@srn/core";
import fs from 'fs-extra';
import path from 'path';

/**
 * Web/A CLI Validator (LTV Aware)
 * Usage: bun run src/bin/weba-verify.ts [file|url] [--hmp] [--json]
 */

async function main() {
    await initWasm();

    const args = process.argv.slice(2);
    const target = args.find(arg => !arg.startsWith('-'));
    const checkHmp = args.includes('--hmp');
    const outputJson = args.includes('--json');

    if (!target) {
        console.log(`
Web/A CLI Validator (LTV Edition)
Usage: weba-verify [file|url] [options]

Options:
  --hmp        Enable Human-Machine Parity check
  --json       Output result in JSON format
`);
        process.exit(0);
    }

    let htmlContent = '';

    try {
        if (target.startsWith('http://') || target.startsWith('https://')) {
            const resp = await fetch(target);
            if (!resp.ok) throw new Error(`Failed to fetch URL: ${resp.statusText}`);
            htmlContent = await resp.text();
        } else {
            const filePath = path.resolve(process.cwd(), target);
            if (!await fs.pathExists(filePath)) throw new Error(`File not found: ${target}`);
            htmlContent = await fs.readFile(filePath, 'utf-8');
        }
    } catch (err: any) {
        console.error(`Error loading target: ${err.message}`);
        process.exit(1);
    }

    const result = await verifyWebALtv(htmlContent, { checkHmp });

    if (outputJson) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.isValid ? 0 : 1);
    }

    // Human Readable Output
    console.log('\n=====================================');
    console.log(' Web/A LTV Verification Report');
    console.log('=====================================');
    console.log(`Target: ${target}`);
    console.log('');

    // L4
    const l4Icon = result.l4.valid ? '✅' : '❌';
    console.log(`[L4] Container Integrity: ${l4Icon} ${result.l4.valid ? 'VALID' : 'INVALID'}`);
    if (result.l4.error) console.log(`     Error: ${result.l4.error}`);

    // L3
    const l3Icon = result.l3.valid ? '✅' : '❌';
    console.log(`[L3] Context History:    ${l3Icon} ${result.l3.valid ? 'VALID' : 'INVALID'}`);
    console.log(`     Chain Length: ${result.l3.length} (Pruned: ${result.l3.pruned})`);
    if (result.l3.error) console.log(`     Error: ${result.l3.error}`);

    // L2
    const l2Icon = result.l2.isValid ? '✅' : '❌';
    console.log(`[L2] Payload Signature:  ${l2Icon} ${result.l2.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`     Ed25519: ${result.l2.checks.ed25519 ? 'Pass' : 'Fail'}`);
    console.log(`     ML-DSA:  ${result.l2.checks.pqc ? 'Pass' : 'Fail'}`);

    // L1
    const l1Icon = result.l1.valid ? '✅' : '⚠️';
    console.log(`[L1] Schema/Structure:   ${l1Icon} ${result.l1.valid ? 'VALID' : 'WARNING'}`);
    if (result.l1.errors.length) result.l1.errors.forEach(e => console.log(`     Warning: ${e}`));

    // TSA
    const tsaIcon = result.tsa.valid ? '✅' : '⚠️';
    console.log(`[TSA] Timestamp:         ${tsaIcon} ${result.tsa.valid ? 'VALID' : 'NONE'}`);
    if (result.tsa.timestamp) console.log(`     Sealed At: \x1b[1m${result.tsa.timestamp}\x1b[0m`);
    if (result.tsa.error) console.log(`     Error: ${result.tsa.error}`);

    // HMP
    if (checkHmp && result.hmp) {
        const hmpIcon = result.hmp.valid ? '✅' : '❌';
        console.log(`[HMP] Human-Machine Parity: ${hmpIcon} ${result.hmp.valid ? 'VALID' : 'INVALID'}`);
        result.hmp.details.forEach(d => {
            const mark = d.match ? 'OK' : 'FAIL';
            const color = d.match ? '\x1b[32m' : '\x1b[31m';
            console.log(`     [${color}${mark}\x1b[0m] ${d.field}: ${d.htmlValue} vs ${d.jsonValue}`);
        });
    }

    console.log('-------------------------------------');
    if (result.isValid) {
        console.log('\x1b[32mFINAL RESULT: PASS\x1b[0m');
    } else {
        console.log('\x1b[31mFINAL RESULT: FAIL\x1b[0m');
    }
    console.log('=====================================');

    process.exit(result.isValid ? 0 : 1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});