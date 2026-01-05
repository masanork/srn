import { flattenForCsv } from '../aggregator_engine';
export { flattenForCsv };

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
