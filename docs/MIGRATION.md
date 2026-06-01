# Migration: from a raw `<img>` sequence to `<ScrollCinematicHero/>`

If you already ship a scroll-driven sequence using a stack of `<img>` tags whose `opacity` you flip with `IntersectionObserver`, switching to this component is a four-step replacement.

## Before

```tsx
function OldHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const rect = ref.current!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height - window.innerHeight)));
      setIdx(Math.max(1, Math.round(p * 120)));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <img
            key={i}
            src={`/hero-frames/frame_${String(i + 1).padStart(4, '0')}.webp`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i + 1 === idx ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## After

```tsx
import { ScrollCinematicHero } from 'scroll-cinematic-hero';

function NewHero() {
  return <ScrollCinematicHero frameCount={120} basePath="/hero-frames" />;
}
```

## What you gain

- **One canvas instead of N `<img>` elements.** No layout thrash from 120 layers.
- **Eager + idle preload.** Frames stream in without blocking the main thread.
- **rAF coalesced scroll handler.** Old code fires `setIdx` on every scroll event; this fires it at most once per repaint.
- **DPR-aware paint.** Avoids the blurry frames you get from `<img>` + `object-fit: cover` on retina.
- **Auto tier detection.** Old code shows 120 frames to every visitor; new code degrades to 60 on mobile and a poster on `prefers-reduced-motion`.

## What you lose

- Direct DOM access per frame. If you were doing per-frame DOM tricks (e.g. animating overlays bound to a specific `<img>`), use the `onFrameChange` callback instead.

## Asset paths stay the same

If your old setup already lives at `/hero-frames/frame_0001.webp ... /hero-frames/frame_0120.webp`, you can swap the component in without moving any files.
