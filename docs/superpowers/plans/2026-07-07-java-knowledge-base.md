# Java Knowledge Base App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React/TS/Vite knowledge-base app distilling 8 Java books into a hierarchical topic browser, interactive knowledge graph, curated JDK class reference, and instant search.

**Architecture:** All knowledge lives in typed TS data modules (domains → topics with structured content blocks; graph nodes/edges; class docs), code-split per domain via dynamic import. A small set of renderer components maps block types to a consistent visual hierarchy. No backend.

**Tech Stack:** Vite + React 19 + TypeScript, react-router-dom, d3-force (graph layout only), MiniSearch (client search), Vitest + @testing-library/react + jsdom (tests), custom CSS design system (no UI framework).

## Global Constraints

- Fully static app; no backend, no auth, no runtime network calls except links out to official Javadoc.
- Content sourced from the 8 books in `books/` (git-ignored), supplemented from Oracle/official docs where thin.
- Curated class reference: ~100–150 classes, key methods only (not full Javadoc mirrors).
- Responsive 360 px → ultrawide; light + dark theme; skimmable visual hierarchy (TL;DR → key points → deep dive).
- Every graph edge must reference existing nodes; every topic/class cross-link must resolve (enforced by Vitest integrity tests).
- Extraction working files live in the session scratchpad, never committed.

---

## Content architecture (locked-in from book TOC reconnaissance)

### Domains (12) and their topics (~80)

Derived from clustering the 8 books' TOCs. Topic ids are kebab-case, globally unique.

1. **fundamentals — Language Fundamentals** (Core Java I ch 3; Learning Java ch 4)
   `program-anatomy`, `primitive-types`, `operators-expressions`, `strings-text`, `control-flow`, `arrays`, `numbers-math`
2. **oop — Objects, Classes & OOP Design** (Core Java I ch 4–6; EJ ch 2–4; Learning Java ch 5)
   `classes-objects`, `constructors-initialization` (EJ 1–9), `static-members`, `inheritance-polymorphism`, `object-contracts` (equals/hashCode/toString/clone/Comparable, EJ 10–14), `interfaces`, `inner-nested-classes`, `records`, `enums` (EJ 34–38), `immutability-class-design` (EJ 15–25), `composition-vs-inheritance`
3. **generics — Generics** (Core Java I ch 8; EJ ch 5)
   `generics-why`, `generic-classes-methods`, `type-bounds`, `type-erasure`, `wildcards-pecs` (EJ 31), `generics-restrictions`, `generics-best-practices` (EJ 26–33)
4. **collections — Collections Framework** (Core Java I ch 9; Learning Java ch 7; JCiP ch 5)
   `collections-overview`, `lists`, `sets`, `queues-deques`, `maps`, `hashing-internals`, `sorted-collections`, `views-algorithms`, `choosing-collections`
5. **functional — Functional Programming & Streams** (Core Java I ch 6.2; Core Java II ch 1; EJ ch 7)
   `lambdas`, `method-references`, `functional-interfaces`, `stream-pipeline`, `stream-operations`, `collectors`, `primitive-streams`, `parallel-streams` (EJ 48), `optional` (EJ 55)
6. **exceptions — Exceptions, Assertions & Logging** (Core Java I ch 7; EJ ch 10; Learning Java ch 6)
   `exception-hierarchy`, `catching-cleanup` (try-with-resources, EJ 9), `exception-best-practices` (EJ 69–77), `assertions`, `logging`
7. **io — I/O, Serialization & Networking** (Core Java II ch 2, 4; Learning Java ch 11)
   `io-streams`, `readers-writers`, `files-paths-nio`, `binary-data-buffers`, `serialization` (EJ 85–90), `regex`, `sockets-networking`, `http-client`
8. **concurrency — Concurrency** (JCiP all; Core Java I ch 10; EJ ch 11; Learning Java ch 9)
   `threads-lifecycle`, `thread-safety`, `sharing-objects` (visibility/publication), `locks-synchronization`, `java-memory-model`, `concurrent-collections`, `executors-thread-pools` (EJ 80), `synchronizers`, `completable-future`, `atomics-nonblocking`, `virtual-threads`, `liveness-hazards`, `concurrency-best-practices` (EJ 78–84)
9. **jvm — JVM Internals & Memory** (Optimizing Java ch 2, 6–10; OCNJ ch 3–6; Java Secrets pt 1)
   `jvm-architecture`, `class-loading`, `bytecode-execution`, `memory-layout`, `gc-fundamentals`, `gc-algorithms`, `jit-compilation`, `hardware-memory` (Optimizing Java ch 3)
10. **performance — Performance & Optimization** (Optimizing Java ch 1, 4–5, 8, 11–14; OCNJ ch 2, 8–15; Java Secrets)
    `performance-methodology`, `microbenchmarking` (JMH), `gc-tuning-logging`, `profiling`, `language-performance` (incl. EJ 6, 63, 67), `concurrent-performance`, `observability`, `cloud-native-java`, `scalability-patterns`
11. **platform — Platform & Advanced APIs** (Core Java II ch 5–9; Core Java I ch 11–12)
    `date-time-api`, `annotations`, `reflection`, `modules-jpms`, `jdbc-database`, `internationalization`, `security-basics`, `native-interop` (JNI→FFM)
12. **modern — Modern Java Evolution** (Core Java I/II Java 17–21 coverage; Optimizing Java ch 15; OCNJ ch 15)
    `release-cadence`, `var-type-inference`, `switch-expressions-pattern-matching`, `text-blocks`, `sealed-types-overview`, `virtual-threads-structured-concurrency`, `ffm-api`, `future-directions`

Cross-cutting Effective Java items are embedded as `bestPractice`/`pitfall` blocks inside the topics noted above.

### Knowledge graph

- One `GraphNode` per topic (~80) + one hub node per domain (12) ⇒ ~92 nodes.
- Edges: `part-of` (topic → domain hub), `prerequisite-of`, `related-to` (cross-domain, e.g. `type-erasure → generics-restrictions`, `java-memory-model → gc-fundamentals`, `hashing-internals → object-contracts`). Target ≥1.5 non-hub edges per topic.
- Node `importance` (1–3) drives rendered size; domain drives color.

### Class reference (~120 classes, 6 data files by area)

`lang-core` (Object, String, StringBuilder, Integer & boxed types, Math, System, Thread, Record…), `collections` (List/ArrayList/LinkedList, Map/HashMap/TreeMap/LinkedHashMap, Set variants, Deque/ArrayDeque, PriorityQueue, Collections, Arrays, Comparator…), `functional-streams` (Stream, IntStream, Collectors, Optional, Function/Supplier/Consumer/Predicate, CompletableFuture…), `concurrency` (ExecutorService, ThreadPoolExecutor, ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue, ReentrantLock, ReadWriteLock, StampedLock, CountDownLatch, CyclicBarrier, Semaphore, AtomicInteger/Long/Reference, ThreadLocal…), `io-net` (InputStream/OutputStream, Reader/Writer, Files, Path, ByteBuffer, Channels, HttpClient, Socket/ServerSocket, Pattern/Matcher…), `platform` (LocalDate/LocalDateTime/Instant/Duration/ZonedDateTime/DateTimeFormatter, BigDecimal/BigInteger, UUID, Objects, Scanner, Process/ProcessBuilder, Class, Module…).

---

## File structure

```
package.json, vite.config.ts, tsconfig.json, index.html   (root scaffold)
src/
  main.tsx                     entry + router
  App.tsx                      shell route layout
  styles/tokens.css            design tokens (colors, type scale, spacing, dark/light)
  styles/base.css              reset, typography, layout primitives
  types/content.ts             ALL shared types (Domain, Topic, ContentBlock, GraphNode/Edge, JavaClass)
  data/domains.ts              Domain[] registry (meta only)
  data/graph.ts                GraphNode[], GraphEdge[]
  data/topics/<domain>.ts      Topic[] per domain (12 files, lazy-loaded)
  data/topics/index.ts         loader map: domainId -> () => import(...)
  data/classes/<area>.ts       JavaClass[] per area (6 files, lazy-loaded)
  data/classes/index.ts        loader map + class summaries for lists/search
  lib/highlightJava.ts         tiny Java tokenizer -> token spans
  lib/searchIndex.ts           MiniSearch index build over topics+classes summaries
  lib/useTheme.ts              theme state + localStorage + prefers-color-scheme
  components/AppShell.tsx      header, nav, theme toggle, mobile drawer
  components/Sidebar.tsx       collapsible domain/topic tree
  components/CodeBlock.tsx     highlighted <pre>, copy button
  components/Callout.tsx       pitfall | bestPractice | note variants
  components/CompareTable.tsx  responsive comparison table
  components/TopicView.tsx     renders Topic (summary card, key points, blocks)
  components/GraphView.tsx     d3-force SVG graph, pan/zoom, node preview panel
  components/SearchPalette.tsx ⌘K modal search
  pages/HomePage.tsx           dashboard: domain cards, stats, entry points
  pages/TopicPage.tssx         sidebar + TopicView, prev/next
  pages/GraphPage.tsx
  pages/ClassesPage.tsx        filterable class list
  pages/ClassPage.tsx          class detail
src/**/*.test.ts(x)            colocated tests
src/data/integrity.test.ts     cross-data integrity suite
```

## Interfaces (source of truth — `src/types/content.ts`)

```ts
export type BlockType = 'paragraph' | 'code' | 'pitfall' | 'bestPractice' | 'note' | 'table' | 'subheading';

export interface CodePayload { title?: string; code: string; caption?: string; }
export interface TablePayload { caption?: string; headers: string[]; rows: string[][]; }

export type ContentBlock =
  | { kind: 'paragraph'; text: string }                    // supports **bold**, `code`, [[topic-id]] links
  | { kind: 'subheading'; text: string }
  | { kind: 'code'; title?: string; code: string; caption?: string }
  | { kind: 'pitfall'; title: string; text: string; code?: string }        // red callout
  | { kind: 'bestPractice'; title: string; text: string; code?: string }   // green callout, EJ items
  | { kind: 'note'; title?: string; text: string }                          // neutral callout
  | { kind: 'table'; caption?: string; headers: string[]; rows: string[][] };

export interface BookRef { book: string; chapter: string; }   // book = short key, e.g. 'core-java-1'

export interface Topic {
  id: string; domainId: string; title: string;
  summary: string;               // TL;DR, 1-3 sentences
  keyPoints: string[];           // 3-7 skimmable bullets
  blocks: ContentBlock[];        // deep dive
  refs: BookRef[];
  related: string[];             // topic ids
}

export interface Domain { id: string; title: string; blurb: string; color: string; topicIds: string[]; }

export type EdgeType = 'part-of' | 'prerequisite-of' | 'related-to';
export interface GraphNode { id: string; label: string; domainId: string; importance: 1 | 2 | 3; kind: 'topic' | 'domain'; }
export interface GraphEdge { source: string; target: string; type: EdgeType; }

export interface MethodDoc { signature: string; desc: string; }
export interface JavaClass {
  fqcn: string; name: string; pkg: string; module: string;
  kind: 'class' | 'interface' | 'enum' | 'record' | 'annotation';
  since: string; summary: string; declaration: string;
  points: string[];              // key facts
  methods: MethodDoc[];          // curated
  example?: { code: string; caption?: string };
  pitfalls: string[];
  related: string[];             // fqcns or topic ids (prefix 'topic:')
  javadocUrl: string;
}
```

Loader contracts (`data/topics/index.ts`, `data/classes/index.ts`):

```ts
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>;
export const classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>>;
export interface ClassSummary { fqcn: string; name: string; pkg: string; area: string; kind: JavaClass['kind']; summary: string; }
export const classSummaries: ClassSummary[];   // eagerly available for lists/search
```

---

## Tasks

### Task 1: Scaffold app + tooling
Create Vite react-ts app at repo root (`npm create vite@latest . -- --template react-ts`), add deps (`react-router-dom d3-force minisearch`, dev: `vitest @testing-library/react @testing-library/jest-dom jsdom @types/d3-force`), configure `vitest` (jsdom env, globals) in `vite.config.ts`, add `test` script. Steps: scaffold → `npm run build` passes → trivial smoke test (`App` renders) passes → commit.

### Task 2: Types + integrity test harness
Write `src/types/content.ts` exactly as above. Write `src/data/integrity.test.ts` that dynamically loads every domain/topic/class/graph module and asserts: unique ids; every `Domain.topicIds` entry resolves; every graph edge endpoint exists; every `Topic.related`/graph `topicId` resolves; every class `related` fqcn/topic resolves; every `[[link]]` inside paragraph text resolves; every class has javadocUrl matching `https://docs.oracle.com/`. Test initially passes on seed data (one seed domain/topic/graph slice). Commit.

### Task 3: Domain registry + full knowledge graph
Author `data/domains.ts` (all 12 domains) and `data/graph.ts` (~92 nodes, edges per the content architecture). Topic data files may not exist yet, so integrity checks for topic resolution assert against `Domain.topicIds` (topics authored per-domain later must match). Run integrity tests → commit.

### Task 4: Design system + AppShell + routing skeleton
`styles/tokens.css` + `styles/base.css` (dark/light via `data-theme` + `prefers-color-scheme`; fluid type scale; 360px-first). `useTheme` hook. `AppShell` with header (logo, nav links, search button, theme toggle) and responsive drawer. Routes: `/` `/topics/:domainId?/:topicId?` `/graph` `/classes/:fqcn?` with placeholder pages. Smoke tests render shell + navigate. Commit.

### Task 5: highlightJava (TDD)
Pure function `highlightJava(code: string): Token[]` where `Token = { text: string; type: 'kw'|'type'|'str'|'num'|'comment'|'ann'|'plain' }`. Tests first: keywords, strings w/ escapes, line & block comments, annotations, numeric literals, generics not mangled. Then `CodeBlock` component using it + copy button. Commit.

### Task 6: Content renderer components
`Callout`, `CompareTable`, `TopicView` (summary card → key points → blocks; paragraph mini-markdown: `**b**`, `` `c` ``, `[[topic-id]]` → router link). Component tests: renders each block kind; `[[id]]` becomes link. Commit.

### Task 7: Topics browsing UX
`Sidebar` tree (domains → topics, current highlighted, collapsible, drawer on mobile), `TopicPage` wiring loaders (React `lazy`/dynamic import per domain), prev/next topic navigation, book-references footer. Works with seed domain. Commit.

### Tasks 8–19: Author content, one domain per task (fundamentals, oop, generics, collections, functional, exceptions, io, concurrency, jvm, performance, platform, modern)
For each domain: read the mapped chapters from the extracted book text (scratchpad `text/*.txt`, page ranges from `tocs/`), then write `data/topics/<domain>.ts` with every topic listed in the content architecture. Per topic: summary (1–3 sentences), 3–7 key points, 8–20 content blocks including ≥2 code examples, ≥1 pitfall or bestPractice (Effective Java items where mapped), tables for comparisons (e.g. collection impls, GC algorithms), refs to source books/chapters, related links. Supplement thin spots from official docs knowledge. Register in `topicLoaders`. Integrity tests + build pass → commit per domain.

### Task 20: Knowledge graph view
`GraphView`: d3-force simulation (link/charge/center/collide), render SVG nodes (size by importance, color by domain) + edges (style by type), pan/zoom (wheel + drag, touch pinch), click → side preview panel (summary + "open topic"), legend, domain filter chips. Runs simulation ~300 ticks then static (no perpetual animation). Tests: renders all nodes, click selects. Commit.

### Task 21: Class reference (6 data files + pages)
Author `data/classes/*.ts` (~120 classes per list above; method selections and `since`/module data cross-checked against Oracle Javadoc — fetch via WebFetch where uncertain). `ClassesPage`: search-as-you-type filter, package/area grouping, kind badges. `ClassPage`: declaration, points, methods table, example, pitfalls, related links, Javadoc link. Integrity + build pass → commit per batch (2–3 commits).

### Task 22: Search
`lib/searchIndex.ts` builds MiniSearch over topic (id/title/summary/keyPoints) + class summaries, prefix+fuzzy. `SearchPalette`: ⌘K/ctrl-K + header button, keyboard navigation, grouped results (Topics / Classes), routes on select. Tests: index finds known topics; palette opens and filters. Commit.

### Task 23: Home dashboard
Domain cards grid (color, blurb, topic count, top topics), hero with stats (topics/classes/graph nodes), quick links to graph/classes/search. Commit.

### Task 24: Final verification & polish
Run full test suite + `npm run build`; browse real app (desktop + 375px mobile emulation) across all pages via Chrome DevTools; fix visual issues; Lighthouse-style pass on bundle size (each domain chunk lazy); README with screenshots and dev instructions; final commit.

## Verification checklist (Task 24 gate)

- [ ] `npm test` green; `npm run build` clean, no TS errors
- [ ] All 12 domains render with full content; no unresolved `[[links]]`
- [ ] Graph interactive: pan, zoom, select, navigate-to-topic
- [ ] Class reference: filter + detail for all classes; Javadoc links valid pattern
- [ ] ⌘K search returns topics and classes
- [ ] Mobile 375px: drawer nav, readable topic pages, usable graph
- [ ] Dark + light themes consistent
