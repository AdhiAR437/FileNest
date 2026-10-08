import { useEffect, useRef, useState } from 'react';
import { formatBytes, imageFilename, MAX_IMAGE_BYTES, validateSettings } from '../lib/images';
import type { Crop, ImageFormat, ImageInfo, ImageSettings } from '../lib/images';

export default function ImageWorkbench({ mode }: { mode: 'convert' | 'compress' | 'resize' }) {
  const [source, setSource] = useState<{ file: File; info: ImageInfo; url: string } | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number; quality: number; targetReached: boolean | null } | null>(null);
  const [format, setFormat] = useState<ImageFormat>(mode === 'compress' ? 'image/webp' : 'image/png');
  const [quality, setQuality] = useState(85); const [background, setBackground] = useState('#ffffff');
  const [width, setWidth] = useState(1); const [height, setHeight] = useState(1); const [locked, setLocked] = useState(true);
  const [cropping, setCropping] = useState(false); const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 1, height: 1 });
  const [targetEnabled, setTargetEnabled] = useState(false); const [targetKB, setTargetKB] = useState(200);
  const [busy, setBusy] = useState<'loading' | 'processing' | null>(null); const [error, setError] = useState(''); const [status, setStatus] = useState('');
  const picker = useRef<HTMLInputElement>(null); const worker = useRef<Worker | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { worker.current?.terminate(); if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url); }, [source]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  function stop() { worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(null); }
  function invalidate() { stop(); setResult(null); setError(''); setStatus(''); }
  function clear() { invalidate(); setSource(null); if (picker.current) picker.current.value = ''; }
  function run(action: 'inspect' | 'process', file: File, settings?: ImageSettings) {
    stop(); setBusy(action === 'inspect' ? 'loading' : 'processing');
    try {
      const w = new Worker(new URL('../workers/image.worker.ts', import.meta.url), { type: 'module' }); worker.current = w;
      w.onmessage = event => {
        if (worker.current !== w) return; stop();
        if (event.data.error) { setError(event.data.error); return; }
        if (action === 'inspect') {
          const info: ImageInfo = event.data.info;
          setSource({ file, info, url: URL.createObjectURL(event.data.preview) }); setWidth(info.width); setHeight(info.height);
          setCrop({ x: 0, y: 0, width: info.width, height: info.height }); setCropping(false);
          if (mode === 'resize') setFormat(info.format);
          setStatus('Image ready. Choose your settings.');
        } else { setResult({ ...event.data, url: URL.createObjectURL(event.data.preview) }); setStatus('Your image is ready to download.'); }
      };
      w.onerror = () => { if (worker.current !== w) return; stop(); setError('Image processing failed. Try a smaller image or an updated browser.'); };
      timer.current = setTimeout(() => { if (worker.current !== w) return; stop(); setError('This image took too long. Choose a smaller image or lower output dimensions.'); }, 30000);
      w.postMessage({ action, file, settings });
    } catch { stop(); setError('Your browser could not start this image tool. Try an updated browser.'); }
  }
  function load(file: File | undefined) {
    if (!file) return; invalidate(); setSource(null);
    if (!file.size || file.size > MAX_IMAGE_BYTES) { setError('Choose an image up to 15 MB.'); return; }
    run('inspect', file);
  }
  function dimensions(side: 'width' | 'height', value: number) {
    invalidate(); const aspect = cropping ? crop.width / crop.height : source ? source.info.width / source.info.height : 1;
    if (side === 'width') { setWidth(value); if (locked) setHeight(Math.max(1, Math.round(value / aspect))); }
    else { setHeight(value); if (locked) setWidth(Math.max(1, Math.round(value * aspect))); }
  }
  function updateCrop(key: keyof Crop, value: number) {
    invalidate(); const next = { ...crop, [key]: value }; setCrop(next);
    if (locked && (key === 'width' || key === 'height') && next.width > 0 && next.height > 0) setHeight(Math.max(1, Math.round(width * next.height / next.width)));
  }
  function process() {
    if (!source) return; invalidate();
    const settings: ImageSettings = { format, quality: quality / 100, background, width: mode === 'resize' ? width : source.info.width, height: mode === 'resize' ? height : source.info.height, crop: mode === 'resize' && cropping ? crop : undefined, targetBytes: mode === 'compress' && targetEnabled ? targetKB * 1024 : undefined };
    try { validateSettings(settings, source.info.width, source.info.height); run('process', source.file, settings); }
    catch (e) { setError(e instanceof Error ? e.message : 'Check your image settings.'); }
  }
  function download() {
    if (!source || !result) return; const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = imageFilename(source.file.name, result.blob.type as ImageFormat); a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  const action = mode === 'compress' ? 'Compress image' : mode === 'resize' ? 'Resize image' : 'Convert image';
  const change = source && result ? (1 - result.blob.size / source.file.size) * 100 : 0;
  return <div className="workbench image-workbench">
    <div className="workbench-toolbar"><span className="local-pill"><i /> Files stay on this device</span><button className="subtle-button" onClick={clear}>Clear image</button></div>
    <div className="image-upload"><input ref={picker} id="image-file" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="visually-hidden" tabIndex={-1} onChange={e => { load(e.target.files?.[0]); e.target.value = ''; }} /><button className="secondary-button" onClick={() => picker.current?.click()}>Choose image ↗</button><span>Still JPG, PNG or WebP · up to 15 MB and 12 megapixels</span></div>
    {source && <>
      <div className="image-previews"><figure><figcaption>Original <span>{source.info.width} × {source.info.height} · {formatBytes(source.file.size)}</span></figcaption><div className="image-preview"><img src={source.url} alt="Original image preview" /></div><p className="image-filename">{source.file.name}</p></figure><figure><figcaption>Result <span>{result ? `${result.width} × ${result.height} · ${formatBytes(result.blob.size)}` : 'Choose settings below'}</span></figcaption><div className="image-preview">{result ? <img src={result.url} alt="Processed image preview" /> : <p>Your new image will appear here.</p>}</div>{result && <p className="image-result-meta">{result.blob.type.replace('image/', '').toUpperCase()} · {change >= 0 ? `${change.toFixed(1)}% smaller` : `${Math.abs(change).toFixed(1)}% larger`}{result.blob.type !== 'image/png' ? ` · quality ${Math.round(result.quality * 100)}%` : ''}</p>}</figure></div>
      <fieldset className="image-settings" disabled={busy === 'loading'}><legend>Output settings</legend><div className="image-settings-grid">
        <label>Output format<select aria-label="Output format" value={format} onChange={e => { invalidate(); setFormat(e.target.value as ImageFormat); }}><option value="image/jpeg">JPG</option>{mode !== 'compress' && <option value="image/png">PNG</option>}<option value="image/webp">WebP</option></select></label>
        {format !== 'image/png' && <label>{mode === 'compress' && targetEnabled ? 'Maximum quality' : 'Quality'}: {quality}%<input type="range" min="10" max="100" value={quality} onChange={e => { invalidate(); setQuality(Number(e.target.value)); }} /></label>}
        {format === 'image/jpeg' && <label>Background for transparency<input type="color" value={background} onChange={e => { invalidate(); setBackground(e.target.value); }} /></label>}
        {mode === 'resize' && <><label>Width (px)<input type="number" min="1" max="8000" value={Number.isFinite(width) ? width : ''} onChange={e => dimensions('width', e.target.valueAsNumber)} /></label><label>Height (px)<input type="number" min="1" max="8000" value={Number.isFinite(height) ? height : ''} onChange={e => dimensions('height', e.target.valueAsNumber)} /></label><label className="image-check"><input type="checkbox" checked={locked} onChange={e => { invalidate(); setLocked(e.target.checked); if (e.target.checked) setHeight(Math.max(1, Math.round(width * (cropping ? crop.height / crop.width : source.info.height / source.info.width)))); }} /> Keep aspect ratio</label></>}
        {mode === 'compress' && <><label className="image-check"><input type="checkbox" checked={targetEnabled} onChange={e => { invalidate(); setTargetEnabled(e.target.checked); }} /> Aim for a target size</label>{targetEnabled && <label>Target size (KB)<input type="number" min="1" max="15360" value={Number.isFinite(targetKB) ? targetKB : ''} onChange={e => { invalidate(); setTargetKB(e.target.valueAsNumber); }} /></label>}</>}
      </div>
      {mode === 'resize' && <div className="crop-settings"><label className="image-check"><input type="checkbox" checked={cropping} onChange={e => { invalidate(); setCropping(e.target.checked); if (locked) setHeight(Math.max(1, Math.round(width * (e.target.checked ? crop.height / crop.width : source.info.height / source.info.width)))); }} /> Crop before resizing</label>{cropping && <><p>Coordinates use the correctly oriented original image. Set the top-left corner and crop dimensions in pixels.</p><div className="image-settings-grid">{(['x', 'y', 'width', 'height'] as const).map(key => <label key={key}>{key === 'x' ? 'Left (px)' : key === 'y' ? 'Top (px)' : `Crop ${key} (px)`}<input type="number" min={key === 'x' || key === 'y' ? 0 : 1} max={key === 'x' || key === 'width' ? source.info.width : source.info.height} value={Number.isFinite(crop[key]) ? crop[key] : ''} onChange={e => updateCrop(key, e.target.valueAsNumber)} /></label>)}</div></>}</div>}
      <p className="image-note">{format === 'image/jpeg' ? 'JPG replaces transparent pixels with your chosen background.' : 'PNG and WebP preserve transparency.'} {mode === 'compress' ? 'Compression changes quality while keeping pixel dimensions. A smaller file is not guaranteed.' : format === 'image/png' ? 'PNG is lossless; the quality control does not apply.' : 'JPG and WebP exports use lossy compression.'} Exports do not preserve original EXIF metadata. Colour and encoding can vary by browser.</p></fieldset>
    </>}
    <div className="action-row"><span className="image-note">One image at a time · no uploads</span><div className="action-buttons">{busy ? <button className="secondary-button" onClick={() => { stop(); setStatus('Processing cancelled.'); }}>Cancel processing</button> : <button className="primary-button" disabled={!source} onClick={process}>{action} ↗</button>}{result && <button className="secondary-button" onClick={download}>Download image ↗</button>}</div></div>
    <div className="feedback" aria-live="polite">{error && <p role="alert" className="error-message">{error}</p>}{!error && (busy || status) && <p className="status-message">{busy === 'loading' ? 'Reading your image on this device…' : busy === 'processing' ? 'Processing on your device…' : status}</p>}{result?.targetReached === false && <p className="error-message">Target not reached. The smallest tested output is {formatBytes(result.blob.size)} at {Math.round(result.quality * 100)}% quality. Download it or use Image resize to reduce pixel dimensions.</p>}</div>
  </div>;
}
