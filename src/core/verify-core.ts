
import * as cheerio from 'cheerio';
import { verifyHybridVC } from './vc.ts';
import type { VerificationResult } from './vc.ts';
import crypto from 'node:crypto';
import { resolveDidDocument } from './did.ts';
import type { DidDocument } from './did.ts';

export interface WebAVerificationResult extends VerificationResult {
    hmpResult?: {
        isValid: boolean;
        details: {
            field: string;
            htmlValue: string;
            jsonValue: string;
            match: boolean;
        }[];
    };
    metadata?: {
        title?: string;
        author?: string;
        date?: string;
    };
}


/**
 * Core verification logic for Web/A documents.
 */
export async function verifyWebA(
    htmlContent: string,
    options: {
        checkHmp?: boolean;
        trustedKeys?: Record<string, string>;
        didDocument?: DidDocument;
        didResolver?: typeof resolveDidDocument;
    } = {}
): Promise<WebAVerificationResult> {
    const $ = cheerio.load(htmlContent);

    // 1. Extract JSON-LD VC
    const jsonLdScripts = $('script[type="application/ld+json"]');
    if (jsonLdScripts.length === 0) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false, p256: false },
            error: "No JSON-LD VC found in HTML document."
        };
    }

    let vc: any = null;
    jsonLdScripts.each((_, script) => {
        try {
            const json = JSON.parse($(script).text());
            if (json.type && (json.type.includes('VerifiableCredential') || json.type.includes('WebADocument'))) {
                vc = json;
                return false; // found it
            }
        } catch (e) {
            // skip invalid json
        }
    });

    if (!vc) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false, p256: false },
            error: "No valid Web/A Verifiable Credential found in JSON-LD scripts."
        };
    }

    // 2. Verify Signatures
    const trustedKeys = { ...(options.trustedKeys || {}) };

    const didDocument = options.didDocument
        ?? (vc.issuer ? await resolveDidDocument(vc.issuer) : null);
    const verifyOptions = {
        trustedKeys,
        didDocument: didDocument || undefined,
        didResolver: options.didResolver ?? resolveDidDocument
    };
    const result = await verifyHybridVC(vc, verifyOptions);
    const webaResult: WebAVerificationResult = { ...result };

    if (!result.isValid) return webaResult;

    // 3. Extract Metadata for reporting
    webaResult.metadata = {
        title: vc.name || vc.credentialSubject?.name,
        author: vc.author?.name || vc.credentialSubject?.author,
        date: vc.datePublished || vc.credentialSubject?.date
    };

    // 4. HMP (Human-Machine Parity) Check
    if (options.checkHmp) {
        const hmpDetails: any[] = [];
        let hmpValid = true;

        // Check fields with data-weba-field attribute
        $('[data-weba-field]').each((_, el) => {
            const field = $(el).attr('data-weba-field');
            if (!field) return;

            const htmlValue = $(el).text().trim();

            // Resolve JSON-LD value (simple dot notation)
            const jsonValue = resolveValue(vc, field);

            const match = htmlValue === jsonValue;
            if (!match) hmpValid = false;

            hmpDetails.push({
                field,
                htmlValue,
                jsonValue: jsonValue || '(not found in JSON)',
                match
            });
        });

        // Content Digest Check
        if (vc.credentialSubject?.contentDigest) {
            const plainText = $('#weba-payload .weba-content').text().trim();
            const actualDigest = crypto.createHash('sha256').update(plainText).digest('hex');
            const digestMatch = actualDigest === vc.credentialSubject.contentDigest;

            if (!digestMatch) hmpValid = false;
            hmpDetails.push({
                field: 'contentDigest',
                htmlValue: actualDigest.slice(0, 8) + '...',
                jsonValue: vc.credentialSubject.contentDigest.slice(0, 8) + '...',
                match: digestMatch
            });
        }

        webaResult.hmpResult = {
            isValid: hmpValid,
            details: hmpDetails
        };
    }

    return webaResult;
}

/**
 * Simple helper to resolve nested properties in an object.
 */
function resolveValue(obj: any, path: string): string | null {
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        if (value === undefined || value === null) return null;
        return String(value);
    } catch (e) {
        return null;
    }
}
