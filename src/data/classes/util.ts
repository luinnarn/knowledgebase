import type { JavaClass } from '../../types/content'

type Spec = Omit<JavaClass, 'javadocUrl' | 'name' | 'pkg' | 'points' | 'methods' | 'pitfalls' | 'related'> &
  Partial<Pick<JavaClass, 'points' | 'methods' | 'pitfalls' | 'related'>>

/** Builds a JavaClass, deriving name/pkg/javadocUrl from the fqcn and module. */
export function jc(spec: Spec): JavaClass {
  const lastDot = spec.fqcn.lastIndexOf('.')
  return {
    points: [],
    methods: [],
    pitfalls: [],
    related: [],
    ...spec,
    name: spec.fqcn.slice(lastDot + 1),
    pkg: spec.fqcn.slice(0, lastDot),
    javadocUrl: `https://docs.oracle.com/en/java/javase/21/docs/api/${spec.module}/${spec.fqcn.replace(/\./g, '/')}.html`,
  }
}
