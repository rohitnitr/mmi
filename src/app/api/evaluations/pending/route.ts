import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUserId, getDeclaredSkills } from '@/lib/evaluations'

type SessionRow = { id: string; user1_id: string; user2_id: string; start_time: string; end_time: string | null }
type UserRow = { id: string; username: string }

// Finished sessions you have not evaluated yet.
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('sessions')
    .select('id,user1_id,user2_id,start_time,end_time')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .neq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(30)
  if (error) {
    console.error('[evaluations/pending] read failed', error.message)
    return NextResponse.json({ error: 'Could not load sessions.' }, { status: 500 })
  }
  const sessions = (data ?? []) as SessionRow[]
  if (sessions.length === 0) return NextResponse.json({ pending: [] })

  const { data: doneData } = await db
    .from('session_evaluations')
    .select('session_id')
    .eq('evaluator_id', userId)
    .in('session_id', sessions.map((s: SessionRow) => s.id))
  const doneIds = new Set(((doneData ?? []) as { session_id: string }[]).map(d => d.session_id))

  const open = sessions.filter((s: SessionRow) => !doneIds.has(s.id)).slice(0, 10)
  if (open.length === 0) return NextResponse.json({ pending: [] })

  const peerOf = (s: SessionRow): string => (s.user1_id === userId ? s.user2_id : s.user1_id)
  const peerIds: string[] = Array.from(new Set<string>(open.map(peerOf)))
  const { data: peerData } = await db.from('users').select('id,username').in('id', peerIds)
  const nameById = new Map<string, string>(((peerData ?? []) as UserRow[]).map(p => [p.id, p.username]))
  const skillsByPeer = new Map<string, string[]>()
  await Promise.all(peerIds.map(async (id: string) => { skillsByPeer.set(id, await getDeclaredSkills(id)) }))

  return NextResponse.json({
    pending: open.map((s: SessionRow) => ({
      sessionId: s.id,
      peerId: peerOf(s),
      peerUsername: nameById.get(peerOf(s)) ?? 'your peer',
      startedAt: s.start_time,
      endedAt: s.end_time,
      skills: skillsByPeer.get(peerOf(s)) ?? [],
    })),
  })
}
