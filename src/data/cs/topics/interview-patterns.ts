import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'two-pointers-and-sliding-window',
    domainId: 'interview-patterns',
    title: 'Two Pointers & Sliding Window',
    summary:
      'Two indices walking across an array or string — from opposite ends, or as a window that grows and shrinks — turn a large class of O(n²) brute-force scans into O(n).',
    keyPoints: [
      {
        text: 'Opposite-direction pointers on **sorted** data: two-sum on a sorted array, container-with-most-water',
        detail: 'Sortedness is what lets moving a pointer inward eliminate a whole range of possibilities at once — if the pair sum is too large, the high pointer can only make it larger by staying put and only the low pointer moving right (or high moving left) can help, so each step provably rules out a candidate instead of just trying one.',
      },
      {
        text: 'Same-direction pointers as a **sliding window**: longest substring without repeating characters, smallest subarray with a given sum',
        detail: 'Both pointers only ever move forward, never backward — the right pointer explores new territory and the left pointer only catches up when the window becomes invalid, so across the whole scan each index is touched a bounded number of times by each pointer, which is what keeps the total work linear.',
      },
      {
        text: 'The window expands to explore and shrinks to restore a violated invariant — it never restarts from scratch, which is exactly what makes it O(n) instead of O(n²)',
        detail: 'A brute-force scan re-examines overlapping subarrays from their own start every time, redoing work already done — the sliding window instead carries forward everything it learned about the current window and only adjusts the boundary that actually needs to move, so no character or element is ever reprocessed more than a constant number of times.',
      },
      {
        text: 'Recognize the shape: "contiguous subarray/substring satisfying some condition" is the sliding-window tell',
        detail: 'The word "contiguous" is doing the real work in that sentence — the moment a problem requires the elements to be adjacent in the original array or string (as opposed to any subset), a window that grows and shrinks along that contiguous run becomes a candidate, whereas a non-contiguous requirement usually points toward a different pattern entirely (subsets, DP).',
      },
      {
        text: 'Opposite-end two pointers usually require sorted input first — sorting costs O(n log n), which then dominates the two-pointer O(n) scan',
        detail: 'The two-pointer scan itself is asymptotically cheaper than the sort that makes it valid, so the overall complexity of the whole solution is whatever the sort costs, not the O(n) scan — worth stating explicitly in an interview, since claiming "O(n)" for a solution that requires sorting first understates its true cost.',
      },
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
        detail: 'This surfaces specifically on inputs where restoring the invariant genuinely needs more than one left-pointer step — a single duplicate character three positions back, say — so it is easy to write an `if`-based version, test it against simple cases where one shrink happens to be enough, and ship a bug that only appears on less common inputs.',
      },
      {
        kind: 'note',
        text: 'Two pointers and sliding window both lean on the same data structures as [[arrays-and-linked-lists]] and often pair with a `HashMap`/`HashSet` for O(1) membership checks inside the window — see [[hash-tables]]. The fast/slow variant of two pointers, used for cycle detection rather than windowing, is its own pattern: [[fast-slow-pointers]].',
        detail: 'The hash-based companion structure is what makes "does the window currently contain a duplicate / does it contain all required characters" answerable in O(1) instead of rescanning the window on every step — without it, an otherwise-O(n) sliding window degrades back to O(n·k) for a window of size k.',
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
      {
        text: 'Classic use: detecting a cycle in a linked list — if a cycle exists, the fast pointer (2 steps) always laps the slow one (1 step)',
        detail: 'Once both pointers are inside the cycle, the gap between them shrinks by exactly one node every step (fast gains two, slow gains one) — a shrinking gap on a fixed-size loop is guaranteed to reach zero, which is why "they eventually meet" is not a heuristic here, it is a mathematical certainty once a cycle exists.',
      },
      {
        text: 'Finding the middle of a list in a single pass: when fast reaches the end, slow is at the midpoint',
        detail: 'Fast always covers exactly twice the distance slow does in the same number of steps, so the moment fast has traversed the whole list, slow has necessarily traversed exactly half of it — no need to count the list\'s length first and then walk to length/2, which would otherwise take two full passes instead of one.',
      },
      {
        text: 'Finding the cycle **start**: after they meet, reset one pointer to the head and advance both one step at a time — they meet again exactly at the cycle\'s start (a consequence of the arithmetic, not a coincidence)',
        detail: 'This trick reuses the exact same distances established by the first meeting — the algebra behind it (worked out in the note below) shows that the distance from the head to the cycle start is congruent to the distance from the meeting point to the cycle start, modulo the cycle length, which is precisely why walking both from those two different starting points in lockstep converges at the same node.',
      },
      {
        text: 'O(1) space beats the alternative of storing every visited node in a `HashSet` to detect a repeat',
        detail: 'A `HashSet`-based cycle check is conceptually simpler (add each node as you visit it, a cycle exists the moment you see one already in the set) but needs memory proportional to however many nodes get visited before the cycle is found — fast/slow pointers get the identical answer using only two pointer variables, regardless of list length.',
      },
      {
        text: 'Generalizes to any "functional graph" (each node has exactly one outgoing edge) — e.g. detecting a cycle in repeatedly applying a function, like the "happy number" problem',
        detail: 'A linked list is just one instance of "every node has exactly one next" — repeatedly applying any deterministic function to a value traces the exact same kind of path (value, next value, next value...), which either terminates or eventually cycles, so the identical fast/slow technique detects the cycle without needing an explicit linked-list structure at all.',
      },
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
        detail: 'The key algebraic fact is `a + b = kc` — it says the distance already covered by the meeting point is an exact multiple of the cycle length plus the head-to-cycle distance `a`. That is precisely why starting one pointer over from the head and walking both one step at a time closes the remaining `a`-length gap simultaneously for both, landing them together right at the cycle\'s entrance.',
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
        detail: 'The bug is parity-dependent, which is what makes it easy to ship: on an odd-length list the fast pointer always lands on a real node with a `null` next, so a single `fast != null` check happens to be enough — it only breaks on even-length inputs, exactly the kind of input split that\'s easy to under-test.',
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
      {
        text: 'Applies whenever a yes/no predicate over a range of values is **monotonic**: false, false, …, false, true, true, …, true',
        detail: 'Monotonicity is the entire precondition for binary search to work at all — it is what guarantees that discarding half the range on each comparison never discards the answer, because everything on the "false" side of the flip point can never contain a true. Without that one-directional flip, the standard `lo`/`hi` narrowing has no logical basis and can converge on a wrong answer with total confidence.',
      },
      {
        text: 'Classic shapes: "minimum capacity to ship packages in D days," "Koko eating bananas," "minimize the maximum of k subarray sums"',
        detail: 'All three share the same underlying phrasing — "minimize the maximum" or an equivalent "maximize the minimum" — which is the verbal tell that a feasibility check exists (does capacity C work?) whose answer flips from false to true exactly once as the candidate value increases.',
      },
      {
        text: 'The search space is the answer\'s value range, not array indices — bounds come from the problem (e.g. max single element to total sum), not `0` to `n-1`',
        detail: 'It is easy to default to the familiar `0`-to-`n-1` index bounds out of habit, but here `lo`/`hi` must instead bracket every value the *answer* could ever legally take — get those bounds wrong (too narrow) and the search silently excludes the correct answer, as the pitfall below spells out.',
      },
      {
        text: 'Each feasibility check typically costs O(n) on its own, so total cost is O(n · log(range)), not O(log n)',
        detail: 'The binary search only cuts down *how many times* the feasibility check runs (log of the range), not the cost of any single check — each check still has to scan the input to decide feasibility, so the two costs multiply rather than one replacing the other.',
      },
      {
        text: 'The hard part is recognizing the monotonicity, not writing the binary search — the [[binary-search-and-variants|binary search]] shell itself is boilerplate once that\'s spotted',
        detail: 'Once the monotonic predicate is identified, the `lo`/`hi`/`mid` loop is nearly identical across every problem of this shape — the actual interview signal is in correctly justifying *why* the predicate is monotonic, not in the mechanics of the loop that follows.',
      },
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
        detail: 'Proving the flip only goes one way is usually a one-line argument once stated out loud — more capacity can only merge shipping days together, never force more of them — and stating that argument explicitly in an interview is what distinguishes "I recognized this shape" from "I got lucky with the loop."',
      },
      {
        kind: 'pitfall',
        title: 'Bounds that are too tight cut off the true optimum',
        text: 'Setting `lo`/`hi` from an intuition about "reasonable" values, rather than provably-necessary extremes (the true minimum and maximum the answer could ever be), risks binary-searching a range that excludes the correct answer entirely — the search converges cleanly and confidently returns a wrong number.',
        detail: 'The failure mode is silent because binary search doesn\'t know its bounds are wrong — it just converges to whichever boundary value is closest to the (excluded) true answer and returns that with the same confidence as a correct run, so the bug shows up as a wrong number with no exception or warning to catch it.',
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
      {
        text: 'For the **k largest** elements, keep a **min-heap** of size k — counterintuitive, but it lets you discard the current smallest of the k candidates in O(log k) whenever a bigger element arrives',
        detail: 'The inversion feels backwards until you notice what the heap needs to answer efficiently: "what\'s the weakest of my current top-k candidates, so I know whether the next element deserves a spot?" — a min-heap reports that weakest candidate at its root in O(1), which is exactly the question that needs answering on every new element.',
      },
      {
        text: 'For the **k smallest**, invert it: a **max-heap** of size k',
        detail: 'Same logic mirrored — tracking the k smallest means the value most at risk of eviction is the current largest of the k, so a max-heap keeps that value at the root where it can be checked and evicted in O(log k).',
      },
      {
        text: 'Java\'s `PriorityQueue` is the natural container — `offer` to add, `poll` the root to evict when size exceeds k',
        detail: '`PriorityQueue` is a min-heap by default (natural ordering), so the k-largest case needs no comparator, while the k-smallest case needs `Collections.reverseOrder()` or an equivalent comparator to flip it into a max-heap — mixing these up silently produces the wrong k elements.',
      },
      {
        text: 'Works on streaming data you can\'t fully hold in memory or sort — the heap only ever holds k elements',
        detail: 'Sorting requires the entire dataset to be resident at once; a size-k heap never needs more than k elements in memory regardless of how many total elements stream through, which is the property that makes this the only viable approach once the input can\'t fit in memory or arrives element-by-element with no way to look ahead.',
      },
      {
        text: '"Merge k sorted lists" is the same pattern in disguise: a heap of k pointers, always popping the smallest and advancing that pointer',
        detail: 'The heap here holds one candidate per source list rather than one candidate per element overall, but the mechanism is identical — bound the heap to size k, always pop the extreme, replace it with the next candidate from the same source. Recognizing this as the same shape saves re-deriving the technique from scratch.',
      },
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
        detail: 'Tagging each heap entry with its source list is the detail that makes the replacement step possible — without knowing which list a popped value came from, there\'s no way to know which list to pull the next candidate from, so the heap entry needs to carry (value, list index, index within that list) rather than just the bare value.',
      },
      {
        kind: 'pitfall',
        title: 'Using the wrong heap type defeats the point',
        text: 'Using a max-heap to track the k *largest* elements means the heap keeps growing to hold everything (you\'d only know what to evict by looking at the *smallest* tracked value, which a max-heap can\'t report in O(log k)) — the min-heap-for-largest inversion is the entire trick, not an arbitrary detail.',
        detail: 'A max-heap reports its *largest* element in O(1), which is useless for deciding what to evict here — finding the smallest in a max-heap requires an O(k) scan of the leaves, which defeats the O(log k) eviction that makes the pattern worthwhile in the first place.',
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
      {
        text: 'Number of connected components / number of islands: map grid cells to graph nodes, union adjacent land cells, count remaining roots',
        detail: 'The final count of distinct roots *is* the answer — no separate counting pass over the components is needed, since each `union` call that actually merges two previously-separate trees reduces the root count by exactly one, so tracking that count incrementally (or counting distinct `find` results at the end) gives the component total directly.',
      },
      {
        text: 'Cycle detection while building a graph edge-by-edge: a union that fails (both endpoints already share a root) means the new edge closes a cycle',
        detail: 'This is cheaper than the DFS-based cycle check because it never needs to re-traverse the graph built so far — each new edge is a single `find`-`find`-compare, so building a graph one edge at a time while checking for cycles stays linear-ish overall instead of re-scanning after every addition.',
      },
      {
        text: '"Accounts merge" / equivalence-class problems: union whenever two items are declared equivalent, then group by final root',
        detail: 'The pattern generalizes past graphs entirely — anywhere "these two things are the same group" arrives as a stream of pairwise facts (shared email on two accounts, two people knowing each other), union-find turns that stream into final group membership without ever materializing an explicit graph structure.',
      },
      {
        text: 'With **path compression** and **union by rank/size**, both `find` and `union` run in amortized nearly-O(1) time — technically O(α(n)), the inverse Ackermann function, for all practical n indistinguishable from a constant — see [[amortized-analysis]]',
        detail: 'α(n) grows so slowly that it never exceeds 4 or 5 for any n that could physically fit in memory, which is why interviewers and textbooks alike just say "constant" — but naming the actual bound (rather than claiming true O(1)) shows the claim is understood rather than memorized.',
      },
      {
        text: 'Beats repeated BFS/DFS whenever queries ("are u and v connected *right now*?") are interleaved with edge additions, since re-running a full traversal after every edge would be far more expensive',
        detail: 'A fresh BFS/DFS per query costs O(V+E) each time, so m interleaved queries and edge additions cost O(m·(V+E)) total — union-find answers each query in near-O(1) after the initial setup, which is the difference that matters once queries and updates are interleaved rather than all queries coming after the graph is fully built.',
      },
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
        detail: 'Neither optimization alone gets to near-O(1) — path compression without union by rank can still leave a chain temporarily deep before the next `find` flattens it, and union by rank without path compression only bounds height to O(log n). It\'s specifically the combination that produces the inverse-Ackermann bound; the two techniques compensate for each other\'s worst case.',
      },
      {
        kind: 'pitfall',
        title: 'Skipping path compression turns find into O(n)',
        text: 'Without path compression, repeated unions can build a long chain (a "linked list" masquerading as a tree), and `find` degenerates to walking the whole chain — O(n) per call instead of near-O(1). Union by rank alone bounds the tree height to O(log n), which is fine but strictly worse than the two techniques combined.',
        detail: 'This is easy to get away with on small inputs or short test runs, since the degenerate chain only forms after a specific sequence of unions — the structure looks correct and passes correctness tests, and only the missing performance optimization shows up, typically as a timeout on larger inputs rather than a wrong answer.',
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
      {
        text: '`n & (n - 1)` clears the lowest set bit — powers-of-two check (`n > 0 && (n & (n-1)) == 0`), and the basis of Brian Kernighan\'s bit-count algorithm',
        detail: '`n - 1` flips every bit below and including the lowest set bit of `n` (borrow propagates through all the trailing zeros), so ANDing the two together zeroes out exactly that lowest set bit and nothing else — a power of two has exactly one set bit, so clearing it leaves zero, which is what the powers-of-two check tests for.',
      },
      {
        text: 'XOR cancels a value with itself (`x ^ x == 0`) and is identity with zero (`x ^ 0 == x`) — the trick behind "find the single number among duplicates"',
        detail: 'XORing the entire array together, every value that appears an even number of times cancels itself out completely regardless of order (XOR is commutative and associative), leaving only the value that appears an odd number of times — no hash set or sorting needed, O(1) extra space.',
      },
      {
        text: 'A bitmask represents a subset of a small set (n ≤ ~20): bit i set means element i is included — the basis of bitmask dynamic programming',
        detail: 'The n ≤ ~20 ceiling comes from `2^n` states needing to fit comfortably in an `int` and in memory — at n = 20 there are already about a million subsets, which is the practical limit for a DP table indexed by mask before both time and space become intractable.',
      },
      {
        text: 'Left shift `<<` and right shift `>>` are multiply/divide by 2, but `>>` on a negative `int` sign-extends — use `>>>` (unsigned shift) when the sign bit shouldn\'t propagate',
        detail: 'Sign extension exists so that `>>` behaves like true integer division by a power of two even for negative numbers (rounding toward negative infinity) — but that same behavior is wrong the moment the bits are being treated as a raw pattern rather than a signed quantity, which is exactly when `>>>` is needed instead.',
      },
      {
        text: 'The `Integer`/`Long` classes already provide `bitCount`, `highestOneBit`, `numberOfTrailingZeros` — reach for those before hand-rolling the loop',
        detail: 'These methods are typically compiled down to a single hardware instruction (e.g. `POPCNT`) on modern JVMs, so a hand-rolled loop is not just more code but very likely slower — using the built-in also signals familiarity with the standard library rather than reinventing it under time pressure.',
      },
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
        detail: 'Test suites built around small positive numbers never exercise this difference at all, since `>>` and `>>>` agree on any non-negative input — the bug only appears once a negative value reaches the shift, which makes it a classic "works in every test I wrote, fails in production" mistake.',
      },
      {
        kind: 'note',
        text: 'Bitmask subset enumeration is the state representation behind classic bitmask-DP problems (traveling salesman on ≤20 cities, "assign tasks to workers"): each subset of size n fits in a single `int`, letting a DP table be indexed by an integer mask instead of a `Set`. See [[dynamic-programming]] for the DP side of that pairing.',
        detail: 'Representing a subset as an `int` rather than a `Set<Integer>` matters for more than memory — it also makes the subset usable directly as an array index into the DP table, and lets subset operations (union, intersection, membership test) become single bitwise instructions instead of set-library calls, which is what keeps bitmask DP fast enough to be practical.',
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
      {
        text: 'The three-step skeleton: **choose** an option, **recurse** on the reduced problem, **undo** the choice before trying the next option',
        detail: 'Every backtracking problem, no matter how different the surface (permutations, N-Queens, Sudoku), reduces to this same three-line shape — once it\'s recognized, the remaining work is just figuring out what "choose" and "undo" mean for the specific problem and what makes a partial choice invalid.',
      },
      {
        text: 'Subsets: at each element, branch into "include it" and "exclude it"',
        detail: 'This binary branching at each of n elements is what produces exactly 2ⁿ leaves — one leaf per possible subset — which is why subset enumeration is inherently exponential regardless of how it\'s implemented.',
      },
      {
        text: 'Permutations: track a `used[]` array (or swap elements in place) so each element appears exactly once per path',
        detail: 'Unlike subsets, permutations need to consider every unused element at every recursion level rather than only elements after a fixed `start` index — the `used[]` array (or in-place swapping) is what enforces "each element exactly once" without which the recursion would revisit and repeat elements.',
      },
      {
        text: 'Constraint problems (N-Queens, Sudoku): check partial validity *before* recursing deeper — this pruning is what keeps exponential search spaces tractable in practice',
        detail: 'Without pruning, the recursion would blindly build every possible full configuration and only check validity at the leaves — checking partial validity early instead means an invalid placement is rejected before the (exponentially larger) subtree beneath it is ever explored, which is the difference between a search that finishes and one that doesn\'t.',
      },
      {
        text: 'The "undo" step is what makes it backtracking rather than plain recursive brute force — it lets the same mutable state be reused across all branches instead of copying it',
        detail: 'Copying the state (a new list or board per branch) would work too, but at real cost — O(n) copy work per branch instead of O(1) mutate/undo — so the undo step is a deliberate space and time optimization, not just a stylistic choice, and skipping it corrupts sibling branches rather than merely wasting memory.',
      },
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
        detail: 'Recognizing these three as variations on one skeleton, rather than three separate algorithms to memorize, is what lets a slightly unfamiliar variant (say, permutations with duplicates, or combinations with a sum constraint) be derived on the spot by asking "what changes about the loop bound or the recording condition here?" instead of needing to have seen that exact problem before.',
      },
      {
        kind: 'pitfall',
        title: 'Forgetting to undo corrupts every later branch',
        text: 'If the "un-choose" step (`path.removeLast()`, resetting `used[i] = false`, or restoring a mutated board cell) is skipped or placed before the recursive call returns, every sibling branch inherits the previous branch\'s state — producing subtly wrong results that are easy to miss because *some* outputs are still correct.',
        detail: 'The bug is insidious precisely because the first branch explored is always correct (nothing has leaked into it yet) — corruption only shows up in later sibling branches, so a quick smoke test on the first result of a small input can pass while the overall output is wrong.',
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
      {
        text: 'Clarify constraints and edge cases *before* coding: input size, duplicates allowed, negative numbers, empty input — assumptions stated out loud are assumptions the interviewer can correct early, cheaply',
        detail: 'A wrong assumption discovered after fifteen minutes of coding costs fifteen minutes of rework; the same wrong assumption caught in the first thirty seconds of clarifying questions costs nothing — the entire value of this step is moving the cost of being wrong as early as possible.',
      },
      {
        text: 'Work a small example by hand first — it builds the intuition that later reveals the pattern, and gives you a concrete case to trace through once code exists',
        detail: 'Tracing a concrete example by hand often surfaces the algorithmic pattern (two pointers, a window, a recurrence) before any code is written, purely from noticing what information needs to be tracked step to step — and that same example becomes a ready-made test case once the code exists, saving the effort of inventing one after the fact.',
      },
      {
        text: 'State the brute-force solution and its complexity explicitly, even if you\'ll optimize past it — it\'s both a correctness baseline and a fallback if time runs out',
        detail: 'Two distinct payoffs from one cheap step: it gives the interviewer an explicit checkpoint to confirm the problem is understood before real time is spent, and it leaves a working (if suboptimal) answer in hand if the clever optimization doesn\'t land before time is up.',
      },
      {
        text: 'Look for a recognizable shape — [[two-pointers-and-sliding-window]], [[heap-top-k-pattern]], [[backtracking-templates]] — to move from brute force to an efficient solution',
        detail: 'Interview problems are rarely novel — they are almost always a known pattern wearing different variable names and a different story, so the fastest path from brute force to an efficient solution is pattern-matching against a small mental catalog of shapes rather than re-deriving an algorithm from first principles under time pressure.',
      },
      {
        text: 'Narrate trade-offs while coding, and test against the worked example plus at least one edge case before declaring done — interviewers are grading the process at least as much as the final answer',
        detail: 'A silently-typed correct solution and a narrated correct solution demonstrate very different things to an evaluator — the narration is what proves the reasoning behind each choice (why this data structure, why this loop bound) rather than leaving the interviewer to guess whether the choice was deliberate or lucky.',
      },
    ],
    blocks: [
      {
        kind: 'note',
        title: 'Brute force first is not wasted time',
        text: 'Stating "the brute force is checking every pair, O(n²)" before optimizing does three things at once: it proves you understand the problem\'s baseline correctness, it gives the interviewer a checkpoint to confirm you\'re solving the right problem, and it\'s a working fallback to fall back on if the optimization doesn\'t land in time. Skipping straight to a clever solution that turns out to misread the problem costs far more time than the thirty seconds brute force takes to state.',
        detail: 'The asymmetry is stark: stating the brute force costs perhaps thirty seconds, while discovering — after ten minutes coding a clever approach — that the problem was misunderstood from the start costs the full ten minutes plus whatever time remains to recover, which is why the "waste" of stating the obvious solution first is actually cheap insurance.',
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
        detail: 'The asymmetry is the whole issue: stating the plan costs seconds, but discovering the plan was wrong only after typing it out costs however long that code took to write, plus the time to unwind it — the earlier a wrong approach is caught, the cheaper the correction.',
      },
      {
        kind: 'bestPractice',
        title: 'State complexity before and after optimizing',
        text: 'Explicitly naming the brute-force complexity and the optimized complexity — and *why* the optimization achieves it (a data structure trade, a mathematical property, a pattern like [[binary-search-on-answer]]) — demonstrates the kind of complexity-first thinking in [[analyzing-algorithms]] that the whole exercise is meant to probe for.',
        detail: 'Naming the *why* behind the improvement — not just the before/after Big-O — is what separates having memorized a solution from actually understanding the trade-off being made, and it\'s usually the detail interviewers probe on with a follow-up question.',
      },
    ],
    refs: [
      { book: 'crushing-tech-interview', chapter: 'Interview Strategy' },
    ],
    related: ['analyzing-algorithms', 'two-pointers-and-sliding-window', 'backtracking-templates'],
  },
]
