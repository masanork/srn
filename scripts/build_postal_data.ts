#!/usr/bin/env bun
/**
 * 郵便番号データビルドスクリプト
 * 
 * ローカルの utf_ken_all.csv から最適化されたフォーマットを生成します。
 * 
 * データ出典: 日本郵便株式会社 郵便番号データ
 * https://www.post.japanpost.jp/zipcode/dl/utf-8.html
 */

import { writeFileSync, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';
import * as csv from 'fast-csv';

interface PostalRecord {
    zip: string;
    pref: string;
    city: string;
    town: string;
}

const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const CSV_PATH = join(process.cwd(), 'data', 'postal', 'utf_ken_all.csv');
const OUTPUT_DIR = join(process.cwd(), 'data', 'postal');

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function loadFromCSV(): Promise<PostalRecord[]> {
    return new Promise((resolve, reject) => {
        const records: PostalRecord[] = [];
        createReadStream(CSV_PATH)
            .pipe(csv.parse({ headers: false }))
            .on('data', (row: string[]) => {
                // 3: 郵便番号, 6: 都道府県, 7: 市区町村, 8: 町域
                let zip = row[2]?.replace(/[^0-9]/g, '');
                let pref = row[6];
                let city = row[7];
                let town = row[8];

                if (!zip || !pref) return;

                // 日本郵便特有の「以下に掲載がない場合」などのクリーンアップ
                if (town === '以下に掲載がない場合') {
                    town = '';
                }

                // 「（...）」の注釈を削除（必要に応じて）
                // town = town.replace(/（.*）$/, '');

                records.push({ zip, pref, city, town });
            })
            .on('end', () => resolve(records))
            .on('error', reject);
    });
}

function buildOptimizedJSON(records: PostalRecord[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    // 郵便番号でソート
    records.sort((a, b) => a.zip.localeCompare(b.zip));
    
    for (const record of records) {
        const prefix = record.zip.substring(0, 3);
        const suffix = record.zip.substring(3);
        
        if (!result[prefix]) {
            const prefId = PREFECTURES.indexOf(record.pref) + 1;
            result[prefix] = {
                p: prefId,
                t: []
            };
        }
        
        // 重複チェック（同じ郵便番号で複数の町域がある場合などは、とりあえず全部入れる）
        result[prefix].t.push([suffix, record.city, record.town]);
    }
    
    return result;
}

async function main() {
    console.log('📦 郵便番号データビルドスタート');
    
    if (!existsSync(CSV_PATH)) {
        console.error(`❌ CSVファイルが見つかりません: ${CSV_PATH}`);
        process.exit(1);
    }

    console.log('1️⃣ CSVを読み込み中...');
    const records = await loadFromCSV();
    console.log(`   ${records.length} 件のレコードを読み込みました。`);

    console.log('2️⃣ 最適化JSON形式を生成中...');
    const optimizedJson = buildOptimizedJSON(records);
    const optimizedStr = JSON.stringify(optimizedJson);
    const optimizedSize = optimizedStr.length;
    console.log(`   サイズ: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);

    // ファイル出力
    console.log('3️⃣ ファイルを出力中...');
    writeFileSync(join(OUTPUT_DIR, 'postal-optimized.json'), optimizedStr);

    // gzip圧縮
    const compressed = gzipSync(Buffer.from(optimizedStr));
    writeFileSync(join(OUTPUT_DIR, 'postal-optimized.json.gz'), compressed);

    // 埋め込み用の圧縮データ (Base64)
    const base64Data = Buffer.from(optimizedStr).toString('base64');
    writeFileSync(join(OUTPUT_DIR, 'postal-embedded.txt'), base64Data);

    console.log('✅ ビルド完了！');
    console.log(`   - data/postal/postal-optimized.json: ${(optimizedSize / 1024).toFixed(1)} KB`);
    console.log(`   - data/postal/postal-optimized.json.gz: ${(compressed.length / 1024).toFixed(1)} KB`);
    console.log(`   - data/postal/postal-embedded.txt: ${(base64Data.length / 1024).toFixed(1)} KB`);
    
    console.log('\n💡 実行環境でのヒント:');
    console.log('   ブラウザで利用する場合、.json.gz を fetch して DecompressionStream で展開すると');
    console.log('   ネットワーク転送量を最小限に抑えられます。');
}

main().catch(console.error);