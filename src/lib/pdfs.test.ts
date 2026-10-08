import { describe, expect, it } from 'vitest';
import { PDFDocument, degrees } from 'pdf-lib';
import { pageSelection, loadPdf, copySelected, mergePdfs, validateFiles, checkedOutput, PDF_OUTPUT_LIMIT } from './pdfs';
async function fixture(count = 3) { const doc = await PDFDocument.create(); for (let i = 0; i < count; i++) doc.addPage([200 + i * 10, 300]); doc.getPage(1)?.setRotation(degrees(90)); return doc; }
describe('PDF page selection and limits', () => {
  it('preserves the requested order and expands ranges', () => expect(pageSelection('3, 1-2', 3)).toEqual([2, 0, 1]));
  it('rejects duplicate, invalid, descending, and out-of-range pages', () => { for (const range of ['1,1', '0', '4', '3-1', '1.5', 'bad', '1,']) expect(() => pageSelection(range, 3)).toThrow(); });
  it('caps default image export and rejects explicit over-limit selections', () => { expect(pageSelection('', 30, 20)).toHaveLength(20); expect(() => pageSelection('1-21', 30, 20)).toThrow('20'); });
  it('rejects excessive combined input and output sizes', () => { expect(() => validateFiles([{size:25*1024*1024}])).toThrow(); expect(() => validateFiles(Array.from({length:3},()=>({size:15*1024*1024})))).toThrow(); expect(() => checkedOutput(new Uint8Array(PDF_OUTPUT_LIMIT+1))).toThrow('large'); });
});
describe('PDF page operations', () => {
  it('copies pages in order and adds rotation to existing rotation', async () => { const result = await copySelected(await fixture(), [{index:2,rotation:0},{index:1,rotation:90}]); const read = await loadPdf(await result.save()); expect(read.getPageCount()).toBe(2); expect(read.getPage(0).getWidth()).toBe(220); expect(read.getPage(1).getRotation().angle).toBe(180); });
  it('rejects empty selections, duplicate pages, and invalid rotations', async () => { const doc=await fixture(); await expect(copySelected(doc,[])).rejects.toThrow(); await expect(copySelected(doc,[{index:0,rotation:0},{index:0,rotation:0}])).rejects.toThrow(); await expect(copySelected(doc,[{index:0,rotation:45}])).rejects.toThrow(); });
  it('merges in document order and preserves page dimensions', async () => { const merged=await mergePdfs([await fixture(3),await fixture(2)]); expect(merged.getPageCount()).toBe(5); expect(merged.getPage(3).getWidth()).toBe(200); });
  it('rejects malformed PDFs', async () => { await expect(loadPdf(new TextEncoder().encode('not a PDF'))).rejects.toThrow('valid PDF'); });
  it('rejects interactive form PDFs instead of losing field data', async () => { const doc=await fixture(); const field=doc.getForm().createTextField('name'); field.setText('Test'); field.addToPage(doc.getPage(0)); await expect(loadPdf(await doc.save())).rejects.toThrow('interactive forms'); });
  it('rejects over-limit page counts and single-document merging', async () => { await expect(loadPdf(await (await fixture(101)).save())).rejects.toThrow('100'); await expect(mergePdfs([await fixture()])).rejects.toThrow('two'); });
});
