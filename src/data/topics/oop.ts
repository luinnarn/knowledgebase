import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'classes-objects',
    domainId: 'oop',
    title: 'Classes & Objects',
    summary:
      'A class is a blueprint: state (fields) plus behavior (methods) behind an access-controlled boundary. Objects are created with `new`, live on the heap, and are always handled through references.',
    keyPoints: [
      {
        text: 'Object variables are **references** — assignment aliases, it never copies the object',
        detail: '`Employee a = b;` does not create a second employee — it makes `a` and `b` two names for the exact same object, so a mutation through either variable is visible through both. This is the root of most "why did my object change unexpectedly" bugs for people coming from value-semantics languages.',
      },
      {
        text: 'Encapsulation: private fields + public methods define a stable contract',
        detail: 'The contract is what lets the internal representation change without breaking callers — a class can switch from storing a `List` to a `Set` internally, and as long as the public method signatures and behavior stay the same, no caller notices or needs to change. Public fields make that impossible: the representation *is* the contract.',
      },
      {
        text: 'Access levels: `private` → package-private (default) → `protected` → `public`',
        detail: 'Each level widens visibility monotonically outward: private (this class only), package-private (same package), protected (package plus subclasses anywhere), public (everyone). The rule of thumb is to start at the narrowest level that works and widen only when a real caller outside that boundary needs access — narrowing later is a breaking change, widening is not.',
      },
      {
        text: 'Method parameters are passed **by value** — including reference values',
        detail: 'What gets copied for an object argument is the reference itself, not the object it points to — the method receives its own copy of the pointer, pointing at the same object. That is enough to let the method mutate the object\'s fields, but reassigning the parameter inside the method only redirects the local copy, leaving the caller\'s variable untouched.',
      },
      {
        text: 'Getters must not leak references to mutable internals',
        detail: 'Returning the actual internal `List` or array lets any caller mutate your object\'s state from outside, completely bypassing whatever invariants your methods were supposed to enforce — the encapsulation boundary exists on paper but not in practice. Returning a copy or an unmodifiable view keeps the boundary real.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A well-encapsulated class',
        code: 'public class Employee {\n    private String name;\n    private double salary;\n\n    public Employee(String name, double salary) {\n        this.name = name;\n        this.salary = salary;\n    }\n\n    public String getName() { return name; }\n    public double getSalary() { return salary; }\n\n    public void raiseSalary(double byPercent) {\n        salary += salary * byPercent / 100;\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Encapsulation is the whole game: fields stay `private`, and the public methods form a **contract** you can keep while freely changing the representation. Effective Java Item 15 ("minimize accessibility") and Item 16 ("use accessor methods, not public fields") are the two rules that make evolution possible.',
      },
      {
        kind: 'subheading', text: 'References, aliasing, and parameter passing' },
      {
        kind: 'code',
        title: 'Java is strictly pass-by-value',
        code: 'void raise(Employee e) { e.raiseSalary(10); }   // works: e is a COPY of the reference,\n                                                 // but both copies point to the same object\nvoid swap(Employee a, Employee b) {\n    Employee tmp = a; a = b; b = tmp;            // useless: swaps local copies only\n}',
      },
      {
        kind: 'paragraph',
        text: 'A method receives copies of its arguments. For objects, the copy is the **reference**, so methods can mutate the object it points to — but can never make the caller\'s variable point elsewhere. "Java is pass-by-reference" is the most persistent falsehood in Java folklore.',
      },
      {
        kind: 'pitfall',
        title: 'Leaking mutable state through getters',
        text: 'Returning a reference to a mutable field hands callers a remote control for your internals. Return a copy, an unmodifiable view, or use immutable types for fields (`LocalDate`, not `Date`).',
        code: 'public List<Item> getItems() {\n    return List.copyOf(items);   // or Collections.unmodifiableList(items)\n}',
        detail: 'This is exactly the same failure mode as a mutator parameter that is stored without copying, just at the exit door instead of the entry door — any code that later calls `getItems().add(x)` is silently mutating the object\'s real internal list, something no reviewer would approve if it were a public field doing the same thing directly.',
      },
      {
        kind: 'bestPractice',
        title: 'Design hints (Core Java ch. 4.11)',
        text: 'Keep data private; always initialize fields; don\'t use too many basic types together (group them into a class); not every field needs an accessor; split classes that do too much; make names reflect responsibilities.',
        detail: '"Too many basic types together" is a real smell worth naming: a method taking five `String`/`int` parameters in a row is an accident waiting to happen at every call site (easy to pass them in the wrong order, and the compiler cannot catch it), whereas grouping related primitives into a small class gives the compiler something to actually type-check.',
      },
      {
        kind: 'note',
        title: 'null and Optional',
        text: 'Every reference can be `null`; dereferencing null throws `NullPointerException` — since Java 14 the message helpfully names the null variable. For "may be absent" return values, consider [[optional]]; for parameters, validate with `Objects.requireNonNull(param, "message")` at method entry (EJ Item 49).',
        detail: 'Validating at method entry rather than letting a null propagate several calls deep is what turns a confusing NPE far from the actual mistake into an immediate, clearly-attributed failure right where the bad argument was passed — the message names both the parameter and the fact that it was the null culprit.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 4 — Objects and Classes' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
      { book: 'effective-java', chapter: 'Items 15, 16, 49' },
    ],
    related: ['constructors-initialization', 'immutability-class-design', 'inheritance-polymorphism'],
  },

  {
    id: 'constructors-initialization',
    domainId: 'oop',
    title: 'Object Creation & Initialization',
    summary:
      'Constructors initialize objects, but they are not the only way to get one — static factory methods and builders often serve callers better. Know the initialization order, and reach for a builder when parameters pile up.',
    keyPoints: [
      {
        text: 'No constructor written → compiler provides a no-arg constructor; write any → it disappears',
        detail: 'The moment you write even one constructor, you are telling the compiler you have taken over construction entirely — the implicit no-arg one is withdrawn, which is why adding a parameterized constructor to a class that relied on the implicit default one is a source-breaking change for any code still calling `new Foo()`.',
      },
      {
        text: 'Static factories beat constructors: they have names, can cache, and can return subtypes (EJ 1)',
        detail: 'A constructor is always named after the class and always returns exactly that class, which is two constraints a static factory does not have — `probablePrime` says what it does in a way `new BigInteger(...)` cannot, `valueOf` can return a cached instance instead of allocating, and a factory declared to return an interface can pick whichever implementation fits the arguments.',
      },
      {
        text: 'Builder pattern for many/optional parameters (EJ 2)',
        detail: 'Once a class has several optional parameters, constructor overloads multiply combinatorially (the "telescoping constructor" problem) and setter-based construction leaves the object in an invalid half-built state between calls. A builder collects all the parameters through named, chainable calls and only produces the object once, fully formed, in `build()`.',
      },
      {
        text: 'Initialization order: field initializers & init blocks in source order, then the constructor body',
        detail: 'This ordering is deterministic and textual, not logical — two field initializers run in the order they are *written* in the file, regardless of which fields logically depend on which. A field initializer that reads another field declared later in the source sees that field\'s default value (0/null/false), not whatever its own initializer would eventually set it to.',
      },
      {
        text: '`this(...)` chains to another constructor of the same class',
        detail: 'Delegating to a "master" constructor from the others means validation and setup logic exists in exactly one place — every other constructor just supplies defaults for the parameters it omits, so a bug fix or an added check in the master constructor automatically applies to every entry point instead of needing to be copied into each overload.',
      },
    ],
    blocks: [
      {
        kind: 'bestPractice',
        title: 'Consider static factory methods instead of constructors (EJ Item 1)',
        text: 'Named creation reads better (`BigInteger.probablePrime(...)`), instances can be cached (`Integer.valueOf`, `Boolean.valueOf`), the return type can be an interface or subtype (`List.of`, `EnumSet.of` picks RegularEnumSet vs JumboEnumSet), and the type can vary per call. Convention names: `of`, `from`, `valueOf`, `getInstance`, `newInstance`, `create`.',
        code: 'LocalDate date = LocalDate.of(2026, 7, 7);\nList<String> sizes = List.of("S", "M", "L");\nOptional<User> u = Optional.empty();',
        detail: 'The one real cost is discoverability: constructors are always listed together in IDE autocomplete and Javadoc under a fixed, obvious heading, while static factories are just regular methods scattered among all the others — a reader has to already know the convention names (`of`, `from`, `getInstance`) to go looking for them.',
      },
      {
        kind: 'bestPractice',
        title: 'Use a builder for many constructor parameters (EJ Item 2)',
        text: 'Telescoping constructors (1, 2, 3, 4 params…) become unreadable and error-prone; JavaBeans-style setters leave the object inconsistent mid-construction. A builder gives named, optional parameters and an immutable result.',
        code: 'NutritionFacts cola = new NutritionFacts.Builder(240, 8)\n        .calories(100)\n        .sodium(35)\n        .carbohydrate(27)\n        .build();',
        detail: 'The JavaBeans alternative (a no-arg constructor plus setters) has a worse problem than verbosity: the object is visibly mutable and sits in an invalid, partially-configured state between the constructor call and the last setter call, which rules out making the class immutable and opens a window for another thread to observe a half-built object.',
      },
      { kind: 'subheading', text: 'Initialization order' },
      {
        kind: 'paragraph',
        text: 'When `new` runs: fields get default values → field initializers and instance initializer blocks execute **in source order** → the constructor body runs. Static fields/blocks run once, when the class is first loaded (see [[class-loading]]). Overloaded constructors can delegate with `this(...)` as the first statement — one master constructor avoids duplication.',
      },
      {
        kind: 'code',
        title: 'Constructor chaining',
        code: 'public class Session {\n    private final String id;\n    private final Duration timeout;\n\n    public Session(String id, Duration timeout) {\n        this.id = Objects.requireNonNull(id);\n        this.timeout = timeout;\n    }\n\n    public Session(String id) {\n        this(id, Duration.ofMinutes(30));   // delegate to the master constructor\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Calling overridable methods from constructors',
        text: 'A superclass constructor runs **before** subclass fields are initialized. If it calls a method the subclass overrides, that override executes against uninitialized state. Constructors should only call `private`, `static`, or `final` methods (EJ Item 19).',
        detail: 'The sequence is: superclass constructor runs first (that includes any overridable method call inside it), and only afterward do the subclass\'s own field initializers run — so if the superclass constructor invokes an overridden method, that override executes while every subclass field it might rely on is still at its default value (0/null/false), not whatever the subclass constructor would eventually set.',
      },
      {
        kind: 'bestPractice',
        title: 'Avoid finalizers and cleaners; prefer try-with-resources (EJ Items 8–9)',
        text: 'Finalization is unpredictable, slow, and deprecated for removal. For resources, implement `AutoCloseable` and rely on [[catching-cleanup|try-with-resources]]; use `Cleaner` only as a safety net.',
        detail: 'The unpredictability is fundamental, not incidental: nothing guarantees a finalizer runs promptly, or at all, since it depends on the garbage collector deciding to reclaim the object — a file handle or socket "cleaned up" by a finalizer can stay open for an unbounded, unknowable amount of time after the object becomes unreachable, which is disqualifying for anything resource-constrained.',
      },
      {
        kind: 'note',
        title: 'Singletons and noninstantiability',
        text: 'Enforce a singleton with an `enum` (simplest, serialization-safe — EJ Item 3) or a private constructor. Utility classes (all-static) get a private constructor that throws, preventing accidental instantiation (EJ Item 4). Prefer dependency injection over hardwired singletons for testability (EJ Item 5).',
        detail: 'A single-element enum gets serialization-safety and reflection-resistance for free from the language itself — the JVM guarantees exactly one instance per enum constant even across serialization round-trips, a guarantee a hand-written private-constructor singleton has to defend manually (implementing `readResolve`, guarding against reflective constructor access) and can still get wrong.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 4.6 — Object Construction' },
      { book: 'effective-java', chapter: 'Items 1–5, 8, 9' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['classes-objects', 'immutability-class-design', 'catching-cleanup'],
  },

  {
    id: 'static-members',
    domainId: 'oop',
    title: 'Static Members',
    summary:
      'Static fields and methods belong to the class, not to any instance — shared state, factory methods, utilities, and constants. Use them deliberately: statics are procedural islands in an object-oriented sea.',
    keyPoints: [
      {
        text: 'One copy per class, shared by all instances (per class loader)',
        detail: 'Every instance reads and writes the *same* storage location for a static field — there is no per-object copy the way there is for instance fields. "Per class loader" matters in app servers and plugin systems where the same class can be loaded twice by different loaders, producing two genuinely separate static states that look identical in code but do not share memory.',
      },
      {
        text: 'Static methods cannot touch instance state or `this`',
        detail: 'A static method is not associated with any particular object — it is called on the class itself — so there is no receiver object for `this` to refer to and no instance fields in scope. This is also why static methods cannot be overridden in the polymorphic sense: calling one is resolved at compile time against the declared type, not dispatched at runtime.',
      },
      {
        text: 'Constants: `static final`, `UPPER_SNAKE_CASE`',
        detail: 'The `static` half means one shared value instead of a per-instance copy; the `final` half means the compiler can enforce that it never changes after initialization, and for primitive/String constants can even inline the literal value at every use site. `UPPER_SNAKE_CASE` is a convention that visually flags "this is a fixed constant" wherever it appears in code.',
      },
      {
        text: 'Static initializer blocks run once at class initialization',
        detail: 'Class initialization happens lazily, the first time the class is actively used (not merely referenced) — first instantiation, first static method call, or first static field access — and the JVM guarantees it happens exactly once, before any other thread can observe the class\'s static state, which is a genuine (if narrow) thread-safety guarantee for free.',
      },
      {
        text: 'Mutable static state is a concurrency hazard and a testing obstacle',
        detail: 'Because every thread in the JVM shares the exact same static storage, an unsynchronized mutable static field is a data race waiting to happen the moment more than one thread touches it. It is equally corrosive to tests: a test that mutates shared static state can leave residue that makes a later, unrelated test fail depending purely on execution order.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Statics in action',
        code: 'public class IdGenerator {\n    public static final int MAX_ID = 1_000_000;      // constant\n    private static final AtomicLong next = new AtomicLong(1); // shared, thread-safe\n\n    public static long nextId() {                     // class-level behavior\n        return next.getAndIncrement();\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Typical legitimate uses: constants, pure utility functions (`Math.max`), and static factory methods ([[constructors-initialization]]). The `main` method is static precisely because no object exists before the program starts.',
      },
      {
        kind: 'pitfall',
        title: 'Mutable global state',
        text: 'A mutable `static` field is shared by every thread in the JVM — unsynchronized access is a data race ([[thread-safety]]), and hidden global state makes unit tests order-dependent. If you must share, make it immutable, or guard it and document the synchronization policy.',
        detail: 'The test-ordering symptom is a strong tell: if test A passes alone but fails only when run after test B, a shared mutable static that B modifies and never resets is the first thing to suspect — the tests are not actually independent, they are silently coupled through global state that the test framework has no visibility into.',
      },
      {
        kind: 'pitfall',
        title: 'Calling statics through instances',
        text: '`employee.getCount()` compiles when `getCount` is static, but resolves against the **declared type at compile time** — polymorphism does not apply. Always invoke statics through the class name: `Employee.getCount()`.',
        detail: 'This compiles specifically because the compiler is lenient about it, but it is misleading: writing `employee.getCount()` visually implies dynamic dispatch on the runtime type of `employee`, exactly like an instance method call, when in fact the compiler resolved which method to call using `employee`\'s *declared* type at compile time — the object\'s actual runtime type never enters into it.',
      },
      {
        kind: 'note',
        title: 'Static imports',
        text: '`import static java.util.stream.Collectors.*` lets you write `collect(toList())`. Great for fluent APIs and test assertions; use sparingly elsewhere so readers can find definitions.',
        detail: 'The tradeoff is discoverability versus brevity: a bare `toList()` reads cleanly in a stream chain, but a reader (or an IDE without full type inference context) has to know it came from `Collectors` rather than being a local method — fine for a handful of extremely common names, corrosive if applied broadly across unrelated utility classes.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 4.4 — Static Fields and Methods' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['constructors-initialization', 'thread-safety', 'enums'],
  },

  {
    id: 'inheritance-polymorphism',
    domainId: 'oop',
    title: 'Inheritance & Polymorphism',
    summary:
      'Inheritance (`extends`) models strict is-a relationships: subclasses inherit and override behavior, and dynamic dispatch picks the override at runtime. Powerful — and so easily misused that the default advice is: design for it or prohibit it.',
    keyPoints: [
      {
        text: 'Dynamic dispatch: the runtime type of the object decides which override runs',
        detail: 'This is what makes polymorphism work: code written against the declared type `Employee` automatically picks up whatever behavior the *actual* object — which might be a `Manager` or any other subtype — provides, without the calling code needing to know or check which subtype it has. The decision happens at every call, based on the object, not the variable.',
      },
      {
        text: '`super.method()` calls the superclass version; `super(...)` must be the first constructor statement',
        detail: 'Both exist to let a subclass build on top of its parent rather than replace it wholesale — `super.method()` reuses the parent\'s logic inside an override instead of duplicating it, and `super(...)` being forced to run first guarantees the object is a valid, fully-initialized instance of its superclass before any subclass-specific setup begins.',
      },
      {
        text: 'Overrides can widen visibility and narrow the return type (covariant returns) — never the reverse',
        detail: 'Both restrictions protect the same thing: callers who only know the superclass\'s contract must never be surprised. Narrowing visibility would let an override hide a method callers expect to find; widening the return type would hand callers something less specific than the contract promised. Widening visibility and narrowing the return type are safe because they only ever give callers *more* than the contract required.',
      },
      {
        text: 'Use `@Override` on every override so the compiler catches signature typos (EJ 40)',
        detail: 'Without the annotation, a mistyped method signature (wrong parameter type, misspelled name) silently compiles as a brand-new overload instead of an override — the compiler has no way to know you intended to override anything, so it just accepts a new method and the "override" never actually fires. `@Override` tells the compiler to verify a superclass method with that exact signature actually exists.',
      },
      {
        text: '`final` classes/methods forbid subclassing/overriding',
        detail: 'Sealing off extension is a design decision, not a default — it tells readers and the compiler "this behavior is guaranteed not to change underneath you," which matters for security-sensitive classes and for any method whose correctness other code silently depends on (immutability guarantees, in particular, only hold if a class cannot be subclassed to add mutable state).',
      },
      {
        text: 'Prefer pattern matching `instanceof` when you must check types',
        detail: 'The classic `instanceof` followed by a manual cast is really two redundant steps — the compiler already proved the type during the `instanceof` check, so pattern matching just lets you name that already-proven fact instead of asking for a second, logically unnecessary cast that could theoretically still fail (it can\'t, but the old syntax couldn\'t express that).',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Subclassing and overriding',
        code: 'public class Manager extends Employee {\n    private double bonus;\n\n    public Manager(String name, double salary) {\n        super(name, salary);          // must run the superclass constructor first\n    }\n\n    @Override\n    public double getSalary() {\n        return super.getSalary() + bonus;   // reuse, then extend\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: '**Polymorphism**: an `Employee` variable can refer to a `Manager`; calling `getSalary()` dispatches on the actual object at runtime. Liskov substitution is the design test — anywhere an `Employee` works, a `Manager` must work too. If a subclass would need to "un-inherit" behavior, the is-a relationship is wrong: reach for [[composition-vs-inheritance|composition]] instead.',
      },
      {
        kind: 'pitfall',
        title: 'Inheritance breaks encapsulation across package boundaries',
        text: 'A subclass depends on implementation details of its superclass — Effective Java\'s canonical example: extending `HashSet` to count insertions double-counts because `addAll` internally calls `add`. Either **design and document for inheritance** (specify self-use of overridable methods, EJ Item 19) or mark the class `final` / make constructors private.',
        detail: 'The double-count happens because the subclass\'s override of `add` fires every time `HashSet`\'s own `addAll` implementation calls `add` internally, which is an implementation detail never promised by the `Set` contract — a future JDK release that reimplements `addAll` without calling `add` would silently change the subclass\'s counting behavior even though nothing in the *documented* contract changed.',
      },
      { kind: 'subheading', text: 'Casts and type tests' },
      {
        kind: 'code',
        title: 'Pattern matching for instanceof (Java 16+)',
        code: 'if (staff instanceof Manager m) {      // test + cast + bind in one step\n    m.setBonus(5000);\n}',
      },
      {
        kind: 'paragraph',
        text: 'Frequent `instanceof` chains signal a design smell — usually the logic belongs in an overridden method (tell, don\'t ask), or the hierarchy should be a sealed type with an exhaustive `switch` ([[sealed-types-overview]]). Abstract classes hold shared code and abstract methods that subclasses must implement; a class with any abstract method is itself abstract and uninstantiable.',
      },
      {
        kind: 'bestPractice',
        title: 'Design hints for inheritance (Core Java ch. 5.11)',
        text: 'Place common operations and fields in the superclass; don\'t use protected fields (subclasses and same-package code can corrupt them); use inheritance only for genuine is-a; don\'t change the expected behavior in an override; eliminate `instanceof` chains with polymorphism.',
        detail: '"Don\'t change the expected behavior in an override" is the Liskov substitution principle in practice — an override that returns wildly different results, throws where the superclass never would, or violates the same postconditions the superclass promised, breaks every caller that was written trusting the superclass\'s contract, even though the code compiles fine.',
      },
      {
        kind: 'note',
        title: 'Every class extends Object',
        text: 'The root supplies `equals`, `hashCode`, `toString`, `getClass`, `clone`, `wait/notify`. Overriding the first three correctly is its own discipline — see [[object-contracts]].',
        detail: 'Every one of these methods comes with a documented contract that generic code (collections, frameworks, logging) relies on without knowing anything else about your class — a `HashMap` trusts that `equals`/`hashCode` are consistent, `Object.toString()`\'s default (class name plus hash) is what shows up in every debugger and log line until you override it.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 5 — Inheritance' },
      { book: 'effective-java', chapter: 'Items 18, 19, 40' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['composition-vs-inheritance', 'object-contracts', 'interfaces', 'sealed-types-overview'],
  },

  {
    id: 'object-contracts',
    domainId: 'oop',
    title: 'Object Contracts: equals, hashCode, toString, Comparable',
    summary:
      'The methods every class inherits from `Object` come with strict contracts. Get `equals`/`hashCode` wrong and hash-based collections silently misbehave; get `compareTo` wrong and sorted collections do. Records give you all of it for free.',
    keyPoints: [
      {
        text: '`equals` must be reflexive, symmetric, transitive, consistent, and non-null',
        detail: 'These five properties are exactly what every hash-based and sorted collection assumes when it stores and looks up your objects — break symmetry and `a.equals(b)` can disagree with `b.equals(a)` depending on which side of a collection lookup you are on; break transitivity and membership checks can behave inconsistently depending on which two objects happen to be compared first.',
      },
      {
        text: '**Equal objects must have equal hash codes** — override both or neither',
        detail: 'A hash-based collection uses `hashCode` to pick a bucket and `equals` only to disambiguate within that bucket — if two "equal" objects hash differently, the collection may look for one in a bucket the other was never placed in, and `map.get(equalKey)` returns null for a key that is genuinely equal to one already stored, silently.',
      },
      {
        text: 'A mutated key whose hashCode changes is lost to its `HashMap`',
        detail: 'The map computed and stored the key\'s bucket index once, at insertion time, based on the hash code at that moment — if the key object is later mutated in a way that changes its hash code, the map has no way to know the bucket is now wrong, and every future lookup for that key computes a *different* bucket than the one the entry actually lives in.',
      },
      {
        text: 'Always override `toString` for debuggability (EJ 12)',
        detail: 'The inherited default (`ClassName@hexHashCode`) tells you nothing about the object\'s actual state — every debugger watch expression, every log line, every failed assertion message that prints an object relies on `toString` to be the difference between "useful diagnostic information" and "a meaningless memory address."',
      },
      {
        text: '`compareTo` should be consistent with `equals`; use `Comparator` combinators',
        detail: 'Consistency here means `a.compareTo(b) == 0` exactly when `a.equals(b)` is true — when the two disagree, sorted collections (which use `compareTo` for identity, not `equals`) and hash-based collections (which use `equals`) can treat the same pair of objects as "the same" in one context and "different" in another, a split-brain that is notoriously hard to debug.',
      },
      {
        text: 'Records generate correct `equals`/`hashCode`/`toString` automatically',
        detail: 'Because a record\'s components are fixed and immutable, the compiler can derive componentwise implementations that are correct by construction and cannot drift out of sync — add a component to a hand-written class and it is easy to forget updating `equals`; add one to a record and the generated methods automatically include it.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The canonical equals/hashCode pair',
        code: '@Override\npublic boolean equals(Object other) {\n    if (this == other) return true;\n    if (!(other instanceof Point p)) return false;   // also rejects null\n    return x == p.x && y == p.y;\n}\n\n@Override\npublic int hashCode() {\n    return Objects.hash(x, y);\n}',
      },
      {
        kind: 'paragraph',
        text: 'Why the pairing matters: `HashMap` first locates the bucket by `hashCode`, then confirms with `equals` ([[hashing-internals]]). Equal-but-different-hash objects end up in different buckets — `map.get(key)` returns `null` for a key that is "equal" to one inside. This is the single most common cause of mysterious collection bugs.',
      },
      {
        kind: 'pitfall',
        title: 'Symmetry breaks with instanceof + subclassing',
        text: 'If `ColorPoint extends Point` adds a field to `equals`, then `point.equals(colorPoint)` and `colorPoint.equals(point)` disagree — violating symmetry. There is **no way** to extend an instantiable class with a new value component while preserving the equals contract (EJ Item 10). Favor composition, or use `getClass()` equality when subclass mixing is truly meaningless.',
        detail: 'The asymmetry is structural: `point.equals(colorPoint)` only compares the `Point` fields and says yes, while `colorPoint.equals(point)` additionally checks the color field and says no — there is no way to make both directions agree once one side has strictly more state to compare than the other, which is why this is a fundamental limitation of extending instantiable classes with new fields, not a bug to be fixed.',
      },
      {
        kind: 'pitfall',
        title: 'equals(Object), not equals(MyType)',
        text: 'Declaring `public boolean equals(Point other)` **overloads** instead of overriding — collections keep calling the inherited identity-based `equals(Object)`. `@Override` catches this at compile time (EJ Item 40).',
        detail: 'A collection like `HashMap` always calls `equals(Object)` because that is the signature declared in `Object` and the only one it knows about — a same-named method with a more specific parameter type is a completely separate overload the collection never calls, so your carefully-written equality logic silently never runs, and every lookup falls back to reference equality instead.',
      },
      { kind: 'subheading', text: 'Ordering with Comparable and Comparator' },
      {
        kind: 'code',
        title: 'Comparator combinators (EJ Item 14)',
        code: 'static final Comparator<Employee> BY_PAY_THEN_NAME =\n        Comparator.comparingDouble(Employee::getSalary).reversed()\n                  .thenComparing(Employee::getName);\n\nemployees.sort(BY_PAY_THEN_NAME);',
      },
      {
        kind: 'paragraph',
        text: 'Implement `Comparable` when the class has a natural order (`String`, `LocalDate`, `BigDecimal` do). Never compute `a - b` for int comparison — it overflows; use `Integer.compare(a, b)`. Sorted collections use `compareTo` **instead of** `equals` for membership ([[sorted-collections]]), so inconsistency between the two produces different behavior in `TreeSet` vs `HashSet` — BigDecimal `2.0`/`2.00` being the classic demonstration.',
      },
      {
        kind: 'bestPractice',
        title: 'Let records do it (EJ-3rd-edition-era advice, modernized)',
        text: 'For value-like classes, a `record` generates componentwise `equals`, `hashCode`, and a readable `toString` that are correct by construction — and cannot drift when you add a field. See [[records]].',
        detail: 'This is the single biggest practical improvement records made over hand-written value classes: the entire "override equals and hashCode correctly, consistently, and keep them consistent as fields change" discipline this topic covers is simply not something you can get wrong for a record — the compiler derives it mechanically from the component list every time.',
      },
      {
        kind: 'note',
        title: 'clone is broken; skip it',
        text: 'Effective Java Item 13: the `Cloneable` architecture is fragile (no constructor call, shallow by default, checked exception noise). Prefer a **copy constructor** or copy factory: `new ArrayList<>(list)`.',
        detail: '`Cloneable` is an unusual interface in that it declares no methods — it only flips a bit `Object.clone()` checks at runtime, and getting the actual override right (deep-copying mutable fields, handling the checked `CloneNotSupportedException`, cooperating correctly with subclasses) is famously easy to get subtly wrong. A copy constructor is just an ordinary constructor, with none of that machinery.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 10–14, 40' },
      { book: 'core-java-1', chapter: 'Ch. 5.2 — Object: The Cosmic Superclass' },
    ],
    related: ['hashing-internals', 'sorted-collections', 'records', 'immutability-class-design'],
  },

  {
    id: 'interfaces',
    domainId: 'oop',
    title: 'Interfaces',
    summary:
      'An interface defines a type by its capabilities alone. Since Java 8 interfaces can carry `default` and `static` methods, but their essence is unchanged: they are contracts, and the preferred way to define types shared across a hierarchy.',
    keyPoints: [
      {
        text: 'A class implements any number of interfaces — Java\'s answer to multiple inheritance',
        detail: 'Java deliberately rejected multiple *class* inheritance (the diamond-inheritance ambiguity it creates) while still wanting a type to satisfy several unrelated contracts — a `Duck` can be both `Swimmable` and `Flyable` by implementing both interfaces, something a single-superclass hierarchy could never express cleanly.',
      },
      {
        text: '`default` methods add behavior without breaking implementors',
        detail: 'Before Java 8, adding a single new method to a published interface broke every existing implementation of it, since they were now missing a required override — a genuine barrier to evolving library interfaces. A `default` method supplies a fallback body, so old implementors keep compiling and behaving as before unless they choose to override the new method.',
      },
      {
        text: 'Interface fields are implicitly `public static final`; methods implicitly `public`',
        detail: 'An interface cannot hold per-instance state — it declares a type\'s capabilities, not its representation — so any field it declares can only be a shared constant, and the compiler enforces exactly that by silently adding `public static final` whether you write it or not. Methods default to `public` because a contract that could be hidden would not be much of a contract.',
      },
      {
        text: 'Prefer interfaces to abstract classes for defining types (EJ 20)',
        detail: 'A class can extend only one abstract class, so choosing an abstract class as the type locks every implementor into a single-inheritance slot they may need for something else — an interface costs implementors nothing in that regard, since a class can implement any number of them alongside whatever it already extends.',
      },
      {
        text: 'Use interfaces **only** to define types — no "constant interfaces" (EJ 22)',
        detail: 'An interface with nothing but constant fields, implemented purely so classes can access those constants unqualified, leaks implementation detail into the public API forever — every subclass is now permanently committed to exposing those constants as part of its own type, whether or not it actually wants that association.',
      },
      {
        text: 'Refer to objects by their interfaces: `List<String> list = new ArrayList<>()` (EJ 64)',
        detail: 'Declaring the variable\'s type as the interface rather than the concrete class means every line of code below that declaration only knows about `List` methods, not `ArrayList`-specific ones — which is what makes swapping the implementation later (to a `LinkedList`, say) a one-line change instead of an audit of every call site for accidental concrete-type usage.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Interface with a default method',
        code: 'public interface Measurable {\n    double getMeasure();                       // abstract — the contract\n\n    default boolean isLargerThan(Measurable other) {\n        return getMeasure() > other.getMeasure();  // free behavior for implementors\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Interfaces carry no instance state, which is why a class can implement many of them safely. Standard fine-grained examples: `Comparable`, `Iterable`, `AutoCloseable`, `Runnable` — and every functional interface used by lambdas ([[functional-interfaces]]). An interface with exactly one abstract method can be implemented by a lambda expression.',
      },
      {
        kind: 'paragraph',
        text: '**Default method conflict rules**: if a class inherits the same default method from two interfaces, it must override and choose (it may delegate via `Measurable.super.isLargerThan(other)`). If a superclass provides the method, the class wins over any interface default ("class wins").',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer interfaces to abstract classes (EJ Item 20)',
        text: 'A class can only extend once, so an abstract-class type locks implementors into your hierarchy. Define the type as an interface; if shared code is substantial, pair it with an abstract *skeletal implementation* (`AbstractList`, `AbstractMap`) that implementors may extend — the best of both.',
        detail: 'A skeletal implementation gives implementors an opt-in shortcut without forcing it: they can extend `AbstractList` and get most of `List` implemented for free by supplying just a couple of primitive methods, or they can implement `List` directly from scratch if `AbstractList` does not fit their class hierarchy — the interface stays the type, the abstract class is just convenience.',
      },
      {
        kind: 'pitfall',
        title: 'Design interfaces for posterity (EJ Item 21)',
        text: 'Default methods are injected into existing implementations without their knowledge — `Collection.removeIf` broke `SynchronizedCollection`\'s locking guarantee when it appeared. Adding a default method to a widely-implemented interface is never risk-free; get the interface right up front.',
        detail: 'The `SynchronizedCollection` break happened because the new default `removeIf` implementation calls the collection\'s iterator directly, bypassing whatever synchronized-wrapper logic the class relied on for thread safety — the default method author could not possibly know about every existing implementor\'s internal assumptions, which is exactly why retrofitting behavior onto a widely-implemented interface is inherently risky no matter how careful the default method\'s author is.',
      },
      {
        kind: 'note',
        title: 'Marker interfaces still matter (EJ Item 41)',
        text: 'An empty interface like `Serializable` tags a type in a way the compiler can check — something an annotation cannot do when a method should accept only tagged objects.',
        detail: 'The compile-time check is the whole advantage: a method parameter typed `Serializable` rejects a non-serializable argument at the call site, at compile time — an equivalent marker annotation could only be checked at runtime (or via a separate static analysis pass), because annotations are not part of the type system the compiler enforces assignability against.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 6.1 — Interfaces' },
      { book: 'effective-java', chapter: 'Items 20–22, 41, 64' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['lambdas', 'functional-interfaces', 'composition-vs-inheritance', 'inheritance-polymorphism'],
  },

  {
    id: 'inner-nested-classes',
    domainId: 'oop',
    title: 'Nested & Inner Classes',
    summary:
      'Classes can be declared inside classes: static nested classes are just namespaced helpers, inner classes capture an enclosing instance, and local/anonymous classes live inside methods. Default to static (EJ 24); lambdas replaced most anonymous classes.',
    keyPoints: [
      {
        text: '**Static nested**: no outer-instance reference — the default choice (EJ 24)',
        detail: 'A static nested class is really just an ordinary top-level class that happens to be namespaced inside another for organizational purposes — it holds no implicit connection to any particular outer instance, which is exactly why it should be the default: no hidden reference means no hidden coupling and no surprise memory retention.',
      },
      {
        text: '**Inner** (non-static): holds a hidden reference to the enclosing instance',
        detail: 'The compiler generates this reference automatically as a synthetic field, invisible in source but very real in the compiled class — it is what lets inner-class code call the outer class\'s instance methods and read its fields without qualification, but it also means every inner-class instance is inseparable from one specific outer instance.',
      },
      {
        text: 'That hidden reference can silently keep large objects from being garbage-collected',
        detail: 'Because the inner instance holds a live reference to its enclosing object, the outer object cannot be collected as long as *anything* still holds a reference to the inner instance — a listener object registered globally, implemented as a non-static inner class, pins its entire enclosing object in memory for as long as the listener registration lives, often far longer than intended.',
      },
      {
        text: 'Local classes capture effectively-final local variables',
        detail: '"Effectively final" means the variable is never reassigned after its initial value, even though it is not declared `final` explicitly — the restriction exists because the local class\'s captured copy is taken once, and if the original local variable could still change afterward, the captured copy and the live variable would silently drift apart with no way for the language to keep them in sync.',
      },
      {
        text: 'Anonymous classes are mostly superseded by lambdas — except with state or multiple methods',
        detail: 'A lambda can only implement a single abstract method and carries no fields of its own — the moment you need an implementation with more than one method to override, or genuine internal mutable state beyond what captured variables provide, an anonymous class is still the right (and only) tool, since a lambda has no syntax for either.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Static nested vs inner',
        code: 'public class LinkedList<E> {\n    private static class Node<E> {      // static: no pointer to the list — correct\n        E item;\n        Node<E> next;\n    }\n\n    public class Itr {                  // inner: can see LinkedList\'s fields via\n        Node<E> current = first;        // the implicit LinkedList.this reference\n    }\n}',
      },
      {
        kind: 'bestPractice',
        title: 'Favor static member classes over nonstatic (EJ Item 24)',
        text: 'If the nested class doesn\'t need the outer instance, make it static. Every instance of a non-static inner class costs an extra reference, and that reference is a notorious **memory-leak vector**: an inner-class listener registered globally pins its whole enclosing object in memory.',
        detail: 'The fix is mechanical and easy to forget: check whether the nested class\'s methods actually call back into the enclosing instance at all — if not, adding the `static` keyword removes the hidden reference entirely, at zero functional cost, and eliminates an entire category of memory-leak risk before it can ever occur.',
      },
      {
        kind: 'paragraph',
        text: 'Inside an inner class, `OuterClass.this` names the enclosing instance; construction from outside uses `outer.new Inner()` — rare, and usually a hint the design wants restructuring. Local classes (declared inside a method) and anonymous classes can read local variables of the enclosing method, provided those are *effectively final* — same rule as lambda capture ([[lambdas]]).',
      },
      {
        kind: 'code',
        title: 'Anonymous class vs lambda',
        code: '// Before Java 8:\nbutton.addActionListener(new ActionListener() {\n    public void actionPerformed(ActionEvent e) { beep(); }\n});\n\n// Since Java 8 — same semantics, minus the ceremony (EJ Item 42):\nbutton.addActionListener(e -> beep());',
      },
      {
        kind: 'note',
        title: 'When anonymous classes still appear',
        text: 'Implementing an interface with several methods, adding fields, or needing `this` to mean the object itself (in a lambda, `this` refers to the enclosing instance). Also the double-brace initialization idiom — `new HashMap<>() {{ put(...); }}` — is an anti-pattern: it creates a subclass and leaks the enclosing instance.',
        detail: 'Double-brace initialization looks convenient but silently does two costly things: the outer braces create an anonymous subclass of `HashMap` (a whole new class file, generated at compile time, just to populate one map), and the inner instance-initializer block runs inside a non-static inner class, so it captures — and leaks — a reference to whatever enclosing instance it was created in.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 6.3 — Inner Classes' },
      { book: 'effective-java', chapter: 'Items 24, 42' },
    ],
    related: ['lambdas', 'classes-objects'],
  },

  {
    id: 'records',
    domainId: 'oop',
    title: 'Records',
    summary:
      'A record declares immutable data in one line: the compiler generates the constructor, accessors, `equals`, `hashCode`, and `toString` from the components. Use records for every value-like class — DTOs, keys, results, coordinates.',
    keyPoints: [
      {
        text: 'Components become `private final` fields + accessors named after them (`point.x()`)',
        detail: 'The accessor naming (`x()` rather than `getX()`) is a deliberate departure from JavaBeans convention, signaling that a record is transparent data rather than an object with behavior — the field name and the accessor name matching exactly is what makes the one-line declaration `record Point(int x, int y)` sufficient to fully specify the class.',
      },
      {
        text: 'Generated `equals`/`hashCode`/`toString` are componentwise and always in sync',
        detail: 'Because the compiler derives all three from the same component list every time the record is compiled, there is no separate implementation to forget updating when a component is added or removed — the classic hand-written-class bug of updating `equals` but not `hashCode`, or forgetting a field in `toString`, is structurally impossible for a record.',
      },
      {
        text: 'Compact constructors validate or normalize without repeating parameters',
        detail: 'A normal constructor has to repeat every parameter name and explicitly assign each one to a field; a compact constructor omits the parameter list and the field assignments entirely, since both are implied by the component declaration — you write only the validation or normalization logic, and the compiler fills in the assignments after your code runs.',
      },
      {
        text: 'Records are implicitly final and cannot extend a class (they may implement interfaces)',
        detail: 'Both restrictions protect the same guarantee: a record\'s entire state is its components, visible in the declaration — allowing subclassing would let a subtype add hidden fields the record\'s generated `equals`/`hashCode`/`toString` know nothing about, silently breaking the "the record is exactly its components" promise the whole feature is built on.',
      },
      {
        text: '"Shallowly immutable": a `List` component is still whatever list you passed in — copy it',
        detail: 'The record\'s own field is `final` and cannot be reassigned, but `final` only prevents the *reference* from changing — it says nothing about whether the object that reference points to is itself mutable. A `List` component still points at a genuinely mutable list unless the compact constructor defensively copies it, exactly the same defensive-copying discipline any hand-written immutable class needs.',
      },
      {
        text: 'Records + sealed interfaces + pattern matching = algebraic data types',
        detail: 'Each piece supplies one part of the picture: sealed interfaces give the compiler a closed, known set of variant types; records give each variant a concrete, transparent data shape; pattern matching in switch consumes the combination exhaustively, with the compiler proving every variant is handled. None of the three alone gets you the whole algebraic-data-type experience.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'One line of data modeling',
        code: 'public record Range(int low, int high) {\n    public Range {                       // compact constructor: validation\n        if (low > high)\n            throw new IllegalArgumentException(low + " > " + high);\n    }\n\n    public int length() { return high - low; }   // extra methods are fine\n}',
      },
      {
        kind: 'paragraph',
        text: 'The compact constructor body runs **before** the fields are assigned — assign to the parameters to normalize (`this.low = low` happens implicitly afterward). Static factories, static fields, and instance methods are all allowed; instance fields beyond the components are not — a record *is* its components.',
      },
      {
        kind: 'pitfall',
        title: 'Shallow immutability',
        text: 'A record holding a mutable component (`record Team(List<Player> players)`) faithfully exposes that mutable list. Defensively copy in the compact constructor — `players = List.copyOf(players);` — to make the record deeply immutable.',
        detail: 'Without the copy, two separate leaks are possible: the caller can keep a reference to the original list and mutate it after construction, changing the record\'s apparent state from outside, and the record\'s own accessor hands out that same live list, letting *readers* of the record mutate it too — `List.copyOf` in the compact constructor closes the first hole, and returning an unmodifiable view would be needed to close the second.',
      },
      {
        kind: 'code',
        title: 'Records with pattern matching (Java 21)',
        code: 'sealed interface Shape permits Circle, Rect {}\nrecord Circle(double radius) implements Shape {}\nrecord Rect(double w, double h) implements Shape {}\n\ndouble area(Shape s) {\n    return switch (s) {\n        case Circle(double r) -> Math.PI * r * r;   // record deconstruction\n        case Rect(double w, double h) -> w * h;\n    };   // exhaustive — no default needed\n}',
      },
      {
        kind: 'paragraph',
        text: 'This trio — [[sealed-types-overview|sealed types]], records, and [[switch-expressions-pattern-matching|pattern matching]] — brings algebraic data types to Java: closed sets of variants the compiler checks exhaustively. It replaces visitor-pattern boilerplate for tree-shaped data.',
      },
      {
        kind: 'note',
        title: 'When not to use a record',
        text: 'Records model transparent data. If the class needs mutable state, hidden representation, or an identity distinct from its contents (an entity with a database ID), use a regular class.',
        detail: 'An entity with a database ID is the clearest example: two rows with the same ID but different (perhaps stale) field values are still "the same entity" for most application purposes — identity is the primary key, not the full set of current field values — which is exactly the opposite of a record\'s componentwise equality, where any differing field makes two instances unequal.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 4.7 — Records' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['immutability-class-design', 'object-contracts', 'sealed-types-overview', 'switch-expressions-pattern-matching'],
  },

  {
    id: 'enums',
    domainId: 'oop',
    title: 'Enums',
    summary:
      'Java enums are full classes with a fixed set of instances — they can carry fields, methods, and per-constant behavior. Use them instead of int constants, and use `EnumSet`/`EnumMap` instead of bit fields and ordinal indexing.',
    keyPoints: [
      {
        text: 'Type-safe: you cannot pass an invalid value where an enum is expected (EJ 34)',
        detail: 'The old `int`-constants idiom (`SEASON_WINTER = 0`) let any `int` be passed where a season was expected, including one that matches no real season — the compiler cannot catch that. An enum parameter can only ever hold one of its declared constants; there is no "invalid enum value" that compiles.',
      },
      {
        text: 'Enums can have constructors, fields, methods, and constant-specific method bodies',
        detail: 'This is the biggest difference from `int` constants: an enum is a full class, so each constant can carry its own data (a planet\'s mass and radius) and even its own behavior via a constant-specific method body — something no set of integer constants could ever express without a separate switch statement somewhere else in the code.',
      },
      {
        text: 'Switch over enums is exhaustiveness-checked when all constants are covered',
        detail: 'Because the compiler knows the complete, closed set of an enum\'s constants, a switch that covers every one of them needs no `default` branch — and, in a pattern-matching switch, adding a new constant later makes every such switch across the codebase fail to compile until it is updated to handle the new case, turning a runtime gap into a build-time forcing function.',
      },
      {
        text: 'Never rely on `ordinal()` — use instance fields instead (EJ 35)',
        detail: '`ordinal()` reflects nothing more than declaration order in the source file — inserting a new constant in the middle, or simply reordering existing ones, silently shifts every ordinal after that point. Any code that derived meaning from the ordinal (an array index, a persisted database value) breaks without a compile error to warn you.',
      },
      {
        text: '`EnumSet` replaces bit fields (EJ 36); `EnumMap` replaces ordinal-indexed arrays (EJ 37)',
        detail: 'Both give you the performance characteristics of the low-level technique they replace (a bit vector for sets, a plain array for maps) while keeping ordinary, readable, type-safe collection APIs on top — there is essentially no reason left to hand-roll bit-flag constants or index an array by `ordinal()` when `EnumSet`/`EnumMap` exist.',
      },
      {
        text: 'Single-element enum: the most robust singleton (EJ 3)',
        detail: 'The JVM itself guarantees exactly one instance of each enum constant exists, even across serialization round-trips and in the face of reflection-based attacks that can otherwise invoke a "private" constructor a second time — a guarantee a hand-written private-constructor singleton has to defend manually and can still get wrong.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Enums with data and behavior (EJ Item 34)',
        code: 'public enum Planet {\n    MERCURY(3.302e+23, 2.439e6),\n    EARTH(5.975e+24, 6.378e6);\n\n    private final double mass, radius;\n\n    Planet(double mass, double radius) {\n        this.mass = mass;\n        this.radius = radius;\n    }\n\n    public double surfaceGravity() {\n        return 6.67e-11 * mass / (radius * radius);\n    }\n}',
      },
      {
        kind: 'code',
        title: 'Constant-specific behavior',
        code: 'public enum Operation {\n    PLUS("+")  { public double apply(double x, double y) { return x + y; } },\n    TIMES("*") { public double apply(double x, double y) { return x * y; } };\n\n    private final String symbol;\n    Operation(String symbol) { this.symbol = symbol; }\n\n    public abstract double apply(double x, double y);\n}',
      },
      {
        kind: 'paragraph',
        text: 'Every enum implicitly extends `java.lang.Enum` and provides `values()`, `valueOf(String)`, `name()`, and `ordinal()`. Enums are serialization-safe and reflection-proof singletons per constant, which is why a one-constant enum is the sturdiest singleton implementation (EJ Item 3).',
      },
      {
        kind: 'pitfall',
        title: 'ordinal() is a trap (EJ Item 35)',
        text: 'Reordering or inserting constants silently changes every ordinal. Derive nothing from `ordinal()` — store the value in a field. The same applies to persisting ordinals in databases: persist `name()` or an explicit code.',
        detail: 'Persisting `ordinal()` to a database is especially dangerous because the failure is silent and delayed — the code keeps compiling and running fine after someone reorders the enum, and only later does old persisted data get reinterpreted as the *wrong* constant, by which point the corruption may already be baked into months of stored records.',
      },
      {
        kind: 'bestPractice',
        title: 'EnumSet and EnumMap (EJ Items 36–37)',
        text: '`EnumSet.of(Style.BOLD, Style.ITALIC)` is as fast as a bit mask (single `long` internally) but readable and type-safe. `EnumMap<Phase, Transition>` is a compact array under the hood. Reach for them whenever keys/elements are enum constants — see [[choosing-collections]].',
        detail: 'A `long` has 64 bits, which is why `EnumSet` can pack membership for enums with up to 64 constants into a single primitive field internally (larger enums use a small array of longs instead) — none of that representation is visible in the API, which looks and behaves exactly like any other `Set<E>`.',
      },
      {
        kind: 'note',
        title: 'Extensible "enums"',
        text: 'Enums cannot be extended. When clients must add operations, define an interface the enum implements, and let clients supply their own enum implementing it (EJ Item 38).',
        detail: 'This pattern trades the closed-set guarantee (the whole point of enums, and what makes exhaustive switches possible) for open extensibility exactly where it is needed — a client defines their own enum implementing your operation interface, and any code written against the interface type works with both your original constants and the client\'s new ones without modification.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 5.7 — Enumeration Classes' },
      { book: 'effective-java', chapter: 'Items 3, 34–38' },
    ],
    related: ['static-members', 'choosing-collections', 'switch-expressions-pattern-matching'],
  },

  {
    id: 'immutability-class-design',
    domainId: 'oop',
    title: 'Immutability & Class Design',
    summary:
      'Immutable objects are simple, safe to share, and inherently thread-safe. Minimize mutability by default: final fields, no setters, defensive copies at the boundaries — and reach for records when the class is pure data.',
    keyPoints: [
      {
        text: 'Immutable = no state change after construction: `final` class, `final` fields, no setters',
        detail: 'Every one of these four rules closes a specific loophole: no setters removes the obvious mutation path, `final` fields stop even the class\'s own methods from reassigning them after construction, and `final` on the class itself prevents a subclass from adding mutable state or overriding a method to break the immutability the rest of the design relies on.',
      },
      {
        text: 'Immutable objects need no synchronization — share them freely across threads',
        detail: 'A data race requires at least one thread writing to shared state while another reads it — an immutable object has exactly one state for its entire lifetime, established once in the constructor, so there is no write to race against after construction, and no lock is needed to protect what can never change.',
      },
      {
        text: 'Defensive-copy mutable inputs **and** outputs (EJ 50)',
        detail: 'Copying only on the way in (constructor parameters) protects against a caller mutating the object they handed you after the fact, but does nothing if your own accessor later hands out the live internal reference — both directions need a copy (or an unmodifiable view) to actually make the class\'s state closed off from outside mutation.',
      },
      {
        text: 'Classes should be either designed for inheritance or `final` (EJ 19)',
        detail: 'A class that is neither risks the worst of both worlds: it invites subclassing without having been written with subclassing in mind, so an override of some internal helper method can silently break invariants the original author never documented or even considered — "silently allows inheritance" is a design decision, whether or not the author intended it as one.',
      },
      {
        text: 'Minimize accessibility of everything (EJ 15)',
        detail: 'Every public element is a permanent commitment — once released, it must be supported or you break someone\'s code by removing it. Starting as private (or package-private) and widening only when a real, concrete need appears keeps that commitment surface as small as possible, since narrowing later is a breaking change but widening never is.',
      },
      {
        text: 'The cost: a new object per "change" — usually negligible, occasionally not',
        detail: 'The allocation cost of a short-lived immutable object is close to free on a modern JVM — young-generation collection is proportional to *live* data, and an object discarded almost immediately barely registers. The "occasionally not" case is genuinely hot loops doing many changes per iteration, where a mutable companion type (`StringBuilder` alongside `String`) earns its complexity — but only once profiling shows it matters.',
      },
    ],
    blocks: [
      {
        kind: 'bestPractice',
        title: 'Minimize mutability (EJ Item 17)',
        text: 'Five rules: don\'t provide mutators; ensure the class can\'t be extended (`final`); make all fields `final`; make all fields `private`; ensure exclusive access to any mutable components (defensive copies in and out). `String`, `BigDecimal`, and the `java.time` types all follow this recipe.',
        detail: 'That these five rules are exactly what `String` and `java.time` follow is not a coincidence — they are the same five rules that make it safe to hand a `String` to completely untrusted code (another thread, a third-party library) without ever worrying that it might come back changed, which is the entire practical payoff of immutability.',
      },
      {
        kind: 'code',
        title: 'An immutable class with functional "mutators"',
        code: 'public final class Money {\n    private final BigDecimal amount;\n    private final Currency currency;\n\n    public Money(BigDecimal amount, Currency currency) {\n        this.amount = Objects.requireNonNull(amount);\n        this.currency = Objects.requireNonNull(currency);\n    }\n\n    public Money plus(Money other) {\n        requireSameCurrency(other);\n        return new Money(amount.add(other.amount), currency);  // return NEW object\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Why it pays: an immutable object has exactly one state, established by its constructor — no temporal reasoning, no aliasing surprises, no locks. It is the cheapest form of [[thread-safety]] there is (JCiP: "immutable objects are always thread-safe"), and safe publication comes free via `final` fields ([[sharing-objects]]).',
      },
      {
        kind: 'pitfall',
        title: 'The Date/mutable-component leak (EJ Item 50)',
        text: 'A "Period" class that stores the `Date` objects handed to its constructor can be corrupted afterward by the caller mutating them. Copy mutable parameters **before** validity checks (TOCTOU), and copy again in accessors. Better: use immutable types (`Instant`, `LocalDate`) so the problem vanishes.',
        code: 'public Period(Date start, Date end) {\n    this.start = new Date(start.getTime());  // copy first\n    this.end = new Date(end.getTime());\n    if (this.start.after(this.end)) throw new IllegalArgumentException();\n}',
        detail: 'Copying *before* the validity check matters specifically because of the time-of-check-to-time-of-use gap: if you validated the original (uncopied) `Date` objects first and only copied afterward, a malicious or careless caller could still mutate the original between the check and the copy, letting an invalid `Period` slip past validation that appeared to have already run correctly.',
      },
      {
        kind: 'paragraph',
        text: 'When true immutability is impractical, **minimize** mutability: make every field `final` unless it must change, keep mutable state private, and provide the smallest possible mutation surface. A class with one mutable field is vastly easier to reason about than a JavaBean with ten setters.',
      },
      {
        kind: 'note',
        title: 'Performance concerns are usually misplaced',
        text: 'Small short-lived objects are nearly free on modern JVMs (young-collection cost is proportional to *live* data — see [[gc-fundamentals]]), and escape analysis can eliminate allocations entirely ([[jit-compilation]]). Provide a mutable companion (`StringBuilder` for `String`) only when profiling shows the need.',
        detail: 'Escape analysis is the JIT proving an allocated object never leaves the method (never "escapes" to a field, another thread, or a return value it outlives) — when that proof succeeds, the object can be allocated on the stack or even broken into individual registers instead of the heap, making the "cost of immutability" argument moot for a large fraction of short-lived intermediate objects.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 15–17, 19, 50' },
      { book: 'jcip', chapter: 'Ch. 3 — Sharing Objects (immutability)' },
      { book: 'core-java-1', chapter: 'Ch. 4 — Objects and Classes' },
    ],
    related: ['records', 'thread-safety', 'sharing-objects', 'object-contracts'],
  },

  {
    id: 'composition-vs-inheritance',
    domainId: 'oop',
    title: 'Composition over Inheritance',
    summary:
      'Implementation inheritance couples you to a superclass\'s hidden self-use patterns; composition wraps an object behind your own stable interface. Unless a class was designed and documented for extension, wrap it — don\'t extend it.',
    keyPoints: [
      {
        text: 'Inheritance breaks encapsulation: subclasses depend on superclass internals (EJ 18)',
        detail: 'The coupling is invisible in the subclass\'s own source code — nothing in `InstrumentedHashSet` mentions that `HashSet.addAll` happens to call `add` internally, yet the subclass\'s correctness depends entirely on that undocumented fact continuing to hold in every future JDK release.',
      },
      {
        text: 'Composition + forwarding gives reuse without the coupling',
        detail: 'A composed wrapper only depends on the *documented* interface of the object it holds — it calls `inner.add(e)` through the public `Set` contract, never relying on which method calls which internally — so the wrapper keeps working correctly no matter how the wrapped implementation\'s internals change between versions.',
      },
      {
        text: 'The decorator pattern is composition in action (`Collections.unmodifiableList`, buffered streams)',
        detail: 'Every one of these wraps an object of the same interface it implements, adding one specific behavior (read-only enforcement, buffering) while forwarding everything else through unchanged — which is exactly why decorators compose: you can stack a buffered stream around a file stream around a compressed stream, each layer adding its behavior independently.',
      },
      {
        text: 'Use inheritance only for genuine is-a between classes designed for it',
        detail: '"Designed for it" is the qualifier that matters — a class is only safe to extend if its author documented which of its own methods call which others internally (its self-use patterns), since that documentation is what a subclass\'s overrides are allowed to rely on without the same undocumented-coupling risk `InstrumentedHashSet` ran into.',
      },
      {
        text: 'Wrapper classes don\'t work where identity or callbacks matter (SELF problem)',
        detail: 'A wrapper is a genuinely different object from the thing it wraps — if the wrapped object hands `this` to some callback mechanism, that callback receives the *inner* object, completely bypassing whatever behavior the wrapper was supposed to add, because the callback was never routed through the wrapper in the first place.',
      },
    ],
    blocks: [
      {
        kind: 'pitfall',
        title: 'The InstrumentedHashSet bug (EJ Item 18)',
        text: 'Extend `HashSet`, override `add` and `addAll` to count insertions, call `addAll(List.of("a","b","c"))` — the count is **6**, not 3, because `HashSet.addAll` calls `add` internally, invoking your override again. Your correctness now depends on an undocumented implementation detail that may change in any release.',
        detail: 'Walk the actual sequence: `addAll` runs your override, adding 3 to the count; internally it then calls `add` once per element, and because dynamic dispatch means *your* overridden `add` runs each time, that adds 3 more — the count is 6, not the 3 you would get if `addAll` were implemented independently instead of built on top of `add`.',
      },
      {
        kind: 'code',
        title: 'The composition fix: wrap and forward',
        code: 'public class InstrumentedSet<E> implements Set<E> {\n    private final Set<E> inner;             // composition: HAS-A, not IS-A\n    private int addCount = 0;\n\n    public InstrumentedSet(Set<E> inner) { this.inner = inner; }\n\n    @Override public boolean add(E e) {\n        addCount++;\n        return inner.add(e);                // forward\n    }\n\n    @Override public boolean addAll(Collection<? extends E> c) {\n        addCount += c.size();\n        return inner.addAll(c);             // inner\'s self-use is now irrelevant\n    }\n    // … remaining Set methods forward to inner\n}',
      },
      {
        kind: 'paragraph',
        text: 'The wrapper works with **any** `Set` implementation and any decoration order — it is a decorator, like `BufferedInputStream` over `FileInputStream` ([[io-streams]]) or `Collections.synchronizedMap` over any map. A reusable *forwarding class* (ForwardingSet) makes writing such decorators nearly free; pair it with interfaces + skeletal implementations ([[interfaces]]).',
      },
      {
        kind: 'paragraph',
        text: 'The decision test from Effective Java: is every B *really* an A — would you be comfortable substituting B anywhere an A is used, forever? Java\'s own library answers "no" incorrectly in places (`Stack extends Vector`, `Properties extends Hashtable`) and has paid for it with frozen, bypassable APIs.',
      },
      {
        kind: 'note',
        title: 'Where wrappers fall short',
        text: 'The SELF problem: if the wrapped object passes `this` to callbacks, the callback sees the inner object, bypassing your decoration. And a wrapper is not `instanceof` the wrapped class\'s type hierarchy beyond the shared interface.',
        detail: 'The `instanceof` limitation is a direct consequence of composition being genuinely different from inheritance: a wrapper around an `ArrayList` is not itself an `ArrayList` and cannot pass an `instanceof ArrayList` check, only an `instanceof List` — code that specifically checks for the concrete wrapped type rather than the shared interface will not recognize a decorated instance as equivalent.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Item 18' },
      { book: 'core-java-1', chapter: 'Ch. 5.11 — Design Hints for Inheritance' },
    ],
    related: ['inheritance-polymorphism', 'interfaces', 'io-streams'],
  },
]
