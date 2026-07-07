import type { GraphNode, GraphEdge } from '../types/content'

/** Seed graph — full graph lands in the graph-data task. */
export const graphNodes: GraphNode[] = [
  { id: 'd-fundamentals', label: 'Language Fundamentals', domainId: 'fundamentals', importance: 3, kind: 'domain' },
  { id: 'program-anatomy', label: 'Program Anatomy', domainId: 'fundamentals', importance: 1, kind: 'topic' },
]

export const graphEdges: GraphEdge[] = [
  { source: 'program-anatomy', target: 'd-fundamentals', type: 'part-of' },
]
