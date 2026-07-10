import { compendiums, type CompendiumMeta } from '../data/compendiums'
import { compendiumRegistry, type CompendiumData } from '../data/registry'

export type RouteKind =
  | 'picker'
  | 'compendium-home'
  | 'topics-index'
  | 'domain-landing'
  | 'topic'
  | 'graph'
  | 'classes-index'
  | 'class-detail'

export interface RouteMeta {
  path: string
  kind: RouteKind
  title: string
  description: string
  compendiumId?: string
  compendiumLabel?: string
  domainId?: string
  domainTitle?: string
  topicId?: string
  fqcn?: string
  /** Only set on 'compendium-home' routes — feeds the ItemList structured data. */
  domains?: Array<{ id: string; title: string }>
}

/** Java's class-reference "areas" (from src/data/classes/index.ts's areaTitles) are a separate,
 *  smaller taxonomy than topic Domains (src/data/domains.ts) — they overlap in naming for some
 *  ids ('collections', 'functional', 'platform') but diverge for others ('concurrent' vs
 *  'concurrency', 'io-net' vs 'io', 'lang-core' has no Domain equivalent at all). Class pages
 *  have no Domain of their own, so they borrow the closest Domain's OG image via this table. */
export const CLASS_AREA_TO_DOMAIN_ID: Record<string, string> = {
  'lang-core': 'fundamentals',
  collections: 'collections',
  functional: 'functional',
  concurrent: 'concurrency',
  'io-net': 'io',
  platform: 'platform',
}

const MAX_DESCRIPTION_LENGTH = 155

function truncate(text: string): string {
  return text.length <= MAX_DESCRIPTION_LENGTH ? text : `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
}

async function compendiumRoutes(meta: CompendiumMeta, data: CompendiumData): Promise<RouteMeta[]> {
  const routes: RouteMeta[] = []

  routes.push({
    path: `/${meta.id}`,
    kind: 'compendium-home',
    title: `${meta.label}::Compendium`,
    description: truncate(meta.heroLede),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
    domains: data.domains.map((d) => ({ id: d.id, title: d.title })),
  })

  const topicCount = data.domains.reduce((n, d) => n + d.topicIds.length, 0)
  routes.push({
    path: `/${meta.id}/topics`,
    kind: 'topics-index',
    title: `Topics · ${meta.label}::Compendium`,
    description: truncate(`${data.domains.length} domains, ${topicCount} topics — distilled from curated books.`),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
  })

  routes.push({
    path: `/${meta.id}/graph`,
    kind: 'graph',
    title: `Knowledge Graph · ${meta.label}::Compendium`,
    description: truncate(`An interactive graph of every domain and topic in the ${meta.label} compendium.`),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
  })

  for (const domain of data.domains) {
    routes.push({
      path: `/${meta.id}/topics/${domain.id}`,
      kind: 'domain-landing',
      title: `${domain.title} · ${meta.label}::Compendium`,
      description: truncate(domain.blurb),
      compendiumId: meta.id,
      compendiumLabel: meta.label,
      domainId: domain.id,
      domainTitle: domain.title,
    })

    const loader = data.topicLoaders[domain.id]
    if (!loader) continue
    const { topics } = await loader()
    for (const topic of topics) {
      routes.push({
        path: `/${meta.id}/topics/${domain.id}/${topic.id}`,
        kind: 'topic',
        title: `${topic.title} · ${domain.title} · ${meta.label}::Compendium`,
        description: truncate(topic.summary),
        compendiumId: meta.id,
        compendiumLabel: meta.label,
        domainId: domain.id,
        domainTitle: domain.title,
        topicId: topic.id,
      })
    }
  }

  if (meta.hasClasses) {
    routes.push({
      path: `/${meta.id}/classes`,
      kind: 'classes-index',
      title: `Class Reference · ${meta.label}::Compendium`,
      description: truncate(
        `${data.classSummaries.length} essential JDK classes, curated — key methods, examples, and pitfalls.`,
      ),
      compendiumId: meta.id,
      compendiumLabel: meta.label,
    })

    for (const summary of data.classSummaries) {
      routes.push({
        path: `/${meta.id}/classes/${summary.fqcn}`,
        kind: 'class-detail',
        title: `${summary.name} · Class Reference · ${meta.label}::Compendium`,
        description: truncate(summary.summary),
        compendiumId: meta.id,
        compendiumLabel: meta.label,
        domainId: CLASS_AREA_TO_DOMAIN_ID[summary.area],
        fqcn: summary.fqcn,
      })
    }
  }

  return routes
}

/** Enumerates every canonical (non-legacy) route in the app, across all compendiums, with the
 *  metadata needed to prerender it and build its <head> tags. Single source of truth shared by
 *  the prerender script (Task 8), the SSR safety-net test (Task 5), and the sitemap generator
 *  (Task 8) — nothing else should hand-maintain a route list. */
export async function getAllRoutes(): Promise<RouteMeta[]> {
  const routes: RouteMeta[] = [
    {
      path: '/',
      kind: 'picker',
      title: 'Choose a Compendium · Compendium',
      description: 'Java, CS, and System Design — three cross-linked knowledge bases distilled from foundational books.',
    },
  ]
  for (const meta of compendiums) {
    routes.push(...(await compendiumRoutes(meta, compendiumRegistry[meta.id])))
  }
  return routes
}
