import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'jkb-theme'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function currentTheme(): Theme {
  const stored = localStorage.getItem(KEY)
  return stored === 'light' || stored === 'dark' ? stored : systemTheme()
}

let listeners: Array<() => void> = []

function subscribe(cb: () => void) {
  listeners.push(cb)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
    mq.removeEventListener('change', cb)
  }
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, currentTheme)

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    localStorage.setItem(KEY, next)
    document.documentElement.dataset.theme = next
    listeners.forEach((l) => l())
  }, [])

  // Keep the attribute in sync on first render too.
  document.documentElement.dataset.theme = theme
  return [theme, toggle]
}
