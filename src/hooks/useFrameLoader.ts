import { useEffect, useMemo, useRef, useState } from 'react';
import type { FrameEntry, TierConfig } from '../types';
import { framePath } from '../utils/framePath';

interface UseFrameLoaderArgs {
  basePath: string;
  filePrefix: string;
  padWidth: number;
  fileExt: string;
  frameCount: number;
  tier: TierConfig;
  enabled: boolean;
  onReady?: () => void;
}

interface UseFrameLoaderResult {
  frames: FrameEntry[];
  loadedCount: number;
  ready: boolean;
}

export function useFrameLoader(args: UseFrameLoaderArgs): UseFrameLoaderResult {
  const {
    basePath,
    filePrefix,
    padWidth,
    fileExt,
    frameCount,
    tier,
    enabled,
    onReady,
  } = args;

  const initial = useMemo<FrameEntry[]>(() => {
    const list: FrameEntry[] = [];
    for (let i = 1; i <= frameCount; i += tier.frameStride) {
      list.push({
        index: i,
        src: framePath({ basePath, filePrefix, padWidth, fileExt, index: i }),
        image: null,
        status: 'idle',
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, filePrefix, padWidth, fileExt, frameCount, tier.frameStride]);

  const [frames, setFrames] = useState<FrameEntry[]>(initial);
  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const readyFiredRef = useRef(false);

  useEffect(() => {
    setFrames(initial);
    setLoadedCount(0);
    setReady(false);
    readyFiredRef.current = false;
  }, [initial]);

  useEffect(() => {
    if (!enabled || frames.length === 0) return;

    let cancelled = false;
    const eagerN = Math.min(tier.eagerPreloadCount, frames.length);

    const markLoaded = (idx: number, img: HTMLImageElement) => {
      if (cancelled) return;
      setFrames((prev) => {
        const next = prev.slice();
        const at = next.findIndex((f) => f.index === idx);
        if (at !== -1) {
          next[at] = { ...next[at], image: img, status: 'loaded' };
        }
        return next;
      });
      setLoadedCount((c) => c + 1);
    };

    const markError = (idx: number) => {
      if (cancelled) return;
      setFrames((prev) => {
        const next = prev.slice();
        const at = next.findIndex((f) => f.index === idx);
        if (at !== -1) next[at] = { ...next[at], status: 'error' };
        return next;
      });
    };

    const loadOne = (entry: FrameEntry): Promise<void> =>
      new Promise((resolve) => {
        if (entry.status === 'loaded' || entry.status === 'loading') {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.onload = () => {
          markLoaded(entry.index, img);
          resolve();
        };
        img.onerror = () => {
          markError(entry.index);
          resolve();
        };
        img.src = entry.src;
      });

    const eagerPromises: Promise<void>[] = [];
    for (let i = 0; i < eagerN; i++) {
      eagerPromises.push(loadOne(frames[i]!));
    }

    Promise.all(eagerPromises).then(() => {
      if (cancelled) return;
      if (!readyFiredRef.current) {
        readyFiredRef.current = true;
        setReady(true);
        onReady?.();
      }
    });

    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    let cursor = eagerN;

    const scheduleNext = () => {
      if (cancelled || cursor >= frames.length) return;
      const cb = () => {
        if (cancelled) return;
        const batchSize = 4;
        const slice = frames.slice(cursor, cursor + batchSize);
        cursor += batchSize;
        Promise.all(slice.map(loadOne)).then(scheduleNext);
      };
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, opts?: { timeout: number }) => number)
        | undefined;
      if (typeof ric === 'function') {
        idleHandle = ric(cb, { timeout: 500 });
      } else {
        timeoutHandle = window.setTimeout(cb, 50);
      }
    };
    scheduleNext();

    return () => {
      cancelled = true;
      const cic = (window as any).cancelIdleCallback as
        | ((h: number) => void)
        | undefined;
      if (idleHandle !== undefined && typeof cic === 'function') cic(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, initial]);

  return { frames, loadedCount, ready };
}
