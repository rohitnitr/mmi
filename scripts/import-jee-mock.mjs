#!/usr/bin/env node
// Loads a mock test into the question bank from a JSON file.
//
//   node scripts/import-jee-mock.mjs questions/mock1.json --dry-run     check the file only, no database
//   node scripts/import-jee-mock.mjs questions/mock1.json               write to the database
//   node scripts/import-jee-mock.mjs questions/mock1.json --publish     ...and open it in the store (status = live)
//
// Re-running replaces that test's questions, but REFUSES if any student has already started it.
// Only import questions you wrote or hold a licence for. The "source" field is for your own records.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics']
const LETTERS = ['A', 'B', 'C', 'D']

export function validate(data) {
  const errors = []
  const warnings = []
  if (!data || typeof data !== 'object') return { errors: ['File is not a JSON object.'], warnings, questions: [] }

  const t = data.test
  if (!t || typeof t.title !== 'string' || !t.title.trim()) errors.push('test.title is required.')
  const dur = t?.duration_minutes ?? 180
  if (!Number.isInteger(dur) || dur < 5 || dur > 240) errors.push('test.duration_minutes must be a whole number from 5 to 240.')

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('questions must be a non-empty array.')
    return { errors, warnings, questions: [] }
  }

  const seen = new Set()
  data.questions.forEach((q, i) => {
    const at = `Question ${i + 1}`
    const bad = (m) => errors.push(`${at}: ${m}`)
    if (!SUBJECTS.includes(q.subject)) bad(`subject must be one of ${SUBJECTS.join(', ')}.`)
    if (q.type !== 'mcq' && q.type !== 'numeric') bad('type must be "mcq" or "numeric".')
    if (typeof q.body !== 'string' || q.body.trim().length < 5) bad('body is missing or too short.')
    else {
      if ((q.body.match(/\$/g) || []).length % 2 !== 0) bad('body has an odd number of $ signs (unclosed LaTeX).')
      if (seen.has(q.body.trim())) warnings.push(`${at}: same text as an earlier question.`)
      seen.add(q.body.trim())
    }
    if (!q.chapter || typeof q.chapter !== 'string') warnings.push(`${at}: no chapter. Chapter analysis in Sprint 3 needs it.`)
    const marks = q.marks ?? 4
    const neg = q.negative ?? 1
    if (!Number.isInteger(marks) || marks <= 0) bad('marks must be a positive whole number.')
    if (!Number.isInteger(neg) || neg < 0) bad('negative must be a whole number, 0 or more.')
    if (q.image_url != null && !(typeof q.image_url === 'string' && q.image_url.startsWith('https://'))) bad('image_url must start with https://')

    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => typeof o !== 'string' || !o.trim())) bad('mcq needs exactly 4 non-empty options.')
      else if (new Set(q.options.map((o) => o.trim())).size !== 4) bad('mcq options must all be different.')
      if (!LETTERS.includes(q.answer)) bad('answer must be A, B, C or D.')
    } else if (q.type === 'numeric') {
      if (q.options != null) bad('numeric questions must not have options.')
      const n = Number(q.answer)
      if (q.answer === undefined || q.answer === null || String(q.answer).trim() === '' || !Number.isFinite(n)) bad('answer must be a number.')
      if (q.tolerance != null && !(Number.isFinite(q.tolerance) && q.tolerance >= 0)) bad('tolerance must be 0 or more.')
    }
    if (!q.solution) warnings.push(`${at}: no solution text.`)
  })

  // Paper order matters: all questions of a section should sit together.
  const keys = data.questions.map((q) => `${q.subject}|${q.type}`)
  const closed = new Set()
  keys.forEach((k, i) => {
    if (i > 0 && k !== keys[i - 1]) closed.add(keys[i - 1])
    if (closed.has(k)) warnings.push(`Question ${i + 1}: section "${k.replace('|', ' ')}" appears in two separate places. Group each section together.`)
  })
  return { errors, warnings, questions: data.questions }
}

function summary(qs) {
  const m = new Map()
  for (const q of qs) {
    const k = `${q.subject} ${q.type === 'mcq' ? 'Single Correct' : 'Numerical'}`
    m.set(k, (m.get(k) || 0) + 1)
  }
  return [...m].map(([k, n]) => `  ${k}: ${n}`).join('\n')
}

function loadEnv() {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const file = args.find((a) => !a.startsWith('--'))
  const dry = args.includes('--dry-run')
  const publish = args.includes('--publish')
  if (!file) {
    console.error('Usage: node scripts/import-jee-mock.mjs <file.json> [--dry-run] [--publish]')
    process.exit(1)
  }
  let data
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`Could not read ${file}: ${e.message}`)
    process.exit(1)
  }

  const { errors, warnings, questions } = validate(data)
  warnings.forEach((w) => console.warn('warning:', w))
  if (errors.length) {
    console.error(`\n${errors.length} problem(s). Nothing was imported:`)
    errors.forEach((e) => console.error(' -', e))
    process.exit(1)
  }
  console.log(`\n${questions.length} questions OK:\n${summary(questions)}`)
  if (questions.length !== 75) console.warn(`note: a full JEE Main mock has 75 questions; this file has ${questions.length}.`)
  if (dry) return console.log('\nDry run: nothing written.')

  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.')
    process.exit(1)
  }
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(url, key, { auth: { persistSession: false } })

  const t = data.test
  let { data: test } = await db.from('jee_tests').select('id,status').eq('title', t.title.trim()).maybeSingle()
  if (test) {
    const { count } = await db.from('jee_attempts').select('id', { count: 'exact', head: true }).eq('test_id', test.id)
    if (count) {
      console.error(`Refusing: ${count} student attempt(s) exist for "${t.title}". Changing its questions would corrupt their results. Import under a new title instead.`)
      process.exit(1)
    }
    await db.from('jee_tests').update({ duration_minutes: t.duration_minutes ?? 180, kind: t.kind ?? 'full', class_level: t.class_level ?? null }).eq('id', test.id)
    const del = await db.from('jee_questions').delete().eq('test_id', test.id)
    if (del.error) throw new Error(del.error.message)
  } else {
    const ins = await db.from('jee_tests').insert({ title: t.title.trim(), duration_minutes: t.duration_minutes ?? 180, kind: t.kind ?? 'full', class_level: t.class_level ?? null }).select('id,status').single()
    if (ins.error) throw new Error(ins.error.message)
    test = ins.data
  }

  const rows = questions.map((q, i) => ({
    test_id: test.id,
    position: i + 1,
    subject: q.subject,
    chapter: q.chapter ?? null,
    topic: q.topic ?? null,
    qtype: q.type,
    body: q.body.trim(),
    options: q.type === 'mcq' ? q.options.map((o) => o.trim()) : null,
    marks: q.marks ?? 4,
    negative: q.negative ?? 1,
    image_url: q.image_url ?? null,
  }))
  const qi = await db.from('jee_questions').insert(rows).select('id,position')
  if (qi.error) throw new Error(qi.error.message)
  const idBy = new Map(qi.data.map((r) => [r.position, r.id]))

  const keys = questions.map((q, i) => ({
    question_id: idBy.get(i + 1),
    correct: q.type === 'mcq' ? q.answer : String(q.answer).trim(),
    solution: q.solution ?? null,
    tolerance: q.type === 'numeric' ? (q.tolerance ?? 0.01) : 0.01,
  }))
  const ki = await db.from('jee_answer_keys').insert(keys)
  if (ki.error) throw new Error(ki.error.message)

  if (publish) {
    const up = await db.from('jee_tests').update({ status: 'live' }).eq('id', test.id)
    if (up.error) throw new Error(up.error.message)
  }
  console.log(`\nImported "${t.title}" (${test.id}).`)
  console.log(publish ? 'Status: live. It is now visible in the store.' : `Status: ${test.status}. To open it in the store, re-run with --publish, or set status = 'live' in Supabase.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error('Import failed:', e.message)
    process.exit(1)
  })
}
