
/**
 * Converts an ISO date string (YYYY-MM-DD) to Japanese Era (Wareki) format.
 */
export function toWareki(dateStr: string): string {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const eras = [
        { name: '令和', start: new Date('2019-05-01'), symbol: 'R' },
        { name: '平成', start: new Date('1989-01-08'), symbol: 'H' },
        { name: '昭和', start: new Date('1926-12-25'), symbol: 'S' },
        { name: '大正', start: new Date('1912-07-30'), symbol: 'T' },
        { name: '明治', start: new Date('1868-10-23'), symbol: 'M' },
    ];

    for (const era of eras) {
        if (date >= era.start) {
            const year = date.getFullYear() - era.start.getFullYear() + 1;
            const yearStr = year === 1 ? '元' : year.toString();
            return `${era.name}${yearStr}年${date.getMonth() + 1}月${date.getDate()}日`;
        }
    }

    return dateStr;
}

/**
 * Converts half-width alphanumeric characters and symbols to full-width (Zen-kaku).
 * Useful for matching the "Visual Lockdown" requirement of Japanese official documents.
 */
export function toFullWidth(str: string): string {
    if (!str) return '';
    return str.replace(/[!-~]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xfee0))
        .replace(/ /g, '　'); // Half-width space to full-width Ideographic Space
}

/**
 * A pragmatic "Legal Normalizer" that ensures data entered in machine-friendly formats
 * appears in the strict human-legal format required for official documents.
 */
export function toLegalFormat(val: any): string {
    if (typeof val !== 'string') return String(val ?? '');

    // If it looks like a date, convert to Wareki
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return toWareki(val);
    }

    // If it's alphanumeric, convert to FullWidth (typical for Japanese Certificates)
    if (/^[A-Za-z0-9\- \.]+$/.test(val)) {
        return toFullWidth(val);
    }

    return val;
}
