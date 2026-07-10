import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { compendiumRegistry } from './data/registry'
import { preloadTopics } from './lib/useTopics'
import { preloadClassArea } from './components/ClassDetail'
import { getAllRoutes, type RouteMeta, type RouteKind } from './seo/routes'
import type { Topic, JavaClass } from './types/content'

export { getAllRoutes, type RouteMeta, type RouteKind }
export { generateOgImages } from './seo/ogImageRender'
export { resolveOgImagePath } from './seo/ogImage'
export { buildHead } from './seo/head'

/** Whatever lazy data preload() loaded server-side, serializable into the page so the client can
 *  seed its own module caches before its first render — otherwise the client's first render
 *  starts from an empty cache and mismatches the prerendered HTML (a hydration mismatch). */
export type PreloadedData =
  | { kind: 'topic'; compendiumId: string; domainId: string; topics: Topic[] }
  | { kind: 'class-detail'; compendiumId: string; area: string; classes: JavaClass[] }
  | null

/** Pre-warms whichever lazy-loaded cache the given route depends on, so the single synchronous
 *  renderToString pass below renders real content instead of each component's "loading" state
 *  (which normally only resolves via a useEffect that never fires during SSR). Returns the
 *  loaded data so it can be serialized into the page for client-side cache seeding. */
async function preload(route: RouteMeta): Promise<PreloadedData> {
  if (!route.compendiumId) return null
  const data = compendiumRegistry[route.compendiumId]

  if (route.kind === 'topic' && route.domainId) {
    const topics = await preloadTopics(route.compendiumId, route.domainId, data.topicLoaders)
    return topics ? { kind: 'topic', compendiumId: route.compendiumId, domainId: route.domainId, topics } : null
  }

  if (route.kind === 'class-detail' && route.fqcn) {
    const summary = data.classSummaries.find((s) => s.fqcn === route.fqcn)
    if (summary) {
      const classes = await preloadClassArea(route.compendiumId, summary.area, data.classLoaders)
      return classes ? { kind: 'class-detail', compendiumId: route.compendiumId, area: summary.area, classes } : null
    }
  }

  return null
}

export interface RenderResult {
  html: string
  preloadedData: PreloadedData
}

/** Renders one route to a static HTML fragment (no <html>/<head> — the prerender script injects
 *  that separately). Always goes through this function rather than calling renderToString
 *  directly against <App/>, since real content for topic/class-detail routes requires their
 *  lazy data to already be cached. */
export async function render(route: RouteMeta): Promise<RenderResult> {
  const preloadedData = await preload(route)
  const html = renderToString(
    <StaticRouter location={route.path}>
      <App />
    </StaticRouter>,
  )
  return { html, preloadedData }
}
