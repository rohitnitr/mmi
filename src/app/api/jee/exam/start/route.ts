import { NextResponse } from 'next/server'
import { adminDb, currentUser, getAttempt, getTest, paidTiers } from '@/lib/jee/exam-server'
import { UUID_RE } from '@/lib/jee/exam-shared'

export const dynamic = 'force-dynamic'

// Starts (or resumes) the one attempt a purchase allows. The clock is set here, on the server.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { testId?: unknown }
  const testId = typeof body.testId === 'string' ? body.testId : ''
  if (!UUID_RE.test(testId)) return NextResponse.json({ error: 'Bad test.' }, { status: 400 })

  const db = adminDb()
  const test = await getTest(db, testId)
  if (!test || test.status !== 'live') return NextResponse.json({ error: 'This mock is not open yet.' }, { status: 403 })

  const tiers = await paidTiers(db, user.id, testId)
  if (!tiers.mock) return NextResponse.json({ error: 'Buy this mock first.' }, { status: 402 })

  const { count } = await db.from('jee_questions').select('id', { count: 'exact', head: true }).eq('test_id', testId)
  if (!count) return NextResponse.json({ error: 'This mock has no questions yet.' }, { status: 409 })

  let attempt = await getAttempt(db, user.id, testId)
  if (!attempt) {
    const deadline = new Date(Date.now() + test.duration_minutes * 60_000).toISOString()
    const { error } = await db.from('jee_attempts').insert({ user_id: user.id, test_id: testId, deadline_at: deadline })
    if (error && error.code !== '23505') return NextResponse.json({ error: 'Could not start. Try again.' }, { status: 500 })
    attempt = await getAttempt(db, user.id, testId) // also covers a double-click race (unique violation)
  }
  if (!attempt) return NextResponse.json({ error: 'Could not start. Try again.' }, { status: 500 })
  return NextResponse.json({ attemptId: attempt.id, status: attempt.status })
}
