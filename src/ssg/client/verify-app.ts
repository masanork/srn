
import { verifyHybridVC } from '../vc.ts';

// Main entry point for browser-side verification
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const resultArea = document.getElementById('result-area');

    if (!dropZone || !resultArea) return;

    // Drag & Drop Handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        const file = e.dataTransfer?.files[0];
        if (file) {
            await processFile(file);
        }
    });

    // File Input Handler
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', async (e: any) => {
            const file = e.target.files[0];
            if (file) await processFile(file);
        });
    }

    async function processFile(file: File) {
        resultArea!.innerHTML = '<div class="scanning">Reading VC file...</div>';
        try {
            const text = await file.text();
            const json = JSON.parse(text);

            resultArea!.innerHTML = '<div class="scanning">Verifying Signatures (Ed25519 + ML-DSA-44)...</div>';

            // Artificial delay for "scanning" effect
            await new Promise(r => setTimeout(r, 600));

            const result = await verifyHybridVC(json);

            if (result.isValid) {
                // Check Revocation
                resultArea!.innerHTML = '<div class="scanning">Checking Revocation Status...</div>';
                try {
                    const statusListUrl = 'status-list.json'; // Relative path assuming hosted in root
                    const resp = await fetch(statusListUrl);
                    if (resp.ok) {
                        const statusList = await resp.json();
                        const revokedIds = statusList.credentialSubject?.['srn:revokedBuildIds'] || [];
                        const vcBuildId = json.credentialSubject?.['srn:buildId'];

                        if (vcBuildId && revokedIds.includes(vcBuildId)) {
                            result.isValid = false;
                            (result as any).revocationError = `REVOKED: Build ID '${vcBuildId}' is in the revocation list.`;
                        }
                    } else {
                        console.warn("Could not fetch status list");
                    }
                } catch (e) {
                    console.warn("Revocation check failed (Network error?)", e);
                }
            }

            renderResult(result, json);

        } catch (err: any) {
            resultArea!.innerHTML = `<div class="error">Failed to parse VC: ${err.message}</div>`;
        }
    }

    function renderResult(result: any, json: any) {
        let isValid = result.isValid;
        let color = isValid ? '#27ae60' : '#c0392b';
        let icon = isValid ? '🛡️ VALID' : '⚠️ INVALID';
        let msg = '';

        if ((result as any).revocationError) {
            isValid = false;
            color = '#d32f2f';
            icon = '❌ REVOKED';
            msg = `<div style="background: #ffebee; color: #c62828; padding: 1rem; border-radius: 4px; margin: 1rem 0; font-weight: bold;">
                ${(result as any).revocationError}
            </div>`;
        }

        const html = `
            <div style="border: 2px solid ${color}; padding: 2rem; border-radius: 8px; background: #fff;">
                <h2 style="color: ${color}; margin-top: 0; font-size: 2rem;">${icon}</h2>
                ${msg}
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
                    <div class="check-item ${result.checks.ed25519 ? 'pass' : 'fail'}">
                        <strong>Ed25519 (Classic)</strong>
                        <span>${result.checks.ed25519 ? 'P-256 Signature Verified' : 'Verification Failed'}</span>
                    </div>
                    <div class="check-item ${result.checks.pqc ? 'pass' : 'fail'}">
                        <strong>ML-DSA-44 (Post-Quantum)</strong>
                        <span>${result.checks.pqc ? 'Lattice-based Signature Verified' : 'Verification Failed'}</span>
                    </div>
                </div>

                <details style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
                    <summary style="cursor: pointer; color: #666;">View Raw VC Payload</summary>
                    <pre style="background: #f8f8f8; padding: 1rem; overflow: auto; text-align: left; font-size: 0.8rem;">${JSON.stringify(json, null, 2)}</pre>
                </details>
            </div>
        `;
        resultArea!.innerHTML = html;
    }
});
