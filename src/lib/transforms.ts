import { diffLines, type Change } from 'diff';
import Papa from 'papaparse';

export function compareText(a: string, b: string, ignoreWhitespace = false, ignoreCase = false): Change[] {
  // LineDiff delegates equality to the base implementation, which supports ignoreCase.
  const options = { ignoreWhitespace, ignoreCase, timeout: 1500 };
  const result = diffLines(a, b, options);
  if (!result) throw new Error('This comparison is too complex. Try a smaller input.');
  return result;
}

export type JsonChange = { path: string; type: 'added' | 'removed' | 'changed'; before?: unknown; after?: unknown };
const pointer = (value: string) => value.replaceAll('~', '~0').replaceAll('/', '~1');
export function compareJson(left: string, right: string): JsonChange[] {
  const a: unknown = JSON.parse(left);
  const b: unknown = JSON.parse(right);
  const changes: JsonChange[] = [];
  function walk(before: unknown, after: unknown, path: string) {
    if (Object.is(before, after)) return;
    if (before && after && typeof before === 'object' && typeof after === 'object' && Array.isArray(before) === Array.isArray(after)) {
      const l = before as Record<string, unknown>, r = after as Record<string, unknown>;
      for (const key of [...new Set([...Object.keys(l), ...Object.keys(r)])].sort()) {
        const p = `${path}/${pointer(key)}`;
        if (!Object.hasOwn(l, key)) changes.push({ path: p, type: 'added', after: r[key] });
        else if (!Object.hasOwn(r, key)) changes.push({ path: p, type: 'removed', before: l[key] });
        else walk(l[key], r[key], p);
      }
      return;
    }
    changes.push({ path: path || '/', type: 'changed', before, after });
  }
  walk(a, b, '');
  return changes;
}

export function csvToJson(input: string): string {
  const result = Papa.parse<Record<string, string>>(input, { header: true, skipEmptyLines: 'greedy', dynamicTyping: false });
  // A valid one-column CSV has no delimiter to detect; Papa defaults to comma.
  const errors = result.errors.filter(error => error.code !== 'UndetectableDelimiter');
  if (errors.length) throw new Error(errors[0].message);
  if (!result.meta.fields?.length) throw new Error('Add a CSV header row before converting.');
  if (new Set(result.meta.fields).size !== result.meta.fields.length || result.meta.renamedHeaders) throw new Error('Each column needs a unique header.');
  return JSON.stringify(result.data, null, 2);
}

export function jsonToCsv(input: string): string {
  const data: unknown = JSON.parse(input);
  if (!Array.isArray(data) || !data.length || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('Use a non-empty JSON array of objects, such as [{"name":"Adhi"}].');
  const fields = [...new Set(data.flatMap(row => Object.keys(row)))];
  if (!fields.length) throw new Error('Your records need at least one field.');
  const rows = data.map(row => fields.map(field => {
    const value = row[field];
    return value && typeof value === 'object' ? JSON.stringify(value) : value ?? '';
  }));
  return Papa.unparse({ fields, data: rows }, { escapeFormulae: true });
}
