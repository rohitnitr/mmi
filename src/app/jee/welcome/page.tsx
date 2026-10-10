import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'

export default async function Welcome() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/jee')
  return (
    <div className="jx"><div className="jx-sec join" style={{ minHeight: '100vh' }}><div className="jx-wrap jx-narrow">
      <h2>You are in. Welcome!</h2>
      <p className="jx-sub">Signed in as {user.email}. Your JEE profile is ready.</p>
      <p className="jx-sub">Open mock events appear here, and we email you the moment seats open.</p>
      <a className="jx-cta" href="/jee">Back to JEE home</a>
    </div></div></div>
  )
}
