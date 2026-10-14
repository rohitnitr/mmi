// Pure helpers and types. Safe to import from client components (no server code in here).

export const PRICE_PAISE = { mock: 1100, analysis: 4900, upgrade: 3800 } as const // upgrade = analysis for someone who already owns the mock
export type Tier = 'mock' | 'analysis'

export type TestRow = {
  id: string
  title: string
  kind: string
  class_level: number | null
  duration_minutes: number
  category?: string | null
  sub_category?: string | null
  topic?: string | null
  pyq_year?: number | null
  pyq_date?: string | null
  pyq_shift?: string | null
  is_free?: boolean
  display_order?: number
  price_paise?: number
}

export type TestState = {
  test: TestRow
  hasMock: boolean // may take this test, or already has
  hasAnalysis: boolean // full analysis unlocked
  attempt: 'none' | 'in_progress' | 'done'
  canStart: boolean // paid/free and not finished yet
  analysisPaise: number // what this student would pay for analysis right now
  score?: number | null
  percentile?: number | null
  rank?: number | null
}

export const rupees = (paise: number) => `\u20b9${paise / 100}`

// Indian mobile: 10 digits starting 6-9. Accepts +91 / 91 / 0 prefixes and spaces or dashes. Returns +91XXXXXXXXXX or null.
export function normalisePhone(input: string): string | null {
  let d = input.replace(/[^\d]/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null
}
