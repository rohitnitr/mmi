'use client'

import { useCallback, useEffect, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import { DIMENSIONS, type Scores } from '@/lib/evaluation-config'
import { ProgressChip } from '@/components/ProgressViews'

export type PendingItem = {
  sessionId: string
  peerUsername: string
  startedAt: string
  endedAt: string | null
  skills: string[]
}
type SkillRow = { skill: string; rating_count: number; evaluator_count: number; avg_rating: number; is_validated: boolean }
type RecentEval = { id: string; created_at: string; overall: number; strengths: string | null; improvements: string | null }
type Received = { count: number; averages: Scores | null; recent: RecentEval[]; skills: SkillRow[] }

export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const sb = getClient()
  if (!sb) throw new Error('Not connected. Refresh the page.')
  const { data } = await sb.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please log in again.')
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
}

const day = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '')

function RatingRow({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="ec-row">
      <div className="ec-row-text">
        <span className="ec-row-label">{label}</span>
        {hint && <span className="ec-row-hint">{hint}</span>}
      </div>
      <div className="ec-scale" role="group" aria-label={`${label}, 1 to 5`}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" className={`ec-pip${value === n ? ' is-on' : ''}`} aria-pressed={value === n} onClick={() => onChange(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EvaluationForm({ item, onClose, onDone, cancelLabel = 'Cancel' }: { item: PendingItem; onClose: () => void; onDone: () => void; cancelLabel?: string }) {
  const [scores, setScores] = useState<Partial<Scores>>({})
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const ready = DIMENSIONS.every(d => scores[d.key])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    setBusy(true)
    setErr('')
    try {
      const res = await authedFetch('/api/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: item.sessionId,
          scores,
          strengths,
          improvements,
          skills: Object.entries(skillRatings).map(([skill, rating]) => ({ skill, rating })),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.detail ? `${json.error || 'Could not save your evaluation.'} (${json.detail})` : json.error || 'Could not save your evaluation.')
      onDone()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save your evaluation.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ec-overlay" onClick={onClose}>
      <div className="ec-modal" role="dialog" aria-modal="true" aria-label={`Evaluate ${item.peerUsername}`} onClick={e => e.stopPropagation()}>
        <div className="ec-modal-head">
          <div>
            <h3>Evaluate {item.peerUsername}</h3>
            <p>Session on {day(item.startedAt)}. Your ratings are private to them, and your name is not shown.</p>
          </div>
          <button type="button" className="ec-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {item.skills.length > 0 ? (
          <div className="ec-section">
            <h4>{item.peerUsername}&apos;s skills</h4>
            <p className="ec-note">Rate the skills you saw in your conversation. Tap a score again to clear it.</p>
            {item.skills.map(skill => (
              <RatingRow
                key={skill}
                label={skill}
                value={skillRatings[skill] ?? 0}
                onChange={n => setSkillRatings(r => (r[skill] === n ? Object.fromEntries(Object.entries(r).filter(([k]) => k !== skill)) : { ...r, [skill]: n }))}
              />
            ))}
          </div>
        ) : (
          <div className="ec-section">
            <h4>Skills</h4>
            <p className="ec-note">{item.peerUsername} has not added any skills to their profile yet.</p>
          </div>
        )}

        <div className="ec-section">
          <h4>How did they do?</h4>
          {DIMENSIONS.map(d => (
            <RatingRow key={d.key} label={d.label} hint={d.hint} value={scores[d.key] ?? 0} onChange={n => setScores(s => ({ ...s, [d.key]: n }))} />
          ))}
        </div>

        <div className="ec-section">
          <label className="ec-field">
            <span>What went well</span>
            <textarea rows={3} maxLength={1000} value={strengths} onChange={e => setStrengths(e.target.value)} />
          </label>
          <label className="ec-field">
            <span>What to improve</span>
            <textarea rows={3} maxLength={1000} value={improvements} onChange={e => setImprovements(e.target.value)} />
          </label>
        </div>

        {err && <p className="ec-error" role="alert">{err}</p>}
        <div className="ec-actions">
          {!ready && <span className="ec-hint">Rate all five areas to save.</span>}
          <button type="button" className="ec-btn ec-btn-quiet" onClick={onClose}>{cancelLabel}</button>
          <button type="button" className="ec-btn ec-btn-main" disabled={!ready || busy} onClick={submit}>
            {busy ? 'Saving…' : 'Save evaluation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EvaluationCenter() {
  const [pending, setPending] = useState<PendingItem[]>([])
  const [received, setReceived] = useState<Received | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [active, setActive] = useState<PendingItem | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([authedFetch('/api/evaluations/pending'), authedFetch('/api/evaluations')])
      if (!p.ok || !r.ok) throw new Error('Could not load evaluations. Try again in a moment.')
      const pj = await p.json()
      const rj = await r.json()
      setPending(pj.pending ?? [])
      setReceived(rj)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load evaluations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <section className="ec" aria-label="Peer evaluations">
      <style>{CSS}</style>
      <h3 className="ec-title">Peer evaluations</h3>
<a href="/reports" style={{ fontSize: 13, marginLeft: 12, textDecoration: "underline" }}>View full reports →</a>
<ProgressChip />
      {loading && <p className="ec-note">Loading…</p>}
      {error && <p className="ec-error" role="alert">{error}</p>}
      {notice && <p className="ec-ok" role="status">{notice}</p>}

      {!loading && !error && (
        <>
          <div className="ec-block">
            <h4>Waiting for your evaluation</h4>
            {pending.length === 0 ? (
              <p className="ec-note">Nothing waiting. After a session ends, rate your peer here.</p>
            ) : (
              <ul className="ec-list">
                {pending.map(p => (
                  <li key={p.sessionId}>
                    <span>{p.peerUsername} <em>{day(p.startedAt)}</em></span>
                    <button type="button" className="ec-btn ec-btn-main" onClick={() => { setNotice(''); setActive(p) }}>Evaluate</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ec-block">
            <h4>Feedback you received</h4>
            {!received || received.count === 0 ? (
              <p className="ec-note">No evaluations yet. They appear here after a peer rates one of your sessions.</p>
            ) : (
              <>
                <p className="ec-note">{received.count} evaluation{received.count === 1 ? '' : 's'}</p>
                {received.averages && DIMENSIONS.map(d => (
                  <div className="ec-bar" key={d.key}>
                    <span>{d.label}</span>
                    <div className="ec-track"><div className="ec-fill" style={{ width: `${((received.averages?.[d.key] ?? 0) / 5) * 100}%` }} /></div>
                    <b>{received.averages?.[d.key]}</b>
                  </div>
                ))}
                {received.skills.length > 0 && (
                  <div className="ec-skills">
                    {received.skills.map(s => (
                      <span key={s.skill} className={`ec-chip${s.is_validated ? ' is-valid' : ''}`} title={`${s.rating_count} rating${s.rating_count === 1 ? '' : 's'} from ${s.evaluator_count} peer${s.evaluator_count === 1 ? '' : 's'}`}>
                        {s.skill} · {Number(s.avg_rating).toFixed(1)}{s.is_validated ? ' · peer-validated' : ''}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="ec-feed">
                  {received.recent.filter(e => e.strengths || e.improvements).map(e => (
                    <li key={e.id}>
                      <span className="ec-feed-meta">A peer · {day(e.created_at)} · overall {e.overall}/5</span>
                      {e.strengths && <p><b>Went well:</b> {e.strengths}</p>}
                      {e.improvements && <p><b>To improve:</b> {e.improvements}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}

      {active && (
        <EvaluationForm
          item={active}
          onClose={() => setActive(null)}
          onDone={() => { setActive(null); setNotice('Evaluation saved. Thank you.'); void load() }}
        />
      )}
    </section>
  )
}

export const CSS = `
.ec,.ec-overlay{--ec-accent:#2563EB;--ec-ok:#16a34a;--ec-line:rgba(127,127,127,.28);--ec-soft:rgba(127,127,127,.08)}
.ec{margin-top:16px;padding:16px;border:1px solid var(--ec-line,rgba(127,127,127,.28));border-radius:12px;text-align:left}
.ec h3,.ec h4{margin:0}
.ec-title{font-size:16px;font-weight:700;margin-bottom:10px!important}
.ec-block{margin-top:14px}
.ec-block h4{font-size:13px;font-weight:600;margin-bottom:6px!important}
.ec-note{font-size:12.5px;opacity:.7;margin:4px 0}
.ec-right{text-align:right}
.ec-error{font-size:13px;color:#dc2626;margin:8px 0}
.ec-ok{font-size:13px;color:#16a34a;margin:8px 0}
.ec-list,.ec-feed{list-style:none;margin:0;padding:0}
.ec-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--ec-line,rgba(127,127,127,.28));font-size:14px}
.ec-list em{font-style:normal;opacity:.6;font-size:12.5px;margin-left:6px}
.ec-btn{border:0;border-radius:8px;padding:8px 14px;font-size:13.5px;font-weight:600;cursor:pointer;min-height:36px}
.ec-btn-main{background:var(--ec-accent,#2563EB);color:#fff}
.ec-btn-main:disabled{opacity:.45;cursor:not-allowed}
.ec-btn-quiet{background:transparent;color:inherit;border:1px solid var(--ec-line,rgba(127,127,127,.28))}
.ec-btn:focus-visible,.ec-pip:focus-visible,.ec-x:focus-visible{outline:2px solid var(--ec-accent,#2563EB);outline-offset:2px}
.ec-bar{display:grid;grid-template-columns:130px 1fr 32px;align-items:center;gap:8px;font-size:13px;margin:5px 0}
.ec-track{height:6px;border-radius:99px;background:var(--ec-soft,rgba(127,127,127,.08));overflow:hidden}
.ec-fill{height:100%;background:var(--ec-accent,#2563EB);border-radius:99px;transition:width .5s ease}
.ec-skills{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.ec-chip{font-size:12px;padding:4px 9px;border-radius:99px;border:1px solid var(--ec-line,rgba(127,127,127,.28))}
.ec-chip.is-valid{border-color:#16a34a;color:#16a34a;font-weight:600}
.ec-feed li{border-top:1px solid var(--ec-line,rgba(127,127,127,.28));padding:9px 0;font-size:13.5px}
.ec-feed p{margin:4px 0}
.ec-feed-meta{font-size:12px;opacity:.65}
.ec-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.ec-modal{overscroll-behavior:contain;background:#fff;color:#0F172A;width:100%;max-width:560px;max-height:90vh;overflow:auto;border-radius:14px;padding:20px}
.ec-modal h3{font-size:18px}
.ec-modal p{margin:4px 0 0;font-size:13px;color:#475569}
.ec-modal-head{display:flex;justify-content:space-between;gap:12px}
.ec-x{border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#475569;min-width:36px;min-height:36px}
.ec-section{margin-top:16px;padding-top:14px;border-top:1px solid #E2E8F0}
.ec-section h4{font-size:14px;font-weight:600}
.ec-modal .ec-note{color:#64748B}
.ec-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;flex-wrap:wrap}
.ec-row-text{display:flex;flex-direction:column;min-width:0}
.ec-row-label{font-size:14px;font-weight:500}
.ec-row-hint{font-size:12px;color:#64748B}
.ec-scale{display:flex;gap:6px}
.ec-pip{width:38px;height:38px;border-radius:8px;border:1px solid #CBD5E1;background:#fff;color:#0F172A;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.ec-pip:hover{border-color:var(--ec-accent,#2563EB)}
.ec-pip.is-on{background:var(--ec-ok,#16a34a);border-color:var(--ec-ok,#16a34a);color:#fff}
.ec-field{display:block;margin-top:10px}
.ec-field span{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
.ec-field textarea{width:100%;border:1px solid #CBD5E1;border-radius:8px;padding:8px 10px;font:inherit;font-size:14px;color:#0F172A;background:#fff;resize:vertical}
.ec-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;position:sticky;bottom:0;margin:16px -20px -20px;padding:12px 20px;background:#fff;border-top:1px solid #E2E8F0}
.ec-hint{margin-right:auto;font-size:12.5px;color:#64748B}
@media (max-width:480px){.ec-bar{grid-template-columns:100px 1fr 28px}}
@media (prefers-reduced-motion:reduce){.ec-fill,.ec-pip{transition:none}}
`
