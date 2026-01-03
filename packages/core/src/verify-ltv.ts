import * as cheerio from 'cheerio';
import crypto from 'node:crypto';
import { verifyHybridVC, type VerificationResult } from './vc.js';
import { PrunableHashChain } from './phc.js';
import { verifyTimestamp } from './tsa_client.js';
import { type L1Manifest } from './weba-manifest.js';

export interface LtvVerificationResult {
    isValid: boolean;
    l4: { valid: boolean; error?: string };
    l3: { valid: boolean; length: number; pruned: boolean; error?: string };
    l2: VerificationResult;
    l1: { valid: boolean; errors: string[] };
    tsa: { valid: boolean; timestamp?: string; error?: string };
    revocation: { status: 'ok' | 'revoked' | 'unknown'; error?: string };
    hmp?: { valid: boolean; details: any[] };
    vc?: any; // The extracted L2 VC
}

export async function verifyWebALtv(html: string, options: { checkHmp?: boolean } = {}): Promise<LtvVerificationResult> {
    const $ = cheerio.load(html);

    // --- Extract Components ---
    const trustStoreScript = $('#weba-trust-store').html();
    const trustStore = trustStoreScript ? JSON.parse(trustStoreScript) : null;

    const phcScript = $('#weba-context-chain').html();
    const phcData = phcScript ? JSON.parse(phcScript) : null;

    const l4Script = $('#weba-container-signature').html();
    const l4Vc = l4Script ? JSON.parse(l4Script) : null;

    const manifestScript = $('script').filter((_, el) => {
        const txt = $(el).text();
        return txt.includes('window.__WEBA_MANIFEST');
    }).html();

    let manifest: L1Manifest | null = null;
    if (manifestScript) {
        const match = manifestScript.match(/window\.__WEBA_MANIFEST\s*=\s*(\{.*?\});/s);
        if (match) {
            try {
                manifest = JSON.parse(match[1]);
            } catch (e) {
                console.warn("Failed to parse manifest JSON", e);
            }
        }
    }

    // Extract L2 VC (JSON-LD)
    let l2Vc: any = null;
    const findVc = (obj: any) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
            obj.forEach(item => findVc(item));
            return;
        }
        if (obj.type && (Array.isArray(obj.type) ? obj.type.includes('VerifiableCredential') : obj.type === 'VerifiableCredential')) {
            l2Vc = obj;
        }
    };

    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const j = JSON.parse($(el).text());
            findVc(j);
        } catch { }
    });

    const result: LtvVerificationResult = {
        isValid: false,
        l4: { valid: false },
        l3: { valid: false, length: 0, pruned: false },
        l2: { isValid: false, checks: { ed25519: false, pqc: false, p256: false } },
        l1: { valid: false, errors: [] },
        tsa: { valid: false },
        revocation: { status: 'unknown' }
    };

    // --- L4 Verification (Container Integrity) ---
    if (l4Vc && l4Vc.credentialSubject?.containerHash) {
        // Reconstruct Placeholder EXACTLY as generated in LayoutManager.ts
        const l4Placeholder = `<script type="application/vnd.weba+container-signature" id="weba-container-signature">{"placeholder":true}</script>`;

        // Replace the signature block with the placeholder
        // Note: LayoutManager appends it at the end of body or end of string.
        // We use a regex to find the block.
        const sigBlockRegex = /<script type="application\/vnd\.weba\+container-signature" id="weba-container-signature">[\s\S]*?<\/script>/;
        const htmlWithPlaceholder = html.replace(sigBlockRegex, l4Placeholder);

        const calcHash = crypto.createHash('sha256').update(htmlWithPlaceholder).digest('hex');

        if (calcHash === l4Vc.credentialSubject.containerHash) {
            const didDocs = trustStore?.didDocuments ?
                Object.fromEntries(trustStore.didDocuments.map((d: any) => [d.id, d])) : {};

            const l4Verify = await verifyHybridVC(l4Vc, { didDocuments: didDocs });
            result.l4 = { valid: l4Verify.isValid };
            if (!l4Verify.isValid) result.l4.error = "L4 Signature Invalid";
        } else {
            result.l4.error = `Container Hash Mismatch (Calculated: ${calcHash}, Claimed: ${l4Vc.credentialSubject.containerHash})`;
        }
    } else {
        result.l4.error = "Missing L4 Signature Block";
    }

    // --- L3 Verification (History / PHC) ---
    if (phcData) {
        try {
            const phc = PrunableHashChain.fromJSON(phcData);
            if (phc.verify()) {
                result.l3 = {
                    valid: true,
                    length: phc.getLinks().length,
                    pruned: phcData.some((l: any) => l.event && l.event.pruned)
                };

                // Verify L3 commitment in L4
                if (l4Vc?.credentialSubject?.latestContextHash) {
                    const chainHash = crypto.createHash('sha256').update(JSON.stringify(phcData)).digest('hex');
                    if (chainHash !== l4Vc.credentialSubject.latestContextHash) {
                        result.l3.valid = false;
                        result.l3.error = "L3 Chain Hash does not match L4 commitment";
                    }
                }
            } else {
                result.l3.error = "PHC Integrity Check Failed";
            }
        } catch (e: any) {
            result.l3.error = "PHC Parse Error: " + e.message;
        }
    } else {
        result.l3.error = "Missing PHC Data";
    }

    // --- L2 Verification (Payload) ---
    if (l2Vc) {
        result.vc = l2Vc;
        const didDocs = trustStore?.didDocuments ?
            Object.fromEntries(trustStore.didDocuments.map((d: any) => [d.id, d])) : {};

        result.l2 = await verifyHybridVC(l2Vc, { didDocuments: didDocs });
    } else {
        result.l2.error = "Missing L2 VC";
    }

    // --- L1 Verification (Structure) ---
    if (manifest) {
        // Check if structure blob exists in manifest
        const structureBlob = manifest.blobs.find(b => b.id === 'weba-structure');
        if (structureBlob) {
            result.l1.valid = true;
        } else {
            result.l1.errors.push("Missing 'weba-structure' in manifest");
        }
        // Ideally we would validate L2 content against L1 schema here
    } else {
        result.l1.errors.push("Missing Manifest");
    }

    // --- TSA Verification ---
    if (trustStore?.trustedTimestamps && Array.isArray(trustStore.trustedTimestamps) && l2Vc?.proof?.[0]?.proofValue) {
        const sigValue = l2Vc.proof[0].proofValue;
        const sigBytes = new TextEncoder().encode(sigValue);

        for (const tokenB64 of trustStore.trustedTimestamps) {
            try {
                const token = Buffer.from(tokenB64, 'base64');
                const time = await verifyTimestamp(token.buffer as ArrayBuffer, sigBytes);
                result.tsa.valid = true;
                result.tsa.timestamp = time.toISOString();
                break;
            } catch (e: any) {
                // Try next token
                result.tsa.error = e.message;
            }
        }
    }

    // --- HMP Verification ---
    if (options.checkHmp && l2Vc) {
        const details: any[] = [];
        let hmpValid = true;

        $('[data-weba-field]').each((_, el) => {
            const field = $(el).attr('data-weba-field');
            if (!field) return;
            const htmlValue = $(el).text().trim();

            // Resolve value from VC
            let jsonValue: string | null = null;
            try {
                const val = field.split('.').reduce((acc, part) => acc && acc[part], l2Vc);
                jsonValue = (val !== undefined && val !== null) ? String(val) : null;
            } catch { }

            const match = htmlValue === jsonValue;
            if (!match) hmpValid = false;
            details.push({ field, htmlValue, jsonValue: jsonValue || '(missing)', match });
        });

        if (l2Vc.credentialSubject?.contentDigest) {
            const plainText = $('#weba-payload .weba-content').text().trim();
            const actualDigest = crypto.createHash('sha256').update(plainText).digest('hex');
            const digestMatch = actualDigest === l2Vc.credentialSubject.contentDigest;
            if (!digestMatch) hmpValid = false;
            details.push({
                field: 'contentDigest',
                htmlValue: actualDigest.substring(0, 8) + '...',
                jsonValue: l2Vc.credentialSubject.contentDigest.substring(0, 8) + '...',
                match: digestMatch
            });
        }

        result.hmp = { valid: hmpValid, details };
    }

    // Overall Validity
    result.isValid = result.l4.valid && result.l3.valid && result.l2.isValid;
    if (options.checkHmp && result.hmp && !result.hmp.valid) {
        result.isValid = false;
    }

    return result;
}

