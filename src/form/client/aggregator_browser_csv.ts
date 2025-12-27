export function flattenForCsv(obj: Record<string, any>): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  const walk = (value: any, prefix: string) => {
    if (value === null || value === undefined) {
      out[prefix] = null;
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, idx) => {
        walk(entry, prefix ? `${prefix}[${idx}]` : `[${idx}]`);
      });
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => {
        const next = prefix ? `${prefix}.${k}` : k;
        walk(v, next);
      });
      return;
    }
    out[prefix] = value;
  };
  walk(obj, "");
  if ("" in out) delete out[""];
  return out;
}

export function buildRowFromPlain(params: {
  plain: any;
  filename: string;
  includeJson?: boolean;
  sig?: any;
  omitKey?: (key: string) => boolean;
}): { row: any; keys: Set<string> } {
  const row: any = { _filename: params.filename };
  const keys = new Set<string>(["_filename"]);
  if (params.includeJson) {
    keys.add("_json");
    row._json = JSON.stringify(params.plain);
  }
  const flat = flattenForCsv(params.plain || {});
  for (const key of Object.keys(flat)) {
    if (params.omitKey && params.omitKey(key)) continue;
    keys.add(key);
    row[key] = flat[key];
  }
  if (params.sig) {
    keys.add("_l2_sig");
    row._l2_sig = JSON.stringify(params.sig);
  }
  return { row, keys };
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(rows: any[], keys: string[]): string {
  const lines: string[] = [];
  lines.push(keys.map(escapeCsv).join(","));
  rows.forEach((row) => {
    const line = keys.map((key) => escapeCsv(row[key])).join(",");
    lines.push(line);
  });
  return "\ufeff" + lines.join("\n");
}
