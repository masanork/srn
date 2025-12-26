
export class SearchEngine {
    private suggestionsVisible = false;
    private activeSearchInput: HTMLInputElement | null = null;
    private globalBox: HTMLElement | null = null;

    constructor() {
        // Init
    }

    public init() {
        console.log("Initializing Search Engine (Bundle)...");
        const w = window as any;
        // @ts-ignore
        if (w.generatedJsonStructure && w.generatedJsonStructure.masterData) {
            // @ts-ignore
            const keys = Object.keys(w.generatedJsonStructure.masterData);
            console.log("Master Data Keys available:", keys.join(', '));
        }

        this.setupEventDelegation();
    }

    private normalize(val: string): string {
        if (!val) return '';
        let n = val.toString().toLowerCase();
        n = n.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        n = n.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
        return n.trim();
    }

    private clean(s: string): string {
        if (!s) return '';
        let n = this.normalize(s);
        n = n.replace(/(株式会社|有限会社|合同会社|一般社団法人|公益社団法人|npo法人|学校法人|社会福祉法人)/g, '');
        n = n.replace(/(\(株\)|\(有\)|\(同\))/g, '');
        return n.trim();
    }

    private toIndex(raw?: string): number {
        const parsed = parseInt(raw || '', 10);
        return Number.isFinite(parsed) ? parsed - 1 : -1;
    }

    private getGlobalBox(): HTMLElement {
        if (!this.globalBox) {
            this.globalBox = document.getElementById('web-a-search-suggestions');
            if (!this.globalBox) {
                this.globalBox = document.createElement('div');
                this.globalBox.id = 'web-a-search-suggestions';
                this.globalBox.className = 'search-suggestions';
                Object.assign(this.globalBox.style, {
                    display: 'none',
                    position: 'absolute',
                    background: 'white',
                    border: '1px solid #ccc',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: '9999',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    borderRadius: '4px'
                });
                document.body.appendChild(this.globalBox);
            }
        }
        return this.globalBox;
    }

    private hideSuggestions() {
        const box = this.getGlobalBox();
        if (box) box.style.display = 'none';
        this.suggestionsVisible = false;
        this.activeSearchInput = null;
    }

    private setupEventDelegation() {
        // Close on click outside
        document.addEventListener('click', (e: any) => {
            if (this.suggestionsVisible && !e.target.closest('#web-a-search-suggestions') && e.target !== this.activeSearchInput) {
                this.hideSuggestions();
            }
        });

        // Close on scroll
        document.addEventListener('scroll', () => {
            if (this.suggestionsVisible) this.hideSuggestions();
        }, true);

        // Input Event
        document.body.addEventListener('input', (e: any) => {
            if (e.target.classList.contains('search-input')) {
                this.handleSearchInput(e.target as HTMLInputElement);
            }
        });

        // Click Event (Selection)
        document.body.addEventListener('click', (e: any) => {
            if (e.target.classList.contains('suggestion-item')) {
                this.handleSelection(e.target as HTMLElement);
            }
        });
    }

    private handleSearchInput(input: HTMLInputElement) {
        this.activeSearchInput = input;
        const w = window as any;

        const srcKey = input.dataset.masterSrc;
        const suggestSource = input.dataset.suggestSource;
        if (!srcKey && !suggestSource) return;

        const labelIdx = this.toIndex(input.dataset.masterLabelIndex);
        const valueIdx = this.toIndex(input.dataset.masterValueIndex);

        const query = input.value;
        if (!query) {
            this.hideSuggestions();
            return;
        }

        const hits: any[] = [];
        const normQuery = this.normalize(query);

        if (suggestSource === 'column') {
            const baseKey = input.dataset.baseKey;
            const table = input.closest('table');
            if (table && baseKey) {
                const seen = new Set<string>();
                table.querySelectorAll(`[data-base-key="${baseKey}"]`).forEach((inp: any) => {
                    if (inp === input) return;
                    const v = inp.value;
                    if (v && this.normalize(v).includes(normQuery)) {
                        if (!seen.has(v)) {
                            seen.add(v);
                            hits.push({ val: v, row: [v], label: v, score: 10 });
                        }
                    }
                });
            }
        } else if (srcKey) {
            // Master Search
            const master = w.generatedJsonStructure.masterData;
            if (!master || !master[srcKey]) return;

            const allRows = master[srcKey];
            allRows.forEach((row: string[], idx: number) => {
                if (idx === 0) return; // Skip header
                const match = row.some(col => this.normalize(col || '').includes(normQuery));
                if (match) {
                    const labelVal = labelIdx >= 0 ? row[labelIdx] || '' : '';
                    const valueVal = valueIdx >= 0 ? row[valueIdx] || '' : '';
                    const val = valueIdx >= 0 ? valueVal : (labelIdx >= 0 ? labelVal : (row[1] || row[0] || ''));
                    hits.push({ val, row, label: labelVal, score: 10, idx });
                }
            });
        }

        this.renderSuggestions(input, hits, labelIdx);
    }

    private renderSuggestions(input: HTMLInputElement, hits: any[], labelIdx: number) {
        if (hits.length === 0) {
            this.hideSuggestions();
            return;
        }
        const w = window as any;
        // Basic sort: Currently simple score 10 for all. Could add advanced scoring later.

        const topHits = hits.slice(0, 10);
        let html = '';
        topHits.forEach(h => {
            const rowJson = w.escapeHtml(JSON.stringify(h.row));
            const displayLabel = labelIdx >= 0 ? (h.label || h.row.join(' : ')) : h.row.join(' : ');
            html += `<div class="suggestion-item" data-val="${w.escapeHtml(h.val)}" data-row="${rowJson}" style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:14px; color:#333;">${w.escapeHtml(displayLabel)}</div>`;
        });

        const box = this.getGlobalBox();
        box.innerHTML = html;

        // Positioning (Simplified port)
        const rect = input.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        box.style.width = Math.max(rect.width, 200) + 'px';
        box.style.left = (rect.left + scrollLeft) + 'px';
        box.style.top = (rect.bottom + scrollTop) + 'px';

        // Hover effects via JS
        box.querySelectorAll('.suggestion-item').forEach((el: any) => {
            el.onmouseenter = () => el.style.background = '#f0f8ff';
            el.onmouseleave = () => el.style.background = 'white';
        });

        box.style.display = 'block';
        this.suggestionsVisible = true;
    }

    private handleSelection(item: HTMLElement) {
        if (!this.activeSearchInput) return;

        const w = window as any;
        const input = this.activeSearchInput;
        const val = item.dataset.val || '';
        const rowJson = item.dataset.row || '[]';

        // 1. Fill Input
        // Note: Full logic includes auto-mapping. For now, basic fill.
        // We need to implement the detailed auto-fill logic here or call a helper.
        // Let's implement the core auto-fill logic.

        try {
            const rowData = JSON.parse(rowJson);
            const srcKey = input.dataset.masterSrc;
            const masterHeaders = srcKey ? w.generatedJsonStructure.masterData[srcKey][0] : [];

            let searchInputFilled = false;

            if (masterHeaders.length > 0 && rowData.length > 0) {
                const tr = input.closest('tr');
                if (tr) {
                    const inputs = Array.from(tr.querySelectorAll('input, select, textarea'));
                    masterHeaders.forEach((header: string, idx: number) => {
                        if (!header) return;
                        const targetVal = rowData[idx];
                        // Find target input... (omitted full logic for brevity, will copy full logic if needed or improve)
                        // For refactoring, we should copy the ROBUST logic.
                        this.fillField(inputs, header, targetVal, input, () => { searchInputFilled = true; });
                    });
                }
            }

            if (!searchInputFilled) {
                input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }

        } catch (e) { console.error(e); }

        this.hideSuggestions();
    }

    private fillField(inputs: any[], header: string, value: string, sourceInput: HTMLInputElement, onSelfFilled: () => void) {
        // Simplified mapping logic for now to verify module bundle works.
        // We will perform a strict copy of the logic in next step if this works.
        // Re-implementing the "Flexible Match" logic:
        const normHeader = this.normalize(header);

        const target = inputs.find((inp: any) => {
            const k = inp.dataset.baseKey || inp.dataset.jsonPath;
            const ph = this.normalize(inp.getAttribute('placeholder') || '');
            // Label matching is expensive to re-query DOM. 
            // Assume Key or Placeholder match for V1 refactor.
            return (k && this.normalize(k) === normHeader) || (ph === normHeader);
        });

        if (target) {
            target.value = value || '';
            target.dispatchEvent(new Event('input', { bubbles: true }));
            if (target === sourceInput) onSelfFilled();
        }
    }
}
