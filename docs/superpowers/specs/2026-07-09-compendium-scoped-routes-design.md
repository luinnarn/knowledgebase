# Compendium-Scoped Routes — Design

**Date:** 2026-07-09
**Status:** Approved (pending spec review)
**Scope:** Restructure routing so the active compendium (Java / CS / System Design) lives in the URL instead of client-side state, fixing broken shareable/bookmarkable links.

## Problem

Java::Compendium supports three switchable "compendiums." Which one is active today is pure client state: `CompendiumProvider` seeds an `id` from `localStorage` (`jkb-compendium`, defaulting to `java`), and every route (`/topics/:domainId?/:topicId?`, `/graph`, `/classes/:fqcn?`) is compendium-agnostic — the active compendium is inferred from context, never from the URL.

This breaks shareable and bookmarkable links: a link to `/topics/jvm/gc-fundamentals` only resolves correctly if the visiting browser's `localStorage` happens to have `java` selected. On a fresh browser, someone else's browser, or after the visitor last used a different compendium, the same URL either 404s (domain id doesn't exist in the active compendium) or silently opens the wrong content. Confirmed by tracing every route-building call site in the app: 18 sites across 10 files (`Sidebar.tsx`, `GraphView.tsx`, `SearchPalette.tsx`/`searchIndex.ts`, `TopicPage.tsx`, `ClassesPage.tsx`, `RichText.tsx`, `ClassDetail.tsx`, `HomePage.tsx`, `CompendiumProvider.tsx`, `AppShell.tsx`) build paths like `` `/topics/${domainId}/${topicId}` `` with no compendium prefix anywhere.

This surfaced right after fixing a related bug: the browser tab title didn't reflect the active compendium (now fixed separately via a `useEffect` in `AppShell` keyed on `meta.label`).

## Decisions (locked)

- **Approach:** move the compendium into the URL as a path segment (`/java/...`, `/cs/...`, `/system-design/...`) and make the URL the source of truth. Two alternatives were considered and rejected: (a) a "minimal patch" that cross-resolves ambiguous ids across compendiums without touching routes — rejected because it only works by the accident that domain ids don't currently collide across compendiums, and does nothing for id-less routes like `/graph`; (b) a query-param scheme (`?c=cs`) — rejected because it has the same blast radius as a path segment (every internal link still needs updating) while producing uglier, less bookmarkable URLs.
- **Bare `/` becomes a real picker page**, not a redirect. `localStorage` downgrades from "source of truth" to a convenience signal only (e.g. a "continue" affordance on the picker) — it drives no redirects.
- **`CompendiumPicker` is a standalone top-level route**, not wrapped by `AppShell`/`CompendiumProvider` — the shared header (compendium switcher, Topics/Graph/Classes nav, search) presumes an active compendium, which doesn't exist yet on the picker page.
- **Legacy unprefixed URLs get a best-effort redirect**, not a 404, so links shared before this change keep working.

## New route structure

In `App.tsx`:
```
/                                    → CompendiumPicker (standalone, no AppShell/CompendiumProvider)
/:compendiumId                       → AppShell + CompendiumProvider
  /:compendiumId                       → compendium home (today's HomePage content, unchanged)
  /:compendiumId/topics/:domainId?/:topicId?
  /:compendiumId/graph
  /:compendiumId/classes/:fqcn?
/topics/*, /graph, /classes/*        → legacy redirect (see below)
```

`AppShell` and `CompendiumProvider` only wrap the `/:compendiumId/*` subtree, matching how they're actually used — there is no "no compendium selected" state to thread through them.

## Component changes

**`CompendiumProvider.tsx`:** reads the active id from `useParams().compendiumId` instead of `useState` seeded from `localStorage`. If the param isn't a valid id (`compendiumById.has(...)` fails), render `NotFound` — an invalid compendium segment is a real 404, not a soft fallback. `localStorage.setItem` stays (for the picker's convenience affordance) but nothing reads it to decide what content loads.

**Compendium switcher** (`AppShell`'s `CompendiumSwitcher`): `setCompendium(next)` changes from `localStorage.setItem` + `setId` + `navigate('/')` to `navigate(\`/${next}\`)`. The route param change is what drives everything else via the provider re-reading `useParams()`.

**`CompendiumPicker` (new component):** renders one card per `compendiums` entry (`label`, `heroTitle`, `heroLede` — the same data the switcher dropdown already uses), each linking to `/${c.id}`. If `localStorage`'s `jkb-compendium` holds a valid id, that card gets a subtle visual "continue" affordance. Minimal standalone header (brand mark; the existing `ThemeToggle` component can be reused as-is since it has no compendium dependency). No nav, no search — those belong to the compendium-scoped chrome.

**`HomePage.tsx`:** unchanged in content. It moves from being the bare `index` route to being the `/:compendiumId` index route.

**18 call sites:** each already has `useCompendium()` (or an equivalent `id` in scope via props/closure), so every route-building template gains a prefix: `` `/topics/${...}` `` → `` `/${id}/topics/${...}` ``. Mechanical, one line per site. `searchIndex.ts`'s `route:` strings gain the same prefix at build time (the index is already rebuilt per compendium load).

**Legacy redirect:** one catch-all route, matched only when nothing else does. If the first path segment is *not* a valid compendium id (i.e. it's old-style `topics`/`graph`/`classes`), redirect to the same path prefixed with `localStorage`'s last-known compendium id (defaulting to `java`) — best-effort, not guaranteed correct, but strictly better than a dead 404.

## Testing

Three existing test files render `CompendiumProvider` directly with no route param — `AppShell.test.tsx`, `TopicView.test.tsx`, `GraphView.test.tsx`. They work today only because the provider currently reads `localStorage`; once it reads `useParams().compendiumId`, they need a `:compendiumId`-parameterized route ancestor. Add one shared test helper, `src/test-utils.tsx`:

```ts
renderWithCompendium(ui, { compendiumId = 'java', initialPath }?)
```

which wraps `ui` in `MemoryRouter` + a `path=":compendiumId"` route + `CompendiumProvider`, mirroring `App.tsx`'s real nesting. All three files switch to it.

`AppShell.test.tsx` specifically needs its two existing tests (`scrolls to top when navigating to a different route`, `sets the document title to the active compendium`) rewritten against the new route shape (`initialEntries={['/java/topics/a']}` etc., navigating between `topics/a` → `topics/b` under the same `:compendiumId`).

`src/data/integrity.test.ts` is untouched — it iterates `compendiumRegistry` directly, never through routing.

## Out of scope

- Any change to the content model, `compendiums.ts` metadata shape, or the integrity suite.
- SEO/server-rendering considerations — this is a client-only Vite SPA; the URL change is purely for correct client-side linking, not crawlability.
- Preserving sub-path equivalence when switching compendium via the switcher (e.g. staying on "the graph page" when switching from CS to Java) — domain/topic ids aren't comparable across compendiums (existing behavior already resets to compendium root on switch; this design keeps that behavior, just retargeting it to `/${next}` instead of `/`).

## Success criteria

- Any generated link in the app (topic, class, graph panel, search result, prev/next) is self-describing: opening it in a fresh browser with no `localStorage` state resolves to the same content it pointed to when created.
- An invalid compendium segment in the URL 404s instead of silently falling back to a default.
- Old unprefixed links (from before this change) redirect to a working page rather than 404ing outright.
- `npm test` and `npm run build` are green; `AppShell.test.tsx`, `TopicView.test.tsx`, `GraphView.test.tsx` pass against the new route shape via the shared `renderWithCompendium` helper.
