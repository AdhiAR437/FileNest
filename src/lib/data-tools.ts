import Papa from 'papaparse';
export const TEXT_LIMIT = 1_000_000;
export function checkText(text: string) {
  if (new TextEncoder().encode(text).length > TEXT_LIMIT) throw new Error('Use up to 1 MB of UTF-8 text per input.');
}
function readCsv(text: string) {
  checkText(text);
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: 'greedy', dynamicTyping: false });
  const errors = parsed.errors.filter(e => e.code !== 'UndetectableDelimiter');
  if (errors.length) throw new Error(errors[0].message);
  const [headers, ...rows] = parsed.data;
  if (!headers?.length || headers.some(h => !h.trim()) || new Set(headers).size !== headers.length) throw new Error('CSV needs unique, non-empty column headers.');
  if (headers.length > 100 || rows.length > 10000) throw new Error('Use up to 100 columns and 10,000 data rows per CSV.');
  const bad = rows.findIndex(row => row.length !== headers.length);
  if (bad >= 0) throw new Error(`CSV data row ${bad + 1} has a different number of cells from the header.`);
  return { headers, rows };
}
export type CsvChange = { type: 'added' | 'removed' | 'changed'; key: string; originalRow?: number; updatedRow?: number; before?: Record<string, string>; after?: Record<string, string>; cells?: { column: string; before?: string; after?: string }[] };
export type CsvReport = { matching: string; columnsAdded: string[]; columnsRemoved: string[]; unchanged: number; changes: CsvChange[] };
export function compareCsv(left: string, right: string, keyColumn = '', trim = false, ignoreCase = false): CsvReport {
  const a = readCsv(left), b = readCsv(right);
  const key = keyColumn; const columns = [...new Set([...a.headers, ...b.headers])];
  const report: CsvReport = { matching: key ? `Exact key in column ${key}` : 'Data row position', columnsAdded: b.headers.filter(h => !a.headers.includes(h)), columnsRemoved: a.headers.filter(h => !b.headers.includes(h)), unchanged: 0, changes: [] };
  if (key && (!a.headers.includes(key) || !b.headers.includes(key))) throw new Error('The key column must exist in both CSV headers, with exactly the same name.');
  function index(headers: string[], rows: string[][]) {
    const map = new Map<string, { row: number; data: Record<string, string> }>();
    rows.forEach((row, i) => {
      const id = key ? row[headers.indexOf(key)] : String(i + 1);
      if (key && (!id.trim() || map.has(id))) throw new Error('Key values must be non-empty and unique in each CSV. Key matching is exact.');
      map.set(id, { row: i + 1, data: Object.fromEntries(headers.map((h, n) => [h, row[n]])) });
    }); return map;
  }
  const l = index(a.headers, a.rows), r = index(b.headers, b.rows);
  const normal = (value: string | undefined) => { if (value === undefined) return undefined; const s = trim ? value.trim() : value; return ignoreCase ? s.toLowerCase() : s; };
  for (const id of new Set([...l.keys(), ...r.keys()])) {
    const before = l.get(id), after = r.get(id);
    if (!before) report.changes.push({ type: 'added', key: id, updatedRow: after!.row, after: after!.data });
    else if (!after) report.changes.push({ type: 'removed', key: id, originalRow: before.row, before: before.data });
    else {
      const cells = columns.filter(c => normal(Object.hasOwn(before.data, c) ? before.data[c] : undefined) !== normal(Object.hasOwn(after.data, c) ? after.data[c] : undefined)).map(column => ({ column, before: Object.hasOwn(before.data, column) ? before.data[column] : undefined, after: Object.hasOwn(after.data, column) ? after.data[column] : undefined }));
      if (cells.length) report.changes.push({ type: 'changed', key: id, originalRow: before.row, updatedRow: after.row, cells }); else report.unchanged++;
    }
    if (report.changes.length > 10000) throw new Error('This comparison has more than 10,000 changed rows. Use smaller CSV files.');
  }
  if (new TextEncoder().encode(JSON.stringify(report)).length > 8_000_000) throw new Error('This comparison output is too large. Use fewer rows or columns.');
  return report;
}
export function formatJson(input: string, mode: 'pretty' | 'minify' | 'validate' = 'pretty', indent: '2' | '4' | 'tab' = '2') {
  checkText(input);
  try { JSON.parse(input); } catch (e) { throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : 'check the syntax.'}`); }
  // Work with original lexemes, so large integers, exponent notation and duplicate keys are retained.
  const tokens = input.match(/"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g)!;
  let depth = 0, output = ''; const pad = indent === 'tab' ? '\t' : ' '.repeat(Number(indent));
  const newline = () => mode === 'pretty' ? '\n' + pad.repeat(depth) : '';
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i], next = tokens[i + 1];
    if (token === '{' || token === '[') {
      output += token; depth++; if (depth > 200) throw new Error('Use JSON nested no more than 200 levels.');
      if (next !== '}' && next !== ']') output += newline();
    } else if (token === '}' || token === ']') {
      depth--; if (tokens[i - 1] !== '{' && tokens[i - 1] !== '[') output += newline(); output += token;
    } else if (token === ',') output += token + newline();
    else if (token === ':') output += mode === 'pretty' ? ': ' : ':';
    else output += token;
    if (output.length > 8_000_000) throw new Error('Formatted output is too large. Use smaller or less deeply nested JSON.');
  }
  return mode === 'validate' ? 'Valid JSON. Syntax checked; values, number spelling and duplicate keys are unchanged.' : output;
}
