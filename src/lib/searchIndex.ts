import MiniSearch from 'minisearch'
import type { CompendiumData } from '../data/registry'

export interface SearchDoc {
  id: string
  type: 'topic' | 'class'
  title: string
  subtitle: string
  text: string
  route: string
}

async function build(compendiumId: string, data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
  const docs: SearchDoc[] = []

  const loaded = await Promise.all(
    Object.entries(data.topicLoaders).map(async ([domainId, load]) => [domainId, (await load()).topics] as const),
  )
  for (const [domainId, topics] of loaded) {
    const domain = data.domainById.get(domainId)
    for (const t of topics) {
      docs.push({
        id: `topic:${t.id}`,
        type: 'topic',
        title: t.title,
        subtitle: domain?.title ?? domainId,
        text: `${t.summary} ${t.keyPoints.map((kp) => (typeof kp === 'string' ? kp : kp.text)).join(' ')}`.replace(
          /\*\*|`|\[\[|\]\]/g,
          '',
        ),
        route: `/${compendiumId}/topics/${domainId}/${t.id}`,
      })
    }
  }

  for (const c of data.classSummaries) {
    docs.push({
      id: `class:${c.fqcn}`,
      type: 'class',
      title: c.name,
      subtitle: c.pkg,
      text: c.summary,
      route: `/${compendiumId}/classes/${c.fqcn}`,
    })
  }

  // Domains themselves are useful search targets too.
  for (const d of data.domains) {
    docs.push({
      id: `domain:${d.id}`,
      type: 'topic',
      title: d.title,
      subtitle: 'Domain',
      text: d.blurb,
      route: `/${compendiumId}/topics/${d.id}`,
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

const indexPromises = new Map<string, Promise<MiniSearch<SearchDoc>>>()

/** Lazily builds (once per compendium) and returns that compendium's search index. */
export function getSearchIndex(compendiumId: string, data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
  let promise = indexPromises.get(compendiumId)
  if (!promise) {
    promise = build(compendiumId, data)
    indexPromises.set(compendiumId, promise)
  }
  return promise
}
