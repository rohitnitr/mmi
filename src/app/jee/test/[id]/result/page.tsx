import Link from 'next/link'
import { redirect } from 'next/navigation'
import '@/components/jee/exam.css'
import {
  adminDb,
  currentUser,
  deadlinePassed,
  finalizeAttempt,
  getAttempt,
  getTest,
  loadQuestionsWithSolutions,
  paidTiers,
} from '@/lib/jee/exam-server'
import { UUID_RE, buildSections, type KeyRow } from '@/lib/jee/exam-shared'
import { PRICE_PAISE } from '@/lib/jee/shared'
import { computeComprehensiveAnalysis } from '@/lib/jee/analysis-engine'
import { generateAIAnalysis } from '@/lib/jee/ai-analysis'
import AnalysisClient from '@/components/jee/AnalysisClient'

export const dynamic = 'force-dynamic'

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) redirect('/jee/dashboard')
  const user = await currentUser()
  if (!user) redirect('/jee')

  const db = adminDb()
  const test = await getTest(db, id)
  if (!test) redirect('/jee/dashboard')

  let attempt = await getAttempt(db, user.id, id)
  if (!attempt) redirect(`/jee/test/${id}`)

  if (attempt.status === 'in_progress') {
    if (!deadlinePassed(attempt)) redirect(`/jee/test/${id}/exam`)
    await finalizeAttempt(db, attempt)
    attempt = (await getAttempt(db, user.id, id)) ?? attempt
  }
  await finalizeAttempt(db, attempt) // no-op unless a result row is missing

  const [{ data: res }, { data: rank }, tiers, questionsWithSolutions, { data: rows }] = await Promise.all([
    db.from('jee_results').select('marks,correct,wrong,skipped,submitted_at').eq('attempt_id', attempt.id).maybeSingle(),
    db.from('jee_rankings').select('rank,attempts,percentile').eq('test_id', id).eq('user_id', user.id).maybeSingle(),
    paidTiers(db, user.id, id),
    loadQuestionsWithSolutions(db, id),
    db.from('jee_answers').select('question_id,response,state,time_spent_ms,bookmarked').eq('attempt_id', attempt.id),
  ])

  if (!res) redirect('/jee/dashboard')

  const result = res as { marks: number; correct: number; wrong: number; skipped: number; submitted_at: string }
  const rk = rank as { rank: number; attempts: number; percentile: number } | null
  const sections = buildSections(questionsWithSolutions)
  const total = sections.reduce((n, s) => n + s.maxMarks, 0)
  const n = questionsWithSolutions.length || 1
  const attempted = result.correct + result.wrong
  const acc = attempted ? Math.round((100 * result.correct) / attempted) : 0
  const pct = (x: number) => `${(100 * x) / n}%`
  const when = new Date(result.submitted_at).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Keys array for computation
  const keys: KeyRow[] = questionsWithSolutions.map((q) => ({
    question_id: q.id,
    correct: q.answer ?? '',
    tolerance: q.tolerance ?? null,
  }))

  // Answers array with timing
  const answers = (rows ?? []).map((r) => ({
    question_id: r.question_id as string,
    response: r.response as string | null,
    state: r.state as string,
    time_spent_ms: (r.time_spent_ms as number) ?? 0,
    bookmarked: Boolean(r.bookmarked),
  }))

  // Compute rich diagnostics
  const analysis = computeComprehensiveAnalysis({
    questions: questionsWithSolutions,
    keys,
    answers,
    rank: rk,
  })

  // Generate AI Coach Report
  const aiReport = await generateAIAnalysis(analysis, test.title)

  return (
    <div className="xp">
      <div className="xp-wrap">
        {/* Hero Header */}
        <section className="xp-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: 'rgba(37,99,235,0.2)', color: '#60A5FA', fontSize: 12, fontWeight: 800, padding: '3px 12px', borderRadius: 99 }}>
              ★ NITian Evaluation
            </span>
          </div>
          <h1>Test Submitted Successfully</h1>
          <p>{test.title} · {when}</p>
        </section>

        {/* Quick KPI Score Overview */}
        <section className="xp-card">
          <div className="xp-score">
            <div className="xp-stat">
              <small>Score</small>
              <b>{result.marks}</b> <span>/ {total}</span>
            </div>
            <div className="xp-stat">
              <small>Rank</small>
              <b>{rk ? `#${rk.rank}` : '—'}</b> {rk && <span>of {rk.attempts}</span>}
            </div>
            <div className="xp-stat">
              <small>Percentile</small>
              <b>{rk ? Number(rk.percentile).toFixed(1) : '—'}</b>
            </div>
            <div className="xp-stat">
              <small>Accuracy</small>
              <b>{acc}%</b>
            </div>
            <div className="xp-stat">
              <small>Attempted</small>
              <b>{attempted}</b> <span>of {questionsWithSolutions.length}</span>
            </div>
          </div>

          <div className="xp-bar" aria-hidden>
            <i style={{ width: pct(result.correct), background: 'var(--green)' }} />
            <i style={{ width: pct(result.wrong), background: 'var(--red)' }} />
          </div>

          <div className="xp-key">
            <span><b>{result.correct}</b> correct (+{result.correct * 4})</span>
            <span style={{ color: '#DC2626' }}><b>{result.wrong}</b> wrong (-{result.wrong})</span>
            <span><b>{result.skipped}</b> unattempted</span>
          </div>
        </section>

        {/* Sprint 4 In-Depth Analysis & AI Coach Interface */}
        <AnalysisClient
          testId={id}
          testTitle={test.title}
          hasAnalysis={tiers.analysis}
          upgradePaise={PRICE_PAISE.upgrade}
          analysis={analysis}
          aiReport={aiReport}
        />

        {/* Bottom Actions */}
        <div className="xp-actions" style={{ marginTop: 32 }}>
          <Link href="/jee/dashboard">Back to My Dashboard</Link>
          <Link href="/jee/store">Browse More Mocks in Store</Link>
        </div>
      </div>
    </div>
  )
}
