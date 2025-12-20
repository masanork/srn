
import { baseLayout } from './base.js';

export interface SearchData {
    title: string;
    description: string;
    layout: 'search';
    [key: string]: any;
}

export function searchLayout(data: SearchData, htmlContent: string, fontCss: string, fontFamilies: string[]) {

    const fullContent = `
        <style>
            .search-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 1rem;
            }
            .search-box {
                width: 100%;
                padding: 1rem;
                font-size: 1.2rem;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-bottom: 2rem;
            }
            .results-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 1rem;
            }
            .result-item {
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                background: white;
                cursor: pointer;
                transition: transform 0.1s;
            }
            .result-item:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .r-char {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }
            .r-meta {
                font-size: 0.8rem;
                color: #666;
                font-family: monospace;
            }
            .r-font {
                font-size: 0.7rem;
                color: #888;
                margin-top: 0.2rem;
            }
            .loading {
                text-align: center;
                padding: 2rem;
                color: #666;
            }
        </style>

        <div class="search-container">
            <h1>${data.title}</h1>
            <p>${data.description}</p>
            
            <input type="text" id="searchInput" class="search-box" placeholder="Search by Glyph Name, ID, or Unicode (e.g. MJ010020)...">
            
            <div id="results" class="results-grid"></div>
            <div id="status" class="loading">Loading index...</div>
        </div>

        <script type="module">
            let index = [];
            const resultEl = document.getElementById('results');
            const statusEl = document.getElementById('status');
            const inputEl = document.getElementById('searchInput');

            // Fetch index
            try {
                const res = await fetch('/glyph-index.json');
                index = await res.json();
                statusEl.textContent = 'Loaded ' + index.length + ' glyphs. Type to search.';
            } catch (e) {
                statusEl.textContent = 'Error loading index.';
                console.error(e);
            }

            function render(items) {
                // Limit to 100 items for performance
                const displayItems = items.slice(0, 100);
                
                resultEl.innerHTML = displayItems.map(item => {
                    const char = item.unicode_hex ? String.fromCodePoint(parseInt(item.unicode_hex.replace('U+', ''), 16)) : '?';
                    const syntax = '[' + item.name + ']'; 
                    
                    // Note: Use backslash-escaped backticks for inner template
                    const onClick = "navigator.clipboard.writeText('" + syntax + "'); alert('Copied: " + syntax + "')";
                    
                    return \`
                        <div class="result-item" onclick="\${onClick}">
                            <div class="r-char">\${char}</div>
                            <div class="r-meta">\${item.name}</div>
                            <div class="r-font">\${item.font_filename}</div>
                        </div>
                    \`;
                }).join('');
                
                if (items.length > 100) {
                    const more = document.createElement('div');
                    more.style.gridColumn = '1 / -1';
                    more.style.textAlign = 'center';
                    more.style.padding = '1rem';
                    more.textContent = '...and ' + (items.length - 100) + ' more matches';
                    resultEl.appendChild(more);
                }
            }

            inputEl.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                if (!q) {
                    resultEl.innerHTML = '';
                    return;
                }

                const matches = index.filter(item => {
                    return (item.name && item.name.toLowerCase().includes(q)) || 
                           (item.unicode_hex && item.unicode_hex.toLowerCase().includes(q));
                });

                render(matches);
            });

        </script>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies
    });
}
