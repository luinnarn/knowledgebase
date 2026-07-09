import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound({ homeHref = '/', homeLabel = 'home' }: { homeHref?: string; homeLabel?: string }) {
  return (
    <div className="not-found">
      <h1>Not found</h1>
      <p className="not-found-lede">
        That page doesn't exist. Browse the <Link to={homeHref}>{homeLabel}</Link> instead.
      </p>
    </div>
  )
}
