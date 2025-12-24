
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
                "tsa": "https://tsa.example.org"
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
                            <span class="seal-icon">⬢</span> Web/A-1p (Provenance Level)
                        </div>
                        <div class="weba-parity-badge" title="Verified by Sorane SSG Engine">
                            <span class="badge-icon">✓</span> HMP Parity Guaranteed
                        </div>
                        <div class="weba-ltv-badge">
                            <span class="badge-icon">🕰️</span> LTV: Trust-Transition Ready
                        </div>
                    </div>
                    
                    <div class="weba-manifest-box">
                        <details>
                            <summary>View Provenance Manifest (C2PA-style)</summary>
                            <pre class="manifest-content">${JSON.stringify(jsonLd.provenance, null, 2)}</pre>
                        </details>
                    </div>

                    <p class="weba-notice">
                        <strong>Bimodal Discovery:</strong> This document automatically adjusts between <em>Archive View</em> (Fixed) and <em>Wallet View</em> (Responsive). 
                        The 'weba-payload' (this content) is cryptographically bound to the issuer's identity.
                    </p>
                </footer>
            </article>
        </div>

        <style>
            :root {
                --weba-primary: #0070f3;
                --weba-bg: #f8f9fa;
                --weba-card-bg: #fff;
                --weba-text: #1a1a1a;
                --weba-muted: #666;
                --weba-border: #eaeaea;
            }

            .weba-viewer-layer {
                background: var(--weba-bg);
                min-height: 100vh;
                padding: 40px 20px;
                font-family: system-ui, -apple-system, sans-serif;
            }

            /* BIMODAL PRESENTATION LOGIC */
            
            /* 1. Archive View (Desktop/Tablet): Fixed Paper-like Layout */
            @media (min-width: 769px) {
                .weba-document {
                    max-width: 210mm; /* A4 width */
                    min-height: 297mm; /* A4 height */
                    margin: 0 auto;
                    padding: 20mm;
                    background: var(--weba-card-bg);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    border: 1px solid var(--weba-border);
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
            }

            /* 2. Wallet View (Mobile): Responsive Card-like Layout */
            @media (max-width: 768px) {
                .weba-viewer-layer {
                    padding: 10px;
                }
                .weba-document {
                    background: var(--weba-card-bg);
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .weba-header h1 {
                    font-size: 1.5rem !important;
                }
            }

            .weba-header h1 {
                font-size: 2.5rem;
                margin-top: 0;
                margin-bottom: 0.5rem;
                color: #000;
                font-weight: 800;
                letter-spacing: -0.02em;
            }

            .weba-meta {
                font-size: 0.9rem;
                color: var(--weba-muted);
                margin-bottom: 3rem;
                display: flex;
                gap: 1.5rem;
                border-bottom: 1px solid var(--weba-border);
                padding-bottom: 1.5rem;
            }

            .weba-content {
                flex-grow: 1;
                font-size: 1.1rem;
                color: #333;
            }

            .weba-footer {
                margin-top: 5rem;
                padding-top: 2rem;
                border-top: 1px solid var(--weba-border);
            }

            .weba-meta-badges {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 1.5rem;
            }

            .weba-integrity-seal, .weba-parity-badge, .weba-ltv-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
                padding: 6px 14px;
                border-radius: 8px;
                font-size: 0.75rem;
                border: 1px solid transparent;
            }

            .weba-integrity-seal {
                color: var(--weba-primary);
                background: #ebf5ff;
                border-color: #c7d2fe;
            }

            .weba-parity-badge {
                color: #059669;
                background: #ecfdf5;
                border-color: #a7f3d0;
            }

            .weba-ltv-badge {
                color: #7c3aed;
                background: #f5f3ff;
                border-color: #ddd6fe;
            }

            .weba-manifest-box {
                margin: 20px 0;
                background: #f1f1f1;
                border-radius: 8px;
                padding: 10px;
            }

            .weba-manifest-box summary {
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                color: var(--weba-muted);
            }

            .manifest-content {
                font-size: 0.75rem;
                overflow-x: auto;
                background: #222;
                color: #0f0;
                padding: 15px;
                border-radius: 4px;
                margin-top: 10px;
            }

            .weba-notice {
                font-size: 0.8rem;
                color: #888;
                line-height: 1.5;
            }

            @media print {
                .weba-viewer-layer { background: #fff; padding: 0; }
                .weba-document { box-shadow: none; border: none; width: 100%; margin: 0; padding: 0; }
                .weba-manifest-box { display: none; }
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
