import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { Change } from 'diff';
import type { JsonChange } from '../lib/transforms';
import type { ToolId } from '../lib/catalog';

const markdownSample = '# A little less busywork\n\nGood tools get out of your way.\n\n## The plan\n\n- Keep files on your device\n- Make changes easy to see\n- Get back to what matters\n\n```js\nconst betterFiles = true;\n```\n\n**Small tools. Better files.**';
const samples: Record<string, [string, string]> = {
  'text-diff': ['# A better way to work\nUpload your files to a server.\nConvert. Compare. Carry on.\n', '# A better way to work\nKeep your files on your device.\nConvert. Compare. Carry on.\n'],
  'json-diff': ['{\n  "name": "FileNest",\n  "version": 1,\n  "local": true\n}', '{\n  "local": true,\n  "name": "FileNest",\n  "version": 2,\n  "tools": 6\n}'],
  'csv-to-json': ['name,city,id\nAdhi,Mangaluru,001\nMaya,Udupi,002', ''],
  'json-to-csv': ['[\n  { "name": "Adhi", "city": "Mangaluru", "id": "001" },\n  { "name": "Maya", "city": "Udupi", "id": "002" }\n]', ''],
};
const MAX = 1_000_000;
function htmlDocument(html: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FileNest document</title><style>body{font:16px/1.7 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#222}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap;background:#f5f5f5;padding:16px;break-inside:avoid}code{font-family:monospace}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}blockquote{border-left:3px solid #ddd;margin-left:0;padding-left:20px}@page{margin:18mm}@media print{body{margin:0;padding:0;max-width:none}h1,h2,h3{break-after:avoid}}</style></head><body>${html}</body></html>`;
}
function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Workbench({ id }: { id: ToolId }) {
  const markdown = id.startsWith('markdown');
  const comparison = id.endsWith('diff');
  const [left, setLeft] = useState(''); const [right, setRight] = useState('');
  const [whitespace, setWhitespace] = useState(false); const [ignoreCase, setIgnoreCase] = useState(false);
  const [html, setHtml] = useState(''); const [raw, setRaw] = useState(false);
  const [word, setWord] = useState<{ blob: Blob; warnings: string[] } | null>(null);
  const [result, setResult] = useState<string | Change[] | JsonChange[] | null>(null);
  const [error, setError] = useState(''); const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  const generation = useRef(0); const worker = useRef<Worker | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileLeft = useRef<HTMLInputElement>(null); const fileRight = useRef<HTMLInputElement>(null);
  function stop() { generation.current++; worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(false); }
  useEffect(() => () => { worker.current?.terminate(); if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!markdown) return;
    const timeout = setTimeout(() => {
      try { setHtml(DOMPurify.sanitize(marked.parse(left, { async: false }), { FORBID_TAGS: ['img', 'video', 'audio', 'iframe', 'object', 'embed', 'style', 'link', 'svg'], FORBID_ATTR: ['style'] })); }
      catch { setError('This Markdown could not be rendered. Try a smaller document.'); }
    }, 150);
    return () => clearTimeout(timeout);
  }, [left, markdown]);
  function edit(value: string, side: 'left' | 'right') {
    stop(); setError(''); setStatus(''); setResult(null); setWord(null);
    if (new TextEncoder().encode(value).length > MAX || (id === 'text-diff' && value.length > 100_000)) { setError('This input is too large. Use up to 1 MB, or 100,000 characters for text comparison.'); return; }
    if (markdown && value !== left) setHtml('');
    if (side === 'left') setLeft(value); else setRight(value);
  }
  async function loadFile(file: File | undefined, side: 'left' | 'right') {
    if (!file) return;
    stop(); const version = generation.current;
    if (file.size > MAX) { setError('Choose a text file smaller than 1 MB.'); return; }
    try { const value = await file.text(); if (generation.current === version) edit(value, side); } catch { if (generation.current === version) setError('Unable to read this file. Try pasting the content instead.'); }
  }
  function example() { stop(); setError(''); setStatus(''); setResult(null); setWord(null); if (markdown && left !== markdownSample) setHtml(''); setLeft(markdown ? markdownSample : samples[id][0]); setRight(markdown ? '' : samples[id][1]); }
  function clear() { stop(); setLeft(''); setRight(''); setHtml(''); setResult(null); setWord(null); setError(''); setStatus(''); }
  function process() {
    stop(); setError(''); setStatus(''); setResult(null); setWord(null);
    if (id === 'text-diff' ? !left.length && !right.length : !left.trim() || (id === 'json-diff' && !right.trim())) { setError(comparison ? 'Add the content you want to compare. JSON needs valid input on both sides.' : 'Add your content before converting.'); return; }
    setBusy(true);
    try {
      const w = new Worker(new URL('../workers/transform.worker.ts', import.meta.url), { type: 'module' }); worker.current = w;
      w.onmessage = event => { if (worker.current !== w) return; stop(); if (event.data.error) setError(event.data.error); else { setResult(event.data.result); setStatus(comparison ? 'Comparison ready.' : 'Conversion ready.'); } };
      w.onerror = () => { if (worker.current === w) { stop(); setError('Processing failed. Try a smaller input.'); } };
      timer.current = setTimeout(() => { stop(); setError('This job took too long. Try a smaller or less complex input.'); }, 6000);
      w.postMessage({ id, left, right, whitespace, ignoreCase });
    } catch { stop(); setError('Your browser could not start this tool. Try a current browser.'); }
  }
  function exportWord() {
    stop(); setWord(null); setError(''); setStatus('');
    if (!left.trim()) { setError('Add Markdown before exporting.'); return; }
    try {
      setBusy(true); const w = new Worker(new URL('../workers/docx.worker.ts', import.meta.url), { type: 'module' }); worker.current = w;
      w.onmessage = event => { if (worker.current !== w) return; stop(); if (event.data.error) setError(event.data.error); else { setWord(event.data); setStatus('Your Word document is ready to download.'); } };
      w.onerror = () => { if (worker.current === w) { stop(); setError('Word export failed. Try a smaller document.'); } };
      timer.current = setTimeout(() => { stop(); setError('Word export took too long. Export a smaller section.'); }, 30000);
      w.postMessage({ input: left });
    } catch { stop(); setError('Your browser could not start Word export. Try an updated browser.'); }
  }
  function downloadWord() { if (!word) return; const url = URL.createObjectURL(word.blob); const a = document.createElement('a'); a.href = url; a.download = 'filenest-document.docx'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setStatus('Copied to clipboard.'); } catch { setError('Clipboard access is unavailable. Select the result to copy it manually.'); } }
  function printPdf() {
    if (!left.trim()) { setError('Add Markdown before exporting.'); return; }
    const frame = document.createElement('iframe'); frame.className = 'print-frame'; frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
    frame.onload = () => { frame.contentWindow?.focus(); frame.contentWindow?.print(); setStatus('Choose Save as PDF in your browser’s print dialog.'); };
    frame.srcdoc = htmlDocument(html); document.body.appendChild(frame); setTimeout(() => frame.remove(), 120000);
  }
  const textResult = typeof result === 'string' ? result : result ? JSON.stringify(result, null, 2) : '';
  const hasMarkdown = left.trim().length > 0 && html.length > 0;
  return <div className="workbench">
    <div className="workbench-toolbar"><span className="local-pill"><i /> Files stay on this device</span><div><button className="subtle-button" onClick={example}>Load example</button><button className="subtle-button" onClick={clear}>Clear all</button></div></div>
    <div className={`editor-grid ${comparison || markdown ? 'two-column' : ''}`}>
      <div className="editor-panel"><div className="panel-heading"><label htmlFor="input-left">{comparison ? 'Original' : markdown ? 'Markdown' : 'Input'}</label><button onClick={() => fileLeft.current?.click()}>Open file ↗</button></div><input ref={fileLeft} type="file" className="visually-hidden" tabIndex={-1} accept={markdown ? '.md,.markdown,.txt' : id.includes('json') ? '.json,.csv,.txt' : '.txt,.md,.json,.csv,.log'} onChange={e => { void loadFile(e.target.files?.[0], 'left'); e.target.value = ''; }} /><textarea id="input-left" value={left} spellCheck={false} onChange={e => edit(e.target.value, 'left')} placeholder={markdown ? '# Start with a heading\n\nPaste your Markdown here…' : id === 'csv-to-json' ? 'name,city\nAdhi,Mangaluru' : id === 'json-to-csv' ? '[{"name":"Adhi","city":"Mangaluru"}]' : 'Paste your original content here…'} /><div className="editor-meta">{left.length.toLocaleString()} characters<span>UTF-8 text</span></div></div>
      {comparison && <div className="editor-panel"><div className="panel-heading"><label htmlFor="input-right">Updated</label><button onClick={() => fileRight.current?.click()}>Open file ↗</button></div><input ref={fileRight} type="file" className="visually-hidden" tabIndex={-1} accept=".txt,.md,.json,.csv,.log" onChange={e => { void loadFile(e.target.files?.[0], 'right'); e.target.value = ''; }} /><textarea id="input-right" value={right} spellCheck={false} onChange={e => edit(e.target.value, 'right')} placeholder="Paste your updated content here…" /><div className="editor-meta">{right.length.toLocaleString()} characters<span>UTF-8 text</span></div></div>}
      {markdown && <div className="editor-panel preview-panel"><div className="panel-heading"><span>Preview</span><button onClick={() => setRaw(!raw)} aria-pressed={raw}>{raw ? 'Rendered view' : 'HTML source'}</button></div>{!hasMarkdown ? <div className="preview-empty"><span>MD →</span><h3>Your document starts here.</h3><p>Add Markdown to see a live preview.<br />Or load an example to explore.</p></div> : raw ? <pre className="source-preview">{html}</pre> : <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />}</div>}
    </div>
    <div className="action-row"><div className="options">{id === 'text-diff' ? <><label><input type="checkbox" checked={whitespace} onChange={e => { setWhitespace(e.target.checked); setResult(null); setWord(null); }} /> Ignore edge whitespace</label><label><input type="checkbox" checked={ignoreCase} onChange={e => { setIgnoreCase(e.target.checked); setResult(null); setWord(null); }} /> Ignore case</label></> : <span>{markdown ? 'Live preview · Remote images disabled' : id === 'json-diff' ? 'Key order ignored · Array order preserved' : 'Processed locally · No uploads'}</span>}</div><div className="action-buttons">{id === 'markdown-to-docx' ? <>{busy ? <button key="cancel-word" className="secondary-button" onClick={() => { stop(); setStatus('Processing cancelled.'); }}>Cancel processing</button> : <button key="create-word" className="primary-button" disabled={!hasMarkdown} onClick={exportWord}>Create Word document ↗</button>}{word && <button className="secondary-button" onClick={downloadWord}>Download Word ↗</button>}</> : markdown ? <><button className="secondary-button" disabled={!hasMarkdown} onClick={() => copy(html)}>Copy HTML</button><button className="primary-button" disabled={!hasMarkdown} onClick={() => id === 'markdown-to-pdf' ? printPdf() : download(htmlDocument(html), 'filenest-document.html', 'text/html')}>{id === 'markdown-to-pdf' ? 'Print / Save PDF' : 'Download HTML'} ↗</button></> : busy ? <button className="secondary-button" onClick={() => { stop(); setStatus('Processing cancelled.'); }}>Cancel processing</button> : <button className="primary-button" onClick={process}>{comparison ? 'Compare changes' : 'Convert file'} ↗</button>}</div></div>
    <div aria-live="polite" className="feedback">{error && <p role="alert" className="error-message">{error}</p>}{!error && (busy || status) && <p className="status-message">{busy ? 'Working on your device…' : status}</p>}</div>
    {word && <section className="result-panel"><div className="panel-heading"><h2>Your Word document</h2><span>{(word.blob.size / 1024).toFixed(1)} KB</span></div>{word.warnings.map(warning => <p className="comparison-summary" key={warning}>{warning}</p>)}</section>}
    {result !== null && <section className="result-panel"><div className="panel-heading"><h2>{comparison ? 'Your changes' : 'Your converted file'}</h2><div><button onClick={() => copy(textResult)}>Copy</button><button onClick={() => download(textResult, id === 'csv-to-json' ? 'converted.json' : id === 'json-to-csv' ? 'converted.csv' : 'comparison.json', id === 'json-to-csv' ? 'text/csv;charset=utf-8' : 'application/json')}>Download ↗</button></div></div>{id === 'text-diff' && Array.isArray(result) ? <div className="diff-result">{(result as Change[]).every(part => !part.added && !part.removed) ? <p className="identical">No differences with these settings.</p> : (result as Change[]).map((part, i) => <pre key={i} className={part.added ? 'added' : part.removed ? 'removed' : ''}><span aria-label={part.added ? 'Added' : part.removed ? 'Removed' : 'Unchanged'}>{part.added ? '+' : part.removed ? '−' : ' '}</span><code>{part.value}</code></pre>)}</div> : id === 'json-diff' && Array.isArray(result) ? result.length === 0 ? <p className="identical">No structural differences. Object key order is ignored.</p> : <div className="json-changes">{(result as JsonChange[]).map((change, i) => <div key={i} className="json-change"><div><span className={`change-label ${change.type}`}>{change.type}</span><code>{change.path}</code></div>{change.type !== 'added' && <pre className="removed">− {JSON.stringify(change.before)}</pre>}{change.type !== 'removed' && <pre className="added">+ {JSON.stringify(change.after)}</pre>}</div>)}</div> : <pre className="data-result">{textResult}</pre>}</section>}
  </div>;
}
