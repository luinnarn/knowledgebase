import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { allOgImageTargets } from './ogImage'

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function svgTemplate(domainTitle: string, compendiumLabel: string, color: string): string {
  const safeDomainTitle = escapeXml(domainTitle)
  const safeLabel = escapeXml(compendiumLabel)
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#12141c"/>
  <rect x="0" y="0" width="24" height="${HEIGHT}" fill="${color}"/>
  <text x="80" y="120" font-family="sans-serif" font-size="32" fill="${color}" font-weight="700">${safeLabel}::Compendium</text>
  <text x="80" y="340" font-family="sans-serif" font-size="64" fill="#F5F6FA" font-weight="700">${safeDomainTitle}</text>
</svg>`
}

/** Rasterizes one PNG per domain across every compendium into <distDir>/og/<compendiumId>/<domainId>.png. */
export async function generateOgImages(distDir: string): Promise<void> {
  for (const target of allOgImageTargets()) {
    const svg = svgTemplate(target.domainTitle, target.compendiumLabel, target.color)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    const png = resvg.render().asPng()

    const outDir = path.join(distDir, 'og', target.compendiumId)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, `${target.domainId}.png`), png)
  }
}
