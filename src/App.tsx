import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import CompendiumProvider from './lib/CompendiumProvider'
import AppShell from './components/AppShell'
import NotFound from './components/NotFound'
import CompendiumPicker from './pages/CompendiumPicker'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import GraphPage from './pages/GraphPage'
import ClassesPage from './pages/ClassesPage'
import { compendiumById, DEFAULT_COMPENDIUM } from './data/compendiums'
import { STORAGE_KEY } from './lib/useCompendium'

/** Redirects a pre-migration unprefixed URL (e.g. /topics/x) into the compendium-scoped
 *  equivalent, using the last-known compendium from localStorage (defaulting to Java). */
function LegacyRedirect() {
  const location = useLocation()
  const stored = localStorage.getItem(STORAGE_KEY)
  const target = stored && compendiumById.has(stored) ? stored : DEFAULT_COMPENDIUM
  return <Navigate to={`/${target}${location.pathname}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route index element={<CompendiumPicker />} />

      {/* Legacy unprefixed URLs from before compendium-scoped routing — redirect, don't 404. */}
      <Route path="topics" element={<LegacyRedirect />} />
      <Route path="topics/*" element={<LegacyRedirect />} />
      <Route path="graph" element={<LegacyRedirect />} />
      <Route path="classes" element={<LegacyRedirect />} />
      <Route path="classes/*" element={<LegacyRedirect />} />

      <Route
        path=":compendiumId"
        element={
          <CompendiumProvider>
            <AppShell />
          </CompendiumProvider>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="topics/:domainId?/:topicId?" element={<TopicPage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="classes/:fqcn?" element={<ClassesPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
