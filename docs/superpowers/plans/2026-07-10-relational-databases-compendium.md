# Relational Databases Compendium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sixth, fully static `databases` compendium containing exactly 12 domains and 110 comprehensive topics, with a vendor-neutral curriculum, PostgreSQL-primary examples, meaningful five-dialect comparisons, and a dedicated PostgreSQL implementation domain.

**Architecture:** Build the database data package unregistered until every domain is complete, then add one metadata and registry binding so the existing picker, routes, search, graph, SSR, and prerender pipeline discover it automatically. Keep one lazy topic module per domain, a dedicated source catalog, and a graph generated from explicit domain membership plus curated prerequisite/related edges.

**Tech Stack:** React 19, TypeScript 6 data modules, Vite 8 lazy imports, Vitest integrity tests, MiniSearch, d3-force graph data, Mermaid content diagrams, existing SSR/prerender pipeline.

## Global Constraints

- Complete `docs/superpowers/plans/2026-07-10-dialect-aware-code-blocks.md` first.
- Follow `docs/superpowers/specs/2026-07-10-relational-databases-compendium-design.md` exactly: 12 named domains and 110 named topics.
- Main topics are vendor-neutral; PostgreSQL is the default SQL example dialect.
- Dialect tabs use only `PostgreSQL`, `MySQL`, `SQLite`, `SQL Server`, and `Oracle`, always with PostgreSQL first.
- All eight approved books must be materially consulted and cited; do not infer chapter citations from titles or summaries.
- Vendor claims must be checked against official vendor documentation.
- Normal topics have 5–7 key points, concrete deep-dive content, and 2–5 precise sources.
- No empty, skeletal, or generated filler topics may be registered.
- System Design owns general NoSQL, sharding, consensus, and multi-region theory; use prose references instead of unresolved cross-compendium IDs.
- The site remains static and the database compendium has no class reference.
- Match repository code style: no semicolons, single quotes, two-space indentation.
- Preserve the unrelated untracked `.agents/` directory.
- Complete and review one domain module at a time.

## File map

**Create:**

- `src/data/databases/books.ts` — eight books plus official docs, course, standard, and paper metadata.
- `src/data/databases/domains.ts` — exactly 12 domain definitions and 110 ordered topic IDs.
- `src/data/databases/graph.ts` — 12 domain hubs, 110 topic nodes, part-of edges, and curated learning edges.
- `src/data/databases/content.test.ts` — pre-registration source, domain, topic, graph, and content-contract checks.
- `src/data/databases/topics/index.ts` — one lazy loader per domain.
- `src/data/databases/topics/db-foundations.ts`
- `src/data/databases/topics/db-modeling.ts`
- `src/data/databases/topics/db-sql.ts`
- `src/data/databases/topics/db-advanced-sql.ts`
- `src/data/databases/topics/db-schema-objects.ts`
- `src/data/databases/topics/db-transactions.ts`
- `src/data/databases/topics/db-performance.ts`
- `src/data/databases/topics/db-internals.ts`
- `src/data/databases/topics/db-applications.ts`
- `src/data/databases/topics/db-operations.ts`
- `src/data/databases/topics/db-dialects.ts`
- `src/data/databases/topics/db-postgresql.ts`

**Modify only after all content exists:**

- `src/data/compendiums.ts` — picker/hero metadata.
- `src/data/registry.ts` — database imports and registry binding.
- `src/data/integrity.test.ts` — database-specific exact counts and strict code/source rules.
- `src/pages/CompendiumPicker.test.tsx` — database picker card.
- `src/seo/routes.test.ts` — database route counts and home route.
- `src/App.test.tsx` — database home navigation smoke test.
- `README.md` — six-compendium description and database coverage.

---

### Task 1: Establish verified source access

**Files:**
- Read: `books/**`
- Read: official documentation and paper URLs listed in the design spec
- Create directory when sources are supplied: `books/databases/` (git-ignored; do not commit source files)

**Interfaces:**
- Produces: locally readable or legally accessible material for every required book.
- Blocks: Tasks 4–7 prose authoring until all eight rows below are verified.

- [ ] **Step 1: Inventory the eight required books**

Run:

```bash
rg --files -uu books | sort
```

Record availability for:

| Key | Required edition | Current workspace status |
|---|---|---|
| `database-system-concepts` | 7th | Missing full text |
| `sql-relational-theory` | 3rd | Missing full text |
| `sql-antipatterns` | Approved English edition | Missing full text |
| `sql-performance-explained` | Current author edition/web edition | Public author web edition available |
| `postgresql-internals` | PostgreSQL 14 Internals | Public official PDF available |
| `database-internals` | 1st | Present under `books/system-design/` |
| `ddia-2` | 2nd, February 2026 | Only first edition present |
| `database-reliability-engineering` | 1st | Missing full text |

- [ ] **Step 2: Obtain missing sources through user-provided copies or official legal access**

Place user-provided files under `books/databases/` with recognizable filenames. Public resources such as the PostgreSQL Internals PDF and SQL Performance Explained web edition may be read from their official sites. Do not download from unofficial mirrors and do not commit book files.

- [ ] **Step 3: Verify every source can support exact citations**

For each book, confirm that its table of contents and cited chapters/sections are readable. Create no repository file for private reading notes unless it contains only original summaries and bibliographic pointers.

Expected: all eight sources are marked accessible. If any paid source remains unavailable, stop book-derived prose authoring and ask the user for access; continue only Tasks 2–3, which do not depend on book prose.

---

### Task 2: Create the source catalog and exact domain plan

**Files:**
- Create: `src/data/databases/books.ts`
- Create: `src/data/databases/domains.ts`
- Create: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: `books`, `bookByKey`, `domains`, and `domainById` matching existing compendium modules.
- Produces: exactly 12 domains and 110 topic IDs from the approved design.

- [ ] **Step 1: Write failing structure tests**

Create `src/data/databases/content.test.ts` with:

```ts
import { describe, expect, test } from 'vitest'
import { books, bookByKey } from './books'
import { domains } from './domains'

const requiredBooks = [
  'database-system-concepts',
  'sql-relational-theory',
  'sql-antipatterns',
  'sql-performance-explained',
  'postgresql-internals',
  'database-internals',
  'ddia-2',
  'database-reliability-engineering',
]

describe('database compendium plan', () => {
  test('contains 12 domains and 110 unique planned topics', () => {
    expect(domains).toHaveLength(12)
    const ids = domains.flatMap((domain) => domain.topicIds)
    expect(ids).toHaveLength(110)
    expect(new Set(ids).size).toBe(110)
  })

  test('registers all eight required books', () => {
    expect(requiredBooks.every((key) => bookByKey.has(key))).toBe(true)
    expect(new Set(books.map((book) => book.key)).size).toBe(books.length)
  })
})
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Create `books.ts`**

Register the eight required keys plus:

```ts
const additionalSourceKeys = [
  'postgresql-docs', 'mysql-docs', 'sqlite-docs', 'sqlserver-docs', 'oracle-docs',
  'sql-standard', 'cmu-15445', 'codd-relational-model', 'selinger-access-path',
  'berenson-isolation', 'aries', 'postgresql-ssi',
]
```

Populate accurate `title`, `authors`, `kind`, `year`, and official `url` metadata. Export `books` and `bookByKey` using the existing pattern.

- [ ] **Step 4: Create `domains.ts` from the approved 110-topic list**

Use the exact IDs and ordering in the design spec. Use these colors in order so adjacent domains remain visually distinct:

```ts
['#2563EB', '#7C3AED', '#0891B2', '#DB2777', '#EA580C', '#DC2626', '#CA8A04', '#4F46E5', '#0D9488', '#059669', '#9333EA', '#336791']
```

Export `domains` and `domainById`.

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS with 12 domains, 110 unique topic IDs, and all required source keys.

- [ ] **Step 6: Commit**

```bash
git add src/data/databases/books.ts src/data/databases/domains.ts src/data/databases/content.test.ts
git commit -m "feat: define database compendium sources and domains"
```

---

### Task 3: Add reusable pre-registration content validation

**Files:**
- Modify: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: test-local `validateDomainTopics(domainId, topics)` and `allAuthoredTopics()` helpers.
- Consumes later: each completed topic module is added to `authoredModules` in this test.

- [ ] **Step 1: Add validator unit fixtures**

Create one valid fixture and deliberately invalid fixtures. Assert the validator reports wrong domain IDs, duplicate topic IDs, missing planned IDs, fewer than five key points, empty blocks, fewer than two refs, unresolved related IDs, invalid source keys, and malformed code variants.

Use this core shape for the valid fixture:

```ts
const validTopic: Topic = {
  id: 'relational-model',
  domainId: 'db-foundations',
  title: 'The Relational Model',
  summary: 'A logical model that separates what data means from how a database stores and retrieves it.',
  keyPoints: ['One', 'Two', 'Three', 'Four', 'Five'],
  blocks: [
    { kind: 'paragraph', text: 'A relation represents a set of tuples governed by a heading and predicates.' },
    { kind: 'note', title: 'Logical, not physical', text: 'Tables are a presentation; relations are the model.' },
  ],
  refs: [
    { book: 'database-system-concepts', chapter: 'Ch. 2 — Introduction to the Relational Model' },
    { book: 'codd-relational-model', chapter: 'Sections 1–2' },
  ],
  related: ['relations-tuples-attributes-domains'],
}
```

- [ ] **Step 2: Implement validators inside the test file**

The validator must compare the module's topic IDs exactly to the owning domain's `topicIds`. It must scan inline `[[topic-id]]` links using the same expression as the global integrity suite, and it must validate the content-depth floor without mandating every optional block kind.

- [ ] **Step 3: Run focused tests**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS for the valid fixture and each explicit invalid-fixture assertion.

- [ ] **Step 4: Commit**

```bash
git add src/data/databases/content.test.ts
git commit -m "test: add database content contract validation"
```

---

### Task 4: Author foundations, modeling, SQL, advanced SQL, and schema objects

**Files:**
- Create: `src/data/databases/topics/db-foundations.ts` (8 complete topics)
- Create: `src/data/databases/topics/db-modeling.ts` (10 complete topics)
- Create: `src/data/databases/topics/db-sql.ts` (10 complete topics)
- Create: `src/data/databases/topics/db-advanced-sql.ts` (9 complete topics)
- Create: `src/data/databases/topics/db-schema-objects.ts` (9 complete topics)
- Modify: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: five `export const topics: Topic[]` modules totaling 46 topics.
- Source emphasis: Database System Concepts, SQL and Relational Theory, SQL Antipatterns, SQL Performance Explained, official vendor docs, Codd.

- [ ] **Step 1: Add the five missing module imports and exact-ID assertions**

Import each module into `content.test.ts`, add it to `authoredModules`, and assert counts `8`, `10`, `10`, `9`, `9` against the owning domain plan.

- [ ] **Step 2: Run and verify module-resolution failure**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: FAIL because the five files do not exist.

- [ ] **Step 3: Author `db-foundations.ts`**

Complete the eight approved topic IDs. Required teaching artifacts:

- Relation/tuple/attribute/domain diagram.
- Candidate-key derivation example.
- Relational algebra table mapping operators to SQL.
- Set-versus-bag duplicate demonstration.
- Three-valued truth table and `NOT IN` preview.
- Explicitly attributed comparison of Date's relational position with practical SQL.

- [ ] **Step 4: Author `db-modeling.ts`**

Complete the ten approved topic IDs around one evolving commerce schema. Required artifacts include ER cardinality, functional-dependency closure, lossy/lossless decomposition, normalization walkthrough, hierarchy strategy comparison, bitemporal timeline, multitenancy trade-off table, and Karwin antipattern examples.

- [ ] **Step 5: Author `db-sql.ts`**

Complete the ten approved topic IDs using a consistent `customers`, `orders`, `order_items`, and `products` schema. Include dialect variants for pagination, generated keys/`RETURNING`, and upsert/merge only. Portable joins, aggregation, filtering, and set operations remain single SQL blocks.

- [ ] **Step 6: Author `db-advanced-sql.ts`**

Complete the nine approved topic IDs. Include recursive hierarchy traversal, window frame diagrams, top-N-per-group with lateral/apply variants, rollup/cube comparison, conditional aggregation, gaps-and-islands, relational division, and as-of interval queries.

- [ ] **Step 7: Author `db-schema-objects.ts`**

Complete the nine approved topic IDs. Include decimal-versus-float failure, collation surprises, time-zone boundary examples, JSON trade-offs, declarative constraints, referential actions, view/materialized-view comparison, and trigger/routine cautions.

- [ ] **Step 8: Run content validation and review source distribution**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS for 46 authored topics with no unresolved links or refs.

Run a source-frequency inspection:

```bash
rg "book:" src/data/databases/topics/db-{foundations,modeling,sql,advanced-sql,schema-objects}.ts
```

Expected: every topic has 2–5 refs and the assigned books are materially represented rather than cited decoratively.

- [ ] **Step 9: Commit**

```bash
git add src/data/databases/topics/db-foundations.ts src/data/databases/topics/db-modeling.ts src/data/databases/topics/db-sql.ts src/data/databases/topics/db-advanced-sql.ts src/data/databases/topics/db-schema-objects.ts src/data/databases/content.test.ts
git commit -m "feat: add relational modeling and SQL content"
```

---

### Task 5: Author transactions, performance, and internals

**Files:**
- Create: `src/data/databases/topics/db-transactions.ts` (10 complete topics)
- Create: `src/data/databases/topics/db-performance.ts` (11 complete topics)
- Create: `src/data/databases/topics/db-internals.ts` (9 complete topics)
- Modify: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: three `topics` modules totaling 30 topics; cumulative authored count becomes 76.
- Source emphasis: Database System Concepts, Database Internals, SQL Performance Explained, DDIA 2, PostgreSQL Internals, Berenson, Selinger, ARIES, PostgreSQL SSI.

- [ ] **Step 1: Add missing imports and exact-ID assertions, then verify failure**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: FAIL because the three files do not exist.

- [ ] **Step 2: Author `db-transactions.ts`**

Use one invariant-preserving account/on-call/order scenario across schedules and isolation levels. Required artifacts: history notation, anomaly matrix, write-skew sequence diagram, 2PL/MVCC comparison, deadlock wait-for graph, retry loop, and a five-vendor isolation table verified against official docs.

- [ ] **Step 3: Author `db-performance.ts`**

Use a shared order workload. Required artifacts: B-tree page diagram, composite-index permutations, covering lookup flow, partial/expression examples, histogram/skew explanation, sargability rewrites, Selinger-style plan search, join algorithm table, spill example, and an evidence-first `EXPLAIN` workflow.

- [ ] **Step 4: Author `db-internals.ts`**

Required artifacts: component architecture, slotted-page diagram, heap/clustered/index-organized comparison, buffer-pool state flow, WAL-before-data sequence, ARIES analysis/redo/undo timeline, iterator tree, row/column layout, and reclamation lifecycle.

- [ ] **Step 5: Run content validation**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS for 76 cumulative topics.

- [ ] **Step 6: Commit**

```bash
git add src/data/databases/topics/db-transactions.ts src/data/databases/topics/db-performance.ts src/data/databases/topics/db-internals.ts src/data/databases/content.test.ts
git commit -m "feat: add database transactions performance and internals"
```

---

### Task 6: Author application, operations, dialect, and PostgreSQL domains

**Files:**
- Create: `src/data/databases/topics/db-applications.ts` (9 complete topics)
- Create: `src/data/databases/topics/db-operations.ts` (10 complete topics)
- Create: `src/data/databases/topics/db-dialects.ts` (7 complete topics)
- Create: `src/data/databases/topics/db-postgresql.ts` (8 complete topics)
- Modify: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: four `topics` modules totaling 34 topics; cumulative authored count becomes exactly 110.
- Source emphasis: SQL Antipatterns, Database Reliability Engineering, DDIA 2, PostgreSQL Internals, official vendor docs, PostgreSQL SSI.

- [ ] **Step 1: Add missing imports and exact-ID assertions, then verify failure**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: FAIL because the four files do not exist.

- [ ] **Step 2: Author `db-applications.ts`**

Required artifacts: session lifecycle, pool sizing via queueing intuition, prepared/bound query examples, unsafe/safe dynamic SQL, batch/backpressure flow, remote-call transaction pitfall, N+1 query trace, ORM mismatch table, and expand-contract migration timeline with test strategy.

- [ ] **Step 3: Author `db-operations.ts`**

Required artifacts: privilege hierarchy, row-policy example, encryption boundary table, RPO/RTO matrix, PITR timeline, observability signal map, slow-query incident workflow, capacity/data lifecycle, replication lag sequence, and failover/restore-drill practices.

- [ ] **Step 4: Author `db-dialects.ts`**

Every topic must compare only verified behavior. Use dialect tabs for quoting, generated values, pagination, upsert/merge/returning, and transactional DDL where code is clearer. Use tables for semantic/default differences. Do not imply Oracle, SQL Server, SQLite, MySQL, and PostgreSQL share identical isolation meanings.

- [ ] **Step 5: Author `db-postgresql.ts`**

Required artifacts: process/shared-memory architecture, type/extension decision guidance, tuple visibility diagram, vacuum/freeze lifecycle, index/operator-class matrix, `EXPLAIN (ANALYZE, BUFFERS)` walkthrough, WAL/PITR/replication flow, and production lock/wait diagnostic queries.

- [ ] **Step 6: Run complete pre-registration content validation**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS with exactly 12 complete modules and 110 unique topics.

- [ ] **Step 7: Audit all eight required books**

Run:

```bash
rg -n "book: '(database-system-concepts|sql-relational-theory|sql-antipatterns|sql-performance-explained|postgresql-internals|database-internals|ddia-2|database-reliability-engineering)'" src/data/databases/topics
```

Expected: the output contains every key in multiple relevant topics; inspect each hit to confirm the cited chapter actually supports the nearby claim.

- [ ] **Step 8: Commit**

```bash
git add src/data/databases/topics/db-applications.ts src/data/databases/topics/db-operations.ts src/data/databases/topics/db-dialects.ts src/data/databases/topics/db-postgresql.ts src/data/databases/content.test.ts
git commit -m "feat: add database application operations and vendor content"
```

---

### Task 7: Build loaders and the complete knowledge graph

**Files:**
- Create: `src/data/databases/topics/index.ts`
- Create: `src/data/databases/graph.ts`
- Modify: `src/data/databases/content.test.ts`

**Interfaces:**
- Produces: `topicLoaders`, `graphNodes`, and `graphEdges` matching `CompendiumData`.

- [ ] **Step 1: Add failing loader and graph assertions**

Assert loader keys exactly equal the 12 domain IDs. Load every module and compare IDs to each domain plan. Assert 122 graph nodes (110 topics plus 12 `d-<domainId>` hubs), 110 part-of edges, unique node IDs, valid endpoints, and at least one prerequisite/related edge for every non-foundational domain.

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: FAIL because loaders and graph do not exist.

- [ ] **Step 3: Create the lazy loader map**

Create one dynamic import per domain using the established registry pattern. No eager imports belong in the production loader map.

- [ ] **Step 4: Create graph nodes and membership edges**

Create domain hubs using IDs `d-${domain.id}`. Create topic nodes from the exact topic plan, with human labels and importance `1 | 2 | 3`. Add one `part-of` edge from each topic to its domain hub.

- [ ] **Step 5: Add learning edges**

Encode the primary spine:

```text
db-foundations -> db-modeling -> db-sql -> db-transactions/db-performance
db-sql -> db-advanced-sql
db-modeling -> db-schema-objects
db-transactions/db-performance -> db-internals
db-sql/db-transactions -> db-applications
db-internals/db-applications -> db-operations
vendor-neutral topics -> db-dialects and db-postgresql counterparts
```

Use topic-level prerequisite edges for the actual concepts and related edges for lateral connections. Avoid dense all-to-all graphs.

- [ ] **Step 6: Run content tests**

Run: `npx vitest run src/data/databases/content.test.ts`

Expected: PASS with 12 loaders, 122 nodes, valid edges, and exact topic coverage.

- [ ] **Step 7: Commit**

```bash
git add src/data/databases/topics/index.ts src/data/databases/graph.ts src/data/databases/content.test.ts
git commit -m "feat: add database loaders and knowledge graph"
```

---

### Task 8: Register the complete compendium and enforce global integrity

**Files:**
- Modify: `src/data/compendiums.ts`
- Modify: `src/data/registry.ts`
- Modify: `src/data/integrity.test.ts`
- Modify: `src/pages/CompendiumPicker.test.tsx`
- Modify: `src/seo/routes.test.ts`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: registered `compendiumRegistry.databases` with no classes.
- Makes all existing route/search/SSR consumers discover the compendium.

- [ ] **Step 1: Add failing integration assertions**

Add picker expectation:

```tsx
expect(screen.getByRole('link', { name: /^Databases/ })).toHaveAttribute('href', '/databases')
```

Add route expectations for `/databases`, 12 database domain landings, and 110 database topic routes. Add an app test rendering `/databases` and asserting the hero title plus a `Topics` navigation link.

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/pages/CompendiumPicker.test.tsx src/seo/routes.test.ts src/App.test.tsx`

Expected: FAIL because `databases` is not registered.

- [ ] **Step 3: Add compendium metadata**

Append:

```ts
{
  id: 'databases',
  label: 'Databases',
  heroTitle: 'Relational databases, understood.',
  heroLede: 'Relational theory, data modeling, SQL, transactions, indexes, query planning, storage internals, and production reliability — vendor-neutral at the core, grounded in PostgreSQL and compared across major SQL dialects.',
  hasClasses: false,
}
```

- [ ] **Step 4: Register database data**

Import the database domains, loaders, graph, and sources in `registry.ts`. Add `databases` with empty class fields, following the existing non-Java entries exactly.

- [ ] **Step 5: Add strict global database integrity checks**

Within the global suite, apply database-specific assertions: 12 domains, 110 topics, 5–7 key points, at least two refs, source URL uniqueness, complete loader/domain equality, and approved dialect ordering. Keep existing looser requirements for older compendiums so registration does not force unrelated content migration.

- [ ] **Step 6: Run focused integration and integrity tests**

Run: `npx vitest run src/data/databases/content.test.ts src/data/integrity.test.ts src/pages/CompendiumPicker.test.tsx src/seo/routes.test.ts src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/compendiums.ts src/data/registry.ts src/data/integrity.test.ts src/pages/CompendiumPicker.test.tsx src/seo/routes.test.ts src/App.test.tsx
git commit -m "feat: register relational databases compendium"
```

---

### Task 9: Audit search, SSR, prerendering, documentation, and visuals

**Files:**
- Modify: `README.md`
- Modify tests only if an actual uncovered regression requires a focused assertion.

**Interfaces:**
- Produces: final verified compendium and accurate repository documentation.

- [ ] **Step 1: Run all automated verification**

Run: `npm test`

Expected: every test passes.

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: TypeScript, client build, SSR build, OG generation, all route prerenders, and sitemap generation succeed. Build output reports 110 new topic routes plus 12 domain routes and 3 database index/home/graph routes.

- [ ] **Step 2: Verify built database artifacts**

Inspect:

```bash
test -f dist/databases/index.html
test -f dist/databases/topics/index.html
test -f dist/databases/graph/index.html
test -f dist/databases/topics/db-foundations/relational-model/index.html
rg "Relational databases, understood" dist/databases/index.html
rg "/databases/topics/db-postgresql/postgresql-architecture/" dist/sitemap.xml
```

Expected: all commands succeed.

- [ ] **Step 3: Run the app and perform visual QA**

Run: `npm run dev`

Inspect desktop and 360px mobile layouts for picker, database home, topic index, one foundational topic, one five-dialect topic, one diagram-heavy transaction topic, PostgreSQL topic, graph, and search. Verify dialect tabs scroll, keyboard focus is visible, code copies the active dialect, source links are readable, and no diagram or table overflows.

- [ ] **Step 4: Perform a content audit**

Check every domain for duplicated explanations, incorrect universal claims, unlabelled PostgreSQL behavior, unresolved prose references, shallow topics, decorative citations, inconsistent example schemas, and dialect examples that differ only cosmetically. Correct issues in their owning domain file and rerun focused content tests after each correction.

- [ ] **Step 5: Update `README.md`**

Replace stale Java-only counts and scope with six-compendium language. Mention the new database compendium, 12 database domains, 110 database topics, dialect-aware examples, and the existing class reference remaining Java-specific.

- [ ] **Step 6: Rerun final verification after all audit edits**

Run: `npm test`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

Run: `npm run build`

Expected: PASS with no warnings that indicate broken content, routes, or hydration.

- [ ] **Step 7: Commit**

```bash
git add README.md src/data/databases/topics
git commit -m "docs: document relational databases compendium"
```

Before staging, inspect `git status --short`. The command above intentionally covers only the README and database-owned topic modules that may have changed during the audit.
