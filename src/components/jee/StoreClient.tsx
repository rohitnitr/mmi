'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICE_PAISE, rupees, type Tier, type TestState } from '@/lib/jee/shared'
import {
  NITIAN_FULL_MOCKS,
  CLASS_WISE_MOCKS,
  SUBJECT_WISE_MOCKS,
  TOPIC_TREE,
  PYQ_YEAR_DATA,
  type CatalogMockItem,
} from '@/lib/jee/catalog-data'

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void }
  }
}

// ---- Store switches: edit these to open or close parts of the store ----
// 'true' = students can buy and start tests in that section (a test also needs to be live and have questions).
const SECTION_OPEN = { full: true, class: false, subject: false, topic: false } as const
const SHOW_FREE_PYQ_TAB = false

type Msg = { ok: boolean; text: string } | null

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const MOCK_POINTS = [
  'Full JEE-style exam interface',
  'Server-timed attempt with autosave',
  'Marks, rank & percentile benchmark',
  'NITian verified question patterns',
]
const FULL_POINTS = [
  'Everything in Mock test tier',
  'Subject, chapter & topic mistake breakdown',
  'Time-spent-per-question analysis',
  'Personalized AI remediation suggestions',
]

export default function StoreClient({ states = [] }: { states: TestState[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'premium' | 'free'>('premium')
  const [activeSubject, setActiveSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics')
  const [selectedPyqYear, setSelectedPyqYear] = useState<number>(2026)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({
    '2026-01-24': true,
    '2025-01-27': true,
  })
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<Msg>(null)

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 7000)
    return () => clearTimeout(t)
  }, [msg])

  // Map database states by ID and by title for easy lookup
  const stateById = useMemo(() => {
    const map = new Map<string, TestState>()
    for (const s of states) {
      map.set(s.test.id, s)
      if (s.test.title) map.set(s.test.title.toLowerCase().trim(), s)
    }
    return map
  }, [states])

  // Helper to find existing state for a catalog item
  function getState(item: { id: string; title: string; isFree?: boolean; pricePaise?: number }): TestState {
    const direct = stateById.get(item.id) || stateById.get(item.title.toLowerCase().trim())
    if (direct) return direct

    // Fallback synthesized state for preview / dummy items before DB sync
    return {
      test: {
        id: item.id,
        title: item.title,
        kind: 'full',
        class_level: null,
        duration_minutes: 180,
        is_free: item.isFree ?? false,
        price_paise: item.pricePaise ?? 1100,
      },
      hasMock: item.isFree ?? false,
      hasAnalysis: item.isFree ?? false,
      attempt: 'none',
      canStart: item.isFree ?? false,
      analysisPaise: PRICE_PAISE.analysis,
    }
  }

  // A catalog card is only sellable when a LIVE test with questions exists for it in the database.
  const isLive = (item: { id: string; title: string }) =>
    stateById.has(item.id) || stateById.has(item.title.toLowerCase().trim())

  async function buy(testId: string, tier: Tier, title?: string) {
    if (busy) return
    setBusy(testId + tier)
    setMsg(null)
    try {
      const r = await fetch('/api/jee/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, tier }),
      })
      const d = (await r.json().catch(() => ({}))) as {
        error?: string
        orderId?: string
        amount?: number
        currency?: string
        keyId?: string
        name?: string
        email?: string
        contact?: string
      }
      if (!r.ok || !d.orderId) {
        setMsg({ ok: false, text: d.error ?? 'Could not start payment. Please try again.' })
        setBusy('')
        if (r.status === 409) router.refresh()
        return
      }
      if (!(await loadRazorpay()) || !window.Razorpay) {
        setMsg({ ok: false, text: 'Could not load payment gateway. Check your connection.' })
        setBusy('')
        return
      }

      const rz = new window.Razorpay({
        key: d.keyId,
        amount: d.amount,
        currency: d.currency,
        order_id: d.orderId,
        name: 'MatchMyInterview JEE',
        description: `${title ?? 'JEE Mock'} (${tier === 'mock' ? 'Mock Test' : 'Full Analysis'})`,
        prefill: { name: d.name, email: d.email, contact: d.contact },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setBusy('') },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const v = await fetch('/api/jee/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(resp),
            })
            if (v.ok) {
              setMsg({ ok: true, text: 'Payment successful! Your test is unlocked.' })
            } else {
              setMsg({ ok: true, text: 'Payment received. Refresh in a moment if not unlocked immediately.' })
            }
          } catch {
            setMsg({ ok: true, text: 'Payment verified. Refreshing status…' })
          }
          setBusy('')
          router.refresh()
        },
      })
      rz.open()
    } catch {
      setMsg({ ok: false, text: 'Connection issue. Please retry.' })
      setBusy('')
    }
  }

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }))
  }

  const soonCard = (item: CatalogMockItem) => (
    <div
      key={item.id}
      className="js-item locked"
      style={{ borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', opacity: 0.88 }}
    >
      <div style={{ marginBottom: 12 }}>
        <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: 'rgba(217,119,6,0.14)', color: '#B45309' }}>
          {'\u23f3 Coming soon'}
        </span>
      </div>
      <h3 style={{ fontSize: 18, margin: '0 0 8px', lineHeight: 1.35, fontWeight: 700 }}>{item.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mut)', margin: '0 0 16px', lineHeight: 1.5 }}>{item.description}</p>
      <div style={{ marginTop: 'auto' }}>
        <button type="button" className="jx-cta js-full" disabled style={{ minHeight: 44, opacity: 0.6, cursor: 'not-allowed' }}>
          Coming soon
        </button>
      </div>
    </div>
  )

  // Render a standard mock card with Buy Again / Retake / Start / Resume logic
  const renderCard = (item: CatalogMockItem, badgeColor = '#2563EB', sectionOpen = true) => {
    const s = getState(item)
    const id = s.test.id
    const done = s.attempt === 'done' && !s.canStart
    const inProgress = s.attempt === 'in_progress'
    const isFree = Boolean(s.test.is_free)
    const cost = s.test.price_paise ? s.test.price_paise : PRICE_PAISE.mock
    if (!sectionOpen || !isLive(item)) return soonCard(item)

    return (
      <div
        key={item.id}
        className={`js-item ${s.hasMock && !done ? 'open' : 'locked'} ${item.difficulty === 'Advanced' ? 'best' : ''}`}
        style={{ borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column' }}
      >
        {item.badge && (
          <span
            style={{
              position: 'absolute',
              top: -12,
              right: 18,
              background: `linear-gradient(135deg, ${badgeColor}, #7C3AED)`,
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: 99,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {item.badge}
          </span>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800,
              background: done ? '#FEF3C7' : s.hasMock ? '#DCFCE7' : 'var(--soft)',
              color: done ? '#92400E' : s.hasMock ? '#166534' : 'var(--mut)',
            }}
          >
            {done ? '✓ Completed' : inProgress ? '⚡ In Progress' : s.hasMock ? '✓ Unlocked' : '🔒 Locked'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--mut)', fontWeight: 600 }}>
            {item.questionCount} Qs · {item.durationMinutes} min
          </span>
        </div>

        <h3 style={{ fontSize: 18, margin: '0 0 8px', lineHeight: 1.35, fontWeight: 700 }}>{item.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--mut)', margin: '0 0 16px', lineHeight: 1.5, flex: 'none' }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '0 0 14px' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {isFree ? 'FREE' : rupees(cost)}
          </div>
          {!isFree && <small style={{ color: 'var(--mut)', fontSize: 13 }}>/ one-time mock</small>}
        </div>

        {/* Feature Highlights */}
        <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, flex: 1 }}>
          {item.highlights.map((pt, i) => (
            <li
              key={i}
              style={{
                position: 'relative',
                paddingLeft: 22,
                fontSize: 13,
                marginBottom: 6,
                color: 'var(--ink)',
                opacity: 0.9,
              }}
            >
              <span style={{ position: 'absolute', left: 0, color: '#16A34A', fontWeight: 800 }}>✓</span>
              {pt}
            </li>
          ))}
        </ul>

        {/* Action Button Area */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>Previous attempt:</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#2563EB' }}>
                  {s.score !== null && s.score !== undefined ? `${s.score}/300` : 'Submitted'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`/jee/test/${id}/result`}
                  className="jx-cta alt"
                  style={{ flex: 1, minHeight: 44, fontSize: 13, padding: '0 10px', textAlign: 'center' }}
                >
                  View Analysis
                </a>
                <button
                  type="button"
                  className="jx-cta"
                  style={{ flex: 1.2, minHeight: 44, fontSize: 13 }}
                  disabled={!!busy}
                  onClick={() => buy(id, 'mock', item.title)}
                >
                  {busy === id + 'mock' ? 'Opening…' : isFree ? 'Retake Free' : `Buy Again (${rupees(cost)})`}
                </button>
              </div>
            </div>
          ) : inProgress ? (
            <a href={`/jee/test/${id}`} className="jx-cta js-full" style={{ minHeight: 44 }}>
              Resume Test ➔
            </a>
          ) : s.hasMock || isFree ? (
            <a href={`/jee/test/${id}`} className="jx-cta js-full" style={{ minHeight: 44 }}>
              Start Test Now ➔
            </a>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="jx-cta js-full"
                disabled={!!busy}
                onClick={() => buy(id, 'mock', item.title)}
                style={{ flex: 1 }}
              >
                {busy === id + 'mock' ? 'Opening…' : `Buy Mock (${rupees(cost)})`}
              </button>
              <button
                type="button"
                className="jx-cta alt"
                disabled={!!busy}
                onClick={() => buy(id, 'analysis', item.title)}
                title="Mock Test + Full Chapter Mistake Analysis"
                style={{ padding: '0 14px' }}
              >
                + Analysis ({rupees(PRICE_PAISE.analysis)})
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentYearGroup = PYQ_YEAR_DATA.find((y) => y.year === selectedPyqYear) ?? PYQ_YEAR_DATA[0]

  return (
    <div style={{ marginTop: 24 }}>
      {/* Top NITian Trust Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 24,
          padding: '24px 28px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
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
            ★ PREPARED BY NITIANS
          </span>
          <span style={{ fontSize: 13, color: '#2563EB', fontWeight: 700 }}>
            Curated by Rohit Poddar (NIT Rourkela)
          </span>
        </div>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Questions Chosen by NITians for Upcoming NITians &amp; IITians
        </h2>
        <p style={{ margin: 0, color: 'var(--mut)', fontSize: 15, maxWidth: 820, lineHeight: 1.55 }}>
          Practise high-probability question patterns, common traps and time-saving techniques,
          with a JEE-style exam interface, server-timed attempts and instant analytics.
        </p>
      </div>

      {/* Slide Switch / Toggle Switch: Premium vs Free */}
      {SHOW_FREE_PYQ_TAB && (
<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            padding: 5,
            borderRadius: 99,
            gap: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('premium')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              borderRadius: 99,
              border: 0,
              font: '700 15px inherit',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.2, 1, 0.3, 1)',
              background: tab === 'premium' ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : 'transparent',
              color: tab === 'premium' ? '#fff' : 'var(--mut)',
              boxShadow: tab === 'premium' ? '0 6px 18px rgba(37,99,235,0.35)' : 'none',
            }}
          >
            <span>⭐</span>
            <span>Premium Mocks</span>
            <span
              style={{
                fontSize: 11,
                background: tab === 'premium' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.06)',
                padding: '2px 8px',
                borderRadius: 99,
              }}
            >
              From ₹11
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('free')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              borderRadius: 99,
              border: 0,
              font: '700 15px inherit',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.2, 1, 0.3, 1)',
              background: tab === 'free' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
              color: tab === 'free' ? '#fff' : 'var(--mut)',
              boxShadow: tab === 'free' ? '0 6px 18px rgba(16,185,129,0.35)' : 'none',
            }}
          >
            <span>🎁</span>
            <span>Free PYQs (2020–2026)</span>
            <span
              style={{
                fontSize: 11,
                background: tab === 'free' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.06)',
                padding: '2px 8px',
                borderRadius: 99,
              }}
            >
              50+ Shifts
            </span>
          </button>
        </div>
      </div>
)}

      {/* -------------------- TAB 1: PREMIUM -------------------- */}
      {tab === 'premium' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {/* Section 1: 3 Sets of Full Mocks Curated by NITians */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#2563EB', letterSpacing: '0.06em' }}>
                SECTION 01
              </span>
              <h2 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>
                Full Syllabus Mock Tests — Curated by NITians (3 Levels)
              </h2>
            </div>
            <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 14 }}>
              Three progressive difficulty tiers designed to test your syllabus coverage, benchmark your percentile, and
              build stamina for the real 300-mark JEE Main paper.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {NITIAN_FULL_MOCKS.map((m) => renderCard(m, '#2563EB', SECTION_OPEN.full))}
            </div>
          </section>

          {/* Section 2: Class-Wise Special Mock Tests */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', letterSpacing: '0.06em' }}>
                SECTION 02
              </span>
              <h2 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>Class-Wise Special Mocks</h2>
            </div>
            <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 14 }}>
              Targeted mocks matching your current academic stage: clear Class 11 backlogs, master Class 12 board + JEE
              balance, or take the comprehensive repeater test.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {CLASS_WISE_MOCKS.map((m) => renderCard(m, '#7C3AED', SECTION_OPEN.class))}
            </div>
          </section>

          {/* Section 3: Subject-Wise Sectional Mocks */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#059669', letterSpacing: '0.06em' }}>
                SECTION 03
              </span>
              <h2 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>Subject-Wise Sectional Tests</h2>
            </div>
            <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 14 }}>
              Fix weak individual subjects with focused 60-minute sectional mocks (25 Questions · 100 Marks).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {SUBJECT_WISE_MOCKS.map((m) => renderCard(m, '#059669', SECTION_OPEN.subject))}
            </div>
          </section>

          {/* Section 4: Topic-Wise Mock Tests (Layered Tree Structure) */}
          {SECTION_OPEN.topic ? (
<section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#D97706', letterSpacing: '0.06em' }}>
                SECTION 04
              </span>
              <h2 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>
                Topic-Wise Mocks (Layered Tree Structure)
              </h2>
            </div>
            <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 14 }}>
              Click any subject to expand high-weightage chapters and topic modules. Test individual units in 45-minute timed
              mini-mocks for ₹11.
            </p>

            {/* Subject Selector Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => {
                const count = TOPIC_TREE[sub].length
                const active = activeSubject === sub
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubject(sub)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 14,
                      border: '1px solid',
                      borderColor: active ? '#2563EB' : 'var(--line)',
                      background: active ? 'rgba(37,99,235,0.1)' : 'var(--card)',
                      color: active ? '#2563EB' : 'var(--ink)',
                      font: '700 14px inherit',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{sub === 'Physics' ? '⚡' : sub === 'Chemistry' ? '🧪' : '📐'}</span>
                    <span>{sub} Topics</span>
                    <span
                      style={{
                        fontSize: 11,
                        background: active ? '#2563EB' : 'var(--soft)',
                        color: active ? '#fff' : 'var(--mut)',
                        padding: '2px 8px',
                        borderRadius: 99,
                      }}
                    >
                      {count} Modules
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Tree Nodes List */}
            <div
              style={{
                display: 'grid',
                gap: 12,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800 }}>
                  📂 {activeSubject} Syllabus Tree ({TOPIC_TREE[activeSubject].length} chapters)
                </div>
                <div style={{ fontSize: 13, color: 'var(--mut)' }}>Standard ₹11 / topic test</div>
              </div>

              {TOPIC_TREE[activeSubject].map((topic, idx) => {
                const s = getState({ id: topic.id, title: topic.title, pricePaise: topic.pricePaise })
                const done = s.attempt === 'done'
                const inProgress = s.attempt === 'in_progress'

                return (
                  <div
                    key={topic.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 18px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: 14,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--soft)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          color: 'var(--mut)',
                          flex: 'none',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <b style={{ fontSize: 15, color: 'var(--ink)' }}>{topic.title}</b>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: 'rgba(37,99,235,0.1)',
                              color: '#2563EB',
                              padding: '2px 8px',
                              borderRadius: 99,
                            }}
                          >
                            {topic.badge}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--mut)' }}>{topic.description}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: 'var(--mut)', fontWeight: 600 }}>
                        {topic.questionCount} Qs · {topic.durationMinutes} min
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                        {rupees(topic.pricePaise)}
                      </span>

                      {done ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <a href={`/jee/test/${s.test.id}/result`} className="jx-cta alt sm">
                            Result
                          </a>
                          <button
                            type="button"
                            className="jx-cta sm"
                            disabled={!!busy}
                            onClick={() => buy(s.test.id, 'mock', topic.title)}
                          >
                            Buy Again
                          </button>
                        </div>
                      ) : inProgress ? (
                        <a href={`/jee/test/${s.test.id}`} className="jx-cta sm">
                          Resume
                        </a>
                      ) : s.hasMock ? (
                        <a href={`/jee/test/${s.test.id}`} className="jx-cta sm">
                          Start Test
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="jx-cta sm"
                          disabled={!!busy}
                          onClick={() => buy(s.test.id, 'mock', topic.title)}
                        >
                          {busy === s.test.id + 'mock' ? 'Opening…' : 'Buy Test (₹11)'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
) : (
<section>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#D97706', letterSpacing: '0.06em' }}>SECTION 04</span>
                <h2 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>Topic-Wise Mocks</h2>
              </div>
              <div style={{ border: '1px dashed var(--line)', borderRadius: 16, padding: 20, color: 'var(--mut)', fontSize: 14 }}>
                {'\u23f3 Coming soon. Chapter-wise topic tests are being prepared.'}
              </div>
            </section>
)}
        </div>
      )}

      {/* -------------------- TAB 2: FREE PYQs (2020 - 2026) -------------------- */}
      {tab === 'free' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 20,
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    background: '#10B981',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 99,
                  }}
                >
                  100% FREE ARCHIVE
                </span>
                <b style={{ fontSize: 16 }}>NTA JEE Main Shift Papers (2020 – 2026)</b>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--mut)' }}>
                Every single authentic paper arranged hierarchically by <b>Year ➔ Exam Date ➔ Shift 1 / Shift 2</b>.
                Zero cost, instant access, with real JEE interface and autosave.
              </p>
            </div>
          </div>

          {/* Year Selector Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PYQ_YEAR_DATA.map((yg) => {
              const active = selectedPyqYear === yg.year
              return (
                <button
                  key={yg.year}
                  type="button"
                  onClick={() => setSelectedPyqYear(yg.year)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 14,
                    border: '1px solid',
                    borderColor: active ? '#10B981' : 'var(--line)',
                    background: active ? '#10B981' : 'var(--card)',
                    color: active ? '#fff' : 'var(--ink)',
                    font: '700 15px inherit',
                    cursor: 'pointer',
                    boxShadow: active ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {yg.year} Papers ({yg.totalPapers})
                </button>
              )
            })}
          </div>

          {/* Exam Dates & Shifts Tree */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>
              📅 {selectedPyqYear} Official Exam Sessions ({currentYearGroup.dates.length} Dates Available)
            </div>

            {currentYearGroup.dates.map((dg) => {
              const isOpen = expandedDates[dg.dateKey] ?? true
              return (
                <div
                  key={dg.dateKey}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'var(--bg)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleDate(dg.dateKey)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      background: 'var(--soft)',
                      border: 0,
                      borderBottom: isOpen ? '1px solid var(--line)' : 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: '700 15px inherit',
                      color: 'var(--ink)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{isOpen ? '▾' : '▸'}</span>
                      <span>{dg.displayDate}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>
                      {dg.shifts.length} Shifts · Click to {isOpen ? 'collapse' : 'expand'}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: 16,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {dg.shifts.map((sh) => {
                        const s = getState({ id: sh.testId, title: sh.title, isFree: true })
                        const done = s.attempt === 'done'
                        const inProgress = s.attempt === 'in_progress'

                        return (
                          <div
                            key={sh.testId}
                            style={{
                              border: '1px solid var(--line)',
                              borderRadius: 14,
                              padding: 16,
                              background: 'var(--card)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: 12,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 6,
                                }}
                              >
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
                                  {sh.shiftName}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--mut)' }}>{sh.timeSlot}</span>
                              </div>
                              <b style={{ fontSize: 15, display: 'block', color: 'var(--ink)' }}>{sh.title}</b>
                              <span style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4, display: 'block' }}>
                                75 Questions · 300 Marks · 180 Min
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {done ? (
                                <>
                                  <a
                                    href={`/jee/test/${s.test.id}/result`}
                                    className="jx-cta alt sm"
                                    style={{ flex: 1, textAlign: 'center' }}
                                  >
                                    View Score
                                  </a>
                                  <a
                                    href={`/jee/test/${s.test.id}`}
                                    className="jx-cta sm"
                                    style={{ flex: 1, textAlign: 'center' }}
                                  >
                                    Retake Free
                                  </a>
                                </>
                              ) : inProgress ? (
                                <a
                                  href={`/jee/test/${s.test.id}`}
                                  className="jx-cta sm"
                                  style={{ width: '100%', textAlign: 'center' }}
                                >
                                  Resume Shift ➔
                                </a>
                              ) : (
                                <a
                                  href={`/jee/test/${s.test.id}`}
                                  className="jx-cta sm"
                                  style={{
                                    width: '100%',
                                    textAlign: 'center',
                                    background: '#10B981',
                                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                                  }}
                                >
                                  Start Free Test ➔
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {msg && (
        <div className={`jx-toast${msg.ok ? ' ok' : ''}`} role="status">
          {msg.text}
        </div>
      )}
    </div>
  )
}
