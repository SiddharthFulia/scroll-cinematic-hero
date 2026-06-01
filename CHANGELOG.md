# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-01

### Added
- `<ScrollCinematicHero/>` core component with tier-aware render modes.
- `useRenderTier`, `useFrameLoader`, `useScrollProgress`, `useCanvas2D` hooks.
- `coverFit`, `containFit`, `nearestFrame`, `framePath` utilities.
- `CinematicOverlay`, `Scrubber`, `ContinueAnchor` presentational components.
- `extract-frames.mjs` and `optimize-frames.mjs` ffmpeg CLI wrappers.
- vitest test suite covering cover-fit math, nearest-frame fallback,
  scroll-progress hook, and component-level integration.
- Examples: `basic/`, `with-overlay/`, `mobile-tier/`.
- Docs: `ARCHITECTURE.md`, `PERFORMANCE.md`, `MIGRATION.md`.

### Notes
- Initial public release. API is considered unstable until `1.0.0`.
