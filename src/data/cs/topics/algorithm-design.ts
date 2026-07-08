import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'divide-and-conquer',
    domainId: 'algorithm-design',
    title: 'Divide & Conquer',
    summary:
      'Split a problem into independent subproblems of the same shape, solve each recursively, then combine the results. The recursion tree — not the code — is where the runtime comes from ([[recursion-and-recurrences]]).',
    keyPoints: [
      'Three steps: divide (split the input), conquer (recurse on each piece), combine (merge the sub-results)',
      'Correctness comes from induction: if the recursive calls solve their smaller inputs correctly, and combine is correct, the whole is correct',
      'The classic win is turning an O(n²) combine-everything approach into O(n log n) by keeping subproblems independent',
      'Mergesort, quicksort, binary search, and the Master Theorem\'s canonical form T(n) = aT(n/b) + f(n) are all divide-and-conquer',
      'Not free: it only pays off when subproblems are truly independent — overlapping subproblems belong to [[dynamic-programming]] instead',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The template is almost always the same shape: a base case for trivially small input, a split into (usually two) smaller instances, a recursive call on each, and a combine step that assembles the final answer from the sub-answers. [[mergesort]] is the textbook example — split the array in half, sort each half, merge the two sorted halves in linear time. The combine step\'s cost, multiplied across the recursion tree, is what the Master Theorem is solving for.',
      },
      {
        kind: 'code',
        title: 'Closest pair of points — the shape of every D&C algorithm',
        code: 'static double closestPair(Point[] pts, int lo, int hi) {\n    if (hi - lo <= 3) return bruteForce(pts, lo, hi);      // base case\n\n    int mid = (lo + hi) / 2;\n    double midX = pts[mid].x;\n\n    double dLeft  = closestPair(pts, lo, mid);             // conquer left\n    double dRight = closestPair(pts, mid, hi);             // conquer right\n    double d = Math.min(dLeft, dRight);\n\n    return combineAcrossStrip(pts, lo, hi, midX, d);       // combine: only check\n}                                                           // points within d of the midline',
        caption: 'The combine step is the hard part — it must do less than O(n) work per level, or the whole algorithm degrades to O(n²)',
      },
      {
        kind: 'table',
        caption: 'Recurrence shape → total runtime (Master Theorem intuition)',
        headers: ['Recurrence', 'Combine cost', 'Total', 'Example'],
        rows: [
          ['T(n) = 2T(n/2) + O(1)', 'constant', 'O(n)', 'binary tree traversal'],
          ['T(n) = 2T(n/2) + O(n)', 'linear merge', 'O(n log n)', '[[mergesort]]'],
          ['T(n) = 2T(n/2) + O(n²)', 'expensive combine', 'O(n²)', 'combine dominates — D&C bought nothing'],
          ['T(n) = T(n/2) + O(1)', 'discard half, no merge', 'O(log n)', '[[binary-search-and-variants]]'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A costly combine step erases the recursion\'s benefit',
        text: 'Divide-and-conquer only wins when the combine step is asymptotically cheaper than solving the whole problem directly. If combining sub-results costs O(n²), the O(log n) recursion depth is irrelevant — the total is still dominated by the combine cost at the top of the tree. Always check what the combine step actually costs before assuming "recursive = fast".',
      },
      {
        kind: 'note',
        title: 'D&C vs. dynamic programming: the one question that tells them apart',
        text: 'Ask: do the subproblems overlap? If splitting the input produces genuinely disjoint pieces that never need to be recombined or looked up again (mergesort\'s two halves never share elements), it\'s divide-and-conquer — recurse freely, no need to cache. If the same subproblem gets solved repeatedly from different call paths (Fibonacci, edit distance), it\'s [[dynamic-programming]] — cache or you pay exponential cost re-deriving the same answer.',
      },
      {
        kind: 'bestPractice',
        title: 'Prove the base case and the inductive step separately',
        text: 'Treat a divide-and-conquer algorithm like a proof by induction, because that is what it is. State the base case (smallest legal input) and confirm it\'s handled directly. Then state the inductive hypothesis — "assume the recursive calls correctly solve their smaller inputs" — and verify only that the combine step is correct given that assumption ([[correctness-and-invariants]]). Most off-by-one bugs in recursive code come from skipping this and reasoning about the whole recursion at once.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3, 5.1 — Mergesort; Divide-and-Conquer' },
      { book: 'dsa-goodrich', chapter: 'Ch. 5 — Recursion; Ch. 12 — Sorting and Selection' },
    ],
    related: ['recursion-and-recurrences', 'mergesort', 'dynamic-programming', 'binary-search-and-variants'],
  },

  {
    id: 'greedy-algorithms',
    domainId: 'algorithm-design',
    title: 'Greedy Algorithms',
    summary:
      'At each step, take the locally best choice and never reconsider it. Greedy is fast and simple, but only correct when the problem has the right structure — it is the algorithm design paradigm most often applied incorrectly.',
    keyPoints: [
      'A greedy algorithm builds a solution incrementally, committing to the best-looking choice at each step and never backtracking',
      'Correctness requires proof — usually via the "exchange argument": any optimal solution can be transformed into the greedy one without getting worse',
      'Two structural properties that make greedy work: the *greedy-choice property* (a locally optimal choice is part of some global optimum) and *optimal substructure*',
      'Classic correct greedy algorithms: Dijkstra\'s [[shortest-paths]], Prim\'s and Kruskal\'s [[minimum-spanning-trees]], Huffman coding, activity/interval scheduling',
      'When greedy is wrong, it fails silently — it produces *a* valid answer, just not the optimal one; always verify with a counterexample or a proof, never by intuition alone',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Greedy is the cheapest algorithm design paradigm to implement and the easiest to get wrong. The code is almost always short: sort by some criterion, walk through, take what fits. The hard part is entirely in the proof that the locally best choice can never be worse than deferring — which is why greedy algorithms in textbooks are always paired with a correctness argument, not just a description.',
      },
      {
        kind: 'code',
        title: 'Activity selection — the canonical correct greedy',
        code: 'static List<Activity> selectActivities(List<Activity> activities) {\n    activities.sort(Comparator.comparingInt(a -> a.finishTime));  // greedy criterion: earliest finish\n\n    List<Activity> chosen = new ArrayList<>();\n    int lastFinish = Integer.MIN_VALUE;\n    for (Activity a : activities) {\n        if (a.startTime >= lastFinish) {   // never conflicts with what we already chose\n            chosen.add(a);\n            lastFinish = a.finishTime;\n        }\n    }\n    return chosen;\n}',
        caption: 'Sorting by finish time (not duration, not start time) is what makes this greedy choice provably optimal',
      },
      {
        kind: 'table',
        caption: 'Greedy criterion matters — same problem shape, different rule',
        headers: ['Problem', 'Greedy rule', 'Correct?'],
        rows: [
          ['Activity selection', 'earliest finish time first', 'Yes — provably optimal'],
          ['Activity selection', 'shortest duration first', 'No — classic counterexample exists'],
          ['Fractional knapsack', 'highest value/weight ratio first', 'Yes'],
          ['0/1 knapsack', 'highest value/weight ratio first', 'No — needs [[dynamic-programming]]'],
          ['Coin change (US coins)', 'largest denomination first', 'Yes, for this coin system'],
          ['Coin change (arbitrary denominations)', 'largest denomination first', 'No — needs DP'],
        ],
      },
      {
        kind: 'pitfall',
        title: '0/1 knapsack looks greedy — it is not',
        text: 'Fractional knapsack (you may take a fraction of an item) is correctly solved by greedily taking the best value/weight ratio first. The 0/1 variant (whole items only) breaks this: taking the best-ratio item first can leave awkward leftover capacity that a different combination would have used better. The fix is [[dynamic-programming]] over (item, remaining capacity) states — a one-word change to the problem (fractional → whole) changes the required paradigm entirely.',
      },
      {
        kind: 'note',
        title: 'The exchange argument, in one sentence',
        text: 'To prove a greedy algorithm correct, take any optimal solution that differs from the greedy one, find the first point where they diverge, and show you can swap the optimal solution\'s choice for the greedy choice without making the solution worse — repeat until the two solutions are identical. If that swap is always safe, greedy loses nothing by committing early, which is exactly what makes it correct.',
      },
      {
        kind: 'bestPractice',
        title: 'Look for a matroid before trusting your greedy instinct',
        text: 'Problems whose valid solutions form a matroid (a set system with an exchange property) are exactly the problems where greedy is guaranteed correct — MST and scheduling problems are matroids in disguise. You don\'t need the formal theory to use this as a sanity check: if you can\'t articulate why the locally best choice can never be undone by a better global arrangement, don\'t trust the greedy approach without testing it against small brute-forced examples first.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.3 — Minimum Spanning Trees' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.4 — Greedy Method' },
      { book: 'algorithms-notes', chapter: 'Ch. Greedy Algorithms' },
    ],
    related: ['minimum-spanning-trees', 'shortest-paths', 'dynamic-programming', 'reductions-and-intractability'],
  },

  {
    id: 'dynamic-programming',
    domainId: 'algorithm-design',
    title: 'Dynamic Programming',
    summary:
      'Solve every distinct subproblem exactly once and cache the result. DP applies precisely when a problem has overlapping subproblems and optimal substructure — the same recursive shape as [[divide-and-conquer]], but with subproblems that recur.',
    keyPoints: [
      'Two required ingredients: overlapping subproblems (the same subproblem is reached via different call paths) and optimal substructure (an optimal solution is built from optimal solutions to subproblems)',
      'Two equivalent implementation styles: top-down memoization (recursion + cache) and bottom-up tabulation (iterate subproblems in dependency order)',
      'The recipe: define the state precisely, write the recurrence relating a state to smaller states, pick a base case, choose an evaluation order',
      'Space is frequently reducible: if the recurrence only looks back a fixed number of rows/states, keep only those instead of the full table',
      'A DP recurrence you can\'t state in one sentence usually means the state definition is wrong — fix the state before optimizing the code',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Memoization vs. tabulation',
        headers: ['', 'Top-down (memoization)', 'Bottom-up (tabulation)'],
        rows: [
          ['Structure', 'recursive function + cache (`Map` or array)', 'iterative loop filling a table in dependency order'],
          ['Computes', 'only the subproblems actually needed', 'every subproblem up to the target, always'],
          ['Overhead', 'recursion + hashing/lookup cost', 'none — array indexing'],
          ['Stack risk', 'can overflow on deep recursion', 'none'],
          ['Best when', 'sparse subproblem space, recurrence is natural to write recursively', 'dense subproblem space, need max speed or to reconstruct the solution path'],
        ],
      },
      {
        kind: 'code',
        title: 'Same recurrence, both styles — longest common subsequence',
        code: '// Top-down: recurse, cache by (i, j)\nMap<Long, Integer> memo = new HashMap<>();\nint lcs(String a, String b, int i, int j) {\n    if (i == a.length() || j == b.length()) return 0;\n    long key = (long) i << 32 | j;\n    if (memo.containsKey(key)) return memo.get(key);\n\n    int result = a.charAt(i) == b.charAt(j)\n        ? 1 + lcs(a, b, i + 1, j + 1)\n        : Math.max(lcs(a, b, i + 1, j), lcs(a, b, i, j + 1));\n    memo.put(key, result);\n    return result;\n}\n\n// Bottom-up: fill a table, no recursion\nint lcsTabulated(String a, String b) {\n    int[][] dp = new int[a.length() + 1][b.length() + 1];\n    for (int i = a.length() - 1; i >= 0; i--)\n        for (int j = b.length() - 1; j >= 0; j--)\n            dp[i][j] = a.charAt(i) == b.charAt(j)\n                ? 1 + dp[i + 1][j + 1]\n                : Math.max(dp[i + 1][j], dp[i][j + 1]);\n    return dp[0][0];\n}',
      },
      {
        kind: 'pitfall',
        title: 'Memoizing without first proving optimal substructure',
        text: 'Adding a cache to a recursive function only helps if the recurrence is actually correct — memoization fixes *performance*, not *correctness*. A common bug is writing a greedy-looking recursive function, discovering it\'s slow, adding a `Map` cache, and getting a fast wrong answer instead of a slow wrong answer. Verify the recurrence against small hand-worked examples before optimizing it.',
      },
      {
        kind: 'note',
        title: 'State design is the whole problem',
        text: 'Once the state is right, the recurrence and code are usually mechanical. The hard, non-mechanical step is deciding *what a state is* — e.g. for LCS, the state is "the LCS of a\'s suffix from i and b\'s suffix from j", not just "position i". For knapsack, the state is (item index, remaining capacity) — dropping the capacity dimension collapses distinct subproblems into one and produces a wrong recurrence. When a DP is hard to write, the fix is almost always to reconsider the state, not the code.',
      },
      {
        kind: 'bestPractice',
        title: 'Reduce dimensions only after correctness, not before',
        text: 'Space-optimizing a DP (e.g. keeping only the previous row of a 2D table) is a valuable but purely mechanical last step. Do it after the full-table version is verified correct — rolling the array too early makes debugging much harder, since you lose the ability to print the whole table and visually spot-check it against a brute-force solution.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 5 — appendix on dynamic programming problems' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.3 — Dynamic Programming' },
      { book: 'crushing-tech-interview', chapter: 'Ch. Dynamic Programming' },
    ],
    related: ['recursion-and-recurrences', 'divide-and-conquer', 'greedy-algorithms', 'amortized-analysis'],
  },

  {
    id: 'backtracking',
    domainId: 'algorithm-design',
    title: 'Backtracking',
    summary:
      'Explore a solution space depth-first, building a partial solution incrementally and abandoning ("backtracking" from) any branch that can\'t possibly succeed. It is brute-force search made tractable by pruning early.',
    keyPoints: [
      'The shape: choose a candidate for the next slot, recurse, undo the choice on return — the "undo" step is what distinguishes backtracking from plain recursive enumeration',
      'Pruning ("is this partial solution still viable?") is what separates a backtracking algorithm that finishes in milliseconds from one that never terminates',
      'Classic applications: N-Queens, Sudoku, generating permutations/subsets/combinations, graph coloring, constraint satisfaction',
      'Worst-case complexity is exponential — backtracking makes an exponential problem *practical*, not polynomial',
      'Distinct from plain recursion in that state is mutated in place and explicitly reverted, which keeps memory usage to the recursion depth instead of copying state at every call',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'N-Queens — choose, recurse, undo',
        code: 'boolean[] cols = new boolean[n], diag1 = new boolean[2 * n], diag2 = new boolean[2 * n];\n\nboolean solve(int row, int n, int[] placement) {\n    if (row == n) return true;                    // base case: all rows placed\n\n    for (int col = 0; col < n; col++) {\n        if (cols[col] || diag1[row + col] || diag2[row - col + n]) continue;  // prune\n\n        placement[row] = col;                       // choose\n        cols[col] = diag1[row + col] = diag2[row - col + n] = true;\n\n        if (solve(row + 1, n, placement)) return true;   // recurse\n\n        cols[col] = diag1[row + col] = diag2[row - col + n] = false;         // undo\n    }\n    return false;   // every column in this row failed — backtrack further up\n}',
        caption: 'The three booleans arrays turn "is this square attacked" from an O(n) scan into O(1) — pruning speed matters as much as the pruning logic itself',
      },
      {
        kind: 'pitfall',
        title: 'Forgetting the undo step corrupts sibling branches',
        text: 'Every mutation made while choosing a candidate (marking a column used, appending to a partial-solution list) must be undone before trying the next candidate at the same level. Skip the undo and the state leaks into sibling branches that were never actually valid, producing wrong answers or missed solutions that are notoriously hard to debug because the bug only manifests several levels deep in the recursion.',
      },
      {
        kind: 'note',
        title: 'Backtracking vs. exhaustive recursion',
        text: 'Exhaustive recursive enumeration (e.g. generating every subset of a set) explores the full 2ⁿ space unconditionally. Backtracking adds a viability check before recursing further — a partial Sudoku assignment that already breaks a row constraint is abandoned immediately, without ever generating the (huge) subtree beneath it. The pruning check is the entire reason backtracking is fast in practice despite the same theoretical exponential worst case; see [[backtracking-templates]] for the reusable code shape.',
      },
      {
        kind: 'bestPractice',
        title: 'Prune as early as possible, not just at the leaves',
        text: 'The value of a backtracking algorithm is proportional to how early it can discard a doomed branch. Checking constraints only once a full candidate is assembled (e.g. building an entire N-Queens placement, then checking if any queens attack each other) reduces to exhaustive search with extra steps. Push the validity check to the earliest point where enough information exists to make the call — as in the N-Queens example, checked one placement at a time as each queen is added.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 5.4 — Backtracking' },
      { book: 'algorithms-notes', chapter: 'Ch. Backtracking' },
      { book: 'crushing-tech-interview', chapter: 'Ch. Recursion and Backtracking' },
    ],
    related: ['recursion-and-recurrences', 'backtracking-templates', 'reductions-and-intractability'],
  },

  {
    id: 'string-matching-algorithms',
    domainId: 'algorithm-design',
    title: 'String Matching',
    summary:
      'Finding a pattern inside a text faster than the naive O(nm) character-by-character scan — by reusing information the pattern itself reveals (KMP), hashing substrings (Rabin-Karp), or indexing the text ([[tries]]).',
    keyPoints: [
      'Naive matching re-checks characters after every mismatch — O(nm) worst case, quadratic on adversarial or repetitive input',
      'Knuth-Morris-Pratt (KMP) precomputes a "failure function" over the pattern so a mismatch never re-examines text already matched — O(n + m)',
      'Rabin-Karp hashes substrings of the text using a rolling hash and compares hashes instead of characters — expected O(n + m), with O(nm) if hash collisions are adversarial',
      'A [[tries]] or suffix-structure approach amortizes cost across many pattern searches against the same text — build once, query many patterns fast',
      'Choice depends on the workload: one pattern vs. many patterns vs. many texts changes which algorithm actually wins',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'String matching approaches',
        headers: ['Algorithm', 'Time', 'Best for'],
        rows: [
          ['Naive scan', 'O(nm) worst case', 'short pattern, one-off search, simplicity'],
          ['KMP', 'O(n + m), always', 'guaranteed linear time regardless of input'],
          ['Rabin-Karp', 'O(n + m) expected', 'searching for *multiple* patterns of the same length at once (hash each, compare)'],
          ['Trie / Aho-Corasick over patterns', 'O(n + m + z) for z matches', 'many patterns searched against the same text repeatedly'],
        ],
      },
      {
        kind: 'code',
        title: 'KMP failure function — the key idea',
        code: 'int[] buildFailureFunction(String pattern) {\n    int[] fail = new int[pattern.length()];\n    int len = 0;                       // length of the current matching prefix\n    for (int i = 1; i < pattern.length(); i++) {\n        while (len > 0 && pattern.charAt(i) != pattern.charAt(len)) {\n            len = fail[len - 1];        // fall back to a shorter prefix, don\'t rescan text\n        }\n        if (pattern.charAt(i) == pattern.charAt(len)) len++;\n        fail[i] = len;\n    }\n    return fail;\n}',
        caption: 'fail[i] = length of the longest proper prefix of pattern[0..i] that is also a suffix of it — this is what lets matching skip ahead on a mismatch',
      },
      {
        kind: 'paragraph',
        text: 'The insight behind KMP: when a mismatch occurs after matching k characters of the pattern, the naive algorithm slides the pattern one position and starts over from scratch — but the k characters already matched contain information. If the pattern has an internal prefix that repeats, matching can resume from partway through the pattern instead of from its start, without ever re-reading a text character it already looked at. That guarantee — text characters are examined at most twice total — is what makes KMP O(n + m) instead of O(nm).',
      },
      {
        kind: 'pitfall',
        title: 'Rabin-Karp needs a real rolling hash, not string concatenation and re-hashing',
        text: 'The entire value of Rabin-Karp is computing each substring\'s hash in O(1) from the previous one (subtract the outgoing character\'s contribution, shift, add the incoming character) rather than re-hashing the full window every position — recomputing the hash from scratch at every position degrades it back to O(nm). Use a well-chosen modulus to avoid overflow and adversarial collisions; always verify a hash match with an actual character comparison before accepting it as a true match.',
      },
      {
        kind: 'note',
        title: 'This is what regex engines and `String.indexOf` build on',
        text: 'Java\'s `String.indexOf` uses (a variant of) naive/Boyer-Moore-style scanning internally, which is fine for typical short patterns against short texts. When matching many patterns repeatedly, or against very large texts, a hand-rolled KMP, Rabin-Karp, or Aho-Corasick pass is a legitimate and common optimization — this is the same territory covered by regex engines, which compile a pattern once and reuse the compiled form for exactly this reason.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 5.3 — Substring Search' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.2 — Text Processing' },
    ],
    related: ['tries', 'hash-tables', 'divide-and-conquer'],
  },

  {
    id: 'reductions-and-intractability',
    domainId: 'algorithm-design',
    title: 'Reductions & Intractability',
    summary:
      'A reduction transforms one problem into another so that solving the target solves the original. Reductions are how new NP-complete problems are discovered, and how a real-world problem is recognized as (probably) intractable before wasting effort on an exact algorithm.',
    keyPoints: [
      'A reduces to B means: given a solver for B, you can solve A with only polynomial extra work — B is "at least as hard" as A',
      'Proving a new problem NP-complete: show it\'s in NP (a solution can be verified in polynomial time), then reduce a known NP-complete problem to it',
      'Recognizing your problem resembles Traveling Salesman, Knapsack, SAT, Vertex Cover, or Graph Coloring is a strong signal that no polynomial exact algorithm is likely to exist ([[complexity-classes]])',
      'Practical response to intractability: approximation algorithms (provably close to optimal), heuristics (no guarantee, works well in practice), restricting to special-case inputs, or exponential/backtracking search with strong pruning',
      'Reductions are also a design tool outside complexity theory: solving A "for free" by transforming it into a shape an existing library or algorithm already solves',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The practical skill here is pattern recognition, not the formal proof machinery. Given a new problem, the question worth asking early is: does this look like a disguised version of a problem already known to be NP-complete? Scheduling with resource constraints often hides Bin Packing or Knapsack; "assign X to Y such that no conflicts" problems often hide Graph Coloring; anything with a "visit every node/take every item exactly once, minimize cost" shape often hides TSP. Recognizing the shape early prevents sinking weeks into an exact polynomial algorithm that (almost certainly) does not exist.',
      },
      {
        kind: 'code',
        title: 'A reduction in practice: Vertex Cover via a SAT-style encoding sketch',
        code: '// "Does this graph have a vertex cover of size <= k?" reduces cleanly to\n// "is this boolean formula satisfiable?" — one boolean variable per (vertex, position in cover),\n// clauses encoding "every edge has at least one endpoint chosen" and "exactly k vertices chosen".\n// A generic SAT solver then solves Vertex Cover for free — at the cost of exponential\n// worst-case time inherited from SAT itself; the reduction proves equivalence, not tractability.\nboolean hasVertexCoverOfSize(Graph g, int k) {\n    CnfFormula formula = encodeVertexCoverAsSat(g, k);\n    return satSolver.isSatisfiable(formula);\n}',
        caption: 'The reduction is the useful, reusable idea — the exponential cost is what it proves is (probably) unavoidable',
      },
      {
        kind: 'table',
        caption: 'When exact is out of reach',
        headers: ['Strategy', 'Guarantee', 'Example'],
        rows: [
          ['Approximation algorithm', 'provably within a factor of optimal', '2-approximation for Vertex Cover'],
          ['Heuristic', 'none — empirically good', 'nearest-neighbor for TSP'],
          ['Exponential search with pruning', 'exact, but possibly slow', '[[backtracking]] for small instances'],
          ['Restrict the input', 'exact and fast, narrower problem', 'TSP on a tree, 2-SAT instead of general SAT'],
        ],
      },
      {
        kind: 'pitfall',
        title: '"NP-complete" does not mean "unsolvable" — it means "no known polynomial exact algorithm"',
        text: 'NP-complete problems are solved every day in practice — SAT solvers, integer programming solvers, and scheduling tools all tackle NP-complete problems routinely on real (non-adversarial) inputs, often exactly. The classification is about worst-case guarantees, not about whether an instance in front of you is tractable. Don\'t treat "NP-complete" as a reason to give up before trying a solver, a good heuristic, or exploiting structure specific to your instances.',
      },
      {
        kind: 'note',
        title: 'P vs. NP, restated for engineers',
        text: 'P is "solvable in polynomial time." NP is "a proposed solution can be *checked* in polynomial time" (even if finding one might take exponential time). Whether P = NP is the most famous open problem in computer science; nearly all working computer scientists believe P ≠ NP, meaning some problems are fundamentally harder to solve than to verify. See [[complexity-classes]] for the full picture and where reductions fit into proving a problem\'s place in that landscape.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 6.4 — Intractability' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.5 — NP-Completeness' },
      { book: 'crushing-tech-interview', chapter: 'Ch. Complexity and Hard Problems' },
    ],
    related: ['complexity-classes', 'backtracking', 'greedy-algorithms', 'analyzing-algorithms'],
  },
]
