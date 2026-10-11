import { NextResponse } from 'next/server'
import { adminDb, currentUser, deadlinePassed, finalizeAttempt, getAttemptById } from '@/lib/jee/exam-server'
import { cleanResponse, deriveState, PSTATES, UUID_RE, type PState, type QType } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

type Item = { questionId?: unknown; response?: unknown; state?: unknown; timeSpentMs?: unknown; bookmarked?: unknown }

// Autosave. Accepts a small batch so the browser can catch up after a dropped connection.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'signin' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { attemptId?: unknown; items?: unknown }
  const attemptId = typeof body.attemptId === 'string' ? body.attemptId : ''
  if (!UUID_RE.test(attemptId) || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  const db = adminDb()
  const attempt = await getAttemptById(db, attemptId)
  if (!attempt || attempt.user_id !== user.id) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (attempt.status !== 'in_progress') return NextResponse.json({ expired: true }, { status: 409 })
  if (deadlinePassed(attempt, 10_000)) {
    await finalizeAttempt(db, attempt)
    return NextResponse.json({ expired: true }, { status: 409 })
  }

  const { data: qs } = await db.from('jee_questions').select('id,qtype').eq('test_id', attempt.test_id)
  const types = new Map(((qs ?? []) as { id: string; qtype: QType }[]).map((q) => [q.id, q.qtype]))
  const maxMs = (new Date(attempt.deadline_at).getTime() - new Date(attempt.started_at).getTime()) + 60_000

  const rows = []
  for (const raw of body.items as Item[]) {
    const qid = typeof raw.questionId === 'string' ? raw.questionId : ''
    const qtype = types.get(qid)
    if (!qtype) return NextResponse.json({ error: 'bad question' }, { status: 400 })
    const response = cleanResponse(qtype, raw.response)
    if (response === undefined) return NextResponse.json({ error: 'bad answer' }, { status: 400 })
    const state = raw.state as PState
    if (!PSTATES.includes(state)) return NextResponse.json({ error: 'bad state' }, { status: 400 })
    // Never trust the client to say "answered" without an answer, or the reverse.
    const marked = state === 'marked' || state === 'answered_marked'
    const safeState: PState = state === 'not_visited' ? 'not_answered' : deriveState(response !== null, marked)
    const ms = typeof raw.timeSpentMs === 'number' && Number.isFinite(raw.timeSpentMs) ? Math.min(Math.max(0, Math.round(raw.timeSpentMs)), maxMs) : 0
    rows.push({
      attempt_id: attemptId,
      question_id: qid,
      response,
      state: safeState,
      time_spent_ms: ms,
      bookmarked: raw.bookmarked === true,
      updated_at: new Date().toISOString(),
    })
  }

  const { error } = await db.from('jee_answers').upsert(rows, { onConflict: 'attempt_id,question_id' })
  if (error) return NextResponse.json({ error: 'save failed' }, { status: 500 })
  return NextResponse.json({ ok: true, serverTime: Date.now() })
}
