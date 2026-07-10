import { describe, expect, test } from 'vitest'
import { books, bookByKey } from './books'
import { domains } from './domains'

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

describe('database compendium plan', () => {
  test('contains 12 domains and 110 unique planned topics', () => {
    expect(domains).toHaveLength(12)
    const ids = domains.flatMap((domain) => domain.topicIds)
    expect(ids).toHaveLength(110)
    expect(new Set(ids).size).toBe(110)
  })

  test('registers all eight required books', () => {
    expect(requiredBooks.every((key) => bookByKey.has(key))).toBe(true)
    expect(new Set(books.map((book) => book.key)).size).toBe(books.length)
  })
})
