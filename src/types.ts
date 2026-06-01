export type RenderTier = 'full' | 'mobile' | 'fallback';

export interface TierConfig {
  tier: RenderTier;
  frameStride: number;
  eagerPreloadCount: number;
  runwayVh: number;
  paintCanvas: boolean;
  maxDpr: number;
}

export interface ScrollCinematicHeroProps {
  basePath?: string;
  frameCount: number;
  padWidth?: number;
  filePrefix?: string;
  fileExt?: 'webp' | 'jpg' | 'png';
  posterSrc?: string;
  aspectRatio?: number;
  forceTier?: RenderTier;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onFrameChange?: (frameIndex: number, progress: number) => void;
  onReady?: () => void;
  showScrubber?: boolean;
  showOverlay?: boolean;
}

export interface FrameEntry {
  index: number;
  src: string;
  image: HTMLImageElement | null;
  status: 'idle' | 'loading' | 'loaded' | 'error';
}
