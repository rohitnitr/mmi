import { redirect } from 'next/navigation'
import '@/components/jee/exam.css'
import StartPanel from '@/components/jee/StartPanel'
import { adminDb, currentUser, deadlinePassed, finalizeAttempt, getAttempt, getTest, loadQuestions, paidTiers } from '@/lib/jee/exam-server'
import { UUID_RE, buildSections, sectionRules, type PState } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

const LEGEND: { s: PState; label: string; help: string }[] = [
  { s: 'answered', label: 'Answered', help: 'You saved an answer.' },
  { s: 'not_answered', label: 'Not answered', help: 'You opened it but have no saved answer.' },
  { s: 'not_visited', label: 'Not visited', help: 'You have not opened it yet.' },
  { s: 'marked', label: 'Marked for review', help: 'Flagged to revisit. Not marked unless it also has an answer.' },
  { s: 'answered_marked', label: 'Answered and marked', help: 'Has an answer and a flag. The answer is marked.' },
]

export default async function InstructionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) redirect('/jee/dashboard')
  const user = await currentUser()
  if (!user) redirect('/jee')

  const db = adminDb()
  const test = await getTest(db, id)
  if (!test) redirect('/jee/store')
  const tiers = await paidTiers(db, user.id, id)
  if (!tiers.mock) redirect('/jee/store')

  const attempt = await getAttempt(db, user.id, id)
  if (attempt && attempt.status === 'in_progress' && deadlinePassed(attempt)) await finalizeAttempt(db, attempt)
  const fresh = attempt ? await getAttempt(db, user.id, id) : null
  if (fresh && fresh.status !== 'in_progress') redirect(`/jee/test/${id}/result`)

  const questions = await loadQuestions(db, id)
  const sections = buildSections(questions)
  const open = test.status === 'live' && questions.length > 0
  const maxMarks = sections.reduce((n, s) => n + s.maxMarks, 0)

  return (
    <div className="xp">
      <div className="xp-wrap">
        <section className="xp-hero">
          <h1>{test.title}</h1>
          <p>Read this once, then begin. It takes two minutes and saves you surprises.</p>
          <div className="xp-facts">
            <span>{test.duration_minutes} minutes</span>
            <span>{questions.length} questions</span>
            <span>{sections.length} sections</span>
            <span>{maxMarks} marks</span>
          </div>
        </section>

        {!open && (
          <section className="xp-card">
            <h2>This mock is not ready yet</h2>
            <p>It has no questions or has not opened. Your purchase is safe. Please check back soon.</p>
          </section>
        )}

        <section className="xp-card">
          <h2>How the exam works</h2>
          <ol>
            <li>The timer runs on our server. It does not pause if you close the page, and the test submits itself at zero.</li>
            <li>The palette shows every question&apos;s status. Tap a number to jump to it. You can move between sections in any order.</li>
            <li>Your answers autosave as you go, so a refresh or a dropped connection will not lose them.</li>
            <li><b>Save &amp; next</b> keeps your answer. An option you pick but do not save is not counted if you leave the question.</li>
            <li>You get one attempt. After you submit, the paper locks and your result appears.</li>
          </ol>
        </section>

        <section className="xp-card">
          <h2>The question palette</h2>
          <div className="xp-leg">
            {LEGEND.map((l) => (
              <div key={l.s}>
                <span className={`pb pb-${l.s}`} />
                <span><b>{l.label}</b><small>{l.help}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="xp-card">
          <h2>Marking scheme</h2>
          {sections.map((s) => {
            const r = sectionRules(s)
            return (
              <div className="xp-sec" key={s.key}>
                <h3><span>{s.label}</span><span>Max {s.maxMarks} marks</span></h3>
                <ul>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                <ul className="scheme">{r.scheme.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            )
          })}
        </section>

        {open && <StartPanel testId={id} resuming={!!fresh} minutes={test.duration_minutes} />}
      </div>
    </div>
  )
}
