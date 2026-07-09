import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { compendiumRegistry } from './data/registry'
import { preloadTopics } from './lib/useTopics'
import { preloadClassArea } from './components/ClassDetail'
import { getAllRoutes, type RouteMeta, type RouteKind } from './seo/routes'

export { getAllRoutes, type RouteMeta, type RouteKind }
export { generateOgImages } from './seo/ogImageRender'
export { resolveOgImagePath } from './seo/ogImage'

/** Pre-warms whichever lazy-loaded cache the given route depends on, so the single synchronous
 *  renderToString pass below renders real content instead of each component's "loading" state
 *  (which normally only resolves via a useEffect that never fires during SSR). */
async function preload(route: RouteMeta): Promise<void> {
  if (!route.compendiumId) return
  const data = compendiumRegistry[route.compendiumId]

  if (route.kind === 'topic' && route.domainId) {
    await preloadTopics(route.compendiumId, route.domainId, data.topicLoaders)
  }

  if (route.kind === 'class-detail' && route.fqcn) {
    const summary = data.classSummaries.find((s) => s.fqcn === route.fqcn)
    if (summary) await preloadClassArea(route.compendiumId, summary.area, data.classLoaders)
  }
}

/** Renders one route to a static HTML fragment (no <html>/<head> — the prerender script injects
 *  that separately). Always goes through this function rather than calling renderToString
 *  directly against <App/>, since real content for topic/class-detail routes requires their
 *  lazy data to already be cached. */
export async function render(route: RouteMeta): Promise<string> {
  await preload(route)
  return renderToString(
    <StaticRouter location={route.path}>
      <App />
    </StaticRouter>,
  )
}
