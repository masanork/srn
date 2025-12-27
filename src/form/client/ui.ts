
import { Calculator } from './calculator';
import { DataManager } from './data';

export class UIManager {
    private calc: Calculator;
    private data: DataManager;

    constructor(calc: Calculator, data: DataManager) {
        this.calc = calc;
        this.data = data;
    }

    public applyI18n() {
        const RESOURCES: any = {
            "en": {
                "add_row": "+ Add Row",
                "work_save_btn": "Save HTML",
                "clear_btn": "Clear Data",
                "sign_btn": "Submit (VC)",
            },
            "ja": {
                "add_row": "+ 行を追加",
                "work_save_btn": "HTML保存",
                "clear_btn": "クリア",
                "sign_btn": "提出版を保存 (VC)",
            }
        };
        const lang = (navigator.language || 'en').startsWith('ja') ? 'ja' : 'en';
        const dict = RESOURCES[lang] || RESOURCES['en'];

        document.querySelectorAll('[data-i18n]').forEach((el: any) => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
    }

    public initTables() {
        document.querySelectorAll('.data-table.dynamic tbody').forEach((tbody) => {
            this.renumberRows(tbody as HTMLElement);
        });
    }

    private renumberRows(tbody: HTMLElement) {
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
            // Exclude header rows (which usually contain th, or no td)
            return row.querySelectorAll('td').length > 0;
        });

        rows.forEach((row, index) => {
            const num = index + 1;
            row.querySelectorAll('.auto-num').forEach((input: any) => {
                if (input.value != num) {
                    input.value = num.toString();
                    // trigger change for any listeners
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });
    }

    public removeTableRow(btn: any) {
        const tr = btn.closest('tr');
        const tbody = tr.parentElement as HTMLElement;
        if (tr.classList.contains('template-row')) {
            // Cannot delete template row, just clear inputs
            tr.querySelectorAll('input').forEach((inp: HTMLInputElement) => {
                if (inp.type === 'checkbox') inp.checked = false;
                else inp.value = '';
            });
        } else {
            tr.remove();
            if (tbody) this.renumberRows(tbody);
            this.calc.recalculate();
            this.data.updateJsonLd();
        }
    }

    public addTableRow(btn: any, tableKey: string) {
        const table = document.getElementById('tbl_' + tableKey);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const templateRow = tbody.querySelector('.template-row');
        if (!templateRow) return;

        const newRow = templateRow.cloneNode(true) as HTMLElement;
        newRow.classList.remove('template-row');

        // Reset inputs to default value (from attribute) or empty
        newRow.querySelectorAll('input').forEach(input => {
            if ((input as HTMLInputElement).type === 'checkbox') {
                (input as HTMLInputElement).checked = input.hasAttribute('checked');
            } else {
                (input as HTMLInputElement).value = input.getAttribute('value') || '';
            }
        });

        // Unhide delete button for non-template rows
        const rmBtn = newRow.querySelector('.remove-row-btn') as HTMLElement;
        if (rmBtn) rmBtn.style.visibility = 'visible';

        // Initialize Auto-Copy
        newRow.querySelectorAll('[data-copy-from]').forEach((target: any) => {
            const srcKey = target.dataset.copyFrom;
            if (srcKey) {
                const src = newRow.querySelector(`[data-base-key="${srcKey}"]`) as HTMLInputElement;
                if (src && src.value) {
                    target.value = src.value;
                }
            }
        });

        tbody.appendChild(newRow);

        this.renumberRows(tbody);
        this.calc.recalculate();
    }

    public switchTab(btn: any, tabId: string) {
        document.querySelectorAll('.tab-btn').forEach((b: any) => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((c: any) => c.classList.remove('active'));

        btn.classList.add('active');
        const content = document.getElementById(tabId);
        if (content) content.classList.add('active');
    }
}
