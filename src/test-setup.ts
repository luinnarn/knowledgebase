import '@testing-library/jest-dom/vitest'

// jsdom lacks matchMedia; provide a minimal stub.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom doesn't implement scrollTo — it logs "Not implemented" instead of
// silently no-op'ing, which is noisy in any test that mounts AppShell.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
