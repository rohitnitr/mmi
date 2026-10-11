import Link from 'next/link'
import { redirect } from 'next/navigation'
import '@/components/jee/exam.css'
import { adminDb, currentUser, deadlinePassed, finalizeAttempt, getAttempt, getTest, loadQuestions, paidTiers } from '@/lib/jee/exam-server'
import { UUID_RE, buildSections, countStates, type PState, type Rec } from '@/lib/jee/exam-shared'
import { PRICE_PAISE, rupees } from '@/lib/jee/shared'

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

  const [{ data: res }, { data: rank }, tiers, questions, { data: rows }] = await Promise.all([
    db.from('jee_results').select('marks,correct,wrong,skipped,submitted_at').eq('attempt_id', attempt.id).maybeSingle(),
    db.from('jee_rankings').select('rank,attempts,percentile').eq('test_id', id).eq('user_id', user.id).maybeSingle(),
    paidTiers(db, user.id, id),
    loadQuestions(db, id),
    db.from('jee_answers').select('question_id,response,state,time_spent_ms,bookmarked').eq('attempt_id', attempt.id),
  ])
  if (!res) redirect('/jee/dashboard')

  const result = res as { marks: number; correct: number; wrong: number; skipped: number; submitted_at: string }
  const rk = rank as { rank: number; attempts: number; percentile: number } | null
  const sections = buildSections(questions)
  const recs: Record<string, Rec> = {}
  for (const r of (rows ?? []) as { question_id: string; response: string | null; state: PState; time_spent_ms: number; bookmarked: boolean }[]) {
    recs[r.question_id] = { response: r.response, state: r.state, timeMs: r.time_spent_ms, bookmarked: r.bookmarked }
  }
  const total = sections.reduce((n, s) => n + s.maxMarks, 0)
  const n = questions.length || 1
  const attempted = result.correct + result.wrong
  const acc = attempted ? Math.round((100 * result.correct) / attempted) : 0
  const pct = (x: number) => `${(100 * x) / n}%`
  const when = new Date(result.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="xp">
      <div className="xp-wrap">
        <section className="xp-hero">
          <h1>Test submitted</h1>
          <p>{test.title} · {when}</p>
        </section>

        <section className="xp-card">
          <div className="xp-score">
            <div className="xp-stat"><small>Score</small><b>{result.marks}</b> <span>/ {total}</span></div>
            <div className="xp-stat"><small>Rank</small><b>{rk ? `#${rk.rank}` : '—'}</b> {rk && <span>of {rk.attempts}</span>}</div>
            <div className="xp-stat"><small>Percentile</small><b>{rk ? Number(rk.percentile).toFixed(1) : '—'}</b></div>
            <div className="xp-stat"><small>Accuracy</small><b>{acc}%</b></div>
            <div className="xp-stat"><small>Attempted</small><b>{attempted}</b> <span>of {questions.length}</span></div>
          </div>
          <div className="xp-bar" aria-hidden>
            <i style={{ width: pct(result.correct), background: 'var(--green)' }} />
            <i style={{ width: pct(result.wrong), background: 'var(--red)' }} />
          </div>
          <div className="xp-key">
            <span><b>{result.correct}</b> correct</span>
            <span><b>{result.wrong}</b> wrong</span>
            <span><b>{result.skipped}</b> unanswered</span>
          </div>
        </section>

        <section className="xp-card">
          <h2>Response summary</h2>
          <div className="xp-tablewrap">
            <table className="xp-table">
              <thead>
                <tr><th>Section</th><th>Qs</th><th>Answered</th><th>Not answered</th><th>Marked</th><th>Ans + marked</th><th>Not visited</th></tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const c = countStates(s.ids, recs)
                  return (
                    <tr key={s.key}>
                      <td>{s.label}</td><td>{s.ids.length}</td><td>{c.answered}</td><td>{c.not_answered}</td><td>{c.marked}</td><td>{c.answered_marked}</td><td>{c.not_visited}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {tiers.analysis ? (
          <section className="xp-card">
            <h2>Full review &amp; analysis</h2>
            <p>Your plan includes the detailed analysis and solutions. They are being added in the next update, and will appear here as soon as they are live.</p>
          </section>
        ) : (
          <section className="xp-card xp-up">
            <h2>Want to see where you lost marks?</h2>
            <p>Add the full review and analysis: question-by-question solutions, subject and chapter accuracy, and time spent. One-time {rupees(PRICE_PAISE.upgrade)}.</p>
            <div className="xp-actions"><Link className="pri" href="/jee/store">Add analysis for {rupees(PRICE_PAISE.upgrade)}</Link></div>
          </section>
        )}

        <div className="xp-actions">
          <Link href="/jee/dashboard">Back to dashboard</Link>
          <Link href="/jee/store">Store</Link>
        </div>
      </div>
    </div>
  )
}
