import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

async function migrate() {
    const siteArgIndex = process.argv.indexOf('--site');
    const site = siteArgIndex !== -1 ? process.argv[siteArgIndex + 1] : 'my-blog';
    const contentDir = path.resolve(process.cwd(), 'sites', site || 'my-blog', 'content');

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
                // If we find non-empty line that is not a title, stop looking for title
                break;
            }
        }

        // Prepare frontmatter
        const frontmatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: "${date}"`,
            'layout: article',
            '---',
            ''
        ].join('\n');

        // Remaining content (strip the title line if we extracted it)
        const remainingContent = lines.slice(contentStartLine).join('\n').trim();
        const newContent = frontmatter + '\n' + remainingContent;

        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`  Migrated: ${file} (Date: ${date}, Title: ${title})`);
    }

    console.log('Migration complete.');
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
