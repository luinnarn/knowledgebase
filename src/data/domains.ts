import type { Domain } from '../types/content'

/** Seed registry — all 12 domains land in the graph task. */
export const domains: Domain[] = [
  {
    id: 'fundamentals',
    title: 'Language Fundamentals',
    blurb: 'Types, operators, strings, control flow, and arrays — the bedrock of every Java program.',
    color: '#4f8ef7',
    topicIds: ['program-anatomy'],
  },
]

export const domainById = new Map(domains.map((d) => [d.id, d]))
