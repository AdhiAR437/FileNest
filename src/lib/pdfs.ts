import { PDFDocument, PDFName, degrees } from 'pdf-lib';
export const PDF_FILE_LIMIT = 20 * 1024 * 1024;
export const PDF_TOTAL_LIMIT = 40 * 1024 * 1024;
export const PDF_OUTPUT_LIMIT = 50 * 1024 * 1024;
export const PDF_PAGE_LIMIT = 100;
export type PdfMode = 'images' | 'merge' | 'split' | 'organise' | 'render' | 'text';
export type PageChoice = { index: number; rotation: number };
export function validateFiles(files: { size: number }[], images = false) {
  if (!files.length || files.length > (images ? 20 : 10)) throw new Error(images ? 'Choose 1–20 images.' : 'Choose 1–10 PDF files.');
  if (files.some(f => !f.size || f.size > (images ? 15 * 1024 * 1024 : PDF_FILE_LIMIT)) || files.reduce((n, f) => n + f.size, 0) > PDF_TOTAL_LIMIT) throw new Error('Use PDFs up to 20 MB each, images up to 15 MB each, and 40 MB combined.');
}
export function pageSelection(value: string, count: number, limit = PDF_PAGE_LIMIT) {
  if (!Number.isInteger(count) || count < 1 || count > PDF_PAGE_LIMIT) throw new Error('Use a PDF with 1–100 pages.');
  if (!value.trim()) return Array.from({ length: Math.min(count, limit) }, (_, i) => i);
  const pages: number[] = [];
  for (const item of value.split(',')) {
    const match = item.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!match) throw new Error('Enter pages like 1, 3–5 using a hyphen for ranges.');
    const first = Number(match[1]); const last = Number(match[2] ?? match[1]);
    if (first < 1 || last > count || first > last) throw new Error(`Choose page numbers between 1 and ${count}, with ascending ranges.`);
    for (let p = first; p <= last; p++) { if (pages.includes(p - 1)) throw new Error('Choose each page only once.'); pages.push(p - 1); if (pages.length > limit) throw new Error(`Choose up to ${limit} pages per job.`); }
  }
  return pages;
}
export async function loadPdf(data: Uint8Array) {
  if (data.byteLength > PDF_FILE_LIMIT || !new TextDecoder('latin1').decode(data.slice(0, 1024)).includes('%PDF-')) throw new Error('Choose a valid PDF up to 20 MB.');
  let doc: PDFDocument;
  try { doc = await PDFDocument.load(data, { updateMetadata: false, throwOnInvalidObject: true }); }
  catch (e) { if (String(e).toLowerCase().includes('encrypt')) throw new Error('Encrypted or password-protected PDFs are not supported.'); throw new Error('This PDF could not be read. It may be damaged or unsupported.'); }
  if (doc.isEncrypted) throw new Error('Encrypted or password-protected PDFs are not supported.');
  if (doc.catalog.get(PDFName.of('AcroForm')) || doc.catalog.get(PDFName.of('Perms'))) throw new Error('PDFs with interactive forms or signatures are not supported. Choose an unsigned, non-interactive copy.');
  if (doc.getPageCount() < 1 || doc.getPageCount() > PDF_PAGE_LIMIT) throw new Error('Use a PDF with 1–100 pages.');
  return doc;
}
export async function copySelected(doc: PDFDocument, choices: PageChoice[]) {
  if (!choices.length || choices.length > PDF_PAGE_LIMIT || new Set(choices.map(c => c.index)).size !== choices.length) throw new Error('Keep 1–100 unique pages.');
  const result = await PDFDocument.create();
  for (const choice of choices) {
    if (!Number.isInteger(choice.index) || choice.index < 0 || choice.index >= doc.getPageCount() || ![0, 90, 180, 270].includes(choice.rotation)) throw new Error('Invalid page or rotation.');
    const [page] = await result.copyPages(doc, [choice.index]); page.setRotation(degrees((page.getRotation().angle + choice.rotation) % 360)); result.addPage(page);
  }
  return result;
}
export async function mergePdfs(docs: PDFDocument[]) {
  if (docs.length < 2) throw new Error('Choose at least two PDFs to merge.');
  if (docs.reduce((n, doc) => n + doc.getPageCount(), 0) > PDF_PAGE_LIMIT) throw new Error('Merge up to 100 pages in total.');
  const output = await PDFDocument.create();
  for (const doc of docs) { const pages = await output.copyPages(doc, doc.getPageIndices()); pages.forEach(page => output.addPage(page)); }
  return output;
}
export function checkedOutput(data: Uint8Array) { if (data.byteLength > PDF_OUTPUT_LIMIT) throw new Error('This output is too large. Use fewer pages or smaller images.'); return new Uint8Array(data); }
