import { useEffect, useRef } from 'react';

interface UseCanvas2DArgs {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  maxDpr?: number;
  enabled?: boolean;
  onResize?: (width: number, height: number, dpr: number) => void;
}

interface UseCanvas2DResult {
  dprRef: React.MutableRefObject<number>;
  getContext: () => CanvasRenderingContext2D | null;
}

export function useCanvas2D(args: UseCanvas2DArgs): UseCanvas2DResult {
  const { canvasRef, maxDpr = 2, enabled = true, onResize } = args;
  const dprRef = useRef<number>(1);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const apply = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.floor(rect.width));
      const cssH = Math.max(1, Math.floor(rect.height));
      const rawDpr =
        typeof window !== 'undefined' && window.devicePixelRatio
          ? window.devicePixelRatio
          : 1;
      const dpr = Math.max(1, Math.min(maxDpr, rawDpr));
      dprRef.current = dpr;

      const targetW = Math.floor(cssW * dpr);
      const targetH = Math.floor(cssH * dpr);
      if (canvas.width !== targetW) canvas.width = targetW;
      if (canvas.height !== targetH) canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      onResize?.(cssW, cssH, dpr);
    };

    apply();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => apply());
      ro.observe(canvas);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', apply, { passive: true });
    }

    return () => {
      if (ro) ro.disconnect();
      else if (typeof window !== 'undefined') {
        window.removeEventListener('resize', apply);
      }
    };
  }, [canvasRef, maxDpr, enabled, onResize]);

  const getContext = () => {
    const c = canvasRef.current;
    if (!c) return null;
    return c.getContext('2d');
  };

  return { dprRef, getContext };
}
