import type { RenderTier, TierConfig } from '../types';

export const TIER_CONFIG: Record<RenderTier, TierConfig> = {
  full: {
    tier: 'full',
    frameStride: 1,
    eagerPreloadCount: 10,
    runwayVh: 300,
    paintCanvas: true,
    maxDpr: 2,
  },
  mobile: {
    tier: 'mobile',
    frameStride: 2,
    eagerPreloadCount: 6,
    runwayVh: 200,
    paintCanvas: true,
    maxDpr: 1.5,
  },
  fallback: {
    tier: 'fallback',
    frameStride: 1,
    eagerPreloadCount: 0,
    runwayVh: 100,
    paintCanvas: false,
    maxDpr: 1,
  },
};

export function getTierConfig(tier: RenderTier): TierConfig {
  return TIER_CONFIG[tier] ?? TIER_CONFIG.fallback;
}
