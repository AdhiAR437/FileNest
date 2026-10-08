import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { validateDimensions } from './images';
export async function openBrowserPdf(file: File) {
  const pdfjs = await import('pdfjs-dist'); pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), enableXfa: false, cMapUrl: '/pdf-assets/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdf-assets/standard_fonts/', wasmUrl: '/pdf-assets/wasm/', useSystemFonts: false, disableFontFace: true, maxImageSize: -1, canvasMaxAreaInBytes: 48_000_000, stopAtErrors: true });
}
export async function renderPdfPage(doc: import('pdfjs-dist').PDFDocumentProxy, number: number, scale: number, type = 'image/png', rotation?: number, signal?: AbortSignal) {
  const page = await doc.getPage(number); const viewport = page.getViewport({ scale, rotation: rotation ?? page.rotate }); validateDimensions(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  const task = page.render({ canvas, viewport, background: 'rgb(255,255,255)', annotationMode: 0 });
  const cancel = () => task.cancel(); signal?.addEventListener('abort', cancel, { once: true });
  try { if (signal?.aborted) throw new Error('Cancelled'); await task.promise; if (signal?.aborted) throw new Error('Cancelled'); return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Image export failed.')), type, 0.9)); }
  finally { signal?.removeEventListener('abort', cancel); canvas.width = 0; canvas.height = 0; page.cleanup(); }
}
