import * as React from 'react';

interface CinematicOverlayProps {
  vignetteIntensity?: number;
  glowIntensity?: number;
  grainIntensity?: number;
}

export function CinematicOverlay({
  vignetteIntensity = 0.85,
  glowIntensity = 0.55,
  grainIntensity = 0.06,
}: CinematicOverlayProps) {
  const noiseSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
         <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)' opacity='1'/>
     </svg>`,
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, rgba(220,38,38,${glowIntensity}) 0%, rgba(220,38,38,0) 38%)`,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml;utf8,${noiseSvg}")`,
          opacity: grainIntensity,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}

export default CinematicOverlay;
