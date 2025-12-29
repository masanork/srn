
import fs from 'fs-extra';
import path from 'path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import { marked } from 'marked';

import { articleLayout } from './layouts/article.js';
import { blogLayout } from './layouts/blog.js';
import { formLayout, formReportLayout } from './layouts/form.js';
import { verifierLayout } from './layouts/verifier.js';
import { normalizeDate, stripLeadingTitleHeading } from './utils.js';
import { buildJuminhyoJsonLd, juminhyoLayout } from './layouts/juminhyo.js';
import type { IdentityManager } from './IdentityManager.ts';



export interface LayoutContext {
    data: any;
    config: any;
    content: string;
    htmlContent: string;
    fontCss: string;
    safeFontFamilies: string[];
    allPages: any[];
    idManager: IdentityManager;
    distDir: string;
    relPath: string;
    contentDir: string;
}

export class LayoutManager {
    async render(ctx: LayoutContext): Promise<{ html: string, vc?: any }> {
        const { data, config, content, htmlContent, fontCss, safeFontFamilies, allPages, idManager, distDir, relPath } = ctx;

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
                finalHtml = formLayout(data, content, fontCss, safeFontFamilies, vc, relPath, config);

                // Extra output: Report page
                const reportHtml = formReportLayout(data, content, fontCss, safeFontFamilies, relPath);
                await fs.writeFile(path.join(distDir, relPath.replace('.md', '.report.html')), reportHtml);
                break;

            case 'blog':
                // Find the latest article
                const articles = allPages.filter(item =>
                    item.layout === 'article' &&
                    !item.isSystem &&
                    item.path !== 'index.html'
                );
                let latestArticleContent = '';
                let latestArticleData = null;
                let latestArticlePath = '';

                if (articles.length > 0) {
                    const latest = articles[0]; // allPages is already sorted by date desc
                    // Convert dist path (html) back to source path (md)
                    // This is a bit heuristics-based: .html -> .md
                    const sourceName = path.basename(latest.path).replace('.html', '.md');
                    // We assume flat structure or we need to find it. 
                    // ctx.allPages items don't have source path, only dist path.
                    // But in this simple blog, flattened structure or same relative path is common.
                    // Let's assume the relative path in dist mirrors relative path in content.
                    const sourcePath = path.join(ctx.contentDir, latest.path.replace('.html', '.md'));

                    if (await fs.pathExists(sourcePath)) {
                        const raw = await fs.readFile(sourcePath, 'utf-8');
                        const { data: aData, content: aContent } = matter(raw);
                        if (aData.date) {
                            aData.date = normalizeDate(aData.date);
                        }
                        latestArticleData = { ...aData, path: latest.path };
                        const normalizedContent = stripLeadingTitleHeading(aContent, aData.title);
                        latestArticleContent = await marked.parse(normalizedContent) as string;
                        latestArticlePath = latest.path;
                    }
                }

                finalHtml = blogLayout(data, allPages, fontCss, safeFontFamilies, htmlContent, latestArticleContent, latestArticleData, relPath);
                break;

            case 'verifier':
                finalHtml = verifierLayout(data, htmlContent, fontCss, safeFontFamilies, relPath);
                break;

            case 'juminhyo':
                {
                    const jsonLd = buildJuminhyoJsonLd(data);
                    const draftHtml = juminhyoLayout(data, content, fontCss, safeFontFamilies, jsonLd, undefined, undefined, undefined, undefined, relPath);
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
                    finalHtml = juminhyoLayout(data, content, fontCss, safeFontFamilies, jsonLd, templateVc, instanceVc, undefined, undefined, relPath);
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
                finalHtml = articleLayout(data, htmlContent, fontCss, safeFontFamilies, vc, relPath);
                break;
        }

        return { html: finalHtml, vc };
    }
}
