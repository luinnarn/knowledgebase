import type { JavaClass, ClassSummary } from '../../types/content'

/** Lazy loader per area — populated in the class-reference task. */
export const classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>> = {}

/** Eagerly available summaries for list views and search. */
export const classSummaries: ClassSummary[] = []
