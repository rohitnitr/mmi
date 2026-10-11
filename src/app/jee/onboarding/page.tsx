import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/jee/auth'
import { getStudent } from '@/lib/jee/entitlements'
import OnboardingForm from '@/components/jee/OnboardingForm'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Complete your profile | MatchMyInterview JEE', robots: { index: false, follow: false } }

export default async function Onboarding() {
  const user = await currentUser()
  if (!user) redirect('/jee')
  const student = await getStudent(user.id)
  if (student?.onboarded_at) redirect('/jee/store')

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const googleName = [meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim()) as string | undefined
  const photo = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : ''

  return (
    <div className="jx auto">
      <header className="jx-nav"><a href="/jee" className="jx-brand">MatchMyInterview <span>· JEE</span></a></header>
      <main className="jx-sec js-page"><div className="jx-wrap">
        <h1 className="jd-h1" style={{ textAlign: 'center', marginBottom: 6 }}>Welcome{googleName ? `, ${googleName.split(' ')[0]}` : ''}</h1>
        <p className="jx-sub" style={{ textAlign: 'center', margin: '0 auto 22px' }}>Confirm two details and you can pick your first mock.</p>
        <OnboardingForm initialName={student?.full_name ?? googleName ?? ''} email={user.email ?? ''} photo={photo} />
      </div></main>
    </div>
  )
}
