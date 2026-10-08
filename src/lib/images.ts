export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 12_000_000;
export const MAX_IMAGE_SIDE = 8000;
export type ImageInfo = { width: number; height: number; format: ImageFormat };
export type Crop = { x: number; y: number; width: number; height: number };
export type ImageSettings = { format: ImageFormat; quality: number; width: number; height: number; background: string; crop?: Crop; targetBytes?: number };
export function validateDimensions(width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) throw new Error('Use whole-number dimensions up to 8,000 pixels per side and 12 megapixels in total.');
}
// Inspect dimensions and animation before allocating a decoded pixel buffer.
export function inspectImageHeader(buffer: ArrayBuffer): ImageInfo {
  const bytes = new Uint8Array(buffer); const view = new DataView(buffer);
  const text = (offset: number, length: number) => String.fromCharCode(...bytes.slice(offset, offset + length));
  const fail = () => { throw new Error('Choose a valid, still JPG, PNG, or WebP image. SVG, GIF, HEIC, and animated images are not supported.'); };
  let info: ImageInfo | undefined;
  if (bytes.length >= 33 && bytes.slice(0, 8).every((v, i) => v === [137, 80, 78, 71, 13, 10, 26, 10][i]) && text(12, 4) === 'IHDR' && view.getUint32(8) === 13) {
    info = { width: view.getUint32(16), height: view.getUint32(20), format: 'image/png' };
    for (let p = 8; p + 12 <= bytes.length;) {
      const size = view.getUint32(p); if (p + 12 + size > bytes.length) return fail();
      if (text(p + 4, 4) === 'acTL') throw new Error('Animated PNG is not supported. Choose a still image.');
      p += size + 12;
    }
  } else if (bytes.length >= 12 && bytes[0] === 255 && bytes[1] === 216) {
    for (let p = 2; p + 4 <= bytes.length;) {
      if (bytes[p++] !== 255) return fail();
      while (bytes[p] === 255) p++;
      const marker = bytes[p++]; if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (p + 2 > bytes.length) return fail();
      const size = view.getUint16(p); if (size < 2 || p + size > bytes.length) return fail();
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
        if (size < 8) return fail();
        info = { height: view.getUint16(p + 3), width: view.getUint16(p + 5), format: 'image/jpeg' }; break;
      }
      p += size;
    }
  } else if (bytes.length >= 30 && text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') {
    const end = view.getUint32(4, true) + 8; if (end > bytes.length) return fail();
    const uint24 = (p: number) => bytes[p] + (bytes[p + 1] << 8) + (bytes[p + 2] << 16);
    for (let p = 12; p + 8 <= end;) {
      const tag = text(p, 4); const size = view.getUint32(p + 4, true); const data = p + 8;
      if (data + size > end) return fail();
      if (tag === 'ANIM' || tag === 'ANMF' || (tag === 'VP8X' && size >= 10 && (bytes[data] & 2))) throw new Error('Animated WebP is not supported. Choose a still image.');
      if (tag === 'VP8X' && size >= 10) info = { width: uint24(data + 4) + 1, height: uint24(data + 7) + 1, format: 'image/webp' };
      if (tag === 'VP8 ' && size >= 10 && bytes[data + 3] === 157 && bytes[data + 4] === 1 && bytes[data + 5] === 42) {
        const w = view.getUint16(data + 6, true) & 16383; const h = view.getUint16(data + 8, true) & 16383;
        validateDimensions(w, h); if (!info) info = { width: w, height: h, format: 'image/webp' };
      }
      if (tag === 'VP8L' && size >= 5 && bytes[data] === 47) {
        const bits = view.getUint32(data + 1, true); const w = (bits & 16383) + 1; const h = ((bits >>> 14) & 16383) + 1;
        validateDimensions(w, h); if (!info) info = { width: w, height: h, format: 'image/webp' };
      }
      p = data + size + (size % 2);
    }
  }
  if (!info) return fail(); validateDimensions(info.width, info.height); return info;
}
export function validateSettings(settings: ImageSettings, width: number, height: number) {
  validateDimensions(settings.width, settings.height);
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(settings.format) || !Number.isFinite(settings.quality) || settings.quality < 0.1 || settings.quality > 1 || !/^#[0-9a-f]{6}$/i.test(settings.background)) throw new Error('Choose a supported format, quality, and background colour.');
  const c = settings.crop;
  if (c && (!Number.isInteger(c.x) || !Number.isInteger(c.y) || c.x < 0 || c.y < 0 || !Number.isInteger(c.width) || !Number.isInteger(c.height) || c.width < 1 || c.height < 1 || c.x + c.width > width || c.y + c.height > height)) throw new Error('The crop must fit inside the original image.');
  if (settings.targetBytes !== undefined && (!Number.isFinite(settings.targetBytes) || settings.targetBytes < 1024 || settings.targetBytes > MAX_IMAGE_BYTES || settings.format === 'image/png')) throw new Error('Choose a JPG or WebP target between 1 and 15,360 KB.');
}
export function imageFilename(name: string, format: ImageFormat) {
  const stem = name.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 80) || 'image';
  return `${stem}-filenest.${format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'}`;
}
export function formatBytes(bytes: number) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`; }
