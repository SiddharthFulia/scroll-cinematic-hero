export { ScrollCinematicHero, default } from './ScrollCinematicHero';
export { CinematicOverlay } from './components/CinematicOverlay';
export { Scrubber } from './components/Scrubber';
export { ContinueAnchor } from './components/ContinueAnchor';
export { TIER_CONFIG, getTierConfig } from './config/tiers';
export { useRenderTier } from './hooks/useRenderTier';
export { useFrameLoader } from './hooks/useFrameLoader';
export { useScrollProgress } from './hooks/useScrollProgress';
export { useCanvas2D } from './hooks/useCanvas2D';
export { framePath, padIndex } from './utils/framePath';
export { coverFit, containFit } from './utils/coverFit';
export { nearestFrame } from './utils/nearestFrame';
export type {
  ScrollCinematicHeroProps,
  RenderTier,
  TierConfig,
  FrameEntry,
} from './types';
