import RichText from './RichText'
import './CompareTable.css'

interface Props {
  caption?: string
  headers: string[]
  rows: string[][]
}

export default function CompareTable({ caption, headers, rows }: Props) {
  return (
    <div className="compare-wrap">
      <table className="compare">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col">
                <RichText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
