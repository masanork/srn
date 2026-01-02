#!/usr/bin/env bun
/**
 * Local Government Code Optimizer
 * Converts lg2024a.csv and lg2024b.csv into optimized JSON format
 */

import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
import { createHash } from 'crypto';

interface LgRecord {
    pref: string;
    city: string;
}

interface LgData {
    [code: string]: LgRecord;
}

function parseCSV(filePath: string): LgData {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const data: LgData = {};

    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV (handle quoted fields)
        const match = line.match(/^(\d+),\"?([^\"]*?)\"?,\"?([^\"]*?)\"?,\"?([^\"]*?)\"?,\"?([^\"]*?)\"?/);
        if (!match) continue;

        const [, code, pref, city] = match;

        // Clean up values
        const cleanPref = pref.replace(/\n/g, '').trim();
        const cleanCity = city.replace(/\n/g, '').trim();

        data[code] = {
            pref: cleanPref,
            city: cleanCity
        };
    }

    return data;
}

async function main() {
    const dataDir = path.resolve('shared/data/lg');
    const outputDir = dataDir;

    console.log('📊 Processing local government code data...');

    // Parse both CSV files
    const dataA = parseCSV(path.join(dataDir, 'lg2024a.csv'));
    const dataB = parseCSV(path.join(dataDir, 'lg2024b.csv'));

    // Merge (B takes precedence for duplicates)
    const mergedData = { ...dataA, ...dataB };

    console.log(`✅ Parsed ${Object.keys(mergedData).length} local government codes`);

    // Write uncompressed JSON
    const jsonPath = path.join(outputDir, 'lg-optimized.json');
    const jsonString = JSON.stringify(mergedData, null, 0);
    fs.writeFileSync(jsonPath, jsonString);
    console.log(`💾 Wrote ${jsonPath} (${(jsonString.length / 1024).toFixed(2)} KB)`);

    // Gzip compression
    const gzipPath = path.join(outputDir, 'lg-optimized.json.gz');
    const gzipped = zlib.gzipSync(jsonString, { level: 9 });
    fs.writeFileSync(gzipPath, gzipped);
    const gzipSize = gzipped.length;
    console.log(`🗜️  Wrote ${gzipPath} (${(gzipSize / 1024).toFixed(2)} KB, ${((gzipSize / jsonString.length) * 100).toFixed(1)}% of original)`);

    // Calculate digest
    const digest = createHash('sha256').update(gzipped).digest('hex');

    // Create manifest
    const manifest = {
        version: '2024',
        source: ['lg2024a.csv', 'lg2024b.csv'],
        count: Object.keys(mergedData).length,
        digest: `sha256:${digest}`,
        size: gzipSize,
        generatedAt: new Date().toISOString()
    };

    const manifestPath = path.join(outputDir, 'lg-manifest.json');
    fs.writeJSONSync(manifestPath, manifest, { spaces: 2 });
    console.log(`📋 Wrote ${manifestPath}`);
    console.log(`\n✨ Optimization complete!`);
    console.log(`   Digest: ${digest.substring(0, 16)}...`);
}

main().catch(console.error);
