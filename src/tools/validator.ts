import { parseMarkdown } from '@srn/core';
import fs from 'fs-extra';
import { parseAttribute } from '../../packages/core/src/utils';

interface ValidationContext {
    definedKeys: Set<string>;
    masterKeys: Map<string, number>;
    errors: string[];
    warnings: string[];
}

export async function validateMarkdownFile(filePath: string) {
    console.log(`
🔍 Validating: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const { jsonStructure } = parseMarkdown(content);
    
    const ctx: ValidationContext = {
        definedKeys: new Set(),
        masterKeys: new Map(),
        errors: [],
        warnings: []
    };

    // Collect Master Data
    if (jsonStructure.masterData) {
        for (const [key, rows] of Object.entries(jsonStructure.masterData)) {
            const data = rows as string[][];
            // Assuming first row is header? Or just check max length found?
            // Usually first row is header.
            ctx.masterKeys.set(key, data[0]?.length || 0);
        }
    }

    // Collect Field Keys
    if (jsonStructure.fields) {
        jsonStructure.fields.forEach((f: any) => {
            ctx.definedKeys.add(f.key);
        });
    }
    if (jsonStructure.tables) {
        for (const [tableKey, fields] of Object.entries(jsonStructure.tables)) {
            (fields as any[]).forEach(f => ctx.definedKeys.add(f.key));
        }
    }

    // Validate Fields
    jsonStructure.fields.forEach((f: any) => validateField(f, ctx));
    
    if (jsonStructure.tables) {
        for (const [tableKey, fields] of Object.entries(jsonStructure.tables)) {
            (fields as any[]).forEach(f => validateField(f, ctx, true));
        }
    }

    // Report
    if (ctx.errors.length === 0 && ctx.warnings.length === 0) {
        console.log(`✅ No issues found.`);
    } else {
        if (ctx.warnings.length > 0) {
            console.log(`
⚠️  Warnings:`);
            ctx.warnings.forEach(w => console.log(`   - ${w}`));
        }
        if (ctx.errors.length > 0) {
            console.log(`
❌ Errors:`);
            ctx.errors.forEach(e => console.error(`   - ${e}`));
            process.exit(1);
        }
    }
}

function validateField(field: any, ctx: ValidationContext, inTable = false) {
    const attrs = field.attributes || '';

    // 1. Check Master Data Reference (src)
    const src = parseAttribute(attrs, 'src');
    if (src && !ctx.masterKeys.has(src)) {
        ctx.errors.push(`Field "${field.key}": src references unknown master "${src}"`);
    }

    // 2. Check Autofill
    const autofill = parseAttribute(attrs, 'autofill');
    if (autofill) {
        if (autofill === 'postal' || autofill === 'lg' || autofill.startsWith('lg:') || autofill.startsWith('postal:')) {
            // Built-in special values, OK
        } else if (autofill.includes(':')) {
            const mappings = autofill.split(',');
            mappings.forEach(m => {
                const parts = m.split(':');
                if (parts.length === 2) {
                    const [targetKey, idxStr] = parts;
                    const idx = parseInt(idxStr, 10);
                    
                    if (!ctx.definedKeys.has(targetKey)) {
                        // In dynamic tables, target might be in the same row.
                        // definedKeys contains all keys from all tables, so it should be there.
                        ctx.warnings.push(`Field "${field.key}": autofill references unknown target field "${targetKey}"`);
                    }

                    if (src && ctx.masterKeys.has(src)) {
                        const maxCols = ctx.masterKeys.get(src)!;
                        if (idx < 1 || idx > maxCols) {
                            ctx.errors.push(`Field "${field.key}": autofill index ${idx} out of bounds for master "${src}" (max ${maxCols})`);
                        }
                    }
                }
            });
        }
    }

    // 3. Check show_if
    if (field.show_if) {
        const condition = field.show_if;
        const match = condition.match(/^([a-zA-Z0-9_]+)\s*(==|!=)/);
        const refKey = match ? match[1] : condition.trim();
        
        if (!ctx.definedKeys.has(refKey)) {
            // Check if refKey is actually a literal value? No, show_if target is key.
            // But sometimes people write "true" or "false" literals?
            if (refKey !== 'true' && refKey !== 'false') {
                ctx.warnings.push(`Field "${field.key}": show_if references unknown key "${refKey}"`);
            }
        }
    }
}

if (import.meta.main) {
    const target = process.argv[2];
    if (!target) {
        console.error("Usage: bun src/tools/validator.ts <markdown_file>");
        process.exit(1);
    }
    validateMarkdownFile(target).catch(e => console.error(e));
}