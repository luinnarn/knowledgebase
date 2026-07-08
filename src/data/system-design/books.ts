import type { Book } from '../../types/content'

export const books: Book[] = [
  { key: 'ddia', title: 'Designing Data-Intensive Applications', authors: 'Martin Kleppmann' },
  { key: 'database-internals', title: 'Database Internals: A Deep Dive into How Distributed Data Systems Work', authors: 'Alex Petrov' },
  { key: 'designing-distributed-systems', title: 'Designing Distributed Systems (2nd ed.)', authors: 'Brendan Burns' },
  { key: 'sdi-vol1', title: "System Design Interview – An Insider's Guide", authors: 'Alex Xu' },
  { key: 'sdi-vol2', title: "System Design Interview – An Insider's Guide, Volume 2", authors: 'Alex Xu, Sahn Lam' },
  { key: 'grokking-sdi', title: 'Grokking the System Design Interview', authors: 'Educative.io' },
  { key: 'bytebytego-archive', title: 'System Design: The Big Archive (2024 ed.)', authors: 'ByteByteGo Newsletter' },
  { key: 'web-scalability', title: 'Web Scalability for Startup Engineers', authors: 'Artur Ejsmont' },
  { key: 'sre-book', title: 'Site Reliability Engineering: How Google Runs Production Systems', authors: 'Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy' },
  { key: 'release-it', title: 'Release It! Design and Deploy Production-Ready Software (2nd ed.)', authors: 'Michael T. Nygard' },
]

export const bookByKey = new Map(books.map((b) => [b.key, b]))
