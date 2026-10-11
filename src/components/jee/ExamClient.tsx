'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import MathText from './MathText'
import './exam.css'
import {
  OPTION_LETTERS,
  buildSections,
  countStates,
  deriveState,
  fmtClock,
  isMarked,
  sectionRules,
  stateOf,
  type ExamQuestion,
  type PState,
  type Rec,
} from '@/lib/jee/exam-shared'

type Props = {
  testId: string
  attemptId: string
  title: string
  studentName: string
  questions: ExamQuestion[]
  initial: Record<string, Rec>
  deadlineMs: number
  serverNowMs: number
}

type SaveItem = { questionId: string; response: string | null; state: PState; timeSpentMs: number; bookmarked: boolean }
type Panel = null | 'palette' | 'review' | 'info'
type Size = 's' | 'm' | 'l' | 'xl'

const EMPTY: Rec = { response: null, state: 'not_answered', timeMs: 0, bookmarked: false }
const LEGEND: { s: PState; label: string }[] = [
  { s: 'answered', label: 'Answered' },
  { s: 'not_answered', label: 'Not answered' },
  { s: 'not_visited', label: 'Not visited' },
  { s: 'marked', label: 'Marked for review' },
  { s: 'answered_marked', label: 'Answered and marked' },
]

export default function ExamClient(p: Props) {
  const router = useRouter()
  const questions = p.questions
  const sections = useMemo(() => buildSections(questions), [questions])
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions])
  // Display order: section by section, each in paper order.
  const order = useMemo(() => sections.flatMap((s) => s.ids), [sections])

  const [recs, setRecs] = useState<Record<string, Rec>>(p.initial)
  const recsRef = useRef<Record<string, Rec>>(p.initial)
  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState('')
  const [panel, setPanel] = useState<Panel>(null)
  const [size, setSize] = useState<Size>('m')
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [tick, setTick] = useState(0)

  const offset = useRef(p.serverNowMs - Date.now()) // server clock minus this device's clock
  const enteredAt = useRef(Date.now())
  const queue = useRef(new Map<string, SaveItem>())
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef(false)
  const done = useRef(false)

  const qid = order[idx]
  const q = byId.get(qid)!
  const section = sections.find((s) => s.ids.includes(qid))!
  const numberInSection = section.ids.indexOf(qid) + 1
  const remainingSec = Math.max(0, Math.round((p.deadlineMs - (Date.now() + offset.current)) / 1000))
  void tick

  // ---- autosave queue ----
  const flush = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) return false
    if (queue.current.size === 0) return true
    const batch = [...queue.current.values()].slice(0, 30)
    for (const it of batch) queue.current.delete(it.questionId)
    inFlight.current = true
    setSaveState('saving')
    try {
      const res = await fetch('/api/jee/exam/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: p.attemptId, items: batch }),
      })
      if (res.status === 409) {
        done.current = true
        router.replace(`/jee/test/${p.testId}/result`)
        return true
      }
      if (res.status === 400) {
        // The server will never accept this item; drop it instead of retrying forever.
        setSaveState(queue.current.size ? 'saving' : 'saved')
        return true
      }
      if (!res.ok) throw new Error(String(res.status))
      setSaveState(queue.current.size ? 'saving' : 'saved')
      return true
    } catch {
      for (const it of batch) if (!queue.current.has(it.questionId)) queue.current.set(it.questionId, it) // keep newer edits
      setSaveState('offline')
      return false
    } finally {
      inFlight.current = false
    }
  }, [p.attemptId, p.testId, router])

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void flush().then(() => {
        if (queue.current.size) schedule()
      })
    }, 450)
  }, [flush])

  const commit = useCallback(
    (id: string, patch: Partial<Rec>, addMs = 0) => {
      const prev = recsRef.current[id] ?? EMPTY
      const next: Rec = { ...prev, ...patch, timeMs: prev.timeMs + addMs }
      recsRef.current = { ...recsRef.current, [id]: next }
      setRecs(recsRef.current)
      queue.current.set(id, { questionId: id, response: next.response, state: next.state, timeSpentMs: next.timeMs, bookmarked: next.bookmarked })
      schedule()
    },
    [schedule],
  )

  const takeElapsed = () => {
    const now = Date.now()
    const ms = Math.min(now - enteredAt.current, 60 * 60 * 1000)
    enteredAt.current = now
    return ms
  }

  // ---- submit ----
  const submit = useCallback(
    async (auto = false) => {
      if (done.current && !auto) return
      setSubmitting(true)
      setSubmitError('')
      const id = order[idxRef.current]
      commit(id, {}, takeElapsed())
      if (timer.current) clearTimeout(timer.current)
      for (let i = 0; i < 3 && queue.current.size; i++) {
        if (await flush()) break
        await new Promise((r) => setTimeout(r, 600))
      }
      try {
        const res = await fetch('/api/jee/exam/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId: p.attemptId }) })
        if (!res.ok) throw new Error()
        done.current = true
        router.replace(`/jee/test/${p.testId}/result`)
      } catch {
        // When the clock forced this submit, wait a few seconds before the next automatic retry.
        setTimeout(() => setSubmitting(false), auto ? 4000 : 0)
        setSubmitError('Could not submit. Check your connection and try again. Your answers are saved.')
      }
    },
    [commit, flush, order, p.attemptId, p.testId, router],
  )

  const idxRef = useRef(0)
  useEffect(() => {
    idxRef.current = idx
  }, [idx])

  // ---- clock ----
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (remainingSec === 0 && !done.current && !submitting) void submit(true)
  }, [remainingSec, submitting, submit])

  // ---- entering a question: mark visited, load its saved answer into the draft ----
  useEffect(() => {
    const id = order[idx]
    if (!recsRef.current[id]) commit(id, { state: 'not_answered' })
    setDraft(recsRef.current[id]?.response ?? '')
    enteredAt.current = Date.now()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // ---- housekeeping: retry when back online, warn before closing the tab ----
  useEffect(() => {
    const online = () => void flush()
    const leave = (e: BeforeUnloadEvent) => {
      if (!done.current) e.preventDefault()
    }
    const hidden = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    window.addEventListener('online', online)
    window.addEventListener('beforeunload', leave)
    document.addEventListener('visibilitychange', hidden)
    const retry = setInterval(() => {
      if (queue.current.size) void flush()
    }, 6000)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('beforeunload', leave)
      document.removeEventListener('visibilitychange', hidden)
      clearInterval(retry)
    }
  }, [flush])

  // ---- actions ----
  const go = (i: number) => {
    if (i < 0 || i >= order.length || i === idx) return
    commit(qid, {}, takeElapsed()) // bank the time; an unsaved draft is dropped, as in the real exam
    setIdx(i)
    setPanel(null)
  }
  const advance = () => {
    if (idx < order.length - 1) setIdx(idx + 1)
    else enteredAt.current = Date.now()
  }
  // What would be saved: MCQ letters as-is; numbers only if they are a real number ("-" or "." alone count as blank).
  const response = ((): string | null => {
    const d = draft.trim()
    if (d === '') return null
    if (q.qtype === 'mcq') return d
    const n = d.endsWith('.') ? d.slice(0, -1) : d
    return /\d/.test(n) && Number.isFinite(Number(n)) ? n : null
  })()
  const wasMarked = isMarked(stateOf(recs[qid]))

  const saveNext = () => {
    commit(qid, { response, state: deriveState(response !== null, false) }, takeElapsed())
    advance()
  }
  const markNext = () => {
    commit(qid, { response, state: deriveState(response !== null, true) }, takeElapsed())
    advance()
  }
  const clearResp = () => {
    setDraft('')
    commit(qid, { response: null, state: deriveState(false, wasMarked) })
  }

  const jumpSection = (key: string) => {
    const s = sections.find((x) => x.key === key)
    if (s) go(order.indexOf(s.ids[0]))
  }

  const counts = useMemo(() => countStates(order, recs), [order, recs])
  const dirty = (recs[qid]?.response ?? '') !== (response ?? '')

  const pressKey = (k: string) => {
    if (k === 'back') return setDraft((d) => d.slice(0, -1))
    if (k === 'clear') return setDraft('')
    if (k === '-') return setDraft((d) => (d.startsWith('-') ? d.slice(1) : '-' + d))
    if (k === '.' && draft.includes('.')) return
    if (draft.length >= 12) return
    setDraft((d) => d + k)
  }

  const warn = remainingSec <= 300

  const palette = (
    <div className="ex-pal">
      <div className="ex-legend">
        {LEGEND.map((l) => (
          <div key={l.s} className="ex-leg">
            <span className={`pb pb-${l.s}`}>{counts[l.s]}</span>
            <span>{l.label}</span>
          </div>
        ))}
      </div>
      <div className="ex-pal-title">{section.label}</div>
      <div className="ex-pal-sub">Choose a question</div>
      <div className="ex-grid">
        {section.ids.map((id, i) => {
          const st = stateOf(recs[id])
          const cur = id === qid
          return (
            <button key={id} className={`pb pb-${st}${cur ? ' pb-cur' : ''}`} onClick={() => go(order.indexOf(id))} aria-label={`Question ${i + 1}, ${st.replace('_', ' ')}`}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={`ex ex-${size}`}>
      <header className="ex-top">
        <div className="ex-brand">
          <b>{p.title}</b>
          <span className={`ex-save ex-save-${saveState}`}>{saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Offline, retrying'}</span>
        </div>
        <div className={`ex-clock${warn ? ' warn' : ''}`} role="timer" aria-label="Time left">
          <small>Time left</small>
          <b>{fmtClock(remainingSec)}</b>
        </div>
        <div className="ex-tools">
          <label className="ex-size">
            <span>Text</span>
            <select value={size} onChange={(e) => setSize(e.target.value as Size)}>
              <option value="s">Small</option>
              <option value="m">Default</option>
              <option value="l">Large</option>
              <option value="xl">Extra large</option>
            </select>
          </label>
          <button className="ex-ghost" onClick={() => setPanel('info')}>Instructions</button>
          <button className="ex-ghost ex-hide-sm" onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen?.())}>Full screen</button>
          <button className="ex-submit-top" onClick={() => setPanel('review')}>Submit</button>
        </div>
      </header>

      <nav className="ex-secs" aria-label="Sections">
        {sections.map((s) => (
          <button key={s.key} className={s.key === section.key ? 'on' : ''} onClick={() => jumpSection(s.key)}>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="ex-body">
        <main className="ex-main">
          <div className="ex-qmeta">
            <span>Question {numberInSection} <i>of {section.ids.length}</i></span>
            <span className="ex-chip">{q.qtype === 'mcq' ? 'Single correct' : 'Numerical'}</span>
            <span className="ex-marks"><b>+{q.marks}</b> <u>{q.negative > 0 ? `-${q.negative}` : 'no negative'}</u></span>
          </div>

          <div className="ex-q">
            <MathText text={q.body} className="ex-qtext" />
            {q.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ex-img" src={q.image_url} alt="Diagram for this question" loading="lazy" />
            )}

            {q.qtype === 'mcq' ? (
              <div className="ex-opts" role="radiogroup" aria-label="Options">
                {(q.options ?? []).slice(0, 4).map((o, i) => {
                  const L = OPTION_LETTERS[i]
                  const on = draft === L
                  return (
                    <button key={L} role="radio" aria-checked={on} className={`ex-opt${on ? ' on' : ''}`} onClick={() => setDraft(L)}>
                      <span className="ex-letter">{L}</span>
                      <MathText text={o} />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="ex-num">
                <input
                  className="ex-numin"
                  value={draft}
                  inputMode="none"
                  placeholder="Type your answer"
                  aria-label="Numerical answer"
                  onChange={(e) => /^-?\d*\.?\d*$/.test(e.target.value) && setDraft(e.target.value.slice(0, 12))}
                />
                <div className="ex-keys">
                  {['7', '8', '9', 'back', '4', '5', '6', 'clear', '1', '2', '3', '-', '0', '.'].map((k) => (
                    <button key={k} className={`ex-key${k === 'back' || k === 'clear' ? ' fn' : ''}`} onClick={() => pressKey(k)}>
                      {k === 'back' ? '⌫' : k === 'clear' ? 'Clear' : k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {dirty && <p className="ex-hint">Not saved yet. Press Save &amp; Next to keep this answer.</p>}
        </main>

        <aside className="ex-side">
          <div className="ex-user">
            <span className="ex-avatar">{(p.studentName || 'S').trim().charAt(0).toUpperCase()}</span>
            <b>{p.studentName || 'Student'}</b>
          </div>
          {palette}
        </aside>
      </div>

      <footer className="ex-bar">
        <div className="ex-bar-l">
          <button className="ex-btn" onClick={markNext}>Mark for review &amp; next</button>
          <button className="ex-btn" onClick={clearResp}>Clear response</button>
        </div>
        <button className="ex-btn ex-pal-btn" onClick={() => setPanel('palette')}>
          <span aria-hidden>▦</span> Palette
        </button>
        <div className="ex-bar-r">
          <button className="ex-btn ex-prev" onClick={() => go(idx - 1)} disabled={idx === 0}>Back</button>
          <button className="ex-btn ex-primary" onClick={saveNext}>Save &amp; next</button>
        </div>
      </footer>

      {/* Mobile palette drawer */}
      <div className={`ex-drawer${panel === 'palette' ? ' open' : ''}`} onClick={() => setPanel(null)}>
        <div className="ex-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="ex-sheet-h">
            <b>Question palette</b>
            <button className="ex-ghost dark" onClick={() => setPanel(null)}>Close</button>
          </div>
          {palette}
          <button className="ex-btn ex-danger wide" onClick={() => setPanel('review')}>Submit test</button>
        </div>
      </div>

      {panel === 'review' && (
        <div className="ex-modal" onClick={() => !submitting && setPanel(null)}>
          <div className="ex-card" onClick={(e) => e.stopPropagation()}>
            <h2>Review before you submit</h2>
            <div className="ex-scroll">
              <table className="ex-table">
                <thead>
                  <tr><th>Section</th><th>Qs</th><th>Answered</th><th>Not answered</th><th>Marked</th><th>Ans + marked</th><th>Not visited</th></tr>
                </thead>
                <tbody>
                  {sections.map((s) => {
                    const c = countStates(s.ids, recs)
                    return (
                      <tr key={s.key}>
                        <td>{s.label}</td><td>{s.ids.length}</td><td>{c.answered}</td><td>{c.not_answered}</td><td>{c.marked}</td><td>{c.answered_marked}</td><td>{c.not_visited}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="ex-note">Only answers you saved with Save &amp; next are marked. You cannot change anything after submitting.</p>
            {submitError && <p className="ex-err">{submitError}</p>}
            <div className="ex-row">
              <button className="ex-btn" disabled={submitting} onClick={() => setPanel(null)}>No, go back</button>
              <button className="ex-btn ex-danger" disabled={submitting} onClick={() => void submit()}>{submitting ? 'Submitting…' : 'Yes, submit the test'}</button>
            </div>
          </div>
        </div>
      )}

      {panel === 'info' && (
        <div className="ex-modal" onClick={() => setPanel(null)}>
          <div className="ex-card" onClick={(e) => e.stopPropagation()}>
            <h2>Instructions</h2>
            <div className="ex-scroll">
              <h3>{section.label}</h3>
              <ul>{sectionRules(section).bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <ul className="ex-scheme">{sectionRules(section).scheme.map((b) => <li key={b}>{b}</li>)}</ul>
              <h3>Buttons</h3>
              <ul>
                <li><b>Save &amp; next</b> stores your answer and moves on.</li>
                <li><b>Mark for review &amp; next</b> flags the question. If it also has an answer, that answer is still marked.</li>
                <li><b>Clear response</b> removes your answer.</li>
                <li>Switch sections or questions any time using the tabs and palette.</li>
              </ul>
            </div>
            <div className="ex-row"><button className="ex-btn ex-primary" onClick={() => setPanel(null)}>Back to the paper</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
