import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'two-pointers-and-sliding-window',
    domainId: 'interview-patterns',
    title: 'Two Pointers & Sliding Window',
    summary:
      'Two indices walking across an array or string — from opposite ends, or as a window that grows and shrinks — turn a large class of O(n²) brute-force scans into O(n).',
    keyPoints: [
      'Opposite-direction pointers on **sorted** data: two-sum on a sorted array, container-with-most-water',
      'Same-direction pointers as a **sliding window**: longest substring without repeating characters, smallest subarray with a given sum',
      'The window expands to explore and shrinks to restore a violated invariant — it never restarts from scratch, which is exactly what makes it O(n) instead of O(n²)',
      'Recognize the shape: "contiguous subarray/substring satisfying some condition" is the sliding-window tell',
      'Opposite-end two pointers usually require sorted input first — sorting costs O(n log n), which then dominates the two-pointer O(n) scan',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Longest substring without repeating characters',
        code: 'static int lengthOfLongestSubstring(String s) {\n    Map<Character, Integer> lastSeen = new HashMap<>();\n    int longest = 0, windowStart = 0;\n    for (int i = 0; i < s.length(); i++) {\n        char c = s.charAt(i);\n        if (lastSeen.containsKey(c) && lastSeen.get(c) >= windowStart) {\n            windowStart = lastSeen.get(c) + 1;   // jump the window start past the duplicate\n        }\n        lastSeen.put(c, i);\n        longest = Math.max(longest, i - windowStart + 1);\n    }\n    return longest;\n}',
      },
      {
        kind: 'table',
        caption: 'Two-pointer variants',
        headers: ['Shape', 'Pointer movement', 'Example'],
        rows: [
          ['Opposite ends', 'lo++ or hi-- based on a comparison', 'two-sum on sorted array, container with most water'],
          ['Fixed-size window', 'both ends move together, one step at a time', 'max sum of every k-length subarray'],
          ['Variable-size window', 'right expands, left catches up when invalid', 'longest substring without repeats, minimum window substring'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Forgetting to actually shrink the window',
        text: 'A common bug: the window\'s right edge advances correctly, but the code checks the invariant without a `while` loop to shrink from the left as far as needed — using `if` instead of `while` only shrinks by one step, leaving the window invalid when the violation requires shrinking multiple times in a row.',
      },
      {
        kind: 'note',
        text: 'Two pointers and sliding window both lean on the same data structures as [[arrays-and-linked-lists]] and often pair with a `HashMap`/`HashSet` for O(1) membership checks inside the window — see [[hash-tables]]. The fast/slow variant of two pointers, used for cycle detection rather than windowing, is its own pattern: [[fast-slow-pointers]].',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Two Pointers, Sliding Window' },
      { book: 'algorithms-notes', chapter: 'Sliding Window Algorithm' },
    ],
    related: ['arrays-and-linked-lists', 'fast-slow-pointers', 'hash-tables'],
  },

  {
    id: 'fast-slow-pointers',
    domainId: 'interview-patterns',
    title: 'Fast & Slow Pointers',
    summary:
      'Floyd\'s tortoise-and-hare: two pointers advancing through a sequence at different speeds detect cycles and locate midpoints in O(n) time and O(1) space — no extra memory required.',
    keyPoints: [
      'Classic use: detecting a cycle in a linked list — if a cycle exists, the fast pointer (2 steps) always laps the slow one (1 step)',
      'Finding the middle of a list in a single pass: when fast reaches the end, slow is at the midpoint',
      'Finding the cycle **start**: after they meet, reset one pointer to the head and advance both one step at a time — they meet again exactly at the cycle\'s start (a consequence of the arithmetic, not a coincidence)',
      'O(1) space beats the alternative of storing every visited node in a `HashSet` to detect a repeat',
      'Generalizes to any "functional graph" (each node has exactly one outgoing edge) — e.g. detecting a cycle in repeatedly applying a function, like the "happy number" problem',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Linked-list cycle detection',
        code: 'static boolean hasCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) return true;\n    }\n    return false;\n}',
      },
      {
        kind: 'note',
        title: 'Why resetting one pointer finds the cycle start',
        text: 'Let the distance from the head to the cycle start be `a`, and the meeting point be `b` steps into the cycle. When slow and fast first meet, slow has traveled `a + b`, and fast has traveled twice that, `2(a + b)`; fast has also gone around the cycle (length `c`) some number of extra times, so `2(a + b) - (a + b) = a + b = kc` for some integer k. That means walking `a` more steps from the meeting point reaches the same place as walking `a` steps from the head — hence resetting one pointer to head and advancing both one step at a time makes them meet exactly at the cycle\'s start.',
      },
      {
        kind: 'table',
        caption: 'Fast/slow pointers vs a hash set',
        headers: ['Approach', 'Time', 'Space'],
        rows: [
          ['Fast/slow pointers', 'O(n)', 'O(1)'],
          ['HashSet of visited nodes', 'O(n)', 'O(n)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Null-check both hops of the fast pointer',
        text: '`fast = fast.next.next` needs `fast != null && fast.next != null` checked *before* advancing, not just `fast != null` — skipping the `fast.next` check throws a `NullPointerException` on lists of even length where the fast pointer lands exactly on the last node.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Fast & Slow Pointers' },
      { book: 'dsa-myers', chapter: 'Linked Lists' },
    ],
    related: ['arrays-and-linked-lists', 'two-pointers-and-sliding-window'],
  },

  {
    id: 'binary-search-on-answer',
    domainId: 'interview-patterns',
    title: 'Binary Search on the Answer',
    summary:
      'When there\'s no array to search but the space of possible answers is monotonic — every value below some threshold fails, every value at or above it works — binary search over the answer itself instead of an index.',
    keyPoints: [
      'Applies whenever a yes/no predicate over a range of values is **monotonic**: false, false, …, false, true, true, …, true',
      'Classic shapes: "minimum capacity to ship packages in D days," "Koko eating bananas," "minimize the maximum of k subarray sums"',
      'The search space is the answer\'s value range, not array indices — bounds come from the problem (e.g. max single element to total sum), not `0` to `n-1`',
      'Each feasibility check typically costs O(n) on its own, so total cost is O(n · log(range)), not O(log n)',
      'The hard part is recognizing the monotonicity, not writing the binary search — the [[binary-search-and-variants|binary search]] shell itself is boilerplate once that\'s spotted',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Minimum shipping capacity to deliver in D days',
        code: 'static int shipWithinDays(int[] weights, int days) {\n    int lo = Arrays.stream(weights).max().getAsInt();   // must fit the heaviest single package\n    int hi = Arrays.stream(weights).sum();               // one day, ship everything\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (feasible(weights, mid, days)) hi = mid;      // mid works — try smaller\n        else lo = mid + 1;                                // mid too small — need more capacity\n    }\n    return lo;\n}\n\nstatic boolean feasible(int[] weights, int capacity, int days) {\n    int daysNeeded = 1, currentLoad = 0;\n    for (int w : weights) {\n        if (currentLoad + w > capacity) { daysNeeded++; currentLoad = 0; }\n        currentLoad += w;\n    }\n    return daysNeeded <= days;\n}',
      },
      {
        kind: 'note',
        title: 'Spotting the monotonicity',
        text: 'The tell is a "minimize the maximum" or "maximize the minimum" phrasing: if capacity C works (fits within D days), then any capacity larger than C also works — feasibility never flips back to false as the answer value increases. That one-directional flip is exactly what binary search requires; without it (e.g. if larger values could become infeasible again), binary search on the answer gives a wrong result silently.',
      },
      {
        kind: 'pitfall',
        title: 'Bounds that are too tight cut off the true optimum',
        text: 'Setting `lo`/`hi` from an intuition about "reasonable" values, rather than provably-necessary extremes (the true minimum and maximum the answer could ever be), risks binary-searching a range that excludes the correct answer entirely — the search converges cleanly and confidently returns a wrong number.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Binary Search' },
    ],
    related: ['binary-search-and-variants', 'greedy-algorithms'],
  },

  {
    id: 'heap-top-k-pattern',
    domainId: 'interview-patterns',
    title: 'The Top-K Heap Pattern',
    summary:
      'Keeping a heap of size k instead of sorting the entire input turns "find the k largest/smallest" into O(n log k) — a real win whenever k is much smaller than n, and the only option when the data is a stream.',
    keyPoints: [
      'For the **k largest** elements, keep a **min-heap** of size k — counterintuitive, but it lets you discard the current smallest of the k candidates in O(log k) whenever a bigger element arrives',
      'For the **k smallest**, invert it: a **max-heap** of size k',
      'Java\'s `PriorityQueue` is the natural container — `offer` to add, `poll` the root to evict when size exceeds k',
      'Works on streaming data you can\'t fully hold in memory or sort — the heap only ever holds k elements',
      '"Merge k sorted lists" is the same pattern in disguise: a heap of k pointers, always popping the smallest and advancing that pointer',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'K largest elements with a min-heap',
        code: 'static int[] kLargest(int[] nums, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // natural order = min-heap\n    for (int n : nums) {\n        minHeap.offer(n);\n        if (minHeap.size() > k) minHeap.poll();               // evict the current smallest of the k\n    }\n    int[] result = new int[k];\n    for (int i = k - 1; i >= 0; i--) result[i] = minHeap.poll();\n    return result;\n}',
      },
      {
        kind: 'table',
        caption: 'Top-k: heap vs alternatives',
        headers: ['Approach', 'Time', 'Space', 'Works on a stream'],
        rows: [
          ['Sort everything', 'O(n log n)', 'O(n) or O(1) in-place', 'no'],
          ['Size-k heap', 'O(n log k)', 'O(k)', 'yes'],
          ['Quickselect ([[order-statistics-selection]])', 'O(n) expected', 'O(1) extra', 'no — needs full random access'],
        ],
      },
      {
        kind: 'note',
        title: 'Merging k sorted lists is the same pattern',
        text: 'Seed a min-heap with the first element of each of the k lists (tagged with which list it came from). Repeatedly pop the smallest, append it to the output, and push the next element from that same list. The heap never holds more than k elements at once — exactly the top-k shape, just applied to "the next candidate from each source" instead of "the next candidate overall."',
      },
      {
        kind: 'pitfall',
        title: 'Using the wrong heap type defeats the point',
        text: 'Using a max-heap to track the k *largest* elements means the heap keeps growing to hold everything (you\'d only know what to evict by looking at the *smallest* tracked value, which a max-heap can\'t report in O(log k)) — the min-heap-for-largest inversion is the entire trick, not an arbitrary detail.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Top K Elements' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.4 — Priority Queues' },
    ],
    related: ['heaps-and-priority-queues', 'order-statistics-selection'],
  },

  {
    id: 'union-find-applications',
    domainId: 'interview-patterns',
    title: 'Union-Find Applications',
    summary:
      'Beyond powering Kruskal\'s MST, union-find is the go-to structure for any "are these two things connected" question that arrives as a stream of incremental unions rather than a fixed graph to traverse once.',
    keyPoints: [
      'Number of connected components / number of islands: map grid cells to graph nodes, union adjacent land cells, count remaining roots',
      'Cycle detection while building a graph edge-by-edge: a union that fails (both endpoints already share a root) means the new edge closes a cycle',
      '"Accounts merge" / equivalence-class problems: union whenever two items are declared equivalent, then group by final root',
      'With **path compression** and **union by rank/size**, both `find` and `union` run in amortized nearly-O(1) time — technically O(α(n)), the inverse Ackermann function, for all practical n indistinguishable from a constant — see [[amortized-analysis]]',
      'Beats repeated BFS/DFS whenever queries ("are u and v connected *right now*?") are interleaved with edge additions, since re-running a full traversal after every edge would be far more expensive',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Union-Find with path compression and union by rank',
        code: 'class UnionFind {\n    private final int[] parent, rank;\n\n    UnionFind(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression\n        return parent[x];\n    }\n\n    boolean union(int x, int y) {\n        int rx = find(x), ry = find(y);\n        if (rx == ry) return false;                          // already connected — would form a cycle\n        if (rank[rx] < rank[ry]) { int t = rx; rx = ry; ry = t; }\n        parent[ry] = rx;\n        if (rank[rx] == rank[ry]) rank[rx]++;\n        return true;\n    }\n}',
      },
      {
        kind: 'note',
        title: 'Why "nearly O(1)" without a full proof',
        text: 'Path compression flattens every node on the path to point directly at the root the first time `find` is called on it, so future lookups are instant. Union by rank keeps the tree shallow by always attaching the smaller tree under the larger one\'s root. Together they bound the amortized cost per operation by the inverse Ackermann function α(n) — a function that grows so slowly it\'s under 5 for any n that could ever be represented in memory, which is why practitioners simply call it "constant."',
      },
      {
        kind: 'pitfall',
        title: 'Skipping path compression turns find into O(n)',
        text: 'Without path compression, repeated unions can build a long chain (a "linked list" masquerading as a tree), and `find` degenerates to walking the whole chain — O(n) per call instead of near-O(1). Union by rank alone bounds the tree height to O(log n), which is fine but strictly worse than the two techniques combined.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.5 — Union-Find' },
      { book: 'crushing-tech-interview', chapter: 'Union Find' },
    ],
    related: ['disjoint-sets-union-find', 'minimum-spanning-trees', 'amortized-analysis'],
  },

  {
    id: 'bit-manipulation-tricks',
    domainId: 'interview-patterns',
    title: 'Bit Manipulation Tricks',
    summary:
      'A small toolkit of bitwise idioms — clearing the lowest set bit, XOR cancellation, bitmasking subsets — answers a surprising number of interview problems in O(1) extra space and a handful of instructions.',
    keyPoints: [
      '`n & (n - 1)` clears the lowest set bit — powers-of-two check (`n > 0 && (n & (n-1)) == 0`), and the basis of Brian Kernighan\'s bit-count algorithm',
      'XOR cancels a value with itself (`x ^ x == 0`) and is identity with zero (`x ^ 0 == x`) — the trick behind "find the single number among duplicates"',
      'A bitmask represents a subset of a small set (n ≤ ~20): bit i set means element i is included — the basis of bitmask dynamic programming',
      'Left shift `<<` and right shift `>>` are multiply/divide by 2, but `>>` on a negative `int` sign-extends — use `>>>` (unsigned shift) when the sign bit shouldn\'t propagate',
      'The `Integer`/`Long` classes already provide `bitCount`, `highestOneBit`, `numberOfTrailingZeros` — reach for those before hand-rolling the loop',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Three core bit tricks',
        code: '// Count set bits (Brian Kernighan\'s algorithm)\nstatic int countBits(int n) {\n    int count = 0;\n    while (n != 0) {\n        n &= (n - 1);   // clears the lowest set bit each iteration\n        count++;\n    }\n    return count;\n}\n\n// Find the single number where every other value appears twice\nstatic int singleNumber(int[] nums) {\n    int result = 0;\n    for (int n : nums) result ^= n;   // pairs cancel to 0, the lone value survives\n    return result;\n}\n\n// Iterate all subsets of a bitmask (subset DP building block)\nstatic void forEachSubset(int mask, java.util.function.IntConsumer visit) {\n    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) visit.accept(sub);\n}',
      },
      {
        kind: 'table',
        caption: 'Common bit tricks',
        headers: ['Expression', 'Computes'],
        rows: [
          ['`n & (n - 1)`', 'n with its lowest set bit cleared'],
          ['`n & (-n)`', 'isolates the lowest set bit'],
          ['`n & 1`', 'checks if n is odd'],
          ['`x ^ x == 0`, `x ^ 0 == x`', 'the basis of the "find the unique element" pattern'],
          ['`1 << i`', 'a mask with only bit i set — check inclusion via `(mask >> i) & 1`'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Signed vs unsigned right shift',
        text: '`-8 >> 1` is `-4` (sign bit propagates, arithmetic shift) but `-8 >>> 1` is a large positive number (zero-fills from the left, logical shift). Code that assumes right shift always behaves like unsigned division silently produces wrong results — and often only on negative inputs, which are easy to miss in testing.',
      },
      {
        kind: 'note',
        text: 'Bitmask subset enumeration is the state representation behind classic bitmask-DP problems (traveling salesman on ≤20 cities, "assign tasks to workers"): each subset of size n fits in a single `int`, letting a DP table be indexed by an integer mask instead of a `Set`. See [[dynamic-programming]] for the DP side of that pairing.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Bit Manipulation' },
      { book: 'algorithms-notes', chapter: 'Bit Manipulation' },
    ],
    related: ['dynamic-programming', 'analyzing-algorithms'],
  },

  {
    id: 'backtracking-templates',
    domainId: 'interview-patterns',
    title: 'Backtracking Templates',
    summary:
      'A single reusable shape — choose, recurse, un-choose — generates every permutation, subset, and constraint-satisfying configuration (N-Queens, Sudoku) with only the loop bounds and validity check changing between problems.',
    keyPoints: [
      'The three-step skeleton: **choose** an option, **recurse** on the reduced problem, **undo** the choice before trying the next option',
      'Subsets: at each element, branch into "include it" and "exclude it"',
      'Permutations: track a `used[]` array (or swap elements in place) so each element appears exactly once per path',
      'Constraint problems (N-Queens, Sudoku): check partial validity *before* recursing deeper — this pruning is what keeps exponential search spaces tractable in practice',
      'The "undo" step is what makes it backtracking rather than plain recursive brute force — it lets the same mutable state be reused across all branches instead of copying it',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Generic template applied to subsets',
        code: 'static List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> result = new ArrayList<>();\n    backtrack(nums, 0, new ArrayDeque<>(), result);\n    return result;\n}\n\nstatic void backtrack(int[] nums, int start, Deque<Integer> path, List<List<Integer>> result) {\n    result.add(new ArrayList<>(path));         // every path is a valid subset — record it\n    for (int i = start; i < nums.length; i++) {\n        path.addLast(nums[i]);                  // choose\n        backtrack(nums, i + 1, path, result);    // recurse\n        path.removeLast();                       // un-choose\n    }\n}',
      },
      {
        kind: 'note',
        title: 'Subsets vs permutations vs combinations — same skeleton',
        text: 'Subsets iterate `i` from `start` onward (order doesn\'t matter, no reuse) and record every intermediate path. Permutations iterate over *all* unused indices at each level (order matters) via a `used[]` array. Combinations of a fixed size `k` are subsets that additionally check `path.size() == k` before recording and prune once `path.size() == k` is reached. The choose/recurse/undo shape doesn\'t change — only the loop bounds and the recording condition do.',
      },
      {
        kind: 'pitfall',
        title: 'Forgetting to undo corrupts every later branch',
        text: 'If the "un-choose" step (`path.removeLast()`, resetting `used[i] = false`, or restoring a mutated board cell) is skipped or placed before the recursive call returns, every sibling branch inherits the previous branch\'s state — producing subtly wrong results that are easy to miss because *some* outputs are still correct.',
      },
      {
        kind: 'table',
        caption: 'When backtracking is (and isn\'t) the right tool',
        headers: ['Situation', 'Approach'],
        rows: [
          ['Need every valid configuration, search space is small/prunable', 'backtracking'],
          ['Need only the count or optimum, overlapping subproblems exist', '[[dynamic-programming]] instead — memoize rather than enumerate'],
          ['No constraints to prune with, pure enumeration', 'plain recursion or iteration, backtracking adds no value'],
        ],
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Backtracking' },
      { book: 'algorithms-notes', chapter: 'Backtracking' },
    ],
    related: ['backtracking', 'recursion-and-recurrences', 'dynamic-programming'],
  },

  {
    id: 'interview-problem-solving-method',
    domainId: 'interview-patterns',
    title: 'The Interview Problem-Solving Method',
    summary:
      'A repeatable process — clarify, work an example, state the brute force, look for a pattern, code while narrating, then test — turns an ambiguous prompt into a working, defensible solution under time pressure.',
    keyPoints: [
      'Clarify constraints and edge cases *before* coding: input size, duplicates allowed, negative numbers, empty input — assumptions stated out loud are assumptions the interviewer can correct early, cheaply',
      'Work a small example by hand first — it builds the intuition that later reveals the pattern, and gives you a concrete case to trace through once code exists',
      'State the brute-force solution and its complexity explicitly, even if you\'ll optimize past it — it\'s both a correctness baseline and a fallback if time runs out',
      'Look for a recognizable shape — [[two-pointers-and-sliding-window]], [[heap-top-k-pattern]], [[backtracking-templates]] — to move from brute force to an efficient solution',
      'Narrate trade-offs while coding, and test against the worked example plus at least one edge case before declaring done — interviewers are grading the process at least as much as the final answer',
    ],
    blocks: [
      {
        kind: 'note',
        title: 'Brute force first is not wasted time',
        text: 'Stating "the brute force is checking every pair, O(n²)" before optimizing does three things at once: it proves you understand the problem\'s baseline correctness, it gives the interviewer a checkpoint to confirm you\'re solving the right problem, and it\'s a working fallback to fall back on if the optimization doesn\'t land in time. Skipping straight to a clever solution that turns out to misread the problem costs far more time than the thirty seconds brute force takes to state.',
      },
      {
        kind: 'table',
        caption: 'A rough complexity budget for n',
        headers: ['Input size n', 'Complexity that likely fits the time limit'],
        rows: [
          ['n ≤ ~20', 'O(2ⁿ) or O(n!) — exhaustive search, backtracking'],
          ['n ≤ ~500', 'O(n³)'],
          ['n ≤ ~10,000', 'O(n²)'],
          ['n ≤ ~10⁶', 'O(n log n) or O(n)'],
          ['n ≤ ~10⁹ or a stream', 'O(log n) or O(1) — binary search, math, streaming'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Jumping straight to code without stating a plan',
        text: 'Typing before articulating the approach means the interviewer can\'t redirect a wrong turn until working code already exists to unwind — and it hides the reasoning process that\'s often weighted as heavily as correctness. A one- or two-sentence plan ("I\'ll use a sliding window here because the substring must be contiguous") costs seconds and saves the rework.',
      },
      {
        kind: 'bestPractice',
        title: 'State complexity before and after optimizing',
        text: 'Explicitly naming the brute-force complexity and the optimized complexity — and *why* the optimization achieves it (a data structure trade, a mathematical property, a pattern like [[binary-search-on-answer]]) — demonstrates the kind of complexity-first thinking in [[analyzing-algorithms]] that the whole exercise is meant to probe for.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Interview Strategy' },
    ],
    related: ['analyzing-algorithms', 'two-pointers-and-sliding-window', 'backtracking-templates'],
  },
]
