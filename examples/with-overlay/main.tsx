import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollCinematicHero, CinematicOverlay } from '../../src';

function App() {
  return (
    <ScrollCinematicHero
      frameCount={90}
      basePath="/hero-frames"
      showOverlay={false}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 'clamp(40px, 8vw, 120px)',
            margin: 0,
            color: '#fff',
            letterSpacing: '-0.03em',
            textShadow: '0 12px 60px rgba(0,0,0,0.45)',
          }}
        >
          Crimson Cinema
        </h1>
      </div>
      <CinematicOverlay
        vignetteIntensity={0.95}
        glowIntensity={0.75}
        grainIntensity={0.1}
      />
    </ScrollCinematicHero>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
