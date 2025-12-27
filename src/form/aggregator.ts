#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as csv from 'fast-csv';
import { decryptLayer2 } from '../core/l2crypto';
import { createMlKem768Provider } from '../core/pqc';

export type L2KeyFile = {
    recipient_kid: string;
    recipient_x25519_private: string; // base64url
    recipient_pqc_private?: string; // base64url
    recipient_pqc_kem?: string;
};

function fromBase64Url(str: string): Uint8Array {
    return Buffer.from(str, 'base64url');
}

export function extractJsonLdFromHtml(html: string): any | null {
    const $ = cheerio.load(html);
    let scriptContent = $('#data-layer').html();
    if (!scriptContent) {
        scriptContent = $('script[type="application/ld+json"]').html();
    }
    if (!scriptContent) return null;
    try {
        return JSON.parse(scriptContent);
    } catch {
        return null;
    }
}

export function extractL2EnvelopeFromHtml(html: string): any | null {
    const $ = cheerio.load(html);
    const l2EnvelopeText = $('#weba-l2-envelope').html();
    if (!l2EnvelopeText) return null;
    try {
        return JSON.parse(l2EnvelopeText);
    } catch {
        return null;
    }
}

export async function extractPlainFromHtml(
    html: string,
    l2Keys?: L2KeyFile | null,
): Promise<{ plain?: any; sig?: any; source: 'l2' | 'jsonld' | null }> {
    const l2Envelope = extractL2EnvelopeFromHtml(html);
    if (l2Envelope && l2Keys) {
        if (l2Keys.recipient_kid && l2Envelope.layer2?.recipient && l2Keys.recipient_kid !== l2Envelope.layer2.recipient) {
            throw new Error(`recipient_kid mismatch (${l2Envelope.layer2.recipient})`);
        }
        const pqc =
            l2Keys.recipient_pqc_private && l2Keys.recipient_pqc_kem === 'ML-KEM-768'
                ? {
                    kem: createMlKem768Provider(),
                    recipientPrivateKey: fromBase64Url(l2Keys.recipient_pqc_private),
                }
                : undefined;
        const payload = await decryptLayer2(
            l2Envelope,
            fromBase64Url(l2Keys.recipient_x25519_private),
            pqc ? { pqc } : undefined
        );
        const plain = (payload as any).layer2_plain ?? payload;
        const sig = (payload as any).layer2_sig;
        return { plain, sig, source: 'l2' };
    }
    const jsonLd = extractJsonLdFromHtml(html);
    if (jsonLd) return { plain: jsonLd, source: 'jsonld' };
    return { source: null };
}

export function flattenForCsv(obj: Record<string, any>): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    const walk = (value: any, prefix: string) => {
        if (value === null || value === undefined) {
            out[prefix] = null;
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((entry, idx) => {
                walk(entry, prefix ? `${prefix}[${idx}]` : `[${idx}]`);
            });
            return;
        }
        if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => {
                const next = prefix ? `${prefix}.${k}` : k;
                walk(v, next);
            });
            return;
        }
        out[prefix] = value;
    };
    walk(obj, '');
    if ('' in out) {
        delete out[''];
    }
    return out;
}

export function buildRowFromPlain(params: {
    plain: any;
    filename: string;
    includeJson?: boolean;
    sig?: any;
    omitKey?: (key: string) => boolean;
}): { row: any; keys: Set<string> } {
    const row: any = { '_filename': params.filename };
    const keys = new Set<string>();
    if (params.includeJson) {
        keys.add('_json');
        row['_json'] = JSON.stringify(params.plain);
    }
    const flat = flattenForCsv(params.plain || {});
    for (const key of Object.keys(flat)) {
        if (params.omitKey && params.omitKey(key)) continue;
        keys.add(key);
        row[key] = flat[key];
    }
    if (params.sig) {
        keys.add('_l2_sig');
        row['_l2_sig'] = JSON.stringify(params.sig);
    }
    return { row, keys };
}

program
    .name('weba-aggregator')
    .description('Aggregate JSON-LD data from multiple Web/A HTML files')
    .argument('<directory>', 'Directory containing Web/A HTML files')
    .option('-o, --output <file>', 'Output CSV file path', 'output.csv')
    .option('--l2-keys <file>', 'Recipient key file for L2 decryption (JSON)')
    .option('--include-json', 'Include raw JSON payload column')
    .action(async (directory, options) => {
        const dirPath = path.resolve(directory);
        if (!fs.existsSync(dirPath)) {
            console.error(`Error: Directory '${dirPath}' does not exist.`);
            process.exit(1);
        }

        let l2Keys: L2KeyFile | null = null;
        if (options.l2Keys) {
            const raw = fs.readFileSync(path.resolve(options.l2Keys), 'utf-8');
            l2Keys = JSON.parse(raw) as L2KeyFile;
        }

        const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.html'));
        console.log(`Found ${files.length} HTML files in ${dirPath}`);

        const aggregatedData: any[] = [];
        const allKeys = new Set<string>(['_filename']);

        let processedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const extracted = await extractPlainFromHtml(content, l2Keys);
                if (extracted.source === 'l2' && extracted.plain) {
                    const built = buildRowFromPlain({
                        plain: extracted.plain,
                        filename: file,
                        includeJson: options.includeJson,
                        sig: extracted.sig,
                    });
                    built.keys.forEach((key) => allKeys.add(key));
                    const row = built.row;
                    aggregatedData.push(row);
                    processedCount++;
                    continue;
                }

                if (extracted.source === 'jsonld' && extracted.plain) {
                    const json = extracted.plain;
                    const built = buildRowFromPlain({
                        plain: json,
                        filename: file,
                        includeJson: options.includeJson,
                        omitKey: (key) => key.startsWith('@'),
                    });
                    built.keys.forEach((key) => allKeys.add(key));
                    const row = built.row;
                    aggregatedData.push(row);
                    processedCount++;
                } else {
                    console.warn(`Warning: No JSON-LD found in ${file}`);
                }
            } catch (e: any) {
                console.error(`Error processing ${file}: ${e.message}`);
                errorCount++;
            }
        }

        // Write CSV
        const sortedKeys = Array.from(allKeys).sort((a, b) => {
            if (a === '_filename') return -1;
            if (b === '_filename') return 1;
            return a.localeCompare(b);
        });

        const csvStream = csv.format({ headers: sortedKeys, writeBOM: true });
        const writableStream = fs.createWriteStream(options.output);

        csvStream.pipe(writableStream).on('end', () => {
            console.log(`Successfully wrote ${processedCount} records to ${options.output}`);
            if (errorCount > 0) console.log(`(Failed to process ${errorCount} files)`);
        });

        aggregatedData.forEach(row => csvStream.write(row));
        csvStream.end();
    });

if (import.meta.main) {
    program.parse();
}
