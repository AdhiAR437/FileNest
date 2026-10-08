export function comparePixels(a: Uint8ClampedArray, b: Uint8ClampedArray, threshold = 0) {
  if (a.length !== b.length || !a.length || a.length % 4) throw new Error('Images need equal pixel dimensions.');
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) throw new Error('Choose a threshold from 0 to 255.');
  const mask = new Uint8ClampedArray(a.length); let changed = 0, distance = 0;
  for (let i = 0; i < a.length; i += 4) {
    const d0 = Math.abs(a[i] - b[i]), d1 = Math.abs(a[i + 1] - b[i + 1]), d2 = Math.abs(a[i + 2] - b[i + 2]);
    const different = Math.max(d0, d1, d2) > threshold; distance += d0 + d1 + d2;
    if (different) { changed++; mask[i] = 222; mask[i + 1] = 40; mask[i + 2] = 112; }
    else { const gray = Math.round((a[i] * .2126 + a[i + 1] * .7152 + a[i + 2] * .0722) * .35 + 255 * .65); mask[i] = mask[i + 1] = mask[i + 2] = gray; }
    mask[i + 3] = 255;
  }
  return { mask, changed, total: a.length / 4, meanDifference: distance / (a.length / 4 * 3 * 255) * 100 };
}
