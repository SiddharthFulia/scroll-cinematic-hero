import * as React from 'react';

interface ScrubberProps {
  progress: number;
  loading?: boolean;
  label?: string;
}

export function Scrubber({ progress, loading = false, label }: ScrubberProps) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const text = label ?? (loading ? 'Loading frames…' : `Scroll to play · ${pct}%`);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <span
        style={{
          color: 'rgba(255,255,255,0.78)',
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {text}
      </span>
      <div
        style={{
          width: 220,
          height: 2,
          background: 'rgba(255,255,255,0.18)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background:
              'linear-gradient(90deg, #f59e0b 0%, #f43f5e 55%, #d946ef 100%)',
            transition: loading ? 'none' : 'width 80ms linear',
          }}
        />
      </div>
    </div>
  );
}

export default Scrubber;
