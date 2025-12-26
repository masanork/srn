
import { parseMarkdown } from './parser';
import { generateHtml, RUNTIME_SCRIPT } from './generator';

// Window global functions for HTML event handlers
declare global {
    interface Window {
        parseAndRender: () => void;
        downloadWebA: () => void;
        generatedJsonStructure: any;
        isRuntimeLoaded: boolean;
        recalculate: (() => void) | undefined;
        addTableRow: ((btn: HTMLButtonElement, tableKey: string) => void) | undefined;
    }
}

const DEFAULT_MARKDOWN = `# 御見積書
---

## 顧客情報

- [text:client_name (placeholder="株式会社〇〇 御中" size:L)] 顧客名
- [date:issue_date] 発行日
- [text:project_name (placeholder="例: Webサイトリニューアル案件")] 件名

---

## 見積明細

[dynamic-table:items]
| 品目 / 内容 | 単価 | 数量 | 金額 |
|---|---|---|---|
| [datalist:item (src:products placeholder="品目を選択または入力")] | [number:price (placeholder="0" align:R)] | [number:qty (placeholder="1" align:R)] | [calc:amount (formula="price * qty" align:R)] |

<div style="text-align: right; margin-top: 20px;">

- [calc:subtotal (formula="SUM(amount)" align:R)] 小計
- [calc:tax (formula="Math.floor(SUM(amount) * 0.1)" align:R)] 消費税 (10%)
- [calc:total (formula="SUM(amount) + Math.floor(SUM(amount) * 0.1)" size:XL align:R bold)] 合計金額

</div>

---

## 備考
- [textarea:remarks (placeholder="有効期限: 発行より2週間")] 備考欄

[master:products]
| Item Name | Unit Price |
|---|---|
| システム開発一式 (人月) | 800000 |
| 初期導入費用 | 150000 |
| サーバー構築費 | 120000 |
| UI/UXデザイン費 | 300000 |
| 月額保守サポート | 30000 |
`;

function updatePreview() {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const preview = document.getElementById('preview');
    if (!editor || !preview) return;

    const { html, jsonStructure } = parseMarkdown(editor.value);
    preview.innerHTML = html;

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure;

    // Inject runtime behavior
    if (!(window as any).isRuntimeLoaded) {
        const script = document.createElement('script');
        script.textContent = RUNTIME_SCRIPT;
        document.body.appendChild(script);
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
    a.download = 'web-a-form.html';
    a.click();
}

// Expose to window
window.parseAndRender = updatePreview;
window.downloadWebA = downloadWebA;

// Init
window.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    if (editor) {
        editor.value = DEFAULT_MARKDOWN;
        updatePreview();
    }
});
