// Pure exam logic shared by server and client. No server-only imports in here.

export type QType = 'mcq' | 'numeric'
export type PState = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked'

export const PSTATES: PState[] = ['not_visited', 'not_answered', 'answered', 'marked', 'answered_marked']

export type ExamQuestion = {
  id: string
  position: number
  subject: string
  chapter: string | null
  qtype: QType
  body: string
  options: string[] | null
  marks: number
  negative: number
  image_url: string | null
}

export type Rec = { response: string | null; state: PState; timeMs: number; bookmarked: boolean }

export type Section = {
  key: string
  label: string
  subject: string
  qtype: QType
  ids: string[]
  marks: number // per correct answer
  negative: number // per wrong answer, positive number
  maxMarks: number
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

const typeLabel = (t: QType) => (t === 'mcq' ? 'Single Correct' : 'Numerical')

/** Group questions into sections by subject + type, in paper order. */
export function buildSections(questions: ExamQuestion[]): Section[] {
  const sorted = [...questions].sort((a, b) => a.position - b.position)
  const map = new Map<string, Section>()
  for (const q of sorted) {
    const key = `${q.subject}|${q.qtype}`
    let s = map.get(key)
    if (!s) {
      s = { key, label: `${q.subject} ${typeLabel(q.qtype)}`, subject: q.subject, qtype: q.qtype, ids: [], marks: q.marks, negative: q.negative, maxMarks: 0 }
      map.set(key, s)
    }
    s.ids.push(q.id)
    s.maxMarks += q.marks
  }
  return [...map.values()]
}

const WORDS: Record<number, string> = { 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN', 15: 'FIFTEEN', 20: 'TWENTY', 25: 'TWENTY FIVE' }
export const countWords = (n: number) => (WORDS[n] ? `${WORDS[n]} (${n})` : String(n))

/** Our own wording for each section's rules. Built from the data, so it can never disagree with the scoring. */
export function sectionRules(s: Section): { bullets: string[]; scheme: string[] } {
  const n = s.ids.length
  const neg = s.negative > 0 ? `-${s.negative} if you answer and it is wrong` : 'No negative marks in this section'
  if (s.qtype === 'mcq') {
    return {
      bullets: [
        `This section has ${countWords(n)} questions.`,
        'Each question has four options (A, B, C, D) and exactly one is correct.',
        'Tap or click an option to choose it, then press Save & Next.',
      ],
      scheme: [`+${s.marks} for the correct option`, '0 if you leave it unanswered', neg],
    }
  }
  return {
    bullets: [
      `This section has ${countWords(n)} questions.`,
      'Each answer is a number. Type it with your keyboard or use the on-screen keypad.',
      'Enter the value exactly as you worked it out; small rounding differences are accepted.',
    ],
    scheme: [`+${s.marks} for the correct value`, '0 if you leave it blank', neg],
  }
}

export function stateOf(rec: Rec | undefined): PState {
  return rec ? rec.state : 'not_visited'
}

export function deriveState(hasResponse: boolean, marked: boolean): PState {
  if (hasResponse) return marked ? 'answered_marked' : 'answered'
  return marked ? 'marked' : 'not_answered'
}

export const isMarked = (s: PState) => s === 'marked' || s === 'answered_marked'
export const isAnswered = (s: PState) => s === 'answered' || s === 'answered_marked'

export function countStates(ids: string[], recs: Record<string, Rec | undefined>): Record<PState, number> {
  const c: Record<PState, number> = { not_visited: 0, not_answered: 0, answered: 0, marked: 0, answered_marked: 0 }
  for (const id of ids) c[stateOf(recs[id])]++
  return c
}

// ---- Response validation (used by the save API) ----
export function cleanResponse(qtype: QType, raw: unknown): string | null | undefined {
  // undefined = invalid, null = blank
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'string') return undefined
  const v = raw.trim()
  if (v === '') return null
  if (qtype === 'mcq') return /^[A-D]$/.test(v) ? v : undefined
  return /^-?\d{1,10}(\.\d{1,10})?$/.test(v) || /^-?\.\d{1,10}$/.test(v) ? v : undefined
}

// ---- Scoring ----
export type KeyRow = { question_id: string; correct: string; tolerance: number | null }
export type AnswerRow = { question_id: string; response: string | null; state: string }
export type ScoreQ = { id: string; subject: string; qtype: QType; marks: number; negative: number }
export type Score = {
  marks: number
  correct: number
  wrong: number
  skipped: number
  subjectMarks: Record<string, number>
}

export function judge(q: ScoreQ, key: KeyRow | undefined, response: string | null): 'correct' | 'wrong' | 'skipped' {
  if (response === null || response.trim() === '') return 'skipped'
  if (!key) return 'skipped' // no key loaded: never punish the student for our gap
  if (q.qtype === 'mcq') return response.trim().toUpperCase() === key.correct.trim().toUpperCase() ? 'correct' : 'wrong'
  const a = Number(response)
  const b = Number(key.correct)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 'wrong'
  return Math.abs(a - b) <= (key.tolerance ?? 0.01) ? 'correct' : 'wrong'
}

export function scoreAttempt(qs: ScoreQ[], keys: KeyRow[], answers: AnswerRow[]): Score {
  const keyBy = new Map(keys.map((k) => [k.question_id, k]))
  const ansBy = new Map(answers.map((a) => [a.question_id, a]))
  const out: Score = { marks: 0, correct: 0, wrong: 0, skipped: 0, subjectMarks: {} }
  for (const q of qs) {
    const a = ansBy.get(q.id)
    // A question that is only "marked for review" without an answer is not evaluated.
    const evaluated = a && (a.state === 'answered' || a.state === 'answered_marked') ? a.response : null
    const r = judge(q, keyBy.get(q.id), evaluated)
    const delta = r === 'correct' ? q.marks : r === 'wrong' ? -q.negative : 0
    out[r]++
    out.marks += delta
    out.subjectMarks[q.subject] = (out.subjectMarks[q.subject] ?? 0) + delta
  }
  return out
}

export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(s % 60)}`
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
