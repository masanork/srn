
import { globalSigner } from './signer';

export class DataManager {
    private formId: string;

    constructor() {
        this.formId = 'WebA_' + window.location.pathname;
    }

    public updateJsonLd(): any {
        const w = window as any;
        const data = w.generatedJsonStructure || {};

        // 1. Static Inputs
        document.querySelectorAll('[data-json-path]').forEach((input: any) => {
            const key = input.dataset.jsonPath;
            if (key) {
                data[key] = input.value;
            }
        });

        // 2. Radio Groups
        document.querySelectorAll('[type="radio"]:checked').forEach((radio: any) => {
            data[radio.name] = radio.value;
        });

        // 3. Dynamic Tables
        document.querySelectorAll('table.data-table.dynamic').forEach((table: any) => {
            const tableKey = table.dataset.tableKey;
            if (tableKey) {
                const rows: any[] = [];
                table.querySelectorAll('tbody tr').forEach((tr: any) => {
                    // Collect row data
                    const rowData: any = {};
                    let hasVal = false;
                    tr.querySelectorAll('[data-base-key]').forEach((input: any) => {
                        if (input.type === 'checkbox') {
                            rowData[input.dataset.baseKey] = input.checked;
                            if (input.checked) hasVal = true;
                        } else {
                            rowData[input.dataset.baseKey] = input.value;
                            if (input.value) hasVal = true;
                        }
                    });
                    if (hasVal) rows.push(rowData);
                });
                data[tableKey] = rows;
            }
        });

        const scriptBlock = document.getElementById('json-ld');
        if (scriptBlock) {
            scriptBlock.textContent = JSON.stringify(data, null, 2);
        }
        const debugBlock = document.getElementById('json-debug');
        if (debugBlock) {
            debugBlock.textContent = JSON.stringify(data, null, 2);
        }
        return data;
    }

    public async signAndDownload() {
        const data = this.updateJsonLd();
        const w = window as any;
        const formName = (w.generatedJsonStructure && w.generatedJsonStructure.name) || 'Response';
        
        // Try to get template ID from document or use URL
        const templateId = window.location.href.split('#')[0];

        // Ensure key is ready (triggers Passkey registration if needed)
        if (!globalSigner.getPublicKey()) {
            const success = await globalSigner.register();
            if (!success) {
                alert("Key registration failed.");
                return;
            }
        }

        const payload = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "WebAFormResponse"],
            "issuer": globalSigner.getIssuerDid(),
            "issuanceDate": new Date().toISOString(),
            "credentialSubject": {
                "id": `urn:uuid:${crypto.randomUUID()}`,
                "type": "WebAFormResponse",
                "templateId": templateId,
                "answers": data
            }
        };

        try {
            const signedVc = await globalSigner.sign(payload);
            this.downloadHtml('submitted', true, signedVc);
        } catch (e) {
            console.error(e);
            alert("Signing failed. Please ensure you are in a secure context (HTTPS/localhost).");
        }
    }

    public saveToLS() {
        const data = this.updateJsonLd();
        localStorage.setItem(this.formId, JSON.stringify(data));
    }

    public restoreFromLS() {
        const c = localStorage.getItem(this.formId);
        if (!c) return;
        try {
            const d = JSON.parse(c);
            // Static
            document.querySelectorAll('[data-json-path]').forEach((input: any) => {
                const key = input.dataset.jsonPath;
                if (d[key] !== undefined) input.value = d[key];
            });
            // Dynamic Tables
            document.querySelectorAll('table.data-table.dynamic').forEach((table: any) => {
                const tableKey = table.dataset.tableKey;
                const rowsData = d[tableKey];
                if (Array.isArray(rowsData)) {
                    const tbody = table.querySelector('tbody');
                    if (!tbody) return;
                    // Remove existing except first template
                    const currentRows = tbody.querySelectorAll('.template-row');
                    // This logic assumes .template-row is always the first one and shouldn't be deleted?
                    // Original code: for (let i = 1; i < currentRows.length; i++) currentRows[i].remove();
                    // But actually usually there is only ONE template row initially.
                    // If user added rows manually before restore (unlikely on reload), they are not template rows usually.
                    // Let's stick to original logic: find all rows? 
                    // Original: const currentRows = tbody.querySelectorAll('.template-row');
                    // Wait, dynamic added rows lose .template-row class!
                    // Original code:
                    // newRow.classList.remove('template-row');
                    // So `tbody.querySelectorAll('.template-row')` only finds the template.
                    // So `currentRows.length` is usually 1. 
                    // AND `restoreFromLS` in original code says:
                    // `const currentRows = tbody.querySelectorAll('.template-row');`
                    // `for (let i = 1; i < currentRows.length; i++) currentRows[i].remove();`
                    // This creates a bug if multiple template rows existed (impossible).
                    // BUT it fails to remove non-template rows (previous session junk if any)?
                    // Actually on page load, HTML only has template row.

                    rowsData.forEach((rowData, idx) => {
                        let row: any;
                        if (idx === 0) {
                            row = tbody.querySelector('.template-row');
                        } else {
                            const tmpl = tbody.querySelector('.template-row');
                            if (tmpl) {
                                row = tmpl.cloneNode(true);
                                (row as Element).classList.remove('template-row'); // Added this to match addTableRow behavior logic
                                // Also unhide delete button
                                const rmBtn = (row as Element).querySelector('.remove-row-btn') as HTMLElement;
                                if (rmBtn) rmBtn.style.visibility = 'visible';

                                tbody.appendChild(row);
                            }
                        }
                        if (row) {
                            row.querySelectorAll('input, select').forEach((input: any) => {
                                const k = input.dataset.baseKey;
                                if (k && rowData[k] !== undefined) {
                                    if (input.type === 'checkbox') input.checked = !!rowData[k];
                                    else input.value = rowData[k];
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) { console.error(e); }
    }

    public clearData() {
        if (confirm('Clear all saved data? / 保存されたデータを削除しますか？')) {
            localStorage.removeItem(this.formId);
            window.location.reload();
        }
    }

    public bakeValues() {
        this.updateJsonLd();
        document.querySelectorAll('input, textarea, select').forEach((el: any) => {
            if (el.closest('.template-row')) return; // Skip template row
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) el.setAttribute('checked', 'checked');
                else el.removeAttribute('checked');
            } else {
                el.setAttribute('value', el.value);
                if (el.tagName === 'TEXTAREA') el.textContent = el.value;
            }
        });
    }

    public downloadHtml(filenameSuffix: string, isFinal: boolean, embeddedVc?: any) {
        const w = window as any;
        let htmlContent = document.documentElement.outerHTML;

        if (embeddedVc) {
            const vcScript = `\n<script type="application/ld+json" id="weba-user-vc">\n${JSON.stringify(embeddedVc, null, 2)}\n</script>\n`;
            if (htmlContent.includes('</body>')) {
                htmlContent = htmlContent.replace('</body>', vcScript + '</body>');
            } else {
                htmlContent += vcScript;
            }
        }

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const title = (w.generatedJsonStructure && w.generatedJsonStructure.name) || 'web-a-form';
        const now = new Date();
        const dateStr = now.getFullYear() +
            ('0' + (now.getMonth() + 1)).slice(-2) +
            ('0' + now.getDate()).slice(-2) + '-' +
            ('0' + now.getHours()).slice(-2) +
            ('0' + now.getMinutes()).slice(-2);
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${title}_${dateStr}_${filenameSuffix}_${randomId}.html`;

        a.download = filename;
        a.click();

        if (isFinal) {
            setTimeout(() => window.location.reload(), 1000);
        }
    }

    public saveDraft() {
        this.bakeValues();
        this.downloadHtml('draft', false);
    }

    public submitDocument() {
        this.bakeValues();
        document.querySelectorAll('.search-suggestions').forEach(el => el.remove());
        this.downloadHtml('submit', true);
    }
}
