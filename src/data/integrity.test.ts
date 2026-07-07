/**
 * Cross-data integrity suite. Loads every registered data module and verifies
 * that all ids are unique and every cross-reference resolves.
 *
 * "Planned universe" = every topic id listed in Domain.topicIds. Cross-links
 * may point at planned-but-not-yet-authored topics; loaded domains must match
 * their plan exactly.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { domains } from './domains'
import { graphNodes, graphEdges } from './graph'
import { topicLoaders } from './topics/index'
import { classLoaders, classSummaries } from './classes/index'
import { bookByKey } from './books'
import type { Topic, JavaClass } from '../types/content'

const plannedTopicIds = new Set(domains.flatMap((d) => d.topicIds))
const domainIds = new Set(domains.map((d) => d.id))

const loadedTopics: Topic[] = []
const loadedClasses: JavaClass[] = []

beforeAll(async () => {
  for (const [domainId, load] of Object.entries(topicLoaders)) {
    const { topics } = await load()
    for (const t of topics) {
      expect(t.domainId, `topic ${t.id} must belong to ${domainId}`).toBe(domainId)
      loadedTopics.push(t)
    }
  }
  for (const load of Object.values(classLoaders)) {
    const { classes } = await load()
    loadedClasses.push(...classes)
  }
})

const LINK_RE = /\[\[([a-z0-9-]+)\]\]/g

function textLinks(topic: Topic): string[] {
  const out: string[] = []
  const scan = (s: string) => {
    for (const m of s.matchAll(LINK_RE)) out.push(m[1])
  }
  scan(topic.summary)
  topic.keyPoints.forEach(scan)
  for (const b of topic.blocks) {
    if ('text' in b && b.text) scan(b.text)
    if (b.kind === 'table') b.rows.flat().forEach(scan)
  }
  return out
}

describe('domains', () => {
  it('have unique ids and unique topic ids across the plan', () => {
    expect(new Set(domains.map((d) => d.id)).size).toBe(domains.length)
    const all = domains.flatMap((d) => d.topicIds)
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('topics', () => {
  it('every registered domain matches its planned topic list exactly', () => {
    for (const domainId of Object.keys(topicLoaders)) {
      const domain = domains.find((d) => d.id === domainId)
      expect(domain, `loader for unknown domain ${domainId}`).toBeDefined()
      const loadedIds = loadedTopics.filter((t) => t.domainId === domainId).map((t) => t.id)
      expect(new Set(loadedIds).size).toBe(loadedIds.length)
      expect([...loadedIds].sort()).toEqual([...domain!.topicIds].sort())
    }
  })

  it('related links and [[inline links]] resolve to planned topics', () => {
    for (const t of loadedTopics) {
      for (const rel of t.related) {
        expect(plannedTopicIds.has(rel), `topic ${t.id} related -> ${rel}`).toBe(true)
      }
      for (const link of textLinks(t)) {
        expect(plannedTopicIds.has(link), `topic ${t.id} inline link -> ${link}`).toBe(true)
      }
    }
  })

  it('book refs use registered book keys', () => {
    for (const t of loadedTopics) {
      expect(t.refs.length, `topic ${t.id} needs at least one book ref`).toBeGreaterThan(0)
      for (const r of t.refs) {
        expect(bookByKey.has(r.book), `topic ${t.id} ref -> ${r.book}`).toBe(true)
      }
    }
  })

  it('topics carry the required skimmable layers', () => {
    for (const t of loadedTopics) {
      expect(t.summary.length, `topic ${t.id} summary`).toBeGreaterThan(20)
      expect(t.keyPoints.length, `topic ${t.id} keyPoints`).toBeGreaterThanOrEqual(3)
      expect(t.blocks.length, `topic ${t.id} blocks`).toBeGreaterThan(0)
    }
  })
})

describe('graph', () => {
  it('node ids are unique; topic nodes map to planned topics; domain nodes to domains', () => {
    expect(new Set(graphNodes.map((n) => n.id)).size).toBe(graphNodes.length)
    for (const n of graphNodes) {
      expect(domainIds.has(n.domainId), `node ${n.id} domain -> ${n.domainId}`).toBe(true)
      if (n.kind === 'topic') {
        expect(plannedTopicIds.has(n.id), `topic node ${n.id} not in plan`).toBe(true)
      }
    }
  })

  it('covers every planned topic with a node and every domain with a hub', () => {
    const ids = new Set(graphNodes.map((n) => n.id))
    for (const topicId of plannedTopicIds) {
      expect(ids.has(topicId), `no graph node for topic ${topicId}`).toBe(true)
    }
    for (const d of domains) {
      expect(ids.has(`d-${d.id}`), `no hub node for domain ${d.id}`).toBe(true)
    }
  })

  it('every edge endpoint exists', () => {
    const ids = new Set(graphNodes.map((n) => n.id))
    for (const e of graphEdges) {
      expect(ids.has(e.source), `edge source ${e.source}`).toBe(true)
      expect(ids.has(e.target), `edge target ${e.target}`).toBe(true)
    }
  })
})

describe('classes', () => {
  it('fqcns unique; summaries mirror loaded classes; related links resolve', () => {
    const fqcns = new Set(loadedClasses.map((c) => c.fqcn))
    expect(fqcns.size).toBe(loadedClasses.length)
    expect(new Set(classSummaries.map((s) => s.fqcn)).size).toBe(classSummaries.length)
    for (const s of classSummaries) {
      expect(fqcns.has(s.fqcn), `summary ${s.fqcn} has no loaded class`).toBe(true)
    }
    expect(classSummaries.length).toBe(loadedClasses.length)
    for (const c of loadedClasses) {
      expect(c.javadocUrl.startsWith('https://docs.oracle.com/'), `${c.fqcn} javadocUrl`).toBe(true)
      for (const rel of c.related) {
        if (rel.startsWith('topic:')) {
          expect(plannedTopicIds.has(rel.slice(6)), `${c.fqcn} related -> ${rel}`).toBe(true)
        } else {
          expect(fqcns.has(rel), `${c.fqcn} related -> ${rel}`).toBe(true)
        }
      }
    }
  })
})
