'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authedFetch } from '@/components/EvaluationCenter'

const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 }
const card: React.CSSProperties = { border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 20, marginTop: 16 }

function useProgress() {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await authedFetch('/api/me/progress')
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'Could not load progress.')
        if (on) setD(j)
      } catch (e: any) {
        if (on) setErr(e.message || 'Could not load progress.')
      }
    })()
    return () => { on = false }
  }, [])
  return { d, err }
}

export function ProgressChip() {
  const { d } = useProgress()
  if (!d) return null
  return (
    <Link
      href="/progress"
      title="Your progress and leaderboard"
      style={{ marginLeft: 12, fontSize: 13, padding: '2px 10px', borderRadius: 99, border: '1px solid rgba(128,128,128,.4)', textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}
    >
      Lv {d.level} · MMI {d.mmi === null ? '–' : d.mmi}
      {d.streak > 0 ? ' · 🔥' + d.streak : ''}
    </Link>
  )
}

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 13 }}>{label}</div>
      {note && <div style={muted}>{note}</div>}
    </div>
  )
}

export function ProgressPanel() {
  const { d, err } = useProgress()
  const wrap: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '24px 16px 64px' }
  if (err) return <main style={wrap}><p role="alert" style={{ color: '#dc2626' }}>{err}</p></main>
  if (!d) return <main style={wrap}><p style={muted}>Loading…</p></main>

  const pct = Math.max(0, Math.min(100, ((d.xp - d.levelStartXp) / (d.nextLevelXp - d.levelStartXp)) * 100))

  return (
    <main style={wrap}>
      <Link href="/" style={muted}>← Back to MatchMyInterview</Link>
      <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>Your progress</h1>
      <p style={muted}>Everything here is calculated from your real sessions and peer evaluations.</p>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <strong>Level {d.level}</strong>
          <span style={muted}>{d.xp} XP · next level at {d.nextLevelXp}</span>
        </div>
        <div aria-hidden style={{ height: 10, borderRadius: 99, background: 'rgba(128,128,128,.22)', overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: '#16a34a' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 16 }}>
        <Tile label="MMI score" value={d.mmi === null ? '–' : d.mmi} note={d.mmi === null ? 'Needs your first evaluation' : d.provisional ? 'Provisional (under 3 peers)' : 'Out of 100'} />
        <Tile label="Day streak" value={d.streak} note={'Longest ' + d.longestStreak} />
        <Tile label="Sessions" value={d.sessions} />
        <Tile label="Evaluations given" value={d.evalsGiven} />
        <Tile label="Evaluations received" value={d.evalsReceived} note={d.distinctPeers + ' different peer' + (d.distinctPeers === 1 ? '' : 's')} />
      </div>

      <section style={card}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>How this is calculated</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
          <li>XP: 10 per finished session, 15 per evaluation you give (+5 if both comment boxes have real feedback), 10 plus 2x the overall score per evaluation you receive.</li>
          <li>MMI score: your average overall rating out of 100, balanced toward the middle until you have more evaluations. It is marked provisional until 3 different peers have rated you.</li>
          <li>Streak: consecutive days (IST) with a session or an evaluation given.</li>
        </ul>
      </section>

      <p style={{ marginTop: 20, fontSize: 14 }}>
        <Link href="/leaderboard">See the leaderboard</Link> · <Link href="/reports">Your interview reports</Link>
      </p>
    </main>
  )
}
