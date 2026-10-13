/* eslint-disable @typescript-eslint/no-explicit-any */
// Same rules as scripts/jee-paper/paper.mjs, usable in the browser (live feedback) and on the server (before saving).
export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics']
export const KINDS = ['full', 'part', 'sectional', 'chapter']
export const RIGHTS = ['original', 'licensed']
export const LETTERS = ['A', 'B', 'C', 'D']

export type PaperTest = { title: string; kind: string; class_level: number | null; duration_minutes: number; rights: string }
export type PaperQuestion = {
  subject: string; chapter: string | null; topic: string | null; type: string; body: string; options: string[] | null
  answer: string; solution: string | null; marks: number; negative: number; tolerance: number; image: string | null; review?: unknown
}
export type Paper = { test: PaperTest; questions: PaperQuestion[] }
export type PaperCheck = { errors: string[]; warnings: string[]; paper: Paper }

export function normalisePaper(raw: any): Paper {
  const t = raw?.test ?? {}
  const test: PaperTest = { title: t.title, kind: t.kind ?? 'full', class_level: t.class_level ?? null, duration_minutes: t.duration_minutes ?? 180, rights: t.rights }
  const questions: PaperQuestion[] = (Array.isArray(raw?.questions) ? raw.questions : []).map((q: any) => {
    const type = q?.type ?? q?.qtype
    const answer = q?.answer === undefined || q?.answer === null ? '' : String(q.answer).trim()
    const isNum = type === 'numeric'
    const tolDefault = isNum && answer !== '' && !Number.isInteger(Number(answer)) ? 0.01 : 0
    return {
      subject: q?.subject, chapter: q?.chapter ?? null, topic: q?.topic ?? null, type, body: q?.body,
      options: isNum ? null : q?.options ?? null, answer: type === 'mcq' ? answer.toUpperCase() : answer, solution: q?.solution ?? null,
      marks: q?.marks ?? 4, negative: q?.negative ?? 1, tolerance: q?.tolerance ?? tolDefault, image: q?.image ?? q?.image_url ?? null, review: q?.review,
    }
  })
  return { test, questions }
}

const dollars = (s: string) => s.replace(/\\\$/g, '').split('$').length - 1
const balanced = (s: string) => { let d = 0; for (const c of s.replace(/\\[{}]/g, '')) { if (c === '{') d++; if (c === '}') d--; if (d < 0) return false } return d === 0 }

export function validatePaper(raw: unknown, opts: { anyPattern?: boolean } = {}): PaperCheck {
  const errors: string[] = [], warnings: string[] = []
  const paper = normalisePaper(raw)
  const { test, questions } = paper
  if (typeof test.title !== 'string' || !test.title.trim() || test.title.length > 120) errors.push('test.title is required (max 120 characters).')
  if (!KINDS.includes(test.kind)) errors.push(`test.kind must be one of ${KINDS.join(', ')}.`)
  if (![null, 11, 12].includes(test.class_level)) errors.push('test.class_level must be 11, 12 or left out.')
  if (!Number.isInteger(test.duration_minutes) || test.duration_minutes < 5 || test.duration_minutes > 240) errors.push('test.duration_minutes must be a whole number from 5 to 240.')
  if (!RIGHTS.includes(test.rights)) errors.push('test.rights must be "original" or "licensed". Declare that you wrote these questions or hold a licence for them.')
  if (questions.length === 0) errors.push('The paper has no questions.')

  const seenRuns = new Set<string>(); let prev = ''; const bodies = new Map<string, number>()
  questions.forEach((q, i) => {
    const at = `Q${i + 1}`
    const err = (m: string) => errors.push(`${at}: ${m}`), warn = (m: string) => warnings.push(`${at}: ${m}`)
    if (!SUBJECTS.includes(q.subject)) err(`subject must be one of ${SUBJECTS.join(', ')}.`)
    if (!['mcq', 'numeric'].includes(q.type)) err('type must be "mcq" or "numeric".')
    if (typeof q.body !== 'string' || !q.body.trim()) err('body is empty.')
    if (q.review !== undefined) err(`still flagged for review (${JSON.stringify(q.review)}). Fix it and delete the "review" field.`)
    const fields: [string, unknown][] = [['body', q.body], ['solution', q.solution], ...(Array.isArray(q.options) ? q.options.map((o, k): [string, unknown] => [`option ${LETTERS[k] ?? k + 1}`, o]) : [])]
    for (const [name, text] of fields) {
      if (typeof text !== 'string') continue
      if (/[\u25A0\u25A1\uFFFD]/.test(text)) err(`${name} contains a lost symbol (\u25A0 or \uFFFD) from a PDF copy. Retype that formula.`)
      if (dollars(text) % 2 !== 0) err(`${name} has an unclosed $ formula.`)
      else if (!balanced(text)) warn(`${name} has unbalanced { } braces. Check the LaTeX.`)
    }
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => typeof o !== 'string' || !o.trim())) err('an MCQ needs exactly 4 non-empty options.')
      else if (new Set(q.options.map((o) => o.trim())).size < 4) warn('two options are identical.')
      if (!LETTERS.includes(q.answer)) err('answer must be A, B, C or D.')
    }
    if (q.type === 'numeric') {
      if (!/^-?\d+(\.\d+)?$/.test(q.answer)) err('numeric answer must be a plain number such as 36 or -2.5.')
      if (typeof q.tolerance !== 'number' || q.tolerance < 0) err('tolerance must be a number, 0 or more.')
    }
    if (!Number.isInteger(q.marks) || q.marks < 1 || q.marks > 10) err('marks must be a whole number from 1 to 10.')
    if (!Number.isInteger(q.negative) || q.negative < 0 || q.negative > 5) err('negative must be a whole number from 0 to 5.')
    if (q.image && !String(q.image).startsWith('https://')) err('image must be an https:// link.')
    if (!q.chapter) warn('no chapter. Analysis by chapter will skip this question.')
    if (!q.solution) warn('no solution text.')
    const key = `${q.subject}|${q.type}`
    if (key !== prev) { if (seenRuns.has(key)) err(`"${q.subject} ${q.type}" questions are split across the paper. Keep each section together.`); seenRuns.add(key); prev = key }
    if (typeof q.body === 'string') { const k = q.body.trim().toLowerCase(); if (bodies.has(k)) warn(`same text as Q${bodies.get(k)}.`); else bodies.set(k, i + 1) }
  })

  if (test.kind === 'full' && !opts.anyPattern && questions.length > 0) {
    if (questions.length !== 75) errors.push(`A full mock must have 75 questions (this has ${questions.length}).`)
    for (const s of SUBJECTS) {
      const m = questions.filter((q) => q.subject === s && q.type === 'mcq').length, n = questions.filter((q) => q.subject === s && q.type === 'numeric').length
      if (m !== 20 || n !== 5) errors.push(`${s}: a full mock needs 20 single-correct and 5 numerical questions (this has ${m} and ${n}).`)
    }
  }
  return { errors, warnings, paper }
}
