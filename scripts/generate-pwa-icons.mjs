import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(ROOT, '..', 'public', 'icons')

const BG = '#0e1116'
const ACCENT = '#6499ff'

// Mirrors public/favicon.svg's proportions (a rounded dark square with a centered "::" glyph).
// The maskable variant drops the corner radius (the OS applies its own mask shape) and shrinks
// the glyph so it sits inside Android's ~80%-diameter safe-zone circle instead of being clipped.
function iconSvg(size, maskable) {
  const cornerRadius = maskable ? 0 : size * (7 / 32)
  const fontSize = maskable ? size * (150 / 512) : size * (14 / 32)
  const x = size / 2
  const y = size / 2 + fontSize * 0.35
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BG}"/>
  <text x="${x}" y="${y}" font-family="ui-monospace,monospace" font-size="${fontSize}" font-weight="700" fill="${ACCENT}" text-anchor="middle">::</text>
</svg>`
}

const specs = [
  { fileName: 'icon-192.png', size: 192, maskable: false },
  { fileName: 'icon-512.png', size: 512, maskable: false },
  { fileName: 'icon-maskable-512.png', size: 512, maskable: true },
  { fileName: 'apple-touch-icon.png', size: 180, maskable: false },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  for (const spec of specs) {
    const svg = iconSvg(spec.size, spec.maskable)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: spec.size } })
    const png = resvg.render().asPng()
    await writeFile(path.join(OUT_DIR, spec.fileName), png)
    console.log('wrote', spec.fileName)
  }
}

main()
