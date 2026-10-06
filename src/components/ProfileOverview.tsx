'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import './profile-view.css'
import { computeCompletion, type EducationRow, type ProfileRow, type ProjectRow } from '@/lib/profile'

type Props = {
  supabase: SupabaseClient
  userId: string
  username: string
  career: { experience: string; domain: string; target_role: string; created_at: string }
  authMeta?: Record<string, unknown> | null
  email?: string | null
  refreshKey: number
}
type SkillShow = { name: string; level: string | null }

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export default function ProfileOverview({ supabase, userId, username, career, authMeta, email, refreshKey }: Props) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [skills, setSkills] = useState<SkillShow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [education, setEducation] = useState<EducationRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [p, us, pr, ed] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_skills').select('skill_id,self_level').eq('user_id', userId),
        supabase.from('user_projects').select('id,title,description,url').eq('user_id', userId).order('created_at'),
        supabase.from('user_education').select('id,institution,degree,field,start_year,end_year').eq('user_id', userId).order('created_at'),
      ])
      const links = (us.data ?? []) as { skill_id: string; self_level: string | null }[]
      const ids = links.map((r) => r.skill_id)
      const names = ids.length ? (((await supabase.from('skills').select('id,name').in('id', ids)).data ?? []) as { id: string; name: string }[]) : []
      if (!alive) return
      setProfile((p.data as ProfileRow | null) ?? null)
      setSkills(links.map((r) => ({ name: names.find((n) => n.id === r.skill_id)?.name ?? 'Skill', level: r.self_level })))
      setProjects((pr.data ?? []) as ProjectRow[])
      setEducation((ed.data ?? []) as EducationRow[])
      setLoaded(true)
    })()
    return () => { alive = false }
  }, [supabase, userId, refreshKey])

  const gName = str(authMeta?.full_name) || str(authMeta?.name)
  const gPhoto = str(authMeta?.avatar_url) || str(authMeta?.picture)
  const name = profile?.display_name || gName || username
  const photo = profile?.avatar_url || (gPhoto.startsWith('https://') ? gPhoto : '')
  const links = [['LinkedIn', profile?.linkedin_url], ['GitHub', profile?.github_url], ['Website', profile?.website_url]].filter(([, u]) => u) as [string, string][]
  const c = computeCompletion({
    avatar: photo, displayName: name === username ? '' : name, headline: profile?.headline ?? '', bio: profile?.bio ?? '', location: profile?.location ?? '',
    linkedin: profile?.linkedin_url ?? '', github: profile?.github_url ?? '', skills: skills.length, projects: projects.length, education: education.length,
  })
  const isPublic = !!profile?.is_public

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="pv-card">
      <div className="pv-head">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pv-av" src={photo} alt={name} referrerPolicy="no-referrer" />
        ) : <span className="pv-av" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>}
        <div style={{ minWidth: 0 }}>
          <h2 className="pv-name">{name}</h2>
          <p className="pv-sub">@{username}{profile?.location ? ` · ${profile.location}` : ''}</p>
          {email && <p className="pv-sub">{email}</p>}
          {profile?.headline && <p className="pv-headline">{profile.headline}</p>}
        </div>
      </div>
      <div className="pv-tags">
        {career.target_role && <span className="pv-tag role">🎯 {career.target_role}</span>}
        {career.domain && <span className="pv-tag">{career.domain}</span>}
        {career.experience && <span className="pv-tag">{career.experience}</span>}
        <span className="pv-tag">Member since {new Date(career.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
      </div>
      {links.length > 0 && <div className="pv-links">{links.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer nofollow">{l}</a>)}</div>}

      <div className={`pv-status${isPublic ? ' on' : ''}`}>
        <span>{isPublic ? <>Your profile is public at <b>/u/{username}</b></> : 'Your profile is private. Turn on sharing in Edit profile to appear in the talent directory.'}</span>
        {isPublic && (
          <span style={{ display: 'flex', gap: 8 }}>
            <button className="pv-btn ghost" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
            <a className="pv-btn ghost" href={`/u/${encodeURIComponent(username)}`} target="_blank" rel="noreferrer">View</a>
          </span>
        )}
      </div>

      {loaded && (
        <>
          <div className="pv-sec">
            <h3>Profile strength</h3>
            <div className="pv-bar"><i style={{ width: `${c.pct}%` }} /></div>
            <p className="pv-note"><b>{c.pct}% complete.</b> {c.missing[0] ? `Next: ${c.missing[0]}.` : 'Your profile is complete.'}</p>
          </div>
          {profile?.bio && <div className="pv-sec"><h3>About</h3><p>{profile.bio}</p></div>}
          <div className="pv-sec">
            <h3>Skills (self-declared)</h3>
            {skills.length ? <div className="pv-chips">{skills.map((s) => <span className="pv-chip" key={s.name}>{s.name}{s.level ? <small>{s.level}</small> : null}</span>)}</div> : <p className="pv-note">No skills added yet.</p>}
          </div>
          <div className="pv-sec">
            <h3>Projects</h3>
            {projects.length ? projects.map((x) => <div className="pv-item" key={x.id}><b>{x.title}</b>{x.description && <span>{x.description}</span>}</div>) : <p className="pv-note">No projects added yet.</p>}
          </div>
          <div className="pv-sec">
            <h3>Education</h3>
            {education.length ? education.map((e) => (
              <div className="pv-item" key={e.id}><b>{e.institution}</b><span>{[e.degree, e.field].filter(Boolean).join(', ')}{e.start_year ? ` · ${e.start_year}${e.end_year ? `-${e.end_year}` : ''}` : ''}</span></div>
            )) : <p className="pv-note">No education added yet.</p>}
          </div>
        </>
      )}
    </div>
  )
}
