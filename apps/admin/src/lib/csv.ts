/** Minimal RFC 4180 CSV: quoted fields, escaped quotes, CRLF/LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Prefix formula-like values so spreadsheets don't execute them.
  const safe = /^[=+\-@]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";

export const PLANT_COLUMNS = [
  "slug", "name", "botanical", "status", "badge", "light", "space", "pet_safe", "care", "natural_size", "featured", "blurb",
  "price_s", "price_m", "price_l", "compare_at_s", "compare_at_m", "compare_at_l",
  "stock_s", "stock_m", "stock_l", "active_s", "active_m", "active_l", "seo_title", "seo_description",
] as const;
