'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICE_PAISE, rupees, type Tier, type TestState } from '@/lib/jee/shared'

declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } }
}

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

const MOCK_POINTS = ['Full-length JEE-style mock', 'Server-timed attempt with autosave', 'Marks, rank and percentile', 'Leaderboard access']
const FULL_POINTS = ['Everything in the mock test', 'Every mistake by chapter and topic', 'Time spent on each question', 'Slow-but-wrong list and practice plan']

export default function StoreClient({ states }: { states: TestState[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<Msg>(null)

  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 7000); return () => clearTimeout(t) }, [msg])

  async function buy(testId: string, tier: Tier) {
    if (busy) return
    setBusy(testId + tier); setMsg(null)
    try {
      const r = await fetch('/api/jee/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId, tier }) })
      const d = (await r.json().catch(() => ({}))) as { error?: string; orderId?: string; amount?: number; currency?: string; keyId?: string; name?: string; email?: string; contact?: string }
      if (!r.ok || !d.orderId) {
        setMsg({ ok: false, text: d.error ?? 'Could not start the payment.' })
        setBusy('')
        if (r.status === 409) router.refresh()
        return
      }
      if (!(await loadRazorpay()) || !window.Razorpay) { setMsg({ ok: false, text: 'Could not load the payment window. Check your internet and try again.' }); setBusy(''); return }

      const rz = new window.Razorpay({
        key: d.keyId, amount: d.amount, currency: d.currency, order_id: d.orderId,
        name: 'MatchMyInterview', description: tier === 'mock' ? 'JEE mock test' : 'JEE mock with full analysis',
        prefill: { name: d.name, email: d.email, contact: d.contact },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setBusy('') },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const v = await fetch('/api/jee/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resp) })
            if (v.ok) setMsg({ ok: true, text: 'Payment received. Your mock is unlocked.' })
            else setMsg({ ok: true, text: 'Payment received. If it does not unlock in a minute, refresh this page.' })
          } catch {
            setMsg({ ok: true, text: 'Payment received. If it does not unlock in a minute, refresh this page.' })
          }
          setBusy('')
          router.refresh()
        },
      })
      rz.open()
    } catch {
      setMsg({ ok: false, text: 'No connection. Please try again.' })
      setBusy('')
    }
  }

  if (states.length === 0) {
    return (
      <div className="js-store">
        <div className="js-item locked"><span className="js-lock">{'\uD83D\uDD12'} Opens soon</span><h3>Mock test</h3><div className="jx-amt">{rupees(PRICE_PAISE.mock)}<small> per mock</small></div><ul className="js-pts">{MOCK_POINTS.map((x) => <li key={x}>{x}</li>)}</ul><button type="button" className="jx-cta js-full" disabled>Opens soon</button></div>
        <div className="js-item locked best"><span className="js-lock">{'\uD83D\uDD12'} Opens soon</span><h3>Mock + full analysis</h3><div className="jx-amt">{rupees(PRICE_PAISE.analysis)}<small> per mock</small></div><ul className="js-pts">{FULL_POINTS.map((x) => <li key={x}>{x}</li>)}</ul><button type="button" className="jx-cta js-full" disabled>Opens soon</button></div>
      </div>
    )
  }

  return (
    <>
      {states.map((s) => {
        const id = s.test.id
        const done = s.attempt === 'done'
        return (
          <section key={id} className="js-test">
            <h2 className="jd-h2" style={{ marginTop: 28 }}>{s.test.title}</h2>
            <p className="jx-small" style={{ margin: '0 0 4px' }}>Full JEE-style paper · {s.test.duration_minutes} minutes</p>
            <div className="js-store">
              {/* Item 1: mock only */}
              <div className={`js-item ${s.hasMock && !done ? 'open' : 'locked'}`}>
                <span className="js-lock">{done ? '\uD83D\uDD12 Completed' : s.hasMock ? '\u2713 Unlocked' : '\uD83D\uDD12 Locked'}</span>
                <h3>Mock test</h3>
                <div className="jx-amt">{rupees(PRICE_PAISE.mock)}<small> per mock</small></div>
                <ul className="js-pts">{MOCK_POINTS.map((x) => <li key={x}>{x}</li>)}</ul>
                {done
                  ? <p className="jx-small js-note">You have taken this mock, so it is locked again.</p>
                  : s.hasMock
                    ? <a className="jx-cta js-full" href={`/jee/test/${id}`}>{s.attempt === 'in_progress' ? 'Resume test' : 'Start test'}</a>
                    : <button type="button" className="jx-cta js-full" disabled={!!busy} onClick={() => buy(id, 'mock')}>{busy === id + 'mock' ? 'Opening payment\u2026' : `Buy for ${rupees(PRICE_PAISE.mock)}`}</button>}
              </div>

              {/* Item 2: mock + full analysis */}
              <div className={`js-item best ${s.hasAnalysis ? 'open' : 'locked'}`}>
                <em className="js-flag">Best value</em>
                <span className="js-lock">{s.hasAnalysis ? '\u2713 Unlocked' : '\uD83D\uDD12 Locked'}</span>
                <h3>Mock + full analysis</h3>
                <div className="jx-amt">{rupees(PRICE_PAISE.analysis)}<small> per mock</small></div>
                <ul className="js-pts">{FULL_POINTS.map((x) => <li key={x}>{x}</li>)}</ul>
                {s.hasAnalysis
                  ? (done
                    ? <a className="jx-cta js-full" href={`/jee/test/${id}`}>View my analysis</a>
                    : <><a className="jx-cta js-full" href={`/jee/test/${id}`}>{s.attempt === 'in_progress' ? 'Resume test' : 'Start test'}</a><p className="jx-small js-note">Your full analysis opens as soon as you submit.</p></>)
                  : <>
                      <button type="button" className="jx-cta js-full" disabled={!!busy} onClick={() => buy(id, 'analysis')}>
                        {busy === id + 'analysis' ? 'Opening payment\u2026' : s.hasMock ? `Add analysis for ${rupees(s.analysisPaise)}` : `Buy for ${rupees(s.analysisPaise)}`}
                      </button>
                      {s.hasMock && <p className="jx-small js-note">{done ? 'Your test is done. Add the analysis to see exactly where you lost marks.' : 'You already own the mock, so you only pay the difference.'}</p>}
                    </>}
              </div>
            </div>
          </section>
        )
      })}
      {msg && <div className={`jx-toast${msg.ok ? ' ok' : ''}`} role="status">{msg.text}</div>}
    </>
  )
}
