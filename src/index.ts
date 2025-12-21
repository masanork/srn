import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { glob } from 'glob';

import * as cheerio from 'cheerio';
import { subsetFont, bufferToDataUrl, getGlyphAsSvg } from './font.ts';
import { findGlyphInDb } from './db.ts';

// Render HTML using Layout System
let finalHtml = '';
import { articleLayout } from './layouts/article.ts';
import type { ArticleData } from './layouts/article.ts';
import { variantsLayout } from './layouts/variants.ts';
import type { VariantsData } from './layouts/variants.ts';
import { officialLayout } from './layouts/official.ts';
import type { OfficialData } from './layouts/official.ts';
import { gridLayout } from './layouts/grid.ts';
import type { GridData } from './layouts/grid.ts';
import { searchLayout } from './layouts/search.ts';
import type { SearchData } from './layouts/search.ts';
import { juminhyoLayout } from './layouts/juminhyo.ts';
import type { JuminhyoData, JuminhyoItem } from './layouts/juminhyo.ts';
import { verifierLayout } from './layouts/verifier.ts';
import type { VerifierData } from './layouts/verifier.ts';
import { createHybridVC, createCoseVC, createSdCoseVC, generateHybridKeys, createStatusListVC } from './vc.ts';
import type { HybridKeys } from './vc.ts';

// Configuration
const SITE_DIR = path.resolve(process.cwd(), 'site');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const CONTENT_DIR = path.join(SITE_DIR, 'content');
const FONTS_DIR = path.join(SITE_DIR, 'fonts');
const DATA_DIR = path.join(SITE_DIR, 'data');

// Next-Gen Identity: did:web configuration
// Ideally these come from environment variables or a config file
const SITE_DOMAIN = process.env.SITE_DOMAIN || "masanork.github.io";
const SITE_PATH = process.env.SITE_PATH || "/srn";
// Resulting DID: did:web:masanork.github.io:srn
const SITE_DID = `did:web:${SITE_DOMAIN}${SITE_PATH.replace(/\//g, ':')}`;

async function build() {
    const isClean = process.argv.includes('--clean');
    console.log(`Starting build... (Clean: ${isClean})`);

    // Clean dist only if requested
    if (isClean) {
        await fs.emptyDir(DIST_DIR);
    }

    // Always ensure dist exists
    await fs.ensureDir(DIST_DIR);
    await fs.ensureDir(DATA_DIR);

    // Copy style.css if it exists
    const styleSrc = path.join(SITE_DIR, 'style.css');
    if (await fs.pathExists(styleSrc)) {
        await fs.copy(styleSrc, path.join(DIST_DIR, 'style.css'));
    }

    // --- Key Management & History ---
    console.log("Initializing Key Management...");

    // 1. Root Key (Trust Anchor) management
    const rootKeyPath = path.join(DATA_DIR, 'root-key.json');
    let rootKeys: HybridKeys;
    if (await fs.pathExists(rootKeyPath)) {
        rootKeys = await fs.readJson(rootKeyPath);
        console.log("  Loaded Root Key.");
    } else {
        rootKeys = generateHybridKeys();
        await fs.writeJson(rootKeyPath, rootKeys, { spaces: 2 });
        console.log("  Generated NEW Root Key.");
    }

    // 2. Load History
    const historyPath = path.join(DATA_DIR, 'key-history.json');
    let keyHistory: Array<{ timestamp: string; buildId: string; revoked?: boolean; ed25519Params: string; pqcParams: string }> = [];

    if (await fs.pathExists(historyPath)) {
        try {
            keyHistory = await fs.readJson(historyPath);
        } catch (e) {
            console.warn("Failed to read existing key history, starting fresh.");
        }
    }

    // 3. Generate Ephemeral Keys for this build
    const currentKeys = generateHybridKeys();
    const buildId = `build-${Date.now()}`;

    const newEntry = {
        timestamp: new Date().toISOString(),
        buildId: buildId,
        revoked: false,
        ed25519Params: `did:key:z${currentKeys.ed25519.publicKey}`,
        pqcParams: `did:key:zPQC${currentKeys.pqc.publicKey}`
    };
    keyHistory.push(newEntry);

    // Persist history
    await fs.writeJson(historyPath, keyHistory, { spaces: 2 });
    await fs.writeJson(path.join(DIST_DIR, 'key-history.json'), keyHistory, { spaces: 2 });

    // 4. Generate DID Document (did:web standard)
    console.log(`Generating DID Document for ${SITE_DID}...`);
    const didDoc = {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1"
        ],
        "id": SITE_DID,
        "verificationMethod": [
            {
                "id": `${SITE_DID}#root-ed25519`,
                "type": "Ed25519VerificationKey2020",
                "controller": SITE_DID,
                "publicKeyHex": rootKeys.ed25519.publicKey
            },
            {
                "id": `${SITE_DID}#${buildId}-ed25519`,
                "type": "Ed25519VerificationKey2020",
                "controller": SITE_DID,
                "publicKeyHex": currentKeys.ed25519.publicKey
            },
            {
                "id": `${SITE_DID}#${buildId}-pqc`,
                "type": "DataIntegrityProof",
                "controller": SITE_DID,
                "publicKeyHex": currentKeys.pqc.publicKey
            }
        ],
        "assertionMethod": [
            `${SITE_DID}#root-ed25519`,
            `${SITE_DID}#${buildId}-ed25519`,
            `${SITE_DID}#${buildId}-pqc`
        ]
    };

    await fs.ensureDir(path.join(DIST_DIR, '.well-known'));
    await fs.writeJson(path.join(DIST_DIR, '.well-known', 'did.json'), didDoc, { spaces: 2 });

    // 5. Generate Status List VC (Signed by Root Key)
    // Filter revoked build IDs
    const revokedBuildIds = keyHistory.filter(k => k.revoked).map(k => k.buildId);
    const statusListUrl = `https://${SITE_DOMAIN}${SITE_PATH}/status-list.json`;

    try {
        const statusListVc = await createStatusListVC(revokedBuildIds, rootKeys, statusListUrl, SITE_DID);
        await fs.writeJson(path.join(DIST_DIR, 'status-list.json'), statusListVc, { spaces: 2 });
        console.log("  Generated Status List VC (Signed by Root Key).");
    } catch (err) {
        console.error("Failed to generate status list:", err);
    }

    console.log(`  Key history updated. Current PQC Key: ...${currentKeys.pqc.publicKey.slice(-8)}`);

    // 6. Copy schemas to dist
    const schemaSrcDir = path.join(__dirname, '../site/schemas');
    const schemaDistDir = path.join(DIST_DIR, 'schemas');
    if (await fs.pathExists(schemaSrcDir)) {
        await fs.ensureDir(schemaDistDir);
        await fs.copy(schemaSrcDir, schemaDistDir);
        console.log("  Copied schemas to dist.");
    }
    // --------------------------------

    // Copy static assets
    const STATIC_DIR = path.join(SITE_DIR, 'static');
    if (await fs.pathExists(STATIC_DIR)) {
        // Find all markdown files
        // Configure marked once
        marked.use({
            renderer: {
                // @ts-ignore
                code({ text, lang }) {
                    if (lang === 'mermaid') {
                        return `<div class="mermaid">${text}</div>`;
                    }
                    const langClass = lang ? `class="language-${lang}"` : '';
                    return `<pre><code ${langClass}>${text}</code></pre>\n`;
                }
            }
        });

        // Find all markdown files
        const files = await glob('**/*.md', { cwd: CONTENT_DIR });

        for (const file of files) {
            const filePath = path.join(CONTENT_DIR, file);
            const outPath = path.join(DIST_DIR, file.replace('.md', '.html'));

            // Incremental check: if not clean build, check modification times
            if (!isClean && await fs.pathExists(outPath)) {
                const srcStat = await fs.stat(filePath);
                const dstStat = await fs.stat(outPath);
                if (srcStat.mtime <= dstStat.mtime) {
                    continue;
                }
            }

            const source = await fs.readFile(filePath, 'utf-8');
            const { data, content } = matter(source);

            console.log(`Processing: ${file}`);

            // Convert to HTML
            let htmlContent = await marked.parse(content);

            // Extract text for subsetting
            const $ = cheerio.load(htmlContent);
            const bodyText = $.text().replace(/\s+/g, '');

            // Extract text from Frontmatter data to ensure all characters are subsetted
            const extractTextFromData = (obj: any): string => {
                let text = '';
                if (typeof obj === 'string') {
                    text += obj;
                } else if (Array.isArray(obj)) {
                    obj.forEach(item => text += extractTextFromData(item));
                } else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(val => text += extractTextFromData(val));
                }
                return text;
            };
            const dataText = extractTextFromData(data);

            const fullText = (data.title || '') + bodyText + dataText;

            let fontCss = '';
            // Parse font configurations
            let fontConfigs: string[] = [];
            if (data.font) {
                fontConfigs = Array.isArray(data.font) ? data.font : [data.font];
            } else {
                // Default fonts if none specified
                fontConfigs = ['ipamjm.ttf', 'acgjm.ttf'];
            }

            const styleMap: Record<string, string[]> = {};
            const uniqueFontsToSubset = new Set<string>();
            const ivsSupportCountByFamily = new Map<string, number>();

            const getBaseName = (fname: string) => 'Srn-' + path.basename(fname, path.extname(fname)).replace(/[^a-zA-Z0-9]/g, '');

            for (const config of fontConfigs) {
                let styleName = 'default';
                let fileListStr = config;

                if (config.includes(':')) {
                    const parts = config.split(':');
                    styleName = (parts[0] || '').trim();
                    fileListStr = parts.slice(1).join(':').trim(); // Join back in case filename has :, though unlikely
                }

                const files = fileListStr.split(',').map(s => s.trim()).filter(s => s);

                if (!styleMap[styleName]) {
                    styleMap[styleName] = [];
                }

                for (const file of files) {
                    uniqueFontsToSubset.add(file);
                    // Use a generated family name based on filename to uniquely identify it
                    styleMap[styleName]?.push(getBaseName(file));
                }
            }

            // Subset unique fonts
            for (const fontName of uniqueFontsToSubset) {
                const fontPath = path.join(FONTS_DIR, fontName);

                if (await fs.pathExists(fontPath)) {
                    try {
                        console.log(`  Subsetting font: ${fontName}`);
                        const { buffer, mimeType, ivsRecordsCount } = await subsetFont(fontPath, fullText);

                        const format = 'woff2';
                        const dataUrl = bufferToDataUrl(buffer, mimeType);
                        const fontFamilyName = getBaseName(fontName);

                        fontCss += `
<style>
@font-face {
  font-family: '${fontFamilyName}';
  src: url('${dataUrl}') format('${format}');
  font-display: swap;
}
</style>
                    `;
                        ivsSupportCountByFamily.set(fontFamilyName, ivsRecordsCount);
                    } catch (err) {
                        console.error(`  Error subsetting font ${fontName}: ${err}`);
                        console.error(err);
                        ivsSupportCountByFamily.set(fontFamilyName, 0);
                    }
                } else {
                    console.warn(`  Font not found: ${fontName}`);
                    const fontFamilyName = getBaseName(fontName);
                    ivsSupportCountByFamily.set(fontFamilyName, 0);
                }
            }

            const anyIvsSupport = Array.from(ivsSupportCountByFamily.values()).some(count => count > 0);
            if (anyIvsSupport) {
                const reorderStackForIvs = (stack: string[]) => {
                    return stack
                        .map((name, index) => ({
                            name,
                            index,
                            score: ivsSupportCountByFamily.get(name) ?? 0
                        }))
                        .sort((a, b) => {
                            if (a.score !== b.score) return b.score - a.score;
                            return a.index - b.index;
                        })
                        .map(entry => entry.name);
                };

                for (const [styleName, stack] of Object.entries(styleMap)) {
                    styleMap[styleName] = reorderStackForIvs(stack);
                }
            }


            // Default fallbacks
            const defaultStack = styleMap['default'] || [];
            const safeDefaultStack = defaultStack.map(f => `'${f}'`);

            // Generate utility classes for non-default styles
            let utilityCss = '<style>\n';
            for (const [styleName, stack] of Object.entries(styleMap)) {
                if (styleName === 'default') continue;
                const quotedStack = stack.map(f => `'${f}'`);
                const stackStr = [...quotedStack, ...safeDefaultStack, 'serif'].join(', ');
                utilityCss += `.font-${styleName} { font-family: ${stackStr} !important; }\n`;
            }
            utilityCss += '</style>';
            fontCss += utilityCss;

            const safeFontFamilies = [...defaultStack, 'serif'];

            // Generate valid CSS font stack: quote non-generic families
            const fontFamilyCss = safeFontFamilies.map(f => {
                if (['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(f)) return f;
                return `'${f}'`;
            }).join(', ');

            // Global styles (only font-family injection needed now)
            const globalStyle = `
<style>
body {
  font-family: ${fontFamilyCss};
}
</style>
        `;
            fontCss += globalStyle;

            // Process Inline Glyph Tags
            const glyphPattern = /\[([a-zA-Z0-9_.:-]+)\]/g;
            const matches = [...htmlContent.matchAll(glyphPattern)];

            if (matches.length > 0) {
                const replacers = await Promise.all(matches.map(async m => {
                    const rawContent = m[1] || '';
                    const parts = rawContent.split(':');

                    let fontRef = '';
                    let glyphId = '';

                    // Analyze parts
                    if (parts.length === 1) {
                        // [glyphId]
                        glyphId = parts[0];
                    } else if (parts.length === 2) {
                        // [fontOrStyle:glyphId]
                        fontRef = parts[0];
                        glyphId = parts[1];
                    } else if (parts.length >= 3) {
                        // [prefix:fontOrStyle:glyphId] e.g. [font:ipamjm.ttf:MJ005232]
                        // We ignore the first part (prefix)
                        fontRef = parts[1];
                        glyphId = parts[2];
                    }

                    // --- MJ Code Resolution Removed as per user request ---
                    // if (glyphId && glyphId.startsWith('MJ')) { ... }
                    // ----------------------------------------------------

                    let fontFile = '';

                    if (fontRef) {
                        // Explicit font/style specified
                        fontFile = fontRef;

                        // Check if it matches a defined style alias
                        for (const cfg of fontConfigs) {
                            let sName = 'default';
                            let fFiles = cfg;
                            if (cfg.includes(':')) {
                                const pts = cfg.split(':');
                                sName = pts[0].trim();
                                fFiles = pts.slice(1).join(':').trim();
                            }
                            if (sName === fontRef) {
                                fontFile = fFiles.split(',')[0].trim();
                                break;
                            }
                        }
                    } else {
                        // Auto lookup from DB
                        const location = findGlyphInDb(glyphId);
                        if (location) {
                            fontFile = location.filename;
                            console.log(`  Resolved ${glyphId} -> ${fontFile}`);
                        } else {
                            if (glyphId.match(/^(MJ|GJ|uni)/)) {
                                console.warn(`  Glyph not found in DB: ${glyphId}`);
                            }
                            return { original: m[0], replacement: m[0] };
                        }
                    }

                    if (!fontFile || !glyphId) return { original: m[0], replacement: m[0] };

                    let fontPath = path.join(FONTS_DIR, fontFile);
                    if (!await fs.pathExists(fontPath)) {
                        if (await fs.pathExists(fontPath + '.ttf')) fontPath += '.ttf';
                        else if (await fs.pathExists(fontPath + '.otf')) fontPath += '.otf';
                    }

                    try {
                        const svg = await getGlyphAsSvg(fontPath, glyphId);
                        return { original: m[0], replacement: svg };
                    } catch (e) {
                        console.error(`  Failed to generate SVG for ${glyphId} in ${fontFile}:`, e);
                        return { original: m[0], replacement: m[0] };
                    }
                }));

                let newHtml = htmlContent;
                for (const { original, replacement } of replacers) {
                    newHtml = newHtml.split(original).join(replacement);
                }
                htmlContent = newHtml;
            }

            // Render HTML using Layout System
            let finalHtml = '';
            if (data.layout === 'variants') {
                finalHtml = variantsLayout(
                    data as VariantsData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies
                );
            } else if (data.layout === 'official') {
                // Generate VC for official documents
                console.log("  Generating PQC Hybrid VC...");
                const plainText = cheerio.load(htmlContent).text();

                const vcPayload = {
                    id: `urn:uuid:${crypto.randomUUID()}`,
                    credentialSubject: {
                        id: `https://example.com/notices/${file.replace('.md', '')}`,
                        name: data.title,
                        recipient: data.recipient,
                        "srn:buildId": buildId, // Embed Build ID for Revocation Check
                        contentDigest: Buffer.from(new TextEncoder().encode(plainText)).toString('hex')
                    }
                };

                // Use the single-source-of-truth keys for this build session
                const vc = await createHybridVC(vcPayload, currentKeys, SITE_DID, buildId);

                // Save VC sidecar
                const vcOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.json'));
                await fs.writeJson(vcOutPath, vc, { spaces: 2 });
                console.log(`  Generated VC: ${vcOutPath}`);

                finalHtml = officialLayout(
                    data as OfficialData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies,
                    vc
                );
            } else if (data.layout === 'grid') {
                finalHtml = gridLayout(
                    data as GridData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies
                );
            } else if (data.layout === 'search') {
                finalHtml = searchLayout(
                    data as SearchData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies
                );
            } else if (data.layout === 'verifier') {
                finalHtml = verifierLayout(
                    data as VerifierData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies
                );
            } else if (data.layout === 'juminhyo') {
                // Generate VC for Juminhyo
                console.log("  Generating Juminhyo Hybrid VC...");

                // Construct a structured payload for Juminhyo
                // In a real scenario, this would match the JSON-LD structure exactly.
                const vcPayload = {
                    id: `urn:uuid:${crypto.randomUUID()}`,
                    type: ["VerifiableCredential", "ResidentRecord"],
                    credentialSchema: {
                        id: `https://${SITE_DOMAIN}${SITE_PATH}/schemas/juminhyo-v1.schema.json`,
                        type: "JsonSchema"
                    },
                    credentialSubject: {
                        id: `https://example.com/certificates/${file.replace('.md', '')}`,
                        type: "ResidentRecord",
                        name: data.certificateTitle,
                        householder: data.householder,
                        address: data.address,
                        "srn:buildId": buildId,
                        member: (data.items as JuminhyoItem[]).map((item: JuminhyoItem) => ({
                            name: item.name,
                            kana: item.kana,
                            birthDate: item.dob,
                            gender: item.gender,
                            relationship: item.relationship,
                            becameResidentDate: item.becameResident,
                            becameResidentReason: item.becameResidentReason,
                            addressSetDate: item.addressDate,
                            notificationDate: item.notificationDate,
                            maidenName: item.maidenName,
                            maidenKana: item.maidenKana,
                            residentCode: item.residentCode,
                            individualNumber: item.myNumber,
                            prevAddress: item.prevAddress,
                            domiciles: item.domiciles,
                            remarks: item.remarks
                        }))
                    }
                };

                const vc = await createHybridVC(vcPayload, currentKeys, SITE_DID, buildId);
                const binaryVc = await createCoseVC(vcPayload, currentKeys, SITE_DID, buildId);
                const sdVc = await createSdCoseVC(vcPayload, currentKeys, SITE_DID, buildId);

                // Save VC sidecars
                const vcOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.json'));
                await fs.writeJson(vcOutPath, vc, { spaces: 2 });

                const binVcOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.cbor'));
                await fs.writeFile(binVcOutPath, binaryVc.cbor);

                const sdVcOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.sd.cwt'));
                await fs.writeFile(sdVcOutPath, sdVc.cbor);

                const disclosuresOutPath = path.join(DIST_DIR, file.replace('.md', '.vc.disclosures.json'));
                await fs.writeJson(disclosuresOutPath, sdVc.disclosures, { spaces: 2 });

                console.log(`  Generated Juminhyo VCs: ${vcOutPath}, ${binVcOutPath}, ${sdVcOutPath}`);

                finalHtml = juminhyoLayout(
                    data as JuminhyoData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies,
                    vc,
                    binaryVc.base64url,
                    sdVc.disclosures
                );
            } else {
                // Default to article
                finalHtml = articleLayout(
                    data as ArticleData,
                    htmlContent,
                    fontCss,
                    safeFontFamilies
                );
            }

            await fs.ensureDir(path.dirname(outPath));
            await fs.writeFile(outPath, finalHtml);

            console.log(`  Generated: ${outPath} (${(finalHtml.length / 1024).toFixed(2)} KB)`);
        }


        // Bundle Client Scripts
        console.log("Bundling client scripts...");
        const clientEntry = path.join(process.cwd(), 'src/client/verify-app.ts');
        if (await fs.pathExists(clientEntry)) {
            const result = await Bun.build({
                entrypoints: [clientEntry],
                outdir: path.join(DIST_DIR, 'assets'),
                naming: "[name]-bundle.[ext]",
                minify: true,
            });
            if (result.success) {
                const generated = path.join(DIST_DIR, 'assets', 'verify-app-bundle.js');
                const target = path.join(DIST_DIR, 'assets', 'verify-bundle.js');
                if (await fs.pathExists(generated)) {
                    await fs.move(generated, target, { overwrite: true });
                }
                console.log("  Bundled verify-app.ts -> assets/verify-bundle.js");
            } else {
                console.error("  Bundle failed:", result.logs);
            }
        }

        // Generate Sitemaps
        console.log("Generating sitemaps...");
        const baseUrl = "https://example.com";
        const sitemapItems = files.map(file => {
            const url = `${baseUrl}/${file.replace('.md', '.html')}`;
            return `
    <url>
        <loc>${url}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>`;
        });

        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems.join('')}
</urlset>`;

        await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);

        // Generate llms.txt (AI Friendly Sitemap)
        const llmsTxt = files.map(file => {
            const title = path.basename(file, '.md');
            const url = `/${file.replace('.md', '.html')}`;
            return `- [${title}](${url})`;
        }).join('\n');

        await fs.writeFile(path.join(DIST_DIR, 'llms.txt'), llmsTxt);
        console.log(`Generated sitemap.xml and llms.txt`);

        // Prune stale HTML files
        console.log("Pruning stale files...");
        const distHtmls = await glob('**/*.html', { cwd: DIST_DIR });
        const validPaths = new Set<string>();

        files.forEach(f => {
            validPaths.add(f.replace(/\.md$/, '.html'));
        });

        const staticHtmls = await glob('**/*.html', { cwd: STATIC_DIR });
        staticHtmls.forEach(f => validPaths.add(f));

        for (const file of distHtmls) {
            if (!validPaths.has(file)) {
                await fs.remove(path.join(DIST_DIR, file));
                console.log(`  Removed stale file: ${file}`);
            }
        }

        console.log('Build complete.');
    }
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
