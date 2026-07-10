# Relational Databases Compendium Design

**Date:** 2026-07-10  
**Status:** Design approved; pending written specification review

## Purpose

Add a comprehensive, vendor-neutral relational databases compendium to Java::Compendium. It should take a developer from the relational model and schema design through SQL, transactions, performance, storage internals, application integration, and production operation. PostgreSQL is the primary executable dialect and implementation case study, while MySQL, SQLite, SQL Server, and Oracle differences are shown where they materially affect correctness, portability, or performance.

The work also introduces dialect-aware code blocks and richer source metadata. Both changes must remain backward-compatible with every existing compendium.

## Goals

- Cover relational theory, practical SQL, database internals, and production operation in one connected learning graph.
- Provide exactly 110 initial topics across 12 lazy-loaded domains.
- Use all eight approved books materially, supplemented by official vendor documentation, standards-oriented references, university material, and foundational papers.
- Keep transferable concepts vendor-neutral and isolate PostgreSQL implementation details in a dedicated domain.
- Use PostgreSQL first for SQL examples, with selectable dialect variants only when the variants teach a meaningful difference.
- Preserve the existing skim-first topic experience: summary, key points, deep explanations, examples, diagrams, pitfalls, practices, cross-links, and precise sources.
- Extend code highlighting beyond Java without loading a large all-language syntax-highlighting bundle.
- Enforce structural completeness through TypeScript and data-integrity tests.

## Non-goals

- Repeating the System Design compendium's detailed treatment of consensus, sharding, multi-region architecture, distributed databases, or NoSQL categories.
- Teaching Spring, Hibernate, JPA, or any other ORM API in depth. The database compendium explains ORM impedance mismatch and query behavior; framework-specific material belongs in a future compendium.
- Exhaustively documenting every SQL statement, vendor feature, PostgreSQL extension, administrative parameter, or cloud database service.
- Pretending the five supported products implement one interchangeable SQL language.
- Running five database servers as part of the normal frontend test suite.
- Adding a database-backed application backend; the site remains fully static.

## Product decisions

### Vendor boundary

The main curriculum is vendor-neutral. Concepts are stated in relational and SQL terms, then grounded in PostgreSQL examples. MySQL, SQLite, SQL Server, and Oracle receive code variants or comparison tables only where differences are consequential.

Portable SQL is shown as one uncluttered block. A five-tab code block is not a completeness badge: variants are omitted when they add no teaching value.

### PostgreSQL boundary

PostgreSQL receives a dedicated `PostgreSQL in Practice` domain rather than one catch-all topic. Vendor-neutral topics explain the transferable concept and link to the PostgreSQL implementation topic. The PostgreSQL domain does not redefine general theory.

### Distributed-systems boundary

Replication basics, failover, recovery objectives, and application-visible distributed transaction boundaries are in scope. Consensus algorithms, general sharding design, cross-region consistency, and NoSQL system selection remain owned by System Design and are linked rather than duplicated.

## Information architecture

The compendium ID is `databases`. Its short picker label is `Databases`. It has no class reference.

Proposed hero copy:

- **Title:** `Relational databases, understood.`
- **Lede:** `Relational theory, data modeling, SQL, transactions, indexes, query planning, storage internals, and production reliability — vendor-neutral at the core, grounded in PostgreSQL and compared across major SQL dialects.`

The initial release contains exactly 110 topics.

### 1. Relational Foundations (`db-foundations`) — 8 topics

1. `relational-model` — The relational model and data independence
2. `relations-tuples-attributes-domains` — Relations, tuples, attributes, and domains
3. `keys-and-identity` — Superkeys, candidate keys, primary keys, and identity
4. `relational-algebra` — Restrict, project, join, union, difference, and division
5. `relational-calculus-and-declarative-queries` — What declarative querying means
6. `set-vs-bag-semantics` — Sets, duplicates, ordering, and SQL bags
7. `nulls-and-three-valued-logic` — Missing information and `UNKNOWN`
8. `sql-vs-the-relational-model` — Where SQL follows and departs from relational theory

### 2. Data Modeling & Schema Design (`db-modeling`) — 10 topics

1. `conceptual-logical-physical-models` — Modeling layers and requirements
2. `entity-relationship-modeling` — Entities, relationships, cardinality, and optionality
3. `functional-dependencies` — Determinants, closures, and dependency reasoning
4. `normalization-through-bcnf` — 1NF, 2NF, 3NF, and BCNF
5. `higher-normal-forms-and-decomposition` — 4NF, 5NF, lossless join, and dependency preservation
6. `denormalization-tradeoffs` — Deliberate redundancy and consistency costs
7. `modeling-hierarchies-and-graphs` — Adjacency, paths, nested sets, and closure tables
8. `temporal-data-modeling` — Valid time, transaction time, effective dating, and history
9. `application-schema-patterns` — Multitenancy, soft deletion, auditing, and immutable history
10. `schema-design-antipatterns` — EAV, comma-separated lists, polymorphic associations, and key mistakes

### 3. SQL Querying (`db-sql`) — 10 topics

1. `logical-query-processing` — The conceptual order of SQL evaluation
2. `select-expressions-and-filtering` — Projection, expressions, predicates, and `CASE`
3. `joins` — Inner, outer, cross, self, semi, and anti joins
4. `subqueries-and-correlation` — Scalar, row, table, and correlated subqueries
5. `exists-in-and-null-traps` — Membership, existence, and `NOT IN` hazards
6. `set-operations` — `UNION`, `INTERSECT`, `EXCEPT`, and duplicate handling
7. `grouping-and-aggregation` — Aggregates, `GROUP BY`, `HAVING`, and grouping rules
8. `ordering-and-pagination` — Sorting, ties, offsets, and keyset pagination
9. `insert-update-delete` — Data modification and affected-row semantics
10. `merge-upsert-and-returning` — Idempotent writes, generated keys, and dialect differences

### 4. Advanced SQL (`db-advanced-sql`) — 9 topics

1. `common-table-expressions` — CTE semantics, readability, and optimization boundaries
2. `recursive-queries` — Trees, graphs, cycle detection, and traversal
3. `window-functions` — Partitions, ordering, frames, ranking, and offsets
4. `advanced-window-patterns` — Running values, moving windows, sessions, and retention
5. `lateral-joins-and-apply` — Per-row derived tables and top-N-per-group
6. `grouping-sets-rollup-and-cube` — Multi-level aggregation
7. `pivot-unpivot-and-conditional-aggregation` — Reshaping relational results
8. `gaps-islands-and-relational-division` — Recurring advanced query patterns
9. `temporal-and-versioned-queries` — As-of queries, intervals, and changing facts

### 5. Types, Constraints & Database Objects (`db-schema-objects`) — 9 topics

1. `numeric-types-and-precision` — Integers, decimals, floating point, money, and overflow
2. `text-types-collations-and-encoding` — Strings, Unicode, comparison, and collation
3. `dates-times-and-time-zones` — Instants, civil time, intervals, and daylight-saving hazards
4. `boolean-enum-domain-and-uuid-types` — Semantic types and portability
5. `json-arrays-and-composite-data` — Semi-structured data inside a relational design
6. `primary-unique-and-check-constraints` — Declarative integrity and candidate keys
7. `foreign-keys-and-referential-actions` — Cascades, deferral, and lifecycle modeling
8. `views-and-materialized-views` — Abstraction, security, performance, and refresh
9. `sequences-generated-columns-triggers-and-routines` — Database-side behavior and its trade-offs

### 6. Transactions & Concurrency (`db-transactions`) — 10 topics

1. `transactions-and-acid` — Atomicity, consistency, isolation, and durability
2. `histories-schedules-and-serializability` — Reasoning about concurrent executions
3. `isolation-levels-and-anomalies` — Dirty reads through serialization anomalies
4. `read-committed-and-repeatable-read` — Guarantees, surprises, and vendor meanings
5. `snapshot-isolation-and-write-skew` — Snapshot visibility and invariant violations
6. `serializable-transactions` — Two-phase locking, SSI, and retry behavior
7. `locking-and-two-phase-locking` — Lock modes, granularity, intention locks, and predicate protection
8. `mvcc` — Versions, snapshots, visibility, and garbage collection
9. `deadlocks-contention-and-retries` — Detection, prevention, timeouts, and retry discipline
10. `application-concurrency-and-transaction-boundaries` — Optimistic control, idempotency, savepoints, and 2PC boundaries

### 7. Indexes & Query Performance (`db-performance`) — 11 topics

1. `index-mental-model` — Access paths, maintenance cost, and when indexes help
2. `b-tree-indexes` — Pages, fan-out, seeks, scans, splits, and ordering
3. `non-btree-indexes` — Hash, bitmap, inverted, spatial, and block-range approaches
4. `composite-indexes` — Column order, prefixes, equality/range behavior, and sorting
5. `covering-and-index-only-scans` — Included columns, visibility, and lookup avoidance
6. `partial-functional-and-specialized-indexes` — Predicates, expressions, uniqueness, and use cases
7. `selectivity-cardinality-and-statistics` — Estimates, skew, correlation, and histograms
8. `sargability-and-query-shape` — Search arguments, implicit conversion, and predicate rewrites
9. `cost-based-query-planning` — Plan search, cost models, join order, and plan instability
10. `join-sort-and-aggregation-algorithms` — Nested loops, hash, merge, sorting, and spilling
11. `explain-and-performance-methodology` — Plans, runtime evidence, benchmarks, and regression control

### 8. Storage, Execution & Recovery Internals (`db-internals`) — 9 topics

1. `database-system-architecture` — Parser, catalog, optimizer, executor, storage, and background work
2. `pages-records-and-file-layout` — Slotted pages, row formats, free space, and overflow
3. `heap-clustered-and-index-organized-storage` — Physical organization trade-offs
4. `buffer-pools-and-caching` — Page replacement, dirty pages, and OS interaction
5. `write-ahead-logging-and-checkpoints` — WAL rules, durability, and restart points
6. `aries-and-crash-recovery` — Analysis, redo, undo, and compensation log records
7. `query-lifecycle-and-iterator-execution` — Parse, bind, rewrite, plan, and execute
8. `row-column-and-compressed-storage` — OLTP/analytics layouts and compression
9. `space-reclamation-and-maintenance` — Dead versions, compaction, vacuum concepts, and bloat

### 9. Application Integration & Schema Evolution (`db-applications`) — 9 topics

1. `connections-sessions-and-protocols` — Connection lifecycle and session state
2. `connection-pooling` — Pool sizing, queuing, timeouts, and failure modes
3. `prepared-statements-and-parameter-binding` — Safety, typing, reuse, and plan caching
4. `sql-injection-and-query-safety` — Data/code separation and unsafe dynamic SQL
5. `batching-bulk-loading-and-backpressure` — Efficient write paths and bounded work
6. `application-transaction-design` — Units of work, remote calls, timeouts, and compensation
7. `n-plus-one-and-data-access-shape` — Round trips, eager/lazy loading, and query ownership
8. `orm-impedance-mismatch` — Identity, associations, inheritance, fetching, and leaky abstractions
9. `schema-migrations-and-database-testing` — Versioning, expand-contract, fixtures, and production-safe change

### 10. Operations, Security & Reliability (`db-operations`) — 10 topics

1. `roles-privileges-and-least-authority` — Authentication, authorization, ownership, and grants
2. `row-level-security-and-data-boundaries` — Policy enforcement and tenant isolation
3. `encryption-secrets-and-auditing` — In transit, at rest, key management, and audit trails
4. `backup-restore-and-recovery-objectives` — Logical/physical backup, RPO, RTO, and restore drills
5. `point-in-time-recovery` — Base backups, log archives, timelines, and recovery targets
6. `database-observability` — Workload metrics, waits, locks, sessions, and saturation
7. `slow-query-and-incident-diagnosis` — Evidence collection, containment, and postmortems
8. `capacity-maintenance-and-data-lifecycle` — Growth, statistics, partitioning, retention, and archival
9. `replication-and-read-scaling` — Synchronous/asynchronous replication and stale reads
10. `failover-disaster-recovery-and-reliability` — Promotion, split brain, testing, and operational ownership

### 11. SQL Dialects & Portability (`db-dialects`) — 7 topics

1. `sql-portability-strategy` — Portable core, abstraction boundaries, and deliberate specialization
2. `identifiers-quoting-and-name-resolution` — Case folding, reserved words, schemas, and search paths
3. `type-and-generated-value-differences` — Type mappings, identity, sequences, and auto-increment
4. `pagination-upsert-and-returning-differences` — Common DML syntax variants
5. `null-boolean-collation-and-expression-differences` — Semantic portability hazards
6. `transaction-and-ddl-differences` — Isolation defaults, locking, transactional DDL, and implicit commits
7. `choosing-a-relational-database` — Workload, ecosystem, operational, and portability trade-offs

### 12. PostgreSQL in Practice (`db-postgresql`) — 8 topics

1. `postgresql-architecture` — Processes, shared memory, catalogs, and connection handling
2. `postgresql-types-jsonb-and-extensions` — Native types, extensibility, and when to use them
3. `postgresql-mvcc-and-snapshots` — Tuple headers, transaction IDs, visibility, and snapshots
4. `postgresql-vacuum-freezing-and-bloat` — Autovacuum, HOT, freezing, wraparound, and reclamation
5. `postgresql-index-families` — B-tree, hash, GIN, GiST, SP-GiST, BRIN, and operator classes
6. `postgresql-planner-and-explain` — Statistics and `EXPLAIN (ANALYZE, BUFFERS)`
7. `postgresql-wal-backup-and-replication` — WAL, checkpoints, PITR, physical/logical replication
8. `postgresql-locks-monitoring-and-production-diagnostics` — Locks, waits, catalog views, settings, and incident workflow

## Knowledge graph

Every domain and topic receives a graph node. Edges use the existing `part-of`, `prerequisite-of`, and `related-to` types.

The primary learning spine is:

`Relational Foundations -> Data Modeling -> SQL Querying -> Transactions / Performance -> Internals / Applications -> Operations`

Advanced SQL branches from SQL Querying. Types and Constraints connects modeling to querying and transactions. Dialect topics branch from the corresponding vendor-neutral concepts. Each PostgreSQL topic has prerequisite edges from the concepts it implements rather than forming a separate disconnected course.

Cross-compendium links are not currently represented by the shared `related` field or graph-edge schema. The initial implementation therefore uses prose references to System Design where necessary and does not invent unresolved cross-compendium topic IDs.

## Source strategy

### Required books

All eight books must be cited materially across the compendium:

1. **Database System Concepts, 7th ed.** — Abraham Silberschatz, Henry F. Korth, S. Sudarshan
2. **SQL and Relational Theory, 3rd ed.** — C.J. Date
3. **SQL Antipatterns** — Bill Karwin
4. **SQL Performance Explained** — Markus Winand
5. **PostgreSQL 14 Internals** — Egor Rogov
6. **Database Internals** — Alex Petrov
7. **Designing Data-Intensive Applications, 2nd ed.** — Martin Kleppmann, Chris Riccomini
8. **Database Reliability Engineering** — Laine Campbell, Charity Majors

Their primary roles are respectively curriculum breadth; relational theory; schema/application failure modes; indexing and performance; PostgreSQL internals; storage engines; data-system trade-offs; and production operations.

### Additional references

The source catalog also includes:

- Current PostgreSQL documentation, pinned by cited section rather than copied prose.
- Current MySQL, SQLite, SQL Server, and Oracle documentation for claims about those products.
- The current SQL standard or accessible standards-oriented references where exact standard behavior matters.
- CMU 15-445/645 Introduction to Database Systems.
- E.F. Codd, “A Relational Model of Data for Large Shared Data Banks.”
- Selinger et al., “Access Path Selection in a Relational Database Management System.”
- Berenson et al., “A Critique of ANSI SQL Isolation Levels.”
- Mohan et al., “ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging.”
- Ports and Grittner, “Serializable Snapshot Isolation in PostgreSQL.”
- Additional primary papers only when a topic needs them, such as original B-tree, MVCC, or SSI work.

### Attribution rules

- A normal topic cites 2–5 specific chapters, documentation sections, or papers.
- Vendor behavior is verified against that vendor's official documentation.
- Foundational or disputed claims use a primary paper or an explicitly attributed authorial position.
- Opinionated positions, especially Date's treatment of nulls and SQL deviations, are presented as arguments rather than undisputed product guidance.
- Content is synthesized. It does not reproduce long passages from any source.
- A concept has one canonical owning topic; other topics summarize and link to it.

## Content-depth contract

Each topic uses the existing `Topic` structure and should include:

- A precise 1–3 sentence summary.
- Five to seven skimmable key points. Important nuance uses expandable `detail` text.
- A conceptual explanation before syntax or implementation mechanics.
- At least one concrete schema, query, execution trace, or worked scenario when applicable.
- Internal mechanics when they explain observable correctness or performance.
- A dialect comparison only when implementations differ meaningfully.
- At least one realistic pitfall and one actionable best practice when the topic admits them.
- A comparison table or Mermaid diagram when it communicates a relationship better than prose.
- Resolved prerequisite and related-topic links.
- Two to five precise sources under normal circumstances.

This is a quality rubric, not a mechanical demand for every block kind in every topic. For example, a theory topic may need diagrams and algebra rather than SQL, while an operations topic may need a failure timeline and diagnostic queries.

## Source metadata extension

The existing `Book` interface is retained for compatibility but gains optional fields:

```ts
type SourceKind = 'book' | 'paper' | 'documentation' | 'course' | 'standard'

interface Book {
  key: string
  title: string
  authors: string
  kind?: SourceKind
  year?: number
  url?: string
}
```

Existing source entries remain valid. The topic footer displays source type/year when present and makes the title a safe external link when `url` exists. Although the historical type is named `Book`, avoiding a repository-wide rename keeps this feature scoped and backward-compatible.

## Dialect-aware code blocks

### Content model

The `code` content block becomes a union that makes invalid combinations difficult to express:

```ts
type CodeLanguage =
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'sql'
  | 'bash'
  | 'json'
  | 'markup'
  | 'text'

interface CodeVariant {
  id: string
  label: string
  language: CodeLanguage
  code: string
}

type CodeContentBlock =
  | {
      kind: 'code'
      code: string
      language?: CodeLanguage
      variants?: never
      title?: string
      caption?: string
    }
  | {
      kind: 'code'
      code?: never
      language?: never
      variants: CodeVariant[]
      title?: string
      caption?: string
    }
```

Omitted `language` preserves the current Java default. Variant groups may contain any useful language comparison, but the database compendium normally uses `sql` with labels `PostgreSQL`, `MySQL`, `SQLite`, `SQL Server`, and `Oracle`.

### Rendering behavior

- One source renders the familiar title and copy bar with no tabs.
- Two or more variants render an accessible tab strip in the header.
- The first variant is the server-rendered and initially selected value.
- SQL dialect groups place PostgreSQL first.
- Selection is local to the block and is not persisted globally because blocks support different subsets.
- Clicking or using arrow/home/end keys updates the selected tab and panel.
- Copy writes only the active variant and gives the existing temporary `Copied` feedback.
- Captions are shared. Dialect-specific caveats live in the example or surrounding prose.
- On narrow screens the tab strip scrolls horizontally without squeezing labels into unreadability.

### Highlighting

Replace the Java-only entry point with a generic language registry backed by Prism core and only the required grammars. Java, JavaScript, TypeScript, SQL, Bash, JSON, and markup are included; text receives escaping without highlighting. SQL dialect labels share the SQL grammar.

The highlighter returns renderable tokens without using unsafe raw HTML. Its output must concatenate to the exact input. Unsupported or unregistered language values degrade to escaped plain text rather than throwing.

The existing `highlightJava` export may temporarily wrap the generic implementation if retaining it avoids unnecessary test churn, but new code calls the generic API.

### Component boundaries

- `TopicView` selects the single or variant block shape and passes it to `CodeBlock`.
- `CodeBlock` owns tab state, copy state, accessibility, highlighting, and responsive behavior.
- The highlighting module owns language registration and tokenization only.
- Existing class-detail and callout code blocks continue using the single-source API.

## Error handling and fallback behavior

- TypeScript prevents a code block from specifying both `code` and `variants`.
- Integrity tests reject empty code, empty variant sets, duplicate variant IDs, unsupported languages, and malformed SQL-dialect ordering.
- Unsupported runtime language values render plain escaped code.
- Clipboard failure remains silent and never changes the button to `Copied`.
- Missing optional source metadata renders the existing plain citation.
- Invalid or unreachable external URLs do not prevent topic rendering; link correctness is a content-review concern.
- The first variant is deterministic during SSR and hydration. No browser storage is read during initial rendering.
- Lazy topic-load failures continue through the app's existing route/loading behavior; this feature does not introduce a separate network data path.

## Testing strategy

### Type and unit tests

- Existing Java code blocks still default to Java and highlight known Java tokens.
- Every supported language tokenizes without losing or changing source text.
- Plain-text and unknown-language fallback safely render literal input.
- A single code block retains current title, caption, and copy behavior.
- Variant blocks render correct tabs, panels, labels, and initial PostgreSQL selection.
- Click and keyboard interactions update ARIA selection and visible code.
- Copy uses the currently active variant.
- Clipboard rejection is nonfatal.
- Variant tabs remain usable in constrained-width component tests where practical.

### Data-integrity tests

For the new compendium, tests enforce:

- Exactly 12 domains and 110 unique topics.
- Domain topic IDs, loaders, loaded topics, and graph topic nodes agree exactly.
- Every topic's `domainId` matches its owner.
- Every related ID, graph edge endpoint, and source key resolves.
- Every topic has a summary, 5–7 key points, content blocks, related topics where appropriate, and sources.
- Code blocks obey the single/variant invariant.
- Variants are nonempty, uniquely identified, and use supported languages.
- SQL dialect groups start with PostgreSQL and use only approved dialect labels.
- Source keys and URLs are unique where applicable.

Structural checks deliberately do not pretend to assess prose quality.

### Integration and build verification

- Compendium picker navigation and scoped routes work for `databases`.
- Search indexes database topics and SQL content without contaminating other compendium scopes.
- The knowledge graph renders all database nodes and resolvable edges.
- Database routes prerender and hydrate without mismatches.
- Source links render correctly and safely.
- Existing compendium routes and code blocks remain unchanged in behavior.
- `npm test`, `npm run lint`, and `npm run build` pass.

### Content review

Each domain receives a manual review for:

- Accuracy and internal consistency.
- Appropriate use of all assigned sources.
- Clear separation of standard concepts, common practice, and vendor behavior.
- Correct PostgreSQL-first dialect ordering.
- SQL examples that are internally coherent and credible for their labeled dialect.
- No duplicated canonical explanations.
- Useful prerequisites, related links, pitfalls, practices, tables, and diagrams.
- No unsupported claims or misleading universal statements.

The normal frontend test suite does not start database servers. Where a local engine is available during authoring, representative PostgreSQL examples may be exercised as an additional check, but this is not a repository requirement.

## Delivery sequence

Implementation planning should break the work into reviewable checkpoints:

1. **Renderer foundation:** source metadata, generic highlighting, dialect variants, tests, and backwards compatibility.
2. **Compendium skeleton:** metadata, registry, sources, domains, lazy loaders, graph, route coverage, and integrity rules.
3. **Foundational content:** relational foundations, modeling, SQL querying, types, and advanced SQL.
4. **Correctness and performance content:** transactions, indexing, optimization, and internals.
5. **Production content:** application integration, operations, dialects, and PostgreSQL.
6. **Whole-compendium audit:** source coverage, graph quality, content depth, visual QA, tests, lint, and production build.

Domains should be completed and validated one at a time. Temporary placeholder topics must not be merged as finished content.

## Success criteria

The work is complete when:

- `Databases` appears as a fully navigable sixth compendium.
- All 12 domains and 110 topics meet the content-depth contract.
- All eight books are materially represented and additional references are accurately attributed.
- Vendor-neutral topics remain neutral while examples default to PostgreSQL.
- Dialect tabs appear only for meaningful differences and work accessibly.
- The PostgreSQL domain provides a coherent implementation-level reference.
- Search, graph, SSR, prerendering, and source rendering work for the new compendium.
- Existing compendiums have no behavioral regression.
- The complete test, lint, and build verification passes.
