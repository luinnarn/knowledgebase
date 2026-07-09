import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'arrays-and-linked-lists',
    domainId: 'core-data-structures',
    title: 'Arrays & Linked Lists',
    summary:
      'The two fundamental ways to store a sequence: a contiguous array (fast random access, expensive middle insertion) versus a chain of linked nodes (fast insertion at a known point, no random access at all).',
    keyPoints: [
      {
        text: 'Array: `O(1)` indexed access, `O(n)` insert/remove in the middle (elements must shift), contiguous memory is cache-friendly',
        detail: 'Indexed access is O(1) because the address of element `i` is computed directly (`base + i * elementSize`) — no traversal needed. A middle insert has to physically shift every element after it one slot over to make room, which is the O(n) cost; that shifting is also what makes deletion O(n).',
      },
      {
        text: 'Singly-linked list: `O(1)` insert/remove **at a known node**, `O(n)` to reach any position, one extra pointer per element',
        detail: 'The O(1) claim only holds once you already have a reference to the node — splicing a new node next to a known one is just a couple of pointer reassignments. Getting to that node in the first place has no shortcut like array indexing; you must walk `next` pointers from the head, which is the O(n) part people often forget to count.',
      },
      {
        text: 'Doubly-linked list adds backward traversal and `O(1)` removal given only a reference to the node, at the cost of a second pointer',
        detail: 'A singly-linked list cannot remove a node in O(1) even with a direct reference to it, because unlinking requires updating the *previous* node\'s `next` pointer, and a singly-linked node has no way to find its predecessor without walking from the head. The second (`prev`) pointer in a doubly-linked list is exactly what closes that gap.',
      },
      {
        text: 'Dynamic arrays (`ArrayList`) amortize growth to `O(1)` per append — see [[amortized-analysis]]',
        detail: 'Any single append can trigger a full O(n) copy into a bigger backing array, so no individual append is O(1) in the worst case — but growing geometrically (e.g. 1.5× or 2× each time) means those expensive copies happen exponentially less often as the list grows, so the *average* cost per append across a long sequence of them works out to O(1).',
      },
      {
        text: 'On modern hardware, cache locality often makes arrays win in practice even for workloads that look insertion-heavy on paper',
        detail: 'A CPU cache line pulls in a contiguous chunk of memory at once, so scanning an array streams through cache-resident data with very few cache misses. A linked list\'s nodes are scattered across the heap by allocation order, not logical order, so each `next` hop is a likely cache miss — a cost the O(1)-vs-O(n) asymptotic comparison does not capture at all.',
      },
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
        detail: 'This is a case where the asymptotic complexity and the real-world measurement point in opposite directions, and it surprises people who trust Big-O as the whole story. The lesson generalizes: Big-O describes how cost scales with input size, not the constant factor multiplying it — and on modern hardware, memory-access pattern is often a bigger constant factor than the algorithm textbook accounts for.',
      },
      {
        kind: 'note',
        title: 'Arrays are the substrate everything else is built on',
        text: 'Dynamic arrays underlie hash tables\' buckets ([[hash-tables]]), binary heaps\' implicit tree layout ([[heaps-and-priority-queues]]), and the circular buffer behind a good deque ([[stacks-and-queues]]). Understanding array growth and shifting cost is a prerequisite for reasoning about all three.',
        detail: 'None of those three structures are "linked" in the node-and-pointer sense, even though they are conceptually trees, queues, or hash maps — they are all, underneath, a single resizable array with clever indexing math on top. That is why an array\'s growth/shifting costs resurface as a component of every one of their own complexity analyses.',
      },
      {
        kind: 'bestPractice',
        title: 'Default to the array-backed structure unless you specifically need node-level splicing',
        text: 'Reach for a linked structure only when you genuinely need to splice a node out or in given just a reference to it (an LRU cache\'s internal list, an intrusive queue) — not merely because "insertion is O(1)" sounds appealing in isolation.',
        detail: 'An LRU cache is the canonical legitimate use: it needs to move an arbitrary, already-located node to the front on every access, in true O(1), which is exactly the scenario a linked list\'s pointer-splicing wins at and an array\'s shifting cannot match — because there, the cost of *finding* the node is paid separately (via a hash map), leaving only the O(1) splice.',
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
      {
        text: 'Stack: `push`/`pop`/`peek` at one end only — think call stack, undo history, matching-brackets validation',
        detail: 'Restricting access to one end is the entire point of the abstraction — it is what guarantees last-in-first-out ordering. An undo history is a natural fit because the most recent action is always the one you want to reverse first, exactly what `pop` gives you.',
      },
      {
        text: 'Queue: `enqueue` at the back, `dequeue` from the front — think task scheduling, BFS ([[graph-traversal-bfs-dfs]])',
        detail: 'FIFO ordering models fairness — the first task submitted is the first one processed, which is what most scheduling scenarios want by default. BFS relies on this same property: a queue guarantees vertices are explored in the order they were discovered, which is exactly what produces its layer-by-layer traversal.',
      },
      {
        text: 'A circular-array `Deque` (Java\'s `ArrayDeque`) supports `O(1)` amortized push/pop/peek at **both** ends and is the right default for both roles',
        detail: 'The "circular" part is what makes both ends O(1): instead of shifting elements when the front grows, the array wraps around using modular arithmetic on the indices, so adding at either end is just writing to the next slot and advancing a pointer, with no shifting of existing elements.',
      },
      {
        text: 'Recursion implicitly uses the call stack; converting recursion to an explicit stack is how you avoid `StackOverflowError` on deep inputs',
        detail: 'Every recursive call pushes a new frame onto the JVM\'s call stack, which has a small, fixed size compared to the heap. An explicit `Deque` used as a stack lives on the heap instead, so the same logical "stack of pending work" can grow far larger before running out of space — the traversal order is unaffected, only where the bookkeeping lives changes.',
      },
      {
        text: 'Never use `java.util.Stack` in new Java code — it extends `Vector` and is legacy-synchronized; use `ArrayDeque` as a stack instead',
        detail: 'Every `Stack` method inherited from `Vector` is `synchronized`, imposing a lock-acquisition cost on every single-threaded call that will never actually contend — pure overhead for the common case. `ArrayDeque` has no such baggage and is not tempted into misuse via `Vector`\'s index-based methods, which `Stack` exposes even though they break LIFO discipline if called.',
      },
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
        detail: 'The synchronization is a relic of an era (Java 1.0/1.2) before the modern Collections Framework existed, when nearly every mutable collection was synchronized by default. It offers no thread-safety benefit today either — a series of individually-synchronized calls is not atomic as a whole, so concurrent code still needs external locking or a purpose-built concurrent structure on top.',
      },
      {
        kind: 'bestPractice',
        title: 'A queue for BFS, a stack for DFS — the choice encodes the traversal order',
        text: 'This is not a stylistic preference: a queue explores level-by-level (breadth-first) because it always processes the oldest-discovered node next, while a stack dives depth-first because it always processes the most-recently-discovered node next. See [[graph-traversal-bfs-dfs]] for both built on exactly this distinction.',
        detail: 'Swapping the data structure while keeping the rest of the traversal code identical is enough to change the entire exploration order — a useful fact when debugging: if a traversal is visiting nodes in an unexpected order, checking whether a queue or a stack is backing it often explains the discrepancy immediately.',
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
      {
        text: 'A binary tree node has at most two children; general trees allow any number',
        detail: 'The two-children cap is what makes binary trees analyzable with clean height math (each level at most doubles the node count) and is why so much of the field specializes in them — binary search trees, heaps, and most balanced-tree schemes are all binary by design, not by necessity.',
      },
      {
        text: 'Preorder (root, left, right): reconstruct the tree structure, serialize it, or clone it',
        detail: 'Visiting the root before its children means the very first thing written to output is always the top of whatever subtree comes next — which is precisely the property that lets a preorder sequence alone (given a way to mark null children, or knowledge that the tree is a BST) reconstruct the exact same tree shape it was generated from.',
      },
      {
        text: 'Inorder (left, root, right): visits a **binary search tree** in sorted order — see [[binary-search-trees]]',
        detail: 'This falls directly out of the BST invariant: everything in the left subtree is smaller than the root, everything in the right subtree is larger. Visiting left, then root, then right therefore visits strictly increasing values at every level of the recursion, which composes into a fully sorted sequence overall.',
      },
      {
        text: 'Postorder (left, right, root): process children before the parent — deleting a tree, computing subtree sizes',
        detail: 'Any computation that depends on a node\'s children already being finished needs postorder — you cannot safely free a node\'s memory before freeing its subtrees (you would lose the pointers to them), and you cannot know a subtree\'s size without first knowing both children\'s sizes.',
      },
      {
        text: 'Level-order (breadth-first, one level at a time) needs a queue, not the call stack — see [[graph-traversal-bfs-dfs]]',
        detail: 'The three depth-first orders all fall out naturally from recursion because the call stack itself mirrors a depth-first path down the tree. Level-order needs to jump sideways across the tree instead of diving deeper, which recursion has no natural mechanism for — a queue holding "everything discovered so far, oldest first" is what makes that sideways movement possible.',
      },
      {
        text: 'Height `h` of a balanced binary tree with *n* nodes is `Θ(log n)`; a degenerate (linked-list-shaped) tree has height `Θ(n)`',
        detail: 'A balanced tree roughly doubles the number of nodes it can hold with each additional level, so reaching *n* nodes only takes about log₂(n) levels. A degenerate tree — every node with only one child — is really just a linked list wearing a tree interface, with height equal to its node count instead of its logarithm.',
      },
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
        detail: 'The O(n) time bound holds regardless of shape because every traversal visits every node exactly once no matter how the tree is arranged — shape only affects the *stack depth* of the recursion, not the total work done. That distinction is easy to conflate, and it is why a "correct but slow" mental model (assuming balance) can pass every test on small inputs and still crash on a large, adversarially-ordered one.',
      },
      {
        kind: 'note',
        title: 'Recursion mirrors the tree\'s own recursive definition',
        text: 'A tree is defined recursively — a node plus a (possibly empty) left subtree and right subtree — so recursive traversal code is really just restating the definition. This is the same relationship as [[recursion-and-recurrences]]: the recursive case trusts that the smaller subtrees are traversed correctly, and combines their results.',
        detail: 'This is why tree algorithms are usually the clearest introduction to recursive thinking: the base case (an empty subtree, `null`) and the recursive case (process this node, trust the recursive calls to handle its children) map directly onto the data structure\'s own definition, with none of the index arithmetic that recursion on arrays or numbers usually needs.',
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
      {
        text: 'BST invariant: for every node, `left subtree keys < node key < right subtree keys`, recursively',
        detail: 'The "recursively" is the crucial part — it is not enough for a node\'s immediate children to be smaller/larger, every descendant anywhere in either subtree must satisfy the ordering relative to that node. This global consistency is what lets search eliminate half the remaining tree at every step, not just at the top.',
      },
      {
        text: 'Inorder traversal of a BST visits keys in sorted order — this falls directly out of the invariant',
        detail: 'This is one of the most useful properties in practice: whenever code needs the contents of a BST in sorted order, no separate sort is needed — an inorder traversal (already O(n)) produces it directly, for free, as a structural consequence of the invariant rather than extra work.',
      },
      {
        text: 'Search, insert, and simple delete are all `O(h)` — `O(log n)` if balanced, `O(n)` in the worst case',
        detail: 'All three operations share the same shape: start at the root and follow one path down the tree, going left or right based on a comparison at each node — the number of comparisons is bounded by the tree\'s height, which is why the same `O(h)` bound applies uniformly to all of them.',
      },
      {
        text: 'Inserting already-sorted data into a plain BST degenerates it into a linked list — `h = n`',
        detail: 'Every new key in sorted order is either larger than everything already inserted (or smaller than everything), so it always becomes the new rightmost (or leftmost) node with no branching — the tree grows in one direction only, one node per level, which is structurally identical to a linked list wearing a tree interface.',
      },
      {
        text: 'Deleting a node with two children requires finding its inorder successor (or predecessor) to replace it',
        detail: 'You cannot simply remove a two-child node outright without breaking the tree into two disconnected pieces, and you cannot promote an arbitrary child without risking a BST-invariant violation. The inorder successor (smallest key in the right subtree) is guaranteed to be larger than everything in the left subtree and smaller than everything remaining in the right subtree, so replacing the deleted node\'s key with it preserves the invariant exactly.',
      },
      {
        text: 'Self-balancing variants (AVL, red-black — [[balanced-trees]]) guarantee `O(log n)` height regardless of insertion order',
        detail: 'A plain BST\'s height depends entirely on the order keys arrive in — there is no mechanism to fix a bad shape after the fact. Self-balancing trees add bookkeeping (rotations, height/color tracking) that actively restructures the tree after every insert/delete specifically to prevent the sorted-input degeneration case from ever happening.',
      },
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
        detail: 'The dangerous part is that this failure mode looks fine in casual testing — random or hand-picked test data rarely triggers it — and then shows up in production against real-world input that happens to arrive sorted (already-ordered timestamps, IDs, or imported data), silently turning an expected O(log n) service into an O(n) one under exactly the conditions least likely to be caught in review.',
      },
      {
        kind: 'note',
        title: 'The BST invariant is what makes inorder traversal sorted',
        text: 'This is not a coincidence to memorize — it falls directly out of the definition. Inorder visits left subtree (all smaller keys), then the node, then right subtree (all larger keys); apply that recursively and the whole traversal is monotonically increasing. See [[trees-and-traversals]].',
        detail: 'Because this relationship is structural rather than incidental, it also gives a quick sanity check for validating a claimed BST: run an inorder traversal and confirm the output is strictly increasing. If it is not, the BST invariant has been violated somewhere, without needing to inspect the tree\'s pointer structure directly.',
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
      {
        text: 'AVL tree: for every node, the heights of its two subtrees differ by at most 1 — the strictest and most rigidly balanced of the common schemes',
        detail: 'Because the imbalance tolerance is so tight, AVL trees stay closer to the theoretical minimum height than any other common scheme, which makes lookups slightly faster — the tradeoff is that keeping the height difference at ≤1 after every insert/delete requires more frequent rotations than a looser balancing rule would.',
      },
      {
        text: 'Red-black tree: a looser balance (color rules on nodes) that needs fewer rotations per update — this is what Java\'s `TreeMap`/`TreeSet` use internally',
        detail: 'Red-black trees tolerate the longest root-to-leaf path being up to twice the shortest one and still guarantee O(log n) height — a much looser bound than AVL\'s, which in exchange needs fewer rotations per insert/delete (amortized O(1) vs AVL\'s more frequent rebalancing). That write-heavy-workload advantage is why it, not AVL, became the standard library choice.',
      },
      {
        text: 'Both guarantee height `Θ(log n)` for *n* nodes, so search/insert/delete are all `O(log n)` worst case, not just on average',
        detail: 'This is the entire point of balancing: a plain BST\'s O(log n) is only a *typical-case* expectation that specific input orders can defeat, while a self-balancing tree actively maintains its height invariant after every modification, so O(log n) becomes a guarantee that holds for every possible sequence of operations, not just favorable ones.',
      },
      {
        text: 'Rebalancing after insert/delete uses **rotations** — local, `O(1)` restructurings that preserve the BST ordering invariant',
        detail: 'A rotation only touches a small, constant number of pointers around one edge, which is what keeps it O(1) regardless of tree size — yet it changes which node is "higher" in that local region, and a bounded number of these local fixes (O(log n) of them, applied along the path from the modified leaf back to the root) is enough to restore global height balance after any single insert or delete.',
      },
      {
        text: 'B-trees generalize the idea to many children per node, minimizing disk/page reads — the standard structure inside database indexes',
        detail: 'A binary tree node holding one key wastes an entire disk read (which fetches a whole page, typically 4-16 KB) on a single comparison. A B-tree node instead holds hundreds of keys per page, so each disk read narrows the search by a much larger factor — trading tree height (fewer levels) directly against the number of expensive I/O operations, which is what matters when memory access is fast but disk access is not.',
      },
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
        detail: 'This is the same lesson as arrays beating linked lists in practice despite worse Big-O: asymptotic complexity describes behavior as n grows without bound, and says nothing about which structure wins at n = 20. Reaching for the "theoretically better" structure by default, without checking the actual scale involved, is a common source of needless complexity.',
      },
      {
        kind: 'bestPractice',
        title: 'Reach for the library implementation, understand the guarantee it gives you',
        text: 'You will essentially never hand-roll a red-black tree in application code — `TreeMap`/`TreeSet` in Java (or an equivalent in any mainstream language) already is one. What matters is knowing *why* their `O(log n)` operations are guaranteed rather than merely typical, so you can reason about a workload that would degenerate a plain BST but leaves a balanced one unaffected. Compare with [[sorted-collections|Java\'s sorted collections]] for the practical, library-level version of this idea.',
        detail: 'Hand-rolling a correct, fully-tested red-black tree implementation (all the rotation and recoloring cases on both insert and delete) is a genuinely hard, error-prone exercise even for experienced engineers — which is exactly why every mainstream standard library ships one, and why doing so yourself in application code is very rarely the right call outside of an educational exercise.',
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
      {
        text: 'Complete binary tree stored in an array: node at index `i` has children at `2i+1` and `2i+2`, parent at `(i-1)/2` — no pointers needed',
        detail: '"Complete" means every level is fully filled except possibly the last, which fills strictly left-to-right with no gaps — that specific shape is what makes the index arithmetic work, since it guarantees there is never a "hole" in the array that would break the parent/child index formulas.',
      },
      {
        text: 'Min-heap property: every parent ≤ both children (recursively) — the minimum is always at the root, not necessarily anywhere else specific',
        detail: 'The property only constrains parent-child relationships, not siblings or cousins — the second-smallest element could be anywhere among the root\'s descendants, not necessarily one of its direct children. That looseness is exactly what makes a heap cheaper to build and maintain than a fully sorted structure.',
      },
      {
        text: '`insert` (sift-up) and `extractMin` (sift-down) are both `O(log n)`; `peekMin` is `O(1)`',
        detail: 'Both operations move an element along a single root-to-leaf path, swapping it with a parent or child at each step until the heap property is restored locally — the path length is bounded by the tree\'s height, which is O(log n) for a complete binary tree of n elements, giving both operations that same bound.',
      },
      {
        text: 'Building a heap from *n* unordered elements is `O(n)`, **not** `O(n log n)` — bottom-up heapify does less work than n sequential inserts',
        detail: 'Calling `insert` n times costs O(n log n) because most of those inserts happen when the heap is already large, and sifting up in a large heap can traverse many levels. Bottom-up heapify instead starts from the last internal node and sifts *down*, and most nodes in a complete tree are near the bottom with very short paths to sift down — the sum of all those (mostly short) sift-downs works out to O(n) overall, not O(n log n).',
      },
      {
        text: 'Java\'s `PriorityQueue` is a min-heap by default; pass a `Comparator` for max-heap or custom ordering',
        detail: 'The default ordering follows the elements\' natural `Comparable` ordering, so `poll()` returns the smallest element first — for a max-heap behavior, supplying `Comparator.reverseOrder()` (or any custom comparator) simply changes what "smaller" means to the heap, without needing a different data structure or algorithm.',
      },
      {
        text: 'A heap is only "sorted" at the root — it is not a fully sorted structure, which is exactly what makes building it fast',
        detail: 'A fully sorted array must place every element in its exact final position, which costs O(n log n) in general. A heap only has to guarantee the *minimum* is findable at O(1) and each extraction restores that guarantee in O(log n) — a much weaker promise than full sortedness, and that relaxation is precisely the room heapify exploits to run in O(n).',
      },
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
        detail: 'This trips people up specifically because most other Java collections either have a well-defined iteration order or clearly document that they do not — `PriorityQueue`\'s iterator quietly returns the internal array order, which looks almost-but-not-quite sorted for small inputs, making the bug easy to miss in casual testing and only surface later.',
      },
      {
        kind: 'bestPractice',
        title: 'Building from a known collection: pass it to the constructor, not n inserts',
        text: '`new PriorityQueue<>(collection)` runs Java\'s `O(n)` heapify internally; calling `add` in a loop `n` times costs `O(n log n)` for no benefit. This mirrors the general lesson that a bulk operation with full knowledge of the data up front is often asymptotically cheaper than the same effect built from repeated single-element operations.',
        detail: 'The same pattern recurs across many data structures — a constructor or bulk-load method that sees all the data at once can often do better than the same result built one element at a time, because it can choose a global strategy (like bottom-up heapify) instead of repeatedly re-solving a smaller version of the same problem.',
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
      {
        text: 'A hash function maps a key to an array index; a good one distributes keys uniformly to minimize collisions',
        detail: 'The entire O(1) promise of a hash table rests on this distribution being close to uniform — a hash function that clusters many keys into the same few indices degrades those buckets toward a linear list, no matter how large the backing array is. "Good" here specifically means spreading realistic key sets evenly, not just producing large numbers.',
      },
      {
        text: 'Chaining: each bucket holds a list (or, in modern `HashMap`, a tree once a bucket gets large) of all keys that hashed there',
        detail: 'Chaining sidesteps collisions entirely rather than avoiding them — multiple keys are simply allowed to share a bucket, stored as a small sub-structure. The tradeoff is that a lookup now costs "find the bucket" (O(1)) plus "scan the bucket\'s contents" (proportional to how many keys collided there).',
      },
      {
        text: 'Open addressing: on collision, probe for the next open slot in the same array (linear, quadratic, or double hashing) — no extra structure per bucket',
        detail: 'Instead of letting a bucket hold multiple keys, open addressing insists every slot holds at most one — on a collision, it deterministically searches nearby slots (following a probe sequence) until it finds an empty one. This avoids the per-bucket allocation overhead chaining has, at the cost of a table that can never be over-full and deletions that need special handling.',
      },
      {
        text: 'Load factor `α = n / capacity` governs performance; resizing (rehashing everything into a bigger array) keeps `α` bounded and operations `O(1)` amortized',
        detail: 'As more keys are added to a fixed-size table, collisions become more likely and average operation cost creeps up — load factor is exactly the ratio that predicts this. Resizing before α gets too large (doubling the capacity and re-inserting every existing key) keeps the *average* collision count bounded, which is what preserves the O(1) amortized guarantee analogous to a dynamic array\'s growth.',
      },
      {
        text: 'Worst case is `O(n)` — if all keys collide into one bucket — which is why `hashCode` quality and randomized seeding both matter',
        detail: 'A pathological hash function (or one an attacker can predict and exploit) can be fed inputs specifically chosen to all land in the same bucket, degrading every operation to a linear scan through that one bucket — this is a real denial-of-service vector against services that hash untrusted input, which is exactly why hash seed randomization exists.',
      },
      {
        text: 'A key\'s `hashCode` and `equals` must agree: equal objects **must** have equal hash codes, or hash-based lookups silently fail to find them',
        detail: 'A hash table only looks inside the *one* bucket that a key\'s hash code points to — if two objects are `equals()` but have different `hashCode()`s, a lookup for one after inserting the other computes a different bucket entirely and never even examines the bucket the object actually lives in, failing silently rather than throwing.',
      },
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
        detail: 'This bug is especially nasty because the entry is not lost — it is still physically present in the table, just permanently unreachable through normal lookups. Iterating the whole table will still find it, which is often how the bug is first discovered: a `get` fails but the key clearly shows up when dumping every entry.',
      },
      {
        kind: 'note',
        title: 'Average O(1) assumes a decent hash function — it is not automatic',
        text: 'The `O(1)` average-case bound is conditional on the hash function distributing keys roughly uniformly across buckets; a poor or adversarially-chosen hash function collapses every operation toward `O(n)`. This is why [[randomization-in-algorithms|hash seed randomization]] exists — it prevents an attacker who knows the hash algorithm from choosing inputs that all collide on purpose.',
        detail: 'Randomizing the seed per JVM run means an attacker who knows the exact hash algorithm still cannot predict which inputs will collide, because the seed differs on every run — the same crafted "collision attack" input set that would degrade one running instance to O(n) does nothing on another instance with a different random seed.',
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
      {
        text: 'Each edge is labeled with one character; a path from the root spells out a prefix, and marked nodes indicate a complete stored word',
        detail: 'The "marked node" distinction matters because a prefix and a full word are different things — the path for "car" passes through the same nodes as "cart", so a boolean flag on each node is what distinguishes "car is a stored word" from "car merely happens to be a prefix of another stored word."',
      },
      {
        text: 'Search/insert/delete are `O(L)` where `L` is the key length — independent of how many other keys are in the trie',
        detail: 'Every operation walks exactly one character at a time down from the root, following (or creating) one edge per character of the key — the number of steps depends only on how long the key itself is, never on how many other keys share the trie, which is a qualitatively different scaling behavior from a hash table or BST.',
      },
      {
        text: 'Shared prefixes are stored once, which can save substantial memory over storing full strings redundantly',
        detail: 'A dictionary of "car", "cart", "care", and "careful" only needs the nodes for "c-a-r" once, with the remaining suffixes branching off from that shared path — storing each string as an independent character array would duplicate that common prefix four times over.',
      },
      {
        text: 'Natural fit for autocomplete, spell-checkers, and IP routing (longest-prefix match)',
        detail: 'All three applications are fundamentally prefix queries in disguise: autocomplete asks "what words start with what the user typed so far," a spell-checker asks "is this exact sequence of characters a valid path," and IP routing asks "which stored network prefix is the longest match for this address" — a trie answers all of these by construction, not by extra logic layered on top.',
      },
      {
        text: 'A hash table beats a trie for plain exact-match lookup; a trie wins when you need prefix queries a hash table cannot answer at all',
        detail: 'A hash table\'s exact-match lookup is O(L) to hash the string plus O(1) average to find the bucket, which is at least as fast as a trie\'s O(L) walk and has much lower constant-factor overhead per node — the trie only pulls ahead once the actual question is about prefixes, which a hash table has no way to answer without scanning every key.',
      },
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
        detail: 'This is the same tension as every space/time tradeoff in this domain: a generic `HashMap` per node is flexible (works for any alphabet, including Unicode) but pays hash-table overhead at every single node, while a fixed array is denser and cache-friendlier for a small known alphabet but wastes memory on empty slots when most nodes have far fewer than 26 children — which one wins depends on the actual branching factor of the real data.',
      },
      {
        kind: 'note',
        title: 'Relation to string matching',
        text: 'A trie built from a *dictionary* of patterns is the basis of the Aho–Corasick algorithm, which finds all occurrences of many patterns in a text simultaneously in linear time — a generalization of the single-pattern matching covered in [[string-matching-algorithms]].',
        detail: 'Searching for many patterns independently (once per pattern) would cost time proportional to the number of patterns times the text length. Aho-Corasick instead builds one trie over all patterns plus failure links between nodes (similar in spirit to KMP\'s failure function), letting a single pass over the text find every match to every pattern at once.',
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
      {
        text: 'Backed by a simple array: each element points to a parent; a root (self-parent) identifies its group',
        detail: 'This is a much lighter-weight representation than an explicit set data structure per group — there is no separate "which set" bookkeeping to maintain, membership and group identity are both encoded implicitly through the parent-pointer chain, and a root pointing to itself is simply the base case of that chain.',
      },
      {
        text: '`find(x)` walks parent pointers to the root; `union(x, y)` links one root under the other',
        detail: 'Both operations reduce to the same primitive: `find` answers "which group" by walking up to the root that identifies the group, and `union` merges two groups by making one root point to the other — after that single pointer change, every element in the smaller group\'s tree now resolves to the bigger group\'s root when `find` walks up.',
      },
      {
        text: '**Union by rank/size**: always attach the smaller tree under the bigger one, keeping trees shallow',
        detail: 'Attaching the bigger tree under the smaller one (the wrong way round) would increase the height of every element in the bigger tree by one — doing it the right way round means only the smaller tree\'s elements gain a level, which bounds how tall any tree can get after a sequence of unions and is what keeps `find` fast.',
      },
      {
        text: '**Path compression**: during `find`, point every visited node directly at the root, flattening future lookups',
        detail: 'A `find` call already has to walk the whole chain up to the root anyway — path compression is essentially free extra work done while that walk is happening, re-pointing every node passed through directly at the root, so any future `find` starting from one of those nodes takes just one hop instead of retracing the whole original chain.',
      },
      {
        text: 'Both optimizations together give `O(α(n))` amortized per operation, where `α` is the inverse Ackermann function — practically a constant ≤ 4 for any *n* that fits in the universe',
        detail: 'The inverse Ackermann function grows so absurdly slowly that it does not exceed 4 until n is larger than the number of atoms in the observable universe — which is the mathematical way of saying that, for every input size that could ever occur in practice, union-find\'s "not quite O(1)" bound behaves exactly like O(1) would.',
      },
      {
        text: 'The classic application is Kruskal\'s minimum spanning tree algorithm ([[minimum-spanning-trees]]) and cycle detection in undirected graphs',
        detail: 'Both applications rely on the same core question union-find answers cheaply: "are these two vertices already connected?" Kruskal\'s algorithm adds edges in increasing weight order and uses exactly that question to skip any edge that would connect two vertices already in the same group, which is precisely how it avoids forming a cycle.',
      },
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
        detail: 'Union by rank alone still guarantees O(log n) height, which sounds fine — but path compression is what pushes the bound down from O(log n) to the near-constant O(α(n)), and since implementing it costs only a couple of extra lines inside `find`, there is no real engineering tradeoff being made by omitting it, only lost performance.',
      },
      {
        kind: 'note',
        title: 'Detecting a cycle in an undirected graph in near-linear time',
        text: 'Process edges one at a time: for edge `(u, v)`, if `find(u) == find(v)` already, adding this edge would close a cycle — otherwise, `union(u, v)`. This single idea is both a standalone cycle-detection algorithm and the core of Kruskal\'s [[minimum-spanning-trees|minimum spanning tree]] algorithm, which adds edges in increasing weight order and skips any that would form a cycle.',
        detail: 'The insight is that `find(u) == find(v)` before processing edge (u, v) means u and v are already connected through some other path of previously-processed edges — adding this edge would create a second path between them, which is precisely what a cycle is. No actual cycle-tracing or graph search is needed to detect it.',
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
      {
        text: 'Adjacency list: array/map of vertices, each holding a list of its neighbors — `O(V + E)` space, ideal for sparse graphs',
        detail: 'The space cost is additive (V for the vertex entries, E for the edge entries scattered across their neighbor lists) rather than multiplicative, because each edge is stored only where it actually exists — a vertex with no neighbors costs almost nothing, unlike a matrix representation where every possible pair costs a cell regardless of whether an edge is there.',
      },
      {
        text: 'Adjacency matrix: `V × V` boolean/weight grid — `O(V²)` space regardless of edge count, but `O(1)` edge-existence lookup',
        detail: 'The grid allocates a cell for every possible pair of vertices up front, whether or not an edge exists there — that fixed V² cost is what buys direct-index O(1) lookup for "does this specific edge exist," at the price of paying for the full grid even when the graph has very few actual edges.',
      },
      {
        text: 'Iterating all neighbors of a vertex: `O(deg(v))` with a list, `O(V)` with a matrix — the list wins whenever the graph is sparse',
        detail: 'A list only stores what actually exists, so iterating a vertex\'s neighbors costs exactly as many steps as it has neighbors. A matrix has to scan an entire row of V cells to find which ones are set, even if the vertex has only one or two real neighbors — the difference is invisible for a dense graph but severe for a sparse one.',
      },
      {
        text: 'Directed vs. undirected: undirected edges appear in both endpoints\' adjacency lists (or are symmetric in the matrix)',
        detail: 'An undirected edge (u, v) means "u can reach v" and "v can reach u" simultaneously — representing that with a single directed entry would only capture half the relationship, so the standard approach records the edge on both endpoints\' neighbor lists (or, in a matrix, sets both `[u][v]` and `[v][u]`).',
      },
      {
        text: 'Weighted graphs store a weight alongside each edge — the list holds `(neighbor, weight)` pairs; the matrix stores weights instead of booleans',
        detail: 'The underlying structure barely changes to support weights — a list entry that was just "neighbor" becomes "neighbor plus a number," and a matrix cell that was true/false becomes a weight value (with a sentinel like infinity or -1 marking "no edge"). Every weighted-graph algorithm (Dijkstra, MST) is built directly on top of this small extension.',
      },
      {
        text: 'Most real-world graphs (social networks, road networks, dependency graphs) are sparse — `E` is much closer to `V` than to `V²` — which is why adjacency lists are the default',
        detail: 'A person on a social network has hundreds of connections, not hundreds of millions — E scales roughly linearly with V in practice, nowhere near the V² a fully-connected graph would have. Since real graphs are almost always shaped this way, the adjacency list\'s O(V + E) space and iteration cost dominates the matrix\'s O(V²) in the vast majority of practical cases.',
      },
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
        detail: 'The word "simplicity" is doing a lot of misleading work here — a matrix\'s code is often marginally simpler to write (direct 2D indexing instead of walking a list), but that simplicity evaporates the moment V grows past a few thousand and the O(V²) memory cost becomes the dominant problem, at which point the "simple" version simply does not run.',
      },
      {
        kind: 'note',
        title: 'This is the same ADT-vs-implementation split as everywhere else',
        text: '"Graph" is the abstract data type ([[abstract-data-types]]); adjacency list and adjacency matrix are two implementations with different performance shapes for the exact same operations. Choosing between them follows the same discipline as choosing between an `ArrayList` and a `LinkedList`: understand the workload\'s access pattern first.',
        detail: 'The recurring lesson across this whole domain is that an ADT specifies *what* operations are available (add a vertex, check an edge, list neighbors) without dictating *how* they are implemented — and every implementation choice trades one operation\'s speed against another\'s, so the right pick always depends on which operations the actual workload calls most often.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 4.1 — Undirected Graphs' },
      { book: 'dsa-goodrich', chapter: 'Ch. 14.1 — Graphs' },
    ],
    related: ['abstract-data-types', 'graph-traversal-bfs-dfs', 'disjoint-sets-union-find'],
  },
]
