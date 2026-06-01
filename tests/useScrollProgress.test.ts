import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollProgress } from '../src/hooks/useScrollProgress';
import { createRef } from 'react';

declare global {
  // eslint-disable-next-line no-var
  var __flushRaf: () => void;
}

describe('useScrollProgress', () => {
  let originalInnerHeight: number;

  beforeEach(() => {
    originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    vi.restoreAllMocks();
  });

  it('returns 0 when the target hasn\'t scrolled into view', () => {
    const ref = createRef<HTMLDivElement>();
    const el = document.createElement('div');
    (ref as any).current = el;

    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 1000,
      bottom: 4000,
      left: 0,
      right: 100,
      width: 100,
      height: 3000,
      x: 0,
      y: 1000,
      toJSON: () => ({}),
    } as DOMRect);

    const { result } = renderHook(() => useScrollProgress({ target: ref }));
    expect(result.current).toBe(0);
  });

  it('returns ~0.5 mid-runway and ~1 at the end', () => {
    const ref = createRef<HTMLDivElement>();
    const el = document.createElement('div');
    (ref as any).current = el;

    // Runway = 3000, viewport = 1000 → total = 2000.
    // To get progress 0.5 we need scrolled=1000 i.e. rect.top = -1000.
    let topNow = -1000;
    vi.spyOn(el, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          top: topNow,
          bottom: topNow + 3000,
          left: 0,
          right: 100,
          width: 100,
          height: 3000,
          x: 0,
          y: topNow,
          toJSON: () => ({}),
        }) as DOMRect,
    );

    const { result } = renderHook(() => useScrollProgress({ target: ref }));
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      (globalThis as any).__flushRaf();
    });
    expect(result.current).toBeGreaterThan(0.49);
    expect(result.current).toBeLessThan(0.51);

    topNow = -2000; // end of runway
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      (globalThis as any).__flushRaf();
    });
    expect(result.current).toBe(1);
  });
});
