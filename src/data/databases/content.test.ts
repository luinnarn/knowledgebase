import { describe, expect, test } from 'vitest'
import { books, bookByKey } from './books'
import { domains, domainById } from './domains'
import type { CodeContentBlock, CodeLanguage, Topic } from '../../types/content'

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
const plannedTopicIds = new Set(domains.flatMap(({ topicIds }) => topicIds))

const authoredModules: Array<{ domainId: string; topics: Topic[] }> = []

function allAuthoredTopics(): Topic[] {
  return authoredModules.flatMap(({ topics }) => topics)
}

function codeBlockErrors(block: CodeContentBlock): string[] {
  if (!block.variants) {
    const errors: string[] = []
    if (!block.code.trim()) errors.push('nonempty code')
    if (block.language && !APPROVED_LANGUAGES.has(block.language)) errors.push('approved language')
    return errors
  }

  const errors: string[] = []
  if (block.variants.length === 0) errors.push('at least one variant')

  const variantIds = new Set<string>()
  for (const variant of block.variants) {
    if (!variant.id.trim()) errors.push('nonempty variant id')
    if (!variant.label.trim()) errors.push('nonempty variant label')
    if (!variant.code.trim()) errors.push('nonempty variant code')
    if (!APPROVED_LANGUAGES.has(variant.language)) errors.push('approved variant language')
    if (variantIds.has(variant.id)) errors.push(`duplicate variant id ${variant.id}`)
    variantIds.add(variant.id)
  }

  const sqlVariants = block.variants.filter(({ language }) => language === 'sql')
  if (sqlVariants.length >= 2) {
    if (block.variants[0].label !== 'PostgreSQL') errors.push('PostgreSQL must be first')
    for (const variant of sqlVariants) {
      if (!APPROVED_SQL_LABELS.has(variant.label)) {
        errors.push(`unsupported SQL dialect label ${variant.label}`)
      }
    }
  }

  return errors
}

function inlineLinks(topic: Topic): string[] {
  const links: string[] = []
  const scan = (text: string) => {
    for (const match of text.matchAll(LINK_RE)) links.push(match[1])
  }

  scan(topic.summary)
  for (const keyPoint of topic.keyPoints) {
    if (typeof keyPoint === 'string') scan(keyPoint)
    else {
      scan(keyPoint.text)
      scan(keyPoint.detail)
    }
  }
  for (const block of topic.blocks) {
    if ('text' in block && block.text) scan(block.text)
    if ('detail' in block && block.detail) scan(block.detail)
    if (block.kind === 'table') block.rows.flat().forEach(scan)
  }

  return links
}

function validateDomainTopics(domainId: string, topics: Topic[]): string[] {
  const errors: string[] = []
  const domain = domainById.get(domainId)
  if (!domain) return [`domain ${domainId} is not planned`]

  const seenTopicIds = new Set<string>()
  for (const topic of topics) {
    if (seenTopicIds.has(topic.id)) errors.push(`domain ${domainId} has duplicate topic id ${topic.id}`)
    seenTopicIds.add(topic.id)

    if (topic.domainId !== domainId) {
      errors.push(`topic ${topic.id} belongs to ${topic.domainId}, expected ${domainId}`)
    }
    if (topic.keyPoints.length < 5 || topic.keyPoints.length > 7) {
      errors.push(`topic ${topic.id} needs 5–7 key points, got ${topic.keyPoints.length}`)
    }
    if (topic.blocks.length === 0) errors.push(`topic ${topic.id} needs at least one content block`)
    if (topic.refs.length < 2) {
      errors.push(`topic ${topic.id} needs at least two references, got ${topic.refs.length}`)
    }

    for (const relatedId of topic.related) {
      if (!plannedTopicIds.has(relatedId)) {
        errors.push(`topic ${topic.id} related id ${relatedId} is not planned`)
      }
    }
    for (const linkedId of inlineLinks(topic)) {
      if (!plannedTopicIds.has(linkedId)) {
        errors.push(`topic ${topic.id} inline link ${linkedId} is not planned`)
      }
    }
    for (const ref of topic.refs) {
      if (!bookByKey.has(ref.book)) {
        errors.push(`topic ${topic.id} reference uses unknown source ${ref.book}`)
      }
    }
    for (const block of topic.blocks) {
      if (block.kind !== 'code') continue
      for (const error of codeBlockErrors(block)) errors.push(`topic ${topic.id} code block: ${error}`)
    }
  }

  const plannedIds = new Set(domain.topicIds)
  for (const plannedId of domain.topicIds) {
    if (!seenTopicIds.has(plannedId)) {
      errors.push(`domain ${domainId} is missing planned topic ${plannedId}`)
    }
  }
  for (const topicId of seenTopicIds) {
    if (!plannedIds.has(topicId)) errors.push(`domain ${domainId} has unexpected topic ${topicId}`)
  }

  return errors
}

const requiredBooks = [
  'database-system-concepts',
  'sql-relational-theory',
  'sql-antipatterns',
  'sql-performance-explained',
  'postgresql-internals',
  'database-internals',
  'ddia-2',
  'database-reliability-engineering',
]

const validTopic: Topic = {
  id: 'relational-model',
  domainId: 'db-foundations',
  title: 'The Relational Model',
  summary: 'A logical model that separates what data means from how a database stores and retrieves it.',
  keyPoints: ['One', 'Two', 'Three', 'Four', 'Five'],
  blocks: [
    { kind: 'paragraph', text: 'A relation represents a set of tuples governed by a heading and predicates.' },
    { kind: 'note', title: 'Logical, not physical', text: 'Tables are a presentation; relations are the model.' },
  ],
  refs: [
    { book: 'database-system-concepts', chapter: 'Ch. 2 — Introduction to the Relational Model' },
    { book: 'codd-relational-model', chapter: 'Sections 1–2' },
  ],
  related: ['relations-tuples-attributes-domains'],
}

function validFoundationTopics(): Topic[] {
  return domainById.get('db-foundations')!.topicIds.map((id) => ({
    ...validTopic,
    id,
    title: id,
    keyPoints: [...validTopic.keyPoints],
    blocks: [...validTopic.blocks],
    refs: validTopic.refs.map((ref) => ({ ...ref })),
    related: [...validTopic.related],
  }))
}

function withFirstTopic(change: Partial<Topic>): Topic[] {
  const topics = validFoundationTopics()
  topics[0] = { ...topics[0], ...change }
  return topics
}

describe('database compendium plan', () => {
  test('contains 12 domains and 110 unique planned topics', () => {
    expect(domains).toHaveLength(12)
    const ids = domains.flatMap((domain) => domain.topicIds)
    expect(ids).toHaveLength(110)
    expect(new Set(ids).size).toBe(110)
    expect(domainById.size).toBe(domains.length)
    for (const domain of domains) expect(domainById.get(domain.id)).toBe(domain)
  })

  test('registers all eight required books', () => {
    expect(requiredBooks.every((key) => bookByKey.has(key))).toBe(true)
    expect(new Set(books.map((book) => book.key)).size).toBe(books.length)
    expect(bookByKey.size).toBe(books.length)
    for (const book of books) expect(bookByKey.get(book.key)).toBe(book)
  })
})

describe('database topic pre-registration validation', () => {
  test('accepts a complete domain module', () => {
    expect(validateDomainTopics('db-foundations', validFoundationTopics())).toEqual([])
  })

  test('validates every authored module without registering incomplete content', () => {
    const errors = authoredModules.flatMap(({ domainId, topics }) => validateDomainTopics(domainId, topics))
    const topics = allAuthoredTopics()

    expect(errors).toEqual([])
    expect(new Set(topics.map(({ id }) => id)).size).toBe(topics.length)
  })

  test('reports a topic owned by the wrong domain', () => {
    expect(validateDomainTopics('db-foundations', withFirstTopic({ domainId: 'db-modeling' }))).toContain(
      'topic relational-model belongs to db-modeling, expected db-foundations',
    )
  })

  test('reports duplicate topic IDs', () => {
    const topics = validFoundationTopics()
    topics[1] = { ...topics[1], id: topics[0].id }

    expect(validateDomainTopics('db-foundations', topics)).toContain(
      'domain db-foundations has duplicate topic id relational-model',
    )
  })

  test('reports missing planned IDs', () => {
    const topics = validFoundationTopics().filter(({ id }) => id !== 'keys-and-identity')

    expect(validateDomainTopics('db-foundations', topics)).toContain(
      'domain db-foundations is missing planned topic keys-and-identity',
    )
  })

  test('reports IDs outside the owning domain plan', () => {
    const topics = withFirstTopic({ id: 'unexpected-topic' })

    expect(validateDomainTopics('db-foundations', topics)).toContain(
      'domain db-foundations has unexpected topic unexpected-topic',
    )
  })

  test('reports topics with fewer than five key points', () => {
    expect(
      validateDomainTopics('db-foundations', withFirstTopic({ keyPoints: ['One', 'Two', 'Three', 'Four'] })),
    ).toContain('topic relational-model needs 5–7 key points, got 4')
  })

  test('reports topics with no content blocks', () => {
    expect(validateDomainTopics('db-foundations', withFirstTopic({ blocks: [] }))).toContain(
      'topic relational-model needs at least one content block',
    )
  })

  test('reports topics with fewer than two references', () => {
    expect(validateDomainTopics('db-foundations', withFirstTopic({ refs: [validTopic.refs[0]] }))).toContain(
      'topic relational-model needs at least two references, got 1',
    )
  })

  test('reports unresolved related IDs', () => {
    expect(validateDomainTopics('db-foundations', withFirstTopic({ related: ['not-a-planned-topic'] }))).toContain(
      'topic relational-model related id not-a-planned-topic is not planned',
    )
  })

  test('reports unresolved inline topic links', () => {
    expect(
      validateDomainTopics(
        'db-foundations',
        withFirstTopic({ summary: 'A sufficiently descriptive summary with [[not-a-planned-topic]].' }),
      ),
    ).toContain('topic relational-model inline link not-a-planned-topic is not planned')
  })

  test('reports invalid source keys', () => {
    const refs = [{ ...validTopic.refs[0], book: 'unknown-source' }, validTopic.refs[1]]

    expect(validateDomainTopics('db-foundations', withFirstTopic({ refs }))).toContain(
      'topic relational-model reference uses unknown source unknown-source',
    )
  })

  test('reports malformed code variants', () => {
    expect(
      validateDomainTopics('db-foundations', withFirstTopic({ blocks: [{ kind: 'code', variants: [] }] })),
    ).toContain('topic relational-model code block: at least one variant')
  })
})
