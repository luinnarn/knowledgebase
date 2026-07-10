import type { RouteMeta } from './routes'
import { resolveOgImagePath } from './ogImage'

const SITE_ORIGIN = 'https://referencehub.dev'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Classic Cloudflare Pages hosting 308-redirects a trailing-slash-free URL to its
 *  trailing-slash form before serving index.html. Every absolute URL we hand to a search
 *  engine or social crawler (canonical, og:url, JSON-LD) must already be the post-redirect
 *  form, or we're pointing a canonical at a URL that redirects — an anti-pattern Google
 *  explicitly warns against. Route paths themselves stay slash-free (see routes.ts); this
 *  only normalizes the URL strings built for external consumption. */
function withTrailingSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function breadcrumbJsonLd(route: RouteMeta, canonical: string): object {
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = []
  let position = 1
  items.push({ '@type': 'ListItem', position: position++, name: 'Compendium', item: `${SITE_ORIGIN}/` })

  if (route.compendiumId && route.compendiumLabel) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: `${route.compendiumLabel}::Compendium`,
      item: `${SITE_ORIGIN}${withTrailingSlash(`/${route.compendiumId}`)}`,
    })
  }
  if (route.domainId && route.domainTitle && route.compendiumId) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: route.domainTitle,
      item: `${SITE_ORIGIN}${withTrailingSlash(`/${route.compendiumId}/topics/${route.domainId}`)}`,
    })
  }
  items.push({ '@type': 'ListItem', position: position++, name: route.title, item: canonical })

  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
}

/** Builds the full <head> fragment (title, description, canonical, OG/Twitter, JSON-LD) for one
 *  route. Returned as a raw HTML string the prerender script splices into the built index.html
 *  template just before </head>. */
export function buildHead(route: RouteMeta): string {
  const canonical = `${SITE_ORIGIN}${withTrailingSlash(route.path)}`
  const image = `${SITE_ORIGIN}${resolveOgImagePath(route)}`
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)

  const jsonLd: object[] = []

  if (route.kind === 'topic' || route.kind === 'class-detail') {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: route.title,
      description: route.description,
      url: canonical,
      ...(route.compendiumLabel ? { isPartOf: { '@type': 'CreativeWorkSeries', name: `${route.compendiumLabel}::Compendium` } } : {}),
      ...(route.domainTitle ? { about: route.domainTitle } : {}),
    })
  }

  if (route.kind === 'compendium-home' && route.domains && route.compendiumId) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: route.domains.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.title,
        url: `${SITE_ORIGIN}${withTrailingSlash(`/${route.compendiumId}/topics/${d.id}`)}`,
      })),
    })
  }

  if (route.kind === 'picker') {
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Compendium', url: `${SITE_ORIGIN}/` })
  } else {
    jsonLd.push(breadcrumbJsonLd(route, canonical))
  }

  const jsonLdTags = jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n    ')

  return `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    ${jsonLdTags}`
}
