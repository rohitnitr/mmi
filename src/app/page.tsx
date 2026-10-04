'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { getClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import lazyLoad from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Coffee, Sparkles, Star, ChevronRight, MessageCircle, Activity } from 'lucide-react'
import OnboardingModal from '@/components/OnboardingModal'
import ProfileSetupModal from '@/components/ProfileSetupModal'
import ProfileModal from '@/components/ProfileModal'
import PaymentModal from '@/components/PaymentModal'
import InviteModal from '@/components/InviteModal'
import GuestHomepage from '@/components/marketing/GuestHomepage'
import ProfileEditor from '@/components/ProfileEditor'

const ChatRoom = lazyLoad(() => import('@/components/ChatRoom'), { ssr: false })

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
  status: string; start_time: string; end_time?: string; other_username?: string
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

type Tab = 'peers' | 'requests' | 'chats' | 'profile'

export default function HomePage() {
  const sb = useCallback(() => getClient(), [])

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)  // true once getUser() resolves
  const [needsSetup, setNeedsSetup] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [sessions, setSessions] = useState<Session[]>([])  // ALL active sessions
  const [onlineCount, setOnlineCount] = useState(0)
  const [coffeesShared, setCoffeesShared] = useState(0)
  const [userCoffeesShared, setUserCoffeesShared] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('peers')
  const [showAuth, setShowAuth] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showProEditor, setShowProEditor] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<UserProfile | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  // Maps receiver_id -> invite status: 'pending' | 'accepted' | 'rejected' | 'expired' | undefined
  const [sentInviteMap, setSentInviteMap] = useState<Record<string, string>>({})
  const [selectedChat, setSelectedChat] = useState<Session | null>(null)
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({})   // sessionId -> has unread
  const [lastMsgMap, setLastMsgMap] = useState<Record<string, string>>({}) // sessionId -> preview text
  // filter + pagination
  const [filterDomain, setFilterDomain] = useState('')
  const [filterExp, setFilterExp] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [peersPage, setPeersPage] = useState(1)
  const PEERS_PER_PAGE = 12
  // non-auth filter + pagination (mirrors auth)
  const [guestFilterDomain, setGuestFilterDomain] = useState('')
  const [guestFilterExp, setGuestFilterExp] = useState('')
  const [guestFilterRole, setGuestFilterRole] = useState('')
  const [guestPage, setGuestPage] = useState(1)
  const GUEST_PER_PAGE = 12
  // feedback
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

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
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
    if (data?.length) {
      const enriched = await Promise.all(data.map(async (s: Session) => {
        const oid = s.user1_id === uid ? s.user2_id : s.user1_id
        const { data: ou } = await c.from('users').select('username').eq('id', oid).maybeSingle()
        return { ...s, other_username: ou?.username || 'Peer' }
      }))
      setSessions(enriched)
      // Load last message preview for each session
      enriched.forEach((s: Session) => {
        c.from('messages')
          .select('content')
          .eq('session_id', s.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .then(({ data: md }: { data: { content: string }[] | null }) => {
            if (md?.[0]) setLastMsgMap(prev => ({ ...prev, [s.id]: md[0].content }))
          })
      })
    } else setSessions([])
  }, [sb])

  const fetchCoffeesShared = useCallback(async () => {
    // Use /api/stats which uses service role key — bypasses RLS so
    // non-authenticated users can see the total invite count.
    try {
      const res = await fetch('/api/stats')
      if (res.ok) { const { count } = await res.json(); setCoffeesShared(count || 0) }
    } catch {}
  }, [])

  const fetchSentInvites = useCallback(async (uid: string) => {
    const c = sb(); if (!c) return
    // Fetch all sent invites with their current status
    const { data } = await c.from('invites')
      .select('receiver_id, status, expires_at')
      .eq('sender_id', uid)
      .order('created_at', { ascending: false })
    if (data) {
      const map: Record<string, string> = {}
      for (const i of data as { receiver_id: string; status: string; expires_at: string }[]) {
        // Only set if not already set (most recent invite wins due to ordering)
        if (!map[i.receiver_id]) {
          // If pending but expired, treat as expired so user can re-invite
          if (i.status === 'pending' && new Date(i.expires_at) < new Date()) {
            map[i.receiver_id] = 'expired'
          } else {
            map[i.receiver_id] = i.status
          }
        }
      }
      setSentInviteMap(map)
    }
  }, [sb])

  const fetchLastMsgForSession = useCallback(async (sessionId: string, isOpen: boolean) => {
    const c = sb(); if (!c) return
    const { data } = await c.from('messages')
      .select('content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data?.[0]) {
      setLastMsgMap(prev => ({ ...prev, [sessionId]: data[0].content }))
      if (!isOpen) setUnreadMap(prev => ({ ...prev, [sessionId]: true }))
    }
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
    const client = getClient(); if (!client) return

    let isBooting = true

    const handleSession = async (session: any) => {
      if (session?.user) {
        setAuthUser(session.user as User)
        setShowAuth(false)
        setAuthChecked(true) // Unblock UI instantly!

        try {
          const p = await fetchProfile(session.user.id)
          if (!p) {
            setNeedsSetup(true)
          } else {
            // Fire and forget data fetches (don't block UI)
            fetchInvites(session.user.id)
            fetchSession(session.user.id)
            pingActive(session.user.id)
            fetchUserCoffeesShared(session.user.id)
            fetchSentInvites(session.user.id)
            fetchUsers()
            fetchCoffeesShared()
          }
        } catch (err) {
          console.error('[Boot error]', err)
        }
      } else {
        setAuthUser(null); setProfile(null); setNeedsSetup(false)
        setSentInviteMap({}); setSessions([]); setSelectedChat(null)
        setUnreadMap({}); setLastMsgMap({})
        setAuthChecked(true)
      }
    }

    client.auth.getSession().then(({ data: { session } }) => {
      if (isBooting) {
        handleSession(session)
      }
    }).finally(() => {
      clearTimeout(authTimeout)
      setAuthChecked(true)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_e: string, session: any) => {
      handleSession(session)
    })

    // Fallback: forcefully resolve auth check
    const authTimeout = setTimeout(() => {
      console.warn('[Boot] Auth check timed out. Forcing UI unlock.')
      setAuthChecked(true)
    }, 2500)

    // Load public data immediately on mount
    fetchUsers()
    fetchCoffeesShared()

    return () => {
      isBooting = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = sb(); if (!c || !authUser) return
    const ch1 = c.channel('rt-users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => { fetchUsers(); fetchCoffeesShared() }).subscribe()
    const ch2 = c.channel('rt-invites').on('postgres_changes', { event: '*', schema: 'public', table: 'invites' }, () => { 
      fetchInvites(authUser.id)
      fetchCoffeesShared()
      fetchSession(authUser.id) // Catch accepted invites for sender
      fetchSentInvites(authUser.id) // Refresh sent invite statuses
    }).subscribe()
    const ch3 = c.channel('rt-sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSession(authUser.id)).subscribe()
    const ch4 = c.channel('rt-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
      const sid = payload.new.session_id
      setLastMsgMap(prev => ({ ...prev, [sid]: payload.new.content }))
      // Mark unread only if this chat is not currently open
      setSelectedChat(cur => {
        if (!cur || cur.id !== sid) setUnreadMap(prev => ({ ...prev, [sid]: true }))
        return cur
      })
    }).subscribe()
    const hb = setInterval(() => pingActive(authUser.id), 30_000)
    return () => { ch1.unsubscribe(); ch2.unsubscribe(); ch3.unsubscribe(); ch4.unsubscribe(); clearInterval(hb) }
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
    setSendingInvite(true)
    try {
      const res = await fetch('/api/invites/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: authUser.id, receiverId: inviteTarget.id, note }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Coffee offered! ☕')
        if (inviteTarget) setSentInviteMap(prev => ({ ...prev, [inviteTarget.id]: 'pending' }))
        setInviteTarget(null)
      } else showToast(data.error || 'Failed to send invite', 'error')
    } finally { setSendingInvite(false) }
  }

  const handleAccept = async (invite: Invite) => {
    if (!authUser) return
    const res = await fetch('/api/invites/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser.id }) })
    const data = await res.json()
    if (res.ok && data.session) {
      const c = sb(); if (!c) return
      const oid = data.session.user1_id === authUser.id ? data.session.user2_id : data.session.user1_id
      const { data: ou } = await c.from('users').select('username').eq('id', oid).maybeSingle()
      const session = { ...data.session, other_username: ou?.username || 'Peer' }
      setSessions(prev => [session, ...prev.filter(s => s.id !== session.id)])
      setInvites(p => p.filter(i => i.id !== invite.id))
      setUnreadMap(prev => ({ ...prev, [session.id]: true }))
      setTimeout(() => fetchLastMsgForSession(session.id, false), 800)
      showToast('Matched! 🎉 Open the Chats tab to start your session')
    } else showToast(data.error || 'Failed to accept', 'error')
  }

  const handleReject = async (invite: Invite) => {
    const res = await fetch('/api/invites/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId: invite.id, userId: authUser?.id }) })
    if (res.ok) { setInvites(p => p.filter(i => i.id !== invite.id)); showToast('Invite declined') }
  }

  const handleLogout = async () => {
    const c = sb(); if (c) await c.auth.signOut()
    setAuthUser(null); setProfile(null); setNeedsSetup(false)
    setSentInviteMap({}); setSessions([]); setSelectedChat(null); setUnreadMap({}); setLastMsgMap({})
    setShowProfile(false); setActiveTab('peers')
    window.location.href = '/'
  }

  const sortedPeers = users
    .filter(u => u.id !== authUser?.id)
    .map(u => ({ ...u, _score: profile ? matchScore(profile, u) : 0 }))
    .sort((a, b) => b._score - a._score)

  // Filter peers
  const DOMAIN_OPTIONS = ['Software / IT','Data / Analytics','Finance','Marketing','HR','Core Engineering','Government Exams','Other']
  const EXP_OPTIONS = ['Fresher','0–2 yrs','2–5 yrs','5+ yrs']
  const filteredPeers = sortedPeers.filter(u => {
    if (filterDomain && u.domain !== filterDomain) return false
    if (filterExp && u.experience !== filterExp) return false
    if (filterRole && !u.target_role?.toLowerCase().includes(filterRole.toLowerCase())) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filteredPeers.length / PEERS_PER_PAGE))
  const pagedPeers = filteredPeers.slice((peersPage - 1) * PEERS_PER_PAGE, peersPage * PEERS_PER_PAGE)

  const pendingInviteCount = invites.length
  const totalUnread = Object.values(unreadMap).filter(Boolean).length

  // ── Browser tab title notification ───────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (totalUnread > 0 && activeTab !== 'chats') {
      document.title = `(${totalUnread}) New message – MatchMyInterview`
    } else {
      document.title = 'MatchMyInterview – Practice Interviews with Real Peers'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalUnread, activeTab])

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

      {/* ChatRoom is now inline in the Chats tab — no popup */}

      {showAuth && <OnboardingModal onClose={() => setShowAuth(false)} />}

      {needsSetup && authUser && (
        <ProfileSetupModal userId={authUser.id} email={authUser.email} onComplete={async () => {
          setNeedsSetup(false)
          if (authUser) {
            const p = await fetchProfile(authUser.id)
            if (p) { await fetchInvites(authUser.id); await fetchSession(authUser.id) }
          }
          await fetchUsers()
          showToast('Welcome! You are all set ☕ Unlimited invites!')
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

      {/* ─── HEADER / NAV ─── */}
      {!authUser ? null : (
        <header className="header">
          <div className="header-inner container">
            <div className="logo" style={{ cursor: 'default' }}>
              <img src="/logo.png" alt="MatchMyInterview logo" className="logo-img" />
              <span className="logo-text">MatchMyInterview</span>
            </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="/blog" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" style={{ textDecoration: 'none' }}>Blog</a>
              {profile ? (
                <>
                  <button className="coffee-badge" onClick={() => setShowPayment(true)}>☕ ∞</button>
                  <button className="header-avatar" onClick={() => setActiveTab('profile')} title="Your profile">
                    {(profile.username || 'U').slice(0, 2).toUpperCase()}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>Get Started →</button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ─── TAB NAV (logged-in only, desktop) ─── */}
      {authUser && profile && (
        <div className="tab-nav">
          <div className="container tab-nav-inner">
            <button className={`tab-btn${activeTab === 'peers' ? ' active' : ''}`} onClick={() => setActiveTab('peers')}>🔍 Find Peers</button>
            <button className={`tab-btn${activeTab === 'requests' ? ' active' : ''}`} onClick={() => setActiveTab('requests')}>
              🔔 Requests {pendingInviteCount > 0 && <span className="tab-badge">{pendingInviteCount}</span>}
            </button>
            <button className={`tab-btn${activeTab === 'chats' ? ' active' : ''}`} onClick={() => setActiveTab('chats')}>
              💬 Chats {totalUnread > 0 && <span className="tab-badge">{totalUnread}</span>}
            </button>
            <button className={`tab-btn${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
          </div>
        </div>
      )}

      {/* ─── MAIN / GUEST HOMEPAGE ─── */}
      {!authUser ? (
        <GuestHomepage
          onAuth={() => setShowAuth(true)}
          users={users}
          onlineCount={onlineCount}
          coffeesShared={coffeesShared}
        />
      ) : (
        <main className="main container has-bottom-nav">

        {/* ─── METRICS (always visible) ─── */}
        <section className="metrics-section">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="metrics-grid-2">
            <div className="metric-card">
              <div className="metric-dot green" />
              <div><span className="metric-value">{onlineCount}</span><span className="metric-label">Online & Ready to Practice</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-dot blue" />
              {authUser ? (
                <div>
                  <span className="metric-value">{userCoffeesShared}</span>
                  <span className="metric-label">Coffees You Shared</span>
                </div>
              ) : (
                <div>
                  <span className="metric-value">{coffeesShared}</span>
                  <span className="metric-label">Total Coffees Shared</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity Ticker */}
          {!authUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} style={{ marginTop: 16, padding: '12px 16px', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                <Activity size={14} color="var(--primary)" /> Live Activity:
              </div>
              <div className="ticker-wrap" style={{ flex: 1, overflow: 'hidden', position: 'relative', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)' }}>
                <div className="ticker" style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap', animation: 'ticker 25s linear infinite' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>🎉 Rahul (SDE) just completed a mock interview</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>☕ Priya offered a coffee to Amit</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>⭐ Sneha (Data Analyst) joined the community</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>🚀 Vikram is practicing for an upcoming FAANG interview</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>🎉 Rahul (SDE) just completed a mock interview</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>☕ Priya offered a coffee to Amit</span>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* ─── FIND PEERS TAB ─── */}
        {(!authUser || activeTab === 'peers') && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Available to Practice</h2>
              {!authUser && <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>Join →</button>}
            </div>

            {/* ── Filters (auth only) ── */}
            {authUser && (
              <div className="filter-bar">
                <select className="filter-select" value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setPeersPage(1) }}>
                  <option value="">All Domains</option>
                  {DOMAIN_OPTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="filter-select" value={filterExp} onChange={e => { setFilterExp(e.target.value); setPeersPage(1) }}>
                  <option value="">All Experience</option>
                  {EXP_OPTIONS.map(e => <option key={e}>{e}</option>)}
                </select>
                <input className="filter-input" placeholder="Search role…" value={filterRole} onChange={e => { setFilterRole(e.target.value); setPeersPage(1) }} />
                {(filterDomain || filterExp || filterRole) && (
                  <button className="filter-clear" onClick={() => { setFilterDomain(''); setFilterExp(''); setFilterRole(''); setPeersPage(1) }}>✕ Clear</button>
                )}
              </div>
            )}

            {loadingUsers ? (
              <div className="users-grid">{[...Array(6)].map((_, i) => <div key={i} className="user-card skeleton" />)}</div>
            ) : (() => {
              // ── Guest filtered list ──
              const guestFiltered = users.filter(u => {
                if (guestFilterDomain && u.domain !== guestFilterDomain) return false
                if (guestFilterExp && u.experience !== guestFilterExp) return false
                if (guestFilterRole && !u.target_role?.toLowerCase().includes(guestFilterRole.toLowerCase())) return false
                return true
              })
              const guestTotalPages = Math.max(1, Math.ceil(guestFiltered.length / GUEST_PER_PAGE))
              const guestPaged = guestFiltered.slice((guestPage - 1) * GUEST_PER_PAGE, guestPage * GUEST_PER_PAGE)

              const displayUsers = !authUser
                ? guestPaged.map(u => ({ ...u, _score: 0 }))
                : pagedPeers

              const hasGuestFilters = guestFilterDomain || guestFilterExp || guestFilterRole

              return (
                <>
                  {/* ── Guest Filters ── */}
                  {!authUser && (
                    <div className="filter-bar">
                      <select className="filter-select" value={guestFilterDomain} onChange={e => { setGuestFilterDomain(e.target.value); setGuestPage(1) }}>
                        <option value="">All Domains</option>
                        {DOMAIN_OPTIONS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select className="filter-select" value={guestFilterExp} onChange={e => { setGuestFilterExp(e.target.value); setGuestPage(1) }}>
                        <option value="">All Experience</option>
                        {EXP_OPTIONS.map(e => <option key={e}>{e}</option>)}
                      </select>
                      <input className="filter-input" placeholder="Search role…" value={guestFilterRole} onChange={e => { setGuestFilterRole(e.target.value); setGuestPage(1) }} />
                      {hasGuestFilters && (
                        <button className="filter-clear" onClick={() => { setGuestFilterDomain(''); setGuestFilterExp(''); setGuestFilterRole(''); setGuestPage(1) }}>✕ Clear</button>
                      )}
                    </div>
                  )}

                  {displayUsers.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-icon">☕</p>
                      <p className="empty-title">{authUser ? 'No peers match your filters' : 'No peers match your filters'}</p>
                      <p className="empty-subtitle">{authUser ? 'Try clearing the filters above.' : 'Try clearing the filters above or join to find more peers.'}</p>
                      {!authUser && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAuth(true)}>Join Now →</button>}
                    </div>
                  ) : (
                    <>
                      <div className="users-grid">
                        <AnimatePresence mode="popLayout">
                          {displayUsers.map((user, idx) => (
                            <motion.div 
                              key={user.id ? `${user.id}-${idx}` : `user-${idx}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, delay: idx * 0.05 }}
                              className="user-card"
                            >
                              <div className="user-card-top">
                                <div className="avatar md">{(user.username || 'U').slice(0, 2).toUpperCase()}</div>
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
                            {(() => {
                              const status = sentInviteMap[user.id]
                              const isPending = status === 'pending'
                              const isAccepted = status === 'accepted'
                              const isDeclined = status === 'rejected'
                              // expired or no status = can send again
                              const canSend = !isPending && !isAccepted
                              return (
                                <button
                                  className={`btn btn-sm invite-btn${
                                    isAccepted ? ' btn-accepted' :
                                    isDeclined ? ' btn-declined' :
                                    isPending ? ' btn-sent' :
                                    ' btn-primary'
                                  }`}
                                  disabled={!canSend || !authUser}
                                  onClick={() => {
                                    if (!authUser || !profile) { setShowAuth(true); return }
                                    if (canSend) setInviteTarget(user)
                                  }}>
                                  {isAccepted ? '✓ Accepted' :
                                   isDeclined ? '✗ Declined' :
                                   isPending ? '✓ Coffee Sent' :
                                   '☕ Offer Coffee'}
                                </button>
                              )
                            })()}
                          </motion.div>
                        ))}
                        </AnimatePresence>
                      </div>
                      {/* ── Pagination (auth) ── */}
                      {authUser && totalPages > 1 && (
                        <div className="pagination">
                          <button className="page-btn" disabled={peersPage === 1} onClick={() => setPeersPage(p => p - 1)}>‹ Prev</button>
                          <span className="page-info">{peersPage} / {totalPages} &nbsp;<span className="page-total">({filteredPeers.length} peers)</span></span>
                          <button className="page-btn" disabled={peersPage === totalPages} onClick={() => setPeersPage(p => p + 1)}>Next ›</button>
                        </div>
                      )}
                      {/* ── Pagination (guest) ── */}
                      {!authUser && guestTotalPages > 1 && (
                        <div className="pagination">
                          <button className="page-btn" disabled={guestPage === 1} onClick={() => setGuestPage(p => p - 1)}>‹ Prev</button>
                          <span className="page-info">{guestPage} / {guestTotalPages} &nbsp;<span className="page-total">({guestFiltered.length} peers)</span></span>
                          <button className="page-btn" disabled={guestPage === guestTotalPages} onClick={() => setGuestPage(p => p + 1)}>Next ›</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )
            })()}
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
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(invite)}>Accept ✅</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleReject(invite)}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── CHATS TAB ─── */}
        {authUser && activeTab === 'chats' && (
          <section className="section">
            {selectedChat ? (
              <div className="inline-chat-wrap">
                <ChatRoom
                  sessionId={selectedChat.id}
                  userId={authUser.id}
                  otherUsername={selectedChat.other_username || 'Peer'}
                  peerUserId={selectedChat.user1_id === authUser.id ? selectedChat.user2_id : selectedChat.user1_id}
                  onBack={() => {
                    setSelectedChat(null)
                    setUnreadMap(prev => ({ ...prev, [selectedChat.id]: false }))
                  }}
                  onEnd={() => {
                    setSessions(prev => prev.filter(s => s.id !== selectedChat.id))
                    setSelectedChat(null)
                    setUnreadMap(prev => { const n = { ...prev }; delete n[selectedChat.id]; return n })
                    setLastMsgMap(prev => { const n = { ...prev }; delete n[selectedChat.id]; return n })
                    if (authUser) fetchProfile(authUser.id)
                    showToast('Session ended 👋')
                  }}
                />
              </div>
            ) : (
              <div>
                <h2 className="section-title" style={{ marginBottom: 16 }}>💬 Chats</h2>
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">💬</p>
                    <p className="empty-title">No chats yet</p>
                    <p className="empty-subtitle">Accept a coffee invite to start a mock interview session.</p>
                  </div>
                ) : (
                  <div className="dm-list">
                    {sessions.map(sess => {
                      const hasUnread = !!unreadMap[sess.id]
                      const preview = lastMsgMap[sess.id]
                      return (
                        <div key={sess.id} className="dm-card" onClick={() => {
                          setSelectedChat(sess)
                          setUnreadMap(prev => ({ ...prev, [sess.id]: false }))
                        }}>
                          <div style={{ position: 'relative' }}>
                            <div className="dm-avatar">{sess.other_username?.slice(0, 2).toUpperCase() || '??'}</div>
                            {hasUnread && <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, background: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }} />}
                          </div>
                          <div className="dm-info">
                            <span className="dm-name">{sess.other_username}</span>
                            <span className={`dm-sub${hasUnread ? ' dm-sub-unread' : ''}`}>
                              {preview ? preview.slice(0, 50) + (preview.length > 50 ? '…' : '') : 'Mock Interview Session · Tap to chat'}
                            </span>
                          </div>
                          {hasUnread && <span className="dm-badge">New</span>}
                          <span className="dm-arrow">›</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ─── PROFILE TAB (inline) ─── */}
        {authUser && profile && activeTab === 'profile' && (
          <section className="section">
            <div className="profile-page">
              <div className="profile-page-card">
                <div className="profile-page-avatar">{(profile.username || 'U').slice(0, 2).toUpperCase()}</div>
                <h2 className="profile-page-name">{profile.username}</h2>
                <p className="profile-page-email">{authUser.email || profile.email || '—'}</p>
                <div className="profile-coffee-row">
                  <span className="profile-coffee-count">☕ ∞</span>
                  <span className="profile-coffee-label">Unlimited Coffee</span>
                </div>
              </div>
              <div className="profile-page-card">
                <div className="profile-fields">
                  <div className="profile-field-row"><span className="pf-label">Target Role</span><span className="pf-value">{profile.target_role || '—'}</span></div>
                  <div className="profile-field-row"><span className="pf-label">Experience</span><span className="pf-value">{profile.experience}</span></div>
                  <div className="profile-field-row"><span className="pf-label">Domain</span><span className="pf-value">{profile.domain}</span></div>
                  <div className="profile-field-row"><span className="pf-label">Member since</span><span className="pf-value">{new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></div>
                </div>
              </div>
              <div className="profile-page-card">
                <div className="profile-actions-stack">
                  <button className="btn btn-ghost w-full feedback-btn" onClick={() => { setShowFeedback(f => !f); setFeedbackSent(false) }}>💬 Share Feedback</button>
                  {showFeedback && (
                    <div className="feedback-box">
                      {feedbackSent ? (
                        <p className="feedback-sent">✅ Thanks for your feedback!</p>
                      ) : (
                        <>
                          <textarea className="feedback-textarea" placeholder="Your thoughts, suggestions or bugs…" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} />
                          <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginTop: 6 }} onClick={async () => {
                            if (!feedbackText.trim()) return
                            try { await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: authUser.id, text: feedbackText }) }) } catch {}
                            setFeedbackSent(true); setFeedbackText('')
                          }}>Submit</button>
                        </>
                      )}
                    </div>
                  )}
                  <button className="btn btn-secondary w-full" onClick={() => setShowProfile(true)}>✏️ Edit Profile</button>
                  <button className="btn btn-ghost w-full" onClick={() => setShowProEditor(true)}>💼 Professional Profile</button>
                  {showProEditor && getClient() && (
                    <ProfileEditor supabase={getClient()!} userId={authUser.id} username={profile.username} onClose={() => setShowProEditor(false)} />
                  )}
                  <button className="btn btn-danger w-full" onClick={handleLogout}>Sign Out</button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      )}

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
          <button className={`bottom-nav-btn${activeTab === 'chats' ? ' active' : ''}`} onClick={() => setActiveTab('chats')}>
            <span className="bnb-icon">💬</span>
            {totalUnread > 0 && <span className="bnb-badge">{totalUnread}</span>}
            <span className="bnb-label">Chats</span>
          </button>
          <button className={`bottom-nav-btn${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="bnb-icon">👤</span><span className="bnb-label">Profile</span>
          </button>
        </nav>
      )}
    </div>
  )
}

