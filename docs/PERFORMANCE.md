# Performance

## Frame budget

On a 60 Hz display we have ~16.6 ms per frame. The hero spends:

| Stage | Cost | Notes |
|---|---|---|
| Scroll handler | ~0.05 ms | Empty function that schedules a rAF. |
| rAF compute | ~0.1 ms | `getBoundingClientRect()` + clamp math. |
| React state update | ~0.3 ms | Only fires if Δprogress > 0.0005. |
| Paint effect (`drawImage`) | 1–3 ms | Dominant cost; scales with destination dimensions × DPR. |
| Overlay layers | 0 ms | Static DOM, composited by the browser. |

Total per-frame ≈ **2–4 ms** on a mid-range MacBook, which keeps us comfortably under budget.

## Preload strategy

```
   t = 0ms     mount
   t = 0ms     fire N eager <img> loads in parallel  (N = 10 on full, 6 on mobile)
   t ≈ 80ms    eager batch resolves on a fast connection
              ─► onReady() fires
              ─► poster fades out
   t = 80ms+   requestIdleCallback batches remaining frames, 4 at a time
              ─► browser only does work when the main thread is genuinely idle
```

The `requestIdleCallback` path has a `setTimeout(50ms)` fallback for Safari, where `requestIdleCallback` is unimplemented.

## DPR clamp rationale

The canvas backing store is `cssSize * dpr` pixels. Without a cap:
- A 1440×810 hero on a 3 DPR Pixel phone becomes a 4320×2430 backing store.
- Every `drawImage` then copies ~10.5 M source pixels per scroll tick.

We cap at 2 DPR on desktop and 1.5 on mobile. Past 2 DPR the marginal sharpness on a sub-pixel scroll-driven animation is imperceptible.

## Tier comparison

| Metric | full | mobile | fallback |
|---|---|---|---|
| Frame stride | 1 | 2 | n/a |
| Eager frames | 10 | 6 | 0 |
| Runway | 300vh | 200vh | 100vh |
| Max DPR | 2 | 1.5 | 1 |
| Paints canvas? | yes | yes | no |
| Approx initial payload (6s @ 30fps, 1440w q78) | ~4.5 MB | ~2.2 MB | poster only |

## Profiling tips

- Open DevTools Performance, record while scrolling.
- Look for long `drawImage` calls — if any are > 8 ms, lower `frameCount` or `width`.
- If the timeline shows GC pauses, ensure you're not creating fresh `Image` instances on every render somewhere upstream of `<ScrollCinematicHero/>`.
