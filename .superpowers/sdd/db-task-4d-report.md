# Database Task 4d Report — Advanced SQL

## Status

Complete. Commit: `a9cf017` (`feat: add advanced SQL content`).

Only the requested production topic module and test registration were committed. No production loader was added.

## Delivered content

- Added `src/data/databases/topics/db-advanced-sql.ts` with exactly nine topics in plan order.
- Every topic has 5–6 key points, expandable detail, a precise summary, worked commerce-schema SQL, pitfalls/best practices, 2–4 registered references, and planned related-topic IDs.
- Included required recursive-flow, window-frame, and temporal-interval visuals/tables.
- Covered recursive anchor/step/path/depth/cycles; window peers/default frames/`ROWS` versus `RANGE`; running/moving measures, top-N, sessionization and retention grain; PostgreSQL `LATERAL` versus SQL Server `APPLY`; grouping sets/rollup/cube and `GROUPING()`; conditional aggregation and pivot/unpivot variants; exact gaps/islands and relational division; and half-open temporal as-of/overlap/history integrity.
- Added `dbAdvancedSqlTopics` only to `src/data/databases/content.test.ts`, including the exact nine-ID assertion and authored-module validation registration.

## TDD evidence

1. RED: after adding the import, module registration, and exact ID assertion first, `npm test -- src/data/databases/content.test.ts` failed during import with `Failed to resolve import "./topics/db-advanced-sql"`.
2. First implementation run reached the content validator and identified six unplanned related IDs. These were replaced with semantically appropriate planned IDs.
3. GREEN: `npm test -- src/data/databases/content.test.ts` passed: 1 file, 19 tests.

## Final verification

- Focused: `npm test -- src/data/databases/content.test.ts` — 19/19 passed.
- Full: `npm test` — 25 files, 184/184 tests passed.
- Lint: `npm run lint` — exit 0, no diagnostics.
- Build: `npm run build` — exit 0; client and SSR builds succeeded and 515 routes were prerendered. Vite emitted the repository's non-failing large-chunk advisory.
- Whitespace: staged `git diff --check` — clean.

## Sources and syntax verification

Synthesis used the supplied Database System Concepts 7e and SQL and Relational Theory source locations and their advanced SQL, table-expression/quantification, and temporal chapter structure. The local machine lacked `pdftotext`/`pypdf`, so automated excerpt extraction was unavailable; no book text was copied.

Current vendor syntax was checked against official documentation:

- PostgreSQL 18, `WITH Queries (Common Table Expressions)`, including recursive working-table semantics, materialization caveats, `SEARCH`, and `CYCLE`: https://www.postgresql.org/docs/current/queries-with.html
- PostgreSQL 18, `Window Functions` and value-expression frame semantics, including peers and the ordered default frame: https://www.postgresql.org/docs/current/functions-window.html and https://www.postgresql.org/docs/current/sql-expressions.html
- PostgreSQL 18, table expressions for `LATERAL` and advanced grouping: https://www.postgresql.org/docs/current/queries-table-expressions.html
- SQL Server 2025, `FROM` for `CROSS/OUTER APPLY`, `PIVOT/UNPIVOT`, and `FOR SYSTEM_TIME`: https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17
- SQL Server 2025, recursive CTEs and `MAXRECURSION`: https://learn.microsoft.com/en-us/sql/t-sql/queries/recursive-common-table-expression-transact-sql?view=sql-server-ver17
- SQL Server, `Using PIVOT and UNPIVOT`: https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17

All multi-SQL variant blocks use PostgreSQL first and only approved labels (`PostgreSQL`, `SQL Server`). References use registered book keys only.

## Self-review

- Rechecked all nine IDs and their order against the brief.
- Rechecked each required artifact and named edge case against the authored blocks.
- Confirmed 5–7 key points and 2–5 references per topic through the repository validator.
- Confirmed no unresolved inline/related IDs, unsupported reference keys, or malformed dialect variants.
- Confirmed the CTE discussion avoids a universal materialization claim and the temporal discussion uses `[start,end)` consistently.
- Confirmed deterministic tie-breakers are present where row limiting or row-by-row windows require them.

## Concerns

- The build's large-chunk warning predates/is unrelated to this test-only content registration and does not fail the build.
- The topic module intentionally remains absent from a production loader, per the task; therefore the new topics are validated but not yet shipped in the application navigation.

## Review-finding fixes (2026-07-10)

The review findings were corrected in `src/data/databases/topics/db-advanced-sql.ts`:

- Replaced every undefined commerce attribute/relation. Order values now derive from `order_items.quantity * order_items.unit_price`; grouping joins `orders → order_items → product_categories`; event, order-total, cohort-month, and quarter relations are defined as CTE stages before use.
- Replaced the purportedly portable `EXTRACT(QUARTER ...)` example with half-open, parameterized quarter boundaries. `EXTRACT(QUARTER ...)` remains only inside the explicitly labeled PostgreSQL variant; SQL Server uses `DATEPART`.
- Added complete worked moving-average and monthly-retention queries with captions explaining source grain, frame membership, deduplication, cohort assignment, and elapsed-month counting. Sessionization now stages paid orders as a defined event relation.
- Chose one open-end convention: `valid_to IS NULL` means positive infinity. Scalar as-of and overlap predicates handle null explicitly, the truth table includes an open-ended case, and the PostgreSQL range example states that a null upper bound constructs an unbounded range.

### Exact PDF source audit

Installed `pypdf 6.14.2` in an isolated `/tmp/db4d-pypdf` virtual environment and extracted outlines plus supporting pages from the two supplied PDFs (no source PDF was modified):

- *Database System Concepts*, 7th ed., 1,373 PDF pages: verified `§3.8.2 The EXISTS Test`, `§3.8.5 The Lateral Clause`, `§3.8.6 The With Clause` (PDF pp. 127–135); `§5.4 Recursive Queries` (outline/PDF p. 242); `§5.5.1 Ranking`, `§5.5.2 Windowing`, `§5.5.3 Pivoting`, and `§5.5.4 Rollup and Cube` (PDF pp. 248–259); and `§7.10 Modeling Temporal Data` (PDF pp. 376–380).
- *SQL and Relational Theory*, 3rd ed., 584 PDF pages: verified Ch. 6 `Formulating expressions one step at a time` (TOC PDF p. 9); Ch. 7 `Divide` and `Summarization` (TOC PDF p. 9; body PDF pp. 247–263); Ch. 11 `Example 2: Universal quantification` (TOC PDF p. 11; body PDF p. 436); and Ch. 12 `Subqueries`, whose body explicitly discusses lateral subqueries (TOC PDF p. 11; body PDF pp. 469–472).
- Dropped the invented Date-book Ch. 14 temporal citation: the supplied edition ends at Ch. 12. Dropped unsupported/mismatched Date headings and the SQL Performance Explained references because no exact supplied PDF backed those labels.

### Fresh verification and self-review

- `npx vitest run src/data/databases/content.test.ts` — 1 file, 19/19 tests passed.
- `npm run lint` — exit 0, no diagnostics.
- `git diff --check` — clean.
- Searched the final topic module for `total_amount`, bare `region`, `customer_events`, undefined quarter/history relations, portable `EXTRACT(QUARTER`, and obsolete Ch. 14/22.9/4.7 labels. Remaining quarter relation names occur only where introduced by a preceding CTE; vendor quarter extraction occurs only in labeled variants.
- Re-read all nine topics against the review list. Recursion cycle/depth logic, window peer/frame logic, gaps-and-islands deduplication, and nested-`NOT EXISTS` division semantics remain intact.
