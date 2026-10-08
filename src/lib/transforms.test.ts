import { describe, expect, it } from 'vitest';
import { compareText, compareJson, csvToJson, jsonToCsv } from './transforms';
describe('Text comparison', () => {
  it('identifies added and removed lines', () => { const changes = compareText('old\n', 'new\n'); expect(changes.find(c => c.removed)?.value).toBe('old\n'); expect(changes.find(c => c.added)?.value).toBe('new\n'); });
  it('can ignore case and leading/trailing whitespace', () => { expect(compareText(' Hello \n', 'hello\n', true, true).every(c => !c.added && !c.removed)).toBe(true); });
  it('accepts an empty original', () => { expect(compareText('', 'new')[0].added).toBe(true); });
});
describe('Structural JSON comparison', () => {
  it('ignores object key order', () => expect(compareJson('{"a":1,"b":2}', '{"b":2,"a":1}')).toEqual([]));
  it('reports nested value differences', () => expect(compareJson('{"user":{"id":1}}', '{"user":{"id":2}}')).toEqual([{ path: '/user/id', type: 'changed', before: 1, after: 2 }]));
  it('distinguishes null from missing', () => expect(compareJson('{}', '{"x":null}')).toEqual([{ path: '/x', type: 'added', after: null }]));
  it('preserves array order', () => expect(compareJson('[1,2]', '[2,1]')).toHaveLength(2));
  it('escapes JSON Pointer keys', () => expect(compareJson('{"a/b~c":1}', '{"a/b~c":2}')[0].path).toBe('/a~1b~0c'));
  it('rejects malformed JSON', () => expect(() => compareJson('{', '{}')).toThrow());
});
describe('CSV conversions', () => {
  it('preserves leading zeroes and large numeric identifiers', () => expect(JSON.parse(csvToJson('id,value\n001,9007199254740993'))).toEqual([{ id: '001', value: '9007199254740993' }]));
  it('handles quoted commas, newlines, and escaped quotes', () => expect(JSON.parse(csvToJson('name,note\n"A, B","line 1\nline ""2"""'))[0]).toEqual({ name: 'A, B', note: 'line 1\nline "2"' }));
  it('rejects duplicate headers instead of silently renaming', () => expect(() => csvToJson('id,id\n1,2')).toThrow('unique'));
  it('rejects rows with missing fields', () => expect(() => csvToJson('a,b\n1')).toThrow());
  it('exports all fields across heterogeneous records', () => expect(jsonToCsv('[{"a":1},{"b":2}]')).toBe('a,b\r\n1,\r\n,2'));
  it('escapes spreadsheet formulas', () => expect(jsonToCsv('[{"name":"=1+1"}]')).toContain("'=1+1"));
  it('serialises nested values', () => expect(JSON.parse(csvToJson(jsonToCsv('[{"nested":{"x":1}}]')))[0].nested).toBe('{"x":1}'));
  it('rejects non-record data', () => expect(() => jsonToCsv('[1,2]')).toThrow());
});
