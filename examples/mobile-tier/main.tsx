import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollCinematicHero } from '../../src';

function App() {
  return (
    <ScrollCinematicHero
      frameCount={80}
      basePath="/hero-frames"
      forceTier="mobile"
    >
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 'clamp(32px, 9vw, 64px)', margin: 0 }}>
          Mobile tier
        </h1>
        <p style={{ opacity: 0.7, marginTop: 12 }}>
          Every 2nd frame · 200vh runway · capped 1.5 DPR.
        </p>
      </div>
    </ScrollCinematicHero>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
