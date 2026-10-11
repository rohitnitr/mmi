'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StartPanel({ testId, resuming, minutes }: { testId: string; resuming: boolean; minutes: number }) {
  const router = useRouter()
  const [ok, setOk] = useState(resuming)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function start() {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/jee/exam/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId }) })
      const j = (await res.json().catch(() => ({}))) as { error?: string; status?: string }
      if (!res.ok) throw new Error(j.error || 'Could not start. Try again.')
      router.push(j.status === 'in_progress' ? `/jee/test/${testId}/exam` : `/jee/test/${testId}/result`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not start. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="xp-start">
      <div className="xp-start-in">
        {resuming ? (
          <span style={{ fontSize: 14 }}>Your test is in progress. The clock kept running while you were away.</span>
        ) : (
          <label>
            <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
            <span>I have read the instructions. I understand the {minutes}-minute clock starts now and cannot be paused, and I get one attempt.</span>
          </label>
        )}
        <button className="xp-go" disabled={!ok || busy} onClick={start}>
          {busy ? 'Starting…' : resuming ? 'Resume test' : 'Start test'}
        </button>
        {err && <div className="xp-err">{err}</div>}
      </div>
    </div>
  )
}
