import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface InviteRow {
  id: string
  sender_id: string
  receiver_id: string
  status: string
}

export async function POST(req: NextRequest) {
  try {
    const { inviteId, userId } = await req.json()
    if (!inviteId || !userId)
      return NextResponse.json({ error: 'inviteId and userId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    const { data } = await db
      .from('invites')
      .select('id, sender_id, receiver_id, status')
      .eq('id', inviteId)
      .single()

    if (!data) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const invite = data as InviteRow

    if (invite.receiver_id !== userId)
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    if (invite.status !== 'pending')
      return NextResponse.json({ error: 'Invite is no longer pending' }, { status: 409 })

    await db.from('invites').update({ status: 'rejected' }).eq('id', inviteId)

    // No coffee refund needed — invites are free for all verified users

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
