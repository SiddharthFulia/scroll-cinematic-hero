import * as React from 'react';

interface ContinueAnchorProps {
  targetId?: string;
  label?: string;
}

export function ContinueAnchor({
  targetId = 'below',
  label = 'Continue',
}: ContinueAnchorProps) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(targetId);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 80,
        transform: 'translateX(-50%)',
        padding: '10px 22px',
        borderRadius: 999,
        background: 'rgba(10,10,14,0.55)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.16)',
        color: 'rgba(255,255,255,0.92)',
        fontSize: 13,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        zIndex: 4,
      }}
    >
      {label} <span aria-hidden="true">↓</span>
    </a>
  );
}

export default ContinueAnchor;
