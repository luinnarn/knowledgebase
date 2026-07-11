/**
 * Cross-data integrity suite. Loads every registered data module for every compendium and
 * verifies that all ids are unique and every cross-reference resolves.
 *
 * "Planned universe" = every topic id listed in a compendium's Domain.topicIds. Cross-links
 * may point at planned-but-not-yet-authored topics; loaded domains must match their plan exactly.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { compendiumRegistry, type CompendiumData } from './registry'
import type { Topic, JavaClass, CodeContentBlock, CodeLanguage, CodeVariant } from '../types/content'

const LINK_RE = /\[\[([a-z0-9-]+)\]\]/g

const APPROVED_LANGUAGES = new Set<CodeLanguage>([
  'java',
  'javascript',
  'typescript',
  'sql',
  'bash',
  'json',
  'markup',
  'text',
])
const APPROVED_SQL_LABELS = new Set(['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'])

export function validateCodeBlock(block: CodeContentBlock): string[] {
  const errors: string[] = []

  if (!block.variants) {
    if (!block.code.trim()) errors.push('nonempty code')
    if (block.language && !APPROVED_LANGUAGES.has(block.language)) {
      errors.push('approved language')
    }
    return errors
  }

  if (block.variants.length === 0) errors.push('at least one variant')

  const ids = new Set<string>()
  for (const variant of block.variants) {
    if (!variant.id.trim()) errors.push('nonempty id')
    if (!variant.label.trim()) errors.push('nonempty label')
    if (!variant.code.trim()) errors.push('nonempty code')
    if (!APPROVED_LANGUAGES.has(variant.language)) errors.push('approved language')
    if (ids.has(variant.id)) errors.push('duplicate variant id')
    ids.add(variant.id)
  }

  const sqlVariants = block.variants.filter((variant) => variant.language === 'sql')
  if (sqlVariants.length >= 2) {
    if (block.variants[0].label !== 'PostgreSQL') errors.push('PostgreSQL must be first')
    for (const variant of sqlVariants) {
      if (!APPROVED_SQL_LABELS.has(variant.label)) {
        errors.push('approved SQL dialect label')
      }
    }
  }

  return errors
}

const pg: CodeVariant = {
  id: 'postgresql',
  label: 'PostgreSQL',
  language: 'sql',
  code: 'SELECT 1;',
}

const mysql: CodeVariant = {
  id: 'mysql',
  label: 'MySQL',
  language: 'sql',
  code: 'SELECT 1;',
}

describe('validateCodeBlock', () => {
  it('rejects an empty variant list', () => {
    expect(validateCodeBlock({ kind: 'code', variants: [] })).toContain('at least one variant')
  })

  it('rejects duplicate variant ids', () => {
    expect(validateCodeBlock({ kind: 'code', variants: [pg, { ...pg }] })).toContain('duplicate variant id')
  })

  it('requires PostgreSQL to be the first SQL dialect', () => {
    expect(validateCodeBlock({ kind: 'code', variants: [mysql, pg] })).toContain('PostgreSQL must be first')
  })

  it('requires PostgreSQL to be the first block variant in a multi-dialect SQL comparison', () => {
    const java: CodeVariant = {
      id: 'java',
      label: 'Java',
      language: 'java',
      code: 'System.out.println(1);',
    }

    expect(validateCodeBlock({ kind: 'code', variants: [java, pg, mysql] })).toContain(
      'PostgreSQL must be first',
    )
  })

  it.each([
    ['single-source code', { kind: 'code', code: '  ' }, 'nonempty code'],
    ['variant id', { kind: 'code', variants: [{ ...pg, id: '' }] }, 'nonempty id'],
    ['variant label', { kind: 'code', variants: [{ ...pg, label: '' }] }, 'nonempty label'],
    ['variant code', { kind: 'code', variants: [{ ...pg, code: '' }] }, 'nonempty code'],
    ['variant language', { kind: 'code', variants: [{ ...pg, language: '' }] }, 'approved language'],
    ['unsupported language', { kind: 'code', variants: [{ ...pg, language: 'python' }] }, 'approved language'],
    ['unsupported SQL label', { kind: 'code', variants: [pg, { ...mysql, label: 'MariaDB' }] }, 'approved SQL dialect label'],
  ] as const)('rejects an invalid %s', (_name, block, message) => {
    expect(validateCodeBlock(block as unknown as CodeContentBlock)).toContain(message)
  })

  it('accepts valid single-source and PostgreSQL-first variant blocks', () => {
    expect(validateCodeBlock({ kind: 'code', code: 'SELECT 1;', language: 'sql' })).toEqual([])
    expect(validateCodeBlock({ kind: 'code', variants: [pg, mysql] })).toEqual([])
  })
})

function textLinks(topic: Topic): string[] {
  const out: string[] = []
  const scan = (s: string) => {
    for (const m of s.matchAll(LINK_RE)) out.push(m[1])
  }
  scan(topic.summary)
  for (const kp of topic.keyPoints) {
    if (typeof kp === 'string') scan(kp)
    else {
      scan(kp.text)
      scan(kp.detail)
    }
  }
  for (const b of topic.blocks) {
    if ('text' in b && b.text) scan(b.text)
    if ('detail' in b && b.detail) scan(b.detail)
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

    it('code blocks have valid single-source or variant content', () => {
      for (const topic of loadedTopics) {
        for (const block of topic.blocks) {
          if (block.kind !== 'code') continue
          expect(validateCodeBlock(block), `topic ${topic.id} code block`).toEqual([])
        }
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

describe('database compendium strict integrity', () => {
  const data = compendiumRegistry.databases
  const loadedTopics: Topic[] = []

  beforeAll(async () => {
    for (const load of Object.values(data.topicLoaders)) {
      const { topics } = await load()
      loadedTopics.push(...topics)
    }
  })

  it('registers exactly 12 domains and 110 topics with one loader per domain', () => {
    expect(data.domains).toHaveLength(12)
    expect(loadedTopics).toHaveLength(110)
    expect(Object.keys(data.topicLoaders).sort()).toEqual(data.domains.map((domain) => domain.id).sort())
  })

  it('keeps every topic at the database content-depth floor', () => {
    for (const topic of loadedTopics) {
      expect(topic.keyPoints.length, `topic ${topic.id} keyPoints`).toBeGreaterThanOrEqual(5)
      expect(topic.keyPoints.length, `topic ${topic.id} keyPoints`).toBeLessThanOrEqual(7)
      expect(topic.refs.length, `topic ${topic.id} refs`).toBeGreaterThanOrEqual(2)
    }
  })

  it('uses unique source URLs', () => {
    const urls = data.books.map((book) => book.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('uses only unique approved dialect labels in PostgreSQL-first order', () => {
    for (const topic of loadedTopics) {
      for (const block of topic.blocks) {
        if (block.kind !== 'code' || !block.variants) continue
        const sqlVariants = block.variants.filter((variant) => variant.language === 'sql')
        if (sqlVariants.length < 2) continue
        const labels = sqlVariants.map((variant) => variant.label)
        expect(labels[0], `topic ${topic.id} PostgreSQL-first variants`).toBe('PostgreSQL')
        expect(new Set(labels).size, `topic ${topic.id} unique dialect labels`).toBe(labels.length)
        expect(labels.every((label) => APPROVED_SQL_LABELS.has(label)), `topic ${topic.id} dialect labels`).toBe(true)
      }
    }
  })
})
