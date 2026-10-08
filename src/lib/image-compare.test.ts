import { expect, it } from 'vitest';
import { comparePixels } from './image-compare';
it('reports identical pixels and emits opaque grayscale', () => { const a = new Uint8ClampedArray([255,0,0,255]); const r=comparePixels(a,a); expect(r.changed).toBe(0);expect(r.meanDifference).toBe(0);expect(r.mask[3]).toBe(255);expect(r.mask[0]).toBe(r.mask[1]); });
it('uses maximum channel distance and an exclusive threshold', () => { const a=new Uint8ClampedArray([10,20,30,255,0,0,0,255]),b=new Uint8ClampedArray([15,20,30,255,255,255,255,255]);const r=comparePixels(a,b,5);expect(r.changed).toBe(1);expect(Array.from(r.mask.slice(4))).toEqual([222,40,112,255]);expect(r.meanDifference).toBeGreaterThan(50); });
it('validates buffers and thresholds', () => { expect(()=>comparePixels(new Uint8ClampedArray(4),new Uint8ClampedArray(8))).toThrow();expect(()=>comparePixels(new Uint8ClampedArray(4),new Uint8ClampedArray(4),256)).toThrow(); });
