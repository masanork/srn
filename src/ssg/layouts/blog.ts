import { baseLayout } from './base.js';

export interface BlogItem {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    path: string;
    layout: string;
    isSystem?: boolean;
    excerptHtml?: string;
    excerptText?: string;
}

export interface BlogData {
    title: string;
    description?: string;
    profileUrl?: string;
    featuredCount?: number;
}

export function blogLayout(data: BlogData, allPages: BlogItem[], fontCss: string, fontFamilies: string[], htmlContent: string) {
    // Filter out index and system pages, showing only user articles
    const articles = allPages.filter(item => 
        item.layout === 'article' && 
        !item.isSystem && 
        item.path !== 'index.html'
    );

    const featuredCount = Math.max(0, data.featuredCount ?? 3);
    const featured = articles.slice(0, featuredCount);
    const remaining = articles.slice(featuredCount);

    const featuredCards = featured.map(item => {
        const excerpt = item.excerptHtml || (item.description ? `<p>${item.description}</p>` : '');
        return `
        <article class="blog-feature">
            <div class="blog-feature-meta">
                ${item.date ? `<span>${item.date}</span>` : ''}
                ${item.author ? `<span class="sep">/</span><span>${item.author}</span>` : ''}
            </div>
            <h2 class="blog-feature-title"><a href="${item.path}">${item.title}</a></h2>
            ${excerpt ? `<div class="blog-feature-excerpt">${excerpt}</div>` : ''}
            <a href="${item.path}" class="blog-feature-more">Read More →</a>
        </article>
        `;
    }).join('');

    const remainingList = remaining.map(item => `
        <li class="blog-list-item">
            <a href="${item.path}" class="blog-list-title">${item.title}</a>
            <div class="blog-list-meta">
                ${item.date ? `<span>${item.date}</span>` : ''}
                ${item.author ? `<span class="sep">/</span><span>${item.author}</span>` : ''}
                ${item.description ? `<span class="sep">/</span><span>${item.description}</span>` : ''}
            </div>
        </li>
    `).join('');

    const profileLink = data.profileUrl
        ? `<a href="${data.profileUrl}" class="blog-profile-link">Profile</a>`
        : '';

    const fullContent = `
        <div class="blog-container">
            <header class="blog-header">
                <h1>${data.title}</h1>
                ${data.description ? `<p class="blog-lead">${data.description}</p>` : ''}
                ${profileLink ? `<div class="blog-profile">${profileLink}</div>` : ''}
                ${htmlContent ? `<div class="blog-custom-content">${htmlContent}</div>` : ''}
            </header>
            ${featuredCards ? `<section class="blog-featured">${featuredCards}</section>` : ''}
            ${remainingList ? `<section class="blog-list"><h2>More Articles</h2><ul>${remainingList}</ul></section>` : ''}
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
            .blog-profile {
                margin-bottom: 1.5rem;
            }
            .blog-profile-link {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.5rem 0.9rem;
                border-radius: 999px;
                border: 1px solid var(--border-color);
                color: var(--accent-color, var(--heading-color, #000));
                font-weight: 600;
                text-decoration: none;
                background: var(--card-bg);
                box-shadow: var(--panel-shadow);
            }
            .blog-profile-link:hover {
                border-color: var(--highlight);
                color: var(--highlight);
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
            .blog-featured {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2.5rem;
                margin-bottom: 4rem;
            }
            .blog-feature {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 1.25rem;
                padding: 2.5rem;
                text-align: left;
                box-shadow: var(--panel-shadow);
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .blog-feature-meta {
                font-size: 0.85rem;
                color: var(--text-muted);
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            .blog-feature-meta .sep {
                opacity: 0.3;
            }
            .blog-feature-title {
                margin: 0;
                font-size: 1.75rem;
                font-weight: 700;
                line-height: 1.2;
            }
            .blog-feature-title a {
                color: var(--accent-color, var(--heading-color, #000));
                text-decoration: none;
            }
            .blog-feature-title a:hover {
                color: var(--highlight);
            }
            .blog-feature-excerpt p {
                margin: 0;
                font-size: 1rem;
                color: var(--text-color);
                opacity: 0.85;
                line-height: 1.7;
            }
            .blog-feature-more {
                font-weight: 600;
                color: var(--highlight);
                font-size: 0.95rem;
                margin-top: auto;
                text-decoration: none;
            }
            .blog-list h2 {
                text-align: left;
                margin-bottom: 1.5rem;
                font-size: 1.5rem;
            }
            .blog-list ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .blog-list-item {
                padding-bottom: 1.25rem;
                border-bottom: 1px solid var(--border-color);
                text-align: left;
            }
            .blog-list-title {
                display: inline-block;
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--accent-color, var(--heading-color, #000));
                text-decoration: none;
                margin-bottom: 0.35rem;
            }
            .blog-list-title:hover {
                color: var(--highlight);
            }
            .blog-list-meta {
                font-size: 0.85rem;
                color: var(--text-muted);
                display: flex;
                gap: 0.5rem;
                align-items: center;
                flex-wrap: wrap;
            }
            .blog-list-meta .sep {
                opacity: 0.3;
            }

            @media (max-width: 768px) {
                .blog-header h1 { font-size: 2.25rem; }
                .blog-featured { grid-template-columns: 1fr; }
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
