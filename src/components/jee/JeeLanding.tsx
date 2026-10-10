'use client'

import { useEffect, useRef, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import ExamDemo from './ExamDemo'
import './jee.css'

// ---- Edit only this block -------------------------------------------------
const PRICE = { mock: 11, analysis: 49 } // rupees

const FOUNDER = {
  name: 'Rohit Poddar',
  role: 'Founder, MatchMyInterview',
  school: 'NIT Rourkela graduate',
  bio: 'Rohit builds MatchMyInterview and is building these mocks so that every JEE aspirant can afford regular, exam-like practice, not just the students who can pay for a coaching test series.',
  photo: '/founder.jpg', // put your photo at public/founder.jpg
  // Add real links/numbers only: { label: 'Instagram', href: 'https://...', stat: '12K' }
  links: [] as { label: string; href: string; stat?: string }[],
}

// Real endorsements only. The "Voices" section stays hidden while this list is empty.
const TESTIMONIALS: { name: string; role: string; quote: string }[] = []
// ---------------------------------------------------------------------------

const NAV = [['Home', '#home'], ['Features', '#features'], ['Pricing', '#pricing'], ['Try the demo', '#demo'], ['Resources', '#resources'], ['FAQ', '#faq']]
const TICKER = ['Physics', 'Chemistry', 'Mathematics', 'Full-length mocks', 'Question palette', 'Time analysis', 'Rank & percentile', 'Leaderboard', 'Mistake analyzer', 'Chapter tests']
const FEATURES = [
  ['JEE-style exam screen', 'Question palette with five states, section navigation and a countdown timer, laid out the way you will meet it on exam day.'],
  ['Server-timed attempts', 'The clock runs on our server, so a refresh or a bad connection never gives anyone extra time.'],
  ['Autosave and resume', 'Every answer is saved as you go. Reload the page and pick up exactly where you were.'],
  ['Mistake analyzer', 'Every wrong answer is mapped to its chapter and topic, so revision goes where marks were lost.'],
  ['Chapter and topic reports', 'Subject, chapter and topic breakdowns after each attempt: accuracy, attempts and negatives.'],
  ['Time per question', 'Spot the questions you rushed, the ones that ate your time and the slow-but-wrong ones.'],
  ['Revision notebook', 'Bookmark questions while you practise and come back to them sorted by topic.'],
  ['Progress tracker', 'Score, accuracy and chapter strength across every attempt, on one page in your profile.'],
  ['Full, part, sectional, chapter', 'Full-syllabus mocks, Class 11 or 12 part tests, sectional tests and chapter tests.'],
  ['A timer you can pick', 'Short bursts for a chapter, or the full three hours for a complete mock.'],
  ['Marks, rank and percentile', 'Your marks, your rank and your percentile among students who took the same mock here.'],
  ['Leaderboard, your choice', 'See where you stand on every mock. Show your name or stay hidden.'],
] as const
const FOUR = [
  ['Full-length mock', 'Physics, Chemistry and Mathematics in one sitting, with the marking scheme shown first.'],
  ['Class 11 or 12 part test', 'Test only the half of the syllabus you have finished.'],
  ['Sectional test', 'One subject at a time, when you want to fix a single weak area.'],
  ['Chapter test', 'A short timed set on one chapter, to check a topic before moving on.'],
] as const
const STEPS = [
  ['Continue with Google', 'One tap. We use the name and photo from your Google account, so there is no form and no password.'],
  ['Pick a mock', 'Choose a mock, read the marking scheme and pay \u20b911 to take it.'],
  ['Take it like the real exam', 'Full-screen, timed, JEE-style. Answers autosave and the server keeps the clock.'],
  ['Get your report', 'Marks, rank and percentile straight away. Add the full analysis for \u20b949.'],
  ['Track your growth', 'Your profile keeps every attempt, so you can watch your score and rank climb mock after mock.'],
]
const PLANS = [
  { n: 'Mock test', p: PRICE.mock, pts: ['Full-length JEE-style mock', 'Server-timed attempt with autosave', 'Marks, rank and percentile', 'Leaderboard access'], hi: false },
  { n: 'Mock + full analysis', p: PRICE.analysis, pts: ['Everything in Mock test', 'Every mistake by chapter and topic', 'Time spent on each question', 'Slow-but-wrong list and practice plan'], hi: true },
]
const CMP: [string, boolean, boolean][] = [
  ['Full-length JEE-style mock', true, true],
  ['Server-timed attempt with autosave', true, true],
  ['Marks, rank and percentile', true, true],
  ['Leaderboard', true, true],
  ['Mistakes by chapter and topic', false, true],
  ['Time spent on every question', false, true],
  ['Slow-but-wrong list', false, true],
  ['Personal practice plan', false, true],
]
const RESOURCES = [
  ['Revision notes', 'Short chapter notes for Physics, Chemistry and Mathematics.'],
  ['Formula sheets', 'One-page formula sheets, chapter by chapter.'],
  ['Previous-year questions', 'Past JEE Main questions sorted by chapter.'],
  ['Top questions', 'High-yield questions to revisit before a mock.'],
  ['Chapter-wise mocks', 'Previous-year questions arranged as timed tests.'],
] as const
const LB = [[1, 'Student A', 248, 99.4], [2, 'Student B', 241, 98.7], [3, 'Student C', 236, 97.9], [4, 'You', 221, 94.2], [5, 'Student D', 214, 92.5]] as const
const FAQ: [string, string][] = [
  ['Is this the official NTA exam?', 'No. This is an independent practice platform with a JEE-style interface. It is not affiliated with or endorsed by the NTA.'],
  ['How do I sign up?', 'Tap Continue with Google and choose your account. That is all. There is no password and no form to fill.'],
  ['What do you take from my Google account?', 'Your name, email address and profile photo. We use them to set up your profile. Your name appears on the leaderboard only if you choose to show it.'],
  ['What do I get for \u20b911 and \u20b949?', `\u20b9${PRICE.mock} gets you a full mock with your marks, rank and percentile. \u20b9${PRICE.analysis} adds the complete analysis: mistakes by chapter and topic, time per question, the slow-but-wrong list and a practice plan.`],
  ['Is there a subscription?', 'No. You pay per mock. Nothing renews and nothing is charged in the background.'],
  ['How close is the screen to the real JEE Main?', 'It is modelled on it: the same palette states, the same section flow and a countdown timer. It is not an exact copy, and it is not run by the NTA.'],
  ['How is the paper marked?', 'Each mock follows the marking scheme shown on its page before you begin.'],
  ['How are rank and percentile worked out?', 'Among everyone on this platform who submitted the same mock. They become more meaningful as more students attempt each mock.'],
  ['What does "nationwide" mean here?', 'Students from across the country who use this platform. It is not a comparison with every JEE candidate.'],
  ['What happens if my internet drops?', 'Your answers are autosaved. Reconnect, reopen the mock and continue. The timer is kept by the server.'],
  ['Can I hide my name on the leaderboard?', 'Yes. You decide whether your name is shown.'],
  ['What are part, sectional and chapter tests?', 'Part tests cover Class 11 or Class 12 only. Sectional tests are one subject. Chapter tests are a short set on one chapter.'],
  ['When do notes, formula sheets and PYQs arrive?', 'They are being added now and are marked Coming soon on this page until they are live.'],
  ['Which devices can I use?', 'A laptop or desktop is best for the full exam feel. Tablets work too.'],
  ['I am under 18. Can I join?', 'Please ask a parent or guardian before signing up.'],
]

function GIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export default function JeeLanding() {
  const root = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [photoOk, setPhotoOk] = useState(true)

  useEffect(() => {
    let t: string | null = null
    try { t = localStorage.getItem('jx-theme') } catch { /* private mode */ }
    if (t === 'dark' || t === 'light') setTheme(t)
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme('dark')
  }, [])
  const flip = () => {
    const n = theme === 'dark' ? 'light' : 'dark'
    setTheme(n)
    try { localStorage.setItem('jx-theme', n) } catch { /* ignore */ }
  }

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    root.current?.querySelectorAll('.jx-rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  useEffect(() => { const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4500); return () => clearInterval(t) }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('signin') === 'failed') setErr('Sign-in did not complete. Please try again.')
    const c = getClient()
    if (c) c.auth.getSession().then(({ data }) => setSignedIn(!!data.session)).catch(() => {})
    const back = () => setBusy(false) // returning with the back button
    window.addEventListener('pageshow', back)
    return () => window.removeEventListener('pageshow', back)
  }, [])
  useEffect(() => { if (!err) return; const t = setTimeout(() => setErr(''), 6000); return () => clearTimeout(t) }, [err])

  async function start() {
    if (signedIn) { window.location.href = '/jee/welcome'; return }
    const c = getClient()
    if (!c) { setErr('Sign-in is unavailable right now. Please try again in a moment.'); return }
    setBusy(true); setErr('')
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/jee/auth/callback` } })
    if (error) { setBusy(false); setErr('Could not start Google sign-in. Please try again.') }
  }
  const label = busy ? 'Opening Google\u2026' : signedIn ? 'Open my dashboard' : 'Continue with Google'
  const gbtn = (cls = '', text = label) => (
    <button type="button" className={`jx-g ${cls}`} onClick={start} disabled={busy}>{!signedIn && <GIcon />}<span>{text}</span></button>
  )

  return (
    <div className="jx" ref={root} data-theme={theme}>
      <header className="jx-nav">
        <a href="#home" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
        <nav className="jx-links" aria-label="Sections">{NAV.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>
        <div className="jx-navr">
          <button type="button" className="jx-theme" onClick={flip} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? '\u2600' : '\u263E'}</button>
          {gbtn('sm', signedIn ? 'Dashboard' : 'Sign in')}
        </div>
      </header>

      <section className="jx-hero" id="home">
        <i className="jx-blob b1" /><i className="jx-blob b2" />
        <div className="jx-wrap jx-herogrid">
          <div>
            <span className="jx-pill">JEE Main mock tests · from {'\u20b9'}{PRICE.mock}</span>
            <h1>The mock test that feels like the <em>real JEE.</em></h1>
            <p className="jx-lead">Take full-length JEE-style mocks, then see your marks, rank, percentile and a complete analysis of where you gained and lost marks.</p>
            <div className="jx-hero-cta">{gbtn()}<a href="#how" className="jx-ghost">See how it works</a></div>
            <div className="jx-chips"><span>Mock test {'\u20b9'}{PRICE.mock}</span><span>Full analysis {'\u20b9'}{PRICE.analysis}</span><span>No subscription</span></div>
            <p className="jx-small">Try the exam screen on the right. It is a sample, not a real paper.</p>
          </div>
          <div id="demo"><ExamDemo /></div>
        </div>
      </section>

      <div className="jx-ticker" aria-hidden="true"><div>{[...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}</div></div>

      <section className="jx-sec" id="features"><div className="jx-wrap">
        <h2 className="jx-rv">What a coaching test series gives you, priced per mock</h2>
        <p className="jx-sub jx-rv">Exam-style practice, a detailed report and a plan to improve it. You pay for the mocks you take and nothing else.</p>
        <div className="jx-feats">{FEATURES.map(([t, d], i) => <div className="jx-feat jx-rv" style={{ transitionDelay: `${(i % 3) * 80}ms` }} key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec alt"><div className="jx-wrap">
        <h2 className="jx-rv">Four ways to practise</h2>
        <p className="jx-sub jx-rv">Use the format that fits where you are in your preparation.</p>
        <div className="jx-four">{FOUR.map(([t, d], i) => <div className="jx-card jx-rv" style={{ transitionDelay: `${i * 80}ms` }} key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </div></section>

      <section className="jx-sec" id="how"><div className="jx-wrap">
        <h2 className="jx-rv">How it works</h2>
        <div className="jx-how jx-rv">
          <ol>{STEPS.map(([t], i) => <li key={t}><button type="button" className={i === step ? 'on' : ''} onClick={() => setStep(i)}><b>{i + 1}</b>{t}</button></li>)}</ol>
          <div className="jx-how-panel" key={step}><span>Step {step + 1} of {STEPS.length}</span><h3>{STEPS[step][0]}</h3><p>{STEPS[step][1]}</p><i className="jx-prog" /></div>
        </div>
      </div></section>

      <section className="jx-sec alt" id="pricing"><div className="jx-wrap">
        <h2 className="jx-rv">Simple pricing</h2>
        <p className="jx-sub jx-rv">Per mock. No subscription, no season pass, no hidden charges.</p>
        <div className="jx-plans">{PLANS.map((p, i) => (
          <div className={`jx-plan jx-rv${p.hi ? ' hi' : ''}`} style={{ transitionDelay: `${i * 90}ms` }} key={p.n}>
            {p.hi && <em>Most popular</em>}
            <h3>{p.n}</h3><div className="jx-amt">{'\u20b9'}{p.p}<small> per mock</small></div>
            <ul>{p.pts.map((x) => <li key={x}>{x}</li>)}</ul>
            {gbtn('wide', busy ? 'Opening Google\u2026' : signedIn ? 'Open my dashboard' : 'Get started with Google')}
          </div>))}</div>
        <div className="jx-cmp jx-rv"><table>
          <thead><tr><th>What is included</th><th>{'\u20b9'}{PRICE.mock}</th><th>{'\u20b9'}{PRICE.analysis}</th></tr></thead>
          <tbody>{CMP.map(([n, a, b]) => <tr key={n}><td>{n}</td><td className={a ? 'jx-yes' : 'jx-no'}>{a ? '\u2713' : '\u2014'}</td><td className={b ? 'jx-yes' : 'jx-no'}>{b ? '\u2713' : '\u2014'}</td></tr>)}</tbody>
        </table></div>
      </div></section>

      <section className="jx-sec" id="report"><div className="jx-wrap">
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

      <section className="jx-sec alt" id="leaderboard"><div className="jx-wrap">
        <h2 className="jx-rv">Know exactly where you rank</h2>
        <p className="jx-sub jx-rv">Marks, rank and percentile for every mock, updated as students submit. Ranks are among students on this platform. Sample table below.</p>
        <div className="jx-lb jx-rv"><span className="jx-badge">Sample data for illustration</span>
          <table><thead><tr><th>Rank</th><th>Student</th><th>Marks</th><th>Percentile</th></tr></thead>
            <tbody>{LB.map(([r, n, m, pc]) => <tr key={r} className={n === 'You' ? 'me' : ''}><td>#{r}</td><td>{n}</td><td>{m}</td><td>{pc}</td></tr>)}</tbody></table>
        </div>
      </div></section>

      <section className="jx-sec" id="resources"><div className="jx-wrap">
        <h2 className="jx-rv">Study resources, on the way</h2>
        <p className="jx-sub jx-rv">Notes, formula sheets and previous-year questions are being added next to the mocks. They are planned to be free for every signed-in student.</p>
        <div className="jx-res">{RESOURCES.map(([t, d], i) => <div className="jx-card jx-rv" style={{ transitionDelay: `${(i % 3) * 80}ms` }} key={t}><b>{t}</b><p>{d}</p><span className="jx-tag">Coming soon</span></div>)}</div>
      </div></section>

      {TESTIMONIALS.length > 0 && (
        <section className="jx-sec alt" id="voices"><div className="jx-wrap">
          <h2 className="jx-rv">What students and mentors say</h2>
          <div className="jx-voices">{TESTIMONIALS.map((v) => <figure className="jx-voice jx-rv" style={{ margin: 0 }} key={v.name}><p>{v.quote}</p><b>{v.name}</b><span>{v.role}</span></figure>)}</div>
        </div></section>
      )}

      <section className="jx-sec alt" id="founder"><div className="jx-wrap jx-narrow">
        <h2 className="jx-rv">The person behind it</h2>
        <div className="jx-founder jx-rv">
          {photoOk
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="jx-ph" src={FOUNDER.photo} alt={FOUNDER.name} width={168} height={168} onError={() => setPhotoOk(false)} />
            : <div className="jx-ph" aria-hidden="true">{FOUNDER.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>}
          <div>
            <h3>{FOUNDER.name}</h3>
            <p className="jx-role">{FOUNDER.role}</p>
            <p><b style={{ color: 'var(--ink)' }}>{FOUNDER.school}</b></p>
            <p>{FOUNDER.bio}</p>
            {FOUNDER.links.length > 0 && <div className="jx-soc">{FOUNDER.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}{l.stat ? ` · ${l.stat}` : ''}</a>)}</div>}
          </div>
        </div>
      </div></section>

      <section className="jx-sec" id="faq"><div className="jx-wrap jx-narrow">
        <h2 className="jx-rv">Frequently asked questions</h2>
        {FAQ.map(([q, a]) => <details className="jx-faq jx-rv" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></section>

      <section className="jx-sec join"><div className="jx-wrap jx-narrow jx-rv">
        <span className="jx-pill jx-join-pill">Built by an NIT Rourkela graduate</span>
        <h2>Your IIT or NIT seat starts with the next mock</h2>
        <p className="jx-sub">Real-exam practice, a full report after every attempt and a plan for what to fix next. One tap with Google and you are in.</p>
        {gbtn()}
        <p className="jx-small">Pay per mock · No subscription · No password</p>
        <p className="jx-small">By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
      </div></section>

      <footer className="jx-foot"><div className="jx-wrap">
        <div className="jx-fgrid">
          <div>
            <p className="jx-fb">MatchMyInterview · JEE</p>
            <p>JEE Main mock tests with a full report after every attempt: marks, rank, percentile, time analysis and a practice plan.</p>
          </div>
          <div><h4>Platform</h4><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#demo">Try the demo</a><a href="#resources">Resources</a></div>
          <div><h4>Legal</h4><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="/contact">Contact</a></div>
          <div><h4>More</h4><a href="/">MatchMyInterview</a><a href="#founder">About the founder</a><a href="#faq">FAQ</a></div>
        </div>
        <div className="jx-fbot">
          <p>JEE and NTA are names of an exam and an organisation unrelated to us. This is an independent practice platform, not affiliated with or endorsed by the NTA.</p>
          <p>{'\u00a9'} {new Date().getFullYear()} MatchMyInterview. Made for JEE aspirants.</p>
        </div>
      </div></footer>

      {err && <div className="jx-toast" role="alert">{err}</div>}
    </div>
  )
}
