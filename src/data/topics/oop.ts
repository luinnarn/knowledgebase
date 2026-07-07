import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'classes-objects',
    domainId: 'oop',
    title: 'Classes & Objects',
    summary:
      'A class is a blueprint: state (fields) plus behavior (methods) behind an access-controlled boundary. Objects are created with `new`, live on the heap, and are always handled through references.',
    keyPoints: [
      'Object variables are **references** — assignment aliases, it never copies the object',
      'Encapsulation: private fields + public methods define a stable contract',
      'Access levels: `private` → package-private (default) → `protected` → `public`',
      'Method parameters are passed **by value** — including reference values',
      'Getters must not leak references to mutable internals',
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
      },
      {
        kind: 'bestPractice',
        title: 'Design hints (Core Java ch. 4.11)',
        text: 'Keep data private; always initialize fields; don\'t use too many basic types together (group them into a class); not every field needs an accessor; split classes that do too much; make names reflect responsibilities.',
      },
      {
        kind: 'note',
        title: 'null and Optional',
        text: 'Every reference can be `null`; dereferencing null throws `NullPointerException` — since Java 14 the message helpfully names the null variable. For "may be absent" return values, consider [[optional]]; for parameters, validate with `Objects.requireNonNull(param, "message")` at method entry (EJ Item 49).',
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
      'No constructor written → compiler provides a no-arg constructor; write any → it disappears',
      'Static factories beat constructors: they have names, can cache, and can return subtypes (EJ 1)',
      'Builder pattern for many/optional parameters (EJ 2)',
      'Initialization order: field initializers & init blocks in source order, then the constructor body',
      '`this(...)` chains to another constructor of the same class',
    ],
    blocks: [
      {
        kind: 'bestPractice',
        title: 'Consider static factory methods instead of constructors (EJ Item 1)',
        text: 'Named creation reads better (`BigInteger.probablePrime(...)`), instances can be cached (`Integer.valueOf`, `Boolean.valueOf`), the return type can be an interface or subtype (`List.of`, `EnumSet.of` picks RegularEnumSet vs JumboEnumSet), and the type can vary per call. Convention names: `of`, `from`, `valueOf`, `getInstance`, `newInstance`, `create`.',
        code: 'LocalDate date = LocalDate.of(2026, 7, 7);\nList<String> sizes = List.of("S", "M", "L");\nOptional<User> u = Optional.empty();',
      },
      {
        kind: 'bestPractice',
        title: 'Use a builder for many constructor parameters (EJ Item 2)',
        text: 'Telescoping constructors (1, 2, 3, 4 params…) become unreadable and error-prone; JavaBeans-style setters leave the object inconsistent mid-construction. A builder gives named, optional parameters and an immutable result.',
        code: 'NutritionFacts cola = new NutritionFacts.Builder(240, 8)\n        .calories(100)\n        .sodium(35)\n        .carbohydrate(27)\n        .build();',
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
      },
      {
        kind: 'bestPractice',
        title: 'Avoid finalizers and cleaners; prefer try-with-resources (EJ Items 8–9)',
        text: 'Finalization is unpredictable, slow, and deprecated for removal. For resources, implement `AutoCloseable` and rely on [[catching-cleanup|try-with-resources]]; use `Cleaner` only as a safety net.',
      },
      {
        kind: 'note',
        title: 'Singletons and noninstantiability',
        text: 'Enforce a singleton with an `enum` (simplest, serialization-safe — EJ Item 3) or a private constructor. Utility classes (all-static) get a private constructor that throws, preventing accidental instantiation (EJ Item 4). Prefer dependency injection over hardwired singletons for testability (EJ Item 5).',
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
      'One copy per class, shared by all instances (per class loader)',
      'Static methods cannot touch instance state or `this`',
      'Constants: `static final`, `UPPER_SNAKE_CASE`',
      'Static initializer blocks run once at class initialization',
      'Mutable static state is a concurrency hazard and a testing obstacle',
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
      },
      {
        kind: 'pitfall',
        title: 'Calling statics through instances',
        text: '`employee.getCount()` compiles when `getCount` is static, but resolves against the **declared type at compile time** — polymorphism does not apply. Always invoke statics through the class name: `Employee.getCount()`.',
      },
      {
        kind: 'note',
        title: 'Static imports',
        text: '`import static java.util.stream.Collectors.*` lets you write `collect(toList())`. Great for fluent APIs and test assertions; use sparingly elsewhere so readers can find definitions.',
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
      'Dynamic dispatch: the runtime type of the object decides which override runs',
      '`super.method()` calls the superclass version; `super(...)` must be the first constructor statement',
      'Overrides can widen visibility and narrow the return type (covariant returns) — never the reverse',
      'Use `@Override` on every override so the compiler catches signature typos (EJ 40)',
      '`final` classes/methods forbid subclassing/overriding',
      'Prefer pattern matching `instanceof` when you must check types',
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
      },
      {
        kind: 'note',
        title: 'Every class extends Object',
        text: 'The root supplies `equals`, `hashCode`, `toString`, `getClass`, `clone`, `wait/notify`. Overriding the first three correctly is its own discipline — see [[object-contracts]].',
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
      '`equals` must be reflexive, symmetric, transitive, consistent, and non-null',
      '**Equal objects must have equal hash codes** — override both or neither',
      'A mutated key whose hashCode changes is lost to its `HashMap`',
      'Always override `toString` for debuggability (EJ 12)',
      '`compareTo` should be consistent with `equals`; use `Comparator` combinators',
      'Records generate correct `equals`/`hashCode`/`toString` automatically',
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
      },
      {
        kind: 'pitfall',
        title: 'equals(Object), not equals(MyType)',
        text: 'Declaring `public boolean equals(Point other)` **overloads** instead of overriding — collections keep calling the inherited identity-based `equals(Object)`. `@Override` catches this at compile time (EJ Item 40).',
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
      },
      {
        kind: 'note',
        title: 'clone is broken; skip it',
        text: 'Effective Java Item 13: the `Cloneable` architecture is fragile (no constructor call, shallow by default, checked exception noise). Prefer a **copy constructor** or copy factory: `new ArrayList<>(list)`.',
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
      'A class implements any number of interfaces — Java\'s answer to multiple inheritance',
      '`default` methods add behavior without breaking implementors',
      'Interface fields are implicitly `public static final`; methods implicitly `public`',
      'Prefer interfaces to abstract classes for defining types (EJ 20)',
      'Use interfaces **only** to define types — no "constant interfaces" (EJ 22)',
      'Refer to objects by their interfaces: `List<String> list = new ArrayList<>()` (EJ 64)',
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
      },
      {
        kind: 'pitfall',
        title: 'Design interfaces for posterity (EJ Item 21)',
        text: 'Default methods are injected into existing implementations without their knowledge — `Collection.removeIf` broke `SynchronizedCollection`\'s locking guarantee when it appeared. Adding a default method to a widely-implemented interface is never risk-free; get the interface right up front.',
      },
      {
        kind: 'note',
        title: 'Marker interfaces still matter (EJ Item 41)',
        text: 'An empty interface like `Serializable` tags a type in a way the compiler can check — something an annotation cannot do when a method should accept only tagged objects.',
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
      '**Static nested**: no outer-instance reference — the default choice (EJ 24)',
      '**Inner** (non-static): holds a hidden reference to the enclosing instance',
      'That hidden reference can silently keep large objects from being garbage-collected',
      'Local classes capture effectively-final local variables',
      'Anonymous classes are mostly superseded by lambdas — except with state or multiple methods',
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
      'Components become `private final` fields + accessors named after them (`point.x()`)',
      'Generated `equals`/`hashCode`/`toString` are componentwise and always in sync',
      'Compact constructors validate or normalize without repeating parameters',
      'Records are implicitly final and cannot extend a class (they may implement interfaces)',
      '"Shallowly immutable": a `List` component is still whatever list you passed in — copy it',
      'Records + sealed interfaces + pattern matching = algebraic data types',
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
      'Type-safe: you cannot pass an invalid value where an enum is expected (EJ 34)',
      'Enums can have constructors, fields, methods, and constant-specific method bodies',
      'Switch over enums is exhaustiveness-checked when all constants are covered',
      'Never rely on `ordinal()` — use instance fields instead (EJ 35)',
      '`EnumSet` replaces bit fields (EJ 36); `EnumMap` replaces ordinal-indexed arrays (EJ 37)',
      'Single-element enum: the most robust singleton (EJ 3)',
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
      },
      {
        kind: 'bestPractice',
        title: 'EnumSet and EnumMap (EJ Items 36–37)',
        text: '`EnumSet.of(Style.BOLD, Style.ITALIC)` is as fast as a bit mask (single `long` internally) but readable and type-safe. `EnumMap<Phase, Transition>` is a compact array under the hood. Reach for them whenever keys/elements are enum constants — see [[choosing-collections]].',
      },
      {
        kind: 'note',
        title: 'Extensible "enums"',
        text: 'Enums cannot be extended. When clients must add operations, define an interface the enum implements, and let clients supply their own enum implementing it (EJ Item 38).',
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
      'Immutable = no state change after construction: `final` class, `final` fields, no setters',
      'Immutable objects need no synchronization — share them freely across threads',
      'Defensive-copy mutable inputs **and** outputs (EJ 50)',
      'Classes should be either designed for inheritance or `final` (EJ 19)',
      'Minimize accessibility of everything (EJ 15)',
      'The cost: a new object per "change" — usually negligible, occasionally not',
    ],
    blocks: [
      {
        kind: 'bestPractice',
        title: 'Minimize mutability (EJ Item 17)',
        text: 'Five rules: don\'t provide mutators; ensure the class can\'t be extended (`final`); make all fields `final`; make all fields `private`; ensure exclusive access to any mutable components (defensive copies in and out). `String`, `BigDecimal`, and the `java.time` types all follow this recipe.',
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
      },
      {
        kind: 'paragraph',
        text: 'When true immutability is impractical, **minimize** mutability: make every field `final` unless it must change, keep mutable state private, and provide the smallest possible mutation surface. A class with one mutable field is vastly easier to reason about than a JavaBean with ten setters.',
      },
      {
        kind: 'note',
        title: 'Performance concerns are usually misplaced',
        text: 'Small short-lived objects are nearly free on modern JVMs (young-collection cost is proportional to *live* data — see [[gc-fundamentals]]), and escape analysis can eliminate allocations entirely ([[jit-compilation]]). Provide a mutable companion (`StringBuilder` for `String`) only when profiling shows the need.',
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
      'Inheritance breaks encapsulation: subclasses depend on superclass internals (EJ 18)',
      'Composition + forwarding gives reuse without the coupling',
      'The decorator pattern is composition in action (`Collections.unmodifiableList`, buffered streams)',
      'Use inheritance only for genuine is-a between classes designed for it',
      'Wrapper classes don\'t work where identity or callbacks matter (SELF problem)',
    ],
    blocks: [
      {
        kind: 'pitfall',
        title: 'The InstrumentedHashSet bug (EJ Item 18)',
        text: 'Extend `HashSet`, override `add` and `addAll` to count insertions, call `addAll(List.of("a","b","c"))` — the count is **6**, not 3, because `HashSet.addAll` calls `add` internally, invoking your override again. Your correctness now depends on an undocumented implementation detail that may change in any release.',
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
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Item 18' },
      { book: 'core-java-1', chapter: 'Ch. 5.11 — Design Hints for Inheritance' },
    ],
    related: ['inheritance-polymorphism', 'interfaces', 'io-streams'],
  },
]
