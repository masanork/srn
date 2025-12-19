# srn (Sorane)

srn (Short for Sorane) is a Static Site Generator designed for precision and performance in typography.

## Key Features

- **Dynamic Font Subsetting**: Automatically subsets fonts to include only the exact glyphs used in your content.
- **Embedded Fonts**: Embeds the subsetted fonts directly, ensuring accurate rendering without the overhead of unused glyphs.

## はじめに (Introduction in Japanese)

srn (Sorane/空音) は、日本語タイポグラフィの美しさとWebパフォーマンスを両立させるために作られた静的サイトジェネレーターです。

このツール最大の特徴は、**ページコンテンツで使用されている「文字」だけを抽出してフォントファイルを作り直し (サブセット化)、HTMLに直接埋め込む**ことです。

### なぜこれが必要なのか？
日本語フォントは数MB〜数十MBと巨大です。Webフォントとして使うには重すぎますが、サブセット化（常用漢字のみなど）を行ってもまだ数百KB残ることがあり、表示遅延 (FOIT) やレイアウトズレ (CLS) の原因となります。

srnは「その1ページで使われている文字」**だけ**を含んだ数KB〜数十KBの超軽量フォントを生成します。これをHTMLに埋め込むことで、**ネットワークリクエスト・ゼロ、レイアウトシフト・ゼロ**の完璧なレンダリングを一瞬で実現します。

### 使い方クイックスタート

1.  **セットアップ**: [Bun](https://bun.sh) をインストールし、リポジトリをcloneして依存関係を入れます。
    ```bash
    git clone ...
    bun install
    ```
2.  **フォントの準備**: 使いたいフォントファイル (`.otf`, `.ttf`) を `site/fonts/` フォルダに入れます。
    > ※ フォントファイルは `.gitignore` されているため、ご自身のライセンスを持つフォントをローカルに配置してください。
3.  **記事を書く**: `site/content/` に Markdown ファイルを作成し、Frontmatterで使用するフォント名を指定します。
    ```markdown
    ---
    title: "私の記事"
    font: "MyFont.otf"
    ---
    ここへ書いた文字だけが、MyFont.otf から抽出されます。
    ```
4.  **ビルド**: `bun run build` を実行すると `dist/` フォルダにHTMLが生成されます。

---

## Key Features

Sorane aims to provide a seamless way to generate static sites where typography is paramount. Unlike traditional SSGs, **srn generates a unique, optimized font subset for every single page**, embedding it directly into the HTML.

This approach achieves:
- **Zero Font Requests**: No external network calls for font files.
- **Zero Layout Shift (CLS)**: Fonts are available immediately as the DOM parses, guaranteeing perfect rendering from the first frame.
- **Precision**: Only the glyphs used in that specific page are included, keeping the payload minimal even for heavy CJK fonts.

## Architecture

1.  **Input**:
    - **Content**: Markdown/MDX files.
    - **Templates**: HTML/JS layouts.
    - **Source Fonts**: Original full-set font files (OTF/TTF/WOFF2).
2.  **Build Process**:
    - **Analyze**: Scans the compiled HTML of each page to extract every unique character used.
    - **Subset**: Generates a minimal font file containing *only* those characters using a Wasm-based subsetter.
    - **Embed**: Encodes the subsetted font as a Base64 Data URI and injects it into the page's `<style>` block.
3.  **Output**:
    - Single HTML files with zero external font dependencies.

## Technical Stack

- **Runtime**: [Bun](https://bun.sh/) (Fast All-in-One JavaScript Runtime)
- **Font Engine**: `opentype.js` (Pure JavaScript/Wasm subsetting flow)
- **Bundler/Builder**: Bun (Native TypeScript support, no extra config needed)

## Usage Concept

Configuration is kept simple. You associate fonts with content in your config or frontmatter.

```markdown
---
title: "Typography Matters"
font: "Garamond-Premium.otf"
---

This text will be rendered using a custom subset of Garamond,
containing only the letters T, h, i, s, t, e, x... and so on.
```

The resulting HTML will contain:

```html
<style>
@font-face {
  font-family: 'SubsetFont';
  src: url('data:font/ttf;base64,d09GMgABAAAA...') format('truetype');
}
body {
  font-family: 'SubsetFont', serif;
}
</style>
```

## Project Structure

Design separates the **Generator Core** from **User Content**.

```text
srn/
├── src/                # Core generator logic (TypeScript)
│   └── ...
├── site/               # User content and configuration
│   ├── content/        # Markdown files (Blog posts, pages)
│   ├── layouts/        # HTML/JS templates
│   ├── fonts/          # Source font files (NOTE: .gitignored)
│   └── static/         # Images, global CSS, etc.
├── dist/               # Output directory (Generated HTML)
└── package.json
```

## Workflow & Deployment

Since font files are often proprietary and local-only (`.gitignored`), **building must happen locally**. The generated HTML (with embedded subsets) is safe to publish.

1.  **Clone & Setup**:
    ```bash
    git clone https://github.com/user/srn.git
    bun install
    ```
2.  **Bring Your Own Fonts**:
    Place your `.otf` or `.ttf` files into `site/fonts/`.
3.  **Develop**:
    ```bash
    bun run dev  # Watches changes and rebuilds locally
    ```
4.  **Deploy to GitHub Pages**:
    Since the CI cannot build the site (it lacks the fonts), you deploy the built artifacts from your machine.
    ```bash
    bun run build   # Generates site into /dist
    bun run deploy  # Pushes /dist to 'gh-pages' branch
    ```
