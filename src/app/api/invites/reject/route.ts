import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface InviteRow {
  id: string
  sender_id: string
  receiver_id: string
  status: string
}

interface UserRow {
  coffee_balance: number
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

    const { data: senderData } = await db
      .from('users')
      .select('coffee_balance')
      .eq('id', invite.sender_id)
      .single()

    if (senderData) {
      const sender = senderData as UserRow
      await db.from('users').update({ coffee_balance: sender.coffee_balance + 1 }).eq('id', invite.sender_id)
      await db.from('transactions').insert({ user_id: invite.sender_id, type: 'credit', amount: 1, reason: 'refund' })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
