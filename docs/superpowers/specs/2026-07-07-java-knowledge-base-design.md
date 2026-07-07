# Java Knowledge Base App — Design Spec

**Date:** 2026-07-07
**Status:** Approved by user (interactive Q&A, 2026-07-07)

## Purpose

A personal study/reference web app distilling eight Java books into one navigable,
searchable knowledge base, optimized for fast lookup and deep-diving. Source books
(in `books/`, excluded from git):

1. Core Java, Volume I — Horstmann
2. Core Java, Volume II: Advanced Features — Horstmann
3. Effective Java (3rd ed.) — Bloch
4. Java Concurrency in Practice — Goetz et al.
5. Learning Java — Loy, Niemeyer, Leuck
6. Optimizing Java — Evans, Gough, Newland
7. Optimizing Cloud Native Java — Evans, Gough
8. Java Secrets: High Performance and Scalability — Harrison

## User decisions

- **Knowledge graph:** interactive in-app feature (clickable graph page), and it also
  drives the section hierarchy.
- **Class reference:** curated ~100–150 key JDK classes with rich detail (purpose, key
  method signatures, examples, pitfalls, official Javadoc links). Supplement from Oracle
  documentation where books are thin.
- **Primary use case:** personal study/reference — fast lookup, skim-then-drill-down.
- **Content architecture:** structured typed JSON/TS data + dedicated renderer
  components (no MDX).
- Content should be as comprehensive as possible, but skimmable via visual hierarchy.
- Supplementing book content with information/examples from other reliable sources is
  explicitly allowed where useful.

## Content pipeline (build-time authoring process, not app code)

1. Extract text from all PDFs (poppler `pdftotext` / pypdf), TOCs first to map coverage.
2. Build the knowledge graph: ~200 concept nodes with typed edges (`part-of`,
   `prerequisite-of`, `related-to`) and per-node source metadata (book + chapter).
3. Derive the section hierarchy from graph clusters. Expected top-level domains
   (subject to refinement during extraction):
   - Language Fundamentals
   - OOP & Classes
   - Generics
   - Collections
   - Functional Programming & Streams
   - Exceptions & Error Handling
   - I/O & NIO
   - Concurrency
   - JVM Internals & Memory
   - Performance & Optimization
   - Modern Java Features (records, sealed types, pattern matching, virtual threads…)
   Effective-Java-style best practices and pitfalls are woven into each topic, not siloed.
4. Author topic content and class docs as typed data files.

## Data model (TypeScript types + JSON data)

- `Domain` — top-level section: id, title, description, color, ordered topic ids.
- `Topic` — id, domain, title, summary (TL;DR), key points, ordered content blocks
  (paragraph | code example | pitfall | best practice | comparison table | note),
  book references, related graph-node ids.
- `GraphNode` / `GraphEdge` — node: id, label, domain, importance weight, linked topic id;
  edge: source, target, type (`part-of` | `prerequisite-of` | `related-to`).
- `JavaClass` — fqcn, package, module, kind (class/interface/enum/record/annotation),
  since-version, summary, declaration, key methods (signature + description), examples,
  pitfalls, related classes, official Javadoc URL.
- Data code-split per domain via dynamic imports.

## App structure

Vite + React + TypeScript + react-router. Fully static, no backend.

- **Home** — overview dashboard: domain map, stats, quick links.
- **Topics** — collapsible sidebar tree (drawer on mobile) + content pane. Visual
  hierarchy per topic: TL;DR card → key points → expandable deep-dive blocks →
  syntax-highlighted code → pitfall/best-practice callouts → comparison tables →
  book references.
- **Knowledge Graph** — custom SVG + d3-force layout: pan/zoom, domain-colored
  clusters, node click → preview panel → navigate to topic. Degrades to a simpler
  touch-friendly rendering on mobile.
- **Class Reference** — filterable list grouped by package + class detail view.
- **Search** — MiniSearch client-side index over topics and classes; ⌘K palette.

## UI direction

Modern, minimal, responsive. Custom CSS design system (custom properties, no UI
framework), light/dark theme, restrained but distinctive typography. Works from
~360 px mobile to ultrawide. Skimmability first: summary layer always visible,
detail on demand.

## Testing & verification

- Vitest data-integrity tests: all graph edges reference existing nodes; all topic
  links/related ids resolve; class docs and topics validate against schema; search
  index builds.
- Component smoke tests for the main renderer components.
- Manual verification of the running app in a real browser, including mobile viewport.

## Out of scope

- Backend, auth, user accounts, progress tracking.
- Full Javadoc mirroring (curated method selections only).
- Embedding or serving the PDFs themselves.
