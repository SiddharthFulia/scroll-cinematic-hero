import { describe, it, expect } from 'vitest';
import { nearestFrame } from '../src/utils/nearestFrame';
import type { FrameEntry } from '../src/types';

function build(loadedSet: Set<number>, count = 10): FrameEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    return {
      index,
      src: `/f/${index}.webp`,
      image: loadedSet.has(index) ? ({} as unknown as HTMLImageElement) : null,
      status: loadedSet.has(index) ? 'loaded' : 'idle',
    };
  });
}

describe('nearestFrame', () => {
  it('returns null when nothing is loaded', () => {
    const frames = build(new Set());
    expect(nearestFrame(frames, 5)).toBeNull();
  });

  it('returns the exact frame when it is loaded', () => {
    const frames = build(new Set([3, 4, 5, 6]));
    const r = nearestFrame(frames, 5);
    expect(r?.index).toBe(5);
  });

  it('walks outward to the nearest loaded frame', () => {
    // Only 1 and 10 are loaded; target is 5 → 4 unloaded, 6 unloaded ... 1 is closer (radius 4) vs 10 (radius 5).
    const frames = build(new Set([1, 10]));
    const r = nearestFrame(frames, 5);
    expect(r?.index).toBe(1);
  });

  it('prefers the lower neighbour when tied', () => {
    const frames = build(new Set([4, 6]));
    const r = nearestFrame(frames, 5);
    // implementation visits lo first, so 4
    expect(r?.index).toBe(4);
  });

  it('clamps targetIndex to the valid range', () => {
    const frames = build(new Set([1, 2]));
    const r = nearestFrame(frames, 999);
    expect(r?.index).toBe(2);
  });

  it('handles target=1 (no lower neighbour exists)', () => {
    const frames = build(new Set([3]));
    const r = nearestFrame(frames, 1);
    expect(r?.index).toBe(3);
  });
});
