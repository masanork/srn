
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { glob } from 'glob';

import { loadConfig, getAbsolutePaths } from '../core/config.js';
import { FontProcessor } from './FontProcessor.js';
import { IdentityManager } from './IdentityManager.js';
import { LayoutManager } from './LayoutManager.js';

// Layouts
import { articleLayout } from './layouts/article.js';
import { verifierLayout } from './layouts/verifier.js';
import { blogLayout } from './layouts/blog.js';
import { formLayout, formReportLayout } from './layouts/form.js';
import { juminhyoLayout } from './layouts/juminhyo.js';

async function build() {
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

    // Copy Assets
    await copyStaticAssets(SITE_DIR, DIST_DIR, SCHEMAS_DIR);

    // Process Content
    const files = await glob('**/*.md', { cwd: CONTENT_DIR });
    const allPages = await collectMetadata(files, CONTENT_DIR);

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(source);
        
        // Incremental check
        if (!isClean && await isUpToDate(filePath, file, DIST_DIR, data.layout)) continue;

        console.log(`Processing: ${file}`);
        const htmlContent = await marked.parse(content);

        // Process Fonts
        const { fontCss, safeFontFamilies } = await fontProcessor.processPageFonts(
            htmlContent, data, config, idManager.currentKeys, idManager.siteDid, idManager.buildId
        );

        // Render via Layout Manager
        const { html: finalHtml, vc } = await layoutManager.render({
            data, content, htmlContent, fontCss, safeFontFamilies, allPages, idManager, distDir: DIST_DIR, relPath: file
        });

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

    await bundleClientScripts(DIST_DIR);
    await generateSitemaps(allPages, config, DIST_DIR, files.includes('srn.md') && !files.includes('index.md'));
    console.log('Build complete.');
}

// --- Helpers ---

async function copyStaticAssets(siteDir: string, distDir: string, schemasDir: string) {
    const sharedStyle = path.resolve(process.cwd(), 'shared', 'style.css');
    const siteStyle = path.join(siteDir, 'static', 'style.css');
    const styleTarget = path.join(distDir, 'style.css');

    if (await fs.pathExists(siteStyle)) await fs.copy(siteStyle, styleTarget);
    else if (await fs.pathExists(sharedStyle)) await fs.copy(sharedStyle, styleTarget);

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
        const { data } = matter(source);
        items.push({
            title: String(data.title || file),
            date: data.date ? String(data.date) : '',
            path: file.replace('.md', '.html'),
            layout: String(data.layout || 'article')
        });
    }
    return items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

async function isUpToDate(src: string, relPath: string, distDir: string, layout: string) {
    if (['blog', 'grid', 'search', 'form', 'juminhyo', 'verifier'].includes(layout)) return false;
    const target = path.join(distDir, relPath.replace('.md', '.html'));
    if (!await fs.pathExists(target)) return false;
    const [s, t] = await Promise.all([fs.stat(src), fs.stat(target)]);
    return s.mtime <= t.mtime;
}

async function bundleClientScripts(distDir: string) {
    const assetsDir = path.join(distDir, 'assets');
    await fs.ensureDir(assetsDir);
    
    // Verify App
    const verifyEntry = path.join(process.cwd(), 'src/ssg/client/verify-app.ts');
    if (await fs.pathExists(verifyEntry)) {
        await Bun.build({ entrypoints: [verifyEntry], outdir: assetsDir, naming: "verify-bundle.js", minify: true });
    }

    // Form Client
    const formEntry = path.join(process.cwd(), 'src/form/client/index.ts');
    if (await fs.pathExists(formEntry)) {
        await Bun.build({ entrypoints: [formEntry], outdir: assetsDir, naming: "form-bundle.js", minify: true });
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

export { build };
if (import.meta.main) {
    build().catch(err => { console.error(err); process.exit(1); });
}
