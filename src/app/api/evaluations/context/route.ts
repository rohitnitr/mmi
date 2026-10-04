import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUserId, getDeclaredSkills } from '@/lib/evaluations'

type SessionRow = { id: string; user1_id: string; user2_id: string; start_time: string; end_time: string | null }

// Everything the evaluation form needs for one session you took part in.
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('sessionId') || ''
  if (!sessionId) return NextResponse.json({ error: 'Missing session.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('sessions')
    .select('id,user1_id,user2_id,start_time,end_time')
    .eq('id', sessionId)
    .maybeSingle()
  const session = data as SessionRow | null
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
  if (session.user1_id !== userId && session.user2_id !== userId) {
    return NextResponse.json({ error: 'You were not part of this session.' }, { status: 403 })
  }
  const peerId = session.user1_id === userId ? session.user2_id : session.user1_id

  const [peerRes, doneRes, skills] = await Promise.all([
    db.from('users').select('username').eq('id', peerId).maybeSingle(),
    db.from('session_evaluations').select('id').eq('session_id', sessionId).eq('evaluator_id', userId).maybeSingle(),
    getDeclaredSkills(peerId),
  ])
  const peer = peerRes.data as { username: string } | null

  return NextResponse.json({
    sessionId,
    peerId,
    peerUsername: peer?.username ?? 'your peer',
    startedAt: session.start_time,
    endedAt: session.end_time,
    skills,
    alreadyEvaluated: !!doneRes.data,
  })
}
