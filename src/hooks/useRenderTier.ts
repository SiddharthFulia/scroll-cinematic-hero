import { useEffect, useState } from 'react';
import type { RenderTier } from '../types';

interface UseRenderTierArgs {
  force?: RenderTier;
}

export function useRenderTier({ force }: UseRenderTierArgs = {}): RenderTier {
  const [tier, setTier] = useState<RenderTier>(() => {
    if (force) return force;
    if (typeof window === 'undefined') return 'fallback';
    return detectTier();
  });

  useEffect(() => {
    if (force) {
      setTier(force);
      return;
    }
    if (typeof window === 'undefined') return;

    let frame = 0;
    const update = () => {
      frame = 0;
      setTier(detectTier());
    };
    const schedule = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(update);
    };

    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');

    window.addEventListener('resize', schedule, { passive: true });
    mqReduce.addEventListener?.('change', schedule);
    mqCoarse.addEventListener?.('change', schedule);

    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      mqReduce.removeEventListener?.('change', schedule);
      mqCoarse.removeEventListener?.('change', schedule);
    };
  }, [force]);

  return tier;
}

function detectTier(): RenderTier {
  if (typeof window === 'undefined') return 'fallback';

  const reduceMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduceMotion) return 'fallback';

  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrow = window.innerWidth <= 768;
  const cores =
    typeof navigator !== 'undefined' && (navigator as any).hardwareConcurrency
      ? (navigator as any).hardwareConcurrency
      : 8;

  if (coarse || narrow || cores <= 4) return 'mobile';

  return 'full';
}
