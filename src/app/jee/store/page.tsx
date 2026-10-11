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
        <a href="/jee/dashboard" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
        <div className="jx-navr"><a href="/jee/dashboard" className="jx-navlink">My dashboard</a><SignOut /></div>
      </header>
      <main className="jx-sec js-page"><div className="jx-wrap">
        <h1 className="jd-h1">Pick your mock</h1>
        <p className="jx-sub" style={{ margin: '6px 0 0' }}>The real JEE-style experience, from {'\u20b9'}11. Pay once per mock, no subscription.</p>
        <StoreClient states={states} />
      </div></main>
    </div>
  )
}
