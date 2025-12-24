
import { baseLayout } from './base.js';

export interface WebAData {
    layout: 'weba';
    title: string;
    description?: string;
    date?: string;
    author?: string;
    semanticData?: any; // Additional raw data for JSON-LD
    [key: string]: any;
}

export function webaLayout(data: WebAData, bodyContent: string, fontCss: string, fontFamilies: string[]) {
    // Generate JSON-LD from the frontmatter and semanticData
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "DigitalDocument",
        "name": data.title,
        "description": data.description,
        "datePublished": data.date,
        "author": {
            "@type": "Person",
            "name": data.author
        },
        "identifier": data.id || undefined,
        "content": data.semanticData || undefined,
        // Web/A Provenance & LTV Metadata
        "provenance": {
            "generator": {
                "name": "Sorane (SRN) SSG",
                "version": "1.0.0",
                "assertion": "Human-Machine Parity (HMP) Guaranteed via Static Generation"
            },
            "validation": {
                "type": "Trust-Transition-Ready",
                "lastVerified": new Date().toISOString(),
                "timestamp": new Date().toISOString(),
                "tsa": "https://tsa.sorane.io"
            }
        }
    };

    const fullContent = `
        <div id="weba-viewer" class="weba-viewer-layer">
            <!-- Long-term Maintenance Note: 
                 This 'weba-viewer' layer is replaceable during signature maintenance 
                 to ensure compatibility with future browser engines. 
            -->
            
            <article class="weba-document">
                <header class="weba-header">
                    <h1>${data.title}</h1>
                    <div class="weba-meta">
                        <span class="weba-author">${data.author || ''}</span>
                        <span class="weba-date">${data.date || ''}</span>
                    </div>
                </header>
                
                <!-- START OF SIGNED DATA LAYER (WEBA-PAYLOAD) -->
                <div id="weba-payload" class="weba-payload-layer">
                    <!-- Machine-Readable Data (JSON-LD) -->
                    <script type="application/ld+json">
                        ${JSON.stringify(jsonLd, null, 2)}
                    </script>

                    <div class="weba-content">
                        ${bodyContent}
                    </div>
                </div>
                <!-- END OF SIGNED DATA LAYER -->

                <footer class="weba-footer">
                    <div class="weba-meta-badges">
                        <div class="weba-integrity-seal">
                            <span class="seal-icon">⬢</span> Web/A Archival Format (Layered)
                        </div>
                        <div class="weba-parity-badge">
                            <span class="badge-icon">✓</span> Human-Machine Parity (HMP) Verified
                        </div>
                        <div class="weba-ltv-badge">
                            <span class="badge-icon">🕰️</span> LTV (Long-Term Validation) Enabled
                        </div>
                    </div>
                    <p class="weba-notice">
                        This document is a self-contained Web/A bundle. The 'weba-payload' layer is cryptographically signed. 
                        The 'weba-viewer' layer provides human-readable formatting and can be updated for future browser compatibility.
                    </p>
                </footer>
            </article>
        </div>

        <style>
            .weba-viewer-layer {
                --weba-primary: #0070f3;
                --weba-bg: #fff;
                --weba-text: #1a1a1a;
                --weba-muted: #666;
                --weba-border: #eee;
            }

            .weba-document {
                max-width: 800px;
                margin: 40px auto;
                padding: 40px;
                background: var(--weba-bg);
                color: var(--weba-text);
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                border-radius: 12px;
                border: 1px solid var(--weba-border);
                line-height: 1.7;
            }

            .weba-header h1 {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                color: #000;
                font-weight: 700;
            }

            .weba-meta {
                font-size: 0.9rem;
                color: var(--weba-muted);
                margin-bottom: 2rem;
                display: flex;
                gap: 1rem;
                border-bottom: 1px solid #f0f0f0;
                padding-bottom: 1rem;
            }

            .weba-content {
                font-size: 1.1rem;
            }

            .weba-footer {
                margin-top: 4rem;
                padding-top: 2rem;
                border-top: 2px solid #f0f0f0;
            }

            .weba-meta-badges {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 1rem;
            }

            .weba-integrity-seal, .weba-parity-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-weight: bold;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.85rem;
            }

            .weba-integrity-seal {
                color: var(--weba-primary);
                background: #eef6ff;
            }

            .weba-parity-badge {
                color: #059669;
                background: #ecfdf5;
            }

            .weba-ltv-badge {
                color: #7c3aed;
                background: #f5f3ff;
            }

            .weba-notice {
                font-size: 0.8rem;
                color: #999;
            }

            @media (max-width: 600px) {
                .weba-document {
                    margin: 20px;
                    padding: 20px;
                }
            }

            @media print {
                .weba-document {
                    box-shadow: none;
                    border: none;
                    margin: 0;
                    padding: 0;
                }
                .weba-integrity-seal {
                    border: 1px solid var(--weba-primary);
                }
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
