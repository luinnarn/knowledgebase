import { Link } from 'react-router-dom'
import { compendiums } from '../data/compendiums'
import { STORAGE_KEY } from '../lib/useCompendium'
import ThemeToggle from '../components/ThemeToggle'
import './CompendiumPicker.css'

export default function CompendiumPicker() {
  const lastUsed = localStorage.getItem(STORAGE_KEY)

  return (
    <div className="picker">
      <header className="picker-header">
        <span className="picker-brand">Compendium</span>
        <ThemeToggle />
      </header>
      <main className="picker-main">
        <h1 className="picker-title">Choose a compendium</h1>
        <div className="picker-grid">
          {compendiums.map((c) => (
            <Link key={c.id} to={`/${c.id}`} className={`picker-card ${c.id === lastUsed ? 'is-last-used' : ''}`}>
              <span className="picker-card-label">{c.label}</span>
              <span className="picker-card-hero">{c.heroTitle}</span>
              <span className="picker-card-lede">{c.heroLede}</span>
              {c.id === lastUsed && <span className="picker-card-continue">Continue</span>}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
