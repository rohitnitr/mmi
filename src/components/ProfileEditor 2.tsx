'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import './profile-editor.css'
import {
  MAX, cleanUrl, computeCompletion,
  type EducationRow, type ProfileRow, type ProjectRow, type SkillRow, type UserSkillRow,
} from '@/lib/profile'
import { DOMAIN_OPTIONS, EXPERIENCE_OPTIONS } from '@/lib/career-options'

type Career = { experience: string; domain: string; target_role: string }
type Props = {
  supabase: SupabaseClient
  userId: string
  username: string
  career: Career
  authMeta?: Record<string, unknown> | null
  onProfileUpdate?: (p: Career & { username: string }) => void
  onSaved?: () => void
  onClose: () => void
}
type Msg = { type: 'ok' | 'err'; text: string } | null
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
const blank = { displayName: '', headline: '', bio: '', location: '', linkedin: '', github: '', website: '', avatar: '', isPublic: false }
const str = (v: unknown) => (typeof v === 'string' ? v : '')

export default function ProfileEditor({ supabase, userId, username, career, authMeta, onProfileUpdate, onSaved, onClose }: Props) {
  const gName = str(authMeta?.full_name) || str(authMeta?.name)
  const gPhotoRaw = str(authMeta?.avatar_url) || str(authMeta?.picture)
  const gPhoto = gPhotoRaw.startsWith('https://') && gPhotoRaw.length <= 400 ? gPhotoRaw : ''

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(blank)
  const [cf, setCf] = useState({ username, experience: career.experience, domain: career.domain, target_role: career.target_role })
  const [catalog, setCatalog] = useState<SkillRow[]>([])
  const [mine, setMine] = useState<UserSkillRow[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [education, setEducation] = useState<EducationRow[]>([])
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState<Msg>(null)
  const [saving, setSaving] = useState(false)
  const [proj, setProj] = useState({ title: '', url: '', description: '' })
  const [edu, setEdu] = useState({ institution: '', degree: '', field: '', start: '', end: '' })

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [p, s, us, pr, ed] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('skills').select('id,name,category').order('name'),
        supabase.from('user_skills').select('skill_id,self_level').eq('user_id', userId),
        supabase.from('user_projects').select('id,title,description,url').eq('user_id', userId).order('created_at'),
        supabase.from('user_education').select('id,institution,degree,field,start_year,end_year').eq('user_id', userId).order('created_at'),
      ])
      if (!alive) return
      const row = p.data as ProfileRow | null
      if (row) {
        setForm({
          displayName: row.display_name ?? '', headline: row.headline ?? '', bio: row.bio ?? '', location: row.location ?? '',
          linkedin: row.linkedin_url ?? '', github: row.github_url ?? '', website: row.website_url ?? '',
          avatar: row.avatar_url ?? '', isPublic: row.is_public,
        })
      }
      setCatalog((s.data ?? []) as SkillRow[])
      setMine((us.data ?? []) as UserSkillRow[])
      setProjects((pr.data ?? []) as ProjectRow[])
      setEducation((ed.data ?? []) as EducationRow[])
      if (p.error || s.error) setMsg({ type: 'err', text: 'Could not load everything. Please refresh and try again.' })
      setLoading(false)
    })()
    return () => { alive = false }
  }, [supabase, userId])

  const set = (k: keyof typeof blank, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))
  const fail = (text: string) => setMsg({ type: 'err', text })
  const ok = (text: string) => setMsg({ type: 'ok', text })

  // Name and photo come from the Google account automatically; manual entry only appears if neither exists.
  const effName = form.displayName.trim() || gName
  const effPhoto = form.avatar || gPhoto
  const completion = computeCompletion({
    avatar: effPhoto, displayName: effName, headline: form.headline, bio: form.bio, location: form.location,
    linkedin: form.linkedin, github: form.github, skills: mine.length, projects: projects.length, education: education.length,
  })

  async function saveAll() {
    const li = cleanUrl(form.linkedin), gh = cleanUrl(form.github), web = cleanUrl(form.website)
    if (!li.ok || !gh.ok || !web.ok) return fail('One of your links is not a valid URL.')
    if (form.headline.length > 120) return fail('Headline must be 120 characters or fewer.')
    if (form.bio.length > 800) return fail('Bio must be 800 characters or fewer.')
    const newName = cf.username.trim()
    if (newName !== username && !/^[A-Za-z0-9_]{3,24}$/.test(newName)) return fail('Username must be 3 to 24 letters, numbers or underscores.')
    setSaving(true)

    const careerChanged = newName !== username || cf.experience !== career.experience || cf.domain !== career.domain || cf.target_role.trim() !== career.target_role
    if (careerChanged) {
      try {
        const res = await fetch('/api/users', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username: newName, experience: cf.experience, domain: cf.domain, target_role: cf.target_role.trim() }),
        })
        const data = (await res.json()) as { error?: string; user?: Partial<Career> & { username?: string } }
        if (!res.ok) { setSaving(false); return fail(data.error || 'Could not save your career details.') }
        onProfileUpdate?.({
          username: data.user?.username ?? newName,
          experience: data.user?.experience ?? cf.experience,
          domain: data.user?.domain ?? cf.domain,
          target_role: data.user?.target_role ?? cf.target_role.trim(),
        })
      } catch {
        setSaving(false)
        return fail('Network problem. Please try again.')
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      display_name: effName || null,
      headline: form.headline.trim() || null,
      bio: form.bio.trim() || null,
      location: form.location.trim() || null,
      linkedin_url: li.value, github_url: gh.value, website_url: web.value,
      avatar_url: effPhoto || null,
      is_public: form.isPublic,
    }, { onConflict: 'user_id' })
    setSaving(false)
    if (error) return fail(error.message)
    setForm((f) => ({ ...f, displayName: effName, avatar: effPhoto, linkedin: li.value ?? '', github: gh.value ?? '', website: web.value ?? '' }))
    ok('Saved.')
    onSaved?.()
  }

  async function onAvatar(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return fail('Use a JPG, PNG or WebP image.')
    if (f.size > 2 * 1024 * 1024) return fail('Image must be under 2 MB.')
    const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${ext}`
    const up = await supabase.storage.from('avatars').upload(path, f, { contentType: f.type, upsert: true })
    if (up.error) return fail(up.error.message)
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('profiles').upsert({ user_id: userId, avatar_url: url }, { onConflict: 'user_id' })
    if (error) return fail(error.message)
    set('avatar', url)
    ok('Photo updated.')
    onSaved?.()
  }

  async function addSkill(s: SkillRow) {
    if (mine.length >= MAX.skills) return fail(`You can add up to ${MAX.skills} skills.`)
    const { error } = await supabase.from('user_skills').insert({ user_id: userId, skill_id: s.id })
    if (error) return fail(error.message)
    setMine((m) => [...m, { skill_id: s.id, self_level: null }])
    setQ('')
    onSaved?.()
  }
  async function removeSkill(id: string) {
    const { error } = await supabase.from('user_skills').delete().eq('user_id', userId).eq('skill_id', id)
    if (error) return fail(error.message)
    setMine((m) => m.filter((x) => x.skill_id !== id))
    onSaved?.()
  }
  async function setLevel(id: string, level: string) {
    const v = (LEVELS as readonly string[]).includes(level) ? (level as UserSkillRow['self_level']) : null
    const { error } = await supabase.from('user_skills').update({ self_level: v }).eq('user_id', userId).eq('skill_id', id)
    if (error) return fail(error.message)
    setMine((m) => m.map((x) => (x.skill_id === id ? { ...x, self_level: v } : x)))
    onSaved?.()
  }

  async function addProject() {
    if (!proj.title.trim()) return fail('Give the project a title.')
    if (projects.length >= MAX.projects) return fail(`You can add up to ${MAX.projects} projects.`)
    const u = cleanUrl(proj.url)
    if (!u.ok) return fail('The project link is not a valid URL.')
    const { data, error } = await supabase.from('user_projects')
      .insert({ user_id: userId, title: proj.title.trim(), description: proj.description.trim() || null, url: u.value })
      .select('id,title,description,url').single()
    if (error) return fail(error.message)
    setProjects((p) => [...p, data as ProjectRow])
    setProj({ title: '', url: '', description: '' })
    onSaved?.()
  }
  async function removeProject(id: string) {
    const { error } = await supabase.from('user_projects').delete().eq('id', id)
    if (error) return fail(error.message)
    setProjects((p) => p.filter((x) => x.id !== id))
    onSaved?.()
  }

  async function addEducation() {
    if (!edu.institution.trim()) return fail('Add the institution name.')
    if (education.length >= MAX.education) return fail(`You can add up to ${MAX.education} entries.`)
    const toYear = (v: string) => (v.trim() ? parseInt(v, 10) : null)
    const { data, error } = await supabase.from('user_education')
      .insert({ user_id: userId, institution: edu.institution.trim(), degree: edu.degree.trim() || null, field: edu.field.trim() || null, start_year: toYear(edu.start), end_year: toYear(edu.end) })
      .select('id,institution,degree,field,start_year,end_year').single()
    if (error) return fail(error.message)
    setEducation((p) => [...p, data as EducationRow])
    setEdu({ institution: '', degree: '', field: '', start: '', end: '' })
    onSaved?.()
  }
  async function removeEducation(id: string) {
    const { error } = await supabase.from('user_education').delete().eq('id', id)
    if (error) return fail(error.message)
    setEducation((p) => p.filter((x) => x.id !== id))
    onSaved?.()
  }

  const chosen = new Set(mine.map((m) => m.skill_id))
  const nameOf = (id: string) => catalog.find((c) => c.id === id)?.name ?? 'Skill'
  const results = q.trim() ? catalog.filter((c) => !chosen.has(c.id) && c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 10) : []
  const expOptions = EXPERIENCE_OPTIONS.includes(cf.experience) ? EXPERIENCE_OPTIONS : [cf.experience, ...EXPERIENCE_OPTIONS]
  const domOptions = DOMAIN_OPTIONS.includes(cf.domain) ? DOMAIN_OPTIONS : [cf.domain, ...DOMAIN_OPTIONS]

  return (
    <div className="pe-overlay" role="dialog" aria-modal="true" aria-label="Edit profile" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pe-dialog">
        <div className="pe-head">
          <h2>Edit profile</h2>
          <button className="pe-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {loading ? (
          <div className="pe-body"><p>Loading…</p></div>
        ) : (
          <div className="pe-body">
            <div>
              <div className="pe-bar" aria-label={`Profile ${completion.pct}% complete`}><i style={{ width: `${completion.pct}%` }} /></div>
              <p className="pe-miss"><b>{completion.pct}% complete.</b> {completion.missing[0] ? `Next: ${completion.missing[0]}.` : 'Nice work, your profile is complete.'}</p>
            </div>
            {msg && <div className={`pe-msg ${msg.type}`} role="status">{msg.text}</div>}

            <section className="pe-sec">
              <h3>You</h3>
              <div className="pe-avatar" style={{ marginBottom: 14 }}>
                {effPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={effPhoto} alt="Your profile" referrerPolicy="no-referrer" />
                ) : <span className="ph">{(effName || cf.username).slice(0, 2).toUpperCase()}</span>}
                <div>
                  <p style={{ margin: 0, fontWeight: 800 }}>{effName || `@${cf.username}`}</p>
                  <p className="pe-miss" style={{ margin: '2px 0 0' }}>{gName || gPhoto ? 'Name and photo come from your Google account.' : 'Add your name and photo (optional).'}</p>
                </div>
              </div>
              {!effName && (
                <label className="pe-field" style={{ marginBottom: 12 }}>Your name (optional)<input className="pe-input" maxLength={60} value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="Your full name" /></label>
              )}
              {!effPhoto && (
                <label className="pe-btn ghost sm" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginBottom: 12 }}>
                  Upload a photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onAvatar} style={{ display: 'none' }} />
                </label>
              )}
              <div className="pe-grid">
                <label className="pe-field">Username<input className="pe-input" maxLength={24} value={cf.username} onChange={(e) => setCf({ ...cf, username: e.target.value })} /></label>
                <label className="pe-field">Location<input className="pe-input" maxLength={80} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" /></label>
              </div>
              <label className="pe-field" style={{ marginTop: 12 }}>Headline<input className="pe-input" maxLength={120} value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Software Engineer preparing for product roles" /></label>
              <label className="pe-field" style={{ marginTop: 12 }}>About<textarea className="pe-area" maxLength={800} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A few lines about you and what you are working towards." /></label>
            </section>

            <section className="pe-sec">
              <h3>Career</h3>
              <div className="pe-grid">
                <label className="pe-field">Target role<input className="pe-input" maxLength={80} value={cf.target_role} onChange={(e) => setCf({ ...cf, target_role: e.target.value })} placeholder="e.g. Business Analyst" /></label>
                <label className="pe-field">Domain
                  <select className="pe-select" value={cf.domain} onChange={(e) => setCf({ ...cf, domain: e.target.value })}>{domOptions.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                </label>
              </div>
              <label className="pe-field" style={{ marginTop: 12 }}>Experience
                <select className="pe-select" value={cf.experience} onChange={(e) => setCf({ ...cf, experience: e.target.value })}>{expOptions.map((d) => <option key={d} value={d}>{d}</option>)}</select>
              </label>
            </section>

            <section className="pe-sec">
              <h3>Links</h3>
              <div className="pe-grid">
                <label className="pe-field">LinkedIn<input className="pe-input" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/you" /></label>
                <label className="pe-field">GitHub<input className="pe-input" value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="github.com/you" /></label>
              </div>
              <label className="pe-field" style={{ marginTop: 12 }}>Website<input className="pe-input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="yoursite.com" /></label>
            </section>

            <section className="pe-sec">
              <h3>Visibility</h3>
              <label className="pe-toggle">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} />
                <span><b>Make my profile public.</b> Anyone can view it at <b>/u/{cf.username}</b> and it appears in the talent directory. Your email is never shown. You can turn this off at any time.</span>
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="pe-btn" onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
                {form.isPublic && <a className="pe-btn ghost" style={{ display: 'inline-flex', alignItems: 'center' }} href={`/u/${username}`} target="_blank" rel="noreferrer">View public page</a>}
              </div>
            </section>

            <section className="pe-sec">
              <h3>Skills <span style={{ fontWeight: 500, textTransform: 'none' }}>({mine.length}/{MAX.skills}, self-declared)</span></h3>
              <div className="pe-chips">
                {mine.map((m) => (
                  <span className="pe-chip" key={m.skill_id}>
                    {nameOf(m.skill_id)}
                    <select aria-label={`Level for ${nameOf(m.skill_id)}`} value={m.self_level ?? ''} onChange={(e) => setLevel(m.skill_id, e.target.value)}>
                      <option value="">Level</option>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button onClick={() => removeSkill(m.skill_id)} aria-label={`Remove ${nameOf(m.skill_id)}`}>×</button>
                  </span>
                ))}
              </div>
              <input className="pe-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills, e.g. SQL, React, Case Interviews" aria-label="Search skills" />
              {results.length > 0 && <div className="pe-results">{results.map((r) => <button key={r.id} onClick={() => addSkill(r)}>+ {r.name}</button>)}</div>}
              <p className="pe-miss">Skills you add are shown as self-declared. Only peer interviews can validate them.</p>
            </section>

            <section className="pe-sec">
              <h3>Projects ({projects.length}/{MAX.projects})</h3>
              {projects.map((p) => (
                <div className="pe-item" key={p.id}>
                  <div><b>{p.title}</b>{p.description && <div style={{ color: '#5B6B82' }}>{p.description}</div>}{p.url && <div style={{ color: '#2563EB' }}>{p.url}</div>}</div>
                  <button className="pe-btn ghost sm" onClick={() => removeProject(p.id)}>Remove</button>
                </div>
              ))}
              <div className="pe-grid" style={{ marginTop: 12 }}>
                <label className="pe-field">Title<input className="pe-input" maxLength={100} value={proj.title} onChange={(e) => setProj({ ...proj, title: e.target.value })} /></label>
                <label className="pe-field">Link (optional)<input className="pe-input" value={proj.url} onChange={(e) => setProj({ ...proj, url: e.target.value })} /></label>
              </div>
              <label className="pe-field" style={{ marginTop: 12 }}>Description (optional)<textarea className="pe-area" maxLength={500} value={proj.description} onChange={(e) => setProj({ ...proj, description: e.target.value })} /></label>
              <button className="pe-btn" style={{ marginTop: 12 }} onClick={addProject}>Add project</button>
            </section>

            <section className="pe-sec">
              <h3>Education ({education.length}/{MAX.education})</h3>
              {education.map((e) => (
                <div className="pe-item" key={e.id}>
                  <div><b>{e.institution}</b><div style={{ color: '#5B6B82' }}>{[e.degree, e.field].filter(Boolean).join(', ')}{e.start_year ? ` · ${e.start_year}${e.end_year ? `-${e.end_year}` : ''}` : ''}</div></div>
                  <button className="pe-btn ghost sm" onClick={() => removeEducation(e.id)}>Remove</button>
                </div>
              ))}
              <div className="pe-grid" style={{ marginTop: 12 }}>
                <label className="pe-field">Institution<input className="pe-input" maxLength={120} value={edu.institution} onChange={(e) => setEdu({ ...edu, institution: e.target.value })} /></label>
                <label className="pe-field">Degree<input className="pe-input" maxLength={100} value={edu.degree} onChange={(e) => setEdu({ ...edu, degree: e.target.value })} /></label>
                <label className="pe-field">Field<input className="pe-input" maxLength={100} value={edu.field} onChange={(e) => setEdu({ ...edu, field: e.target.value })} /></label>
                <div className="pe-grid">
                  <label className="pe-field">Start year<input className="pe-input" inputMode="numeric" maxLength={4} value={edu.start} onChange={(e) => setEdu({ ...edu, start: e.target.value })} /></label>
                  <label className="pe-field">End year<input className="pe-input" inputMode="numeric" maxLength={4} value={edu.end} onChange={(e) => setEdu({ ...edu, end: e.target.value })} /></label>
                </div>
              </div>
              <button className="pe-btn" style={{ marginTop: 12 }} onClick={addEducation}>Add education</button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
