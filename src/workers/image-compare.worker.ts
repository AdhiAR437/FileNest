import { inspectImageHeader, MAX_IMAGE_BYTES, validateDimensions } from '../lib/images';
import { comparePixels } from '../lib/image-compare';
self.onmessage = async (event: MessageEvent<{ files: File[]; threshold: number }>) => {
  try {
    const { files, threshold } = event.data;
    if (files.length !== 2 || files.some(f => !f.size || f.size > MAX_IMAGE_BYTES)) throw new Error('Choose two still images up to 15 MB each.');
    const canvases: OffscreenCanvas[] = []; const pixels: Uint8ClampedArray[] = []; let width = 0, height = 0;
    for (const file of files) {
      const data = await file.arrayBuffer(); const info = inspectImageHeader(data);
      if (info.width * info.height > 6_000_000) throw new Error('Use up to 6 megapixels per image for comparison.');
      const bitmap = await createImageBitmap(new Blob([file], { type: info.format }), { imageOrientation: 'from-image' });
      try {
        validateDimensions(bitmap.width, bitmap.height);
        if (canvases.length && (width !== bitmap.width || height !== bitmap.height)) throw new Error('Images must have the same dimensions after orientation. Use Image resize first.');
        width = bitmap.width; height = bitmap.height; const canvas = new OffscreenCanvas(width, height), ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Image comparison is unavailable in this browser.');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); ctx.drawImage(bitmap, 0, 0); pixels.push(ctx.getImageData(0, 0, width, height).data); canvases.push(canvas);
      } finally { bitmap.close(); }
    }
    const { mask, ...stats } = comparePixels(pixels[0], pixels[1], threshold); const diff = new OffscreenCanvas(width, height); diff.getContext('2d')!.putImageData(new ImageData(mask, width, height), 0, 0);
    const blob = await diff.convertToBlob({ type: 'image/png' }); if (blob.size > 20 * 1024 * 1024) throw new Error('Difference output is too large. Resize both images first.');
    async function preview(canvas: OffscreenCanvas) { const scale = Math.min(1, 1000 / Math.max(width, height)); const c = new OffscreenCanvas(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))); c.getContext('2d')!.drawImage(canvas, 0, 0, c.width, c.height); return c.convertToBlob({ type: 'image/png' }); }
    const previews = []; for (const canvas of [...canvases, diff]) previews.push(await preview(canvas));
    self.postMessage({ blob, previews, width, height, ...stats });
  } catch (e) { self.postMessage({ error: e instanceof Error ? e.message : 'Unable to compare these images.' }); }
};
