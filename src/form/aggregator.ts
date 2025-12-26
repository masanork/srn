#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as csv from 'fast-csv';

program
    .name('weba-aggregator')
    .description('Aggregate JSON-LD data from multiple Web/A HTML files')
    .argument('<directory>', 'Directory containing Web/A HTML files')
    .option('-o, --output <file>', 'Output CSV file path', 'output.csv')
    .action((directory, options) => {
        const dirPath = path.resolve(directory);
        if (!fs.existsSync(dirPath)) {
            console.error(`Error: Directory '${dirPath}' does not exist.`);
            process.exit(1);
        }

        const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.html'));
        console.log(`Found ${files.length} HTML files in ${dirPath}`);

        const aggregatedData: any[] = [];
        const allKeys = new Set<string>(['_filename']);

        let processedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const $ = cheerio.load(content);

                // Find JSON-LD
                let scriptContent = $('#data-layer').html();
                if (!scriptContent) {
                    scriptContent = $('script[type="application/ld+json"]').html();
                }

                if (scriptContent) {
                    const json = JSON.parse(scriptContent);
                    const row: any = { '_filename': file };

                    for (const key of Object.keys(json)) {
                        if (key.startsWith('@')) continue; // Skip @context, @type

                        const val = json[key];
                        allKeys.add(key);

                        if (typeof val === 'object' && val !== null) {
                            row[key] = JSON.stringify(val);
                        } else {
                            row[key] = val;
                        }
                    }
                    aggregatedData.push(row);
                    processedCount++;
                } else {
                    console.warn(`Warning: No JSON-LD found in ${file}`);
                }
            } catch (e: any) {
                console.error(`Error processing ${file}: ${e.message}`);
                errorCount++;
            }
        }

        // Write CSV
        const sortedKeys = Array.from(allKeys).sort((a, b) => {
            if (a === '_filename') return -1;
            if (b === '_filename') return 1;
            return a.localeCompare(b);
        });

        const csvStream = csv.format({ headers: sortedKeys, writeBOM: true });
        const writableStream = fs.createWriteStream(options.output);

        csvStream.pipe(writableStream).on('end', () => {
            console.log(`Successfully wrote ${processedCount} records to ${options.output}`);
            if (errorCount > 0) console.log(`(Failed to process ${errorCount} files)`);
        });

        aggregatedData.forEach(row => csvStream.write(row));
        csvStream.end();
    });

program.parse();
