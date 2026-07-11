import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (err) => errors.push(err.message))

// 1. Manifest is reachable and well-formed.
await page.goto(`${BASE}/java/`, { waitUntil: 'networkidle0' })
const manifest = await page.evaluate(() => fetch('/manifest.webmanifest').then((r) => r.json()))
console.log('manifest name:', manifest.name)
console.log('manifest icons:', manifest.icons.map((i) => i.sizes).join(', '))
if (manifest.display !== 'standalone') throw new Error('manifest.display is not "standalone"')

// 2. Service worker registers, then reload so it takes control of the page.
await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), { timeout: 15000 })
await page.reload({ waitUntil: 'networkidle0' })
const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
console.log('service worker controls the page:', controlled)
if (!controlled) throw new Error('service worker did not take control after reload')

// 3. Visit a topic page online so it enters the runtime "pages" cache.
const visitedPath = '/java/topics/generics/wildcards-pecs'
await page.goto(BASE + visitedPath, { waitUntil: 'networkidle0' })
const visitedHeading = await page.$eval('h1', (el) => el.textContent)
console.log('visited page heading (online):', visitedHeading)

// 4. Go offline. The visited page should still render from cache.
await page.setOfflineMode(true)
await page.reload({ waitUntil: 'networkidle0' })
const offlineHeading = await page.$eval('h1', (el) => el.textContent)
console.log('visited page heading (offline):', offlineHeading)
if (offlineHeading !== visitedHeading) {
  throw new Error('offline reload of a previously-visited page did not match its online content')
}

// 5. A never-visited page should NOT be in the runtime cache, and a visited one should be.
// Inspected directly via the Cache Storage API (rather than by simulating a real offline
// navigation) because Puppeteer's page.setOfflineMode() only emulates network conditions for
// page/frame-level requests — fetches issued from inside the Service Worker's own execution
// context (e.g. NetworkFirst's internal fetch()) are never subject to it, so a real offline
// navigation to an unvisited page would misleadingly "succeed" regardless of caching behavior.
const unvisitedPath = '/java/topics/jvm/gc-fundamentals'
const cachedPageUrls = await page.evaluate(async () => {
  const cache = await caches.open('pages')
  const requests = await cache.keys()
  return requests.map((r) => r.url)
})
console.log('cached page URLs:', cachedPageUrls)
const visitedCached = cachedPageUrls.some((url) => url.endsWith(visitedPath))
const unvisitedCached = cachedPageUrls.some((url) => url.endsWith(unvisitedPath))
console.log('visited page is in the "pages" cache:', visitedCached)
console.log('unvisited page is NOT in the "pages" cache:', !unvisitedCached)
if (!visitedCached) throw new Error('the visited page was not found in the "pages" runtime cache')
if (unvisitedCached) throw new Error('an unvisited page was unexpectedly found in the "pages" runtime cache')

await page.setOfflineMode(false)
console.log('page errors:', errors.length ? errors : 'none')
await browser.close()
