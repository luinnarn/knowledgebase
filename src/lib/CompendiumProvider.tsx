import { useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { compendiumById } from '../data/compendiums'
import { compendiumRegistry } from '../data/registry'
import { CompendiumContext, STORAGE_KEY, type CompendiumValue } from './useCompendium'
import NotFound from '../components/NotFound'

export default function CompendiumProvider({ children }: { children: ReactNode }) {
  const { compendiumId } = useParams()
  const navigate = useNavigate()
  const valid = !!compendiumId && compendiumById.has(compendiumId)

  // Keep localStorage in sync with whichever compendium is actually being viewed, so the
  // picker page's "continue" affordance reflects real usage — it drives no redirects itself.
  useEffect(() => {
    if (valid) localStorage.setItem(STORAGE_KEY, compendiumId!)
  }, [valid, compendiumId])

  const value = useMemo<CompendiumValue | null>(() => {
    if (!valid) return null
    const setCompendium = (next: string) => {
      if (next === compendiumId || !compendiumById.has(next)) return
      navigate(`/${next}`)
    }
    return { id: compendiumId!, meta: compendiumById.get(compendiumId!)!, ...compendiumRegistry[compendiumId!], setCompendium }
  }, [valid, compendiumId, navigate])

  if (!value) return <NotFound />

  return <CompendiumContext.Provider value={value}>{children}</CompendiumContext.Provider>
}
