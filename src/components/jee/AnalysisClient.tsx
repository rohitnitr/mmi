'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MathText from './MathText'
import type { ComprehensiveAnalysis, QuestionAnalysisItem } from '@/lib/jee/analysis-engine'
import type { AIAnalysisReport } from '@/lib/jee/ai-analysis'
import { PRICE_PAISE, rupees } from '@/lib/jee/shared'

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void }
  }
}

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

export default function AnalysisClient({
  testId,
  testTitle,
  hasAnalysis,
  upgradePaise,
  analysis,
  aiReport,
}: {
  testId: string
  testTitle: string
  hasAnalysis: boolean
  upgradePaise: number
  analysis: ComprehensiveAnalysis
  aiReport: AIAnalysisReport
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ai' | 'subjects' | 'time' | 'solutions'>('ai')
  const [qFilter, setQFilter] = useState<'all' | 'wrong' | 'slow_wrong' | 'rushed_wrong' | 'skipped' | 'correct'>('wrong')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All')
  const [redoState, setRedoState] = useState<Record<string, { selected: string; checked: boolean; isCorrect: boolean }>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function unlockAnalysis() {
    if (busy) return
    setBusy(true)
    setMsg(null)
    try {
      const r = await fetch('/api/jee/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, tier: 'analysis' }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.orderId) {
        setMsg(d.error ?? 'Could not start payment. Please try again.')
        setBusy(false)
        return
      }
      if (!(await loadRazorpay()) || !window.Razorpay) {
        setMsg('Could not load payment gateway. Check your internet connection.')
        setBusy(false)
        return
      }

      const rz = new window.Razorpay({
        key: d.keyId,
        amount: d.amount,
        currency: d.currency,
        order_id: d.orderId,
        name: 'MatchMyInterview JEE',
        description: `Unlock Full AI Analysis · ${testTitle}`,
        prefill: { name: d.name, email: d.email, contact: d.contact },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await fetch('/api/jee/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(resp),
            })
            router.refresh()
          } catch {
            router.refresh()
          }
          setBusy(false)
        },
      })
      rz.open()
    } catch {
      setMsg('Failed to connect to checkout.')
      setBusy(false)
    }
  }

  function handleRedoCheck(q: QuestionAnalysisItem, pickedAnswer: string) {
    const isCorrect = q.qtype === 'mcq'
      ? pickedAnswer.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()
      : Math.abs(Number(pickedAnswer) - Number(q.correctAnswer)) <= (q.tolerance ?? 0.01)

    setRedoState((prev) => ({
      ...prev,
      [q.id]: { selected: pickedAnswer, checked: true, isCorrect },
    }))
  }

  const filteredQuestions = analysis.questions.filter((q) => {
    if (selectedSubjectFilter !== 'All' && q.subject !== selectedSubjectFilter) return false
    if (qFilter === 'wrong') return q.judgment === 'wrong'
    if (qFilter === 'slow_wrong') return q.timeCategory === 'slow_wrong'
    if (qFilter === 'rushed_wrong') return q.timeCategory === 'rushed_wrong'
    if (qFilter === 'skipped') return q.judgment === 'skipped'
    if (qFilter === 'correct') return q.judgment === 'correct'
    return true
  })

  return (
    <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* If student has NOT unlocked analysis, show high-converting Teaser Banner */}
      {!hasAnalysis && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1E1B4B, #0F172A)',
            border: '2px solid #6366F1',
            borderRadius: 24,
            padding: '28px 32px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(99,102,241,0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: '#6366F1', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 99 }}>
                  ★ ₹49 FULL AI ANALYSIS UPGRADE
                </span>
                <span style={{ fontSize: 13, color: '#A5B4FC', fontWeight: 600 }}>
                  Personalized NITian Coaching
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', margin: '0 0 10px', letterSpacing: '-0.02em', color: '#fff' }}>
                Want to See Exactly Where You Lost Marks?
              </h2>
              <p style={{ margin: 0, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6 }}>
                You lost <b style={{ color: '#F87171' }}>{analysis.overall.wrong * 5} potential marks</b> on negative traps.
                Unlock the complete question-by-question step solutions, chapter weakness map, careless error calculator, and your 7-day personalized NITian action plan.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#60A5FA' }}>
                {rupees(upgradePaise || PRICE_PAISE.upgrade)}
              </div>
              <button
                type="button"
                className="jx-cta"
                disabled={busy}
                onClick={unlockAnalysis}
                style={{
                  minHeight: 48,
                  padding: '0 28px',
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 10px 24px rgba(99,102,241,0.4)',
                }}
              >
                {busy ? 'Opening Payment…' : `Unlock Full AI Analysis (${rupees(upgradePaise || PRICE_PAISE.upgrade)}) ➔`}
              </button>
            </div>
          </div>
          {msg && <p style={{ color: '#FCA5A5', margin: '14px 0 0', fontSize: 14 }}>{msg}</p>}
        </div>
      )}

      {/* Analysis Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'ai', label: '🧠 AI Coach & 7-Day Plan', badge: 'NITian AI' },
          { key: 'subjects', label: '📊 Subject & Chapter Mastery', badge: `${analysis.chapters.length} Units` },
          { key: 'time', label: '⏱️ Time & Trap Matrix', badge: `${analysis.timeMetrics.timeWastedMinutes}m Wasted` },
          { key: 'solutions', label: '📝 Questions & Step Solutions', badge: `${analysis.questions.length} Qs` },
        ].map((t) => {
          const active = activeTab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                border: 0,
                borderBottom: active ? '3px solid #2563EB' : '3px solid transparent',
                background: 'transparent',
                color: active ? '#2563EB' : 'var(--mut)',
                font: '700 15px inherit',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.label}</span>
              <span
                style={{
                  fontSize: 11,
                  background: active ? 'rgba(37,99,235,0.1)' : 'var(--soft)',
                  color: active ? '#2563EB' : 'var(--mut)',
                  padding: '2px 8px',
                  borderRadius: 99,
                }}
              >
                {t.badge}
              </span>
            </button>
          )
        })}
      </div>

      {/* -------------------- TAB 1: AI COACH & 7-DAY PLAN -------------------- */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Mentor Verdict Card */}
          <div
            className="xp-card"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🧠</span>
                <b style={{ fontSize: 18, color: 'var(--ink)' }}>NITian Mentor Evaluation</b>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: 'rgba(37,99,235,0.1)', padding: '4px 12px', borderRadius: 99 }}>
                Projected: {aiReport.projectedPercentileRange}
              </span>
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', margin: '0 0 16px' }}>
              {aiReport.summaryVerdict}
            </p>

            <blockquote
              style={{
                margin: 0,
                padding: '12px 18px',
                borderLeft: '4px solid #2563EB',
                background: 'var(--card)',
                borderRadius: '0 12px 12px 0',
                fontStyle: 'italic',
                color: 'var(--mut)',
                fontSize: 14,
              }}
            >
              &ldquo;{aiReport.mentorQuote}&rdquo;
            </blockquote>

            {/* Target Milestone */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--line)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <small style={{ color: 'var(--mut)', display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                  Projected College Range
                </small>
                <b style={{ fontSize: 15, color: 'var(--ink)', marginTop: 4, display: 'block' }}>
                  {aiReport.predictedCollegeRange}
                </b>
              </div>
              <div>
                <small style={{ color: 'var(--mut)', display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                  Next Milestone Target
                </small>
                <b style={{ fontSize: 15, color: '#2563EB', marginTop: 4, display: 'block' }}>
                  {aiReport.nextMilestoneScore}
                </b>
              </div>
            </div>
          </div>

          {/* Strengths vs Critical Weaknesses Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="xp-card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🟢</span>
                <b style={{ fontSize: 16, color: '#065F46' }}>Demonstrated Strengths</b>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--ink)', display: 'grid', gap: 8 }}>
                {aiReport.keyStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="xp-card" style={{ borderLeft: '4px solid #EF4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🔴</span>
                <b style={{ fontSize: 16, color: '#991B1B' }}>Score Leaks &amp; Critical Traps</b>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--ink)', display: 'grid', gap: 8 }}>
                {aiReport.criticalWeaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Silly Mistakes & Time Traps Callouts */}
          <div className="xp-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <b style={{ fontSize: 15, color: 'var(--ink)' }}>Careless Rushed Errors</b>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--mut)', lineHeight: 1.5 }}>
                {aiReport.sillyMistakeAdvice}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>⏳</span>
                <b style={{ fontSize: 15, color: 'var(--ink)' }}>Time Wasters Diagnosis</b>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--mut)', lineHeight: 1.5 }}>
                {aiReport.timeTrapVerdict}
              </p>
            </div>
          </div>

          {/* 7-Day Personalized Action Calendar */}
          <div className="xp-card">
            <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>📅 Your 7-Day Targeted Recovery Calendar</h2>
            <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 14 }}>
              Follow this daily schedule before sitting for your next mock test to lock in a +25 mark jump.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {aiReport.sevenDayActionPlan.map((plan, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '14px 18px',
                    border: '1px solid var(--line)',
                    borderRadius: 14,
                    background: 'var(--bg2)',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 8,
                      flex: 'none',
                    }}
                  >
                    {plan.day}
                  </span>
                  <div>
                    <b style={{ fontSize: 15, display: 'block', color: 'var(--ink)' }}>{plan.focus}</b>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--mut)', lineHeight: 1.5 }}>
                      {plan.task}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: SUBJECT & CHAPTER MASTERY -------------------- */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Subject Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {Object.values(analysis.subjects).map((sub) => (
              <div
                key={sub.subject}
                className="xp-card"
                style={{
                  borderTop: `4px solid ${sub.subject === 'Physics' ? '#2563EB' : sub.subject === 'Chemistry' ? '#10B981' : '#7C3AED'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <b style={{ fontSize: 18, color: 'var(--ink)' }}>{sub.subject}</b>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '2px 10px',
                      borderRadius: 99,
                      background: sub.status === 'Strong' ? '#DCFCE7' : sub.status === 'Average' ? '#FEF3C7' : '#FEE2E2',
                      color: sub.status === 'Strong' ? '#166534' : sub.status === 'Average' ? '#92400E' : '#991B1B',
                    }}
                  >
                    {sub.status}
                  </span>
                </div>

                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                  {sub.marks} <small style={{ fontSize: 14, color: 'var(--mut)', fontWeight: 600 }}>/ {sub.maxMarks}</small>
                </div>

                <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--mut)', marginBottom: 14 }}>
                  <span><b>{sub.correct}</b> correct</span>
                  <span style={{ color: '#EF4444' }}><b>{sub.wrong}</b> wrong</span>
                  <span><b>{sub.skipped}</b> skipped</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mut)', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <span>Accuracy: <b>{sub.accuracyPct}%</b></span>
                  <span>Avg: <b>{sub.avgTimePerQSec}s</b> / Q</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chapter Mastery Breakdown Table */}
          <div className="xp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 20, margin: '0 0 4px' }}>Chapter-by-Chapter Diagnostic</h2>
                <p style={{ margin: 0, color: 'var(--mut)', fontSize: 13 }}>
                  Identifies specific syllabus chapters where you gained marks or suffered negative penalty leaks.
                </p>
              </div>
            </div>

            <div className="xp-tablewrap">
              <table className="xp-table">
                <thead>
                  <tr>
                    <th>Chapter &amp; Subject</th>
                    <th>Questions</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Marks Gained</th>
                    <th>Marks Lost</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.chapters.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <b>{c.chapter}</b>
                        <div style={{ fontSize: 12, color: 'var(--mut)' }}>{c.subject}</div>
                      </td>
                      <td>{c.total}</td>
                      <td style={{ color: '#16A34A', fontWeight: 700 }}>{c.correct}</td>
                      <td style={{ color: '#DC2626', fontWeight: 700 }}>{c.wrong}</td>
                      <td style={{ color: '#16A34A' }}>+{c.marksGained}</td>
                      <td style={{ color: '#DC2626' }}>-{c.marksLost}</td>
                      <td>
                        <b>{c.accuracyPct}%</b>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 99,
                            background:
                              c.status === 'Mastered' ? '#DCFCE7' : c.status === 'Moderate' ? '#FEF3C7' : c.status === 'Unvisited' ? 'var(--soft)' : '#FEE2E2',
                            color:
                              c.status === 'Mastered' ? '#166534' : c.status === 'Moderate' ? '#92400E' : c.status === 'Unvisited' ? 'var(--mut)' : '#991B1B',
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: TIME & TRAP MATRIX -------------------- */}
      {activeTab === 'time' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Time Metrics Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div className="xp-card">
              <small style={{ color: 'var(--mut)', fontSize: 12, fontWeight: 700 }}>TOTAL TIME USED</small>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {analysis.timeMetrics.totalTimeMinutes} <span style={{ fontSize: 14, color: 'var(--mut)' }}>min</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--mut)' }}>Avg {analysis.timeMetrics.avgTimePerAttemptedSec}s per question</span>
            </div>

            <div className="xp-card" style={{ borderLeft: '4px solid #EF4444' }}>
              <small style={{ color: '#DC2626', fontSize: 12, fontWeight: 700 }}>TIME ON 0 / NEGATIVE MARKS</small>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#DC2626' }}>
                {analysis.timeMetrics.timeWastedMinutes} <span style={{ fontSize: 14, color: 'var(--mut)' }}>min</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--mut)' }}>Invested with zero return</span>
            </div>

            <div className="xp-card" style={{ borderLeft: '4px solid #D97706' }}>
              <small style={{ color: '#D97706', fontSize: 12, fontWeight: 700 }}>SLOW-BUT-WRONG TRAPS</small>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#D97706' }}>
                {analysis.timeMetrics.slowWrongCount} <span style={{ fontSize: 14, color: 'var(--mut)' }}>Qs</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--mut)' }}>Spent &gt;3.5 min and lost marks</span>
            </div>

            <div className="xp-card" style={{ borderLeft: '4px solid #10B981' }}>
              <small style={{ color: '#059669', fontSize: 12, fontWeight: 700 }}>OPTIMAL &amp; ACCURATE</small>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#059669' }}>
                {analysis.timeMetrics.optimalCorrectCount} <span style={{ fontSize: 14, color: 'var(--mut)' }}>Qs</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--mut)' }}>Finished 45s–180s accurately</span>
            </div>
          </div>

          {/* Time Management Trap Advice */}
          <div className="xp-card">
            <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>⏱️ Speed &amp; Accuracy Traps Analysis</h2>
            <p style={{ margin: '0 0 16px', color: 'var(--mut)', fontSize: 14 }}>
              The #1 differentiator for a 99%ile rank is recognizing time-sinks within the first 40 seconds.
            </p>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ padding: 16, borderRadius: 14, background: 'var(--soft)', border: '1px solid var(--line)' }}>
                <b style={{ color: '#DC2626', fontSize: 15 }}>🔴 The Slow-Wrong Sinks ({analysis.timeMetrics.slowWrongCount} questions)</b>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--mut)' }}>
                  Questions where you spent more than 3.5 minutes doing algebra, but still bubbled the wrong answer.
                  Rule: If you haven&apos;t formulated a clear 2-step equation within 90 seconds, bookmark and skip immediately.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 14, background: 'var(--soft)', border: '1px solid var(--line)' }}>
                <b style={{ color: '#D97706', fontSize: 15 }}>🟡 The Rushed Impulsive Mistakes ({analysis.timeMetrics.rushedWrongCount} questions)</b>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--mut)' }}>
                  Questions answered in under 45 seconds that missed the right option. These are pure careless errors (sign slips, missing units).
                  Eliminating these recovers approximately <b>+{analysis.timeMetrics.potentialMarksLostToCareless} marks</b>!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 4: QUESTIONS & STEP SOLUTIONS -------------------- */}
      {activeTab === 'solutions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 18,
              padding: '14px 18px',
            }}
          >
            {/* Filter by Category */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `All (${analysis.questions.length})` },
                { key: 'wrong', label: `❌ Wrong (${analysis.overall.wrong})` },
                { key: 'slow_wrong', label: `⏳ Slow & Wrong (${analysis.timeMetrics.slowWrongCount})` },
                { key: 'rushed_wrong', label: `⚡ Rushed Wrong (${analysis.timeMetrics.rushedWrongCount})` },
                { key: 'skipped', label: `⏭️ Skipped (${analysis.overall.skipped})` },
                { key: 'correct', label: `✅ Correct (${analysis.overall.correct})` },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setQFilter(f.key as typeof qFilter)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: '1px solid',
                    borderColor: qFilter === f.key ? '#2563EB' : 'var(--line)',
                    background: qFilter === f.key ? '#2563EB' : 'var(--bg)',
                    color: qFilter === f.key ? '#fff' : 'var(--ink)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filter by Subject */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Physics', 'Chemistry', 'Mathematics'].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(sub)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: selectedSubjectFilter === sub ? '#2563EB' : 'var(--line)',
                    background: selectedSubjectFilter === sub ? 'rgba(37,99,235,0.1)' : 'transparent',
                    color: selectedSubjectFilter === sub ? '#2563EB' : 'var(--mut)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredQuestions.length === 0 ? (
              <div className="xp-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <b>No questions match this filter.</b>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const redo = redoState[q.id]
                return (
                  <div
                    key={q.id}
                    className="xp-card"
                    style={{
                      borderLeft: `5px solid ${q.judgment === 'correct' ? '#16A34A' : q.judgment === 'wrong' ? '#DC2626' : '#94A3B8'}`,
                      position: 'relative',
                    }}
                  >
                    {/* Top Meta Line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#2563EB' }}>
                          Q{q.position}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--mut)', fontWeight: 600 }}>
                          {q.subject} · {q.chapter}
                        </span>
                        {q.topic && <span style={{ fontSize: 12, background: 'var(--soft)', padding: '2px 8px', borderRadius: 99 }}>{q.topic}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 99,
                            background: q.judgment === 'correct' ? '#DCFCE7' : q.judgment === 'wrong' ? '#FEE2E2' : 'var(--soft)',
                            color: q.judgment === 'correct' ? '#166534' : q.judgment === 'wrong' ? '#991B1B' : 'var(--mut)',
                          }}
                        >
                          {q.judgment === 'correct' ? `+${q.marks} Correct` : q.judgment === 'wrong' ? `-${q.negative} Wrong` : '0 Skipped'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--mut)' }}>
                          ⏱️ {q.timeSpentSec}s
                        </span>
                      </div>
                    </div>

                    {/* Question Body with KaTeX */}
                    <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}>
                      <MathText text={q.body} />
                    </div>

                    {q.image_url && (
                      <div style={{ margin: '12px 0' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={q.image_url} alt="Question Figure" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10 }} />
                      </div>
                    )}

                    {/* MCQ Options with Colors */}
                    {q.qtype === 'mcq' && q.options && (
                      <div style={{ display: 'grid', gap: 8, margin: '14px 0' }}>
                        {q.options.map((opt, idx) => {
                          const letter = ['A', 'B', 'C', 'D'][idx]
                          const isCorrectKey = hasAnalysis && letter === q.correctAnswer
                          const isStudentPicked = letter === q.userResponse

                          let borderColor = 'var(--line)'
                          let bg = 'var(--bg)'
                          if (isCorrectKey) {
                            borderColor = '#16A34A'
                            bg = '#F0FDF4'
                          } else if (isStudentPicked && q.judgment === 'wrong') {
                            borderColor = '#DC2626'
                            bg = '#FEF2F2'
                          }

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 14px',
                                border: `1px solid ${borderColor}`,
                                borderRadius: 12,
                                background: bg,
                                fontSize: 14,
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: isCorrectKey ? '#16A34A' : isStudentPicked ? '#DC2626' : 'var(--soft)',
                                  color: isCorrectKey || isStudentPicked ? '#fff' : 'var(--ink)',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  flex: 'none',
                                }}
                              >
                                {letter}
                              </span>
                              <div style={{ flex: 1 }}>
                                <MathText text={opt} />
                              </div>
                              {isCorrectKey && <span style={{ color: '#16A34A', fontSize: 12, fontWeight: 700 }}>✓ Correct Key</span>}
                              {isStudentPicked && !isCorrectKey && <span style={{ color: '#DC2626', fontSize: 12, fontWeight: 700 }}>Your Answer</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Numeric Response vs Key */}
                    {q.qtype === 'numeric' && (
                      <div style={{ margin: '14px 0', padding: '12px 16px', background: 'var(--soft)', borderRadius: 12, display: 'flex', gap: 20 }}>
                        <div>
                          <small style={{ color: 'var(--mut)', fontSize: 12 }}>Your response:</small>
                          <div style={{ fontSize: 16, fontWeight: 800, color: q.judgment === 'correct' ? '#16A34A' : '#DC2626' }}>
                            {q.userResponse ?? 'Unanswered'}
                          </div>
                        </div>
                        {hasAnalysis && (
                          <div>
                            <small style={{ color: 'var(--mut)', fontSize: 12 }}>Correct answer key:</small>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#16A34A' }}>
                              {q.correctAnswer} {q.tolerance ? `(±${q.tolerance})` : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step-by-Step Solution or Locked Teaser */}
                    {hasAnalysis ? (
                      q.solution && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: '14px 18px',
                            background: 'var(--soft)',
                            borderLeft: '4px solid #2563EB',
                            borderRadius: '0 12px 12px 0',
                          }}
                        >
                          <b style={{ color: '#2563EB', fontSize: 13, display: 'block', marginBottom: 6 }}>
                            💡 Step-by-Step Solution &amp; Concept
                          </b>
                          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>
                            <MathText text={q.solution} />
                          </div>
                        </div>
                      )
                    ) : (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 14,
                          borderRadius: 12,
                          background: 'rgba(99,102,241,0.06)',
                          border: '1px dashed #6366F1',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--mut)' }}>
                          🔒 Step-by-step solution is locked. Unlock full analysis to view formula derivation.
                        </span>
                        <button
                          type="button"
                          className="jx-cta sm"
                          onClick={unlockAnalysis}
                          style={{ background: '#6366F1', borderColor: '#6366F1', flex: 'none' }}
                        >
                          Unlock Solution
                        </button>
                      </div>
                    )}

                    {/* Interactive Redo Bar */}
                    {q.judgment !== 'correct' && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                          🎯 Practice Redo:
                        </span>
                        {q.qtype === 'mcq' && q.options && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {['A', 'B', 'C', 'D'].map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => handleRedoCheck(q, l)}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  border: '1px solid var(--line)',
                                  background: redo?.selected === l ? (redo.isCorrect ? '#16A34A' : '#DC2626') : 'var(--card)',
                                  color: redo?.selected === l ? '#fff' : 'var(--ink)',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                        {redo?.checked && (
                          <span style={{ fontSize: 13, fontWeight: 800, color: redo.isCorrect ? '#16A34A' : '#DC2626' }}>
                            {redo.isCorrect ? '✓ Nailed it on redo!' : '✗ Still incorrect, read the solution above.'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
