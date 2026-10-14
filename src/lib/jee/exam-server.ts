// Server-only helpers for the exam engine. Never import this from a client component.
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { scoreAttempt, type ExamQuestion, type KeyRow, type AnswerRow, type ScoreQ } from './exam-shared'

const need = (name: string): string => {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var ${name}`)
  return v
}

/** Service-role client. Bypasses RLS, so only use it after checking the user yourself. */
export function adminDb(): SupabaseClient {
  return createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function currentUser() {
  const store = await cookies()
  const sb = createServerClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  })
  const { data } = await sb.auth.getUser()
  return data.user
}

export type TestInfo = { id: string; title: string; duration_minutes: number; status: string; is_free?: boolean }
export type AttemptRow = { id: string; user_id: string; test_id: string; started_at: string; deadline_at: string; submitted_at: string | null; status: 'in_progress' | 'submitted' | 'expired'; attempt_number?: number }

export async function getTest(db: SupabaseClient, testId: string): Promise<TestInfo | null> {
  const { data } = await db.from('jee_tests').select('id,title,duration_minutes,status,is_free').eq('id', testId).maybeSingle()
  return (data as TestInfo | null) ?? null
}

/** Either tier (mock or analysis) lets a student sit the test. Free tests can be taken directly. */
export async function paidTiers(db: SupabaseClient, userId: string, testId: string): Promise<{ mock: boolean; analysis: boolean }> {
  const { data: test } = await db.from('jee_tests').select('is_free').eq('id', testId).maybeSingle()
  const isFree = Boolean(test?.is_free)
  const { data } = await db.from('jee_purchases').select('tier').eq('user_id', userId).eq('test_id', testId).eq('status', 'paid')
  const tiers = ((data ?? []) as { tier: string }[]).map((r) => r.tier)
  return { mock: isFree || tiers.length > 0, analysis: isFree || tiers.includes('analysis') }
}

export async function getAttempt(db: SupabaseClient, userId: string, testId: string): Promise<AttemptRow | null> {
  const { data } = await db
    .from('jee_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('test_id', testId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as AttemptRow | null) ?? null
}

export async function getAttemptById(db: SupabaseClient, attemptId: string): Promise<AttemptRow | null> {
  const { data } = await db.from('jee_attempts').select('*').eq('id', attemptId).maybeSingle()
  return (data as AttemptRow | null) ?? null
}

/** Questions for display during the exam. Deliberately never selects anything from jee_answer_keys. */
export async function loadQuestions(db: SupabaseClient, testId: string): Promise<ExamQuestion[]> {
  const { data, error } = await db
    .from('jee_questions')
    .select('id,position,subject,chapter,qtype,body,options,marks,negative,image_url')
    .eq('test_id', testId)
    .order('position')
  if (error) throw new Error(error.message)
  return ((data ?? []) as ExamQuestion[]).map((q) => ({ ...q, options: Array.isArray(q.options) ? (q.options as string[]) : null }))
}

export type ExamQuestionWithSolution = ExamQuestion & {
  topic?: string | null
  answer?: string
  solution?: string | null
  tolerance?: number | null
}

/** Questions with official answer keys and step-by-step solutions for the post-exam Analysis review. */
export async function loadQuestionsWithSolutions(db: SupabaseClient, testId: string): Promise<ExamQuestionWithSolution[]> {
  const { data: questions, error } = await db
    .from('jee_questions')
    .select('id,position,subject,chapter,topic,qtype,body,options,marks,negative,image_url')
    .eq('test_id', testId)
    .order('position')
  if (error) throw new Error(error.message)

  const qList = (questions ?? []) as (ExamQuestion & { topic?: string | null })[]
  const ids = qList.map((q) => q.id)
  const keyMap = new Map<string, { correct: string; solution: string | null; tolerance: number | null }>()

  if (ids.length > 0) {
    const { data: keys } = await db
      .from('jee_answer_keys')
      .select('question_id,correct,solution,tolerance')
      .in('question_id', ids)
    for (const k of (keys ?? []) as { question_id: string; correct: string; solution: string | null; tolerance: number | null }[]) {
      keyMap.set(k.question_id, k)
    }
  }

  return qList.map((q) => {
    const k = keyMap.get(q.id)
    return {
      ...q,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      answer: k?.correct ?? '',
      solution: k?.solution ?? null,
      tolerance: k?.tolerance ?? null,
    }
  })
}

export const deadlinePassed = (a: AttemptRow, graceMs = 0) => Date.now() > new Date(a.deadline_at).getTime() + graceMs

/**
 * Closes an attempt and writes the result. Safe to call many times and from several places at once:
 * only the first caller flips the status, and the result row is written once.
 */
export async function finalizeAttempt(db: SupabaseClient, attempt: AttemptRow): Promise<void> {
  if (attempt.status === 'in_progress') {
    const timedOut = deadlinePassed(attempt)
    const stamp = timedOut ? attempt.deadline_at : new Date().toISOString()
    await db
      .from('jee_attempts')
      .update({ status: timedOut ? 'expired' : 'submitted', submitted_at: stamp })
      .eq('id', attempt.id)
      .eq('status', 'in_progress')
  }
  const { data: existing } = await db.from('jee_results').select('attempt_id').eq('attempt_id', attempt.id).maybeSingle()
  if (existing) return

  const { data: qs, error: qe } = await db.from('jee_questions').select('id,subject,qtype,marks,negative').eq('test_id', attempt.test_id)
  if (qe) throw new Error(qe.message)
  const questions = (qs ?? []) as ScoreQ[]
  const ids = questions.map((q) => q.id)
  const { data: ks } = ids.length ? await db.from('jee_answer_keys').select('question_id,correct,tolerance').in('question_id', ids) : { data: [] }
  const { data: as } = await db.from('jee_answers').select('question_id,response,state').eq('attempt_id', attempt.id)

  const s = scoreAttempt(questions, (ks ?? []) as KeyRow[], (as ?? []) as AnswerRow[])
  const fresh = await getAttemptById(db, attempt.id)
  const { error } = await db.from('jee_results').upsert(
    {
      attempt_id: attempt.id,
      user_id: attempt.user_id,
      test_id: attempt.test_id,
      marks: s.marks,
      correct: s.correct,
      wrong: s.wrong,
      skipped: s.skipped,
      subject_marks: s.subjectMarks,
      submitted_at: fresh?.submitted_at ?? new Date().toISOString(),
    },
    { onConflict: 'attempt_id', ignoreDuplicates: true },
  )
  if (error) throw new Error(error.message)
}
