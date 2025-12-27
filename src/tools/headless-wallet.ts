#!/usr/bin/env bun
import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';

type FlatRow = Record<string, any>;

const parseHtmlJsonLd = (htmlText: string): any | null => {
    const $ = cheerio.load(htmlText);
    let scriptContent = $('#data-layer').html();
    if (!scriptContent) {
        scriptContent = $('script[type="application/ld+json"]').html();
    }
    if (!scriptContent) return null;
    try {
        return JSON.parse(scriptContent);
    } catch {
        return null;
    }
};

const flatten = (obj: any, prefix: string, out: FlatRow) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
        const pathKey = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(value)) {
            value.forEach((entry, idx) => {
                if (entry && typeof entry === 'object') {
                    flatten(entry, `${pathKey}[${idx}]`, out);
                } else {
                    out[`${pathKey}[${idx}]`] = entry;
                }
            });
        } else if (value && typeof value === 'object') {
            flatten(value, pathKey, out);
        } else {
            out[pathKey] = value;
        }
    }
};

const mergeRows = (rows: FlatRow[]): FlatRow => {
    const merged: FlatRow = {};
    for (const row of rows) {
        for (const [key, value] of Object.entries(row)) {
            if (value !== undefined && value !== null && value !== '') {
                if (merged[key] === undefined || merged[key] === null || merged[key] === '') {
                    merged[key] = value;
                }
            }
        }
    }
    return merged;
};

const applyToFormHtml = (html: string, data: FlatRow): string => {
    const $ = cheerio.load(html);
    $('[data-json-path]').each((_, el) => {
        const key = $(el).attr('data-json-path') || '';
        if (!key) return;
        const value = data[key];
        if (value === undefined) return;
        const tag = el.tagName.toLowerCase();
        const type = ($(el).attr('type') || '').toLowerCase();

        if (tag === 'input') {
            if (type === 'checkbox') {
                if (value === true || value === 'true' || value === '1' || value === 1) {
                    $(el).attr('checked', 'checked');
                }
            } else if (type === 'radio') {
                if ($(el).attr('value') === String(value)) {
                    $(el).attr('checked', 'checked');
                }
            } else {
                $(el).attr('value', String(value));
            }
        } else if (tag === 'textarea') {
            $(el).text(String(value));
        } else if (tag === 'select') {
            $(el).find('option').each((_, opt) => {
                if ($(opt).attr('value') === String(value)) {
                    $(opt).attr('selected', 'selected');
                }
            });
        }
    });
    return $.html();
};

program
    .name('weba-headless-wallet')
    .description('Demo: read Web/A documents in a folder and auto-fill a Web/A form')
    .requiredOption('-c, --credentials <dir>', 'Directory containing Web/A HTML documents')
    .requiredOption('-f, --form <file>', 'Target Web/A form HTML file')
    .option('-o, --output <file>', 'Output HTML file', 'autofilled.html')
    .action(async (options) => {
        const credentialsDir = path.resolve(options.credentials);
        const formPath = path.resolve(options.form);
        const outputPath = path.resolve(options.output);

        if (!await fs.pathExists(credentialsDir)) {
            console.error(`Credentials directory not found: ${credentialsDir}`);
            process.exit(1);
        }
        if (!await fs.pathExists(formPath)) {
            console.error(`Form HTML not found: ${formPath}`);
            process.exit(1);
        }

        const files = (await fs.readdir(credentialsDir)).filter(f => f.toLowerCase().endsWith('.html'));
        if (files.length === 0) {
            console.error('No HTML files found in credentials directory.');
            process.exit(1);
        }

        const rows: FlatRow[] = [];
        for (const file of files) {
            const filePath = path.join(credentialsDir, file);
            const htmlText = await fs.readFile(filePath, 'utf-8');
            const jsonLd = parseHtmlJsonLd(htmlText);
            if (!jsonLd) continue;
            const flat: FlatRow = {};
            flatten(jsonLd, '', flat);
            rows.push(flat);
        }

        if (rows.length === 0) {
            console.error('No JSON-LD found in credential files.');
            process.exit(1);
        }

        const merged = mergeRows(rows);
        const formHtml = await fs.readFile(formPath, 'utf-8');
        const outputHtml = applyToFormHtml(formHtml, merged);
        await fs.writeFile(outputPath, outputHtml);

        console.log(`Wrote autofilled form: ${outputPath}`);
    });

program.parse();
