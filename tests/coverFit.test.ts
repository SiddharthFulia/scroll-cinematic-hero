import { describe, it, expect } from 'vitest';
import { coverFit, containFit } from '../src/utils/coverFit';

describe('coverFit', () => {
  it('returns a non-zero result for a same-aspect image', () => {
    const r = coverFit(1920, 1080, 1920, 1080);
    expect(r.drawW).toBe(1920);
    expect(r.drawH).toBe(1080);
    expect(r.drawX).toBe(0);
    expect(r.drawY).toBe(0);
    expect(r.scale).toBe(1);
  });

  it('letterbox-overflows horizontally when src is wider than dst', () => {
    // src 2:1, dst 1:1 → height drives, drawW > dst.w
    const r = coverFit(2000, 1000, 500, 500);
    expect(r.drawH).toBe(500);
    expect(r.drawW).toBe(1000);
    expect(r.drawX).toBe(-250);
    expect(r.drawY).toBe(0);
  });

  it('letterbox-overflows vertically when src is taller than dst', () => {
    // src 1:2, dst 1:1 → width drives, drawH > dst.h
    const r = coverFit(500, 1000, 500, 500);
    expect(r.drawW).toBe(500);
    expect(r.drawH).toBe(1000);
    expect(r.drawY).toBe(-250);
    expect(r.drawX).toBe(0);
  });

  it('returns zeros for degenerate inputs', () => {
    const r = coverFit(0, 1000, 500, 500);
    expect(r.drawW).toBe(0);
    expect(r.scale).toBe(0);
  });

  it('drawW is always >= dstW (the defining property of cover)', () => {
    const cases: Array<[number, number, number, number]> = [
      [1920, 1080, 800, 600],
      [1080, 1920, 800, 600],
      [1000, 1000, 1280, 720],
      [3840, 1600, 1440, 900],
    ];
    for (const [sw, sh, dw, dh] of cases) {
      const r = coverFit(sw, sh, dw, dh);
      expect(r.drawW + 1e-6).toBeGreaterThanOrEqual(dw);
      expect(r.drawH + 1e-6).toBeGreaterThanOrEqual(dh);
    }
  });
});

describe('containFit', () => {
  it('keeps the whole image visible (drawW <= dstW, drawH <= dstH)', () => {
    const r = containFit(2000, 1000, 500, 500);
    expect(r.drawW).toBeLessThanOrEqual(500 + 1e-6);
    expect(r.drawH).toBeLessThanOrEqual(500 + 1e-6);
  });
});
