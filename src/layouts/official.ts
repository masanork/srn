import { baseLayout } from './base.js';

export interface OfficialData {
    title: string;
    layout: 'official';
    date: string;       // 通知日
    recipient: string;  // 宛名（企業名等）
    recipientName: string; // 代表者名
    sender: string;     // 発信者（○○大臣等）
    subject: string;    // 件名
    [key: string]: any;
}

export function officialLayout(data: OfficialData, bodyContent: string, fontCss: string, fontFamilies: string[], vc?: object) {

    // Convert VC object to string for embedding/download
    const vcString = vc ? JSON.stringify(vc, null, 2) : '';
    const vcDataUri = vc ? `data:application/json;charset=utf-8,${encodeURIComponent(vcString)}` : '#';

    const fullContent = `
        <article class="official-document">
            <header class="doc-header">
                <div class="doc-number">２０２５１２２０第１号</div>
                <div class="doc-date">${data.date}</div>
            </header>

            <div class="doc-recipient">
                <div class="org-name">${data.recipient}</div>
                <div class="rep-name">代表取締役　${data.recipientName}　殿</div>
            </div>

            <div class="doc-sender">
                <div class="sender-title">${data.sender}</div>
            </div>

            <h1 class="doc-subject">${data.subject}</h1>

            <div class="doc-body">
                ${bodyContent}
            </div>

            ${vc ? `
            <footer class="doc-verification">
                <div class="verification-badge valid">
                    <span class="icon">✓</span>
                    <span class="label">電子署名検証済み (PQC Hybrid)</span>
                </div>
                <div class="verification-details">
                    <p>この文書は電子署名により真正性が保証されています。</p>
                    <p>署名方式: <strong>Ed25519 + ML-DSA-44 (Dilithium)</strong></p>
                    <a href="${vcDataUri}" download="credential.json" class="download-btn">署名データ(VC)をダウンロード</a>
                </div>
            </footer>
            ` : ''}
        </article>

        <style>
            /* Force Light Mode / Print Style Consistency */
            :root {
                --bg-color: #ffffff;
                --text-color: #000000;
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --bg-color: #ffffff !important;
                    --text-color: #000000 !important;
                    --link-color: #0066cc !important;
                    --heading-color: #000000 !important;
                    --code-bg: #f0f0f0 !important;
                    --border-color: #e0e0e0 !important;
                }
                body {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                }
            }

            body {
                background-color: #f0f0f0; /* Slight gray background for browser view to make paper pop */
            }

            .official-document {
                max-width: 800px;
                margin: 0 auto;
                padding: 4rem;
                background: white !important;
                color: black !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                font-family: "Hiragino Mincho ProN", "Yu Mincho", serif;
                -webkit-font-smoothing: auto;
                -moz-osx-font-smoothing: auto;
            }
            /* Apply custom fonts to specific variant-heavy areas or body if needed */
            .doc-recipient, .doc-body {
                font-family: ${fontFamilies.map(f => `'${f}'`).join(', ')}, serif;
            }

            .doc-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3rem;
                font-size: 0.9rem;
            }

            .doc-recipient {
                margin-bottom: 3rem;
                font-size: 1.1rem;
            }
            .org-name {
                margin-bottom: 0.5rem;
            }

            .doc-sender {
                text-align: right;
                margin-bottom: 4rem;
                font-weight: bold;
                font-size: 1.1rem;
            }

            .doc-subject {
                text-align: center;
                font-size: 1.4rem;
                margin-bottom: 3rem;
                font-weight: bold;
            }

            .doc-body {
                line-height: 2.0;
                text-align: justify;
                margin-bottom: 4rem;
            }

            /* Authentication Badge */
            .doc-verification {
                border-top: 1px solid #eee;
                padding-top: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1.5rem;
                font-family: sans-serif;
            }
            .verification-badge {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #e6f7e6;
                color: #2e7d32;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-weight: bold;
                font-size: 0.9rem;
            }
            .verification-details {
                font-size: 0.8rem;
                color: #333;
            }
            .download-btn {
                display: inline-block;
                margin-top: 0.3rem;
                color: #0066cc;
                text-decoration: none;
            }
            .download-btn:hover {
                text-decoration: underline;
            }

            /* Vertical writing support for specific sections if requested */
            /* Currently horizontal standard for notification */
        </style>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies,
        // Embed VC as JSON-LD if needed, or just keep it as sidecar
    });
}
