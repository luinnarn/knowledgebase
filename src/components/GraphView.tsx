import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import { graphNodes, graphEdges } from '../data/graph'
import { topicLoaders } from '../data/topics/index'
import { domains, domainById } from '../data/domains'
import type { GraphNode } from '../types/content'
import './GraphView.css'

interface SimNode extends SimulationNodeDatum, GraphNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  type: string
}

const RADIUS: Record<number, number> = { 1: 7, 2: 10, 3: 14 }
const HUB_RADIUS = 20

function nodeRadius(n: GraphNode): number {
  return n.kind === 'domain' ? HUB_RADIUS : RADIUS[n.importance]
}

/** Runs the simulation to completion synchronously and returns positioned nodes/links. */
function layout(): { nodes: SimNode[]; links: SimLink[] } {
  const nodes: SimNode[] = graphNodes.map((n) => ({ ...n }))
  const links: SimLink[] = graphEdges.map((e) => ({ source: e.source, target: e.target, type: e.type }))

  const sim = forceSimulation(nodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance((l) => (l.type === 'part-of' ? 55 : 95))
        .strength((l) => (l.type === 'part-of' ? 0.9 : 0.25)),
    )
    .force('charge', forceManyBody().strength(-260))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide<SimNode>().radius((d) => nodeRadius(d) + 14))
    .stop()

  const ticks = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay()))
  for (let i = 0; i < ticks; i++) sim.tick()
  return { nodes, links }
}

interface Transform {
  x: number
  y: number
  k: number
}

export default function GraphView() {
  const { nodes, links } = useMemo(layout, [])
  const [selected, setSelected] = useState<SimNode | null>(null)
  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set())
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ startX: number; startY: number; origin: Transform } | null>(null)
  const pinch = useRef<number | null>(null)

  const bounds = useMemo(() => {
    const xs = nodes.map((n) => n.x ?? 0)
    const ys = nodes.map((n) => n.y ?? 0)
    const pad = 60
    const minX = Math.min(...xs) - pad
    const minY = Math.min(...ys) - pad
    return { minX, minY, w: Math.max(...xs) + pad - minX, h: Math.max(...ys) + pad - minY }
  }, [nodes])

  const dimmed = (n: SimNode) => activeDomains.size > 0 && !activeDomains.has(n.domainId)

  const neighborIds = useMemo(() => {
    if (!selected) return new Set<string>()
    const ids = new Set<string>([selected.id])
    for (const l of links) {
      const s = l.source as SimNode
      const t = l.target as SimNode
      if (s.id === selected.id) ids.add(t.id)
      if (t.id === selected.id) ids.add(s.id)
    }
    return ids
  }, [selected, links])

  // Wheel zoom (native listener: React's onWheel is passive and can't preventDefault).
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      setTransform((t) => {
        const k = Math.min(4, Math.max(0.3, t.k * factor))
        return { ...t, k }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, origin: transform }
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    setTransform({ ...drag.current.origin, x: drag.current.origin.x + dx, y: drag.current.origin.y + dy })
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinch.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      const factor = d / pinch.current
      pinch.current = d
      setTransform((t) => ({ ...t, k: Math.min(4, Math.max(0.3, t.k * factor)) }))
    }
  }

  const toggleDomain = (id: string) => {
    setActiveDomains((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedDomain = selected ? domainById.get(selected.domainId) : undefined

  return (
    <div className="graphview">
      <div className="graph-toolbar">
        <div className="graph-filters" role="group" aria-label="Filter by domain">
          {domains.map((d) => (
            <button
              key={d.id}
              className={`chip graph-filter ${activeDomains.size === 0 || activeDomains.has(d.id) ? '' : 'is-off'}`}
              onClick={() => toggleDomain(d.id)}
              aria-pressed={activeDomains.has(d.id)}
            >
              <span className="dot" style={{ background: d.color }} />
              {d.title}
            </button>
          ))}
          {activeDomains.size > 0 && (
            <button className="chip graph-filter-clear" onClick={() => setActiveDomains(new Set())}>
              Clear
            </button>
          )}
        </div>
        <div className="graph-legend" aria-hidden>
          <span className="legend-item">
            <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" className="legend-line part-of" /></svg>
            part of
          </span>
          <span className="legend-item">
            <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" className="legend-line prerequisite-of" /></svg>
            prerequisite
          </span>
          <span className="legend-item">
            <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" className="legend-line related-to" /></svg>
            related
          </span>
        </div>
      </div>

      <div className="graph-stage">
        <svg
          ref={svgRef}
          className="graph-svg"
          viewBox={`${bounds.minX} ${bounds.minY} ${bounds.w} ${bounds.h}`}
          role="img"
          aria-label="Knowledge graph of Java topics"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
            <g className="graph-links">
              {links.map((l, i) => {
                const s = l.source as SimNode
                const t = l.target as SimNode
                const faded = dimmed(s) || dimmed(t) || (selected !== null && !(neighborIds.has(s.id) && neighborIds.has(t.id)))
                return (
                  <line
                    key={i}
                    className={`graph-link ${l.type} ${faded ? 'is-faded' : ''}`}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                  />
                )
              })}
            </g>
            <g className="graph-nodes">
              {nodes.map((n) => {
                const domain = domainById.get(n.domainId)
                const faded = dimmed(n) || (selected !== null && !neighborIds.has(n.id))
                return (
                  <g
                    key={n.id}
                    className={`graph-node ${faded ? 'is-faded' : ''} ${selected?.id === n.id ? 'is-selected' : ''}`}
                    transform={`translate(${n.x} ${n.y})`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(selected?.id === n.id ? null : n)
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={n.label}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelected(selected?.id === n.id ? null : n)
                    }}
                  >
                    <circle
                      r={nodeRadius(n)}
                      fill={n.kind === 'domain' ? 'transparent' : domain?.color}
                      stroke={domain?.color}
                      strokeWidth={n.kind === 'domain' ? 2.5 : 0}
                    />
                    <text dy={nodeRadius(n) + 12} className={n.kind === 'domain' ? 'hub-label' : ''}>
                      {n.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </g>
        </svg>

        {selected && (
          <aside className="graph-panel" style={{ '--domain': selectedDomain?.color } as React.CSSProperties}>
            <button className="graph-panel-close" onClick={() => setSelected(null)} aria-label="Close preview">
              ×
            </button>
            <p className="eyebrow" style={{ color: selectedDomain?.color }}>
              {selectedDomain?.title}
            </p>
            <h2>{selected.label}</h2>
            {selected.kind === 'topic' ? (
              <>
                <GraphPanelSummary topicId={selected.id} domainId={selected.domainId} />
                <Link className="graph-panel-open" to={`/topics/${selected.domainId}/${selected.id}`}>
                  Open topic →
                </Link>
              </>
            ) : (
              <>
                <p className="graph-panel-summary">{selectedDomain?.blurb}</p>
                <Link className="graph-panel-open" to={`/topics/${selected.domainId}`}>
                  Open domain →
                </Link>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

function GraphPanelSummary({ topicId, domainId }: { topicId: string; domainId: string }) {
  const [summary, setSummary] = useState<string>('')
  useEffect(() => {
    let cancelled = false
    const loader = topicLoaders[domainId]
    if (!loader) return
    loader().then(({ topics }) => {
      if (cancelled) return
      const t = topics.find((t) => t.id === topicId)
      setSummary(t ? t.summary.replace(/\*\*|`|\[\[|\]\]/g, '') : '')
    })
    return () => {
      cancelled = true
    }
  }, [topicId, domainId])
  return <p className="graph-panel-summary">{summary}</p>
}
