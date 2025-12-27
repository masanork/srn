
export interface FormField {
    id: string;      // "employee.name"
    type: string;    // "text", "date", "radio", etc.
    label?: string;  // Extracted from Markdown context (e.g. preceding list item text)
    placeholder?: string;
    options?: string[]; // For radio/select
    required?: boolean;
    attributes?: Record<string, string>; // Other attributes like 'suggest'
}

export interface FormSchema {
    title: string;
    description?: string;
    fields: FormField[];
}

export interface ValidationError {
    id: string;
    message: string;
}

export class WebAParser {
    // Regex for [type:id (attrs)]
    private static FIELD_REGEX = /\[([a-z0-9_-]+):([a-z0-9_.-]+)(?:\s+\(([^)]+)\))?\]/g;

    static parse(markdown: string): FormSchema {
        const fields: FormField[] = [];

        // Simple frontmatter extraction (for title)
        const titleMatch = markdown.match(/^title:\s*["']?([^"'\n]+)["']?/m);
        const title = titleMatch ? titleMatch[1] : "Untitled Form";

        // Scan for fields
        let match;
        WebAParser.FIELD_REGEX.lastIndex = 0;

        while ((match = WebAParser.FIELD_REGEX.exec(markdown)) !== null) {
            const fullMatch = match[0];
            const type = match[1];
            const id = match[2];
            const attrString = match[3];

            const attributes = this.parseAttributes(attrString || '');

            // Try to infer label from line context
            const lineStart = markdown.lastIndexOf('\n', match.index) + 1;
            const lineEnd = markdown.indexOf('\n', match.index);
            const line = markdown.slice(lineStart, lineEnd !== -1 ? lineEnd : markdown.length);
            const label = line.replace(fullMatch, '').replace(/^- /, '').trim();

            fields.push({
                id,
                type,
                label: label || undefined,
                placeholder: attributes['placeholder'],
                attributes
            });
        }

        return { title, fields };
    }

    static fill(markdown: string, data: Record<string, any>): string {
        return markdown.replace(WebAParser.FIELD_REGEX, (fullMatch, type, id, attrString) => {
            const value = data[id];
            if (value === undefined || value === null) return fullMatch;

            // Simple attribute injection
            let newAttrs = attrString ? attrString.trim() : '';

            // Remove existing value attribute if present
            newAttrs = newAttrs.replace(/value=["'][^"']*["']/, '').trim();

            // Escape quotes in value
            const escapedValue = String(value).replace(/"/g, '&quot;');
            const valueAttr = `value="${escapedValue}"`;

            // Reconstruct the tag
            const content = `${type}:${id} ${newAttrs} ${valueAttr}`.trim().replace(/\s+/, ' ');
            return `[${content}]`;
        });
    }

    static validate(markdown: string): ValidationError[] {
        const schema = this.parse(markdown);
        const errors: ValidationError[] = [];

        for (const field of schema.fields) {
            // Check required
            // Note: parseAttributes sets keys to "true" if value is missing.
            if (field.attributes && (field.attributes['required'] !== undefined)) {
                // If required, check value
                const val = field.attributes['value'];

                // Simple empty check. 
                // In production, we should handle checkbox "true"/"false" vs text empty string differently.
                if (!val || val.trim() === '') {
                    errors.push({ id: field.id, message: 'Required field is empty' });
                }
            }
        }
        return errors;
    }

    private static parseAttributes(attrString: string): Record<string, string> {
        const attrs: Record<string, string> = {};
        const regex = /([a-z0-9_-]+)(?:=["']([^"']*)["'])?/g;
        let match;
        while ((match = regex.exec(attrString)) !== null) {
            attrs[match[1]] = match[2] !== undefined ? match[2] : 'true';
        }
        return attrs;
    }
}
