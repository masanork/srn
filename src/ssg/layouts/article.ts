import { baseLayout } from './base.js';

export interface ArticleData {
    title: string;
    description?: string;
    date?: string;
    author?: string;
    font?: string | string[];
    [key: string]: any;
}

export function articleLayout(data: ArticleData, bodyContent: string, fontCss: string, fontFamilies: string[], vc?: any) {
    const siteDid = vc?.issuer || "did:web:masanork.github.io:srn";
    const lang = (data.lang || 'ja').toString();

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
        },
        // Web/A Provenance
        ...(vc ? {
            "provenance": {
                "metadata": {
                    "title": data.title,
                    "format": "application/x.web-a+html",
                    "schema": "https://masanork.github.io/srn/schemas/weba-v1.json"
                },
                "producer": {
                    "name": "Sorane (SRN) SSG",
                    "version": "1.0.0",
                    "identifier": siteDid
                },
                "assertions": [
                    {
                        "label": "srn.hmp_declaration",
                        "data": {
                            "assertion": "Human-Machine Parity (HMP) Guaranteed",
                            "generator_hash": vc?.credentialSubject?.["srn:buildId"] || "unknown"
                        }
                    }
                ]
            }
        } : {})
    };

    // Inject heading into body content unless specifically hidden or using wide layout (usually index)
    const showHeader = data.layout !== 'width' && data.hideTitle !== true;

    const verificationFooter = vc ? `
        <footer class="doc-verification no-print" style="margin-top: 5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem; color: #666;">
            <details>
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                    <span>✓</span>
                    <span data-i18n-ja="発行元による真正性の証明" data-i18n-en="Issuer Authenticity Proof">発行元による真正性の証明</span>
                </summary>
                <div style="padding: 1rem 0;">
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4;">${JSON.stringify(vc, null, 2)}</pre>
                </div>
            </details>
        </footer>
    ` : '';

    const fullContent = `
        <article class="weba-article">
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
            ${verificationFooter}
        </article>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies,
        jsonLd: schema,
        lang: lang
    });
}
