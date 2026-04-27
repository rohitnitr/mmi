'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import lazyLoad from 'next/dynamic'
import AuthModal from '@/components/AuthModal'
import PaymentModal from '@/components/PaymentModal'

const VoiceRoom = lazyLoad(() => import('@/components/VoiceRoom'), { ssr: false })

interface UserProfile {
  id: string
  username: string
  experience: string
  coffee_balance: number
  last_active: string
}

interface Invite {
  id: string
  sender_id: string
  receiver_id: string
  status: string
  created_at: string
  expires_at: string
  sender?: UserProfile
}

interface Session {
  id: string
  user1_id: string
  user2_id: string
  channel_name: string
  status: string
  other_username?: string
}

// ── Safe Supabase getter (browser-only) ─────────────────────────────────────
function getSB() {
  if (typeof window === 'undefined') return null
  // Lazy-import to keep module clean
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

export default function HomePage() {
  const sbRef = useRef<any>(null)
  const sb = useCallback(() => {
    if (!sbRef.current) sbRef.current = getSB()
    return sbRef.current
  }, [])

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [incomingInvites, setIncomingInvites] = useState<Invite[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [activeSessionCount, setActiveSessionCount] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [sendingInviteTo, setSendingInviteTo] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Data fetchers ────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    const client = sb()
    if (!client) return
    const { data } = await client.from('users').select('*').eq('id', userId).maybeSingle()
    if (data) setProfile(data)
    return data
  }, [sb])

  const ensureProfile = useCallback(async (userId: string, experience?: string) => {
    // First try to fetch existing profile
    const client = sb()
    if (!client) return
    const { data: existing } = await client.from('users').select('*').eq('id', userId).maybeSingle()
    if (existing) {
      setProfile(existing)
      return existing
    }
    // Create profile via API if not found
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, experience: experience || '0-2 yrs' }),
    })
    if (res.ok) {
      const { user } = await res.json()
      if (user) setProfile(user)
      return user
    }
  }, [sb])

  const fetchUsers = useCallback(async () => {
    const client = sb()
    if (!client) return
    // Show users active in last 3 minutes
    const since = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    const { data } = await client
      .from('users')
      .select('*')
      .gte('last_active', since)
      .order('last_active', { ascending: false })
      .limit(100)
    if (data) {
      setUsers(data)
      setOnlineCount(data.length)
    }
    setLoadingUsers(false)
  }, [sb])

  const fetchInvites = useCallback(async (userId: string) => {
    const client = sb()
    if (!client) return
    const { data } = await client
      .from('invites')
      .select('*, sender:sender_id(id, username, experience)')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
    if (data) setIncomingInvites(data as Invite[])
  }, [sb])

  const fetchActiveSession = useCallback(async (userId: string) => {
    const client = sb()
    if (!client) return
    const { data } = await client
      .from('sessions')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const session = data[0]
      const otherId = session.user1_id === userId ? session.user2_id : session.user1_id
      const { data: otherUser } = await client.from('users').select('username').eq('id', otherId).maybeSingle()
      setActiveSession({ ...session, other_username: otherUser?.username || 'Anonymous' })
    } else {
      setActiveSession(null)
    }
  }, [sb])

  const fetchSessionCount = useCallback(async () => {
    const client = sb()
    if (!client) return
    const { count } = await client
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    setActiveSessionCount(count || 0)
  }, [sb])

  const updateLastActive = useCallback(async (userId: string) => {
    const client = sb()
    if (!client) return
    await client.from('users').update({ last_active: new Date().toISOString() }).eq('id', userId)
  }, [sb])

  // ── Boot: init Supabase, restore session ────────────────────────────────
  useEffect(() => {
    const client = getSB()
    if (!client) return
    sbRef.current = client

    const boot = async () => {
      // Restore session from localStorage (works for anonymous + email users)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user) {
        setAuthUser(session.user as User)
        await ensureProfile(session.user.id)
        await fetchInvites(session.user.id)
        await fetchActiveSession(session.user.id)
        await updateLastActive(session.user.id)
      }
      await fetchUsers()
      await fetchSessionCount()
    }
    boot()

    // Auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        if (session?.user) {
          setAuthUser(session.user as User)
          await ensureProfile(session.user.id)
          await fetchInvites(session.user.id)
          await fetchActiveSession(session.user.id)
          await updateLastActive(session.user.id)
          await fetchUsers()
        } else {
          setAuthUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Real-time subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    const client = sb()
    if (!client || !authUser) return

    const ch1 = client
      .channel('rt-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe()

    const ch2 = client
      .channel('rt-invites')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invites' }, () => {
        fetchInvites(authUser.id)
        fetchProfile(authUser.id)
      })
      .subscribe()

    const ch3 = client
      .channel('rt-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        fetchActiveSession(authUser.id)
        fetchSessionCount()
      })
      .subscribe()

    // Heartbeat: keep user visible in online list every 30s
    const heartbeat = setInterval(() => updateLastActive(authUser.id), 30_000)

    return () => {
      ch1.unsubscribe()
      ch2.unsubscribe()
      ch3.unsubscribe()
      clearInterval(heartbeat)
    }
  }, [authUser, sb, fetchUsers, fetchInvites, fetchProfile, fetchActiveSession, fetchSessionCount, updateLastActive])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSendInvite = async (receiverId: string) => {
    if (!authUser || !profile) { setShowAuth(true); return }
    if (profile.coffee_balance < 1) { setShowPayment(true); return }

    setSendingInviteTo(receiverId)
    try {
      const res = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: authUser.id, receiverId }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Invite sent! ☕ Coffee spent')
        await fetchProfile(authUser.id)
      } else {
        showToast(data.error || 'Failed to send invite', 'error')
      }
    } finally {
      setSendingInviteTo(null)
    }
  }

  const handleAcceptInvite = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }),
    })
    const data = await res.json()
    if (res.ok && data.session) {
      const client = sb()
      const otherId = data.session.user1_id === authUser.id ? data.session.user2_id : data.session.user1_id
      const { data: otherUser } = await client.from('users').select('username').eq('id', otherId).maybeSingle()
      setActiveSession({ ...data.session, other_username: otherUser?.username || 'User' })
      showToast('Session started! Join the voice call 🎙️')
      setIncomingInvites((prev) => prev.filter((i) => i.id !== invite.id))
    } else {
      showToast(data.error || 'Failed to accept invite', 'error')
    }
  }

  const handleRejectInvite = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }),
    })
    if (res.ok) {
      setIncomingInvites((prev) => prev.filter((i) => i.id !== invite.id))
      showToast('Invite rejected')
    }
  }

  const handleSessionEnd = async () => {
    setActiveSession(null)
    if (authUser) await fetchProfile(authUser.id)
    showToast('Session ended. Great practice! 👏')
  }

  const handleLogout = async () => {
    const client = sb()
    if (client) await client.auth.signOut()
  }

  const otherUsers = users.filter((u) => u.id !== authUser?.id)

  return (
    <div className="app">
      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Voice Session Modal */}
      {activeSession && authUser && (
        <VoiceRoom
          channelName={activeSession.channel_name}
          sessionId={activeSession.id}
          userId={authUser.id}
          otherUsername={activeSession.other_username || 'User'}
          onEnd={handleSessionEnd}
        />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false)
            fetchUsers()
            if (authUser) fetchProfile(authUser.id)
          }}
        />
      )}

      {/* Payment Modal */}
      {showPayment && authUser && (
        <PaymentModal
          userId={authUser.id}
          onClose={() => setShowPayment(false)}
          onSuccess={(coffees) => {
            showToast(`+${coffees} coffees added! ☕`)
            fetchProfile(authUser.id)
          }}
        />
      )}

      {/* ─── HEADER ─── */}
      <header className="header">
        <div className="header-inner container">
          <div className="logo">
            <span className="logo-icon">☕</span>
            <span className="logo-text">MatchMyInterview</span>
          </div>
          <div className="header-right">
            {profile ? (
              <>
                <button className="coffee-badge" onClick={() => setShowPayment(true)} title="Coffee balance — click to top up">
                  ☕ {profile.coffee_balance}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowPayment(true)}>
                  Top Up
                </button>
                <div className="header-user" onClick={handleLogout} title="Click to logout">
                  <div className="avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
                  <span className="username-label">{profile.username}</span>
                </div>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
                Join Free →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      {!authUser && (
        <section className="hero">
          <div className="container">
            <div className="hero-badge">🚀 Live Beta · Free to Try</div>
            <h1 className="hero-title">
              Invite a Peer Over Coffee
              <br />
              <span className="hero-accent">and Practice Together</span>
            </h1>
            <p className="hero-subtitle">
              Anonymous, voice-only mock interviews with real people.
              <br className="hide-mobile" /> Show up. Practice. Get hired.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setShowAuth(true)}>
                Join Free ☕
              </button>
              <span className="hero-note">1 free coffee on signup · No card needed</span>
            </div>
          </div>
        </section>
      )}

      <main className="main container">
        {/* ─── LIVE STATS ─── */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-dot active" />
              <div className="stat-content">
                <span className="stat-value">{onlineCount}</span>
                <span className="stat-label">Online Now</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-dot session" />
              <div className="stat-content">
                <span className="stat-value">{activeSessionCount}</span>
                <span className="stat-label">Live Sessions</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INCOMING INVITES ─── */}
        {authUser && incomingInvites.length > 0 && (
          <section className="section">
            <h2 className="section-title">
              <span className="pulse-dot" />
              Someone wants to practice with you!
            </h2>
            <div className="invites-list">
              {incomingInvites.map((invite) => (
                <div key={invite.id} className="invite-card">
                  <div className="invite-info">
                    <div className="avatar sm">{invite.sender?.username?.slice(0, 2).toUpperCase() || '??'}</div>
                    <div>
                      <p className="invite-from">{invite.sender?.username || 'Someone'}</p>
                      <p className="invite-exp">
                        {invite.sender?.experience} · expires{' '}
                        {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="invite-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleAcceptInvite(invite)}>
                      Accept 🎙️
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRejectInvite(invite)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── USER LIST ─── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Available to Practice</h2>
            {!authUser && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>
                Join to invite →
              </button>
            )}
          </div>

          {loadingUsers ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="user-card skeleton" />)}
            </div>
          ) : otherUsers.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">☕</p>
              <p className="empty-title">No one around right now</p>
              <p className="empty-subtitle">Share the link — be the coffee that starts the conversation.</p>
            </div>
          ) : (
            <div className="users-grid">
              {otherUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-top">
                    <div className="avatar md">{user.username.slice(0, 2).toUpperCase()}</div>
                    <div className="online-dot" />
                  </div>
                  <div className="user-card-body">
                    <h3 className="user-name">{user.username}</h3>
                    <span className="user-exp">{user.experience}</span>
                    <span className="user-active">
                      {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm invite-btn"
                    onClick={() => handleSendInvite(user.id)}
                    disabled={sendingInviteTo === user.id}
                  >
                    {sendingInviteTo === user.id ? (
                      <span className="spinner sm" />
                    ) : (
                      'Buy a Coffee ☕'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── HOW IT WORKS ─── */}
        {!authUser && (
          <section className="how-section">
            <h2 className="section-title centered">How It Works</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-num">1</div>
                <h3 className="step-title">Join Anonymously</h3>
                <p className="step-desc">No profile. No resume. Just a username. Get 1 free coffee on signup.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3 className="step-title">Buy Them a Coffee</h3>
                <p className="step-desc">Spend 1 coffee to invite a peer for a mock session. If they don&apos;t accept in 24h, you get it back.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3 className="step-title">Practice Live</h3>
                <p className="step-desc">15-minute voice call. Take turns. Give feedback. Get hired.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-logo">☕ MatchMyInterview</span>
          <span className="footer-note">Buy a peer a coffee — practice together</span>
        </div>
      </footer>
    </div>
  )
}
