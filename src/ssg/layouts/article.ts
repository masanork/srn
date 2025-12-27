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
        <footer class="doc-verification no-print" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; font-size: 0.9rem; color: #666;">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                <div style="background: #e6f7e6; color: #2e7d32; padding: 0.4rem 1rem; border-radius: 20px; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                    <span>✓</span> Web/A Signed (PQC)
                </div>
                <div>
                    Issuer: <span style="font-family: monospace; background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px;">${siteDid.split(':').slice(-1)[0].substring(0, 16)}...</span>
                </div>
            </div>
            
            <details style="background: #f9f9f9; border-radius: 8px; border: 1px solid #eee;">
                <summary style="padding: 0.8rem 1rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="opacity: 0.6;">▶</span> View Raw Verification Data (JSON-LD)
                </summary>
                <div style="padding: 0 1rem 1rem 1rem;">
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
        jsonLd: schema
    });
}
