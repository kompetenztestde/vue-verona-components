# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vue 3 component library for hosting [Verona](https://verona-interfaces.github.io/) players (the iframe-based assessment-unit player interface). The README is still the unmodified Vite template and says nothing about the project.

## Commands

- `npm run dev` — Vite dev server running the demo app (`index.html` → `src/main.ts` → `src/App.vue`)
- `npm run build` — `vue-tsc -b` (type check) followed by `vite build` in library mode
- `npx vue-tsc -b` — type check only
- `npm run format` — Prettier over `src/` (4 spaces, single quotes, 100 columns)
- `npm run lint` — ESLint over the whole repo (flat config in `eslint.config.ts`); `npm run lint:fix` applies autofixes. CI (`.github/workflows/lint.yml`) runs it with `--max-warnings 0`
- `npm run test:e2e` — Playwright e2e tests in `e2e/` against the demo app (Chromium, Firefox). Playwright starts the Vite dev server itself on port 5173, or reuses one that is already running. Single test: `npx playwright test e2e/verona-display.spec.ts --project=chromium`
- `npm run test:e2e:ui` — the same in Playwright's UI mode

There are no unit tests. ESLint only covers code quality; formatting rules are switched off in favour of Prettier. `noUnusedLocals` and `noUnusedParameters` are on, so unused code fails the build. `e2e/` and `playwright.config.ts` are type checked by `vue-tsc -b` through `tsconfig.e2e.json`, `vite.config.ts` and `eslint.config.ts` through `tsconfig.node.json`.

## Architecture

The repo has two entry points that share `src/components/`:

- **Library** — `src/index.ts` exports the public components. `vite.config.ts` builds it in lib mode with `vue` externalised. Anything a consumer should be able to import must be re-exported here. That includes the types used in props and emits (from `src/types/verona.ts`). `unplugin-dts` emits declaration files to `dist/` during `vite build`; `package.json` points `types`/`exports` at them.
- **Demo app** — `src/App.vue` is only a dev playground. It imports a sample player and unit from `src/assets/` with `?raw` and passes them to the component as strings. Every emit it receives from the component is shown in an "Emitted events" log panel next to the player. These assets are fixtures, not part of the library.

### VeronaDisplay and the Verona protocol

`VeronaDisplay.vue` is the host side of the Verona player interface. The player is a self-contained HTML document that runs in an iframe and talks to the host only through `postMessage`:

1. The `player` prop is the player's **HTML source as a string** (not a URL); it is assigned to the iframe's `srcdoc`.
2. The player posts `vopReadyNotification`. The host answers with `vopStartCommand`, carrying a fresh `sessionId`, the `unitDefinition` string, the `playerConfig` and optionally a saved unit state.
3. Subsequent player messages (`vopStateChangedNotification`, `vopUnitNavigationRequestedNotification`, `vopWindowFocusChangedNotification`, `vopRuntimeErrorNotification`) are translated into Vue emits (`stateChanged`, `navigationRequested`, `focusChanged`, `runtimeError`).

Prop changes are escalated by how much has to be reloaded: a new `player` reloads the iframe, a new `unitDefinition` only re-sends `vopStartCommand` (new session, same player), and a new `playerConfig` only sends `vopPlayerConfigChangedNotification`.

`src/types/verona.ts` mirrors the Verona message spec. Messages are grouped into two discriminated unions on `type`: `VeronaPlayerSendMessage` (player → host) and `VeronaPlayerReceiveMessage` (host → player). When adding support for a message, add its type to the matching union and handle it in the `switch` in `handlePlayerMessage`; unknown types are logged as errors, so unhandled union members (currently `vopWidgetCall`) show up in the console.

## Gotchas

- The `@/*` → `src/*` alias exists only in the tsconfigs, not in `vite.config.ts`. It works for `import type` (erased before bundling); a runtime import through `@/` needs a Vite alias first.
- Props in `VeronaDisplay` use reactive props destructuring, so `player`, `unitDefinition` etc. are compiler-rewritten to `props.x` accesses, not plain locals.
