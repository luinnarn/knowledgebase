import type { Topic } from '../../../types/content'

export const dbModelingTopics: Topic[] = [
  {
    id: 'conceptual-logical-physical-models',
    domainId: 'db-modeling',
    title: 'Conceptual, Logical, and Physical Models',
    summary:
      'Database design moves from business meaning, through a technology-neutral logical structure, to a system-specific physical implementation. Keeping those decisions distinct preserves meaning while allowing storage and access paths to evolve.',
    keyPoints: [
      {
        text: 'Requirements describe facts, rules, and questions before they describe tables.',
        detail:
          'For commerce, start with statements such as “a placed order belongs to one customer” and “an order line freezes the agreed price.” These expose identity, cardinality, history, and integrity requirements without prematurely choosing columns.',
      },
      {
        text: 'A conceptual model names the enterprise concepts and their relationships.',
        detail:
          'Customers, orders, products, and categories are visible to domain experts. Indexes, partition keys, and generated identifiers are normally absent because they do not explain the business meaning.',
      },
      {
        text: 'A logical model maps concepts to relations, attributes, keys, and constraints.',
        detail:
          'The logical commerce model separates `customers`, `orders`, `order_items`, and `products`, chooses candidate keys, and states foreign-key and dependency rules independently of a particular storage engine.',
      },
      {
        text: 'A physical model chooses implementation details for a measured workload.',
        detail:
          'Indexes, clustering, partitioning, compression, and materialized results belong here. They should improve access without silently changing what an order or product fact means.',
      },
      'The process is iterative: transaction needs can reveal a missing concept, while normalization can reveal a conceptual modeling error.',
      'Logical changes usually reach more application code than physical changes, so meaning and constraints deserve the earliest review.',
    ],
    blocks: [
      { kind: 'subheading', text: 'One requirement at three levels' },
      {
        kind: 'table',
        caption: 'The same commerce requirement viewed through three design lenses',
        headers: ['Level', 'Question', 'Commerce decision'],
        rows: [
          ['Conceptual', 'Which facts and rules matter?', 'A customer places orders; each order contains one or more product lines'],
          ['Logical', 'How are facts and constraints represented?', '`orders.customer_id` references `customers`; `order_items` is identified within an order'],
          ['Physical', 'How will this workload be stored and found?', 'Index `orders(customer_id, placed_at)`; consider time partitioning only after measurement'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Design refinement and feedback',
        code: [
          'flowchart LR',
          '  R["Requirements: facts, rules, workload"] --> C["Conceptual: entities and relationships"]',
          '  C --> L["Logical: relations, keys, constraints"]',
          '  L --> P["Physical: indexes, layout, partitions"]',
          '  P -. "measure" .-> R',
          '  L -. "dependency exposes missing concept" .-> C',
        ].join('\n'),
        caption: 'Refinement is directional, but validation feeds discoveries back to earlier levels.',
      },
      {
        kind: 'paragraph',
        text:
          'A useful baseline is `customers(customer_id, email, name)`, `orders(order_id, customer_id, placed_at, status)`, `products(product_id, sku, name, current_price)`, and `order_items(order_id, line_no, product_id, quantity, unit_price)`. The logical model records `unit_price` on the line because it is the price agreed for that transaction, not a redundant copy of the product\'s current price.',
      },
      {
        kind: 'pitfall',
        title: 'Starting from an ORM class graph',
        text:
          'Object navigation, inheritance defaults, and collection fields are application choices. Treating them as requirements can produce nullable foreign keys, opaque join tables, and identities that fail to encode business rules.',
      },
      {
        kind: 'bestPractice',
        title: 'Keep a decision ledger',
        text:
          'For each schema choice, record the requirement, invariant, alternatives, and level. “Index for recent customer orders” can then change independently of “an order belongs to exactly one customer.”',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 6.1 — Overview of the Design Process' },
      { book: 'database-system-concepts', chapter: 'Ch. 6.9 — Entity-Relationship Design Issues' },
      { book: 'sql-relational-theory', chapter: 'Ch. 5 — Base Relvars, Base Tables' },
    ],
    related: ['entity-relationship-modeling', 'normalization-through-bcnf', 'index-mental-model'],
  },
  {
    id: 'entity-relationship-modeling',
    domainId: 'db-modeling',
    title: 'Entity-Relationship Modeling',
    summary:
      'Entity-relationship modeling turns requirements into identifiable entity sets, descriptive attributes, relationships, and participation constraints. Its value is not the drawing itself but the explicit decisions about identity, cardinality, and optionality.',
    keyPoints: [
      {
        text: 'An entity has independent identity; an attribute describes an entity or relationship.',
        detail:
          'A product is an entity because other facts refer to it. `product_name` is an attribute. A category assignment may begin as a relationship and become an associative entity when it needs dates, rank, or provenance.',
      },
      {
        text: 'Cardinality states the maximum number of participants; optionality states the minimum.',
        detail:
          'A customer may place zero or many orders, while every order must have exactly one customer. These are separate assertions and should appear in both diagrams and constraints.',
      },
      {
        text: 'Many-to-many relationships become associative relations.',
        detail:
          'An order contains many products and a product appears in many orders. `order_items` resolves this relationship and carries relationship attributes such as quantity and transaction price.',
      },
      {
        text: 'Weak or dependent entities need the owner identity plus a discriminator.',
        detail:
          'An order line can use `(order_id, line_no)` as its identity: `line_no` has meaning only within an order. A surrogate `order_item_id` does not remove the need to enforce the owner-scoped candidate key.',
      },
      'Relationship roles must be named when the same entity participates more than once, such as `billing_customer` and `recipient_customer`.',
      'Generalization and specialization require explicit completeness and overlap rules before choosing a table mapping.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Cardinality and optionality in the commerce core' },
      {
        kind: 'diagram',
        title: 'Commerce ER model',
        code: [
          'erDiagram',
          '  CUSTOMER ||--o{ ORDER : places',
          '  ORDER ||--|{ ORDER_ITEM : contains',
          '  PRODUCT ||--o{ ORDER_ITEM : appears_on',
          '  PRODUCT }o--o{ CATEGORY : classified_as',
          '  CUSTOMER {',
          '    bigint customer_id PK',
          '    string email UK',
          '  }',
          '  ORDER {',
          '    bigint order_id PK',
          '    bigint customer_id FK',
          '  }',
          '  ORDER_ITEM {',
          '    bigint order_id PK_FK',
          '    int line_no PK',
          '    bigint product_id FK',
          '    decimal unit_price',
          '  }',
          '  PRODUCT {',
          '    bigint product_id PK',
          '    string sku UK',
          '  }',
          '  CATEGORY {',
          '    bigint category_id PK',
          '  }',
        ].join('\n'),
        caption:
          '`||` means exactly one, `o{` zero or many, and `|{` one or many. The conceptual rule “an order must contain a line” may need transaction-level enforcement beyond a row-local foreign key.',
      },
      {
        kind: 'table',
        caption: 'Reading both ends of each relationship',
        headers: ['Relationship', 'Rule from left to right', 'Rule from right to left'],
        rows: [
          ['Customer–Order', 'A customer may place zero or many orders', 'Each order has exactly one customer'],
          ['Order–Order item', 'Each order has one or more lines', 'Each line belongs to exactly one order'],
          ['Product–Order item', 'A product may appear on zero or many lines', 'Each line names exactly one product'],
          ['Product–Category', 'A product may have zero or many categories', 'A category may classify zero or many products'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'Mapping the model creates foreign keys on the many side and bridge relations for many-to-many relationships. Some minimum-cardinality rules are not row local: inserting the order header before its first line temporarily violates “one or more,” so enforce that rule at a transaction or workflow boundary rather than inventing a nullable line column on `orders`.',
      },
      {
        kind: 'pitfall',
        title: 'Turning every noun into an entity',
        text:
          'A value object such as money may be an attribute composed of amount and currency, while a tax jurisdiction may need independent identity and history. Decide from lifecycle, identity, references, and constraints—not grammar alone.',
      },
      {
        kind: 'bestPractice',
        title: 'Read every relationship aloud in both directions',
        text:
          'Use concrete minimum and maximum phrases, validate them with domain experts, and test boundary examples: a customer with no orders, an abandoned empty cart, a discontinued product, and a category with no products.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 6.2–6.5 — The E-R Model; Cardinalities; Keys' },
      { book: 'database-system-concepts', chapter: 'Ch. 6.7 — Reducing E-R Diagrams to Relational Schemas' },
      { book: 'database-system-concepts', chapter: 'Ch. 6.8 — Extended E-R Features' },
    ],
    related: ['conceptual-logical-physical-models', 'functional-dependencies', 'modeling-hierarchies-and-graphs'],
  },
  {
    id: 'functional-dependencies',
    domainId: 'db-modeling',
    title: 'Functional Dependencies',
    summary:
      'A functional dependency `X → Y` states that any two legal tuples agreeing on X must agree on Y. Dependencies capture stable business rules, support candidate-key derivation, and reveal where one relation mixes facts with different determinants.',
    keyPoints: [
      {
        text: 'Dependencies are assertions about every legal state, not coincidences in sample data.',
        detail:
          'A sample may show one product per SKU, but `sku → product_id` is valid only if the business guarantees that SKU is never reused for another product.',
      },
      {
        text: 'A determinant need not be a declared key.',
        detail:
          'In a poorly combined relation, `product_id → sku, product_name` still holds even when product ID identifies only part of a row. That non-key determinant signals repeated product facts.',
      },
      {
        text: 'Attribute closure tests whether a set determines all attributes.',
        detail:
          'Start with X, repeatedly add attributes reachable through dependencies, and stop at a fixed point. X is a superkey when its closure contains the whole relation heading.',
      },
      'A candidate key is a minimal superkey: every attribute in it must be necessary for reaching the full closure.',
      'Armstrong\'s reflexivity, augmentation, and transitivity rules derive exactly the dependencies implied by a set.',
      'A minimal cover simplifies normalization by using singleton right sides and removing extraneous attributes and redundant dependencies.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Closure and candidate keys for an order-line relation' },
      {
        kind: 'paragraph',
        text:
          'Let `R(order_id, line_no, customer_id, placed_at, product_id, sku, quantity, unit_price)` obey F = {`order_id → customer_id, placed_at`; `product_id → sku`; `sku → product_id`; `(order_id, line_no) → product_id, quantity, unit_price`}. The last rule identifies a line within its order; the first two encode header and product facts.',
      },
      {
        kind: 'table',
        caption: 'Deriving `(order_id, line_no)+`',
        headers: ['Step', 'Dependency applied', 'Closure after step'],
        rows: [
          ['0', 'Seed', '`{order_id, line_no}`'],
          ['1', '`order_id → customer_id, placed_at`', 'Add `customer_id, placed_at`'],
          ['2', '`(order_id, line_no) → product_id, quantity, unit_price`', 'Add `product_id, quantity, unit_price`'],
          ['3', '`product_id → sku`', 'Add `sku`; all attributes reached'],
        ],
      },
      {
        kind: 'table',
        caption: 'Minimality and an alternate candidate key',
        headers: ['Starting set', 'What its closure misses', 'Conclusion'],
        rows: [
          ['`{order_id}`', '`line_no, product_id, sku, quantity, unit_price`', '`line_no` is necessary'],
          ['`{line_no}`', 'Header identity and all attributes outside the local line number', '`order_id` is necessary'],
          ['`{order_id, line_no}`', 'Nothing', 'Candidate key'],
          ['`{order_id, line_no, sku}`', 'Nothing, but `sku` is removable', 'Superkey, not candidate key'],
        ],
      },
      {
        kind: 'note',
        title: 'What closure does not prove',
        text:
          'Closure proves implication relative to the stated FDs. It does not prove that the FDs describe the business. Validate SKU reuse, order-line numbering, and whether `placed_at` can be corrected before treating the result as design truth.',
      },
      {
        kind: 'pitfall',
        title: 'Inferring dependencies from current uniqueness',
        text:
          'If every current customer has a distinct surname, the data suggests `surname → customer_id`; the domain does not. False dependencies drive invalid decompositions and constraints that reject legitimate future data.',
      },
      {
        kind: 'bestPractice',
        title: 'Attach provenance to each dependency',
        text:
          'Record whether an FD comes from identity, policy, an external authority, or a temporary application assumption. Revisit dependencies when identifiers are merged, recycled, scoped by tenant, or made temporal.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 7.2 — Decomposition Using Functional Dependencies' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.4 — Functional-Dependency Theory' },
      { book: 'sql-relational-theory', chapter: 'Ch. 5 — Candidate Keys; Functional Dependency' },
    ],
    related: ['keys-and-identity', 'normalization-through-bcnf', 'higher-normal-forms-and-decomposition'],
  },
  {
    id: 'normalization-through-bcnf',
    domainId: 'db-modeling',
    title: 'Normalization Through BCNF',
    summary:
      'Normalization decomposes a relation so each fact is governed by the appropriate key, reducing update anomalies without losing information. The practical path from 1NF through 3NF and BCNF is driven by dependencies, not by counting tables.',
    keyPoints: [
      {
        text: 'First normal form gives each attribute one value from its domain.',
        detail:
          'Repeating product groups or comma-separated product IDs prevent ordinary keys, foreign keys, and relational operators from addressing each order line independently.',
      },
      {
        text: 'Second normal form removes non-key facts dependent on only part of a composite key.',
        detail:
          'With `(order_id, line_no)` as the line key, customer and order date depend on `order_id` alone, while product description depends on `product_id`, not the whole line key.',
      },
      {
        text: 'Third normal form removes transitive non-key dependencies while preserving a synthesis path.',
        detail:
          'If `product_id → category_id` and `category_id → category_name`, storing category name on the product relation makes it depend transitively on product ID.',
      },
      {
        text: 'BCNF requires every determinant of a nontrivial FD to be a superkey.',
        detail:
          'BCNF is stricter than 3NF when overlapping candidate keys allow a dependency whose right side is prime but whose determinant is not a superkey.',
      },
      'Normalization removes representation anomalies; it cannot decide whether a business rule or identity assumption is correct.',
      'A sound decomposition must be lossless, and dependency preservation should be evaluated separately.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Stepwise commerce normalization' },
      {
        kind: 'table',
        caption: 'From a denormalized order document to focused relations',
        headers: ['Stage', 'Shape', 'Problem removed'],
        rows: [
          ['Unnormalized', '`ORDER(order_id, customer…, items[{product…, qty, price}])`', 'Repeating group is not independently constrainable'],
          ['1NF', '`ORDER_LINE_FLAT(order_id, line_no, customer_id, customer_email, placed_at, product_id, sku, product_name, category_id, category_name, qty, unit_price)`', 'One line fact per tuple'],
          ['2NF', '`ORDERS` + `ORDER_ITEMS`; product facts still repeated on lines', 'Header attributes no longer repeat for every line'],
          ['3NF', '`CUSTOMERS`, `ORDERS`, `ORDER_ITEMS`, `PRODUCTS`, `CATEGORIES`', 'Customer, product, and category facts each have their own determinant'],
          ['BCNF check', 'Every nontrivial determinant in each relation is a candidate key', 'No remaining FD has a non-key determinant'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Normalized logical schema',
        code:
          'CREATE TABLE customers (\n  customer_id BIGINT PRIMARY KEY,\n  email VARCHAR(320) NOT NULL UNIQUE,\n  name VARCHAR(200) NOT NULL\n);\n\nCREATE TABLE orders (\n  order_id BIGINT PRIMARY KEY,\n  customer_id BIGINT NOT NULL REFERENCES customers(customer_id),\n  placed_at TIMESTAMP NOT NULL,\n  status VARCHAR(30) NOT NULL\n);\n\nCREATE TABLE products (\n  product_id BIGINT PRIMARY KEY,\n  sku VARCHAR(80) NOT NULL UNIQUE,\n  name VARCHAR(200) NOT NULL\n);\n\nCREATE TABLE order_items (\n  order_id BIGINT NOT NULL REFERENCES orders(order_id),\n  line_no INTEGER NOT NULL,\n  product_id BIGINT NOT NULL REFERENCES products(product_id),\n  quantity INTEGER NOT NULL CHECK (quantity > 0),\n  unit_price DECIMAL(19, 4) NOT NULL CHECK (unit_price >= 0),\n  PRIMARY KEY (order_id, line_no)\n);',
        caption: '`unit_price` remains on the line because transaction price is a line fact, not the product\'s mutable current price.',
      },
      {
        kind: 'table',
        caption: 'Anomalies removed from the flat relation',
        headers: ['Anomaly', 'Flat-table failure', 'Normalized result'],
        rows: [
          ['Update', 'Changing a product name requires every historical line copy', 'Update one `products` tuple'],
          ['Insert', 'A product cannot exist before its first order', 'Insert it independently into `products`'],
          ['Delete', 'Deleting the last line for a product erases the catalog fact', 'Order history and catalog lifecycle are independent'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Normalizing away transaction facts',
        text:
          'Replacing `order_items.unit_price` with a join to `products.current_price` changes history whenever the catalog price changes. Similar names do not imply the same predicate or determinant.',
      },
      {
        kind: 'bestPractice',
        title: 'Name the predicate after every decomposition',
        text:
          'Each relation should state one coherent fact, have declared candidate keys, and encode the dependencies that justify its shape. Then verify losslessness and the operations needed to enforce remaining dependencies.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 7.1 — Features of Good Relational Designs' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.3 — Normal Forms' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.5 — Algorithms for Decomposition Using Functional Dependencies' },
      { book: 'sql-antipatterns', chapter: 'Appendix A — Rules of Normalization' },
    ],
    related: ['functional-dependencies', 'higher-normal-forms-and-decomposition', 'denormalization-tradeoffs'],
  },
  {
    id: 'higher-normal-forms-and-decomposition',
    domainId: 'db-modeling',
    title: 'Higher Normal Forms and Decomposition',
    summary:
      'Beyond BCNF, multivalued and join dependencies expose relations that combine independent many-valued facts. Decomposition is useful only when joins reconstruct exactly the legal information and important constraints remain enforceable.',
    keyPoints: [
      {
        text: 'A lossless decomposition reconstructs exactly the original relation.',
        detail:
          'For a binary decomposition of R into R1 and R2, the shared attributes must determine all of R1 or all of R2 under the dependencies. Otherwise the natural join may invent spurious tuples.',
      },
      {
        text: 'Dependency preservation asks whether constraints can be checked without joining decomposed relations.',
        detail:
          'Losslessness protects information; preservation protects local enforceability. A decomposition can satisfy one property without satisfying the other.',
      },
      {
        text: 'Fourth normal form separates independent multivalued facts.',
        detail:
          'If products have independent categories and suppliers, combining both into `product_options(product_id, category_id, supplier_id)` implies a cross-product and repeats each fact.',
      },
      {
        text: 'Fifth normal form addresses nontrivial join dependencies not implied by keys.',
        detail:
          'It matters when only particular combinations of three or more relationships are legal and pairwise projections can reconstruct them exactly; such rules require careful domain evidence.',
      },
      '3NF synthesis favors dependency preservation, while BCNF decomposition may sacrifice it for stronger redundancy control.',
      'A join that happens to reproduce one sample is not proof of losslessness for every legal instance.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Lossless versus lossy decomposition' },
      {
        kind: 'table',
        caption: 'Original `PRODUCT_CATEGORY(product_id, category_id, category_label)`',
        headers: ['product_id', 'category_id', 'category_label'],
        rows: [
          ['P1', 'C10', 'Shoes'],
          ['P2', 'C20', 'Sale'],
        ],
      },
      {
        kind: 'table',
        caption: 'Two decompositions and their joins',
        headers: ['Decomposition', 'Shared determinant', 'Join result'],
        rows: [
          ['`PRODUCT_CATEGORY(product_id, category_id)` + `CATEGORY(category_id, category_label)`', '`category_id → category_label`', 'Lossless: each category ID restores its one label'],
          ['`PRODUCT_LABEL(product_id, category_label)` + `CATEGORY_LABEL(category_id, category_label)`', '`category_label` is not unique', 'Lossy when multiple categories share a label; product/category combinations are invented'],
        ],
      },
      {
        kind: 'paragraph',
        text:
          'A concrete lossy case uses two category IDs `C10` and `C11`, both labeled “Shoes,” and products independently projected by label. Joining on the label pairs every “Shoes” product with both IDs, even when the original contained only one pairing. The projections discarded the association that distinguished legal tuples.',
      },
      {
        kind: 'diagram',
        title: 'Separating two independent multivalued facts',
        code: [
          'flowchart TD',
          '  X["PRODUCT_CATEGORY_SUPPLIER product_id, category_id, supplier_id"]',
          '  X --> PC["PRODUCT_CATEGORY product_id, category_id"]',
          '  X --> PS["PRODUCT_SUPPLIER product_id, supplier_id"]',
          '  PC -. "product_id determines a set of categories" .-> P["PRODUCT"]',
          '  PS -. "product_id determines an independent set of suppliers" .-> P',
        ].join('\n'),
        caption: 'When category and supplier choices are independent, 4NF stores each relationship once instead of materializing their cross-product.',
      },
      {
        kind: 'note',
        title: 'Dependency preservation can be the deciding trade-off',
        text:
          'If an FD spans attributes that no resulting relation contains together, ordinary keys and checks cannot enforce it locally. A join-time assertion, transaction logic, or a dependency-preserving 3NF design may be preferable to a theoretically stronger BCNF decomposition.',
      },
      {
        kind: 'pitfall',
        title: 'Decomposing every three-column relation',
        text:
          'A ternary relation can encode a genuine fact—such as a supplier approved to sell a particular product in a particular region. Pairwise tables would invent approvals unless the relevant join dependency truly holds.',
      },
      {
        kind: 'bestPractice',
        title: 'Test both reconstruction and constraint placement',
        text:
          'Write representative legal and illegal instances, project and rejoin them, and list where each dependency will be enforced. Document any deliberate non-preservation and the transaction boundary that compensates for it.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 7.2 — Decomposition Using Functional Dependencies' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.5 — Algorithms for Decomposition Using Functional Dependencies' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.6–7.7 — Multivalued Dependencies; More Normal Forms' },
      { book: 'sql-relational-theory', chapter: 'Appendix A — Dependencies; Further Normalization' },
    ],
    related: ['functional-dependencies', 'normalization-through-bcnf', 'schema-design-antipatterns'],
  },
  {
    id: 'denormalization-tradeoffs',
    domainId: 'db-modeling',
    title: 'Denormalization Trade-offs',
    summary:
      'Denormalization deliberately stores derivable or repeated data to improve a measured read path. It trades read simplicity or latency for write amplification, consistency machinery, storage, and more complicated repair.',
    keyPoints: [
      {
        text: 'Denormalization begins with a correct normalized source of truth.',
        detail:
          'Without a baseline predicate and owner for each fact, a duplicated customer name or order total has no authoritative value and no reliable repair path.',
      },
      {
        text: 'A performance hypothesis must name the query, target, and evidence.',
        detail:
          '“Joins are slow” is not a hypothesis. “The customer order feed misses its 150 ms p95 because computing totals scans 200 lines per order” can be measured and tested.',
      },
      {
        text: 'Every duplicate needs a freshness and failure contract.',
        detail:
          'Synchronous maintenance offers stronger freshness but increases transaction work; asynchronous maintenance tolerates lag and must expose or bound it.',
      },
      {
        text: 'Snapshots can be semantically correct rather than denormalized.',
        detail:
          'Shipping address and unit price captured at checkout describe the historical order. They must not be “repaired” to the customer\'s current address or product\'s current price.',
      },
      'Materialized views and summary tables centralize derivation but still consume storage and refresh capacity.',
      'The operational design includes backfill, reconciliation, idempotency, observability, and rollback—not only an extra column.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Choosing how to serve order totals' },
      {
        kind: 'table',
        caption: 'Trade-offs for `order_total = Σ(quantity × unit_price)`',
        headers: ['Design', 'Read path', 'Write and consistency cost', 'Best fit'],
        rows: [
          ['Compute from `order_items`', 'Aggregate at read time', 'Single source; no duplicate maintenance', 'Moderate line counts or infrequent reads'],
          ['Stored `orders.total_amount`', 'Direct header read', 'Every line mutation must update total atomically', 'Hot read path with tightly controlled writes'],
          ['Materialized aggregate', 'Read precomputed result', 'Refresh work and possible staleness', 'Reporting or bounded-lag feeds'],
          ['Cache outside schema', 'Fast keyed lookup', 'Invalidation, eviction, and cold misses', 'Disposable acceleration where database remains authoritative'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Reconciliation query for a stored total',
        code:
          'SELECT o.order_id,\n       o.total_amount AS stored_total,\n       COALESCE(SUM(i.quantity * i.unit_price), 0) AS derived_total\nFROM orders AS o\nLEFT JOIN order_items AS i ON i.order_id = o.order_id\nGROUP BY o.order_id, o.total_amount\nHAVING o.total_amount <> COALESCE(SUM(i.quantity * i.unit_price), 0);',
        caption: 'A denormalized value needs a routine way to detect and repair drift.',
      },
      {
        kind: 'note',
        title: 'Snapshot versus duplicate',
        text:
          '`order_items.unit_price` answers “what price was agreed?” while `products.current_price` answers “what price is offered now?” They may share a value at checkout, but they are different facts with different lifecycles.',
      },
      {
        kind: 'pitfall',
        title: 'Maintaining copies in scattered application code',
        text:
          'A new writer, bulk import, retry, or administrative correction can bypass one update path. If the invariant must be synchronous, centralize it in one transaction boundary and test concurrency and failure cases.',
      },
      {
        kind: 'bestPractice',
        title: 'Make denormalization reversible',
        text:
          'Retain the normalized facts, add the derived representation behind a controlled read path, backfill and compare, then remove it safely if the measured benefit does not justify its operating cost.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 7.9.3 — Denormalization for Performance' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.1 — Features of Good Relational Designs' },
      { book: 'sql-antipatterns', chapter: 'Appendix A — Myths About Normalization' },
    ],
    related: ['normalization-through-bcnf', 'views-and-materialized-views', 'application-concurrency-and-transaction-boundaries'],
  },
  {
    id: 'modeling-hierarchies-and-graphs',
    domainId: 'db-modeling',
    title: 'Modeling Hierarchies and Graphs',
    summary:
      'Hierarchical data can be stored with parent references, encoded paths, subtree intervals, or an explicit transitive closure. The right model follows the dominant reads, mutation rate, integrity rules, and whether the structure is truly a tree.',
    keyPoints: [
      {
        text: 'An adjacency list stores the direct edge and is the simplest normalized tree model.',
        detail:
          '`categories.parent_category_id` references `categories.category_id`. Single-node moves are cheap, while arbitrary ancestor and descendant queries need recursion.',
      },
      {
        text: 'A materialized path makes ancestry visible in each node.',
        detail:
          'Prefix queries can read subtrees efficiently, but moving a node requires rewriting every descendant path and separators or encodings must be unambiguous.',
      },
      {
        text: 'Nested sets encode containment with left and right bounds.',
        detail:
          'A subtree is a range query, but insertions and moves renumber many nodes. The model is attractive for read-mostly trees, not volatile catalogs.',
      },
      {
        text: 'A closure table stores every ancestor–descendant pair.',
        detail:
          'It supports fast ancestor and descendant queries and can represent DAGs, at the cost of O(depth) rows per insertion and careful maintenance on moves.',
      },
      'Cycles, multiple parents, sibling order, and orphan policy are separate constraints that the storage shape does not solve automatically.',
      'When edges have identity or attributes such as rank, validity, or provenance, model them as first-class relationship rows.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Four models for commerce categories' },
      {
        kind: 'table',
        caption: 'Hierarchy model comparison',
        headers: ['Model', 'Subtree read', 'Insert or move', 'Storage', 'Characteristic risk'],
        rows: [
          ['Adjacency list', 'Recursive traversal', 'Local parent update', 'One parent key per node', 'Cycles and deep recursive reads'],
          ['Materialized path', 'Path-prefix predicate', 'Rewrite moved subtree paths', 'Path repeated per node', 'Encoding and stale descendant paths'],
          ['Nested sets', 'Range predicate on bounds', 'Potentially broad renumbering', 'Two bounds per node', 'Write amplification and concurrent moves'],
          ['Closure table', 'Direct lookup by ancestor', 'Insert/delete closure rows', 'One row per reachable pair', 'Maintenance bugs and quadratic growth in chains'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Category tree and closure rows',
        code: [
          'flowchart TD',
          '  C["Catalog"] --> A["Apparel"]',
          '  C --> E["Electronics"]',
          '  A --> S["Shoes"]',
          '  A --> J["Jackets"]',
          '  T["Closure examples"] --- R1["Catalog → Shoes, depth 2"]',
          '  T --- R2["Apparel → Shoes, depth 1"]',
          '  T --- R3["Shoes → Shoes, depth 0"]',
        ].join('\n'),
        caption: 'Depth-zero self rows make “self plus descendants” queries uniform.',
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Adjacency and closure-table logical schemas',
        code:
          'CREATE TABLE categories (\n  category_id BIGINT PRIMARY KEY,\n  parent_category_id BIGINT REFERENCES categories(category_id),\n  name VARCHAR(200) NOT NULL,\n  CHECK (parent_category_id IS NULL OR parent_category_id <> category_id)\n);\n\nCREATE TABLE category_closure (\n  ancestor_id BIGINT NOT NULL REFERENCES categories(category_id),\n  descendant_id BIGINT NOT NULL REFERENCES categories(category_id),\n  depth INTEGER NOT NULL CHECK (depth >= 0),\n  PRIMARY KEY (ancestor_id, descendant_id)\n);',
        caption: 'The simple check blocks only self-loops; preventing longer cycles requires traversal-aware write logic.',
      },
      {
        kind: 'pitfall',
        title: 'Assuming every classification is a tree',
        text:
          'A product category may legitimately appear under both “Sale” and “Shoes.” Forcing one parent loses information; allowing multiple adjacency rows without changing identity and cycle rules creates an accidental graph.',
      },
      {
        kind: 'bestPractice',
        title: 'Benchmark reads and moves with realistic depth',
        text:
          'Measure whole-subtree reads, breadcrumb reads, node insertion, and subtree moves. Include integrity procedures and repair queries in the comparison, not only the shortest SELECT statement.',
      },
    ],
    refs: [
      { book: 'sql-antipatterns', chapter: 'Ch. 3 — Naive Trees' },
      { book: 'database-system-concepts', chapter: 'Ch. 6.2 — Entity Sets and Relationship Sets' },
      { book: 'database-system-concepts', chapter: 'Ch. 6.8.1 — Specialization and Generalization' },
    ],
    related: ['recursive-queries', 'entity-relationship-modeling', 'foreign-keys-and-referential-actions'],
  },
  {
    id: 'temporal-data-modeling',
    domainId: 'db-modeling',
    title: 'Temporal Data Modeling',
    summary:
      'Temporal modeling distinguishes when a fact is true in the business from when the database knew it. Valid time, transaction time, and half-open intervals make corrections, audits, and as-of queries precise instead of overwriting history.',
    keyPoints: [
      {
        text: 'Valid time describes the period when a fact applies in the modeled world.',
        detail:
          'A product price may be valid from a promotion start until its end, regardless of when staff entered or corrected that price.',
      },
      {
        text: 'Transaction time describes when a version was recorded in the database.',
        detail:
          'It supports “what did the system believe yesterday?” and makes retroactive corrections visible rather than silently replacing the prior record.',
      },
      {
        text: 'Bitemporal data carries both valid-time and transaction-time intervals.',
        detail:
          'A correction closes the old transaction-time version and inserts a new belief, while both versions retain the business interval they describe.',
      },
      {
        text: 'Half-open intervals `[start, end)` compose without boundary overlap.',
        detail:
          'One version can end exactly when the next begins. A single predicate—`start <= t AND t < end`—selects the version valid at an instant.',
      },
      'Temporal keys prevent overlapping versions for the same business identity; adding timestamps to an ordinary key does not enforce non-overlap.',
      'Current-state, valid-as-of, and known-as-of queries are different APIs and should be named and tested explicitly.',
    ],
    blocks: [
      { kind: 'subheading', text: 'A retroactive product-price correction' },
      {
        kind: 'diagram',
        title: 'Valid-time and transaction-time axes',
        code: [
          'flowchart LR',
          '  subgraph V["Valid time: when price applies"]',
          '    V1["Jan 01"] --> V2["Feb 01"] --> V3["Mar 01"]',
          '  end',
          '  subgraph T["Transaction time: when database knows"]',
          '    T1["Jan 01: record 100"] --> T2["Feb 10: record 90"] --> T3["Feb 15: correct effective date to Feb 01"]',
          '  end',
          '  T3 -. "new belief applies retroactively" .-> V2',
        ].join('\n'),
        caption: 'On February 15 the business-valid start is corrected to February 1; transaction history preserves what was believed before the correction.',
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Vendor-neutral bitemporal price-history shape',
        code:
          'CREATE TABLE product_price_history (\n  product_id BIGINT NOT NULL REFERENCES products(product_id),\n  valid_from TIMESTAMP NOT NULL,\n  valid_to TIMESTAMP NOT NULL,\n  recorded_from TIMESTAMP NOT NULL,\n  recorded_to TIMESTAMP NOT NULL,\n  price DECIMAL(19, 4) NOT NULL CHECK (price >= 0),\n  CHECK (valid_from < valid_to),\n  CHECK (recorded_from < recorded_to),\n  PRIMARY KEY (product_id, valid_from, recorded_from)\n);',
        caption:
          'The primary key makes versions addressable but does not prevent overlapping intervals. Use a database-supported temporal constraint or serialized write procedure to enforce that invariant.',
      },
      {
        kind: 'table',
        caption: 'Which question selects which axes?',
        headers: ['Question', 'Valid-time filter', 'Transaction-time filter'],
        rows: [
          ['Current accepted price', 'Contains now', 'Contains now'],
          ['Price valid on February 5, using today\'s corrected knowledge', 'Contains Feb 5', 'Contains now'],
          ['What the system reported on February 12 for February 5', 'Contains Feb 5', 'Contains Feb 12'],
          ['Complete audit', 'No collapse', 'No collapse'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Using an inclusive end date',
        text:
          'If one price is valid through midnight and the next starts at the same timestamp, both may match the boundary. Half-open intervals avoid double ownership and work at timestamp precision without subtracting an arbitrary smallest unit.',
      },
      {
        kind: 'bestPractice',
        title: 'Define correction semantics before schema mechanics',
        text:
          'Specify whether late facts rewrite valid history, whether transaction history is immutable, who supplied the correction, and which as-of query customer support or finance needs. Then encode interval and non-overlap constraints.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 7.10 — Modeling Temporal Data' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.9.4 — Other Design Issues' },
      { book: 'sql-relational-theory', chapter: 'Ch. 8 — Database Constraints in SQL' },
    ],
    related: ['temporal-and-versioned-queries', 'application-schema-patterns', 'transactions-and-acid'],
  },
  {
    id: 'application-schema-patterns',
    domainId: 'db-modeling',
    title: 'Application Schema Patterns',
    summary:
      'Application schemas often need tenant isolation, deletion semantics, auditability, and immutable history in addition to normalized business facts. Each pattern solves a different requirement and moves complexity among constraints, queries, operations, and recovery.',
    keyPoints: [
      {
        text: 'Multitenancy is an isolation decision, not merely a `tenant_id` column.',
        detail:
          'Shared tables maximize density but demand tenant-scoped keys and predicates everywhere. Separate schemas or databases increase isolation and customization while multiplying migrations and operations.',
      },
      {
        text: 'Tenant identity belongs in uniqueness and references when identifiers are tenant-scoped.',
        detail:
          '`UNIQUE (tenant_id, sku)` and composite foreign keys stop one tenant\'s order item from referencing another tenant\'s product even when local IDs collide.',
      },
      {
        text: 'Soft deletion preserves a row but changes the meaning of ordinary queries.',
        detail:
          'Every uniqueness rule, foreign key action, report, and index must decide whether deleted rows participate. A timestamp usually carries more information than a Boolean flag.',
      },
      {
        text: 'Audit logs record actions; history tables record prior states.',
        detail:
          'An audit event answers who changed a price and why. A version table answers what values existed over time. One structure rarely serves both questions well.',
      },
      {
        text: 'Immutable ledgers append corrections instead of updating prior facts.',
        detail:
          'They improve provenance and replay, but current balance or state becomes a derived result and concurrency must preserve append-time invariants.',
      },
      'Retention, privacy erasure, legal hold, backup, restore, and tenant export requirements can rule out an otherwise convenient pattern.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Multitenancy deployment choices' },
      {
        kind: 'table',
        caption: 'Tenant isolation comparison',
        headers: ['Pattern', 'Isolation', 'Operations', 'Customization', 'Typical risk'],
        rows: [
          ['Shared schema + discriminator', 'Logical, row scoped', 'One migration fleet; efficient pooling', 'Low', 'Missing tenant predicate or unscoped key leaks data'],
          ['Schema per tenant', 'Namespace scoped', 'Many schema migrations and connections', 'Medium', 'Version drift and catalog overhead'],
          ['Database per tenant', 'Database and often resource scoped', 'Backup, migration, and monitoring per database', 'High', 'Fleet cost and difficult cross-tenant analytics'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'Tenant-scoped identity and referential integrity',
        code:
          'CREATE TABLE tenant_products (\n  tenant_id BIGINT NOT NULL,\n  product_id BIGINT NOT NULL,\n  sku VARCHAR(80) NOT NULL,\n  deleted_at TIMESTAMP,\n  PRIMARY KEY (tenant_id, product_id),\n  UNIQUE (tenant_id, sku)\n);\n\nCREATE TABLE tenant_order_items (\n  tenant_id BIGINT NOT NULL,\n  order_id BIGINT NOT NULL,\n  line_no INTEGER NOT NULL,\n  product_id BIGINT NOT NULL,\n  PRIMARY KEY (tenant_id, order_id, line_no),\n  FOREIGN KEY (tenant_id, product_id)\n    REFERENCES tenant_products(tenant_id, product_id)\n);',
        caption: 'Repeating `tenant_id` in the foreign key makes cross-tenant references structurally invalid.',
      },
      {
        kind: 'table',
        caption: 'Deletion and history patterns answer different questions',
        headers: ['Pattern', 'Strength', 'Cost or trap'],
        rows: [
          ['Hard delete', 'Simple current-state queries and true removal', 'Loses row history; dependencies need an explicit retention policy'],
          ['Soft delete', 'Easy restore and stable references', 'Every query and uniqueness rule acquires active/deleted semantics'],
          ['Audit event', 'Actor, reason, request, and action provenance', 'May not reconstruct exact state unless events are complete and ordered'],
          ['History/version table', 'As-of state reconstruction', 'More rows, interval rules, and correction semantics'],
          ['Immutable append-only facts', 'Strong lineage and replay', 'Corrections are compensating entries; current state is derived'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Adding `deleted = false` to every query by convention',
        text:
          'One missed predicate can resurrect deleted products in search or reports. Soft delete also conflicts with reusable natural keys unless the policy explicitly defines whether a retired SKU may be claimed again.',
      },
      {
        kind: 'bestPractice',
        title: 'Model lifecycle states as part of the contract',
        text:
          'Document who can transition each state, which relations remain referenceable, how uniqueness behaves, what is immutable, and how tenant-scoped data is exported, restored, or erased. Enforce the highest-risk boundaries structurally.',
      },
    ],
    refs: [
      { book: 'database-system-concepts', chapter: 'Ch. 6.11 — Other Aspects of Database Design' },
      { book: 'database-system-concepts', chapter: 'Ch. 7.10 — Modeling Temporal Data' },
      { book: 'sql-relational-theory', chapter: 'Ch. 8 — Database Constraints; The Golden Rule' },
    ],
    related: ['temporal-data-modeling', 'primary-unique-and-check-constraints', 'foreign-keys-and-referential-actions'],
  },
  {
    id: 'schema-design-antipatterns',
    domainId: 'db-modeling',
    title: 'Schema Design Antipatterns',
    summary:
      'Schema antipatterns trade explicit relational structure for strings, generic metadata, ambiguous references, or meaningless keys. They often simplify one write path while disabling constraints and making ordinary queries, migrations, and corrections fragile.',
    keyPoints: [
      {
        text: 'Multi-valued attributes hide relationships inside one scalar column.',
        detail:
          'Comma-separated category IDs cannot be protected by foreign keys, joined reliably, or updated atomically as individual memberships. A bridge relation represents one fact per row.',
      },
      {
        text: 'EAV moves the schema into rows and weakens types and constraints.',
        detail:
          'A generic `(entity_id, attribute_name, value)` table cannot naturally require every product weight to be positive numeric data while color remains text and SKU remains unique.',
      },
      {
        text: 'Polymorphic associations make one foreign key pretend to reference several tables.',
        detail:
          '`comments(target_type, target_id)` has no ordinary foreign key target, permits dangling IDs, and complicates joins and deletes. Introduce a common supertype or separate intersection tables.',
      },
      {
        text: 'A surrogate ID is not a substitute for a business key.',
        detail:
          'Adding `order_item_id` without `UNIQUE (order_id, line_no)` or the true domain key allows duplicate facts. Conversely, forcing an ID onto a relation already identified by its foreign keys can add no meaning.',
      },
      'Numbered columns and cloned tables encode data values in metadata, forcing schema changes when the number of values grows.',
      'Antipatterns can have narrow legitimate uses, but the lost guarantees and exit strategy must be explicit.',
    ],
    blocks: [
      { kind: 'subheading', text: 'Concrete failures and relational replacements' },
      {
        kind: 'table',
        caption: 'Commerce antipatterns',
        headers: ['Antipattern', 'Tempting design', 'Failure', 'Replacement'],
        rows: [
          ['Multi-valued attribute / Jaywalking', '`products.category_ids = \'4,9,12\'`', 'No element-level FK; substring searches and read-modify-write updates', '`product_categories(product_id, category_id)`'],
          ['EAV', '`product_attributes(product_id, name, value)`', 'Types, required fields, ranges, and cross-attribute rules become dynamic code', 'Typed columns or subtype/detail tables; JSON only for genuinely open attributes'],
          ['Polymorphic association', '`attachments(target_type, target_id)`', 'No declarative FK to orders or products', 'Common `attachment_targets` supertype or separate `order_attachments` and `product_attachments`'],
          ['Key misuse', 'Only `order_item_id` is unique', 'Same product line can be inserted twice against the business rule', 'Declare the surrogate plus the actual candidate key'],
          ['Multicolumn attributes', '`phone1, phone2, phone3`', 'Fixed limit, repetitive queries, positional gaps', '`customer_phones(customer_id, phone, kind)`'],
          ['Metadata Tribbles', '`orders_2025`, `orders_2026`', 'New DDL and UNION edits every period', 'One `orders` relation; use physical partitioning transparently if needed'],
        ],
      },
      {
        kind: 'code',
        language: 'sql',
        title: 'From hidden list to constrained relationship',
        code:
          '-- Antipattern: category_ids contains values such as \'4,9,12\'\n-- SELECT * FROM products WHERE category_ids LIKE \'%9%\';\n\nCREATE TABLE product_categories (\n  product_id BIGINT NOT NULL REFERENCES products(product_id),\n  category_id BIGINT NOT NULL REFERENCES categories(category_id),\n  assigned_at TIMESTAMP NOT NULL,\n  PRIMARY KEY (product_id, category_id)\n);',
        caption: 'The intersection table makes membership, uniqueness, provenance, and referential integrity explicit.',
      },
      {
        kind: 'diagram',
        title: 'Repairing a polymorphic association',
        code: [
          'flowchart LR',
          '  BAD["attachment target_type + target_id"] -. "cannot reference two tables" .-> O["orders"]',
          '  BAD -. "cannot reference two tables" .-> P["products"]',
          '  A["attachments"] --> OA["order_attachments"] --> O',
          '  A --> PA["product_attachments"] --> P',
        ].join('\n'),
        caption: 'Separate association tables preserve ordinary foreign keys and make allowed target types visible in the schema.',
      },
      {
        kind: 'note',
        title: 'When flexible attributes are legitimate',
        text:
          'Sparse, user-defined, noncritical metadata may justify a document column or EAV-like extension area. Keep stable identity, pricing, inventory, and constraint-bearing attributes relational; validate extension types and index only demonstrated access paths.',
      },
      {
        kind: 'pitfall',
        title: 'Calling missing constraints “application validation”',
        text:
          'Imports, scripts, retries, and new services eventually bypass one validator. If every writer must obey the rule and the database can express it, a database constraint is the shared enforcement point.',
      },
      {
        kind: 'bestPractice',
        title: 'Ask what guarantee the shortcut removes',
        text:
          'For each flexible design, list lost type checks, foreign keys, uniqueness, query composability, and migration behavior. Accept it only for a bounded requirement with tests, observability, and a path back to explicit structure.',
      },
    ],
    refs: [
      { book: 'sql-antipatterns', chapter: 'Ch. 2 — Jaywalking; Ch. 8 — Multicolumn Attributes' },
      { book: 'sql-antipatterns', chapter: 'Ch. 6 — Entity-Attribute-Value' },
      { book: 'sql-antipatterns', chapter: 'Ch. 7 — Polymorphic Associations' },
      { book: 'sql-antipatterns', chapter: 'Ch. 4 — ID Required; Ch. 5 — Keyless Entry; Ch. 9 — Metadata Tribbles' },
      { book: 'sql-relational-theory', chapter: 'Ch. 5 — Candidate Keys; Foreign Keys' },
    ],
    related: ['normalization-through-bcnf', 'json-arrays-and-composite-data', 'primary-unique-and-check-constraints'],
  },
]
