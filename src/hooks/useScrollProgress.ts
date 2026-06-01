import { useEffect, useRef, useState } from 'react';

interface UseScrollProgressArgs {
  target: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

export function useScrollProgress(args: UseScrollProgressArgs): number {
  const { target, enabled = true } = args;
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const compute = () => {
      rafRef.current = 0;
      const el = target.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const total = rect.height - viewport;
      if (total <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      if (Math.abs(p - lastRef.current) > 0.0005) {
        lastRef.current = p;
        setProgress(p);
      }
    };

    const onScroll = () => {
      if (rafRef.current !== 0) return;
      rafRef.current = window.requestAnimationFrame(compute);
    };

    compute();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled]);

  return progress;
}
