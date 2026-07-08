import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from '../lib/useTheme'
import './Diagram.css'

interface Props {
  code: string
  title?: string
  caption?: string
}

type State = { status: 'loading' } | { status: 'ready'; svg: string } | { status: 'error'; message: string }

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Re-skins Mermaid's default theme with the app's own design tokens, so diagrams
 * look like part of the page instead of an embedded third-party widget. */
function themeVariables() {
  return {
    fontFamily: cssVar('--font-body'),
    primaryColor: cssVar('--bg-sunken'),
    primaryTextColor: cssVar('--ink'),
    primaryBorderColor: cssVar('--line-strong'),
    lineColor: cssVar('--accent'),
    textColor: cssVar('--ink'),
    mainBkg: cssVar('--bg-raised'),
    secondaryColor: cssVar('--bg-sunken'),
    tertiaryColor: cssVar('--bg-sunken'),
    clusterBkg: cssVar('--bg-sunken'),
    clusterBorder: cssVar('--line-strong'),
    edgeLabelBackground: cssVar('--bg-raised'),
    noteBkgColor: cssVar('--note-bg'),
    noteBorderColor: cssVar('--note-line'),
    noteTextColor: cssVar('--note-ink'),
    actorBkg: cssVar('--bg-sunken'),
    actorBorder: cssVar('--line-strong'),
    actorTextColor: cssVar('--ink'),
    actorLineColor: cssVar('--line-strong'),
    signalColor: cssVar('--ink-2'),
    signalTextColor: cssVar('--ink'),
    labelBoxBkgColor: cssVar('--bg-sunken'),
    labelBoxBorderColor: cssVar('--line-strong'),
    labelTextColor: cssVar('--ink'),
    loopTextColor: cssVar('--ink-2'),
    activationBkgColor: cssVar('--bg-sunken'),
    activationBorderColor: cssVar('--line-strong'),
  }
}

export default function Diagram({ code, title, caption }: Props) {
  const [theme] = useTheme()
  const instanceId = useId().replace(/:/g, '_')
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: themeVariables() })
    // A fresh id per (re-)render dodges Mermaid's internal render cache when the theme flips.
    mermaid
      .render(`mermaid-${instanceId}-${theme}-${Date.now()}`, code)
      .then(({ svg, bindFunctions }) => {
        if (cancelled) return
        setState({ status: 'ready', svg })
        requestAnimationFrame(() => {
          if (!cancelled && containerRef.current) bindFunctions?.(containerRef.current)
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      })
    return () => {
      cancelled = true
    }
  }, [code, theme, instanceId])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <figure className="diagram">
      <div className="diagram-bar">
        <span className="diagram-title">{title ?? 'Diagram'}</span>
        <button className="diagram-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {state.status === 'error' ? (
        <div className="diagram-error">
          <p>Diagram failed to render: {state.message}</p>
          <pre>{code}</pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="diagram-canvas"
          aria-busy={state.status === 'loading'}
          {...(state.status === 'ready' ? { dangerouslySetInnerHTML: { __html: state.svg } } : {})}
        />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
