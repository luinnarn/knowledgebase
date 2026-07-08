import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { compendiumById, DEFAULT_COMPENDIUM } from '../data/compendiums'
import { compendiumRegistry } from '../data/registry'
import { CompendiumContext, STORAGE_KEY, type CompendiumValue } from './useCompendium'

function initialId(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && compendiumById.has(stored) ? stored : DEFAULT_COMPENDIUM
}

export default function CompendiumProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(initialId)
  const navigate = useNavigate()

  const value = useMemo<CompendiumValue>(() => {
    const setCompendium = (next: string) => {
      if (next === id || !compendiumById.has(next)) return
      localStorage.setItem(STORAGE_KEY, next)
      setId(next)
      navigate('/')
    }
    return { id, meta: compendiumById.get(id)!, ...compendiumRegistry[id], setCompendium }
  }, [id, navigate])

  return <CompendiumContext.Provider value={value}>{children}</CompendiumContext.Provider>
}
