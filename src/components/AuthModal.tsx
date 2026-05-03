'use client'

import { useState } from 'react'
import { getClient } from '@/lib/supabase/client'

interface AuthModalProps {
  onClose: () => void
}

const EXPERIENCE_OPTIONS = ['0-2 yrs', '2-5 yrs', '5-8 yrs', '8+ yrs']

  // getClient imported above

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'choice' | 'email'>('choice')
  const [email, setEmail] = useState('')
  const [experience, setExperience] = useState('0-2 yrs')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createProfile = async (userId: string) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, experience }),
    })
  }

  const handleAnonymousLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const client = getClient(); if (!client) return
      const { data, error: authError } = await client.auth.signInAnonymously()
      if (authError) throw authError
      if (data.user) await createProfile(data.user.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const client = getClient(); if (!client) return
      const { error: authError } = await client.auth.signInWithOtp({ email })
      if (authError) throw authError
      setOtpSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp) return
    setLoading(true)
    setError('')
    try {
      const client = getClient(); if (!client) return
      const { data, error: authError } = await client.auth.verifyOtp({
        email, token: otp, type: 'email',
      })
      if (authError) throw authError
      if (data.user) await createProfile(data.user.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-logo">☕</div>
          <h2 className="modal-title">Join MatchMyInterview</h2>
          <p className="modal-subtitle">Practice mock interviews with real people</p>
        </div>

        <div className="form-group">
          <label className="form-label">Your Experience</label>
          <div className="exp-options">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`exp-btn${experience === opt ? ' active' : ''}`}
                onClick={() => setExperience(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {mode === 'choice' && (
          <>
            <button className="btn btn-primary w-full" onClick={handleAnonymousLogin} disabled={loading}>
              {loading ? <span className="spinner" /> : '⚡ Join Anonymously'}
            </button>
            <div className="divider">or</div>
            <button className="btn btn-secondary w-full" onClick={() => setMode('email')}>
              📧 Continue with Email
            </button>
          </>
        )}

        {mode === 'email' && !otpSent && (
          <>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleSendOTP} disabled={loading || !email}>
              {loading ? <span className="spinner" /> : 'Send OTP'}
            </button>
            <button className="btn-text" onClick={() => setMode('choice')}>← Back</button>
          </>
        )}

        {mode === 'email' && otpSent && (
          <>
            <p className="otp-sent-msg">OTP sent to <strong>{email}</strong></p>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-input otp-input"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleVerifyOTP} disabled={loading || otp.length < 6}>
              {loading ? <span className="spinner" /> : 'Verify OTP'}
            </button>
          </>
        )}

        {error && <p className="form-error">{error}</p>}
        <p className="modal-note">🎁 You get 1 free coffee on signup!</p>
      </div>
    </div>
  )
}
