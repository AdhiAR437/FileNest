import { describe, expect, it } from 'vitest';
import { compareCsv, formatJson } from './data-tools';
describe('CSV comparison', () => {
  it('matches exact keys, ignores row and column order, and preserves leading zeroes', () => {
    const r = compareCsv('id,name\n001,Adhi\n002,Maya', 'name,id\nMaya,002\nAdhi,001', 'id');
    expect(r.changes).toEqual([]); expect(r.unchanged).toBe(2);
  });
  it('finds added, removed and changed rows by key', () => {
    const r = compareCsv('id,v\n1,a\n2,b\n3,c', 'id,v\n2,B\n1,a\n4,d', 'id');
    expect(r.changes.map(c => c.type)).toEqual(['changed','removed','added']); expect(r.changes[0].cells).toEqual([{column:'v',before:'b',after:'B'}]); expect(r.changes[0].updatedRow).toBe(1);
  });
  it('matches by position without a key', () => { expect(compareCsv('id\n1\n2','id\n2\n1').changes).toHaveLength(2); });
  it('rejects duplicate or empty keys and absent key columns', () => {
    expect(() => compareCsv('id,v\n1,a\n1,b','id,v\n1,a','id')).toThrow(/unique/);
    expect(() => compareCsv('id,v\n,a','id,v\n1,a','id')).toThrow(/non-empty/);
    expect(() => compareCsv('id\n1','id\n1','name')).toThrow(/exist/);
  });
  it('rejects duplicate/blank headers, malformed rows and quotes', () => {
    for(const input of ['id,id\n1,2', ',v\n1,2','id,v\n1','id,v\n1,"x']) expect(() => compareCsv(input,'id,v\n1,a')).toThrow();
  });
  it('retains missing-versus-empty cells and prototype-like column names', () => {
    const r = compareCsv('id,toString\n1,a','id,__proto__\n1,', 'id');
    expect(r.columnsAdded).toEqual(['__proto__']); expect(r.columnsRemoved).toEqual(['toString']); expect(r.changes[0].cells).toHaveLength(2);
    expect(compareCsv('__proto__,constructor\na,b','__proto__,constructor\na,b').unchanged).toBe(1);
  });
  it('applies value rules without normalising exact keys or originals', () => {
    const r = compareCsv('id,v\n001, AbC ','id,v\n001,abc','id',true,true); expect(r.unchanged).toBe(1);
    expect(compareCsv('id,v\nA,x','id,v\na,X','id',true,true).changes).toHaveLength(2);
  });
  it('supports quoted delimiters, multiline values, TSV and header-only files', () => {
    const v='id,note\n001,"a,b\nline"'; expect(compareCsv(v,v,'id').unchanged).toBe(1);
    expect(compareCsv('id\tv\n001\ta','id\tv\n001\tb','id').changes).toHaveLength(1);
    expect(compareCsv('id,v','id,v','id').changes).toEqual([]);
  });
  it('caps input and row counts', () => {
    expect(() => compareCsv('x'.repeat(1_000_001), 'id')).toThrow(/1 MB/);
    expect(() => compareCsv('id\n'+Array.from({length:10001},(_,i)=>i).join('\n'),'id')).toThrow(/10,000/);
  });
});
describe('JSON formatting', () => {
  it('keeps large integers, exponent spelling, duplicate keys and string escapes', () => {
    const input='{"id":9007199254740993,"n":1e400,"id":-0,"s":"a\\n\\u1234"}';
    expect(formatJson(input,'minify')).toBe(input); expect(formatJson(input)).toContain('9007199254740993'); expect(formatJson(input)).toContain('1e400');
  });
  it('handles empty objects/arrays, root primitives, escapes and whitespace inside strings', () => {
    expect(formatJson(' [ {}, [], "a , b : c", "\\\"" ] ','minify')).toBe('[{},[],"a , b : c","\\\""]');
    expect(formatJson(' true ')).toBe('true'); expect(formatJson('" spaced "')).toBe('" spaced "');
  });
  it('formats nested JSON with spaces or tabs and roundtrips lexical content', () => {
    expect(formatJson('{"a":[1,2]}')).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
    expect(formatJson('{"a":1}','pretty','tab')).toContain('\n\t"a"');
  });
  it('validates syntax and rejects comments, trailing commas, empty and malformed input', () => {
    expect(formatJson('{"a":1}','validate')).toMatch(/^Valid JSON/);
    for(const v of ['', '{"a":1,}', '// hello\n{}', '{', 'NaN', '"\n"']) expect(() => formatJson(v)).toThrow(/Invalid JSON/);
  });
  it('rejects excessive nesting and input bytes', () => {
    expect(() => formatJson('['.repeat(201)+'0'+']'.repeat(201))).toThrow(/200/);
    expect(() => formatJson('"'+'a'.repeat(1_000_000)+'"')).toThrow(/1 MB/);
  });
});
