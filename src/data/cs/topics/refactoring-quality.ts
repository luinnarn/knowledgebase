import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'code-smells',
    domainId: 'refactoring-quality',
    title: 'Code Smells',
    summary:
      'A smell is a surface symptom pointing at a deeper design problem — not a bug, and not always wrong, but a signal worth investigating. Naming them gives a team shared vocabulary for "something here is making change harder than it should be."',
    keyPoints: [
      {
        text: 'A smell doesn\'t mean the code is incorrect — it means it *resists change*, which is where the real cost shows up',
        detail: 'This distinction is why smells are found by reading and modifying code, not by running it — a smelly method can execute perfectly correctly today and still cost far more than it should the next time someone needs to add a case to it, because the cost of a smell is paid in future effort, not present-day bugs.',
      },
      {
        text: 'Duplicated Code is the most fundamental smell — nearly every other smell either causes it or is caused by it',
        detail: 'Almost every other named smell traces back to duplication in some form: Shotgun Surgery is what happens when duplicated logic must be updated in every copy, Divergent Change often stems from a class absorbing copy-pasted variants of similar behavior, and a type-code switch statement is itself frequently duplicated logic scattered across call sites.',
      },
      {
        text: 'Long Method / Large Class: size alone isn\'t the problem, low cohesion inside that size is',
        detail: 'A long method that reads as one coherent, linear narrative from top to bottom is not automatically a problem — the actual signal is whether the method is doing several unrelated things stitched together, which is a cohesion problem that merely correlates with length rather than being caused by it.',
      },
      {
        text: 'Feature Envy: a method more interested in another class\'s data than its own — a sign it\'s living in the wrong place',
        detail: 'A method that repeatedly reaches into another object\'s fields or getters to do its work is a strong signal that the behavior and the data it operates on have drifted apart — moving the method to live alongside the data it actually uses (Move Method) usually collapses several getter calls into direct field access and improves cohesion on both sides.',
      },
      {
        text: 'Divergent Change (one class changes for many unrelated reasons) and Shotgun Surgery (one reason to change touches many classes) are mirror-image cohesion problems',
        detail: 'Both describe the same underlying misalignment between responsibilities and classes, just observed from opposite directions: Divergent Change is what you see looking at one class that has absorbed too many unrelated jobs, while Shotgun Surgery is what you see looking at one job whose pieces have been scattered across too many classes.',
      },
      {
        text: 'Smells guide *which* refactoring to reach for — see [[refactoring-catalog-core]] for the mechanics',
        detail: 'Smells and refactorings are deliberately paired in Fowler\'s catalog — recognizing "this is Feature Envy" or "this is Duplicated Code" is what tells you which specific mechanical refactoring (Move Method, Extract Method) actually addresses the problem, rather than leaving "something feels off here" as a vague, unactionable observation.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Common smells and their usual fix',
        headers: ['Smell', 'What it looks like', 'Likely refactoring'],
        rows: [
          ['Duplicated Code', 'Same expression/structure copy-pasted', 'Extract Method, then call it from both places'],
          ['Long Method', 'A method that needs scrolling to read', 'Extract Method on cohesive chunks'],
          ['Long Parameter List', 'Four, five, six positional parameters', 'Introduce Parameter Object'],
          ['Feature Envy', 'Method reaches into another object\'s data repeatedly', 'Move Method to the object it envies'],
          ['Data Clumps', 'The same 3–4 fields always travel together as parameters', 'Extract a class for the clump'],
          ['Primitive Obsession', 'A `String`/`int` standing in for a real concept (money, email)', 'Replace primitive with a small value type'],
          ['Switch Statements', 'The same type-code switch repeated at several call sites', 'Replace Conditional with Polymorphism'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Smells are heuristics, not indictments — a 40-line method that reads top-to-bottom as one clear narrative is not automatically a "Long Method" problem; a `Utils` class gathering three unrelated one-line helpers might be a pragmatic trade-off, not a crisis. The judgment call smells demand is: *does this shape make the next change harder than it needs to be?* If the answer is no, leave it — refactoring for its own sake, on code nobody is touching, is pure cost with no payoff (see [[technical-debt]] on when paying down debt is actually worth it).',
      },
      {
        kind: 'code',
        title: 'Feature Envy — the method is jealous of the wrong class',
        code: '// Envious: OrderPrinter cares more about Order\'s internals than its own.\nclass OrderPrinter {\n    String describe(Order order) {\n        return order.getCustomerName() + " ordered " + order.getItems().size()\n             + " items totaling $" + order.getItems().stream().mapToDouble(Item::getPrice).sum();\n    }\n}\n\n// Fixed: the logic moves to live with the data it uses (Move Method).\nclass Order {\n    String describe() {\n        return customerName + " ordered " + items.size()\n             + " items totaling $" + items.stream().mapToDouble(Item::getPrice).sum();\n    }\n}',
      },
      {
        kind: 'note',
        title: 'Divergent Change vs. Shotgun Surgery — opposite symptoms, same root cause',
        text: 'Divergent Change: one class gets edited for many unrelated reasons (low cohesion — it\'s doing too many jobs). Shotgun Surgery: one conceptual change requires editing many classes (the pieces of one job are scattered — also low cohesion, viewed from the other direction). Both point back to [[coupling-and-cohesion]]: responsibilities and the classes that hold them are misaligned, just in opposite ways.',
        detail: 'Recognizing which of the two you are looking at points at a different fix: Divergent Change usually calls for splitting one overloaded class into several focused ones, while Shotgun Surgery usually calls for consolidating scattered pieces of one responsibility back into a single place — applying the wrong one (splitting when things are already scattered, or merging when one class is already overloaded) makes the underlying cohesion problem worse, not better.',
      },
      {
        kind: 'pitfall',
        title: 'Chasing smells with no tests underneath',
        text: 'A smell tells you *where* to refactor; it says nothing about whether you can do so safely. Refactoring — by definition — must not change observable behavior, and the only way to know you haven\'t is a test suite that exercises that behavior before and after. Fixing a smell in code with no regression tests is not refactoring, it\'s just editing and hoping — see [[refactoring-and-testing-safety]].',
        detail: 'This is a common trap for anyone newly excited about smells: the smell catalog answers "where should I look," but skips entirely over "how do I know I haven\'t broken anything," which is a completely separate concern that a test suite — not the refactoring technique itself — is what actually answers.',
      },
    ],
    refs: [{ book: 'refactoring-fowler', chapter: 'Ch. 3 — Bad Smells in Code' }],
    related: ['refactoring-catalog-core', 'technical-debt', 'coupling-and-cohesion'],
  },

  {
    id: 'refactoring-catalog-core',
    domainId: 'refactoring-quality',
    title: 'Refactoring Catalog: Core Mechanics',
    summary:
      'Refactoring is the disciplined technique of restructuring code without changing its observable behavior, in small, independently verifiable steps. A handful of mechanical moves — Extract, Inline, Rename, Move — cover the large majority of real refactoring work.',
    keyPoints: [
      {
        text: 'Extract Method/Function: pull a cohesive fragment out into a well-named method, replacing it with a call',
        detail: 'The value is almost entirely in the name chosen for the extracted method — a well-named extraction turns "read these five lines to understand what they do" into "read one method name," which is a real comprehension win even though the extraction changes nothing about what the code actually executes.',
      },
      {
        text: 'Extract Variable: name an expression so the code reads as intent rather than arithmetic',
        detail: 'An inline expression like `price * quantity * (1 - discount)` forces a reader to mentally evaluate what it represents every time they encounter it; naming it `discountedTotal` moves that interpretation work to one place (the declaration) instead of repeating it at every read site.',
      },
      {
        text: 'Inline Method/Variable: the reverse move — when the indirection adds no clarity, fold it back in',
        detail: 'Extraction is not free — every extracted method or variable is one more name a reader has to look up and one more level of indirection between the code and what it actually does. When that indirection stopped paying for itself (the name has become as opaque as the expression it hid, say), inlining removes the cost without changing behavior.',
      },
      {
        text: 'Rename: the highest-leverage, lowest-risk refactoring there is — a name is documentation that never goes stale if it stays accurate',
        detail: 'Unlike a comment, which can silently drift out of sync with the code it describes, a name is checked by every reader every time they use it — a wrong or misleading name gets noticed and fixed far more reliably than a wrong comment, which is exactly why a good name is more durable documentation than a comment saying the same thing.',
      },
      {
        text: 'Move Method/Field: relocate behavior or data to the class it is most cohesive with (the fix for Feature Envy, see [[code-smells]])',
        detail: 'Moving a method to live with the data it primarily operates on typically collapses several cross-object getter calls into direct field access, which both simplifies the code and repairs the cohesion problem Feature Envy describes — the method and the data it needs end up in the same place instead of reaching across an object boundary.',
      },
      {
        text: 'Every refactoring is reversible — Extract has an Inline, Move has a Move-back — which is what makes "try it and see" a legitimate way to explore a design',
        detail: 'Because each refactoring has a matching inverse, trying a restructuring experimentally carries little risk — if Extract Method makes the code harder to follow instead of easier, Inline Method undoes it exactly, with tests confirming nothing changed either way. This reversibility is what makes refactoring safe to attempt speculatively rather than only when certain in advance.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Core refactorings and their intent',
        headers: ['Refactoring', 'Intent'],
        rows: [
          ['Extract Method', 'Turn an unnamed fragment into a named, reusable, independently testable unit'],
          ['Extract Variable', 'Replace an opaque expression with a name that explains what it means'],
          ['Inline Method / Variable', 'Remove indirection that has stopped paying for itself'],
          ['Rename', 'Make the name match what the thing actually is, now'],
          ['Move Method / Field', 'Put behavior or data next to what it is most cohesive with'],
        ],
      },
      {
        kind: 'code',
        title: 'Extract Method, before and after',
        code: '// Before: one method, two responsibilities buried inside it.\nvoid printInvoice(Invoice invoice) {\n    double total = 0;\n    for (LineItem item : invoice.getItems()) {\n        total += item.getPrice() * item.getQuantity();\n    }\n    System.out.println("Total: $" + total);\n    for (LineItem item : invoice.getItems()) {\n        System.out.println(item.getName() + " x" + item.getQuantity());\n    }\n}\n\n// After: each cohesive fragment gets a name.\nvoid printInvoice(Invoice invoice) {\n    System.out.println("Total: $" + calculateTotal(invoice));\n    printLineItems(invoice);\n}\ndouble calculateTotal(Invoice invoice) { /* the sum, extracted */ }\nvoid printLineItems(Invoice invoice) { /* the loop, extracted */ }',
      },
      {
        kind: 'bestPractice',
        title: 'One tiny step, one test run, one commit',
        text: 'Fowler\'s discipline is stricter than it looks from the outside: make one small mechanical change, run the tests, and only then make the next one. Skipping the test-run between steps is how a "safe" refactor turns into an afternoon of debugging three tangled changes at once — see [[refactoring-and-testing-safety]] for why the test suite is what makes any of this safe at all.',
        detail: 'Running the tests after every single step, rather than after a batch of them, is what keeps the search space for a failure small — if a test fails immediately after one small change, the cause is almost certainly that change; if it fails after five unverified changes, isolating which one broke it means re-deriving the same information the incremental approach would have given for free.',
      },
      {
        kind: 'pitfall',
        title: 'The big-bang refactor',
        text: 'Rewriting a class wholesale over a few hours without running tests in between feels efficient in the moment, but when something breaks, there is no way to know which of the dozen changes caused it — the entire session becomes one un-bisectable diff. Small refactorings composed one at a time are slower per-step and faster overall, because every step is independently verified.',
        detail: '"Un-bisectable" is the precise cost here: a large batch of unverified changes collapsed into one commit cannot be `git bisect`-ed to find which specific edit introduced a regression, whereas a sequence of small, individually-tested commits gives a debugging tool an exact answer instead of a haystack.',
      },
      {
        kind: 'note',
        title: 'IDE-automated vs. manual refactoring',
        text: 'Modern IDEs automate Rename, Extract Method/Variable, and Move reliably — the tool rewrites every reference correctly, which is both faster and safer than doing it by hand with find-and-replace. Reach for the automated refactoring whenever one exists; reserve manual, step-by-step editing (with tests run after each step) for restructurings no tool covers, like Replace Conditional with Polymorphism (see [[composing-methods-and-conditionals]]).',
        detail: 'An IDE\'s automated Rename or Extract understands the code\'s actual structure (scoping, overloads, references across files) in a way that text-based find-and-replace cannot — the tool will correctly skip a same-named local variable in an unrelated method that plain find-and-replace would have silently corrupted.',
      },
    ],
    refs: [{ book: 'refactoring-fowler', chapter: 'Ch. 6, 7 — A First Set of Refactorings; Encapsulation' }],
    related: ['code-smells', 'composing-methods-and-conditionals', 'refactoring-and-testing-safety'],
  },

  {
    id: 'composing-methods-and-conditionals',
    domainId: 'refactoring-quality',
    title: 'Composing Methods & Conditionals',
    summary:
      'A family of refactorings targets conditional logic specifically: flattening nested ifs with guard clauses, decomposing a tangled condition into named pieces, and — when a type-code switch keeps growing — replacing it with polymorphic dispatch.',
    keyPoints: [
      {
        text: 'Guard clauses: handle the exceptional/early-exit cases first and return immediately, so the main logic isn\'t nested inside an `if`',
        detail: 'Nesting the "normal" case inside an `if (!exceptional)` block implies, structurally, that the exceptional case and the normal case are equally important branches of the same decision — a guard clause instead signals "this is a special case to dispose of, then the real logic follows unindented," which more accurately reflects how the two cases are actually weighted.',
      },
      {
        text: 'Decompose Conditional: extract the condition, the then-branch, and the else-branch each into a well-named method',
        detail: 'A raw `if (date.before(SUMMER_START) || date.after(SUMMER_END))` forces a reader to evaluate the boolean expression to understand what it means; extracting it into a method named `isWinter(date)` moves that interpretation to the declaration once, the same benefit Extract Variable gives for non-conditional expressions.',
      },
      {
        text: 'Replace Conditional with Polymorphism: turn a type-code switch into one method per subtype, each overriding a common method',
        detail: 'A switch on a type code has to be found and updated at every call site whenever a new type is added; polymorphic dispatch moves that decision into the type system itself, so adding a new subtype means writing one new class with its own override, with zero changes required to any existing code.',
      },
      {
        text: 'The "one level of indentation" heuristic — deeply nested conditionals are themselves a smell (Long Method\'s conditional cousin)',
        detail: 'Nesting depth tracks directly with how much context a reader has to hold in their head simultaneously to understand any single line — a statement four `if`s deep depends on four separate conditions all being true, which is measurably harder to verify at a glance than a flat sequence of guard clauses expressing the same logic.',
      },
      {
        text: 'Polymorphism wins when the same switch is duplicated at several call sites and the set of types keeps growing; a single, stable, local `if` is often clearer left alone',
        detail: 'The tradeoff is indirection versus duplication risk: polymorphism trades a small amount of "which subclass handles this" indirection for guaranteeing every call site stays in sync automatically, which is worth it exactly when there are multiple call sites to keep in sync and not worth it when there is only one, stable `if` that will likely never need a new case.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Nested conditionals → guard clauses',
        code: '// Before: the "normal" case is buried three levels deep.\ndouble getPayAmount(Employee e) {\n    double result;\n    if (e.isSeparated()) {\n        result = 0;\n    } else {\n        if (e.isRetired()) {\n            result = pension(e);\n        } else {\n            result = normalPay(e);\n        }\n    }\n    return result;\n}\n\n// After: guard clauses handle exceptions first; the main path is flat.\ndouble getPayAmount(Employee e) {\n    if (e.isSeparated()) return 0;\n    if (e.isRetired())  return pension(e);\n    return normalPay(e);\n}',
      },
      {
        kind: 'code',
        title: 'Type-code switch → polymorphic dispatch',
        code: '// Before: repeated at every call site that needs a rate.\ndouble rateFor(Employee e) {\n    switch (e.getType()) {\n        case ENGINEER: return 1.0;\n        case MANAGER:  return 1.5;\n        case DIRECTOR: return 2.0;\n        default: throw new IllegalArgumentException();\n    }\n}\n\n// After: each subtype knows its own rate; no switch anywhere.\nabstract class Employee { abstract double rate(); }\nclass Engineer extends Employee { double rate() { return 1.0; } }\nclass Manager  extends Employee { double rate() { return 1.5; } }\nclass Director extends Employee { double rate() { return 2.0; } }',
      },
      {
        kind: 'table',
        caption: 'Conditional or polymorphism?',
        headers: ['Signal', 'Prefer'],
        rows: [
          ['One call site, stable set of cases, unlikely to grow', 'Plain conditional — polymorphism would be needless indirection'],
          ['Same switch duplicated at several call sites', 'Polymorphism — one dispatch point instead of N copies to keep in sync'],
          ['New cases get added regularly (OCP pressure, see [[solid-principles]])', 'Polymorphism — a new case is a new subclass, no existing code edited'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Polymorphism for a condition that will never grow',
        text: 'Turning a simple, stable two-branch `if` into a class hierarchy "on principle" adds a layer of indirection — a reader now has to find the right subclass to see what happens — with no matching benefit, since there was never a proliferation problem to solve. Reach for [[behavioral-patterns-ii]] (State/Strategy) when the *number of cases* is the pain, not as a reflex for every conditional.',
        detail: 'The tell is whether the branch count is actually under pressure to grow — if the two cases have been stable for years with no roadmap reason to expect a third, the switch was never the bottleneck, and replacing it with a hierarchy just relocates the same two branches into two separate files instead of one, at a net loss for anyone tracing the logic.',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 9, 10 — Simplifying Conditional Logic; Moving Features' },
      { book: 'head-first-patterns', chapter: 'Ch. 1 — Strategy Pattern' },
    ],
    related: ['refactoring-catalog-core', 'behavioral-patterns-ii', 'code-smells'],
  },

  {
    id: 'refactoring-and-testing-safety',
    domainId: 'refactoring-quality',
    title: 'Refactoring & Testing Safety',
    summary:
      'Refactoring is only as safe as the test suite underneath it: tests are what turn "I\'m fairly sure this is equivalent" into "I verified this is equivalent." Without them, the same edits are just changes made on faith.',
    keyPoints: [
      {
        text: 'A regression suite is the harness that makes small, frequent refactoring steps verifiable rather than hopeful',
        detail: 'Without a suite that runs in seconds, verifying a five-line refactor means re-reading the surrounding code and reasoning it through by hand every single time — the suite is what turns that manual re-derivation into a machine-checked fact, which is the only thing that makes doing dozens of tiny steps in a row practical instead of exhausting.',
      },
      {
        text: 'Legacy code with no tests needs characterization tests first — tests that pin down *current* behavior (bugs included) before anything is restructured',
        detail: 'Writing a characterization test deliberately defers the question "is this behavior correct" — the goal is only to freeze what the code does today so a refactor has something to diff against; fixing any bugs the test reveals is a separate, later step, because attempting both at once removes the only way of knowing which change caused a regression.',
      },
      {
        text: 'Red-Green-Refactor (from TDD, see [[testing-philosophy]]) is refactoring\'s most disciplined form: never restructure and add behavior in the same step',
        detail: 'The cycle enforces the same separation of concerns that "two hats" does at a larger scale — Red and Green are where behavior changes, Refactor is where structure changes, and the discipline is in never letting a single step do both, so a failure during Refactor can only mean the restructuring broke something, never that new logic was wrong.',
      },
      {
        text: 'Coverage percentage is a floor, not a guarantee — 100% coverage with weak assertions can still miss a broken refactor',
        detail: 'A line counted as "covered" only means it executed during a test run, not that the test checked anything meaningful about what it produced — a test that calls a method and asserts nothing about the return value drives coverage to 100% while catching zero regressions, which is exactly the gap mutation testing is built to expose.',
      },
      {
        text: 'Mutation testing (deliberately introducing small bugs and checking the suite catches them) measures whether tests actually *assert* something, not just execute the code',
        detail: 'Each mutant is a tiny, deliberately introduced bug — a flipped comparison, an off-by-one — and a mutant that survives (no test goes red) is direct evidence of an assertion gap: the code path executed, but nothing in the suite actually checked its output, which coverage percentage alone would never reveal.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A **characterization test** doesn\'t test "correct" behavior — it tests *current* behavior, quirks and all, so that a refactor of unfamiliar legacy code has something to check itself against. Write the test, run it against the untouched code, and record whatever it produces as the expected result — even if that result looks wrong. Only after the refactor is safely underway, with the suite green throughout, does fixing the actual bug become a separate, deliberate step.',
      },
      {
        kind: 'note',
        title: 'Coverage measures execution, not verification',
        text: 'A line can execute under a test and still be effectively untested if the test never asserts anything meaningful about its output — coverage tools count the former, not the latter. Mutation testing closes that gap: it flips a comparison, off-by-ones a loop bound, or negates a condition, then reruns the suite. A mutant that survives (no test fails) reveals an assertion gap that plain coverage would never show.',
        detail: 'Mutation testing is expensive to run — each mutant requires a full suite run — which is why it is typically reserved for critical modules or run periodically rather than on every commit, but even an occasional mutation run is often enough to reveal that a supposedly well-tested area has assertions checking only "did it throw" and nothing about the actual computed result.',
      },
      {
        kind: 'pitfall',
        title: 'Refactoring and behavior change in the same commit',
        text: 'Mixing "restructure this" with "and also fix this bug while I\'m in here" in one commit destroys the one property that makes refactoring low-risk: if something breaks, there is no way to tell whether the restructuring or the behavior change caused it, and reverting either change in isolation isn\'t possible. Keep them in separate commits — ideally separate steps entirely — even when it\'s tempting to bundle them because "you\'re already in the file."',
        detail: 'The tempting justification is always "I\'m already in this method, it\'d be silly not to fix it while I\'m here" — but that convenience is exactly what erases the audit trail: a reviewer, or a future `git bisect`, has no way to attribute a regression to the structural change or the behavioral one once they are interleaved in a single diff.',
      },
      {
        kind: 'bestPractice',
        title: 'Separate "refactor" commits from "feature" commits',
        text: 'A commit history where pure-refactor commits (message: "extract method, no behavior change") are distinguishable from feature/fix commits gives reviewers and future archaeologists (`git bisect`, see [[debugging-and-problem-solving]]) a much easier job: a regression search can skip every commit labeled as a behavior-preserving refactor.',
        detail: 'This pays off most visibly during an incident: a `git bisect` that lands on a commit labeled "extract method, no behavior change" can usually be skipped on inspection alone, narrowing the search to the much smaller set of commits that actually touched behavior — a benefit that disappears the moment refactor and feature work get mixed into the same commits.',
      },
      {
        kind: 'table',
        caption: 'The TDD cycle, refactoring\'s strictest discipline',
        headers: ['Step', 'Rule'],
        rows: [
          ['Red', 'Write a failing test for the next tiny bit of behavior — nothing else'],
          ['Green', 'Write the simplest code that makes it pass — no more'],
          ['Refactor', 'Clean up the result *with tests green throughout* — no new behavior added here'],
        ],
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 4 — Building Tests' },
      { book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Testing section)' },
    ],
    related: ['testing-philosophy', 'refactoring-catalog-core', 'refactoring-workflow-and-tooling'],
  },

  {
    id: 'refactoring-workflow-and-tooling',
    domainId: 'refactoring-quality',
    title: 'Refactoring Workflow & Tooling',
    summary:
      'Refactoring works as a practiced discipline, not a one-off event: wear one hat at a time, lean on version control as an undo button, and prefer automated tool support over manual edits wherever it exists.',
    keyPoints: [
      {
        text: '"Two hats" — adding function and refactoring are different modes of work; switch consciously between them, never blend',
        detail: 'The metaphor works because it forces an explicit decision at every moment: am I changing what the code does, or how it is structured? Losing track of which hat is on is how a "quick refactor" quietly grows new behavior nobody reviewed for correctness, or a "quick feature" restructures existing code without the safety net a real refactor would have required.',
      },
      {
        text: 'Commit after every small, green refactoring step — version control becomes a reliable undo button, not just a backup',
        detail: 'A commit made only after tests pass is a checkpoint you can trust — if the next step turns out to be a mistake, reverting to the last commit is guaranteed to land on a known-good state, rather than on some intermediate point where it is unclear whether the tests were still green.',
      },
      {
        text: 'Automated IDE refactorings (Rename, Extract, Move) rewrite every reference correctly and are safer than manual find-and-replace',
        detail: 'An IDE\'s refactoring tool operates on the code\'s actual parsed structure — scope, overloads, shadowing — so it correctly skips an unrelated local variable that happens to share a name, something a text-based find-and-replace has no way to distinguish and will silently corrupt.',
      },
      {
        text: 'Continuous integration turns "did this break anything" from an end-of-week surprise into immediate feedback',
        detail: 'The value of CI here is specifically about the size of the search space when something breaks: a refactor that is verified within minutes of being pushed is trivial to bisect and revert, while the same regression discovered a week later is buried under every other change made in the interim, turning a two-minute fix into a real investigation.',
      },
      {
        text: 'A refactor buried inside a large feature PR is effectively unreviewable — nobody can tell what changed for what reason',
        detail: 'A reviewer looking at a mixed diff has to reverse-engineer, line by line, whether each change is "restructuring, should be behavior-preserving" or "new logic, needs correctness scrutiny" — a distinction the author already knew when writing the code but that the PR\'s shape has thrown away, forcing the reviewer to either re-derive it or skip real verification and rubber-stamp the whole thing.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The "two hats" metaphor: when adding a feature, you\'re not supposed to be restructuring existing code, and when refactoring, you\'re not supposed to be adding behavior. In practice these interleave constantly — add a feature, notice the code resists it, switch hats and refactor to make room, switch back — but at any given moment only one hat is on. Losing track of which hat you\'re wearing is exactly how "just a quick refactor" grows a new feature nobody asked for review on, or "just a quick feature" quietly restructures something without test coverage for the restructuring.',
      },
      {
        kind: 'note',
        title: 'Version control as an undo button, not just a backup',
        text: 'Committing after each small, verified refactoring step means any step that turns out to be wrong can be reverted precisely, without losing the steps before or after it. This is what makes exploratory refactoring ("let me try moving this and see if it\'s cleaner") low-risk — the worst case is a `git reset` to the last good commit, not a scramble to remember what the code looked like an hour ago.',
        detail: 'This only holds if commits are actually small and actually verified — a single giant commit spanning an hour of unverified changes gives `git reset` nothing precise to land on, so the discipline of committing after every green step is what makes the "undo button" framing true rather than aspirational.',
      },
      {
        kind: 'bestPractice',
        title: 'Keep refactor PRs small and separate from feature PRs',
        text: 'A pull request titled "extract payment validation" that touches only that extraction is reviewable in minutes, because the reviewer can verify "no behavior changed" by inspection. The same extraction buried inside a 40-file feature PR forces the reviewer to either trust it blindly or re-derive the whole refactor themselves — neither is a good use of anyone\'s time.',
        detail: 'The size threshold matters less than the purity of the diff — a PR that touches fifty lines but mixes one behavior change into an otherwise pure extraction forces the same all-or-nothing trust decision as a much larger mixed PR, whereas a PR of any size that is provably restructuring-only can be verified by the reviewer just reading it, not re-testing it.',
      },
      {
        kind: 'pitfall',
        title: 'Large, mixed refactor-and-feature PRs',
        text: 'When a PR both restructures existing code and adds new behavior, a reviewer cannot separate "is the new logic correct" from "did the restructuring preserve the old behavior" — the two questions get conflated, review quality drops, and if something breaks in production the mixed diff makes `git bisect` far less useful (see [[debugging-and-problem-solving]]).',
        detail: 'The cost compounds after merge, not just during review: if the feature ships a bug, `git bisect` lands on the mixed commit and still cannot say whether the new logic or the restructuring underneath it is at fault, so the investigation has to manually untangle a diff the author could have kept separate for free.',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 2 — Principles in Refactoring' },
      { book: 'pragmatic-programmer', chapter: 'Ch. 3 — The Basic Tools (source control)' },
    ],
    related: ['refactoring-and-testing-safety', 'tooling-and-automation', 'technical-debt'],
  },

  {
    id: 'technical-debt',
    domainId: 'refactoring-quality',
    title: 'Technical Debt',
    summary:
      'Ward Cunningham\'s metaphor: a shortcut taken now accrues interest as slower, riskier future changes — useful precisely because it reframes "messy code" as a deliberate, trackable financial trade-off rather than a moral failing.',
    keyPoints: [
      {
        text: 'The 2×2: reckless/prudent crossed with deliberate/inadvertent — only one quadrant (reckless-and-inadvertent) is pure carelessness',
        detail: 'The grid matters because it separates three very different situations that "technical debt" as a single word tends to flatten together — a deliberate, prudent shortcut taken under a real deadline is a legitimate engineering trade-off, while reckless-and-inadvertent debt ("what\'s layering?") is the only quadrant that actually reflects a skill or process failure worth addressing directly.',
      },
      {
        text: 'Interest is the ongoing cost of working around the debt — every future change in that area takes longer than it would on clean code',
        detail: 'The financial metaphor is precise here: the shortcut itself is a one-time principal cost, but interest accrues silently on every subsequent change that has to route around it — which is why debt that looks cheap at the moment it is taken on can still become the most expensive code in the system if that area keeps getting touched.',
      },
      {
        text: 'Debt should be visible and tracked (a backlog item, a `TODO` with a ticket link), not silently absorbed into "how things are"',
        detail: 'Untracked debt has no mechanism for ever being revisited — it just becomes background texture that new team members assume is intentional, whereas a ticket-linked `TODO` at least gives someone the option to weigh its accumulated interest against the cost of fixing it, instead of the debt being permanently invisible to that decision.',
      },
      {
        text: 'Pay down debt when the interest it\'s accruing exceeds the cost of fixing it — not on a fixed schedule and not out of tidiness alone',
        detail: 'This is a direct rejection of both extremes — "never refactor, just ship features" and "refactor everything on a schedule regardless of cost" — in favor of treating debt repayment as an ordinary cost-benefit decision: fix it when the accumulated and projected interest is larger than the one-time cost of paying it down, and leave it alone otherwise, even if it is ugly.',
      },
      {
        text: 'A full rewrite is rarely the cheapest way to pay off debt — incremental refactoring under test coverage usually costs less and never leaves you without a working system',
        detail: 'A rewrite has to re-earn every edge case and bug fix the existing system already paid for, often without knowing which ones matter until they are missing in production — incremental refactoring keeps the system shipping the whole time and only replaces what is actually being touched, which is why it usually wins on total cost even though no single step feels as satisfying as starting clean.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The debt quadrant',
        headers: ['', 'Deliberate', 'Inadvertent'],
        rows: [
          ['Reckless', '"We don\'t have time for design"', '"What\'s layering?"'],
          ['Prudent', '"We must ship now and deal with consequences" (a real, informed trade-off)', '"Now we know how we should have done it" (learning is normal)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Cunningham\'s original point is often flattened into "sloppy code is debt," but his actual metaphor was about *learning as you build*: you ship your best understanding of the design today, and as the system teaches you more, some of that understanding turns out to be wrong — the gap between what you shipped and what you\'d build knowing what you know now is the debt, and it is a completely normal byproduct of building anything non-trivial, not a sign anyone did something wrong. The reckless/deliberate quadrant ("we know this is bad, ship it anyway, no plan to fix it") is the only genuinely blameworthy one.',
      },
      {
        kind: 'note',
        title: 'Debt is a trade-off, not always a mistake',
        text: 'Taking on debt deliberately — hard-coding a value instead of building a config system, skipping an abstraction you\'re not sure you need yet — can be the *correct* engineering call under a real deadline, provided it\'s visible and provided someone intends to revisit it once the interest catches up with the savings. Debt becomes a problem when it\'s invisible, or when nobody ever intends to repay it.',
        detail: 'The condition that makes a shortcut "prudent" rather than "reckless" is entirely about visibility and intent — the same hard-coded value is a reasonable trade-off if someone knows it is there and plans to revisit it, and reckless debt if it is forgotten the moment it ships; the code itself looks identical either way, so the distinction lives entirely in whether anyone is tracking it.',
      },
      {
        kind: 'pitfall',
        title: '"Let\'s just rewrite it" as a debt-repayment strategy',
        text: 'A full rewrite promises a clean slate but discards the accumulated bug fixes, edge-case handling, and tacit knowledge embedded in the existing system — then takes months during which the business gets zero new value and the old system still needs maintenance in parallel. Incremental refactoring, backed by characterization tests (see [[refactoring-and-testing-safety]]), pays down the same debt in pieces without ever leaving the system in a non-working state.',
        detail: 'The appeal of a rewrite is that it promises to erase the debt entirely rather than pay it down incrementally, but that promise is largely illusory — the old system\'s edge-case handling and bug fixes are not documented anywhere except in the code itself, so a rewrite has to rediscover most of them the hard way, usually via production incidents, while paying full maintenance cost on two systems at once in the meantime.',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 1 — Refactoring, a First Example' },
      { book: 'clean-architecture', chapter: 'Ch. 1 — What Is Design and Architecture?' },
    ],
    related: ['code-smells', 'refactoring-workflow-and-tooling', 'estimating'],
  },
]
