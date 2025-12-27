
import { parseMarkdown } from './parser';
import { generateHtml, initRuntime, generateAggregatorHtml } from './generator';

// Window global functions for HTML event handlers
declare global {
    interface Window {
        parseAndRender: () => void;
        downloadCurrent: () => void;
        setPreviewMode: (mode: 'form' | 'aggregator') => void;
        setEditorMode: (mode: 'form' | 'aggregator') => void;
        generatedJsonStructure: any;
        isRuntimeLoaded: boolean;
        previewMode?: 'form' | 'aggregator';
        editorMode?: 'form' | 'aggregator';
        recalculate: (() => void) | undefined;
        initSearch: (() => void) | undefined;
        addTableRow: ((btn: HTMLButtonElement, tableKey: string) => void) | undefined;
    }
}

import { DEFAULT_MARKDOWN_EN, DEFAULT_MARKDOWN_JA } from './sample';

function getEditor(mode: 'form' | 'aggregator'): HTMLTextAreaElement | null {
    return document.getElementById(mode === 'form' ? 'editor-form' : 'editor-aggregator') as HTMLTextAreaElement | null;
}

function getMarkdown(mode: 'form' | 'aggregator'): string {
    const editor = getEditor(mode);
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
    const markdown = getMarkdown(mode);
    const { html, jsonStructure } = parseMarkdown(markdown);

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure; // Update window.generatedJsonStructure

    if (mode === 'aggregator') {
        const aggHtml = generateAggregatorHtml(markdown);
        preview.innerHTML = `<iframe id="preview-frame" style="width:100%; height:100%; border:0;"></iframe>`;
        const frame = document.getElementById('preview-frame') as HTMLIFrameElement | null;
        if (frame) frame.srcdoc = aggHtml;
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
    const markdown = getMarkdown(mode);
    const htmlContent = mode === 'aggregator' ? generateAggregatorHtml(markdown) : generateHtml(markdown);

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
    if ((window as any).editorMode !== mode) {
        window.setEditorMode(mode);
    }
    updatePreview();
};
window.setEditorMode = (mode: 'form' | 'aggregator') => {
    (window as any).editorMode = mode;
    document.querySelectorAll<HTMLButtonElement>('.editor-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.editor === mode);
    });
    const formEditor = getEditor('form');
    const aggEditor = getEditor('aggregator');
    if (formEditor) formEditor.style.display = mode === 'form' ? 'block' : 'none';
    if (aggEditor) aggEditor.style.display = mode === 'aggregator' ? 'block' : 'none';
};

function applyI18n() {
    const RESOURCES: any = {
        "en": {
            "md_def": "Markdown Definition",
            "btn_download": "Download",
            "preview": "Preview",
            "btn_preview_form": "Form",
            "btn_preview_agg": "Aggregator",
            "btn_editor_form": "Form",
            "btn_editor_agg": "Aggregator"
        },
        "ja": {
            "md_def": "定義 (Markdown)",
            "btn_download": "ダウンロード",
            "preview": "プレビュー",
            "btn_preview_form": "入力画面",
            "btn_preview_agg": "集計プレビュー",
            "btn_editor_form": "入力画面",
            "btn_editor_agg": "集計定義"
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
    const editorForm = getEditor('form');
    const editorAgg = getEditor('aggregator');
    if (!editorForm || !editorAgg) return;

    const navLang = navigator.language || 'en';
    const lang = navLang.startsWith('ja') ? 'ja' : 'en';
    console.log(`Language detection: navigator.language='${navLang}' -> using '${lang}' sample.`);

    const formVal = editorForm.value.trim();
    const aggVal = editorAgg.value.trim();
    const isDefaultEn = formVal === DEFAULT_MARKDOWN_EN.trim();
    const isDefaultJa = formVal === DEFAULT_MARKDOWN_JA.trim();

    if (!formVal || (lang === 'ja' && isDefaultEn) || (lang === 'en' && isDefaultJa)) {
        editorForm.value = lang === 'ja' ? DEFAULT_MARKDOWN_JA : DEFAULT_MARKDOWN_EN;
    }
    if (!aggVal || aggVal === DEFAULT_MARKDOWN_EN.trim() || aggVal === DEFAULT_MARKDOWN_JA.trim()) {
        editorAgg.value = editorForm.value;
    }

    window.setEditorMode('form');
    window.setPreviewMode('form');
    updatePreview();
});
