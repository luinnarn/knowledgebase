import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllRoutes, render, generateOgImages, buildHead } from '../dist-ssr/entry-server.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(ROOT, '..', 'dist')
const SITE_ORIGIN = 'https://referencehub.dev'

// Classic Cloudflare Pages hosting 308-redirects a trailing-slash-free URL to its
// trailing-slash form before serving index.html (see src/seo/head.ts for the same rule
// applied to canonical/og:url/JSON-LD). The sitemap must list the same post-redirect URL
// the page's own canonical points at, or the sitemap disagrees with the page.
function withTrailingSlash(pathname) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')
  const routes = await getAllRoutes()

  await generateOgImages(DIST)

  const sitemapUrls = []
  for (const route of routes) {
    const html = await render(route)
    const head = buildHead(route)

    const page = template
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
      .replace(/<meta name="description"[^>]*>/, '')
      .replace(/<title>.*?<\/title>/s, '')
      .replace('</head>', `  ${head}\n  </head>`)

    const outDir = route.path === '/' ? DIST : path.join(DIST, route.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), page)

    sitemapUrls.push(`${SITE_ORIGIN}${withTrailingSlash(route.path)}`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap)

  console.log(`Prerendered ${routes.length} routes and wrote sitemap.xml with ${sitemapUrls.length} URLs.`)
}

main()
