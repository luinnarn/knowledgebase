# PWA Installability & Offline Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Java::Compendium installable as a standalone app (browser install prompt + home-screen icon) and let previously-visited pages keep working with no network, without touching the existing SSR/prerender pipeline or Cloudflare Pages deploy contract.

**Architecture:** Static PWA icon PNGs are generated once (via `@resvg/resvg-js`, already a devDependency) and committed to `public/icons/`, exactly like the existing hand-authored `public/favicon.svg`. `vite-plugin-pwa` is added and configured to emit a web app manifest, inject `<link rel="manifest">` and a service-worker registration script into the built `index.html` (which every prerendered route already inherits, since `scripts/prerender.mjs` clones that same file as its per-route template), and generate a Workbox service worker that precaches only the hashed JS/CSS/font bundle and runtime-caches pages/images as the user visits them.

**Tech Stack:** Vite 8, `vite-plugin-pwa` (Workbox `generateSW` strategy), `@resvg/resvg-js` (icon rasterization), Puppeteer-core + Microsoft Edge headless (E2E verification, matching the project's existing `scripts/verify-visual.mjs` pattern).

## Global Constraints

- No changes to Cloudflare Pages project configuration — `npm run build` must still output everything Wrangler needs into `./dist`.
- Cache only what's visited: no precaching of page HTML, no "precache every route" behavior, no custom offline-fallback page for uncached routes.
- `vite-plugin-pwa` must be `^1.3.0` or later (confirmed compatible with this project's `vite@^8.1.1` via its `peerDependencies`).
- Icons are generated once by a standalone script and committed as static PNGs (like `favicon.svg`) — not regenerated on every build.
- `theme_color`/`background_color`: `#0e1116` (the favicon's dark background). Accent color for icon glyphs: `#6499ff` (the favicon's `::` glyph color).

---

### Task 1: Generate and commit PWA icon assets

**Files:**
- Create: `scripts/generate-pwa-icons.mjs`
- Create (generated output, committed): `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`, `public/icons/apple-touch-icon.png`

**Interfaces:**
- Produces: four PNG files under `public/icons/` that Task 2's manifest config and `index.html` edits reference by exact path (`/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-maskable-512.png`, `/icons/apple-touch-icon.png`).

- [ ] **Step 1: Write the icon-generation script**

```js
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(ROOT, '..', 'public', 'icons')

const BG = '#0e1116'
const ACCENT = '#6499ff'

// Mirrors public/favicon.svg's proportions (a rounded dark square with a centered "::" glyph).
// The maskable variant drops the corner radius (the OS applies its own mask shape) and shrinks
// the glyph so it sits inside Android's ~80%-diameter safe-zone circle instead of being clipped.
function iconSvg(size, maskable) {
  const cornerRadius = maskable ? 0 : size * (7 / 32)
  const fontSize = maskable ? size * (150 / 512) : size * (14 / 32)
  const x = size / 2
  const y = size / 2 + fontSize * 0.35
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BG}"/>
  <text x="${x}" y="${y}" font-family="ui-monospace,monospace" font-size="${fontSize}" font-weight="700" fill="${ACCENT}" text-anchor="middle">::</text>
</svg>`
}

const specs = [
  { fileName: 'icon-192.png', size: 192, maskable: false },
  { fileName: 'icon-512.png', size: 512, maskable: false },
  { fileName: 'icon-maskable-512.png', size: 512, maskable: true },
  { fileName: 'apple-touch-icon.png', size: 180, maskable: false },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  for (const spec of specs) {
    const svg = iconSvg(spec.size, spec.maskable)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: spec.size } })
    const png = resvg.render().asPng()
    await writeFile(path.join(OUT_DIR, spec.fileName), png)
    console.log('wrote', spec.fileName)
  }
}

main()
```

- [ ] **Step 2: Run the script**

Run: `node scripts/generate-pwa-icons.mjs`
Expected:
```
wrote icon-192.png
wrote icon-512.png
wrote icon-maskable-512.png
wrote apple-touch-icon.png
```

- [ ] **Step 3: Verify the output files are valid PNGs of the right dimensions**

Run: `file public/icons/*.png`
Expected (sizes matching each spec exactly):
```
public/icons/apple-touch-icon.png:     PNG image data, 180 x 180, ...
public/icons/icon-192.png:             PNG image data, 192 x 192, ...
public/icons/icon-512.png:             PNG image data, 512 x 512, ...
public/icons/icon-maskable-512.png:    PNG image data, 512 x 512, ...
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-pwa-icons.mjs public/icons
git commit -m "feat: generate PWA icon assets from the app's favicon glyph"
```

---

### Task 2: Add and configure vite-plugin-pwa

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm install`)
- Modify: `vite.config.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: the four icon paths produced by Task 1 (`/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-maskable-512.png`, `/icons/apple-touch-icon.png`).
- Produces: at build time, `dist/sw.js`, `dist/manifest.webmanifest`, and a `<link rel="manifest">` + service-worker registration `<script>` injected into `dist/index.html` (and therefore into every prerendered route's HTML, since `scripts/prerender.mjs` clones that file as its template). Task 3 depends on all of these existing and being reachable at runtime.

- [ ] **Step 1: Install the dependency**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Configure the plugin in `vite.config.ts`**

Replace the full file with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Java::Compendium',
        short_name: 'Compendium',
        description:
          'A cross-linked knowledge base spanning Java, JavaScript/TypeScript, computer science, system design, and AI/ML — distilled from foundational books into topics, knowledge graphs, and class references.',
        theme_color: '#0e1116',
        background_color: '#0e1116',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the hashed JS/CSS/font bundle is precached on install. Page HTML is deliberately
        // excluded, and navigateFallback is left unset (its default), so nothing is downloaded
        // offline-ready until a page has actually been visited (see runtimeCaching below) — every
        // route already has its own real prerendered HTML file, so there's no single app-shell to
        // fall back to and no reason to force-download the whole site upfront.
        globPatterns: ['assets/**/*.{js,css,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images' },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 3: Add the head tags vite-plugin-pwa does *not* auto-inject**

The plugin injects `<link rel="manifest">` and the SW registration script itself, but not `theme-color` or Apple's touch-icon tags — those need to be added by hand. In `index.html`, add these three lines right after the existing `<meta name="description" ...>` line:

```html
    <meta name="description" content="A cross-linked knowledge base spanning Java, JavaScript/TypeScript, computer science, system design, and AI/ML — distilled from foundational books into topics, knowledge graphs, and class references." />
    <meta name="theme-color" content="#0e1116" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
```

- [ ] **Step 4: Build and verify the generated PWA files**

Run: `npm run build`
Expected: build completes successfully (no new errors from `tsc -b`, `vite build`, the SSR build, or `scripts/prerender.mjs`).

Run: `test -f dist/sw.js && test -f dist/manifest.webmanifest && echo "both present"`
Expected: `both present`

- [ ] **Step 5: Verify the manifest contents**

Run: `cat dist/manifest.webmanifest`
Expected: valid JSON containing `"name":"Java::Compendium"`, `"display":"standalone"`, `"start_url":"/"`, and an `icons` array with 3 entries whose `src` values match `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-maskable-512.png` (one marked `"purpose":"maskable"`).

- [ ] **Step 6: Verify head tags landed on both the root template and a prerendered nested route**

Run:
```bash
grep -o '<link rel="manifest"[^>]*>' dist/index.html
grep -o '<meta name="theme-color"[^>]*>' dist/index.html
grep -o '<link rel="apple-touch-icon"[^>]*>' dist/index.html
grep -o '<link rel="manifest"[^>]*>' dist/java/index.html
```
Expected: each `grep` prints exactly one matching tag — the last one (checking `dist/java/index.html`, a real prerendered route) confirms the tags survived the prerender template-cloning step, not just the pre-prerender `dist/index.html`.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all existing tests still pass (no regressions from the `vite.config.ts`/`index.html` changes).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts index.html
git commit -m "feat: add web app manifest and service worker via vite-plugin-pwa"
```

---

### Task 3: End-to-end verification of installability and offline reading

**Files:**
- Create: `scripts/verify-pwa.mjs`

**Interfaces:**
- Consumes: `dist/manifest.webmanifest`, `dist/sw.js`, and the running `vite preview` server from Task 2's build output — no code interfaces, this is a black-box browser check, mirroring the existing `scripts/verify-visual.mjs` pattern (Puppeteer-core + headless Microsoft Edge against `npx vite preview --port 4173`).

- [ ] **Step 1: Write the verification script**

```js
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (err) => errors.push(err.message))

// 1. Manifest is reachable and well-formed.
await page.goto(`${BASE}/java/`, { waitUntil: 'networkidle0' })
const manifest = await page.evaluate(() => fetch('/manifest.webmanifest').then((r) => r.json()))
console.log('manifest name:', manifest.name)
console.log('manifest icons:', manifest.icons.map((i) => i.sizes).join(', '))
if (manifest.display !== 'standalone') throw new Error('manifest.display is not "standalone"')

// 2. Service worker registers, then reload so it takes control of the page.
await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), { timeout: 15000 })
await page.reload({ waitUntil: 'networkidle0' })
const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
console.log('service worker controls the page:', controlled)
if (!controlled) throw new Error('service worker did not take control after reload')

// 3. Visit a topic page online so it enters the runtime "pages" cache.
const visitedPath = '/java/topics/generics/wildcards-pecs'
await page.goto(BASE + visitedPath, { waitUntil: 'networkidle0' })
const visitedHeading = await page.$eval('h1', (el) => el.textContent)
console.log('visited page heading (online):', visitedHeading)

// 4. Go offline. The visited page should still render from cache.
await page.setOfflineMode(true)
await page.reload({ waitUntil: 'networkidle0' })
const offlineHeading = await page.$eval('h1', (el) => el.textContent)
console.log('visited page heading (offline):', offlineHeading)
if (offlineHeading !== visitedHeading) {
  throw new Error('offline reload of a previously-visited page did not match its online content')
}

// 5. A never-visited page should NOT be servable offline.
const unvisitedPath = '/java/topics/jvm/gc-fundamentals'
let unvisitedFailedOffline = false
try {
  const response = await page.goto(BASE + unvisitedPath, { waitUntil: 'networkidle0' })
  unvisitedFailedOffline = !response || !response.ok()
} catch {
  unvisitedFailedOffline = true
}
console.log('unvisited page correctly unavailable offline:', unvisitedFailedOffline)
if (!unvisitedFailedOffline) throw new Error('an unvisited page unexpectedly loaded while offline')

await page.setOfflineMode(false)
console.log('page errors:', errors.length ? errors : 'none')
await browser.close()
```

- [ ] **Step 2: Run the full build and start a preview server in the background**

Run: `npm run build`
Expected: succeeds (same as Task 2 Step 4).

Run (background): `npx vite preview --port 4173`
Expected: logs a line containing `http://localhost:4173/`.

- [ ] **Step 3: Run the verification script against the running preview server**

Run: `node scripts/verify-pwa.mjs`
Expected output (values may vary slightly but every line below must appear with these truthy/matching results):
```
manifest name: Java::Compendium
manifest icons: 192x192, 512x512, 512x512
service worker controls the page: true
visited page heading (online): Wildcards & PECS
visited page heading (offline): Wildcards & PECS
unvisited page correctly unavailable offline: true
page errors: none
```

- [ ] **Step 4: Stop the preview server**

Stop the background `vite preview` process started in Step 2.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-pwa.mjs
git commit -m "test: add end-to-end PWA installability/offline verification script"
```
