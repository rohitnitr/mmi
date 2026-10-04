import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import '@/components/marketing/marketing.css'
import '@/components/marketing/marketing-v2.css'
import { Logo } from '@/components/marketing/Brand'
import type { EducationRow, ProfileRow, ProjectRow, SkillRow } from '@/lib/profile'

export const revalidate = 60

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
}

async function load(username: string) {
  const db = admin()
  const { data: user } = await db.from('users').select('id,username,experience,domain,target_role,created_at').eq('username', username).maybeSingle()
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('*').eq('user_id', user.id).eq('is_public', true).maybeSingle()
  if (!profile) return null // private or not set up: never reveal anything
  const [us, pr, ed] = await Promise.all([
    db.from('user_skills').select('skill_id,self_level').eq('user_id', user.id),
    db.from('user_projects').select('id,title,description,url').eq('user_id', user.id).order('created_at'),
    db.from('user_education').select('id,institution,degree,field,start_year,end_year').eq('user_id', user.id).order('created_at'),
  ])
  const ids = (us.data ?? []).map((r) => r.skill_id)
  const { data: names } = ids.length ? await db.from('skills').select('id,name,category').in('id', ids) : { data: [] as SkillRow[] }
  const skills = (us.data ?? []).map((r) => ({ name: (names ?? []).find((n) => n.id === r.skill_id)?.name ?? 'Skill', level: r.self_level as string | null }))
  return { user, profile: profile as ProfileRow, skills, projects: (pr.data ?? []) as ProjectRow[], education: (ed.data ?? []) as EducationRow[] }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const d = await load(decodeURIComponent(username))
  if (!d) return { title: 'Profile not found | MatchMyInterview', robots: { index: false } }
  const name = d.profile.display_name || d.user.username
  return { title: `${name} | MatchMyInterview`, description: d.profile.headline ?? `${name} on MatchMyInterview` }
}

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const d = await load(decodeURIComponent(username))
  if (!d) notFound()
  const { user, profile, skills, projects, education } = d
  const name = profile.display_name || user.username
  const links = [['LinkedIn', profile.linkedin_url], ['GitHub', profile.github_url], ['Website', profile.website_url]].filter(([, u]) => u) as [string, string][]

  return (
    <div className="mh" style={{ minHeight: '100vh', background: 'var(--soft)' }}>
      <header className="mh-nav scrolled">
        <nav aria-label="Main" className="mh-wrap mh-nav-in">
          <Logo />
          <Link href="/" className="mh-btn mh-btn-primary mh-btn-sm">Build your portfolio</Link>
        </nav>
      </header>
      <main className="mh-wrap" style={{ maxWidth: 760, padding: '40px 20px 80px', display: 'grid', gap: 18 }}>
        <section className="mh-pf-card">
          <div className="mh-fprof" style={{ gap: 18 }}>
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={name} width={88} height={88} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span className="mh-photo" style={{ width: 88, height: 88, fontSize: 24 }} aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
            )}
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>{name}</h1>
              <p className="mh-small">@{user.username}{profile.location ? ` · ${profile.location}` : ''}</p>
              {profile.headline && <p style={{ marginTop: 6, fontWeight: 600 }}>{profile.headline}</p>}
            </div>
          </div>
          <div className="mh-skill-row" style={{ marginTop: 14 }}>
            {user.target_role && <span className="mh-role">Target: {user.target_role}</span>}
            {user.domain && <span className="mh-role">{user.domain}</span>}
            {user.experience && <span className="mh-role">{user.experience}</span>}
          </div>
          {links.length > 0 && (
            <p style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {links.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer nofollow" style={{ color: '#2563EB', fontWeight: 600 }}>{l}</a>)}
            </p>
          )}
        </section>

        {profile.bio && (
          <section className="mh-pf-card"><h2 className="mh-bold">About</h2><p style={{ marginTop: 8, color: '#334155', whiteSpace: 'pre-wrap' }}>{profile.bio}</p></section>
        )}

        {skills.length > 0 && (
          <section className="mh-pf-card">
            <h2 className="mh-bold">Skills <span className="mh-badge mh-b-planned" style={{ marginLeft: 6 }}>Self-declared</span></h2>
            <div className="mh-skill-row" style={{ marginTop: 12 }}>
              {skills.map((s) => <span className="mh-chip self" style={{ color: '#334155', borderColor: '#94A3B8' }} key={s.name}>{s.name}{s.level ? <small style={{ opacity: 0.7 }}>{s.level}</small> : null}</span>)}
            </div>
            <p className="mh-small" style={{ marginTop: 12 }}>Peer-validated evidence is coming soon. Until then, these skills are declared by the member.</p>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mh-pf-card">
            <h2 className="mh-bold">Projects</h2>
            {projects.map((p) => (
              <div className="mh-ev" key={p.id}>
                <div><b>{p.title}</b>{p.description && <p className="mh-small" style={{ marginTop: 2 }}>{p.description}</p>}
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: '#2563EB', fontSize: 13 }}>{p.url}</a>}</div>
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="mh-pf-card">
            <h2 className="mh-bold">Education</h2>
            {education.map((e) => (
              <div className="mh-ev" key={e.id}>
                <div><b>{e.institution}</b><p className="mh-small">{[e.degree, e.field].filter(Boolean).join(', ')}{e.start_year ? ` · ${e.start_year}${e.end_year ? `-${e.end_year}` : ''}` : ''}</p></div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
