# Contributing

Thanks for considering a contribution to `scroll-cinematic-hero`.

## Getting set up

```bash
git clone https://github.com/SiddharthFulia/scroll-cinematic-hero
cd scroll-cinematic-hero
npm install
npm run dev      # examples/basic at http://localhost:5173
npm test         # vitest
npm run lint     # tsc --noEmit
npm run build:lib
```

## Project layout

```
src/
  ScrollCinematicHero.tsx   ← main component
  hooks/                    ← React hooks (tier / loader / scroll / canvas)
  utils/                    ← pure helpers (coverFit, nearestFrame, framePath)
  components/               ← presentational pieces (overlay, scrubber, anchor)
  config/                   ← TIER_CONFIG
  types.ts                  ← all public + internal types
scripts/                    ← ffmpeg CLI wrappers
tests/                      ← vitest
examples/                   ← live demos served by vite
docs/                       ← architecture / performance / migration
```

## Guidelines

- **No runtime deps.** The package must build with only `react` + `react-dom` as peers.
- **Hooks are colocated under `src/hooks/`.** One file per hook.
- **Pure utils live under `src/utils/`** and must be testable without React.
- **Tests must use real assertions** (`expect(x).toBe(y)`), no smoke-only tests.
- **Run `npm run lint && npm test` before opening a PR.**
- **Type changes go in `src/types.ts`** so the public surface stays in one file.

## Commit style

Conventional commits, lower-case subject, present tense.

```
feat: add poster cross-fade on tier upgrade
fix: clamp DPR before resizing canvas backing store
docs: explain idle-callback fallback on Safari
```

## License

By contributing, you agree your contributions are licensed under the MIT license that covers this project.
