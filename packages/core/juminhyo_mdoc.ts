import {
    createMDoc,
    p256GenerateKeyPair,
    bytesToHex,
    initWasm
} from './src/index';

import { decode } from 'cbor-x';

// Juminhyo Data (Parsed from juminhyo.md frontmatter)
const juminhyoData = {
    title: "（見本）住民票の写し（世帯連記式）",
    layout: "juminhyo",
    date: "2025-12-21",
    description: "住民票の写し（世帯連記式・見本）",
    font: "GJM",
    証明書名称: "住民票（見本）",
    交付年月日: "2026-01-15",
    世帯住所: "東京都港区虎ノ門2-2-1 虎ノ門ハイツ101号",
    世帯主氏名: "䶒藤󠄃 太朗󠄅",
    watermark: "見本",
    発行者役職: "△△△△長",
    発行者氏名: "○○　○○",
    ai_generated: true,
    // Flattened Members: In standard mDoc, repeating structures like 'members' 
    // are often tricky for 'fully selective disclosure' if we just put an array.
    // If we want each member to be selectively disclosable, we can:
    // A. Put them as separate keys (member_0, member_1...)
    // B. Use standard mDoc assumption that the whole array is one data element.
    //
    // However, the user asked "All is selective disclosure?".
    // To achieve granular control over each member, we will flatten them here.
    // OR we rely on the fact that if we put an Array, it's all-or-nothing for that array.
    //
    // For this PoC to be maximalist about selective disclosure, 
    // we will store each member as a separate top-level item in the namespace.
    // Also, inside each member, we might want fields to be selective too?
    // mDoc standard structure is flat (Key -> Value). 
    // Nested recursion of selective disclosure (SD-JWT style) is not standard mDoc.
    // Standard mDoc is: Namespace -> [Item1, Item2, Item3...] where each Item is SD.
    // So if "member_0" is an Item, and its value is a Map, that Map is revealed wholly or mostly.
    // If we want to hide "MyNumber" inside "member_0", "member_0_mynumber" should be a separate Item.

    // Strategy for this PoC: 
    // Flatten everything to simulate "Everything is strictly selective".
    // "member_0_name", "member_0_dob", ...
};

const members = [
    {
        氏名: "䶒藤󠄃 太朗󠄅",
        フリガナ: "サイトウ タロウ",
        生年月日: "1989-01-01",
        性別: "男",
        続柄: "世帯主",
        住民となった日: "2019-12-04",
        住民となった事由: "転入",
        住所を定めた日: "2019-12-04",
        届出日: "2019-12-01",
        前住所: "東京都千代田区霞が関2丁目2番1号",
        本籍: ["東京都千代田区千代田1-1", "筆頭者：䶒藤󠄃 太朗󠄅"],
        個人番号: "379474484458",
        住民票コード: "24727059608",
        備考: ["自動交付機利用者"]
    },
    {
        氏名: "䶒藤󠄃 花󠄃子",
        フリガナ: "サイトウ ハナコ",
        旧氏: "渡𮞽",
        旧氏カナ: "ワタナベ",
        生年月日: "1993-05-05",
        性別: "女",
        続柄: "妻",
        住民となった日: "2019-12-04",
        住民となった事由: "転入",
        住所を定めた日: "2019-12-04",
        届出日: "2019-12-01",
        前住所: "東京都千代田区霞が関2丁目2番1号",
        本籍: ["東京都千代田区千代田1-1", "筆頭者：䶒藤󠄃 太朗󠄅"],
        個人番号: "454972364860",
        住民票コード: "24846016224"
    },
    {
        氏名: "䶒藤󠄃 一朗󠄅",
        フリガナ: "サイトウ イチロウ",
        生年月日: "2019-05-01",
        性別: "男",
        続柄: "子",
        住民となった日: "2019-12-04",
        住民となった事由: "出生",
        住所を定めた日: "＊＊＊",
        届出日: "2019-12-01",
        前住所: "東京都千代田区霞が関2丁目2番1号",
        本籍: ["東京都千代田区千代田1-1", "筆頭者：䶒藤󠄃 太朗󠄅"],
        個人番号: "507957100721",
        住民票コード: "25208017643"
    },
    {
        氏名: "䶒藤󠄃 二朗󠄅",
        フリガナ: "サイトウ ジロウ",
        生年月日: "2019-05-01",
        性別: "男",
        続柄: "子",
        住民となった日: "2019-12-04",
        住民となった事由: "出生",
        住所を定めた日: "＊＊＊",
        届出日: "2019-12-01",
        前住所: "東京都千代田区霞が関2丁目2番1号",
        本籍: ["東京都千代田区千代田1-1", "筆頭者：䶒藤󠄃 太朗󠄅"],
        個人番号: "507957100722",
        住民票コード: "25208017644"
    }
];

// Helper to flatten object
function flatten(prefix: string, obj: any, target: any) {
    for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
            // Check if array of primitives (like honseki) or objects
            if (v.length > 0 && typeof v[0] === 'string') {
                target[`${prefix}${k}`] = v; // Keep primitive arrays as one item (or flatten indices)
            } else {
                // Ignore complex arrays for this simple flattener if not handled
            }
        } else if (typeof v === 'object' && v !== null) {
            flatten(`${prefix}${k}_`, v, target);
        } else {
            target[`${prefix}${k}`] = v;
        }
    }
}

async function main() {
    await initWasm();
    console.log("=== Generating Juminhyo mDoc with Full Selective Disclosure ===\n");

    const fullClaims: Record<string, any> = { ...juminhyoData };

    // Flatten members into the top-level claims
    // member_0_氏名, member_0_個人番号 ...
    members.forEach((m, idx) => {
        flatten(`世帯員_${idx}_`, m, fullClaims);
    });

    // Sort keys for consistent display
    const sortedKeys = Object.keys(fullClaims).sort();
    const sortedClaims: Record<string, any> = {};
    sortedKeys.forEach(k => sortedClaims[k] = fullClaims[k]);

    console.log(`Total Data Elements (Selective Disclosure Items): ${sortedKeys.length}`);

    // Setup Keys
    const issuerKeyPair = p256GenerateKeyPair();
    const deviceKeyPair = p256GenerateKeyPair();
    const issuerKeys = {
        p256: {
            privateKey: bytesToHex(issuerKeyPair.privateKey),
            publicKey: bytesToHex(issuerKeyPair.publicKey)
        }
    };
    const deviceKeyHex = bytesToHex(deviceKeyPair.publicKey);

    // Create mDoc
    const { mdoc, b64url } = await createMDoc(
        sortedClaims,
        issuerKeys,
        deviceKeyHex,
        "io.github.masanork.srn.credential.juminhyo",
        "io.github.masanork.srn.schema.juminhyo.v1"
    );

    console.log(`[Result]`);
    console.log(`mDoc Binary Size: ${mdoc.length} bytes`);
    console.log(`mDoc Base64URL  : ${b64url.length} bytes`);

    // Approximate overhead
    const jsonSize = JSON.stringify({ ...juminhyoData, members }).length;
    console.log(`Original JSON Size: ${jsonSize} bytes`);
    console.log(`Overhead Ratio    : ${(mdoc.length / jsonSize * 100).toFixed(1)}%`);

    console.log(`\nNote: Each of the ${sortedKeys.length} fields is individually hashed and signed.`);
    console.log("Example fields created:");
    sortedKeys.slice(0, 5).forEach(k => console.log(` - ${k}`));
    console.log(" ...");
    sortedKeys.slice(-5).forEach(k => console.log(` - ${k}`));
}

main().catch(console.error);
