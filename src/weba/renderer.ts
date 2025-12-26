
export interface RendererContext {
    masterData: Record<string, string[][]>;
}

export const Renderers: Record<string, any> = {
    _context: { masterData: {} } as RendererContext,

    setMasterData(data: Record<string, string[][]>) {
        this._context.masterData = data;
    },

    escapeHtml(str: string): string {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    getStyle(attrs: string | undefined): string {
        if (!attrs) return '';
        let style = '';
        if (attrs.includes('size:L')) style += 'font-size: 1.25em;';
        if (attrs.includes('size:S')) style += 'font-size: 0.8em;';
        if (attrs.includes('size:XL')) style += 'font-size: 1.5em; font-weight: bold;';
        if (attrs.includes('align:R')) style += 'text-align: right;';
        if (attrs.includes('align:C')) style += 'text-align: center;';
        if (attrs.includes('bold')) style += 'font-weight: bold;';
        return style;
    },

    getExtraAttrs(attrs: string | undefined): string {
        if (!attrs) return '';
        let extra = '';
        const lenMatch = attrs.match(/(?:len|max):(\d+)/);
        if (lenMatch) extra += ` maxlength="${lenMatch[1]}"`;

        const valMatch = attrs.match(/val="([^"]+)"/);
        if (valMatch) {
            extra += ` value="${this.escapeHtml(valMatch[1])}"`;
        } else {
            const valMatchSimple = attrs.match(/val=([^\s\)]+)/);
            if (valMatchSimple) extra += ` value="${this.escapeHtml(valMatchSimple[1])}"`;
        }
        return extra;
    },

    // --- Component Renderers ---

    text(key: string, label: string, attrs: string | undefined) {
        const valMatch = (attrs || '').match(/val="([^"]+)"/) || (attrs || '').match(/val='([^']+)'/) || (attrs || '').match(/val=([^ ]+)/);
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const val = valMatch ? valMatch[1] : '';
        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const hint = hintMatch ? `<div class="form-hint">${this.escapeHtml(hintMatch[1]).replace(/<br>/g, '<br>')}</div>` : '';

        return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" class="form-input" data-json-path="${key}" value="${this.escapeHtml(val)}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
    },

    number(key: string, label: string, attrs: string | undefined) {
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const hint = hintMatch ? `<div class="form-hint">${this.escapeHtml(hintMatch[1]).replace(/<br>/g, '<br>')}</div>` : '';

        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="number" class="form-input" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
    },

    date(key: string, label: string, attrs: string | undefined) {
        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="date" class="form-input" data-json-path="${key}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
    },

    textarea(key: string, label: string, attrs: string | undefined) {
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const hint = hintMatch ? `<div class="form-hint">${this.escapeHtml(hintMatch[1]).replace(/<br>/g, '<br>')}</div>` : '';
        return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <textarea class="form-input" rows="5" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></textarea>
            ${hint}
        </div>`;
    },

    radioStart(key: string, label: string, attrs: string | undefined) {
        return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div class="radio-group" style="padding-left: 10px;">`;
    },

    radioOption(name: string, val: string, label: string, checked: boolean) {
        return `
            <label style="display:block; margin-bottom:5px;">
                <input type="radio" name="${name}" value="${this.escapeHtml(val)}" ${checked ? 'checked' : ''}> ${this.escapeHtml(label)}
            </label>`;
    },

    calc(key: string, label: string, attrs: string | undefined) {
        const formulaMatch = (attrs || '').match(/formula="([^"]+)"/) || (attrs || '').match(/formula='([^']+)'/);
        const formula = formulaMatch ? formulaMatch[1] : '';
        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" readonly class="form-input" data-json-path="${key}" data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
    },

    datalist(key: string, label: string, attrs: string | undefined) {
        const srcMatch = (attrs || '').match(/src:([a-zA-Z0-9_]+)/);
        const labelIndexMatch = (attrs || '').match(/label:(\d+)/);
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const hint = hintMatch ? `<div class="form-hint">${this.escapeHtml(hintMatch[1]).replace(/<br>/g, '<br>')}</div>` : '';

        let optionsHtml = '';
        const srcKey = srcMatch ? srcMatch[1] : '';
        if (srcKey && this._context.masterData && this._context.masterData[srcKey]) {
            const data = this._context.masterData[srcKey];
            const lIdx = labelIndexMatch ? parseInt(labelIndexMatch[1]) - 1 : 1;

            data.forEach((row: string[]) => {
                if (row.length > lIdx) {
                    optionsHtml += `<option value="${this.escapeHtml(row[lIdx] || '')}"></option>`;
                }
            });
        }

        const listId = 'list_' + key + '_' + Math.floor(Math.random() * 10000);

        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" list="${listId}" class="form-input" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}><datalist id="${listId}">${optionsHtml}</datalist>
            ${hint}
        </div>`;
    },

    tableRow(cells: string[], isTemplate = false) {
        const tds = cells.map(cell => {
            const trimmed = cell.trim();
            const match = trimmed.match(/^\[(?:([a-z]+):)?([a-zA-Z0-9_]+)(?:\s*\(([^)]+)\)|:([^\]]+))?\]$/);

            if (match) {
                let [_, type, key, attrsParen, attrsColon] = match;
                const attrs = attrsParen || attrsColon;

                const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
                const placeholder = placeholderMatch ? `placeholder="${this.escapeHtml(placeholderMatch[1])}"` : '';

                if (type === 'calc') {
                    const formulaMatch = (attrs || '').match(/formula="([^"]+)"/) || (attrs || '').match(/formula='([^']+)'/);
                    const formula = formulaMatch ? formulaMatch[1] : '';
                    const commonClass = isTemplate ? 'form-input template-input' : 'form-input';
                    const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
                    return `<td><input type="text" readonly class="${commonClass}" ${dataAttr} data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
                }

                if (type === 'datalist') {
                    const srcMatch = (attrs || '').match(/src:([a-zA-Z0-9_]+)/);
                    const labelIndexMatch = (attrs || '').match(/label:(\d+)/);
                    let optionsHtml = '';
                    const srcKey = srcMatch ? srcMatch[1] : '';
                    if (srcKey && this._context.masterData && this._context.masterData[srcKey]) {
                        const data = this._context.masterData[srcKey];
                        const lIdx = labelIndexMatch ? parseInt(labelIndexMatch[1]) - 1 : 1;
                        data.forEach((row: string[]) => {
                            if (row.length > lIdx) {
                                optionsHtml += `<option value="${this.escapeHtml(row[lIdx] || '')}"></option>`;
                            }
                        });
                    }
                    const listId = 'list_' + key + '_' + Math.floor(Math.random() * 10000);
                    const commonClass = isTemplate ? 'form-input template-input' : 'form-input';
                    const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
                    return `<td><input type="text" list="${listId}" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}><datalist id="${listId}">${optionsHtml}</datalist></td>`;
                }

                if (type === 'number') {
                    const commonClass = isTemplate ? 'form-input template-input' : 'form-input';
                    const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;
                    return `<td><input type="number" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
                }

                if (isTemplate) {
                    return `<td><input type="text" class="form-input template-input" data-base-key="${key}" ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
                } else {
                    return `<td><input type="text" class="form-input" data-json-path="${key}" ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}></td>`;
                }
            } else {
                return `<td>${this.escapeHtml(trimmed)}</td>`;
            }
        }).join('');
        return `<tr ${isTemplate ? 'class="template-row"' : ''}>${tds}</tr>`;
    }
};
