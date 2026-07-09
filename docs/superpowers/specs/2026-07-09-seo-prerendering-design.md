# SEO, Crawlability & Metadata — Design

**Date:** 2026-07-09
**Status:** Approved (pending spec review)
**Scope:** Make Java::Compendium's ~360 routes (topics, class references, domain/compendium indexes, graph views across all 3 compendiums) individually discoverable by search engines, correctly previewed when shared as links, and machine-readable via structured data — without changing the deployed hosting model.

## Problem

Java::Compendium is a pure client-rendered Vite/React SPA deployed as static files to Cloudflare Pages. `index.html` carries one static `<title>` and `<meta description>` for every route in the app, and there is no `robots.txt`, `sitemap.xml`, canonical tag, Open Graph/Twitter metadata, or structured data anywhere in the codebase.

Consequences:
- A crawler or link-unfurler that doesn't execute JavaScript sees the identical generic shell no matter which of the ~360 topic/class/domain URLs it requests — no per-page title, description, or content.
- Even crawlers that do execute JS (Googlebot) have no canonical URLs, sitemap, or structured data to work with, and other engines (Bing, DuckDuckGo, social-media unfurlers) render JS inconsistently or not at all.
- Social shares of any topic link show the same generic card, with no indication of which topic, domain, or compendium was shared.

## Decisions (locked)

- **Full static prerendering (SSG) at build time**, not a meta-tag-only patch and not a runtime dynamic-rendering/cloaking layer. Since all content is fully known at build time (typed data, no auth, no personalization), this is the standard case for SSG: every route gets real, crawlable HTML in addition to correct `<head>` metadata, for every crawler regardless of JS support — with no ongoing runtime cost, since output is still pure static files.
- **Reuse Vite's own SSG recipe** (SSR build of a render entrypoint + a Node script that writes static files) rather than a headless-browser snapshot pipeline (fragile, slow, and risks producing HTML that doesn't match what React would hydrate) or a full SSR framework migration (unnecessary re-architecture for a fully static content set).
- **No Cloudflare Pages configuration changes.** All new build steps are folded into the existing `npm run build` script; output still lands in `./dist`, matching `wrangler.jsonc`'s `pages_build_output_dir`.
- **Route enumeration has exactly one source of truth**: a `getAllRoutes()` function derived from the same typed registries (`compendiumRegistry`, each compendium's `domains`/`topics`/`classes`) that `App.tsx` already routes against. The prerender script, the sitemap generator, and the SSR safety-net test all call this one function — no hand-maintained route list to drift.
- **Legacy unprefixed routes (`/topics/*`, `/graph`, `/classes/*`) are out of scope.** They remain pure client-side redirects for old bookmarks (per the compendium-scoped-routing work); they are not prerendered and not included in the sitemap.
- **OG images are generated per-domain at build time** (32 total: 12 Java + 10 CS + 10 System Design), not per-topic (~230, more build tooling for marginal gain) and not a single site-wide image (cheapest, but every shared link looks identical). Reuses the existing domain accent color and the app's display font, matching the in-app "spine" visual language.
- **No `SearchAction` structured data.** Search is client-side MiniSearch with no crawlable/queryable URL; claiming a `SearchAction` would misrepresent a capability that doesn't exist server-side.
- **No `<lastmod>`/`<changefreq>`/`<priority>` in the sitemap.** These require tracking real modification dates the project doesn't have, and Google has stated it largely ignores them — guessed values would be noise, not signal.

## Architecture

New build entrypoint, `src/entry-server.tsx`:
- `render(url: string): { html: string; head: HeadTags }` — wraps `<App/>` in React Router's `StaticRouter` at `url` and calls `renderToString`.
- `getAllRoutes(): RouteMeta[]` — enumerates every real (non-legacy) route: root picker, each compendium's index, graph, classes list (Java only) and per-class pages, and every topic page, across all 3 compendiums. Each `RouteMeta` carries what's needed to build that route's `<head>`: path, title, description, domainId (for OG image lookup), and a discriminator for which JSON-LD shape to emit.

Build pipeline (all folded into the single `build` script Cloudflare Pages already invokes):

```
tsc -b
vite build                              # client bundle, unchanged
vite build --ssr src/entry-server.tsx   # Node-compatible SSR bundle
node scripts/prerender.mjs              # generate OG images, write per-route dist/<path>/index.html, dist/sitemap.xml
```

`scripts/prerender.mjs` is plain Node ESM: imports the built SSR bundle (already-compiled JS, no TS runtime needed in the script itself), calls `getAllRoutes()`, and for each route:
1. Calls `render(path)` to get the rendered HTML fragment.
2. Builds that route's `<head>` block (title, description, canonical, OG/Twitter tags, JSON-LD) from its `RouteMeta`.
3. Injects both into a copy of the client `dist/index.html` template, preserving the real hashed asset `<script>`/`<link>` tags Vite already emitted there.
4. Writes the result to `dist/<path>/index.html` so Cloudflare Pages serves it verbatim for that exact path; React hydrates on top for real users exactly as today.

Also generates `dist/sitemap.xml` from the same `getAllRoutes()` list, and OG images to `dist/og/<compendium-id>/<domain-id>.png`.

**Known SSR landmines to fix as part of this work:**
- `CompendiumProvider`/`useTheme` currently read `localStorage` unconditionally — need `typeof window !== 'undefined'` guards so the Node render pass doesn't throw.
- Mermaid diagrams (lazy-loaded behind `Suspense`) and the D3 force-graph (driven by `useEffect`) do not render during `renderToString` — expected and acceptable, since neither produces indexable text anyway. The surrounding prose on diagram-heavy topics still prerenders normally.

## Per-route metadata

Built entirely from data already in the typed content model (`Topic.summary`, `JavaClass.summary`/`ClassSummary.summary` — no new authoring work required):

- **Title:** `"{title} · {Domain} · {Compendium}::Compendium"` for topic/class pages; simpler forms for compendium home/graph pages.
- **Meta description:** the topic/class `summary` field, truncated to ~155 characters.
- **Canonical:** `https://referencehub.dev` + the route's own path — every prerendered route is self-canonical, no duplicate-content case exists since legacy routes are excluded from indexing entirely.
- **Open Graph / Twitter:** `og:title`, `og:description`, `og:type=article`, `og:url` (= canonical), `og:image` (the topic/class's domain image), `twitter:card=summary_large_image`.

## Structured data (JSON-LD)

- Topic and class-reference pages → `TechArticle` (headline, description, url, about the domain, isPartOf the compendium).
- Every content page → `BreadcrumbList` reflecting Compendium → Domain → Topic/Class.
- Compendium home pages → `ItemList` of that compendium's domains.
- Root picker page → a plain `WebSite` entry (name + url) only.
- Graph pages get title/description/canonical/OG like any other route, but no `TechArticle` block — there's no article content to describe.

## OG image generation

- Template: domain's own accent color (`Domain.color`) as background/spine treatment + domain title in Space Grotesk + a small compendium wordmark, matching the app's existing in-app "spine" visual signature.
- Built as an SVG string per domain, rasterized to PNG via `resvg-js` (no headless browser needed) as an early step in `scripts/prerender.mjs`, before `<head>` injection (which needs the resulting image paths).
- Every topic/class page's `og:image` resolves via its own `domainId`; compendium home/graph/root pages fall back to that compendium's first domain's image rather than a separate compendium-level template.

## robots.txt

Static file in `public/` (copied as-is by Vite):
```
User-agent: *
Allow: /

Sitemap: https://referencehub.dev/sitemap.xml
```

## Testing

New test alongside the existing `src/data/integrity.test.ts` pattern: calls `getAllRoutes()` and asserts `render(path)` does not throw for every single route. This is the regression guardrail — a future topic or component that unconditionally touches `window`/`localStorage`/other browser-only APIs at first render gets caught by `npm test`, before it ever reaches a build and silently ships a route that falls back to an empty SPA shell in production.

## Out of scope

- Per-topic OG images (32 per-domain images chosen instead — see Decisions).
- Prerendering or indexing legacy unprefixed routes (`/topics/*`, `/graph`, `/classes/*`).
- `SearchAction` structured data (no server-queryable search endpoint exists).
- Sitemap `<lastmod>`/`<changefreq>`/`<priority>` (no reliable modification-date data).
- Any change to Cloudflare Pages project configuration — the existing `npm run build` / `./dist` setup is assumed unchanged.
- Runtime/edge dynamic rendering (bot user-agent sniffing, on-demand SSR) — full build-time prerendering covers the same need with no added infrastructure.

## Success criteria

- Every one of the ~360 canonical routes (compendium homes, graph pages, classes list + per-class pages, every topic page across all 3 compendiums) has its own static HTML with correct, page-specific title, description, canonical URL, OG/Twitter tags, and JSON-LD — verifiable by curling any route path directly (no JS execution) and finding real content and metadata, not the generic shell.
- `dist/sitemap.xml` lists exactly the canonical routes; `dist/robots.txt` points at it.
- `dist/og/<compendium-id>/<domain-id>.png` exists for all 32 domains, and every topic/class page's `og:image` resolves to its own domain's image.
- `npm test` and `npm run build` are green, including the new SSR safety-net test covering every enumerated route.
- No changes required to Cloudflare Pages project settings; the existing `npm run build` → `./dist` deploy continues to work unmodified.
