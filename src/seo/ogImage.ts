import { compendiums } from '../data/compendiums'
import { compendiumRegistry } from '../data/registry'
import type { RouteMeta } from './routes'

/** Public URL path (relative to site root) for a domain's generated OG image. */
export function ogImagePath(compendiumId: string, domainId: string): string {
  return `/og/${compendiumId}/${domainId}.png`
}

/** Resolves which domain's OG image a given route should use: its own domain if it has one,
 *  otherwise its compendium's first domain (compendium home, topics index, graph, classes
 *  index), otherwise the Java default compendium's first domain (only the root picker route
 *  has no compendium at all). */
export function resolveOgImagePath(route: RouteMeta): string {
  const compendiumId = route.compendiumId ?? 'java'
  const domainId = route.domainId ?? compendiumRegistry[compendiumId].domains[0].id
  return ogImagePath(compendiumId, domainId)
}

export interface OgImageTarget {
  compendiumId: string
  domainId: string
  domainTitle: string
  compendiumLabel: string
  color: string
}

/** Every (compendium, domain) pair whose OG image must be generated at build time — one per
 *  domain across all compendiums (32 today: 12 Java + 10 CS + 10 System Design). */
export function allOgImageTargets(): OgImageTarget[] {
  const targets: OgImageTarget[] = []
  for (const meta of compendiums) {
    for (const domain of compendiumRegistry[meta.id].domains) {
      targets.push({
        compendiumId: meta.id,
        domainId: domain.id,
        domainTitle: domain.title,
        compendiumLabel: meta.label,
        color: domain.color,
      })
    }
  }
  return targets
}
