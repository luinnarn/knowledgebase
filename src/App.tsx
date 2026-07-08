import { Routes, Route } from 'react-router-dom'
import CompendiumProvider from './lib/CompendiumProvider'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import GraphPage from './pages/GraphPage'
import ClassesPage from './pages/ClassesPage'

export default function App() {
  return (
    <CompendiumProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="topics/:domainId?/:topicId?" element={<TopicPage />} />
          <Route path="graph" element={<GraphPage />} />
          <Route path="classes/:fqcn?" element={<ClassesPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </CompendiumProvider>
  )
}
