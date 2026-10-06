'use client'

import { useEffect, useState } from 'react'
import './profile-editor.css'
import './profile-view.css'

type Peer = { id: string; username: string; experience: string; domain: string; target_role: string }
type Data = {
  public: boolean
  user: { username: string; experience: string; domain: string; target_role: string }
  profile?: { display_name: string | null; headline: string | null; bio: string | null; location: string | null; avatar_url: string | null; linkedin_url: string | null; github_url: string | null; website_url: string | null }
  skills?: { name: string; level: string | null }[]
  projects?: { id: string; title: string; description: string | null; url: string | null }[]
  education?: { id: string; institution: string; degree: string | null; field: string | null; start_year: number | null; end_year: number | null }[]
}

export default function PeerPreview({ peer, status, onConnect, onClose }: { peer: Peer; status?: string; onConnect: () => void; onClose: () => void }) {
  const [data, setData] = useState<Data | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/peers/profile?username=${encodeURIComponent(peer.username)}`)
        if (!res.ok) throw new Error('x')
        const j = (await res.json()) as Data
        if (alive) setData(j)
      } catch {
        if (alive) setFailed(true)
      }
    })()
    return () => { alive = false }
  }, [peer.username])

  const p = data?.profile
  const name = p?.display_name || peer.username
  const links = [['LinkedIn', p?.linkedin_url], ['GitHub', p?.github_url], ['Website', p?.website_url]].filter(([, u]) => u) as [string, string][]
  const pending = status === 'pending'
  const accepted = status === 'accepted'
  const label = accepted ? '✓ Connected' : pending ? '⏳ Pending' : status === 'rejected' ? '＋ Connect again' : '＋ Connect'

  return (
    <div className="pe-overlay" role="dialog" aria-modal="true" aria-label={`${name} profile`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pe-dialog" style={{ maxWidth: 640 }}>
        <div className="pe-head">
          <h2>Profile preview</h2>
          <button className="pe-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="pe-body">
          {!data && !failed && <p>Loading…</p>}
          {failed && <p>Could not load this profile. Try again in a moment.</p>}
          {data && (
            <div className="pv-card" style={{ border: 0, padding: 0 }}>
              <div className="pv-head">
                {p?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="pv-av" src={p.avatar_url} alt={name} referrerPolicy="no-referrer" />
                ) : <span className="pv-av" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>}
                <div>
                  <h3 className="pv-name">{name}</h3>
                  <p className="pv-sub">@{data.user.username}{p?.location ? ` · ${p.location}` : ''}</p>
                  {p?.headline && <p className="pv-headline">{p.headline}</p>}
                </div>
              </div>
              <div className="pv-tags">
                {data.user.target_role && <span className="pv-tag role">🎯 {data.user.target_role}</span>}
                {data.user.domain && <span className="pv-tag">{data.user.domain}</span>}
                {data.user.experience && <span className="pv-tag">{data.user.experience}</span>}
              </div>
              {links.length > 0 && (
                <div className="pv-links">{links.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer nofollow">{l}</a>)}</div>
              )}
              {!data.public && <p className="pv-note" style={{ marginTop: 16 }}>This member has not made their full profile public yet.</p>}
              {p?.bio && <div className="pv-sec"><h3>About</h3><p>{p.bio}</p></div>}
              {data.skills && data.skills.length > 0 && (
                <div className="pv-sec">
                  <h3>Skills (self-declared)</h3>
                  <div className="pv-chips">{data.skills.map((s) => <span className="pv-chip" key={s.name}>{s.name}{s.level ? <small>{s.level}</small> : null}</span>)}</div>
                </div>
              )}
              {data.projects && data.projects.length > 0 && (
                <div className="pv-sec"><h3>Projects</h3>{data.projects.map((x) => <div className="pv-item" key={x.id}><b>{x.title}</b>{x.description && <span>{x.description}</span>}</div>)}</div>
              )}
              {data.education && data.education.length > 0 && (
                <div className="pv-sec"><h3>Education</h3>{data.education.map((e) => (
                  <div className="pv-item" key={e.id}><b>{e.institution}</b><span>{[e.degree, e.field].filter(Boolean).join(', ')}{e.start_year ? ` · ${e.start_year}${e.end_year ? `-${e.end_year}` : ''}` : ''}</span></div>
                ))}</div>
              )}
            </div>
          )}
        </div>
        <div className="pv-foot">
          <button className="pv-btn" onClick={onConnect} disabled={pending || accepted}>{label}</button>
          {data?.public && <a className="pv-btn ghost" href={`/u/${encodeURIComponent(peer.username)}`} target="_blank" rel="noreferrer">Open full page</a>}
        </div>
      </div>
    </div>
  )
}
