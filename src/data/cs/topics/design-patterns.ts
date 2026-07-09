import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'design-patterns-overview',
    domainId: 'design-patterns',
    title: 'Design Patterns Overview',
    summary:
      'A design pattern is a named, reusable solution to a recurring object-oriented design problem — not a library to import, but a shape to recognize and adapt. The value is the shared vocabulary as much as the code.',
    keyPoints: [
      {
        text: 'A pattern has four parts: a name, the problem it addresses, the solution shape (a structure of classes/objects and their relationships), and the consequences (trade-offs of using it)',
        detail: 'The "consequences" section is the part most people skip when learning a pattern, and it is the part that actually matters for using one well — every pattern trades something (an extra layer of indirection, a class that exists purely to implement an interface) for the flexibility it buys, and a pattern applied without weighing that trade is exactly how the catalog gets misused.',
      },
      {
        text: 'The Gang of Four (GoF) catalog groups 23 classic patterns into three families: creational (object creation), structural (object composition), behavioral (object interaction and responsibility)',
        detail: 'The three-way split is itself useful vocabulary for narrowing down which pattern applies to a given problem — "I have an object-creation problem" (creational), "I need these objects to fit together differently" (structural), or "I need these objects to communicate differently" (behavioral) each point to a small subset of the 23 rather than the whole catalog.',
      },
      {
        text: 'Patterns codify "favor composition over inheritance" and "program to an interface, not an implementation" — most patterns are specific applications of these two principles',
        detail: 'This is why learning the catalog by memorizing 23 unrelated recipes is the hard way to do it — nearly every pattern is one of these two general OO design principles instantiated for a specific recurring problem shape, so understanding the two principles deeply makes most of the individual patterns feel like variations on a theme rather than new ideas each time.',
      },
      {
        text: 'A pattern is a starting point, not a mandate — applying one where the problem doesn\'t call for it adds indirection and complexity for no benefit ([[anti-patterns-and-pattern-misuse]])',
        detail: 'Every pattern introduces at least one extra layer — an interface, a wrapper class, an extra method call — and that layer only pays for itself if the flexibility it buys is actually needed. Applied to a problem that will never need that flexibility, the same layer is pure overhead: more code to read, more indirection to trace, for a variation that never materializes.',
      },
      {
        text: 'Recognizing a pattern in someone else\'s code is often more valuable day-to-day than writing one from scratch — it tells you what to expect from the design',
        detail: 'Once you recognize "this is a Decorator," you immediately know the wrapped object and the wrapper share an interface, that behavior is added by composition not subclassing, and that stacking more decorators is the expected way to extend it — that inference, built entirely from pattern-name recognition, is often faster than reading the implementation line by line.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The historical context matters for understanding why the catalog looks the way it does: it was written against Smalltalk and C++ in the early 1990s, languages without lambdas, without first-class functions, and (in C++\'s case) without garbage collection. Several GoF patterns exist specifically to work around the *absence* of a language feature — Strategy and Command are largely replaced by a lambda in modern Java for the simple cases, and Iterator is built into every language with a for-each loop. The patterns aren\'t obsolete, but a fair number of their simplest use cases now have lighter-weight solutions.',
      },
      {
        kind: 'table',
        caption: 'The three GoF families, at a glance',
        headers: ['Family', 'Concerned with', 'Examples'],
        rows: [
          ['Creational', 'how objects get created, hiding the concrete class from the caller', 'Factory Method, Builder, Singleton ([[creational-patterns]])'],
          ['Structural', 'how classes and objects are composed into larger structures', 'Adapter, Decorator, Facade ([[structural-patterns]])'],
          ['Behavioral', 'how objects communicate and distribute responsibility', 'Strategy, Observer, Command ([[behavioral-patterns-i]])'],
        ],
      },
      {
        kind: 'code',
        title: 'The two principles nearly every pattern is an application of',
        code: '// "Program to an interface, not an implementation":\nList<String> names = new ArrayList<>();     // caller depends on List, not ArrayList\n\n// "Favor composition over inheritance":\nclass Car {\n    private final Engine engine;             // Car HAS-A Engine — swap engines freely\n    Car(Engine engine) { this.engine = engine; }\n}\n// vs. a rigid class hierarchy: class ElectricCar extends Car { ... } — locked in at compile time',
      },
      {
        kind: 'pitfall',
        title: 'Pattern name-dropping is not design',
        text: 'Saying "this should be a Factory" or "let\'s use Observer here" is only useful if it follows from an actual problem the code has — a family of related objects whose concrete type shouldn\'t leak to callers, or a one-to-many notification need. Reaching for a pattern because it sounds sophisticated, rather than because the problem shape calls for it, is precisely how [[anti-patterns-and-pattern-misuse]] enters a codebase.',
        detail: 'The tell is the direction of the reasoning: "we have this problem, and a Factory solves it" is design; "let\'s use a Factory" followed by a search for a problem it can solve is name-dropping. The pattern should be the conclusion of analyzing the concrete forces at play, never the starting point.',
      },
      {
        kind: 'note',
        title: 'Patterns vs. principles vs. idioms',
        text: 'A *principle* (like [[solid-principles]]) is a general rule for good design, language-agnostic. A *pattern* is a specific, named structural solution to a specific recurring problem — more concrete than a principle, more general than code. An *idiom* is even more specific: how to express something well in one particular language (e.g. try-with-resources for cleanup in Java). Patterns sit in the middle: general enough to apply across languages, concrete enough to have a recognizable class diagram.',
        detail: 'The three sit on a spectrum of specificity, and confusing the levels causes real friction — treating a principle like a checklist item ("did we use SRP?") or treating an idiom like a portable pattern (assuming try-with-resources translates directly to a language without it) both misapply the abstraction at the wrong altitude.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 1 — Intro to Design Patterns' }],
    related: ['creational-patterns', 'structural-patterns', 'behavioral-patterns-i', 'solid-principles'],
  },

  {
    id: 'creational-patterns',
    domainId: 'design-patterns',
    title: 'Creational Patterns',
    summary:
      'Patterns that decouple *how* an object is constructed from the code that uses it — so callers depend on an interface or abstract type, never on which concrete class actually gets instantiated.',
    keyPoints: [
      {
        text: 'Factory Method: a subclass decides which concrete class to instantiate, exposed through a method the base class defines but doesn\'t implement',
        detail: 'The base class writes its algorithm entirely in terms of the abstract product type and never learns which concrete class it actually got — that decision is pushed down to whichever subclass overrides the factory method, so adding a new product means adding a new subclass, not editing the base class\'s logic.',
      },
      {
        text: 'Abstract Factory: a factory that produces a *family* of related objects guaranteed to work together (e.g. a UI theme\'s button + checkbox + scrollbar)',
        detail: 'The guarantee is the whole point — without it, nothing stops a caller from mixing a dark-theme button with a light-theme scrollbar. One factory interface with one creation method per product in the family means swapping the entire family (the whole theme) is a single object substitution.',
      },
      {
        text: 'Builder: separates constructing a complex object step-by-step from representing it — avoids telescoping constructors with many optional parameters',
        detail: 'A telescoping constructor forces every caller to pass positional arguments for parameters they don\'t care about, and adding one more optional field means adding another constructor overload. Builder trades that for named, chainable setter calls plus a single validating `build()` step, at the cost of one extra class.',
      },
      {
        text: 'Singleton: guarantees exactly one instance of a class exists, with a single global access point — the most misused pattern in the catalog',
        detail: 'The guarantee itself is rarely the problem — genuinely singleton resources (a connection pool, a hardware handle) exist. The misuse is reaching for the *global access point* half of the pattern as a substitute for passing a dependency explicitly, which is what makes it hard to test and easy to couple unrelated code to.',
      },
      {
        text: 'Prototype: creates new objects by cloning an existing configured instance rather than constructing from scratch',
        detail: 'This pays off specifically when construction itself is the expensive or complex part — an object built from a network call, a parsed file, or an expensive computation can be configured once and then copied cheaply, rather than re-paying that setup cost for every new instance.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Which creational pattern for which problem',
        headers: ['Pattern', 'Use when', 'Java idiom'],
        rows: [
          ['Factory Method', 'a class can\'t know which concrete subtype to create ahead of time', 'a `create()` method overridden per subclass'],
          ['Abstract Factory', 'you need a family of related objects that must match', 'a factory interface with one method per product'],
          ['Builder', 'a constructor would need many optional/ordered parameters', 'fluent `Builder` class with chained setters + `build()`'],
          ['Singleton', 'exactly one instance must exist app-wide', 'an `enum` with one constant (safest form in Java)'],
          ['Prototype', 'creating from scratch is expensive; cloning a template is cheap', '`clone()` or a copy constructor'],
        ],
      },
      {
        kind: 'code',
        title: 'Builder — the pattern that survives best in modern Java',
        code: 'public final class HttpRequest {\n    private final String url;\n    private final String method;\n    private final Map<String, String> headers;\n\n    private HttpRequest(Builder b) {\n        this.url = b.url; this.method = b.method; this.headers = b.headers;\n    }\n\n    public static class Builder {\n        private final String url;\n        private String method = "GET";\n        private final Map<String, String> headers = new HashMap<>();\n\n        public Builder(String url) { this.url = url; }\n        public Builder method(String m) { this.method = m; return this; }\n        public Builder header(String k, String v) { headers.put(k, v); return this; }\n        public HttpRequest build() { return new HttpRequest(this); }\n    }\n}\n\nHttpRequest req = new HttpRequest.Builder("https://api.example.com")\n    .method("POST")\n    .header("Content-Type", "application/json")\n    .build();',
        caption: 'The builder pattern earns its keep exactly here: classes with more than a handful of constructor parameters',
      },
      {
        kind: 'pitfall',
        title: 'Singleton is a global mutable variable wearing a disguise',
        text: 'A classic Singleton (private constructor, static `getInstance()`) makes every caller implicitly coupled to that one instance\'s state, makes unit testing hard (no way to substitute a fake), and is genuinely dangerous under concurrency unless the initialization is handled carefully. Modern practice prefers dependency injection: construct the single instance once at startup and pass it to whoever needs it, rather than letting any code reach out and grab it globally. If Java Singleton is truly required, an `enum` with one constant is the only version immune to reflection and serialization attacks.',
        detail: 'The testing problem is the sharpest symptom: any code that calls `Singleton.getInstance()` internally has a hidden dependency that doesn\'t show up in its constructor or method signature, so a unit test can\'t substitute a mock without resorting to reflection tricks or a test-only reset method. Constructor injection makes the same dependency visible and swappable for free.',
      },
      {
        kind: 'note',
        title: 'Why Factory Method exists at all',
        text: 'Without it, code that needs to create an object of a type decided at runtime (e.g. "create the right kind of Document for this file extension") would need a growing `if/else` or `switch` over types scattered through the codebase every time a new type is added. Factory Method centralizes that decision in one overridable place — each concrete factory subclass knows how to build its corresponding product, and the calling code never needs to change when a new product type is added.',
        detail: 'The scattering is the real cost being avoided — without a central creation point, the same type-dispatch logic tends to get duplicated at every call site that needs to construct one of these objects, so adding a new type means hunting down and updating every one of those call sites instead of adding one new subclass.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer static factory methods over constructors first',
        text: 'Before reaching for the full Factory Method pattern, consider a static factory method on the class itself (`Optional.of(x)`, `List.of(...)`) — it can have a descriptive name, doesn\'t have to create a new object every call (caching), and can return a subtype. This is a lighter-weight relative of the creational patterns here and is idiomatic throughout the modern JDK.',
        detail: 'A constructor is stuck with the class name and must always return a new instance of exactly that class; a static factory method has none of those constraints — `Optional.empty()` can return a cached singleton instance, and `List.of()` can return a different concrete implementation depending on the number of elements, all invisibly to the caller.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 2, 4, 5 — Factory Patterns; Singleton' }],
    related: ['design-patterns-overview', 'solid-principles'],
  },

  {
    id: 'structural-patterns',
    domainId: 'design-patterns',
    title: 'Structural Patterns',
    summary:
      'Patterns for composing classes and objects into larger structures while keeping those structures flexible — wrapping, adapting, and simplifying without changing the components underneath.',
    keyPoints: [
      {
        text: 'Adapter: converts one interface into another that a client expects — makes incompatible interfaces work together without modifying either side',
        detail: 'Neither the client nor the adapted class needs to change — the adapter sits entirely in between, translating calls. That "modify neither side" property is exactly what makes Adapter the right choice for integrating third-party code or legacy classes whose source you either can\'t or shouldn\'t touch.',
      },
      {
        text: 'Decorator: attaches new behavior to an object dynamically by wrapping it in another object with the same interface — an alternative to subclassing for extending behavior',
        detail: 'Subclassing to add behavior locks the combination in at compile time and multiplies classes combinatorially (a `BufferedEncryptedFileInputStream` for every combination you\'d ever want) — Decorator lets any combination be assembled at runtime by stacking wrappers, one class per behavior instead of one class per combination.',
      },
      {
        text: 'Facade: provides a single simplified interface in front of a complex subsystem — hides complexity, doesn\'t add capability',
        detail: 'The "doesn\'t add capability" half matters: a Facade is not a replacement for the subsystem\'s full interface, it\'s a convenience layer for the common case. Callers who need finer control can still reach past it to the subsystem directly — Facade narrows the entry point, it doesn\'t remove the wider one.',
      },
      {
        text: 'Composite: treats individual objects and compositions of objects uniformly through a shared interface — the natural fit for tree structures',
        detail: 'The payoff is that client code never needs to distinguish a leaf from a branch — calling a method on a single file and calling the same method on an entire directory tree look identical from the caller\'s perspective, because both implement the same component interface and the branch simply forwards the call to its children.',
      },
      {
        text: 'Proxy: stands in for another object, controlling access to it (lazy loading, access control, remote calls, caching) behind the same interface',
        detail: 'Because the proxy implements the exact same interface as the real object, the client code that uses it doesn\'t know — or need to know — whether it\'s talking to the real thing directly, to a cached result, to a permission check, or to a stub that will make a network call underneath. The indirection is invisible at the call site.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Structural patterns — same shape, different intent',
        headers: ['Pattern', 'Wraps to…', 'Changes the interface?'],
        rows: [
          ['Adapter', 'make an incompatible interface fit', 'yes — translates one interface to another'],
          ['Decorator', 'add behavior transparently', 'no — same interface, extra behavior'],
          ['Proxy', 'control access transparently', 'no — same interface, extra control'],
          ['Facade', 'simplify a subsystem', 'yes — offers a smaller, simpler interface'],
        ],
      },
      {
        kind: 'code',
        title: 'Decorator — java.io is the canonical real-world example',
        code: 'interface DataSource { void write(String s); String read(); }\n\nclass FileDataSource implements DataSource { /* base behavior */ }\n\nabstract class DataSourceDecorator implements DataSource {\n    protected final DataSource wrapped;\n    DataSourceDecorator(DataSource wrapped) { this.wrapped = wrapped; }\n}\n\nclass CompressionDecorator extends DataSourceDecorator {\n    CompressionDecorator(DataSource wrapped) { super(wrapped); }\n    public void write(String s) { wrapped.write(compress(s)); }\n    public String read() { return decompress(wrapped.read()); }\n}\n\n// Stack decorators freely — this is exactly what new BufferedReader(new InputStreamReader(in)) does\nDataSource source = new CompressionDecorator(new EncryptionDecorator(new FileDataSource()));',
        caption: '`java.io`\'s stream classes (BufferedInputStream wrapping a FileInputStream, etc.) are Decorator applied throughout the standard library',
      },
      {
        kind: 'pitfall',
        title: 'Decorator stacks can obscure what actually runs',
        text: 'Wrapping `new BufferedReader(new InputStreamReader(new FileInputStream(f)))` three layers deep is idiomatic and fine — but decorator chains that grow long or are assembled dynamically at runtime can make it hard to answer "what actually happens when I call read()?" without tracing through every layer. Keep decorator stacks shallow and each decorator\'s added behavior single-purpose, the same discipline [[solid-principles]] asks of any single class.',
        detail: 'Static, compile-time-visible stacks (three constructor calls nested in one line) are easy to reason about because the whole chain is right there in the source. The hazard grows specifically when the stack is assembled dynamically — built up across several methods or driven by configuration — because then no single place in the code shows the full chain, and debugging means stepping through the call at runtime to discover it.',
      },
      {
        kind: 'note',
        title: 'Adapter vs. Decorator vs. Proxy — they look identical in a class diagram',
        text: 'All three wrap an object behind the same kind of "wrapper implements/extends the same interface it holds a reference to" shape — the difference is entirely about *intent*. Adapter exists because the wrapped object\'s interface doesn\'t match what\'s needed. Decorator exists to add behavior while keeping the interface identical. Proxy exists to control access while keeping the interface identical. Reading the code alone often can\'t tell you which pattern is "in play" — the surrounding comment or naming has to carry that intent.',
        detail: 'This is a case where the UML diagram genuinely cannot disambiguate the pattern — all three are "class X holds a reference to interface I and also implements I." Naming the wrapper class after its intent (`LegacyApiAdapter` vs. `CachingProxy` vs. `LoggingDecorator`) is what lets a future reader recover the intent without re-deriving it from behavior.',
      },
      {
        kind: 'bestPractice',
        title: 'Reach for Facade when onboarding friction is the actual problem',
        text: 'If new team members consistently need several paragraphs of explanation before they can call a subsystem correctly (initialize three services in the right order, then call a fourth), that\'s a strong signal for a Facade — one method that does the correct sequence internally. It doesn\'t remove the underlying complexity, it just gives it one safe entry point.',
        detail: 'The signal to watch for is repeated documentation, not just subsystem size — a large subsystem that\'s already used correctly through one obvious entry point doesn\'t need a Facade. It\'s specifically the pattern of "every new caller gets this wrong the first time" that indicates the correct-usage sequence should be code, not tribal knowledge.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 3, 7 — Decorator; Adapter and Facade' }],
    related: ['design-patterns-overview', 'coupling-and-cohesion'],
  },

  {
    id: 'behavioral-patterns-i',
    domainId: 'design-patterns',
    title: 'Behavioral Patterns I: Strategy, Observer, Command',
    summary:
      'Three of the most-used behavioral patterns: swapping an algorithm at runtime (Strategy), broadcasting state changes to interested listeners (Observer), and turning a request into a first-class object (Command).',
    keyPoints: [
      {
        text: 'Strategy: defines a family of interchangeable algorithms behind one interface, letting the algorithm vary independently of the code that uses it',
        detail: 'The context class holds a reference to the interface, not to any concrete algorithm, so swapping the algorithm never touches the context\'s own code — the alternative, an if/else per variant embedded in the context, means editing that same class every time a new variant is added.',
      },
      {
        text: 'Observer: defines a one-to-many dependency so that when one object (the subject) changes state, all its dependents (observers) are notified automatically',
        detail: 'The subject knows only that it holds a list of listeners conforming to some interface — it has no idea how many observers there are or what any of them do with the notification, which is what keeps the subject decoupled from every piece of code that reacts to its changes.',
      },
      {
        text: 'Command: encapsulates a request (an action plus its arguments) as an object, enabling queuing, logging, and undo/redo',
        detail: 'Turning "do this" into an object rather than an immediate method call is what unlocks all three capabilities at once — an object can be stored in a queue for later execution, appended to a log for replay, and paired with its own inverse operation for undo, none of which is possible with a plain method call that executes and vanishes.',
      },
      {
        text: 'In modern Java, Strategy and Command are frequently just a `Comparator`, `Runnable`, or custom functional interface passed as a lambda — the pattern still applies, the ceremony shrinks',
        detail: 'The pattern was invented to work around Smalltalk/C++\'s lack of first-class functions — a named class implementing a single-method interface was the only way to pass "a piece of behavior" around. Java 8\'s lambdas restore first-class functions, so the same structural idea now needs zero ceremony classes for the simple case.',
      },
      {
        text: 'Observer underlies GUI event listeners, reactive streams, and the classic publish-subscribe architecture — [[behavioral-patterns-ii]] continues with Iterator, Template Method, and State',
        detail: 'Recognizing these as the same pattern at different scales is useful: a button click listener, a reactive stream subscriber, and a message-broker subscription are all "notify registered dependents on a state change," just with different delivery mechanisms and different guarantees about ordering, buffering, and delivery reliability layered on top.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Three patterns, three distinct jobs',
        headers: ['Pattern', 'Problem', 'Java shape'],
        rows: [
          ['Strategy', 'swap an algorithm without an if/else per variant', 'interface + implementations, or a lambda'],
          ['Observer', 'notify many dependents of a state change', '`PropertyChangeListener`, GUI listeners, reactive streams'],
          ['Command', 'treat "do this action" as data you can queue/log/undo', '`Runnable`, a `Command` object with `execute()`/`undo()`'],
        ],
      },
      {
        kind: 'code',
        title: 'Strategy — classic form vs. modern lambda form',
        code: '// Classic: interface + one class per strategy\ninterface DiscountStrategy { double apply(double price); }\nclass NoDiscount implements DiscountStrategy { public double apply(double p) { return p; } }\nclass TenPercentOff implements DiscountStrategy { public double apply(double p) { return p * 0.9; } }\n\nclass Order {\n    private DiscountStrategy discount;\n    void setDiscount(DiscountStrategy d) { this.discount = d; }   // swap algorithm at runtime\n    double total(double price) { return discount.apply(price); }\n}\n\n// Modern: the interface is already there (Function<Double, Double>), skip the classes\nOrder order = new Order();\norder.setDiscount(price -> price * 0.9);   // the strategy itself, no named class needed',
      },
      {
        kind: 'code',
        title: 'Command — enabling undo',
        code: 'interface Command { void execute(); void undo(); }\n\nclass InsertTextCommand implements Command {\n    private final Document doc; private final String text; private final int pos;\n    InsertTextCommand(Document doc, String text, int pos) { this.doc = doc; this.text = text; this.pos = pos; }\n    public void execute() { doc.insert(pos, text); }\n    public void undo() { doc.delete(pos, pos + text.length()); }\n}\n\nDeque<Command> history = new ArrayDeque<>();\nvoid perform(Command c) { c.execute(); history.push(c); }\nvoid undoLast() { if (!history.isEmpty()) history.pop().undo(); }',
        caption: 'Because the request is an object, not just a method call, it can be stored, queued, and reversed — the essence of Command',
      },
      {
        kind: 'pitfall',
        title: 'Observer\'s classic weakness: forgotten unsubscription',
        text: 'A subject holding a strong reference to every registered observer will keep those observers (and everything they reference) alive for as long as the subject lives, even after the observer should logically be gone — a common source of memory leaks in long-lived GUI or event-bus code. Always pair `addListener` with a corresponding `removeListener` on teardown, or use weak references where the framework supports it.',
        detail: 'The leak is easy to miss because nothing crashes — the observer keeps receiving notifications it no longer needs, and everything it holds a reference to (potentially an entire view hierarchy) is retained too, silently growing memory usage over the lifetime of a long-running subject like an application-wide event bus.',
      },
      {
        kind: 'note',
        title: 'Strategy vs. State — nearly identical structure, different intent',
        text: 'Strategy and [[behavioral-patterns-ii|State]] have the same class diagram (a context holding a reference to an interchangeable interface implementation) but different purposes: Strategy is about the *client* choosing which algorithm to use, usually once, from the outside. State is about the *object itself* switching its own behavior automatically as its internal state changes, often without the client\'s awareness. If the swap is client-driven, it\'s Strategy; if it\'s self-driven based on internal transitions, it\'s State.',
        detail: 'A useful test when the diagram alone can\'t tell you which pattern you\'re looking at: ask who calls `setStrategy`/`setState` and how often. A one-time external assignment at construction or by a caller is Strategy; repeated internal reassignment triggered by the object\'s own transitions, invisible to the caller, is State.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 1, 2, 6 — Strategy; Observer; Command' }],
    related: ['design-patterns-overview', 'behavioral-patterns-ii'],
  },

  {
    id: 'behavioral-patterns-ii',
    domainId: 'design-patterns',
    title: 'Behavioral Patterns II: Iterator, Template Method, State',
    summary:
      'Three more behavioral patterns: traversing a collection without exposing its internals (Iterator), fixing an algorithm\'s skeleton while letting subclasses vary steps (Template Method), and letting an object change its behavior as its internal state changes (State).',
    keyPoints: [
      {
        text: 'Iterator: provides sequential access to elements of a collection without exposing whether it\'s an array, a linked list, or a tree — Java bakes this into the language via `Iterable`/`Iterator` and for-each',
        detail: 'Because traversal logic lives in the Iterator, not in client code, the underlying collection can change its internal representation entirely (array-backed to tree-backed) without breaking a single for-each loop written against it — the client only ever depends on `hasNext()`/`next()`, never on the storage structure.',
      },
      {
        text: 'Template Method: defines an algorithm\'s overall structure in a base class method, deferring specific steps to subclasses via overridable "hook" methods',
        detail: 'The base class owns the sequence — which step runs first, which second, whether a step is optional — while subclasses own only the content of individual steps. This is what stops every subclass from having to reimplement (and potentially get wrong) the overall algorithm shape.',
      },
      {
        text: 'State: lets an object appear to change its class at runtime by delegating behavior to one of several interchangeable State objects representing its current condition',
        detail: 'From the outside, calling the same method on the object produces different behavior depending on its current state, which is exactly what "appears to change its class" means — the object\'s identity stays fixed, but which State object it currently delegates to determines what actually happens.',
      },
      {
        text: 'Template Method is inheritance-based ("is-a" — a subclass fills in the blanks); State and Strategy are composition-based ("has-a" — an interchangeable object is swapped in)',
        detail: 'This is the concrete illustration of "favor composition over inheritance" playing out within a single family of related patterns: Template Method accepts the inheritance coupling because the algorithm\'s sequence genuinely is shared family behavior, while State and Strategy avoid it because the varying part is better modeled as a swappable collaborator.',
      },
      {
        text: 'All three trade a small amount of upfront structure for a large reduction in scattered conditional logic elsewhere in the codebase',
        detail: 'Without any of the three, the equivalent logic tends to end up as repeated if/else or switch statements on type or status scattered across every method that needs to branch on it — each pattern moves that branching into one place (a subclass, a State object, a Strategy implementation) at the cost of a bit more class structure.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Template Method — the algorithm is fixed, the steps are not',
        code: 'abstract class DataProcessor {\n    // The template: final so subclasses can\'t break the sequence\n    public final void process() {\n        readData();\n        transformData();\n        writeData();\n    }\n    protected abstract void readData();\n    protected abstract void transformData();\n    protected void writeData() { System.out.println("done"); }   // hook with a sensible default\n}\n\nclass CsvProcessor extends DataProcessor {\n    protected void readData() { /* parse CSV */ }\n    protected void transformData() { /* CSV-specific transform */ }\n    // writeData: uses the default from the base class\n}',
        caption: 'Marking the template method `final` is deliberate — it protects the algorithm\'s structure from being reordered by a careless subclass',
      },
      {
        kind: 'code',
        title: 'State — an object that changes its own behavior',
        code: 'interface OrderState { void ship(Order order); }\n\nclass PendingState implements OrderState {\n    public void ship(Order order) {\n        order.setState(new ShippedState());     // transitions itself\n        System.out.println("Shipping order...");\n    }\n}\nclass ShippedState implements OrderState {\n    public void ship(Order order) { throw new IllegalStateException("already shipped"); }\n}\n\nclass Order {\n    private OrderState state = new PendingState();\n    void setState(OrderState s) { this.state = s; }\n    void ship() { state.ship(this); }     // delegates — Order itself has no if/else on status\n}',
        caption: 'Without State, Order.ship() would need an if/else (or switch) on a status field, repeated at every method that behaves differently per status',
      },
      {
        kind: 'pitfall',
        title: 'Iterator: modifying a collection mid-traversal',
        text: 'This is a Java-specific hazard that the pattern itself doesn\'t protect against — structurally modifying a collection while an `Iterator` is mid-traversal throws `ConcurrentModificationException` in Java\'s fail-fast collections. The general behavioral pattern here is language-agnostic, but the concrete Java gotcha (use `Iterator.remove()`, not the collection\'s own `remove`, during a loop) is exactly the same one covered in the Java compendium\'s collections domain.',
        detail: 'The failure is deliberately loud rather than silently corrupting state — Java\'s fail-fast iterators track a modification count and throw as soon as they detect it changed underneath them, precisely because silently skipping or re-visiting elements after an external structural change would be a much harder bug to track down.',
      },
      {
        kind: 'note',
        title: 'Template Method needs inheritance; State and Strategy do not',
        text: 'Template Method is the one pattern in this pair that leans on subclassing rather than composition, which puts it in tension with "favor composition over inheritance" — it\'s justified specifically because the *algorithm\'s sequence* genuinely belongs to a single family of related types, and the variability is confined to individual steps, not the overall shape. If the variability turns out to be in the whole algorithm rather than isolated steps, that\'s a sign Strategy is the better fit.',
        detail: 'The distinction to watch for during design: if you find yourself wanting to override the *template method itself* (not just its hook steps) in some subclass, that\'s the sign the algorithm\'s overall shape isn\'t actually shared — at that point Template Method is being stretched past its fit, and extracting the whole algorithm as a Strategy implementation is usually the better move.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 8, 9, 10 — Template Method; Iterator; State' }],
    related: ['behavioral-patterns-i', 'design-patterns-overview'],
  },

  {
    id: 'compound-patterns-and-mvc',
    domainId: 'design-patterns',
    title: 'Compound Patterns & MVC',
    summary:
      'Real designs rarely use one pattern in isolation — they combine several to solve a larger problem. Model-View-Controller is the most widely recognized compound pattern: Observer, Strategy, and Composite working together.',
    keyPoints: [
      {
        text: 'A compound pattern is a combination of two or more patterns applied together to address a recurring higher-level design problem',
        detail: 'A single pattern solves one recurring shape of problem; real architectures usually face several interacting problems at once (how state changes propagate, how input gets handled, how a UI tree is structured), which is why the patterns that actually show up in production designs are rarely used one at a time.',
      },
      {
        text: 'MVC decomposes an application into Model (state and business logic), View (presentation), and Controller (translates user input into model changes)',
        detail: 'The split is along the axis of "what changes for what reason" — the Model changes when business rules dictate, the View changes when the Model changes, and the Controller exists purely to translate raw input events into the vocabulary the Model understands, keeping each concern replaceable independently of the others.',
      },
      {
        text: 'MVC is Observer (the View observes the Model for changes) + Strategy (the Controller is a swappable strategy for handling input) + Composite (the View is typically a tree of nested UI components)',
        detail: 'Seeing MVC as three familiar patterns wired together rather than one monolithic new idea is what makes it easy to learn quickly — anyone who already understands Observer, Strategy, and Composite individually can derive most of MVC\'s behavior just from knowing how those three combine.',
      },
      {
        text: 'The Model has no knowledge of any specific View — multiple Views can observe the same Model simultaneously and stay in sync automatically',
        detail: 'This one-way dependency is what lets the same underlying data be rendered as a chart in one View and a table in another simultaneously, both updating automatically on the same Model change, without either View knowing the other exists or the Model knowing either View exists.',
      },
      {
        text: 'Modern variants (MVP, MVVM, unidirectional-data-flow architectures) are all descendants of the same core idea: separate what changes (state), how it\'s shown, and how input is handled',
        detail: 'Where the variants differ is mainly *how* the View and the state stay in sync — MVC leans on Observer for the View to pull from the Model, MVVM introduces a ViewModel with data-binding to push changes automatically, and unidirectional-data-flow architectures replace direct Observer notification with a single, centralized state-update-and-re-render cycle — but all three still separate the same three concerns.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'MVC decomposed into the patterns it\'s built from',
        headers: ['MVC part', 'Responsibility', 'Pattern used'],
        rows: [
          ['Model', 'state + business rules; notifies on change', 'Observer (subject side)'],
          ['View', 'renders the model; often a nested UI tree', 'Observer (observer side) + Composite'],
          ['Controller', 'interprets input, updates the Model', 'Strategy (swappable input-handling behavior)'],
        ],
      },
      {
        kind: 'code',
        title: 'MVC sketch — the Model knows nothing about any View',
        code: 'interface ModelListener { void onChange(); }\n\nclass TemperatureModel {\n    private double celsius;\n    private final List<ModelListener> listeners = new ArrayList<>();\n\n    void addListener(ModelListener l) { listeners.add(l); }\n    void setCelsius(double c) {\n        this.celsius = c;\n        listeners.forEach(ModelListener::onChange);   // Observer: notify every registered View\n    }\n    double getCelsius() { return celsius; }\n}\n\nclass TemperatureView implements ModelListener {\n    private final TemperatureModel model;\n    TemperatureView(TemperatureModel model) { this.model = model; model.addListener(this); }\n    public void onChange() { System.out.println(model.getCelsius() + "°C"); }   // render current state\n}\n\nclass TemperatureController {\n    private final TemperatureModel model;\n    TemperatureController(TemperatureModel model) { this.model = model; }\n    void userEnteredFahrenheit(double f) { model.setCelsius((f - 32) * 5 / 9); }   // input -> Model change\n}',
      },
      {
        kind: 'pitfall',
        title: 'Letting the View reach into the Model\'s internals, or the Controller into the View\'s',
        text: 'MVC\'s entire value collapses if the boundaries leak — a View that directly mutates Model fields bypassing its public API, or a Controller that manipulates View widgets directly instead of going through the Model, reintroduces the tight coupling MVC exists to prevent. The Model should be completely presentation-agnostic; it should be possible to swap in an entirely different View (a CLI instead of a GUI) without touching the Model at all.',
        detail: 'The test for whether the boundaries actually hold: could the entire View layer be deleted and replaced with a different one (a CLI, a different GUI toolkit, a headless test harness) by touching only View and Controller code? If the Model has any import of, or reference to, View-specific types, that test fails and the decoupling MVC promised was never real.',
      },
      {
        kind: 'note',
        title: 'This is the same idea as Clean Architecture\'s boundaries, at a smaller scale',
        text: 'MVC\'s insistence that the Model not depend on any View is a specific instance of the general dependency-direction discipline covered in [[clean-architecture-boundaries]] and [[dependency-inversion-and-injection]] — business logic (Model) should not depend on presentation details (View), even though the View depends on the Model. Recognizing MVC as "the dependency rule applied to UI architecture" makes the broader architectural principles easier to internalize, and vice versa.',
        detail: 'Both ideas point the same direction for the same reason: the volatile, detail-heavy layer (presentation, frameworks, I/O) should depend on the stable, meaningful layer (business rules), never the reverse — because the volatile layer is the one that changes most often and should be free to change without dragging the stable core along with it.',
      },
    ],
    refs: [{ book: 'head-first-patterns', chapter: 'Ch. 12 — Compound Patterns (MVC)' }],
    related: ['behavioral-patterns-i', 'clean-architecture-boundaries', 'architectural-styles'],
  },

  {
    id: 'anti-patterns-and-pattern-misuse',
    domainId: 'design-patterns',
    title: 'Anti-Patterns & Pattern Misuse',
    summary:
      'An anti-pattern is a recognizable, recurring "solution" that looks reasonable but reliably makes a codebase worse. Many are what happens when a legitimate design pattern is applied without the problem it was meant to solve.',
    keyPoints: [
      {
        text: 'Golden Hammer: forcing every problem to fit one favorite pattern or technology regardless of fit — "when your only tool is Observer, every problem looks like a notification"',
        detail: 'This tends to come from genuine expertise, which is what makes it hard to self-diagnose — the developer who reaches for their favorite pattern every time usually reaches for it because they understand it deeply and it worked well the last several times, not out of carelessness, which is exactly why it keeps recurring unchecked.',
      },
      {
        text: 'God Object / Blob: a single class that knows or does too much, violating [[solid-principles]]\'s single-responsibility principle at the extreme',
        detail: 'It rarely starts as a God Object — it accretes one small, reasonable-looking addition at a time ("this class already knows about the user, might as well add the email logic here too") until the accumulated responsibilities can no longer be described in one sentence, and by then untangling it is a much bigger job than any single addition would have been.',
      },
      {
        text: 'Singleton overuse: using Singleton as a substitute for proper dependency management, producing hidden global state and untestable code ([[creational-patterns]])',
        detail: 'The "substitute for proper dependency management" framing is the key diagnostic — a legitimate singleton resource is fine; what turns it into an anti-pattern is using the pattern\'s global-access-point feature as a shortcut to avoid threading a dependency through constructors, which is exactly the convenience that later makes the code hard to test in isolation.',
      },
      {
        text: 'Premature pattern application: introducing a pattern\'s indirection (an interface with exactly one implementation, a Factory for a type that\'s never actually varied) before there\'s a real need for the flexibility it buys',
        detail: 'The indirection isn\'t free even when it\'s unused — every layer added "just in case" is a layer a future reader has to trace through to understand what actually happens, and if the anticipated variability never materializes, that cost was paid for nothing.',
      },
      {
        text: 'The fix for all of these is the same discipline: introduce a pattern in response to an observed, real problem — duplicated conditional logic, an untested global, a class that keeps growing — not preemptively',
        detail: 'All four anti-patterns above share one root cause despite looking different on the surface: applying structure before the evidence for needing it exists. Waiting for the concrete symptom (actual duplication, an actual failing test, an actual second concrete type) turns pattern selection from a guess into a response to something real.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Anti-pattern → usually a misapplied pattern',
        headers: ['Anti-pattern', 'What it looks like', 'Root cause'],
        rows: [
          ['God Object', 'one class with dozens of methods and responsibilities', 'missing single-responsibility discipline'],
          ['Singleton abuse', 'global mutable state accessed via `getInstance()` everywhere', 'reaching for Singleton instead of dependency injection'],
          ['Interface pollution', 'an interface with exactly one implementation, never varied', 'Strategy/Factory applied with no actual variability to abstract over'],
          ['Golden Hammer', 'the same pattern reused for unrelated problems', 'familiarity with one pattern outweighing fit to the problem'],
        ],
      },
      {
        kind: 'code',
        title: 'A Factory that solves no problem',
        code: '// Anti-pattern: a Factory with exactly one product, forever\ninterface ShapeFactory { Shape create(); }\nclass CircleFactory implements ShapeFactory { public Shape create() { return new Circle(); } }\n\n// If Circle is genuinely the only shape that will ever exist, this is pure ceremony:\nShape s = new CircleFactory().create();\n\n// vs. just:\nShape s2 = new Circle();   // equally correct, and honest about there being no variability yet',
        caption: 'Introduce the Factory when a second concrete Shape actually shows up — not before',
      },
      {
        kind: 'pitfall',
        title: 'Refactoring toward a pattern is fine; designing from a pattern up front rarely is',
        text: 'The Gang of Four book itself was written by observing patterns that had *already emerged* in good designs, then naming them — patterns describe recurring solutions found in practice, they were never meant to be a checklist applied before the problem exists. If a design decision is justified as "so we have the Factory pattern" rather than "so we can add new shape types without touching this code," that\'s the anti-pattern signal itself.',
        detail: 'The catalog is descriptive, not prescriptive, and that origin story is the whole justification for treating it that way — a pattern earns its place in code the same way it earned its place in the book: by being observed as the solution that a real, already-present problem converged on, not by being selected off a list in advance.',
      },
      {
        kind: 'note',
        title: 'YAGNI is the antidote',
        text: '"You Aren\'t Gonna Need It" — the principle that speculative flexibility (an abstraction, an interface, a configuration point for a variation that may never come) has a real, ongoing cost in complexity, and should be added when the need actually materializes, not in anticipation of it. This is the same discipline [[pragmatic-mindset]] and [[refactoring-catalog-core]] both apply from different directions: build the simplest thing that solves the current problem, and refactor toward a pattern when a second real use case shows up and the duplication or rigidity becomes concrete.',
        detail: 'YAGNI is often misread as "never add abstraction," but its actual claim is narrower and about timing: pay the cost of flexibility when the need is confirmed, not when it\'s merely plausible — a codebase that has been refactored under good test coverage can afford to wait, because introducing the pattern later, once the real shape of the variability is known, is cheap.',
      },
      {
        kind: 'bestPractice',
        title: 'Let the third occurrence justify the abstraction',
        text: 'A common informal rule: tolerate duplication or a hard-coded choice the first two times a similar need appears, and only extract a pattern (Strategy, Factory, Template Method) on the third occurrence, once the actual shape of the variability is clear from real examples rather than guessed in advance. Abstracting from a single example routinely produces the wrong abstraction — it\'s easier to generalize existing concrete code later than to correct a wrong abstraction everywhere it was already used.',
        detail: 'This is the "Rule of Three" from [[refactoring-catalog-core]] applied specifically to pattern selection — two data points are rarely enough to reveal which parts of the variation are incidental and which are the actual axis that needs to flex, so the abstraction built from two examples tends to bake in the wrong axis and needs correcting once the third case breaks its assumptions.',
      },
    ],
    refs: [
      { book: 'head-first-patterns', chapter: 'Ch. 1, 13 — Introduction; Patterns in the Real World' },
      { book: 'refactoring-fowler', chapter: 'Ch. 3 — Bad Smells in Code' },
    ],
    related: ['design-patterns-overview', 'creational-patterns', 'solid-principles', 'code-smells', 'technical-debt'],
  },
]
