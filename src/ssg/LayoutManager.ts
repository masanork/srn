
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
import type { ManifestManager } from './ManifestManager.ts';
import { parseMarkdown } from '../form/parser.ts';



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
    async render(ctx: LayoutContext, manifestManager: ManifestManager): Promise<{ html: string, vc?: any }> {
        const { data, config, content, htmlContent, fontCss, safeFontFamilies, allPages, idManager, distDir, relPath } = ctx;

        let finalHtml = '';
        let vc: any = null;

        // --- Mermaid Detection & Blob Registration ---
        // We detect mermaid usage in raw markdown
        const needsMermaid = content.includes('```mermaid');
        if (needsMermaid) {
            try {
                const mermaidPath = path.join(distDir, 'assets', 'mermaid.min.js');
                // Note: bundleClientScripts runs before render loop, so file should exist.
                if (await fs.pathExists(mermaidPath)) {
                    const buffer = await fs.readFile(mermaidPath);
                    await manifestManager.addBlob({
                        id: 'js-mermaid',
                        content: buffer,
                        mediaType: 'application/javascript',
                        fileName: 'mermaid.min.js',
                        description: 'Mermaid Diagram Renderer'
                    });
                }
            } catch (e) { console.warn('Failed to register mermaid blob', e); }
        }

        // --- Mermaid Detection & Blob Registration ---
        // ... (existing mermaid logic) ...

        // --- WASM Crypto Registration ---
        // Check if L2 encryption is configured
        const hasL2Config = data.layout === 'form' && Boolean(
            data.l2_encrypt &&
            data.l2_recipient_kid &&
            data.l2_recipient_x25519
        );

        // Also check if L2-related features are mentioned in content
        const hasL2InContent = content.includes('weba-l2-') || content.includes('l2crypto');

        // Register WASM binary only if L2 encryption is actually used
        // (Not needed for basic forms without L2, saving ~454KB)
        const needsCrypto = hasL2Config || hasL2InContent || !!vc;
        if (needsCrypto) {
            try {
                // WASM source is in wasm_bindings relative to this file
                const projectRoot = path.resolve(import.meta.dirname, '../../');
                const wasmPath = path.join(projectRoot, 'src/core/wasm_bindings/weba_crypto_wasm_bg.wasm');
                if (await fs.pathExists(wasmPath)) {
                    const buffer = await fs.readFile(wasmPath);
                    await manifestManager.addBlob({
                        id: 'weba-crypto-wasm',
                        content: buffer,
                        mediaType: 'application/wasm',
                        fileName: 'weba_crypto.wasm',
                        description: 'Web/A Cryptography WASM Core'
                    });
                }
            } catch (e) { console.warn('Failed to register WASM crypto blob', e); }
        }

        switch (data.layout) {
            case 'form':
                vc = await idManager.signDocument({
                    type: ["VerifiableCredential", "WebAFormTemplate"],
                    credentialSubject: {
                        id: `${idManager.siteDid}/${relPath.replace('.md', '')}`,
                        name: data.title,
                        contentDigest: crypto.createHash('sha256').update(content).digest('hex')
                    }
                }, {
                    license: data.license,
                    tags: data.tags,
                    lang: data.lang,
                    updated: data.updated,
                    schemas: data.schemas
                });

                // --- Master Data Blob Extraction ---
                const parsed = parseMarkdown(content);
                const jsonStructure = parsed.jsonStructure;

                if (jsonStructure.masterData) {
                    jsonStructure.masterDataRefs = jsonStructure.masterDataRefs || {};
                    for (const [key, mData] of Object.entries(jsonStructure.masterData)) {
                        const json = JSON.stringify(mData);
                        // Blobify if large (> 1KB)
                        if (json.length > 1024) {
                            const blobRef = await manifestManager.addBlob({
                                id: `master-${key}`,
                                content: json,
                                mediaType: 'application/json',
                                fileName: `master-${key}.json`,
                                description: `Master data for ${key}`
                            });
                            jsonStructure.masterDataRefs[key] = blobRef.digest;
                            delete jsonStructure.masterData[key]; // Remove from L1 core
                        }
                    }
                }

                finalHtml = await formLayout({
                    data,
                    rawMarkdown: content,
                    fontCss,
                    fontFamilies: safeFontFamilies,
                    vc,
                    relPath,
                    config,
                    distDir,
                    manifestManager: manifestManager,
                    jsonStructure // Pass the processed structure
                });

                // Extra output: Report page (use separate ManifestManager to avoid blob duplication)
                const { ManifestManager: MM } = await import('./ManifestManager.js');
                const reportManifestManager = new MM(distDir);
                const reportHtml = await formReportLayout({ data, rawMarkdown: content, fontCss, fontFamilies: safeFontFamilies, relPath, distDir, manifestManager: reportManifestManager });
                const reportPath = path.join(distDir, relPath.replace('.md', '.report.html'));
                await fs.ensureDir(path.dirname(reportPath));
                await fs.writeFile(reportPath, reportHtml);
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
                    }, {
                        license: data.license,
                        tags: data.tags,
                        lang: data.lang,
                        updated: data.updated,
                        schemas: data.schemas
                    });

                    vc = instanceVc;
                    finalHtml = juminhyoLayout(data, content, fontCss, safeFontFamilies, jsonLd, templateVc, instanceVc, undefined, undefined, relPath);
                }
                break;

            case 'redirect':
                finalHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <link rel="canonical" href="${data.redirect_url}">
    <meta http-equiv="refresh" content="0; url=${data.redirect_url}">
</head>
<body>
    <p>Redirecting to <a href="${data.redirect_url}">${data.redirect_url}</a>...</p>
    <script>window.location.href = "${data.redirect_url}";</script>
</body>
</html>`;
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
                }, {
                    license: data.license,
                    tags: data.tags,
                    lang: data.lang,
                    updated: data.updated,
                    schemas: data.schemas
                });
                finalHtml = articleLayout(data, htmlContent, fontCss, safeFontFamilies, vc, relPath);
                break;
        }

        // --- LTV: Inject Trust Store (Phase 1) & Context Chain (Phase 3) ---
        // Embed the Issuer's DID Document directly into the file.
        // This allows offline verification of the signature chain (at least the root key).
        if (vc && finalHtml.includes('</body>')) {
            // 1. Inject Trust Store
            const didDoc = idManager.getDidDocument();
            if (didDoc) {
                const trustStoreScript = `
<script type="application/vnd.weba+trust-store" id="weba-trust-store">
${JSON.stringify({ didDocuments: [didDoc] }, null, 2)}
</script>
`;
                finalHtml = finalHtml.replace('</body>', `${trustStoreScript}</body>`);
            }

            // 2. Inject Context Chain (L3)
            // Retrieve the chain associated with this VC
            const contextChain = idManager.getContextChain(vc);
            if (contextChain) {
                const chainScript = `
<script type="application/vnd.weba+context-chain" id="weba-context-chain">
${JSON.stringify(contextChain, null, 2)}
</script>
`;
                // Inject AFTER trust store (which replaced </body>)
                // Note: finalHtml now ends with <script...trust-store...></script></body>
                finalHtml = finalHtml.replace('</body>', `${chainScript}</body>`);
            }

            // --- LTV: Container Signature (Phase 2.5) ---
            // Sign the final HTML container (Layer 4) to ensure UI integrity.
            // We use a placeholder to calculate the hash, then replace it with the signature.
            const l4Placeholder = `<script type="application/vnd.weba+container-signature" id="weba-container-signature">{"placeholder":true}</script>`;
            const htmlWithPlaceholder = finalHtml.replace('</body>', `${l4Placeholder}</body>`);

            const containerHash = crypto.createHash('sha256').update(htmlWithPlaceholder).digest('hex');

            // L4 VC is ephemeral (Deploy-Time), so we include buildId to force fresh signature.
            const containerVc = await idManager.signDocument({
                type: ["VerifiableCredential", "WebAContainerSignature"],
                credentialSubject: {
                    id: `${idManager.siteDid}/${relPath.replace('.md', '')}#container`,
                    containerHash,
                    buildId: idManager.buildId,
                    // Link to the latest context chain hash if available
                    latestContextHash: contextChain ? crypto.createHash('sha256').update(JSON.stringify(contextChain)).digest('hex') : undefined
                }
            });

            const l4Script = `<script type="application/vnd.weba+container-signature" id="weba-container-signature">
${JSON.stringify(containerVc, null, 2)}
</script>`;

            finalHtml = finalHtml.replace('</body>', `${l4Script}</body>`);
        }

        // --- Manifest Injection (Fonts, Blobs, etc.) ---
        const manifestHtml = manifestManager.generateInjectionHtml();
        if (finalHtml.includes('</body>')) {
            finalHtml = finalHtml.replace('</body>', `${manifestHtml}</body>`);
        } else {
            finalHtml += manifestHtml;
        }

        return { html: finalHtml, vc };
    }
}

