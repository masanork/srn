
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';

import { articleLayout } from './layouts/article.js';
import { blogLayout } from './layouts/blog.js';
import { formLayout, formReportLayout } from './layouts/form.js';
import { verifierLayout } from './layouts/verifier.js';
import { buildJuminhyoJsonLd, juminhyoLayout } from './layouts/juminhyo.js';
import type { IdentityManager } from './IdentityManager.ts';

export interface LayoutContext {
    data: any;
    content: string;
    htmlContent: string;
    fontCss: string;
    safeFontFamilies: string[];
    allPages: any[];
    idManager: IdentityManager;
    distDir: string;
    relPath: string;
}

export class LayoutManager {
    async render(ctx: LayoutContext): Promise<{ html: string, vc?: any }> {
        const { data, content, htmlContent, fontCss, safeFontFamilies, allPages, idManager, distDir, relPath } = ctx;
        
        let finalHtml = '';
        let vc: any = null;

        switch (data.layout) {
            case 'form':
                vc = await idManager.signDocument({
                    type: ["VerifiableCredential", "WebAFormTemplate"],
                    credentialSubject: {
                        id: `${idManager.siteDid}/${relPath.replace('.md', '')}`,
                        name: data.title,
                        contentDigest: crypto.createHash('sha256').update(content).digest('hex')
                    }
                });
                finalHtml = formLayout(data, content, fontCss, safeFontFamilies, vc);
                
                // Extra output: Report page
                const reportHtml = formReportLayout(data, content, fontCss, safeFontFamilies);
                await fs.writeFile(path.join(distDir, relPath.replace('.md', '.report.html')), reportHtml);
                break;

            case 'blog':
                finalHtml = blogLayout(data, allPages, fontCss, safeFontFamilies, htmlContent);
                break;

            case 'verifier':
                finalHtml = verifierLayout(data, htmlContent, fontCss, safeFontFamilies);
                break;

            case 'juminhyo':
                {
                    const jsonLd = buildJuminhyoJsonLd(data);
                    const draftHtml = juminhyoLayout(data, content, fontCss, safeFontFamilies, jsonLd);
                    const htmlDigest = crypto.createHash('sha256').update(draftHtml).digest('hex');
                    const jsonLdDigest = crypto.createHash('sha256').update(JSON.stringify(jsonLd)).digest('hex');
                    const contentDigest = crypto.createHash('sha256')
                        .update(JSON.stringify({ html: htmlDigest, jsonLd: jsonLdDigest }))
                        .digest('hex');

                    const templatePayload = {
                        layout: 'juminhyo',
                        schema: 'juminhyo-v1',
                        version: 1
                    };
                    const templateDigest = crypto.createHash('sha256').update(JSON.stringify(templatePayload)).digest('hex');

                    const templateVc = await idManager.signDocument({
                        type: ["VerifiableCredential", "JuminhyoTemplate"],
                        credentialSubject: {
                            id: `${idManager.siteDid}/templates/juminhyo`,
                            name: "Juminhyo Template",
                            templateDigest
                        }
                    });

                    const instanceVc = await idManager.signDocument({
                        type: ["VerifiableCredential", "JuminhyoInstance"],
                        credentialSubject: {
                            id: `${idManager.siteDid}/${relPath.replace('.md', '')}`,
                            name: data.title,
                            htmlDigest,
                            jsonLdDigest,
                            contentDigest
                        }
                    });

                    vc = instanceVc;
                    finalHtml = juminhyoLayout(data, content, fontCss, safeFontFamilies, jsonLd, templateVc, instanceVc);
                }
                break;

            default:
                // Default to standard signed Article (Web/A)
                vc = await idManager.signDocument({
                    type: ["VerifiableCredential", "WebADocument"],
                    credentialSubject: {
                        id: `${idManager.siteDid}/${relPath.replace('.md', '')}`,
                        name: data.title,
                        contentDigest: crypto.createHash('sha256').update(cheerio.load(htmlContent).text().trim()).digest('hex')
                    }
                });
                finalHtml = articleLayout(data, htmlContent, fontCss, safeFontFamilies, vc);
                break;
        }

        return { html: finalHtml, vc };
    }
}
