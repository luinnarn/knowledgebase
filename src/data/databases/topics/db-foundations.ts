import type { Topic } from '../../../types/content'

export const dbFoundationTopics: Topic[] = [
  {
    id: 'relational-model',
    domainId: 'db-foundations',
    title: 'The Relational Model',
    summary:
      'The relational model represents facts as relations and derives new relations with operations grounded in set theory and predicate logic. Its logical abstraction deliberately separates what data means from how a database stores or accesses it.',
    keyPoints: [
      {
        text: 'A relation records the true instances of a predicate.',
        detail:
          'If the predicate is “student S enrolled in course C during term T,” each tuple supplies values for S, C, and T that make that proposition true. Constraints state which possible database states are valid.',
      },
      {
        text: 'The model is logical, not a storage layout.',
        detail:
          'Rows may be stored in heaps, indexes, columnar segments, or distributed partitions without changing the relation perceived by a query. This separation is the basis of physical data independence.',
      },
      'Relations are sets of tuples, so tuple order and duplicate occurrences have no relational meaning.',
      'Relational operators are closed: every operator consumes relations and produces a relation that can feed another operator.',
      {
        text: 'A database is more than its current values.',
        detail:
          'Its schemas, types, keys, and other integrity constraints define the allowed states and preserve the meaning of the recorded facts.',
      },
      'SQL is the dominant relationally inspired language, but SQL tables and results do not always satisfy the mathematical definition of a relation.',
    ],
    blocks: [
      { kind: 'subheading', text: 'From facts to a queryable model' },
      {
        kind: 'paragraph',
        text:
          'Suppose `ENROLLMENT(student_id, course_id, term)` stands for the predicate “student `student_id` is enrolled in course `course_id` during `term`.” The tuple `(42, DB101, 2026-S1)` asserts one true proposition. A query does not navigate pointers from that tuple; it describes a relation to derive, such as all course IDs paired with student 42.',
      },
      {
        kind: 'table',
        caption: 'Three layers that should not be conflated',
        headers: ['Layer', 'Question answered', 'Example'],
        rows: [
          ['Meaning', 'What fact does a tuple assert?', '`student S enrolled in course C during term T`'],
          ['Logical structure', 'Which attributes, domains, and constraints apply?', '`ENROLLMENT(student_id, course_id, term)`'],
          ['Physical implementation', 'How are values encoded and found?', 'Heap pages plus a B-tree on `(student_id, term)`'],
        ],
      },
      {
        kind: 'note',
        title: 'Codd’s central design pressure',
        text:
          'Codd’s 1970 paper argues that application programs should be insulated from changes in internal representation. That goal explains why the model talks about relations and operations rather than record placement or access paths.',
      },
      {
        kind: 'pitfall',
        title: 'Treating a query plan as query meaning',
        text:
          'An index lookup, hash join, or sequential scan is one execution strategy, not the semantics of the query. Tying correctness to a preferred access path makes designs brittle and obscures optimizer freedom.',
      },
      {
        kind: 'bestPractice',
        title: 'State meaning and constraints first',
        text:
          'Define the predicate represented by each relation, choose domains, and encode keys and integrity rules before selecting indexes or partitions. Revisit physical design from measured workloads without changing logical meaning.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 2 — Introduction to the Relational Model' },
      { book: 'codd-relational-model', chapter: 'Sections 1–2' },
      { book: 'sql-relational-theory', chapter: 'Ch. 1 — A Review of the Original Model; Model vs. Implementation' },
      { book: 'sql-relational-theory', chapter: 'Appendix A — The Relational Model Defined; Objectives of the Relational Model' },
    ],
    related: ['relations-tuples-attributes-domains', 'relational-algebra', 'sql-vs-the-relational-model'],
  },
  {
    id: 'relations-tuples-attributes-domains',
    domainId: 'db-foundations',
    title: 'Relations, Tuples, Attributes, and Domains',
    summary:
      'A relation has a heading of named, typed attributes and a body containing tuples that conform to that heading. Domains constrain the values an attribute may take, while tuples associate one value with every attribute by name.',
    keyPoints: [
      {
        text: 'A relation schema declares a heading; a relation instance supplies its current body.',
        detail:
          'The heading fixes attribute names and domains. The body can change over time, but every tuple in every valid instance must conform to the same heading.',
      },
      'A tuple is a mapping from attribute names to values, not merely a left-to-right list.',
      {
        text: 'A domain is the declared set or type from which an attribute draws values.',
        detail:
          'A domain can carry more meaning than a storage representation: `STUDENT_ID` and `COURSE_ID` might both be encoded as integers yet remain conceptually distinct.',
      },
      'Degree is the number of attributes in the heading; cardinality is the number of tuples in the body.',
      'Attribute and tuple order are presentation choices rather than properties of a relation.',
      'Each attribute value is a value of its declared domain; whether a value is “atomic” depends on the operations recognized by the type system, not on how it is printed.',
    ],
    blocks: [
      { kind: 'subheading', text: 'The parts of a relation' },
      {
        kind: 'diagram',
        title: 'Relation structure and conformance',
        code: [
          'flowchart TD',
          '  R["Relation: ENROLLMENT"] --> H["Heading"]',
          '  R --> B["Body: set of tuples"]',
          '  H --> A1["student_id : STUDENT_ID"]',
          '  H --> A2["course_id : COURSE_ID"]',
          '  H --> A3["term : TERM_CODE"]',
          '  B --> T1["Tuple {student_id: 42, course_id: DB101, term: 2026-S1}"]',
          '  A1 --> D1["Domain STUDENT_ID"]',
          '  A2 --> D2["Domain COURSE_ID"]',
          '  A3 --> D3["Domain TERM_CODE"]',
          '  T1 -. "one value per named attribute" .-> H',
        ].join('\n'),
        caption: 'The heading defines names and domains; every tuple in the body conforms to it.',
      },
      {
        kind: 'table',
        caption: 'One relation instance: degree 3, cardinality 3',
        headers: ['student_id', 'course_id', 'term'],
        rows: [
          ['42', 'DB101', '2026-S1'],
          ['42', 'ALG200', '2026-S1'],
          ['77', 'DB101', '2026-S1'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'Reordering the displayed columns to `(term, course_id, student_id)` or sorting the three tuples differently does not create a different relation. Renaming `course_id` does change the heading and therefore requires an explicit rename operation so later expressions still refer to attributes unambiguously.',
      },
      {
        kind: 'pitfall',
        title: 'Using representation as the domain definition',
        text:
          'Declaring every identifier as an unconstrained `INTEGER` says little about valid values and can permit nonsensical comparisons between unrelated identifiers. A shared machine representation does not imply a shared meaning.',
      },
      {
        kind: 'bestPractice',
        title: 'Name attributes by role and constrain their domains',
        text:
          'Use stable, unambiguous attribute names and the narrowest practical types and checks. When two attributes play different semantic roles, document or encode that distinction even if the SQL implementation uses the same base type.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 2.1 — Structure of Relational Databases' },
      { book: 'database-system-concepts', chapter: 'Ch. 2.2 — Database Schema' },
      { book: 'sql-relational-theory', chapter: 'Ch. 2 — Types and Relations' },
      { book: 'sql-relational-theory', chapter: 'Ch. 3 — What’s a Tuple?; What’s a Relation?' },
    ],
    related: ['relational-model', 'keys-and-identity', 'numeric-types-and-precision'],
  },
  {
    id: 'keys-and-identity',
    domainId: 'db-foundations',
    title: 'Keys and Identity',
    summary:
      'A candidate key is a minimal set of attributes whose values uniquely identify every tuple in a relation. Primary keys are selected candidate keys, while superkeys, alternate keys, foreign keys, and surrogate identifiers serve distinct purposes.',
    keyPoints: [
      {
        text: 'A superkey is unique; a candidate key is both unique and irreducible.',
        detail:
          'If `{student_id}` is unique, `{student_id, name}` is also a superkey but is not a candidate key because removing `name` preserves uniqueness.',
      },
      'A relation may have several candidate keys; choosing one as primary does not make the others cease to express identity.',
      {
        text: 'Minimal means no proper subset is a superkey, not “fewest columns among all keys.”',
        detail:
          'Candidate keys can have different numbers of attributes. Each must be irreducible on its own.',
      },
      'A natural key derives from the problem domain; a surrogate key is introduced by the system and still needs domain uniqueness constraints where duplicates are forbidden.',
      'A foreign key expresses inclusion of referencing values in a referenced key and therefore models a relationship, not local tuple identity.',
      'Good identifiers are stable, mandatory, and independent of mutable descriptive data.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Worked candidate-key derivation' },
      {
        kind: 'paragraph',
        text:
          'Consider `ENROLLMENT(student_id, email, course_id, term, grade)` with business rules `student_id → email`, `email → student_id`, and `(student_id, course_id, term) → grade`. A student can take the same course in different terms, and many students share a course and term.',
      },
      {
        kind: 'table',
        caption: 'Attribute-closure reasoning',
        headers: ['Start with', 'Closure under the stated rules', 'Conclusion'],
        rows: [
          ['`{student_id, course_id, term}`', 'Adds `email`, then `grade`; reaches all five attributes', 'Superkey'],
          ['Remove `student_id`', '`{course_id, term}`; cannot obtain student or grade', 'Student component is necessary'],
          ['Remove `course_id`', 'Identifies a student and term, but not which enrollment', 'Course component is necessary'],
          ['Remove `term`', 'Identifies a student and course, but not a particular offering', 'Term component is necessary'],
          ['Replace `student_id` with `email`', '`{email, course_id, term}` obtains `student_id` and `grade`', 'A second candidate key'],
        ],
      },
      {
        kind: 'note',
        title: 'Result',
        text:
          'The candidate keys are `{student_id, course_id, term}` and `{email, course_id, term}`. Adding `grade` to either produces a superkey, but not a candidate key, because `grade` is extraneous.',
      },
      {
        kind: 'pitfall',
        title: 'Surrogate key as a substitute for business integrity',
        text:
          'Adding `enrollment_id` makes each physical row addressable but does not prevent two rows for the same student, course, and term. Without a separate `UNIQUE (student_id, course_id, term)` constraint, the schema permits contradictory duplicate facts.',
      },
      {
        kind: 'bestPractice',
        title: 'Declare every known candidate key',
        text:
          'Choose a compact, stable primary key for references, then enforce other candidate keys with unique and not-null constraints as the SQL dialect requires. Review whether purported key attributes can change, be absent, or be recycled.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 2.3 — Keys' },
      { book: 'database-system-concepts', chapter: 'Ch. 3.2.2 — Basic Schema Definition' },
      { book: 'sql-relational-theory', chapter: 'Ch. 5 — More on Candidate Keys; More on Foreign Keys' },
    ],
    related: ['relations-tuples-attributes-domains', 'functional-dependencies', 'primary-unique-and-check-constraints'],
  },
  {
    id: 'relational-algebra',
    domainId: 'db-foundations',
    title: 'Relational Algebra',
    summary:
      'Relational algebra is a compositional language of operators that transform one or more input relations into an output relation. It describes what relation is derived while leaving the database free to choose an equivalent and efficient execution strategy.',
    keyPoints: [
      'Restriction chooses tuples by a predicate; projection chooses attributes and, in the set model, removes duplicate tuples.',
      'Join combines compatible tuples from two relations according to a condition; a Cartesian product is a join without a restricting condition.',
      {
        text: 'Union, intersection, and difference require compatible headings.',
        detail:
          'Their operands must describe the same attribute roles with corresponding domains. Renaming may be needed before applying a set operator.',
      },
      {
        text: 'Closure makes complex queries composable.',
        detail:
          'Because every result is a relation, an expression can restrict a join, project that result, and then participate in a difference without crossing abstraction levels.',
      },
      'Division answers “for all” questions, such as which students completed every required course.',
      'Equivalent algebraic expressions permit optimizers to reorder and combine operations without changing the result.',
    ],
    blocks: [
      { kind: 'subheading', text: 'From algebra to SQL' },
      {
        kind: 'table',
        caption: 'Core operators and their usual SQL expression',
        headers: ['Relational operation', 'Meaning', 'Typical SQL'],
        rows: [
          ['Restrict `σP(R)`', 'Tuples of `R` satisfying predicate P', '`SELECT * FROM R WHERE P`'],
          ['Project `πA,B(R)`', 'Distinct A/B tuples from `R`', '`SELECT DISTINCT A, B FROM R`'],
          ['Join `R ⋈P S`', 'Compatible R/S tuple combinations satisfying P', '`R JOIN S ON P`'],
          ['Union `R ∪ S`', 'Tuples in R or S or both', '`R_query UNION S_query`'],
          ['Difference `R − S`', 'Tuples in R and not in S', '`R_query EXCEPT S_query`'],
          ['Division `R ÷ S`', 'Left-side values paired with every required S value', 'Nested `NOT EXISTS`, or grouping plus an exact coverage test'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'For `ENROLLMENT(student_id, course_id)` and `REQUIRED(course_id)`, division returns students whose enrollment set covers every required course. The logical test is “there does not exist a required course for which there does not exist a matching enrollment.”',
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Division expressed with two-valued existence tests',
        code:
          'SELECT DISTINCT e.student_id\nFROM enrollment AS e\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM required AS r\n  WHERE NOT EXISTS (\n    SELECT 1\n    FROM enrollment AS taken\n    WHERE taken.student_id = e.student_id\n      AND taken.course_id = r.course_id\n  )\n)',
        caption: 'The double negative implements universal quantification without relying on counts.',
      },
      {
        kind: 'pitfall',
        title: 'Projecting with plain SQL and assuming set semantics',
        text:
          '`SELECT department FROM employee` may return the same department many times, whereas relational projection returns a relation and therefore has no duplicate tuples. Use `DISTINCT` when the algebraic result requires set projection.',
      },
      {
        kind: 'bestPractice',
        title: 'Write the intended relation before tuning syntax',
        text:
          'Identify inputs, desired heading, and tuple predicate, then translate the required restrict/project/join/set operations into SQL. Validate equivalence before adopting a faster rewrite.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 2.5–2.6 — Relational Query Languages; The Relational Algebra' },
      { book: 'sql-relational-theory', chapter: 'Ch. 6 — Restriction; Projection; Join; Union, Intersection, and Difference' },
      { book: 'sql-relational-theory', chapter: 'Ch. 7 — Divide' },
    ],
    related: ['relational-model', 'relational-calculus-and-declarative-queries', 'set-operations', 'gaps-islands-and-relational-division'],
  },
  {
    id: 'relational-calculus-and-declarative-queries',
    domainId: 'db-foundations',
    title: 'Relational Calculus and Declarative Queries',
    summary:
      'Relational calculus describes a result by a predicate its tuples must satisfy rather than by a sequence of operators. This declarative foundation explains why SQL can state conditions with `EXISTS`, `NOT EXISTS`, and quantified comparisons while an optimizer chooses the procedure.',
    keyPoints: [
      {
        text: 'Tuple relational calculus ranges variables over tuples; domain relational calculus ranges variables over attribute values.',
        detail:
          'Both formulate the desired result through predicates and quantifiers rather than prescribing access paths.',
      },
      'Existential quantification asks whether at least one binding makes a predicate true; universal quantification requires every binding to do so.',
      {
        text: 'Universal conditions can be rewritten with existence and negation.',
        detail:
          '“Every required course was taken” is equivalent to “there is no required course that was not taken,” which maps naturally to nested `NOT EXISTS`.',
      },
      'Safe, domain-independent expressions restrict outputs to values grounded in the database rather than ranging over an unbounded universe.',
      'Relational algebra and safe relational calculus are equivalent in expressive power, even though one is operational in form and the other declarative.',
      'Declarative meaning permits many valid physical plans; SQL clause order is not an instruction to execute nested loops in textual order.',
    ],
    blocks: [
      { kind: 'subheading', text: 'A predicate, not a traversal recipe' },
      {
        kind: 'paragraph',
        text:
          'The request “students enrolled in some database course” can be read as a predicate over a candidate student tuple `s`: include `s` if there exists an enrollment `e` and course `c` such that their identifiers match and `c.subject = \'Database\'`. Nothing in that statement chooses an index, join algorithm, or evaluation order.',
      },
      {
        kind: 'table',
        caption: 'Quantifiers in query reasoning',
        headers: ['Intent', 'Logical shape', 'SQL idiom'],
        rows: [
          ['At least one match', '`∃x P(x)`', '`EXISTS (SELECT … WHERE P)`'],
          ['No match', '`¬∃x P(x)`', '`NOT EXISTS (SELECT … WHERE P)`'],
          ['Every x satisfies P', '`∀x P(x)`', '`NOT EXISTS (x WHERE NOT P(x))`'],
          ['A implies B', '`¬A ∨ B`', 'A disjunction or equivalent filtered anti-condition'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Students with at least one database enrollment',
        code:
          'SELECT s.student_id, s.name\nFROM student AS s\nWHERE EXISTS (\n  SELECT 1\n  FROM enrollment AS e\n  JOIN course AS c ON c.course_id = e.course_id\n  WHERE e.student_id = s.student_id\n    AND c.subject = \'Database\'\n)',
      },
      {
        kind: 'pitfall',
        title: 'Counting as a careless substitute for “all”',
        text:
          'Comparing raw row counts can be fooled by duplicate enrollments or unrelated courses. If counts are used, both sides need precisely aligned sets; nested `NOT EXISTS` often states the quantification more directly.',
      },
      {
        kind: 'bestPractice',
        title: 'Translate English quantifiers explicitly',
        text:
          'Mark words such as “some,” “none,” and “every,” write the corresponding predicate, and test empty-set cases. In particular, a universal condition is vacuously true when there are no required values unless the business rule says otherwise.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 2.5 — Relational Query Languages' },
      { book: 'sql-relational-theory', chapter: 'Ch. 10 — Quantification; Relational Calculus' },
      {
        book: 'sql-relational-theory',
        chapter: 'Ch. 11 — Example 2: Universal Quantification; Example 4: Correlated Subqueries',
      },
      { book: 'codd-relational-model', chapter: 'Section 1.5 — Some Linguistic Aspects' },
    ],
    related: ['relational-algebra', 'subqueries-and-correlation', 'exists-in-and-null-traps'],
  },
  {
    id: 'set-vs-bag-semantics',
    domainId: 'db-foundations',
    title: 'Set vs. Bag Semantics',
    summary:
      'Relations use set semantics, so a tuple is either present or absent; SQL query results commonly use bag semantics, so equal rows may occur multiple times. Correct SQL reasoning must track when multiplicity is preserved, multiplied, or deliberately removed.',
    keyPoints: [
      'Set semantics record membership, while bag semantics also record the multiplicity of each value.',
      {
        text: 'Plain SQL projection normally preserves duplicates.',
        detail:
          '`SELECT department_id FROM employee` emits one row per employee; `SELECT DISTINCT department_id` collapses equal projected rows.',
      },
      'Joins can multiply multiplicities: m matching left rows and n matching right rows can produce m × n result rows for a key value.',
      'SQL `UNION`, `INTERSECT`, and `EXCEPT` eliminate duplicates by default; their `ALL` forms apply bag semantics.',
      {
        text: 'Duplicate elimination has semantic and performance consequences.',
        detail:
          'It may require sorting or hashing and can hide an accidental many-to-many join. Add `DISTINCT` because the result means a set, not as a reflexive cleanup step.',
      },
      'C.J. Date argues that duplicates violate the relational model; practical SQL deliberately supports them and defines their behavior.',
    ],
    blocks: [
      { kind: 'subheading', text: 'A duplicate demonstration' },
      {
        kind: 'table',
        caption: '`EMPLOYEE(employee_id, department)` input',
        headers: ['employee_id', 'department'],
        rows: [
          ['1', 'Engineering'],
          ['2', 'Engineering'],
          ['3', 'Sales'],
        ],
      },
      {
        kind: 'table',
        caption: 'Projecting department under two semantics',
        headers: ['Expression', 'Result values', 'Multiplicity'],
        rows: [
          ['Relational `πdepartment(EMPLOYEE)`', '`{Engineering, Sales}`', 'Each tuple once'],
          ['SQL `SELECT department FROM employee`', '`[Engineering, Engineering, Sales]`', 'Engineering twice'],
          ['SQL `SELECT DISTINCT department FROM employee`', '`[Engineering, Sales]`', 'Each result row once'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Bag-preserving and duplicate-eliminating forms',
        code:
          'SELECT department FROM employee;\nSELECT DISTINCT department FROM employee;\n\nSELECT department FROM current_departments\nUNION ALL\nSELECT department FROM planned_departments;\n\nSELECT department FROM current_departments\nUNION\nSELECT department FROM planned_departments;',
      },
      {
        kind: 'note',
        title: 'Date’s position and pragmatic SQL',
        text:
          'Date presents “no duplicates” as a requirement of faithful relational practice and recommends explicit duplicate elimination where SQL permits bags. SQL systems take a pragmatic position: bags are the default for `SELECT`, preserve meaningful counts, and can avoid unnecessary deduplication; set behavior remains available through `DISTINCT` and non-`ALL` set operations.',
      },
      {
        kind: 'pitfall',
        title: 'Using DISTINCT to mask a faulty join',
        text:
          'If an incomplete join predicate creates a many-to-many multiplication, `DISTINCT` may make sample output look right while aggregates and later changes remain wrong. Diagnose the source cardinalities and join keys first.',
      },
      {
        kind: 'bestPractice',
        title: 'Annotate multiplicity while designing a query',
        text:
          'For every join and projection, ask what identifies an output row and whether repeated equal rows carry meaning. Use `UNION ALL` when multiplicity is intended, or when each input is duplicate-free and the inputs are disjoint; use set operators when membership is the intended result.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.4, Note 3.1 — SQL and Multiset Relational Algebra' },
      { book: 'database-system-concepts', chapter: 'Ch. 3.5 — Set Operations' },
      { book: 'sql-relational-theory', chapter: 'Ch. 4 — What’s Wrong with Duplicates?; Avoiding Duplicates in SQL' },
      { book: 'postgresql-docs', chapter: 'Ch. 7.3.3 — DISTINCT; Ch. 7.4 — Combining Queries' },
    ],
    related: ['relational-algebra', 'set-operations', 'grouping-and-aggregation', 'sql-vs-the-relational-model'],
  },
  {
    id: 'nulls-and-three-valued-logic',
    domainId: 'db-foundations',
    title: 'Nulls and Three-Valued Logic',
    summary:
      'SQL `NULL` marks the absence of a regular value and makes many comparisons evaluate to `UNKNOWN`, producing three-valued logic rather than ordinary Boolean logic. Because filtering retains only `TRUE`, correct queries must account for `UNKNOWN` explicitly.',
    keyPoints: [
      'Ordinary comparison with `NULL`, including `NULL = NULL`, evaluates to `UNKNOWN`; use `IS NULL` and `IS NOT NULL`, not `= NULL` or `<> NULL`.',
      {
        text: 'Most comparisons with NULL produce UNKNOWN.',
        detail:
          '`salary > 50000` is `UNKNOWN` when salary is null. `WHERE` filters rows and `HAVING` filters groups; both retain only conditions that evaluate to `TRUE`.',
      },
      '`NOT UNKNOWN` remains `UNKNOWN`; negating a nullable comparison does not necessarily include the rows the comparison excluded.',
      '`FALSE AND UNKNOWN` is `FALSE`, while `TRUE OR UNKNOWN` is `TRUE`; the known operand can determine the result.',
      {
        text: 'NOT IN is vulnerable to a single NULL on its right side.',
        detail:
          'If no equality succeeds and any right-side comparison is unknown, `x NOT IN (subquery)` is unknown rather than true, so the row is filtered out.',
      },
      'Date argues for avoiding nulls and retaining two-valued relational logic; mainstream SQL practice accepts nulls but requires deliberate constraints and null-aware predicates.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Complete SQL three-valued truth tables' },
      {
        kind: 'table',
        caption: 'AND and OR for every pair of truth values',
        headers: ['p', 'q', 'p AND q', 'p OR q'],
        rows: [
          ['TRUE', 'TRUE', 'TRUE', 'TRUE'],
          ['TRUE', 'FALSE', 'FALSE', 'TRUE'],
          ['TRUE', 'UNKNOWN', 'UNKNOWN', 'TRUE'],
          ['FALSE', 'TRUE', 'FALSE', 'TRUE'],
          ['FALSE', 'FALSE', 'FALSE', 'FALSE'],
          ['FALSE', 'UNKNOWN', 'FALSE', 'UNKNOWN'],
          ['UNKNOWN', 'TRUE', 'UNKNOWN', 'TRUE'],
          ['UNKNOWN', 'FALSE', 'FALSE', 'UNKNOWN'],
          ['UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN'],
        ],
      },
      {
        kind: 'table',
        caption: 'NOT for every truth value',
        headers: ['p', 'NOT p'],
        rows: [
          ['TRUE', 'FALSE'],
          ['FALSE', 'TRUE'],
          ['UNKNOWN', 'UNKNOWN'],
        ],
      },
      { kind: 'subheading', text: 'The NOT IN / NULL trap' },
      {
        kind: 'paragraph',
        text:
          'Assume `blocked_customer(customer_id)` returns `(7)` and `(NULL)`. For customer 12, `12 NOT IN (7, NULL)` is equivalent to `12 <> 7 AND 12 <> NULL`: `TRUE AND UNKNOWN` becomes `UNKNOWN`, and `WHERE` discards the row. Customer 12 is therefore not returned even though 12 does not equal 7.',
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Null-safe anti-membership',
        code:
          'SELECT c.customer_id\nFROM customer AS c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM blocked_customer AS b\n  WHERE b.customer_id = c.customer_id\n);',
        caption: '`NOT EXISTS` tests whether a matching row exists and is not poisoned by unrelated nulls.',
      },
      {
        kind: 'pitfall',
        title: 'Assuming excluded and negated predicates are complements',
        text:
          '`WHERE salary > 50000` and `WHERE NOT (salary > 50000)` both exclude null salaries. If null means “unknown salary,” decide explicitly whether those rows belong in either business category.',
      },
      {
        kind: 'bestPractice',
        title: 'Constrain absence and test it intentionally',
        text:
          'Use `NOT NULL` when a fact is mandatory. Otherwise define what absence means, prefer `NOT EXISTS` for anti-joins, and add test cases with null on the left, null on the right, no matches, and actual matches.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 3.6 — Null Values' },
      { book: 'sql-relational-theory', chapter: 'Ch. 4 — What’s Wrong with Nulls?; Avoiding Nulls in SQL' },
      { book: 'sql-relational-theory', chapter: 'Ch. 10 — Simple and Compound Propositions' },
      { book: 'postgresql-docs', chapter: 'Ch. 9.24.3 — NOT IN' },
    ],
    related: ['exists-in-and-null-traps', 'null-boolean-collation-and-expression-differences', 'primary-unique-and-check-constraints'],
  },
  {
    id: 'sql-vs-the-relational-model',
    domainId: 'db-foundations',
    title: 'SQL vs. the Relational Model',
    summary:
      'SQL is relationally inspired but is not a direct notation for the pure relational model: it permits duplicates, nulls, ordered presentation, and other constructs outside that model. Treating the model as a semantic compass while understanding SQL’s defined behavior produces more accurate and maintainable queries.',
    keyPoints: [
      'A SQL base table with a key, non-null attributes, and no duplicate rows can closely represent a relation, but SQL does not require every table or result to do so.',
      {
        text: 'SQL defaults to bags; relations are sets.',
        detail:
          'Projection in the model removes duplicate tuples by definition, while a plain SQL `SELECT` preserves equal result rows unless `DISTINCT` or a set operator removes them.',
      },
      'SQL nulls introduce `UNKNOWN` and three-valued predicates; the classical relational model uses ordinary values and two-valued logic.',
      'SQL columns have a written order and query output can be sorted, whereas relation attributes and tuples have no intrinsic order.',
      {
        text: 'SQL syntax mixes logical expression with practical language features.',
        detail:
          'Aggregation, ordering, window functions, updates, transactions, and physical objects make SQL useful as a database language even when they are not primitive relational operators.',
      },
      'Relational reasoning remains valuable because it clarifies identity, predicates, closure, and equivalent transformations beneath product-specific syntax.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Principle and practice' },
      {
        kind: 'table',
        caption: 'Pure relational position compared with pragmatic SQL behavior',
        headers: ['Issue', 'Relational position', 'Pragmatic SQL behavior'],
        rows: [
          ['Duplicates', 'A relation is a set; duplicate tuples do not exist', '`SELECT` uses bags by default; `DISTINCT` and set operators can deduplicate'],
          ['Missing information', 'Date argues that null markers and three-valued logic should be avoided', 'SQL supports `NULL`; comparisons can yield `UNKNOWN`, and schemas commonly permit it'],
          ['Ordering', 'No intrinsic tuple or attribute order', 'Columns have a presentation order; `ORDER BY` creates an ordered query result'],
          ['Identity', 'Every relation has at least one candidate key, including possible compound or empty keys', 'SQL tables may be declared without any key'],
          ['Operator result', 'Relational closure always yields a relation', 'Some SQL results may contain duplicate rows, anonymous expressions, or implementation-specific types'],
        ],
      },
      {
        kind: 'note',
        title: 'An attributed disagreement, not a settled slogan',
        text:
          'C.J. Date’s Appendix B presents duplicates, nulls, left-to-right column ordering, and several other SQL features as departures from the relational model, and his chapters recommend writing SQL in a more relational style. That is a principled critique, not universal industry consensus: production SQL systems intentionally expose bag semantics and nulls, and applications often use them successfully when their exact rules are understood.',
      },
      {
        kind: 'paragraph',
        text:
          'For example, `SELECT department_id FROM employee` is a valid SQL query whose repeated department IDs can be useful when a later aggregate counts employees. It is not relational projection as defined by set algebra. Adding `DISTINCT` makes the result set-like; leaving it out is equally legitimate when multiplicity is part of the intended calculation.',
      },
      {
        kind: 'pitfall',
        title: 'Arguing from labels instead of semantics',
        text:
          'Calling every table a relation can conceal missing keys, duplicate facts, and nullable predicates. Conversely, rejecting useful SQL solely because it is not a primitive relational operator ignores the language’s practical scope.',
      },
      {
        kind: 'bestPractice',
        title: 'Use the model as a correctness checklist',
        text:
          'For each SQL query, state the intended output predicate and key, decide whether multiplicity and nulls are meaningful, and require `ORDER BY` only for presentation. Label dialect-specific behavior and verify it against current product documentation.',
      },
      {
        kind: 'diagram',
        title: 'From relational intent to an executable SQL result',
        code: [
          'flowchart LR',
          '  I["Relational intent: predicate, heading, keys"] --> T["SQL translation"]',
          '  T --> D{"Duplicates or NULL possible?"}',
          '  D -->|"Yes"| R["Apply explicit bag/null reasoning"]',
          '  D -->|"No"| V["Validate result predicate"]',
          '  R --> V',
          '  V --> P["Optimizer chooses physical plan"]',
        ].join('\n'),
      },
    ],
    refs: [
      { book: 'sql-relational-theory', chapter: 'Ch. 1 — Model vs. Implementation; Properties of Relations' },
      { book: 'sql-relational-theory', chapter: 'Appendix B — SQL Departures from the Relational Model' },
      {
        book: 'database-system-concepts',
        chapter:
          'Ch. 3.3–3.6 — Basic Structure of SQL Queries; Additional Basic Operations; Set Operations; Null Values',
      },
      { book: 'codd-relational-model', chapter: 'Sections 1–2' },
      { book: 'postgresql-docs', chapter: 'Ch. 7.3.3 — DISTINCT; Ch. 7.5 — Sorting Rows' },
    ],
    related: ['relational-model', 'set-vs-bag-semantics', 'nulls-and-three-valued-logic', 'sql-portability-strategy'],
  },
]
