import type { GraphNode, GraphEdge } from '../../types/content'
import { domains } from './domains'

type TopicNodeSpec = [id: string, label: string, importance: 1 | 2 | 3]

const topicNodeSpecs: Record<string, TopicNodeSpec[]> = {
  'algo-foundations': [
    ['analyzing-algorithms', 'Analyzing Algorithms', 3],
    ['recursion-and-recurrences', 'Recursion & Recurrences', 3],
    ['amortized-analysis', 'Amortized Analysis', 2],
    ['abstract-data-types', 'Abstract Data Types', 2],
    ['correctness-and-invariants', 'Correctness & Invariants', 2],
    ['randomization-in-algorithms', 'Randomization', 1],
    ['complexity-classes', 'Complexity Classes', 2],
  ],
  'core-data-structures': [
    ['arrays-and-linked-lists', 'Arrays & Linked Lists', 3],
    ['stacks-and-queues', 'Stacks & Queues', 2],
    ['trees-and-traversals', 'Trees & Traversals', 3],
    ['binary-search-trees', 'Binary Search Trees', 2],
    ['balanced-trees', 'Balanced Trees', 2],
    ['heaps-and-priority-queues', 'Heaps & Priority Queues', 3],
    ['hash-tables', 'Hash Tables', 3],
    ['tries', 'Tries', 1],
    ['disjoint-sets-union-find', 'Union-Find', 2],
    ['graph-representations', 'Graph Representations', 2],
  ],
  'sorting-searching': [
    ['elementary-sorts', 'Elementary Sorts', 2],
    ['mergesort', 'Mergesort', 3],
    ['quicksort', 'Quicksort', 3],
    ['heapsort', 'Heapsort', 1],
    ['linear-time-sorting', 'Linear-Time Sorting', 2],
    ['binary-search-and-variants', 'Binary Search', 3],
    ['order-statistics-selection', 'Order Statistics', 1],
  ],
  'graph-algorithms': [
    ['graph-traversal-bfs-dfs', 'BFS & DFS', 3],
    ['topological-sort', 'Topological Sort', 2],
    ['shortest-paths', 'Shortest Paths', 3],
    ['minimum-spanning-trees', 'Minimum Spanning Trees', 2],
    ['network-flow', 'Network Flow', 1],
    ['strongly-connected-components', 'Strongly Connected Components', 1],
  ],
  'algorithm-design': [
    ['divide-and-conquer', 'Divide & Conquer', 3],
    ['greedy-algorithms', 'Greedy Algorithms', 2],
    ['dynamic-programming', 'Dynamic Programming', 3],
    ['backtracking', 'Backtracking', 2],
    ['string-matching-algorithms', 'String Matching', 1],
    ['reductions-and-intractability', 'Reductions & Intractability', 2],
  ],
  'interview-patterns': [
    ['two-pointers-and-sliding-window', 'Two Pointers & Sliding Window', 3],
    ['fast-slow-pointers', 'Fast & Slow Pointers', 2],
    ['binary-search-on-answer', 'Binary Search on Answer', 2],
    ['heap-top-k-pattern', 'Top-K Pattern', 2],
    ['union-find-applications', 'Union-Find Applications', 1],
    ['bit-manipulation-tricks', 'Bit Manipulation', 2],
    ['backtracking-templates', 'Backtracking Templates', 2],
    ['interview-problem-solving-method', 'Problem-Solving Method', 2],
  ],
  'design-patterns': [
    ['design-patterns-overview', 'Design Patterns Overview', 3],
    ['creational-patterns', 'Creational Patterns', 3],
    ['structural-patterns', 'Structural Patterns', 3],
    ['behavioral-patterns-i', 'Behavioral Patterns I', 3],
    ['behavioral-patterns-ii', 'Behavioral Patterns II', 2],
    ['compound-patterns-and-mvc', 'Compound Patterns & MVC', 2],
    ['anti-patterns-and-pattern-misuse', 'Anti-Patterns', 1],
  ],
  'architecture-principles': [
    ['solid-principles', 'SOLID Principles', 3],
    ['coupling-and-cohesion', 'Coupling & Cohesion', 2],
    ['component-principles', 'Component Principles', 2],
    ['clean-architecture-boundaries', 'Clean Architecture Boundaries', 3],
    ['dependency-inversion-and-injection', 'Dependency Inversion & Injection', 3],
    ['architectural-styles', 'Architectural Styles', 2],
    ['use-case-driven-design', 'Use-Case-Driven Design', 1],
  ],
  'refactoring-quality': [
    ['code-smells', 'Code Smells', 3],
    ['refactoring-catalog-core', 'Refactoring Catalog', 3],
    ['composing-methods-and-conditionals', 'Composing Methods & Conditionals', 2],
    ['refactoring-and-testing-safety', 'Refactoring & Testing Safety', 2],
    ['refactoring-workflow-and-tooling', 'Refactoring Workflow', 1],
    ['technical-debt', 'Technical Debt', 2],
  ],
  'craftsmanship-practice': [
    ['pragmatic-mindset', 'Pragmatic Mindset', 3],
    ['tracer-bullets-and-prototyping', 'Tracer Bullets & Prototyping', 2],
    ['requirements-and-communication', 'Requirements & Communication', 2],
    ['tooling-and-automation', 'Tooling & Automation', 2],
    ['estimating', 'Estimating', 1],
    ['testing-philosophy', 'Testing Philosophy', 2],
    ['debugging-and-problem-solving', 'Debugging', 2],
  ],
}

const hubId = (domainId: string) => `d-${domainId}`

const hubNodes: GraphNode[] = domains.map((d) => ({
  id: hubId(d.id),
  label: d.title,
  domainId: d.id,
  importance: 3,
  kind: 'domain',
}))

const topicNodes: GraphNode[] = Object.entries(topicNodeSpecs).flatMap(([domainId, specs]) =>
  specs.map(([id, label, importance]) => ({ id, label, domainId, importance, kind: 'topic' as const })),
)

export const graphNodes: GraphNode[] = [...hubNodes, ...topicNodes]

const partOfEdges: GraphEdge[] = topicNodes.map((n) => ({
  source: n.id,
  target: hubId(n.domainId),
  type: 'part-of',
}))

/** [source, target] — source should be learned before target. */
const prerequisites: Array<[string, string]> = [
  ['analyzing-algorithms', 'recursion-and-recurrences'],
  ['recursion-and-recurrences', 'dynamic-programming'],
  ['recursion-and-recurrences', 'backtracking'],
  ['abstract-data-types', 'arrays-and-linked-lists'],
  ['arrays-and-linked-lists', 'stacks-and-queues'],
  ['arrays-and-linked-lists', 'hash-tables'],
  ['trees-and-traversals', 'binary-search-trees'],
  ['binary-search-trees', 'balanced-trees'],
  ['trees-and-traversals', 'heaps-and-priority-queues'],
  ['graph-representations', 'graph-traversal-bfs-dfs'],
  ['graph-traversal-bfs-dfs', 'topological-sort'],
  ['graph-traversal-bfs-dfs', 'shortest-paths'],
  ['graph-traversal-bfs-dfs', 'strongly-connected-components'],
  ['greedy-algorithms', 'minimum-spanning-trees'],
  ['greedy-algorithms', 'shortest-paths'],
  ['divide-and-conquer', 'mergesort'],
  ['divide-and-conquer', 'quicksort'],
  ['heaps-and-priority-queues', 'heapsort'],
  ['binary-search-and-variants', 'order-statistics-selection'],
  ['binary-search-and-variants', 'binary-search-on-answer'],
  ['two-pointers-and-sliding-window', 'fast-slow-pointers'],
  ['disjoint-sets-union-find', 'union-find-applications'],
  ['disjoint-sets-union-find', 'minimum-spanning-trees'],
  ['solid-principles', 'clean-architecture-boundaries'],
  ['coupling-and-cohesion', 'component-principles'],
  ['component-principles', 'clean-architecture-boundaries'],
  ['clean-architecture-boundaries', 'dependency-inversion-and-injection'],
  ['dependency-inversion-and-injection', 'use-case-driven-design'],
  ['design-patterns-overview', 'creational-patterns'],
  ['design-patterns-overview', 'structural-patterns'],
  ['design-patterns-overview', 'behavioral-patterns-i'],
  ['behavioral-patterns-i', 'behavioral-patterns-ii'],
  ['behavioral-patterns-ii', 'compound-patterns-and-mvc'],
  ['code-smells', 'refactoring-catalog-core'],
  ['refactoring-catalog-core', 'composing-methods-and-conditionals'],
  ['testing-philosophy', 'refactoring-and-testing-safety'],
  ['refactoring-and-testing-safety', 'refactoring-workflow-and-tooling'],
  ['pragmatic-mindset', 'tracer-bullets-and-prototyping'],
]

/** Cross-domain and intra-domain conceptual links. */
const related: Array<[string, string]> = [
  ['amortized-analysis', 'hash-tables'],
  ['amortized-analysis', 'arrays-and-linked-lists'],
  ['complexity-classes', 'reductions-and-intractability'],
  ['correctness-and-invariants', 'recursion-and-recurrences'],
  ['randomization-in-algorithms', 'quicksort'],
  ['randomization-in-algorithms', 'hash-tables'],
  ['trees-and-traversals', 'recursion-and-recurrences'],
  ['tries', 'string-matching-algorithms'],
  ['string-matching-algorithms', 'hash-tables'],
  ['graph-representations', 'abstract-data-types'],
  ['network-flow', 'greedy-algorithms'],
  ['strongly-connected-components', 'topological-sort'],
  ['dynamic-programming', 'greedy-algorithms'],
  ['dynamic-programming', 'divide-and-conquer'],
  ['backtracking', 'reductions-and-intractability'],
  ['two-pointers-and-sliding-window', 'arrays-and-linked-lists'],
  ['fast-slow-pointers', 'arrays-and-linked-lists'],
  ['binary-search-on-answer', 'binary-search-and-variants'],
  ['heap-top-k-pattern', 'heaps-and-priority-queues'],
  ['union-find-applications', 'disjoint-sets-union-find'],
  ['bit-manipulation-tricks', 'hash-tables'],
  ['backtracking-templates', 'backtracking'],
  ['interview-problem-solving-method', 'analyzing-algorithms'],
  ['creational-patterns', 'solid-principles'],
  ['structural-patterns', 'coupling-and-cohesion'],
  ['behavioral-patterns-i', 'solid-principles'],
  ['compound-patterns-and-mvc', 'architectural-styles'],
  ['anti-patterns-and-pattern-misuse', 'code-smells'],
  ['solid-principles', 'refactoring-catalog-core'],
  ['technical-debt', 'code-smells'],
  ['architectural-styles', 'use-case-driven-design'],
  ['requirements-and-communication', 'use-case-driven-design'],
  ['estimating', 'requirements-and-communication'],
  ['debugging-and-problem-solving', 'correctness-and-invariants'],
  ['tooling-and-automation', 'refactoring-workflow-and-tooling'],
  ['tracer-bullets-and-prototyping', 'requirements-and-communication'],
]

export const graphEdges: GraphEdge[] = [
  ...partOfEdges,
  ...prerequisites.map(([source, target]): GraphEdge => ({ source, target, type: 'prerequisite-of' })),
  ...related.map(([source, target]): GraphEdge => ({ source, target, type: 'related-to' })),
]
