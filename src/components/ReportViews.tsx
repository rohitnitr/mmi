'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authedFetch } from '@/components/EvaluationCenter'

const DIMS: [string, string][] = [
  ['communication', 'Communication'],
  ['structure', 'Structure'],
  ['knowledge', 'Knowledge'],
  ['problem_solving', 'Problem solving'],
  ['overall', 'Overall'],
]
const wrap: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '24px 16px 64px' }
const card: React.CSSProperties = { border: '1px solid rgba(128,128,128,.28)', borderRadius: 14, padding: 20, marginTop: 16 }
const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 }
const btn: React.CSSProperties = {
  display: 'inline-block', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(128,128,128,.4)',
  background: 'transparent', color: 'inherit', fontSize: 14, cursor: 'pointer', textDecoration: 'none',
}

function Bar({ value }: { value: number }) {
  return (
    <div aria-hidden style={{ height: 8, borderRadius: 99, background: 'rgba(128,128,128,.22)', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: (value / 5) * 100 + '%', height: '100%', background: '#16a34a', borderRadius: 99 }} />
    </div>
  )
}
const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function ReportList() {
  const [items, setItems] = useState<any[] | null>(null)
  useEffect(() => {
    try { localStorage.setItem('mmi_reports_seen', String(Date.now())) } catch {}
  }, [])
  const [err, setErr] = useState('')
  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await authedFetch('/api/evaluations/report')
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'Could not load reports.')
        if (on) setItems(j.items || [])
      } catch (e: any) {
        if (on) setErr(e.message || 'Could not load reports.')
      }
    })()
    return () => { on = false }
  }, [])

  return (
    <main style={wrap}>
      <Link href="/" style={muted}>← Back to MatchMyInterview</Link>
      <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>Your interview reports</h1>
      <p style={muted}>Private. Only you can see these. Evaluators are shown as "A peer".</p>
      {err && <p role="alert" style={{ color: '#dc2626' }}>{err}</p>}
      {!err && items === null && <p style={muted}>Loading…</p>}
      {items && items.length === 0 && (
        <div style={card}>No evaluations yet. After a peer evaluates you, your report appears here.</div>
      )}
      {items && items.map((it: any) => (
        <Link key={it.id} href={'/report/' + it.id} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Overall {it.overall} / 5</strong>
            <span style={muted}>{fmt(it.created_at)}</span>
          </div>
          {it.strengths && <p style={{ ...muted, margin: '6px 0 0' }}>{String(it.strengths).slice(0, 140)}</p>}
        </Link>
      ))}
    </main>
  )
}

export function ReportDetail({ id }: { id: string }) {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await authedFetch('/api/evaluations/report?id=' + encodeURIComponent(id))
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'Could not load this report.')
        if (on) setD(j)
      } catch (e: any) {
        if (on) setErr(e.message || 'Could not load this report.')
      }
    })()
    return () => { on = false }
  }, [id])

  if (err) return <main style={wrap}><p role="alert" style={{ color: '#dc2626' }}>{err}</p><Link href="/reports">← All reports</Link></main>
  if (!d) return <main style={wrap}><p style={muted}>Loading…</p></main>

  const ev = d.evaluation
  const shareUrl = d.isPublic && d.username && typeof window !== 'undefined' ? window.location.origin + '/u/' + d.username : ''
  const linkedin = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl)

  return (
    <main style={wrap}>
      <style>{'@media print{.no-print{display:none !important}}'}</style>
      <div className="no-print"><Link href="/reports" style={muted}>← All reports</Link></div>
      <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>Interview report</h1>
      <p style={muted}>{fmt(ev.created_at)} · Evaluated by a peer</p>

      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{ev.scores.overall} <span style={{ fontSize: 18, opacity: 0.6 }}>/ 5</span></div>
        <div style={muted}>Overall{d.count > 1 ? ' · your average across ' + d.count + ' evaluations is ' + d.averages.overall : ''}</div>
      </div>

      <section style={card}>
        <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>Scores</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {DIMS.map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
              <span style={{ width: 130 }}>{label}</span>
              <Bar value={ev.scores[k]} />
              <span style={{ width: 28, textAlign: 'right' }}>{ev.scores[k]}</span>
              {d.count > 1 && <span style={{ ...muted, width: 70, textAlign: 'right' }}>avg {d.averages[k]}</span>}
            </div>
          ))}
        </div>
      </section>

      {d.skills.length > 0 && (
        <section style={card}>
          <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>Skill ratings</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {d.skills.map((s: any) => (
              <span key={s.skill} style={{ border: '1px solid rgba(128,128,128,.4)', borderRadius: 99, padding: '4px 12px', fontSize: 14 }}>
                {s.skill} · {s.rating}/5
              </span>
            ))}
          </div>
        </section>
      )}

      {ev.strengths && (
        <section style={card}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>What went well</h2>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ev.strengths}</p>
        </section>
      )}
      {ev.improvements && (
        <section style={card}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>What to improve</h2>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ev.improvements}</p>
          <p style={{ ...muted, margin: '8px 0 0' }}>Private: this is never shown on your public profile.</p>
        </section>
      )}

      <section style={card} className="no-print">
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>Share</h2>
        {shareUrl ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" style={btn}>Share on LinkedIn</a>
            <button type="button" style={btn} onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true) }}>
              {copied ? 'Link copied' : 'Copy profile link'}
            </button>
            <button type="button" style={btn} onClick={() => window.print()}>Print / save as PDF</button>
          </div>
        ) : (
          <>
            <p style={{ ...muted, marginTop: 0 }}>
              This shares your public profile (not this private report). Your profile is currently private. Make it public in your professional profile settings to enable sharing.
            </p>
            <button type="button" style={btn} onClick={() => window.print()}>Print / save as PDF</button>
          </>
        )}
      </section>
    </main>
  )
}
