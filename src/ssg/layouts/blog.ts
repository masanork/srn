import { baseLayout } from './base.js';

export interface BlogItem {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    path: string;
    layout: string;
    isSystem?: boolean;
}

export interface BlogData {
    title: string;
    description?: string;
}

export function blogLayout(data: BlogData, allPages: BlogItem[], fontCss: string, fontFamilies: string[], htmlContent: string) {
    // Filter out index and system pages, showing only user articles
    const articles = allPages.filter(item => 
        item.layout === 'article' && 
        !item.isSystem && 
        item.path !== 'index.html'
    );

    const articleCards = articles.map(item => `
        <a href="${item.path}" class="blog-card">
            <div class="blog-card-meta">
                ${item.date ? `<span>${item.date}</span>` : ''}
                ${item.author ? `<span class="sep">/</span><span>${item.author}</span>` : ''}
            </div>
            <h2 class="blog-card-title">${item.title}</h2>
            ${item.description ? `<p class="blog-card-desc">${item.description}</p>` : ''}
            <div class="blog-card-more">Read More →</div>
        </a>
    `).join('');

    const fullContent = `
        <div class="blog-container">
            <header class="blog-header">
                <h1>${data.title}</h1>
                ${data.description ? `<p class="blog-lead">${data.description}</p>` : ''}
                ${htmlContent ? `<div class="blog-custom-content">${htmlContent}</div>` : ''}
            </header>
            <div class="blog-grid">
                ${articleCards}
            </div>
        </div>

        <style>
            .blog-container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 4rem 2rem;
            }
            .blog-header {
                text-align: center;
                margin-bottom: 4rem;
            }
            .blog-header h1 {
                font-size: 3rem;
                font-weight: 800;
                margin-bottom: 1rem;
                color: var(--accent-color, var(--heading-color, #000));
                background: linear-gradient(135deg, var(--accent-color, var(--heading-color, #000)), var(--highlight, var(--primary-color, #3b82f6)));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            /* Fallback for browsers that don't support text clipping or when background fails */
            @supports not (-webkit-background-clip: text) {
                .blog-header h1 {
                    -webkit-text-fill-color: currentColor;
                }
            }
            .blog-lead {
                font-size: 1.25rem;
                color: var(--text-muted);
                margin-bottom: 2rem;
            }
            .blog-custom-content {
                margin: 0 auto 3rem;
                max-width: 600px;
                line-height: 1.8;
                text-align: left;
                padding: 1.5rem;
                background: var(--bg-color);
                border-radius: 0.75rem;
                border: 1px solid var(--border-color);
            }
            .blog-custom-content a {
                color: var(--highlight);
                font-weight: 600;
                text-decoration: underline;
            }
            .blog-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
            }
            .blog-card {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 1rem;
                padding: 2rem;
                text-decoration: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                box-shadow: var(--panel-shadow);
            }
            .blog-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--premium-shadow);
                border-color: var(--highlight);
            }
            .blog-card-meta {
                font-size: 0.85rem;
                color: var(--text-muted);
                margin-bottom: 1rem;
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            .blog-card-meta .sep {
                opacity: 0.3;
            }
            .blog-card-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 0 1rem 0;
                color: var(--accent-color);
                line-height: 1.3;
            }
            .blog-card-desc {
                font-size: 1rem;
                color: var(--text-color);
                opacity: 0.8;
                line-height: 1.6;
                margin-bottom: 1.5rem;
                flex-grow: 1;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .blog-card-more {
                font-weight: 600;
                color: var(--highlight);
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .blog-header h1 { font-size: 2.25rem; }
                .blog-grid { grid-template-columns: 1fr; }
            }
        </style>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies
    });
}
