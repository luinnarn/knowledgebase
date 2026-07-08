import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'arrays-and-linked-lists',
    domainId: 'core-data-structures',
    title: 'Arrays & Linked Lists',
    summary:
      'The two fundamental ways to store a sequence: a contiguous array (fast random access, expensive middle insertion) versus a chain of linked nodes (fast insertion at a known point, no random access at all).',
    keyPoints: [
      'Array: `O(1)` indexed access, `O(n)` insert/remove in the middle (elements must shift), contiguous memory is cache-friendly',
      'Singly-linked list: `O(1)` insert/remove **at a known node**, `O(n)` to reach any position, one extra pointer per element',
      'Doubly-linked list adds backward traversal and `O(1)` removal given only a reference to the node, at the cost of a second pointer',
      'Dynamic arrays (`ArrayList`) amortize growth to `O(1)` per append — see [[amortized-analysis]]',
      'On modern hardware, cache locality often makes arrays win in practice even for workloads that look insertion-heavy on paper',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Array vs. singly-linked list vs. doubly-linked list',
        headers: ['Operation', 'Array', 'Singly-linked', 'Doubly-linked'],
        rows: [
          ['Access by index', 'O(1)', 'O(n)', 'O(n)'],
          ['Insert/remove at front', 'O(n)', 'O(1)', 'O(1)'],
          ['Insert/remove at end', 'O(1) amortized', 'O(n) (no tail ptr) / O(1) (with)', 'O(1)'],
          ['Insert/remove at known node', 'O(n) shift', 'O(1) (forward only)', 'O(1)'],
          ['Extra memory per element', 'none', '1 pointer', '2 pointers'],
        ],
      },
      {
        kind: 'code',
        title: 'A minimal singly-linked list node, and reversing it in place',
        code:
          'class Node<T> {\n    T val;\n    Node<T> next;\n    Node(T val, Node<T> next) { this.val = val; this.next = next; }\n}\n\nstatic <T> Node<T> reverse(Node<T> head) {   // O(n) time, O(1) extra space\n    Node<T> prev = null;\n    while (head != null) {\n        Node<T> next = head.next;   // save before overwriting\n        head.next = prev;\n        prev = head;\n        head = next;\n    }\n    return prev;                    // new head\n}',
      },
      {
        kind: 'paragraph',
        text: 'The reversal above is the canonical linked-list exercise because it forces you to hold three pointers (`prev`, `head`, `next`) at once — drop the temporary `next` and the list is severed. This is also where [[fast-slow-pointers]] and other pointer-manipulation interview patterns live: linked lists reward careful, explicit bookkeeping because there is no index to fall back on.',
      },
      {
        kind: 'pitfall',
        title: 'Cache-hostile traversal undermines the "O(1) insert" story',
        text: 'A linked list\'s `O(1)` insertion looks like a clear win over an array\'s `O(n)` shift — until you account for how you got to the insertion point. Reaching position *k* is `O(k)` node-hops through scattered heap allocations, each a potential cache miss, versus a contiguous array scan that streams through cache lines. For most realistic workloads an `ArrayList` (or `ArrayDeque`) beats a `LinkedList` even when insertions dominate — see [[lists|the Java Collections lists topic]] for the measured version of this argument.',
      },
      {
        kind: 'note',
        title: 'Arrays are the substrate everything else is built on',
        text: 'Dynamic arrays underlie hash tables\' buckets ([[hash-tables]]), binary heaps\' implicit tree layout ([[heaps-and-priority-queues]]), and the circular buffer behind a good deque ([[stacks-and-queues]]). Understanding array growth and shifting cost is a prerequisite for reasoning about all three.',
      },
      {
        kind: 'bestPractice',
        title: 'Default to the array-backed structure unless you specifically need node-level splicing',
        text: 'Reach for a linked structure only when you genuinely need to splice a node out or in given just a reference to it (an LRU cache\'s internal list, an intrusive queue) — not merely because "insertion is O(1)" sounds appealing in isolation.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 3 — Arrays and Linked Lists' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.3 — Bags, Queues, and Stacks' },
    ],
    related: ['stacks-and-queues', 'amortized-analysis', 'two-pointers-and-sliding-window', 'fast-slow-pointers'],
  },

  {
    id: 'stacks-and-queues',
    domainId: 'core-data-structures',
    title: 'Stacks & Queues',
    summary:
      'A stack is last-in-first-out (LIFO); a queue is first-in-first-out (FIFO). Both are `O(1)`-per-operation abstract data types with array- or linked-backed implementations — and a `Deque` (double-ended queue) does the job of both at once.',
    keyPoints: [
      'Stack: `push`/`pop`/`peek` at one end only — think call stack, undo history, matching-brackets validation',
      'Queue: `enqueue` at the back, `dequeue` from the front — think task scheduling, BFS ([[graph-traversal-bfs-dfs]])',
      'A circular-array `Deque` (Java\'s `ArrayDeque`) supports `O(1)` amortized push/pop/peek at **both** ends and is the right default for both roles',
      'Recursion implicitly uses the call stack; converting recursion to an explicit stack is how you avoid `StackOverflowError` on deep inputs',
      'Never use `java.util.Stack` in new Java code — it extends `Vector` and is legacy-synchronized; use `ArrayDeque` as a stack instead',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Balanced-brackets validation — the canonical stack use',
        code:
          'static boolean isBalanced(String s) {\n    Deque<Character> stack = new ArrayDeque<>();   // ArrayDeque used as a stack\n    Map<Character, Character> pairs = Map.of(\')\', \'(\', \']\', \'[\', \'}\', \'{\');\n    for (char c : s.toCharArray()) {\n        if (c == \'(\' || c == \'[\' || c == \'{\') {\n            stack.push(c);\n        } else if (pairs.containsKey(c)) {\n            if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;\n        }\n    }\n    return stack.isEmpty();\n}',
      },
      {
        kind: 'table',
        caption: 'ADT operations and their ArrayDeque method names',
        headers: ['Role', 'Add', 'Remove', 'Peek'],
        rows: [
          ['Stack (LIFO)', '`push` (= `addFirst`)', '`pop` (= `removeFirst`)', '`peek` (= `peekFirst`)'],
          ['Queue (FIFO)', '`offer`/`add` (= `addLast`)', '`poll`/`remove` (= `removeFirst`)', '`peek` (= `peekFirst`)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Every recursive algorithm implicitly maintains a stack — the JVM call stack, one frame per pending call. Converting a recursive traversal to an explicit iterative one with a `Deque<>` as the stack is the standard technique for avoiding `StackOverflowError` on deep or adversarial input (a linked list of 100,000 nodes recursed over will blow the default stack; a `while` loop with an explicit `Deque` will not, because the heap — not the fixed-size call stack — bounds it).',
      },
      {
        kind: 'code',
        title: 'Recursive vs. explicit-stack depth-first traversal',
        code:
          '// Recursive: elegant, but O(depth) call-stack frames — risks StackOverflowError\nstatic void dfsRecursive(Node n) {\n    if (n == null) return;\n    visit(n);\n    for (Node child : n.children) dfsRecursive(child);\n}\n\n// Explicit stack: identical traversal order, heap-bounded instead of stack-bounded\nstatic void dfsIterative(Node root) {\n    Deque<Node> stack = new ArrayDeque<>();\n    stack.push(root);\n    while (!stack.isEmpty()) {\n        Node n = stack.pop();\n        if (n == null) continue;\n        visit(n);\n        for (int i = n.children.size() - 1; i >= 0; i--) stack.push(n.children.get(i));\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: '`java.util.Stack` is a legacy trap',
        text: '`Stack` extends `Vector`, inheriting synchronized methods that cost performance in single-threaded code and an API that also exposes `Vector`\'s index-based methods, breaking LIFO discipline if misused. `ArrayDeque` used with `push`/`pop`/`peek` is strictly better: faster, unsynchronized, and its type signature does not tempt callers into random access.',
      },
      {
        kind: 'bestPractice',
        title: 'A queue for BFS, a stack for DFS — the choice encodes the traversal order',
        text: 'This is not a stylistic preference: a queue explores level-by-level (breadth-first) because it always processes the oldest-discovered node next, while a stack dives depth-first because it always processes the most-recently-discovered node next. See [[graph-traversal-bfs-dfs]] for both built on exactly this distinction.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.3 — Bags, Queues, and Stacks' },
      { book: 'dsa-goodrich', chapter: 'Ch. 6 — Stacks, Queues, and Deques' },
    ],
    related: ['arrays-and-linked-lists', 'graph-traversal-bfs-dfs', 'recursion-and-recurrences'],
  },

  {
    id: 'trees-and-traversals',
    domainId: 'core-data-structures',
    title: 'Trees & Traversals',
    summary:
      'A tree is a connected, acyclic graph with a designated root — the hierarchical shape behind file systems, expression parsing, and every balanced search structure. Traversal order (preorder, inorder, postorder, level-order) determines what question the walk answers.',
    keyPoints: [
      'A binary tree node has at most two children; general trees allow any number',
      'Preorder (root, left, right): reconstruct the tree structure, serialize it, or clone it',
      'Inorder (left, root, right): visits a **binary search tree** in sorted order — see [[binary-search-trees]]',
      'Postorder (left, right, root): process children before the parent — deleting a tree, computing subtree sizes',
      'Level-order (breadth-first, one level at a time) needs a queue, not the call stack — see [[graph-traversal-bfs-dfs]]',
      'Height `h` of a balanced binary tree with *n* nodes is `Θ(log n)`; a degenerate (linked-list-shaped) tree has height `Θ(n)`',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The three depth-first traversal orders on the same tree',
        headers: ['Order', 'Visit sequence', 'Typical use'],
        rows: [
          ['Preorder', 'root → left → right', 'Copy/serialize a tree; prefix expression'],
          ['Inorder', 'left → root → right', 'Sorted output of a BST'],
          ['Postorder', 'left → right → root', 'Delete a tree; evaluate an expression tree'],
        ],
      },
      {
        kind: 'code',
        title: 'The three recursive traversals, side by side',
        code:
          'record TreeNode(int val, TreeNode left, TreeNode right) {}\n\nstatic void preorder(TreeNode n, List<Integer> out) {\n    if (n == null) return;\n    out.add(n.val());              // visit root first\n    preorder(n.left(), out);\n    preorder(n.right(), out);\n}\n\nstatic void inorder(TreeNode n, List<Integer> out) {\n    if (n == null) return;\n    inorder(n.left(), out);\n    out.add(n.val());              // visit root between children\n    inorder(n.right(), out);\n}\n\nstatic void postorder(TreeNode n, List<Integer> out) {\n    if (n == null) return;\n    postorder(n.left(), out);\n    postorder(n.right(), out);\n    out.add(n.val());              // visit root last\n}',
      },
      {
        kind: 'code',
        title: 'Level-order traversal needs a queue, not recursion',
        code:
          'static List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> levels = new ArrayList<>();\n    if (root == null) return levels;\n    Deque<TreeNode> queue = new ArrayDeque<>();\n    queue.add(root);\n    while (!queue.isEmpty()) {\n        int levelSize = queue.size();\n        List<Integer> level = new ArrayList<>(levelSize);\n        for (int i = 0; i < levelSize; i++) {\n            TreeNode n = queue.poll();\n            level.add(n.val());\n            if (n.left() != null) queue.add(n.left());\n            if (n.right() != null) queue.add(n.right());\n        }\n        levels.add(level);\n    }\n    return levels;\n}',
      },
      {
        kind: 'pitfall',
        title: 'Height is only Θ(log n) if the tree is balanced',
        text: 'Every one of these traversals is `O(n)` time regardless of shape, but recursive traversals use `O(h)` stack depth — for a balanced tree that is `O(log n)`, harmless; for a tree degenerated into a linked list (e.g. from inserting already-sorted keys into a plain BST, see [[binary-search-trees]]) it is `O(n)`, risking `StackOverflowError` on large inputs. This is precisely the motivation for [[balanced-trees]].',
      },
      {
        kind: 'note',
        title: 'Recursion mirrors the tree\'s own recursive definition',
        text: 'A tree is defined recursively — a node plus a (possibly empty) left subtree and right subtree — so recursive traversal code is really just restating the definition. This is the same relationship as [[recursion-and-recurrences]]: the recursive case trusts that the smaller subtrees are traversed correctly, and combines their results.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 8 — Trees' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 3.2 — Binary Search Trees' },
    ],
    related: ['binary-search-trees', 'recursion-and-recurrences', 'heaps-and-priority-queues', 'graph-traversal-bfs-dfs'],
  },

  {
    id: 'binary-search-trees',
    domainId: 'core-data-structures',
    title: 'Binary Search Trees',
    summary:
      'A binary search tree (BST) keeps every left-subtree key smaller and every right-subtree key larger than its node — giving `O(h)` search, insert, and delete, where `h` is the tree\'s height. The catch: nothing keeps `h` small on its own.',
    keyPoints: [
      'BST invariant: for every node, `left subtree keys < node key < right subtree keys`, recursively',
      'Inorder traversal of a BST visits keys in sorted order — this falls directly out of the invariant',
      'Search, insert, and simple delete are all `O(h)` — `O(log n)` if balanced, `O(n)` in the worst case',
      'Inserting already-sorted data into a plain BST degenerates it into a linked list — `h = n`',
      'Deleting a node with two children requires finding its inorder successor (or predecessor) to replace it',
      'Self-balancing variants (AVL, red-black — [[balanced-trees]]) guarantee `O(log n)` height regardless of insertion order',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Search and insert, both O(h)',
        code:
          'static TreeNode search(TreeNode n, int key) {\n    if (n == null || n.val() == key) return n;\n    return key < n.val() ? search(n.left(), key) : search(n.right(), key);\n}\n\nstatic TreeNode insert(TreeNode n, int key) {\n    if (n == null) return new TreeNode(key, null, null);\n    if (key < n.val())      return new TreeNode(n.val(), insert(n.left(), key), n.right());\n    else if (key > n.val()) return new TreeNode(n.val(), n.left(), insert(n.right(), key));\n    return n;                 // key already present, no duplicate\n}',
      },
      {
        kind: 'table',
        caption: 'BST operation cost, balanced vs. degenerate',
        headers: ['Operation', 'Balanced (h = O(log n))', 'Degenerate (h = O(n))'],
        rows: [
          ['Search', 'O(log n)', 'O(n)'],
          ['Insert', 'O(log n)', 'O(n)'],
          ['Delete', 'O(log n)', 'O(n)'],
          ['Find min/max', 'O(log n) — leftmost/rightmost path', 'O(n)'],
          ['Inorder traversal (all keys, sorted)', 'O(n)', 'O(n)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Deletion is the operation that trips people up. Deleting a leaf or a node with one child is easy — splice it out. Deleting a node with **two** children requires preserving the BST invariant: replace the node\'s key with its inorder successor (the smallest key in the right subtree, found by walking left as far as possible) or inorder predecessor, then delete that successor from its original position — which is now guaranteed to have at most one child.',
      },
      {
        kind: 'pitfall',
        title: 'A plain BST gives no height guarantee at all',
        text: 'Inserting keys `1, 2, 3, 4, 5` in order into a plain BST produces a tree that is really a linked list leaning right — every operation degrades to `O(n)`. A BST\'s `O(log n)` reputation only holds when insertions arrive in a sufficiently random order, or when the tree actively rebalances itself. Never rely on a plain BST for a worst-case guarantee; use [[balanced-trees]] (or Java\'s `TreeMap`/`TreeSet`, which are red-black trees) when the guarantee matters.',
      },
      {
        kind: 'note',
        title: 'The BST invariant is what makes inorder traversal sorted',
        text: 'This is not a coincidence to memorize — it falls directly out of the definition. Inorder visits left subtree (all smaller keys), then the node, then right subtree (all larger keys); apply that recursively and the whole traversal is monotonically increasing. See [[trees-and-traversals]].',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 3.2 — Binary Search Trees' },
      { book: 'dsa-goodrich', chapter: 'Ch. 11.1–11.2 — Binary Search Trees' },
    ],
    related: ['trees-and-traversals', 'balanced-trees', 'binary-search-and-variants'],
  },

  {
    id: 'balanced-trees',
    domainId: 'core-data-structures',
    title: 'Balanced Trees',
    summary:
      'AVL trees, red-black trees, and B-trees all solve the same problem — a plain BST\'s height is not guaranteed — by enforcing a structural invariant after every insert/delete that keeps height at `Θ(log n)` no matter the insertion order.',
    keyPoints: [
      'AVL tree: for every node, the heights of its two subtrees differ by at most 1 — the strictest and most rigidly balanced of the common schemes',
      'Red-black tree: a looser balance (color rules on nodes) that needs fewer rotations per update — this is what Java\'s `TreeMap`/`TreeSet` use internally',
      'Both guarantee height `Θ(log n)` for *n* nodes, so search/insert/delete are all `O(log n)` worst case, not just on average',
      'Rebalancing after insert/delete uses **rotations** — local, `O(1)` restructurings that preserve the BST ordering invariant',
      'B-trees generalize the idea to many children per node, minimizing disk/page reads — the standard structure inside database indexes',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A rotation is the single mechanical operation every balanced-tree scheme is built from: pick an edge between a node and its child, and pivot around it, promoting the child to take the parent\'s place while preserving the in-order sequence of all keys. A single rotation is `O(1)`; an AVL insert triggers at most `O(log n)` rotations up the path from the new leaf back to the root (in practice usually just one or two), which is why insertion stays `O(log n)` overall including the rebalancing.',
      },
      {
        kind: 'table',
        caption: 'Balance schemes compared',
        headers: ['Scheme', 'Balance rule', 'Rotations per insert/delete', 'Where you meet it'],
        rows: [
          ['AVL', 'Subtree heights differ by ≤ 1', 'More (stricter balance)', 'Rare in stdlib; used when reads dominate writes'],
          ['Red-black', 'Coloring + path-length rules', 'Fewer (amortized O(1))', '`TreeMap`, `TreeSet`, C++ `std::map`'],
          ['B-tree', 'Many keys per node, all leaves same depth', 'Node splits/merges', 'Database indexes, filesystems'],
        ],
      },
      {
        kind: 'code',
        title: 'A right rotation — the O(1) building block',
        code:
          '//        y                    x\n//       / \\                  / \\\n//      x   C   -- rotate --> A   y\n//     / \\      right(y)         / \\\n//    A   B                     B   C\nstatic TreeNode rotateRight(TreeNode y) {\n    TreeNode x = y.left();\n    TreeNode b = x.right();\n    TreeNode newY = new TreeNode(y.val(), b, y.right());   // y keeps B and C\n    return new TreeNode(x.val(), x.left(), newY);          // x takes A and new y\n}',
      },
      {
        kind: 'pitfall',
        title: 'Balanced height is O(log n), not "fast" in absolute terms for tiny n',
        text: 'For small collections, a red-black tree\'s constant factor (pointer chasing, rotation bookkeeping) can lose to a plain sorted array with binary search, or even a linear scan. The `Θ(log n)` guarantee matters at scale and specifically under adversarial or unpredictable insert order — it is not automatically "the fast one" at every size.',
      },
      {
        kind: 'bestPractice',
        title: 'Reach for the library implementation, understand the guarantee it gives you',
        text: 'You will essentially never hand-roll a red-black tree in application code — `TreeMap`/`TreeSet` in Java (or an equivalent in any mainstream language) already is one. What matters is knowing *why* their `O(log n)` operations are guaranteed rather than merely typical, so you can reason about a workload that would degenerate a plain BST but leaves a balanced one unaffected. Compare with [[sorted-collections|Java\'s sorted collections]] for the practical, library-level version of this idea.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 11.3–11.4 — AVL Trees and Red-Black Trees' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 3.3 — Balanced Search Trees' },
    ],
    related: ['binary-search-trees', 'trees-and-traversals'],
  },

  {
    id: 'heaps-and-priority-queues',
    domainId: 'core-data-structures',
    title: 'Heaps & Priority Queues',
    summary:
      'A binary heap is a complete binary tree stored implicitly in an array, maintaining the invariant that every parent is smaller (min-heap) or larger (max-heap) than its children. It is the standard implementation of the priority queue ADT: `O(log n)` insert, `O(log n)` extract-min/max, `O(1)` peek.',
    keyPoints: [
      'Complete binary tree stored in an array: node at index `i` has children at `2i+1` and `2i+2`, parent at `(i-1)/2` — no pointers needed',
      'Min-heap property: every parent ≤ both children (recursively) — the minimum is always at the root, not necessarily anywhere else specific',
      '`insert` (sift-up) and `extractMin` (sift-down) are both `O(log n)`; `peekMin` is `O(1)`',
      'Building a heap from *n* unordered elements is `O(n)`, **not** `O(n log n)` — bottom-up heapify does less work than n sequential inserts',
      'Java\'s `PriorityQueue` is a min-heap by default; pass a `Comparator` for max-heap or custom ordering',
      'A heap is only "sorted" at the root — it is not a fully sorted structure, which is exactly what makes building it fast',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Binary heap operation costs',
        headers: ['Operation', 'Cost', 'Mechanism'],
        rows: [
          ['`peek` (min/max)', 'O(1)', 'Always at index 0'],
          ['`insert`', 'O(log n)', 'Append at end, sift up'],
          ['`extractMin`/`extractMax`', 'O(log n)', 'Swap root with last, remove last, sift down'],
          ['`heapify` (build from n elements)', 'O(n)', 'Bottom-up sift-down from last internal node'],
        ],
      },
      {
        kind: 'code',
        title: 'Sift-up (insert) and sift-down (extract) on an array-backed min-heap',
        code:
          'int[] heap; int size;\n\nvoid siftUp(int i) {\n    while (i > 0 && heap[(i - 1) / 2] > heap[i]) {\n        swap(i, (i - 1) / 2);\n        i = (i - 1) / 2;\n    }\n}\n\nint extractMin() {\n    int min = heap[0];\n    heap[0] = heap[--size];       // move last element to root\n    siftDown(0);\n    return min;\n}\n\nvoid siftDown(int i) {\n    while (true) {\n        int l = 2 * i + 1, r = 2 * i + 2, smallest = i;\n        if (l < size && heap[l] < heap[smallest]) smallest = l;\n        if (r < size && heap[r] < heap[smallest]) smallest = r;\n        if (smallest == i) break;\n        swap(i, smallest);\n        i = smallest;\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Heapsort ([[heapsort]]) is exactly "build a heap in `O(n)`, then extract the minimum `n` times" — `O(n) + n·O(log n) = O(n log n)` total, in place, with no extra memory. This is also the mechanism behind the top-K interview pattern ([[heap-top-k-pattern]]): maintain a heap of size `k` instead of sorting everything, turning an `O(n log n)` full sort into `O(n log k)`.',
      },
      {
        kind: 'pitfall',
        title: 'A heap is not a sorted array — do not iterate it expecting order',
        text: 'Only the root is guaranteed to be the min (or max); the rest of the array satisfies the heap property but is not otherwise ordered. Iterating a `PriorityQueue` directly (via its iterator, not repeated `poll()`) gives elements in **heap array order**, not priority order — a frequent source of confusion.',
        code: 'PriorityQueue<Integer> pq = new PriorityQueue<>();\npq.addAll(List.of(5, 1, 4, 2));\n// pq.iterator() does NOT guarantee ascending order — only pq.poll() repeatedly does',
      },
      {
        kind: 'bestPractice',
        title: 'Building from a known collection: pass it to the constructor, not n inserts',
        text: '`new PriorityQueue<>(collection)` runs Java\'s `O(n)` heapify internally; calling `add` in a loop `n` times costs `O(n log n)` for no benefit. This mirrors the general lesson that a bulk operation with full knowledge of the data up front is often asymptotically cheaper than the same effect built from repeated single-element operations.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.4 — Priority Queues' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9 — Priority Queues' },
    ],
    related: ['trees-and-traversals', 'heapsort', 'heap-top-k-pattern'],
  },

  {
    id: 'hash-tables',
    domainId: 'core-data-structures',
    title: 'Hash Tables',
    summary:
      'A hash table maps keys to array indices via a hash function, giving `O(1)` average-case lookup, insert, and delete. Collisions — two keys hashing to the same slot — are handled by chaining or open addressing, and the load factor governs when to resize.',
    keyPoints: [
      'A hash function maps a key to an array index; a good one distributes keys uniformly to minimize collisions',
      'Chaining: each bucket holds a list (or, in modern `HashMap`, a tree once a bucket gets large) of all keys that hashed there',
      'Open addressing: on collision, probe for the next open slot in the same array (linear, quadratic, or double hashing) — no extra structure per bucket',
      'Load factor `α = n / capacity` governs performance; resizing (rehashing everything into a bigger array) keeps `α` bounded and operations `O(1)` amortized',
      'Worst case is `O(n)` — if all keys collide into one bucket — which is why `hashCode` quality and randomized seeding both matter',
      'A key\'s `hashCode` and `equals` must agree: equal objects **must** have equal hash codes, or hash-based lookups silently fail to find them',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Chaining vs. open addressing',
        headers: ['Aspect', 'Chaining', 'Open addressing'],
        rows: [
          ['On collision', 'Append to the bucket\'s list/tree', 'Probe for the next free slot'],
          ['Load factor > 1?', 'Fine — buckets just get longer', 'Impossible — table can never be full past capacity'],
          ['Deletion', 'Simple — remove from the bucket', 'Needs tombstones, or the probe chain breaks'],
          ['Memory overhead', 'Pointer per entry', 'None extra, but needs empty slack space'],
          ['Used by', 'Java `HashMap` (chaining, treeified when a bucket gets long)', 'Python `dict`, many C hash-table libraries'],
        ],
      },
      {
        kind: 'code',
        title: 'The equals/hashCode contract, and what breaks when it is violated',
        code:
          'final class Point {\n    final int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        return o instanceof Point p && p.x == x && p.y == y;\n    }\n    @Override public int hashCode() {\n        return Objects.hash(x, y);      // MUST be consistent with equals\n    }\n}\n\n// Without a matching hashCode(), two "equal" Points could land in different\n// buckets, and map.get(new Point(1,2)) would return null even after\n// map.put(new Point(1,2), value) — the classic silent hash-table bug.',
      },
      {
        kind: 'paragraph',
        text: 'Java\'s `HashMap` uses chaining, but since Java 8 a bucket that grows past a threshold (8 entries, with table size ≥ 64) converts from a linked list to a small red-black tree, capping the true worst case at `O(log n)` per bucket instead of `O(n)` — a defense specifically against hash-flooding attacks or unlucky hash distributions. See [[hashing-internals|the Java-specific hashing internals topic]] for the full mechanism.',
      },
      {
        kind: 'pitfall',
        title: 'Mutating a key after insertion corrupts the table',
        text: 'A hash table computes a key\'s bucket **once**, at insertion time. If a mutable object is used as a key and its fields (and therefore its `hashCode`) change afterward, the entry is still sitting in its *original* bucket — `get` with an equal-but-recomputed hash will look in the *new* bucket and find nothing. Always use immutable keys, or freeze the relevant fields before inserting.',
      },
      {
        kind: 'note',
        title: 'Average O(1) assumes a decent hash function — it is not automatic',
        text: 'The `O(1)` average-case bound is conditional on the hash function distributing keys roughly uniformly across buckets; a poor or adversarially-chosen hash function collapses every operation toward `O(n)`. This is why [[randomization-in-algorithms|hash seed randomization]] exists — it prevents an attacker who knows the hash algorithm from choosing inputs that all collide on purpose.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 3.4 — Hash Tables' },
      { book: 'dsa-goodrich', chapter: 'Ch. 10 — Maps, Hash Tables, and Skip Lists' },
    ],
    related: ['amortized-analysis', 'tries', 'randomization-in-algorithms', 'bit-manipulation-tricks'],
  },

  {
    id: 'tries',
    domainId: 'core-data-structures',
    title: 'Tries',
    summary:
      'A trie (prefix tree) stores strings character by character along root-to-node paths, so every node represents a shared prefix. Lookup, insert, and prefix search all cost `O(L)` — proportional to key length, not to how many keys are stored.',
    keyPoints: [
      'Each edge is labeled with one character; a path from the root spells out a prefix, and marked nodes indicate a complete stored word',
      'Search/insert/delete are `O(L)` where `L` is the key length — independent of how many other keys are in the trie',
      'Shared prefixes are stored once, which can save substantial memory over storing full strings redundantly',
      'Natural fit for autocomplete, spell-checkers, and IP routing (longest-prefix match)',
      'A hash table beats a trie for plain exact-match lookup; a trie wins when you need prefix queries a hash table cannot answer at all',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A minimal trie: insert and prefix search',
        code:
          'class TrieNode {\n    Map<Character, TrieNode> children = new HashMap<>();\n    boolean isWord;\n}\n\nclass Trie {\n    private final TrieNode root = new TrieNode();\n\n    void insert(String word) {                  // O(L)\n        TrieNode cur = root;\n        for (char c : word.toCharArray()) {\n            cur = cur.children.computeIfAbsent(c, k -> new TrieNode());\n        }\n        cur.isWord = true;\n    }\n\n    boolean startsWith(String prefix) {          // O(L) — a hash table cannot do this\n        TrieNode cur = root;\n        for (char c : prefix.toCharArray()) {\n            cur = cur.children.get(c);\n            if (cur == null) return false;\n        }\n        return true;\n    }\n}',
      },
      {
        kind: 'table',
        caption: 'Trie vs. hash table vs. sorted array for string keys',
        headers: ['Operation', 'Trie', 'Hash table', 'Sorted array + binary search'],
        rows: [
          ['Exact lookup', 'O(L)', 'O(L) avg (hashing the string)', 'O(L log n) — L per comparison'],
          ['Prefix search ("all words starting with...")', 'O(L + results)', 'Not supported directly', 'O(L log n), then linear scan'],
          ['Memory for many shared prefixes', 'Shared — often compact', 'One full copy per key', 'One full copy per key'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The reason a trie answers prefix queries that a hash table structurally cannot: a hash function scrambles a key into an index with no relationship to keys that merely *start with* it. A trie\'s structure preserves that relationship directly — every prefix of a stored word is, by construction, a path from the root, so "does any word start with this prefix" is just "does this path exist," answered in `O(L)` regardless of how many words share or diverge from that prefix.',
      },
      {
        kind: 'pitfall',
        title: 'A naive trie can cost more memory than it saves',
        text: 'Using a full `HashMap<Character, TrieNode>` per node has real per-node overhead (a hash table bucket array for what might be 1-2 children). For alphabets with a small fixed size (lowercase ASCII), a fixed-size array of 26 child pointers per node is often faster and more memory-predictable than a generic map, at the cost of wasting slots for unused letters.',
      },
      {
        kind: 'note',
        title: 'Relation to string matching',
        text: 'A trie built from a *dictionary* of patterns is the basis of the Aho–Corasick algorithm, which finds all occurrences of many patterns in a text simultaneously in linear time — a generalization of the single-pattern matching covered in [[string-matching-algorithms]].',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 5.2 — Tries' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.2 — Tries' },
    ],
    related: ['hash-tables', 'string-matching-algorithms'],
  },

  {
    id: 'disjoint-sets-union-find',
    domainId: 'core-data-structures',
    title: 'Disjoint Sets (Union-Find)',
    summary:
      'A union-find (disjoint-set) structure tracks a partition of elements into disjoint groups, supporting `union` (merge two groups) and `find` (which group is this element in) in almost-constant amortized time — with two small optimizations doing all the work.',
    keyPoints: [
      'Backed by a simple array: each element points to a parent; a root (self-parent) identifies its group',
      '`find(x)` walks parent pointers to the root; `union(x, y)` links one root under the other',
      '**Union by rank/size**: always attach the smaller tree under the bigger one, keeping trees shallow',
      '**Path compression**: during `find`, point every visited node directly at the root, flattening future lookups',
      'Both optimizations together give `O(α(n))` amortized per operation, where `α` is the inverse Ackermann function — practically a constant ≤ 4 for any *n* that fits in the universe',
      'The classic application is Kruskal\'s minimum spanning tree algorithm ([[minimum-spanning-trees]]) and cycle detection in undirected graphs',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Union-find with path compression and union by rank',
        code:
          'class UnionFind {\n    int[] parent, rank;\n    UnionFind(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        for (int i = 0; i < n; i++) parent[i] = i;   // each element starts as its own root\n    }\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]);  // path compression\n        return parent[x];\n    }\n    void union(int a, int b) {\n        int ra = find(a), rb = find(b);\n        if (ra == rb) return;                              // already same set\n        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }  // ra has >= rank\n        parent[rb] = ra;                                   // attach smaller under bigger\n        if (rank[ra] == rank[rb]) rank[ra]++;\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Path compression alone, without union by rank, already gives an amortized `O(log n)` bound; union by rank alone gives the same. Combined, the two produce the famously tiny `O(α(n))` bound — the inverse Ackermann function grows so slowly that it never exceeds 4 for any input size that could physically exist, so union-find operations are, in every practical sense, constant time.',
      },
      {
        kind: 'table',
        caption: 'Effect of the two optimizations',
        headers: ['Optimizations applied', 'Amortized cost per operation'],
        rows: [
          ['Neither', 'O(n) worst case — a degenerate chain'],
          ['Union by rank/size only', 'O(log n)'],
          ['Path compression only', 'O(log n) amortized'],
          ['Both', 'O(α(n)) — effectively O(1)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Skipping path compression silently loses the near-constant bound',
        text: 'Without path compression, repeated `union` calls that always attach the same way can build a tall chain, and `find` degrades toward `O(n)` per call even with union by rank in place. The two optimizations are cheap to implement together and there is essentially no reason to omit either one.',
      },
      {
        kind: 'note',
        title: 'Detecting a cycle in an undirected graph in near-linear time',
        text: 'Process edges one at a time: for edge `(u, v)`, if `find(u) == find(v)` already, adding this edge would close a cycle — otherwise, `union(u, v)`. This single idea is both a standalone cycle-detection algorithm and the core of Kruskal\'s [[minimum-spanning-trees|minimum spanning tree]] algorithm, which adds edges in increasing weight order and skips any that would form a cycle.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.5 — Case Study: Union-Find' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.6 — Disjoint Sets' },
    ],
    related: ['minimum-spanning-trees', 'union-find-applications', 'amortized-analysis', 'graph-representations'],
  },

  {
    id: 'graph-representations',
    domainId: 'core-data-structures',
    title: 'Graph Representations',
    summary:
      'A graph is a set of vertices and a set of edges connecting them. How you store that structure — adjacency list vs. adjacency matrix — trades memory and iteration speed against `O(1)` edge lookup, and the choice ripples through every algorithm built on top.',
    keyPoints: [
      'Adjacency list: array/map of vertices, each holding a list of its neighbors — `O(V + E)` space, ideal for sparse graphs',
      'Adjacency matrix: `V × V` boolean/weight grid — `O(V²)` space regardless of edge count, but `O(1)` edge-existence lookup',
      'Iterating all neighbors of a vertex: `O(deg(v))` with a list, `O(V)` with a matrix — the list wins whenever the graph is sparse',
      'Directed vs. undirected: undirected edges appear in both endpoints\' adjacency lists (or are symmetric in the matrix)',
      'Weighted graphs store a weight alongside each edge — the list holds `(neighbor, weight)` pairs; the matrix stores weights instead of booleans',
      'Most real-world graphs (social networks, road networks, dependency graphs) are sparse — `E` is much closer to `V` than to `V²` — which is why adjacency lists are the default',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Adjacency list vs. adjacency matrix',
        headers: ['Aspect', 'Adjacency list', 'Adjacency matrix'],
        rows: [
          ['Space', 'O(V + E)', 'O(V²)'],
          ['Edge (u, v) exists?', 'O(deg(u))', 'O(1)'],
          ['Iterate all neighbors of v', 'O(deg(v))', 'O(V)'],
          ['Iterate all edges', 'O(V + E)', 'O(V²)'],
          ['Best for', 'Sparse graphs (most real graphs)', 'Dense graphs, or when O(1) edge lookup matters most'],
        ],
      },
      {
        kind: 'code',
        title: 'Adjacency list for a weighted directed graph',
        code:
          'class Graph {\n    private final Map<Integer, List<int[]>> adj = new HashMap<>();  // vertex -> [neighbor, weight]\n\n    void addEdge(int from, int to, int weight) {\n        adj.computeIfAbsent(from, k -> new ArrayList<>()).add(new int[]{to, weight});\n        // omit the mirrored addEdge(to, from, weight) call for a directed graph\n    }\n\n    List<int[]> neighbors(int v) {\n        return adj.getOrDefault(v, List.of());   // O(1) — empty list, not null, for a leaf vertex\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'The choice of representation is not cosmetic — it determines the complexity of every algorithm built on top. Both BFS/DFS traversal ([[graph-traversal-bfs-dfs]]) and Dijkstra\'s algorithm ([[shortest-paths]]) are typically quoted as `O(V + E)` and `O((V + E) log V)` respectively — bounds that assume an adjacency list. Run the exact same algorithms over an adjacency matrix and every "iterate neighbors" step costs `O(V)` instead of `O(deg(v))`, degrading both to have a `V²` term.',
      },
      {
        kind: 'pitfall',
        title: 'Using a matrix "for simplicity" on a large sparse graph',
        text: 'A road network with a million intersections and a few million roads is enormously sparse (`E ≈ few × V`, nowhere near `V²`). Representing it as an adjacency matrix would require on the order of 10¹² cells — infeasible — while an adjacency list costs space proportional to the actual number of roads. Default to a list unless the graph is genuinely dense or you specifically need `O(1)` edge-existence checks.',
      },
      {
        kind: 'note',
        title: 'This is the same ADT-vs-implementation split as everywhere else',
        text: '"Graph" is the abstract data type ([[abstract-data-types]]); adjacency list and adjacency matrix are two implementations with different performance shapes for the exact same operations. Choosing between them follows the same discipline as choosing between an `ArrayList` and a `LinkedList`: understand the workload\'s access pattern first.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.1 — Undirected Graphs' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.1 — Graphs' },
    ],
    related: ['abstract-data-types', 'graph-traversal-bfs-dfs', 'disjoint-sets-union-find'],
  },
]
