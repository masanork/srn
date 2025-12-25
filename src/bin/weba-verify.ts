
import { verifyWebA } from '../verify-core.ts';
import fs from 'fs-extra';
import path from 'path';

/**
 * Web/A CLI Validator
 * Usage: bun run src/bin/weba-verify.ts [file|url] [--hmp] [--json]
 */

async function main() {
    const args = process.argv.slice(2);
    const target = args.find(arg => !arg.startsWith('-'));
    const checkHmp = args.includes('--hmp');
    const outputJson = args.includes('--json');
    const didPathIndex = args.indexOf('--did');
    const didPath = didPathIndex !== -1 ? args[didPathIndex + 1] : null;

    if (!target) {
        console.log(`
Web/A CLI Validator
Usage: weba-verify [file|url] [options]

Options:
  --hmp        Enable Human-Machine Parity check (compares HTML content with data)
  --json       Output result in JSON format for machines/AI agents
  --did [path] Path to a local DID document (did.json) to use for key resolution
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

    const trustedKeys: Record<string, string> = {};
    if (didPath) {
        try {
            const didDoc = await fs.readJson(path.resolve(process.cwd(), didPath));
            if (Array.isArray(didDoc.verificationMethod)) {
                didDoc.verificationMethod.forEach((vm: any) => {
                    if (vm.id && vm.publicKeyHex) {
                        trustedKeys[vm.id] = vm.publicKeyHex;
                    }
                });
            }
        } catch (err: any) {
            console.error(`Error loading DID document: ${err.message}`);
            process.exit(1);
        }
    }

    const result = await verifyWebA(htmlContent, { checkHmp, trustedKeys });

    if (outputJson) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.isValid ? 0 : 1);
    }

    // Human Readable Output
    console.log('\n--- Web/A Verification Result ---');
    console.log(`Target: ${target}`);

    if (result.metadata) {
        console.log(`Title:  ${result.metadata.title || 'N/A'}`);
        console.log(`Author: ${result.metadata.author || 'N/A'}`);
        console.log(`Date:   ${result.metadata.date || 'N/A'}`);
    }
    console.log('---------------------------------');

    if (result.isValid) {
        console.log('\x1b[32m✅ VALID: Signatures are correct.\x1b[0m');
    } else {
        console.log('\x1b[31m❌ INVALID: Verification failed.\x1b[0m');
        if (result.error) console.log(`Error: ${result.error}`);
    }

    console.log(`\nProofs:`);
    console.log(`- Ed25519 (Classic):      ${result.checks.ed25519 ? 'Pass' : 'Fail'}`);
    console.log(`- ML-DSA-44 (Quantum):    ${result.checks.pqc ? 'Pass' : 'Fail'}`);

    if (checkHmp && result.hmpResult) {
        console.log(`\nHMP (Human-Machine Parity):`);
        if (result.hmpResult.isValid) {
            console.log('\x1b[32m  ✅ Consistent: HTML matches signed data.\x1b[0m');
        } else {
            console.log('\x1b[31m  ❌ Inconsistent: HTML/Data divergence detected.\x1b[0m');
        }

        console.log('  Details:');
        result.hmpResult.details.forEach(d => {
            const color = d.match ? '\x1b[32m' : '\x1b[31m';
            console.log(`    [${color}${d.match ? 'OK' : 'FAIL'}\x1b[0m] ${d.field}: "${d.htmlValue}" vs "${d.jsonValue}"`);
        });
    }

    process.exit(result.isValid && (!checkHmp || result.hmpResult?.isValid) ? 0 : 1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
