import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, note } = await req.json()
    if (!senderId || !receiverId)
      return NextResponse.json({ error: 'senderId and receiverId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    // Verify sender exists
    const { data: senderData } = await db.from('users').select('id').eq('id', senderId).single()
    if (!senderData) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

    // Check no active (pending) invite already exists between these two users
    const { data: existing } = await db
      .from('invites').select('id')
      .eq('sender_id', senderId).eq('receiver_id', receiverId).eq('status', 'pending').maybeSingle()
    if (existing) return NextResponse.json({ error: 'Invite already pending' }, { status: 409 })

    // Invite expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: invite, error: inviteError } = await db
      .from('invites')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending',
        expires_at: expiresAt,
        note: note || '',
      })
      .select()
      .single()

    if (inviteError) {
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    return NextResponse.json({ invite })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
