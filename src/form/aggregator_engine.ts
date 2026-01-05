
/**
 * Web/A Aggregator Engine (Shared)
 * 
 * Core logic for data extraction, metric computation, and CSV flattening
 * used by both CLI and Browser runtimes.
 */

/**
 * Select values from a JSON object using a simplified JSONPath-like syntax.
 * Supports: 
 * - Simple paths: "user.name"
 * - Array indexing: "items[0].name"
 * - Array wildcard: "items[].name" (extracts names from all items)
 * - Root prefix: "$.user.name"
 */
export function selectValues(source: any, path: string): any[] {
    if (!source || !path) return [];
    const normalized = path.trim().replace(/^\$\./, "");
    if (!normalized) return [source];

    const segments = normalized.split(".");
    let current: any[] = [source];

    for (const segment of segments) {
        const next: any[] = [];
        const arrayMatch = segment.match(/^(.*)\[(\d*)\]$/);
        
        const key = arrayMatch ? arrayMatch[1] : segment;
        const indexStr = arrayMatch ? arrayMatch[2] : null;

        for (const item of current) {
            if (item === null || item === undefined) continue;
            
            const value = key ? item[key] : item;
            if (value === undefined || value === null) continue;

            if (indexStr === "") { // Wildcard []
                if (Array.isArray(value)) {
                    next.push(...value);
                } else {
                    next.push(value); // Fallback for non-arrays
                }
            } else if (indexStr !== null) { // Specific index [n]
                const idx = parseInt(indexStr, 10);
                if (Array.isArray(value) && value[idx] !== undefined) {
                    next.push(value[idx]);
                }
            } else {
                next.push(value);
            }
        }
        current = next;
    }
    return current;
}

/**
 * Compute aggregate metrics from multiple records.
 */
export interface MetricSpec {
    id: string;
    name: string;
    type: "count" | "sum" | "avg" | "percent" | "boolean_count";
    path: string;
}

export function computeMetric(spec: MetricSpec, payloads: { plain: any }[]): number | string {
    const values: any[] = [];
    payloads.forEach((p) => {
        const extracted = selectValues(p.plain, spec.path);
        values.push(...extracted);
    });

    switch (spec.type) {
        case "count":
            return payloads.length;
        case "sum":
            return values.reduce((a, b) => a + (Number(b) || 0), 0);
        case "avg":
            return values.length ? values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length : 0;
        case "boolean_count":
            return values.filter((v) => !!v).length;
        case "percent": {
            const positive = values.filter((v) => !!v).length;
            return values.length ? `${((positive / values.length) * 100).toFixed(1)}%` : "0%";
        }
        default:
            return 0;
    }
}

/**
 * Flattens a nested object into a single-level Map for CSV output.
 * Nested keys are represented as "parent.child" or "items[0].key".
 */
export function flattenForCsv(obj: any): Record<string, any> {
    const out: Record<string, any> = {};
    
    const walk = (value: any, prefix: string) => {
        if (value === null || value === undefined) {
            out[prefix] = null;
            return;
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                out[prefix] = "[]";
                return;
            }
            value.forEach((entry, idx) => {
                walk(entry, prefix ? `${prefix}[${idx}]` : `[${idx}]`);
            });
            return;
        }
        
        if (typeof value === 'object' && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0) {
                out[prefix] = "{}";
                return;
            }
            entries.forEach(([k, v]) => {
                const next = prefix ? `${prefix}.${k}` : k;
                walk(v, next);
            });
            return;
        }
        
        out[prefix] = value;
    };

    walk(obj, '');
    if ('' in out) delete out[''];
    return out;
}
