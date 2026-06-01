# scroll-cinematic-hero

Drop-in React + TypeScript component that plays a **scroll-driven WebP frame sequence** as a sticky cinematic hero — the Apple AirPods Max / iPhone product-page effect, in ~10 KB gzipped.

Three render tiers are auto-detected on mount:

| Tier | Trigger | Frames | Eager preload | Runway |
|---|---|---|---|---|
| `full` | desktop (`pointer: fine`, width > 768, cores ≥ 4) | every frame | 10 | 300vh |
| `mobile` | touch / narrow / weak CPU | every 2nd frame | 6 | 200vh |
| `fallback` | `prefers-reduced-motion: reduce` | — | — | static poster, 100vh |

Built for Siddharth Fulia's cinematic / AI-video tooling work.

---

## Install

```bash
npm install scroll-cinematic-hero
```

`react` and `react-dom` (≥ 18) are peer deps.

## Use

```tsx
import { ScrollCinematicHero, ContinueAnchor } from 'scroll-cinematic-hero';

export default function HeroSection() {
  return (
    <ScrollCinematicHero
      frameCount={120}
      basePath="/hero-frames"        // serves /hero-frames/frame_0001.webp ...
      posterSrc="/hero-poster.jpg"   // shown while frames preload + on fallback
      onFrameChange={(i, p) => console.log(`frame ${i} @ ${Math.round(p*100)}%`)}
    >
      <h1>The film begins<br />when you scroll.</h1>
      <ContinueAnchor targetId="below" />
    </ScrollCinematicHero>
  );
}
```

That's it. The component handles tier detection, eager + idle preload, DPR-aware canvas sizing, cover-fit math, vignette + crimson glow overlay, and the bottom scrubber.

---

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frameCount` | `number` | **required** | Total frames in the sequence (1-indexed). |
| `basePath` | `string` | `/hero-frames` | Folder serving the frames. |
| `filePrefix` | `string` | `frame_` | Filename prefix. |
| `padWidth` | `number` | `4` | Zero-pad width. `4` → `frame_0001.webp`. |
| `fileExt` | `'webp' \| 'jpg' \| 'png'` | `webp` | File extension. |
| `posterSrc` | `string` | — | Shown during preload + on fallback tier. |
| `forceTier` | `'full' \| 'mobile' \| 'fallback'` | — | Override tier detection (mainly for tests / storybook). |
| `onFrameChange` | `(idx, progress) => void` | — | Fires whenever the painted frame changes. |
| `onReady` | `() => void` | — | Fires when all eager-preload frames have decoded. |
| `showScrubber` | `boolean` | `true` | Bottom "scroll to play · NN%" bar. |
| `showOverlay` | `boolean` | `true` | Vignette + crimson glow + grain. |
| `className` / `id` | `string` | — | Forwarded to the outer wrapper. |
| `children` | `ReactNode` | — | Foreground content (title, subtitle, CTAs). |

---

## Asset pipeline

The component expects a numbered WebP sequence served as static files. Use the bundled CLI to chop a source video:

```bash
node scripts/extract-frames.mjs \
  --input ./raw/cinema.mp4 \
  --out public/hero-frames/ \
  --fps 30 \
  --width 1440 \
  --height 810 \
  --quality 78 \
  --start 00:00:00 \
  --duration 6
```

Then optionally slim the payload further:

```bash
node scripts/optimize-frames.mjs --dir public/hero-frames/ --quality 68
```

Both scripts shell out to `ffmpeg` and need it on `PATH`.

**Rule of thumb:**
- 6 seconds at 30 fps × 1440 × 810 WebP q=78 ≈ 4.5 MB total. Acceptable for a desktop hero.
- For mobile, halve it: q=65 + every-2nd-frame stride is already applied at runtime.

---

## Performance notes

- **DPR clamp.** Canvas backing store is scaled by `min(devicePixelRatio, tier.maxDpr)` — capped at 2 on desktop, 1.5 on mobile. Past 2 DPR the marginal sharpness is invisible and the GPU cost is real.
- **Eager + idle preload.** The first 10 (or 6) frames decode in parallel before paint. The rest stream in via `requestIdleCallback`, batched 4 at a time, with a `setTimeout` fallback for Safari.
- **Nearest-frame fallback.** If the scroll handler asks for a frame that hasn't decoded yet, we paint the nearest already-loaded frame so you never see a flash of poster.
- **rAF coalesced.** Both scroll and resize are coalesced through `requestAnimationFrame`, so the paint runs at most once per repaint regardless of how the browser fires events.
- **No runtime deps.** Just `react` + `react-dom` as peers.

See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for diagrams.

---

## Development

```bash
npm install
npm run dev       # serves examples/basic at :5173
npm test          # vitest
npm run build:lib # bundles dist/index.{mjs,cjs} + types
```

## License

MIT © 2026 Siddharth Fulia
