/** Shared content types — the single source of truth for all data files. */

export type ContentBlock =
  | { kind: 'paragraph'; text: string } // supports **bold**, `code`, [[topic-id]] links
  | { kind: 'subheading'; text: string }
  | { kind: 'code'; title?: string; code: string; caption?: string }
  | { kind: 'pitfall'; title: string; text: string; code?: string; detail?: string }
  | { kind: 'bestPractice'; title: string; text: string; code?: string; detail?: string }
  | { kind: 'note'; title?: string; text: string; detail?: string }
  | { kind: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { kind: 'diagram'; title?: string; code: string; caption?: string } // Mermaid syntax

export interface BookRef {
  /** Short book key, e.g. 'core-java-1', 'effective-java'. */
  book: string
  chapter: string
}

/** A skimmable bullet, optionally with a longer explanation revealed on demand. */
export type KeyPoint = string | { text: string; detail: string }

export interface Topic {
  id: string
  domainId: string
  title: string
  /** TL;DR, 1–3 sentences. */
  summary: string
  /** 3–7 skimmable bullets. */
  keyPoints: KeyPoint[]
  /** Deep dive. */
  blocks: ContentBlock[]
  refs: BookRef[]
  /** Related topic ids. */
  related: string[]
}

export interface Domain {
  id: string
  title: string
  blurb: string
  /** CSS color used for graph clusters and accents. */
  color: string
  topicIds: string[]
}

export type EdgeType = 'part-of' | 'prerequisite-of' | 'related-to'

export interface GraphNode {
  id: string
  label: string
  domainId: string
  importance: 1 | 2 | 3
  kind: 'topic' | 'domain'
}

export interface GraphEdge {
  source: string
  target: string
  type: EdgeType
}

export interface MethodDoc {
  signature: string
  desc: string
}

export interface JavaClass {
  fqcn: string
  name: string
  pkg: string
  module: string
  kind: 'class' | 'interface' | 'enum' | 'record' | 'annotation'
  since: string
  summary: string
  declaration: string
  /** Key facts. */
  points: string[]
  /** Curated selection, not the full API. */
  methods: MethodDoc[]
  example?: { code: string; caption?: string }
  pitfalls: string[]
  /** Related class fqcns, or topic ids prefixed with 'topic:'. */
  related: string[]
  javadocUrl: string
}

export interface ClassSummary {
  fqcn: string
  name: string
  pkg: string
  area: string
  kind: JavaClass['kind']
  summary: string
}

/** Book metadata for reference footnotes. */
export interface Book {
  key: string
  title: string
  authors: string
}
