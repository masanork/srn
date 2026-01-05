
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

    formatHint(text: string): string {
        const escaped = this.escapeHtml(text);
        return escaped
            .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
            .replace(/\r?\n/g, '<br>');
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

    getSemanticAttrs(key: string, attrs: string | undefined): string {
        if (!attrs) return '';
        let semantic = '';

        // Infer from key name patterns
        const keyLower = key.toLowerCase();
        
        // Phone numbers
        if (keyLower.includes('phone') || keyLower.includes('tel') || keyLower.includes('電話')) {
            semantic += ' type="tel" inputmode="tel" autocomplete="tel"';
        }
        // Email
        else if (keyLower.includes('email') || keyLower.includes('mail') || keyLower.includes('メール')) {
            semantic += ' type="email" inputmode="email" autocomplete="email"';
        }
        // Postal code
        else if (keyLower.includes('zip') || keyLower.includes('postal') || keyLower.includes('郵便')) {
            semantic += ' inputmode="numeric" autocomplete="postal-code"';
        }
        // Name fields
        else if (keyLower.includes('name') || keyLower.includes('氏名') || keyLower.includes('名前')) {
            if (keyLower.includes('sei') || keyLower.includes('姓') || keyLower.includes('family')) {
                semantic += ' autocomplete="family-name"';
            } else if (keyLower.includes('mei') || keyLower.includes('名') || keyLower.includes('given')) {
                semantic += ' autocomplete="given-name"';
            } else {
                semantic += ' autocomplete="name"';
            }
        }
        // Organization
        else if (keyLower.includes('company') || keyLower.includes('organization') || keyLower.includes('会社') || keyLower.includes('組織')) {
            semantic += ' autocomplete="organization"';
        }
        // Address fields
        else if (keyLower.includes('address') || keyLower.includes('住所')) {
            if (keyLower.includes('1') || keyLower.includes('line1')) {
                semantic += ' autocomplete="address-line1"';
            } else if (keyLower.includes('2') || keyLower.includes('line2')) {
                semantic += ' autocomplete="address-line2"';
            } else {
                semantic += ' autocomplete="street-address"';
            }
        }
        // Prefecture/State
        else if (keyLower.includes('pref') || keyLower.includes('都道府県') || keyLower.includes('state')) {
            semantic += ' autocomplete="address-level1"';
        }
        // City
        else if (keyLower.includes('city') || keyLower.includes('市区町村')) {
            semantic += ' autocomplete="address-level2"';
        }

        // Explicit attribute overrides
        const autocompleteMatch = (attrs || '').match(/autocomplete="([^"]+)"/) || (attrs || '').match(/autocomplete='([^']+)'/);
        if (autocompleteMatch) {
            // Replace inferred autocomplete with explicit one
            semantic = semantic.replace(/autocomplete="[^"]*"/, '');
            semantic += ` autocomplete="${autocompleteMatch[1]}"`;
        }

        const inputmodeMatch = (attrs || '').match(/inputmode="([^"]+)"/) || (attrs || '').match(/inputmode='([^']+)'/);
        if (inputmodeMatch) {
            semantic = semantic.replace(/inputmode="[^"]*"/, '');
            semantic += ` inputmode="${inputmodeMatch[1]}"`;
        }

        return semantic;
    },

    getExtraAttrs(attrs: string | undefined): string {
        if (!attrs) return '';
        let extra = '';
        const lenMatch = attrs.match(/(?:len|max):(\d+)/);
        if (lenMatch) extra += ` maxlength="${lenMatch[1]}"`;

        const valMatch = attrs.match(/(?:val|value)="([^"]+)"/);
        if (valMatch) {
            extra += ` value="${this.escapeHtml(valMatch[1])}"`;
        } else {
            const valMatchSimple = attrs.match(/(?:val|value)=([^\s\)]+)/);
            if (valMatchSimple) extra += ` value="${this.escapeHtml(valMatchSimple[1])}"`;
        }

        const contextMatch = attrs.match(/context="([^"]+)"/) || attrs.match(/context='([^']+)'/);
        if (contextMatch) extra += ` data-context="${this.escapeHtml(contextMatch[1])}"`;

        const propertyMatch = attrs.match(/property="([^"]+)"/) || attrs.match(/property='([^']+)'/);
        if (propertyMatch) extra += ` data-property="${this.escapeHtml(propertyMatch[1])}"`;

        const showIfMatch = attrs.match(/show_if="([^"]+)"/) || attrs.match(/show_if='([^']+)'/);
        if (showIfMatch) extra += ` data-show-if="${this.escapeHtml(showIfMatch[1])}"`;

        const autofillMatch = attrs.match(/autofill:([a-z:]+)/) || attrs.match(/autofill="([^"]+)"/) || attrs.match(/autofill='([^']+)'/);
        if (autofillMatch) extra += ` data-autofill="${this.escapeHtml(autofillMatch[1])}"`;

        // Pass through standard validation attributes
        const validationAttrs = ['min', 'max', 'step', 'pattern', 'required', 'readonly', 'disabled', 'minlength', 'maxlength'];
        validationAttrs.forEach(attr => {
            const match = attrs.match(new RegExp(`${attr}="([^"]+)"`)) || attrs.match(new RegExp(`${attr}='([^']+)'`)) || attrs.match(new RegExp(`${attr}=([^\\s\\)]+)`));
            if (match) extra += ` ${attr}="${this.escapeHtml(match[1])}"`;
            else if (new RegExp(`\\b${attr}\\b`).test(attrs)) extra += ` ${attr}`;
        });

        return extra;
    },

    // --- Component Renderers ---

    'text': function (key: string, label: string, attrs: string | undefined) {
        const valMatch = (attrs || '').match(/(?:val|value)="([^"]+)"/) || (attrs || '').match(/(?:val|value)='([^']+)'/) || (attrs || '').match(/(?:val|value)=([^ ]+)/);
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const val = valMatch ? valMatch[1] : '';
        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const contextMatch = (attrs || '').match(/context="([^"]+)"/) || (attrs || '').match(/context='([^']+)'/);
        const effectiveHint = hintMatch ? hintMatch[1] : (contextMatch ? contextMatch[1] : '');
        const hint = effectiveHint ? `<div class="form-hint">${this.formatHint(effectiveHint)}</div>` : '';
        const semanticAttrs = this.getSemanticAttrs(key, attrs);

        return `
        <div class="form-row" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input ${semanticAttrs ? semanticAttrs : 'type="text"'} class="form-input" data-json-path="${key}" value="${this.escapeHtml(val)}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
    },

    'number': function (key: string, label: string, attrs: string | undefined) {
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const contextMatch = (attrs || '').match(/context="([^"]+)"/) || (attrs || '').match(/context='([^']+)'/);
        const effectiveHint = hintMatch ? hintMatch[1] : (contextMatch ? contextMatch[1] : '');
        const hint = effectiveHint ? `<div class="form-row"><div class="form-hint">${this.formatHint(effectiveHint)}</div></div>` : '';

        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="number" inputmode="decimal" class="form-input" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
            ${hint}
        </div>`;
    },

    'date': function (key: string, label: string, attrs: string | undefined) {
        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="date" class="form-input" data-json-path="${key}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
    },

    'textarea': function (key: string, label: string, attrs: string | undefined) {
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const contextMatch = (attrs || '').match(/context="([^"]+)"/) || (attrs || '').match(/context='([^']+)'/);
        const effectiveHint = hintMatch ? hintMatch[1] : (contextMatch ? contextMatch[1] : '');
        const hint = effectiveHint ? `<div class="form-hint">${this.formatHint(effectiveHint)}</div>` : '';
        const valMatch = (attrs || '').match(/(?:val|value)="([^"]+)"/) || (attrs || '').match(/(?:val|value)='([^']+)'/) || (attrs || '').match(/(?:val|value)=([^ ]+)/);
        const val = valMatch ? valMatch[1] : '';

        return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <textarea class="form-input" rows="5" data-json-path="${key}" placeholder="${this.escapeHtml(placeholder)}" style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>${this.escapeHtml(val)}</textarea>
            ${hint}
        </div>`;
    },

    'radioStart': function (key: string, label: string, attrs: string | undefined) {
        return `
        <div class="form-row vertical" style="${this.getStyle(attrs)}">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div class="radio-group" style="padding-left: 10px;">`;
    },

    'radioOption': function (name: string, val: string, label: string, checked: boolean) {
        return `
            <label style="display:block; margin-bottom:5px;">
                <input type="radio" name="${name}" value="${this.escapeHtml(val)}" ${checked ? 'checked' : ''}> ${this.escapeHtml(label)}
            </label>`;
    },

    'calc': function (key: string, label: string, attrs: string | undefined) {
        const formulaMatch = (attrs || '').match(/formula="([^"]+)"/) || (attrs || '').match(/formula='([^']+)'/);
        const formula = formulaMatch ? formulaMatch[1] : '';
        return `
        <div class="form-row">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <input type="text" readonly class="form-input" data-json-path="${key}" data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
        </div>`;
    },

    'search': function (key: string, label: string, attrs: string | undefined) {
        // Allow dots, slashes, colons, etc. in src key. Stop at space or closing paren.
        const srcMatch = (attrs || '').match(/src:([^\s)]+)/);
        const labelIndexMatch = (attrs || '').match(/label:(\d+)/);
        const valueIndexMatch = (attrs || '').match(/value:(\d+)/);
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const hintMatch = (attrs || '').match(/hint="([^"]+)"/) || (attrs || '').match(/hint='([^']+)'/);

        const srcKey = srcMatch ? srcMatch[1] : '';
        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        const hint = hintMatch ? `<div class="form-hint">${this.formatHint(hintMatch[1])}</div>` : '';
        const labelIndexAttr = labelIndexMatch ? ` data-master-label-index="${labelIndexMatch[1]}"` : '';
        const valueIndexAttr = valueIndexMatch ? ` data-master-value-index="${valueIndexMatch[1]}"` : '';

        return `
        <div class="form-row autocomplete-container" style="position:relative; z-index:100;">
            <label class="form-label">${this.escapeHtml(label)}</label>
            <div style="flex:1; position:relative;">
                <input type="text" class="form-input search-input" autocomplete="off" 
                    data-json-path="${key}" 
                    data-master-src="${srcKey}"${labelIndexAttr}${valueIndexAttr}
                    placeholder="${this.escapeHtml(placeholder)}" 
                    style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>
                <div class="search-suggestions" style="display:none; position:absolute; top:100%; left:0; width:100%; background:white; border:1px solid #ccc; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:0 0 4px 4px; z-index:1001;"></div>
            </div>
            ${hint}
        </div>`;
    },

    renderInput(type: string, key: string, attrs: string | undefined, isTemplate: boolean = false): string {
        const placeholderMatch = (attrs || '').match(/placeholder="([^"]+)"/) || (attrs || '').match(/placeholder='([^']+)'/);
        const placeholder = placeholderMatch ? `placeholder="${this.escapeHtml(placeholderMatch[1])}"` : '';
        const commonClass = isTemplate ? 'form-input template-input' : 'form-input';
        const dataAttr = isTemplate ? `data-base-key="${key}"` : `data-json-path="${key}"`;

        if (type === 'calc') {
            const formulaMatch = (attrs || '').match(/formula="([^"]+)"/) || (attrs || '').match(/formula='([^']+)'/);
            const formula = formulaMatch ? formulaMatch[1] : '';
            return `<input type="text" readonly class="${commonClass}" ${dataAttr} data-formula="${this.escapeHtml(formula)}" style="background:#f9f9f9; text-align:right; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
        }

        if (type === 'datalist') {
            const srcMatch = (attrs || '').match(/src:([a-zA-Z0-9_\-\u0080-\uFFFF]+)/);
            const labelIndexMatch = (attrs || '').match(/label:(\d+)/);
            let optionsHtml = '';
            const srcKey = srcMatch ? srcMatch[1] : '';
            if (srcKey && this._context.masterData && this._context.masterData[srcKey]) {
                const data = this._context.masterData[srcKey];
                const lIdx = labelIndexMatch ? parseInt(labelIndexMatch[1] || '1') - 1 : 1;
                data.forEach((row: string[]) => {
                    if (row.length > lIdx) {
                        optionsHtml += `<option value="${this.escapeHtml(row[lIdx] || '')}"></option>`;
                    }
                });
            }
            const listId = 'list_' + key + '_' + Math.floor(Math.random() * 10000);
            return `<input type="text" list="${listId}" class="${commonClass}" ${dataAttr} ${placeholder} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}><datalist id="${listId}">${optionsHtml}</datalist>`;
        }

        if (type === 'search') {
            const srcMatch = (attrs || '').match(/src:([a-zA-Z0-9_\-\u0080-\uFFFF]+)/);
            const labelIndexMatch = (attrs || '').match(/label:(\d+)/);
            const valueIndexMatch = (attrs || '').match(/value:(\d+)/);
            const srcKey = srcMatch ? srcMatch[1] : '';
            const labelIndexAttr = labelIndexMatch ? ` data-master-label-index="${labelIndexMatch[1]}"` : '';
            const valueIndexAttr = valueIndexMatch ? ` data-master-value-index="${valueIndexMatch[1]}"` : '';
            const searchClass = commonClass + ' search-input';

            // Note: search-suggestions are now global, no need for inner div
            let suggestAttr = '';
            if ((attrs || '').includes('suggest:column')) {
                suggestAttr = ' data-suggest-source="column"';
            }
            const copyMatch = (attrs || '').match(/copy:([^\s)]+)/);
            const copyAttr = copyMatch ? ` data-copy-from="${copyMatch[1]}"` : '';
            const bgStyle = copyMatch ? 'background-color: #ffffea;' : '';

            return `<div style="display:inline-block; position:relative; width: 100%; min-width: 100px;">
                        <input type="text" class="${searchClass}" ${dataAttr} autocomplete="off" data-master-src="${srcKey}"${labelIndexAttr}${valueIndexAttr} ${placeholder} style="${bgStyle} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${suggestAttr}${copyAttr}>
                    </div>`;
        }

        if (type === 'number') {
            const copyMatch = (attrs || '').match(/copy:([^\s)]+)/);
            const copyAttr = copyMatch ? ` data-copy-from="${copyMatch[1]}"` : '';
            const bgStyle = copyMatch ? 'background-color: #ffffea;' : '';
            return `<input type="number" class="${commonClass}" ${dataAttr} ${placeholder} style="text-align:right; ${bgStyle} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${copyAttr}>`;
        }

        if (type === 'date') {
            return `<input type="date" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
        }

        if (type === 'checkbox') {
            return `<input type="checkbox" class="${commonClass}" ${dataAttr} style="${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
        }

        if (type === 'autonum' || (attrs || '').includes('autonum')) {
            const classList = commonClass + ' auto-num';
            return `<input type="number" readonly class="${classList}" ${dataAttr} data-autonum="true" style="background:transparent; border:none; text-align:center; width:100%; font-weight:bold; cursor:default; ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}>`;
        }

        // Default text
        let suggestAttr = '';
        let suggestClass = '';
        if ((attrs || '').includes('suggest:column')) {
            suggestClass = ' search-input';
            suggestAttr = ' data-suggest-source="column"';
        }
        const copyMatch = (attrs || '').match(/copy:([^\s)]+)/);
        const copyAttr = copyMatch ? ` data-copy-from="${copyMatch[1]}"` : '';
        const bgStyle = copyMatch ? 'background-color: #ffffea;' : '';
        const semanticAttrs = this.getSemanticAttrs(key, attrs);

        return `<input ${semanticAttrs ? semanticAttrs : 'type="text"'} class="${commonClass}${suggestClass}" ${dataAttr} ${placeholder} style="${bgStyle} ${this.getStyle(attrs)}"${this.getExtraAttrs(attrs)}${suggestAttr}${copyAttr}>`;
    },

    tableRow(cells: string[], isTemplate = false) {
        const tds = cells.map(cell => {
            const trimmed = cell.trim();
            const match = trimmed.match(/^\[(?:([a-z]+):)?([^\]:\(\)]+)(?:\s*\((.*)\)|:([^\]]+))?\]$/);

            if (match) {
                let [_, type, keyPart, attrsParen, attrsColon] = match;
                let key = (keyPart || '').trim();
                let extraAttrs = attrsParen || attrsColon || '';

                if (key.includes(' ')) {
                    const parts = key.split(/\s+/);
                    key = parts[0]!;
                    extraAttrs = parts.slice(1).join(' ') + ' ' + extraAttrs;
                }

                const inputHtml = this.renderInput(type || 'text', key, extraAttrs, isTemplate);
                return `<td>${inputHtml}</td>`;
            } else {
                return `<td>${this.escapeHtml(trimmed)}</td>`;
            }
        }).join('');
        return `<tr ${isTemplate ? 'class="template-row"' : ''}>${tds}</tr>`;
    }
};
