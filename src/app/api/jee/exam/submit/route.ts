import { NextResponse } from 'next/server'
import { adminDb, currentUser, finalizeAttempt, getAttemptById } from '@/lib/jee/exam-server'
import { UUID_RE } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

// Submit (button, or the clock hitting zero). Scoring happens here, on the server, against keys the browser never sees.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'signin' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { attemptId?: unknown }
  const attemptId = typeof body.attemptId === 'string' ? body.attemptId : ''
  if (!UUID_RE.test(attemptId)) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  const db = adminDb()
  const attempt = await getAttemptById(db, attemptId)
  if (!attempt || attempt.user_id !== user.id) return NextResponse.json({ error: 'not found' }, { status: 404 })

  try {
    await finalizeAttempt(db, attempt)
  } catch {
    return NextResponse.json({ error: 'Could not score right now. Your answers are safe; try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, testId: attempt.test_id })
}
