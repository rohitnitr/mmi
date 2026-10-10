// Client-safe constants. Do not import server code here.
export const DIMENSIONS = [
  { key: 'communication', label: 'Communication', hint: 'Clear, easy to follow, listens well' },
  { key: 'structure', label: 'Answer structure', hint: 'Organised answers that make a clear point' },
  { key: 'knowledge', label: 'Depth of knowledge', hint: 'Accurate and detailed, beyond the basics' },
  { key: 'problem_solving', label: 'Problem solving', hint: 'Breaks problems down and reasons well' },
  { key: 'overall', label: 'Overall', hint: 'Your overall impression of the interview' },
] as const

export type DimensionKey = (typeof DIMENSIONS)[number]['key']
export type Scores = Record<DimensionKey, number>

export const MAX_SKILLS = 15
