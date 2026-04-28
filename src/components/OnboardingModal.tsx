'use client'

import { useState } from 'react'

interface OnboardingModalProps {
  onClose: () => void
}

const TARGET_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Business Analyst', 'Product Manager',
  'Software Engineer', 'DevOps Engineer', 'ML Engineer',
  'Bank PO', 'UPSC', 'CAT Preparation', 'Marketing Manager', 'HR Executive',
]

const EXPERIENCE_OPTIONS = [
  { label: 'Fresher', sub: '0 years' },
  { label: '0–2 yrs', sub: 'Early career' },
  { label: '2–5 yrs', sub: 'Mid level' },
  { label: '5+ yrs', sub: 'Senior' },
]

const DOMAIN_OPTIONS = [
  { label: 'Software / IT', emoji: '💻' },
  { label: 'Data / Analytics', emoji: '📊' },
  { label: 'Finance', emoji: '💰' },
  { label: 'Marketing', emoji: '📣' },
  { label: 'HR', emoji: '🤝' },
  { label: 'Core Engineering', emoji: '⚙️' },
  { label: 'Government Exams', emoji: '🏛️' },
  { label: 'Other', emoji: '🌐' },
]

function getClient() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

type Stage = 'email' | 'otp' | 'profile'

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [stage, setStage] = useState<Stage>('email')
  const [profileStep, setProfileStep] = useState(1) // 1=role, 2=experience, 3=domain
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  // ── Auth ────────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email) return
    setLoading(true); setError('')
    try {
      const client = getClient()
      const { error: e } = await client.auth.signInWithOtp({ email })
      if (e) throw e
      setStage('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return
    setLoading(true); setError('')
    try {
      const client = getClient()
      const { data, error: e } = await client.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (e) throw e
      setUserId(data.user?.id || '')
      setStage('profile')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid OTP')
    } finally { setLoading(false) }
  }

  // ── Profile ─────────────────────────────────────────────────────────────
  const handleRoleInput = (val: string) => {
    setTargetRole(val)
    if (val.length > 1) {
      setRoleSuggestions(
        TARGET_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
      )
    } else {
      setRoleSuggestions([])
    }
  }

  const handleFinish = async () => {
    if (!domain) return
    setLoading(true); setError('')
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, experience: experience || 'Fresher', domain, target_role: targetRole }),
      })
      onClose()
    } catch {
      setError('Failed to save profile. Please try again.')
    } finally { setLoading(false) }
  }

  const canNextStep1 = targetRole.length > 0
  const canNextStep2 = experience.length > 0
  const canFinish = domain.length > 0

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={stage === 'profile' ? undefined : onClose}>
      <div className="modal-box onboarding-box" onClick={e => e.stopPropagation()}>
        {stage !== 'profile' && (
          <button className="modal-close" onClick={onClose}>✕</button>
        )}

        {/* ── Email Stage ── */}
        {stage === 'email' && (
          <div className="ob-stage">
            <div className="ob-icon">☕</div>
            <h2 className="ob-title">Join MatchMyInterview</h2>
            <p className="ob-subtitle">Practice mock interviews with real peers</p>
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Your email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                autoFocus
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleSendOTP} disabled={loading || !email}>
              {loading ? <span className="spinner" /> : 'Continue with Email →'}
            </button>
            {error && <p className="form-error">{error}</p>}
            <p className="ob-note">🎁 Get 1 free coffee on signup · No card needed</p>
          </div>
        )}

        {/* ── OTP Stage ── */}
        {stage === 'otp' && (
          <div className="ob-stage">
            <div className="ob-icon">📬</div>
            <h2 className="ob-title">Check your email</h2>
            <p className="ob-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
            <div className="form-group" style={{ marginTop: 24 }}>
              <input
                className="form-input otp-input"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                autoFocus
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleVerifyOTP} disabled={loading || otp.length < 6}>
              {loading ? <span className="spinner" /> : 'Verify →'}
            </button>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-text" onClick={() => { setStage('email'); setOtp(''); setError('') }}>
              ← Use a different email
            </button>
          </div>
        )}

        {/* ── Profile Setup (3 steps) ── */}
        {stage === 'profile' && (
          <div className="ob-stage">
            {/* Progress */}
            <div className="ob-progress">
              {[1, 2, 3].map(s => (
                <div key={s} className={`ob-step-dot${profileStep >= s ? ' active' : ''}`} />
              ))}
              <span className="ob-progress-label">{profileStep} / 3</span>
            </div>

            {/* Step 1: Target Role */}
            {profileStep === 1 && (
              <>
                <h2 className="ob-title">What are you preparing for?</h2>
                <p className="ob-subtitle">E.g. Software Engineer, Data Analyst, Bank PO</p>
                <div className="ob-role-input-wrap" style={{ marginTop: 20 }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Type your target role..."
                    value={targetRole}
                    onChange={e => handleRoleInput(e.target.value)}
                    autoFocus
                  />
                  {roleSuggestions.length > 0 && (
                    <div className="ob-suggestions">
                      {roleSuggestions.map(s => (
                        <button key={s} className="ob-suggestion" onClick={() => { setTargetRole(s); setRoleSuggestions([]) }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary w-full ob-next" onClick={() => setProfileStep(2)} disabled={!canNextStep1}>
                  Next →
                </button>
                <button className="btn-text" onClick={() => setProfileStep(2)}>Skip for now</button>
              </>
            )}

            {/* Step 2: Experience */}
            {profileStep === 2 && (
              <>
                <h2 className="ob-title">Your experience level?</h2>
                <p className="ob-subtitle">We&apos;ll match you with similar peers</p>
                <div className="ob-option-grid" style={{ marginTop: 20 }}>
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      className={`ob-option-card${experience === opt.label ? ' selected' : ''}`}
                      onClick={() => setExperience(opt.label)}
                    >
                      <span className="ob-opt-label">{opt.label}</span>
                      <span className="ob-opt-sub">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary w-full ob-next" onClick={() => setProfileStep(3)} disabled={!canNextStep2}>
                  Next →
                </button>
              </>
            )}

            {/* Step 3: Domain */}
            {profileStep === 3 && (
              <>
                <h2 className="ob-title">Choose your domain</h2>
                <p className="ob-subtitle">Pick the field you&apos;re interviewing in</p>
                <div className="ob-domain-grid" style={{ marginTop: 20 }}>
                  {DOMAIN_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      className={`ob-domain-card${domain === opt.label ? ' selected' : ''}`}
                      onClick={() => setDomain(opt.label)}
                    >
                      <span className="ob-domain-emoji">{opt.emoji}</span>
                      <span className="ob-domain-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary w-full ob-next" onClick={handleFinish} disabled={loading || !canFinish}>
                  {loading ? <span className="spinner" /> : "Let's Go 🚀"}
                </button>
                {error && <p className="form-error">{error}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
