import RichText from './RichText'
import CodeBlock from './CodeBlock'
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
}

export default function Callout({ variant, title, text, code }: Props) {
  const meta = META[variant]
  return (
    <aside className={`callout callout-${variant}`}>
      <div className="callout-head">
        <span className="callout-icon" aria-hidden>
          {meta.icon}
        </span>
        <span className="callout-title">{title ?? meta.defaultTitle}</span>
      </div>
      <p className="callout-body">
        <RichText text={text} />
      </p>
      {code && <CodeBlock code={code} />}
    </aside>
  )
}
