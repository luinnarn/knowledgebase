import { render, screen } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import ClassDetail, { preloadClassArea } from './ClassDetail'
import { renderWithCompendium } from '../test-utils'

test('preloadClassArea warms the cache so ClassDetail renders real content on first render', async () => {
  const fqcn = compendiumRegistry.java.classSummaries[0].fqcn
  const area = compendiumRegistry.java.classSummaries[0].area
  await preloadClassArea('java', area, compendiumRegistry.java.classLoaders)

  renderWithCompendium(<ClassDetail fqcn={fqcn} />)

  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
