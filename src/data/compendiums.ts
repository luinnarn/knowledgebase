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
    id: 'cs',
    label: 'CS',
    heroTitle: 'Computer science, clarified.',
    heroLede:
      'Algorithms and data structures, design patterns, software architecture, refactoring, and the craft of building software — organized into domains and topics, cross-linked into one knowledge graph.',
    hasClasses: false,
  },
]

export const compendiumById = new Map(compendiums.map((c) => [c.id, c]))

export const DEFAULT_COMPENDIUM = 'java'
