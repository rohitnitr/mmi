'use client'

import { useEffect, useRef, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import ExamDemo from './ExamDemo'
import './jee.css'

// Prices in rupees. Change here only. (PASS is a placeholder price: set your own.)
const PRICE = { mock: 11, analysis: 49 }

const NAV = [['Features', '#features'], ['How it works', '#how'], ['Tests', '#tests'], ['Pricing', '#pricing'], ['FAQ', '#faq']]
const TICKER = ['Physics', 'Chemistry', 'Mathematics', 'Full-length mocks', 'Part tests', 'Chapter tests', 'Question palette', 'Mistake analyzer', 'Time per question', 'Rank & percentile', 'Leaderboard', 'Revision notebook', 'Practice plan']
const FEATURES = [
  ['A real exam feel', 'Question palette with five states, section tabs, mark-for-review and a countdown, laid out like the JEE Main computer-based test.'],
  ['Server-timed attempts', 'The clock runs on our server, so a refresh or a weak connection never adds or removes a minute.'],
  ['Autosave and resume', 'Every answer is saved as you go. Reopen the link and you continue from the same question.'],
  ['Full, part, sectional and chapter tests', 'Sit the three-hour paper, a Class 11 or 12 part test, one subject, or a single chapter when time is short.'],
  ['Mistake analyzer', 'Each wrong answer is tied to its chapter and topic and sorted into slips, concept gaps and guesses, so revision goes where marks were lost.'],
  ['Time on every question', 'See where you rushed, where you stalled, and which answers were slow and still wrong.'],
  ['Rank and percentile, nationwide', 'Your marks ranked against every student on the platform who sat the same mock, from any city.'],
  ['Country-wide leaderboard', 'Climb the board for each mock. Show your name or stay hidden, you choose.'],
  ['Revision notebook', 'Bookmark a question during or after a test. Your notebook groups them by topic so revision is one tap away.'],
  ['Progress tracker', 'Marks, accuracy and percentile across all your attempts, with your strongest and weakest chapters in one view.'],
  ['Practice plan', 'A short plan built from your own attempt: what to revise and which questions to re-attempt.'],
  ['Pick your timer', 'Run the full three hours, or set a shorter clock for sectionals and drills.'],
] as const
const STEPS = [
  ['Get started with your email', 'Enter your email and tap the link we send. No password, no long forms. Your profile is ready in seconds.'],
  ['Pick a mock', 'Choose a test, read the marking scheme and the chapters it covers, then unlock it for ₹11.'],
  ['Take it like the real exam', 'Full-screen, timed, JEE-style. Answers autosave and the server keeps the clock.'],
  ['Open your analysis', 'Add the full analysis for ₹49: every mistake by chapter and topic, time per question, slow-but-wrong list and a practice plan.'],
  ['Compare, revise, repeat', 'Check your rank, percentile and the leaderboard, bookmark questions to revise, and watch your progress build mock after mock.'],
]
const TESTS = [
  ['Full-length mocks', 'Physics, Chemistry and Mathematics in one three-hour sitting, with the marking scheme shown first.'],
  ['Class 11 and 12 part tests', 'Cover one year of the syllabus at a time and find what you have let slip.'],
  ['Sectional tests', 'One subject, one sitting. Build speed and accuracy where you are weakest.'],
  ['Chapter tests', 'Short drills on a single chapter, ideal for the week after you finish a topic.'],
] as const
const CMP = [
  ['Full-length JEE-style mock', 1, 1], ['Server-timed, autosaved attempt', 1, 1], ['Marks, rank and percentile', 1, 1],
  ['Country-wide leaderboard', 1, 1], ['Revision notebook and progress tracker', 1, 1],
  ['Every mistake mapped to chapter and topic', 0, 1], ['Time spent on each question', 0, 1],
  ['Slow-but-wrong questions', 0, 1], ['Personal practice plan', 0, 1],
] as const
const PLANS = [
  { n: 'Mock test', p: PRICE.mock, d: 'per mock', pts: ['Full-length JEE-style mock', 'Server-timed attempt with autosave', 'Marks, rank and percentile', 'Country-wide leaderboard'], hi: false },
  { n: 'Mock + full analysis', p: PRICE.analysis, d: 'per mock', pts: ['Everything in Mock test', 'Every mistake by chapter and topic', 'Time spent on each question', 'Slow-but-wrong list and practice plan'], hi: true },
]
const LB = [[1, 'Student A', 'Aarav', 248, 99.4], [2, 'Student B', 'Diya', 241, 98.7], [3, 'Student C', 'Kabir', 236, 97.9], [4, 'You', 'Your row', 221, 94.2], [5, 'Student D', 'Meera', 214, 92.5]] as const
const FAQ = [
  ['Is this the official NTA exam?', 'No. This is an independent practice platform with a JEE-style interface. It is not affiliated with or endorsed by the NTA.'],
  ['How do I sign up?', 'Tap Get started, enter your email and open the link we send you. That signs you in. There is no password to remember.'],
  ['What do I get for ₹11 and ₹49?', `₹${PRICE.mock} unlocks one full mock with your marks, rank, percentile and leaderboard. ₹${PRICE.analysis} adds the complete analysis for that mock: every mistake by chapter and topic, time per question, slow-but-wrong list and a practice plan.`],
  ['Is the screen the same as the real JEE Main?', 'It is modelled on the JEE Main computer-based format: question palette, section tabs, mark for review and a countdown. We do not claim it is identical.'],
  ['Which subjects and topics are covered?', 'Physics, Chemistry and Mathematics across the JEE Main syllabus. Each test lists its chapters before you begin.'],
  ['How is the paper marked?', 'Each mock follows the official marking scheme, shown on the test page before you begin.'],
  ['What does the full analysis include?', 'Accuracy by subject, chapter and topic, your mistakes grouped by type, time spent on every question, the slow-but-wrong list and a short practice plan.'],
  ['How does the revision notebook work?', 'Bookmark any question while you test or when you review. The notebook groups them by topic so you can revise them later.'],
  ['Is this a subscription?', 'No. You pay per mock, ₹11 or ₹49. There is nothing to cancel.'],
  ['How are rank and percentile worked out?', 'Among everyone on the platform who submitted the same mock. Percentile is the share of students you scored above. It is a practice ranking, and it becomes more meaningful as more students attempt each mock.'],
  ['What happens if my internet drops?', 'Your answers are autosaved. Reconnect, reopen the mock and continue. The timer is kept by the server, so the deadline does not move.'],
  ['Can I hide my name on the leaderboard?', 'Yes. You choose whether your name is shown.'],
  ['Which devices can I use?', 'A laptop or desktop is best for a full paper. Tablets work too, and phones suit short sectional and chapter tests.'],
  ['I am under 18. Can I join?', 'Please ask a parent or guardian before signing up.'],
  ['How do I contact support?', 'Write to us from the Contact page and we will reply by email.'],
]

function Signup({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState(''); const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [err, setErr] = useState('')
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  async function go(e: React.FormEvent) {
    e.preventDefault()
    const c = getClient(); if (!c) { setErr('Sign-in is unavailable right now. Please try again.'); return }
    setBusy(true); setErr('')
    const { error } = await c.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/jee/auth/callback` } })
    setBusy(false)
    if (error) setErr(/rate|limit/i.test(error.message) ? 'Too many tries. Wait a minute and try again.' : 'Could not send the link. Check your email and try again.')
    else setSent(true)
  }
  return (
    <div className="jx-ov" onClick={onClose}>
      <div className="jx-modal" role="dialog" aria-modal="true" aria-label="Get started" onClick={(e) => e.stopPropagation()}>
        <button className="jx-x" onClick={onClose} aria-label="Close">×</button>
        {sent ? <><h3>Check your email</h3><p className="jx-sub">We sent a sign-in link to <b>{email}</b>. Open it on this device to start.</p></> : (
          <form onSubmit={go}>
            <h3>Get started</h3><p className="jx-sub">Just your email. We will send a sign-in link.</p>
            <input type="email" required autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
            <label className="jx-check dark"><input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} />I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>. If I am under 18, a parent or guardian knows I am signing up.</label>
            <button className="jx-cta" disabled={busy}>{busy ? 'Sending…' : 'Email me the link'}</button>
            {err && <p className="jx-err dark" role="alert">{err}</p>}
          </form>)}
      </div>
    </div>
  )
}

export default function JeeLanding() {
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    root.current?.querySelectorAll('.jx-rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  useEffect(() => { const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4500); return () => clearInterval(t) }, [])
  const start = () => setOpen(true)
  return (
    <div className="jx" ref={root}>
      <header className="jx-nav">
        <a href="/" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
        <nav className="jx-links">{NAV.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>
        <button className="jx-navcta" onClick={start}>Get started</button>
      </header>

      <section className="jx-hero">
        <i className="jx-blob b1" /><i className="jx-blob b2" />
        <div className="jx-wrap jx-herogrid">
          <div>
            <span className="jx-pill">JEE Main mock tests · from ₹{PRICE.mock}</span>
            <h1>The mock test that feels like the <em>real JEE.</em></h1>
            <p className="jx-lead">Take full-length JEE-style mocks, then see your marks, rank, percentile and a complete analysis of where you gained and lost marks.</p>
            <div className="jx-hero-cta"><button className="jx-cta" onClick={start}>Get started with your email</button><a href="#how" className="jx-ghost">See how it works</a></div>
            <div className="jx-chips"><span>Mock test ₹{PRICE.mock}</span><span>Full analysis ₹{PRICE.analysis}</span></div>
            <p className="jx-small">Try the interface on the right. It is a sample, not a real paper.</p>
          </div>
          <ExamDemo />
        </div>
      </section>

      <div className="jx-ticker" aria-hidden="true"><div>{[...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}</div></div>

      <section className="jx-sec" id="features"><div className="jx-wrap">
        <h2 className="jx-rv">Everything you need to practise properly</h2>
        <p className="jx-sub jx-rv">One platform for the exam, the score and the plan to improve it.</p>
        <div className="jx-feats">{FEATURES.map(([t, d], i) => <div className="jx-feat jx-rv" style={{ transitionDelay: `${(i % 3) * 80}ms` }} key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec alt" id="how"><div className="jx-wrap">
        <h2 className="jx-rv">How it works</h2>
        <div className="jx-how jx-rv">
          <ol>{STEPS.map(([t], i) => <li key={t}><button className={i === step ? 'on' : ''} onClick={() => setStep(i)}><b>{i + 1}</b>{t}</button></li>)}</ol>
          <div className="jx-how-panel" key={step}><span>Step {step + 1} of {STEPS.length}</span><h3>{STEPS[step][0]}</h3><p>{STEPS[step][1]}</p><i className="jx-prog" /></div>
        </div>
      </div></section>

      <section className="jx-sec" id="tests"><div className="jx-wrap">
        <h2 className="jx-rv">Four ways to practise</h2>
        <p className="jx-sub jx-rv">Match the test to the time you have.</p>
        <div className="jx-tests">{TESTS.map(([t, d], i) => <div className="jx-test jx-rv" style={{ transitionDelay: `${(i % 4) * 80}ms` }} key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec" id="pricing"><div className="jx-wrap">
        <h2 className="jx-rv">Simple pricing</h2>
        <p className="jx-sub jx-rv">Pay only for what you use. No hidden charges.</p>
        <div className="jx-plans">{PLANS.map((p, i) => (
          <div className={`jx-plan jx-rv${p.hi ? ' hi' : ''}`} style={{ transitionDelay: `${i * 90}ms` }} key={p.n}>
            {p.hi && <em>Most popular</em>}
            <h3>{p.n}</h3><div className="jx-amt">₹{p.p}<small> {p.d}</small></div>
            <ul>{p.pts.map((x) => <li key={x}>{x}</li>)}</ul>
            <button className={p.hi ? 'jx-cta' : 'jx-outline'} onClick={start}>Get started</button>
          </div>))}</div>
      </div></section>

      <section className="jx-sec"><div className="jx-wrap jx-narrow">
        <h2 className="jx-rv">What each price includes</h2>
        <div className="jx-scroll jx-rv"><table className="jx-cmp"><thead><tr><th>Feature</th><th>Mock ₹{PRICE.mock}</th><th>Mock + analysis ₹{PRICE.analysis}</th></tr></thead>
          <tbody>{CMP.map(([f, a, b]) => <tr key={f}><td>{f}</td><td className={a ? 'y' : 'n'}>{a ? '✓' : '–'}</td><td className={b ? 'y' : 'n'}>{b ? '✓' : '–'}</td></tr>)}</tbody></table></div>
      </div></section>

      <section className="jx-sec alt" id="report"><div className="jx-wrap">
        <h2 className="jx-rv">A report that shows exactly what to fix</h2>
        <p className="jx-sub jx-rv">Sample report with made-up numbers, to show the layout.</p>
        <div className="jx-report jx-rv"><span className="jx-badge">Sample data for illustration</span>
          <div className="jx-rcols">
            <div><h3>Accuracy by subject</h3>{[['Physics', 64], ['Chemistry', 78], ['Mathematics', 70]].map(([n, v]) => <div className="jx-bar" key={n}><span>{n}</span><div><i style={{ ['--w' as string]: `${v}%` }} /></div><b>{v}%</b></div>)}</div>
            <div><h3>Time per question</h3><div className="jx-times">{[30, 55, 20, 80, 45, 95, 35, 60, 25, 70, 50, 90, 40, 65, 30, 85, 55, 45, 75, 35].map((h, i) => <i key={i} className={i % 5 === 3 ? 'bad' : i % 7 === 2 ? 'skip' : 'ok'} style={{ ['--h' as string]: `${h}%` }} />)}</div><p className="jx-small">Green correct · red wrong · grey skipped</p></div>
            <div><h3>Slow but wrong</h3><ul className="jx-list"><li>Q23 · Rotational motion · 4m 10s</li><li>Q41 · Equilibrium · 3m 35s</li><li>Q58 · Definite integrals · 3m 20s</li></ul></div>
            <div><h3>Your practice plan</h3><ul className="jx-list"><li>Revise rotational motion basics, 20 questions</li><li>Timed set on equilibrium, 15 minutes</li><li>Re-attempt the three questions above</li></ul></div>
          </div></div>
      </div></section>

      <section className="jx-sec" id="leaderboard"><div className="jx-wrap">
        <h2 className="jx-rv">Know exactly where you rank</h2>
        <p className="jx-sub jx-rv">Marks, rank and percentile for every mock, transparent and updated as students submit. Sample table below.</p>
        <div className="jx-lb jx-rv"><span className="jx-badge">Sample data for illustration</span>
          <table><thead><tr><th>Rank</th><th>Student</th><th>Marks</th><th>Percentile</th></tr></thead>
            <tbody>{LB.map(([r, n, , m, pc]) => <tr key={r} className={n === 'You' ? 'me' : ''}><td>#{r}</td><td>{n}</td><td>{m}</td><td>{pc}</td></tr>)}</tbody></table>
        </div>
      </div></section>

      <section className="jx-sec alt"><div className="jx-wrap">
        <h2 className="jx-rv">Your profile tracks your growth</h2>
        <div className="jx-feats">{[['Every attempt, saved', 'Scores, ranks and reports for each mock in one place.'], ['Progress over time', 'See marks and percentile move up as you fix weak topics.'], ['Strong and weak topics', 'Your topic map updates after every mock, so practice stays focused.']].map(([t, d], i) => <div className="jx-feat jx-rv" style={{ transitionDelay: `${i * 80}ms` }} key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec" id="faq"><div className="jx-wrap jx-narrow">
        <h2 className="jx-rv">Frequently asked questions</h2>
        {FAQ.map(([q, a]) => <details className="jx-faq jx-rv" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></section>

      <section className="jx-sec join"><div className="jx-wrap jx-narrow jx-rv">
        <h2>Start your first mock today</h2>
        <p className="jx-sub">Enter your email, tap the link, and you are in.</p>
        <button className="jx-cta" onClick={start}>Get started</button>
      </div></section>

      <footer className="jx-foot"><div className="jx-wrap">
        <p>Built by an NIT Rourkela graduate.</p>
        <p className="jx-small">JEE and NTA are names of exams and an organisation unrelated to us. This is an independent practice platform, not affiliated with or endorsed by the NTA.</p>
        <p className="jx-small"><a href="/">MatchMyInterview</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p>
      </div></footer>
      {open && <Signup onClose={() => setOpen(false)} />}
    </div>
  )
}
