export { type Token } from './highlightCode'
import { highlightCode } from './highlightCode'

export function highlightJava(code: string) {
  return highlightCode(code, 'java')
}
