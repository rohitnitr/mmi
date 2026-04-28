'use client'
import { useState } from 'react'

const TARGET_SUGGESTIONS = [
  'Frontend Developer','Backend Developer','Full Stack Developer','Data Analyst',
  'Data Scientist','Business Analyst','Product Manager','Software Engineer',
  'DevOps Engineer','ML Engineer','Bank PO','UPSC Aspirant','CAT Preparation',
  'Marketing Manager','HR Executive','Consultant',
]
const EXPERIENCE_OPTIONS = [
  { label: 'Fresher', sub: '0 years' },
  { label: '0–2 yrs', sub: 'Early career' },
  { label: '2–5 yrs', sub: 'Mid level' },
  { label: '5+ yrs', sub: 'Senior' },
]
const DOMAIN_OPTIONS = [
  { label: 'Software / IT', emoji: '💻' },{ label: 'Data / Analytics', emoji: '📊' },
  { label: 'Finance', emoji: '💰' },{ label: 'Marketing', emoji: '📣' },
  { label: 'HR', emoji: '🤝' },{ label: 'Core Engineering', emoji: '⚙️' },
  { label: 'Government Exams', emoji: '🏛️' },{ label: 'Other', emoji: '🌐' },
]

interface Props { userId: string; onComplete: () => void }

export default function ProfileSetupModal({ userId, onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [targetRole, setTargetRole] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleInput = (val: string) => {
    setTargetRole(val)
    setSuggestions(val.length > 1 ? TARGET_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5) : [])
  }

  const handleFinish = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, experience: experience || 'Fresher', domain: domain || 'Software / IT', target_role: targetRole }),
      })
      if (!res.ok) throw new Error('Failed to create profile')
      onComplete()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box ob-box setup-box">
        {/* Progress bar */}
        <div className="setup-progress">
          <div className="setup-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <p className="setup-step-label">Step {step} of 3</p>

        {step === 1 && (
          <>
            <div className="ob-icon">🎯</div>
            <h2 className="ob-title">What are you preparing for?</h2>
            <p className="ob-subtitle">Your target role helps us find the best match</p>
            <div className="ob-role-wrap">
              <input className="form-input" type="text" placeholder="e.g. Software Engineer, Bank PO..."
                value={targetRole} onChange={e => handleRoleInput(e.target.value)} autoFocus />
              {suggestions.length > 0 && (
                <div className="ob-suggestions">
                  {suggestions.map(s => (
                    <button key={s} className="ob-suggestion" onClick={() => { setTargetRole(s); setSuggestions([]) }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-primary w-full ob-next" onClick={() => setStep(2)}>Next →</button>
            <button className="btn-text" onClick={() => setStep(2)}>Skip for now</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="ob-icon">📈</div>
            <h2 className="ob-title">Your experience level?</h2>
            <p className="ob-subtitle">We&apos;ll match you with similar peers</p>
            <div className="ob-option-grid">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button key={opt.label} className={`ob-option-card${experience === opt.label ? ' selected' : ''}`}
                  onClick={() => setExperience(opt.label)}>
                  <span className="ob-opt-label">{opt.label}</span>
                  <span className="ob-opt-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary w-full ob-next" onClick={() => setStep(3)} disabled={!experience}>Next →</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="ob-icon">🏢</div>
            <h2 className="ob-title">Your domain?</h2>
            <p className="ob-subtitle">Pick the field you&apos;re interviewing in</p>
            <div className="ob-domain-grid">
              {DOMAIN_OPTIONS.map(opt => (
                <button key={opt.label} className={`ob-domain-card${domain === opt.label ? ' selected' : ''}`}
                  onClick={() => setDomain(opt.label)}>
                  <span className="ob-domain-emoji">{opt.emoji}</span>
                  <span className="ob-domain-label">{opt.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary w-full ob-next" onClick={handleFinish} disabled={loading || !domain}>
              {loading ? <span className="spinner" /> : "Let's Go 🚀"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
