import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'graph-traversal-bfs-dfs',
    domainId: 'graph-algorithms',
    title: 'Graph Traversal: BFS & DFS',
    summary:
      'The two fundamental ways to visit every reachable vertex of a graph — BFS explores in layers and finds shortest paths by edge count, DFS dives as deep as possible and reveals structure like cycles and components.',
    keyPoints: [
      'BFS: FIFO queue, visits vertices in order of distance — the shortest path in an **unweighted** graph',
      'DFS: LIFO stack (explicit or via recursion), visits as deep as possible before backtracking',
      'Both run in O(V + E) with an adjacency list — every vertex and edge touched once',
      'DFS preorder/postorder timestamps power [[topological-sort]] and [[strongly-connected-components]]',
      'Recursive DFS risks `StackOverflowError` on long chains (e.g. a linked-list-shaped graph with 100,000 nodes) — an explicit stack avoids the recursion depth limit',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'BFS — shortest path by edge count',
        code: 'static int[] bfs(List<List<Integer>> adj, int source) {\n    int[] dist = new int[adj.size()];\n    Arrays.fill(dist, -1);\n    dist[source] = 0;\n    Deque<Integer> queue = new ArrayDeque<>();\n    queue.add(source);\n    while (!queue.isEmpty()) {\n        int u = queue.poll();\n        for (int v : adj.get(u)) {\n            if (dist[v] == -1) {\n                dist[v] = dist[u] + 1;\n                queue.add(v);\n            }\n        }\n    }\n    return dist;\n}',
      },
      {
        kind: 'code',
        title: 'DFS — recursive, with a visited set',
        code: 'static void dfs(List<List<Integer>> adj, int u, boolean[] visited, List<Integer> order) {\n    visited[u] = true;\n    order.add(u);                       // preorder: process on the way down\n    for (int v : adj.get(u)) {\n        if (!visited[v]) dfs(adj, v, visited, order);\n    }\n    // a second append here would record postorder — used by topological sort\n}',
      },
      {
        kind: 'table',
        caption: 'BFS vs DFS',
        headers: ['', 'BFS', 'DFS'],
        rows: [
          ['Data structure', 'queue', 'stack (or recursion)'],
          ['Finds', 'shortest path (unweighted), level order', 'connectivity, cycles, topological order'],
          ['Memory shape', 'O(width) of the frontier', 'O(depth) of the recursion'],
          ['Typical use', 'shortest path, bipartiteness check', 'cycle detection, SCCs, backtracking-style search'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Recursive DFS can blow the call stack',
        text: 'A graph that happens to be a long chain (or a deeply nested tree) can push recursion depth into the tens of thousands, well past the JVM\'s default stack size, throwing `StackOverflowError`. An explicit `Deque` as a stack — pushing neighbors instead of recursing — sidesteps the JVM stack entirely at the cost of manually tracking what "postorder processing" means without a natural return point.',
      },
      {
        kind: 'note',
        text: 'BFS and DFS are the traversal engines everything else in this domain is built on: [[topological-sort]] uses DFS postorder or a BFS-style in-degree count, [[shortest-paths]] generalizes BFS to weighted edges, and [[strongly-connected-components]] runs DFS twice.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.1 — Undirected Graphs' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.2 — Traversals' },
    ],
    related: ['graph-representations', 'topological-sort', 'shortest-paths', 'strongly-connected-components'],
  },

  {
    id: 'topological-sort',
    domainId: 'graph-algorithms',
    title: 'Topological Sort',
    summary:
      'A linear ordering of a DAG\'s vertices such that every edge points forward — the algorithm behind build systems, task schedulers, and "which courses can I take first."',
    keyPoints: [
      'Only defined for **directed acyclic graphs** (DAGs) — a cycle means no valid ordering exists',
      'Kahn\'s algorithm: repeatedly remove vertices with in-degree 0, which is BFS in spirit',
      'DFS-based alternative: run DFS, then reverse the postorder finish times',
      'A topological order is rarely unique — many valid orderings can satisfy the same DAG',
      'Kahn\'s algorithm detects a cycle for free: if fewer than V vertices get removed, a cycle exists',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Kahn\'s algorithm',
        code: 'static List<Integer> topoSort(List<List<Integer>> adj, int n) {\n    int[] indegree = new int[n];\n    for (List<Integer> neighbors : adj) for (int v : neighbors) indegree[v]++;\n\n    Deque<Integer> ready = new ArrayDeque<>();\n    for (int i = 0; i < n; i++) if (indegree[i] == 0) ready.add(i);\n\n    List<Integer> order = new ArrayList<>();\n    while (!ready.isEmpty()) {\n        int u = ready.poll();\n        order.add(u);\n        for (int v : adj.get(u)) {\n            if (--indegree[v] == 0) ready.add(v);\n        }\n    }\n    if (order.size() != n) throw new IllegalStateException("cycle detected");\n    return order;\n}',
      },
      {
        kind: 'note',
        title: 'The DFS-postorder alternative',
        text: 'Running plain DFS from every unvisited vertex and recording each vertex when its recursive call *finishes* (postorder) produces a topological order once reversed — a vertex\'s postorder timestamp is always later than any vertex reachable from it, so reversing puts prerequisites first. This variant needs no explicit in-degree bookkeeping, but detecting the cycle requires tracking an "in current recursion stack" marker rather than getting it for free like Kahn\'s does.',
      },
      {
        kind: 'table',
        caption: 'Kahn\'s vs DFS-based topological sort',
        headers: ['', 'Kahn\'s (BFS-style)', 'DFS-postorder'],
        rows: [
          ['Cycle detection', 'free — leftover in-degree ≠ 0 vertices', 'needs an explicit "on stack" marker'],
          ['Order produced', 'one valid order among many', 'a different valid order among many'],
          ['Natural fit', 'iterative, easy to reason about degrees', 'when you\'re already doing a DFS pass for something else'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Skipping cycle detection silently corrupts the result',
        text: 'If the input graph isn\'t guaranteed acyclic (e.g. build dependencies from user-editable config), forgetting the "did every vertex get emitted?" check means a cyclic subgraph is silently dropped from the output instead of raising an error — the caller gets an incomplete, seemingly-valid order with no indication anything was wrong.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.2 — Directed Graphs' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.4 — Directed Acyclic Graphs' },
    ],
    related: ['graph-traversal-bfs-dfs', 'strongly-connected-components', 'dynamic-programming'],
  },

  {
    id: 'shortest-paths',
    domainId: 'graph-algorithms',
    title: 'Shortest Paths',
    summary:
      'Dijkstra for non-negative weights, Bellman-Ford when edges can be negative, Floyd-Warshall for all pairs at once — the right algorithm is decided by the sign of the weights and how many sources you need.',
    keyPoints: [
      'Unweighted graph: plain [[graph-traversal-bfs-dfs|BFS]] already gives shortest paths by edge count',
      'Dijkstra: greedy, priority-queue driven, O((V+E) log V) — but silently **wrong** with negative edge weights',
      'Bellman-Ford: relax every edge V−1 times, O(VE) — handles negative weights and detects negative cycles',
      'Floyd-Warshall: O(V³) dynamic program over all pairs — best when you need every-source-to-every-sink distances',
      'Both Dijkstra and Prim\'s [[minimum-spanning-trees|MST]] share the same priority-queue-driven greedy shape, but they optimize different things',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Dijkstra with a PriorityQueue',
        code: 'static int[] dijkstra(List<List<int[]>> adj, int source) {   // adj.get(u) -> {v, weight} pairs\n    int n = adj.size();\n    int[] dist = new int[n];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[source] = 0;\n    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(p -> p[1]));\n    pq.add(new int[]{source, 0});\n    while (!pq.isEmpty()) {\n        int[] cur = pq.poll();\n        int u = cur[0], d = cur[1];\n        if (d > dist[u]) continue;          // stale entry, a cheaper path was already found\n        for (int[] edge : adj.get(u)) {\n            int v = edge[0], w = edge[1];\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.add(new int[]{v, dist[v]});\n            }\n        }\n    }\n    return dist;\n}',
      },
      {
        kind: 'table',
        caption: 'Choosing a shortest-path algorithm',
        headers: ['Algorithm', 'Handles negative weights', 'Complexity', 'Answers'],
        rows: [
          ['BFS', 'n/a (unweighted)', 'O(V + E)', 'single-source'],
          ['Dijkstra', 'no', 'O((V+E) log V)', 'single-source'],
          ['Bellman-Ford', 'yes, detects negative cycles', 'O(VE)', 'single-source'],
          ['Floyd-Warshall', 'yes (no negative cycles)', 'O(V³)', 'all-pairs'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Dijkstra + negative weights = silently wrong answer',
        text: 'Dijkstra\'s greedy correctness relies on the invariant that once a vertex is popped from the priority queue, its distance is final — a negative edge discovered later can undercut a distance that was already "locked in," and Dijkstra has no mechanism to revisit it. It doesn\'t throw an exception; it just returns a distance that\'s too large. If edge weights can be negative, reach for Bellman-Ford instead.',
      },
      {
        kind: 'note',
        title: 'Negative cycle detection is Bellman-Ford\'s free byproduct',
        text: 'After V−1 relaxation rounds, every shortest path (if one exists, i.e. no negative cycle is reachable) has stabilized. Running one more round: if any edge still relaxes (finds a shorter distance), a negative-weight cycle is reachable from the source and "shortest path" is undefined — some path can be shortened forever by looping through it.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.4 — Shortest Paths' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.6 — Shortest Paths' },
    ],
    related: ['graph-traversal-bfs-dfs', 'greedy-algorithms', 'minimum-spanning-trees', 'dynamic-programming'],
  },

  {
    id: 'minimum-spanning-trees',
    domainId: 'graph-algorithms',
    title: 'Minimum Spanning Trees',
    summary:
      'The cheapest set of edges that connects every vertex with no cycles — Prim\'s grows one tree outward, Kruskal\'s grows a forest from cheapest edges inward, and both are provably optimal despite being purely greedy.',
    keyPoints: [
      'An MST connects V vertices using exactly V − 1 edges at minimum total weight',
      'Prim\'s: grow one tree from a start vertex, always adding the cheapest edge crossing the frontier — structurally identical to [[shortest-paths|Dijkstra]]',
      'Kruskal\'s: sort all edges, add each one unless it would form a cycle — needs [[disjoint-sets-union-find|union-find]] for the cycle check',
      'Both are greedy and both are correct, justified by the **cut property**: the cheapest edge crossing any cut belongs to *some* MST',
      'The MST is unique only if all edge weights are distinct; with ties, multiple different MSTs can share the same minimum total weight',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Kruskal\'s algorithm with union-find',
        code: 'static long kruskalMST(int n, int[][] edges) {   // edges[i] = {u, v, weight}\n    Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));\n    UnionFind uf = new UnionFind(n);\n    long totalWeight = 0;\n    int edgesUsed = 0;\n    for (int[] e : edges) {\n        if (uf.union(e[0], e[1])) {       // true only if u, v were in different components\n            totalWeight += e[2];\n            if (++edgesUsed == n - 1) break;\n        }\n    }\n    return totalWeight;\n}',
      },
      {
        kind: 'table',
        caption: 'Prim\'s vs Kruskal\'s',
        headers: ['', 'Prim\'s', 'Kruskal\'s'],
        rows: [
          ['Grows', 'one tree, outward from a start vertex', 'a forest, merging components as edges are added'],
          ['Needs', 'a priority queue over frontier edges', 'sorted edges + union-find'],
          ['Best on', 'dense graphs (many edges, adjacency matrix)', 'sparse graphs (edge list is small relative to V²)'],
        ],
      },
      {
        kind: 'note',
        title: 'The cut property is why greedy works here',
        text: 'For any partition of the vertices into two nonempty sets (a "cut"), the minimum-weight edge crossing that cut must be in *some* MST — including it can never create a cycle (it connects two previously-separate sides) and excluding it can never lower the total weight below what including it achieves. Both Prim\'s and Kruskal\'s are just different strategies for repeatedly finding a cut and taking its cheapest crossing edge.',
      },
      {
        kind: 'pitfall',
        title: 'Kruskal\'s without union-find degrades badly',
        text: 'The whole point of union-find in Kruskal\'s is answering "are u and v already connected?" in near-O(1) amortized time. Substituting a naive reachability check (BFS/DFS per edge) turns the cycle test into O(V) per edge, making the whole algorithm O(E·V) instead of O(E log E) — correct, but far too slow for large graphs.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.3 — Minimum Spanning Trees' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.7 — Minimum Spanning Trees' },
    ],
    related: ['disjoint-sets-union-find', 'greedy-algorithms', 'shortest-paths', 'graph-representations'],
  },

  {
    id: 'network-flow',
    domainId: 'graph-algorithms',
    title: 'Network Flow',
    summary:
      'Max-flow finds the most that can travel from a source to a sink through capacitated edges; by the max-flow min-cut theorem, that same number is also the cheapest set of edges whose removal would disconnect them.',
    keyPoints: [
      'Each edge has a **capacity**; flow through it can\'t exceed that capacity, and flow into a vertex must equal flow out (except source/sink)',
      'Ford-Fulkerson: repeatedly find an augmenting path from source to sink in the **residual graph**, push flow equal to its bottleneck capacity',
      'Edmonds-Karp: Ford-Fulkerson using BFS to find the augmenting path each time — guarantees O(VE²), avoiding pathological slow convergence',
      'Max-flow min-cut theorem: the maximum flow value equals the capacity of the minimum cut separating source from sink',
      'Models far beyond literal "flow": bipartite matching, project selection, image segmentation all reduce to max-flow — see [[reductions-and-intractability]]',
    ],
    blocks: [
      {
        kind: 'note',
        title: 'The residual graph is the whole trick',
        text: 'For every edge (u, v) with capacity c and current flow f, the residual graph keeps a **forward** edge of remaining capacity c − f, and crucially a **backward** edge of capacity f — allowing a later augmenting path to "undo" some of the flow already sent, if that turns out to open a better overall route. Without the backward edge, the algorithm can get stuck in a suboptimal flow it can never repair.',
      },
      {
        kind: 'code',
        title: 'Edmonds-Karp (Ford-Fulkerson with BFS augmenting paths)',
        code: 'static int maxFlow(int[][] capacity, int source, int sink) {\n    int n = capacity.length;\n    int[][] residual = deepCopy(capacity);\n    int total = 0;\n    int[] parent = new int[n];\n    while (bfsFindPath(residual, source, sink, parent)) {\n        int bottleneck = Integer.MAX_VALUE;\n        for (int v = sink; v != source; v = parent[v]) {\n            bottleneck = Math.min(bottleneck, residual[parent[v]][v]);\n        }\n        for (int v = sink; v != source; v = parent[v]) {\n            residual[parent[v]][v] -= bottleneck;\n            residual[v][parent[v]] += bottleneck;   // open up the reverse edge\n        }\n        total += bottleneck;\n    }\n    return total;\n}',
      },
      {
        kind: 'table',
        caption: 'Problems that reduce to max-flow',
        headers: ['Problem', 'Reduction'],
        rows: [
          ['Bipartite matching', 'source → left vertices → right vertices → sink, unit capacities'],
          ['Project/task selection with dependencies', 'min-cut over a project-profit graph'],
          ['Edge/vertex connectivity', 'min-cut capacity equals the number of edge-disjoint paths (Menger\'s theorem)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Forgetting the reverse residual edge',
        text: 'Implementations that only decrement the forward edge\'s capacity and never add a reverse edge will converge to a flow that\'s locally sensible but globally suboptimal whenever the first augmenting path found isn\'t part of any maximum flow — there\'s no way to "give back" capacity that was committed too early.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 6.4 — Maxflow' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.8 — Network Flow and Matching' },
    ],
    related: ['graph-traversal-bfs-dfs', 'greedy-algorithms', 'reductions-and-intractability'],
  },

  {
    id: 'strongly-connected-components',
    domainId: 'graph-algorithms',
    title: 'Strongly Connected Components',
    summary:
      'In a directed graph, a strongly connected component is a maximal group where every vertex can reach every other — Kosaraju\'s finds them with two DFS passes, Tarjan\'s with a single pass using low-link values.',
    keyPoints: [
      'SCC: every vertex in the component can reach every other vertex in the same component, following edge directions',
      'Kosaraju\'s algorithm: DFS to compute finish order, reverse every edge, DFS again in decreasing finish order — each DFS tree in the second pass is one SCC',
      'Tarjan\'s algorithm: a single DFS pass tracking discovery time and "low-link" (lowest reachable discovery time) — no graph transpose needed',
      'Collapsing each SCC into a single node always yields a DAG — the **condensation graph** — which is what [[topological-sort]] then orders',
      'Not the same as connected components in an undirected graph — direction matters: a → b doesn\'t imply b can reach a',
    ],
    blocks: [
      {
        kind: 'note',
        title: 'Why Kosaraju\'s two passes work',
        text: 'The first DFS pass\'s finish-time ordering guarantees that if there\'s an edge from SCC A to SCC B (but not back), some vertex in A finishes after every vertex in B. Running DFS again on the **transposed** (edge-reversed) graph, processing vertices in decreasing finish order, means each new DFS tree can only wander into vertices belonging to the same SCC — the transpose ensures it can\'t leak into an SCC that A points to but that can\'t point back.',
      },
      {
        kind: 'table',
        caption: 'Kosaraju\'s vs Tarjan\'s',
        headers: ['', 'Kosaraju\'s', 'Tarjan\'s'],
        rows: [
          ['DFS passes', 'two (plus building the transpose graph)', 'one'],
          ['Extra structure', 'transposed adjacency list', 'a stack + low-link array'],
          ['Conceptual load', 'simpler to prove correct', 'simpler to implement once understood, harder to derive from scratch'],
        ],
      },
      {
        kind: 'code',
        title: 'Condensing SCCs into a DAG (sketch)',
        code: 'List<Integer> sccOf = computeSccIds(graph);         // e.g. via Kosaraju\'s or Tarjan\'s\nint sccCount = Collections.max(sccOf) + 1;\nSet<Integer>[] condensationAdj = new Set[sccCount];\nfor (int i = 0; i < sccCount; i++) condensationAdj[i] = new HashSet<>();\nfor (int u = 0; u < graph.size(); u++) {\n    for (int v : graph.get(u)) {\n        if (!sccOf.get(u).equals(sccOf.get(v))) {\n            condensationAdj[sccOf.get(u)].add(sccOf.get(v));   // edge between two different SCCs\n        }\n    }\n}\n// condensationAdj is now guaranteed acyclic — safe to topologically sort',
      },
      {
        kind: 'pitfall',
        title: 'Confusing SCCs with plain connectivity',
        text: 'Two vertices being "connected" in the underlying undirected sense (ignore arrow direction, some path exists between them) says nothing about whether they\'re in the same SCC — a directed cycle a → b → c → a is one SCC, but a → b → c with no way back is three separate one-vertex SCCs, even though all three vertices are reachable from each other if you ignore direction.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.2 — Strong Connectivity' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.5 — Directed Graphs' },
    ],
    related: ['graph-traversal-bfs-dfs', 'topological-sort', 'reductions-and-intractability'],
  },
]
