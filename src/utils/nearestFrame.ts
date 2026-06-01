import type { FrameEntry } from '../types';

export function nearestFrame(
  frames: FrameEntry[],
  targetIndex: number,
): FrameEntry | null {
  if (frames.length === 0) return null;
  const clamped = Math.max(1, Math.min(frames.length, Math.floor(targetIndex)));
  const direct = frames[clamped - 1];
  if (direct && direct.status === 'loaded') return direct;

  const maxRadius = Math.max(clamped - 1, frames.length - clamped);
  for (let r = 1; r <= maxRadius; r++) {
    const lo = clamped - r;
    const hi = clamped + r;
    if (lo >= 1) {
      const f = frames[lo - 1];
      if (f && f.status === 'loaded') return f;
    }
    if (hi <= frames.length) {
      const f = frames[hi - 1];
      if (f && f.status === 'loaded') return f;
    }
  }
  return null;
}
