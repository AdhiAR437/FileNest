import { expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { markdownToDocx } from './markdown-docx';
async function inspect(input: string) { const r=await markdownToDocx(input);const parts=unzipSync(new Uint8Array(await r.blob.arrayBuffer()));return {...r,xml:strFromU8(parts['word/document.xml']),rels:strFromU8(parts['word/_rels/document.xml.rels']),numbering:strFromU8(parts['word/numbering.xml'])}; }
it('exports actual DOCX headings, emphasis, code, lists and tables', async () => {
 const r=await inspect('# Hello\n\n**bold** *italic* ~~gone~~ and `code`\n\n- First\n- Second\n\n3. Three\n4. Four\n\n| Name | Value |\n| --- | --- |\n| Adhi | 001 |\n\n```js\nconst a = 1;\n```');
 expect(r.blob.type).toContain('wordprocessingml');expect(r.xml).toContain('Heading1');expect(r.xml).toContain('<w:b/>');expect(r.xml).toContain('<w:i/>');expect(r.xml).toContain('<w:strike/>');expect(r.xml).toContain('<w:tbl>');expect(r.xml).toContain('001');expect(r.numbering).toContain('w:start w:val="3"');expect(r.warnings).toEqual([]);
});
it('keeps safe hyperlinks while omitting images and executable HTML', async () => {
 const r=await inspect('[Safe](https://example.com) [Bad](javascript:alert)\n\n![Chart](https://example.com/tracker.png)\n\n<script>alert(1)</script>');
 expect(r.rels).toContain('https://example.com');expect(r.rels).not.toContain('javascript:');expect(r.rels).not.toContain('tracker');expect(r.xml).toContain('Image omitted: Chart');expect(r.xml).not.toContain('alert(1)');expect(r.warnings).toHaveLength(3);
});
it('retains Unicode, entities and nested task/list text', async () => {
 const r=await inspect('Mangaluru &amp; Udupi café\n\n- [x] Done\n  - Child\n- [ ] Next');
 expect(r.xml).toContain('café');expect(r.xml).toContain('Mangaluru &amp; Udupi');expect(r.xml).toContain('[x] ');expect(r.xml).toContain('Child');expect(r.xml).toContain('[ ] ');expect(r.xml.split('</w:p>').some(p=>p.includes('[x] ') && p.includes('Done'))).toBe(true);expect(r.warnings).toEqual([]);
});
it('rejects empty, oversized and unsupported-only documents', async () => {
 await expect(markdownToDocx('')).rejects.toThrow();await expect(markdownToDocx('x'.repeat(250001))).rejects.toThrow(/250 KB/);await expect(markdownToDocx('<script>x</script>')).rejects.toThrow(/No supported/);
});

it('replaces invalid numeric entity characters without creating invalid XML', async () => { const r=await inspect('Text &#1; and &#xFFFF;');expect(r.xml).not.toContain(String.fromCharCode(1));expect(r.xml).not.toContain(String.fromCharCode(65535));expect(r.xml).toContain('�');expect(r.warnings).toContain('Unsupported control characters were replaced.'); });

it('preserves code entity spelling and decodes ordinary text only once', async () => { const r=await inspect('Text &amp;lt; and `&amp;`');expect(r.xml).toContain('Text &amp;lt;');expect(r.xml).toContain('&amp;amp;'); });
