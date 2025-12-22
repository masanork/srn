import { baseLayout } from './base.js';

export interface ArticleData {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    font?: string | string[];
    [key: string]: any;
}

export function articleLayout(data: ArticleData, bodyContent: string, fontCss: string, fontFamilies: string[]) {
    // Construct schema.org JSON-LD
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title,
        "description": data.description || "",
        "datePublished": data.date || new Date().toISOString().split('T')[0],
        "author": {
            "@type": "Person",
            "name": data.author || "Unknown"
        }
    };

    // Inject heading into body content if not already present (optional design choice)
    // For now, we manually follow the previous design: H1 + Content
    // Inject heading into body content unless specifically hidden or using wide layout (usually index)
    const showHeader = data.layout !== 'width' && data.hideTitle !== true;

    const fullContent = `
        <article>
            ${showHeader ? `
            <header>
                <h1>${data.title}</h1>
                <div class="article-meta">
                    ${data.date ? `<span><time datetime="${data.date}">${data.date}</time></span>` : ''}
                    ${data.author ? `<span>By ${data.author}</span>` : ''}
                </div>
            </header>
            ` : ''}
            <div class="article-body">
                ${bodyContent}
            </div>
        </article>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies,
        jsonLd: schema
    });
}
