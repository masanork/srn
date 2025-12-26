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
// ... (previous content)

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
        if ((window as any).recalculate) (window as any).recalculate();
        // Bind new buttons if any (like Add Row) - handled by global onclick in runtime script?
        // Runtime script defines window.addTableRow, which is fine.
    }, 50);
}
// ...
const DEFAULT_MARKDOWN = `# 経費精算申請書
---

## 申請人情報

- [text:employee_id (size:S placeholder="例: 123456")] 社員番号
- [text:dept (val="営業部" size:S)] 所属部署
- [text:name (size:L placeholder="氏名を入力してください")] 氏名
- [date:date] 申請日

---

## 申請詳細

- [radio:type] 経費種別
  - [x] 交通費
  - 会議費
  - 消耗品費
  - その他

- [textarea:reason (placeholder="例: クライアント訪問のため")] 申請理由（詳細）

---

## 経費明細 (動的テーブル)

[dynamic-table:items]
| 日付 | 内容 | 金額 | 支払先 | 備考 |
|---|---|---|---|---|
| [date:date] | [text:description] | [number:amount (align:R placeholder="0")] | [datalist:payee (src:vendors placeholder="例: ○○商事")] | [text:note] |

[master:vendors]
| ID | Vendor Name | 
|---|---|
| 001 | 山田文具店 |
| 002 | 鈴木交通 |
| 003 | 田中商事 |
`;

function updatePreview() {
    const editor = document.getElementById('editor') as HTMLTextAreaElement;
    const preview = document.getElementById('preview');
    if (!editor || !preview) return;

    const { html, jsonStructure } = parseMarkdown(editor.value);
    preview.innerHTML = html;

    // @ts-ignore
    window.generatedJsonStructure = jsonStructure;

    // Trigger runtime behavior for preview
    // In the separated version, we might need to inject runtime functions into global scope
    // or just emulate them. 
    // Since we are in the Maker, we can define checking logic here.
    setTimeout(() => {
        // We need 'recalculate' available globally for the preview to work interactively?
        // Actually the preview HTML uses standard inputs. 
        // We need to run recalculate() on the preview DOM.
        // We can reuse the logic from runtime script but it's stringified in generator.
        // For simplicity, we can just say "Preview logic is limited" OR copy paste logic.
        // Ideally we import recalculate from runtime source, but runtime source is a string.

        // Let's rely on the fact that this script effectively runs in the maker page.
    }, 100);
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
