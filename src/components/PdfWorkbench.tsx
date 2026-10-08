import { useEffect, useRef, useState } from 'react';
import { zipSync } from 'fflate';
import { pageSelection, validateFiles, checkedOutput, PDF_OUTPUT_LIMIT } from '../lib/pdfs';
import { openBrowserPdf, renderPdfPage } from '../lib/pdf-browser';
import { formatBytes } from '../lib/images';
import type { PdfMode, PageChoice } from '../lib/pdfs';
type Info = { count?: number; width?: number; height?: number; pages?: { width: number; height: number; rotation: number }[] };
type Source = { files: File[]; info: Info[] };
export default function PdfWorkbench({ mode }: { mode: PdfMode }) {
  const [source, setSource] = useState<Source | null>(null); const [choices, setChoices] = useState<PageChoice[]>([]);
  const [range, setRange] = useState(''); const [separate, setSeparate] = useState(false); const [paper, setPaper] = useState<'a4' | 'image'>('a4');
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png'); const [dpi, setDpi] = useState(144);
  const [result, setResult] = useState<{ blob: Blob; name: string; text?: string } | null>(null);
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false); const [status, setStatus] = useState(''); const [error, setError] = useState('');
  const picker = useRef<HTMLInputElement>(null); const worker = useRef<Worker | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null); const loading = useRef<import('pdfjs-dist').PDFDocumentLoadingTask | null>(null);
  useEffect(() => () => { worker.current?.terminate(); abort.current?.abort(); void loading.current?.destroy().catch(() => {}); if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);
  function stop() { worker.current?.terminate(); worker.current = null; abort.current?.abort(); abort.current = null; void loading.current?.destroy().catch(() => {}); loading.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(false); }
  function invalidate() { stop(); setResult(null); setError(''); setStatus(''); }
  function clear() { invalidate(); setSource(null); setPreview(null); setChoices([]); setRange(''); }
  function startTimer() { timer.current = setTimeout(() => { stop(); setError('This job took too long. Try fewer pages, smaller files, or lower image resolution.'); }, 60000); }
  function runWorker(action: 'inspect' | 'process', files: File[], selected: PageChoice[] = []) {
    stop(); setBusy(true); setStatus(action === 'inspect' ? 'Reading files on this device…' : 'Processing on this device…');
    try {
      const w = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' }); worker.current = w; startTimer();
      w.onmessage = event => {
        if (worker.current !== w) return;
        if (event.data.progress) { setStatus(event.data.progress); return; }
        stop(); if (event.data.error) { setError(event.data.error); return; }
        if (action === 'inspect') { setSource({ files, info: event.data.info }); const count = event.data.info[0].count ?? files.length; setChoices(Array.from({ length: count }, (_, index) => ({ index, rotation: 0 }))); setRange(mode === 'render' ? `1-${Math.min(count, 20)}` : ''); setStatus('Files ready. Choose your settings.'); }
        else { setResult(event.data); setStatus('Your file is ready to download.'); }
      };
      w.onerror = () => { if (worker.current !== w) return; stop(); setError('Unable to process these files. Try smaller files or an updated browser.'); };
      w.postMessage({ action, mode, files, choices: selected, separate, paper });
    } catch { stop(); setError('Your browser could not start this PDF tool. Try an updated browser.'); }
  }
  function choose(files: File[]) {
    invalidate(); setSource(null); setPreview(null);
    try { validateFiles(files, mode === 'images'); if (!['images', 'merge'].includes(mode) && files.length !== 1) throw new Error('Choose one PDF for this tool.'); runWorker('inspect', files); }
    catch (e) { setError(e instanceof Error ? e.message : 'Check your files.'); }
  }
  function moveFile(index: number, step: number) {
    if (!source || index + step < 0 || index + step >= source.files.length) return; invalidate();
    const files = [...source.files]; const info = [...source.info]; [files[index], files[index + step]] = [files[index + step], files[index]]; [info[index], info[index + step]] = [info[index + step], info[index]]; setSource({ files, info });
  }
  function movePage(index: number, step: number) { invalidate(); const next = [...choices]; [next[index], next[index + step]] = [next[index + step], next[index]]; setChoices(next); }
  async function browserJob(previewPage?: PageChoice) {
    if (!source) return; invalidate(); setBusy(true); const controller = new AbortController(); abort.current = controller; startTimer();
    let task: import('pdfjs-dist').PDFDocumentLoadingTask | null = null;
    try {
      setStatus(previewPage ? 'Rendering page preview…' : 'Opening PDF on this device…');
      task = await openBrowserPdf(source.files[0]); if (controller.signal.aborted) { void task.destroy().catch(() => {}); return; } loading.current = task;
      const doc = await task.promise; if (doc.numPages !== source.info[0].count) throw new Error('The PDF readers disagree about this file. Choose a different PDF.');
      if (previewPage) {
        const page = await doc.getPage(previewPage.index + 1); const viewport = page.getViewport({ scale: 1 }); const scale = Math.min(1, 700 / Math.max(viewport.width, viewport.height));
        const blob = await renderPdfPage(doc, previewPage.index + 1, scale, 'image/png', (page.rotate + previewPage.rotation) % 360, controller.signal);
        if (!controller.signal.aborted) { setPreview({ url: URL.createObjectURL(blob), label: `Page ${previewPage.index + 1}${previewPage.rotation ? ` · +${previewPage.rotation}°` : ''}` }); setStatus('Page preview ready.'); }
      } else {
        const selected = pageSelection(range, doc.numPages, mode === 'render' ? 20 : 100); let total = 0; const archive: Record<string, Uint8Array> = {}; let text = ''; let firstPreview: Blob | null = null;
        for (const index of selected) {
          if (controller.signal.aborted) return; setStatus(`Processing page ${index + 1} (${selected.indexOf(index) + 1} of ${selected.length})…`);
          if (mode === 'render') {
            const blob = await renderPdfPage(doc, index + 1, dpi / 72, format, undefined, controller.signal); total += blob.size;
            if (total > PDF_OUTPUT_LIMIT) throw new Error('This output is too large. Select fewer pages or lower resolution.');
            archive[`page-${index + 1}.${format === 'image/png' ? 'png' : 'jpg'}`] = new Uint8Array(await blob.arrayBuffer());
            if (!firstPreview) firstPreview = await renderPdfPage(doc, index + 1, 0.5, 'image/png', undefined, controller.signal);
          } else {
            const page = await doc.getPage(index + 1); const content = await page.getTextContent(); let line = ''; let previousY: number | undefined;
            for (const item of content.items) { if (!('str' in item)) continue; const y = item.transform[5]; if (previousY !== undefined && Math.abs(y - previousY) > 2 && line && !line.endsWith('\n')) line += '\n'; line += item.str + (item.hasEOL ? '\n' : ' '); previousY = y; }
            text += `--- Page ${index + 1} ---\n${line.trim()}\n\n`; if (new TextEncoder().encode(text).length > 5 * 1024 * 1024) throw new Error('Extracted text is too large. Select fewer pages.'); page.cleanup();
          }
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        if (!controller.signal.aborted) {
          if (mode === 'render') { setResult({ blob: new Blob([checkedOutput(zipSync(archive, { level: 0 }))], { type: 'application/zip' }), name: 'pdf-images-filenest.zip' }); if (firstPreview) setPreview({ url: URL.createObjectURL(firstPreview), label: 'First exported page' }); }
          else { const hasText = text.replace(/--- Page \d+ ---/g, '').trim().length > 0; setResult({ blob: new Blob([text], { type: 'text/plain;charset=utf-8' }), name: 'pdf-text-filenest.txt', text }); if (!hasText) setStatus('No selectable text found. This PDF may be scanned; OCR is not included.'); }
          if (mode === 'render' || text.replace(/--- Page \d+ ---/g, '').trim()) setStatus('Your file is ready to download.');
        }
      }
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to render or extract this PDF.'); }
    finally { if (task) void task.destroy().catch(() => {}); if (abort.current === controller) { loading.current = null; abort.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(false); } }
  }
  function process() {
    if (!source) return;
    if (mode === 'render' || mode === 'text') { void browserJob(); return; }
    invalidate(); try { const selected = mode === 'split' ? pageSelection(range, source.info[0].count!).map(index => ({ index, rotation: 0 })) : choices; runWorker('process', source.files, selected); }
    catch (e) { setError(e instanceof Error ? e.message : 'Check your page selection.'); }
  }
  function download() { if (!result) return; const url = URL.createObjectURL(result.blob); const a = document.createElement('a'); a.href = url; a.download = result.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
  return <div className="workbench pdf-workbench"><div className="workbench-toolbar"><span className="local-pill"><i /> Files stay on this device</span><button className="subtle-button" onClick={clear}>Clear files</button></div>
    <div className="image-upload"><input ref={picker} id="pdf-files" type="file" multiple={mode === 'images' || mode === 'merge'} accept={mode === 'images' ? 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp' : 'application/pdf,.pdf'} className="visually-hidden" tabIndex={-1} onChange={e => { choose(Array.from(e.target.files ?? [])); e.target.value = ''; }} /><button className="secondary-button" onClick={() => picker.current?.click()}>{mode === 'images' ? 'Choose images' : mode === 'merge' ? 'Choose PDFs' : 'Choose PDF'} ↗</button><span>{mode === 'images' ? 'Up to 20 still JPG/PNG/WebP images' : 'PDFs up to 20 MB each · up to 100 pages total'} · 40 MB combined</span></div>
    {source && <div className="pdf-content"><ol className="pdf-file-list">{source.files.map((file, i) => <li key={`${file.name}-${i}`}><div><strong>{file.name}</strong><span>{formatBytes(file.size)} · {source.info[i].count ? `${source.info[i].count} pages` : `${source.info[i].width} × ${source.info[i].height}`}</span></div>{['merge', 'images'].includes(mode) && <div className="pdf-row-actions"><button disabled={busy || i === 0} aria-label={`Move file ${i + 1} up`} onClick={() => moveFile(i, -1)}>↑</button><button disabled={busy || i === source.files.length - 1} aria-label={`Move file ${i + 1} down`} onClick={() => moveFile(i, 1)}>↓</button></div>}</li>)}</ol>
      {mode === 'images' && <label className="pdf-field">Page size<select aria-label="Page size" value={paper} disabled={busy} onChange={e => { invalidate(); setPaper(e.target.value as 'a4' | 'image'); }}><option value="a4">A4 with margins, auto orientation</option><option value="image">Fit image, no margins (96 DPI)</option></select></label>}
      {['split', 'render', 'text'].includes(mode) && <label className="pdf-field">Pages to include<input type="text" value={range} disabled={busy} placeholder={mode === 'render' ? 'First 20 pages by default' : 'All pages, or e.g. 1,3-5'} onChange={e => { invalidate(); setRange(e.target.value); }} /></label>}
      {mode === 'split' && <label className="pdf-check"><input type="checkbox" checked={separate} disabled={busy} onChange={e => { invalidate(); setSeparate(e.target.checked); }} /> Save each selected page as a separate PDF in a ZIP</label>}
      {mode === 'render' && <div className="image-settings-grid"><label>Image format<select aria-label="Image format" value={format} disabled={busy} onChange={e => { invalidate(); setFormat(e.target.value as 'image/png' | 'image/jpeg'); }}><option value="image/png">PNG</option><option value="image/jpeg">JPG (90% quality)</option></select></label><label>Resolution<select aria-label="Resolution" value={dpi} disabled={busy} onChange={e => { invalidate(); setDpi(Number(e.target.value)); }}><option value="72">72 DPI</option><option value="144">144 DPI</option><option value="216">216 DPI</option></select></label></div>}
      {mode === 'organise' && <><div className="pdf-page-heading"><h2>Pages in output order</h2><button className="subtle-button" disabled={busy} onClick={() => { invalidate(); setChoices(Array.from({ length: source.info[0].count! }, (_, index) => ({ index, rotation: 0 }))); setPreview(null); }}>Reset pages</button></div><ol className="pdf-page-list">{choices.map((choice, position) => <li key={choice.index}><span>Page {choice.index + 1} <small>+{choice.rotation}°</small></span><div className="pdf-row-actions"><button disabled={busy || position === 0} aria-label={`Move page ${choice.index + 1} up`} onClick={() => movePage(position, -1)}>↑</button><button disabled={busy || position === choices.length - 1} aria-label={`Move page ${choice.index + 1} down`} onClick={() => movePage(position, 1)}>↓</button><button disabled={busy} aria-label={`Rotate page ${choice.index + 1}`} onClick={() => { invalidate(); setChoices(choices.map(c => c.index === choice.index ? { ...c, rotation: (c.rotation + 90) % 360 } : c)); setPreview(null); }}>Rotate</button><button disabled={busy} aria-label={`Preview page ${choice.index + 1}`} onClick={() => { void browserJob(choice); }}>Preview</button><button disabled={busy} aria-label={`Remove page ${choice.index + 1}`} onClick={() => { invalidate(); setChoices(choices.filter(c => c.index !== choice.index)); setPreview(null); }}>Remove</button></div></li>)}</ol>{!choices.length && <p className="image-note">No pages remain. Reset pages before exporting.</p>}</>}
      {!['images', 'merge', 'organise'].includes(mode) && <button className="secondary-button" disabled={busy} onClick={() => { void browserJob({ index: 0, rotation: 0 }); }}>Preview first page</button>}
      <p className="image-note">{mode === 'render' ? 'Export up to 20 pages per job as a ZIP. Maximum 12 megapixels per page and 50 MB of output. Annotations and interactive form fields are excluded from rendering.' : mode === 'text' ? 'Selectable text only, no OCR. Columns, tables and reading order may need cleanup. Download includes up to 5 MB of text; on-screen preview is limited.' : mode === 'images' ? 'Image orientation is respected. Images are embedded as PNG to preserve visible pixels and transparency; the PDF may be larger than the originals.' : 'Page content and existing rotation are copied. Bookmarks, document metadata and other document-level features are not preserved. This tool is not a PDF sanitiser.'}</p></div>}
    {preview && <figure className="pdf-preview"><figcaption>{preview.label}</figcaption><img src={preview.url} alt={preview.label} /></figure>}
    <div className="action-row"><span className="image-note">Local processing · no signup</span><div className="action-buttons">{busy ? <button className="secondary-button" onClick={() => { stop(); setStatus('Processing cancelled.'); }}>Cancel processing</button> : <button className="primary-button" disabled={!source || (mode === 'organise' && !choices.length)} onClick={process}>{mode === 'images' ? 'Create PDF' : mode === 'merge' ? 'Merge PDFs' : mode === 'split' ? 'Split PDF' : mode === 'organise' ? 'Save organised PDF' : mode === 'render' ? 'Export page images' : 'Extract text'} ↗</button>}{result && <button className="secondary-button" onClick={download}>Download result ↗</button>}</div></div>
    <div className="feedback" aria-live="polite">{error && <p className="error-message" role="alert">{error}</p>}{!error && status && <p className="status-message">{status}</p>}</div>
    {result && <section className="result-panel"><div className="panel-heading"><h2>Your result</h2><span>{result.name} · {formatBytes(result.blob.size)}</span></div>{result.text !== undefined && <pre className="data-result">{result.text.slice(0, 100000)}{result.text.length > 100000 ? '\n[Preview shortened. Download for the full text.]' : ''}</pre>}</section>}
  </div>;
}
