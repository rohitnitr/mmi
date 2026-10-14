import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/jee/auth'
import { getStudent, loadStates } from '@/lib/jee/entitlements'
import StoreClient from '@/components/jee/StoreClient'
import SignOut from '@/components/jee/SignOut'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mock store | MatchMyInterview JEE', robots: { index: false, follow: false } }

export default async function Store() {
  const user = await currentUser()
  if (!user) redirect('/jee')
  const student = await getStudent(user.id)
  if (!student?.onboarded_at) redirect('/jee/onboarding')
  const states = await loadStates(user.id)

  return (
    <div className="jx auto">
      <header className="jx-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/jee/dashboard" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
          <span style={{ fontSize: 11, background: 'rgba(37,99,235,0.2)', color: '#60A5FA', padding: '3px 10px', borderRadius: 99, fontWeight: 800 }}>
            ★ NITian Series
          </span>
        </div>
        <div className="jx-navr">
          <a href="/jee/dashboard" className="jx-navlink">My Dashboard</a>
          <SignOut />
        </div>
      </header>
      <main className="jx-sec js-page"><div className="jx-wrap">
        <StoreClient states={states} />
      </div></main>
    </div>
  )
}
