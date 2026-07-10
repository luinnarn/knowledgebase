import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { generateOgImages } from './ogImageRender'
import { allOgImageTargets } from './ogImage'

test('generates one valid PNG per OG image target, including domain titles with special characters', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'og-images-'))
  await generateOgImages(dir)

  const targets = allOgImageTargets()
  for (const target of targets) {
    const filePath = path.join(dir, 'og', target.compendiumId, `${target.domainId}.png`)
    const bytes = await readFile(filePath)
    expect(bytes.length).toBeGreaterThan(0)
    // PNG magic number.
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }

  // Regression check for the specific domain whose title contains an unescaped "&"
  // ("Objects, Classes & OOP Design") — this must not throw when building the SVG.
  const oopDir = await readdir(path.join(dir, 'og', 'java'))
  expect(oopDir).toContain('oop.png')
}, 20000)
