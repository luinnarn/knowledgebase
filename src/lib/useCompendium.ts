import { createContext, useContext } from 'react'
import type { CompendiumMeta } from '../data/compendiums'
import type { CompendiumData } from '../data/registry'

export const STORAGE_KEY = 'jkb-compendium'

export interface CompendiumValue extends CompendiumData {
  id: string
  meta: CompendiumMeta
  setCompendium: (id: string) => void
}

export const CompendiumContext = createContext<CompendiumValue | null>(null)

/** The active compendium's metadata and data set, plus a setter to switch it. */
export function useCompendium(): CompendiumValue {
  const ctx = useContext(CompendiumContext)
  if (!ctx) throw new Error('useCompendium must be used within CompendiumProvider')
  return ctx
}
