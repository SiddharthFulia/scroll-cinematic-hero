import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollCinematicHero, ContinueAnchor } from '../../src';

function App() {
  return (
    <>
      <ScrollCinematicHero
        frameCount={120}
        basePath="/hero-frames"
        posterSrc="/hero-poster.jpg"
        onFrameChange={(i, p) => {
          if (i % 20 === 0) console.log(`frame ${i} (${(p * 100).toFixed(0)}%)`);
        }}
      >
        <div>
          <h1>The film begins<br />when you scroll.</h1>
          <p className="sub">
            Drop-in scroll-driven WebP frame sequence. 300vh sticky runway,
            DPR-aware canvas paint, cinematic vignette + crimson glow.
          </p>
        </div>
        <ContinueAnchor targetId="below" />
      </ScrollCinematicHero>

      <section id="below" className="below">
        <h2>What just happened</h2>
        <p>
          You scrolled through a stack of WebP stills painted into a single
          canvas at the native devicePixelRatio of your screen. On a desktop
          we used every frame; on mobile we'd have skipped every other one;
          if you'd asked for reduced motion we'd have shown a poster instead.
        </p>
      </section>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
