
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

async function main() {
    const contentDir = path.resolve(process.cwd(), 'sites/my-blog/content');
    const files = await glob('**/*.md', { cwd: contentDir });

    console.log(`Checking ${files.length} files in ${contentDir}...`);

    let updatedCount = 0;

    for (const file of files) {
        if (file === 'index.md' || file === 'profile.md') continue;

        const filePath = path.join(contentDir, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(source);

        // Try to get date from frontmatter, then filename
        let dateStr = data.date;
        if (!dateStr) {
            const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
            if (match) {
                dateStr = match[1];
            }
        }

        if (dateStr) {
            const date = new Date(dateStr);
            const cutoff = new Date('2022-01-01');

            if (date < cutoff) {
                if (!data.noFontEmbedding) {
                    data.noFontEmbedding = true;
                    const updatedSource = matter.stringify(content, data);
                    await fs.writeFile(filePath, updatedSource);
                    updatedCount++;
                }
            }
        }
    }

    console.log(`Done. Updated ${updatedCount} files.`);
}

main().catch(console.error);
