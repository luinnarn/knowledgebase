import MiniSearch from 'minisearch'
import { domains, domainById } from '../data/domains'
import { topicLoaders } from '../data/topics/index'
import { classSummaries } from '../data/classes/index'

export interface SearchDoc {
  id: string
  type: 'topic' | 'class'
  title: string
  subtitle: string
  text: string
  route: string
}

let indexPromise: Promise<MiniSearch<SearchDoc>> | null = null

async function build(): Promise<MiniSearch<SearchDoc>> {
  const docs: SearchDoc[] = []

  const loaded = await Promise.all(
    Object.entries(topicLoaders).map(async ([domainId, load]) => [domainId, (await load()).topics] as const),
  )
  for (const [domainId, topics] of loaded) {
    const domain = domainById.get(domainId)
    for (const t of topics) {
      docs.push({
        id: `topic:${t.id}`,
        type: 'topic',
        title: t.title,
        subtitle: domain?.title ?? domainId,
        text: `${t.summary} ${t.keyPoints.join(' ')}`.replace(/\*\*|`|\[\[|\]\]/g, ''),
        route: `/topics/${domainId}/${t.id}`,
      })
    }
  }

  for (const c of classSummaries) {
    docs.push({
      id: `class:${c.fqcn}`,
      type: 'class',
      title: c.name,
      subtitle: c.pkg,
      text: c.summary,
      route: `/classes/${c.fqcn}`,
    })
  }

  // Domains themselves are useful search targets too.
  for (const d of domains) {
    docs.push({
      id: `domain:${d.id}`,
      type: 'topic',
      title: d.title,
      subtitle: 'Domain',
      text: d.blurb,
      route: `/topics/${d.id}`,
    })
  }

  const mini = new MiniSearch<SearchDoc>({
    fields: ['title', 'text', 'subtitle'],
    storeFields: ['type', 'title', 'subtitle', 'route'],
    searchOptions: {
      boost: { title: 3, subtitle: 1.5 },
      prefix: true,
      fuzzy: 0.2,
    },
  })
  mini.addAll(docs)
  return mini
}

/** Lazily builds (once) and returns the search index. */
export function getSearchIndex(): Promise<MiniSearch<SearchDoc>> {
  if (!indexPromise) indexPromise = build()
  return indexPromise
}
