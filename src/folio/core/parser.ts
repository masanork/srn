
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
    form?: string | undefined;
    version?: string | undefined;
    description?: string | undefined;
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

        // Simple frontmatter extraction
        const frontmatterMatch = markdown.match(/^---\n([\s\S]+?)\n---/);
        let extractedTitle: string | undefined;
        let extractedForm: string | undefined;
        let extractedVersion: string | undefined;

        if (frontmatterMatch && frontmatterMatch[1]) {
            const fm = frontmatterMatch[1];
            if (fm) {
                const titleM = fm.match(/^title:\s*["']?([^"'\n]+)["']?/m);
                if (titleM && titleM[1]) extractedTitle = titleM[1];

                const idM = fm.match(/^form:\s*["']?([^"'\n]+)["']?/m);
                if (idM && idM[1]) extractedForm = idM[1];

                const verM = fm.match(/^version:\s*["']?([^"'\n]+)["']?/m);
                if (verM && verM[1]) extractedVersion = verM[1];
            }
        }

        // Fallback or override title if not in frontmatter
        if (!extractedTitle) {
            const titleMatch = markdown.match(/^title:\s*["']?([^"'\n]+)["']?/m);
            if (titleMatch && titleMatch[1]) extractedTitle = titleMatch[1];
        }

        const finalTitle = extractedTitle || "Untitled Form";

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

        return {
            title: finalTitle,
            form: extractedForm,
            version: extractedVersion,
            fields
        };
    }

    static fill(markdown: string, data: Record<string, any>): string {
        return markdown.replace(WebAParser.FIELD_REGEX, (_fullMatch, type, id, attrString) => {
            const value = data[id];
            if (value === undefined || value === null) return _fullMatch;

            // Simple attribute injection
            let newAttrs = (attrString || '').trim();

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
            if (field.attributes && (field.attributes['required'] !== undefined)) {
                // If required, check value
                const val = field.attributes['value'];
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
            attrs[match[1]] = (match[2] !== undefined && match[2] !== null) ? match[2] : 'true';
        }
        return attrs;
    }
}
