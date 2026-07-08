import { useState } from 'react'
import RichText from './RichText'
import CodeBlock from './CodeBlock'
import ExplainToggle from './ExplainToggle'
import './Callout.css'

type Variant = 'pitfall' | 'bestPractice' | 'note'

const META: Record<Variant, { icon: string; defaultTitle: string }> = {
  pitfall: { icon: '⚠', defaultTitle: 'Pitfall' },
  bestPractice: { icon: '✓', defaultTitle: 'Best practice' },
  note: { icon: 'ℹ', defaultTitle: 'Note' },
}

interface Props {
  variant: Variant
  title?: string
  text: string
  code?: string
  detail?: string
}

export default function Callout({ variant, title, text, code, detail }: Props) {
  const meta = META[variant]
  const [open, setOpen] = useState(false)
  return (
    <aside className={`callout callout-${variant}`}>
      <div className="callout-head">
        <span className="callout-icon" aria-hidden>
          {meta.icon}
        </span>
        <span className="callout-title">{title ?? meta.defaultTitle}</span>
        {detail && <ExplainToggle expanded={open} onToggle={() => setOpen((o) => !o)} />}
      </div>
      <p className="callout-body">
        <RichText text={text} />
      </p>
      {detail && open && (
        <div className="callout-detail">
          <RichText text={detail} />
        </div>
      )}
      {code && <CodeBlock code={code} />}
    </aside>
  )
}
