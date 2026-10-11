import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/jee/auth'
import { getStudent, loadStates } from '@/lib/jee/entitlements'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your mock | MatchMyInterview JEE', robots: { index: false, follow: false } }

// Gate for a purchased test. Sprint 2 replaces the body of this page with the instructions screen and the exam.
export default async function TestGate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) redirect('/jee')
  const student = await getStudent(user.id)
  if (!student?.onboarded_at) redirect('/jee/onboarding')

  const st = (await loadStates(user.id)).find((s) => s.test.id === id)
  if (!st || (!st.hasMock && !st.hasAnalysis)) redirect('/jee/store')

  return (
    <div className="jx auto">
      <header className="jx-nav"><a href="/jee/dashboard" className="jx-brand">MatchMyInterview <span>· JEE</span></a></header>
      <main className="jx-sec js-page"><div className="jx-wrap jx-narrow">
        <div className="js-card" style={{ maxWidth: 560 }}>
          <h1 className="jd-h1" style={{ fontSize: 26 }}>{st.test.title}</h1>
          <p className="jx-small">Unlocked · {st.test.duration_minutes} minutes{st.hasAnalysis ? ' · full analysis included' : ''}</p>
          <p style={{ color: 'var(--mut)' }}>
            {st.attempt === 'done'
              ? 'You have completed this mock.'
              : 'Your purchase is confirmed. The exam screen opens here in the next update, and your unlock stays safe until then.'}
          </p>
          <a className="jx-cta" href="/jee/store">Back to store</a>
        </div>
      </div></main>
    </div>
  )
}
