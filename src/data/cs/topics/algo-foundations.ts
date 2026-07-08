import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'analyzing-algorithms',
    domainId: 'algo-foundations',
    title: 'Analyzing Algorithms',
    summary:
      'Asymptotic notation — **O**, **Ω**, and **Θ** — describes how running time or memory grows as input size *n* grows, stripped of machine-specific constants. It lets you compare algorithms, not benchmarks.',
    keyPoints: [
      '`O(f(n))` is an upper bound on growth; `Ω(f(n))` a lower bound; `Θ(f(n))` means both match — the tight bound',
      'Constants and low-order terms are dropped: `3n² + 100n + 5` is `Θ(n²)`',
      'Worst case is the default lens; average case and best case need to be stated explicitly',
      'Common orders, cheapest to priciest: `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`, `O(2ⁿ)`',
      'Define *n* precisely — number of elements, bits, vertices + edges — before quoting a bound',
      'A bound describes a trend for large *n*; it says nothing about which algorithm wins at *n* = 10',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Growth rates at n = 1,000,000 (relative operation counts)',
        headers: ['Order', 'Name', 'Operations at n = 10⁶'],
        rows: [
          ['`O(log n)`', 'Logarithmic', '~20'],
          ['`O(n)`', 'Linear', '1,000,000'],
          ['`O(n log n)`', 'Linearithmic', '~20,000,000'],
          ['`O(n²)`', 'Quadratic', '10¹²'],
          ['`O(2ⁿ)`', 'Exponential', 'unfathomable'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Asymptotic analysis counts the dominant operation — comparisons in a sort, array accesses in a scan — as a function of input size, then asks how that count *scales*. It deliberately ignores constant factors and hardware, because those change with every machine and every JIT warm-up; what does not change is that a `Θ(n²)` algorithm will eventually lose to a `Θ(n log n)` one as *n* grows, no matter how well-tuned the constant is.',
      },
      {
        kind: 'code',
        title: 'Counting the dominant operation',
        code:
          'static boolean hasDuplicateLinear(int[] a) {           // O(n) extra space, O(n) time\n    Set<Integer> seen = new HashSet<>();\n    for (int x : a) {\n        if (!seen.add(x)) return true;                     // O(1) amortized per check\n    }\n    return false;\n}\n\nstatic boolean hasDuplicateQuadratic(int[] a) {        // O(1) extra space, O(n^2) time\n    for (int i = 0; i < a.length; i++) {\n        for (int j = i + 1; j < a.length; j++) {\n            if (a[i] == a[j]) return true;                 // n*(n-1)/2 comparisons\n        }\n    }\n    return false;\n}',
        caption: 'Same answer, different growth rate — the space/time trade-off in miniature.',
      },
      {
        kind: 'pitfall',
        title: 'Hidden work inside a "simple" line',
        text: 'A single line can smuggle in linear or worse cost. `String` concatenation in a loop (`result += s`) copies the whole accumulated string every iteration, turning an apparent `O(n)` loop into `O(n²)`; `list.contains(x)` on an `ArrayList` is `O(n)`, so calling it inside another loop is quadratic even though neither loop looks suspicious on its own.',
        code: 'String bad = "";\nfor (String s : words) bad += s;   // O(n^2) — use a StringBuilder instead',
      },
      {
        kind: 'note',
        title: 'Θ vs the informal "O" everyone actually means',
        text: 'In casual conversation "O(n)" almost always means Θ(n) — a tight bound, not just an upper one (technically `O(n²)` is also a correct-but-useless upper bound for a linear algorithm). Sedgewick\'s *Algorithms* leans on **tilde notation** (`~cn`) instead, keeping the leading constant so two `Θ(n)` algorithms with very different constants can still be told apart before amortized costs ([[amortized-analysis]]) are folded in.',
      },
      {
        kind: 'bestPractice',
        title: 'Profile before you optimize',
        text: 'Asymptotic analysis tells you how an algorithm scales, not whether today\'s bottleneck is that algorithm at all. Identify the actual hot path — usually with a profiler, not intuition — before trading a clear `O(n²)` for a harder-to-maintain `O(n log n)` that only matters past a size the program never reaches. See [[interview-problem-solving-method]] for the discipline of establishing correctness before optimizing.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.4 — Analysis of Algorithms' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4 — Algorithm Analysis' },
    ],
    related: ['recursion-and-recurrences', 'amortized-analysis', 'complexity-classes', 'interview-problem-solving-method'],
  },

  {
    id: 'recursion-and-recurrences',
    domainId: 'algo-foundations',
    title: 'Recursion & Recurrences',
    summary:
      'A recursive algorithm solves a problem by solving smaller instances of itself; a recurrence relation is the equation describing its running time in terms of those smaller instances.',
    keyPoints: [
      'Every recursive method needs a base case that terminates without recursing, and progress toward it on every call',
      'The call stack is real memory: depth *n* recursion uses `O(n)` stack frames and can overflow',
      'A recurrence like `T(n) = 2T(n/2) + O(n)` describes divide-and-conquer cost; the Master Theorem solves the common shapes directly',
      'Tail-recursive-looking Java code is **not** optimized away — the JVM keeps every frame, unlike languages with guaranteed tail-call elimination',
      'Memoization turns exponential naive recursion into polynomial time by caching subproblem results ([[dynamic-programming]])',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Recursion is a direct translation of an inductive proof into code: establish a base case, assume the recursive call correctly solves a smaller instance, then show how to combine that result into a solution for the current instance ([[correctness-and-invariants]]). The two failure modes are symmetric: no base case (infinite recursion, `StackOverflowError`) and a recursive call that does not shrink the problem (same failure, disguised).',
      },
      {
        kind: 'table',
        caption: 'Master Theorem cheat sheet for T(n) = aT(n/b) + f(n)',
        headers: ['Compare f(n) to n^(log_b a)', 'Result', 'Example'],
        rows: [
          ['f(n) smaller', 'T(n) = Θ(n^(log_b a))', 'T(n) = 8T(n/2) + n² → Θ(n³)'],
          ['f(n) equal', 'T(n) = Θ(n^(log_b a) · log n)', 'T(n) = 2T(n/2) + n → Θ(n log n) (mergesort)'],
          ['f(n) larger', 'T(n) = Θ(f(n))', 'T(n) = T(n/2) + n² → Θ(n²)'],
        ],
      },
      {
        kind: 'code',
        title: 'Naive vs memoized Fibonacci — the recurrence made visible',
        code:
          'static long fibNaive(int n) {                 // T(n) = T(n-1) + T(n-2) + O(1) -> Θ(φ^n)\n    if (n <= 1) return n;                      // base case\n    return fibNaive(n - 1) + fibNaive(n - 2);  // two smaller instances\n}\n\nstatic long fibMemo(int n, long[] cache) {    // Θ(n) — each subproblem solved once\n    if (n <= 1) return n;\n    if (cache[n] != 0) return cache[n];\n    return cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);\n}',
      },
      {
        kind: 'pitfall',
        title: 'Exponential blowup from re-solving subproblems',
        text: 'Naive recursion that branches into overlapping subproblems — `fib(n-1)` and `fib(n-2)` both eventually recompute `fib(n-3)` — re-derives the same answer exponentially many times. The fix is either memoization (top-down, cache as you recurse) or tabulation (bottom-up, build a table in a loop); both turn `Θ(φⁿ)` into `Θ(n)` here. See [[dynamic-programming]].',
      },
      {
        kind: 'note',
        title: 'No guaranteed tail-call elimination on the JVM',
        text: 'Writing a "tail-recursive" Java method — where the recursive call is the very last operation — does not save stack frames the way it would in Scheme or Scala (with `@tailrec`). Deep tail recursion in Java still risks `StackOverflowError`; converting to an explicit loop with an accumulator, or an explicit stack ([[stacks-and-queues]]), is the reliable fix for genuinely deep recursion.',
      },
      {
        kind: 'bestPractice',
        title: 'State the recurrence before you code the recursion',
        text: 'Write `T(n) = ...` on paper first: how many subproblems, how much smaller, how much work to combine. If you cannot state it, you likely cannot argue the algorithm terminates or bound its cost — and the Master Theorem only applies once the recurrence is in its standard form.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3 — Mergesort (recurrence derivation)' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.3 — Recursion' },
      { book: 'crushing-tech-interview', chapter: 'Recursion Fundamentals' },
    ],
    related: ['analyzing-algorithms', 'divide-and-conquer', 'dynamic-programming', 'backtracking', 'correctness-and-invariants'],
  },

  {
    id: 'amortized-analysis',
    domainId: 'algo-foundations',
    title: 'Amortized Analysis',
    summary:
      'Amortized analysis bounds the *average* cost per operation over a worst-case **sequence** of operations, even when individual operations occasionally cost much more than that average.',
    keyPoints: [
      'A single expensive operation is fine if it is rare enough that cheap operations pay for it over the whole sequence',
      'Dynamic array growth (`ArrayList.add`) is `O(1)` amortized: doubling capacity makes resizes exponentially rarer as the array grows',
      'The **accounting method**: overcharge cheap operations a little, bank the credit, spend it on the rare expensive one',
      'Amortized bounds are about a sequence starting from empty — a single worst-case call can still be `O(n)`',
      'Different from average-case analysis: amortized bounds require no assumption about input distribution, only about the operation sequence',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'When an `ArrayList` (see [[arrays-and-linked-lists]]) is full and `add` is called, it allocates a new backing array — typically 1.5–2× the size — and copies every existing element, an `O(n)` operation. Naively this looks like *n* calls to `add` could cost `O(n²)` total. It does not, because resizes happen at sizes 1, 2, 4, 8, 16, ... — geometrically rarer — so the total copying work across *n* inserts is a geometric series summing to `O(n)`, i.e. `O(1)` **amortized** per `add`.',
      },
      {
        kind: 'code',
        title: 'The accounting-method argument, made concrete',
        code:
          '// Charge $3 per add(): $1 pays for the insert itself,\n// $2 is banked as credit on the newly-inserted element.\n// When the array of size k doubles to 2k, the resize must copy k elements;\n// those k elements each still hold their $2 credit -> exactly $2k available,\n// covering the O(k) copy with $0 left over. Credit never goes negative,\n// so the $3 flat rate is a valid amortized bound: add() is O(1) amortized.',
        caption: 'A proof sketch, not runnable — the comments carry the argument.',
      },
      {
        kind: 'table',
        caption: 'Amortized cost of common dynamic-array operations',
        headers: ['Operation', 'Worst single call', 'Amortized over n calls'],
        rows: [
          ['`add` (append)', 'O(n) — on resize', 'O(1)'],
          ['`add(i, e)` (middle)', 'O(n) — shift', 'O(n) (no amortized win — every call shifts)'],
          ['`get(i)` / `set(i, e)`', 'O(1)', 'O(1)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Growing by a fixed amount instead of a fixed factor',
        text: 'If a dynamic array grew by adding a constant *k* elements each resize instead of multiplying capacity by a constant factor, the number of resizes over *n* inserts becomes `n/k` — linear, not logarithmic — and each resize still costs `O(current size)`, so total cost becomes `Θ(n²)`. Geometric (multiplicative) growth is what makes amortized `O(1)` possible at all; this is why every serious dynamic array implementation doubles (or 1.5×s) rather than adding a fixed chunk.',
      },
      {
        kind: 'note',
        title: 'Amortized ≠ average case',
        text: 'Average-case analysis assumes a probability distribution over inputs and asks about expected cost — it can be defeated by an adversarial input. Amortized analysis makes no probabilistic assumption at all: it is a worst-case guarantee over any sequence of operations, which is why it is the right tool for justifying `ArrayList`, hash-table resizing ([[hash-tables]]), and the union-find path-compression bound ([[disjoint-sets-union-find]]).',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 7.2 — Array-Based Sequences: Amortization' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.4 — Amortized Analysis of Resizing Arrays' },
    ],
    related: ['arrays-and-linked-lists', 'hash-tables', 'disjoint-sets-union-find', 'analyzing-algorithms'],
  },

  {
    id: 'abstract-data-types',
    domainId: 'algo-foundations',
    title: 'Abstract Data Types',
    summary:
      'An abstract data type (ADT) is a contract — what operations exist and what they guarantee — decoupled from any specific data structure that implements it. `List`, `Stack`, and `Map` are ADTs; `ArrayList`, `ArrayDeque`, and `HashMap` are implementations.',
    keyPoints: [
      'An ADT specifies *behavior* (operations and their pre/post-conditions), never *how* it is stored',
      'The same ADT can have wildly different implementations with different performance shapes — a `Stack` can sit on an array or a linked list',
      'Java interfaces (`List`, `Queue`, `Map`) are the language mechanism for expressing an ADT; classes (`ArrayList`, `LinkedList`) are implementations',
      'Programming against the ADT, not the implementation, is what lets you swap implementations later without touching callers',
      'Choosing a data structure is really choosing an ADT first, then an implementation whose performance profile matches the workload',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The distinction matters because it separates two different design questions. "What can I do with this collection?" is answered by the ADT — a `Queue` supports enqueue and dequeue, full stop. "How fast is each operation, and what is the memory shape?" is answered by the implementation — a queue backed by a circular array behaves very differently under contention or cache pressure than one backed by linked nodes, even though both satisfy the exact same `Queue` contract.',
      },
      {
        kind: 'table',
        caption: 'ADT vs. representative Java implementations',
        headers: ['ADT', 'Core operations', 'Example implementations'],
        rows: [
          ['Stack', 'push, pop, peek (LIFO)', 'array-backed, `ArrayDeque` used as a stack'],
          ['Queue', 'enqueue, dequeue, peek (FIFO)', 'circular array, singly-linked list'],
          ['Priority Queue', 'insert, extract-min/max', 'binary heap, balanced BST'],
          ['Map', 'put, get, remove by key', 'hash table, balanced BST (sorted map)'],
          ['Set', 'add, contains, remove, no duplicates', 'hash table, balanced BST'],
        ],
      },
      {
        kind: 'code',
        title: 'One ADT, two implementations, identical contract',
        code:
          'interface IntStack {                 // the ADT: the contract, nothing about storage\n    void push(int x);\n    int pop();\n    boolean isEmpty();\n}\n\nclass ArrayIntStack implements IntStack {   // implementation A: contiguous array\n    private int[] data = new int[16];\n    private int size = 0;\n    public void push(int x) { data[size++] = x; }   // O(1) amortized\n    public int pop() { return data[--size]; }\n    public boolean isEmpty() { return size == 0; }\n}\n\nclass LinkedIntStack implements IntStack {  // implementation B: linked nodes\n    private Node top;\n    private record Node(int val, Node next) {}\n    public void push(int x) { top = new Node(x, top); }  // O(1) worst case, one allocation\n    public int pop() { int v = top.val(); top = top.next(); return v; }\n    public boolean isEmpty() { return top == null; }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Coding against the implementation, not the ADT',
        text: 'Declaring `ArrayList<String> names = new ArrayList<>()` instead of `List<String> names = new ArrayList<>()` looks harmless until a caller starts depending on `ArrayList`-specific behavior (like index-based `get` being fast) that a future swap to a different `List` would silently break. Program to the ADT\'s interface type — this is the whole idea behind [[collections-overview|the Collections Framework]]\'s interface hierarchy.',
      },
      {
        kind: 'bestPractice',
        title: 'Pick the ADT from the operations you need, then the implementation from the performance you need',
        text: 'Ask "do I need order? duplicates? fast lookup by key? fast lookup by position?" first — that selects the ADT. Only then ask about growth patterns, memory locality, and concurrency to select an implementation. Skipping straight to "I\'ll just use an `ArrayList`" without asking the first question is how `O(n)` `contains` calls end up buried in a hot loop.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 1.3 — Introduction to Object-Oriented Design (ADTs)' },
      { book: 'dsa-myers', chapter: 'Ch. 2 — Abstract Data Types' },
    ],
    related: ['arrays-and-linked-lists', 'stacks-and-queues', 'graph-representations'],
  },

  {
    id: 'correctness-and-invariants',
    domainId: 'algo-foundations',
    title: 'Correctness & Invariants',
    summary:
      'An invariant is a property that stays true across every iteration of a loop or every level of a recursion. Proving an algorithm correct almost always means finding the right invariant and showing it holds at the start, is preserved by each step, and implies the answer at the end.',
    keyPoints: [
      'A loop invariant must hold: (1) before the first iteration, (2) if true before an iteration then true after it, (3) at termination in a form that implies correctness',
      'This is induction in disguise — the invariant is the inductive hypothesis, the loop step is the inductive step',
      'Termination must be argued separately from correctness: a variant (a value that strictly decreases and is bounded) proves the loop ends',
      'Off-by-one bugs are almost always an invariant that was never stated precisely — "sorted up to index i" vs "sorted up to and including index i" are different invariants',
      'Recursive correctness proofs mirror loop invariants: base case = initialization, recursive case = preservation, assuming smaller instances are already correct',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The classic example is insertion sort: the invariant is "at the start of each outer-loop iteration, `a[0..i-1]` is sorted." Initialization is trivial (a single element is sorted). Preservation is the inner loop: it inserts `a[i]` into the correct position among `a[0..i-1]`, restoring the invariant for `i+1`. Termination: when `i` reaches `a.length`, the invariant says `a[0..n-1]` is sorted — exactly the goal. This is the entire correctness proof, and it is also exactly how you would explain the algorithm to a colleague.',
      },
      {
        kind: 'code',
        title: 'The invariant made visible as a comment at the loop boundary',
        code:
          'static void insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        // invariant: a[0..i-1] is sorted\n        int key = a[i];\n        int j = i - 1;\n        while (j >= 0 && a[j] > key) {\n            a[j + 1] = a[j];\n            j--;\n        }\n        a[j + 1] = key;\n        // invariant restored: a[0..i] is sorted\n    }\n    // loop exit: i == a.length, so a[0..n-1] is sorted\n}',
      },
      {
        kind: 'table',
        caption: 'The three-part invariant proof structure',
        headers: ['Step', 'Question answered', 'Insertion-sort example'],
        rows: [
          ['Initialization', 'Is it true before the first iteration?', 'a[0..0] (one element) is trivially sorted'],
          ['Maintenance', 'If true before an iteration, is it true after?', 'Inner loop inserts a[i] into its sorted position'],
          ['Termination', 'Does it imply correctness when the loop ends?', 'i = n ⟹ a[0..n-1] sorted ⟹ done'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A vague invariant hides an off-by-one bug',
        text: '"The array is mostly sorted by index i" is not an invariant — it is not precise enough to check. Binary search bugs almost always trace back to sloppiness about whether `lo`/`hi` are inclusive or exclusive bounds of the remaining search range; state the invariant as a precise set membership (`answer ∈ a[lo..hi]`) and the loop condition and update falls out mechanically.',
        code: '// imprecise: "somewhere in the middle part"\n// precise:   answer index is in a[lo..hi] inclusive, on every iteration',
      },
      {
        kind: 'note',
        title: 'Termination needs its own argument',
        text: 'Correctness (the invariant holds) and termination (the loop actually ends) are logically independent claims. The standard termination argument exhibits a **variant**: an integer expression that strictly decreases every iteration and is bounded below (usually by 0). For a `while (lo <= hi)` binary search, `hi - lo` is the variant — it strictly shrinks each iteration and cannot go negative, so the loop must end.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.1 — Basic Programming Model (loop invariants)' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.1 — Recursion and Induction' },
    ],
    related: ['recursion-and-recurrences', 'binary-search-and-variants', 'debugging-and-problem-solving'],
  },

  {
    id: 'randomization-in-algorithms',
    domainId: 'algo-foundations',
    title: 'Randomization in Algorithms',
    summary:
      'Introducing randomness deliberately — a random pivot, a random hash seed, a random sample — can turn an algorithm\'s worst case from likely-to-happen into vanishingly-unlikely, trading a guarantee for an *expected* bound that holds regardless of input.',
    keyPoints: [
      'A randomized algorithm\'s running time is a random variable; "expected `O(n log n)`" means averaged over the algorithm\'s own coin flips, not over input distribution',
      'Randomized quicksort with a random pivot has expected `O(n log n)` time on **every** input, because no adversary can target the randomness in advance',
      'Reservoir sampling picks a uniform-random sample of unknown-size streaming data in one pass with `O(k)` memory',
      'Randomized algorithms are either Las Vegas (always correct, random running time — randomized quicksort) or Monte Carlo (bounded time, small chance of a wrong answer)',
      'Never use `java.util.Random` for anything security-sensitive; use `SecureRandom` there — this domain is about algorithmic randomness, not cryptographic randomness',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Plain [[quicksort]] with a fixed pivot rule (e.g. always the first element) has an adversarial worst case: already-sorted input drives it to `Θ(n²)`. Picking the pivot **uniformly at random** each call does not change the worst-case input — sorted arrays still exist — but it makes the *probability* of hitting the bad case on any particular random choice vanishingly small, so the **expected** running time is `Θ(n log n)` no matter what the input is. The adversary can no longer choose a bad input, because the badness now depends on the algorithm\'s private coin flips, not on the data.',
      },
      {
        kind: 'code',
        title: 'Reservoir sampling — a uniform random sample from an unknown-length stream',
        code:
          'static int reservoirSample(Iterator<Integer> stream, Random rnd) {\n    int reservoir = stream.next();       // first element is the initial sample\n    int i = 1;\n    while (stream.hasNext()) {\n        int x = stream.next();\n        i++;\n        if (rnd.nextInt(i) == 0) {       // replace with probability 1/i\n            reservoir = x;\n        }\n    }\n    return reservoir;                    // every element seen so far had equal probability 1/i\n}',
        caption: 'One pass, O(1) extra memory for a sample of size 1 — extends to size k by keeping k slots.',
      },
      {
        kind: 'table',
        caption: 'Las Vegas vs. Monte Carlo randomized algorithms',
        headers: ['Kind', 'Correctness', 'Running time', 'Example'],
        rows: [
          ['Las Vegas', 'Always correct', 'Random (expected bound)', 'Randomized quicksort'],
          ['Monte Carlo', 'Correct with high probability', 'Fixed/bounded', 'Miller–Rabin primality test'],
        ],
      },
      {
        kind: 'pitfall',
        title: '"Expected" is not "guaranteed"',
        text: 'An expected `O(n log n)` bound describes the average over the algorithm\'s internal randomness; a specific unlucky run can still be slow (though astronomically improbable for reasonable *n*). For hard real-time guarantees, expected-case analysis is not enough — that calls for an algorithm with a true worst-case bound (e.g. median-of-medians selection instead of randomized quickselect, [[order-statistics-selection]]).',
      },
      {
        kind: 'note',
        title: 'Randomization also defangs hash-flooding attacks',
        text: 'Java\'s `HashMap` uses a randomized hash seed partly to prevent an attacker who knows the hash function from crafting inputs that all collide into one bucket, degrading lookups to `O(n)` ([[hash-tables]]). The same idea — using randomness to neutralize an adversary\'s ability to target a worst case — underlies both randomized quicksort and hash-table seed randomization.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3 — Quicksort: Randomization' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.4 — Randomization Case Study' },
    ],
    related: ['quicksort', 'hash-tables', 'order-statistics-selection'],
  },

  {
    id: 'complexity-classes',
    domainId: 'algo-foundations',
    title: 'Complexity Classes',
    summary:
      '**P** is the class of problems solvable in polynomial time; **NP** is the class whose solutions can be *verified* in polynomial time. Whether P = NP is the central open question of computer science — and in practice, treating a problem as NP-hard changes how you approach it.',
    keyPoints: [
      'P: solvable in polynomial time. NP: a proposed solution can be checked in polynomial time (not necessarily found quickly)',
      'Every problem in P is in NP — if you can solve it quickly, you can trivially verify a solution quickly',
      'NP-complete problems are the hardest problems in NP: every NP problem reduces to them in polynomial time',
      'No polynomial-time algorithm is known for any NP-complete problem, and finding one would prove P = NP',
      'Recognizing a problem is NP-hard is actionable: stop searching for an exact polynomial algorithm, switch to heuristics, approximation, or restricting the input',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The asymmetry between P and NP is the whole story: for a problem like the Traveling Salesman Problem, nobody knows how to *find* a shortest route faster than roughly trying all permutations, but given a candidate route, *checking* that it is under some length budget and visits every city once is trivially fast — sum the edge weights, compare. NP is exactly this class of "easy to check, seemingly hard to solve."',
      },
      {
        kind: 'table',
        caption: 'Where familiar problems sit',
        headers: ['Class', 'Meaning', 'Examples'],
        rows: [
          ['P', 'Solvable in polynomial time', 'Sorting, shortest paths ([[shortest-paths]]), matching'],
          ['NP', 'Solution verifiable in polynomial time', 'Everything in P, plus SAT, TSP decision version, subset sum'],
          ['NP-complete', 'The hardest problems in NP; all of NP reduces to them', '3-SAT, vertex cover, knapsack (decision version)'],
          ['NP-hard', 'At least as hard as NP-complete, not necessarily in NP itself', 'The optimization (not decision) version of TSP'],
        ],
      },
      {
        kind: 'code',
        title: 'Easy to verify, believed hard to solve — subset sum',
        code:
          '// Given a candidate subset, VERIFYING it sums to the target is O(n): trivially in NP.\nstatic boolean verifySubset(int[] chosen, int target) {\n    int sum = 0;\n    for (int x : chosen) sum += x;\n    return sum == target;\n}\n\n// SOLVING (finding such a subset) has no known polynomial algorithm in general —\n// the brute-force search below is O(2^n), one bit per element for "in / out".\nstatic boolean subsetSumExists(int[] a, int target) {\n    int n = a.length;\n    for (int mask = 0; mask < (1 << n); mask++) {\n        int sum = 0;\n        for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) sum += a[i];\n        if (sum == target) return true;\n    }\n    return false;\n}',
      },
      {
        kind: 'pitfall',
        title: '"NP" does not mean "not polynomial"',
        text: 'A common misreading: NP stands for "nondeterministic polynomial time," not "not polynomial." P is a subset of NP (every polynomial-time problem is also polynomial-time verifiable) — the open question is whether that containment is strict. Calling a problem simply "NP" says nothing about its difficulty by itself; the interesting claims are "NP-complete" or "NP-hard."',
      },
      {
        kind: 'bestPractice',
        title: 'Prove NP-hardness, then stop looking for an exact fast algorithm',
        text: 'If a problem reduces from a known NP-complete problem ([[reductions-and-intractability]]), that is a strong signal to redirect effort: exact exponential/backtracking solutions for small instances ([[backtracking]]), approximation algorithms with a provable ratio, heuristics tuned to the problem\'s structure, or restricting to a tractable special case — rather than continuing to search for a polynomial exact algorithm that almost certainly does not exist.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 6.4 — Intractability' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.4 — NP-Completeness' },
    ],
    related: ['reductions-and-intractability', 'backtracking', 'dynamic-programming', 'analyzing-algorithms'],
  },
]
