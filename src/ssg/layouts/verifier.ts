
import { baseLayout } from './base.js';

export interface VerifierData {
    title: string;
    description: string;
    layout: 'verifier';
    [key: string]: any;
}

export function verifierLayout(data: VerifierData, htmlContent: string, fontCss: string, fontFamilies: string[]) {
    // We expect the verify-app.js bundle to be available at /assets/verify-bundle.js

    const fullContent = `
        <style>
            .verifier-container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
                padding: 2rem 1rem;
            }
            .drop-zone {
                border: 3px dashed #ccc;
                border-radius: 12px;
                padding: 4rem 2rem;
                margin: 2rem 0;
                transition: all 0.3s;
                background: #fafafa;
                cursor: pointer;
            }
            .drop-zone.active {
                border-color: #3498db;
                background: #eaf6ff;
                transform: scale(1.02);
            }
            .drop-zone p {
                font-size: 1.2rem;
                color: #888;
                pointer-events: none;
            }
            .upload-btn {
                display: inline-block;
                margin-top: 1rem;
                padding: 0.5rem 1.5rem;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
            }
            
             .check-item {
                padding: 1rem;
                border-radius: 6px;
                text-align: left;
            }
            .check-item.pass { background: #e8f8f5; border: 1px solid #27ae60; color: #27ae60; }
            .check-item.fail { background: #fdedec; border: 1px solid #c0392b; color: #c0392b; }
            
            .scanning {
                font-family: monospace;
                color: #666;
                animation: pulse 1s infinite;
            }
            @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        </style>

        <div class="verifier-container">
            <h1>${data.title}</h1>
            <p>${data.description}</p>
            
            ${htmlContent}

            <div id="drop-zone" class="drop-zone" onclick="document.getElementById('file-input').click()">
                <p>Drag & Drop <strong>.vc.json</strong> file here</p>
                <div class="upload-btn">or Click to Browse</div>
                <input type="file" id="file-input" accept=".json" style="display: none;">
            </div>

            <div id="result-area"></div>
        </div>

        <script src="/assets/verify-bundle.js" type="module"></script>
    `;

    return baseLayout({
        title: data.title,
        content: fullContent,
        fontCss,
        fontFamilies
    });
}
