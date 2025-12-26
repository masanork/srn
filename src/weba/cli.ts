
import { generateHtml } from './generator';
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: bun src/weba/cli.ts <input.md>');
    process.exit(1);
}

const inputFile = args[0];
if (!inputFile) {
    console.error('No input file specified.');
    process.exit(1);
}
try {
    const markdown = readFileSync(inputFile, 'utf-8');
    const html = generateHtml(markdown);
    console.log(html);
} catch (e) {
    console.error(`Error reading ${inputFile}:`, e);
    process.exit(1);
}
