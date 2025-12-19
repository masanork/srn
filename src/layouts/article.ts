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
    const fullContent = `
        <h1>${data.title}</h1>
        ${bodyContent}
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies,
        jsonLd: schema
    });
}
