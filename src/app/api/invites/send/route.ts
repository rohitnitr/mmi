import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface UserRow {
  coffee_balance: number
  username: string
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId } = await req.json()
    if (!senderId || !receiverId)
      return NextResponse.json({ error: 'senderId and receiverId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    const { data: senderData } = await db.from('users').select('coffee_balance, username').eq('id', senderId).single()
    if (!senderData) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

    const sender = senderData as UserRow
    if (sender.coffee_balance < 1) return NextResponse.json({ error: 'Insufficient coffee balance' }, { status: 402 })

    const { data: existingData } = await db
      .from('invites')
      .select('id')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')
      .single()
    if (existingData) return NextResponse.json({ error: 'Invite already pending' }, { status: 409 })

    await db.from('users').update({ coffee_balance: sender.coffee_balance - 1 }).eq('id', senderId)
    await db.from('transactions').insert({ user_id: senderId, type: 'debit', amount: 1, reason: 'invite' })

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { data: invite, error: inviteError } = await db
      .from('invites')
      .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending', expires_at: expiresAt })
      .select()
      .single()

    if (inviteError) {
      await db.from('users').update({ coffee_balance: sender.coffee_balance }).eq('id', senderId)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    return NextResponse.json({ invite })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
