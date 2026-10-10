'use client'

import { useEffect, useRef, useState } from 'react'
import './jee.css'

// Edit these when the first event is decided.
const EVENT = { name: 'First live mock', when: 'Date to be announced', price: 'Price announced with the event' }

const QS = [
  { s: 'Physics', q: 'A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², the maximum height reached is', o: ['10 m', '20 m', '30 m', '40 m'] },
  { s: 'Chemistry', q: 'The number of moles in 36 g of water (molar mass 18 g/mol) is', o: ['1', '2', '3', '4'] },
  { s: 'Mathematics', q: 'The minimum value of f(x) = x² − 4x + 7 is', o: ['2', '3', '4', '7'] },
  { s: 'Physics', q: 'A 2 kg body accelerates at 3 m/s². The net force acting on it is', o: ['1.5 N', '5 N', '6 N', '9 N'] },
  { s: 'Mathematics', q: 'The value of sin 30° + cos 60° is', o: ['1/2', '1', '3/2', '2'] },
]
const PAL = Array.from({ length: 15 }, (_, i) => i)

function ExamDemo() {
  const [cur, setCur] = useState(0)
  const [ans, setAns] = useState<Record<number, number>>({})
  const [mk, setMk] = useState<number[]>([])
  const [seen, setSeen] = useState<number[]>([0])
  const [left, setLeft] = useState(3 * 3600)
  const [lock, setLock] = useState(false)
  useEffect(() => { const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000); return () => clearInterval(t) }, [])
  const go = (i: number) => { if (i >= QS.length) { setLock(true); return } setLock(false); setCur(i); setSeen((s) => (s.includes(i) ? s : [...s, i])) }
  const st = (i: number) => (!seen.includes(i) ? 'nv' : mk.includes(i) ? (ans[i] !== undefined ? 'am' : 'mk') : ans[i] !== undefined ? 'an' : 'na')
  const hh = String(Math.floor(left / 3600)).padStart(2, '0'), mm = String(Math.floor((left % 3600) / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const q = QS[cur]
  return (
    <div className="jx-exam" aria-label="Interactive exam interface preview">
      <div className="jx-exam-bar"><b>JEE-style mock · Paper 1</b><span className="jx-timer" aria-label="Time left">{hh}:{mm}:{ss}</span></div>
      <div className="jx-exam-body">
        <div className="jx-q">
          <div className="jx-qmeta"><span>{q.s}</span><span>Question {cur + 1}</span><em>Sample question</em></div>
          {lock ? <p className="jx-lock">That is the end of the preview. Join the list to take the full mock.</p> : <>
            <p className="jx-qtext">{q.q}</p>
            {q.o.map((o, i) => (
              <button key={o} className={`jx-opt${ans[cur] === i ? ' on' : ''}`} onClick={() => setAns({ ...ans, [cur]: i })}><i>{String.fromCharCode(65 + i)}</i>{o}</button>
            ))}</>}
          <div className="jx-qbtns">
            <button onClick={() => { setMk((m) => (m.includes(cur) ? m : [...m, cur])); go(cur + 1) }}>Mark for review &amp; next</button>
            <button onClick={() => { const { [cur]: _, ...r } = ans; void _; setAns(r) }}>Clear</button>
            <button className="pri" onClick={() => go(cur + 1)}>Save &amp; next</button>
          </div>
        </div>
        <div className="jx-pal">
          <div className="jx-grid">{PAL.map((i) => <button key={i} className={`jx-p ${st(i)}${cur === i && !lock ? ' cur' : ''}`} onClick={() => go(i)} aria-label={`Question ${i + 1}`}>{i + 1}</button>)}</div>
          <ul className="jx-leg"><li><i className="jx-p nv" />Not visited</li><li><i className="jx-p na" />Not answered</li><li><i className="jx-p an" />Answered</li><li><i className="jx-p mk" />Marked</li><li><i className="jx-p am" />Answered + marked</li></ul>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  ['Book a seat', 'Pick the next live mock and reserve your place.'],
  ['Take the mock', 'A timed, JEE-style paper. Your answers are saved as you go.'],
  ['Get your analysis', 'Subject breakdown, time per question and the questions you rushed or got stuck on.'],
  ['Fix what is weak', 'A short practice plan built from your own attempt.'],
]
const BARS = [['Physics', 64], ['Chemistry', 78], ['Mathematics', 70]] as const
const TIMES = [30, 55, 20, 80, 45, 95, 35, 60, 25, 70, 50, 90, 40, 65, 30, 85, 55, 45, 75, 35]
const FAQ = [
  ['Is this the official NTA test?', 'No. This is an independent practice platform with a JEE-style interface. It is not affiliated with or endorsed by the NTA.'],
  ['How are marks calculated?', 'Scoring follows the official marking scheme for the paper, and each event page states it before you start.'],
  ['Will you predict my rank?', 'Not at first. Honest rank estimates need a lot of real attempts, so we show accuracy, time and topic insights instead.'],
  ['What do you do with my email?', 'We only use it to tell you about JEE mock events. You can ask us to remove it at any time.'],
  ['I am under 18. Can I join?', 'Please ask a parent or guardian before joining the list.'],
]

function Waitlist() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const p = new URLSearchParams(window.location.search)
    setState('sending'); setMsg('')
    try {
      const r = await fetch('/api/jee/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        email: f.get('email'), exam: f.get('exam'), consent: f.get('consent') === 'on', website: f.get('website'),
        source: p.get('utm_source') || p.get('ref'), medium: p.get('utm_medium'), campaign: p.get('utm_campaign'),
      }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'Could not save that. Please try again.')
      setState('done')
    } catch (err) { setState('error'); setMsg(err instanceof Error ? err.message : 'Please try again.') }
  }
  if (state === 'done') return <p className="jx-done">You are on the list. We will email you before the first event.</p>
  return (
    <form className="jx-form" onSubmit={submit}>
      <input name="website" tabIndex={-1} autoComplete="off" className="jx-hp" aria-hidden="true" />
      <input name="email" type="email" required placeholder="you@example.com" aria-label="Email" maxLength={254} />
      <select name="exam" aria-label="Exam you are preparing for" defaultValue="JEE Main 2027 Session 1">
        <option>JEE Main 2027 Session 1</option><option>JEE Main 2027 Session 2</option><option>JEE Advanced 2027</option><option>Other</option>
      </select>
      <label className="jx-check"><input name="consent" type="checkbox" required />I agree to get emails about JEE mock events. If I am under 18, a parent or guardian knows I am signing up.</label>
      <button className="jx-cta" disabled={state === 'sending'}>{state === 'sending' ? 'Saving…' : 'Notify me'}</button>
      {state === 'error' && <p className="jx-err" role="alert">{msg}</p>}
    </form>
  )
}

export default function JeeLanding() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const els = root.current?.querySelectorAll('.jx-rv') ?? []
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <div className="jx" ref={root}>
      <header className="jx-nav"><a href="/" className="jx-brand">MatchMyInterview <span>· JEE</span></a><a href="#join" className="jx-navcta">Notify me</a></header>

      <section className="jx-hero">
        <i className="jx-blob b1" /><i className="jx-blob b2" />
        <div className="jx-wrap jx-herogrid">
          <div>
            <span className="jx-pill">JEE Main practice · opening soon</span>
            <h1>Practice JEE the way the exam <em>feels.</em></h1>
            <p className="jx-lead">Full-length mocks in a JEE-style interface, with a complete analysis after every attempt. Know exactly what to fix before the real day.</p>
            <div className="jx-hero-cta"><a href="#join" className="jx-cta">Notify me about the first event</a><a href="#report" className="jx-ghost">See a sample report</a></div>
            <p className="jx-small">Try the interface on the right. It is a sample, not a real paper.</p>
          </div>
          <ExamDemo />
        </div>
      </section>

      <section className="jx-sec"><div className="jx-wrap">
        <h2 className="jx-rv">How it works</h2>
        <div className="jx-steps">{STEPS.map(([t, d], i) => <div className="jx-step jx-rv" style={{ transitionDelay: `${i * 80}ms` }} key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec alt" id="report"><div className="jx-wrap">
        <h2 className="jx-rv">The analysis you get after every mock</h2>
        <p className="jx-sub jx-rv">This is a sample report with made-up numbers, shown to illustrate the layout.</p>
        <div className="jx-report jx-rv">
          <span className="jx-badge">Sample data for illustration</span>
          <div className="jx-rcols">
            <div><h3>Accuracy by subject</h3>{BARS.map(([n, v]) => <div className="jx-bar" key={n}><span>{n}</span><div><i style={{ ['--w' as string]: `${v}%` }} /></div><b>{v}%</b></div>)}</div>
            <div><h3>Time per question</h3><div className="jx-times">{TIMES.map((h, i) => <i key={i} className={i % 5 === 3 ? 'bad' : i % 7 === 2 ? 'skip' : 'ok'} style={{ ['--h' as string]: `${h}%` }} />)}</div><p className="jx-small">Green correct · red wrong · grey skipped</p></div>
            <div><h3>Slow but wrong</h3><ul className="jx-list"><li>Q23 · Rotational motion · 4m 10s</li><li>Q41 · Equilibrium · 3m 35s</li><li>Q58 · Definite integrals · 3m 20s</li></ul></div>
            <div><h3>Your practice plan</h3><ul className="jx-list"><li>Revise rotational motion basics, 20 questions</li><li>Timed set on equilibrium, 15 minutes</li><li>Re-attempt the three questions above</li></ul></div>
          </div>
        </div>
      </div></section>

      <section className="jx-sec"><div className="jx-wrap">
        <h2 className="jx-rv">Built to feel like the real thing</h2>
        <div className="jx-feats">{['Server-timed attempts', 'Answers saved automatically', 'Five-state question palette', 'Subject and topic breakdown', 'Time analysis per question', 'A plan for what to practice next'].map((f, i) => <div className="jx-feat jx-rv" style={{ transitionDelay: `${i * 60}ms` }} key={f}>{f}</div>)}</div>
      </div></section>

      <section className="jx-sec alt"><div className="jx-wrap jx-price jx-rv">
        <div><h2>{EVENT.name}</h2><p className="jx-sub">{EVENT.when} · {EVENT.price}</p><p className="jx-small">People on the list hear first and get first access.</p></div>
        <a href="#join" className="jx-cta">Join the list</a>
      </div></section>

      <section className="jx-sec"><div className="jx-wrap jx-narrow">
        <h2 className="jx-rv">Questions</h2>
        {FAQ.map(([q, a]) => <details className="jx-faq jx-rv" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></section>

      <section className="jx-sec join" id="join"><div className="jx-wrap jx-narrow jx-rv">
        <h2>Be first to know</h2>
        <p className="jx-sub">One email when the first mock opens. Nothing else.</p>
        <Waitlist />
      </div></section>

      <footer className="jx-foot"><div className="jx-wrap">
        <p>Built by an NIT Rourkela graduate.</p>
        <p className="jx-small">JEE and NTA are names of exams and an organisation unrelated to us. This is an independent practice platform, not affiliated with or endorsed by the NTA.</p>
        <p className="jx-small"><a href="/">MatchMyInterview</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
      </div></footer>
    </div>
  )
}
