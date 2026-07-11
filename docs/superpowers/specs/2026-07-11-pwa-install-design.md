# PWA Installability & Offline Reading — Design

**Date:** 2026-07-11
**Status:** Approved (pending spec review)
**Scope:** Make Java::Compendium installable as a standalone app (manifest + icons) and let previously-visited pages keep working offline, without changing the deployed hosting model or existing SSR/prerender pipeline.

## Problem

The app has no `manifest.webmanifest` and no service worker. Browsers have nothing to offer an "Install app" prompt with, there's no home-screen/app-icon story beyond the browser tab favicon, and there's zero offline behavior — a dropped connection just breaks the page.

## Decisions (locked)

- **Installability + offline reading**, not installability alone. A service worker will cache pages/assets as the user browses so previously-viewed topics keep working with no network.
- **Cache only what's visited** (runtime caching), not a full precache of all ~360+ routes across all 4 compendiums. Nothing is offline until it's been opened once — cheapest in bandwidth/build complexity, appropriate since most users only ever touch a fraction of the site.
- **`vite-plugin-pwa`** (new devDependency) over a hand-rolled `manifest.webmanifest` + `sw.js`. It generates the service worker at build time with automatic cache-busting tied to build hashes and handles the update lifecycle (`autoUpdate`/`clientsClaim`/`skipWaiting`) — avoiding the classic hand-rolled-SW failure mode of users stuck on stale JS/CSS after a deploy.
- **Icons rasterized from the existing `favicon.svg`** via `@resvg/resvg-js` (already a devDependency, already used for OG image generation in `scripts/prerender.mjs`) — no new image-processing dependency.
- **No SPA navigate-fallback.** Every route already gets its own real prerendered HTML file from the existing SSR pipeline, so there's no single-`index.html`-serves-everything case to fall back to. An uncached route visited offline shows the browser's normal offline error — acceptable given the "only visited pages" scope.

## Manifest & icons

New `public/manifest.webmanifest`:
- `name: "Java::Compendium"`, `short_name: "Compendium"`
- `description`: same copy as `index.html`'s `<meta name="description">`
- `display: "standalone"`, `start_url: "/"`, `scope: "/"`
- `theme_color` / `background_color`: `#0e1116` (the favicon's dark background)
- `icons`: 192, 512, and a maskable 512 entry (see below)

New `scripts/generate-pwa-icons.mjs` (same `resvg-js` rasterization approach as the existing OG-image step), producing into `public/icons/`:
- `icon-192.png`, `icon-512.png` — the favicon's `::` glyph rasterized as-is
- `icon-maskable-512.png` — the same glyph redrawn centered inside Android's ~80% safe-zone circle (the stock favicon SVG is edge-to-edge and would get clipped by a circular/rounded mask), with `"purpose": "maskable"` in the manifest entry
- `apple-touch-icon.png` (180×180, opaque background — iOS applies its own mask/corners and ignores transparency)

`index.html` head additions (applied once; every prerendered route inherits it since `scripts/prerender.mjs` clones this same file as its template):
- `<link rel="manifest" href="/manifest.webmanifest">`
- `<meta name="theme-color" content="#0e1116">`
- `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`

## Service worker (`vite-plugin-pwa`, `generateSW` strategy)

- **Precache** (downloaded on install): only hashed static assets under `assets/` (JS/CSS/fonts/icons) via a narrow `globPatterns`. Explicitly excludes HTML — no page content is force-downloaded, matching the "only visited pages" decision.
- **Runtime caching** (populates as the user browses):
  - Navigation requests (HTML documents): `NetworkFirst` — tries the network first so content edits are seen immediately by returning visitors; falls back to the cache only when offline. This is what makes a previously-visited topic/class/graph page work offline.
  - Images (SVG/PNG, including OG images): `StaleWhileRevalidate`.
- `navigateFallback: null` (see Decisions above).
- `registerType: 'autoUpdate'`, `clientsClaim: true`, `skipWaiting: true` so open tabs pick up new deploys instead of running stale cached assets indefinitely.
- Registration: `injectRegister: 'auto'` — the plugin injects its own small registration script into the built `index.html`'s `<head>`, no manual `main.tsx` changes needed.

## Build integration

Icon PNGs are **generated once by a standalone script and committed** to `public/icons/`, exactly like the existing hand-authored `public/favicon.svg` — not regenerated on every build. This matters because `vite-plugin-pwa`'s Workbox `generateSW` step scans the build output for files to reference/precache as part of the ordinary client `vite build`, so the icon files need to already exist as ordinary static assets under `public/` (copied verbatim by Vite like `favicon.svg`/`robots.txt` today), not be produced by a later pipeline stage. Since the icon design is a fixed brand asset (not data-driven like the per-domain OG images), a one-off generation script is simpler and avoids coupling icon generation to build timing.

`vite-plugin-pwa` itself runs as part of the existing client `vite build` step (first line of the `build` script), emitting `dist/sw.js`, `dist/manifest.webmanifest`, the workbox precache manifest, and its registration `<script>`/`<link>` tags into `dist/index.html` — all of which happen *before* `scripts/prerender.mjs` reads `dist/index.html` as its per-route template. No changes needed to the prerender script itself; every prerendered route inherits the same head tags automatically, exactly like the existing OG/canonical metadata does today.

```
node scripts/generate-pwa-icons.mjs     # one-off / re-run only if the icon design changes; output is committed
tsc -b
vite build                              # client bundle + vite-plugin-pwa output (sw.js, manifest, head tags)
vite build --ssr src/entry-server.tsx   # unchanged
node scripts/prerender.mjs              # unchanged — still clones dist/index.html as template
```

## Testing / verification

- `npm run build` succeeds; `dist/sw.js`, `dist/manifest.webmanifest`, and `dist/icons/*.png` all exist, and `dist/index.html` (and a sampled prerendered route under it, e.g. `dist/java/index.html`) contains the manifest link, theme-color meta, and SW registration script.
- Manual/visual check via the existing Edge/puppeteer visual-verification pipeline (`scripts/verify-visual.mjs` pattern) or manual devtools: confirm the service worker registers, the manifest is picked up (Application panel / Lighthouse installability check), then simulate offline and confirm a previously-visited page still renders while an unvisited one shows the browser's offline error as expected.

## Out of scope

- Precaching all routes across all 4 compendiums for full offline coverage.
- A custom offline fallback page for uncached routes.
- Push notifications, background sync, or any other service-worker capability beyond install + cached-navigation/asset serving.
- Any change to Cloudflare Pages project configuration — `npm run build` → `./dist` stays the deploy contract.

## Success criteria

- Chrome/Edge show an install prompt (or the manual "Install app" menu entry) for the site, and installing launches it in a standalone window using the generated icon.
- A topic page visited once while online still renders when the network is subsequently disabled; a topic page never visited does not.
- A fresh deploy's JS/CSS is picked up by already-open tabs without requiring a hard refresh (no stale-asset lock-in).
- `npm test` and `npm run build` remain green.
