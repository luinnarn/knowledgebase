import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/space-grotesk/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'
import { seedTopicsCache } from './lib/useTopics'
import { seedClassAreaCache } from './components/ClassDetail'

/** Reads the serialized SSR preload payload (if the prerendered page included one) and seeds the
 *  matching module cache before React's first render, so the client's first render already
 *  matches the prerendered HTML instead of starting from an empty cache (a hydration mismatch). */
function seedFromPreloadedData(): void {
  const el = document.getElementById('__PRELOADED__')
  if (!el?.textContent) return
  try {
    const data = JSON.parse(el.textContent)
    if (data.kind === 'topic') {
      seedTopicsCache(data.compendiumId, data.domainId, data.topics)
    } else if (data.kind === 'class-detail') {
      seedClassAreaCache(data.compendiumId, data.area, data.classes)
    }
  } catch (err) {
    console.error('Failed to seed cache from preloaded data:', err)
  }
}

seedFromPreloadedData()

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
