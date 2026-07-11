# Java::Compendium

A fast, searchable reference app spanning six compendiums: Java, JavaScript and
TypeScript, computer science, system design, AI/ML, and relational databases.
Each compendium organizes its material into connected domains, topics, sources,
and an interactive knowledge graph.

Built with React 19 + TypeScript + Vite. Fully static — no backend.

## Features

- **Topics** — hierarchical browser (domain → topic) with a strong skim-first layout:
  TL;DR summary → key points → deep-dive blocks with syntax-highlighted code,
  pitfall/best-practice callouts, and comparison tables. Effective Java items are
  woven into the topics they belong to.
- **Knowledge Graph** — force-directed map of every topic (d3-force), colored by
  domain, with typed edges (part-of / prerequisite / related), pan/zoom, domain
  filters, and a preview panel that links into the content.
- **Class Reference** — 130 essential JDK classes with declarations, key method
  tables, examples, pitfalls, and links to the official Javadoc. This reference
  remains specific to the Java compendium.
- **Relational Databases** — 12 domains and 110 topics covering relational theory,
  modeling, SQL, transactions, performance, internals, application integration,
  operations, portability, and PostgreSQL in practice. Dialect-aware examples
  compare PostgreSQL, MySQL, SQLite, SQL Server, and Oracle where the difference
  affects correctness or design.
- **Search** — instant client-side search (MiniSearch) over all topics and classes.
  Press `⌘K` / `Ctrl-K`.
- Light/dark theme, responsive from 360 px to ultrawide, all content lazy-loaded
  per domain.

## Sources

Each compendium synthesizes its own curated books, papers, standards, courses, and
official documentation. The relational-databases collection includes eight core
books plus primary papers and current documentation for the five compared SQL
dialects. Local source copies under `books/` are git-ignored.

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
src/data/registry.ts             compendium data bindings
src/data/<compendium>/domains.ts domain and topic plans
src/data/<compendium>/graph.ts   knowledge-graph nodes + typed edges
src/data/<compendium>/topics/    authored topic content (lazy chunks)
src/data/classes/                Java-specific JDK class docs (lazy chunks)
src/components                   shared topic, graph, code, and search renderers
src/pages                        shared compendium-aware pages
scripts/prerender.mjs            static route and sitemap generation
```
