
import fs from 'fs-extra';
import path from 'path';

// Generate a standalone HTML catalog in site/fonts/catalog.html
// This tool assumes the fonts.db is already built in site/data/fonts.db
// It will embed the glyph index JS, allowing a local file opening.

import { loadConfig, getAbsolutePaths } from './config.ts';

const config = await loadConfig();
const { FONTS_DIR, DATA_DIR, DIST_DIR } = getAbsolutePaths(config);

async function main() {
    // Read glyph index from DIST if available, or site/data?
    // Actually the build-db script pushed to dist/glyph-index.json.
    // Let's read dist/glyph-index.json.
    const indexFile = path.join(DIST_DIR, 'glyph-index.json');
    if (!fs.existsSync(indexFile)) {
        console.error("Glyph index not found in dist/. Please run 'bun run db:build' first.");
        return;
    }

    const glyphIndex = await fs.readJson(indexFile);
    console.log(`Loaded ${glyphIndex.length} glyphs from index.`);

    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Font Catalog</title>
    <style>
        body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; }
        .search-container { max-width: 1200px; margin: 0 auto; }
        .search-box { width: 100%; padding: 1rem; font-size: 1.2rem; margin-bottom: 2rem; border-radius: 8px; border: 1px solid #ccc; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; }
        .item { 
            background: white; border: 1px solid #eee; padding: 10px; border-radius: 8px; 
            text-align: center; cursor: pointer; transition: transform 0.1s; 
            height: 140px; display: flex; flex-direction: column; justify-content: center;
        }
        .item:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .preview { font-size: 48px; margin-bottom: 5px; line-height: 1.2; }
        .meta { font-size: 10px; color: #666; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        dialog { padding: 2rem; border-radius: 8px; border: 1px solid #ccc; max-width: 600px; width: 90%; }
        button { cursor: pointer; padding: 0.5rem 1rem; }
    </style>
</head>
<body>
    <div class="search-container">
        <h1>Local Font Catalog</h1>
        <p>This file is designed to be opened directly in the browser (file://). Fonts are loaded from the same directory.</p>
        <input type="text" id="q" class="search-box" placeholder="Search glyphs (name, unicode)...">
        <div id="status">Loading...</div>
        <div id="grid" class="grid"></div>
    </div>

    <dialog id="detail">
        <div style="text-align: right;"><button onclick="document.getElementById('detail').close()">Close</button></div>
        <div id="detail-content"></div>
    </dialog>

    <script>
        // Embedded Data
        const glyphs = ${JSON.stringify(glyphIndex)};

        const grid = document.getElementById('grid');
        const status = document.getElementById('status');
        const input = document.getElementById('q');
        const loadedFonts = new Set();

        status.textContent = 'Loaded ' + glyphs.length + ' glyphs.';

        async function loadFont(filename, familyName) {
            if (loadedFonts.has(filename)) return;
            // Relative path to font file in same directory
            const url = './' + filename;
            const font = new FontFace(familyName, 'url("' + url + '")');
            try {
                await font.load();
                document.fonts.add(font);
                loadedFonts.add(filename);
                console.log('Loaded ' + filename);
            } catch (e) {
                console.error('Failed to load ' + filename, e);
            }
        }

        window.show = async (i) => {
            const g = window.currentGlyphs[i];
            const familyName = 'Preview-' + g.font_filename.replace(/\\W/g, '');
            
            const dialog = document.getElementById('detail');
            document.getElementById('detail-content').innerHTML = 'Loading font...';
            dialog.showModal();

            await loadFont(g.font_filename, familyName);

            const char = g.unicode_hex ? String.fromCodePoint(parseInt(g.unicode_hex.replace('U+', ''), 16)) : '?';
            
            document.getElementById('detail-content').innerHTML = \`
                <div style="text-align: center;">
                    <div style="font-family: '\${familyName}'; font-size: 150px; line-height: 1.2; 
                        border: 1px dashed #ccc; margin: 1rem auto; width: 200px; height: 200px; 
                        display: flex; align-items: center; justify-content: center;">
                        \${char}
                    </div>
                    <h2>\${g.name}</h2>
                    <table style="margin: 0 auto; text-align: left; border-spacing: 10px;">
                        <tr><th>Unicode</th><td>\${g.unicode_hex || 'N/A'}</td></tr>
                        <tr><th>Index</th><td>\${g.glyph_index}</td></tr>
                        <tr><th>Advance</th><td>\${g.advance_width}</td></tr>
                        <tr><th>File</th><td>\${g.font_filename}</td></tr>
                        <tr><th>Family</th><td>\${g.font_family}</td></tr>
                    </table>
                </div>
            \`;
        };

        function render(list) {
            window.currentGlyphs = list;
            // Render top 200
            const slice = list.slice(0, 200);
            
            // Trigger font loads for these items
            slice.forEach(g => {
                const familyName = 'Preview-' + g.font_filename.replace(/\W/g, '');
                loadFont(g.font_filename, familyName);
            });

            grid.innerHTML = slice.map((g, i) => {
                const char = g.unicode_hex ? String.fromCodePoint(parseInt(g.unicode_hex.replace('U+', ''), 16)) : (g.name ? g.name : '?');
                const familyName = 'Preview-' + g.font_filename.replace(/\W/g, '');
                
                return \`
                    <div class="item" onclick="show(\${i})">
                        <div class="preview" style="font-family: '\${familyName}', sans-serif;">\${char}</div>
                        <div class="meta">\${g.name || g.unicode_hex}</div>
                        <div class="meta">\${g.font_filename}</div>
                    </div>
                \`;
            }).join('');

            if (list.length > 200) {
                const more = document.createElement('div');
                more.textContent = '... ' + (list.length - 200) + ' more hidden';
                more.style.gridColumn = '1/-1';
                more.style.textAlign = 'center';
                more.style.padding = '1rem';
                grid.appendChild(more);
            }
        }

        // Initial render (show nothing or random? Just show first few)
        render(glyphs.slice(0, 100));

        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if(!q) { render([]); return; }
            
            const hits = glyphs.filter(g => 
                (g.name && g.name.toLowerCase().includes(q)) || 
                (g.unicode_hex && g.unicode_hex.toLowerCase().includes(q))
            );
            render(hits);
        });

    </script>
</body>
</html>
    `;

    const outFile = path.join(FONTS_DIR, 'catalog.html');
    await fs.writeFile(outFile, html);
    console.log(`Generated catalog at ${outFile}`);
}

main().catch(console.error);
