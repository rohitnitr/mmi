'use client'

import { useEffect, useState } from 'react'
import { getClient } from '@/lib/supabase/client'

const PRICE = { mock: 11, analysis: 49 }

const FEATURES: [string, string][] = [
  ['An exam screen you already know', 'Question palette, section tabs and a countdown, laid out like the JEE Main computer-based test, so test day feels familiar.'],
  ['Clock kept by our server', 'Your time is counted on the server. A refresh or a weak connection never adds or removes a minute.'],
  ['Autosave, resume anywhere', 'Every answer is saved as you go. Lose signal, reopen the link, and you continue from the same question.'],
  ['Mistake analyzer', 'Each wrong answer is tagged to its chapter and topic, and sorted into silly slips, concept gaps and guesses.'],
  ['Time on every question', 'See where you rushed, where you stalled, and which answers were slow and still wrong.'],
  ['Rank and percentile, nationwide', 'Your marks ranked against every student who sat the same mock, from any city.'],
  ['National leaderboard', 'Climb the board for each mock. Show your name or stay hidden, you choose.'],
  ['Revision notebook', 'Bookmark any question during or after the test and revisit it by topic.'],
  ['Progress tracker', 'Marks, accuracy and percentile across all your attempts, in one view.'],
  ['Full, sectional and chapter tests', 'Sit a three-hour paper, or drill one subject or one chapter when time is short.'],
]
const STEPS: [string, string][] = [
  ['Enter your email', 'Tap the link we send. No password, no long form.'],
  ['Pick a mock', `Each full mock costs ₹${PRICE.mock}. The marking scheme is shown before you begin.`],
  ['Sit the paper', 'Three subjects, one timer, autosave on. Submit when you are done or when time runs out.'],
  ['Open your analysis', `Add the full analysis for ₹${PRICE.analysis}: mistakes, time per question, topic map.`],
  ['Compare and improve', 'Check your rank, your percentile and the leaderboard, then fix the weak topics.'],
]
const FAQ: [string, string][] = [
  ['Is this the official NTA exam?', 'No. This is an independent practice platform. JEE and NTA are names of an exam and an organisation we are not affiliated with.'],
  ['What do I get for ₹11?', 'One full-length mock attempt with server-timed autosave, your marks, rank, percentile and leaderboard access.'],
  ['What does ₹49 add?', 'Everything above plus the full analysis: every mistake mapped to chapter and topic, time spent on each question, slow-but-wrong questions, and a short practice plan.'],
  ['How are rank and percentile worked out?', 'Among all students on this platform who submitted the same mock. It is a practice ranking, not an NTA All India Rank.'],
  ['What if my internet drops?', 'Answers are saved as you go and the timer runs on our server. Reconnect and carry on. The deadline does not move.'],
  ['Can I hide my name on the leaderboard?', 'Yes. Your name is hidden unless you switch it on.'],
  ['Which devices work?', 'A laptop or desktop is best for a full paper. Phones and tablets work for sectional and chapter tests.'],
  ['I am under 18. Can I join?', 'Please use the platform with a parent or guardian\'s knowledge and consent.'],
]
const PALETTE = ['a', 'a', 'n', 'm', 'a', 'v', 'a', 'n', 'am', 'a', 'a', 'v']
const SAMPLE_BOARD: [string, string, number, string][] = [['#1', 'Student A', 248, '99.4'], ['#2', 'Student B', 241, '98.7'], ['#3', 'Student C', 236, '97.9'], ['#4', 'You', 221, '94.2'], ['#5', 'Student D', 214, '92.5']]
const SAMPLE_TIME = [1, 2, 1, 3, 2, 1, 4, 2, 1, 1, 3, 2, 5, 1, 2, 1, 2, 3, 1, 2]

function StartForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  const [err, setErr] = useState('')
  async function go(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault()
    const c = getClient()
    if (!c) return setErr('Not connected. Refresh the page.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter a valid email address.')
    setState('busy'); setErr('')
    const { error } = await c.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + '/jee/auth/callback' } })
    if (error) { setState('idle'); return setErr('Could not send the link. Try again in a minute.') }
    setState('sent')
  }
  if (state === 'sent') return <p id={id} className="jx-ok">Link sent to {email}. Open it to start.</p>
  return (
    <div id={id} className="jx-form">
      <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') go(e) }} aria-label="Email" />
      <button onClick={go} disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Get started'}</button>
      {err && <span className="jx-err" role="alert">{err}</span>}
    </div>
  )
}

function ExamPreview() {
  const [sec, setSec] = useState(10799)
  const [pick, setPick] = useState<number | null>(null)
  const [lit, setLit] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSec(s => (s > 0 ? s - 1 : 0)), 1000)
    const p = setInterval(() => setLit(n => (n < PALETTE.length ? n + 1 : n)), 260)
    return () => { clearInterval(t); clearInterval(p) }
  }, [])
  const hh = String(Math.floor(sec / 3600)).padStart(2, '0'), mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0')
  return (
    <div className="jx-exam" aria-label="Sample exam screen">
      <div className="jx-exam-top"><span>JEE-style mock · Paper 1</span><b>{hh}:{mm}:{ss}</b></div>
      <div className="jx-exam-body">
        <div>
          <p className="jx-q-meta">Physics · Question 1 · sample question</p>
          <p className="jx-q">A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², the maximum height reached is</p>
          {['10 m', '20 m', '30 m', '40 m'].map((o, i) => (
            <button key={o} className={'jx-opt' + (pick === i ? ' on' : '')} onClick={() => setPick(i)}><i>{'ABCD'[i]}</i>{o}</button>
          ))}
          <div className="jx-exam-actions"><button>Mark for review &amp; next</button><button onClick={() => setPick(null)}>Clear</button><button className="p">Save &amp; next</button></div>
        </div>
        <div className="jx-pal">
          {PALETTE.map((s, i) => <span key={i} className={'c-' + (i < lit ? s : 'x')}>{i + 1}</span>)}
          <p>Answered · Not answered · Marked · Not visited</p>
        </div>
      </div>
    </div>
  )
}

export default function JeeLandingPage() {
  const [open, setOpen] = useState<number | null>(0)
  const to = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div className="jx">
      <style>{CSS}</style>
      <header className="jx-nav">
        <b>MatchMyInterview <span>JEE</span></b>
        <nav><button onClick={to('features')}>Features</button><button onClick={to('how')}>How it works</button><button onClick={to('pricing')}>Pricing</button><button onClick={to('faq')}>FAQ</button></nav>
        <button className="jx-cta" onClick={to('start')}>Get started</button>
      </header>

      <section className="jx-hero">
        <div>
          <p className="jx-tag">JEE Main mocks · from ₹{PRICE.mock}</p>
          <h1>Sit the paper. See exactly where your marks went.</h1>
          <p className="jx-sub">Full-length JEE-style mocks on a real exam screen, with your marks, your rank across the country, and a mistake-by-mistake report that shows the time you spent on every question.</p>
          <StartForm id="start" />
          <p className="jx-fine">₹{PRICE.mock} per mock · ₹{PRICE.analysis} with full analysis · No password</p>
        </div>
        <ExamPreview />
      </section>

      <section className="jx-sec" id="features">
        <h2>Everything a serious mock should give you</h2>
        <div className="jx-grid">{FEATURES.map(([t, d]) => <article key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="jx-sec alt" id="how">
        <h2>From email to analysis in five steps</h2>
        <ol className="jx-steps">{STEPS.map(([t, d], i) => <li key={t}><b>{i + 1}</b><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>
      </section>

      <section className="jx-sec" id="pricing">
        <h2>Two prices. Nothing hidden.</h2>
        <div className="jx-price">
          <article><h3>Mock test</h3><p className="amt">₹{PRICE.mock}<small> per mock</small></p>
            <ul><li>Full-length JEE-style mock</li><li>Server-timed, autosaved attempt</li><li>Marks, rank and percentile</li><li>Country-wide leaderboard</li></ul><button onClick={to('start')}>Get started</button></article>
          <article className="hot"><h3>Mock + full analysis</h3><p className="amt">₹{PRICE.analysis}<small> per mock</small></p>
            <ul><li>Everything in Mock test</li><li>Every mistake by chapter and topic</li><li>Time spent on each question</li><li>Slow-but-wrong list and practice plan</li></ul><button onClick={to('start')}>Get started</button></article>
        </div>
      </section>

      <section className="jx-sec alt">
        <h2>A report that points at what to fix</h2>
        <p className="jx-label">Sample data for illustration</p>
        <div className="jx-report">
          <div><h3>Accuracy by subject</h3>{[['Physics', 64], ['Chemistry', 78], ['Mathematics', 70]].map(([s, v]) => <div key={s} className="bar"><span>{s}</span><i style={{ width: v + '%' }} /><b>{v}%</b></div>)}</div>
          <div><h3>Seconds-per-question profile</h3><div className="spark">{SAMPLE_TIME.map((v, i) => <i key={i} style={{ height: v * 18 + 'px' }} className={i % 5 === 3 ? 'w' : ''} />)}</div><p className="jx-fine">Tall bars are slow questions. Red ones were slow and still wrong.</p></div>
        </div>
      </section>

      <section className="jx-sec">
        <h2>Know where you stand in the country</h2>
        <p className="jx-label">Sample data for illustration</p>
        <table className="jx-table"><thead><tr><th>Rank</th><th>Student</th><th>Marks</th><th>Percentile</th></tr></thead>
          <tbody>{SAMPLE_BOARD.map(r => <tr key={r[0]} className={r[1] === 'You' ? 'me' : ''}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table>
        <p className="jx-fine">Ranking is among students on this platform who sat the same mock.</p>
      </section>

      <section className="jx-sec alt" id="faq">
        <h2>Questions, answered</h2>
        <div className="jx-faq">{FAQ.map(([q, a], i) => (
          <div key={q}><button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}<span>{open === i ? '−' : '+'}</span></button>{open === i && <p>{a}</p>}</div>
        ))}</div>
      </section>

      <section className="jx-final"><h2>Your first mock is ₹{PRICE.mock} away</h2><StartForm /></section>
      <footer className="jx-foot">
        <p>JEE and NTA are names of an exam and an organisation unrelated to us. This is an independent practice platform, not affiliated with or endorsed by the NTA.</p>
        <p>MatchMyInterview · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p>
      </footer>
    </div>
  )
}

const CSS = `
.jx{--ink:#0B1F4B;--blue:#1D4ED8;--line:#D9E1F2;--bg:#F5F8FF;background:#fff;color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.55}
.jx h1,.jx h2{font-family:"Iowan Old Style","Palatino Linotype",Georgia,serif;letter-spacing:-.01em;line-height:1.12}
.jx button{font:inherit;cursor:pointer}
.jx-nav{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:20px;padding:12px 5vw;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.jx-nav b span{color:var(--blue)}.jx-nav nav{display:flex;gap:4px;margin-left:auto}.jx-nav nav button{background:none;border:0;padding:6px 10px;color:var(--ink)}
.jx-cta,.jx-form button,.jx-price button{background:var(--blue);color:#fff;border:0;border-radius:8px;padding:10px 18px;font-weight:600}
.jx-hero{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;align-items:center;padding:56px 5vw;background:var(--bg)}
.jx-tag{display:inline-block;margin:0 0 12px;padding:4px 12px;border:1px solid var(--line);border-radius:99px;background:#fff;font-size:13px}
.jx-hero h1{font-size:clamp(32px,5vw,52px);margin:0 0 14px}.jx-sub{font-size:18px;max-width:52ch;margin:0 0 20px}
.jx-form{display:flex;flex-wrap:wrap;gap:8px;max-width:460px}.jx-form input{flex:1;min-width:200px;padding:11px 14px;border:1px solid var(--line);border-radius:8px;font:inherit}
.jx-err{width:100%;color:#B91C1C;font-size:14px}.jx-ok{padding:12px 16px;border-radius:8px;background:#DCFCE7;max-width:460px}.jx-fine{font-size:13px;opacity:.7}
.jx-exam{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 24px 50px -28px rgba(11,31,75,.45);overflow:hidden}
.jx-exam-top{display:flex;justify-content:space-between;padding:10px 16px;background:var(--ink);color:#fff;font-size:14px}.jx-exam-top b{font-variant-numeric:tabular-nums}
.jx-exam-body{display:grid;grid-template-columns:1fr 150px;gap:16px;padding:16px}@media(max-width:560px){.jx-exam-body{grid-template-columns:1fr}}
.jx-q-meta{font-size:12px;opacity:.65;margin:0 0 6px}.jx-q{margin:0 0 12px;font-weight:600}
.jx-opt{display:flex;gap:10px;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink)}
.jx-opt i{font-style:normal;font-weight:700;color:var(--blue)}.jx-opt.on{border-color:var(--blue);background:#EEF3FF}
.jx-exam-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.jx-exam-actions button{padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:#fff;font-size:13px}.jx-exam-actions .p{background:var(--blue);border-color:var(--blue);color:#fff}
.jx-pal{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;align-content:start}.jx-pal span{display:grid;place-items:center;height:30px;border-radius:6px;font-size:13px;color:#fff;transition:background .3s}
.jx-pal p{grid-column:1/-1;font-size:11px;opacity:.65;margin:6px 0 0}
.c-x{background:#CBD5E1;color:var(--ink)!important}.c-a{background:#16A34A}.c-n{background:#DC2626}.c-m{background:#7C3AED}.c-v{background:#CBD5E1;color:var(--ink)!important}.c-am{background:#7C3AED;box-shadow:inset 0 0 0 3px #16A34A}
.jx-sec{padding:64px 5vw}.jx-sec.alt{background:var(--bg)}.jx-sec h2{font-size:clamp(26px,3.4vw,36px);margin:0 0 24px}
.jx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.jx-grid article{padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.jx-grid h3,.jx-steps h3{margin:0 0 6px;font-size:17px}.jx-grid p,.jx-steps p{margin:0;opacity:.8}
.jx-steps{list-style:none;padding:0;margin:0;display:grid;gap:14px;max-width:720px}.jx-steps li{display:flex;gap:16px;align-items:flex-start}
.jx-steps b{flex:none;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:var(--ink);color:#fff}
.jx-price{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,340px));gap:18px}.jx-price article{padding:24px;border:1px solid var(--line);border-radius:14px}.jx-price .hot{border:2px solid var(--blue);box-shadow:0 18px 40px -26px rgba(29,78,216,.6)}
.jx-price h3{margin:0}.amt{font-size:40px;font-weight:700;margin:8px 0}.amt small{font-size:14px;font-weight:400;opacity:.7}.jx-price ul{padding-left:18px;margin:0 0 18px}.jx-price button{width:100%}
.jx-label{display:inline-block;margin:-12px 0 16px;padding:3px 10px;border-radius:6px;background:#FEF3C7;font-size:13px}
.jx-report{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}.jx-report>div{padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}.jx-report h3{margin:0 0 12px;font-size:16px}
.bar{display:grid;grid-template-columns:100px 1fr 44px;align-items:center;gap:8px;margin-bottom:8px;font-size:14px}.bar i{height:10px;border-radius:99px;background:var(--blue);animation:grow 1.2s ease-out both}.bar b{text-align:right}
@keyframes grow{from{width:0!important}}
.spark{display:flex;align-items:flex-end;gap:4px;height:100px}.spark i{flex:1;background:#16A34A;border-radius:3px 3px 0 0}.spark i.w{background:#DC2626}
.jx-table{width:100%;max-width:640px;border-collapse:collapse}.jx-table th,.jx-table td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line)}.jx-table .me{background:#EEF3FF;font-weight:700}
.jx-faq{max-width:760px}.jx-faq>div{border-bottom:1px solid var(--line)}.jx-faq button{display:flex;justify-content:space-between;width:100%;padding:16px 0;background:none;border:0;text-align:left;font-weight:600;color:var(--ink)}.jx-faq p{margin:0 0 16px;opacity:.85}
.jx-final{padding:64px 5vw;background:var(--ink);color:#fff}.jx-final h2{margin:0 0 20px}
.jx-foot{padding:28px 5vw;font-size:13px;opacity:.75}.jx-foot a{color:inherit}
@media(prefers-reduced-motion:reduce){.bar i{animation:none}}
`
