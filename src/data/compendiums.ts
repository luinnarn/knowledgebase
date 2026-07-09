/** Metadata for each compendium the app can switch between. Add an entry here + a registry
 * binding in registry.ts to introduce a new compendium — no other file needs to know its shape. */
export interface CompendiumMeta {
  id: string
  /** Short label shown in the brand switcher, e.g. 'Java'. */
  label: string
  heroTitle: string
  heroLede: string
  /** Whether this compendium has a class/type reference beyond topics (the Java JDK does; CS concepts don't). */
  hasClasses: boolean
}

export const compendiums: CompendiumMeta[] = [
  {
    id: 'java',
    label: 'Java',
    heroTitle: 'Java, indexed.',
    heroLede:
      'Everything from language fundamentals to JVM internals, garbage collection, and cloud-scale performance — organized into domains, topics, and curated class references, cross-linked into one knowledge graph.',
    hasClasses: true,
  },
  { 
    id: 'js-ts', 
    label: 'JS/TS', 
    heroTitle: 'JavaScript & TypeScript, clarified.', 
    heroLede: 'JavaScript runtime behavior, asynchronous programming, TypeScript’s type system, modules, tooling, testing, and the patterns behind reliable web applications.', 
    hasClasses: false 
  },
  {
    id: 'cs',
    label: 'CS',
    heroTitle: 'Computer science, clarified.',
    heroLede:
      'Algorithms and data structures, design patterns, software architecture, refactoring, and the craft of building software — organized into domains and topics, cross-linked into one knowledge graph.',
    hasClasses: false,
  },
  {
    id: 'system-design',
    label: 'SysDesign',
    heroTitle: 'Systems, at scale.',
    heroLede:
      'Scalability fundamentals, caching, databases, messaging, distributed systems theory, reliability, and the architecture decisions behind systems that hold up under load — organized into domains and topics, cross-linked into one knowledge graph.',
    hasClasses: false,
  },
  {
    id: 'ai-ml',
    label: 'AI/ML',
    heroTitle: 'AI/ML, from intuition to implementation.',
    heroLede:
      'Machine learning foundations, neural networks, transformers, LLMs, RAG, evaluation, production ML, and responsible AI — explained through practical mental models for developers.',
    hasClasses: false,
  },
]

export const compendiumById = new Map(compendiums.map((c) => [c.id, c]))

export const DEFAULT_COMPENDIUM = 'java'
