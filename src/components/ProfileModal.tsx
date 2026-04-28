'use client'
import { useState } from 'react'

const EXPERIENCE_OPTIONS = ['Fresher', '0–2 yrs', '2–5 yrs', '5+ yrs']
const DOMAIN_OPTIONS = ['Software / IT','Data / Analytics','Finance','Marketing','HR','Core Engineering','Government Exams','Other']

interface UserProfile {
  id: string; username: string; experience: string; domain: string
  target_role: string; coffee_balance: number; created_at: string; last_active?: string
}
interface Props { profile: UserProfile; onClose: () => void; onUpdate: (p: UserProfile) => void; onLogout: () => void }

export default function ProfileModal({ profile, onClose, onUpdate, onLogout }: Props) {
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [experience, setExperience] = useState(profile.experience)
  const [domain, setDomain] = useState(profile.domain)
  const [targetRole, setTargetRole] = useState(profile.target_role || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, username, experience, domain, target_role: targetRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      onUpdate(data.user)
      setEditing(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box profile-modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Avatar + Name */}
        <div className="profile-header">
          <div className="profile-avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
          {editing ? (
            <input className="form-input" style={{ textAlign: 'center', fontWeight: 700 }} value={username}
              onChange={e => setUsername(e.target.value)} placeholder="Display name" />
          ) : (
            <h2 className="profile-name">{profile.username}</h2>
          )}
          <div className="profile-coffee-badge">☕ {profile.coffee_balance} coffees</div>
        </div>

        {/* Profile Fields */}
        {editing ? (
          <div className="profile-edit-fields">
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input className="form-input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              <div className="ob-option-grid">
                {EXPERIENCE_OPTIONS.map(o => (
                  <button key={o} className={`ob-option-card compact${experience === o ? ' selected' : ''}`} onClick={() => setExperience(o)}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Domain</label>
              <select className="form-input" value={domain} onChange={e => setDomain(e.target.value)}>
                {DOMAIN_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="profile-edit-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Save Changes'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-view-fields">
            <div className="profile-field">
              <span className="pf-label">Target Role</span>
              <span className="pf-value">{profile.target_role || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="pf-label">Experience</span>
              <span className="pf-value">{profile.experience}</span>
            </div>
            <div className="profile-field">
              <span className="pf-label">Domain</span>
              <span className="pf-value">{profile.domain}</span>
            </div>
            <div className="profile-field">
              <span className="pf-label">Member since</span>
              <span className="pf-value">{new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        )}

        {!editing && (
          <div className="profile-actions">
            <button className="btn btn-secondary w-full" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            <button className="btn btn-danger w-full" onClick={onLogout}>Sign Out</button>
          </div>
        )}
      </div>
    </div>
  )
}
