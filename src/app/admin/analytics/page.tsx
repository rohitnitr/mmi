'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authedFetch } from '@/components/EvaluationCenter'

const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 }

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div style={{ border: '1px solid rgba(128,128,128,.28)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 13 }}>{label}</div>
      {note && <div style={muted}>{note}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await authedFetch('/api/admin/analytics')
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'Could not load analytics.')
        if (on) setD(j)
      } catch (e: any) {
        if (on) setErr(e.message || 'Could not load analytics.')
      }
    })()
    return () => { on = false }
  }, [])

  const wrap: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '24px 16px 64px' }
  if (err) return <main style={wrap}><p role="alert" style={{ color: '#dc2626' }}>{err}</p><Link href="/">← Home</Link></main>
  if (!d) return <main style={wrap}><p style={muted}>Loading…</p></main>

  return (
    <main style={wrap}>
      <Link href="/" style={muted}>← Back to MatchMyInterview</Link>
      <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>Founder analytics</h1>
      <p style={muted}>Real counts from your database. Last-7-day figures use the last 7 days from now.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginTop: 16 }}>
        <Tile label="Users" value={d.users} />
        <Tile label="Active in 7 days" value={d.activeUsers7d} />
        <Tile label="Sessions" value={d.sessions} note={d.sessions7d + ' in the last 7 days'} />
        <Tile label="Evaluations" value={d.evaluations} note={d.evaluations7d + ' in the last 7 days'} />
        <Tile label="Evaluation rate" value={d.evaluationRate === null ? '–' : d.evaluationRate + '%'} note="evaluations per session" />
        <Tile label="Users evaluated" value={d.usersEvaluated} />
        <Tile label="Public profiles" value={d.publicProfiles} />
        <Tile label="Average overall" value={d.avgOverall === null ? '–' : d.avgOverall + ' / 5'} />
      </div>
    </main>
  )
}
