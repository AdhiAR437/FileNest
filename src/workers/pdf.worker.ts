import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';
import { loadPdf, copySelected, mergePdfs, validateFiles, checkedOutput, PDF_OUTPUT_LIMIT } from '../lib/pdfs';
import { inspectImageHeader, validateDimensions } from '../lib/images';
import type { PageChoice } from '../lib/pdfs';
self.onmessage = async (event: MessageEvent<{ action: 'inspect' | 'process'; mode: string; files: File[]; choices?: PageChoice[]; separate?: boolean; paper?: 'a4' | 'image' }>) => {
  try {
    const { action, mode, files, choices = [], separate, paper } = event.data; validateFiles(files, mode === 'images');
    if (mode === 'images') {
      const output = await PDFDocument.create(); const info: { width: number; height: number }[] = []; let totalPixels = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i]; const header = inspectImageHeader(await file.arrayBuffer()); totalPixels += header.width * header.height;
        if (totalPixels > 40_000_000) throw new Error('Use images with up to 40 megapixels combined.');
        const bitmap = await createImageBitmap(new Blob([file], { type: header.format }), { imageOrientation: 'from-image' });
        try {
          validateDimensions(bitmap.width, bitmap.height); info.push({ width: bitmap.width, height: bitmap.height });
          if (action === 'process') {
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height); const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image processing is unavailable in this browser.');
            ctx.drawImage(bitmap, 0, 0); const png = await canvas.convertToBlob({ type: 'image/png' }); const image = await output.embedPng(await png.arrayBuffer());
            const landscape = bitmap.width > bitmap.height; const size: [number, number] = paper === 'image' ? [bitmap.width * 0.75, bitmap.height * 0.75] : landscape ? [841.89, 595.28] : [595.28, 841.89];
            const margin = paper === 'image' ? 0 : 24; const scale = Math.min((size[0] - 2 * margin) / bitmap.width, (size[1] - 2 * margin) / bitmap.height); const width = bitmap.width * scale; const height = bitmap.height * scale;
            const page = output.addPage(size); page.drawImage(image, { x: (size[0] - width) / 2, y: (size[1] - height) / 2, width, height });
          }
        } finally { bitmap.close(); }
        self.postMessage({ progress: `Read image ${i + 1} of ${files.length}.` });
      }
      if (action === 'inspect') self.postMessage({ info });
      else self.postMessage({ blob: new Blob([checkedOutput(await output.save())], { type: 'application/pdf' }), name: 'images-filenest.pdf' });
      return;
    }
    const docs = [];
    for (const file of files) docs.push(await loadPdf(new Uint8Array(await file.arrayBuffer())));
    if (docs.reduce((n, d) => n + d.getPageCount(), 0) > 100) throw new Error('Use up to 100 pages combined.');
    if (action === 'inspect') { self.postMessage({ info: docs.map(doc => ({ count: doc.getPageCount(), pages: doc.getPages().map(p => ({ ...p.getSize(), rotation: p.getRotation().angle })) })) }); return; }
    if (mode === 'merge') { const output = await mergePdfs(docs); self.postMessage({ blob: new Blob([checkedOutput(await output.save())], { type: 'application/pdf' }), name: 'merged-filenest.pdf' }); }
    else if (mode === 'split' && separate) {
      const archive: Record<string, Uint8Array> = {}; let total = 0;
      for (const choice of choices) { const part = await copySelected(docs[0], [choice]); const bytes = checkedOutput(await part.save()); total += bytes.length; if (total > PDF_OUTPUT_LIMIT) throw new Error('This output is too large. Select fewer pages.'); archive[`page-${choice.index + 1}.pdf`] = bytes; }
      if (!choices.length) throw new Error('Select at least one page.');
      self.postMessage({ blob: new Blob([checkedOutput(zipSync(archive, { level: 0 }))], { type: 'application/zip' }), name: 'split-filenest.zip' });
    } else { const output = await copySelected(docs[0], choices); self.postMessage({ blob: new Blob([checkedOutput(await output.save())], { type: 'application/pdf' }), name: `${mode}-filenest.pdf` }); }
  } catch (e) { self.postMessage({ error: e instanceof Error ? e.message : 'Unable to process this PDF.' }); }
};
