/**
 * Cross-data integrity suite. Loads every registered data module for every compendium and
 * verifies that all ids are unique and every cross-reference resolves.
 *
 * "Planned universe" = every topic id listed in a compendium's Domain.topicIds. Cross-links
 * may point at planned-but-not-yet-authored topics; loaded domains must match their plan exactly.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { compendiumRegistry, type CompendiumData } from './registry'
import type { Topic, JavaClass } from '../types/content'

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

describe.each(Object.entries(compendiumRegistry))('compendium: %s', (compendiumId, data: CompendiumData) => {
  const plannedTopicIds = new Set(data.domains.flatMap((d) => d.topicIds))
  const domainIds = new Set(data.domains.map((d) => d.id))

  const loadedTopics: Topic[] = []
  const loadedClasses: JavaClass[] = []

  beforeAll(async () => {
    for (const [domainId, load] of Object.entries(data.topicLoaders)) {
      const { topics } = await load()
      for (const t of topics) {
        expect(t.domainId, `[${compendiumId}] topic ${t.id} must belong to ${domainId}`).toBe(domainId)
        loadedTopics.push(t)
      }
    }
    for (const load of Object.values(data.classLoaders)) {
      const { classes } = await load()
      loadedClasses.push(...classes)
    }
  })

  describe('domains', () => {
    it('have unique ids and unique topic ids across the plan', () => {
      expect(new Set(data.domains.map((d) => d.id)).size).toBe(data.domains.length)
      const all = data.domains.flatMap((d) => d.topicIds)
      expect(new Set(all).size).toBe(all.length)
    })
  })

  describe('topics', () => {
    it('every registered domain matches its planned topic list exactly', () => {
      for (const domainId of Object.keys(data.topicLoaders)) {
        const domain = data.domains.find((d) => d.id === domainId)
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
          expect(data.bookByKey.has(r.book), `topic ${t.id} ref -> ${r.book}`).toBe(true)
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
      expect(new Set(data.graphNodes.map((n) => n.id)).size).toBe(data.graphNodes.length)
      for (const n of data.graphNodes) {
        expect(domainIds.has(n.domainId), `node ${n.id} domain -> ${n.domainId}`).toBe(true)
        if (n.kind === 'topic') {
          expect(plannedTopicIds.has(n.id), `topic node ${n.id} not in plan`).toBe(true)
        }
      }
    })

    it('covers every planned topic with a node and every domain with a hub', () => {
      const ids = new Set(data.graphNodes.map((n) => n.id))
      for (const topicId of plannedTopicIds) {
        expect(ids.has(topicId), `no graph node for topic ${topicId}`).toBe(true)
      }
      for (const d of data.domains) {
        expect(ids.has(`d-${d.id}`), `no hub node for domain ${d.id}`).toBe(true)
      }
    })

    it('every edge endpoint exists', () => {
      const ids = new Set(data.graphNodes.map((n) => n.id))
      for (const e of data.graphEdges) {
        expect(ids.has(e.source), `edge source ${e.source}`).toBe(true)
        expect(ids.has(e.target), `edge target ${e.target}`).toBe(true)
      }
    })
  })

  describe('classes', () => {
    it('fqcns unique; summaries mirror loaded classes; related links resolve', () => {
      const fqcns = new Set(loadedClasses.map((c) => c.fqcn))
      expect(fqcns.size).toBe(loadedClasses.length)
      expect(new Set(data.classSummaries.map((s) => s.fqcn)).size).toBe(data.classSummaries.length)
      for (const s of data.classSummaries) {
        expect(fqcns.has(s.fqcn), `summary ${s.fqcn} has no loaded class`).toBe(true)
      }
      expect(data.classSummaries.length).toBe(loadedClasses.length)
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
})
