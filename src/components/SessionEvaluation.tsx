'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authedFetch, CSS, EvaluationForm, type PendingItem } from './EvaluationCenter'

type Context = PendingItem & { alreadyEvaluated: boolean }

// Opens the evaluation form for one session (used inside the chat room).
export default function SessionEvaluation({
  sessionId, onClose, onDone, cancelLabel = 'Cancel',
}: { sessionId: string; onClose: () => void; onDone: () => void; cancelLabel?: string }) {
  const [ctx, setCtx] = useState<Context | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    authedFetch(`/api/evaluations/context?sessionId=${encodeURIComponent(sessionId)}`)
      .then(async res => {
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'Could not load the evaluation form.')
        if (!cancelled) setCtx(json as Context)
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the evaluation form.')
      })
    return () => { cancelled = true }
  }, [sessionId])

  const shell = (body: ReactNode) => (
    <div className="ec-overlay" onClick={onClose}>
      <style>{CSS}</style>
      <div className="ec-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        {body}
        <div className="ec-actions">
          <button type="button" className="ec-btn ec-btn-quiet" onClick={onClose}>{cancelLabel === 'Skip for now' ? 'Continue' : 'Close'}</button>
        </div>
      </div>
    </div>
  )

  if (error) return shell(<p className="ec-error" role="alert">{error}</p>)
  if (!ctx) return shell(<p className="ec-note">Loading…</p>)
  if (ctx.alreadyEvaluated) return shell(<p className="ec-note">You already evaluated {ctx.peerUsername} for this session.</p>)

  return (
    <>
      <style>{CSS}</style>
      <EvaluationForm item={ctx} onClose={onClose} onDone={onDone} cancelLabel={cancelLabel} />
    </>
  )
}
