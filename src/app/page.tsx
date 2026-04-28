'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import lazyLoad from 'next/dynamic'
import OnboardingModal from '@/components/OnboardingModal'
import PaymentModal from '@/components/PaymentModal'
import InviteModal from '@/components/InviteModal'

const VoiceRoom = lazyLoad(() => import('@/components/VoiceRoom'), { ssr: false })

interface UserProfile {
  id: string
  username: string
  experience: string
  domain: string
  target_role: string
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
  note?: string
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

interface Metrics {
  online: number
  sessions: number
  totalUsers: number
  totalSessions: number
}

// ── Match scoring ────────────────────────────────────────────────────────────
const EXP_RANK: Record<string, number> = { 'Fresher': 0, '0–2 yrs': 1, '2–5 yrs': 2, '5+ yrs': 3 }

function matchScore(me: UserProfile, other: UserProfile): number {
  let score = 0
  if (me.domain && other.domain && me.domain === other.domain) score += 50
  const myExp = EXP_RANK[me.experience] ?? 0
  const theirExp = EXP_RANK[other.experience] ?? 0
  if (Math.abs(myExp - theirExp) <= 1) score += 30
  if (me.target_role && other.target_role) {
    const myWords = me.target_role.toLowerCase().split(' ')
    const theirWords = other.target_role.toLowerCase().split(' ')
    if (myWords.some(w => w.length > 2 && theirWords.includes(w))) score += 20
  }
  return score
}

function getSB() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

export default function HomePage() {
  const sbRef = useRef<any>(null)
  const sb = useCallback(() => { if (!sbRef.current) sbRef.current = getSB(); return sbRef.current }, [])

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [incomingInvites, setIncomingInvites] = useState<Invite[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [metrics, setMetrics] = useState<Metrics>({ online: 0, sessions: 0, totalUsers: 0, totalSessions: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<UserProfile | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    const client = sb(); if (!client) return
    const { data } = await client.from('users').select('*').eq('id', userId).maybeSingle()
    if (data) setProfile(data)
    return data
  }, [sb])

  const ensureProfile = useCallback(async (userId: string) => {
    const client = sb(); if (!client) return
    const { data: ex } = await client.from('users').select('*').eq('id', userId).maybeSingle()
    if (ex) { setProfile(ex); return ex }
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
    if (res.ok) { const { user } = await res.json(); if (user) setProfile(user); return user }
  }, [sb])

  const fetchUsers = useCallback(async () => {
    const client = sb(); if (!client) return
    const since = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    const { data } = await client.from('users').select('*').gte('last_active', since).order('last_active', { ascending: false }).limit(100)
    if (data) setUsers(data)
    setLoadingUsers(false)
  }, [sb])

  const fetchInvites = useCallback(async (userId: string) => {
    const client = sb(); if (!client) return
    const { data } = await client
      .from('invites')
      .select('*, sender:sender_id(id, username, experience, domain, target_role)')
      .eq('receiver_id', userId).eq('status', 'pending')
    if (data) setIncomingInvites(data as Invite[])
  }, [sb])

  const fetchActiveSession = useCallback(async (userId: string) => {
    const client = sb(); if (!client) return
    const { data } = await client.from('sessions').select('*').or(`user1_id.eq.${userId},user2_id.eq.${userId}`).eq('status', 'active').limit(1)
    if (data && data.length > 0) {
      const s = data[0]
      const otherId = s.user1_id === userId ? s.user2_id : s.user1_id
      const { data: ou } = await client.from('users').select('username').eq('id', otherId).maybeSingle()
      setActiveSession({ ...s, other_username: ou?.username || 'Anonymous' })
    } else { setActiveSession(null) }
  }, [sb])

  const fetchMetrics = useCallback(async () => {
    const client = sb(); if (!client) return
    const since = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    const [{ count: online }, { count: sessions }, { count: totalUsers }, { count: totalSessions }] = await Promise.all([
      client.from('users').select('*', { count: 'exact', head: true }).gte('last_active', since),
      client.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      client.from('users').select('*', { count: 'exact', head: true }),
      client.from('sessions').select('*', { count: 'exact', head: true }),
    ])
    setMetrics({ online: online || 0, sessions: sessions || 0, totalUsers: totalUsers || 0, totalSessions: totalSessions || 0 })
  }, [sb])

  const updateLastActive = useCallback(async (userId: string) => {
    const client = sb(); if (!client) return
    await client.from('users').update({ last_active: new Date().toISOString() }).eq('id', userId)
  }, [sb])

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const client = getSB(); if (!client) return
    sbRef.current = client

    const boot = async () => {
      const { data: { session } } = await client.auth.getSession()
      if (session?.user) {
        setAuthUser(session.user as User)
        await ensureProfile(session.user.id)
        await fetchInvites(session.user.id)
        await fetchActiveSession(session.user.id)
        await updateLastActive(session.user.id)
      }
      await fetchUsers()
      await fetchMetrics()
    }
    boot()

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_e: string, session: any) => {
      if (session?.user) {
        setAuthUser(session.user as User)
        await ensureProfile(session.user.id)
        await fetchInvites(session.user.id)
        await fetchActiveSession(session.user.id)
        await updateLastActive(session.user.id)
        await fetchUsers()
      } else {
        setAuthUser(null); setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Realtime + heartbeat ──────────────────────────────────────────────────
  useEffect(() => {
    const client = sb(); if (!client || !authUser) return
    const ch1 = client.channel('rt-users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => { fetchUsers(); fetchMetrics() }).subscribe()
    const ch2 = client.channel('rt-invites').on('postgres_changes', { event: '*', schema: 'public', table: 'invites' }, () => { fetchInvites(authUser.id); fetchProfile(authUser.id) }).subscribe()
    const ch3 = client.channel('rt-sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => { fetchActiveSession(authUser.id); fetchMetrics() }).subscribe()
    const hb = setInterval(() => updateLastActive(authUser.id), 30_000)
    return () => { ch1.unsubscribe(); ch2.unsubscribe(); ch3.unsubscribe(); clearInterval(hb) }
  }, [authUser, sb, fetchUsers, fetchMetrics, fetchInvites, fetchProfile, fetchActiveSession, updateLastActive])

  // ── Metrics poll for non-auth users ───────────────────────────────────────
  useEffect(() => {
    if (authUser) return
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30_000)
    return () => clearInterval(interval)
  }, [authUser, fetchMetrics])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSendInvite = async (note: string) => {
    if (!authUser || !profile || !inviteTarget) return
    if (profile.coffee_balance < 1) { setShowPayment(true); return }
    setSendingInvite(true)
    try {
      const res = await fetch('/api/invites/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: authUser.id, receiverId: inviteTarget.id, note }),
      })
      const data = await res.json()
      if (res.ok) { showToast('Invite sent! ☕ Coffee offered'); await fetchProfile(authUser.id); setInviteTarget(null) }
      else showToast(data.error || 'Failed to send invite', 'error')
    } finally { setSendingInvite(false) }
  }

  const handleClickInvite = (user: UserProfile) => {
    if (!authUser || !profile) { setShowOnboarding(true); return }
    if (profile.coffee_balance < 1) { setShowPayment(true); return }
    setInviteTarget(user)
  }

  const handleAccept = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }) })
    const data = await res.json()
    if (res.ok && data.session) {
      const client = sb()
      const otherId = data.session.user1_id === authUser.id ? data.session.user2_id : data.session.user1_id
      const { data: ou } = await client.from('users').select('username').eq('id', otherId).maybeSingle()
      setActiveSession({ ...data.session, other_username: ou?.username || 'User' })
      setIncomingInvites(p => p.filter(i => i.id !== invite.id))
      showToast('Session started! 🎙️')
    } else showToast(data.error || 'Failed to accept', 'error')
  }

  const handleReject = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }) })
    if (res.ok) { setIncomingInvites(p => p.filter(i => i.id !== invite.id)); showToast('Invite declined') }
  }

  const handleSessionEnd = async () => {
    setActiveSession(null)
    if (authUser) await fetchProfile(authUser.id)
    showToast('Session ended. Great practice! 👏')
  }

  // ── Sorted user list ──────────────────────────────────────────────────────
  const otherUsers = users
    .filter(u => u.id !== authUser?.id)
    .map(u => ({ ...u, _score: profile ? matchScore(profile, u) : 0 }))
    .sort((a, b) => b._score - a._score)

  return (
    <div className="app">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {activeSession && authUser && (
        <VoiceRoom channelName={activeSession.channel_name} sessionId={activeSession.id} userId={authUser.id} otherUsername={activeSession.other_username || 'User'} onEnd={handleSessionEnd} />
      )}

      {showOnboarding && (
        <OnboardingModal onClose={() => { setShowOnboarding(false); fetchUsers(); if (authUser) fetchProfile(authUser.id) }} />
      )}

      {showPayment && authUser && (
        <PaymentModal userId={authUser.id} onClose={() => setShowPayment(false)} onSuccess={coffees => { showToast(`+${coffees} coffees added! ☕`); fetchProfile(authUser.id) }} />
      )}

      {inviteTarget && authUser && profile && (
        <InviteModal receiver={inviteTarget} onSend={handleSendInvite} onClose={() => setInviteTarget(null)} sending={sendingInvite} />
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
                <button className="coffee-badge" onClick={() => setShowPayment(true)} title="Coffee balance">
                  ☕ {profile.coffee_balance}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowPayment(true)}>Top Up</button>
                <div className="header-user" title="Your profile">
                  <div className="avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
                  <span className="username-label">{profile.username}</span>
                </div>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowOnboarding(true)}>
                Get Started →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO (non-auth only) ─── */}
      {!authUser && (
        <section className="hero">
          <div className="container">
            <div className="hero-badge">🚀 Live Beta · Free to Try</div>
            <h1 className="hero-title">
              Offer a Peer a Coffee
              <br /><span className="hero-accent">Practice Interviews Together</span>
            </h1>
            <p className="hero-subtitle">
              Anonymous, voice-only mock sessions with real people.
              <br className="hide-mobile" /> Show up. Practice. Get hired.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setShowOnboarding(true)}>
                Start Practicing ☕
              </button>
              <span className="hero-note">1 free coffee on signup · No card needed</span>
            </div>
          </div>
        </section>
      )}

      <main className="main container">

        {/* ─── LIVE METRICS ─── */}
        <section className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-dot green" />
              <div className="metric-body">
                <span className="metric-value">{metrics.online}</span>
                <span className="metric-label">Online Now</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-dot blue" />
              <div className="metric-body">
                <span className="metric-value">{metrics.sessions}</span>
                <span className="metric-label">Live Sessions</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-dot purple" />
              <div className="metric-body">
                <span className="metric-value">{metrics.totalUsers}</span>
                <span className="metric-label">Total Peers</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-dot coffee" />
              <div className="metric-body">
                <span className="metric-value">{metrics.totalSessions}</span>
                <span className="metric-label">Coffees Shared</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INCOMING INVITES ─── */}
        {authUser && incomingInvites.length > 0 && (
          <section className="section">
            <h2 className="section-title">
              <span className="pulse-dot" />
              Someone offered you a coffee!
            </h2>
            <div className="invites-list">
              {incomingInvites.map(invite => (
                <div key={invite.id} className="invite-card v2">
                  <div className="invite-sender-profile">
                    <div className="avatar md">{invite.sender?.username?.slice(0, 2).toUpperCase() || '??'}</div>
                    <div className="invite-sender-info">
                      <p className="invite-from">{invite.sender?.username || 'Someone'}</p>
                      <div className="invite-tags">
                        {invite.sender?.experience && <span className="tag">{invite.sender.experience}</span>}
                        {invite.sender?.domain && <span className="tag">{invite.sender.domain}</span>}
                        {invite.sender?.target_role && <span className="tag tag-role">🎯 {invite.sender.target_role}</span>}
                      </div>
                      <p className="invite-exp">expires {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  {invite.note && (
                    <div className="invite-note-block">
                      <span className="invite-note-quote">&ldquo;</span>
                      {invite.note}
                    </div>
                  )}
                  <div className="invite-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(invite)}>Accept 🎙️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleReject(invite)}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── PEER LIST ─── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Available to Practice</h2>
            {!authUser && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowOnboarding(true)}>Join to invite →</button>
            )}
          </div>

          {loadingUsers ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="user-card skeleton" />)}
            </div>
          ) : otherUsers.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">☕</p>
              <p className="empty-title">No one here yet</p>
              <p className="empty-subtitle">Share this link — be the first coffee at the table.</p>
              {!authUser && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowOnboarding(true)}>Join Now →</button>}
            </div>
          ) : (
            <div className="users-grid">
              {otherUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-card-top">
                    <div className="avatar md">{user.username.slice(0, 2).toUpperCase()}</div>
                    <div className="online-dot" />
                  </div>
                  <div className="user-card-body">
                    <h3 className="user-name">{user.username}</h3>
                    <div className="user-tags">
                      <span className="tag">{user.experience}</span>
                      {user.domain && <span className="tag">{user.domain}</span>}
                    </div>
                    {user.target_role && <span className="user-role">🎯 {user.target_role}</span>}
                    <span className="user-active">{formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</span>
                    {profile && user._score >= 50 && <span className="match-badge">⚡ Great match</span>}
                  </div>
                  <button
                    className="btn btn-primary btn-sm invite-btn"
                    onClick={() => handleClickInvite(user)}
                  >
                    ☕ Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── HOW IT WORKS (non-auth) ─── */}
        {!authUser && (
          <section className="how-section">
            <h2 className="section-title centered">How It Works</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-num">1</div>
                <h3 className="step-title">Create Your Profile</h3>
                <p className="step-desc">Verify with email in seconds. Get 1 free coffee to start.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3 className="step-title">Offer a Coffee</h3>
                <p className="step-desc">Find a peer and offer them a coffee to invite them to practice together.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3 className="step-title">Practice Live</h3>
                <p className="step-desc">15-minute voice session. Take turns. Give feedback. Level up.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-logo">☕ MatchMyInterview</span>
          <span className="footer-note">Offer a peer a coffee · Practice together</span>
        </div>
      </footer>
    </div>
  )
}
