import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

async function migrate() {
    const siteArgIndex = process.argv.indexOf('--site');
    const site = siteArgIndex !== -1 ? process.argv[siteArgIndex + 1] : 'my-blog';
    const contentDir = path.resolve(process.cwd(), 'sites', site || 'my-blog', 'content');

    const importArgIndex = process.argv.indexOf('--import');
    if (importArgIndex !== -1) {
        const mtFile = process.argv[importArgIndex + 1];
        await importMT(mtFile, contentDir);
        return;
    }

    if (!await fs.pathExists(contentDir)) {
        console.error(`Directory not found: ${contentDir}`);
        process.exit(1);
    }

    console.log(`Migrating files in ${contentDir}...`);
    const files = await glob('**/*.md', { cwd: contentDir });

    for (const file of files) {
        if (file === 'index.md' || file === 'srn.md') continue;

        const filePath = path.join(contentDir, file);
        let content = await fs.readFile(filePath, 'utf-8');

        if (content.startsWith('---')) {
            console.log(`  Skipping ${file} (already has frontmatter)`);
            continue;
        }

        // Extract Date from filename (YYYY-MM-DD)
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = (dateMatch && dateMatch[1]) ? dateMatch[1] : new Date().toISOString().split('T')[0];

        // Extract Title from first line (# Title)
        const lines = content.split('\n');
        let title = file.replace('.md', '');
        let contentStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('# ')) {
                title = line.replace('# ', '').trim();
                contentStartLine = i + 1;
                break;
            } else if (line !== '') {
                break;
            }
        }

        const frontmatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: "${date}"`,
            'layout: article',
            '---',
            ''
        ].join('\n');

        const remainingContent = lines.slice(contentStartLine).join('\n').trim();
        const newContent = frontmatter + '\n' + remainingContent;

        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`  Migrated: ${file} (Date: ${date}, Title: ${title})`);
    }

    console.log('Migration complete.');
}

async function importMT(mtFilePath: string, destDir: string) {
    if (!await fs.pathExists(mtFilePath)) {
        console.error(`MT File not found: ${mtFilePath}`);
        process.exit(1);
    }

    console.log(`Importing MT file: ${mtFilePath} ...`);
    await fs.ensureDir(destDir);

    const data = await fs.readFile(mtFilePath, 'utf-8');
    const entries = data.split('--------\n');

    for (const entry of entries) {
        if (!entry.trim()) continue;

        // Split into headers and sections
        const blocks = entry.split('-----\n');
        const headerBlock = blocks[0];

        const metadata: Record<string, string> = {};
        headerBlock.split('\n').forEach(line => {
            const match = line.match(/^([^:]+): (.*)$/);
            if (match) {
                metadata[match[1].trim()] = match[2].trim();
            }
        });

        if (metadata['STATUS'] && metadata['STATUS'] !== 'Publish') {
            continue; // Skip drafts
        }

        let body = '';
        let extended = '';

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.startsWith('BODY:')) {
                body = block.substring(5).trim();
            } else if (block.startsWith('EXTENDED BODY:')) {
                extended = block.substring(14).trim();
            }
        }

        const title = metadata['TITLE'] || 'Untitled';
        const rawDate = metadata['DATE'] || '';

        // Parse date "08/26/2023 23:59:59" or "2023-08-26 23:59:59"
        let date = new Date().toISOString().split('T')[0];
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                date = `${year}-${month}-${day}`;
            }
        }

        // Generate filename
        const safeTitle = title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase().substring(0, 30);
        const filename = `${date}${safeTitle ? '-' + safeTitle : ''}.md`;
        const filePath = path.join(destDir, filename);

        const fullBody = (body + '\n\n' + extended).trim();
        const frontmatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: "${date}"`,
            'layout: article',
            '---',
            ''
        ].join('\n');

        await fs.writeFile(filePath, frontmatter + '\n' + fullBody, 'utf-8');
        console.log(`  Imported: ${filename} (Title: ${title})`);
    }

    console.log(`Import complete. ${entries.length} entries processed.`);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
