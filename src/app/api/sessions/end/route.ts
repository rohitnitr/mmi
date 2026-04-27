import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface SessionRow {
  id: string
  user1_id: string
  user2_id: string
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json()
    if (!sessionId || !userId)
      return NextResponse.json({ error: 'sessionId and userId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    const { data } = await db
      .from('sessions')
      .select('id, user1_id, user2_id')
      .eq('id', sessionId)
      .single()

    if (!data) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const session = data as SessionRow
    if (session.user1_id !== userId && session.user2_id !== userId)
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    await db
      .from('sessions')
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', sessionId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
