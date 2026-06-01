import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { ScrollCinematicHeroProps } from './types';
import { getTierConfig } from './config/tiers';
import { useRenderTier } from './hooks/useRenderTier';
import { useFrameLoader } from './hooks/useFrameLoader';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useCanvas2D } from './hooks/useCanvas2D';
import { coverFit } from './utils/coverFit';
import { nearestFrame } from './utils/nearestFrame';
import { CinematicOverlay } from './components/CinematicOverlay';
import { Scrubber } from './components/Scrubber';

export function ScrollCinematicHero(props: ScrollCinematicHeroProps) {
  const {
    basePath = '/hero-frames',
    frameCount,
    padWidth = 4,
    filePrefix = 'frame_',
    fileExt = 'webp',
    posterSrc,
    forceTier,
    children,
    className,
    id,
    onFrameChange,
    onReady,
    showScrubber = true,
    showOverlay = true,
  } = props;

  if (!Number.isFinite(frameCount) || frameCount <= 0) {
    throw new RangeError(
      `<ScrollCinematicHero/>: frameCount must be a positive integer, got ${frameCount}`,
    );
  }

  const tier = useRenderTier({ force: forceTier });
  const tierConfig = useMemo(() => getTierConfig(tier), [tier]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnIndexRef = useRef<number>(-1);
  const ctxSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const { frames, loadedCount, ready } = useFrameLoader({
    basePath,
    filePrefix,
    padWidth,
    fileExt,
    frameCount,
    tier: tierConfig,
    enabled: tierConfig.paintCanvas,
    onReady,
  });

  const progress = useScrollProgress({
    target: wrapperRef,
    enabled: tierConfig.paintCanvas,
  });

  useCanvas2D({
    canvasRef,
    maxDpr: tierConfig.maxDpr,
    enabled: tierConfig.paintCanvas,
    onResize: (w, h) => {
      ctxSizeRef.current = { w, h };
      lastDrawnIndexRef.current = -1;
    },
  });

  const targetSlot = useMemo(() => {
    if (frames.length === 0) return 0;
    const slot = Math.min(
      frames.length - 1,
      Math.max(0, Math.round(progress * (frames.length - 1))),
    );
    return slot;
  }, [progress, frames.length]);

  useEffect(() => {
    if (!tierConfig.paintCanvas) return;
    if (frames.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIdx = frames[targetSlot]?.index ?? 1;
    if (lastDrawnIndexRef.current === targetIdx) return;

    const entry = nearestFrame(frames, targetSlot + 1);
    if (!entry || !entry.image) return;

    const { w, h } = ctxSizeRef.current;
    const cssW = w || canvas.clientWidth;
    const cssH = h || canvas.clientHeight;
    if (cssW <= 0 || cssH <= 0) return;

    const fit = coverFit(
      entry.image.naturalWidth,
      entry.image.naturalHeight,
      cssW,
      cssH,
    );

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(entry.image, fit.drawX, fit.drawY, fit.drawW, fit.drawH);
    lastDrawnIndexRef.current = targetIdx;

    onFrameChange?.(targetIdx, progress);
  }, [targetSlot, frames, tierConfig.paintCanvas, onFrameChange, progress]);

  const runwayVh = tierConfig.runwayVh;

  return (
    <section
      ref={wrapperRef}
      id={id}
      className={className}
      data-tier={tier}
      style={{
        position: 'relative',
        width: '100%',
        height: `${runwayVh}vh`,
        background: '#0a0a0e',
      }}
    >
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {posterSrc && (
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: tierConfig.paintCanvas && ready ? 0 : 1,
              transition: 'opacity 320ms ease-out',
              zIndex: 0,
            }}
          />
        )}

        {tierConfig.paintCanvas && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              zIndex: 1,
            }}
          />
        )}

        {showOverlay && tierConfig.paintCanvas && <CinematicOverlay />}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>{children}</div>
        </div>

        {showScrubber && tierConfig.paintCanvas && (
          <Scrubber
            progress={progress}
            loading={!ready && loadedCount < tierConfig.eagerPreloadCount}
          />
        )}
      </div>
    </section>
  );
}

export default ScrollCinematicHero;
