
import { WebAParser } from './core/parser.js';
import fs from 'fs/promises';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'parse') {
        const filePath = args[1];
        if (!filePath) {
            console.error("Usage: folio parse <file.md>");
            process.exit(1);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const schema = WebAParser.parse(content);
        console.log(JSON.stringify(schema, null, 2));

    } else if (command === 'fill') {
        const filePath = args[1];
        const dataPath = args.indexOf('--data') !== -1 ? args[args.indexOf('--data') + 1] : undefined;

        if (!filePath || !dataPath) {
            console.error("Usage: folio fill <file.md> --data <data.json>");
            process.exit(1);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const dataContent = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(dataContent);

        const filled = WebAParser.fill(content, data);
        console.log(filled);

    } else {
        console.log("Folio CLI (Prototype)");
        console.log("Usage: folio parse <file.md>");
        console.log("       folio fill <file.md> --data <data.json>");
    }
}

if (import.meta.main) {
    main().catch(console.error);
}
