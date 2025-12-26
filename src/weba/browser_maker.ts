
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
        addTableRow: ((btn: HTMLButtonElement, tableKey: string) => void) | undefined;
    }
}

const DEFAULT_MARKDOWN = `# 請求書 (Sample Invoice)
---

## 1. 宛先・基本情報

- [text:recipient_name (placeholder="株式会社〇〇 御中" size:L)] 請求先名
- [text:invoice_no (placeholder="INV-2025-001")] 請求書番号
- [date:issue_date] 発行日

---

## 2. 明細 (Calculation Demo)

[dynamic-table:items]
| 品目・摘要 | 単価 (Unit Price) | 数量 (Qty) | 金額 (Amount) |
|---|---|---|---|
| [text:item_desc (placeholder="品目名")] | [number:price (placeholder="0" align:R)] | [number:qty (placeholder="1" align:R)] | [calc:amount (formula="price * qty" align:R)] |

<div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">

- [calc:subtotal (formula="SUM(amount)" align:R)] 小計 (Subtotal)
- [calc:tax (formula="Math.floor(SUM(amount) * 0.1)" align:R)] 消費税 (10%)
- [calc:total (formula="SUM(amount) + Math.floor(SUM(amount) * 0.1)" size:XL align:R bold)] ご請求金額 (Total)

</div>

---

## 3. 振込先情報 (Static Table)

| 銀行名 | 支店名 | 口座番号 |
|---|---|---|
| [text:bank_name (val="サンプルの銀行")] | [text:branch (val="本店営業部")] | [text:acc_no (val="1234567")] |

- [textarea:notes (placeholder="備考（支払期限など）" hint="振込手数料は貴社にてご負担願います。")] 備考
`;

function updatePreview() {
    console.log("Web/A Maker v2.3");
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const preview = document.getElementById('preview');
    if (!editor || !preview) return;

    const { html, jsonStructure } = parseMarkdown(editor.value);
    preview.innerHTML = html;

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure;

    // Initialize runtime behavior once without inline script injection
    if (!(window as any).recalculate) {
        initRuntime();
        (window as any).isRuntimeLoaded = true;
    }

    // Trigger recalculate manually since DOMContentLoaded already fired
    setTimeout(() => {
        if (window.recalculate) window.recalculate();
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

// Init
window.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    if (editor) {
        editor.value = DEFAULT_MARKDOWN;
        updatePreview();
    }
});
