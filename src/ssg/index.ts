
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { glob } from 'glob';

import { loadConfig, getAbsolutePaths } from '../core/config.js';
import { FontProcessor } from './FontProcessor.js';
import { IdentityManager } from './IdentityManager.js';
import { LayoutManager } from './LayoutManager.js';
import { ManifestManager } from './ManifestManager.ts';

// Layouts
import { normalizeDate, stripLeadingTitleHeading } from './utils.js';
import { articleLayout } from './layouts/article.js';
import { verifierLayout } from './layouts/verifier.js';
import { blogLayout } from './layouts/blog.js';
import { formLayout, formReportLayout } from './layouts/form.js';
import { juminhyoLayout } from './layouts/juminhyo.js';



const LOCK_FILE = path.join(process.cwd(), '.ssg-build.lock');

async function acquireLock() {
    if (process.argv.includes('--no-lock')) return;
    try {
        await fs.writeFile(LOCK_FILE, process.pid.toString(), { flag: 'wx' });
    } catch (err: any) {
        if (err.code === 'EEXIST') {
            const stalePidStr = await fs.readFile(LOCK_FILE, 'utf-8').catch(() => '');
            if (stalePidStr) {
                const stalePid = parseInt(stalePidStr);
                try {
                    process.kill(stalePid, 0);
                    console.error(`\n❌ Error: Another build is already in progress (PID: ${stalePid}).`);
                    console.error(`Wait for the other build to finish, or if you are sure it crashed, delete ${LOCK_FILE}.`);
                    process.exit(1);
                } catch (e) {
                    // Process is dead, stale lock
                    await fs.remove(LOCK_FILE);
                    return acquireLock();
                }
            }
        }
        throw err;
    }
}

async function releaseLock() {
    if (process.argv.includes('--no-lock')) return;
    await fs.remove(LOCK_FILE).catch(() => { });
}

// Cleanup on various termination signals
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(sig => {
    process.on(sig as any, async () => {
        await releaseLock();
        process.exit(0);
    });
});

async function build() {
    await acquireLock();
    try {
        const configOverridePath = process.argv.indexOf('--site-config') !== -1 ? process.argv[process.argv.indexOf('--site-config') + 1] : undefined;
        const config = await loadConfig(configOverridePath);
        const { SITE_DIR, DIST_DIR, CONTENT_DIR, DATA_DIR, SCHEMAS_DIR } = getAbsolutePaths(config);
        const isClean = process.argv.includes('--clean');

        if (isClean) await fs.emptyDir(DIST_DIR);
        await fs.ensureDir(DIST_DIR);
        await fs.ensureDir(DATA_DIR);

        // Initialize Managers
        const idManager = new IdentityManager(config.identity.domain, config.identity.path, DATA_DIR, DIST_DIR);
        await idManager.init();

        const fontProcessor = new FontProcessor(config, process.cwd());
        await fontProcessor.init();

        const layoutManager = new LayoutManager();

        // Prepare client bundles first (to allow inlining if needed)
        await bundleClientScripts(DIST_DIR);
        await copyStaticAssets(SITE_DIR, DIST_DIR, SCHEMAS_DIR);

        // Process Content
        const files = await glob('**/*.md', { cwd: CONTENT_DIR });
        const allPages = await collectMetadata(files, CONTENT_DIR);
        let processedCount = 0;

        for (const file of files) {
            const manifestManager = new ManifestManager(DIST_DIR); // NEW manager for every page
            const filePath = path.join(CONTENT_DIR, file);
            const source = await fs.readFile(filePath, 'utf-8');
            const { data, content } = matter(source);
            if (data.date) {
                data.date = normalizeDate(data.date);
            }

            // Auto-detect triggers for font embedding
            const hasGjmInFrontmatter = JSON.stringify(data).includes('GJM');
            const hasCustomFont = Boolean(data.font);
            const isThemedLayout = ['blog', 'width'].includes(data.layout);

            if (data.embedFonts === undefined) {
                if (hasGjmInFrontmatter || hasCustomFont || isThemedLayout) {
                    data.embedFonts = true;
                }
            }

            // Skip private or draft content
            if (isDraft(data)) {
                console.log(`Skipping draft/private content: ${file}`);
                continue;
            }


            if (!isClean && await isUpToDate(filePath, file, DIST_DIR, data.layout)) continue;

            processedCount++;
            console.log(`Processing: ${file}`);
            const normalizedContent = stripLeadingTitleHeading(content, data.title);
            const rawHtmlContent = await marked.parse(normalizedContent);
            // Rewrite .md links to .html for generated site
            const htmlContent = (rawHtmlContent as string).replace(/href="([^"]+)\.md(#|")/g, 'href="$1.html$2');

            // Process Fonts (Opt-in)
            let fontCss = '';
            let safeFontFamilies: string[] = [];
            if (data.embedFonts) {
                const fontResult = await fontProcessor.processPageFonts(
                    htmlContent, data, config, idManager.currentKeys, idManager.siteDid, idManager.buildId, allPages, manifestManager
                );
                fontCss = fontResult.fontCss;
                safeFontFamilies = fontResult.safeFontFamilies;
            }

            // Render via Layout Manager
            const { html: finalHtml, vc } = await layoutManager.render({
                data,
                config,
                content: normalizedContent,
                htmlContent,
                fontCss,
                safeFontFamilies,
                allPages,
                idManager,
                distDir: DIST_DIR,
                relPath: file,
                contentDir: CONTENT_DIR
            }, manifestManager);

            // Write Outputs
            const outPath = path.join(DIST_DIR, file.replace('.md', '.html'));
            await fs.ensureDir(path.dirname(outPath));
            await fs.writeFile(outPath, finalHtml);
            if (vc) await fs.writeJson(outPath.replace('.html', '.vc.json'), vc, { spaces: 2 });

            // SRN.md fallback to index.html
            if (file === 'srn.md' && !files.includes('index.md')) {
                await fs.writeFile(path.join(DIST_DIR, 'index.html'), finalHtml);
            }
        }

        await generateSitemaps(allPages, config, DIST_DIR, files.includes('srn.md') && !files.includes('index.md'));

        const totalSize = await getDirSize(DIST_DIR);
        console.log(`\nBuild complete.`);
        console.log(`- Pages rebuilt: ${processedCount}`);
        console.log(`- Total dist size: ${formatBytes(totalSize)}`);
    } finally {
        await releaseLock();
    }
}

// --- Helpers ---

async function copyStaticAssets(siteDir: string, distDir: string, schemasDir: string) {
    const sharedStyle = path.resolve(process.cwd(), 'shared', 'style.css');
    const siteStyle = path.join(siteDir, 'static', 'style.css');
    const styleTarget = path.join(distDir, 'style.css');

    if (await fs.pathExists(siteStyle)) await fs.copy(siteStyle, styleTarget);
    else if (await fs.pathExists(sharedStyle)) await fs.copy(sharedStyle, styleTarget);

    // Copy shared data (e.g., postal codes)
    const sharedData = path.resolve(process.cwd(), 'shared', 'data');
    if (await fs.pathExists(sharedData)) {
        await fs.copy(sharedData, path.join(distDir, 'data'));
    }

    const staticDir = path.join(siteDir, 'static');
    if (await fs.pathExists(staticDir)) {
        await fs.copy(staticDir, distDir, { overwrite: true, filter: (src) => !src.endsWith('style.css') });
    }
    if (await fs.pathExists(schemasDir)) {
        await fs.copy(schemasDir, path.join(distDir, 'schemas'));
    }
}

async function collectMetadata(files: string[], contentDir: string) {
    const items = [];
    for (const file of files) {
        const source = await fs.readFile(path.join(contentDir, file), 'utf-8');
        const { data, content } = matter(source);

        if (isDraft(data)) continue;

        const normalizedContent = stripLeadingTitleHeading(content, data.title);
        const html = await marked.parse(normalizedContent);
        const { excerptHtml, excerptText } = buildExcerpt(html);

        items.push({
            title: String(data.title || file),
            description: data.description ? String(data.description) : '',
            author: data.author ? String(data.author) : '',
            date: data.date ? normalizeDate(data.date) : '',
            updated: data.updated ? normalizeDate(data.updated) : undefined,
            path: file.replace('.md', '.html'),
            layout: String(data.layout || 'article'),
            isSystem: Boolean(data.isSystem),
            lang: data.lang ? String(data.lang) : undefined,
            schemas: Array.isArray(data.schemas) ? data.schemas : (data.schema ? [data.schema] : []),
            issuer: data.issuer ? String(data.issuer) : undefined,
            license: data.license ? String(data.license) : undefined,
            excerptHtml,
            excerptText
        });
    }
    return items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function buildExcerpt(html: string) {
    const firstParagraph = html.match(/<p>([\s\S]*?)<\/p>/i);
    if (firstParagraph?.[1]) {
        const paragraphHtml = firstParagraph[1].trim();
        return {
            excerptHtml: `<p>${paragraphHtml}</p>`,
            excerptText: stripTags(paragraphHtml).trim()
        };
    }

    const text = stripTags(html).replace(/\s+/g, ' ').trim();
    if (!text) {
        return { excerptHtml: '', excerptText: '' };
    }

    const snippet = text.slice(0, 200);
    const suffix = text.length > 200 ? '…' : '';
    return {
        excerptHtml: `<p>${escapeHtml(snippet)}${suffix}</p>`,
        excerptText: `${snippet}${suffix}`
    };
}

function isDraft(data: any): boolean {
    if (['draft', 'secret', 'suspended'].includes(data.status)) return true;
    if (data.draft === true) return true;
    if (Array.isArray(data.tags) && data.tags.includes('draft')) return true;
    return false;
}

function stripTags(value: string) {
    return value.replace(/<[^>]+>/g, ' ');
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function isUpToDate(src: string, relPath: string, distDir: string, layout: string) {
    if (['blog', 'grid', 'search', 'form', 'juminhyo', 'verifier'].includes(layout)) return false;
    const target = path.join(distDir, relPath.replace('.md', '.html'));
    if (!await fs.pathExists(target)) return false;
    const [s, t] = await Promise.all([fs.stat(src), fs.stat(target)]);
    if (s.mtime > t.mtime) return false;

    const deps = getLayoutDependencies(layout);
    if (deps.length === 0) return true;

    const depStats = await Promise.all(
        deps.map(dep => fs.stat(dep).catch(() => null))
    );
    const latestDep = depStats.reduce((latest, stat) => {
        if (!stat) return latest;
        return latest && latest > stat.mtime ? latest : stat.mtime;
    }, null as Date | null);

    return latestDep ? latestDep <= t.mtime : true;
}

function getLayoutDependencies(layout: string) {
    const baseDir = path.join(process.cwd(), 'src', 'ssg', 'layouts');
    const base = path.join(baseDir, 'base.ts');
    const layoutKey = (layout || 'article').toString();
    const layoutFiles: Record<string, string> = {
        article: path.join(baseDir, 'article.ts'),
        blog: path.join(baseDir, 'blog.ts'),
        form: path.join(baseDir, 'form.ts'),
        verifier: path.join(baseDir, 'verifier.ts'),
        juminhyo: path.join(baseDir, 'juminhyo.ts')
    };
    const layoutPath = layoutFiles[layoutKey];
    return layoutPath ? [base, layoutPath] : [base];
}

async function bundleClientScripts(distDir: string) {
    const assetsDir = path.join(distDir, 'assets');
    await fs.ensureDir(assetsDir);

    // Stub out the heavy WASM base64 string for client bundles
    const wasmStubPlugin = {
        name: 'wasm-stub',
        setup(build: any) {
            build.onLoad({ filter: /wasm_binary\.ts$/ }, () => {
                return { contents: 'export const WASM_BINARY_B64 = "";', loader: 'ts' };
            });
        }
    };

    // Verify App (Standalone)
    const verifyEntry = path.join(process.cwd(), 'src/ssg/client/verify-app.ts');
    if (await fs.pathExists(verifyEntry)) {
        await Bun.build({ 
            entrypoints: [verifyEntry], 
            outdir: assetsDir, 
            naming: "verify-bundle.js", 
            minify: true,
            plugins: [wasmStubPlugin]
        });
    }

    // --- Modular Form Bundles ---
    const buildBundle = async (entry: string, name: string) => {
        const fullPath = path.join(process.cwd(), entry);
        if (await fs.pathExists(fullPath)) {
            await Bun.build({ 
                entrypoints: [fullPath], 
                outdir: assetsDir, 
                naming: name, 
                minify: true,
                plugins: [wasmStubPlugin]
            });
        }
    };

    // 1. Core (Validation, basic logic, always needed)
    await buildBundle('src/form/client/index.ts', 'form-core.js');

    // 2. Postal Lookup (Only for address fields)
    await buildBundle('src/form/client/postal.ts', 'form-postal.js');

    // 3. L2 Cryptography (Encryption, Signatures, Guest DID)
    await buildBundle('src/form/client/l2crypto.ts', 'form-l2.js');

    // 4. Aggregator (Heavy UI, Client-side parsing)
    await buildBundle('src/form/client/aggregator_browser.ts', 'form-aggregator.js');

    // --- Vendor Assets ---
    const vendorSrc = path.join(process.cwd(), 'src', 'ssg', 'assets', 'vendor');
    if (await fs.pathExists(vendorSrc)) {
        await fs.copy(vendorSrc, assetsDir, { overwrite: true });
    }
}

async function generateSitemaps(pages: any[], config: any, distDir: string, hasFallbackIndex: boolean) {
    const baseUrl = `https://${config.identity.domain}${config.identity.path}`;
    const urls = pages.map(p => `${baseUrl}/${p.path}`);
    if (hasFallbackIndex) urls.push(`${baseUrl}/index.html`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${u}</loc></url>`).join('')}</urlset>`;
    await fs.writeFile(path.join(distDir, 'sitemap.xml'), xml);
}

async function getDirSize(dirPath: string): Promise<number> {
    const files = await fs.readdir(dirPath);
    const stats = await Promise.all(
        files.map(async (file) => {
            const p = path.join(dirPath, file);
            const stat = await fs.stat(p);
            if (stat.isDirectory()) return getDirSize(p);
            return stat.size;
        })
    );
    return stats.reduce((acc, size) => acc + size, 0);
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export { build };
if (import.meta.main) {
    build().catch((err: any) => { console.error(err); process.exit(1); });
}
