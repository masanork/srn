
import { parseMarkdown } from './parser';
import { generateHtml, initRuntime, generateAggregatorHtml } from './generator';

// Window global functions for HTML event handlers
declare global {
    interface Window {
        parseAndRender: () => void;
        downloadWebA: () => void;
        downloadAggregator: () => void;
        generatedJsonStructure: any;
        isRuntimeLoaded: boolean;
        recalculate: (() => void) | undefined;
        initSearch: (() => void) | undefined;
        addTableRow: ((btn: HTMLButtonElement, tableKey: string) => void) | undefined;
    }
}

import { DEFAULT_MARKDOWN_EN, DEFAULT_MARKDOWN_JA } from './sample';

function updatePreview() {
    console.log("Web/A Maker v2.3");
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const preview = document.getElementById('preview');
    if (!editor || !preview) return;

    const { html, jsonStructure } = parseMarkdown(editor.value);

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure; // Update window.generatedJsonStructure

    preview.innerHTML = html;

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

function downloadWebA() {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const htmlContent = generateHtml(editor.value);

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // @ts-ignore
    const title = (window.generatedJsonStructure && window.generatedJsonStructure.name) || 'web-a-form';
    a.download = title + '.html';
    a.click();
}

function downloadAggregator() {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const htmlContent = generateAggregatorHtml(editor.value);

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // @ts-ignore
    const title = (window.generatedJsonStructure && window.generatedJsonStructure.name) || 'web-a-aggregator';
    a.download = title + '_aggregator.html';
    a.click();
}

// Expose to window
window.parseAndRender = updatePreview;
window.downloadWebA = downloadWebA;
window.downloadAggregator = downloadAggregator;

function applyI18n() {
    const RESOURCES: any = {
        "en": {
            "md_def": "Markdown Definition",
            "btn_aggregator": "Download Web/A Aggregator",
            "btn_form": "Download Web/A Form",
            "preview": "Preview"
        },
        "ja": {
            "md_def": "定義 (Markdown)",
            "btn_aggregator": "集計ツール",
            "btn_form": "入力画面",
            "preview": "プレビュー"
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
    applyI18n();
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    if (editor) {
        const navLang = navigator.language || 'en';
        const lang = navLang.startsWith('ja') ? 'ja' : 'en';
        console.log(`Language detection: navigator.language='${navLang}' -> using '${lang}' sample.`);

        const currentVal = editor.value.trim();
        const isDefaultEn = currentVal === DEFAULT_MARKDOWN_EN.trim();
        const isDefaultJa = currentVal === DEFAULT_MARKDOWN_JA.trim();

        // If empty, or if it matches the OTHER language's default, switch it.
        // This overrides browser form restore if the user hasn't made custom edits (assumed by matching default).
        if (!currentVal || (lang === 'ja' && isDefaultEn) || (lang === 'en' && isDefaultJa)) {
            editor.value = lang === 'ja' ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
        }

        updatePreview();
    }
});
