import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'divide-and-conquer',
    domainId: 'algorithm-design',
    title: 'Divide & Conquer',
    summary:
      'Split a problem into independent subproblems of the same shape, solve each recursively, then combine the results. The recursion tree — not the code — is where the runtime comes from ([[recursion-and-recurrences]]).',
    keyPoints: [
      {
        text: 'Three steps: divide (split the input), conquer (recurse on each piece), combine (merge the sub-results)',
        detail: 'Every divide-and-conquer algorithm is a variation on this same three-step template — what differs between mergesort, quicksort, and closest-pair is only how each step is implemented, not whether all three are present. Recognizing the template is what lets you predict an unfamiliar algorithm\'s structure before reading its code.',
      },
      {
        text: 'Correctness comes from induction: if the recursive calls solve their smaller inputs correctly, and combine is correct, the whole is correct',
        detail: 'This is literally a proof by strong induction wearing algorithm clothes: the base case is the smallest input, the inductive hypothesis is "the recursive calls correctly solve their smaller pieces," and the inductive step is showing combine produces a correct answer *given* that hypothesis — you never need to reason about the whole recursion tree at once.',
      },
      {
        text: 'The classic win is turning an O(n²) combine-everything approach into O(n log n) by keeping subproblems independent',
        detail: 'The `log n` factor comes directly from the recursion depth needed to shrink the input down to constant size by repeated halving, and the win only materializes when the combine step at each level costs no more than linear — a cheap combine repeated `log n` times across the tree is what produces the `n log n` total instead of `n²`.',
      },
      {
        text: 'Mergesort, quicksort, binary search, and the Master Theorem\'s canonical form T(n) = aT(n/b) + f(n) are all divide-and-conquer',
        detail: 'These four differ mainly in the (a, b, f(n)) values plugged into the same recurrence shape: mergesort splits into 2 halves with a linear merge, quicksort splits into (typically) 2 unequal parts with a linear partition, and binary search discards half with essentially free combine work — all fit the same T(n) = aT(n/b) + f(n) template that the Master Theorem solves directly.',
      },
      {
        text: 'Not free: it only pays off when subproblems are truly independent — overlapping subproblems belong to [[dynamic-programming]] instead',
        detail: 'Applying divide-and-conquer to a problem whose subproblems actually overlap (naive recursive Fibonacci, say) just recomputes the same overlapping work down every branch of the recursion tree — the technique itself does not detect or prevent that waste, which is exactly why dynamic programming exists as a distinct paradigm for that case.',
      },
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
        detail: 'The top level of the recursion tree processes the full input size, so an O(n²) combine there alone already costs as much as the entire naive algorithm — every level below it only adds more cost on top. Recursion by itself does not confer speed; it is a structure that speed depends entirely on the combine step actually exploiting.',
      },
      {
        kind: 'note',
        title: 'D&C vs. dynamic programming: the one question that tells them apart',
        text: 'Ask: do the subproblems overlap? If splitting the input produces genuinely disjoint pieces that never need to be recombined or looked up again (mergesort\'s two halves never share elements), it\'s divide-and-conquer — recurse freely, no need to cache. If the same subproblem gets solved repeatedly from different call paths (Fibonacci, edit distance), it\'s [[dynamic-programming]] — cache or you pay exponential cost re-deriving the same answer.',
        detail: 'This single question cleanly separates the two paradigms because it determines whether caching helps at all: caching a subproblem result that is never looked up again (true D&C) is pure wasted memory, while skipping the cache when subproblems genuinely recur (true DP) means re-deriving the same answer an exponential number of times.',
      },
      {
        kind: 'bestPractice',
        title: 'Prove the base case and the inductive step separately',
        text: 'Treat a divide-and-conquer algorithm like a proof by induction, because that is what it is. State the base case (smallest legal input) and confirm it\'s handled directly. Then state the inductive hypothesis — "assume the recursive calls correctly solve their smaller inputs" — and verify only that the combine step is correct given that assumption ([[correctness-and-invariants]]). Most off-by-one bugs in recursive code come from skipping this and reasoning about the whole recursion at once.',
        detail: 'Trying to trace an entire recursion tree by hand to verify correctness does not scale past the smallest examples and is exactly where reasoning errors hide — the inductive approach lets you verify correctness by checking only two small, local things (the base case, and one combine step assuming its inputs are already correct) rather than an exponentially large tree of calls.',
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
      {
        text: 'A greedy algorithm builds a solution incrementally, committing to the best-looking choice at each step and never backtracking',
        detail: 'The "never backtracking" part is what makes greedy algorithms fast — no exploring alternatives, no undoing a choice once made — but it is also exactly what makes them risky: a choice that looks best right now can foreclose a better overall solution later, with no mechanism to notice or correct for it.',
      },
      {
        text: 'Correctness requires proof — usually via the "exchange argument": any optimal solution can be transformed into the greedy one without getting worse',
        detail: 'The exchange argument works by taking any hypothetical optimal solution, finding the first place it disagrees with the greedy choice, and showing you can swap in the greedy choice without making the solution worse — repeating this eventually transforms the optimal solution into the greedy one, proving the greedy one is at least as good.',
      },
      {
        text: 'Two structural properties that make greedy work: the *greedy-choice property* (a locally optimal choice is part of some global optimum) and *optimal substructure*',
        detail: 'Both properties are required together: optimal substructure alone is shared with dynamic programming and just means an optimal solution is built from optimal solutions to subproblems, while the greedy-choice property is the extra, much stronger guarantee that the *locally* best choice specifically is always safe to commit to immediately, without exploring alternatives.',
      },
      {
        text: 'Classic correct greedy algorithms: Dijkstra\'s [[shortest-paths]], Prim\'s and Kruskal\'s [[minimum-spanning-trees]], Huffman coding, activity/interval scheduling',
        detail: 'Each of these has a published exchange-argument or matroid-based proof backing its correctness — they are not "greedy happens to work here by luck," they are problems whose structure has been formally shown to satisfy the greedy-choice property, which is exactly the kind of verification any new greedy algorithm needs before being trusted.',
      },
      {
        text: 'When greedy is wrong, it fails silently — it produces *a* valid answer, just not the optimal one; always verify with a counterexample or a proof, never by intuition alone',
        detail: 'This silent-failure mode is what makes greedy uniquely dangerous among algorithm design paradigms: a wrong greedy algorithm still runs, still terminates, and still returns something that looks like a reasonable answer, so there is no crash or obvious symptom pointing at the bug — only a systematically suboptimal result that testing against small examples may never happen to expose.',
      },
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
        detail: 'Fractions let the greedy choice always be adjustable at the margin — if the best-ratio item doesn\'t fit exactly, take a fraction of it and use the capacity perfectly. Whole-items-only removes that flexibility entirely: an item either fits or it does not, so the "waste" from a locally optimal choice can no longer be trimmed away, and that waste is precisely what breaks the exchange argument that made the fractional version correct.',
      },
      {
        kind: 'note',
        title: 'The exchange argument, in one sentence',
        text: 'To prove a greedy algorithm correct, take any optimal solution that differs from the greedy one, find the first point where they diverge, and show you can swap the optimal solution\'s choice for the greedy choice without making the solution worse — repeat until the two solutions are identical. If that swap is always safe, greedy loses nothing by committing early, which is exactly what makes it correct.',
        detail: 'The "repeat until identical" part is what makes this a complete proof rather than a one-off observation: each successful swap makes the optimal solution one step more similar to the greedy one without decreasing its quality, and since there are only finitely many divergence points, this process terminates with the greedy solution proven at least as good as any optimal one.',
      },
      {
        kind: 'bestPractice',
        title: 'Look for a matroid before trusting your greedy instinct',
        text: 'Problems whose valid solutions form a matroid (a set system with an exchange property) are exactly the problems where greedy is guaranteed correct — MST and scheduling problems are matroids in disguise. You don\'t need the formal theory to use this as a sanity check: if you can\'t articulate why the locally best choice can never be undone by a better global arrangement, don\'t trust the greedy approach without testing it against small brute-forced examples first.',
        detail: 'Matroid theory is the general mathematical explanation for why the same "sort and take greedily" pattern works correctly across MST, scheduling, and several other seemingly unrelated problems — recognizing the matroid structure (even informally) is a much stronger correctness signal than the greedy algorithm simply "seeming to work" on the examples you happened to try.',
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
      {
        text: 'Two required ingredients: overlapping subproblems (the same subproblem is reached via different call paths) and optimal substructure (an optimal solution is built from optimal solutions to subproblems)',
        detail: 'Both are necessary, and each rules out a different alternative: optimal substructure without overlapping subproblems is just divide-and-conquer (no benefit from caching), and overlapping subproblems without optimal substructure means memoizing wrong intermediate answers, since the optimal overall solution would not actually be composed from optimal subproblem solutions.',
      },
      {
        text: 'Two equivalent implementation styles: top-down memoization (recursion + cache) and bottom-up tabulation (iterate subproblems in dependency order)',
        detail: 'Both compute exactly the same answers from the exact same recurrence — the difference is purely mechanical: memoization lets the recursion naturally discover which subproblems are needed (computing only those), while tabulation commits upfront to computing every subproblem up to the target in a fixed order, trading that guaranteed extra work for no recursion overhead and no stack risk.',
      },
      {
        text: 'The recipe: define the state precisely, write the recurrence relating a state to smaller states, pick a base case, choose an evaluation order',
        detail: 'This ordering matters: the state definition has to come first because the recurrence, base case, and evaluation order are all *about* the state — you cannot write a correct recurrence relating states you have not yet precisely defined, which is exactly why "state design is the whole problem" for DP in practice.',
      },
      {
        text: 'Space is frequently reducible: if the recurrence only looks back a fixed number of rows/states, keep only those instead of the full table',
        detail: 'A recurrence that only ever references the immediately previous row of a table (like many 1D-window DPs) never needs the rows before that once they have been used — keeping the full table is then pure waste, and rolling it down to just the needed window turns O(n²) space into O(n) or less, with zero change to the actual values computed.',
      },
      {
        text: 'A DP recurrence you can\'t state in one sentence usually means the state definition is wrong — fix the state before optimizing the code',
        detail: 'If the recurrence needs multiple caveats and special cases to express, that complexity is almost always a symptom that the state is missing a dimension — as with knapsack needing (item, remaining capacity) rather than just (item) — and no amount of code cleverness fixes a recurrence built on an incomplete state; only redefining the state does.',
      },
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
        detail: 'A cache only changes *how many times* an answer is computed, never *what* that answer is — if the underlying recurrence itself is subtly wrong (missing a case, wrong base case), memoization faithfully reproduces that wrong answer instantly instead of eventually, which is a genuinely worse debugging experience since a fast wrong answer looks more trustworthy than a slow one.',
      },
      {
        kind: 'note',
        title: 'State design is the whole problem',
        text: 'Once the state is right, the recurrence and code are usually mechanical. The hard, non-mechanical step is deciding *what a state is* — e.g. for LCS, the state is "the LCS of a\'s suffix from i and b\'s suffix from j", not just "position i". For knapsack, the state is (item index, remaining capacity) — dropping the capacity dimension collapses distinct subproblems into one and produces a wrong recurrence. When a DP is hard to write, the fix is almost always to reconsider the state, not the code.',
        detail: 'Collapsing "item index, remaining capacity" down to just "item index" merges what should be many distinct subproblems (the same item index at different remaining capacities) into one shared cache entry — the cache then returns the wrong answer for at least some of those merged cases, because a single cached value cannot simultaneously be correct for multiple genuinely different situations.',
      },
      {
        kind: 'bestPractice',
        title: 'Reduce dimensions only after correctness, not before',
        text: 'Space-optimizing a DP (e.g. keeping only the previous row of a 2D table) is a valuable but purely mechanical last step. Do it after the full-table version is verified correct — rolling the array too early makes debugging much harder, since you lose the ability to print the whole table and visually spot-check it against a brute-force solution.',
        detail: 'The full table is a debugging tool as much as it is a data structure: being able to print it and visually confirm the values match hand-computed expectations is often the fastest way to catch a wrong recurrence, and that diagnostic capability disappears the moment the table is rolled down to only the rows currently needed.',
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
      {
        text: 'The shape: choose a candidate for the next slot, recurse, undo the choice on return — the "undo" step is what distinguishes backtracking from plain recursive enumeration',
        detail: 'Without the undo step, mutations made while exploring one branch would leak into every sibling branch explored afterward, since they all share the same mutable state — the undo is what makes it safe to try candidate after candidate at the same recursion level using in-place mutation instead of copying state for each attempt.',
      },
      {
        text: 'Pruning ("is this partial solution still viable?") is what separates a backtracking algorithm that finishes in milliseconds from one that never terminates',
        detail: '"Never terminates" is not quite literal — it eventually finishes, just after exploring the full exponential search space — but pruning is what makes the practical difference between an algorithm that returns instantly and one that is computationally infeasible, by discarding entire subtrees the moment a partial solution is provably doomed rather than discovering that after fully expanding them.',
      },
      {
        text: 'Classic applications: N-Queens, Sudoku, generating permutations/subsets/combinations, graph coloring, constraint satisfaction',
        detail: 'All of these share the same underlying shape — build a solution one piece at a time, and reject a partial solution as soon as it violates a constraint — which is precisely why the same backtracking template (choose, recurse, undo, with a pruning check) solves every one of them with only the constraint-checking logic changing between problems.',
      },
      {
        text: 'Worst-case complexity is exponential — backtracking makes an exponential problem *practical*, not polynomial',
        detail: 'Pruning changes the *typical* running time dramatically by avoiding huge swaths of the search space in common cases, but it does not change the worst-case bound — an adversarially constructed instance can still force exploration of most of the exponential space, which is why backtracking is a practical engineering tool for exponential problems, not a way to make them polynomial.',
      },
      {
        text: 'Distinct from plain recursion in that state is mutated in place and explicitly reverted, which keeps memory usage to the recursion depth instead of copying state at every call',
        detail: 'A version that copies the partial solution at every recursive call instead of mutating and undoing it uses memory proportional to the size of the copy times the number of calls, while the mutate-and-undo approach uses memory proportional only to the recursion depth — a meaningful difference when the partial solution itself is large (a full board, a long permutation).',
      },
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
        detail: 'The bug is hard to spot precisely because the mutated state looks locally reasonable at the point of the missing undo — the corruption only becomes visible several calls later, when a sibling branch incorrectly treats a column or cell as occupied (or free) based on a choice that should have already been reverted, making the actual cause far removed from the symptom.',
      },
      {
        kind: 'note',
        title: 'Backtracking vs. exhaustive recursion',
        text: 'Exhaustive recursive enumeration (e.g. generating every subset of a set) explores the full 2ⁿ space unconditionally. Backtracking adds a viability check before recursing further — a partial Sudoku assignment that already breaks a row constraint is abandoned immediately, without ever generating the (huge) subtree beneath it. The pruning check is the entire reason backtracking is fast in practice despite the same theoretical exponential worst case; see [[backtracking-templates]] for the reusable code shape.',
        detail: 'The subtree avoided by one early pruning decision can itself be exponentially large — abandoning a single invalid partial Sudoku assignment at depth *k* skips every possible completion of the remaining cells, which is why a small number of well-placed pruning checks near the root of the search can eliminate the vast majority of the total search space.',
      },
      {
        kind: 'bestPractice',
        title: 'Prune as early as possible, not just at the leaves',
        text: 'The value of a backtracking algorithm is proportional to how early it can discard a doomed branch. Checking constraints only once a full candidate is assembled (e.g. building an entire N-Queens placement, then checking if any queens attack each other) reduces to exhaustive search with extra steps. Push the validity check to the earliest point where enough information exists to make the call — as in the N-Queens example, checked one placement at a time as each queen is added.',
        detail: 'Checking only at the leaves means every doomed branch is still fully explored down to the bottom before being rejected — you pay the full exponential cost of generating every candidate and get none of pruning\'s benefit, since the check happens too late to skip any work. Moving the same check to the earliest point it can fire is a purely mechanical change with a potentially exponential speedup.',
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
      {
        text: 'Naive matching re-checks characters after every mismatch — O(nm) worst case, quadratic on adversarial or repetitive input',
        detail: 'The quadratic blowup comes from throwing away all the information a partial match revealed the moment a mismatch occurs — sliding the pattern forward one position and starting the comparison completely over means every one of the up-to-m previously matched characters might get re-examined at the next position too, for every one of the n starting positions.',
      },
      {
        text: 'Knuth-Morris-Pratt (KMP) precomputes a "failure function" over the pattern so a mismatch never re-examines text already matched — O(n + m)',
        detail: 'The failure function encodes exactly how far the pattern can safely "slide" after a mismatch based purely on the pattern\'s own internal repeated structure, without needing to look at the text again — this is what lets KMP guarantee each text character is examined a small constant number of times total, rather than being revisited from scratch at every candidate position.',
      },
      {
        text: 'Rabin-Karp hashes substrings of the text using a rolling hash and compares hashes instead of characters — expected O(n + m), with O(nm) if hash collisions are adversarial',
        detail: 'The rolling hash is what makes this fast: computing each window\'s hash incrementally from the previous window\'s hash costs O(1) per position instead of O(m) to hash the whole window from scratch, so a full pass over the text costs O(n). The O(nm) fallback only occurs if the hash function collides badly enough that most positions need an expensive character-by-character verification anyway.',
      },
      {
        text: 'A [[tries]] or suffix-structure approach amortizes cost across many pattern searches against the same text — build once, query many patterns fast',
        detail: 'KMP and Rabin-Karp are both optimized for a single pattern against a text scanned once; when the same text will be searched repeatedly for many different patterns, building an index of the text (or the pattern set, as in Aho-Corasick) upfront lets each subsequent query run much faster than re-scanning the text from scratch every time, paying the index-building cost once instead of per query.',
      },
      {
        text: 'Choice depends on the workload: one pattern vs. many patterns vs. many texts changes which algorithm actually wins',
        detail: 'There is no universally "best" string-matching algorithm — KMP\'s guaranteed linear time wins when you need a hard worst-case bound for one pattern, Rabin-Karp\'s hashing wins when checking many equal-length patterns at once, and an index-building approach wins only when the same text is queried enough times to amortize the index cost.',
      },
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
        detail: 'A naive re-hash-every-window implementation is a common mistake precisely because it produces correct answers — it just silently loses the entire asymptotic advantage that was the whole point of choosing Rabin-Karp, since paying O(m) per window for n windows is exactly the same O(nm) the naive scan already had.',
      },
      {
        kind: 'note',
        title: 'This is what regex engines and `String.indexOf` build on',
        text: 'Java\'s `String.indexOf` uses (a variant of) naive/Boyer-Moore-style scanning internally, which is fine for typical short patterns against short texts. When matching many patterns repeatedly, or against very large texts, a hand-rolled KMP, Rabin-Karp, or Aho-Corasick pass is a legitimate and common optimization — this is the same territory covered by regex engines, which compile a pattern once and reuse the compiled form for exactly this reason.',
        detail: 'Regex engines compiling a pattern once and reusing that compiled form across many `matcher()` calls is the same underlying idea as building an index once and querying it many times — both amortize a fixed upfront cost across repeated use, which is why regex matching against the same pattern repeatedly is much cheaper than recompiling the pattern for every single match attempt.',
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
      {
        text: 'A reduces to B means: given a solver for B, you can solve A with only polynomial extra work — B is "at least as hard" as A',
        detail: 'The direction of the reduction matters and is easy to get backward: it says solving B is at least as powerful as solving A, so B is at least as hard, not the reverse. This is precisely how a fast algorithm for B would automatically give you a fast algorithm for A, but not necessarily the other way around.',
      },
      {
        text: 'Proving a new problem NP-complete: show it\'s in NP (a solution can be verified in polynomial time), then reduce a known NP-complete problem to it',
        detail: 'Both halves are required for the standard proof recipe: showing membership in NP establishes the problem is not *harder* than NP, while reducing a known NP-complete problem *to* it establishes the problem is not *easier* than the hardest problems already known — together they pin the new problem down as NP-complete.',
      },
      {
        text: 'Recognizing your problem resembles Traveling Salesman, Knapsack, SAT, Vertex Cover, or Graph Coloring is a strong signal that no polynomial exact algorithm is likely to exist ([[complexity-classes]])',
        detail: 'This is pattern-matching against a small, well-known catalog of "hardness fingerprints" — a scheduling problem with resource conflicts, an assignment problem with pairwise constraints, or a "visit everything once, minimize cost" shape are recognizable silhouettes of already-classified NP-complete problems, and recognizing the silhouette is far cheaper than formally proving a new reduction every time.',
      },
      {
        text: 'Practical response to intractability: approximation algorithms (provably close to optimal), heuristics (no guarantee, works well in practice), restricting to special-case inputs, or exponential/backtracking search with strong pruning',
        detail: 'Each option trades away a different guarantee: approximation keeps a provable quality bound but gives up exactness, heuristics give up any guarantee at all in exchange for good typical-case behavior, restricting the input gives up generality to regain both exactness and speed, and backtracking keeps exactness at the cost of a worst-case exponential (but often practically tolerable) running time.',
      },
      {
        text: 'Reductions are also a design tool outside complexity theory: solving A "for free" by transforming it into a shape an existing library or algorithm already solves',
        detail: 'This is the constructive flip side of the same technique used to prove hardness — instead of reducing a known-hard problem *to* yours (to prove intractability), you reduce *your* problem to one an existing well-tested solver already handles, getting a correct implementation without writing the underlying algorithm yourself.',
      },
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
        detail: 'The classification describes the theoretical worst case over *all* possible inputs, while real-world instances are rarely adversarially constructed to hit that worst case — modern SAT and ILP solvers exploit exactly this gap, using heuristics and pruning that perform excellently on the structured, non-adversarial instances that actually show up in practice, even though no such technique changes the worst-case classification itself.',
      },
      {
        kind: 'note',
        title: 'P vs. NP, restated for engineers',
        text: 'P is "solvable in polynomial time." NP is "a proposed solution can be *checked* in polynomial time" (even if finding one might take exponential time). Whether P = NP is the most famous open problem in computer science; nearly all working computer scientists believe P ≠ NP, meaning some problems are fundamentally harder to solve than to verify. See [[complexity-classes]] for the full picture and where reductions fit into proving a problem\'s place in that landscape.',
        detail: 'Reductions are the connective tissue of this entire landscape: they are the mechanism by which "problem X is at least as hard as problem Y" gets established rigorously, which is how thousands of disparate-looking problems have all been shown to belong to the same NP-complete equivalence class despite having no surface resemblance to each other.',
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
