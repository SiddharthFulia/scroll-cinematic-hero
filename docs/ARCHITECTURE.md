# Architecture

## High-level pipeline

```
 ┌──────────────────────────────────────────────────────────────┐
 │ <ScrollCinematicHero/>                                       │
 │                                                              │
 │   useRenderTier ─►  TIER_CONFIG[tier]                        │
 │        │                                                     │
 │        ├──► useFrameLoader  ─► FrameEntry[] (eager + idle)   │
 │        │                                                     │
 │        ├──► useScrollProgress ─► progress (0..1, rAF coal.)  │
 │        │                                                     │
 │        ├──► useCanvas2D     ─► DPR-aware <canvas>            │
 │        │                                                     │
 │        └──► paint effect:                                    │
 │              targetSlot = round(progress * (frames.len - 1)) │
 │              entry = nearestFrame(frames, targetSlot + 1)    │
 │              fit  = coverFit(entry.w, entry.h, css.w, css.h) │
 │              ctx.clearRect(...)                              │
 │              ctx.drawImage(entry.image, fit.x, fit.y, ...)   │
 └──────────────────────────────────────────────────────────────┘
```

## Sticky runway diagram

```
        ┌─────────────────────┐  ◀── start: progress = 0
        │  runway (300vh)     │
        │ ┌─────────────────┐ │
   100vh│ │  sticky stage   │ │  ◀── canvas + overlay + children
        │ │   (position:    │ │
        │ │    sticky;      │ │
        │ │    top: 0)      │ │
        │ └─────────────────┘ │
        │                     │
        │                     │  ◀── 50% scroll → frame N/2
        │                     │
        │                     │
        │                     │
        └─────────────────────┘  ◀── end: progress = 1, frame N
        ┌─────────────────────┐
        │  next section       │
        └─────────────────────┘
```

The outer wrapper is `runwayVh` tall (300/200/100 by tier). Inside it, a `position: sticky; top: 0; height: 100vh` div holds the canvas + overlays + children. As the user scrolls, the outer wrapper moves under the viewport while the sticky stage stays pinned — and we just need the wrapper's `top` to compute progress.

## Paint loop

Triggered by a React effect whose deps are `[targetSlot, frames]`. Because `targetSlot` only updates when the rounded slot changes (and `progress` updates are filtered to deltas > 0.0005), the paint runs at most once per visible frame change.

Cover-fit math (see `src/utils/coverFit.ts`) replicates CSS `background-size: cover` on a canvas — the image is scaled to fully cover the destination box, centered, and cropped by `drawX < 0` / `drawY < 0`.

## Tier detection

`useRenderTier()` checks, in order:

1. `prefers-reduced-motion: reduce` → `fallback`
2. `pointer: coarse` OR `window.innerWidth <= 768` OR `navigator.hardwareConcurrency <= 4` → `mobile`
3. Otherwise → `full`

Resize + media-query changes re-run detection through rAF.
