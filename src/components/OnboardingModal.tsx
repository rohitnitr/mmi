'use client'
import { useState } from 'react'

interface Props { onClose: () => void }

function getClient() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

export default function OnboardingModal({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [stage, setStage] = useState<'auth' | 'otp'>('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    const client = getClient(); if (!client) return
    setLoading(true); setError('')
    try {
      const { error: e } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (e) throw e
      // Redirects — modal will unmount naturally
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email) return
    setLoading(true); setError('')
    try {
      const client = getClient()
      const { error: e } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
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
      const { error: e } = await client.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (e) throw e
      onClose() // profile setup handled by page.tsx after auth
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code — check your email')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box ob-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="ob-icon">☕</div>
        <h2 className="ob-title">Join MatchMyInterview</h2>
        <p className="ob-subtitle">Practice mock interviews with real peers</p>

        {stage === 'auth' && (
          <div className="ob-auth-body">
            <button className="btn btn-google w-full" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="divider">or</div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendOTP()} autoFocus />
            </div>
            <button className="btn btn-primary w-full" onClick={handleSendOTP} disabled={loading || !email}>
              {loading ? <span className="spinner" /> : 'Send Login Code →'}
            </button>
            {error && <p className="form-error">{error}</p>}
            <p className="ob-note">🎁 1 free coffee on signup · No card needed</p>
          </div>
        )}

        {stage === 'otp' && (
          <div className="ob-auth-body">
            <p className="otp-sent-msg">We sent a code to <strong>{email}</strong></p>
            <input className="form-input otp-input" type="text" placeholder="000000" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()} autoFocus />
            <p className="otp-hint">Check your inbox (and spam folder)</p>
            <button className="btn btn-primary w-full" style={{ marginTop: 12 }} onClick={handleVerifyOTP} disabled={loading || otp.length < 6}>
              {loading ? <span className="spinner" /> : 'Verify →'}
            </button>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-text" onClick={() => { setStage('auth'); setOtp(''); setError('') }}>
              ← Use different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
