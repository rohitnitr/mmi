import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import '@/components/jee/jee.css'

export const dynamic = 'force-dynamic'

export default async function Welcome() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/jee')
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const name = (typeof meta.full_name === 'string' && meta.full_name) || (typeof meta.name === 'string' && meta.name) || ''
  const photo = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : ''
  return (
    <div className="jx"><div className="jx-sec join" style={{ minHeight: '100vh' }}><div className="jx-wrap jx-narrow">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" referrerPolicy="no-referrer" width={88} height={88} style={{ borderRadius: '50%', marginBottom: 16, border: '3px solid rgba(255,255,255,.3)' }} />
      )}
      <h2>{name ? `Welcome, ${name.split(' ')[0]}!` : 'You are in. Welcome!'}</h2>
      <p className="jx-sub">Signed in as {user.email}. Your JEE profile is ready.</p>
      <p className="jx-sub">Open mocks will appear here as soon as they go live.</p>
      <a className="jx-cta" href="/jee">Back to JEE home</a>
    </div></div></div>
  )
}
