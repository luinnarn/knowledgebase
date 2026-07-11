# Compendium

A personal knowledge base distilled from foundational books and docs into a fast,
searchable reference app — six cross-linked compendiums (**Java**, **JS/TS**, **CS**,
**System Design**, **AI/ML**, **Databases**), each with its own domains, topics, and knowledge graph.
Java additionally has a curated JDK class reference.

| Compendium    | Domains | Topics | Notes                  |
|---------------|--------:|-------:|-------------------------|
| Java          |      12 |    102 | + 130 JDK class references |
| CS            |      10 |     71 |                          |
| System Design |      11 |     65 |                          |
| JS/TS         |       7 |     55 |                          |
| AI/ML         |       7 |     37 |                          |
| Databases     |      12 |    110 | Five-dialect SQL examples |

Built with React 19 + TypeScript + Vite. Fully static — no backend: routes are
prerendered at build time (with per-route `<head>` metadata, JSON-LD, and generated
OG images) and hydrate on load.

## Features

- **Compendium switcher** — pick a compendium from the landing page or the brand
  switcher; each has its own routes, domains, and knowledge graph.
- **Topics** — hierarchical browser (domain → topic) with a strong skim-first layout:
  TL;DR summary → key points → deep-dive blocks with syntax-highlighted code,
  pitfall/best-practice callouts, and comparison tables.
- **Knowledge Graph** — force-directed map of every topic (d3-force), colored by
  domain, with typed edges (part-of / prerequisite / related), pan/zoom, domain
  filters, and a preview panel that links into the content.
- **Class Reference** (Java) — 130 essential JDK classes with declarations, key
  method tables, examples, pitfalls, and links to the official Javadoc.
- **Relational Databases** — 12 domains and 110 topics covering relational theory,
  modeling, SQL, transactions, performance, internals, application integration,
  operations, portability, and PostgreSQL in practice. Dialect-aware examples
  compare PostgreSQL, MySQL, SQLite, SQL Server, and Oracle where the difference
  affects correctness or design.
- **Search** — instant client-side search (MiniSearch) over all topics and classes.
  Press `⌘K` / `Ctrl-K`.
- **SEO** — every route is prerendered to static HTML with real content, a sitemap,
  robots.txt, and per-domain OG images, so it's fully crawlable without JS.
- Light/dark theme, responsive from 360 px to ultrawide, all content lazy-loaded
  per domain.

## Sources

Each compendium's sources (books and, for JS/TS and AI/ML, official docs/papers)
are listed in its own `books.ts` file: `src/data/books.ts` (Java), `src/data/cs/books.ts`,
`src/data/system-design/books.ts`, `src/data/js-ts/books.ts`, `src/data/ai-ml/books.ts`,
and `src/data/databases/books.ts`.
The Java compendium draws from Core Java I & II (Horstmann), Effective Java (Bloch),
Java Concurrency in Practice (Goetz et al.), Learning Java (Loy/Niemeyer/Leuck),
Optimizing Java (Evans/Gough/Newland), Optimizing Cloud Native Java (Evans/Gough), and
Java Secrets (Harrison). The relational-databases collection includes eight core
books plus primary papers and current documentation for the five compared SQL
dialects. Local source copies under `books/` are git-ignored.

## Development

```bash
npm install
npm run dev        # dev server
npm test           # vitest: data-integrity + component suites
npm run build      # type-check + client/SSR build + prerender (dist/)
npm run preview    # serve the production build
```

The data-integrity suite (`src/data/integrity.test.ts`) enforces that every graph
edge, topic cross-link (`[[topic-id]]`), book reference, and class relation resolves —
content errors fail the build.

## Structure

```
src/data/compendiums.ts        compendium metadata (id, label, hero copy)
src/data/registry.ts           binds each compendium's domains/topics/graph/books
src/data/domains.ts             Java: 12 domains and their topic ids
src/data/topics/<domain>       Java: authored topic content (lazy chunks)
src/data/classes/<area>        Java: curated JDK class docs (lazy chunks)
src/data/cs/…                  CS: domains, topics, graph, books
src/data/system-design/…       System Design: domains, topics, graph, books
src/data/js-ts/…               JS/TS: domains, topics, graph, books
src/data/ai-ml/…               AI/ML: domains, topics, graph, books
src/data/databases/…           Databases: domains, topics, graph, books
src/entry-server.tsx           SSR entry used for prerendering
src/seo/                       per-route <head>/JSON-LD builder, OG image render, route enumerator
src/components                 renderers: TopicView, GraphView, CodeBlock, palette…
src/pages                      CompendiumPicker, Home, Topics, Graph, Classes
scripts/prerender.mjs          build-time prerender + sitemap.xml generation
scripts/verify-visual.mjs      headless-browser screenshot verification (uses Edge)
```
