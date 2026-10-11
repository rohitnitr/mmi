import { redirect } from 'next/navigation'
import ExamClient from '@/components/jee/ExamClient'
import { adminDb, currentUser, deadlinePassed, finalizeAttempt, getAttempt, getTest, loadQuestions, paidTiers } from '@/lib/jee/exam-server'
import { UUID_RE, type PState, type Rec } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) redirect('/jee/dashboard')
  const user = await currentUser()
  if (!user) redirect('/jee')

  const db = adminDb()
  const test = await getTest(db, id)
  if (!test) redirect('/jee/store')
  if (!(await paidTiers(db, user.id, id)).mock) redirect('/jee/store')

  const attempt = await getAttempt(db, user.id, id)
  if (!attempt) redirect(`/jee/test/${id}`) // must start from the instructions page
  if (attempt.status !== 'in_progress' || deadlinePassed(attempt)) {
    await finalizeAttempt(db, attempt)
    redirect(`/jee/test/${id}/result`)
  }

  const questions = await loadQuestions(db, id)
  const { data: rows } = await db.from('jee_answers').select('question_id,response,state,time_spent_ms,bookmarked').eq('attempt_id', attempt.id)
  const initial: Record<string, Rec> = {}
  for (const r of (rows ?? []) as { question_id: string; response: string | null; state: PState; time_spent_ms: number; bookmarked: boolean }[]) {
    initial[r.question_id] = { response: r.response, state: r.state, timeMs: r.time_spent_ms, bookmarked: r.bookmarked }
  }

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  const { data: student } = await db.from('jee_students').select('full_name').eq('user_id', user.id).maybeSingle()
  const name = (student as { full_name: string | null } | null)?.full_name || meta?.full_name || meta?.name || ''

  return (
    <ExamClient
      testId={id}
      attemptId={attempt.id}
      title={test.title}
      studentName={name}
      questions={questions}
      initial={initial}
      deadlineMs={new Date(attempt.deadline_at).getTime()}
      serverNowMs={Date.now()}
    />
  )
}
