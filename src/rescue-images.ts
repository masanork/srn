import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

async function rescue() {
    const siteArgIndex = process.argv.indexOf('--site');
    const site = siteArgIndex !== -1 ? process.argv[siteArgIndex + 1] : 'my-blog';
    const siteName = site || 'my-blog';
    const contentDir = path.resolve(process.cwd(), 'sites', siteName, 'content');
    const staticDir = path.resolve(process.cwd(), 'sites', siteName, 'static');
    const imagesDir = path.join(staticDir, 'images', 'imported');

    if (!await fs.pathExists(contentDir)) {
        console.error(`Directory not found: ${contentDir}`);
        process.exit(1);
    }

    await fs.ensureDir(imagesDir);

    console.log(`Scanning for external images in ${contentDir}...`);
    const files = await glob('**/*.md', { cwd: contentDir });

    for (const file of files) {
        const filePath = path.join(contentDir, file);
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;

        // MD syntax: ![alt](url)
        const mdRegex = /!\[(.*?)\]\((https?:\/\/.*?)\)/g;
        let mdMatch;
        while ((mdMatch = mdRegex.exec(content)) !== null) {
            const url = mdMatch[2];
            const localPath = await downloadImage(url, imagesDir);
            if (localPath) {
                const relativePath = '/images/imported/' + path.basename(localPath);
                content = content.replace(url, relativePath);
                modified = true;
            }
        }

        // HTML syntax: src="url"
        const htmlRegex = /src="(https?:\/\/.*?)"/g;
        let htmlMatch;
        while ((htmlMatch = htmlRegex.exec(content)) !== null) {
            const url = htmlMatch[1];
            if (url.includes('google.com/analytics') || url.includes('hatena.ne.jp/keyword')) continue;

            const localPath = await downloadImage(url, imagesDir);
            if (localPath) {
                const relativePath = '/images/imported/' + path.basename(localPath);
                content = content.replace(url, relativePath);
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`  Updated: ${file}`);
        }
    }

    console.log('Rescue complete.');
}

async function downloadImage(url: string, destDir: string): Promise<string | null> {
    try {
        const urlObj = new URL(url);
        let ext = path.extname(urlObj.pathname) || '.jpg';
        // Remove query params from extension
        if (ext.includes('?')) ext = ext.split('?')[0];

        // Create a hash for the filename to avoid name collisions and invalid characters
        const hash = Buffer.from(url).toString('base64url').substring(0, 16);
        const filename = `${hash}${ext}`;
        const destPath = path.join(destDir, filename);

        if (await fs.pathExists(destPath)) {
            return destPath;
        }

        console.log(`    Downloading: ${url} -> ${filename}`);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoraneRescue/1.0)' }
        });

        if (!response.ok) {
            throw new Error(`Status ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        await Bun.write(destPath, buffer);

        return destPath;
    } catch (err: any) {
        console.error(`    Failed to download ${url}: ${err.message}`);
        return null;
    }
}

rescue().catch(err => {
    console.error(err);
    process.exit(1);
});
