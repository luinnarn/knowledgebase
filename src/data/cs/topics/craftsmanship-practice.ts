import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'pragmatic-mindset',
    domainId: 'craftsmanship-practice',
    title: 'Pragmatic Mindset: DRY, Orthogonality, Reversibility',
    summary:
      'Three lenses from *The Pragmatic Programmer* for keeping a codebase changeable over years, not just working on day one: don\'t duplicate knowledge, keep components independent, and avoid decisions that can\'t be undone.',
    keyPoints: [
      {
        text: 'DRY — "every piece of knowledge must have a single, unambiguous, authoritative representation" — broader than "don\'t copy-paste code": it covers docs, schemas, config, and business rules stated twice in different forms',
        detail: 'A comment describing a function\'s behavior, a validation rule re-implemented in both the frontend and the backend, a constant hard-coded in two config files — none of these are "duplicated code" in the copy-paste sense, but all of them are the same knowledge stated in more than one place, which means all of them can silently drift apart the moment one copy is updated and the other is forgotten.',
      },
      {
        text: 'Orthogonality — two components are orthogonal if changing one has no effect on the other; the practical test is "can I change X without understanding Y?"',
        detail: 'The test is deliberately about *understanding*, not just compiling — two modules can be orthogonal at the type-checker level (nothing breaks) while still being tightly coupled in practice, if changing one reliably requires reasoning through the other\'s behavior to avoid breaking it. True orthogonality means that reasoning step is simply unnecessary.',
      },
      {
        text: 'Reversibility — requirements *will* change, so prefer decisions that are cheap to undo over ones that lock in a direction',
        detail: 'This is not an argument for indecision — it is an argument for noticing which decisions are expensive to reverse (a database schema, a public API shape, a choice of programming language) versus which are cheap (an internal class name, a private method\'s implementation), and spending the extra care specifically on the expensive-to-reverse ones rather than treating every decision as equally weighty.',
      },
      {
        text: '"No broken windows" — small, visible quality lapses left unfixed normalize further decay quickly',
        detail: 'The name comes from criminology\'s broken-windows theory: one unrepaired broken window signals that nobody is watching, which invites more vandalism. In a codebase, one obviously sloppy corner sends the same signal to the next contributor — "the bar here is apparently low" — which is why the first broken window is disproportionately important to fix, even though it alone did no real damage.',
      },
      {
        text: 'DRY is about *knowledge*, not literal text — two pieces of code that happen to look similar today but change for unrelated reasons are not a DRY violation',
        detail: 'The test is not "do these two blocks look alike" but "do they represent the same fact about the world." Two four-line loops that happen to look identical today but exist for unrelated reasons will diverge the moment one of their reasons changes — merging them on textual resemblance alone creates an artificial dependency between two things that were never actually the same knowledge.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'DRY is the most quoted and most misapplied of the three. It does not say "delete duplicate-looking code" — it says a given piece of *knowledge* (a business rule, a constant, a format) should live in exactly one authoritative place. A tax rate hard-coded in three files is a DRY violation even though the three occurrences don\'t look like "duplicated code" in an IDE\'s sense; two unrelated methods that happen to contain a similar four-line loop, for different reasons that will diverge over time, are *not* a DRY violation even though they look identical today.',
      },
      {
        kind: 'code',
        title: 'The same knowledge, stated twice, drifting apart',
        code: '// DRY violation: the discount rule is knowledge, stated in two places.\nclass Checkout {\n    double total(Cart cart) {\n        double t = cart.subtotal();\n        if (cart.itemCount() > 10) t *= 0.9;   // bulk discount, stated here...\n        return t;\n    }\n}\nclass ReceiptEmail {\n    String preview(Cart cart) {\n        double est = cart.subtotal();\n        if (cart.itemCount() > 10) est *= 0.9; // ...and again here. One will drift.\n        return "Estimated: $" + est;\n    }\n}\n\n// Fixed: one authoritative place for the rule.\nclass DiscountPolicy {\n    static double apply(Cart cart, double amount) {\n        return cart.itemCount() > 10 ? amount * 0.9 : amount;\n    }\n}',
      },
      {
        kind: 'note',
        title: 'The orthogonality test',
        text: 'Ask two questions about any pair of components: "if I change this one, does the other one need to change too?" and "can I understand this one without understanding the other?" If either answer trends toward yes, the two are coupled, not orthogonal — see [[coupling-and-cohesion]] for the vocabulary architecture uses for the same idea at a larger scale.',
        detail: 'Both questions matter because they catch different failure modes — a change-propagation coupling shows up immediately in the first question, while a purely conceptual coupling (nothing breaks, but you still had to read and reason about the other component to be confident) only shows up in the second. A codebase can pass the first test and still fail the second.',
      },
      {
        kind: 'pitfall',
        title: 'DRY taken too far: coupling things that merely look alike',
        text: 'Two validation rules that happen to both check "is this string non-empty and under 50 characters" today are easy to merge into one shared helper — until one of them needs to become "under 100 characters" for unrelated business reasons, and now the shared helper needs a parameter, then a flag, then a second flag, and the abstraction has become harder to read than the two originals ever were. If two pieces of code don\'t represent the *same knowledge*, merging them on looks alone creates coupling where none should exist.',
        detail: 'The tell is the shape of the churn afterward: a correctly-DRY abstraction stays stable or grows cleanly, while a falsely-merged one accumulates parameters and flags that exist purely to let the two originally-unrelated callers diverge again through the same function. When a shared helper starts sprouting boolean flags, that is usually the abstraction announcing it was never one piece of knowledge to begin with.',
      },
      {
        kind: 'bestPractice',
        title: 'No broken windows',
        text: 'A codebase with one visibly sloppy corner (an inconsistent naming convention left unfixed, a failing test left ignored, a hack left un-flagged) invites the next person to add another one — the bar for "acceptable" has visibly dropped. Fixing small quality lapses promptly, even ones that aren\'t urgent, keeps that bar from sliding; it is cheaper to maintain a clean reputation than to restore one.',
        detail: 'The mechanism is social, not technical — nobody consciously decides "the bar is low, I\'ll be sloppy too," but every contributor unconsciously calibrates their own effort against what they see already tolerated nearby. That is why the fix scales the same way the damage does: a five-minute cleanup of the first broken window is disproportionately cheap compared to the culture-wide decay that goes uncorrected for months.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 2, 3 — A Pragmatic Approach; The Basic Tools' }],
    related: ['coupling-and-cohesion', 'tracer-bullets-and-prototyping', 'technical-debt'],
  },

  {
    id: 'tracer-bullets-and-prototyping',
    domainId: 'craftsmanship-practice',
    title: 'Tracer Bullets & Prototyping',
    summary:
      'Two techniques get conflated under "build something quick to find out" — a tracer bullet is real, thin, end-to-end code you keep and grow; a prototype is throwaway code built purely to answer one uncertain question, then discarded.',
    keyPoints: [
      {
        text: 'Tracer bullet: a thin slice through every layer of the real system, using real (if minimal) code — validates the whole pipeline works together early',
        detail: 'The name comes from the literal tracer round a gunner uses to see where shots are actually landing and adjust in real time, rather than calculating trajectory on paper first — a tracer bullet through the software stack plays the same role, showing where the architecture actually connects (or doesn\'t) instead of assuming the design document\'s layers will fit together as drawn.',
      },
      {
        text: 'Prototype: quick, disposable code built to answer one specific risky question ("will this rendering approach even work?"), explicitly thrown away afterward',
        detail: 'A prototype narrows its scope to exactly the uncertain part and fakes or skips everything else — if the risky question is "can this library render 10,000 points without lagging," the prototype doesn\'t need real data, error handling, or even a UI beyond a single test harness, because none of that bears on the one question it exists to answer.',
      },
      {
        text: 'Tracer bullets are grown into the finished feature; prototypes are deleted, not "cleaned up into production"',
        detail: 'This distinction has to be decided *before* writing the code, not discovered afterward — a tracer bullet is written knowing it will be incrementally hardened in place, so it\'s built on the real architecture from the start, while a prototype is written knowing it will be deleted, so cutting corners in it is a deliberate, safe choice rather than technical debt.',
      },
      {
        text: 'Choose a tracer bullet to de-risk integration across the whole stack; choose a prototype to de-risk one uncertain technique or idea cheaply',
        detail: 'The two risks are different shapes: integration risk ("will these layers actually talk to each other the way the design assumes") is only visible once every layer exists, however minimally, which is what a tracer bullet provides; technique risk ("can this one idea even work at all") is answerable in isolation, without any of the surrounding system, which is what makes a throwaway prototype the cheaper tool for it.',
      },
      {
        text: 'The failure mode for both is the same promise broken in different directions: skipping the tracer bullet (integration surprises discovered late) or keeping the prototype (throwaway quality shipped to production)',
        detail: 'Both failures come from treating the technique as optional busywork instead of load-bearing risk management — skip the tracer bullet and the integration problems that would have surfaced in week one instead surface during the final integration push, when there\'s no schedule slack left to absorb them; keep the prototype and its deliberately-cut corners (no error handling, no edge cases) ship silently into production.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Tracer bullet vs. prototype',
        headers: ['', 'Tracer bullet', 'Prototype'],
        rows: [
          ['Goal', 'Prove the whole pipeline connects, end to end', 'Answer one specific uncertain question'],
          ['Code quality', 'Real, if minimal — production code that will grow', 'Deliberately disposable — not held to production standards'],
          ['Fate', 'Kept, extended into the finished feature', 'Thrown away once the question is answered'],
          ['Use when', 'You need early, visible progress across all layers', 'You need to de-risk one uncertain piece cheaply'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'A tracer bullet for a new feature might be: UI button → API endpoint → business logic stub → database write, all wired together and deployed, doing the absolute minimum at each layer — but doing it for real. It answers "does this architecture actually fit together" days before the feature is feature-complete, and every layer it touches then gets filled in incrementally, in place. This also doubles as a communication tool: stakeholders can see something running end-to-end almost immediately, long before the polish is done (see [[requirements-and-communication]]).',
      },
      {
        kind: 'pitfall',
        title: '"We\'ll clean up the prototype later"',
        text: 'The most common and most expensive failure here is treating a prototype\'s fate as negotiable. Prototype code is written under an explicit understanding that it will be deleted — corners are cut on purpose, error handling is skipped, and it is validated only against the one question it exists to answer. Once it "basically works," the temptation to ship it as-is is enormous, and the corners cut to build it quickly are still there, now permanently, in production. Decide whether something is a tracer bullet or a prototype *before* writing it, not after it happens to work.',
        detail: '"Later" rarely arrives because the prototype already appears to work, which removes the visible pressure to rewrite it — the schedule pressure that justified skipping error handling and edge cases doesn\'t relax just because the code shipped, it moves on to the next deadline, and the promised cleanup pass permanently loses the competition for time against new, more urgent work.',
      },
      {
        kind: 'note',
        title: 'Prototypes can be even more disposable than the code they resemble',
        text: 'A UI prototype might be static images with no working logic behind them; an algorithm prototype might hard-code the input instead of reading real data. The point is answering the one question as cheaply as possible — if a prototype takes as long to build as the real thing, it has stopped being a prototype.',
        detail: 'This is a useful sanity check to apply mid-build: if a "prototype" is accumulating error handling, configuration, or generality it doesn\'t strictly need to answer its one question, that effort is going toward eventual production use, not toward answering the question faster — which means it has quietly become a tracer bullet (or worse, unplanned production code) without anyone deciding that on purpose.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 4 — Pragmatic Paranoia (Tracer Bullets)' }],
    related: ['pragmatic-mindset', 'requirements-and-communication', 'estimating'],
  },

  {
    id: 'requirements-and-communication',
    domainId: 'craftsmanship-practice',
    title: 'Requirements & Communication',
    summary:
      'Requirements are discovered through conversation and concrete examples, not gathered once and handed off as a frozen document — a spec written too early just ossifies the team\'s current misunderstanding of the problem.',
    keyPoints: [
      {
        text: '"Work with a user to think like a user" — the best way to understand a requirement is alongside the people who\'ll live with it, not through a one-time interview',
        detail: 'A one-time interview captures what the user *says* they need at a single moment, filtered through their ability to articulate a workflow they may not consciously think about step by step. Working alongside them — watching how they actually use the current system, wrong assumptions and workarounds included — surfaces requirements neither party would have thought to mention in a Q&A session.',
      },
      {
        text: 'Concrete examples surface edge cases a description never would — "show me an example of that report" beats "describe the report format"',
        detail: 'A description operates at the level of the general case, which is precisely where edge cases hide by omission — nobody describing "a monthly report" thinks to mention what happens in a month with zero activity, because the general case doesn\'t need that detail. A concrete example forces a specific answer to every specific cell, including the ones the general description quietly skipped.',
      },
      {
        text: 'Document requirements as a shared project vocabulary/glossary — capture the intent behind terms, not implementation detail that will drift out of sync',
        detail: 'A glossary entry describing what "active subscriber" *means* to the business stays true regardless of how the code currently implements that check; a glossary entry describing the current SQL query for it goes stale the first time the query changes. Capturing intent rather than implementation is what lets the glossary remain trustworthy years after the code it originally described has been rewritten.',
      },
      {
        text: 'Abstractions live longer than the details built on them — capture *why*, since the *how* will keep changing',
        detail: 'A requirement stated as "why" (the business reason a rule exists) survives every technology migration, refactor, and rewrite the "how" goes through, because the underlying need hasn\'t changed even though the implementation has. Documentation anchored to the "how" instead has a shelf life measured against the current implementation, not against the actual requirement.',
      },
      {
        text: 'A detailed early spec feels like reduced risk but is often a frozen misunderstanding — see [[tracer-bullets-and-prototyping]] for getting something real in front of users instead',
        detail: 'The feeling of reduced risk comes from the spec\'s apparent thoroughness, but thoroughness about a misunderstanding doesn\'t make it less wrong — it makes the wrong assumption harder to spot, because it\'s now buried under a hundred pages of confident-sounding detail instead of being visible as a single open question.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The instinct to "gather requirements" as a discrete upfront phase treats understanding the problem as a one-time data-collection exercise, when in practice a project\'s understanding of what it actually needs keeps sharpening the entire way through — new edge cases surface once real users touch a real (even partial) system, and a document frozen at kickoff has no mechanism for absorbing that. Treating requirements as an ongoing conversation, not a phase that ends at a sign-off, means the team\'s understanding stays current instead of stale.',
      },
      {
        kind: 'note',
        title: 'Ask for examples, not descriptions',
        text: '"The report should show monthly totals" sounds unambiguous until someone asks for one: does a month with zero activity get a row, or is it omitted? Are refunds shown as negative totals or excluded entirely? A concrete example (an actual sample report, even a hand-drawn one) surfaces these questions in minutes; a written description usually doesn\'t surface them until the code that assumed one answer meets a user who assumed the other.',
        detail: 'The asymmetry is in who has to fill the gap: a description leaves the ambiguous cases unspecified, and whoever builds the system fills them in with a guess, silently, without realizing a decision was even made. An example makes every one of those cells a concrete, checkable fact instead of an implicit guess — there\'s no gap left for a wrong assumption to hide in.',
      },
      {
        kind: 'bestPractice',
        title: 'Maintain a project glossary',
        text: 'When "customer," "account," and "subscriber" have precise, distinct meanings that everyone on the project uses consistently, whole categories of requirements bugs (built against the wrong meaning of an ambiguous term) disappear. A short glossary of project-specific terms, kept current, is disproportionately cheap insurance against that class of miscommunication.',
        detail: 'The bugs this prevents are especially insidious because both sides of the miscommunication believe they agree — a developer building against "customer" meaning "anyone with an account" and a stakeholder who meant "anyone with an active paid subscription" will each describe the requirement back correctly in their own vocabulary, and the mismatch only surfaces once the wrong group of people gets an email or a bill.',
      },
      {
        kind: 'pitfall',
        title: 'Mistaking a detailed early spec for reduced risk',
        text: 'A hundred-page requirements document written before anyone has seen working software *feels* like diligence, but every assumption in it was made with the least information the project will ever have. The more precisely a wrong assumption is specified, the more expensive it is to unwind once reality disagrees — a short spec plus an early tracer bullet ([[tracer-bullets-and-prototyping]]) usually surfaces the same problems for far less sunk cost.',
        detail: 'Precision and correctness are independent axes, and a hundred-page spec only improves the first one — it can specify a wrong assumption in exhaustive, unambiguous detail, which makes the eventual correction more expensive (more pages to rewrite, more downstream decisions built on top of the wrong premise) rather than less likely to be needed.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 4 — Pragmatic Paranoia (Requirements)' }],
    related: ['tracer-bullets-and-prototyping', 'estimating', 'use-case-driven-design'],
  },

  {
    id: 'tooling-and-automation',
    domainId: 'craftsmanship-practice',
    title: 'Tooling & Automation',
    summary:
      'Invest in your tools deliberately: automate anything done more than once, favor plain text for its longevity and tool-agnosticism, and treat editor/shell fluency as a compounding investment rather than an afterthought.',
    keyPoints: [
      {
        text: '"Don\'t use manual procedures" — a script that runs the release/build/setup steps is more reliable than a remembered or documented sequence',
        detail: 'A human following a written sequence can skip a step under time pressure, perform them out of order, or misremember a flag — none of which a script can do, since it executes exactly the same steps in exactly the same order every single time, with no capacity for the small human slips that manual procedures are uniquely vulnerable to.',
      },
      {
        text: 'A script *is* accurate documentation — it cannot silently drift out of date the way a wiki page describing the same steps can',
        detail: 'A wiki page and the actual process it describes are two separate things that can diverge without anyone noticing, because nothing forces them to stay in sync. A script and the process *are* the same thing — there is no second copy to drift, so the moment the real process changes, the "documentation" (the script) either changes with it or visibly breaks.',
      },
      {
        text: 'The power of plain text: greppable, diffable, versionable, and outlives whatever tool first produced it',
        detail: 'A binary or proprietary format is only as accessible as the one tool that understands it — if that tool disappears, gets a breaking version change, or simply isn\'t installed on the machine you\'re on, the data becomes unreachable. Plain text has no such single point of failure: any editor, any diff tool, any future tool not yet written can read it.',
      },
      {
        text: 'Editor and shell fluency compound over a career — minutes saved per interaction, thousands of interactions',
        detail: 'The return on learning a keybinding or shell idiom looks trivial the first time (saving a few seconds), which is exactly why it\'s easy to skip — but multiplied across the thousands of times that same interaction repeats over a career, the total saved time (and the reduced friction that keeps you in flow) dwarfs the one-time cost of learning it.',
      },
      {
        text: 'Automation pays for itself the moment a manual step is run for the third time — the break-even point is usually much sooner than it feels',
        detail: 'The felt cost of automating something is front-loaded and immediate (the time spent writing the script right now), while the cost of *not* automating it is spread out and easy to discount (a few extra minutes, repeated indefinitely) — which is why "I\'ll just do it manually this once more" keeps feeling like the cheaper option long after the math has already flipped.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A checklist titled "How to deploy" that lives on a wiki page describes what deploying *should* look like at the moment someone wrote it down — and nothing keeps it in sync as the actual process changes. A deploy *script* cannot have this problem: if it\'s wrong, deploys fail loudly, so it gets fixed. The script is simultaneously the automation and the only documentation that is provably still accurate.',
      },
      {
        kind: 'note',
        title: 'Why plain text keeps winning',
        text: 'Config in a proprietary binary format is stuck with whatever tool wrote it; config in a plain-text format (JSON, YAML, even a flat key-value file) can be diffed in a code review, greeped across an entire codebase, generated by a script, and read by a tool that doesn\'t exist yet. This is a large part of why version control, most modern config systems, and most data interchange formats converged on plain text despite the extra parsing cost.',
        detail: 'The extra parsing cost plain text pays is a one-time, well-understood expense (parsers are cheap and plentiful); the flexibility it buys — every existing and future tool being able to read, generate, and diff the format without special-casing it — is a compounding, open-ended benefit. That asymmetry is why the trade keeps winning even as raw performance considerations change.',
      },
      {
        kind: 'bestPractice',
        title: 'Script the release process before you need it under pressure',
        text: 'The worst time to discover a deploy step only one person remembers is during an incident, at 2am, when that person is unreachable. Scripting routine operational procedures — setup, deploy, rollback, common debugging queries — while there\'s no pressure means they\'re reliable exactly when pressure shows up.',
        detail: 'Writing the script under no pressure and running it under pressure are two different exercises with two different failure rates — a calm afternoon gives you the time to test edge cases and handle errors properly, while an incident at 2am gives you neither, which is exactly why the procedure most likely to be needed under pressure is the one that most needs to already be automated before the pressure arrives.',
      },
      {
        kind: 'pitfall',
        title: 'Tribal-knowledge processes',
        text: 'A process that lives only in one person\'s head (or in stale wiki instructions nobody trusts enough to follow literally) is a single point of failure disguised as institutional knowledge. Every manual step repeated more than a couple of times is a candidate for automation — see [[refactoring-workflow-and-tooling]] for the same principle applied specifically to the refactoring/release workflow.',
        detail: 'The danger is specifically that it doesn\'t look like a risk day to day — the process works fine as long as that one person is available, so the single point of failure stays invisible right up until the moment that person is on vacation, has left the company, or is simply asleep during an incident, which is exactly when the gap becomes impossible to ignore.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 3 — The Basic Tools' }],
    related: ['refactoring-workflow-and-tooling', 'testing-philosophy', 'debugging-and-problem-solving'],
  },

  {
    id: 'estimating',
    domainId: 'craftsmanship-practice',
    title: 'Estimating',
    summary:
      'An estimate is a probabilistic statement about the future, not a promise — communicated honestly as a range with explicit assumptions, and calibrated over time against how your own past estimates actually turned out.',
    keyPoints: [
      {
        text: 'State an estimate as a range (best-case / most-likely / worst-case) rather than a single number that inevitably gets treated as a deadline',
        detail: 'A single number invites the listener to silently discard the uncertainty that was actually behind it, and once that number is repeated a few times in meetings and calendars it hardens into a commitment nobody remembers was a guess. A range keeps the uncertainty visible in the number itself, which is much harder to accidentally launder into a promise.',
      },
      {
        text: 'Break a large, uncertain task into smaller pieces — each piece can be estimated with tighter confidence than the whole',
        detail: 'Uncertainty in an estimate mostly comes from hidden sub-tasks nobody has thought about yet, not from misjudging the speed of known work — decomposing the task is what surfaces those hidden pieces in the first place, so the tighter confidence isn\'t just an estimation trick, it reflects genuinely more information than the undecomposed guess had.',
      },
      {
        text: 'Track estimate-vs-actual over time; most people are systematically optimistic, and only measurement reveals your own personal bias',
        detail: 'Everyone believes their own estimates already account for the unexpected — that\'s precisely why the bias survives unmeasured: it doesn\'t feel like optimism from the inside, it feels like a reasonable accounting for risk. Only comparing actual outcomes against the estimate over enough samples reveals the gap between the two, because the bias is invisible to introspection alone.',
      },
      {
        text: '"It depends" is a legitimate, useful answer — followed immediately by *what* it depends on',
        detail: 'Refusing to give a number at all is unhelpful, but so is giving a false-precision number that papers over a genuine unresolved variable — naming the variable explicitly ("two days if the API supports batch writes, a week if we have to build that ourselves") gives the listener something actionable: a decision to go make, not just a vague hedge to distrust.',
      },
      {
        text: 'The tighter the estimate demanded, the more it costs to produce — a rough order-of-magnitude answer is cheap; a precise one requires doing much of the design work first',
        detail: 'A precise estimate requires having already answered most of the design questions that the implementation itself would need answered — which sub-tasks exist, which are risky, what the interfaces look like — so demanding day-level precision on an unscoped task is effectively demanding the design work be done twice: once to produce the estimate, once to build the thing.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Granularity vs. credible precision',
        headers: ['Task size', 'Credible range', 'Why'],
        rows: [
          ['A few hours', '±20–30%', 'Small enough to reason about directly'],
          ['A few days', '±50% or wider', 'Unknowns start compounding'],
          ['Weeks, unbroken down', 'Barely more than a guess', 'Too many hidden sub-tasks to have accounted for them all'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The instinct to demand (or give) a single number — "how long will this take?" / "three weeks" — discards the uncertainty that was actually there and replaces it with false precision. A range communicates the same information honestly: "most likely three weeks, could slip to five if the migration turns out to be harder than expected, could be two if it goes smoothly." Whoever receives that estimate can plan around the uncertainty instead of being blindsided when reality lands anywhere other than exactly the single number given.',
      },
      {
        kind: 'note',
        title: 'Calibrate against your own track record',
        text: 'Most engineers, asked to estimate, are optimistic by a fairly consistent factor — not because they\'re bad at estimating, but because an estimate is implicitly "how long if nothing unexpected happens," and something unexpected almost always does. Tracking actual-vs-estimated over enough tasks reveals your personal correction factor, which is a far better calibration tool than any general advice, including this one.',
        detail: 'The correction factor is personal, not universal, because it captures your own specific blind spots — which categories of hidden work you consistently forget to account for — and those differ from person to person and codebase to codebase. General advice like "double all estimates" is a crude approximation of a factor that measurement can tell you precisely for your own actual pattern of misses.',
      },
      {
        kind: 'pitfall',
        title: 'A single number given under pressure becomes a commitment',
        text: 'Pressed for "just give me a number" in a meeting, a hedge like "probably around two weeks, but I haven\'t looked closely" gets remembered, repeated, and eventually treated as a promise — the hedge quietly disappears from the retelling. Insisting on stating the range and the caveat every time, even when it feels like friction, is what keeps a rough guess from calcifying into an unearned deadline.',
        detail: 'The caveat disappears because it\'s the least memorable, least actionable part of the sentence — "two weeks" is a fact someone can put on a calendar, while "but I haven\'t looked closely" is a piece of context that has nowhere to live once the number gets copied into a planning doc. Repeating the caveat every time it\'s retold is the only defense, since it will otherwise be dropped by default, not by malice.',
      },
      {
        kind: 'bestPractice',
        title: 'Decompose before estimating anything non-trivial',
        text: 'Breaking "add search to the app" into its actual sub-tasks (indexing strategy, query API, ranking, UI, pagination, empty states) before estimating turns one huge, low-confidence guess into several smaller, higher-confidence ones — and often reveals scope nobody had considered yet, which is valuable information on its own, independent of the resulting number.',
        detail: 'The act of decomposing is doing real diagnostic work even before any number is attached — listing "ranking" and "empty states" as distinct sub-tasks is often the first moment anyone notices those exist as separate concerns at all, which means the decomposition step can change the scope of the conversation even if the eventual estimate turns out to be wrong.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 2 — Estimating' }],
    related: ['requirements-and-communication', 'technical-debt', 'tracer-bullets-and-prototyping'],
  },

  {
    id: 'testing-philosophy',
    domainId: 'craftsmanship-practice',
    title: 'Testing Philosophy',
    summary:
      'Testing is as much a design activity as a verification one — code that resists being tested is usually poorly decoupled — and the test pyramid balances speed against confidence rather than prescribing one "correct" ratio.',
    keyPoints: [
      {
        text: 'Test pyramid: many fast, isolated unit tests; fewer, slower integration tests; a handful of end-to-end tests — a cost/confidence trade-off, not a rulebook',
        detail: 'The shape isn\'t arbitrary — it tracks a real trade-off between speed and how much of the real system a test actually exercises. Unit tests are cheap and fast but only prove one piece works in isolation; end-to-end tests are slow and brittle but prove the real system, wired together, actually behaves correctly. The pyramid shape is what you get from spending most of your budget where confidence-per-second is highest.',
      },
      {
        text: 'Test-induced design pressure: code that is hard to unit test is usually too coupled to its collaborators — see [[dependency-inversion-and-injection]] as the fix',
        detail: 'A class that requires a real database connection, three specific collaborators, and careful setup just to construct in a test is exhibiting the exact same coupling that makes it hard to reuse, hard to change in isolation, and hard to reason about in production — the test difficulty isn\'t an unrelated inconvenience, it\'s a direct symptom of the design problem, surfacing early precisely because tests are the first thing to try using the class in isolation.',
      },
      {
        text: 'Example-based tests assert specific input→output pairs; property-based tests assert an invariant holds across generated inputs, often finding edge cases nobody thought to hand-pick',
        detail: 'An example-based test can only ever be as good as the examples a human thought to write down, which means it systematically misses whatever edge case the author didn\'t think of — a property-based test sidesteps that limitation entirely by generating inputs the author never considered and checking a general invariant against all of them, trading specific documentation value for broader coverage.',
      },
      {
        text: '"Test early, test often, test automatically" — a suite that isn\'t run continuously isn\'t a safety net, it\'s a false sense of one',
        detail: 'A test suite that exists but isn\'t run on every change protects against regressions only in theory — in practice, a broken test sitting unrun for weeks provides zero actual protection while still giving the team the comfortable feeling that "we have tests for that," which is arguably worse than having no tests, since the false confidence suppresses the manual vigilance that would otherwise fill the gap.',
      },
      {
        text: 'An inverted pyramid ("ice-cream cone" — mostly slow, brittle end-to-end tests, few unit tests) is slow to run and flaky to maintain',
        detail: 'Both problems compound rather than staying separate: a slow suite gets run less often (weakening the safety net), and a flaky suite trains the team to ignore red results (weakening it further still), so an inverted pyramid doesn\'t just cost more time per run, it erodes the trust that makes any test suite worth having in the first place.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The pyramid, layer by layer',
        headers: ['Layer', 'Speed', 'Isolation', 'Typical count'],
        rows: [
          ['Unit', 'Milliseconds', 'One class/function, collaborators faked', 'Hundreds to thousands'],
          ['Integration', 'Seconds', 'Several real components together (e.g. DB access)', 'Dozens to hundreds'],
          ['End-to-end', 'Seconds to minutes', 'The whole system, as a user would exercise it', 'A handful of critical paths'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'A class that is hard to unit test — it needs a real database connection, a live network call, three collaborators constructed just so — is very often exhibiting a coupling problem, not a "this kind of code just can\'t be tested" problem. Following the resistance back to its source and fixing the coupling (usually via [[dependency-inversion-and-injection]], substituting a test double for the awkward collaborator) tends to improve the production design too: the two goals point the same direction more often than not.',
      },
      {
        kind: 'note',
        title: 'Property-based testing finds what you didn\'t think to test',
        text: 'An example-based test for a sort function might check `sort([3,1,2]) == [1,2,3]` — correct, but only tells you that one input. A property-based test instead asserts an invariant ("the output is always sorted, and always the same multiset of elements as the input") and lets the framework generate hundreds of random inputs, including edge cases (empty lists, duplicate values, already-sorted input) a human likely wouldn\'t have hand-picked.',
        detail: 'The invariant matters more than any single example because it has to hold universally, which forces the implementation to actually be correct rather than merely correct-looking on the handful of cases a human bothered to write down — a buggy sort that happens to pass `sort([3,1,2]) == [1,2,3]` is common; one that passes the "always sorted, same multiset" property against hundreds of generated inputs is a much stronger correctness signal.',
      },
      {
        kind: 'pitfall',
        title: 'The ice-cream-cone anti-pattern',
        text: 'A suite dominated by slow, brittle end-to-end tests with only a thin layer of unit tests underneath is expensive to run (minutes to hours), flaky (network/UI timing issues cause false failures), and slow to pinpoint what actually broke when something fails, since a single end-to-end failure could stem from any layer of the system. Rebalancing toward the pyramid shape — more fast, isolated tests, fewer slow, broad ones — usually finds regressions faster *and* cheaper.',
        detail: 'The diagnostic cost is the least obvious part of the problem: an end-to-end test failure tells you *that* something broke somewhere across the entire system under test, but not *where*, so debugging it means manually narrowing down the failure across every layer the test touched — exactly the work a failing unit test would have already done for you, for free, by virtue of testing one small thing in isolation.',
      },
    ],
    refs: [
      { book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Testing)' },
      { book: 'refactoring-fowler', chapter: 'Ch. 4 — Building Tests' },
    ],
    related: ['refactoring-and-testing-safety', 'dependency-inversion-and-injection', 'debugging-and-problem-solving'],
  },

  {
    id: 'debugging-and-problem-solving',
    domainId: 'craftsmanship-practice',
    title: 'Debugging & Problem Solving',
    summary:
      'Treat debugging as a disciplined search for a root cause, not a guessing game: reproduce the failure reliably, bisect toward its source, and fix the actual cause rather than the symptom in front of you.',
    keyPoints: [
      {
        text: '"select isn\'t broken" — assume the bug is in your code, not the platform, standard library, or compiler, until you have specific evidence otherwise',
        detail: 'The base rate strongly favors this assumption: a widely-used library function has been exercised by orders of magnitude more code, in more configurations, than the code you just wrote and are currently debugging — so purely on priors, a bug in your own new, untested assumption is vastly more likely than a bug in infrastructure everyone else relies on too.',
      },
      {
        text: 'Reproduce reliably first — a bug you can\'t reliably trigger can\'t be verified fixed, only hoped-fixed',
        detail: 'Without a reliable repro, "fixed" and "the bug happened not to occur this time" are indistinguishable — an intermittent failure can vanish for entirely unrelated reasons (timing shifted slightly, a different code path got exercised) that have nothing to do with whatever change was just made, leaving you with false confidence that will be shattered the next time the bug happens to resurface.',
      },
      {
        text: 'Binary search / bisection narrows down *where* a bug lives — halve the search space each time, including `git bisect` for "when did this regress"',
        detail: 'Testing the midpoint and discarding half the remaining possibilities each time turns a search whose cost scales linearly with the size of the problem into one that scales logarithmically — locating a regression among a thousand commits takes roughly ten bisection steps rather than up to a thousand individual checks, the same reason binary search on sorted data beats a linear scan.',
      },
      {
        text: 'Fix the root cause, not the symptom — patching where a bug is *visible* instead of where it *originates* tends to have it resurface elsewhere',
        detail: 'The location where a bug becomes visible (a crash, a wrong value on screen) and the location where the invalid state was actually introduced are very often different places in the code, connected only by however far the bad data traveled before something finally choked on it — patching the visible location fixes nothing about the origin, so the same root cause keeps producing new symptoms elsewhere.',
      },
      {
        text: '"Rubber duck debugging" — explaining the problem out loud, step by step, to anything (a colleague, a rubber duck) frequently surfaces the wrong assumption before the explanation even finishes',
        detail: 'The mechanism is that silently reasoning through code lets you skip over unstated assumptions without noticing, because your own train of thought doesn\'t require them to be made explicit — forcing yourself to say each step out loud, in a form another listener (or object) could follow, requires stating those assumptions explicitly, which is exactly where the wrong one tends to become audible.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: '"select() isn\'t broken" is a decades-old piece of Unix folklore that generalizes well: the standard library function, the compiler, the framework you\'re using has been run by millions of people before you and almost certainly works as documented. The bug — the overwhelming majority of the time — is in an assumption your own code made. Starting the search there first, rather than "it must be a platform bug," resolves nearly every debugging session faster.',
      },
      {
        kind: 'note',
        title: 'Bisection: halve the search space, every time',
        text: 'Whether it\'s a value in a data structure, a commit in history (`git bisect`), or a stage in a pipeline, the fastest way to localize an unknown failure point is to test the midpoint and discard half the remaining possibilities each time — turning a search that\'s linear in the size of the problem into one that\'s logarithmic. This is the same idea as [[binary-search-and-variants]], applied to a search space that isn\'t sorted data but "which of these N things is responsible."',
        detail: 'The precondition binary search needs on sorted data — a clean boundary where everything before is "good" and everything after is "bad" — has a direct analogue here: bisecting commit history only works cleanly if the regression is monotonic (once broken, stays broken), and a flaky or intermittently-reintroduced bug can violate that assumption the same way an unsorted array breaks ordinary binary search.',
      },
      {
        kind: 'bestPractice',
        title: 'Reproduce reliably, then write the regression test first',
        text: 'Before attempting a fix, get the failure to happen on demand — an intermittent bug "fixed" without a reliable repro can\'t actually be verified fixed, only hoped-fixed. Once it reproduces, write a failing test that encodes it (a form of characterization test, see [[refactoring-and-testing-safety]]) *before* changing the code — the test now proves the fix works, and prevents the same bug from silently coming back later.',
        detail: 'Writing the test before the fix, rather than after, matters because a test written after the fix only proves the test passes against the fixed code — it never actually observes the failing behavior it\'s supposed to guard against, so a subtly wrong assertion (one that would pass against either the buggy or the fixed version) can slip through unnoticed. A test that fails first, then passes after the fix, is the only version that has actually been proven to detect the bug.',
      },
      {
        kind: 'pitfall',
        title: 'Patching the symptom instead of the cause',
        text: 'Catching and silently swallowing a `NullPointerException` where it surfaces makes the crash go away without answering why the value was null in the first place — the underlying bad state persists and typically resurfaces somewhere else, often somewhere harder to diagnose than the original crash was. Trace back to where the invalid state was introduced ([[correctness-and-invariants]]) and fix it there.',
        detail: 'The resurfacing is usually worse than the original crash because the exception at least pointed at the exact line and the exact null value — once it\'s swallowed, the same bad state keeps propagating silently until something further downstream happens to notice it in a different, less obvious way, often with far less context available about where the bad value actually came from.',
      },
      {
        kind: 'note',
        title: 'Rubber duck debugging',
        text: 'Explaining a bug out loud, line by line, to a colleague — or to a literal inanimate object, if no one\'s free — forces you to state assumptions explicitly instead of skipping over them in your head. Very often the explanation stalls exactly at the assumption that turns out to be wrong, before the listener (or duck) has said a word.',
        detail: 'That the duck doesn\'t need to respond, or even be capable of responding, is the whole point — the value isn\'t in the listener\'s feedback, it\'s in the discipline of converting a silent mental model into an explicit spoken sequence, which is precisely the step that exposes a gap silent reasoning would have glossed straight over.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Debugging)' }],
    related: ['testing-philosophy', 'correctness-and-invariants', 'tooling-and-automation'],
  },
]
