#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

program
    .name('excel-md-to-weba')
    .description('Convert Excel-exported Markdown to Web/A Maker Markdown')
    .argument('<file>', 'Input Markdown file')
    .option('-o, --output <file>', 'Output Web/A Markdown file')
    .action((file, options) => {
        const inputPath = path.resolve(file);
        if (!fs.existsSync(inputPath)) {
            console.error(`Error: File '${inputPath}' does not exist.`);
            process.exit(1);
        }
        const outputPath = options.output || inputPath.replace(/\.md$/, '_weba.md');

        const content = fs.readFileSync(inputPath, 'utf-8');
        const lines = content.split('\n');
        let outputLines: string[] = [];

        let keyCounter = 1;
        let inTable = false;

        // Simple heuristic regexes
        const isSeparator = (line: string) => line.trim().match(/^\|\s*-+\s*\|/);
        const isTableRow = (line: string) => line.trim().startsWith('|');

        // Function to generate a key from a label
        const generateKey = (label: string) => {
            // Very basic romanization or just id
            // For CLI simplicity, let's use a counter prefix + sanitized label hint
            // e.g. "氏名" -> "k1_shimei" (if we had converter) or just "k1"
            // Let's try to keep some ascii chars if present, else k_N
            const ascii = label.replace(/[^\w]/g, '');
            return `k${keyCounter++}${ascii ? '_' + ascii.substring(0, 5) : ''}`;
        };

        lines.forEach((line, i) => {
            const trimmed = line.trim();

            // 1. Headers
            if (trimmed.startsWith('#')) {
                outputLines.push(trimmed);
                return;
            }

            // 2. Excel Table Rows
            if (isTableRow(trimmed)) {
                // Split cells, handling escaped pipes if necessary (simple split for now)
                const cells = trimmed.split('|').map(c => c.trim()).slice(1, -1);

                // Heuristic A: If row is mostly "NaN" expect one label, convert to Input
                // Heuristic B: If known header row (---), convert to separator
                // Heuristic C: If row has specific values, convert to table row with inputs

                if (isSeparator(trimmed)) {
                    // Table header separator
                    outputLines.push(trimmed);
                    inTable = true;
                    return;
                }

                // Filter out empty/NaN cells
                const validCells = cells.map((c, idx) => ({ text: c, index: idx }))
                    .filter(c => c.text && c.text !== 'NaN');

                if (validCells.length === 0) {
                    // Empty row, ignore or spacer
                    return;
                }

                // Case 1: Likely a Form Label (e.g. "| NaN | 氏名 | NaN | ...")
                // If it's isolated (not inside a large table block), treat as single input
                // But how to know if inside table? 
                // Let's look at next line. If next line is also table, maybe it is a table.
                // But the lgplan.md structure has weird "NaN" lines for layout.

                // Logic: If the cell is a Label (text) and looks like a header for an input...
                // In lgplan.md, structure is: Label -> Value (space). 
                // For now, let's just convert "Label" cells into "- [text:key] Label" 
                // unless we are definitely in a dense table (checked by column count).

                // If row has many columns (like > 5) and we are 'inTable', generate table row
                if (inTable && cells.length > 5) {
                    // Generate table row with inputs for empty cells?
                    // Or if cells have values, keep values.
                    // If cell is "NaN", replace with empty or existing value.
                    // Ideally, we want to put inputs in specific columns.
                    // Simple rule: If cell is NaN/Empty in a data row, make it an input.
                    const newRow = cells.map(c => {
                        if (c === 'NaN' || c === '') {
                            return `[${generateKey('col')}]`;
                        }
                        return c;
                    }).join(' | ');
                    outputLines.push(`| ${newRow} |`);
                } else {
                    // Likely single fields layout
                    // Extract labels
                    validCells.forEach(vc => {
                        // Heuristic: If text contains "：" or looks like label
                        // Just output as form component
                        outputLines.push(`- [text:${generateKey(vc.text)}] ${vc.text}`);
                    });
                    inTable = false; // reset
                }
            } else {
                // Normal text
                if (trimmed.length > 0) outputLines.push(trimmed);
                inTable = false;
            }
        });

        fs.writeFileSync(outputPath, outputLines.join('\n'));
        console.log(`Converted ${file} to ${outputPath}`);
    });

program.parse();
