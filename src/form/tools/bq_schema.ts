import * as fs from 'fs';
import * as path from 'path';
import { parseMarkdown } from '@srn/core';

/**
 * BigQuery Schema Generator for Web/A Forms
 */

interface BQField {
    name: string;
    type: 'STRING' | 'FLOAT64' | 'BOOLEAN' | 'TIMESTAMP' | 'RECORD';
    mode: 'NULLABLE' | 'REPEATED' | 'REQUIRED';
    fields?: BQField[];
    description?: string;
}

function mapType(webaType: string): 'STRING' | 'FLOAT64' | 'BOOLEAN' {
    switch (webaType) {
        case 'number':
        case 'calc':
            return 'FLOAT64';
        case 'checkbox':
            return 'BOOLEAN';
        default:
            return 'STRING';
    }
}

export function generateBQSchema(markdown: string, options: { explode?: string } = {}): BQField[] {
    const { jsonStructure } = parseMarkdown(markdown);
    const schema: BQField[] = [];

    // System fields
    schema.push({ name: '_filename', type: 'STRING', mode: 'NULLABLE', description: 'Source HTML filename' });
    schema.push({ name: '_source', type: 'STRING', mode: 'NULLABLE', description: 'Data source (l2 or jsonld)' });
    schema.push({ name: '_l2_sig', type: 'STRING', mode: 'NULLABLE', description: 'L2 signature metadata (JSON)' });

    // Helper to add a field to schema
    const addField = (key: string, webaType: string, label: string) => {
        if (schema.find(f => f.name === key)) return;
        schema.push({
            name: key,
            type: mapType(webaType),
            mode: 'NULLABLE',
            description: label
        });
    };

    // If we are exploding a table, we promote its fields to top-level
    if (options.explode && jsonStructure.tables[options.explode]) {
        const tableFields = jsonStructure.tables[options.explode];
        
        // Add parent fields
        for (const field of jsonStructure.fields) {
            addField(field.key, field.type, field.label);
        }

        // Add table fields (overwriting if needed, though they should be unique)
        for (const col of tableFields) {
            addField(col.key, col.type, col.label);
        }
    } else {
        // Normal mode: fields + nested tables
        for (const field of jsonStructure.fields) {
            addField(field.key, field.type, field.label);
        }

        for (const [tableKey, cols] of Object.entries(jsonStructure.tables)) {
            const bqCols: BQField[] = (cols as any[]).map(col => ({
                name: col.key,
                type: mapType(col.type),
                mode: 'NULLABLE',
                description: col.label
            }));

            schema.push({
                name: tableKey,
                type: 'RECORD',
                mode: 'REPEATED',
                fields: bqCols
            });
        }
    }

    return schema;
}

// CLI Interface
if (import.meta.main) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: bun src/form/tools/bq_schema.ts <form.md> [--explode <tableKey>]");
        process.exit(1);
    }

    const mdPath = path.resolve(args[0]);
    if (!fs.existsSync(mdPath)) {
        console.error("File not found:", mdPath);
        process.exit(1);
    }

    const explodeIdx = args.indexOf('--explode');
    const explode = explodeIdx > -1 ? args[explodeIdx + 1] : undefined;

    const markdown = fs.readFileSync(mdPath, 'utf-8');
    const schema = generateBQSchema(markdown, { explode });

    console.log(JSON.stringify(schema, null, 2));
}
