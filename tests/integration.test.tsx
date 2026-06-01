import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollCinematicHero } from '../src/ScrollCinematicHero';
import { framePath } from '../src/utils/framePath';

describe('<ScrollCinematicHero/> integration', () => {
  it('renders the children inside the sticky stage', () => {
    render(
      <ScrollCinematicHero frameCount={8} forceTier="full">
        <h1 data-testid="hero-title">Cinematic Hero</h1>
      </ScrollCinematicHero>,
    );
    expect(screen.getByTestId('hero-title')).toBeInTheDocument();
  });

  it('exposes its detected tier as a data attribute', () => {
    const { container } = render(
      <ScrollCinematicHero frameCount={4} forceTier="mobile">
        <span>x</span>
      </ScrollCinematicHero>,
    );
    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeTruthy();
    expect(section.getAttribute('data-tier')).toBe('mobile');
  });

  it('on the fallback tier, paints a poster instead of a canvas', () => {
    const { container } = render(
      <ScrollCinematicHero
        frameCount={4}
        forceTier="fallback"
        posterSrc="/poster.jpg"
      >
        <span>x</span>
      </ScrollCinematicHero>,
    );
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('img[src="/poster.jpg"]')).toBeTruthy();
  });

  it('paints a canvas on the full tier', () => {
    const { container } = render(
      <ScrollCinematicHero frameCount={4} forceTier="full">
        <span>x</span>
      </ScrollCinematicHero>,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('rejects a non-positive frameCount loudly', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        // @ts-expect-error testing invalid input (string instead of number)
        <ScrollCinematicHero frameCount={'0'}>
          <span>x</span>
        </ScrollCinematicHero>,
      ),
    ).toThrow(/frameCount/);
    spy.mockRestore();
  });
});

describe('framePath helper (used by frames + scripts)', () => {
  it('formats indices with the requested padding', () => {
    expect(
      framePath({
        basePath: '/hero-frames',
        filePrefix: 'frame_',
        padWidth: 4,
        fileExt: 'webp',
        index: 7,
      }),
    ).toBe('/hero-frames/frame_0007.webp');
  });

  it('strips a trailing slash on basePath', () => {
    expect(
      framePath({
        basePath: '/hero-frames/',
        filePrefix: 'shot-',
        padWidth: 3,
        fileExt: 'jpg',
        index: 42,
      }),
    ).toBe('/hero-frames/shot-042.jpg');
  });

  it('throws on bad indices', () => {
    expect(() =>
      framePath({
        basePath: '/x',
        filePrefix: 'f',
        padWidth: 4,
        fileExt: 'webp',
        index: 0,
      }),
    ).toThrow();
  });
});
