import { inspectImageHeader, validateDimensions, validateSettings, MAX_IMAGE_BYTES } from '../lib/images';
import type { ImageSettings } from '../lib/images';
async function thumbnail(source: ImageBitmap | OffscreenCanvas) {
  const scale = Math.min(1, 600 / Math.max(source.width, source.height));
  const canvas = new OffscreenCanvas(Math.max(1, Math.round(source.width * scale)), Math.max(1, Math.round(source.height * scale)));
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image previews are unavailable in this browser.');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height); return canvas.convertToBlob({ type: 'image/png' });
}
self.onmessage = async (event: MessageEvent<{ action: 'inspect' | 'process'; file: File; settings?: ImageSettings }>) => {
  let bitmap: ImageBitmap | undefined;
  try {
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') throw new Error('This image tool needs a current browser with canvas support. Try an updated Chrome, Edge, Firefox, or Safari.');
    const { file, action, settings } = event.data;
    if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error('Choose an image up to 15 MB.');
    const info = inspectImageHeader(await file.arrayBuffer());
    bitmap = await createImageBitmap(new Blob([file], { type: info.format }), { imageOrientation: 'from-image' });
    validateDimensions(bitmap.width, bitmap.height);
    if (action === 'inspect') { self.postMessage({ info: { ...info, width: bitmap.width, height: bitmap.height }, preview: await thumbnail(bitmap) }); return; }
    if (!settings) throw new Error('Choose your output settings.'); validateSettings(settings, bitmap.width, bitmap.height);
    const canvas = new OffscreenCanvas(settings.width, settings.height); const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not create this image. Try smaller dimensions.');
    if (settings.format === 'image/jpeg') { ctx.fillStyle = settings.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const crop = settings.crop ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
    ctx.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, settings.width, settings.height); bitmap.close(); bitmap = undefined;
    async function encode(quality: number) {
      const blob = await canvas.convertToBlob({ type: settings!.format, quality });
      if (blob.type !== settings!.format) throw new Error('Your browser cannot export this format. Choose PNG or JPG instead.'); return blob;
    }
    let quality = settings.quality; let blob = await encode(quality); const target = settings.targetBytes;
    if (target && blob.size > target) {
      let lower = 0.1; let upper = quality; const lowBlob = await encode(lower);
      if (lowBlob.size < blob.size) { blob = lowBlob; quality = lower; }
      if (lowBlob.size <= target) {
        for (let i = 0; i < 6; i++) {
          const q = (lower + upper) / 2; const candidate = await encode(q);
          if (candidate.size <= target) { lower = q; quality = q; blob = candidate; } else upper = q;
        }
      }
    }
    bitmap = await createImageBitmap(blob);
    self.postMessage({ blob, preview: await thumbnail(bitmap), width: canvas.width, height: canvas.height, quality, targetReached: target ? blob.size <= target : null });
  } catch (error) { self.postMessage({ error: error instanceof Error ? error.message : 'Unable to read or process this image.' }); }
  finally { bitmap?.close(); }
};
