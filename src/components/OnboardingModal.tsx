'use client'
import { useState } from 'react'

interface Props { onClose: () => void }

import { getClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function OnboardingModal({ onClose }: Props) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="modal-box ob-box" 
        onClick={e => e.stopPropagation()}
        style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -100, right: -100, width: 200, height: 200, background: 'radial-gradient(circle, var(--blue-light) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />
        
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow)' }}>
            <img src="/logo.png" alt="MatchMyInterview" style={{ width: 44, height: 44, borderRadius: '6px' }} />
          </div>
          <h2 className="ob-title" style={{ fontSize: 28, letterSpacing: '-0.8px' }}>Join the Community</h2>
          <p className="ob-subtitle" style={{ fontSize: 15, marginTop: 4 }}>Practice mock interviews with ambitious peers.</p>
        </div>

        <div className="ob-auth-body" style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn btn-google w-full" onClick={handleGoogle} disabled={loading} style={{ height: 52, borderRadius: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? <span className="spinner" /> : 'Continue with Google'}
          </button>
          {error && <p className="form-error">{error}</p>}
          <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
            <p className="ob-note" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--gray-700)' }}>
              <span style={{ color: 'var(--primary)' }}>✨</span> Completely free forever. No card needed.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
