# 郵便番号データ形式仕様 v2 (JSON + Gzip)

## 概要

Web/A Form の「単独HTML完結」「モダンブラウザネイティブ」という哲学に基づき、郵便番号データは **最適化されたJSONをGzip圧縮し、Base64エンコードして埋め込む** 方式を採用しています。
独自バイナリ形式（v1）は廃止され、ブラウザの `DecompressionStream` API と `JSON.parse` を活用する、よりシンプルでメンテナンス性の高い構成に移行しました。

## データ構造

最適化されたJSON構造（Prefix Trie）を採用し、データサイズと検索速度のバランスを取っています。

### 最適化グループ (OptimizedGroup)

郵便番号の上3桁（Prefix）をキーとしたオブジェクトです。

```typescript
type PostalData = Record<string, OptimizedGroup>;

interface OptimizedGroup {
  p: number;  // 都道府県ID (1-47)
  t: [
    string,   // 下4桁 (Suffix)
    string,   // 市区町村名
    string    // 町字名
  ][];
}
```

### エンコーディングフロー

1.  **Source**: `ken_all.csv` (日本郵便)
2.  **Build**: `scripts/build_postal_data.ts` がデータを解析し、上記JSON構造を生成。
3.  **Optimize**: `postal-optimized.json` を生成。
4.  **Compress**: `gzip -9` で圧縮 -> `postal-optimized.json.gz` (~1MB)
5.  **Embed**: SSGビルド時に Base64 エンコードして HTML に注入。
6.  **Runtime**: ブラウザが `DecompressionStream` で解凍し、オブジェクトとして展開。

## サイズ

| 形式 | サイズ | 備考 |
|---|---|---|
| Raw CSV | ~18 MB | 元データ |
| Optimized JSON | ~5 MB | 構造化のみ |
| **Gzipped JSON** | **~1 MB** | **埋め込み用ソース** |
| Base64 (HTML内) | ~1.3 MB | 最終的なオーバーヘッド |

## 関連ファイル

- `data/postal/postal-optimized.json.gz` - 圧縮済みマスターデータ
- `src/form/client/postal.ts` - ランタイムローダー（Gzip解凍ロジック含む）
- `src/ssg/layouts/form.ts` - 埋め込みロジック (SSG)
