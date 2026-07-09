import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'graph-traversal-bfs-dfs',
    domainId: 'graph-algorithms',
    title: 'Graph Traversal: BFS & DFS',
    summary:
      'The two fundamental ways to visit every reachable vertex of a graph — BFS explores in layers and finds shortest paths by edge count, DFS dives as deep as possible and reveals structure like cycles and components.',
    keyPoints: [
      {
        text: 'BFS: FIFO queue, visits vertices in order of distance — the shortest path in an **unweighted** graph',
        detail: 'A queue guarantees every vertex at distance *k* is dequeued (and its neighbors discovered at distance *k+1*) before any vertex at distance *k+1* is processed — that strict layer-by-layer expansion is exactly what makes the first time a vertex is reached also its shortest-path distance, with no weights to worry about.',
      },
      {
        text: 'DFS: LIFO stack (explicit or via recursion), visits as deep as possible before backtracking',
        detail: 'A stack does the opposite of a queue: it always continues from the most recently discovered vertex, so the traversal commits to one path as far as it can go before ever considering a sibling branch — that "commit deep, then backtrack" shape is what exposes structure like cycles and dead ends that BFS\'s breadth-first shape does not surface as naturally.',
      },
      {
        text: 'Both run in O(V + E) with an adjacency list — every vertex and edge touched once',
        detail: 'The bound is additive, not multiplicative, because each vertex is enqueued/visited exactly once (the V term) and each edge is examined exactly once when scanning its endpoint\'s neighbor list (the E term) — an adjacency *matrix* would cost O(V²) instead, since checking every possible neighbor of every vertex is required regardless of how many edges actually exist.',
      },
      {
        text: 'DFS preorder/postorder timestamps power [[topological-sort]] and [[strongly-connected-components]]',
        detail: 'Preorder (when a vertex is first discovered) and postorder (when its recursive call finishes, i.e. all its descendants are done) capture different structural facts — postorder tells you a vertex finishes after everything reachable from it, which is exactly the ordering topological sort needs, and comparing finish times across two DFS passes is how Kosaraju\'s SCC algorithm works.',
      },
      {
        text: 'Recursive DFS risks `StackOverflowError` on long chains (e.g. a linked-list-shaped graph with 100,000 nodes) — an explicit stack avoids the recursion depth limit',
        detail: 'Each recursive call consumes a JVM stack frame, and the JVM\'s call stack is a fixed, comparatively small region of memory (megabytes, not the gigabytes available to the heap) — a graph shaped like a long chain drives recursion depth equal to its length, which can exceed that limit long before it would exceed any memory limit on an explicit, heap-allocated `Deque` used as a stack instead.',
      },
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
        detail: 'The manual bookkeeping cost is real: with recursion, "do this after visiting all my children" is just code that runs after the recursive call returns — with an explicit stack, there is no such natural return point, so postorder logic needs its own marker (e.g. pushing a vertex twice, once to expand it and once to finalize it) to know when a vertex\'s subtree is actually done.',
      },
      {
        kind: 'note',
        text: 'BFS and DFS are the traversal engines everything else in this domain is built on: [[topological-sort]] uses DFS postorder or a BFS-style in-degree count, [[shortest-paths]] generalizes BFS to weighted edges, and [[strongly-connected-components]] runs DFS twice.',
        detail: 'Almost every other algorithm in this domain is best understood as "BFS or DFS, plus one extra piece of bookkeeping" rather than something built from scratch — recognizing which of the two traversal shapes a new problem needs (layers outward, or commit-deep-then-backtrack) is usually the first and most important design decision.',
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
      {
        text: 'Only defined for **directed acyclic graphs** (DAGs) — a cycle means no valid ordering exists',
        detail: 'A topological order demands every edge point forward in the ordering — if A depends on B and B depends on A, no linear arrangement can put both A before B and B before A simultaneously, so a cycle is a logical proof that no valid ordering can exist, not just a case the algorithm happens to handle badly.',
      },
      {
        text: 'Kahn\'s algorithm: repeatedly remove vertices with in-degree 0, which is BFS in spirit',
        detail: 'A vertex with in-degree 0 has no unsatisfied prerequisites left, so it is always safe to place next in the order — removing it (and decrementing its neighbors\' in-degrees) can only create more such "ready" vertices, never fewer, which is why a simple queue of ready vertices, processed FIFO, is enough to drive the whole algorithm.',
      },
      {
        text: 'DFS-based alternative: run DFS, then reverse the postorder finish times',
        detail: 'A vertex finishes (postorder) only after everything reachable from it has already finished — so in a DAG, a vertex always finishes after all of its dependents, meaning the reverse of finish order places prerequisites before what depends on them, exactly the property a topological order requires.',
      },
      {
        text: 'A topological order is rarely unique — many valid orderings can satisfy the same DAG',
        detail: 'Any two vertices with no path between them in either direction can appear in either relative order without violating any edge constraint — a DAG only pins down the *relative* order of vertices that are actually connected by a dependency chain, leaving every unrelated pair free to be ordered arbitrarily.',
      },
      {
        text: 'Kahn\'s algorithm detects a cycle for free: if fewer than V vertices get removed, a cycle exists',
        detail: 'Every vertex inside a cycle always has at least one unsatisfied prerequisite from within that same cycle, so its in-degree can never reach 0 through the normal removal process — those vertices simply never get added to the ready queue, and the final output falls short of V vertices exactly when a cycle blocked some of them forever.',
      },
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
        detail: 'The "in current recursion stack" marker is what catches a **back edge** — an edge pointing to a vertex that is an ancestor in the current DFS path, which is precisely what a cycle looks like during a DFS traversal. A plain `visited` array cannot distinguish "already fully processed" from "currently being processed higher up this same call stack," which is exactly the distinction cycle detection needs.',
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
        detail: 'The output list still *looks* like a valid ordering — it just quietly excludes whichever vertices got stuck in a cycle with unsatisfied in-degree — so without the explicit size check, a caller has no signal that anything is missing, and can go on to process a task list that silently dropped a chunk of legitimately-required work.',
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
      {
        text: 'Unweighted graph: plain [[graph-traversal-bfs-dfs|BFS]] already gives shortest paths by edge count',
        detail: 'Treating every edge as weight 1 makes "shortest path" and "fewest edges" the same question, and BFS\'s layer-by-layer expansion already answers exactly that — reaching for Dijkstra on an unweighted graph works too, but it is strictly more machinery (a priority queue) to compute something a plain queue already gives you.',
      },
      {
        text: 'Dijkstra: greedy, priority-queue driven, O((V+E) log V) — but silently **wrong** with negative edge weights',
        detail: 'The greedy step always extends the path through the currently-closest unvisited vertex, on the assumption that no future discovery could ever produce a cheaper route to it — a negative edge violates that assumption directly, since a longer-looking path could still end up cheaper overall, and Dijkstra has no way to detect or correct for that.',
      },
      {
        text: 'Bellman-Ford: relax every edge V−1 times, O(VE) — handles negative weights and detects negative cycles',
        detail: 'A shortest path in a graph with V vertices can use at most V−1 edges (visiting more would revisit a vertex, which is never optimal), so V−1 full rounds of relaxing every edge are guaranteed to have propagated the true shortest distance to every vertex — no greedy shortcut, no assumption about edge sign, just brute-force repetition until it provably converges.',
      },
      {
        text: 'Floyd-Warshall: O(V³) dynamic program over all pairs — best when you need every-source-to-every-sink distances',
        detail: 'Running Dijkstra or Bellman-Ford from every single vertex would also produce all-pairs distances, but at O(V) times their single-source cost — Floyd-Warshall\'s dynamic program (incrementally allowing each vertex as an intermediate stop) computes the same result in one pass, which is cheaper specifically because it is solving the all-pairs version directly instead of V separate single-source problems.',
      },
      {
        text: 'Both Dijkstra and Prim\'s [[minimum-spanning-trees|MST]] share the same priority-queue-driven greedy shape, but they optimize different things',
        detail: 'Dijkstra always extends by the cheapest *total distance from the source*, while Prim\'s always extends by the cheapest *single edge* crossing the current tree\'s frontier — the code structure (priority queue, pop cheapest, relax neighbors) is nearly identical, but that one difference in what gets compared is why one produces shortest paths and the other produces a minimum spanning tree.',
      },
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
        detail: 'This is what makes the bug so dangerous in practice: there is no crash, no exception, no obviously malformed output — just a plausible-looking distance value that happens to be wrong, which routinely survives code review and only surfaces once a negative-weight edge (a discount, a refund, a rebate modeled as negative cost) shows up in production data.',
      },
      {
        kind: 'note',
        title: 'Negative cycle detection is Bellman-Ford\'s free byproduct',
        text: 'After V−1 relaxation rounds, every shortest path (if one exists, i.e. no negative cycle is reachable) has stabilized. Running one more round: if any edge still relaxes (finds a shorter distance), a negative-weight cycle is reachable from the source and "shortest path" is undefined — some path can be shortened forever by looping through it.',
        detail: 'This extra round costs nothing extra asymptotically (it is just one more O(E) pass on top of the V−1 already done) but turns Bellman-Ford from "computes shortest paths, assuming they exist" into "computes shortest paths, or definitively tells you why they don\'t" — a correctness guarantee Dijkstra and Floyd-Warshall do not offer without extra work.',
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
      {
        text: 'An MST connects V vertices using exactly V − 1 edges at minimum total weight',
        detail: 'V−1 is both necessary and sufficient for a tree spanning V vertices: fewer edges would leave the graph disconnected (a tree with V vertices and fewer than V−1 edges cannot reach everything), and more edges would necessarily create a cycle, which a tree by definition cannot have — V−1 is the exact edge count where "connected" and "acyclic" both hold simultaneously.',
      },
      {
        text: 'Prim\'s: grow one tree from a start vertex, always adding the cheapest edge crossing the frontier — structurally identical to [[shortest-paths|Dijkstra]]',
        detail: 'The "frontier" is the set of edges connecting the growing tree to everything not yet included — always taking the cheapest such edge guarantees no cheaper way to bring in that next vertex exists at this stage, which is the same greedy-extension shape as Dijkstra, just comparing single edge weights instead of accumulated path distances.',
      },
      {
        text: 'Kruskal\'s: sort all edges, add each one unless it would form a cycle — needs [[disjoint-sets-union-find|union-find]] for the cycle check',
        detail: 'Processing edges cheapest-first and skipping any that would connect two vertices already in the same component guarantees every edge actually added is the cheapest available way to merge two previously-separate pieces — union-find answers "are these two vertices already connected?" in near-constant time, which is what keeps the cycle check from becoming the algorithm\'s bottleneck.',
      },
      {
        text: 'Both are greedy and both are correct, justified by the **cut property**: the cheapest edge crossing any cut belongs to *some* MST',
        detail: 'This is the theorem that makes greedy provably safe here, not just empirically lucky: unlike many problems where greedy choices can lock in a suboptimal result, the cut property guarantees the locally cheapest choice is always part of *some* globally optimal solution, so neither algorithm ever needs to backtrack or reconsider an earlier decision.',
      },
      {
        text: 'The MST is unique only if all edge weights are distinct; with ties, multiple different MSTs can share the same minimum total weight',
        detail: 'When two edges have equal weight, a tie-break in which one gets chosen first can produce a structurally different tree that still sums to the same minimum total weight — the *value* of the MST is always unique, but the specific *set of edges* achieving it is only guaranteed unique when no two weights are equal.',
      },
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
        detail: 'Seeing both algorithms as "find a cut, take its cheapest crossing edge, repeat" clarifies what otherwise looks like two unrelated procedures: Prim\'s always uses the cut between the growing tree and everything outside it, while Kruskal\'s implicitly uses whatever cut separates the two components a given edge would merge — same underlying justification, different bookkeeping.',
      },
      {
        kind: 'pitfall',
        title: 'Kruskal\'s without union-find degrades badly',
        text: 'The whole point of union-find in Kruskal\'s is answering "are u and v already connected?" in near-O(1) amortized time. Substituting a naive reachability check (BFS/DFS per edge) turns the cycle test into O(V) per edge, making the whole algorithm O(E·V) instead of O(E log E) — correct, but far too slow for large graphs.',
        detail: 'The slowdown compounds because the cycle check runs once per candidate edge, and there can be up to E of them — replacing a near-constant-time check with an O(V) traversal multiplies the total work by a factor of V, turning an algorithm that scales gracefully to millions of edges into one that becomes impractical well before that.',
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
      {
        text: 'Each edge has a **capacity**; flow through it can\'t exceed that capacity, and flow into a vertex must equal flow out (except source/sink)',
        detail: 'This "flow conservation" constraint is what makes the model behave like a real network (water in pipes, current in wires) rather than an arbitrary graph problem — every intermediate vertex is purely a pass-through, so any flow value the algorithm computes is automatically physically realizable, not just a number that satisfies capacity limits in isolation.',
      },
      {
        text: 'Ford-Fulkerson: repeatedly find an augmenting path from source to sink in the **residual graph**, push flow equal to its bottleneck capacity',
        detail: 'The bottleneck capacity of a path is the smallest remaining capacity among all its edges — pushing exactly that much flow saturates at least one edge on the path (using up all its remaining capacity), which is why each augmenting path strictly increases total flow and the process is guaranteed to make progress every iteration.',
      },
      {
        text: 'Edmonds-Karp: Ford-Fulkerson using BFS to find the augmenting path each time — guarantees O(VE²), avoiding pathological slow convergence',
        detail: 'Plain Ford-Fulkerson with an arbitrary path-finding strategy can, on adversarial inputs, take a number of augmenting-path iterations proportional to the total capacity value rather than the graph size — always choosing the *shortest* augmenting path (via BFS) bounds the number of iterations by a function of V and E alone, independent of how large the capacities are.',
      },
      {
        text: 'Max-flow min-cut theorem: the maximum flow value equals the capacity of the minimum cut separating source from sink',
        detail: 'This is a genuine duality, not a coincidence: any cut\'s capacity is an upper bound on any possible flow (everything must cross that cut), and the theorem guarantees some flow actually achieves that bound — so once Ford-Fulkerson can no longer find an augmenting path, the current flow is provably maximum, and the edges saturated by it identify a minimum cut for free.',
      },
      {
        text: 'Models far beyond literal "flow": bipartite matching, project selection, image segmentation all reduce to max-flow — see [[reductions-and-intractability]]',
        detail: 'Max-flow\'s real value is as a general-purpose optimization primitive: once a problem can be reframed as "route as much through a capacitated network as possible" or equivalently "find the cheapest set of edges to cut," a well-tested max-flow algorithm solves it, without needing a bespoke algorithm designed from scratch for that specific problem.',
      },
    ],
    blocks: [
      {
        kind: 'note',
        title: 'The residual graph is the whole trick',
        text: 'For every edge (u, v) with capacity c and current flow f, the residual graph keeps a **forward** edge of remaining capacity c − f, and crucially a **backward** edge of capacity f — allowing a later augmenting path to "undo" some of the flow already sent, if that turns out to open a better overall route. Without the backward edge, the algorithm can get stuck in a suboptimal flow it can never repair.',
        detail: 'This is what separates max-flow from a naive greedy path-filling approach: greedily filling the first path found can commit capacity in a way that blocks a better overall solution, and without a mechanism to reconsider that decision, the algorithm would just get stuck. The backward edge is literally an "undo" option — it lets a later path reroute flow that was sent too early.',
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
        detail: 'The failure is silent in the same way Dijkstra-with-negative-weights is silent: the algorithm terminates normally (no more augmenting paths found in the broken residual graph) and returns a flow value that looks plausible but is provably less than the true maximum — there is no error, just a wrong answer that requires comparing against the min-cut to even notice.',
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
      {
        text: 'SCC: every vertex in the component can reach every other vertex in the same component, following edge directions',
        detail: '"Mutually reachable" is a stricter requirement than it first sounds — a → b → c with no edge back to a means a can reach c, but c cannot reach a, so despite the connectivity, none of them share an SCC unless every vertex can get back to every other one, respecting arrow direction the whole way.',
      },
      {
        text: 'Kosaraju\'s algorithm: DFS to compute finish order, reverse every edge, DFS again in decreasing finish order — each DFS tree in the second pass is one SCC',
        detail: 'Reversing every edge flips which components can reach which without changing which vertices are mutually reachable within a component — running the second DFS in decreasing finish order (from the first pass) is what guarantees each new tree stays confined to exactly one SCC instead of spilling into a component that the first one could reach but not vice versa.',
      },
      {
        text: 'Tarjan\'s algorithm: a single DFS pass tracking discovery time and "low-link" (lowest reachable discovery time) — no graph transpose needed',
        detail: 'The low-link value answers "what is the earliest-discovered vertex reachable from here, including via back edges" — a vertex whose low-link equals its own discovery time is the root of an SCC, because nothing in its subtree can reach further back than it can, which is exactly the condition for popping a complete SCC off the tracking stack.',
      },
      {
        text: 'Collapsing each SCC into a single node always yields a DAG — the **condensation graph** — which is what [[topological-sort]] then orders',
        detail: 'A cycle between two condensed nodes would mean some vertex in SCC A can reach some vertex in SCC B and vice versa — but mutual reachability between components is exactly what would have merged A and B into one larger SCC in the first place, so by construction no such cycle can survive the condensation.',
      },
      {
        text: 'Not the same as connected components in an undirected graph — direction matters: a → b doesn\'t imply b can reach a',
        detail: 'Running plain undirected connected-components logic on a directed graph (ignoring arrow direction) answers a completely different question — "is there some path ignoring direction" rather than "can each reach the other respecting direction" — and will report vertices as connected that an SCC computation would correctly split into several separate one-vertex components.',
      },
    ],
    blocks: [
      {
        kind: 'note',
        title: 'Why Kosaraju\'s two passes work',
        text: 'The first DFS pass\'s finish-time ordering guarantees that if there\'s an edge from SCC A to SCC B (but not back), some vertex in A finishes after every vertex in B. Running DFS again on the **transposed** (edge-reversed) graph, processing vertices in decreasing finish order, means each new DFS tree can only wander into vertices belonging to the same SCC — the transpose ensures it can\'t leak into an SCC that A points to but that can\'t point back.',
        detail: 'Starting the second pass from the vertex with the latest finish time is what pins it to the "source" SCC of the condensation DAG — one with no incoming edges from an unvisited component — so the transposed graph\'s edges from that SCC only ever lead back into itself, never forward into a downstream SCC it cannot return from.',
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
        detail: 'This distinction has real consequences whenever direction encodes something meaningful — dependencies, web links, follower graphs — treating them as undirected for a "connectivity" check would report a whole cluster as mutually related when in fact influence or dependency only flows one way through most of it, hiding exactly the asymmetry the directed structure was modeling.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.2 — Strong Connectivity' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.5 — Directed Graphs' },
    ],
    related: ['graph-traversal-bfs-dfs', 'topological-sort', 'reductions-and-intractability'],
  },
]
