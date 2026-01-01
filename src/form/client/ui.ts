
import { Calculator } from './calculator';
import { DataManager } from './data';

export class UIManager {
    private calc: Calculator;
    private data: DataManager;

    constructor(calc: Calculator, data: DataManager) {
        this.calc = calc;
        this.data = data;
        this.initSecuritySignal();
    }

    private initSecuritySignal() {
        window.addEventListener('weba-security-tier-change', (e: any) => {
            this.updateSecurityBadge(e.detail.tier);
        });
    }

    private updateSecurityBadge(tier: 'high' | 'standard' | 'offline') {
        const el = document.getElementById('weba-security-signal');
        if (!el) return;

        const isJa = (navigator.language || '').toLowerCase().startsWith('ja');
        const labels: Record<string, string> = {
            high: isJa ? "セキュリティ: 最高 (True PFS)" : "Security: HIGH (True PFS)",
            standard: isJa ? "セキュリティ: 標準 (Epoch-Based)" : "Security: STANDARD (Epoch)",
            offline: isJa ? "セキュリティ: 最小 (Offline/Static)" : "Security: BASIC (Offline)"
        };

        el.textContent = labels[tier];
        el.className = `security-badge tier-${tier}`;

        // Add visual indicator (dot)
        const dot = document.createElement('span');
        dot.className = 'status-dot';
        el.prepend(dot);
    }

    public applyI18n() {
        const RESOURCES: any = {
            "en": {
                "add_row": "+ Add Row",
                "work_save_btn": "Save Progress",
                "clear_btn": "Clear Data",
                "sign_btn": "Submit",
            },
            "ja": {
                "add_row": "+ 行を追加",
                "work_save_btn": "作業内容を保存",
                "clear_btn": "クリア",
                "sign_btn": "提出版を保存",
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

    public updateVisibility() {
        document.querySelectorAll<HTMLElement>('[data-show-if]').forEach(el => {
            const condition = el.dataset.showIf;
            if (!condition) return;

            // Target scope extraction
            // Simple parser: key operator value
            // Supports: key == 'value', key != 'value', key (truthy)
            const match = condition.match(/^([a-zA-Z0-9_]+)\s*(==|!=)\s*(['"]?)(.*?)\3$/);

            let visible = true;

            if (match) {
                const [_, key, op, quote, value] = match;
                // Find input element for key
                // Try global lookup
                let targetInput = document.querySelector(`[data-json-path="${key}"]`) as HTMLInputElement | HTMLSelectElement;

                // If not found global, try searching within the same table row if we are inside one
                if (!targetInput) {
                    const row = el.closest('tr');
                    if (row) {
                        targetInput = row.querySelector(`[data-json-path="${key}"]`) as HTMLInputElement;
                        // Also check by name/class if json-path is not sufficient in template
                    }
                }

                if (targetInput) {
                    const currentVal = ((targetInput.type === 'checkbox' || targetInput.type === 'radio') && (targetInput as HTMLInputElement).checked)
                        ? 'true'
                        : (((targetInput.type === 'checkbox' || targetInput.type === 'radio') && !(targetInput as HTMLInputElement).checked) ? 'false' : targetInput.value);

                    // For radio buttons, we need to check the checked one in the group
                    if (targetInput.type === 'radio') {
                        const groupName = targetInput.name;
                        const checked = document.querySelector(`input[name="${groupName}"]:checked`) as HTMLInputElement;
                        if (checked) {
                            // Use the value of the checked radio
                            // currentVal logic above is flawed for radio group
                            // Wait, parser assigns distinct keys? No, radio share keys but different values usually?
                            // Web/A Form parser uses `radio:groupName (value="val")`. The key passes as json-path?
                            // Let's assume standard behavior: we check value of key.
                        }
                    }

                    // Simplified value extraction
                    let val = targetInput.value;
                    if (targetInput.type === 'checkbox') {
                        val = (targetInput as HTMLInputElement).checked ? 'true' : 'false';
                    }
                    if (targetInput.type === 'radio') {
                        // Find the checked radio with this name
                        const name = targetInput.name;
                        const checked = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
                        val = checked ? checked.value : '';
                    }

                    if (op === '==') visible = val == value;
                    if (op === '!=') visible = val != value;
                } else {
                    // Key not found, default to hidden or visible?
                    // Let's keep visible safe if logic fails, or hidden?
                    // Safe behavior: if dependency missing, show it? No, usually hide.
                    visible = false;
                }
            } else {
                // Boolean check (truthy/falsy)
                const key = condition.trim();
                let targetInput = document.querySelector(`[data-json-path="${key}"]`) as HTMLInputElement;
                if (targetInput) {
                    if (targetInput.type === 'checkbox') visible = (targetInput as HTMLInputElement).checked;
                    else visible = !!targetInput.value;
                } else {
                    visible = false;
                }
            }

            // Toggle visibility
            // If the element is an input wrapper (.form-row), toggle that
            // If it's inside a table cell, toggle the content or just the input?
            // Usually we toggle the closest .form-row
            const container = el.closest('.form-row') as HTMLElement;
            if (container) {
                container.style.display = visible ? '' : 'none';
                // Also disable/enable inputs to prevent submission of hidden data
                const inputs = container.querySelectorAll('input, select, textarea');
                inputs.forEach((inp: any) => {
                    inp.disabled = !visible;
                });
            } else {
                el.style.display = visible ? '' : 'none';
                if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
                    el.disabled = !visible;
                }
            }
        });
    }
}
