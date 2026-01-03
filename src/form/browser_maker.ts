
import { parseMarkdown } from '../../packages/core/src/parser';
import { generateHtml, initRuntime, generateAggregatorHtml } from './generator';

// Window global functions for HTML event handlers
declare global {
    interface Window {
        parseAndRender: () => void;
        downloadCurrent: () => void;
        loadToolFile: (input: HTMLInputElement) => void;
        setPreviewMode: (mode: 'form' | 'aggregator') => void;
        setupEncryption: () => void;
        generatedJsonStructure: any;
        isRuntimeLoaded: boolean;
        previewMode?: 'form' | 'aggregator';
        recalculate: (() => void) | undefined;
        initSearch: (() => void) | undefined;
        addTableRow: ((btn: HTMLButtonElement, tableKey: string) => void) | undefined;
    }
}

import { DEFAULT_MARKDOWN_EN, DEFAULT_MARKDOWN_JA } from './sample';

const BUILD_TIME = (typeof window !== 'undefined' && (window as any).__WEBA_BUILD_TIME__)
    ? (window as any).__WEBA_BUILD_TIME__
    : '';

function formatBuildStamp(value: string): string {
    if (!value) return 'Build: dev';
    return `Build: ${value.replace('T', ' ').replace('.000Z', 'Z')}`;
}

function getEditor(): HTMLTextAreaElement | null {
    return document.getElementById('editor-form') as HTMLTextAreaElement | null;
}

function getMarkdown(): string {
    const editor = getEditor();
    return editor ? editor.value : '';
}

function stripAggregatorOnly(html: string) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('[data-preview-only="aggregator"]').forEach((el) => el.remove());
    return wrapper.innerHTML;
}

function updatePreview() {
    console.log("Web/A Maker v3.0");
    const preview = document.getElementById('preview');
    if (!preview) return;

    const mode = (window as any).previewMode || 'form';
    const markdown = getMarkdown();
    const { html, jsonStructure } = parseMarkdown(markdown);

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure; // Update window.generatedJsonStructure

    if (mode === 'aggregator') {
        const aggHtml = generateAggregatorHtml(markdown);
        preview.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:0;"></iframe>`;
        const frame = document.getElementById('preview-frame') as HTMLIFrameElement | null;
        if (frame) {
            const blob = new Blob([aggHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            frame.src = url;
            frame.onload = () => URL.revokeObjectURL(url);
        }
        return;
    }

    preview.innerHTML = stripAggregatorOnly(html);

    // Initialize runtime behavior once without inline script injection
    if (!(window as any).isRuntimeLoaded) { // Check isRuntimeLoaded instead of recalculate
        initRuntime();
        (window as any).isRuntimeLoaded = true;
    }

    // Trigger recalculate manually since DOMContentLoaded already fired
    setTimeout(() => {
        if (window.recalculate) {
            if (window.initSearch) window.initSearch(); // Re-bind search
            window.recalculate();
        }
    }, 50);
}


function downloadCurrent() {
    const mode = (window as any).previewMode || 'form';
    const markdown = getMarkdown();
    let htmlContent = mode === 'aggregator' ? generateAggregatorHtml(markdown) : generateHtml(markdown);

    // Inject Keys if Aggregator and keys exist in memory
    if (mode === 'aggregator' && lastGeneratedKeys) {
        const keysJson = JSON.stringify(lastGeneratedKeys, null, 2);
        // Replace empty script tag
        htmlContent = htmlContent.replace('<script id="weba-l2-keys" type="application/json"></script>', `<script id="weba-l2-keys" type="application/json">\n${keysJson}\n</script>`);
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // @ts-ignore
    const title = (window.generatedJsonStructure && window.generatedJsonStructure.name) || 'web-a-form';
    a.download = mode === 'aggregator' ? `${title}_aggregator.html` : `${title}.html`;
    a.click();
}

// Expose to window
window.parseAndRender = updatePreview;
window.downloadCurrent = downloadCurrent;
window.setPreviewMode = (mode: 'form' | 'aggregator') => {
    (window as any).previewMode = mode;
    document.querySelectorAll<HTMLButtonElement>('.preview-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.preview === mode);
    });
    updatePreview();
};

function applyI18n() {
    const RESOURCES: any = {
        "en": {
            "md_def": "Markdown Definition",
            "btn_download": "Download",
            "btn_load_file": "Load File",
            "preview": "Preview",
            "btn_preview_form": "Form",
            "btn_preview_agg": "Aggregator"
        },
        "ja": {
            "md_def": "定義 (Markdown)",
            "btn_download": "ダウンロード",
            "btn_load_file": "ファイル読込",
            "preview": "プレビュー",
            "btn_preview_form": "入力画面",
            "btn_preview_agg": "集計画面"
        }
    };
    const lang = (navigator.language || 'en').startsWith('ja') ? 'ja' : 'en';
    const dict = RESOURCES[lang] || RESOURCES['en'];

    document.querySelectorAll('[data-i18n]').forEach((el: any) => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    (window as any).__WEBA_BUILD_TIME__ = BUILD_TIME;
    applyI18n();
    const editorForm = getEditor();
    if (!editorForm) return;

    const navLang = navigator.language || 'en';
    const lang = navLang.startsWith('ja') ? 'ja' : 'en';
    console.log(`Language detection: navigator.language='${navLang}' -> using '${lang}' sample.`);

    const formVal = editorForm.value.trim();
    const isDefaultEn = formVal === DEFAULT_MARKDOWN_EN.trim();
    const isDefaultJa = formVal === DEFAULT_MARKDOWN_JA.trim();

    // Force load sample if empty (even if browser tried to restore something weird)
    if (!formVal || formVal.length === 0) {
        console.log("Editor is empty. Loading default sample.");
        editorForm.value = lang === 'ja' ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
    } else if ((lang === 'ja' && isDefaultEn) || (lang === 'en' && isDefaultJa)) {
        // Switch language context if it matches the exact OTHER default
        console.log("Switching default sample language match.");
        editorForm.value = lang === 'ja' ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
    }

    const encBtn = document.createElement('button');
    encBtn.className = 'preview-btn'; // Use consistent style
    encBtn.textContent = lang === 'ja' ? '🔑 暗号化設定 (Passkey)' : '🔑 Setup Encryption (Passkey)';
    encBtn.style.border = '1px solid #10b981';
    encBtn.style.color = '#059669';
    encBtn.onclick = () => setupEncryption();

    // Target the header in the left pane
    const headerLeft = document.querySelector('.pane-header .header-left');
    if (headerLeft) {
        headerLeft.appendChild(encBtn);
    }

    const buildEl = document.getElementById('build-stamp');
    if (buildEl) {
        buildEl.textContent = formatBuildStamp(BUILD_TIME);
        buildEl.title = BUILD_TIME ? `Built at ${BUILD_TIME}` : 'Build time not available';
    }

    // Install PQC provider for the Maker UI context
    try {
        const provider = createMlKem768Provider();
        installBrowserPqcProvider(provider);
        console.log("PQC Provider installed in Maker UI");
    } catch (e) {
        console.error("Failed to install PQC provider:", e);
    }

    // Also add to window for debug
    (window as any).setupEncryption = setupEncryption;

    window.setPreviewMode('form');
    updatePreview();
});

import { derivePasskeyPrf, registerPasskey } from './client/webauthn';
import { deriveKeyPairFromPrf, b64urlEncode } from './maker_crypto';
import { createMlKem768Provider, installBrowserPqcProvider } from './client/pqc';


// State for generated keys
let lastGeneratedKeys: any = null;

async function setupEncryption() {
    try {
        const username = prompt("User Name for Passkey:", "demo-user");
        if (!username) return;

        // Force Enable PQC
        const usePqc = true;

        alert("Please register a new Passkey for this demo (or select existing if supported).");
        const cred = await registerPasskey(username);

        const salt = new Uint8Array(32); // Zero salt
        const prfKey = await derivePasskeyPrf(cred.id, salt);

        const keyPair = await deriveKeyPairFromPrf(prfKey);
        const pubKey = b64urlEncode(keyPair.publicKey);

        // Store keys for Aggregator download
        lastGeneratedKeys = {
            recipient_kid: `${username}-key`,
            recipient_x25519_private: b64urlEncode(keyPair.privateKey),
        };

        // Always generate real ML-KEM-768 key pair for Hybrid encryption
        const crypto = (window as any).WebACrypto;
        if (!crypto) throw new Error("WebACrypto not active. Please wait for preview to load.");

        // WASM returns { publicKey, privateKey }
        const pqcKeys = crypto.mlKem768GenerateKeyPair();
        lastGeneratedKeys.recipient_pqc_private = b64urlEncode(pqcKeys.privateKey);
        lastGeneratedKeys.recipient_pqc_kem = "ML-KEM-768";
        // We temporarily store the public key to put in newConfig
        (lastGeneratedKeys as any)._temp_pqc_public = b64urlEncode(pqcKeys.publicKey);

        console.log("Derived Public Key:", pubKey);
        console.log("Generated PQC Key:", (lastGeneratedKeys as any)._temp_pqc_public);

        // 3. Update Editor
        const editor = getEditor();
        if (!editor) return;
        let val = editor.value;

        // Replace existing config or append
        const configRegex = /<script id="weba-l2-config" type="application\/json">\s*\{[\s\S]*?\}\s*<\/script>/;

        const newConfig: any = {
            enabled: true,
            recipient_kid: `${username}-key`,
            recipient_x25519: pubKey,
            // Always include PQC public key
            recipient_pqc: (lastGeneratedKeys as any)._temp_pqc_public,
            layer1_ref: "demo-personal",
        };

        const explanation = "Encryption Enabled: Hybrid (X25519 + ML-KEM-768).";
        const newBlock = `<script id="weba-l2-config" type="application/json">\n// ${explanation}\n${JSON.stringify(newConfig, null, 2)}\n</script>`;

        if (val.match(configRegex)) {
            val = val.replace(configRegex, newBlock);
        } else {
            val += `\n\n${newBlock}`;
        }

        // Remove Escrow comments if present
        val = val.replace(/\*For demo purposes, decryption is automatically handled.*\*/g, "");
        val = val.replace(/※ デモ用のため、以下のキャンペーンIDが設定されている場合.*\*/g, "");
        val = val.replace(/※ デモ用のため、復号に必要な秘密鍵を以下に公開します.*\*/g, "");
        val = val.replace(/Change `enabled: false` to `true` below.*/g, explanation);
        val = val.replace(/Encryption Enabled via Passkey\./g, explanation);

        editor.value = val;
        updatePreview();

        alert(`Encryption configured!\nUser: ${username}\n${usePqc ? 'Mode: Hybrid PQC (ML-KEM-768)\n' : ''}Public Key: ${pubKey}\n\nNOTE: The Private Key is now temporarily stored in memory.\nDownloading the 'Aggregator' will cleanly embed this key.`);

    } catch (e: any) {
        console.error(e);
        alert("Setup failed: " + e.message);
    }
}

async function loadToolFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const isMarkdown = file.name.toLowerCase().endsWith('.md');

        if (isMarkdown) {
            const editor = getEditor();
            if (editor) {
                editor.value = text;
                window.setPreviewMode('form');
                updatePreview();
                alert("Markdown loaded.");
            }
            input.value = '';
            return;
        }

        const doc = new DOMParser().parseFromString(text, "text/html");

        // 0. Recover Source Markdown
        const sourceEl = doc.getElementById('weba-source-markdown');
        if (sourceEl) {
            const editor = getEditor();
            if (editor) {
                editor.value = sourceEl.textContent || '';
                // Note: we don't call updatePreview() yet as we might be in aggregator mode
            }
        }

        // 1. Recover Aggregation Spec
        const specEl = doc.getElementById('weba-agg-spec');
        if (specEl) {
            try {
                const spec = JSON.parse(specEl.textContent || '');
                console.log("Recovered Aggregator Spec:", spec);
            } catch (e) {
                console.warn("Failed to parse Aggregation Spec");
            }
        }

        // 2. Recover Encryption Keys
        const keysEl = doc.getElementById('weba-l2-key') || doc.getElementById('weba-l2-keys');
        if (keysEl) {
            try {
                lastGeneratedKeys = JSON.parse(keysEl.textContent || '');
                console.log("Recovered Encryption Keys:", lastGeneratedKeys);
            } catch (e) {
                console.warn("Failed to parse Encryption Keys");
            }
        }

        // 3. Switch to Aggregator Mode and Show the tool
        window.setPreviewMode('aggregator');

        // We override updatePreview logic temporarily for the loaded file
        const preview = document.getElementById('preview');
        if (preview) {
            preview.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:0;"></iframe>`;
            const frame = document.getElementById('preview-frame') as HTMLIFrameElement | null;
            if (frame) {
                // Use the loaded HTML but ensure it runs on the same origin (blob from current page)
                const blob = new Blob([text], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                frame.src = url;
                frame.onload = () => URL.revokeObjectURL(url);
            }
        }

        alert("Tool Loaded Successfully!\nYou can now use use your Passkey to aggregate files within this preview.");
    } catch (e) {
        console.error(e);
        alert("Failed to load tool.");
    } finally {
        input.value = '';
    }
}
window.loadToolFile = loadToolFile;
