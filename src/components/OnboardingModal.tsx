'use client'
import { useState } from 'react'

interface Props { onClose: () => void }

function getClient() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setError('Enter a valid email'); return }
    const client = getClient(); if (!client) return

    setLoading(true); setError('')
    try {
      const { error: e } = await client.auth.signInWithOtp({ email })
      if (e) throw e
      setStep('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) { setError('Enter 6-digit OTP'); return }
    const client = getClient(); if (!client) return

    setLoading(true); setError('')
    try {
      const { error: e } = await client.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (e) throw e
      // Successfully authenticated! The parent component's onAuthStateChange will handle closing.
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box ob-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="ob-icon">☕</div>
        <h2 className="ob-title">Join MatchMyInterview</h2>
        <p className="ob-subtitle">Practice mock interviews with real peers</p>

        <div className="ob-auth-body">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="ob-form">
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Send Magic OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="ob-form">
              <p className="ob-instruction">Enter the 6-digit OTP sent to {email}</p>
              <input
                type="text"
                className="form-input"
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 700 }}
              />
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Verify & Login'}
              </button>
              <button type="button" className="btn btn-ghost w-full mt-2" onClick={() => setStep('email')}>
                ← Back to Email
              </button>
            </form>
          )}
          <p className="ob-note mt-3">🎁 1 free coffee on signup · No card needed</p>
        </div>
      </div>
    </div>
  )
}
