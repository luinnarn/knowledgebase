import puppeteer from 'puppeteer-core'

const OUT = '/private/tmp/claude-501/-Users-nikola-VS-Code-Projects-java-knowledge-base/323d6c65-17b6-40b6-81e7-ae936a0506bf/scratchpad/shots'
import { mkdirSync } from 'fs'
mkdirSync(OUT, { recursive: true })

const BASE = 'http://localhost:4173'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
})

const errors = []
const page = await browser.newPage()
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[${page.url()}] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[${page.url()}] PAGEERROR ${err.message}`))

const shots = [
  ['home', '/', 1440, 900, null],
  ['topics-index', '/topics', 1440, 900, null],
  ['topic-thread-safety', '/topics/concurrency/thread-safety', 1440, 900, null],
  ['graph', '/graph', 1440, 900, 1500],
  ['classes', '/classes', 1440, 900, null],
  ['class-chm', '/classes/java.util.concurrent.ConcurrentHashMap', 1440, 900, null],
  ['home-mobile', '/', 375, 812, null],
  ['topic-mobile', '/topics/jvm/gc-fundamentals', 375, 812, null],
  ['graph-mobile', '/graph', 375, 812, 1500],
]

for (const [name, path, w, h, extraWait] of shots) {
  await page.setViewport({ width: w, height: h })
  await page.goto(BASE + path, { waitUntil: 'networkidle0' })
  if (extraWait) await new Promise((r) => setTimeout(r, extraWait))
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot', name)
}

// Dark theme check
await page.setViewport({ width: 1440, height: 900 })
await page.goto(BASE + '/topics/generics/wildcards-pecs', { waitUntil: 'networkidle0' })
await page.evaluate(() => { localStorage.setItem('jkb-theme', 'dark'); document.documentElement.dataset.theme = 'dark' })
await page.screenshot({ path: `${OUT}/topic-dark.png` })
console.log('shot topic-dark')

await page.evaluate(() => { localStorage.setItem('jkb-theme', 'light'); document.documentElement.dataset.theme = 'light' })
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
await page.keyboard.down('Meta')
await page.keyboard.press('k')
await page.keyboard.up('Meta')
await page.type('input[aria-label="Search query"]', 'volatile')
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: `${OUT}/search.png` })
console.log('shot search')

console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
