import type { Topic } from '../../../types/content'

export const dbSqlTopics: Topic[] = [
  {
    id: 'logical-query-processing',
    domainId: 'db-sql',
    title: 'Logical Query Processing',
    summary:
      'A SQL query is understood as a sequence of logical transformations, even though its clauses are written in a different order. This model explains name visibility and result semantics; it does not prescribe the optimizer\'s physical execution plan.',
    keyPoints: [
      {
        text: '`FROM` and joins establish the input row source before row filtering.',
        detail:
          'Join `ON` conditions determine matches and outer-join null extension; `WHERE` then removes rows whose predicate is not true. Moving a predicate between those stages can therefore change an outer join\'s meaning.',
      },
      {
        text: '`WHERE` filters rows, while `HAVING` filters groups.',
        detail:
          '`WHERE` acts before grouping and cannot normally use aggregate results. `HAVING` acts after groups and aggregates exist, so it can retain only groups such as customers whose qualifying spend exceeds a threshold.',
      },
      {
        text: 'Window calculations observe the grouped, filtered row set without collapsing it.',
        detail:
          'Conceptually, window functions are evaluated after grouping and `HAVING` but before final projection ordering and limiting. They preserve one output row per input row at that stage.',
      },
      '`SELECT` computes the output expressions; `DISTINCT` then removes duplicate output rows.',
      '`ORDER BY` establishes presentation order, and row limiting chooses a slice of that ordered result.',
      {
        text: 'Logical order is not physical execution order.',
        detail:
          'An optimizer may push predicates, reorder inner joins, use indexes, or avoid materializing intermediate results whenever the chosen plan preserves observable SQL semantics.',
      },
    ],
    blocks: [
      { kind: 'subheading', text: 'Read a query in semantic order' },
      {
        kind: 'diagram',
        title: 'Logical evaluation pipeline',
        code: [
          'flowchart LR',
          '  F["FROM and joins"] --> W["WHERE: qualifying rows"]',
          '  W --> G["GROUP BY and aggregates"]',
          '  G --> H["HAVING: qualifying groups"]',
          '  H --> N["Window functions"]',
          '  N --> S["SELECT projection"]',
          '  S --> D["DISTINCT"]',
          '  D --> O["ORDER BY"]',
          '  O --> L["OFFSET / FETCH or LIMIT"]',
        ].join('\n'),
        caption:
          'A semantics and name-resolution model, not a claim that the engine materializes or physically executes every box in this order.',
      },
      {
        kind: 'table',
        caption: 'Clause order, visibility, and purpose',
        headers: ['Logical stage', 'What exists', 'Consequence'],
        rows: [
          ['`FROM`, `ON`, joins', 'Input rows and join matches', 'Outer joins may add null-extended rows'],
          ['`WHERE`', 'Joined rows', 'Only predicate result `TRUE` survives'],
          ['`GROUP BY`, aggregates', 'One logical group per grouping key', 'Detail rows collapse into group results'],
          ['`HAVING`', 'Groups and aggregate values', 'Whole groups are retained or removed'],
          ['Windows', 'Rows after grouping and `HAVING`', 'Analytics are added without further grouping'],
          ['`SELECT`', 'Projected expressions and aliases', 'Aliases become available to later stages'],
          ['`DISTINCT`', 'Projected rows', 'Duplicate projected rows are eliminated'],
          ['`ORDER BY`', 'Final result expressions', 'A deterministic sequence requires a total tie-breaker'],
          ['Limiting', 'Ordered result', 'A requested prefix or page is selected'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Written order versus logical order',
        code:
          "SELECT o.customer_id, SUM(i.quantity * i.unit_price) AS revenue\nFROM orders AS o\nJOIN order_items AS i ON i.order_id = o.order_id\nWHERE o.status = 'PAID'\nGROUP BY o.customer_id\nHAVING SUM(i.quantity * i.unit_price) >= 1000\nORDER BY revenue DESC, o.customer_id;",
        caption:
          'The `revenue` alias is usable in `ORDER BY`, which is logically later than projection, but not generally in `WHERE`, which is earlier.',
      },
      {
        kind: 'paragraph',
        text:
          'For the sample query, joins first form paid-order line rows, `WHERE` removes non-paid orders, grouping forms one group per customer, and `HAVING` keeps groups totaling at least 1000. Projection names the total `revenue`; ordering then sorts totals and uses `customer_id` to break ties.',
      },
      {
        kind: 'pitfall',
        title: 'Using a projection alias too early',
        text:
          '`WHERE revenue >= 1000` is conceptually invalid in this query because `revenue` has not been computed when row filtering occurs. Repeat or restructure the expression at the stage where it has meaning.',
      },
      {
        kind: 'bestPractice',
        title: 'Separate semantics from plans',
        text:
          'Use logical processing to reason about correctness and `EXPLAIN` to inspect a particular physical plan. Never infer output order or join behavior from the plan alone.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.3–3.8 — Query structure, grouping, and nested subqueries' },
      { book: 'sql-relational-theory', chapter: 'Ch. 6 — SQL and Relational Algebra I' },
      { book: 'sqlserver-docs', chapter: 'SELECT — Logical processing order of the SELECT statement' },
    ],
    related: ['select-expressions-and-filtering', 'grouping-and-aggregation', 'window-functions'],
  },
  {
    id: 'select-expressions-and-filtering',
    domainId: 'db-sql',
    title: 'SELECT Expressions and Filtering',
    summary:
      '`SELECT` derives the columns of a result, while `WHERE` chooses source rows whose search condition is true. Correct queries make expression meaning, null behavior, precedence, and duplicate intent explicit.',
    keyPoints: [
      {
        text: 'Projection is expression evaluation, not merely column selection.',
        detail:
          'A select list can rename columns, compute line totals, classify values with `CASE`, and replace missing display values with `COALESCE`. Those expressions do not mutate the source rows.',
      },
      '`WHERE` retains only rows for which its condition evaluates to `TRUE`; both `FALSE` and `UNKNOWN` are rejected.',
      {
        text: 'Null needs dedicated predicates.',
        detail:
          '`value = NULL` evaluates to unknown rather than testing absence. Use `IS NULL` or `IS NOT NULL`, and decide deliberately how null should affect compound conditions.',
      },
      'Parenthesize mixed `AND` and `OR` conditions to expose the intended grouping rather than relying on remembered precedence.',
      '`DISTINCT` applies to the complete projected row and can hide an accidental many-to-many multiplication rather than fix it.',
      {
        text: 'Filtering expressions influence access paths.',
        detail:
          'A predicate that compares an indexed column directly to a compatible value is easier to use for an index range than one that wraps the column in a function. Performance is secondary to correctness, but equivalent forms can differ greatly in cost.',
      },
    ],
    blocks: [
      { kind: 'subheading', text: 'Derive a useful result after choosing rows' },
      {
        kind: 'code',
        language: 'sql',
        title: 'Filtered product projection',
        code:
          "SELECT p.product_id,\n       p.name,\n       p.current_price,\n       CASE\n         WHEN p.current_price < 25 THEN 'budget'\n         WHEN p.current_price < 100 THEN 'standard'\n         ELSE 'premium'\n       END AS price_band\nFROM products AS p\nWHERE p.current_price >= 10\n  AND p.current_price < 500;",
      },
      {
        kind: 'paragraph',
        text:
          'The filter first keeps products priced from 10 up to, but not including, 500. For each survivor, the `CASE` expression derives exactly one price band. A price of 20 becomes `budget`; a null `current_price` is removed because both comparisons are unknown.',
      },
      {
        kind: 'table',
        caption: 'Common expression roles',
        headers: ['Construct', 'Role', 'Commerce example'],
        rows: [
          ['Alias', 'Name an output expression', '`quantity * unit_price AS line_total`'],
          ['`CASE`', 'Conditional result', 'Map price ranges to display bands'],
          ['`COALESCE`', 'First non-null value', 'Show a fallback category label'],
          ['`IS NULL`', 'Test missing marker', 'Find products not discontinued'],
          ['`DISTINCT`', 'Remove duplicate result rows', 'Unique customer IDs, when uniqueness is truly intended'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Turning a range predicate into a function predicate',
        text:
          '`WHERE CAST(placed_at AS DATE) = :day` may prevent a useful ordered index range. A half-open range preserves timestamp meaning and is usually easier to optimize.',
        code:
          'WHERE placed_at >= :day_start\n  AND placed_at < :next_day_start',
      },
      {
        kind: 'bestPractice',
        title: 'Select stable, named columns',
        text:
          'List the required output columns, qualify ambiguous names, and give computed expressions semantic aliases. Avoid `SELECT *` in durable interfaces because schema additions silently change result shape and transfer cost.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.3–3.4 — Basic Structure and Additional Basic Operations' },
      { book: 'sql-relational-theory', chapter: 'Ch. 6 — Restriction, Projection, and Extend' },
      { book: 'sql-performance-explained', chapter: 'WHERE Clause — Functions and parameterized searches' },
    ],
    related: ['logical-query-processing', 'nulls-and-three-valued-logic', 'index-mental-model'],
  },
  {
    id: 'joins',
    domainId: 'db-sql',
    title: 'Joins',
    summary:
      'A join combines rows according to a predicate. Inner, outer, cross, self, semi, and anti joins answer different existence and preservation questions, so the correct form follows from required result cardinality rather than syntax preference.',
    keyPoints: [
      {
        text: 'An inner join returns matching row combinations.',
        detail:
          'If one order has three order items, joining the order to its items produces three rows. Join cardinality follows matching relationships; it is not automatically one output row per left row.',
      },
      {
        text: 'An outer join preserves unmatched rows by null extension.',
        detail:
          'A left join emits every left row. Where no right match exists, each right-side result column is filled with null, even if the underlying right column is declared `NOT NULL`.',
      },
      'A cross join produces every left-right pair and is appropriate only when that Cartesian product is the intended domain.',
      'A self join assigns different roles to separate references of the same table, such as a category and its parent.',
      {
        text: 'Semi and anti joins test existence without multiplying left rows.',
        detail:
          'SQL commonly expresses a semi join with `EXISTS` and an anti join with `NOT EXISTS`. They return columns from the left side and ignore how many qualifying right matches exist.',
      },
      'Join keys and filters must reflect the full relationship, including tenant, version, or effective-time attributes when those are part of identity.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Choose by preservation and multiplicity' },
      {
        kind: 'table',
        caption: 'Join family comparison',
        headers: ['Form', 'Rows produced', 'Unmatched handling', 'Commerce use'],
        rows: [
          ['Inner', 'Every matching pair', 'Discard either-side nonmatches', 'Orders with their customer'],
          ['Left outer', 'Matches plus every left row', 'Right columns become null', 'All products, including never-ordered products'],
          ['Right/full outer', 'Matches plus preserved side(s)', 'Missing-side columns become null', 'Reconciliation between two feeds'],
          ['Cross', 'Every possible pair', 'Not applicable', 'All size/color combinations'],
          ['Self', 'Depends on predicate', 'Depends on inner/outer form', 'Category and parent category'],
          ['Semi (`EXISTS`)', 'At most one copy of each left row', 'Keep left row when a match exists', 'Customers with paid orders'],
          ['Anti (`NOT EXISTS`)', 'At most one copy of each left row', 'Keep left row when no match exists', 'Products never ordered'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Null extension and predicate placement',
        code:
          "SELECT p.product_id, p.name, i.order_id\nFROM products AS p\nLEFT JOIN order_items AS i\n  ON i.product_id = p.product_id\n AND i.quantity >= 5\nORDER BY p.product_id, i.order_id;",
        caption:
          'Products without a qualifying large-quantity line remain, with `i.order_id` null. Moving `i.quantity >= 5` to `WHERE` would remove those null-extended rows.',
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Self join with explicit roles',
        code:
          'SELECT child.name AS category_name,\n       parent.name AS parent_name\nFROM categories AS child\nLEFT JOIN categories AS parent\n  ON parent.category_id = child.parent_category_id;',
      },
      {
        kind: 'paragraph',
        text:
          'Suppose product 42 has two order lines and product 99 has none. The left join returns two rows for 42 and one null-extended row for 99. If the question is only “which products were ordered?”, `EXISTS` expresses the needed semi join and returns product 42 once without requiring `DISTINCT`.',
      },
      {
        kind: 'pitfall',
        title: 'Repairing a wrong join with DISTINCT',
        text:
          'Duplicate-looking rows often reveal missing join columns or an unrecognized one-to-many relationship. Adding `DISTINCT` can suppress evidence while preserving wrong totals and wasted work.',
      },
      {
        kind: 'bestPractice',
        title: 'Predict cardinality before running the join',
        text:
          'For each input row, ask how many matches are possible and which unmatched rows must survive. Validate surprising counts with grouped key diagnostics before aggregating money or quantities.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 4.1 — Join Expressions' },
      { book: 'sql-relational-theory', chapter: 'Ch. 6 — Join' },
      { book: 'sql-performance-explained', chapter: 'Nested Loops — Join performance' },
    ],
    related: ['subqueries-and-correlation', 'exists-in-and-null-traps', 'join-sort-and-aggregation-algorithms'],
  },
  {
    id: 'subqueries-and-correlation',
    domainId: 'db-sql',
    title: 'Subqueries and Correlation',
    summary:
      'A subquery is a query expression nested where a value, row, table, or existence test is needed. A correlated subquery refers to the current row of an outer query, creating a useful per-row mental model even when the optimizer decorrelates it into a join-like plan.',
    keyPoints: [
      'A scalar subquery must produce at most one row and one column; more than one row is an error rather than an arbitrary choice.',
      'A table subquery can feed `FROM`, membership tests, or another relational expression and should expose clear column names.',
      {
        text: 'Correlation creates a parameterized inner query.',
        detail:
          'For each candidate outer row, substitute its referenced values into the inner query and evaluate the condition. This is a semantics model, not a promise of literal repeated execution.',
      },
      {
        text: 'Optimizers may decorrelate equivalent subqueries.',
        detail:
          'An engine can transform `EXISTS`, scalar aggregates, or other correlated forms into semi joins, grouped joins, or alternative plans if null, duplicate, and cardinality semantics are preserved.',
      },
      'Correlation scope must be explicit: qualified aliases show which query level supplies each column.',
      'A join is not inherently faster than a subquery; compare equivalent semantics and inspect the actual plan for the target workload.',
    ],
    blocks: [
      { kind: 'subheading', text: 'A parameterized-query mental model' },
      {
        kind: 'diagram',
        title: 'Correlated existence test',
        code: [
          'flowchart TD',
          '  O["Take one outer customer c"] --> B["Bind c.customer_id"]',
          '  B --> I["Evaluate matching paid orders"]',
          '  I --> Q{"Any row?"}',
          '  Q -- Yes --> K["Keep customer"]',
          '  Q -- No --> N["Reject customer"]',
          '  K --> O2["Consider next customer"]',
          '  N --> O2',
          '  O2 -. "optimizer may replace loop with semi join" .-> I',
        ].join('\n'),
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Correlated scalar aggregate',
        code:
          "SELECT c.customer_id,\n       c.name,\n       (SELECT COUNT(*)\n        FROM orders AS o\n        WHERE o.customer_id = c.customer_id\n          AND o.status = 'PAID') AS paid_order_count\nFROM customers AS c;",
      },
      {
        kind: 'paragraph',
        text:
          'For customer 7, bind `c.customer_id = 7`; the inner aggregate counts only customer 7\'s paid orders and returns one scalar even when the count is zero. Then repeat conceptually for customer 8. The engine may instead scan or index orders once and join grouped counts.',
      },
      {
        kind: 'table',
        caption: 'Subquery result shapes',
        headers: ['Shape', 'Typical position', 'Contract'],
        rows: [
          ['Scalar', '`SELECT`, comparison, assignment', 'Zero rows generally yields null; more than one row is an error'],
          ['Single column', '`IN`, quantified comparison', 'Any number of values; nulls affect three-valued logic'],
          ['Table', '`FROM`, CTE input', 'Rows and named columns compose with other table expressions'],
          ['Existence', '`EXISTS` / `NOT EXISTS`', 'Only emptiness matters; projected values are irrelevant'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Assuming ORDER BY makes a scalar subquery single-row',
        text:
          'Sorting does not reduce cardinality. If the business rule expects one current price or category, enforce the uniqueness rule or use an explicitly deterministic row-limiting design and document why multiple matches are possible.',
      },
      {
        kind: 'bestPractice',
        title: 'Write the clearest equivalent form, then measure',
        text:
          'Prefer a correlated form when it directly expresses “for this row.” Qualify every reference, verify scalar cardinality, and use the optimizer\'s plan rather than folklore to decide whether restructuring is needed.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.8 — Nested Subqueries' },
      { book: 'sql-relational-theory', chapter: 'Ch. 11 — Correlated Subqueries and Quantification' },
      { book: 'sql-relational-theory', chapter: 'Ch. 12 — Correlated and Lateral Subqueries' },
    ],
    related: ['joins', 'exists-in-and-null-traps', 'common-table-expressions'],
  },
  {
    id: 'exists-in-and-null-traps',
    domainId: 'db-sql',
    title: 'EXISTS, IN, and NULL Traps',
    summary:
      '`EXISTS` asks whether a subquery returns any row, while `IN` compares a value with a set of candidate values. Null introduces `UNKNOWN`, making `NOT IN` unsafe when its candidate set can contain null; `NOT EXISTS` is the robust anti-join form.',
    keyPoints: [
      '`EXISTS` depends only on whether at least one row exists, not on the values projected by its subquery.',
      '`IN` is concise membership syntax and duplicates in its candidate set do not change the truth result.',
      {
        text: '`NOT IN` is not simply “no equal value.”',
        detail:
          'It is equivalent to a conjunction of not-equal comparisons. If any candidate is null and no equality is found, one conjunct is unknown, so the entire predicate is not true and the outer row is filtered out.',
      },
      {
        text: '`NOT EXISTS` is null-safe when the correlation uses the intended equality.',
        detail:
          'It asks whether no matching row exists. Unrelated nulls in the inner relation do not poison the result because they fail the equality test rather than become a global unknown candidate.',
      },
      'A left anti join can also use `LEFT JOIN ... WHERE right_key IS NULL`, but the tested right column must be non-null for matched rows.',
      'Empty candidate sets matter: `NOT EXISTS` over an empty subquery is true for every outer row, matching the anti-join meaning.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Why one null can invalidate NOT IN' },
      {
        kind: 'table',
        caption: 'Membership and anti-membership behavior for outer value 42',
        headers: ['Candidate rows', '`42 IN (...)`', '`42 NOT IN (...)`', 'Reason'],
        rows: [
          ['`(7, 42)`', '`TRUE`', '`FALSE`', 'An equal candidate exists'],
          ['`(7, 9)`', '`FALSE`', '`TRUE`', 'All comparisons are known and unequal'],
          ['`(7, NULL)`', '`UNKNOWN`', '`UNKNOWN`', '`42 <> NULL` is unknown'],
          ['empty set', '`FALSE`', '`TRUE`', 'No candidate satisfies membership'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Safe semi and anti joins',
        code:
          "-- Customers with a paid order\nSELECT c.customer_id, c.name\nFROM customers AS c\nWHERE EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'PAID'\n);\n\n-- Customers with no paid order\nSELECT c.customer_id, c.name\nFROM customers AS c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'PAID'\n);",
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Equivalent left anti join when the key is non-null',
        code:
          "SELECT c.customer_id, c.name\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.customer_id\n AND o.status = 'PAID'\nWHERE o.order_id IS NULL;",
      },
      {
        kind: 'paragraph',
        text:
          'If a nullable `orders.referrer_customer_id` subquery returns `(7, NULL)`, customer 42 fails `NOT IN` even though 42 is not present: `42 <> 7` is true but `42 <> NULL` is unknown. The `NOT EXISTS` version asks only whether a row with `referrer_customer_id = 42` exists and correctly keeps customer 42.',
      },
      {
        kind: 'pitfall',
        title: 'Filtering nulls without preserving the invariant',
        text:
          'Adding `WHERE candidate IS NOT NULL` can make a particular `NOT IN` query work, but future schema or query changes may reintroduce null. Prefer `NOT EXISTS` for anti joins and enforce `NOT NULL` when absence is invalid domain data.',
      },
      {
        kind: 'bestPractice',
        title: 'Match syntax to the question',
        text:
          'Use `EXISTS` for “at least one related row,” `NOT EXISTS` for “no related row,” and `IN` for genuine membership in a known non-null set. This keeps multiplicity and null semantics visible.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.6 and 3.8 — Null Values and Nested Subqueries' },
      { book: 'sql-relational-theory', chapter: 'Ch. 4 — No Duplicates, No Nulls' },
      { book: 'sql-relational-theory', chapter: 'Ch. 10–11 — Logic and Quantification' },
      { book: 'postgresql-docs', chapter: '9.24 — Subquery Expressions: IN, NOT IN, EXISTS' },
    ],
    related: ['nulls-and-three-valued-logic', 'subqueries-and-correlation', 'joins'],
  },
  {
    id: 'set-operations',
    domainId: 'db-sql',
    title: 'Set Operations',
    summary:
      'Set operations combine compatible query results vertically. `UNION`, `INTERSECT`, and `EXCEPT` use distinct semantics by default, while their `ALL` forms preserve bag multiplicities according to each operator.',
    keyPoints: [
      'Operands must have the same degree, and corresponding columns must have compatible types and meanings.',
      {
        text: '`UNION` removes duplicates; `UNION ALL` preserves every occurrence.',
        detail:
          'Duplicate elimination requires additional work and changes multiplicity. Use `ALL` when concatenation is intended and uniqueness is neither required nor implied.',
      },
      '`INTERSECT` keeps rows appearing in both inputs; `EXCEPT` keeps left rows absent from the right input.',
      {
        text: '`ALL` uses occurrence counts.',
        detail:
          'For a row appearing m times on the left and n times on the right, `INTERSECT ALL` returns `min(m,n)` copies and `EXCEPT ALL` returns `max(m-n,0)` copies.',
      },
      'Column names normally come from the first query, while a final `ORDER BY` applies to the combined result.',
      'Parenthesize mixed set operators so precedence and any branch-local ordering or limiting are explicit.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Compatibility and multiplicity' },
      {
        kind: 'table',
        caption: 'Set-operation semantics',
        headers: ['Operator', 'Rows retained', 'For counts m=3, n=2', 'Typical intent'],
        rows: [
          ['`UNION`', 'Distinct rows in either input', '1 copy', 'Combine unique customer IDs'],
          ['`UNION ALL`', 'Every occurrence in both inputs', '5 copies', 'Append compatible event streams'],
          ['`INTERSECT`', 'Distinct rows in both inputs', '1 copy', 'Customers in both campaigns'],
          ['`INTERSECT ALL`', 'Minimum occurrence count', '2 copies', 'Bag intersection'],
          ['`EXCEPT`', 'Distinct left rows absent right', '0 copies', 'Catalog IDs not in a feed'],
          ['`EXCEPT ALL`', 'Positive left-minus-right count', '1 copy', 'Bag difference'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Combine customers reached through two channels',
        code:
          "SELECT customer_id\nFROM orders\nWHERE status = 'PAID'\nUNION\nSELECT customer_id\nFROM orders\nWHERE status = 'REFUNDED'\nORDER BY customer_id;",
      },
      {
        kind: 'paragraph',
        text:
          'If customer 7 has two paid orders and one refunded order, the first branch produces two 7s and the second one 7. `UNION` returns one 7; `UNION ALL` returns three. Choosing between them is a business rule about occurrences, not a performance toggle.',
      },
      {
        kind: 'pitfall',
        title: 'Combining compatible types with incompatible meanings',
        text:
          'A customer ID and a product ID may both be integers, but unioning them creates a column with no coherent predicate. Type compatibility is necessary; semantic compatibility is equally important.',
      },
      {
        kind: 'bestPractice',
        title: 'Name and align every branch',
        text:
          'Project the same business attributes in the same order, cast deliberately when required, and use `UNION ALL` unless duplicate elimination is part of the requested answer.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.5 — Set Operations' },
      { book: 'sql-relational-theory', chapter: 'Ch. 6 — Union, Intersection, and Difference' },
      { book: 'postgresql-docs', chapter: '7.4 — Combining Queries' },
    ],
    related: ['set-vs-bag-semantics', 'joins', 'common-table-expressions'],
  },
  {
    id: 'grouping-and-aggregation',
    domainId: 'db-sql',
    title: 'Grouping and Aggregation',
    summary:
      'Grouping partitions qualifying rows by key and computes one result per group. `WHERE` decides which detail rows participate, while `HAVING` decides which completed groups survive.',
    keyPoints: [
      'Without `GROUP BY`, an aggregate query treats all qualifying rows as one group.',
      'Every nonaggregated select expression must be determined by the grouping key; portable SQL lists those expressions in `GROUP BY`.',
      {
        text: '`WHERE` and `HAVING` answer different questions.',
        detail:
          '`WHERE status = \'PAID\'` excludes non-paid orders before totals are calculated. `HAVING SUM(...) >= 1000` removes complete customer groups whose paid total is smaller.',
      },
      {
        text: 'Most aggregates ignore null, but `COUNT(*)` counts rows.',
        detail:
          '`COUNT(column)` counts non-null values. `SUM`, `AVG`, `MIN`, and `MAX` ignore null inputs and generally return null for an empty input, so zero may need an explicit `COALESCE` when that is the intended meaning.',
      },
      'Joining multiple one-to-many relationships before aggregation can multiply measures and produce plausible but incorrect totals.',
      '`DISTINCT` inside an aggregate changes its input bag and should encode a real rule, not compensate for an incorrect join.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Rows first, groups second' },
      {
        kind: 'code',
        language: 'sql',
        title: 'Paid revenue by customer',
        code:
          "SELECT o.customer_id,\n       COUNT(DISTINCT o.order_id) AS paid_orders,\n       SUM(i.quantity * i.unit_price) AS paid_revenue\nFROM orders AS o\nJOIN order_items AS i ON i.order_id = o.order_id\nWHERE o.status = 'PAID'\nGROUP BY o.customer_id\nHAVING SUM(i.quantity * i.unit_price) >= 1000\nORDER BY paid_revenue DESC, o.customer_id;",
      },
      {
        kind: 'table',
        caption: 'Worked evaluation for two customer groups',
        headers: ['Stage', 'Customer 7', 'Customer 8'],
        rows: [
          ['Joined lines', 'Paid lines 600 and 500; cancelled line 900', 'Paid lines 400 and 300'],
          ['After `WHERE`', '600 and 500', '400 and 300'],
          ['Grouped aggregate', 'Revenue 1100', 'Revenue 700'],
          ['After `HAVING`', 'Kept', 'Removed'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'The cancelled 900 line never enters customer 7\'s group because `WHERE` acts first. Customer 8 forms a valid group and gets a 700 total, but `HAVING` removes that whole group afterward. Moving the revenue condition to `WHERE` would be both temporally and semantically wrong.',
      },
      {
        kind: 'pitfall',
        title: 'Fanout inflation',
        text:
          'Joining order lines and product-category assignments at once can repeat each line once per category. Aggregate each one-to-many fact at its intended grain before combining results, or prove the join remains key-preserving.',
      },
      {
        kind: 'bestPractice',
        title: 'Write down the result grain',
        text:
          'State “one row per customer” or “one row per order and category” before writing the query. Group by that key, inspect intermediate row counts, and reconcile totals against a smaller known sample.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.7 — Aggregate Functions' },
      { book: 'sql-relational-theory', chapter: 'Ch. 7 — Summarization and Grouping' },
      { book: 'sql-relational-theory', chapter: 'Ch. 11 — GROUP BY and HAVING' },
    ],
    related: ['logical-query-processing', 'joins', 'grouping-sets-rollup-and-cube'],
  },
  {
    id: 'ordering-and-pagination',
    domainId: 'db-sql',
    title: 'Ordering and Pagination',
    summary:
      '`ORDER BY` is the only query clause that guarantees result sequence. Pagination must use a total, stable ordering; offset pages become slower and can shift under concurrent changes, while keyset pagination resumes after the last seen key.',
    keyPoints: [
      'Without `ORDER BY`, row order is unspecified even if a plan or index happens to produce a repeatable sequence today.',
      {
        text: 'A deterministic order needs a unique tie-breaker.',
        detail:
          '`ORDER BY placed_at DESC` leaves equal timestamps unordered. Add `order_id DESC` so every row has a stable position and the cursor can identify one exact boundary.',
      },
      'Offset pagination still processes or skips earlier rows and its cost usually grows with deeper pages.',
      {
        text: 'Offset pages are unstable under writes.',
        detail:
          'An insertion or deletion before the next offset shifts positions, so a client can see a row twice or miss it. A transaction snapshot can freeze a view, but that has separate lifetime and resource tradeoffs.',
      },
      'Keyset pagination compares the ordered key tuple with the last row from the previous page and is well suited to forward navigation.',
      'Collation and null placement are part of ordering semantics and vary by database unless made explicit or avoided in cursor keys.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Stable pages start with a total order' },
      {
        kind: 'table',
        caption: 'Offset and keyset pagination',
        headers: ['Property', 'Offset', 'Keyset / seek'],
        rows: [
          ['Boundary', 'Row position', 'Last ordered key values'],
          ['Deep-page work', 'Often scans/skips prior rows', 'Can seek near the boundary with a matching index'],
          ['Concurrent insert before boundary', 'Shifts later offsets', 'Does not move the saved key boundary'],
          ['Random page number', 'Natural', 'Not natural without stored boundaries'],
          ['Required ordering', 'Deterministic total order', 'Deterministic total order matching comparison'],
        ],
      },
      {
        kind: 'code',
        title: 'First offset page',
        caption: 'Equivalent row-limiting syntax; PostgreSQL is first by repository convention.',
        variants: [
          { id: 'postgresql', label: 'PostgreSQL', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25 OFFSET 0;' },
          { id: 'mysql', label: 'MySQL', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25 OFFSET 0;' },
          { id: 'sqlite', label: 'SQLite', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25 OFFSET 0;' },
          { id: 'sql-server', label: 'SQL Server', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nORDER BY placed_at DESC, order_id DESC\nOFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY;' },
          { id: 'oracle', label: 'Oracle', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nORDER BY placed_at DESC, order_id DESC\nOFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY;' },
        ],
      },
      {
        kind: 'code',
        title: 'Next keyset page',
        caption: 'Tuple comparison where supported; expanded lexicographic comparison elsewhere.',
        variants: [
          { id: 'postgresql', label: 'PostgreSQL', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nWHERE (placed_at, order_id) < ($1, $2)\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25;' },
          { id: 'mysql', label: 'MySQL', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nWHERE placed_at <= ?\n  AND (placed_at < ? OR (placed_at = ? AND order_id < ?))\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25;' },
          { id: 'sqlite', label: 'SQLite', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nWHERE (placed_at, order_id) < (?1, ?2)\nORDER BY placed_at DESC, order_id DESC\nLIMIT 25;' },
          { id: 'sql-server', label: 'SQL Server', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nWHERE placed_at < @last_placed_at\n   OR (placed_at = @last_placed_at AND order_id < @last_order_id)\nORDER BY placed_at DESC, order_id DESC\nOFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY;' },
          { id: 'oracle', label: 'Oracle', language: 'sql', code: 'SELECT order_id, placed_at, status\nFROM orders\nWHERE placed_at < :last_placed_at\n   OR (placed_at = :last_placed_at AND order_id < :last_order_id)\nORDER BY placed_at DESC, order_id DESC\nFETCH FIRST 25 ROWS ONLY;' },
        ],
      },
      {
        kind: 'pitfall',
        title: 'Cursor predicate disagrees with sort direction',
        text:
          'For descending `(placed_at, order_id)`, the next page uses values less than the previous last key. A reversed comparator or missing tie-breaker causes gaps or repeats.',
      },
      {
        kind: 'bestPractice',
        title: 'Index the page order',
        text:
          'Use an index beginning with the filtering columns and then the full ordered key where the workload justifies it. Encode cursor values opaquely and validate that every sort term participates in the continuation predicate.',
      },
    ],
    refs: [
      { book: 'sql-performance-explained', chapter: 'Partial Results — Fetching the next page' },
      { book: 'postgresql-docs', chapter: '7.5–7.6 — Sorting Rows; LIMIT and OFFSET' },
      { book: 'mysql-docs', chapter: '15.2.13 SELECT; 10.2.1.19 LIMIT Query Optimization' },
      { book: 'sqlserver-docs', chapter: 'ORDER BY — OFFSET and FETCH' },
      { book: 'oracle-docs', chapter: 'SELECT — row_limiting_clause' },
    ],
    related: ['index-mental-model', 'composite-indexes', 'isolation-levels-and-anomalies'],
  },
  {
    id: 'insert-update-delete',
    domainId: 'db-sql',
    title: 'INSERT, UPDATE, and DELETE',
    summary:
      'Data modification statements derive a target row set and apply a change subject to constraints. Safe DML makes columns and predicates explicit, previews multirow effects, checks affected counts, and groups dependent changes inside a deliberate transaction boundary.',
    keyPoints: [
      '`INSERT` can add explicit rows or the result of a query; an explicit target column list protects against schema-order coupling.',
      '`UPDATE` changes every target row satisfying its predicate, and `DELETE` removes every satisfying row.',
      {
        text: 'A missing or broad predicate is a set operation, not a prompt.',
        detail:
          'Production databases do not know that an operator intended one row. Preview the exact key set, require expected counts, and make unrestricted changes unmistakable.',
      },
      {
        text: 'Joined multirow writes need one unambiguous source row per target row.',
        detail:
          'If a target matches several source rows, vendor behavior can be erroneous, rejected, or otherwise unsuitable. Aggregate or constrain the source to the intended target key before changing data.',
      },
      'Constraints and triggers can reject or extend a statement; the affected target rows alone may not describe all consequences.',
      'Dependent writes belong in one transaction so callers observe either the complete business change or its rollback.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Derive, verify, then modify' },
      {
        kind: 'code',
        language: 'sql',
        title: 'Portable insertion and targeted update',
        code:
          "INSERT INTO order_items\n  (order_id, line_no, product_id, quantity, unit_price)\nVALUES\n  (:order_id, 1, :product_id, :quantity, :agreed_price);\n\nUPDATE orders\nSET status = 'CANCELLED'\nWHERE order_id = :order_id\n  AND status = 'PENDING';",
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Preview the exact multirow delete set',
        code:
          "SELECT order_id, customer_id, placed_at, status\nFROM orders\nWHERE status = 'CANCELLED'\n  AND placed_at < :retention_cutoff\nORDER BY order_id;\n\nDELETE FROM orders\nWHERE status = 'CANCELLED'\n  AND placed_at < :retention_cutoff;",
      },
      {
        kind: 'table',
        caption: 'Operational checks around a write',
        headers: ['Before', 'During', 'After'],
        rows: [
          ['Select target keys and count them', 'Use a transaction for dependent statements', 'Check affected row count'],
          ['Confirm constraints and cascades', 'Keep batches bounded to control locks/log growth', 'Reconcile invariants or audit output'],
          ['Take the needed backup or recovery point', 'Handle deadlocks/retries at the transaction boundary', 'Commit only when the whole change is valid'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'The status update is a compare-and-set: it succeeds only while the order remains pending. An affected count of zero signals “missing or already transitioned,” not success. Creating an order and its items should be one transaction because either half alone violates the business invariant.',
      },
      {
        kind: 'pitfall',
        title: 'Updating from a non-unique join',
        text:
          'If multiple category rows match one product, using that join as an update source does not define which category value should win. Reduce the source to exactly one row per product using a stated rule, and enforce that rule where possible.',
      },
      {
        kind: 'bestPractice',
        title: 'Make destructive scope reviewable',
        text:
          'Use named parameters, explicit columns, key predicates, expected row-count guards, bounded batches, and audit/returning output where available. Run the preview and write under a transaction policy appropriate to concurrency risk.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.9 — Modification of the Database' },
      { book: 'database-system-concepts', chapter: 'Ch. 4.4 — Transactions' },
      { book: 'sql-performance-explained', chapter: 'Modifying Data — DML performance' },
    ],
    related: ['transactions-and-acid', 'primary-unique-and-check-constraints', 'deadlocks-contention-and-retries'],
  },
  {
    id: 'merge-upsert-and-returning',
    domainId: 'db-sql',
    title: 'MERGE, Upsert, and RETURNING',
    summary:
      'Upsert resolves a uniqueness conflict by inserting, updating, or doing nothing; `MERGE` chooses actions from a source-to-target match; returning features expose changed rows or generated values. These facilities overlap but are not semantically interchangeable across databases.',
    keyPoints: [
      'The conflict or match key is a business rule and should be backed by a primary key or unique constraint.',
      {
        text: 'Upsert is atomic conflict handling, not “select then write.”',
        detail:
          'A prior existence check races with concurrent writers. A single vendor-supported statement lets uniqueness enforcement arbitrate the conflict within the write.',
      },
      {
        text: '`MERGE` is source-target synchronization.',
        detail:
          'It can express matched and unmatched actions, sometimes including deletion. Its source cardinality and match condition must ensure that a target row is not ambiguously matched by multiple source rows.',
      },
      'PostgreSQL and SQLite use `ON CONFLICT`; MySQL uses `ON DUPLICATE KEY UPDATE`; SQL Server and Oracle provide `MERGE`.',
      {
        text: 'Generated-key retrieval is connection and statement sensitive.',
        detail:
          'Prefer row-producing `RETURNING`/`OUTPUT` facilities where available. Connection-scoped identity functions must be consumed on the same connection and have multirow or trigger caveats.',
      },
      'Returned rows describe statement effects, not necessarily every trigger, cascade, or later transaction outcome; commit still determines durability.',
    ],
    blocks: [
      { kind: 'subheading', text: 'One intent, five non-equivalent forms' },
      {
        kind: 'table',
        caption: 'Dialect feature comparison',
        headers: ['Database', 'Conflict/sync form', 'Changed-row output', 'Important caveat'],
        rows: [
          ['PostgreSQL', '`INSERT ... ON CONFLICT` or `MERGE`', '`RETURNING`', 'Conflict target can name/infer a unique arbiter'],
          ['MySQL', '`INSERT ... ON DUPLICATE KEY UPDATE`', 'Connection API / `LAST_INSERT_ID()`', 'Any duplicate unique key may trigger; avoid ambiguous multiple unique keys'],
          ['SQLite', '`INSERT ... ON CONFLICT`', '`RETURNING`', 'Upsert reacts to uniqueness constraints; returning order is arbitrary'],
          ['SQL Server', '`MERGE` or separate DML', '`OUTPUT inserted...`', 'Match condition and concurrency plan require careful testing'],
          ['Oracle', '`MERGE`', '`RETURNING ... INTO` for DML', 'MERGE is join-based; returning binds differ from a result set'],
        ],
      },
      {
        kind: 'code',
        title: 'Upsert product by SKU',
        caption:
          'These statements are not portable equivalents: conflict selection, aliases, concurrency, and output differ. PostgreSQL appears first.',
        variants: [
          { id: 'postgresql', label: 'PostgreSQL', language: 'sql', code: "INSERT INTO products (sku, name, current_price)\nVALUES ($1, $2, $3)\nON CONFLICT (sku) DO UPDATE\nSET name = EXCLUDED.name,\n    current_price = EXCLUDED.current_price\nRETURNING product_id, sku, current_price;" },
          { id: 'mysql', label: 'MySQL', language: 'sql', code: "INSERT INTO products (sku, name, current_price)\nVALUES (?, ?, ?) AS new\nON DUPLICATE KEY UPDATE\n  name = new.name,\n  current_price = new.current_price;" },
          { id: 'sqlite', label: 'SQLite', language: 'sql', code: "INSERT INTO products (sku, name, current_price)\nVALUES (?1, ?2, ?3)\nON CONFLICT (sku) DO UPDATE SET\n  name = excluded.name,\n  current_price = excluded.current_price\nRETURNING product_id, sku, current_price;" },
          { id: 'sql-server', label: 'SQL Server', language: 'sql', code: "MERGE INTO products AS target\nUSING (VALUES (@sku, @name, @price)) AS source (sku, name, current_price)\nON target.sku = source.sku\nWHEN MATCHED THEN\n  UPDATE SET name = source.name, current_price = source.current_price\nWHEN NOT MATCHED THEN\n  INSERT (sku, name, current_price)\n  VALUES (source.sku, source.name, source.current_price)\nOUTPUT inserted.product_id, inserted.sku, inserted.current_price;" },
          { id: 'oracle', label: 'Oracle', language: 'sql', code: "MERGE INTO products target\nUSING (SELECT :sku AS sku, :name AS name, :price AS current_price FROM dual) source\nON (target.sku = source.sku)\nWHEN MATCHED THEN\n  UPDATE SET target.name = source.name, target.current_price = source.current_price\nWHEN NOT MATCHED THEN\n  INSERT (sku, name, current_price)\n  VALUES (source.sku, source.name, source.current_price);" },
        ],
      },
      {
        kind: 'code',
        title: 'Retrieve a generated order key',
        caption: 'Statement output is preferable to a later `MAX(id)` query, which races with other sessions.',
        variants: [
          { id: 'postgresql', label: 'PostgreSQL', language: 'sql', code: "INSERT INTO orders (customer_id, placed_at, status)\nVALUES ($1, CURRENT_TIMESTAMP, 'PENDING')\nRETURNING order_id;" },
          { id: 'mysql', label: 'MySQL', language: 'sql', code: "INSERT INTO orders (customer_id, placed_at, status)\nVALUES (?, CURRENT_TIMESTAMP, 'PENDING');\nSELECT LAST_INSERT_ID() AS order_id;" },
          { id: 'sqlite', label: 'SQLite', language: 'sql', code: "INSERT INTO orders (customer_id, placed_at, status)\nVALUES (?1, CURRENT_TIMESTAMP, 'PENDING')\nRETURNING order_id;" },
          { id: 'sql-server', label: 'SQL Server', language: 'sql', code: "INSERT INTO orders (customer_id, placed_at, status)\nOUTPUT inserted.order_id\nVALUES (@customer_id, CURRENT_TIMESTAMP, 'PENDING');" },
          { id: 'oracle', label: 'Oracle', language: 'sql', code: "INSERT INTO orders (order_id, customer_id, placed_at, status)\nVALUES (orders_seq.NEXTVAL, :customer_id, CURRENT_TIMESTAMP, 'PENDING')\nRETURNING order_id INTO :new_order_id;" },
        ],
      },
      {
        kind: 'paragraph',
        text:
          'A unique constraint on `products.sku` decides whether the incoming SKU is new. PostgreSQL and SQLite name that conflict target; MySQL may react to any violated unique key; SQL Server and Oracle match a source relation to the target. The latter forms therefore demand a source with at most one row per SKU and explicit concurrency testing.',
      },
      {
        kind: 'pitfall',
        title: 'Treating every upsert as equivalent replacement',
        text:
          'Replacing an existing row can fire different constraints, triggers, identity behavior, or delete/insert effects than updating it. State which columns may change on conflict and never overwrite immutable identity or audit fields by accident.',
      },
      {
        kind: 'bestPractice',
        title: 'Anchor concurrency in constraints',
        text:
          'Enforce the conflict key, deduplicate source rows, update only intended columns, capture affected output, and test concurrent attempts under the target database. Document dialect-specific affected-row and trigger behavior at the integration boundary.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.9 and 4.4 — Modification and Transactions' },
      { book: 'postgresql-docs', chapter: 'INSERT — ON CONFLICT and RETURNING' },
      { book: 'mysql-docs', chapter: '15.2.7.2 — INSERT ... ON DUPLICATE KEY UPDATE' },
      { book: 'sqlite-docs', chapter: 'UPSERT; RETURNING' },
      { book: 'sqlserver-docs', chapter: 'MERGE; OUTPUT clause' },
    ],
    related: ['insert-update-delete', 'primary-unique-and-check-constraints', 'transactions-and-acid'],
  },
]
