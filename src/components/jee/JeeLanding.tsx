'use client'

import { useEffect, useRef, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import ExamDemo from './ExamDemo'
import {
  NITIAN_FULL_MOCKS,
  CLASS_WISE_MOCKS,
  SUBJECT_WISE_MOCKS,
  TOPIC_TREE,
  PYQ_YEAR_DATA,
} from '@/lib/jee/catalog-data'
import { rupees } from '@/lib/jee/shared'
import './jee.css'

// ---- Edit only this block -------------------------------------------------
const PRICE = { mock: 11, analysis: 49 } // rupees

const FOUNDER = {
  name: 'Rohit Poddar',
  role: 'Founder, MatchMyInterview',
  school: 'NIT Rourkela graduate',
  bio: 'Rohit builds MatchMyInterview and personally curated these mock test series alongside fellow top NITians so that every aspiring engineer can practice on genuine exam-grade questions with real NTA simulation, without paying thousands for corporate coaching series.',
  photo: '/founder.jpg',
  links: [
    { label: 'GitHub', href: 'https://github.com/rohitnitr' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rohitnitr/' },
  ] as { label: string; href: string; stat?: string }[],
}

const TESTIMONIALS: { name: string; role: string; quote: string }[] = []
// ---------------------------------------------------------------------------

const NAV = [
  ['Home', '#home'],
  ['NITian Mocks', '#catalog'],
  ['Features', '#features'],
  ['Pricing', '#pricing'],
  ['Try Demo', '#demo'],
  ['FAQ', '#faq'],
]
const TICKER = [
  'Curated by NITians',
  'Level 1 Beginner',
  'Level 2 Intermediate',
  'Level 3 Advanced',
  'Class 11 & 12 Mocks',
  'Dropper Special',
  'Topic Trees',
  'Free PYQs 2020-2026',
  'Rank & Percentile',
  'Mistake Analyzer',
]
const FEATURES = [
  ['Questions Selected by NITians', 'Handpicked and formulated by NIT Rourkela alumni to simulate exact NTA shift difficulty, question distribution, and tricky concept traps.'],
  ['Real NTA-Style Exam Screen', 'Question palette with all five official states, section toggling, and countdown timer, built precisely how you will experience it on exam day.'],
  ['Server-Timed Attempts', 'The clock runs securely on our server, so accidental refreshes or slow connections never compromise your real attempt timing.'],
  ['Autosave & Resume', 'Every answer and bookmark is preserved automatically as you navigate. Disconnections never lose your work.'],
  ['Mistake & Trap Analyzer', 'Pinpoints exactly which chapters, topics, and question types cost you marks so your revision is laser-focused.'],
  ['Time-Per-Question Breakdown', 'Identifies the questions you rushed, those that ate up your time, and the dangerous slow-but-wrong traps.'],
  ['Class 11, 12 & Dropper Focus', 'Modular syllabus options: complete 3-hour mocks, Class 11 backlog busters, or single-subject sprint tests.'],
  ['50+ Free PYQs (2020-2026)', 'Every official morning and evening shift paper from 2020 to 2026 organized by year, date, and shift for 100% free practice.'],
  ['Nationwide Rank & Percentile', 'Live rank and percentile calculated among all peer candidates taking the same mock across India.'],
  ['No Locked Subscriptions', 'Take individual mocks from ₹11. Never pay hefty upfront fees for tests you don’t have time to finish.'],
] as const

const STEPS = [
  ['Sign in with Google', 'One tap. Zero passwords and no long forms to fill.'],
  ['Pick Your Mock or Free PYQ', 'Choose an NITian 3-level mock, class-wise test, or free past-year shift paper.'],
  ['Take the Exam', 'Full-screen, strictly timed NTA interface with live question palette and autosave.'],
  ['Instant Score & Percentile', 'Marks, negative loss, percentile, and rank generated the second you submit.'],
  ['Unlock In-Depth Analysis', 'Optionally add the ₹49 complete mistake breakdown, chapter weakness map, and redo plan.'],
]

export default function JeeLanding() {
  const root = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [photoOk, setPhotoOk] = useState(true)

  // Catalog Preview State
  const [previewTab, setPreviewTab] = useState<'premium' | 'free'>('premium')
  const [previewSubject, setPreviewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics')
  const [previewYear, setPreviewYear] = useState<number>(2026)

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
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    root.current?.querySelectorAll('.jx-rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('signin') === 'failed') {
      setErr('Sign-in did not complete. Please try again.')
    }
    const c = getClient()
    if (c) c.auth.getSession().then(({ data }) => setSignedIn(!!data.session)).catch(() => {})
    const back = () => setBusy(false)
    window.addEventListener('pageshow', back)
    return () => window.removeEventListener('pageshow', back)
  }, [])

  useEffect(() => {
    if (!err) return
    const t = setTimeout(() => setErr(''), 6000)
    return () => clearTimeout(t)
  }, [err])

  async function start() {
    if (signedIn) {
      window.location.href = '/jee/store'
      return
    }
    const c = getClient()
    if (!c) {
      setErr('Sign-in is unavailable right now. Please try again in a moment.')
      return
    }
    setBusy(true)
    setErr('')
    const { error } = await c.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/jee/auth/callback` },
    })
    if (error) {
      setBusy(false)
      setErr('Could not start Google sign-in. Please try again.')
    }
  }

  const label = busy ? 'Opening Google…' : signedIn ? 'Explore Store ➔' : 'Get Started with Google'
  const gbtn = (cls = '', text = label) => (
    <button type="button" className={`jx-cta ${cls}`} onClick={start} disabled={busy}>
      {text}
    </button>
  )

  const selectedPyqYearData = PYQ_YEAR_DATA.find((y) => y.year === previewYear) ?? PYQ_YEAR_DATA[0]

  return (
    <div className="jx" ref={root} data-theme={theme}>
      <header className="jx-nav">
        <a href="#home" className="jx-brand">MatchMyInterview <span>· JEE</span></a>
        <nav className="jx-links" aria-label="Sections">
          {NAV.map(([l, h]) => (
            <a key={h} href={h}>{l}</a>
          ))}
        </nav>
        <div className="jx-navr">
          <button
            type="button"
            className="jx-theme"
            onClick={flip}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {gbtn('sm', busy ? 'Opening…' : signedIn ? 'Store' : 'Get started')}
        </div>
      </header>

      {/* Hero Section */}
      <section className="jx-hero" id="home">
        <i className="jx-blob b1" /><i className="jx-blob b2" />
        <div className="jx-wrap jx-herogrid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 99,
                  letterSpacing: '0.04em',
                }}
              >
                ★ CURATED BY NITIANS
              </span>
              <span style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>
                From ₹11 · Pay per mock
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.12, letterSpacing: '-0.03em' }}>
              Questions Chosen by NITians for Upcoming <em>NITians &amp; IITians.</em>
            </h1>

            <p className="jx-lead" style={{ marginTop: 16 }}>
              Formula traps, accurate NTA shift calibrations, 3-level progressive full mocks, and 50+ free official PYQs.
              Built by Rohit Poddar (NIT Rourkela) to deliver genuine exam-grade simulation for every student.
            </p>

            <div className="jx-hero-cta">
              {gbtn()}
              <a href="#catalog" className="jx-ghost">Browse Mocks Catalog</a>
            </div>

            <div className="jx-chips">
              <span>NITian 3-Level Mocks</span>
              <span>Topic Trees ₹11</span>
              <span>Free PYQs (2020–2026)</span>
              <span>Instant AI Analysis</span>
            </div>
            <p className="jx-small">Try the live interactive exam screen on the right. Autosave &amp; palette included.</p>
          </div>

          <div id="demo"><ExamDemo /></div>
        </div>
      </section>

      {/* Ticker */}
      <div className="jx-ticker" aria-hidden="true">
        <div>{[...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      {/* ==================== NEW SECTION: INTERACTIVE MOCKS CATALOG ==================== */}
      <section className="jx-sec" id="catalog" style={{ background: 'var(--bg2)', padding: '80px 0' }}>
        <div className="jx-wrap">
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 36px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(37,99,235,0.12)',
                color: '#2563EB',
                fontSize: 13,
                fontWeight: 800,
                padding: '4px 14px',
                borderRadius: 99,
                letterSpacing: '0.04em',
                marginBottom: 10,
              }}
            >
              COMPLETE TEST SERIES CATALOG
            </span>
            <h2 className="jx-rv" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Explore NITian Curated Mocks &amp; Free PYQs
            </h2>
            <p className="jx-sub jx-rv" style={{ margin: '0 auto' }}>
              Switch between our premium NITian-curated question sets and 100% free past NTA shift papers.
              Select any test to begin immediately.
            </p>
          </div>

          {/* Slide Switch / Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                padding: 6,
                borderRadius: 99,
                gap: 8,
                boxShadow: '0 8px 24px var(--shadow)',
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewTab('premium')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 0,
                  font: '700 15px inherit',
                  cursor: 'pointer',
                  background: previewTab === 'premium' ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : 'transparent',
                  color: previewTab === 'premium' ? '#fff' : 'var(--mut)',
                  boxShadow: previewTab === 'premium' ? '0 6px 18px rgba(37,99,235,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>⭐</span>
                <span>Premium Mocks</span>
                <span
                  style={{
                    fontSize: 11,
                    background: previewTab === 'premium' ? 'rgba(255,255,255,0.22)' : 'var(--soft)',
                    padding: '2px 8px',
                    borderRadius: 99,
                  }}
                >
                  From ₹11
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('free')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 0,
                  font: '700 15px inherit',
                  cursor: 'pointer',
                  background: previewTab === 'free' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                  color: previewTab === 'free' ? '#fff' : 'var(--mut)',
                  boxShadow: previewTab === 'free' ? '0 6px 18px rgba(16,185,129,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>🎁</span>
                <span>Free PYQs (2020–2026)</span>
                <span
                  style={{
                    fontSize: 11,
                    background: previewTab === 'free' ? 'rgba(255,255,255,0.22)' : 'var(--soft)',
                    padding: '2px 8px',
                    borderRadius: 99,
                  }}
                >
                  50+ Shifts
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: PREMIUM PREVIEW */}
          {previewTab === 'premium' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {/* NITian 3-Level Full Mocks */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 800 }}>
                      1. NITian Curated Full Syllabus Mock Tests (3 Levels)
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--mut)' }}>
                      Questions hand-selected by NITian mentors matching real difficulty progression.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
                  {NITIAN_FULL_MOCKS.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--line)',
                        borderRadius: 20,
                        padding: 22,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              background: 'rgba(37,99,235,0.1)',
                              color: '#2563EB',
                              padding: '3px 10px',
                              borderRadius: 99,
                            }}
                          >
                            {m.badge}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--mut)', fontWeight: 600 }}>
                            75 Qs · 180 min
                          </span>
                        </div>
                        <h4 style={{ fontSize: 17, margin: '0 0 8px', fontWeight: 700 }}>{m.title}</h4>
                        <p style={{ fontSize: 13, color: 'var(--mut)', margin: '0 0 16px', lineHeight: 1.5 }}>
                          {m.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{rupees(m.pricePaise)}</div>
                        <button type="button" className="jx-cta sm" onClick={start} disabled={busy}>
                          {signedIn ? 'Take Mock ➔' : 'Get Started ➔'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class-Wise Special Mocks */}
              <div>
                <h3 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 800 }}>
                  2. Class-Wise Special Mock Tests
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--mut)' }}>
                  Tailored mocks for Class 11 foundational mastery, Class 12 board balance, and repeaters.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
                  {CLASS_WISE_MOCKS.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--line)',
                        borderRadius: 20,
                        padding: 22,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            background: 'rgba(124,58,237,0.1)',
                            color: '#7C3AED',
                            padding: '3px 10px',
                            borderRadius: 99,
                            display: 'inline-block',
                            marginBottom: 10,
                          }}
                        >
                          {m.badge}
                        </span>
                        <h4 style={{ fontSize: 17, margin: '0 0 8px', fontWeight: 700 }}>{m.title}</h4>
                        <p style={{ fontSize: 13, color: 'var(--mut)', margin: '0 0 16px', lineHeight: 1.5 }}>
                          {m.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{rupees(m.pricePaise)}</div>
                        <button type="button" className="jx-cta sm" onClick={start} disabled={busy}>
                          {signedIn ? 'Take Mock ➔' : 'Get Started ➔'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject-Wise & Topic-Wise Trees */}
              <div>
                <h3 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 800 }}>
                  3. Subject &amp; Topic-Wise Tree Mocks (Layered Structure)
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--mut)' }}>
                  Click to explore individual topics under Physics, Chemistry, and Mathematics.
                </p>

                {/* Subject Selector */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => {
                    const active = previewSubject === sub
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setPreviewSubject(sub)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 12,
                          border: '1px solid',
                          borderColor: active ? '#2563EB' : 'var(--line)',
                          background: active ? '#2563EB' : 'var(--card)',
                          color: active ? '#fff' : 'var(--ink)',
                          font: '700 13px inherit',
                          cursor: 'pointer',
                        }}
                      >
                        {sub} ({TOPIC_TREE[sub].length} Topics)
                      </button>
                    )
                  })}
                </div>

                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 18,
                    padding: 18,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  {TOPIC_TREE[previewSubject].slice(0, 4).map((topic, i) => (
                    <div
                      key={topic.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--bg2)',
                        borderRadius: 12,
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <b style={{ fontSize: 14 }}>{topic.title}</b>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--mut)' }}>
                          {topic.questionCount} Questions · 45 Min · {topic.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 800 }}>{rupees(topic.pricePaise)}</span>
                        <button type="button" className="jx-cta sm" onClick={start} disabled={busy}>
                          Attempt ➔
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <button type="button" className="jx-ghost" onClick={start} style={{ color: 'var(--link)', borderColor: 'var(--line)' }}>
                      View all {TOPIC_TREE[previewSubject].length} {previewSubject} topics in Store ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FREE PYQs PREVIEW */}
          {previewTab === 'free' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {PYQ_YEAR_DATA.map((yg) => {
                  const active = previewYear === yg.year
                  return (
                    <button
                      key={yg.year}
                      type="button"
                      onClick={() => setPreviewYear(yg.year)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        border: '1px solid',
                        borderColor: active ? '#10B981' : 'var(--line)',
                        background: active ? '#10B981' : 'var(--card)',
                        color: active ? '#fff' : 'var(--ink)',
                        font: '700 14px inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {yg.year} ({yg.totalPapers} Papers)
                    </button>
                  )
                })}
              </div>

              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {selectedPyqYearData.dates.flatMap((d) => d.shifts).map((sh) => (
                  <div
                    key={sh.testId}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 14,
                      padding: 16,
                      background: 'var(--bg2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            background: '#DCFCE7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: 99,
                          }}
                        >
                          100% FREE
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--mut)' }}>{sh.timeSlot}</span>
                      </div>
                      <b style={{ fontSize: 15, display: 'block' }}>{sh.title}</b>
                      <span style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4, display: 'block' }}>
                        75 Qs · 300 Marks · 180 Min
                      </span>
                    </div>

                    <button
                      type="button"
                      className="jx-cta sm"
                      onClick={start}
                      disabled={busy}
                      style={{ background: '#10B981', borderColor: '#10B981', width: '100%' }}
                    >
                      Start Free Test ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Store Link */}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            {gbtn('wide', signedIn ? 'Open Full Store & Dashboard ➔' : 'Get Started with Google to Take Any Mock ➔')}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="jx-sec" id="features">
        <div className="jx-wrap">
          <h2 className="jx-rv">What a Coaching Test Series Gives You, Priced Per Mock</h2>
          <p className="jx-sub jx-rv">
            Exam-style practice, a detailed report, and a plan to improve it. You pay for the mocks you take and nothing else.
          </p>
          <div className="jx-feats">
            {FEATURES.map(([t, d], i) => (
              <div className="jx-feat jx-rv" style={{ transitionDelay: `${(i % 3) * 80}ms` }} key={t}>
                <b>{t}</b>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="jx-sec alt" id="how">
        <div className="jx-wrap">
          <h2 className="jx-rv">How It Works</h2>
          <div className="jx-how jx-rv">
            <ol>
              {STEPS.map(([t], i) => (
                <li key={t}>
                  <button type="button" className={i === step ? 'on' : ''} onClick={() => setStep(i)}>
                    <b>{i + 1}</b>{t}
                  </button>
                </li>
              ))}
            </ol>
            <div className="jx-how-panel" key={step}>
              <span>Step {step + 1} of {STEPS.length}</span>
              <h3>{STEPS[step][0]}</h3>
              <p>{STEPS[step][1]}</p>
              <i className="jx-prog" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="jx-sec" id="pricing">
        <div className="jx-wrap">
          <h2 className="jx-rv">Simple, Transparent Pricing</h2>
          <p className="jx-sub jx-rv">Per mock. No subscriptions, no lock-in, no hidden renewal charges.</p>
          <div className="jx-plans">
            <div className="jx-plan jx-rv">
              <h3>Single Mock Test</h3>
              <div className="jx-amt">₹11<small> per mock</small></div>
              <ul>
                <li>Full-length 75-question JEE-style mock</li>
                <li>Server-timed attempt with live autosave</li>
                <li>Marks, rank, accuracy &amp; percentile</li>
                <li>Leaderboard access &amp; instant results</li>
              </ul>
              {gbtn('wide alt', 'Take a Mock for ₹11')}
            </div>

            <div className="jx-plan jx-rv hi">
              <em>Recommended</em>
              <h3>Mock + AI Analysis</h3>
              <div className="jx-amt">₹49<small> per mock</small></div>
              <ul>
                <li>Everything in the Single Mock tier</li>
                <li>Every mistake mapped by chapter and topic</li>
                <li>Time spent on each question analysis</li>
                <li>Slow-but-wrong trap list &amp; practice plan</li>
              </ul>
              {gbtn('wide', 'Get Mock + Full Analysis')}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section: Rohit Poddar, NIT Rourkela */}
      <section className="jx-sec alt">
        <div className="jx-wrap">
          <div className="jx-founder jx-rv">
            {photoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={FOUNDER.photo}
                alt={FOUNDER.name}
                width={168}
                height={168}
                className="jx-ph"
                onError={() => setPhotoOk(false)}
              />
            ) : (
              <div className="jx-ph" aria-hidden="true">RP</div>
            )}
            <div>
              <h3>{FOUNDER.name}</h3>
              <div className="jx-role">{FOUNDER.school} · {FOUNDER.role}</div>
              <p>{FOUNDER.bio}</p>
              <div className="jx-soc">
                {FOUNDER.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="jx-sec" id="faq">
        <div className="jx-wrap">
          <h2 className="jx-rv">Frequently Asked Questions</h2>
          <div className="jx-faqs" style={{ marginTop: 24 }}>
            {[
              ['Why are questions prepared by an NITian important?', 'Most test series either repeat obsolete questions or make questions unnaturally complex. Our mocks are formulated by NIT Rourkela alumni who scored in the top percentiles, ensuring real NTA pattern alignment, realistic formula traps, and balanced difficulty.'],
              ['How does "Buy Again" / retake work?', 'Once you finish a mock, you get your score and analysis. If you want to test your improvement after revising your mistakes, you can click "Buy Again" to sit a fresh attempt without losing your previous score history.'],
              ['Are previous-year papers (PYQs) really free?', 'Yes! All JEE Main official shift papers from 2020 through 2026 are 100% free with the full NTA timed interface.'],
              ['Is there a subscription?', 'No. You pay ₹11 per mock, or ₹49 with detailed mistake breakdown. Nothing ever auto-renews.'],
            ].map(([q, a]) => (
              <details key={q} className="jx-faq">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final Centered CTA */}
      <section className="jx-sec join">
        <div className="jx-wrap">
          <span className="jx-pill jx-join-pill">READY TO TEST YOUR LEVEL?</span>
          <h2>Join Upcoming NITians &amp; IITians Practicing Today</h2>
          <p className="jx-sub">Sign in with Google in 5 seconds. Take your first mock from ₹11.</p>
          {gbtn('wide', signedIn ? 'Go to Store & Dashboard ➔' : 'Get Started with Google')}
        </div>
      </section>

      {/* Footer */}
      <footer className="jx-foot">
        <div className="jx-wrap">
          <div className="jx-fgrid">
            <div>
              <div className="jx-fb">MatchMyInterview JEE</div>
              <p>Authentic JEE Main mock test platform curated by NITians.</p>
            </div>
            <div>
              <h4>Tests</h4>
              <a href="#catalog">Full Syllabus Mocks</a>
              <a href="#catalog">Class 11 &amp; 12 Special</a>
              <a href="#catalog">Topic Trees</a>
              <a href="#catalog">Free PYQs (2020-2026)</a>
            </div>
            <div>
              <h4>Account</h4>
              <a href="/jee/dashboard">My Dashboard</a>
              <a href="/jee/store">Mock Store</a>
              <a href="/jee/admin/papers">Admin Builder</a>
            </div>
            <div>
              <h4>Founder</h4>
              <p>Rohit Poddar</p>
              <p>NIT Rourkela</p>
            </div>
          </div>
          <div className="jx-fbot">
            <p>© {new Date().getFullYear()} MatchMyInterview. Built for upcoming NITians &amp; IITians.</p>
          </div>
        </div>
      </footer>

      {err && <div className="jx-toast" role="alert">{err}</div>}
    </div>
  )
}
