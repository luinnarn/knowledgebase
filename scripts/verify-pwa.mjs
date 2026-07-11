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

// 5. A never-visited page should NOT be servable offline.
const unvisitedPath = '/java/topics/jvm/gc-fundamentals'
let unvisitedFailedOffline = false
try {
  const response = await page.goto(BASE + unvisitedPath, { waitUntil: 'networkidle0' })
  unvisitedFailedOffline = !response || !response.ok()
} catch {
  unvisitedFailedOffline = true
}
console.log('unvisited page correctly unavailable offline:', unvisitedFailedOffline)
if (!unvisitedFailedOffline) throw new Error('an unvisited page unexpectedly loaded while offline')

await page.setOfflineMode(false)
console.log('page errors:', errors.length ? errors : 'none')
await browser.close()
