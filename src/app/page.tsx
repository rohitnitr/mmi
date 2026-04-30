'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import lazyLoad from 'next/dynamic'
import OnboardingModal from '@/components/OnboardingModal'
import ProfileSetupModal from '@/components/ProfileSetupModal'
import ProfileModal from '@/components/ProfileModal'
import PaymentModal from '@/components/PaymentModal'
import InviteModal from '@/components/InviteModal'

const VoiceRoom = lazyLoad(() => import('@/components/VoiceRoom'), { ssr: false })

interface UserProfile {
  id: string; username: string; email?: string; experience: string; domain: string
  target_role: string; coffee_balance: number; last_active?: string; created_at: string
}
interface Invite {
  id: string; sender_id: string; receiver_id: string; status: string
  created_at: string; expires_at: string; note?: string; sender?: UserProfile
}
interface Session {
  id: string; user1_id: string; user2_id: string; channel_name: string
  status: string; other_username?: string
}

const EXP_RANK: Record<string, number> = { 'Fresher': 0, '0–2 yrs': 1, '2–5 yrs': 2, '5+ yrs': 3 }
function matchScore(me: UserProfile, other: UserProfile) {
  let s = 0
  if (me.domain && other.domain === me.domain) s += 50
  if (Math.abs((EXP_RANK[me.experience] ?? 0) - (EXP_RANK[other.experience] ?? 0)) <= 1) s += 30
  if (me.target_role && other.target_role) {
    const mw = me.target_role.toLowerCase().split(' ')
    if (other.target_role.toLowerCase().split(' ').some(w => w.length > 2 && mw.includes(w))) s += 20
  }
  return s
}

function getSB() {
  if (typeof window === 'undefined') return null
  const { createClient } = require('@/lib/supabase/client')
  return createClient()
}

type Tab = 'peers' | 'requests' | 'profile'

export default function HomePage() {
  const sbRef = useRef<any>(null)
  const sb = useCallback(() => { if (!sbRef.current) sbRef.current = getSB(); return sbRef.current }, [])

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)  // true once getUser() resolves
  const [needsSetup, setNeedsSetup] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [coffeesShared, setCoffeesShared] = useState(0)        // global total
  const [userCoffeesShared, setUserCoffeesShared] = useState(0) // current user's sent coffees
  const [activeTab, setActiveTab] = useState<Tab>('peers')
  const [showAuth, setShowAuth] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<UserProfile | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return null
    const { data } = await c.from('users').select('*').eq('id', uid).maybeSingle()
    if (data) setProfile(data)
    return data
  }, [sb])

  const fetchUsers = useCallback(async () => {
    const c = sb(); if (!c) return
    // Fetch all users ordered by last_active — used for peers list and non-auth preview
    const { data } = await c.from('users').select('*').order('last_active', { ascending: false }).limit(100)
    if (data) {
      setUsers(data)
      // Online count = active in last 3 minutes
      const since = new Date(Date.now() - 3 * 60 * 1000).toISOString()
      setOnlineCount(data.filter((u: UserProfile) => u.last_active && u.last_active >= since).length)
    }
    setLoadingUsers(false)
  }, [sb])

  const fetchInvites = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return
    const { data } = await c.from('invites')
      .select('*, sender:sender_id(id,username,experience,domain,target_role)')
      .eq('receiver_id', uid).eq('status', 'pending')
    if (data) setInvites(data as Invite[])
  }, [sb])

  const fetchSession = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return
    const { data } = await c.from('sessions').select('*')
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`).eq('status', 'active').limit(1)
    if (data?.length) {
      const s = data[0]
      const oid = s.user1_id === uid ? s.user2_id : s.user1_id
      const { data: ou } = await c.from('users').select('username').eq('id', oid).maybeSingle()
      setActiveSession({ ...s, other_username: ou?.username || 'Peer' })
    } else setActiveSession(null)
  }, [sb])

  const fetchCoffeesShared = useCallback(async () => {
    const c = sb(); if (!c) return
    // Global total = all invites ever sent (any status) — shown on landing page
    const { count } = await c.from('invites').select('*', { count: 'exact', head: true })
    setCoffeesShared(count || 0)
  }, [sb])

  const fetchUserCoffeesShared = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return
    // Coffees this user has sent (accepted invites where they were sender)
    const { count } = await c.from('invites').select('*', { count: 'exact', head: true })
      .eq('sender_id', uid).eq('status', 'accepted')
    setUserCoffeesShared(count || 0)
  }, [sb])

  const pingActive = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return
    await c.from('users').update({ last_active: new Date().toISOString() }).eq('id', uid)
  }, [sb])

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const client = getSB(); if (!client) return
    sbRef.current = client

    // Store subscription so cleanup works even though init() is async
    let sub: any = null

    const init = async () => {
      // Sign out FIRST and AWAIT it — this clears localStorage session.
      // Only after this do we subscribe, so the listener never sees a stale session.
      await client.auth.signOut()
      setAuthUser(null); setProfile(null); setNeedsSetup(false)
      setAuthChecked(true)

      // Load public landing data
      await fetchUsers()
      await fetchCoffeesShared()

      // Subscribe AFTER signOut — listener only ever sees fresh login events
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_e: string, session: any) => {
        if (session?.user) {
          setAuthUser(session.user as User)
          setShowAuth(false)
          setAuthChecked(true)
          const p = await fetchProfile(session.user.id)
          if (!p) {
            setNeedsSetup(true)
          } else {
            await fetchInvites(session.user.id)
            await fetchSession(session.user.id)
            await pingActive(session.user.id)
            await fetchUserCoffeesShared(session.user.id)
          }
          await fetchUsers()
          await fetchCoffeesShared()
        } else {
          setAuthUser(null); setProfile(null); setNeedsSetup(false)
          setAuthChecked(true)
        }
      })
      sub = subscription
    }

    init()
    return () => sub?.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = sb(); if (!c || !authUser) return
    const ch1 = c.channel('rt-users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => { fetchUsers(); fetchCoffeesShared() }).subscribe()
    const ch2 = c.channel('rt-invites').on('postgres_changes', { event: '*', schema: 'public', table: 'invites' }, () => { fetchInvites(authUser.id); fetchCoffeesShared() }).subscribe()
    const ch3 = c.channel('rt-sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSession(authUser.id)).subscribe()
    const hb = setInterval(() => pingActive(authUser.id), 30_000)
    return () => { ch1.unsubscribe(); ch2.unsubscribe(); ch3.unsubscribe(); clearInterval(hb) }
  }, [authUser, sb, fetchUsers, fetchCoffeesShared, fetchInvites, fetchSession, pingActive])

  // ── Metrics poll for non-auth ─────────────────────────────────────────────
  useEffect(() => {
    if (authUser) return
    fetchUsers(); fetchCoffeesShared()
    const t = setInterval(() => { fetchUsers(); fetchCoffeesShared() }, 30_000)
    return () => clearInterval(t)
  }, [authUser, fetchUsers, fetchCoffeesShared])

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
      if (res.ok) { showToast('Coffee offered! ☕'); await fetchProfile(authUser.id); setInviteTarget(null) }
      else showToast(data.error || 'Failed to send invite', 'error')
    } finally { setSendingInvite(false) }
  }

  const handleAccept = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }) })
    const data = await res.json()
    if (res.ok && data.session) {
      const c = sb()
      const oid = data.session.user1_id === authUser.id ? data.session.user2_id : data.session.user1_id
      const { data: ou } = await c.from('users').select('username').eq('id', oid).maybeSingle()
      setActiveSession({ ...data.session, other_username: ou?.username || 'Peer' })
      setInvites(p => p.filter(i => i.id !== invite.id))
      showToast('Session started! 🎙️')
    } else showToast(data.error || 'Failed to accept', 'error')
  }

  const handleReject = async (invite: Invite) => {
    const res = await fetch('/api/invites/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser?.id }) })
    if (res.ok) { setInvites(p => p.filter(i => i.id !== invite.id)); showToast('Invite declined') }
  }

  const handleLogout = async () => {
    const c = sb(); if (c) await c.auth.signOut()
    setShowProfile(false)
    showToast('Signed out successfully')
  }

  const sortedPeers = users
    .filter(u => u.id !== authUser?.id)
    .map(u => ({ ...u, _score: profile ? matchScore(profile, u) : 0 }))
    .sort((a, b) => b._score - a._score)

  const pendingInviteCount = invites.length

  // ── RENDER ────────────────────────────────────────────────────────────────

  // Show a spinner until we know if the user is logged in or not.
  // This prevents the blank "Get Started" flash on refresh for logged-in users.
  if (!authChecked) {
    return (
      <div className="app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 32 }}>☕</span>
        <span className="spinner sm" style={{ borderColor: 'rgba(0,0,0,.15)', borderTopColor: '#18181b', width: 24, height: 24, borderWidth: 3 }} />
      </div>
    )
  }

  return (
    <div className="app">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {activeSession && authUser && (
        <VoiceRoom channelName={activeSession.channel_name} sessionId={activeSession.id}
          userId={authUser.id} otherUsername={activeSession.other_username || 'Peer'}
          onEnd={() => { setActiveSession(null); if (authUser) fetchProfile(authUser.id); showToast('Great session! 👏') }} />
      )}

      {showAuth && <OnboardingModal onClose={() => setShowAuth(false)} />}

      {needsSetup && authUser && (
        <ProfileSetupModal userId={authUser.id} email={authUser.email} onComplete={async () => {
          setNeedsSetup(false)
          if (authUser) {
            const p = await fetchProfile(authUser.id)
            if (p) { await fetchInvites(authUser.id); await fetchSession(authUser.id) }
          }
          await fetchUsers()
          showToast('Welcome! You have 1 free coffee ☕')
        }} />
      )}

      {showProfile && profile && (
        <ProfileModal profile={profile} onClose={() => setShowProfile(false)}
          onUpdate={p => { setProfile(p); showToast('Profile updated!') }}
          onLogout={handleLogout} />
      )}

      {showPayment && authUser && (
        <PaymentModal userId={authUser.id} onClose={() => setShowPayment(false)}
          onSuccess={n => { showToast(`+${n} coffees! ☕`); fetchProfile(authUser.id) }} />
      )}

      {inviteTarget && authUser && profile && (
        <InviteModal receiver={inviteTarget} onSend={handleSendInvite}
          onClose={() => setInviteTarget(null)} sending={sendingInvite} />
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
                <button className="coffee-badge" onClick={() => setShowPayment(true)}>☕ {profile.coffee_balance}</button>
                <button className="header-avatar" onClick={() => setActiveTab('profile')} title="Your profile">
                  {profile.username.slice(0, 2).toUpperCase()}
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>Get Started →</button>
            )}
          </div>
        </div>
      </header>

      {/* ─── TAB NAV (logged-in only, desktop) ─── */}
      {authUser && profile && (
        <div className="tab-nav">
          <div className="container tab-nav-inner">
            <button className={`tab-btn${activeTab === 'peers' ? ' active' : ''}`} onClick={() => setActiveTab('peers')}>🔍 Find Peers</button>
            <button className={`tab-btn${activeTab === 'requests' ? ' active' : ''}`} onClick={() => setActiveTab('requests')}>
              🔔 Requests {pendingInviteCount > 0 && <span className="tab-badge">{pendingInviteCount}</span>}
            </button>
            <button className={`tab-btn${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
          </div>
        </div>
      )}

      {/* ─── HERO (non-auth) ─── */}
      {!authUser && (
        <section className="hero">
          <div className="container">
            <div className="hero-badge">🚀 Free Beta · Join Now</div>
            <h1 className="hero-title">Offer a Peer a Coffee<br /><span className="hero-accent">Practice Interviews Together</span></h1>
            <p className="hero-subtitle">Anonymous voice-only mock sessions.<br className="hide-mobile" /> Show up. Practice. Get hired.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setShowAuth(true)}>Start Practicing ☕</button>
              <span className="hero-note">1 free coffee on signup · No card needed</span>
            </div>
          </div>
        </section>
      )}

      <main className={`main container${authUser ? ' has-bottom-nav' : ''}`}>

        {/* ─── METRICS (always visible) ─── */}
        <section className="metrics-section">
          <div className="metrics-grid-2">
            <div className="metric-card">
              <div className="metric-dot green" />
              <div><span className="metric-value">{onlineCount}</span><span className="metric-label">Online Now</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-dot coffee" />
              {authUser ? (
                <div>
                  <span className="metric-value">{userCoffeesShared}</span>
                  <span className="metric-label">You Shared</span>
                </div>
              ) : (
                <div>
                  <span className="metric-value">{coffeesShared}</span>
                  <span className="metric-label">Coffee Shared</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── FIND PEERS TAB ─── */}
        {(!authUser || activeTab === 'peers') && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Available to Practice</h2>
              {!authUser && <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>Join →</button>}
            </div>
            {loadingUsers ? (
              <div className="users-grid">{[...Array(6)].map((_, i) => <div key={i} className="user-card skeleton" />)}</div>
            ) : (
              (() => {
                // Non-auth: show top 6 most recently active users
                // Auth: show match-scored peers (excluding self)
                const displayUsers = !authUser
                  ? users.slice(0, 8).map(u => ({ ...u, _score: 0 }))
                  : sortedPeers

                return displayUsers.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">☕</p>
                    <p className="empty-title">No one here yet</p>
                    <p className="empty-subtitle">Share the link — be the first coffee at the table.</p>
                    {!authUser && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAuth(true)}>Join Now →</button>}
                  </div>
                ) : (
                  <div className="users-grid">
                    {displayUsers.map(user => (
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
                          <span className="user-active">{formatDistanceToNow(new Date(user.last_active || user.created_at || Date.now()), { addSuffix: true })}</span>
                          {profile && user._score >= 50 && <span className="match-badge">⚡ Great match</span>}
                        </div>
                        <button className="btn btn-primary btn-sm invite-btn" onClick={() => {
                          if (!authUser || !profile) { setShowAuth(true); return }
                          setInviteTarget(user)
                        }}>
                          ☕ Offer Coffee
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })()
            )}
          </section>
        )}

        {/* ─── REQUESTS TAB ─── */}
        {authUser && activeTab === 'requests' && (
          <section className="section">
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              <span className="pulse-dot" />
              Incoming Requests
            </h2>
            {invites.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">🔔</p>
                <p className="empty-title">No pending requests</p>
                <p className="empty-subtitle">When someone offers you a coffee, it'll appear here.</p>
              </div>
            ) : (
              <div className="invites-list">
                {invites.map(invite => (
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
                        <span className="invite-note-quote">&ldquo;</span>{invite.note}
                      </div>
                    )}
                    <div className="invite-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(invite)}>Accept 🎙️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleReject(invite)}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── PROFILE TAB (inline) ─── */}
        {authUser && profile && activeTab === 'profile' && (
          <section className="section">
            <div className="profile-page">
              <div className="profile-page-card">
                <div className="profile-page-avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
                <h2 className="profile-page-name">{profile.username}</h2>
                <p className="profile-page-email">{authUser.email || profile.email || '—'}</p>
                <div className="profile-coffee-row">
                  <span className="profile-coffee-count">☕ {profile.coffee_balance}</span>
                  <span className="profile-coffee-label">coffees</span>
                  <button className="profile-topup-btn" onClick={() => setShowPayment(true)}>+ Top up</button>
                </div>
              </div>
              <div className="profile-page-card">
                <div className="profile-fields">
                  <div className="profile-field-row">
                    <span className="pf-label">Target Role</span>
                    <span className="pf-value">{profile.target_role || '—'}</span>
                  </div>
                  <div className="profile-field-row">
                    <span className="pf-label">Experience</span>
                    <span className="pf-value">{profile.experience}</span>
                  </div>
                  <div className="profile-field-row">
                    <span className="pf-label">Domain</span>
                    <span className="pf-value">{profile.domain}</span>
                  </div>
                  <div className="profile-field-row">
                    <span className="pf-label">Member since</span>
                    <span className="pf-value">{new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="profile-page-card">
                <div className="profile-actions-stack">
                  <button className="btn btn-secondary w-full" onClick={() => setShowProfile(true)}>✏️ Edit Profile</button>
                  <button className="btn btn-danger w-full" onClick={handleLogout}>Sign Out</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── HOW IT WORKS (non-auth) ─── */}
        {!authUser && (
          <section className="how-section">
            <h2 className="section-title centered">How It Works</h2>
            <div className="steps-grid">
              {[
                { n: 1, t: 'Sign Up Free', d: 'Verify with email in seconds. Get 1 free coffee to start.' },
                { n: 2, t: 'Offer a Coffee', d: 'Find a peer and offer them a coffee to practice together.' },
                { n: 3, t: 'Practice Live', d: '15-min voice call. Take turns interviewing. Level up.' },
              ].map(s => (
                <div key={s.n} className="step">
                  <div className="step-num">{s.n}</div>
                  <h3 className="step-title">{s.t}</h3>
                  <p className="step-desc">{s.d}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ─── BOTTOM NAV (mobile, logged-in) ─── */}
      {authUser && profile && (
        <nav className="bottom-nav">
          <button className={`bottom-nav-btn${activeTab === 'peers' ? ' active' : ''}`} onClick={() => setActiveTab('peers')}>
            <span className="bnb-icon">🔍</span><span className="bnb-label">Find</span>
          </button>
          <button className={`bottom-nav-btn${activeTab === 'requests' ? ' active' : ''}`} onClick={() => setActiveTab('requests')}>
            <span className="bnb-icon">🔔</span>
            {pendingInviteCount > 0 && <span className="bnb-badge">{pendingInviteCount}</span>}
            <span className="bnb-label">Requests</span>
          </button>
          <button className={`bottom-nav-btn${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="bnb-icon">👤</span><span className="bnb-label">Profile</span>
          </button>
        </nav>
      )}

      {/* ─── FOOTER (hidden on mobile when logged in, bottom-nav takes its place) ─── */}
      {!authUser && (
        <footer className="footer">
          <div className="container footer-inner">
            <span className="footer-logo">☕ MatchMyInterview</span>
            <span className="footer-note">Offer a peer a coffee · Practice together</span>
          </div>
        </footer>
      )}
    </div>
  )
}
