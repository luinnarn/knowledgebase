# Java::Compendium

A personal Java knowledge base distilled from eight foundational books into a fast,
searchable reference app — 12 domains, 102 topics, 121 curated JDK class references,
and an interactive knowledge graph tying it all together.

Built with React 19 + TypeScript + Vite. Fully static — no backend.

## Features

- **Topics** — hierarchical browser (domain → topic) with a strong skim-first layout:
  TL;DR summary → key points → deep-dive blocks with syntax-highlighted code,
  pitfall/best-practice callouts, and comparison tables. Effective Java items are
  woven into the topics they belong to.
- **Knowledge Graph** — force-directed map of every topic (d3-force), colored by
  domain, with typed edges (part-of / prerequisite / related), pan/zoom, domain
  filters, and a preview panel that links into the content.
- **Class Reference** — 121 essential JDK classes with declarations, key method
  tables, examples, pitfalls, and links to the official Javadoc.
- **Search** — instant client-side search (MiniSearch) over all topics and classes.
  Press `⌘K` / `Ctrl-K`.
- Light/dark theme, responsive from 360 px to ultrawide, all content lazy-loaded
  per domain.

## Source books

Core Java I & II (Horstmann), Effective Java (Bloch), Java Concurrency in Practice
(Goetz et al.), Learning Java (Loy/Niemeyer/Leuck), Optimizing Java (Evans/Gough/
Newland), Optimizing Cloud Native Java (Evans/Gough), and Java Secrets (Harrison).
The `books/` folder is git-ignored.

## Development

```bash
npm install
npm run dev        # dev server
npm test           # vitest: data-integrity + component suites
npm run build      # type-check + production build
npm run preview    # serve the production build
```

The data-integrity suite (`src/data/integrity.test.ts`) enforces that every graph
edge, topic cross-link (`[[topic-id]]`), book reference, and class relation resolves —
content errors fail the build.

## Structure

```
src/data/domains.ts        12 domains and their topic ids
src/data/graph.ts          knowledge-graph nodes + typed edges
src/data/topics/<domain>   authored topic content (lazy chunks)
src/data/classes/<area>    curated JDK class docs (lazy chunks)
src/components             renderers: TopicView, GraphView, CodeBlock, palette…
src/pages                  Home, Topics, Graph, Classes
scripts/verify-visual.mjs  headless-browser screenshot verification (uses Edge)
```
