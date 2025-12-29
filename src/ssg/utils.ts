export function normalizeDate(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date && !isNaN(value.getTime())) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    if (typeof value === 'string') {
        const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch?.[1]) return isoMatch[1];
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const day = String(parsed.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return value;
    }
    return String(value);
}

export function stripLeadingTitleHeading(content: string, title: unknown): string {
    if (!title) return content;
    const lines = content.split('\n');
    let i = 0;
    while (i < lines.length && (lines[i] || '').trim() === '') {
        i += 1;
    }
    if (i < lines.length && (lines[i] || '').startsWith('# ')) {
        lines.splice(i, 1);
        if (i < lines.length && (lines[i] || '').trim() === '') {
            lines.splice(i, 1);
        }
    }
    return lines.join('\n');
}
