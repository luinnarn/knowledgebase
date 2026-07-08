import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'solid-principles',
    domainId: 'architecture-principles',
    title: 'SOLID Principles',
    summary:
      'Five guidelines for object-oriented design — SRP, OCP, LSP, ISP, DIP — aimed at one goal: let the system change without every change rippling outward. They are heuristics to weigh, not laws to obey blindly.',
    keyPoints: [
      'SRP — a module should have one reason to change: one responsibility, one *actor* it answers to',
      'OCP — open for extension, closed for modification: add behavior without editing working code',
      'LSP — subtypes must be substitutable for their base type without surprising callers',
      'ISP — many small, client-specific interfaces beat one fat interface nobody fully needs',
      'DIP — depend on abstractions, not concretions (see [[dependency-inversion-and-injection]])',
      'Applied dogmatically to code that never changes, SOLID is pure overhead — it earns its keep on code under active change',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The five principles, and the smell each one prevents',
        headers: ['Principle', 'Rule', 'Smell it prevents'],
        rows: [
          ['SRP', 'One reason to change', 'Divergent Change — unrelated edits keep colliding in one class'],
          ['OCP', 'Extend without modifying', 'Every new case means editing (and re-testing) old, working code'],
          ['LSP', 'Subtypes honor the base contract', 'Callers riddled with `instanceof` checks to work around a subtype'],
          ['ISP', 'Slim, client-specific interfaces', 'Implementers forced to stub methods they have no use for'],
          ['DIP', 'Depend on abstractions', 'High-level policy wired directly to low-level, volatile detail'],
        ],
      },
      {
        kind: 'paragraph',
        text: '**SRP** is the most misquoted: it does not mean "a class should do one *thing*" in some atomic sense, but that it should answer to one *actor* — one stakeholder or reason to change. A class that both formats a report for Finance and validates it for Compliance has two actors; a change requested by one can break the other\'s expectations without anyone noticing until it ships.',
      },
      {
        kind: 'code',
        title: 'SRP: two actors, one class → split by reason to change',
        code: 'class Invoice {\n    double calculateTotal() { /* business rule Finance owns */ }\n    String toHtml() { /* presentation Marketing owns */ }\n    void saveToDatabase() { /* persistence Ops owns */ }\n}\n\n// Three actors, three reasons to change → three classes:\nclass Invoice { double calculateTotal() { /* ... */ } }\nclass InvoiceHtmlView { String render(Invoice invoice) { /* ... */ } }\nclass InvoiceRepository { void save(Invoice invoice) { /* ... */ } }',
      },
      {
        kind: 'paragraph',
        text: '**OCP** is achieved through abstraction, not foresight: you don\'t need to predict every future case, just make sure new cases can be *added* as new code (a new subclass, a new `Strategy`) rather than edits to existing, tested code. A `switch` on a type code that keeps growing new `case`s is the opposite of OCP — see [[composing-methods-and-conditionals]] for the refactoring that replaces it with polymorphism.',
      },
      {
        kind: 'pitfall',
        title: 'LSP: the classic Square-extends-Rectangle trap',
        text: 'Mathematically a square is a rectangle, so `Square extends Rectangle` looks reasonable — until `setWidth`/`setHeight` on a `Rectangle` reference silently also change the other dimension on a `Square`, breaking any code that assumed setting one didn\'t affect the other. LSP violations hide in behavior, not signatures: the types check out, but the *contract* — what callers are entitled to assume — doesn\'t hold. If a subtype needs `instanceof` checks or narrows preconditions/widens postconditions in surprising ways, it isn\'t really substitutable.',
      },
      {
        kind: 'note',
        title: 'ISP guards the blast radius of interface change',
        text: 'A fat interface with twelve methods means every implementer depends on all twelve, even if it only uses two — and every implementer recompiles/redeploys when any of the twelve changes. Splitting it into narrow, role-specific interfaces (`Readable`, `Writable` instead of one `Storage`) means a class depends only on what it actually calls, shrinking its blast radius when unrelated methods change.',
      },
      {
        kind: 'bestPractice',
        title: 'Treat DIP as the mechanism that makes the other four affordable',
        text: 'SRP, OCP, and ISP all ask for more, smaller units — which only stays manageable if those units are wired together through abstractions instead of concrete `new`s scattered everywhere. DIP (depend on interfaces; let something else supply the implementation) is what keeps that decomposition from turning into a tangle. See [[dependency-inversion-and-injection]] for the mechanics.',
      },
    ],
    refs: [
      { book: 'clean-architecture', chapter: 'Part III — Design Principles (Ch. 7–11)' },
      { book: 'head-first-patterns', chapter: 'Ch. 1 — Intro to Design Patterns (OO principles)' },
    ],
    related: ['coupling-and-cohesion', 'dependency-inversion-and-injection', 'code-smells', 'creational-patterns'],
  },

  {
    id: 'coupling-and-cohesion',
    domainId: 'architecture-principles',
    title: 'Coupling & Cohesion',
    summary:
      'Cohesion measures how tightly a module\'s own responsibilities belong together; coupling measures how tightly it is bound to other modules. Every durable design heuristic — SRP, layering, component boundaries — is really an argument for raising one and lowering the other.',
    keyPoints: [
      'High cohesion: everything inside a module serves one purpose and changes together',
      'Low coupling: modules interact through narrow, stable interfaces and know little about each other\'s internals',
      'Coupling spectrum (tightest → loosest): content, common, control, stamp, data',
      'Cohesion spectrum (weakest → strongest): coincidental, logical, temporal, procedural, communicational, functional',
      'Afferent (Ca) / efferent (Ce) coupling counts and instability I = Ce / (Ca + Ce) make coupling measurable, not just a feeling',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Coupling, tightest to loosest',
        headers: ['Kind', 'What\'s shared', 'Why it\'s costly'],
        rows: [
          ['Content', 'One module reaches into another\'s internals directly', 'Any internal change breaks the caller — no encapsulation at all'],
          ['Common', 'Modules share global/mutable state', 'Hidden channel of influence; order-of-execution bugs'],
          ['Control', 'One module passes a flag telling another *how* to behave', 'Caller must know callee\'s internal logic to pick the flag'],
          ['Stamp', 'A whole object passed when only a few fields are used', 'Caller depends on fields it doesn\'t need — any of them changing risks breakage'],
          ['Data', 'Only primitive/simple data passed, exactly what\'s needed', 'The loosest practical form — the goal to aim for'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Cohesion is the mirror image: a class with **functional cohesion** does one well-defined thing end to end (a `TaxCalculator`); one with **coincidental cohesion** bundles unrelated methods that happen to live in the same file (a `Utils` class with string helpers, date helpers, and network helpers). Low cohesion doesn\'t crash anything — it just means the class has no reason to exist as a unit, and every change to it risks disturbing unrelated callers.',
      },
      {
        kind: 'code',
        title: 'Stamp coupling → data coupling',
        code: '// Stamp coupling: whole Customer passed, only the email is used —\n// this method now depends on every field Customer has.\nvoid sendReceipt(Customer customer, Order order) {\n    mailer.send(customer.getEmail(), order.toReceiptText());\n}\n\n// Data coupling: depends only on the data it actually needs.\nvoid sendReceipt(String recipientEmail, String receiptText) {\n    mailer.send(recipientEmail, receiptText);\n}',
      },
      {
        kind: 'note',
        title: 'Making coupling a number: Ca, Ce, and instability',
        text: 'Afferent coupling (Ca) counts classes *outside* a component that depend on it; efferent coupling (Ce) counts classes *inside* it that depend on something outside. Instability I = Ce / (Ca + Ce) ranges from 0 (maximally stable — many depend on it, it depends on nothing, so it should rarely change) to 1 (maximally unstable — depends on everything, nothing depends on it, safe to change often). Stable components should be abstract; volatile ones concrete — see [[component-principles]] (the Stable Dependencies and Stable Abstractions principles) for the design rule this metric backs.',
      },
      {
        kind: 'pitfall',
        title: 'Low cohesion causes shotgun surgery',
        text: 'When responsibilities that logically belong together are scattered across unrelated classes, one conceptual change (e.g. "add a new payment method") requires touching a dozen files instead of one. This is the **Shotgun Surgery** smell ([[code-smells]]) — it is a cohesion problem wearing a change-management costume, and the fix is almost always to move the scattered pieces back together (Move Method/Field, see [[refactoring-catalog-core]]).',
      },
    ],
    refs: [
      { book: 'clean-architecture', chapter: 'Ch. 12–14 — Component Coupling' },
      { book: 'refactoring-fowler', chapter: 'Ch. 3 — Bad Smells in Code' },
    ],
    related: ['solid-principles', 'component-principles', 'code-smells'],
  },

  {
    id: 'component-principles',
    domainId: 'architecture-principles',
    title: 'Component Principles',
    summary:
      'Six principles for grouping classes into deployable components and wiring the components together: three about what belongs in a component (REP, CCP, CRP), three about how components should depend on each other (ADP, SDP, SAP).',
    keyPoints: [
      'REP — the granule of reuse is the granule of release: a component is a unit you can version and release, not just a folder',
      'CCP — classes that change for the same reason, at the same time, belong in the same component (a packaging-level SRP)',
      'CRP — don\'t force clients to depend on classes they don\'t use just because they share a component with ones they do',
      'ADP — the component dependency graph must have no cycles',
      'SDP — depend in the direction of stability (toward components with low instability I)',
      'SAP — a component should be as abstract as it is stable; stable-and-concrete components become rigid',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Cohesion trio vs. coupling trio',
        headers: ['Group', 'Principle', 'Tension'],
        rows: [
          ['Cohesion', 'REP, CCP, CRP', 'REP/CCP push components *larger* (bundle what changes together); CRP pushes them *smaller* (don\'t bundle what unrelated clients don\'t need)'],
          ['Coupling', 'ADP, SDP, SAP', 'Keep the dependency graph acyclic, pointed toward stability, and keep stable things abstract'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The three cohesion principles are in real tension, and every component design is a trade-off between them: maximize REP/CCP and you get large components that are easy to release together but drag in classes a given client doesn\'t need (hurting CRP); maximize CRP and you get many tiny, precisely-scoped components with release-coordination overhead. Early in a project, teams typically favor CCP (fewer components, less release ceremony); as reuse grows, the balance shifts toward CRP.',
      },
      {
        kind: 'note',
        title: 'Breaking a dependency cycle (ADP)',
        text: 'If component A depends on B and B depends on A, changes ripple in both directions forever and neither can be released independently. The standard fix is the **Dependency Inversion Principle** applied at component scale: extract the interface that B actually needs from A into a new component (or into B itself) so A depends on that abstraction instead of on B directly — turning the cycle into a directed acyclic graph. This is the same move as [[dependency-inversion-and-injection]], one level up.',
      },
      {
        kind: 'paragraph',
        text: 'SDP formalizes "depend on things more stable than you": using the instability metric I = Ce/(Ca+Ce) from [[coupling-and-cohesion]], every dependency arrow should point from a higher-I component to a lower-I one. SAP then says a component\'s abstractness should track its stability — a stable component (many depend on it) that is also concrete becomes **rigid**: hard to change, and everyone depending on it feels every change. The fix is to push abstractions (interfaces) into the stable component and concrete, volatile implementations into unstable ones that depend on it — which is exactly the shape [[clean-architecture-boundaries]] describes at the whole-system scale.',
      },
      {
        kind: 'pitfall',
        title: 'The "zone of pain" and the "zone of uselessness"',
        text: 'Plotting components by abstractness against instability reveals two danger zones: maximally stable-and-concrete components (the *zone of pain* — rigid, everyone depends on them, they never change but are painful when they must) and maximally unstable-and-abstract components (the *zone of uselessness* — interfaces nobody implements or depends on). Healthy components sit near the "main sequence" line connecting stable-abstract to unstable-concrete.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 12–14 — Component Cohesion and Coupling' }],
    related: ['coupling-and-cohesion', 'clean-architecture-boundaries', 'dependency-inversion-and-injection'],
  },

  {
    id: 'clean-architecture-boundaries',
    domainId: 'architecture-principles',
    title: 'Clean Architecture Boundaries',
    summary:
      'The Dependency Rule: source-code dependencies may only point inward, from mechanism toward policy. Concentric layers — Entities, Use Cases, Interface Adapters, Frameworks & Drivers — keep business rules ignorant of the database, the UI, and the framework du jour.',
    keyPoints: [
      'Dependency Rule: nothing in an inner circle may know anything about an outer circle',
      'Entities = enterprise-wide business rules; Use Cases = application-specific business rules that orchestrate entities',
      'Interface Adapters translate between use-case-friendly data and framework/DB/UI-friendly data',
      'Frameworks & Drivers (web framework, database, UI toolkit) are the outermost, most volatile, most replaceable ring',
      'Crossing a boundary inward-to-outward uses an interface owned by the inner ring; the outer ring implements it (dependency inversion in practice)',
      'Data crossing boundaries should be simple structures (DTOs), never framework/ORM entities leaking into business rules',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The four rings, outside in',
        headers: ['Ring', 'Contains', 'Knows about'],
        rows: [
          ['Frameworks & Drivers', 'Web framework, DB driver, UI, external services', 'Everything inward'],
          ['Interface Adapters', 'Controllers, Presenters, Gateways', 'Use Cases\' interfaces; converts to/from framework shapes'],
          ['Use Cases', 'Application-specific business rules (interactors)', 'Entities only'],
          ['Entities', 'Enterprise-wide business rules and data', 'Nothing outward — pure domain logic'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The Dependency Rule is the one non-negotiable constraint: "source code dependencies can only point inwards." A `UserRepository` interface lives with the use case that needs it (inner ring); a `SqlUserRepository` implementation lives in the outer ring and implements that interface. The use case never imports anything from the persistence framework — it depends on an abstraction it owns, and the database code depends on that abstraction too, just from the other side. This is [[dependency-inversion-and-injection]] applied at the architectural seam, and it is what makes the business rules testable without a real database ([[testing-philosophy]]).',
      },
      {
        kind: 'code',
        title: 'Crossing the boundary through an owned interface',
        code: '// Inner ring (use case) defines what it needs, in its own vocabulary:\npublic interface UserRepository {\n    Optional<User> findById(String id);\n}\n\npublic class RegisterUserInteractor {\n    private final UserRepository users;   // depends on the abstraction, not on SQL\n    RegisterUserInteractor(UserRepository users) { this.users = users; }\n    // ... business rule uses `users` without knowing it is Postgres, Mongo, or memory\n}\n\n// Outer ring (frameworks & drivers) implements it:\npublic class PostgresUserRepository implements UserRepository {\n    public Optional<User> findById(String id) { /* SQL here */ }\n}',
      },
      {
        kind: 'note',
        title: 'The Humble Object pattern at the boundary',
        text: 'Some things are inherently hard to unit test — a UI widget, a database gateway. The Humble Object pattern splits such code into two: a thin, "humble" piece with almost no logic (hard to test, but there\'s barely anything to get wrong) and a testable piece holding all the actual decisions. A `Presenter` that computes what to display (testable) feeding a `View` that just paints it (humble) is the classic instance. It is how boundary code stays honest to the Dependency Rule without sacrificing testability.',
      },
      {
        kind: 'pitfall',
        title: 'Leaking the ORM entity into the business rules',
        text: 'Passing a JPA `@Entity` or a framework request/response object straight into use-case logic silently violates the Dependency Rule: the business rule now depends on the ORM\'s annotations and lifecycle (lazy loading, detached-entity exceptions) even though no `import` makes that obvious. Map to plain domain objects at the boundary — the extra mapping code is the cost of keeping business rules ignorant of infrastructure, and it is cheap compared to the alternative of a domain model that can\'t be instantiated without a database connection.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 22 — The Clean Architecture' }],
    related: ['dependency-inversion-and-injection', 'component-principles', 'use-case-driven-design'],
  },

  {
    id: 'dependency-inversion-and-injection',
    domainId: 'architecture-principles',
    title: 'Dependency Inversion & Injection',
    summary:
      'Three related but distinct ideas get conflated under "DI": the Dependency Inversion **Principle** (depend on abstractions), Dependency **Injection** (a technique for supplying those abstractions from outside), and an IoC **container** (one optional tool for wiring injections automatically). You can have the first two without ever touching a container.',
    keyPoints: [
      'DIP: high-level modules should not depend on low-level modules — both should depend on abstractions',
      'Dependency Injection: a class receives its collaborators (via constructor, ideally) rather than constructing them itself',
      'An IoC container automates wiring injections but is a convenience, not a requirement — "poor man\'s DI" (plain constructors) works fine at small scale',
      'Constructor injection over field/setter injection: dependencies become explicit, final, and impossible to forget',
      'DI is what makes swapping a real collaborator for a test double trivial — the core enabler behind [[testing-philosophy]]',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Inverted: the high-level class depends on an interface it owns',
        code: '// Before: OrderService is welded to a concrete, volatile detail.\nclass OrderService {\n    private final SmtpMailer mailer = new SmtpMailer();  // hard-coded, untestable\n    void placeOrder(Order o) { /* ... */ mailer.send(o.confirmationEmail()); }\n}\n\n// After: depends on an abstraction; the concrete choice is supplied from outside.\ninterface Notifier { void send(String message); }\n\nclass OrderService {\n    private final Notifier notifier;\n    OrderService(Notifier notifier) { this.notifier = notifier; }   // constructor injection\n    void placeOrder(Order o) { /* ... */ notifier.send(o.confirmationEmail()); }\n}',
      },
      {
        kind: 'table',
        caption: 'Three ideas, one abbreviation',
        headers: ['Term', 'What it is', 'Required?'],
        rows: [
          ['DIP', 'A design principle: depend on abstractions, not concretions', 'Foundational — the goal'],
          ['Dependency Injection', 'A technique: pass collaborators in instead of constructing them', 'The mechanism — usually via constructor'],
          ['IoC Container', 'A tool that constructs the object graph and injects automatically', 'Optional — helpful at scale, unnecessary for a small app'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Service Locator hides dependencies instead of exposing them',
        text: 'An alternative to injection is having a class reach into a global registry (`ServiceLocator.get(Mailer.class)`) to fetch what it needs. It looks like it solves the same problem, but it doesn\'t: the class\'s dependencies are no longer visible in its constructor signature, so nothing forces callers (or tests) to notice what it needs, and swapping an implementation for a test means manipulating global state instead of passing an argument. Prefer injection — dependencies that show up in the constructor are dependencies you cannot forget.',
      },
      {
        kind: 'bestPractice',
        title: 'Make missing dependencies a compile error, not a runtime surprise',
        text: 'Constructor injection with `final` fields means an object can never exist in a half-wired state — leave out a required collaborator and the code doesn\'t compile. Setter injection allows a fully-constructed-but-not-ready object to exist, silently, until something calls a method that needed the missing setter.',
      },
      {
        kind: 'note',
        title: 'When a container earns its complexity',
        text: 'A handful of classes can be wired by hand in a `main` method ("poor man\'s DI") with zero extra machinery — completely legitimate. A container (Spring, Guice, ...) starts paying for itself once the object graph is large enough that manual wiring becomes its own maintenance burden, or when lifecycle concerns (scopes, lazy proxies, configuration profiles) are genuinely needed. Reaching for one on a small app just to "do DI properly" adds indirection with no matching benefit.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 11 — DIP; Ch. 25 — Layers and Boundaries' }],
    related: ['solid-principles', 'clean-architecture-boundaries', 'architectural-styles'],
  },

  {
    id: 'architectural-styles',
    domainId: 'architecture-principles',
    title: 'Architectural Styles',
    summary:
      'Layered, hexagonal (ports and adapters), and microservices are different granularities of the same underlying move — isolate policy from mechanism — trading simplicity for deployability, and in-process coupling for network coupling.',
    keyPoints: [
      'Layered: simplest to reason about; risk is layers becoming leaky ("just this once, skip the service layer")',
      'Hexagonal / ports & adapters: the domain core exposes ports (interfaces); adapters plug in UI, DB, messaging around it — same intent as [[clean-architecture-boundaries]]',
      'Microservices: independently deployable services, each owning its data; buys team/deployment autonomy, taxes you with distributed-systems problems (network failure, eventual consistency, versioning across services)',
      '"Monolith first": most systems don\'t know their true service boundaries on day one — starting modular-monolith and extracting services once boundaries are proven is often cheaper than guessing upfront',
      'A distributed monolith — services that must deploy together and share a database — has all of microservices\' operational cost with none of its independence benefit',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Same intent, different granularity',
        headers: ['Style', 'Unit of isolation', 'Deployability', 'Main tax'],
        rows: [
          ['Layered', 'In-process layer (UI / service / data)', 'One deployable unit', 'Layers leak under time pressure'],
          ['Hexagonal', 'Domain core vs. adapters', 'One deployable unit (usually)', 'Discipline to keep the core pure'],
          ['Microservices', 'Independently deployable service', 'Each service deploys alone', 'Network calls, partial failure, data consistency across services'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Hexagonal architecture and Clean Architecture are close cousins: both put the domain model at the center, both forbid it from depending on infrastructure, both use interfaces ("ports" in hexagonal terms) to let infrastructure ("adapters") plug in from the outside. The vocabulary differs; the Dependency Rule ([[clean-architecture-boundaries]]) is the same idea either way.',
      },
      {
        kind: 'note',
        title: 'Microservices trade coupling, they don\'t remove it',
        text: 'Splitting a monolith into services doesn\'t eliminate coupling between the pieces of a system that genuinely depend on each other — it moves that coupling from an in-process method call (fast, transactional, type-checked) to a network call (slow, partial-failure-prone, versioned separately). That trade is worth it when the boundary really is a natural seam — different scaling needs, different teams, different release cadence — and expensive overhead when it isn\'t.',
      },
      {
        kind: 'pitfall',
        title: 'The distributed monolith',
        text: 'Splitting code into separately-deployed services while they still share a database, must be deployed together to avoid breaking each other, or communicate through synchronous chains several services deep, produces a system with microservices\' full operational cost (network calls, service discovery, monitoring N processes) and none of the payoff (you still can\'t deploy or scale them independently). This usually means the service boundaries were drawn along technical lines, not along real business/data-ownership boundaries — see [[use-case-driven-design]] for how boundaries should actually be found.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 15–17, 34 — Boundaries; The Missing Chapter' }],
    related: ['clean-architecture-boundaries', 'use-case-driven-design', 'component-principles'],
  },

  {
    id: 'use-case-driven-design',
    domainId: 'architecture-principles',
    title: 'Use-Case-Driven Design',
    summary:
      'A codebase\'s top-level structure should announce what the system *does*, not which framework renders it — "screaming architecture." Organizing around use cases rather than technical layers keeps intent visible and framework choices genuinely swappable.',
    keyPoints: [
      'Screaming architecture: the top-level package layout should scream "shopping cart" or "loan origination," not "controllers/services/repositories"',
      'A use case (interactor) is a first-class object: one class, one application-specific business operation, orchestrating entities to fulfill it',
      'Package-by-feature over package-by-layer keeps everything one use case touches physically close together (raising cohesion, see [[coupling-and-cohesion]])',
      'Frameworks are details — a web framework is a delivery mechanism plugged into use cases, not the thing the architecture is organized around',
      'This is what makes a system\'s intent legible to a new developer from the folder structure alone, before reading a line of logic',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A use case as an explicit, testable object',
        code: 'public interface RegisterUser {\n    Result execute(RegisterUserRequest request);\n}\n\npublic class RegisterUserInteractor implements RegisterUser {\n    private final UserRepository users;\n    private final Notifier notifier;\n\n    RegisterUserInteractor(UserRepository users, Notifier notifier) {\n        this.users = users;\n        this.notifier = notifier;\n    }\n\n    public Result execute(RegisterUserRequest request) {\n        // application-specific business rule, orchestrating entities —\n        // no HTTP, no SQL, no framework import in sight\n        if (users.findByEmail(request.email()).isPresent()) return Result.duplicateEmail();\n        User user = User.register(request.email(), request.password());\n        users.save(user);\n        notifier.send(user.welcomeMessage());\n        return Result.success(user.id());\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: '"Package by layer" hides what the app does',
        text: 'A top level of `controllers/`, `services/`, `repositories/`, `models/` tells you the *tech stack*, not the *product* — you could paste the same four folder names onto a payroll system or a chat app. Worse, adding one feature ("cancel a subscription") means touching one file in each of four different top-level folders, scattering a single cohesive change across the whole tree — the packaging mirror image of the Shotgun Surgery smell ([[code-smells]]).',
      },
      {
        kind: 'bestPractice',
        title: 'Package by feature, not by layer',
        text: 'A folder per use case or feature (`registration/`, `checkout/`, `refunds/`) — each containing its own interactor, its own request/response types, and its own narrow slice of controller/gateway code — keeps everything one change touches in one place, and makes the folder tree double as a map of what the system does.',
      },
      {
        kind: 'note',
        title: 'The framework is a plugin, not the foundation',
        text: 'Screaming architecture is the practical test of the Dependency Rule ([[clean-architecture-boundaries]]): if replacing the web framework, the database, or the UI toolkit would require restructuring the use cases themselves, the architecture was organized around the framework, not the application. A system organized around its use cases can swap any of those delivery mechanisms by writing new adapters, leaving the use cases untouched.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 21 — Screaming Architecture' }],
    related: ['clean-architecture-boundaries', 'architectural-styles', 'dependency-inversion-and-injection'],
  },
]
